import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '@atlas/ui';

/**
 * Town style building blocks: cream paper panels with a dark-brown outline and a flat drop edge,
 * flat-colour buttons. Used by the map, the hero profile and the menu screens.
 */

export function Panel({ className, children, as: Tag = 'section' }: { className?: string; children: ReactNode; as?: 'section' | 'div' | 'li' }) {
  return <Tag className={cx('town-panel p-4', className)}>{children}</Tag>;
}

const TONES = {
  green: 'bg-[#5cb85c] text-white hover:bg-[#53ad53]',
  amber: 'bg-[#ffc23d] text-[#3b2412] hover:bg-[#ffcb57]',
  red: 'bg-[#e8584a] text-white hover:bg-[#df4c3e]',
  blue: 'bg-[#4b8fe2] text-white hover:bg-[#3f84d8]',
  paper: 'bg-paper text-ink-text hover:bg-paper-3',
} as const;
export type Tone = keyof typeof TONES;

export function TownButton({ tone = 'amber', size = 'md', className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <button
      type="button"
      {...p}
      className={cx(
        'town-btn inline-flex items-center justify-center gap-2 rounded-xl font-display font-bold',
        size === 'sm' ? 'px-3 py-1 text-sm' : size === 'lg' ? 'px-6 py-3 text-xl' : 'px-4 py-2 text-base',
        TONES[tone],
        className,
      )}
    />
  );
}

/** A value chip like "🪙 479" or a power stat with a small bar. */
export function Chip({ icon, value, bar, color = '#ffc23d', title, className }: { icon: ReactNode; value: ReactNode; bar?: number; color?: string; title?: string; className?: string }) {
  return (
    <span title={title} className={cx('inline-flex min-w-0 items-center gap-1.5 rounded-full border-2 border-ink bg-paper py-0.5 pl-0.5 pr-2.5 font-display font-bold tabular-nums text-ink-text', className)}>
      <span className="grid size-6 shrink-0 place-items-center rounded-full text-sm" style={{ background: `${color}40` }} aria-hidden>
        {icon}
      </span>
      <span className="flex min-w-0 flex-col leading-none">
        <span className="text-sm">{value}</span>
        {bar !== undefined && (
          <span className="mt-0.5 block h-1 w-9 overflow-hidden rounded-full bg-ink/15">
            <span className="block h-full rounded-full" style={{ width: `${Math.max(4, Math.min(100, bar))}%`, background: color }} />
          </span>
        )}
      </span>
    </span>
  );
}

/** A progress bar with an outline, for XP and quest progress. */
export function Meter({ value, max, color = '#5cb85c', className }: { value: number; max: number; color?: string; className?: string }) {
  return (
    <span className={cx('block h-3 overflow-hidden rounded-full border-2 border-ink bg-paper-3', className)}>
      <span className="block h-full rounded-full transition-all" style={{ width: `${max > 0 ? Math.min(100, (value / max) * 100) : 0}%`, background: color }} />
    </span>
  );
}

/** Small title tag ("Chương 1"-style ribbon). */
export function Ribbon({ children, color = '#e8584a' }: { children: ReactNode; color?: string }) {
  return (
    <span className="inline-block rounded-md border-2 border-ink px-2 py-0.5 font-display text-xs font-bold text-white" style={{ background: color }}>
      {children}
    </span>
  );
}
