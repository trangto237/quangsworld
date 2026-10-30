import type { StudentProfile } from '@atlas/db';
import { EXAMS, KIND_INFO, examSize } from '@atlas/engine';
import { cx, useQuery } from '@atlas/ui';
import { TownScreen } from '../town/Shell';
import { Panel, TownButton } from '../town/ui';
import { T, TB } from '../i18n';
import { useKid } from '../store';

const SUBJECTS = [
  ['english', '🇬🇧 English'],
  ['math', '📐 Toán · Maths'],
  ['literature', '✍️ Ngữ văn'],
] as const;

export const formatScore = (r: { score: number | null; band: number | null }) => (r.score != null ? `${r.score.toFixed(2)} / 10` : r.band != null ? `Band ${r.band.toFixed(1)}` : '—');

/** The Exam Hall: full mock papers in real exam formats, and past results. */
export function ExamHall({ student }: { student: StudentProfile }) {
  const go = useKid((s) => s.go);
  const results = useQuery((r) => r.listExamResults(student.id), [student.id]);
  const inProgress = useQuery((r) => r.getKv<{ examId: string }>(`exam-progress:${student.id}`), [student.id]);
  const real = useQuery((r) => r.listImportedExams(), []);
  const nameOf = (id: string) => EXAMS.find((e) => e.id === id)?.name ?? real.find((e) => e.id === id)?.name ?? 'Removed paper';

  return (
    <TownScreen student={student} tab="exams">
      <Panel>
        <h1 className="font-display text-3xl font-bold">
          🏛️ <T en="Exam Hall" />
        </h1>
        <p className="text-ink-soft">
          <T en="Real exam format, real timer. No game — just you and the paper. Your mistakes go to the Mistake Book afterwards." />
        </p>
      </Panel>
        {SUBJECTS.map(([subject, label]) => (
          <section key={subject} className="mt-6">
            <h2 className="font-display text-2xl font-bold">{label}</h2>
            <div className="mt-3 grid gap-4 md:grid-cols-3">
          {EXAMS.filter((e) => e.subject === subject).map((e) => {
            const mine = results.filter((r) => r.examId === e.id);
            const last = mine.at(-1);
            const resuming = inProgress?.examId === e.id;
            return (
              <section key={e.id} className={cx('town-panel flex flex-col gap-0 p-4', resuming && 'bg-tint-amber')}>
                <div className="grid size-14 place-items-center rounded-2xl border-2 border-ink bg-paper-2 text-3xl">{e.icon}</div>
                <h2 className="mt-2 font-display text-xl font-bold leading-tight">{e.name}</h2>
                <p className="mt-1 text-sm text-ink-soft">{e.description}</p>
                <div className="mb-4 mt-3 text-sm text-ink-soft">
                  {last ? (
                    <>
                      <T en="Last result" />: <b className="text-ink-text">{formatScore(last)}</b> · {mine.length}× <T en="taken" />
                    </>
                  ) : (
                    <T en="Not taken yet" />
                  )}
                </div>
                <TownButton tone="green" className="mt-auto w-full py-2.5" onClick={() => go({ name: 'exam', examId: e.id })}>
                  <TB en={resuming ? 'Continue paper →' : 'Start paper →'} />
                </TownButton>
              </section>
            );
          })}
            </div>
          </section>
        ))}
        {real.length > 0 && (
          <section className="mt-8">
            <h2 className="font-display text-2xl font-bold">
              📜 <T en="Real papers" />
            </h2>
            <p className="text-sm text-ink-soft">
              <T en="Past papers and practice tests your parent imported." />
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {real.map((e) => {
                const mine = results.filter((r) => r.examId === e.id);
                const last = mine.at(-1);
                const resuming = inProgress?.examId === e.id;
                return (
                  <section key={e.id} className={cx('town-panel flex items-center gap-3 p-3', resuming && 'bg-tint-amber')}>
                    <span className="grid size-12 shrink-0 place-items-center rounded-xl border-2 border-ink bg-paper-2 text-2xl">{KIND_INFO[e.kind].emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-display text-lg font-bold leading-tight">{e.name}</div>
                      <div className="text-xs text-ink-soft">
                        {examSize(e)} <T en="questions" /> · {e.minutes} min ·{' '}
                        {last ? (
                          <>
                            <T en="Last result" />: <b className="text-ink-text">{formatScore(last)}</b>
                          </>
                        ) : (
                          <T en="Not taken yet" />
                        )}
                      </div>
                    </div>
                    <TownButton tone="green" size="sm" onClick={() => go({ name: 'exam', examId: e.id })}>
                      <TB en={resuming ? 'Continue →' : 'Start →'} />
                    </TownButton>
                  </section>
                );
              })}
            </div>
          </section>
        )}
        <p className="mt-4 text-xs text-ink-soft">
          <T en="The Hà Nội paper follows the usual structure of recent entrance exams for regular public schools. Check your school's official sample paper (đề minh họa) for this year's exact format." />
        </p>

        {results.length > 0 && (
          <section className="mt-8">
            <h2 className="font-display text-2xl font-bold">
              <T en="Your results" />
            </h2>
            <div className="town-panel mt-3 overflow-x-auto p-0">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-ink-soft">
                  <tr>
                    <th className="px-4 py-2">
                      <T en="Date" />
                    </th>
                    <th>
                      <T en="Paper" />
                    </th>
                    <th className="text-right">
                      <T en="Score" />
                    </th>
                    <th className="text-right">
                      <T en="Correct" />
                    </th>
                    <th className="px-4 text-right">
                      <T en="Time" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...results].reverse().map((r) => (
                    <tr key={r.id} className="border-t-2 border-ink/15">
                      <td className="px-4 py-2">{new Date(r.finishedAt).toLocaleDateString()}</td>
                      <td>{nameOf(r.examId)}</td>
                      <td className="text-right font-bold tabular-nums">{formatScore(r)}</td>
                      <td className="text-right tabular-nums">
                        {r.correct}/{r.total}
                      </td>
                      <td className="px-4 text-right tabular-nums">{Math.round(r.durationMs / 60000)} min</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
    </TownScreen>
  );
}
