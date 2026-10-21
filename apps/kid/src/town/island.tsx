import type { ReactNode } from 'react';
import { INK, P, type Pt } from './iso';

/**
 * Floating islands: a grassy top with a ragged edge, a band of soil, and a rocky cliff that tapers to a
 * point underneath, with vines hanging off the front. Shapes come from a seed so each island is
 * different but stays the same between visits.
 */

export interface IslandShape {
  /** Outline points on the curve (screen px), in order around the island. */
  ring: Pt[];
  /** Control points for the smooth outline. */
  ctrl: Pt[];
  /** The front edge (seen from the camera), left to right. */
  front: Pt[];
  /** Screen centre of the top. */
  center: Pt;
  /** Lowest point of the cliff. */
  apex: Pt;
}

/** Small seeded random numbers. */
export function rand(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function islandShape(x: number, y: number, w: number, d: number, seed: number): IslandShape {
  const r = rand(seed);
  // Walk round the rectangle (corners cut off), pushing each point out a little.
  const cut = Math.min(0.9, Math.min(w, d) * 0.22);
  const corners: [number, number][] = [
    [x + cut, y],
    [x + w - cut, y],
    [x + w, y + cut],
    [x + w, y + d - cut],
    [x + w - cut, y + d],
    [x + cut, y + d],
    [x, y + d - cut],
    [x, y + cut],
  ];
  const cx = x + w / 2;
  const cy = y + d / 2;
  const pts: [number, number][] = [];
  for (let i = 0; i < corners.length; i++) {
    const a = corners[i];
    const b = corners[(i + 1) % corners.length];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const steps = Math.max(1, Math.round(len * 1.3));
    for (let k = 0; k < steps; k++) {
      const t = k / steps;
      const px = a[0] + (b[0] - a[0]) * t;
      const py = a[1] + (b[1] - a[1]) * t;
      const dx = px - cx;
      const dy = py - cy;
      const dl = Math.hypot(dx, dy) || 1;
      const push = 0.05 + r() * 0.4;
      pts.push([px + (dx / dl) * push, py + (dy / dl) * push]);
    }
  }
  const ctrl = pts.map(([a, b]) => P(a, b));
  const ring = ctrl.map((p, i) => {
    const q = ctrl[(i + 1) % ctrl.length];
    return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2] as Pt;
  });
  // Front chain: from the leftmost to the rightmost point, the way that runs lower on screen.
  let L = 0;
  let R = 0;
  ring.forEach((p, i) => {
    if (p[0] < ring[L][0]) L = i;
    if (p[0] > ring[R][0]) R = i;
  });
  const walk = (from: number, to: number, dir: 1 | -1) => {
    const out: Pt[] = [];
    for (let i = from; ; i = (i + dir + ring.length) % ring.length) {
      out.push(ring[i]);
      if (i === to) break;
    }
    return out;
  };
  const a = walk(L, R, 1);
  const b = walk(L, R, -1);
  const avg = (c: Pt[]) => c.reduce((s, p) => s + p[1], 0) / c.length;
  const front = avg(a) > avg(b) ? a : b;
  const center = P(cx, cy);
  const maxY = Math.max(...front.map((p) => p[1]));
  const depth = 50 + (w + d) * 9 + r() * 25;
  const apex: Pt = [(ring[L][0] + ring[R][0]) / 2 + (r() - 0.5) * 30, maxY + depth];
  return { ring, ctrl, front, center, apex };
}

/** The outline as a smooth closed path. */
export const outlinePath = (s: IslandShape) => {
  const { ring, ctrl } = s;
  let d = `M${ring[ring.length - 1][0].toFixed(1)},${ring[ring.length - 1][1].toFixed(1)}`;
  for (let i = 0; i < ring.length; i++) d += ` Q${ctrl[i][0].toFixed(1)},${ctrl[i][1].toFixed(1)} ${ring[i][0].toFixed(1)},${ring[i][1].toFixed(1)}`;
  return `${d} Z`;
};

const SOIL = 12;
const poly = (ps: Pt[]) => ps.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

