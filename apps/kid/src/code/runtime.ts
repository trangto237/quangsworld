/**
 * The sandbox that runs his code. A sandboxed iframe (no access to the app, its storage or cookies) draws
 * a grid game; his program runs inside a Web Worker in that iframe, so a program stuck in a loop can
 * always be stopped (the worker is thrown away) without freezing the app.
 *
 * The same small game library in both languages:
 *   JavaScript: grid(w, h)  clear()  cell(x, y, color)  text(msg)  score(n)  every(ms, fn)  onKey(fn)  random(n)  gameOver(msg)  console.log(...)
 *   Python:     grid(w, h)  clear()  cell(x, y, color)  text(msg)  score(n)  every(ms, fn)  on_key(fn)  random(n)  game_over(msg)  print(...)
 * Keys arrive as "up", "down", "left", "right", "space".
 *
 * Messages with the app (postMessage):
 *   app → sandbox: { type: 'run', lang, code } · { type: 'stop' } · { type: 'key', key } · { type: 'state', id }
 *   sandbox → app: { type: 'ready' } · { type: 'log', text } · { type: 'error', text } · { type: 'loading', text }
 *                  { type: 'over', text } · { type: 'state', id, state }
 */

export type Lang = 'js' | 'py';

/** What the app can ask the sandbox about a running program, for checking lessons. */
export interface SandboxState {
  /** "x,y" → colour, as currently drawn. */
  board: Record<string, string>;
  cols: number;
  rows: number;
  /** Library functions the program has used. */
  used: string[];
  /** How many times the picture changed. */
  frames: number;
  score: number | null;
  text: string;
  over: string | null;
  error: string | null;
  logs: string[];
}

export const PYODIDE = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';

// ── Worker side (runs his program) ────────────────────────────
const WORKER_COMMON = String.raw`
let ops = [];
let flushing = false;
const used = new Set();
function mark(n) { if (!used.has(n)) { used.add(n); ops.push(['used', n]); } }
function flush() { if (flushing) return; flushing = true; setTimeout(() => { flushing = false; if (ops.length) { postMessage({ type: 'ops', ops }); ops = []; } }, 0); }
function op(...a) { ops.push(a); flush(); }
const timers = [];
const keyFns = [];
let stopped = false;
const api = {
  grid(w, h) { mark('grid'); op('grid', Math.max(2, Math.min(40, w | 0)), Math.max(2, Math.min(40, h | 0))); },
  clear() { mark('clear'); op('clear'); },
  cell(x, y, color) { mark('cell'); op('cell', x | 0, y | 0, String(color ?? 'green')); },
  text(msg) { mark('text'); op('text', String(msg)); },
  score(n) { mark('score'); op('score', Number(n) || 0); },
  random(n) { mark('random'); return Math.floor(Math.random() * Math.max(1, n | 0)); },
  every(ms, fn) { mark('every'); const t = setInterval(() => { if (stopped) return; try { fn(); } catch (e) { fail(e); } }, Math.max(50, ms | 0)); timers.push(t); },
  onKey(fn) { mark('onKey'); keyFns.push(fn); },
  gameOver(msg) { mark('gameOver'); stopped = true; timers.forEach(clearInterval); op('over', String(msg ?? 'Game over')); },
  log(...a) { op('log', a.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' ')); },
};
function fail(e) { stopped = true; timers.forEach(clearInterval); postMessage({ type: 'error', text: String((e && e.message) || e) }); }
onmessage = (m) => {
  const d = m.data;
  if (d.type === 'key') for (const fn of keyFns) { try { fn(d.key); } catch (e) { fail(e); } }
  if (d.type === 'run') start(d.code);
};
`;

const WORKER_JS = String.raw`
function start(code) {
  const console = { log: api.log, error: api.log, warn: api.log };
  try {
    const run = new Function('grid', 'clear', 'cell', 'text', 'score', 'random', 'every', 'onKey', 'gameOver', 'console', '"use strict";\n' + code);
    run(api.grid, api.clear, api.cell, api.text, api.score, api.random, api.every, api.onKey, api.gameOver, console);
  } catch (e) { fail(e); }
}
postMessage({ type: 'ready' });
`;

const WORKER_PY = String.raw`
let py = null;
async function start(code) {
  try {
    if (!py) {
      postMessage({ type: 'loading', text: 'Loading Python… (the first time takes a little while)' });
      importScripts('${PYODIDE}pyodide.js');
      py = await loadPyodide({ indexURL: '${PYODIDE}' });
      py.setStdout({ batched: (s) => api.log(s) });
      py.setStderr({ batched: (s) => api.log(s) });
      py.registerJsModule('_game', api);
      await py.runPythonAsync([
        'from pyodide.ffi import create_proxy',
        'import _game',
        'def grid(w, h): _game.grid(w, h)',
        'def clear(): _game.clear()',
        'def cell(x, y, color="green"): _game.cell(x, y, color)',
        'def text(msg): _game.text(str(msg))',
        'def score(n): _game.score(n)',
        'def random(n): return _game.random(n)',
        'def every(ms, fn): _game.every(ms, create_proxy(fn))',
        'def on_key(fn): _game.onKey(create_proxy(fn))',
        'def game_over(msg="Game over"): _game.gameOver(str(msg))',
      ].join('\n'));
      postMessage({ type: 'loading', text: '' });
    }
    await py.runPythonAsync(code);
  } catch (e) {
    const msg = String((e && e.message) || e);
    // Python tracebacks are long: keep the last useful lines.
    fail(msg.split('\n').filter((l) => l.trim() && !l.includes('/lib/python') && !l.includes('pyodide')).slice(-4).join('\n'));
  }
}
postMessage({ type: 'ready' });
`;

