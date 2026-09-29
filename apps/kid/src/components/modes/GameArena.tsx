import type { BattleConfig, GameMode, Skin, Theme } from '@atlas/game';
import { BattleArena } from '../BattleArena';
import { DuelArena } from './DuelArena';
import { KnightArena } from './KnightArena';
import { RunnerArena } from './RunnerArena';
import type { ModeProps } from './types';

/** Picks the game for a mission. All modes share the same question/answer contract. */
export function GameArena({ mode, defense, ...p }: ModeProps & { mode: GameMode; defense: { config: BattleConfig; theme?: Theme; skin?: Skin; hint?: string } }) {
  switch (mode) {
    case 'duel':
      return <DuelArena {...p} />;
    case 'runner':
      return <RunnerArena {...p} />;
    case 'knight':
      return <KnightArena {...p} />;
    default:
      return <BattleArena {...p} {...defense} />;
  }
}
