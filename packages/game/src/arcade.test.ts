import { describe, expect, it } from 'vitest';
import { ComebackTracker, DetectiveSim, MeteorSim, PenaltySim, RaceSim, SprintSim, detectiveConfigFor, penaltyConfigFor, raceConfigFor } from './arcade';
import { DuelSim, modeFor, modesFor } from './modes';
import { BattleSim, GRID } from './sim';

const seeded = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

describe('comeback cards', () => {
  it('are offered after 3 right in a row while losing, at most twice', () => {
    const t = new ComebackTracker(['heal', 'double']);
    expect(t.check(true, 1, true)).toBeNull();
    expect(t.check(true, 2, true)).toBeNull();
    expect(t.check(true, 3, true)?.id).toBe('heal');
    // Holding a card: no second offer.
    expect(t.check(true, 6, true)).toBeNull();
    expect(t.take()?.id).toBe('heal');
    for (let s = 1; s <= 3; s++) t.check(true, 6 + s, true);
    expect(t.take()?.id).toBe('double');
    for (let s = 1; s <= 6; s++) expect(t.check(true, 10 + s, true)).toBeNull();
  });

  it('are not offered while winning', () => {
    const t = new ComebackTracker(['heal']);
    for (let s = 1; s <= 6; s++) expect(t.check(true, s, false)).toBeNull();
  });

  it('Boss Duel: heal, double damage and shield', () => {
    const sim = new DuelSim({ bossHp: 400 });
    for (let i = 0; i < 3; i++) sim.answer(false, 0); // hero 40/100, boss full → losing
    const offers = [1, 2, 3].flatMap((s) => sim.answer(true, s, 3)).filter((e) => e.type === 'card');
    expect(offers).toHaveLength(1);
    const hp = sim.heroHp;
    expect(sim.useCard()).toEqual([{ type: 'healed', amount: 40 }]);
    expect(sim.heroHp).toBe(hp + 40);
    // Second card (double) after 3 more right answers while still behind.
    sim.answer(false, 0);
    sim.answer(false, 0);
    [1, 2, 3].forEach((s) => sim.answer(true, s, 3));
    expect(sim.comeback.card?.id).toBe('double');
    sim.useCard();
    const before = sim.bossHp;
    sim.answer(true, 1, 3);
    expect(before - sim.bossHp).toBe(32); // (10 + 3·2) × 2
  });

  it('Castle Defense: freeze stops the Glitches; the rare Queen joins the field', () => {
    const sim = new BattleSim({ towers: ['pawn'], enemies: 6, hasBoss: false, firstSpawn: 0, spawnInterval: 1000 }, seeded(5));
    sim.update(100);
    sim.hearts = 2; // castle damaged → in trouble
    [1, 2, 3].forEach((s) => sim.answer(true, s));
    expect(sim.hud().card?.id).toBe('freeze');
    sim.useCard();
    const xs = sim.enemies.map((e) => e.x);
    sim.update(100);
    expect(sim.enemies.map((e) => e.x)).toEqual(xs);
    expect(sim.hud().frozen).toBe(true);
    [4, 5, 6].forEach((s) => sim.answer(true, s));
    expect(sim.comeback.card?.id).toBe('queen');
    sim.useCard();
    const queen = sim.towers.find((t) => t.kind === 'queen');
    expect(queen).toBeDefined();
    expect(queen!.col).toBeLessThan(GRID.cols);
  });
});

describe('Sentence Sprint', () => {
  it('builds floors and launches at the goal; mistakes cost hearts', () => {
    const sim = new SprintSim({ goal: 3 });
    expect(sim.answer(true, 1)).toBe('floor');
    expect(sim.score).toBe(200);
    expect(sim.answer(false)).toBe('crack');
    expect(sim.hearts).toBe(2);
    sim.answer(true, 0.5);
    expect(sim.answer(true, 0)).toBe('launch');
    expect(sim.status).toBe('won');
    const lose = new SprintSim({ goal: 9 });
    lose.answer(false);
    lose.answer(false);
    expect(lose.answer(false)).toBe('fall');
    expect(sim.timeFor(6)).toBeGreaterThan(sim.timeFor(3));
  });
});

describe('Meteor Defense', () => {
  it('loses a building per miss, shields after 3 in a row, wins after the waves', () => {
    const sim = new MeteorSim({ waves: 6, buildings: 3 });
    expect(sim.resolve(false).hit).toBeGreaterThanOrEqual(0);
    expect(sim.standing).toBe(2);
    [1, 2, 3].forEach(() => sim.resolve(true));
    expect(sim.shield).toBe(true);
    expect(sim.resolve(false).shielded).toBe(true);
    expect(sim.standing).toBe(2);
    expect(sim.resolve(true).end).toBe('won');
  });
  it('the trial city never falls', () => {
    const sim = new MeteorSim({ waves: 99, buildings: 2, noDefeat: true });
    for (let i = 0; i < 6; i++) sim.resolve(false);
    expect(sim.standing).toBe(1);
    expect(sim.status).toBe('playing');
  });
});