/** The island itself: cliff, soil, grass top. Children stand on the grass. */
export function IslandBase({ shape, seed, grass = 'var(--grass)', vines = true, falls }: { shape: IslandShape; seed: number; grass?: string; vines?: boolean; falls?: number }) {
  const r = rand(seed * 7 + 3);
  const { front, apex } = shape;
  const low = front.map((p) => [p[0], p[1] + SOIL] as Pt);
  // Split the cliff at the front-most point into a lit left face and a shaded right face.
  let f = 0;
  low.forEach((p, i) => p[1] > low[f][1] && (f = i));
  const jag = (from: Pt, n: number, side: -1 | 1) =>
    Array.from({ length: n }, (_, i) => {
      const t = (i + 1) / (n + 1);
      return [from[0] + (apex[0] - from[0]) * t + side * (r() * 14 - 4), from[1] + (apex[1] - from[1]) * t] as Pt;
    });
  const leftJ = jag(low[0], 3, -1);
  const rightJ = jag(low[low.length - 1], 3, 1);
  const leftFace = [...low.slice(0, f + 1), apex, ...leftJ.slice().reverse()];
  const rightFace = [...low.slice(f), ...rightJ, apex];
  const soil = [...front, ...low.slice().reverse()];
  // Rock layers: the front edge pulled part of the way towards the tip.
  const strata = [0.3, 0.58].map((t) => low.filter((_, i) => i % 2 === 0 || i === low.length - 1).map((p) => [p[0] + (apex[0] - p[0]) * t, p[1] + (apex[1] - p[1]) * t + 6] as Pt));
  const chips = Array.from({ length: 5 }, () => {
    const p = low[Math.floor(r() * low.length)];
    const t = 0.12 + r() * 0.6;
    return [p[0] + (apex[0] - p[0]) * t, p[1] + (apex[1] - p[1]) * t] as Pt;
  });
  // Grass tufts scattered on the top.
  const { ring, center } = shape;
  const tufts = Array.from({ length: Math.round(ring.length * 0.9) }, () => {
    const p = ring[Math.floor(r() * ring.length)];
    const t = 0.15 + r() * 0.7;
    return [p[0] + (center[0] - p[0]) * t, p[1] + (center[1] - p[1]) * t] as Pt;
  });
  const outline = outlinePath(shape);
  const clip = `isle-clip-${seed}`;
  // Hanging vines.
  const vinePts = vines ? front.filter((_, i) => i % 3 === 1) : [];
  return (
    <g>
      <polygon points={poly(leftFace)} fill="var(--cliff)" />
      <polygon points={poly(rightFace)} fill="var(--cliff-2)" />
      {/* Rock layers following the island's shape, narrowing towards the tip. */}
      {strata.map((band, i) => (
        <g key={i}>
          <polyline points={poly(band)} fill="none" stroke="#000" strokeOpacity={0.2} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={poly(band.map((p) => [p[0], p[1] - 2.5] as Pt))} fill="none" stroke="#fff" strokeOpacity={0.16} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ))}
      {chips.map((c, i) => (
        <polygon key={`c${i}`} points={poly([[c[0] - 5, c[1]], [c[0], c[1] - 4], [c[0] + 6, c[1] - 1], [c[0] + 2, c[1] + 4]])} fill="#fff" opacity={0.14} />
      ))}
      {/* Light from above: the cliff darkens towards its tip. */}
      <polygon points={poly(leftFace)} fill="url(#isle-cliff)" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      <polygon points={poly(rightFace)} fill="url(#isle-cliff-r)" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      {falls != null && <Waterfall at={front[Math.min(front.length - 1, Math.max(0, Math.round(front.length * falls)))]} drop={apex[1] - front[0][1] - 10} />}
      <polygon points={poly(soil)} fill="var(--soil)" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      <polygon points={poly(soil)} fill="url(#isle-soil)" />
      <clipPath id={clip}>
        <path d={outline} />
      </clipPath>
      <path d={outline} fill={grass} />
      {/* A soft bevel: light just inside the edge, a sunny glow in the middle. */}
      <g clipPath={`url(#${clip})`}>
        <path d={outline} fill="none" stroke="var(--grass-hi)" strokeWidth={12} opacity={0.55} />
        <path d={outline} fill="url(#isle-top)" />
        {tufts.map(([x, y], i) => (
          <path key={i} d={`M${x - 4},${y} q2,-6 3,-8 M${x},${y} q0,-7 0,-10 M${x + 4},${y} q-1,-6 -3,-8`} fill="none" stroke="var(--grass-dark)" strokeWidth={1.4} strokeLinecap="round" opacity={0.55} />
        ))}
      </g>
      <path d={outline} fill="none" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
      {vinePts.map((p, i) => {
        const len = 14 + r() * 26;
        const sway = (r() - 0.5) * 10;
        return (
          <g key={i}>
            <path d={`M${p[0]},${p[1] + 4} q${sway},${len / 2} 0,${len}`} fill="none" stroke="#3f8a2e" strokeWidth={2.4} strokeLinecap="round" />
            <circle cx={p[0] + sway / 2} cy={p[1] + 4 + len * 0.55} r={2.6} fill="#5aa845" />
            <circle cx={p[0]} cy={p[1] + 4 + len} r={2.4} fill="#5aa845" />
          </g>
        );
      })}
    </g>
  );
}

