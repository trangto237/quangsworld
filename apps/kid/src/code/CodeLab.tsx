import { useRef, useState, type KeyboardEvent } from 'react';
import type { StudentProfile } from '@atlas/db';
import { uid } from '@atlas/shared';
import { cx, useQuery, useRepo } from '@atlas/ui';
import { T, TB, tr, useLang } from '../i18n';
import { useKid } from '../store';
import { TownScreen } from '../town/Shell';
import { Panel, TownButton } from '../town/ui';
import { BlockPuzzle } from './BlockPuzzle';
import { LESSONS, REFERENCE, TEMPLATES, type Lesson } from './lessons';
import { PUZZLES } from './puzzles';
import type { Lang } from './runtime';
import { Sandbox, type SandboxHandle } from './Sandbox';

type Tab = 'blocks' | 'js' | 'py' | 'games';
const REWARD = { coins: 20, gems: 0, xp: 20 };

export const unlockKey = (studentId: string) => `code-unlocked:${studentId}`;
const doneKey = (studentId: string) => `code-done:${studentId}`;
const gamesKey = (studentId: string) => `code-games:${studentId}`;
const draftKey = (studentId: string, id: string) => `atlas-code-draft:${studentId}:${id}`;

interface SavedGame {
  id: string;
  name: string;
  lang: Lang;
  code: string;
  updatedAt: number;
}

const readDraft = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const writeDraft = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* storage blocked */
  }
};

/** The Code Lab: blocks puzzles, then the same ideas in JavaScript and Python, then his own games. Unlocked by a parent. */
export function CodeLab({ student }: { student: StudentProfile }) {
  const go = useKid((s) => s.go);
  const unlocked = useQuery((r) => !!r.getKv<boolean>(unlockKey(student.id)), [student.id]);
  const done = useQuery((r) => r.getKv<string[]>(doneKey(student.id)) ?? [], [student.id]);
  const repo = useRepo();
  const [tab, setTab] = useState<Tab>('blocks');

  const finish = async (id: string) => {
    if (!done.includes(id)) await repo.setKv(doneKey(student.id), [...done, id]);
    await repo.claimOnce(`code-reward:${student.id}:${id}`, student.id, REWARD);
  };

  if (!unlocked)
    return (
      <TownScreen student={student} tab={null} back={() => go({ name: 'hub' })}>
        <Panel className="mx-auto max-w-lg text-center">
          <div className="text-6xl">🔒</div>
          <h1 className="mt-2 font-display text-3xl font-bold">
            <T en="Code Lab" />
          </h1>
          <p className="mt-2 text-ink-soft">
            <T en="Learn to code by making games — Snake and more, with blocks, JavaScript and Python. Ask your parent to unlock this island in the parent app." />
          </p>
        </Panel>
      </TownScreen>
    );

  const TABS: { id: Tab; label: string }[] = [
    { id: 'blocks', label: '🧩 Blocks' },
    { id: 'js', label: '🟨 JavaScript' },
    { id: 'py', label: '🐍 Python' },
    { id: 'games', label: '🎮 My games' },
  ];
  const count = (prefix: string, total: number) => `${done.filter((d) => d.startsWith(prefix)).length}/${total}`;

  return (
    <TownScreen student={student} tab={null} back={() => go({ name: 'hub' })} showPowers={false} className="max-w-6xl">
      <Panel className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl font-bold">
            💻 <T en="Code Lab" />
          </h1>
          <p className="text-sm text-ink-soft">
            <T en="Blocks first, then real code. Every lesson builds a piece of your own Snake game." />
          </p>
        </div>
        <div className="text-sm font-bold text-ink-soft">
          🧩 {count('b', PUZZLES.length)} · 🟨 {count('js:', LESSONS.length)} · 🐍 {count('py:', LESSONS.length)}
        </div>
      </Panel>
      <div className="mt-4 flex gap-2 overflow-x-auto px-0.5 pb-2 pt-0.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cx('town-btn shrink-0 rounded-full px-4 py-1.5 font-display text-sm font-bold', tab === t.id ? 'bg-[#ffc23d] text-[#3b2412]' : 'bg-paper text-ink-text hover:bg-paper-3')}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-3">
        {tab === 'blocks' && <BlocksTab done={done} onSolved={(id) => void finish(id)} />}
        {(tab === 'js' || tab === 'py') && <CourseTab key={tab} lang={tab} studentId={student.id} done={done} onPassed={(id) => void finish(`${tab}:${id}`)} />}
        {tab === 'games' && <GamesTab studentId={student.id} />}
      </div>
    </TownScreen>
  );
}

