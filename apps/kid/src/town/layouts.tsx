import type { ReactNode } from 'react';
import { Emoji, P, Tree, type Pt } from './iso';
import { Lake, Pitch, RiceField } from './buildings';
import { islandShape, type IslandShape } from './island';
import { REALMS, realmById, type RealmId } from '../lib/realms';

/**
 * Where everything stands, for each map: Home (the middle island and a portal island per realm) and one
 * map per realm (a gate island in the middle, the realm's places in a ring around it). Positions are in
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
function viewOf(isles: Isle[], shapes: Record<string, IslandShape>) {
  const xs = isles.flatMap((i) => shapes[i.id].ring.map((p) => p[0]));
  const tops = isles.flatMap((i) => shapes[i.id].ring.map((p) => p[1] - i.lift));
  const bottoms = isles.map((i) => shapes[i.id].apex[1] - i.lift);
  const x = Math.min(...xs) - 70;
  const y = Math.min(...tops) - 170;
  return { x, y, w: Math.max(...xs) + 70 - x, h: Math.max(...bottoms) + 40 - y };
}

function finish(l: Omit<Layout, 'shapes' | 'view'>): Layout {
  const shapes = Object.fromEntries(l.isles.map((i) => [i.id, islandShape(i.x, i.y, i.w, i.d, i.seed)]));
  return { ...l, shapes, view: viewOf(l.isles, shapes) };
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
/** Twelve places in a ring round the middle island (lot origins). */
const RING: [number, number][] = [
  [-4.4, -4.4],
  [4.1, -5.6],
  [12.1, -5.0],
  [19.8, -4.4],
  [21.0, 3.9],
  [20.4, 12.1],
  [19.8, 19.8],
  [12.1, 20.4],
  [3.9, 21.0],
  [-4.4, 19.8],
  [-5.0, 12.1],
  [-5.6, 4.1],
];
/** Which ring places each realm uses, spread round the circle. */
const SLOTS: Record<RealmId, number[]> = {
  english: [0, 1, 2, 4, 6, 8, 9, 11],
  maths: [1, 5, 9],
  logic: [1, 5, 9],
  literature: [2, 8],
};
/** Little islets in the empty ring places, in the realm's style. */
const DECOR: Record<RealmId, (x: number, y: number) => ReactNode> = {
  english: (x, y) => <Tree x={x + 1} y={y + 1} s={1.1} />,
  maths: (x, y) => <Emoji at={P(x + 1, y + 1, 12)} size={26}>🌵</Emoji>,
  logic: (x, y) => <Emoji at={P(x + 1, y + 1, 14)} size={24}>💎</Emoji>,
  literature: (x, y) => <Tree x={x + 1} y={y + 1} s={1.1} color="#f3a9c4" />,
};
const MIDDLE = { x: 5.4, y: 5.4, w: 8.4, d: 8.4 };
/** The middle of a realm: its gate home, and a few things of the realm around it. */
const MIDDLE_DECOR: Record<RealmId, () => ReactNode> = {
  english: () => (
    <>
      <Tree x={6.4} y={6.6} s={1.2} kind="pine" color="#3f8f3a" />
      <Tree x={12.6} y={7} s={1.1} />
      <Lake x={6.2} y={10.6} w={2.2} d={2.2} />
    </>
  ),
  maths: () => (
    <>
      <Emoji at={P(6.6, 7, 14)} size={30}>
        🌵
      </Emoji>
      <Emoji at={P(12.4, 11.6, 10)} size={24}>
        🗿
      </Emoji>
      <Emoji at={P(6.8, 12, 10)} size={26}>
        🏺
      </Emoji>
    </>
  ),
  logic: () => (
    <>
      <Emoji at={P(6.6, 7, 14)} size={28}>
        💎
      </Emoji>
      <Emoji at={P(12.4, 11.4, 12)} size={24}>
        🔮
      </Emoji>
      <Emoji at={P(6.8, 12, 12)} size={24}>
        🛰️
      </Emoji>
    </>
  ),
  literature: () => (
    <>
      <Tree x={6.4} y={6.6} s={1.3} color="#f3a9c4" />
      <Tree x={12.6} y={7} s={1.1} color="#f7bfd3" />
      <Lake x={6.2} y={10.6} w={2.2} d={2.2} />
    </>
  ),
};