// ── Iframe side (draws, forwards keys, answers the app) ────────
const FRAME = String.raw`
const C = document.getElementById('c');
const g = C.getContext('2d');
let cols = 20, rows = 20, board = {}, used = new Set(), frames = 0, scoreV = null, textV = '', overV = null, errorV = null, logs = [];
let worker = null, dirty = true;
const W = { js: ${JSON.stringify(WORKER_COMMON + WORKER_JS)}, py: ${JSON.stringify(WORKER_COMMON + WORKER_PY)} };
function reset() { cols = 20; rows = 20; board = {}; used = new Set(); frames = 0; scoreV = null; textV = ''; overV = null; errorV = null; logs = []; dirty = true; }
function draw() {
  if (dirty) {
    dirty = false;
    const s = Math.floor(Math.min(C.width / cols, C.height / rows));
    const ox = Math.floor((C.width - s * cols) / 2), oy = Math.floor((C.height - s * rows) / 2);
    g.fillStyle = '#0f172a'; g.fillRect(0, 0, C.width, C.height);
    g.fillStyle = '#1e293b'; g.fillRect(ox, oy, s * cols, s * rows);
    g.strokeStyle = 'rgba(255,255,255,0.05)';
    for (let i = 0; i <= cols; i++) { g.beginPath(); g.moveTo(ox + i * s, oy); g.lineTo(ox + i * s, oy + rows * s); g.stroke(); }
    for (let j = 0; j <= rows; j++) { g.beginPath(); g.moveTo(ox, oy + j * s); g.lineTo(ox + cols * s, oy + j * s); g.stroke(); }
    for (const k in board) { const [x, y] = k.split(',').map(Number); if (x < 0 || y < 0 || x >= cols || y >= rows) continue; g.fillStyle = board[k]; g.fillRect(ox + x * s + 1, oy + y * s + 1, s - 2, s - 2); }
    document.getElementById('t').textContent = textV;
    document.getElementById('s').textContent = scoreV == null ? '' : 'Score: ' + scoreV;
    document.getElementById('o').textContent = overV || '';
    document.getElementById('o').style.display = overV ? 'grid' : 'none';
  }
  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
function fit() { const r = C.getBoundingClientRect(); C.width = Math.round(r.width * devicePixelRatio); C.height = Math.round(r.height * devicePixelRatio); dirty = true; }
addEventListener('resize', fit); fit();
function apply(ops) {
  let changed = false;
  for (const [k, a, b, c] of ops) {
    if (k === 'cell') { const key = a + ',' + b; if (board[key] !== c) { board[key] = c; changed = true; } }
    else if (k === 'clear') { if (Object.keys(board).length) changed = true; board = {}; }
    else if (k === 'grid') { cols = a; rows = b; }
    else if (k === 'text') textV = a;
    else if (k === 'score') scoreV = a;
    else if (k === 'used') used.add(a);
    else if (k === 'over') { overV = a; parent.postMessage({ type: 'over', text: a }, '*'); }
    else if (k === 'log') { logs.push(a); if (logs.length > 200) logs.shift(); parent.postMessage({ type: 'log', text: a }, '*'); }
  }
  if (changed) frames++;
  dirty = true;
}
function stop() { if (worker) { worker.terminate(); worker = null; } }
function run(lang, code) {
  stop(); reset();
  const url = URL.createObjectURL(new Blob([W[lang]], { type: 'text/javascript' }));
  worker = new Worker(url);
  worker.onmessage = (m) => {
    const d = m.data;
    if (d.type === 'ready') worker.postMessage({ type: 'run', code });
    else if (d.type === 'ops') apply(d.ops);
    else if (d.type === 'error') { errorV = d.text; parent.postMessage({ type: 'error', text: d.text }, '*'); }
    else if (d.type === 'loading') parent.postMessage({ type: 'loading', text: d.text }, '*');
  };
  worker.onerror = (e) => { errorV = e.message; parent.postMessage({ type: 'error', text: e.message }, '*'); e.preventDefault(); };
}
const KEYS = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', ' ': 'space', w: 'up', s: 'down', a: 'left', d: 'right' };
addEventListener('keydown', (e) => { const k = KEYS[e.key]; if (k && worker) { worker.postMessage({ type: 'key', key: k }); e.preventDefault(); } });
addEventListener('message', (m) => {
  const d = m.data || {};
  if (d.type === 'run') run(d.lang, d.code);
  else if (d.type === 'stop') stop();
  else if (d.type === 'key' && worker) worker.postMessage({ type: 'key', key: d.key });
  else if (d.type === 'state') parent.postMessage({ type: 'state', id: d.id, state: { board, cols, rows, used: [...used], frames, score: scoreV, text: textV, over: overV, error: errorV, logs } }, '*');
});
parent.postMessage({ type: 'ready' }, '*');
`;

export const SANDBOX_HTML = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>html,body{margin:0;height:100%;background:#0f172a;color:#e2e8f0;font:600 14px system-ui,sans-serif;overflow:hidden}
#bar{position:absolute;left:8px;right:8px;top:6px;display:flex;justify-content:space-between;gap:8px;pointer-events:none}
#c{position:absolute;inset:28px 0 0 0;width:100%;height:calc(100% - 28px)}
#o{position:absolute;inset:0;display:none;place-items:center;background:rgba(15,23,42,.6);font-size:28px;font-weight:800;color:#fde047;text-align:center;padding:16px}</style></head>
<body tabindex="0"><div id="bar"><span id="t"></span><span id="s"></span></div><canvas id="c"></canvas><div id="o"></div>
<script>${FRAME.replace(/<\/script/gi, '<\\/script')}</script></body></html>`;
