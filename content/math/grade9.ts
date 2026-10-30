/**
 * Grade 9 algebra (Toán 9, 2018 programme) and the grade-10 entrance exam (Vào 10 Hà Nội):
 * radical expressions, systems, equations reducible to linear, inequalities, quadratics with Δ and
 * parameters, Viète's theorem, the parabola y = ax² and its intersections with a line, and word problems
 * solved by setting up an equation or a system. Every generator writes its prompt and explanation in
 * English and Vietnamese, and difficulty 5 is entrance-exam level.
 */
import type { Generated, Generator } from './generators';
import { FLIP, factor, frac, fracN, int, lcm, nz, num, numeric, pf, pick, pn, poly, rad, ratio, roots, signed, terms, tr } from './util';

/** Square-free numbers used under a root. */
const SQ = [2, 3, 5, 6, 7, 10, 11];
/** Coordinates the Vietnamese way: (2; −4). */
const pt = (x: number, y: number) => `(${num(x)}; ${num(y)})`;
const pair = (x: number, y: number) => `x = ${num(x)}, y = ${num(y)}`;
const vnd = (n: number) => n.toLocaleString('en');
/** Vietnamese thousands separator: 8.000 đồng. */
const vndVi = (n: number) => vnd(n).replace(/,/g, '.');

type G = Generated;
const vi = (g: G, promptVi: string, explanationVi?: string): G => ({ ...g, promptVi, explanationVi });

// ── Expressions: expanding, identities, factorising ─────────────────────
const expressions: Generator = (d, r) => {
  if (d <= 2) {
    const a = int(r, 2, 9), b = nz(r, -9, 9), c = int(r, 1, 9), e = nz(r, -5, 5);
    const ans = terms([[a + b, 'x'], [c, 'y'], [e, '']]);
    const ex = (en: boolean) =>
      [
        tr(en, `Like terms have exactly the same letter part: ${terms([[a, 'x']])} and ${terms([[b, 'x']])} are like terms; ${terms([[c, 'y']])} has a different letter and ${num(e)} is a plain number.`, `Các hạng tử đồng dạng có cùng phần biến: ${terms([[a, 'x']])} và ${terms([[b, 'x']])} là hạng tử đồng dạng; ${terms([[c, 'y']])} có biến khác, còn ${num(e)} là số.`),
        tr(en, `Add the x terms by adding the numbers in front: ${terms([[a, 'x'], [b, 'x']])} = (${a} + ${pn(b)})x = ${terms([[a + b, 'x']])}.`, `Cộng các hạng tử chứa x bằng cách cộng các hệ số (số đứng trước x): ${terms([[a, 'x'], [b, 'x']])} = (${a} + ${pn(b)})x = ${terms([[a + b, 'x']])}.`),
        tr(en, `The y term and the number stay as they are. Answer: ${ans}.`, `Hạng tử chứa y và số giữ nguyên. Vậy kết quả là ${ans}.`),
        tr(en, `Careful: x and y are different letters, so ${terms([[c, 'y']])} cannot be added to the x terms.`, `Chú ý: x và y là hai biến khác nhau nên không cộng ${terms([[c, 'y']])} vào các hạng tử chứa x.`),
      ].join('\n');
    return vi(
      {
        prompt: `Simplify: ${terms([[a, 'x'], [c, 'y'], [b, 'x'], [e, '']])}`,
        answer: ans,
        distractors: [terms([[a + b + c, 'x'], [e, '']]), terms([[a - b, 'x'], [c, 'y'], [e, '']]), terms([[a + b, 'x'], [c + e, 'y']])],
        explanation: ex(true),
      },
      `Rút gọn: ${terms([[a, 'x'], [c, 'y'], [b, 'x'], [e, '']])}`,
      ex(false),
    );
  }
  if (d === 3) {
    if (r() < 0.5) {
      const a = pick(r, [-5, -4, -3, -2, 2, 3, 4, 5, 6]), b = nz(r, -9, 9);
      const e = `${num(a)}(x ${signed(b)})`;
      const ex = (en: boolean) =>
        [
          tr(en, `Rule (distributive law): the number outside the bracket multiplies EVERY term inside: k(A + B) = kA + kB.`, `Quy tắc nhân đơn thức với đa thức: số ngoài ngoặc nhân với TỪNG hạng tử trong ngoặc: k(A + B) = kA + kB.`),
          tr(en, `Here k = ${num(a)}: ${num(a)}·x = ${terms([[a, 'x']])} and ${num(a)}·${pn(b)} = ${num(a * b)}.`, `Ở đây k = ${num(a)}: ${num(a)}·x = ${terms([[a, 'x']])} và ${num(a)}·${pn(b)} = ${num(a * b)}.`),
          tr(en, `So ${e} = ${poly([a, a * b])}.`, `Vậy ${e} = ${poly([a, a * b])}.`),
          tr(en, `Careful: multiply the second term too, and watch the signs (− × − = +, − × + = −).`, `Chú ý: phải nhân cả hạng tử thứ hai và để ý dấu (− nhân − thành +, − nhân + thành −).`),
        ].join('\n');
      return vi({ prompt: `Expand: ${e}`, answer: poly([a, a * b]), distractors: [poly([a, b]), poly([a, -a * b]), poly([1, a * b])], explanation: ex(true) }, `Khai triển: ${e}`, ex(false));
    }
    const a = nz(r, -3, 4), b = nz(r, -6, 6), x = nz(r, -4, 5);
    const ans = a * x * x + b * x;
    const e = poly([a, b, 0]);
    const t2 = b * x;
    const ex = (en: boolean) =>
      [
        tr(en, `Replace x by ${num(x)} (a negative number goes in brackets): ${num(a)}·${pn(x)}² ${b < 0 ? '−' : '+'} ${Math.abs(b)}·${pn(x)}.`, `Thay x = ${num(x)} vào biểu thức (số âm đặt trong ngoặc): ${num(a)}·${pn(x)}² ${b < 0 ? '−' : '+'} ${Math.abs(b)}·${pn(x)}.`),
        tr(en, `Power first: ${pn(x)}² = ${pn(x)}·${pn(x)} = ${x * x}.`, `Tính luỹ thừa trước: ${pn(x)}² = ${pn(x)}·${pn(x)} = ${x * x}.`),
        tr(en, `Then multiply: ${num(a)}·${x * x} = ${num(a * x * x)} and ${num(b)}·${pn(x)} = ${num(t2)}.`, `Rồi nhân: ${num(a)}·${x * x} = ${num(a * x * x)} và ${num(b)}·${pn(x)} = ${num(t2)}.`),
        tr(en, `Add them: ${num(a * x * x)} + ${pn(t2)} = ${num(ans)}.`, `Cộng lại: ${num(a * x * x)} + ${pn(t2)} = ${num(ans)}.`),
        tr(en, `Careful: only x is squared, not the number in front of it.`, `Chú ý: chỉ bình phương x, không bình phương hệ số đứng trước.`),
      ].join('\n');
    return vi({ prompt: `If x = ${num(x)}, find ${e}`, ...numeric(ans, [(a * x) ** 2 + b * x, a * x * 2 + b * x, -a * x * x + b * x], r, num), explanation: ex(true) }, `Với x = ${num(x)}, tính ${e}`, ex(false));
  }
  if (d === 4) {
    if (r() < 0.5) {
      const p = nz(r, -7, 7), q = nz(r, -7, 7);
      const e = `${factor(-p)}${factor(-q)}`;
      const ex = (en: boolean) =>
        [
          tr(en, `Multiply each term of the first bracket by each term of the second: (x + m)(x + n) = x·x + x·n + m·x + m·n.`, `Nhân từng hạng tử của ngoặc thứ nhất với từng hạng tử của ngoặc thứ hai: (x + m)(x + n) = x·x + x·n + m·x + m·n.`),
          tr(en, `Here m = ${num(p)}, n = ${num(q)}: ${e} = ${terms([[1, 'x²'], [q, 'x'], [p, 'x'], [p * q, '']])}.`, `Ở đây m = ${num(p)}, n = ${num(q)}: ${e} = ${terms([[1, 'x²'], [q, 'x'], [p, 'x'], [p * q, '']])}.`),
          tr(en, `Collect the x terms: ${num(q)} + ${pn(p)} = ${num(p + q)}, and the last term is ${num(p)}·${pn(q)} = ${num(p * q)}.`, `Thu gọn các hạng tử chứa x: ${num(q)} + ${pn(p)} = ${num(p + q)}; số hạng cuối là ${num(p)}·${pn(q)} = ${num(p * q)}.`),
          tr(en, `Answer: ${poly([1, p + q, p * q])}.`, `Vậy kết quả là ${poly([1, p + q, p * q])}.`),
        ].join('\n');
      return vi({ prompt: `Expand: ${e}`, answer: poly([1, p + q, p * q]), distractors: [poly([1, p * q, p + q]), poly([1, 0, p * q]), poly([1, p + q, -p * q])], explanation: ex(true) }, `Khai triển: ${e}`, ex(false));
    }
    const a = int(r, 1, 3), p = nz(r, -6, 6);
    const e = `(${poly([a, p])})²`;
    const A = terms([[a, 'x']]);
    const ex = (en: boolean) =>
      [
        tr(en, `Use the identity (A + B)² = A² + 2AB + B² (square of a sum).`, `Dùng hằng đẳng thức bình phương của một tổng: (A + B)² = A² + 2AB + B².`),
        tr(en, `Here A = ${A}, B = ${num(p)}.`, `Ở đây A = ${A}, B = ${num(p)}.`),
        `A² = ${a === 1 ? 'x²' : `(${A})² = ${a * a}x²`}; 2AB = 2·${A}·${pn(p)} = ${terms([[2 * a * p, 'x']])}; B² = ${pn(p)}² = ${p * p}.`,
        tr(en, `So ${e} = ${poly([a * a, 2 * a * p, p * p])}.`, `Vậy ${e} = ${poly([a * a, 2 * a * p, p * p])}.`),
        tr(en, `Careful: don't forget the middle term 2AB, and B² is always positive.`, `Chú ý: đừng quên hạng tử giữa 2AB, và B² luôn dương.`),
      ].join('\n');
    return vi(
      {
        prompt: `Expand: ${e}`,
        answer: poly([a * a, 2 * a * p, p * p]),
        distractors: [poly([a * a, 0, p * p]), poly([a * a, a * p, p * p]), poly([a * a, -2 * a * p, p * p])],
        explanation: ex(true),
      },
      `Khai triển: ${e}`,
      ex(false),
    );
  }
  // d5: factorise
  const kind = pick(r, ['diff', 'trinomial', 'common'] as const);
  if (kind === 'diff') {
    const k = int(r, 2, 12);
    const e = poly([1, 0, -k * k]);
    const ex = (en: boolean) =>
      [
        tr(en, `${k * k} = ${k}², so this is a difference of two squares: A² − B² = (A − B)(A + B).`, `${k * k} = ${k}² nên đây là hiệu hai bình phương: A² − B² = (A − B)(A + B).`),
        tr(en, `Here A = x, B = ${k}: x² − ${k}² = (x − ${k})(x + ${k}).`, `Ở đây A = x, B = ${k}: x² − ${k}² = (x − ${k})(x + ${k}).`),
        tr(en, `Careful: (x − ${k})² = x² − ${2 * k}x + ${k * k} has a middle term, so it is not the answer.`, `Chú ý: (x − ${k})² = x² − ${2 * k}x + ${k * k} có hạng tử giữa nên không phải đáp án.`),
      ].join('\n');
    return vi({ prompt: `Factorise: ${e}`, answer: `(x − ${k})(x + ${k})`, distractors: [`(x − ${k})²`, `(x + ${k})²`, `(x − ${k * k})(x + 1)`], explanation: ex(true) }, `Phân tích thành nhân tử: ${e}`, ex(false));
  }
  if (kind === 'common') {
    const a = int(r, 2, 5), k = int(r, 1, 6);
    const e = poly([a, 0, -a * k * k]);
    const ex = (en: boolean) =>
      [
        tr(en, `Both terms are divisible by ${a}, so take out the common factor ${a}: ${e} = ${a}(x² − ${k * k}).`, `Cả hai hạng tử đều chia hết cho ${a}, nên đặt nhân tử chung ${a} ra ngoài: ${e} = ${a}(x² − ${k * k}).`),
        tr(en, `${k * k} = ${k}², so x² − ${k * k} is a difference of two squares: A² − B² = (A − B)(A + B) with A = x, B = ${k}.`, `${k * k} = ${k}² nên x² − ${k * k} là hiệu hai bình phương: A² − B² = (A − B)(A + B) với A = x, B = ${k}.`),
        tr(en, `So ${e} = ${a}(x − ${k})(x + ${k}).`, `Vậy ${e} = ${a}(x − ${k})(x + ${k}).`),
      ].join('\n');
    return vi(
      { prompt: `Factorise: ${e}`, answer: `${a}(x − ${k})(x + ${k})`, distractors: [`${a}(x − ${k})²`, `(${a}x − ${k})(x + ${k})`, `${a}(x − ${k * k})(x + ${k * k})`], explanation: ex(true) },
      `Phân tích thành nhân tử: ${e}`,
      ex(false),
    );
  }
  let p = nz(r, -8, 8), q = nz(r, -8, 8);
  if (p === -q) q = q + 1 || 2;
  const e = poly([1, p + q, p * q]);
  const f = (u: number, v: number) => (u === v ? `${factor(-u)}²` : `${factor(-Math.min(u, v))}${factor(-Math.max(u, v))}`);
  const [lo, hi] = [Math.min(p, q), Math.max(p, q)];
  const ex = (en: boolean) =>
    [
      tr(en, `Expanding (x + m)(x + n) gives x² + (m + n)x + m·n. So we need two numbers m, n that add to ${num(p + q)} (the number in front of x) and multiply to ${num(p * q)} (the number on its own).`, `Khai triển (x + m)(x + n) = x² + (m + n)x + m·n. Vậy cần tìm hai số m, n có tổng bằng ${num(p + q)} (hệ số của x) và tích bằng ${num(p * q)} (hệ số tự do).`),
      tr(en, `${p * q > 0 ? `The product is positive, so both numbers have the same sign as ${num(p + q)}.` : 'The product is negative, so the two numbers have opposite signs.'}`, `${p * q > 0 ? `Tích dương nên hai số cùng dấu với ${num(p + q)}.` : 'Tích âm nên hai số trái dấu.'}`),
      tr(en, `They are ${num(lo)} and ${num(hi)}: ${num(lo)} + ${pn(hi)} = ${num(p + q)}, ${num(lo)}·${pn(hi)} = ${num(p * q)}.`, `Đó là ${num(lo)} và ${num(hi)}: ${num(lo)} + ${pn(hi)} = ${num(p + q)}, ${num(lo)}·${pn(hi)} = ${num(p * q)}.`),
      tr(en, `So ${e} = ${f(p, q)}.`, `Vậy ${e} = ${f(p, q)}.`),
    ].join('\n');
  return vi({ prompt: `Factorise: ${e}`, answer: f(p, q), distractors: [f(-p, -q), f(p, -q), f(-p, q), f(p * q, 1)], explanation: ex(true) }, `Phân tích thành nhân tử: ${e}`, ex(false));
};

