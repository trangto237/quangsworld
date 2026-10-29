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
import { fracN, gcd, int, num, numeric, pick } from './util';

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

void [qf, qs, divisors]; // used by the concepts below as they are added

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
];

export const advancedGenerators: Record<string, Generator> = {
  'math.adv.number-theory': numberTheory,
};

export const advancedLessonsVi: Record<string, string> = {
  'math.adv.number-theory':
    'Làm việc với số dư: nếu a ≡ r (mod m) thì aⁿ ≡ rⁿ (mod m). Lũy thừa lặp lại theo chu kì — tìm lũy thừa đầu tiên chia dư 1, rồi viết n = qk + s. Chữ số tận cùng của lũy thừa lặp lại sau 4 bước. n³ − n = (n − 1)n(n + 1) là tích ba số nguyên liên tiếp nên luôn chia hết cho 6. Nếu N = pᵃ·qᵇ·rᶜ thì N có (a + 1)(b + 1)(c + 1) ước. ƯCLN(a, b)·BCNN(a, b) = a·b. Số nguyên tố lớn hơn 3 không chia hết cho 3 — hãy xét số dư khi chia cho 3.',
};
