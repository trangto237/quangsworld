import { useState, type ReactNode } from 'react';
import type { HeatCell } from '@atlas/engine';
import { SUBJECTS } from '@atlas/knowledge';
import { cx } from '@atlas/ui';

/** Lightweight hover tooltip anchored inside a relative container. */
function useTip() {
  const [tip, setTip] = useState<{ x: number; y: number; body: ReactNode } | null>(null);
  const bind = (body: ReactNode) => ({
    onMouseEnter: (e: React.MouseEvent) => {
      const host = (e.currentTarget as HTMLElement).closest('[data-tip-host]')!.getBoundingClientRect();
      const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setTip({ x: r.left - host.left + r.width / 2, y: r.top - host.top, body });
    },
    onMouseLeave: () => setTip(null),
    onFocus: (e: React.FocusEvent) => {
      const host = (e.currentTarget as HTMLElement).closest('[data-tip-host]')!.getBoundingClientRect();
      const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setTip({ x: r.left - host.left + r.width / 2, y: r.top - host.top, body });
    },
    onBlur: () => setTip(null),
  });
  const node = tip && (
    <div
      role="tooltip"
      className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs text-white shadow-lg dark:bg-slate-100 dark:text-slate-900"
      style={{ left: tip.x, top: tip.y - 6 }}
    >
      {tip.body}
    </div>
  );
  return { bind, node };
}

/** Weekly study minutes: one series, one hue, with the daily goal as a reference line. */
export function WeeklyBars({ data, goal }: { data: { day: string; label: string; minutes: number }[]; goal: number }) {
  const { bind, node } = useTip();
  const max = Math.max(goal * 1.25, ...data.map((d) => d.minutes), 10);
  return (
    <div className="relative" data-tip-host>
      <div className="relative flex h-44 items-end gap-2 border-b border-[var(--viz-grid)] sm:gap-3">
        <div className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-slate-400/70" style={{ bottom: `${(goal / max) * 100}%` }}>
          <span className="absolute -top-5 right-0 text-xs font-semibold text-slate-500 dark:text-slate-400">goal {goal} min</span>
        </div>
        {data.map((d, i) => (
          <button
            key={d.day}
            className="group flex h-full flex-1 items-end justify-center focus:outline-none"
            aria-label={`${d.label}: ${d.minutes} minutes`}
            {...bind(
              <>
                <b>{new Date(d.day + 'T12:00').toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'short' })}</b>: {d.minutes} min
              </>,
            )}
          >
            <span
              className={cx('w-full max-w-10 rounded-t-[4px] transition group-hover:brightness-110 group-focus-visible:ring-2 group-focus-visible:ring-brand-500', i === data.length - 1 ? 'bg-[var(--seq-500)]' : 'bg-[var(--seq-400)]')}
              style={{ height: `${Math.max(d.minutes ? 3 : 0, (d.minutes / max) * 100)}%` }}
            />
          </button>
        ))}
      </div>
      <div className="mt-1.5 flex gap-2 sm:gap-3">
        {data.map((d, i) => (
          <span key={d.day} className={cx('flex-1 text-center text-xs', i === data.length - 1 ? 'font-bold' : 'text-slate-500 dark:text-slate-400')}>
            {i === data.length - 1 ? 'Today' : d.label}
          </span>
        ))}
      </div>
      {node}
    </div>
  );
}

const slotVar = (subject: string) => `var(--series-${SUBJECTS.find((s) => s.id === subject)?.slot ?? 1})`;

/** Average mastery per subject. Every bar is direct-labelled, so identity never relies on colour alone. */
export function SubjectBars({ data }: { data: { subject: string; name: string; mastery: number; mastered: number; total: number; practised: number }[] }) {
  return (
    <div className="space-y-4">
      {data.map((s) => (
        <div key={s.subject}>
          <div className="mb-1 flex items-baseline justify-between text-sm">
            <span className="font-semibold">{s.name}</span>
            <span className="tabular-nums text-slate-500 dark:text-slate-400">
              <b className="text-slate-900 dark:text-slate-100">{s.mastery}</b>/100 · {s.mastered}/{s.total} mastered
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--viz-empty)]">
            <div className="h-full rounded-full" style={{ width: `${s.mastery}%`, background: slotVar(s.subject) }} />
          </div>
        </div>
      ))}
    </div>
  );
}

