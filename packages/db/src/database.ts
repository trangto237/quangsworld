import type { Database, SqlJsStatic } from 'sql.js';
import { drizzle, type SQLJsDatabase } from 'drizzle-orm/sql-js';
import * as schema from './schema';
import { migrate } from './migrations';
import { generateDeviceKey, open as unseal, seal, type Sealed } from './crypto';
import type { BlobStore } from './store';

export type Orm = SQLJsDatabase<typeof schema>;
export type ChangeOrigin = 'local' | 'remote';

interface StoredDb extends Sealed {
  version: number;
}

const DB_KEY = 'db';
const DEVICE_KEY = 'deviceKey';
const LOCK = 'learning-os-db';

/** In-process fallback when the Web Locks API is unavailable (tests, old browsers). */
let chain: Promise<unknown> = Promise.resolve();
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const locks = (globalThis.navigator as Navigator | undefined)?.locks;
  if (locks) return locks.request(LOCK, fn) as Promise<T>;
  const run = chain.then(fn, fn);
  chain = run.catch(() => undefined);
  return run;
}

/**
 * Offline-first SQLite (sql.js) with Drizzle ORM.
 * - The whole database lives in memory and is autosaved, encrypted, to IndexedDB after every write.
 * - Writes are serialised across tabs with the Web Locks API; a version counter detects when
 *   another tab (e.g. the parent dashboard) wrote in between and reloads first.
 * - A BroadcastChannel tells other open apps to reload, so the parent dashboard updates in real time.
 */
export class AtlasDb {
  raw!: Database;
  orm!: Orm;
  private version = 0;
  private listeners = new Set<(origin: ChangeOrigin) => void>();
  private channel?: BroadcastChannel;

  private constructor(
    private sql: SqlJsStatic,
    private store: BlobStore,
    private key: CryptoKey,
  ) {}

  static async open(sql: SqlJsStatic, store: BlobStore, channelName = 'learning-os'): Promise<AtlasDb> {
    let key = await store.get<CryptoKey>(DEVICE_KEY);
    if (!key) {
      key = await generateDeviceKey();
      await store.put(DEVICE_KEY, key);
    }
    const db = new AtlasDb(sql, store, key);
    const stored = await store.get<StoredDb>(DB_KEY);
    if (stored) await db.load(stored);
    else db.attach(new sql.Database());
    migrate(db.raw);
    if (typeof BroadcastChannel !== 'undefined') {
      db.channel = new BroadcastChannel(channelName);
      db.channel.onmessage = (e: MessageEvent<{ version: number }>) => {
        if (e.data?.version !== db.version) void db.refresh();
      };
    }
    return db;
  }

  private attach(raw: Database) {
    this.raw?.close();
    this.raw = raw;
    this.raw.exec('PRAGMA foreign_keys = ON');
    this.orm = drizzle(raw, { schema });
  }

  private async load(stored: StoredDb) {
    const bytes = await unseal(this.key, stored);
    this.attach(new this.sql.Database(bytes));
    migrate(this.raw);
    this.version = stored.version;
  }

  /** Reload if another tab persisted a newer version. */
  refresh(): Promise<boolean> {
    return withLock(async () => {
      const stored = await this.store.get<StoredDb>(DB_KEY);
      if (!stored || stored.version === this.version) return false;
      await this.load(stored);
      this.emit('remote');
      return true;
    });
  }

  read<T>(fn: (orm: Orm) => T): T {
    return fn(this.orm);
  }

  /** Runs `fn` in a transaction, then autosaves (encrypted) and notifies other tabs. */
  write<T>(fn: (orm: Orm) => T): Promise<T> {
    return withLock(async () => {
      const stored = await this.store.get<StoredDb>(DB_KEY);
      if (stored && stored.version !== this.version) await this.load(stored);
      this.raw.exec('BEGIN');
      let result: T;
      try {
        result = fn(this.orm);
        this.raw.exec('COMMIT');
      } catch (e) {
        this.raw.exec('ROLLBACK');
        throw e;
      }
      const sealed = await seal(this.key, this.raw.export());
      const version = this.version + 1;
      await this.store.put(DB_KEY, { ...sealed, version } satisfies StoredDb);
      this.version = version;
      this.channel?.postMessage({ version });
      this.emit('local');
      return result;
    });
  }

  subscribe(cb: (origin: ChangeOrigin) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private emit(origin: ChangeOrigin) {
    for (const cb of this.listeners) cb(origin);
  }

  /** Encrypted storage for uploaded files (kept outside SQLite to keep autosaves small). */
  async putFile(id: string, bytes: Uint8Array) {
    await this.store.put(`file:${id}`, await seal(this.key, bytes));
  }

  async getFile(id: string): Promise<Uint8Array | undefined> {
    const s = await this.store.get<Sealed>(`file:${id}`);
    return s ? unseal(this.key, s) : undefined;
  }

  async deleteFile(id: string) {
    await this.store.delete(`file:${id}`);
  }

  /** Raw encrypted snapshot, for tests and diagnostics. */
  async storedSnapshot() {
    return this.store.get<StoredDb>(DB_KEY);
  }

  close() {
    this.channel?.close();
    this.raw.close();
  }
}
