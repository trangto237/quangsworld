import { describe, expect, it } from 'vitest';
import type { Attempt } from '@atlas/shared';
import { PACKET_COST, PLANTS, START_WATER, STAGES, TIER, earned, emptyGarden, harvest, isVocab, plant, plantOf, rollPlant, stepCost, walletOf, water } from './garden';

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

describe('word garden', () => {
  it('knows vocabulary concepts', () => {
    expect(isVocab('en.vocab.synonyms')).toBe(true);
    expect(isVocab('en.ielts.lex.health')).toBe(true);
    expect(isVocab('custom.tb.gs9-u7.vocabulary')).toBe(true);
    expect(isVocab('en.grammar.passive')).toBe(false);
    expect(isVocab('custom.tb.gs9-u7.grammar')).toBe(false);
  });

  it('pays more for new words than for repeats, and ignores the trial and other subjects', () => {
    const e = earned([at('q1', true), at('q1', true), at('q2', false), at('q3', true, 'en.grammar.passive'), at('q4', true, 'en.vocab.everyday', 'placement')]);
    expect(e.words).toBe(1);
    expect(e.water).toBe(START_WATER + 3 + 1);
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

  it('plants, waters and harvests', () => {
    const e = earned(Array.from({ length: 20 }, (_, i) => at(`h${i}`, true)));
    let g = emptyGarden();
    const r = plant(g, walletOf(e, g), e.plots, 0, 'packet', 'resilient', 1, () => 0.1);
    if (!r.ok) throw new Error(r.why);
    g = r.garden;
    expect(g.spent.water).toBe(PACKET_COST);
    expect(r.plant!.tier).toBe('common');
    expect(harvest(g, 0)).toHaveProperty('why');
    for (let s = 0; s < STAGES; s++) {
      const w = water(g, walletOf(e, g), 0);
      if (!w.ok) throw new Error(w.why);
      g = w.garden;
    }
    expect(water(g, walletOf(e, g), 0).ok).toBe(false);
    const h = harvest(g, 0, () => 0.99);
    if ('why' in h) throw new Error(h.why);
    expect(h.result.first).toBe(true);
    expect(h.result.coins).toBe(TIER.common.coins);
    expect(h.garden.found[r.plant!.id]).toBe(1);
    expect(h.garden.beds[0]).toBeNull();
    expect(h.garden.spent.water).toBe(PACKET_COST + stepCost(plantOf(r.plant!.id)) * STAGES);
  });

  it('refuses without enough water or seeds, or on a locked bed', () => {
    const g = emptyGarden();
    expect(plant(g, { water: 2, rare: 0, golden: 0 }, 4, 0, 'packet', undefined, 1).ok).toBe(false);
    expect(plant(g, { water: 99, rare: 0, golden: 0 }, 4, 0, 'rare', undefined, 1).ok).toBe(false);
    expect(plant(g, { water: 99, rare: 0, golden: 0 }, 4, 5, 'packet', undefined, 1).ok).toBe(false);
  });

  it('every tier has plants, water costs split evenly into stages, and seeds roll the right tiers', () => {
    for (const t of Object.keys(TIER)) expect(PLANTS.some((p) => p.tier === t)).toBe(true);
    for (const p of PLANTS) expect(Number.isInteger(stepCost(p))).toBe(true);
    expect(rollPlant('packet', {}, () => 0.9).tier).toBe('uncommon');
    expect(rollPlant('rare', {}, () => 0.5).tier).toBe('rare');
    expect(rollPlant('golden', {}, () => 0.2).tier).toBe('legendary');
    expect(new Set(PLANTS.map((p) => p.id)).size).toBe(PLANTS.length);
  });
});

describe('catalogue rows', () => {
  it('a completed row gives a golden seed once', () => {
    const commons = PLANTS.filter((p) => p.tier === 'common');
    let g = { ...emptyGarden(), found: Object.fromEntries(commons.slice(1).map((p) => [p.id, 1])) };
    g = { ...g, beds: [{ plant: commons[0].id, stage: STAGES, plantedAt: 1 }] };
    const h = harvest(g, 0, () => 0.99);
    if ('why' in h) throw new Error(h.why);
    expect(h.result.tierDone).toBe('common');
    expect(walletOf(earned([]), h.garden).golden).toBe(1);
    const again = harvest({ ...h.garden, beds: [{ plant: commons[0].id, stage: STAGES, plantedAt: 2 }] }, 0, () => 0.99);
    if ('why' in again) throw new Error(again.why);
    expect(again.result.tierDone).toBeUndefined();
  });
});
