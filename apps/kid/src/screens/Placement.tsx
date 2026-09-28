import { useEffect, useMemo, useRef, useState } from 'react';
import type { StudentProfile } from '@atlas/db';
import {
  answeredCount, createPlacement, currentSection, isPlacementDone, nextPlacementQuestion, recordPlacementAnswer, scorePlacement, skipSection,
  totalQuestions, type PlacementState,
} from '@atlas/engine';
import { PLACEMENT_SECTIONS, present, type PresentedQuestion } from '@atlas/knowledge';
import type { PlacementScores } from '@atlas/shared';
import { Button, Progress, useRepo } from '@atlas/ui';
import { QuestionCard } from '../components/QuestionCard';
import { ActiveTimer } from '../lib/activeTime';
import { useKid } from '../store';
import { Stars } from './ProfilePicker';

const SECTION_ART: Record<string, string> = {
  'word-hunter': '🏹',
  'sentence-forge': '⚒️',
  'echo-cave': '🦇',
  'reading-puzzle': '🧩',
  'math-logic': '🏰',
};

/**
 * The adaptive placement test, framed as "The Trial of Five Realms".
 * No levels to choose, no scores during the test — just a quest. Progress autosaves after each answer.
 */
export function Placement({ student }: { student: StudentProfile }) {
  const repo = useRepo();
  const go = useKid((s) => s.go);
  const [state, setState] = useState<PlacementState>(() => repo.getPlacementProgress(student.id) ?? createPlacement());
  const [intro, setIntro] = useState<string | null>(() => (answeredCount(state) === 0 ? 'welcome' : null));
  // Resuming mid-section skips that section's intro.
  const [seenIntro, setSeenIntro] = useState(() => new Set(state.sections.filter((x) => x.answers.length > 0).map((x) => x.id as string)));
  const [question, setQuestion] = useState<PresentedQuestion | null>(null);
  const [scores, setScores] = useState<PlacementScores | null>(null);
  const timer = useRef<ActiveTimer | null>(null);
  const section = currentSection(state);
  const sectionState = state.sections[state.sectionIndex];

  useEffect(() => {
    timer.current = new ActiveTimer();
    return () => {
      const ms = timer.current?.stop() ?? 0;
      void repo.addSession({ studentId: student.id, kind: 'placement', startedAt: timer.current!.startedAt, endedAt: Date.now(), activeMs: ms, missionTitle: 'Trial of Five Realms' });
    };
  }, [repo, student.id]);

  useEffect(() => {
    if (intro || scores) return;
    if (isPlacementDone(state)) {
      const s = scorePlacement(state);
      setScores(s);
      void repo.completePlacement(student.id, s);
      return;
    }
    if (sectionState && !seenIntro.has(sectionState.id)) {
      setIntro(sectionState.id);
      return;
    }
    const q = nextPlacementQuestion(state);
    if (!q) setState(skipSection(state));
    else setQuestion(present(q));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, intro, seenIntro]);

  const onAnswer = async (correct: boolean, msSpent: number) => {
    if (!question) return;
    timer.current?.poke();
    const answer = { questionId: question.id, conceptId: question.conceptId, difficulty: question.difficulty, correct, msSpent };
    const next = recordPlacementAnswer(state, answer);
    await repo.savePlacementProgress(student.id, next, answer);
    setQuestion(null);
    setState(next);
  };

  const done = answeredCount(state);
  const total = totalQuestions();

  if (scores) return <HeroCard scores={scores} onContinue={() => go({ name: 'hub' })} name={student.name} />;

  if (intro === 'welcome')
    return (
      <Shell>
        <div className="text-center">
          <div className="animate-float text-7xl">{student.avatar}</div>
          <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">The Trial of Five Realms</h1>
          <p className="mx-auto mt-3 max-w-md text-white/80">
            Before your adventure begins, the Oracle wants to discover your hidden powers. Five realms, about 25 minutes. Some challenges will feel easy, some
            very hard — that's how the Oracle learns. Just do your best!
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-3xl">
            {PLACEMENT_SECTIONS.map((s) => (
              <span key={s.id} title={s.title}>
                {SECTION_ART[s.id]}
              </span>
            ))}
          </div>
          <Button variant="game" className="mt-8 px-8 py-4 text-xl" onClick={() => setIntro(null)}>
            Begin the trial
          </Button>
        </div>
      </Shell>
    );

  if (intro && section)
    return (
      <Shell>
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-amber-300">
            Realm {state.sectionIndex + 1} of {PLACEMENT_SECTIONS.length}
          </p>
          <div className="mt-4 text-7xl">{SECTION_ART[section.id]}</div>
          <h1 className="mt-3 font-display text-4xl font-bold">{section.title}</h1>
          <p className="mt-2 text-white/80">{section.blurb}</p>
          <p className="mt-1 text-sm text-white/60">{section.questionCount} challenges</p>
          <Button
            variant="game"
            className="mt-8 px-8 py-4 text-xl"
            onClick={() => {
              setSeenIntro(new Set([...seenIntro, section.id]));
              setIntro(null);
            }}
          >
            Enter {section.title}
          </Button>
        </div>
      </Shell>
    );

  return (
    <Shell>
      <div className="w-full max-w-2xl">
        <div className="mb-4 flex items-center gap-3 text-sm">
          <span className="text-2xl">{section && SECTION_ART[section.id]}</span>
          <span className="font-display text-lg font-semibold">{section?.title}</span>
          <span className="ml-auto tabular-nums text-white/70">
            {done}/{total}
          </span>
        </div>
        <Progress value={done} max={total} color="linear-gradient(90deg,#fbbf24,#f472b6)" className="mb-6 bg-white/15" label="Trial progress" />
        <div className="rounded-3xl bg-white p-5 text-slate-900 shadow-2xl sm:p-7 dark:bg-slate-900 dark:text-slate-100">
          {question ? <QuestionCard question={question} onAnswer={onAnswer} neutral /> : <p className="text-center text-slate-500">…</p>}
        </div>
        <p className="mt-4 text-center text-xs text-white/50">Progress is saved automatically — you can stop and continue later.</p>
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
