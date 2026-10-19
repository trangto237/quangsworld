import { describe, expect, it } from 'vitest';
import initSqlJs from 'sql.js';
import { AtlasDb } from './database';
import { Repo } from './repo';
import { MemoryStore } from './store';
import { MIGRATIONS, migrate } from './migrations';
import { SyncEngine, type Remote, type RemoteRow } from './sync';
import { LOCAL_ONLY_TABLES, SYNC_TABLES } from './sync-tables';

const SQL = await initSqlJs();

/** In-memory stand-in for the Supabase `atlas_rows` table. */
class FakeRemote implements Remote {
  rows = new Map<string, RemoteRow & { seq: number }>();
  seq = 0;
  pushes = 0;
  constructor(private account = 'family-1') {}
  accountId() {
    return this.account;
  }
  async push(rows: RemoteRow[]) {
    this.pushes++;
    for (const r of rows) this.rows.set(`${r.tbl}|${r.pk}`, { ...structuredClone(r), seq: ++this.seq });
  }
  async pull(since: number, limit: number) {
    return [...this.rows.values()]
      .filter((r) => r.seq > since)
      .sort((a, b) => a.seq - b.seq)
      .slice(0, limit)
      .map((r) => structuredClone(r));
  }
  async hasData(tbl?: string) {
    return [...this.rows.values()].some((r) => !r.deleted && (!tbl || r.tbl === tbl));
  }
}

async function device(remote: Remote, opts?: { batch?: number }) {
  const db = await AtlasDb.open(SQL, new MemoryStore(), `sync-${Math.random()}`);
  const repo = new Repo(db);
  return { db, repo, sync: new SyncEngine(db, remote, opts) };
}

const kid = { name: 'Quang', age: 14, grade: 9, avatar: 'fox', pin: '1234' };

