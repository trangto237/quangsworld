import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RunnerSim, runnerConfigFor } from '@atlas/game';
import { translatePrompt, type PresentedQuestion } from '@atlas/knowledge';
import { Marked, cx, FigureView } from '@atlas/ui';
import { hashString, isFreeAnswer } from '@atlas/shared';
import { playQuestionAudio, stopSpeaking } from '../../lib/speech';
import { QuestionCard, SignBox } from '../QuestionCard';
import { T, useLang } from '../../i18n';
import { GlossText } from '../GlossText';
import { GameShell, Hearts, Pill } from './GameShell';
import { HeroSprite } from './look';
import type { ModeProps } from './types';

type Side = 'left' | 'right';

/**
 * Temple Run: the hero sprints along a temple path. Ahead the path splits: one way has the right
 * answer, the other a wrong one. Swipe (or tap a side, or press ← →) to turn. The wrong way crumbles
 * and the hero falls; not turning at all runs off the edge. The fork comes faster the less there is to read.
 */
export function TempleArena(p: ModeProps) {
  const lang = useLang();
  const sim = useMemo(() => new RunnerSim({ ...runnerConfigFor(p.minutes), noDefeat: p.trial, endless: p.trial, pace: p.trial ? 1.35 : 1 }), [p.minutes, p.trial]);
  const [question, setQuestion] = useState<PresentedQuestion | null>(null);
  const [progress, setProgress] = useState(0); // 0 = fork on the horizon, 1 = fork reached
  const [chosen, setChosen] = useState<Side | null>(null);
  const [outcome, setOutcome] = useState<null | { correct: boolean; side: Side | null }>(null);
  const [revived, setRevived] = useState(false);
  const [showVi, setShowVi] = useState(lang === 'vi');
  const [streak, setStreak] = useState(0);
  const [, force] = useState(0);
  const ended = useRef(false);
  const startedAt = useRef(performance.now());
  const duration = useRef(8000);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const props = useRef(p);
  props.current = p;

  /** The two ways at the fork: the right answer and one wrong one, on sides that change each time. */
  const fork = useMemo(() => {
    if (!question || isFreeAnswer(question)) return null;
    const h = hashString(question.id);
    const wrongs = question.shown.map((_, i) => i).filter((i) => i !== question.correct);
    const wrong = wrongs[h % wrongs.length];
    const rightOnLeft = (h >> 3) % 2 === 0;
    return rightOnLeft ? { left: question.correct, right: wrong } : { left: wrong, right: question.correct };
  }, [question]);

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
    setChosen(null);
    setProgress(0);
    setShowVi(lang === 'vi');
    if (!q) return;
    const two = q.shown.filter((_, i) => i === q.correct).concat(q.shown.filter((_, i) => i !== q.correct).slice(0, 1));
    duration.current = sim.gateTime(q.prompt.length + (q.passage?.length ?? 0) / 3, two.join('').length * 2) + (q.audio ? 3000 : 0);
    startedAt.current = performance.now();
    if ((q.audio || q.script) && !isFreeAnswer(q)) setTimeout(() => playQuestionAudio(q), 300);
  }, [sim, lang]);

  useEffect(() => {
    load();
    return () => {
      stopSpeaking();
    };
  }, [load]);

  const decide = (side: Side | null, free?: { correct: boolean; text: string; ms: number }) => {
    if (!question || outcome || ended.current) return;
    const idx = side && fork ? fork[side] : -1;
    const correct = free ? free.correct : idx === question.correct;
    setChosen(side);
    setOutcome({ correct, side });
    p.onActivity?.();
    const r = p.onAnswered(question, correct, free ? free.ms : Math.round(performance.now() - startedAt.current), free ? free.text : idx >= 0 ? question.shown[idx] : '');
    setStreak(r.streak);
    const before = sim.revived;
    sim.pass(correct);
    if (sim.revived > before) {
      setRevived(true);
      setTimeout(() => setRevived(false), 1800);
    }
    if (r.done) sim.finale();
    force((n) => n + 1);
    setTimeout(() => {
      if (sim.status === 'won') end(true, false);
      else if (sim.status === 'lost') end(false, false);
      else load();
    }, correct ? 900 : 1700);
  };

  // The fork comes closer; reaching it without turning means running off the edge.
  useEffect(() => {
    if (!question || outcome || isFreeAnswer(question)) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      if (document.visibilityState !== 'visible') startedAt.current += now - last; // pause while hidden
      last = now;
      const t = Math.min(1, (now - startedAt.current) / duration.current);
      setProgress(t);
      if (t >= 1) return decide(null);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, outcome]);

  // Keys: ← → (or A D, 1 2) turn; R replays audio.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!question || outcome || isFreeAnswer(question)) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || e.key === '1') decide('left');
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D' || e.key === '2') decide('right');
      else if ((e.key === 'r' || e.key === 'R') && (question.audio || question.script)) playQuestionAudio(question);
      else return;
      e.preventDefault();
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  const vi = question && lang !== 'en' ? (question.promptVi ?? translatePrompt(question.prompt, question.conceptId)) : null;
  const gloss = !!question && lang !== 'en' && (p.glossary ? p.glossary(question) : true) && !question.conceptId.startsWith('en.vocab') && !question.conceptId.startsWith('custom.');

  // Perspective: the fork starts small on the horizon and rushes toward the runner.
  const eased = outcome ? 1 : progress * progress;
  const forkY = 14 + eased * 50; // % from the top, where the cross path meets the trunk
  const scale = 0.35 + 0.65 * eased;
  const half = (y: number) => 9 + ((y - 14) / 86) * 36; // half the path's width at a height (%)
  const fell = outcome && !outcome.correct && !isFreeAnswer(question!);
  const label = (i: number) => question?.shown[i] ?? '';

  return (
    <GameShell
      title={p.title}
      subtitle={p.subtitle ?? 'Temple Run'}
      progress={p.progress ?? { value: sim.passed, max: sim.cfg.gates, label: 'Temple gate' }}
      retreatText={p.retreatText}
      onLeave={() => end(false, true)}
      className={p.dress?.bg ?? 'bg-gradient-to-b from-emerald-800 via-green-950 to-stone-950'}
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
      {/* The question */}
      <div className="mx-auto w-full max-w-3xl px-4 pt-3">
        {question && isFreeAnswer(question) && (
          <div className="rounded-2xl bg-slate-100 p-4 text-slate-900 shadow-xl dark:bg-slate-900 dark:text-slate-100">
            <QuestionCard question={question} onAnswer={(correct, ms, text) => decide(null, { correct, text, ms })} wrongNote={p.wrongNote} glossary={p.glossary ? p.glossary(question) : true} />
          </div>
        )}
        {question && fork && (
          <div className="rounded-2xl bg-white/95 p-3 text-slate-900 shadow-xl dark:bg-slate-900/95 dark:text-slate-100">
            {question.sign && <SignBox text={question.sign} />}
            {question.figure && <FigureView figure={question.figure} />}
            {question.passage && (
              <p className="mb-2 max-h-24 overflow-y-auto rounded-lg bg-amber-50 p-2 text-sm text-amber-950 dark:bg-amber-950/40 dark:text-amber-100">
                <GlossText text={question.passage} enabled={gloss} />
              </p>
            )}
            <div className="flex items-start gap-2">
              {(question.audio || question.script) && (
                <button onClick={() => playQuestionAudio(question)} className="shrink-0 rounded-lg bg-violet-100 px-2 py-1 text-lg dark:bg-violet-950" aria-label="Replay audio">
                  🔊
                </button>
              )}
              <p className="flex-1 font-display text-lg font-semibold leading-snug">
                <GlossText text={question.prompt} enabled={gloss} />
              </p>
              {vi && (
                <button onClick={() => setShowVi((v) => !v)} className="shrink-0 rounded-lg px-2 py-1 text-sm ring-1 ring-slate-300 dark:ring-slate-700" aria-pressed={showVi} aria-label="Show Vietnamese instruction">
                  🇻🇳
                </button>
              )}
            </div>
            {vi && showVi && <p className="mt-1 text-sm text-rose-900 dark:text-rose-200">{vi}</p>}
            {/* Odd-one-out questions need every word, not just the two on the signs. */}
            {question.shown.length > 2 && /others|khác/i.test(question.prompt) && (
              <p className="mt-1.5 flex flex-wrap gap-1.5 text-sm">
                {question.shown.map((o, i) => (
                  <span key={i} className="rounded-md bg-slate-100 px-2 py-0.5 font-semibold dark:bg-slate-800">
                    <Marked text={o} />
                  </span>
                ))}
              </p>
            )}
            {/* The two ways, readable while the fork is still far away. */}
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm font-semibold">
              {(['left', 'right'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => decide(s)}
                  className={cx('flex items-center gap-1.5 rounded-lg px-2 py-1.5 ring-1 ring-slate-300 dark:ring-slate-700', s === 'right' && 'flex-row-reverse text-right', chosen === s && 'bg-amber-100 dark:bg-amber-900/40')}
                >
                  <span className="text-lg">{s === 'left' ? '⬅️' : '➡️'}</span>
                  <span className="min-w-0 flex-1">
                    <Marked text={label(fork[s])} />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* The temple path */}
      <div
        className="relative mx-auto mt-2 w-full max-w-3xl flex-1 touch-none select-none overflow-hidden"
        style={{ minHeight: 300 }}
        onPointerDown={(e) => (swipe.current = { x: e.clientX, y: e.clientY })}
        onPointerUp={(e) => {
          const s = swipe.current;
          swipe.current = null;
          if (!s || !fork || outcome) return;
          const dx = e.clientX - s.x;
          const r = e.currentTarget.getBoundingClientRect();
          // A swipe turns that way; a tap turns toward the side tapped.
          if (Math.abs(dx) > 30) decide(dx < 0 ? 'left' : 'right');
          else decide(e.clientX < r.left + r.width / 2 ? 'left' : 'right');
        }}
      >
        {/* Jungle walls and the drop beyond the fork */}
        <div className="absolute inset-x-0 top-0 h-[14%] bg-gradient-to-b from-emerald-900/40 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-[4%] flex justify-between px-2 text-2xl opacity-90" aria-hidden>
          <span>🌴</span>
          <span>🗿</span>
          <span className="opacity-0">.</span>
          <span>🗿</span>
          <span>🌴</span>
        </div>
        <div className="absolute inset-x-0 bg-gradient-to-b from-black/80 to-black/30" style={{ top: '14%', height: `${forkY - 14}%` }} aria-hidden />
        {/* The cross path at the fork: left and right */}
        <div
          className="temple-stones absolute inset-x-0 border-y-4 border-stone-700/70"
          style={{ top: `${forkY - 9 * scale}%`, height: `${9 * scale}%`, background: 'linear-gradient(#a8a29e, #78716c)' }}
          aria-hidden
        />
        {/* The path to the fork */}
        <div
          className="temple-stones absolute inset-x-0 bottom-0"
          style={{
            top: `${forkY}%`,
            clipPath: `polygon(${50 - half(forkY)}% 0, ${50 + half(forkY)}% 0, 95% 100%, 5% 100%)`,
            background: 'linear-gradient(#a8a29e, #57534e)',
          }}
          aria-hidden
        >
          <div className={cx('absolute inset-0', !outcome && 'temple-run-tiles')} />
        </div>
        {/* Signs over each way */}
        {fork &&
          (['left', 'right'] as const).map((s) => {
            const i = fork[s];
            const isRight = outcome && i === question!.correct;
            const isWrong = outcome && outcome.side === s && !outcome.correct;
            return (
              <div
                key={s}
                className={cx(
                  'absolute -translate-y-full rounded-lg border-[3px] px-2 py-1 text-center font-display font-bold text-white shadow-lg',
                  isRight ? 'border-emerald-200 bg-emerald-600' : isWrong ? 'border-rose-200 bg-rose-700' : chosen === s ? 'border-amber-200 bg-amber-700' : 'border-amber-900/60 bg-amber-900/90',
                )}
                style={{
                  top: `${forkY - 9 * scale - 1}%`,
                  [s]: '3%',
                  width: `${28 + 16 * scale}%`,
                  fontSize: `${0.62 + 0.38 * scale}rem`,
                }}
              >
                <div className="text-[1.3em] leading-none">{s === 'left' ? '⬅' : '➡'}</div>
                <div className="line-clamp-2 leading-tight">
                  <Marked text={label(i)} />
                </div>
                {isWrong && <div className="text-[1.6em] leading-none">💥</div>}
              </div>
            );
          })}
        {/* The runner */}
        <div
          className={cx(
            'absolute bottom-[3%] left-1/2 text-6xl transition-transform duration-500',
            fell ? 'temple-fall' : outcome?.correct && outcome.side ? '' : 'runner-bob',
          )}
          style={outcome?.correct && outcome.side ? { transform: `translate(${outcome.side === 'left' ? '-160%' : '60%'}, -60%) scale(0.7)` } : undefined}
          aria-hidden
        >
          <HeroSprite />
        </div>
        {outcome && (
          <div className={cx('absolute left-1/2 top-[38%] -translate-x-1/2 animate-pop whitespace-nowrap font-display text-3xl font-bold drop-shadow', outcome.correct ? 'text-emerald-300' : 'text-rose-300')}>
            {outcome.correct ? '+💎' : outcome.side ? <T en="💥 The path crumbled!" /> : <T en="🕳️ You ran off the edge!" />}
          </div>
        )}
        {revived && (
          <div className="absolute left-1/2 top-[50%] -translate-x-1/2 animate-pop whitespace-nowrap rounded-xl bg-amber-400/90 px-3 py-1.5 font-display text-base font-bold text-slate-900 shadow">
            <T en="✨ The Oracle restores your hearts!" />
          </div>
        )}
        {outcome && !outcome.correct && p.wrongNote && (
          <p className="absolute inset-x-0 bottom-[30%] text-center text-sm font-semibold text-rose-200">
            <T en={p.wrongNote} />
          </p>
        )}
        {!outcome && fork && progress < 0.35 && (
          <p className="pointer-events-none absolute inset-x-0 bottom-[34%] text-center text-sm font-bold text-white/80">
            <T en="Swipe ⬅ or ➡ to turn" />
          </p>
        )}
      </div>
    </GameShell>
  );
}
