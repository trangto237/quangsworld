import { useState } from 'react';
import { Button, Card, Field, ThemeToggle, inputClass, useRepo, useTheme } from '@atlas/ui';
import { CloudCardBody, useCloud } from '../components/Cloud';
import { tr } from '../i18n';

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
      <Card title={tr('Appearance')}>
        <div className="flex items-center justify-between">
          <span className="text-sm">{tr('Theme (applies to both apps)')}</span>
          <ThemeToggle mode={mode} onCycle={cycle} className="ring-1 ring-slate-200 dark:ring-slate-700" />
        </div>
      </Card>
      <Card title={parentOnline ? tr('Parent account') : tr('Parent password')}>
        {parentOnline && (
          <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">
            {tr('Signed in as {email}. This one password signs you in on every device and unlocks this dashboard.')
              .split(/(\{email\})/)
              .map((part, i) => (part === '{email}' ? <b key={i}>{status.email}</b> : part))}
          </p>
        )}
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              if (!(await repo.verifyParent(oldPw))) throw new Error(tr('Current password is incorrect'));
              if (parentOnline) {
                if (newPw.length < 6) throw new Error(tr('Use at least 6 characters.'));
                await cloud.changePassword(newPw);
              }
              await repo.changeParentPassword(oldPw, newPw);
              setMsg({ ok: true, text: parentOnline ? tr('Password changed on all your devices.') : tr('Password changed.') });
              setOldPw('');
              setNewPw('');
            } catch (err) {
              setMsg({ ok: false, text: (err as Error).message });
            }
          }}
        >
          <Field label={tr('Current password')}>
            <input className={inputClass} type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} autoComplete="current-password" />
          </Field>
          <Field label={tr('New password')}>
            <input className={inputClass} type="password" minLength={4} value={newPw} onChange={(e) => setNewPw(e.target.value)} autoComplete="new-password" />
          </Field>
          {msg && <p className={`text-sm font-semibold ${msg.ok ? 'text-emerald-600' : 'text-rose-600'}`}>{msg.text}</p>}
          <Button type="submit" disabled={!oldPw || newPw.length < 4}>
            {tr('Change password')}
          </Button>
        </form>
      </Card>
      <Card title={tr('☁️ Cloud sync (Supabase)')} className="lg:col-span-2">
        <CloudCardBody />
      </Card>
      <Card title={tr('Privacy & storage')} className="lg:col-span-2">
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
          <li>{tr('Data lives on each device in an encrypted SQLite database (AES-GCM, non-exportable device key).')}</li>
          <li>{tr('Without cloud sync nothing is sent to a server. With it, progress is copied to your own Supabase project, where row-level security lets only your family account read it.')}</li>
          <li>{tr('Uploaded files are encrypted and stay on the device where they were added.')}</li>
          <li>{tr('The app works offline once loaded. Progress is autosaved after every answer and uploaded when back online.')}</li>
        </ul>
      </Card>
    </div>
  );
}
