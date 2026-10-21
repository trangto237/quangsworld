import type { ReactNode } from 'react';
import { Box, Crown, Cylinder, Emoji, GableRoof, Ground, INK, P, PyramidRoof, ShadeDefs, Tree, Windows, type Pt } from '../town/iso';
import { Lake } from '../town/buildings';
import { Cloud, IslandBase, IslandDefs, islandShape } from '../town/island';
import { MAX_PLOTS, STAGES, plantOf, type Bed, type Plant } from '../lib/garden';

/**
 * The Word Garden drawn as a little isometric farm on a floating island: raised soil beds with the
 * crops growing in them, a fence, a glasshouse and a well, and decorations that appear as the
 * catalogue fills up. Bubbles over the beds say what each one needs (plant, water, harvest).
 */

const ISL = 11.6;
const RAW = islandShape(0, 0, ISL, ISL, 41);
// A shallower cliff than the map's islands, so the garden gets the room.
const SHAPE = { ...RAW, apex: [RAW.apex[0], Math.max(...RAW.front.map((p) => p[1])) + 120] as Pt };
const B0 = 2.6;
const BED = 2.1;
const GAP = 0.6;
const BED_H = 6;
export const bedAt = (i: number) => ({ x: B0 + (i % 3) * (BED + GAP), y: B0 + Math.floor(i / 3) * (BED + GAP) });
/** Screen point above the middle of a bed (for bubbles and effects). */
export const bedTop = (i: number, lift = 0): Pt => {
  const { x, y } = bedAt(i);
  return P(x + BED / 2, y + BED / 2, BED_H + lift);
};

export const VIEW = { x: -410, y: -90, w: 820, h: 640 };
/** Phones held upright: closer in on the beds. */
export const VIEW_TALL = { x: -255, y: -50, w: 510, h: 540 };

// ── Decorations that come with the catalogue ──────────────────────
export interface Decor {
  id: string;
  name: string;
  vi: string;
  /** Plants found to unlock it. */
  at: number;
  x: number;
  y: number;
  /** Size, for drawing order. */
  s: number;
  draw: () => ReactNode;
}

const scarecrow = (x: number, y: number) => {
  const [sx, sy] = P(x, y);
  return (
    <g>
      <ellipse cx={sx} cy={sy} rx={9} ry={4} fill="url(#sh-contact)" />
      <line x1={sx} y1={sy} x2={sx} y2={sy - 44} stroke="#7a4e2c" strokeWidth={3} />
      <line x1={sx - 16} y1={sy - 30} x2={sx + 16} y2={sy - 30} stroke="#7a4e2c" strokeWidth={3} strokeLinecap="round" />
      <path d={`M${sx - 9},${sy - 34} L${sx + 9},${sy - 34} L${sx + 7},${sy - 16} L${sx - 7},${sy - 16} Z`} fill="#4b8fe2" stroke={INK} strokeWidth={1.2} />
      <path d={`M${sx - 16},${sy - 30} l-3,4 M${sx + 16},${sy - 30} l3,4`} stroke="#e8c45a" strokeWidth={2} />
      <circle cx={sx} cy={sy - 41} r={6.5} fill="#e9cf98" stroke={INK} strokeWidth={1.2} />
      <ellipse cx={sx} cy={sy - 46} rx={11} ry={3} fill="#d9a441" stroke={INK} strokeWidth={1.2} />
      <path d={`M${sx - 6},${sy - 46} q6,-10 12,0`} fill="#d9a441" stroke={INK} strokeWidth={1.2} />
      <circle cx={sx - 2.2} cy={sy - 41} r={0.9} fill="#3b2412" />
      <circle cx={sx + 2.2} cy={sy - 41} r={0.9} fill="#3b2412" />
    </g>
  );
};

const beehive = (x: number, y: number) => {
  const [sx, sy] = P(x + 0.35, y + 0.35, 26);
  return (
    <g>
      <Box x={x} y={y} w={0.7} d={0.7} h={8} color="#9a6a3f" />
      <Box x={x + 0.05} y={y + 0.05} w={0.6} d={0.6} h={14} z={8} color="#f5c542" />
      <PyramidRoof x={x} y={y} w={0.7} d={0.7} z={22} h={8} color="#c48a00" />
      <g className="garden-bees">
        <text x={sx + 14} y={sy - 4} fontSize={11}>
          🐝
        </text>
        <text x={sx - 20} y={sy + 6} fontSize={9}>
          🐝
        </text>
      </g>
    </g>
  );
};

