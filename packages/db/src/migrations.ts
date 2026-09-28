import type { Database } from 'sql.js';

/**
 * Forward-only migrations, tracked with PRAGMA user_version.
 * Keep in sync with schema.ts (covered by db.test.ts).
 */
export const MIGRATIONS: string[] = [
  `
  CREATE TABLE family (id TEXT PRIMARY KEY, parent_name TEXT NOT NULL, password_hash TEXT NOT NULL, salt TEXT NOT NULL, created_at INTEGER NOT NULL);
  CREATE TABLE students (id TEXT PRIMARY KEY, name TEXT NOT NULL, age INTEGER NOT NULL, grade INTEGER NOT NULL, avatar TEXT NOT NULL,
    pin_hash TEXT, pin_salt TEXT, placement_done INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL);
  CREATE TABLE concept_states (student_id TEXT NOT NULL, concept_id TEXT NOT NULL, mastery REAL NOT NULL, confidence REAL NOT NULL,
    attempts INTEGER NOT NULL, correct INTEGER NOT NULL, streak INTEGER NOT NULL, ease REAL NOT NULL, interval_days REAL NOT NULL,
    next_review INTEGER NOT NULL, last_seen INTEGER NOT NULL, last_wrong_at INTEGER NOT NULL, PRIMARY KEY (student_id, concept_id));
  CREATE TABLE attempts (id TEXT PRIMARY KEY, student_id TEXT NOT NULL, question_id TEXT NOT NULL, concept_id TEXT NOT NULL,
    correct INTEGER NOT NULL, difficulty INTEGER NOT NULL, ms_spent INTEGER NOT NULL, context TEXT NOT NULL, created_at INTEGER NOT NULL);
  CREATE INDEX attempts_student_time ON attempts (student_id, created_at);
  CREATE TABLE sessions (id TEXT PRIMARY KEY, student_id TEXT NOT NULL, kind TEXT NOT NULL, started_at INTEGER NOT NULL,
    ended_at INTEGER NOT NULL, active_ms INTEGER NOT NULL, mission_title TEXT NOT NULL);
  CREATE INDEX sessions_student_time ON sessions (student_id, started_at);
  CREATE TABLE placement_results (id TEXT PRIMARY KEY, student_id TEXT NOT NULL, created_at INTEGER NOT NULL, scores TEXT NOT NULL);
  CREATE TABLE goals (id TEXT PRIMARY KEY, student_id TEXT NOT NULL, kind TEXT NOT NULL, value TEXT NOT NULL, active INTEGER NOT NULL, created_at INTEGER NOT NULL);
  CREATE TABLE wallets (student_id TEXT PRIMARY KEY, coins INTEGER NOT NULL DEFAULT 0, gems INTEGER NOT NULL DEFAULT 0, xp INTEGER NOT NULL DEFAULT 0);
  CREATE TABLE unlocks (student_id TEXT NOT NULL, item_id TEXT NOT NULL, created_at INTEGER NOT NULL, PRIMARY KEY (student_id, item_id));
  CREATE TABLE materials (id TEXT PRIMARY KEY, name TEXT NOT NULL, kind TEXT NOT NULL, size INTEGER NOT NULL, status TEXT NOT NULL,
    note TEXT NOT NULL DEFAULT '', concept_id TEXT, created_at INTEGER NOT NULL);
  CREATE TABLE custom_items (id TEXT PRIMARY KEY, kind TEXT NOT NULL, material_id TEXT NOT NULL, data TEXT NOT NULL);
  CREATE TABLE kv (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  `,
];

export function migrate(db: Database) {
  const current = Number(db.exec('PRAGMA user_version')[0]?.values[0][0] ?? 0);
  for (let v = current; v < MIGRATIONS.length; v++) {
    db.exec('BEGIN');
    try {
      db.exec(MIGRATIONS[v]);
      db.exec(`PRAGMA user_version = ${v + 1}`);
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
  }
}
