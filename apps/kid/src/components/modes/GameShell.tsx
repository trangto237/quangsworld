import { useEffect, useState, type ReactNode } from 'react';
import { Button, Modal } from '@atlas/ui';
import { T, TB, tr, useLang } from '../../i18n';
import { useEscape } from './GameArena';

/** Header (title, stats, progress), leave-confirmation and a full-height body shared by all game modes. */
export function GameShell({
  title,
  subtitle,
  stats,
  progress,
  retreatText,
  onLeave,
  className,
  fit,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  stats?: ReactNode;
  progress?: { value: number; max: number; label: string };
  retreatText?: string;
  onLeave: () => void;
  className?: string;
  /** Exactly one screen tall: the page never scrolls (the mode scrolls its own panels). */
  fit?: boolean;
  children: ReactNode;
}) {
  const lang = useLang();
  const [confirm, setConfirm] = useState(false);
  const escape = useEscape();
  // Dark behind the phone's status bar and rubber-band scrolling while a game is on.
  useEffect(() => {
    const html = document.documentElement;
    const before = html.style.background;
    html.style.background = '#020617';
    return () => {
      html.style.background = before;
    };
  }, []);
  return (
    <div className={`flex flex-col text-white ${fit ? 'h-dvh overflow-hidden' : 'min-h-dvh'} ${className ?? 'bg-slate-950'}`}>
      <header className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-black/30 px-3 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] text-sm">
        <button onClick={() => setConfirm(true)} className="rounded-lg px-2 py-1 text-white/70 hover:bg-white/10" aria-label="Leave battle">
          ✕
        </button>
        <div className="min-w-0">
          <div className="truncate font-display font-semibold">{title}</div>
          {subtitle && <div className="truncate text-xs text-white/50">{subtitle}</div>}
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1.5 whitespace-nowrap font-bold tabular-nums sm:gap-4">
          {progress && (
            <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-xs text-white/80 sm:hidden" title={progress.label}>
              🏁 {Math.min(progress.value, progress.max)}/{progress.max}
            </span>
          )}
          {progress && (
            <span className="hidden items-center gap-2 text-xs text-white/70 sm:flex">
              <T en={progress.label} />
              <span className="h-2 w-24 overflow-hidden rounded-full bg-white/15">
                <span className="block h-full bg-gradient-to-r from-amber-300 to-pink-400 transition-all" style={{ width: `${(Math.min(progress.value, progress.max) / progress.max) * 100}%` }} />
              </span>
            </span>
          )}
          {stats}
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      <Modal open={confirm} onClose={() => setConfirm(false)} title={tr(lang, 'Leave the battle?')}>
        <div className="text-sm text-slate-600 dark:text-slate-300">
          <T en={retreatText ?? 'Your answers so far are saved and still count.'} />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirm(false)}>
            <TB en="Keep fighting" />
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setConfirm(false);
              onLeave();
              escape?.();
            }}
          >
            <TB en="Leave" />
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export const Hearts = ({ n, max }: { n: number; max: number }) => (
  <span className="text-xs sm:text-sm" aria-label={`${n} hearts`}>
    {Array.from({ length: max }, (_, i) => (i < n ? '❤️' : '🖤')).join('')}
  </span>
);

export const Pill = ({ children, className, title }: { children: ReactNode; className?: string; title?: string }) => (
  <span className={`rounded-full px-2.5 py-1 sm:px-3 ${className ?? 'bg-white/10'}`} title={title}>
    {children}
  </span>
);
