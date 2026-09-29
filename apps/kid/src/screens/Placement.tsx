import { useEffect, useMemo, useRef, useState } from 'react';
import type { StudentProfile } from '@atlas/db';
import {
  answeredCount, createPlacement, isPlacementDone, nextPlacementQuestion, recordPlacementAnswer, scorePlacement, type PlacementState,
} from '@atlas/engine';
import { PLACEMENT_SECTIONS, present } from '@atlas/knowledge';
import type { PlacementScores } from '@atlas/shared';
import { Button, Progress, cx, useRepo } from '@atlas/ui';
import { BattleArena } from '../components/BattleArena';
import { ActiveTimer } from '../lib/activeTime';
import { useKid } from '../store';
import { Stars } from './ProfilePicker';

const REALMS: Record<string, { art: string; power: string; story: string }> = {
  'word-hunter': { art: '🏹', power: 'Word Power', story: 'Glitches have stolen the words of the forest. Win them back!' },
  'sentence-forge': { art: '⚒️', power: 'Sentence Craft', story: 'The forge has gone cold. Rebuild sentences to relight it.' },
  'echo-cave': { art: '🦇', power: 'Echo Sense', story: 'Voices echo in the dark. Listen closely — you can replay each echo.' },
  'reading-puzzle': { art: '🧩', power: 'Tablet Reading', story: 'Ancient tablets hold the secrets of the ruins.' },
  'math-logic': { art: '🏰', power: 'Number & Logic Might', story: 'The citadel is locked by number puzzles. Crack them all!' },
};
const REALM_COINS = 40;

type Phase = { kind: 'welcome' } | { kind: 'map' } | { kind: 'realm' } | { kind: 'freed'; index: number } | { kind: 'hero'; scores: PlacementScores };

/**
 * The adaptive placement test as a game: "The Trial of Five Realms".
 * Each realm is a battle the castle can't lose; the adaptive engine picks the challenges behind the scenes
 * (start at medium, harder after a correct answer, easier after two misses). No counters, no scores —
 * each freed realm reveals one power. Progress autosaves after every answer; the kid can rest between realms.
 */
