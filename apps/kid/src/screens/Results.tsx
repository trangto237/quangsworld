import { useMemo, useState } from 'react';
import type { StudentProfile } from '@atlas/db';
import { getConcept } from '@atlas/knowledge';
import { Button, useRepo } from '@atlas/ui';
import { MistakeReview } from '../components/MistakeReview';
import { T, TB } from '../i18n';
import type { BattleResult } from '../store';
import { useKid } from '../store';
import { Stars } from './ProfilePicker';

const starOf = (m: number) => (m >= 80 ? 3 : m >= 60 ? 2 : m >= 40 ? 1 : 0);

export function Results({ student, result: r }: { student: StudentProfile; result: BattleResult }) {
  const go = useKid((s) => s.go);
  const repo = useRepo();
  const mistakes = useMemo(() => {
    const ids = new Set(r.mistakeIds);
    return repo.listMistakes(student.id, { open: true }).filter((m) => ids.has(m.id));
  }, [repo, student.id, r.mistakeIds]);
  const [reviewing, setReviewing] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const acc = r.answered ? Math.round((r.correct / r.answered) * 100) : 0;
  const title = r.retreated ? 'Strategic retreat' : r.victory ? 'Victory!' : 'The castle fell…';
  const sub = r.victory ? '{name}, the realm is safe!' : r.retreated ? 'Rest up, hero. The Glitches will be back.' : 'Every hero loses sometimes. You still grew stronger.';

  if (reviewing)
    return (
      <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-gradient-to-b from-indigo-800 to-slate-950 p-4 text-white">
        <Stars />
        <div className="relative flex w-full justify-center">
          <MistakeReview
            mistakes={mistakes}
            onDone={() => {
              void repo.markMistakesReviewed(mistakes.map((m) => m.id));
              setReviewing(false);
              setReviewed(true);
            }}
          />
        </div>
      </div>
    );

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-gradient-to-b from-indigo-800 to-slate-950 p-4 text-white">
      <Stars />
      <div className="relative w-full max-w-lg animate-pop rounded-3xl bg-slate-950/80 p-6 shadow-2xl ring-1 ring-white/10 backdrop-blur">
        <div className="text-center">
          <div className="text-6xl">{r.victory ? '🏆' : r.retreated ? '🏳️' : '🛡️'}</div>
          <h1 className="mt-2 font-display text-3xl font-bold">
            <T en={title} />
          </h1>
          <p className="text-white/70">
            <T en={sub} vars={{ name: student.name }} />
          </p>
        </div>

        {r.levelAfter > r.levelBefore && (
          <div className="mt-4 animate-float rounded-2xl bg-gradient-to-r from-amber-400 to-pink-500 p-3 text-center font-display text-xl font-bold text-slate-950">
            <T en="⬆ LEVEL UP! Level {n}" vars={{ n: r.levelAfter }} />
          </div>
        )}

        <div className="mt-6 grid grid-cols-3 gap-2 text-center">
          <Tile label="Accuracy" value={`${acc}%`} />
          <Tile label="Challenges" value={r.answered} />
          <Tile label="Best streak" value={`🔥 ${r.bestStreak}`} />
        </div>

        <div className="mt-4 flex justify-center gap-4 font-display text-2xl font-bold">
          <span>🪙 +{r.reward.coins}</span>
          {r.reward.gems > 0 && <span>💎 +{r.reward.gems}</span>}
          <span className="text-amber-300">✦ +{r.reward.xp} XP</span>
        </div>

        {r.masteryChanges.length > 0 && (
          <div className="mt-6 space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-white/50">
              <T en="Powers" />
            </p>
            {r.masteryChanges.map((c) => {
              const def = getConcept(c.conceptId);
              const up = c.after - c.before;
              const newStar = starOf(c.after) > starOf(c.before);
              return (
                <div key={c.conceptId} className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2">
                  <span className="flex-1 text-sm font-semibold">{def?.missionName ?? c.conceptId}</span>
                  <span className="tracking-widest text-amber-300">
                    {'★'.repeat(starOf(c.after))}
                    <span className="text-white/20">{'★'.repeat(3 - starOf(c.after))}</span>
                  </span>
                  <span className={`w-12 text-right text-sm font-bold tabular-nums ${up >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {up >= 0 ? '▲' : '▼'} {Math.abs(Math.round(up))}
                  </span>
                  {newStar && (
                    <span className="text-xs font-bold text-amber-300">
                      <T en="NEW ★" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {mistakes.length > 0 && !reviewed ? (
          <div className="mt-6 rounded-2xl bg-rose-500/15 p-4 ring-1 ring-rose-400/30">
            <p className="font-display text-lg font-semibold">
              <T en="📕 {n} to review" vars={{ n: mistakes.length }} />
            </p>
            <p className="mt-1 text-sm text-white/70">
              <T en="No time to read during battle — let's look at them together now. They're also saved in your Mistake Book." block />
            </p>
            <Button variant="game" className="mt-3 w-full py-3" onClick={() => setReviewing(true)} autoFocus>
              <TB en="Review my mistakes →" />
            </Button>
            <button className="mt-2 w-full text-center text-xs text-white/60 hover:underline" onClick={() => go({ name: 'hub' })}>
              <T en="Later (they'll wait in the Mistake Book)" />
            </button>
          </div>
        ) : (
          <>
            {reviewed && (
              <p className="mt-6 text-center text-sm text-emerald-300">
                <T en="✓ Reviewed. Fix them for good in the Mistake Book to earn coins." />
              </p>
            )}
            <Button variant="game" className="mt-6 w-full py-4 text-lg" onClick={() => go({ name: 'hub' })}>
              <TB en="Continue →" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white/5 p-3">
      <div className="text-xl font-bold tabular-nums">{value}</div>
      <div className="text-xs text-white/60">
        <T en={label} />
      </div>
    </div>
  );
}
