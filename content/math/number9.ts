/**
 * Grade 9 numbers, statistics and counting (Toán 9, 2018 programme) at the level of the grade-10 entrance exam
 * (Vào 10 Hà Nội): real numbers and radicals, rational expressions, exponent laws and scientific notation,
 * percentages with VND (bank interest, successive discounts, VAT), frequency tables, sample spaces and counting.
 * Even difficulty 1 is grade-8/9 work; difficulty 5 is entrance-exam style. Prompts and explanations are written in
 * English and Vietnamese, and every answer is exact (or the rounding is stated).
 */
import type { ConceptSeed } from '../helpers';
import type { Generated, Generator } from './generators';
import { fracN, gcd, int, num, pick, rad } from './util';

type G = Generated;
type Opts = Omit<G, 'prompt'>;
const vi = (g: G, promptVi: string, explanationVi: string): G => ({ ...g, promptVi, explanationVi });

/** A number with at most 4 decimal places, without float noise: 7.1, 37.5, −2. */
const nf = (x: number) => num(+x.toFixed(4) || 0);
/** Decimal comma for Vietnamese text: 1.5 → 1,5. */
const dc = (s: string) => s.replace(/(\d)\.(\d)/g, '$1,$2');
/** VND the English way (1,250,000) and the Vietnamese way (1.250.000). */
const vnd = (n: number) => n.toLocaleString('en');
const vndVi = (n: number) => vnd(n).replace(/,/g, '.');
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
/** Superscript exponent: sup(−3) = "⁻³". */
const sup = (n: number) => (n < 0 ? '⁻' : '') + [...String(Math.abs(n))].map((c) => SUP[+c]).join('');

