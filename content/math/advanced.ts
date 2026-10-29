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
import { fracN, gcd, int, num, numeric, nz, pick, poly, signed, terms } from './util';

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

void [qs]; // used by the concepts below as they are added

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
    const [S, P] = ab();
    const [en, viG] = given(S, P);
    if (r() < 0.6)
      return q(r, `${en} Find a² + b².`, `${viG} Tính a² + b².`, S * S - 2 * P, [S * S, S * S - P, S * S + 2 * P, S - 2 * P],
        `a² + b² = (a + b)² − 2ab = ${p(S)}² − 2·${p(P)} = ${S * S - 2 * P}.`, `a² + b² = (a + b)² − 2ab = ${p(S)}² − 2·${p(P)} = ${S * S - 2 * P}.`);
    return q(r, `${en} Find (a − b)².`, `${viG} Tính (a − b)².`, S * S - 4 * P, [S * S - 2 * P, S * S + 4 * P, S * S, (S - P) ** 2],
      `(a − b)² = (a + b)² − 4ab = ${p(S)}² − 4·${p(P)} = ${S * S - 4 * P}.`, `(a − b)² = (a + b)² − 4ab = ${p(S)}² − 4·${p(P)} = ${S * S - 4 * P}.`);
  }
  if (d === 2) {
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
  if (d === 3) {
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
  if (d === 4) {
    const kind = pick(r, ['four', 'five', 'zero', 'ab4'] as const);
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
  // d5: three variables
  let a = 0, b = 0, c = 0;
  do {
    a = nz(r, -6, 7);
    b = nz(r, -6, 7);
    c = nz(r, -6, 7);
  } while (a + b + c === 0 || a * b + b * c + c * a === 0);
  const S = a + b + c, Q = a * b + b * c + c * a, R = a * b * c;
  const kind = pick(r, ['cube', 'pairs', 'recip'] as const);
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
];

export const advancedGenerators: Record<string, Generator> = {
  'math.adv.number-theory': numberTheory,
  'math.adv.diophantine': diophantine,
  'math.adv.identities': identities,
};

export const advancedLessonsVi: Record<string, string> = {
  'math.adv.number-theory':
    'Làm việc với số dư: nếu a ≡ r (mod m) thì aⁿ ≡ rⁿ (mod m). Lũy thừa lặp lại theo chu kì — tìm lũy thừa đầu tiên chia dư 1, rồi viết n = qk + s. Chữ số tận cùng của lũy thừa lặp lại sau 4 bước. n³ − n = (n − 1)n(n + 1) là tích ba số nguyên liên tiếp nên luôn chia hết cho 6. Nếu N = pᵃ·qᵇ·rᶜ thì N có (a + 1)(b + 1)(c + 1) ước. ƯCLN(a, b)·BCNN(a, b) = a·b. Số nguyên tố lớn hơn 3 không chia hết cho 3 — hãy xét số dư khi chia cho 3.',
  'math.adv.diophantine':
    'Biến đổi phương trình thành dạng tích bằng một số: xy + px + qy = c trở thành (x + q)(y + p) = c + pq, rồi mỗi thừa số là một ước. Đếm ước cẩn thận — chỉ ước dương hay cả ước âm? Có trường hợp nào bị loại (thừa số bằng 1, hay x = 0)? Với số chính phương, đặt n² + k = m² rồi phân tích (m − n)(m + n) = k; hai thừa số cùng tính chẵn lẻ. 1/x + 1/y = 1/n trở thành (x − n)(y − n) = n².',
  'math.adv.identities':
    'Đừng giải tìm a, b — hãy biểu diễn biểu thức cần tính qua tổng và tích đã cho. a² + b² = (a + b)² − 2ab, (a − b)² = (a + b)² − 4ab, a³ + b³ = (a + b)³ − 3ab(a + b). Với x + 1/x = t: x² + 1/x² = t² − 2, x³ + 1/x³ = t³ − 3t, rồi nhân các lũy thừa thấp để được lũy thừa cao hơn. Với ba số: a² + b² + c² = (a + b + c)² − 2(ab + bc + ca) và a³ + b³ + c³ − 3abc = (a + b + c)(a² + b² + c² − ab − bc − ca). Nhận ra lập phương ẩn: x³ − 3x² + 3x − 1 = (x − 1)³.',
};
