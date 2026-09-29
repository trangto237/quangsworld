import type { StudentProfile } from '@atlas/db';
import { isDue, stars } from '@atlas/engine';
import { MODES, modeFor } from '@atlas/game';
import { WORLDS, conceptsInWorld } from '@atlas/knowledge';
import { startOfDay } from '@atlas/shared';
import { Button, cx, useQuery } from '@atlas/ui';
import { TopBar } from '../components/TopBar';
import { todayPlan } from '../lib/plan';
import { useKid } from '../store';
import { T, TB } from '../i18n';

export function Hub({ student }: { student: StudentProfile }) {
  const go = useKid((s) => s.go);
  const plan = useQuery((r) => todayPlan(r, student.id), [student.id]);
  const states = useQuery((r) => r.getStates(student.id), [student.id]);
  const minutesToday = useQuery((r) => Math.round(r.listSessions(student.id, startOfDay(Date.now())).reduce((s, x) => s + x.activeMs, 0) / 60000), [student.id]);
  const openMistakes = useQuery((r) => r.listMistakes(student.id, { open: true }).length, [student.id]);
  const next = plan.missions.find((m) => !m.done);
  const allDone = !next;

  return (
    <div className="min-h-dvh bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 text-white">
      <TopBar student={student} />
      <main className="mx-auto max-w-6xl space-y-8 px-3 py-6 sm:px-4">
        {/* Today's quest */}
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 p-1 shadow-xl">
          <div className="rounded-[22px] bg-slate-950/85 p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-amber-300">
                  <T en="Today's quest · {n} min" vars={{ n: plan.minutes }} />
                </p>
                <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
                  <T en={allDone ? 'Quest complete! 🏆' : 'Your path for today'} />
                </h1>
              </div>
              <div className="text-right text-sm text-white/70">
                <T en="{m} / {n} min played today" vars={{ m: minutesToday, n: plan.minutes }} />
                <div className="mt-1 h-2 w-40 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full bg-amber-400" style={{ width: `${Math.min(100, (minutesToday / plan.minutes) * 100)}%` }} />
                </div>
              </div>
            </div>
            <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {plan.missions.map((m, i) => (
                <li key={m.id}>
                  <button
                    disabled={m.done}
                    onClick={() => go({ name: 'battle', mission: m, fromPlan: true })}
                    className={cx(
                      'flex h-full w-full flex-col rounded-2xl p-4 text-left ring-2 transition',
                      m.done ? 'bg-emerald-500/15 ring-emerald-500/40' : m === next ? 'bg-white/10 ring-amber-400 hover:bg-white/15' : 'bg-white/5 ring-white/10 hover:bg-white/10',
                    )}
                  >
                    <span className="flex items-center justify-between text-xs font-bold uppercase tracking-wide text-white/60">
                      <span>
                        {i + 1}. <T en="{d} min" vars={{ d: m.duration }} /> · <T en={m.label} />
                      </span>
                      <span className="text-lg" title={MODES[m.mode ?? modeFor(m.concepts, m.kind)].name}>
                        {m.done ? '✅' : MODES[m.mode ?? modeFor(m.concepts, m.kind)].emoji}
                      </span>
                    </span>
                    <span className="mt-2 font-display text-lg font-semibold">{m.title}</span>
                    <span className="text-xs text-white/60">
                      <T en={MODES[m.mode ?? modeFor(m.concepts, m.kind)].name} />
                    </span>
                    <span className="mt-auto pt-2 text-xs text-white/60">
                      🪙 {m.reward.coins}
                      {m.reward.gems > 0 && <> · 💎 {m.reward.gems}</>}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
            {next && (
              <Button variant="game" className="mt-5 w-full py-4 text-lg sm:w-auto sm:px-10" onClick={() => go({ name: 'battle', mission: next, fromPlan: true })}>
                <TB en="▶ Play: {title}" vars={{ title: next.title }} />
              </Button>
            )}
          </div>
        </section>

        {/* Worlds */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold">
              <T en="Worlds" />
            </h2>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => go({ name: 'mistakes' })}>
                <TB en="📕 Mistake Book" />
                {openMistakes > 0 && <span className="rounded-full bg-rose-500 px-2 text-xs text-white">{openMistakes}</span>}
              </Button>
              <Button variant="secondary" onClick={() => go({ name: 'shop' })}>
                <TB en="🛒 Armoury" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {WORLDS.map((w) => {
              const cs = conceptsInWorld(w);
              const got = cs.reduce((s, c) => s + stars(states[c.id]), 0);
              const due = cs.filter((c) => states[c.id] && states[c.id].attempts > 0 && isDue(states[c.id])).length;
              return (
                <button
                  key={w.id}
                  onClick={() => go({ name: 'world', worldId: w.id })}
                  className="group relative overflow-hidden rounded-2xl p-4 text-left shadow-lg ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:ring-white/30"
                  style={{ background: `linear-gradient(160deg, ${w.color}, #0f172a 85%)` }}
                >
                  {due > 0 && <span className="absolute right-2 top-2 rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold">🔁 {due}</span>}
                  <div className="text-4xl transition group-hover:scale-110">{w.emoji}</div>
                  <div className="mt-2 font-display text-lg font-semibold leading-tight">
                    <TB en={w.name} />
                  </div>
                  <div className="mt-1 text-xs text-white/70">
                    ⭐ {got}/{cs.length * 3}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
