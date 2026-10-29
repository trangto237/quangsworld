/**
 * Advanced maths for the grade-10 specialist-school exams (thi vào 10 chuyên Toán: Hà Nội – Amsterdam,
 * KHTN, Sư phạm) and the grade-9 maths olympiad (học sinh giỏi Toán 9). They live on the "Olympiad
 * Spire" island. Difficulty 1 is already above the standard grade-9 programme; difficulty 5 is about
 * a hard sub-question of a chuyên / HSG paper. Every question is multiple choice with an exact, clean
 * answer, distractors taken from real mistakes, and an explanation of the key trick in English and
 * Vietnamese. packages/knowledge/src/advanced.test.ts checks every answer by brute force.
 */
import type { ConceptSeed } from '../helpers';
import type { Generated, Generator } from './generators';
import { fracN, gcd, int, num, numeric, nz, pick, poly, roots, signed, terms } from './util';

type G = Generated;
const vi = (g: G, promptVi: string, explanationVi?: string): G => ({ ...g, promptVi, explanationVi });

/** Superscript exponents: sup(100) = "¹⁰⁰". */
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = (n: number) => String(n).split('').map((c) => SUP[+c]).join('');
const pw = (a: number, n: number) => `${a}${sup(n)}`;

/** A numeric question in both languages; the answer and distractors use a proper minus sign. */
function q(r: () => number, en: string, viText: string, answer: number, mistakes: number[], expl: string, explVi: string): G {
  return vi({ prompt: en, ...numeric(answer, mistakes.filter((m) => Number.isInteger(m)), r, num), explanation: expl }, viText, explVi);
}

/** A question whose answer is a fraction n/d (shown in lowest terms); mistakes are [n, d] pairs. */
function qf(r: () => number, en: string, viText: string, [n, d]: [number, number], mistakes: [number, number][], expl: string, explVi: string): G {
  const answer = fracN(n, d);
  const out = new Set<string>();
  for (const [a, b] of mistakes) if (b !== 0 && Number.isFinite(a / b) && fracN(a, b) !== answer) out.add(fracN(a, b));
  for (let k = 1; out.size < 3; k++) {
    const s = fracN(n + (r() < 0.5 ? -k : k), d);
    if (s !== answer) out.add(s);
  }
  return vi({ prompt: en, answer, distractors: [...out].slice(0, 3), explanation: expl }, viText, explVi);
}

/** A question whose options are strings (solution sets, intervals…). */
function qs(en: string, viText: string, answer: string, wrong: string[], expl: string, explVi: string): G {
  return vi({ prompt: en, answer, distractors: [...new Set(wrong.filter((w) => w !== answer))].slice(0, 3), explanation: expl }, viText, explVi);
}

const modpow = (a: number, n: number, m: number) => {
  let res = 1 % m, b = a % m;
  for (let e = n; e > 0; e = Math.floor(e / 2)) {
    if (e % 2) res = (res * b) % m;
    b = (b * b) % m;
  }
  return res;
};
/** The smallest k ≥ 1 with a^k ≡ 1 (mod m); a and m coprime. */
const order = (a: number, m: number) => {
  let k = 1;
  for (let v = a % m; v !== 1; v = (v * a) % m) k++;
  return k;
};
const isPrime = (n: number) => {
  if (n < 2) return false;
  for (let p = 2; p * p <= n; p++) if (n % p === 0) return false;
  return true;
};
const divisors = (n: number) => {
  const out: number[] = [];
  for (let k = 1; k <= n; k++) if (n % k === 0) out.push(k);
  return out;
};

// ── Number theory: divisibility, remainders, divisors, primes ─────────
const numberTheory: Generator = (d, r) => {
  if (d <= 1) {
    const last = pick(r, [2, 3, 4, 7, 8, 9]);
    const a = last + 10 * int(r, 0, 3), n = int(r, 21, 99);
    const cyc = [1, 2, 3, 4].map((k) => modpow(last, k, 10));
    const s = n % 4 || 4;
    const ans = cyc[s - 1];
    const cycS = cyc.join(', ');
    return q(
      r,
      `What is the last digit of ${pw(a, n)}?`,
      `Chữ số tận cùng của ${pw(a, n)} là chữ số nào?`,
      ans,
      [n % 4 === 0 ? 1 : cyc[s % 4], (last * n) % 10, cyc[(s + 2) % 4], last, (ans + 2) % 10, (ans + 5) % 10, (ans + 7) % 10],
      `Only the last digit ${last} matters. Its powers end in ${cycS}, ${cycS}, … (the pattern repeats every 4 powers). ${n} = 4·${Math.floor((n - 1) / 4)} + ${s}, so the last digit is the ${s}${['st', 'nd', 'rd', 'th'][s - 1]} in the cycle: ${ans}.`,
      `Chỉ chữ số tận cùng ${last} quyết định. Các lũy thừa của ${last} tận cùng lần lượt là ${cycS}, ${cycS}, … (lặp lại sau mỗi 4 lũy thừa). ${n} = 4·${Math.floor((n - 1) / 4)} + ${s} nên chữ số tận cùng là số thứ ${s} trong chu kì: ${ans}.`,
    );
  }
  if (d === 2) {
    const m = pick(r, [7, 9, 11, 13]);
    let a = int(r, 2, 6);
    while (gcd(a, m) !== 1) a++;
    const n = int(r, 30, 150), k = order(a, m), s = n % k, ans = modpow(a, n, m);
    return q(
      r,
      `Find the remainder when ${pw(a, n)} is divided by ${m}.`,
      `Tìm số dư khi chia ${pw(a, n)} cho ${m}.`,
      ans,
      [n % m, modpow(a, n % m, m), (a * n) % m, modpow(a, s + 1, m), m - ans, (ans + 2) % m, (ans + m - 2) % m],
      `Find the first power of ${a} that leaves remainder 1: ${pw(a, k)} ≡ 1 (mod ${m}). ${n} = ${k}·${Math.floor(n / k)} + ${s}, so ${pw(a, n)} = (${pw(a, k)})${sup(Math.floor(n / k))}·${pw(a, s)} ≡ ${pw(a, s)} ≡ ${ans} (mod ${m}).`,
      `Tìm lũy thừa đầu tiên của ${a} chia ${m} dư 1: ${pw(a, k)} ≡ 1 (mod ${m}). ${n} = ${k}·${Math.floor(n / k)} + ${s} nên ${pw(a, n)} = (${pw(a, k)})${sup(Math.floor(n / k))}·${pw(a, s)} ≡ ${pw(a, s)} ≡ ${ans} (mod ${m}).`,
    );
  }
  if (d === 3) {
    if (r() < 0.6) {
      let N = 0, fs: [number, number][] = [];
      do {
        fs = [];
        for (const p of [2, 3, 5, 7]) {
          const e = r() < 0.75 ? int(r, p <= 3 ? 1 : 1, p === 2 ? 5 : p === 3 ? 3 : 2) : 0;
          if (e) fs.push([p, e]);
        }
        N = fs.reduce((x, [p, e]) => x * p ** e, 1);
      } while (fs.length < 2 || N < 60 || N > 3000);
      const ans = fs.reduce((x, [, e]) => x * (e + 1), 1);
      const fact = fs.map(([p, e]) => (e === 1 ? `${p}` : pw(p, e))).join('·');
      const how = fs.map(([, e]) => `(${e} + 1)`).join('');
      return q(
        r,
        `How many positive divisors does ${N} have?`,
        `Số ${N} có bao nhiêu ước nguyên dương?`,
        ans,
        [fs.reduce((x, [, e]) => x * e, 1), fs.reduce((x, [, e]) => x + e, 0) + 1, ans - 2, fs.reduce((x, [, e]) => x + e + 1, 0)],
        `${N} = ${fact}. A divisor picks each exponent from 0 up to the one in N, so there are ${how} = ${ans} divisors.`,
        `${N} = ${fact}. Mỗi ước chọn số mũ của từng thừa số nguyên tố từ 0 đến số mũ trong ${N}, nên có ${how} = ${ans} ước.`,
      );
    }
    const g = int(r, 2, 12);
    let u = int(r, 1, 9), v = int(r, 2, 11);
    while (u === v || gcd(u, v) !== 1) v++;
    const A = g * u, B = g * v, L = g * u * v;
    return q(
      r,
      `For positive integers a, b: gcd(a, b) = ${g} and lcm(a, b) = ${L}. If a = ${A}, what is b?`,
      `Hai số nguyên dương a, b có ƯCLN(a, b) = ${g} và BCNN(a, b) = ${L}. Nếu a = ${A} thì b bằng bao nhiêu?`,
      B,
      [L / A, L / g, L - A, L],
      `Always gcd(a, b)·lcm(a, b) = a·b. So b = ${g}·${L} : ${A} = ${B}.`,
      `Luôn có ƯCLN(a, b)·BCNN(a, b) = a·b. Do đó b = ${g}·${L} : ${A} = ${B}.`,
    );
  }
  if (d === 4) {
    const kind = pick(r, ['count', 'always', 'prime'] as const);
    if (kind === 'count') {
      let m = 0, c = 0, R: number[] = [];
      do {
        m = pick(r, [5, 7, 8, 9, 10, 12, 13]);
        c = int(r, 1, m - 1);
        R = [...Array(m).keys()].filter((x) => (x * x + c) % m === 0);
      } while (!R.length);
      const t = int(r, 5, 15), N = m * t + int(r, 1, m - 1);
      let ans = 0;
      for (let n = 1; n <= N; n++) if ((n * n + c) % m === 0) ans++;
      const Rs = R.join(', ');
      return q(
        r,
        `How many integers n with 1 ≤ n ≤ ${N} make n² + ${c} divisible by ${m}?`,
        `Có bao nhiêu số nguyên n với 1 ≤ n ≤ ${N} sao cho n² + ${c} chia hết cho ${m}?`,
        ans,
        [t * R.length, (t + 1) * R.length, Math.floor(N / m), ans + 1],
        `Only the remainder of n mod ${m} matters. Trying 0, 1, …, ${m - 1}: n² + ${c} ≡ 0 (mod ${m}) exactly when n ≡ ${Rs}. Count such n up to ${N} = ${m}·${t} + ${N - m * t}: ${ans}.`,
        `Chỉ cần xét số dư của n khi chia cho ${m}. Thử 0, 1, …, ${m - 1}: n² + ${c} chia hết cho ${m} khi và chỉ khi n chia ${m} dư ${Rs}. Đếm các số như vậy đến ${N} = ${m}·${t} + ${N - m * t}: có ${ans} số.`,
      );
    }
    if (kind === 'always') {
      const [e, v, why, whyVi] = pick(r, [
        ['n³ − n', 6, 'n³ − n = (n − 1)n(n + 1) is a product of three consecutive integers: divisible by 2 and by 3.', 'n³ − n = (n − 1)n(n + 1) là tích ba số nguyên liên tiếp nên chia hết cho 2 và 3.'],
        ['n³ + 5n', 6, 'n³ + 5n = (n³ − n) + 6n, and n³ − n = (n − 1)n(n + 1) is divisible by 6.', 'n³ + 5n = (n³ − n) + 6n, mà n³ − n = (n − 1)n(n + 1) chia hết cho 6.'],
        ['n⁵ − n', 30, 'n⁵ − n = (n − 1)n(n + 1)(n² + 1): divisible by 6, and checking n mod 5 shows it is divisible by 5. n = 2 gives 30.', 'n⁵ − n = (n − 1)n(n + 1)(n² + 1) chia hết cho 6, xét số dư của n khi chia cho 5 thấy nó chia hết cho 5. Với n = 2 được 30.'],
        ['n(n + 1)(n + 2)(n + 3)', 24, 'Four consecutive integers contain a multiple of 3 and two consecutive even numbers (one a multiple of 4). n = 1 gives 24.', 'Bốn số nguyên liên tiếp có một số chia hết cho 3 và hai số chẵn liên tiếp (một số chia hết cho 4). Với n = 1 được 24.'],
        ['n⁴ − n²', 12, 'n⁴ − n² = n²(n − 1)(n + 1): divisible by 3, and by 4 (n even: n² is; n odd: (n − 1)(n + 1) is). n = 2 gives 12.', 'n⁴ − n² = n²(n − 1)(n + 1) chia hết cho 3 và cho 4 (n chẵn thì n² chia hết cho 4; n lẻ thì (n − 1)(n + 1) chia hết cho 8). Với n = 2 được 12.'],
        ['(2n + 1)² − 1', 8, '(2n + 1)² − 1 = 4n(n + 1), and n(n + 1) is even. n = 1 gives 8.', '(2n + 1)² − 1 = 4n(n + 1), mà n(n + 1) chẵn. Với n = 1 được 8.'],
        ['n⁴ + 2n³ − n² − 2n', 24, 'n⁴ + 2n³ − n² − 2n = (n − 1)n(n + 1)(n + 2): four consecutive integers, so divisible by 24. n = 2 gives 24.', 'n⁴ + 2n³ − n² − 2n = (n − 1)n(n + 1)(n + 2) là tích bốn số nguyên liên tiếp nên chia hết cho 24. Với n = 2 được 24.'],
      ] as const);
      return q(
        r,
        `What is the largest integer that divides ${e} for every integer n?`,
        `Số nguyên lớn nhất luôn là ước của ${e} với mọi số nguyên n là bao nhiêu?`,
        v,
        [v / 2, 2 * v, v === 6 ? 3 : 6, v / 3],
        why,
        whyVi,
      );
    }
    let a = 0, b = 0;
    do {
      a = 2 * int(r, 1, 15);
      b = 2 * int(r, 1, 18);
    } while (a >= b || a % 3 === 0 || b % 3 === 0 || a % 3 === b % 3 || !isPrime(3 + a) || !isPrime(3 + b));
    return q(
      r,
      `Find the prime p such that p + ${a} and p + ${b} are also prime.`,
      `Tìm số nguyên tố p sao cho p + ${a} và p + ${b} cũng là số nguyên tố.`,
      3,
      [2, 5, 7, 1],
      `p = 2 fails (p + ${a} is even). If p > 3, then p, p + ${a}, p + ${b} leave three different remainders mod 3 (${a} ≡ ${a % 3}, ${b} ≡ ${b % 3}), so one of them is a multiple of 3 bigger than 3 — not prime. So p = 3, and indeed ${3 + a} and ${3 + b} are prime.`,
      `p = 2 không thỏa mãn (p + ${a} chẵn). Nếu p > 3 thì p, p + ${a}, p + ${b} có ba số dư khác nhau khi chia cho 3 (${a} chia 3 dư ${a % 3}, ${b} chia 3 dư ${b % 3}), nên có một số chia hết cho 3 và lớn hơn 3 — không nguyên tố. Vậy p = 3, và đúng là ${3 + a}, ${3 + b} là số nguyên tố.`,
    );
  }
  if (r() < 0.5) {
    const a = pick(r, [2, 3, 5, 10]);
    let m = 0;
    do m = pick(r, [7, 9, 11, 13, 17, 19, 23, 27, 29, 31, 37, 41]);
    while (gcd(a, m) !== 1);
    const k = order(a, m);
    const seq = [...Array(Math.min(k, 8)).keys()].map((i) => modpow(a, i + 1, m)).join(', ');
    const phi = [...Array(m).keys()].filter((x) => x > 0 && gcd(x, m) === 1).length;
    return q(
      r,
      `What is the smallest positive integer n such that ${a}ⁿ − 1 is divisible by ${m}?`,
      `Tìm số nguyên dương n nhỏ nhất sao cho ${a}ⁿ − 1 chia hết cho ${m}.`,
      k,
      [m - 1, phi, Math.floor((m - 1) / 2), k + 1, 2 * k],
      `List the remainders of ${a}¹, ${a}², ${a}³, … mod ${m}: ${seq}${k > 8 ? ', …' : ''}. The first remainder 1 appears at n = ${k}. (Fermat only tells you ${a}${sup(phi)} ≡ 1; the first time can be earlier.)`,
      `Lập số dư của ${a}¹, ${a}², ${a}³, … khi chia cho ${m}: ${seq}${k > 8 ? ', …' : ''}. Số dư 1 xuất hiện lần đầu khi n = ${k}. (Định lí Fermat chỉ cho ${a}${sup(phi)} ≡ 1; lần đầu có thể sớm hơn.)`,
    );
  }
  const m = pick(r, [7, 9, 11, 13]);
  let a = int(r, 2, 6), b = int(r, 2, 8);
  while (gcd(a, m) !== 1) a++;
  while (gcd(b, m) !== 1 || b === a) b++;
  const n = int(r, 20, 99), k = int(r, 20, 99);
  const x = modpow(a, n, m), y = modpow(b, k, m), ans = (x + y) % m;
  return q(
    r,
    `Find the remainder when ${pw(a, n)} + ${pw(b, k)} is divided by ${m}.`,
    `Tìm số dư khi chia ${pw(a, n)} + ${pw(b, k)} cho ${m}.`,
    ans,
    [x + y, (modpow(a, n % m, m) + modpow(b, k % m, m)) % m, (n + k) % m, (x * y) % m, (ans + 3) % m, (ans + m - 1) % m],
    `${pw(a, order(a, m))} ≡ 1 and ${pw(b, order(b, m))} ≡ 1 (mod ${m}), so ${pw(a, n)} ≡ ${pw(a, n % order(a, m))} ≡ ${x} and ${pw(b, k)} ≡ ${pw(b, k % order(b, m))} ≡ ${y}. The sum leaves ${x} + ${y}${x + y >= m ? ` − ${m}` : ''} = ${ans}.`,
    `${pw(a, order(a, m))} ≡ 1 và ${pw(b, order(b, m))} ≡ 1 (mod ${m}), nên ${pw(a, n)} chia ${m} dư ${x}, ${pw(b, k)} chia ${m} dư ${y}. Tổng chia ${m} dư ${x} + ${y}${x + y >= m ? ` − ${m}` : ''} = ${ans}.`,
  );
};