function BlocksTab({ done, onSolved }: { done: string[]; onSolved: (id: string) => void }) {
  const lang = useLang();
  const firstOpen = PUZZLES.findIndex((p) => !done.includes(p.id));
  const [i, setI] = useState(firstOpen < 0 ? 0 : firstOpen);
  const open = (k: number) => k === 0 || done.includes(PUZZLES[k - 1].id);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {PUZZLES.map((p, k) => (
          <button
            key={p.id}
            disabled={!open(k)}
            onClick={() => setI(k)}
            className={cx('rounded-lg px-3 py-1 text-sm font-bold ring-1', k === i ? 'bg-ink text-paper ring-ink' : 'ring-ink/30', !open(k) && 'opacity-40')}
          >
            {done.includes(p.id) ? '✓ ' : open(k) ? '' : '🔒 '}
            {(lang === 'vi' ? p.title.vi : p.title.en).split('. ')[0]}
          </button>
        ))}
      </div>
      <BlockPuzzle puzzle={PUZZLES[i]} onSolved={() => onSolved(PUZZLES[i].id)} />
      {done.includes(PUZZLES[i].id) && i < PUZZLES.length - 1 && (
        <TownButton tone="green" onClick={() => setI(i + 1)}>
          <TB en="Next puzzle →" />
        </TownButton>
      )}
      {PUZZLES.every((p) => done.includes(p.id)) && (
        <p className="town-panel p-3 text-sm font-semibold">
          <T en="🏆 All blocks puzzles solved! Now try the JavaScript or Python tab — the same ideas, typed as real code." />
        </p>
      )}
    </div>
  );
}

/** A code box: monospace, Tab inserts spaces. */
function CodeBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const el = e.currentTarget;
    const { selectionStart: a, selectionEnd: b } = el;
    const next = `${value.slice(0, a)}  ${value.slice(b)}`;
    onChange(next);
    requestAnimationFrame(() => el.setSelectionRange(a + 2, a + 2));
  };
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKey}
      spellCheck={false}
      autoCapitalize="off"
      autoCorrect="off"
      className="h-80 w-full resize-y rounded-xl bg-[#0f172a] p-3 font-mono text-[13px] leading-relaxed text-[#e2e8f0] outline-none ring-2 ring-transparent focus:ring-[#ffc23d]"
    />
  );
}

const ArrowBtn = ({ onClick, children }: { onClick: () => void; children: string }) => (
  <button onClick={onClick} className="town-btn rounded-xl bg-paper py-2 font-display text-2xl font-bold">
    {children}
  </button>
);

/** Runs code in the sandbox, collecting the log and errors. */
function useRunner() {
  const sandbox = useRef<SandboxHandle>(null);
  const [log, setLog] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState('');
  const loaded = useRef<(() => void) | null>(null);
  const handlers = {
    onLog: (t: string) => setLog((l) => [...l, t].slice(-200)),
    onError: (t: string) => setError(t),
    onLoading: (t: string) => {
      setLoading(t);
      if (!t) loaded.current?.();
    },
  };
  const run = (lang: Lang, code: string) => {
    setError(null);
    setLog([]);
    sandbox.current?.run(lang, code);
  };
  /** Resolves once the program has really started (Python needs loading first). */
  const started = (lang: Lang) =>
    new Promise<void>((ok) => {
      if (lang === 'js') return setTimeout(ok, 50);
      const t = setTimeout(ok, 60_000);
      // Each run starts a fresh Python, which reports when it has finished loading.
      loaded.current = () => (clearTimeout(t), (loaded.current = null), ok());
    });
  return { sandbox, log, setLog, error, loading, handlers, run, started };
}

