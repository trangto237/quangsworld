import { describe, expect, it } from 'vitest';
import { generators } from '@atlas/content';
import { rng } from '@atlas/shared';

/** A maths string from a question as a number: "2√13", "5π/2", "64 − 16π", "−3/4", "35°", "4.27". */
function ev(e: string): number {
  const js = e
    .replace(/°/g, '')
    .replace(/−/g, '-')
    .replace(/·/g, '*')
    .replace(/√(\d+)/g, 'Math.sqrt($1)')
    .replace(/π/g, 'Math.PI')
    .replace(/(\d|\))\s*(?=Math|\()/g, '$1*');
  return Function(`return (${js});`)() as number;
}
const rad = (x: number) => (x * Math.PI) / 180;
const deg = (x: number) => (x * 180) / Math.PI;
const T: Record<string, (x: number) => number> = {
  sin: (x) => Math.sin(rad(x)),
  cos: (x) => Math.cos(rad(x)),
  tan: (x) => Math.tan(rad(x)),
  cot: (x) => 1 / Math.tan(rad(x)),
};
/** "2sin²30° + tan 20°·tan 70°" as a number. */
function evTrig(e: string): number {
  const js = e
    .replace(/(sin|cos|tan|cot)²(\d+)°/g, '(T.$1($2)**2)')
    .replace(/(sin|cos|tan|cot) (\d+)°/g, '(T.$1($2))')
    .replace(/−/g, '-')
    .replace(/·/g, '*')
    .replace(/(\d)(?=\()/g, '$1*');
  return Function('T', `return (${js});`)(T) as number;
}

type Check = [RegExp, (n: number[], m: RegExpMatchArray) => number, number?];
/** Each prompt template with an independent re-derivation of its answer (groups arrive as numbers). Optional third
 * entry: the answer is rounded to that many decimal places. */
const CHECKS: Record<string, Check[]> = {
  'math.geometry.pythagoras': [
    [/legs (\d+) cm and (\d+) cm\. Find the hypotenuse/, ([a, b]) => Math.hypot(a, b)],
    [/hypotenuse (\d+) cm and one leg (\d+) cm/, ([c, a]) => Math.sqrt(c * c - a * a)],
    [/two equal sides (\d+) cm and base (\d+) cm/, ([s, b]) => (b / 2) * Math.sqrt(s * s - (b / 2) ** 2)],
    [/rhombus has diagonals (\d+) cm and (\d+) cm/, ([p, q]) => 4 * Math.hypot(p / 2, q / 2)],
    [/AH = (\d+) cm, with H between B and C\. AB = (\d+) cm and AC = (\d+) cm/, ([h, b, c]) => Math.sqrt(b * b - h * h) + Math.sqrt(c * c - h * h)],
    [/parallel sides (\d+) cm and (\d+) cm, and each slanted side is (\d+) cm/, ([a, b, l]) => ((a + b) / 2) * Math.sqrt(l * l - ((b - a) / 2) ** 2)],
    [/A (\d+) m ladder .* foot (\d+) m from the wall\. The foot slides (\d+) m/, ([L, x, s]) => Math.sqrt(L * L - x * x) - Math.sqrt(L * L - (x + s) ** 2)],
  ],
  'math.geometry.area': [
    [/measures (\d+) cm by (\d+) cm\. A right-angled triangle with legs (\d+) cm and (\d+) cm/, ([w, h, p, q]) => w * h - (p * q) / 2],
    [/BC = (\d+) cm, the altitude from A to BC is (\d+) cm, and AC = (\d+) cm/, ([a, h, b]) => (a * h) / b],
    [/rhombus has side (\d+) cm and one diagonal (\d+) cm/, ([s, d]) => 2 * (d / 2) * Math.sqrt(s * s - (d / 2) ** 2)],
    [/regular hexagon has side (\d+) cm/, ([a]) => 6 * (Math.sqrt(3) / 4) * a * a],
    [/equilateral triangle has side (\d+) cm/, ([a]) => (Math.sqrt(3) / 4) * a * a],
    [/From a (\d+) cm by (\d+) cm rectangle/, ([w, h]) => 2 * (w + h)],
    [/garden (\d+) m by (\d+) m is surrounded by a path (\d+) m/, ([w, h, x]) => (w + 2 * x) * (h + 2 * x) - w * h],
    [/Square ABCD has side (\d+) cm\. M and N are the midpoints/, ([a]) => Math.abs(shoelace([[0, 0], [a, a / 2], [a / 2, a]]))],
    [/AB = (\d+) cm and BC = (\d+) cm\. E is on AB with AE = (\d+) cm and F is on BC with BF = (\d+) cm/, ([w, h, x, y]) =>
      // A(0,0) B(w,0) C(w,h) D(0,h)
      Math.abs(shoelace([[0, h], [x, 0], [w, y]]))],
  ],
  'math.geometry.angles': [
    [/exterior angle of a regular (\d+)-gon/, ([n]) => 360 / n],
    [/interior angle of a regular (\d+)-gon/, ([n]) => ((n - 2) * 180) / n],
    [/isosceles at A with angle A = (\d+)°\. Find angle B\./, ([a]) => (180 - a) / 2],
    [/isosceles at A with angle B = (\d+)°\. Find angle A\./, ([b]) => 180 - 2 * b],
    [/exterior angle at C is (\d+)° and angle A = (\d+)°/, ([e, a]) => e - a],
    [/angle A = (\d+)° and angle B = (\d+)°\. The bisector of angle C meets AB at D\. Find angle ADC/, ([a, b]) => {
      const t = triangle(a, b);
      return angleAt(bisectorFoot(t.C, t.A, t.B), t.A, t.C);
    }],
    [/angle A = (\d+)°\. The bisectors of angles B and C meet at I/, ([a]) => {
      const t = triangle(a, (180 - a) / 3);
      const I = incentre(t.A, t.B, t.C);
      return angleAt(I, t.B, t.C);
    }],
    [/interior angles of a convex polygon add up to (\d+)°/, ([s]) => {
      const n = s / 180 + 2;
      let c = 0;
      for (let i = 0; i < n; i++) for (let j = i + 2; j < n; j++) if (!(i === 0 && j === n - 1)) c++;
      return c;
    }],
    [/isosceles at A with angle A = (\d+)°\. The bisector of angle B meets AC at D\. Find angle ADB/, ([a]) => {
      const t = triangle(a, (180 - a) / 2);
      return angleAt(bisectorFoot(t.B, t.A, t.C), t.A, t.B);
    }],
    [/angle B = (\d+)° and angle C = (\d+)°\. AH is the altitude and AD the angle bisector from A/, ([b, c]) => {
      const B: P = [0, 0], C: P = [1, 0];
      const A = apex(B, C, b, c);
      return angleAt(A, [A[0], 0], bisectorFoot(A, B, C));
    }],
  ],
  'math.geometry.circles': [
    [/radius (\d+) cm\. Find its area/, ([r]) => Math.PI * r * r],
    [/diameter (\d+) cm\. Find its area/, ([d]) => (Math.PI * d * d) / 4],
    [/perimeter of a semicircle of radius (\d+) cm/, ([r]) => Math.PI * r + 2 * r],
    [/area of a semicircle of radius (\d+) cm/, ([r]) => (Math.PI * r * r) / 2],
    [/radius (\d+) cm\. A second circle has an area (\d+) times/, ([r, k]) => Math.sqrt((k * Math.PI * r * r) / Math.PI)],
    [/circle of radius (\d+) cm is inscribed in a square/, ([r]) => (2 * r) ** 2 - Math.PI * r * r],
    [/square is inscribed in a circle of radius (\d+) cm/, ([r]) => Math.PI * r * r - (r * Math.SQRT2) ** 2],
    [/increased from (\d+) cm to (\d+) cm/, ([a, b]) => Math.PI * (b * b - a * a)],
  ],
};

// ── Coordinate helpers for the angle checks ─────────────────────────────
type P = [number, number];
const sub = (a: P, b: P): P => [a[0] - b[0], a[1] - b[1]];
/** The angle at vertex v between rays to a and b, in degrees. */
function angleAt(v: P, a: P, b: P): number {
  const [u, w] = [sub(a, v), sub(b, v)];
  return deg(Math.acos((u[0] * w[0] + u[1] * w[1]) / (Math.hypot(...u) * Math.hypot(...w))));
}
/** Apex A above BC with angles B and C (degrees). */
function apex(B: P, C: P, b: number, c: number): P {
  const L = C[0] - B[0];
  const x = (L * Math.tan(rad(c))) / (Math.tan(rad(b)) + Math.tan(rad(c)));
  return [B[0] + x, x * Math.tan(rad(b))];
}
/** Triangle with angle A at A and angle B at B (A at the origin, B on the x-axis). */
function triangle(a: number, b: number) {
  const A: P = [0, 0], B: P = [1, 0];
  const C = apex(A, B, a, b);
  return { A, B, C };
}
/** Foot on side ab of the bisector from v. */
function bisectorFoot(v: P, a: P, b: P): P {
  const [da, db] = [Math.hypot(...sub(a, v)), Math.hypot(...sub(b, v))];
  const t = da / (da + db);
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}
function incentre(A: P, B: P, C: P): P {
  const [a, b, c] = [Math.hypot(...sub(B, C)), Math.hypot(...sub(A, C)), Math.hypot(...sub(A, B))];
  const s = a + b + c;
  return [(a * A[0] + b * B[0] + c * C[0]) / s, (a * A[1] + b * B[1] + c * C[1]) / s];
}
function shoelace(pts: P[]): number {
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const [p, q] = [pts[i], pts[(i + 1) % pts.length]];
    s += p[0] * q[1] - q[0] * p[1];
  }
  return s / 2;
}