// ── Diophantine equations: factoring tricks, perfect squares, counting solutions ──
const tau = (n: number) => divisors(Math.abs(n)).length;
const isSquare = (n: number) => n >= 0 && Math.round(Math.sqrt(n)) ** 2 === n;
const RICH = [12, 18, 20, 24, 28, 30, 36, 40, 42, 45, 48, 50, 54, 56, 60, 63, 72, 80, 84, 90, 96];

const diophantine: Generator = (d, r) => {
  const PAIRS = 'How many ordered pairs of positive integers (x, y) satisfy';
  const PAIRS_VI = 'Có bao nhiêu cặp số nguyên dương (x; y) thỏa mãn';
  if (d <= 1) {
    const M = pick(r, RICH), N = M - 1, t = tau(M);
    return q(
      r,
      `${PAIRS} xy + x + y = ${N}?`,
      `${PAIRS_VI} xy + x + y = ${N}?`,
      t - 2,
      [t, t - 1, Math.ceil((t - 2) / 2), 2 * t],
      `Add 1 to both sides: xy + x + y + 1 = (x + 1)(y + 1) = ${M}. Both factors are at least 2, so x + 1 can be any divisor of ${M} except 1 and ${M}: ${t} − 2 = ${t - 2} pairs.`,
      `Cộng 1 vào hai vế: xy + x + y + 1 = (x + 1)(y + 1) = ${M}. Hai thừa số đều lớn hơn hoặc bằng 2, nên x + 1 là một ước bất kì của ${M} trừ 1 và ${M}: có ${t} − 2 = ${t - 2} cặp.`,
    );
  }
  if (d === 2) {
    if (r() < 0.5) {
      let a = 0, b = 0;
      do {
        a = int(r, 2, 9);
        b = int(r, 2, 9);
      } while (a === b || gcd(a, b) !== 1);
      let N = 0, sols: number[][] = [];
      do {
        N = int(r, 40, 130);
        sols = [];
        for (let x = 1; a * x < N; x++) if ((N - a * x) % b === 0) sols.push([x, (N - a * x) / b]);
      } while (sols.length < 2);
      const [x0, y0] = sols[0];
      return q(
        r,
        `${PAIRS} ${a}x + ${b}y = ${N}?`,
        `${PAIRS_VI} ${a}x + ${b}y = ${N}?`,
        sols.length,
        [Math.floor(N / (a * b)), sols.length + 1, sols.length - 1, Math.floor(N / a)],
        `One solution is x = ${x0}, y = ${y0}. The others come from x = ${x0} + ${b}t, y = ${y0} − ${a}t (t ≥ 0), as long as y stays positive: ${sols.length} pairs.`,
        `Một nghiệm là x = ${x0}, y = ${y0}. Các nghiệm khác là x = ${x0} + ${b}t, y = ${y0} − ${a}t (t ≥ 0), miễn là y còn dương: có ${sols.length} cặp.`,
      );
    }
    let p = 0, qq = 0, M = 0, cnt = 0;
    do {
      p = int(r, 1, 5);
      qq = int(r, 1, 5);
      M = pick(r, RICH);
      cnt = divisors(M).filter((u) => u > qq && M / u > p).length;
    } while (M - p * qq <= 0 || cnt < 1 || p === qq);
    const c = M - p * qq;
    const e = `${terms([[1, 'xy'], [p, 'x'], [qq, 'y']])} = ${c}`;
    return q(
      r,
      `${PAIRS} ${e}?`,
      `${PAIRS_VI} ${e}?`,
      cnt,
      [tau(M), tau(M) - 2, divisors(M).filter((u) => u > qq).length, cnt + 1],
      `Factor: (x + ${qq})(y + ${p}) = ${c} + ${p * qq} = ${M}. Now x + ${qq} must be a divisor of ${M} bigger than ${qq}, with ${M}/(x + ${qq}) bigger than ${p}: ${cnt} pair${cnt === 1 ? '' : 's'}.`,
      `Phân tích: (x + ${qq})(y + ${p}) = ${c} + ${p * qq} = ${M}. Khi đó x + ${qq} là ước của ${M} lớn hơn ${qq}, và ${M}/(x + ${qq}) lớn hơn ${p}: có ${cnt} cặp.`,
    );
  }
  if (d === 3) {
    let p = 0, qq = 0, M = 0;
    do {
      p = nz(r, -5, 5);
      qq = nz(r, -5, 5);
      M = pick(r, RICH.slice(0, 12)) * pick(r, [1, -1]);
    } while (p === qq);
    const c = M - p * qq, t = tau(M);
    const e = `${terms([[1, 'xy'], [p, 'x'], [qq, 'y']])} = ${num(c)}`;
    return q(
      r,
      `How many ordered pairs of integers (x, y) satisfy ${e}?`,
      `Có bao nhiêu cặp số nguyên (x; y) thỏa mãn ${e}?`,
      2 * t,
      [t, 2 * t - 2, t - 2, 4 * t],
      `Factor: (x ${signed(qq)})(y ${signed(p)}) = ${num(c)} ${signed(p * qq)} = ${num(M)}. x ${signed(qq)} can be any divisor of ${num(M)}, positive or negative: 2·${t} = ${2 * t} pairs.`,
      `Phân tích: (x ${signed(qq)})(y ${signed(p)}) = ${num(c)} ${signed(p * qq)} = ${num(M)}. x ${signed(qq)} là một ước bất kì (dương hoặc âm) của ${num(M)}: có 2·${t} = ${2 * t} cặp.`,
    );
  }
  if (d === 4) {
    if (r() < 0.5) {
      let k = 0, ns: number[] = [];
      do {
        k = int(r, 12, 150);
        ns = [];
        for (let n = 0; n <= k; n++) if (isSquare(n * n + k)) ns.push(n);
      } while (k % 4 === 2 || ns.length < 2);
      const ans = ns.reduce((x, n) => x + (n === 0 ? 1 : 2), 0);
      const list = ns.map((n) => (n === 0 ? '0' : `±${n}`)).join(', ');
      return q(
        r,
        `How many integers n make n² + ${k} a perfect square?`,
        `Có bao nhiêu số nguyên n để n² + ${k} là số chính phương?`,
        ans,
        [ns.length, tau(k), Math.floor(tau(k) / 2), ans + 2],
        `Write n² + ${k} = m² (m ≥ 0): (m − |n|)(m + |n|) = ${k}. The two factors have the same parity; each such factor pair gives |n| = (big − small)/2. So n = ${list}: ${ans} integers (count negative n too).`,
        `Đặt n² + ${k} = m² (m ≥ 0): (m − |n|)(m + |n|) = ${k}. Hai thừa số cùng tính chẵn lẻ; mỗi cặp như vậy cho |n| = (lớn − nhỏ)/2. Vậy n = ${list}: có ${ans} số nguyên (nhớ đếm cả n âm).`,
      );
    }
    let N = 0, sols: number[][] = [];
    do {
      N = int(r, 30, 240);
      sols = [];
      for (let y = 1; 2 * y + 1 <= N; y++) if (isSquare(N + y * y)) sols.push([Math.round(Math.sqrt(N + y * y)), y]);
    } while (N % 4 === 2 || sols.length < 2);
    const pairs = sols.map(([x, y]) => `(${x}, ${y})`).join(', ');
    return q(
      r,
      `${PAIRS} x² − y² = ${N}?`,
      `${PAIRS_VI} x² − y² = ${N}?`,
      sols.length,
      [Math.floor(tau(N) / 2), sols.length + 1, tau(N), Math.ceil(tau(N) / 2)],
      `(x − y)(x + y) = ${N} with 0 < x − y < x + y and both factors of the same parity (their sum 2x is even). That gives ${pairs}: ${sols.length} pairs.`,
      `(x − y)(x + y) = ${N} với 0 < x − y < x + y và hai thừa số cùng tính chẵn lẻ (tổng của chúng là 2x chẵn). Ta được ${pairs.replace(/, (?=\d)/g, '; ')}: có ${sols.length} cặp.`,
    );
  }
  const n = int(r, 2, 12), t = tau(n * n);
  if (r() < 0.5)
    return q(
      r,
      `${PAIRS} 1/x + 1/y = 1/${n}?`,
      `${PAIRS_VI} 1/x + 1/y = 1/${n}?`,
      t,
      [tau(n), (t + 1) / 2, t - 1, 2 * t],
      `Clear denominators: ${n}y + ${n}x = xy, so (x − ${n})(y − ${n}) = ${n * n}. Here x, y > ${n}, so x − ${n} is any positive divisor of ${n * n}: ${t} pairs.`,
      `Quy đồng: ${n}y + ${n}x = xy, nên (x − ${n})(y − ${n}) = ${n * n}. Vì x, y > ${n} nên x − ${n} là một ước dương bất kì của ${n * n}: có ${t} cặp.`,
    );
  return q(
    r,
    `How many ordered pairs of non-zero integers (x, y) satisfy 1/x + 1/y = 1/${n}?`,
    `Có bao nhiêu cặp số nguyên khác 0 (x; y) thỏa mãn 1/x + 1/y = 1/${n}?`,
    2 * t - 1,
    [2 * t, t, 2 * t - 2, t - 1],
    `(x − ${n})(y − ${n}) = ${n * n}, and x − ${n} can be any of the 2·${t} divisors of ${n * n}, positive or negative — except −${n}, which gives x = 0. So 2·${t} − 1 = ${2 * t - 1} pairs.`,
    `(x − ${n})(y − ${n}) = ${n * n}, x − ${n} là một trong 2·${t} ước (dương hoặc âm) của ${n * n} — trừ ước −${n} vì khi đó x = 0. Vậy có 2·${t} − 1 = ${2 * t - 1} cặp.`,
  );
};

