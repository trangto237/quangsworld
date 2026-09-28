import { useEffect } from 'react';
import { ThemeToggle, cx, useQuery, useTheme } from '@atlas/ui';
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

  useEffect(() => {
    if (students.length && !students.some((s) => s.id === studentId)) setStudent(students[0].id);
  }, [students, studentId, setStudent]);

  if (!family || students.length === 0) return <Setup hasFamily={!!family} />;
  if (!authed) return <Login name={family.parentName} />;

  const student = students.find((s) => s.id === studentId) ?? students[0];

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <span className="text-2xl">🧭</span>
          <div className="leading-tight">
            <div className="font-display text-lg font-semibold">Atlas · Parent</div>
            <div className="text-xs text-slate-500">Hi, {family.parentName}</div>
          </div>
          <LiveDot />
          <div className="ml-auto flex items-center gap-2">
            {students.length > 1 && (
              <select
                value={student.id}
                onChange={(e) => setStudent(e.target.value)}
                className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold dark:bg-slate-800"
                aria-label="Select child"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.avatar} {s.name}
                  </option>
                ))}
              </select>
            )}
            <ThemeToggle mode={mode} onCycle={cycle} />
            <a href="/" className="hidden rounded-xl px-3 py-2 text-sm font-semibold hover:bg-slate-100 sm:block dark:hover:bg-slate-800">
              Kid app ↗
            </a>
            <button onClick={signOut} className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
              Lock
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-3 pb-2" aria-label="Sections">
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
              {t.icon} {t.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
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
