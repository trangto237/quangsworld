/**
 * Lane-battle simulation (PRD §4.3), independent of rendering so the rules are unit-testable.
 *
 * Correct answer → energy (+ streak bonus); energy builds and upgrades chess-piece towers.
 * Wrong answer   → lose energy and every enemy surges forward.
 * Enemies ("Glitches") walk right→left; one reaching the castle costs a heart.
 */

export type TowerKind = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen';
export type EnemyKind = 'grunt' | 'runner' | 'tank' | 'boss';

export interface TowerSpec {
  kind: TowerKind;
  name: string;
  glyph: string;
  cost: number;
  hp: number;
  damage: number;
  /** ms between shots */
  rate: number;
  /** Lanes hit relative to own row. */
  lanes: number[];
  slow?: number;
  blurb: string;
}

export const TOWERS: Record<TowerKind, TowerSpec> = {
  pawn: { kind: 'pawn', name: 'Pawn Archer', glyph: '♟', cost: 50, hp: 80, damage: 20, rate: 1400, lanes: [0], blurb: 'Fires down its lane.' },
  rook: { kind: 'rook', name: 'Rook Wall', glyph: '♜', cost: 75, hp: 400, damage: 12, rate: 2400, lanes: [0], blurb: 'Tough wall, slow shots.' },
  knight: { kind: 'knight', name: 'Knight Lancer', glyph: '♞', cost: 100, hp: 90, damage: 18, rate: 1800, lanes: [-1, 0, 1], blurb: 'Hits three lanes.' },
  bishop: { kind: 'bishop', name: 'Bishop Frost', glyph: '♝', cost: 125, hp: 80, damage: 14, rate: 1500, lanes: [0], slow: 0.5, blurb: 'Slows enemies.' },
  queen: { kind: 'queen', name: 'Queen Storm', glyph: '♛', cost: 175, hp: 120, damage: 16, rate: 500, lanes: [0], blurb: 'Rapid fire.' },
};

interface EnemySpec {
  hp: number;
  speed: number; // px per second
  bite: number; // damage per second to towers
  radius: number;
}

export const ENEMIES: Record<EnemyKind, EnemySpec> = {
  grunt: { hp: 100, speed: 13, bite: 25, radius: 24 },
  runner: { hp: 70, speed: 22, bite: 18, radius: 20 },
  tank: { hp: 260, speed: 8, bite: 35, radius: 30 },
  boss: { hp: 1200, speed: 6, bite: 80, radius: 44 },
};

export const GRID = { rows: 5, cols: 9, cell: 90, left: 120, top: 45, width: 960, height: 540, baseX: 105 } as const;
export const SPAWN_X = GRID.left + GRID.cols * GRID.cell + 25;

export const cellCenter = (row: number, col: number) => ({
  x: GRID.left + col * GRID.cell + GRID.cell / 2,
  y: GRID.top + row * GRID.cell + GRID.cell / 2,
});

export interface Tower {
  id: number;
  kind: TowerKind;
  row: number;
  col: number;
  hp: number;
  maxHp: number;
  level: number;
  cooldown: number;
}

export interface Enemy {
  id: number;
  kind: EnemyKind;
  row: number;
  x: number;
  hp: number;
  maxHp: number;
  slowUntil: number;
}

export interface Bolt {
  id: number;
  row: number;
  x: number;
  damage: number;
  slow?: number;
  kind: TowerKind;
}

export type SimEvent =
  | { type: 'place'; tower: Tower }
  | { type: 'upgrade'; tower: Tower }
  | { type: 'shoot'; bolt: Bolt }
  | { type: 'hit'; enemy: Enemy; damage: number }
  | { type: 'kill'; enemy: Enemy }
  | { type: 'towerLost'; tower: Tower }
  | { type: 'baseHit'; row: number }
  | { type: 'surge' }
  | { type: 'energy'; amount: number }
  | { type: 'strike' }
  | { type: 'boss'; enemy: Enemy }
  | { type: 'end'; victory: boolean };

export interface BattleConfig {
  /** Tower kinds the student has unlocked. */
  towers: TowerKind[];
  /** Regular enemies before the boss. */
  enemies: number;
  hasBoss: boolean;
  /** 1 (gentle) … 3 (tough); scales enemy health. */
  difficulty?: number;
  /** ms between spawns. */
  spawnInterval?: number;
  firstSpawn?: number;
  startEnergy?: number;
  hearts?: number;
}

export type BattleStatus = 'playing' | 'won' | 'lost';

export interface HudState {
  energy: number;
  hearts: number;
  maxHearts: number;
  spawned: number;
  defeated: number;
  total: number;
  bossHp: number | null;
  bossMaxHp: number | null;
  status: BattleStatus;
  towersOnField: number;
}

export const ENERGY_PER_CORRECT = 25;
export const WRONG_PENALTY = 10;
export const SURGE_PX = 35;
export const STRIKE_EVERY = 5;
export const STRIKE_DAMAGE = 70;

