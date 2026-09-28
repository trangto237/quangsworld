import type { StudentProfile } from '@atlas/db';
import { getConcept } from '@atlas/knowledge';
import { Button } from '@atlas/ui';
import type { BattleResult } from '../store';
import { useKid } from '../store';
import { Stars } from './ProfilePicker';

const starOf = (m: number) => (m >= 80 ? 3 : m >= 60 ? 2 : m >= 40 ? 1 : 0);

export function Results({ student, result: r }: { student: StudentProfile; result: BattleResult }) {
  const go = useKid((s) => s.go);
  const acc = r.answered ? Math.round((r.correct / r.answered) * 100) : 0;
  const title = r.retreated ? 'Strategic retreat' : r.victory ? 'Victory!' : 'The castle fell…';
  const sub = r.victory ? `${student.name}, the realm is safe!` : r.retreated ? 'Rest up, hero. The Glitches will be back.' : "Every hero loses sometimes. You still grew stronger.";

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-gradient-to-b from-indigo-800 to-slate-950 p-4 text-white">
      <Stars />
      <div className="relative w-full max-w-lg animate-pop rounded-3xl bg-slate-950/80 p-6 shadow-2xl ring-1 ring-white/10 backdrop-blur">
        <div className="text-center">
          <div className="text-6xl">{r.victory ? '🏆' : r.retreated ? '🏳️' : '🛡️'}</div>
          <h1 className="mt-2 font-display text-3xl font-bold">{title}</h1>
          <p className="text-white/70">{sub}</p>
        </div>

        {r.levelAfter > r.levelBefore && (
          <div className="mt-4 animate-float rounded-2xl bg-gradient-to-r from-amber-400 to-pink-500 p-3 text-center font-display text-xl font-bold text-slate-950">
            ⬆ LEVEL UP! Level {r.levelAfter}
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
            <p className="text-xs font-bold uppercase tracking-widest text-white/50">Powers</p>
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
                  {newStar && <span className="text-xs font-bold text-amber-300">NEW ★</span>}
                </div>
              );
            })}
          </div>
        )}

        {r.missed.length > 0 && (
          <div className="mt-4 rounded-xl bg-indigo-500/15 p-3 text-sm">
            <p className="font-bold">📖 Scrolls for next time</p>
            {r.missed.slice(0, 2).map((cid) => (
              <p key={cid} className="mt-1 text-white/80">
                <b>{getConcept(cid)?.name}:</b> {getConcept(cid)?.lesson}
              </p>
            ))}
            <p className="mt-2 text-xs text-white/60">These will return in a review quest.</p>
          </div>
        )}

        <Button variant="game" className="mt-6 w-full py-4 text-lg" onClick={() => go({ name: 'hub' })}>
          Continue →
        </Button>
      </div>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white/5 p-3">
      <div className="text-xl font-bold tabular-nums">{value}</div>
      <div className="text-xs text-white/60">{label}</div>
    </div>
  );
}
