import type { Database, SqlValue } from 'sql.js';
import type { AtlasDb } from './database';
import { SYNC_TABLES } from './sync-tables';

/** One row as stored in the cloud (`atlas_rows`). `data` holds the SQLite row with its column names. */
export interface RemoteRow {
  tbl: string;
  /** JSON array of the primary-key values, e.g. `["stu_1","en.vocab"]`. */
  pk: string;
  data: Record<string, unknown> | null;
  deleted: boolean;
  /** Server-assigned, increases on every insert/update. Set on pulled rows. */
  seq?: number;
}

/** The cloud side. Implemented by `SupabaseRemote`; tests use an in-memory fake. */
export interface Remote {
  /** The signed-in family account. A device linked to another account must link again. */
  accountId(): string;
  /** Upserts rows (last write wins). */
  push(rows: RemoteRow[]): Promise<void>;
  /** Rows with seq > sinceSeq, oldest first, at most `limit`. */
  pull(sinceSeq: number, limit: number): Promise<RemoteRow[]>;
  /** Whether the cloud holds any (non-deleted) rows, optionally of one table. */
  hasData(tbl?: string): Promise<boolean>;
}

/**
 * How to link a device to the family cloud:
 * - 'auto': upload if the cloud is empty, download if this device is empty; otherwise ask.
 * - 'cloud': replace this device's data with the cloud's.
 * - 'merge': keep both (the cloud's parent account wins), then upload and download.
 */
export type LinkMode = 'auto' | 'cloud' | 'merge';
export type LinkResult = 'linked' | 'needs-choice';

export interface SyncReport {
  pushed: number;
  pulled: number;
}

type Row = Record<string, SqlValue>;

function all(raw: Database, sql: string, params: SqlValue[] = []): Row[] {
  const st = raw.prepare(sql);
  try {
    st.bind(params);
    const out: Row[] = [];
    while (st.step()) out.push(st.getAsObject() as Row);
    return out;
  } finally {
    st.free();
  }
}

const state = (raw: Database, key: string) => (all(raw, 'SELECT value FROM _sync WHERE key = ?', [key])[0]?.value as string | null | undefined) ?? null;
const setState = (raw: Database, key: string, value: string | null) =>
  value == null ? raw.run('DELETE FROM _sync WHERE key = ?', [key]) : raw.run('INSERT OR REPLACE INTO _sync (key, value) VALUES (?, ?)', [key, value]);

const where = (tbl: string) => SYNC_TABLES[tbl].map((c) => `${c} = ?`).join(' AND ');
const columnsOf = (raw: Database, tbl: string) => all(raw, `PRAGMA table_info(${tbl})`).map((r) => String(r.name));

/** Stable JSON for comparing a local row with a pulled one. */
const canon = (row: Record<string, unknown>, cols: string[]) => JSON.stringify(cols.map((c) => row[c] ?? null));

/**
 * Two-way sync between the local SQLite database and the family cloud.
 *
 * Local changes are recorded by triggers in `_changes` (table + primary key) and uploaded as whole
 * rows; the cloud gives every upload an increasing `seq`, and each device downloads what changed
 * since its last `seq`. Conflicts resolve per row, last upload wins; a row with an unsent local
 * change is not overwritten by a download (the local change is uploaded next).
 */
export class SyncEngine {
  private running: Promise<SyncReport> | null = null;

  constructor(
    private db: AtlasDb,
    private remote: Remote,
    private opts: { batch?: number; overlap?: number } = {},
  ) {}

  private get batch() {
    return this.opts.batch ?? 500;
  }

  /** Re-download a few rows before the cursor: uploads that committed out of order are not missed. */
  private get overlap() {
    return this.opts.overlap ?? 50;
  }

  /** Account this device is linked to, if any. */
  linkedAccount(): string | null {
    return state(this.db.raw, 'account');
  }

  isLinked(): boolean {
    return this.linkedAccount() === this.remote.accountId();
  }

  pendingCount(): number {
    return Number(all(this.db.raw, 'SELECT COUNT(*) AS n FROM _changes')[0].n);
  }

  lastSyncedAt(): number | null {
    const v = state(this.db.raw, 'last_synced');
    return v ? Number(v) : null;
  }

  localHasData(): boolean {
    return Object.keys(SYNC_TABLES).some((t) => all(this.db.raw, `SELECT 1 FROM ${t} LIMIT 1`).length > 0);
  }

  async link(mode: LinkMode = 'auto'): Promise<LinkResult> {
    if (mode === 'auto' && this.isLinked()) return 'linked';
    const remoteHas = await this.remote.hasData();
    const localHas = this.localHasData();
    const account = this.remote.accountId();
    if (mode === 'auto') {
      if (remoteHas && localHas) return 'needs-choice';
      mode = remoteHas ? 'cloud' : 'merge';
    }
    const cloudFamily = mode === 'merge' && remoteHas && (await this.remote.hasData('family'));
    await this.db.write(() => {
      const raw = this.db.raw;
      setState(raw, 'track', '0');
      raw.run('DELETE FROM _changes');
      if (mode === 'cloud') for (const t of Object.keys(SYNC_TABLES)) raw.run(`DELETE FROM ${t}`);
      else {
        // One parent account per family: the cloud's wins.
        if (cloudFamily) raw.run('DELETE FROM family');
        for (const [t, pk] of Object.entries(SYNC_TABLES))
          raw.run(`INSERT OR REPLACE INTO _changes (tbl, pk) SELECT '${t}', json_array(${pk.join(', ')}) FROM ${t}`);
      }
      setState(raw, 'cursor', '0');
      setState(raw, 'account', account);
      setState(raw, 'track', '1');
    }, mode === 'cloud' ? 'remote' : 'sync');
    await this.syncOnce();
    return 'linked';
  }