// ── Inequalities ────────────────────────────────────────────────
/** "Divide both sides by k" with the rule about the sign. */
const divideLine = (en: boolean, k: number, out: string, rhs: number, v = 'x') =>
  k === 1
    ? ''
    : k > 0
      ? tr(en, `Divide both sides by ${k} (a positive number, so the sign stays ${out}): ${v} ${out} ${ratio(rhs, k)}.`, `Chia hai vế cho ${k} (số dương nên giữ nguyên chiều ${out}): ${v} ${out} ${ratio(rhs, k)}.`)
      : tr(en, `Divide both sides by ${num(k)}. Dividing by a NEGATIVE number flips the sign, so it becomes ${out}: ${v} ${out} ${ratio(rhs, k)}.`, `Chia hai vế cho ${num(k)}. Chia cho số ÂM thì phải đổi chiều bất đẳng thức, nên được dấu ${out}: ${v} ${out} ${ratio(rhs, k)}.`);
const inequalities: Generator = (d, r) => {
  const signs = d >= 3 ? (['<', '>', '≤', '≥'] as const) : (['<', '>'] as const);
  if (d <= 4) {
    const x = int(r, -6, 9);
    const a = d === 4 ? -int(r, 2, 7) : int(r, 2, 7);
    const b = nz(r, -12, 12);
    const sign = pick(r, signs);
    const out = a < 0 ? FLIP[sign] : sign;
    const R = a * x + b;
    const e = `${poly([a, b])} ${sign} ${num(R)}`;
    const ex = (en: boolean) =>
      [
        tr(en, `Solve it like an equation: get x on its own, step by step.`, `Giải giống như phương trình: đưa x về một mình một vế.`),
        tr(en, `Move ${num(b)} to the right side, changing its sign: ${terms([[a, 'x']])} ${sign} ${num(R)} ${signed(-b)} = ${num(a * x)}.`, `Chuyển ${num(b)} sang vế phải và đổi dấu: ${terms([[a, 'x']])} ${sign} ${num(R)} ${signed(-b)} = ${num(a * x)}.`),
        divideLine(en, a, out, a * x),
        tr(en, `Answer: x ${out} ${num(x)}.`, `Vậy nghiệm của bất phương trình là x ${out} ${num(x)}.`),
      ].join('\n');
    return vi(
      {
        prompt: `Solve: ${e}`,
        answer: `x ${out} ${num(x)}`,
        distractors: [`x ${FLIP[out]} ${num(x)}`, `x ${out} ${num(-x || x + 1)}`, `x ${out} ${num(x + 1)}`],
        explanation: ex(true),
      },
      `Giải bất phương trình: ${e}`,
      ex(false),
    );
  }
  if (r() < 0.5) {
    // (x − p)/2 − (x + q)/3 < k  ⇔  3(x − p) − 2(x + q) < 6k  ⇔  x < 6k + 3p + 2q
    const p = nz(r, -5, 5), q = nz(r, -5, 5), k = nz(r, -3, 3);
    const sign = pick(r, signs);
    const x0 = 6 * k + 3 * p + 2 * q;
    const e = `(x ${signed(-p)})/2 − (x ${signed(q)})/3 ${sign} ${num(k)}`;
    const ex = (en: boolean) =>
      [
        tr(en, `Clear the fractions: multiply both sides by 6, the lowest common multiple of the denominators 2 and 3 (6 is positive, so the sign stays ${sign}).`, `Quy đồng bỏ mẫu: nhân hai vế với 6 (bội chung nhỏ nhất của hai mẫu 2 và 3; 6 dương nên giữ nguyên chiều ${sign}).`),
        `3(x ${signed(-p)}) − 2(x ${signed(q)}) ${sign} ${num(6 * k)}.`,
        tr(en, `Expand the brackets: ${terms([[3, 'x'], [-3 * p, ''], [-2, 'x'], [-2 * q, '']])} ${sign} ${num(6 * k)}.`, `Phá ngoặc: ${terms([[3, 'x'], [-3 * p, ''], [-2, 'x'], [-2 * q, '']])} ${sign} ${num(6 * k)}.`),
        tr(en, `Collect: ${terms([[1, 'x'], [-3 * p - 2 * q, '']])} ${sign} ${num(6 * k)}, so x ${sign} ${3 * p + 2 * q === 0 ? num(x0) : `${num(6 * k)} ${signed(3 * p + 2 * q)} = ${num(x0)}`}.`, `Thu gọn: ${terms([[1, 'x'], [-3 * p - 2 * q, '']])} ${sign} ${num(6 * k)}, nên x ${sign} ${3 * p + 2 * q === 0 ? num(x0) : `${num(6 * k)} ${signed(3 * p + 2 * q)} = ${num(x0)}`}.`),
        tr(en, `Careful: the minus in front of the second bracket changes both signs: −2(x ${signed(q)}) = ${terms([[-2, 'x'], [-2 * q, '']])}.`, `Chú ý: dấu trừ trước ngoặc thứ hai đổi dấu cả hai hạng tử: −2(x ${signed(q)}) = ${terms([[-2, 'x'], [-2 * q, '']])}.`),
      ].join('\n');
    return vi(
      {
        prompt: `Solve: ${e}`,
        answer: `x ${sign} ${num(x0)}`,
        distractors: [`x ${FLIP[sign]} ${num(x0)}`, `x ${sign} ${num(6 * k + 3 * p - 2 * q)}`, `x ${sign} ${num(k + p + q)}`],
        explanation: ex(true),
      },
      `Giải bất phương trình: ${e}`,
      ex(false),
    );
  }
  // a(x − p) + b  ?  cx + e, asking for the largest / smallest whole number
  const x0 = int(r, -6, 8), a = nz(r, -5, 5), p = nz(r, -4, 4), b = nz(r, -9, 9);
  let c = nz(r, -4, 4);
  if (c === a) c = a + 2 || 1;
  const e = a * (x0 - p) + b - c * x0;
  const sign = pick(r, signs);
  const out = a - c < 0 ? FLIP[sign] : sign;
  const largest = out === '<' || out === '≤';
  const ans = out === '<' ? x0 - 1 : out === '>' ? x0 + 1 : x0;
  const lhs = `${a === 1 ? '' : a === -1 ? '−' : num(a)}(x ${signed(-p)}) ${signed(b)}`;
  const ineq = `${lhs} ${sign} ${poly([c, e])}`;
  const pickLine = (en: boolean) =>
    out === '<'
      ? tr(en, `x must be smaller than ${num(x0)} (not equal), so the largest integer is ${num(x0)} − 1 = ${num(ans)}.`, `x phải nhỏ hơn ${num(x0)} (không được bằng), nên số nguyên lớn nhất là ${num(x0)} − 1 = ${num(ans)}.`)
      : out === '>'
        ? tr(en, `x must be bigger than ${num(x0)} (not equal), so the smallest integer is ${num(x0)} + 1 = ${num(ans)}.`, `x phải lớn hơn ${num(x0)} (không được bằng), nên số nguyên nhỏ nhất là ${num(x0)} + 1 = ${num(ans)}.`)
        : tr(en, `x = ${num(x0)} is allowed (the sign has "or equal"), so the ${largest ? 'largest' : 'smallest'} integer is ${num(x0)}.`, `Dấu ${out} cho phép x = ${num(x0)}, nên số nguyên ${largest ? 'lớn nhất' : 'nhỏ nhất'} là ${num(x0)}.`);
  const ex = (en: boolean) =>
    [
      tr(en, `First solve the inequality. Expand the bracket: ${terms([[a, 'x'], [-a * p + b, '']])} ${sign} ${poly([c, e])}.`, `Trước hết giải bất phương trình. Phá ngoặc: ${terms([[a, 'x'], [-a * p + b, '']])} ${sign} ${poly([c, e])}.`),
      tr(en, `x terms to the left, numbers to the right (each changes sign when it crosses): ${terms([[a, 'x'], [-c, 'x']])} ${sign} ${num(e)} ${signed(a * p - b)}, so ${terms([[a - c, 'x']])} ${sign} ${num((a - c) * x0)}.`, `Chuyển hạng tử chứa x sang trái, số sang phải (chuyển vế thì đổi dấu): ${terms([[a, 'x'], [-c, 'x']])} ${sign} ${num(e)} ${signed(a * p - b)}, nên ${terms([[a - c, 'x']])} ${sign} ${num((a - c) * x0)}.`),
      divideLine(en, a - c, out, (a - c) * x0),
      pickLine(en),
    ]
      .filter(Boolean)
      .join('\n');
  return vi(
    {
      prompt: `Find the ${largest ? 'largest' : 'smallest'} integer x such that ${ineq}`,
      ...numeric(ans, [out === '<' || out === '>' ? x0 : largest ? x0 - 1 : x0 + 1, largest ? x0 + 1 : x0 - 1, -ans], r, num),
      explanation: ex(true),
    },
    `Tìm số nguyên x ${largest ? 'lớn nhất' : 'nhỏ nhất'} thoả mãn ${ineq}`,
    ex(false),
  );
};

// ── Systems of two equations ───────────────────────────────────────
const lin2 = (a: number, b: number) => terms([[a, 'x'], [b, 'y']]);
/**
 * Worked elimination for a1x + b1y = c1, a2x + b2y = c2: scale so one letter has matching
 * coefficients, add or subtract, solve, then substitute back into (1).
 */
function elimSteps(a1: number, b1: number, c1: number, a2: number, b2: number, c2: number, en: boolean): string[] {
  // eliminate y when its coefficients already match in size, otherwise x
  const elimY = Math.abs(b1) === Math.abs(b2) || (Math.abs(a1) !== Math.abs(a2) && lcm(b1, b2) < lcm(a1, a2));
  const [K, E] = elimY ? ['x', 'y'] : ['y', 'x'];
  const [p1, q1, p2, q2] = elimY ? [a1, b1, a2, b2] : [b1, a1, b2, a2];
  const L = lcm(q1, q2), m1 = L / Math.abs(q1), m2 = L / Math.abs(q2);
  const [P1, Q1, C1, P2, Q2, C2] = [m1 * p1, m1 * q1, m1 * c1, m2 * p2, m2 * q2, m2 * c2];
  const eq = (p: number, q: number, c: number) => `${elimY ? lin2(p, q) : lin2(q, p)} = ${num(c)}`;
  const sub = Q1 === Q2;
  const op = sub ? '−' : '+';
  const Kc = sub ? P1 - P2 : P1 + P2, rhs = sub ? C1 - C2 : C1 + C2;
  const lines = [
    tr(en, `Call the equations (1) ${eq(p1, q1, c1)} and (2) ${eq(p2, q2, c2)}. Method: elimination — make the ${E} terms cancel by adding or subtracting the equations.`, `Gọi (1) là ${eq(p1, q1, c1)}, (2) là ${eq(p2, q2, c2)}. Phương pháp cộng đại số: làm cho các hạng tử chứa ${E} triệt tiêu khi cộng hoặc trừ hai phương trình.`),
  ];
  if (Kc === 0) return lines; // no unique solution (never for the generated systems)
  const kv = rhs / Kc;
  if (m1 !== 1 || m2 !== 1) {
    const parts = [m1 !== 1 ? `(1) × ${m1}: ${eq(P1, Q1, C1)}` : '', m2 !== 1 ? `(2) × ${m2}: ${eq(P2, Q2, C2)}` : ''].filter(Boolean).join('; ');
    lines.push(tr(en, `Multiply so the ${E} coefficients have the same size: ${parts}.`, `Nhân để hệ số của ${E} có cùng giá trị tuyệt đối: ${parts}.`));
  }
  lines.push(
    tr(
      en,
      `${sub ? 'Subtract' : 'Add'} the equations (the ${E} terms cancel): (${num(P1)} ${op} ${pn(P2)})${K} = ${num(C1)} ${op} ${pn(C2)}, so ${terms([[Kc, K]])} = ${num(rhs)}${Kc === 1 ? '' : `, ${K} = ${ratio(rhs, Kc)}`}.`,
      `${sub ? 'Trừ' : 'Cộng'} từng vế hai phương trình (hạng tử chứa ${E} triệt tiêu): (${num(P1)} ${op} ${pn(P2)})${K} = ${num(C1)} ${op} ${pn(C2)}, nên ${terms([[Kc, K]])} = ${num(rhs)}${Kc === 1 ? '' : `, ${K} = ${ratio(rhs, Kc)}`}.`,
    ),
  );
  const rest = c1 - p1 * kv, ev = rest / q1;
  lines.push(
    tr(
      en,
      `Put ${K} = ${num(kv)} into (1): ${p1 === 1 ? '' : `${num(p1)}·${pn(kv)} = ${num(p1 * kv)}, so `}${terms([[q1, E]])} = ${num(c1)} − ${pn(p1 * kv)} = ${num(rest)}${q1 === 1 ? '' : `, ${E} = ${ratio(rest, q1)}`}.`,
      `Thay ${K} = ${num(kv)} vào (1): ${p1 === 1 ? '' : `${num(p1)}·${pn(kv)} = ${num(p1 * kv)}, nên `}${terms([[q1, E]])} = ${num(c1)} − ${pn(p1 * kv)} = ${num(rest)}${q1 === 1 ? '' : `, ${E} = ${ratio(rest, q1)}`}.`,
    ),
  );
  const [x, y] = elimY ? [kv, ev] : [ev, kv];
  lines.push(tr(en, `Answer: x = ${num(x)}, y = ${num(y)}.`, `Vậy hệ có nghiệm x = ${num(x)}, y = ${num(y)}.`));
  return lines;
}
const systems: Generator = (d, r) => {
  const sysDistractors = (x: number, y: number) => [pair(y, x), pair(-x, y), pair(x, -y), pair(x + 1, y - 1), pair(x - 1, y + 2)];
  if (d <= 3) {
    let a1 = 1, b1 = 1, a2 = 1, b2 = -1;
    if (d === 2) [a1, b1] = pick(r, [[int(r, 2, 4), 1], [1, int(r, 2, 4)]]);
    if (d === 3)
      do {
        a1 = nz(r, -5, 5);
        b1 = nz(r, -5, 5);
        a2 = nz(r, -5, 5);
        b2 = nz(r, -5, 5);
      } while (a1 * b2 - a2 * b1 === 0);
    const x = nz(r, -5, 8), y = nz(r, -5, 8);
    const s = `${lin2(a1, b1)} = ${num(a1 * x + b1 * y)} and ${lin2(a2, b2)} = ${num(a2 * x + b2 * y)}`;
    const ex = (en: boolean) => elimSteps(a1, b1, a1 * x + b1 * y, a2, b2, a2 * x + b2 * y, en).join('\n');
    return vi({ prompt: `Solve the system: ${s}`, answer: pair(x, y), distractors: sysDistractors(x, y), explanation: ex(true) }, `Giải hệ phương trình: ${s.replace(' and ', ' và ')}`, ex(false));
  }
  if (d === 4) {
    const [p, q] = pick(r, [[2, 3], [3, 2], [2, 5], [4, 3], [3, 4], [5, 2]]);
    const u = nz(r, -4, 4), v = nz(r, -4, 4);
    const x = p * u, y = q * v;
    const a = nz(r, -3, 3), b = nz(r, -3, 3);
    const s = `x/${p} + y/${q} = ${num(u + v)} and ${lin2(a, b)} = ${num(a * x + b * y)}`;
    const ex = (en: boolean) =>
      [
        tr(en, `First clear the fractions: multiply the first equation by ${p}·${q} = ${p * q} (x/${p}·${p * q} = ${q}x, y/${q}·${p * q} = ${p}y): ${lin2(q, p)} = ${num(p * q * (u + v))}.`, `Trước hết bỏ mẫu: nhân phương trình thứ nhất với ${p}·${q} = ${p * q} (x/${p}·${p * q} = ${q}x, y/${q}·${p * q} = ${p}y): ${lin2(q, p)} = ${num(p * q * (u + v))}.`),
        ...elimSteps(q, p, p * q * (u + v), a, b, a * x + b * y, en),
      ].join('\n');
    return vi({ prompt: `Solve the system: ${s}`, answer: pair(x, y), distractors: sysDistractors(x, y), explanation: ex(true) }, `Giải hệ phương trình: ${s.replace(' and ', ' và ')}`, ex(false));
  }
  // d5: new unknowns u = 1/(x + sx), v = 1/(y + sy)
  const X = pick(r, [1, 2, -1, -2, 3]), Y = pick(r, [1, 2, -1, 3, -3]);
  const sx = nz(r, -3, 3), sy = nz(r, -3, 3);
  let p1 = 0, q1 = 0, p2 = 0, q2 = 0;
  do {
    p1 = nz(r, -3, 3);
    q1 = nz(r, -3, 3);
    p2 = nz(r, -3, 3);
    q2 = nz(r, -3, 3);
  } while (p1 * q2 - p2 * q1 === 0);
  const den = (v: string, s: number) => `(${v} ${signed(s)})`;
  const side = (p: number, q: number) => {
    const t1 = `${num(p)}/${den('x', sx)}`;
    const t2 = `${Math.abs(q)}/${den('y', sy)}`;
    return `${t1} ${q < 0 ? '−' : '+'} ${t2} = ${fracN(p * Y + q * X, X * Y)}`;
  };
  const x = X - sx, y = Y - sy;
  const s = `${side(p1, q1)} and ${side(p2, q2)}`;
  const uv = (p: number, q: number) => `${terms([[p, 'u'], [q, 'v']])} = ${fracN(p * Y + q * X, X * Y)}`;
  const ex = (en: boolean) =>
    [
      tr(en, `The unknowns sit in denominators, so use new letters: u = 1/${den('x', sx)}, v = 1/${den('y', sy)} (condition: x ≠ ${num(-sx)}, y ≠ ${num(-sy)}).`, `Ẩn nằm ở mẫu nên đặt ẩn phụ: u = 1/${den('x', sx)}, v = 1/${den('y', sy)} (điều kiện: x ≠ ${num(-sx)}, y ≠ ${num(-sy)}).`),
      tr(en, `The system becomes an ordinary one: ${uv(p1, q1)} and ${uv(p2, q2)}.`, `Hệ trở thành hệ bậc nhất quen thuộc: ${uv(p1, q1)} và ${uv(p2, q2)}.`),
      tr(en, `Solve it by elimination: u = ${fracN(1, X)}, v = ${fracN(1, Y)} (check: ${num(p1)}·${pf(1, X)} + ${pn(q1)}·${pf(1, Y)} = ${fracN(p1 * Y + q1 * X, X * Y)}).`, `Giải bằng phương pháp cộng đại số: u = ${fracN(1, X)}, v = ${fracN(1, Y)} (thử lại: ${num(p1)}·${pf(1, X)} + ${pn(q1)}·${pf(1, Y)} = ${fracN(p1 * Y + q1 * X, X * Y)}).`),
      tr(en, `Go back to x and y: 1/${den('x', sx)} = ${fracN(1, X)} ⇒ x ${signed(sx)} = ${num(X)} ⇒ x = ${num(x)}; 1/${den('y', sy)} = ${fracN(1, Y)} ⇒ y ${signed(sy)} = ${num(Y)} ⇒ y = ${num(y)}.`, `Trở lại x, y: 1/${den('x', sx)} = ${fracN(1, X)} ⇒ x ${signed(sx)} = ${num(X)} ⇒ x = ${num(x)}; 1/${den('y', sy)} = ${fracN(1, Y)} ⇒ y ${signed(sy)} = ${num(Y)} ⇒ y = ${num(y)}.`),
      tr(en, `Careful: u and v are not the answer — always turn them back into x and y.`, `Chú ý: u, v chưa phải đáp án — phải tính lại x và y.`),
    ].join('\n');
  return vi(
    { prompt: `Solve the system: ${s}`, answer: pair(x, y), distractors: [pair(X, Y), pair(y, x), pair(X + sx, Y + sy), pair(x, -y)], explanation: ex(true) },
    `Giải hệ phương trình: ${s.replace(' and ', ' và ')}`,
    ex(false),
  );
};

