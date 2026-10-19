import { describe, expect, it } from 'vitest';
import initSqlJs from 'sql.js';
import { AtlasDb } from './database';
import { Repo } from './repo';
import { MemoryStore } from './store';
import { getConcept, allConcepts, autoImport, GLOBAL_SUCCESS_9, pickQuestion, staticQuestions } from '@atlas/knowledge';
import { createPlacement, isPlacementDone, nextPlacementQuestion, recordPlacementAnswer, scorePlacement } from '@atlas/engine';
import { rng } from '@atlas/shared';

const SQL = await initSqlJs();

async function fresh(store = new MemoryStore(), channel = `test-${Math.random()}`) {
  const db = await AtlasDb.open(SQL, store, channel);
  return { db, repo: new Repo(db), store };
}

describe('AtlasDb', () => {
  it('encrypts the database at rest and reloads it', async () => {
    const { repo, store } = await fresh();
    await repo.createFamily('Trang', 'secret123');
    const snap = await repo.db.storedSnapshot();
    expect(snap!.version).toBe(1);
    // SQLite files start with "SQLite format 3" — the stored bytes must not.
    const head = new TextDecoder().decode(snap!.data.slice(0, 15));
    expect(head).not.toBe('SQLite format 3');
    expect(new TextDecoder().decode(snap!.data)).not.toContain('Trang');

    const again = await AtlasDb.open(SQL, store, 'other');
    expect(new Repo(again).getFamily()?.parentName).toBe('Trang');
  });

  it('rolls back a failed write', async () => {
    const { repo } = await fresh();
    const id = await repo.addStudent({ name: 'Quang', age: 14, grade: 9, avatar: '🦊' });
    await expect(repo.purchase(id, 'tower.queen')).rejects.toThrow(/Not enough/);
    expect(repo.getWallet(id).coins).toBe(100);
  });

  it('picks up writes made by another tab before writing', async () => {
    const store = new MemoryStore();
    const a = await fresh(store, 'x1');
    const id = await a.repo.addStudent({ name: 'Quang', age: 14, grade: 9, avatar: '🦊' });
    const b = await fresh(store, 'x2');
    await b.repo.setGoal(id, 'dailyMinutes', '30');
    // Tab A writes without having seen B's change: it must reload first, not clobber it.
    await a.repo.setGoal(id, 'focusSubject', 'english');
    const c = await fresh(store, 'x3');
    const goals = c.repo.listGoals(id);
    expect(goals.find((g) => g.kind === 'dailyMinutes')?.value).toBe('30');
    expect(goals.some((g) => g.kind === 'focusSubject')).toBe(true);
  });

  it('notifies other tabs through BroadcastChannel', async () => {
    const store = new MemoryStore();
    const kid = await fresh(store, 'shared');
    const parent = await fresh(store, 'shared');
    const got = new Promise<string>((resolve) => parent.db.subscribe((origin) => resolve(origin)));
    await kid.repo.addStudent({ name: 'Quang', age: 14, grade: 9, avatar: '🦊' });
    expect(await got).toBe('remote');
    expect(parent.repo.listStudents()).toHaveLength(1);
    kid.db.close();
    parent.db.close();
  });
});

