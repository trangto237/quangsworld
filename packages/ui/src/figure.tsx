import type { Figure } from '@atlas/shared';

/**
 * Geometry diagrams for questions, drawn roughly to scale in SVG. Lines use the text colour, so they
 * work on light and dark cards; the unknown is a bold amber "?".
 */
type Pt = [number, number];

const W = 240;
const H = 150;
const PAD = 26;

/** Scales points to fit the box, keeping proportions. */
function fit(points: Pt[], padLeft = PAD, padRight = PAD): (p: Pt) => Pt {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const s = Math.min((W - padLeft - padRight) / (x1 - x0 || 1), (H - 2 * PAD) / (y1 - y0 || 1));
  const ox = padLeft + (W - padLeft - padRight - (x1 - x0) * s) / 2;
  const oy = (H - (y1 - y0) * s) / 2;
  // SVG y grows downwards: flip so shapes sit "upright".
  return ([x, y]) => [ox + (x - x0) * s, H - (oy + (y - y0) * s)];
}

const path = (pts: Pt[], close = true) => `M${pts.map((p) => p.map((v) => v.toFixed(1)).join(' ')).join(' L')}${close ? ' Z' : ''}`;
const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const centroid = (pts: Pt[]): Pt => [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];
/** Moves `p` away from `from` by `d` pixels (for labels outside a side, or inside a corner). */
const away = (p: Pt, from: Pt, d: number): Pt => {
  const dx = p[0] - from[0];
  const dy = p[1] - from[1];
  const len = Math.hypot(dx, dy) || 1;
  return [p[0] + (dx / len) * d, p[1] + (dy / len) * d];
};
const toward = (p: Pt, to: Pt, d: number) => away(p, to, -d);

function Label({ at, text, ask, anchor = 'middle' }: { at: Pt; text: string; ask?: boolean; anchor?: 'start' | 'middle' | 'end' }) {
  return (
    <text
      x={at[0]}
      y={at[1]}
      textAnchor={anchor}
      dominantBaseline="central"
      fontSize={ask ? 17 : 13}
      fontWeight={ask ? 800 : 600}
      fill={ask ? '#f59e0b' : 'currentColor'}
    >
      {text}
    </text>
  );
}

/** Small arc marking the angle at `v` between rays to `a` and `b`. */
function AngleArc({ v, a, b, r = 16 }: { v: Pt; a: Pt; b: Pt; r?: number }) {
  const p = toward(v, a, r);
  const q = toward(v, b, r);
  const cross = (a[0] - v[0]) * (b[1] - v[1]) - (a[1] - v[1]) * (b[0] - v[0]);
  return <path d={`M${p[0]} ${p[1]} A${r} ${r} 0 0 ${cross > 0 ? 1 : 0} ${q[0]} ${q[1]}`} fill="none" stroke="currentColor" strokeOpacity={0.6} />;
}

function RightMark({ v, a, b, s = 10 }: { v: Pt; a: Pt; b: Pt; s?: number }) {
  const p = toward(v, a, s);
  const q = toward(v, b, s);
  const c: Pt = [p[0] + q[0] - v[0], p[1] + q[1] - v[1]];
  return <path d={path([p, c, q], false)} fill="none" stroke="currentColor" strokeOpacity={0.7} />;
}

const shape = {
  fill: 'rgb(99 102 241 / 0.12)',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinejoin: 'round' as const,
};
const deg = (n: number) => `${n}°`;
const len = (n: number, unit?: string) => `${n}${unit ? ` ${unit}` : ''}`;

