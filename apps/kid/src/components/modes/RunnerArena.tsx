import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RunnerSim, runnerConfigFor } from '@atlas/game';
import { translatePrompt, type PresentedQuestion } from '@atlas/knowledge';
import { cx } from '@atlas/ui';
import { speak, stopSpeaking } from '../../lib/speech';
import { T, useLang } from '../../i18n';
import { GlossText } from '../GlossText';
import { GameShell, Hearts, Pill } from './GameShell';
import type { ModeProps } from './types';

const LANE_COLORS = ['#f97316', '#22c55e', '#3b82f6', '#a855f7'];
const LONG = 22;

/**
 * Word Runner: the hero runs down a road; answer gates rush toward them and the learner steers into
 * the right one (← → / A D, keys 1–4, or tap a gate). Gate speed adapts to how much there is to read.
 */
export function RunnerArena(p: ModeProps) {
  const lang = useLang();
  const sim = useMemo(() => new RunnerSim({ ...runnerConfigFor(p.minutes), noDefeat: p.trial, endless: p.trial, pace: p.trial ? 1.35 : 1 }), [p.minutes, p.trial]);
  const [question, setQuestion] = useState<PresentedQuestion | null>(null);
  const [lane, setLane] = useState(0);
  const [progress, setProgress] = useState(0); // 0 = gate at horizon, 1 = gate reached
  const [outcome, setOutcome] = useState<null | { correct: boolean; picked: number }>(null);
  const [showVi, setShowVi] = useState(lang === 'vi');
  const [streak, setStreak] = useState(0);
  const [, force] = useState(0);
  const ended = useRef(false);
  const startedAt = useRef(performance.now());
  const duration = useRef(8000);
  const laneRef = useRef(0);
  const props = useRef(p);
  props.current = p;
  laneRef.current = lane;

  const end = useCallback((victory: boolean, retreated: boolean) => {
    if (ended.current) return;
    ended.current = true;
    stopSpeaking();
    props.current.onEnd(victory, retreated);
  }, []);

  const load = useCallback(() => {
    const q = props.current.nextQuestion();
    setQuestion(q);
    setOutcome(null);
    setProgress(0);
    setShowVi(lang === 'vi');
    if (!q) return;
    setLane(Math.floor(q.shown.length / 2));
    duration.current = sim.gateTime(q.prompt.length + (q.passage?.length ?? 0) / 3, q.shown.join('').length) + (q.audio ? 3000 : 0);
    startedAt.current = performance.now();
    if (q.audio) setTimeout(() => speak(q.audio!), 300);
  }, [sim, lang]);

  useEffect(() => {
    load();
    return () => {
      stopSpeaking();
    };
  }, [load]);

  // The gate approaches; when it arrives, the current lane is the answer.
  useEffect(() => {
    if (!question || outcome) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      if (document.visibilityState !== 'visible') startedAt.current += now - last; // pause while hidden
      last = now;
      const t = Math.min(1, (now - startedAt.current) / duration.current);
      setProgress(t);
      if (t >= 1) {
        decide(laneRef.current);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, outcome]);

  const decide = (picked: number) => {
    if (!question || outcome || ended.current) return;
    const correct = picked === question.correct;
    setOutcome({ correct, picked });
    p.onActivity?.();
    const r = p.onAnswered(question, correct, Math.round(performance.now() - startedAt.current), question.shown[picked]);
    setStreak(r.streak);
    sim.pass(correct);
    if (r.done) sim.finale();
    force((n) => n + 1);
    setTimeout(() => {
      if (sim.status === 'won') end(true, false);
      else if (sim.status === 'lost') end(false, false);
      else load();
    }, correct ? 700 : 1500);
  };

  // Keyboard: arrows / A D steer; 1–4 jump to a lane; Space or Enter dashes (answer now); R replays audio.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!question || outcome) return;
      const n = question.shown.length;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') setLane((l) => Math.max(0, l - 1));
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') setLane((l) => Math.min(n - 1, l + 1));
      else if (/^[1-4]$/.test(e.key) && +e.key <= n) setLane(+e.key - 1);
      else if (e.key === ' ' || e.key === 'Enter') decide(laneRef.current);
      else if ((e.key === 'r' || e.key === 'R') && question.audio) speak(question.audio);
      else return;
      e.preventDefault();
      p.onActivity?.();
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  const n = question?.shown.length ?? 3;
  const longOptions = !!question && question.shown.some((o) => o.length > LONG);
  const eased = progress * progress; // accelerate toward the runner
  const gateTop = 12 + eased * 62; // % from top
  const spread = 0.28 + 0.72 * eased; // road widens toward the viewer
  const laneX = (i: number, s: number) => 50 + ((i + 0.5) / n - 0.5) * 100 * s * 0.92;
  const vi = question && lang !== 'en' ? translatePrompt(question.prompt, question.conceptId) : null;
  const gloss = !!question && lang !== 'en' && (p.glossary ? p.glossary(question) : true) && !question.conceptId.startsWith('en.vocab') && !question.conceptId.startsWith('custom.');

  return (
    <GameShell
      title={p.title}
      subtitle={p.subtitle ?? 'Word Runner'}
      progress={p.progress ?? { value: sim.passed, max: sim.cfg.gates, label: 'Finish line' }}
      retreatText={p.retreatText}
      onLeave={() => end(false, true)}
      className="bg-gradient-to-b from-sky-900 via-indigo-950 to-slate-950"
      stats={
        <>
          <Hearts n={sim.hearts} max={sim.maxHearts} />
          <Pill className="bg-amber-400/20 text-amber-300" title="Score">
            💎 {sim.score}
          </Pill>
          <Pill title="Answer streak">🔥 {streak}</Pill>
        </>
      }
    >
      {/* Prompt */}
      <div className="mx-auto w-full max-w-3xl px-4 pt-4">
        {question && (
          <div className="rounded-2xl bg-white/95 p-4 text-slate-900 shadow-xl dark:bg-slate-900/95 dark:text-slate-100">
            {question.passage && (
              <p className="mb-2 max-h-28 overflow-y-auto rounded-lg bg-amber-50 p-2 text-sm text-amber-950 dark:bg-amber-950/40 dark:text-amber-100">
                <GlossText text={question.passage} enabled={gloss} />
              </p>
            )}
            <div className="flex items-start gap-2">
              {question.audio && (
                <button onClick={() => speak(question.audio!)} className="shrink-0 rounded-lg bg-violet-100 px-2 py-1 text-lg dark:bg-violet-950" aria-label="Replay audio">
                  🔊
                </button>
              )}
              <p className="flex-1 font-display text-lg font-semibold leading-snug sm:text-xl">
                <GlossText text={question.prompt} enabled={gloss} />
              </p>
              {vi && (
                <button onClick={() => setShowVi((v) => !v)} className="shrink-0 rounded-lg px-2 py-1 text-sm ring-1 ring-slate-300 dark:ring-slate-700" aria-pressed={showVi} aria-label="Show Vietnamese instruction">
                  🇻🇳
                </button>
              )}
            </div>
            {vi && showVi && <p className="mt-1 text-sm text-rose-900 dark:text-rose-200">{vi}</p>}
            {/* Options are listed up front so they can be read while the gates are still far away. */}
            {(
              <ol className="mt-2 grid gap-1.5 text-sm sm:grid-cols-2">
                {question.shown.map((o, i) => (
                  <li key={i} className={cx('flex items-center gap-2 rounded-lg px-1.5 py-0.5', lane === i && 'bg-amber-100 dark:bg-amber-900/40')}>
                    <span className="grid size-6 shrink-0 place-items-center rounded text-xs font-bold text-white" style={{ background: LANE_COLORS[i] }}>
                      {i + 1}
                    </span>
                    {o}
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
      </div>

      {/* Road */}
      <div className="relative mx-auto mt-3 w-full max-w-3xl flex-1 select-none overflow-hidden" style={{ minHeight: 320 }}>
        <div
          className="absolute inset-x-0 bottom-0 top-[8%]"
          style={{ clipPath: 'polygon(36% 0, 64% 0, 100% 100%, 0 100%)', background: 'linear-gradient(#1e293b, #334155)' }}
        >
          <div className="runner-stripes absolute inset-0 opacity-40" />
        </div>
        {/* Lane taps */}
        {question &&
          question.shown.map((_, i) => (
            <button
              key={i}
              aria-label={`Lane ${i + 1}`}
              className="absolute bottom-0 top-[40%]"
              style={{ left: `${(i / n) * 100}%`, width: `${100 / n}%` }}
              onClick={() => {
                if (lane === i && !outcome) decide(i);
                else setLane(i);
              }}
            />
          ))}
        {/* Gates */}
        {question &&
          question.shown.map((o, i) => {
            const isRight = outcome && i === question.correct;
            const isWrong = outcome && i === outcome.picked && !outcome.correct;
            return (
              <button
                key={i}
                onClick={() => (lane === i ? decide(i) : setLane(i))}
                className={cx(
                  'absolute -translate-x-1/2 -translate-y-1/2 rounded-xl border-4 px-2 py-1 text-center font-display font-bold text-white shadow-lg transition-colors',
                  isRight && 'ring-4 ring-emerald-300',
                  isWrong && 'opacity-60',
                )}
                style={{
                  top: `${gateTop}%`,
                  left: `${laneX(i, spread)}%`,
                  width: `${(90 / n) * spread}%`,
                  fontSize: `${0.7 + 0.5 * eased}rem`,
                  background: isRight ? '#10b981' : isWrong ? '#e11d48' : `${LANE_COLORS[i]}dd`,
                  borderColor: lane === i ? '#fde047' : 'rgba(255,255,255,0.5)',
                }}
              >
                <span className={cx('block', progress < 0.3 ? 'text-[1.4em]' : 'text-[0.7em] opacity-80')}>{i + 1}</span>
                {progress >= 0.3 && <span className="line-clamp-2">{longOptions ? o.slice(0, 14) + (o.length > 14 ? '…' : '') : o}</span>}
              </button>
            );
          })}
        {/* Runner */}
        <div
          className={cx('absolute bottom-[4%] -translate-x-1/2 text-6xl transition-[left] duration-150', outcome && !outcome.correct ? 'animate-shake' : 'runner-bob')}
          style={{ left: `${laneX(lane, 1)}%` }}
          aria-hidden
        >
          {p.avatar ?? '🦊'}
        </div>
        {outcome && (
          <div className={cx('absolute left-1/2 top-[30%] -translate-x-1/2 animate-pop font-display text-4xl font-bold drop-shadow', outcome.correct ? 'text-emerald-300' : 'text-rose-400')}>
            {outcome.correct ? '+💎' : '💥'}
          </div>
        )}
        {outcome && !outcome.correct && p.wrongNote && (
          <p className="absolute inset-x-0 bottom-[22%] text-center text-sm font-semibold text-rose-300">
            <T en={p.wrongNote} />
          </p>
        )}
      </div>
      <p className="hidden pb-2 text-center text-xs text-white/50 lg:block">
        <T en="← → or 1–4 to steer · Space to dash through now" />
      </p>
    </GameShell>
  );
}