function Waterfall({ at, drop }: { at: Pt; drop: number }) {
  const [x, y] = at;
  const h = Math.max(40, drop);
  return (
    <g style={{ pointerEvents: 'none' }}>
      <path d={`M${x - 8},${y} L${x + 8},${y} L${x + 11},${y + h} L${x - 11},${y + h} Z`} fill="#8fd3f4" opacity={0.9} />
      <path className="isle-water" d={`M${x - 3},${y + 4} L${x - 4},${y + h}`} stroke="#e8f8ff" strokeWidth={2} strokeDasharray="8 10" />
      <path className="isle-water" d={`M${x + 4},${y + 8} L${x + 5},${y + h}`} stroke="#e8f8ff" strokeWidth={2} strokeDasharray="6 12" />
      <ellipse cx={x} cy={y + h} rx={16} ry={6} fill="#ffffff" opacity={0.7} />
    </g>
  );
}

/** Gradients for the islands; put <IslandDefs /> once in the SVG. */
export function IslandDefs() {
  return (
    <>
      <radialGradient id="isle-top" cx="0.42" cy="0.38" r="0.7">
        <stop offset="0" stopColor="#fffbe0" stopOpacity="0.35" />
        <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
        <stop offset="1" stopColor="#1d3a10" stopOpacity="0.18" />
      </radialGradient>
      <linearGradient id="isle-cliff" x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0.12" />
        <stop offset="0.35" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#1a0d05" stopOpacity="0.55" />
      </linearGradient>
      <linearGradient id="isle-cliff-r" x1="0" y1="0" x2="-0.2" y2="1">
        <stop offset="0" stopColor="#000" stopOpacity="0.08" />
        <stop offset="1" stopColor="#1a0d05" stopOpacity="0.6" />
      </linearGradient>
      <linearGradient id="isle-soil" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#000" stopOpacity="0.3" />
        <stop offset="1" stopColor="#000" stopOpacity="0" />
      </linearGradient>
    </>
  );
}

/** A cartoon cloud (soft, no outline). */
export function Cloud({ x, y, s = 1, opacity = 0.95 }: { x: number; y: number; s?: number; opacity?: number }) {
  return (
    <g opacity={opacity} style={{ pointerEvents: 'none' }}>
      <ellipse cx={x} cy={y + 10 * s} rx={62 * s} ry={14 * s} fill="var(--cloud-2)" />
      <circle cx={x - 30 * s} cy={y} r={20 * s} fill="var(--cloud)" />
      <circle cx={x} cy={y - 10 * s} r={28 * s} fill="var(--cloud)" />
      <circle cx={x + 32 * s} cy={y + 2 * s} r={18 * s} fill="var(--cloud)" />
      <ellipse cx={x} cy={y + 8 * s} rx={56 * s} ry={12 * s} fill="var(--cloud)" />
    </g>
  );
}