const windmill = (x: number, y: number) => {
  const h = 58;
  const hub = P(x + 0.45, y + 0.9, h - 6);
  return (
    <g>
      <Box x={x} y={y} w={0.9} d={0.9} h={h} color="#f2e6cf" />
      <Windows x={x} y={y} w={0.9} d={0.9} floors={2} floorH={h / 2} cols={1} />
      <PyramidRoof x={x - 0.05} y={y - 0.05} w={1} d={1} z={h} h={16} color="#c0583e" />
      <g transform={`translate(${hub[0]} ${hub[1]})`}>
        <g className="garden-spin">
          {[0, 90, 180, 270].map((a) => (
            <g key={a} transform={`rotate(${a})`}>
              <rect x={-3} y={-38} width={6} height={36} fill="#fffaf0" stroke={INK} strokeWidth={1.2} />
              <line x1={0} y1={-36} x2={0} y2={-4} stroke={INK} strokeWidth={0.8} />
            </g>
          ))}
          <circle r={4} fill="#7a4e2c" stroke={INK} strokeWidth={1.2} />
        </g>
      </g>
    </g>
  );
};

const fountain = (x: number, y: number) => {
  const [sx, sy] = P(x + 0.5, y + 0.5, 22);
  return (
    <g>
      <Cylinder cx={x + 0.5} cy={y + 0.5} r={0.55} h={8} color="#cfd8e3" />
      <ellipse cx={P(x + 0.5, y + 0.5, 8)[0]} cy={P(x + 0.5, y + 0.5, 8)[1]} rx={20} ry={9} fill="#7cc4e8" />
      <Cylinder cx={x + 0.5} cy={y + 0.5} r={0.12} h={12} z={8} color="#cfd8e3" />
      <path className="garden-splash" d={`M${sx},${sy} q-10,-8 -16,8 M${sx},${sy} q10,-8 16,8 M${sx},${sy - 2} l0,-8`} fill="none" stroke="#bfe6ff" strokeWidth={2.4} strokeLinecap="round" />
    </g>
  );
};

const statue = (x: number, y: number) => {
  const [sx, sy] = P(x + 0.4, y + 0.4, 16);
  return (
    <g>
      <Box x={x} y={y} w={0.8} d={0.8} h={16} color="#e0c36a" />
      <text x={sx} y={sy - 12} fontSize={30} textAnchor="middle" dominantBaseline="central">
        🏆
      </text>
    </g>
  );
};

const fruitTree = (x: number, y: number) => {
  const [sx, sy] = P(x, y);
  return (
    <g>
      <Tree x={x} y={y} s={1.5} color="#5aa845" />
      {[
        [-8, -30],
        [7, -24],
        [1, -40],
      ].map(([dx, dy], i) => (
        <text key={i} x={sx + dx} y={sy + dy} fontSize={10} textAnchor="middle" dominantBaseline="central">
          🍎
        </text>
      ))}
    </g>
  );
};

export const DECOR: Decor[] = [
  { id: 'scarecrow', name: 'Scarecrow', vi: 'Bù nhìn', at: 1, x: 1.2, y: 8.6, s: 0.4, draw: () => scarecrow(1.2, 8.6) },
  { id: 'beehive', name: 'Beehive', vi: 'Tổ ong', at: 3, x: 5.4, y: 0.9, s: 0.7, draw: () => beehive(5.4, 0.9) },
  { id: 'windmill', name: 'Windmill', vi: 'Cối xay gió', at: 6, x: 8.4, y: 0.6, s: 0.9, draw: () => windmill(8.4, 0.6) },
  { id: 'pond', name: 'Duck pond', vi: 'Ao vịt', at: 10, x: 10.3, y: 3.2, s: 1.1, draw: () => <Lake x={10.25} y={3} w={1.15} d={2.6} /> },
  { id: 'trees', name: 'Apple trees', vi: 'Cây táo', at: 14, x: 0.9, y: 4.6, s: 0.5, draw: () => fruitTree(1.0, 4.4) },
  { id: 'fountain', name: 'Fountain', vi: 'Đài phun nước', at: 18, x: 4.2, y: 10.4, s: 1, draw: () => fountain(4.2, 10.4) },
  { id: 'statue', name: 'Golden statue', vi: 'Tượng vàng', at: 24, x: 10.4, y: 10.4, s: 0.8, draw: () => statue(10.4, 10.4) },
];

