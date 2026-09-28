import { useState } from 'react';
import { Button, Card, Field, ThemeToggle, inputClass, useRepo, useTheme } from '@atlas/ui';

export function Settings() {
  const repo = useRepo();
  const { mode, cycle } = useTheme();
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title="Appearance">
        <div className="flex items-center justify-between">
          <span className="text-sm">Theme (applies to both apps)</span>
          <ThemeToggle mode={mode} onCycle={cycle} className="ring-1 ring-slate-200 dark:ring-slate-700" />
        </div>
      </Card>
      <Card title="Parent password">
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await repo.changeParentPassword(oldPw, newPw);
              setMsg({ ok: true, text: 'Password changed.' });
              setOldPw('');
              setNewPw('');
            } catch (err) {
              setMsg({ ok: false, text: (err as Error).message });
            }
          }}
        >
          <Field label="Current password">
            <input className={inputClass} type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} autoComplete="current-password" />
          </Field>
          <Field label="New password">
            <input className={inputClass} type="password" minLength={4} value={newPw} onChange={(e) => setNewPw(e.target.value)} autoComplete="new-password" />
          </Field>
          {msg && <p className={`text-sm font-semibold ${msg.ok ? 'text-emerald-600' : 'text-rose-600'}`}>{msg.text}</p>}
          <Button type="submit" disabled={!oldPw || newPw.length < 4}>
            Change password
          </Button>
        </form>
      </Card>
      <Card title="Privacy & storage" className="lg:col-span-2">
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
          <li>All data lives on this device in an encrypted SQLite database (AES-GCM, non-exportable device key). Nothing is sent to a server.</li>
          <li>Uploaded materials are encrypted too and stay private to your family.</li>
          <li>The app works offline once loaded. Progress is autosaved after every answer.</li>
          <li>Cloud sync between devices (Supabase) is planned for a future release.</li>
        </ul>
      </Card>
    </div>
  );
}
