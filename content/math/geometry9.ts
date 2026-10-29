/**
 * Grade 9 geometry (Toán 9, 2018 programme) and the grade-10 entrance exam (Vào 10 Hà Nội): Pythagoras with a
 * real step, composite areas, angle chasing, circles in π, trigonometric ratios, the relations in a right
 * triangle with an altitude, angles in a circle, tangents and chords, arcs and sectors, and solids. Every
 * generator writes its prompt and explanation in English and Vietnamese; answers are exact (π, √, fractions)
 * or carry a stated rounding; distractors come from real mistakes; difficulty 5 is entrance-exam level.
 */
import type { ConceptSeed } from '../helpers';
import type { Figure } from '@atlas/shared';
import type { Generated, Generator } from './generators';
import { fracN, gcd, int, num, pick, rad } from './util';

type G = Generated;
const vi = (g: G, promptVi: string, explanationVi: string): G => ({ ...g, promptVi, explanationVi });

// ── Exact values: a display string with its numeric value ───────────────
interface Q {
  s: string;
  v: number;
}
const q = (s: string, v: number): Q => ({ s, v });
const qn = (n: number) => q(num(n), n);
const qf = (n: number, d: number) => q(fracN(n, d), n / d);
const qdeg = (n: number) => q(`${n}°`, n);
/** n = c²·s with s square-free. */
export function simp(n: number): [number, number] {
  let c = 1, s = n;
  for (let k = 2; k * k <= s; k++)
    while (s % (k * k) === 0) {
      s /= k * k;
      c *= k;
    }
  return [c, s];
}
/** √n in simplest form: √20 = 2√5, √36 = 6. */
const qroot = (n: number) => {
  const [c, s] = simp(n);
  return q(rad(c, s), Math.sqrt(n));
};
/** (p/q)·√s, e.g. 6√13/13. */
const qradf = (p: number, d: number, s: number) => {
  const g = gcd(p, d);
  const [a, b] = [p / g, d / g];
  return q(`${rad(a, s)}${b === 1 ? '' : `/${b}`}`, (p / d) * Math.sqrt(s));
};
/** (n/d)·π: 3π, π/2, 5π/3. */
const qpi = (n: number, d = 1) => {
  const g = gcd(n, d);
  const [a, b] = [n / g, d / g];
  return q(`${a === 1 ? '' : num(a)}π${b === 1 ? '' : `/${b}`}`, (n / d) * Math.PI);
};
const minus = (a: Q, b: Q) => q(`${a.s} − ${b.s}`, a.v - b.v);
const plus = (a: Q, b: Q) => q(`${a.s} + ${b.s}`, a.v + b.v);
/** Rounded to k decimal places (the value is the rounded value). */
const qdp = (x: number, k: number) => q(x.toFixed(k), Number(x.toFixed(k)));
/** Decimal comma for the Vietnamese text. */
const viN = (s: string) => s.replace(/(\d)\.(\d)/g, '$1,$2');

/** Answer and distractors: mistakes first, keeping only positive values different from the answer and each other. */
function choose(ans: Q, cands: Q[], allowNegative = false): Pick<G, 'answer' | 'distractors'> {
  const out: Q[] = [];
  for (const c of cands) {
    if (!Number.isFinite(c.v) || (!allowNegative && c.v <= 0)) continue;
    if (Math.abs(c.v - ans.v) < 1e-9 || c.s === ans.s) continue;
    if (out.some((o) => o.s === c.s || Math.abs(o.v - c.v) < 1e-9)) continue;
    out.push(c);
    if (out.length === 3) break;
  }
  return { answer: ans.s, distractors: out.map((o) => o.s) };
}
/** Degree answers: mistakes, then nearby angles. */
const chooseDeg = (ans: number, mistakes: number[]) => choose(qdeg(ans), [...mistakes, ans + 10, ans - 10, ans + 20, ans - 20].filter((x) => x > 0 && x < 360 && Number.isInteger(x)).map(qdeg));

const TRIPLES: [number, number, number][] = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [12, 35, 37], [9, 40, 41]];
/** Pythagorean triples (scaled) with hypotenuse ≤ max, legs in both orders. */
const triples = (max: number) => {
  const out: [number, number, number][] = [];
  for (const [a, b, c] of TRIPLES) for (let k = 1; k * c <= max; k++) out.push([a * k, b * k, c * k], [b * k, a * k, c * k]);
  return out;
};
const isSq = (n: number) => Number.isInteger(Math.sqrt(n));
/** Other legs x such that leg² + x² is a perfect square. */
const partners = (leg: number, max = 60) => {
  const out: number[] = [];
  for (let x = 1; x <= max; x++) if (isSq(leg * leg + x * x)) out.push(x);
  return out;
};
const rt = (a: number, b: number, c: number, ask: 'a' | 'b' | 'c'): Figure => ({ kind: 'right-triangle', a, b, c, ask });