const IDS = Object.keys(CHECKS);
const gen = (id: string, d: number, s: number) => generators[id](d, rng(s * 11 + d));

describe('grade 9 geometry', () => {
  it('every question is complete and bilingual', () => {
    for (const id of IDS)
      for (let d = 1; d <= 5; d++)
        for (let s = 1; s <= 150; s++) {
          const g = gen(id, d, s);
          const where = `${id} d${d} s${s}: ${g.prompt}`;
          expect(g.promptVi, where).toBeTruthy();
          expect(g.explanation, where).toBeTruthy();
          expect(g.explanationVi, where).toBeTruthy();
          expect(new Set(g.distractors).size, where).toBeGreaterThanOrEqual(2);
          expect(g.distractors, where).not.toContain(g.answer);
          const all = `${g.prompt} ${g.promptVi} ${g.answer} ${g.distractors.join(' ')} ${g.explanation} ${g.explanationVi}`;
          expect(all, where).not.toMatch(/NaN|undefined|Infinity|null|\+ -|- -|−−|\[object/);
        }
  });

  it('every answer is correct, and no distractor has the same value', () => {
    for (const id of IDS)
      for (let d = 1; d <= 5; d++)
        for (let s = 1; s <= 150; s++) {
          const g = gen(id, d, s);
          const where = `${id} d${d} s${s}: ${g.prompt} → ${g.answer}`;
          const hit = CHECKS[id].map(([re, f, dp]) => [g.prompt.match(re), f, dp] as const).find(([m]) => m);
          expect(hit, `no check for ${where}`).toBeTruthy();
          const [m, f, dp] = hit!;
          const nums = m!.slice(1).map((x) => (x === undefined ? NaN : ev(x)));
          const want = f(nums, m!);
          const got = ev(g.answer);
          if (dp === undefined) expect(Math.abs(got - want), where).toBeLessThan(1e-6);
          else expect(g.answer.replace('°', ''), where).toBe(want.toFixed(dp));
          for (const x of g.distractors) expect(Math.abs(ev(x) - got), `${where} | ${x}`).toBeGreaterThan(1e-9);
        }
  });
});

export { evTrig };
