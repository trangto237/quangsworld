/**
 * Tables copied to the family cloud, with their primary-key columns.
 * Every table in the schema must be listed here or in LOCAL_ONLY_TABLES (checked by sync.test.ts).
 * A future migration that adds a synced table must also create its change triggers (`changeTriggers`).
 */
export const SYNC_TABLES: Record<string, string[]> = {
  family: ['id'],
  students: ['id'],
  concept_states: ['student_id', 'concept_id'],
  attempts: ['id'],
  sessions: ['id'],
  placement_results: ['id'],
  goals: ['id'],
  wallets: ['student_id'],
  unlocks: ['student_id', 'item_id'],
  materials: ['id'],
  custom_items: ['id'],
  kv: ['key'],
  mistakes: ['id'],
  exam_results: ['id'],
};

/** Sync bookkeeping; never uploaded. */
export const LOCAL_ONLY_TABLES = ['_changes', '_sync'];

/**
 * SQLite triggers that record every insert/update/delete in `_changes`, but only while
 * `_sync.track = '1'` (linked to a cloud account and not applying rows pulled from it).
 */
export function changeTriggers(table: string, pk = SYNC_TABLES[table]): string {
  const key = (row: 'NEW' | 'OLD') => `json_array(${pk.map((c) => `${row}.${c}`).join(', ')})`;
  const when = `WHEN (SELECT value FROM _sync WHERE key = 'track') = '1'`;
  // Delete + insert rather than INSERT OR REPLACE: SQLite lets an outer upsert (INSERT … ON CONFLICT
  // DO UPDATE) override a trigger's OR REPLACE, which made every repeated save fail.
  const log = (row: 'NEW' | 'OLD') =>
    `DELETE FROM _changes WHERE tbl = '${table}' AND pk = ${key(row)}; INSERT INTO _changes (tbl, pk) VALUES ('${table}', ${key(row)});`;
  return `
  DROP TRIGGER IF EXISTS _sync_${table}_ins;
  DROP TRIGGER IF EXISTS _sync_${table}_upd;
  DROP TRIGGER IF EXISTS _sync_${table}_del;
  CREATE TRIGGER _sync_${table}_ins AFTER INSERT ON ${table} ${when} BEGIN ${log('NEW')} END;
  CREATE TRIGGER _sync_${table}_upd AFTER UPDATE ON ${table} ${when} BEGIN ${log('OLD')} ${log('NEW')} END;
  CREATE TRIGGER _sync_${table}_del AFTER DELETE ON ${table} ${when} BEGIN ${log('OLD')} END;`;
}