// ── Identities: values from conditions, symmetric expressions ─────────
const identities: Generator = (d, r) => {
  const ab = () => {
    let S = 0, P = 0;
    do {
      S = nz(r, -9, 9);
      P = nz(r, -12, 12);
    } while (S * S < 4 * P);
    return [S, P];
  };
  const given = (S: number, P: number) => [`Real numbers a, b satisfy a + b = ${num(S)} and ab = ${num(P)}.`, `Cho các số thực a, b thỏa mãn a + b = ${num(S)} và ab = ${num(P)}.`];
  const p = (n: number) => (n < 0 ? `(${num(n)})` : String(n));
  if (d <= 1) {
    const kind = pick(r, ['cube', 'cubeDiff', 'eval'] as const);
    if (kind === 'cube') {
      const [S, P] = ab();
      const [en, viG] = given(S, P);
      const ans = S ** 3 - 3 * P * S;
      return q(r, `${en} Find a³ + b³.`, `${viG} Tính a³ + b³.`, ans, [S ** 3 - 3 * P, S ** 3, S ** 3 + 3 * P * S, S ** 3 - P * S],
        `a³ + b³ = (a + b)³ − 3ab(a + b) = ${p(S)}³ − 3·${p(P)}·${p(S)} = ${num(ans)}.`, `a³ + b³ = (a + b)³ − 3ab(a + b) = ${p(S)}³ − 3·${p(P)}·${p(S)} = ${num(ans)}.`);
    }
    if (kind === 'cubeDiff') {
      let D = 0, P = 0;
      do {
        D = int(r, 1, 7);
        P = nz(r, -6, 12);
      } while (D * D + 4 * P < 0);
      const ans = D ** 3 + 3 * P * D;
      return q(
        r,
        `Real numbers a, b satisfy a − b = ${D} and ab = ${num(P)}. Find a³ − b³.`,
        `Cho các số thực a, b thỏa mãn a − b = ${D} và ab = ${num(P)}. Tính a³ − b³.`,
        ans,
        [D ** 3 - 3 * P * D, D ** 3 + 3 * P, D ** 3, D ** 3 + P * D],
        `a³ − b³ = (a − b)³ + 3ab(a − b) = ${D}³ + 3·${p(P)}·${D} = ${num(ans)}.`,
        `a³ − b³ = (a − b)³ + 3ab(a − b) = ${D}³ + 3·${p(P)}·${D} = ${num(ans)}.`,
      );
    }
    const k = pick(r, [10, 20, 30, 50, 100]), c = nz(r, -9, 9), x = k + 1, ans = k ** 3 + 1 + c;
    const e = `x³ − 3x² + 3x ${signed(c)}`;
    return q(
      r,
      `Evaluate ${e} at x = ${x}.`,
      `Tính giá trị của biểu thức ${e} tại x = ${x}.`,
      ans,
      [k ** 3 + c, k ** 3 - 1 + c, x ** 3 + c, k ** 3 + c - 2],
      `x³ − 3x² + 3x − 1 = (x − 1)³, so the expression is (x − 1)³ + 1 ${signed(c)} = ${k}³ ${signed(1 + c)} = ${ans}.`,
      `x³ − 3x² + 3x − 1 = (x − 1)³, nên biểu thức bằng (x − 1)³ + 1 ${signed(c)} = ${k}³ ${signed(1 + c)} = ${ans}.`,
    );
  }
  if (d === 2) {
    const t = pick(r, [3, 4, 5, 6, -3, -4, -5]);
    const kind = pick(r, ['cube', 'minus', 'quad'] as const);
    if (kind === 'cube') {
      const ans = t ** 3 - 3 * t;
      return q(r, `A real number x satisfies x + 1/x = ${num(t)}. Find x³ + 1/x³.`, `Số thực x thỏa mãn x + 1/x = ${num(t)}. Tính x³ + 1/x³.`, ans, [t ** 3, t ** 3 - 3, t ** 3 + 3 * t, t ** 3 - t],
        `Cube both sides: x³ + 1/x³ + 3(x + 1/x) = ${p(t)}³, so x³ + 1/x³ = ${p(t)}³ − 3·${p(t)} = ${num(ans)}.`,
        `Lập phương hai vế: x³ + 1/x³ + 3(x + 1/x) = ${p(t)}³, nên x³ + 1/x³ = ${p(t)}³ − 3·${p(t)} = ${num(ans)}.`);
    }
    if (kind === 'minus') {
      const u = pick(r, [1, 2, 3, 4, 5, -2, -3]);
      return q(r, `A real number x satisfies x − 1/x = ${num(u)}. Find x² + 1/x².`, `Số thực x thỏa mãn x − 1/x = ${num(u)}. Tính x² + 1/x².`, u * u + 2, [u * u - 2, u * u, u * u + 1, 2 * u + 2],
        `Square both sides: x² − 2 + 1/x² = ${u * u}, so x² + 1/x² = ${u * u} + 2 = ${u * u + 2}. (The middle term of (x − 1/x)² is −2·x·(1/x) = −2.)`,
        `Bình phương hai vế: x² − 2 + 1/x² = ${u * u}, nên x² + 1/x² = ${u * u} + 2 = ${u * u + 2}. (Hạng tử giữa của (x − 1/x)² là −2·x·(1/x) = −2.)`);
    }
    const e = `${poly([1, -t, 1])} = 0`;
    return q(r, `A real number x satisfies ${e}. Find x² + 1/x².`, `Số thực x thỏa mãn ${e}. Tính x² + 1/x².`, t * t - 2, [t * t + 2, t * t, t * t - 1, 2 - t],
      `x ≠ 0, so divide by x: x + 1/x = ${num(t)}. Then x² + 1/x² = (x + 1/x)² − 2 = ${t * t} − 2 = ${t * t - 2}.`,
      `x ≠ 0 nên chia hai vế cho x: x + 1/x = ${num(t)}. Khi đó x² + 1/x² = (x + 1/x)² − 2 = ${t * t} − 2 = ${t * t - 2}.`);
  }
  if (d === 3 || (d === 5 && r() < 0.4)) {
    const kind = d === 5 ? 'five' : pick(r, ['four', 'zero', 'ab4'] as const);
    const t = pick(r, [3, 4, 5, -3, -4]), t2 = t * t - 2, t3 = t ** 3 - 3 * t;
    if (kind === 'four')
      return q(r, `A real number x satisfies x + 1/x = ${num(t)}. Find x⁴ + 1/x⁴.`, `Số thực x thỏa mãn x + 1/x = ${num(t)}. Tính x⁴ + 1/x⁴.`, t2 * t2 - 2, [t ** 4 - 2, t2 * t2, t ** 4 - 4, t2 * t2 + 2],
        `x² + 1/x² = ${t * t} − 2 = ${t2}, then square again: x⁴ + 1/x⁴ = ${t2}² − 2 = ${t2 * t2 - 2}.`,
        `x² + 1/x² = ${t * t} − 2 = ${t2}, bình phương tiếp: x⁴ + 1/x⁴ = ${t2}² − 2 = ${t2 * t2 - 2}.`);
    if (kind === 'five') {
      const ans = t2 * t3 - t;
      return q(r, `A real number x satisfies x + 1/x = ${num(t)}. Find x⁵ + 1/x⁵.`, `Số thực x thỏa mãn x + 1/x = ${num(t)}. Tính x⁵ + 1/x⁵.`, ans, [t2 * t3, t2 * t3 + t, t ** 5 - 5 * t, t ** 5],
        `x² + 1/x² = ${t2}, x³ + 1/x³ = ${num(t3)}. Multiply: (x² + 1/x²)(x³ + 1/x³) = x⁵ + 1/x⁵ + x + 1/x, so x⁵ + 1/x⁵ = ${t2}·${p(t3)} − ${p(t)} = ${num(ans)}.`,
        `x² + 1/x² = ${t2}, x³ + 1/x³ = ${num(t3)}. Nhân lại: (x² + 1/x²)(x³ + 1/x³) = x⁵ + 1/x⁵ + x + 1/x, nên x⁵ + 1/x⁵ = ${t2}·${p(t3)} − ${p(t)} = ${num(ans)}.`);
    }
    if (kind === 'zero') {
      const k = nz(r, -20, 20);
      return q(r, `Real numbers a, b, c satisfy a + b + c = 0 and abc = ${num(k)}. Find a³ + b³ + c³.`, `Cho các số thực a, b, c thỏa mãn a + b + c = 0 và abc = ${num(k)}. Tính a³ + b³ + c³.`, 3 * k, [0, k, -3 * k, 9 * k],
        `a³ + b³ + c³ − 3abc = (a + b + c)(a² + b² + c² − ab − bc − ca) = 0, so a³ + b³ + c³ = 3abc = ${num(3 * k)}.`,
        `a³ + b³ + c³ − 3abc = (a + b + c)(a² + b² + c² − ab − bc − ca) = 0, nên a³ + b³ + c³ = 3abc = ${num(3 * k)}.`);
    }
    const [S, P] = ab();
    const [en, viG] = given(S, P);
    const s2 = S * S - 2 * P, ans = s2 * s2 - 2 * P * P;
    return q(r, `${en} Find a⁴ + b⁴.`, `${viG} Tính a⁴ + b⁴.`, ans, [s2 * s2, s2 * s2 - 2 * P, S ** 4 - 2 * P * P, s2 * s2 + 2 * P * P],
      `a² + b² = ${p(S)}² − 2·${p(P)} = ${s2}, and a⁴ + b⁴ = (a² + b²)² − 2(ab)² = ${s2}² − 2·${p(P)}² = ${num(ans)}.`,
      `a² + b² = ${p(S)}² − 2·${p(P)} = ${s2}, và a⁴ + b⁴ = (a² + b²)² − 2(ab)² = ${s2}² − 2·${p(P)}² = ${num(ans)}.`);
  }
  // d4–5: three variables
  let a = 0, b = 0, c = 0;
  do {
    a = nz(r, -6, 7);
    b = nz(r, -6, 7);
    c = nz(r, -6, 7);
  } while (a + b + c === 0 || a * b + b * c + c * a === 0);
  const S = a + b + c, Q = a * b + b * c + c * a, R = a * b * c;
  const kind = d === 4 ? pick(r, ['pairs', 'recip'] as const) : 'cube';
  if (kind === 'pairs') {
    const T = a * a + b * b + c * c;
    return q(
      r,
      `Real numbers a, b, c satisfy a + b + c = ${num(S)} and a² + b² + c² = ${T}. Find ab + bc + ca.`,
      `Cho các số thực a, b, c thỏa mãn a + b + c = ${num(S)} và a² + b² + c² = ${T}. Tính ab + bc + ca.`,
      Q,
      [S * S - T, T - S * S, (T - S * S) / 2, (S * S + T) / 2],
      `(a + b + c)² = a² + b² + c² + 2(ab + bc + ca), so ab + bc + ca = (${p(S)}² − ${T})/2 = ${num(Q)}.`,
      `(a + b + c)² = a² + b² + c² + 2(ab + bc + ca), nên ab + bc + ca = (${p(S)}² − ${T})/2 = ${num(Q)}.`,
    );
  }
  const given3 = `a + b + c = ${num(S)}, ab + bc + ca = ${num(Q)} and abc = ${num(R)}`;
  const given3Vi = `a + b + c = ${num(S)}, ab + bc + ca = ${num(Q)} và abc = ${num(R)}`;
  if (kind === 'recip')
    return qf(
      r,
      `Real numbers a, b, c satisfy ${given3}. Find 1/a + 1/b + 1/c.`,
      `Cho các số thực a, b, c thỏa mãn ${given3Vi}. Tính 1/a + 1/b + 1/c.`,
      [Q, R],
      [[R, Q], [S, R], [-Q, R], [1, S]],
      `1/a + 1/b + 1/c = (bc + ca + ab)/(abc) = ${num(Q)}/${p(R)}${`${num(Q)}/${num(R)}` === fracN(Q, R) ? '' : ` = ${fracN(Q, R)}`}.`,
      `1/a + 1/b + 1/c = (bc + ca + ab)/(abc) = ${num(Q)}/${p(R)}${`${num(Q)}/${num(R)}` === fracN(Q, R) ? '' : ` = ${fracN(Q, R)}`}.`,
    );
  const ans = S ** 3 - 3 * S * Q + 3 * R;
  return q(
    r,
    `Real numbers a, b, c satisfy ${given3}. Find a³ + b³ + c³.`,
    `Cho các số thực a, b, c thỏa mãn ${given3Vi}. Tính a³ + b³ + c³.`,
    ans,
    [S ** 3 - 3 * S * Q, 3 * R, S ** 3 - 3 * S * Q - 3 * R, S ** 3 - S * Q + 3 * R],
    `a² + b² + c² = S² − 2Q = ${S * S - 2 * Q}. Then a³ + b³ + c³ − 3abc = (a + b + c)(a² + b² + c² − ab − bc − ca), so a³ + b³ + c³ = ${p(S)}·(${S * S - 2 * Q} − ${p(Q)}) + 3·${p(R)} = ${num(ans)}.`,
    `a² + b² + c² = S² − 2Q = ${S * S - 2 * Q}. Mà a³ + b³ + c³ − 3abc = (a + b + c)(a² + b² + c² − ab − bc − ca), nên a³ + b³ + c³ = ${p(S)}·(${S * S - 2 * Q} − ${p(Q)}) + 3·${p(R)} = ${num(ans)}.`,
  );
};

