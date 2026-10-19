import { useEffect, useRef, useState } from 'react';
import { translatePrompt, type PresentedQuestion } from '@atlas/knowledge';
import { Button, Marked, cx } from '@atlas/ui';
import { T, TB, useLang } from '../i18n';
import { GlossText, hasGloss } from './GlossText';
import { playQuestionAudio, stopSpeaking } from '../lib/speech';
import { isTypedAnswerCorrect, orderTokens } from '@atlas/shared';
import { Explanation } from './Explanation';
import { CoachHint } from './Coach';

export type CardMode =
  /** In battle: flash right/wrong, highlight the right option, move on quickly. Details wait for the post-battle review. */
  | 'battle'
  /** Mistake Book practice: no time pressure; a wrong answer shows the explanation and waits for "Next". */
  | 'practice';

interface Props {
  question: PresentedQuestion;
  onAnswer: (correct: boolean, msSpent: number, picked: string) => void;
  mode?: CardMode;
  compact?: boolean;
  /** Battle mode: note under a wrong answer (e.g. "Saved to your Mistake Book"). */
  wrongNote?: string;
  /**
   * Tap-a-word Vietnamese glossary on the prompt and passage. Off where it would give the answer
   * away (vocabulary items) or skew an assessment (English in the placement trial).
   */
  glossary?: boolean;
}

const KEYS = ['1', '2', '3', '4'];

