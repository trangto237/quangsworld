import { describe, expect, it } from 'vitest';
import { generators, questions } from '@atlas/content';
import { rng } from '@atlas/shared';
import { LESSONS_VI, allConcepts, glossaryLookup, translateExplanation, translatePrompt } from './index';

describe('Vietnamese help', () => {
  it('translates instructions without giving away the English being tested', () => {
    expect(translatePrompt('Choose the word closest in meaning to "rapid".', 'en.vocab.synonyms')).toBe('Chọn từ GẦN NGHĨA nhất với "rapid".');
    expect(translatePrompt('What does "luggage" mean?', 'en.vocab.everyday')).toBe('Từ "luggage" nghĩa là gì?');
    expect(translatePrompt('The Eiffel Tower ___ in 1889.', 'en.grammar.passive')).toMatch(/chỗ trống/);
  });

  it('translates maths and logic prompts in full', () => {
    expect(translatePrompt('A rectangle is 5 cm by 7 cm. Find its area (cm²).', 'math.geometry.area')).toBe('Hình chữ nhật có kích thước 5 cm × 7 cm. Tính diện tích (cm²).');
    expect(translatePrompt('You face North. You turn right, then turn around. Which way are you facing now?', 'logic.spatial')).toBe(
      'Bạn đang quay mặt về hướng Bắc. Bạn rẽ phải, rồi quay ngược lại. Bây giờ bạn quay về hướng nào?',
    );
    expect(translatePrompt('An is taller than Binh. Binh is taller than Chi. Who is the shortest?', 'logic.sequence')).toBe('An cao hơn Binh. Binh cao hơn Chi. Ai thấp nhất?');
  });

  it('every generated maths/logic prompt has a Vietnamese translation', () => {
    const missing = new Set<string>();
    for (const [id, gen] of Object.entries(generators)) {
      if (!id.startsWith('math.') && !['logic.patterns', 'logic.spatial', 'logic.sequence'].includes(id)) continue;
      for (let d = 1; d <= 5; d++)
        for (let s = 1; s <= 20; s++) {
          const g = gen(d, rng(s * 13 + d));
          const hasEnglish = /[a-zA-Z]{3,}/.test(g.prompt.replace(/Simplify|Solve|Expand/g, ''));
          if (hasEnglish && !translatePrompt(g.prompt, id)) missing.add(`${id}: ${g.prompt}`);
        }
    }
    expect([...missing]).toEqual([]);
  });

  it('every English prompt gets at least an instruction in Vietnamese', () => {
    const missing = questions.filter((q) => q.conceptId.startsWith('en.') && !translatePrompt(q.prompt, q.conceptId)).map((q) => q.prompt);
    expect(missing).toEqual([]);
  });

  it('generator explanations are translated', () => {
    for (const id of Object.keys(generators).filter((k) => k.startsWith('en.grammar'))) {
      for (let s = 1; s < 60; s++) {
        const g = generators[id](1 + (s % 5), rng(s));
        if (g.explanation) expect(translateExplanation(g.explanation), `${id}: ${g.explanation}`).not.toBeNull();
      }
    }
  });

  it('has Vietnamese lessons for every English, maths and logic concept', () => {
    for (const c of allConcepts().filter((x) => x.subject !== 'literature' && !x.id.startsWith('custom.'))) expect(LESSONS_VI[c.id], c.id).toBeTruthy();
  });

  it('looks up inflected words', () => {
    expect(glossaryLookup('Neighbours')?.vi).toBe('hàng xóm');
    expect(glossaryLookup('delivered')?.vi).toBe('giao (hàng)');
    expect(glossaryLookup('written')?.vi).toBe('viết');
    expect(glossaryLookup('bigger')?.vi).toBe('to, lớn');
    expect(glossaryLookup('the')).toBeUndefined();
  });
});