function CourseTab({ lang, studentId, done, onPassed }: { lang: Lang; studentId: string; done: string[]; onPassed: (id: string) => void }) {
  const ui = useLang();
  const firstOpen = LESSONS.findIndex((l) => !done.includes(`${lang}:${l.id}`));
  const [i, setI] = useState(firstOpen < 0 ? 0 : firstOpen);
  const lesson = LESSONS[i];
  const [code, setCodeState] = useState(() => readDraft(draftKey(studentId, `${lang}:${lesson.id}`)) ?? lesson.starter[lang]);
  const [verdict, setVerdict] = useState<{ ok: boolean; text: string } | null>(null);
  const [checking, setChecking] = useState(false);
  const [hint, setHint] = useState(false);
  const r = useRunner();
  const open = (k: number) => k === 0 || done.includes(`${lang}:${LESSONS[k - 1].id}`);
  const say = (b: { en: string; vi: string }) => (ui === 'vi' ? b.vi : ui === 'help' ? `${b.en}\n🇻🇳 ${b.vi}` : b.en);

  const setCode = (v: string) => {
    setCodeState(v);
    writeDraft(draftKey(studentId, `${lang}:${lesson.id}`), v);
  };
  const pick = (k: number) => {
    setI(k);
    setVerdict(null);
    setHint(false);
    r.sandbox.current?.stop();
    setCodeState(readDraft(draftKey(studentId, `${lang}:${LESSONS[k].id}`)) ?? LESSONS[k].starter[lang]);
  };

  const check = async (l: Lesson) => {
    setChecking(true);
    setVerdict(null);
    r.run(lang, code);
    await r.started(lang);
    const c = l.check;
    let before;
    if (c.key) {
      await new Promise((ok) => setTimeout(ok, c.key!.at));
      before = (await r.sandbox.current?.state()) ?? undefined;
      r.sandbox.current?.key(c.key.key);
      await new Promise((ok) => setTimeout(ok, c.wait - c.key!.at));
    } else await new Promise((ok) => setTimeout(ok, c.wait));
    const s = await r.sandbox.current?.state();
    setChecking(false);
    if (!s) return setVerdict({ ok: false, text: tr(ui, "The game screen didn't answer — press Run and try again.") });
    if (s.error) return setVerdict({ ok: false, text: `${tr(ui, 'Your program has an error')}: ${s.error}` });
    const miss = l.check.test(s, code, before, lang);
    if (miss) return setVerdict({ ok: false, text: say(miss) });
    onPassed(l.id);
    setVerdict({ ok: true, text: tr(ui, '🎉 Correct! +20 coins') });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {LESSONS.map((l, k) => (
          <button
            key={l.id}
            disabled={!open(k)}
            onClick={() => pick(k)}
            className={cx('rounded-lg px-3 py-1 text-sm font-bold ring-1', k === i ? 'bg-ink text-paper ring-ink' : 'ring-ink/30', !open(k) && 'opacity-40')}
          >
            {done.includes(`${lang}:${l.id}`) ? '✓ ' : open(k) ? '' : '🔒 '}
            {k + 1}
          </button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-3">
          <Panel className="space-y-2">
            <h2 className="font-display text-xl font-bold">{ui === 'vi' ? lesson.title.vi : lesson.title.en}</h2>
            <p className="whitespace-pre-line text-sm">{say(lesson.learn)}</p>
            <p className="whitespace-pre-line rounded-lg bg-tint-amber p-2 text-sm font-semibold">🎯 {say(lesson.task)}</p>
          </Panel>
          <CodeBox value={code} onChange={setCode} />
          <div className="flex flex-wrap gap-2">
            <TownButton tone="blue" onClick={() => r.run(lang, code)}>
              <TB en="▶ Run" />
            </TownButton>
            <TownButton tone="green" disabled={checking} onClick={() => void check(lesson)}>
              {checking ? <TB en="Checking…" /> : <TB en="✓ Check" />}
            </TownButton>
            <TownButton tone="paper" onClick={() => r.sandbox.current?.stop()}>
              <TB en="■ Stop" />
            </TownButton>
            <TownButton tone="paper" onClick={() => setHint((h) => !h)}>
              <TB en="💡 Hint" />
            </TownButton>
            <TownButton tone="paper" onClick={() => (setCode(lesson.starter[lang]), setVerdict(null))}>
              <TB en="↺ Start again" />
            </TownButton>
          </div>
          {hint && <p className="whitespace-pre-line rounded-lg bg-paper-2 p-2 font-mono text-xs">{say(lesson.hint)}</p>}
          {verdict && (
            <p className={cx('whitespace-pre-line rounded-lg p-2 text-sm font-bold', verdict.ok ? 'bg-tint-green' : 'bg-tint-red')}>
              {verdict.text}
              {verdict.ok && i < LESSONS.length - 1 && (
                <button className="ml-2 underline" onClick={() => pick(i + 1)}>
                  <T en="Next lesson →" />
                </button>
              )}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Sandboxed r={r} />
          <Reference lang={lang} />
        </div>
      </div>
    </div>
  );
}

function Sandboxed({ r }: { r: ReturnType<typeof useRunner> }) {
  return (
    <div className="space-y-2">
      <div className="relative">
        <Sandbox ref={r.sandbox} className="aspect-square w-full rounded-xl border-[2.5px] border-ink bg-[#0f172a]" {...r.handlers} />
        {r.loading && <div className="absolute inset-0 grid place-items-center rounded-xl bg-black/50 p-4 text-center text-sm font-bold text-white">{r.loading}</div>}
      </div>
      <div className="grid grid-cols-3 gap-1.5 sm:hidden">
        <span />
        <ArrowBtn onClick={() => r.sandbox.current?.key('up')}>↑</ArrowBtn>
        <span />
        <ArrowBtn onClick={() => r.sandbox.current?.key('left')}>←</ArrowBtn>
        <ArrowBtn onClick={() => r.sandbox.current?.key('down')}>↓</ArrowBtn>
        <ArrowBtn onClick={() => r.sandbox.current?.key('right')}>→</ArrowBtn>
      </div>
      {r.error && <pre className="whitespace-pre-wrap rounded-lg bg-rose-100 p-2 font-mono text-xs text-rose-900 dark:bg-rose-950 dark:text-rose-200">⚠️ {r.error}</pre>}
      {r.log.length > 0 && (
        <div className="rounded-lg bg-paper-2 p-2">
          <div className="flex justify-between text-xs font-bold text-ink-soft">
            <T en="Log" />
            <button onClick={() => r.setLog([])} className="underline">
              <T en="clear" />
            </button>
          </div>
          <pre className="max-h-28 overflow-auto font-mono text-xs">{r.log.slice(-50).join('\n')}</pre>
        </div>
      )}
    </div>
  );
}

function Reference({ lang }: { lang: Lang }) {
  return (
    <details className="town-panel p-3 text-xs">
      <summary className="cursor-pointer font-bold">
        📘 <T en="Game library" />
      </summary>
      <table className="mt-2 w-full">
        <tbody>
          {REFERENCE[lang].map(([f, d]) => (
            <tr key={f}>
              <td className="py-0.5 pr-2 font-mono font-bold">{f}</td>
              <td className="text-ink-soft">{d}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

function GamesTab({ studentId }: { studentId: string }) {
  const repo = useRepo();
  const ui = useLang();
  const games = useQuery((r) => r.getKv<SavedGame[]>(gamesKey(studentId)) ?? [], [studentId]);
  const [open, setOpen] = useState<SavedGame | null>(null);
  const r = useRunner();

  const save = async (g: SavedGame) => {
    const next = [{ ...g, updatedAt: Date.now() }, ...games.filter((x) => x.id !== g.id)];
    await repo.setKv(gamesKey(studentId), next);
  };
  const create = (tpl: (typeof TEMPLATES)[number], lang: Lang) => {
    const g: SavedGame = { id: uid('g_'), name: tpl.id === 'blank' ? tr(ui, 'My game') : `${tr(ui, tpl.name)} (${tr(ui, 'my version')})`, lang, code: tpl.code[lang], updatedAt: Date.now() };
    void save(g);
    setOpen(g);
  };

  if (open)
    return (
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => (r.sandbox.current?.stop(), setOpen(null))} className="town-btn rounded-lg bg-paper px-3 py-1 font-bold">
              ← <T en="My games" />
            </button>
            <input
              value={open.name}
              onChange={(e) => setOpen({ ...open, name: e.target.value })}
              onBlur={() => void save(open)}
              className="min-w-0 flex-1 rounded-lg border-2 border-ink bg-paper px-2 py-1 font-display font-bold"
              aria-label={tr(ui, 'Game name')}
            />
            <span className="rounded-full bg-paper-2 px-2 py-0.5 text-xs font-bold">{open.lang === 'js' ? 'JavaScript' : 'Python'}</span>
          </div>
          <CodeBox value={open.code} onChange={(code) => setOpen({ ...open, code })} />
          <div className="flex flex-wrap gap-2">
            <TownButton tone="green" onClick={() => (void save(open), r.run(open.lang, open.code))}>
              <TB en="▶ Run" />
            </TownButton>
            <TownButton tone="paper" onClick={() => r.sandbox.current?.stop()}>
              <TB en="■ Stop" />
            </TownButton>
            <TownButton tone="paper" onClick={() => void save(open)}>
              <TB en="💾 Save" />
            </TownButton>
            <TownButton
              tone="red"
              onClick={() => {
                if (!confirm(tr(ui, 'Delete this game?'))) return;
                void repo.setKv(
                  gamesKey(studentId),
                  games.filter((g) => g.id !== open.id),
                );
                setOpen(null);
              }}
            >
              <TB en="Delete" />
            </TownButton>
          </div>
        </div>
        <div className="space-y-2">
          <Sandboxed r={r} />
          <Reference lang={open.lang} />
        </div>
      </div>
    );

  return (
    <div className="space-y-4">
      <Panel>
        <h2 className="font-display text-xl font-bold">
          <T en="Make a new game" />
        </h2>
        <p className="text-sm text-ink-soft">
          <T en="Start from a template and change anything: colours, speed, rules — or start blank." />
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {TEMPLATES.map((t) => (
            <div key={t.id} className="rounded-xl bg-paper-2 p-3">
              <div className="font-display text-lg font-bold">
                {t.emoji} <T en={t.name} />
              </div>
              <div className="mt-2 flex gap-1.5">
                <TownButton tone="amber" size="sm" onClick={() => create(t, 'js')}>
                  JavaScript
                </TownButton>
                <TownButton tone="green" size="sm" onClick={() => create(t, 'py')}>
                  Python
                </TownButton>
              </div>
            </div>
          ))}
        </div>
      </Panel>
      {games.length > 0 && (
        <Panel>
          <h2 className="font-display text-xl font-bold">
            <T en="My games" />
          </h2>
          <ul className="mt-2 divide-y-2 divide-ink/10">
            {games.map((g) => (
              <li key={g.id} className="flex items-center gap-3 py-2">
                <span className="text-2xl">{g.lang === 'js' ? '🟨' : '🐍'}</span>
                <span className="min-w-0 flex-1 truncate font-bold">{g.name}</span>
                <span className="text-xs text-ink-soft">{new Date(g.updatedAt).toLocaleDateString()}</span>
                <TownButton tone="blue" size="sm" onClick={() => setOpen(g)}>
                  <TB en="Open" />
                </TownButton>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