/** One question, rendered as a game action. Keyboard: 1–4 to answer, R to replay audio, Enter for Next. */
export function QuestionCard({ question: q, onAnswer, mode = 'battle', compact, wrongNote, glossary = true }: Props) {
  const lang = useLang();
  const [picked, setPicked] = useState<number | null>(null);
  const [typed, setTyped] = useState('');
  const [typedResult, setTypedResult] = useState<boolean | null>(null);
  const isOrder = q.type === 'order';
  const isInput = q.type === 'input' || isOrder;
  /** Order questions: indices into q.shown, in the order the tiles were placed. */
  const [built, setBuilt] = useState<number[]>([]);
  const hasAudio = !!(q.audio || q.script?.length);
  const instructionVi = lang === 'en' ? null : translatePrompt(q.prompt, q.conceptId);
  const [showVi, setShowVi] = useState(lang === 'vi');
  const gloss = glossary && lang !== 'en' && !q.conceptId.startsWith('en.vocab') && !q.conceptId.startsWith('custom.') && !q.conceptId.startsWith('lit.');
  const [showPassage, setShowPassage] = useState(true);
  const shownAt = useRef(performance.now());
  const done = useRef(false);
  const result = useRef<{ correct: boolean; ms: number; text: string } | null>(null);

  useEffect(() => {
    setPicked(null);
    setTyped('');
    setBuilt([]);
    setTypedResult(null);
    done.current = false;
    result.current = null;
    shownAt.current = performance.now();
    setShowPassage(true);
    setShowVi(lang === 'vi');
    if (q.audio || q.script?.length) {
      const t = setTimeout(() => playQuestionAudio(q), 350);
      return () => {
        clearTimeout(t);
        stopSpeaking();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const finish = () => {
    if (result.current) onAnswer(result.current.correct, result.current.ms, result.current.text);
  };

  const choose = (i: number) => {
    if (done.current) return;
    done.current = true;
    setPicked(i);
    const correct = i === q.correct;
    result.current = { correct, ms: Math.round(performance.now() - shownAt.current), text: q.shown[i] };
    if (mode === 'practice' && !correct) return; // waits for "Next"
    setTimeout(finish, correct ? 550 : 1300);
  };

  const submitTyped = (text = typed) => {
    if (done.current || !text.trim()) return;
    done.current = true;
    const correct = isTypedAnswerCorrect(q, text);
    setTypedResult(correct);
    result.current = { correct, ms: Math.round(performance.now() - shownAt.current), text: text.trim() };
    if (mode === 'practice' && !correct) return;
    setTimeout(finish, correct ? 550 : 1800);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const i = KEYS.indexOf(e.key);
      if (i >= 0 && i < q.shown.length && !isInput) choose(i);
      if (e.key === 'Enter' && isOrder && !done.current && built.length === q.shown.length) submitTyped(builtText());
      if (e.key === 'Backspace' && isOrder && !done.current) setBuilt((b) => b.slice(0, -1));
      if ((e.key === 'r' || e.key === 'R') && hasAudio) playQuestionAudio(q);
      if (e.key === 'Enter' && mode === 'practice' && result.current && !result.current.correct) finish();
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  const builtText = () => {
    const words = built.map((i) => q.shown[i]);
    if (words.length) words[0] = words[0][0].toUpperCase() + words[0].slice(1);
    return words.join(' ') + (isOrder ? orderTokens(q.options[q.answer]).end : '');
  };
  const answered = picked !== null || typedResult !== null;
  const wrong = isInput ? typedResult === false : answered && picked !== q.correct;

  return (
    <div className={cx('animate-pop', wrong && 'animate-shake')}>
      {q.passage && (
        <div className="mb-3 rounded-xl bg-amber-50 p-3 text-sm leading-relaxed text-amber-950 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-100 dark:ring-amber-900">
          <button className="mb-1 text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300" onClick={() => setShowPassage((s) => !s)}>
            <T en="📜 Ancient tablet" /> {showPassage ? '▾' : '▸'}
          </button>
          {showPassage && (
            <p className="max-h-56 overflow-y-auto whitespace-pre-line">
              <GlossText text={q.passage} enabled={gloss} />
            </p>
          )}
        </div>
      )}
      {hasAudio && (
        <button
          onClick={() => playQuestionAudio(q)}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-100 py-3 font-display text-lg font-semibold text-violet-800 hover:bg-violet-200 dark:bg-violet-950 dark:text-violet-200"
        >
          <TB en="🔊 Play echo" /> <span className="text-xs font-normal opacity-70">(R)</span>
        </button>
      )}
      {q.sign && <SignBox text={q.sign} />}
      <div className="flex items-start gap-2">
        <p className={cx('flex-1 whitespace-pre-line font-display font-semibold leading-snug', compact ? 'text-lg' : 'text-xl sm:text-2xl')}>
          <GlossText text={q.prompt} enabled={gloss} />
        </p>
        {instructionVi && (
          <button
            onClick={() => setShowVi((v) => !v)}
            className={cx('shrink-0 rounded-lg px-2 py-1 text-sm ring-1 transition', showVi ? 'bg-rose-50 ring-rose-300 dark:bg-rose-950' : 'ring-slate-300 hover:bg-slate-100 dark:ring-slate-700 dark:hover:bg-slate-800')}
            title="Tiếng Việt"
            aria-pressed={showVi}
            aria-label="Show Vietnamese instruction"
          >
            🇻🇳
          </button>
        )}
      </div>
      {instructionVi && showVi && (
        <p lang="vi" className="mt-1.5 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-950 dark:bg-rose-950/40 dark:text-rose-100">
          {instructionVi}
        </p>
      )}
      {mode === 'practice' && !answered && q.conceptId.startsWith('en.') && (
        <div className="mt-2">
          <CoachHint key={q.id} question={q} />
        </div>
      )}
      {gloss && !answered && (hasGloss(q.prompt) || hasGloss(q.passage)) && <p className="mt-1 text-[11px] text-slate-400">Tip: chạm vào từ gạch chân để xem nghĩa tiếng Việt</p>}
      {isOrder && (
        <div className="mt-4 space-y-3">
          <div
            className={cx(
              'flex min-h-14 flex-wrap items-center gap-2 rounded-xl border-2 border-dashed p-2',
              typedResult === null && 'border-slate-300 dark:border-slate-600',
              typedResult === true && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
              typedResult === false && 'border-rose-500 bg-rose-50 dark:bg-rose-950/40',
            )}
            aria-label="Your sentence"
          >
            {built.length === 0 && <span className="px-2 text-sm text-slate-400">{lang === 'vi' ? 'Chạm vào các từ theo đúng thứ tự…' : 'Tap the words in the right order…'}</span>}
            {built.map((i, k) => (
              <button key={k} disabled={answered} onClick={() => setBuilt(built.filter((_, j) => j !== k))} className="rounded-lg bg-brand-600 px-3 py-1.5 font-semibold text-white shadow-sm">
                {k === 0 ? q.shown[i][0].toUpperCase() + q.shown[i].slice(1) : q.shown[i]}
              </button>
            ))}
            {built.length > 0 && <span className="font-bold">{orderTokens(q.options[q.answer]).end}</span>}
          </div>
          <div className="flex flex-wrap gap-2">
            {q.shown.map((w, i) => (
              <button
                key={i}
                disabled={answered || built.includes(i)}
                onClick={() => setBuilt([...built, i])}
                className={cx('rounded-lg px-3 py-1.5 font-semibold ring-2 transition', built.includes(i) ? 'opacity-25 ring-slate-200 dark:ring-slate-700' : 'bg-white ring-slate-300 hover:ring-brand-400 dark:bg-slate-800 dark:ring-slate-600')}
              >
                {w}
              </button>
            ))}
          </div>
          <Button className="w-full" disabled={answered || built.length !== q.shown.length} onClick={() => submitTyped(builtText())}>
            <TB en="Check" />
          </Button>
        </div>
      )}
      {isInput && !isOrder && (
        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            submitTyped();
          }}
        >
          <input
            autoFocus
            value={typed}
            disabled={answered}
            onChange={(e) => setTyped(e.target.value)}
            className={cx(
              'min-w-0 flex-1 rounded-xl px-4 py-3 text-base font-semibold ring-2 outline-none',
              typedResult === null && 'bg-white ring-slate-300 focus:ring-brand-500 dark:bg-slate-800 dark:ring-slate-600',
              typedResult === true && 'bg-emerald-500 text-white ring-emerald-600',
              typedResult === false && 'bg-rose-500 text-white ring-rose-600',
            )}
            placeholder="Type your answer…"
            aria-label="Your answer"
            autoComplete="off"
            spellCheck={false}
          />
          <Button type="submit" disabled={answered || !typed.trim()}>
            <TB en="Check" />
          </Button>
        </form>
      )}
      {isInput && typedResult === false && mode === 'battle' && (
        <p className="mt-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">✓ {q.options[q.answer]}</p>
      )}
      <div className={cx('mt-4 grid gap-2', q.shown.length === 3 ? 'grid-cols-3' : 'grid-cols-1 sm:grid-cols-2')}>
        {!isOrder && q.shown.map((opt, i) => {
          const state = !answered ? 'idle' : i === q.correct ? 'right' : i === picked ? 'wrong' : 'dim';
          return (
            <button
              key={i}
              disabled={answered}
              onClick={() => choose(i)}
              className={cx(
                'group flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-left text-base font-semibold ring-2 transition active:scale-[0.98]',
                state === 'idle' && 'bg-white ring-slate-200 hover:bg-brand-50 hover:ring-brand-400 dark:bg-slate-800 dark:ring-slate-700 dark:hover:bg-slate-700',
                state === 'right' && 'bg-emerald-500 text-white ring-emerald-600',
                state === 'wrong' && 'bg-rose-500 text-white ring-rose-600',
                state === 'dim' && 'bg-white opacity-50 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700',
              )}
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-black/5 text-xs font-bold dark:bg-white/10">{i + 1}</span>
              <span>
                <Marked text={opt} />
              </span>
            </button>
          );
        })}
      </div>
      {wrong && mode === 'battle' && wrongNote && (
        <p className="mt-3 text-center text-sm font-semibold text-rose-600 dark:text-rose-400">
          <T en={wrongNote} />
        </p>
      )}
      {wrong && mode === 'practice' && (
        <div className="mt-4">
          <Explanation question={q} picked={isOrder ? builtText() : isInput ? typed : q.shown[picked!]} />
          <Button className="mt-3 w-full" onClick={finish}>
            <TB en="Next" /> <span className="text-xs opacity-70">(Enter)</span>
          </Button>
        </div>
      )}
    </div>
  );
}

/** A sign or notice, drawn like a real sign. */
export function SignBox({ text }: { text: string }) {
  return (
    <div className="mx-auto mb-3 w-fit max-w-full rounded-lg border-4 border-slate-800 bg-amber-300 px-5 py-3 text-center font-display text-lg font-bold uppercase tracking-wide text-slate-900 shadow-md dark:border-slate-200">
      {text}
    </div>
  );
}
