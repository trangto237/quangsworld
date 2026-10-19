import { useState } from 'react';
import { Button, Card, Field, ThemeToggle, inputClass, useRepo, useTheme } from '@atlas/ui';
import { CloudCardBody, useCloud } from '../components/Cloud';

export function Settings() {
  const repo = useRepo();
  const { mode, cycle } = useTheme();
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const { cloud, status } = useCloud();
  const parentOnline = status.role === 'parent' && !!status.email;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title="Appearance">
        <div className="flex items-center justify-between">
          <span className="text-sm">Theme (applies to both apps)</span>
          <ThemeToggle mode={mode} onCycle={cycle} className="ring-1 ring-slate-200 dark:ring-slate-700" />
        </div>
      </Card>
      <Card title={parentOnline ? 'Parent account' : 'Parent password'}>
        {parentOnline && (
          <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">
            Signed in as <b>{status.email}</b>. This one password signs you in on every device and unlocks this dashboard.
          </p>
        )}
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              if (!(await repo.verifyParent(oldPw))) throw new Error('Current password is incorrect');
              if (parentOnline) {
                if (newPw.length < 6) throw new Error('Use at least 6 characters.');
                await cloud.changePassword(newPw);
              }
              await repo.changeParentPassword(oldPw, newPw);
              setMsg({ ok: true, text: parentOnline ? 'Password changed on all your devices.' : 'Password changed.' });
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
      <Card title="☁️ Cloud sync (Supabase)" className="lg:col-span-2">
        <CloudCardBody />
      </Card>
      <Card title="Privacy & storage" className="lg:col-span-2">
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
          <li>Data lives on each device in an encrypted SQLite database (AES-GCM, non-exportable device key).</li>
          <li>Without cloud sync nothing is sent to a server. With it, progress is copied to your own Supabase project, where row-level security lets only your family account read it.</li>
          <li>Uploaded files are encrypted and stay on the device where they were added.</li>
          <li>The app works offline once loaded. Progress is autosaved after every answer and uploaded when back online.</li>
        </ul>
      </Card>
    </div>
  );
}
