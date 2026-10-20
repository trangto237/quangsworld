import { useEffect, useMemo, useRef, useState } from 'react';
import { RaceSim, raceConfigFor, type RaceEvent } from '@atlas/game';
import type { PresentedQuestion } from '@atlas/knowledge';
import { cx } from '@atlas/ui';
import { QuestionCard } from '../QuestionCard';
import { stopSpeaking } from '../../lib/speech';
import { T } from '../../i18n';
import { GameShell, Pill } from './GameShell';
import { useLook } from './look';
import type { ModeProps } from './types';

const PLACE = ['', '1st', '2nd', '3rd', '4th', '5th'];
const MEDAL = ['', '🥇', '🥈', '🥉', '🏁', '🏁'];
const LABEL: Record<RaceEvent, string> = { boost: 'Boost!', nitro: '🔥 NITRO!', slipstream: '💨 Slipstream!', spin: '🌀 Spin-out!' };

/**
 * Grand Prix: right answers boost your car, 3 in a row fire nitro, a wrong one spins you out. Fall far
 * behind and the slipstream pulls you back into the race. Finish on the podium to win.
 */
export function RaceArena(p: ModeProps) {
  const look = useLook();
  const sim = useMemo(() => new RaceSim({ ...raceConfigFor(p.minutes), noDefeat: p.trial, endless: p.trial }), [p.minutes, p.trial]);
  const [question, setQuestion] = useState<PresentedQuestion | null>(null);
  const [streak, setStreak] = useState(0);
  const [fx, setFx] = useState<{ id: number; text: string; bad: boolean }[]>([]);
  const [spin, setSpin] = useState(false);
  const [, force] = useState(0);
  const ended = useRef(false);
  const fxId = useRef(0);
  const props = useRef(p);
  props.current = p;

  const end = (victory: boolean, retreated: boolean) => {
    if (ended.current) return;
    ended.current = true;
    stopSpeaking();
    props.current.onEnd(victory, retreated);
  };

  useEffect(() => {
    setQuestion(props.current.nextQuestion());
    return () => {
      stopSpeaking();
    };
  }, []);

  const onAnswer = (correct: boolean, ms: number, picked: string) => {
    if (!question || ended.current) return;
    p.onActivity?.();
    const r = p.onAnswered(question, correct, ms, picked);
    setStreak(r.streak);
    const res = sim.answer(correct, r.streak);
    for (const e of res.events) {
      if (e === 'boost' && res.events.length > 1) continue;
      const id = ++fxId.current;
      setFx((f) => [...f, { id, text: LABEL[e], bad: e === 'spin' }]);
      setTimeout(() => setFx((f) => f.filter((x) => x.id !== id)), 1300);
    }
    if (!correct) {
      setSpin(true);
      setTimeout(() => setSpin(false), 700);
    }
    if (r.done) sim.finale();
    force((n) => n + 1);
    if (sim.status !== 'playing') {
      setQuestion(null);
      setTimeout(() => end(sim.status === 'won', false), 1800);
      return;
    }
    setQuestion(p.nextQuestion());
  };

  const len = sim.cfg.length;
  const x = (pos: number) => 4 + Math.min(1, pos / len) * 86; // % along the track
  const place = sim.place;

  const vehicle = look.gear('race.vehicle');
  return (
    <GameShell
      title={p.title}
      subtitle={p.subtitle ?? 'Grand Prix'}
      progress={p.progress ?? { value: Math.min(sim.you.pos, len), max: len, label: 'Race' }}
      retreatText={p.retreatText}
      onLeave={() => end(false, true)}
      className="bg-gradient-to-b from-zinc-900 via-slate-950 to-slate-950"
      stats={
        <>
          <Pill className={cx(place <= 3 ? 'bg-amber-400/20 text-amber-300' : 'bg-white/10')} title="Position">
            {MEDAL[place]} {PLACE[place]}
          </Pill>
          <Pill title="Answer streak">🔥 {streak}</Pill>
        </>
      }
    >
      <div className="flex flex-1 flex-col lg:flex-row">
        <div className="relative flex flex-1 flex-col justify-center gap-2 overflow-hidden p-4">
          <div className="pointer-events-none absolute inset-x-0 top-6 flex flex-col items-center">
            {fx.map((f) => (
              <span key={f.id} className={cx('animate-pop font-display text-3xl font-black drop-shadow', f.bad ? 'text-rose-400' : 'text-amber-300')}>
                <T en={f.text} />
              </span>
            ))}
          </div>
          {sim.status !== 'playing' && (
            <div className="animate-pop text-center font-display text-4xl font-black text-amber-300 drop-shadow">
              {MEDAL[sim.you.finished] ?? '🏁'} {sim.you.finished ? <T en="You finished {place}!" vars={{ place: PLACE[sim.you.finished], n: sim.you.finished }} /> : <T en="The race is over!" />}
            </div>
          )}
          {/* Track: one lane per car */}
          <div className="relative rounded-2xl border-y-8 border-dashed border-y-red-500/80 bg-zinc-800 py-2 shadow-inner">
            <div className="absolute inset-y-0 right-[6%] w-3 bg-[repeating-linear-gradient(0deg,#fff_0_8px,#000_8px_16px)]" aria-hidden />
            {sim.racers.map((r, i) => {
              const me = r === sim.you;
              return (
                <div key={i} className={cx('relative h-14 border-b border-dashed border-white/15 last:border-0 sm:h-16', me && 'bg-amber-400/10')}>
                  <span className="absolute left-2 top-1 text-[10px] font-bold uppercase tracking-wide text-white/40">{me ? (
                      <>
                        {look.avatar} <T en="You" />
                      </>
                    ) : (
                      r.name
                    )}
                  </span>
                  <span
                    className={cx('absolute top-1/2 -translate-y-1/2 text-4xl', me && vehicle?.id === 'race.rocket' ? 'rotate-45' : '-scale-x-100', 'transition-[left] duration-700 ease-out sm:text-5xl', me && spin && 'animate-spin')}
                    style={{ left: `${x(r.pos)}%` }}
                    aria-label={me ? 'Your car' : r.name}
                  >
                    {me && vehicle ? vehicle.emoji : r.car}
                  </span>
                  {r.finished > 0 && <span className="absolute right-1 top-1/2 -translate-y-1/2 text-xl">{MEDAL[r.finished]}</span>}
                </div>
              );
            })}
          </div>
          <p className="text-center text-xs text-white/50">
            <T en="Right = boost · 3 in a row = nitro · far behind = slipstream · top 3 = podium" />
          </p>
        </div>

        <aside className="border-t border-white/10 bg-slate-100 p-4 text-slate-900 lg:w-[460px] lg:border-l lg:border-t-0 dark:bg-slate-900 dark:text-slate-100">
          {question ? (
            <QuestionCard question={question} onAnswer={onAnswer} wrongNote={p.wrongNote} glossary={p.glossary ? p.glossary(question) : true} />
          ) : (
            <p className="text-center text-slate-500">🏁</p>
          )}
        </aside>
      </div>
    </GameShell>
  );
}
