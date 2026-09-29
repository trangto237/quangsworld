import { describe, expect, it } from 'vitest';
import { DuelSim, KnightSim, RunnerSim, duelConfigFor, knightConfigFor, modeFor, runnerConfigFor } from './modes';

const seq = (vals: number[]) => {
  let i = 0;
  return () => vals[i++ % vals.length];
};

describe('mode selection', () => {
  it('matches modes to content', () => {
    expect(modeFor(['en.vocab.synonyms', 'en.vocab.everyday'])).toBe('runner');
    expect(modeFor(['en.grammar.passive'])).toBe('defense');
    expect(modeFor(['math.algebra.linear', 'math.algebra.expressions'])).toBe('knight');
    expect(modeFor(['en.reading.inference'])).toBe('duel');
    expect(modeFor(['lit.devices'])).toBe('duel');
    expect(modeFor(['en.grammar.passive'], 'boss')).toBe('duel');
  });
});

describe('Boss Duel', () => {
  it('correct answers attack, streaks crit, wrong answers hurt', () => {
    const d = new DuelSim({ bossHp: 500 });
    const [a] = d.answer(true, 1, 3);
    expect(a).toMatchObject({ type: 'attack', crit: false });
    const [c] = d.answer(true, 3, 3);
    expect(c).toMatchObject({ type: 'attack', crit: true });
    const [u] = d.answer(true, 5, 3);
    expect(u).toMatchObject({ type: 'attack', ultimate: true });
    expect((u as { damage: number }).damage).toBeGreaterThan((c as { damage: number }).damage);
    d.answer(false, 0);
    expect(d.heroHp).toBe(80);
  });

  it('is won by attacking and lost after enough mistakes', () => {
    const win = new DuelSim(duelConfigFor(5));
    let n = 0;
    while (win.status === 'playing' && n < 200) win.answer(true, (n++ % 4) + 1, 3);
    expect(win.status).toBe('won');
    expect(n).toBeGreaterThan(8); // a real fight, not a one-shot
    const lose = new DuelSim({ bossHp: 200 });
    for (let i = 0; i < 5; i++) lose.answer(false, 0);
    expect(lose.status).toBe('lost');
  });

  it('trial duels cannot be lost and bring a new boss', () => {
    const d = new DuelSim({ bossHp: 20, noDefeat: true, endless: true });
    for (let i = 0; i < 10; i++) d.answer(false, 0);
    expect(d.heroHp).toBe(1);
    expect(d.status).toBe('playing');
    const ev = d.answer(true, 1, 5);
    expect(ev.some((e) => e.type === 'bossDown')).toBe(true);
    expect(d.wave).toBe(2);
    expect(d.finale().some((e) => e.type === 'end')).toBe(true);
  });
});

describe('Word Runner', () => {
  it('scores combos, crashes on wrong gates and finishes the run', () => {
    const r = new RunnerSim({ gates: 4 });
    expect(r.pass(true)).toBe('gem');
    expect(r.pass(true)).toBe('gem');
    expect(r.score).toBe(30);
    expect(r.pass(false)).toBe('crash');
    expect(r.hearts).toBe(2);
    expect(r.pass(true)).toBe('finish');
    expect(r.status).toBe('won');
  });

  it('gives more time for longer questions', () => {
    const r = new RunnerSim(runnerConfigFor(5));
    expect(r.gateTime(120, 60)).toBeGreaterThan(r.gateTime(20, 12));
    expect(r.gateTime(10, 4)).toBeGreaterThanOrEqual(5500);
  });

  it('falls after three crashes unless it is a trial', () => {
    const r = new RunnerSim({ gates: 10 });
    r.pass(false);
    r.pass(false);
    expect(r.pass(false)).toBe('fall');
    const t = new RunnerSim({ gates: 2, noDefeat: true, endless: true });
    for (let i = 0; i < 6; i++) t.pass(false);
    expect(t.status).toBe('playing');
  });
});

