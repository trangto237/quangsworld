import { getConcept } from '@atlas/knowledge';
import type { Attempt } from '@atlas/shared';

/**
 * Vườn ươm Từ vựng — the Word Garden. A farming game where tending the garden IS learning:
 * - every seed packet is a vocabulary topic; he plants it in a bed;
 * - watering a bed = a word card from its topic; each right answer makes it grow;
 * - a grown plant asks one last word to harvest it (coins, and new plants go into the catalogue);
 * - bugs show up on beds whose topic is due for review; answer to chase them off;
 * - now and then (every few harvests, or after a few days) the bugs invade: a Pest Patrol boss fight.
 * Bonus seeds come from his answers: 🌟 for 10 right in a row, 👑 for every 25 new words. More beds open
 * as he learns more words.
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

export const plantOf = (id: string) => PLANTS.find((p) => p.id === id) ?? PLANTS[0];

/** Right answers a plant needs to grow, and what it pays at harvest. */
export const TIER: Record<Tier, { label: string; vi: string; color: string; need: number; coins: number; gems: number }> = {
  common: { label: 'Common', vi: 'Thường', color: '#8a9a5b', need: 3, coins: 12, gems: 0 },
  uncommon: { label: 'Uncommon', vi: 'Khá hiếm', color: '#2f8a3a', need: 4, coins: 20, gems: 0 },
  rare: { label: 'Rare', vi: 'Hiếm', color: '#2563eb', need: 5, coins: 35, gems: 0 },
  legendary: { label: 'Legendary', vi: 'Huyền thoại', color: '#c48a00', need: 6, coins: 70, gems: 1 },
};

/** Drawn growth stages: seed → sprout → young plant → grown. */
export const STAGES = 3;
export const STREAK_FOR_RARE = 10;
export const WORDS_FOR_GOLDEN = 25;
export const WORDS_PER_PLOT = 20;
export const MIN_PLOTS = 4;
export const MAX_PLOTS = 9;
/** Chance that a harvest drops a bonus rare seed. */
export const DROP_CHANCE = 0.1;
/** The bugs invade after this many harvests, or after this long with something growing. */
export const INVASION_HARVESTS = 5;
export const INVASION_DAYS = 3;
const DAY = 86_400_000;

/** Which concepts count as vocabulary: the Vocabulary world, his textbook's vocabulary units, IELTS word topics. */
export const isVocab = (conceptId: string) =>
  conceptId.startsWith('en.vocab.') || conceptId.startsWith('en.ielts.lex.') || /^custom\.tb\..*\.vocab/.test(conceptId) || getConcept(conceptId)?.domain === 'Vocabulary';

export interface Earned {
  /** Distinct vocabulary questions he has got right at least once. */
  words: number;
  rare: number;
  golden: number;
  plots: number;
  /** Right answers in a row right now (towards the next 🌟). */
  run: number;
}

/** What his vocabulary answers (in the garden or anywhere else) have earned so far. */
export function earned(attempts: Attempt[]): Earned {
  const vocab = attempts.filter((a) => a.context !== 'placement' && isVocab(a.conceptId)).sort((a, b) => a.createdAt - b.createdAt);
  const seen = new Set<string>();
  let rare = 0;
  let run = 0;
  for (const a of vocab) {
    if (!a.correct) {
      run = 0;
      continue;
    }
    seen.add(a.questionId);
    if (++run === STREAK_FOR_RARE) {
      rare++;
      run = 0;
    }
  }
  const words = seen.size;
  return { words, rare, golden: Math.floor(words / WORDS_FOR_GOLDEN), run, plots: Math.min(MAX_PLOTS, MIN_PLOTS + Math.floor(words / WORDS_PER_PLOT)) };
}

export type SeedKind = 'packet' | 'rare' | 'golden';

export interface Bed {
  plant: string;
  /** The vocabulary topic (concept) this bed grows from. */
  topic: string;
  /** Right answers so far, of `need`. */
  grown: number;
  need: number;
  plantedAt: number;
  /** Older saves: a stage instead of answers. */
  stage?: number;
}

export interface GardenState {
  beds: (Bed | null)[];
  spent: { rare: number; golden: number };
  /** Rare seeds dropped by harvests. */
  dropped: number;
  /** Harvest count per plant: the catalogue. */
  found: Record<string, number>;
  /** Catalogue rows he has completed (each gives a 👑 golden seed once). */
  tiersDone?: Tier[];
  /** Harvests ever. */
  harvests?: number;
  /** When he first planted. */
  startedAt?: number;
  /** The last bug invasion he beat: when, and at how many harvests. */
  boss?: { at: number; harvests: number; wins: number };
}

