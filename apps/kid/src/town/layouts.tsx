import type { ReactNode } from 'react';
import { Emoji, P, Tree, type Pt } from './iso';
import { Lake, Pitch, RiceField } from './buildings';
import { islandShape, type IslandShape } from './island';
import { REALMS, realmById, type RealmId } from '../lib/realms';

/**
 * Where everything stands, for each map: Home (the middle island and its buildings) and one map per
 * realm, laid out for the screen: a row across for wide screens, a zig-zag down for phones held upright. Positions are in
 * tiles; the view box is worked out from the islands so nothing is ever cut off.
 */

export interface Spot {
  id: string;
  /** Building drawing: a world id, or 'exam-hall' | 'coach' | 'shop' | 'home' | 'realm-…' | 'gate' | … */
  kind: string;
  /** Lot origin (tiles). */
  x: number;
  y: number;
  /** Lot size: 3×3 for a building, 6×6 for the Exam Hall and the realm portals. */
  lot: 3 | 6;
}

export interface Isle {
  id: string;
  x: number;
  y: number;
  w: number;
  d: number;
  seed: number;
  /** How high it floats (px). */
  lift: number;
  /** Where a waterfall pours off the front (0 left … 1 right). */
  falls?: number;
  /** Spots standing on it. */
  spots: string[];
  /** Other things on it. */
  decor?: (s: IslandShape) => ReactNode;
  /** Decor islets have nothing to tap. */
  small?: boolean;
  /** Realm colours (CSS class). */
  cls?: string;
}

export type LayoutId = 'home' | RealmId;

export interface Layout {
  id: LayoutId;
  spots: Spot[];
  /** The middle island and what stands on it. */
  hub: { x: number; y: number; w: number; d: number };
  hubSpots: string[];
  isles: Isle[];
  shapes: Record<string, IslandShape>;
  view: { x: number; y: number; w: number; h: number };
  /** Today's treasure chest (Home only). */
  chest?: [number, number];
  lamps: [number, number][];
  /** Colours for the whole map (a realm), and a night sky. */
  cls?: string;
  night?: boolean;
  /** Spot to look at when nothing else asks. */
  start: string;
}

export const footprint = (s: Spot) => (s.lot === 6 ? { bx: s.x + 1, by: s.y + 1, size: 4 } : { bx: s.x + 0.5, by: s.y + 0.5, size: 2 });

const PAD = 0.95;
const FALLS: Record<string, number> = { 'echo-caves': 0.3, 'geometry-isles': 0.65, 'word-forest': 0.7, 'sound-temple': 0.35, 'realm-english': 0.6, 'realm-literature': 0.4 };
const LIFTS = [0, 14, 6, 20, 10, 2, 16, 8, 22, 4, 12, 18];
const HUB = { x: 3.8, y: 3.8, w: 11.6, d: 11.6 };

/** One island per spot, slightly bigger than its lot. */
const isleFor = (s: Spot, i: number, cls?: string): Isle => ({
  id: s.id,
  x: s.x - PAD,
  y: s.y - PAD,
  w: s.lot + 2 * PAD,
  d: s.lot + 2 * PAD,
  seed: 100 + i * 37,
  lift: LIFTS[i % LIFTS.length],
  falls: FALLS[s.id] ?? FALLS[s.kind],
  spots: [s.id],
  cls,
});

/** Works out the view box from the islands: room above for buildings and tags, below for the cliffs. */
function viewOf(isles: Isle[], shapes: Record<string, IslandShape>, above = 170) {
  const xs = isles.flatMap((i) => shapes[i.id].ring.map((p) => p[0]));
  const tops = isles.flatMap((i) => shapes[i.id].ring.map((p) => p[1] - i.lift));
  const bottoms = isles.map((i) => shapes[i.id].apex[1] - i.lift);
  const x = Math.min(...xs) - 70;
  const y = Math.min(...tops) - above;
  return { x, y, w: Math.max(...xs) + 70 - x, h: Math.max(...bottoms) + 40 - y };
}

/** `above`: sky kept above the highest island, for buildings, tags and the quest bubble. */
function finish(l: Omit<Layout, 'shapes' | 'view'>, above?: number): Layout {
  const shapes = Object.fromEntries(l.isles.map((i) => [i.id, islandShape(i.x, i.y, i.w, i.d, i.seed)]));
  return { ...l, shapes, view: viewOf(l.isles, shapes, above) };
}

