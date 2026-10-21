import { getConcept } from '@atlas/knowledge';
import type { Attempt } from '@atlas/shared';

/**
 * Vườn ươm Từ vựng — the Word Garden.
 *
 * Everything he earns comes from vocabulary practice, worked out from his answer history (so it syncs and
 * can't drift): every right answer gives 💧 water, a word he gets right for the first time gives more.
 * Bonuses give special seeds: 🌟 a rare seed for every 10 right answers in a row, 👑 a golden seed for every
 * 25 new words. Water buys seed packets and grows plants; grown plants are harvested for coins and go into
 * the catalogue.
 */

export type Tier = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface Plant {
  id: string;
  en: string;
  vi: string;
  emoji: string;
  tier: Tier;
  /** A small extra sign on legendary plants. */
  badge?: string;
  /** CSS filter for magic colours. */
  filter?: string;
}

export const PLANTS: Plant[] = [
  { id: 'rice', en: 'Rice', vi: 'Lúa', emoji: '🌾', tier: 'common' },
  { id: 'carrot', en: 'Carrot', vi: 'Cà rốt', emoji: '🥕', tier: 'common' },
  { id: 'corn', en: 'Corn', vi: 'Ngô', emoji: '🌽', tier: 'common' },
  { id: 'lettuce', en: 'Lettuce', vi: 'Xà lách', emoji: '🥬', tier: 'common' },
  { id: 'tomato', en: 'Tomato', vi: 'Cà chua', emoji: '🍅', tier: 'common' },
  { id: 'cucumber', en: 'Cucumber', vi: 'Dưa chuột', emoji: '🥒', tier: 'common' },
  { id: 'sunflower', en: 'Sunflower', vi: 'Hoa hướng dương', emoji: '🌻', tier: 'common' },
  { id: 'tulip', en: 'Tulip', vi: 'Hoa tulip', emoji: '🌷', tier: 'common' },
  { id: 'strawberry', en: 'Strawberry', vi: 'Dâu tây', emoji: '🍓', tier: 'uncommon' },
  { id: 'eggplant', en: 'Eggplant', vi: 'Cà tím', emoji: '🍆', tier: 'uncommon' },
  { id: 'chili', en: 'Chilli pepper', vi: 'Ớt', emoji: '🌶️', tier: 'uncommon' },
  { id: 'watermelon', en: 'Watermelon', vi: 'Dưa hấu', emoji: '🍉', tier: 'uncommon' },
  { id: 'rose', en: 'Rose', vi: 'Hoa hồng', emoji: '🌹', tier: 'uncommon' },
  { id: 'mushroom', en: 'Mushroom', vi: 'Nấm', emoji: '🍄', tier: 'uncommon' },
  { id: 'lotus', en: 'Lotus', vi: 'Hoa sen', emoji: '🪷', tier: 'rare' },
  { id: 'peach-blossom', en: 'Peach blossom', vi: 'Hoa đào', emoji: '🌸', tier: 'rare' },
  { id: 'pineapple', en: 'Pineapple', vi: 'Dứa', emoji: '🍍', tier: 'rare' },
  { id: 'mango', en: 'Mango', vi: 'Xoài', emoji: '🥭', tier: 'rare' },
  { id: 'hibiscus', en: 'Hibiscus', vi: 'Hoa dâm bụt', emoji: '🌺', tier: 'rare' },
  { id: 'bamboo', en: 'Bamboo', vi: 'Tre', emoji: '🎋', tier: 'rare' },
  { id: 'golden-lotus', en: 'Golden lotus', vi: 'Sen vàng', emoji: '🪷', tier: 'legendary', badge: '✨', filter: 'sepia(1) saturate(4) hue-rotate(5deg) brightness(1.1)' },
  { id: 'crystal-rose', en: 'Crystal rose', vi: 'Hồng pha lê', emoji: '🌹', tier: 'legendary', badge: '💎', filter: 'hue-rotate(190deg) saturate(1.6) brightness(1.15)' },
  { id: 'rainbow-tulip', en: 'Rainbow tulip', vi: 'Tulip cầu vồng', emoji: '🌷', tier: 'legendary', badge: '🌈', filter: 'hue-rotate(260deg) saturate(2)' },
  { id: 'word-tree', en: 'Dictionary tree', vi: 'Cây Từ điển', emoji: '🌳', tier: 'legendary', badge: '📖' },
];

