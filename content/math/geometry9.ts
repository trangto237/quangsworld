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
/** "√45 = √(9·5) = 3√5", "√49 = 7" or just "√13". */
const rootText = (n: number) => {
  const [c, s] = simp(n);
  return s === 1 ? `√${n} = ${c}` : c === 1 ? `√${n}` : `√${n} = √(${c * c}·${s}) = ${rad(c, s)}`;
};
/** "(√20)²" or "4²". */
const sqr = (s: string) => (s.includes('√') ? `(${s})²` : `${s}²`);
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
        explanation: `Pythagoras' theorem: in a right triangle, hypotenuse² = leg² + leg². The hypotenuse c is the longest side, opposite the right angle; the legs are the two sides that form the right angle.\nc² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${a * a + b * b}.\nc = ${rootText(a * a + b * b)} cm.\nCareful: c is not ${a} + ${b} — add the squares, then take the square root.`,
        figure: rt(a, b, ans.v, 'c'),
      },
      `Một tam giác vuông có hai cạnh góc vuông ${a} cm và ${b} cm. Tính cạnh huyền (cm), viết dưới dạng căn thức tối giản.`,
      `Định lí Pythagore: trong tam giác vuông, bình phương cạnh huyền bằng tổng bình phương hai cạnh góc vuông. Cạnh huyền c là cạnh dài nhất, đối diện góc vuông.\nc² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${a * a + b * b}.\nc = ${rootText(a * a + b * b)} cm.\nChú ý: c không bằng ${a} + ${b} — cộng các bình phương rồi mới khai căn.`,
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
        explanation: `Pythagoras' theorem: hypotenuse² = leg² + leg² (the hypotenuse is the longest side, opposite the right angle). So a missing leg² = hypotenuse² − other leg².\nb² = ${c}² − ${a}² = ${c * c} − ${a * a} = ${c * c - a * a}.\nb = ${rootText(c * c - a * a)} cm.\nCareful: here you subtract, because the hypotenuse ${c} is the biggest side.`,
        figure: rt(a, ans.v, c, 'b'),
      },
      `Một tam giác vuông có cạnh huyền ${c} cm và một cạnh góc vuông ${a} cm. Tính cạnh góc vuông còn lại (cm), viết dưới dạng căn thức tối giản.`,
      `Định lí Pythagore: bình phương cạnh huyền bằng tổng bình phương hai cạnh góc vuông (cạnh huyền là cạnh lớn nhất, đối diện góc vuông). Nên bình phương cạnh góc vuông còn lại = cạnh huyền² − cạnh kia².\nb² = ${c}² − ${a}² = ${c * c} − ${a * a} = ${c * c - a * a}.\nb = ${rootText(c * c - a * a)} cm.\nChú ý: ở đây phải trừ vì cạnh huyền ${c} là cạnh lớn nhất.`,
    );
  }
  if (d === 3) {
    const [k, h, s] = pick(r, triples(30));
    if (r() < 0.5)
      return vi(
        {
          prompt: `An isosceles triangle has two equal sides ${s} cm and base ${2 * k} cm. Find its area (cm²).`,
          ...choose(qn(k * h), [qn(2 * k * h), qn(k * s), qn(2 * k * s), qn(k * h + k)]),
          explanation: `In an isosceles triangle, the height from the top vertex meets the base at its midpoint: it cuts the base ${2 * k} into two halves of ${k} cm and makes two right triangles.\nPythagoras in one of them (hypotenuse = equal side ${s}): h² = ${s}² − ${k}² = ${s * s} − ${k * k} = ${h * h}, so h = ${h}.\nArea of a triangle = ½ × base × height = ½ × ${2 * k} × ${h} = ${k * h} cm².`,
          figure: rt(h, k, s, 'a'),
        },
        `Một tam giác cân có hai cạnh bên bằng ${s} cm và cạnh đáy ${2 * k} cm. Tính diện tích tam giác (cm²).`,
        `Trong tam giác cân, đường cao kẻ từ đỉnh đi qua trung điểm cạnh đáy: chia đáy ${2 * k} thành hai nửa ${k} cm và tạo thành hai tam giác vuông.\nÁp dụng định lí Pythagore (cạnh huyền là cạnh bên ${s}): h² = ${s}² − ${k}² = ${s * s} − ${k * k} = ${h * h}, nên h = ${h}.\nDiện tích tam giác = ½ × đáy × chiều cao = ½ × ${2 * k} × ${h} = ${k * h} cm².`,
      );
    return vi(
      {
        prompt: `A rhombus has diagonals ${2 * k} cm and ${2 * h} cm. Find its perimeter (cm).`,
        ...choose(qn(4 * s), [qn(s), qn(8 * s), qn(4 * (k + h)), qn(2 * (k + h))]),
        explanation: `The diagonals of a rhombus cut each other in half at right angles, making 4 right triangles with legs ${k} and ${h} (half of each diagonal); the side of the rhombus is their hypotenuse.\nPythagoras: side² = ${k}² + ${h}² = ${k * k} + ${h * h} = ${s * s}, so side = ${s}.\nA rhombus has 4 equal sides: perimeter = 4 × ${s} = ${4 * s} cm.\nCareful: use HALF of each diagonal.`,
        figure: rt(k, h, s, 'c'),
      },
      `Một hình thoi có hai đường chéo dài ${2 * k} cm và ${2 * h} cm. Tính chu vi hình thoi (cm).`,
      `Hai đường chéo của hình thoi vuông góc với nhau tại trung điểm mỗi đường, tạo thành 4 tam giác vuông có hai cạnh góc vuông ${k} và ${h} (nửa mỗi đường chéo); cạnh hình thoi là cạnh huyền.\nĐịnh lí Pythagore: cạnh² = ${k}² + ${h}² = ${k * k} + ${h * h} = ${s * s}, nên cạnh = ${s}.\nHình thoi có 4 cạnh bằng nhau: chu vi = 4 × ${s} = ${4 * s} cm.\nChú ý: dùng NỬA mỗi đường chéo.`,
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
        explanation: `AH ⟂ BC, so ABH and ACH are right triangles (right angle at H) with hypotenuses AB and AC.\nPythagoras in ABH: BH² = AB² − AH² = ${c1 * c1} − ${h * h} = ${x1 * x1}, so BH = ${x1}.\nPythagoras in ACH: CH² = AC² − AH² = ${c2 * c2} − ${h * h} = ${x2 * x2}, so CH = ${x2}.\nH is between B and C, so BC = BH + CH = ${x1} + ${x2} = ${x1 + x2} cm.\nCareful: ABC itself is not a right triangle, so Pythagoras does not work on AB, AC, BC.`,
        figure: rt(h, x1, c1, 'b'),
      },
      `Tam giác ABC có đường cao AH = ${h} cm, H nằm giữa B và C. AB = ${c1} cm, AC = ${c2} cm. Tính BC (cm).`,
      `AH ⟂ BC nên ABH và ACH là hai tam giác vuông tại H, có cạnh huyền AB và AC.\nĐịnh lí Pythagore cho tam giác ABH: BH² = AB² − AH² = ${c1 * c1} − ${h * h} = ${x1 * x1}, nên BH = ${x1}.\nCho tam giác ACH: CH² = AC² − AH² = ${c2 * c2} − ${h * h} = ${x2 * x2}, nên CH = ${x2}.\nH nằm giữa B và C nên BC = BH + CH = ${x1} + ${x2} = ${x1 + x2} cm.\nChú ý: tam giác ABC không vuông nên không áp dụng Pythagore cho AB, AC, BC.`,
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
        explanation: `Drop the heights from both ends of the short side. They cut two equal pieces off the long side: (${b} − ${a}) ÷ 2 = ${off} cm, and make right triangles whose hypotenuse is the slanted side ${l}.\nPythagoras: h² = ${l}² − ${off}² = ${l * l} − ${off * off} = ${h * h}, so h = ${h}.\nArea of a trapezium = ½ × (sum of the parallel sides) × height = ½ × (${a} + ${b}) × ${h} = ½ × ${a + b} × ${h} = ${area} cm².\nCareful: the height is not the slanted side ${l}.`,
        figure: rt(h, off, l, 'a'),
      },
      `Một hình thang cân có hai đáy ${a} cm và ${b} cm, mỗi cạnh bên dài ${l} cm. Tính diện tích hình thang (cm²).`,
      `Kẻ hai đường cao từ hai đầu đáy nhỏ. Chúng cắt ra ở đáy lớn hai đoạn bằng nhau: (${b} − ${a}) : 2 = ${off} cm, tạo thành tam giác vuông có cạnh huyền là cạnh bên ${l}.\nĐịnh lí Pythagore: h² = ${l}² − ${off}² = ${l * l} − ${off * off} = ${h * h}, nên h = ${h}.\nDiện tích hình thang = ½ × (tổng hai đáy) × chiều cao = ½ × (${a} + ${b}) × ${h} = ½ × ${a + b} × ${h} = ${area} cm².\nChú ý: chiều cao không phải cạnh bên ${l}.`,
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
      explanation: `The wall, the ground and the ladder make a right triangle; the ladder (${L} m) is the hypotenuse.\nBefore: (height of the top)² = ${L}² − ${x1}² = ${L * L} − ${x1 * x1} = ${y1 * y1}, so the top is ${y1} m high.\nAfter: the foot is ${x1} + ${x2 - x1} = ${x2} m out: height² = ${L * L} − ${x2 * x2} = ${y2 * y2}, so ${y2} m.\nThe top slides down ${y1} − ${y2} = ${y1 - y2} m.\nCareful: the top does not slide the same ${x2 - x1} m as the foot.`,
      figure: rt(y1, x1, L, 'a'),
    },
    `Một chiếc thang dài ${L} m dựa vào bức tường thẳng đứng, chân thang cách tường ${x1} m. Chân thang trượt ra xa thêm ${x2 - x1} m. Hỏi đầu thang trượt xuống bao nhiêu mét?`,
    `Bức tường, mặt đất và chiếc thang tạo thành tam giác vuông; thang (${L} m) là cạnh huyền.\nLúc đầu: (độ cao đầu thang)² = ${L}² − ${x1}² = ${L * L} − ${x1 * x1} = ${y1 * y1}, nên đầu thang cao ${y1} m.\nLúc sau chân thang cách tường ${x1} + ${x2 - x1} = ${x2} m: độ cao² = ${L * L} − ${x2 * x2} = ${y2 * y2}, nên cao ${y2} m.\nĐầu thang trượt xuống ${y1} − ${y2} = ${y1 - y2} m.\nChú ý: đầu thang không trượt xuống đúng ${x2 - x1} m như chân thang.`,
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
        explanation: `Area left = rectangle − the triangle cut off.\nRectangle = length × width = ${w} × ${h} = ${w * h}.\nRight triangle = ½ × leg × leg = ½ × ${p} × ${qq} = ${(p * qq) / 2}.\nArea left = ${w * h} − ${(p * qq) / 2} = ${ans} cm².\nCareful: a triangle is HALF of ${p} × ${qq}.`,
        figure: { kind: 'rect', w, h, unit: 'cm' },
      },
      `Một hình chữ nhật có kích thước ${w} cm × ${h} cm. Người ta cắt đi ở một góc một tam giác vuông có hai cạnh góc vuông ${p} cm và ${qq} cm. Tính diện tích phần còn lại (cm²).`,
      `Diện tích còn lại = hình chữ nhật − tam giác bị cắt.\nHình chữ nhật = dài × rộng = ${w} × ${h} = ${w * h}.\nTam giác vuông = ½ × cạnh góc vuông × cạnh góc vuông = ½ × ${p} × ${qq} = ${(p * qq) / 2}.\nCòn lại: ${w * h} − ${(p * qq) / 2} = ${ans} cm².\nChú ý: diện tích tam giác bằng MỘT NỬA ${p} × ${qq}.`,
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
          explanation: `Area of a triangle = ½ × base × the height to that base, and any side can be the base — the area is the same.\nWith base BC: S = ½ × ${BC} × ${h} = ${(BC * h) / 2}.\nWith base AC: S = ½ × AC × h_B, where h_B is the altitude from B. So ½ × ${AC} × h_B = ${(BC * h) / 2}.\nh_B = 2 × ${(BC * h) / 2} ÷ ${AC} = ${BC * h}/${AC} = ${ans.s} cm.`,
          figure: { kind: 'tri-area', base: BC, height: h, unit: 'cm' },
        },
        `Tam giác ABC có BC = ${BC} cm, đường cao kẻ từ A xuống BC dài ${h} cm và AC = ${AC} cm. Tính độ dài đường cao kẻ từ B xuống AC (cm).`,
        `Diện tích tam giác = ½ × cạnh đáy × đường cao ứng với cạnh đó, và cạnh nào cũng có thể làm đáy.\nLấy đáy BC: S = ½ × ${BC} × ${h} = ${(BC * h) / 2}.\nLấy đáy AC: S = ½ × AC × h_B (h_B là đường cao kẻ từ B), nên ½ × ${AC} × h_B = ${(BC * h) / 2}.\nh_B = 2 × ${(BC * h) / 2} : ${AC} = ${BC * h}/${AC} = ${ans.s} cm.`,
      );
    }
    const [p, qq, s] = pick(r, triples(30));
    return vi(
      {
        prompt: `A rhombus has side ${s} cm and one diagonal ${2 * p} cm. Find its area (cm²).`,
        ...choose(qn(2 * p * qq), [qn(4 * p * qq), qn(2 * p * s), qn(s * s), qn(p * qq)]),
        explanation: `The diagonals of a rhombus cut each other in half at right angles, so half the known diagonal (${p}), half the other diagonal and a side (${s}) form a right triangle with hypotenuse ${s}.\nPythagoras: (half the other)² = ${s}² − ${p}² = ${s * s} − ${p * p} = ${qq * qq}, so half = ${qq} and the other diagonal = ${2 * qq} cm.\nArea of a rhombus = ½ × diagonal × diagonal = ½ × ${2 * p} × ${2 * qq} = ${2 * p * qq} cm².`,
        figure: { kind: 'polygon', sides: 4 },
      },
      `Một hình thoi có cạnh ${s} cm và một đường chéo dài ${2 * p} cm. Tính diện tích hình thoi (cm²).`,
      `Hai đường chéo hình thoi vuông góc tại trung điểm mỗi đường, nên nửa đường chéo đã biết (${p}), nửa đường chéo kia và cạnh (${s}) tạo thành tam giác vuông có cạnh huyền ${s}.\nĐịnh lí Pythagore: (nửa đường chéo kia)² = ${s}² − ${p}² = ${s * s} − ${p * p} = ${qq * qq}, nên nửa đó bằng ${qq}, đường chéo kia dài ${2 * qq} cm.\nDiện tích hình thoi = ½ × tích hai đường chéo = ½ × ${2 * p} × ${2 * qq} = ${2 * p * qq} cm².`,
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
          explanation: `Joining the centre to every vertex splits a regular hexagon into 6 equilateral triangles of side ${a}.\nArea of an equilateral triangle of side a = (√3/4)·a² = (√3/4)·${a * a} = ${qradf(a * a, 4, 3).s}.\nHexagon = 6 × ${qradf(a * a, 4, 3).s} = ${ans.s} cm².`,
          figure: { kind: 'polygon', sides: 6 },
        },
        `Một lục giác đều có cạnh ${a} cm. Tính diện tích (cm²), viết dưới dạng căn thức tối giản.`,
        `Nối tâm với các đỉnh, lục giác đều được chia thành 6 tam giác đều cạnh ${a}.\nDiện tích tam giác đều cạnh a = (√3/4)·a² = (√3/4)·${a * a} = ${qradf(a * a, 4, 3).s}.\nLục giác = 6 × ${qradf(a * a, 4, 3).s} = ${ans.s} cm².`,
      );
    }
    const ans = qradf(a * a, 4, 3);
    return vi(
      {
        prompt: `An equilateral triangle has side ${a} cm. Find its area (cm²), in simplest radical form.`,
        ...choose(ans, [qradf(a * a, 2, 3), qradf(a, 2, 3), qn((a * a) / 2), qradf(a * a, 1, 3)]),
        explanation: `Area = ½ × base × height. The height from a vertex meets the opposite side at its midpoint, making a right triangle with hypotenuse ${a} and one leg ${a / 2}.\nPythagoras: h² = ${a}² − ${a / 2}² = ${a * a} − ${(a * a) / 4} = ${(3 * a * a) / 4}, so h = √${(3 * a * a) / 4} = ${qradf(a, 2, 3).s}.\nArea = ½ × ${a} × ${qradf(a, 2, 3).s} = ${ans.s} cm².`,
        figure: { kind: 'polygon', sides: 3 },
      },
      `Một tam giác đều có cạnh ${a} cm. Tính diện tích (cm²), viết dưới dạng căn thức tối giản.`,
      `Diện tích = ½ × đáy × chiều cao. Đường cao kẻ từ một đỉnh đi qua trung điểm cạnh đối diện, tạo tam giác vuông có cạnh huyền ${a} và một cạnh góc vuông ${a / 2}.\nĐịnh lí Pythagore: h² = ${a}² − ${a / 2}² = ${a * a} − ${(a * a) / 4} = ${(3 * a * a) / 4}, nên h = √${(3 * a * a) / 4} = ${qradf(a, 2, 3).s}.\nDiện tích = ½ × ${a} × ${qradf(a, 2, 3).s} = ${ans.s} cm².`,
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
          explanation: `Perimeter = the total length all the way round the shape.\nCutting the corner removes ${p} cm from one side and ${qq} cm from the other, but creates two new inside edges of exactly ${p} cm and ${qq} cm.\nSo the perimeter does not change: 2 × (${W} + ${H}) = 2 × ${W + H} = ${P} cm.`,
          figure: { kind: 'rect', w: W, h: H, unit: 'cm' },
        },
        `Từ một hình chữ nhật ${W} cm × ${H} cm, người ta cắt đi ở một góc một hình chữ nhật ${p} cm × ${qq} cm, còn lại hình chữ L. Tính chu vi hình chữ L (cm).`,
        `Chu vi = tổng độ dài đường bao quanh hình.\nCắt góc làm mất ${p} cm ở một cạnh và ${qq} cm ở cạnh kia, nhưng lại tạo ra hai cạnh mới bên trong dài đúng ${p} cm và ${qq} cm.\nNên chu vi không đổi: 2 × (${W} + ${H}) = 2 × ${W + H} = ${P} cm.`,
      );
    }
    const x = int(r, 1, 3);
    const ans = (W + 2 * x) * (H + 2 * x) - W * H;
    return vi(
      {
        prompt: `A rectangular garden ${W} m by ${H} m is surrounded by a path ${x} m wide on the outside. Find the area of the path (m²).`,
        ...choose(qn(ans), [qn(2 * x * (W + H)), qn((W + 2 * x) * (H + 2 * x)), qn((W + x) * (H + x) - W * H), qn(2 * x * (W + H) + x * x)]),
        explanation: `Garden + path is a bigger rectangle: the path adds ${x} m on EACH side, so it is ${W} + 2·${x} = ${W + 2 * x} m by ${H} + 2·${x} = ${H + 2 * x} m.\nPath = big rectangle − garden = ${W + 2 * x} × ${H + 2 * x} − ${W} × ${H} = ${(W + 2 * x) * (H + 2 * x)} − ${W * H} = ${ans} m².\nCareful: add ${x} m on both sides, and don't forget the four corner squares.`,
        figure: { kind: 'rect', w: W, h: H, unit: 'm' },
      },
      `Một mảnh vườn hình chữ nhật ${W} m × ${H} m, xung quanh bên ngoài có một lối đi rộng ${x} m. Tính diện tích lối đi (m²).`,
      `Vườn cùng lối đi là một hình chữ nhật lớn hơn: lối đi thêm ${x} m ở MỖI bên, nên kích thước là ${W} + 2·${x} = ${W + 2 * x} m và ${H} + 2·${x} = ${H + 2 * x} m.\nLối đi = hình chữ nhật lớn − vườn = ${W + 2 * x} × ${H + 2 * x} − ${W} × ${H} = ${(W + 2 * x) * (H + 2 * x)} − ${W * H} = ${ans} m².\nChú ý: cộng ${x} m ở cả hai bên, và đừng quên bốn hình vuông ở góc.`,
    );
  }
  if (r() < 0.5) {
    const a = 4 * int(r, 1, 5);
    const ans = (3 * a * a) / 8;
    return vi(
      {
        prompt: `Square ABCD has side ${a} cm. M and N are the midpoints of BC and CD. Find the area of triangle AMN (cm²).`,
        ...choose(qn(ans), [qn((a * a) / 2), qn((a * a) / 4), qn((3 * a * a) / 4), qn((a * a) / 8)]),
        explanation: `Area of AMN = square − the three right triangles in the corners (ABM, MCN, NDA).\nSquare = ${a}² = ${a * a}. M and N are midpoints, so BM = MC = CN = ND = ${a / 2}.\nABM = ½·${a}·${a / 2} = ${(a * a) / 4}; NDA = ½·${a}·${a / 2} = ${(a * a) / 4}; MCN = ½·${a / 2}·${a / 2} = ${(a * a) / 8}.\nAMN = ${a * a} − ${(a * a) / 4} − ${(a * a) / 4} − ${(a * a) / 8} = ${ans} cm².`,
        figure: { kind: 'rect', w: a, h: a, unit: 'cm' },
      },
      `Hình vuông ABCD có cạnh ${a} cm. M, N lần lượt là trung điểm của BC và CD. Tính diện tích tam giác AMN (cm²).`,
      `Diện tích AMN = hình vuông − ba tam giác vuông ở góc (ABM, MCN, NDA).\nHình vuông = ${a}² = ${a * a}. M, N là trung điểm nên BM = MC = CN = ND = ${a / 2}.\nABM = ½·${a}·${a / 2} = ${(a * a) / 4}; NDA = ½·${a}·${a / 2} = ${(a * a) / 4}; MCN = ½·${a / 2}·${a / 2} = ${(a * a) / 8}.\nAMN = ${a * a} − ${(a * a) / 4} − ${(a * a) / 4} − ${(a * a) / 8} = ${ans} cm².`,
    );
  }
  const w = int(r, 6, 16), h = int(r, 5, 12), x = int(r, 1, w - 1), y = int(r, 1, h - 1);
  const twice = 2 * w * h - x * h - (w - x) * y - w * (h - y);
  const ans = qf(twice, 2);
  return vi(
    {
      prompt: `Rectangle ABCD has AB = ${w} cm and BC = ${h} cm. E is on AB with AE = ${x} cm and F is on BC with BF = ${y} cm. Find the area of triangle DEF (cm²).`,
      ...choose(ans, [qf(w * h, 2), qf(twice + x * h, 2), qf(twice + (w - x) * y, 2), qf(twice + w * (h - y), 2)]),
      explanation: `Area of DEF = rectangle − the three right triangles in the corners: ADE, EBF, FCD.\nEB = ${w} − ${x} = ${w - x} and FC = ${h} − ${y} = ${h - y}.\nADE = ½·${x}·${h} = ${qf(x * h, 2).s}; EBF = ½·${w - x}·${y} = ${qf((w - x) * y, 2).s}; FCD = ½·${w}·${h - y} = ${qf(w * (h - y), 2).s}.\nDEF = ${w * h} − ${qf(x * h, 2).s} − ${qf((w - x) * y, 2).s} − ${qf(w * (h - y), 2).s} = ${ans.s} cm².`,
      figure: { kind: 'rect', w, h, unit: 'cm' },
    },
    `Hình chữ nhật ABCD có AB = ${w} cm, BC = ${h} cm. Điểm E thuộc AB với AE = ${x} cm, điểm F thuộc BC với BF = ${y} cm. Tính diện tích tam giác DEF (cm²).`,
    `Diện tích DEF = hình chữ nhật − ba tam giác vuông ở góc ADE, EBF, FCD.\nEB = ${w} − ${x} = ${w - x}, FC = ${h} − ${y} = ${h - y}.\nADE = ½·${x}·${h} = ${qf(x * h, 2).s}; EBF = ½·${w - x}·${y} = ${qf((w - x) * y, 2).s}; FCD = ½·${w}·${h - y} = ${qf(w * (h - y), 2).s}.\nDEF = ${w * h} − ${qf(x * h, 2).s} − ${qf((w - x) * y, 2).s} − ${qf(w * (h - y), 2).s} = ${ans.s} cm².`,
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
          explanation: `An exterior angle is the angle between one side and the next side extended. The exterior angles of ANY polygon add up to 360°.\nA regular ${n}-gon has ${n} equal exterior angles, so each is 360° ÷ ${n} = ${ext}°.`,
          figure: { kind: 'polygon', sides: n },
        },
        `Tính số đo mỗi góc ngoài của một đa giác đều ${n} cạnh.`,
        `Góc ngoài là góc tạo bởi một cạnh và phần kéo dài của cạnh kề. Tổng các góc ngoài của MỌI đa giác bằng 360°.\nĐa giác đều ${n} cạnh có ${n} góc ngoài bằng nhau, nên mỗi góc ngoài bằng 360° : ${n} = ${ext}°.`,
      );
    return vi(
      {
        prompt: `Find each interior angle of a regular ${n}-gon.`,
        ...chooseDeg(inn, [ext, 180 - 180 / n, (n - 2) * 180]),
        explanation: `Sum of the interior angles of a polygon with n sides = (n − 2) × 180° (from one vertex it splits into n − 2 triangles).\nHere n = ${n}: (${n} − 2) × 180° = ${n - 2} × 180° = ${(n - 2) * 180}°.\nRegular means all ${n} angles are equal: ${(n - 2) * 180}° ÷ ${n} = ${inn}°.\nCheck: 180° − 360°/${n} = 180° − ${ext}° = ${inn}°.`,
        figure: { kind: 'polygon', sides: n, askAngle: true },
      },
      `Tính số đo mỗi góc trong của một đa giác đều ${n} cạnh.`,
      `Tổng các góc trong của đa giác n cạnh = (n − 2) × 180° (từ một đỉnh chia được thành n − 2 tam giác).\nỞ đây n = ${n}: (${n} − 2) × 180° = ${n - 2} × 180° = ${(n - 2) * 180}°.\nĐa giác đều có ${n} góc bằng nhau: ${(n - 2) * 180}° : ${n} = ${inn}°.\nKiểm tra: 180° − 360°/${n} = 180° − ${ext}° = ${inn}°.`,
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
          explanation: `Isosceles at A means AB = AC, so the base angles B and C are equal.\nThe angles of a triangle add up to 180°: B + C = 180° − ${x}° = ${180 - x}°.\nB = C = ${180 - x}° ÷ 2 = ${b}°.`,
          figure: { kind: 'triangle', angles: [b, b, x], ask: 0 },
        },
        `Tam giác ABC cân tại A có góc A = ${x}°. Tính góc B.`,
        `Tam giác cân tại A thì AB = AC, nên hai góc ở đáy B và C bằng nhau.\nTổng ba góc của tam giác bằng 180°: B + C = 180° − ${x}° = ${180 - x}°.\nB = C = ${180 - x}° : 2 = ${b}°.`,
      );
    }
    const y = int(r, 25, 80);
    return vi(
      {
        prompt: `Triangle ABC is isosceles at A with angle B = ${y}°. Find angle A.`,
        ...chooseDeg(180 - 2 * y, [180 - y, 2 * y, 90 - y, y]),
        explanation: `Isosceles at A means AB = AC, so the base angles are equal: C = B = ${y}°.\nThe angles of a triangle add up to 180°: A = 180° − ${y}° − ${y}° = 180° − ${2 * y}° = ${180 - 2 * y}°.`,
        figure: { kind: 'triangle', angles: [y, y, 180 - 2 * y], ask: 2 },
      },
      `Tam giác ABC cân tại A có góc B = ${y}°. Tính góc A.`,
      `Tam giác cân tại A thì hai góc ở đáy bằng nhau: C = B = ${y}°.\nTổng ba góc của tam giác bằng 180°: A = 180° − ${y}° − ${y}° = 180° − ${2 * y}° = ${180 - 2 * y}°.`,
    );
  }
  if (d === 3) {
    if (r() < 0.5) {
      const a = int(r, 25, 80), e = int(r, a + 20, 160);
      return vi(
        {
          prompt: `In triangle ABC the exterior angle at C is ${e}° and angle A = ${a}°. Find angle B.`,
          ...chooseDeg(e - a, [180 - e, 180 - e - a, e + a, a]),
          explanation: `The exterior angle at C sits next to angle C, so it is 180° − C. Since A + B + C = 180°, it also equals A + B. Rule: an exterior angle = the sum of the two interior angles not next to it.\n${e}° = ${a}° + B, so B = ${e}° − ${a}° = ${e - a}°.`,
          figure: { kind: 'triangle', angles: [a, e - a, 180 - e], ask: 1 },
        },
        `Tam giác ABC có góc ngoài tại đỉnh C bằng ${e}° và góc A = ${a}°. Tính góc B.`,
        `Góc ngoài tại C kề bù với góc C nên bằng 180° − C. Mà A + B + C = 180° nên góc ngoài cũng bằng A + B. Tính chất: góc ngoài của tam giác bằng tổng hai góc trong không kề với nó.\n${e}° = ${a}° + B, nên B = ${e}° − ${a}° = ${e - a}°.`,
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
        explanation: `The angles of a triangle add up to 180°: C = 180° − ${x}° − ${y}° = ${C}°.\nCD is the bisector of angle C (it cuts C into two equal halves): ACD = ${C}° ÷ 2 = ${C / 2}°.\nIn triangle ADC: ADC = 180° − A − ACD = 180° − ${x}° − ${C / 2}° = ${ans}°.`,
        figure: { kind: 'triangle', angles: [x, y, C] },
      },
      `Tam giác ABC có góc A = ${x}°, góc B = ${y}°. Tia phân giác của góc C cắt AB tại D. Tính góc ADC.`,
      `Tổng ba góc của tam giác bằng 180°: C = 180° − ${x}° − ${y}° = ${C}°.\nCD là tia phân giác của góc C (chia góc C thành hai góc bằng nhau): ACD = ${C}° : 2 = ${C / 2}°.\nTrong tam giác ADC: ADC = 180° − A − ACD = 180° − ${x}° − ${C / 2}° = ${ans}°.`,
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
          explanation: `The angles of triangle ABC add up to 180°: B + C = 180° − ${x}° = ${180 - x}°.\nBI and CI are bisectors (they cut B and C in half): IBC + ICB = ${180 - x}° ÷ 2 = ${(180 - x) / 2}°.\nIn triangle BIC: BIC = 180° − ${(180 - x) / 2}° = ${90 + x / 2}°. (Shortcut: BIC = 90° + A/2.)`,
          figure: { kind: 'triangle', angles: [x, y, 180 - x - y] },
        },
        `Tam giác ABC có góc A = ${x}°. Các tia phân giác của góc B và góc C cắt nhau tại I. Tính góc BIC.`,
        `Tổng ba góc của tam giác ABC bằng 180°: B + C = 180° − ${x}° = ${180 - x}°.\nBI, CI là tia phân giác (chia đôi góc B và góc C): IBC + ICB = ${180 - x}° : 2 = ${(180 - x) / 2}°.\nTrong tam giác BIC: BIC = 180° − ${(180 - x) / 2}° = ${90 + x / 2}°. (Công thức nhanh: BIC = 90° + A/2.)`,
      );
    }
    const n = int(r, 6, 14);
    const S = (n - 2) * 180;
    return vi(
      {
        prompt: `The interior angles of a convex polygon add up to ${S}°. How many diagonals does it have?`,
        ...choose(qn((n * (n - 3)) / 2), [qn(n * (n - 3)), qn((n * (n - 1)) / 2), qn(n - 3), qn(((n + 2) * (n - 1)) / 2)]),
        explanation: `Sum of interior angles = (n − 2) × 180°, where n is the number of sides: (n − 2) × 180° = ${S}° ⇒ n − 2 = ${S} ÷ 180 = ${n - 2} ⇒ n = ${n}.\nA diagonal joins two vertices that are not next to each other: from each vertex there are n − 3 = ${n - 3} (not to itself or its 2 neighbours).\nEach diagonal is counted twice (once from each end): ${n} × ${n - 3} ÷ 2 = ${(n * (n - 3)) / 2}.`,
        figure: { kind: 'polygon', sides: n },
      },
      `Tổng các góc trong của một đa giác lồi bằng ${S}°. Đa giác đó có bao nhiêu đường chéo?`,
      `Tổng các góc trong = (n − 2) × 180° với n là số cạnh: (n − 2) × 180° = ${S}° ⇒ n − 2 = ${S} : 180 = ${n - 2} ⇒ n = ${n}.\nĐường chéo nối hai đỉnh không kề nhau: từ mỗi đỉnh có n − 3 = ${n - 3} đường chéo (trừ chính nó và 2 đỉnh kề).\nMỗi đường chéo được đếm hai lần (từ hai đầu): ${n} × ${n - 3} : 2 = ${(n * (n - 3)) / 2}.`,
    );
  }
  if (r() < 0.5) {
    const x = 4 * int(r, 5, 30);
    const B = (180 - x) / 2, ans = 180 - x - B / 2;
    return vi(
      {
        prompt: `Triangle ABC is isosceles at A with angle A = ${x}°. The bisector of angle B meets AC at D. Find angle ADB.`,
        ...chooseDeg(ans, [x + B / 2, 180 - x - B, 180 - (3 * B) / 2, 90 + B / 2]),
        explanation: `Isosceles at A, so the base angles are equal: B = C = (180° − ${x}°) ÷ 2 = ${180 - x}° ÷ 2 = ${B}°.\nBD bisects angle B (cuts it in half): ABD = ${B}° ÷ 2 = ${B / 2}°.\nIn triangle ABD: ADB = 180° − A − ABD = 180° − ${x}° − ${B / 2}° = ${ans}°.`,
        figure: { kind: 'triangle', angles: [B, B, x] },
      },
      `Tam giác ABC cân tại A có góc A = ${x}°. Tia phân giác của góc B cắt AC tại D. Tính góc ADB.`,
      `Tam giác cân tại A nên hai góc ở đáy bằng nhau: B = C = (180° − ${x}°) : 2 = ${180 - x}° : 2 = ${B}°.\nBD là tia phân giác góc B: ABD = ${B}° : 2 = ${B / 2}°.\nTrong tam giác ABD: ADB = 180° − A − ABD = 180° − ${x}° − ${B / 2}° = ${ans}°.`,
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
      explanation: `The angles of a triangle add up to 180°: A = 180° − ${y}° − ${z}° = ${x}°. AD bisects A: BAD = ${x}° ÷ 2 = ${x / 2}°.\nAH is the altitude (AH ⟂ BC), so ABH is a right triangle: BAH = 90° − B = 90° − ${y}° = ${90 - y}°.\nHAD is the gap between these two angles: |${x / 2}° − ${90 - y}°| = ${ans}°.\n(Shortcut: HAD = |B − C| ÷ 2 = |${y}° − ${z}°| ÷ 2 = ${ans}°.)`,
      figure: { kind: 'triangle', angles: [y, z, x] },
    },
    `Tam giác ABC có góc B = ${y}°, góc C = ${z}°. AH là đường cao, AD là tia phân giác kẻ từ A. Tính góc HAD.`,
    `Tổng ba góc của tam giác bằng 180°: A = 180° − ${y}° − ${z}° = ${x}°. AD là tia phân giác: BAD = ${x}° : 2 = ${x / 2}°.\nAH là đường cao (AH ⟂ BC) nên tam giác ABH vuông tại H: BAH = 90° − B = 90° − ${y}° = ${90 - y}°.\nHAD là hiệu hai góc đó: |${x / 2}° − ${90 - y}°| = ${ans}°.\n(Công thức nhanh: HAD = |B − C| : 2 = |${y}° − ${z}°| : 2 = ${ans}°.)`,
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
          explanation: `R is the radius (the distance from the centre to the circle). Area of a circle: S = πR² (π times the radius squared).\nS = π × ${R}² = π × ${R * R} = ${qpi(R * R).s} cm².\nCareful: 2πR = ${qpi(2 * R).s} is the circumference (the length round the circle), not the area.`,
          figure,
        },
        `Một đường tròn có bán kính ${R} cm. Tính diện tích hình tròn theo π (cm²).`,
        `R là bán kính (khoảng cách từ tâm đến đường tròn). Diện tích hình tròn: S = πR² (π nhân bình phương bán kính).\nS = π × ${R}² = π × ${R * R} = ${qpi(R * R).s} cm².\nChú ý: 2πR = ${qpi(2 * R).s} là chu vi (độ dài đường tròn), không phải diện tích.`,
      );
    return vi(
      {
        prompt: `A circle has diameter ${2 * R} cm. Find its area in terms of π (cm²).`,
        ...choose(qpi(R * R), [qpi(4 * R * R), qpi(2 * R), qpi(R), qpi(2 * R * R)]),
        explanation: `The radius is half the diameter: R = ${2 * R} ÷ 2 = ${R} cm.\nArea of a circle: S = πR² = π × ${R}² = π × ${R * R} = ${qpi(R * R).s} cm².\nCareful: put the radius, not the diameter, into πR².`,
        figure,
      },
      `Một đường tròn có đường kính ${2 * R} cm. Tính diện tích hình tròn theo π (cm²).`,
      `Bán kính bằng nửa đường kính: R = ${2 * R} : 2 = ${R} cm.\nDiện tích hình tròn: S = πR² = π × ${R}² = π × ${R * R} = ${qpi(R * R).s} cm².\nChú ý: thay bán kính (không phải đường kính) vào πR².`,
    );
  }
  if (d === 2) {
    if (r() < 0.5) {
      const ans = plus(qpi(R), qn(2 * R));
      return vi(
        {
          prompt: `Find the perimeter of a semicircle of radius ${R} cm, in terms of π (cm).`,
          ...choose(ans, [qpi(R), plus(qpi(2 * R), qn(2 * R)), plus(qpi(R), qn(R)), qpi(2 * R)]),
          explanation: `Perimeter of a semicircle = the curved half + the straight diameter.\nCurved half = ½ × circumference = ½ × 2πR = π × ${R} = ${qpi(R).s}.\nDiameter = 2 × ${R} = ${2 * R}.\nPerimeter = ${ans.s} cm. Careful: don't forget the straight edge.`,
          figure,
        },
        `Tính chu vi của nửa hình tròn bán kính ${R} cm theo π (cm).`,
        `Chu vi nửa hình tròn = nửa đường tròn + đường kính.\nNửa đường tròn = ½ × chu vi = ½ × 2πR = π × ${R} = ${qpi(R).s}.\nĐường kính = 2 × ${R} = ${2 * R}.\nChu vi = ${ans.s} cm. Chú ý: đừng quên cạnh thẳng (đường kính).`,
      );
    }
    const ans = qpi(R * R, 2);
    return vi(
      {
        prompt: `Find the area of a semicircle of radius ${R} cm, in terms of π (cm²).`,
        ...choose(ans, [qpi(R * R), qpi(R), qpi(R * R, 4), qpi(2 * R * R)]),
        explanation: `Area of a whole circle = πR² = π × ${R}² = ${qpi(R * R).s}.\nA semicircle is half of it: ${qpi(R * R).s} ÷ 2 = ${ans.s} cm².`,
        figure,
      },
      `Tính diện tích nửa hình tròn bán kính ${R} cm theo π (cm²).`,
      `Diện tích cả hình tròn = πR² = π × ${R}² = ${qpi(R * R).s}.\nNửa hình tròn bằng một nửa: ${qpi(R * R).s} : 2 = ${ans.s} cm².`,
    );
  }
  if (d === 3) {
    const k = pick(r, [2, 3, 4, 5, 8, 9, 16]);
    const ans = qroot(R * R * k);
    return vi(
      {
        prompt: `Circle (O) has radius ${R} cm. A second circle has an area ${k} times as large. Find its radius (cm).`,
        ...choose(ans, [qn(k * R), qroot(R * k), qf(k * R, 2), qn(k * k * R)]),
        explanation: `Area of a circle = πR² (R = radius). Call the new radius R′: πR′² = ${k} × π × ${R}².\nDivide both sides by π: R′² = ${k} × ${R * R} = ${k * R * R}.\nR′ = ${rootText(k * R * R)} cm.\nCareful: ${k} times the area does not mean ${k} times the radius (the radius is squared).`,
        figure,
      },
      `Đường tròn (O) có bán kính ${R} cm. Một hình tròn khác có diện tích gấp ${k} lần. Tính bán kính của nó (cm).`,
      `Diện tích hình tròn = πR² (R là bán kính). Gọi bán kính mới là R′: πR′² = ${k} × π × ${R}².\nChia hai vế cho π: R′² = ${k} × ${R * R} = ${k * R * R}.\nR′ = ${rootText(k * R * R)} cm.\nChú ý: diện tích gấp ${k} lần không có nghĩa bán kính gấp ${k} lần (bán kính được bình phương).`,
    );
  }
  if (d === 4) {
    const ans = minus(qn(4 * R * R), qpi(R * R));
    return vi(
      {
        prompt: `A circle of radius ${R} cm is inscribed in a square. Find the area inside the square but outside the circle, in terms of π (cm²).`,
        ...choose(ans, [minus(qn(4 * R * R), qpi(2 * R)), qpi(R * R), minus(qn(16 * R * R), qpi(R * R)), qn(4 * R * R)]),
        explanation: `The circle is inscribed: it touches all four sides, so the square's side = the diameter = 2 × ${R} = ${2 * R} cm.\nSquare = ${2 * R}² = ${4 * R * R}. Circle = πR² = π × ${R}² = ${qpi(R * R).s}.\nArea between them = square − circle = ${ans.s} cm².`,
        figure,
      },
      `Một đường tròn bán kính ${R} cm nội tiếp một hình vuông. Tính diện tích phần hình vuông nằm ngoài hình tròn theo π (cm²).`,
      `Đường tròn nội tiếp hình vuông tiếp xúc với cả bốn cạnh, nên cạnh hình vuông = đường kính = 2 × ${R} = ${2 * R} cm.\nHình vuông = ${2 * R}² = ${4 * R * R}. Hình tròn = πR² = π × ${R}² = ${qpi(R * R).s}.\nPhần cần tìm = hình vuông − hình tròn = ${ans.s} cm².`,
    );
  }
  if (r() < 0.5) {
    const ans = minus(qpi(R * R), qn(2 * R * R));
    return vi(
      {
        prompt: `A square is inscribed in a circle of radius ${R} cm. Find the area inside the circle but outside the square, in terms of π (cm²).`,
        ...choose(ans, [minus(qpi(R * R), qn(R * R)), minus(qn(4 * R * R), qpi(R * R)), qn(2 * R * R), minus(qpi(2 * R), qn(2 * R * R))]),
        explanation: `The square is inscribed: its corners are on the circle, so each diagonal is a diameter = 2 × ${R} = ${2 * R} cm.\nA square is a rhombus, so its area = ½ × diagonal × diagonal = ½ × ${2 * R} × ${2 * R} = ${2 * R * R}.\nCircle = πR² = π × ${R}² = ${qpi(R * R).s}. Area between = circle − square = ${ans.s} cm².`,
        figure,
      },
      `Một hình vuông nội tiếp đường tròn bán kính ${R} cm. Tính diện tích phần hình tròn nằm ngoài hình vuông theo π (cm²).`,
      `Hình vuông nội tiếp đường tròn có bốn đỉnh nằm trên đường tròn, nên mỗi đường chéo là một đường kính = 2 × ${R} = ${2 * R} cm.\nDiện tích hình vuông = ½ × tích hai đường chéo = ½ × ${2 * R} × ${2 * R} = ${2 * R * R}.\nHình tròn = πR² = π × ${R}² = ${qpi(R * R).s}. Phần cần tìm = hình tròn − hình vuông = ${ans.s} cm².`,
    );
  }
  const p = int(r, 1, 5);
  const ans = qpi(2 * R * p + p * p);
  return vi(
    {
      prompt: `The radius of a circle is increased from ${R} cm to ${R + p} cm. By how much does its area increase, in terms of π (cm²)?`,
      ...choose(ans, [qpi(p * p), qpi(2 * p), qpi(2 * R * p), qpi((R + p) * (R + p))]),
      explanation: `Area of a circle = πR². Increase = new area − old area = π × ${R + p}² − π × ${R}².\n= π(${(R + p) * (R + p)} − ${R * R}) = ${ans.s} cm².\nCareful: (${R} + ${p})² = ${(R + p) * (R + p)}, not ${R}² + ${p}² = ${R * R + p * p}.`,
      figure,
    },
    `Bán kính của một hình tròn tăng từ ${R} cm lên ${R + p} cm. Diện tích hình tròn tăng thêm bao nhiêu (theo π, cm²)?`,
    `Diện tích hình tròn = πR². Phần tăng = diện tích mới − diện tích cũ = π × ${R + p}² − π × ${R}².\n= π(${(R + p) * (R + p)} − ${R * R}) = ${ans.s} cm².\nChú ý: (${R} + ${p})² = ${(R + p) * (R + p)}, không phải ${R}² + ${p}² = ${R * R + p * p}.`,
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
    const step = giveHyp ? `AC² = BC² − AB² = ${c * c} − ${p * p} = ${qq * qq}, AC = ${qq}` : `BC² = AB² + AC² = ${p * p} + ${qq * qq} = ${c * c}, BC = ${c}`;
    return vi(
      {
        prompt: `Triangle ABC is right-angled at A with ${given}. Find ${f} ${at}.`,
        ...choose(val[f], FNS.filter((g) => g !== f).map((g) => val[g])),
        explanation: `In a right triangle, for an acute angle: the opposite side is across from it, the adjacent side touches it (and is not the hypotenuse), and the hypotenuse BC is opposite the right angle A.\nFind the missing side with Pythagoras: ${step}.\nFor angle ${at}: opposite = ${opp}, adjacent = ${adj}, hypotenuse = ${c}.\nsin = opposite/hypotenuse, cos = adjacent/hypotenuse, tan = opposite/adjacent, cot = adjacent/opposite.\nSo ${f} ${at} = ${({ sin: `${opp}/${c}`, cos: `${adj}/${c}`, tan: `${opp}/${adj}`, cot: `${adj}/${opp}` } as Record<Fn, string>)[f]}${({ sin: `${opp}/${c}`, cos: `${adj}/${c}`, tan: `${opp}/${adj}`, cot: `${adj}/${opp}` } as Record<Fn, string>)[f] === val[f].s ? '' : ` = ${val[f].s}`}.`,
        figure: rt(p, qq, c, giveHyp ? 'b' : 'c'),
      },
      `Tam giác ABC vuông tại A có ${givenVi}. Tính ${f} ${at}.`,
      `Trong tam giác vuông, với một góc nhọn: cạnh đối nằm đối diện góc, cạnh kề nằm sát góc (không phải cạnh huyền), cạnh huyền BC đối diện góc vuông A.\nTính cạnh còn thiếu bằng định lí Pythagore: ${step}.\nVới góc ${at}: cạnh đối = ${opp}, cạnh kề = ${adj}, cạnh huyền = ${c}.\n${RATIO_VI}.\nVậy ${f} ${at} = ${({ sin: `${opp}/${c}`, cos: `${adj}/${c}`, tan: `${opp}/${adj}`, cot: `${adj}/${opp}` } as Record<Fn, string>)[f]}${({ sin: `${opp}/${c}`, cos: `${adj}/${c}`, tan: `${opp}/${adj}`, cot: `${adj}/${opp}` } as Record<Fn, string>)[f] === val[f].s ? '' : ` = ${val[f].s}`}.`,
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
        explanation: `Exact values to remember: ${tbl}.\nSquare them: ${f1}²${a1}° = ${fracN(v(f1, a1), 12)}, ${f2}²${a2}° = ${fracN(v(f2, a2), 12)}.\nSubstitute: ${p1}·${fracN(v(f1, a1), 12)} ${sg > 0 ? '+' : '−'} ${p2}·${fracN(v(f2, a2), 12)} = ${fracN(p1 * v(f1, a1), 12)} ${sg > 0 ? '+' : '−'} ${fracN(p2 * v(f2, a2), 12)} = ${ans.s}.`,
      },
      `Tính: ${e}`,
      `Các giá trị lượng giác đặc biệt: ${tbl.replace(/(\d),(\s)/g, '$1;$2')}.\nBình phương: ${f1}²${a1}° = ${fracN(v(f1, a1), 12)}, ${f2}²${a2}° = ${fracN(v(f2, a2), 12)}.\nThay vào: ${p1}·${fracN(v(f1, a1), 12)} ${sg > 0 ? '+' : '−'} ${p2}·${fracN(v(f2, a2), 12)} = ${fracN(p1 * v(f1, a1), 12)} ${sg > 0 ? '+' : '−'} ${fracN(p2 * v(f2, a2), 12)} = ${ans.s}.`,
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
          explanation: `Two angles are complementary when they add up to 90° (${a}° + ${90 - a}° = 90°, ${b}° + ${90 - b}° = 90°).\nRules: sin(90° − α) = cos α, cos(90° − α) = sin α, tan(90° − α) = cot α; also sin²α + cos²α = 1 and tan α·cot α = 1.\n${kind === 0 ? `sin²${a}° + sin²${90 - a}° = sin²${a}° + cos²${a}° = 1, and tan ${b}°·tan ${90 - b}° = tan ${b}°·cot ${b}° = 1.\nSo the value = 1 − ${p}·1 = ${num(ans)}.` : kind === 1 ? `sin ${a}°/cos ${90 - a}° = sin ${a}°/sin ${a}° = 1, and tan ${b}°·cot ${b}° = 1.\nSo the value = 1 + ${p}·1 = ${num(ans)}.` : `tan ${b}°/cot ${90 - b}° = tan ${b}°/tan ${b}° = 1, and cos²${a}° + cos²${90 - a}° = cos²${a}° + sin²${a}° = 1.\nSo the value = ${p}·1 − 1 = ${num(ans)}.`}`,
        },
        `Tính: ${e}`,
        `Hai góc phụ nhau khi tổng bằng 90° (${a}° + ${90 - a}° = 90°, ${b}° + ${90 - b}° = 90°).\nTính chất: sin(90° − α) = cos α, cos(90° − α) = sin α, tan(90° − α) = cot α; và sin²α + cos²α = 1, tan α·cot α = 1.\n${kind === 0 ? `sin²${a}° + sin²${90 - a}° = sin²${a}° + cos²${a}° = 1, và tan ${b}°·tan ${90 - b}° = tan ${b}°·cot ${b}° = 1.\nVậy giá trị = 1 − ${p}·1 = ${num(ans)}.` : kind === 1 ? `sin ${a}°/cos ${90 - a}° = sin ${a}°/sin ${a}° = 1, và tan ${b}°·cot ${b}° = 1.\nVậy giá trị = 1 + ${p}·1 = ${num(ans)}.` : `tan ${b}°/cot ${90 - b}° = tan ${b}°/tan ${b}° = 1, và cos²${a}° + cos²${90 - a}° = cos²${a}° + sin²${a}° = 1.\nVậy giá trị = ${p}·1 − 1 = ${num(ans)}.`}`,
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
        explanation: `Rule: sin²α + cos²α = 1 for every angle α.\n${SWAP[g]}²α = 1 − (${val[g].s})² = 1 − ${(g === 'sin' ? opp : adj) ** 2}/${hyp * hyp} = ${(g === 'sin' ? adj : opp) ** 2}/${hyp * hyp}, so ${SWAP[g]} α = ${val[SWAP[g]].s} (positive, because α is acute).\nThen tan α = sin α/cos α and cot α = cos α/sin α: ${f} α = ${val[f].s}.`,
      },
      `Cho α là góc nhọn có ${g} α = ${val[g].s}. Tính ${f} α.`,
      `Hệ thức: sin²α + cos²α = 1 với mọi góc α.\n${SWAP[g]}²α = 1 − (${val[g].s})² = 1 − ${(g === 'sin' ? opp : adj) ** 2}/${hyp * hyp} = ${(g === 'sin' ? adj : opp) ** 2}/${hyp * hyp}, nên ${SWAP[g]} α = ${val[SWAP[g]].s} (dương vì α nhọn).\nRồi tan α = sin α/cos α, cot α = cos α/sin α: ${f} α = ${val[f].s}.`,
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
          explanation: `Triangle ABC is right-angled at A, so BC is the hypotenuse, and ${side} is the side ${side === 'AC' ? 'opposite' : 'adjacent to'} angle B.\n${side === 'AC' ? 'sin' : 'cos'} B = ${side}/BC (${side === 'AC' ? 'opposite' : 'adjacent'}/hypotenuse), so ${side} = BC·${side === 'AC' ? 'sin' : 'cos'} B.\n${side} = ${c}·${side === 'AC' ? 'sin' : 'cos'} ${b}° ≈ ${c}·${f(R(b)).toFixed(4)} ≈ ${ans.s} cm.`,
        },
        `Tam giác ABC vuông tại A có BC = ${c} cm và góc B = ${b}°. Tính ${side} (cm), làm tròn đến chữ số thập phân thứ hai.`,
        `Tam giác ABC vuông tại A nên BC là cạnh huyền, ${side} là cạnh ${side === 'AC' ? 'đối' : 'kề'} của góc B.\n${side === 'AC' ? 'sin' : 'cos'} B = ${side}/BC (${side === 'AC' ? 'đối' : 'kề'}/huyền), nên ${side} = BC·${side === 'AC' ? 'sin' : 'cos'} B.\n${side} = ${c}·${side === 'AC' ? 'sin' : 'cos'} ${b}° ≈ ${c}·${viN(f(R(b)).toFixed(4))} ≈ ${viN(ans.s)} cm.`,
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
        explanation: `For angle B: AC is the opposite side and AB the adjacent side, so tan B = opposite/adjacent = AC/AB = ${b}/${a} ≈ ${(b / a).toFixed(4)}.\nUse the calculator's inverse tan (SHIFT tan): B ≈ ${B}°.\n(Then C = 90° − B ≈ ${90 - B}°.)`,
      },
      `Tam giác ABC vuông tại A có AB = ${a} cm, AC = ${b} cm. Tính góc B (làm tròn đến độ).`,
      `Với góc B: AC là cạnh đối, AB là cạnh kề, nên tan B = đối/kề = AC/AB = ${b}/${a} ≈ ${viN((b / a).toFixed(4))}.\nDùng máy tính (SHIFT tan) để tìm góc: B ≈ ${B}°.\n(Khi đó C = 90° − B ≈ ${90 - B}°.)`,
    );
  }
  if (r() < 0.5) {
    const s = int(r, 8, 40), a = int(r, 25, 65);
    const ans = qdp(s * Math.tan(R(a)), 1);
    return vi(
      {
        prompt: `A pole casts a shadow ${s} m long when the sun's rays make an angle of ${a}° with the ground. How tall is the pole (m)? Round to 1 decimal place.`,
        ...choose(ans, [qdp(s * Math.sin(R(a)), 1), qdp(s * Math.cos(R(a)), 1), qdp(s / Math.tan(R(a)), 1), qdp(s / Math.cos(R(a)), 1), qdp(s * Math.tan(R(a)) * 2, 1), qdp(s * Math.tan(R(a)) + 1, 1)]),
        explanation: `The pole, its shadow and the sun's ray form a right triangle: the pole (height h) is opposite the ${a}° angle and the shadow (${s} m) is adjacent to it.\ntan ${a}° = opposite/adjacent = h/${s}, so h = ${s}·tan ${a}°.\nh ≈ ${s}·${Math.tan(R(a)).toFixed(4)} ≈ ${ans.s} m.`,
      },
      `Một cột cờ có bóng trên mặt đất dài ${s} m khi tia nắng mặt trời tạo với mặt đất một góc ${a}°. Tính chiều cao cột cờ (m), làm tròn đến chữ số thập phân thứ nhất.`,
      `Cột cờ, bóng của nó và tia nắng tạo thành tam giác vuông: cột cờ (chiều cao h) là cạnh đối của góc ${a}°, bóng (${s} m) là cạnh kề.\ntan ${a}° = đối/kề = h/${s}, nên h = ${s}·tan ${a}°.\nh ≈ ${s}·${viN(Math.tan(R(a)).toFixed(4))} ≈ ${viN(ans.s)} m.`,
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
      explanation: `Let h = the height and H = the foot of the tower. In each right triangle cot(angle) = adjacent/opposite = distance/h, so distance = h·cot(angle).\nAH = h·cot ${al}° and BH = h·cot ${be}°; A is ${dd} m farther away: AH − BH = ${dd}.\nh(cot ${al}° − cot ${be}°) = ${dd} ⇒ h = ${dd} ÷ (${(1 / ta).toFixed(4)} − ${(1 / tb).toFixed(4)}) ≈ ${ans.s} m.`,
    },
    `Từ điểm A trên mặt đất nhìn đỉnh một tòa tháp với góc nâng ${al}°. Đi thêm ${dd} m lại gần tháp đến điểm B thì góc nâng là ${be}°. Tính chiều cao tòa tháp (m), làm tròn đến chữ số thập phân thứ nhất.`,
    `Gọi h là chiều cao, H là chân tháp. Trong mỗi tam giác vuông, cot(góc) = kề/đối = khoảng cách/h, nên khoảng cách = h·cot(góc).\nAH = h·cot ${al}°, BH = h·cot ${be}°; A xa hơn B ${dd} m: AH − BH = ${dd}.\nh(cot ${al}° − cot ${be}°) = ${dd} ⇒ h = ${dd} : (${viN((1 / ta).toFixed(4))} − ${viN((1 / tb).toFixed(4))}) ≈ ${viN(ans.s)} m.`,
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
        explanation: `In a right triangle, the altitude AH to the hypotenuse cuts BC into BH and CH (the projections of the two legs). Rule: AH² = BH·CH.\nAH² = ${BH}·${CH} = ${BH * CH}.\nAH = √${BH * CH} = ${AH} cm.`,
      },
      `${SETUP_VI}. BH = ${BH} cm, CH = ${CH} cm. Tính AH (cm).`,
      `Trong tam giác vuông, đường cao AH chia cạnh huyền BC thành BH và CH (hình chiếu của hai cạnh góc vuông). Hệ thức: AH² = BH·CH.\nAH² = ${BH}·${CH} = ${BH * CH}.\nAH = √${BH * CH} = ${AH} cm.`,
    );
  if (d === 2) {
    const ans = qroot(BH * BC);
    return vi(
      {
        prompt: `${SETUP}. BH = ${BH} cm and BC = ${BC} cm. Find AB (cm), in simplest radical form.`,
        ...choose(ans, [qroot(CH * BC), qroot(BC * BC - BH * BH), qn(BH * BC), qroot(BH * CH)]),
        explanation: `BH is the projection of leg AB on the hypotenuse BC. Rule: leg² = hypotenuse × its projection, so AB² = BC·BH.\nAB² = ${BC}·${BH} = ${BH * BC}.\nAB = ${rootText(BH * BC)} cm.\nCareful: use BH (the piece next to B), not CH.`,
      },
      `${SETUP_VI}. BH = ${BH} cm, BC = ${BC} cm. Tính AB (cm), viết dưới dạng căn thức tối giản.`,
      `BH là hình chiếu của cạnh góc vuông AB trên cạnh huyền BC. Hệ thức: bình phương cạnh góc vuông = cạnh huyền × hình chiếu của nó, nên AB² = BC·BH.\nAB² = ${BC}·${BH} = ${BH * BC}.\nAB = ${rootText(BH * BC)} cm.\nChú ý: dùng BH (đoạn kề B), không dùng CH.`,
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
          explanation: `BC is the hypotenuse. Pythagoras: BC² = AB² + AC² = ${p * p} + ${qq * qq} = ${c * c}, so BC = ${c}.\nThe area can be found two ways: ½·AB·AC (the two legs) = ½·BC·AH (hypotenuse × altitude). So AH·BC = AB·AC.\nAH = AB·AC ÷ BC = ${p}·${qq} ÷ ${c} = ${p * qq}/${c}${fracN(p * qq, c) === `${p * qq}/${c}` ? '' : ` = ${ans.s}`} cm.`,
        },
        `${SETUP_VI}. AB = ${p} cm, AC = ${qq} cm. Tính AH (cm).`,
        `BC là cạnh huyền. Định lí Pythagore: BC² = AB² + AC² = ${p * p} + ${qq * qq} = ${c * c}, nên BC = ${c}.\nTính diện tích theo hai cách: ½·AB·AC = ½·BC·AH. Nên AH·BC = AB·AC.\nAH = AB·AC : BC = ${p}·${qq} : ${c} = ${p * qq}/${c}${fracN(p * qq, c) === `${p * qq}/${c}` ? '' : ` = ${ans.s}`} cm.`,
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
        explanation: `Rule for the altitude to the hypotenuse: 1/AH² = 1/AB² + 1/AC².\n1/AH² = 1/${a * a} + 1/${b * b} = ${b * b}/${a * a * b * b} + ${a * a}/${a * a * b * b} = ${N}/${a * a * b * b}.\nTurn both sides upside down: AH² = ${a * a * b * b}/${N}, so AH = ${a * b}/√${N}${c > 1 ? ` = ${a * b}/${rad(c, s)}` : ''}.\nRemove the root from the denominator (multiply top and bottom by √${s}): AH = ${a * b}√${s}/${c * s} = ${ans.s} cm.`,
      },
      `${SETUP_VI}. AB = ${a} cm, AC = ${b} cm. Dùng hệ thức 1/AH² = 1/AB² + 1/AC² để tính AH (cm), trục căn thức ở mẫu.`,
      `Hệ thức đường cao: 1/AH² = 1/AB² + 1/AC².\n1/AH² = 1/${a * a} + 1/${b * b} = ${b * b}/${a * a * b * b} + ${a * a}/${a * a * b * b} = ${N}/${a * a * b * b}.\nNghịch đảo hai vế: AH² = ${a * a * b * b}/${N}, nên AH = ${a * b}/√${N}${c > 1 ? ` = ${a * b}/${rad(c, s)}` : ''}.\nTrục căn thức ở mẫu (nhân cả tử và mẫu với √${s}): AH = ${a * b}√${s}/${c * s} = ${ans.s} cm.`,
    );
  }
  if (d === 4) {
    if (r() < 0.5)
      return vi(
        {
          prompt: `${SETUP}. AH = ${AH} cm and BH = ${BH} cm. Find BC (cm).`,
          ...choose(qn(BC), [qn(CH), qn(BH + AH), qroot(AH * AH + BH * BH), qn(2 * AH)]),
          explanation: `BH and CH are the two pieces of the hypotenuse BC. Rule: AH² = BH·CH.\n${AH}² = ${BH}·CH ⇒ ${AH * AH} = ${BH}·CH ⇒ CH = ${AH * AH} ÷ ${BH} = ${CH}.\nBC = BH + CH = ${BH} + ${CH} = ${BC} cm.`,
        },
        `${SETUP_VI}. AH = ${AH} cm, BH = ${BH} cm. Tính BC (cm).`,
        `BH và CH là hai đoạn của cạnh huyền BC. Hệ thức: AH² = BH·CH.\n${AH}² = ${BH}·CH ⇒ ${AH * AH} = ${BH}·CH ⇒ CH = ${AH * AH} : ${BH} = ${CH}.\nBC = BH + CH = ${BH} + ${CH} = ${BC} cm.`,
      );
    const ans = qroot(CH * BC);
    return vi(
      {
        prompt: `${SETUP}. AH = ${AH} cm and BH = ${BH} cm. Find AC (cm), in simplest radical form.`,
        ...choose(ans, [qroot(BH * BC), qroot(AH * AH + BH * BH + 1), qn(CH), qroot(CH * CH - AH * AH)]),
        explanation: `Rule AH² = BH·CH: CH = ${AH * AH} ÷ ${BH} = ${CH}, so BC = BH + CH = ${BH} + ${CH} = ${BC}.\nRule leg² = hypotenuse × its projection (CH is the projection of AC): AC² = BC·CH = ${BC}·${CH} = ${CH * BC}.\nAC = ${rootText(CH * BC)} cm.\n(Check with Pythagoras in triangle AHC: AC² = AH² + CH² = ${AH * AH} + ${CH * CH} = ${CH * BC}.)`,
      },
      `${SETUP_VI}. AH = ${AH} cm, BH = ${BH} cm. Tính AC (cm), viết dưới dạng căn thức tối giản.`,
      `Hệ thức AH² = BH·CH: CH = ${AH * AH} : ${BH} = ${CH}, nên BC = BH + CH = ${BH} + ${CH} = ${BC}.\nHệ thức cạnh góc vuông² = cạnh huyền × hình chiếu (CH là hình chiếu của AC): AC² = BC·CH = ${BC}·${CH} = ${CH * BC}.\nAC = ${rootText(CH * BC)} cm.\n(Kiểm tra bằng Pythagore trong tam giác AHC: AC² = AH² + CH² = ${AH * AH} + ${CH * CH} = ${CH * BC}.)`,
    );
  }
  if (r() < 0.5) {
    const [small, big] = [Math.min(BH, CH), Math.max(BH, CH)];
    return vi(
      {
        prompt: `${SETUP}, and AB < AC. BC = ${BC} cm and AH = ${AH} cm. Find BH (cm).`,
        ...choose(qn(small), [qn(big), qf(BC, 2), qn(AH), qf(AH * AH, BC)]),
        explanation: `BH + CH = BC = ${BC}, and by the rule AH² = BH·CH: BH·CH = ${AH * AH}.\nTwo numbers with sum ${BC} and product ${AH * AH} are the roots of x² − ${BC}x + ${AH * AH} = 0 (Viète in reverse).\nΔ = ${BC}² − 4·${AH * AH} = ${(big - small) * (big - small)}, √Δ = ${big - small}: x = (${BC} ± ${big - small})/2, i.e. ${small} or ${big}.\nAB < AC means B's projection is the shorter piece: BH < CH, so BH = ${small} cm.`,
      },
      `${SETUP_VI}, AB < AC. BC = ${BC} cm, AH = ${AH} cm. Tính BH (cm).`,
      `BH + CH = BC = ${BC}, và theo hệ thức AH² = BH·CH: BH·CH = ${AH * AH}.\nHai số có tổng ${BC} và tích ${AH * AH} là nghiệm của x² − ${BC}x + ${AH * AH} = 0 (Vi-ét đảo).\nΔ = ${BC}² − 4·${AH * AH} = ${(big - small) * (big - small)}, √Δ = ${big - small}: x = (${BC} ± ${big - small})/2, tức ${small} hoặc ${big}.\nAB < AC nên hình chiếu BH ngắn hơn CH, vậy BH = ${small} cm.`,
    );
  }
  const [p, qq, c] = pick(r, [[3, 4, 5], [4, 3, 5]] as const);
  const j = int(r, 1, 4);
  const AB = p * c * j, AC = qq * c * j, bc = c * c * j, bh = p * p * j;
  return vi(
    {
      prompt: `${SETUP}. AB = ${AB} cm and BH = ${bh} cm. Find the area of triangle ABC (cm²).`,
      ...choose(qn((AB * AC) / 2), [qn(AB * AC), qn((AB * bc) / 2), qn((bh * AB) / 2), qn((bc * bh) / 2)]),
      explanation: `Rule leg² = hypotenuse × its projection: AB² = BC·BH, so BC = AB² ÷ BH = ${AB * AB} ÷ ${bh} = ${bc}.\nPythagoras: AC² = BC² − AB² = ${bc * bc} − ${AB * AB} = ${AC * AC}, so AC = ${AC}.\nArea of a right triangle = ½ × leg × leg = ½·${AB}·${AC} = ${(AB * AC) / 2} cm².`,
    },
    `${SETUP_VI}. AB = ${AB} cm, BH = ${bh} cm. Tính diện tích tam giác ABC (cm²).`,
    `Hệ thức cạnh góc vuông² = cạnh huyền × hình chiếu: AB² = BC·BH, nên BC = AB² : BH = ${AB * AB} : ${bh} = ${bc}.\nĐịnh lí Pythagore: AC² = BC² − AB² = ${bc * bc} − ${AB * AB} = ${AC * AC}, nên AC = ${AC}.\nDiện tích tam giác vuông = ½ × tích hai cạnh góc vuông = ½·${AB}·${AC} = ${(AB * AC) / 2} cm².`,
  );
};