// ── Home ────────────────────────────────────────────────────────
const HOME_SPOTS: Spot[] = [
  { id: 'home', kind: 'home', x: 4.6, y: 4.6, lot: 3 },
  { id: 'shop', kind: 'shop', x: 8.2, y: 4.4, lot: 3 },
  { id: 'coach', kind: 'coach', x: 11.8, y: 4.6, lot: 3 },
  { id: 'exam-hall', kind: 'exam-hall', x: 8.6, y: 8.6, lot: 6 },
];
const HOME_HUB = HOME_SPOTS.map((s) => s.id);

const homeLayout = (): Layout =>
  finish({
    id: 'home',
    spots: HOME_SPOTS,
    hub: HUB,
    hubSpots: HOME_HUB,
    start: 'exam-hall',
    isles: [
      { id: 'hub', ...HUB, seed: 11, lift: 0, falls: 0.42, spots: HOME_HUB, decor: () => <Lake x={4.6} y={12} w={2.6} d={2.6} /> },
      { id: 'rice', x: -2.4, y: 7.4, w: 3.4, d: 3.2, seed: 7, lift: 30, spots: [], small: true, decor: () => <RiceField x={-2.1} y={7.7} w={2.8} d={2.6} /> },
      { id: 'pitch', x: 17, y: 6.6, w: 3.8, d: 3, seed: 9, lift: 24, spots: [], small: true, decor: () => <Pitch x={17.3} y={6.9} w={3.2} d={2.4} /> },
      { id: 'tree1', x: 8.6, y: -1.4, w: 1.8, d: 1.8, seed: 21, lift: 40, spots: [], small: true, decor: () => <Tree x={9.5} y={-0.5} s={1.1} /> },
      { id: 'tree2', x: 16.6, y: 16.6, w: 1.6, d: 1.6, seed: 23, lift: 10, spots: [], small: true, decor: () => <Tree x={17.4} y={17.4} s={1} kind="pine" color="#3f8f3a" /> },
    ],
    chest: [7.3, 14.2],
    lamps: [
      [8.0, 8.1],
      [4.3, 7.9],
      [15.0, 8.2],
      [8.2, 15.0],
      [11.8, 8.1],
    ],
  });

// ── Realms ──────────────────────────────────────────────────────
/** Realms without the little scenery islets between their places. */
const PLAIN: RealmId[] = ['english'];

/** Little islets in the empty ring places, in the realm's style. */
const DECOR: Record<RealmId, (x: number, y: number) => ReactNode> = {
  english: (x, y) => <Tree x={x + 1} y={y + 1} s={1.1} />,
  maths: (x, y) => <Emoji at={P(x + 1, y + 1, 12)} size={26}>🌵</Emoji>,
  logic: (x, y) => <Emoji at={P(x + 1, y + 1, 14)} size={24}>💎</Emoji>,
  literature: (x, y) => <Tree x={x + 1} y={y + 1} s={1.1} color="#f3a9c4" />,
};

/**
 * Phones held upright: the gate at the top and the places zig-zagging down in two columns, so a whole
 * realm fits a tall screen. (Positions as across = x − y and down = x + y.)
 */
const tallRealm = (id: RealmId): Layout => {
  const realm = realmById(id)!;
  const at = (a: number, d: number, half: number) => ({ x: (d + a) / 2 - half, y: (d - a) / 2 - half });
  const mid = { ...at(0, 0, 3), w: 6, d: 6 };
  // The way home is a button in the bar above the map, so the realm's places get all the room.
  const spots: Spot[] = realm.places.map((p, i): Spot => ({ id: p, kind: p, ...at(i % 2 ? 7 : -7, i * 6, 1.5), lot: 3 }));
  const rows = realm.places.length;
  const decor = PLAIN.includes(id) ? [] : Array.from({ length: Math.max(0, Math.floor((rows - 1) / 2)) }, (_, k) => at(0, 3 + k * 12, 1.1));
  return finish({
    id,
    spots,
    hub: mid,
    hubSpots: [],
    start: spots[0].id,
    cls: realm.className,
    night: realm.night,
    isles: [
      ...spots.map((sp, i) => isleFor(sp, i + 1)),
      ...decor.map((p, k): Isle => ({ id: `deco${k}`, ...p, w: 2.2, d: 2.2, seed: 60 + k * 9, lift: 26, spots: [], small: true, decor: () => DECOR[id](p.x + 0.1, p.y + 0.1) })),
    ],
    lamps: [],
  });
};

