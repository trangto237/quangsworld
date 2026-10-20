import { useState, useSyncExternalStore } from 'react';
import { getCloud } from '@atlas/db/cloud';
import { useRepo } from '@atlas/ui';
import { TownButton } from '../town/ui';
import { T, TB } from '../i18n';

/** The cloud controller and its status, for the kid app. */
export function useKidCloud() {
  const repo = useRepo();
  const cloud = getCloud(repo);
  const status = useSyncExternalStore(cloud.subscribe, cloud.getStatus);
  /** Cloud sync is set up for this app, but this device isn't connected to a family yet. */
  const canJoin = !!cloud.config() && (status.state === 'signed-out' || status.state === 'needs-link' || (status.state === 'error' && !status.viaCode && !status.email));
  return { cloud, status, canJoin };
}

const deviceLabel = () => {
  const ua = navigator.userAgent;
  const os = /iPad|iPhone/.test(ua) ? 'iPad/iPhone' : /Android/.test(ua) ? 'Android' : /Mac/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : /CrOS/.test(ua) ? 'Chromebook' : /Linux/.test(ua) ? 'Linux' : 'Device';
  const browser = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : '';
  return `${os}${browser ? ` · ${browser}` : ''}`;
};

type Mode = 'signin' | 'create' | 'code';

const field = 'mt-1 w-full rounded-xl border-2 border-ink bg-white px-4 py-3 text-slate-900 outline-none focus:ring-4 focus:ring-amber-300';

/**
 * Kid app: connect this device to the family.
 * - Sign in with the child's own email (12+), or any family login.
 * - First time: create the child's account with the family code from the parent.
 * - No email: join with the family code only.
 */
export function JoinFamily({ onDone, onBusy }: { onDone?: () => void; onBusy?: (busy: boolean) => void }) {
  const { cloud } = useKidCloud();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const clean = code.toUpperCase().replace(/[^A-Z0-9]/g, '');

  const submit = async () => {
    setBusy(true);
    onBusy?.(true);
    setError(null);
    setNote(null);
    try {
      if (mode === 'code') await cloud.joinFamily(clean, deviceLabel());
      else if (mode === 'create') {
        const r = await cloud.signUpMember(email.trim(), pw, clean, deviceLabel());
        if (r === 'confirm-email') {
          setMode('signin');
          setNote('Account created! Open the email we sent you, tap the link, then sign in here.');
          return;
        }
      } else await cloud.signInMember(email.trim(), pw, deviceLabel());
      onDone?.();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
      onBusy?.(false);
    }
  };

  const ready = mode === 'code' ? clean.length >= 10 : mode === 'create' ? !!email && pw.length >= 6 && clean.length >= 10 : !!email && pw.length >= 6;

  return (
    <form
      className="space-y-3 text-left"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <div className="flex gap-1 rounded-xl border-2 border-ink bg-paper-3 p-1 text-sm font-semibold" role="tablist">
        {(
          [
            ['signin', 'Sign in'],
            ['create', 'New account'],
            ['code', 'Code only'],
          ] as const
        ).map(([m, label]) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => (setMode(m), setError(null))}
            className={`flex-1 rounded-lg px-2 py-1.5 ${mode === m ? 'bg-paper text-ink-text shadow-[0_2px_0_var(--ink)]' : 'text-ink-soft hover:text-ink-text'}`}
          >
            <T en={label} />
          </button>
        ))}
      </div>
      {mode !== 'code' && (
        <>
          <label className="block">
            <span className="text-sm font-semibold">
              <T en="Email" />
            </span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className={field} aria-label="Email" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">
              <T en="Password" />
            </span>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              minLength={6}
              autoComplete={mode === 'create' ? 'new-password' : 'current-password'}
              className={field}
              aria-label="Password"
            />
          </label>
        </>
      )}
      {mode !== 'signin' && (
        <label className="block">
          <span className="text-sm font-semibold">
            <T en="Family code" />
          </span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ABCDE-FGHJK"
            maxLength={14}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            className={`${field} text-center font-mono text-2xl font-bold tracking-widest`}
            aria-label="Family code"
          />
          <span className="mt-1 block text-sm opacity-80">
            <T en="Ask your parent: it's in the parent app, Settings → Cloud sync." />
          </span>
        </label>
      )}
      {note && <p className="rounded-lg bg-emerald-100 p-2 text-sm font-semibold text-emerald-800">{note}</p>}
      {error && <p className="rounded-lg bg-rose-100 p-2 text-sm font-semibold text-rose-800">{error}</p>}
      <TownButton type="submit" tone="green" className="w-full py-3" disabled={busy || !ready}>
        {busy ? <T en="Connecting…" /> : <TB en={mode === 'create' ? 'Create my account →' : mode === 'signin' ? 'Sign in →' : 'Connect →'} />}
      </TownButton>
    </form>
  );
}
