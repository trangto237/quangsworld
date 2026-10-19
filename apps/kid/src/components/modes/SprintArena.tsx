import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SprintSim, sprintConfigFor } from '@atlas/game';
import type { PresentedQuestion } from '@atlas/knowledge';
import { isTypedAnswerCorrect, orderTokens } from '@atlas/shared';
import { Button, cx } from '@atlas/ui';
import { QuestionCard } from '../QuestionCard';
import { stopSpeaking } from '../../lib/speech';
import { T, TB } from '../../i18n';
import { GameShell, Hearts, Pill } from './GameShell';
import { PromptPanel } from './PromptPanel';
import type { ModeProps } from './types';

const BLOCK_COLORS = ['#f97316', '#eab308', '#22c55e', '#06b6d4', '#6366f1', '#d946ef', '#f43f5e'];
const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);

/**
 * Sentence Sprint: put the word tiles in order before the clock runs out. Every right sentence adds a
 * stage to the rocket; finish it to launch. Keys: 1–9 place a tile, Backspace undo, Enter check.
 * Other kinds of questions that arrive here are answered on a normal card (no clock).
 */
export function SprintArena(p: ModeProps) {
  const sim = useMemo(() => new SprintSim({ ...sprintConfigFor(p.minutes), noDefeat: p.trial, endless: p.trial }), [p.minutes, p.trial]);
  const [question, setQuestion] = useState<PresentedQuestion | null>(null);
  const [built, setBuilt] = useState<number[]>([]);
  const [left, setLeft] = useState(1);
  const [result, setResult] = useState<null | { correct: boolean; text: string; timeout?: boolean }>(null);
  const [streak, setStreak] = useState(0);
  const [launching, setLaunching] = useState(false);
  const [, force] = useState(0);
  const ended = useRef(false);
  const startedAt = useRef(performance.now());
  const duration = useRef(30_000);
  const props = useRef(p);
  props.current = p;

  const isOrder = question?.type === 'order';
  const end = useCallback((victory: boolean, retreated: boolean) => {
    if (ended.current) return;
    ended.current = true;
    stopSpeaking();
    props.current.onEnd(victory, retreated);
  }, []);

  const load = useCallback(() => {
    const q = props.current.nextQuestion();
    setQuestion(q);
    setBuilt([]);
    setResult(null);
    setLeft(1);
    startedAt.current = performance.now();
    if (q?.type === 'order') duration.current = sim.timeFor(q.shown.length);
  }, [sim]);

  useEffect(() => {
    load();
    return () => {
      stopSpeaking();
    };
  }, [load]);

  const builtText = (b = built) => {
    if (!question) return '';
    const words = b.map((i, k) => (k === 0 ? cap(question.shown[i]) : question.shown[i]));
    return words.join(' ') + (b.length ? orderTokens(question.options[question.answer]).end : '');
  };

  const after = (correct: boolean, r: { streak: number; done?: boolean }, delay: number) => {
    setStreak(r.streak);
    const outcome = sim.answer(correct, left);
    if (r.done) sim.finale();
    force((n) => n + 1);
    if (sim.status === 'won') {
      setLaunching(true);
      setTimeout(() => end(true, false), 1800);
    } else if (sim.status === 'lost') setTimeout(() => end(false, false), 1600);
    else setTimeout(load, outcome === 'floor' ? delay : delay + 600);
  };

  const check = (timeout = false) => {
    if (!question || result || ended.current) return;
    const text = builtText();
    const correct = !timeout && isTypedAnswerCorrect(question, text);
    setResult({ correct, text, timeout });
    p.onActivity?.();
    const r = p.onAnswered(question, correct, Math.round(performance.now() - startedAt.current), text);
    after(correct, r, correct ? 900 : 2600);
  };

  // The clock (order questions only); paused while the tab is hidden.
  useEffect(() => {
    if (!question || !isOrder || result) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      if (document.visibilityState !== 'visible') startedAt.current += now - last;
      last = now;
      const l = Math.max(0, 1 - (now - startedAt.current) / duration.current);
      setLeft(l);
      if (l <= 0) {
        check(true);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, result]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!question || !isOrder || result) return;
      if (e.target instanceof HTMLInputElement) return;
      const n = /^[1-9]$/.test(e.key) ? +e.key - 1 : -1;
      if (n >= 0 && n < question.shown.length && !built.includes(n)) setBuilt((b) => [...b, n]);
      else if (e.key === 'Backspace') setBuilt((b) => b.slice(0, -1));
      else if (e.key === 'Enter' && built.length === question.shown.length) check();
      else if (e.key === 'Escape') setBuilt([]);
      else return;
      e.preventDefault();
      p.onActivity?.();
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  const goal = sim.cfg.endless ? Math.max(sim.floors + 2, 6) : sim.cfg.goal;

  return (
    <GameShell
      title={p.title}
      subtitle={p.subtitle ?? 'Sentence Sprint'}
      progress={p.progress ?? { value: sim.floors, max: goal, label: 'Rocket built' }}
      retreatText={p.retreatText}
      onLeave={() => end(false, true)}
      className="bg-gradient-to-b from-indigo-950 via-violet-950 to-slate-950"
      stats={
        <>
          <Hearts n={sim.hearts} max={sim.maxHearts} />
          <Pill className="bg-amber-400/20 text-amber-300" title="Score">
            ⭐ {sim.score}
          </Pill>
          <Pill title="Answer streak">🔥 {streak}</Pill>
        </>
      }
    >
      <div className="flex flex-1 flex-col-reverse lg:flex-row">
        {/* Launch pad */}
        <div className="relative flex min-h-[220px] items-end justify-center overflow-hidden px-4 pb-4 lg:w-[300px] lg:shrink-0">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(167,139,250,0.25),transparent_60%)]" />
          <div className="absolute inset-x-0 bottom-0 h-4 bg-slate-700" />
          <div className={cx('relative flex flex-col-reverse items-center transition-transform duration-[1600ms] ease-in', launching && '-translate-y-[120vh]')}>
            {Array.from({ length: Math.min(goal, 14) }, (_, i) => (
              <div
                key={i}
                className={cx('h-5 w-20 rounded-sm border transition-all duration-500', i < sim.floors ? 'border-white/30' : 'border-dashed border-white/20 bg-transparent')}
                style={i < sim.floors ? { background: BLOCK_COLORS[i % BLOCK_COLORS.length] } : undefined}
              />
            ))}
            <div className={cx('text-5xl leading-none transition-transform', launching && 'animate-pulse')} aria-hidden>
              🚀
            </div>
            {launching && <div className="mt-[-4px] text-4xl">🔥</div>}
          </div>
        </div>

        {/* Workbench */}
        <div className="flex flex-1 flex-col gap-3 p-4">
          {question && !isOrder && (
            <div className="mx-auto w-full max-w-2xl rounded-2xl bg-slate-100 p-4 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
              <QuestionCard question={question} onAnswer={(correct, ms, picked) => {
                if (ended.current) return;
                p.onActivity?.();
                after(correct, p.onAnswered(question, correct, ms, picked), 300);
              }} wrongNote={p.wrongNote} glossary={p.glossary ? p.glossary(question) : true} />
            </div>
          )}
          {question && isOrder && (
            <div className="mx-auto w-full max-w-3xl space-y-3">
              <div className="h-2.5 overflow-hidden rounded-full bg-white/10" aria-label="Time left">
                <div className={cx('h-full transition-[width] duration-100', left > 0.35 ? 'bg-gradient-to-r from-emerald-400 to-cyan-400' : 'bg-gradient-to-r from-rose-500 to-orange-400')} style={{ width: `${left * 100}%` }} />
              </div>
              <PromptPanel q={question} glossary={p.glossary ? p.glossary(question) : true} />
              {/* Sentence line */}
              <div
                className={cx(
                  'flex min-h-16 flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed p-3 transition-colors',
                  !result && 'border-white/30 bg-white/5',
                  result?.correct && 'border-emerald-400 bg-emerald-500/20',
                  result && !result.correct && 'animate-shake border-rose-400 bg-rose-500/20',
                )}
                aria-label="Your sentence"
              >
                {built.length === 0 && !result && <span className="px-1 text-sm text-white/50"><T en="Tap the words in order (or press their numbers)…" /></span>}
                {built.map((i, k) => (
                  <button key={k} disabled={!!result} onClick={() => setBuilt(built.filter((_, j) => j !== k))} className="animate-pop rounded-xl bg-amber-300 px-3 py-2 text-lg font-bold text-amber-950 shadow-[0_3px_0_#b45309]">
                    {k === 0 ? cap(question.shown[i]) : question.shown[i]}
                  </button>
                ))}
                {built.length > 0 && <span className="text-2xl font-bold">{orderTokens(question.options[question.answer]).end}</span>}
              </div>
              {/* Tiles */}
              <div className="flex flex-wrap gap-2">
                {question.shown.map((w, i) => (
                  <button
                    key={i}
                    disabled={!!result || built.includes(i)}
                    onClick={() => {
                      setBuilt([...built, i]);
                      p.onActivity?.();
                    }}
                    className={cx(
                      'relative rounded-xl px-3 py-2 text-lg font-bold shadow-[0_3px_0_rgba(0,0,0,0.35)] transition active:translate-y-0.5',
                      built.includes(i) ? 'bg-white/10 text-white/20 shadow-none' : 'bg-white text-slate-900 hover:bg-amber-100',
                    )}
                  >
                    {i < 9 && <span className="absolute -left-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-indigo-600 text-[10px] text-white">{i + 1}</span>}
                    {w}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" disabled={!!result || !built.length} onClick={() => setBuilt(built.slice(0, -1))}>
                  <TB en="↩ Undo" />
                </Button>
                <Button variant="game" className="flex-1 py-3" disabled={!!result || built.length !== question.shown.length} onClick={() => check()}>
                  <TB en="Launch stage! (Enter)" />
                </Button>
              </div>
              {result && (
                <div className={cx('animate-pop rounded-xl p-3 text-sm', result.correct ? 'bg-emerald-500/20 text-emerald-100' : 'bg-rose-500/20 text-rose-100')}>
                  <b className="text-base">{result.correct ? <T en="✓ Stage added!" /> : result.timeout ? <T en="⏰ Time's up!" /> : <T en="✗ Not quite." />}</b>
                  {!result.correct && (
                    <p className="mt-1">
                      ✓ <b>{question.options[question.answer]}</b>
                    </p>
                  )}
                  {!result.correct && question.explanation && <p className="mt-1 opacity-80">💡 {question.explanation}</p>}
                  {!result.correct && p.wrongNote && (
                    <p className="mt-1 opacity-70">
                      <T en={p.wrongNote} />
                    </p>
                  )}
                </div>
              )}
              <p className="hidden text-center text-xs text-white/40 lg:block">
                <T en="1–9 place a word · Backspace undo · Esc clear · Enter launch" />
              </p>
            </div>
          )}
        </div>
      </div>
    </GameShell>
  );
}