// ── Plants ──────────────────────────────────────────────────────
type Form = 'flower' | 'hang' | 'ground' | 'stalk' | 'tree' | 'self';
const FORM: Record<string, Form> = {
  rice: 'self',
  carrot: 'ground',
  corn: 'stalk',
  lettuce: 'ground',
  tomato: 'hang',
  cucumber: 'hang',
  sunflower: 'flower',
  tulip: 'flower',
  strawberry: 'ground',
  eggplant: 'hang',
  chili: 'hang',
  watermelon: 'ground',
  rose: 'flower',
  mushroom: 'self',
  lotus: 'flower',
  'peach-blossom': 'tree',
  pineapple: 'ground',
  mango: 'tree',
  hibiscus: 'flower',
  bamboo: 'self',
  'golden-lotus': 'flower',
  'crystal-rose': 'flower',
  'rainbow-tulip': 'flower',
  'word-tree': 'self',
};

const LEAF = '#5aa845';
const STEM = '#3f8a2e';

function Leaf({ x, y, a, l = 7 }: { x: number; y: number; a: number; l?: number }) {
  return <ellipse cx={x} cy={y} rx={l} ry={l * 0.42} transform={`rotate(${a} ${x} ${y})`} fill={LEAF} stroke={INK} strokeWidth={1} />;
}

function Stem({ x, y, h }: { x: number; y: number; h: number }) {
  return <path d={`M${x},${y} q2.5,${-h / 2} 0,${-h}`} stroke={STEM} strokeWidth={2.2} fill="none" strokeLinecap="round" />;
}

function Glyph({ x, y, size, p, children }: { x: number; y: number; size: number; p: Plant; children?: string }) {
  return (
    <text x={x} y={y} fontSize={size} textAnchor="middle" dominantBaseline="central" style={{ filter: p.filter }}>
      {children ?? p.emoji}
    </text>
  );
}