// ── Pythagoras ───────────────────────────────────────────────────────
const pythagoras: Generator = (d, r) => {
  if (d <= 1) {
    let a = 0, b = 0;
    do {
      a = int(r, 1, 9);
      b = int(r, 2, 10);
    } while (isSq(a * a + b * b));
    const ans = qroot(a * a + b * b);
    return vi(
      {
        prompt: `A right triangle has legs ${a} cm and ${b} cm. Find the hypotenuse (cm), in simplest radical form.`,
        ...choose(ans, [qroot(Math.abs(b * b - a * a)), qn(a + b), qn(a * a + b * b), qroot(a + b), qroot(2 * (a * a + b * b))]),
        explanation: `c² = ${a}² + ${b}² = ${a * a + b * b}, so c = √${a * a + b * b}${ans.s.startsWith('√') ? '' : ` = ${ans.s}`}.`,
        figure: rt(a, b, ans.v, 'c'),
      },
      `Một tam giác vuông có hai cạnh góc vuông ${a} cm và ${b} cm. Tính cạnh huyền (cm), viết dưới dạng căn thức tối giản.`,
      `c² = ${a}² + ${b}² = ${a * a + b * b}, nên c = √${a * a + b * b}${ans.s.startsWith('√') ? '' : ` = ${ans.s}`}.`,
    );
  }
  if (d === 2) {
    let c = 0, a = 0;
    do {
      c = int(r, 4, 12);
      a = int(r, 1, c - 1);
    } while (isSq(c * c - a * a));
    const ans = qroot(c * c - a * a);
    return vi(
      {
        prompt: `A right triangle has hypotenuse ${c} cm and one leg ${a} cm. Find the other leg (cm), in simplest radical form.`,
        ...choose(ans, [qroot(c * c + a * a), qn(c - a), qn(c * c - a * a), qroot(2 * (c * c - a * a))]),
        explanation: `The hypotenuse is the longest side, so subtract: b² = ${c}² − ${a}² = ${c * c - a * a}, b = √${c * c - a * a}${ans.s.startsWith('√') ? '' : ` = ${ans.s}`}.`,
        figure: rt(a, ans.v, c, 'b'),
      },
      `Một tam giác vuông có cạnh huyền ${c} cm và một cạnh góc vuông ${a} cm. Tính cạnh góc vuông còn lại (cm), viết dưới dạng căn thức tối giản.`,
      `Cạnh huyền là cạnh lớn nhất nên phải trừ: b² = ${c}² − ${a}² = ${c * c - a * a}, b = √${c * c - a * a}${ans.s.startsWith('√') ? '' : ` = ${ans.s}`}.`,
    );
  }
  if (d === 3) {
    const [k, h, s] = pick(r, triples(30));
    if (r() < 0.5)
      return vi(
        {
          prompt: `An isosceles triangle has two equal sides ${s} cm and base ${2 * k} cm. Find its area (cm²).`,
          ...choose(qn(k * h), [qn(2 * k * h), qn(k * s), qn(2 * k * s), qn(k * h + k)]),
          explanation: `The height from the apex meets the base at its midpoint: h² = ${s}² − ${k}² = ${h * h}, h = ${h}. Area = ½ × ${2 * k} × ${h} = ${k * h}.`,
          figure: rt(h, k, s, 'a'),
        },
        `Một tam giác cân có hai cạnh bên bằng ${s} cm và cạnh đáy ${2 * k} cm. Tính diện tích tam giác (cm²).`,
        `Đường cao kẻ từ đỉnh đi qua trung điểm cạnh đáy: h² = ${s}² − ${k}² = ${h * h}, h = ${h}. Diện tích = ½ × ${2 * k} × ${h} = ${k * h}.`,
      );
    return vi(
      {
        prompt: `A rhombus has diagonals ${2 * k} cm and ${2 * h} cm. Find its perimeter (cm).`,
        ...choose(qn(4 * s), [qn(s), qn(8 * s), qn(4 * (k + h)), qn(2 * (k + h))]),
        explanation: `The diagonals bisect each other at right angles, so a side is √(${k}² + ${h}²) = ${s}. Perimeter = 4 × ${s} = ${4 * s}.`,
        figure: rt(k, h, s, 'c'),
      },
      `Một hình thoi có hai đường chéo dài ${2 * k} cm và ${2 * h} cm. Tính chu vi hình thoi (cm).`,
      `Hai đường chéo vuông góc với nhau tại trung điểm mỗi đường, nên cạnh = √(${k}² + ${h}²) = ${s}. Chu vi = 4 × ${s} = ${4 * s}.`,
    );
  }
  if (d === 4) {
    const h = pick(r, [12, 15, 20, 24]);
    const xs = partners(h, 40);
    const x1 = pick(r, xs);
    const x2 = pick(r, xs.filter((x) => x !== x1));
    const c1 = Math.sqrt(h * h + x1 * x1), c2 = Math.sqrt(h * h + x2 * x2);
    return vi(
      {
        prompt: `Triangle ABC has altitude AH = ${h} cm, with H between B and C. AB = ${c1} cm and AC = ${c2} cm. Find BC (cm).`,
        ...choose(qn(x1 + x2), [qn(Math.abs(x1 - x2)), qroot(c1 * c1 + c2 * c2), qn(x1), qn(c1 + c2 - h)]),
        explanation: `Use Pythagoras in the two right triangles: BH = √(${c1}² − ${h}²) = ${x1}, CH = √(${c2}² − ${h}²) = ${x2}. BC = BH + CH = ${x1 + x2}. (ABC itself is not right-angled.)`,
        figure: rt(h, x1, c1, 'b'),
      },
      `Tam giác ABC có đường cao AH = ${h} cm, H nằm giữa B và C. AB = ${c1} cm, AC = ${c2} cm. Tính BC (cm).`,
      `Áp dụng định lí Pythagore cho hai tam giác vuông: BH = √(${c1}² − ${h}²) = ${x1}, CH = √(${c2}² − ${h}²) = ${x2}. BC = BH + CH = ${x1 + x2}. (Tam giác ABC không vuông.)`,
    );
  }
  if (r() < 0.5) {
    const [off, h, l] = pick(r, triples(30));
    const a = int(r, 4, 14), b = a + 2 * off;
    const area = ((a + b) / 2) * h;
    return vi(
      {
        prompt: `An isosceles trapezium has parallel sides ${a} cm and ${b} cm, and each slanted side is ${l} cm. Find its area (cm²).`,
        ...choose(qn(area), [qn((a + b) * h), qn(((a + b) / 2) * l), qn(b * h), qn(((a + b) / 2) * off)]),
        explanation: `Drop heights from the ends of the short side: each cuts off (${b} − ${a}) ÷ 2 = ${off} cm. h = √(${l}² − ${off}²) = ${h}. Area = ½ × (${a} + ${b}) × ${h} = ${area}.`,
        figure: rt(h, off, l, 'a'),
      },
      `Một hình thang cân có hai đáy ${a} cm và ${b} cm, mỗi cạnh bên dài ${l} cm. Tính diện tích hình thang (cm²).`,
      `Kẻ hai đường cao từ hai đầu đáy nhỏ: mỗi đoạn bị cắt ra dài (${b} − ${a}) : 2 = ${off} cm. h = √(${l}² − ${off}²) = ${h}. Diện tích = ½ × (${a} + ${b}) × ${h} = ${area}.`,
    );
  }
  // Sliding ladder: two triples with the same hypotenuse.
  const legsOf = (L: number) => Array.from({ length: L - 1 }, (_, i) => i + 1).filter((x) => isSq(L * L - x * x));
  const L = pick(r, [5, 10, 13, 15, 17, 20, 25, 26, 29, 30]);
  const legs = legsOf(L);
  const i = int(r, 0, legs.length - 2), j = int(r, i + 1, legs.length - 1);
  const x1 = legs[i], x2 = legs[j];
  const y1 = Math.sqrt(L * L - x1 * x1), y2 = Math.sqrt(L * L - x2 * x2);
  return vi(
    {
      prompt: `A ${L} m ladder leans against a vertical wall with its foot ${x1} m from the wall. The foot slides ${x2 - x1} m further away. How far does the top slide down (m)?`,
      ...choose(qn(y1 - y2), [qn(x2 - x1), qn(y2), qn(y1), qn(L - y2)]),
      explanation: `Before: the top is √(${L}² − ${x1}²) = ${y1} m high. After: the foot is ${x2} m out, the top √(${L}² − ${x2}²) = ${y2} m high. It slides ${y1} − ${y2} = ${y1 - y2} m.`,
      figure: rt(y1, x1, L, 'a'),
    },
    `Một chiếc thang dài ${L} m dựa vào bức tường thẳng đứng, chân thang cách tường ${x1} m. Chân thang trượt ra xa thêm ${x2 - x1} m. Hỏi đầu thang trượt xuống bao nhiêu mét?`,
    `Lúc đầu, đầu thang cao √(${L}² − ${x1}²) = ${y1} m. Lúc sau chân thang cách tường ${x2} m, đầu thang cao √(${L}² − ${x2}²) = ${y2} m. Đầu thang trượt xuống ${y1} − ${y2} = ${y1 - y2} m.`,
  );
};

