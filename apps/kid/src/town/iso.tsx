import { useContext, type ReactNode } from 'react';
import { NightContext } from './night';

/**
 * A tiny isometric drawing kit for the town map. Ground coordinates are in tiles (x runs down-right,
 * y runs down-left on screen), heights in pixels. Everything is flat colour with a dark-brown outline.
 */

export const TW = 64; // tile width on screen
export const TH = 32; // tile height on screen
/** Soft outline for the artwork (shapes); labels use TAG_INK for crisp text frames. */
export const INK = 'rgba(52,30,14,0.62)';
export const TAG_INK = '#4a2e18';

export type Pt = [number, number];

/** Screen point of a ground position (x, y) at height z. */
export const P = (x: number, y: number, z = 0): Pt => [((x - y) * TW) / 2, ((x + y) * TH) / 2 - z];

const pts = (ps: Pt[]) => ps.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(' ');

/** Lighten (amt > 0) or darken (amt < 0) a #rrggbb colour. */
export function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.round(Math.max(0, Math.min(255, amt >= 0 ? v + (255 - v) * amt : v * (1 + amt))));
  const [r, g, b] = [ch((n >> 16) & 255), ch((n >> 8) & 255), ch(n & 255)];
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

/**
 * Shared light-and-shadow gradients. Faces are drawn in their flat colour, then a gradient is laid
 * over them: lit from the top left, darker towards the ground. Put <ShadeDefs /> once in the SVG.
 */
export function ShadeDefs() {
  return (
    <>
      <linearGradient id="sh-wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
        <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.2" />
      </linearGradient>
      <linearGradient id="sh-wall-r" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0.06" />
        <stop offset="1" stopColor="#000" stopOpacity="0.32" />
      </linearGradient>
      <radialGradient id="sh-top" cx="0.35" cy="0.3" r="0.9">
        <stop offset="0" stopColor="#fff" stopOpacity="0.42" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="sh-roof" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0.3" />
        <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.22" />
      </linearGradient>
      <linearGradient id="sh-cyl" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#000" stopOpacity="0.25" />
        <stop offset="0.3" stopColor="#fff" stopOpacity="0.3" />
        <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.38" />
      </linearGradient>
      <radialGradient id="sh-ball" cx="0.35" cy="0.3" r="0.75">
        <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
        <stop offset="0.35" stopColor="#fff" stopOpacity="0.1" />
        <stop offset="1" stopColor="#000" stopOpacity="0.32" />
      </radialGradient>
      <radialGradient id="sh-leaf" cx="0.35" cy="0.28" r="0.7">
        <stop offset="0" stopColor="#fff" stopOpacity="0.42" />
        <stop offset="0.55" stopColor="#fff" stopOpacity="0.06" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="sh-contact">
        <stop offset="0" stopColor="#1b2a10" stopOpacity="0.38" />
        <stop offset="0.6" stopColor="#1b2a10" stopOpacity="0.16" />
        <stop offset="1" stopColor="#1b2a10" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="sh-glass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0.7" />
        <stop offset="0.4" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
    </>
  );
}

export function Poly({ p, fill, stroke = INK, sw = 1.4, opacity, shade: overlay }: { p: Pt[]; fill: string; stroke?: string; sw?: number; opacity?: number; shade?: string }) {
  if (!overlay) return <polygon points={pts(p)} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" opacity={opacity} />;
  return (
    <g opacity={opacity}>
      <polygon points={pts(p)} fill={fill} stroke="none" />
      <polygon points={pts(p)} fill={`url(#${overlay})`} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
    </g>
  );
}

/** A soft shadow on the ground under something standing there. */
export function Contact({ x, y, w, d }: { x: number; y: number; w: number; d: number }) {
  const [cx, cy] = P(x + w / 2, y + d / 2);
  const rx = ((w + d) * TW) / 3.2;
  return <ellipse cx={cx} cy={cy + 2} rx={rx} ry={rx * 0.52} fill="url(#sh-contact)" style={{ pointerEvents: 'none' }} />;
}

/** A flat diamond-ish area on the ground (x..x+w, y..y+d). */
export function Ground({ x, y, w, d, fill, z = 0, stroke = 'none', sw = 1.2 }: { x: number; y: number; w: number; d: number; fill: string; z?: number; stroke?: string; sw?: number }) {
  return <Poly p={[P(x, y, z), P(x + w, y, z), P(x + w, y + d, z), P(x, y + d, z)]} fill={fill} stroke={stroke} sw={sw} />;
}

