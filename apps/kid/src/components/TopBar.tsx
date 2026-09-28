import type { StudentProfile } from '@atlas/db';
import { levelFromXp, studyStreak } from '@atlas/engine';
import { DAY_MS } from '@atlas/shared';
import { ThemeToggle, useQuery, useTheme } from '@atlas/ui';
import { getEquipped } from '../lib/equipped';
import { SHOP } from '@atlas/engine';
import { useKid } from '../store';

export function TopBar({ student, back }: { student: StudentProfile; back?: () => void }) {
  const logout = useKid((s) => s.logout);
  const { mode, cycle } = useTheme();
  const wallet = useQuery((r) => r.getWallet(student.id), [student.id]);
  const streak = useQuery((r) => studyStreak(r.listSessions(student.id, Date.now() - 60 * DAY_MS)), [student.id]);
  const equipped = useQuery((r) => getEquipped(r, student.id), [student.id]);
  const lvl = levelFromXp(wallet.xp);
  const hat = equipped.avatarItem ? SHOP.find((i) => i.id === equipped.avatarItem)?.emoji : null;

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-indigo-950/85 text-white backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-2 sm:gap-4 sm:px-4">
        {back && (
          <button onClick={back} className="rounded-xl px-2 py-1 text-xl hover:bg-white/10" aria-label="Back">
            ←
          </button>
        )}
        <div className="relative text-3xl" aria-hidden>
          {student.avatar}
          {hat && <span className="absolute -right-2 -top-3 text-lg">{hat}</span>}
        </div>
        <div className="min-w-0">
          <div className="truncate font-display font-semibold leading-tight">{student.name}</div>
          <div className="flex items-center gap-2 text-xs text-white/70">
            <span className="rounded bg-amber-400 px-1.5 font-bold text-amber-950">Lv {lvl.level}</span>
            <span className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-white/15 sm:block">
              <span className="block h-full bg-amber-400" style={{ width: `${(lvl.into / lvl.needed) * 100}%` }} />
            </span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-sm font-bold tabular-nums sm:gap-3">
          <span className="rounded-full bg-white/10 px-2.5 py-1" title="Streak">🔥 {streak}</span>
          <span className="rounded-full bg-white/10 px-2.5 py-1" title="Coins">🪙 {wallet.coins}</span>
          <span className="rounded-full bg-white/10 px-2.5 py-1" title="Gems">💎 {wallet.gems}</span>
          <ThemeToggle mode={mode} onCycle={cycle} className="hidden text-white sm:block" />
          <button onClick={logout} className="rounded-xl px-2 py-1 text-xs text-white/70 hover:bg-white/10" title="Switch player">
            ⇄
          </button>
        </div>
      </div>
    </header>
  );
}