// ── Angles in a circle ───────────────────────────────────────────────────
const circleAngles: Generator = (d, r) => {
  if (d <= 1) {
    if (r() < 0.5) {
      const x = 2 * int(r, 20, 80);
      return vi(
        {
          prompt: `In circle (O), the central angle AOB = ${x}°. C is a point on the major arc AB. Find angle ACB.`,
          ...chooseDeg(x / 2, [x, 180 - x / 2, (180 - x) / 2, 2 * x]),
          explanation: `AOB is a central angle (its vertex is the centre O); ACB is an inscribed angle (its vertex C is on the circle). Both stand on the same arc AB.\nRule: inscribed angle = ½ × central angle on the same arc.\nACB = ${x}° ÷ 2 = ${x / 2}°.`,
        },
        `Trong đường tròn (O), góc ở tâm AOB = ${x}°. C là một điểm trên cung lớn AB. Tính góc ACB.`,
        `AOB là góc ở tâm (đỉnh là tâm O); ACB là góc nội tiếp (đỉnh C nằm trên đường tròn). Hai góc cùng chắn cung AB.\nTính chất: góc nội tiếp bằng nửa góc ở tâm cùng chắn một cung.\nACB = ${x}° : 2 = ${x / 2}°.`,
      );
    }
    const y = int(r, 20, 85);
    return vi(
      {
        prompt: `In circle (O), the inscribed angle ACB = ${y}° (C on the major arc AB). Find the central angle AOB.`,
        ...chooseDeg(2 * y, [y, 180 - y, 180 - 2 * y, 90 + y]),
        explanation: `ACB is an inscribed angle (vertex on the circle) and AOB the central angle (vertex at the centre), both on arc AB.\nRule: central angle = 2 × inscribed angle on the same arc.\nAOB = 2 × ${y}° = ${2 * y}°.`,
      },
      `Trong đường tròn (O), góc nội tiếp ACB = ${y}° (C thuộc cung lớn AB). Tính góc ở tâm AOB.`,
      `ACB là góc nội tiếp (đỉnh trên đường tròn), AOB là góc ở tâm, cùng chắn cung AB.\nTính chất: góc ở tâm bằng hai lần góc nội tiếp cùng chắn một cung.\nAOB = 2 × ${y}° = ${2 * y}°.`,
    );
  }
  if (d === 2) {
    if (r() < 0.5) {
      const x = int(r, 20, 70);
      return vi(
        {
          prompt: `AB is a diameter of circle (O) and C is a point on the circle. Angle CAB = ${x}°. Find angle ABC.`,
          ...chooseDeg(90 - x, [180 - x, x, 180 - 2 * x, (180 - x) / 2]),
          explanation: `AB is a diameter, so angle ACB stands on a semicircle. Rule: an angle in a semicircle is a right angle: ACB = 90°.\nThe angles of triangle ABC add up to 180°: ABC = 180° − 90° − ${x}° = ${90 - x}°.`,
          figure: { kind: 'triangle', angles: [x, 90 - x, 90], ask: 1 },
        },
        `AB là đường kính của đường tròn (O), C là một điểm trên đường tròn. Góc CAB = ${x}°. Tính góc ABC.`,
        `AB là đường kính nên góc ACB chắn nửa đường tròn. Tính chất: góc nội tiếp chắn nửa đường tròn là góc vuông: ACB = 90°.\nTổng ba góc tam giác ABC bằng 180°: ABC = 180° − 90° − ${x}° = ${90 - x}°.`,
      );
    }
    const y = 2 * int(r, 15, 80);
    return vi(
      {
        prompt: `Ax is the tangent to circle (O) at A, and AB is a chord. The arc AB inside angle xAB measures ${y}°. Find angle xAB.`,
        ...chooseDeg(y / 2, [y, 180 - y, 90 - y / 2, 2 * y]),
        explanation: `xAB is formed by the tangent Ax and the chord AB. Rule: the angle between a tangent and a chord = half of the arc it cuts off (just like an inscribed angle).\nxAB = ${y}° ÷ 2 = ${y / 2}°.`,
      },
      `Ax là tiếp tuyến của đường tròn (O) tại A, AB là một dây. Cung AB nằm trong góc xAB có số đo ${y}°. Tính góc xAB.`,
      `xAB là góc tạo bởi tia tiếp tuyến Ax và dây cung AB. Tính chất: góc tạo bởi tia tiếp tuyến và dây cung bằng nửa số đo cung bị chắn (giống góc nội tiếp).\nxAB = ${y}° : 2 = ${y / 2}°.`,
    );
  }
  if (d === 3) {
    if (r() < 0.5) {
      let x = 0, y = 0;
      do {
        x = int(r, 55, 125);
        y = int(r, 55, 125);
      } while (x === y);
      const askC = r() < 0.5;
      const ans = askC ? 180 - x : 180 - y;
      return vi(
        {
          prompt: `ABCD is a cyclic quadrilateral with angle A = ${x}° and angle B = ${y}°. Find angle ${askC ? 'C' : 'D'}.`,
          ...chooseDeg(ans, [askC ? x : y, askC ? 180 - y : 180 - x, 360 - x - y, 90 + (askC ? x : y) / 2]),
          explanation: `A cyclic quadrilateral has all four vertices on one circle. Rule: its opposite angles add up to 180°.\n${askC ? 'C is opposite A' : 'D is opposite B'}: ${askC ? `C = 180° − A = 180° − ${x}°` : `D = 180° − B = 180° − ${y}°`} = ${ans}°.\nCareful: A and B are neighbours, not opposite angles.`,
        },
        `Tứ giác ABCD nội tiếp đường tròn có góc A = ${x}°, góc B = ${y}°. Tính góc ${askC ? 'C' : 'D'}.`,
        `Tứ giác nội tiếp có bốn đỉnh cùng nằm trên một đường tròn. Tính chất: tổng hai góc đối bằng 180°.\n${askC ? 'C đối diện A' : 'D đối diện B'}: ${askC ? `C = 180° − A = 180° − ${x}°` : `D = 180° − B = 180° − ${y}°`} = ${ans}°.\nChú ý: A và B là hai góc kề nhau, không phải hai góc đối.`,
      );
    }
    const e = int(r, 50, 130);
    return vi(
      {
        prompt: `ABCD is a cyclic quadrilateral. AB is extended beyond B to E, and angle CBE = ${e}°. Find angle ADC.`,
        ...chooseDeg(e, [180 - e, 90 - e / 2, 2 * e, 90 + e / 2].filter(Number.isInteger)),
        explanation: `A, B, E lie on one line, so angles ABC and CBE add up to 180°: ABC = 180° − ${e}° = ${180 - e}°.\nABCD is cyclic, so opposite angles add up to 180°: ADC = 180° − ${180 - e}° = ${e}°.\n(Shortcut: an exterior angle of a cyclic quadrilateral equals the interior opposite angle.)`,
      },
      `Tứ giác ABCD nội tiếp đường tròn. Trên tia đối của tia BA lấy điểm E, góc CBE = ${e}°. Tính góc ADC.`,
      `A, B, E thẳng hàng nên hai góc ABC và CBE kề bù: ABC = 180° − ${e}° = ${180 - e}°.\nABCD nội tiếp nên hai góc đối bù nhau: ADC = 180° − ${180 - e}° = ${e}°.\n(Nhận xét: góc ngoài tại một đỉnh của tứ giác nội tiếp bằng góc trong ở đỉnh đối diện.)`,
    );
  }
  if (d === 4) {
    if (r() < 0.5) {
      const x = int(r, 20, 70);
      const major = r() < 0.6;
      const ans = major ? 90 - x : 90 + x;
      return vi(
        {
          prompt: `AB is a chord of circle (O) with angle OAB = ${x}°. C is a point on the ${major ? 'major' : 'minor'} arc AB. Find angle ACB.`,
          ...chooseDeg(ans, [180 - 2 * x, major ? 90 + x : 90 - x, 2 * x, x]),
          explanation: `OA = OB (both are radii), so triangle OAB is isosceles: OBA = OAB = ${x}°.\nCentral angle AOB = 180° − ${x}° − ${x}° = ${180 - 2 * x}° (it stands on the minor arc AB).\n${major ? `C is on the major arc, so ACB is an inscribed angle on the minor arc: ACB = ${180 - 2 * x}° ÷ 2 = ${ans}°.` : `A point on the major arc would see AB at ${180 - 2 * x}° ÷ 2 = ${90 - x}°. With C on the minor arc they make a cyclic quadrilateral, so ACB = 180° − ${90 - x}° = ${ans}°.`}`,
        },
        `AB là một dây của đường tròn (O) với góc OAB = ${x}°. C là một điểm trên cung ${major ? 'lớn' : 'nhỏ'} AB. Tính góc ACB.`,
        `OA = OB (bán kính) nên tam giác OAB cân tại O: OBA = OAB = ${x}°.\nGóc ở tâm AOB = 180° − ${x}° − ${x}° = ${180 - 2 * x}° (chắn cung nhỏ AB).\n${major ? `C thuộc cung lớn nên ACB là góc nội tiếp chắn cung nhỏ: ACB = ${180 - 2 * x}° : 2 = ${ans}°.` : `Một điểm trên cung lớn nhìn AB dưới góc ${180 - 2 * x}° : 2 = ${90 - x}°. Cùng với C trên cung nhỏ tạo thành tứ giác nội tiếp, nên ACB = 180° − ${90 - x}° = ${ans}°.`}`,
      );
    }
    const x = int(r, 30, 80);
    return vi(
      {
        prompt: `Acute triangle ABC is inscribed in circle (O) and angle BAC = ${x}°. Find angle OBC.`,
        ...chooseDeg(90 - x, [2 * x, 180 - 2 * x, x, 90 - x / 2].filter(Number.isInteger)),
        explanation: `Rule: central angle = 2 × inscribed angle on the same arc. BOC and BAC both stand on arc BC: BOC = 2 × ${x}° = ${2 * x}°.\nOB = OC (radii), so triangle OBC is isosceles: OBC = OCB = (180° − ${2 * x}°) ÷ 2 = ${90 - x}°.`,
      },
      `Tam giác nhọn ABC nội tiếp đường tròn (O), góc BAC = ${x}°. Tính góc OBC.`,
      `Tính chất: góc ở tâm bằng hai lần góc nội tiếp cùng chắn một cung. BOC và BAC cùng chắn cung BC: BOC = 2 × ${x}° = ${2 * x}°.\nOB = OC (bán kính) nên tam giác OBC cân tại O: OBC = OCB = (180° − ${2 * x}°) : 2 = ${90 - x}°.`,
    );
  }
  if (r() < 0.5) {
    const x = 2 * int(r, 15, 70);
    const major = r() < 0.6;
    const ans = major ? 90 - x / 2 : 90 + x / 2;
    return vi(
      {
        prompt: `From a point M outside circle (O), tangents MA and MB are drawn (A, B on the circle), and angle AMB = ${x}°. C is a point on the ${major ? 'major' : 'minor'} arc AB. Find angle ACB.`,
        ...chooseDeg(ans, [180 - x, x / 2, major ? 90 + x / 2 : 90 - x / 2, x]),
        explanation: `A tangent is perpendicular to the radius at the touching point: OAM = OBM = 90°.\nThe angles of quadrilateral OAMB add up to 360°: AOB = 360° − 90° − 90° − ${x}° = ${180 - x}°.\n${major ? `C is on the major arc: inscribed angle = ½ central angle, ACB = ${180 - x}° ÷ 2 = ${ans}°.` : `A point on the major arc sees AB at ${180 - x}° ÷ 2 = ${90 - x / 2}°; with C on the minor arc it makes a cyclic quadrilateral, so ACB = 180° − ${90 - x / 2}° = ${ans}°.`}`,
      },
      `Từ điểm M nằm ngoài đường tròn (O) kẻ hai tiếp tuyến MA, MB (A, B là tiếp điểm), góc AMB = ${x}°. C là một điểm trên cung ${major ? 'lớn' : 'nhỏ'} AB. Tính góc ACB.`,
      `Tiếp tuyến vuông góc với bán kính tại tiếp điểm: OAM = OBM = 90°.\nTổng bốn góc của tứ giác OAMB bằng 360°: AOB = 360° − 90° − 90° − ${x}° = ${180 - x}°.\n${major ? `C thuộc cung lớn: góc nội tiếp bằng nửa góc ở tâm, ACB = ${180 - x}° : 2 = ${ans}°.` : `Một điểm trên cung lớn nhìn AB dưới góc ${180 - x}° : 2 = ${90 - x / 2}°; cùng với C trên cung nhỏ tạo thành tứ giác nội tiếp, nên ACB = 180° − ${90 - x / 2}° = ${ans}°.`}`,
    );
  }
  const p = int(r, 20, 65), qq = int(r, 20, 65);
  return vi(
    {
      prompt: `ABCD is a cyclic quadrilateral with angle BAC = ${p}° and angle CAD = ${qq}°. Find angle BCD.`,
      ...chooseDeg(180 - p - qq, [p + qq, 180 - p, 180 - qq, 2 * (p + qq)]),
      explanation: `Angle BAD is made of BAC and CAD: BAD = ${p}° + ${qq}° = ${p + qq}°.\nIn a cyclic quadrilateral opposite angles add up to 180°, and BCD is opposite BAD: BCD = 180° − ${p + qq}° = ${180 - p - qq}°.`,
    },
    `Tứ giác ABCD nội tiếp đường tròn có góc BAC = ${p}°, góc CAD = ${qq}°. Tính góc BCD.`,
    `Góc BAD gồm BAC và CAD: BAD = ${p}° + ${qq}° = ${p + qq}°.\nTứ giác nội tiếp có hai góc đối bù nhau, BCD đối diện BAD: BCD = 180° − ${p + qq}° = ${180 - p - qq}°.`,
  );
};