// ── Quadratic equations ───────────────────────────────────────────
/** A number inside a calculation: negatives in brackets, (−3). */
const pv = (n: number) => (n < 0 ? `(${num(n)})` : num(n));
/** "−4/6 = −2/3", or just "−2" when it is already whole / simplest. */
const divide = (top: number, bottom: number) => {
  const raw = `${num(top)}/${bottom}`;
  const simple = fracN(top, bottom);
  return raw === simple ? raw : `${raw} = ${simple}`;
};
/** Full working of the quadratic formula for ax² + bx + c = 0 (Δ a perfect square ≥ 0). */
function formulaSteps(a: number, b: number, c: number, lang: 'en' | 'vi') {
  const D = b * b - 4 * a * c, q = Math.round(Math.sqrt(D));
  const en = lang === 'en';
  const lines = [
    en
      ? `① Every quadratic equation can be written as ax² + bx + c = 0. Read the three numbers off yours: a = ${num(a)} (the number in front of x²), b = ${num(b)} (in front of x), c = ${num(c)} (the number on its own).`
      : `① Mọi phương trình bậc hai đều viết được dạng ax² + bx + c = 0. Đọc ba hệ số của phương trình này: a = ${num(a)} (số đứng trước x²), b = ${num(b)} (số đứng trước x), c = ${num(c)} (số đứng một mình).`,
    en
      ? `② Work out Δ ("delta", the discriminant). It is just a number, Δ = b² − 4ac, and it tells you how many solutions there are (Δ > 0: two, Δ = 0: one, Δ < 0: none):`
      : `② Tính Δ (đọc là "đen-ta", biệt thức). Δ chỉ là một con số, Δ = b² − 4ac, cho biết phương trình có mấy nghiệm (Δ > 0: hai nghiệm, Δ = 0: nghiệm kép, Δ < 0: vô nghiệm):`,
    `Δ = ${pv(b)}² − 4·${pv(a)}·${pv(c)} = ${b * b} ${4 * a * c < 0 ? '+' : '−'} ${Math.abs(4 * a * c)} = ${num(D)}${D > 0 ? (en ? ` > 0, so two solutions. √Δ = √${D} = ${q}.` : ` > 0 nên có hai nghiệm. √Δ = √${D} = ${q}.`) : '.'}`,
  ];
  if (D === 0) lines.push(en ? `③ Δ = 0, so there is one (double) solution: x = −b/(2a) = ${divide(-b, 2 * a)}.` : `③ Δ = 0 nên phương trình có nghiệm kép: x = −b/(2a) = ${divide(-b, 2 * a)}.`);
  else {
    lines.push(en ? `③ Put the numbers into the formula x = (−b ± √Δ)/(2a): once with + and once with −.` : `③ Thay số vào công thức nghiệm x = (−b ± √Δ)/(2a): một lần với dấu +, một lần với dấu −.`);
    lines.push(`x₁ = (${num(-b)} + ${q})/(2·${pv(a)}) = ${divide(-b + q, 2 * a)}`);
    lines.push(`x₂ = (${num(-b)} − ${q})/(2·${pv(a)}) = ${divide(-b - q, 2 * a)}`);
    lines.push(en ? `Careful: the bottom is 2a = 2·${pv(a)} = ${2 * a}, not a or 4a.` : `Chú ý: mẫu là 2a = 2·${pv(a)} = ${2 * a}, không phải a hay 4a.`);
  }
  return lines.join('\n');
}

const quadratics: Generator = (d, r) => {
  if (d <= 2) {
    const p = d === 1 ? int(r, 1, 7) : nz(r, -8, 8), q = d === 1 ? int(r, 1, 7) : nz(r, -8, 8);
    const e = `${poly([1, -(p + q), p * q])} = 0`;
    return vi(
      {
        prompt: `Solve: ${e}`,
        answer: roots([[p, 1], [q, 1]]),
        distractors: [roots([[-p, 1], [-q, 1]]), roots([[p, 1], [-q, 1]]), roots([[p + 1, 1], [q, 1]])],
        explanation: `Look for two numbers with sum ${num(p + q)} and product ${num(p * q)}: they are ${num(p)} and ${num(q)} (${num(p)} + ${pv(q)} = ${num(p + q)}, ${num(p)}·${pv(q)} = ${num(p * q)}).\nSo ${e.replace(' = 0', '')} = ${factor(p)}${factor(q)} = 0.\nA product is 0 when one factor is 0: x = ${num(p)} or x = ${num(q)}.`,
      },
      `Giải phương trình: ${e}`,
      `Tìm hai số có tổng bằng ${num(p + q)} và tích bằng ${num(p * q)}: đó là ${num(p)} và ${num(q)} (${num(p)} + ${pv(q)} = ${num(p + q)}, ${num(p)}·${pv(q)} = ${num(p * q)}).\nNên ${e.replace(' = 0', '')} = ${factor(p)}${factor(q)} = 0.\nTích bằng 0 khi một thừa số bằng 0: x = ${num(p)} hoặc x = ${num(q)}.`,
    );
  }
  if (d === 3) {
    if (r() < 0.5) {
      // (ax − m)(x − n) = 0 with a ≠ 1: the quadratic formula
      const a = int(r, 2, 5), m = nz(r, -7, 7), n = nz(r, -5, 5);
      const B = -(a * n + m), C = m * n;
      const e = `${poly([a, B, C])} = 0`;
      return vi(
        {
          prompt: `Solve: ${e}`,
          answer: roots([[m, a], [n, 1]]),
          distractors: [roots([[-m, a], [-n, 1]]), roots([[m, 1], [n, 1]]), roots([[m, 2 * a], [n, 1]])],
          explanation: formulaSteps(a, B, C, 'en'),
        },
        `Giải phương trình: ${e}`,
        formulaSteps(a, B, C, 'vi'),
      );
    }
    // x² + 2b′x + c = 0 with Δ′ not a square: x = −b′ ± √Δ′
    const bp = nz(r, -4, 4), s = pick(r, [2, 3, 5, 6, 7]), t = pick(r, [1, 1, 2]);
    const c = bp * bp - t * t * s;
    const e = `${poly([1, 2 * bp, c])} = 0`;
    const pm = (h: number, rr: string) => (h === 0 ? `x = ±${rr}` : `x = ${num(h)} ± ${rr}`);
    return vi(
      {
        prompt: `Solve: ${e}`,
        answer: pm(-bp, rad(t, s)),
        distractors: [pm(bp, rad(t, s)), pm(-bp, rad(2 * t, s)), pm(-2 * bp, rad(t, s))],
        explanation: `① Written as ax² + bx + c = 0: a = 1 (in front of x²), b = ${num(2 * bp)} (in front of x), c = ${num(c)} (on its own).\n② b is even, so use the shortcut with b′ ("b-prime") = half of b = ${num(bp)}, and Δ′ ("delta-prime") = b′² − ac instead of Δ.\nΔ′ = b′² − ac = ${pv(bp)}² − 1·${pv(c)} = ${bp * bp} ${c < 0 ? '+' : '−'} ${Math.abs(c)} = ${t * t * s} > 0.\n√Δ′ = √${t * t * s}${t > 1 ? ` = ${rad(t, s)}` : ''} (not a whole number, so keep the root).\nx = (−b′ ± √Δ′)/a = ${num(-bp)} ± ${rad(t, s)}.`,
      },
      `Giải phương trình: ${e}`,
      `① Viết dạng ax² + bx + c = 0: a = 1 (trước x²), b = ${num(2 * bp)} (trước x), c = ${num(c)} (số đứng một mình).\n② b chẵn nên dùng công thức thu gọn: b′ ("b phẩy") = một nửa của b = ${num(bp)}, và Δ′ ("đen-ta phẩy") = b′² − ac thay cho Δ.\nΔ′ = b′² − ac = ${pv(bp)}² − 1·${pv(c)} = ${bp * bp} ${c < 0 ? '+' : '−'} ${Math.abs(c)} = ${t * t * s} > 0.\n√Δ′ = √${t * t * s}${t > 1 ? ` = ${rad(t, s)}` : ''} (không phải số nguyên nên giữ dấu căn).\nx = (−b′ ± √Δ′)/a = ${num(-bp)} ± ${rad(t, s)}.`,
    );
  }
  if (d === 4) {
    const kind = pick(r, [0, 1, 2]);
    let a = 1, b = 0, c = 0;
    if (kind === 1) {
      const k = int(r, 1, 3), m = nz(r, -5, 5);
      [a, b, c] = [k * k, 2 * k * m, m * m];
    } else
      do {
        a = nz(r, -4, 4);
        b = nz(r, -7, 7);
        c = nz(r, -9, 9);
      } while (kind === 0 ? b * b - 4 * a * c >= 0 : b * b - 4 * a * c <= 0);
    const D = b * b - 4 * a * c;
    const e = `${poly([a, b, c])} = 0`;
    const n = D > 0 ? 2 : D === 0 ? 1 : 0;
    const why = D > 0 ? '> 0: two distinct solutions' : D === 0 ? '= 0: one (double) solution' : '< 0: no real solution';
    const whyVi = D > 0 ? '> 0: hai nghiệm phân biệt' : D === 0 ? '= 0: nghiệm kép' : '< 0: vô nghiệm';
    return vi(
      {
        prompt: `How many real solutions does ${e} have?`,
        answer: String(n),
        distractors: ['0', '1', '2', 'Infinitely many'].filter((x) => x !== String(n)),
        explanation: `① Written as ax² + bx + c = 0: a = ${num(a)} (in front of x²), b = ${num(b)} (in front of x), c = ${num(c)} (on its own).\n② The number of solutions depends only on Δ ("delta", the discriminant) = b² − 4ac:\nΔ = ${pv(b)}² − 4·${pv(a)}·${pv(c)} = ${b * b} ${4 * a * c < 0 ? '+' : '−'} ${Math.abs(4 * a * c)} = ${num(D)}.\nΔ ${why}.`,
      },
      `Phương trình ${e} có bao nhiêu nghiệm?`,
      `① Viết dạng ax² + bx + c = 0: a = ${num(a)} (trước x²), b = ${num(b)} (trước x), c = ${num(c)} (số đứng một mình).\n② Số nghiệm chỉ phụ thuộc vào Δ ("đen-ta", biệt thức) = b² − 4ac:\nΔ = ${pv(b)}² − 4·${pv(a)}·${pv(c)} = ${b * b} ${4 * a * c < 0 ? '+' : '−'} ${Math.abs(4 * a * c)} = ${num(D)}.\nΔ ${whyVi}.`,
    );
  }
  // d5: a parameter m. x² − 2bx + m + k = 0, Δ′ = b² − m − k
  const b = nz(r, -5, 5), k = int(r, -5, 5);
  const v = b * b - k;
  const e = `${poly([1, -2 * b, 0])} + m${k ? ` ${signed(k)}` : ''} = 0`;
  const kind = pick(r, ['double', 'two', 'none'] as const);
  const ask = { double: 'has a double root', two: 'has two distinct solutions', none: 'has no real solutions' }[kind];
  const askVi = { double: 'có nghiệm kép', two: 'có hai nghiệm phân biệt', none: 'vô nghiệm' }[kind];
  const answer = kind === 'double' ? `m = ${num(v)}` : kind === 'two' ? `m < ${num(v)}` : `m > ${num(v)}`;
  const wrong = b * b + k === v ? 4 * b * b - k : b * b + k;
  return vi(
    {
      prompt: `Find m so that ${e} ${ask}.`,
      answer,
      distractors: kind === 'double' ? [`m = ${num(-v)}`, `m = ${num(wrong)}`, `m < ${num(v)}`] : [kind === 'two' ? `m > ${num(v)}` : `m < ${num(v)}`, `m = ${num(v)}`, `${answer.slice(0, 4)}${num(wrong)}`],
      explanation: `Δ′ = b′² − ac = ${b * b} − (m ${signed(k)}) = ${num(v)} − m. ${kind === 'double' ? 'Double root: Δ′ = 0.' : kind === 'two' ? 'Two solutions: Δ′ > 0.' : 'No solution: Δ′ < 0.'}`,
    },
    `Tìm m để phương trình ${e} ${askVi}.`,
    `Δ′ = b′² − ac = ${b * b} − (m ${signed(k)}) = ${num(v)} − m. ${kind === 'double' ? 'Nghiệm kép: Δ′ = 0.' : kind === 'two' ? 'Hai nghiệm phân biệt: Δ′ > 0.' : 'Vô nghiệm: Δ′ < 0.'}`,
  );
};

