import { useState, useSyncExternalStore, type FormEvent } from 'react';
import { getCloud, type CloudStatus } from '@atlas/db/cloud';
import { Button, Field, Modal, cx, inputClass, useRepo } from '@atlas/ui';

/** The cloud-sync controller and its live status. */
export function useCloud() {
  const repo = useRepo();
  const cloud = getCloud(repo);
  const status = useSyncExternalStore(cloud.subscribe, cloud.getStatus);
  return { cloud, status };
}

const ago = (t: number | null) => {
  if (!t) return 'never';
  const s = Math.round((Date.now() - t) / 1000);
  if (s < 10) return 'just now';
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  return new Date(t).toLocaleString();
};

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
    <button onClick={onClick} className={cx('hidden items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold sm:inline-flex', tone)} title={`Cloud sync: ${LABEL[status.state]}. Last synced ${ago(status.lastSyncedAt)}.`}>
      ☁️ {status.state === 'synced' ? 'Synced' : status.state === 'syncing' ? 'Syncing…' : status.state === 'error' ? 'Sync error' : status.state === 'offline' ? 'Offline' : 'Sync off'}
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
      <Field label="Supabase project URL" hint="Supabase → Project Settings → API → Project URL">
        <input className={inputClass} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://abcd1234.supabase.co" type="url" required />
      </Field>
      <Field label="Anon (public) key" hint="The 'anon public' key — never the service_role key.">
        <input className={inputClass} value={key} onChange={(e) => setKey(e.target.value)} placeholder="eyJhbGciOi…" required autoComplete="off" spellCheck={false} />
      </Field>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={busy || !url || !key}>
          Save
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
            Use the app's built-in settings
          </Button>
        )}
      </div>
    </form>
  );
}

/** Email + password for the family cloud account. */
function SignInForm({ onSignedIn }: { onSignedIn?: () => void }) {
  const { cloud } = useCloud();
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
          setMsg({ ok: true, text: 'Account created. Open the confirmation email, then sign in here.' });
          return;
        }
      } else await cloud.signIn(email.trim(), pw);
      await cloud.link('auto');
      onSignedIn?.();
    } catch (err) {
      const m = (err as Error).message;
      setMsg({ ok: false, text: /failed to fetch|network/i.test(m) ? "Can't reach Supabase. Check the project URL and your internet connection." : m });
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="space-y-3" onSubmit={(e) => run(e, 'in')}>
      <Field label="Family email">
        <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
      </Field>
      <Field label="Cloud password" hint="At least 6 characters. This is the cloud account, separate from the dashboard password.">
        <input className={inputClass} type="password" value={pw} onChange={(e) => setPw(e.target.value)} minLength={6} required autoComplete="current-password" />
      </Field>
      {msg && <p className={`text-sm font-semibold ${msg.ok ? 'text-emerald-600' : 'text-rose-600'}`}>{msg.text}</p>}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={busy || !email || pw.length < 6}>
          Sign in
        </Button>
        <Button type="button" variant="secondary" disabled={busy || !email || pw.length < 6} onClick={(e) => run(e, 'up')}>
          Create family account
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
    <Modal open={status.state === 'needs-choice'} onClose={() => void cloud.unlink()} title="This device and the cloud both have data">
      <div className="space-y-3 text-sm">
        <p>Choose what to keep on this device:</p>
        <button disabled={busy} onClick={() => choose('cloud')} className="w-full rounded-xl p-3 text-left ring-1 ring-slate-200 hover:bg-slate-50 dark:ring-slate-700 dark:hover:bg-slate-800">
          <b>Use the cloud data (recommended for a new device)</b>
          <span className="block text-slate-500">This device's data is replaced by your family's cloud data.</span>
        </button>
        <button disabled={busy} onClick={() => choose('merge')} className="w-full rounded-xl p-3 text-left ring-1 ring-slate-200 hover:bg-slate-50 dark:ring-slate-700 dark:hover:bg-slate-800">
          <b>Merge both</b>
          <span className="block text-slate-500">Keep the children and progress from both. The cloud's parent password is kept.</span>
        </button>
        <button disabled={busy} onClick={() => void cloud.unlink()} className="text-sm font-semibold text-slate-500 hover:underline">
          Cancel — don't sync this device
        </button>
      </div>
    </Modal>
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
          Sync your child's progress between devices (for example their laptop and your phone) through your own free Supabase project. Follow <b>supabase/README.md</b> in the project to create it and run <b>supabase/setup.sql</b>, then paste the two values here.
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
        <dt className="text-slate-500">Project</dt>
        <dd className="truncate">
          {cfgHost}{' '}
          <button className="font-semibold text-brand-600 hover:underline dark:text-brand-400" onClick={() => setEditConfig(true)}>
            Change
          </button>
        </dd>
        <dt className="text-slate-500">Status</dt>
        <dd className={cx('font-semibold', status.state === 'error' && 'text-rose-600')}>{LABEL[status.state]}</dd>
        {status.email && (
          <>
            <dt className="text-slate-500">Account</dt>
            <dd>{status.email}</dd>
          </>
        )}
        {status.state !== 'signed-out' && status.state !== 'needs-link' && (
          <>
            <dt className="text-slate-500">Last synced</dt>
            <dd>{ago(status.lastSyncedAt)}</dd>
            <dt className="text-slate-500">Waiting to upload</dt>
            <dd className="tabular-nums">{status.pending} changes</dd>
          </>
        )}
      </dl>
      {status.error && <p className="rounded-lg bg-rose-50 p-2 text-rose-700 dark:bg-rose-950 dark:text-rose-300">{status.error}</p>}

      {status.state === 'signed-out' && <SignInForm />}
      {status.state === 'needs-link' && (
        <div className="space-y-2">
          <p>You're signed in, but this device isn't syncing yet.</p>
          <Button disabled={busy} onClick={() => act(() => cloud.link('auto'))}>
            Start syncing this device
          </Button>
        </div>
      )}
      {status.state !== 'signed-out' && status.state !== 'needs-link' && (
        <div className="flex flex-wrap gap-2">
          <Button disabled={busy || status.state === 'syncing'} onClick={() => act(() => cloud.syncNow())}>
            Sync now
          </Button>
          <Button variant="secondary" disabled={busy} onClick={() => act(() => cloud.unlink())}>
            Stop syncing this device
          </Button>
          <Button variant="secondary" disabled={busy} onClick={() => act(() => cloud.signOut())}>
            Sign out
          </Button>
        </div>
      )}
      <p className="text-xs text-slate-500">
        Sign in once on each device (on your child's laptop, open this dashboard there and sign in). The kid app on that device then syncs automatically. Uploaded files (PDFs, images) stay on the device where they were added; flashcards imported from CSV do sync.
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
          {status.state === 'syncing' ? 'Downloading your family data…' : status.state === 'error' ? status.error : LABEL[status.state]}
        </p>
      )}
      <LinkChoice />
      <button onClick={onCancel} className="text-sm font-semibold text-slate-500 hover:underline">
        ← Set up a new family instead
      </button>
    </div>
  );
}
