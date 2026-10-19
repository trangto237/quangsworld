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
import { reportError } from '../../lib/errors';

/** Picks the game for a mission. All modes share the same question/answer contract. */
export function GameArena({ mode, defense, ...raw }: ModeProps & { mode: GameMode; defense: { config: BattleConfig; theme?: Theme; skin?: Skin; hint?: string } }) {
  // A failure while saving an answer, loading the next question or ending the game must never freeze
  // the game: report it and carry on.
  const p: ModeProps = {
    ...raw,
    nextQuestion: () => {
      try {
        return raw.nextQuestion();
      } catch (e) {
        reportError(e, 'next question');
        return null;
      }
    },
    onAnswered: (q, correct, ms, picked) => {
      try {
        return raw.onAnswered(q, correct, ms, picked);
      } catch (e) {
        reportError(e, 'saving the answer');
        return { streak: 0 };
      }
    },
    onEnd: (victory, retreated) => {
      try {
        raw.onEnd(victory, retreated);
      } catch (e) {
        reportError(e, 'ending the game');
      }
    },
  };
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
