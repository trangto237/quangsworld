import { describe, expect, it } from 'vitest';
import { generators } from '@atlas/content';
import { rng } from '@atlas/shared';

/** Turn a maths string from a question into JavaScript: "2√12 − √27", "x² − 5x + 6", "(x + 1)/(x − 2)". */
function js(e: string): string {
  return e
    .replace(/−/g, '-')
    .replace(/·/g, '*')
    .replace(/([xy])²/g, '($1**2)')
    .replace(/([xy])³/g, '($1**3)')
    .replace(/²/g, '**2')
    .replace(/³/g, '**3')
    .replace(/∛\(/g, 'Math.cbrt(')
    .replace(/√\(/g, 'Math.sqrt(')
    .replace(/√(\d+|x)/g, 'Math.sqrt($1)')
    .replace(/(\d|\))\s*(?=[xy(]|Math)/g, '$1*');
}
const ev = (e: string, vars: Record<string, number> = {}) => Function(...Object.keys(vars), `return (${js(e)});`)(...Object.values(vars)) as number;
const num = (s: string) => ev(s);
const close = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const xs = (answer: string) => answer.split('; ').map((p) => num(p.replace('x = ', '')));
const gen = (id: string, d: number, seed: number) => generators[id](d, rng(seed * 7 + d));

const NEW = ['math.algebra.radicals', 'math.algebra.reducible', 'math.algebra.vieta', 'math.algebra.parabola', 'math.reasoning.equation-problems'];
const UPGRADED = ['math.algebra.expressions', 'math.algebra.inequalities', 'math.algebra.systems', 'math.algebra.quadratics'];

describe('grade 9 algebra', () => {
  it('every question is complete and bilingual', () => {
    for (const id of [...NEW, ...UPGRADED])
      for (let d = 1; d <= 5; d++)
        for (let s = 1; s <= 150; s++) {
          const g = gen(id, d, s);
          const where = `${id} d${d} s${s}: ${g.prompt}`;
          expect(g.promptVi, where).toBeTruthy();
          expect(g.distractors.length, where).toBeGreaterThanOrEqual(2);
          expect(g.distractors, where).not.toContain(g.answer);
          expect(`${g.prompt} ${g.answer} ${g.distractors.join(' ')} ${g.explanation ?? ''}`, where).not.toMatch(/NaN|undefined|Infinity|\+ -|- -|−−/);
          if (g.explanation) expect(g.explanationVi, where).toBeTruthy();
        }
  });

  it('quadratic and reducible-equation answers solve the equation', () => {
    for (const id of ['math.algebra.quadratics', 'math.algebra.reducible'])
      for (const d of id.endsWith('quadratics') ? [1, 2, 3] : [1, 2, 3, 4, 5])
        for (let s = 1; s <= 200; s++) {
          const g = gen(id, d, s);
          const [lhs, rhs] = g.prompt.replace('Solve: ', '').split(' = ');
          let sols: number[];
          if (g.answer === 'No solution') continue;
          if (g.answer.includes('±')) {
            const [, h, rr] = g.answer.match(/x = (.*?) ?± (.+)$/)!;
            const c = h ? num(h) : 0;
            sols = [c - num(rr), c + num(rr)];
          } else sols = xs(g.answer);
          for (const x of sols) expect(close(ev(lhs, { x }), ev(rhs, { x })), `${g.prompt} → ${g.answer}`).toBe(true);
        }
  });

  it('a "no solution" answer is the one root the condition forbids', () => {
    let seen = 0;
    for (let s = 1; s <= 300; s++) {
      const g = gen('math.algebra.reducible', 5, s);
      if (g.answer !== 'No solution') continue;
      seen++;
      const [lhs, rhs] = g.prompt.replace('Solve: ', '').split(' = ');
      const forbidden = num(g.prompt.match(/\/\(x ([+−] \d+)\)/)![1].replace(/^([+−]) /, (_m, sg) => (sg === '+' ? '-' : '')));
      expect(Number.isFinite(ev(lhs, { x: forbidden }))).toBe(false);
      for (const x of [-7, -3, 0.5, 2, 11]) if (x !== forbidden) expect(close(ev(lhs, { x }), ev(rhs, { x }))).toBe(false);
    }
    expect(seen).toBeGreaterThan(10);
  });

  it('systems answers satisfy both equations', () => {
    for (let d = 1; d <= 5; d++)
      for (let s = 1; s <= 200; s++) {
        const g = gen('math.algebra.systems', d, s);
        const [, x, y] = g.answer.match(/x = (\S+), y = (\S+)/)!.map((v, i) => (i ? num(v) : 0));
        for (const eq of g.prompt.replace('Solve the system: ', '').split(' and ')) {
          const [lhs, rhs] = eq.split(' = ');
          expect(close(ev(lhs, { x, y }), num(rhs)), `${g.prompt} → ${g.answer}`).toBe(true);
        }
      }
  });

  it('radicals simplify to the same value', () => {
    for (const d of [1, 3, 4])
      for (let s = 1; s <= 200; s++) {
        const g = gen('math.algebra.radicals', d, s);
        const e = g.prompt.replace(/^(Simplify|Calculate): /, '');
        expect(close(ev(e), num(g.answer)), `${g.prompt} → ${g.answer}`).toBe(true);
      }
    for (let s = 1; s <= 200; s++) {
      const g = gen('math.algebra.radicals', 5, s);
      if (g.prompt.startsWith('Simplify')) {
        const e = g.prompt.split(': ')[1];
        for (const x of [0.3, 2, 50]) expect(close(ev(e, { x }), ev(g.answer, { x })), g.prompt).toBe(true);
      } else if (g.prompt.includes('when x =')) {
        const x = Number(g.prompt.match(/when x = (\d+)/)![1]);
        expect(close(ev(g.prompt.match(/A = (.+?)\. /)![1], { x }), num(g.answer)), g.prompt).toBe(true);
      } else {
        const x = num(g.answer.replace('x = ', ''));
        const v = Number(g.prompt.match(/A = (\d+)\.$/)![1]);
        expect(close(ev(g.prompt.match(/A = (.+?)\. /)![1], { x }), v), g.prompt).toBe(true);
      }
    }
  });

  it("Viète answers match the real roots", () => {
    for (const d of [1, 2, 3, 4])
      for (let s = 1; s <= 200; s++) {
        const g = gen('math.algebra.vieta', d, s);
        if (g.prompt.startsWith('Find two numbers')) {
          const [S, P] = g.prompt.match(/-?−?\d+/g)!.map(num);
          const [u, w] = g.answer.split(' and ').map(num);
          expect(close(u + w, S) && close(u * w, P), g.prompt).toBe(true);
          continue;
        }
        const [, e, ask] = g.prompt.match(/^(.+) = 0 has roots x₁, x₂\. Find (.+)\.$/)!;
        const f = (x: number) => ev(e, { x });
        const [a, b, c] = [f(1) + f(-1) - 2 * f(0)].map((t) => t / 2).concat([(f(1) - f(-1)) / 2, f(0)]);
        const D = Math.sqrt(b * b - 4 * a * c);
        const [x1, x2] = [(-b - D) / (2 * a), (-b + D) / (2 * a)];
        const want: Record<string, number> = { 'x₁ + x₂': x1 + x2, 'x₁·x₂': x1 * x2, 'x₁² + x₂²': x1 ** 2 + x2 ** 2, '1/x₁ + 1/x₂': 1 / x1 + 1 / x2, '(x₁ − x₂)²': (x1 - x2) ** 2, 'x₁³ + x₂³': x1 ** 3 + x2 ** 3 };
        expect(close(want[ask], num(g.answer)), `${g.prompt} → ${g.answer}`).toBe(true);
      }
  });

  it('parabola intersection points are on both graphs', () => {
    for (let s = 1; s <= 200; s++) {
      const g = gen('math.algebra.parabola', 4, s);
      const [, par, line] = g.prompt.match(/parabola y = (.+) meets the line y = (.+)\.$/)!;
      for (const [, x, y] of g.answer.matchAll(/\((\S+); (\S+)\)/g)) {
        expect(close(ev(par, { x: num(x) }), num(y)) && close(ev(line, { x: num(x) }), num(y)), g.prompt).toBe(true);
      }
    }
  });

  /** Real roots of the quadratic f (given as a function of x), from f(−1), f(0), f(1). */
  const quad = (f: (x: number) => number) => {
    const c = f(0), a = (f(1) + f(-1)) / 2 - c, b = (f(1) - f(-1)) / 2;
    return { a, b, c, D: b * b - 4 * a * c };
  };
  /** Values of m that the answer allows and forbids. */
  const tryM = (answer: string) => {
    const [, op, v] = answer.match(/^m ([=<>]) (\S+)$/)!;
    const m = num(v);
    return op === '=' ? { yes: [m], no: [m + 1, m - 1] } : op === '<' ? { yes: [m - 1, m - 3], no: [m + 1, m] } : { yes: [m + 1, m + 3], no: [m - 1, m] };
  };
  const count = (D: number) => (Math.abs(D) < 1e-9 ? 1 : D > 0 ? 2 : 0);

  it('parameter answers give the asked number of roots', () => {
    for (let s = 1; s <= 200; s++) {
      const g = gen('math.algebra.quadratics', 5, s);
      const [, e, ask] = g.prompt.match(/^Find m so that (.+) = 0 (.+)\.$/)!;
      const want = ask.includes('double') ? 1 : ask.includes('two') ? 2 : 0;
      const { yes, no } = tryM(g.answer);
      for (const m of yes) expect(count(quad((x) => ev(e, { x, m })).D), `${g.prompt} → ${g.answer}, m = ${m}`).toBe(want);
      for (const m of no) expect(count(quad((x) => ev(e, { x, m })).D), `${g.prompt} → ${g.answer}, m = ${m}`).not.toBe(want);
    }
    for (let s = 1; s <= 200; s++) {
      const g = gen('math.algebra.parabola', 5, s);
      const [, line, ask, par] = g.prompt.match(/line y = (.+?) (touches|cuts|does not meet) the parabola y = (.+?)[ .]/)!;
      const want = ask === 'touches' ? 1 : ask === 'cuts' ? 2 : 0;
      const { yes, no } = tryM(g.answer);
      for (const m of yes) expect(count(quad((x) => ev(par, { x }) - ev(line, { x, m })).D), `${g.prompt} → ${g.answer}`).toBe(want);
      for (const m of no) expect(count(quad((x) => ev(par, { x }) - ev(line, { x, m })).D), `${g.prompt} → ${g.answer}`).not.toBe(want);
    }
  });

  it('Viète parameter answers meet the condition', () => {
    for (let s = 1; s <= 200; s++) {
      const g = gen('math.algebra.vieta', 5, s);
      const [, e, cond, v] = g.prompt.match(/^(.+) = 0 has two solutions x₁, x₂ with (.+) = (\d+)\. Find m\.$/)!;
      const m = num(g.answer.replace('m = ', ''));
      const { a, b, D } = quad((x) => ev(e, { x, m }));
      expect(D, g.prompt).toBeGreaterThan(0);
      const [x1, x2] = [(-b - Math.sqrt(D)) / (2 * a), (-b + Math.sqrt(D)) / (2 * a)];
      expect(close(cond.startsWith('|') ? Math.abs(x1 - x2) : x1 ** 2 + x2 ** 2, Number(v)), `${g.prompt} → ${g.answer}`).toBe(true);
    }
  });

  it('inequality answers hold exactly where the inequality holds', () => {
    const holds = (l: number, op: string, rr: number) => ({ '<': l < rr - 1e-9, '>': l > rr + 1e-9, '≤': l <= rr + 1e-9, '≥': l >= rr - 1e-9 })[op]!;
    for (let d = 1; d <= 5; d++)
      for (let s = 1; s <= 200; s++) {
        const g = gen('math.algebra.inequalities', d, s);
        const [, lhs, op, rhs] = g.prompt.replace(/^(Solve|Find the (largest|smallest) integer x such that):? /, '').match(/^(.+) ([<>≤≥]) (.+)$/)!;
        const ok = (x: number) => holds(ev(lhs, { x }), op, ev(rhs, { x }));
        if (g.prompt.startsWith('Find')) {
          const n = num(g.answer);
          expect(ok(n) && !ok(g.prompt.includes('largest') ? n + 1 : n - 1), `${g.prompt} → ${g.answer}`).toBe(true);
        } else {
          const [, aop, av] = g.answer.match(/^x (\S) (\S+)$/)!;
          for (let x = -40; x <= 40; x += 0.5) expect(ok(x), `${g.prompt} → ${g.answer} at x = ${x}`).toBe(holds(x, aop, num(av)));
        }
      }
  });
});