export const plantOf = (id: string) => PLANTS.find((p) => p.id === id)!;

export const TIER: Record<Tier, { label: string; vi: string; color: string; water: number; coins: number; gems: number }> = {
  common: { label: 'Common', vi: 'Thường', color: '#8a9a5b', water: 6, coins: 10, gems: 0 },
  uncommon: { label: 'Uncommon', vi: 'Khá hiếm', color: '#2f8a3a', water: 9, coins: 18, gems: 0 },
  rare: { label: 'Rare', vi: 'Hiếm', color: '#2563eb', water: 15, coins: 35, gems: 0 },
  legendary: { label: 'Legendary', vi: 'Huyền thoại', color: '#c48a00', water: 24, coins: 70, gems: 1 },
};

/** Growth stages: seed → sprout → bud → grown. Each step costs a third of the plant's water. */
export const STAGES = 3;
export const stepCost = (p: Plant) => TIER[p.tier].water / STAGES;

export const PACKET_COST = 5;
export const START_WATER = 12;
export const STREAK_FOR_RARE = 10;
export const WORDS_FOR_GOLDEN = 25;
export const WORDS_PER_PLOT = 20;
export const MIN_PLOTS = 4;
export const MAX_PLOTS = 9;
/** Chance that a harvest drops a bonus rare seed. */
export const DROP_CHANCE = 0.1;

/** Which concepts count as vocabulary: the Vocabulary world, his textbook's vocabulary units, IELTS word topics. */
export const isVocab = (conceptId: string) =>
  conceptId.startsWith('en.vocab.') || conceptId.startsWith('en.ielts.lex.') || /^custom\.tb\..*\.vocab/.test(conceptId) || getConcept(conceptId)?.domain === 'Vocabulary';

export interface Earned {
  /** Distinct vocabulary questions he has got right at least once. */
  words: number;
  water: number;
  rare: number;
  golden: number;
  plots: number;
  /** Right answers in a row right now (towards the next 🌟). */
  run: number;
}

/** What his vocabulary practice has earned so far. */
export function earned(attempts: Attempt[]): Earned {
  const vocab = attempts.filter((a) => a.context !== 'placement' && isVocab(a.conceptId)).sort((a, b) => a.createdAt - b.createdAt);
  const seen = new Set<string>();
  let water = START_WATER;
  let rare = 0;
  let run = 0;
  for (const a of vocab) {
    if (!a.correct) {
      run = 0;
      continue;
    }
    water += seen.has(a.questionId) ? 1 : 3;
    seen.add(a.questionId);
    if (++run === STREAK_FOR_RARE) {
      rare++;
      run = 0;
    }
  }
  const words = seen.size;
  return { words, water, rare, golden: Math.floor(words / WORDS_FOR_GOLDEN), run, plots: Math.min(MAX_PLOTS, MIN_PLOTS + Math.floor(words / WORDS_PER_PLOT)) };
}

export type SeedKind = 'packet' | 'rare' | 'golden';

export interface Bed {
  plant: string;
  /** 0 just planted … STAGES grown. */
  stage: number;
  plantedAt: number;
  /** A word he learned, on the plant's little tag. */
  word?: string;
}

export interface GardenState {
  beds: (Bed | null)[];
  spent: { water: number; rare: number; golden: number };
  /** Rare seeds dropped by harvests. */
  dropped: number;
  /** Harvest count per plant: the catalogue. */
  found: Record<string, number>;
  /** Water he had when he last opened the garden (for "+N since last time"). */
  seenWater: number;
  /** Catalogue rows he has completed (each gives a 👑 golden seed once). */
  tiersDone?: Tier[];
}

export const gardenKey = (studentId: string) => `garden:${studentId}`;
export const emptyGarden = (): GardenState => ({ beds: [], spent: { water: 0, rare: 0, golden: 0 }, dropped: 0, found: {}, seenWater: 0 });

export interface Wallet {
  water: number;
  rare: number;
  golden: number;
}