// ── Areas of composite shapes and polygons ───────────────────────────────
const area: Generator = (d, r) => {
  if (d <= 1) {
    const w = int(r, 8, 20), h = int(r, 6, 15);
    let p = 0, qq = 0;
    do {
      p = int(r, 2, w - 2);
      qq = int(r, 2, h - 2);
    } while ((p * qq) % 2);
    const ans = w * h - (p * qq) / 2;
    return vi(
      {
        prompt: `A rectangle measures ${w} cm by ${h} cm. A right-angled triangle with legs ${p} cm and ${qq} cm is cut off one corner. Find the area that remains (cm²).`,
        ...choose(qn(ans), [qn(w * h - p * qq), qn(w * h), qn(w * h - p - qq), qn(2 * (w + h))]),
        explanation: `Rectangle − triangle = ${w} × ${h} − ½ × ${p} × ${qq} = ${w * h} − ${(p * qq) / 2} = ${ans}.`,
        figure: { kind: 'rect', w, h, unit: 'cm' },
      },
      `Một hình chữ nhật có kích thước ${w} cm × ${h} cm. Người ta cắt đi ở một góc một tam giác vuông có hai cạnh góc vuông ${p} cm và ${qq} cm. Tính diện tích phần còn lại (cm²).`,
      `Hình chữ nhật − tam giác = ${w} × ${h} − ½ × ${p} × ${qq} = ${w * h} − ${(p * qq) / 2} = ${ans}.`,
    );
  }
  if (d === 2) {
    if (r() < 0.5) {
      const h = pick(r, [12, 15, 20, 24]);
      const xs = partners(h, 40);
      const x1 = pick(r, xs), x2 = pick(r, xs.filter((x) => x !== x1));
      const BC = x1 + x2, AC = Math.sqrt(h * h + x2 * x2);
      const ans = qf(BC * h, AC);
      return vi(
        {
          prompt: `In triangle ABC, BC = ${BC} cm, the altitude from A to BC is ${h} cm, and AC = ${AC} cm. Find the altitude from B to AC (cm).`,
          ...choose(ans, [qf(BC * h, 2 * AC), qf(AC * h, BC), qn(h), qf(BC * AC, 2 * h)]),
          explanation: `Area = ½ × ${BC} × ${h} = ${(BC * h) / 2}. The same area is ½ × AC × (altitude to AC), so altitude = 2 × ${(BC * h) / 2} ÷ ${AC} = ${ans.s}.`,
          figure: { kind: 'tri-area', base: BC, height: h, unit: 'cm' },
        },
        `Tam giác ABC có BC = ${BC} cm, đường cao kẻ từ A xuống BC dài ${h} cm và AC = ${AC} cm. Tính độ dài đường cao kẻ từ B xuống AC (cm).`,
        `Diện tích = ½ × ${BC} × ${h} = ${(BC * h) / 2}. Diện tích đó cũng bằng ½ × AC × (đường cao ứng với AC), nên đường cao = 2 × ${(BC * h) / 2} : ${AC} = ${ans.s}.`,
      );
    }
    const [p, qq, s] = pick(r, triples(30));
    return vi(
      {
        prompt: `A rhombus has side ${s} cm and one diagonal ${2 * p} cm. Find its area (cm²).`,
        ...choose(qn(2 * p * qq), [qn(4 * p * qq), qn(2 * p * s), qn(s * s), qn(p * qq)]),
        explanation: `Half the other diagonal = √(${s}² − ${p}²) = ${qq}, so it is ${2 * qq} cm. Area = ½ × ${2 * p} × ${2 * qq} = ${2 * p * qq}.`,
        figure: { kind: 'polygon', sides: 4 },
      },
      `Một hình thoi có cạnh ${s} cm và một đường chéo dài ${2 * p} cm. Tính diện tích hình thoi (cm²).`,
      `Nửa đường chéo kia = √(${s}² − ${p}²) = ${qq}, nên đường chéo đó dài ${2 * qq} cm. Diện tích = ½ × ${2 * p} × ${2 * qq} = ${2 * p * qq}.`,
    );
  }
  if (d === 3) {
    const a = 2 * int(r, 1, 6);
    if (r() < 0.5) {
      const ans = q(rad((3 * a * a) / 2, 3), ((3 * Math.sqrt(3)) / 2) * a * a);
      return vi(
        {
          prompt: `A regular hexagon has side ${a} cm. Find its area (cm²), in simplest radical form.`,
          ...choose(ans, [qradf(a * a, 4, 3), qradf(3 * a * a, 1, 3), qn(6 * a * a), qradf(3 * a * a, 4, 3)]),
          explanation: `A regular hexagon is 6 equilateral triangles of side ${a}, each of area (√3/4) × ${a}² = ${qradf(a * a, 4, 3).s}. Total = 6 × that = ${ans.s}.`,
          figure: { kind: 'polygon', sides: 6 },
        },
        `Một lục giác đều có cạnh ${a} cm. Tính diện tích (cm²), viết dưới dạng căn thức tối giản.`,
        `Lục giác đều gồm 6 tam giác đều cạnh ${a}, mỗi tam giác có diện tích (√3/4) × ${a}² = ${qradf(a * a, 4, 3).s}. Tổng = 6 × ${qradf(a * a, 4, 3).s} = ${ans.s}.`,
      );
    }
    const ans = qradf(a * a, 4, 3);
    return vi(
      {
        prompt: `An equilateral triangle has side ${a} cm. Find its area (cm²), in simplest radical form.`,
        ...choose(ans, [qradf(a * a, 2, 3), qradf(a, 2, 3), qn((a * a) / 2), qradf(a * a, 1, 3)]),
        explanation: `The height is ${a}√3/2 = ${qradf(a, 2, 3).s} (Pythagoras: h² = ${a}² − ${a / 2}²). Area = ½ × ${a} × ${qradf(a, 2, 3).s} = ${ans.s}.`,
        figure: { kind: 'polygon', sides: 3 },
      },
      `Một tam giác đều có cạnh ${a} cm. Tính diện tích (cm²), viết dưới dạng căn thức tối giản.`,
      `Đường cao bằng ${a}√3/2 = ${qradf(a, 2, 3).s} (Pythagore: h² = ${a}² − ${a / 2}²). Diện tích = ½ × ${a} × ${qradf(a, 2, 3).s} = ${ans.s}.`,
    );
  }
  if (d === 4) {
    const W = int(r, 10, 20), H = int(r, 8, 16);
    if (r() < 0.5) {
      const p = int(r, 2, W - 3), qq = int(r, 2, H - 3);
      const P = 2 * (W + H);
      return vi(
        {
          prompt: `From a ${W} cm by ${H} cm rectangle, a ${p} cm by ${qq} cm rectangle is cut from one corner, leaving an L-shape. Find the perimeter of the L-shape (cm).`,
          ...choose(qn(P), [qn(P - 2 * (p + qq)), qn(P + 2 * (p + qq)), qn(P - (p + qq)), qn(W * H - p * qq)]),
          explanation: `The two new edges are exactly as long as the two pieces of boundary removed (${p} cm and ${qq} cm), so the perimeter does not change: 2 × (${W} + ${H}) = ${P}.`,
          figure: { kind: 'rect', w: W, h: H, unit: 'cm' },
        },
        `Từ một hình chữ nhật ${W} cm × ${H} cm, người ta cắt đi ở một góc một hình chữ nhật ${p} cm × ${qq} cm, còn lại hình chữ L. Tính chu vi hình chữ L (cm).`,
        `Hai cạnh mới tạo ra dài đúng bằng hai đoạn biên bị cắt đi (${p} cm và ${qq} cm), nên chu vi không đổi: 2 × (${W} + ${H}) = ${P}.`,
      );
    }
    const x = int(r, 1, 3);
    const ans = (W + 2 * x) * (H + 2 * x) - W * H;
    return vi(
      {
        prompt: `A rectangular garden ${W} m by ${H} m is surrounded by a path ${x} m wide on the outside. Find the area of the path (m²).`,
        ...choose(qn(ans), [qn(2 * x * (W + H)), qn((W + 2 * x) * (H + 2 * x)), qn((W + x) * (H + x) - W * H), qn(2 * x * (W + H) + x * x)]),
        explanation: `Big rectangle − garden = (${W} + ${2 * x}) × (${H} + ${2 * x}) − ${W} × ${H} = ${(W + 2 * x) * (H + 2 * x)} − ${W * H} = ${ans}. (Don't forget the four corner squares.)`,
        figure: { kind: 'rect', w: W, h: H, unit: 'm' },
      },
      `Một mảnh vườn hình chữ nhật ${W} m × ${H} m, xung quanh bên ngoài có một lối đi rộng ${x} m. Tính diện tích lối đi (m²).`,
      `Hình chữ nhật lớn − mảnh vườn = (${W} + ${2 * x}) × (${H} + ${2 * x}) − ${W} × ${H} = ${(W + 2 * x) * (H + 2 * x)} − ${W * H} = ${ans}. (Đừng quên bốn hình vuông ở góc.)`,
    );
  }
  if (r() < 0.5) {
    const a = 4 * int(r, 1, 5);
    const ans = (3 * a * a) / 8;
    return vi(
      {
        prompt: `Square ABCD has side ${a} cm. M and N are the midpoints of BC and CD. Find the area of triangle AMN (cm²).`,
        ...choose(qn(ans), [qn((a * a) / 2), qn((a * a) / 4), qn((3 * a * a) / 4), qn((a * a) / 8)]),
        explanation: `Square − three corner triangles: ${a * a} − ½·${a}·${a / 2} − ½·${a}·${a / 2} − ½·${a / 2}·${a / 2} = ${a * a} − ${(a * a) / 4} − ${(a * a) / 4} − ${(a * a) / 8} = ${ans}.`,
        figure: { kind: 'rect', w: a, h: a, unit: 'cm' },
      },
      `Hình vuông ABCD có cạnh ${a} cm. M, N lần lượt là trung điểm của BC và CD. Tính diện tích tam giác AMN (cm²).`,
      `Hình vuông trừ ba tam giác ở góc: ${a * a} − ½·${a}·${a / 2} − ½·${a}·${a / 2} − ½·${a / 2}·${a / 2} = ${a * a} − ${(a * a) / 4} − ${(a * a) / 4} − ${(a * a) / 8} = ${ans}.`,
    );
  }
  const w = int(r, 6, 16), h = int(r, 5, 12), x = int(r, 1, w - 1), y = int(r, 1, h - 1);
  const twice = 2 * w * h - x * h - (w - x) * y - w * (h - y);
  const ans = qf(twice, 2);
  return vi(
    {
      prompt: `Rectangle ABCD has AB = ${w} cm and BC = ${h} cm. E is on AB with AE = ${x} cm and F is on BC with BF = ${y} cm. Find the area of triangle DEF (cm²).`,
      ...choose(ans, [qf(w * h, 2), qf(twice + x * h, 2), qf(twice + (w - x) * y, 2), qf(twice + w * (h - y), 2)]),
      explanation: `Rectangle − triangles ADE, EBF, FCD: ${w * h} − ½·${x}·${h} − ½·${w - x}·${y} − ½·${w}·${h - y} = ${ans.s}.`,
      figure: { kind: 'rect', w, h, unit: 'cm' },
    },
    `Hình chữ nhật ABCD có AB = ${w} cm, BC = ${h} cm. Điểm E thuộc AB với AE = ${x} cm, điểm F thuộc BC với BF = ${y} cm. Tính diện tích tam giác DEF (cm²).`,
    `Lấy hình chữ nhật trừ ba tam giác ADE, EBF, FCD: ${w * h} − ½·${x}·${h} − ½·${w - x}·${y} − ½·${w}·${h - y} = ${viN(ans.s)}.`,
  );
};