/** A box: top lighter, the two visible walls in mid and dark tones. */
export function Box({ x, y, w, d, h, z = 0, color, top }: { x: number; y: number; w: number; d: number; h: number; z?: number; color: string; top?: string }) {
  return (
    <g>
      <Poly p={[P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)]} fill={shade(color, -0.02)} shade="sh-wall" />
      <Poly p={[P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)]} fill={shade(color, -0.25)} shade="sh-wall-r" />
      <Poly p={[P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)]} fill={top ?? shade(color, 0.25)} shade="sh-top" />
      {/* Sunlit rim along the top's front edges. */}
      <polyline points={pts([P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y, z + h)])} fill="none" stroke="#fff" strokeOpacity={0.5} strokeWidth={1.1} strokeLinejoin="round" />
    </g>
  );
}

/** Rows of windows on the two visible walls of a box. */
export function Windows({ x, y, w, d, z = 0, floors, floorH, cols = 2, color = '#bfe3f2', lit = false }: { x: number; y: number; w: number; d: number; z?: number; floors: number; floorH: number; cols?: number; color?: string; lit?: boolean }) {
  const out: ReactNode[] = [];
  const night = useContext(NightContext);
  const fill = lit ? '#ffe28a' : color;
  for (let f = 0; f < floors; f++) {
    const z1 = z + f * floorH + floorH * 0.3;
    const z2 = z + f * floorH + floorH * 0.75;
    for (let c = 0; c < cols; c++) {
      const u1 = (c + 0.25) / cols;
      const u2 = (c + 0.75) / cols;
      // At night about two windows in three are lit.
      const on = (k: number) => (night && (f * 3 + c + k) % 3 !== 0 ? '#ffd76a' : fill);
      // Left wall (along x at y + d).
      out.push(<Poly key={`l${f}${c}`} p={[P(x + u1 * w, y + d, z1), P(x + u2 * w, y + d, z1), P(x + u2 * w, y + d, z2), P(x + u1 * w, y + d, z2)]} fill={on(0)} sw={1} shade="sh-glass" />);
      // Right wall (along y at x + w).
      out.push(<Poly key={`r${f}${c}`} p={[P(x + w, y + u1 * d, z1), P(x + w, y + u2 * d, z1), P(x + w, y + u2 * d, z2), P(x + w, y + u1 * d, z2)]} fill={shade(on(1), -0.15)} sw={1.1} />);
    }
  }
  return <g>{out}</g>;
}

/** A door on the left wall. */
export function Door({ x, y, w, d, z = 0, h = 14, color = '#7a4a26' }: { x: number; y: number; w: number; d: number; z?: number; h?: number; color?: string }) {
  const u1 = 0.4;
  const u2 = 0.62;
  return <Poly p={[P(x + u1 * w, y + d, z), P(x + u2 * w, y + d, z), P(x + u2 * w, y + d, z + h), P(x + u1 * w, y + d, z + h)]} fill={color} sw={1.2} />;
}

/** Pitched roof with the ridge running along x. */
export function GableRoof({ x, y, w, d, z, h, color }: { x: number; y: number; w: number; d: number; z: number; h: number; color: string }) {
  const o = 0.12;
  const [x0, x1, y0, y1, ym] = [x - o, x + w + o, y - o, y + d + o, y + d / 2];
  return (
    <g>
      <Poly p={[P(x0, y0, z), P(x1, y0, z), P(x1, ym, z + h), P(x0, ym, z + h)]} fill={shade(color, -0.2)} shade="sh-roof" />
      <Poly p={[P(x + w, y, z), P(x + w, y + d, z), P(x + w, ym, z + h)]} fill={shade(color, 0.3)} shade="sh-wall-r" />
      <Poly p={[P(x0, y1, z), P(x1, y1, z), P(x1, ym, z + h), P(x0, ym, z + h)]} fill={color} shade="sh-roof" />
      <line x1={P(x0, ym, z + h)[0]} y1={P(x0, ym, z + h)[1]} x2={P(x1, ym, z + h)[0]} y2={P(x1, ym, z + h)[1]} stroke="#fff" strokeOpacity={0.55} strokeWidth={1.4} strokeLinecap="round" />
    </g>
  );
}

