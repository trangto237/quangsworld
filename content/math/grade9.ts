/**
 * Grade 9 algebra (Toán 9, 2018 programme) and the grade-10 entrance exam (Vào 10 Hà Nội):
 * radical expressions, systems, equations reducible to linear, inequalities, quadratics with Δ and
 * parameters, Viète's theorem, the parabola y = ax² and its intersections with a line, and word problems
 * solved by setting up an equation or a system. Every generator writes its prompt and explanation in
 * English and Vietnamese, and difficulty 5 is entrance-exam level.
 */
import type { Generated, Generator } from './generators';
import { FLIP, factor, frac, fracN, int, nz, num, numeric, pick, poly, rad, roots, signed, terms } from './util';

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
    return vi(
      {
        prompt: `Simplify: ${terms([[a, 'x'], [c, 'y'], [b, 'x'], [e, '']])}`,
        answer: ans,
        distractors: [terms([[a + b + c, 'x'], [e, '']]), terms([[a - b, 'x'], [c, 'y'], [e, '']]), terms([[a + b, 'x'], [c + e, 'y']])],
      },
      `Rút gọn: ${terms([[a, 'x'], [c, 'y'], [b, 'x'], [e, '']])}`,
    );
  }
  if (d === 3) {
    if (r() < 0.5) {
      const a = pick(r, [-5, -4, -3, -2, 2, 3, 4, 5, 6]), b = nz(r, -9, 9);
      const e = `${num(a)}(x ${signed(b)})`;
      return vi({ prompt: `Expand: ${e}`, answer: poly([a, a * b]), distractors: [poly([a, b]), poly([a, -a * b]), poly([1, a * b])] }, `Khai triển: ${e}`);
    }
    const a = nz(r, -3, 4), b = nz(r, -6, 6), x = nz(r, -4, 5);
    const ans = a * x * x + b * x;
    const e = poly([a, b, 0]);
    return vi(
      { prompt: `If x = ${num(x)}, find ${e}`, ...numeric(ans, [(a * x) ** 2 + b * x, a * x * 2 + b * x, -a * x * x + b * x], r, num) },
      `Với x = ${num(x)}, tính ${e}`,
    );
  }
  if (d === 4) {
    if (r() < 0.5) {
      const p = nz(r, -7, 7), q = nz(r, -7, 7);
      const e = `${factor(-p)}${factor(-q)}`;
      return vi({ prompt: `Expand: ${e}`, answer: poly([1, p + q, p * q]), distractors: [poly([1, p * q, p + q]), poly([1, 0, p * q]), poly([1, p + q, -p * q])] }, `Khai triển: ${e}`);
    }
    const a = int(r, 1, 3), p = nz(r, -6, 6);
    const e = `(${poly([a, p])})²`;
    return vi(
      {
        prompt: `Expand: ${e}`,
        answer: poly([a * a, 2 * a * p, p * p]),
        distractors: [poly([a * a, 0, p * p]), poly([a * a, a * p, p * p]), poly([a * a, -2 * a * p, p * p])],
        explanation: '(A + B)² = A² + 2AB + B² and (A − B)² = A² − 2AB + B².',
      },
      `Khai triển: ${e}`,
      '(A + B)² = A² + 2AB + B² và (A − B)² = A² − 2AB + B².',
    );
  }
  // d5: factorise
  const kind = pick(r, ['diff', 'trinomial', 'common'] as const);
  if (kind === 'diff') {
    const k = int(r, 2, 12);
    const e = poly([1, 0, -k * k]);
    return vi(
      {
        prompt: `Factorise: ${e}`,
        answer: `(x − ${k})(x + ${k})`,
        distractors: [`(x − ${k})²`, `(x + ${k})²`, `(x − ${k * k})(x + 1)`],
        explanation: 'A² − B² = (A − B)(A + B).',
      },
      `Phân tích thành nhân tử: ${e}`,
      'A² − B² = (A − B)(A + B).',
    );
  }
  if (kind === 'common') {
    const a = int(r, 2, 5), k = int(r, 1, 6);
    const e = poly([a, 0, -a * k * k]);
    return vi(
      {
        prompt: `Factorise: ${e}`,
        answer: `${a}(x − ${k})(x + ${k})`,
        distractors: [`${a}(x − ${k})²`, `(${a}x − ${k})(x + ${k})`, `${a}(x − ${k * k})(x + ${k * k})`],
        explanation: 'Take out the common factor first, then use A² − B² = (A − B)(A + B).',
      },
      `Phân tích thành nhân tử: ${e}`,
      'Đặt nhân tử chung ra ngoài trước, rồi dùng A² − B² = (A − B)(A + B).',
    );
  }
  let p = nz(r, -8, 8), q = nz(r, -8, 8);
  if (p === -q) q = q + 1 || 2;
  const e = poly([1, p + q, p * q]);
  const f = (u: number, v: number) => (u === v ? `${factor(-u)}²` : `${factor(-Math.min(u, v))}${factor(-Math.max(u, v))}`);
  return vi(
    {
      prompt: `Factorise: ${e}`,
      answer: f(p, q),
      distractors: [f(-p, -q), f(p, -q), f(-p, q), f(p * q, 1)],
      explanation: 'Find two numbers that multiply to c and add to b.',
    },
    `Phân tích thành nhân tử: ${e}`,
    'Tìm hai số có tích bằng c và tổng bằng b.',
  );
};