/** One plant at screen point (x, y) on the soil, at a growth stage. */
function Crop({ x, y, p, stage }: { x: number; y: number; p: Plant; stage: number }) {
  const mound = <ellipse cx={x} cy={y} rx={7} ry={3.2} fill="#5a361c" stroke={INK} strokeWidth={0.9} />;
  if (stage === 0)
    return (
      <g>
        {mound}
        <circle cx={x + 1} cy={y - 1.5} r={1.8} fill="#c8a46b" />
      </g>
    );
  if (stage === 1)
    return (
      <g className="garden-sway">
        {mound}
        <Stem x={x} y={y} h={7} />
        <Leaf x={x - 4} y={y - 7} a={-25} l={5} />
        <Leaf x={x + 4} y={y - 8} a={25} l={5} />
      </g>
    );
  if (stage === 2)
    return (
      <g className="garden-sway">
        {mound}
        <Stem x={x} y={y} h={16} />
        <Leaf x={x - 5} y={y - 6} a={-20} l={6} />
        <Leaf x={x + 5} y={y - 8} a={20} l={6} />
        <Leaf x={x - 4} y={y - 13} a={-35} l={5} />
        <Leaf x={x + 4} y={y - 15} a={35} l={5} />
        <circle cx={x} cy={y - 17} r={2.6} fill="#8cc75a" stroke={INK} strokeWidth={0.9} />
      </g>
    );
  const form = FORM[p.id] ?? 'flower';
  const glow = p.tier === 'legendary' && <ellipse cx={x} cy={y - 14} rx={16} ry={20} fill="url(#garden-glow)" />;
  switch (form) {
    case 'self':
      return (
        <g className="garden-sway">
          {glow}
          {mound}
          <Glyph x={x} y={y - 14} size={p.id === 'word-tree' ? 32 : 24} p={p} />
        </g>
      );
    case 'ground':
      return (
        <g className="garden-sway">
          {glow}
          {mound}
          {p.id !== 'watermelon' && [-60, -25, 25, 60].map((a, i) => <Leaf key={i} x={x + a / 9} y={y - 9} a={a} l={7} />)}
          <Glyph x={x} y={y - (p.id === 'watermelon' ? 6 : 4)} size={p.id === 'watermelon' ? 20 : 16} p={p} />
        </g>
      );
    case 'hang':
      return (
        <g className="garden-sway">
          {glow}
          {mound}
          <Stem x={x} y={y} h={24} />
          <Crown
            balls={[
              { cx: x - 5, cy: y - 22, r: 5, color: '#4f9e3e' },
              { cx: x + 5, cy: y - 23, r: 5, color: '#5aa845' },
              { cx: x, cy: y - 27, r: 6, color: '#62b04d' },
            ]}
            sw={1}
          />
          <Glyph x={x - 7} y={y - 12} size={12} p={p} />
          <Glyph x={x + 7} y={y - 15} size={12} p={p} />
        </g>
      );
    case 'stalk':
      return (
        <g className="garden-sway">
          {glow}
          {mound}
          {[-6, 0, 6].map((dx, i) => (
            <path key={i} d={`M${x + dx / 3},${y} q${dx},-14 ${dx * 1.6},-30`} stroke={i === 1 ? STEM : LEAF} strokeWidth={3} fill="none" strokeLinecap="round" />
          ))}
          <Glyph x={x + 3} y={y - 20} size={16} p={p} />
        </g>
      );
    case 'tree':
      return (
        <g className="garden-sway">
          {glow}
          <rect x={x - 2} y={y - 12} width={4} height={12} fill="#7a4e2c" stroke={INK} strokeWidth={1} />
          <Crown
            balls={[
              { cx: x - 7, cy: y - 20, r: 8, color: p.id === 'peach-blossom' ? '#f3a9c4' : '#4f9e3e' },
              { cx: x + 7, cy: y - 21, r: 8, color: p.id === 'peach-blossom' ? '#f7bfd3' : '#5aa845' },
              { cx: x, cy: y - 28, r: 10, color: p.id === 'peach-blossom' ? '#fbd0de' : '#62b04d' },
            ]}
          />
          <Glyph x={x - 6} y={y - 22} size={11} p={p} />
          <Glyph x={x + 6} y={y - 28} size={11} p={p} />
        </g>
      );
    default:
      return (
        <g className="garden-sway">
          {glow}
          {mound}
          <Stem x={x} y={y} h={26} />
          <Leaf x={x - 5} y={y - 8} a={-25} l={7} />
          <Leaf x={x + 5} y={y - 14} a={25} l={6} />
          <Glyph x={x + 0.5} y={y - 30} size={17} p={p} />
        </g>
      );
  }
}

const SPOTS: [number, number][] = [
  [0.55, 0.55],
  [1.55, 0.55],
  [0.55, 1.55],
  [1.55, 1.55],
];

