import { createContext, useContext, useEffect, useRef, useState } from 'react';
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
import { inSlot, type Slots } from '../../lib/equipped';
import { EffectBurst, LookProvider } from './look';

/** Lets the shared Leave button get the player out even when the game itself has already stopped. */
const EscapeCtx = createContext<(() => void) | null>(null);
export const useEscape = () => useContext(EscapeCtx);

/** Picks the game for a mission. All modes share the same question/answer contract. */
export function GameArena({
  mode,
  defense,
  slots,
  ...raw
}: ModeProps & { mode: GameMode; defense: { config: BattleConfig; theme?: Theme; skin?: Skin; hint?: string }; slots?: Slots }) {
  const ended = useRef<{ victory: boolean } | null>(null);
  const mounted = useRef(true);
  const timers = useRef<number[]>([]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      timers.current.forEach(clearTimeout);
    };
  }, []);
  // The equipped right-answer effect, in every game.
  const effect = slots?.effect ? inSlot(slots, 'effect')?.emoji : undefined;
  const [burst, setBurst] = useState<number | null>(null);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(() => mounted.current && fn(), ms));

  const finish = (victory: boolean, retreated: boolean) => {
    ended.current = { victory };
    try {
      raw.onEnd(victory, retreated);
    } catch (e) {
      reportError(e, 'ending the game');
    }
  };

  // A failure while saving an answer, loading the next question or ending the game must never freeze
  // the game: report it and carry on.
  const p: ModeProps = {
    ...raw,
    nextQuestion: () => {
      let q = null;
      try {
        q = raw.nextQuestion();
      } catch (e) {
        reportError(e, 'next question');
      }
      // Out of questions: end the game instead of waiting forever.
      if (!q) later(() => !ended.current && finish(true, false), 1500);
      return q;
    },
    onAnswered: (q, correct, ms, picked) => {
      if (correct && effect) {
        const id = Date.now();
        setBurst(id);
        later(() => setBurst((b) => (b === id ? null : b)), 1300);
      }
      try {
        return raw.onAnswered(q, correct, ms, picked);
      } catch (e) {
        reportError(e, 'saving the answer');
        return { streak: 0 };
      }
    },
    onEnd: (victory, retreated) => {
      if (ended.current) return;
      finish(victory, retreated);
    },
  };
  // Leave pressed: if the game already ended but this screen is still showing, try ending again.
  const escape = () => later(() => finish(ended.current?.victory ?? false, true), 800);
  const arena = pick(mode, p, defense);
  return (
    <EscapeCtx.Provider value={escape}>
      <LookProvider slots={slots} avatar={raw.avatar}>
        {arena}
        {burst != null && effect && <EffectBurst key={burst} id={burst} emoji={effect} />}
      </LookProvider>
    </EscapeCtx.Provider>
  );
}

function pick(mode: GameMode, p: ModeProps, defense: { config: BattleConfig; theme?: Theme; skin?: Skin; hint?: string }) {
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
