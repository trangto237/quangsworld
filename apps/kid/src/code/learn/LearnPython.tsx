import { createContext, useContext, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { hashString, rng } from '@atlas/shared';
import { cx } from '@atlas/ui';
import { T, TB, tr, useLang, type LangMode } from '../../i18n';
import { Meter, Panel, TownButton } from '../../town/ui';
import { Sandbox, type SandboxHandle } from '../Sandbox';
import { COURSE } from './course';
import type { Bi, PyLesson, PyUnit, Step } from './types';

/**
 * 🐍 Learn Python, like the LearnPython apps: a path of units and lessons that unlock one after another.
 * A lesson is a few short steps: read an idea, then practise it straight away (pick an answer, fill the
 * blanks, put lines in order, type the output, write a program that really runs). A missed question
 * comes back at the end of the lesson. Finishing a lesson earns coins.
 */

export const lessonDoneId = (lessonId: string) => `lp:${lessonId}`;

/** Prose courses (literature): passages and answers are text, not code. */
const Prose = createContext(false);
const useProse = () => useContext(Prose);

const say = (ui: LangMode, b: Bi) => (ui === 'vi' ? b.vi : b.en);
/** The text in his language; in "help" mode English with the Vietnamese underneath. */
function Say({ b, className }: { b: Bi; className?: string }) {
  const ui = useLang();
  return (
    <div className={className}>
      <p className="whitespace-pre-line">{say(ui, b)}</p>
      {ui === 'help' && b.vi !== b.en && (
        <p lang="vi" className="mt-1 whitespace-pre-line text-[0.9em] text-[#9b3b2c]">
          🇻🇳 {b.vi}
        </p>
      )}
    </div>
  );
}

const shuffle = <X,>(xs: X[], seed: string) => {
  const r = rng(hashString(seed));
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
/** Printed output compared fairly: no spaces at line ends, no blank lines at the end. */
const norm = (s: string) =>
  s
    .replace(/\r/g, '')
    .split('\n')
    .map((l) => l.replace(/\s+$/, ''))
    .join('\n')
    .replace(/\n+$/, '');

// ── Python, coloured ────────────────────────────────────────────
const KEYWORDS = new Set('def return if elif else for while in not and or True False None break continue import from as pass class lambda global try except finally with is del'.split(' '));
const BUILTINS = new Set('print input len range int float str bool list dict type sum max min sorted round abs enumerate zip append'.split(' '));
function PyLine({ line }: { line: string }) {
  const prose = useProse();
  if (prose) return <>{line || '\u00a0'}</>;
  const parts: ReactNode[] = [];
  const re = /(#.*$)|(f?"[^"]*"?|f?'[^']*'?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)|(___)|(\s+|.)/g;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(line))) {
    const [t, com, str, numb, word] = m;
    const cls = com
      ? 'text-[#7d8b6a] italic'
      : str
        ? 'text-[#c2410c]'
        : numb
          ? 'text-[#7c3aed]'
          : word && KEYWORDS.has(word)
            ? 'text-[#be185d] font-bold'
            : word && BUILTINS.has(word)
              ? 'text-[#0369a1]'
              : '';
    parts.push(
      cls ? (
        <span key={k++} className={cls}>
          {t}
        </span>
      ) : (
        t
      ),
    );
  }
  return <>{parts.length ? parts : ' '}</>;
}
export function PyCode({ code, className }: { code: string; className?: string }) {
  const prose = useProse();
  return (
    <pre
      className={cx(
        'overflow-x-auto rounded-xl border-2 border-ink/20 bg-[#fffaf0] p-3 text-ink-text',
        prose ? 'whitespace-pre-wrap font-sans text-[16px] leading-relaxed' : 'font-mono text-[15px] leading-relaxed',
        className,
      )}
    >
      {code.split('\n').map((l, i) => (
        <div key={i}>
          <PyLine line={l} />
        </div>
      ))}
    </pre>
  );
}
function Output({ text, label = 'Output' }: { text: string; label?: string }) {
  return (
    <div className="rounded-xl bg-[#0f172a] p-3 font-mono text-[14px] text-[#e2e8f0]">
      <div className="mb-1 font-sans text-[11px] font-bold uppercase tracking-wide text-[#94a3b8]">
        ▶ <T en={label} />
      </div>
      <pre className="whitespace-pre-wrap">{text || ' '}</pre>
    </div>
  );
}

// ── The course path ───────────────────────────────────────────
export function LearnPython({ done, onPassed, onSkip }: { done: string[]; onPassed: (id: string) => void; onSkip?: (ids: string[]) => void }) {
  return (
    <CourseView
      units={COURSE}
      done={done}
      onPassed={onPassed}
      onSkip={onSkip}
      doneId={lessonDoneId}
      icon="🐍"
      title="Learn Python"
      intro="Short lessons: read an idea, then practise it right away. {n}/{m} lessons done."
    />
  );
}

/**
 * A course of short lessons on a path (Learn Python, Lớp học Ngữ văn). `prose` shows passages and answers
 * as text instead of code.
 */
export function CourseView({
  units: COURSE,
  done,
  onPassed,
  doneId: lessonDoneId,
  icon,
  title,
  intro,
  prose = false,
  onSkip,
}: {
  units: PyUnit[];
  done: string[];
  onPassed: (id: string) => void;
  /** A jump test was passed: mark these lessons done (without the lesson rewards). */
  onSkip?: (ids: string[]) => void;
  doneId: (lessonId: string) => string;
  icon: string;
  title: string;
  intro: string;
  prose?: boolean;
}) {
  const ALL_LESSONS = useMemo(() => COURSE.flatMap((u) => u.lessons), [COURSE]);
  const isDone = (l: PyLesson) => done.includes(lessonDoneId(l.id));
  const nextIdx = ALL_LESSONS.findIndex((l) => !isDone(l));
  const [playing, setPlaying] = useState<{ unit: PyUnit; lesson: PyLesson } | null>(null);
  /** A "jump here" test for a unit: pass it to skip everything before. */
  const [jumping, setJumping] = useState<number | null>(null);
  const finished = ALL_LESSONS.filter(isDone).length;
  const open = (l: PyLesson) => ALL_LESSONS.indexOf(l) <= Math.max(0, nextIdx < 0 ? ALL_LESSONS.length : nextIdx);
  const currentRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!playing) currentRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [playing]);

  if (jumping !== null)
    return (
      <Prose.Provider value={prose}>
        <JumpTest
          unit={COURSE[jumping]}
          steps={jumpSteps(COURSE.slice(0, jumping))}
          onExit={() => setJumping(null)}
          onPass={() => {
            const ids = COURSE.slice(0, jumping)
              .flatMap((u) => u.lessons)
              .map((l) => lessonDoneId(l.id))
              .filter((id) => !done.includes(id));
            if (onSkip) onSkip(ids);
            else ids.forEach(onPassed);
          }}
        />
      </Prose.Provider>
    );

  if (playing)
    return (
      <Prose.Provider value={prose}>
        <LessonPlayer
          hasNext={ALL_LESSONS.indexOf(playing.lesson) < ALL_LESSONS.length - 1}
          key={playing.lesson.id}
          unit={playing.unit}
          lesson={playing.lesson}
          onExit={() => setPlaying(null)}
          onFinish={() => onPassed(lessonDoneId(playing.lesson.id))}
          onNext={() => {
            const k = ALL_LESSONS.indexOf(playing.lesson) + 1;
            const l = ALL_LESSONS[k];
            setPlaying(l ? { unit: COURSE.find((u) => u.lessons.includes(l))!, lesson: l } : null);
          }}
        />
      </Prose.Provider>
    );

  const next = nextIdx >= 0 ? ALL_LESSONS[nextIdx] : null;
  return (
    <div className="space-y-4">
      <Panel className="flex flex-wrap items-center gap-3">
        <span className="grid size-12 place-items-center rounded-2xl border-[2.5px] border-ink bg-[#d9f99d] text-3xl">{icon}</span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl font-bold leading-tight">
            <T en={title} />
          </h2>
          <p className="text-sm text-ink-soft">
            <T en={intro} vars={{ n: finished, m: ALL_LESSONS.length }} />
          </p>
          <Meter value={finished} max={ALL_LESSONS.length} color="#5cb85c" className="mt-1 h-2" />
        </div>
        {next && (
          <TownButton tone="green" size="lg" onClick={() => setPlaying({ unit: COURSE.find((u) => u.lessons.includes(next))!, lesson: next })}>
            ▶ <TB en={finished ? 'Continue' : 'Start'} />
          </TownButton>
        )}
      </Panel>

      {COURSE.map((u, ui) => {
        const got = u.lessons.filter(isDone).length;
        return (
          <section key={u.id}>
            <div className={cx('town-panel flex items-center gap-3 px-4 py-3', got === u.lessons.length ? 'bg-[#e6f6d5]' : '')}>
              <span className="text-3xl">{u.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold uppercase tracking-wide text-ink-soft">
                  <T en="Unit {n}" vars={{ n: ui + 1 }} />
                </div>
                <div className="font-display text-lg font-bold leading-tight">
                  <BiText b={u.title} />
                </div>
                <div className="text-xs text-ink-soft">
                  <BiText b={u.blurb} />
                </div>
              </div>
              <span className="font-display text-sm font-bold text-ink-soft">
                {got}/{u.lessons.length}
              </span>
            </div>
            {/* Already know this? A short test on everything before it unlocks the unit. */}
            {ui > 0 && !open(u.lessons[0]) && (
              <div className="mt-2 flex justify-center">
                <TownButton tone="blue" onClick={() => setJumping(ui)}>
                  ⏩ <TB en="Jump here" />
                </TownButton>
              </div>
            )}
            {/* Lessons as stepping stones along a winding path */}
            <div className="relative mx-auto flex max-w-sm flex-col items-center gap-3 py-4">
              {u.lessons.map((l, k) => {
                const d = isDone(l);
                const can = open(l);
                const current = next?.id === l.id;
                const shift = [0, 46, 0, -46][k % 4];
                return (
                  <div key={l.id} className="flex flex-col items-center" style={{ transform: `translateX(${shift}px)` }}>
                    <button
                      ref={current ? currentRef : undefined}
                      disabled={!can}
                      onClick={() => setPlaying({ unit: u, lesson: l })}
                      className={cx(
                        'town-btn grid size-16 place-items-center rounded-full text-2xl font-bold',
                        d ? 'bg-[#5cb85c] text-white' : current ? 'animate-pulse bg-[#ffc23d] ring-4 ring-[#ffc23d]/40' : can ? 'bg-paper' : 'bg-paper-3 opacity-60',
                      )}
                      aria-label={say('en', l.title)}
                    >
                      {d ? '✓' : can ? (current ? '▶' : '★') : '🔒'}
                    </button>
                    <span className={cx('mt-1 max-w-40 text-center font-display text-xs font-bold leading-tight', !can && 'opacity-50')}>
                      <BiText b={l.title} />
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function BiText({ b }: { b: Bi }) {
  const ui = useLang();
  return <>{ui === 'vi' ? b.vi : b.en}</>;
}

// ── One lesson ──────────────────────────────────────────────────
function LessonPlayer({ unit, lesson, hasNext, onExit, onFinish, onNext }: { unit: PyUnit; lesson: PyLesson; hasNext: boolean; onExit: () => void; onFinish: () => void; onNext: () => void }) {
  const total = lesson.steps.length;
  /** Steps still to do, in order; a missed question goes back to the end once. */
  const [queue, setQueue] = useState(() => lesson.steps.map((_, i) => i));
  const [cleared, setCleared] = useState(0);
  const [missed, setMissed] = useState<number[]>([]);
  const [turn, setTurn] = useState(0);
  const [over, setOver] = useState(false);
  const top = useRef<HTMLDivElement>(null);
  // Open the lesson at its top (the path may have been scrolled far down).
  useEffect(() => {
    top.current?.scrollIntoView({ block: 'start' });
  }, []);

  const advance = (ok: boolean) => {
    const [cur, ...rest] = queue;
    let nextQ = rest;
    if (ok) setCleared((c) => c + 1);
    else if (!missed.includes(cur)) {
      setMissed((m) => [...m, cur]);
      nextQ = [...rest, cur];
    } else setCleared((c) => c + 1); // missed twice: shown the answer, move on
    setQueue(nextQ);
    setTurn((t) => t + 1);
    top.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    if (!nextQ.length) {
      setOver(true);
      onFinish();
    }
  };

  if (over) {
    const right = total - missed.length;
    return (
      <Panel className="mx-auto max-w-lg space-y-3 text-center">
        <div className="town-bob text-6xl">🎉</div>
        <h2 className="font-display text-2xl font-bold">
          <T en="Lesson complete!" />
        </h2>
        <p className="font-display text-lg font-bold">
          <BiText b={lesson.title} />
        </p>
        <p className="text-ink-soft">
          <T en="{n} of {m} right first time · +20 🪙" vars={{ n: right, m: total }} />
        </p>
        <div className="flex justify-center gap-2">
          <TownButton tone="paper" onClick={onExit}>
            <TB en="Back to the path" />
          </TownButton>
          {hasNext && (
            <TownButton tone="green" onClick={onNext}>
              <TB en="Next lesson" /> →
            </TownButton>
          )}
        </div>
      </Panel>
    );
  }

  const idx = queue[0];
  const step = lesson.steps[idx];
  return (
    <div ref={top} className="mx-auto max-w-2xl scroll-mt-24 space-y-3">
      <div className="flex items-center gap-3">
        <button onClick={onExit} className="town-btn grid size-10 shrink-0 place-items-center rounded-full bg-paper font-bold" aria-label="Leave the lesson">
          ✕
        </button>
        <Meter value={cleared} max={total} color="#5cb85c" className="h-3 flex-1" />
        <span className="shrink-0 text-2xl" title={say('en', unit.title)}>
          {unit.emoji}
        </span>
      </div>
      <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">
        <BiText b={lesson.title} />
        {missed.includes(idx) && (
          <span className="ml-2 rounded-full bg-tint-amber px-2 py-0.5 normal-case">
            🔁 <T en="Try this one again" />
          </span>
        )}
      </p>
      <Panel>
        <StepView key={`${idx}:${turn}`} step={step} seed={`${lesson.id}:${idx}:${turn}`} onDone={advance} />
      </Panel>
    </div>
  );
}

// ── Steps ───────────────────────────────────────────────────────
type Verdict = { ok: boolean; right?: ReactNode; why?: Bi } | null;

function StepView({ step, seed, onDone }: { step: Step; seed: string; onDone: (ok: boolean) => void }) {
  switch (step.kind) {
    case 'read':
      return <ReadStep step={step} onDone={() => onDone(true)} />;
    case 'choice':
      return <ChoiceStep step={step} seed={seed} onDone={onDone} />;
    case 'fill':
      return <FillStep step={step} seed={seed} onDone={onDone} />;
    case 'order':
      return <OrderStep step={step} seed={seed} onDone={onDone} />;
    case 'output':
      return <OutputStep step={step} onDone={onDone} />;
    case 'write':
      return <WriteStep step={step} onDone={onDone} />;
    case 'compose':
      return <ComposeStep step={step} onDone={() => onDone(true)} />;
  }
}

/** The bottom of every question: Check, then right/wrong with the reason, then Continue. */
function CheckBar({ ready, verdict, onCheck, onContinue, children }: { ready: boolean; verdict: Verdict; onCheck: () => void; onContinue: () => void; children?: ReactNode }) {
  useEffect(() => {
    const on = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Enter' || (e.target instanceof HTMLTextAreaElement && !e.ctrlKey && !e.metaKey)) return;
      e.preventDefault();
      if (verdict) onContinue();
      else if (ready) onCheck();
    };
    addEventListener('keydown', on);
    return () => removeEventListener('keydown', on);
  });
  return (
    <div className="mt-4 space-y-2">
      {verdict && (
        <div className={cx('animate-pop rounded-xl p-3', verdict.ok ? 'bg-[#e6f6d5]' : 'bg-[#fde3dc]')}>
          <div className="font-display text-lg font-bold">{verdict.ok ? <T en="✓ Correct!" /> : <T en="✗ Not quite" />}</div>
          {!verdict.ok && verdict.right && (
            <div className="mt-1 text-sm">
              <span className="font-bold">
                <T en="Answer" />:
              </span>{' '}
              {verdict.right}
            </div>
          )}
          {verdict.why && <Say b={verdict.why} className="mt-1 text-sm" />}
        </div>
      )}
      {children}
      {verdict ? (
        <TownButton tone={verdict.ok ? 'green' : 'amber'} size="lg" className="w-full" onClick={onContinue}>
          <TB en="Continue" />
        </TownButton>
      ) : (
        <TownButton tone="green" size="lg" className="w-full" disabled={!ready} onClick={onCheck}>
          <TB en="Check" />
        </TownButton>
      )}
    </div>
  );
}

function ReadStep({ step, onDone }: { step: Extract<Step, { kind: 'read' }>; onDone: () => void }) {
  useEffect(() => {
    const on = (e: globalThis.KeyboardEvent) => e.key === 'Enter' && onDone();
    addEventListener('keydown', on);
    return () => removeEventListener('keydown', on);
  });
  return (
    <div className="space-y-3">
      <div className="text-xs font-bold uppercase tracking-wide text-[#2563eb]">
        💡 <T en="New idea" />
      </div>
      {step.title && (
        <h3 className="font-display text-xl font-bold">
          <BiText b={step.title} />
        </h3>
      )}
      <Say b={step.text} className="text-[15px] leading-relaxed" />
      {step.code && <PyCode code={step.code} />}
      {step.output !== undefined && <Output text={step.output} />}
      <TownButton tone="green" size="lg" className="w-full" onClick={onDone}>
        <TB en="Got it" />
      </TownButton>
    </div>
  );
}

function ChoiceStep({ step, seed, onDone }: { step: Extract<Step, { kind: 'choice' }>; seed: string; onDone: (ok: boolean) => void }) {
  const ui = useLang();
  const prose = useProse();
  const order = useMemo(
    () =>
      shuffle(
        step.options.map((_, i) => i),
        seed,
      ),
    [step, seed],
  );
  const [pick, setPick] = useState<number | null>(null);
  const [verdict, setVerdict] = useState<Verdict>(null);
  const label = (o: string | Bi) => (typeof o === 'string' ? o : say(ui, o));
  return (
    <div className="space-y-3">
      <Say b={step.ask} className="font-display text-lg font-bold" />
      {step.code && <PyCode code={step.code} />}
      <div className="grid gap-2">
        {order.map((i) => {
          const o = step.options[i];
          return (
            <button
              key={i}
              onClick={() => !verdict && setPick(i)}
              className={cx(
                'town-btn rounded-xl px-3 py-2.5 text-left',
                step.codeOptions ? 'whitespace-pre font-mono text-[15px]' : 'font-semibold',
                verdict && i === step.answer ? 'bg-[#8fd36a]' : verdict && i === pick ? 'bg-[#f08a73]' : pick === i ? 'bg-tint-amber ring-2 ring-[#ffc23d]' : 'bg-white hover:bg-paper-3',
              )}
            >
              {label(o)}
            </button>
          );
        })}
      </div>
      <CheckBar
        ready={pick !== null}
        verdict={verdict}
        onCheck={() =>
          setVerdict({ ok: pick === step.answer, why: step.why, right: prose ? <b>{label(step.options[step.answer])}</b> : <code className="font-mono">{label(step.options[step.answer])}</code> })
        }
        onContinue={() => onDone(!!verdict?.ok)}
      />
    </div>
  );
}

function FillStep({ step, seed, onDone }: { step: Extract<Step, { kind: 'fill' }>; seed: string; onDone: (ok: boolean) => void }) {
  const prose = useProse();
  const bank = useMemo(
    () =>
      shuffle(
        [...step.answers, ...step.extra].map((w, i) => ({ w, i })),
        seed,
      ),
    [step, seed],
  );
  /** Bank tile index in each blank. */
  const [slots, setSlots] = useState<(number | null)[]>(() => step.answers.map(() => null));
  const [verdict, setVerdict] = useState<Verdict>(null);
  const used = new Set(slots.filter((x): x is number => x !== null));
  const put = (k: number) => {
    if (verdict) return;
    const at = slots.indexOf(null);
    if (at >= 0) setSlots(slots.map((s, i) => (i === at ? k : s)));
  };
  const words = slots.map((s) => (s === null ? null : bank.find((b) => b.i === s)!.w));
  let blank = 0;
  return (
    <div className="space-y-3">
      <Say b={step.ask} className="font-display text-lg font-bold" />
      <pre className={cx('overflow-x-auto rounded-xl border-2 border-ink/20 bg-[#fffaf0] p-3 leading-loose', prose ? 'whitespace-pre-wrap font-sans text-[16px]' : 'font-mono text-[15px]')}>
        {step.code.split('\n').map((line, li) => (
          <div key={li}>
            {line.split('___').map((part, pi, arr) => {
              const b = pi < arr.length - 1 ? blank++ : -1;
              return (
                <span key={pi}>
                  <PyLine line={part} />
                  {b >= 0 && (
                    <button
                      onClick={() => !verdict && setSlots(slots.map((s, i) => (i === b ? null : s)))}
                      className={cx(
                        'mx-0.5 inline-block min-w-12 rounded-md border-b-[3px] px-1.5 align-baseline font-bold',
                        words[b] === null ? 'border-[#ffc23d] bg-tint-amber text-transparent' : 'border-ink bg-white',
                        verdict && (words[b] === step.answers[b] ? 'bg-[#e6f6d5]' : 'bg-[#fde3dc]'),
                      )}
                    >
                      {words[b] ?? '___'}
                    </button>
                  )}
                </span>
              );
            })}
          </div>
        ))}
      </pre>
      <div className="flex flex-wrap gap-2">
        {bank.map((b) => (
          <button
            key={b.i}
            disabled={used.has(b.i) || !!verdict}
            onClick={() => put(b.i)}
            className={cx('town-btn rounded-lg px-3 py-1.5 font-bold', !prose && 'font-mono', used.has(b.i) ? 'bg-paper-3 opacity-30' : 'bg-white hover:bg-paper-3')}
          >
            {b.w}
          </button>
        ))}
      </div>
      <CheckBar
        ready={slots.every((s) => s !== null)}
        verdict={verdict}
        onCheck={() => {
          const ok = words.every((w, i) => w === step.answers[i]);
          let n = 0;
          const right = step.code.replace(/___/g, () => step.answers[n++]);
          setVerdict({ ok, why: step.why, right: <PyCode code={right} className="mt-1" /> });
        }}
        onContinue={() => onDone(!!verdict?.ok)}
      >
        {verdict?.ok && step.output !== undefined && <Output text={step.output} />}
      </CheckBar>
    </div>
  );
}

function OrderStep({ step, seed, onDone }: { step: Extract<Step, { kind: 'order' }>; seed: string; onDone: (ok: boolean) => void }) {
  const prose = useProse();
  const lineCls = prose ? 'font-sans text-[15px] font-semibold whitespace-normal' : 'font-mono text-[15px] whitespace-pre';
  // Shuffled, but never already in the right order.
  const tiles = useMemo(() => {
    let s = shuffle(
      step.lines.map((l, i) => ({ l, i })),
      seed,
    );
    for (let k = 1; k < 6 && s.every((t, i) => step.lines[i] === t.l); k++) s = shuffle(s, `${seed}:${k}`);
    return s;
  }, [step, seed]);
  const [built, setBuilt] = useState<number[]>([]);
  const [verdict, setVerdict] = useState<Verdict>(null);
  return (
    <div className="space-y-3">
      <Say b={step.ask} className="font-display text-lg font-bold" />
      <div className="min-h-16 space-y-1.5 rounded-xl border-2 border-dashed border-ink/30 bg-[#fffaf0] p-2">
        {built.length === 0 && <p className="p-2 text-sm text-ink-soft">{prose ? <T en="Tap the parts in the right order." /> : <T en="Tap the lines in the order the program should run." />}</p>}
        {built.map((i, k) => (
          <button
            key={i}
            onClick={() => !verdict && setBuilt(built.filter((x) => x !== i))}
            className={cx(
              'block w-full rounded-lg px-2 py-1.5 text-left',
              lineCls,
              verdict ? (step.lines[k] === tiles.find((t) => t.i === i)!.l ? 'bg-[#e6f6d5]' : 'bg-[#fde3dc]') : 'bg-white ring-1 ring-ink/15',
            )}
          >
            <PyLine line={tiles.find((t) => t.i === i)!.l} />
          </button>
        ))}
      </div>
      <div className="space-y-1.5">
        {tiles
          .filter((t) => !built.includes(t.i))
          .map((t) => (
            <button
              key={t.i}
              disabled={!!verdict}
              onClick={() => setBuilt([...built, t.i])}
              className={cx('town-btn block w-full rounded-lg bg-white px-2 py-1.5 text-left hover:bg-paper-3', lineCls)}
            >
              <PyLine line={t.l} />
            </button>
          ))}
      </div>
      <CheckBar
        ready={built.length === tiles.length}
        verdict={verdict}
        onCheck={() => {
          const mine = built.map((i) => tiles.find((t) => t.i === i)!.l);
          const ok = mine.every((l, k) => l === step.lines[k]);
          setVerdict({ ok, why: step.why, right: <PyCode code={step.lines.join('\n')} className="mt-1" /> });
        }}
        onContinue={() => onDone(!!verdict?.ok)}
      >
        {verdict?.ok && step.output !== undefined && <Output text={step.output} />}
      </CheckBar>
    </div>
  );
}

function OutputStep({ step, onDone }: { step: Extract<Step, { kind: 'output' }>; onDone: (ok: boolean) => void }) {
  const [typed, setTyped] = useState('');
  const [verdict, setVerdict] = useState<Verdict>(null);
  const lines = step.answer.split('\n').length;
  return (
    <div className="space-y-3">
      <Say b={step.ask} className="font-display text-lg font-bold" />
      <PyCode code={step.code} />
      <div className="rounded-xl bg-[#0f172a] p-3">
        <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[#94a3b8]">
          ▶ <T en="Output" />
        </div>
        <textarea
          value={typed}
          onChange={(e) => !verdict && setTyped(e.target.value)}
          rows={Math.max(1, lines)}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="…"
          className="w-full resize-none bg-transparent font-mono text-[15px] text-[#e2e8f0] outline-none placeholder:text-[#475569]"
          aria-label="What it prints"
        />
      </div>
      <CheckBar
        ready={typed.trim().length > 0}
        verdict={verdict}
        onCheck={() => setVerdict({ ok: norm(typed) === norm(step.answer), why: step.why, right: <Output text={step.answer} /> })}
        onContinue={() => onDone(!!verdict?.ok)}
      />
    </div>
  );
}

/** A small code editor: Tab indents, Enter keeps the indent (and adds one after a colon). */
function Editor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    const { selectionStart: a, selectionEnd: b } = el;
    const set = (text: string, caret: number) => {
      onChange(value.slice(0, a) + text + value.slice(b));
      requestAnimationFrame(() => el.setSelectionRange(caret, caret));
    };
    if (e.key === 'Tab') {
      e.preventDefault();
      set('    ', a + 4);
    } else if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      const line = value.slice(value.lastIndexOf('\n', a - 1) + 1, a);
      const indent = (line.match(/^\s*/)?.[0] ?? '') + (/:\s*$/.test(line) ? '    ' : '');
      set('\n' + indent, a + 1 + indent.length);
    }
  };
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKey}
      spellCheck={false}
      autoCapitalize="off"
      autoCorrect="off"
      rows={Math.max(5, value.split('\n').length + 1)}
      className="w-full rounded-xl border-[2.5px] border-ink bg-[#fffaf0] p-3 font-mono text-[15px] leading-relaxed text-ink-text outline-none focus:ring-2 focus:ring-[#ffc23d]"
      aria-label="Your Python program"
    />
  );
}

function WriteStep({ step, onDone }: { step: Extract<Step, { kind: 'write' }>; onDone: (ok: boolean) => void }) {
  const ui = useLang();
  const [code, setCode] = useState(step.starter);
  const [out, setOut] = useState<string[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState('');
  const [busy, setBusy] = useState(false);
  const [tries, setTries] = useState(0);
  const [hint, setHint] = useState(false);
  const [verdict, setVerdict] = useState<Verdict>(null);
  const box = useRef<SandboxHandle>(null);
  const live = useRef<{ logs: string[]; finish: (() => void) | null }>({ logs: [], finish: null });

  /** Runs his program and resolves with what it printed (or an error). */
  const run = () =>
    new Promise<{ logs: string[]; error: string | null }>((resolve) => {
      setBusy(true);
      setErr(null);
      setOut([]);
      live.current = { logs: [], finish: null };
      let error: string | null = null;
      let timer = 0;
      const finish = () => {
        clearTimeout(timer);
        live.current.finish = null;
        setBusy(false);
        resolve({ logs: live.current.logs, error });
      };
      live.current.finish = finish;
      handlers.current.onError = (t) => {
        error = t;
        setErr(t);
        finish();
      };
      // A program stuck in a loop is stopped after a few seconds (counted once Python has loaded).
      handlers.current.onLoaded = () => {
        clearTimeout(timer);
        timer = window.setTimeout(() => {
          box.current?.stop();
          error = tr(ui, 'It ran for too long. Is there a loop that never ends?');
          setErr(error);
          finish();
        }, 6000);
      };
      timer = window.setTimeout(() => handlers.current.onLoaded?.(), 60_000);
      box.current?.run('py', code, step.stdin);
    });
  const handlers = useRef<{ onError?: (t: string) => void; onLoaded?: () => void }>({});

  const check = async () => {
    const r = await run();
    const got = norm(r.logs.join('\n'));
    const ok = !r.error && got === norm(step.expect);
    setTries((t) => t + 1);
    if (ok) setVerdict({ ok: true });
    else if (tries + 1 >= 3) setVerdict({ ok: false, why: step.hint, right: <PyCode code={step.solution} className="mt-1" /> });
  };
  const wrongNow = out !== null && !busy && !verdict && tries > 0;

  return (
    <div className="space-y-3">
      <div className="text-xs font-bold uppercase tracking-wide text-[#16a34a]">
        ⌨️ <T en="Your turn: write the code" />
      </div>
      <Say b={step.task} className="font-display text-lg font-bold" />
      {step.stdin && (
        <p className="text-xs text-ink-soft">
          <T en="input() will read" />: <code className="font-mono">{step.stdin.join(' · ')}</code>
        </p>
      )}
      <Editor value={code} onChange={(v) => !verdict && setCode(v)} />
      <div className="flex flex-wrap gap-2">
        <TownButton tone="blue" disabled={busy} onClick={() => void run()}>
          ▶ <TB en="Run" />
        </TownButton>
        <TownButton tone="paper" onClick={() => setHint((h) => !h)}>
          💡 <TB en="Hint" />
        </TownButton>
        <TownButton tone="paper" onClick={() => (setCode(step.starter), setOut(null), setErr(null))}>
          ↺ <TB en="Start again" />
        </TownButton>
      </div>
      {hint && <Say b={step.hint} className="rounded-lg bg-paper-2 p-2 font-mono text-sm" />}
      {loading && <p className="text-sm font-semibold text-ink-soft">⏳ {loading}</p>}
      {out !== null && <Output text={out.join('\n')} />}
      {err && <pre className="whitespace-pre-wrap rounded-lg bg-[#fde3dc] p-2 font-mono text-xs text-[#7f1d1d]">⚠️ {err}</pre>}
      {wrongNow && (
        <div className="rounded-xl bg-[#fde3dc] p-3 text-sm">
          <div className="font-bold">
            <T en="Not yet — it should print:" />
          </div>
          <Output text={step.expect} label="Expected" />
        </div>
      )}
      <Sandbox
        ref={box}
        className="hidden"
        onLog={(t) => {
          live.current.logs.push(t);
          setOut([...live.current.logs]);
        }}
        onError={(t) => handlers.current.onError?.(t)}
        onLoading={(t) => {
          setLoading(t);
          if (!t) handlers.current.onLoaded?.();
        }}
        onDone={() => live.current.finish?.()}
      />
      <CheckBar ready={!busy && code.trim().length > 0} verdict={verdict} onCheck={() => void check()} onContinue={() => onDone(!!verdict?.ok)} />
    </div>
  );
}

/**
 * Guided writing: a short task with sentence starters. He writes, then compares with a model answer and
 * ticks a checklist. Not graded — it shows what a good answer looks like.
 */
function ComposeStep({ step, onDone }: { step: Extract<Step, { kind: 'compose' }>; onDone: () => void }) {
  const [text, setText] = useState(step.frame ?? '');
  const [shown, setShown] = useState(false);
  const [ticked, setTicked] = useState<boolean[]>(() => step.checklist.map(() => false));
  const wrote = text.trim().length > (step.frame?.trim().length ?? 0) + 8;
  return (
    <div className="space-y-3">
      <div className="text-xs font-bold uppercase tracking-wide text-[#16a34a]">
        ✍️ <T en="Your turn: write a little" />
      </div>
      <Say b={step.task} className="font-display text-lg font-bold" />
      {step.tip && <Say b={step.tip} className="rounded-lg bg-paper-2 p-2 text-sm" />}
      <textarea
        value={text}
        onChange={(e) => !shown && setText(e.target.value)}
        rows={4}
        className="w-full rounded-xl border-[2.5px] border-ink bg-[#fffaf0] p-3 text-[16px] leading-relaxed text-ink-text outline-none focus:ring-2 focus:ring-[#ffc23d]"
        aria-label="Your answer"
      />
      {!shown ? (
        <TownButton tone="green" size="lg" className="w-full" disabled={!wrote} onClick={() => setShown(true)}>
          <TB en="Compare with a model answer" />
        </TownButton>
      ) : (
        <div className="animate-pop space-y-3">
          <div className="rounded-xl bg-[#e6f6d5] p-3">
            <div className="text-xs font-bold uppercase tracking-wide text-[#15803d]">
              ⭐ <T en="Model answer" />
            </div>
            <p className="mt-1 whitespace-pre-line text-[15px] leading-relaxed">{step.model}</p>
          </div>
          <div className="rounded-xl bg-paper-2 p-3">
            <div className="text-xs font-bold uppercase tracking-wide text-ink-soft">
              ✅ <T en="Check your answer" />
            </div>
            <ul className="mt-1 space-y-1">
              {step.checklist.map((c, i) => (
                <li key={i}>
                  <label className="flex cursor-pointer items-start gap-2 text-[15px]">
                    <input type="checkbox" className="mt-1 size-4 accent-[#5cb85c]" checked={ticked[i]} onChange={() => setTicked(ticked.map((t, k) => (k === i ? !t : t)))} />
                    <span>{c}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
          <TownButton tone="green" size="lg" className="w-full" onClick={onDone}>
            <TB en="Continue" />
          </TownButton>
        </div>
      )}
    </div>
  );
}

// ── Jump ahead ──────────────────────────────────────────────────
/** Questions for a jump test: practice steps from every earlier unit, mixed, about 12 in all. */
function jumpSteps(units: PyUnit[], n = 12): Step[] {
  const r = rng(hashString(`${units.map((u) => u.id).join()}:${Date.now()}`));
  const pools = units.map((u) =>
    shuffle(
      u.lessons.flatMap((l) => l.steps.filter((s) => s.kind === 'choice' || s.kind === 'fill' || s.kind === 'order' || s.kind === 'output')),
      String(r()),
    ),
  );
  const out: Step[] = [];
  // Take one from each unit in turn (the later units first), so every unit is tested.
  for (let k = 0; out.length < n && pools.some((p) => p.length > k); k++) for (let u = pools.length - 1; u >= 0 && out.length < n; u--) if (pools[u][k]) out.push(pools[u][k]);
  return shuffle(out, String(r()));
}

/** Two mistakes are allowed; the third ends the test. */
const JUMP_LIVES = 3;

function JumpTest({ unit, steps, onExit, onPass }: { unit: PyUnit; steps: Step[]; onExit: () => void; onPass: () => void }) {
  const [i, setI] = useState(0);
  const [lives, setLives] = useState(JUMP_LIVES);
  const [result, setResult] = useState<'pass' | 'fail' | null>(null);
  const top = useRef<HTMLDivElement>(null);
  useEffect(() => {
    top.current?.scrollIntoView({ block: 'start' });
  }, []);
  const answer = (ok: boolean) => {
    const left = ok ? lives : lives - 1;
    setLives(left);
    if (left <= 0) return setResult('fail');
    if (i + 1 >= steps.length) {
      setResult('pass');
      onPass();
      return;
    }
    setI(i + 1);
    top.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };

  if (result)
    return (
      <Panel className="mx-auto max-w-lg space-y-3 text-center">
        <div className="town-bob text-6xl">{result === 'pass' ? '🚀' : '💪'}</div>
        <h2 className="font-display text-2xl font-bold">{result === 'pass' ? <T en="You jumped ahead!" /> : <T en="Not this time" />}</h2>
        <p className="font-display text-lg font-bold">
          {unit.emoji} <BiText b={unit.title} />
        </p>
        <p className="text-ink-soft">
          {result === 'pass' ? <T en="Everything before this unit is marked done. Carry on from here!" /> : <T en="No problem: do the lessons before it, or try the test again later." />}
        </p>
        <TownButton tone={result === 'pass' ? 'green' : 'paper'} size="lg" onClick={onExit}>
          <TB en="Back to the path" />
        </TownButton>
      </Panel>
    );

  return (
    <div ref={top} className="mx-auto max-w-2xl scroll-mt-24 space-y-3">
      <div className="flex items-center gap-3">
        <button onClick={onExit} className="town-btn grid size-10 shrink-0 place-items-center rounded-full bg-paper font-bold" aria-label="Leave the test">
          ✕
        </button>
        <Meter value={i} max={steps.length} color="#4b8fe2" className="h-3 flex-1" />
        <span className="shrink-0 text-sm" aria-label={`${lives} lives`}>
          {'❤️'.repeat(lives)}
          {'🖤'.repeat(JUMP_LIVES - lives)}
        </span>
      </div>
      <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">
        ⏩ <T en="Jump test" />: {unit.emoji} <BiText b={unit.title} /> · {i + 1}/{steps.length}
      </p>
      <Panel>
        <StepView key={i} step={steps[i]} seed={`jump:${unit.id}:${i}`} onDone={answer} />
      </Panel>
    </div>
  );
}
