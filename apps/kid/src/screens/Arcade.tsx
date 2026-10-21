import { useMemo } from 'react';
import type { StudentProfile } from '@atlas/db';
import { missionReward, scoreConcepts } from '@atlas/engine';
import { MODES, type GameMode } from '@atlas/game';
import type { Mission } from '@atlas/shared';
import { useQuery } from '@atlas/ui';
import { T, TB } from '../i18n';
import { ISLAND_GAMES } from '../lib/islands';
import { useKid } from '../store';
import { TownScreen } from '../town/Shell';
import { Panel } from '../town/ui';

const GAMES = Object.keys(MODES) as GameMode[];

/** Where each game lives on the map, so he knows where else to find it. */
const homeOf = (m: GameMode) => Object.values(ISLAND_GAMES).find((g) => g.mode === m && !g.dress?.falling);

/**
 * The Arcade island: play any game he likes, on a mix of topics he has already practised
 * (the ones the planner most wants to revisit).
 */
export function Arcade({ student }: { student: StudentProfile }) {
  const go = useKid((s) => s.go);
  const states = useQuery((r) => r.getStates(student.id), [student.id]);
  const goals = useQuery((r) => r.listGoals(student.id), [student.id]);
  const concepts = useMemo(() => {
    const ranked = scoreConcepts({ states, goals });
    const played = ranked.filter((s) => s.state.attempts > 0);
    return (played.length >= 2 ? played : ranked).slice(0, 3).map((s) => s.concept.id);
  }, [states, goals]);

  const play = (mode: GameMode) => {
    const mission: Mission = {
      id: `arcade-${mode}-${Date.now()}`,
      concepts,
      duration: 5,
      kind: 'review',
      title: `Arcade · ${MODES[mode].name}`,
      reward: missionReward(5, 'review'),
      mode,
    };
    go({ name: 'battle', mission, fromPlan: false });
  };

  return (
    <TownScreen student={student} tab="map" back={() => go({ name: 'hub' })}>
      <Panel className="text-center">
        <div className="mx-auto grid size-20 place-items-center rounded-2xl border-[2.5px] border-ink bg-[#c084fc55] text-5xl">🕹️</div>
        <h1 className="mt-2 font-display text-3xl font-bold">
          <T en="Arcade" />
        </h1>
        <p className="text-ink-soft">
          <T en="Play any game you like — the questions mix topics you've already practised." />
        </p>
      </Panel>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {GAMES.map((m) => {
          const home = homeOf(m);
          return (
            <button key={m} onClick={() => play(m)} className="town-btn flex flex-col items-center rounded-2xl bg-paper p-3 text-center hover:bg-paper-3">
              <span className="text-4xl leading-none">{MODES[m].emoji}</span>
              <b className="mt-1 font-display text-lg leading-tight">
                <T en={MODES[m].name} />
              </b>
              <span className="mt-1 text-xs text-ink-soft">
                <T en={MODES[m].blurb} />
              </span>
              {home && <span className="mt-1.5 rounded-full bg-paper-3 px-2 py-0.5 text-[11px] font-bold text-ink-soft">📍 {home.name}</span>}
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-center text-sm text-ink-soft">
        <TB en="5 min · review rewards" />
      </p>
    </TownScreen>
  );
}
