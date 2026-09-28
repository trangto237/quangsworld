import { useEffect, useRef, useState } from 'react';
import { useRepo } from '@atlas/ui';

/** Pulses whenever the kid app writes new progress — the dashboard updates live. */
export function LiveDot() {
  const repo = useRepo();
  const [pulse, setPulse] = useState(false);
  const t = useRef(0);
  useEffect(
    () =>
      repo.db.subscribe((origin) => {
        if (origin !== 'remote') return;
        setPulse(true);
        window.clearTimeout(t.current);
        t.current = window.setTimeout(() => setPulse(false), 1500);
      }),
    [repo],
  );
  return (
    <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 sm:inline-flex dark:bg-emerald-950 dark:text-emerald-300" title="Updates in real time while your child plays on this device">
      <span className="relative flex size-2">
        {pulse && <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400" />}
        <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
      </span>
      Live
    </span>
  );
}