// ── Angles: polygons, isosceles triangles, angle chasing ──────────────────
const angles: Generator = (d, r) => {
  if (d <= 1) {
    const n = pick(r, [5, 6, 9, 10, 12, 15, 18, 20]);
    const ext = 360 / n, inn = 180 - ext;
    if (r() < 0.5)
      return vi(
        {
          prompt: `Find each exterior angle of a regular ${n}-gon.`,
          ...chooseDeg(ext, [180 / n, inn, 360 - ext]),
          explanation: `The exterior angles of any polygon add up to 360°, so each one is 360° ÷ ${n} = ${ext}°.`,
          figure: { kind: 'polygon', sides: n },
        },
        `Tính số đo mỗi góc ngoài của một đa giác đều ${n} cạnh.`,
        `Tổng các góc ngoài của mọi đa giác bằng 360°, nên mỗi góc ngoài bằng 360° : ${n} = ${ext}°.`,
      );
    return vi(
      {
        prompt: `Find each interior angle of a regular ${n}-gon.`,
        ...chooseDeg(inn, [ext, 180 - 180 / n, (n - 2) * 180]),
        explanation: `Sum of interior angles = (${n} − 2) × 180° = ${(n - 2) * 180}°, so each is ${(n - 2) * 180}° ÷ ${n} = ${inn}° (or 180° − 360°/${n}).`,
        figure: { kind: 'polygon', sides: n, askAngle: true },
      },
      `Tính số đo mỗi góc trong của một đa giác đều ${n} cạnh.`,
      `Tổng các góc trong = (${n} − 2) × 180° = ${(n - 2) * 180}°, nên mỗi góc bằng ${(n - 2) * 180}° : ${n} = ${inn}° (hoặc 180° − 360°/${n}).`,
    );
  }
  if (d === 2) {
    if (r() < 0.5) {
      const x = 2 * int(r, 10, 70);
      const b = (180 - x) / 2;
      return vi(
        {
          prompt: `Triangle ABC is isosceles at A with angle A = ${x}°. Find angle B.`,
          ...chooseDeg(b, [180 - x, x, 180 - 2 * x, x / 2]),
          explanation: `The base angles are equal: B = C = (180° − ${x}°) ÷ 2 = ${b}°.`,
          figure: { kind: 'triangle', angles: [b, b, x], ask: 0 },
        },
        `Tam giác ABC cân tại A có góc A = ${x}°. Tính góc B.`,
        `Hai góc ở đáy bằng nhau: B = C = (180° − ${x}°) : 2 = ${b}°.`,
      );
    }
    const y = int(r, 25, 80);
    return vi(
      {
        prompt: `Triangle ABC is isosceles at A with angle B = ${y}°. Find angle A.`,
        ...chooseDeg(180 - 2 * y, [180 - y, 2 * y, 90 - y, y]),
        explanation: `C = B = ${y}°, so A = 180° − 2 × ${y}° = ${180 - 2 * y}°.`,
        figure: { kind: 'triangle', angles: [y, y, 180 - 2 * y], ask: 2 },
      },
      `Tam giác ABC cân tại A có góc B = ${y}°. Tính góc A.`,
      `C = B = ${y}°, nên A = 180° − 2 × ${y}° = ${180 - 2 * y}°.`,
    );
  }
  if (d === 3) {
    if (r() < 0.5) {
      const a = int(r, 25, 80), e = int(r, a + 20, 160);
      return vi(
        {
          prompt: `In triangle ABC the exterior angle at C is ${e}° and angle A = ${a}°. Find angle B.`,
          ...chooseDeg(e - a, [180 - e, 180 - e - a, e + a, a]),
          explanation: `An exterior angle equals the sum of the two interior angles not next to it: ${e}° = A + B, so B = ${e}° − ${a}° = ${e - a}°.`,
          figure: { kind: 'triangle', angles: [a, e - a, 180 - e], ask: 1 },
        },
        `Tam giác ABC có góc ngoài tại đỉnh C bằng ${e}° và góc A = ${a}°. Tính góc B.`,
        `Góc ngoài của tam giác bằng tổng hai góc trong không kề với nó: ${e}° = A + B, nên B = ${e}° − ${a}° = ${e - a}°.`,
      );
    }
    let x = 0, y = 0;
    do {
      x = int(r, 30, 90);
      y = int(r, 30, 90);
    } while ((180 - x - y) % 2 || 180 - x - y < 20);
    const C = 180 - x - y, ans = 180 - x - C / 2;
    return vi(
      {
        prompt: `Triangle ABC has angle A = ${x}° and angle B = ${y}°. The bisector of angle C meets AB at D. Find angle ADC.`,
        ...chooseDeg(ans, [x + C / 2, 180 - x - C, C / 2, 180 - y - C / 2]),
        explanation: `C = 180° − ${x}° − ${y}° = ${C}°, so angle ACD = ${C / 2}°. In triangle ADC: ADC = 180° − ${x}° − ${C / 2}° = ${ans}°.`,
        figure: { kind: 'triangle', angles: [x, y, C] },
      },
      `Tam giác ABC có góc A = ${x}°, góc B = ${y}°. Tia phân giác của góc C cắt AB tại D. Tính góc ADC.`,
      `C = 180° − ${x}° − ${y}° = ${C}°, nên góc ACD = ${C / 2}°. Trong tam giác ADC: ADC = 180° − ${x}° − ${C / 2}° = ${ans}°.`,
    );
  }
  if (d === 4) {
    if (r() < 0.5) {
      let x = 0, y = 0;
      do {
        x = 2 * int(r, 15, 50);
        y = int(r, 25, 85);
      } while (180 - x - y < 20);
      return vi(
        {
          prompt: `In triangle ABC, angle A = ${x}°. The bisectors of angles B and C meet at I. Find angle BIC.`,
          ...chooseDeg(90 + x / 2, [90 - x / 2, 180 - x, 180 - x / 2, 90 + x]),
          explanation: `B + C = 180° − ${x}° = ${180 - x}°, so IBC + ICB = ${(180 - x) / 2}°. BIC = 180° − ${(180 - x) / 2}° = ${90 + x / 2}° (= 90° + A/2).`,
          figure: { kind: 'triangle', angles: [x, y, 180 - x - y] },
        },
        `Tam giác ABC có góc A = ${x}°. Các tia phân giác của góc B và góc C cắt nhau tại I. Tính góc BIC.`,
        `B + C = 180° − ${x}° = ${180 - x}°, nên IBC + ICB = ${(180 - x) / 2}°. BIC = 180° − ${(180 - x) / 2}° = ${90 + x / 2}° (= 90° + A/2).`,
      );
    }
    const n = int(r, 6, 14);
    const S = (n - 2) * 180;
    return vi(
      {
        prompt: `The interior angles of a convex polygon add up to ${S}°. How many diagonals does it have?`,
        ...choose(qn((n * (n - 3)) / 2), [qn(n * (n - 3)), qn((n * (n - 1)) / 2), qn(n - 3), qn(((n + 2) * (n - 1)) / 2)]),
        explanation: `(n − 2) × 180° = ${S}° gives n = ${n}. Each vertex joins to n − 3 others by a diagonal, and each diagonal is counted twice: ${n} × ${n - 3} ÷ 2 = ${(n * (n - 3)) / 2}.`,
        figure: { kind: 'polygon', sides: n },
      },
      `Tổng các góc trong của một đa giác lồi bằng ${S}°. Đa giác đó có bao nhiêu đường chéo?`,
      `(n − 2) × 180° = ${S}° nên n = ${n}. Mỗi đỉnh nối với n − 3 đỉnh khác bằng đường chéo, mỗi đường chéo được đếm hai lần: ${n} × ${n - 3} : 2 = ${(n * (n - 3)) / 2}.`,
    );
  }
  if (r() < 0.5) {
    const x = 4 * int(r, 5, 30);
    const B = (180 - x) / 2, ans = 180 - x - B / 2;
    return vi(
      {
        prompt: `Triangle ABC is isosceles at A with angle A = ${x}°. The bisector of angle B meets AC at D. Find angle ADB.`,
        ...chooseDeg(ans, [x + B / 2, 180 - x - B, 180 - (3 * B) / 2, 90 + B / 2]),
        explanation: `B = C = (180° − ${x}°) ÷ 2 = ${B}°, so ABD = ${B / 2}°. In triangle ABD: ADB = 180° − ${x}° − ${B / 2}° = ${ans}°.`,
        figure: { kind: 'triangle', angles: [B, B, x] },
      },
      `Tam giác ABC cân tại A có góc A = ${x}°. Tia phân giác của góc B cắt AC tại D. Tính góc ADB.`,
      `B = C = (180° − ${x}°) : 2 = ${B}°, nên ABD = ${B / 2}°. Trong tam giác ABD: ADB = 180° − ${x}° − ${B / 2}° = ${ans}°.`,
    );
  }
  let y = 0, z = 0;
  do {
    y = int(r, 35, 85);
    z = int(r, 35, 85);
  } while (y === z || (y - z) % 2 || 180 - y - z < 20);
  const x = 180 - y - z, ans = Math.abs(y - z) / 2;
  return vi(
    {
      prompt: `Triangle ABC has angle B = ${y}° and angle C = ${z}°. AH is the altitude and AD the angle bisector from A. Find angle HAD.`,
      ...chooseDeg(ans, [Math.abs(y - z), x / 2, 90 - Math.max(y, z), 90 - Math.min(y, z)]),
      explanation: `A = ${x}°, so BAD = ${x / 2}°. In right triangle ABH, BAH = 90° − ${y}° = ${90 - y}°. HAD = |${x / 2}° − ${90 - y}°| = ${ans}° (always |B − C| ÷ 2).`,
      figure: { kind: 'triangle', angles: [y, z, x] },
    },
    `Tam giác ABC có góc B = ${y}°, góc C = ${z}°. AH là đường cao, AD là tia phân giác kẻ từ A. Tính góc HAD.`,
    `A = ${x}°, nên BAD = ${x / 2}°. Trong tam giác vuông ABH, BAH = 90° − ${y}° = ${90 - y}°. HAD = |${x / 2}° − ${90 - y}°| = ${ans}° (luôn bằng |B − C| : 2).`,
  );
};