/**
 * Wide screens (laptops, tablets on their side): the places in a row from left to right, gently
 * zig-zagging up and down, so the whole realm fits a wide, short screen without zooming. Little
 * scenery islets sit in the gaps (not in the English realm).
 */
const realmLayout = (id: RealmId, step?: number): Layout => {
  const realm = realmById(id)!;
  const at = (a: number, d: number, half: number) => ({ x: (d + a) / 2 - half, y: (d - a) / 2 - half });
  const n = realm.places.length;
  // Few places: far apart in one gentle row. Many: closer, in two staggered rows.
  step ??= n <= 3 ? 10 : 6.6;
  const rise = n <= 3 ? 3 : 5;
  const across = (i: number) => (i - (n - 1) / 2) * step;
  const spots: Spot[] = realm.places.map((p, i): Spot => ({ id: p, kind: p, ...at(across(i), i % 2 ? rise : -rise, 1.5), lot: 3 }));
  // Scenery islets in the gaps, beside the row (low, so they don't make the map much taller).
  const decor = PLAIN.includes(id) ? [] : Array.from({ length: n - 1 }, (_, k) => at((across(k) + across(k + 1)) / 2, k % 2 ? -rise - 3 : rise + 3, 1.1));
  return finish({
    id,
    spots,
    hub: { ...at(0, 0, 3), w: 6, d: 6 },
    hubSpots: [],
    start: spots[0].id,
    cls: realm.className,
    night: realm.night,
    isles: [
      ...spots.map((sp, i) => isleFor(sp, i + 1)),
      ...decor.map((p, k): Isle => ({ id: `deco${k}`, ...p, w: 2.2, d: 2.2, seed: 50 + k * 7, lift: 8 + (k % 2) * 10, spots: [], small: true, decor: () => DECOR[id](p.x + 0.1, p.y + 0.1) })),
    ],
    lamps: [],
  }, 135);
};

const cache = new Map<string, Layout>();
/** How far apart a wide realm's places can be spread (tiles between neighbours). */
const STEPS: Record<'few' | 'many', [number, number]> = { few: [10, 15], many: [6.6, 9] };

/**
 * A map's layout. `tall` for phones held upright (realms zig-zag down). On wide screens, `aspect`
 * (width ÷ height of the screen's map area) spreads a realm's places out to match its shape, so the
 * realm fills the screen instead of sitting small in the middle with empty sky around it.
 */
export function layoutFor(id: LayoutId, tall = false, aspect?: number): Layout {
  const wide = id !== 'home' && !tall;
  const want = wide && aspect ? Math.round(aspect * 4) / 4 : 0;
  const key = `${id}:${tall && id !== 'home'}:${want}`;
  let l = cache.get(key);
  if (!l) {
    if (id === 'home') l = homeLayout();
    else if (tall) l = tallRealm(id);
    else if (!want) l = realmLayout(id);
    else {
      // The spread whose map is closest to the screen's shape (no wider than it).
      const [lo, hi] = STEPS[realmById(id)!.places.length <= 3 ? 'few' : 'many'];
      l = realmLayout(id, lo);
      for (let st = lo + 0.5; st <= hi; st += 0.5) {
        const c = realmLayout(id, st);
        if (c.view.w / c.view.h > want) break;
        l = c;
      }
    }
    cache.set(key, l);
  }
  return l;
}

export const isleOf = (l: Layout, spotId: string) => l.isles.find((i) => i.spots.includes(spotId))!;

/** Screen point (in map pixels from the view's corner) of a spot's centre, for centring the view. */
export const spotCenter = (l: Layout, s: Spot): Pt => {
  const [x, y] = P(s.x + s.lot / 2, s.y + s.lot / 2);
  return [x - l.view.x, y - l.view.y - 40 - isleOf(l, s.id).lift];
};

export const ALL_REALMS = REALMS.map((r) => r.id);
