import { describe, expect, it } from 'vitest';
import { generators, questions } from '@atlas/content';
import { PLACEMENT_SECTIONS, WORLDS, allConcepts, getConcept, getQuestion, knowledgeTree, pickQuestion, present } from './graph';
import { flashcardsToConcept, parseCsv } from './csv';
import { rng } from '@atlas/shared';

describe('knowledge graph integrity', () => {
  it('has unique concept ids with valid prerequisites', () => {
    const ids = allConcepts().map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of allConcepts()) for (const p of c.prerequisites ?? []) expect(getConcept(p), `${c.id} → ${p}`).toBeDefined();
  });

  it('every authored question is well-formed', () => {
    const ids = new Set<string>();
    for (const q of questions) {
      expect(ids.has(q.id), q.id).toBe(false);
      ids.add(q.id);
      expect(getConcept(q.conceptId), q.id).toBeDefined();
      expect(q.options.length, q.id).toBeGreaterThanOrEqual(3);
      expect(new Set(q.options).size, `${q.id} duplicate options`).toBe(q.options.length);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(q.options.length);
      expect(q.difficulty).toBeGreaterThanOrEqual(1);
      expect(q.difficulty).toBeLessThanOrEqual(5);
    }
  });

  it('every concept can produce at least one question', () => {
    for (const c of allConcepts()) expect(pickQuestion({ conceptId: c.id, difficulty: 3 }), c.id).toBeDefined();
  });

  it('every concept belongs to exactly one world', () => {
    for (const c of allConcepts()) {
      const ws = WORLDS.filter((w) => w.subject === c.subject && w.domains.includes(c.domain));
      expect(ws.length, c.id).toBe(1);
    }
  });

  it('builds the Subject → Domain → Skill → Concept tree', () => {
    const tree = knowledgeTree();
    expect(tree.map((t) => t.subject.id)).toEqual(['english', 'math', 'logic', 'literature']);
    const english = tree[0];
    expect(english.domains.map((d) => d.name)).toContain('Grammar');
  });

  it('placement sections match the PRD and have enough material', () => {
    expect(PLACEMENT_SECTIONS.map((s) => [s.title, s.questionCount])).toEqual([
      ['Word Hunter', 25],
      ['Sentence Forge', 20],
      ['Echo Cave', 15],
      ['Reading Puzzle', 10],
      ['Math Logic', 20],
    ]);
    for (const s of PLACEMENT_SECTIONS) {
      const staticCount = questions.filter((q) => s.concepts.includes(q.conceptId)).length;
      const generated = s.concepts.some((c) => c in generators);
      expect(generated || staticCount >= s.questionCount, `${s.id}: ${staticCount}`).toBe(true);
    }
  });
});

describe('generators', () => {
  it('produce unique options that never include the answer as a distractor', () => {
    for (const [cid, gen] of Object.entries(generators)) {
      for (let d = 1; d <= 5; d++) {
        for (let seed = 1; seed <= 150; seed++) {
          const g = gen(d, rng(seed * 31 + d));
          expect(g.prompt.length, cid).toBeGreaterThan(3);
          expect(g.distractors, `${cid} d${d} s${seed}`).not.toContain(g.answer);
          expect(g.distractors.length, `${cid} d${d} s${seed}`).toBeGreaterThanOrEqual(1);
          expect(g.answer, cid).not.toMatch(/NaN|undefined|Infinity/);
        }
      }
    }
  });

  it('generated questions round-trip through their id', () => {
    const q = pickQuestion({ conceptId: 'math.algebra.linear', difficulty: 3, rand: rng(7) })!;
    const again = getQuestion(q.id)!;
    expect(again.prompt).toBe(q.prompt);
    expect(again.options).toEqual(q.options);
  });

  it('linear equation answers actually solve the equation', () => {
    for (let s = 1; s < 200; s++) {
      const g = generators['math.algebra.linear'](3, rng(s));
      const m = g.prompt.match(/Solve: (\d+)x ([+−]) (\d+) = (-?\d+)/)!;
      const a = +m[1], b = (m[2] === '−' ? -1 : 1) * +m[3], c = +m[4];
      expect((c - b) / a).toBe(Number(g.answer));
    }
  });
});

describe('presentation', () => {
  it('shuffles options but keeps track of the correct one', () => {
    const q = questions.find((x) => x.options.length === 4)!;
    for (let s = 0; s < 20; s++) {
      const p = present(q, s);
      expect(p.shown[p.correct]).toBe(q.options[q.answer]);
      expect([...p.shown].sort()).toEqual([...q.options].sort());
    }
  });

  it('keeps True/False/Not Given in canonical order', () => {
    const q = questions.find((x) => x.options.includes('Not Given'))!;
    expect(present(q, 3).shown).toEqual(['True', 'False', 'Not Given']);
  });
});

describe('CSV flashcards', () => {
  it('parses quoted fields and detects delimiters', () => {
    expect(parseCsv('a,"b, c"\n"x ""y""",z')).toEqual([['a', 'b, c'], ['x "y"', 'z']]);
    expect(parseCsv('a;b\nc;d')).toEqual([['a', 'b'], ['c', 'd']]);
  });

  it('turns a deck into a concept with two questions per card', () => {
    const csv = 'term,meaning\nabundant,plentiful\nbrief,short\ncautious,careful\ndiligent,hard-working\neager,keen';
    const res = flashcardsToConcept(csv, 'Oxford Unit 1');
    expect(res.cards).toHaveLength(5);
    expect(res.questions).toHaveLength(10);
    expect(res.concept.id).toMatch(/^custom\.oxford-unit-1\./);
    for (const q of res.questions) expect(new Set(q.options).size).toBe(q.options.length);
  });

  it('rejects tiny decks', () => {
    expect(() => flashcardsToConcept('a,b\nc,d', 'x')).toThrow();
  });
});