export const walletOf = (e: Earned, g: GardenState): Wallet => ({
  water: e.water - g.spent.water,
  rare: e.rare + g.dropped - g.spent.rare,
  golden: e.golden + (g.tiersDone?.length ?? 0) - g.spent.golden,
});

/** Pick a plant from a seed: packets give common (mostly) or uncommon; rare seeds rare (1 in 8 legendary); golden seeds legendary or rare. */
export function rollPlant(kind: SeedKind, found: Record<string, number>, rand = Math.random): Plant {
  const r = rand();
  const tier: Tier = kind === 'packet' ? (r < 0.75 ? 'common' : 'uncommon') : kind === 'rare' ? (r < 0.875 ? 'rare' : 'legendary') : r < 0.7 ? 'legendary' : 'rare';
  const pool = PLANTS.filter((p) => p.tier === tier);
  // Lean towards plants he hasn't found yet, so the catalogue keeps filling.
  const fresh = pool.filter((p) => !found[p.id]);
  const from = fresh.length && rand() < 0.6 ? fresh : pool;
  return from[Math.floor(rand() * from.length) % from.length];
}

export type Act = { ok: true; garden: GardenState; plant?: Plant } | { ok: false; why: string };

const setBed = (beds: (Bed | null)[], i: number, b: Bed | null) => {
  const out = beds.slice();
  while (out.length <= i) out.push(null);
  out[i] = b;
  return out;
};

export function plant(g: GardenState, w: Wallet, plots: number, i: number, kind: SeedKind, word: string | undefined, now: number, rand = Math.random): Act {
  if (i >= plots) return { ok: false, why: 'That bed is still locked.' };
  if (g.beds[i]) return { ok: false, why: 'Something is already growing there.' };
  if (kind === 'packet' && w.water < PACKET_COST) return { ok: false, why: `A seed packet costs ${PACKET_COST} 💧.` };
  if (kind !== 'packet' && w[kind] < 1) return { ok: false, why: 'No seeds of that kind yet.' };
  const p = rollPlant(kind, g.found, rand);
  const spent = { ...g.spent };
  if (kind === 'packet') spent.water += PACKET_COST;
  else spent[kind] += 1;
  return { ok: true, plant: p, garden: { ...g, spent, beds: setBed(g.beds, i, { plant: p.id, stage: 0, plantedAt: now, word }) } };
}

export function water(g: GardenState, w: Wallet, i: number): Act {
  const b = g.beds[i];
  if (!b) return { ok: false, why: 'Nothing planted there.' };
  if (b.stage >= STAGES) return { ok: false, why: 'Already grown — harvest it!' };
  const cost = stepCost(plantOf(b.plant));
  if (w.water < cost) return { ok: false, why: `Needs ${cost} 💧 — learn more words to get water.` };
  return { ok: true, garden: { ...g, spent: { ...g.spent, water: g.spent.water + cost }, beds: setBed(g.beds, i, { ...b, stage: b.stage + 1 }) } };
}

export interface Harvest {
  plant: Plant;
  first: boolean;
  drop: boolean;
  coins: number;
  gems: number;
  bed: Bed;
  /** This harvest completed a whole row of the catalogue. */
  tierDone?: Tier;
}

export function harvest(g: GardenState, i: number, rand = Math.random): { garden: GardenState; result: Harvest } | { why: string } {
  const b = g.beds[i];
  if (!b || b.stage < STAGES) return { why: 'Not ready yet.' };
  const p = plantOf(b.plant);
  const first = !g.found[p.id];
  const drop = rand() < DROP_CHANCE;
  const t = TIER[p.tier];
  const found = { ...g.found, [p.id]: (g.found[p.id] ?? 0) + 1 };
  const done = g.tiersDone ?? [];
  const tierDone = first && !done.includes(p.tier) && PLANTS.filter((x) => x.tier === p.tier).every((x) => found[x.id]) ? p.tier : undefined;
  return {
    garden: { ...g, beds: setBed(g.beds, i, null), found, dropped: g.dropped + (drop ? 1 : 0), tiersDone: tierDone ? [...done, tierDone] : done },
    result: { plant: p, first, drop, coins: t.coins, gems: t.gems + (first ? 1 : 0), bed: b, tierDone },
  };
}
