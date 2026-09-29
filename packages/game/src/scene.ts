import Phaser from 'phaser';
import { BattleSim, ENEMIES, GRID, SPAWN_X, TOWERS, cellCenter, type Enemy, type SimEvent, type Tower, type TowerKind } from './sim';

export type Theme = 'day' | 'night' | 'snow';
export type Skin = 'default' | 'neon' | 'gold';

const THEMES: Record<Theme, { bg: number; a: number; b: number; base: number; baseDark: number; text: string }> = {
  day: { bg: 0x14532d, a: 0x4ade80, b: 0x22c55e, base: 0x94a3b8, baseDark: 0x475569, text: '#0f172a' },
  night: { bg: 0x0b1020, a: 0x1e3a5f, b: 0x172e4d, base: 0x475569, baseDark: 0x1e293b, text: '#e2e8f0' },
  snow: { bg: 0x94a3b8, a: 0xf1f5f9, b: 0xe2e8f0, base: 0x64748b, baseDark: 0x334155, text: '#0f172a' },
};

const SKINS: Record<Skin, { fill: number; stroke: number; glyph: string }> = {
  default: { fill: 0xfef3c7, stroke: 0x78350f, glyph: '#1f2937' },
  neon: { fill: 0x0f172a, stroke: 0x22d3ee, glyph: '#67e8f9' },
  gold: { fill: 0xfacc15, stroke: 0xa16207, glyph: '#422006' },
};

const FONT = "'Baloo 2', Nunito, system-ui, sans-serif";

const ENEMY_COLORS: Record<Enemy['kind'], number> = { grunt: 0x8b5cf6, runner: 0xf43f5e, tank: 0x64748b, boss: 0x7f1d1d };

export interface SceneOptions {
  sim: BattleSim;
  theme: Theme;
  skin: Skin;
  bossName: string;
  getSelected: () => TowerKind | null;
  onEvent: (e: SimEvent) => void;
  onCellClick?: (row: number, col: number) => void;
}

/** Renders a BattleSim. All game rules live in the sim; this only draws and forwards input. */
export class BattleScene extends Phaser.Scene {
  private opts!: SceneOptions;
  private towerViews = new Map<number, Phaser.GameObjects.Container>();
  private enemyViews = new Map<number, Phaser.GameObjects.Container>();
  private boltViews = new Map<number, Phaser.GameObjects.Arc>();
  private hover!: Phaser.GameObjects.Rectangle;
  private ghost!: Phaser.GameObjects.Text;
  timeScale = 1;
  paused = false;

  constructor() {
    super('battle');
  }

  init(opts: SceneOptions) {
    this.opts = opts;
  }

