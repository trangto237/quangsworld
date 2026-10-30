/** Small helpers shared by the maths generators. */
import type { Generated } from './generators';

export const int = (r: () => number, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
export const pick = <T>(r: () => number, a: readonly T[]): T => a[Math.floor(r() * a.length)];
export const nz = (r: () => number, lo: number, hi: number) => {
  let v = 0;
  while (v === 0) v = int(r, lo, hi);
  return v;
};
export const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

/** Build numeric distractors: plausible mistakes first, then nearby values, all distinct from the answer. */
export function numeric(answer: number, mistakes: number[], r: () => number, fmt: (n: number) => string = String): Omit<Generated, 'prompt'> {
  const out = new Set<string>();
  const a = fmt(answer);
  for (const m of mistakes) {
    const s = fmt(m);
    if (s !== a && Number.isFinite(m)) out.add(s);
    if (out.size === 3) break;
  }
  let step = 1;
  while (out.size < 3) {
    const cand = answer + (r() < 0.5 ? -1 : 1) * step * int(r, 1, 3);
    const s = fmt(cand);
    if (s !== a) out.add(s);
    step++;
  }
  return { answer: a, distractors: [...out].slice(0, 3) };
}

export function frac(n: number, d: number): string {
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = gcd(n, d) || 1;
  n /= g;
  d /= g;
  return d === 1 ? String(n) : `${n}/${d}`;
}

export const signed = (n: number) => (n < 0 ? `− ${-n}` : `+ ${n}`);

/** A number with a proper minus sign: −3. */
export const num = (n: number) => (n < 0 ? `−${-n}` : String(n));
/** A fraction with a proper minus sign: −3/2. */
export const fracN = (n: number, d: number) => frac(n, d).replace('-', '−');

/** Terms in one or more letters: terms([[2, 'x²'], [-1, 'x'], [3, '']]) = "2x² − x + 3". */
export function terms(list: [number, string][]): string {
  let out = '';
  for (const [c, v] of list) {
    if (c === 0) continue;
    const abs = Math.abs(c);
    const body = `${abs === 1 && v ? '' : abs}${v}`;
    out += out ? (c < 0 ? ` − ${body}` : ` + ${body}`) : c < 0 ? `−${body}` : body;
  }
  return out || '0';
}

/** A polynomial in x, highest power first: poly([1, -5, 6]) = "x² − 5x + 6". */
export const poly = (coefs: number[], v = 'x') => terms(coefs.map((c, i) => [c, ['', v, `${v}²`, `${v}³`][coefs.length - 1 - i]] as [number, string]));

/** c√s, e.g. rad(5, 2) = "5√2", rad(-1, 3) = "−√3". */
export const rad = (c: number, s: number) => (s === 1 ? num(c) : c === 0 ? '0' : `${c === 1 ? '' : c === -1 ? '−' : num(c)}√${s}`);

/** "(x − 3)" for a root of 3; "x" for 0. */
export const factor = (root: number) => (root === 0 ? 'x' : `(x ${signed(-root)})`);

/** Solutions as "x = −3; x = 2" (sorted, a double root once). Roots are [numerator, denominator]. */
export function roots(list: [number, number][]): string {
  const seen = new Map<string, number>();
  for (const [n, d] of list) seen.set(fracN(n, d), n / d);
  return [...seen.entries()]
    .sort((a, b) => a[1] - b[1])
    .map(([s]) => `x = ${s}`)
    .join('; ');
}

/** Flip an inequality sign (multiplying by a negative). */
export const FLIP: Record<string, string> = { '<': '>', '>': '<', '≤': '≥', '≥': '≤' };

/** A number inside a calculation: negatives in brackets, (−3). */
export const pn = (n: number) => (n < 0 ? `(${num(n)})` : num(n));
/** "12/(−8) = −3/2", or just "4/2 = 2"; a plain "5" when dividing by 1. */
export const ratio = (top: number, bottom: number) => {
  if (bottom === 1) return num(top);
  const raw = `${num(top)}/${pn(bottom)}`;
  const simple = fracN(top, bottom);
  return raw === simple ? raw : `${raw} = ${simple}`;
};
export const lcm = (a: number, b: number) => Math.abs(a * b) / gcd(a, b);
/** Pick the English or Vietnamese wording. */
export const tr = (en: boolean, e: string, v: string) => (en ? e : v);
/** A fraction inside a calculation: (−1/3) in brackets when negative. */
export const pf = (n: number, d: number) => (n * d < 0 ? `(${fracN(n, d)})` : fracN(n, d));