export class BattleSim {
  towers: Tower[] = [];
  enemies: Enemy[] = [];
  bolts: Bolt[] = [];
  energy: number;
  hearts: number;
  readonly maxHearts: number;
  time = 0;
  spawned = 0;
  defeated = 0;
  bossSpawned = false;
  status: BattleStatus = 'playing';
  private nextId = 1;
  private nextSpawnAt: number;
  private events: SimEvent[] = [];
  private readonly hpScale: number;
  private readonly interval: number;

  constructor(
    readonly cfg: BattleConfig,
    private rand: () => number = Math.random,
  ) {
    this.energy = cfg.startEnergy ?? 100;
    this.hearts = this.maxHearts = cfg.hearts ?? 3;
    this.nextSpawnAt = cfg.firstSpawn ?? 12_000;
    this.hpScale = 1 + 0.2 * ((cfg.difficulty ?? 1) - 1);
    this.interval = cfg.spawnInterval ?? 12_000;
  }

  get total() {
    return this.cfg.enemies + (this.cfg.hasBoss ? 1 : 0);
  }

  drainEvents(): SimEvent[] {
    const e = this.events;
    this.events = [];
    return e;
  }

  towerAt(row: number, col: number) {
    return this.towers.find((t) => t.row === row && t.col === col);
  }

  canPlace(row: number, col: number, kind: TowerKind) {
    return (
      this.status === 'playing' &&
      this.cfg.towers.includes(kind) &&
      row >= 0 && row < GRID.rows && col >= 0 && col < GRID.cols &&
      !this.towerAt(row, col) &&
      this.energy >= TOWERS[kind].cost
    );
  }

  place(row: number, col: number, kind: TowerKind): Tower | undefined {
    if (!this.canPlace(row, col, kind)) return undefined;
    const spec = TOWERS[kind];
    this.energy -= spec.cost;
    const tower: Tower = { id: this.nextId++, kind, row, col, hp: spec.hp, maxHp: spec.hp, level: 1, cooldown: 300 };
    this.towers.push(tower);
    this.events.push({ type: 'place', tower });
    return tower;
  }

  upgradeCost(t: Tower) {
    return Math.round(TOWERS[t.kind].cost * 0.6 * t.level);
  }

  /** Upgrade: more damage, more health, full repair. Max level 3. */
  upgrade(towerId: number): boolean {
    const t = this.towers.find((x) => x.id === towerId);
    if (!t || t.level >= 3 || this.status !== 'playing') return false;
    const cost = this.upgradeCost(t);
    if (this.energy < cost) return false;
    this.energy -= cost;
    t.level++;
    t.maxHp = Math.round(TOWERS[t.kind].hp * (1 + 0.5 * (t.level - 1)));
    t.hp = t.maxHp;
    this.events.push({ type: 'upgrade', tower: t });
    return true;
  }

  /** The learning hook: every answered question feeds the battle. */
  answer(correct: boolean, streak = 0) {
    if (this.status !== 'playing') return;
    if (correct) {
      const amount = ENERGY_PER_CORRECT + Math.min(25, Math.max(0, streak - 1) * 5);
      this.energy += amount;
      this.events.push({ type: 'energy', amount });
      if (streak > 0 && streak % STRIKE_EVERY === 0) this.strike();
    } else {
      this.energy = Math.max(0, this.energy - WRONG_PENALTY);
      for (const e of this.enemies) e.x -= SURGE_PX;
      this.events.push({ type: 'energy', amount: -WRONG_PENALTY }, { type: 'surge' });
    }
  }

  /** Streak reward: "Checkmate Strike" damages every enemy on the field. */
  private strike() {
    this.events.push({ type: 'strike' });
    for (const e of [...this.enemies]) this.damage(e, STRIKE_DAMAGE);
  }

  private spawn(kind: EnemyKind, row = Math.floor(this.rand() * GRID.rows)) {
    const spec = ENEMIES[kind];
    const hp = Math.round(spec.hp * this.hpScale);
    const enemy: Enemy = { id: this.nextId++, kind, row, x: SPAWN_X, hp, maxHp: hp, slowUntil: 0 };
    this.enemies.push(enemy);
    if (kind === 'boss') {
      this.bossSpawned = true;
      this.events.push({ type: 'boss', enemy });
    } else this.spawned++;
  }

  private pickKind(): EnemyKind {
    if (this.spawned < 3) return 'grunt';
    const r = this.rand();
    return r < 0.2 ? 'tank' : r < 0.45 ? 'runner' : 'grunt';
  }

  private damage(e: Enemy, amount: number, slow?: number) {
    e.hp -= amount;
    if (slow) e.slowUntil = this.time + 2000;
    this.events.push({ type: 'hit', enemy: e, damage: amount });
    if (e.hp <= 0) {
      this.enemies = this.enemies.filter((x) => x !== e);
      this.defeated++;
      this.events.push({ type: 'kill', enemy: e });
    }
  }

