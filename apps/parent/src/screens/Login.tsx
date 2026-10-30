import { useState } from 'react';
import { Button, Card, Field, InstallButton, inputClass, useRepo } from '@atlas/ui';
import { installLabels } from '../components/install';
import { useParent } from '../store';
import { useCloud } from '../components/Cloud';
import { LangToggle, tr } from '../i18n';

export function Login({ name }: { name: string }) {
  const repo = useRepo();
  const signIn = useParent((s) => s.signIn);
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const { cloud, status } = useCloud();
  /** The parent's email when this device is signed in to the family's parent account. */
  const parentEmail = status.role === 'parent' ? status.email : undefined;
  return (
    <div className="relative grid min-h-dvh place-items-center bg-gradient-to-br from-indigo-50 to-slate-100 p-4 dark:from-slate-950 dark:to-slate-900">
      <div className="absolute right-4 top-4">
        <LangToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="text-5xl">🔐</div>
          <h1 className="mt-2 font-display text-2xl font-bold">{tr('Welcome back, {name}', { name })}</h1>
        </div>
        <Card>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              let ok = await repo.verifyParent(pw);
              // Password changed on another device: the cloud account knows the new one.
              if (!ok && parentEmail) {
                try {
                  await cloud.signIn(parentEmail, pw);
                  await repo.setParentPassword(pw);
                  ok = true;
                } catch {
                  ok = false;
                }
              }
              setBusy(false);
              if (ok) signIn();
              else setError(true);
            }}
          >
            {parentEmail && <p className="text-sm text-slate-500">{tr('Signed in as {email}', { email: parentEmail })}</p>}
            <Field label={parentEmail ? tr('Password') : tr('Parent password')}>
              <input className={inputClass} type="password" autoFocus value={pw} onChange={(e) => (setPw(e.target.value), setError(false))} autoComplete="current-password" />
            </Field>
            {error && <p className="text-sm font-semibold text-rose-600">{tr('Incorrect password.')}</p>}
            <Button type="submit" className="w-full" disabled={busy}>
              {tr('Unlock dashboard')}
            </Button>
          </form>
        </Card>
        <p className="mt-4 text-center text-sm">
          <a href="/" className="text-slate-500 hover:underline">
            {tr('← Back to players')}
          </a>
        </p>
        <div className="mt-4 flex justify-center">
          <InstallButton labels={installLabels()} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700" />
        </div>
      </div>
    </div>
  );
}
