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

export class IdbStore implements BlobStore {
  private dbp: Promise<IDBDatabase>;
  constructor(name = 'learning-os', private storeName = 'blobs') {
    this.dbp = new Promise((resolve, reject) => {
      const req = indexedDB.open(name, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(storeName);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  private async tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
    const db = await this.dbp;
    return new Promise<T>((resolve, reject) => {
      const t = db.transaction(this.storeName, mode);
      const req = fn(t.objectStore(this.storeName));
      t.oncomplete = () => resolve(req.result as T);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
    });
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
