import { useState, type FormEvent } from 'react';
import { Button, Card, Field, inputClass, useRepo } from '@atlas/ui';
import { StudentForm } from '../components/StudentForm';
import { LinkChoice, useCloud } from '../components/Cloud';
import { useParent } from '../store';

const friendly = (m: string) => (/failed to fetch|network/i.test(m) ? "Can't reach the cloud. Check your internet connection." : m);

/**
 * First run on a device. With cloud sync set up there is ONE parent login (email + password): create it
 * here, or sign in to bring the family's data to this device. Without cloud sync, a local password.
 */
export function Setup({ hasFamily }: { hasFamily: boolean }) {
  const repo = useRepo();
  const signIn = useParent((s) => s.signIn);
  const { cloud, status } = useCloud();
  const online = !!cloud.config();
  const [step, setStep] = useState<'family' | 'kid'>(hasFamily ? 'kid' : 'family');
  const [mode, setMode] = useState<'create' | 'signin'>('create');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const run = (fn: () => Promise<void>) => async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNote(null);
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      setError(friendly((err as Error).message));
    } finally {
      setBusy(false);
    }
  };

  /** Local only (no cloud): a dashboard password on this device. */
  const createLocal = run(async () => {
    if (pw !== pw2) throw new Error('Passwords do not match');
    await repo.createFamily(name.trim() || 'Parent', pw);
    signIn();
    setStep('kid');
  });

  /** One parent account in the cloud; the same password unlocks the dashboard. */
  const createOnline = run(async () => {
    if (pw !== pw2) throw new Error('Passwords do not match');
    const r = await cloud.signUp(email.trim(), pw);
    if (r === 'confirm-email') {
      setMode('signin');
      setNote('Account created. Open the confirmation email we just sent, then sign in here.');
      return;
    }
    if (!repo.getFamily()) await repo.createFamily(name.trim() || 'Parent', pw);
    await cloud.link('merge');
    signIn();
    setStep('kid');
  });

  const signInOnline = run(async () => {
    await cloud.signIn(email.trim(), pw);
    await cloud.link(repo.getFamily() ? 'auto' : 'cloud');
    if (!repo.getFamily()) {
      // A new account without a family yet (e.g. confirmed by email just now): finish creating it.
      if (!name.trim()) {
        setMode('create');
        throw new Error('Signed in. Now add your name to finish creating the family.');
      }
      await repo.createFamily(name.trim(), pw);
      await cloud.link('merge');
    }
    await repo.setParentPassword(pw);
    signIn();
    if (repo.listStudents().length) return;
    setStep('kid');
  });

  return (
    <div className="grid min-h-dvh place-items-center bg-gradient-to-br from-indigo-50 to-slate-100 p-4 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="text-5xl">🧭</div>
          <h1 className="mt-2 font-display text-3xl font-bold">Welcome to Atlas</h1>
          <p className="mt-1 text-slate-500">
            {online ? 'One parent account for all your devices. Your family’s data is private to your family.' : 'A game-first learning world for your child. Everything stays private on this device.'}
          </p>
        </div>
        <Card title={step === 'kid' ? 'Step 2 · Your child' : mode === 'signin' ? 'Sign in' : online ? 'Step 1 · Create your parent account' : 'Step 1 · Parent account'}>
          {step === 'kid' ? (
            <StudentForm
              submitLabel="Create hero profile"
              onSubmit={async (v) => {
                await repo.addStudent({ ...v, pin: v.pin || undefined });
                signIn();
              }}
            />
          ) : !online ? (
            <form className="space-y-4" onSubmit={createLocal}>
              <Field label="Your name">
                <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Trang" required />
              </Field>
              <Field label="Parent password" hint="Protects the dashboard, goals and uploads from curious players.">
                <input className={inputClass} type="password" value={pw} onChange={(e) => setPw(e.target.value)} minLength={4} required autoComplete="new-password" />
              </Field>
              <Field label="Confirm password">
                <input className={inputClass} type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} minLength={4} required autoComplete="new-password" />
              </Field>
              {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
              <Button type="submit" className="w-full" disabled={busy}>
                Continue
              </Button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={mode === 'create' ? createOnline : signInOnline}>
              {mode === 'create' && (
                <Field label="Your name">
                  <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Trang" required />
                </Field>
              )}
              <Field label="Email">
                <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              </Field>
              <Field label="Password" hint={mode === 'create' ? 'At least 6 characters. Use it to sign in on any device and to unlock this dashboard.' : undefined}>
                <input className={inputClass} type="password" value={pw} onChange={(e) => setPw(e.target.value)} minLength={6} required autoComplete={mode === 'create' ? 'new-password' : 'current-password'} />
              </Field>
              {mode === 'create' && (
                <Field label="Confirm password">
                  <input className={inputClass} type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} minLength={6} required autoComplete="new-password" />
                </Field>
              )}
              {note && <p className="text-sm font-semibold text-emerald-600">{note}</p>}
              {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
              {status.state === 'syncing' && <p className="text-sm text-slate-500">Downloading your family’s data…</p>}
              <Button type="submit" className="w-full" disabled={busy}>
                {mode === 'create' ? 'Create account' : 'Sign in'}
              </Button>
            </form>
          )}
        </Card>
        {online && step === 'family' && (
          <p className="mt-4 text-center text-sm text-slate-500">
            {mode === 'create' ? 'Already have an account?' : 'New here?'}{' '}
            <button
              className="font-semibold text-brand-600 hover:underline dark:text-brand-400"
              onClick={() => {
                setMode(mode === 'create' ? 'signin' : 'create');
                setError(null);
              }}
            >
              {mode === 'create' ? 'Sign in' : 'Create a parent account'}
            </button>
          </p>
        )}
        {step === 'kid' && (
          <p className="mt-4 text-center text-sm text-slate-500">
            Next, your child opens the kid app and starts the Trial of Five Realms (placement test).{online ? ' On their own laptop they sign in with their email, or the family code from Settings.' : ''}
          </p>
        )}
        <LinkChoice />
      </div>
    </div>
  );
}