function BedDrawing({ i, bed, locked, toUnlock, onTap }: { i: number; bed: Bed | null; locked: boolean; toUnlock?: number; onTap: () => void }) {
  const { x, y } = bedAt(i);
  if (locked) {
    const [sx, sy] = P(x + BED / 2, y + BED / 2);
    return (
      <g onClick={onTap} style={{ cursor: 'pointer' }}>
        <Ground x={x} y={y} w={BED} d={BED} fill="#8fc25a" stroke="rgba(52,30,14,0.25)" sw={1} />
        {[
          [0.45, 0.5, 1],
          [1.6, 0.45, 0.8],
          [0.4, 1.65, 0.85],
          [1.65, 1.6, 1.1],
        ].map(([ox, oy, k2], k) => {
          const [rx, ry] = P(x + ox, y + oy);
          return (
            <Crown
              key={k}
              balls={[
                { cx: rx - 6 * k2, cy: ry - 4 * k2, r: 6 * k2, color: '#4f9e3e' },
                { cx: rx + 6 * k2, cy: ry - 4 * k2, r: 5.5 * k2, color: '#5aa845' },
                { cx: rx, cy: ry - 9 * k2, r: 7 * k2, color: '#62b04d' },
              ]}
              sw={1}
            />
          );
        })}
        {[
          [1.05, 1.0],
          [0.9, 0.2],
        ].map(([ox, oy], k) => {
          const [rx, ry] = P(x + ox, y + oy);
          return <ellipse key={`s${k}`} cx={rx} cy={ry} rx={5} ry={3} fill="#b9b2a4" stroke={INK} strokeWidth={0.9} />;
        })}
        <line x1={sx} y1={sy} x2={sx} y2={sy - 34} stroke="#6b4423" strokeWidth={3} />
        <rect x={sx - 27} y={sy - 52} width={54} height={26} rx={3} fill="#c8955c" stroke={INK} strokeWidth={1.4} />
        <text x={sx} y={sy - 44} fontSize={9} fontWeight={800} textAnchor="middle" fill="#3b2412">
          🔒 +{toUnlock}
        </text>
        <text x={sx} y={sy - 33} fontSize={7.5} fontWeight={700} textAnchor="middle" fill="#3b2412">
          words
        </text>
      </g>
    );
  }
  const p = bed ? plantOf(bed.plant) : null;
  const furrows = [0.45, 1.05, 1.65];
  return (
    <g onClick={onTap} style={{ cursor: 'pointer' }}>
      <Box x={x} y={y} w={BED} d={BED} h={BED_H} color="#a0703f" top="#7a4f2c" />
      {furrows.map((t, k) => (
        <Ground key={k} x={x + 0.15} y={y + t} w={BED - 0.3} d={0.14} z={BED_H} fill="#5f3a1f" />
      ))}
      {p &&
        bed &&
        SPOTS.map(([ox, oy], k) => {
          const [cx, cy] = P(x + ox, y + oy, BED_H);
          return <Crop key={k} x={cx} y={cy} p={p} stage={Math.min(bed.stage, STAGES)} />;
        })}
    </g>
  );
}

function Fence() {
  // Along the two back edges of the bed area, with a gap for the gate.
  const lo = 2.15;
  const hi = 10.3;
  const posts: [number, number][] = [];
  for (let t = lo; t <= hi + 0.01; t += 0.68) {
    posts.push([lo, t]);
    if (t > lo) posts.push([t, lo]);
  }
  const rail = (a: Pt, b: Pt, z: number) => {
    const [x1, y1] = P(a[0], a[1], z);
    const [x2, y2] = P(b[0], b[1], z);
    return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#8a5a35" strokeWidth={2.4} strokeLinecap="round" />;
  };
  return (
    <g>
      {rail([lo, lo], [lo, hi], 7)}
      {rail([lo, lo], [lo, hi], 13)}
      {rail([lo, lo], [hi, lo], 7)}
      {rail([lo, lo], [hi, lo], 13)}
      {posts.map(([px, py], k) => {
        const [sx, sy] = P(px, py);
        return <rect key={k} x={sx - 1.8} y={sy - 17} width={3.6} height={17} rx={1} fill="#b07a4a" stroke={INK} strokeWidth={0.9} />;
      })}
    </g>
  );
}

function Flowers() {
  const spots: [number, number, string][] = [
    [0.6, 2.8, '#f472b6'],
    [0.7, 7.0, '#facc15'],
    [3.6, 0.6, '#f87171'],
    [7.2, 0.5, '#c084fc'],
    [11.0, 8.2, '#f472b6'],
    [7.8, 11.1, '#facc15'],
    [2.2, 11.0, '#f87171'],
    [11.1, 1.6, '#60a5fa'],
  ];
  return (
    <g>
      {spots.map(([x, y, c], k) => {
        const [sx, sy] = P(x, y);
        return (
          <g key={k}>
            {[
              [-5, 0],
              [4, -2],
              [0, 3],
              [6, 3],
            ].map(([dx, dy], j) => (
              <g key={j}>
                <circle cx={sx + dx} cy={sy + dy - 3} r={2.6} fill={c} stroke={INK} strokeWidth={0.6} />
                <circle cx={sx + dx} cy={sy + dy - 3} r={0.9} fill="#fff7d6" />
              </g>
            ))}
          </g>
        );
      })}
    </g>
  );
}