// ── Tangents, chords and the position of a line ─────────────────────────
const tangents: Generator = (d, r) => {
  if (d <= 1) {
    const OM = int(r, 4, 15), R = int(r, 2, OM - 1);
    const ans = qroot(OM * OM - R * R);
    return vi(
      {
        prompt: `Point M is ${OM} cm from the centre O of a circle of radius ${R} cm. MA is a tangent (A on the circle). Find MA (cm).`,
        ...choose(ans, [qroot(OM * OM + R * R), qn(OM - R), qn(OM * OM - R * R), qroot(OM - R)]),
        explanation: `Rule: a tangent is perpendicular to the radius at the touching point, so OA ⟂ MA and triangle OAM is right-angled at A, with hypotenuse OM = ${OM} and OA = R = ${R}.\nPythagoras: MA² = OM² − OA² = ${OM}² − ${R}² = ${OM * OM} − ${R * R} = ${OM * OM - R * R}.\nMA = ${rootText(OM * OM - R * R)} cm.`,
        figure: rt(R, ans.v, OM, 'b'),
      },
      `Điểm M cách tâm O của đường tròn bán kính ${R} cm một khoảng ${OM} cm. MA là tiếp tuyến (A là tiếp điểm). Tính MA (cm).`,
      `Tính chất: tiếp tuyến vuông góc với bán kính tại tiếp điểm, nên OA ⟂ MA và tam giác OAM vuông tại A, cạnh huyền OM = ${OM}, OA = R = ${R}.\nĐịnh lí Pythagore: MA² = OM² − OA² = ${OM}² − ${R}² = ${OM * OM} − ${R * R} = ${OM * OM - R * R}.\nMA = ${rootText(OM * OM - R * R)} cm.`,
    );
  }
  if (d === 2) {
    let R: Q, dd: Q;
    if (r() < 0.35) {
      const c = int(r, 2, 6), s = pick(r, [2, 3, 5]);
      R = q(rad(c, s), c * Math.sqrt(s));
      dd = q(`√${c * c * s}`, Math.sqrt(c * c * s));
    } else {
      const k = int(r, 3, 9);
      R = qn(k);
      let n = 0;
      do n = k * k + pick(r, [-8, -6, -5, -3, -2, -1, 1, 2, 3, 5, 6, 8]);
      while (isSq(n));
      dd = qroot(n);
    }
    const cmp = Math.abs(dd.v - R.v) < 1e-9 ? 1 : dd.v < R.v ? 2 : 0;
    const word = ['do not meet', 'touch (the line is a tangent)', 'cut (the line is a secant)'][cmp];
    const wordVi = ['không giao nhau', 'tiếp xúc (đường thẳng là tiếp tuyến)', 'cắt nhau (đường thẳng là cát tuyến)'][cmp];
    return vi(
      {
        prompt: `Circle (O) has radius ${R.s} cm, and line a is at distance ${dd.s} cm from O. How many common points do the line and the circle have?`,
        ...choose(qn(cmp), [qn(0), qn(1), qn(2)], true),
        explanation: `Let d = distance from O to the line, R = radius. Rule: d > R → no common point; d = R → 1 (tangent); d < R → 2 (secant).\nCompare by squaring (both are positive): d² = ${sqr(dd.s)} = ${Math.round(dd.v * dd.v)}, R² = ${sqr(R.s)} = ${Math.round(R.v * R.v)}.\n${Math.round(dd.v * dd.v)} ${['>', '=', '<'][cmp]} ${Math.round(R.v * R.v)}, so d ${['>', '=', '<'][cmp]} R: they ${word} — ${cmp} common point${cmp === 1 ? '' : 's'}.`,
      },
      `Đường tròn (O) có bán kính ${R.s} cm, đường thẳng a cách O một khoảng ${dd.s} cm. Đường thẳng và đường tròn có bao nhiêu điểm chung?`,
      `Gọi d là khoảng cách từ O đến đường thẳng, R là bán kính. Vị trí tương đối: d > R → không có điểm chung; d = R → 1 điểm (tiếp tuyến); d < R → 2 điểm (cát tuyến).\nSo sánh bằng cách bình phương (hai số đều dương): d² = ${sqr(dd.s)} = ${Math.round(dd.v * dd.v)}, R² = ${sqr(R.s)} = ${Math.round(R.v * R.v)}.\n${Math.round(dd.v * dd.v)} ${['>', '=', '<'][cmp]} ${Math.round(R.v * R.v)} nên d ${['>', '=', '<'][cmp]} R: đường thẳng và đường tròn ${wordVi} — ${cmp} điểm chung.`,
    );
  }
  if (d === 3) {
    if (r() < 0.5) {
      const R = int(r, 3, 15), dist = int(r, 1, R - 1);
      const [c, s] = simp(R * R - dist * dist);
      const ans = q(rad(2 * c, s), 2 * Math.sqrt(R * R - dist * dist));
      return vi(
        {
          prompt: `A chord AB of circle (O; ${R} cm) is ${dist} cm from the centre. Find the length of AB (cm), in simplest radical form.`,
          ...choose(ans, [qroot(R * R - dist * dist), qroot(4 * (R * R + dist * dist)), qn(2 * (R - dist)), qroot(R * R + dist * dist)]),
          explanation: `Draw OH ⟂ AB (H on AB); OH = ${dist} is the distance from the centre. Rule: the perpendicular from the centre to a chord cuts it in half, so AB = 2·AH.\nTriangle OAH is right-angled at H with hypotenuse OA = R = ${R}: AH² = ${R}² − ${dist}² = ${R * R} − ${dist * dist} = ${R * R - dist * dist}, AH = ${rootText(R * R - dist * dist)}.\nAB = 2·AH = ${ans.s} cm.`,
        },
        `Dây AB của đường tròn (O; ${R} cm) cách tâm ${dist} cm. Tính độ dài AB (cm), viết dưới dạng căn thức tối giản.`,
        `Kẻ OH ⟂ AB (H thuộc AB); OH = ${dist} là khoảng cách từ tâm. Tính chất: đường kính vuông góc với dây thì đi qua trung điểm của dây, nên AB = 2·AH.\nTam giác OAH vuông tại H, cạnh huyền OA = R = ${R}: AH² = ${R}² − ${dist}² = ${R * R} − ${dist * dist} = ${R * R - dist * dist}, AH = ${rootText(R * R - dist * dist)}.\nAB = 2·AH = ${ans.s} cm.`,
      );
    }
    const R = int(r, 4, 15), half = int(r, 1, R - 1);
    const ans = qroot(R * R - half * half);
    return vi(
      {
        prompt: `Circle (O; ${R} cm) has a chord AB = ${2 * half} cm. Find the distance from O to AB (cm), in simplest radical form.`,
        ...choose(ans, [qroot(R * R - 4 * half * half), qroot(R * R + half * half), qn(R - half), qn(R * R - half * half)]),
        explanation: `Draw OH ⟂ AB: OH is the distance we want. Rule: the perpendicular from the centre cuts the chord in half, so AH = ${2 * half} ÷ 2 = ${half}.\nTriangle OAH is right-angled at H with hypotenuse OA = R = ${R}: OH² = ${R}² − ${half}² = ${R * R} − ${half * half} = ${R * R - half * half}.\nOH = ${rootText(R * R - half * half)} cm.\nCareful: use half the chord (${half}), not the whole chord.`,
        figure: rt(ans.v, half, R, 'a'),
      },
      `Đường tròn (O; ${R} cm) có dây AB = ${2 * half} cm. Tính khoảng cách từ O đến AB (cm), viết dưới dạng căn thức tối giản.`,
      `Kẻ OH ⟂ AB: OH là khoảng cách cần tìm. Tính chất: đường vuông góc kẻ từ tâm chia đôi dây, nên AH = ${2 * half} : 2 = ${half}.\nTam giác OAH vuông tại H, cạnh huyền OA = R = ${R}: OH² = ${R}² − ${half}² = ${R * R} − ${half * half} = ${R * R - half * half}.\nOH = ${rootText(R * R - half * half)} cm.\nChú ý: dùng nửa dây (${half}), không dùng cả dây.`,
    );
  }
  if (d === 4) {
    if (r() < 0.5) {
      const [R, MA, OM] = pick(r, triples(30));
      const ans = qf(2 * R * MA, OM);
      return vi(
        {
          prompt: `From M, tangents MA and MB are drawn to circle (O; ${R} cm), with OM = ${OM} cm. Find the length of chord AB (cm).`,
          ...choose(ans, [qf(R * MA, OM), qn(MA), qn(2 * MA), qf(2 * R * R, OM)]),
          explanation: `Tangent ⟂ radius, so triangle OAM is right-angled at A: MA² = OM² − OA² = ${OM * OM} − ${R * R} = ${MA * MA}, MA = ${MA}.\nMA = MB and OA = OB, so OM is the perpendicular bisector of AB: it meets AB at H with AB ⟂ OM and AH = HB.\nAH is the altitude of right triangle OAM to its hypotenuse OM. Area two ways: AH·OM = OA·MA, so AH = ${R}·${MA} ÷ ${OM} = ${qf(R * MA, OM).s}.\nAB = 2·AH = ${ans.s} cm.`,
        },
        `Từ M kẻ hai tiếp tuyến MA, MB đến đường tròn (O; ${R} cm), OM = ${OM} cm. Tính độ dài dây AB (cm).`,
        `Tiếp tuyến vuông góc với bán kính nên tam giác OAM vuông tại A: MA² = OM² − OA² = ${OM * OM} − ${R * R} = ${MA * MA}, MA = ${MA}.\nMA = MB và OA = OB nên OM là đường trung trực của AB: OM cắt AB tại H, AB ⟂ OM và AH = HB.\nAH là đường cao của tam giác vuông OAM. Tính diện tích hai cách: AH·OM = OA·MA, nên AH = ${R}·${MA} : ${OM} = ${qf(R * MA, OM).s}.\nAB = 2·AH = ${ans.s} cm.`,
      );
    }
    const R = int(r, 2, 9);
    const t = pick(r, [60, 90, 120]);
    const opts = { 60: qradf(R, 1, 3), 90: qn(R), 120: qradf(R, 3, 3) } as Record<number, Q>;
    return vi(
      {
        prompt: `From M, tangents MA and MB are drawn to circle (O; ${R} cm), and angle AMB = ${t}°. Find MA (cm).`,
        ...choose(opts[t], [qradf(R, 1, 3), qn(R), qradf(R, 3, 3), qn(2 * R), qradf(R, 2, 3)]),
        explanation: `The two tangents from M are symmetric about OM, so OM bisects angle AMB: AMO = ${t}° ÷ 2 = ${t / 2}°.\nTriangle OAM is right-angled at A (tangent ⟂ radius). For angle AMO: OA = ${R} is the opposite side, MA the adjacent side, and cot = adjacent/opposite.\nMA = OA·cot ${t / 2}° = ${R}·${({ 60: '√3', 90: '1', 120: '√3/3' } as Record<number, string>)[t]} = ${opts[t].s} cm.`,
      },
      `Từ M kẻ hai tiếp tuyến MA, MB đến đường tròn (O; ${R} cm), góc AMB = ${t}°. Tính MA (cm).`,
      `Hai tiếp tuyến cắt nhau tại M nên MO là tia phân giác của góc AMB: AMO = ${t}° : 2 = ${t / 2}°.\nTam giác OAM vuông tại A (tiếp tuyến ⟂ bán kính). Với góc AMO: OA = ${R} là cạnh đối, MA là cạnh kề, cot = kề/đối.\nMA = OA·cot ${t / 2}° = ${R}·${({ 60: '√3', 90: '1', 120: '√3/3' } as Record<number, string>)[t]} = ${opts[t].s} cm.`,
    );
  }
  const [R, MA, OM] = pick(r, triples(40));
  if (r() < 0.5)
    return vi(
      {
        prompt: `From M, tangents MA and MB are drawn to circle (O; ${R} cm), with OM = ${OM} cm. Find the area of quadrilateral OAMB (cm²).`,
        ...choose(qn(R * MA), [qf(R * MA, 2), qn(2 * R * MA), qn(OM * R), qf(OM * MA, 2)]),
        explanation: `Tangent ⟂ radius, so triangle OAM is right-angled at A: MA² = OM² − OA² = ${OM * OM} − ${R * R} = ${MA * MA}, MA = ${MA}.\nOAMB is made of two equal right triangles OAM and OBM, each with legs OA = ${R} and MA = ${MA}.\nOAMB = 2 × ½·${R}·${MA} = ${R}·${MA} = ${R * MA} cm².`,
      },
      `Từ M kẻ hai tiếp tuyến MA, MB đến đường tròn (O; ${R} cm), OM = ${OM} cm. Tính diện tích tứ giác OAMB (cm²).`,
      `Tiếp tuyến vuông góc với bán kính nên tam giác OAM vuông tại A: MA² = OM² − OA² = ${OM * OM} − ${R * R} = ${MA * MA}, MA = ${MA}.\nTứ giác OAMB gồm hai tam giác vuông bằng nhau OAM và OBM, mỗi tam giác có hai cạnh góc vuông OA = ${R}, MA = ${MA}.\nS(OAMB) = 2 × ½·${R}·${MA} = ${R}·${MA} = ${R * MA} cm².`,
    );
  const ans = qf(R * R, OM);
  return vi(
    {
      prompt: `From M, tangents MA and MB are drawn to circle (O; ${R} cm), with OM = ${OM} cm. OM meets AB at H. Find OH (cm).`,
      ...choose(ans, [qf(R * MA, OM), qf(MA * MA, OM), qn(OM - R), qf(OM, 2)]),
      explanation: `MA = MB and OA = OB, so OM is the perpendicular bisector of AB: OM ⟂ AB at H.\nTriangle OAM is right-angled at A (tangent ⟂ radius); AH is its altitude to the hypotenuse OM, and OH is the projection of OA on OM.\nRule: leg² = hypotenuse × its projection: OA² = OM·OH, so OH = ${R}² ÷ ${OM} = ${R * R}/${OM}${fracN(R * R, OM) === `${R * R}/${OM}` ? '' : ` = ${ans.s}`} cm.`,
    },
    `Từ M kẻ hai tiếp tuyến MA, MB đến đường tròn (O; ${R} cm), OM = ${OM} cm. OM cắt AB tại H. Tính OH (cm).`,
    `MA = MB, OA = OB nên OM là đường trung trực của AB: OM ⟂ AB tại H.\nTam giác OAM vuông tại A (tiếp tuyến ⟂ bán kính); AH là đường cao, OH là hình chiếu của OA trên cạnh huyền OM.\nHệ thức: OA² = OM·OH, nên OH = ${R}² : ${OM} = ${R * R}/${OM}${fracN(R * R, OM) === `${R * R}/${OM}` ? '' : ` = ${ans.s}`} cm.`,
  );
};