// ── Circles: lengths and areas in π ─────────────────────────────────────
const circles: Generator = (d, r) => {
  const R = int(r, 2, 12);
  const figure: Figure = { kind: 'circle', r: R, unit: 'cm' };
  if (d <= 1) {
    if (r() < 0.5)
      return vi(
        {
          prompt: `A circle has radius ${R} cm. Find its area in terms of π (cm²).`,
          ...choose(qpi(R * R), [qpi(2 * R), qpi(R), qpi(2 * R * R), qpi(4 * R * R)]),
          explanation: `S = πR² = π × ${R}² = ${qpi(R * R).s}. (2πR = ${qpi(2 * R).s} is the circumference.)`,
          figure,
        },
        `Một đường tròn có bán kính ${R} cm. Tính diện tích hình tròn theo π (cm²).`,
        `S = πR² = π × ${R}² = ${qpi(R * R).s}. (2πR = ${qpi(2 * R).s} là chu vi.)`,
      );
    return vi(
      {
        prompt: `A circle has diameter ${2 * R} cm. Find its area in terms of π (cm²).`,
        ...choose(qpi(R * R), [qpi(4 * R * R), qpi(2 * R), qpi(R), qpi(2 * R * R)]),
        explanation: `The radius is half the diameter: R = ${R}. S = πR² = ${qpi(R * R).s}.`,
        figure,
      },
      `Một đường tròn có đường kính ${2 * R} cm. Tính diện tích hình tròn theo π (cm²).`,
      `Bán kính bằng nửa đường kính: R = ${R}. S = πR² = ${qpi(R * R).s}.`,
    );
  }
  if (d === 2) {
    if (r() < 0.5) {
      const ans = plus(qpi(R), qn(2 * R));
      return vi(
        {
          prompt: `Find the perimeter of a semicircle of radius ${R} cm, in terms of π (cm).`,
          ...choose(ans, [qpi(R), plus(qpi(2 * R), qn(2 * R)), plus(qpi(R), qn(R)), qpi(2 * R)]),
          explanation: `Half the circumference plus the diameter: ½ × 2π × ${R} + ${2 * R} = ${ans.s}.`,
          figure,
        },
        `Tính chu vi của nửa hình tròn bán kính ${R} cm theo π (cm).`,
        `Nửa chu vi đường tròn cộng đường kính: ½ × 2π × ${R} + ${2 * R} = ${ans.s}.`,
      );
    }
    const ans = qpi(R * R, 2);
    return vi(
      {
        prompt: `Find the area of a semicircle of radius ${R} cm, in terms of π (cm²).`,
        ...choose(ans, [qpi(R * R), qpi(R), qpi(R * R, 4), qpi(2 * R * R)]),
        explanation: `Half of πR²: ½ × π × ${R}² = ${ans.s}.`,
        figure,
      },
      `Tính diện tích nửa hình tròn bán kính ${R} cm theo π (cm²).`,
      `Một nửa của πR²: ½ × π × ${R}² = ${ans.s}.`,
    );
  }
  if (d === 3) {
    const k = pick(r, [2, 3, 4, 5, 8, 9, 16]);
    const ans = qroot(R * R * k);
    return vi(
      {
        prompt: `Circle (O) has radius ${R} cm. A second circle has an area ${k} times as large. Find its radius (cm).`,
        ...choose(ans, [qn(k * R), qroot(R * k), qf(k * R, 2), qn(k * k * R)]),
        explanation: `Area grows with R²: πR′² = ${k} × π × ${R}², so R′² = ${k * R * R} and R′ = ${ans.s}. (Multiplying the area by ${k} multiplies the radius by √${k}.)`,
        figure,
      },
      `Đường tròn (O) có bán kính ${R} cm. Một hình tròn khác có diện tích gấp ${k} lần. Tính bán kính của nó (cm).`,
      `Diện tích tỉ lệ với R²: πR′² = ${k} × π × ${R}², nên R′² = ${k * R * R} và R′ = ${ans.s}. (Diện tích gấp ${k} lần thì bán kính gấp √${k} lần.)`,
    );
  }
  if (d === 4) {
    const ans = minus(qn(4 * R * R), qpi(R * R));
    return vi(
      {
        prompt: `A circle of radius ${R} cm is inscribed in a square. Find the area inside the square but outside the circle, in terms of π (cm²).`,
        ...choose(ans, [minus(qn(4 * R * R), qpi(2 * R)), qpi(R * R), minus(qn(16 * R * R), qpi(R * R)), qn(4 * R * R)]),
        explanation: `The square's side is the diameter, ${2 * R} cm: area ${4 * R * R}. Subtract the circle πR² = ${qpi(R * R).s}: ${ans.s}.`,
        figure,
      },
      `Một đường tròn bán kính ${R} cm nội tiếp một hình vuông. Tính diện tích phần hình vuông nằm ngoài hình tròn theo π (cm²).`,
      `Cạnh hình vuông bằng đường kính, ${2 * R} cm: diện tích ${4 * R * R}. Trừ diện tích hình tròn πR² = ${qpi(R * R).s}: ${ans.s}.`,
    );
  }
  if (r() < 0.5) {
    const ans = minus(qpi(R * R), qn(2 * R * R));
    return vi(
      {
        prompt: `A square is inscribed in a circle of radius ${R} cm. Find the area inside the circle but outside the square, in terms of π (cm²).`,
        ...choose(ans, [minus(qpi(R * R), qn(R * R)), minus(qn(4 * R * R), qpi(R * R)), qn(2 * R * R), minus(qpi(2 * R), qn(2 * R * R))]),
        explanation: `The square's diagonals are diameters (${2 * R} cm), so its area = ½ × ${2 * R} × ${2 * R} = ${2 * R * R}. Circle − square = ${ans.s}.`,
        figure,
      },
      `Một hình vuông nội tiếp đường tròn bán kính ${R} cm. Tính diện tích phần hình tròn nằm ngoài hình vuông theo π (cm²).`,
      `Hai đường chéo của hình vuông là đường kính (${2 * R} cm), nên diện tích hình vuông = ½ × ${2 * R} × ${2 * R} = ${2 * R * R}. Hình tròn − hình vuông = ${ans.s}.`,
    );
  }
  const p = int(r, 1, 5);
  const ans = qpi(2 * R * p + p * p);
  return vi(
    {
      prompt: `The radius of a circle is increased from ${R} cm to ${R + p} cm. By how much does its area increase, in terms of π (cm²)?`,
      ...choose(ans, [qpi(p * p), qpi(2 * p), qpi(2 * R * p), qpi((R + p) * (R + p))]),
      explanation: `π(${R + p})² − π × ${R}² = π(${(R + p) * (R + p)} − ${R * R}) = ${ans.s}. ((R + p)² is not R² + p².)`,
      figure,
    },
    `Bán kính của một hình tròn tăng từ ${R} cm lên ${R + p} cm. Diện tích hình tròn tăng thêm bao nhiêu (theo π, cm²)?`,
    `π(${R + p})² − π × ${R}² = π(${(R + p) * (R + p)} − ${R * R}) = ${ans.s}. ((R + p)² không bằng R² + p².)`,
  );
};