function shuffle<T>(r: () => number, a: readonly T[]): T[] {
  const out = [...a];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Answer plus up to three distractors: the listed mistakes first, then values `step` apart. */
function opts(ans: number, mistakes: number[], r: () => number, fmt: (n: number) => string = nf, step = 1, min = -Infinity): Opts {
  const a = fmt(ans);
  const out = new Set<string>();
  for (const m of mistakes) {
    if (!Number.isFinite(m) || m < min || (fmt === vnd && !Number.isInteger(m))) continue;
    const s = fmt(m);
    if (s !== a) out.add(s);
    if (out.size === 3) break;
  }
  for (let k = 1; out.size < 3 && k < 60; k++) {
    const sg = r() < 0.5 ? 1 : -1;
    for (const c of [ans + sg * k * step, ans - sg * k * step]) {
      if (out.size === 3 || c < min) continue;
      const s = fmt(c);
      if (s !== a) out.add(s);
    }
  }
  return { answer: a, distractors: [...out] };
}

/** Distractors given as strings (already known to differ in value from the answer). */
function sOpts(answer: string, cands: string[]): Opts {
  return { answer, distractors: [...new Set(cands.filter((c) => c !== answer))].slice(0, 3) };
}

// ── Exact fractions ───────────────────────────────────────────
type Q = [number, number];
const q = (n: number, d: number): Q => {
  if (d < 0) [n, d] = [-n, -d];
  const g = gcd(n, d) || 1;
  return [n / g, d / g];
};
const add = (a: Q, b: Q) => q(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
const sub = (a: Q, b: Q) => add(a, [-b[0], b[1]]);
const mul = (a: Q, b: Q) => q(a[0] * b[0], a[1] * b[1]);
const div = (a: Q, b: Q) => q(a[0] * b[1], a[1] * b[0]);
const fs = (a: Q) => fracN(a[0], a[1]);
/** A fraction in brackets when negative: (−2/3). */
const fb = (a: Q) => (a[0] < 0 ? `(${fs(a)})` : fs(a));

function qOpts(ans: Q, mistakes: Q[], r: () => number, near: (k: number) => Q = (k) => add(ans, [r() < 0.5 ? -k : k, ans[1]])): Opts {
  const a = fs(ans);
  const out = new Set<string>();
  for (const m of mistakes) {
    if (m[1] === 0) continue;
    const s = fs(q(m[0], m[1]));
    if (s !== a) out.add(s);
    if (out.size === 3) break;
  }
  for (let k = 1; out.size < 3 && k < 60; k++) {
    const c = near(k);
    if (c[1] === 0) continue;
    const s = fs(q(c[0], c[1]));
    if (s !== a) out.add(s);
  }
  return { answer: a, distractors: [...out] };
}

/** A proper fraction in lowest terms with denominator lo..hi. */
function pf(r: () => number, lo = 2, hi = 9): Q {
  const d = int(r, lo, hi);
  let n = int(r, 1, d - 1);
  while (gcd(n, d) !== 1) n = int(r, 1, d - 1);
  return [n, d];
}
const neg = (a: Q): Q => [-a[0], a[1]];
/** Decimals that are clean fractions: 0.25, 1.5, 1.2… */
const DECIMALS: Q[] = [[1, 4], [1, 2], [3, 4], [6, 5], [3, 2], [5, 2], [2, 5], [3, 5], [4, 5], [5, 4], [1, 5], [7, 4]];
const dq = (a: Q) => nf(a[0] / a[1]);

const squarefree = (n: number) => {
  if (n < 2) return false;
  for (let p = 2; p * p <= n; p++) if (n % (p * p) === 0) return false;
  return true;
};
const SQF = [2, 3, 5, 6, 7, 10, 11, 13, 14, 15];

// ── Real numbers: order of operations, roots, absolute values, comparing irrationals ─────
const realNumbers: Generator = (d, r) => {
  if (d === 1) {
    const a = int(r, 2, 6), b = int(r, 2, 5), c = int(r, 2, 4), e = int(r, 1, 9), f = int(r, 10, 20);
    const ex = `${num(-a)}² + ${b} × (${num(-c)})² − |${e} − ${f}|`;
    const ans = -a * a + b * c * c - (f - e);
    return vi(
      {
        prompt: `Calculate: ${ex}`,
        ...opts(ans, [a * a + b * c * c - (f - e), -a * a + b * c * c + (f - e), -a * a - b * c * c - (f - e), -a * a + (b * c) ** 2 - (f - e)], r),
        explanation: `−${a}² = −(${a}²) = ${num(-a * a)}: only ${a} is squared, not the minus sign. (${num(-c)})² = ${c * c} and |${e} − ${f}| = |${num(e - f)}| = ${f - e}. Powers first, then ×, then + and −: ${num(-a * a)} + ${b * c * c} − ${f - e} = ${num(ans)}.`,
      },
      `Tính: ${ex}`,
      `−${a}² = −(${a}²) = ${num(-a * a)}: chỉ có ${a} được bình phương, dấu trừ thì không. (${num(-c)})² = ${c * c} và |${e} − ${f}| = |${num(e - f)}| = ${f - e}. Luỹ thừa trước, rồi nhân, rồi cộng trừ: ${num(-a * a)} + ${b * c * c} − ${f - e} = ${num(ans)}.`,
    );
  }
  if (d === 2) {
    if (r() < 0.5) {
      const p = int(r, 4, 15), k = int(r, 2, 4), qq = int(r, 2, 9), t = int(r, 2, 9);
      const ex = `√${p * p} − ${k}√${qq * qq} + √((${num(-t)})²)`;
      const ans = p - k * qq + t;
      return vi(
        {
          prompt: `Calculate: ${ex}`,
          ...opts(ans, [p - k * qq - t, (p - k) * qq + t, p - k * qq * qq + t], r),
          explanation: `√(A²) = |A|, so √((${num(-t)})²) = ${t}, not ${num(-t)}. Then ${p} − ${k}·${qq} + ${t} = ${num(ans)}.`,
        },
        `Tính: ${ex}`,
        `√(A²) = |A|, nên √((${num(-t)})²) = ${t}, không phải ${num(-t)}. Vậy ${p} − ${k}·${qq} + ${t} = ${num(ans)}.`,
      );
    }
    const s = pick(r, [2, 3, 5]), m = int(r, 1, 4), n = int(r, 2, 5), e = pick(r, [2, 3, 5, 6, 7]), u = int(r, 2, 6);
    const ex = `√${s * m * m} · √${s * n * n} − √${e * u * u} : √${e}`;
    const ans = s * m * n - u;
    return vi(
      {
        prompt: `Calculate: ${ex}`,
        ...opts(ans, [s * s * m * n - u, s * m * n - u * e, s * m * n + u, s * m * n - u * u], r),
        explanation: `√A · √B = √(AB) and √A : √B = √(A/B): √${s * m * m} · √${s * n * n} = √${s * s * m * m * n * n} = ${s * m * n}, and √${e * u * u} : √${e} = √${u * u} = ${u}. So ${s * m * n} − ${u} = ${num(ans)}.`,
      },
      `Tính: ${ex}`,
      `√A · √B = √(AB) và √A : √B = √(A/B): √${s * m * m} · √${s * n * n} = √${s * s * m * m * n * n} = ${s * m * n}, và √${e * u * u} : √${e} = √${u * u} = ${u}. Vậy ${s * m * n} − ${u} = ${num(ans)}.`,
    );
  }
  if (d === 3) {
    // Order four numbers, one whole and three of the form c√s, by comparing their squares.
    const n = int(r, 4, 9);
    const cands: { c: number; s: number }[] = [];
    for (let c = 1; c <= 5; c++)
      for (let s = 2; c * c * s <= 120; s++) if (squarefree(s) && c * c * s !== n * n && Math.abs(c * c * s - n * n) <= 2 * n + 2) cands.push({ c, s });
    const items = [{ c: n, s: 1 }, ...shuffle(r, cands).slice(0, 3)].map((x) => ({ ...x, v: x.c * x.c * x.s, str: rad(x.c, x.s) }));
    const order = (list: typeof items) => list.map((x) => x.str).join(' < ');
    const sorted = [...items].sort((a, b) => a.v - b.v);
    const answer = order(sorted);
    const cand = [order([...sorted].reverse()), order([...items].sort((a, b) => a.c * a.s - b.c * b.s)), order([...items].sort((a, b) => a.c - b.c || a.s - b.s))];
    for (let i = 0; i < 20; i++) cand.push(order(shuffle(r, items)));
    const shown = shuffle(r, items).map((x) => x.str).join('; ');
    const sq = sorted.map((x) => `${x.str} = √${x.v}`).join(', ');
    return vi(
      {
        prompt: `Arrange in increasing order: ${shown}`,
        ...sOpts(answer, cand),
        explanation: `Write each number as one square root, (c√s)² = c²·s: ${sq}. A bigger number under the root means a bigger number.`,
      },
      `Sắp xếp theo thứ tự tăng dần: ${shown}`,
      `Đưa thừa số vào trong dấu căn, (c√s)² = c²·s: ${sq}. Số dưới dấu căn lớn hơn thì căn lớn hơn.`,
    );
  }
  if (d === 4) {
    const s = pick(r, SQF);
    const v = Math.sqrt(s);
    if (r() < 0.5) {
      const b = Math.max(1, Math.floor(v) - int(r, 0, 2)), c = Math.ceil(v) + int(r, 0, 2);
      const ex = `|√${s} − ${b}| + |√${s} − ${c}|`;
      return vi(
        {
          prompt: `Calculate: ${ex}`,
          ...sOpts(num(c - b), [`${rad(2, s)} − ${b + c}`, `${b + c} − ${rad(2, s)}`, num(b - c)]),
          explanation: `${b} < √${s} < ${c} because ${b}² = ${b * b} < ${s} < ${c * c} = ${c}². So |√${s} − ${b}| = √${s} − ${b} and |√${s} − ${c}| = ${c} − √${s}; the roots cancel: ${c} − ${b} = ${c - b}.`,
        },
        `Tính: ${ex}`,
        `${b} < √${s} < ${c} vì ${b}² = ${b * b} < ${s} < ${c * c} = ${c}². Do đó |√${s} − ${b}| = √${s} − ${b} và |√${s} − ${c}| = ${c} − √${s}; các căn triệt tiêu: ${c} − ${b} = ${c - b}.`,
      );
    }
    const a = r() < 0.5 ? Math.max(1, Math.floor(v) - int(r, 0, 1)) : Math.ceil(v) + int(r, 0, 1);
    const ex = `√((${a} − √${s})²) + √${s}`;
    const big = a > v;
    const ans = big ? num(a) : `${rad(2, s)} − ${a}`;
    const other = big ? `${rad(2, s)} − ${a}` : num(a);
    return vi(
      {
        prompt: `Calculate: ${ex}`,
        ...sOpts(ans, [other, `${a} − ${rad(2, s)}`, rad(2, s), num(-a)]),
        explanation: `√(A²) = |A|. ${big ? `${a} > √${s}` : `${a} < √${s}`} (compare ${a}² = ${a * a} with ${s}), so |${a} − √${s}| = ${big ? `${a} − √${s}` : `√${s} − ${a}`}. Adding √${s} gives ${ans}.`,
      },
      `Tính: ${ex}`,
      `√(A²) = |A|. ${big ? `${a} > √${s}` : `${a} < √${s}`} (so sánh ${a}² = ${a * a} với ${s}), nên |${a} − √${s}| = ${big ? `${a} − √${s}` : `√${s} − ${a}`}. Cộng thêm √${s} được ${ans}.`,
    );
  }
  if (r() < 0.5) {
    // p/(√s − m) + p/(√s + m) = 2p√s/(s − m²)
    for (;;) {
      const s = pick(r, [2, 3, 5, 6, 7, 10, 11, 13, 14, 15, 17, 19, 21]), m = int(r, 1, 4);
      const D = s - m * m;
      if (D === 0 || Math.abs(D) > 12) continue;
      const p = (Math.abs(D) / gcd(2, Math.abs(D))) * int(r, 1, 3);
      const k = (2 * p) / D;
      const ex = `${p}/(√${s} − ${m}) + ${p}/(√${s} + ${m})`;
      return vi(
        {
          prompt: `Calculate: ${ex}`,
          ...sOpts(rad(k, s), [rad(-k, s), num(k * m), Number.isInteger(k / 2) ? rad(k / 2, s) : rad(2 * k, s), num(-k * m)]),
          explanation: `Common denominator (√${s} − ${m})(√${s} + ${m}) = ${s} − ${m * m} = ${num(D)}. Numerator: ${p}(√${s} + ${m}) + ${p}(√${s} − ${m}) = ${2 * p}√${s}. So the sum is ${2 * p}√${s}/${D < 0 ? `(${num(D)})` : D} = ${rad(k, s)}.`,
        },
        `Tính: ${ex}`,
        `Mẫu chung (√${s} − ${m})(√${s} + ${m}) = ${s} − ${m * m} = ${num(D)}. Tử: ${p}(√${s} + ${m}) + ${p}(√${s} − ${m}) = ${2 * p}√${s}. Vậy tổng bằng ${2 * p}√${s}/${D < 0 ? `(${num(D)})` : D} = ${rad(k, s)}.`,
      );
    }
  }
  const s = pick(r, [2, 3, 5, 6, 7]);
  let a = 0, b = 0, c = 0, k = 0, T = 0;
  do {
    a = int(r, 2, 6);
    b = int(r, 1, 4);
    c = int(r, 1, 5);
    k = int(r, 2, 4);
    T = a - k * b + c;
  } while (T === 0 || a * a * s > 200 || c * c * s > 200 || b * b * s > 120);
  const ex = `√${a * a * s} − ${k}√${b * b * s} + √${c * c * s}`;
  return vi(
    {
      prompt: `Calculate: ${ex}`,
      ...sOpts(rad(T, s), [rad(a + k * b + c, s), rad(a - b + c, s), rad(-T, s)]),
      explanation: `Take the squares out of each root: √${a * a * s} = ${rad(a, s)}, √${b * b * s} = ${rad(b, s)}, √${c * c * s} = ${rad(c, s)}. Then collect like roots: (${a} − ${k * b} + ${c})√${s} = ${rad(T, s)}.`,
    },
    `Tính: ${ex}`,
    `Đưa thừa số ra ngoài dấu căn: √${a * a * s} = ${rad(a, s)}, √${b * b * s} = ${rad(b, s)}, √${c * c * s} = ${rad(c, s)}. Rồi cộng các căn đồng dạng: (${a} − ${k * b} + ${c})√${s} = ${rad(T, s)}.`,
  );
};

// ── Rational expressions: fractions, decimals, order of operations, telescoping ─────
const fractions: Generator = (d, r) => {
  if (d === 1) {
    const x = r() < 0.4 ? neg(pf(r)) : pf(r), y = pf(r), z = pf(r);
    const ex = `${fs(x)} + ${fs(y)} × ${fs(z)}`;
    const yz = mul(y, z);
    const ans = add(x, yz);
    return vi(
      {
        prompt: `Calculate: ${ex}`,
        ...qOpts(ans, [mul(add(x, y), z), [x[0] + yz[0], x[1] + yz[1]], add(x, div(y, z))], r),
        explanation: `Multiply before adding: ${fs(y)} × ${fs(z)} = ${fs(yz)}. Then use a common denominator: ${fs(x)} + ${fs(yz)} = ${fs(ans)}.`,
      },
      `Tính: ${ex}`,
      `Nhân trước, cộng sau: ${fs(y)} × ${fs(z)} = ${fs(yz)}. Rồi quy đồng mẫu số: ${fs(x)} + ${fs(yz)} = ${fs(ans)}.`,
    );
  }
  if (d === 2) {
    const D = pick(r, DECIMALS), x = pf(r), y = pf(r);
    const ex = `${dq(D)} − ${fs(x)} : ${fs(y)}`;
    const xy = div(x, y);
    const ans = sub(D, xy);
    return vi(
      {
        prompt: `Calculate: ${ex}`,
        ...qOpts(ans, [div(sub(D, x), y), sub(D, mul(x, y)), sub(D, div(y, x))], r),
        explanation: `Write the decimal as a fraction: ${dq(D)} = ${fs(D)}. Divide first (multiply by the reciprocal): ${fs(x)} : ${fs(y)} = ${fs(x)} × ${fracN(y[1], y[0])} = ${fs(xy)}. Then ${fs(D)} − ${fb(xy)} = ${fs(ans)}.`,
      },
      `Tính: ${dc(ex)}`,
      `Đổi số thập phân ra phân số: ${dc(dq(D))} = ${fs(D)}. Chia trước (nhân với nghịch đảo): ${fs(x)} : ${fs(y)} = ${fs(x)} × ${fracN(y[1], y[0])} = ${fs(xy)}. Rồi ${fs(D)} − ${fb(xy)} = ${fs(ans)}.`,
    );
  }
  if (d === 3) {
    let x: Q, y: Q, z: Q, w: Q;
    do {
      x = r() < 0.5 ? neg(pf(r, 2, 6)) : pf(r, 2, 6);
      y = pf(r, 2, 6);
      z = pf(r, 2, 8);
      w = pf(r, 2, 6);
    } while (add(x, y)[0] === 0 || sub(z, w)[0] === 0);
    const top = add(x, y), bot = sub(z, w);
    const ans = div(top, bot);
    const ex = `(${fs(x)} + ${fs(y)}) : (${fs(z)} − ${fs(w)})`;
    return vi(
      {
        prompt: `Calculate: ${ex}`,
        ...qOpts(ans, [div(bot, top), mul(top, bot), div(sub(x, y), bot), div(top, add(z, w))], r),
        explanation: `Brackets first: ${fs(x)} + ${fs(y)} = ${fs(top)} and ${fs(z)} − ${fs(w)} = ${fs(bot)}. Then divide = multiply by the reciprocal: ${fs(top)} : ${fb(bot)} = ${fs(ans)}.`,
      },
      `Tính: ${ex}`,
      `Trong ngoặc trước: ${fs(x)} + ${fs(y)} = ${fs(top)} và ${fs(z)} − ${fs(w)} = ${fs(bot)}. Rồi chia, tức là nhân với số nghịch đảo: ${fs(top)} : ${fb(bot)} = ${fs(ans)}.`,
    );
  }
  if (d === 4) {
    const x = r() < 0.6 ? neg(pf(r, 2, 6)) : pf(r, 2, 6), D = pick(r, DECIMALS), y = neg(pf(r, 2, 6));
    const ex = `(${fs(x)})² + ${dq(D)} : (${fs(y)})`;
    const x2 = mul(x, x), Dy = div(D, y);
    const ans = add(x2, Dy);
    return vi(
      {
        prompt: `Calculate: ${ex}`,
        ...qOpts(ans, [sub(Dy, x2), add(x2, mul(D, y)), div(add(x2, D), y), add(q(2 * x[0], x[1]), Dy)], r),
        explanation: `(${fs(x)})² = ${fs(x2)} (a square is never negative). ${dq(D)} = ${fs(D)}, and ${fs(D)} : (${fs(y)}) = ${fs(D)} × (${fracN(y[1], y[0])}) = ${fs(Dy)}. Power, then division, then addition: ${fs(x2)} + ${fb(Dy)} = ${fs(ans)}.`,
      },
      `Tính: ${dc(ex)}`,
      `(${fs(x)})² = ${fs(x2)} (bình phương không bao giờ âm). ${dc(dq(D))} = ${fs(D)}, và ${fs(D)} : (${fs(y)}) = ${fs(D)} × (${fracN(y[1], y[0])}) = ${fs(Dy)}. Luỹ thừa, rồi chia, rồi cộng: ${fs(x2)} + ${fb(Dy)} = ${fs(ans)}.`,
    );
  }
  const kind = pick(r, ['consecutive', 'odd', 'product'] as const);
  if (kind === 'consecutive') {
    const n = int(r, 5, 49);
    const ex = `1/(1·2) + 1/(2·3) + 1/(3·4) + … + 1/(${n}·${n + 1})`;
    return vi(
      {
        prompt: `Calculate: ${ex}`,
        ...qOpts(q(n, n + 1), [q(1, n + 1), q(n - 1, n), q(1, n * (n + 1)), q(n + 1, n + 2)], r),
        explanation: `Split each term: 1/(k(k + 1)) = 1/k − 1/(k + 1). The sum telescopes: 1 − 1/2 + 1/2 − 1/3 + … − 1/${n + 1} = 1 − 1/${n + 1} = ${n}/${n + 1}.`,
      },
      `Tính: ${ex}`,
      `Tách mỗi số hạng: 1/(k(k + 1)) = 1/k − 1/(k + 1). Các số hạng triệt tiêu nhau: 1 − 1/2 + 1/2 − 1/3 + … − 1/${n + 1} = 1 − 1/${n + 1} = ${n}/${n + 1}.`,
    );
  }
  if (kind === 'odd') {
    const n = int(r, 4, 30);
    const ex = `1/(1·3) + 1/(3·5) + 1/(5·7) + … + 1/(${2 * n - 1}·${2 * n + 1})`;
    return vi(
      {
        prompt: `Calculate: ${ex}`,
        ...qOpts(q(n, 2 * n + 1), [q(2 * n, 2 * n + 1), q(1, 2 * n + 1), q(n, 2 * n - 1), q(n - 1, 2 * n + 1)], r),
        explanation: `1/(k(k + 2)) = ½(1/k − 1/(k + 2)). The sum is ½(1 − 1/3 + 1/3 − 1/5 + … − 1/${2 * n + 1}) = ½(1 − 1/${2 * n + 1}) = ${fs(q(n, 2 * n + 1))}. Don't forget the ½.`,
      },
      `Tính: ${ex}`,
      `1/(k(k + 2)) = ½(1/k − 1/(k + 2)). Tổng bằng ½(1 − 1/3 + 1/3 − 1/5 + … − 1/${2 * n + 1}) = ½(1 − 1/${2 * n + 1}) = ${fs(q(n, 2 * n + 1))}. Đừng quên nhân ½.`,
    );
  }
  const n = int(r, 4, 30);
  const ex = `(1 − 1/2²)(1 − 1/3²)(1 − 1/4²)…(1 − 1/${n}²)`;
  return vi(
    {
      prompt: `Calculate: ${ex}`,
      ...qOpts(q(n + 1, 2 * n), [q(1, n), q(n - 1, 2 * n), q(n + 1, n), q(n - 1, n)], r),
      explanation: `1 − 1/k² = (k − 1)(k + 1)/k². The product is (1·3/2²)(2·4/3²)(3·5/4²)…((${n - 1})(${n + 1})/${n}²); almost everything cancels, leaving (1/${n})·(${n + 1}/2) = ${fs(q(n + 1, 2 * n))}.`,
    },
    `Tính: ${ex}`,
    `1 − 1/k² = (k − 1)(k + 1)/k². Tích bằng (1·3/2²)(2·4/3²)(3·5/4²)…((${n - 1})(${n + 1})/${n}²); rút gọn gần hết, còn lại (1/${n})·(${n + 1}/2) = ${fs(q(n + 1, 2 * n))}.`,
  );
};

// ── Powers: exponent laws, scientific notation, cube roots, comparing powers ─────
/** M × 10^e as scientific notation [mantissa, exponent], M a positive whole number. */
function sci(M: number, e: number): [string, number] {
  let s = String(M);
  while (s.length > 1 && s.endsWith('0')) {
    s = s.slice(0, -1);
    e++;
  }
  return [s.length > 1 ? `${s[0]}.${s.slice(1)}` : s, e + s.length - 1];
}
const sciS = ([m, e]: [string, number]) => `${m} × 10${sup(e)}`;
/** M × 10^e written out in full (e < 0 gives a decimal). */
function plain(M: number, e: number, viet = false): string {
  if (e >= 0) return (viet ? vndVi : vnd)(M * 10 ** e);
  const s = String(M), k = -e;
  const out = k >= s.length ? `0.${'0'.repeat(k - s.length)}${s}` : `${s.slice(0, s.length - k)}.${s.slice(s.length - k)}`;
  return viet ? out.replace('.', ',') : out;
}
const xPow = (k: number) => (k === 0 ? '1' : k === 1 ? 'x' : `x${sup(k)}`);
const mant = (r: () => number) => {
  let A = 0;
  while (A % 10 === 0) A = int(r, 11, 99);
  return A;
};

const powers: Generator = (d, r) => {
  if (d === 1) {
    const a = pick(r, [2, 3]), m = int(r, 1, 4), n = m + int(r, 1, a === 2 ? 4 : 2), b = int(r, 2, 9), c = int(r, 2, 9);
    const ex = `${a}${sup(-m)} · ${a}${sup(n)} + ${b}${sup(0)} − (1/${c})${sup(-1)}`;
    const p = a ** (n - m);
    const ans = p + 1 - c;
    return vi(
      {
        prompt: `Calculate: ${ex}`,
        ...opts(ans, [p - c, p + 1 + c, a ** (n + m) + 1 - c, p * a + 1 - c], r),
        explanation: `aᵐ · aⁿ = aᵐ⁺ⁿ, so ${a}${sup(-m)} · ${a}${sup(n)} = ${a}${sup(n - m)} = ${p}. Any non-zero number to the power 0 is 1, and (1/${c})${sup(-1)} = ${c}. So ${p} + 1 − ${c} = ${num(ans)}.`,
      },
      `Tính: ${ex}`,
      `aᵐ · aⁿ = aᵐ⁺ⁿ, nên ${a}${sup(-m)} · ${a}${sup(n)} = ${a}${sup(n - m)} = ${p}. Mọi số khác 0 mũ 0 đều bằng 1, và (1/${c})${sup(-1)} = ${c}. Vậy ${p} + 1 − ${c} = ${num(ans)}.`,
    );
  }
  if (d === 2) {
    const M = r() < 0.6 ? mant(r) : int(r, 101, 999);
    const Mc = M % 10 === 0 ? M + 1 : M;
    const big = r() < 0.5;
    const e = big ? int(r, 3, 8) : -(String(Mc).length + int(r, 1, 4));
    const [m, x] = sci(Mc, e);
    const shown = plain(Mc, e), shownVi = plain(Mc, e, true);
    return vi(
      {
        prompt: `Write ${shown} in scientific notation (a × 10ⁿ with 1 ≤ a < 10).`,
        ...sOpts(sciS([m, x]), [sciS([m, x + 1]), sciS([m, x - 1]), sciS([m, -x]), `${Mc} × 10${sup(e)}`]),
        explanation: `Move the decimal point to just after the first non-zero digit: a = ${m}. It moved ${Math.abs(x)} place${Math.abs(x) === 1 ? '' : 's'} ${x > 0 ? 'left, so n = ' + x : 'right, so n = ' + num(x)}: ${sciS([m, x])}.`,
      },
      `Viết ${shownVi} dưới dạng kí hiệu khoa học (a × 10ⁿ với 1 ≤ a < 10).`,
      `Dời dấu phẩy đến ngay sau chữ số khác 0 đầu tiên: a = ${dc(m)}. Dấu phẩy dời ${Math.abs(x)} chữ số sang ${x > 0 ? 'trái, nên n = ' + x : 'phải, nên n = ' + num(x)}: ${dc(sciS([m, x]))}.`,
    );
  }
  if (d === 3) {
    if (r() < 0.5) {
      const A = mant(r), B = mant(r), m = int(r, -8, 12) || 4, n = int(r, -9, 9) || -3;
      const ex = `(${nf(A / 10)} × 10${sup(m)}) · (${nf(B / 10)} × 10${sup(n)})`;
      const [mm, x] = sci(A * B, m + n - 2);
      const cands = [sciS([mm, x + 1]), sciS([mm, x - 1]), sciS([mm, m * n])];
      if (A * B >= 1000) cands.unshift(`${nf((A * B) / 100)} × 10${sup(m + n)}`);
      return vi(
        {
          prompt: `Calculate and write in scientific notation: ${ex}`,
          ...sOpts(sciS([mm, x]), cands),
          explanation: `Multiply the numbers and add the powers of 10: ${nf(A / 10)} × ${nf(B / 10)} = ${nf((A * B) / 100)} and 10${sup(m)} · 10${sup(n)} = 10${sup(m + n)}.${A * B >= 1000 ? ` ${nf((A * B) / 100)} ≥ 10, so move the point once more: ` : ' '}${sciS([mm, x])}.`,
        },
        `Tính và viết kết quả dưới dạng kí hiệu khoa học: ${dc(ex)}`,
        `Nhân các số với nhau và cộng số mũ của 10: ${dc(nf(A / 10))} × ${dc(nf(B / 10))} = ${dc(nf((A * B) / 100))} và 10${sup(m)} · 10${sup(n)} = 10${sup(m + n)}.${A * B >= 1000 ? ` ${dc(nf((A * B) / 100))} ≥ 10 nên dời dấu phẩy thêm một chữ số: ` : ' '}${dc(sciS([mm, x]))}.`,
      );
    }
    const a = int(r, 2, 5), k = int(r, 2, 4), b = int(r, 2, 4), c = int(r, 2, 6);
    const ex = `∛(${num(-(a ** 3))}) + ${k}∛${b ** 3} − ∛${c ** 3}`;
    const ans = -a + k * b - c;
    return vi(
      {
        prompt: `Calculate: ${ex}`,
        ...opts(ans, [a + k * b - c, -a - k * b - c, -a + b - c, -a + k * b + c], r),
        explanation: `The cube root of a negative number is negative: ∛(${num(-(a ** 3))}) = ${num(-a)} because (${num(-a)})³ = ${num(-(a ** 3))}. Also ∛${b ** 3} = ${b} and ∛${c ** 3} = ${c}. So ${num(-a)} + ${k}·${b} − ${c} = ${num(ans)}.`,
      },
      `Tính: ${ex}`,
      `Căn bậc ba của số âm là số âm: ∛(${num(-(a ** 3))}) = ${num(-a)} vì (${num(-a)})³ = ${num(-(a ** 3))}. Ngoài ra ∛${b ** 3} = ${b} và ∛${c ** 3} = ${c}. Vậy ${num(-a)} + ${k}·${b} − ${c} = ${num(ans)}.`,
    );
  }
  if (d === 4) {
    if (r() < 0.5) {
      const a = int(r, 2, 5), b = int(r, 2, 4), c = int(r, 1, 6), e = int(r, 1, 7);
      const k = a * b - c - e;
      const ex = `(x${sup(a)})${sup(b)} · x${sup(-c)} : x${sup(e)}`;
      return vi(
        {
          prompt: `Simplify (x ≠ 0): ${ex}`,
          ...opts(k, [a + b - c - e, a * b + c - e, a * b - c + e], r, xPow),
          explanation: `Power of a power: multiply, (x${sup(a)})${sup(b)} = x${sup(a * b)}. Multiplying adds exponents and dividing subtracts them: ${a * b} + (${num(-c)}) − ${e} = ${num(k)}, so the result is ${xPow(k)}.`,
        },
        `Rút gọn (x ≠ 0): ${ex}`,
        `Luỹ thừa của luỹ thừa thì nhân số mũ: (x${sup(a)})${sup(b)} = x${sup(a * b)}. Nhân thì cộng số mũ, chia thì trừ số mũ: ${a * b} + (${num(-c)}) − ${e} = ${num(k)}, nên kết quả là ${xPow(k)}.`,
      );
    }
    const [a, b] = pick(r, [[2, 5], [2, 3], [3, 5], [4, 5], [2, 7]]);
    const n = int(r, 3, 6), m = n - int(r, 1, a * b > 12 ? 2 : 3);
    const ab = a * b;
    const ex = `${a}${sup(n)} · ${b}${sup(n)} : ${ab}${sup(m)}`;
    return vi(
      {
        prompt: `Calculate: ${ex}`,
        ...opts(ab ** (n - m), [ab ** (2 * n - m), ab ** (n - m + 1), (a + b) ** (n - m), ab ** (n * m)], r),
        explanation: `aⁿ · bⁿ = (ab)ⁿ, so ${a}${sup(n)} · ${b}${sup(n)} = ${ab}${sup(n)}. Dividing by ${ab}${sup(m)} subtracts exponents: ${ab}${sup(n - m)} = ${ab ** (n - m)}.`,
      },
      `Tính: ${ex}`,
      `aⁿ · bⁿ = (ab)ⁿ, nên ${a}${sup(n)} · ${b}${sup(n)} = ${ab}${sup(n)}. Chia cho ${ab}${sup(m)} thì trừ số mũ: ${ab}${sup(n - m)} = ${ab ** (n - m)}.`,
    );
  }
  const kind = pick(r, ['close', 'same', 'solve'] as const);
  if (kind === 'solve') {
    const a = pick(r, [2, 3, 5]), p = int(r, 2, 5), qq = int(r, 2, a === 5 ? 4 : 5);
    const n = p + 2 * qq;
    const eq = `${a}ⁿ : ${a}${sup(p)} = ${a * a}${sup(qq)}`;
    return vi(
      {
        prompt: `Find the natural number n such that ${eq}.`,
        ...opts(n, [p + qq, 2 * qq - p, 2 * (p + qq), qq * p], r, nf, 1, 1),
        explanation: `Write both sides with base ${a}: ${a * a}${sup(qq)} = (${a}²)${sup(qq)} = ${a}${sup(2 * qq)}, and ${a}ⁿ : ${a}${sup(p)} = ${a}ⁿ⁻${sup(p)}. So n − ${p} = ${2 * qq} and n = ${n}.`,
      },
      `Tìm số tự nhiên n thoả mãn ${eq}.`,
      `Đưa hai vế về cùng cơ số ${a}: ${a * a}${sup(qq)} = (${a}²)${sup(qq)} = ${a}${sup(2 * qq)}, và ${a}ⁿ : ${a}${sup(p)} = ${a}ⁿ⁻${sup(p)}. Vậy n − ${p} = ${2 * qq} và n = ${n}.`,
    );
  }
  let X: string, Y: string, lx: number, ly: number, how: string, howVi: string;
  if (kind === 'close') {
    const [a, p, b, qq] = pick(r, [[2, 3, 3, 2], [2, 5, 5, 2], [3, 3, 5, 2], [2, 7, 5, 3], [3, 4, 2, 6], [7, 2, 2, 6], [5, 3, 11, 2], [2, 4, 3, 3]]);
    const k = pick(r, [10, 20, 25, 50, 100]);
    X = `${a}${sup(p * k)}`;
    Y = `${b}${sup(qq * k)}`;
    lx = p * Math.log(a);
    ly = qq * Math.log(b);
    how = `Use a common exponent ${k}: ${X} = (${a}${sup(p)})${sup(k)} = ${a ** p}${sup(k)} and ${Y} = (${b}${sup(qq)})${sup(k)} = ${b ** qq}${sup(k)}. Compare ${a ** p} with ${b ** qq}.`;
    howVi = `Đưa về cùng số mũ ${k}: ${X} = (${a}${sup(p)})${sup(k)} = ${a ** p}${sup(k)} và ${Y} = (${b}${sup(qq)})${sup(k)} = ${b ** qq}${sup(k)}. So sánh ${a ** p} với ${b ** qq}.`;
  } else {
    const t = pick(r, [2, 3]);
    const [i, j] = shuffle(r, t === 2 ? [1, 2, 3, 4, 5] : [1, 2, 3, 4]).slice(0, 2);
    let e1 = 0, e2 = 0;
    do {
      e1 = int(r, 8, 40);
      e2 = int(r, 8, 40);
    } while (i * e1 === j * e2);
    X = `${t ** i}${sup(e1)}`;
    Y = `${t ** j}${sup(e2)}`;
    lx = i * e1;
    ly = j * e2;
    how = `Write both with base ${t}: ${X} = ${t}${sup(i * e1)} and ${Y} = ${t}${sup(j * e2)}. With the same base (> 1), the bigger exponent wins.`;
    howVi = `Đưa về cùng cơ số ${t}: ${X} = ${t}${sup(i * e1)} và ${Y} = ${t}${sup(j * e2)}. Cùng cơ số (lớn hơn 1) thì số mũ lớn hơn, luỹ thừa lớn hơn.`;
  }
  const rel = (s: string) => `${X} ${s} ${Y}`;
  const ans = rel(lx < ly ? '<' : '>');
  return vi(
    { prompt: `Compare ${X} and ${Y}.`, ...sOpts(ans, [rel('<'), rel('>'), rel('=')]), explanation: `${how} So ${ans}.` },
    `So sánh ${X} và ${Y}.`,
    `${howVi} Vậy ${ans}.`,
  );
};

// ── Percentages with money: discounts, VAT, profit, interest, growth ─────
const ITEMS = [
  { en: 'a jacket', vi: 'chiếc áo khoác' },
  { en: 'a pair of shoes', vi: 'đôi giày' },
  { en: 'a school bag', vi: 'chiếc cặp sách' },
  { en: 'a rice cooker', vi: 'chiếc nồi cơm điện' },
  { en: 'a bicycle', vi: 'chiếc xe đạp' },
  { en: 'an electric fan', vi: 'chiếc quạt điện' },
  { en: 'a phone', vi: 'chiếc điện thoại' },
];
const pct = (x: number) => `${nf(x)}%`;
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
/** p% as a Vietnamese decimal factor: 1,08. */
const factorVi = (p: number) => dc(nf(1 + p / 100));
/** Keep a mistake only if it is a clean percentage (at most one decimal place). */
const cleanPct = (x: number) => (Number.isInteger(+(x * 10).toFixed(6)) ? x : NaN);

const percent: Generator = (d, r) => {
  const it = pick(r, ITEMS);
  if (d === 1) {
    if (r() < 0.5) {
      const P = int(r, 10, 150) * 10000, p = pick(r, [10, 15, 20, 25, 30, 40]);
      const ans = (P * (100 - p)) / 100;
      return vi(
        {
          prompt: `${cap(it.en)} costs ${vnd(P)} VND. The shop gives a ${p}% discount. How much does it cost now (VND)?`,
          ...opts(ans, [(P * p) / 100, (P * (100 + p)) / 100, P - p * 1000], r, vnd, 10000, 1),
          explanation: `A ${p}% discount means you pay ${100 - p}% of the price: ${vnd(P)} × ${100 - p}/100 = ${vnd(ans)} VND. (${vnd((P * p) / 100)} VND is only the amount taken off.)`,
        },
        `Một ${it.vi} giá ${vndVi(P)} đồng. Cửa hàng giảm giá ${p}%. Giá mới là bao nhiêu đồng?`,
        `Giảm ${p}% nghĩa là chỉ phải trả ${100 - p}% giá ban đầu: ${vndVi(P)} × ${100 - p}/100 = ${vndVi(ans)} đồng. (${vndVi((P * p) / 100)} đồng chỉ là số tiền được giảm.)`,
      );
    }
    const A = int(r, 10, 100) * 10000, p = pick(r, [5, 10, 15, 20, 25, 40, 50]), up = r() < 0.5;
    const B = (A * (100 + (up ? p : -p))) / 100;
    return vi(
      {
        prompt: `The price of ${it.en} ${up ? 'rose' : 'fell'} from ${vnd(A)} VND to ${vnd(B)} VND. By what percentage did it ${up ? 'rise' : 'fall'}?`,
        ...opts(p, [cleanPct((Math.abs(B - A) * 100) / B), Math.abs(B - A) / 10000, 100 - p], r, pct, 5, 1),
        explanation: `Percentage change = change ÷ ORIGINAL price × 100%: ${vnd(Math.abs(B - A))} ÷ ${vnd(A)} × 100% = ${p}%. Do not divide by the new price.`,
      },
      `Giá một ${it.vi} ${up ? 'tăng' : 'giảm'} từ ${vndVi(A)} đồng ${up ? 'lên' : 'xuống'} ${vndVi(B)} đồng. Giá đã ${up ? 'tăng' : 'giảm'} bao nhiêu phần trăm?`,
      `Phần trăm thay đổi = mức thay đổi ÷ giá BAN ĐẦU × 100%: ${vndVi(Math.abs(B - A))} ÷ ${vndVi(A)} × 100% = ${p}%. Không chia cho giá mới.`,
    );
  }
  if (d === 2) {
    const kind = pick(r, ['original', 'profit', 'vat'] as const);
    if (kind === 'original') {
      const P = int(r, 10, 200) * 10000, p = pick(r, [10, 20, 25, 30, 40, 50]);
      const Y = (P * (100 - p)) / 100;
      return vi(
        {
          prompt: `After a ${p}% discount, Lan paid ${vnd(Y)} VND for ${it.en}. What was the original price (VND)?`,
          ...opts(P, [(Y * (100 + p)) / 100, (Y * (100 - p)) / 100, Y + p * 1000], r, vnd, 10000, 1),
          explanation: `Lan paid ${100 - p}% of the original price x: x × ${100 - p}/100 = ${vnd(Y)}, so x = ${vnd(Y)} × 100/${100 - p} = ${vnd(P)} VND. Adding ${p}% to ${vnd(Y)} is wrong: the ${p}% is of the original price, not of ${vnd(Y)}.`,
        },
        `Sau khi được giảm ${p}%, Lan trả ${vndVi(Y)} đồng để mua một ${it.vi}. Hỏi giá ban đầu là bao nhiêu đồng?`,
        `Lan đã trả ${100 - p}% giá ban đầu x: x × ${100 - p}/100 = ${vndVi(Y)}, nên x = ${vndVi(Y)} × 100/${100 - p} = ${vndVi(P)} đồng. Cộng thêm ${p}% của ${vndVi(Y)} là sai: ${p}% được tính trên giá ban đầu, không phải trên ${vndVi(Y)}.`,
      );
    }
    if (kind === 'profit') {
      const Cst = int(r, 20, 200) * 10000, p = pick(r, [10, 12, 15, 20, 25, 30, 40]), gain = r() < 0.6;
      const S = (Cst * (100 + (gain ? p : -p))) / 100;
      const word = gain ? 'profit' : 'loss';
      return vi(
        {
          prompt: `A shop buys ${it.en} for ${vnd(Cst)} VND and sells it for ${vnd(S)} VND. What is the percentage ${word} on the cost price?`,
          ...opts(p, [cleanPct((Math.abs(S - Cst) * 100) / S), 100 - p, 100 + p], r, pct, 5, 1),
          explanation: `${gain ? 'Profit' : 'Loss'} = ${vnd(Math.abs(S - Cst))} VND. As a percentage of the cost price: ${vnd(Math.abs(S - Cst))} ÷ ${vnd(Cst)} × 100% = ${p}%.`,
        },
        `Một cửa hàng nhập một ${it.vi} với giá ${vndVi(Cst)} đồng và bán ra với giá ${vndVi(S)} đồng. Cửa hàng ${gain ? 'lãi' : 'lỗ'} bao nhiêu phần trăm so với giá nhập?`,
        `Tiền ${gain ? 'lãi' : 'lỗ'} = ${vndVi(Math.abs(S - Cst))} đồng. Tính theo phần trăm của giá nhập: ${vndVi(Math.abs(S - Cst))} ÷ ${vndVi(Cst)} × 100% = ${p}%.`,
      );
    }
    const P = int(r, 10, 300) * 10000, v = pick(r, [8, 10]);
    const T = (P * (100 + v)) / 100;
    return vi(
      {
        prompt: `The price of ${it.en} including ${v}% VAT is ${vnd(T)} VND. What is the price before VAT (VND)?`,
        ...opts(P, [(T * (100 - v)) / 100, T - v * 1000, (T * v) / 100], r, vnd, 10000, 1),
        explanation: `Price with VAT = price before VAT × ${nf(1 + v / 100)}, so the price before VAT is ${vnd(T)} ÷ ${nf(1 + v / 100)} = ${vnd(P)} VND. Taking ${v}% off ${vnd(T)} gives the wrong answer, because the VAT was ${v}% of the smaller price.`,
      },
      `Giá một ${it.vi} đã bao gồm ${v}% thuế VAT là ${vndVi(T)} đồng. Hỏi giá chưa có thuế VAT là bao nhiêu đồng?`,
      `Giá có VAT = giá chưa VAT × ${factorVi(v)}, nên giá chưa VAT là ${vndVi(T)} : ${factorVi(v)} = ${vndVi(P)} đồng. Lấy ${vndVi(T)} trừ đi ${v}% của nó là sai, vì thuế ${v}% được tính trên giá chưa thuế (nhỏ hơn).`,
    );
  }
  if (d === 3) {
    const kind = pick(r, ['successive', 'simple', 'updown'] as const);
    if (kind === 'successive') {
      const P = int(r, 20, 300) * 10000;
      const [p, qq] = shuffle(r, [10, 15, 20, 25, 30, 40]).slice(0, 2);
      const ans = (P * (100 - p) * (100 - qq)) / 10000;
      return vi(
        {
          prompt: `${cap(it.en)} costs ${vnd(P)} VND. It is reduced by ${p}%, and then the new price is reduced by a further ${qq}%. What is the final price (VND)?`,
          ...opts(ans, [(P * (100 - p - qq)) / 100, (P * (100 - p)) / 100, (P * (100 - p) * (100 + qq)) / 10000], r, vnd, 10000, 1),
          explanation: `Two discounts multiply, they do not add: ${vnd(P)} × ${nf(1 - p / 100)} × ${nf(1 - qq / 100)} = ${vnd(ans)} VND. (Taking ${p + qq}% off at once gives ${vnd((P * (100 - p - qq)) / 100)} VND, which is too little.)`,
        },
        `Một ${it.vi} giá ${vndVi(P)} đồng. Cửa hàng giảm giá ${p}%, sau đó lại giảm tiếp ${qq}% trên giá mới. Hỏi giá cuối cùng là bao nhiêu đồng?`,
        `Hai lần giảm giá thì nhân, không cộng: ${vndVi(P)} × ${dc(nf(1 - p / 100))} × ${dc(nf(1 - qq / 100))} = ${vndVi(ans)} đồng. (Giảm một lần ${p + qq}% cho ${vndVi((P * (100 - p - qq)) / 100)} đồng, là sai.)`,
      );
    }
    if (kind === 'simple') {
      const X = int(r, 2, 50) * 10 ** 6, rate = pick(r, [5, 6, 7, 8]), n = pick(r, [2, 3]);
      const ans = (X * (100 + n * rate)) / 100;
      return vi(
        {
          prompt: `Mr Nam deposits ${vnd(X)} VND at a simple interest rate of ${rate}% per year (the interest is not added to the deposit). How much will he have after ${n} years (VND)?`,
          ...opts(ans, [(X * (100 + rate) ** n) / 100 ** n, (X * n * rate) / 100, (X * (100 + rate)) / 100], r, vnd, 100000, 1),
          explanation: `Simple interest is the same every year: ${vnd(X)} × ${rate}% = ${vnd((X * rate) / 100)} VND. After ${n} years: ${vnd(X)} + ${n} × ${vnd((X * rate) / 100)} = ${vnd(ans)} VND.`,
        },
        `Ông Nam gửi ${vndVi(X)} đồng vào ngân hàng với lãi suất đơn ${rate}%/năm (tiền lãi không nhập vào gốc). Sau ${n} năm ông có tất cả bao nhiêu đồng?`,
        `Lãi đơn thì mỗi năm tiền lãi như nhau: ${vndVi(X)} × ${rate}% = ${vndVi((X * rate) / 100)} đồng. Sau ${n} năm: ${vndVi(X)} + ${n} × ${vndVi((X * rate) / 100)} = ${vndVi(ans)} đồng.`,
      );
    }
    const p = pick(r, [10, 20, 30, 40, 50]);
    const ans = ((100 + p) * (100 - p)) / 100;
    return vi(
      {
        prompt: `A price is increased by ${p}% and then decreased by ${p}%. The final price is what percentage of the original price?`,
        ...opts(ans, [100, 100 - p, 100 + (p * p) / 100], r, pct, 1, 1),
        explanation: `Multiply the factors: ${nf(1 + p / 100)} × ${nf(1 - p / 100)} = ${nf(ans / 100)}, so the final price is ${pct(ans)} of the original. The decrease is taken from the bigger price, so you do not get back to 100%.`,
      },
      `Một mặt hàng được tăng giá ${p}%, sau đó lại giảm giá ${p}%. Giá cuối cùng bằng bao nhiêu phần trăm giá ban đầu?`,
      `Nhân các hệ số: ${factorVi(p)} × ${dc(nf(1 - p / 100))} = ${dc(nf(ans / 100))}, nên giá cuối bằng ${dc(pct(ans))} giá ban đầu. Lần giảm được tính trên giá đã tăng (lớn hơn), nên không trở về 100%.`,
    );
  }
  if (d === 4) {
    if (r() < 0.6) {
      const X = int(r, 10, 500) * 10 ** 6, rate = pick(r, [5, 6, 7, 8]), askI = r() < 0.4;
      const tot = (X * (100 + rate) ** 2) / 10000, I = tot - X;
      const ans = askI ? I : tot;
      const mistakes = askI ? [(X * 2 * rate) / 100, (X * rate) / 100, tot] : [(X * (100 + 2 * rate)) / 100, (X * (100 + rate)) / 100, I];
      return vi(
        {
          prompt: `Ms Hoa deposits ${vnd(X)} VND in a bank at ${rate}% per year, compound interest (each year's interest is added to the deposit). How much ${askI ? 'interest will she have earned' : 'will she have in total'} after 2 years (VND)?`,
          ...opts(ans, mistakes, r, vnd, 100000, 1),
          explanation: `After 1 year: ${vnd(X)} × ${nf(1 + rate / 100)} = ${vnd((X * (100 + rate)) / 100)}. After 2 years: × ${nf(1 + rate / 100)} again = ${vnd(tot)} VND, i.e. X(1 + r)². ${askI ? `Interest = ${vnd(tot)} − ${vnd(X)} = ${vnd(I)} VND.` : `Simple interest would give only ${vnd((X * (100 + 2 * rate)) / 100)} VND.`}`,
        },
        `Cô Hoa gửi ${vndVi(X)} đồng vào ngân hàng với lãi suất ${rate}%/năm theo hình thức lãi kép (tiền lãi mỗi năm được nhập vào gốc). Sau 2 năm, ${askI ? 'cô nhận được bao nhiêu tiền lãi' : 'cô có tất cả bao nhiêu tiền'} (đồng)?`,
        `Sau 1 năm: ${vndVi(X)} × ${factorVi(rate)} = ${vndVi((X * (100 + rate)) / 100)}. Sau 2 năm: nhân tiếp ${factorVi(rate)} = ${vndVi(tot)} đồng, tức là X(1 + r)². ${askI ? `Tiền lãi = ${vndVi(tot)} − ${vndVi(X)} = ${vndVi(I)} đồng.` : `Nếu tính lãi đơn thì chỉ được ${vndVi((X * (100 + 2 * rate)) / 100)} đồng.`}`,
      );
    }
    const P = int(r, 100, 900) * 10000, g = pick(r, [1, 2, 3]);
    const ans = (P * (100 + g) ** 2) / 10000;
    return vi(
      {
        prompt: `A city has ${vnd(P)} people. The population grows by ${g}% each year. What will the population be after 2 years?`,
        ...opts(ans, [(P * (100 + 2 * g)) / 100, (P * (100 + g)) / 100, ans - P], r, vnd, 100, 1),
        explanation: `Each year the population is multiplied by ${nf(1 + g / 100)}: ${vnd(P)} × ${nf(1 + g / 100)}² = ${vnd(ans)} people. The second year's growth is ${g}% of the bigger population, so it is more than ${2 * g}% in total.`,
      },
      `Một thành phố có ${vndVi(P)} người. Dân số tăng ${g}% mỗi năm. Hỏi sau 2 năm thành phố có bao nhiêu người?`,
      `Mỗi năm dân số được nhân với ${factorVi(g)}: ${vndVi(P)} × ${factorVi(g)}² = ${vndVi(ans)} người. Năm thứ hai tăng ${g}% của số dân đã tăng, nên tổng cộng tăng nhiều hơn ${2 * g}%.`,
    );
  }
  const kind = pick(r, ['deposit', 'rate', 'vat'] as const);
  if (kind === 'vat') {
    let a = 0, b = 0;
    do {
      a = int(r, 5, 30) * 100000;
      b = int(r, 5, 30) * 100000;
    } while (a === b);
    const S = a + b, T = (110 * a + 108 * b) / 100;
    return vi(
      {
        prompt: `A family buys a fridge and a washing machine for ${vnd(S)} VND in total before VAT. With VAT of 10% on the fridge and 8% on the washing machine they pay ${vnd(T)} VND. What is the price of the fridge before VAT (VND)?`,
        ...opts(a, [b, S / 2, T - S], r, vnd, 100000, 1),
        explanation: `Let the prices before VAT be x (fridge) and y: x + y = ${vnd(S)} and 1.1x + 1.08y = ${vnd(T)}. Subtract 1.08 × the first equation: 0.02x = ${vnd(T)} − ${vnd((108 * S) / 100)} = ${vnd(T - (108 * S) / 100)}, so x = ${vnd(a)} VND.`,
      },
      `Một gia đình mua một tủ lạnh và một máy giặt với tổng giá chưa thuế VAT là ${vndVi(S)} đồng. Thuế VAT của tủ lạnh là 10%, của máy giặt là 8%, nên gia đình phải trả ${vndVi(T)} đồng. Hỏi giá tủ lạnh chưa có thuế VAT là bao nhiêu đồng?`,
      `Gọi giá chưa VAT của tủ lạnh là x, của máy giặt là y: x + y = ${vndVi(S)} và 1,1x + 1,08y = ${vndVi(T)}. Trừ đi 1,08 lần phương trình đầu: 0,02x = ${vndVi(T)} − ${vndVi((108 * S) / 100)} = ${vndVi(T - (108 * S) / 100)}, nên x = ${vndVi(a)} đồng.`,
    );
  }
  const X = int(r, 10, 300) * 10 ** 6, rate = pick(r, kind === 'rate' ? [5, 6, 7, 8, 10, 12] : [5, 6, 7, 8, 10]);
  const Y = (X * (100 + rate) ** 2) / 10000;
  if (kind === 'rate')
    return vi(
      {
        prompt: `Mr Tuấn deposited ${vnd(X)} VND in a bank with compound interest (the interest is added at the end of each year). After 2 years he has ${vnd(Y)} VND. What is the annual interest rate?`,
        ...opts(rate, [((Y - X) * 50) / X, ((Y - X) * 100) / X, rate + 0.5], r, pct, 1, 1),
        explanation: `Let the rate be r: ${vnd(X)}(1 + r)² = ${vnd(Y)}, so (1 + r)² = ${nf(Y / X)} and 1 + r = ${nf(1 + rate / 100)} (r > 0). The rate is ${rate}% per year. Halving the total growth (${nf(((Y - X) * 50) / X)}%) ignores the interest on the interest.`,
      },
      `Ông Tuấn gửi ${vndVi(X)} đồng vào ngân hàng theo hình thức lãi kép (cuối mỗi năm tiền lãi được nhập vào gốc). Sau 2 năm ông có ${vndVi(Y)} đồng. Hỏi lãi suất mỗi năm là bao nhiêu?`,
      `Gọi lãi suất là r: ${vndVi(X)}(1 + r)² = ${vndVi(Y)}, nên (1 + r)² = ${dc(nf(Y / X))} và 1 + r = ${factorVi(rate)} (r > 0). Lãi suất là ${rate}%/năm. Lấy tổng phần trăm tăng chia đôi (${dc(nf(((Y - X) * 50) / X))}%) là bỏ qua tiền lãi của tiền lãi.`,
    );
  return vi(
    {
      prompt: `After 2 years at ${rate}% per year compound interest, Mr Tuấn has ${vnd(Y)} VND in the bank. How much did he deposit at the start (VND)?`,
      ...opts(X, [(Y * (100 - rate) ** 2) / 10000, (Y * (100 - 2 * rate)) / 100, (Y * 100) / (100 + 2 * rate)].filter(Number.isInteger), r, vnd, 10 ** 6, 1),
      explanation: `Let the deposit be x: x(1 + ${nf(rate / 100)})² = ${vnd(Y)}, so x = ${vnd(Y)} ÷ ${nf((1 + rate / 100) ** 2)} = ${vnd(X)} VND. Taking ${rate}% off twice does not undo the growth.`,
    },
    `Sau 2 năm gửi tiết kiệm với lãi suất ${rate}%/năm theo hình thức lãi kép, ông Tuấn có ${vndVi(Y)} đồng. Hỏi lúc đầu ông đã gửi bao nhiêu đồng?`,
    `Gọi số tiền gửi là x: x(1 + ${dc(nf(rate / 100))})² = ${vndVi(Y)}, nên x = ${vndVi(Y)} : ${dc(nf((1 + rate / 100) ** 2))} = ${vndVi(X)} đồng. Trừ đi ${rate}% hai lần không đưa về số tiền ban đầu.`,
  );
};

// ── Real-life money problems: offers, taxi fares, electricity bills ─────
const TIERS: [number, number][] = [
  [50, 1800],
  [100, 1900],
  [200, 2200],
  [300, 2800],
  [400, 3100],
];
const TIER_EN = `0–50 kWh: 1,800 VND; 51–100 kWh: 1,900 VND; 101–200 kWh: 2,200 VND; 201–300 kWh: 2,800 VND; 301–400 kWh: 3,100 VND`;
const TIER_VI = `0–50 kWh: 1.800 đồng; 51–100 kWh: 1.900 đồng; 101–200 kWh: 2.200 đồng; 201–300 kWh: 2.800 đồng; 301–400 kWh: 3.100 đồng`;
function bill(x: number): number {
  let total = 0, from = 0;
  for (const [to, price] of TIERS) {
    if (x > from) total += (Math.min(x, to) - from) * price;
    from = to;
  }
  return total;
}
const topPrice = (x: number) => TIERS.find(([to]) => x <= to)![1];
const billSteps = (x: number, viet = false) => {
  const parts: string[] = [];
  let from = 0;
  for (const [to, price] of TIERS) {
    if (x > from) parts.push(`${Math.min(x, to) - from} × ${(viet ? vndVi : vnd)(price)}`);
    from = to;
  }
  return parts.join(' + ');
};

const realLife: Generator = (d, r) => {
  if (d === 1) {
    const P = int(r, 5, 30) * 1000, n = int(r, 6, 25);
    const ans = (n - Math.floor(n / 4)) * P;
    return vi(
      {
        prompt: `Notebooks cost ${vnd(P)} VND each. The shop has an offer: "buy 3, get 1 free" (for every 4 notebooks you take, you pay for 3). How much does a class pay for ${n} notebooks (VND)?`,
        ...opts(ans, [n * P, (n - Math.floor(n / 3)) * P, (n * P * 3) / 4], r, vnd, 1000, 1),
        explanation: `${n} notebooks = ${Math.floor(n / 4)} groups of 4${n % 4 ? ` and ${n % 4} more` : ''}, so ${Math.floor(n / 4)} are free and the class pays for ${n - Math.floor(n / 4)}: ${n - Math.floor(n / 4)} × ${vnd(P)} = ${vnd(ans)} VND.`,
      },
      `Vở giá ${vndVi(P)} đồng một quyển. Cửa hàng khuyến mãi "mua 3 tặng 1" (cứ lấy 4 quyển thì chỉ trả tiền 3 quyển). Một lớp lấy ${n} quyển vở thì phải trả bao nhiêu đồng?`,
      `${n} quyển = ${Math.floor(n / 4)} nhóm 4 quyển${n % 4 ? ` và ${n % 4} quyển lẻ` : ''}, nên được tặng ${Math.floor(n / 4)} quyển và phải trả tiền ${n - Math.floor(n / 4)} quyển: ${n - Math.floor(n / 4)} × ${vndVi(P)} = ${vndVi(ans)} đồng.`,
    );
  }
  if (d === 2) {
    const A = pick(r, [15000, 18000, 20000]), B = pick(r, [11000, 12000, 13500, 14000]), Cc = B - pick(r, [1500, 2000, 3000]);
    const x = int(r, 8, 60);
    const ans = A + B * (Math.min(x, 30) - 1) + Cc * Math.max(0, x - 30);
    return vi(
      {
        prompt: `A taxi charges ${vnd(A)} VND for the first km, ${vnd(B)} VND per km from the 2nd to the 30th km, and ${vnd(Cc)} VND per km after the 30th km. How much does a ${x} km trip cost (VND)?`,
        ...opts(ans, [A + B * (x - 1), A + B * Math.min(x, 30) + Cc * Math.max(0, x - 30), B * x], r, vnd, 1000, 1),
        explanation: `Split the trip: 1 km at ${vnd(A)}, ${Math.min(x, 30) - 1} km at ${vnd(B)}${x > 30 ? `, and ${x - 30} km at ${vnd(Cc)}` : ''}. Total: ${vnd(A)} + ${Math.min(x, 30) - 1} × ${vnd(B)}${x > 30 ? ` + ${x - 30} × ${vnd(Cc)}` : ''} = ${vnd(ans)} VND.`,
      },
      `Một hãng taxi tính giá ${vndVi(A)} đồng cho km đầu tiên, ${vndVi(B)} đồng/km từ km thứ 2 đến km thứ 30, và ${vndVi(Cc)} đồng/km từ km thứ 31 trở đi. Một chuyến đi dài ${x} km hết bao nhiêu tiền?`,
      `Chia quãng đường: 1 km giá ${vndVi(A)}, ${Math.min(x, 30) - 1} km giá ${vndVi(B)}${x > 30 ? `, và ${x - 30} km giá ${vndVi(Cc)}` : ''}. Tổng: ${vndVi(A)} + ${Math.min(x, 30) - 1} × ${vndVi(B)}${x > 30 ? ` + ${x - 30} × ${vndVi(Cc)}` : ''} = ${vndVi(ans)} đồng.`,
    );
  }
  if (d <= 4) {
    const x = int(r, 60, 380), v = d === 4 ? pick(r, [8, 10]) : 0;
    const B = bill(x), ans = (B * (100 + v)) / 100;
    const withVat = v ? `, plus ${v}% VAT` : '';
    const mistakes = v ? [B, (x * topPrice(x) * (100 + v)) / 100, (B * v) / 100] : [x * topPrice(x), x * TIERS[0][1]];
    return vi(
      {
        prompt: `Electricity is charged in tiers, per kWh: ${TIER_EN}${withVat}. A family uses ${x} kWh in a month. How much do they pay (VND)?`,
        ...opts(ans, mistakes, r, vnd, 1000, 1),
        explanation: `Each tier is charged at its own price: ${billSteps(x)} = ${vnd(B)} VND.${v ? ` With ${v}% VAT: ${vnd(B)} × ${nf(1 + v / 100)} = ${vnd(ans)} VND.` : ` Charging all ${x} kWh at ${vnd(topPrice(x))} VND is the usual mistake.`}`,
      },
      `Giá điện sinh hoạt tính theo bậc thang, mỗi kWh: ${TIER_VI}${v ? `, chưa gồm ${v}% thuế VAT` : ''}. Một gia đình dùng hết ${x} kWh trong tháng. Hỏi gia đình phải trả bao nhiêu đồng${v ? ' (đã gồm thuế VAT)' : ''}?`,
      `Mỗi bậc tính theo giá của bậc đó: ${billSteps(x, true)} = ${vndVi(B)} đồng.${v ? ` Cộng ${v}% thuế VAT: ${vndVi(B)} × ${factorVi(v)} = ${vndVi(ans)} đồng.` : ` Tính cả ${x} kWh theo giá ${vndVi(topPrice(x))} đồng là sai.`}`,
    );
  }
  const x = int(r, 80, 380), v = pick(r, [8, 10]);
  const B = bill(x), T = (B * (100 + v)) / 100;
  let noVat = 0;
  while (bill(noVat + 1) <= T && noVat < 2000) noVat++;
  const base = [300, 200, 100, 50].find((b) => x > b)!;
  return vi(
    {
      prompt: `Electricity is charged in tiers, per kWh: ${TIER_EN}, plus ${v}% VAT. A family paid ${vnd(T)} VND (including VAT) for one month. How many kWh did they use?`,
      ...opts(x, [noVat, Math.round(T / topPrice(x)), Math.round(B / topPrice(x))], r, nf, 10, 1),
      explanation: `Remove the VAT first: ${vnd(T)} ÷ ${nf(1 + v / 100)} = ${vnd(B)} VND. The first ${base} kWh cost ${vnd(bill(base))} VND; the rest, ${vnd(B - bill(base))} VND, is at ${vnd(topPrice(x))} VND/kWh = ${x - base} kWh. Total ${x} kWh.`,
    },
    `Giá điện sinh hoạt tính theo bậc thang, mỗi kWh: ${TIER_VI}, chưa gồm ${v}% thuế VAT. Một gia đình trả ${vndVi(T)} đồng (đã gồm thuế VAT) cho một tháng. Hỏi gia đình đã dùng bao nhiêu kWh điện?`,
    `Bỏ thuế VAT trước: ${vndVi(T)} : ${factorVi(v)} = ${vndVi(B)} đồng. ${base} kWh đầu hết ${vndVi(bill(base))} đồng; phần còn lại ${vndVi(B - bill(base))} đồng tính giá ${vndVi(topPrice(x))} đồng/kWh, tức là ${x - base} kWh. Tổng cộng ${x} kWh.`,
  );
};

// ── Statistics: frequency tables, relative frequency, grouped data, mean / median / mode ─────
const DISCRETE = [
  { en: 'Test score', vi: 'Điểm kiểm tra', who: 'students', whoVi: 'học sinh', lo: 5, k: 6 },
  { en: 'Age (years)', vi: 'Tuổi', who: 'club members', whoVi: 'thành viên câu lạc bộ', lo: 12, k: 5 },
  { en: 'Books read this month', vi: 'Số sách đọc trong tháng', who: 'students', whoVi: 'học sinh', lo: 0, k: 6 },
  { en: 'Shoe size', vi: 'Cỡ giày', who: 'students', whoVi: 'học sinh', lo: 36, k: 6 },
];
const GROUPED = [
  { en: 'Height (cm)', vi: 'Chiều cao (cm)', a: 140, w: 10, k: 4, who: 'students', whoVi: 'học sinh', least: (b: number) => `are at least ${b} cm tall`, leastVi: (b: number) => `cao từ ${b} cm trở lên` },
  { en: 'Time spent on homework (minutes)', vi: 'Thời gian làm bài tập (phút)', a: 0, w: 20, k: 5, who: 'students', whoVi: 'học sinh', least: (b: number) => `spend at least ${b} minutes`, leastVi: (b: number) => `dành từ ${b} phút trở lên` },
  { en: 'Mass (kg)', vi: 'Cân nặng (kg)', a: 40, w: 4, k: 5, who: 'students', whoVi: 'học sinh', least: (b: number) => `weigh at least ${b} kg`, leastVi: (b: number) => `nặng từ ${b} kg trở lên` },
];
/** k frequencies, each at least 1, adding up to n. */
function freqs(r: () => number, k: number, n: number): number[] {
  const f = Array(k).fill(1);
  for (let i = k; i < n; i++) f[int(r, 0, k - 1)]++;
  return f;
}
/** Keep a mistake only if it has at most two decimal places. */
const clean2 = (x: number) => (Number.isInteger(+(x * 100).toFixed(6)) ? x : NaN);
const sum = (a: number[]) => a.reduce((s, x) => s + x, 0);
const range = (lo: number, k: number) => Array.from({ length: k }, (_, i) => lo + i);
function medianOf(vals: number[], f: number[]): number {
  const all = vals.flatMap((v, i) => Array(f[i]).fill(v) as number[]);
  const n = all.length;
  return n % 2 ? all[(n - 1) / 2] : (all[n / 2 - 1] + all[n / 2]) / 2;
}
const groupStr = (a: number, w: number, k: number) => range(0, k).map((i) => `[${a + i * w}; ${a + (i + 1) * w})`);

const stats: Generator = (d, r) => {
  if (d <= 3) {
    const L = pick(r, DISCRETE);
    const vals = range(L.lo, L.k);
    const kind = d === 1 ? 'rel' : d === 2 ? pick(r, ['mean', 'relmean'] as const) : pick(r, ['median', 'mode'] as const);
    const n = d === 1 ? pick(r, [20, 25, 40, 50]) : d === 2 ? pick(r, [20, 25, 50]) : int(r, 15, 36);
    const f = freqs(r, L.k, n);
    if (kind === 'mode') {
      const max = Math.max(...f);
      const tops = f.map((x, i) => (x === max ? i : -1)).filter((i) => i >= 0);
      if (tops.length > 1) f[pick(r, tops)]++;
    }
    const N = sum(f);
    const S = sum(vals.map((v, i) => v * f[i]));
    const intro = `A survey of ${N} ${L.who} gives this frequency table. ${L.en}: ${vals.join(', ')}; frequency: ${f.join(', ')}.`;
    const introVi = `Kết quả khảo sát ${N} ${L.whoVi} được cho trong bảng tần số sau. ${L.vi}: ${vals.join(', ')}; tần số: ${f.join(', ')}.`;
    if (kind === 'rel') {
      const j = int(r, 0, L.k - 1), v = vals[j];
      return vi(
        {
          prompt: `${intro} What is the relative frequency of the value ${v}?`,
          ...opts((f[j] * 100) / N, [f[j], ((N - f[j]) * 100) / N, cleanPct(100 / L.k)], r, pct, 2.5, 0),
          explanation: `Relative frequency = frequency ÷ total × 100%: ${f[j]} ÷ ${N} × 100% = ${pct((f[j] * 100) / N)}.`,
        },
        `${introVi} Tần số tương đối của giá trị ${v} là bao nhiêu?`,
        `Tần số tương đối = tần số : tổng số × 100%: ${f[j]} : ${N} × 100% = ${dc(pct((f[j] * 100) / N))}.`,
      );
    }
    if (kind === 'relmean') {
      const p = freqs(r, L.k, 20).map((x) => x * 5);
      const M = sum(vals.map((v, i) => v * p[i])) / 100;
      const t = `${L.en}: ${vals.join(', ')}; relative frequency (%): ${p.join(', ')}.`;
      const tVi = `${L.vi}: ${vals.join(', ')}; tần số tương đối (%): ${p.join(', ')}.`;
      return vi(
        {
          prompt: `A survey of some ${L.who} gives this relative frequency table. ${t} Find the mean.`,
          ...opts(M, [clean2(sum(vals) / L.k), vals[p.indexOf(Math.max(...p))], M * 10], r, nf, 0.1),
          explanation: `Mean = Σ(value × relative frequency): ${vals.map((v, i) => `${v}·${nf(p[i] / 100)}`).join(' + ')} = ${nf(M)}.`,
        },
        `Kết quả khảo sát một số ${L.whoVi} được cho trong bảng tần số tương đối sau. ${tVi} Tính số trung bình.`,
        `Số trung bình = tổng (giá trị × tần số tương đối): ${vals.map((v, i) => `${v}·${dc(nf(p[i] / 100))}`).join(' + ')} = ${dc(nf(M))}.`,
      );
    }
    if (kind === 'mean') {
      const M = S / N;
      return vi(
        {
          prompt: `${intro} Find the mean.`,
          ...opts(M, [clean2(sum(vals) / L.k), clean2(S / L.k), medianOf(vals, f)], r, nf, 0.1),
          explanation: `Mean = Σ(value × frequency) ÷ total: (${vals.map((v, i) => `${v}·${f[i]}`).join(' + ')}) ÷ ${N} = ${S} ÷ ${N} = ${nf(M)}. Each value counts as many times as its frequency.`,
        },
        `${introVi} Tính số trung bình.`,
        `Số trung bình = tổng (giá trị × tần số) : tổng số: (${vals.map((v, i) => `${v}·${f[i]}`).join(' + ')}) : ${N} = ${S} : ${N} = ${dc(nf(M))}. Mỗi giá trị được tính số lần bằng tần số của nó.`,
      );
    }
    const med = medianOf(vals, f);
    const max = Math.max(...f), mode = vals[f.indexOf(max)];
    if (kind === 'mode')
      return vi(
        {
          prompt: `${intro} Find the mode.`,
          ...opts(mode, [max, med, vals[L.k - 1]], r, nf, 1),
          explanation: `The mode is the value with the highest frequency: ${mode} appears ${max} times. (${max} is the frequency, not the mode.)`,
        },
        `${introVi} Tìm mốt.`,
        `Mốt là giá trị có tần số lớn nhất: ${mode} xuất hiện ${max} lần. (${max} là tần số, không phải mốt.)`,
      );
    const mid = L.k % 2 ? vals[(L.k - 1) / 2] : (vals[L.k / 2 - 1] + vals[L.k / 2]) / 2;
    const pos = N % 2 ? `the ${(N + 1) / 2}th value` : `the mean of the ${N / 2}th and ${N / 2 + 1}th values`;
    const posVi = N % 2 ? `giá trị thứ ${(N + 1) / 2}` : `trung bình cộng của giá trị thứ ${N / 2} và thứ ${N / 2 + 1}`;
    const cum = f.map((_, i) => sum(f.slice(0, i + 1))).join(', ');
    return vi(
      {
        prompt: `${intro} Find the median.`,
        ...opts(med, [mid, mode, Number.isInteger((S * 100) / N) ? S / N : NaN], r, nf, 0.5),
        explanation: `List all ${N} values in order; the median is ${pos}. Running totals of the frequencies: ${cum}, so the median is ${nf(med)}.`,
      },
      `${introVi} Tìm trung vị.`,
      `Sắp xếp ${N} giá trị theo thứ tự; trung vị là ${posVi}. Cộng dồn tần số: ${cum}, nên trung vị là ${dc(nf(med))}.`,
    );
  }
  const L = pick(r, GROUPED);
  const groups = groupStr(L.a, L.w, L.k);
  if (d === 5 && r() < 0.5) {
    // A missing frequency from the mean.
    const D = DISCRETE[0];
    const vals = range(D.lo, D.k);
    for (let tries = 0; tries < 300; tries++) {
      const f = vals.map(() => int(r, 1, 9));
      const j = int(r, 0, D.k - 1), x = int(r, 2, 12);
      f[j] = x;
      const N = sum(f), S = sum(vals.map((v, i) => v * f[i]));
      if ((S * 10) % N !== 0 || vals[j] * N === S) continue;
      const M = S / N;
      const shown = f.map((y, i) => (i === j ? 'x' : String(y))).join(', ');
      const S0 = S - vals[j] * x, N0 = N - x;
      return vi(
        {
          prompt: `The table shows the scores of a class. Test score: ${vals.join(', ')}; frequency: ${shown}. The mean score is ${nf(M)}. Find x.`,
          ...opts(x, [(M * N0 - S0) / vals[j], (S0 - M * N0) / (M - vals[j]) + 1, N0].filter((y) => Number.isInteger(+y.toFixed(6))), r, nf, 1, 1),
          explanation: `Mean = Σ(value × frequency) ÷ total: (${S0} + ${vals[j]}x) ÷ (${N0} + x) = ${nf(M)}. So ${S0} + ${vals[j]}x = ${nf(M)}(${N0} + x), giving ${nf(Math.abs(vals[j] - M))}x = ${nf(Math.abs(M * N0 - S0))} and x = ${x}.`,
        },
        `Bảng sau cho biết điểm kiểm tra của một lớp. Điểm kiểm tra: ${vals.join(', ')}; tần số: ${shown}. Điểm trung bình là ${dc(nf(M))}. Tìm x.`,
        `Số trung bình = tổng (giá trị × tần số) : tổng số: (${S0} + ${vals[j]}x) : (${N0} + x) = ${dc(nf(M))}. Do đó ${S0} + ${vals[j]}x = ${dc(nf(M))}(${N0} + x), suy ra ${dc(nf(Math.abs(vals[j] - M)))}x = ${dc(nf(Math.abs(M * N0 - S0)))} và x = ${x}.`,
      );
    }
  }
  const n = d === 5 ? pick(r, [20, 25, 50]) : pick(r, [20, 25, 40, 50]);
  const f = freqs(r, L.k, n);
  const intro = `A survey of ${n} ${L.who} gives this grouped frequency table. ${L.en}: ${groups.join(', ')}; frequency: ${f.join(', ')}.`;
  const introVi = `Kết quả khảo sát ${n} ${L.whoVi} được cho trong bảng tần số ghép nhóm sau. ${L.vi}: ${groups.join(', ')}; tần số: ${f.join(', ')}.`;
  if (d === 5) {
    const mids = range(0, L.k).map((i) => L.a + i * L.w + L.w / 2);
    const M = sum(mids.map((m, i) => m * f[i])) / n;
    return vi(
      {
        prompt: `${intro} Estimate the mean using the midpoints of the groups.`,
        ...opts(M, [M - L.w / 2, M + L.w / 2, sum(mids) / L.k], r, nf, 0.2),
        explanation: `Use the midpoint of each group as its value: ${mids.join(', ')}. Mean ≈ (${mids.map((m, i) => `${m}·${f[i]}`).join(' + ')}) ÷ ${n} = ${nf(M)}.`,
      },
      `${introVi} Ước lượng số trung bình bằng giá trị đại diện (điểm giữa) của mỗi nhóm.`,
      `Lấy điểm giữa của mỗi nhóm làm giá trị đại diện: ${mids.join(', ')}. Số trung bình ≈ (${mids.map((m, i) => `${m}·${f[i]}`).join(' + ')}) : ${n} = ${dc(nf(M))}.`,
    );
  }
  if (r() < 0.5) {
    const j = int(r, 0, L.k - 1);
    return vi(
      {
        prompt: `${intro} What is the relative frequency of the group ${groups[j]}?`,
        ...opts((f[j] * 100) / n, [f[j], (sum(f.slice(0, j + 1)) * 100) / n, cleanPct(100 / L.k)], r, pct, 2.5, 0),
        explanation: `Relative frequency of a group = its frequency ÷ total × 100%: ${f[j]} ÷ ${n} × 100% = ${pct((f[j] * 100) / n)}.`,
      },
      `${introVi} Tần số tương đối của nhóm ${groups[j]} là bao nhiêu?`,
      `Tần số tương đối của một nhóm = tần số của nhóm : tổng số × 100%: ${f[j]} : ${n} × 100% = ${dc(pct((f[j] * 100) / n))}.`,
    );
  }
  const t = int(r, 1, L.k - 1), b = L.a + t * L.w;
  const ans = (sum(f.slice(t)) * 100) / n;
  return vi(
    {
      prompt: `${intro} What percentage of them ${L.least(b)}?`,
      ...opts(ans, [(sum(f.slice(t + 1)) * 100) / n, (sum(f.slice(t - 1)) * 100) / n, sum(f.slice(t))], r, pct, 2.5, 0),
      explanation: `The group [a; b) contains a but not b, so "at least ${b}" means the groups from ${groups[t]} on: ${f.slice(t).join(' + ')} = ${sum(f.slice(t))} out of ${n}, i.e. ${pct(ans)}.`,
    },
    `${introVi} Có bao nhiêu phần trăm số ${L.whoVi} ${L.leastVi(b)}?`,
    `Nhóm [a; b) chứa a nhưng không chứa b, nên "từ ${b} trở lên" gồm các nhóm từ ${groups[t]} trở đi: ${f.slice(t).join(' + ')} = ${sum(f.slice(t))} trên ${n}, tức là ${dc(pct(ans))}.`,
  );
};

// ── Probability: sample spaces and favourable outcomes ─────
function pOpts(fav: number, total: number, mistakes: Q[], r: () => number): Opts {
  return qOpts(q(fav, total), mistakes, r, (k) => {
    const up = fav + Math.ceil(k / 2), down = fav - Math.ceil(k / 2);
    if (k % 2 && up <= total) return q(up, total);
    if (down > 0) return q(down, total);
    return q(fav, total + k);
  });
}
const count = <T>(list: T[], f: (x: T) => boolean) => list.filter(f).length;
const isPrime = (n: number) => n > 1 && range(2, Math.max(0, Math.floor(Math.sqrt(n)) - 1)).every((p) => n % p !== 0);

const probability: Generator = (d, r) => {
  if (d === 1) {
    const nums = range(10, 90);
    const k = pick(r, [3, 4, 6, 7, 8, 9, 11, 12, 15]), s = int(r, 5, 13);
    const e = pick(r, [
      { en: `is divisible by ${k}`, vi: `chia hết cho ${k}`, t: (x: number) => x % k === 0 },
      { en: 'is a perfect square', vi: 'là số chính phương', t: (x: number) => Number.isInteger(Math.sqrt(x)) },
      { en: `has digit sum ${s}`, vi: `có tổng các chữ số bằng ${s}`, t: (x: number) => Math.floor(x / 10) + (x % 10) === s },
      { en: 'is a prime number', vi: 'là số nguyên tố', t: isPrime },
      { en: 'has its tens digit greater than its units digit', vi: 'có chữ số hàng chục lớn hơn chữ số hàng đơn vị', t: (x: number) => Math.floor(x / 10) > x % 10 },
    ]);
    const fav = count(nums, e.t), fav99 = count(range(1, 99), e.t);
    return vi(
      {
        prompt: `A two-digit number is chosen at random. What is the probability that it ${e.en}?`,
        ...pOpts(fav, 90, [q(fav, 100), q(fav, 99), q(fav99, 90), q(fav99, 99)], r),
        explanation: `The sample space is {10, 11, …, 99}: 99 − 10 + 1 = 90 equally likely numbers (not 99 or 100). There are ${fav} favourable numbers, so P = ${fav}/90 = ${fs(q(fav, 90))}.`,
      },
      `Chọn ngẫu nhiên một số tự nhiên có hai chữ số. Tính xác suất để số được chọn ${e.vi}.`,
      `Không gian mẫu là {10; 11; …; 99} gồm 99 − 10 + 1 = 90 số có khả năng như nhau (không phải 99 hay 100). Có ${fav} kết quả thuận lợi, nên P = ${fav}/90 = ${fs(q(fav, 90))}.`,
    );
  }
  if (d === 2) {
    const n = pick(r, [2, 3]);
    const seqs = range(0, 2 ** n).map((m) => range(0, n).map((i) => ((m >> (n - 1 - i)) & 1 ? 'T' : 'H')).join(''));
    const heads = (s: string) => count([...s], (c) => c === 'H');
    const evs = [
      { en: n === 2 ? 'getting one head and one tail' : 'getting exactly one head', vi: n === 2 ? 'một mặt sấp và một mặt ngửa' : 'có đúng một mặt sấp', t: (h: number) => h === 1 },
      { en: 'getting at least one head', vi: 'có ít nhất một mặt sấp', t: (h: number) => h >= 1 },
      { en: `${n === 2 ? 'both coins' : 'all three coins'} showing the same face`, vi: 'tất cả các đồng xu xuất hiện cùng một mặt', t: (h: number) => h === 0 || h === n },
    ];
    if (n === 3) evs.push({ en: 'getting exactly two heads', vi: 'có đúng hai mặt sấp', t: (h: number) => h === 2 }, { en: 'getting at least two heads', vi: 'có ít nhất hai mặt sấp', t: (h: number) => h >= 2 });
    const e = pick(r, evs);
    const fav = count(seqs, (s) => e.t(heads(s)));
    const favU = count(range(0, n + 1), e.t);
    const list = seqs.join(', ');
    return vi(
      {
        prompt: `${n === 2 ? 'Two' : 'Three'} fair coins are tossed. What is the probability of ${e.en}?`,
        ...pOpts(fav, 2 ** n, [q(favU, n + 1), q(1, 2 ** n), q(fav, 2 * n)], r),
        explanation: `List the sample space in order (H = head, T = tail): ${list}: ${2 ** n} equally likely outcomes. HT and TH are different outcomes. ${fav} are favourable, so P = ${fav}/${2 ** n} = ${fs(q(fav, 2 ** n))}.`,
      },
      `Gieo ${n === 2 ? 'hai' : 'ba'} đồng xu cân đối. Tính xác suất để ${e.vi}.`,
      `Liệt kê không gian mẫu (S = sấp, N = ngửa): ${list.replace(/H/g, 'S').replace(/T/g, 'N')}: ${2 ** n} kết quả có khả năng như nhau. SN và NS là hai kết quả khác nhau. Có ${fav} kết quả thuận lợi, nên P = ${fav}/${2 ** n} = ${fs(q(fav, 2 ** n))}.`,
    );
  }
  if (d === 3) {
    const pairs = range(1, 6).flatMap((a) => range(1, 6).map((b) => [a, b] as const));
    const s = int(r, 3, 11), ge = int(r, 8, 11), k = int(r, 1, 3);
    const e = pick(r, [
      { en: `the sum of the two numbers is ${s}`, vi: `tổng số chấm trên hai con xúc xắc bằng ${s}`, t: (a: number, b: number) => a + b === s, extra: q(1, 11) },
      { en: `the sum of the two numbers is at least ${ge}`, vi: `tổng số chấm trên hai con xúc xắc lớn hơn hoặc bằng ${ge}`, t: (a: number, b: number) => a + b >= ge, extra: q(13 - ge, 11) },
      { en: 'the product of the two numbers is even', vi: 'tích số chấm trên hai con xúc xắc là số chẵn', t: (a: number, b: number) => (a * b) % 2 === 0, extra: q(1, 2) },
      { en: `the two numbers differ by ${k}`, vi: `số chấm trên hai con xúc xắc hơn kém nhau ${k}`, t: (a: number, b: number) => Math.abs(a - b) === k, extra: q(6 - k, 36) },
      { en: 'at least one die shows a 6', vi: 'có ít nhất một con xúc xắc xuất hiện mặt 6 chấm', t: (a: number, b: number) => a === 6 || b === 6, extra: q(1, 3) },
      { en: 'both dice show the same number', vi: 'hai con xúc xắc xuất hiện cùng số chấm', t: (a: number, b: number) => a === b, extra: q(1, 36) },
    ]);
    const fav = count(pairs, ([a, b]) => e.t(a, b));
    const favU = count(pairs, ([a, b]) => a <= b && e.t(a, b));
    const shown = pairs.filter(([a, b]) => e.t(a, b));
    const list = shown.length <= 8 ? `: ${shown.map(([a, b]) => `(${a}, ${b})`).join(', ')}` : '';
    return vi(
      {
        prompt: `Two fair dice are rolled. What is the probability that ${e.en}?`,
        ...pOpts(fav, 36, [q(favU, 21), e.extra, q(fav, 12)], r),
        explanation: `The sample space is all ordered pairs (first die, second die): 6 × 6 = 36 equally likely outcomes; (1, 2) and (2, 1) are different. Favourable outcomes: ${fav}${list}. P = ${fav}/36 = ${fs(q(fav, 36))}.`,
      },
      `Gieo đồng thời hai con xúc xắc cân đối. Tính xác suất để ${e.vi}.`,
      `Không gian mẫu gồm các cặp có thứ tự (con thứ nhất, con thứ hai): 6 × 6 = 36 kết quả có khả năng như nhau; (1; 2) và (2; 1) là hai kết quả khác nhau. Số kết quả thuận lợi: ${fav}${list.replace(/, (?=\d)/g, '; ')}. P = ${fav}/36 = ${fs(q(fav, 36))}.`,
    );
  }
  if (d === 4) {
    const R = int(r, 2, 6), B = int(r, 2, 6), N = R + B, back = r() < 0.4;
    const isRed = (i: number) => i < R;
    const evs = [
      { en: 'both balls are red', vi: 'cả hai quả đều màu đỏ', t: (i: number, j: number) => isRed(i) && isRed(j) },
      { en: 'the two balls have different colours', vi: 'hai quả khác màu', t: (i: number, j: number) => isRed(i) !== isRed(j) },
      { en: 'at least one ball is red', vi: 'có ít nhất một quả màu đỏ', t: (i: number, j: number) => isRed(i) || isRed(j) },
      { en: 'the two balls have the same colour', vi: 'hai quả cùng màu', t: (i: number, j: number) => isRed(i) === isRed(j) },
    ];
    const e = pick(r, evs);
    const ordered = (rep: boolean) => range(0, N).flatMap((i) => range(0, N).filter((j) => rep || j !== i).map((j) => [i, j] as const));
    const favOf = (rep: boolean) => count(ordered(rep), ([i, j]) => e.t(i, j));
    const fav = favOf(back), total = back ? N * N : N * (N - 1);
    const other = q(favOf(!back), back ? N * (N - 1) : N * N);
    const how = back
      ? `With the first ball put back, the sample space has ${N} × ${N} = ${N * N} equally likely ordered outcomes; ${fav} are favourable.`
      : `Drawing two at once, the sample space is all pairs of balls: ${N}·${N - 1}/2 = ${(N * (N - 1)) / 2} equally likely pairs; ${fav / 2} are favourable.`;
    const howVi = back
      ? `Có trả lại quả thứ nhất, không gian mẫu gồm ${N} × ${N} = ${N * N} kết quả (có thứ tự) có khả năng như nhau; có ${fav} kết quả thuận lợi.`
      : `Lấy đồng thời hai quả, không gian mẫu gồm mọi cặp hai quả bóng: ${N}·${N - 1}/2 = ${(N * (N - 1)) / 2} cặp có khả năng như nhau; có ${fav / 2} cặp thuận lợi.`;
    return vi(
      {
        prompt: `A bag has ${R} red and ${B} blue balls. ${back ? 'Two balls are drawn one after the other, and the first ball is put back before the second draw.' : 'Two balls are drawn at the same time.'} What is the probability that ${e.en}?`,
        ...pOpts(fav, total, [other, q(back ? fav : fav / 2, N * (N - 1)), q(R, N)], r),
        explanation: `${how} P = ${fs(q(fav, total))}.${back ? '' : ' Without replacement the second draw has one ball fewer.'}`,
      },
      `Một túi có ${R} quả bóng đỏ và ${B} quả bóng xanh. ${back ? 'Lấy ngẫu nhiên lần lượt hai quả, lấy xong quả thứ nhất thì trả lại vào túi rồi mới lấy quả thứ hai.' : 'Lấy ngẫu nhiên đồng thời hai quả bóng.'} Tính xác suất để ${e.vi}.`,
      `${howVi} P = ${fs(q(fav, total))}.${back ? '' : ' Không trả lại thì lần lấy thứ hai còn ít hơn một quả.'}`,
    );
  }
  if (r() < 0.55) {
    const b = int(r, 2, 6), g = int(r, 2, 6), N = b + g;
    const isGirl = (i: number) => i >= b;
    const e = pick(r, [
      { en: 'one boy and one girl are chosen', vi: 'chọn được một bạn nam và một bạn nữ', t: (i: number, j: number) => isGirl(i) !== isGirl(j), extra: q(b * g, N * N) },
      { en: 'both are girls', vi: 'cả hai bạn được chọn đều là nữ', t: (i: number, j: number) => isGirl(i) && isGirl(j), extra: q(g * g, N * N) },
      { en: 'at least one girl is chosen', vi: 'có ít nhất một bạn nữ được chọn', t: (i: number, j: number) => isGirl(i) || isGirl(j), extra: q(g, N) },
      { en: 'An (one of the boys) is chosen', vi: 'bạn An (một trong các bạn nam) được chọn', t: (i: number, j: number) => i === 0 || j === 0, extra: q(1, N) },
    ]);
    const pairs = range(0, N).flatMap((i) => range(i + 1, N - i - 1).map((j) => [i, j] as const));
    const fav = count(pairs, ([i, j]) => e.t(i, j)), total = pairs.length;
    return vi(
      {
        prompt: `A group has ${b} boys and ${g} girls. Two students are chosen at random to represent the group. What is the probability that ${e.en}?`,
        ...pOpts(fav, total, [q(fav, N * (N - 1)), e.extra, q(fav, N * N)], r),
        explanation: `The order of choosing does not matter: there are ${N}·${N - 1}/2 = ${total} equally likely pairs of students. ${fav} pairs are favourable, so P = ${fav}/${total} = ${fs(q(fav, total))}.`,
      },
      `Một nhóm có ${b} bạn nam và ${g} bạn nữ. Chọn ngẫu nhiên hai bạn đi đại diện cho nhóm. Tính xác suất để ${e.vi}.`,
      `Thứ tự chọn không quan trọng: có ${N}·${N - 1}/2 = ${total} cặp hai bạn có khả năng như nhau. Có ${fav} cặp thuận lợi, nên P = ${fav}/${total} = ${fs(q(fav, total))}.`,
    );
  }
  const N = int(r, 6, 12);
  const e = pick(r, [
    { en: 'the sum of the two numbers is even', vi: 'tổng hai số ghi trên hai thẻ là số chẵn', t: (a: number, b: number) => (a + b) % 2 === 0 },
    { en: 'the product of the two numbers is even', vi: 'tích hai số ghi trên hai thẻ là số chẵn', t: (a: number, b: number) => (a * b) % 2 === 0 },
    { en: 'the sum of the two numbers is divisible by 3', vi: 'tổng hai số ghi trên hai thẻ chia hết cho 3', t: (a: number, b: number) => (a + b) % 3 === 0 },
  ]);
  const pairs = range(1, N).flatMap((a) => range(a + 1, N - a).map((b) => [a, b] as const));
  const withRep = range(1, N).flatMap((a) => range(1, N).map((b) => [a, b] as const));
  const fav = count(pairs, ([a, b]) => e.t(a, b)), total = pairs.length;
  return vi(
    {
      prompt: `A box has ${N} cards numbered 1 to ${N}. Two cards are drawn at the same time. What is the probability that ${e.en}?`,
      ...pOpts(fav, total, [q(count(withRep, ([a, b]) => e.t(a, b)), N * N), q(fav, N * (N - 1)), q(1, 2)], r),
      explanation: `Two cards drawn together form a pair: ${N}·${N - 1}/2 = ${total} equally likely pairs (no card twice). Count the favourable pairs: ${fav}. P = ${fav}/${total} = ${fs(q(fav, total))}.`,
    },
    `Một hộp có ${N} tấm thẻ được đánh số từ 1 đến ${N}. Rút ngẫu nhiên đồng thời hai thẻ. Tính xác suất để ${e.vi}.`,
    `Rút đồng thời hai thẻ ta được một cặp thẻ: có ${N}·${N - 1}/2 = ${total} cặp có khả năng như nhau (không rút trùng một thẻ). Đếm các cặp thuận lợi: ${fav}. P = ${fav}/${total} = ${fs(q(fav, total))}.`,
  );
};

// ── Counting: multiplication principle, arrangements, choosing, numbers from digits ─────
const Cn = (n: number, k: number): number => (k < 0 || k > n ? 0 : k === 0 ? 1 : (Cn(n - 1, k - 1) * n) / k);
const Pn = (n: number, k: number): number => (k <= 0 ? 1 : n * Pn(n - 1, k - 1));

const counting: Generator = (d, r) => {
  if (d === 1) {
    const kind = pick(r, ['menu', 'roads', 'code'] as const);
    if (kind === 'menu') {
      const a = int(r, 3, 8), b = int(r, 2, 6), c = int(r, 2, 5);
      return vi(
        {
          prompt: `A canteen offers ${a} main dishes, ${b} side dishes and ${c} drinks. A lunch set is one main dish, one side dish and one drink. How many different lunch sets are there?`,
          ...opts(a * b * c, [a + b + c, a * b + c, a * b], r, nf, 1, 1),
          explanation: `Multiplication principle: the three choices are made one after another, so ${a} × ${b} × ${c} = ${a * b * c}. Adding (${a + b + c}) would count choosing only one item.`,
        },
        `Một căng tin có ${a} món chính, ${b} món phụ và ${c} loại đồ uống. Một suất ăn trưa gồm một món chính, một món phụ và một đồ uống. Có bao nhiêu suất ăn trưa khác nhau?`,
        `Quy tắc nhân: ba lựa chọn được thực hiện liên tiếp, nên có ${a} × ${b} × ${c} = ${a * b * c} suất. Cộng lại (${a + b + c}) là đếm khi chỉ chọn một món.`,
      );
    }
    if (kind === 'roads') {
      const m = int(r, 2, 6), n = int(r, 2, 6), direct = int(r, 1, 3);
      return vi(
        {
          prompt: `There are ${m} roads from A to B, ${n} roads from B to C, and ${direct} road${direct > 1 ? 's' : ''} going straight from A to C. How many ways are there to travel from A to C?`,
          ...opts(m * n + direct, [m * n, m + n + direct, m * n * direct], r, nf, 1, 1),
          explanation: `Through B: ${m} × ${n} = ${m * n} ways (multiplication principle). Straight: ${direct}. These are separate cases, so add: ${m * n} + ${direct} = ${m * n + direct}.`,
        },
        `Từ A đến B có ${m} con đường, từ B đến C có ${n} con đường, và có ${direct} con đường đi thẳng từ A đến C. Có bao nhiêu cách đi từ A đến C?`,
        `Đi qua B: ${m} × ${n} = ${m * n} cách (quy tắc nhân). Đi thẳng: ${direct} cách. Hai trường hợp tách biệt nên cộng lại: ${m * n} + ${direct} = ${m * n + direct}.`,
      );
    }
    const L = int(r, 3, 4), m = int(r, 3, 6);
    return vi(
      {
        prompt: `A lock code has ${L} digits, each chosen from 1 to ${m}, and digits may repeat. How many different codes are there?`,
        ...opts(m ** L, [m * L, Pn(m, L), L ** m], r, nf, 1, 1),
        explanation: `Each of the ${L} positions has ${m} choices, independently: ${range(0, L).map(() => m).join(' × ')} = ${m}${sup(L)} = ${m ** L}.`,
      },
      `Một mã khoá gồm ${L} chữ số, mỗi chữ số được chọn từ 1 đến ${m} và các chữ số có thể lặp lại. Có bao nhiêu mã khoá khác nhau?`,
      `Mỗi vị trí trong ${L} vị trí đều có ${m} cách chọn: ${range(0, L).map(() => m).join(' × ')} = ${m}${sup(L)} = ${m ** L}.`,
    );
  }
  if (d === 2) {
    const kind = pick(r, ['line', 'roles', 'trip'] as const);
    if (kind === 'line') {
      const n = int(r, 4, 7);
      return vi(
        {
          prompt: `In how many ways can ${n} students stand in a row for a photo?`,
          ...opts(Pn(n, n), [n * n, n * (n - 1), Pn(n, n) / 2], r, nf, 1, 1),
          explanation: `The first place has ${n} choices, the next ${n - 1}, and so on: ${range(0, n).map((i) => n - i).join(' × ')} = ${n}! = ${Pn(n, n)}.`,
        },
        `Có bao nhiêu cách xếp ${n} bạn học sinh đứng thành một hàng ngang để chụp ảnh?`,
        `Vị trí đầu có ${n} cách chọn, vị trí tiếp theo ${n - 1} cách, cứ thế: ${range(0, n).map((i) => n - i).join(' × ')} = ${n}! = ${Pn(n, n)}.`,
      );
    }
    if (kind === 'roles') {
      const n = int(r, 20, 40);
      return vi(
        {
          prompt: `A class of ${n} students chooses a class monitor and a deputy monitor (two different students). In how many ways can this be done?`,
          ...opts(n * (n - 1), [Cn(n, 2), n * n, 2 * n], r, nf, 1, 1),
          explanation: `The two posts are different, so order matters: ${n} choices for the monitor, then ${n - 1} for the deputy: ${n} × ${n - 1} = ${n * (n - 1)}. (${Cn(n, 2)} would count unordered pairs.)`,
        },
        `Một lớp có ${n} học sinh cần chọn một lớp trưởng và một lớp phó (hai bạn khác nhau). Có bao nhiêu cách chọn?`,
        `Hai chức vụ khác nhau nên thứ tự quan trọng: ${n} cách chọn lớp trưởng, rồi ${n - 1} cách chọn lớp phó: ${n} × ${n - 1} = ${n * (n - 1)}. (${Cn(n, 2)} là số cặp không tính thứ tự.)`,
      );
    }
    const m = int(r, 2, 5), n = int(r, 2, 5);
    const ans = m * n * (n - 1) * (m - 1);
    return vi(
      {
        prompt: `There are ${m} roads from A to B and ${n} roads from B to C. Nam goes from A to C through B and comes back to A through B, never using the same road twice. How many ways can he make the round trip?`,
        ...opts(ans, [(m * n) ** 2, m * n, 2 * m * n], r, nf, 1, 1),
        explanation: `Going: ${m} × ${n} ways. Coming back he cannot reuse a road: ${n - 1} roads from C to B and ${m - 1} from B to A. Total ${m} × ${n} × ${n - 1} × ${m - 1} = ${ans}.`,
      },
      `Từ A đến B có ${m} con đường, từ B đến C có ${n} con đường. Nam đi từ A đến C qua B rồi quay về A cũng qua B, không đi lại con đường nào đã đi. Có bao nhiêu cách đi cả đi lẫn về?`,
      `Lúc đi: ${m} × ${n} cách. Lúc về không được đi lại đường cũ: còn ${n - 1} đường từ C về B và ${m - 1} đường từ B về A. Tổng cộng ${m} × ${n} × ${n - 1} × ${m - 1} = ${ans}.`,
    );
  }
  if (d === 3) {
    const kind = pick(r, ['once', 'twice', 'segments', 'together'] as const);
    if (kind === 'together') {
      const n = int(r, 4, 7);
      const ans = 2 * Pn(n - 1, n - 1);
      return vi(
        {
          prompt: `${n} students, including Mai and Lan, stand in a row. In how many ways can they stand if Mai and Lan must be next to each other?`,
          ...opts(ans, [Pn(n - 1, n - 1), Pn(n, n) - 2, 2 * Pn(n, n)], r, nf, 1, 1),
          explanation: `Glue Mai and Lan into one block: now ${n - 1} items to arrange, ${n - 1}! = ${Pn(n - 1, n - 1)} ways. Inside the block they can be Mai–Lan or Lan–Mai: × 2 = ${ans}.`,
        },
        `${n} bạn học sinh, trong đó có Mai và Lan, đứng thành một hàng. Có bao nhiêu cách xếp sao cho Mai và Lan đứng cạnh nhau?`,
        `Coi Mai và Lan là một "khối": còn ${n - 1} phần tử để xếp, có ${n - 1}! = ${Pn(n - 1, n - 1)} cách. Trong khối, hai bạn có thể đổi chỗ (Mai–Lan hoặc Lan–Mai): × 2 = ${ans}.`,
      );
    }
    const n = int(r, 6, 20);
    if (kind === 'twice')
      return vi(
        {
          prompt: `In a football league of ${n} teams, every two teams play each other twice (home and away). How many matches are played?`,
          ...opts(n * (n - 1), [Cn(n, 2), n * n, 2 * n], r, nf, 1, 1),
          explanation: `Each team plays a home match against each of the other ${n - 1} teams: ${n} × ${n - 1} = ${n * (n - 1)}. (Once each would be ${n}·${n - 1}/2 = ${Cn(n, 2)}.)`,
        },
        `Một giải bóng đá có ${n} đội, hai đội bất kì gặp nhau hai lượt (sân nhà và sân khách). Có tất cả bao nhiêu trận đấu?`,
        `Mỗi đội đá một trận sân nhà với mỗi đội trong ${n - 1} đội còn lại: ${n} × ${n - 1} = ${n * (n - 1)}. (Nếu chỉ gặp nhau một lượt thì là ${n}·${n - 1}/2 = ${Cn(n, 2)}.)`,
      );
    const seg = kind === 'segments';
    return vi(
      {
        prompt: seg
          ? `There are ${n} points in a plane, no three on a line. How many segments can be drawn with two of these points as endpoints?`
          : `At a meeting, each of ${n} people shakes hands once with every other person. How many handshakes are there?`,
        ...opts(Cn(n, 2), [n * (n - 1), n * n, n], r, nf, 1, 1),
        explanation: `Choose 2 of ${n}, order not mattering: each one pairs with ${n - 1} others, and every pair is counted twice, so ${n}·${n - 1}/2 = ${Cn(n, 2)}.`,
      },
      seg
        ? `Cho ${n} điểm trong mặt phẳng, không có ba điểm nào thẳng hàng. Vẽ được bao nhiêu đoạn thẳng có hai đầu mút là hai trong các điểm đó?`
        : `Trong một buổi gặp mặt có ${n} người, mỗi người bắt tay đúng một lần với từng người khác. Có tất cả bao nhiêu cái bắt tay?`,
      `Chọn 2 trong ${n}, không tính thứ tự: mỗi ${seg ? 'điểm' : 'người'} ghép với ${n - 1} ${seg ? 'điểm' : 'người'} khác, mỗi cặp được đếm hai lần, nên có ${n}·${n - 1}/2 = ${Cn(n, 2)}.`,
    );
  }
  if (d === 4) {
    const kind = pick(r, ['team', 'triangles', 'mixed', 'posts'] as const);
    if (kind === 'mixed') {
      const b = int(r, 4, 9), g = int(r, 3, 8);
      const ans = Cn(b, 2) * g;
      return vi(
        {
          prompt: `A class team of 3 must have 2 boys and 1 girl, chosen from ${b} boys and ${g} girls. How many different teams are possible?`,
          ...opts(ans, [b * (b - 1) * g, Cn(b + g, 3), Cn(b, 2) + g], r, nf, 1, 1),
          explanation: `Choose the 2 boys: ${b}·${b - 1}/2 = ${Cn(b, 2)} ways (order does not matter). Choose the girl: ${g} ways. Multiply: ${Cn(b, 2)} × ${g} = ${ans}.`,
        },
        `Một đội 3 người gồm 2 bạn nam và 1 bạn nữ được chọn từ ${b} bạn nam và ${g} bạn nữ. Có bao nhiêu cách chọn đội?`,
        `Chọn 2 bạn nam: ${b}·${b - 1}/2 = ${Cn(b, 2)} cách (không tính thứ tự). Chọn 1 bạn nữ: ${g} cách. Nhân lại: ${Cn(b, 2)} × ${g} = ${ans}.`,
      );
    }
    const n = int(r, 6, 14);
    if (kind === 'posts')
      return vi(
        {
          prompt: `From ${n} members, a club chooses a president, a vice-president and a secretary (three different people). In how many ways can this be done?`,
          ...opts(Pn(n, 3), [Cn(n, 3), n ** 3, 3 * n], r, nf, 1, 1),
          explanation: `The posts are different, so order matters: ${n} × ${n - 1} × ${n - 2} = ${Pn(n, 3)}.`,
        },
        `Từ ${n} thành viên, một câu lạc bộ chọn một chủ nhiệm, một phó chủ nhiệm và một thư kí (ba người khác nhau). Có bao nhiêu cách chọn?`,
        `Các chức vụ khác nhau nên thứ tự quan trọng: ${n} × ${n - 1} × ${n - 2} = ${Pn(n, 3)}.`,
      );
    const tri = kind === 'triangles';
    return vi(
      {
        prompt: tri
          ? `There are ${n} points in a plane, no three on a line. How many triangles have three of these points as vertices?`
          : `A group of 3 students is chosen from ${n} students to clean the classroom. How many different groups are possible?`,
        ...opts(Cn(n, 3), [Pn(n, 3), Cn(n, 2), 3 * n], r, nf, 1, 1),
        explanation: `Ordered choices: ${n} × ${n - 1} × ${n - 2} = ${Pn(n, 3)}. Each group of 3 is counted 3! = 6 times, so divide: ${Pn(n, 3)} ÷ 6 = ${Cn(n, 3)}.`,
      },
      tri
        ? `Cho ${n} điểm trong mặt phẳng, không có ba điểm nào thẳng hàng. Có bao nhiêu tam giác có ba đỉnh là ba trong các điểm đó?`
        : `Chọn một nhóm 3 bạn từ ${n} bạn học sinh để trực nhật lớp. Có bao nhiêu cách chọn nhóm?`,
      `Chọn có thứ tự: ${n} × ${n - 1} × ${n - 2} = ${Pn(n, 3)}. Mỗi nhóm 3 người bị đếm 3! = 6 lần, nên chia: ${Pn(n, 3)} : 6 = ${Cn(n, 3)}.`,
    );
  }
  // d5: numbers formed from given digits
  for (;;) {
    const size = int(r, 5, 7);
    const pool = shuffle(r, range(1, 9)).slice(0, r() < 0.6 ? size - 1 : size);
    const D = (pool.length < size ? [0, ...pool] : pool).sort((a, b) => a - b);
    const L = size >= 7 ? 3 : pick(r, [3, 4]);
    const distinct = r() < 0.75;
    const cond = pick(r, ['even', 'odd', 'div5', 'none'] as const);
    const ok = (x: number) => (cond === 'even' ? x % 2 === 0 : cond === 'odd' ? x % 2 === 1 : cond === 'div5' ? x % 5 === 0 : true);
    const tally = (lead: boolean, useCond: boolean, dist: boolean) => {
      let c = 0;
      const rec = (t: number[]) => {
        if (t.length === L) {
          if ((lead || t[0] !== 0) && (!useCond || ok(t[L - 1]))) c++;
          return;
        }
        for (const x of D) if (!dist || !t.includes(x)) rec([...t, x]);
      };
      rec([]);
      return c;
    };
    const ans = tally(false, true, distinct);
    if (ans === 0 || (cond !== 'none' && D.filter(ok).length === D.length)) continue;
    const ends = D.filter(ok);
    const adj = cond === 'even' || cond === 'odd' ? `${cond} ` : '';
    const condVi = { even: ' và là số chẵn', odd: ' và là số lẻ', div5: ' và chia hết cho 5', none: '' }[cond];
    const digits = D.join(', ');
    let how: string, howVi: string;
    const zero = D[0] === 0;
    if (!distinct) {
      const first = D.length - (zero ? 1 : 0), last = cond === 'none' ? D.length : ends.length;
      const parts = [first, ...Array(L - 2).fill(D.length), last];
      how = `First digit: ${first} choices${zero ? ' (not 0)' : ''}; ${L - 2 === 1 ? 'middle digit' : 'middle digits'}: ${D.length} each${cond === 'none' ? '' : `; last digit: ${last} (${ends.join(', ')})`}. ${parts.join(' × ')} = ${ans}.`;
      howVi = `Chữ số đầu: ${first} cách${zero ? ' (khác 0)' : ''}; mỗi chữ số ở giữa: ${D.length} cách${cond === 'none' ? '' : `; chữ số cuối: ${last} cách (${ends.join(', ')})`}. ${parts.join(' × ')} = ${ans}.`;
    } else if (zero && cond !== 'none' && ends.includes(0)) {
      const A = Pn(D.length - 1, L - 1), Bc = ans - A;
      how = `Split by the last digit. Last digit 0: the other ${L - 1} places take any of the remaining digits, ${A} numbers. Last digit ${ends.filter((x) => x).join(' or ')}: the first digit cannot be 0, giving ${Bc} numbers. Total ${A} + ${Bc} = ${ans}.`;
      howVi = `Chia trường hợp theo chữ số cuối. Chữ số cuối là 0: ${L - 1} vị trí còn lại xếp tuỳ ý các chữ số còn lại, có ${A} số. Chữ số cuối là ${ends.filter((x) => x).join(' hoặc ')}: chữ số đầu phải khác 0, có ${Bc} số. Tổng cộng ${A} + ${Bc} = ${ans}.`;
    } else if (cond === 'none') {
      const first = D.length - (zero ? 1 : 0);
      how = `First digit: ${first} choices${zero ? ' (not 0)' : ''}; then the other places take different remaining digits: ${first} × ${Pn(D.length - 1, L - 1)} = ${ans}.`;
      howVi = `Chữ số đầu: ${first} cách${zero ? ' (khác 0)' : ''}; các vị trí còn lại chọn các chữ số khác nhau còn lại: ${first} × ${Pn(D.length - 1, L - 1)} = ${ans}.`;
    } else {
      const first = D.length - 1 - (zero ? 1 : 0);
      how = `Choose the last digit first: ${ends.length} ways (${ends.join(', ')}). Then the first digit: ${first} ways (not the last digit${zero ? ', not 0' : ''}). Then the middle: ${Pn(D.length - 2, L - 2)} ways. ${ends.length} × ${first} × ${Pn(D.length - 2, L - 2)} = ${ans}.`;
      howVi = `Chọn chữ số cuối trước: ${ends.length} cách (${ends.join(', ')}). Rồi chữ số đầu: ${first} cách (khác chữ số cuối${zero ? ', khác 0' : ''}). Rồi các chữ số ở giữa: ${Pn(D.length - 2, L - 2)} cách. ${ends.length} × ${first} × ${Pn(D.length - 2, L - 2)} = ${ans}.`;
    }
    return vi(
      {
        prompt: `How many ${adj}${L}-digit numbers${cond === 'div5' ? ' divisible by 5' : ''} can be formed from the digits ${digits}${distinct ? ', with no digit repeated' : ', if digits may be repeated'}?`,
        ...opts(ans, [tally(true, true, distinct), tally(false, false, distinct), tally(false, true, !distinct)], r, nf, 1, 1),
        explanation: zero ? `${how} Watch out: a number cannot start with 0.` : how,
      },
      `Từ các chữ số ${digits}, lập được bao nhiêu số tự nhiên có ${L} chữ số${condVi}${distinct ? ', các chữ số đôi một khác nhau' : ' (các chữ số có thể lặp lại)'}?`,
      zero ? `${howVi} Chú ý: chữ số đầu tiên không được là 0.` : howVi,
    );
  }
};

export const number9Concepts: ConceptSeed[] = [
  {
    id: 'math.number.real-life',
    domain: 'Number',
    skill: 'Percentages',
    name: 'Money in real life',
    missionName: 'Market Day',
    description: 'Multi-step VND problems from the entrance exam: "buy 3 get 1" offers, taxi fares and tiered electricity bills with VAT, worked forwards and backwards.',
    prerequisites: ['math.number.percent'],
    lesson:
      'Read the price rule carefully and split the quantity into its parts: the first km, km 2–30, the rest; or each electricity tier, each charged at its own price. Add the parts, then add VAT last (× 1.1 for 10%). Working backwards, undo the steps in reverse order: remove the VAT first (÷ 1.1), then see which tier the remaining money reaches.',
    examRefs: ['Vào 10 Hà Nội · Bài toán thực tế (tiền điện, taxi, khuyến mãi)'],
  },
];

export const number9Patches: Record<string, Partial<ConceptSeed>> = {
  'math.number.integers': {
    name: 'Real numbers & order of operations',
    description: 'Real numbers: order of operations with powers, roots and absolute values; √(A²) = |A|; comparing and ordering irrational numbers; rationalising denominators.',
    lesson:
      'Order: brackets → powers and roots → × : (left to right) → + − (left to right). −3² = −9 but (−3)² = 9. √(A²) = |A|, so √((2 − √5)²) = √5 − 2. √A·√B = √(AB). To compare c√s with a number, square both: 2√6 = √24 < 5 = √25. Simplify roots by taking squares out (√75 = 5√3), then collect like roots; to rationalise, multiply by the conjugate: (√a − b)(√a + b) = a − b².',
    examRefs: ['Toán 9 · Căn bậc hai, căn bậc ba của số thực', 'Vào 10 Hà Nội · Bài I (rút gọn biểu thức)'],
  },
  'math.number.fractions': {
    name: 'Rational expressions',
    description: 'Calculations mixing fractions, decimals and negatives in the right order; telescoping sums and products.',
    lesson:
      'Change decimals to fractions (0.75 = 3/4). Brackets first, then powers, then × and : (dividing = multiplying by the reciprocal), then + and − with a common denominator. Watch the signs: (−2/3)² = 4/9. Telescoping: 1/(k(k + 1)) = 1/k − 1/(k + 1) and 1 − 1/k² = (k − 1)(k + 1)/k², so long sums and products collapse.',
    examRefs: ['Toán 9 · Số hữu tỉ, số thực', 'Vào 10 · Tính giá trị biểu thức'],
  },
  'math.number.percent': {
    name: 'Percentages & interest',
    description: 'Exam-style percentages with VND: discounts and successive discounts, original price, profit and loss, VAT, simple and compound interest over 2 years, population growth.',
    lesson:
      'Turn every change into a multiplier: +8% → × 1.08, −25% → × 0.75. Successive changes multiply (−20% then −10% = × 0.72, i.e. −28%, not −30%). Percentage change = change ÷ original × 100%. To find the original, divide by the multiplier (after −20% it is 400,000 → 400,000 ÷ 0.8 = 500,000). Simple interest: X(1 + n·r). Compound interest (interest added each year): X(1 + r)ⁿ, so after 2 years X(1 + r)².',
    examRefs: ['Vào 10 Hà Nội · Bài II (bài toán thực tế: lãi suất, giảm giá, VAT)', 'Toán 9 · Giải bài toán bằng cách lập phương trình'],
  },
  'math.number.powers': {
    name: 'Powers, roots & scientific notation',
    description: 'Exponent laws with zero and negative exponents, scientific notation, cube roots, comparing large powers.',
    lesson:
      'aᵐ·aⁿ = aᵐ⁺ⁿ, aᵐ : aⁿ = aᵐ⁻ⁿ, (aᵐ)ⁿ = aᵐⁿ, aⁿbⁿ = (ab)ⁿ, a⁰ = 1, a⁻ⁿ = 1/aⁿ. Scientific notation: a × 10ⁿ with 1 ≤ a < 10. ∛(−27) = −3. To compare 2³⁰⁰ and 3²⁰⁰ make the exponents equal (8¹⁰⁰ < 9¹⁰⁰) or the bases equal (16¹⁹ = 2⁷⁶).',
    examRefs: ['Toán 9 · Căn bậc ba', 'Toán 7–8 · Luỹ thừa, kí hiệu khoa học'],
  },
  'math.stats.average': {
    name: 'Frequency tables & averages',
    description: 'Toán 9 statistics: frequency and relative frequency tables, grouped data, the mean from a (grouped) frequency table, median and mode, a missing frequency from the mean.',
    lesson:
      'Relative frequency = frequency ÷ total × 100%. Mean from a table = Σ(value × frequency) ÷ total; from a relative frequency table, Σ(value × relative frequency). Grouped data [a; b): use the midpoint (a + b)/2 as the value, and remember [a; b) contains a but not b. Mode = the value with the highest frequency (not the frequency itself). Median: sort all n values (use running totals of the frequencies) and take the middle one, or the mean of the two middle ones when n is even.',
    examRefs: ['Toán 9 · Bảng tần số, tần số tương đối', 'Toán 9 · Bảng tần số ghép nhóm'],
  },
  'math.stats.probability': {
    name: 'Probability & sample spaces',
    description: 'Toán 9 probability: write the sample space, count equally likely outcomes; coins, two dice, two-digit numbers, balls with and without replacement, choosing a pair.',
    lesson:
      'P(A) = number of favourable outcomes ÷ number of outcomes in the sample space, when all outcomes are equally likely. Write the sample space first: two coins give HH, HT, TH, TT (4, not 3); two dice give 36 ordered pairs; two-digit numbers are 10…99, 90 of them. Two balls drawn at the same time: unordered pairs, n(n − 1)/2 of them; drawn one after another with the first put back: n × n ordered outcomes. Give the answer in simplest form.',
    examRefs: ['Toán 9 · Phép thử ngẫu nhiên và không gian mẫu', 'Toán 9 · Xác suất của biến cố', 'Vào 10 Hà Nội · Bài I (thống kê – xác suất)'],
  },
  'math.combinatorics.counting': {
    name: 'Counting principles',
    description: 'Multiplication and addition principles, arrangements, choosing 2 or 3 from n with or without order, numbers formed from digits with conditions.',
    lesson:
      'Steps one after another → multiply; separate cases → add. Arranging n objects: n! = n·(n − 1)·…·1. Choosing with different roles (order matters): n(n − 1) for 2, n(n − 1)(n − 2) for 3. Choosing a group (order does not matter): n(n − 1)/2 for 2, n(n − 1)(n − 2)/6 for 3. Numbers from digits: fill the restricted places first (the last digit for even / odd / divisible by 5, and the first digit can never be 0); when 0 is a possible last digit, split into cases.',
    examRefs: ['Toán 9 · Quy tắc đếm (chuẩn bị cho xác suất)', 'Thi vào 10 chuyên · Tổ hợp'],
  },
};

export const number9Generators: Record<string, Generator> = {
  'math.number.integers': realNumbers,
  'math.number.fractions': fractions,
  'math.number.powers': powers,
  'math.number.percent': percent,
  'math.number.real-life': realLife,
  'math.stats.average': stats,
  'math.stats.probability': probability,
  'math.combinatorics.counting': counting,
};

export const number9LessonsVi: Record<string, string> = {
  'math.number.integers':
    'Thứ tự thực hiện: ngoặc → luỹ thừa, căn → nhân chia (trái sang phải) → cộng trừ (trái sang phải). −3² = −9 nhưng (−3)² = 9. √(A²) = |A|, nên √((2 − √5)²) = √5 − 2. √A·√B = √(AB). Muốn so sánh c√s với một số, bình phương cả hai: 2√6 = √24 < 5 = √25. Rút gọn căn bằng cách đưa thừa số ra ngoài dấu căn (√75 = 5√3) rồi cộng các căn đồng dạng; trục căn thức ở mẫu bằng cách nhân với biểu thức liên hợp: (√a − b)(√a + b) = a − b².',
  'math.number.fractions':
    'Đổi số thập phân ra phân số (0,75 = 3/4). Làm trong ngoặc trước, rồi luỹ thừa, rồi nhân chia (chia cho một phân số là nhân với số nghịch đảo), cuối cùng cộng trừ sau khi quy đồng. Cẩn thận với dấu: (−2/3)² = 4/9. Tổng "triệt tiêu": 1/(k(k + 1)) = 1/k − 1/(k + 1) và 1 − 1/k² = (k − 1)(k + 1)/k², nên các tổng và tích dài rút gọn lại rất ngắn.',
  'math.number.percent':
    'Đổi mỗi lần thay đổi thành một hệ số nhân: tăng 8% → × 1,08, giảm 25% → × 0,75. Nhiều lần thay đổi liên tiếp thì nhân các hệ số (giảm 20% rồi giảm 10% = × 0,72, tức là giảm 28% chứ không phải 30%). Phần trăm thay đổi = mức thay đổi ÷ giá ban đầu × 100%. Muốn tìm giá ban đầu thì chia cho hệ số (sau khi giảm 20% còn 400.000 → 400.000 : 0,8 = 500.000). Lãi đơn: X(1 + n·r). Lãi kép (lãi nhập vào gốc mỗi năm): X(1 + r)ⁿ, nên sau 2 năm là X(1 + r)².',
  'math.number.real-life':
    'Đọc kĩ cách tính giá và chia số lượng thành từng phần: km đầu tiên, từ km thứ 2 đến km thứ 30, phần còn lại; hoặc từng bậc giá điện, mỗi bậc tính theo giá riêng. Cộng các phần lại, cuối cùng mới cộng thuế VAT (× 1,1 với VAT 10%). Khi làm ngược, đảo ngược thứ tự các bước: bỏ VAT trước (: 1,1), rồi xem số tiền còn lại thuộc đến bậc nào.',
  'math.number.powers':
    'aᵐ·aⁿ = aᵐ⁺ⁿ, aᵐ : aⁿ = aᵐ⁻ⁿ, (aᵐ)ⁿ = aᵐⁿ, aⁿbⁿ = (ab)ⁿ, a⁰ = 1, a⁻ⁿ = 1/aⁿ. Kí hiệu khoa học: a × 10ⁿ với 1 ≤ a < 10. ∛(−27) = −3. Để so sánh 2³⁰⁰ và 3²⁰⁰, đưa về cùng số mũ (8¹⁰⁰ < 9¹⁰⁰) hoặc cùng cơ số (16¹⁹ = 2⁷⁶).',
  'math.stats.average':
    'Tần số tương đối = tần số : tổng số × 100%. Số trung bình từ bảng tần số = tổng (giá trị × tần số) : tổng số; từ bảng tần số tương đối thì bằng tổng (giá trị × tần số tương đối). Bảng ghép nhóm [a; b): lấy điểm giữa (a + b)/2 làm giá trị đại diện, và nhớ nhóm [a; b) chứa a nhưng không chứa b. Mốt là giá trị có tần số lớn nhất (không phải bản thân tần số). Trung vị: sắp xếp n giá trị (cộng dồn tần số) rồi lấy số ở giữa, hoặc trung bình cộng hai số ở giữa nếu n chẵn.',
  'math.stats.probability':
    'Khi các kết quả có khả năng như nhau: P(A) = số kết quả thuận lợi cho A : số phần tử của không gian mẫu. Luôn viết không gian mẫu trước: gieo hai đồng xu được SS, SN, NS, NN (4 kết quả, không phải 3); gieo hai con xúc xắc được 36 cặp có thứ tự; các số có hai chữ số là 10…99, gồm 90 số. Lấy đồng thời hai quả bóng: các cặp không thứ tự, có n(n − 1)/2 cặp; lấy lần lượt có trả lại: n × n kết quả có thứ tự. Viết kết quả dưới dạng phân số tối giản.',
  'math.combinatorics.counting':
    'Các bước làm liên tiếp → nhân; các trường hợp tách biệt → cộng. Xếp n đối tượng thành hàng: n! = n·(n − 1)·…·1. Chọn có phân biệt vai trò (có thứ tự): n(n − 1) với 2 người, n(n − 1)(n − 2) với 3 người. Chọn một nhóm (không thứ tự): n(n − 1)/2 với 2, n(n − 1)(n − 2)/6 với 3. Lập số từ các chữ số: điền các vị trí có điều kiện trước (chữ số cuối cho số chẵn / lẻ / chia hết cho 5; chữ số đầu không bao giờ là 0); nếu chữ số cuối có thể là 0 thì chia trường hợp.',
};