/** Stepping stones from the front of the island up to the beds. */
function Path() {
  const stones: [number, number][] = [
    [10.9, 6.4],
    [10.4, 6.25],
    [11.3, 6.5],
  ];
  return (
    <g>
      {stones.map(([x, y], k) => {
        const [sx, sy] = P(x, y);
        return <ellipse key={k} cx={sx} cy={sy} rx={9} ry={4.5} fill="#d9cdb4" stroke={INK} strokeWidth={0.9} />;
      })}
    </g>
  );
}

function Hay({ x, y }: { x: number; y: number }) {
  const [sx, sy] = P(x + 0.3, y + 0.3, 10);
  return (
    <g>
      <Box x={x} y={y} w={0.7} d={0.55} h={10} color="#e8c45a" />
      <text x={sx + 12} y={sy + 8} fontSize={12}>
        🧺
      </text>
    </g>
  );
}

function Glasshouse() {
  const [x, y, w, d, h] = [0.5, 0.6, 1.7, 1.5, 22];
  return (
    <g>
      <Box x={x} y={y} w={w} d={d} h={h} color="#bfe6ef" />
      <Windows x={x} y={y} w={w} d={d} floors={1} floorH={h} cols={3} color="#e4f7fb" />
      <GableRoof x={x} y={y} w={w} d={d} z={h} h={14} color="#9fd4e2" />
      <Emoji at={P(x + w + 0.15, y + d * 0.6, 4)} size={14}>
        🪴
      </Emoji>
    </g>
  );
}

function Well() {
  const [x, y] = [0.8, 6.4];
  const [sx, sy] = P(x, y, 30);
  return (
    <g>
      <Cylinder cx={x} cy={y} r={0.42} h={12} color="#b8b0a2" />
      <ellipse cx={P(x, y, 12)[0]} cy={P(x, y, 12)[1]} rx={11} ry={5.5} fill="#2c5d7a" />
      <line x1={sx - 13} y1={sy + 18} x2={sx - 13} y2={sy - 2} stroke="#7a4e2c" strokeWidth={2.4} />
      <line x1={sx + 13} y1={sy + 18} x2={sx + 13} y2={sy - 2} stroke="#7a4e2c" strokeWidth={2.4} />
      <path d={`M${sx - 18},${sy} L${sx},${sy - 12} L${sx + 18},${sy} Z`} fill="#c0583e" stroke={INK} strokeWidth={1.2} />
      <text x={sx + 4} y={sy + 12} fontSize={9}>
        🪣
      </text>
    </g>
  );
}

export interface SceneProps {
  beds: (Bed | null)[];
  plots: number;
  /** Words still needed to open each locked bed. */
  toUnlock: (i: number) => number;
  found: number;
  /** What each bed's bubble shows. */
  bubble: (i: number) => { icon: string; tone: 'blue' | 'gold' | 'green' | 'grey' } | null;
  onBed: (i: number) => void;
  /** Bed being watered / harvested right now (for the effect). */
  splash?: number | null;
  reaped?: { i: number; emoji: string; filter?: string } | null;
}

const BUBBLE_FILL = { blue: '#d7ecff', gold: '#ffe9a8', green: '#dcf5d0', grey: '#ece7dd' };

