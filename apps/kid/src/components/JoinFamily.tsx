import { useState, useSyncExternalStore } from 'react';
import { getCloud } from '@atlas/db/cloud';
import { Button, useRepo } from '@atlas/ui';
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

/** Kid app: type the family code from the parent's phone → this device syncs with the family. */
export function JoinFamily({ onDone, onBusy }: { onDone?: () => void; onBusy?: (busy: boolean) => void }) {
  const { cloud } = useKidCloud();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clean = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return (
    <form
      className="space-y-3 text-left"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        onBusy?.(true);
        setError(null);
        try {
          await cloud.joinFamily(clean, deviceLabel());
          onDone?.();
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setBusy(false);
          onBusy?.(false);
        }
      }}
    >
      <label className="block">
        <span className="text-sm font-semibold">
          <T en="Family code" />
        </span>
        <input
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ABCDE-FGHJK"
          maxLength={14}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          className="mt-1 w-full rounded-xl bg-white px-4 py-3 text-center font-mono text-2xl font-bold tracking-widest text-slate-900 ring-2 ring-white/30 outline-none focus:ring-amber-400"
          aria-label="Family code"
        />
      </label>
      <p className="text-sm opacity-80">
        <T en="Ask your parent: it's in the parent app, Settings → Cloud sync." />
      </p>
      {error && <p className="rounded-lg bg-rose-100 p-2 text-sm font-semibold text-rose-800">{error}</p>}
      <Button type="submit" variant="game" className="w-full py-3" disabled={busy || clean.length < 10}>
        {busy ? <T en="Connecting…" /> : <TB en="Connect →" />}
      </Button>
    </form>
  );
}