  /** Stops syncing on this device. Local data stays. */
  async unlink() {
    await this.db.write(() => {
      const raw = this.db.raw;
      setState(raw, 'track', '0');
      setState(raw, 'account', null);
      setState(raw, 'cursor', null);
      raw.run('DELETE FROM _changes');
    }, 'sync');
  }

  /** Uploads local changes, then downloads the cloud's. Concurrent calls share one run. */
  syncOnce(): Promise<SyncReport> {
    if (!this.running)
      this.running = this.run().finally(() => {
        this.running = null;
      });
    return this.running;
  }

  private async run(): Promise<SyncReport> {
    await this.db.refresh();
    if (!this.isLinked()) throw new Error('This device is not linked to the signed-in family account.');
    const pushed = await this.push();
    const pulled = await this.pull();
    await this.db.write(() => setState(this.db.raw, 'last_synced', String(Date.now())), 'sync');
    return { pushed, pulled };
  }

  private async push(): Promise<number> {
    let total = 0;
    for (let round = 0; round < 1000; round++) {
      const raw = this.db.raw;
      const changes = all(raw, 'SELECT rowid AS rid, tbl, pk FROM _changes ORDER BY rowid LIMIT ?', [this.batch]);
      if (!changes.length) break;
      const rows: RemoteRow[] = changes
        .filter((c) => SYNC_TABLES[String(c.tbl)])
        .map((c) => {
          const tbl = String(c.tbl);
          const pk = String(c.pk);
          const row = all(raw, `SELECT * FROM ${tbl} WHERE ${where(tbl)}`, JSON.parse(pk))[0];
          return row ? { tbl, pk, data: row, deleted: false } : { tbl, pk, data: null, deleted: true };
        });
      if (rows.length) await this.remote.push(rows);
      // Only clear what was sent: a row changed again meanwhile has a new rowid and stays queued.
      const ids = changes.map((c) => Number(c.rid));
      await this.db.write(() => this.db.raw.run(`DELETE FROM _changes WHERE rowid IN (${ids.map(() => '?').join(',')})`, ids), 'sync');
      total += rows.length;
    }
    return total;
  }

  private async pull(): Promise<number> {
    let applied = 0;
    let since = Math.max(0, Number(state(this.db.raw, 'cursor') ?? 0) - this.overlap);
    for (let round = 0; round < 1000; round++) {
      const rows = await this.remote.pull(since, this.batch);
      if (!rows.length) break;
      const maxSeq = Math.max(...rows.map((r) => r.seq ?? 0));
      let changed = 0;
      // Write only when something differs, so an idle sync doesn't re-save the database.
      // Data changes are announced as 'remote' (reloads imported content, pulses the Live badge).
      const dataChanged = rows.some((r) => this.differs(r));
      if (dataChanged || maxSeq > Number(state(this.db.raw, 'cursor') ?? 0))
        changed = await this.db.write(() => {
          const raw = this.db.raw;
          let n = 0;
          setState(raw, 'track', '0');
          try {
            for (const r of rows) if (this.apply(r)) n++;
          } finally {
            setState(raw, 'track', '1');
          }
          const cursor = Math.max(Number(state(raw, 'cursor') ?? 0), maxSeq);
          setState(raw, 'cursor', String(cursor));
          return n;
        }, dataChanged ? 'remote' : 'sync');
      applied += changed;
      since = maxSeq;
      if (rows.length < this.batch) break;
    }
    return applied;
  }

  /** Whether applying `r` would change the local database. */
  private differs(r: RemoteRow): boolean {
    if (!SYNC_TABLES[r.tbl]) return false;
    const raw = this.db.raw;
    if (all(raw, 'SELECT 1 FROM _changes WHERE tbl = ? AND pk = ?', [r.tbl, r.pk]).length) return false;
    const local = all(raw, `SELECT * FROM ${r.tbl} WHERE ${where(r.tbl)}`, JSON.parse(r.pk))[0];
    if (r.deleted || !r.data) return !!local;
    if (!local) return true;
    const cols = columnsOf(raw, r.tbl);
    return canon(local, cols) !== canon(r.data, cols);
  }

  private apply(r: RemoteRow): boolean {
    if (!this.differs(r)) return false;
    const raw = this.db.raw;
    if (r.deleted || !r.data) {
      raw.run(`DELETE FROM ${r.tbl} WHERE ${where(r.tbl)}`, JSON.parse(r.pk));
      return true;
    }
    const data = r.data;
    // Columns this app version knows; newer columns from a newer app are ignored.
    const cols = columnsOf(raw, r.tbl).filter((c) => c in data);
    try {
      raw.run(
        `INSERT OR REPLACE INTO ${r.tbl} (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`,
        cols.map((c) => (data[c] ?? null) as SqlValue),
      );
      return true;
    } catch (e) {
      // A row this version can't store (e.g. missing required column) is skipped, not fatal.
      console.warn('[sync] skipped row', r.tbl, r.pk, e);
      return false;
    }
  }
}
