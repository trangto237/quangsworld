import { useMemo, useState } from 'react';
import type { StudentProfile } from '@atlas/db';
import { getConcept } from '@atlas/knowledge';
import type { GameMode } from '@atlas/game';
import { gameOf } from '../lib/islands';
import { INVASION_ID } from '../lib/garden';
import { useRepo } from '@atlas/ui';
import { MistakeReview } from '../components/MistakeReview';
import { T, TB } from '../i18n';
import type { BattleResult } from '../store';
import { useKid, type Screen } from '../store';
import { TownScreen } from '../town/Shell';
import { TownButton } from '../town/ui';

/** What losing looks like in each game. */
const LOSS: Record<GameMode, string> = {
  defense: 'The castle fell…',
  runner: 'Out of breath…',
  temple: 'You fell off the temple path…',
  knight: 'The Glitch king escaped…',
  duel: 'The boss won this time…',
  sprint: 'The rocket ran out of fuel…',
  meteor: 'The city took too many hits…',
  penalty: 'Lost on penalties…',
  race: 'Off the podium this time…',
  detective: 'The case went cold…',
};

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
  const game = gameOf(r.mission);
  // After the garden's bug invasion, back to the garden.
  // Back to where he started the game from (the realm map, the island, the Arcade…).
  const returnTo = useKid((s) => s.returnTo);
  const home: Screen = r.mission.id.startsWith(INVASION_ID) ? { name: 'garden' } : (returnTo ?? { name: 'hub' });
  const title = r.retreated ? 'Strategic retreat' : r.victory ? 'Victory!' : (game.loss ?? LOSS[game.mode]);
  const sub = r.victory ? '{name}, the realm is safe!' : r.retreated ? 'Rest up, hero. The Glitches will be back.' : 'Every hero loses sometimes. You still grew stronger.';

  if (reviewing)
    return (
      <TownScreen student={student} tab={null} showPowers={false}>
        <div className="flex w-full justify-center pt-2">
          <MistakeReview
            mistakes={mistakes}
            onDone={() => {
              void repo.markMistakesReviewed(mistakes.map((m) => m.id));
              setReviewing(false);
              setReviewed(true);
            }}
          />
        </div>
      </TownScreen>
    );

  return (
    <TownScreen student={student} tab={null}>
      <div className="town-panel mx-auto w-full max-w-lg animate-pop p-5 sm:p-6">
        <div className="text-center">
          <div className="text-6xl">{r.victory ? '🏆' : r.retreated ? '🏳️' : '🛡️'}</div>
          <h1 className="mt-2 font-display text-3xl font-bold">
            <T en={title} />
          </h1>
          <p className="text-ink-soft">
            <T en={sub} vars={{ name: student.name }} />
          </p>
        </div>

        {r.levelAfter > r.levelBefore && (
          <div className="mt-4 animate-float rounded-2xl border-[2.5px] border-ink bg-[#ffc23d] p-3 text-center font-display text-xl font-bold text-[#3b2412]">
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
          <span className="text-[#d98a00]">✦ +{r.reward.xp} XP</span>
        </div>

        {r.masteryChanges.length > 0 && (
          <div className="mt-6 space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-ink-soft">
              <T en="Powers" />
            </p>
            {r.masteryChanges.map((c) => {
              const def = getConcept(c.conceptId);
              const up = c.after - c.before;
              const newStar = starOf(c.after) > starOf(c.before);
              return (
                <div key={c.conceptId} className="flex items-center gap-3 rounded-xl border-2 border-ink bg-paper-2 px-3 py-2">
                  <span className="flex-1 text-sm font-semibold">{def?.missionName ?? c.conceptId}</span>
                  <span className="tracking-widest text-[#f5a623]">
                    {'★'.repeat(starOf(c.after))}
                    <span className="text-ink/20">{'★'.repeat(3 - starOf(c.after))}</span>
                  </span>
                  <span className={`w-12 text-right text-sm font-bold tabular-nums ${up >= 0 ? 'text-[#2f8a3a] dark:text-[#86d993]' : 'text-[#c0392b] dark:text-[#ff8f80]'}`}>
                    {up >= 0 ? '▲' : '▼'} {Math.abs(Math.round(up))}
                  </span>
                  {newStar && (
                    <span className="text-xs font-bold text-[#d98a00]">
                      <T en="NEW ★" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {mistakes.length > 0 && !reviewed ? (
          <div className="mt-6 rounded-2xl border-2 border-ink bg-tint-red p-4">
            <p className="font-display text-lg font-semibold">
              <T en="📕 {n} to review" vars={{ n: mistakes.length }} />
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              <T en="No time to read during battle — let's look at them together now. They're also saved in your Mistake Book." block />
            </p>
            <TownButton tone="amber" className="mt-3 w-full py-2.5" onClick={() => setReviewing(true)} autoFocus>
              <TB en="Review my mistakes →" />
            </TownButton>
            <button className="mt-2 w-full text-center text-xs text-ink-soft hover:underline" onClick={() => go(home)}>
              <T en="Later (they'll wait in the Mistake Book)" />
            </button>
          </div>
        ) : (
          <>
            {reviewed && (
              <p className="mt-6 text-center text-sm font-semibold text-[#2f8a3a] dark:text-[#86d993]">
                <T en="✓ Reviewed. Fix them for good in the Mistake Book to earn coins." />
              </p>
            )}
            <TownButton tone="green" size="lg" className="mt-6 w-full" onClick={() => go(home)}>
              <TB en="Continue →" />
            </TownButton>
          </>
        )}
      </div>
    </TownScreen>
  );
}

function Tile({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border-2 border-ink bg-paper-2 p-3">
      <div className="font-display text-xl font-bold tabular-nums">{value}</div>
      <div className="text-xs font-semibold text-ink-soft">
        <T en={label} />
      </div>
    </div>
  );
}