// ── Viète's theorem ─────────────────────────────────────────────
/** "x² − Sx + P = 0: a = 1, b = −S, c = P, so S = …, P = …" */
const vietaSP = (en: boolean, S: number, P: number, c = 'c') =>
  tr(
    en,
    `Viète's theorem: for ax² + bx + c = 0 with roots x₁, x₂, the sum x₁ + x₂ = −b/a and the product x₁x₂ = c/a. Here a = 1, b = ${num(-S)}, c = ${c === 'c' ? num(P) : c}, so x₁ + x₂ = ${num(S)} and x₁x₂ = ${c === 'c' ? num(P) : c}.`,
    `Định lí Vi-ét: nếu ax² + bx + c = 0 có hai nghiệm x₁, x₂ thì tổng x₁ + x₂ = −b/a và tích x₁x₂ = c/a. Ở đây a = 1, b = ${num(-S)}, c = ${c === 'c' ? num(P) : c}, nên x₁ + x₂ = ${num(S)} và x₁x₂ = ${c === 'c' ? num(P) : c}.`,
  );
const vieta: Generator = (d, r) => {
  /** x² − Sx + P = 0 with two real roots that (usually) aren't whole numbers, so Viète beats solving. */
  const sp = () => {
    let S = 0, P = 0;
    do {
      S = nz(r, -7, 7);
      P = nz(r, -9, 9);
    } while (S * S - 4 * P <= 0);
    return [S, P];
  };
  const has = 'has roots x₁, x₂';
  const hasVi = 'có hai nghiệm x₁, x₂';
  if (d <= 2) {
    const a = d === 1 ? 1 : pick(r, [2, 3, -2, 4]);
    let b = 0, c = 0;
    do {
      b = nz(r, -9, 9);
      c = nz(r, -9, 9);
    } while (b * b - 4 * a * c <= 0);
    const e = `${poly([a, b, c])} = 0`;
    const sum = r() < 0.5;
    const [ask, n, dd] = sum ? ['x₁ + x₂', -b, a] : ['x₁·x₂', c, a];
    const ex = (en: boolean) =>
      [
        tr(en, `Viète's theorem: if ax² + bx + c = 0 has roots x₁, x₂, then x₁ + x₂ = −b/a and x₁·x₂ = c/a.`, `Định lí Vi-ét: nếu ax² + bx + c = 0 có hai nghiệm x₁, x₂ thì x₁ + x₂ = −b/a và x₁·x₂ = c/a.`),
        tr(en, `Read off the numbers: a = ${num(a)} (in front of x²), b = ${num(b)} (in front of x), c = ${num(c)} (the number on its own).`, `Xác định hệ số: a = ${num(a)} (hệ số của x²), b = ${num(b)} (hệ số của x), c = ${num(c)} (hệ số tự do).`),
        sum ? `x₁ + x₂ = −b/a = ${ratio(-b, a)}.` : `x₁·x₂ = c/a = ${ratio(c, a)}.`,
        sum ? tr(en, `Careful: the sum has a minus sign (−b/a); the product c/a does not.`, `Chú ý: tổng có dấu trừ (−b/a), còn tích c/a thì không.`) : tr(en, `Careful: the product is c/a with no minus sign; only the sum has one (−b/a).`, `Chú ý: tích là c/a, không có dấu trừ; chỉ tổng mới có dấu trừ (−b/a).`),
      ].join('\n');
    return vi(
      {
        prompt: `${e} ${has}. Find ${ask}.`,
        answer: fracN(n, dd),
        distractors: sum ? [fracN(b, a), fracN(c, a), fracN(-c, a), fracN(-b, 1), fracN(-b + 1, a)] : [fracN(-c, a), fracN(-b, a), fracN(b, a), fracN(c, 1), fracN(c + 1, a)],
        explanation: ex(true),
      },
      `Phương trình ${e} ${hasVi}. Tính ${ask}.`,
      ex(false),
    );
  }
  if (d === 3) {
    const [S, P] = sp();
    const e = `${poly([1, -S, P])} = 0`;
    const ans = S * S - 2 * P;
    const ex = (en: boolean) =>
      [
        vietaSP(en, S, P),
        tr(en, `Write x₁² + x₂² using the sum and product: (x₁ + x₂)² = x₁² + 2x₁x₂ + x₂², so x₁² + x₂² = (x₁ + x₂)² − 2x₁x₂.`, `Biến đổi x₁² + x₂² theo tổng và tích: (x₁ + x₂)² = x₁² + 2x₁x₂ + x₂², nên x₁² + x₂² = (x₁ + x₂)² − 2x₁x₂.`),
        tr(en, `Substitute: ${pn(S)}² − 2·${pn(P)} = ${S * S} ${signed(-2 * P)} = ${num(ans)}.`, `Thay số: ${pn(S)}² − 2·${pn(P)} = ${S * S} ${signed(-2 * P)} = ${num(ans)}.`),
        tr(en, `Careful: subtract 2x₁x₂ (not add it).`, `Chú ý: phải trừ 2x₁x₂ (không phải cộng).`),
      ].join('\n');
    return vi({ prompt: `${e} ${has}. Find x₁² + x₂².`, ...numeric(ans, [S * S + 2 * P, S * S - P, S - 2 * P], r, num), explanation: ex(true) }, `Phương trình ${e} ${hasVi}. Tính x₁² + x₂².`, ex(false));
  }
  if (d === 4) {
    const kind = pick(r, ['recip', 'diff', 'cube', 'numbers'] as const);
    if (kind === 'numbers') {
      const u = nz(r, -9, 12);
      let w = nz(r, -9, 12);
      if (w === u) w = u + 3;
      const [lo, hi] = [Math.min(u, w), Math.max(u, w)];
      const ans = `${num(lo)} and ${num(hi)}`;
      const S = u + w, P = u * w, D = S * S - 4 * P, q = hi - lo;
      const ex = (en: boolean) =>
        [
          tr(en, `Viète in reverse: two numbers with sum S and product P are the solutions of t² − St + P = 0.`, `Vi-ét đảo: hai số có tổng S và tích P là nghiệm của phương trình t² − St + P = 0.`),
          tr(en, `Here S = ${num(S)}, P = ${num(P)}: ${poly([1, -S, P], 't')} = 0.`, `Ở đây S = ${num(S)}, P = ${num(P)}: ${poly([1, -S, P], 't')} = 0.`),
          `Δ = S² − 4P = ${pn(S)}² − 4·${pn(P)} = ${S * S} ${signed(-4 * P)} = ${D}, √Δ = ${q}.`,
          `t₁ = (${num(S)} + ${q})/2 = ${num(hi)}, t₂ = (${num(S)} − ${q})/2 = ${num(lo)}.`,
          tr(en, `Check: ${num(lo)} + ${pn(hi)} = ${num(S)} and ${num(lo)}·${pn(hi)} = ${num(P)}. The numbers are ${num(lo)} and ${num(hi)}.`, `Thử lại: ${num(lo)} + ${pn(hi)} = ${num(S)} và ${num(lo)}·${pn(hi)} = ${num(P)}. Vậy hai số là ${num(lo)} và ${num(hi)}.`),
        ].join('\n');
      return vi(
        {
          prompt: `Find two numbers whose sum is ${num(S)} and whose product is ${num(P)}.`,
          answer: ans,
          distractors: [`${num(-hi)} and ${num(-lo)}`, `${num(lo + 1)} and ${num(hi - 1)}`, `${num(lo)} and ${num(P)}`].filter((s) => s !== ans),
          explanation: ex(true),
        },
        `Tìm hai số biết tổng của chúng bằng ${num(S)} và tích bằng ${num(P)}.`,
        ex(false),
      );
    }
    const [S, P] = sp();
    const e = `${poly([1, -S, P])} = 0`;
    const [ask, ans, wrong] =
      kind === 'recip'
        ? ['1/x₁ + 1/x₂', fracN(S, P), [fracN(P, S), fracN(-S, P), fracN(1, S), fracN(S, -2 * P)]]
        : kind === 'diff'
          ? ['(x₁ − x₂)²', num(S * S - 4 * P), [num(S * S - 2 * P), num(S * S + 4 * P), num(S - 4 * P)]]
          : ['x₁³ + x₂³', num(S ** 3 - 3 * S * P), [num(S ** 3 + 3 * S * P), num(S ** 3 - 3 * P), num(S ** 3 - S * P)]];
    const how = (en: boolean) =>
      kind === 'recip'
        ? [
            tr(en, `Add the fractions with the common denominator x₁x₂: 1/x₁ + 1/x₂ = (x₂ + x₁)/(x₁x₂) = sum/product.`, `Quy đồng mẫu chung x₁x₂: 1/x₁ + 1/x₂ = (x₂ + x₁)/(x₁x₂) = tổng/tích.`),
            `= ${ratio(S, P)}.`,
          ]
        : kind === 'diff'
          ? [
              tr(en, `(x₁ − x₂)² = x₁² − 2x₁x₂ + x₂² = (x₁ + x₂)² − 4x₁x₂ (because (x₁ + x₂)² = x₁² + 2x₁x₂ + x₂²).`, `(x₁ − x₂)² = x₁² − 2x₁x₂ + x₂² = (x₁ + x₂)² − 4x₁x₂ (vì (x₁ + x₂)² = x₁² + 2x₁x₂ + x₂²).`),
              `= ${pn(S)}² − 4·${pn(P)} = ${S * S} ${signed(-4 * P)} = ${ans}.`,
            ]
          : [
              tr(en, `Use the identity x₁³ + x₂³ = (x₁ + x₂)³ − 3x₁x₂(x₁ + x₂).`, `Dùng hằng đẳng thức x₁³ + x₂³ = (x₁ + x₂)³ − 3x₁x₂(x₁ + x₂).`),
              `= ${pn(S)}³ − 3·${pn(P)}·${pn(S)} = ${num(S ** 3)} ${signed(-3 * P * S)} = ${ans}.`,
            ];
    const ex = (en: boolean) => [vietaSP(en, S, P), ...how(en)].join('\n');
    return vi({ prompt: `${e} ${has}. Find ${ask}.`, answer: ans, distractors: wrong, explanation: ex(true) }, `Phương trình ${e} ${hasVi}. Tính ${ask}.`, ex(false));
  }
  // d5: find the parameter from a condition on the roots
  const S = nz(r, -6, 6);
  const eq = `${poly([1, -S, 0])} + m = 0`;
  if (r() < 0.5) {
    const m0 = int(r, -8, Math.floor((S * S - 1) / 4));
    const T = S * S - 2 * m0;
    const ex = (en: boolean) =>
      [
        vietaSP(en, S, 0, 'm'),
        tr(en, `x₁² + x₂² = (x₁ + x₂)² − 2x₁x₂ = ${pn(S)}² − 2m = ${S * S} − 2m.`, `x₁² + x₂² = (x₁ + x₂)² − 2x₁x₂ = ${pn(S)}² − 2m = ${S * S} − 2m.`),
        tr(en, `So ${S * S} − 2m = ${T} ⇒ 2m = ${S * S} − ${pn(T)} = ${num(2 * m0)} ⇒ m = ${num(m0)}.`, `Nên ${S * S} − 2m = ${T} ⇒ 2m = ${S * S} − ${pn(T)} = ${num(2 * m0)} ⇒ m = ${num(m0)}.`),
        tr(en, `Check the equation really has two roots (Δ, the discriminant b² − 4ac, must be > 0): Δ = ${pn(-S)}² − 4·${pn(m0)} = ${S * S - 4 * m0} > 0 ✓.`, `Kiểm tra phương trình có hai nghiệm (biệt thức Δ = b² − 4ac phải > 0): Δ = ${pn(-S)}² − 4·${pn(m0)} = ${S * S - 4 * m0} > 0 ✓.`),
      ].join('\n');
    return vi(
      {
        prompt: `${eq} has two solutions x₁, x₂ with x₁² + x₂² = ${T}. Find m.`,
        answer: `m = ${num(m0)}`,
        distractors: [`m = ${num(-m0 || 2)}`, `m = ${num(S * S - T)}`, `m = ${num(T - S * S)}`, `m = ${num(m0 + 1)}`],
        explanation: ex(true),
      },
      `Cho phương trình ${eq}. Tìm m để phương trình có hai nghiệm x₁, x₂ thoả mãn x₁² + x₂² = ${T}.`,
      ex(false),
    );
  }
  const D = pick(r, [1, 2, 3, 4, 5, 6].filter((x) => (x - S) % 2 === 0));
  const m0 = (S * S - D * D) / 4;
  const ex = (en: boolean) =>
    [
      vietaSP(en, S, 0, 'm'),
      tr(en, `(x₁ − x₂)² = (x₁ + x₂)² − 4x₁x₂ = ${S * S} − 4m. And |x₁ − x₂| = ${D} means (x₁ − x₂)² = ${D}² = ${D * D}.`, `(x₁ − x₂)² = (x₁ + x₂)² − 4x₁x₂ = ${S * S} − 4m. Mà |x₁ − x₂| = ${D} nên (x₁ − x₂)² = ${D}² = ${D * D}.`),
      tr(en, `So ${S * S} − 4m = ${D * D} ⇒ 4m = ${S * S} − ${D * D} = ${num(4 * m0)} ⇒ m = ${num(m0)}.`, `Nên ${S * S} − 4m = ${D * D} ⇒ 4m = ${S * S} − ${D * D} = ${num(4 * m0)} ⇒ m = ${num(m0)}.`),
      tr(en, `Check: Δ = ${S * S} − 4·${pn(m0)} = ${D * D} > 0, so there are two roots ✓. Careful: square ${D} — the condition is on (x₁ − x₂)², not on x₁ − x₂.`, `Kiểm tra: Δ = ${S * S} − 4·${pn(m0)} = ${D * D} > 0 nên có hai nghiệm ✓. Chú ý: phải bình phương ${D}.`),
    ].join('\n');
  return vi(
    {
      prompt: `${eq} has two solutions x₁, x₂ with |x₁ − x₂| = ${D}. Find m.`,
      answer: `m = ${num(m0)}`,
      distractors: [`m = ${fracN(S * S - D, 4)}`, `m = ${fracN(S * S + D * D, 4)}`, `m = ${num(-m0 || 1)}`, `m = ${num(m0 + 1)}`],
      explanation: ex(true),
    },
    `Cho phương trình ${eq}. Tìm m để phương trình có hai nghiệm x₁, x₂ thoả mãn |x₁ − x₂| = ${D}.`,
    ex(false),
  );
};