/** Four-sided roof meeting at a point (also used for tiered pagoda roofs). */
export function PyramidRoof({ x, y, w, d, z, h, color, o = 0.15 }: { x: number; y: number; w: number; d: number; z: number; h: number; color: string; o?: number }) {
  const [x0, x1, y0, y1] = [x - o, x + w + o, y - o, y + d + o];
  const apex = P(x + w / 2, y + d / 2, z + h);
  return (
    <g>
      <Poly p={[P(x0, y1, z), P(x1, y1, z), apex]} fill={color} shade="sh-roof" />
      <Poly p={[P(x1, y0, z), P(x1, y1, z), apex]} fill={shade(color, -0.22)} shade="sh-wall-r" />
      <line x1={P(x1, y1, z)[0]} y1={P(x1, y1, z)[1]} x2={apex[0]} y2={apex[1]} stroke="#fff" strokeOpacity={0.45} strokeWidth={1.2} strokeLinecap="round" />
    </g>
  );
}

/** A round tower or tank: cylinder centred on (cx, cy) with radius r tiles. */
export function Cylinder({ cx, cy, r, h, z = 0, color, dome }: { cx: number; cy: number; r: number; h: number; z?: number; color: string; dome?: string }) {
  const [sx, sy] = P(cx, cy, z);
  const rx = (r * TW) / Math.SQRT2;
  const ry = (r * TH) / Math.SQRT2;
  const top = sy - h;
  return (
    <g>
      <path d={`M${sx - rx},${top} L${sx - rx},${sy} A${rx},${ry} 0 0 0 ${sx + rx},${sy} L${sx + rx},${top} Z`} fill={shade(color, -0.05)} />
      <path d={`M${sx - rx},${top} L${sx - rx},${sy} A${rx},${ry} 0 0 0 ${sx + rx},${sy} L${sx + rx},${top} Z`} fill="url(#sh-cyl)" stroke={INK} strokeWidth={1.4} />
      <ellipse cx={sx} cy={top} rx={rx} ry={ry} fill={shade(color, 0.25)} stroke={INK} strokeWidth={1.4} />
      <ellipse cx={sx} cy={top} rx={rx} ry={ry} fill="url(#sh-top)" />
      {dome && (
        <>
          <path d={`M${sx - rx},${top} A${rx},${rx * 0.9} 0 0 1 ${sx + rx},${top} A${rx},${ry} 0 0 1 ${sx - rx},${top} Z`} fill={dome} />
          <path d={`M${sx - rx},${top} A${rx},${rx * 0.9} 0 0 1 ${sx + rx},${top} A${rx},${ry} 0 0 1 ${sx - rx},${top} Z`} fill="url(#sh-ball)" stroke={INK} strokeWidth={1.4} />
        </>
      )}
    </g>
  );
}

/** Round leafy tree or pine. */
export function Tree({ x, y, s = 1, kind = 'round', color = '#5aa845' }: { x: number; y: number; s?: number; kind?: 'round' | 'pine'; color?: string }) {
  const [bx, by] = P(x, y);
  if (kind === 'pine')
    return (
      <g>
        <ellipse cx={bx} cy={by} rx={11 * s} ry={5 * s} fill="url(#sh-contact)" />
        <rect x={bx - 2 * s} y={by - 8 * s} width={4 * s} height={8 * s} fill="#7a4e2c" stroke={INK} strokeWidth={1} />
        <Poly p={[[bx, by - 30 * s], [bx - 13 * s, by - 7 * s], [bx + 13 * s, by - 7 * s]]} fill={shade(color, -0.12)} shade="sh-cyl" sw={1.2} />
        <Poly p={[[bx, by - 42 * s], [bx - 10 * s, by - 20 * s], [bx + 10 * s, by - 20 * s]]} fill={shade(color, -0.02)} shade="sh-cyl" sw={1.2} />
      </g>
    );
  return (
    <g>
      <ellipse cx={bx} cy={by} rx={12 * s} ry={5.5 * s} fill="url(#sh-contact)" />
      <rect x={bx - 2 * s} y={by - 10 * s} width={4 * s} height={10 * s} fill="#7a4e2c" stroke={INK} strokeWidth={1} />
      <Crown
        balls={[
          { cx: bx + 6 * s, cy: by - 16 * s, r: 7 * s, color: shade(color, -0.12) },
          { cx: bx - 6 * s, cy: by - 17 * s, r: 7.5 * s, color: shade(color, -0.06) },
          { cx: bx, cy: by - 23 * s, r: 10 * s, color },
        ]}
      />
    </g>
  );
}