// ── Trigonometric ratios in a right triangle ─────────────────────────────
type Fn = 'sin' | 'cos' | 'tan' | 'cot';
const FNS: Fn[] = ['sin', 'cos', 'tan', 'cot'];
/** 12 × f²(α) for α = 30°, 45°, 60°. */
const SQ12: Record<Fn, Record<number, number>> = {
  sin: { 30: 3, 45: 6, 60: 9 },
  cos: { 30: 9, 45: 6, 60: 3 },
  tan: { 30: 4, 45: 12, 60: 36 },
  cot: { 30: 36, 45: 12, 60: 4 },
};
const SWAP: Record<Fn, Fn> = { sin: 'cos', cos: 'sin', tan: 'cot', cot: 'tan' };
const coef = (p: number) => (p === 1 ? '' : String(p));
const RATIO_VI = 'sin = đối/huyền, cos = kề/huyền, tan = đối/kề, cot = kề/đối';
const trig: Generator = (d, r) => {
  if (d <= 1) {
    const [p, qq, c] = pick(r, triples(30));
    const at = pick(r, ['B', 'C'] as const);
    const f = pick(r, FNS);
    // AB = p, AC = qq, BC = c. Opposite B is AC; opposite C is AB.
    const [opp, adj] = at === 'B' ? [qq, p] : [p, qq];
    const val: Record<Fn, Q> = { sin: qf(opp, c), cos: qf(adj, c), tan: qf(opp, adj), cot: qf(adj, opp) };
    const giveHyp = r() < 0.5;
    const given = giveHyp ? `AB = ${p} cm and BC = ${c} cm` : `AB = ${p} cm and AC = ${qq} cm`;
    const givenVi = giveHyp ? `AB = ${p} cm, BC = ${c} cm` : `AB = ${p} cm, AC = ${qq} cm`;
    const step = giveHyp ? `AC = √(${c}² − ${p}²) = ${qq}` : `BC = √(${p}² + ${qq}²) = ${c}`;
    return vi(
      {
        prompt: `Triangle ABC is right-angled at A with ${given}. Find ${f} ${at}.`,
        ...choose(val[f], FNS.filter((g) => g !== f).map((g) => val[g])),
        explanation: `${step}. For angle ${at}: opposite = ${opp}, adjacent = ${adj}, hypotenuse = ${c}. sin = opp/hyp, cos = adj/hyp, tan = opp/adj, cot = adj/opp, so ${f} ${at} = ${val[f].s}.`,
        figure: rt(p, qq, c, giveHyp ? 'b' : 'c'),
      },
      `Tam giác ABC vuông tại A có ${givenVi}. Tính ${f} ${at}.`,
      `${step}. Với góc ${at}: cạnh đối = ${opp}, cạnh kề = ${adj}, cạnh huyền = ${c}. ${RATIO_VI}, nên ${f} ${at} = ${val[f].s}.`,
    );
  }
  if (d === 2) {
    const [f1, f2] = [pick(r, FNS), pick(r, FNS)];
    const [a1, a2] = [pick(r, [30, 45, 60]), pick(r, [30, 45, 60])];
    const [p1, p2] = [int(r, 1, 4), int(r, 1, 4)];
    const sg = r() < 0.5 ? 1 : -1;
    const v = (f: Fn, a: number) => SQ12[f][a];
    const val = (g1: Fn, g2: Fn, s = sg) => qf(p1 * v(g1, a1) + s * p2 * v(g2, a2), 12);
    const e = `${coef(p1)}${f1}²${a1}° ${sg > 0 ? '+' : '−'} ${coef(p2)}${f2}²${a2}°`;
    const ans = val(f1, f2);
    const tbl = 'sin 30° = cos 60° = 1/2, sin 45° = cos 45° = √2/2, sin 60° = cos 30° = √3/2, tan 30° = cot 60° = √3/3, tan 45° = 1, tan 60° = cot 30° = √3';
    return vi(
      {
        prompt: `Compute: ${e}`,
        ...choose(ans, [val(SWAP[f1], f2), val(f1, SWAP[f2]), val(SWAP[f1], SWAP[f2]), val(f1, f2, -sg), qf(v(f1, a1) + sg * v(f2, a2), 12), qf(p1 * v(f1, a1), 12), qf(p1 * v(f1, a1) + sg * p2 * v(f2, a2) + 6, 12), qf(p1 * v(f1, a1) + sg * p2 * v(f2, a2) - 6, 12)], true),
        explanation: `Use the exact values (${tbl}) and square them: ${f1}²${a1}° = ${fracN(v(f1, a1), 12)}, ${f2}²${a2}° = ${fracN(v(f2, a2), 12)}. Result: ${ans.s}.`,
      },
      `Tính: ${e}`,
      `Dùng giá trị đặc biệt (${tbl.replace(/(\d),(\s)/g, '$1;$2')}) rồi bình phương: ${f1}²${a1}° = ${fracN(v(f1, a1), 12)}, ${f2}²${a2}° = ${fracN(v(f2, a2), 12)}. Kết quả: ${ans.s}.`,
    );
  }
  if (d === 3) {
    if (r() < 0.5) {
      const a = pick(r, [10, 15, 20, 25, 35, 40, 50, 55, 65, 70, 75, 80]);
      const b = pick(r, [12, 18, 22, 28, 32, 38, 52, 58, 62, 68, 72, 78]);
      const p = int(r, 2, 5);
      const kind = pick(r, [0, 1, 2]);
      const [e, ans, mistakes] =
        kind === 0
          ? [`sin²${a}° + sin²${90 - a}° − ${p}tan ${b}°·tan ${90 - b}°`, 1 - p, [1 + p, 2 - p, -p, p - 1]]
          : kind === 1
            ? [`sin ${a}°/cos ${90 - a}° + ${p}tan ${b}°·cot ${b}°`, 1 + p, [p, 2 * p, 1 - p, p + 2]]
            : [`${p}tan ${b}°/cot ${90 - b}° − cos²${a}° − cos²${90 - a}°`, p - 1, [p - 2, p, p + 1, 1 - p]];
      return vi(
        {
          prompt: `Compute: ${e}`,
          ...choose(qn(ans), mistakes.map(qn), true),
          explanation: `Complementary angles: sin α = cos(90° − α) and tan α = cot(90° − α). So sin²α + sin²(90° − α) = sin²α + cos²α = 1, cos²α + cos²(90° − α) = 1, tan α·tan(90° − α) = tan α·cot α = 1. Result: ${num(ans)}.`,
        },
        `Tính: ${e}`,
        `Hai góc phụ nhau: sin α = cos(90° − α), tan α = cot(90° − α). Do đó sin²α + sin²(90° − α) = sin²α + cos²α = 1, cos²α + cos²(90° − α) = 1, tan α·tan(90° − α) = tan α·cot α = 1. Kết quả: ${num(ans)}.`,
      );
    }
    const [opp, adj, hyp] = pick(r, TRIPLES);
    const val: Record<Fn, Q> = { sin: qf(opp, hyp), cos: qf(adj, hyp), tan: qf(opp, adj), cot: qf(adj, opp) };
    const g = pick(r, ['sin', 'cos'] as const);
    const f = pick(r, FNS.filter((x) => x !== g));
    return vi(
      {
        prompt: `α is an acute angle with ${g} α = ${val[g].s}. Find ${f} α.`,
        ...choose(val[f], FNS.filter((x) => x !== f).map((x) => val[x])),
        explanation: `sin²α + cos²α = 1 gives ${SWAP[g]} α = √(1 − (${val[g].s})²) = ${val[SWAP[g]].s} (positive: α is acute). Then tan α = sin α/cos α, cot α = cos α/sin α: ${f} α = ${val[f].s}.`,
      },
      `Cho α là góc nhọn có ${g} α = ${val[g].s}. Tính ${f} α.`,
      `Từ sin²α + cos²α = 1 suy ra ${SWAP[g]} α = √(1 − (${val[g].s})²) = ${val[SWAP[g]].s} (dương vì α nhọn). Rồi tan α = sin α/cos α, cot α = cos α/sin α: ${f} α = ${val[f].s}.`,
    );
  }
  const R = (x: number) => (x * Math.PI) / 180;
  if (d === 4) {
    if (r() < 0.5) {
      const c = int(r, 6, 25);
      const b = pick(r, [20, 25, 28, 32, 35, 38, 40, 42, 48, 50, 52, 55, 58, 62, 65, 70]);
      const side = pick(r, ['AC', 'AB'] as const);
      const [f, g] = side === 'AC' ? [Math.sin, Math.cos] : [Math.cos, Math.sin];
      const ans = qdp(c * f(R(b)), 2);
      return vi(
        {
          prompt: `Triangle ABC is right-angled at A with BC = ${c} cm and angle B = ${b}°. Find ${side} (cm), rounded to 2 decimal places.`,
          ...choose(ans, [qdp(c * g(R(b)), 2), qdp(c * Math.tan(R(b)), 2), qdp(c / f(R(b)), 2), qdp(c / Math.tan(R(b)), 2)]),
          explanation: `${side} is the side ${side === 'AC' ? 'opposite' : 'adjacent to'} angle B and BC is the hypotenuse, so ${side} = BC·${side === 'AC' ? 'sin' : 'cos'} B = ${c}·${side === 'AC' ? 'sin' : 'cos'} ${b}° ≈ ${ans.s}.`,
        },
        `Tam giác ABC vuông tại A có BC = ${c} cm và góc B = ${b}°. Tính ${side} (cm), làm tròn đến chữ số thập phân thứ hai.`,
        `${side} là cạnh ${side === 'AC' ? 'đối diện' : 'kề'} với góc B, BC là cạnh huyền, nên ${side} = BC·${side === 'AC' ? 'sin' : 'cos'} B = ${c}·${side === 'AC' ? 'sin' : 'cos'} ${b}° ≈ ${viN(ans.s)}.`,
      );
    }
    let a = 0, b = 0;
    do {
      a = int(r, 3, 15);
      b = int(r, 3, 15);
    } while (a === b);
    const B = Math.round((Math.atan(b / a) * 180) / Math.PI);
    const mn = Math.min(a, b) / Math.max(a, b);
    return vi(
      {
        prompt: `Triangle ABC is right-angled at A with AB = ${a} cm and AC = ${b} cm. Find angle B, rounded to the nearest degree.`,
        ...chooseDeg(B, [90 - B, Math.round((Math.asin(mn) * 180) / Math.PI), Math.round((Math.acos(mn) * 180) / Math.PI)]),
        explanation: `tan B = AC/AB = ${b}/${a} (opposite over adjacent), so B ≈ ${B}°. (Then C = 90° − B.)`,
      },
      `Tam giác ABC vuông tại A có AB = ${a} cm, AC = ${b} cm. Tính góc B (làm tròn đến độ).`,
      `tan B = AC/AB = ${b}/${a} (đối chia kề), nên B ≈ ${B}°. (Khi đó C = 90° − B.)`,
    );
  }
  if (r() < 0.5) {
    const s = int(r, 8, 40), a = int(r, 25, 65);
    const ans = qdp(s * Math.tan(R(a)), 1);
    return vi(
      {
        prompt: `A pole casts a shadow ${s} m long when the sun's rays make an angle of ${a}° with the ground. How tall is the pole (m)? Round to 1 decimal place.`,
        ...choose(ans, [qdp(s * Math.sin(R(a)), 1), qdp(s * Math.cos(R(a)), 1), qdp(s / Math.tan(R(a)), 1), qdp(s / Math.cos(R(a)), 1), qdp(s * Math.tan(R(a)) * 2, 1), qdp(s * Math.tan(R(a)) + 1, 1)]),
        explanation: `The pole and its shadow are the legs of a right triangle; the ${a}° angle is at the tip of the shadow. Height = shadow × tan ${a}° = ${s}·tan ${a}° ≈ ${ans.s} m.`,
      },
      `Một cột cờ có bóng trên mặt đất dài ${s} m khi tia nắng mặt trời tạo với mặt đất một góc ${a}°. Tính chiều cao cột cờ (m), làm tròn đến chữ số thập phân thứ nhất.`,
      `Cột cờ và bóng của nó là hai cạnh góc vuông; góc ${a}° nằm ở đầu bóng. Chiều cao = bóng × tan ${a}° = ${s}·tan ${a}° ≈ ${viN(ans.s)} m.`,
    );
  }
  const al = int(r, 22, 38), be = al + int(r, 10, 25), dd = 5 * int(r, 2, 10);
  const [ta, tb] = [Math.tan(R(al)), Math.tan(R(be))];
  const h = (dd * ta * tb) / (tb - ta);
  const ans = qdp(h, 1);
  return vi(
    {
      prompt: `From point A on level ground the angle of elevation of the top of a tower is ${al}°. From point B, ${dd} m closer to the tower, it is ${be}°. Find the height of the tower (m), rounded to 1 decimal place.`,
      ...choose(ans, [qdp(dd * tb, 1), qdp(dd * ta, 1), qdp(dd / (1 / ta + 1 / tb), 1), qdp(dd * (tb - ta), 1), qdp(dd * Math.sin(R(be)), 1), qdp(h + 1, 1), qdp(h - 1, 1)]),
      explanation: `Let the height be h. The distances from the foot are h·cot ${al}° and h·cot ${be}°, and they differ by ${dd}: h(cot ${al}° − cot ${be}°) = ${dd}, so h = ${dd}/(cot ${al}° − cot ${be}°) ≈ ${ans.s} m.`,
    },
    `Từ điểm A trên mặt đất nhìn đỉnh một tòa tháp với góc nâng ${al}°. Đi thêm ${dd} m lại gần tháp đến điểm B thì góc nâng là ${be}°. Tính chiều cao tòa tháp (m), làm tròn đến chữ số thập phân thứ nhất.`,
    `Gọi chiều cao là h. Khoảng cách từ chân tháp đến A và B là h·cot ${al}° và h·cot ${be}°, hơn kém nhau ${dd} m: h(cot ${al}° − cot ${be}°) = ${dd}, nên h = ${dd}/(cot ${al}° − cot ${be}°) ≈ ${viN(ans.s)} m.`,
  );
};

