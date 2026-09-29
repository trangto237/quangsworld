import { index, integer, primaryKey, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const family = sqliteTable('family', {
  id: text('id').primaryKey(),
  parentName: text('parent_name').notNull(),
  passwordHash: text('password_hash').notNull(),
  salt: text('salt').notNull(),
  createdAt: integer('created_at').notNull(),
});

export const students = sqliteTable('students', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  age: integer('age').notNull(),
  grade: integer('grade').notNull(),
  avatar: text('avatar').notNull(),
  pinHash: text('pin_hash'),
  pinSalt: text('pin_salt'),
  placementDone: integer('placement_done', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at').notNull(),
});

export const conceptStates = sqliteTable(
  'concept_states',
  {
    studentId: text('student_id').notNull(),
    conceptId: text('concept_id').notNull(),
    mastery: real('mastery').notNull(),
    confidence: real('confidence').notNull(),
    attempts: integer('attempts').notNull(),
    correct: integer('correct').notNull(),
    streak: integer('streak').notNull(),
    ease: real('ease').notNull(),
    intervalDays: real('interval_days').notNull(),
    nextReview: integer('next_review').notNull(),
    lastSeen: integer('last_seen').notNull(),
    lastWrongAt: integer('last_wrong_at').notNull(),
  },
  (t) => [primaryKey({ columns: [t.studentId, t.conceptId] })],
);

export const attempts = sqliteTable(
  'attempts',
  {
    id: text('id').primaryKey(),
    studentId: text('student_id').notNull(),
    questionId: text('question_id').notNull(),
    conceptId: text('concept_id').notNull(),
    correct: integer('correct', { mode: 'boolean' }).notNull(),
    difficulty: integer('difficulty').notNull(),
    msSpent: integer('ms_spent').notNull(),
    context: text('context', { enum: ['placement', 'mission', 'review'] }).notNull(),
    createdAt: integer('created_at').notNull(),
  },
  (t) => [index('attempts_student_time').on(t.studentId, t.createdAt)],
);

export const sessions = sqliteTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    studentId: text('student_id').notNull(),
    kind: text('kind', { enum: ['placement', 'mission'] }).notNull(),
    startedAt: integer('started_at').notNull(),
    endedAt: integer('ended_at').notNull(),
    activeMs: integer('active_ms').notNull(),
    missionTitle: text('mission_title').notNull(),
  },
  (t) => [index('sessions_student_time').on(t.studentId, t.startedAt)],
);

export const placementResults = sqliteTable('placement_results', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull(),
  createdAt: integer('created_at').notNull(),
  scores: text('scores', { mode: 'json' }).notNull(),
});

export const goals = sqliteTable('goals', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull(),
  kind: text('kind', { enum: ['dailyMinutes', 'focusSubject', 'focusConcept', 'ieltsTarget'] }).notNull(),
  value: text('value').notNull(),
  active: integer('active', { mode: 'boolean' }).notNull(),
  createdAt: integer('created_at').notNull(),
});

export const wallets = sqliteTable('wallets', {
  studentId: text('student_id').primaryKey(),
  coins: integer('coins').notNull().default(0),
  gems: integer('gems').notNull().default(0),
  xp: integer('xp').notNull().default(0),
});

export const unlocks = sqliteTable(
  'unlocks',
  {
    studentId: text('student_id').notNull(),
    itemId: text('item_id').notNull(),
    createdAt: integer('created_at').notNull(),
  },
  (t) => [primaryKey({ columns: [t.studentId, t.itemId] })],
);

export const materials = sqliteTable('materials', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  kind: text('kind', { enum: ['csv', 'pdf', 'docx', 'image'] }).notNull(),
  size: integer('size').notNull(),
  status: text('status', { enum: ['processed', 'stored', 'failed'] }).notNull(),
  note: text('note').notNull().default(''),
  conceptId: text('concept_id'),
  createdAt: integer('created_at').notNull(),
});

/** Family-imported concepts and questions (JSON of ConceptDef / Question). */
export const customItems = sqliteTable('custom_items', {
  id: text('id').primaryKey(),
  kind: text('kind', { enum: ['concept', 'question'] }).notNull(),
  materialId: text('material_id').notNull(),
  data: text('data', { mode: 'json' }).notNull(),
});

/** Small app state: in-progress placement tests, equipped cosmetics, settings. */
export const kv = sqliteTable('kv', {
  key: text('key').primaryKey(),
  value: text('value', { mode: 'json' }).notNull(),
});

/** The Mistake Book: every question answered wrongly in a mission, until the learner gets it right on a retry. */
export const mistakes = sqliteTable(
  'mistakes',
  {
    id: text('id').primaryKey(),
    studentId: text('student_id').notNull(),
    questionId: text('question_id').notNull(),
    conceptId: text('concept_id').notNull(),
    /** Snapshot of the question (prompt, options, answer…) so it can be shown even if content changes. */
    question: text('question', { mode: 'json' }).notNull(),
    picked: text('picked').notNull(),
    times: integer('times').notNull(),
    createdAt: integer('created_at').notNull(),
    lastWrongAt: integer('last_wrong_at').notNull(),
    reviewedAt: integer('reviewed_at'),
    resolvedAt: integer('resolved_at'),
  },
  (t) => [index('mistakes_student').on(t.studentId, t.resolvedAt)],
);
