import { useState } from 'react';
import type { StudentProfile } from '@atlas/db';
import { Button, Card, Modal, useQuery, useRepo } from '@atlas/ui';
import { StudentForm } from '../components/StudentForm';
import { TimeLimitSetting } from '../components/ScreenTime';
import { ChildLogin } from '../components/ChildLogin';
import { tr } from '../i18n';

type LangMode = 'help' | 'vi' | 'en';
/** Labels are English keys, shown with tr(). */
const LANG_OPTIONS: { value: LangMode; label: string }[] = [
  { value: 'help', label: 'English + Vietnamese help (hover/tap)' },
  { value: 'vi', label: 'Mostly Vietnamese (English on hover)' },
  { value: 'en', label: 'English only (immersion)' },
];

/** How much Vietnamese the kid app shows for this child. */
function LanguageSelect({ studentId }: { studentId: string }) {
  const repo = useRepo();
  const value = useQuery((r) => r.getKv<LangMode>(`lang:${studentId}`) ?? 'help', [studentId]);
  return (
    <label className="mt-2 block text-xs">
      <span className="font-semibold text-slate-600 dark:text-slate-300">{tr('Kid app language')}</span>
      <select
        value={value}
        onChange={(e) => void repo.setKv(`lang:${studentId}`, e.target.value)}
        className="mt-1 block w-full rounded-lg bg-slate-100 px-2 py-1.5 text-sm dark:bg-slate-800"
      >
        {LANG_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {tr(o.label)}
          </option>
        ))}
      </select>
    </label>
  );
}

/** The Code Lab island (coding with blocks, JavaScript, Python) stays locked until a parent switches it on. */
function CodeLabSwitch({ studentId }: { studentId: string }) {
  const repo = useRepo();
  const on = useQuery((r) => !!r.getKv<boolean>(`code-unlocked:${studentId}`), [studentId]);
  const done = useQuery((r) => r.getKv<string[]>(`code-done:${studentId}`)?.length ?? 0, [studentId]);
  return (
    <label className="mt-2 flex items-center gap-2 text-xs">
      <input type="checkbox" checked={on} onChange={(e) => void repo.setKv(`code-unlocked:${studentId}`, e.target.checked ? true : null)} />
      <span>
        <span className="font-semibold text-slate-600 dark:text-slate-300">{tr('💻 Code Lab island')}</span>
        <span className="block text-slate-500">{on ? tr('Unlocked · {n} lessons done', { n: done }) : tr('Locked — tick to let them learn coding by making games')}</span>
      </span>
    </label>
  );
}

export function Profiles() {
  const repo = useRepo();
  const students = useQuery((r) => r.listStudents());
  const [editing, setEditing] = useState<StudentProfile | 'new' | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h1 className="text-2xl font-extrabold">{tr('Profiles')}</h1>
        <Button onClick={() => setEditing('new')}>{tr('+ Add child')}</Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {students.map((s) => (
          <Card key={s.id}>
            <div className="flex items-center gap-3">
              <span className="text-5xl">{s.avatar}</span>
              <div>
                <div className="text-lg font-extrabold">{s.name}</div>
                <div className="text-sm text-slate-500">
                  {tr('Age {age} · Grade {grade}', { age: s.age, grade: s.grade })} {s.hasPin && tr('· 🔒 PIN')}
                </div>
                <div className="text-xs text-slate-500">{s.placementDone ? tr('Placement complete') : tr('Placement not taken yet')}</div>
                <LanguageSelect studentId={s.id} />
                <CodeLabSwitch studentId={s.id} />
                <TimeLimitSetting studentId={s.id} />
                <ChildLogin studentId={s.id} name={s.name} />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => setEditing(s)}>
                {tr('Edit')}
              </Button>
              {s.placementDone && (
                <Button variant="ghost" onClick={() => confirm(tr('Let {name} retake the placement trial? Current mastery is kept until the new result.', { name: s.name })) && void repo.resetPlacement(s.id)}>
                  {tr('Retake placement')}
                </Button>
              )}
              {s.hasPin && (
                <Button variant="ghost" onClick={() => void repo.updateStudent(s.id, { pin: null })}>
                  {tr('Remove PIN')}
                </Button>
              )}
              <Button
                variant="ghost"
                className="text-amber-700 dark:text-amber-400"
                title={tr('Start over: clears answers, placement, Mistake Book, exam results and rewards. Keeps the profile, PIN, goals and language.')}
                onClick={() =>
                  confirm(
                    tr('Reset {name}’s progress?\n\nThis clears all answers, the placement trial, the Mistake Book, exam results, coins and unlocked items. {name} starts again with the placement trial.\n\nThe profile, PIN, goals and language setting stay. This cannot be undone.', { name: s.name }),
                  ) && void repo.resetStudentProgress(s.id)
                }
              >
                {tr('Reset progress')}
              </Button>
              <Button variant="ghost" className="text-rose-600" onClick={() => confirm(tr('Delete {name} and all progress? This cannot be undone.', { name: s.name })) && void repo.removeStudent(s.id)}>
                {tr('Delete')}
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? tr('Add child') : tr('Edit profile')}>
        {editing && (
          <StudentForm
            initial={editing === 'new' ? undefined : { ...editing, pin: '' }}
            submitLabel={editing === 'new' ? tr('Create profile') : tr('Save')}
            onSubmit={async (v) => {
              if (editing === 'new') await repo.addStudent({ ...v, pin: v.pin || undefined });
              else await repo.updateStudent(editing.id, { name: v.name, age: v.age, grade: v.grade, avatar: v.avatar, ...(v.pin ? { pin: v.pin } : {}) });
              setEditing(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}
