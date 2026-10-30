/**
 * Parametric question generators. Each produces a fresh, correct question at a
 * requested difficulty (1–5) from a seeded PRNG, so math missions never run out
 * of material and a question id can be regenerated exactly from its seed.
 */
import type { Figure } from '@atlas/shared';

export interface Generated {
  prompt: string;
  answer: string;
  distractors: string[];
  explanation?: string;
  /** Text read aloud (listening items). */
  audio?: string;
  /** A diagram drawn with the question (geometry). */
  figure?: Figure;
  passage?: string;
  /** The prompt and explanation in Vietnamese, when the generator writes them itself. */
  promptVi?: string;
  explanationVi?: string;
}

export type Generator = (difficulty: number, r: () => number) => Generated;

import { frac, int, num, nz, numeric, pick, pn, signed } from './util';
import { grade9Generators } from './grade9';
import { geometry9Generators } from './geometry9';
import { number9Generators } from './number9';
import { advancedGenerators } from './advanced';

const raw: Record<string, Generator> = {
  'math.number.integers': (d, r) => {
    if (d <= 1) {
      const a = int(r, 2, 9), b = int(r, 2, 9), c = int(r, 2, 9);
      return { prompt: `${a} + ${b} × ${c} = ?`, ...numeric(a + b * c, [(a + b) * c, a * b + c], r) };
    }
    if (d === 2) {
      const a = nz(r, -12, 12), b = nz(r, -12, 12);
      return { prompt: `(${a}) − (${b}) = ?`, ...numeric(a - b, [a + b, b - a, -a - b], r) };
    }
    if (d === 3) {
      const a = nz(r, -9, 9), b = nz(r, -9, 9);
      return { prompt: `(${a}) × (${b}) = ?`, ...numeric(a * b, [-a * b, a + b], r) };
    }
    const a = int(r, 2, 6), b = int(r, 2, 6), c = int(r, 1, 9), e = int(r, 2, 4);
    const ans = (a + b) ** 2 - c * e;
    return {
      prompt: `(${a} + ${b})² − ${c} × ${e} = ?`,
      ...numeric(ans, [a * a + b * b - c * e, ((a + b) ** 2 - c) * e, (a + b) * 2 - c * e], r),
      explanation: 'Brackets first, then the power, then multiplication, then subtraction.',
    };
  },

  'math.number.fractions': (d, r) => {
    if (d <= 2) {
      const den = int(r, 3, 9), a = int(r, 1, den - 1), b = int(r, 1, den - 1);
      return {
        prompt: `${a}/${den} + ${b}/${den} = ?`,
        answer: frac(a + b, den),
        distractors: [`${a + b}/${den * 2}`, frac(a * b, den), frac(a + b + 1, den)].filter((x) => x !== frac(a + b, den)),
      };
    }
    if (d === 3) {
      const b = int(r, 2, 6), dd = int(r, 2, 6), a = int(r, 1, b), c = int(r, 1, dd);
      const ans = frac(a * dd + c * b, b * dd);
      return {
        prompt: `${a}/${b} + ${c}/${dd} = ?`,
        answer: ans,
        distractors: [frac(a + c, b + dd), frac(a * c, b * dd), frac(a * dd + c * b + 1, b * dd)].filter((x) => x !== ans),
        explanation: 'Use a common denominator before adding.',
      };
    }
    const a = int(r, 1, 7), b = int(r, 2, 9), c = int(r, 1, 7), e = int(r, 2, 9);
    const op = d === 4 ? '×' : '÷';
    const ans = op === '×' ? frac(a * c, b * e) : frac(a * e, b * c);
    return {
      prompt: `${a}/${b} ${op} ${c}/${e} = ?`,
      answer: ans,
      distractors: [op === '×' ? frac(a * e, b * c) : frac(a * c, b * e), frac(a + c, b + e), frac(a * c + 1, b * e)].filter((x) => x !== ans),
      explanation: op === '÷' ? 'Dividing by a fraction = multiplying by its reciprocal.' : 'Multiply numerators and denominators.',
    };
  },

  'math.number.percent': (d, r) => {
    if (d <= 2) {
      const p = pick(r, [10, 20, 25, 50, 75]), n = int(r, 2, 20) * 20;
      return { prompt: `What is ${p}% of ${n}?`, ...numeric((p * n) / 100, [n / p, (p * n) / 10, n - (p * n) / 100], r) };
    }
    if (d <= 4) {
      const p = pick(r, [5, 10, 15, 20, 30, 40]), n = int(r, 2, 30) * 10;
      const up = r() < 0.5;
      const ans = up ? n * (1 + p / 100) : n * (1 - p / 100);
      return {
        prompt: `A price of ${n} is ${up ? 'increased' : 'decreased'} by ${p}%. What is the new price?`,
        ...numeric(ans, [up ? n * (1 - p / 100) : n * (1 + p / 100), n + (up ? p : -p), (n * p) / 100], r),
      };
    }
    const orig = int(r, 4, 20) * 10, p = pick(r, [20, 25, 50]);
    const now = orig * (1 + p / 100);
    return {
      prompt: `After a ${p}% increase, a bike costs ${now}. What was the original price?`,
      ...numeric(orig, [now * (1 - p / 100), now - p, now / (p / 10)], r),
      explanation: `Original × ${1 + p / 100} = ${now}, so divide by ${1 + p / 100}.`,
    };
  },

  'math.number.powers': (d, r) => {
    if (d <= 1) {
      const n = int(r, 2, 12);
      return { prompt: `${n}² = ?`, ...numeric(n * n, [n * 2, n * n + n, (n - 1) * (n - 1)], r) };
    }
    if (d === 2) {
      const n = int(r, 2, 15);
      return { prompt: `√${n * n} = ?`, ...numeric(n, [n * n / 2, n + 1, n * 2], r) };
    }
    if (d === 3) {
      const n = int(r, 2, 5);
      return { prompt: `${n}³ = ?`, ...numeric(n ** 3, [n * 3, n ** 2, n ** 3 + n], r) };
    }
    const a = int(r, 2, 7), b = int(r, 2, 7);
    const answer = d === 4 ? `x^${a + b}` : `x^${a * b}`;
    const cands = d === 4 ? [`x^${a * b}`, `2x^${a + b}`, `x^${a + b + 1}`, `x^${Math.abs(a - b) + 1}`] : [`x^${a + b}`, `x^${a ** b}`, `${b}x^${a}`, `x^${a * b + 1}`];
    return {
      prompt: d === 4 ? `Simplify: x^${a} × x^${b}` : `Simplify: (x^${a})^${b}`,
      answer,
      distractors: [...new Set(cands.filter((c) => c !== answer))].slice(0, 3),
      explanation: d === 4 ? 'Multiply same base → add the powers.' : 'Power of a power → multiply the powers.',
    };
  },

  'math.algebra.linear': (d, r) => {
    const x = nz(r, d <= 2 ? 1 : -9, 12);
    if (d <= 1) {
      const b = int(r, 1, 20);
      return {
        prompt: `Solve: x + ${b} = ${x + b}`,
        ...numeric(x, [x + 2 * b, b, -x], r),
        explanation: `Get x on its own: undo "+ ${b}" by subtracting ${b} from both sides.\nx = ${x + b} − ${b} = ${x}.\nCareful: subtract ${b}, don't add it.`,
        explanationVi: `Đưa x về một mình một vế: bỏ "+ ${b}" bằng cách trừ cả hai vế cho ${b}.\nx = ${x + b} − ${b} = ${x}.\nChú ý: phải trừ ${b}, không phải cộng.`,
      };
    }
    if (d === 2) {
      const a = int(r, 2, 9), b = int(r, 1, 15);
      return {
        prompt: `Solve: ${a}x + ${b} = ${a * x + b}`,
        ...numeric(x, [(a * x + b + b) / a, a * x, x + 1], r),
        explanation: `Undo the steps in reverse order. First subtract ${b} from both sides: ${a}x = ${a * x + b} − ${b} = ${a * x}.\nThen ${a}x means ${a} × x, so divide both sides by ${a}: x = ${a * x} ÷ ${a} = ${x}.\nCheck: ${a}·${x} + ${b} = ${a * x + b} ✓.`,
        explanationVi: `Làm ngược lại từng bước. Trước hết trừ cả hai vế cho ${b}: ${a}x = ${a * x + b} − ${b} = ${a * x}.\n${a}x là ${a} nhân x, nên chia cả hai vế cho ${a}: x = ${a * x} : ${a} = ${x}.\nThử lại: ${a}·${x} + ${b} = ${a * x + b} ✓.`,
      };
    }
    if (d === 3) {
      const a = int(r, 2, 9), b = nz(r, -15, 15);
      return {
        prompt: `Solve: ${a}x ${signed(b)} = ${a * x + b}`,
        ...numeric(x, [(a * x + 2 * b) / a, -x, x + b], r),
        explanation: `Move ${num(b)} to the right side; a term changes its sign when it crosses "=": ${a}x = ${num(a * x + b)} ${signed(-b)} = ${num(a * x)}.\nDivide both sides by ${a}: x = ${num(a * x)} ÷ ${a} = ${num(x)}.\nCheck: ${a}·${pn(x)} ${signed(b)} = ${num(a * x + b)} ✓.`,
        explanationVi: `Chuyển ${num(b)} sang vế phải; chuyển vế thì đổi dấu: ${a}x = ${num(a * x + b)} ${signed(-b)} = ${num(a * x)}.\nChia cả hai vế cho ${a}: x = ${num(a * x)} : ${a} = ${num(x)}.\nThử lại: ${a}·${pn(x)} ${signed(b)} = ${num(a * x + b)} ✓.`,
      };
    }
    const a = int(r, 3, 9), c = int(r, 1, a - 1), b = nz(r, -10, 10);
    const rhsConst = a * x + b - c * x;
    const ans = x;
    return {
      prompt: `Solve: ${a}x ${signed(b)} = ${c}x ${signed(rhsConst)}`,
      ...numeric(ans, [(rhsConst - b) / (a + c), -ans, (rhsConst + b) / (a - c)], r, (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2))),
      explanation: `Collect the x terms on the left and the numbers on the right (a term changes sign when it crosses "="): ${a}x − ${c === 1 ? '' : c}x = ${num(rhsConst)} ${signed(-b)}.\n${a - c === 1 ? 'x' : `${a - c}x`} = ${num(rhsConst - b)}.${a - c === 1 ? '' : `\nDivide both sides by ${a - c}: x = ${num(rhsConst - b)} ÷ ${a - c} = ${num(x)}.`}\nCareful: ${c === 1 ? '' : c}x moves to the left as −${c === 1 ? '' : c}x, so the x terms are subtracted, not added.`,
      explanationVi: `Chuyển các hạng tử chứa x sang vế trái, các số sang vế phải (chuyển vế thì đổi dấu): ${a}x − ${c === 1 ? '' : c}x = ${num(rhsConst)} ${signed(-b)}.\n${a - c === 1 ? 'x' : `${a - c}x`} = ${num(rhsConst - b)}.${a - c === 1 ? '' : `\nChia cả hai vế cho ${a - c}: x = ${num(rhsConst - b)} : ${a - c} = ${num(x)}.`}\nChú ý: ${c === 1 ? '' : c}x chuyển sang trái thành −${c === 1 ? '' : c}x, nên trừ chứ không cộng.`,
    };
  },

  'math.geometry.angles': (d, r) => {
    if (d <= 2) {
      const a = int(r, 30, 80), b = int(r, 30, 80);
      return {
        prompt: `Two angles of a triangle are ${a}° and ${b}°. Find the third angle (in degrees).`,
        ...numeric(180 - a - b, [360 - a - b, a + b, 90 - a], r),
        figure: { kind: 'triangle', angles: [a, b, 180 - a - b], ask: 2 },
      };
    }
    if (d === 3) {
      const a = int(r, 20, 160);
      return {
        prompt: `Angles on a straight line: one is ${a}°. Find the other (in degrees).`,
        ...numeric(180 - a, [360 - a, 90 - a, a], r),
        figure: { kind: 'line-angles', angle: a, ask: 1 },
      };
    }
    const n = int(r, 5, 12);
    if (d === 4)
      return {
        prompt: `What is the sum of interior angles of a ${n}-sided polygon (in degrees)?`,
        ...numeric((n - 2) * 180, [n * 180, (n - 1) * 180, 360], r),
        figure: { kind: 'polygon', sides: n },
      };
    return {
      prompt: `Each interior angle of a regular ${n}-gon is how many degrees? (round to 1 d.p. if needed)`,
      ...numeric(Math.round(((n - 2) * 1800) / n) / 10, [360 / n, 180 - (n - 2), (n * 180) / (n - 2)], r, (v) => String(Math.round(v * 10) / 10)),
      figure: { kind: 'polygon', sides: n, askAngle: true },
    };
  },

  'math.geometry.area': (d, r) => {
    const a = int(r, 3, 15), b = int(r, 3, 15), h = int(r, 2, 12) * 2;
    if (d <= 1) return { prompt: `A rectangle is ${a} cm by ${b} cm. Find its area (cm²).`, ...numeric(a * b, [2 * (a + b), a + b, a * b * 2], r), figure: { kind: 'rect', w: a, h: b, unit: 'cm' } };
    if (d === 2) return { prompt: `A rectangle is ${a} cm by ${b} cm. Find its perimeter (cm).`, ...numeric(2 * (a + b), [a * b, a + b, 4 * a], r), figure: { kind: 'rect', w: a, h: b, unit: 'cm' } };
    if (d <= 4)
      return {
        prompt: `A triangle has base ${a} cm and height ${h} cm. Find its area (cm²).`,
        ...numeric((a * h) / 2, [a * h, a + h, (a * h) / 4], r),
        figure: { kind: 'tri-area', base: a, height: h, unit: 'cm' },
      };
    return {
      prompt: `A trapezium has parallel sides ${a} cm and ${b} cm, and height ${h} cm. Find its area (cm²).`,
      ...numeric(((a + b) * h) / 2, [(a + b) * h, a * b * h, (a * h) / 2], r),
      figure: { kind: 'trapezium', a: Math.min(a, b), b: Math.max(a, b), h, unit: 'cm' },
    };
  },

  'math.geometry.pythagoras': (d, r) => {
    const triples = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25], [20, 21, 29]];
    const [a, b, c] = pick(r, d <= 3 ? triples.slice(0, 4) : triples);
    if (d <= 3)
      return {
        prompt: `A right triangle has legs ${a} and ${b}. How long is the hypotenuse?`,
        ...numeric(c, [a + b, (a * b) / 2, c + 1], r),
        figure: { kind: 'right-triangle', a, b, c, ask: 'c' },
      };
    return {
      prompt: `A right triangle has hypotenuse ${c} and one leg ${a}. How long is the other leg?`,
      ...numeric(b, [c - a, c + a, b + 2], r),
      explanation: `b² = ${c}² − ${a}²`,
      figure: { kind: 'right-triangle', a, b, c, ask: 'b' },
    };
  },

  'math.geometry.circles': (d, r) => {
    const rad = int(r, 1, 10);
    const f = (n: number) => String(Math.round(n * 100) / 100);
    const figure: Figure = { kind: 'circle', r: rad };
    if (d <= 3) return { prompt: `Circumference of a circle with radius ${rad} (use π = 3.14)?`, ...numeric(2 * 3.14 * rad, [3.14 * rad, 3.14 * rad * rad, 2 * 3.14 * rad + 1], r, f), figure };
    return { prompt: `Area of a circle with radius ${rad} (use π = 3.14)?`, ...numeric(3.14 * rad * rad, [2 * 3.14 * rad, 3.14 * rad, 3.14 * rad * rad * 2], r, f), figure };
  },

  'math.stats.average': (d, r) => {
    const n = d <= 2 ? 4 : 5;
    const mean = int(r, 3, 15);
    const vals = Array.from({ length: n - 1 }, () => int(r, 1, 20));
    vals.push(mean * n - vals.reduce((s, v) => s + v, 0));
    if (vals[n - 1] < 0) vals[n - 1] = 0;
    const total = vals.reduce((s, v) => s + v, 0);
    if (d <= 3) return { prompt: `Find the mean of: ${vals.join(', ')}`, ...numeric(total / n, [total, total / (n - 1), [...vals].sort((a, b) => a - b)[Math.floor(n / 2)]], r, (v) => String(Math.round(v * 100) / 100)) };
    const sorted = [...vals].sort((a, b) => a - b);
    return { prompt: `Find the median of: ${vals.join(', ')}`, ...numeric(sorted[Math.floor(n / 2)], [vals[Math.floor(n / 2)], total / n, sorted[0]], r, (v) => String(Math.round(v * 100) / 100)), explanation: 'Sort first, then take the middle value.' };
  },

  'math.stats.probability': (d, r) => {
    if (d <= 2) {
      const red = int(r, 1, 6), blue = int(r, 1, 6);
      return { prompt: `A bag has ${red} red and ${blue} blue balls. P(red) = ?`, answer: frac(red, red + blue), distractors: [frac(blue, red + blue), `${red}/${blue}`, frac(1, red + blue)].filter((x) => x !== frac(red, red + blue)) };
    }
    if (d <= 4) return { prompt: 'Two fair coins are tossed. P(two heads) = ?', answer: '1/4', distractors: ['1/2', '1/3', '3/4'] };
    const s = int(r, 2, 11);
    const ways = 6 - Math.abs(7 - s);
    return { prompt: `Two dice are rolled. P(sum = ${s}) = ?`, answer: frac(ways, 36), distractors: [frac(1, 11), frac(ways, 12), frac(ways + 1, 36)].filter((x) => x !== frac(ways, 36)) };
  },

  'math.combinatorics.counting': (d, r) => {
    if (d <= 2) {
      const a = int(r, 2, 6), b = int(r, 2, 5);
      return { prompt: `You have ${a} shirts and ${b} pairs of trousers. How many different outfits?`, ...numeric(a * b, [a + b, a * b - 1, 2 * a], r) };
    }
    if (d <= 3) {
      const n = int(r, 3, 6);
      const f = [1, 1, 2, 6, 24, 120, 720][n];
      return { prompt: `In how many ways can ${n} friends stand in a line?`, ...numeric(f, [n * n, n * (n - 1), f / 2], r) };
    }
    const n = int(r, 4, 12);
    return { prompt: `${n} players each shake hands once with every other player. How many handshakes?`, ...numeric((n * (n - 1)) / 2, [n * (n - 1), n * n, n], r) };
  },

  'math.reasoning.word-problems': (d, r) => {
    if (d <= 2) {
      const pens = int(r, 2, 9), price = int(r, 3, 15) * 1000;
      return {
        prompt: `Lan buys ${pens} pens at ${price.toLocaleString('en')} VND each. How much does she pay (VND)?`,
        ...numeric(pens * price, [pens + price, pens * price + price, (pens - 1) * price], r, (v) => v.toLocaleString('en')),
        explanation: `Total cost = number of pens × price of one pen.\n${pens} × ${price.toLocaleString('en')} = ${(pens * price).toLocaleString('en')} VND.`,
        explanationVi: `Số tiền = số bút × giá một cây bút.\n${pens} × ${price.toLocaleString('en').replace(/,/g, '.')} = ${(pens * price).toLocaleString('en').replace(/,/g, '.')} đồng.`,
      };
    }
    if (d <= 3) {
      const x = int(r, 3, 20), k = int(r, 2, 4);
      return {
        prompt: `Minh is ${k} times as old as his sister. Together they are ${x * (k + 1)} years old. How old is the sister?`,
        ...numeric(x, [x * k, (x * (k + 1)) / k, x + k], r),
        explanation: `Let the sister's age be x. Minh is ${k} times as old, so he is ${k}x.\nTogether: x + ${k}x = ${k + 1}x = ${x * (k + 1)}.\nx = ${x * (k + 1)} ÷ ${k + 1} = ${x}. The sister is ${x} (and Minh ${x * k}).\nCareful: divide by ${k + 1} (the sister counts as 1 part, Minh as ${k} parts), not by ${k}.`,
        explanationVi: `Gọi tuổi em gái là x. Minh gấp ${k} lần tuổi em nên Minh ${k}x tuổi.\nCả hai: x + ${k}x = ${k + 1}x = ${x * (k + 1)}.\nx = ${x * (k + 1)} : ${k + 1} = ${x}. Em gái ${x} tuổi (Minh ${x * k} tuổi).\nChú ý: chia cho ${k + 1} (em là 1 phần, Minh là ${k} phần), không chia cho ${k}.`,
      };
    }
    if (d <= 4) {
      const speed = int(r, 4, 12) * 5, t = int(r, 2, 5);
      return {
        prompt: `A train travels at ${speed} km/h for ${t} hours and then ${speed + 10} km/h for 1 hour. Total distance (km)?`,
        ...numeric(speed * t + speed + 10, [speed * (t + 1), speed * t, (speed + 10) * (t + 1)], r),
        explanation: `Distance = speed × time, worked out for each part of the trip.\nPart 1: ${speed} × ${t} = ${speed * t} km. Part 2: ${speed + 10} × 1 = ${speed + 10} km.\nTotal: ${speed * t} + ${speed + 10} = ${speed * t + speed + 10} km.`,
        explanationVi: `Quãng đường = vận tốc × thời gian, tính cho từng đoạn.\nĐoạn 1: ${speed} × ${t} = ${speed * t} km. Đoạn 2: ${speed + 10} × 1 = ${speed + 10} km.\nTổng: ${speed * t} + ${speed + 10} = ${speed * t + speed + 10} km.`,
      };
    }
    const w = int(r, 3, 10), l = w + int(r, 2, 6);
    return {
      prompt: `A rectangle's length is ${l - w} cm more than its width. Its perimeter is ${2 * (l + w)} cm. Find the width (cm).`,
      ...numeric(w, [l, (l + w) / 2, w + 1], r),
      explanation: `Perimeter = 2 × (length + width), so length + width = ${2 * (l + w)} ÷ 2 = ${l + w}.\nLet the width be x; the length is x + ${l - w}: x + x + ${l - w} = ${l + w}.\n2x = ${l + w} − ${l - w} = ${2 * w}, so x = ${2 * w} ÷ 2 = ${w} cm.`,
      explanationVi: `Chu vi = 2 × (dài + rộng), nên dài + rộng = ${2 * (l + w)} : 2 = ${l + w}.\nGọi chiều rộng là x; chiều dài là x + ${l - w}: x + x + ${l - w} = ${l + w}.\n2x = ${l + w} − ${l - w} = ${2 * w}, nên x = ${2 * w} : 2 = ${w} cm.`,
    };
  },
};

/** Removes duplicate distractors and any that equal the answer (e.g. 2 × 2 = 2 + 2). */
export function sanitize(g: Generated): Generated {
  return { ...g, distractors: [...new Set(g.distractors.filter((x) => x !== g.answer))].slice(0, 3) };
}

export const generators: Record<string, Generator> = Object.fromEntries(
  Object.entries({ ...raw, ...grade9Generators, ...geometry9Generators, ...number9Generators, ...advancedGenerators }).map(([id, gen]) => [id, (d: number, r: () => number) => sanitize(gen(d, r))]),
);
