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
  'math.geometry.trig': [
    [/right-angled at A with AB = (\d+) cm and (BC|AC) = (\d+) cm\. Find (sin|cos|tan|cot) (B|C)\./, ([ab, , x], m) => {
      const ac = m[2] === 'AC' ? x : Math.sqrt(x * x - ab * ab);
      const B = deg(Math.atan(ac / ab));
      return T[m[4]](m[5] === 'B' ? B : 90 - B);
    }],
    [/^Compute: (.*)$/, (_n, m) => evTrig(m[1])],
    [/with (sin|cos) α = (\d+)\/(\d+)\. Find (sin|cos|tan|cot) α/, ([, p, q], m) => T[m[4]](deg(m[1] === 'sin' ? Math.asin(p / q) : Math.acos(p / q)))],
    [/BC = (\d+) cm and angle B = (\d+)°\. Find (AC|AB) \(cm\), rounded to 2 decimal places/, ([c, b], m) => c * (m[3] === 'AC' ? T.sin(b) : T.cos(b)), 2],
    [/AB = (\d+) cm and AC = (\d+) cm\. Find angle B, rounded to the nearest degree/, ([ab, ac]) => deg(Math.atan2(ac, ab)), 0],
    [/shadow (\d+) m long when the sun's rays make an angle of (\d+)°/, ([s, a]) => s * T.tan(a), 1],
    [/elevation of the top of a tower is (\d+)°\. From point B, (\d+) m closer to the tower, it is (\d+)°/, ([a, d, b]) => {
      // Foot of the tower at the origin, B at distance x: x·tan b = (x + d)·tan a.
      const x = (d * T.tan(a)) / (T.tan(b) - T.tan(a));
      return x * T.tan(b);
    }, 1],
  ],
  'math.geometry.right-relations': [
    [/BH = (\d+) cm and CH = (\d+) cm\. Find AH/, ([b, c]) => Math.sqrt(b * c)],
    [/BH = (\d+) cm and BC = (\d+) cm\. Find AB/, ([bh, bc]) => {
      const ah = Math.sqrt(bh * (bc - bh));
      return Math.hypot(ah, bh);
    }],
    [/AB = (\d+) cm and AC = (\d+) cm\. (Find|Use)/, ([b, c]) => (b * c) / Math.hypot(b, c)],
    [/AH = (\d+) cm and BH = (\d+) cm\. Find BC/, ([h, bh]) => bh + (h * h) / bh],
    [/AH = (\d+) cm and BH = (\d+) cm\. Find AC/, ([h, bh]) => Math.hypot(h, (h * h) / bh)],
    [/AB < AC\. BC = (\d+) cm and AH = (\d+) cm\. Find BH/, ([a, h]) => (a - Math.sqrt(a * a - 4 * h * h)) / 2],
    [/AB = (\d+) cm and BH = (\d+) cm\. Find the area/, ([ab, bh]) => {
      const ah = Math.sqrt(ab * ab - bh * bh);
      const ch = (ah * ah) / bh;
      return ((bh + ch) * ah) / 2;
    }],
  ],
  'math.geometry.circle-angles': [
    [/central angle AOB = (\d+)°\. C is a point on the major arc AB/, ([x]) => inscribed(x, true)],
    [/inscribed angle ACB = (\d+)° \(C on the major arc AB\)/, ([y]) => {
      // Find the central angle whose inscribed angle is y by bisection.
      let [lo, hi] = [1, 179];
      for (let i = 0; i < 60; i++) {
        const m = (lo + hi) / 2;
        if (inscribed(m, true) < y) lo = m;
        else hi = m;
      }
      return (lo + hi) / 2;
    }],
    [/AB is a diameter of circle \(O\) and C is a point on the circle\. Angle CAB = (\d+)°/, ([x]) => {
      const A: P = [-1, 0], B: P = [1, 0];
      const t = 2 * x; // central angle BOC
      const C: P = [Math.cos(rad(t)), Math.sin(rad(t))];
      return angleAt(B, A, C);
    }],
    [/The arc AB inside angle xAB measures (\d+)°/, ([y]) => {
      // A at angle −90° on the unit circle, tangent x-axis direction; B along the arc of y° counter-clockwise.
      const A: P = [0, -1];
      const B: P = [Math.cos(rad(-90 + y)), Math.sin(rad(-90 + y))];
      return angleAt(A, [1, -1], B);
    }],
    [/cyclic quadrilateral with angle A = (\d+)° and angle B = (\d+)°\. Find angle (C|D)/, ([a, b], m) => {
      const Q = cyclicQuad(a, b);
      return m[3] === 'C' ? angleAt(Q[2], Q[1], Q[3]) : angleAt(Q[3], Q[2], Q[0]);
    }],
    [/AB is extended beyond B to E, and angle CBE = (\d+)°/, ([e]) => {
      const Q = cyclicQuad(100, 180 - e);
      return angleAt(Q[3], Q[0], Q[2]);
    }],
    [/chord of circle \(O\) with angle OAB = (\d+)°\. C is a point on the (major|minor) arc AB/, ([x], m) => {
      const A: P = [1, 0];
      const t = 180 - 2 * x; // central angle AOB
      const B: P = [Math.cos(rad(t)), Math.sin(rad(t))];
      expect(Math.abs(angleAt(A, [0, 0], B) - x)).toBeLessThan(1e-6);
      const C: P = m[2] === 'major' ? [Math.cos(rad(t + (360 - t) / 3)), Math.sin(rad(t + (360 - t) / 3))] : [Math.cos(rad(t / 3)), Math.sin(rad(t / 3))];
      return angleAt(C, A, B);
    }],
    [/inscribed in circle \(O\) and angle BAC = (\d+)°\. Find angle OBC/, ([x]) => {
      // B, C symmetric about the y-axis with central angle 2x; A at the top.
      const O: P = [0, 0];
      const B: P = [-Math.sin(rad(x)), -Math.cos(rad(x))], C: P = [Math.sin(rad(x)), -Math.cos(rad(x))];
      const A: P = [0.3, Math.sqrt(1 - 0.09)];
      expect(Math.abs(angleAt(A, B, C) - x)).toBeLessThan(1e-6);
      return angleAt(B, O, C);
    }],
    [/tangents MA and MB are drawn \(A, B on the circle\), and angle AMB = (\d+)°\. C is a point on the (major|minor) arc AB/, ([x], m) => {
      // M on the x-axis at distance 1/sin(x/2); A, B the points of contact.
      const OM = 1 / Math.sin(rad(x / 2));
      const t = deg(Math.acos(1 / OM)); // angle AOM
      const A: P = [Math.cos(rad(t)), Math.sin(rad(t))], B: P = [Math.cos(rad(t)), -Math.sin(rad(t))];
      expect(Math.abs(angleAt([OM, 0], A, B) - x)).toBeLessThan(1e-6);
      const C: P = m[2] === 'major' ? [-1, 0] : [1, 0];
      return angleAt(C, A, B);
    }],
    [/cyclic quadrilateral with angle BAC = (\d+)° and angle CAD = (\d+)°\. Find angle BCD/, ([p, q]) => {
      // A at angle 270°; inscribed angle p over arc BC means arc BC = 2p.
      const at = (t: number): P => [Math.cos(rad(t)), Math.sin(rad(t))];
      const A = at(270), B = at(280), C = at(280 + 2 * p), D = at(280 + 2 * p + 2 * q);
      expect(Math.abs(angleAt(A, B, C) - p) + Math.abs(angleAt(A, C, D) - q)).toBeLessThan(1e-6);
      return angleAt(C, B, D);
    }],
  ],
  'math.geometry.tangents': [
    [/Point M is (\d+) cm from the centre O of a circle of radius (\d+) cm/, ([om, r]) => Math.sqrt(om * om - r * r)],
    [/radius (\S+) cm, and line a is at distance (\S+) cm from O/, ([r, d]) => (Math.abs(d - r) < 1e-9 ? 1 : d < r ? 2 : 0)],
    [/A chord AB of circle \(O; (\d+) cm\) is (\d+) cm from the centre/, ([r, d]) => 2 * Math.sqrt(r * r - d * d)],
    [/Circle \(O; (\d+) cm\) has a chord AB = (\d+) cm/, ([r, ab]) => Math.sqrt(r * r - (ab / 2) ** 2)],
    [/circle \(O; (\d+) cm\), with OM = (\d+) cm\. Find the length of chord AB/, ([r, om]) => {
      const t = Math.acos(r / om); // angle AOM
      return 2 * r * Math.sin(t);
    }],
    [/circle \(O; (\d+) cm\), and angle AMB = (\d+)°\. Find MA/, ([r, x]) => r / Math.tan(rad(x / 2))],
    [/circle \(O; (\d+) cm\), with OM = (\d+) cm\. Find the area of quadrilateral OAMB/, ([r, om]) => {
      const t = Math.acos(r / om);
      const A: P = [r * Math.cos(t), r * Math.sin(t)], B: P = [A[0], -A[1]];
      return Math.abs(shoelace([[0, 0], A, [om, 0], B]));
    }],
    [/circle \(O; (\d+) cm\), with OM = (\d+) cm\. OM meets AB at H\. Find OH/, ([r, om]) => r * Math.cos(Math.acos(r / om))],
  ],
  'math.geometry.arcs': [
    [/length of an arc of (\d+)° on a circle of radius (\d+) cm/, ([n, r]) => 2 * Math.PI * r * (n / 360)],
    [/area of a sector of (\d+)° in a circle of radius (\d+) cm/, ([n, r]) => Math.PI * r * r * (n / 360)],
    [/concentric circles have radii (\d+) cm and (\d+) cm/, ([a, b]) => Math.PI * (a * a - b * b)],
    [/An arc of (\d+)° has length (\S+) cm\. Find the radius/, ([n, l]) => l / (2 * Math.PI * (n / 360))],
    [/Chord AB of circle \(O; (\d+) cm\) subtends a central angle of (\d+)°/, ([r, n]) => (Math.PI * r * r * n) / 360 - 0.5 * r * r * Math.sin(rad(n))],
    [/minute hand of a clock is (\d+) cm long\. How far does its tip travel in (\d+) minutes/, ([l, t]) => 2 * Math.PI * l * (t / 60)],
    [/Square ABCD has side (\d+) cm\. At each vertex a quarter circle of radius (\d+) cm/, ([a, q]) => a * a - 4 * (Math.PI * q * q) / 4],
  ],
  'math.geometry.solids': [
    [/cylinder has base radius (\d+) cm and height (\d+) cm\. Find its volume/, ([r, h]) => Math.PI * r * r * h],
    [/cone has base radius (\d+) cm and height (\d+) cm\. Find its volume/, ([r, h]) => (Math.PI * r * r * h) / 3],
    [/closed cylinder has base radius (\d+) cm and height (\d+) cm/, ([r, h]) => 2 * Math.PI * r * h + 2 * Math.PI * r * r],
    [/volume of a sphere of radius (\d+) cm/, ([r]) => (4 / 3) * Math.PI * r ** 3],
    [/ball has diameter (\d+) cm/, ([d]) => Math.PI * d * d],
    [/cone has base radius (\d+) cm and height (\d+) cm\. Find its (total|lateral) surface area/, ([r, h], m) => Math.PI * r * Math.hypot(r, h) + (m[3] === 'total' ? Math.PI * r * r : 0)],
    [/sphere has surface area (\S+) cm²/, ([s]) => (4 / 3) * Math.PI * Math.sqrt(s / (4 * Math.PI)) ** 3],
    [/inner radius (\d+) cm contains water\. A metal ball of radius (\d+) cm/, ([R, s]) => ((4 / 3) * Math.PI * s ** 3) / (Math.PI * R * R)],
    [/cylinder of radius (\d+) m and height (\d+) m with a cone of the same radius and height (\d+) m/, ([r, h, k]) => Math.PI * r * r * h + (Math.PI * r * r * k) / 3],
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
/** Inscribed angle at a point of the major (or minor) arc, for a central angle t: computed from coordinates. */
function inscribed(t: number, major: boolean): number {
  const A: P = [1, 0], B: P = [Math.cos(rad(t)), Math.sin(rad(t))];
  const c = major ? t + (360 - t) / 2 : t / 2;
  return angleAt([Math.cos(rad(c)), Math.sin(rad(c))], A, B);
}
/** Points A, B, C, D on the unit circle with angle DAB = a and angle ABC = b (via the arcs they cut off). */
function cyclicQuad(a: number, b: number): P[] {
  // DAB is half the arc BCD and ABC half the arc CDA: BC + CD = 2a, CD + DA = 2b, all four arcs positive.
  const CD = (Math.max(0, 2 * a + 2 * b - 360) + Math.min(2 * a, 2 * b)) / 2;
  const BC = 2 * a - CD, DA = 2 * b - CD, AB = 360 - BC - CD - DA;
  const at = (t: number): P => [Math.cos(rad(t)), Math.sin(rad(t))];
  const Q = [at(0), at(AB), at(AB + BC), at(AB + BC + CD)];
  expect(Math.abs(angleAt(Q[0], Q[3], Q[1]) - a), 'cyclic quad A').toBeLessThan(1e-6);
  expect(Math.abs(angleAt(Q[1], Q[0], Q[2]) - b), 'cyclic quad B').toBeLessThan(1e-6);
  return Q;
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
          const nums = m!.slice(1).map((x) => (x !== undefined && /^[\d√π.−/ ]+$/.test(x) ? ev(x) : NaN));
          const want = f(nums, m!);
          const got = ev(g.answer);
          if (dp === undefined) expect(Math.abs(got - want), where).toBeLessThan(1e-6);
          else expect(g.answer.replace('°', ''), where).toBe(want.toFixed(dp));
          for (const x of g.distractors) expect(Math.abs(ev(x) - got), `${where} | ${x}`).toBeGreaterThan(1e-9);
        }
  });
});

