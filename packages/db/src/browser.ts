import initSqlJs from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import { AtlasDb } from './database';
import { Repo } from './repo';
import { IdbStore } from './store';

/** Opens the family database in the browser (IndexedDB + encrypted SQLite). */
export async function openBrowserRepo(): Promise<Repo> {
  const SQL = await initSqlJs({ locateFile: () => wasmUrl });
  const db = await AtlasDb.open(SQL, new IdbStore());
  const repo = new Repo(db);
  repo.loadCustomContent();
  // Flush any pending state when the tab is hidden (mobile browsers may kill it).
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void db.refresh();
  });
  return repo;
}
