import { useEffect, useMemo, useRef, useState } from 'react';
import type { Question } from '@atlas/shared';
import { coach, pickQuestion, present, whyNot, type Bi, type CoachChip, type DrillItem } from '@atlas/knowledge';
import { Button, Marked, cx } from '@atlas/ui';
import { speak } from '../lib/speech';
import { T, TB, useLang } from '../i18n';
import { QuestionCard } from './QuestionCard';

/** English with a Vietnamese line under it ("help"), Vietnamese first ("vi"), or English only ("en"). */
export function BiText({ b, className, block }: { b: Bi; className?: string; block?: boolean }) {
  const lang = useLang();
  if (lang === 'en') return <span className={className}>{b.en}</span>;
  const Tag = block ? 'div' : 'span';
  if (lang === 'vi')
    return (
      <Tag className={className}>
        <span lang="vi">{b.vi}</span>
        <span className="mt-0.5 block text-[0.85em] opacity-60">{b.en}</span>
      </Tag>
    );
  return (
    <Tag className={className}>
      {b.en}
      <span lang="vi" className="mt-0.5 block text-[0.92em] text-rose-800 dark:text-rose-300">
        🇻🇳 {b.vi}
      </span>
    </Tag>
  );
}

const sylls = (display: string) => display.split('-');
const isStressed = (s: string) => s === s.toUpperCase() && /[A-Z]/.test(s);
const wordOf = (display: string) => display.replace(/-/g, '').toLowerCase();

/** A word as syllables, the stressed one big with a dot above (like a dictionary). Tap to hear; 🥁 claps the beat. */
export function StressView({ display, size = 'md', onPick, picked, reveal }: { display: string; size?: 'md' | 'lg'; onPick?: (i: number) => void; picked?: number | null; reveal?: boolean }) {
  const parts = sylls(display);
  const [beat, setBeat] = useState<number | null>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const showStress = !onPick || reveal;
  const drum = () => {
    speak(wordOf(display), 0.7);
    timers.current.forEach(clearTimeout);
    let t = 0;
    parts.forEach((p, i) => {
      timers.current.push(window.setTimeout(() => setBeat(i), t));
      t += isStressed(p) ? 520 : 300;
    });
    timers.current.push(window.setTimeout(() => setBeat(null), t));
  };
  return (
    <span className="inline-flex items-end gap-1">
      {parts.map((p, i) => {
        const stressed = isStressed(p);
        const base = size === 'lg' ? 'px-3 py-2 text-2xl' : 'px-1.5 py-0.5 text-base';
        const content = (
          <>
            <span className={cx('block text-center text-[10px] leading-none', showStress && stressed ? 'text-amber-500' : 'text-transparent')}>●</span>
            {p.toLowerCase()}
          </>
        );
        const cls = cx(
          'rounded-lg font-semibold transition-transform',
          base,
          showStress && stressed ? 'bg-amber-300 font-extrabold text-amber-950 ring-2 ring-amber-500' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100',
          beat === i && (stressed ? 'scale-125' : 'scale-90'),
          onPick && !reveal && 'cursor-pointer hover:ring-2 hover:ring-brand-400',
          reveal && picked === i && !stressed && 'bg-rose-200 text-rose-900 ring-2 ring-rose-400 dark:bg-rose-900 dark:text-rose-100',
        );
        return onPick ? (
          <button key={i} type="button" className={cls} disabled={reveal} onClick={() => onPick(i)} aria-label={`Syllable ${i + 1}: ${p.toLowerCase()}`}>
            {content}
          </button>
        ) : (
          <span key={i} className={cls}>
            {content}
          </span>
        );
      })}
      <button type="button" onClick={drum} className="ml-1 rounded-lg px-1.5 py-1 text-lg hover:bg-slate-200 dark:hover:bg-slate-700" title="Hear it and clap the beat" aria-label={`Hear ${wordOf(display)}`}>
        🥁
      </button>
    </span>
  );
}