describe('Repo', () => {
  it('authenticates the parent and kid PIN', async () => {
    const { repo } = await fresh();
    await repo.createFamily('Trang', 'pa55word');
    expect(await repo.verifyParent('pa55word')).toBe(true);
    expect(await repo.verifyParent('nope')).toBe(false);
    const id = await repo.addStudent({ name: 'Quang', age: 14, grade: 9, avatar: '🦊', pin: '1234' });
    expect(repo.getStudent(id)?.hasPin).toBe(true);
    expect(await repo.verifyStudentPin(id, '1234')).toBe(true);
    expect(await repo.verifyStudentPin(id, '0000')).toBe(false);
  });

  it('runs a full placement and seeds every concept', async () => {
    const { repo } = await fresh();
    const id = await repo.addStudent({ name: 'Quang', age: 14, grade: 9, avatar: '🦊' });
    let s = createPlacement();
    const r = rng(9);
    while (!isPlacementDone(s)) {
      const q = nextPlacementQuestion(s, r)!;
      const correct = q.conceptId.startsWith('math') || q.difficulty <= 2;
      s = recordPlacementAnswer(s, { questionId: q.id, conceptId: q.conceptId, difficulty: q.difficulty, correct, msSpent: 3000 });
    }
    await repo.savePlacementProgress(id, s);
    expect(repo.getPlacementProgress(id)).toEqual(s);
    await repo.completePlacement(id, scorePlacement(s));
    expect(repo.getStudent(id)?.placementDone).toBe(true);
    expect(repo.getPlacementProgress(id)).toBeUndefined();
    const states = repo.getStates(id);
    expect(Object.keys(states).length).toBe(allConcepts().length);
    expect(states['math.algebra.linear'].mastery).toBeGreaterThan(states['en.grammar.passive'].mastery);
    expect(repo.latestPlacement(id)?.scores.english.vocabulary).toBeTypeOf('number');
  });

  it('completes missions, pays rewards and supports purchases', async () => {
    const { repo } = await fresh();
    const id = await repo.addStudent({ name: 'Quang', age: 14, grade: 9, avatar: '🦊' });
    await repo.completeMission(id, {
      states: [],
      session: { kind: 'mission', startedAt: Date.now() - 60000, endedAt: Date.now(), activeMs: 60000, missionTitle: 'Test' },
      reward: { coins: 100, gems: 1, xp: 50 },
    });
    expect(repo.getWallet(id)).toEqual({ coins: 200, gems: 1, xp: 50 });
    expect(repo.listSessions(id)).toHaveLength(1);
    await repo.purchase(id, 'tower.knight');
    expect(repo.listUnlocks(id)).toContain('tower.knight');
    expect(repo.getWallet(id).coins).toBe(50);
    await expect(repo.purchase(id, 'tower.knight')).rejects.toThrow(/Already/);
  });

  it('resets a child to a fresh start but keeps the profile and settings', async () => {
    const { repo } = await fresh();
    const id = await repo.addStudent({ name: 'Quang', age: 14, grade: 9, avatar: '🦊', pin: '1234' });
    const other = await repo.addStudent({ name: 'Lan', age: 10, grade: 5, avatar: '🐼' });
    let s = createPlacement();
    const r = rng(3);
    while (!isPlacementDone(s)) {
      const q = nextPlacementQuestion(s, r)!;
      s = recordPlacementAnswer(s, { questionId: q.id, conceptId: q.conceptId, difficulty: q.difficulty, correct: true, msSpent: 2000 });
    }
    for (const sid of [id, other]) await repo.completePlacement(sid, scorePlacement(s));
    await repo.completeMission(id, { states: [], session: { kind: 'mission', startedAt: 0, endedAt: 60000, activeMs: 60000, missionTitle: 'T' }, reward: { coins: 300, gems: 2, xp: 90 } });
    await repo.purchase(id, 'tower.knight');
    await repo.setKv(`lang:${id}`, 'vi');
    await repo.setKv(`plan:${id}:2026-10-19`, { blocks: [] });
    await repo.setKv(`exam-progress:${id}`, { examId: 'hn10' });

    await repo.resetStudentProgress(id);

    const kid = repo.getStudent(id)!;
    expect(kid.placementDone).toBe(false);
    expect(kid.name).toBe('Quang');
    expect(await repo.verifyStudentPin(id, '1234')).toBe(true);
    expect(Object.keys(repo.getStates(id))).toHaveLength(0);
    expect(repo.listSessions(id)).toHaveLength(0);
    expect(repo.latestPlacement(id)).toBeUndefined();
    expect(repo.getWallet(id)).toEqual({ coins: 100, gems: 0, xp: 0 });
    expect(repo.listUnlocks(id)).not.toContain('tower.knight');
    expect(repo.getKv(`lang:${id}`)).toBe('vi');
    expect(repo.getKv(`plan:${id}:2026-10-19`)).toBeUndefined();
    expect(repo.getKv(`exam-progress:${id}`)).toBeUndefined();
    expect(repo.listGoals(id).length).toBeGreaterThan(0);
    // The other child is untouched.
    expect(repo.getStudent(other)!.placementDone).toBe(true);
    expect(Object.keys(repo.getStates(other)).length).toBeGreaterThan(0);
  });

  it('removes a kv entry when set to null', async () => {
    const { repo } = await fresh();
    await repo.setKv('exam-progress:x', { examId: 'hn10' });
    expect(repo.getKv<{ examId: string }>('exam-progress:x')?.examId).toBe('hn10');
    await repo.setKv('exam-progress:x', null);
    expect(repo.getKv('exam-progress:x')).toBeUndefined();
  });

  it('imports CSV flashcards as a private concept', async () => {
    const { repo, store } = await fresh();
    const csv = 'abundant,plentiful\nbrief,short\ncautious,careful\ndiligent,hard-working';
    const res = await repo.importFlashcards('Unit 1', csv);
    expect(getConcept(res.concept.id)?.name).toBe('Unit 1');
    expect(repo.listMaterials()[0].status).toBe('processed');
    const other = new Repo(await AtlasDb.open(SQL, store, 'y'));
    other.loadCustomContent();
    expect(getConcept(res.concept.id)).toBeDefined();
    await repo.deleteMaterial(repo.listMaterials()[0].id);
    expect(getConcept(res.concept.id)).toBeUndefined();
  });

  it('imports textbook questions per unit part, adds to the same unit, and deletes safely', async () => {
    const { repo, store } = await fresh();
    const unit = GLOBAL_SUCCESS_9[6];
    const vocab = autoImport('cave (n): hang động\nwaterfall (n): thác nước\nlandscape (n): phong cảnh\nexplore (v): khám phá\npreserve (v): bảo tồn');
    const a = await repo.importQuestions({ unit, materialName: 'Unit 7 words', kind: 'text', drafts: vocab.drafts, via: 'offline' });
    expect(a.concepts.map((c) => c.id)).toEqual(['custom.tb.gs9-u7.vocabulary']);
    expect(getConcept('custom.tb.gs9-u7.vocabulary')?.domain).toBe('My textbook');
    expect(getConcept('custom.tb.gs9-u7.vocabulary')?.missionName).toBe('🔤 Unit 7 · Vocabulary');
    expect(a.added).toBe(vocab.drafts.length);

    // Same words again + a passage: duplicates skipped, new parts added to the same unit.
    const passage = autoImport('Visitors can explore the deep caves every summer. Many tourists take a boat trip around the bay every year. Local people work hard to protect the beautiful bay.');
    const b = await repo.importQuestions({ unit, materialName: 'Unit 7 reading', kind: 'pdf', drafts: [...vocab.drafts, ...passage.drafts], via: 'offline', bytes: new Uint8Array([1, 2, 3]) });
    expect(b.skipped).toBe(vocab.drafts.length);
    expect(b.concepts.map((c) => c.id)).toContain('custom.tb.gs9-u7.grammar');
    expect(staticQuestions('custom.tb.gs9-u7.vocabulary')).toHaveLength(vocab.drafts.length);
    const order = staticQuestions('custom.tb.gs9-u7.grammar')[0];
    expect(order.type).toBe('order');
    expect(pickQuestion({ conceptId: 'custom.tb.gs9-u7.grammar', difficulty: 3 })).toBeDefined();
    expect(new TextDecoder().decode(await repo.db.getFile(b.materialId))).toBe('\u0001\u0002\u0003');

    // Another device sees the imports after loading.
    const other = new Repo(await AtlasDb.open(SQL, store, 'tb'));
    other.loadCustomContent();
    expect(getConcept('custom.tb.gs9-u7.grammar')).toBeDefined();

    // Deleting the first import removes the vocabulary mission (only import A had questions in it).
    await repo.deleteMaterial(a.materialId);
    expect(getConcept('custom.tb.gs9-u7.vocabulary')).toBeUndefined();
    expect(getConcept('custom.tb.gs9-u7.grammar')).toBeDefined();
    expect(staticQuestions('custom.tb.gs9-u7.grammar').length).toBeGreaterThan(0);

    // Re-import vocabulary, then delete the reading import: vocabulary stays, grammar goes.
    const c = await repo.importQuestions({ unit, materialName: 'Unit 7 words again', kind: 'text', drafts: vocab.drafts, via: 'offline' });
    expect(c.added).toBe(vocab.drafts.length);
    await repo.deleteMaterial(b.materialId);
    expect(getConcept('custom.tb.gs9-u7.vocabulary')).toBeDefined();
    expect(getConcept('custom.tb.gs9-u7.grammar')).toBeUndefined();
    expect(repo.listMaterials()).toHaveLength(1);
    await expect(repo.importQuestions({ unit, materialName: 'x', kind: 'text', drafts: [], via: 'offline' })).rejects.toThrow(/Nothing to save/);
  });

  it('a concept shared by two imports survives deleting the one that created it', async () => {
    const { repo } = await fresh();
    const unit = GLOBAL_SUCCESS_9[0];
    const mk = (p: string) => ({ type: 'mcq' as const, part: 'questions' as const, prompt: p, options: ['a', 'b', 'c', 'd'], answer: 0, difficulty: 2 });
    const a = await repo.importQuestions({ unit, materialName: 'A', kind: 'text', drafts: [mk('One?'), mk('Two?')], via: 'offline' });
    const b = await repo.importQuestions({ unit, materialName: 'B', kind: 'text', drafts: [mk('Three?')], via: 'ai' });
    expect(repo.listMaterials().find((m) => m.id === b.materialId)?.note).toMatch(/made with Claude/);
    await repo.deleteMaterial(a.materialId);
    expect(getConcept('custom.tb.gs9-u1.questions')).toBeDefined();
    expect(staticQuestions('custom.tb.gs9-u1.questions').map((q) => q.prompt)).toEqual(['Three?']);
    await repo.deleteMaterial(b.materialId);
    expect(getConcept('custom.tb.gs9-u1.questions')).toBeUndefined();
  });

  it('stores uploaded files encrypted', async () => {
    const { repo, store } = await fresh();
    const bytes = new TextEncoder().encode('%PDF-1.7 private worksheet');
    const id = await repo.storeMaterialFile('worksheet.pdf', 'pdf', bytes);
    const raw = await store.get<{ data: Uint8Array }>(`file:${id}`);
    expect(new TextDecoder().decode(raw!.data)).not.toContain('private worksheet');
    expect(new TextDecoder().decode(await repo.db.getFile(id))).toContain('private worksheet');
  });

  it('keeps a Mistake Book: dedupes repeats, resolves on a correct retry', async () => {
    const { repo } = await fresh();
    const id = await repo.addStudent({ name: 'Quang', age: 14, grade: 9, avatar: '🦊' });
    const q = { id: 'en.grammar.passive#2', conceptId: 'en.grammar.passive', difficulty: 2, type: 'mcq' as const, prompt: 'The Eiffel Tower ___ in 1889.', options: ['was built', 'built'], answer: 0, source: 't' };
    await repo.recordMistake(id, q, 'built');
    await repo.recordMistake(id, q, 'built');
    let open = repo.listMistakes(id, { open: true });
    expect(open).toHaveLength(1);
    expect(open[0].times).toBe(2);
    expect(open[0].question.prompt).toContain('Eiffel');
    await repo.markMistakesReviewed([open[0].id]);
    await repo.retryMistake(open[0].id, false, 'built');
    expect(repo.listMistakes(id, { open: true })[0].times).toBe(3);
    await repo.retryMistake(open[0].id, true, 'was built');
    open = repo.listMistakes(id, { open: true });
    expect(open).toHaveLength(0);
    expect(repo.listMistakes(id)).toHaveLength(1);
  });

  it('migrates an existing version-1 database', async () => {
    const raw = new SQL.Database();
    raw.exec((await import('./migrations')).MIGRATIONS[0]);
    raw.exec('PRAGMA user_version = 1');
    (await import('./migrations')).migrate(raw);
    expect(raw.exec("SELECT name FROM sqlite_master WHERE name = 'mistakes'")[0].values).toHaveLength(1);
  });

  it('saves a mock exam with attempts, mistakes and reward', async () => {
    const { repo } = await fresh();
    const id = await repo.addStudent({ name: 'Quang', age: 14, grade: 9, avatar: '🦊' });
    const q = { id: 'en.exam.signs#x1', conceptId: 'en.exam.signs', difficulty: 1, type: 'mcq' as const, prompt: 'What does the sign or notice mean?', options: ['A', 'B'], answer: 0, source: 't', sign: 'NO SMOKING' };
    await repo.completeExam(id, {
      result: { examId: 'hn10', startedAt: 1, finishedAt: 2, durationMs: 60_000, correct: 1, total: 2, score: 5, band: null, sections: [{ id: 's', title: 'S', correct: 1, total: 2 }], setIds: ['cloze-green'] },
      answers: [
        { question: q, answer: 'A', correct: true },
        { question: { ...q, id: 'en.exam.signs#x2' }, answer: 'B', correct: false },
      ],
      states: [],
      reward: { coins: 50, gems: 1, xp: 100 },
    });
    expect(repo.listExamResults(id)).toHaveLength(1);
    expect(repo.listExamResults(id)[0].setIds).toEqual(['cloze-green']);
    expect(repo.listAttempts(id).filter((a) => a.context === 'exam')).toHaveLength(2);
    expect(repo.listMistakes(id, { open: true })).toHaveLength(1);
    expect(repo.getWallet(id).coins).toBe(150);
  });
});