describe("Knight's Quest", () => {
  it('moves only in L-shapes and only with earned moves', () => {
    const k = new KnightSim({ pawns: 3 }, seq([0.1, 0.5, 0.9, 0.3, 0.7]));
    const legal = k.legalMoves();
    expect(legal.length).toBeGreaterThan(0);
    for (const s of legal) {
      const dr = Math.abs(s.r - k.knight.r), dc = Math.abs(s.c - k.knight.c);
      expect([dr, dc].sort().join()).toBe('1,2');
    }
    expect(k.moves).toBe(1);
    k.move(legal[0]);
    expect(k.moves).toBe(0);
    expect(k.move(k.legalMoves()[0])).toEqual([]); // no move left
    k.grantMove();
    expect(k.moves).toBe(1);
  });

  it('the king is shielded until the pawns are captured', () => {
    const k = new KnightSim({ pawns: 1 }, seq([0.5]));
    const king = k.pieces.find((p) => p.kind === 'king')!;
    k.knight = { r: king.r + 1 <= 5 ? king.r + 1 : king.r - 1, c: king.c + 2 <= 5 ? king.c + 2 : king.c - 2 };
    expect(k.legalMoves().some((s) => s.r === king.r && s.c === king.c)).toBe(false);
    k.pieces = k.pieces.filter((p) => p.kind === 'king');
    expect(k.legalMoves().some((s) => s.r === king.r && s.c === king.c)).toBe(true);
    k.moves = 1;
    const ev = k.move(king);
    expect(ev.some((e) => e.type === 'kingFalls')).toBe(true);
    expect(k.status).toBe('won');
  });

  it('wrong answers let a Glitch close in and strike', () => {
    const k = new KnightSim({ pawns: 1 }, seq([0.5]));
    const pawn = k.pieces.find((p) => p.kind === 'pawn')!;
    pawn.r = k.knight.r - 3;
    pawn.c = k.knight.c;
    const d0 = Math.abs(pawn.r - k.knight.r);
    k.enemyTurn();
    expect(Math.abs(pawn.r - k.knight.r)).toBe(d0 - 1);
    k.enemyTurn();
    const ev = k.enemyTurn();
    expect(ev.some((e) => e.type === 'attacked')).toBe(true);
    expect(k.hearts).toBe(2);
  });

  it('a full game can be won by answering and moving', () => {
    const k = new KnightSim(knightConfigFor(5), seq([0.13, 0.62, 0.37, 0.88, 0.5, 0.07, 0.71]));
    let answers = 0;
    while (k.status === 'playing' && answers < 400) {
      k.grantMove();
      answers++;
      // Greedy: capture if possible, else move toward the nearest target.
      const targets = k.pieces.filter((p) => p.kind === 'pawn' || k.kingOpen);
      const legal = k.legalMoves();
      const capture = legal.find((s) => targets.some((t) => t.r === s.r && t.c === s.c));
      // Knight-move distance by BFS on the empty board.
      const kd = (from: { r: number; c: number }, to: { r: number; c: number }) => {
        const seen = new Set([`${from.r},${from.c}`]);
        let frontier = [from];
        for (let steps = 0; steps < 12; steps++) {
          if (frontier.some((f) => f.r === to.r && f.c === to.c)) return steps;
          const next: { r: number; c: number }[] = [];
          for (const f of frontier)
            for (const [dr, dc] of [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]]) {
              const n = { r: f.r + dr, c: f.c + dc };
              if (n.r < 0 || n.c < 0 || n.r >= k.size || n.c >= k.size || seen.has(`${n.r},${n.c}`)) continue;
              seen.add(`${n.r},${n.c}`);
              next.push(n);
            }
          frontier = next;
        }
        return 99;
      };
      const d = (s: { r: number; c: number }) => Math.min(...targets.map((t) => kd(s, t)));
      k.move(capture ?? legal.sort((a, b) => d(a) - d(b))[0]);
    }
    expect(k.status).toBe('won');
    expect(answers).toBeGreaterThan(5);
    expect(answers).toBeLessThan(80);
  });
});
