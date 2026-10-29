import { describe, expect, it } from 'vitest';
import { questions } from '@atlas/content';
import { LESSONS_VI, allConcepts } from './index';

const olympiad = () => allConcepts().filter((c) => c.id.startsWith('math.olympiad.'));
const bank = () => questions.filter((q) => q.conceptId.startsWith('math.olympiad.'));

describe('olympiad bank (TIMO / FIMO style)', () => {
  it('has the olympiad concepts on the Advanced island, each with a Vietnamese lesson', () => {
    expect(olympiad().length).toBeGreaterThanOrEqual(1);
    for (const c of olympiad()) {
      expect(c.domain, c.id).toBe('Advanced');
      expect(c.lesson, c.id).toBeTruthy();
      expect(LESSONS_VI[c.id], c.id).toBeTruthy();
    }
  });

  it('every question is bilingual, has 4 distinct options and difficulty 3–5', () => {
    for (const q of bank()) {
      expect(q.promptVi, q.id).toBeTruthy();
      expect(q.explanation, q.id).toBeTruthy();
      expect(q.explanationVi, q.id).toBeTruthy();
      expect(q.options.length, q.id).toBe(4);
      expect(new Set(q.options.map((o) => o.trim())).size, `${q.id} duplicate options`).toBe(4);
      expect(q.answer, q.id).toBe(0);
      expect(q.difficulty, q.id).toBeGreaterThanOrEqual(3);
      expect(q.difficulty, q.id).toBeLessThanOrEqual(5);
    }
  });

  it('every olympiad concept has at least 15 questions', () => {
    for (const c of olympiad()) expect(bank().filter((q) => q.conceptId === c.id).length, c.id).toBeGreaterThanOrEqual(15);
  });
});