// ── The parabola y = ax² ─────────────────────────────────────────
const parabola: Generator = (d, r) => {
  const A: [number, number][] = [[1, 1], [2, 1], [3, 1], [-1, 1], [-2, 1], [1, 2], [-1, 2]];
  const aText = ([n, dd]: [number, number]) => (dd === 1 ? (n === 1 ? '' : n === -1 ? '−' : num(n)) : `${fracN(n, dd)}`);
  const P = (a: [number, number]) => `y = ${aText(a)}${a[1] === 1 ? '' : '·'}x²`;
  if (d <= 3) {
    const a = pick(r, A);
    const x = a[1] === 2 ? pick(r, [-4, -2, 2, 4, 6]) : d === 2 ? pick(r, [-4, -3, -2, 2, 3, 4]) : nz(r, -4, 4);
    const y = (a[0] * x * x) / a[1];
    const av = fracN(a[0], a[1]);
    const calc = `${av}·${pn(x)}² = ${av}·${x * x} = ${num(y)}`;
    if (d === 1) {
      const ex = (en: boolean) =>
        [
          tr(en, `Put x = ${num(x)} into ${P(a)} (here a = ${av} is the number in front of x²): y = ${calc}.`, `Thay x = ${num(x)} vào ${P(a)} (a = ${av} là hệ số của x²): y = ${calc}.`),
          tr(en, `Careful: square x first (${pn(x)}² = ${x * x}, always positive), then multiply by a.`, `Chú ý: bình phương x trước (${pn(x)}² = ${x * x}, luôn dương), rồi mới nhân với a.`),
        ].join('\n');
      return vi({ prompt: `For ${P(a)}, find y when x = ${num(x)}.`, ...numeric(y, [(a[0] * a[0] * x * x) / a[1], -y, (2 * a[0] * x) / a[1]], r, num), explanation: ex(true) }, `Cho hàm số ${P(a)}. Tính y khi x = ${num(x)}.`, ex(false));
    }
    if (d === 2) {
      const ex = (en: boolean) =>
        [
          tr(en, `The point ${pt(x, y)} means x = ${num(x)}, y = ${num(y)}. It lies on the parabola, so these numbers satisfy y = ax².`, `Điểm ${pt(x, y)} có x = ${num(x)}, y = ${num(y)}. Điểm thuộc parabol nên toạ độ thoả mãn y = ax².`),
          tr(en, `Substitute: ${num(y)} = a·${pn(x)}² = a·${x * x}.`, `Thay vào: ${num(y)} = a·${pn(x)}² = a·${x * x}.`),
          tr(en, `Divide by ${x * x}: a = ${ratio(y, x * x)}.`, `Chia cho ${x * x}: a = ${ratio(y, x * x)}.`),
          tr(en, `Careful: divide by x² = ${x * x}, not by x.`, `Chú ý: chia cho x² = ${x * x}, không phải chia cho x.`),
        ].join('\n');
      return vi(
        {
          prompt: `The parabola y = ax² passes through the point ${pt(x, y)}. Find a.`,
          answer: fracN(a[0], a[1]),
          distractors: [fracN(-a[0], a[1]), fracN(y, x), fracN(x * x, y), fracN(y * x * x, 1), fracN(2 * a[0], a[1])],
          explanation: ex(true),
        },
        `Parabol y = ax² đi qua điểm ${pt(x, y)}. Tìm a.`,
        ex(false),
      );
    }
    const ex = (en: boolean) =>
      [
        tr(en, `A point (x₀; y₀) lies on the parabola when its y-coordinate equals a·x₀² (x first, y second).`, `Điểm (x₀; y₀) thuộc parabol khi tung độ y₀ = a·x₀² (hoành độ viết trước, tung độ viết sau).`),
        tr(en, `For x = ${num(x)}: ${calc}.`, `Với x = ${num(x)}: ${calc}.`),
        tr(en, `So ${pt(x, y)} is on the parabola. Careful: ${pt(x, -y)} has the wrong sign of y.`, `Vậy điểm ${pt(x, y)} thuộc parabol. Chú ý: điểm ${pt(x, -y)} sai dấu tung độ.`),
      ].join('\n');
    return vi(
      { prompt: `Which point lies on the parabola ${P(a)}?`, answer: pt(x, y), distractors: [pt(x, -y), pt(y, x), pt(x, y + (y > 0 ? 1 : -1)), pt(-x, -y)], explanation: ex(true) },
      `Điểm nào thuộc parabol ${P(a)}?`,
      ex(false),
    );
  }
  if (d === 4) {
    const a = pick(r, [1, 1, -1]);
    const p = nz(r, -4, 4);
    let q = nz(r, -4, 4);
    if (q === p) q = -p;
    const [lo, hi] = [Math.min(p, q), Math.max(p, q)];
    const k = a * (p + q), m = -a * p * q;
    const line = `y = ${poly([k, m])}`;
    const pts = (u: number, v: number, f: (x: number) => number) => `${pt(u, f(u))}, ${pt(v, f(v))}`;
    const sq = a === 1 ? 'x²' : '−x²';
    const yv = (x: number) => `${a === 1 ? '' : '−'}${pn(x)}² = ${num(a * x * x)}`;
    const ex = (en: boolean) =>
      [
        tr(en, `At a common point both equations give the same y, so set them equal (the equation for the x-coordinates): ${sq} = ${poly([k, m])}.`, `Tại giao điểm hai hàm số có cùng y, nên ta có phương trình hoành độ giao điểm: ${sq} = ${poly([k, m])}.`),
        tr(en, `Bring everything to one side: ${poly([1, -(p + q), p * q])} = 0.`, `Chuyển hết sang một vế: ${poly([1, -(p + q), p * q])} = 0.`),
        tr(en, `Two numbers with sum ${num(p + q)} and product ${num(p * q)} are ${num(lo)} and ${num(hi)}, so ${factor(lo)}${factor(hi)} = 0: x = ${num(lo)} or x = ${num(hi)}.`, `Hai số có tổng ${num(p + q)} và tích ${num(p * q)} là ${num(lo)} và ${num(hi)}, nên ${factor(lo)}${factor(hi)} = 0: x = ${num(lo)} hoặc x = ${num(hi)}.`),
        tr(en, `Find y from y = ${sq}: x = ${num(lo)} → y = ${yv(lo)}; x = ${num(hi)} → y = ${yv(hi)}.`, `Tính y từ y = ${sq}: x = ${num(lo)} → y = ${yv(lo)}; x = ${num(hi)} → y = ${yv(hi)}.`),
        tr(en, `Answer: ${pts(lo, hi, (x) => a * x * x)}.`, `Vậy giao điểm là ${pts(lo, hi, (x) => a * x * x)}.`),
      ].join('\n');
    return vi(
      {
        prompt: `Find the points where the parabola ${a === 1 ? 'y = x²' : 'y = −x²'} meets the line ${line}.`,
        answer: pts(lo, hi, (x) => a * x * x),
        distractors: [pts(-hi, -lo, (x) => a * x * x), pts(lo, hi, (x) => a * x), pts(lo, hi, (x) => -a * x * x)],
        explanation: ex(true),
      },
      `Tìm toạ độ giao điểm của parabol ${a === 1 ? 'y = x²' : 'y = −x²'} và đường thẳng ${line}.`,
      ex(false),
    );
  }
  // d5: the line y = kx + m against the parabola y = ax²: ax² − kx − m = 0, Δ = k² + 4am
  const a = pick(r, [1, -1]);
  const k = pick(r, [-6, -4, -2, 2, 4, 6]);
  const v = -(k * k) / (4 * a); // Δ = 0 at m = v
  const kind = pick(r, ['touch', 'two', 'none'] as const);
  const two = a > 0 ? '>' : '<'; // Δ > 0  ⇔  4am > −k²
  const answer = kind === 'touch' ? `m = ${num(v)}` : `m ${kind === 'two' ? two : FLIP[two]} ${num(v)}`;
  const ask = { touch: 'touches the parabola (exactly one common point)', two: 'cuts the parabola at two distinct points', none: 'does not meet the parabola' }[kind];
  const askVi = { touch: 'tiếp xúc với parabol (có đúng một điểm chung)', two: 'cắt parabol tại hai điểm phân biệt', none: 'không cắt parabol' }[kind];
  const par = a === 1 ? 'y = x²' : 'y = −x²';
  const line = `y = ${poly([k, 0])} + m`;
  const rel = kind === 'touch' ? '=' : kind === 'two' ? '>' : '<';
  const relOut = a === 1 || rel === '=' ? rel : FLIP[rel];
  const ex = (en: boolean) =>
    [
      tr(en, `Common points: set the two y's equal: ${a === 1 ? 'x²' : '−x²'} = ${poly([k, 0])} + m, i.e. ${poly([a, -k, 0])} − m = 0. Each solution x gives one common point.`, `Phương trình hoành độ giao điểm: ${a === 1 ? 'x²' : '−x²'} = ${poly([k, 0])} + m, tức ${poly([a, -k, 0])} − m = 0. Mỗi nghiệm x cho một giao điểm.`),
      tr(en, `This is a quadratic with a = ${num(a)}, b = ${num(-k)}, c = −m. Its discriminant Δ = b² − 4ac = ${pn(-k)}² − 4·${pn(a)}·(−m) = ${k * k} ${a === 1 ? '+' : '−'} 4m.`, `Đây là phương trình bậc hai với a = ${num(a)}, b = ${num(-k)}, c = −m. Biệt thức Δ = b² − 4ac = ${pn(-k)}² − 4·${pn(a)}·(−m) = ${k * k} ${a === 1 ? '+' : '−'} 4m.`),
      tr(en, `${kind === 'touch' ? 'One common point (touching) ⇔ Δ = 0' : kind === 'two' ? 'Two common points ⇔ two solutions ⇔ Δ > 0' : 'No common point ⇔ no solution ⇔ Δ < 0'}: ${k * k} ${a === 1 ? '+' : '−'} 4m ${rel} 0 ⇒ ${a === 1 ? '4m' : '−4m'} ${rel} ${num(-k * k)}.`, `${kind === 'touch' ? 'Tiếp xúc ⇔ phương trình có nghiệm kép ⇔ Δ = 0' : kind === 'two' ? 'Cắt tại hai điểm ⇔ hai nghiệm phân biệt ⇔ Δ > 0' : 'Không cắt ⇔ vô nghiệm ⇔ Δ < 0'}: ${k * k} ${a === 1 ? '+' : '−'} 4m ${rel} 0 ⇒ ${a === 1 ? '4m' : '−4m'} ${rel} ${num(-k * k)}.`),
      tr(en, `Divide by ${a === 1 ? '4' : '−4'}${a === 1 || rel === '=' ? '' : ' (negative, so the sign flips)'}: m ${relOut} ${num(v)}.`, `Chia cho ${a === 1 ? '4' : '−4'}${a === 1 || rel === '=' ? '' : ' (số âm nên đổi chiều)'}: m ${relOut} ${num(v)}.`),
    ].join('\n');
  return vi(
    {
      prompt: `Find m so that the line ${line} ${ask.replace('the parabola', `the parabola ${par}`)}.`,
      answer,
      distractors: kind === 'touch' ? [`m = ${num(-v)}`, `m = ${fracN(v, 4)}`, `m ${two} ${num(v)}`] : [`m ${kind === 'two' ? FLIP[two] : two} ${num(v)}`, `m = ${num(v)}`, `m ${kind === 'two' ? two : FLIP[two]} ${num(-v)}`],
      explanation: ex(true),
    },
    `Tìm m để đường thẳng ${line} ${askVi.replace('parabol', `parabol ${par}`)}.`,
    ex(false),
  );
};

