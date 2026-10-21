import { describe, expect, it } from 'vitest';
import { ED, S, STRESS, analyseStress, coach, endingDrill, lastSound, pickQuestion, soundDrill, stressDrill, whyNot, mistakeNote, wordsForRule, STRESS_RULES, exceptionNote } from './index';
import { allConcepts } from './graph';

const seeded = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

describe('Coach', () => {
  it('explains every stress word with a rule; every exception is deliberate and explained', () => {
    const analyses = STRESS.map(analyseStress);
    const exceptions = analyses.filter((a) => a.exception);
    expect(exceptions.length).toBeLessThan(STRESS.length * 0.15);
    // An exception without a note would mean a rule is wrong, not a word to learn by heart.
    for (const a of exceptions) expect(exceptionNote(a).en, a.word.word).not.toMatch(/^Breaks the rule/);
    for (const r of STRESS_RULES) expect(wordsForRule(r.id).length, r.id).toBeGreaterThan(0);
  });

  it('finds the last sound of every -ed and -s word consistently with its ending', () => {
    for (const w of ED['/ɪd/']) expect(lastSound(w, 'ed')[1], w).toMatch(/\/[td]\//);
    for (const w of ED['/t/']) expect(lastSound(w, 'ed')[1], w).toMatch(/\/(p|k|f|s|ʃ|tʃ|ks|θ)\//);
    for (const w of ED['/d/']) expect(lastSound(w, 'ed')[1], w).not.toMatch(/\/(p|k|f|s|ʃ|tʃ|ks|θ|t|d)\//);
    for (const w of S['/ɪz/']) expect(lastSound(w, 's')[1], w).toMatch(/\/(s|z|ʃ|tʃ|dʒ|ks)\//);
    for (const w of S['/s/']) expect(lastSound(w, 's')[1], w).toMatch(/\/(p|t|k|f|θ)\//);
    for (const w of S['/z/']) expect(lastSound(w, 's')[1], w).not.toMatch(/\/(p|t|k|f|θ|s|ʃ|tʃ|ks)\//);
  });

  it('gives a plan for questions of every concept without crashing', () => {
    const r = seeded(7);
    for (const c of allConcepts())
      for (let d = 1; d <= 5; d++) {
        const q = pickQuestion({ conceptId: c.id, difficulty: d, rand: r });
        if (!q) continue;
        const plan = coach(q, r);
        expect(plan.steps.length, c.id).toBeGreaterThan(0);
        expect(plan.hint.en.length).toBeGreaterThan(0);
        for (const s of plan.steps) expect(s.title.vi.length, c.id).toBeGreaterThan(0);
        // The hint never names the answer for pronunciation questions.
        if (c.id.startsWith('en.pron') && q.type !== 'input') expect(plan.hint.en).not.toContain(q.options[q.answer]);
      }
  });

  it('stress plans name the right odd one out and drill real words', () => {
    const r = seeded(3);
    for (let i = 0; i < 30; i++) {
      const q = pickQuestion({ conceptId: 'en.pron.stress', difficulty: 1 + (i % 5), rand: r })!;
      const plan = coach(q, r);
      expect(plan.steps[2].body!.en).toContain(`"${q.options[q.answer]}"`);
      expect(plan.drill.length).toBeGreaterThan(0);
      for (const d of plan.drill) if (d.kind === 'stress') expect(STRESS.some((w) => w.display === d.display)).toBe(true);
    }
  });

  it('drills have their answer among the options', () => {
    const r = seeded(11);
    for (const d of [...endingDrill('both', r, 30), ...soundDrill(null, r, 30)]) if (d.kind === 'choice') expect(d.options).toContain(d.answer);
    expect(stressDrill('before-suffix', r, 3)).toHaveLength(3);
  });

  it('says why a wrong tense is wrong', () => {
    const q = { id: 't', conceptId: 'en.grammar.tenses', prompt: 'When we arrived, they ___ the film.', options: ['had already seen', 'have already seen'], answer: 0, difficulty: 4, type: 'mcq' } as never;
    expect(whyNot(q, 'have already seen')?.en).toContain('present perfect');
    expect(coach(q).steps[0].chips?.length).toBeGreaterThan(0);
  });
});

describe('mistakeNote', () => {
  it('explains a wrong stress pick in terms of the words in the question', () => {
    const q = { id: 'x', conceptId: 'en.pron.stress', prompt: '', options: ['musician', 'understand', 'unemployed', 'engineer'], answer: 0, difficulty: 3 } as never;
    const note = mistakeNote(q, 'understand')!;
    expect(note[0].en).toContain('un-der-STAND');
    expect(note[0].en).toContain('3rd syllable');
    expect(note.some((n) => n.en.includes('mu-SI-cian'))).toBe(true);
    expect(mistakeNote(q, 'musician')).toBeNull();
  });
});

describe('mistakeNote for sounds', () => {
  it('names the picked word and the odd one for every generated sounds/endings question it can explain', () => {
    const r = seeded(7);
    let explained = 0;
    for (let i = 0; i < 40; i++) {
      for (const c of ['en.pron.endings', 'en.pron.sounds']) {
        const q = pickQuestion({ conceptId: c, difficulty: 3, rand: r });
        if (!q) continue;
        const wrong = q.options.find((_, j) => j !== q.answer)!;
        const note = mistakeNote(q, wrong);
        if (!note) continue;
        explained++;
        expect(note[0].en).toContain('You picked');
      }
    }
    expect(explained).toBeGreaterThan(20);
  });
});