function draw(f: Figure) {
  switch (f.kind) {
    case 'triangle': {
      const [A, B] = f.angles.map((x) => (x * Math.PI) / 180);
      // A at the origin, B on the x-axis; C where the two angles meet.
      const t = Math.sin(B) / Math.sin(A + B);
      const raw: Pt[] = [
        [0, 0],
        [1, 0],
        [t * Math.cos(A), t * Math.sin(A)],
      ];
      const m = fit(raw);
      const pts = raw.map(m);
      const c = centroid(pts);
      return (
        <>
          <path d={path(pts)} {...shape} />
          {pts.map((v, i) => (
            <g key={i}>
              <AngleArc v={v} a={pts[(i + 1) % 3]} b={pts[(i + 2) % 3]} />
              <Label at={toward(v, c, 30)} text={f.ask === i ? '?' : deg(f.angles[i])} ask={f.ask === i} />
            </g>
          ))}
        </>
      );
    }
    case 'line-angles': {
      const a = (f.angle * Math.PI) / 180;
      const O: Pt = [W / 2, H - 40];
      const L: Pt = [PAD, O[1]];
      const R: Pt = [W - PAD, O[1]];
      const P: Pt = [O[0] + Math.cos(Math.PI - a) * 90, O[1] - Math.sin(Math.PI - a) * 90];
      // The given angle sits between the left half of the line and the ray; labels go on each bisector.
      const dirL = Math.PI - a / 2;
      const dirR = (Math.PI - a) / 2;
      // Narrow angles get their label further out, clear of the lines.
      const at = (dir: number, size: number): Pt => {
        const d = size < 70 ? 52 : 38;
        return [O[0] + Math.cos(dir) * d, O[1] - Math.sin(dir) * d];
      };
      return (
        <>
          <path d={path([L, R], false)} stroke="currentColor" strokeWidth={2} />
          <path d={path([O, P], false)} stroke="currentColor" strokeWidth={2} />
          <AngleArc v={O} a={L} b={P} r={18} />
          <AngleArc v={O} a={P} b={R} r={22} />
          <Label at={at(dirL, f.angle)} text={f.ask === 0 ? '?' : deg(f.angle)} ask={f.ask === 0} />
          <Label at={at(dirR, 180 - f.angle)} text={f.ask === 1 ? '?' : deg(180 - f.angle)} ask={f.ask === 1} />
        </>
      );
    }
    case 'polygon': {
      const n = f.sides;
      const raw: Pt[] = Array.from({ length: n }, (_, i) => {
        const t = -Math.PI / 2 - Math.PI / n + (2 * Math.PI * i) / n;
        return [Math.cos(t), -Math.sin(t)];
      });
      const pts = raw.map(fit(raw));
      const c = centroid(pts);
      return (
        <>
          <path d={path(pts)} {...shape} />
          {f.askAngle && (
            <>
              <AngleArc v={pts[0]} a={pts[1]} b={pts[n - 1]} r={14} />
              <Label at={toward(pts[0], c, 28)} text="?" ask />
            </>
          )}
          <Label at={c} text={`${n} sides`} />
        </>
      );
    }
    case 'rect': {
      const ratio = Math.max(0.35, Math.min(2.8, f.w / f.h));
      const raw: Pt[] = [
        [0, 0],
        [ratio, 0],
        [ratio, 1],
        [0, 1],
      ];
      const pts = raw.map(fit(raw, PAD, 64));
      return (
        <>
          <path d={path(pts)} {...shape} />
          <Label at={[mid(pts[0], pts[1])[0], pts[0][1] + 13]} text={len(f.w, f.unit)} />
          <Label at={[pts[1][0] + 6, mid(pts[1], pts[2])[1]]} text={len(f.h, f.unit)} anchor="start" />
        </>
      );
    }
    case 'tri-area': {
      const ratio = Math.max(0.5, Math.min(3, f.base / f.height));
      const apex = ratio * 0.35;
      const raw: Pt[] = [
        [0, 0],
        [ratio, 0],
        [apex, 1],
      ];
      const m = fit(raw, 80, PAD);
      const pts = raw.map(m);
      const foot = m([apex, 0]);
      return (
        <>
          <path d={path(pts)} {...shape} />
          <path d={path([pts[2], foot], false)} stroke="currentColor" strokeDasharray="4 3" strokeOpacity={0.8} />
          <RightMark v={foot} a={pts[1]} b={pts[2]} s={8} />
          <Label at={[mid(pts[0], pts[1])[0], pts[0][1] + 13]} text={`base ${len(f.base, f.unit)}`} />
          <Label at={[pts[0][0] - 6, mid(foot, pts[2])[1]]} text={`h = ${len(f.height, f.unit)}`} anchor="end" />
        </>
      );
    }
    case 'trapezium': {
      const top = Math.max(0.3, f.a / f.b);
      const hh = Math.max(0.3, Math.min(1.2, f.h / f.b));
      const off = (1 - top) / 2;
      const raw: Pt[] = [
        [0, 0],
        [1, 0],
        [off + top, hh],
        [off, hh],
      ];
      const m = fit(raw, 80, PAD);
      const pts = raw.map(m);
      const foot = m([off, 0]);
      return (
        <>
          <path d={path(pts)} {...shape} />
          <path d={path([pts[3], foot], false)} stroke="currentColor" strokeDasharray="4 3" strokeOpacity={0.8} />
          <RightMark v={foot} a={pts[1]} b={pts[3]} s={8} />
          <Label at={[mid(pts[0], pts[1])[0], pts[0][1] + 13]} text={len(f.b, f.unit)} />
          <Label at={[mid(pts[2], pts[3])[0], pts[3][1] - 12]} text={len(f.a, f.unit)} />
          <Label at={[pts[0][0] - 6, mid(foot, pts[3])[1]]} text={`h = ${len(f.h, f.unit)}`} anchor="end" />
        </>
      );
    }
    case 'right-triangle': {
      const raw: Pt[] = [
        [0, 0],
        [f.b, 0],
        [0, f.a],
      ];
      const pts = raw.map(fit(raw));
      const c = centroid(pts);
      const side = (i: number, j: number, text: string, ask: boolean) => <Label at={away(mid(pts[i], pts[j]), c, 14)} text={ask ? '?' : text} ask={ask} />;
      return (
        <>
          <path d={path(pts)} {...shape} />
          <RightMark v={pts[0]} a={pts[1]} b={pts[2]} />
          {side(0, 2, String(f.a), f.ask === 'a')}
          {side(0, 1, String(f.b), f.ask === 'b')}
          {side(1, 2, String(f.c), f.ask === 'c')}
        </>
      );
    }
    case 'circle': {
      const C: Pt = [W / 2, H / 2];
      const R = H / 2 - 14;
      const E: Pt = [C[0] + R * Math.cos(-0.5), C[1] + R * Math.sin(-0.5)];
      return (
        <>
          <circle cx={C[0]} cy={C[1]} r={R} {...shape} />
          <circle cx={C[0]} cy={C[1]} r={2.5} fill="currentColor" />
          <path d={path([C, E], false)} stroke="currentColor" strokeWidth={2} />
          <Label at={[C[0], C[1] + 20]} text={`r = ${len(f.r, f.unit)}`} />
        </>
      );
    }
  }
}

export function FigureView({ figure, className }: { figure: Figure; className?: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className ?? 'mx-auto my-2 block h-auto w-full max-w-[280px]'} role="img" aria-label="Diagram">
      {draw(figure)}
    </svg>
  );
}