// ── Square roots and radical expressions ──────────────────────────────
const radicals: Generator = (d, r) => {
  if (d === 1) {
    const kind = pick(r, ['take-out', 'cube', 'product'] as const);
    if (kind === 'cube') {
      const n = nz(r, -6, 6);
      const ex = (en: boolean) =>
        [
          tr(en, `∛ is the cube root: the number which, multiplied by itself three times, gives the number inside.`, `∛ là căn bậc ba: số mà nhân với chính nó ba lần thì được số trong căn.`),
          tr(en, `${pn(n)}·${pn(n)}·${pn(n)} = ${num(n ** 3)}, so ∛(${num(n ** 3)}) = ${num(n)}.`, `${pn(n)}·${pn(n)}·${pn(n)} = ${num(n ** 3)}, nên ∛(${num(n ** 3)}) = ${num(n)}.`),
          n < 0 ? tr(en, `Careful: unlike √, a cube root of a negative number exists and is negative.`, `Chú ý: khác với căn bậc hai, căn bậc ba của số âm vẫn có và là số âm.`) : '',
        ]
          .filter(Boolean)
          .join('\n');
      return vi({ prompt: `Calculate: ∛(${num(n ** 3)})`, ...numeric(n, [-n, n * 3, n * n], r, num), explanation: ex(true) }, `Tính ∛(${num(n ** 3)})`, ex(false));
    }
    if (kind === 'product') {
      const s = pick(r, SQ.slice(0, 5)), u = int(r, 1, 3), w = u + int(r, 1, 2);
      const [p, q] = [s * u * u, s * w * w];
      const v = s * u * w;
      const ex = (en: boolean) =>
        [
          tr(en, `Rule: √a · √b = √(a·b) (for a, b ≥ 0), so multiply the numbers under the roots.`, `Quy tắc nhân các căn bậc hai: √a · √b = √(a·b) (với a, b ≥ 0), nên nhân các số trong căn với nhau.`),
          `√${p} · √${q} = √(${p}·${q}) = √${p * q}.`,
          tr(en, `${p * q} = ${v}² (because ${v}·${v} = ${p * q}), so √${p * q} = ${v}.`, `${p * q} = ${v}² (vì ${v}·${v} = ${p * q}), nên √${p * q} = ${v}.`),
        ].join('\n');
      return vi({ prompt: `Calculate: √${p} · √${q}`, ...numeric(v, [s * (u + w), v * s, u * w], r, num), explanation: ex(true) }, `Tính √${p} · √${q}`, ex(false));
    }
    const s = pick(r, SQ), k = int(r, 2, 7);
    const ex = (en: boolean) =>
      [
        tr(en, `Look for the biggest perfect square (4, 9, 16, 25, 36, 49…) that divides ${k * k * s}: it is ${k * k} = ${k}².`, `Tìm số chính phương lớn nhất (4, 9, 16, 25, 36, 49…) mà ${k * k * s} chia hết: đó là ${k * k} = ${k}².`),
        tr(en, `${k * k * s} = ${k * k}·${s}, so √${k * k * s} = √${k * k}·√${s} = ${k}√${s} (taking a factor out of the root).`, `${k * k * s} = ${k * k}·${s}, nên √${k * k * s} = √${k * k}·√${s} = ${k}√${s} (đưa thừa số ra ngoài dấu căn).`),
        tr(en, `Careful: what comes out is √${k * k} = ${k}, not ${k * k}.`, `Chú ý: đưa ra ngoài là √${k * k} = ${k}, không phải ${k * k}.`),
      ].join('\n');
    return vi({ prompt: `Simplify: √${k * k * s}`, answer: rad(k, s), distractors: [rad(k * k, s), rad(k, s * k), rad(k + 1, s), rad(k - 1, s)], explanation: ex(true) }, `Rút gọn: √${k * k * s}`, ex(false));
  }
  if (d === 2) {
    const a = nz(r, -3, 4), x0 = int(r, -5, 6);
    const inner = poly([a, -a * x0]);
    const strict = r() < 0.35;
    const e = strict ? `1/√(${inner})` : `√(${inner})`;
    const sgn = a > 0 ? (strict ? '>' : '≥') : strict ? '<' : '≤';
    const rel = strict ? '>' : '≥';
    const ex = (en: boolean) =>
      [
        strict
          ? tr(en, `√A only exists when A ≥ 0, and here the root is in a denominator, which must not be 0. So we need ${inner} > 0.`, `√A chỉ xác định khi A ≥ 0; ở đây căn nằm ở mẫu nên còn phải khác 0. Vậy cần ${inner} > 0.`)
          : tr(en, `√A only exists when A ≥ 0 (there is no square root of a negative number). So we need ${inner} ≥ 0.`, `√A xác định khi A ≥ 0 (không có căn bậc hai của số âm). Vậy cần ${inner} ≥ 0.`),
        -a * x0 === 0 ? '' : tr(en, `Move the number to the right side: ${terms([[a, 'x']])} ${rel} ${num(a * x0)}.`, `Chuyển số sang vế phải: ${terms([[a, 'x']])} ${rel} ${num(a * x0)}.`),
        a === 1 ? '' : divideLine(en, a, sgn, a * x0),
        tr(en, `Answer: x ${sgn} ${num(x0)}.`, `Vậy biểu thức xác định khi x ${sgn} ${num(x0)}.`),
      ]
        .filter(Boolean)
        .join('\n');
    return vi(
      {
        prompt: `For which x is ${e} defined?`,
        answer: `x ${sgn} ${num(x0)}`,
        distractors: [`x ${FLIP[sgn]} ${num(x0)}`, `x ${sgn} ${num(-x0 || 1)}`, `x ${strict ? (a > 0 ? '≥' : '≤') : a > 0 ? '>' : '<'} ${num(x0)}`],
        explanation: ex(true),
      },
      `Biểu thức ${e} xác định khi nào?`,
      ex(false),
    );
  }
  if (d === 3) {
    const s = pick(r, [2, 3, 5, 6, 7]);
    const ks = [1, 2, 3, 4, 5].sort(() => r() - 0.5).slice(0, 3);
    const cs = ks.map(() => nz(r, -3, 3));
    const e = terms(ks.map((k, i) => [cs[i], `√${k * k * s}`] as [number, string]));
    const tot = ks.reduce((t, k, i) => t + cs[i] * k, 0);
    const big = ks.filter((k) => k > 1);
    const ex = (en: boolean) =>
      [
        tr(en, `Take the square factors out of each root (√(k²·${s}) = k√${s}): ${big.map((k) => `√${k * k * s} = √(${k * k}·${s}) = ${k}√${s}`).join('; ')}.`, `Đưa thừa số ra ngoài dấu căn (√(k²·${s}) = k√${s}): ${big.map((k) => `√${k * k * s} = √(${k * k}·${s}) = ${k}√${s}`).join('; ')}.`),
        tr(en, `Now every term is a multiple of √${s}: ${terms(ks.map((k, i) => [cs[i] * k, `√${s}`] as [number, string]))}.`, `Bây giờ mọi hạng tử đều là bội của √${s}: ${terms(ks.map((k, i) => [cs[i] * k, `√${s}`] as [number, string]))}.`),
        tr(en, `Add the numbers in front: ${ks.map((k, i) => pn(cs[i] * k)).join(' + ')} = ${num(tot)}, so the answer is ${rad(tot, s)}.`, `Cộng các hệ số: ${ks.map((k, i) => pn(cs[i] * k)).join(' + ')} = ${num(tot)}, vậy kết quả là ${rad(tot, s)}.`),
      ].join('\n');
    return vi(
      {
        prompt: `Simplify: ${e}`,
        answer: rad(tot, s),
        distractors: [rad(cs.reduce((t, c) => t + c, 0) || 7, s), rad(-tot || 2, s), rad(tot + 1, s), rad(tot, s * 2)],
        explanation: ex(true),
      },
      `Rút gọn: ${e}`,
      ex(false),
    );
  }
  if (d === 4) {
    const kind = pick(r, ['conjugate', 'abs', 'nested'] as const);
    if (kind === 'conjugate') {
      const [b, a] = pick(r, [[2, 3], [2, 5], [3, 5], [3, 7], [5, 7], [2, 7], [6, 7], [3, 11], [5, 6]]);
      const n = a - b;
      const plus = r() < 0.5;
      const e = `${n}/(√${a} ${plus ? '+' : '−'} √${b})`;
      const ans = `√${a} ${plus ? '−' : '+'} √${b}`;
      const ex = (en: boolean) =>
        [
          tr(en, `To remove the root from the denominator, multiply top and bottom by the conjugate ${ans} (same two terms, opposite sign).`, `Để trục căn thức ở mẫu, nhân cả tử và mẫu với biểu thức liên hợp ${ans} (cùng hai số hạng, khác dấu).`),
          tr(en, `Bottom: (√${a} + √${b})(√${a} − √${b}) = (√${a})² − (√${b})² = ${a} − ${b} = ${n} (difference of two squares).`, `Mẫu: (√${a} + √${b})(√${a} − √${b}) = (√${a})² − (√${b})² = ${a} − ${b} = ${n} (hằng đẳng thức hiệu hai bình phương).`),
          tr(en, `So ${e} = ${n === 1 ? `(${ans})/1` : `${n}(${ans})/${n}`} = ${ans}${n === 1 ? '' : ` (cancel ${n})`}.`, `Vậy ${e} = ${n === 1 ? `(${ans})/1` : `${n}(${ans})/${n}`} = ${ans}${n === 1 ? '' : ` (rút gọn ${n})`}.`),
        ].join('\n');
      return vi(
        { prompt: `Simplify: ${e}`, answer: ans, distractors: [`√${a} ${plus ? '+' : '−'} √${b}`, n === 1 ? `√${a + b}` : `(√${a} ${plus ? '−' : '+'} √${b})/${n}`, `√${b} ${plus ? '+' : '−'} √${a}`], explanation: ex(true) },
        `Trục căn thức ở mẫu: ${e}`,
        ex(false),
      );
    }
    if (kind === 'abs') {
      const s = pick(r, [2, 3, 5, 6, 7, 10, 11]), c = int(r, 1, 4);
      const big = c > Math.sqrt(s);
      const e = `√((${c} − √${s})²)`;
      const res = big ? `${c} − √${s}` : `√${s} − ${c}`;
      const ex = (en: boolean) =>
        [
          tr(en, `Rule: √(A²) = |A|, the absolute value (a square root is never negative).`, `Quy tắc: √(A²) = |A| (giá trị tuyệt đối, vì căn bậc hai không bao giờ âm).`),
          tr(en, `Compare ${c} and √${s}: ${c} = √${c * c} and ${c * c} ${big ? '>' : '<'} ${s}, so ${c} ${big ? '>' : '<'} √${s}, and ${c} − √${s} is ${big ? 'positive' : 'negative'}.`, `So sánh ${c} và √${s}: ${c} = √${c * c} mà ${c * c} ${big ? '>' : '<'} ${s}, nên ${c} ${big ? '>' : '<'} √${s}, tức ${c} − √${s} ${big ? 'dương' : 'âm'}.`),
          tr(en, `So |${c} − √${s}| = ${res}${big ? '' : ' (change the sign to make it positive)'}.`, `Vậy |${c} − √${s}| = ${res}${big ? '' : ' (đổi dấu để được số dương)'}.`),
        ].join('\n');
      return vi({ prompt: `Simplify: ${e}`, answer: res, distractors: [big ? `√${s} − ${c}` : `${c} − √${s}`, `${c} + √${s}`, `−${c} − √${s}`], explanation: ex(true) }, `Rút gọn: ${e}`, ex(false));
    }
    const [u, w] = pick(r, [[3, 2], [5, 2], [5, 3], [6, 1], [7, 2], [7, 3], [6, 5], [10, 3], [5, 1], [3, 1]]);
    const plus = r() < 0.5;
    const e = `√(${u + w} ${plus ? '+' : '−'} 2√${u * w})`;
    const s = (n: number) => (n === 1 ? '1' : `√${n}`);
    const ex = (en: boolean) =>
      [
        tr(en, `Try to write the inside as a perfect square, using (A ${plus ? '+' : '−'} B)² = A² ${plus ? '+' : '−'} 2AB + B².`, `Viết biểu thức trong căn thành bình phương, dùng (A ${plus ? '+' : '−'} B)² = A² ${plus ? '+' : '−'} 2AB + B².`),
        tr(en, `We need A² + B² = ${u + w} and AB = √${u * w}: A = ${s(u)}, B = ${s(w)} work (${u} + ${w} = ${u + w}, ${s(u)}·${s(w)} = √${u * w}).`, `Cần A² + B² = ${u + w} và AB = √${u * w}: chọn A = ${s(u)}, B = ${s(w)} (${u} + ${w} = ${u + w}, ${s(u)}·${s(w)} = √${u * w}).`),
        tr(en, `So ${u + w} ${plus ? '+' : '−'} 2√${u * w} = (${s(u)} ${plus ? '+' : '−'} ${s(w)})², and √(A²) = |A| = ${s(u)} ${plus ? '+' : '−'} ${s(w)}${plus ? '' : ` (positive, because ${s(u)} > ${s(w)})`}.`, `Nên ${u + w} ${plus ? '+' : '−'} 2√${u * w} = (${s(u)} ${plus ? '+' : '−'} ${s(w)})², và √(A²) = |A| = ${s(u)} ${plus ? '+' : '−'} ${s(w)}${plus ? '' : ` (dương vì ${s(u)} > ${s(w)})`}.`),
      ].join('\n');
    return vi(
      {
        prompt: `Simplify: ${e}`,
        answer: `${s(u)} ${plus ? '+' : '−'} ${s(w)}`,
        distractors: [plus ? `${s(u)} − ${s(w)}` : `${s(w)} − ${s(u)}`, `√${u + w} ${plus ? '+' : '−'} √${u * w}`, `${s(u)} ${plus ? '+' : '−'} ${s(w * 2)}`],
        explanation: ex(true),
      },
      `Rút gọn: ${e}`,
      ex(false),
    );
  }
  // d5: entrance-exam expressions in √x (x ≥ 0)
  const kind = pick(r, ['diff', 'square', 'value', 'solve'] as const);
  if (kind === 'diff' || kind === 'square') {
    const n = int(r, 1, 6);
    const top = kind === 'diff' ? poly([1, -n * n]) : `x − ${2 * n}√x + ${n * n}`;
    const ans = kind === 'diff' ? `√x + ${n}` : `√x − ${n}`;
    const e = `(${top})/(√x − ${n})`;
    const ex = (en: boolean) =>
      [
        tr(en, `For x ≥ 0 we can write x = (√x)². Factorise the top:`, `Với x ≥ 0 ta có x = (√x)². Phân tích tử thành nhân tử:`),
        kind === 'diff'
          ? tr(en, `${top} = (√x)² − ${n}² = (√x − ${n})(√x + ${n}) (difference of two squares).`, `${top} = (√x)² − ${n}² = (√x − ${n})(√x + ${n}) (hiệu hai bình phương).`)
          : tr(en, `${top} = (√x)² − 2·√x·${n} + ${n}² = (√x − ${n})² (identity (A − B)² = A² − 2AB + B²).`, `${top} = (√x)² − 2·√x·${n} + ${n}² = (√x − ${n})² (hằng đẳng thức (A − B)² = A² − 2AB + B²).`),
        tr(en, `Cancel the common factor (√x − ${n}) — allowed because x ≠ ${n * n} makes it non-zero: the result is ${ans}.`, `Rút gọn nhân tử chung (√x − ${n}) — khác 0 vì x ≠ ${n * n}: được ${ans}.`),
      ].join('\n');
    return vi(
      { prompt: `Simplify, for x ≥ 0 and x ≠ ${n * n}: ${e}`, answer: ans, distractors: [kind === 'diff' ? `√x − ${n}` : `√x + ${n}`, `x + ${n}`, `√x + ${n * n}`, `x − ${n}`], explanation: ex(true) },
      `Rút gọn biểu thức (với x ≥ 0, x ≠ ${n * n}): ${e}`,
      ex(false),
    );
  }
  if (kind === 'value') {
    const p = int(r, 1, 9), q = int(r, 1, 5);
    let k = int(r, 1, 7);
    if (k === q) k++;
    const A = `A = (√x + ${p})/(√x − ${q})`;
    const ex = (en: boolean) =>
      [
        tr(en, `x = ${k * k} satisfies x ≥ 0 and x ≠ ${q * q}, and √${k * k} = ${k}.`, `x = ${k * k} thoả mãn điều kiện x ≥ 0, x ≠ ${q * q}, và √${k * k} = ${k}.`),
        tr(en, `Replace √x by ${k}: A = (${k} + ${p})/(${k} − ${q}) = ${ratio(k + p, k - q)}.`, `Thay √x = ${k} vào A: A = (${k} + ${p})/(${k} − ${q}) = ${ratio(k + p, k - q)}.`),
        tr(en, `Careful: put √x = ${k} into the formula, not x = ${k * k}.`, `Chú ý: thay √x = ${k}, không thay ${k * k} vào chỗ √x.`),
      ].join('\n');
    return vi(
      {
        prompt: `${A}. Find A when x = ${k * k}.`,
        answer: fracN(k + p, k - q),
        distractors: [fracN(k * k + p, k * k - q), fracN(k + p, k + q), fracN(k - p, k - q), fracN(-(k + p), k - q), fracN(k * k + p, k - q)],
        explanation: ex(true),
      },
      `Cho ${A}. Tính giá trị của A khi x = ${k * k}.`,
      ex(false),
    );
  }
  // √x + p = v(√x − q)  ⇒  √x = (p + vq)/(v − 1)
  let t = 0, v = 0, q = 0, p = 0;
  do {
    t = int(r, 1, 6);
    v = int(r, 2, 4);
    q = int(r, 1, 4);
    p = t * (v - 1) - v * q;
  } while (p < 1 || p > 9 || t === q);
  const A = `A = (√x + ${p})/(√x − ${q})`;
  const ex = (en: boolean) =>
    [
      tr(en, `A = ${v} means (√x + ${p})/(√x − ${q}) = ${v}. Multiply both sides by (√x − ${q}): √x + ${p} = ${v}(√x − ${q}) = ${v}√x − ${v * q}.`, `A = ${v} tức (√x + ${p})/(√x − ${q}) = ${v}. Nhân hai vế với (√x − ${q}): √x + ${p} = ${v}(√x − ${q}) = ${v}√x − ${v * q}.`),
      tr(en, `Collect the √x terms on one side: ${p} + ${v * q} = ${v}√x − √x, so ${v - 1 === 1 ? '' : v - 1}√x = ${p + v * q}${v - 1 === 1 ? '' : `, √x = ${p + v * q}/${v - 1} = ${t}`}.`, `Chuyển các hạng tử chứa √x về một vế: ${p} + ${v * q} = ${v}√x − √x, nên ${v - 1 === 1 ? '' : v - 1}√x = ${p + v * q}${v - 1 === 1 ? '' : `, √x = ${p + v * q}/${v - 1} = ${t}`}.`),
      tr(en, `So x = ${t}² = ${t * t} (it satisfies x ≥ 0, x ≠ ${q * q}). Careful: the answer is x, not √x.`, `Vậy x = ${t}² = ${t * t} (thoả mãn x ≥ 0, x ≠ ${q * q}). Chú ý: đề hỏi x chứ không phải √x.`),
    ].join('\n');
  return vi({ prompt: `${A}. Find x so that A = ${v}.`, answer: `x = ${t * t}`, distractors: [`x = ${t}`, `x = ${(t + 1) ** 2}`, `x = ${t * t * v}`], explanation: ex(true) }, `Cho ${A}. Tìm x để A = ${v}.`, ex(false));
};

