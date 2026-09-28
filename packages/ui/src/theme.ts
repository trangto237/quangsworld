import { useEffect, useState } from 'react';

export type ThemeMode = 'system' | 'light' | 'dark';
const KEY = 'atlas-theme';

function read(): ThemeMode {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
}

function apply(mode: ThemeMode) {
  const dark = mode === 'dark' || (mode === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
}

/** Dark mode (PRD §12): follows the system by default, can be overridden, shared by both apps. */
export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(read);
  useEffect(() => {
    apply(mode);
    try {
      localStorage.setItem(KEY, mode);
    } catch {
      /* private mode */
    }
    if (mode !== 'system') return;
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const on = () => apply('system');
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [mode]);
  useEffect(() => {
    const on = (e: StorageEvent) => e.key === KEY && setMode(read());
    addEventListener('storage', on);
    return () => removeEventListener('storage', on);
  }, []);
  return { mode, setMode, cycle: () => setMode(mode === 'system' ? 'light' : mode === 'light' ? 'dark' : 'system') };
}

/** Call before React renders to avoid a light flash. */
export const applyStoredTheme = () => apply(read());
