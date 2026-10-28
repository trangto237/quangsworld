import { describe, expect, it } from 'vitest';
import { LIT_COURSE } from './course';

describe('Lớp học Ngữ văn', () => {
  it('is well formed and teaches before it asks', () => {
    const ids = LIT_COURSE.flatMap((u) => u.lessons.map((l) => l.id));
    expect(new Set(ids).size).toBe(ids.length);
    for (const u of LIT_COURSE)
      for (const l of u.lessons) {
        expect(l.steps[0].kind, `${l.id} starts by teaching`).toBe('read');
        for (const [k, s] of l.steps.entries()) {
          const where = `${l.id} step ${k + 1} (${s.kind})`;
          expect(JSON.stringify(s).includes('"vi":""'), where).toBe(false);
          expect(['read', 'choice', 'fill', 'order', 'compose'], where).toContain(s.kind);
          if (s.kind === 'choice') {
            expect(s.answer, where).toBeLessThan(s.options.length);
            expect(new Set(s.options.map((o) => (typeof o === 'string' ? o : o.vi))).size, `${where}: duplicate options`).toBe(s.options.length);
          }
          if (s.kind === 'fill') {
            expect((s.code.match(/___/g) ?? []).length, `${where}: blanks vs answers`).toBe(s.answers.length);
            for (const x of s.extra) expect(s.answers.includes(x), `${where}: decoy is an answer`).toBe(false);
          }
          if (s.kind === 'compose') {
            expect(s.model.length, where).toBeGreaterThan(20);
            expect(s.checklist.length, where).toBeGreaterThanOrEqual(2);
          }
        }
      }
  });
});
