import type { StudentProfile } from '@atlas/db';
import { EXAMS } from '@atlas/engine';
import { cx, useQuery } from '@atlas/ui';
import { TownScreen } from '../town/Shell';
import { Panel, TownButton } from '../town/ui';
import { T, TB } from '../i18n';
import { useKid } from '../store';

const ICON: Record<string, string> = { hn10: '🏫', 'ielts-reading': '📖', 'ielts-listening': '🎧' };

export const formatScore = (r: { score: number | null; band: number | null }) => (r.score != null ? `${r.score.toFixed(2)} / 10` : r.band != null ? `Band ${r.band.toFixed(1)}` : '—');

/** The Exam Hall: full mock papers in real exam formats, and past results. */
export function ExamHall({ student }: { student: StudentProfile }) {
  const go = useKid((s) => s.go);
  const results = useQuery((r) => r.listExamResults(student.id), [student.id]);
  const inProgress = useQuery((r) => r.getKv<{ examId: string }>(`exam-progress:${student.id}`), [student.id]);

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
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {EXAMS.map((e) => {
            const mine = results.filter((r) => r.examId === e.id);
            const last = mine.at(-1);
            const resuming = inProgress?.examId === e.id;
            return (
              <section key={e.id} className={cx('town-panel flex flex-col gap-0 p-4', resuming && 'bg-[#ffe7a8]')}>
                <div className="grid size-14 place-items-center rounded-2xl border-2 border-ink bg-paper-2 text-3xl">{ICON[e.id]}</div>
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
                      <td>{EXAMS.find((e) => e.id === r.examId)?.name ?? r.examId}</td>
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
