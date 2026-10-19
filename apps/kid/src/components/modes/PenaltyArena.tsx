import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PenaltySim, penaltyConfigFor, type PenaltyKick } from '@atlas/game';
import type { PresentedQuestion } from '@atlas/knowledge';
import { isFreeAnswer } from '@atlas/shared';
import { Marked, cx } from '@atlas/ui';
import { QuestionCard } from '../QuestionCard';
import { playQuestionAudio, stopSpeaking } from '../../lib/speech';
import { T } from '../../i18n';
import { GameShell, Pill } from './GameShell';
import { PromptPanel } from './PromptPanel';
import type { ModeProps } from './types';

/** Goal-mouth zones (left %, top %) for 2, 3 or 4 options. */
const ZONES: Record<number, [number, number][]> = {
  2: [[25, 50], [75, 50]],
  3: [[20, 30], [80, 30], [50, 70]],
  4: [[22, 30], [78, 30], [22, 72], [78, 72]],
};
const RIVALS = ['Glitch United', 'Rook Rovers', 'Pawn Pirates', 'Bishop Bandits'];

/**
 * Penalty Shootout: each question is a kick. Your kick: pick the right corner (= the right answer) to
 * score. Their kick: pick the right answer to dive the right way and save it. Best of N, then sudden death.
 */