// ── Inequalities: min/max by completing the square, AM–GM, Cauchy–Schwarz ──
const inequalities: Generator = (d, r) => {
  const MIN = 'Find the minimum value of', MIN_VI = 'Tìm giá trị nhỏ nhất của';
  const sq = (v: string, k: number) => (k === 0 ? `${v}²` : `(${v} ${signed(k)})²`);
  if (d <= 1) {
    const kind = pick(r, ['max', 'scaled', 'scaled', 'argmin'] as const);
    if (kind === 'scaled') {
      const a = int(r, 2, 4), k = nz(r, -4, 4), c = int(r, -5, 25), ans = c - a * k * k;
      const e = poly([a, 2 * a * k, c]);
      return q(r, `${MIN} A = ${e}.`, `${MIN_VI} A = ${e}.`, ans, [c - k * k, c + a * k * k, c, c - a * a * k * k],
        `A = ${a}(x² ${signed(2 * k)}x) ${signed(c)} = ${a}${sq('x', k)} ${signed(ans)} ≥ ${num(ans)}, with equality at x = ${num(-k)}.`,
        `A = ${a}(x² ${signed(2 * k)}x) ${signed(c)} = ${a}${sq('x', k)} ${signed(ans)} ≥ ${num(ans)}, dấu bằng khi x = ${num(-k)}.`);
    }
    const p = nz(r, -6, 6), c = int(r, -10, 20);
    if (kind === 'max') {
      const e = poly([-1, 2 * p, c]), ans = c + p * p;
      return q(r, `Find the maximum value of A = ${e}.`, `Tìm giá trị lớn nhất của A = ${e}.`, ans, [c, c - p * p, p, p * p],
        `A = ${num(ans)} − ${sq('x', -p)} ≤ ${num(ans)}, with equality at x = ${num(p)}.`, `A = ${num(ans)} − ${sq('x', -p)} ≤ ${num(ans)}, dấu bằng xảy ra khi x = ${num(p)}.`);
    }
    const e = poly([1, -2 * p, c]), ans = c - p * p;
    return q(r, `For which value of x does A = ${e} take its smallest value?`, `A = ${e} đạt giá trị nhỏ nhất khi x bằng bao nhiêu?`, p, [-p, 2 * p, ans, -2 * p],
      `A = ${sq('x', -p)} ${signed(ans)} ≥ ${num(ans)}, with equality when x = ${num(p)}.`, `A = ${sq('x', -p)} ${signed(ans)} ≥ ${num(ans)}, dấu bằng xảy ra khi x = ${num(p)}.`);
  }
  if (d === 2) {
    if (r() < 0.5) {
      const a = nz(r, -4, 4), b = nz(r, -4, 4), c = int(r, 0, 30), ans = c - a * a - b * b;
      const e = terms([[1, 'x²'], [1, 'y²'], [2 * a, 'x'], [2 * b, 'y'], [c, '']]);
      return q(r, `${MIN} A = ${e}.`, `${MIN_VI} A = ${e}.`, ans, [c, c - a * a, c + a * a + b * b, c - 4 * a * a - 4 * b * b],
        `A = ${sq('x', a)} + ${sq('y', b)} ${signed(ans)} ≥ ${num(ans)}, with equality at x = ${num(-a)}, y = ${num(-b)}.`,
        `A = ${sq('x', a)} + ${sq('y', b)} ${signed(ans)} ≥ ${num(ans)}, dấu bằng khi x = ${num(-a)}, y = ${num(-b)}.`);
    }
    const b = nz(r, -5, 5), c = int(r, 0, 30), ans = c - b * b;
    const e = terms([[1, 'x²'], [-2, 'xy'], [2, 'y²'], [2 * b, 'y'], [c, '']]);
    return q(r, `${MIN} A = ${e}.`, `${MIN_VI} A = ${e}.`, ans, [c, c - 2 * b * b, c + b * b, c - 4 * b * b],
      `Split 2y² = y² + y²: A = (x − y)² + ${sq('y', b)} ${signed(ans)} ≥ ${num(ans)}, with equality at x = y = ${num(-b)}.`,
      `Tách 2y² = y² + y²: A = (x − y)² + ${sq('y', b)} ${signed(ans)} ≥ ${num(ans)}, dấu bằng khi x = y = ${num(-b)}.`);
  }
  if (d === 3) {
    if (r() < 0.65) {
      const s0 = int(r, 1, 3);
      let p = int(r, 1, 5), qq = int(r, 1, 6);
      if (p === qq) qq++;
      const a = s0 * p * p, b = s0 * qq * qq, ans = 2 * s0 * p * qq;
      const ax = `${a === 1 ? '' : a}x`, e = `${ax} + ${b}/x`;
      const how = `AM–GM: ${a === 1 ? '' : a}x + ${b}/x ≥ 2√(${ax}·${b}/x) = 2√${a * b} = ${ans}, with equality when ${ax} = ${b}/x, i.e. x = ${fracN(qq, p)}.`;
      const howVi = `Bất đẳng thức Cô-si: ${a === 1 ? '' : a}x + ${b}/x ≥ 2√(${ax}·${b}/x) = 2√${a * b} = ${ans}, dấu bằng khi ${ax} = ${b}/x, tức là x = ${fracN(qq, p)}.`;
      if (r() < 0.3)
        return qf(r, `For x > 0, at which x does A = ${e} take its smallest value?`, `Với x > 0, A = ${e} đạt giá trị nhỏ nhất khi x bằng bao nhiêu?`, [qq, p], [[p, qq], [b, a], [qq * qq, p * p], [1, 1]], how, howVi);
      return q(r, `${MIN} A = ${e} for x > 0.`, `${MIN_VI} A = ${e} với x > 0.`, ans, [a + b, ans / 2, 2 * (a + b), Math.round(Math.sqrt(a * b))], how, howVi);
    }
    const k = int(r, 2, 7), h = int(r, 1, 6), ans = 2 * k + h;
    const e = `x + ${k * k}/(x − ${h})`;
    return q(r, `${MIN} A = ${e} for x > ${h}.`, `${MIN_VI} A = ${e} với x > ${h}.`, ans, [2 * k, 2 * k - h, k + h, k * k + h],
      `Write A = (x − ${h}) + ${k * k}/(x − ${h}) + ${h}. By AM–GM the first two terms are ≥ 2√${k * k} = ${2 * k}, so A ≥ ${ans}, with equality at x − ${h} = ${k}, i.e. x = ${h + k}.`,
      `Viết A = (x − ${h}) + ${k * k}/(x − ${h}) + ${h}. Theo Cô-si, tổng hai số hạng đầu ≥ 2√${k * k} = ${2 * k}, nên A ≥ ${ans}, dấu bằng khi x − ${h} = ${k}, tức là x = ${h + k}.`);
  }
  if (d === 4) {
    if (r() < 0.55) {
      let a = 0, m = 0, n = 0;
      do {
        a = int(r, -4, 3);
        m = int(r, 1, 3);
        n = int(r, 1, 3);
      } while ((m * (m + n)) % 2 !== 0 || (2 * a + 2 * m + n) ** 2 < 2 * (a * (a + 2 * m + n) + (a + m) * (a + m + n)));
      const [b, c, dd] = [a + m, a + m + n, a + 2 * m + n];
      const lin = (u: number) => (u === 0 ? 'x' : `(x ${signed(u)})`);
      const k = (m * (m + n)) / 2, ans = -k * k;
      const e = [a, b, c, dd].map(lin).join('');
      const t = `x² ${signed(a + dd)}x`;
      return q(r, `${MIN} A = ${e}.`, `${MIN_VI} A = ${e}.`, ans, [a * b * c * dd, -k, 0, -4 * k * k],
        `Pair the outside and inside factors: ${lin(a)}${lin(dd)} = t ${signed(a * dd)} and ${lin(b)}${lin(c)} = t ${signed(b * c)}, with t = ${t}. Then A = (t ${signed(a * dd)})(t ${signed(b * c)}) = (t ${signed((a * dd + b * c) / 2)})² − ${k * k} ≥ ${num(ans)}, reached when t = ${num(-(a * dd + b * c) / 2)}.`,
        `Ghép thừa số ngoài với ngoài, trong với trong: ${lin(a)}${lin(dd)} = t ${signed(a * dd)} và ${lin(b)}${lin(c)} = t ${signed(b * c)}, với t = ${t}. Khi đó A = (t ${signed(a * dd)})(t ${signed(b * c)}) = (t ${signed((a * dd + b * c) / 2)})² − ${k * k} ≥ ${num(ans)}, đạt được khi t = ${num(-(a * dd + b * c) / 2)}.`);
    }
    const S = 2 * int(r, 1, 6), kind = pick(r, ['sq', 'cube', 'prod'] as const);
    const head = `Real numbers x, y satisfy x + y = ${S}.`, headVi = `Các số thực x, y thỏa mãn x + y = ${S}.`;
    if (kind === 'prod')
      return q(r, `${head} Find the maximum value of xy.`, `${headVi} Tìm giá trị lớn nhất của xy.`, (S * S) / 4, [S * S, (S * S) / 2, S, S - 1],
        `xy = x(${S} − x) = ${(S * S) / 4} − (x − ${S / 2})² ≤ ${(S * S) / 4}, equality at x = y = ${S / 2}.`, `xy = x(${S} − x) = ${(S * S) / 4} − (x − ${S / 2})² ≤ ${(S * S) / 4}, dấu bằng khi x = y = ${S / 2}.`);
    if (kind === 'sq')
      return q(r, `${head} Find the minimum value of x² + y².`, `${headVi} Tìm giá trị nhỏ nhất của x² + y².`, (S * S) / 2, [S * S, (S * S) / 4, 0, S],
        `2(x² + y²) ≥ (x + y)² = ${S * S}, so x² + y² ≥ ${(S * S) / 2}, equality at x = y = ${S / 2}.`, `2(x² + y²) ≥ (x + y)² = ${S * S}, nên x² + y² ≥ ${(S * S) / 2}, dấu bằng khi x = y = ${S / 2}.`);
    return q(r, `${head} Find the minimum value of x³ + y³.`, `${headVi} Tìm giá trị nhỏ nhất của x³ + y³.`, S ** 3 / 4, [S ** 3 / 8, 0, S ** 3, S ** 3 / 2],
      `x³ + y³ = (x + y)³ − 3xy(x + y) = ${S ** 3} − ${3 * S}xy, and xy ≤ (x + y)²/4 = ${(S * S) / 4}. So x³ + y³ ≥ ${S ** 3} − ${3 * S}·${(S * S) / 4} = ${S ** 3 / 4}, equality at x = y = ${S / 2}.`,
      `x³ + y³ = (x + y)³ − 3xy(x + y) = ${S ** 3} − ${3 * S}xy, mà xy ≤ (x + y)²/4 = ${(S * S) / 4}. Vậy x³ + y³ ≥ ${S ** 3} − ${3 * S}·${(S * S) / 4} = ${S ** 3 / 4}, dấu bằng khi x = y = ${S / 2}.`);
  }
  const kind = pick(r, ['titu', 'line', 'prod'] as const);
  if (kind === 'titu') {
    let p = int(r, 1, 5), qq = int(r, 1, 5);
    if (p === qq) qq = (qq % 5) + 1;
    const S = int(r, 1, 6);
    return qf(
      r,
      `Positive numbers x, y satisfy x + y = ${S}. Find the minimum value of A = ${p * p}/x + ${qq * qq}/y.`,
      `Các số dương x, y thỏa mãn x + y = ${S}. Tìm giá trị nhỏ nhất của A = ${p * p}/x + ${qq * qq}/y.`,
      [(p + qq) ** 2, S],
      [[p * p + qq * qq, S], [4 * p * qq, S], [2 * (p * p + qq * qq), S], [(p + qq) ** 2, 2 * S]],
      `Cauchy–Schwarz (Engel form): ${p}²/x + ${qq}²/y ≥ (${p} + ${qq})²/(x + y) = ${fracN((p + qq) ** 2, S)}, with equality when x/${p} = y/${qq}, i.e. x = ${fracN(p * S, p + qq)}, y = ${fracN(qq * S, p + qq)}.`,
      `Bất đẳng thức Bunhiacốpxki (dạng phân thức): ${p}²/x + ${qq}²/y ≥ (${p} + ${qq})²/(x + y) = ${fracN((p + qq) ** 2, S)}, dấu bằng khi x/${p} = y/${qq}, tức là x = ${fracN(p * S, p + qq)}, y = ${fracN(qq * S, p + qq)}.`,
    );
  }
  const a = int(r, 1, 5), c = int(r, 2, 15);
  let b = int(r, 1, 5);
  if (b === a) b = (b % 5) + 1;
  const [ax, by] = [`${a === 1 ? '' : a}x`, `${b === 1 ? '' : b}y`];
  const line = `${ax} + ${by} = ${c}`;
  if (kind === 'line')
    return qf(
      r,
      `Real numbers x, y satisfy ${line}. Find the minimum value of x² + y².`,
      `Các số thực x, y thỏa mãn ${line}. Tìm giá trị nhỏ nhất của x² + y².`,
      [c * c, a * a + b * b],
      [[c * c, (a + b) ** 2], [c, a * a + b * b], [c * c, 2 * (a * a + b * b)], [c * c, a * a]],
      `Cauchy–Schwarz: ${c}² = (${ax} + ${by})² ≤ (${a}² + ${b}²)(x² + y²), so x² + y² ≥ ${fracN(c * c, a * a + b * b)}, with equality when x/${a} = y/${b}.`,
      `Bất đẳng thức Bunhiacốpxki: ${c}² = (${ax} + ${by})² ≤ (${a}² + ${b}²)(x² + y²), nên x² + y² ≥ ${fracN(c * c, a * a + b * b)}, dấu bằng khi x/${a} = y/${b}.`,
    );
  return qf(
    r,
    `Positive numbers x, y satisfy ${line}. Find the maximum value of xy.`,
    `Các số dương x, y thỏa mãn ${line}. Tìm giá trị lớn nhất của xy.`,
    [c * c, 4 * a * b],
    [[c * c, 4 * (a + b)], [c * c, 2 * a * b], [c * c, a * b], [c, 4 * a * b]],
    `AM–GM on ${ax} and ${by}: ${c} = ${ax} + ${by} ≥ 2√(${a * b}xy), so xy ≤ ${fracN(c * c, 4 * a * b)}, with equality when ${ax} = ${by} = ${fracN(c, 2)}.`,
    `Cô-si cho ${ax} và ${by}: ${c} = ${ax} + ${by} ≥ 2√(${a * b}xy), nên xy ≤ ${fracN(c * c, 4 * a * b)}, dấu bằng khi ${ax} = ${by} = ${fracN(c, 2)}.`,
  );
};

// ── Equations: radicals (reject extraneous roots), substitution, symmetric systems ──
const xs = (...v: number[]) => roots(v.map((x) => [x, 1] as [number, number]));
const lin = (u: number) => (u === 0 ? 'x' : `(x ${signed(u)})`);
const rt = (inside: string) => (inside === 'x' ? '√x' : `√(${inside})`);

const equations: Generator = (d, r) => {
  if (d <= 1) {
    const b = nz(r, -3, 6), x0 = b + int(r, 2, 6), a = (x0 - b) ** 2 - x0, x1 = 2 * b + 1 - x0;
    const e = `${rt(poly([1, a]))} = ${poly([1, -b])}`;
    return qs(
      `Solve: ${e}`,
      `Giải phương trình: ${e}`,
      xs(x0),
      [xs(x0, x1), xs(x1), xs(x0, -x0), xs(x0 + 1)],
      `Condition: x ≥ ${num(b)} (the right side equals a square root, so it can't be negative). Squaring: ${poly([1, a])} = ${lin(-b)}², i.e. ${poly([1, -(2 * b + 1), b * b - a])} = 0, so x = ${num(x0)} or x = ${num(x1)}. But ${num(x1)} < ${num(b)}: reject it (it solves the squared equation only).`,
      `Điều kiện: x ≥ ${num(b)} (vế phải bằng một căn bậc hai nên không âm). Bình phương: ${poly([1, a])} = ${lin(-b)}², tức là ${poly([1, -(2 * b + 1), b * b - a])} = 0, nên x = ${num(x0)} hoặc x = ${num(x1)}. Nhưng ${num(x1)} < ${num(b)} nên loại (nó chỉ là nghiệm của phương trình sau khi bình phương).`,
    );
  }
  if (d === 2) {
    const u = int(r, 1, 5);
    let t2 = 0;
    if (r() < 0.5) t2 = -(int(r, 1, 6) ** 2);
    if (t2 === -u * u) t2 -= 2 * u + 1;
    else {
      let w = int(r, 1, 6);
      if (w === u) w = u + 1;
      t2 = w * w;
    }
    const t1 = u * u, e = `${terms([[1, 'x⁴'], [-(t1 + t2), 'x²'], [t1 * t2, '']])} = 0`;
    const w = Math.round(Math.sqrt(Math.abs(t2))); // t2 = −w² when it is rejected
    const ans = t2 > 0 ? xs(-w, -u, u, w) : xs(-u, u);
    return qs(
      `Solve: ${e}`,
      `Giải phương trình: ${e}`,
      ans,
      [t2 > 0 ? xs(u, w) : xs(-w, -u, u, w), xs(t1, t2), t2 > 0 ? xs(-u, u) : xs(u), xs(u, -w), xs(-u - 1, u + 1)],
      `Put t = x² ≥ 0: ${poly([1, -(t1 + t2), t1 * t2], 't')} = 0, so t = ${t1} or t = ${num(t2)}. ${t2 < 0 ? `t = ${num(t2)} < 0 is rejected; t = ${t1} gives x = ±${u}.` : `x² = ${t1} gives x = ±${u}, x² = ${t2} gives x = ±${w}.`}`,
      `Đặt t = x² ≥ 0: ${poly([1, -(t1 + t2), t1 * t2], 't')} = 0, nên t = ${t1} hoặc t = ${num(t2)}. ${t2 < 0 ? `t = ${num(t2)} < 0 bị loại; t = ${t1} cho x = ±${u}.` : `x² = ${t1} cho x = ±${u}, x² = ${t2} cho x = ±${w}.`}`,
    );
  }
  if (d === 3) {
    let z1 = 0, z2 = 0;
    const cnt = (S: number, P: number) => (S * S > 4 * P ? 2 : 0);
    const trap = r() < 0.6; // usually one of the two cases has no real solution
    do {
      z1 = int(r, -5, 8);
      z2 = int(r, -5, 8);
    } while (z1 >= z2 || z1 + z2 === -1 || z1 * z1 === 4 * z2 || z2 * z2 === 4 * z1 || cnt(z1, z2) + cnt(z2, z1) === 0 || (trap && cnt(z1, z2) + cnt(z2, z1) !== 2));
    const A = z1 + z2, B = z1 * z2, ans = cnt(z1, z2) + cnt(z2, z1);
    const sys = `x + y + xy = ${num(A)} and x²y + xy² = ${num(B)}`;
    const sysVi = `x + y + xy = ${num(A)} và x²y + xy² = ${num(B)}`;
    const cs = (S: number, P: number, vi_: boolean) =>
      `S = ${num(S)}, P = ${num(P)}: S² − 4P = ${num(S * S - 4 * P)} ${S * S > 4 * P ? (vi_ ? '> 0, cho 2 cặp' : '> 0, giving 2 pairs') : vi_ ? '< 0, loại' : '< 0, no real pair'}`;
    return q(
      r,
      `How many pairs of real numbers (x, y) satisfy ${sys}?`,
      `Hệ phương trình ${sysVi} có bao nhiêu nghiệm thực (x; y)?`,
      ans,
      [4, ans === 4 ? 2 : 1, 0, 3].filter((v) => v !== ans),
      `Let S = x + y, P = xy: S + P = ${num(A)} and SP = ${num(B)}, so S and P are the roots of ${poly([1, -A, B], 'z')} = 0: ${num(z1)} and ${num(z2)}. x, y are real only if S² ≥ 4P. ${cs(z1, z2, false)}; ${cs(z2, z1, false)}. Total: ${ans}.`,
      `Đặt S = x + y, P = xy: S + P = ${num(A)} và SP = ${num(B)}, nên S, P là nghiệm của ${poly([1, -A, B], 'z')} = 0: ${num(z1)} và ${num(z2)}. x, y là số thực khi và chỉ khi S² ≥ 4P. ${cs(z1, z2, true)}; ${cs(z2, z1, true)}. Tổng cộng: ${ans} nghiệm.`,
    );
  }
  if (d === 4) {
    if (r() < 0.55) {
      const u0 = int(r, 1, 5), a = int(r, -3, 3), t1 = u0 * u0 + 3 * u0, k = t1 * (t1 + 2);
      const x0 = u0 - a, x1 = -3 - u0 - a;
      const e = `${[a, a + 1, a + 2, a + 3].map(lin).join('')} = ${k}`;
      const tt = `x² ${signed(2 * a + 3)}x ${signed(a * a + 3 * a)}`.replace(' + 0', '');
      return qs(
        `Solve: ${e}`,
        `Giải phương trình: ${e}`,
        xs(x1, x0),
        [xs(x0), xs(x0, -x0), xs(x1, x0, -1 - a, -2 - a), xs(x1 + 1, x0 - 1)],
        `Multiply the outer pair and the inner pair: ${lin(a)}${lin(a + 3)} = t and ${lin(a + 1)}${lin(a + 2)} = t + 2, with t = ${tt}. Then t(t + 2) = ${k}, so t = ${t1} or t = ${num(-t1 - 2)}. t = ${num(-t1 - 2)} gives no real x (Δ < 0); t = ${t1} gives x = ${num(x0)} or x = ${num(x1)}.`,
        `Nhân cặp ngoài và cặp trong: ${lin(a)}${lin(a + 3)} = t và ${lin(a + 1)}${lin(a + 2)} = t + 2, với t = ${tt}. Khi đó t(t + 2) = ${k}, nên t = ${t1} hoặc t = ${num(-t1 - 2)}. t = ${num(-t1 - 2)} không cho x thực (Δ < 0); t = ${t1} cho x = ${num(x0)} hoặc x = ${num(x1)}.`,
      );
    }
    let u = int(r, 1, 4), v = int(r, 2, 6);
    if (v <= u) v = u + 1;
    const x0 = int(r, -4, 10), a = u * u - x0, b = v * v - x0, c = u + v;
    const e = `${rt(poly([1, a]))} + ${rt(poly([1, b]))} = ${c}`;
    return qs(
      `Solve: ${e}`,
      `Giải phương trình: ${e}`,
      xs(x0),
      [xs(x0 + 1), xs(x0, x0 + c), xs(c * c - a - b), xs(-x0)],
      `(x ${signed(b)}) − (x ${signed(a)}) = ${b - a}, so ${rt(poly([1, b]))} − ${rt(poly([1, a]))} = ${b - a}/${c} = ${v - u}. Adding to the given equation: 2${rt(poly([1, b]))} = ${c + v - u}, so ${rt(poly([1, b]))} = ${v} and x = ${v * v} ${signed(-b)} = ${num(x0)}. (The left side increases with x, so this is the only solution.)`,
      `(x ${signed(b)}) − (x ${signed(a)}) = ${b - a}, nên ${rt(poly([1, b]))} − ${rt(poly([1, a]))} = ${b - a}/${c} = ${v - u}. Cộng với phương trình đã cho: 2${rt(poly([1, b]))} = ${c + v - u}, nên ${rt(poly([1, b]))} = ${v} và x = ${v * v} ${signed(-b)} = ${num(x0)}. (Vế trái đồng biến theo x nên đây là nghiệm duy nhất.)`,
    );
  }
  const t1 = int(r, 2, 6), t2 = -int(r, 1, t1 - 1), m = t1 + t2;
  let x0 = 0, x1 = 0;
  do {
    x0 = int(r, -6, 5);
    x1 = int(r, -5, 7);
  } while (x0 >= x1 || x0 + x1 === 0);
  const p = -(x0 + x1), qq = x0 * x1 + t1 * t1, c = qq + t1 * t2;
  const inner = poly([1, p, qq]);
  const e = `${poly([1, p, c])} = ${m === 1 ? '' : m}${rt(inner)}`;
  // The rejected root t = t2 < 0: x² + px + q = t2² — the "solutions" a careless solver would add.
  const D2 = p * p - 4 * (qq - t2 * t2);
  const extra = D2 >= 0 && isSquare(D2) && (D2 > 0) ? [(-p - Math.sqrt(D2)) / 2, (-p + Math.sqrt(D2)) / 2].filter(Number.isInteger) : [];
  return qs(
    `Solve: ${e}`,
    `Giải phương trình: ${e}`,
    xs(x0, x1),
    [extra.length ? xs(x0, x1, ...extra) : xs(x0, x1, -x0), xs(x0), xs(x1), xs(-x0, -x1)],
    `Put t = ${rt(inner)} ≥ 0. Then ${poly([1, p, c])} = t² ${signed(c - qq)}, so t² − ${m === 1 ? '' : m}t ${signed(c - qq)} = 0: t = ${t1} or t = ${num(t2)} (rejected, t ≥ 0). t = ${t1}: ${inner} = ${t1 * t1}, i.e. ${poly([1, p, x0 * x1])} = 0, so x = ${num(x0)} or x = ${num(x1)}.`,
    `Đặt t = ${rt(inner)} ≥ 0. Khi đó ${poly([1, p, c])} = t² ${signed(c - qq)}, nên t² − ${m === 1 ? '' : m}t ${signed(c - qq)} = 0: t = ${t1} hoặc t = ${num(t2)} (loại vì t ≥ 0). Với t = ${t1}: ${inner} = ${t1 * t1}, tức là ${poly([1, p, x0 * x1])} = 0, nên x = ${num(x0)} hoặc x = ${num(x1)}.`,
  );
};

