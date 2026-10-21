import { useEffect, useMemo, useRef, useState } from 'react';
import { DuelSim, duelConfigFor, duelTime, streakPips, type DuelEvent } from '@atlas/game';
import type { PresentedQuestion } from '@atlas/knowledge';
import { hashString } from '@atlas/shared';
import { cx } from '@atlas/ui';
import { QuestionCard } from '../QuestionCard';
import { stopSpeaking } from '../../lib/speech';
import { T, tr, useLang } from '../../i18n';
import { GameShell, Pill } from './GameShell';
import { HeroSprite, useLook } from './look';
import { ComebackCardButton } from './ComebackCard';
import type { ModeProps } from './types';

const BOSSES = ['🐉', '👹', '🦂', '🐙', '🗿', '🦖', '🧌', '👾'];

type Fx = { id: number; text: string; kind: 'hit' | 'crit' | 'ult' | 'hurt' | 'down' | 'card' };

/**
 * Boss Duel: a turn-based fight against the clock. Each question gets time to match how much there is to
 * read (passages and listening get more), and running out lets the boss strike. A correct answer is an
 * attack (harder questions and streaks hit harder): 3 in a row is a critical hit and the 5th a super
 * strike. The placement trial has no clock, so it measures what he knows rather than his speed.
 */