function ChipView({ c }: { c: CoachChip }) {
  const tone = 'odd' in c && c.odd ? 'ring-2 ring-emerald-400 bg-emerald-50 dark:bg-emerald-950/50' : 'bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-700';
  return (
    <div className={cx('flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl px-3 py-2', tone)}>
      {c.kind === 'stress' ? (
        <StressView display={c.display} />
      ) : (
        <button type="button" onClick={() => speak(c.speak, 0.8)} className="rounded-lg px-2 py-1 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800">
          🔊 <Marked text={c.text} />
          {c.sound && <span className="ml-2 font-mono text-sm text-brand-700 dark:text-brand-300">{c.sound}</span>}
        </button>
      )}
      {c.note && <BiText b={c.note} className="min-w-0 flex-1 text-sm text-slate-600 dark:text-slate-300" block />}
    </div>
  );
}

/** Step-by-step explanation of one question, then practice on the same rule. */
export function CoachWalkthrough({ question, picked }: { question: Question; picked?: string }) {
  const plan = useMemo(() => coach(question), [question]);
  const [shown, setShown] = useState(1);
  const [practice, setPractice] = useState(false);
  const not = picked ? whyNot(question, picked) : null;
  const all = shown >= plan.steps.length;
  return (
    <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-sky-50 p-4 text-slate-800 ring-1 ring-indigo-200 dark:from-indigo-950/60 dark:to-slate-900 dark:text-slate-100 dark:ring-indigo-800">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-3xl" aria-hidden>
          🦉
        </span>
        <div>
          <div className="font-display font-bold">
            <T en="Coach Owl" />
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <T en="Let's solve it together, step by step." />
          </div>
        </div>
      </div>
      <ol className="space-y-3">
        {plan.steps.slice(0, shown).map((s, i) => (
          <li key={i} className="space-y-2">
            <BiText b={s.title} className="font-bold" block />
            {s.body && <BiText b={s.body} className="text-sm" block />}
            {s.chips && (
              <div className="space-y-1.5">
                {s.chips.map((c, j) => (
                  <ChipView key={j} c={c} />
                ))}
              </div>
            )}
          </li>
        ))}
      </ol>
      {all && not && (
        <div className="mt-3 rounded-xl bg-rose-50 p-3 text-sm ring-1 ring-rose-200 dark:bg-rose-950/40 dark:ring-rose-800">
          <b>
            <T en="Why not your answer?" />
          </b>{' '}
          <BiText b={not} />
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {!all ? (
          <>
            <Button onClick={() => setShown(shown + 1)}>
              <TB en="Next step →" />
            </Button>
            <Button variant="ghost" onClick={() => setShown(plan.steps.length)}>
              <TB en="Show all" />
            </Button>
          </>
        ) : (
          !practice && (
            <Button variant="game" onClick={() => setPractice(true)}>
              <TB en="💪 Try some like this" />
            </Button>
          )
        )}
      </div>
      {practice && (
        <div className="mt-4">
          {plan.drill.length ? <Drill items={plan.drill} /> : <SimilarQuestions conceptId={question.conceptId} difficulty={question.difficulty} exclude={question.id} />}
        </div>
      )}
    </div>
  );
}

/** Stars for a practice round: right answers count, each hint used costs half a point. */
export function starsFor(correct: number, total: number, hints: number) {
  const f = total ? (correct - hints * 0.5) / total : 0;
  return f >= 0.95 ? 3 : f >= 0.7 ? 2 : f >= 0.4 ? 1 : 0;
}

export function StarsResult({ correct, total, hints, onAgain }: { correct: number; total: number; hints: number; onAgain: () => void }) {
  const stars = starsFor(correct, total, hints);
  return (
    <div className="rounded-xl bg-white p-4 text-center ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
      <div className="text-4xl tracking-widest" aria-label={`${stars} of 3 stars`}>
        {[0, 1, 2].map((k) => (
          <span key={k} className={k < stars ? '' : 'opacity-20 grayscale'}>
            ⭐
          </span>
        ))}
      </div>
      <p className="mt-1 font-bold">
        {correct}/{total} {stars === 3 ? <T en="Perfect!" /> : stars === 2 ? <T en="Good — keep going!" /> : <T en="Let's practise a bit more." />}
      </p>
      <p className="text-sm text-slate-500">
        {hints === 0 ? <T en="No hints used — full marks for remembering!" /> : <T en="Hints used: {n}. Try the next round without hints for more stars." vars={{ n: hints }} />}
      </p>
      <Button variant="secondary" className="mt-3" onClick={onAgain}>
        <TB en="🔁 Again" />
      </Button>
    </div>
  );
}

/** A short practice round on one rule. Re-rolls with `regenerate`. */
export function Drill({ items, regenerate, title }: { items: DrillItem[]; regenerate?: () => DrillItem[]; title?: Bi }) {
  const [list, setList] = useState(items);
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState<string | number | null>(null);
  const [score, setScore] = useState(0);
  const [hints, setHints] = useState(0);
  const [hintOpen, setHintOpen] = useState(false);
  useEffect(() => {
    setList(items);
    setI(0);
    setAnswer(null);
    setScore(0);
    setHints(0);
  }, [items]);
  const item = list[i];
  useEffect(() => {
    if (item?.kind === 'choice' && item.audio) {
      const t = setTimeout(() => speak(item.audio!, 0.85), 250);
      return () => clearTimeout(t);
    }
  }, [item]);

  if (!item)
    return (
      <StarsResult
        correct={score}
        total={list.length}
        hints={hints}
        onAgain={() => {
          setList(regenerate ? regenerate() : [...list].sort(() => Math.random() - 0.5));
          setI(0);
          setAnswer(null);
          setScore(0);
          setHints(0);
        }}
      />
    );

  const isRight = item.kind === 'stress' ? answer !== null && isStressed(sylls(item.display)[answer as number]) : answer === item.answer;
  const pick = (a: string | number) => {
    if (answer !== null) return;
    setAnswer(a);
    const ok = item.kind === 'stress' ? isStressed(sylls(item.display)[a as number]) : a === item.answer;
    if (ok) setScore((s) => s + 1);
    if (item.kind === 'stress') speak(wordOf(item.display), 0.75);
  };

  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
      <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>{title ? <BiText b={title} /> : <T en="Practice" />}</span>
        <span>
          {i + 1}/{list.length} · ✓ {score}
          {hints > 0 && ` · 🦉 ${hints}`}
        </span>
      </div>
      {item.hint && answer === null && (
        <div className="mb-3">
          {hintOpen ? (
            <div className="flex items-start gap-2 rounded-lg bg-indigo-50 p-2 text-sm dark:bg-indigo-950/50">
              <span>🦉</span>
              <BiText b={item.hint} block />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setHintOpen(true);
                setHints((h) => h + 1);
              }}
              className="text-sm font-semibold text-indigo-700 hover:underline dark:text-indigo-300"
            >
              🦉 <T en="Hint" /> <span className="text-xs font-normal opacity-70">(−½ ⭐)</span>
            </button>
          )}
        </div>
      )}
      {item.kind === 'stress' ? (
        <>
          <p className="mb-3 text-sm">
            <T en="Tap the stressed syllable." />
          </p>
          <StressView display={item.display} size="lg" onPick={pick} picked={answer as number | null} reveal={answer !== null} />
        </>
      ) : (
        <>
          <BiText b={item.prompt} className="mb-3 text-sm" block />
          {item.word && (
            <button type="button" onClick={() => speak(item.word!.replace(/[[\]]/g, ''), 0.8)} className="mb-3 rounded-lg bg-slate-100 px-3 py-2 text-2xl font-semibold dark:bg-slate-800">
              <Marked text={item.word} /> 🔊
            </button>
          )}
          {item.audio && (
            <Button variant="secondary" className="mb-3" onClick={() => speak(item.audio!, 0.85)}>
              <TB en="🔊 Play again" />
            </Button>
          )}
          <div className="flex flex-wrap gap-2">
            {item.options.map((o) => (
              <button
                key={o}
                type="button"
                disabled={answer !== null}
                onClick={() => pick(o)}
                className={cx(
                  'min-w-16 rounded-xl px-4 py-2 font-mono text-lg font-bold ring-1',
                  answer === null && 'ring-slate-300 hover:bg-brand-50 dark:ring-slate-600 dark:hover:bg-slate-800',
                  answer !== null && o === item.answer && 'bg-emerald-100 text-emerald-900 ring-emerald-400 dark:bg-emerald-900 dark:text-emerald-100',
                  answer === o && o !== item.answer && 'bg-rose-100 text-rose-900 ring-rose-400 dark:bg-rose-900 dark:text-rose-100',
                )}
              >
                {o}
              </button>
            ))}
          </div>
        </>
      )}
      {answer !== null && (
        <div className={cx('mt-3 rounded-lg p-3 text-sm', isRight ? 'bg-emerald-50 dark:bg-emerald-950/50' : 'bg-rose-50 dark:bg-rose-950/40')}>
          <b>{isRight ? '✓ ' : '✗ '}</b>
          <BiText b={item.why} />
          <div className="mt-2">
            <Button
              autoFocus
              onClick={() => {
                setI(i + 1);
                setAnswer(null);
                setHintOpen(false);
              }}
            >
              <TB en="Next →" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/** For topics without a drill: three fresh questions of the same kind, calm practice mode. */
export function SimilarQuestions({ conceptId, difficulty, exclude, count = 3 }: { conceptId: string; difficulty: number; exclude?: string; count?: number }) {
  const [round, setRound] = useState(0);
  const questions = useMemo(() => {
    const seen = new Set<string>(exclude ? [exclude] : []);
    const out: Question[] = [];
    for (let k = 0; k < count; k++) {
      const q = pickQuestion({ conceptId, difficulty: Math.max(1, Math.min(5, difficulty + (k === 2 ? 1 : 0))), exclude: seen });
      if (!q) break;
      seen.add(q.id);
      out.push(q);
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conceptId, difficulty, exclude, count, round]);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [hints, setHints] = useState(0);
  const presented = useMemo(() => (questions[i] ? present(questions[i]) : null), [questions, i]);
  if (!presented)
    return (
      <StarsResult
        correct={score}
        total={questions.length}
        hints={hints}
        onAgain={() => {
          setRound(round + 1);
          setI(0);
          setScore(0);
          setHints(0);
        }}
      />
    );
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-slate-500">
        <T en="Practice" /> {i + 1}/{questions.length}
      </p>
      <QuestionCard
        key={`${round}-${i}`}
        question={presented}
        mode="practice"
        compact
        onHint={() => setHints((h) => h + 1)}
        onAnswer={(correct) => {
          if (correct) setScore((s) => s + 1);
          setI(i + 1);
        }}
      />
    </div>
  );
}

/** Before answering (practice mode): a nudge that doesn't give the answer away. */
export function CoachHint({ question, onOpen }: { question: Question; onOpen?: () => void }) {
  const [open, setOpen] = useState(false);
  const hint = useMemo(() => coach(question).hint, [question]);
  return open ? (
    <div className="flex items-start gap-2 rounded-xl bg-indigo-50 p-3 text-sm ring-1 ring-indigo-200 dark:bg-indigo-950/50 dark:ring-indigo-800">
      <span className="text-xl">🦉</span>
      <BiText b={hint} block />
    </div>
  ) : (
    <button type="button" onClick={() => {
      setOpen(true);
      onOpen?.();
    }} className="text-sm font-semibold text-indigo-700 hover:underline dark:text-indigo-300">
      🦉 <T en="Hint" />
    </button>
  );
}