  update(dtMs: number) {
    if (this.status !== 'playing') return;
    const dt = Math.min(dtMs, 100); // guard against tab-switch jumps
    this.time += dt;

    // Spawning
    if (this.spawned < this.cfg.enemies && this.time >= this.nextSpawnAt) {
      this.spawn(this.pickKind());
      const jitter = 0.75 + this.rand() * 0.5;
      this.nextSpawnAt = this.time + Math.max(4000, this.interval * jitter - this.spawned * 150);
    } else if (this.cfg.hasBoss && !this.bossSpawned && this.spawned >= this.cfg.enemies && (this.enemies.length <= 2 || this.time >= this.nextSpawnAt + 10_000)) {
      this.spawn('boss', 2);
    }

    // Towers fire
    for (const t of this.towers) {
      t.cooldown -= dt;
      if (t.cooldown > 0) continue;
      const spec = TOWERS[t.kind];
      const x = cellCenter(t.row, t.col).x;
      const lanes = spec.lanes.map((d) => t.row + d).filter((r) => r >= 0 && r < GRID.rows);
      const hasTarget = this.enemies.some((e) => lanes.includes(e.row) && e.x > x - 10 && e.x < SPAWN_X - 5);
      if (!hasTarget) continue;
      t.cooldown = spec.rate;
      const damage = Math.round(spec.damage * (1 + 0.5 * (t.level - 1)));
      for (const row of lanes) {
        const bolt: Bolt = { id: this.nextId++, row, x: x + 20, damage, slow: spec.slow, kind: t.kind };
        this.bolts.push(bolt);
        this.events.push({ type: 'shoot', bolt });
      }
    }

    // Bolts fly and hit
    for (const b of [...this.bolts]) {
      b.x += 0.5 * dt;
      const target = this.enemies
        .filter((e) => e.row === b.row && Math.abs(e.x - b.x) < ENEMIES[e.kind].radius)
        .sort((a, c) => a.x - c.x)[0];
      if (target) {
        this.bolts = this.bolts.filter((x) => x !== b);
        this.damage(target, b.damage, b.slow);
      } else if (b.x > GRID.width + 20) this.bolts = this.bolts.filter((x) => x !== b);
    }

    // Enemies advance or chew on towers
    for (const e of [...this.enemies]) {
      const spec = ENEMIES[e.kind];
      const blocker = this.towers.find((t) => {
        if (t.row !== e.row) return false;
        const tx = cellCenter(t.row, t.col).x;
        return e.x - spec.radius <= tx + 28 && e.x > tx - 10;
      });
      if (blocker) {
        blocker.hp -= (spec.bite * dt) / 1000;
        if (blocker.hp <= 0) {
          this.towers = this.towers.filter((t) => t !== blocker);
          this.events.push({ type: 'towerLost', tower: blocker });
        }
        continue;
      }
      const slowed = e.slowUntil > this.time ? 0.5 : 1;
      e.x -= (spec.speed * slowed * dt) / 1000;
      if (e.x <= GRID.baseX) {
        this.enemies = this.enemies.filter((x) => x !== e);
        this.hearts -= e.kind === 'boss' ? 2 : 1;
        this.defeated++; // it has left the field either way
        this.events.push({ type: 'baseHit', row: e.row });
      }
    }

    if (this.hearts <= 0) {
      this.hearts = 0;
      this.status = 'lost';
      this.events.push({ type: 'end', victory: false });
    } else if (this.spawned >= this.cfg.enemies && (!this.cfg.hasBoss || this.bossSpawned) && this.enemies.length === 0) {
      this.status = 'won';
      this.events.push({ type: 'end', victory: true });
    }
  }

  hud(): HudState {
    const boss = this.enemies.find((e) => e.kind === 'boss');
    return {
      energy: Math.floor(this.energy),
      hearts: this.hearts,
      maxHearts: this.maxHearts,
      spawned: this.spawned + (this.bossSpawned ? 1 : 0),
      defeated: this.defeated,
      total: this.total,
      bossHp: boss ? Math.max(0, Math.round(boss.hp)) : null,
      bossMaxHp: boss ? boss.maxHp : null,
      status: this.status,
      towersOnField: this.towers.length,
    };
  }
}

/** Battle size from mission length: longer missions → more waves. */
export function battleConfigFor(minutes: number, opts: { towers: TowerKind[]; boss: boolean; difficulty?: number }): BattleConfig {
  const enemies = Math.max(5, Math.round(minutes * 2.2));
  const spawnInterval = Math.min(16_000, Math.max(7_000, (minutes * 60_000 * 0.7) / enemies));
  return { towers: opts.towers, enemies, hasBoss: opts.boss, difficulty: opts.difficulty ?? 1, spawnInterval };
}
