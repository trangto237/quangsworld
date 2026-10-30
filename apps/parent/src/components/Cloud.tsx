import { useEffect, useState, useSyncExternalStore, type FormEvent } from 'react';
import { confirmSignOut, getCloud, type CloudStatus } from '@atlas/db/cloud';
import { Button, Field, Modal, cx, inputClass, useRepo } from '@atlas/ui';
import { tr } from '../i18n';

/** The cloud-sync controller and its live status. */
export function useCloud() {
  const repo = useRepo();
  const cloud = getCloud(repo);
  const status = useSyncExternalStore(cloud.subscribe, cloud.getStatus);
  return { cloud, status };
}

const ago = (t: number | null) => {
  if (!t) return tr('never');
  const s = Math.round((Date.now() - t) / 1000);
  if (s < 10) return tr('just now');
  if (s < 60) return tr('{n}s ago', { n: s });
  if (s < 3600) return tr('{n} min ago', { n: Math.round(s / 60) });
  return new Date(t).toLocaleString();
};

/** English keys, shown with tr(). */
const LABEL: Record<CloudStatus['state'], string> = {
  unconfigured: 'Not set up',
  'signed-out': 'Signed out',
  'needs-link': 'Not syncing on this device',
  'needs-choice': 'Waiting for your choice',
  syncing: 'Syncing…',
  synced: 'Synced',
  offline: 'Offline — will sync when back online',
  error: 'Sync problem',
};

/** Small header pill; hidden until cloud sync is set up and signed in. */
export function CloudBadge({ onClick }: { onClick: () => void }) {
  const { status } = useCloud();
  if (status.state === 'unconfigured' || status.state === 'signed-out') return null;
  const tone =
    status.state === 'error' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : status.state === 'synced' || status.state === 'syncing' ? 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300' : 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
  return (
    <button onClick={onClick} className={cx('hidden items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold sm:inline-flex', tone)} title={tr('Cloud sync: {state}. Last synced {ago}.', { state: tr(LABEL[status.state]), ago: ago(status.lastSyncedAt) })}>
      ☁️ {status.state === 'synced' ? tr('Synced') : status.state === 'syncing' ? tr('Syncing…') : status.state === 'error' ? tr('Sync error') : status.state === 'offline' ? tr('Offline') : tr('Sync off')}
      {status.pending > 0 && status.state !== 'syncing' && <span className="tabular-nums">· {status.pending}</span>}
    </button>
  );
}

/** Supabase URL + anon key, saved on this device (overrides the build's VITE_SUPABASE_* values). */
function ConfigForm({ onDone }: { onDone?: () => void }) {
  const { cloud } = useCloud();
  const current = cloud.config();
  const [url, setUrl] = useState(current?.url ?? '');
  const [key, setKey] = useState(current?.anonKey ?? '');
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        await cloud.setConfig({ url, anonKey: key });
        setBusy(false);
        onDone?.();
      }}
    >
      <Field label={tr('Supabase project URL')} hint={tr('Supabase → Project Settings → API → Project URL')}>
        <input className={inputClass} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://abcd1234.supabase.co" type="url" required />
      </Field>
      <Field label={tr('Anon (public) key')} hint={tr('The ‘anon public’ key — never the service_role key.')}>
        <input className={inputClass} value={key} onChange={(e) => setKey(e.target.value)} placeholder="eyJhbGciOi…" required autoComplete="off" spellCheck={false} />
      </Field>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={busy || !url || !key}>
          {tr('Save')}
        </Button>
        {cloud.defaultConfig() && (
          <Button
            type="button"
            variant="secondary"
            onClick={async () => {
              await cloud.setConfig(null);
              onDone?.();
            }}
          >
            {tr('Use the app’s built-in settings')}
          </Button>
        )}
      </div>
    </form>
  );
}

/** Email + password for the family cloud account. */
function SignInForm({ onSignedIn }: { onSignedIn?: () => void }) {
  const { cloud } = useCloud();
  const repo = useRepo();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const run = async (e: FormEvent, kind: 'in' | 'up') => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      if (kind === 'up') {
        const r = await cloud.signUp(email.trim(), pw);
        if (r === 'confirm-email') {
          setMsg({ ok: true, text: tr('Account created. Open the confirmation email, then sign in here.') });
          return;
        }
      } else await cloud.signIn(email.trim(), pw);
      await cloud.link('auto');
      // One login: the account's password also unlocks this dashboard from now on.
      await repo.setParentPassword(pw);
      onSignedIn?.();
    } catch (err) {
      const m = (err as Error).message;
      setMsg({ ok: false, text: /failed to fetch|network/i.test(m) ? tr('Can’t reach Supabase. Check the project URL and your internet connection.') : m });
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="space-y-3" onSubmit={(e) => run(e, 'in')}>
      <Field label={tr('Parent email')}>
        <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
      </Field>
      <Field label={tr('Password')} hint={tr('At least 6 characters. It becomes your dashboard password too — one login for everything.')}>
        <input className={inputClass} type="password" value={pw} onChange={(e) => setPw(e.target.value)} minLength={6} required autoComplete="current-password" />
      </Field>
      {msg && <p className={`text-sm font-semibold ${msg.ok ? 'text-emerald-600' : 'text-rose-600'}`}>{msg.text}</p>}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={busy || !email || pw.length < 6}>
          {tr('Sign in')}
        </Button>
        <Button type="button" variant="secondary" disabled={busy || !email || pw.length < 6} onClick={(e) => run(e, 'up')}>
          {tr('Create parent account')}
        </Button>
      </div>
    </form>
  );
}

