import { describe, expect, it } from 'vitest';
import { ED, S, STRESS, SOUND_GROUPS, generators, questions } from '@atlas/content';
import { rng } from '@atlas/shared';
import { translateExplanation, translatePrompt, unmark } from './index';

const gen = (id: string, d: number, s: number) => generators[id](d, rng(s));

describe('pronunciation content', () => {
  it('every stress word has exactly one stressed syllable and no duplicates', () => {
    const seen = new Set<string>();
    for (const w of STRESS) {
      expect(w.syllables.filter((s) => s === s.toUpperCase()), w.display).toHaveLength(1);
      expect(seen.has(w.word), w.word).toBe(false);
      seen.add(w.word);
    }
    expect(STRESS.length).toBeGreaterThan(150);
  });

  it('sound groups never put a word under two sounds, and each mark is one underlined part', () => {
    for (const g of SOUND_GROUPS) {
      const words = Object.values(g.sounds).flat().map(unmark);
      expect(new Set(words).size, g.letters).toBe(words.length);
      for (const w of Object.values(g.sounds).flat()) {
        expect(w.match(/\[/g), w).toHaveLength(1);
        expect(w.match(/\[([^\]]+)\]/)![1].toLowerCase(), w).toBe(g.letters);
      }
    }
  });

  it('existing questions never use square brackets (reserved for underlining)', () => {
    for (const q of questions) for (const t of [q.prompt, ...q.options]) expect(t, q.id).not.toMatch(/\[|\]/);
  });

  it('stress questions have exactly one odd one out with the same syllable count', () => {
    for (let d = 1; d <= 5; d++)
      for (let s = 1; s <= 80; s++) {
        const g = gen('en.pron.stress', d, s * 7 + d);
        const all = [g.answer, ...g.distractors].map((x) => STRESS.find((w) => w.word === x)!);
        expect(all.every(Boolean)).toBe(true);
        expect(new Set(all.map((w) => w.syllables.length)).size).toBe(1);
        const odd = all[0];
        expect(all.slice(1).every((w) => w.stress === all[1].stress)).toBe(true);
        expect(odd.stress).not.toBe(all[1].stress);
      }
  });

  it('-ed and -s word lists follow the pronunciation rules', () => {
    for (const w of ED['/ɪd/']) expect(w, w).toMatch(/[td]ed$/);
    for (const w of ED['/d/']) expect(w, w).not.toMatch(/[td]ed$/);
    // /t/: base ends in a voiceless sound — p, k, f/gh, s/ss/ce, sh, ch, x
    for (const w of ED['/t/']) expect(w, w).toMatch(/(p|k|gh|c|sh|ch|x|s)ed$/);
    for (const w of S['/ɪz/']) expect(w, w).toMatch(/(ses|xes|zes|shes|ches|ges|ces)$/);
    // /s/: base ends in p, t, k, f/gh, th (including silent-e spellings like likes, writes, hopes)
    for (const w of S['/s/']) expect(w, w).toMatch(/(p|t|k|gh|th|pe|te|ke)s$/);
    for (const w of S['/z/']) expect(w, w).not.toMatch(/(ses|xes|zes|shes|ches|ges|ces|ps|ts|ks|ths|ghs|pes|tes|kes)$/);
  });

  it('ending questions mark only the ending', () => {
    for (let s = 1; s <= 120; s++) {
      const g = gen('en.pron.endings', 1 + (s % 5), s);
      for (const o of [g.answer, ...g.distractors]) expect(o).toMatch(/^[a-z]+\[(ed|es|s)\]$/);
    }
  });

  it('sound twins come with audio of the answer', () => {
    for (let s = 1; s <= 40; s++) {
      const g = gen('en.pron.pairs', 1 + (s % 5), s);
      expect(g.audio).toContain(g.answer);
      expect(g.distractors.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('every pronunciation prompt and explanation has Vietnamese', () => {
    for (const id of ['en.pron.stress', 'en.pron.endings', 'en.pron.sounds', 'en.pron.pairs'])
      for (let s = 1; s <= 40; s++) {
        const g = gen(id, 1 + (s % 5), s);
        expect(translatePrompt(g.prompt, id), g.prompt).toBeTruthy();
        expect(translateExplanation(g.explanation), `${id}: ${g.explanation}`).toBeTruthy();
      }
  });
});
