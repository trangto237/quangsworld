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

const numsIn = (s: string) => s.split(', ').map(Number);
const span = (lo: number, hi: number) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
const countIf = <T>(list: T[], f: (x: T) => boolean) => list.filter(f).length;
/** All ordered k-tuples of distinct items from 0..n−1 (or with repeats). */
function tuples(n: number, k: number, repeat = false): number[][] {
  if (k === 0) return [[]];
  return tuples(n, k - 1, repeat).flatMap((t) => span(0, n - 1).filter((x) => repeat || !t.includes(x)).map((x) => [...t, x]));
}
const subsets = (n: number, k: number) => tuples(n, k).filter((t) => t.every((x, i) => i === 0 || t[i - 1] < x));
/** A discrete frequency table: values and frequencies. */
const table = (p: string) => {
  const m = p.match(/: ([\d, ]+); frequency: ([\dx, ]+)\./)!;
  return [numsIn(m[1]), m[2].split(', ')] as const;
};
const groupsIn = (p: string) => {
  const m = p.match(/: ((?:\[\d+; \d+\)(?:, )?)+); frequency: ([\d, ]+)\./)!;
  return { g: [...m[1].matchAll(/\[(\d+); (\d+)\)/g)].map((x) => [+x[1], +x[2]]), f: numsIn(m[2]) };
};
const expand = (v: number[], f: number[]) => v.flatMap((x, i) => Array(f[i]).fill(x) as number[]).sort((a, b) => a - b);
/** Probability of an event over an explicit list of equally likely outcomes. */
const prob = <T>(space: T[], f: (x: T) => boolean) => countIf(space, f) / space.length;
const isPrime = (n: number) => n > 1 && span(2, n - 1).every((p) => n % p !== 0);

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
  'math.stats.average': [
    [/frequency: ([\dx, ]+)\. The mean score is ([\d.]+)\. Find x\.$/, (m) => {
      const [v, f] = table(m.input!);
      const meanFor = (x: number) => {
        const ff = f.map((y) => (y === 'x' ? x : +y));
        return v.reduce((s, a, i) => s + a * ff[i], 0) / ff.reduce((s, a) => s + a, 0);
      };
      return { value: span(0, 200).find((x) => close(meanFor(x), +m[2]))! };
    }],
    [/relative frequency \(%\): ([\d, ]+)\. Find the mean\.$/, (m) => {
      const v = numsIn(m.input!.match(/: ([\d, ]+); relative/)![1]), p = numsIn(m[1]);
      return { value: v.reduce((s, a, i) => s + (a * p[i]) / 100, 0) };
    }],
    [/Estimate the mean using the midpoints/, (m) => {
      const { g, f } = groupsIn(m.input!);
      return { value: g.reduce((s, [a, b], i) => s + ((a + b) / 2) * f[i], 0) / f.reduce((s, x) => s + x, 0) };
    }],
    [/relative frequency of the group \[(\d+); (\d+)\)\?$/, (m) => {
      const { g, f } = groupsIn(m.input!);
      return { value: (f[g.findIndex(([a]) => a === +m[1])] / f.reduce((s, x) => s + x, 0)) * 100 };
    }],
    [/What percentage of them .*?at least (\d+)/, (m) => {
      const { g, f } = groupsIn(m.input!);
      return { value: (f.filter((_, i) => g[i][0] >= +m[1]).reduce((s, x) => s + x, 0) / f.reduce((s, x) => s + x, 0)) * 100 };
    }],
    [/relative frequency of the value (\d+)\?$/, (m) => {
      const [v, f] = table(m.input!);
      const all = expand(v, f.map(Number));
      return { value: (countIf(all, (x) => x === +m[1]) / all.length) * 100 };
    }],
    [/Find the mean\.$/, (m) => {
      const [v, f] = table(m.input!);
      const all = expand(v, f.map(Number));
      return { value: all.reduce((s, x) => s + x, 0) / all.length };
    }],
    [/Find the mode\.$/, (m) => {
      const [v, f] = table(m.input!);
      const all = expand(v, f.map(Number));
      const c = v.map((x) => countIf(all, (y) => y === x));
      expect(countIf(c, (x) => x === Math.max(...c)), 'one mode').toBe(1);
      return { value: v[c.indexOf(Math.max(...c))] };
    }],
    [/Find the median\.$/, (m) => {
      const [v, f] = table(m.input!);
      const all = expand(v, f.map(Number));
      const n = all.length;
      return { value: n % 2 ? all[(n - 1) / 2] : (all[n / 2 - 1] + all[n / 2]) / 2 };
    }],
  ],
  'math.stats.probability': [
    [/^A two-digit number is chosen at random\. What is the probability that it (.*)\?$/, (m) => {
      const e = m[1];
      const t = (x: number) =>
        /divisible by (\d+)/.test(e) ? x % +e.match(/divisible by (\d+)/)![1] === 0
        : /perfect square/.test(e) ? Number.isInteger(Math.sqrt(x))
        : /digit sum (\d+)/.test(e) ? Math.floor(x / 10) + (x % 10) === +e.match(/digit sum (\d+)/)![1]
        : /prime/.test(e) ? isPrime(x)
        : /tens digit greater/.test(e) ? Math.floor(x / 10) > x % 10
        : NaN;
      return { value: prob(span(10, 99), (x) => t(x) as boolean) };
    }],
    [/^(Two|Three) fair coins are tossed\. What is the probability of (.*)\?$/, (m) => {
      const n = m[1] === 'Two' ? 2 : 3, e = m[2];
      const space = tuples(2, n, true).map((t) => countIf(t, (x) => x === 1));
      const t = (h: number) =>
        /one head and one tail|exactly one head/.test(e) ? h === 1
        : /exactly two heads/.test(e) ? h === 2
        : /at least one head/.test(e) ? h >= 1
        : /at least two heads/.test(e) ? h >= 2
        : /same face/.test(e) ? h === 0 || h === n
        : NaN;
      return { value: prob(space, (h) => t(h) as boolean) };
    }],
    [/^Two fair dice are rolled\. What is the probability that (.*)\?$/, (m) => {
      const e = m[1];
      const space = tuples(6, 2, true).map(([a, b]) => [a + 1, b + 1]);
      const t = ([a, b]: number[]) =>
        /sum of the two numbers is at least (\d+)/.test(e) ? a + b >= +e.match(/(\d+)$/)![1]
        : /sum of the two numbers is (\d+)/.test(e) ? a + b === +e.match(/(\d+)$/)![1]
        : /product of the two numbers is even/.test(e) ? (a * b) % 2 === 0
        : /differ by (\d+)/.test(e) ? Math.abs(a - b) === +e.match(/(\d+)$/)![1]
        : /at least one die shows a 6/.test(e) ? a === 6 || b === 6
        : /same number/.test(e) ? a === b
        : NaN;
      return { value: prob(space, (x) => t(x) as boolean) };
    }],
    [/^A bag has (\d+) red and (\d+) blue balls\. (.*) What is the probability that (.*)\?$/, (m) => {
      const R = +m[1], N = R + +m[2], e = m[4];
      const space = /put back/.test(m[3]) ? tuples(N, 2, true) : subsets(N, 2);
      const reds = (t: number[]) => countIf(t, (i) => i < R);
      const t = (x: number[]) =>
        /both balls are red/.test(e) ? reds(x) === 2
        : /different colours/.test(e) ? reds(x) === 1
        : /at least one ball is red/.test(e) ? reds(x) >= 1
        : /same colour/.test(e) ? reds(x) !== 1
        : NaN;
      return { value: prob(space, (x) => t(x) as boolean) };
    }],
    [/^A group has (\d+) boys and (\d+) girls\. Two students are chosen at random .* that (.*)\?$/, (m) => {
      const b = +m[1], e = m[3];
      const girls = (x: number[]) => countIf(x, (i) => i >= b);
      const t = (x: number[]) =>
        /one boy and one girl/.test(e) ? girls(x) === 1
        : /both are girls/.test(e) ? girls(x) === 2
        : /at least one girl/.test(e) ? girls(x) >= 1
        : /An \(one of the boys\)/.test(e) ? x.includes(0)
        : NaN;
      return { value: prob(subsets(b + +m[2], 2), (x) => t(x) as boolean) };
    }],
    [/^A box has (\d+) cards numbered 1 to \d+\. Two cards are drawn at the same time\. What is the probability that (.*)\?$/, (m) => {
      const e = m[2];
      const t = ([a, b]: number[]) =>
        /sum of the two numbers is even/.test(e) ? (a + b) % 2 === 0
        : /product of the two numbers is even/.test(e) ? (a * b) % 2 === 0
        : /divisible by 3/.test(e) ? (a + b) % 3 === 0
        : NaN;
      return { value: prob(subsets(+m[1], 2).map((x) => x.map((i) => i + 1)), (x) => t(x) as boolean) };
    }],
  ],
  'math.combinatorics.counting': [
    [/offers (\d+) main dishes, (\d+) side dishes and (\d+) drinks/, (m) => ({ value: tuples(+m[1], 1).length * tuples(+m[2], 1).length * tuples(+m[3], 1).length })],
    [/There are (\d+) roads from A to B, (\d+) roads from B to C, and (\d+) roads? going straight/, (m) => ({ value: tuples(+m[1], 1).flatMap(() => tuples(+m[2], 1)).length + +m[3] })],
    [/A lock code has (\d+) digits, each chosen from 1 to (\d+)/, (m) => ({ value: tuples(+m[2], +m[1], true).length })],
    [/In how many ways can (\d+) students stand in a row for a photo/, (m) => ({ value: tuples(+m[1], +m[1]).length })],
    [/A class of (\d+) students chooses a class monitor and a deputy/, (m) => ({ value: tuples(+m[1], 2).length })],
    [/There are (\d+) roads from A to B and (\d+) roads from B to C\. Nam goes/, (m) => {
      const [a, b] = [+m[1], +m[2]];
      return { value: countIf(tuples(Math.max(a, b), 4, true), ([a1, b1, b2, a2]) => a1 < a && a2 < a && b1 < b && b2 < b && a1 !== a2 && b1 !== b2) };
    }],
    [/(\d+) students, including Mai and Lan, stand in a row/, (m) => ({ value: countIf(tuples(+m[1], +m[1]), (t) => Math.abs(t.indexOf(0) - t.indexOf(1)) === 1) })],
    [/league of (\d+) teams, every two teams play each other twice/, (m) => ({ value: tuples(+m[1], 2).length })],
    [/There are (\d+) points in a plane, no three on a line\. How many segments/, (m) => ({ value: subsets(+m[1], 2).length })],
    [/each of (\d+) people shakes hands once/, (m) => ({ value: subsets(+m[1], 2).length })],
    [/must have 2 boys and 1 girl, chosen from (\d+) boys and (\d+) girls/, (m) => {
      const b = +m[1];
      return { value: countIf(subsets(b + +m[2], 3), (t) => countIf(t, (i) => i < b) === 2) };
    }],
    [/From (\d+) members, a club chooses a president, a vice-president and a secretary/, (m) => ({ value: tuples(+m[1], 3).length })],
    [/There are (\d+) points in a plane, no three on a line\. How many triangles/, (m) => ({ value: subsets(+m[1], 3).length })],
    [/A group of 3 students is chosen from (\d+) students/, (m) => ({ value: subsets(+m[1], 3).length })],
    [/^How many (?:(even|odd) )?(\d)-digit numbers( divisible by 5)? can be formed from the digits ([\d, ]+), (with no digit repeated|if digits may be repeated)\?$/, (m) => {
      const L = +m[2], D = numsIn(m[4]), distinct = m[5].startsWith('with');
      const ok = (x: number) => {
        const ds = [...String(x)].map(Number);
        if (!ds.every((c) => D.includes(c))) return false;
        if (distinct && new Set(ds).size !== ds.length) return false;
        return m[1] === 'even' ? x % 2 === 0 : m[1] === 'odd' ? x % 2 === 1 : m[3] ? x % 5 === 0 : true;
      };
      return { value: countIf(span(10 ** (L - 1), 10 ** L - 1), ok) };
    }],
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
