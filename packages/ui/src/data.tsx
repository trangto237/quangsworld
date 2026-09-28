import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react';
import type { Repo } from '@atlas/db';

const RepoContext = createContext<Repo | null>(null);

export function useRepo(): Repo {
  const r = useContext(RepoContext);
  if (!r) throw new Error('useRepo outside <DataProvider>');
  return r;
}

/**
 * Re-renders whenever the database changes — locally or in another open app.
 * This is what makes the parent dashboard update in real time while the kid plays.
 */
export function useDbVersion(): number {
  const repo = useRepo();
  const [store] = useState(() => {
    let v = 0;
    return {
      subscribe: (cb: () => void) =>
        repo.db.subscribe((origin) => {
          if (origin === 'remote') repo.loadCustomContent();
          v++;
          cb();
        }),
      get: () => v,
    };
  });
  return useSyncExternalStore(store.subscribe, store.get);
}

/** Read helper: recomputes synchronously whenever the DB changes or `deps` change. */
export function useQuery<T>(fn: (repo: Repo) => T, deps: unknown[] = []): T {
  const repo = useRepo();
  const v = useDbVersion();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => fn(repo), [v, repo, ...deps]);
}

export function DataProvider({ open, children, fallback }: { open: () => Promise<Repo>; children: ReactNode; fallback: ReactNode }) {
  const [repo, setRepo] = useState<Repo | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    open().then(setRepo, (e) => setError(String(e?.message ?? e)));
  }, [open]);
  if (error)
    return (
      <div className="grid min-h-dvh place-items-center p-6 text-center">
        <div>
          <p className="text-lg font-bold">Could not open local storage</p>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
          <p className="mt-2 text-sm text-slate-500">Private browsing can block offline storage. Try a normal window.</p>
        </div>
      </div>
    );
  if (!repo) return <>{fallback}</>;
  return <RepoContext.Provider value={repo}>{children}</RepoContext.Provider>;
}
