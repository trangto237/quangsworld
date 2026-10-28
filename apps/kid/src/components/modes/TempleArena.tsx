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
import type { Side, TempleWorld } from './temple3d';
import type { ModeProps } from './types';

/**
 * Temple Run, in 3D: the hero sprints along a temple path through the jungle. Each question is a fork:
 * one way has the right answer on its sign, the other a wrong one. Swipe (or tap a side, or press ← →)
 * to turn — the view swings round the corner. The wrong way crumbles and he falls; running straight on
 * goes over the edge. The path to each fork is as long as the question needs to be read.
 */
export function TempleArena(p: ModeProps) {
  const lang = useLang();
  const sim = useMemo(() => new RunnerSim({ ...runnerConfigFor(p.minutes), noDefeat: p.trial, endless: p.trial, pace: p.trial ? 1.35 : 1 }), [p.minutes, p.trial]);
  const [question, setQuestion] = useState<PresentedQuestion | null>(null);
  const [chosen, setChosen] = useState<Side | null>(null);
  const [outcome, setOutcome] = useState<null | { correct: boolean; side: Side | null }>(null);
  const [revived, setRevived] = useState(false);
  const [showVi, setShowVi] = useState(lang === 'vi');
  const [streak, setStreak] = useState(0);
  const [coins, setCoins] = useState(0);
  const [, force] = useState(0);
  const ended = useRef(false);
  const startedAt = useRef(performance.now());
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const host = useRef<HTMLDivElement>(null);
  const world = useRef<TempleWorld | null>(null);
  const props = useRef(p);
  props.current = p;

  /** The two ways at the fork: the right answer and one wrong one, on sides that change each time. */
  const forkOf = (q: PresentedQuestion | null) => {
    if (!q || isFreeAnswer(q)) return null;
    const h = hashString(q.id);
    const wrongs = q.shown.map((_, i) => i).filter((i) => i !== q.correct);
    const wrong = wrongs[h % wrongs.length];
    return (h >> 3) % 2 === 0 ? { left: q.correct, right: wrong } : { left: wrong, right: q.correct };
  };
  const fork = useMemo(() => forkOf(question), [question]);
  const live = useRef<{ q: PresentedQuestion | null; fork: ReturnType<typeof forkOf> }>({ q: null, fork: null });
  live.current = { q: question, fork };

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
    setShowVi(lang === 'vi');
    if (!q) return;
    startedAt.current = performance.now();
    const f = forkOf(q);
    if (!f) {
      world.current?.setPaused(true); // typed answers: he stops and answers on a card
      return;
    }
    const two = [q.shown[f.left], q.shown[f.right]];
    const ms = sim.gateTime(q.prompt.length + (q.passage?.length ?? 0) / 3, two.join('').length * 2) + (q.audio ? 3000 : 0);
    world.current?.newFork(ms / 1000, { left: q.shown[f.left], right: q.shown[f.right] });
    if (q.audio || q.script) setTimeout(() => playQuestionAudio(q), 300);
  }, [sim, lang]);

  const afterAnswer = (correct: boolean, side: Side | null, free?: { text: string; ms: number }) => {
    const { q, fork: f } = live.current;
    if (!q || ended.current) return;
    setOutcome({ correct, side });
    const r = props.current.onAnswered(q, correct, free ? free.ms : Math.round(performance.now() - startedAt.current), free ? free.text : side && f ? q.shown[f[side]] : '');
    setStreak(r.streak);
    const before = sim.revived;
    sim.pass(correct);
    if (sim.revived > before) {
      setRevived(true);
      setTimeout(() => setRevived(false), 1800);
    }
    if (r.done) sim.finale();
    force((n) => n + 1);
    const next = () => {
      if (sim.status === 'won') end(true, false);
      else if (sim.status === 'lost') end(false, false);
      else load();
    };
    if (free || !f) {
      world.current?.setPaused(false);
      setTimeout(next, correct ? 500 : 1300);
    } else world.current?.resolve(side, f.left === q.correct ? 'left' : 'right', next);
  };

  // The 3D world lives as long as the game.
  // (Three.js is loaded only when this game starts.)
  useEffect(() => {
    let alive = true;
    let w: TempleWorld | null = null;
    void import('./temple3d')
      .then(({ TempleWorld }) => {
        if (!alive || !host.current) return;
        w = new TempleWorld(host.current);
        world.current = w;
        w.onCoin = () => setCoins((c) => c + 1);
        w.onFork = (side) => {
          const { q, fork: f } = live.current;
          if (!q || !f) return;
          props.current.onActivity?.();
          afterAnswer(!!side && f[side] === q.correct, side);
        };
      })
      .catch(() => {
        /* no WebGL: the question panel still works by tapping the two ways */
      })
      .finally(() => alive && load());
    return () => {
      alive = false;
      stopSpeaking();
      w?.dispose();
      world.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const choose = (side: Side) => {
    if (!fork || outcome) return;
    setChosen(side);
    if (world.current) world.current.choose(side);
    else afterAnswer(fork[side] === question!.correct, side);
  };

  // Keys: ← → (or A D, 1 2) turn; R replays audio.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!question || outcome || isFreeAnswer(question)) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || e.key === '1') choose('left');
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D' || e.key === '2') choose('right');
      else if ((e.key === 'r' || e.key === 'R') && (question.audio || question.script)) playQuestionAudio(question);
      else return;
      e.preventDefault();
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  const vi = question && lang !== 'en' ? (question.promptVi ?? translatePrompt(question.prompt, question.conceptId)) : null;
  const gloss = !!question && lang !== 'en' && (p.glossary ? p.glossary(question) : true) && !question.conceptId.startsWith('en.vocab') && !question.conceptId.startsWith('custom.');

  return (
    <GameShell
      title={p.title}
      subtitle={p.subtitle ?? 'Temple Run'}
      progress={p.progress ?? { value: sim.passed, max: sim.cfg.gates, label: 'Temple gate' }}
      retreatText={p.retreatText}
      onLeave={() => end(false, true)}
      className={p.dress?.bg ?? 'bg-gradient-to-b from-emerald-800 via-green-950 to-stone-950'}
      fit
      stats={
        <>
          <Hearts n={sim.hearts} max={sim.maxHearts} />
          <Pill className="bg-amber-400/20 text-amber-300" title="Coins">
            🪙 {coins}
          </Pill>
          <Pill title="Answer streak">🔥 {streak}</Pill>
        </>
      }
    >
      <div className="relative min-h-0 flex-1">
        {/* The 3D temple run fills the screen; swipe anywhere on it to turn. */}
        <div
          ref={host}
          className="absolute inset-0 touch-none select-none"
          onPointerDown={(e) => (swipe.current = { x: e.clientX, y: e.clientY })}
          onPointerUp={(e) => {
            const s = swipe.current;
            swipe.current = null;
            if (!s || !fork || outcome) return;
            const dx = e.clientX - s.x;
            const r = e.currentTarget.getBoundingClientRect();
            if (Math.abs(dx) > 30) choose(dx < 0 ? 'left' : 'right');
            else choose(e.clientX < r.left + r.width / 2 ? 'left' : 'right');
          }}
        />

        {/* The question, over the top of the run */}
        <div className="pointer-events-none absolute inset-x-0 top-0 px-3 pt-2">
          <div className="pointer-events-auto mx-auto max-w-2xl">
            {question && isFreeAnswer(question) && (
              <div className="rounded-2xl bg-slate-100 p-4 text-slate-900 shadow-xl dark:bg-slate-900 dark:text-slate-100">
                <QuestionCard question={question} onAnswer={(correct, ms, text) => afterAnswer(correct, null, { text, ms })} wrongNote={p.wrongNote} glossary={p.glossary ? p.glossary(question) : true} />
              </div>
            )}
            {question && fork && (
              <div className="rounded-2xl bg-white/90 p-2.5 text-slate-900 shadow-xl backdrop-blur dark:bg-slate-900/90 dark:text-slate-100">
                {question.sign && <SignBox text={question.sign} />}
                {question.figure && <FigureView figure={question.figure} />}
                {question.passage && (
                  <p className="mb-2 max-h-20 overflow-y-auto rounded-lg bg-amber-50 p-2 text-sm text-amber-950 dark:bg-amber-950/40 dark:text-amber-100">
                    <GlossText text={question.passage} enabled={gloss} />
                  </p>
                )}
                <div className="flex items-start gap-2">
                  {(question.audio || question.script) && (
                    <button onClick={() => playQuestionAudio(question)} className="shrink-0 rounded-lg bg-violet-100 px-2 py-1 text-lg dark:bg-violet-950" aria-label="Replay audio">
                      🔊
                    </button>
                  )}
                  <p className="flex-1 font-display text-base font-semibold leading-snug sm:text-lg">
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
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm font-semibold">
                  {(['left', 'right'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => choose(s)}
                      className={cx(
                        'flex items-center gap-1.5 rounded-lg px-2 py-1.5 ring-1 ring-slate-300 dark:ring-slate-700',
                        s === 'right' && 'flex-row-reverse text-right',
                        chosen === s && 'bg-amber-100 ring-2 ring-amber-400 dark:bg-amber-900/40',
                        outcome && fork[s] === question.correct && 'bg-emerald-100 ring-2 ring-emerald-500',
                        outcome && outcome.side === s && !outcome.correct && 'bg-rose-100 ring-2 ring-rose-500',
                      )}
                    >
                      <span className="text-lg">{s === 'left' ? '⬅️' : '➡️'}</span>
                      <span className="min-w-0 flex-1">
                        <Marked text={question.shown[fork[s]]} />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* What happened at the fork */}
        {outcome && fork && (
          <div className={cx('pointer-events-none absolute inset-x-0 top-[55%] animate-pop text-center font-display text-3xl font-bold drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]', outcome.correct ? 'text-emerald-300' : 'text-rose-300')}>
            {outcome.correct ? '✓ +💎' : outcome.side ? <T en="💥 The path crumbled!" /> : <T en="🕳️ You ran off the edge!" />}
            {!outcome.correct && p.wrongNote && (
              <p className="mt-1 text-sm font-semibold text-rose-100">
                <T en={p.wrongNote} />
              </p>
            )}
          </div>
        )}
        {revived && (
          <div className="absolute left-1/2 top-[45%] -translate-x-1/2 animate-pop whitespace-nowrap rounded-xl bg-amber-400/90 px-3 py-1.5 font-display text-base font-bold text-slate-900 shadow">
            <T en="✨ The Oracle restores your hearts!" />
          </div>
        )}
        {!outcome && fork && !chosen && (
          <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center font-display text-base font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            <T en="Swipe ⬅ or ➡ to turn" />
          </p>
        )}
      </div>
    </GameShell>
  );
}