/**
 * A leafy crown made of overlapping balls, outlined only around the outside: the outline layer is
 * drawn first, slightly bigger, then the leaves on top hide the inner edges.
 */
export function Crown({ balls, sw = 1.3 }: { balls: { cx: number; cy: number; r: number; color: string }[]; sw?: number }) {
  return (
    <g>
      {balls.map((b, i) => (
        <circle key={`o${i}`} cx={b.cx} cy={b.cy} r={b.r + sw} fill="#3c3a1f" />
      ))}
      {balls.map((b, i) => (
        <circle key={`f${i}`} cx={b.cx} cy={b.cy} r={b.r} fill={b.color} />
      ))}
      {balls.map((b, i) => (
        <circle key={`h${i}`} cx={b.cx} cy={b.cy} r={b.r} fill="url(#sh-leaf)" />
      ))}
    </g>
  );
}

/** A lit sphere (tree crowns, bushes). */
export function Ball({ cx, cy, r, color }: { cx: number; cy: number; r: number; color: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={color} />
      <circle cx={cx} cy={cy} r={r} fill="url(#sh-ball)" stroke={INK} strokeWidth={1.2} />
    </g>
  );
}

/** A flag on a pole standing at (x, y, z). */
export function Flag({ x, y, z, color, gold }: { x: number; y: number; z: number; color: string; gold?: boolean }) {
  const [sx, sy] = P(x, y, z);
  return (
    <g>
      <line x1={sx} y1={sy} x2={sx} y2={sy - 26} stroke={INK} strokeWidth={2} />
      <polygon className="town-flag" points={pts([[sx, sy - 26], [sx + 16, sy - 21], [sx, sy - 16]])} fill={gold ? '#ffc23d' : color} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
    </g>
  );
}

/** Emoji drawn at a screen point. */
export function Emoji({ at, children, size = 18 }: { at: Pt; children: string; size?: number }) {
  return (
    <text x={at[0]} y={at[1]} fontSize={size} textAnchor="middle" dominantBaseline="central" style={{ pointerEvents: 'none' }}>
      {children}
    </text>
  );
}

/** Name tag under a building, like a shop sign: icon disc, name and a short note on one line. */
export function NameTag({ at, icon, title, sub, color }: { at: Pt; icon: string; title: string; sub?: string; color: string }) {
  const tw = title.length * 6.3;
  const sw = sub ? sub.length * 5.6 + 8 : 0;
  const w = tw + sw + 34;
  const h = 22;
  const [x, y] = at;
  const left = x - w / 2;
  return (
    <g>
      <rect x={left} y={y} width={w} height={h} rx={h / 2} fill="#fff5e1" stroke={TAG_INK} strokeWidth={2} />
      <circle cx={left + 4} cy={y + h / 2} r={12} fill={color} stroke={TAG_INK} strokeWidth={2} />
      <text x={left + 4} y={y + h / 2 + 1} fontSize={13} textAnchor="middle" dominantBaseline="central">
        {icon}
      </text>
      <text x={left + 21} y={y + h / 2 + 1} fontSize={11.5} fontWeight={700} fill="#3b2412" dominantBaseline="central" fontFamily="'Baloo 2', Nunito, sans-serif">
        {title}
        {sub && (
          <tspan dx={6} fontSize={10} fontWeight={600} fill="#85623f">
            {sub}
          </tspan>
        )}
      </text>
    </g>
  );
}

/** Speech-bubble tag floating above a building ("🔁 2", "Quest!"). */
export function Bubble({ at, text, color = '#e8584a', bob }: { at: Pt; text: string; color?: string; bob?: boolean }) {
  const w = text.length * 7.5 + 18;
  const [x, y] = at;
  return (
    <g className={bob ? 'town-bob' : undefined} style={{ pointerEvents: 'none' }}>
      <rect x={x - w / 2} y={y - 30} width={w} height={22} rx={11} fill={color} stroke={TAG_INK} strokeWidth={2} />
      <polygon points={pts([[x - 6, y - 9], [x + 6, y - 9], [x, y - 1]])} fill={color} stroke={TAG_INK} strokeWidth={2} strokeLinejoin="round" />
      <rect x={x - 5} y={y - 11} width={10} height={3} fill={color} />
      <text x={x} y={y - 19} fontSize={12} fontWeight={800} fill="#fff" textAnchor="middle" dominantBaseline="central" fontFamily="'Baloo 2', Nunito, sans-serif">
        {text}
      </text>
    </g>
  );
}
