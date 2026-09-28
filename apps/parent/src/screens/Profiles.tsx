import { useState } from 'react';
import type { StudentProfile } from '@atlas/db';
import { Button, Card, Modal, useQuery, useRepo } from '@atlas/ui';
import { StudentForm } from '../components/StudentForm';

export function Profiles() {
  const repo = useRepo();
  const students = useQuery((r) => r.listStudents());
  const [editing, setEditing] = useState<StudentProfile | 'new' | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h1 className="text-2xl font-extrabold">Profiles</h1>
        <Button onClick={() => setEditing('new')}>+ Add child</Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {students.map((s) => (
          <Card key={s.id}>
            <div className="flex items-center gap-3">
              <span className="text-5xl">{s.avatar}</span>
              <div>
                <div className="text-lg font-extrabold">{s.name}</div>
                <div className="text-sm text-slate-500">
                  Age {s.age} · Grade {s.grade} {s.hasPin && '· 🔒 PIN'}
                </div>
                <div className="text-xs text-slate-500">{s.placementDone ? 'Placement complete' : 'Placement not taken yet'}</div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => setEditing(s)}>
                Edit
              </Button>
              {s.placementDone && (
                <Button variant="ghost" onClick={() => confirm(`Let ${s.name} retake the placement trial? Current mastery is kept until the new result.`) && void repo.resetPlacement(s.id)}>
                  Retake placement
                </Button>
              )}
              {s.hasPin && (
                <Button variant="ghost" onClick={() => void repo.updateStudent(s.id, { pin: null })}>
                  Remove PIN
                </Button>
              )}
              <Button variant="ghost" className="text-rose-600" onClick={() => confirm(`Delete ${s.name} and all progress? This cannot be undone.`) && void repo.removeStudent(s.id)}>
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add child' : 'Edit profile'}>
        {editing && (
          <StudentForm
            initial={editing === 'new' ? undefined : { ...editing, pin: '' }}
            submitLabel={editing === 'new' ? 'Create profile' : 'Save'}
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