describe('Penalty Shootout', () => {
  it('alternates shooting and saving', () => {
    const sim = new PenaltySim({ kicks: 3 });
    expect(sim.turn).toBe('shoot');
    sim.answer(true);
    expect(sim.you).toBe(1);
    expect(sim.turn).toBe('save');
    sim.answer(true); // saved
    expect(sim.rival).toBe(0);
    sim.answer(false); // missed
    sim.answer(false); // rival scores
    expect([sim.you, sim.rival]).toEqual([1, 1]);
  });
  it('ends early when a team cannot be caught, and goes to sudden death on a tie', () => {
    const win = new PenaltySim({ kicks: 3 });
    // You 2-0 up with the rival having one kick left and you one: 2 > 0 + 1 → still catchable until…
    [true, true, true, true, true].forEach((c) => win.answer(c));
    expect(win.status).toBe('won');
    const tie = new PenaltySim({ kicks: 2 });
    [true, false, true, false].forEach((c) => tie.answer(c)); // 2-2
    expect(tie.status).toBe('playing');
    expect(tie.suddenDeath).toBe(true);
    tie.answer(true);
    expect(tie.answer(true).end).toBe('won'); // scored, then saved
  });
  it('can be lost', () => {
    const sim = new PenaltySim(penaltyConfigFor(3));
    let end: string | undefined;
    for (let i = 0; i < 20 && !end; i++) end = sim.answer(false).end;
    expect(end).toBe('lost');
  });
});

describe('Grand Prix', () => {
  it('a good driver reaches the podium; nitro and slipstream fire', () => {
    const sim = new RaceSim(raceConfigFor(5), seeded(3));
    let end: string | undefined;
    const events = new Set<string>();
    let streak = 0;
    for (let i = 0; i < 80 && !end; i++) {
      const correct = i % 5 !== 4;
      streak = correct ? streak + 1 : 0;
      const r = sim.answer(correct, streak);
      r.events.forEach((e) => events.add(e));
      end = r.end;
    }
    expect(end).toBe('won');
    expect(events.has('nitro')).toBe(true);
    expect(events.has('spin')).toBe(true);
  });
  it('slipstream helps when far behind; all-wrong loses', () => {
    const sim = new RaceSim({ length: 40 }, seeded(9));
    for (let i = 0; i < 6; i++) sim.answer(false, 0);
    expect(sim.answer(true, 1).events).toContain('slipstream');
    const lose = new RaceSim({ length: 12 }, seeded(2));
    let end: string | undefined;
    for (let i = 0; i < 40 && !end; i++) end = lose.answer(false, 0).end;
    expect(end).toBe('lost');
  });
});

describe('Word Detective', () => {
  it('clears one innocent per right answer, then the culprit can be accused', () => {
    const sim = new DetectiveSim({ cases: 2 }, seeded(4));
    const c = sim.case;
    expect(c.suspects).toHaveLength(4);
    for (let i = 0; i < 3; i++) expect(sim.answer(true).clue).toMatch(/\w/);
    expect(sim.readyToAccuse).toBe(true);
    expect(sim.remaining[0].id).toBe(c.culprit);
    expect(sim.stars()).toBe(3);
    sim.accuse();
    expect(sim.current).toBe(1);
    // Second case with slips: fewer stars.
    sim.answer(false);
    sim.hint();
    sim.answer(false);
    expect(sim.stars()).toBe(1);
    for (let i = 0; i < 3; i++) sim.answer(true);
    expect(sim.accuse().end).toBe('won');
  });
  it('a case goes cold after 5 slips', () => {
    const sim = new DetectiveSim(detectiveConfigFor(6), seeded(8));
    let cold = false;
    for (let i = 0; i < 5; i++) cold = !!sim.answer(false).cold;
    expect(cold).toBe(true);
    sim.next();
    expect(sim.current).toBe(1);
  });
});

describe('mode choice', () => {
  it('word order → Sentence Sprint; rotation stays within suitable modes', () => {
    expect(modeFor(['en.grammar.word-order'])).toBe('sprint');
    const seen = new Set(['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((s) => modeFor(['en.vocab.synonyms'], 'learn', `m-${s}`)));
    expect(seen.size).toBeGreaterThan(1);
    for (const m of seen) expect(modesFor(['en.vocab.synonyms'])).toContain(m);
    expect(modeFor(['en.vocab.synonyms'], 'boss', 'x')).toBe('duel');
  });
});