describe('SyncEngine', () => {
  it('every table is either synced or explicitly local-only', async () => {
    const { db } = await device(new FakeRemote());
    const tables = db.raw.exec("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")[0].values.map((v) => String(v[0]));
    for (const t of tables) expect(t in SYNC_TABLES || LOCAL_ONLY_TABLES.includes(t), t).toBe(true);
  });

  it('saves the same row again and again while linked (upserts used to fail on _changes)', async () => {
    const remote = new FakeRemote();
    const { repo, sync } = await device(remote);
    await repo.createFamily('Mum', 'pw1234');
    const id = await repo.addStudent(kid);
    await sync.link();
    for (let i = 0; i < 5; i++) await repo.setKv(`placement:${id}`, { n: i });
    expect(sync.pendingCount()).toBe(1);
    await sync.syncOnce();
    expect(sync.pendingCount()).toBe(0);
    expect(remote.rows.get(`kv|${JSON.stringify([`placement:${id}`])}`)?.data).toMatchObject({ key: `placement:${id}` });
  });

  it('upgrades an old change log without losing queued changes', () => {
    const raw = new SQL.Database();
    raw.exec('PRAGMA foreign_keys = ON');
    for (let v = 0; v < MIGRATIONS.length - 1; v++) raw.exec(MIGRATIONS[v]);
    raw.exec(`PRAGMA user_version = ${MIGRATIONS.length - 1}`);
    raw.exec(`INSERT INTO _changes (tbl, pk) VALUES ('kv', '["a"]')`);
    migrate(raw);
    expect(raw.exec('SELECT tbl, pk FROM _changes')[0].values).toEqual([['kv', '["a"]']]);
    raw.exec(`INSERT INTO _sync (key, value) VALUES ('track', '1')`);
    raw.exec(`INSERT INTO kv (key, value) VALUES ('a', '1') ON CONFLICT(key) DO UPDATE SET value = excluded.value`);
    raw.exec(`INSERT INTO kv (key, value) VALUES ('a', '2') ON CONFLICT(key) DO UPDATE SET value = excluded.value`);
    expect(raw.exec('SELECT COUNT(*) FROM _changes')[0].values[0][0]).toBe(1);
  });

  it('does not track changes before the device is linked', async () => {
    const { repo, sync } = await device(new FakeRemote());
    await repo.createFamily('Mum', 'pw1234');
    expect(sync.pendingCount()).toBe(0);
  });

  it('uploads from one device and downloads to a new one (parent can log in there)', async () => {
    const remote = new FakeRemote();
    const a = await device(remote);
    await a.repo.createFamily('Mum', 'pw1234');
    const id = await a.repo.addStudent(kid);
    expect(await a.sync.link()).toBe('linked');
    expect(a.sync.pendingCount()).toBe(0);
    expect(remote.rows.size).toBeGreaterThan(3);

    const b = await device(remote);
    expect(await b.sync.link()).toBe('linked');
    expect(await b.repo.verifyParent('pw1234')).toBe(true);
    expect(b.repo.getStudent(id)?.name).toBe('Quang');
    expect(await b.repo.verifyStudentPin(id, '1234')).toBe(true);
    // Applying downloaded rows must not queue them for upload again.
    expect(b.sync.pendingCount()).toBe(0);
  });

  it('signing out removes the data from this device only, and signing in brings it back', async () => {
    const remote = new FakeRemote();
    const a = await device(remote);
    await a.repo.createFamily('Mum', 'pw1234');
    const id = await a.repo.addStudent(kid);
    await a.sync.link();
    const rowsBefore = remote.rows.size;

    await a.sync.forgetLocal();
    expect(a.repo.getFamily()).toBeUndefined();
    expect(a.repo.listStudents()).toHaveLength(0);
    expect(a.sync.isLinked()).toBe(false);
    expect(a.sync.pendingCount()).toBe(0);
    // Nothing was deleted in the cloud.
    expect([...remote.rows.values()].filter((r) => !r.deleted)).toHaveLength(rowsBefore);

    expect(await a.sync.link()).toBe('linked');
    expect(a.repo.getStudent(id)?.name).toBe('Quang');
    expect(a.sync.pendingCount()).toBe(0);
  });

  it('syncs later changes and deletions both ways', async () => {
    const remote = new FakeRemote();
    const a = await device(remote);
    await a.repo.createFamily('Mum', 'pw1234');
    const id = await a.repo.addStudent(kid);
    await a.sync.link();
    const b = await device(remote);
    await b.sync.link();

    // Kid plays on A…
    await a.repo.setKv(`lang:${id}`, 'vi');
    await a.repo.completeExam(id, {
      result: { examId: 'hn10', startedAt: 1, finishedAt: 2, durationMs: 1, correct: 1, total: 2, score: 5, band: null, sections: [], setIds: [] },
      answers: [],
      states: [],
      reward: { coins: 3, gems: 0, xp: 10 },
    });
    expect(a.sync.pendingCount()).toBeGreaterThan(0);
    await a.sync.syncOnce();
    // …the parent's device sees it.
    await b.sync.syncOnce();
    expect(b.repo.getKv(`lang:${id}`)).toBe('vi');
    expect(b.repo.listExamResults(id)).toHaveLength(1);
    expect(b.repo.getWallet(id).coins).toBe(a.repo.getWallet(id).coins);

    // Parent edits on B, deletion included.
    await b.repo.setGoal(id, 'dailyMinutes', '40');
    await b.repo.setKv(`lang:${id}`, null);
    await b.sync.syncOnce();
    await a.sync.syncOnce();
    expect(a.repo.getKv(`lang:${id}`)).toBeUndefined();
    expect(a.repo.listGoals(id).find((g) => g.kind === 'dailyMinutes')?.value).toBe('40');

    await b.repo.removeStudent(id);
    await b.sync.syncOnce();
    await a.sync.syncOnce();
    expect(a.repo.getStudent(id)).toBeUndefined();
    expect(a.sync.pendingCount()).toBe(0);
    expect(b.sync.pendingCount()).toBe(0);
  });

  it('keeps an unsent local change over a download, then converges', async () => {
    const remote = new FakeRemote();
    const a = await device(remote);
    await a.repo.createFamily('Mum', 'pw1234');
    await a.sync.link();
    const b = await device(remote);
    await b.sync.link();

    await b.repo.setKv('x', 'from-b');
    await b.sync.syncOnce();
    await a.repo.setKv('x', 'from-a'); // made before A heard of B's change
    await a.sync.syncOnce(); // A uploads first, so its newer write wins
    expect(a.repo.getKv('x')).toBe('from-a');
    await b.sync.syncOnce();
    expect(b.repo.getKv('x')).toBe('from-a');
  });

  it('asks before linking when both sides have data; "cloud" replaces, "merge" keeps both', async () => {
    const remote = new FakeRemote();
    const a = await device(remote);
    await a.repo.createFamily('Mum', 'cloudpw');
    const cloudKid = await a.repo.addStudent(kid);
    await a.sync.link();

    const b = await device(remote);
    await b.repo.createFamily('Dad', 'localpw');
    const localKid = await b.repo.addStudent({ ...kid, name: 'Local' });
    expect(await b.sync.link()).toBe('needs-choice');
    expect(b.sync.isLinked()).toBe(false);

    const c = await device(remote);
    await c.repo.createFamily('Dad', 'localpw');
    await c.repo.addStudent({ ...kid, name: 'Gone' });
    await c.sync.link('cloud');
    expect(c.repo.listStudents().map((s) => s.name)).toEqual(['Quang']);
    expect(await c.repo.verifyParent('cloudpw')).toBe(true);

    await b.sync.link('merge');
    expect(b.repo.listStudents().map((s) => s.id).sort()).toEqual([cloudKid, localKid].sort());
    // One parent account: the cloud's.
    expect(await b.repo.verifyParent('cloudpw')).toBe(true);
    await a.sync.syncOnce();
    expect(a.repo.getStudent(localKid)?.name).toBe('Local');
    expect(a.repo.getFamily()?.parentName).toBe('Mum');
  });

  it('pages through large uploads and downloads', async () => {
    const remote = new FakeRemote();
    const a = await device(remote, { batch: 7 });
    await a.repo.createFamily('Mum', 'pw1234');
    await a.sync.link();
    for (let i = 0; i < 30; i++) await a.repo.setKv(`k${i}`, i);
    await a.sync.syncOnce();
    expect(remote.pushes).toBeGreaterThan(4);
    const b = await device(remote, { batch: 7 });
    await b.sync.link();
    expect(b.repo.getKv('k29')).toBe(29);
  });

  it('ignores columns from a newer app version', async () => {
    const remote = new FakeRemote();
    const a = await device(remote);
    await a.repo.createFamily('Mum', 'pw1234');
    await a.sync.link();
    await remote.push([{ tbl: 'kv', pk: '["future"]', data: { key: 'future', value: '"ok"', brand_new_column: 1 }, deleted: false }]);
    await remote.push([{ tbl: 'not_a_table', pk: '["x"]', data: { id: 'x' }, deleted: false }]);
    await a.sync.syncOnce();
    expect(a.repo.getKv('future')).toBe('ok');
  });

  it('a device signed into another account must link again', async () => {
    const a = await device(new FakeRemote('family-1'));
    await a.repo.createFamily('Mum', 'pw1234');
    await a.sync.link();
    const other = new SyncEngine(a.db, new FakeRemote('family-2'));
    expect(other.isLinked()).toBe(false);
    await expect(other.syncOnce()).rejects.toThrow(/not linked/);
  });

  it('migration 4 upgrades an existing database', () => {
    const raw = new SQL.Database();
    for (const m of MIGRATIONS.slice(0, 3)) raw.exec(m);
    raw.exec('PRAGMA user_version = 3');
    raw.exec("INSERT INTO kv (key, value) VALUES ('a', '1')");
    migrate(raw);
    expect(raw.exec('PRAGMA user_version')[0].values[0][0]).toBe(MIGRATIONS.length);
    const triggers = raw.exec("SELECT COUNT(*) FROM sqlite_master WHERE type = 'trigger'")[0].values[0][0];
    expect(triggers).toBe(Object.keys(SYNC_TABLES).length * 3);
    expect(raw.exec('SELECT value FROM kv')[0].values[0][0]).toBe('1');
  });
});
