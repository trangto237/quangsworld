import { describe, expect, it } from 'vitest';
import { questions } from '@atlas/content';

const CONCEPTS = [
  'lit.comprehension', 'lit.devices', 'lit.argument', 'lit.structure', 'lit.poetry-forms', 'lit.narrative', 'lit.classics',
  'lit.hanviet', 'lit.allusion', 'lit.quotation', 'lit.linking', 'lit.nlxh', 'lit.nlvh',
];
const bank = () => questions.filter((q) => q.source === 'Atlas grade 9 bank' && q.conceptId.startsWith('lit.'));

describe('Ngữ văn 9 bank (thi vào 10)', () => {
  it('is not empty', () => {
    expect(bank().length).toBeGreaterThan(0);
  });

  it('every question has 4 distinct non-empty options, difficulty 3–5, an explanation and a known concept', () => {
    for (const q of bank()) {
      expect(CONCEPTS, q.id).toContain(q.conceptId);
      expect(q.options.length, q.id).toBe(4);
      for (const o of q.options) expect(o.trim().length, q.id).toBeGreaterThan(0);
      expect(new Set(q.options.map((o) => o.trim())).size, `${q.id} duplicate options`).toBe(4);
      expect(q.answer, q.id).toBe(0);
      expect(q.difficulty, q.id).toBeGreaterThanOrEqual(3);
      expect(q.difficulty, q.id).toBeLessThanOrEqual(5);
      expect(q.explanation?.trim(), q.id).toBeTruthy();
    }
  });

  it('ids are unique across all questions', () => {
    const ids = questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
