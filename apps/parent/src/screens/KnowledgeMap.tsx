import { useState } from 'react';
import type { StudentProfile } from '@atlas/db';
import { isMastered } from '@atlas/engine';
import { getConcept, knowledgeTree } from '@atlas/knowledge';
import { Button, Card, Progress, cx, useQuery, useRepo } from '@atlas/ui';

const rel = (ts: number) => {
  const d = Math.round((ts - Date.now()) / 86_400_000);
  return d <= 0 ? 'due now' : d === 1 ? 'tomorrow' : `in ${d} days`;
};

/** Subject → Domain → Skill → Concept, with each concept's live learning state. */
export function KnowledgeMap({ student }: { student: StudentProfile }) {
  const repo = useRepo();
  const states = useQuery((r) => r.getStates(student.id), [student.id]);
  const goals = useQuery((r) => r.listGoals(student.id), [student.id]);
  const attempts = useQuery((r) => r.listAttempts(student.id, Date.now() - 30 * 86_400_000), [student.id]);
  const [selected, setSelected] = useState<string | null>(null);
  const tree = knowledgeTree();
  const c = selected ? getConcept(selected) : undefined;
  const s = selected ? states[selected] : undefined;
  const focused = goals.some((g) => g.active && g.kind === 'focusConcept' && g.value === selected);
  const recent = attempts.filter((a) => a.conceptId === selected);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-4">
        {tree.map((t) => (
          <Card key={t.subject.id} title={`${t.subject.emoji} ${t.subject.name}`}>
            <div className="space-y-4">
              {t.domains.map((d) => (
                <div key={d.name}>
                  <h3 className="mb-2 font-bold">{d.name}</h3>
                  <div className="space-y-2 border-l-2 border-slate-200 pl-3 dark:border-slate-800">
                    {d.skills.map((sk) => (
                      <div key={sk.name}>
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{sk.name}</div>
                        <div className="mt-1 grid gap-1.5 sm:grid-cols-2">
                          {sk.concepts.map((cc) => {
                            const st = states[cc.id];
                            return (
                              <button
                                key={cc.id}
                                onClick={() => setSelected(cc.id)}
                                className={cx(
                                  'rounded-xl px-3 py-2 text-left ring-1 transition',
                                  selected === cc.id ? 'bg-brand-50 ring-brand-500 dark:bg-brand-700/20' : 'ring-slate-200 hover:bg-slate-50 dark:ring-slate-800 dark:hover:bg-slate-800/60',
                                )}
                              >
                                <div className="flex items-center justify-between gap-2 text-sm">
                                  <span className="font-semibold">{cc.name}</span>
                                  <span className="tabular-nums text-xs text-slate-500">{st ? Math.round(st.mastery) : '—'}</span>
                                </div>
                                <Progress value={st ? st.mastery : 0} className="mt-1.5 h-1.5" label={`${cc.name} mastery`} />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
      <div className="lg:sticky lg:top-32 lg:self-start">
        <Card title="Concept details">
          {!c ? (
            <p className="text-sm text-slate-500">Select a concept to see its mastery, confidence, review schedule and lesson.</p>
          ) : (
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="text-lg font-extrabold">{c.name}</h3>
                <p className="text-slate-500">{c.description}</p>
                <p className="mt-1 text-xs text-slate-500">
                  In-game: <b>{c.missionName}</b>
                  {c.cefr && <> · CEFR {c.cefr}</>}
                </p>
              </div>
              {s ? (
                <dl className="grid grid-cols-2 gap-2">
                  <Item k="Mastery" v={`${Math.round(s.mastery)}/100${isMastered(s) ? ' ✓' : ''}`} />
                  <Item k="Confidence" v={`${Math.round(s.confidence * 100)}%`} />
                  <Item k="Answers" v={`${s.correct}/${s.attempts} correct`} />
                  <Item k="Next review" v={s.attempts ? rel(s.nextReview) : '—'} />
                  <Item k="Last 30 days" v={recent.length ? `${Math.round((recent.filter((a) => a.correct).length / recent.length) * 100)}% of ${recent.length}` : '—'} />
                  <Item k="Last mistake" v={s.lastWrongAt ? new Date(s.lastWrongAt).toLocaleDateString() : '—'} />
                </dl>
              ) : (
                <p className="text-slate-500">Not started yet.</p>
              )}
              {c.lesson && (
                <div className="rounded-xl bg-amber-50 p-3 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100">
                  <b>Lesson:</b> {c.lesson}
                </div>
              )}
              {c.examRefs && <p className="text-xs text-slate-500">Exam references: {c.examRefs.join(' · ')}</p>}
              {c.prerequisites && <p className="text-xs text-slate-500">Builds on: {c.prerequisites.map((p) => getConcept(p)?.name).join(', ')}</p>}
              <Button
                variant={focused ? 'secondary' : 'primary'}
                className="w-full"
                onClick={async () => {
                  const g = goals.find((x) => x.kind === 'focusConcept' && x.value === c.id);
                  if (g) await repo.deleteGoal(g.id);
                  else await repo.setGoal(student.id, 'focusConcept', c.id);
                }}
              >
                {focused ? '✓ Focus concept — remove' : '🎯 Make this a focus concept'}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Item({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
      <dt className="text-xs text-slate-500">{k}</dt>
      <dd className="font-bold">{v}</dd>
    </div>
  );
}
