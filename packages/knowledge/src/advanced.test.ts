/**
 * Advanced maths (chuyên Toán / HSG Toán 9): every generated question is complete and bilingual, and
 * every answer is re-derived here by brute force — enumerating integers, exact BigInt powers, scanning
 * a fine grid for minima and roots, or building the figure in coordinates.
 */
import { describe, expect, it } from 'vitest';
import { concepts, generators } from '@atlas/content';
import { rng } from '@atlas/shared';

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
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (m) => `**${unsup(m)}`)
    .replace(/\b([a-z])\s*\(/g, '$1*(')
    .replace(/√\(/g, 'Math.sqrt(')
    .replace(/(\d|\))\s*(?=[a-z(]|Math)/g, '$1*');
  return Function(v, `return (${js});`) as (x: number) => number;
}

/** "xy + 3x − 2y" → (x, y) => …, for brute-force searches. */
function fn2(e: string): (x: number, y: number) => number {
  const js = e
    .replace(/−/g, '-')
    .replace(/xy/g, 'x*y')
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (m) => `**${unsup(m)}`)
    .replace(/(\d)\s*(?=[xy(])/g, '$1*');
  return Function('x', 'y', `return (${js});`) as (x: number, y: number) => number;
}
/** An expression in any one-letter variables: fnv("ab + bc + ca", ["a", "b", "c"]). */
function fnv(e: string, vars: string[]): (...v: number[]) => number {
  const js = e
    .replace(/−/g, '-')
    .replace(/·/g, '*')
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
        out.push((a + b) / 2);
      }
    }
    [x0, f0] = [x1, f1];
  }
  return out;
}
const isSq = (n: number) => n >= 0 && Math.round(Math.sqrt(n)) ** 2 === n;

const bigPow = (a: number, n: number) => BigInt(a) ** BigInt(n);
const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const isPrime = (n: number) => {
  if (n < 2) return false;
  for (let p = 2; p * p <= n; p++) if (n % p === 0) return false;
  return true;
};

/** Each checker re-derives the answer of a prompt and returns it as a string (or null if it doesn't recognise the prompt). */
const checkers: Record<string, (p: string) => string | number | null> = {
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
        }
  });

  for (const id of ids)
    it(`${id}: every answer is right`, () => {
      for (let d = 1; d <= 5; d++)
        for (let s = 1; s <= SEEDS; s++) {
          const g = gen(id, d, s);
          const got = checkers[id](g.prompt);
          expect(got, `unrecognised: ${g.prompt}`).not.toBeNull();
          if (typeof got === 'number') expect(close(val(g.answer), got, 1e-6 * Math.max(1, Math.abs(got))), `${id} d${d} s${s}: ${g.prompt} → ${g.answer}, expected ${got}`).toBe(true);
          else expect(g.answer, `${id} d${d} s${s}: ${g.prompt}`).toBe(got);
        }
    });
});

