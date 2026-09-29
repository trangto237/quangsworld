import Phaser from 'phaser';
import { BattleScene, type Skin, type Theme } from './scene';
import { BattleSim, TOWERS, type BattleConfig, type HudState, type SimEvent, type TowerKind } from './sim';

export interface BattleOptions {
  config: BattleConfig;
  theme?: Theme;
  skin?: Skin;
  bossName?: string;
  onHud: (hud: HudState) => void;
  onEvent?: (e: SimEvent) => void;
  onEnd: (victory: boolean) => void;
}

export interface BattleController {
  /** Feed a quiz answer into the battle. */
  answer(correct: boolean, streak: number): void;
  select(kind: TowerKind | null): void;
  selected(): TowerKind | null;
  /** Slow the battle while the kid reads a long passage (1 = normal). */
  setTimeScale(scale: number): void;
  pause(paused: boolean): void;
  /** Win immediately with a final strike (trial realms end when their challenges are done). */
  finale(): void;
  hud(): HudState;
  destroy(): void;
}

export function createBattle(parent: HTMLElement, o: BattleOptions): BattleController {
  const sim = new BattleSim(o.config);
  let selected: TowerKind | null = o.config.towers[0] ?? null;
  let lastHud = '';
  let ended = false;

  const emitHud = () => {
    const h = sim.hud();
    const key = JSON.stringify(h);
    if (key !== lastHud) {
      lastHud = key;
      o.onHud(h);
    }
  };

  const scene = new BattleScene();
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 960,
    height: 540,
    transparent: false,
    backgroundColor: '#0f172a',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    render: { antialias: true },
    banner: false,
    scene: [],
  });
  game.scene.add('battle', scene, true, {
    sim,
    theme: o.theme ?? 'day',
    skin: o.skin ?? 'default',
    bossName: o.bossName ?? 'The Boss',
    getSelected: () => selected,
    onEvent: (e: SimEvent) => {
      o.onEvent?.(e);
      if (e.type === 'end' && !ended) {
        ended = true;
        emitHud();
        o.onEnd(e.victory);
      }
    },
    onCellClick: (row: number, col: number) => {
      const existing = sim.towerAt(row, col);
      if (existing) sim.upgrade(existing.id);
      else if (selected) sim.place(row, col, selected);
      emitHud();
    },
  });
  const hudTimer = window.setInterval(emitHud, 150);
  emitHud();

  return {
    answer(correct, streak) {
      sim.answer(correct, streak);
      emitHud();
    },
    select(kind) {
      selected = kind;
    },
    selected: () => selected,
    setTimeScale(s) {
      scene.timeScale = s;
    },
    pause(p) {
      scene.paused = p;
    },
    finale() {
      sim.finale();
    },
    hud: () => sim.hud(),
    destroy() {
      window.clearInterval(hudTimer);
      game.destroy(true);
    },
  };
}

export { TOWERS };