/** Clouds hugging an island he hasn't explored: it sits half inside them. */
export function IslandCloud({ shape }: { shape: IslandShape }) {
  const { front } = shape;
  const left = front[0][0];
  const right = front[front.length - 1][0];
  const cx = (left + right) / 2;
  const maxY = Math.max(...front.map((p) => p[1]));
  const half = (right - left) / 2;
  const puffs = front.filter((_, i) => i % 2 === 0).map((p, i) => ({ x: p[0], y: Math.max(p[1] + 14, maxY - 6), r: 17 + ((i * 7) % 8) }));
  return (
    <g style={{ pointerEvents: 'none' }}>
      <ellipse cx={cx} cy={maxY + 30} rx={half * 0.95} ry={30} fill="var(--cloud-2)" />
      <ellipse cx={cx} cy={maxY + 18} rx={half * 0.9} ry={28} fill="var(--cloud)" />
      {puffs.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r={c.r} fill="var(--cloud)" />
      ))}
      <circle cx={cx - half * 0.35} cy={maxY + 8} r={30} fill="var(--cloud)" />
      <circle cx={cx + half * 0.3} cy={maxY + 12} r={26} fill="var(--cloud)" />
    </g>
  );
}

/** Loose rocks drifting under an island whose topics need review: it's starting to crumble. */
export function Crumble({ shape }: { shape: IslandShape }) {
  const { front } = shape;
  const at = [front[Math.floor(front.length * 0.25)], front[Math.floor(front.length * 0.7)]];
  return (
    <g style={{ pointerEvents: 'none' }}>
      {at.map((p, i) => (
        <g key={i} className="isle-crumble" style={{ animationDelay: `${-i * 1.3}s` }}>
          <polygon points={poly([[p[0] - 7, p[1] + 26], [p[0] + 3, p[1] + 21], [p[0] + 8, p[1] + 30], [p[0] - 2, p[1] + 35]])} fill="var(--cliff)" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
          <polygon points={poly([[p[0] + 14, p[1] + 44], [p[0] + 19, p[1] + 41], [p[0] + 21, p[1] + 47], [p[0] + 15, p[1] + 49]])} fill="var(--cliff-2)" stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
        </g>
      ))}
      <path d={`M${at[0][0] - 4},${at[0][1] - 1} l5,7 l-3,6`} fill="none" stroke={INK} strokeWidth={1.8} strokeLinecap="round" opacity={0.7} />
    </g>
  );
}

/** A rope bridge between two islands, sagging a little. */
export function RopeBridge({ a, b, done }: { a: Pt; b: Pt; done?: boolean }) {
  const mid: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 16];
  const at = (t: number): Pt => [(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * mid[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * mid[1] + t * t * b[1]];
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const n = Math.max(4, Math.round(len / 11));
  const deck = `M${a[0]},${a[1]} Q${mid[0]},${mid[1]} ${b[0]},${b[1]}`;
  const rail = `M${a[0]},${a[1] - 14} Q${mid[0]},${mid[1] - 10} ${b[0]},${b[1] - 14}`;
  // Planks run across the deck.
  const dx = (b[0] - a[0]) / len;
  const dy = (b[1] - a[1]) / len;
  const planks: ReactNode[] = [];
  for (let i = 1; i < n; i++) {
    const [px, py] = at(i / n);
    planks.push(<line key={i} x1={px - dy * 5} y1={py + dx * 5 - 1} x2={px + dy * 5} y2={py - dx * 5 - 1} stroke={INK} strokeWidth={1.2} opacity={0.6} />);
  }
  const wood = done ? '#c9a36a' : '#b07a45';
  return (
    <g style={{ pointerEvents: 'none' }}>
      <path d={deck} fill="none" stroke={INK} strokeWidth={11} strokeLinecap="round" />
      <path d={deck} fill="none" stroke={wood} strokeWidth={7} strokeLinecap="round" />
      {planks}
      <path d={rail} fill="none" stroke="#7a5030" strokeWidth={2} />
      {[a, b].map((p, i) => (
        <line key={i} x1={p[0]} y1={p[1]} x2={p[0]} y2={p[1] - 16} stroke={INK} strokeWidth={3} strokeLinecap="round" />
      ))}
      {Array.from({ length: n - 1 }, (_, i) => {
        const [px, py] = at((i + 1) / n);
        return <line key={`r${i}`} x1={px} y1={py} x2={px} y2={py - 12} stroke="#7a5030" strokeWidth={1} opacity={0.7} />;
      })}
    </g>
  );
}

/** Nearest outline point of an island to a screen point. */
export const edgeToward = (s: IslandShape, to: Pt): Pt => s.ring.reduce((best, p) => (Math.hypot(p[0] - to[0], p[1] - to[1]) < Math.hypot(best[0] - to[0], best[1] - to[1]) ? p : best), s.ring[0]);