// ── Relations in a right triangle with an altitude ──────────────────────
/** Right at A, altitude AH: BH = t·m², CH = t·n², AH = t·m·n, BC = t(m² + n²). */
const PAIRS: [number, number][] = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [1, 5], [3, 5], [4, 5]];
const SETUP = 'Triangle ABC is right-angled at A with altitude AH';
const SETUP_VI = 'Tam giác ABC vuông tại A, đường cao AH';
const relations: Generator = (d, r) => {
  let [m, n] = pick(r, PAIRS);
  if (r() < 0.5) [m, n] = [n, m];
  const t = Math.max(m, n) > 3 ? 1 : int(r, 1, 2);
  const BH = t * m * m, CH = t * n * n, AH = t * m * n, BC = BH + CH;
  if (d <= 1)
    return vi(
      {
        prompt: `${SETUP}. BH = ${BH} cm and CH = ${CH} cm. Find AH (cm).`,
        ...choose(qn(AH), [qn(BH * CH), qf(BC, 2), qroot(BC), qroot(BH * BH + CH * CH)]),
        explanation: `AH² = BH·CH = ${BH}·${CH} = ${BH * CH}, so AH = ${AH}.`,
      },
      `${SETUP_VI}. BH = ${BH} cm, CH = ${CH} cm. Tính AH (cm).`,
      `AH² = BH·CH = ${BH}·${CH} = ${BH * CH}, nên AH = ${AH}.`,
    );
  if (d === 2) {
    const ans = qroot(BH * BC);
    return vi(
      {
        prompt: `${SETUP}. BH = ${BH} cm and BC = ${BC} cm. Find AB (cm), in simplest radical form.`,
        ...choose(ans, [qroot(CH * BC), qroot(BC * BC - BH * BH), qn(BH * BC), qroot(BH * CH)]),
        explanation: `A leg squared = hypotenuse × its projection: AB² = BC·BH = ${BC}·${BH} = ${BH * BC}, so AB = ${ans.s}.`,
      },
      `${SETUP_VI}. BH = ${BH} cm, BC = ${BC} cm. Tính AB (cm), viết dưới dạng căn thức tối giản.`,
      `Bình phương cạnh góc vuông bằng cạnh huyền nhân hình chiếu của nó: AB² = BC·BH = ${BC}·${BH} = ${BH * BC}, nên AB = ${ans.s}.`,
    );
  }
  if (d === 3) {
    if (r() < 0.5) {
      const [p, qq, c] = pick(r, triples(30));
      const ans = qf(p * qq, c);
      return vi(
        {
          prompt: `${SETUP}. AB = ${p} cm and AC = ${qq} cm. Find AH (cm).`,
          ...choose(ans, [qf(p * qq, 2), qf(c, 2), qf(p + qq, 2), qf(p * qq, p + qq)]),
          explanation: `BC = √(${p}² + ${qq}²) = ${c}. Twice the area two ways: AH·BC = AB·AC, so AH = ${p}·${qq}/${c} = ${ans.s}.`,
        },
        `${SETUP_VI}. AB = ${p} cm, AC = ${qq} cm. Tính AH (cm).`,
        `BC = √(${p}² + ${qq}²) = ${c}. Hai lần diện tích tính theo hai cách: AH·BC = AB·AC, nên AH = ${p}·${qq}/${c} = ${ans.s}.`,
      );
    }
    let a = 0, b = 0;
    do {
      a = int(r, 1, 8);
      b = int(r, 2, 9);
    } while (isSq(a * a + b * b));
    const N = a * a + b * b;
    const [c, s] = simp(N);
    const ans = qradf(a * b, c * s, s);
    return vi(
      {
        prompt: `${SETUP}. AB = ${a} cm and AC = ${b} cm. Use 1/AH² = 1/AB² + 1/AC² to find AH (cm), with a rational denominator.`,
        ...choose(ans, [qf(a * b, 2), qradf(c, 2, s), qroot(a * a + b * b), qf(a * b, N)]),
        explanation: `1/AH² = 1/${a * a} + 1/${b * b} = ${N}/${a * a * b * b}, so AH = ${a * b}/√${N} = ${ans.s}.`,
      },
      `${SETUP_VI}. AB = ${a} cm, AC = ${b} cm. Dùng hệ thức 1/AH² = 1/AB² + 1/AC² để tính AH (cm), trục căn thức ở mẫu.`,
      `1/AH² = 1/${a * a} + 1/${b * b} = ${N}/${a * a * b * b}, nên AH = ${a * b}/√${N} = ${ans.s}.`,
    );
  }
  if (d === 4) {
    if (r() < 0.5)
      return vi(
        {
          prompt: `${SETUP}. AH = ${AH} cm and BH = ${BH} cm. Find BC (cm).`,
          ...choose(qn(BC), [qn(CH), qn(BH + AH), qroot(AH * AH + BH * BH), qn(2 * AH)]),
          explanation: `AH² = BH·CH, so CH = ${AH}²/${BH} = ${CH}. BC = BH + CH = ${BH} + ${CH} = ${BC}.`,
        },
        `${SETUP_VI}. AH = ${AH} cm, BH = ${BH} cm. Tính BC (cm).`,
        `AH² = BH·CH, nên CH = ${AH}²/${BH} = ${CH}. BC = BH + CH = ${BH} + ${CH} = ${BC}.`,
      );
    const ans = qroot(CH * BC);
    return vi(
      {
        prompt: `${SETUP}. AH = ${AH} cm and BH = ${BH} cm. Find AC (cm), in simplest radical form.`,
        ...choose(ans, [qroot(BH * BC), qroot(AH * AH + BH * BH + 1), qn(CH), qroot(CH * CH - AH * AH)]),
        explanation: `CH = AH²/BH = ${AH * AH}/${BH} = ${CH}, BC = ${BC}. AC² = BC·CH = ${BC}·${CH} = ${CH * BC}, so AC = ${ans.s}. (Or AC² = AH² + CH².)`,
      },
      `${SETUP_VI}. AH = ${AH} cm, BH = ${BH} cm. Tính AC (cm), viết dưới dạng căn thức tối giản.`,
      `CH = AH²/BH = ${AH * AH}/${BH} = ${CH}, BC = ${BC}. AC² = BC·CH = ${BC}·${CH} = ${CH * BC}, nên AC = ${ans.s}. (Hoặc AC² = AH² + CH².)`,
    );
  }
  if (r() < 0.5) {
    const [small, big] = [Math.min(BH, CH), Math.max(BH, CH)];
    return vi(
      {
        prompt: `${SETUP}, and AB < AC. BC = ${BC} cm and AH = ${AH} cm. Find BH (cm).`,
        ...choose(qn(small), [qn(big), qf(BC, 2), qn(AH), qf(AH * AH, BC)]),
        explanation: `BH + CH = ${BC} and BH·CH = AH² = ${AH * AH}, so BH and CH are the roots of x² − ${BC}x + ${AH * AH} = 0: ${small} and ${big}. AB < AC means BH < CH, so BH = ${small}.`,
      },
      `${SETUP_VI}, AB < AC. BC = ${BC} cm, AH = ${AH} cm. Tính BH (cm).`,
      `BH + CH = ${BC} và BH·CH = AH² = ${AH * AH}, nên BH, CH là nghiệm của x² − ${BC}x + ${AH * AH} = 0: ${small} và ${big}. AB < AC nên BH < CH, vậy BH = ${small}.`,
    );
  }
  const [p, qq, c] = pick(r, [[3, 4, 5], [4, 3, 5]] as const);
  const j = int(r, 1, 4);
  const AB = p * c * j, AC = qq * c * j, bc = c * c * j, bh = p * p * j;
  return vi(
    {
      prompt: `${SETUP}. AB = ${AB} cm and BH = ${bh} cm. Find the area of triangle ABC (cm²).`,
      ...choose(qn((AB * AC) / 2), [qn(AB * AC), qn((AB * bc) / 2), qn((bh * AB) / 2), qn((bc * bh) / 2)]),
      explanation: `AB² = BC·BH gives BC = ${AB}²/${bh} = ${bc}. AC = √(${bc}² − ${AB}²) = ${AC}. Area = ½·AB·AC = ½·${AB}·${AC} = ${(AB * AC) / 2}.`,
    },
    `${SETUP_VI}. AB = ${AB} cm, BH = ${bh} cm. Tính diện tích tam giác ABC (cm²).`,
    `AB² = BC·BH nên BC = ${AB}²/${bh} = ${bc}. AC = √(${bc}² − ${AB}²) = ${AC}. Diện tích = ½·AB·AC = ½·${AB}·${AC} = ${(AB * AC) / 2}.`,
  );
};

