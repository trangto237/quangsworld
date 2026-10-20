import type { ReactNode } from 'react';
import type { StudentProfile } from '@atlas/db';
import { SHOP, levelFromXp, studyStreak } from '@atlas/engine';
import { DAY_MS } from '@atlas/shared';
import { cx, useQuery } from '@atlas/ui';
import { getEquipped } from '../lib/equipped';
import { getPowers } from '../lib/powers';
import { todayPlan } from '../lib/plan';
import { useKid } from '../store';
import { T, tr, useLang } from '../i18n';
import { Chip, Meter } from './ui';

export type NavTab = 'map' | 'quests' | 'coach' | 'exams' | 'shop' | 'hero' | null;

/** Hero rank shown under the name, from the level. */
export const rankFor = (level: number) =>
  level >= 11 ? 'Legend' : level >= 8 ? 'Champion' : level >= 5 ? 'Ranger' : level >= 3 ? 'Explorer' : 'Apprentice';

/** The hero's avatar in a round frame, with the equipped hat and the level badge. */
export function HeroAvatar({ student, size = 'md' }: { student: StudentProfile; size?: 'md' | 'lg' }) {
  const wallet = useQuery((r) => r.getWallet(student.id), [student.id]);
  const equipped = useQuery((r) => getEquipped(r, student.id), [student.id]);
  const hat = equipped.avatarItem ? SHOP.find((i) => i.id === equipped.avatarItem)?.emoji : null;
  const lvl = levelFromXp(wallet.xp).level;
  const big = size === 'lg';
  return (
    <span className={cx('relative grid shrink-0 place-items-center rounded-full border-[2.5px] border-ink bg-[#ffd98a]', big ? 'size-24 text-6xl' : 'size-12 text-3xl')} aria-hidden>
      {student.avatar}
      {hat && <span className={cx('absolute', big ? '-right-3 -top-5 text-4xl' : '-right-2 -top-3 text-lg')}>{hat}</span>}
      <span className={cx('absolute grid place-items-center rounded-full border-2 border-ink bg-[#5cb85c] font-display font-bold text-white', big ? '-bottom-1 -left-1 size-9 text-base' : '-bottom-1.5 -left-1.5 size-6 text-xs')}>
        {lvl}
      </span>
    </span>
  );
}

/** Top bar: the hero card (tap → hero sheet), coins, gems, streak, and the five power stats. */
export function HeroBar({ student, back, showPowers = true }: { student: StudentProfile; back?: () => void; showPowers?: boolean }) {
  const go = useKid((s) => s.go);
  const lang = useLang();
  const wallet = useQuery((r) => r.getWallet(student.id), [student.id]);
  const streak = useQuery((r) => studyStreak(r.listSessions(student.id, Date.now() - 60 * DAY_MS)), [student.id]);
  const powers = useQuery((r) => getPowers(r, student.id), [student.id]);
  const lvl = levelFromXp(wallet.xp);
  return (
    <header className="sticky top-0 z-30 px-2 pt-[max(0.5rem,env(safe-area-inset-top))] pb-1">
      <div className="mx-auto max-w-5xl space-y-1.5">
        <div className="flex items-center gap-2">
          {back && (
            <button onClick={back} className="town-btn grid size-10 shrink-0 place-items-center rounded-xl bg-paper font-display text-xl font-bold text-ink-text" aria-label={tr(lang, 'Back')}>
              ←
            </button>
          )}
          <button onClick={() => go({ name: 'hero' })} className="town-panel flex min-w-0 flex-1 items-center gap-2.5 py-1 pl-1.5 pr-3 text-left sm:flex-none" aria-label={tr(lang, 'Hero profile')}>
            <HeroAvatar student={student} />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-display text-lg font-bold leading-tight">{student.name}</span>
              <span className="block truncate text-xs font-semibold text-ink-soft">
                Lv {lvl.level} · <T en={rankFor(lvl.level)} /> · 🔥 {streak}
              </span>
              <Meter value={lvl.into} max={lvl.needed} color="#ffc23d" className="mt-0.5 h-2.5 w-full sm:w-36" />
            </span>
          </button>
          <button onClick={() => go({ name: 'shop' })} className="ml-auto flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center" aria-label={tr(lang, 'Coins and gems')}>
            <Chip icon="🪙" value={wallet.coins} title={tr(lang, 'Coins')} />
            <Chip icon="💎" value={wallet.gems} color="#4b8fe2" title={tr(lang, 'Gems')} />
          </button>
        </div>
        {showPowers && (
          <button onClick={() => go({ name: 'hero' })} className="grid w-full grid-cols-5 gap-1 sm:flex sm:w-auto" aria-label={tr(lang, 'Hero profile')}>
            {powers.map((p) => (
              <Chip key={p.id} icon={p.icon} value={p.value} bar={p.value} color={p.color} title={tr(lang, p.name)} className="justify-center pr-1.5 sm:pr-2.5" />
            ))}
          </button>
        )}
      </div>
    </header>
  );
}

