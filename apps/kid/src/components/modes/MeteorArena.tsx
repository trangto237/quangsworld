import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MeteorSim, meteorConfigFor } from '@atlas/game';
import type { PresentedQuestion } from '@atlas/knowledge';
import { isFreeAnswer } from '@atlas/shared';
import { Marked, cx } from '@atlas/ui';
import { QuestionCard } from '../QuestionCard';
import { playQuestionAudio, stopSpeaking } from '../../lib/speech';
import { T } from '../../i18n';
import { GameShell, Pill } from './GameShell';
import { useLook } from './look';
import { PromptPanel } from './PromptPanel';
import type { ModeProps } from './types';

const COLORS = ['#f97316', '#22c55e', '#3b82f6', '#a855f7'];
const BUILDINGS = ['🏫', '🏢', '🏯', '🏬', '🏠', '🏛️'];
const short = (s: string) => (s.length > 18 ? s.slice(0, 16) + '…' : s);

/**
 * Meteor Defense: the answers fall as meteors. Blast the right one (click it, or press 1–4) and the
 * chain reaction clears the sky; a wrong blast, or a meteor left to land, wrecks a building.
 * 3 in a row raise a shield over the city.
 */
export function MeteorArena(p: ModeProps) {
  const look = useLook();
  const sim = useMemo(() => new MeteorSim({ ...meteorConfigFor(p.minutes), noDefeat: p.trial, endless: p.trial, pace: p.trial ? 1.35 : 1 }), [p.minutes, p.trial]);
  const [question, setQuestion] = useState<PresentedQuestion | null>(null);
  const [fall, setFall] = useState(0);
  const [outcome, setOutcome] = useState<null | { correct: boolean; picked: number; hit: number; shielded: boolean }>(null);
  const [streak, setStreak] = useState(0);
  const [, force] = useState(0);
  const ended = useRef(false);
  const startedAt = useRef(performance.now());
  const duration = useRef(9000);
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
    setOutcome(null);
    setFall(0);
    if (!q) return;
    duration.current = sim.fallTime(q.prompt.length + (q.passage?.length ?? 0) / 3, q.shown.join('').length) + (q.audio || q.script ? 3000 : 0);
    startedAt.current = performance.now();
    if ((q.audio || q.script) && !isFreeAnswer(q)) setTimeout(() => playQuestionAudio(q), 300);
  }, [sim]);

  useEffect(() => {
    load();
    return () => {
      stopSpeaking();
    };
  }, [load]);

  const finish = (correct: boolean, picked: number, text: string, ms: number) => {
    if (!question || ended.current) return;
    p.onActivity?.();
    const r = p.onAnswered(question, correct, ms, text);
    setStreak(r.streak);
    const res = sim.resolve(correct);
    setOutcome({ correct, picked, hit: res.hit, shielded: res.shielded });
    if (r.done) sim.finale();
    force((n) => n + 1);
    setTimeout(() => {
      if (sim.status === 'won') end(true, false);
      else if (sim.status === 'lost') end(false, false);
      else load();
    }, correct ? 900 : 1700);
  };

  const blast = (i: number) => {
    if (!question || outcome || isFreeAnswer(question)) return;
    finish(i === question.correct, i, i >= 0 ? question.shown[i] : '', Math.round(performance.now() - startedAt.current));
  };

  // Meteors fall; when they land, it counts as a miss.
  useEffect(() => {
    if (!question || outcome || isFreeAnswer(question)) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      if (document.visibilityState !== 'visible') startedAt.current += now - last;
      last = now;
      const t = Math.min(1, (now - startedAt.current) / duration.current);
      setFall(t);
      if (t >= 1) {
        blast(-1);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, outcome]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!question || outcome || isFreeAnswer(question)) return;
      if (/^[1-4]$/.test(e.key) && +e.key <= question.shown.length) blast(+e.key - 1);
      else if ((e.key === 'r' || e.key === 'R') && (question.audio || question.script)) playQuestionAudio(question);
      else return;
      e.preventDefault();
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  const n = question?.shown.length ?? 4;
  const free = !!question && isFreeAnswer(question);

  const dress = p.dress?.falling;
  const colors = dress?.colors ?? COLORS;
  const ship = dress?.shooter ?? look.gear('meteor.ship')?.emoji;
  return (
    <GameShell
      title={p.title}
      subtitle={p.subtitle ?? 'Meteor Defense'}
      progress={p.progress ?? { value: sim.wave, max: sim.cfg.waves, label: 'Showers survived' }}
      retreatText={p.retreatText}
      onLeave={() => end(false, true)}
      className={p.dress?.bg ?? "bg-gradient-to-b from-slate-950 via-indigo-950 to-violet-950"}
      stats={
        <>
          <Pill title="Buildings standing">{dress?.standing ?? '🏙️'} {sim.standing}/{sim.buildings.length}</Pill>
          {sim.shield && <Pill className="bg-cyan-400/20 text-cyan-200" title="Shield">🛡️</Pill>}
          <Pill className="bg-amber-400/20 text-amber-300" title="Score">
            ⭐ {sim.score}
          </Pill>
          <Pill title="Answer streak">🔥 {streak}</Pill>
        </>
      }
    >
      <div className="mx-auto w-full max-w-3xl px-4 pt-3">
        {question && !free && (
          <PromptPanel q={question} glossary={p.glossary ? p.glossary(question) : true}>
            <ol className="mt-2 grid gap-1.5 text-sm sm:grid-cols-2">
              {question.shown.map((o, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold text-white" style={{ background: colors[i] }}>
                    {i + 1}
                  </span>
                  <Marked text={o} />
                </li>
              ))}
            </ol>
          </PromptPanel>
        )}
        {question && free && (
          <div className="rounded-2xl bg-slate-100 p-4 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-indigo-500">
              <T en={dress?.radar ?? '🛰️ Radar lock — answer to fire the laser'} />
            </p>
            <QuestionCard question={question} onAnswer={(correct, ms, picked) => finish(correct, correct ? question.correct : -1, picked, ms)} wrongNote={p.wrongNote} glossary={p.glossary ? p.glossary(question) : true} />
          </div>
        )}
      </div>

      {/* Sky */}
      <div className="relative mx-auto mt-2 w-full max-w-3xl flex-1 select-none overflow-hidden" style={{ minHeight: 300 }}>
        {(!dress || dress.stars) && <div className="meteor-stars pointer-events-none absolute inset-0 opacity-60" />}
        {question &&
          !free &&
          question.shown.map((o, i) => {
            const x = ((i + 0.5) / n) * 100;
            const isRight = outcome && i === question.correct;
            const isPicked = outcome && i === outcome.picked;
            const gone = outcome && (outcome.correct || (isPicked && !isRight));
            return (
              <button
                key={i}
                onClick={() => blast(i)}
                disabled={!!outcome}
                className={cx('absolute -translate-x-1/2 transition-opacity', gone && 'scale-150 opacity-0 duration-500')}
                style={{ left: `${x + (fall - 0.5) * (i % 2 ? 6 : -6)}%`, top: `${2 + fall * 62}%` }}
                aria-label={`Meteor ${i + 1}: ${o}`}
              >
                <span
                  className={cx('relative grid size-20 place-items-center text-center sm:size-24', dress ? 'rounded-[45%] border-[3px] border-black/40' : 'rounded-full')}
                  style={{ background: dress ? `radial-gradient(circle at 35% 30%, #ffffffcc, ${colors[i]} 70%)` : `radial-gradient(circle at 35% 35%, ${colors[i]}, #451a03 75%)`, boxShadow: `0 0 24px ${colors[i]}aa` }}
                >
                  {dress ? (
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-3xl drop-shadow">{dress.icons[i % dress.icons.length]}</span>
                  ) : (
                    <span className="absolute -top-6 left-1/2 h-8 w-3 -translate-x-1/2 rounded-full bg-gradient-to-t from-orange-300/80 to-transparent blur-[2px]" />
                  )}
                  <span className={cx('px-1 text-[11px] font-bold leading-tight sm:text-xs', dress ? 'text-black/85' : 'text-white drop-shadow')}>
                    <span className="block text-lg">{i + 1}</span>
                    {short(o.replace(/[[\]]/g, ''))}
                  </span>
                </span>
                {isRight && <span className="absolute inset-0 animate-ping rounded-full ring-4 ring-emerald-300" />}
              </button>
            );
          })}
        {outcome?.correct && <div className="pointer-events-none absolute inset-x-0 top-1/3 animate-pop text-center font-display text-4xl font-bold text-emerald-300 drop-shadow"><T en={dress?.hit ?? '💥 Sky cleared!'} /></div>}
        {outcome && !outcome.correct && (
          <div className="pointer-events-none absolute inset-x-0 top-1/3 animate-pop text-center font-display text-3xl font-bold text-rose-300 drop-shadow">
            {outcome.shielded ? <T en={dress?.held ?? '🛡️ The shield held!'} /> : <T en={dress?.miss ?? '💥 Impact!'} />}
          </div>
        )}
        {/* City */}
        <div className="absolute inset-x-0 bottom-0">
          {/* The cannon (a ship from the shop, or the standard rocket). */}
          <span className={cx('absolute bottom-full left-1/2 mb-1 -translate-x-1/2 text-4xl leading-none sm:text-5xl', !ship && !dress && '-rotate-45', outcome?.correct && 'animate-pop')} aria-hidden>
            {ship ?? '🚀'}
          </span>
          {sim.shield && <div className="absolute inset-x-[4%] bottom-0 h-28 rounded-t-[100%] border-t-4 border-cyan-300/70 bg-cyan-300/10" />}
          <div className={cx('flex items-end justify-around border-t-4 px-2 pb-2 pt-1', dress?.groundClass ?? 'border-slate-600 bg-slate-800/80')}>
            {sim.buildings.map((up, i) => (
              <span key={i} className={cx('text-4xl leading-none transition-all sm:text-5xl', !up && 'translate-y-2 opacity-30 grayscale', outcome && outcome.hit === i && 'animate-shake')}>
                {up ? (dress?.ground ?? BUILDINGS)[i % (dress?.ground ?? BUILDINGS).length] : (dress?.lost ?? '🔥')}
              </span>
            ))}
          </div>
        </div>
      </div>
      <p className="hidden pb-2 text-center text-xs text-white/50 lg:block">
        <T en={dress ? 'Click one or press 1–4 · R to replay audio' : 'Click a meteor or press 1–4 to fire · R to replay audio'} />
      </p>
    </GameShell>
  );
}
