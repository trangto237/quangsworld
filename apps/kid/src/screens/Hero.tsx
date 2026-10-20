import type { StudentProfile } from '@atlas/db';
import { levelFromXp, studyStreak } from '@atlas/engine';
import { DAY_MS, startOfDay } from '@atlas/shared';
import { InstallButton, ThemeToggle, cx, useQuery, useTheme } from '@atlas/ui';
import { badgesFor } from '../lib/badges';
import { useKidCloud } from '../components/JoinFamily';
import { getPowers } from '../lib/powers';
import { useKid } from '../store';
import { T, TB, tr, useLang } from '../i18n';
import { HeroAvatar, TownScreen, rankFor } from '../town/Shell';
import { Meter, Panel, TownButton } from '../town/ui';

/** The hero sheet: level, the five powers (and how far they've come since the trial), badges, settings. */
export function Hero({ student }: { student: StudentProfile }) {
  const go = useKid((s) => s.go);
  const logout = useKid((s) => s.logout);
  const lang = useLang();
  const { mode, cycle } = useTheme();
  const wallet = useQuery((r) => r.getWallet(student.id), [student.id]);
  const powers = useQuery((r) => getPowers(r, student.id), [student.id]);
  const badges = useQuery((r) => badgesFor(r, student.id), [student.id]);
  const stats = useQuery(
    (r) => {
      const attempts = r.listAttempts(student.id).filter((a) => a.context !== 'placement');
      const week = r.listSessions(student.id, startOfDay(Date.now()) - 6 * DAY_MS).reduce((s, x) => s + x.activeMs, 0);
      return {
        streak: studyStreak(r.listSessions(student.id, Date.now() - 60 * DAY_MS)),
        answered: attempts.length,
        accuracy: attempts.length ? Math.round((attempts.filter((a) => a.correct).length / attempts.length) * 100) : 0,
        minutes: Math.round(week / 60000),
      };
    },
    [student.id],
  );
  const lvl = levelFromXp(wallet.xp);
  const earned = badges.filter((b) => b.earned).length;

  return (
    <TownScreen student={student} tab="hero" back={() => go({ name: 'hub' })} showPowers={false} className="space-y-4">
      <Panel className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <HeroAvatar student={student} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl font-bold leading-tight">{student.name}</h1>
          <p className="font-semibold text-ink-soft">
            Lv {lvl.level} · <T en={rankFor(lvl.level)} />
          </p>
          <Meter value={lvl.into} max={lvl.needed} color="#ffc23d" className="mt-2 h-4" />
          <p className="mt-1 text-xs font-semibold text-ink-soft">
            <T en="{a} / {b} XP to level {n}" vars={{ a: lvl.into, b: lvl.needed, n: lvl.level + 1 }} />
          </p>
        </div>
        <TownButton tone="amber" onClick={() => go({ name: 'shop' })}>
          <TB en="👑 Outfit" />
        </TownButton>
      </Panel>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          [
            ['🔥', stats.streak, 'day streak'],
            ['⚔️', stats.answered, 'questions answered'],
            ['🎯', `${stats.accuracy}%`, 'right answers'],
            ['⏱️', stats.minutes, 'minutes this week'],
          ] as const
        ).map(([icon, v, label]) => (
          <Panel key={label} as="div" className="p-3 text-center">
            <div className="text-2xl">{icon}</div>
            <div className="font-display text-2xl font-bold tabular-nums">{v}</div>
            <div className="text-xs font-semibold text-ink-soft">
              <T en={label} />
            </div>
          </Panel>
        ))}
      </div>

      <Panel>
        <h2 className="font-display text-xl font-bold">
          <T en="⚡ Powers" />
        </h2>
        <p className="text-sm text-ink-soft">
          <T en="They grow as you master the topics behind them. The mark shows where you started in the trial." />
        </p>
        <ul className="mt-3 space-y-3">
          {powers.map((p) => {
            const gain = p.start !== undefined ? p.value - p.start : 0;
            return (
              <li key={p.id} className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl border-2 border-ink text-xl" style={{ background: `${p.color}55` }}>
                  {p.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate font-display font-bold">
                      <T en={p.name} />
                    </span>
                    <span className="shrink-0 font-display font-bold tabular-nums">
                      {p.value}
                      {gain !== 0 && <span className={cx('ml-1 text-xs', gain > 0 ? 'text-[#2f8a3a]' : 'text-[#c0392b]')}>{gain > 0 ? `+${gain}` : gain}</span>}
                    </span>
                  </div>
                  <div className="relative">
                    <Meter value={p.value} max={100} color={p.color} />
                    {p.start !== undefined && <span className="absolute -top-0.5 h-4 w-0.5 rounded bg-ink" style={{ left: `${p.start}%` }} title={tr(lang, 'Trial')} />}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Panel>

      <Panel>
        <h2 className="font-display text-xl font-bold">
          <T en="🏅 Badges" /> <span className="text-base text-ink-soft">{earned}/{badges.length}</span>
        </h2>
        <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {badges.map((b) => (
            <li key={b.id} className={cx('rounded-xl border-2 border-ink p-2 text-center', b.earned ? 'bg-[#ffe7a8]' : 'bg-paper-2')}>
              <div className={cx('text-3xl', !b.earned && 'opacity-35 grayscale')}>{b.icon}</div>
              <div className="font-display text-sm font-bold leading-tight">
                <T en={b.name} />
              </div>
              <div className="text-[11px] leading-snug text-ink-soft">
                <T en={b.how} />
              </div>
              {!b.earned && b.progress && (
                <div className="mt-1">
                  <Meter value={b.progress[0]} max={b.progress[1]} color="#ffc23d" className="h-2" />
                  <div className="text-[10px] font-bold tabular-nums text-ink-soft">
                    {b.progress[0]}/{b.progress[1]}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </Panel>

      <CloudCard />

      <Panel className="flex flex-wrap items-center gap-2">
        <TownButton tone="paper" onClick={() => go({ name: 'mistakes' })}>
          <TB en="📕 Mistake Book" />
        </TownButton>
        <InstallButton
          className="town-btn rounded-xl bg-[#4b8fe2] px-4 py-2 font-display font-bold text-white"
          labels={{
            install: <TB en="📲 Install the app" />,
            iosTitle: tr(lang, 'Put Atlas on your home screen'),
            iosSteps: (
              <ol className="list-decimal space-y-2 pl-5">
                <li>
                  <T en="In Safari, tap the Share button (the square with an arrow) at the bottom of the screen." />
                </li>
                <li>
                  <T en="Scroll down and tap “Add to Home Screen”, then “Add”." />
                </li>
                <li>
                  <T en="Open Atlas from its new icon — it works like an app, even offline." />
                </li>
              </ol>
            ),
            done: <T en="Got it" />,
          }}
        />
        <span className="town-btn inline-flex items-center gap-2 rounded-xl bg-paper px-3 py-1.5 font-display font-bold">
          <T en="Day / night" />
          <ThemeToggle mode={mode} onCycle={cycle} />
        </span>
        <TownButton tone="paper" className="ml-auto" onClick={logout}>
          <TB en="⇄ Switch player" />
        </TownButton>
      </Panel>
    </TownScreen>
  );
}

const ago = (t: number | null) => {
  if (!t) return 'never';
  const m = Math.round((Date.now() - t) / 60000);
  return m < 1 ? 'just now' : m < 60 ? `${m} min ago` : m < 48 * 60 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} days ago`;
};

/** Is this device saving to the family cloud? Without it, progress stays on this device only. */
function CloudCard() {
  const { cloud, status } = useKidCloud();
  const logout = useKid((s) => s.logout);
  const lang = useLang();
  if (status.state === 'unconfigured') return null;
  const connected = ['synced', 'syncing', 'offline', 'error'].includes(status.state);
  return (
    <Panel className={cx('flex flex-wrap items-center gap-3', !connected && 'bg-[#ffe1d9]')}>
      <span className="text-3xl">{connected ? (status.state === 'error' ? '⚠️' : '☁️') : '📵'}</span>
      <div className="min-w-0 flex-1">
        <div className="font-display text-lg font-bold">
          {status.state === 'synced' || status.state === 'syncing' ? (
            <T en="Saved to the family cloud" />
          ) : status.state === 'offline' ? (
            <T en="Offline — saving on this device for now" />
          ) : status.state === 'error' ? (
            <T en="Cloud sync problem" />
          ) : (
            <T en="This device isn't connected to the family" />
          )}
        </div>
        <div className="text-sm text-ink-soft">
          {connected ? (
            <>
              {status.email ?? tr(lang, 'Family code')} · <T en="last synced {t}" vars={{ t: tr(lang, ago(status.lastSyncedAt)) }} />
              {status.pending > 0 && <> · <T en="{n} changes waiting" vars={{ n: status.pending }} /></>}
              {status.state === 'error' && status.error && <span className="block text-[#c0392b]">{status.error}</span>}
            </>
          ) : (
            <T en="Progress made here stays on this device and won't show on your other devices. Connect with your email or the family code." />
          )}
        </div>
      </div>
      {connected ? (
        <TownButton tone="blue" size="sm" disabled={status.state === 'syncing'} onClick={() => void cloud.syncNow().catch(() => undefined)}>
          <TB en="🔄 Sync now" />
        </TownButton>
      ) : (
        <TownButton tone="green" size="sm" onClick={logout}>
          <TB en="Connect" />
        </TownButton>
      )}
    </Panel>
  );
}
