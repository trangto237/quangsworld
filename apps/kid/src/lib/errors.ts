/**
 * Something failed (a save, a question, the browser): tell the player instead of freezing silently, and
 * keep the message so a parent can screenshot it.
 */
export interface AppError {
  id: number;
  where: string;
  message: string;
}

const listeners = new Set<(e: AppError) => void>();
let next = 1;

export function reportError(err: unknown, where: string) {
  const message = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
  console.error(`[Atlas] ${where}:`, err);
  const e = { id: next++, where, message };
  listeners.forEach((l) => l(e));
}

export function onAppError(l: (e: AppError) => void): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

let installed = false;
/** Catch anything that slipped through (uncaught errors and failed promises). */
export function installGlobalErrorHandlers() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  window.addEventListener('error', (e) => {
    // Ignore errors from extensions or cross-origin scripts ("Script error.").
    if (!e.error && /^Script error/.test(e.message)) return;
    reportError(e.error ?? e.message, 'app');
  });
  window.addEventListener('unhandledrejection', (e) => reportError(e.reason, 'app'));
}

/** Report a save that hangs (it may still finish later — the player isn't kept waiting either way). */
export function watch<T>(work: Promise<T>, where: string, ms = 15_000): Promise<T> {
  const t = setTimeout(() => reportError(new Error(`still not finished after ${ms / 1000} s`), where), ms);
  return work.finally(() => clearTimeout(t));
}
