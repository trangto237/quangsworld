import { describe, expect, it } from 'vitest';
import initSqlJs from 'sql.js';
import { AtlasDb } from './database';
import { Repo } from './repo';
import { MemoryStore } from './store';
import { getConcept, allConcepts } from '@atlas/knowledge';
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

  it('stores uploaded files encrypted', async () => {
    const { repo, store } = await fresh();
    const bytes = new TextEncoder().encode('%PDF-1.7 private worksheet');
    const id = await repo.storeMaterialFile('worksheet.pdf', 'pdf', bytes);
    const raw = await store.get<{ data: Uint8Array }>(`file:${id}`);
    expect(new TextDecoder().decode(raw!.data)).not.toContain('private worksheet');
    expect(new TextDecoder().decode(await repo.db.getFile(id))).toContain('private worksheet');
  });
});