export const geometry9Concepts: ConceptSeed[] = [
  {
    id: 'math.geometry.trig',
    domain: 'Geometry',
    skill: 'Trigonometry',
    name: 'Trigonometric ratios',
    missionName: 'Lighthouse Angles',
    description: 'sin, cos, tan, cot of an acute angle; exact values at 30°, 45°, 60°; complementary angles; solving right triangles and heights.',
    prerequisites: ['math.geometry.pythagoras'],
    lesson:
      'In a right triangle, for an acute angle α: sin α = opposite/hypotenuse, cos α = adjacent/hypotenuse, tan α = opposite/adjacent, cot α = adjacent/opposite. Exact values: sin 30° = cos 60° = 1/2, sin 45° = cos 45° = √2/2, sin 60° = cos 30° = √3/2, tan 30° = √3/3, tan 45° = 1, tan 60° = √3. Always sin²α + cos²α = 1, tan α = sin α/cos α, tan α·cot α = 1, and for complementary angles sin α = cos(90° − α), tan α = cot(90° − α). Solving a triangle: side = hypotenuse × sin (opposite) or × cos (adjacent); leg = other leg × tan. Round only at the end, as the question says.',
    examRefs: ['Toán 9 · Tỉ số lượng giác của góc nhọn', 'Toán 9 · Hệ thức giữa cạnh và góc trong tam giác vuông', 'Vào 10 Hà Nội · Bài IV (thực tế)'],
  },
  {
    id: 'math.geometry.right-relations',
    domain: 'Geometry',
    skill: 'Triangles',
    name: 'Relations in a right triangle',
    missionName: 'Altitude Bridge',
    description: 'A right triangle with the altitude to the hypotenuse: b² = a·b′, h² = b′·c′, a·h = b·c, 1/h² = 1/b² + 1/c².',
    prerequisites: ['math.geometry.pythagoras'],
    lesson:
      'Triangle ABC right-angled at A, altitude AH, BC = a, AC = b, AB = c, projections CH = b′, BH = c′, AH = h. Then b² = a·b′ and c² = a·c′ (a leg squared = hypotenuse × its projection), h² = b′·c′, a·h = b·c (twice the area), and 1/h² = 1/b² + 1/c². Pick the relation that links what you know to what you want; with BH + CH and BH·CH known, BH and CH are the roots of a quadratic.',
    examRefs: ['Toán 9 · Một số hệ thức về cạnh và đường cao trong tam giác vuông'],
  },
];
export const geometry9Patches: Record<string, Partial<ConceptSeed>> = {};
export const geometry9Generators: Record<string, Generator> = {
  'math.geometry.pythagoras': pythagoras,
  'math.geometry.area': area,
  'math.geometry.angles': angles,
  'math.geometry.circles': circles,
  'math.geometry.trig': trig,
  'math.geometry.right-relations': relations,
};
export const geometry9LessonsVi: Record<string, string> = {
  'math.geometry.trig':
    'Trong tam giác vuông, với góc nhọn α: sin α = đối/huyền, cos α = kề/huyền, tan α = đối/kề, cot α = kề/đối. Giá trị đặc biệt: sin 30° = cos 60° = 1/2, sin 45° = cos 45° = √2/2, sin 60° = cos 30° = √3/2, tan 30° = √3/3, tan 45° = 1, tan 60° = √3. Luôn có sin²α + cos²α = 1, tan α = sin α/cos α, tan α·cot α = 1; hai góc phụ nhau thì sin góc này bằng cos góc kia, tan góc này bằng cot góc kia. Giải tam giác vuông: cạnh góc vuông = cạnh huyền × sin góc đối (hoặc × cos góc kề) = cạnh góc vuông kia × tan góc đối. Chỉ làm tròn ở bước cuối theo yêu cầu đề bài.',
  'math.geometry.right-relations':
    'Tam giác ABC vuông tại A, đường cao AH, BC = a, AC = b, AB = c, hình chiếu CH = b′, BH = c′, AH = h. Khi đó b² = a·b′, c² = a·c′ (bình phương cạnh góc vuông bằng cạnh huyền nhân hình chiếu), h² = b′·c′, a·h = b·c (hai lần diện tích), 1/h² = 1/b² + 1/c². Chọn hệ thức nối cái đã biết với cái cần tìm; nếu biết BH + CH và BH·CH thì BH, CH là nghiệm của một phương trình bậc hai.',
};
