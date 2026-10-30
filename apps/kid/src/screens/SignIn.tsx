import { useState } from 'react';
import { Modal } from '@atlas/ui';
import { TownButton } from '../town/ui';
import { T, TB, tr } from '../i18n';
import { JoinFamily, useKidCloud } from '../components/JoinFamily';

const field = 'mt-1 w-full rounded-xl border-2 border-ink bg-white px-4 py-3 text-slate-900 outline-none focus:ring-4 focus:ring-amber-300';
const PARENT_AUTH = 'atlas-parent-auth';

/**
 * The one sign-in screen of Atlas. A child signs in with the username and password their parent made
 * (Parent app → Profiles) and lands in their own profile; the parent's email opens the parent app.
 */
export function SignIn({ onOffline }: { onOffline?: () => void }) {
  const { cloud } = useKidCloud();
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeOpen, setCodeOpen] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const where = await cloud.signInAnyone(id, pw);
      if (where === 'parent') {
        // The parent just proved who they are: open the dashboard without asking again.
        try {
          sessionStorage.setItem(PARENT_AUTH, '1');
        } catch {
          /* ignore */
        }
        location.href = '/parent/';
      }
      // A child: the profile opens by itself once the family's data has arrived.
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="town-bg relative grid min-h-dvh place-items-center overflow-hidden p-6 text-ink-text">
      <div className="relative w-full max-w-md text-center">
        <div className="animate-float text-6xl">🧭</div>
        <h1 className="mt-3 font-display text-4xl font-bold [text-shadow:0_3px_0_var(--paper)] sm:text-5xl">Atlas</h1>
        <form
          className="town-panel mx-auto mt-8 space-y-3 p-6 text-left"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <p className="text-center text-lg font-semibold">
            <T en="Sign in" />
          </p>
          <label className="block text-sm font-semibold">
            <T en="Username or email" />
            <input className={field} value={id} onChange={(e) => setId(e.target.value)} autoComplete="username" autoCapitalize="none" spellCheck={false} autoFocus />
          </label>
          <label className="block text-sm font-semibold">
            <T en="Password" />
            <input className={field} type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" />
          </label>
          {error && <p className="text-sm font-semibold text-rose-700">{error}</p>}
          <TownButton type="submit" tone="green" className="w-full py-3" disabled={busy || !id.trim() || pw.length < 6}>
            <TB en={busy ? 'Signing in…' : 'Sign in'} />
          </TownButton>
          <p className="pt-1 text-center text-xs text-ink-soft">
            <T en="Children: use the username your parent made for you. Parents: use your email." />
          </p>
        </form>
        <div className="mt-5 flex flex-col items-center gap-2 text-sm">
          <a href="/parent/?new=1" className="font-semibold text-ink-soft underline-offset-4 hover:underline">
            <T en="New family? Create a parent account →" />
          </a>
          <button onClick={() => setCodeOpen(true)} className="text-ink-soft underline-offset-4 hover:underline">
            <T en="Join with a family code instead" />
          </button>
          {onOffline && (
            <button onClick={onOffline} className="text-ink-soft underline-offset-4 hover:underline">
              <T en="Use this device without signing in" />
            </button>
          )}
        </div>
      </div>
      <Modal open={codeOpen} onClose={() => setCodeOpen(false)} title={tr('help', 'Connect to my family')}>
        <JoinFamily onDone={() => setCodeOpen(false)} />
      </Modal>
    </div>
  );
}
