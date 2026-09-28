import { useEffect, useRef, useState } from 'react';
import type { PresentedQuestion } from '@atlas/knowledge';
import { getConcept } from '@atlas/knowledge';
import { cx } from '@atlas/ui';
import { speak, stopSpeaking } from '../lib/speech';

interface Props {
  question: PresentedQuestion;
  onAnswer: (correct: boolean, msSpent: number) => void;
  /** How long feedback stays before the next question (ms). */
  feedbackMs?: number;
  compact?: boolean;
  /** Hide right/wrong reveal (placement test shows neutral feedback). */
  neutral?: boolean;
}

const KEYS = ['1', '2', '3', '4'];

/** One question, rendered as a game action. Keyboard: 1–4 to answer, R to replay audio. */
export function QuestionCard({ question: q, onAnswer, feedbackMs = 1100, compact, neutral }: Props) {
  const [picked, setPicked] = useState<number | null>(null);
  const [showPassage, setShowPassage] = useState(true);
  const shownAt = useRef(performance.now());
  const done = useRef(false);

  useEffect(() => {
    setPicked(null);
    done.current = false;
    shownAt.current = performance.now();
    setShowPassage(true);
    if (q.audio) {
      const t = setTimeout(() => speak(q.audio!), 350);
      return () => {
        clearTimeout(t);
        stopSpeaking();
      };
    }
  }, [q.id, q.audio]);

  const choose = (i: number) => {
    if (done.current) return;
    done.current = true;
    setPicked(i);
    const correct = i === q.correct;
    const ms = Math.round(performance.now() - shownAt.current);
    const wait = neutral ? 350 : correct ? feedbackMs * 0.6 : feedbackMs + (q.explanation ? 1400 : 600);
    setTimeout(() => onAnswer(correct, ms), wait);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const i = KEYS.indexOf(e.key);
      if (i >= 0 && i < q.shown.length) choose(i);
      if ((e.key === 'r' || e.key === 'R') && q.audio) speak(q.audio);
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  const answered = picked !== null;
  const wrong = answered && picked !== q.correct;
  const concept = getConcept(q.conceptId);

  return (
    <div className={cx('animate-pop', wrong && !neutral && 'animate-shake')} key={q.id}>
      {q.passage && (
        <div className="mb-3 rounded-xl bg-amber-50 p-3 text-sm leading-relaxed text-amber-950 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-100 dark:ring-amber-900">
          <button className="mb-1 text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300" onClick={() => setShowPassage((s) => !s)}>
            📜 Ancient tablet {showPassage ? '▾' : '▸'}
          </button>
          {showPassage && <p className="max-h-40 overflow-y-auto">{q.passage}</p>}
        </div>
      )}
      {q.audio && (
        <button
          onClick={() => speak(q.audio!)}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-100 py-3 font-display text-lg font-semibold text-violet-800 hover:bg-violet-200 dark:bg-violet-950 dark:text-violet-200"
        >
          🔊 Play echo <span className="text-xs font-normal opacity-70">(R)</span>
        </button>
      )}
      <p className={cx('font-display font-semibold leading-snug', compact ? 'text-lg' : 'text-xl sm:text-2xl')}>{q.prompt}</p>
      <div className={cx('mt-4 grid gap-2', q.shown.length === 3 ? 'grid-cols-3' : 'grid-cols-1 sm:grid-cols-2')}>
        {q.shown.map((opt, i) => {
          const isCorrect = i === q.correct;
          const state = !answered ? 'idle' : neutral ? (i === picked ? 'picked' : 'dim') : isCorrect ? 'right' : i === picked ? 'wrong' : 'dim';
          return (
            <button
              key={i}
              disabled={answered}
              onClick={() => choose(i)}
              className={cx(
                'group flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-left text-base font-semibold ring-2 transition active:scale-[0.98]',
                state === 'idle' && 'bg-white ring-slate-200 hover:ring-brand-400 hover:bg-brand-50 dark:bg-slate-800 dark:ring-slate-700 dark:hover:bg-slate-700',
                state === 'right' && 'bg-emerald-500 text-white ring-emerald-600',
                state === 'wrong' && 'bg-rose-500 text-white ring-rose-600',
                state === 'picked' && 'bg-brand-500 text-white ring-brand-600',
                state === 'dim' && 'bg-white opacity-50 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700',
              )}
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-black/5 text-xs font-bold dark:bg-white/10">{i + 1}</span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
      {wrong && !neutral && (
        <div className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-900 dark:bg-rose-950/50 dark:text-rose-100">
          <b>Answer:</b> {q.shown[q.correct]}
          {q.explanation && <div className="mt-1">{q.explanation}</div>}
          {!q.explanation && concept?.lesson && <div className="mt-1 opacity-80">💡 {concept.lesson}</div>}
          <div className="mt-1 text-xs opacity-70">🔁 This will come back in a review quest.</div>
        </div>
      )}
    </div>
  );
}