export function Placement({ student }: { student: StudentProfile }) {
  const repo = useRepo();
  const { go, logout } = useKid();
  const [state, setState] = useState<PlacementState>(() => repo.getPlacementProgress(student.id) ?? createPlacement());
  const stateRef = useRef(state);
  const [phase, setPhase] = useState<Phase>(() => (answeredCount(state) === 0 ? { kind: 'welcome' } : { kind: 'map' }));
  const streak = useRef(0);
  const timer = useRef<ActiveTimer | null>(null);

  const update = (s: PlacementState) => {
    stateRef.current = s;
    setState(s);
  };

  // All realms freed → reveal the hero card.
  useEffect(() => {
    if (isPlacementDone(state) && phase.kind === 'map') {
      const scores = scorePlacement(state);
      void repo.completePlacement(student.id, scores);
      setPhase({ kind: 'hero', scores });
    }
  }, [state, phase.kind, repo, student.id]);

  const enterRealm = () => {
    streak.current = 0;
    timer.current = new ActiveTimer();
    setPhase({ kind: 'realm' });
  };

  const leaveRealm = async (freedIndex: number | null) => {
    const t = timer.current;
    timer.current = null;
    const activeMs = t?.stop() ?? 0;
    await repo.completeMission(student.id, {
      states: [],
      session: { kind: 'placement', startedAt: t?.startedAt ?? Date.now(), endedAt: Date.now(), activeMs, missionTitle: 'Trial of Five Realms' },
      reward: freedIndex == null ? { coins: 0, gems: 0, xp: 0 } : { coins: REALM_COINS, gems: 0, xp: 60 },
    });
    setPhase(freedIndex == null ? { kind: 'map' } : { kind: 'freed', index: freedIndex });
  };

  if (phase.kind === 'hero') return <HeroCard scores={phase.scores} onContinue={() => go({ name: 'hub' })} name={student.name} />;

  if (phase.kind === 'welcome')
    return (
      <Shell>
        <div className="text-center">
          <div className="animate-float text-7xl">{student.avatar}</div>
          <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">The Trial of Five Realms</h1>
          <p className="mx-auto mt-3 max-w-md text-white/80">
            Glitches have taken over five realms. Defend each castle and answer the challenges to free the realm — every realm you free reveals one of your hidden
            powers. Some challenges are easy, some are very tricky. That's how the Oracle discovers what you can do!
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-4xl">
            {PLACEMENT_SECTIONS.map((s) => (
              <span key={s.id} title={s.title}>
                {REALMS[s.id].art}
              </span>
            ))}
          </div>
          <Button variant="game" className="mt-8 px-8 py-4 text-xl" onClick={() => setPhase({ kind: 'map' })}>
            Show me the realms →
          </Button>
        </div>
      </Shell>
    );

  if (phase.kind === 'freed') {
    const sec = state.sections[phase.index];
    const def = PLACEMENT_SECTIONS[phase.index];
    const power = Math.round(sec.ability);
    return (
      <Shell>
        <div className="w-full max-w-md animate-pop rounded-3xl bg-slate-950/80 p-8 text-center ring-1 ring-white/10">
          <div className="text-7xl">{REALMS[def.id].art}</div>
          <h1 className="mt-3 font-display text-3xl font-bold">{def.title} is free!</h1>
          <p className="mt-2 text-white/70">A power awakens…</p>
          <div className="mt-5 rounded-2xl bg-white/5 p-4">
            <div className="flex items-center justify-between font-display text-lg font-semibold">
              <span>{REALMS[def.id].power}</span>
              <span className="tabular-nums">{power}</span>
            </div>
            <Progress value={power} className="mt-2 bg-white/10" color="linear-gradient(90deg,#fbbf24,#f472b6)" label={REALMS[def.id].power} />
            <p className="mt-2 text-xs text-white/60">Quests will make this power grow.</p>
          </div>
          <p className="mt-4 font-display text-2xl font-bold">🪙 +{REALM_COINS}</p>
          <Button variant="game" className="mt-6 w-full py-4 text-lg" onClick={() => setPhase({ kind: 'map' })}>
            Back to the realms →
          </Button>
        </div>
      </Shell>
    );
  }

  if (phase.kind === 'realm') {
    const index = state.sectionIndex;
    const def = PLACEMENT_SECTIONS[index];
    const answered = state.sections[index].answers.length;
    return (
      <BattleArena
        key={def.id}
        title={`${REALMS[def.id].art} ${def.title}`}
        subtitle="Trial of Five Realms"
        progress={{ value: answered, max: def.questionCount, label: 'Realm freed' }}
        // Enemies keep coming until the realm's challenges are done; then a final strike frees it.
        config={{ towers: ['pawn', 'rook'], enemies: 200, hasBoss: false, firstSpawn: 9000, spawnInterval: 12000, noDefeat: true, startEnergy: 100 }}
        hint="Answer challenges to earn ⚡ energy, then tap the board to build towers. The Oracle protects your castle here — it can't fall!"
        retreatText="Your progress in this realm is saved. You can continue later."
        onActivity={() => timer.current?.poke()}
        nextQuestion={() => {
          const q = nextPlacementQuestion(stateRef.current);
          return q ? present(q) : null;
        }}
        onAnswered={(q, correct, ms) => {
          const answer = { questionId: q.id, conceptId: q.conceptId, difficulty: q.difficulty, correct, msSpent: ms };
          const next = recordPlacementAnswer(stateRef.current, answer);
          update(next);
          void repo.savePlacementProgress(student.id, next, answer);
          streak.current = correct ? streak.current + 1 : 0;
          return { streak: streak.current, done: next.sectionIndex !== index };
        }}
        onEnd={(_victory, retreated) => void leaveRealm(retreated ? null : index)}
      />
    );
  }

  // Realm map
  return (
    <Shell>
      <div className="w-full max-w-2xl">
        <h1 className="text-center font-display text-3xl font-bold">The Five Realms</h1>
        <p className="mt-1 text-center text-white/70">Free them one by one. You can rest between realms — your progress is saved.</p>
        <ol className="mt-8 space-y-3">
          {PLACEMENT_SECTIONS.map((def, i) => {
            const freed = i < state.sectionIndex;
            const current = i === state.sectionIndex;
            const started = current && state.sections[i].answers.length > 0;
            return (
              <li
                key={def.id}
                className={cx(
                  'flex items-center gap-4 rounded-2xl p-4 ring-2',
                  freed ? 'bg-emerald-500/10 ring-emerald-400/40' : current ? 'bg-white/10 ring-amber-400' : 'bg-white/5 ring-white/10 opacity-60',
                )}
              >
                <span className="text-4xl">{freed ? '✅' : REALMS[def.id].art}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-xl font-semibold">{def.title}</div>
                  <div className="text-sm text-white/70">
                    {freed ? (
                      <>
                        {REALMS[def.id].power}: <b className="tabular-nums">{Math.round(state.sections[i].ability)}</b>
                      </>
                    ) : current ? (
                      REALMS[def.id].story
                    ) : (
                      '🔒 Free the realm before it'
                    )}
                  </div>
                </div>
                {current && (
                  <Button variant="game" className="shrink-0 px-5 py-3" onClick={enterRealm}>
                    {started ? 'Continue' : 'Enter'} →
                  </Button>
                )}
              </li>
            );
          })}
        </ol>
        {state.sectionIndex > 0 && (
          <button onClick={logout} className="mx-auto mt-6 block text-sm text-white/60 hover:underline">
            Rest for now (come back later)
          </button>
        )}
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-gradient-to-b from-indigo-700 via-violet-800 to-slate-950 p-4 text-white sm:p-8">
      <Stars />
      <div className="relative flex w-full justify-center">{children}</div>
    </div>
  );
}