// ── Arc length, sectors, segments, rings ────────────────────────────────
const ARC_DEG = [30, 36, 40, 45, 60, 72, 90, 120, 135, 150];
const arcs: Generator = (d, r) => {
  const R = int(r, 2, 12);
  const figure: Figure = { kind: 'circle', r: R, unit: 'cm' };
  if (d <= 1) {
    const n = pick(r, ARC_DEG);
    const ans = qpi(R * n, 180);
    return vi(
      {
        prompt: `Find the length of an arc of ${n}° on a circle of radius ${R} cm, in terms of π (cm).`,
        ...choose(ans, [qpi(R * n, 360), qpi(R * R * n, 360), qpi(R * R * n, 180), qpi(2 * R)]),
        explanation: `Arc length: l = πRn/180, where R = radius and n = the arc's angle in degrees (a full 360° turn gives the whole circumference 2πR).\nl = π·${R}·${n}/180 = ${R * n}π/180 = ${ans.s} cm.`,
        figure,
      },
      `Tính độ dài cung ${n}° của đường tròn bán kính ${R} cm theo π (cm).`,
      `Độ dài cung: l = πRn/180, với R là bán kính, n là số đo cung (độ) (cả vòng 360° cho chu vi 2πR).\nl = π·${R}·${n}/180 = ${R * n}π/180 = ${ans.s} cm.`,
    );
  }
  if (d === 2) {
    const n = pick(r, ARC_DEG);
    const ans = qpi(R * R * n, 360);
    return vi(
      {
        prompt: `Find the area of a sector of ${n}° in a circle of radius ${R} cm, in terms of π (cm²).`,
        ...choose(ans, [qpi(R * n, 180), qpi(R * R * n, 180), qpi(R * n, 360), qpi(R * R)]),
        explanation: `Sector area: S = πR²n/360 — the fraction n/360 of the whole disc πR² (R = radius, n = angle in degrees).\nS = π·${R}²·${n}/360 = ${R * R * n}π/360 = ${ans.s} cm².`,
        figure,
      },
      `Tính diện tích hình quạt tròn ${n}° của hình tròn bán kính ${R} cm theo π (cm²).`,
      `Diện tích hình quạt: S = πR²n/360 — bằng n/360 diện tích cả hình tròn πR² (R là bán kính, n là số đo cung, độ).\nS = π·${R}²·${n}/360 = ${R * R * n}π/360 = ${ans.s} cm².`,
    );
  }
  if (d === 3) {
    if (r() < 0.5) {
      const r2 = int(r, 1, R - 1);
      const ans = qpi(R * R - r2 * r2);
      return vi(
        {
          prompt: `Two concentric circles have radii ${R} cm and ${r2} cm. Find the area of the ring between them, in terms of π (cm²).`,
          ...choose(ans, [qpi((R - r2) ** 2), qpi(R * R + r2 * r2), qpi(2 * (R - r2)), qpi(R - r2), qpi(R * R), qpi(2 * (R * R - r2 * r2))]),
          explanation: `Ring = big disc − small disc, and the area of a disc is πR².\nπ·${R}² − π·${r2}² = π(${R * R} − ${r2 * r2}) = ${ans.s} cm².\nCareful: it is not π(${R} − ${r2})².`,
          figure,
        },
        `Hai đường tròn đồng tâm có bán kính ${R} cm và ${r2} cm. Tính diện tích hình vành khuyên giữa chúng theo π (cm²).`,
        `Hình vành khuyên = hình tròn lớn − hình tròn nhỏ; diện tích hình tròn là πR².\nπ·${R}² − π·${r2}² = π(${R * R} − ${r2 * r2}) = ${ans.s} cm².\nChú ý: không phải π(${R} − ${r2})².`,
      );
    }
    const n = pick(r, ARC_DEG);
    const l = qpi(R * n, 180);
    return vi(
      {
        prompt: `An arc of ${n}° has length ${l.s} cm. Find the radius of the circle (cm).`,
        ...choose(qn(R), [qn(2 * R), qf(R, 2), qf(R * n, 180), qf(180 * R, n)]),
        explanation: `Arc length: l = πRn/180 (R = radius, n = angle in degrees).\n${l.s} = π·R·${n}/180. Divide both sides by π: ${fracN(R * n, 180)} = R·${n}/180.\nR = ${fracN(R * n, 180)}·180 ÷ ${n} = ${R * n} ÷ ${n} = ${R} cm.`,
      },
      `Một cung ${n}° có độ dài ${l.s} cm. Tính bán kính đường tròn (cm).`,
      `Độ dài cung: l = πRn/180 (R là bán kính, n là số đo cung).\n${l.s} = π·R·${n}/180. Chia hai vế cho π: ${fracN(R * n, 180)} = R·${n}/180.\nR = ${fracN(R * n, 180)}·180 : ${n} = ${R * n} : ${n} = ${R} cm.`,
    );
  }
  if (d === 4) {
    const Re = 2 * int(r, 1, 6);
    const n = pick(r, [60, 90, 120]);
    const sector = qpi(Re * Re * n, 360);
    const tri = n === 90 ? qn((Re * Re) / 2) : qradf(Re * Re, 4, 3);
    const ans = minus(sector, tri);
    const triWhy = n === 90 ? `OAB is right-angled: ½·${Re}·${Re} = ${tri.s}` : n === 60 ? `OAB is equilateral: (√3/4)·${Re}² = ${tri.s}` : `½·${Re}·${Re}·sin 120° = ${tri.s}`;
    const triWhyVi = n === 90 ? `OAB vuông cân: ½·${Re}·${Re} = ${tri.s}` : n === 60 ? `OAB đều: (√3/4)·${Re}² = ${tri.s}` : `½·${Re}·${Re}·sin 120° = ${tri.s}`;
    return vi(
      {
        prompt: `Chord AB of circle (O; ${Re} cm) subtends a central angle of ${n}°. Find the area of the segment between chord AB and the minor arc AB (cm²).`,
        ...choose(ans, [sector, plus(sector, tri), minus(qpi(Re * n, 180), tri), minus(qpi(Re * Re), tri)]),
        explanation: `The segment = sector OAB − triangle OAB.\nSector = πR²n/360 = π·${Re}²·${n}/360 = ${sector.s}.\nTriangle: ${triWhy}.\nSegment = ${ans.s} cm².`,
        figure: { kind: 'circle', r: Re, unit: 'cm' },
      },
      `Dây AB của đường tròn (O; ${Re} cm) chắn cung nhỏ có số đo ${n}°. Tính diện tích hình viên phân giới hạn bởi dây AB và cung nhỏ AB (cm²).`,
      `Hình viên phân = hình quạt OAB − tam giác OAB.\nHình quạt = πR²n/360 = π·${Re}²·${n}/360 = ${sector.s}.\nTam giác: ${triWhyVi}.\nHình viên phân = ${ans.s} cm².`,
    );
  }
  if (r() < 0.5) {
    const L = int(r, 4, 15), t = pick(r, [10, 15, 20, 25, 40, 45]);
    const ans = qpi(L * t, 30);
    return vi(
      {
        prompt: `The minute hand of a clock is ${L} cm long. How far does its tip travel in ${t} minutes, in terms of π (cm)?`,
        ...choose(ans, [qpi(L * t, 60), qpi(L * L * t, 60), qpi(2 * L), qpi(L * t, 15)]),
        explanation: `The minute hand makes a full turn (360°) in 60 minutes, so in ${t} minutes it turns ${t}/60 × 360° = ${6 * t}°.\nThe tip moves along an arc of radius ${L}: l = πRn/180 = π·${L}·${6 * t}/180 = ${ans.s} cm.`,
      },
      `Kim phút của một chiếc đồng hồ dài ${L} cm. Trong ${t} phút, đầu kim phút đi được một quãng đường bao nhiêu (theo π, cm)?`,
      `Kim phút quay một vòng (360°) trong 60 phút, nên trong ${t} phút quay ${t}/60 × 360° = ${6 * t}°.\nĐầu kim đi trên cung tròn bán kính ${L}: l = πRn/180 = π·${L}·${6 * t}/180 = ${ans.s} cm.`,
    );
  }
  const a = 2 * int(r, 2, 8);
  const ans = minus(qn(a * a), qpi(a * a, 4));
  return vi(
    {
      prompt: `Square ABCD has side ${a} cm. At each vertex a quarter circle of radius ${a / 2} cm is drawn inside the square. Find the area of the square not covered by the quarter circles, in terms of π (cm²).`,
      ...choose(ans, [qpi(a * a, 4), minus(qn(a * a), qpi(a * a, 16)), minus(qn(a * a), qpi(a, 1)), minus(qn(a * a), qpi(a * a, 8))]),
      explanation: `Each quarter circle has radius ${a} ÷ 2 = ${a / 2}, and four quarters make one full circle.\nTheir total area = π·${a / 2}² = ${qpi(a * a, 4).s}. Square = ${a}² = ${a * a}.\nUncovered = ${a * a} − ${qpi(a * a, 4).s} cm².`,
      figure: { kind: 'rect', w: a, h: a, unit: 'cm' },
    },
    `Hình vuông ABCD có cạnh ${a} cm. Tại mỗi đỉnh vẽ một phần tư đường tròn bán kính ${a / 2} cm nằm trong hình vuông. Tính diện tích phần hình vuông không bị các phần tư hình tròn che phủ theo π (cm²).`,
    `Mỗi phần tư hình tròn có bán kính ${a} : 2 = ${a / 2}; bốn phần tư ghép lại thành một hình tròn.\nTổng diện tích = π·${a / 2}² = ${qpi(a * a, 4).s}. Hình vuông = ${a}² = ${a * a}.\nPhần còn lại = ${a * a} − ${qpi(a * a, 4).s} cm².`,
  );
};