export const gardenKey = (studentId: string) => `garden:${studentId}`;
export const emptyGarden = (): GardenState => ({ beds: [], spent: { rare: 0, golden: 0 }, dropped: 0, found: {} });

/** Reads a saved garden, filling in what older saves don't have. */
export function normalize(g: Partial<GardenState> | undefined | null): GardenState {
  const base = emptyGarden();
  if (!g) return base;
  return {
    ...base,
    ...g,
    spent: { rare: g.spent?.rare ?? 0, golden: g.spent?.golden ?? 0 },
    beds: (g.beds ?? []).map((b) => {
      if (!b) return null;
      const need = b.need ?? TIER[plantOf(b.plant).tier].need;
      return { ...b, topic: b.topic ?? 'en.vocab.everyday', need, grown: b.grown ?? Math.round(((b.stage ?? 0) / STAGES) * need) };
    }),
  };
}

export interface Wallet {
  rare: number;
  golden: number;
}

export const walletOf = (e: Earned, g: GardenState): Wallet => ({
  rare: e.rare + g.dropped - g.spent.rare,
  golden: e.golden + (g.tiersDone?.length ?? 0) + (g.boss?.wins ?? 0) - g.spent.golden,
});

/** Drawn stage of a bed (0 seed … STAGES grown). */
export const stageOf = (b: Bed) => (b.grown >= b.need ? STAGES : Math.min(STAGES - 1, Math.floor((b.grown / b.need) * STAGES)));
export const isReady = (b: Bed) => b.grown >= b.need;

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

export function plant(g: GardenState, w: Wallet, plots: number, i: number, kind: SeedKind, topic: string, now: number, rand = Math.random): Act {
  if (i >= plots) return { ok: false, why: 'That bed is still locked.' };
  if (g.beds[i]) return { ok: false, why: 'Something is already growing there.' };
  if (kind !== 'packet' && w[kind] < 1) return { ok: false, why: 'No seeds of that kind yet.' };
  const p = rollPlant(kind, g.found, rand);
  const spent = { ...g.spent };
  if (kind !== 'packet') spent[kind] += 1;
  return {
    ok: true,
    plant: p,
    garden: { ...g, spent, startedAt: g.startedAt ?? now, beds: setBed(g.beds, i, { plant: p.id, topic, grown: 0, need: TIER[p.tier].need, plantedAt: now }) },
  };
}

/** A right answer on a bed's word card: it grows one step. */
export function grow(g: GardenState, i: number): Act {
  const b = g.beds[i];
  if (!b) return { ok: false, why: 'Nothing planted there.' };
  if (isReady(b)) return { ok: false, why: 'Already grown — harvest it!' };
  return { ok: true, garden: { ...g, beds: setBed(g.beds, i, { ...b, grown: b.grown + 1 }) } };
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
  if (!b || !isReady(b)) return { why: 'Not ready yet.' };
  const p = plantOf(b.plant);
  const first = !g.found[p.id];
  const drop = rand() < DROP_CHANCE;
  const t = TIER[p.tier];
  const found = { ...g.found, [p.id]: (g.found[p.id] ?? 0) + 1 };
  const done = g.tiersDone ?? [];
  const tierDone = first && !done.includes(p.tier) && PLANTS.filter((x) => x.tier === p.tier).every((x) => found[x.id]) ? p.tier : undefined;
  return {
    garden: { ...g, beds: setBed(g.beds, i, null), found, dropped: g.dropped + (drop ? 1 : 0), tiersDone: tierDone ? [...done, tierDone] : done, harvests: (g.harvests ?? 0) + 1 },
    result: { plant: p, first, drop, coins: t.coins, gems: t.gems + (first ? 1 : 0), bed: b, tierDone },
  };
}

/**
 * Time for a bug invasion (the garden's boss): after INVASION_HARVESTS harvests since the last one he beat,
 * or after INVASION_DAYS days with at least two beds growing.
 */
export function invasionDue(g: GardenState, now: number): boolean {
  const since = (g.harvests ?? 0) - (g.boss?.harvests ?? 0);
  if (since >= INVASION_HARVESTS) return true;
  const growing = g.beds.filter(Boolean).length;
  const last = g.boss?.at ?? g.startedAt;
  return last != null && growing >= 2 && now - last >= INVASION_DAYS * DAY;
}

/** He beat the invasion: the clock restarts and he wins a golden seed. */
export const beatInvasion = (g: GardenState, now: number): GardenState => ({ ...g, boss: { at: now, harvests: g.harvests ?? 0, wins: (g.boss?.wins ?? 0) + 1 } });

/** The bug invasion's mission id starts with this, so the battle knows to report back to the garden. */
export const INVASION_ID = 'garden-invasion-';
