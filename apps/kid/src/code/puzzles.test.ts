import { describe, expect, it } from 'vitest';
import { PUZZLES, countBlocks, explainCode, runProgram, toCode, type Block } from './puzzles';

const m: Block = { t: 'move' };
const L: Block = { t: 'left' };
const R: Block = { t: 'right' };
const rep = (n: number, ...body: Block[]): Block => ({ t: 'repeat', n, body });

/** A solution for each puzzle, within its block limit and using only its blocks. */
const SOLUTIONS: Record<string, Block[]> = {
  b1: [m, m, m, m],
  b2: [m, m, m, R, m, m, m],
  b3: [rep(8, m)],
  b4: [rep(3, m, L, m, R)],
  b5: [rep(3, rep(4, m), R)],
  b6: [{ t: 'until', body: [{ t: 'ifWall', body: [R] }, m] }],
};

const kinds = (bs: Block[]): string[] => bs.flatMap((b) => [b.t, ...('body' in b ? kinds(b.body) : [])]);

describe('blocks puzzles', () => {
  for (const p of PUZZLES)
    it(`${p.id} can be solved`, () => {
      const sol = SOLUTIONS[p.id];
      expect(sol).toBeTruthy();
      expect(countBlocks(sol)).toBeLessThanOrEqual(p.max);
      for (const k of kinds(sol)) expect(p.blocks).toContain(k);
      expect(runProgram(p, sol).end).toBe('win');
    });

  it('reports crashes, short programs and endless loops', () => {
    const p = PUZZLES[1];
    expect(runProgram(p, [m, R, m]).end).toBe('crash');
    expect(runProgram(PUZZLES[0], [m]).end).toBe('short');
    expect(runProgram(PUZZLES[5], [{ t: 'until', body: [R] }]).end).toBe('loop');
  });

  it('writes the program as JavaScript and Python', () => {
    const prog = [rep(3, m, R)];
    expect(toCode(prog, 'js')).toBe('for (let i = 0; i < 3; i++) {\n  moveForward();\n  turnRight();\n}');
    expect(toCode(prog, 'py')).toBe('for i in range(3):\n    move_forward()\n    turn_right()');
  });
});


describe('why the real code looks like this', () => {
  it('explains each kind of thing in the program once, in order, for each language', () => {
    const prog = [{ t: 'move' as const }, { t: 'repeat' as const, n: 3, body: [{ t: 'move' as const }, { t: 'left' as const }] }];
    const js = explainCode(prog, 'js');
    expect(js.map((n) => n.code)).toEqual(['moveForward();', 'moveForward', 'for (let i = 0; i < 3; i++) {', '{ … }']);
    expect(js[2].en).toContain('3 times');
    const py = explainCode(prog, 'py');
    expect(py[2].code).toBe('for i in range(3):');
    expect(py[3].en).toContain('indented');
    expect(explainCode([{ t: 'until', body: [] }], 'py').map((n) => n.code)).toContain('pass');
    expect(explainCode([], 'js')).toEqual([]);
    const nested = [{ t: 'repeat' as const, n: 3, body: [{ t: 'repeat' as const, n: 2, body: [{ t: 'move' as const }] }] }];
    expect(toCode(nested, 'js')).toContain('for (let j = 0; j < 2; j++) {');
    expect(toCode(nested, 'py')).toContain('for j in range(2):');
    expect(explainCode(nested, 'js').map((n) => n.code)).toContain('j');
  });
});