// ── Viète with a parameter: conditions on the roots, the Δ check, integer roots ──
const ms = (...v: number[]) => [...new Set(v)].sort((a, b) => a - b).map((m) => `m = ${num(m)}`).join('; ');
/** x² − 2(m + a)x + m² + b = 0 */
const eqA = (a: number, b: number) => `x² − 2${a === 0 ? 'm' : `(m ${signed(a)})`}x + m²${b === 0 ? '' : ` ${signed(b)}`} = 0`;

const vietaParam: Generator = (d, r) => {
  const ROOTS = 'has roots x₁, x₂ with', ROOTS_VI = 'có hai nghiệm x₁, x₂ thỏa mãn';
  if (d <= 2) {
    let a = 0, b = 0, m0 = 0;
    const dl = (m: number) => 2 * a * m + a * a - b; // Δ'
    if (d === 1) {
      do {
        a = nz(r, -3, 3);
        b = int(r, -6, 8);
        m0 = int(r, -6, 6);
      } while (dl(m0) <= 0 || dl(-4 * a - m0) >= 0);
      const Q = 2 * m0 * m0 + 8 * a * m0 + 4 * a * a - 2 * b, m1 = -4 * a - m0, e = eqA(a, b);
      const bound = fracN(b - a * a, 2 * a);
      return qs(
        `Find m so that ${e} ${ROOTS} x₁² + x₂² = ${Q}.`,
        `Tìm m để phương trình ${e} ${ROOTS_VI} x₁² + x₂² = ${Q}.`,
        ms(m0),
        [ms(m0, m1), ms(m1), ms(-m0), ms(m0 + 1)],
        `Roots exist when Δ' = (m ${signed(a)})² − (m²${b === 0 ? '' : ` ${signed(b)}`}) = ${terms([[2 * a, 'm'], [a * a - b, '']])} ≥ 0, i.e. m ${a > 0 ? '≥' : '≤'} ${bound}. Viète: x₁ + x₂ = 2(m ${signed(a)}), x₁x₂ = m²${b === 0 ? '' : ` ${signed(b)}`}, so x₁² + x₂² = (x₁ + x₂)² − 2x₁x₂ = ${terms([[2, 'm²'], [8 * a, 'm'], [4 * a * a - 2 * b, '']])} = ${Q}. This gives m = ${num(m0)} or m = ${num(m1)}, but m = ${num(m1)} fails the Δ' condition.`,
        `Phương trình có nghiệm khi Δ' = (m ${signed(a)})² − (m²${b === 0 ? '' : ` ${signed(b)}`}) = ${terms([[2 * a, 'm'], [a * a - b, '']])} ≥ 0, tức là m ${a > 0 ? '≥' : '≤'} ${bound}. Theo Vi-ét: x₁ + x₂ = 2(m ${signed(a)}), x₁x₂ = m²${b === 0 ? '' : ` ${signed(b)}`}, nên x₁² + x₂² = (x₁ + x₂)² − 2x₁x₂ = ${terms([[2, 'm²'], [8 * a, 'm'], [4 * a * a - 2 * b, '']])} = ${Q}. Ta được m = ${num(m0)} hoặc m = ${num(m1)}, nhưng m = ${num(m1)} không thỏa mãn điều kiện Δ'.`,
      );
    }
    const j = int(r, 1, 4), k = 2 * j;
    a = nz(r, -3, 3);
    m0 = nz(r, -6, 6);
    b = 2 * a * m0 + a * a - j * j;
    const e = eqA(a, b);
    const wrong = (rhs: number) => `m = ${fracN(rhs - a * a + b, 2 * a)}`;
    return qs(
      `Find m so that ${e} ${ROOTS} |x₁ − x₂| = ${k}.`,
      `Tìm m để phương trình ${e} ${ROOTS_VI} |x₁ − x₂| = ${k}.`,
      ms(m0),
      [wrong(k * k), wrong(k), ms(-m0), wrong(2 * k)],
      `(x₁ − x₂)² = (x₁ + x₂)² − 4x₁x₂ = 4(m ${signed(a)})² − 4(m²${b === 0 ? '' : ` ${signed(b)}`}) = 4Δ' = ${terms([[8 * a, 'm'], [4 * (a * a - b), '']])}. Set it equal to ${k}² = ${k * k}: m = ${num(m0)}. Then Δ' = ${j * j} > 0, so the roots exist.`,
      `(x₁ − x₂)² = (x₁ + x₂)² − 4x₁x₂ = 4(m ${signed(a)})² − 4(m²${b === 0 ? '' : ` ${signed(b)}`}) = 4Δ' = ${terms([[8 * a, 'm'], [4 * (a * a - b), '']])}. Cho bằng ${k}² = ${k * k}: m = ${num(m0)}. Khi đó Δ' = ${j * j} > 0 nên phương trình có hai nghiệm.`,
    );
  }
  if (d === 3) {
    const k = int(r, 2, 4), t = int(r, 1, 3), a = int(r, -4, 4), P = k * t * t, M = (k + 1) * t;
    const ma = a === 0 ? 'm' : `m ${signed(a)}`, e = `x² − ${a === 0 ? 'm' : `(${ma})`}x + ${P} = 0`;
    return qs(
      `Find all m so that ${e} ${ROOTS} x₁ = ${k}x₂.`,
      `Tìm tất cả các giá trị của m để phương trình ${e} ${ROOTS_VI} x₁ = ${k}x₂.`,
      ms(-a - M, -a + M),
      [ms(-a + M), ms(-M, M), ms(-a - k * t, -a + k * t), ms(-a + M, a + M)],
      `Viète: x₁ + x₂ = ${ma}, x₁x₂ = ${P}. With x₁ = ${k}x₂: ${k}x₂² = ${P}, so x₂ = ±${t}, and then ${ma} = ${k + 1}x₂ = ±${M}. Both signs work (roots ${k * t}, ${t} or −${k * t}, −${t}): m = ${num(-a + M)} or m = ${num(-a - M)}.`,
      `Theo Vi-ét: x₁ + x₂ = ${ma}, x₁x₂ = ${P}. Với x₁ = ${k}x₂: ${k}x₂² = ${P}, nên x₂ = ±${t}, khi đó ${ma} = ${k + 1}x₂ = ±${M}. Cả hai dấu đều thỏa mãn (nghiệm ${k * t}, ${t} hoặc −${k * t}, −${t}): m = ${num(-a + M)} hoặc m = ${num(-a - M)}.`,
    );
  }
  if (d === 4) {
    const N = pick(r, [6, 8, 10, 12, 15, 18, 20, 24, -6, -8, -10, -12, -15, -18, -20]), c = N - 1;
    const set = new Set<number>(), pos = new Set<number>();
    for (const u of divisors(Math.abs(N))) {
      for (const sgn of [1, -1]) set.add(sgn * u + N / (sgn * u) + 2);
      if (N > 0) pos.add(u + N / u + 2);
    }
    const vals = [...set].sort((x, y) => x - y);
    const e = `x² − mx + m ${signed(c)} = 0`;
    const ask = r() < 0.6;
    const how = `Viète: x₁ + x₂ = m and x₁x₂ = m ${signed(c)}, so x₁x₂ − x₁ − x₂ = ${num(c)}, i.e. (x₁ − 1)(x₂ − 1) = ${num(N)}. Each way of writing ${num(N)} as a product of two integers (negative ones too) gives m = x₁ + x₂: m ∈ {${vals.map(num).join(', ')}}.`;
    const howVi = `Theo Vi-ét: x₁ + x₂ = m và x₁x₂ = m ${signed(c)}, nên x₁x₂ − x₁ − x₂ = ${num(c)}, tức là (x₁ − 1)(x₂ − 1) = ${num(N)}. Mỗi cách viết ${num(N)} thành tích hai số nguyên (kể cả số âm) cho một giá trị m = x₁ + x₂: m ∈ {${vals.map(num).join('; ')}}.`;
    const sum = vals.reduce((x, y) => x + y, 0);
    if (ask)
      return q(r, `How many integers m make ${e} have two roots (possibly equal) that are both integers?`, `Có bao nhiêu số nguyên m để phương trình ${e} có hai nghiệm (có thể trùng nhau) đều là số nguyên?`,
        vals.length, [pos.size || vals.length / 2, tau(N), 2 * tau(N), vals.length + 1], how, howVi);
    return q(r, `Find the sum of all integers m for which ${e} has two roots (possibly equal) that are both integers.`, `Tính tổng tất cả các số nguyên m để phương trình ${e} có hai nghiệm (có thể trùng nhau) đều là số nguyên.`,
      sum, [[...pos].reduce((x, y) => x + y, 0), sum + 2 * vals.length, -sum, vals[vals.length - 1]], how, howVi);
  }
  if (r() < 0.5) {
    const a = int(r, -3, 3), b = nz(r, -9, 9), c = pick(r, [-2, -1, 0, 2, 3]);
    const K = 2 - 2 * c, L = c * c - 2 * a * c + b, bound = fracN(-L, K);
    const sign = K > 0 ? '<' : '>', flip = K > 0 ? '>' : '<', weak = K > 0 ? '≤' : '≥';
    const e = `x² − 2${a === 0 ? 'm' : `(m ${signed(a)})`}x + 2m ${signed(b)} = 0`;
    const fc = `f(${num(c)}) = ${terms([[K, 'm'], [L, '']])}`;
    return qs(
      `Find all m so that ${e} ${ROOTS} x₁ < ${num(c)} < x₂.`,
      `Tìm m để phương trình ${e} ${ROOTS_VI} x₁ < ${num(c)} < x₂.`,
      `m ${sign} ${bound}`,
      [`m ${flip} ${bound}`, `m ${weak} ${bound}`, `m ${sign} ${fracN(L, K)}`, `m ${flip} ${fracN(L, K)}`],
      `Let f(x) be the left side. Since the coefficient of x² is 1 > 0, the number ${num(c)} lies strictly between the roots exactly when f(${num(c)}) < 0 (then Δ > 0 automatically). ${fc} < 0 ⇔ m ${sign} ${bound}.`,
      `Gọi f(x) là vế trái. Vì hệ số của x² là 1 > 0 nên số ${num(c)} nằm giữa hai nghiệm khi và chỉ khi f(${num(c)}) < 0 (khi đó tự động Δ > 0). ${fc} < 0 ⇔ m ${sign} ${bound}.`,
    );
  }
  let a = 0, b = 0;
  do {
    a = nz(r, -3, 3);
    b = int(r, -9, 12);
  } while ((b - a * a) % (2 * a) !== 0 || b <= -3 * a * a || (b - a * a) / (2 * a) === -2 * a);
  const mStar = (b - a * a) / (2 * a), e = eqA(a, b);
  return qs(
    `Find m so that ${e} has roots x₁, x₂ and x₁² + x₂² is as small as possible.`,
    `Tìm m để phương trình ${e} có nghiệm x₁, x₂ và x₁² + x₂² đạt giá trị nhỏ nhất.`,
    ms(mStar),
    [ms(-2 * a), ms(2 * a), ms(-mStar), ms(mStar + (a > 0 ? 1 : -1))],
    `Roots exist when Δ' = ${terms([[2 * a, 'm'], [a * a - b, '']])} ≥ 0, i.e. m ${a > 0 ? '≥' : '≤'} ${num(mStar)}. x₁² + x₂² = ${terms([[2, 'm²'], [8 * a, 'm'], [4 * a * a - 2 * b, '']])} = 2(m ${signed(2 * a)})² ${signed(-4 * a * a - 2 * b)}; its vertex m = ${num(-2 * a)} is not allowed, and on the allowed range the expression ${a > 0 ? 'increases' : 'decreases'} — so the minimum is at the end point m = ${num(mStar)}.`,
    `Phương trình có nghiệm khi Δ' = ${terms([[2 * a, 'm'], [a * a - b, '']])} ≥ 0, tức là m ${a > 0 ? '≥' : '≤'} ${num(mStar)}. x₁² + x₂² = ${terms([[2, 'm²'], [8 * a, 'm'], [4 * a * a - 2 * b, '']])} = 2(m ${signed(2 * a)})² ${signed(-4 * a * a - 2 * b)}; đỉnh m = ${num(-2 * a)} không thỏa mãn điều kiện, và trên miền cho phép biểu thức ${a > 0 ? 'đồng biến' : 'nghịch biến'} — nên giá trị nhỏ nhất đạt tại đầu mút m = ${num(mStar)}.`,
  );
};