export function GardenScene({ beds, plots, toUnlock, found, bubble, onBed, splash, reaped, tall }: SceneProps & { tall?: boolean }) {
  const v = tall ? VIEW_TALL : VIEW;
  const decor = DECOR.filter((d) => found >= d.at);
  const back = decor.filter((d) => d.x < 2.2 || d.y < 2.2);
  const rest = decor.filter((d) => !back.includes(d));
  // Beds and the decorations among / in front of them, drawn back to front.
  const items: { key: number; el: ReactNode }[] = [
    ...Array.from({ length: MAX_PLOTS }, (_, i) => {
      const { x, y } = bedAt(i);
      return {
        key: x + y + BED,
        el: <BedDrawing key={`b${i}`} i={i} bed={beds[i] ?? null} locked={i >= plots} toUnlock={toUnlock(i)} onTap={() => onBed(i)} />,
      };
    }),
    ...rest.map((d) => ({ key: d.x + d.y + d.s * 2, el: <g key={d.id}>{d.draw()}</g> })),
  ].sort((a, b) => a.key - b.key);

  return (
    <svg viewBox={`${v.x} ${v.y} ${v.w} ${v.h}`} className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Your garden">
      <defs>
        <ShadeDefs />
        <IslandDefs />
        <radialGradient id="garden-glow">
          <stop offset="0" stopColor="#fff3b0" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffd34d" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className="garden-clouds">
        <Cloud x={-330} y={-40} s={0.9} opacity={0.85} />
        <Cloud x={300} y={20} s={0.7} opacity={0.8} />
        <Cloud x={-260} y={560} s={0.8} opacity={0.75} />
      </g>
      <g className="isle-float">
        <IslandBase shape={SHAPE} seed={41} falls={0.62} />
        <Flowers />
        <Path />
        <Glasshouse />
        <Well />
        <Tree x={0.9} y={10.4} s={1.3} color="#4f9e3e" />
        <Tree x={10.6} y={0.9} s={1.2} kind="pine" color="#3f8f3a" />
        <Hay x={3.1} y={0.7} />
        {back
          .slice()
          .sort((a, b) => a.x + a.y - (b.x + b.y))
          .map((d) => (
            <g key={d.id}>{d.draw()}</g>
          ))}
        <Fence />
        {items.map((it) => it.el)}
        {/* Effects */}
        {splash != null && <Watering at={bedTop(splash)} />}
        {reaped && <Reap at={bedTop(reaped.i)} emoji={reaped.emoji} filter={reaped.filter} />}
        {/* Bubbles on top of everything */}
        {Array.from({ length: MAX_PLOTS }, (_, i) => {
          const b = bubble(i);
          if (!b) return null;
          const [bx, by] = bedTop(i, 70);
          return (
            <g key={`u${i}`} onClick={() => onBed(i)} style={{ cursor: 'pointer' }}>
              <g className="garden-bubble" style={{ animationDelay: `${(i % 4) * 0.25}s` }}>
                <path d={`M${bx - 6},${by + 16} L${bx},${by + 27} L${bx + 6},${by + 16} Z`} fill={BUBBLE_FILL[b.tone]} stroke={INK} strokeWidth={1.4} />
                <circle cx={bx} cy={by} r={20} fill={BUBBLE_FILL[b.tone]} stroke={INK} strokeWidth={1.8} />
                <text x={bx} y={by + 1} fontSize={20} textAnchor="middle" dominantBaseline="central" opacity={b.tone === 'grey' ? 0.45 : 1}>
                  {b.icon}
                </text>
              </g>
            </g>
          );
        })}
        <g className="garden-butterfly">
          <text x={-120} y={170} fontSize={16}>
            🦋
          </text>
        </g>
        <g className="garden-butterfly" style={{ animationDelay: '-3s' }}>
          <text x={160} y={240} fontSize={13}>
            🦋
          </text>
        </g>
      </g>
    </svg>
  );
}

function Watering({ at }: { at: Pt }) {
  const [x, y] = at;
  return (
    <g style={{ pointerEvents: 'none' }}>
      <text x={x + 26} y={y - 46} fontSize={28} textAnchor="middle" transform={`rotate(-30 ${x + 26} ${y - 46})`}>
        🚿
      </text>
      {[-14, -4, 6, 16].map((dx, k) => (
        <circle key={k} className="garden-drop" cx={x + dx} cy={y - 34} r={2.6} fill="#5aaee8" style={{ animationDelay: `${k * 80}ms` }} />
      ))}
    </g>
  );
}

function Reap({ at, emoji, filter }: { at: Pt; emoji: string; filter?: string }) {
  const [x, y] = at;
  return (
    <g style={{ pointerEvents: 'none' }}>
      {[-18, 0, 18].map((dx, k) => (
        <text key={k} className="garden-reap" x={x + dx} y={y - 10} fontSize={22} textAnchor="middle" style={{ filter, animationDelay: `${k * 90}ms` }}>
          {emoji}
        </text>
      ))}
    </g>
  );
}
