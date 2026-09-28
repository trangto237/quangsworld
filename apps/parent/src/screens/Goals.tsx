import type { StudentProfile } from '@atlas/db';
import { dailyMinutes } from '@atlas/engine';
import { SUBJECTS, getConcept } from '@atlas/knowledge';
import type { SubjectId } from '@atlas/shared';
import { Button, Card, cx, useQuery, useRepo } from '@atlas/ui';
import { useParent } from '../store';

const BANDS = ['5.5', '6.0', '6.5', '7.0', '7.5', '8.0'];

export function Goals({ student }: { student: StudentProfile }) {
  const repo = useRepo();
  const setTab = useParent((s) => s.setTab);
  const goals = useQuery((r) => r.listGoals(student.id), [student.id]);
  const minutes = dailyMinutes(goals);
  const focusSubjects = goals.filter((g) => g.kind === 'focusSubject');
  const focusConcepts = goals.filter((g) => g.kind === 'focusConcept');
  const ielts = goals.find((g) => g.kind === 'ieltsTarget');

  const toggleSubject = async (id: SubjectId) => {
    const g = focusSubjects.find((x) => x.value === id);
    if (g) await repo.deleteGoal(g.id);
    else await repo.setGoal(student.id, 'focusSubject', id);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title="Daily study time">
        <p className="text-sm text-slate-500">The daily quest is sized to this. 20–30 minutes a day works better than long weekend sessions.</p>
        <div className="mt-4 flex items-center gap-4">
          <input
            type="range"
            min={10}
            max={60}
            step={5}
            value={minutes}
            onChange={(e) => void repo.setGoal(student.id, 'dailyMinutes', e.target.value)}
            className="flex-1 accent-brand-600"
            aria-label="Daily minutes"
          />
          <span className="w-20 text-right text-2xl font-extrabold tabular-nums">{minutes}m</span>
        </div>
        <p className="mt-2 text-xs text-slate-500">Changes apply from the next day's quest.</p>
      </Card>

      <Card title="IELTS target">
        <p className="text-sm text-slate-500">Adds weight to concepts that appear in IELTS tasks.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {BANDS.map((b) => (
            <button
              key={b}
              onClick={() => void (ielts?.value === b ? repo.deleteGoal(ielts.id) : repo.setGoal(student.id, 'ieltsTarget', b))}
              className={cx('rounded-xl px-4 py-2 font-bold ring-1', ielts?.value === b ? 'bg-brand-600 text-white ring-brand-600' : 'ring-slate-300 hover:bg-slate-50 dark:ring-slate-700 dark:hover:bg-slate-800')}
            >
              {b}
            </button>
          ))}
        </div>
      </Card>

      <Card title="Focus subjects">
        <p className="text-sm text-slate-500">Focus subjects get priority in daily missions (the engine still mixes in reviews).</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {SUBJECTS.map((s) => {
            const on = focusSubjects.some((g) => g.value === s.id);
            return (
              <button
                key={s.id}
                onClick={() => void toggleSubject(s.id)}
                aria-pressed={on}
                className={cx('rounded-xl px-4 py-3 text-left font-semibold ring-2', on ? 'bg-brand-50 ring-brand-500 dark:bg-brand-700/20' : 'ring-slate-200 hover:bg-slate-50 dark:ring-slate-800 dark:hover:bg-slate-800')}
              >
                {s.emoji} {s.name} {on && '✓'}
              </button>
            );
          })}
        </div>
      </Card>

      <Card title="Focus concepts">
        {focusConcepts.length ? (
          <ul className="space-y-2">
            {focusConcepts.map((g) => (
              <li key={g.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/60">
                <span className="font-semibold">{getConcept(g.value)?.name ?? g.value}</span>
                <Button variant="ghost" onClick={() => void repo.deleteGoal(g.id)}>
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No focus concepts. Pick specific concepts from the knowledge map.</p>
        )}
        <Button variant="secondary" className="mt-4" onClick={() => setTab('knowledge')}>
          Open knowledge map
        </Button>
      </Card>
    </div>
  );
}
