import { useEffect, useState } from 'react';
import { Button, Field, inputClass } from '@atlas/ui';
import { useCloud } from './Cloud';

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
    return <p className="mt-2 text-xs text-slate-500">Child login: sign in to family cloud sync (Settings) to make {name} a username and password.</p>;

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
      <div className="font-semibold text-slate-600 dark:text-slate-300">🔑 {name}'s login</div>
      {login === undefined ? (
        <p className="text-slate-500">Loading…</p>
      ) : login ? (
        <p className="mt-0.5">
          Username: <b className="font-mono text-sm">{login}</b> · signs in at {location.host}
        </p>
      ) : (
        <p className="mt-0.5 text-slate-500">No login yet — {name} can't sign in on their own device.</p>
      )}
      {note && <p className="mt-1 font-semibold text-emerald-700 dark:text-emerald-400">✓ {note}</p>}
      {error && <p className="mt-1 font-semibold text-rose-600">{error}</p>}
      {editing ? (
        <form className="mt-2 space-y-2" onSubmit={editing === 'new' ? run(() => cloud.createChildLogin(username, pw, studentId, name), `${name} can now sign in as “${username.trim().toLowerCase()}”.`) : run(() => cloud.setChildPassword(login!, pw), 'Password changed.')}>
          {editing === 'new' && (
            <Field label="Username" hint="Letters and numbers, e.g. quang or quang.nguyen">
              <input className={inputClass} value={username} onChange={(e) => setUsername(e.target.value)} autoCapitalize="none" spellCheck={false} required minLength={3} maxLength={30} />
            </Field>
          )}
          <Field label={editing === 'new' ? 'Password' : 'New password'} hint="At least 6 characters">
            <input className={inputClass} type="text" value={pw} onChange={(e) => setPw(e.target.value)} required minLength={6} autoComplete="new-password" />
          </Field>
          <div className="flex gap-2">
            <Button type="submit" disabled={busy}>
              {editing === 'new' ? 'Create login' : 'Save password'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => (setEditing(null), setError(null))}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="mt-1 flex flex-wrap gap-1">
          <Button variant="ghost" onClick={() => (setEditing('new'), setNote(null), setUsername(login ?? ''))}>
            {login ? 'Change username' : '+ Create login'}
          </Button>
          {login && (
            <>
              <Button variant="ghost" onClick={() => (setEditing('password'), setNote(null))}>
                Reset password
              </Button>
              <Button
                variant="ghost"
                className="text-rose-600"
                onClick={() =>
                  confirm(`Remove ${name}'s login “${login}”? Devices signed in with it are signed out. ${name}'s progress is kept.`) &&
                  void run(() => cloud.deleteChildLogin(login), 'Login removed.')({ preventDefault() {} } as React.FormEvent)
                }
              >
                Remove
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