/**
 * Phones held upright: the gate at the top and the places zig-zagging down in two columns, so a whole
 * realm fits a tall screen. (Positions as across = x − y and down = x + y.)
 */
const tallRealm = (id: RealmId): Layout => {
  const realm = realmById(id)!;
  const at = (a: number, d: number, half: number) => ({ x: (d + a) / 2 - half, y: (d - a) / 2 - half });
  const mid = { ...at(0, 0, 3), w: 6, d: 6 };
  const spots: Spot[] = [
    { id: 'gate', kind: 'gate', ...at(0, 0, 1.5), lot: 3 },
    ...realm.places.map((p, i): Spot => ({ id: p, kind: p, ...at(i % 2 ? 7 : -7, 10.4 + i * 6, 1.5), lot: 3 })),
  ];
  const rows = realm.places.length;
  const decor = Array.from({ length: Math.max(0, Math.floor((rows - 1) / 2)) }, (_, k) => at(0, 13.4 + k * 12, 1.1));
  return finish({
    id,
    spots,
    hub: mid,
    hubSpots: ['gate'],
    start: 'gate',
    cls: realm.className,
    night: realm.night,
    isles: [
      { id: 'hub', ...mid, seed: 17, lift: 0, falls: 0.5, spots: ['gate'] },
      ...spots.slice(1).map((sp, i) => isleFor(sp, i + 1)),
      ...decor.map((p, k): Isle => ({ id: `deco${k}`, ...p, w: 2.2, d: 2.2, seed: 60 + k * 9, lift: 26, spots: [], small: true, decor: () => DECOR[id](p.x + 0.1, p.y + 0.1) })),
    ],
    lamps: [],
  });
};

const realmLayout = (id: RealmId): Layout => {
  const realm = realmById(id)!;
  const slots = SLOTS[id];
  const spots: Spot[] = [
    { id: 'gate', kind: 'gate', x: MIDDLE.x + 2.7, y: MIDDLE.y + 2.7, lot: 3 },
    ...realm.places.map((p, i): Spot => ({ id: p, kind: p, x: RING[slots[i]][0], y: RING[slots[i]][1], lot: 3 })),
  ];
  const free = RING.map((_, k) => k).filter((k) => !slots.includes(k));
  const decorSlots = free.filter((_, k) => k % 2 === 0).slice(0, 4);
  return finish({
    id,
    spots,
    hub: MIDDLE,
    hubSpots: ['gate'],
    start: 'gate',
    cls: realm.className,
    night: realm.night,
    isles: [
      { id: 'hub', ...MIDDLE, seed: 13 + slots.length, lift: 0, falls: 0.45, spots: ['gate'], decor: MIDDLE_DECOR[id] },
      ...spots.slice(1).map((s, i) => isleFor(s, i + 1)),
      ...decorSlots.map((k, i): Isle => {
        const [x, y] = RING[k];
        return { id: `deco${k}`, x: x + 0.2, y: y + 0.2, w: 2.2, d: 2.2, seed: 50 + k * 7, lift: 20 + i * 14, spots: [], small: true, decor: () => DECOR[id](x + 0.3, y + 0.3) };
      }),
    ],
    lamps: [],
  });
};

const cache = new Map<string, Layout>();
/** A map's layout; `tall` for phones held upright (realms zig-zag down instead of a ring). */
export function layoutFor(id: LayoutId, tall = false): Layout {
  const key = `${id}:${tall && id !== 'home'}`;
  let l = cache.get(key);
  if (!l) {
    l = id === 'home' ? homeLayout() : tall ? tallRealm(id) : realmLayout(id);
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
