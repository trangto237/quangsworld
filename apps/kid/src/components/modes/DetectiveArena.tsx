import { useEffect, useMemo, useRef, useState } from 'react';
import { DetectiveSim, detectiveConfigFor } from '@atlas/game';
import { coach, type PresentedQuestion } from '@atlas/knowledge';
import { Button, cx } from '@atlas/ui';
import { QuestionCard } from '../QuestionCard';
import { BiText } from '../Coach';
import { GlossText } from '../GlossText';
import { speak, stopSpeaking } from '../../lib/speech';
import { T, TB, useLang } from '../../i18n';
import { GameShell, Pill } from './GameShell';
import { useLook } from './look';
import type { ModeProps } from './types';

const Stars = ({ n }: { n: number }) => (
  <span aria-label={`${n} stars`}>
    {[1, 2, 3].map((i) => (
      <span key={i} className={i <= n ? '' : 'opacity-25 grayscale'}>
        ⭐
      </span>
    ))}
  </span>
);

/**
 * Word Detective: every right answer reveals a clue that clears one suspect. When only one is left,
 * accuse them. Wrong answers and hints are slips — the fewer slips, the more stars for the case.
 */
export function DetectiveArena(p: ModeProps) {
  const look = useLook();
  const lang = useLang();
  const sim = useMemo(() => new DetectiveSim({ ...detectiveConfigFor(p.minutes), noDefeat: p.trial, endless: p.trial }), [p.minutes, p.trial]);
  const [question, setQuestion] = useState<PresentedQuestion | null>(null);
  const [streak, setStreak] = useState(0);
  const [newClue, setNewClue] = useState<string | null>(null);
  const [banner, setBanner] = useState<null | { kind: 'solved' | 'cold'; stars: number; name: string }>(null);
  const [hintShown, setHintShown] = useState(false);
  const [, force] = useState(0);
  const ended = useRef(false);
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

  const c = sim.case;
  const hint = useMemo(() => (question && question.conceptId.startsWith('en.') ? coach(question).hint : null), [question]);

  const after = (r: { solved: boolean; end?: 'won' | 'lost' }, kind: 'solved' | 'cold', stars: number, name: string) => {
    setBanner({ kind, stars, name });
    force((n) => n + 1);
    setTimeout(() => {
      setBanner(null);
      if (r.end) end(r.end === 'won', false);
      else setQuestion(props.current.nextQuestion());
      force((n) => n + 1);
    }, 2200);
  };

  const onAnswer = (correct: boolean, ms: number, picked: string) => {
    if (!question || ended.current) return;
    p.onActivity?.();
    const r = p.onAnswered(question, correct, ms, picked);
    setStreak(r.streak);
    setHintShown(false);
    const res = sim.answer(correct);
    if (res.clue) {
      setNewClue(res.clue);
      setTimeout(() => setNewClue((x) => (x === res.clue ? null : x)), 2500);
    }
    if (r.done) {
      sim.finale();
      setQuestion(null);
      setTimeout(() => end(true, false), 900);
      return;
    }
    if (res.cold) {
      const name = c.suspects[c.culprit].name;
      setQuestion(null);
      after(sim.next(), 'cold', 0, name);
      return;
    }
    setQuestion(sim.readyToAccuse ? null : p.nextQuestion());
    force((n) => n + 1);
  };

  const accuse = () => {
    if (!sim.readyToAccuse) return;
    p.onActivity?.();
    const stars = sim.stars();
    const name = sim.remaining[0].name;
    const r = sim.accuse();
    after(r, 'solved', stars, name);
  };

  return (
    <GameShell
      title={p.title}
      subtitle={p.subtitle ?? 'Word Detective'}
      progress={p.progress ?? { value: sim.solvedCount, max: sim.cfg.cases, label: 'Cases solved' }}
      retreatText={p.retreatText}
      onLeave={() => end(false, true)}
      className="bg-gradient-to-b from-stone-900 via-stone-950 to-slate-950"
      stats={
        <>
          <Pill title="Stars for this case">
            <Stars n={sim.stars()} />
          </Pill>
          <Pill title="Cases solved">🗂️ {sim.solvedCount}</Pill>
          <Pill title="Answer streak">🔥 {streak}</Pill>
        </>
      }
    >
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Case board */}
        <div className="relative flex-1 space-y-3 p-4">
          <div className="rounded-2xl bg-amber-100 p-4 text-stone-900 shadow-[inset_0_0_40px_rgba(120,53,15,0.25)]">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                  <T en="Case file" /> #{sim.current + 1}
                </p>
                <h2 className="font-display text-xl font-bold">🕵️{look.gear('detective.gear')?.emoji ?? ''} {c.title}</h2>
              </div>
              <button onClick={() => speak(c.crime, 0.85)} className="rounded-lg px-2 py-1 text-lg hover:bg-amber-200" aria-label="Read the case aloud">
                🔊
              </button>
            </div>
            <p className="mt-1 text-sm">
              <GlossText text={c.crime} enabled={lang !== 'en'} />
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {c.suspects.map((s) => {
              const suspect = !s.cleared;
              const accusable = sim.readyToAccuse && suspect;
              return (
                <button
                  key={s.id}
                  onClick={accusable ? accuse : undefined}
                  disabled={!accusable}
                  className={cx(
                    'relative overflow-hidden rounded-xl bg-white p-2 text-center text-stone-900 shadow transition',
                    s.cleared && 'bg-stone-300',
                    accusable && 'animate-pulse ring-4 ring-rose-500 hover:scale-105',
                  )}
                  aria-label={s.cleared ? `${s.name} (cleared)` : accusable ? `Accuse ${s.name}` : s.name}
                >
                  <div className={cx(s.cleared && 'opacity-40 grayscale')}>
                    <div className="text-5xl">{s.emoji}</div>
                    <div className="font-bold leading-tight">{s.name}</div>
                    <div className="mt-1 text-[11px] leading-tight text-stone-600">
                      🎩 {s.hat}
                      <br />
                      🐾 {s.pet}
                    </div>
                  </div>
                  {s.cleared && (
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded border-4 border-emerald-600 bg-white/80 px-2 font-display text-lg font-black text-emerald-700">
                      <T en="CLEARED" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl bg-stone-800/80 p-3">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-300">
              📝 <T en="Clues" /> ({c.clues.length}/3)
            </p>
            {c.clues.length === 0 && (
              <p className="mt-1 text-sm text-white/60">
                <T en="Answer questions to find clues." />
              </p>
            )}
            <ol className="mt-1 space-y-1 text-sm">
              {c.clues.map((clue, i) => (
                <li key={i} className={cx('rounded-lg px-2 py-1', clue === newClue ? 'animate-pop bg-amber-400/30 text-amber-50' : 'text-white/90')}>
                  {i + 1}. <GlossText text={clue} enabled={lang !== 'en'} />{' '}
                  <button onClick={() => speak(clue, 0.85)} className="opacity-60 hover:opacity-100" aria-label="Read clue aloud">
                    🔊
                  </button>
                </li>
              ))}
            </ol>
          </div>

          {banner && (
            <div className="absolute inset-x-4 top-1/3 animate-pop rounded-2xl bg-black/85 p-5 text-center shadow-2xl">
              {banner.kind === 'solved' ? (
                <>
                  <p className="font-display text-3xl font-black text-amber-300">
                    <T en="Case solved!" />
                  </p>
                  <p className="mt-1 text-white/80">
                    <T en="It was {name}!" vars={{ name: banner.name }} />
                  </p>
                  <p className="mt-2 text-3xl">
                    <Stars n={banner.stars} />
                  </p>
                </>
              ) : (
                <>
                  <p className="font-display text-3xl font-black text-sky-300">
                    <T en="The trail went cold…" />
                  </p>
                  <p className="mt-1 text-white/80">
                    <T en="{name} got away this time. New case!" vars={{ name: banner.name }} />
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        <aside className="border-t border-white/10 bg-slate-100 p-4 text-slate-900 lg:w-[460px] lg:border-l lg:border-t-0 dark:bg-slate-900 dark:text-slate-100">
          {sim.readyToAccuse && !banner ? (
            <div className="space-y-3 text-center">
              <p className="font-display text-xl font-bold">
                <T en="All the clues are in!" />
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                <T en="Only one suspect is left. Accuse them to close the case." />
              </p>
              <Button variant="game" className="w-full py-3" onClick={accuse}>
                <TB en="👉 Accuse {name}!" vars={{ name: sim.remaining[0]?.name ?? '' }} />
              </Button>
            </div>
          ) : question ? (
            <>
              <QuestionCard question={question} onAnswer={onAnswer} wrongNote={p.wrongNote} glossary={p.glossary ? p.glossary(question) : true} />
              {hint &&
                (hintShown ? (
                  <div className="mt-3 flex items-start gap-2 rounded-xl bg-indigo-50 p-3 text-sm ring-1 ring-indigo-200 dark:bg-indigo-950/50 dark:ring-indigo-800">
                    <span className="text-xl">🦉</span>
                    <BiText b={hint} block />
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      sim.hint();
                      setHintShown(true);
                      force((n) => n + 1);
                    }}
                    className="mt-3 text-sm font-semibold text-indigo-700 hover:underline dark:text-indigo-300"
                  >
                    🦉 <T en="Hint (costs a star)" />
                  </button>
                ))}
            </>
          ) : (
            <p className="text-center text-slate-500">🔎</p>
          )}
        </aside>
      </div>
    </GameShell>
  );
}
