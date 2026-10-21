import { describe, expect, it } from 'vitest';
import type { Attempt } from '@atlas/shared';
import {
  INVASION_DAYS,
  INVASION_HARVESTS,
  PLANTS,
  STAGES,
  TIER,
  beatInvasion,
  earned,
  emptyGarden,
  grow,
  harvest,
  invasionDue,
  isReady,
  isVocab,
  normalize,
  plant,
  rollPlant,
  stageOf,
  walletOf,
  type GardenState,
} from './garden';

let n = 0;
const at = (questionId: string, correct: boolean, conceptId = 'en.vocab.everyday', context: Attempt['context'] = 'mission'): Attempt => ({
  id: `a${n}`,
  studentId: 's',
  questionId,
  conceptId,
  correct,
  difficulty: 3,
  msSpent: 1000,
  context,
  createdAt: ++n,
});
const DAY = 86_400_000;

describe('word garden', () => {
  it('knows vocabulary concepts', () => {
    expect(isVocab('en.vocab.synonyms')).toBe(true);
    expect(isVocab('en.ielts.lex.health')).toBe(true);
    expect(isVocab('custom.tb.gs9-u7.vocabulary')).toBe(true);
    expect(isVocab('en.grammar.passive')).toBe(false);
    expect(isVocab('custom.tb.gs9-u7.grammar')).toBe(false);
  });

  it('counts new words, ignoring the trial and other subjects', () => {
    const e = earned([at('q1', true), at('q1', true), at('q2', false), at('q3', true, 'en.grammar.passive'), at('q4', true, 'en.vocab.everyday', 'placement')]);
    expect(e.words).toBe(1);
  });

  it('gives a rare seed for 10 right in a row and a golden seed per 25 new words', () => {
    const run = Array.from({ length: 10 }, (_, i) => at(`w${i}`, true));
    expect(earned(run).rare).toBe(1);
    expect(earned([...run.slice(0, 9), at('x', false), at('y', true)]).rare).toBe(0);
    expect(earned(Array.from({ length: 25 }, (_, i) => at(`g${i}`, true))).golden).toBe(1);
  });

  it('opens more beds as he learns more words', () => {
    expect(earned([]).plots).toBe(4);
    expect(earned(Array.from({ length: 45 }, (_, i) => at(`p${i}`, true))).plots).toBe(6);
  });

  it('plants a topic, grows one step per right answer, then harvests', () => {
    let g = emptyGarden();
    const r = plant(g, { rare: 0, golden: 0 }, 4, 0, 'packet', 'en.vocab.synonyms', 1, () => 0.1);
    if (!r.ok) throw new Error(r.why);
    g = r.garden;
    const bed = g.beds[0]!;
    expect(bed.topic).toBe('en.vocab.synonyms');
    expect(bed.need).toBe(TIER[r.plant!.tier].need);
    expect(stageOf(bed)).toBe(0);
    expect(harvest(g, 0)).toHaveProperty('why');
    for (let s = 0; s < bed.need; s++) {
      const w = grow(g, 0);
      if (!w.ok) throw new Error(w.why);
      g = w.garden;
    }
    expect(isReady(g.beds[0]!)).toBe(true);
    expect(stageOf(g.beds[0]!)).toBe(STAGES);
    expect(grow(g, 0).ok).toBe(false);
    const h = harvest(g, 0, () => 0.99);
    if ('why' in h) throw new Error(h.why);
    expect(h.result.first).toBe(true);
    expect(h.garden.found[r.plant!.id]).toBe(1);
    expect(h.garden.harvests).toBe(1);
    expect(h.garden.beds[0]).toBeNull();
  });

  it('special seeds need to be earned; locked beds stay locked', () => {
    const g = emptyGarden();
    expect(plant(g, { rare: 0, golden: 0 }, 4, 0, 'rare', 'en.vocab.everyday', 1).ok).toBe(false);
    expect(plant(g, { rare: 1, golden: 0 }, 4, 0, 'rare', 'en.vocab.everyday', 1).ok).toBe(true);
    expect(plant(g, { rare: 9, golden: 9 }, 4, 5, 'packet', 'en.vocab.everyday', 1).ok).toBe(false);
  });

  it('seeds roll the right tiers; every tier has plants', () => {
    for (const t of Object.keys(TIER)) expect(PLANTS.some((p) => p.tier === t)).toBe(true);
    expect(rollPlant('packet', {}, () => 0.9).tier).toBe('uncommon');
    expect(rollPlant('rare', {}, () => 0.5).tier).toBe('rare');
    expect(rollPlant('golden', {}, () => 0.2).tier).toBe('legendary');
    expect(new Set(PLANTS.map((p) => p.id)).size).toBe(PLANTS.length);
  });

  it('a completed catalogue row gives a golden seed once', () => {
    const commons = PLANTS.filter((p) => p.tier === 'common');
    const g: GardenState = { ...emptyGarden(), found: Object.fromEntries(commons.slice(1).map((p) => [p.id, 1])), beds: [{ plant: commons[0].id, topic: 't', grown: 3, need: 3, plantedAt: 1 }] };
    const h = harvest(g, 0, () => 0.99);
    if ('why' in h) throw new Error(h.why);
    expect(h.result.tierDone).toBe('common');
    expect(walletOf(earned([]), h.garden).golden).toBe(1);
  });

  it('reads older saves that counted stages instead of answers', () => {
    const g = normalize({ beds: [{ plant: 'tomato', stage: 3, plantedAt: 1 } as never, null], found: {}, dropped: 0, spent: { water: 5 } as never });
    expect(g.beds[0]!.topic).toBe('en.vocab.everyday');
    expect(isReady(g.beds[0]!)).toBe(true);
    expect(g.spent).toEqual({ rare: 0, golden: 0 });
  });
});

describe('bug invasion', () => {
  const growing = (g: GardenState): GardenState => ({ ...g, beds: [{ plant: 'tomato', topic: 't', grown: 0, need: 3, plantedAt: 1 }, { plant: 'corn', topic: 't', grown: 1, need: 3, plantedAt: 1 }] });

  it('comes after a run of harvests', () => {
    expect(invasionDue({ ...emptyGarden(), harvests: INVASION_HARVESTS - 1 }, 0)).toBe(false);
    expect(invasionDue({ ...emptyGarden(), harvests: INVASION_HARVESTS }, 0)).toBe(true);
  });

  it('comes after a few days with things growing', () => {
    const g = growing({ ...emptyGarden(), startedAt: 0 });
    expect(invasionDue(g, (INVASION_DAYS - 1) * DAY)).toBe(false);
    expect(invasionDue(g, INVASION_DAYS * DAY)).toBe(true);
    expect(invasionDue({ ...g, beds: [] }, INVASION_DAYS * DAY)).toBe(false);
  });

  it('beating it resets the clock and pays a golden seed', () => {
    const g = beatInvasion(growing({ ...emptyGarden(), startedAt: 0, harvests: 7 }), 10 * DAY);
    expect(invasionDue(g, 10 * DAY + 1)).toBe(false);
    expect(walletOf(earned([]), g).golden).toBe(1);
  });
});