// ── Cylinders, cones, spheres ───────────────────────────────────────────
const solids: Generator = (d, r) => {
  const R = int(r, 2, 9), h = int(r, 3, 15);
  if (d <= 1) {
    const ans = qpi(R * R * h);
    return vi(
      {
        prompt: `A cylinder has base radius ${R} cm and height ${h} cm. Find its volume in terms of π (cm³).`,
        ...choose(ans, [qpi(2 * R * h), qpi(R * R * h, 3), qpi(4 * R * R * h), qpi(R * h)]),
        explanation: `Volume of a cylinder = base area × height = πr²h (r = radius of the base, h = height).\nV = π·${R}²·${h} = π·${R * R}·${h} = ${ans.s} cm³.`,
      },
      `Một hình trụ có bán kính đáy ${R} cm và chiều cao ${h} cm. Tính thể tích theo π (cm³).`,
      `Thể tích hình trụ = diện tích đáy × chiều cao = πr²h (r là bán kính đáy, h là chiều cao).\nV = π·${R}²·${h} = π·${R * R}·${h} = ${ans.s} cm³.`,
    );
  }
  if (d === 2) {
    if (r() < 0.5) {
      const ans = qpi(R * R * h, 3);
      return vi(
        {
          prompt: `A cone has base radius ${R} cm and height ${h} cm. Find its volume in terms of π (cm³).`,
          ...choose(ans, [qpi(R * R * h), qpi(R * h, 3), qpi(2 * R * R * h, 3), qpi(4 * R * R * h, 3)]),
          explanation: `Volume of a cone = ⅓ × base area × height = ⅓πr²h — one third of the cylinder with the same base and height (r = base radius, h = height).\nV = ⅓·π·${R}²·${h} = ⅓·π·${R * R * h} = ${ans.s} cm³.\nCareful: don't forget the ⅓.`,
        },
        `Một hình nón có bán kính đáy ${R} cm và chiều cao ${h} cm. Tính thể tích theo π (cm³).`,
        `Thể tích hình nón = ⅓ × diện tích đáy × chiều cao = ⅓πr²h — bằng một phần ba hình trụ cùng đáy, cùng chiều cao (r là bán kính đáy, h là chiều cao).\nV = ⅓·π·${R}²·${h} = ⅓·π·${R * R * h} = ${ans.s} cm³.\nChú ý: đừng quên ⅓.`,
      );
    }
    const ans = qpi(2 * R * h + 2 * R * R);
    return vi(
      {
        prompt: `A closed cylinder has base radius ${R} cm and height ${h} cm. Find its total surface area in terms of π (cm²).`,
        ...choose(ans, [qpi(2 * R * h), qpi(2 * R * h + R * R), qpi(R * h + R * R), qpi(R * R * h), qpi(2 * R * h + 4 * R * R)]),
        explanation: `Total surface = the curved side (lateral area 2πrh — it unrolls into a rectangle) + the two circular bases (2 × πr²).\nLateral = 2π·${R}·${h} = ${qpi(2 * R * h).s}; bases = 2·π·${R}² = ${qpi(2 * R * R).s}.\nTotal = ${ans.s} cm².`,
      },
      `Một hình trụ có bán kính đáy ${R} cm và chiều cao ${h} cm. Tính diện tích toàn phần theo π (cm²).`,
      `Diện tích toàn phần = diện tích xung quanh 2πrh (trải ra là một hình chữ nhật) + hai đáy hình tròn (2 × πr²).\nXung quanh = 2π·${R}·${h} = ${qpi(2 * R * h).s}; hai đáy = 2·π·${R}² = ${qpi(2 * R * R).s}.\nToàn phần = ${ans.s} cm².`,
    );
  }
  if (d === 3) {
    if (r() < 0.5) {
      const ans = qpi(4 * R ** 3, 3);
      return vi(
        {
          prompt: `Find the volume of a sphere of radius ${R} cm, in terms of π (cm³).`,
          ...choose(ans, [qpi(4 * R * R), qpi(4 * R ** 3), qpi(R ** 3, 3), qpi(4 * R * R, 3)]),
          explanation: `Volume of a sphere = (4/3)πR³ (R = radius).\nV = (4/3)·π·${R}³ = (4/3)·π·${R ** 3} = ${ans.s} cm³.\nCareful: 4πR² is the surface area, not the volume.`,
        },
        `Tính thể tích hình cầu bán kính ${R} cm theo π (cm³).`,
        `Thể tích hình cầu = (4/3)πR³ (R là bán kính).\nV = (4/3)·π·${R}³ = (4/3)·π·${R ** 3} = ${ans.s} cm³.\nChú ý: 4πR² là diện tích mặt cầu, không phải thể tích.`,
      );
    }
    const ans = qpi(4 * R * R);
    return vi(
      {
        prompt: `A ball has diameter ${2 * R} cm. Find its surface area in terms of π (cm²).`,
        ...choose(ans, [qpi(16 * R * R), qpi(R * R), qpi(4 * R ** 3, 3), qpi(2 * R * R)]),
        explanation: `The radius is half the diameter: R = ${2 * R} ÷ 2 = ${R} cm.\nSurface area of a sphere = 4πR² = 4·π·${R}² = 4·π·${R * R} = ${ans.s} cm².`,
      },
      `Một quả bóng có đường kính ${2 * R} cm. Tính diện tích mặt cầu theo π (cm²).`,
      `Bán kính bằng nửa đường kính: R = ${2 * R} : 2 = ${R} cm.\nDiện tích mặt cầu = 4πR² = 4·π·${R}² = 4·π·${R * R} = ${ans.s} cm².`,
    );
  }
  if (d === 4) {
    if (r() < 0.5) {
      const [rr, hh, l] = pick(r, triples(30));
      const total = r() < 0.5;
      const ans = qpi(rr * l + (total ? rr * rr : 0));
      return vi(
        {
          prompt: `A cone has base radius ${rr} cm and height ${hh} cm. Find its ${total ? 'total' : 'lateral'} surface area in terms of π (cm²).`,
          ...choose(ans, [qpi(rr * hh + (total ? rr * rr : 0)), qpi(rr * l + (total ? 0 : rr * rr)), qpi(2 * rr * l), qpi(rr * rr * hh, 3)]),
          explanation: `The slant height l is the distance from the tip to the edge of the base. The height, the radius and l form a right triangle with hypotenuse l.\nPythagoras: l² = ${rr}² + ${hh}² = ${rr * rr} + ${hh * hh} = ${l * l}, l = ${l}.\nLateral area of a cone = πrl = π·${rr}·${l} = ${qpi(rr * l).s}${total ? `.\nTotal = lateral + base πr² = ${qpi(rr * l).s} + ${qpi(rr * rr).s} = ${ans.s}` : ''} cm².\nCareful: use the slant height l = ${l}, not the height ${hh}.`,
        },
        `Một hình nón có bán kính đáy ${rr} cm và chiều cao ${hh} cm. Tính diện tích ${total ? 'toàn phần' : 'xung quanh'} theo π (cm²).`,
        `Đường sinh l là khoảng cách từ đỉnh đến mép đáy. Chiều cao, bán kính và đường sinh tạo thành tam giác vuông có cạnh huyền l.\nĐịnh lí Pythagore: l² = ${rr}² + ${hh}² = ${rr * rr} + ${hh * hh} = ${l * l}, l = ${l}.\nDiện tích xung quanh hình nón = πrl = π·${rr}·${l} = ${qpi(rr * l).s}${total ? `.\nToàn phần = xung quanh + đáy πr² = ${qpi(rr * l).s} + ${qpi(rr * rr).s} = ${ans.s}` : ''} cm².\nChú ý: dùng đường sinh l = ${l}, không dùng chiều cao ${hh}.`,
      );
    }
    const ans = qpi(4 * R ** 3, 3);
    return vi(
      {
        prompt: `A sphere has surface area ${qpi(4 * R * R).s} cm². Find its volume in terms of π (cm³).`,
        ...choose(ans, [qpi(4 * R * R * R), qpi(16 * R ** 3, 3), qpi(4 * R * R, 3), qpi(R ** 3)]),
        explanation: `Surface area of a sphere = 4πR²: 4πR² = ${qpi(4 * R * R).s} ⇒ R² = ${4 * R * R} ÷ 4 = ${R * R} ⇒ R = ${R}.\nVolume = (4/3)πR³ = (4/3)·π·${R}³ = (4/3)·π·${R ** 3} = ${ans.s} cm³.`,
      },
      `Một mặt cầu có diện tích ${qpi(4 * R * R).s} cm². Tính thể tích hình cầu theo π (cm³).`,
      `Diện tích mặt cầu = 4πR²: 4πR² = ${qpi(4 * R * R).s} ⇒ R² = ${4 * R * R} : 4 = ${R * R} ⇒ R = ${R}.\nThể tích = (4/3)πR³ = (4/3)·π·${R}³ = (4/3)·π·${R ** 3} = ${ans.s} cm³.`,
    );
  }
  if (r() < 0.5) {
    const cr = pick(r, [3, 4, 5, 6, 8, 10]);
    const s = int(r, 1, cr - 1);
    const ans = qf(4 * s ** 3, 3 * cr * cr);
    return vi(
      {
        prompt: `A cylindrical glass with inner radius ${cr} cm contains water. A metal ball of radius ${s} cm is dropped in and sinks completely (no water spills). By how much does the water level rise (cm)?`,
        ...choose(ans, [qf(4 * s ** 3, cr * cr), qf(4 * s ** 3, 3 * cr), qf(s ** 3, cr * cr), qf(4 * s * s, cr * cr), qf(s ** 3, 3 * cr * cr), qf(32 * s ** 3, 3 * cr * cr)]),
        explanation: `The water rises by exactly the ball's volume. Let x cm be the rise: the extra water is a cylinder of radius ${cr} and height x.\nExtra water = π·${cr}²·x = ${cr * cr}πx. Ball = (4/3)π·${s}³ = (4/3)π·${s ** 3} = ${qpi(4 * s ** 3, 3).s}.\n${cr * cr}πx = ${qpi(4 * s ** 3, 3).s} ⇒ x = ${4 * s ** 3}/(3·${cr * cr}) = ${4 * s ** 3}/${3 * cr * cr}${fracN(4 * s ** 3, 3 * cr * cr) === `${4 * s ** 3}/${3 * cr * cr}` ? '' : ` = ${ans.s}`} cm.`,
      },
      `Một cốc nước hình trụ có bán kính đáy trong ${cr} cm. Thả chìm hoàn toàn một viên bi sắt hình cầu bán kính ${s} cm vào cốc (nước không tràn ra). Mực nước dâng lên bao nhiêu xentimét?`,
      `Mực nước dâng lên đúng bằng thể tích viên bi. Gọi x (cm) là độ dâng: phần nước dâng là hình trụ bán kính ${cr}, cao x.\nPhần nước dâng = π·${cr}²·x = ${cr * cr}πx. Viên bi = (4/3)π·${s}³ = (4/3)π·${s ** 3} = ${qpi(4 * s ** 3, 3).s}.\n${cr * cr}πx = ${qpi(4 * s ** 3, 3).s} ⇒ x = ${4 * s ** 3}/(3·${cr * cr}) = ${4 * s ** 3}/${3 * cr * cr}${fracN(4 * s ** 3, 3 * cr * cr) === `${4 * s ** 3}/${3 * cr * cr}` ? '' : ` = ${ans.s}`} cm.`,
    );
  }
  const k = int(r, 2, 9);
  const ans = qpi(3 * R * R * h + R * R * k, 3);
  return vi(
    {
      prompt: `A grain silo is a cylinder of radius ${R} m and height ${h} m with a cone of the same radius and height ${k} m on top. Find its volume in terms of π (m³).`,
      ...choose(ans, [qpi(R * R * (h + k)), qpi(R * R * h), qpi(R * R * (h + k), 3), qpi(3 * R * R * h + 2 * R * k, 3)]),
      explanation: `Volume of the silo = cylinder + cone (same radius r = ${R}).\nCylinder: πr²h = π·${R}²·${h} = ${qpi(R * R * h).s}.\nCone: ⅓πr²h = ⅓·π·${R}²·${k} = ${qpi(R * R * k, 3).s}.\nTotal = ${qpi(R * R * h).s} + ${qpi(R * R * k, 3).s} = ${ans.s} m³.`,
    },
    `Một kho chứa thóc gồm một hình trụ bán kính ${R} m, cao ${h} m và phía trên là một hình nón cùng bán kính, cao ${k} m. Tính thể tích kho theo π (m³).`,
    `Thể tích kho = hình trụ + hình nón (cùng bán kính r = ${R}).\nHình trụ: πr²h = π·${R}²·${h} = ${qpi(R * R * h).s}.\nHình nón: ⅓πr²h = ⅓·π·${R}²·${k} = ${qpi(R * R * k, 3).s}.\nTổng = ${qpi(R * R * h).s} + ${qpi(R * R * k, 3).s} = ${ans.s} m³.`,
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
  {
    id: 'math.geometry.circle-angles',
    domain: 'Geometry',
    skill: 'Circles',
    name: 'Angles in a circle',
    missionName: 'Crown of Arcs',
    description: 'Central and inscribed angles, the angle in a semicircle, the tangent–chord angle and cyclic quadrilaterals.',
    prerequisites: ['math.geometry.angles', 'math.geometry.circles'],
    lesson:
      'A central angle equals its arc. An inscribed angle is half the central angle (half the arc) on the same arc, so inscribed angles on the same arc are equal, and an angle in a semicircle is 90°. The angle between a tangent and a chord is also half the arc it cuts off. A quadrilateral is cyclic (tứ giác nội tiếp) when its opposite angles add up to 180°; its exterior angle equals the interior opposite angle. Watch which arc the point is on: on the minor arc the inscribed angle is 180° minus the one on the major arc.',
    examRefs: ['Toán 9 · Góc ở tâm, góc nội tiếp', 'Toán 9 · Tứ giác nội tiếp', 'Vào 10 Hà Nội · Bài IV (hình học)'],
  },
  {
    id: 'math.geometry.tangents',
    domain: 'Geometry',
    skill: 'Circles',
    name: 'Tangents & chords',
    missionName: 'Touchline Tower',
    description: 'Tangent ⟂ radius, two tangents from a point, the position of a line and a circle (d vs R), a chord and its distance from the centre.',
    prerequisites: ['math.geometry.pythagoras', 'math.geometry.circles'],
    lesson:
      'A tangent is perpendicular to the radius at the point of contact, so MA² = OM² − R². Two tangents from M are equal (MA = MB), OM bisects angle AMB and is the perpendicular bisector of AB; in right triangle OAM the right-triangle relations give OA² = OH·OM. A line at distance d from O: d < R cuts the circle (2 points), d = R touches it (1 point), d > R misses it. The perpendicular from O to a chord bisects it: (AB/2)² + d² = R².',
    examRefs: ['Toán 9 · Vị trí tương đối của đường thẳng và đường tròn', 'Toán 9 · Tiếp tuyến của đường tròn', 'Vào 10 Hà Nội · Bài IV (hình học)'],
  },
  {
    id: 'math.geometry.arcs',
    domain: 'Geometry',
    skill: 'Measurement',
    name: 'Arcs, sectors & rings',
    missionName: 'Clockwork Garden',
    description: 'Arc length πRn/180, sector area πR²n/360, segments, the ring between two circles, in π.',
    prerequisites: ['math.geometry.circles'],
    lesson:
      'Arc of n°: l = πRn/180. Sector of n°: S = πR²n/360 = l·R/2. Segment (viên phân) = sector − triangle OAB. Ring (hình vành khuyên) = π(R² − r²), not π(R − r)². Leave answers in π unless the question asks you to round.',
    examRefs: ['Toán 9 · Độ dài đường tròn, cung tròn', 'Toán 9 · Diện tích hình tròn, hình quạt tròn, hình vành khuyên'],
  },
  {
    id: 'math.geometry.solids',
    domain: 'Geometry',
    skill: 'Measurement',
    name: 'Cylinders, cones & spheres',
    missionName: 'Silo Workshop',
    description: 'Volumes and surface areas of cylinders, cones and spheres in π, and practical problems.',
    prerequisites: ['math.geometry.circles'],
    lesson:
      'Cylinder: V = πr²h, lateral area 2πrh, total 2πrh + 2πr². Cone: V = ⅓πr²h, lateral area πrl with slant l = √(r² + h²). Sphere: V = (4/3)πR³, area 4πR². A submerged object raises the water by its volume ÷ the base area.',
    examRefs: ['Toán 9 · Hình trụ, hình nón, hình cầu', 'Vào 10 Hà Nội · Bài IV (thực tế)'],
  },
];
export const geometry9Patches: Record<string, Partial<ConceptSeed>> = {
  'math.geometry.angles': {
    description: 'Interior and exterior angles of polygons, isosceles triangles, exterior angles and angle bisectors: angle chasing.',
    lesson:
      'Triangle: 180°, and an exterior angle = the sum of the two remote interior angles. Isosceles triangle: equal base angles. Polygon: interior sum (n − 2)·180°, exterior angles always add up to 360°, n(n − 3)/2 diagonals. Bisectors of B and C meet at angle 90° + A/2. Name every angle you find on the figure and keep chasing.',
    examRefs: ['Toán 8 · Tam giác cân, đa giác', 'Vào 10 Hà Nội · Bài IV (hình học)'],
  },
  'math.geometry.area': {
    description: 'Areas of composite shapes and polygons: cut-outs, paths, rhombi, regular hexagons, triangles inside rectangles.',
    lesson:
      'Triangle = ½·base·height (any side with its own height), rhombus = ½·d₁·d₂, trapezium = ½(a + b)h, equilateral triangle = (√3/4)a², regular hexagon = 6 equilateral triangles. For composite shapes add pieces, or take a big shape and subtract what is missing. Cutting a corner rectangle from a rectangle does not change the perimeter.',
    examRefs: ['Toán 8 · Diện tích đa giác'],
  },
  'math.geometry.pythagoras': {
    description: 'Pythagoras with a step: answers in simplest radical form, isosceles triangles, rhombi, trapezia, altitudes, ladders.',
    lesson:
      'c² = a² + b² where c is the hypotenuse; a leg is √(c² − a²). Simplify roots: √45 = 3√5. Draw the right triangle hidden in the shape: the height of an isosceles triangle or trapezium, half-diagonals of a rhombus, the altitude splitting a triangle.',
    examRefs: ['Toán 8 · Định lí Pythagore'],
  },
  'math.geometry.circles': {
    description: 'Circumference and area in π, semicircles, scaling, circles inscribed in and circumscribed about squares.',
    lesson:
      'C = 2πR = πd, S = πR². Keep π in the answer unless told to round. If the area is multiplied by k, the radius is multiplied by √k. A circle inscribed in a square has diameter = side; a square inscribed in a circle has diagonal = diameter.',
    examRefs: ['Toán 9 · Độ dài đường tròn, diện tích hình tròn'],
  },
};
export const geometry9Generators: Record<string, Generator> = {
  'math.geometry.pythagoras': pythagoras,
  'math.geometry.area': area,
  'math.geometry.angles': angles,
  'math.geometry.circles': circles,
  'math.geometry.trig': trig,
  'math.geometry.right-relations': relations,
  'math.geometry.circle-angles': circleAngles,
  'math.geometry.tangents': tangents,
  'math.geometry.arcs': arcs,
  'math.geometry.solids': solids,
};
export const geometry9LessonsVi: Record<string, string> = {
  'math.geometry.trig':
    'Trong tam giác vuông, với góc nhọn α: sin α = đối/huyền, cos α = kề/huyền, tan α = đối/kề, cot α = kề/đối. Giá trị đặc biệt: sin 30° = cos 60° = 1/2, sin 45° = cos 45° = √2/2, sin 60° = cos 30° = √3/2, tan 30° = √3/3, tan 45° = 1, tan 60° = √3. Luôn có sin²α + cos²α = 1, tan α = sin α/cos α, tan α·cot α = 1; hai góc phụ nhau thì sin góc này bằng cos góc kia, tan góc này bằng cot góc kia. Giải tam giác vuông: cạnh góc vuông = cạnh huyền × sin góc đối (hoặc × cos góc kề) = cạnh góc vuông kia × tan góc đối. Chỉ làm tròn ở bước cuối theo yêu cầu đề bài.',
  'math.geometry.circle-angles':
    'Góc ở tâm có số đo bằng số đo cung bị chắn. Góc nội tiếp bằng nửa góc ở tâm (nửa số đo cung) cùng chắn một cung, nên các góc nội tiếp cùng chắn một cung thì bằng nhau, và góc nội tiếp chắn nửa đường tròn là góc vuông. Góc tạo bởi tia tiếp tuyến và dây cung cũng bằng nửa số đo cung bị chắn. Tứ giác nội tiếp có tổng hai góc đối bằng 180°; góc ngoài tại một đỉnh bằng góc trong ở đỉnh đối diện. Chú ý điểm nằm trên cung nào: trên cung nhỏ thì góc nội tiếp bằng 180° trừ góc trên cung lớn.',
  'math.geometry.tangents':
    'Tiếp tuyến vuông góc với bán kính tại tiếp điểm, nên MA² = OM² − R². Hai tiếp tuyến cắt nhau tại M thì MA = MB, MO là tia phân giác của góc AMB và là đường trung trực của AB; trong tam giác vuông OAM có OA² = OH·OM. Đường thẳng cách tâm O một khoảng d: d < R thì cắt đường tròn (2 điểm chung), d = R thì tiếp xúc (1 điểm), d > R thì không giao nhau. Đường kính vuông góc với dây thì đi qua trung điểm của dây: (AB/2)² + d² = R².',
  'math.geometry.arcs':
    'Cung n°: l = πRn/180. Hình quạt n°: S = πR²n/360 = l·R/2. Hình viên phân = hình quạt − tam giác OAB. Hình vành khuyên = π(R² − r²), không phải π(R − r)². Để kết quả theo π, trừ khi đề bài yêu cầu làm tròn.',
  'math.geometry.solids':
    'Hình trụ: V = πr²h, diện tích xung quanh 2πrh, toàn phần 2πrh + 2πr². Hình nón: V = ⅓πr²h, diện tích xung quanh πrl với đường sinh l = √(r² + h²). Hình cầu: V = (4/3)πR³, diện tích mặt cầu 4πR². Vật chìm trong nước làm mực nước dâng lên một lượng bằng thể tích vật chia diện tích đáy.',
  'math.geometry.angles':
    'Tổng ba góc tam giác 180°; góc ngoài bằng tổng hai góc trong không kề với nó. Tam giác cân có hai góc ở đáy bằng nhau. Đa giác n cạnh: tổng góc trong (n − 2)·180°, tổng góc ngoài luôn bằng 360°, có n(n − 3)/2 đường chéo. Hai tia phân giác của góc B và C cắt nhau tạo góc 90° + A/2. Ghi mọi góc tìm được lên hình rồi tiếp tục suy luận.',
  'math.geometry.area':
    'Tam giác = ½·đáy·chiều cao (mỗi cạnh đi với đường cao của nó), hình thoi = ½·d₁·d₂, hình thang = ½(a + b)h, tam giác đều = (√3/4)a², lục giác đều = 6 tam giác đều. Hình ghép: cộng các phần, hoặc lấy hình lớn trừ phần bị khuyết. Cắt một hình chữ nhật ở góc của hình chữ nhật thì chu vi không đổi.',
  'math.geometry.pythagoras':
    'c² = a² + b² với c là cạnh huyền; cạnh góc vuông = √(c² − a²). Rút gọn căn: √45 = 3√5. Tìm tam giác vuông ẩn trong hình: đường cao của tam giác cân hay hình thang cân, nửa đường chéo hình thoi, đường cao chia đôi một tam giác.',
  'math.geometry.circles':
    'C = 2πR = πd, S = πR². Để kết quả theo π nếu đề không yêu cầu làm tròn. Diện tích gấp k lần thì bán kính gấp √k lần. Đường tròn nội tiếp hình vuông có đường kính bằng cạnh; hình vuông nội tiếp đường tròn có đường chéo bằng đường kính.',
  'math.geometry.right-relations':
    'Tam giác ABC vuông tại A, đường cao AH, BC = a, AC = b, AB = c, hình chiếu CH = b′, BH = c′, AH = h. Khi đó b² = a·b′, c² = a·c′ (bình phương cạnh góc vuông bằng cạnh huyền nhân hình chiếu), h² = b′·c′, a·h = b·c (hai lần diện tích), 1/h² = 1/b² + 1/c². Chọn hệ thức nối cái đã biết với cái cần tìm; nếu biết BH + CH và BH·CH thì BH, CH là nghiệm của một phương trình bậc hai.',
};