export function DuelArena(p: ModeProps) {
  const look = useLook();
  const sim = useMemo(() => new DuelSim({ ...duelConfigFor(p.minutes), noDefeat: p.trial, paced: p.trial }), [p.minutes, p.trial]);
  const lang = useLang();
  const boss = p.dress?.boss ?? BOSSES[hashString(p.bossName ?? p.title) % BOSSES.length];
  const [question, setQuestion] = useState<PresentedQuestion | null>(null);
  const [, force] = useState(0);
  const [streak, setStreak] = useState(0);
  const [fx, setFx] = useState<Fx[]>([]);
  const [anim, setAnim] = useState<'idle' | 'attack' | 'hurt' | 'bossDown'>('idle');
  const [superStrike, setSuperStrike] = useState(0);
  const ended = useRef(false);
  const fxId = useRef(0);
  // The countdown: total time for this question, when it started (paused while the app is hidden),
  // and whether it has been answered (or run out) so it can only count once.
  const timed = !p.trial;
  const [clock, setClock] = useState<{ total: number; left: number } | null>(null);
  const settled = useRef(true);
  const props = useRef(p);
  props.current = p;

  const end = (victory: boolean, retreated: boolean) => {
    if (ended.current) return;
    ended.current = true;
    stopSpeaking();
    props.current.onEnd(victory, retreated);
  };

  /** Share of the realm's challenges left after `extra` more answers (trial only). */
  const left = (extra: number) => {
    const g = props.current.progress;
    return g && g.max > 0 ? Math.max(0, (g.max - g.value - extra) / g.max) : undefined;
  };

  useEffect(() => {
    // Continuing a realm: the boss is already as hurt as the realm is done.
    const l = left(0);
    if (l !== undefined) sim.pace(l);
    setQuestion(props.current.nextQuestion());
    return () => {
      stopSpeaking();
    };
  }, []);

  const weapon = look.gear('duel.weapon')?.emoji;
  const show = (events: DuelEvent[]) => {
    for (const e of events) {
      const id = ++fxId.current;
      if (e.type === 'attack') {
        setFx((f) => [...f, { id, text: `${weapon ? `${weapon} ` : ''}${e.crit ? 'CRITICAL! ' : ''}−${e.damage}`, kind: e.ultimate ? 'ult' : e.crit ? 'crit' : 'hit' }]);
        setAnim('attack');
        if (e.ultimate) {
          setSuperStrike(e.damage);
          setTimeout(() => setSuperStrike(0), 1600);
        }
      }
      if (e.type === 'hurt') {
        setFx((f) => [...f, { id, text: `−${e.damage} ❤`, kind: 'hurt' }]);
        setAnim('hurt');
      }
      if (e.type === 'blocked') setFx((f) => [...f, { id, text: '🛡️ Blocked!', kind: 'card' }]);
      if (e.type === 'healed') setFx((f) => [...f, { id, text: `+${e.amount} ❤`, kind: 'card' }]);
      if (e.type === 'revived') setFx((f) => [...f, { id, text: tr(lang, '✨ The Oracle restores your health!'), kind: 'card' }]);
      if (e.type === 'card') setFx((f) => [...f, { id, text: '🃏 Comeback card!', kind: 'card' }]);
      if (e.type === 'bossDown') {
        setFx((f) => [...f, { id, text: 'Boss defeated!', kind: 'down' }]);
        setAnim('bossDown');
      }
      setTimeout(() => setFx((f) => f.filter((x) => x.id !== id)), 1400);
      if (e.type === 'end') setTimeout(() => end(e.victory, false), 1300);
    }
    setTimeout(() => setAnim('idle'), 500);
    force((n) => n + 1);
  };

  const resolve = (q: PresentedQuestion, correct: boolean, ms: number, picked: string, after = 0) => {
    if (ended.current) return;
    p.onActivity?.();
    const r = p.onAnswered(q, correct, ms, picked);
    setStreak(r.streak);
    show(sim.answer(correct, r.streak, q.difficulty, left(1)));
    if (r.done) {
      show(sim.finale());
      setQuestion(null);
      return;
    }
    const next = () => setQuestion(sim.status === 'playing' && !ended.current ? props.current.nextQuestion() : null);
    if (after) setTimeout(next, after);
    else next();
  };

  const onAnswer = (correct: boolean, ms: number, picked: string) => {
    if (!question || ended.current) return;
    settled.current = true;
    resolve(question, correct, ms, picked);
  };

  // A new question starts its countdown.
  useEffect(() => {
    if (!question) return;
    settled.current = false;
    if (!timed) return;
    const total = duelTime({ prompt: question.prompt, options: question.shown, passage: question.passage, audio: !!(question.audio || question.script?.length) });
    let start = performance.now();
    let last = start;
    setClock({ total, left: total });
    const t = setInterval(() => {
      const now = performance.now();
      if (document.visibilityState !== 'visible') start += now - last; // paused while the app is hidden
      last = now;
      if (settled.current) return clearInterval(t);
      const leftMs = Math.max(0, total - (now - start));
      setClock({ total, left: leftMs });
      if (leftMs > 0) return;
      clearInterval(t);
      // Too slow: the boss strikes, then the next question.
      settled.current = true;
      const id = ++fxId.current;
      setFx((f) => [...f, { id, text: tr(lang, '⏰ Too slow!'), kind: 'hurt' }]);
      setTimeout(() => setFx((f) => f.filter((x) => x.id !== id)), 1400);
      setQuestion(null);
      resolve(question, false, total, tr(lang, '⏰ (time ran out)'), 1100);
    }, 100);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  const bossPct = (sim.bossHp / sim.bossMax) * 100;
  const heroPct = (sim.heroHp / sim.heroMax) * 100;

  return (
    <GameShell
      title={p.title}
      subtitle={p.subtitle ?? 'Boss Duel'}
      progress={p.progress}
      retreatText={p.retreatText}
      onLeave={() => end(false, true)}
      className={p.dress?.bg ?? "bg-gradient-to-b from-rose-950 via-slate-950 to-slate-950"}
      stats={<Pill title="Answer streak">🔥 {streak}</Pill>}
      fit
    >
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Arena */}
        <div className={cx('relative flex min-h-[190px] flex-1 flex-col justify-between overflow-hidden p-3 sm:p-8', anim === 'hurt' && 'animate-shake')}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(244,63,94,0.25),transparent_60%)]" />
          {/* Boss */}
          <div className="relative flex flex-col items-center">
            <div className="w-full max-w-md">
              <div className="mb-1 flex justify-between text-xs font-bold text-white/70">
                <span>
                  {p.bossName ?? 'Boss'}
                  {sim.enraged && <span className="ml-2 text-rose-400">ENRAGED</span>}
                </span>
                <span className="tabular-nums">
                  {sim.bossHp}/{sim.bossMax}
                </span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-black/50 ring-1 ring-rose-400/60">
                <div className="h-full bg-gradient-to-r from-rose-600 to-orange-400 transition-all duration-500" style={{ width: `${bossPct}%` }} />
              </div>
            </div>
            <div
              className={cx(
                'mt-2 text-[64px] leading-none transition-transform duration-300 sm:mt-4 sm:text-[140px] [@media(min-height:800px)]:text-[96px]',
                anim === 'attack' && 'scale-90 -rotate-6 brightness-150',
                anim === 'hurt' && 'scale-110',
                anim === 'bossDown' && 'scale-50 opacity-30',
                sim.enraged && 'drop-shadow-[0_0_24px_rgba(244,63,94,0.9)]',
                clock && clock.left < 5000 && !settled.current && 'animate-pulse drop-shadow-[0_0_28px_rgba(251,146,60,1)]',
              )}
              aria-hidden
            >
              {boss}
            </div>
          </div>
          {/* Floating numbers */}
          <div className="pointer-events-none absolute inset-x-0 top-1/3 flex flex-col items-center gap-1">
            {fx.map((f) => (
              <span
                key={f.id}
                className={cx(
                  'animate-pop font-display font-bold drop-shadow',
                  f.kind === 'hurt' ? 'text-3xl text-rose-400' : f.kind === 'ult' ? 'text-5xl text-amber-300' : f.kind === 'crit' ? 'text-4xl text-orange-300' : f.kind === 'down' ? 'text-4xl text-emerald-300' : f.kind === 'card' ? 'text-3xl text-amber-200' : 'text-3xl text-white',
                )}
              >
                {f.text}
              </span>
            ))}
          </div>
          {/* Super strike: the 5th right answer in a row */}
          {superStrike > 0 && (
            <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center bg-[radial-gradient(circle,rgba(252,211,77,0.55),rgba(252,211,77,0.08)_55%,transparent_75%)]">
              <div className="animate-pop text-center font-display font-bold text-amber-200 drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
                <div className="text-5xl sm:text-6xl">⚡♛⚡</div>
                <div className="mt-1 text-3xl uppercase tracking-wide sm:text-4xl">
                  <T en="Super strike!" />
                </div>
                <div className="text-2xl text-white">−{superStrike} · ×3</div>
              </div>
            </div>
          )}
          {sim.comeback.card && (
            <ComebackCardButton card={sim.comeback.card} className="absolute right-3 top-1/2 z-10" onPlay={() => show(sim.useCard())} />
          )}
          {(sim.doubleNext || sim.shieldNext) && (
            <div className="absolute left-3 top-3 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-200">
              {sim.doubleNext ? '⚡ ×2' : '🛡️'} <T en="ready" />
            </div>
          )}
          {/* Hero */}
          <div className="relative mt-3 flex items-end gap-4 sm:mt-6">
            <div className={cx('relative text-5xl transition-transform duration-300 sm:text-7xl', anim === 'attack' && '-translate-y-6 translate-x-6 scale-110', anim === 'hurt' && 'translate-y-1 opacity-60')}>
              <HeroSprite />
              {weapon && <span className={cx('absolute -right-10 top-0 text-4xl transition-transform', anim === 'attack' && 'rotate-45 scale-125')}>{weapon}</span>}
            </div>
            <div className="w-48">
              <div className="mb-1 flex justify-between text-xs font-bold text-white/70">
                <span>❤ HP</span>
                <span className="tabular-nums">
                  {sim.heroHp}/{sim.heroMax}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-black/50 ring-1 ring-emerald-400/60">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-lime-400 transition-all duration-500" style={{ width: `${heroPct}%` }} />
              </div>
              <StreakPips streak={streak} />
            </div>
          </div>
        </div>

        <aside className="max-h-[66%] shrink-0 overflow-y-auto overscroll-contain border-t border-white/10 bg-slate-100 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 text-slate-900 lg:max-h-none lg:w-[480px] lg:shrink lg:border-l lg:border-t-0 dark:bg-slate-900 dark:text-slate-100">
          {timed && clock && question && <Countdown {...clock} />}
          {question ? (
            <QuestionCard key={question.id} question={question} onAnswer={onAnswer} onPick={() => (settled.current = true)} wrongNote={p.wrongNote} glossary={p.glossary ? p.glossary(question) : true} />
          ) : (
            <p className="py-6 text-center text-slate-500">…</p>
          )}
        </aside>
      </div>
    </GameShell>
  );
}