// ── Combinatorics: counting with restrictions, inclusion–exclusion, pigeonhole ──
const C = (n: number, k: number): number => (k < 0 || k > n ? 0 : k === 0 ? 1 : (C(n - 1, k - 1) * n) / k);
const P = (n: number, k: number): number => (k <= 0 ? 1 : n * P(n - 1, k - 1));
const lcm = (a: number, b: number) => (a * b) / gcd(a, b);

const combinatorics: Generator = (d, r) => {
  if (d <= 1) {
    if (r() < 0.5) {
      const n = int(r, 7, 24), ans = (n * (n - 3)) / 2;
      return q(r, `A convex polygon has ${n} sides. How many diagonals does it have?`, `Một đa giác lồi có ${n} cạnh. Đa giác đó có bao nhiêu đường chéo?`,
        ans, [(n * (n - 1)) / 2, n * (n - 3), (n * (n - 2)) / 2, ans + n],
        `Each vertex joins ${n} − 3 = ${n - 3} others by a diagonal (not itself, not its two neighbours). ${n}·${n - 3} counts every diagonal twice, so there are ${n}·${n - 3}/2 = ${ans}.`,
        `Mỗi đỉnh nối với ${n} − 3 = ${n - 3} đỉnh khác bằng một đường chéo (trừ chính nó và hai đỉnh kề). ${n}·${n - 3} đếm mỗi đường chéo hai lần, nên có ${n}·${n - 3}/2 = ${ans} đường chéo.`);
    }
    const n = int(r, 5, 12), ans = C(n, 3);
    return q(r, `${n} points lie in a plane, no three on a line. How many triangles have all three vertices among these points?`, `Cho ${n} điểm trong mặt phẳng, không có ba điểm nào thẳng hàng. Có bao nhiêu tam giác có ba đỉnh là ba trong các điểm đó?`,
      ans, [n * (n - 1) * (n - 2), C(n, 2), (n * (n - 1) * (n - 2)) / 2, 3 * n],
      `Any 3 of the points form a triangle, and order doesn't matter: ${n}·${n - 1}·${n - 2}/(3·2·1) = ${ans}.`,
      `Ba điểm bất kì tạo thành một tam giác và không phân biệt thứ tự: ${n}·${n - 1}·${n - 2}/(3·2·1) = ${ans} tam giác.`);
  }
  if (d === 2) {
    if (r() < 0.3) {
      const n = int(r, 6, 30), D = (n * (n - 3)) / 2;
      return q(r, `A convex polygon has ${D} diagonals. How many sides does it have?`, `Một đa giác lồi có ${D} đường chéo. Hỏi đa giác đó có bao nhiêu cạnh?`,
        n, [n - 1, n + 1, n - 3, Math.round(Math.sqrt(2 * D))],
        `n(n − 3)/2 = ${D}, so n(n − 3) = ${2 * D} = ${n}·${n - 3}: n = ${n}.`, `n(n − 3)/2 = ${D}, nên n(n − 3) = ${2 * D} = ${n}·${n - 3}: n = ${n}.`);
    }
    const [a, b] = pick(r, [[4, 6], [6, 9], [4, 10], [6, 8], [3, 5], [2, 7], [6, 15], [10, 15], [4, 14], [3, 7], [9, 12]] as const);
    const N = int(r, 10, 99) * 10 + int(r, 0, 9), L = lcm(a, b);
    const A = Math.floor(N / a), B = Math.floor(N / b), AB = Math.floor(N / L), either = A + B - AB;
    const how = `Multiples of ${a}: ${A}; of ${b}: ${B}; of both, i.e. of lcm(${a}, ${b}) = ${L}: ${AB}. Divisible by ${a} or ${b}: ${A} + ${B} − ${AB} = ${either}.`;
    const howVi = `Bội của ${a}: ${A} số; bội của ${b}: ${B} số; bội của cả hai, tức là bội của BCNN(${a}, ${b}) = ${L}: ${AB} số. Chia hết cho ${a} hoặc ${b}: ${A} + ${B} − ${AB} = ${either} số.`;
    const wrongAB = A + B - Math.floor(N / (a * b));
    if (r() < 0.6)
      return q(r, `How many integers from 1 to ${N} are divisible by ${a} or ${b}?`, `Có bao nhiêu số nguyên từ 1 đến ${N} chia hết cho ${a} hoặc ${b}?`, either, [A + B, wrongAB, N - either, A + B - 2 * AB], how, howVi);
    return q(r, `How many integers from 1 to ${N} are divisible by neither ${a} nor ${b}?`, `Có bao nhiêu số nguyên từ 1 đến ${N} không chia hết cho ${a} và cũng không chia hết cho ${b}?`,
      N - either, [either, N - A - B, N - wrongAB, N - A - B + 2 * AB], `${how} So ${N} − ${either} = ${N - either} are divisible by neither.`, `${howVi} Vậy có ${N} − ${either} = ${N - either} số không chia hết cho cả hai.`);
  }
  if (d === 3) {
    if (r() < 0.55) {
      const ps = [...pick(r, [[2, 3, 5], [2, 3, 7], [2, 5, 7], [3, 5, 7], [2, 3, 11], [3, 5, 11]] as const)];
      const N = int(r, 100, 999);
      const f = (k: number) => Math.floor(N / k);
      const [p1, p2, p3] = ps;
      const s1 = f(p1) + f(p2) + f(p3), s2 = f(p1 * p2) + f(p1 * p3) + f(p2 * p3), s3 = f(p1 * p2 * p3), ans = N - s1 + s2 - s3;
      return q(
        r,
        `How many integers from 1 to ${N} are divisible by none of ${p1}, ${p2} and ${p3}?`,
        `Có bao nhiêu số nguyên từ 1 đến ${N} không chia hết cho số nào trong các số ${p1}, ${p2}, ${p3}?`,
        ans,
        [N - s1, N - s1 + s2, N - s1 + s3, s1 - s2 + s3],
        `Inclusion–exclusion: divisible by at least one = (${f(p1)} + ${f(p2)} + ${f(p3)}) − (${f(p1 * p2)} + ${f(p1 * p3)} + ${f(p2 * p3)}) + ${s3} = ${s1 - s2 + s3}. So ${N} − ${s1 - s2 + s3} = ${ans} are divisible by none.`,
        `Nguyên lí bù trừ: số chia hết cho ít nhất một số = (${f(p1)} + ${f(p2)} + ${f(p3)}) − (${f(p1 * p2)} + ${f(p1 * p3)} + ${f(p2 * p3)}) + ${s3} = ${s1 - s2 + s3}. Vậy có ${N} − ${s1 - s2 + s3} = ${ans} số không chia hết cho số nào.`,
      );
    }
    const b = int(r, 4, 7), g = int(r, 2, 5), k = int(r, 3, 4), ans = C(b + g, k) - C(b, k);
    return q(
      r,
      `A class group has ${b} boys and ${g} girls. In how many ways can a team of ${k} with at least one girl be chosen?`,
      `Một tổ có ${b} bạn nam và ${g} bạn nữ. Có bao nhiêu cách chọn một đội ${k} bạn trong đó có ít nhất một bạn nữ?`,
      ans,
      [g * C(b + g - 1, k - 1), C(b + g, k), g * C(b, k - 1), C(b + g, k) - C(g, k)],
      `Count the complement: all teams C(${b + g}, ${k}) = ${C(b + g, k)}, minus the all-boy teams C(${b}, ${k}) = ${C(b, k)}: ${ans}. (Choosing "one girl first, then the rest" counts some teams several times.)`,
      `Đếm phần bù: tất cả các đội C(${b + g}, ${k}) = ${C(b + g, k)}, trừ các đội toàn nam C(${b}, ${k}) = ${C(b, k)}: ${ans}. (Cách "chọn trước một bạn nữ rồi chọn phần còn lại" đếm trùng nhiều đội.)`,
    );
  }
  if (d === 4) {
    const m = int(r, 4, 7), n = m + 1, k = pick(r, [3, 3, 4]);
    const kind = pick(r, ['even', 'odd', 'five'] as const);
    const Lset = [...Array(n).keys()].filter((x) => (kind === 'even' ? x % 2 === 0 : kind === 'odd' ? x % 2 === 1 : x % 5 === 0));
    const zero = Lset.includes(0), nonzero = Lset.filter((x) => x > 0).length, rest = P(n - 2, k - 2);
    const ans = rest * ((zero ? n - 1 : 0) + nonzero * (n - 2));
    const digits = [...Array(n).keys()].join(', ');
    const what = { even: 'even numbers', odd: 'odd numbers', five: 'numbers divisible by 5' }[kind];
    const whatVi = { even: 'số chẵn', odd: 'số lẻ', five: 'số chia hết cho 5' }[kind];
    const ends = Lset.join(', ');
    return q(
      r,
      `Using the digits ${digits}, each at most once, how many ${k}-digit ${what} can be formed?`,
      `Từ các chữ số ${digits} có thể lập được bao nhiêu ${whatVi} có ${k} chữ số khác nhau?`,
      ans,
      [Lset.length * P(n - 1, k - 1), Lset.length * (n - 1) * rest, Lset.length * (n - 2) * rest, ans + rest],
      `The last digit must be ${ends}.${zero ? ' Split by whether it is 0 (the first digit can\'t be 0).' : ''} ${zero ? `Last digit 0: first digit ${n - 1} choices, then ${rest} ways for the middle — ${(n - 1) * rest}. ` : ''}Last digit one of the ${nonzero} non-zero choices: first digit ${n - 2} choices (not 0, not the last digit), middle ${rest} ways — ${nonzero}·${n - 2}·${rest} = ${nonzero * (n - 2) * rest}. Total ${ans}.`,
      `Chữ số tận cùng phải là ${ends}.${zero ? ' Chia trường hợp theo chữ số tận cùng có bằng 0 hay không (chữ số đầu không được bằng 0).' : ''} ${zero ? `Tận cùng là 0: chữ số đầu có ${n - 1} cách, phần giữa có ${rest} cách — ${(n - 1) * rest} số. ` : ''}Tận cùng là một trong ${nonzero} chữ số khác 0: chữ số đầu có ${n - 2} cách (khác 0 và khác chữ số tận cùng), phần giữa ${rest} cách — ${nonzero}·${n - 2}·${rest} = ${nonzero * (n - 2) * rest} số. Tổng cộng ${ans} số.`,
    );
  }
  const kind = pick(r, ['same', 'same', 'each', 'sum'] as const);
  if (kind === 'sum') {
    const m = int(r, 5, 14), ans = Math.floor(m / 2) + 2;
    return q(
      r,
      `What is the smallest n such that among any n integers there are always two whose sum or difference is divisible by ${m}?`,
      `Tìm số n nhỏ nhất sao cho trong n số nguyên bất kì luôn có hai số có tổng hoặc hiệu chia hết cho ${m}.`,
      ans,
      [m + 1, m, ans - 1, Math.ceil(m / 2) + 2],
      `Use remainders mod ${m} as boxes: {0}${m % 2 === 0 ? `, {${m / 2}}` : ''} and the pairs {1, ${m - 1}}, {2, ${m - 2}}, …: ${ans - 1} boxes. Two numbers in the same box have sum or difference divisible by ${m}, so ${ans} numbers are enough; one number from each box (${ans - 1} numbers) shows ${ans - 1} is not.`,
      `Lấy số dư khi chia cho ${m} làm "chuồng": {0}${m % 2 === 0 ? `, {${m / 2}}` : ''} và các cặp {1; ${m - 1}}, {2; ${m - 2}}, …: có ${ans - 1} chuồng. Hai số cùng chuồng có tổng hoặc hiệu chia hết cho ${m}, nên ${ans} số là đủ; chọn mỗi chuồng một số (${ans - 1} số) cho thấy ${ans - 1} số là chưa đủ.`,
    );
  }
  const head = (cs: number[]) => `A drawer has ${cs[0]} red, ${cs[1]} blue and ${cs[2]} white socks. Without looking, what is the smallest number of socks you must take to be sure of getting`;
  const headVi = (cs: number[]) => `Trong ngăn kéo có ${cs[0]} chiếc tất đỏ, ${cs[1]} chiếc tất xanh và ${cs[2]} chiếc tất trắng. Không nhìn, phải lấy ra ít nhất bao nhiêu chiếc để chắc chắn có`;
  if (kind === 'each') {
    const cs = [int(r, 3, 12), int(r, 3, 12), int(r, 3, 12)];
    const total = cs[0] + cs[1] + cs[2], lo = Math.min(...cs), ans = total - lo + 1;
    return q(r, `${head(cs)} at least one sock of each colour?`, `${headVi(cs)} đủ cả ba màu?`, ans, [4, total - Math.max(...cs) + 1, ans - 1, total],
      `Worst case: you first take all socks of the two biggest colours (${total - lo}) and still miss the third. One more sock guarantees all three colours: ${total - lo} + 1 = ${ans}.`,
      `Trường hợp xấu nhất: lấy hết tất của hai màu nhiều nhất (${total - lo} chiếc) mà vẫn thiếu màu thứ ba. Lấy thêm một chiếc là chắc chắn đủ ba màu: ${total - lo} + 1 = ${ans}.`);
  }
  const k = int(r, 3, 6);
  const cs = [int(r, k, 14), int(r, 1, 14), r() < 0.5 ? int(r, 1, k - 2) : int(r, 1, 14)].sort(() => r() - 0.5);
  const ans = cs.reduce((x, c) => x + Math.min(c, k - 1), 0) + 1;
  const parts = cs.map((c) => Math.min(c, k - 1)).join(' + ');
  return q(r, `${head(cs)} ${k} socks of the same colour?`, `${headVi(cs)} ${k} chiếc cùng màu?`, ans, [3 * (k - 1) + 1, 3 * k, ans - 1, 3 * (k - 1)],
    `Worst case: as many socks as possible without ${k} of one colour — at most ${k - 1} of each colour, but a colour with fewer socks gives only what it has: ${parts} = ${ans - 1}. The next sock must make ${k} of one colour: ${ans}.`,
    `Trường hợp xấu nhất: lấy nhiều nhất có thể mà chưa có ${k} chiếc cùng màu — mỗi màu tối đa ${k - 1} chiếc, nhưng màu nào ít tất hơn thì chỉ lấy được hết số đó: ${parts} = ${ans - 1}. Chiếc tiếp theo chắc chắn tạo ra ${k} chiếc cùng màu: ${ans}.`);
};

