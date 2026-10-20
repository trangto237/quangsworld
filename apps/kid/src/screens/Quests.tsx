import type { StudentProfile } from '@atlas/db';
import { isDue, stars } from '@atlas/engine';
import { MODES, modeFor } from '@atlas/game';
import { conceptsInWorld, visibleWorlds } from '@atlas/knowledge';
import { startOfDay } from '@atlas/shared';
import { cx, useQuery } from '@atlas/ui';
import { todayPlan } from '../lib/plan';
import { useKid } from '../store';
import { T, TB } from '../i18n';
import { TownScreen } from '../town/Shell';
import { Meter, Panel, Ribbon, TownButton } from '../town/ui';

/** Today's quests (the daily plan), the Mistake Book, and every world as a list. */
export function Quests({ student }: { student: StudentProfile }) {
  const go = useKid((s) => s.go);
  const plan = useQuery((r) => todayPlan(r, student.id), [student.id]);
  const states = useQuery((r) => r.getStates(student.id), [student.id]);
  const minutesToday = useQuery((r) => Math.round(r.listSessions(student.id, startOfDay(Date.now())).reduce((s, x) => s + x.activeMs, 0) / 60000), [student.id]);
  const openMistakes = useQuery((r) => r.listMistakes(student.id, { open: true }).length, [student.id]);
  const next = plan.missions.find((m) => !m.done);

  return (
    <TownScreen student={student} tab="quests" className="space-y-5">
      <Panel>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <Ribbon>
              <T en="Today's quest · {n} min" vars={{ n: plan.minutes }} />
            </Ribbon>
            <h1 className="mt-2 font-display text-2xl font-bold leading-tight sm:text-3xl">
              <T en={next ? 'Your path for today' : 'Quest complete! 🏆'} />
            </h1>
          </div>
          <div className="w-44 text-right text-sm font-semibold text-ink-soft">
            <T en="{m} / {n} min played today" vars={{ m: minutesToday, n: plan.minutes }} />
            <Meter value={minutesToday} max={plan.minutes} color="#ffc23d" className="mt-1" />
          </div>
        </div>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2">
          {plan.missions.map((m, i) => {
            const mode = MODES[m.mode ?? modeFor(m.concepts, m.kind, m.id)];
            return (
              <li key={m.id}>
                <button
                  disabled={m.done}
                  onClick={() => go({ name: 'battle', mission: m, fromPlan: true })}
                  className={cx(
                    'town-btn flex h-full w-full items-start gap-3 rounded-2xl p-3 text-left',
                    m.done ? 'bg-[#d9efc9]' : m === next ? 'bg-[#ffe7a8]' : 'bg-paper hover:bg-paper-3',
                  )}
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl border-2 border-ink bg-paper text-2xl">{m.done ? '✅' : mode.emoji}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold uppercase tracking-wide text-ink-soft">
                      {i + 1}. <T en="{d} min" vars={{ d: m.duration }} /> · <T en={m.label} />
                    </span>
                    <span className="block font-display text-lg font-bold leading-tight">{m.title}</span>
                    <span className="mt-0.5 block text-xs font-semibold text-ink-soft">
                      <T en={mode.name} /> · 🪙 {m.reward.coins}
                      {m.reward.gems > 0 && <> · 💎 {m.reward.gems}</>}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        {next && (
          <TownButton tone="green" size="lg" className="mt-4 w-full sm:w-auto" onClick={() => go({ name: 'battle', mission: next, fromPlan: true })}>
            <TB en="▶ Play: {title}" vars={{ title: next.title }} />
          </TownButton>
        )}
      </Panel>

      <button onClick={() => go({ name: 'mistakes' })} className="town-panel flex w-full items-center gap-3 p-3 text-left">
        <span className="grid size-11 place-items-center rounded-xl border-2 border-ink bg-[#f8c9c2] text-2xl">📕</span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-lg font-bold">
            <T en="Mistake Book" />
          </span>
          <span className="block text-sm text-ink-soft">
            <T en="Fix the questions you got wrong — they come back until you've got them." />
          </span>
        </span>
        {openMistakes > 0 && <span className="rounded-full border-2 border-ink bg-[#e8584a] px-2.5 py-0.5 font-display text-sm font-bold text-white">{openMistakes}</span>}
      </button>

      <section>
        <h2 className="mb-2 font-display text-xl font-bold">
          <T en="All worlds" />
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {visibleWorlds().map((w) => {
            const cs = conceptsInWorld(w);
            const got = cs.reduce((s, c) => s + stars(states[c.id]), 0);
            const due = cs.filter((c) => states[c.id] && states[c.id].attempts > 0 && isDue(states[c.id])).length;
            return (
              <button key={w.id} onClick={() => go({ name: 'world', worldId: w.id })} className="town-panel relative flex flex-col p-3 text-left">
                {due > 0 && <span className="absolute right-2 top-2 rounded-full border-2 border-ink bg-[#8b5cf6] px-2 text-xs font-bold text-white">🔁 {due}</span>}
                <span className="grid size-10 place-items-center rounded-xl border-2 border-ink text-xl" style={{ background: `${w.color}55` }}>
                  {w.emoji}
                </span>
                <span className="mt-2 font-display text-base font-bold leading-tight">
                  <TB en={w.name} />
                </span>
                <span className="mt-auto pt-2">
                  <Meter value={got} max={cs.length * 3} color={w.color} className="h-2" />
                  <span className="mt-1 block text-xs font-semibold tabular-nums text-ink-soft">
                    ⭐ {got}/{cs.length * 3}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </TownScreen>
  );
}