const RAMP = ['--seq-100', '--seq-200', '--seq-300', '--seq-400', '--seq-500', '--seq-600', '--seq-700'];
const rampColor = (m: number) => `var(${RAMP[Math.min(RAMP.length - 1, Math.floor((m / 100) * RAMP.length))]})`;

/** Concept heatmap: rows = domains, cells = concepts, colour = mastery (one hue, light → dark). */
export function MasteryHeatmap({ cells, onSelect }: { cells: HeatCell[]; onSelect?: (conceptId: string) => void }) {
  const { bind, node } = useTip();
  const [asTable, setAsTable] = useState(false);
  const groups = SUBJECTS.map((s) => {
    const cs = cells.filter((c) => c.subject === s.id);
    const domains = [...new Set(cs.map((c) => c.domain))];
    return { subject: s, domains: domains.map((d) => ({ name: d, cells: cs.filter((c) => c.domain === d) })) };
  }).filter((g) => g.domains.length);

  return (
    <div className="relative" data-tip-host>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2" aria-hidden>
          <span>Mastery 0</span>
          <span className="flex overflow-hidden rounded">
            {RAMP.map((v) => (
              <span key={v} className="h-3 w-5" style={{ background: `var(${v})` }} />
            ))}
          </span>
          <span>100</span>
          <span className="ml-3 inline-block size-3 rounded-sm border border-dashed border-slate-400" /> not assessed yet
        </div>
        <button onClick={() => setAsTable(!asTable)} className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
          {asTable ? 'View as heatmap' : 'View as table'}
        </button>
      </div>
      {asTable ? (
        <div className="max-h-96 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-white text-xs uppercase text-slate-500 dark:bg-slate-900">
              <tr>
                <th className="py-2">Concept</th>
                <th>Domain</th>
                <th className="text-right">Mastery</th>
                <th className="text-right">Attempts</th>
                <th className="text-right">Accuracy (14d)</th>
              </tr>
            </thead>
            <tbody>
              {[...cells].sort((a, b) => a.mastery - b.mastery).map((c) => (
                <tr key={c.conceptId} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="py-1.5">{c.name}</td>
                  <td className="text-slate-500">{c.domain}</td>
                  <td className="text-right tabular-nums">{c.assessed ? c.mastery : '—'}</td>
                  <td className="text-right tabular-nums">{c.attempts}</td>
                  <td className="text-right tabular-nums">{c.recentAccuracy == null ? '—' : `${Math.round(c.recentAccuracy * 100)}%`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((g) => (
            <div key={g.subject.id}>
              <div className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {g.subject.emoji} {g.subject.name}
              </div>
              <div className="space-y-1">
                {g.domains.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-28 shrink-0 truncate text-xs text-slate-600 sm:w-36 dark:text-slate-300">{d.name}</span>
                    <div className="flex flex-wrap gap-0.5">
                      {d.cells.map((c) => (
                        <button
                          key={c.conceptId}
                          onClick={() => onSelect?.(c.conceptId)}
                          className={cx('size-7 rounded-[4px] transition hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:size-8', !c.assessed && 'border border-dashed border-slate-400 dark:border-slate-600')}
                          style={{ background: c.assessed ? rampColor(c.mastery) : 'transparent' }}
                          aria-label={`${c.name}: ${c.assessed ? `mastery ${c.mastery}` : 'not assessed'}`}
                          {...bind(
                            <>
                              <b>{c.name}</b>
                              <br />
                              {c.assessed ? `Mastery ${c.mastery}/100 · ${c.attempts ? `${c.attempts} answers` : 'placement estimate'}` : 'Not assessed yet'}
                              {c.recentAccuracy != null && <> · {Math.round(c.recentAccuracy * 100)}% recent</>}
                            </>,
                          )}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {node}
    </div>
  );
}
