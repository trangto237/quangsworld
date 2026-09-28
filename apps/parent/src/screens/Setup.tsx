import { useState } from 'react';
import { Button, Card, Field, inputClass, useRepo } from '@atlas/ui';
import { StudentForm } from '../components/StudentForm';
import { useParent } from '../store';

/** First run: create the family account (parent password) and the first child profile. */
export function Setup({ hasFamily }: { hasFamily: boolean }) {
  const repo = useRepo();
  const signIn = useParent((s) => s.signIn);
  const [step, setStep] = useState<'family' | 'kid'>(hasFamily ? 'kid' : 'family');
  const [name, setName] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="grid min-h-dvh place-items-center bg-gradient-to-br from-indigo-50 to-slate-100 p-4 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="text-5xl">🧭</div>
          <h1 className="mt-2 font-display text-3xl font-bold">Welcome to Atlas</h1>
          <p className="mt-1 text-slate-500">A game-first learning world for your child. Everything stays private on this device.</p>
        </div>
        <Card title={step === 'family' ? 'Step 1 · Parent account' : 'Step 2 · Your child'}>
          {step === 'family' ? (
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setError(null);
                if (pw !== pw2) return setError('Passwords do not match');
                try {
                  await repo.createFamily(name.trim() || 'Parent', pw);
                  signIn();
                  setStep('kid');
                } catch (err) {
                  setError((err as Error).message);
                }
              }}
            >
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
              <Button type="submit" className="w-full">
                Continue
              </Button>
            </form>
          ) : (
            <StudentForm
              submitLabel="Create hero profile"
              onSubmit={async (v) => {
                await repo.addStudent({ ...v, pin: v.pin || undefined });
                signIn();
              }}
            />
          )}
        </Card>
        {step === 'kid' && <p className="mt-4 text-center text-sm text-slate-500">Next, your child opens the kid app and starts the Trial of Five Realms (placement test).</p>}
      </div>
    </div>
  );
}