// ── Equations reducible to linear ────────────────────────────────────
/** "x − 3 = 0 ⇒ x = 3" or "2x + 5 = 0 ⇒ 2x = −5 ⇒ x = −5/2". */
const linRoot = (a: number, b: number) => `${poly([a, b])} = 0 ⇒ ${a === 1 ? '' : `${terms([[a, 'x']])} = ${num(-b)} ⇒ `}x = ${ratio(-b, a)}`;
const rationalEq: Generator = (d, r) => {
  const NONE = 'No solution';
  const zeroRule = (en: boolean) => tr(en, `A product is 0 only when one of its factors is 0 (A·B = 0 ⇒ A = 0 or B = 0), so set each bracket equal to 0.`, `Tích bằng 0 khi một trong các thừa số bằng 0 (A·B = 0 ⇒ A = 0 hoặc B = 0), nên cho từng ngoặc bằng 0.`);
  if (d <= 2) {
    if (d === 1) {
      const p = nz(r, -9, 9);
      let q = nz(r, -9, 9);
      if (Math.abs(q) === Math.abs(p)) q = p > 0 ? p - 11 : p + 11;
      const e = `${factor(p)}${factor(q)} = 0`;
      const ex = (en: boolean) =>
        [
          zeroRule(en),
          `${linRoot(1, -p)}; ${linRoot(1, -q)}.`,
          tr(en, `Careful: the solution has the opposite sign to the number in the bracket: (x ${signed(-p)}) gives x = ${num(p)}.`, `Chú ý: nghiệm trái dấu với số trong ngoặc: (x ${signed(-p)}) cho x = ${num(p)}.`),
        ].join('\n');
      return vi({ prompt: `Solve: ${e}`, answer: roots([[p, 1], [q, 1]]), distractors: [roots([[-p, 1], [-q, 1]]), roots([[p, 1], [-q, 1]]), `x = ${num(p)}`], explanation: ex(true) }, `Giải phương trình: ${e}`, ex(false));
    }
    const a = int(r, 2, 5), b = nz(r, -9, 9), c = int(r, 1, 4), e2 = nz(r, -9, 9);
    const e = `(${poly([a, b])})(${poly([c, e2])}) = 0`;
    const ex = (en: boolean) => [zeroRule(en), `${linRoot(a, b)}.`, `${linRoot(c, e2)}.`, tr(en, `So ${roots([[-b, a], [-e2, c]])}.`, `Vậy ${roots([[-b, a], [-e2, c]])}.`)].join('\n');
    return vi(
      { prompt: `Solve: ${e}`, answer: roots([[-b, a], [-e2, c]]), distractors: [roots([[b, a], [e2, c]]), roots([[-a, b], [-c, e2]]), roots([[-b, 1], [-e2, 1]])], explanation: ex(true) },
      `Giải phương trình: ${e}`,
      ex(false),
    );
  }
  if (d === 3) {
    const k = nz(r, -9, 9);
    const first = r() < 0.5;
    const e = first ? `${poly([1, -k, 0])} = 0` : `x² = ${poly([k, 0])}`;
    const ex = (en: boolean) =>
      [
        first ? '' : tr(en, `Bring everything to one side: ${poly([1, -k, 0])} = 0.`, `Chuyển vế: ${poly([1, -k, 0])} = 0.`),
        tr(en, `Both terms contain x, so take x out as a common factor: x(x ${signed(-k)}) = 0.`, `Hai hạng tử đều chứa x, nên đặt x làm nhân tử chung: x(x ${signed(-k)}) = 0.`),
        tr(en, `A product is 0 when a factor is 0: x = 0 or x ${signed(-k)} = 0 ⇒ x = ${num(k)}.`, `Tích bằng 0 khi một thừa số bằng 0: x = 0 hoặc x ${signed(-k)} = 0 ⇒ x = ${num(k)}.`),
        tr(en, `Careful: never divide both sides by x — x could be 0, and you would lose the solution x = 0.`, `Chú ý: không chia hai vế cho x vì x có thể bằng 0, sẽ mất nghiệm x = 0.`),
      ]
        .filter(Boolean)
        .join('\n');
    return vi({ prompt: `Solve: ${e}`, answer: roots([[0, 1], [k, 1]]), distractors: [`x = ${num(k)}`, roots([[0, 1], [-k, 1]]), `x = ${num(-k)}`], explanation: ex(true) }, `Giải phương trình: ${e}`, ex(false));
  }
  if (d === 4) {
    // (x + p)/(x − q) = k
    let x0 = 0, q = 0, k = 0, p = 0;
    do {
      x0 = nz(r, -8, 9);
      q = nz(r, -6, 6);
      k = pick(r, [-3, -2, 2, 3, 4]);
      p = k * (x0 - q) - x0;
    } while (x0 === q || Math.abs(p) > 15);
    const top = p === 0 ? 'x' : `x ${signed(p)}`;
    const e = `${p === 0 ? 'x' : `(x ${signed(p)})`}/(x ${signed(-q)}) = ${num(k)}`;
    const ex = (en: boolean) =>
      [
        tr(en, `Condition: the denominator can't be 0, so x ${signed(-q)} ≠ 0, i.e. x ≠ ${num(q)}.`, `Điều kiện xác định: mẫu khác 0, tức x ${signed(-q)} ≠ 0, hay x ≠ ${num(q)}.`),
        tr(en, `Multiply both sides by (x ${signed(-q)}): ${top} = ${num(k)}(x ${signed(-q)}) = ${terms([[k, 'x'], [-k * q, '']])}.`, `Nhân hai vế với (x ${signed(-q)}): ${top} = ${num(k)}(x ${signed(-q)}) = ${terms([[k, 'x'], [-k * q, '']])}.`),
        tr(en, `x terms to the left, numbers to the right: ${terms([[1, 'x'], [-k, 'x']])} = ${num(-k * q)} ${signed(-p)}, so ${terms([[1 - k, 'x']])} = ${num(x0 * (1 - k))}, x = ${ratio(x0 * (1 - k), 1 - k)}.`, `Chuyển vế: ${terms([[1, 'x'], [-k, 'x']])} = ${num(-k * q)} ${signed(-p)}, nên ${terms([[1 - k, 'x']])} = ${num(x0 * (1 - k))}, x = ${ratio(x0 * (1 - k), 1 - k)}.`),
        tr(en, `x = ${num(x0)} ≠ ${num(q)}, so it satisfies the condition. Answer: x = ${num(x0)}.`, `x = ${num(x0)} ≠ ${num(q)} nên thoả mãn điều kiện. Vậy x = ${num(x0)}.`),
      ].join('\n');
    return vi({ prompt: `Solve: ${e}`, answer: `x = ${num(x0)}`, distractors: [`x = ${num(q)}`, `x = ${num(-x0)}`, `x = ${fracN(k * q + p, k + 1)}`, NONE], explanation: ex(true) }, `Giải phương trình: ${e}`, ex(false));
  }
  // d5: the trap — a solution that breaks the condition
  const q = nz(r, -6, 6);
  const cond = (en: boolean) => tr(en, `Condition: the denominator can't be 0, so x ≠ ${num(q)}.`, `Điều kiện xác định: mẫu khác 0, nên x ≠ ${num(q)}.`);
  if (r() < 0.4) {
    const e = `x²/(x ${signed(-q)}) = ${q * q}/(x ${signed(-q)})`;
    const ex = (en: boolean) =>
      [
        cond(en),
        tr(en, `Both sides have the same denominator, so the tops must be equal: x² = ${q * q}.`, `Hai vế cùng mẫu nên hai tử bằng nhau: x² = ${q * q}.`),
        tr(en, `x² = ${q * q} gives x = ${Math.abs(q)} or x = −${Math.abs(q)} (both square to ${q * q}).`, `x² = ${q * q} cho x = ${Math.abs(q)} hoặc x = −${Math.abs(q)} (đều có bình phương bằng ${q * q}).`),
        tr(en, `x = ${num(q)} breaks the condition (it makes the denominator 0), so reject it. Answer: x = ${num(-q)}.`, `x = ${num(q)} không thoả mãn điều kiện (làm mẫu bằng 0) nên loại. Vậy x = ${num(-q)}.`),
      ].join('\n');
    return vi({ prompt: `Solve: ${e}`, answer: `x = ${num(-q)}`, distractors: [roots([[q, 1], [-q, 1]]), `x = ${num(q)}`, NONE], explanation: ex(true) }, `Giải phương trình: ${e}`, ex(false));
  }
  // (2x + a)/(x − q) = (x + b)/(x − q)  ⇒  x = b − a, rejected when it equals q
  const reject = r() < 0.4;
  const a = nz(r, -7, 7);
  const b = reject ? q + a : a + pick(r, [-5, -3, -2, 2, 3, 5].filter((t) => t !== q));
  const x0 = b - a;
  const e = `(${poly([2, a])})/(x ${signed(-q)}) = (${poly([1, b])})/(x ${signed(-q)})`;
  const ex = (en: boolean) =>
    [
      cond(en),
      tr(en, `Both sides have the same denominator, so the tops must be equal: 2x ${signed(a)} = x ${signed(b)}.`, `Hai vế cùng mẫu nên hai tử bằng nhau: 2x ${signed(a)} = x ${signed(b)}.`),
      tr(en, `2x − x = ${num(b)} − ${pn(a)}, so x = ${num(x0)}.`, `2x − x = ${num(b)} − ${pn(a)}, nên x = ${num(x0)}.`),
      reject
        ? tr(en, `But x = ${num(x0)} breaks the condition x ≠ ${num(q)} (the denominator would be 0), so the equation has no solution.`, `Nhưng x = ${num(x0)} không thoả mãn điều kiện x ≠ ${num(q)} (mẫu bằng 0), vậy phương trình vô nghiệm.`)
        : tr(en, `x = ${num(x0)} ≠ ${num(q)}, so it is allowed. Answer: x = ${num(x0)}.`, `x = ${num(x0)} ≠ ${num(q)} nên thoả mãn điều kiện. Vậy x = ${num(x0)}.`),
    ].join('\n');
  return vi(
    {
      prompt: `Solve: ${e}`,
      answer: reject ? NONE : `x = ${num(x0)}`,
      distractors: reject ? [`x = ${num(x0)}`, `x = ${num(-x0)}`, `x = ${num(a + b)}`] : [NONE, `x = ${num(a + b)}`, `x = ${num(-x0)}`],
      explanation: ex(true),
    },
    `Giải phương trình: ${e}`,
    ex(false),
  );
};