/** Time left to answer; the last five seconds turn red. */
function Countdown({ total, left }: { total: number; left: number }) {
  const urgent = left < 5000;
  return (
    <div className="mb-3 flex items-center gap-2" role="timer" aria-label={`${Math.ceil(left / 1000)} seconds left`}>
      <span className={cx('w-12 shrink-0 font-display text-sm font-bold tabular-nums', urgent ? 'text-rose-600' : 'text-slate-500')}>⏳ {Math.ceil(left / 1000)}s</span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-300/70 dark:bg-slate-700">
        <div className={cx('h-full rounded-full transition-[width] duration-100 ease-linear', urgent ? 'bg-rose-500' : 'bg-sky-500')} style={{ width: `${(left / total) * 100}%` }} />
      </div>
    </div>
  );
}

/** Five pips for the answer streak: the 3rd is a critical hit, the 5th a super strike. */
function StreakPips({ streak }: { streak: number }) {
  const n = streakPips(streak);
  return (
    <div className="mt-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={cx(
              'grid h-4 place-items-center rounded-full text-[9px] font-bold transition-colors',
              i === 5 ? 'w-7' : 'w-5',
              i <= n ? (i === 5 ? 'bg-amber-300 text-amber-950' : i >= 3 ? 'bg-orange-400 text-orange-950' : 'bg-emerald-400 text-emerald-950') : 'bg-white/15 text-white/50',
            )}
          >
            {i === 3 ? '✦' : i === 5 ? '♛' : ''}
          </span>
        ))}
      </div>
      <p className="mt-1 text-[11px] leading-tight text-white/60">
        {n >= 5 ? <T en="Super strike! Keep going…" /> : n >= 3 ? <T en="Critical hits! {n} more for a super strike" vars={{ n: 5 - n }} /> : <T en="3 in a row: critical · 5: super strike ×3" />}
      </p>
    </div>
  );
}