const NAV: { id: Exclude<NavTab, null | 'hero'>; icon: string; en: string; color: string }[] = [
  { id: 'map', icon: '🗺️', en: 'Map', color: '#5cb85c' },
  { id: 'quests', icon: '📜', en: 'Quests', color: '#f59e0b' },
  { id: 'coach', icon: '🦉', en: 'Coach', color: '#8b5cf6' },
  { id: 'exams', icon: '🏛️', en: 'Exams', color: '#4b8fe2' },
];

/** Bottom navigation, with a big round Play button for the next quest in the middle. */
export function BottomNav({ student, active }: { student: StudentProfile; active: NavTab }) {
  const go = useKid((s) => s.go);
  const lang = useLang();
  const plan = useQuery((r) => todayPlan(r, student.id), [student.id]);
  const next = plan.missions.find((m) => !m.done);
  const target = (id: (typeof NAV)[number]['id']) =>
    id === 'map' ? go({ name: 'hub' }) : id === 'quests' ? go({ name: 'quests' }) : id === 'coach' ? go({ name: 'coach' }) : go({ name: 'exam-hall' });
  const item = (n: (typeof NAV)[number]) => (
    <button key={n.id} onClick={() => target(n.id)} className="flex min-w-0 flex-1 flex-col items-center gap-0.5" aria-current={active === n.id ? 'page' : undefined}>
      <span
        className={cx('grid size-10 place-items-center rounded-xl border-2 border-ink text-xl transition', active === n.id ? '-translate-y-0.5 shadow-[0_3px_0_var(--ink)]' : 'opacity-90')}
        style={{ background: active === n.id ? n.color : `${n.color}55` }}
      >
        {n.icon}
      </span>
      <span className={cx('truncate font-display text-xs font-bold', active === n.id ? 'text-ink-text' : 'text-ink-soft')}>
        <T en={n.en} />
      </span>
    </button>
  );
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="town-panel mx-auto flex max-w-xl items-end gap-1 px-2 pb-1.5 pt-2">
        {NAV.slice(0, 2).map(item)}
        <button
          onClick={() => (next ? go({ name: 'battle', mission: next, fromPlan: true }) : go({ name: 'quests' }))}
          className="town-btn -mt-7 grid size-16 shrink-0 place-items-center rounded-full bg-[#e8584a] font-display text-white"
          aria-label={next ? tr(lang, '▶ Play: {title}', { title: next.title }) : tr(lang, 'Quests')}
        >
          <span className="flex flex-col items-center leading-none">
            <span className="text-2xl">{next ? '▶' : '🏆'}</span>
            <span className="text-[10px] font-bold">
              <T en={next ? 'Play' : 'Done!'} />
            </span>
          </span>
        </button>
        {NAV.slice(2).map(item)}
        <button onClick={() => go({ name: 'shop' })} className="flex min-w-0 flex-1 flex-col items-center gap-0.5" aria-current={active === 'shop' ? 'page' : undefined}>
          <span
            className={cx('grid size-10 place-items-center rounded-xl border-2 border-ink text-xl', active === 'shop' && '-translate-y-0.5 shadow-[0_3px_0_var(--ink)]')}
            style={{ background: active === 'shop' ? '#e8584a' : '#e8584a55' }}
          >
            🛒
          </span>
          <span className={cx('truncate font-display text-xs font-bold', active === 'shop' ? 'text-ink-text' : 'text-ink-soft')}>
            <T en="Shop" />
          </span>
        </button>
      </div>
    </nav>
  );
}

/** A menu screen in the town style: hero bar, content, bottom navigation. */
export function TownScreen({
  student,
  tab,
  back,
  showPowers,
  className,
  children,
}: {
  student: StudentProfile;
  tab: NavTab;
  back?: () => void;
  showPowers?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className="town-bg min-h-dvh text-ink-text">
      <HeroBar student={student} back={back} showPowers={showPowers} />
      <main className={cx('mx-auto max-w-5xl px-3 pb-[calc(8rem+env(safe-area-inset-bottom))] pt-2 sm:px-4', className)}>{children}</main>
      <BottomNav student={student} active={tab} />
    </div>
  );
}