/** Shown when this device and the cloud both hold data. */
export function LinkChoice() {
  const { cloud, status } = useCloud();
  const [busy, setBusy] = useState(false);
  const choose = async (mode: 'cloud' | 'merge') => {
    setBusy(true);
    try {
      await cloud.link(mode);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal open={status.state === 'needs-choice'} onClose={() => void cloud.unlink()} title={tr('This device and the cloud both have data')}>
      <div className="space-y-3 text-sm">
        <p>{tr('Choose what to keep on this device:')}</p>
        <button disabled={busy} onClick={() => choose('cloud')} className="w-full rounded-xl p-3 text-left ring-1 ring-slate-200 hover:bg-slate-50 dark:ring-slate-700 dark:hover:bg-slate-800">
          <b>{tr('Use the cloud data (recommended for a new device)')}</b>
          <span className="block text-slate-500">{tr('This device’s data is replaced by your family’s cloud data.')}</span>
        </button>
        <button disabled={busy} onClick={() => choose('merge')} className="w-full rounded-xl p-3 text-left ring-1 ring-slate-200 hover:bg-slate-50 dark:ring-slate-700 dark:hover:bg-slate-800">
          <b>{tr('Merge both')}</b>
          <span className="block text-slate-500">{tr('Keep the children and progress from both. The cloud’s parent password is kept.')}</span>
        </button>
        <button disabled={busy} onClick={() => void cloud.unlink()} className="text-sm font-semibold text-slate-500 hover:underline">
          {tr('Cancel — don’t sync this device')}
        </button>
      </div>
    </Modal>
  );
}


/** Parent: the family code a child types into their app to connect a device, and the devices that did. */
function FamilyCode() {
  const { cloud } = useCloud();
  const [code, setCode] = useState<string | null | undefined>(undefined);
  const [devices, setDevices] = useState<{ id: string; label: string | null; email: string | null; joinedAt: string }[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const load = async () => {
    try {
      setCode(await cloud.familyCode());
      setDevices(await cloud.devices());
      setErr(null);
    } catch (e) {
      setErr((e as Error).message);
    }
  };
  useEffect(() => {
    void load();
    const t = window.setInterval(() => void load(), 15_000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const make = async () => {
    if (code && !confirm(tr('Make a new code? The old code stops working (devices already connected stay connected).'))) return;
    setBusy(true);
    try {
      setCode(await cloud.newFamilyCode());
      setErr(null);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
      <div>
        <p className="font-semibold">{tr('Family code')}</p>
        <p className="text-slate-500">
          {tr('Your child uses this once to join the family: in the kid app, {newAccount} (their own email, for 12+) or {codeOnly} (no email). After that they just sign in.')
            .split(/(\{newAccount\}|\{codeOnly\})/)
            .map((part, i) => (part === '{newAccount}' ? <b key={i}>{tr('New account')}</b> : part === '{codeOnly}' ? <b key={i}>{tr('Code only')}</b> : part))}
        </p>
      </div>
      {code === undefined && !err && <p className="text-slate-500">{tr('Loading…')}</p>}
      {code && (
        <div className="flex flex-wrap items-center gap-3">
          <code className="rounded-lg bg-white px-4 py-2 font-mono text-2xl font-bold tracking-widest ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">{code}</code>
          <Button variant="secondary" onClick={() => void navigator.clipboard?.writeText(code)}>
            {tr('Copy')}
          </Button>
        </div>
      )}
      {code !== undefined && (
        <Button variant={code ? 'ghost' : 'primary'} disabled={busy} onClick={make}>
          {code ? tr('Make a new code') : tr('Make a family code')}
        </Button>
      )}
      {err && <p className="text-rose-600">{err}</p>}
      {devices.length > 0 && (
        <div>
          <p className="font-semibold">{tr('Family logins')}</p>
          <p className="text-xs text-slate-500">{tr('Your children’s own accounts and the devices that joined with the code. Only these and your account can see your family’s data.')}</p>
          <ul className="mt-1 divide-y divide-slate-200 dark:divide-slate-700">
            {devices.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-2 py-1.5">
                <span>
                  {d.email ? `👤 ${d.email}` : tr('📱 {name} (family code)', { name: d.label || tr('Device') })}{' '}
                  <span className="text-slate-500">
                    {d.email && d.label ? `· ${d.label} ` : ''}{tr('· since {date}', { date: new Date(d.joinedAt).toLocaleDateString() })}
                  </span>
                </span>
                <button
                  className="text-sm font-semibold text-rose-600 hover:underline"
                  onClick={async () => {
                    if (!confirm(tr('Remove “{name}” from the family? It stops syncing and can’t see your family’s data any more.', { name: d.email || d.label || tr('this device') }))) return;
                    await cloud.removeDevice(d.id);
                    void load();
                  }}
                >
                  {tr('Disconnect')}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Settings → Cloud sync. */
export function CloudCardBody() {
  const { cloud, status } = useCloud();
  const [editConfig, setEditConfig] = useState(false);
  const [busy, setBusy] = useState(false);
  const act = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
    } catch {
      /* shown in status */
    } finally {
      setBusy(false);
    }
  };

  if (status.state === 'unconfigured' || editConfig)
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {tr('Sync your child’s progress between devices (for example their laptop and your phone) through your own free Supabase project. Follow {readme} in the project to create it and run {sql}, then paste the two values here.')
            .split(/(\{readme\}|\{sql\})/)
            .map((part, i) => (part === '{readme}' ? <b key={i}>supabase/README.md</b> : part === '{sql}' ? <b key={i}>supabase/setup.sql</b> : part))}
        </p>
        <ConfigForm onDone={() => setEditConfig(false)} />
      </div>
    );

  const cfgHost = (() => {
    try {
      return new URL(cloud.config()!.url).host;
    } catch {
      return cloud.config()?.url;
    }
  })();

  return (
    <div className="space-y-4 text-sm">
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        <dt className="text-slate-500">{tr('Project')}</dt>
        <dd className="truncate">
          {cfgHost}{' '}
          <button className="font-semibold text-brand-600 hover:underline dark:text-brand-400" onClick={() => setEditConfig(true)}>
            {tr('Change')}
          </button>
        </dd>
        <dt className="text-slate-500">{tr('Status')}</dt>
        <dd className={cx('font-semibold', status.state === 'error' && 'text-rose-600')}>{tr(LABEL[status.state])}</dd>
        {(status.email || status.viaCode) && (
          <>
            <dt className="text-slate-500">{tr('Account')}</dt>
            <dd>{status.viaCode ? tr('Connected with the family code') : status.email}</dd>
          </>
        )}
        {status.state !== 'signed-out' && status.state !== 'needs-link' && (
          <>
            <dt className="text-slate-500">{tr('Last synced')}</dt>
            <dd>{ago(status.lastSyncedAt)}</dd>
            <dt className="text-slate-500">{tr('Waiting to upload')}</dt>
            <dd className="tabular-nums">{tr('{n} changes', { n: status.pending })}</dd>
          </>
        )}
      </dl>
      {status.error && <p className="rounded-lg bg-rose-50 p-2 text-rose-700 dark:bg-rose-950 dark:text-rose-300">{status.error}</p>}

      {status.state === 'signed-out' && <SignInForm />}
      {status.state === 'needs-link' && (
        <div className="space-y-2">
          <p>{tr('You’re signed in, but this device isn’t syncing yet.')}</p>
          <Button disabled={busy} onClick={() => act(() => cloud.link('auto'))}>
            {tr('Start syncing this device')}
          </Button>
        </div>
      )}
      {status.state !== 'signed-out' && status.state !== 'needs-link' && (
        <div className="flex flex-wrap gap-2">
          <Button disabled={busy || status.state === 'syncing'} onClick={() => act(() => cloud.syncNow())}>
            {tr('Sync now')}
          </Button>
          <Button variant="secondary" disabled={busy} onClick={() => act(() => cloud.unlink())}>
            {tr('Stop syncing this device')}
          </Button>
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() =>
              act(() =>
                confirmSignOut(cloud, {
                  ask: tr('Sign out of Atlas on this device?\n\nYour family’s data stays safe in the cloud and is removed from this device. Sign in again any time to get it back.'),
                  unsynced: tr('Sign out anyway? Progress made on this device since the last sync will be lost.'),
                }),
              )
            }
          >
            {tr('Sign out')}
          </Button>
        </div>
      )}
      {status.state !== 'signed-out' && status.state !== 'needs-link' && status.role === 'parent' && <FamilyCode />}
      <p className="text-xs text-slate-500">
        {tr('Your phone or computer: sign in here once. Your child’s devices: they type the family code in the kid app — you don’t need to touch them. Uploaded files (PDFs, images) stay on the device where they were added; flashcards imported from CSV do sync.')}
      </p>
      <LinkChoice />
    </div>
  );
}

/** First run on a new device: sign in and download the family's data instead of starting over. */
export function CloudRestore({ onCancel }: { onCancel: () => void }) {
  const { status } = useCloud();
  const [editConfig, setEditConfig] = useState(false);
  return (
    <div className="space-y-4">
      {status.state === 'unconfigured' || editConfig ? (
        <ConfigForm onDone={() => setEditConfig(false)} />
      ) : status.state === 'signed-out' ? (
        <SignInForm />
      ) : (
        <p className="text-sm">
          {status.state === 'syncing' ? tr('Downloading your family’s data…') : status.state === 'error' ? status.error : tr(LABEL[status.state])}
        </p>
      )}
      <LinkChoice />
      <button onClick={onCancel} className="text-sm font-semibold text-slate-500 hover:underline">
        {tr('← Set up a new family instead')}
      </button>
    </div>
  );
}
