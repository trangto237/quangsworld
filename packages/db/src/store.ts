/** Key/value blob persistence. IndexedDB in the browser, memory in tests. */
export interface BlobStore {
  get<T = unknown>(key: string): Promise<T | undefined>;
  put(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<void>;
}

export class MemoryStore implements BlobStore {
  private m = new Map<string, unknown>();
  async get<T>(key: string) {
    return this.m.get(key) as T | undefined;
  }
  async put(key: string, value: unknown) {
    this.m.set(key, value);
  }
  async delete(key: string) {
    this.m.delete(key);
  }
}

/** How long one IndexedDB request may take before we reopen the connection and retry. */
const IDB_TIMEOUT_MS = 6000;

export class IdbStore implements BlobStore {
  private dbp: Promise<IDBDatabase>;
  constructor(
    private name = 'learning-os',
    private storeName = 'blobs',
  ) {
    this.dbp = this.open();
  }

  private open(): Promise<IDBDatabase> {
    const p = new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open(this.name, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(this.storeName);
      req.onsuccess = () => {
        const db = req.result;
        // iOS closes connections when the app is backgrounded: reopen on next use.
        db.onclose = () => {
          if (this.dbp === p) this.dbp = this.open();
        };
        db.onversionchange = () => db.close();
        resolve(db);
      };
      req.onerror = () => reject(req.error);
    });
    return p;
  }

  private once<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Storage timed out')), IDB_TIMEOUT_MS);
      const done = (f: () => void) => () => (clearTimeout(timer), f());
      this.dbp.then((db) => {
        try {
          const t = db.transaction(this.storeName, mode);
          const req = fn(t.objectStore(this.storeName));
          t.oncomplete = done(() => resolve(req.result as T));
          t.onerror = done(() => reject(t.error));
          t.onabort = done(() => reject(t.error ?? new Error('Storage aborted')));
        } catch (e) {
          done(() => reject(e))();
        }
      }, done(() => reject(new Error('Could not open storage'))));
    });
  }

  /** One retry on a fresh connection: covers stale or stalled connections after the app resumes. */
  private async tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
    try {
      return await this.once<T>(mode, fn);
    } catch {
      const stale = this.dbp;
      this.dbp = this.open();
      void stale.then((db) => db.close()).catch(() => undefined);
      return this.once<T>(mode, fn);
    }
  }

  get<T>(key: string) {
    return this.tx<T | undefined>('readonly', (s) => s.get(key));
  }
  async put(key: string, value: unknown) {
    await this.tx('readwrite', (s) => s.put(value, key));
  }
  async delete(key: string) {
    await this.tx('readwrite', (s) => s.delete(key));
  }
}