// ── Geometry: similar triangles, power of a point, angles in circles ─────
const geometry: Generator = (d, r) => {
  if (d <= 1) {
    let p = int(r, 2, 9), qq = int(r, 2, 9);
    if (p === qq) qq = p + int(r, 1, 3);
    const t = int(r, 1, 5), S = p * p * t, ans = qq * qq * t;
    if (r() < 0.5)
      return q(
        r,
        `Triangle ABC is similar to triangle DEF. Their areas are ${S} cm² and ${ans} cm², and AB = ${p} cm. Find DE (cm).`,
        `Tam giác ABC đồng dạng với tam giác DEF, diện tích hai tam giác lần lượt là ${S} cm² và ${ans} cm², AB = ${p} cm. Tính DE (cm).`,
        qq,
        [(p * ans) / S, (p * S) / ans, qq * qq, qq + 1, qq - 1],
        `The area ratio is k² = ${ans}/${S} = ${fracN(qq * qq, p * p)}, so the ratio of similarity is k = ${fracN(qq, p)} (take the square root!) and DE = ${p}·${fracN(qq, p)} = ${qq} cm.`,
        `Tỉ số diện tích là k² = ${ans}/${S} = ${fracN(qq * qq, p * p)}, nên tỉ số đồng dạng k = ${fracN(qq, p)} (phải lấy căn bậc hai!) và DE = ${p}·${fracN(qq, p)} = ${qq} cm.`,
      );
    return q(
      r,
      `Triangle ABC is similar to triangle DEF, with AB = ${p} cm and DE = ${qq} cm. The area of ABC is ${S} cm². Find the area of DEF (cm²).`,
      `Tam giác ABC đồng dạng với tam giác DEF, với AB = ${p} cm và DE = ${qq} cm. Diện tích tam giác ABC là ${S} cm². Tính diện tích tam giác DEF (cm²).`,
      ans,
      [(S * qq) / p, (S * p * p) / (qq * qq), (S * p) / qq, ans + qq, ans - qq],
      `The ratio of similarity is k = DE/AB = ${fracN(qq, p)}. Areas scale by k² = ${fracN(qq * qq, p * p)}, so the area is ${S}·${fracN(qq * qq, p * p)} = ${ans} cm².`,
      `Tỉ số đồng dạng k = DE/AB = ${fracN(qq, p)}. Tỉ số diện tích bằng k² = ${fracN(qq * qq, p * p)}, nên diện tích là ${S}·${fracN(qq * qq, p * p)} = ${ans} cm².`,
    );
  }
  if (d === 2) {
    let a = int(r, 1, 5), b = int(r, 1, 5);
    if (gcd(a, b) !== 1) b = 1;
    const n = a + b, t = int(r, 1, 4), S = n * n * t, small = a * a * t, trap = r() < 0.6;
    const head = `In triangle ABC (area ${S} cm²), M is on AB and N is on AC with MN ∥ BC and AM = ${a} cm, MB = ${b} cm.`;
    const headVi = `Tam giác ABC có diện tích ${S} cm². M thuộc AB, N thuộc AC sao cho MN ∥ BC, AM = ${a} cm, MB = ${b} cm.`;
    const how = `Triangle AMN ~ triangle ABC with ratio AM/AB = ${a}/${n}, so area(AMN) = ${S}·(${a}/${n})² = ${small} cm²`;
    const howVi = `Tam giác AMN đồng dạng với tam giác ABC theo tỉ số AM/AB = ${a}/${n}, nên S(AMN) = ${S}·(${a}/${n})² = ${small} cm²`;
    if (trap)
      return q(r, `${head} Find the area of the trapezoid MNCB (cm²).`, `${headVi} Tính diện tích hình thang MNCB (cm²).`, S - small,
        [(S * b) / n, small, S - (S * a) / n, (S * b * b) / (n * n)], `${how}, and the trapezoid is ${S} − ${small} = ${S - small} cm².`, `${howVi}, nên hình thang có diện tích ${S} − ${small} = ${S - small} cm².`);
    return q(r, `${head} Find the area of triangle AMN (cm²).`, `${headVi} Tính diện tích tam giác AMN (cm²).`, small,
      [(S * a) / n, (S * a) / b, S - small, (S * b * b) / (n * n)], `${how}.`, `${howVi}.`);
  }
  if (d === 3) {
    if (r() < 0.5) {
      const k = int(r, 1, 3), u = int(r, 1, 3), v = int(r, u + 1, 5);
      const a = k * u * u, b = k * (v * v - u * u), ans = k * u * v;
      return q(
        r,
        `From a point M outside a circle, draw the tangent MT (T on the circle) and a secant MAB (A between M and B). MA = ${a} cm, AB = ${b} cm. Find MT (cm).`,
        `Từ điểm M nằm ngoài đường tròn, kẻ tiếp tuyến MT (T là tiếp điểm) và cát tuyến MAB (A nằm giữa M và B). MA = ${a} cm, AB = ${b} cm. Tính MT (cm).`,
        ans,
        [Math.sqrt(a * b), a + b, (2 * a + b) / 2, Math.sqrt(b * (a + b)), ans + 1],
        `Triangles MTA and MBT are similar (common angle M, and ∠MTA = ∠MBT by the tangent–chord angle), so MT² = MA·MB = ${a}·${a + b} = ${ans * ans}, MT = ${ans} cm. Careful: MB = MA + AB = ${a + b}, not AB.`,
        `Tam giác MTA đồng dạng với tam giác MBT (chung góc M, ∠MTA = ∠MBT vì góc tạo bởi tiếp tuyến và dây cung), nên MT² = MA·MB = ${a}·${a + b} = ${ans * ans}, MT = ${ans} cm. Chú ý: MB = MA + AB = ${a + b}, không phải AB.`,
      );
    }
    let a = 0, b = 0, c = 0;
    do {
      a = int(r, 2, 12);
      b = int(r, 2, 12);
      c = int(r, 2, 12);
    } while ((a * b) % c !== 0 || c === a || c === b);
    const ans = (a * b) / c;
    return q(
      r,
      `Chords AB and CD of a circle meet at E. AE = ${a} cm, EB = ${b} cm, CE = ${c} cm. Find ED (cm).`,
      `Hai dây AB và CD của một đường tròn cắt nhau tại E. AE = ${a} cm, EB = ${b} cm, CE = ${c} cm. Tính ED (cm).`,
      ans,
      [(a * c) / b, (b * c) / a, a + b - c, a * b, ans + 1],
      `Triangles AEC and DEB are similar (∠EAC = ∠EDB, inscribed angles on the same arc), so EA·EB = EC·ED: ED = ${a}·${b}/${c} = ${ans} cm.`,
      `Tam giác AEC đồng dạng với tam giác DEB (∠EAC = ∠EDB, hai góc nội tiếp cùng chắn một cung), nên EA·EB = EC·ED: ED = ${a}·${b}/${c} = ${ans} cm.`,
    );
  }
  if (d === 4) {
    if (r() < 0.55) {
      const al = int(r, 20, 80), ask = pick(r, ['AOB', 'ACB', 'OAB'] as const);
      const ans = { AOB: 2 * al, ACB: al, OAB: 90 - al }[ask];
      const how = `The angle between a tangent and a chord equals the inscribed angle on that arc: ∠ACB = ${al}°, and the central angle is twice it: ∠AOB = ${2 * al}°. Triangle OAB is isosceles, so ∠OAB = (180° − ${2 * al}°)/2 = ${90 - al}°.`;
      const howVi = `Góc tạo bởi tiếp tuyến và dây cung bằng góc nội tiếp cùng chắn cung đó: ∠ACB = ${al}°, góc ở tâm gấp đôi: ∠AOB = ${2 * al}°. Tam giác OAB cân tại O nên ∠OAB = (180° − ${2 * al}°)/2 = ${90 - al}°.`;
      return q(
        r,
        `A and B are on a circle with centre O. The tangent at A makes an angle of ${al}° with the chord AB, and C is a point on the major arc AB. Find ∠${ask} (in degrees).`,
        `A, B là hai điểm trên đường tròn tâm O. Tiếp tuyến tại A tạo với dây AB một góc ${al}°, C là một điểm trên cung lớn AB. Tính ∠${ask} (độ).`,
        ans,
        [al, 2 * al, 90 - al, 180 - al, 180 - 2 * al, 90 + al].filter((x) => x !== ans),
        how,
        howVi,
      );
    }
    const th = 2 * int(r, 15, 70), ans = (180 - th) / 2;
    return q(
      r,
      `From a point M outside a circle with centre O, the tangents MA and MB are drawn (A, B on the circle), and ∠AMB = ${th}°. C is a point on the major arc AB. Find ∠ACB (in degrees).`,
      `Từ điểm M nằm ngoài đường tròn tâm O, kẻ hai tiếp tuyến MA, MB (A, B là tiếp điểm), ∠AMB = ${th}°. C là một điểm trên cung lớn AB. Tính ∠ACB (độ).`,
      ans,
      [th / 2, 180 - th, th, 90 + th / 2],
      `∠OAM = ∠OBM = 90°, so in quadrilateral OAMB: ∠AOB = 180° − ${th}° = ${180 - th}°. The inscribed angle is half the central angle: ∠ACB = ${ans}°.`,
      `∠OAM = ∠OBM = 90° nên trong tứ giác OAMB: ∠AOB = 180° − ${th}° = ${180 - th}°. Góc nội tiếp bằng nửa góc ở tâm cùng chắn một cung: ∠ACB = ${ans}°.`,
    );
  }
  const kind = pick(r, ['secants', 'ratios', 'arcsIn', 'arcsOut'] as const);
  if (kind === 'secants') {
    let a = 0, b = 0, c = 0;
    do {
      a = int(r, 2, 9);
      b = int(r, 2, 12);
      c = int(r, 2, 12);
    } while ((a * (a + b)) % c !== 0 || c * c >= a * (a + b) || c === a);
    const MD = (a * (a + b)) / c, ans = MD - c;
    return q(
      r,
      `From a point M outside a circle, two secants MAB and MCD are drawn (A between M and B, C between M and D). MA = ${a} cm, AB = ${b} cm, MC = ${c} cm. Find CD (cm).`,
      `Từ điểm M nằm ngoài đường tròn, kẻ hai cát tuyến MAB và MCD (A nằm giữa M và B, C nằm giữa M và D). MA = ${a} cm, AB = ${b} cm, MC = ${c} cm. Tính CD (cm).`,
      ans,
      [MD, (a * b) / c, a + b - c, (b * c) / a, ans + 1],
      `Triangles MAC and MDB are similar, so MA·MB = MC·MD: ${a}·${a + b} = ${c}·MD, MD = ${MD}. Then CD = MD − MC = ${MD} − ${c} = ${ans} cm.`,
      `Tam giác MAC đồng dạng với tam giác MDB nên MA·MB = MC·MD: ${a}·${a + b} = ${c}·MD, MD = ${MD}. Vậy CD = MD − MC = ${MD} − ${c} = ${ans} cm.`,
    );
  }
  if (kind === 'ratios') {
    let p = 0, qq = 0, s0 = 0, t0 = 0;
    do {
      [p, qq, s0, t0] = [int(r, 1, 4), int(r, 1, 4), int(r, 1, 4), int(r, 1, 4)];
    } while (gcd(p, qq) !== 1 || gcd(s0, t0) !== 1);
    const S = (p + qq) * (s0 + t0) * int(r, 1, 3), ans = (S * p * s0) / ((p + qq) * (s0 + t0));
    return q(
      r,
      `In triangle ABC (area ${S} cm²), M is on AB with AM : MB = ${p} : ${qq}, and N is on AC with AN : NC = ${s0} : ${t0}. Find the area of triangle AMN (cm²).`,
      `Tam giác ABC có diện tích ${S} cm². M thuộc AB với AM : MB = ${p} : ${qq}, N thuộc AC với AN : NC = ${s0} : ${t0}. Tính diện tích tam giác AMN (cm²).`,
      ans,
      [(S * p) / (p + qq), (S * s0) / (s0 + t0), (S * p * s0) / (qq * t0), S - ans, (S * p * p) / ((p + qq) * (p + qq))],
      `Triangles sharing angle A: area(AMN)/area(ABC) = (AM/AB)·(AN/AC) = (${p}/${p + qq})·(${s0}/${s0 + t0}). So area(AMN) = ${S}·${fracN(p * s0, (p + qq) * (s0 + t0))} = ${ans} cm².`,
      `Hai tam giác chung góc A: S(AMN)/S(ABC) = (AM/AB)·(AN/AC) = (${p}/${p + qq})·(${s0}/${s0 + t0}). Vậy S(AMN) = ${S}·${fracN(p * s0, (p + qq) * (s0 + t0))} = ${ans} cm².`,
    );
  }
  if (kind === 'arcsIn') {
    let x = 0, y = 0;
    do {
      x = 10 * int(r, 3, 15);
      y = 10 * int(r, 3, 15);
    } while (x + y > 280 || x === y);
    const ans = (x + y) / 2;
    return q(
      r,
      `Chords AB and CD of a circle meet at E inside the circle. The arc AC not containing B, D is ${x}°, and the arc BD not containing A, C is ${y}°. Find ∠AEC (in degrees).`,
      `Hai dây AB và CD của một đường tròn cắt nhau tại E nằm trong đường tròn. Cung AC không chứa B, D có số đo ${x}°, cung BD không chứa A, C có số đo ${y}°. Tính ∠AEC (độ).`,
      ans,
      [Math.abs(x - y) / 2, x + y, 180 - ans, Math.max(x, y) / 2],
      `An angle with its vertex inside the circle is half the sum of the two arcs it cuts off: ∠AEC = (${x}° + ${y}°)/2 = ${ans}°. (∠AEC is an exterior angle of triangle EBC: ∠ABC + ∠BCD = ${x / 2}° + ${y / 2}°.)`,
      `Góc có đỉnh ở bên trong đường tròn bằng nửa tổng số đo hai cung bị chắn: ∠AEC = (${x}° + ${y}°)/2 = ${ans}°. (∠AEC là góc ngoài của tam giác EBC: ∠ABC + ∠BCD = ${x / 2}° + ${y / 2}°.)`,
    );
  }
  let x = 0, y = 0;
  do {
    x = 10 * int(r, 6, 22);
    y = 10 * int(r, 2, 12);
  } while (x - y < 20 || x + y > 300);
  const ans = (x - y) / 2;
  return q(
    r,
    `From a point M outside a circle, two secants MAB and MCD are drawn (A between M and B, C between M and D). The arc BD not containing A, C is ${x}°, and the arc AC not containing B, D is ${y}°. Find ∠BMD (in degrees).`,
    `Từ điểm M nằm ngoài đường tròn, kẻ hai cát tuyến MAB và MCD (A nằm giữa M và B, C nằm giữa M và D). Cung BD không chứa A, C có số đo ${x}°, cung AC không chứa B, D có số đo ${y}°. Tính ∠BMD (độ).`,
    ans,
    [(x + y) / 2, x - y, x / 2, 180 - (x + y) / 2],
    `An angle with its vertex outside the circle is half the difference of the arcs it cuts off: ∠BMD = (${x}° − ${y}°)/2 = ${ans}°. (In triangle MAD: ∠BAD = ∠AMD + ∠ADM, i.e. ${x / 2}° = ∠BMD + ${y / 2}°.)`,
    `Góc có đỉnh ở bên ngoài đường tròn bằng nửa hiệu số đo hai cung bị chắn: ∠BMD = (${x}° − ${y}°)/2 = ${ans}°. (Trong tam giác MAD: ∠BAD = ∠AMD + ∠ADM, tức là ${x / 2}° = ∠BMD + ${y / 2}°.)`,
  );
};

