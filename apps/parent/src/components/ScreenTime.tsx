import { useState } from 'react';
import type { StudentProfile } from '@atlas/db';
import { GIVE_CHOICES, LIMIT_CHOICES, answer, extraKey, limitFor, limitKey, requestKey, timeLeft, type TimeLimit, type TimeRequest } from '@atlas/engine';
import { dayKey } from '@atlas/shared';
import { useQuery, useRepo } from '@atlas/ui';

/**
 * Screen time on the parent's side: the daily limit for each child (school days and weekends), today's
 * use, and the child's "can I have more time?" requests, answered with how many more minutes.
 */

const fmt = (ms: number) => `${Math.round(ms / 60_000)} min`;

/** On a child's profile card: their daily limits and today's use. */
export function TimeLimitSetting({ studentId }: { studentId: string }) {
  const repo = useRepo();
  const date = dayKey(Date.now());
  const limit = useQuery((r) => r.getKv<TimeLimit>(limitKey(studentId)), [studentId]);
  const used = useQuery((r) => r.screenTimeUsed(studentId, date), [studentId, date]);
  const extra = useQuery((r) => r.getKv<number>(extraKey(studentId, date)) ?? 0, [studentId, date]);
  const set = (part: keyof TimeLimit, v: string) => {
    const next: TimeLimit = { weekday: limit?.weekday ?? null, weekend: limit?.weekend ?? null, [part]: v === '' ? null : Number(v) };
    void repo.setKv(limitKey(studentId), next.weekday == null && next.weekend == null ? null : next);
  };
  const today = limitFor(limit, date);
  const left = timeLeft(limit, date, used, extra);
  const select = (part: keyof TimeLimit) => {
    const v = limit?.[part] ?? null;
    const options = [...new Set([...LIMIT_CHOICES, ...(v != null ? [v] : [])])].sort((a, b) => a - b);
    return (
      <select value={v ?? ''} onChange={(e) => set(part, e.target.value)} className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold dark:bg-slate-800">
        <option value="">No limit</option>
        {options.map((m) => (
          <option key={m} value={m}>
            {m >= 60 && m % 60 === 0 ? `${m / 60} h` : `${m} min`}
          </option>
        ))}
      </select>
    );
  };
  return (
    <div className="mt-2 text-xs">
      <div className="font-semibold text-slate-600 dark:text-slate-300">⏰ Daily time limit</div>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
        <label className="flex items-center gap-1">School days {select('weekday')}</label>
        <label className="flex items-center gap-1">Weekends {select('weekend')}</label>
      </div>
      <div className="mt-1 text-slate-500">
        Today: {fmt(used)} played
        {today != null && (
          <>
            {' '}
            of {left.allowedMin} min{extra > 0 && ` (incl. +${extra} extra)`}
            {left.up ? ' · time is up' : ` · ${fmt(left.leftMs)} left`}
          </>
        )}
        {today != null && (
          <button className="ml-2 font-semibold text-brand-600 underline dark:text-brand-400" onClick={() => void repo.setKv(extraKey(studentId, date), extra + 15)}>
            +15 min now
          </button>
        )}
      </div>
    </div>
  );
}

/** At the top of every parent page: a child asking for more time, with how much to give. */
export function TimeRequests({ students }: { students: StudentProfile[] }) {
  const date = dayKey(Date.now());
  const pending = useQuery(
    (r) =>
      students
        .map((s) => ({ s, req: r.getKv<TimeRequest>(requestKey(s.id)), used: r.screenTimeUsed(s.id, date), extra: r.getKv<number>(extraKey(s.id, date)) ?? 0 }))
        .filter((x) => x.req?.status === 'pending' && x.req.date === date),
    [students.map((s) => s.id).join(','), date],
  );
  if (!pending.length) return null;
  return (
    <div className="space-y-2">
      {pending.map((p) => (
        <Request key={p.s.id} student={p.s} req={p.req!} usedMs={p.used} extra={p.extra} date={date} />
      ))}
    </div>
  );
}

function Request({ student, req, usedMs, extra, date }: { student: StudentProfile; req: TimeRequest; usedMs: number; extra: number; date: string }) {
  const repo = useRepo();
  const [custom, setCustom] = useState('');
  const give = async (n: number | null) => {
    if (n != null && n > 0) await repo.setKv(extraKey(student.id, date), extra + n);
    await repo.setKv(requestKey(student.id), answer(req, n, Date.now()));
  };
  return (
    <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-4 dark:bg-amber-950/40">
      <div className="font-bold">
        🙋 {student.avatar} {student.name} asks for {req.asked} more minutes
      </div>
      <div className="text-sm text-slate-600 dark:text-slate-300">
        Played {fmt(usedMs)} today{extra > 0 ? ` (already given +${extra} min)` : ''}. How much more?
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {GIVE_CHOICES.map((n) => (
          <button key={n} onClick={() => void give(n)} className={`rounded-xl px-3 py-1.5 text-sm font-bold text-white ${n === req.asked ? 'bg-emerald-600 ring-2 ring-emerald-300' : 'bg-emerald-500'} hover:bg-emerald-600`}>
            +{n} min
          </button>
        ))}
        <span className="flex items-center gap-1">
          <input
            type="number"
            min={1}
            max={300}
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Other"
            className="w-20 rounded-xl border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
          <button disabled={!(Number(custom) > 0)} onClick={() => void give(Math.round(Number(custom)))} className="rounded-xl bg-emerald-500 px-3 py-1.5 text-sm font-bold text-white disabled:opacity-40">
            Give
          </button>
        </span>
        <button onClick={() => void give(null)} className="rounded-xl px-3 py-1.5 text-sm font-bold text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950">
          Not today
        </button>
      </div>
    </div>
  );
}
