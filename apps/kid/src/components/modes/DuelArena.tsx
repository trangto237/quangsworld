import { useEffect, useMemo, useRef, useState } from 'react';
import { DuelSim, duelConfigFor, type DuelEvent } from '@atlas/game';
import type { PresentedQuestion } from '@atlas/knowledge';
import { hashString } from '@atlas/shared';
import { cx } from '@atlas/ui';
import { QuestionCard } from '../QuestionCard';
import { stopSpeaking } from '../../lib/speech';
import { T } from '../../i18n';
import { GameShell, Pill } from './GameShell';
import type { ModeProps } from './types';

const BOSSES = ['🐉', '👹', '🦂', '🐙', '🗿', '🦖', '🧌', '👾'];

type Fx = { id: number; text: string; kind: 'hit' | 'crit' | 'ult' | 'hurt' | 'down' };

/**
 * Boss Duel: a calm, turn-based fight. No clock — good for reading passages and listening.
 * A correct answer is an attack (harder questions and streaks hit harder); a wrong one lets the boss strike.
 */
export function DuelArena(p: ModeProps) {
  const sim = useMemo(() => new DuelSim({ ...duelConfigFor(p.minutes), noDefeat: p.trial, endless: p.trial }), [p.minutes, p.trial]);
  const boss = BOSSES[hashString(p.bossName ?? p.title) % BOSSES.length];
  const [question, setQuestion] = useState<PresentedQuestion | null>(null);
  const [, force] = useState(0);
  const [streak, setStreak] = useState(0);
  const [fx, setFx] = useState<Fx[]>([]);
  const [anim, setAnim] = useState<'idle' | 'attack' | 'hurt' | 'bossDown'>('idle');
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

  const show = (events: DuelEvent[]) => {
    for (const e of events) {
      const id = ++fxId.current;
      if (e.type === 'attack') {
        setFx((f) => [...f, { id, text: `${e.ultimate ? '♛ CHECKMATE! ' : e.crit ? 'CRITICAL! ' : ''}−${e.damage}`, kind: e.ultimate ? 'ult' : e.crit ? 'crit' : 'hit' }]);
        setAnim('attack');
      }
      if (e.type === 'hurt') {
        setFx((f) => [...f, { id, text: `−${e.damage} ❤`, kind: 'hurt' }]);
        setAnim('hurt');
      }
      if (e.type === 'bossDown') {
        setFx((f) => [...f, { id, text: e.wave > 0 && p.trial ? 'Boss defeated! Another appears…' : 'Boss defeated!', kind: 'down' }]);
        setAnim('bossDown');
      }
      setTimeout(() => setFx((f) => f.filter((x) => x.id !== id)), 1400);
      if (e.type === 'end') setTimeout(() => end(e.victory, false), 1300);
    }
    setTimeout(() => setAnim('idle'), 500);
    force((n) => n + 1);
  };

  const onAnswer = (correct: boolean, ms: number, picked: string) => {
    if (!question || ended.current) return;
    p.onActivity?.();
    const r = p.onAnswered(question, correct, ms, picked);
    setStreak(r.streak);
    show(sim.answer(correct, r.streak, question.difficulty));
    if (r.done) {
      show(sim.finale());
      setQuestion(null);
      return;
    }
    if (sim.status === 'playing') setQuestion(p.nextQuestion());
    else setQuestion(null);
  };

  const bossPct = (sim.bossHp / sim.bossMax) * 100;
  const heroPct = (sim.heroHp / sim.heroMax) * 100;

  return (
    <GameShell
      title={p.title}
      subtitle={p.subtitle ?? 'Boss Duel'}
      progress={p.progress}
      retreatText={p.retreatText}
      onLeave={() => end(false, true)}
      className="bg-gradient-to-b from-rose-950 via-slate-950 to-slate-950"
      stats={<Pill title="Answer streak">🔥 {streak}</Pill>}
    >
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Arena */}
        <div className={cx('relative flex min-h-[300px] flex-1 flex-col justify-between overflow-hidden p-4 sm:p-8', anim === 'hurt' && 'animate-shake')}>
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
                'mt-4 text-[96px] leading-none transition-transform duration-300 sm:text-[140px]',
                anim === 'attack' && 'scale-90 -rotate-6 brightness-150',
                anim === 'hurt' && 'scale-110',
                anim === 'bossDown' && 'scale-50 opacity-30',
                sim.enraged && 'drop-shadow-[0_0_24px_rgba(244,63,94,0.9)]',
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
                  f.kind === 'hurt' ? 'text-3xl text-rose-400' : f.kind === 'ult' ? 'text-5xl text-amber-300' : f.kind === 'crit' ? 'text-4xl text-orange-300' : f.kind === 'down' ? 'text-4xl text-emerald-300' : 'text-3xl text-white',
                )}
              >
                {f.text}
              </span>
            ))}
          </div>
          {/* Hero */}
          <div className="relative mt-6 flex items-end gap-4">
            <div className={cx('text-6xl transition-transform duration-300 sm:text-7xl', anim === 'attack' && '-translate-y-6 translate-x-6 scale-110', anim === 'hurt' && 'translate-y-1 opacity-60')}>
              {p.avatar ?? '🦊'}
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
              <p className="mt-2 text-xs text-white/50">
                <T en="Right answers attack · 3 in a row = critical · 5 = checkmate" />
              </p>
            </div>
          </div>
        </div>

        <aside className="border-t border-white/10 bg-slate-100 p-4 text-slate-900 lg:w-[480px] lg:border-l lg:border-t-0 dark:bg-slate-900 dark:text-slate-100">
          {question ? (
            <QuestionCard question={question} onAnswer={onAnswer} wrongNote={p.wrongNote} glossary={p.glossary ? p.glossary(question) : true} />
          ) : (
            <p className="text-center text-slate-500">…</p>
          )}
        </aside>
      </div>
    </GameShell>
  );
}
