import { useState } from 'react';
import { Button, Card, Field, inputClass, useRepo } from '@atlas/ui';
import { useParent } from '../store';

export function Login({ name }: { name: string }) {
  const repo = useRepo();
  const signIn = useParent((s) => s.signIn);
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <div className="grid min-h-dvh place-items-center bg-gradient-to-br from-indigo-50 to-slate-100 p-4 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="text-5xl">🔐</div>
          <h1 className="mt-2 font-display text-2xl font-bold">Welcome back, {name}</h1>
        </div>
        <Card>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              const ok = await repo.verifyParent(pw);
              setBusy(false);
              if (ok) signIn();
              else setError(true);
            }}
          >
            <Field label="Parent password">
              <input className={inputClass} type="password" autoFocus value={pw} onChange={(e) => (setPw(e.target.value), setError(false))} autoComplete="current-password" />
            </Field>
            {error && <p className="text-sm font-semibold text-rose-600">Incorrect password.</p>}
            <Button type="submit" className="w-full" disabled={busy}>
              Unlock dashboard
            </Button>
          </form>
        </Card>
        <p className="mt-4 text-center text-sm">
          <a href="/" className="text-slate-500 hover:underline">
            ← Back to the kid app
          </a>
        </p>
      </div>
    </div>
  );
}
