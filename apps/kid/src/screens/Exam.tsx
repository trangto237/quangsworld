import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { StudentProfile } from '@atlas/db';
import {
  applyAnswer, assemblePaper, examById, gradePaper, historyFromAttempts, isCorrectAnswer, newConceptState, scheduleReview,
  type ExamGrade, type ExamPaper,
} from '@atlas/engine';
import { present, type PresentedQuestion } from '@atlas/knowledge';
import type { ConceptState, Question } from '@atlas/shared';
import { DAY_MS } from '@atlas/shared';
import { Button, Marked, Modal, Progress, cx, useRepo } from '@atlas/ui';
import { Explanation } from '../components/Explanation';
import { SignBox } from '../components/QuestionCard';
import { speakScript, stopSpeaking } from '../lib/speech';
import { T, TB, tr, useLang } from '../i18n';
import { useKid } from '../store';
import { formatScore } from './ExamHall';

interface ExamProgress {
  examId: string;
  paper: ExamPaper;
  /** Options shuffled once, so they don't move while the paper is open. */
  shown: Record<string, string[]>;
  answers: Record<string, string>;
  flagged: string[];
  played: string[];
  startedAt: number;
  strictAudio: boolean;
}

const LETTER = 'ABCD';
const key = (studentId: string) => `exam-progress:${studentId}`;
const fmt = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/** A full mock paper: timer, answer sheet, autosave; then results and a full review. */
export function Exam({ student, examId }: { student: StudentProfile; examId: string }) {
  const repo = useRepo();
  const go = useKid((s) => s.go);
  const lang = useLang();
  const blueprint = examById(examId)!;
  const [progress, setProgress] = useState<ExamProgress | null>(() => {
    const saved = repo.getKv<ExamProgress>(key(student.id));
    return saved && saved.examId === examId ? saved : null;
  });
  const [strictAudio, setStrictAudio] = useState(true);
  const [grade, setGrade] = useState<ExamGrade | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [playing, setPlaying] = useState<string | null>(null);
  const submitted = useRef(false);

  const start = () => {
    const history = historyFromAttempts(repo.listAttempts(student.id, Date.now() - 30 * DAY_MS));
    const usedSets = repo.listExamResults(student.id).flatMap((r) => r.setIds);
    const paper = assemblePaper(blueprint, { history, usedSets });
    const shown: Record<string, string[]> = {};
    for (const s of paper.sections) for (const q of s.questions) shown[q.id] = present(q).shown;
    const p: ExamProgress = { examId, paper, shown, answers: {}, flagged: [], played: [], startedAt: Date.now(), strictAudio };
    setProgress(p);
    void repo.setKv(key(student.id), p);
  };

  const save = useCallback(
    (patch: Partial<ExamProgress>) => {
      setProgress((p) => {
        if (!p) return p;
        const next = { ...p, ...patch };
        void repo.setKv(key(student.id), next);
        return next;
      });
    },
    [repo, student.id],
  );

  const questions = useMemo(() => progress?.paper.sections.flatMap((s) => s.questions) ?? [], [progress?.paper]);
  const numberOf = useMemo(() => new Map(questions.map((q, i) => [q.id, i + 1])), [questions]);
  const deadline = progress ? progress.startedAt + blueprint.minutes * 60_000 : 0;
  const remaining = deadline - now;

  const submit = useCallback(async () => {
    if (!progress || submitted.current) return;
    submitted.current = true;
    stopSpeaking();
    const g = gradePaper(progress.paper, progress.answers);
    const finishedAt = Date.now();
    // Every answer updates mastery; unanswered questions count as wrong.
    const states: Record<string, ConceptState> = { ...repo.getStates(student.id) };
    const perConcept = new Map<string, { n: number; c: number }>();
    const answers = questions.map((q) => {
      const answer = progress.answers[q.id] ?? '';
      const correct = isCorrectAnswer(q, answer);
      states[q.conceptId] = applyAnswer(states[q.conceptId] ?? newConceptState(q.conceptId), { correct, difficulty: q.difficulty, now: finishedAt });
      const pc = perConcept.get(q.conceptId) ?? { n: 0, c: 0 };
      pc.n++;
      if (correct) pc.c++;
      perConcept.set(q.conceptId, pc);
      return { question: q, answer, correct };
    });
    const updated = [...perConcept].map(([cid, pc]) => scheduleReview(states[cid], pc.c / pc.n, finishedAt));
    const good = (g.score ?? 0) >= 8 || (g.band ?? 0) >= 6.5;
    await repo.completeExam(student.id, {
      result: {
        examId,
        startedAt: progress.startedAt,
        finishedAt,
        durationMs: Math.min(finishedAt - progress.startedAt, blueprint.minutes * 60_000),
        correct: g.correct,
        total: g.total,
        score: g.score,
        band: g.band,
        sections: g.sections,
        setIds: progress.paper.setIds,
      },
      answers,
      states: updated,
      reward: { coins: g.correct * 3, gems: good ? 2 : 0, xp: g.total * 5 },
    });
    await repo.setKv(key(student.id), null);
    setGrade(g);
  }, [blueprint.minutes, examId, progress, questions, repo, student.id]);

  // Clock; time's up → submit automatically.
  useEffect(() => {
    if (!progress || grade) return;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [progress, grade]);
  useEffect(() => {
    if (progress && !grade && remaining <= 0) void submit();
  }, [remaining, progress, grade, submit]);
  useEffect(() => () => {
    stopSpeaking();
  }, []);

  // ── Intro ────────────────────────────────────────────────────
  if (!progress)
    return (
      <div className="grid min-h-dvh place-items-center bg-slate-100 p-4 dark:bg-slate-950">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-900">
          <h1 className="font-display text-2xl font-bold">{blueprint.name}</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">{blueprint.description}</p>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
            <li>
              <T en="The timer starts when you press Start and keeps running if you leave." />
            </li>
            <li>
              <T en="You can change answers and flag questions until you submit." />
            </li>
            <li>
              <T en="No hints or translations of the questions — like the real exam. Instructions have Vietnamese." />
            </li>
          </ul>
          {blueprint.scoring === 'ielts-listening' && (
            <label className="mt-4 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={strictAudio} onChange={(e) => setStrictAudio(e.target.checked)} />
              <T en="Exam conditions: each recording plays only once" />
            </label>
          )}
          <div className="mt-6 flex gap-2">
            <Button variant="secondary" onClick={() => go({ name: 'exam-hall' })}>
              <TB en="← Back" />
            </Button>
            <Button className="flex-1" onClick={start}>
              <TB en="Start — the timer begins" />
            </Button>
          </div>
        </div>
      </div>
    );

  // ── Results & review ─────────────────────────────────────────
  if (grade) return <ExamResultView grade={grade} progress={progress} examName={blueprint.name} onDone={() => go({ name: 'exam-hall' })} />;

  // ── Paper ────────────────────────────────────────────────────
  const answeredCount = questions.filter((q) => (progress.answers[q.id] ?? '') !== '').length;
  const setAnswer = (id: string, value: string) => save({ answers: { ...progress.answers, [id]: value } });
  const toggleFlag = (id: string) => save({ flagged: progress.flagged.includes(id) ? progress.flagged.filter((x) => x !== id) : [...progress.flagged, id] });
  const jump = (id: string) => document.getElementById(`q-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  return (
    <div className="min-h-dvh bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/95 px-4 py-2 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div className="min-w-0">
          <div className="truncate font-display font-semibold">{blueprint.name}</div>
          <div className="text-xs text-slate-500">
            {answeredCount}/{questions.length} <T en="answered" />
          </div>
        </div>
        <div className={cx('ml-auto rounded-lg px-3 py-1 font-mono text-lg font-bold tabular-nums', remaining < 5 * 60_000 ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-slate-100 dark:bg-slate-800')} aria-label="Time left">
          ⏱ {fmt(remaining)}
        </div>
        <Button onClick={() => setConfirm(true)}>
          <TB en="Submit" />
        </Button>
      </header>

      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
        <main className="min-w-0 flex-1 space-y-6">
          {progress.paper.sections.map((s, si) => {
            const first = s.questions[0];
            const sharedPassage = s.setId && first?.passage ? first.passage.replace(/[[\]]/g, '') : null;
            const script = s.setId ? first?.script : undefined;
            return (
              <section key={s.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                <h2 className="font-bold">
                  PART {si + 1}. {s.instructions}
                </h2>
                {lang !== 'en' && <p className="mt-0.5 text-sm text-rose-800 dark:text-rose-300">🇻🇳 {s.viInstructions}</p>}
                {script && (
                  <div className="mt-3">
                    <Button
                      variant="secondary"
                      disabled={playing !== null || (progress.strictAudio && progress.played.includes(s.id))}
                      onClick={() => {
                        setPlaying(s.id);
                        save({ played: [...progress.played, s.id] });
                        speakScript(script, () => setPlaying(null));
                      }}
                    >
                      {playing === s.id ? '🔊 …' : progress.strictAudio && progress.played.includes(s.id) ? <T en="Recording played" /> : <TB en="▶ Play recording" />}
                    </Button>
                  </div>
                )}
                {sharedPassage && <p className="mt-3 whitespace-pre-line rounded-xl bg-amber-50 p-4 text-[15px] leading-relaxed text-amber-950 dark:bg-amber-950/30 dark:text-amber-50">{sharedPassage}</p>}
                <ol className="mt-4 space-y-5">
                  {s.questions.map((q) => (
                    <PaperQuestion
                      key={q.id}
                      n={numberOf.get(q.id)!}
                      q={q}
                      shown={progress.shown[q.id] ?? []}
                      inSet={!!s.setId}
                      value={progress.answers[q.id] ?? ''}
                      flagged={progress.flagged.includes(q.id)}
                      onChange={(v) => setAnswer(q.id, v)}
                      onFlag={() => toggleFlag(q.id)}
                    />
                  ))}
                </ol>
              </section>
            );
          })}
          <Button className="w-full py-3" onClick={() => setConfirm(true)}>
            <TB en="Submit" />
          </Button>
        </main>

        {/* Answer sheet */}
        <aside className="sticky top-20 hidden h-fit w-64 shrink-0 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 lg:block dark:bg-slate-900 dark:ring-slate-800">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <T en="Answer sheet" />
          </p>
          <div className="grid grid-cols-5 gap-1.5">
            {questions.map((q, i) => {
              const a = progress.answers[q.id] ?? '';
              const shown = progress.shown[q.id] ?? [];
              const letter = q.type === 'input' ? (a ? '✓' : '') : a ? LETTER[shown.indexOf(a)] : '';
              return (
                <button
                  key={q.id}
                  onClick={() => jump(q.id)}
                  className={cx(
                    'relative rounded-md py-1 text-xs font-bold tabular-nums ring-1',
                    a ? 'bg-brand-600 text-white ring-brand-600' : 'ring-slate-300 dark:ring-slate-600',
                    progress.flagged.includes(q.id) && 'ring-2 ring-amber-400',
                  )}
                  title={`${i + 1}`}
                >
                  {i + 1}
                  {letter && <span className="ml-0.5 opacity-80">{letter}</span>}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            <span className="inline-block size-2 rounded-sm bg-brand-600" /> <T en="answered" /> · <span className="inline-block size-2 rounded-sm ring-2 ring-amber-400" /> <T en="flagged" />
          </p>
        </aside>
      </div>

      <Modal open={confirm} onClose={() => setConfirm(false)} title={tr(lang, 'Submit your paper?')}>
        <p className="text-sm">
          {questions.length - answeredCount > 0 ? (
            <T en="You have {n} unanswered questions. Unanswered questions score zero." vars={{ n: questions.length - answeredCount }} />
          ) : (
            <T en="All questions answered." />
          )}
          {progress.flagged.length > 0 && (
            <>
              {' '}
              <T en="{n} flagged for review." vars={{ n: progress.flagged.length }} />
            </>
          )}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirm(false)}>
            <TB en="Keep working" />
          </Button>
          <Button
            onClick={() => {
              setConfirm(false);
              void submit();
            }}
          >
            <TB en="Submit" />
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function PaperQuestion({
  n,
  q,
  shown,
  inSet,
  value,
  flagged,
  onChange,
  onFlag,
}: {
  n: number;
  q: PresentedQuestion | Question;
  shown: string[];
  inSet: boolean;
  value: string;
  flagged: boolean;
  onChange: (v: string) => void;
  onFlag: () => void;
}) {
  return (
    <li id={`q-${q.id}`} className="scroll-mt-24">
      <div className="relative flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-2">
        <span className="mt-0.5 shrink-0 font-bold tabular-nums">Question {n}.</span>
        <div className="min-w-0 flex-1">
          {q.sign && <SignBox text={q.sign} />}
          {!inSet && q.passage && <p className="mb-2 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800/60">{q.passage}</p>}
          <p className="whitespace-pre-line">
            <Marked text={q.prompt.replace(/^Choose the sentence (closest in meaning to|that best combines): /, '')} />
          </p>
          {q.type === 'input' ? (
            <input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="mt-2 w-full max-w-sm rounded-lg px-3 py-2 ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-brand-500 dark:bg-slate-800 dark:ring-slate-600"
              placeholder="…"
              aria-label={`Answer ${n}`}
              autoComplete="off"
              spellCheck={false}
            />
          ) : (
            <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
              {shown.map((opt, i) => (
                <label
                  key={opt}
                  className={cx(
                    'flex cursor-pointer items-start gap-2 rounded-lg px-3 py-2 ring-1 transition',
                    value === opt ? 'bg-brand-50 ring-brand-500 dark:bg-brand-700/25' : 'ring-slate-200 hover:bg-slate-50 dark:ring-slate-700 dark:hover:bg-slate-800',
                  )}
                >
                  <input type="radio" name={q.id} checked={value === opt} onChange={() => onChange(opt)} className="mt-1" />
                  <span>
                    <b>{LETTER[i]}.</b> <Marked text={opt} />
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
        <button onClick={onFlag} className={cx('absolute right-0 top-0 shrink-0 rounded px-1.5 text-lg sm:static', flagged ? 'text-amber-500' : 'text-slate-300 hover:text-slate-500')} aria-pressed={flagged} aria-label={`Flag question ${n}`} title="Flag for review">
          ⚑
        </button>
      </div>
    </li>
  );
}

function ExamResultView({ grade, progress, examName, onDone }: { grade: ExamGrade; progress: ExamProgress; examName: string; onDone: () => void }) {
  const [reviewing, setReviewing] = useState(false);
  const [onlyWrong, setOnlyWrong] = useState(true);
  const questions = progress.paper.sections.flatMap((s) => s.questions);

  if (reviewing)
    return (
      <div className="min-h-dvh bg-slate-100 pb-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/95 px-4 py-2 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
          <div className="font-display font-semibold">
            <T en="Review" /> · {examName}
          </div>
          <label className="ml-auto flex items-center gap-2 text-sm">
            <input type="checkbox" checked={onlyWrong} onChange={(e) => setOnlyWrong(e.target.checked)} /> <T en="Only my mistakes" />
          </label>
          <Button variant="secondary" onClick={onDone}>
            <TB en="Done" />
          </Button>
        </header>
        <main className="mx-auto max-w-3xl space-y-4 px-4 py-6">
          {questions.map((q, i) => {
            const a = progress.answers[q.id] ?? '';
            const ok = isCorrectAnswer(q, a);
            if (onlyWrong && ok) return null;
            return (
              <div key={q.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                <p className="font-bold">
                  {ok ? '✅' : '❌'} Question {i + 1}
                </p>
                {q.sign && <SignBox text={q.sign} />}
                {q.passage && (
                  <details className="my-2 text-sm">
                    <summary className="cursor-pointer text-slate-500">
                      <T en="Show passage" />
                    </summary>
                    <p className="mt-1 whitespace-pre-line rounded-lg bg-amber-50 p-3 dark:bg-amber-950/30">{q.passage}</p>
                  </details>
                )}
                <p className="mb-2 whitespace-pre-line">
                  <Marked text={q.prompt} />
                </p>
                <Explanation question={q} picked={a || '(no answer)'} />
              </div>
            );
          })}
        </main>
      </div>
    );

  const isTen = grade.score != null;
  return (
    <div className="grid min-h-dvh place-items-center bg-gradient-to-b from-indigo-900 to-slate-950 p-4 text-white">
      <div className="w-full max-w-xl animate-pop rounded-3xl bg-slate-950/80 p-6 ring-1 ring-white/10">
        <p className="text-center text-sm font-bold uppercase tracking-widest text-amber-300">{examName}</p>
        <div className="mt-2 text-center font-display text-6xl font-bold">{formatScore(grade)}</div>
        {!isTen && (
          <p className="text-center text-xs text-white/60">
            <T en="Estimated band (mini test scaled to a full test). Real IELTS uses a full paper." />
          </p>
        )}
        <p className="mt-2 text-center text-white/70">
          {grade.correct}/{grade.total} <T en="correct" /> · {Math.round(Math.min(Date.now() - progress.startedAt, examById(progress.examId)!.minutes * 60_000) / 60000)} min
        </p>
        <div className="mt-6 space-y-2">
          {grade.sections.map((s) => (
            <div key={s.id} className="flex items-center gap-3 text-sm">
              <span className="w-44 shrink-0 truncate">{s.title}</span>
              <Progress value={s.correct} max={s.total} className="bg-white/10" color={s.correct / s.total >= 0.8 ? '#34d399' : s.correct / s.total >= 0.5 ? '#fbbf24' : '#f87171'} label={s.title} />
              <span className="w-12 text-right tabular-nums">
                {s.correct}/{s.total}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-sm text-white/70">
          <T en="Wrong answers are saved in your Mistake Book." />
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={onDone}>
            <TB en="Exam Hall" />
          </Button>
          <Button variant="game" onClick={() => setReviewing(true)}>
            <TB en="Review answers →" />
          </Button>
        </div>
      </div>
    </div>
  );
}
