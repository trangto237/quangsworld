import type { BattleConfig, GameMode, Skin, Theme } from '@atlas/game';
import { BattleArena } from '../BattleArena';
import { DetectiveArena } from './DetectiveArena';
import { DuelArena } from './DuelArena';
import { KnightArena } from './KnightArena';
import { MeteorArena } from './MeteorArena';
import { PenaltyArena } from './PenaltyArena';
import { RaceArena } from './RaceArena';
import { RunnerArena } from './RunnerArena';
import { SprintArena } from './SprintArena';
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
    case 'sprint':
      return <SprintArena {...p} />;
    case 'meteor':
      return <MeteorArena {...p} />;
    case 'penalty':
      return <PenaltyArena {...p} />;
    case 'race':
      return <RaceArena {...p} />;
    case 'detective':
      return <DetectiveArena {...p} />;
    default:
      return <BattleArena {...p} {...defense} />;
  }
}