  create() {
    const th = THEMES[this.opts.theme];
    this.cameras.main.setBackgroundColor(th.bg);

    // Checkerboard lanes (a chessboard battlefield).
    const g = this.add.graphics();
    for (let r = 0; r < GRID.rows; r++) {
      for (let c = 0; c < GRID.cols; c++) {
        g.fillStyle((r + c) % 2 ? th.a : th.b, 1);
        g.fillRect(GRID.left + c * GRID.cell, GRID.top + r * GRID.cell, GRID.cell, GRID.cell);
      }
    }
    // Spawn fog
    g.fillStyle(0x000000, 0.25);
    g.fillRect(GRID.left + GRID.cols * GRID.cell, GRID.top, GRID.width - (GRID.left + GRID.cols * GRID.cell), GRID.rows * GRID.cell);

    // Castle
    g.fillStyle(th.baseDark, 1);
    g.fillRect(0, GRID.top, GRID.left - 12, GRID.rows * GRID.cell);
    g.fillStyle(th.base, 1);
    g.fillRect(8, GRID.top + 8, GRID.left - 28, GRID.rows * GRID.cell - 16);
    for (let i = 0; i < 9; i++) {
      g.fillStyle(th.baseDark, 1);
      g.fillRect(GRID.left - 20, GRID.top + i * 52 + 6, 14, 28);
    }
    this.add.text(GRID.left / 2 - 6, GRID.top + (GRID.rows * GRID.cell) / 2, '🏰', { fontSize: '48px' }).setOrigin(0.5);

    this.hover = this.add.rectangle(0, 0, GRID.cell - 4, GRID.cell - 4, 0xffffff, 0.25).setVisible(false).setStrokeStyle(3, 0xffffff, 0.8);
    this.ghost = this.add.text(0, 0, '', { fontSize: '44px', color: '#ffffff' }).setOrigin(0.5).setAlpha(0.5).setVisible(false);

    this.input.on('pointermove', (p: Phaser.Input.Pointer) => this.onHover(p));
    this.input.on('pointerout', () => this.hover.setVisible(false));
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.onClick(p));
  }

  private cellAt(p: Phaser.Input.Pointer) {
    const col = Math.floor((p.worldX - GRID.left) / GRID.cell);
    const row = Math.floor((p.worldY - GRID.top) / GRID.cell);
    if (row < 0 || row >= GRID.rows || col < 0 || col >= GRID.cols) return null;
    return { row, col };
  }

  private onHover(p: Phaser.Input.Pointer) {
    const cell = this.cellAt(p);
    const sel = this.opts.getSelected();
    if (!cell) {
      this.hover.setVisible(false);
      this.ghost.setVisible(false);
      return;
    }
    const { x, y } = cellCenter(cell.row, cell.col);
    const existing = this.opts.sim.towerAt(cell.row, cell.col);
    const ok = sel ? this.opts.sim.canPlace(cell.row, cell.col, sel) : !!existing;
    this.hover.setPosition(x, y).setVisible(true).setFillStyle(ok ? 0xffffff : 0xef4444, ok ? 0.25 : 0.2);
    this.ghost.setVisible(!!sel && !existing).setPosition(x, y).setText(sel ? TOWERS[sel].glyph : '');
  }

  private onClick(p: Phaser.Input.Pointer) {
    const cell = this.cellAt(p);
    if (!cell) return;
    this.opts.onCellClick?.(cell.row, cell.col);
    this.onHover(p);
  }

  update(_time: number, delta: number) {
    if (this.paused) return;
    const sim = this.opts.sim;
    sim.update(delta * this.timeScale);
    for (const e of sim.drainEvents()) {
      this.fx(e);
      this.opts.onEvent(e);
    }
    this.sync();
  }

  private fx(e: SimEvent) {
    switch (e.type) {
      case 'kill': {
        const v = this.enemyViews.get(e.enemy.id);
        if (v) {
          this.tweens.add({ targets: v, alpha: 0, scale: 1.6, duration: 250, onComplete: () => v.destroy() });
          this.enemyViews.delete(e.enemy.id);
        }
        this.floatText(e.enemy.x, cellCenter(e.enemy.row, 0).y, '✦', '#fde047');
        break;
      }
      case 'hit': {
        const v = this.enemyViews.get(e.enemy.id);
        if (v) this.tweens.add({ targets: v, alpha: 0.5, yoyo: true, duration: 60 });
        break;
      }
      case 'surge':
        this.cameras.main.flash(250, 239, 68, 68, false);
        this.cameras.main.shake(200, 0.006);
        break;
      case 'strike':
        this.cameras.main.flash(300, 250, 204, 21, false);
        this.floatText(GRID.width / 2, GRID.height / 2, 'CHECKMATE STRIKE!', '#facc15', 36);
        break;
      case 'baseHit':
        this.cameras.main.shake(300, 0.012);
        this.floatText(60, cellCenter(e.row, 0).y, '−❤', '#ef4444', 28);
        break;
      case 'energy':
        if (e.amount > 0) this.floatText(GRID.left + 60, 30, `+${e.amount}⚡`, '#fde047', 22);
        break;
      case 'upgrade': {
        const { x, y } = cellCenter(e.tower.row, e.tower.col);
        this.floatText(x, y - 30, '▲ LEVEL ' + e.tower.level, '#a7f3d0', 16);
        this.towerViews.get(e.tower.id)?.destroy();
        this.towerViews.delete(e.tower.id);
        break;
      }
      case 'towerLost': {
        const v = this.towerViews.get(e.tower.id);
        if (v) this.tweens.add({ targets: v, alpha: 0, angle: 30, duration: 300, onComplete: () => v.destroy() });
        this.towerViews.delete(e.tower.id);
        break;
      }
      case 'resupply':
        for (const t of this.opts.sim.towers) {
          const { x, y } = cellCenter(t.row, t.col);
          this.floatText(x, y + 20, '+' + e.shots + '➶', '#7dd3fc', 13);
        }
        break;
      case 'empty': {
        const { x, y } = cellCenter(e.tower.row, e.tower.col);
        this.floatText(x, y - 20, 'Out of ammo!', '#fca5a5', 14);
        break;
      }
      case 'finale':
        this.cameras.main.flash(500, 253, 224, 71, false);
        this.floatText(GRID.width / 2, GRID.height / 2, 'REALM FREED!', '#fde047', 40);
        break;
      case 'boss':
        this.floatText(GRID.width / 2, GRID.height / 2, `⚠ ${this.opts.bossName} approaches!`, '#fca5a5', 30);
        break;
    }
  }

  private floatText(x: number, y: number, text: string, color: string, size = 20) {
    const t = this.add.text(x, y, text, { fontFamily: FONT, fontSize: `${size}px`, color, fontStyle: 'bold', stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5).setDepth(50);
    this.tweens.add({ targets: t, y: y - 40, alpha: 0, duration: 1100, ease: 'Cubic.easeOut', onComplete: () => t.destroy() });
  }

  private makeTower(t: Tower) {
    const skin = SKINS[this.opts.skin];
    const { x, y } = cellCenter(t.row, t.col);
    const c = this.add.container(x, y).setDepth(10);
    const base = this.add.circle(0, 4, 32, skin.fill).setStrokeStyle(t.level > 1 ? 5 : 3, t.level === 3 ? 0xf59e0b : skin.stroke);
    const glyph = this.add.text(0, 0, TOWERS[t.kind].glyph, { fontSize: '46px', color: skin.glyph }).setOrigin(0.5);
    const pips = this.add.text(0, 30, '★'.repeat(t.level - 1), { fontSize: '12px', color: '#f59e0b' }).setOrigin(0.5);
    const bar = this.add.rectangle(-30, -40, 60, 5, 0x22c55e).setOrigin(0, 0.5).setName('hp');
    const ammoBg = this.add.rectangle(-30, 42, 60, 5, 0x000000, 0.35).setOrigin(0, 0.5);
    const ammo = this.add.rectangle(-30, 42, 60, 5, 0x38bdf8).setOrigin(0, 0.5).setName('ammo');
    const empty = this.add.text(22, -26, '!', { fontSize: '22px', color: '#f87171', fontStyle: 'bold', stroke: '#000', strokeThickness: 4 }).setOrigin(0.5).setName('empty').setVisible(false);
    glyph.setName('glyph');
    c.add([base, glyph, pips, bar, ammoBg, ammo, empty]);
    c.setScale(0.2);
    this.tweens.add({ targets: c, scale: 1, duration: 220, ease: 'Back.easeOut' });
    return c;
  }

  private makeEnemy(e: Enemy) {
    const spec = ENEMIES[e.kind];
    const y = cellCenter(e.row, 0).y;
    const c = this.add.container(e.x, y).setDepth(20);
    const r = spec.radius;
    const body = this.add.ellipse(0, 0, r * 2, r * 2.1, ENEMY_COLORS[e.kind]).setStrokeStyle(3, 0x000000, 0.4);
    const eyeL = this.add.circle(-r * 0.35, -r * 0.2, r * 0.22, 0xffffff);
    const eyeR = this.add.circle(r * 0.05, -r * 0.2, r * 0.22, 0xffffff);
    const pupL = this.add.circle(-r * 0.42, -r * 0.2, r * 0.1, 0x111827);
    const pupR = this.add.circle(-r * 0.02, -r * 0.2, r * 0.1, 0x111827);
    const mouth = this.add.rectangle(-r * 0.15, r * 0.35, r * 0.8, r * 0.14, 0x111827);
    const bar = this.add.rectangle(-r, -r - 10, r * 2, 5, 0xef4444).setOrigin(0, 0.5).setName('hp');
    c.add([body, eyeL, eyeR, pupL, pupR, mouth, bar]);
    if (e.kind === 'boss') {
      c.add(this.add.text(0, -r - 6, '👑', { fontSize: '30px' }).setOrigin(0.5, 1));
      c.add(this.add.text(0, r + 4, this.opts.bossName, { fontFamily: FONT, fontSize: '13px', color: '#fff', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5, 0));
    }
    if (e.kind === 'tank') c.add(this.add.text(0, -r - 4, '🛡', { fontSize: '18px' }).setOrigin(0.5, 1));
    // Wobble walk
    this.tweens.add({ targets: body, scaleY: 0.92, yoyo: true, repeat: -1, duration: 300 + Math.random() * 200 });
    return c;
  }

  private sync() {
    const sim = this.opts.sim;
    for (const t of sim.towers) {
      let v = this.towerViews.get(t.id);
      if (!v) {
        v = this.makeTower(t);
        this.towerViews.set(t.id, v);
      }
      const bar = v.getByName('hp') as Phaser.GameObjects.Rectangle;
      bar.width = 60 * Math.max(0, t.hp / t.maxHp);
      (v.getByName('ammo') as Phaser.GameObjects.Rectangle).width = 60 * Math.max(0, t.ammo / t.maxAmmo);
      (v.getByName('empty') as Phaser.GameObjects.Text).setVisible(t.ammo === 0);
      (v.getByName('glyph') as Phaser.GameObjects.Text).setAlpha(t.ammo === 0 ? 0.35 : 1);
    }
    const alive = new Set(sim.enemies.map((e) => e.id));
    for (const e of sim.enemies) {
      let v = this.enemyViews.get(e.id);
      if (!v) {
        v = this.makeEnemy(e);
        this.enemyViews.set(e.id, v);
      }
      v.x = e.x;
      v.setAlpha(e.x > SPAWN_X - 20 ? 0.6 : 1);
      const bar = v.getByName('hp') as Phaser.GameObjects.Rectangle;
      bar.width = ENEMIES[e.kind].radius * 2 * Math.max(0, e.hp / e.maxHp);
      (v.list[0] as Phaser.GameObjects.Ellipse).setFillStyle(e.slowUntil > sim.time ? 0x38bdf8 : ENEMY_COLORS[e.kind]);
    }
    for (const [id, v] of this.enemyViews) {
      if (!alive.has(id)) {
        v.destroy();
        this.enemyViews.delete(id);
      }
    }
    const bolts = new Set(sim.bolts.map((b) => b.id));
    for (const b of sim.bolts) {
      let v = this.boltViews.get(b.id);
      if (!v) {
        const color = b.kind === 'bishop' ? 0x7dd3fc : b.kind === 'queen' ? 0xf0abfc : b.kind === 'knight' ? 0xfdba74 : 0xfef08a;
        v = this.add.circle(b.x, cellCenter(b.row, 0).y - 6, b.kind === 'rook' ? 9 : 6, color).setStrokeStyle(2, 0x000000, 0.3).setDepth(30);
        this.boltViews.set(b.id, v);
      }
      v.x = b.x;
    }
    for (const [id, v] of this.boltViews) {
      if (!bolts.has(id)) {
        v.destroy();
        this.boltViews.delete(id);
      }
    }
  }
}
