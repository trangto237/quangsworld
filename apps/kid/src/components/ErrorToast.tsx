import { useEffect, useState } from 'react';
import { onAppError, type AppError } from '../lib/errors';
import { T } from '../i18n';

/** A small message at the bottom when something went wrong, with Reload — never a silent freeze. */
export function ErrorToast() {
  const [err, setErr] = useState<AppError | null>(null);
  useEffect(() => onAppError(setErr), []);
  if (!err) return null;
  return (
    <div role="alert" className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-lg rounded-2xl bg-rose-600 p-4 text-white shadow-2xl" style={{ marginBottom: 'env(safe-area-inset-bottom)' }}>
      <p className="font-bold">
        ⚠️ <T en="Something went wrong" />
      </p>
      <p className="mt-1 break-words font-mono text-xs opacity-90">
        {err.where}: {err.message}
      </p>
      <p className="mt-1 text-xs opacity-80">
        <T en="The last answers may not have been saved. Reload to continue." />
      </p>
      <div className="mt-3 flex gap-2">
        <button onClick={() => location.reload()} className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-rose-700">
          <T en="Reload" />
        </button>
        <button onClick={() => setErr(null)} className="rounded-xl px-4 py-2 text-sm font-semibold ring-1 ring-white/60">
          <T en="Dismiss" />
        </button>
      </div>
    </div>
  );
}