export function PenaltyArena(p: ModeProps) {
  const sim = useMemo(() => new PenaltySim({ ...penaltyConfigFor(p.minutes), noDefeat: p.trial, endless: p.trial }), [p.minutes, p.trial]);
  const rival = useMemo(() => RIVALS[Math.floor(Math.random() * RIVALS.length)], []);
  const [question, setQuestion] = useState<PresentedQuestion | null>(null);
  const [shot, setShot] = useState<null | { kick: PenaltyKick; picked: number; correctZone: number }>(null);
  const [streak, setStreak] = useState(0);
  const [, force] = useState(0);
  const ended = useRef(false);
  const startedAt = useRef(performance.now());
  const props = useRef(p);
  props.current = p;

  const end = useCallback((victory: boolean, retreated: boolean) => {
    if (ended.current) return;
    ended.current = true;
    stopSpeaking();
    props.current.onEnd(victory, retreated);
  }, []);

  const load = useCallback(() => {
    const q = props.current.nextQuestion();
    setQuestion(q);
    setShot(null);
    startedAt.current = performance.now();
    if (q && (q.audio || q.script) && !isFreeAnswer(q)) setTimeout(() => playQuestionAudio(q), 300);
  }, []);

  useEffect(() => {
    load();
    return () => {
      stopSpeaking();
    };
  }, [load]);

  const resolve = (correct: boolean, picked: number, text: string, ms: number) => {
    if (!question || shot || ended.current) return;
    p.onActivity?.();
    const r = p.onAnswered(question, correct, ms, text);
    setStreak(r.streak);
    const res = sim.answer(correct);
    setShot({ kick: res.kick, picked, correctZone: question.correct });
    if (r.done) sim.finale();
    force((n) => n + 1);
    setTimeout(() => {
      if (sim.status === 'won') end(true, false);
      else if (sim.status === 'lost') end(false, false);
      else load();
    }, correct ? 1300 : 1900);
  };

  const pick = (i: number) => {
    if (!question || shot || isFreeAnswer(question)) return;
    resolve(i === question.correct, i, question.shown[i], Math.round(performance.now() - startedAt.current));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!question || shot || isFreeAnswer(question)) return;
      if (/^[1-4]$/.test(e.key) && +e.key <= question.shown.length) pick(+e.key - 1);
      else if ((e.key === 'r' || e.key === 'R') && (question.audio || question.script)) playQuestionAudio(question);
      else return;
      e.preventDefault();
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  const free = !!question && isFreeAnswer(question);
  const turn = shot ? (shot.kick.team === 'you' ? 'shoot' : 'save') : sim.turn;
  const zones = ZONES[Math.min(4, Math.max(2, question?.shown.length ?? 4))] ?? ZONES[4];
  // Where the ball ends up and where the keeper dives.
  const ballZone = shot ? (shot.kick.team === 'you' ? (shot.picked >= 0 ? shot.picked : shot.correctZone) : shot.correctZone) : null;
  const keeperZone = shot ? (shot.kick.team === 'you' ? (shot.kick.scored ? (shot.picked + 1) % zones.length : ballZone) : shot.picked >= 0 ? shot.picked : (shot.correctZone + 1) % zones.length) : null;
  const dots = (team: 'you' | 'rival') => sim.kicks.filter((k) => k.team === team).map((k, i) => <span key={i}>{k.scored ? '⚽' : '❌'}</span>);

  return (
    <GameShell
      title={p.title}
      subtitle={p.subtitle ?? 'Penalty Shootout'}
      progress={p.progress}
      retreatText={p.retreatText}
      onLeave={() => end(false, true)}
      className="bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-950"
      stats={<Pill title="Answer streak">🔥 {streak}</Pill>}
    >
      {/* Scoreboard */}
      <div className="mx-auto mt-3 flex w-full max-w-3xl items-center justify-between gap-2 rounded-2xl bg-black/40 px-4 py-2 font-display">
        <div className="min-w-0">
          <div className="truncate font-bold">{p.avatar ?? '🦊'} <T en="Your team" /></div>
          <div className="text-xs">{dots('you')}</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold tabular-nums">
            {sim.you} – {sim.rival}
          </div>
          {sim.suddenDeath && sim.status === 'playing' && (
            <div className="text-[10px] font-bold uppercase tracking-widest text-amber-300">
              <T en="Sudden death" />
            </div>
          )}
        </div>
        <div className="min-w-0 text-right">
          <div className="truncate font-bold">{rival} 👾</div>
          <div className="text-xs">{dots('rival')}</div>
        </div>
      </div>

      <div className="mx-auto mt-3 w-full max-w-3xl px-4">
        {question && !free && (
          <PromptPanel q={question} glossary={p.glossary ? p.glossary(question) : true}>
            <ol className="mt-2 grid gap-1.5 text-sm sm:grid-cols-2">
              {question.shown.map((o, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-emerald-600 text-xs font-bold text-white">{i + 1}</span>
                  <Marked text={o} />
                </li>
              ))}
            </ol>
          </PromptPanel>
        )}
      </div>

      <div className="mx-auto w-full max-w-3xl flex-1 px-4 pb-4">
        <p className={cx('my-2 text-center font-display text-lg font-bold', turn === 'shoot' ? 'text-amber-300' : 'text-sky-300')}>
          {turn === 'shoot' ? <T en="⚽ Your kick — pick the right corner!" /> : <T en="🧤 Their kick — pick the right answer to save it!" />}
        </p>
        {free && question ? (
          <div className="rounded-2xl bg-slate-100 p-4 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
            <QuestionCard question={question} onAnswer={(correct, ms, picked) => resolve(correct, -1, picked, ms)} wrongNote={p.wrongNote} glossary={p.glossary ? p.glossary(question) : true} />
          </div>
        ) : (
          <div className="relative mx-auto aspect-[2.2/1] w-full max-w-2xl select-none">
            {/* Goal */}
            <div className="absolute inset-x-0 bottom-[18%] h-1 bg-white/70" aria-hidden />
            <span className="absolute bottom-[6%] left-1/2 size-2 -translate-x-1/2 rounded-full bg-white/70" aria-hidden />
            <div className="absolute inset-x-[6%] top-[4%] bottom-[18%] rounded-t-md border-x-8 border-t-8 border-white bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.12)_0_2px,transparent_2px_14px),repeating-linear-gradient(90deg,rgba(255,255,255,0.12)_0_2px,transparent_2px_14px)]">
              {question &&
                zones.slice(0, question.shown.length).map(([x, y], i) => {
                  const isRight = shot && i === shot.correctZone;
                  const isPicked = shot && i === shot.picked;
                  return (
                    <button
                      key={i}
                      onClick={() => pick(i)}
                      disabled={!!shot}
                      className={cx(
                        'absolute -translate-x-1/2 -translate-y-1/2 rounded-xl px-2 py-1 text-xs font-bold text-white ring-2 transition sm:text-sm',
                        !shot && 'bg-white/15 ring-white/50 hover:scale-105 hover:bg-amber-400/40',
                        isRight && 'bg-emerald-500/80 ring-emerald-200',
                        isPicked && !isRight && 'bg-rose-500/70 ring-rose-200',
                        shot && !isRight && !isPicked && 'opacity-40 ring-white/20',
                      )}
                      style={{ left: `${x}%`, top: `${y}%`, maxWidth: '42%' }}
                      aria-label={`Corner ${i + 1}: ${question.shown[i]}`}
                    >
                      <span className="mr-1 inline-grid size-5 place-items-center rounded-full bg-black/40">{i + 1}</span>
                      <span className="line-clamp-1">{question.shown[i].replace(/[[\]]/g, '')}</span>
                    </button>
                  );
                })}
              {/* Keeper */}
              <span
                className="absolute -translate-x-1/2 -translate-y-1/2 text-5xl transition-all duration-500 sm:text-6xl"
                style={keeperZone != null ? { left: `${zones[keeperZone]?.[0] ?? 50}%`, top: `${zones[keeperZone]?.[1] ?? 60}%` } : { left: '50%', top: '62%' }}
                aria-hidden
              >
                {turn === 'save' ? '🧤' : '🧌'}
              </span>
            </div>
            {/* Ball */}
            <span
              className="absolute -translate-x-1/2 -translate-y-1/2 text-3xl transition-all duration-500 ease-out"
              style={
                ballZone != null
                  ? { left: `${6 + ((zones[ballZone]?.[0] ?? 50) * 88) / 100}%`, top: `${4 + ((zones[ballZone]?.[1] ?? 50) * 78) / 100}%` }
                  : { left: '50%', top: '92%' }
              }
              aria-hidden
            >
              ⚽
            </span>
            {shot && (
              <div className={cx('pointer-events-none absolute inset-x-0 top-[35%] animate-pop text-center font-display text-5xl font-black drop-shadow-[0_3px_0_rgba(0,0,0,0.6)]', shot.kick.scored === (shot.kick.team === 'you') ? 'text-amber-300' : 'text-rose-300')}>
                {shot.kick.team === 'you' ? (shot.kick.scored ? <T en="GOAL!" /> : <T en="Saved!" />) : shot.kick.scored ? <T en="They score…" /> : <T en="WHAT A SAVE!" />}
              </div>
            )}
          </div>
        )}
        {shot && !shot.kick.scored === (shot.kick.team === 'you') && p.wrongNote && (
          <p className="text-center text-sm text-rose-200">
            <T en={p.wrongNote} />
          </p>
        )}
        <p className="mt-2 hidden text-center text-xs text-white/50 lg:block">
          <T en="Click a corner or press 1–4 · R to replay audio" />
        </p>
      </div>
    </GameShell>
  );
}
