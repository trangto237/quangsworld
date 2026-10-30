import { useEffect, useState } from 'react';
import { Button, Field, inputClass } from '@atlas/ui';
import { useCloud } from './Cloud';
import { tr } from '../i18n';

/**
 * Parent: the child's own username + password. The child signs in with it on the Atlas sign-in
 * screen and goes straight to their profile (the parent's email opens this dashboard instead).
 */
export function ChildLogin({ studentId, name }: { studentId: string; name: string }) {
  const { cloud, status } = useCloud();
  const [login, setLogin] = useState<string | null | undefined>(undefined);
  const [editing, setEditing] = useState<'new' | 'password' | null>(null);
  const [username, setUsername] = useState('');
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const parent = status.role === 'parent' && (status.state === 'synced' || status.state === 'syncing' || status.state === 'offline');

  const load = async () => {
    try {
      const all = await cloud.childLogins();
      setLogin(all.find((l) => l.studentId === studentId)?.username ?? null);
    } catch (e) {
      setError((e as Error).message);
    }
  };
  useEffect(() => {
    if (parent) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parent, studentId]);

  if (!parent)
    return <p className="mt-2 text-xs text-slate-500">{tr('Child login: sign in to family cloud sync (Settings) to make {name} a username and password.', { name })}</p>;

  const run = (fn: () => Promise<void>, done: string) => async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await fn();
      setNote(done);
      setEditing(null);
      setPw('');
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-3 rounded-lg bg-slate-50 p-2 text-xs dark:bg-slate-800/60">
      <div className="font-semibold text-slate-600 dark:text-slate-300">🔑 {tr('{name}’s login', { name })}</div>
      {login === undefined ? (
        <p className="text-slate-500">{tr('Loading…')}</p>
      ) : login ? (
        <p className="mt-0.5">
          {tr('Username: {username} · signs in at {host}', { host: location.host })
            .split(/(\{username\})/)
            .map((part, i) => (part === '{username}' ? <b key={i} className="font-mono text-sm">{login}</b> : part))}
        </p>
      ) : (
        <p className="mt-0.5 text-slate-500">{tr('No login yet — {name} can’t sign in on their own device.', { name })}</p>
      )}
      {note && <p className="mt-1 font-semibold text-emerald-700 dark:text-emerald-400">✓ {note}</p>}
      {error && <p className="mt-1 font-semibold text-rose-600">{error}</p>}
      {editing ? (
        <form className="mt-2 space-y-2" onSubmit={editing === 'new' ? run(() => cloud.createChildLogin(username, pw, studentId, name), tr('{name} can now sign in as “{username}”.', { name, username: username.trim().toLowerCase() })) : run(() => cloud.setChildPassword(login!, pw), tr('Password changed.'))}>
          {editing === 'new' && (
            <Field label={tr('Username')} hint={tr('Letters and numbers, e.g. quang or quang.nguyen')}>
              <input className={inputClass} value={username} onChange={(e) => setUsername(e.target.value)} autoCapitalize="none" spellCheck={false} required minLength={3} maxLength={30} />
            </Field>
          )}
          <Field label={editing === 'new' ? tr('Password') : tr('New password')} hint={tr('At least 6 characters')}>
            <input className={inputClass} type="text" value={pw} onChange={(e) => setPw(e.target.value)} required minLength={6} autoComplete="new-password" />
          </Field>
          <div className="flex gap-2">
            <Button type="submit" disabled={busy}>
              {editing === 'new' ? tr('Create login') : tr('Save password')}
            </Button>
            <Button type="button" variant="ghost" onClick={() => (setEditing(null), setError(null))}>
              {tr('Cancel')}
            </Button>
          </div>
        </form>
      ) : (
        <div className="mt-1 flex flex-wrap gap-1">
          <Button variant="ghost" onClick={() => (setEditing('new'), setNote(null), setUsername(login ?? ''))}>
            {login ? tr('Change username') : tr('+ Create login')}
          </Button>
          {login && (
            <>
              <Button variant="ghost" onClick={() => (setEditing('password'), setNote(null))}>
                {tr('Reset password')}
              </Button>
              <Button
                variant="ghost"
                className="text-rose-600"
                onClick={() =>
                  confirm(tr('Remove {name}’s login “{username}”? Devices signed in with it are signed out. {name}’s progress is kept.', { name, username: login })) &&
                  void run(() => cloud.deleteChildLogin(login), tr('Login removed.'))({ preventDefault() {} } as React.FormEvent)
                }
              >
                {tr('Remove')}
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
