import { useEffect, useRef, useState } from 'react';
import { cx } from '@atlas/ui';
import { T, TB, useLang } from '../i18n';
import { Panel, TownButton } from '../town/ui';
import { LABEL, countBlocks, explainCode, newBlock, runProgram, toCode, type Block, type BlockKind, type Puzzle, type Step } from './puzzles';

type Path = number[];

/** The blocks inside the container at `path` ([] = the program itself). */
function bodyAt(prog: Block[], path: Path): Block[] {
  let list = prog;
  for (const i of path) {
    const b = list[i];
    if (!b || !('body' in b)) return list;
    list = b.body;
  }
  return list;
}

/** A copy of the program with `fn` applied to the list at `path`. */
function editAt(prog: Block[], path: Path, fn: (list: Block[]) => Block[]): Block[] {
  if (!path.length) return fn(prog);
  const [i, ...rest] = path;
  return prog.map((b, j) => (j === i && 'body' in b ? { ...b, body: editAt(b.body, rest, fn) } : b));
}

const ARROW = ['➡️', '⬇️', '⬅️', '⬆️'];

/** One blocks puzzle: palette, program, board, and the program as JavaScript / Python. */
export function BlockPuzzle({ puzzle, onSolved }: { puzzle: Puzzle; onSolved: () => void }) {
  const lang = useLang();
  const [prog, setProg] = useState<Block[]>([]);
  const [target, setTarget] = useState<Path>([]);
  const [pos, setPos] = useState<Step>(puzzle.start);
  const [trail, setTrail] = useState<Step[]>([]);
  const [result, setResult] = useState<'win' | 'crash' | 'short' | 'loop' | null>(null);
  const [running, setRunning] = useState(false);
  const [view, setView] = useState<'js' | 'py'>('js');
  const timer = useRef<number | null>(null);

  useEffect(() => {
    setProg([]);
    setTarget([]);
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzle.id]);
  useEffect(() => () => void (timer.current && clearInterval(timer.current)), []);

  function reset() {
    if (timer.current) clearInterval(timer.current);
    setRunning(false);
    setPos(puzzle.start);
    setTrail([]);
    setResult(null);
  }

  const used = countBlocks(prog);
  const add = (t: BlockKind) => {
    if (used >= puzzle.max) return;
    reset();
    setProg((p) => editAt(p, target, (l) => [...l, newBlock(t)]));
  };
  const remove = (path: Path) => {
    reset();
    const parent = path.slice(0, -1);
    const i = path[path.length - 1];
    setProg((p) => editAt(p, parent, (l) => l.filter((_, j) => j !== i)));
    setTarget([]);
  };
  const setN = (path: Path, n: number) => {
    reset();
    const parent = path.slice(0, -1);
    const i = path[path.length - 1];
    setProg((p) => editAt(p, parent, (l) => l.map((b, j) => (j === i && b.t === 'repeat' ? { ...b, n: Math.max(2, Math.min(9, n)) } : b))));
  };

  const run = () => {
    reset();
    const r = runProgram(puzzle, prog);
    setRunning(true);
    let k = 0;
    timer.current = window.setInterval(() => {
      k++;
      if (k >= r.steps.length) {
        clearInterval(timer.current!);
        setRunning(false);
        setResult(r.end);
        if (r.end === 'win') onSolved();
        return;
      }
      setPos(r.steps[k]);
      setTrail(r.steps.slice(0, k));
    }, 280);
  };

  const walls = new Set(puzzle.walls.map(([x, y]) => `${x},${y}`));
  const trailSet = new Set(trail.map((s) => `${s.x},${s.y}`));

  const renderList = (list: Block[], path: Path) => (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setTarget(path);
      }}
      className={cx('min-h-9 space-y-1 rounded-lg p-1', path.length > 0 && 'ml-4 border-l-4', JSON.stringify(path) === JSON.stringify(target) && 'bg-amber-200/60 ring-2 ring-amber-400 dark:bg-amber-900/40')}
      style={path.length ? { borderColor: LABEL[(bodyAt(prog, path.slice(0, -1))[path[path.length - 1]] as Block)?.t ?? 'repeat'].color } : undefined}
    >
      {list.map((b, i) => {
        const p = [...path, i];
        return (
          <div key={i}>
            <div className="flex items-center gap-1.5 rounded-lg px-2 py-1 font-display text-sm font-bold text-white shadow" style={{ background: LABEL[b.t].color }}>
              {LABEL[b.t].emoji && <span>{LABEL[b.t].emoji}</span>}
              <span className="flex-1">{LABEL[b.t].en}</span>
              {b.t === 'repeat' && (
                <span className="flex items-center gap-1">
                  <button onClick={(e) => (e.stopPropagation(), setN(p, b.n - 1))} className="rounded bg-black/20 px-1.5" aria-label="Fewer times">
                    −
                  </button>
                  <span className="tabular-nums">{b.n}×</span>
                  <button onClick={(e) => (e.stopPropagation(), setN(p, b.n + 1))} className="rounded bg-black/20 px-1.5" aria-label="More times">
                    +
                  </button>
                </span>
              )}
              <button onClick={(e) => (e.stopPropagation(), remove(p))} className="ml-1 rounded bg-black/20 px-1.5" aria-label="Remove block">
                ✕
              </button>
            </div>
            {'body' in b && renderList(b.body, p)}
          </div>
        );
      })}
      {!list.length && (
        <p className="px-2 py-1 text-xs text-ink-soft">
          {path.length ? <T en="Tap here, then add blocks inside" /> : <T en="Add blocks from above" />}
        </p>
      )}
    </div>
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
      <Panel className="space-y-3">
        <h2 className="font-display text-xl font-bold">{lang === 'vi' ? puzzle.title.vi : puzzle.title.en}</h2>
        <p className="text-sm">
          {puzzle.idea.en}
          {lang !== 'en' && <span className="mt-1 block text-rose-900 dark:text-rose-200">🇻🇳 {puzzle.idea.vi}</span>}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {puzzle.blocks.map((t) => (
            <button
              key={t}
              disabled={used >= puzzle.max || running}
              onClick={() => add(t)}
              className="town-btn rounded-lg px-2.5 py-1.5 font-display text-sm font-bold text-white disabled:opacity-40"
              style={{ background: LABEL[t].color }}
            >
              + {LABEL[t].emoji ? `${LABEL[t].emoji} ` : ''}{LABEL[t].en}
            </button>
          ))}
        </div>
        <p className="text-xs font-semibold text-ink-soft">
          <T en="Blocks used" />: {used}/{puzzle.max}
          {target.length > 0 && (
            <>
              {' '}
              · <T en="adding inside the highlighted block" />{' '}
              <button className="underline" onClick={() => setTarget([])}>
                <T en="(add at the end instead)" />
              </button>
            </>
          )}
        </p>
        <div className="rounded-xl bg-paper-2 p-2">{renderList(prog, [])}</div>
        <div className="flex gap-2">
          <TownButton tone="green" disabled={!prog.length || running} onClick={run}>
            <TB en="▶ Run" />
          </TownButton>
          <TownButton tone="paper" onClick={() => (reset(), setProg([]), setTarget([]))}>
            <TB en="Clear" />
          </TownButton>
        </div>
      </Panel>

      <div className="space-y-3">
        <Panel>
          <div className="mx-auto grid w-full max-w-sm gap-1" style={{ gridTemplateColumns: `repeat(${puzzle.cols}, 1fr)` }}>
            {Array.from({ length: puzzle.cols * puzzle.rows }, (_, i) => {
              const x = i % puzzle.cols;
              const y = Math.floor(i / puzzle.cols);
              const k = `${x},${y}`;
              const here = pos.x === x && pos.y === y;
              return (
                <div
                  key={k}
                  className={cx('grid aspect-square place-items-center rounded-md text-xl', walls.has(k) ? 'bg-[#7a5030]' : trailSet.has(k) ? 'bg-[#b8e08a]' : (x + y) % 2 ? 'bg-[#a9d36e]' : 'bg-[#9ccb62]')}
                >
                  {here ? (
                    <span className="relative">
                      🐍<span className="absolute -right-2 -top-2 text-xs">{ARROW[pos.dir]}</span>
                    </span>
                  ) : x === puzzle.goal.x && y === puzzle.goal.y ? (
                    '🍎'
                  ) : walls.has(k) ? (
                    '🧱'
                  ) : null}
                </div>
              );
            })}
          </div>
          {result && (
            <p className={cx('mt-3 text-center font-display text-lg font-bold', result === 'win' ? 'text-[#2f8a3a]' : 'text-[#c0392b]')}>
              {result === 'win' ? (
                <T en="🎉 Solved! +20 coins" />
              ) : result === 'crash' ? (
                <T en="💥 Bump! The snake hit a wall — fix the program and try again." />
              ) : result === 'loop' ? (
                <T en="🔁 The program never stopped. Check your loop." />
              ) : (
                <T en="Not there yet — the program ended before the apple." />
              )}
            </p>
          )}
        </Panel>
        <Panel className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">
              <T en="Your program as real code" />:
            </span>
            {(['js', 'py'] as const).map((l) => (
              <button key={l} onClick={() => setView(l)} className={cx('rounded-full px-2.5 py-0.5 text-xs font-bold ring-1', view === l ? 'bg-ink text-paper ring-ink' : 'ring-ink/30')}>
                {l === 'js' ? 'JavaScript' : 'Python'}
              </button>
            ))}
          </div>
          <pre className="max-h-48 overflow-auto rounded-lg bg-[#0f172a] p-3 font-mono text-xs leading-relaxed text-[#e2e8f0]">{toCode(prog, view) || (view === 'js' ? '// …' : '# …')}</pre>
          {prog.length > 0 && (
            <details className="mt-2" open>
              <summary className="cursor-pointer text-sm font-bold">
                🔍 <T en="Why the code looks like this" />
              </summary>
              <ul className="mt-2 space-y-2">
                {explainCode(prog, view).map((n) => (
                  <li key={n.code} className="rounded-lg bg-paper-2 p-2 text-sm">
                    <code className="rounded bg-[#0f172a] px-1.5 py-0.5 font-mono text-xs text-[#e2e8f0]">{n.code}</code>
                    <p className="mt-1">{n.en}</p>
                    {lang !== 'en' && (
                      <p className="mt-0.5 text-[#9b1c47] dark:text-[#ffb3c6]" lang="vi">
                        🇻🇳 {n.vi}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </Panel>
      </div>
    </div>
  );
}
