import { useMemo, useRef, useState } from 'react';
import type { Mistake, StudentProfile } from '@atlas/db';
import { getConcept, present, translatePrompt, worldOfConcept } from '@atlas/knowledge';
import { T, TB, tr, useLang } from '../i18n';
import { Button, Marked, Modal, useQuery, useRepo } from '@atlas/ui';
import { TownScreen } from '../town/Shell';
import { Meter, Panel, TownButton } from '../town/ui';
import { QuestionCard } from '../components/QuestionCard';
import { Explanation } from '../components/Explanation';
import { ActiveTimer } from '../lib/activeTime';
import { useKid } from '../store';

const COINS_PER_FIX = 5;

/** Every question missed in battle waits here until the learner gets it right on a calm retry. */
export function MistakeBook({ student }: { student: StudentProfile }) {
  const repo = useRepo();
  const go = useKid((s) => s.go);
  const open = useQuery((r) => r.listMistakes(student.id, { open: true }), [student.id]);
  const fixedThisWeek = useQuery((r) => r.listMistakes(student.id, { since: Date.now() - 7 * 86_400_000 }).filter((m) => m.resolvedAt).length, [student.id]);
  const [practice, setPractice] = useState<Mistake[] | null>(null);
  const [viewing, setViewing] = useState<Mistake | null>(null);
  const lang = useLang();

  const groups = useMemo(() => {
    const g = new Map<string, Mistake[]>();
    for (const m of open) g.set(m.conceptId, [...(g.get(m.conceptId) ?? []), m]);
    return [...g].sort((a, b) => b[1].length - a[1].length);
  }, [open]);

  if (practice) return <Practice student={student} queue={practice} onExit={() => setPractice(null)} />;

  return (
    <TownScreen student={student} tab={null} back={() => go({ name: 'quests' })} showPowers={false} className="max-w-4xl">
      <Panel>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold">
              <T en="📕 Mistake Book" />
            </h1>
            <p className="text-ink-soft">
              <T en="Every challenge you missed in battle. Get it right here to fix it — and earn 🪙 {n} each." vars={{ n: COINS_PER_FIX }} />
            </p>
          </div>
          {open.length > 0 && (
            <TownButton tone="green" size="lg" onClick={() => setPractice([...open].sort((a, b) => b.times - a.times))}>
              <TB en="Fix them ({n}) →" vars={{ n: open.length }} />
            </TownButton>
          )}
        </div>
        {fixedThisWeek > 0 && (
          <p className="mt-3 text-sm font-semibold text-[#2f8a3a] dark:text-[#86d993]">
            <T en="✨ {n} fixed this week" vars={{ n: fixedThisWeek }} />
          </p>
        )}
      </Panel>
      {open.length === 0 ? (
        <Panel className="mt-4 text-center">
          <div className="text-6xl">🌟</div>
          <p className="mt-3 font-display text-xl">
            <T en="Your Mistake Book is empty!" />
          </p>
          <p className="text-ink-soft">
            <T en="Mistakes from battles will appear here." />
          </p>
        </Panel>
      ) : (
        <div className="mt-4 space-y-4">
          {groups.map(([cid, ms]) => {
            const c = getConcept(cid);
            const w = worldOfConcept(cid);
            return (
              <Panel key={cid}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-display text-lg font-semibold">
                      {w?.emoji} {c?.missionName ?? cid}
                    </div>
                    <div className="text-xs text-ink-soft">{c?.name}</div>
                  </div>
                  <TownButton tone="amber" size="sm" onClick={() => setPractice(ms)}>
                    <TB en="Fix these ({n})" vars={{ n: ms.length }} />
                  </TownButton>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {ms.map((m) => (
                    <li key={m.id}>
                      <button onClick={() => setViewing(m)} className="flex w-full items-center gap-3 rounded-xl border-2 border-ink/30 bg-paper-2 px-3 py-2 text-left text-sm hover:bg-paper-3">
                        <span className="flex-1 truncate">
                          {m.question.conceptId.startsWith('en.pron') ? (
                            m.question.options.map((o, i) => (
                              <span key={o}>
                                {i > 0 && ' · '}
                                <Marked text={o} />
                              </span>
                            ))
                          ) : (
                            <>
                              {m.question.audio ? '🔊 ' : ''}
                              {m.question.prompt}
                            </>
                          )}
                        </span>
                        {m.times > 1 && <span className="shrink-0 rounded border border-ink bg-tint-pink px-1.5 text-xs font-bold">×{m.times}</span>}
                        {!m.reviewedAt && (
                          <span className="shrink-0 text-xs font-bold text-[#c2410c]">
                            <T en="new" />
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </Panel>
            );
          })}
        </div>
      )}
      <Modal open={!!viewing} onClose={() => setViewing(null)} title={tr(lang, 'Mistake')}>
        {viewing && (
          <div>
            {viewing.question.passage && <p className="mb-2 max-h-36 overflow-y-auto rounded-xl bg-amber-50 p-3 text-sm text-amber-950 dark:bg-amber-950/40 dark:text-amber-100">{viewing.question.passage}</p>}
            <p className="mb-3 font-semibold">{viewing.question.prompt}</p>
            {lang !== 'en' && translatePrompt(viewing.question.prompt, viewing.conceptId) && (
              <p lang="vi" className="-mt-2 mb-3 text-sm text-rose-900 dark:text-rose-200">
                🇻🇳 {translatePrompt(viewing.question.prompt, viewing.conceptId)}
              </p>
            )}
            <Explanation question={viewing.question} picked={viewing.picked} />
            <Button
              className="mt-4 w-full"
              onClick={() => {
                void repo.markMistakesReviewed([viewing.id]);
                setViewing(null);
              }}
            >
              <TB en="Got it" />
            </Button>
          </div>
        )}
      </Modal>
    </TownScreen>
  );
}

function Practice({ student, queue, onExit }: { student: StudentProfile; queue: Mistake[]; onExit: () => void }) {
  const repo = useRepo();
  const [i, setI] = useState(0);
  const [fixed, setFixed] = useState(0);
  const timer = useRef<ActiveTimer>(null as unknown as ActiveTimer);
  timer.current ??= new ActiveTimer();
  const question = useMemo(() => (i < queue.length ? present(queue[i].question) : null), [i, queue]);
  const done = i >= queue.length;

  const finish = async () => {
    const activeMs = timer.current.stop();
    await repo.completeMission(student.id, {
      states: [],
      session: { kind: 'mission', startedAt: timer.current.startedAt, endedAt: Date.now(), activeMs, missionTitle: 'Mistake Book' },
      reward: { coins: fixed * COINS_PER_FIX, gems: 0, xp: fixed * 10 },
    });
    onExit();
  };

  return (
    <div className="town-bg grid min-h-dvh place-items-center p-4 text-ink-text">
      <div className="w-full max-w-xl">
        {!done && question ? (
          <>
            <div className="mb-3 flex items-center justify-between text-sm font-semibold text-ink-soft">
              <span>📕 {getConcept(queue[i].conceptId)?.missionName}</span>
              <span className="tabular-nums">
                {i + 1}/{queue.length} · ✨ {fixed} fixed
              </span>
            </div>
            <Meter value={i} max={queue.length} className="mb-4" />
            <div className="town-panel p-5 sm:p-6">
              <QuestionCard
                key={queue[i].id}
                question={question}
                mode="practice"
                onAnswer={(correct, ms, picked) => {
                  timer.current.poke();
                  void repo.retryMistake(queue[i].id, correct, picked);
                  void repo.recordAnswer({ studentId: student.id, questionId: queue[i].questionId, conceptId: queue[i].conceptId, correct, difficulty: queue[i].question.difficulty, msSpent: ms, context: 'review' });
                  if (correct) setFixed((f) => f + 1);
                  setI(i + 1);
                }}
              />
            </div>
            <button className="mt-4 w-full text-center text-sm font-semibold text-ink-soft hover:underline" onClick={() => void finish()}>
              <T en="Stop for now" />
            </button>
          </>
        ) : (
          <div className="town-panel animate-pop p-8 text-center">
            <div className="text-6xl">{fixed === queue.length ? '🌟' : '💪'}</div>
            <h1 className="mt-3 font-display text-3xl font-bold">
              <T en="Fixed {f} of {n}!" vars={{ f: fixed, n: queue.length }} />
            </h1>
            <p className="mt-2 text-ink-soft">
              <T en={fixed < queue.length ? 'The rest stay in your book for another try.' : 'Your book is lighter already.'} />
            </p>
            <p className="mt-4 font-display text-2xl font-bold">🪙 +{fixed * COINS_PER_FIX}</p>
            <TownButton tone="green" size="lg" className="mt-6 w-full" onClick={() => void finish()}>
              <TB en="Done" />
            </TownButton>
          </div>
        )}
      </div>
    </div>
  );
}
