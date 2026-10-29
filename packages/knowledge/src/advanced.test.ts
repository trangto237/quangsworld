/**
 * Advanced maths (chuyên Toán / HSG Toán 9): every generated question is complete and bilingual, and
 * every answer is re-derived here by brute force — enumerating integers, exact BigInt powers, scanning
 * a fine grid for minima and roots, or building the figure in coordinates.
 */
import { describe, expect, it } from 'vitest';
import { concepts, generators } from '@atlas/content';
import { rng } from '@atlas/shared';
import type { Generated } from '@atlas/content';

const SEEDS = 150;
const gen = (id: string, d: number, seed: number) => generators[id](d, rng(seed * 11 + d));

/** "−12" → −12, "25/4" → 6.25. */
const val = (s: string) => {
  const t = s.replace(/−/g, '-').trim();
  if (t.includes('/')) {
    const [a, b] = t.split('/');
    return +a / +b;
  }
  return +t;
};
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const unsup = (s: string) => +[...s].map((c) => SUP.indexOf(c)).join('');
const close = (a: number, b: number, eps = 1e-6) => Math.abs(a - b) < eps;

/** An expression in n (or x) written the way the questions write it → a JS function. */
function fn(e: string, v = 'n'): (x: number) => number {
  const js = e
    .replace(/−/g, '-')
    .replace(/·/g, '*')
    .replace(/([a-z])([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (_, v, m) => `(${v}**${unsup(m)})`)
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (m) => `**${unsup(m)}`)
    .replace(/\b([a-z])\s*\(/g, '$1*(')
    .replace(/√\(/g, 'Math.sqrt(')
    .replace(/√([a-z])/g, 'Math.sqrt($1)')
    .replace(/(\d|\))\s*(?=[a-z(]|Math)/g, '$1*');
  return Function(v, `return (${js});`) as (x: number) => number;
}

/** "xy + 3x − 2y" → (x, y) => …, for brute-force searches. */
function fn2(e: string): (x: number, y: number) => number {
  const js = e
    .replace(/−/g, '-')
    .replace(/xy/g, 'x*y')
    .replace(/([a-z])([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (_, v, m) => `(${v}**${unsup(m)})`)
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (m) => `**${unsup(m)}`)
    .replace(/(\d)\s*(?=[xy(])/g, '$1*');
  return Function('x', 'y', `return (${js});`) as (x: number, y: number) => number;
}
/** An expression in any one-letter variables: fnv("ab + bc + ca", ["a", "b", "c"]). */
function fnv(e: string, vars: string[]): (...v: number[]) => number {
  const js = e
    .replace(/−/g, '-')
    .replace(/·/g, '*')
    .replace(/([a-z])([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (_, v, m) => `(${v}**${unsup(m)})`)
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (m) => `**${unsup(m)}`)
    .replace(/([a-z])(?=[a-z(])/g, '$1*')
    .replace(/(\d|\))\s*(?=[a-z(])/g, '$1*');
  return Function(...vars, `return (${js});`) as (...v: number[]) => number;
}
/** All real roots of f on [lo, hi], by scanning for sign changes and bisecting. */
function realRoots(f: (x: number) => number, lo = -60, hi = 60, step = 1e-3): number[] {
  const out: number[] = [];
  let x0 = lo, f0 = f(x0);
  for (let x1 = lo + step; x1 <= hi; x1 += step) {
    const f1 = f(x1);
    if (Number.isFinite(f0) && Number.isFinite(f1)) {
      if (f0 === 0) out.push(x0);
      else if (f0 * f1 < 0) {
        let [a, b, fa] = [x0, x1, f0];
        for (let i = 0; i < 60; i++) {
          const m = (a + b) / 2, fm = f(m);
          if (fa * fm <= 0) b = m;
          else [a, fa] = [m, fm];
        }
        const x = (a + b) / 2;
        if (Math.abs(f(x)) < 1e-7) out.push(x); // a sign change across a pole is not a root
      }
    }
    [x0, f0] = [x1, f1];
  }
  return out;
}
/** Smallest value of f on (lo, hi) and where it is: a fine grid, then golden-section refinement. */
function argmin(f: (x: number) => number, lo: number, hi: number, n = 60000): { x: number; v: number } {
  const h = (hi - lo) / n;
  let bx = lo + h / 2, bv = Infinity;
  for (let i = 0; i < n; i++) {
    const x = lo + (i + 0.5) * h, v = f(x);
    if (v < bv) [bx, bv] = [x, v];
  }
  let [a, b] = [Math.max(lo, bx - h), Math.min(hi, bx + h)];
  const g = (Math.sqrt(5) - 1) / 2;
  for (let i = 0; i < 200; i++) {
    const c = b - g * (b - a), d = a + g * (b - a);
    if (f(c) < f(d)) b = d;
    else a = c;
  }
  const x = (a + b) / 2;
  return { x, v: Math.min(f(x), bv) };
}
/** Minimum of a convex f(x, y) by nested ternary search. */
function min2(f: (x: number, y: number) => number): number {
  const tern = (g: (t: number) => number) => {
    let [a, b] = [-100, 100];
    for (let i = 0; i < 120; i++) {
      const c = a + (b - a) / 3, d = b - (b - a) / 3;
      if (g(c) < g(d)) b = d;
      else a = c;
    }
    return g((a + b) / 2);
  };
  return tern((x) => tern((y) => f(x, y)));
}
// ── Plane geometry helpers for the coordinate checks ──
type Pt = [number, number];
const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
const len = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const area = (...ps: Pt[]) => Math.abs(ps.reduce((s, p, i) => s + p[0] * ps[(i + 1) % ps.length][1] - ps[(i + 1) % ps.length][0] * p[1], 0)) / 2;
/** The angle at vertex V between rays VA and VB, in degrees. */
const angle = (A: Pt, V: Pt, B: Pt) => {
  const [u, w] = [sub(A, V), sub(B, V)];
  return (Math.acos((u[0] * w[0] + u[1] * w[1]) / (Math.hypot(...u) * Math.hypot(...w))) * 180) / Math.PI;
};
const onUnit = (deg: number): Pt => [Math.cos((deg * Math.PI) / 180), Math.sin((deg * Math.PI) / 180)];
/** Where lines PQ and RS meet. */
const meet = (P: Pt, Q: Pt, R: Pt, S: Pt): Pt => {
  const [d1, d2] = [sub(Q, P), sub(S, R)];
  const t = ((R[0] - P[0]) * d2[1] - (R[1] - P[1]) * d2[0]) / (d1[0] * d2[1] - d1[1] * d2[0]);
  return [P[0] + t * d1[0], P[1] + t * d1[1]];
};
/** Circle through three points: [centre, radius]. */
const circle = (A: Pt, B: Pt, C: Pt): [Pt, number] => {
  const d = 2 * (A[0] * (B[1] - C[1]) + B[0] * (C[1] - A[1]) + C[0] * (A[1] - B[1]));
  const sq = (p: Pt) => p[0] ** 2 + p[1] ** 2;
  const O: Pt = [(sq(A) * (B[1] - C[1]) + sq(B) * (C[1] - A[1]) + sq(C) * (A[1] - B[1])) / d, (sq(A) * (C[0] - B[0]) + sq(B) * (A[0] - C[0]) + sq(C) * (B[0] - A[0])) / d];
  return [O, len(O, A)];
};
/** The other point where line PK meets the circle, K being a point of the line already on the circle. */
const other = (P: Pt, K: Pt, [O, R]: [Pt, number]): Pt => {
  const u = sub(K, P), w = sub(P, O);
  const a = u[0] ** 2 + u[1] ** 2, b = 2 * (u[0] * w[0] + u[1] * w[1]), c = w[0] ** 2 + w[1] ** 2 - R * R;
  const s = Math.sqrt(b * b - 4 * a * c);
  const pts = [(-b - s) / (2 * a), (-b + s) / (2 * a)].map((t): Pt => [P[0] + t * u[0], P[1] + t * u[1]]);
  return len(pts[0], K) > len(pts[1], K) ? pts[0] : pts[1];
};
const isSq = (n: number) => n >= 0 && Math.round(Math.sqrt(n)) ** 2 === n;

const bigPow = (a: number, n: number) => BigInt(a) ** BigInt(n);
const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const isPrime = (n: number) => {
  if (n < 2) return false;
  for (let p = 2; p * p <= n; p++) if (n % p === 0) return false;
  return true;
};

/** Each checker re-derives the answer of a prompt and returns it as a string (or null if it doesn't recognise the prompt). */
const checkers: Record<string, (p: string, g: Generated) => string | number | null> = {
  'math.adv.number-theory': (p) => {
    let m = p.match(/^What is the last digit of (\d+)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)\?$/);
    if (m) return String(bigPow(+m[1], unsup(m[2])) % 10n);
    m = p.match(/^Find the remainder when (\d+)([⁰¹²³⁴⁵⁶⁷⁸⁹]+) is divided by (\d+)\.$/);
    if (m) return String(bigPow(+m[1], unsup(m[2])) % BigInt(m[3]));
    m = p.match(/^Find the remainder when (\d+)([⁰¹²³⁴⁵⁶⁷⁸⁹]+) \+ (\d+)([⁰¹²³⁴⁵⁶⁷⁸⁹]+) is divided by (\d+)\.$/);
    if (m) return String((bigPow(+m[1], unsup(m[2])) + bigPow(+m[3], unsup(m[4]))) % BigInt(m[5]));
    m = p.match(/^How many positive divisors does (\d+) have\?$/);
    if (m) {
      let c = 0;
      for (let k = 1; k <= +m[1]; k++) if (+m[1] % k === 0) c++;
      return String(c);
    }
    m = p.match(/^For positive integers a, b: gcd\(a, b\) = (\d+) and lcm\(a, b\) = (\d+)\. If a = (\d+), what is b\?$/);
    if (m) {
      const [g, L, a] = [+m[1], +m[2], +m[3]];
      const bs: number[] = [];
      for (let b = 1; b <= L; b++) if (gcd(a, b) === g && (a * b) / g === L) bs.push(b);
      return bs.length === 1 ? String(bs[0]) : 'not unique';
    }
    m = p.match(/^How many integers n with 1 ≤ n ≤ (\d+) make n² \+ (\d+) divisible by (\d+)\?$/);
    if (m) {
      let c = 0;
      for (let n = 1; n <= +m[1]; n++) if ((n * n + +m[2]) % +m[3] === 0) c++;
      return String(c);
    }
    m = p.match(/^What is the largest integer that divides (.+) for every integer n\?$/);
    if (m) {
      const f = fn(m[1]);
      let g = 0;
      for (let n = -30; n <= 30; n++) g = gcd(g, f(n));
      return String(g);
    }
    m = p.match(/^Find the prime p such that p \+ (\d+) and p \+ (\d+) are also prime\.$/);
    if (m) {
      const ps: number[] = [];
      for (let x = 2; x < 20000; x++) if (isPrime(x) && isPrime(x + +m[1]) && isPrime(x + +m[2])) ps.push(x);
      return ps.join(', ');
    }
    m = p.match(/^What is the smallest positive integer n such that (\d+)ⁿ − 1 is divisible by (\d+)\?$/);
    if (m) {
      for (let n = 1; n < 200; n++) if ((bigPow(+m[1], n) - 1n) % BigInt(m[2]) === 0n) return String(n);
    }
    return null;
  },

  'math.adv.diophantine': (p) => {
    let m = p.match(/^How many ordered pairs of non-zero integers \(x, y\) satisfy 1\/x \+ 1\/y = 1\/(\d+)\?$/);
    if (m) {
      const n = +m[1];
      let c = 0;
      for (let x = -400; x <= 400; x++) for (let y = -400; y <= 400; y++) if (x && y && n * (x + y) === x * y) c++;
      return String(c);
    }
    m = p.match(/^How many ordered pairs of positive integers \(x, y\) satisfy 1\/x \+ 1\/y = 1\/(\d+)\?$/);
    if (m) {
      const n = +m[1];
      let c = 0;
      for (let x = 1; x <= 400; x++) for (let y = 1; y <= 400; y++) if (n * (x + y) === x * y) c++;
      return String(c);
    }
    m = p.match(/^How many ordered pairs of (positive integers|integers) \(x, y\) satisfy (.+) = (−?\d+)\?$/);
    if (m) {
      const f = fn2(m[2]), c = val(m[3]);
      const [lo, hi] = m[1] === 'integers' ? [-150, 150] : [1, 250];
      let cnt = 0;
      for (let x = lo; x <= hi; x++) for (let y = lo; y <= hi; y++) if (f(x, y) === c) cnt++;
      return String(cnt);
    }
    m = p.match(/^How many integers n make n² \+ (\d+) a perfect square\?$/);
    if (m) {
      let c = 0;
      for (let n = -1000; n <= 1000; n++) if (isSq(n * n + +m[1])) c++;
      return String(c);
    }
    return null;
  },

  'math.adv.identities': (p) => {
    let m = p.match(/^Real numbers a, b satisfy a ([+−]) b = (\S+) and ab = (\S+)\. Find (.+)\.$/);
    if (m) {
      const [k, P] = [val(m[2]), val(m[3])];
      // a + b = k: a, b are roots of t² − kt + P; a − b = k: a and −b are roots of t² − kt − P.
      const disc = k * k + (m[1] === '+' ? -4 * P : 4 * P);
      expect(disc).toBeGreaterThanOrEqual(0);
      const a = (k + Math.sqrt(disc)) / 2, b = m[1] === '+' ? k - a : a - k;
      expect(close(a * b, P)).toBe(true);
      return fnv(m[4], ['a', 'b'])(a, b);
    }
    m = p.match(/^Evaluate (.+) at x = (\d+)\.$/);
    if (m) return fn(m[1], 'x')(+m[2]);
    m = p.match(/^A real number x satisfies x ([+−]) 1\/x = (\S+)\. Find (.+)\.$/);
    if (m) {
      const t = val(m[2]), sg = m[1] === '+' ? 1 : -1;
      const roots = realRoots((x) => x + sg / x - t, -60, 60, 1e-3).filter((x) => Math.abs(x) > 1e-3);
      expect(roots.length).toBeGreaterThan(0);
      const vals = roots.map(fn(m[3], 'x'));
      for (const v of vals) expect(close(v, vals[0], 1e-6 * Math.max(1, Math.abs(v)))).toBe(true);
      return vals[0];
    }
    m = p.match(/^A real number x satisfies (.+) = 0\. Find (.+)\.$/);
    if (m) {
      const roots = realRoots(fn(m[1], 'x'));
      expect(roots.length).toBeGreaterThan(0);
      return fn(m[2], 'x')(roots[0]);
    }
    m = p.match(/^Real numbers a, b, c satisfy a \+ b \+ c = 0 and abc = (\S+)\. Find (.+)\.$/);
    if (m) {
      const s = Math.cbrt(-val(m[1]) / 2);
      return fnv(m[2], ['a', 'b', 'c'])(s, s, -2 * s);
    }
    m = p.match(/^Real numbers a, b, c satisfy a \+ b \+ c = (\S+)(?:, ab \+ bc \+ ca = (\S+) and abc = (\S+)| and a² \+ b² \+ c² = (\S+))\. Find (.+)\.$/);
    if (m) {
      const S = val(m[1]);
      const ok = (a: number, b: number, c: number) =>
        a + b + c === S && (m![4] ? a * a + b * b + c * c === val(m![4]) : a * b + b * c + c * a === val(m![2]) && a * b * c === val(m![3]));
      const f = fnv(m[5], ['a', 'b', 'c']);
      let found: number | null = null;
      for (let a = -12; a <= 12; a++) for (let b = -12; b <= 12; b++) for (let c = -12; c <= 12; c++) if (found === null && ok(a, b, c) && a * b * c !== 0) found = f(a, b, c);
      expect(found).not.toBeNull();
      return found;
    }
    return null;
  },

  'math.adv.inequalities': (p) => {
    let m = p.match(/^Find the (minimum|maximum) value of A = (.+?)(?: for x > (\d+))?\.$/);
    if (m) {
      const sg = m[1] === 'minimum' ? 1 : -1;
      if (m[2].includes('y')) {
        const f = fn2(m[2]);
        return sg * min2((x, y) => sg * f(x, y));
      }
      const f = fn(m[2], 'x'), [lo, hi] = m[3] ? [+m[3], +m[3] + 100] : [-100, 100];
      return sg * argmin((x) => sg * f(x), lo, hi).v;
    }
    m = p.match(/^(For x > 0, at which x|For which value of x) does A = (.+) take its smallest value\?$/);
    if (m) {
      const f = fn(m[2], 'x');
      return m[1].startsWith('For x > 0') ? argmin(f, 0, 100).x : argmin(f, -100, 100).x;
    }
    m = p.match(/^(Real|Positive) numbers x, y satisfy (\d*)x \+ (\d*)y = (\d+)\. Find the (minimum|maximum) value of (?:A = )?(.+)\.$/);
    if (m) {
      const [a, b, c] = [+(m[2] || 1), +(m[3] || 1), +m[4]];
      const f = fn2(m[6]), sg = m[5] === 'minimum' ? 1 : -1;
      const g = (x: number) => sg * f(x, (c - a * x) / b);
      return sg * (m[1] === 'Positive' ? argmin(g, 0, c / a) : argmin(g, -100, 100)).v;
    }
    return null;
  },

  'math.adv.equations': (p) => {
    let m = p.match(/^Solve: (.+) = (.+)$/);
    if (m) {
      const [L, R] = [fn(m[1], 'x'), fn(m[2], 'x')];
      const f = (x: number) => L(x) - R(x);
      const found = realRoots(f, -40, 40, 2e-3);
      const distinct = found.filter((x, i) => i === 0 || x - found[i - 1] > 1e-3).map((x) => Math.round(x * 1e6) / 1e6);
      expect(distinct.every(Number.isInteger), `${p}: ${distinct}`).toBe(true);
      return distinct.length ? distinct.map((x) => `x = ${x < 0 ? `−${-x}` : x}`).join('; ') : 'no root';
    }
    m = p.match(/^How many pairs of real numbers \(x, y\) satisfy x \+ y \+ xy = (\S+) and x²y \+ xy² = (\S+)\?$/);
    if (m) {
      const [A, B] = [val(m[1]), val(m[2])];
      expect(A).not.toBe(-1);
      // From the first equation y = (A − x)/(1 + x); count the real roots of the second.
      const g = (x: number) => {
        const y = (A - x) / (1 + x);
        return x * y * (x + y) - B;
      };
      return realRoots(g, -60, 60, 1e-3).length;
    }
    return null;
  },

  'math.adv.vieta': (p, g) => {
    const m0 = p.match(/(x² .+ = 0)/);
    if (!m0) return null;
    const P = fnv(m0[1].replace(' = 0', ''), ['x', 'm']);
    /** Real roots of the quadratic for this m (sorted), or null when there are none. */
    const rootsAt = (m: number): [number, number] | null => {
      const c0 = P(0, m), c1 = (P(1, m) - P(-1, m)) / 2, c2 = (P(1, m) + P(-1, m)) / 2 - c0;
      const D = c1 * c1 - 4 * c2 * c0;
      if (D < -1e-9) return null;
      const s = Math.sqrt(Math.max(0, D));
      return [(-c1 - s) / (2 * c2), (-c1 + s) / (2 * c2)];
    };
    const ms = (v: number[]) => v.map((x) => Math.round(x * 1e6) / 1e6).map((x) => `m = ${x < 0 ? `−${-x}` : x}`).join('; ');
    /** The m in [−60, 60] where cond(roots) crosses 0, among m that give real roots. */
    const solveM = (cond: (x1: number, x2: number) => number) =>
      ms(realRoots((m) => {
        const rt = rootsAt(m);
        return rt ? cond(...rt) : NaN;
      }, -40, 40, 4e-3));
    let m = p.match(/with x₁² \+ x₂² = (\d+)\.$/);
    if (m) return solveM((a, b) => a * a + b * b - +m![1]);
    m = p.match(/with \|x₁ − x₂\| = (\d+)\.$/);
    if (m) return solveM((a, b) => Math.abs(a - b) - +m![1]);
    m = p.match(/with x₁ = (\d+)x₂\.$/);
    if (m) return solveM((a, b) => (a - +m![1] * b) * (b - +m![1] * a));
    m = p.match(/^(How many integers m|Find the sum of all integers m) .+ both integers[.?]$/);
    if (m) {
      const good: number[] = [];
      for (let k = -300; k <= 300; k++) {
        const rt = rootsAt(k);
        if (rt && rt.every((x) => Math.abs(x - Math.round(x)) < 1e-9)) good.push(k);
      }
      return m[1].startsWith('How') ? good.length : good.reduce((x, y) => x + y, 0);
    }
    m = p.match(/with x₁ < (\S+) < x₂\.$/);
    if (m) {
      // Sample m and check that "x₁ < c < x₂" holds exactly when the stated answer "m < v" / "m > v" does.
      const c = val(m[1]), [, rel, v] = g.answer.match(/^m ([<>]) (\S+)$/)!, bound = val(v);
      for (let i = -3000; i <= 3000; i++) {
        const k = i / 100;
        if (Math.abs(k - bound) < 0.02) continue;
        const rt = rootsAt(k), holds = !!rt && rt[0] < c && c < rt[1];
        expect(holds, `${p} at m = ${k}`).toBe(rel === '<' ? k < bound : k > bound);
      }
      return g.answer;
    }
    if (/x₁² \+ x₂² is as small as possible\.$/.test(p)) {
      let best = Infinity, arg = NaN;
      for (let i = -4000; i <= 4000; i++) {
        const k = i / 100, rt = rootsAt(k);
        if (rt && rt[0] ** 2 + rt[1] ** 2 < best - 1e-12) [best, arg] = [rt[0] ** 2 + rt[1] ** 2, k];
      }
      return ms([arg]);
    }
    return null;
  },

  'math.adv.combinatorics': (p) => {
    let m = p.match(/^A convex polygon has (\d+) sides\. How many diagonals does it have\?$/);
    const diagonals = (n: number) => {
      let c = 0;
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (j - i !== 1 && j - i !== n - 1) c++;
      return c;
    };
    if (m) return diagonals(+m[1]);
    m = p.match(/^A convex polygon has (\d+) diagonals\. How many sides does it have\?$/);
    if (m) {
      const ns: number[] = [];
      for (let n = 3; n < 100; n++) if (diagonals(n) === +m[1]) ns.push(n);
      return ns.join(', ');
    }
    m = p.match(/^(\d+) points lie in a plane, no three on a line\. How many triangles/);
    if (m) {
      let c = 0;
      const n = +m[1];
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (let k = j + 1; k < n; k++) c++;
      return c;
    }
    m = p.match(/^How many integers from 1 to (\d+) are divisible by (neither )?(\d+) (?:or|nor) (\d+)\?$/);
    if (m) {
      let c = 0;
      for (let n = 1; n <= +m[1]; n++) {
        const hit = n % +m[3] === 0 || n % +m[4] === 0;
        if (m[2] ? !hit : hit) c++;
      }
      return c;
    }
    m = p.match(/^How many integers from 1 to (\d+) are divisible by none of (\d+), (\d+) and (\d+)\?$/);
    if (m) {
      let c = 0;
      for (let n = 1; n <= +m[1]; n++) if (n % +m[2] && n % +m[3] && n % +m[4]) c++;
      return c;
    }
    m = p.match(/^A class group has (\d+) boys and (\d+) girls\. In how many ways can a team of (\d+) with at least one girl be chosen\?$/);
    if (m) {
      const [b, g, k] = [+m[1], +m[2], +m[3]];
      let c = 0;
      for (let mask = 0; mask < 1 << (b + g); mask++) {
        const bits = [...Array(b + g).keys()].filter((i) => mask & (1 << i));
        if (bits.length === k && bits.some((i) => i >= b)) c++;
      }
      return c;
    }
    m = p.match(/^Using the digits ([\d, ]+), each at most once, how many (\d)-digit (even numbers|odd numbers|numbers divisible by 5) can be formed\?$/);
    if (m) {
      const allowed = new Set(m[1].split(', '));
      const k = +m[2];
      let c = 0;
      for (let n = 10 ** (k - 1); n < 10 ** k; n++) {
        const ds = String(n).split('');
        if (new Set(ds).size !== k || !ds.every((x) => allowed.has(x))) continue;
        if (m[3] === 'even numbers' ? n % 2 === 0 : m[3] === 'odd numbers' ? n % 2 === 1 : n % 5 === 0) c++;
      }
      return c;
    }
    m = p.match(/^A drawer has (\d+) red, (\d+) blue and (\d+) white socks\. .+ to be sure of getting (?:(\d+) socks of the same colour|(at least one sock of each colour))\?$/);
    if (m) {
      // The largest draw that still fails, plus one.
      const cs = [+m[1], +m[2], +m[3]];
      let worst = 0;
      for (let x = 0; x <= cs[0]; x++)
        for (let y = 0; y <= cs[1]; y++)
          for (let z = 0; z <= cs[2]; z++) {
            const fails = m[5] ? x * y * z === 0 : Math.max(x, y, z) < +m[4];
            if (fails) worst = Math.max(worst, x + y + z);
          }
      return worst + 1;
    }
    m = p.match(/^What is the smallest n such that among any n integers there are always two whose sum or difference is divisible by (\d+)\?$/);
    if (m) {
      // The biggest set of integers with no such pair uses distinct remainders, no two adding to 0 mod m.
      const md = +m[1];
      let best = 0;
      for (let mask = 0; mask < 1 << md; mask++) {
        const rs = [...Array(md).keys()].filter((i) => mask & (1 << i));
        if (rs.length <= best) continue;
        if (rs.every((a, i) => rs.every((b, j) => j <= i || (a + b) % md !== 0))) best = rs.length;
      }
      return best + 1;
    }
    return null;
  },

  'math.adv.geometry': (p) => {
    const ns = (p.match(/\d+/g) ?? []).map(Number);
    if (p.startsWith('Triangle ABC is similar to triangle DEF')) {
      const [p1, q1, S] = ns;
      const A: Pt = [0, 0], B: Pt = [p1, 0], C: Pt = [1.3, (2 * S) / p1];
      expect(close(area(A, B, C), S)).toBe(true);
      const k = q1 / p1, rot = (P: Pt): Pt => [k * (0.6 * P[0] - 0.8 * P[1]) + 5, k * (0.8 * P[0] + 0.6 * P[1]) - 2];
      const [D, E, F] = [rot(A), rot(B), rot(C)];
      expect(close(len(D, E), q1)).toBe(true);
      return area(D, E, F);
    }
    if (p.includes('with MN ∥ BC')) {
      const [S, a, b] = ns;
      const A: Pt = [0, 0], B: Pt = [a + b, 0], C: Pt = [0.7, (2 * S) / (a + b)];
      const t = a / (a + b), M: Pt = [t * B[0], t * B[1]], N: Pt = [t * C[0], t * C[1]];
      expect(close(len(A, M), a)).toBe(true);
      return p.includes('trapezoid') ? area(M, B, C, N) : area(A, M, N);
    }
    if (p.includes('draw the tangent MT')) {
      const [a, b] = ns;
      // M at the origin, A and B on the x-axis, any circle through A and B.
      const M: Pt = [0, 0], A: Pt = [a, 0], B: Pt = [a + b, 0], O: Pt = [a + b / 2, 2.7], R = len(O, A);
      expect(close(len(O, B), R)).toBe(true);
      return Math.sqrt(len(M, O) ** 2 - R * R);
    }
    if (p.startsWith('Chords AB and CD of a circle meet at E. ')) {
      const [a, b, c] = ns;
      const E: Pt = [0, 0], A: Pt = [-a, 0], B: Pt = [b, 0], C: Pt = [c * Math.cos(1.1), c * Math.sin(1.1)];
      const D = other(E, C, circle(A, B, C));
      return len(E, D);
    }
    if (p.includes('The tangent at A makes an angle of')) {
      const [al] = ns;
      const O: Pt = [0, 0], A = onUnit(0), B = onUnit(2 * al), C = onUnit(180 + al);
      expect(close(angle([1, 1], A, B), al, 1e-9)).toBe(true); // the tangent at A is vertical
      const ask = p.match(/Find ∠(\w+)/)![1];
      return ask === 'AOB' ? angle(A, O, B) : ask === 'ACB' ? angle(A, C, B) : angle(O, A, B);
    }
    if (p.includes('the tangents MA and MB are drawn')) {
      const [th] = ns;
      const M: Pt = [1 / Math.sin((th * Math.PI) / 360), 0], A = onUnit(90 - th / 2), B = onUnit(-(90 - th / 2)), C = onUnit(180);
      expect(close(angle(A, M, B), th, 1e-9)).toBe(true);
      expect(close(angle([0, 0], A, M), 90, 1e-9)).toBe(true);
      return angle(A, C, B);
    }
    if (p.includes('two secants MAB and MCD are drawn') && p.includes('MC =')) {
      const [a, b, c] = ns;
      const M: Pt = [0, 0], A: Pt = [a, 0], B: Pt = [a + b, 0], C: Pt = [c * Math.cos(0.5), c * Math.sin(0.5)];
      const D = other(M, C, circle(A, B, C));
      expect(len(M, D)).toBeGreaterThan(c);
      return len(C, D);
    }
    if (p.includes('AM : MB =')) {
      const [S, p1, q1, s1, t1] = ns;
      const A: Pt = [0, 0], B: Pt = [p1 + q1, 0], C: Pt = [1.7, (2 * S) / (p1 + q1)];
      const M: Pt = [p1, 0], N: Pt = [(C[0] * s1) / (s1 + t1), (C[1] * s1) / (s1 + t1)];
      expect(close(len(A, M) / len(M, B), p1 / q1) && close(len(A, N) / len(N, C), s1 / t1)).toBe(true);
      return area(A, M, N);
    }
    if (p.includes('meet at E inside the circle')) {
      const [x, y] = ns;
      const u = (360 - x - y) / 2;
      const A = onUnit(0), C = onUnit(x), B = onUnit(x + u), D = onUnit(x + u + y);
      const E = meet(A, B, C, D);
      expect(Math.hypot(...E)).toBeLessThan(1);
      return angle(A, E, C);
    }
    if (p.includes('The arc BD not containing A, C is')) {
      const [x, y] = ns;
      const pq = (360 - x - y) / 2;
      const A = onUnit(0), B = onUnit(pq), D = onUnit(pq + x), C = onUnit(pq + x + pq);
      const M = meet(A, B, C, D);
      expect(len(M, A)).toBeLessThan(len(M, B));
      expect(len(M, C)).toBeLessThan(len(M, D));
      return angle(B, M, D);
    }
    return null;
  },
};

const ids = concepts.filter((c) => c.id.startsWith('math.adv.')).map((c) => c.id);

describe('advanced maths (chuyên / HSG)', () => {
  it('has a generator and a checker for every concept', () => {
    expect(ids.length).toBeGreaterThan(0);
    for (const id of ids) {
      expect(generators[id], id).toBeTypeOf('function');
      expect(checkers[id], id).toBeTypeOf('function');
    }
  });

  it('every question is complete and bilingual', () => {
    for (const id of ids)
      for (let d = 1; d <= 5; d++)
        for (let s = 1; s <= SEEDS; s++) {
          const g = gen(id, d, s);
          const where = `${id} d${d} s${s}: ${g.prompt}`;
          expect(g.promptVi, where).toBeTruthy();
          expect(g.explanation, where).toBeTruthy();
          expect(g.explanationVi, where).toBeTruthy();
          expect(g.distractors.length, where).toBeGreaterThanOrEqual(2);
          expect(new Set(g.distractors).size, where).toBe(g.distractors.length);
          expect(g.distractors, where).not.toContain(g.answer);
          const all = `${g.prompt} ${g.promptVi} ${g.answer} ${g.distractors.join(' ')} ${g.explanation} ${g.explanationVi}`;
          expect(all, where).not.toMatch(/NaN|undefined|Infinity|null|\+ -|- -|−−|\+ −|− −/);
          expect(all, `${where}: a hyphen used as a minus sign`).not.toMatch(/(^|[\s(=·,;])-\d/);
        }
  });

  for (const id of ids)
    it(`${id}: every answer is right`, () => {
      for (let d = 1; d <= 5; d++)
        for (let s = 1; s <= SEEDS; s++) {
          const g = gen(id, d, s);
          const got = checkers[id](g.prompt, g);
          expect(got, `unrecognised: ${g.prompt}`).not.toBeNull();
          if (typeof got === 'number') expect(close(val(g.answer), got, 1e-6 * Math.max(1, Math.abs(got))), `${id} d${d} s${s}: ${g.prompt} → ${g.answer}, expected ${got}`).toBe(true);
          else expect(g.answer, `${id} d${d} s${s}: ${g.prompt}`).toBe(got);
        }
    }, 60000);
});

