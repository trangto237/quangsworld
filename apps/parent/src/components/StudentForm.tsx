import { useState } from 'react';
import { AVATARS, Button, Field, cx, inputClass } from '@atlas/ui';

export interface StudentFormValue {
  name: string;
  age: number;
  grade: number;
  avatar: string;
  pin: string;
}

export function StudentForm({ initial, onSubmit, submitLabel, pinOptional = true }: { initial?: Partial<StudentFormValue>; onSubmit: (v: StudentFormValue) => void | Promise<void>; submitLabel: string; pinOptional?: boolean }) {
  const [v, setV] = useState<StudentFormValue>({ name: '', age: 14, grade: 9, avatar: '🦊', pin: '', ...initial });
  const [busy, setBusy] = useState(false);
  const pinOk = v.pin === '' || /^\d{4}$/.test(v.pin);
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!v.name.trim() || !pinOk) return;
        setBusy(true);
        try {
          await onSubmit({ ...v, name: v.name.trim() });
        } finally {
          setBusy(false);
        }
      }}
    >
      <Field label="Child's name">
        <input className={inputClass} value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} required maxLength={40} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Age">
          <input className={inputClass} type="number" min={6} max={19} value={v.age} onChange={(e) => setV({ ...v, age: Number(e.target.value) })} />
        </Field>
        <Field label="School grade">
          <input className={inputClass} type="number" min={1} max={12} value={v.grade} onChange={(e) => setV({ ...v, grade: Number(e.target.value) })} />
        </Field>
      </div>
      <Field label="Avatar">
        <div className="flex flex-wrap gap-2">
          {AVATARS.map((a) => (
            <button
              type="button"
              key={a}
              onClick={() => setV({ ...v, avatar: a })}
              className={cx('grid size-11 place-items-center rounded-xl text-2xl ring-2', v.avatar === a ? 'bg-brand-50 ring-brand-500 dark:bg-brand-700/30' : 'ring-transparent hover:bg-slate-100 dark:hover:bg-slate-800')}
              aria-label={`Avatar ${a}`}
            >
              {a}
            </button>
          ))}
        </div>
      </Field>
      <Field label={pinOptional ? 'Kid PIN (optional, 4 digits)' : 'Kid PIN (4 digits)'} hint="Protects the profile when siblings share a device. Leave blank for none.">
        <input className={inputClass} inputMode="numeric" pattern="\d{4}" maxLength={4} value={v.pin} onChange={(e) => setV({ ...v, pin: e.target.value.replace(/\D/g, '') })} />
      </Field>
      <Button type="submit" disabled={busy || !v.name.trim() || !pinOk} className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}