// ── Inequalities ────────────────────────────────────────────────
const inequalities: Generator = (d, r) => {
  const signs = d >= 3 ? (['<', '>', '≤', '≥'] as const) : (['<', '>'] as const);
  if (d <= 4) {
    const x = int(r, -6, 9);
    const a = d === 4 ? -int(r, 2, 7) : int(r, 2, 7);
    const b = nz(r, -12, 12);
    const sign = pick(r, signs);
    const out = a < 0 ? FLIP[sign] : sign;
    const e = `${poly([a, b])} ${sign} ${num(a * x + b)}`;
    return vi(
      {
        prompt: `Solve: ${e}`,
        answer: `x ${out} ${num(x)}`,
        distractors: [`x ${FLIP[out]} ${num(x)}`, `x ${out} ${num(-x || x + 1)}`, `x ${out} ${num(x + 1)}`],
        explanation: a < 0 ? 'Dividing by a negative number flips the inequality sign.' : undefined,
      },
      `Giải bất phương trình: ${e}`,
      a < 0 ? 'Chia cho số âm thì phải đổi chiều bất đẳng thức.' : undefined,
    );
  }
  if (r() < 0.5) {
    // (x − p)/2 − (x + q)/3 < k  ⇔  3(x − p) − 2(x + q) < 6k  ⇔  x < 6k + 3p + 2q
    const p = nz(r, -5, 5), q = nz(r, -5, 5), k = nz(r, -3, 3);
    const sign = pick(r, signs);
    const x0 = 6 * k + 3 * p + 2 * q;
    const e = `(x ${signed(-p)})/2 − (x ${signed(q)})/3 ${sign} ${num(k)}`;
    return vi(
      {
        prompt: `Solve: ${e}`,
        answer: `x ${sign} ${num(x0)}`,
        distractors: [`x ${FLIP[sign]} ${num(x0)}`, `x ${sign} ${num(6 * k + 3 * p - 2 * q)}`, `x ${sign} ${num(k + p + q)}`],
        explanation: `Multiply both sides by 6: 3(x ${signed(-p)}) − 2(x ${signed(q)}) ${sign} ${num(6 * k)}. Careful with the minus in front of the second bracket.`,
      },
      `Giải bất phương trình: ${e}`,
      `Nhân cả hai vế với 6: 3(x ${signed(-p)}) − 2(x ${signed(q)}) ${sign} ${num(6 * k)}. Chú ý dấu trừ trước ngoặc thứ hai.`,
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
  return vi(
    {
      prompt: `Find the ${largest ? 'largest' : 'smallest'} integer x such that ${ineq}`,
      ...numeric(ans, [out === '<' || out === '>' ? x0 : largest ? x0 - 1 : x0 + 1, largest ? x0 + 1 : x0 - 1, -ans], r, num),
      explanation: `Solving gives x ${out} ${num(x0)}${a - c < 0 ? ' (the sign flips: the x-coefficient is negative)' : ''}.`,
    },
    `Tìm số nguyên x ${largest ? 'lớn nhất' : 'nhỏ nhất'} thoả mãn ${ineq}`,
    `Giải ra được x ${out} ${num(x0)}${a - c < 0 ? ' (đổi chiều vì hệ số của x âm)' : ''}.`,
  );
};

// ── Systems of two equations ───────────────────────────────────────
const lin2 = (a: number, b: number) => terms([[a, 'x'], [b, 'y']]);
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
    return vi(
      {
        prompt: `Solve the system: ${s}`,
        answer: pair(x, y),
        distractors: sysDistractors(x, y),
        explanation: 'Multiply the equations so one letter has equal (or opposite) coefficients, add or subtract to eliminate it, then substitute back.',
      },
      `Giải hệ phương trình: ${s.replace(' and ', ' và ')}`,
      'Nhân các phương trình để hệ số của một ẩn bằng nhau (hoặc đối nhau), cộng hoặc trừ để khử ẩn đó, rồi thế ngược lại.',
    );
  }
  if (d === 4) {
    const [p, q] = pick(r, [[2, 3], [3, 2], [2, 5], [4, 3], [3, 4], [5, 2]]);
    const u = nz(r, -4, 4), v = nz(r, -4, 4);
    const x = p * u, y = q * v;
    const a = nz(r, -3, 3), b = nz(r, -3, 3);
    const s = `x/${p} + y/${q} = ${num(u + v)} and ${lin2(a, b)} = ${num(a * x + b * y)}`;
    return vi(
      {
        prompt: `Solve the system: ${s}`,
        answer: pair(x, y),
        distractors: sysDistractors(x, y),
        explanation: `Multiply the first equation by ${p * q} to clear the fractions: ${lin2(q, p)} = ${num(p * q * (u + v))}.`,
      },
      `Giải hệ phương trình: ${s.replace(' and ', ' và ')}`,
      `Nhân phương trình thứ nhất với ${p * q} để bỏ mẫu: ${lin2(q, p)} = ${num(p * q * (u + v))}.`,
    );
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
  return vi(
    {
      prompt: `Solve the system: ${s}`,
      answer: pair(x, y),
      distractors: [pair(X, Y), pair(y, x), pair(X + sx, Y + sy), pair(x, -y)],
      explanation: `Put u = 1/${den('x', sx)} and v = 1/${den('y', sy)}. Solving gives u = ${fracN(1, X)}, v = ${fracN(1, Y)}, so x ${signed(sx)} = ${num(X)} and y ${signed(sy)} = ${num(Y)}.`,
    },
    `Giải hệ phương trình: ${s.replace(' and ', ' và ')}`,
    `Đặt u = 1/${den('x', sx)}, v = 1/${den('y', sy)}. Giải ra u = ${fracN(1, X)}, v = ${fracN(1, Y)}, nên x ${signed(sx)} = ${num(X)} và y ${signed(sy)} = ${num(Y)}.`,
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
    return vi(
      {
        prompt: `${e} ${has}. Find ${ask}.`,
        answer: fracN(n, dd),
        distractors: sum ? [fracN(b, a), fracN(c, a), fracN(-c, a), fracN(-b, 1), fracN(-b + 1, a)] : [fracN(-c, a), fracN(-b, a), fracN(b, a), fracN(c, 1), fracN(c + 1, a)],
        explanation: 'Viète: x₁ + x₂ = −b/a and x₁·x₂ = c/a.',
      },
      `Phương trình ${e} ${hasVi}. Tính ${ask}.`,
      'Định lí Vi-ét: x₁ + x₂ = −b/a và x₁·x₂ = c/a.',
    );
  }
  if (d === 3) {
    const [S, P] = sp();
    const e = `${poly([1, -S, P])} = 0`;
    return vi(
      {
        prompt: `${e} ${has}. Find x₁² + x₂².`,
        ...numeric(S * S - 2 * P, [S * S + 2 * P, S * S - P, S - 2 * P], r, num),
        explanation: `x₁² + x₂² = (x₁ + x₂)² − 2x₁x₂ = ${num(S)}² − 2·(${num(P)}).`,
      },
      `Phương trình ${e} ${hasVi}. Tính x₁² + x₂².`,
      `x₁² + x₂² = (x₁ + x₂)² − 2x₁x₂ = ${num(S)}² − 2·(${num(P)}).`,
    );
  }
  if (d === 4) {
    const kind = pick(r, ['recip', 'diff', 'cube', 'numbers'] as const);
    if (kind === 'numbers') {
      const u = nz(r, -9, 12);
      let w = nz(r, -9, 12);
      if (w === u) w = u + 3;
      const [lo, hi] = [Math.min(u, w), Math.max(u, w)];
      const ans = `${num(lo)} and ${num(hi)}`;
      return vi(
        {
          prompt: `Find two numbers whose sum is ${num(u + w)} and whose product is ${num(u * w)}.`,
          answer: ans,
          distractors: [`${num(-hi)} and ${num(-lo)}`, `${num(lo + 1)} and ${num(hi - 1)}`, `${num(lo)} and ${num(u * w)}`].filter((s) => s !== ans),
          explanation: `They are the roots of t² − St + P = 0: ${poly([1, -(u + w), u * w], 't')} = 0.`,
        },
        `Tìm hai số biết tổng của chúng bằng ${num(u + w)} và tích bằng ${num(u * w)}.`,
        `Hai số là nghiệm của t² − St + P = 0: ${poly([1, -(u + w), u * w], 't')} = 0.`,
      );
    }
    const [S, P] = sp();
    const e = `${poly([1, -S, P])} = 0`;
    const [ask, ans, wrong, how, howVi] =
      kind === 'recip'
        ? ['1/x₁ + 1/x₂', fracN(S, P), [fracN(P, S), fracN(-S, P), fracN(1, S), fracN(S, -2 * P)], '1/x₁ + 1/x₂ = (x₁ + x₂)/(x₁x₂) = S/P.', '1/x₁ + 1/x₂ = (x₁ + x₂)/(x₁x₂) = S/P.']
        : kind === 'diff'
          ? ['(x₁ − x₂)²', num(S * S - 4 * P), [num(S * S - 2 * P), num(S * S + 4 * P), num(S - 4 * P)], '(x₁ − x₂)² = (x₁ + x₂)² − 4x₁x₂ = S² − 4P.', '(x₁ − x₂)² = (x₁ + x₂)² − 4x₁x₂ = S² − 4P.']
          : ['x₁³ + x₂³', num(S ** 3 - 3 * S * P), [num(S ** 3 + 3 * S * P), num(S ** 3 - 3 * P), num(S ** 3 - S * P)], 'x₁³ + x₂³ = (x₁ + x₂)³ − 3x₁x₂(x₁ + x₂) = S³ − 3PS.', 'x₁³ + x₂³ = (x₁ + x₂)³ − 3x₁x₂(x₁ + x₂) = S³ − 3PS.'];
    return vi({ prompt: `${e} ${has}. Find ${ask}.`, answer: ans, distractors: wrong, explanation: `${how} Here S = ${num(S)}, P = ${num(P)}.` }, `Phương trình ${e} ${hasVi}. Tính ${ask}.`, `${howVi} Ở đây S = ${num(S)}, P = ${num(P)}.`);
  }
  // d5: find the parameter from a condition on the roots
  const S = nz(r, -6, 6);
  const eq = `${poly([1, -S, 0])} + m = 0`;
  if (r() < 0.5) {
    const m0 = int(r, -8, Math.floor((S * S - 1) / 4));
    const T = S * S - 2 * m0;
    return vi(
      {
        prompt: `${eq} has two solutions x₁, x₂ with x₁² + x₂² = ${T}. Find m.`,
        answer: `m = ${num(m0)}`,
        distractors: [`m = ${num(-m0 || 2)}`, `m = ${num(S * S - T)}`, `m = ${num(T - S * S)}`, `m = ${num(m0 + 1)}`],
        explanation: `x₁ + x₂ = ${num(S)}, x₁x₂ = m, so ${num(S)}² − 2m = ${T}. Check Δ = ${S * S} − 4m > 0.`,
      },
      `Cho phương trình ${eq}. Tìm m để phương trình có hai nghiệm x₁, x₂ thoả mãn x₁² + x₂² = ${T}.`,
      `x₁ + x₂ = ${num(S)}, x₁x₂ = m, nên ${num(S)}² − 2m = ${T}. Kiểm tra lại Δ = ${S * S} − 4m > 0.`,
    );
  }
  const D = pick(r, [1, 2, 3, 4, 5, 6].filter((x) => (x - S) % 2 === 0));
  const m0 = (S * S - D * D) / 4;
  return vi(
    {
      prompt: `${eq} has two solutions x₁, x₂ with |x₁ − x₂| = ${D}. Find m.`,
      answer: `m = ${num(m0)}`,
      distractors: [`m = ${fracN(S * S - D, 4)}`, `m = ${fracN(S * S + D * D, 4)}`, `m = ${num(-m0 || 1)}`, `m = ${num(m0 + 1)}`],
      explanation: `(x₁ − x₂)² = S² − 4P: ${D * D} = ${S * S} − 4m.`,
    },
    `Cho phương trình ${eq}. Tìm m để phương trình có hai nghiệm x₁, x₂ thoả mãn |x₁ − x₂| = ${D}.`,
    `(x₁ − x₂)² = S² − 4P: ${D * D} = ${S * S} − 4m.`,
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
    if (d === 1)
      return vi(
        { prompt: `For ${P(a)}, find y when x = ${num(x)}.`, ...numeric(y, [(a[0] * a[0] * x * x) / a[1], -y, (2 * a[0] * x) / a[1]], r, num) },
        `Cho hàm số ${P(a)}. Tính y khi x = ${num(x)}.`,
      );
    if (d === 2)
      return vi(
        {
          prompt: `The parabola y = ax² passes through the point ${pt(x, y)}. Find a.`,
          answer: fracN(a[0], a[1]),
          distractors: [fracN(-a[0], a[1]), fracN(y, x), fracN(x * x, y), fracN(y * x * x, 1), fracN(2 * a[0], a[1])],
          explanation: `Put the point into y = ax²: ${num(y)} = a·${num(x)}².`,
        },
        `Parabol y = ax² đi qua điểm ${pt(x, y)}. Tìm a.`,
        `Thay toạ độ điểm vào y = ax²: ${num(y)} = a·${num(x)}².`,
      );
    return vi(
      {
        prompt: `Which point lies on the parabola ${P(a)}?`,
        answer: pt(x, y),
        distractors: [pt(x, -y), pt(y, x), pt(x, y + (y > 0 ? 1 : -1)), pt(-x, -y)],
        explanation: 'A point (x₀; y₀) is on the parabola when y₀ = a·x₀².',
      },
      `Điểm nào thuộc parabol ${P(a)}?`,
      'Điểm (x₀; y₀) thuộc parabol khi y₀ = a·x₀².',
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
    return vi(
      {
        prompt: `Find the points where the parabola ${a === 1 ? 'y = x²' : 'y = −x²'} meets the line ${line}.`,
        answer: pts(lo, hi, (x) => a * x * x),
        distractors: [pts(-hi, -lo, (x) => a * x * x), pts(lo, hi, (x) => a * x), pts(lo, hi, (x) => -a * x * x)],
        explanation: `Solve ${a === 1 ? 'x²' : '−x²'} = ${poly([k, m])}: x = ${num(lo)} or x = ${num(hi)}, then y = ${a === 1 ? 'x²' : '−x²'}.`,
      },
      `Tìm toạ độ giao điểm của parabol ${a === 1 ? 'y = x²' : 'y = −x²'} và đường thẳng ${line}.`,
      `Giải phương trình hoành độ giao điểm ${a === 1 ? 'x²' : '−x²'} = ${poly([k, m])}: x = ${num(lo)} hoặc x = ${num(hi)}, rồi tính y = ${a === 1 ? 'x²' : '−x²'}.`,
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
  return vi(
    {
      prompt: `Find m so that the line ${line} ${ask.replace('the parabola', `the parabola ${par}`)}.`,
      answer,
      distractors: kind === 'touch' ? [`m = ${num(-v)}`, `m = ${fracN(v, 4)}`, `m ${two} ${num(v)}`] : [`m ${kind === 'two' ? FLIP[two] : two} ${num(v)}`, `m = ${num(v)}`, `m ${kind === 'two' ? two : FLIP[two]} ${num(-v)}`],
      explanation: `x-coordinates of common points: ${a === 1 ? 'x²' : '−x²'} = ${poly([k, 0])} + m, i.e. ${poly([a, -k, 0])} − m = 0, Δ = ${k * k} ${a === 1 ? '+' : '−'} 4m. Touch: Δ = 0; two points: Δ > 0; none: Δ < 0.`,
    },
    `Tìm m để đường thẳng ${line} ${askVi.replace('parabol', `parabol ${par}`)}.`,
    `Phương trình hoành độ giao điểm: ${a === 1 ? 'x²' : '−x²'} = ${poly([k, 0])} + m, tức ${poly([a, -k, 0])} − m = 0, Δ = ${k * k} ${a === 1 ? '+' : '−'} 4m. Tiếp xúc: Δ = 0; hai điểm: Δ > 0; không cắt: Δ < 0.`,
  );
};

// ── Square roots and radical expressions ──────────────────────────────
const radicals: Generator = (d, r) => {
  if (d === 1) {
    const kind = pick(r, ['take-out', 'cube', 'product'] as const);
    if (kind === 'cube') {
      const n = nz(r, -6, 6);
      return vi({ prompt: `Calculate: ∛(${num(n ** 3)})`, ...numeric(n, [-n, n * 3, n * n], r, num), explanation: '∛(a³) = a, and the cube root of a negative number is negative.' }, `Tính ∛(${num(n ** 3)})`, '∛(a³) = a; căn bậc ba của số âm là số âm.');
    }
    if (kind === 'product') {
      const s = pick(r, SQ.slice(0, 5)), u = int(r, 1, 3), w = u + int(r, 1, 2);
      const [p, q] = [s * u * u, s * w * w];
      return vi(
        { prompt: `Calculate: √${p} · √${q}`, ...numeric(s * u * w, [s * (u + w), s * u * w * s, u * w], r, num), explanation: `√a · √b = √(ab) = √${p * q}.` },
        `Tính √${p} · √${q}`,
        `√a · √b = √(ab) = √${p * q}.`,
      );
    }
    const s = pick(r, SQ), k = int(r, 2, 7);
    return vi(
      {
        prompt: `Simplify: √${k * k * s}`,
        answer: rad(k, s),
        distractors: [rad(k * k, s), rad(k, s * k), rad(k + 1, s), rad(k - 1, s)],
        explanation: `${k * k * s} = ${k * k} · ${s}, and √${k * k} = ${k}.`,
      },
      `Rút gọn: √${k * k * s}`,
      `${k * k * s} = ${k * k} · ${s}, mà √${k * k} = ${k}.`,
    );
  }
  if (d === 2) {
    const a = nz(r, -3, 4), x0 = int(r, -5, 6);
    const inner = poly([a, -a * x0]);
    const strict = r() < 0.35;
    const e = strict ? `1/√(${inner})` : `√(${inner})`;
    const sgn = a > 0 ? (strict ? '>' : '≥') : strict ? '<' : '≤';
    return vi(
      {
        prompt: `For which x is ${e} defined?`,
        answer: `x ${sgn} ${num(x0)}`,
        distractors: [`x ${FLIP[sgn]} ${num(x0)}`, `x ${sgn} ${num(-x0 || 1)}`, `x ${strict ? (a > 0 ? '≥' : '≤') : a > 0 ? '>' : '<'} ${num(x0)}`],
        explanation: strict ? 'Under the root must be positive (not zero), because the root is in a denominator.' : '√A is defined when A ≥ 0.',
      },
      `Biểu thức ${e} xác định khi nào?`,
      strict ? 'Biểu thức dưới căn phải dương (khác 0) vì căn nằm ở mẫu.' : '√A xác định khi A ≥ 0.',
    );
  }
  if (d === 3) {
    const s = pick(r, [2, 3, 5, 6, 7]);
    const ks = [1, 2, 3, 4, 5].sort(() => r() - 0.5).slice(0, 3);
    const cs = ks.map(() => nz(r, -3, 3));
    const e = terms(ks.map((k, i) => [cs[i], `√${k * k * s}`] as [number, string]));
    const tot = ks.reduce((t, k, i) => t + cs[i] * k, 0);
    return vi(
      {
        prompt: `Simplify: ${e}`,
        answer: rad(tot, s),
        distractors: [rad(cs.reduce((t, c) => t + c, 0) || 7, s), rad(-tot || 2, s), rad(tot + 1, s), rad(tot, s * 2)],
        explanation: `Take the squares out first: ${ks.map((k) => `√${k * k * s} = ${rad(k, s)}`).join(', ')}.`,
      },
      `Rút gọn: ${e}`,
      `Đưa thừa số ra ngoài dấu căn trước: ${ks.map((k) => `√${k * k * s} = ${rad(k, s)}`).join(', ')}.`,
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
      return vi(
        {
          prompt: `Simplify: ${e}`,
          answer: ans,
          distractors: [`√${a} ${plus ? '+' : '−'} √${b}`, n === 1 ? `√${a + b}` : `(√${a} ${plus ? '−' : '+'} √${b})/${n}`, `√${b} ${plus ? '+' : '−'} √${a}`],
          explanation: `Multiply top and bottom by √${a} ${plus ? '−' : '+'} √${b}: (√${a} + √${b})(√${a} − √${b}) = ${a} − ${b} = ${n}.`,
        },
        `Trục căn thức ở mẫu: ${e}`,
        `Nhân cả tử và mẫu với √${a} ${plus ? '−' : '+'} √${b}: (√${a} + √${b})(√${a} − √${b}) = ${a} − ${b} = ${n}.`,
      );
    }
    if (kind === 'abs') {
      const s = pick(r, [2, 3, 5, 6, 7, 10, 11]), c = int(r, 1, 4);
      const big = c > Math.sqrt(s);
      const e = `√((${c} − √${s})²)`;
      return vi(
        {
          prompt: `Simplify: ${e}`,
          answer: big ? `${c} − √${s}` : `√${s} − ${c}`,
          distractors: [big ? `√${s} − ${c}` : `${c} − √${s}`, `${c} + √${s}`, `−${c} − √${s}`],
          explanation: `√(A²) = |A|. Here ${c} ${big ? '>' : '<'} √${s} (since ${c * c} ${big ? '>' : '<'} ${s}), so |${c} − √${s}| = ${big ? `${c} − √${s}` : `√${s} − ${c}`}.`,
        },
        `Rút gọn: ${e}`,
        `√(A²) = |A|. Vì ${c} ${big ? '>' : '<'} √${s} (do ${c * c} ${big ? '>' : '<'} ${s}) nên |${c} − √${s}| = ${big ? `${c} − √${s}` : `√${s} − ${c}`}.`,
      );
    }
    const [u, w] = pick(r, [[3, 2], [5, 2], [5, 3], [6, 1], [7, 2], [7, 3], [6, 5], [10, 3], [5, 1], [3, 1]]);
    const plus = r() < 0.5;
    const e = `√(${u + w} ${plus ? '+' : '−'} 2√${u * w})`;
    const s = (n: number) => (n === 1 ? '1' : `√${n}`);
    return vi(
      {
        prompt: `Simplify: ${e}`,
        answer: `${s(u)} ${plus ? '+' : '−'} ${s(w)}`,
        distractors: [plus ? `${s(u)} − ${s(w)}` : `${s(w)} − ${s(u)}`, `√${u + w} ${plus ? '+' : '−'} √${u * w}`, `${s(u)} ${plus ? '+' : '−'} ${s(w * 2)}`],
        explanation: `${u + w} ${plus ? '+' : '−'} 2√${u * w} = (${s(u)} ${plus ? '+' : '−'} ${s(w)})², and ${s(u)} > ${s(w)}.`,
      },
      `Rút gọn: ${e}`,
      `${u + w} ${plus ? '+' : '−'} 2√${u * w} = (${s(u)} ${plus ? '+' : '−'} ${s(w)})², và ${s(u)} > ${s(w)}.`,
    );
  }
  // d5: entrance-exam expressions in √x (x ≥ 0)
  const kind = pick(r, ['diff', 'square', 'value', 'solve'] as const);
  if (kind === 'diff' || kind === 'square') {
    const n = int(r, 1, 6);
    const top = kind === 'diff' ? poly([1, -n * n]) : `x − ${2 * n}√x + ${n * n}`;
    const ans = kind === 'diff' ? `√x + ${n}` : `√x − ${n}`;
    const e = `(${top})/(√x − ${n})`;
    return vi(
      {
        prompt: `Simplify, for x ≥ 0 and x ≠ ${n * n}: ${e}`,
        answer: ans,
        distractors: [kind === 'diff' ? `√x − ${n}` : `√x + ${n}`, `x + ${n}`, `√x + ${n * n}`, `x − ${n}`],
        explanation: kind === 'diff' ? `x − ${n * n} = (√x − ${n})(√x + ${n}).` : `x − ${2 * n}√x + ${n * n} = (√x − ${n})².`,
      },
      `Rút gọn biểu thức (với x ≥ 0, x ≠ ${n * n}): ${e}`,
      kind === 'diff' ? `x − ${n * n} = (√x − ${n})(√x + ${n}).` : `x − ${2 * n}√x + ${n * n} = (√x − ${n})².`,
    );
  }
  if (kind === 'value') {
    const p = int(r, 1, 9), q = int(r, 1, 5);
    let k = int(r, 1, 7);
    if (k === q) k++;
    const A = `A = (√x + ${p})/(√x − ${q})`;
    return vi(
      {
        prompt: `${A}. Find A when x = ${k * k}.`,
        answer: fracN(k + p, k - q),
        distractors: [fracN(k * k + p, k * k - q), fracN(k + p, k + q), fracN(k - p, k - q), fracN(-(k + p), k - q), fracN(k * k + p, k - q)],
        explanation: `√${k * k} = ${k}, so A = (${k} + ${p})/(${k} − ${q}).`,
      },
      `Cho ${A}. Tính giá trị của A khi x = ${k * k}.`,
      `√${k * k} = ${k}, nên A = (${k} + ${p})/(${k} − ${q}).`,
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
  return vi(
    {
      prompt: `${A}. Find x so that A = ${v}.`,
      answer: `x = ${t * t}`,
      distractors: [`x = ${t}`, `x = ${(t + 1) ** 2}`, `x = ${t * t * v}`],
      explanation: `√x + ${p} = ${v}(√x − ${q}) ⇒ ${v - 1}√x = ${p + v * q} ⇒ √x = ${t}.`,
    },
    `Cho ${A}. Tìm x để A = ${v}.`,
    `√x + ${p} = ${v}(√x − ${q}) ⇒ ${v - 1}√x = ${p + v * q} ⇒ √x = ${t}.`,
  );
};

// ── Equations reducible to linear ────────────────────────────────────
const rationalEq: Generator = (d, r) => {
  const NONE = 'No solution';
  if (d <= 2) {
    if (d === 1) {
      const p = nz(r, -9, 9);
      let q = nz(r, -9, 9);
      if (Math.abs(q) === Math.abs(p)) q = p > 0 ? p - 11 : p + 11;
      const e = `${factor(p)}${factor(q)} = 0`;
      return vi(
        { prompt: `Solve: ${e}`, answer: roots([[p, 1], [q, 1]]), distractors: [roots([[-p, 1], [-q, 1]]), roots([[p, 1], [-q, 1]]), `x = ${num(p)}`], explanation: 'A·B = 0 means A = 0 or B = 0.' },
        `Giải phương trình: ${e}`,
        'A·B = 0 khi A = 0 hoặc B = 0.',
      );
    }
    const a = int(r, 2, 5), b = nz(r, -9, 9), c = int(r, 1, 4), e2 = nz(r, -9, 9);
    const e = `(${poly([a, b])})(${poly([c, e2])}) = 0`;
    return vi(
      {
        prompt: `Solve: ${e}`,
        answer: roots([[-b, a], [-e2, c]]),
        distractors: [roots([[b, a], [e2, c]]), roots([[-a, b], [-c, e2]]), roots([[-b, 1], [-e2, 1]])],
        explanation: 'A·B = 0 means A = 0 or B = 0.',
      },
      `Giải phương trình: ${e}`,
      'A·B = 0 khi A = 0 hoặc B = 0.',
    );
  }
  if (d === 3) {
    const k = nz(r, -9, 9);
    const e = r() < 0.5 ? `${poly([1, -k, 0])} = 0` : `x² = ${poly([k, 0])}`;
    return vi(
      {
        prompt: `Solve: ${e}`,
        answer: roots([[0, 1], [k, 1]]),
        distractors: [`x = ${num(k)}`, roots([[0, 1], [-k, 1]]), `x = ${num(-k)}`],
        explanation: `Never divide by x (it might be 0). Factorise: x(x ${signed(-k)}) = 0.`,
      },
      `Giải phương trình: ${e}`,
      `Không chia hai vế cho x (x có thể bằng 0). Phân tích: x(x ${signed(-k)}) = 0.`,
    );
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
    const e = `${p === 0 ? 'x' : `(x ${signed(p)})`}/(x ${signed(-q)}) = ${num(k)}`;
    return vi(
      {
        prompt: `Solve: ${e}`,
        answer: `x = ${num(x0)}`,
        distractors: [`x = ${num(q)}`, `x = ${num(-x0)}`, `x = ${fracN(k * q + p, k + 1)}`, NONE],
        explanation: `Condition: x ≠ ${num(q)}. Then x ${signed(p)} = ${num(k)}(x ${signed(-q)}).`,
      },
      `Giải phương trình: ${e}`,
      `Điều kiện: x ≠ ${num(q)}. Khi đó x ${signed(p)} = ${num(k)}(x ${signed(-q)}).`,
    );
  }
  // d5: the trap — a solution that breaks the condition
  const q = nz(r, -6, 6);
  if (r() < 0.4) {
    const e = `x²/(x ${signed(-q)}) = ${q * q}/(x ${signed(-q)})`;
    return vi(
      {
        prompt: `Solve: ${e}`,
        answer: `x = ${num(-q)}`,
        distractors: [roots([[q, 1], [-q, 1]]), `x = ${num(q)}`, NONE],
        explanation: `Condition: x ≠ ${num(q)}. x² = ${q * q} gives x = ±${Math.abs(q)}, but x = ${num(q)} is not allowed.`,
      },
      `Giải phương trình: ${e}`,
      `Điều kiện: x ≠ ${num(q)}. x² = ${q * q} cho x = ±${Math.abs(q)}, nhưng x = ${num(q)} không thoả mãn điều kiện.`,
    );
  }
  // (2x + a)/(x − q) = (x + b)/(x − q)  ⇒  x = b − a, rejected when it equals q
  const reject = r() < 0.4;
  const a = nz(r, -7, 7);
  const b = reject ? q + a : a + pick(r, [-5, -3, -2, 2, 3, 5].filter((t) => t !== q));
  const x0 = b - a;
  const e = `(${poly([2, a])})/(x ${signed(-q)}) = (${poly([1, b])})/(x ${signed(-q)})`;
  return vi(
    {
      prompt: `Solve: ${e}`,
      answer: reject ? NONE : `x = ${num(x0)}`,
      distractors: reject ? [`x = ${num(x0)}`, `x = ${num(-x0)}`, `x = ${num(a + b)}`] : [NONE, `x = ${num(a + b)}`, `x = ${num(-x0)}`],
      explanation: `Condition: x ≠ ${num(q)}. Then 2x ${signed(a)} = x ${signed(b)}, so x = ${num(x0)}${reject ? ' — but that breaks the condition, so there is no solution' : ''}.`,
    },
    `Giải phương trình: ${e}`,
    `Điều kiện: x ≠ ${num(q)}. Khi đó 2x ${signed(a)} = x ${signed(b)}, nên x = ${num(x0)}${reject ? ' — không thoả mãn điều kiện, vậy phương trình vô nghiệm' : ''}.`,
  );
};

// ── Word problems solved by an equation or a system ─────────────────────
const equationProblems: Generator = (d, r) => {
  if (d === 1) {
    const p1 = pick(r, [5, 6, 8, 10, 12]), p2 = pick(r, [3, 4, 7, 9].filter((p) => p !== p1));
    const x = int(r, 3, 15), y = int(r, 3, 15);
    const total = (p1 * x + p2 * y) * 1000;
    return vi(
      {
        prompt: `A class buys ${x + y} items in total: notebooks at ${vnd(p1 * 1000)} VND each and pens at ${vnd(p2 * 1000)} VND each, paying ${vnd(total)} VND. How many notebooks did they buy?`,
        ...numeric(x, [y, Math.round((x + y) / 2), x + 1], r),
        explanation: `Let x notebooks and y pens: x + y = ${x + y} and ${p1 * 1000}x + ${p2 * 1000}y = ${total}.`,
      },
      `Một lớp mua tổng cộng ${x + y} món đồ gồm vở giá ${vndVi(p1 * 1000)} đồng/quyển và bút giá ${vndVi(p2 * 1000)} đồng/cây, hết ${vndVi(total)} đồng. Lớp đã mua bao nhiêu quyển vở?`,
      `Gọi x là số vở, y là số bút: x + y = ${x + y} và ${p1 * 1000}x + ${p2 * 1000}y = ${total}.`,
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
    return vi(
      {
        prompt: `A two-digit number has digit sum ${t + u}. Swapping its digits gives a number ${Math.abs(diff)} ${word} than the original. Find the number.`,
        ...numeric(n, [10 * u + t, 10 * (t + 1) + (u - 1), 10 * (t - 1) + (u + 1)].filter((m) => m >= 10 && m <= 99), r),
        explanation: `Let the digits be a (tens) and b (ones): a + b = ${t + u} and (10b + a) − (10a + b) = ${diff}, so b − a = ${u - t}.`,
      },
      `Một số có hai chữ số có tổng các chữ số bằng ${t + u}. Nếu đổi chỗ hai chữ số thì được số mới ${diff > 0 ? 'lớn' : 'nhỏ'} hơn số ban đầu ${Math.abs(diff)} đơn vị. Tìm số đó.`,
      `Gọi chữ số hàng chục là a, hàng đơn vị là b: a + b = ${t + u} và (10b + a) − (10a + b) = ${diff}, nên b − a = ${u - t}.`,
    );
  }
  if (d === 3) {
    const pa = pick(r, [10, 15, 20]), pb = pick(r, [10, 15, 20, 25].filter((p) => p !== pa));
    const x = int(r, 6, 30) * 20, y = int(r, 6, 30) * 20;
    const made = x + (x * pa) / 100 + y + (y * pb) / 100;
    return vi(
      {
        prompt: `Two factories had to make ${x + y} products in total. Factory A went ${pa}% over its target and factory B went ${pb}% over, so together they made ${made}. What was factory A's target?`,
        ...numeric(x, [y, (x + y) / 2, x + 20], r),
        explanation: `Let the targets be x and y: x + y = ${x + y} and ${1 + pa / 100}x + ${1 + pb / 100}y = ${made}.`,
      },
      `Hai nhà máy theo kế hoạch phải làm tổng cộng ${x + y} sản phẩm. Nhà máy A vượt mức ${pa}%, nhà máy B vượt mức ${pb}%, nên cả hai làm được ${made} sản phẩm. Theo kế hoạch nhà máy A phải làm bao nhiêu sản phẩm?`,
      `Gọi số sản phẩm theo kế hoạch là x và y: x + y = ${x + y} và ${String(1 + pa / 100).replace('.', ',')}x + ${String(1 + pb / 100).replace('.', ',')}y = ${made}.`,
    );
  }
  if (d === 4) {
    // 1/a + 1/b = 1/T
    const [a, b, T] = pick(r, [[3, 6, 2], [4, 12, 3], [6, 12, 4], [10, 15, 6], [12, 24, 8], [20, 30, 12], [6, 30, 5], [5, 20, 4], [8, 24, 6], [9, 18, 6], [14, 35, 10], [15, 30, 10], [10, 40, 8], [12, 36, 9]]);
    return vi(
      {
        prompt: `Two teams working together finish a job in ${T} days. Working alone, team A needs ${b - a} days fewer than team B. How many days does team A need alone?`,
        ...numeric(a, [b, 2 * T, T + (b - a) / 2], r),
        explanation: `Let team A need x days (x > ${T}): 1/x + 1/(x + ${b - a}) = 1/${T}. Solve the quadratic and keep the root that fits.`,
      },
      `Hai đội cùng làm một công việc thì xong trong ${T} ngày. Nếu làm riêng, đội A cần ít hơn đội B ${b - a} ngày. Hỏi làm riêng thì đội A cần bao nhiêu ngày?`,
      `Gọi số ngày đội A làm riêng là x (x > ${T}): 1/x + 1/(x + ${b - a}) = 1/${T}. Giải phương trình bậc hai và chọn nghiệm thoả mãn điều kiện.`,
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
      return vi(
        {
          prompt: `A cyclist rides ${D} km from A to B. On the way back he rides ${v} km/h faster, so the return trip takes ${t} minutes less. Find his speed from A to B (km/h).`,
          ...numeric(x, [x + v, x - v, Math.round(D / (t / 60))], r),
          explanation: `Let the speed be x km/h: ${D}/x − ${D}/(x + ${v}) = ${frac(t, 60)} (hours). Clear the denominators and solve the quadratic; reject the negative root.`,
        },
        `Một người đi xe đạp từ A đến B dài ${D} km. Lúc về người đó đi nhanh hơn ${v} km/h nên thời gian về ít hơn thời gian đi ${t} phút. Tính vận tốc lúc đi từ A đến B (km/h).`,
        `Gọi vận tốc lúc đi là x (km/h, x > 0): ${D}/x − ${D}/(x + ${v}) = ${frac(t, 60)} (giờ). Quy đồng, giải phương trình bậc hai và loại nghiệm âm.`,
      );
    }
  }
  if (kind === 'diagonal') {
    const [a, b, c] = pick(r, [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]]);
    const k = pick(r, a * 3 < 30 ? [1, 2, 3] : [1]);
    const [w, l, dg] = [a * k, b * k, c * k];
    return vi(
      {
        prompt: `A rectangle's length is ${l - w} cm more than its width, and its diagonal is ${dg} cm. Find the width (cm).`,
        ...numeric(w, [l, dg - l, Math.round(dg / 2)], r),
        explanation: `Let the width be x: x² + (x + ${l - w})² = ${dg}², then reject the negative root.`,
      },
      `Một hình chữ nhật có chiều dài hơn chiều rộng ${l - w} cm và đường chéo dài ${dg} cm. Tính chiều rộng (cm).`,
      `Gọi chiều rộng là x (cm, x > 0): x² + (x + ${l - w})² = ${dg}², rồi loại nghiệm âm.`,
    );
  }
  let w = 0, l = 0;
  do {
    w = int(r, 3, 15);
    l = int(r, 4, 25);
  } while (l <= w);
  return vi(
    {
      prompt: `A rectangle has perimeter ${2 * (l + w)} cm and area ${l * w} cm². Find its length (cm).`,
      ...numeric(l, [w, (l + w) / 2, l + w], r),
      explanation: `Length + width = ${l + w} and length × width = ${l * w}: they are the roots of t² − ${l + w}t + ${l * w} = 0.`,
    },
    `Một hình chữ nhật có chu vi ${2 * (l + w)} cm và diện tích ${l * w} cm². Tính chiều dài (cm).`,
    `Chiều dài + chiều rộng = ${l + w}, chiều dài × chiều rộng = ${l * w}: chúng là nghiệm của t² − ${l + w}t + ${l * w} = 0.`,
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
