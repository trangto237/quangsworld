import { describe, expect, it } from 'vitest';
import { generators } from '@atlas/content';
import { rng } from '@atlas/shared';

const SUPS = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const supNum = (s: string) => Number((s.startsWith('⁻') ? '-' : '') + [...s.replace('⁻', '')].map((c) => SUPS.indexOf(c)).join(''));

/** A maths string from a question as JavaScript: "2√7 − 5", "(−2/3)² + 1.5 : (−3/4)", "3.4 × 10⁻⁵", "x⁻³", "1,250,000". */
function js(e: string): string {
  return e
    .replace(/(\d),(?=\d{3})/g, '$1')
    .replace(/%/g, '')
    .replace(/\|([^|]+)\|/g, 'Math.abs($1)')
    .replace(/∛\(/g, 'Math.cbrt(')
    .replace(/∛(\d+)/g, 'Math.cbrt($1)')
    .replace(/√\(/g, 'Math.sqrt(')
    .replace(/√(\d+)/g, 'Math.sqrt($1)')
    .replace(/(\d+(?:\.\d+)?|x)([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (_, b, p) => `(${b}**(${supNum(p)}))`)
    .replace(/\)([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (_, p) => `)**(${supNum(p)})`)
    .replace(/(\d+)ⁿ/g, '($1**n)')
    .replace(/(\d+(?:\.\d+)?)\/(\d+)(?![\d.])/g, '($1/$2)')
    .replace(/−/g, '-')
    .replace(/[×·]/g, '*')
    .replace(/:/g, '/')
    .replace(/(\d|\))\s*(?=Math|\(|x)/g, '$1*');
}
const ev = (e: string, vars: Record<string, number> = {}) => Function(...Object.keys(vars), `return (${js(e)});`)(...Object.values(vars)) as number;
const close = (a: number, b: number) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
const gen = (id: string, d: number, s: number) => generators[id](d, rng(s * 17 + d));
const money = (s: string) => Number(s.replace(/,/g, ''));

interface Out {
  /** The correct value, recomputed from the prompt. */
  value?: number;
  /** Or a custom check of the answer string. */
  ok?: (answer: string) => boolean;
  /** How to read an option as a number (default: ev). */
  read?: (s: string) => number;
  /** Options that equal the answer in value are allowed (e.g. "34 × 10⁻⁶" against "3.4 × 10⁻⁵"). */
  sameValueOk?: boolean;
}
type Check = [RegExp, (m: RegExpMatchArray) => Out];

/** Scientific notation: mantissa in [1, 10). */
function sciOk(answer: string, want: number) {
  const m = answer.match(/^([\d.]+) × 10([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)$/);
  if (!m) return false;
  const a = Number(m[1]);
  return a >= 1 && a < 10 && close(a * 10 ** supNum(m[2]), want);
}
const powLog = (s: string) => {
  const m = s.match(/^(\d+)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)$/)!;
  return supNum(m[2]) * Math.log(Number(m[1]));
};

/** Tiered price list from a prompt ("0–50 kWh: 1,800 VND; 51–100 kWh: …") as [upper limit, price]. */
const tiers = (s: string) => [...s.matchAll(/(\d+)–(\d+) kWh: ([\d,]+) VND/g)].map((m) => [+m[2], money(m[3])] as const);
function tieredCost(t: readonly (readonly [number, number])[], x: number) {
  let total = 0;
  for (let k = 1; k <= x; k++) total += t.find(([to]) => k <= to)![1];
  return total;
}
const grow = (x: number, rate: number, years: number) => {
  for (let y = 0; y < years; y++) x += (x * rate) / 100;
  return x;
};

const CHECKS: Record<string, Check[]> = {
  'math.number.integers': [
    [/^Arrange in increasing order: (.*)$/, (m) => ({
      ok: (a) => {
        const got = a.split(' < ');
        if ([...got].sort().join() !== m[1].split('; ').sort().join()) return false;
        return got.every((x, i) => i === 0 || ev(got[i - 1]) < ev(x));
      },
    })],
    [/^Calculate: (.*)$/, (m) => ({ value: ev(m[1]) })],
  ],
  'math.number.fractions': [
    [/^Calculate: 1\/\(1·2\) \+ .* \+ 1\/\((\d+)·\d+\)$/, (m) => {
      let s = 0;
      for (let k = 1; k <= +m[1]; k++) s += 1 / (k * (k + 1));
      return { value: s };
    }],
    [/^Calculate: 1\/\(1·3\) \+ .* \+ 1\/\((\d+)·\d+\)$/, (m) => {
      let s = 0;
      for (let k = 1; k <= +m[1]; k += 2) s += 1 / (k * (k + 2));
      return { value: s };
    }],
    [/^Calculate: \(1 − 1\/2²\).*\(1 − 1\/(\d+)²\)$/, (m) => {
      let p = 1;
      for (let k = 2; k <= +m[1]; k++) p *= 1 - 1 / (k * k);
      return { value: p };
    }],
    [/^Calculate: (.*)$/, (m) => ({ value: ev(m[1]) })],
  ],
  'math.number.percent': [
    [/costs ([\d,]+) VND\. The shop gives a (\d+)% discount/, (m) => ({ value: money(m[1]) - (money(m[1]) * +m[2]) / 100 })],
    [/(rose|fell) from ([\d,]+) VND to ([\d,]+) VND/, (m) => ({ value: (Math.abs(money(m[3]) - money(m[2])) / money(m[2])) * 100 })],
    [/After a (\d+)% discount, Lan paid ([\d,]+) VND/, (m) => ({ value: money(m[2]) / (1 - +m[1] / 100) })],
    [/buys .* for ([\d,]+) VND and sells it for ([\d,]+) VND/, (m) => ({ value: (Math.abs(money(m[2]) - money(m[1])) / money(m[1])) * 100 })],
    [/including (\d+)% VAT is ([\d,]+) VND/, (m) => ({ value: money(m[2]) / (1 + +m[1] / 100) })],
    [/costs ([\d,]+) VND\. It is reduced by (\d+)%, and then the new price is reduced by a further (\d+)%/, (m) => {
      const after = money(m[1]) * (1 - +m[2] / 100);
      return { value: after - (after * +m[3]) / 100 };
    }],
    [/deposits ([\d,]+) VND at a simple interest rate of (\d+)% per year .* after (\d+) years/, (m) => ({ value: money(m[1]) + +m[3] * ((money(m[1]) * +m[2]) / 100) })],
    [/increased by (\d+)% and then decreased by (\d+)%/, (m) => ({ value: 100 * (1 + +m[1] / 100) * (1 - +m[2] / 100) })],
    [/deposits ([\d,]+) VND in a bank at (\d+)% per year, compound interest .* How much (interest|will she have)/, (m) => {
      const end = grow(money(m[1]), +m[2], 2);
      return { value: m[3] === 'interest' ? end - money(m[1]) : end };
    }],
    [/has ([\d,]+) people\. The population grows by (\d+)% each year/, (m) => ({ value: grow(money(m[1]), +m[2], 2) })],
    [/fridge and a washing machine for ([\d,]+) VND in total before VAT\. With VAT of (\d+)% on the fridge and (\d+)% on the washing machine they pay ([\d,]+) VND/, (m) => {
      // x + y = S, (1 + a)x + (1 + b)y = T
      const [S, a, b, T] = [money(m[1]), +m[2] / 100, +m[3] / 100, money(m[4])];
      return { value: (T - (1 + b) * S) / (a - b) };
    }],
    [/deposited ([\d,]+) VND .* After 2 years he has ([\d,]+) VND\. What is the annual interest rate/, (m) => ({ value: (Math.sqrt(money(m[2]) / money(m[1])) - 1) * 100 })],
    [/After 2 years at (\d+)% per year compound interest, Mr Tuấn has ([\d,]+) VND/, (m) => ({ value: money(m[2]) / (1 + +m[1] / 100) ** 2 })],
  ],
  'math.number.real-life': [
    [/Notebooks cost ([\d,]+) VND each\..*for every 4 notebooks you take, you pay for 3\)\. How much does a class pay for (\d+) notebooks/, (m) => {
      let paid = 0;
      for (let k = 1; k <= +m[2]; k++) if (k % 4 !== 0) paid++;
      return { value: paid * money(m[1]) };
    }],
    [/([\d,]+) VND for the first km, ([\d,]+) VND per km from the 2nd to the 30th km, and ([\d,]+) VND per km after the 30th km\. How much does a (\d+) km trip/, (m) => {
      let cost = 0;
      for (let k = 1; k <= +m[4]; k++) cost += k === 1 ? money(m[1]) : k <= 30 ? money(m[2]) : money(m[3]);
      return { value: cost };
    }],
    [/^Electricity .*?(?:plus (\d+)% VAT)?\. A family uses (\d+) kWh/, (m) => ({ value: tieredCost(tiers(m[0]), +m[2]) * (1 + (m[1] ? +m[1] : 0) / 100) })],
    [/^Electricity .*plus (\d+)% VAT\. A family paid ([\d,]+) VND/, (m) => ({
      ok: (a) => close(tieredCost(tiers(m[0]), +a) * (1 + +m[1] / 100), money(m[2])),
      value: (() => {
        let x = 0;
        while (tieredCost(tiers(m[0]), x) * (1 + +m[1] / 100) < money(m[2])) x++;
        return x;
      })(),
    })],
  ],
  'math.number.powers': [
    [/^Write ([\d,.]+) in scientific notation/, (m) => ({ ok: (a) => sciOk(a, money(m[1])), sameValueOk: true })],
    [/^Calculate and write in scientific notation: (.*)$/, (m) => ({ ok: (a) => sciOk(a, ev(m[1])), sameValueOk: true })],
    [/^Simplify \(x ≠ 0\): (.*)$/, (m) => ({
      ok: (a) => [2, 3, 0.5].every((x) => close(ev(a, { x }), ev(m[1], { x }))),
      read: (s) => ev(s, { x: 2 }),
      value: ev(m[1], { x: 2 }),
    })],
    [/^Find the natural number n such that (.*) = (.*)\.$/, (m) => ({ ok: (a) => close(ev(m[1], { n: +a }), ev(m[2])) && Number.isInteger(+a) })],
    [/^Compare (\S+) and (\S+)\.$/, (m) => ({ ok: (a) => a === `${m[1]} ${powLog(m[1]) < powLog(m[2]) ? '<' : '>'} ${m[2]}` })],
    [/^Calculate: (.*)$/, (m) => ({ value: ev(m[1]) })],
  ],
};

const IDS = Object.keys(CHECKS);

describe('grade 9 numbers, statistics and counting', () => {
  it('every question is complete and bilingual', () => {
    for (const id of IDS)
      for (let d = 1; d <= 5; d++)
        for (let s = 1; s <= 150; s++) {
          const g = gen(id, d, s);
          const where = `${id} d${d} s${s}: ${g.prompt}`;
          expect(g.promptVi, where).toBeTruthy();
          expect(g.explanation, where).toBeTruthy();
          expect(g.explanationVi, where).toBeTruthy();
          expect(new Set(g.distractors).size, where).toBeGreaterThanOrEqual(2);
          expect(g.distractors, where).not.toContain(g.answer);
          const all = `${g.prompt} ${g.promptVi} ${g.answer} ${g.distractors.join(' ')} ${g.explanation} ${g.explanationVi}`;
          expect(all, where).not.toMatch(/NaN|undefined|Infinity|null|\+ -|- -|−−|\+ −|\[object|\.\d{10,}/);
        }
  });

  it('every answer is correct, and no distractor has the same value', () => {
    for (const id of IDS)
      for (let d = 1; d <= 5; d++)
        for (let s = 1; s <= 150; s++) {
          const g = gen(id, d, s);
          const where = `${id} d${d} s${s}: ${g.prompt} → ${g.answer}`;
          const hit = CHECKS[id].map(([re, f]) => [g.prompt.match(re), f] as const).find(([m]) => m);
          expect(hit, `no check for ${where}`).toBeTruthy();
          const out = hit![1](hit![0]!);
          const read = out.read ?? ev;
          if (out.ok) expect(out.ok(g.answer), where).toBe(true);
          if (out.value !== undefined) expect(close(read(g.answer), out.value), `${where} (want ${out.value})`).toBe(true);
          if (!out.sameValueOk && (out.value !== undefined || !out.ok || out.read)) {
            const got = read(g.answer);
            for (const x of g.distractors) expect(close(read(x), got), `${where} | ${x}`).toBe(false);
          }
        }
  });
});
