import type { StudentProfile } from '@atlas/db';
import { computeInsights, dailyMinutes, levelFromXp, planDay } from '@atlas/engine';
import { getConcept } from '@atlas/knowledge';
import { DAY_MS } from '@atlas/shared';
import { Button, Card, Stat, useQuery } from '@atlas/ui';
import { MasteryHeatmap, SubjectBars, WeeklyBars } from '../components/charts';
import { useParent } from '../store';

export function Dashboard({ student }: { student: StudentProfile }) {
  const setTab = useParent((s) => s.setTab);
  const data = useQuery(
    (r) => {
      const now = Date.now();
      const states = r.getStates(student.id);
      const goals = r.listGoals(student.id);
      const attempts = r.listAttempts(student.id, now - 30 * DAY_MS);
      return {
        states,
        goals,
        attempts,
        insights: computeInsights({ states, attempts, sessions: r.listSessions(student.id, now - 60 * DAY_MS), now }),
        placement: r.latestPlacement(student.id),
        wallet: r.getWallet(student.id),
        plan: planDay({ states, goals, now }),
      };
    },
    [student.id],
  );
  const { insights: ins, placement, wallet, plan } = data;
  const goal = dailyMinutes(data.goals);
  const recent = [...data.attempts].reverse().slice(0, 8);

  if (!student.placementDone && !placement)
    return (
      <Card>
        <div className="py-10 text-center">
          <div className="text-5xl">🗺️</div>
          <h2 className="mt-3 text-xl font-bold">{student.name} hasn't taken the placement trial yet</h2>
          <p className="mx-auto mt-2 max-w-md text-slate-500">
            Open the kid app on this device. The "Trial of Five Realms" (about 25 minutes) estimates vocabulary, grammar, listening, reading and maths so the
            curriculum adapts from day one.
          </p>
          <a href="/" className="mt-5 inline-block">
            <Button>Open the kid app</Button>
          </a>
        </div>
      </Card>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold">
            {student.avatar} {student.name}'s progress
          </h1>
          <p className="text-sm text-slate-500">
            Level {levelFromXp(wallet.xp).level} · {ins.questions7d} challenges this week
            {ins.accuracy7d != null && <> · {Math.round(ins.accuracy7d * 100)}% correct</>}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon="⏱️" label="This week" value={`${ins.weeklyMinutes}m`} hint={`avg ${Math.round(ins.weeklyMinutes / 7)} min/day · target ${goal}`} />
        <Stat icon="🔥" label="Streak" value={`${ins.streakDays}d`} hint={ins.streakDays ? 'consecutive study days' : 'play today to start one'} />
        <Stat icon="🏅" label="Mastered" value={ins.masteredCount} hint={`of ${ins.totalConcepts} concepts`} />
        <Stat icon="🎓" label="IELTS estimate" value={ins.ielts ? ins.ielts.band.toFixed(1) : '—'} hint={ins.ielts ? `≈ CEFR ${ins.ielts.cefr} · rough guide, not an exam score` : 'after placement'} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Insights" className="lg:col-span-2">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-bold text-rose-700 dark:text-rose-400">⚠ Repeatedly struggles with</h3>
              {ins.struggles.length ? (
                <ul className="space-y-1.5 text-sm">
                  {ins.struggles.map((s) => (
                    <li key={s.conceptId}>
                      <b>{s.name}</b> <span className="text-slate-500">— {s.detail}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">Nothing stands out yet. Patterns appear after a few sessions.</p>
              )}
            </div>
            <div>
              <h3 className="mb-2 text-sm font-bold text-emerald-700 dark:text-emerald-400">✓ Strongest areas</h3>
              {ins.strengths.length ? (
                <ul className="space-y-1.5 text-sm">
                  {ins.strengths.map((s) => (
                    <li key={s.conceptId}>
                      <b>{s.name}</b> <span className="text-slate-500">— {s.detail}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">Strengths appear once concepts reach 70+ mastery.</p>
              )}
            </div>
          </div>
          <div className="mt-5 rounded-xl bg-brand-50 p-4 dark:bg-brand-700/15">
            <h3 className="mb-2 text-sm font-bold text-brand-700 dark:text-brand-400">🎯 Recommended focus</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {ins.recommended.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        </Card>

        <Card title="Today's plan (auto)" action={<button className="text-xs font-semibold text-brand-600 dark:text-brand-400" onClick={() => setTab('goals')}>Adjust goals</button>}>
          <ol className="space-y-2 text-sm">
            {plan.blocks.map((b, i) => (
              <li key={i} className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
                <span className="w-12 font-bold tabular-nums">{b.minutes} min</span>
                <span className="flex-1">
                  {b.label}
                  <span className="block text-xs text-slate-500">
                    {b.kind === 'boss' ? 'mixed review battle' : b.conceptIds.map((c) => getConcept(c)?.name).join(', ')}
                  </span>
                </span>
                {b.kind === 'review' && <span className="rounded bg-amber-100 px-1.5 text-xs font-semibold text-amber-800 dark:bg-amber-900 dark:text-amber-200">review</span>}
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-slate-500">Built from mastery, recent mistakes, review schedule and your goals.</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Weekly study time" className="lg:col-span-2">
          <WeeklyBars data={ins.weekly} goal={goal} />
        </Card>
        <Card title="Subject progress">
          <SubjectBars data={ins.subjectProgress} />
        </Card>
      </div>

      <Card title="Concept heatmap" action={<button className="text-xs font-semibold text-brand-600 dark:text-brand-400" onClick={() => setTab('knowledge')}>Open knowledge map</button>}>
        <MasteryHeatmap cells={ins.heatmap} onSelect={() => setTab('knowledge')} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {placement && (
          <Card title={`Placement result · ${new Date(placement.createdAt).toLocaleDateString()}`}>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
              <h4 className="col-span-1 font-bold">English</h4>
              <h4 className="col-span-1 font-bold">Math</h4>
              {(['vocabulary', 'grammar', 'listening', 'reading'] as const).map((k, i) => {
                const mk = (['number', 'algebra', 'geometry', 'logic'] as const)[i];
                return [
                  <Row key={k} label={k} value={placement.scores.english[k]} />,
                  <Row key={mk} label={mk} value={placement.scores.math[mk]} />,
                ];
              })}
            </div>
          </Card>
        )}
        <Card title="Recent activity">
          {recent.length ? (
            <ul className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
              {recent.map((a) => (
                <li key={a.id} className="flex items-center gap-3 py-1.5">
                  <span aria-label={a.correct ? 'correct' : 'incorrect'}>{a.correct ? '✅' : '❌'}</span>
                  <span className="flex-1 truncate">{getConcept(a.conceptId)?.name ?? a.conceptId}</span>
                  <span className="text-xs text-slate-500">{a.context}</span>
                  <span className="w-16 text-right text-xs tabular-nums text-slate-500">{new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No activity yet.</p>
          )}
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="capitalize text-slate-600 dark:text-slate-300">{label}</span>
      <span className="font-bold tabular-nums">{value}</span>
    </div>
  );
}