/** Results shown as RPG attributes — progress should feel like levelling up, not a test score. */
function HeroCard({ scores, onContinue, name }: { scores: PlacementScores; onContinue: () => void; name: string }) {
  const stats = useMemo(
    () => [
      { label: 'Word Power', icon: '🏹', v: scores.english.vocabulary },
      { label: 'Sentence Craft', icon: '⚒️', v: scores.english.grammar },
      { label: 'Echo Sense', icon: '🦇', v: scores.english.listening },
      { label: 'Tablet Reading', icon: '🧩', v: scores.english.reading },
      { label: 'Number Might', icon: '🔢', v: scores.math.number },
      { label: 'Algebra Arcana', icon: '✖️', v: scores.math.algebra },
      { label: 'Shape Sight', icon: '🔺', v: scores.math.geometry },
      { label: 'Logic Mind', icon: '♞', v: scores.math.logic },
    ],
    [scores],
  );
  const best = [...stats].sort((a, b) => b.v - a.v)[0];
  return (
    <Shell>
      <div className="w-full max-w-lg animate-pop rounded-3xl bg-gradient-to-b from-amber-200 to-amber-400 p-1 shadow-2xl">
        <div className="rounded-[22px] bg-slate-950 p-6 text-white">
          <p className="text-center text-sm font-bold uppercase tracking-widest text-amber-300">Hero card unlocked</p>
          <h1 className="mt-1 text-center font-display text-3xl font-bold">{name}</h1>
          <p className="mt-1 text-center text-white/70">
            Signature power: {best.icon} <b>{best.label}</b>
          </p>
          <div className="mt-6 space-y-3">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="w-6 text-center">{s.icon}</span>
                <span className="w-32 text-sm font-semibold">{s.label}</span>
                <Progress value={s.v} className="bg-white/10" color={s.v >= 70 ? '#34d399' : s.v >= 45 ? '#fbbf24' : '#f472b6'} label={s.label} />
                <span className="w-8 text-right text-sm tabular-nums text-white/80">{s.v}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-white/70">Every quest you finish makes these powers grow.</p>
          <Button variant="game" className="mt-4 w-full py-4 text-lg" onClick={onContinue}>
            Start my adventure →
          </Button>
        </div>
      </div>
    </Shell>
  );
}
