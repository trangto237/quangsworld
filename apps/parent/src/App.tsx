import { useEffect } from 'react';
import { InstallButton, ThemeToggle, cx, useQuery, useTheme } from '@atlas/ui';
import { installLabels } from './components/install';
import { useParent, type Tab } from './store';
import { Setup } from './screens/Setup';
import { Login } from './screens/Login';
import { Dashboard } from './screens/Dashboard';
import { KnowledgeMap } from './screens/KnowledgeMap';
import { Goals } from './screens/Goals';
import { Materials } from './screens/Materials';
import { Profiles } from './screens/Profiles';
import { Settings } from './screens/Settings';
import { LiveDot } from './components/LiveDot';
import { TimeRequests } from './components/ScreenTime';
import { CloudBadge, useCloud } from './components/Cloud';
import { confirmSignOut } from '@atlas/db/cloud';
import { LangToggle, tr } from './i18n';

/** Labels are English keys, shown with tr(). */
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'knowledge', label: 'Knowledge map', icon: '🧠' },
  { id: 'goals', label: 'Goals', icon: '🎯' },
  { id: 'materials', label: 'Materials', icon: '📚' },
  { id: 'profiles', label: 'Profiles', icon: '👤' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export function App() {
  const family = useQuery((r) => r.getFamily());
  const students = useQuery((r) => r.listStudents());
  const { authed, tab, setTab, studentId, setStudent, signOut } = useParent();
  const { mode, cycle } = useTheme();
  const { cloud, status: cloudStatus } = useCloud();
  const signedInOnline = !!cloudStatus.email || !!cloudStatus.viaCode;

  useEffect(() => {
    if (students.length && !students.some((s) => s.id === studentId)) setStudent(students[0].id);
  }, [students, studentId, setStudent]);

  // One sign-in screen for everyone (/): a signed-out parent goes there, except to create a new family.
  const newFamily = new URLSearchParams(location.search).has('new');
  const noSignIn = (() => {
    try {
      return sessionStorage.getItem('atlas-no-signin') === '1';
    } catch {
      return false;
    }
  })();
  if (cloud.config() && cloudStatus.state === 'signed-out' && !newFamily && !noSignIn) {
    location.replace('/');
    return null;
  }
  if (!family || students.length === 0) return <Setup hasFamily={!!family} />;
  if (!authed) return <Login name={family.parentName} />;

  const student = students.find((s) => s.id === studentId) ?? students[0];

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <span className="text-2xl">🧭</span>
          <div className="leading-tight">
            <div className="font-display text-lg font-semibold">{tr('Atlas · Parent')}</div>
            <div className="text-xs text-slate-500">{tr('Hi, {name}', { name: family.parentName })}</div>
          </div>
          <LiveDot />
          <CloudBadge onClick={() => setTab('settings')} />
          <div className="ml-auto flex items-center gap-2">
            {students.length > 1 && (
              <select
                value={student.id}
                onChange={(e) => setStudent(e.target.value)}
                className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold dark:bg-slate-800"
                aria-label={tr('Select child')}
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.avatar} {s.name}
                  </option>
                ))}
              </select>
            )}
            <InstallButton labels={installLabels()} className="rounded-xl px-3 py-2 text-sm font-semibold text-brand-600 hover:bg-slate-100 dark:text-brand-400 dark:hover:bg-slate-800" />
            <LangToggle />
            <ThemeToggle mode={mode} onCycle={cycle} label={mode === 'dark' ? tr('Dark') : mode === 'light' ? tr('Light') : tr('System')} />
            <a href={`/?play=${student.id}`} title={tr('Open {name}’s app on this device', { name: student.name })} className="rounded-xl px-3 py-2 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800">
              ▶ {tr('{name}’s app', { name: student.name })}
            </a>
            <button onClick={signOut} title={tr('Lock the dashboard (stay signed in on this device)')} className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
              {tr('Lock')}
            </button>
            {signedInOnline && (
              <button
                onClick={async () => {
                  const out = await confirmSignOut(cloud, {
                    ask: tr('Sign out of Atlas on this device?\n\nYour family’s data stays safe in the cloud and is removed from this device. Sign in again any time to get it back.'),
                    unsynced: tr('Sign out anyway? Progress made on this device since the last sync will be lost.'),
                  });
                  if (out) signOut();
                }}
                className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {tr('Sign out')}
              </button>
            )}
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl flex-wrap gap-1 px-3 pb-2 sm:flex-nowrap sm:overflow-x-auto" aria-label={tr('Sections')}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cx(
                'shrink-0 rounded-xl px-3 py-2 text-sm font-semibold',
                tab === t.id ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
              )}
              aria-current={tab === t.id ? 'page' : undefined}
            >
              {t.icon} {tr(t.label)}
            </button>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl space-y-4 px-4 py-6">
        <TimeRequests students={students} />
        {tab === 'dashboard' && <Dashboard student={student} />}
        {tab === 'knowledge' && <KnowledgeMap student={student} />}
        {tab === 'goals' && <Goals student={student} />}
        {tab === 'materials' && <Materials />}
        {tab === 'profiles' && <Profiles />}
        {tab === 'settings' && <Settings />}
      </main>
    </div>
  );
}