// ── Word problems solved by an equation or a system ─────────────────────
const equationProblems: Generator = (d, r) => {
  if (d === 1) {
    const p1 = pick(r, [5, 6, 8, 10, 12]), p2 = pick(r, [3, 4, 7, 9].filter((p) => p !== p1));
    const x = int(r, 3, 15), y = int(r, 3, 15);
    const total = (p1 * x + p2 * y) * 1000;
    const N = x + y, T = p1 * x + p2 * y;
    const ex = (en: boolean) =>
      [
        tr(en, `Let x = number of notebooks and y = number of pens.`, `Gọi x là số quyển vở, y là số cây bút (x, y nguyên dương).`),
        tr(en, `Count of items: x + y = ${N}. Money (in thousands of VND): ${p1}x + ${p2}y = ${T}.`, `Tổng số món: x + y = ${N}. Số tiền (nghìn đồng): ${p1}x + ${p2}y = ${T}.`),
        tr(en, `From the first equation y = ${N} − x. Substitute: ${p1}x + ${p2}(${N} − x) = ${T} ⇒ ${p1}x − ${p2}x = ${T} − ${p2 * N}.`, `Từ phương trình đầu y = ${N} − x. Thế vào: ${p1}x + ${p2}(${N} − x) = ${T} ⇒ ${p1}x − ${p2}x = ${T} − ${p2 * N}.`),
        tr(en, `${terms([[p1 - p2, 'x']])} = ${num((p1 - p2) * x)} ⇒ x = ${ratio((p1 - p2) * x, p1 - p2)}. They bought ${x} notebooks (and ${y} pens).`, `${terms([[p1 - p2, 'x']])} = ${num((p1 - p2) * x)} ⇒ x = ${ratio((p1 - p2) * x, p1 - p2)}. Vậy lớp mua ${x} quyển vở (và ${y} cây bút).`),
      ].join('\n');
    return vi(
      {
        prompt: `A class buys ${x + y} items in total: notebooks at ${vnd(p1 * 1000)} VND each and pens at ${vnd(p2 * 1000)} VND each, paying ${vnd(total)} VND. How many notebooks did they buy?`,
        ...numeric(x, [y, Math.round((x + y) / 2), x + 1], r),
        explanation: ex(true),
      },
      `Một lớp mua tổng cộng ${x + y} món đồ gồm vở giá ${vndVi(p1 * 1000)} đồng/quyển và bút giá ${vndVi(p2 * 1000)} đồng/cây, hết ${vndVi(total)} đồng. Lớp đã mua bao nhiêu quyển vở?`,
      ex(false),
    );
  }
  if (d === 2) {
    let t = 0, u = 0;
    do {
      t = int(r, 1, 9);
      u = int(r, 1, 9);
    } while (t === u);
    const n = 10 * t + u, diff = 9 * (u - t);
    const word = diff > 0 ? 'greater' : 'smaller';
    const ex = (en: boolean) =>
      [
        tr(en, `Let a = tens digit, b = ones digit. The number is 10a + b; swapped it is 10b + a.`, `Gọi chữ số hàng chục là a, hàng đơn vị là b. Số đó là 10a + b; đổi chỗ được 10b + a.`),
        tr(en, `Digit sum: a + b = ${t + u}. Swap: (10b + a) − (10a + b) = ${num(diff)} ⇒ 9b − 9a = ${num(diff)} ⇒ b − a = ${num(u - t)}.`, `Tổng các chữ số: a + b = ${t + u}. Đổi chỗ: (10b + a) − (10a + b) = ${num(diff)} ⇒ 9b − 9a = ${num(diff)} ⇒ b − a = ${num(u - t)}.`),
        tr(en, `Add the two equations: 2b = ${t + u} + ${pn(u - t)} = ${2 * u} ⇒ b = ${u}; then a = ${t + u} − ${u} = ${t}.`, `Cộng hai phương trình: 2b = ${t + u} + ${pn(u - t)} = ${2 * u} ⇒ b = ${u}; khi đó a = ${t + u} − ${u} = ${t}.`),
        tr(en, `The number is ${n}.`, `Vậy số cần tìm là ${n}.`),
      ].join('\n');
    return vi(
      {
        prompt: `A two-digit number has digit sum ${t + u}. Swapping its digits gives a number ${Math.abs(diff)} ${word} than the original. Find the number.`,
        ...numeric(n, [10 * u + t, 10 * (t + 1) + (u - 1), 10 * (t - 1) + (u + 1)].filter((m) => m >= 10 && m <= 99), r),
        explanation: ex(true),
      },
      `Một số có hai chữ số có tổng các chữ số bằng ${t + u}. Nếu đổi chỗ hai chữ số thì được số mới ${diff > 0 ? 'lớn' : 'nhỏ'} hơn số ban đầu ${Math.abs(diff)} đơn vị. Tìm số đó.`,
      ex(false),
    );
  }
  if (d === 3) {
    const pa = pick(r, [10, 15, 20]), pb = pick(r, [10, 15, 20, 25].filter((p) => p !== pa));
    const x = int(r, 6, 30) * 20, y = int(r, 6, 30) * 20;
    const made = x + (x * pa) / 100 + y + (y * pb) / 100;
    const N = x + y, E = made - N;
    const ex = (en: boolean) =>
      [
        tr(en, `Let x = factory A's target and y = factory B's target: x + y = ${N}.`, `Gọi x, y là số sản phẩm theo kế hoạch của nhà máy A và B: x + y = ${N}.`),
        tr(en, `The extra made over target: ${made} − ${N} = ${E}. A's extra is ${pa}% of x, B's is ${pb}% of y: ${pa}x/100 + ${pb}y/100 = ${E}, i.e. ${pa}x + ${pb}y = ${100 * E}.`, `Số sản phẩm vượt mức: ${made} − ${N} = ${E}. A vượt ${pa}% của x, B vượt ${pb}% của y: ${pa}x/100 + ${pb}y/100 = ${E}, tức ${pa}x + ${pb}y = ${100 * E}.`),
        tr(en, `Put y = ${N} − x: ${pa}x + ${pb}(${N} − x) = ${100 * E} ⇒ ${terms([[pa - pb, 'x']])} = ${100 * E} − ${pb * N} = ${num((pa - pb) * x)}.`, `Thế y = ${N} − x: ${pa}x + ${pb}(${N} − x) = ${100 * E} ⇒ ${terms([[pa - pb, 'x']])} = ${100 * E} − ${pb * N} = ${num((pa - pb) * x)}.`),
        tr(en, `x = ${ratio((pa - pb) * x, pa - pb)}. Factory A's target was ${x} products.`, `x = ${ratio((pa - pb) * x, pa - pb)}. Vậy theo kế hoạch nhà máy A phải làm ${x} sản phẩm.`),
      ].join('\n');
    return vi(
      {
        prompt: `Two factories had to make ${x + y} products in total. Factory A went ${pa}% over its target and factory B went ${pb}% over, so together they made ${made}. What was factory A's target?`,
        ...numeric(x, [y, (x + y) / 2, x + 20], r),
        explanation: ex(true),
      },
      `Hai nhà máy theo kế hoạch phải làm tổng cộng ${x + y} sản phẩm. Nhà máy A vượt mức ${pa}%, nhà máy B vượt mức ${pb}%, nên cả hai làm được ${made} sản phẩm. Theo kế hoạch nhà máy A phải làm bao nhiêu sản phẩm?`,
      ex(false),
    );
  }
  if (d === 4) {
    // 1/a + 1/b = 1/T
    const [a, b, T] = pick(r, [[3, 6, 2], [4, 12, 3], [6, 12, 4], [10, 15, 6], [12, 24, 8], [20, 30, 12], [6, 30, 5], [5, 20, 4], [8, 24, 6], [9, 18, 6], [14, 35, 10], [15, 30, 10], [10, 40, 8], [12, 36, 9]]);
    const g = b - a, B = g - 2 * T, C = -T * g, other = C / a, D = B * B - 4 * C, q = a - other;
    const ex = (en: boolean) =>
      [
        tr(en, `Let x = days team A needs alone (x > ${T}); team B needs x + ${g} days.`, `Gọi x là số ngày đội A làm riêng xong việc (x > ${T}); đội B cần x + ${g} ngày.`),
        tr(en, `In one day A does 1/x of the job, B does 1/(x + ${g}), together 1/${T}: 1/x + 1/(x + ${g}) = 1/${T}.`, `Mỗi ngày đội A làm được 1/x công việc, đội B làm được 1/(x + ${g}), cả hai làm được 1/${T}: 1/x + 1/(x + ${g}) = 1/${T}.`),
        tr(en, `Multiply by ${T}x(x + ${g}): ${T}(x + ${g}) + ${T}x = x(x + ${g}) ⇒ ${poly([1, B, C])} = 0.`, `Nhân hai vế với ${T}x(x + ${g}): ${T}(x + ${g}) + ${T}x = x(x + ${g}) ⇒ ${poly([1, B, C])} = 0.`),
        `a = 1, b = ${num(B)}, c = ${num(C)}: Δ = b² − 4ac = ${pn(B)}² − 4·1·${pn(C)} = ${D}, √Δ = ${q}.`,
        tr(en, `x = (${num(-B)} + ${q})/2 = ${a} or x = (${num(-B)} − ${q})/2 = ${num(other)} (negative, rejected). Team A needs ${a} days.`, `x = (${num(-B)} + ${q})/2 = ${a} hoặc x = (${num(-B)} − ${q})/2 = ${num(other)} (âm, loại). Vậy đội A cần ${a} ngày.`),
      ].join('\n');
    return vi(
      {
        prompt: `Two teams working together finish a job in ${T} days. Working alone, team A needs ${b - a} days fewer than team B. How many days does team A need alone?`,
        ...numeric(a, [b, 2 * T, T + (b - a) / 2], r),
        explanation: ex(true),
      },
      `Hai đội cùng làm một công việc thì xong trong ${T} ngày. Nếu làm riêng, đội A cần ít hơn đội B ${b - a} ngày. Hỏi làm riêng thì đội A cần bao nhiêu ngày?`,
      ex(false),
    );
  }
  const kind = pick(r, ['motion', 'rectangle', 'diagonal'] as const);
  if (kind === 'motion') {
    // D/x − D/(x + v) hours = t minutes
    for (let tries = 0; tries < 50; tries++) {
      const x = int(r, 10, 20), v = pick(r, [2, 3, 4, 5]);
      const options = [];
      for (let D = 20; D <= 90; D++) if ((60 * D * v) % (x * (x + v)) === 0) options.push(D);
      if (!options.length) continue;
      const D = pick(r, options);
      const t = (60 * D * v) / (x * (x + v));
      const h = frac(t, 60), K = x * (x + v), q = 2 * x + v;
      const ex = (en: boolean) =>
        [
          tr(en, `Let x = speed from A to B (km/h, x > 0); the way back is at x + ${v} km/h.`, `Gọi x là vận tốc lúc đi (km/h, x > 0); vận tốc lúc về là x + ${v} km/h.`),
          tr(en, `Time = distance ÷ speed: going takes ${D}/x hours, returning ${D}/(x + ${v}) hours, and ${t} minutes = ${h} h. So ${D}/x − ${D}/(x + ${v}) = ${h}.`, `Thời gian = quãng đường : vận tốc: lúc đi ${D}/x giờ, lúc về ${D}/(x + ${v}) giờ; ${t} phút = ${h} giờ. Nên ${D}/x − ${D}/(x + ${v}) = ${h}.`),
          tr(en, `Multiply by x(x + ${v}): ${D}(x + ${v}) − ${D}x = ${h}·x(x + ${v}) ⇒ ${D * v} = ${h}·x(x + ${v}) ⇒ x(x + ${v}) = ${K}.`, `Nhân hai vế với x(x + ${v}): ${D}(x + ${v}) − ${D}x = ${h}·x(x + ${v}) ⇒ ${D * v} = ${h}·x(x + ${v}) ⇒ x(x + ${v}) = ${K}.`),
          `${poly([1, v, -K])} = 0: Δ = ${v}² − 4·1·(−${K}) = ${v * v + 4 * K}, √Δ = ${q}.`,
          tr(en, `x = (−${v} + ${q})/2 = ${x} (the other root (−${v} − ${q})/2 = −${x + v} is negative, rejected). Speed: ${x} km/h.`, `x = (−${v} + ${q})/2 = ${x} (nghiệm (−${v} − ${q})/2 = −${x + v} âm, loại). Vậy vận tốc lúc đi là ${x} km/h.`),
        ].join('\n');
      return vi(
        {
          prompt: `A cyclist rides ${D} km from A to B. On the way back he rides ${v} km/h faster, so the return trip takes ${t} minutes less. Find his speed from A to B (km/h).`,
          ...numeric(x, [x + v, x - v, Math.round(D / (t / 60))], r),
          explanation: ex(true),
        },
        `Một người đi xe đạp từ A đến B dài ${D} km. Lúc về người đó đi nhanh hơn ${v} km/h nên thời gian về ít hơn thời gian đi ${t} phút. Tính vận tốc lúc đi từ A đến B (km/h).`,
        ex(false),
      );
    }
  }
  if (kind === 'diagonal') {
    const [a, b, c] = pick(r, [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]]);
    const k = pick(r, a * 3 < 30 ? [1, 2, 3] : [1]);
    const [w, l, dg] = [a * k, b * k, c * k];
    const g = l - w;
    const ex = (en: boolean) =>
      [
        tr(en, `Let x = width (cm, x > 0); the length is x + ${g}.`, `Gọi chiều rộng là x (cm, x > 0); chiều dài là x + ${g}.`),
        tr(en, `The diagonal splits the rectangle into right triangles, so by Pythagoras (leg² + leg² = hypotenuse²): x² + (x + ${g})² = ${dg}².`, `Đường chéo chia hình chữ nhật thành hai tam giác vuông, theo định lí Py-ta-go: x² + (x + ${g})² = ${dg}².`),
        tr(en, `Expand: x² + x² + ${2 * g}x + ${g * g} = ${dg * dg} ⇒ 2x² + ${2 * g}x − ${dg * dg - g * g} = 0 ⇒ (divide by 2) ${poly([1, g, -w * l])} = 0.`, `Khai triển: x² + x² + ${2 * g}x + ${g * g} = ${dg * dg} ⇒ 2x² + ${2 * g}x − ${dg * dg - g * g} = 0 ⇒ (chia cho 2) ${poly([1, g, -w * l])} = 0.`),
        tr(en, `Two numbers with sum ${g} and product −${w * l}: ${l} and −${w}, so (x − ${w})(x + ${l}) = 0 ⇒ x = ${w} or x = −${l} (negative, rejected). Width: ${w} cm.`, `Phân tích: (x − ${w})(x + ${l}) = 0 ⇒ x = ${w} hoặc x = −${l} (âm, loại). Vậy chiều rộng là ${w} cm.`),
      ].join('\n');
    return vi(
      { prompt: `A rectangle's length is ${g} cm more than its width, and its diagonal is ${dg} cm. Find the width (cm).`, ...numeric(w, [l, dg - l, Math.round(dg / 2)], r), explanation: ex(true) },
      `Một hình chữ nhật có chiều dài hơn chiều rộng ${g} cm và đường chéo dài ${dg} cm. Tính chiều rộng (cm).`,
      ex(false),
    );
  }
  let w = 0, l = 0;
  do {
    w = int(r, 3, 15);
    l = int(r, 4, 25);
  } while (l <= w);
  const ex = (en: boolean) =>
    [
      tr(en, `Perimeter = 2·(length + width), so length + width = ${2 * (l + w)} : 2 = ${l + w}. Area: length × width = ${l * w}.`, `Chu vi = 2·(dài + rộng), nên dài + rộng = ${2 * (l + w)} : 2 = ${l + w}. Diện tích: dài × rộng = ${l * w}.`),
      tr(en, `Two numbers with sum S and product P are the roots of t² − St + P = 0 (Viète in reverse): ${poly([1, -(l + w), l * w], 't')} = 0.`, `Hai số có tổng S và tích P là nghiệm của t² − St + P = 0 (Vi-ét đảo): ${poly([1, -(l + w), l * w], 't')} = 0.`),
      tr(en, `${w} + ${l} = ${l + w} and ${w}·${l} = ${l * w}, so (t − ${w})(t − ${l}) = 0: t = ${w} or t = ${l}.`, `${w} + ${l} = ${l + w} và ${w}·${l} = ${l * w}, nên (t − ${w})(t − ${l}) = 0: t = ${w} hoặc t = ${l}.`),
      tr(en, `The length is the bigger one: ${l} cm.`, `Chiều dài là số lớn hơn: ${l} cm.`),
    ].join('\n');
  return vi(
    { prompt: `A rectangle has perimeter ${2 * (l + w)} cm and area ${l * w} cm². Find its length (cm).`, ...numeric(l, [w, (l + w) / 2, l + w], r), explanation: ex(true) },
    `Một hình chữ nhật có chu vi ${2 * (l + w)} cm và diện tích ${l * w} cm². Tính chiều dài (cm).`,
    ex(false),
  );
};

export const grade9Generators: Record<string, Generator> = {
  'math.algebra.expressions': expressions,
  'math.algebra.inequalities': inequalities,
  'math.algebra.systems': systems,
  'math.algebra.quadratics': quadratics,
  'math.algebra.radicals': radicals,
  'math.algebra.reducible': rationalEq,
  'math.algebra.vieta': vieta,
  'math.algebra.parabola': parabola,
  'math.reasoning.equation-problems': equationProblems,
};
