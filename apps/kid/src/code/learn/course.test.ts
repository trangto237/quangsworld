import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { COURSE } from './course';
import type { Step } from './types';

/** Runs Python 3 (as the app's Pyodide would) and returns what it printed, without the final newline. */
function run(code: string, stdin: string[] = []): string {
  return execFileSync('python3', ['-I', '-c', code], { input: stdin.map((s) => s + '\n').join(''), encoding: 'utf8', timeout: 10_000 }).replace(/\n$/, '');
}
const hasPython = (() => {
  try {
    run('print(1)');
    return true;
  } catch {
    return false;
  }
})();
const text = (o: string | { en: string }) => (typeof o === 'string' ? o : o.en);
const fill = (code: string, answers: string[]) => {
  let i = 0;
  return code.replace(/___/g, () => answers[i++]);
};

describe('Learn Python course', () => {
  const steps = COURSE.flatMap((u) => u.lessons.flatMap((l) => l.steps.map((s, k) => ({ s, where: `${l.id} step ${k + 1} (${s.kind})` }))));

  it('is well formed', () => {
    const ids = COURSE.flatMap((u) => u.lessons.map((l) => l.id));
    expect(new Set(ids).size).toBe(ids.length);
    expect(COURSE.length).toBeGreaterThanOrEqual(10);
    for (const u of COURSE) expect(u.lessons.length, u.id).toBeGreaterThanOrEqual(2);
    for (const { s, where } of steps) {
      const all = JSON.stringify(s);
      expect(all.includes('"vi":""'), `${where}: missing Vietnamese`).toBe(false);
      if (s.kind === 'choice') {
        expect(s.answer, where).toBeLessThan(s.options.length);
        expect(new Set(s.options.map(text)).size, `${where}: duplicate options`).toBe(s.options.length);
      }
      if (s.kind === 'fill') {
        expect((s.code.match(/___/g) ?? []).length, `${where}: blanks vs answers`).toBe(s.answers.length);
        for (const x of s.extra) expect(s.answers.includes(x), `${where}: decoy "${x}" is also an answer`).toBe(false);
      }
      if (s.kind === 'order') expect(s.lines.length, where).toBeGreaterThanOrEqual(2);
    }
  });

  it.skipIf(!hasPython)('every answer is what Python really prints', () => {
    const bad: string[] = [];
    const check = (where: string, code: string, want: string, stdin?: string[]) => {
      let got: string;
      try {
        got = run(code, stdin);
      } catch (e) {
        bad.push(`${where}: crashed\n${code}\n${String((e as { stderr?: string }).stderr ?? e)}`);
        return;
      }
      if (got !== want) bad.push(`${where}: prints ${JSON.stringify(got)}, expected ${JSON.stringify(want)}\n${code}`);
    };
    for (const { s, where } of steps as { s: Step; where: string }[]) {
      if (s.kind === 'read' && s.code && s.output !== undefined) check(where, s.code, s.output);
      if (s.kind === 'choice' && s.prints && s.code) check(where, s.code, text(s.options[s.answer]));
      if (s.kind === 'fill' && s.output !== undefined) check(where, fill(s.code, s.answers), s.output);
      if (s.kind === 'order' && s.output !== undefined) check(where, s.lines.join('\n'), s.output);
      if (s.kind === 'output') check(where, s.code, s.answer);
      if (s.kind === 'write') check(where, s.solution, s.expect, s.stdin);
    }
    expect(bad, bad.join('\n\n')).toEqual([]);
  }, 60_000); // runs Python once per snippet
});
