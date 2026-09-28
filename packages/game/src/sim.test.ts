import { describe, expect, it } from 'vitest';
import { BattleSim, ENERGY_PER_CORRECT, SURGE_PX, WRONG_PENALTY, battleConfigFor, cellCenter, GRID } from './sim';

const cfg = { towers: ['pawn', 'rook'] as const, enemies: 3, hasBoss: false, firstSpawn: 1000, spawnInterval: 2000 };
const seq = (vals: number[]) => {
  let i = 0;
  return () => vals[i++ % vals.length];
};

function run(sim: BattleSim, ms: number) {
  for (let t = 0; t < ms && sim.status === 'playing'; t += 50) sim.update(50);
}

describe('BattleSim', () => {
  it('correct answers generate energy with a streak bonus', () => {
    const sim = new BattleSim({ ...cfg, towers: [...cfg.towers], startEnergy: 0 });
    sim.answer(true, 1);
    expect(sim.energy).toBe(ENERGY_PER_CORRECT);
    sim.answer(true, 3);
    expect(sim.energy).toBe(ENERGY_PER_CORRECT * 2 + 10);
  });

  it('wrong answers cost energy and make enemies advance', () => {
    const sim = new BattleSim({ ...cfg, towers: [...cfg.towers], startEnergy: 50 }, seq([0.5]));
    run(sim, 1100);
    const x = sim.enemies[0].x;
    sim.answer(false);
    expect(sim.energy).toBe(50 - WRONG_PENALTY);
    expect(sim.enemies[0].x).toBe(x - SURGE_PX);
    expect(sim.drainEvents().some((e) => e.type === 'surge')).toBe(true);
  });

  it('energy builds towers; locked or unaffordable towers are refused', () => {
    const sim = new BattleSim({ ...cfg, towers: [...cfg.towers], startEnergy: 60 });
    expect(sim.place(0, 0, 'queen')).toBeUndefined(); // locked
    expect(sim.place(0, 0, 'pawn')).toBeDefined();
    expect(sim.place(0, 0, 'pawn')).toBeUndefined(); // occupied
    expect(sim.place(1, 0, 'pawn')).toBeUndefined(); // only 10 energy left
    expect(sim.energy).toBe(10);
  });

  it('upgrades towers with energy', () => {
    const sim = new BattleSim({ ...cfg, towers: [...cfg.towers], startEnergy: 200 });
    const t = sim.place(2, 1, 'pawn')!;
    expect(sim.upgrade(t.id)).toBe(true);
    expect(t.level).toBe(2);
    expect(t.maxHp).toBeGreaterThan(80);
  });

  it('towers defend their lane and the battle is won', () => {
    const sim = new BattleSim({ ...cfg, towers: [...cfg.towers], startEnergy: 1000, difficulty: 1 }, seq([0.1]));
    for (let r = 0; r < GRID.rows; r++) {
      sim.place(r, 0, 'pawn');
      sim.place(r, 1, 'pawn');
    }
    run(sim, 120_000);
    expect(sim.status).toBe('won');
    expect(sim.hearts).toBe(3);
    expect(sim.defeated).toBe(3);
  });

  it('an undefended castle falls', () => {
    const sim = new BattleSim({ ...cfg, towers: [...cfg.towers], enemies: 4 }, seq([0.3]));
    run(sim, 300_000);
    expect(sim.status).toBe('lost');
    expect(sim.hearts).toBe(0);
  });

  it('enemies chew through a tower that blocks them', () => {
    const sim = new BattleSim({ ...cfg, towers: [...cfg.towers], enemies: 1, startEnergy: 75 }, seq([0.5]));
    run(sim, 1100);
    const row = sim.enemies[0].row;
    sim.place(row, 8, 'rook');
    const events: string[] = [];
    for (let i = 0; i < 4000 && sim.status === 'playing'; i++) {
      sim.update(50);
      events.push(...sim.drainEvents().map((e) => e.type));
    }
    expect(events).toContain('hit');
  });

  it('spawns a boss after the regular waves', () => {
    const sim = new BattleSim({ ...cfg, towers: [...cfg.towers], hasBoss: true, startEnergy: 0 }, seq([0.5]));
    run(sim, 30_000);
    expect(sim.bossSpawned).toBe(true);
    expect(sim.hud().bossHp).not.toBeNull();
  });

  it('a 5-answer streak unleashes a strike on every enemy', () => {
    const sim = new BattleSim({ ...cfg, towers: [...cfg.towers] }, seq([0.5]));
    run(sim, 1100);
    const hp = sim.enemies[0].hp;
    sim.answer(true, 5);
    expect(sim.enemies[0].hp).toBeLessThan(hp);
  });

  it('scales battle size with mission length', () => {
    const short = battleConfigFor(5, { towers: ['pawn'], boss: false });
    const long = battleConfigFor(8, { towers: ['pawn'], boss: true });
    expect(long.enemies).toBeGreaterThan(short.enemies);
    expect(cellCenter(0, 0).x).toBe(GRID.left + GRID.cell / 2);
  });
});