const EXAM = ['Thi vào 10 chuyên Toán', 'HSG Toán 9'];

export const advancedConcepts: ConceptSeed[] = [
  {
    id: 'math.adv.number-theory',
    domain: 'Advanced',
    skill: 'Number theory',
    name: 'Divisibility & remainders',
    missionName: 'Remainder Riddles',
    description: 'Remainders of huge powers, last digits, divisibility of n³ − n, gcd·lcm, counting divisors, primes.',
    prerequisites: ['math.number.powers', 'math.number.integers'],
    lesson:
      'Work with remainders: if a ≡ r (mod m) then aⁿ ≡ rⁿ (mod m). Powers repeat in a cycle — find the first power that leaves remainder 1, then use n = qk + s. Last digits of powers repeat every 4. n³ − n = (n − 1)n(n + 1), a product of three consecutive integers, is always divisible by 6. If N = pᵃ·qᵇ·rᶜ, N has (a + 1)(b + 1)(c + 1) divisors. gcd(a, b)·lcm(a, b) = a·b. A prime > 3 is never a multiple of 3 — test remainders mod 3.',
    examRefs: [`${EXAM[0]} · Số học`, `${EXAM[1]} · Số học`],
  },
  {
    id: 'math.adv.diophantine',
    domain: 'Advanced',
    skill: 'Number theory',
    name: 'Integer equations',
    missionName: 'Integer Hunt',
    description: 'Integer solutions by factoring (xy + x + y = 11 → (x + 1)(y + 1) = 12), perfect squares, counting solutions.',
    prerequisites: ['math.adv.number-theory', 'math.algebra.expressions'],
    lesson:
      'Turn the equation into a product equal to a number: xy + px + qy = c becomes (x + q)(y + p) = c + pq, then each factor is a divisor. Count divisors carefully — positive only, or negative too? Are some excluded (a factor equal to 1, or x = 0)? For perfect squares, write n² + k = m² and factor (m − n)(m + n) = k; the two factors have the same parity. 1/x + 1/y = 1/n becomes (x − n)(y − n) = n².',
    examRefs: [`${EXAM[0]} · Phương trình nghiệm nguyên`, `${EXAM[1]} · Phương trình nghiệm nguyên`],
  },
  {
    id: 'math.adv.identities',
    domain: 'Advanced',
    skill: 'Algebra',
    name: 'Identities & symmetric expressions',
    missionName: 'Mirror Formulas',
    description: 'Values from conditions: a + b and ab → a³ + b³; x + 1/x → x³ + 1/x³; a + b + c = 0 → a³ + b³ + c³ = 3abc.',
    prerequisites: ['math.algebra.expressions', 'math.algebra.vieta'],
    lesson:
      'Never solve for a and b — rewrite the target in the given sums and products. a² + b² = (a + b)² − 2ab, (a − b)² = (a + b)² − 4ab, a³ + b³ = (a + b)³ − 3ab(a + b). With x + 1/x = t: x² + 1/x² = t² − 2, x³ + 1/x³ = t³ − 3t, and multiply lower powers to reach higher ones. For three numbers: a² + b² + c² = (a + b + c)² − 2(ab + bc + ca) and a³ + b³ + c³ − 3abc = (a + b + c)(a² + b² + c² − ab − bc − ca). Spot hidden cubes: x³ − 3x² + 3x − 1 = (x − 1)³.',
    examRefs: [`${EXAM[0]} · Biến đổi đại số`, `${EXAM[1]} · Hằng đẳng thức`],
  },
  {
    id: 'math.adv.inequalities',
    domain: 'Advanced',
    skill: 'Inequalities',
    name: 'Minimum & maximum',
    missionName: 'Peak & Valley',
    description: 'Smallest and largest values by completing the square, AM–GM (Cô-si) and Cauchy–Schwarz (Bunhiacốpxki) — and where they are reached.',
    prerequisites: ['math.adv.identities', 'math.algebra.inequalities'],
    lesson:
      'Completing the square: A = (x − p)² + m ≥ m, reached at x = p; for two variables, make several squares. AM–GM (Cô-si): for a, b ≥ 0, a + b ≥ 2√(ab), equal when a = b — so ax + b/x ≥ 2√(ab) for x > 0. Shift to make it work: x + k/(x − h) = (x − h) + k/(x − h) + h. Cauchy–Schwarz (Bunhiacốpxki): (ax + by)² ≤ (a² + b²)(x² + y²) and p²/x + q²/y ≥ (p + q)²/(x + y). Always check that equality can really happen.',
    examRefs: [`${EXAM[0]} · Bất đẳng thức, cực trị`, `${EXAM[1]} · Bất đẳng thức`],
  },
  {
    id: 'math.adv.equations',
    domain: 'Advanced',
    skill: 'Equations',
    name: 'Non-standard equations & systems',
    missionName: 'Hidden Roots',
    description: 'Equations with square roots (reject extraneous roots), biquadratic and product substitutions, symmetric systems.',
    prerequisites: ['math.algebra.reducible', 'math.algebra.radicals', 'math.adv.identities'],
    lesson:
      'With √A = B: first require B ≥ 0, then square — and check every root, because squaring adds fake ones. Look for a substitution: t = x² (t ≥ 0) for x⁴ + bx² + c = 0; pair (x + a)(x + d) and (x + b)(x + c) when a + d = b + c; t = √(…) ≥ 0 when the same expression appears inside and outside a root. In a symmetric system put S = x + y, P = xy; real x, y exist only when S² ≥ 4P.',
    examRefs: [`${EXAM[0]} · Phương trình vô tỉ, hệ phương trình`, `${EXAM[1]} · Phương trình, hệ phương trình`],
  },
  {
    id: 'math.adv.vieta',
    domain: 'Advanced',
    skill: 'Quadratics',
    name: 'Viète with a parameter',
    missionName: 'Parameter Labyrinth',
    description: 'Find m from a condition on the roots — x₁² + x₂², |x₁ − x₂|, x₁ = kx₂, integer roots, a number between the roots — always with the Δ check.',
    prerequisites: ['math.algebra.vieta', 'math.adv.identities'],
    lesson:
      'Step 1: the condition for roots to exist (Δ ≥ 0, or Δ > 0 for two distinct roots). Step 2: Viète, S = x₁ + x₂ and P = x₁x₂ in terms of m. Step 3: rewrite the condition in S and P — (x₁ − x₂)² = S² − 4P; x₁ = kx₂ gives a system with S and P. Step 4: solve for m and throw away the values that break step 1. Integer roots: eliminate m between S and P and factor, e.g. (x₁ − 1)(x₂ − 1) = n. A number c lies strictly between the roots of f(x) = x² + px + q exactly when f(c) < 0. When minimising in m, the vertex may be outside the allowed range — then the answer is an end point.',
    examRefs: [`${EXAM[0]} · Định lí Vi-ét và ứng dụng`, `${EXAM[1]} · Phương trình bậc hai chứa tham số`],
  },
  {
    id: 'math.adv.combinatorics',
    domain: 'Advanced',
    skill: 'Combinatorics',
    name: 'Counting & pigeonhole',
    missionName: 'Pigeon Tower',
    description: 'Diagonals n(n − 3)/2, inclusion–exclusion, counting with restrictions (digits, committees), the pigeonhole principle.',
    prerequisites: ['math.combinatorics.counting', 'math.adv.number-theory'],
    lesson:
      'Diagonals of an n-gon: n(n − 3)/2; triangles from n points: n(n − 1)(n − 2)/6. Inclusion–exclusion: |A ∪ B| = |A| + |B| − |A ∩ B| — and "divisible by a and b" means divisible by lcm(a, b), not by ab. "At least one" is easiest as total minus "none". Digits: deal with the restricted places first (last digit, first digit ≠ 0) and split into cases when they interact. Pigeonhole: build the worst case — the most you can take without the property — then add 1.',
    examRefs: [`${EXAM[0]} · Tổ hợp`, `${EXAM[1]} · Nguyên lí Dirichlet, tổ hợp`],
  },
  {
    id: 'math.adv.geometry',
    domain: 'Advanced',
    skill: 'Geometry',
    name: 'Similar triangles & circle theorems',
    missionName: 'Circle of Secrets',
    description: 'Area ratio k² of similar triangles, power of a point (MT² = MA·MB, EA·EB = EC·ED), angle chasing with tangent–chord and inscribed angles.',
    prerequisites: ['math.geometry.circles', 'math.geometry.angles', 'math.geometry.pythagoras'],
    lesson:
      'Similar triangles with ratio k: lengths scale by k, areas by k². Two triangles sharing an angle: area ratio = product of the ratios of the sides around it. Power of a point: for chords meeting at E, EA·EB = EC·ED; from an outside point M, MA·MB = MC·MD = MT² (MT a tangent) — always measure from M to both intersection points. Angles: inscribed angle = half the central angle = the tangent–chord angle on the same arc; opposite angles of a cyclic quadrilateral add to 180°; a vertex inside the circle gives half the sum of the arcs, outside gives half the difference.',
    examRefs: [`${EXAM[0]} · Hình học phẳng`, `${EXAM[1]} · Hình học`],
  },
];

export const advancedGenerators: Record<string, Generator> = {
  'math.adv.number-theory': numberTheory,
  'math.adv.diophantine': diophantine,
  'math.adv.identities': identities,
  'math.adv.inequalities': inequalities,
  'math.adv.equations': equations,
  'math.adv.vieta': vietaParam,
  'math.adv.combinatorics': combinatorics,
  'math.adv.geometry': geometry,
};

export const advancedLessonsVi: Record<string, string> = {
  'math.adv.number-theory':
    'Làm việc với số dư: nếu a ≡ r (mod m) thì aⁿ ≡ rⁿ (mod m). Lũy thừa lặp lại theo chu kì — tìm lũy thừa đầu tiên chia dư 1, rồi viết n = qk + s. Chữ số tận cùng của lũy thừa lặp lại sau 4 bước. n³ − n = (n − 1)n(n + 1) là tích ba số nguyên liên tiếp nên luôn chia hết cho 6. Nếu N = pᵃ·qᵇ·rᶜ thì N có (a + 1)(b + 1)(c + 1) ước. ƯCLN(a, b)·BCNN(a, b) = a·b. Số nguyên tố lớn hơn 3 không chia hết cho 3 — hãy xét số dư khi chia cho 3.',
  'math.adv.diophantine':
    'Biến đổi phương trình thành dạng tích bằng một số: xy + px + qy = c trở thành (x + q)(y + p) = c + pq, rồi mỗi thừa số là một ước. Đếm ước cẩn thận — chỉ ước dương hay cả ước âm? Có trường hợp nào bị loại (thừa số bằng 1, hay x = 0)? Với số chính phương, đặt n² + k = m² rồi phân tích (m − n)(m + n) = k; hai thừa số cùng tính chẵn lẻ. 1/x + 1/y = 1/n trở thành (x − n)(y − n) = n².',
  'math.adv.identities':
    'Đừng giải tìm a, b — hãy biểu diễn biểu thức cần tính qua tổng và tích đã cho. a² + b² = (a + b)² − 2ab, (a − b)² = (a + b)² − 4ab, a³ + b³ = (a + b)³ − 3ab(a + b). Với x + 1/x = t: x² + 1/x² = t² − 2, x³ + 1/x³ = t³ − 3t, rồi nhân các lũy thừa thấp để được lũy thừa cao hơn. Với ba số: a² + b² + c² = (a + b + c)² − 2(ab + bc + ca) và a³ + b³ + c³ − 3abc = (a + b + c)(a² + b² + c² − ab − bc − ca). Nhận ra lập phương ẩn: x³ − 3x² + 3x − 1 = (x − 1)³.',
  'math.adv.inequalities':
    'Thêm bớt để tạo bình phương: A = (x − p)² + m ≥ m, dấu bằng khi x = p; với hai biến thì tạo nhiều bình phương. Bất đẳng thức Cô-si: với a, b ≥ 0, a + b ≥ 2√(ab), dấu bằng khi a = b — nên ax + b/x ≥ 2√(ab) với x > 0. Biến đổi cho phù hợp: x + k/(x − h) = (x − h) + k/(x − h) + h. Bất đẳng thức Bunhiacốpxki: (ax + by)² ≤ (a² + b²)(x² + y²) và p²/x + q²/y ≥ (p + q)²/(x + y). Luôn kiểm tra dấu bằng có xảy ra được không.',
  'math.adv.equations':
    'Với √A = B: đặt điều kiện B ≥ 0 rồi mới bình phương — và thử lại mọi nghiệm, vì bình phương có thể sinh nghiệm ngoại lai. Tìm cách đặt ẩn phụ: t = x² (t ≥ 0) cho x⁴ + bx² + c = 0; ghép (x + a)(x + d) và (x + b)(x + c) khi a + d = b + c; t = √(…) ≥ 0 khi cùng một biểu thức xuất hiện cả trong và ngoài căn. Với hệ đối xứng, đặt S = x + y, P = xy; x, y là số thực khi và chỉ khi S² ≥ 4P.',
  'math.adv.vieta':
    'Bước 1: điều kiện để phương trình có nghiệm (Δ ≥ 0, hoặc Δ > 0 nếu cần hai nghiệm phân biệt). Bước 2: viết S = x₁ + x₂ và P = x₁x₂ theo m bằng định lí Vi-ét. Bước 3: biến đổi điều kiện về S và P — (x₁ − x₂)² = S² − 4P; x₁ = kx₂ cho một hệ với S và P. Bước 4: giải tìm m rồi loại các giá trị không thỏa mãn bước 1. Nghiệm nguyên: khử m giữa S và P rồi phân tích thành tích, ví dụ (x₁ − 1)(x₂ − 1) = n. Số c nằm giữa hai nghiệm của f(x) = x² + px + q khi và chỉ khi f(c) < 0. Khi tìm cực trị theo m, đỉnh có thể nằm ngoài miền cho phép — khi đó đáp án ở đầu mút.',
  'math.adv.combinatorics':
    'Số đường chéo của đa giác n cạnh: n(n − 3)/2; số tam giác từ n điểm: n(n − 1)(n − 2)/6. Nguyên lí bù trừ: |A ∪ B| = |A| + |B| − |A ∩ B| — và "chia hết cho cả a và b" nghĩa là chia hết cho BCNN(a, b), không phải cho ab. "Ít nhất một" thường dễ đếm bằng tổng trừ đi trường hợp "không có". Bài lập số: xử lí các vị trí có điều kiện trước (chữ số tận cùng, chữ số đầu khác 0) và chia trường hợp khi chúng ảnh hưởng nhau. Nguyên lí Dirichlet: dựng trường hợp xấu nhất — lấy nhiều nhất mà chưa có tính chất cần tìm — rồi cộng thêm 1.',
  'math.adv.geometry':
    'Hai tam giác đồng dạng theo tỉ số k: độ dài tỉ lệ k, diện tích tỉ lệ k². Hai tam giác chung một góc: tỉ số diện tích bằng tích tỉ số hai cạnh kề góc đó. Phương tích của một điểm: hai dây cắt nhau tại E thì EA·EB = EC·ED; từ điểm M ở ngoài, MA·MB = MC·MD = MT² (MT là tiếp tuyến) — luôn đo từ M đến cả hai giao điểm. Góc: góc nội tiếp bằng nửa góc ở tâm và bằng góc tạo bởi tiếp tuyến và dây cung cùng chắn một cung; tứ giác nội tiếp có tổng hai góc đối bằng 180°; góc có đỉnh bên trong đường tròn bằng nửa tổng hai cung bị chắn, đỉnh bên ngoài bằng nửa hiệu.',
};
