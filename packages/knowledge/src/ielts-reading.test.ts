import { describe, expect, it } from 'vitest';
import { IELTS_PASSAGES } from '../../../content/english/ielts-passages';
import { buildIeltsQuestions, passageText } from '../../../content/english/ielts-reading';
import { translatePrompt } from '@atlas/content';

const words = (s: string) => s.trim().split(/\s+/).length;
const norm = (s: string) => s.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ');

describe('IELTS reading generator', () => {
  it('has unique passage ids', () => {
    const ids = IELTS_PASSAGES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const p of IELTS_PASSAGES)
    it(`passage "${p.id}" is well formed`, () => {
      const text = norm(passageText(p));
      const qs = buildIeltsQuestions(p);
      expect(qs.length, 'questions per passage (like one real IELTS passage)').toBeGreaterThanOrEqual(13);
      expect(qs.length).toBeLessThanOrEqual(14);
      expect(p.paragraphs.length).toBeGreaterThanOrEqual(4);
      expect(p.paragraphs.length).toBeLessThanOrEqual(9);
      const wc = p.paragraphs.join(' ').split(/\s+/).length;
      expect(wc, 'passage length in words').toBeGreaterThanOrEqual(450);
      expect(wc).toBeLessThanOrEqual(1000);
      // At most 4 task types (a real passage has 2–4).
      const types = (['headings', 'tfng', 'ynng', 'features', 'endings', 'mc', 'chooseTwo', 'summaryList', 'completion'] as const).filter((k) => {
        const v = p[k];
        return Array.isArray(v) ? v.length > 0 : !!v;
      });
      expect(types.length, types.join(', ')).toBeLessThanOrEqual(4);

      for (const q of qs) {
        expect(q.explanation, q.prompt).toBeTruthy();
        expect(translatePrompt(q.prompt, q.conceptId), q.prompt).toBeTruthy();
        if (q.type === 'input') continue;
        expect(q.options.length, q.prompt).toBeGreaterThanOrEqual(3);
        expect(q.options.length, q.prompt).toBeLessThanOrEqual(8);
        expect(new Set(q.options).size, `duplicate options: ${q.prompt}`).toBe(q.options.length);
      }
      if (p.headings) {
        const all = [...p.headings.items.map((h) => h.heading), ...p.headings.distractors];
        expect(all.length).toBeLessThanOrEqual(8);
        expect(all.length - p.headings.items.length, 'at least 2 spare headings').toBeGreaterThanOrEqual(2);
        for (const h of p.headings.items) expect(h.para).toBeLessThan(p.paragraphs.length);
        expect(new Set(p.headings.items.map((h) => h.para)).size).toBe(p.headings.items.length);
      }
      for (const m of p.mc ?? []) expect(m.wrong.length, m.question).toBe(3);
      for (const m of p.chooseTwo ?? []) expect(m.wrong.length, m.question).toBeGreaterThanOrEqual(3);
      if (p.features) for (const it of p.features.items) expect(p.features.options, it.item).toContain(it.answer);
      if (p.summaryList) {
        expect(p.summaryList.gaps.length + p.summaryList.distractors.length).toBeLessThanOrEqual(8);
        for (const g of p.summaryList.gaps) expect(g.text, g.text).toContain('___');
      }
      for (const c of p.completion ?? [])
        for (const g of c.gaps) {
          expect(g.text, g.text).toContain('___');
          // Words copied from the passage, within the word limit.
          expect(words(g.answer), `${g.answer} is over the word limit`).toBeLessThanOrEqual(c.limit);
          expect(text.includes(norm(g.answer)), `"${g.answer}" is not in the passage`).toBe(true);
        }
      const ans = [...(p.tfng ?? []), ...(p.ynng ?? [])].map((s) => s.answer);
      if (ans.length >= 4) expect(new Set(ans).size, 'statements use at least two different answers').toBeGreaterThanOrEqual(2);
    });
});
