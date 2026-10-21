/**
 * Blocks: guide the snake to the apple by stacking blocks. Each program is also shown as JavaScript and
 * Python, so the blocks lead straight into typing real code.
 */

export type Block =
  | { t: 'move' }
  | { t: 'left' }
  | { t: 'right' }
  | { t: 'repeat'; n: number; body: Block[] }
  | { t: 'until'; body: Block[] }
  | { t: 'ifWall'; body: Block[] };

export type BlockKind = Block['t'];

export interface Puzzle {
  id: string;
  title: { en: string; vi: string };
  idea: { en: string; vi: string };
  cols: number;
  rows: number;
  start: { x: number; y: number; dir: Dir };
  goal: { x: number; y: number };
  walls: [number, number][];
  blocks: BlockKind[];
  /** At most this many blocks (counting blocks inside others). */
  max: number;
}

/** 0 right, 1 down, 2 left, 3 up. */
export type Dir = 0 | 1 | 2 | 3;
const STEP: [number, number][] = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
];

export const PUZZLES: Puzzle[] = [
  {
    id: 'b1',
    title: { en: '1. First steps', vi: '1. Những bước đầu' },
    idea: { en: 'A program is steps in order. Add "move" blocks until the snake reaches the apple.', vi: 'Chương trình là các bước theo thứ tự. Thêm khối "move" đến khi rắn tới quả táo.' },
    cols: 7,
    rows: 5,
    start: { x: 1, y: 2, dir: 0 },
    goal: { x: 5, y: 2 },
    walls: [],
    blocks: ['move'],
    max: 6,
  },
  {
    id: 'b2',
    title: { en: '2. Turning', vi: '2. Rẽ' },
    idea: { en: 'Turns change the way the snake faces — they don\'t move it.', vi: 'Khối rẽ đổi hướng con rắn — không làm nó di chuyển.' },
    cols: 6,
    rows: 6,
    start: { x: 1, y: 1, dir: 0 },
    goal: { x: 4, y: 4 },
    walls: [
      [2, 2],
      [3, 2],
      [2, 3],
      [3, 3],
    ],
    blocks: ['move', 'left', 'right'],
    max: 8,
  },
  {
    id: 'b3',
    title: { en: '3. Repeat', vi: '3. Lặp lại' },
    idea: { en: 'Too many blocks? "repeat" runs the blocks inside it several times — that\'s a loop.', vi: 'Quá nhiều khối? "repeat" chạy các khối bên trong nhiều lần — đó là vòng lặp.' },
    cols: 9,
    rows: 3,
    start: { x: 0, y: 1, dir: 0 },
    goal: { x: 8, y: 1 },
    walls: [],
    blocks: ['move', 'repeat'],
    max: 2,
  },
  {
    id: 'b4',
    title: { en: '4. Stairs', vi: '4. Cầu thang' },
    idea: { en: 'Look for the pattern that repeats, and put the whole pattern inside "repeat".', vi: 'Tìm mẫu lặp lại, rồi đặt cả mẫu đó vào trong "repeat".' },
    cols: 7,
    rows: 7,
    start: { x: 1, y: 5, dir: 0 },
    goal: { x: 4, y: 2 },
    walls: [
      [1, 4],
      [2, 3],
      [3, 2],
      [3, 5],
      [4, 4],
      [5, 3],
    ],
    blocks: ['move', 'left', 'right', 'repeat'],
    max: 5,
  },
  {
    id: 'b5',
    title: { en: '5. Loops inside loops', vi: '5. Vòng lặp lồng nhau' },
    idea: { en: 'A "repeat" can hold another "repeat". Walk round three sides of the square with only 4 blocks.', vi: 'Một "repeat" có thể chứa "repeat" khác. Đi ba cạnh của hình vuông chỉ với 4 khối.' },
    cols: 7,
    rows: 7,
    start: { x: 1, y: 1, dir: 0 },
    goal: { x: 1, y: 5 },
    walls: [
      [2, 2],
      [3, 2],
      [4, 2],
      [2, 3],
      [3, 3],
      [4, 3],
      [2, 4],
      [3, 4],
      [4, 4],
    ],
    blocks: ['move', 'right', 'left', 'repeat'],
    max: 4,
  },
  {
    id: 'b6',
    title: { en: '6. If there\'s a wall…', vi: '6. Nếu gặp tường…' },
    idea: {
      en: '"repeat until 🍎" keeps going until the snake gets there. "if wall ahead" only runs its blocks when there\'s a wall in front. Together they solve any path like this one.',
      vi: '"repeat until 🍎" cứ lặp đến khi rắn tới nơi. "if wall ahead" chỉ chạy các khối bên trong khi có tường phía trước. Kết hợp lại sẽ giải được mọi đường như thế này.',
    },
    cols: 7,
    rows: 7,
    start: { x: 0, y: 0, dir: 0 },
    goal: { x: 6, y: 6 },
    walls: [
      [0, 1],
      [1, 1],
      [2, 1],
      [3, 1],
      [4, 1],
      [5, 1],
    ],
    blocks: ['move', 'right', 'until', 'ifWall'],
    max: 4,
  },
];

export const LABEL: Record<BlockKind, { en: string; emoji: string; color: string }> = {
  move: { en: 'move', emoji: '⬆️', color: '#4b8fe2' },
  left: { en: 'turn left', emoji: '↶', color: '#8b5cf6' },
  right: { en: 'turn right', emoji: '↷', color: '#8b5cf6' },
  repeat: { en: 'repeat', emoji: '🔁', color: '#f59e0b' },
  until: { en: 'repeat until 🍎', emoji: '🔁', color: '#e8584a' },
  ifWall: { en: 'if wall ahead', emoji: '🧱', color: '#2f8a3a' },
};

export const newBlock = (t: BlockKind): Block => (t === 'repeat' ? { t, n: 3, body: [] } : t === 'until' || t === 'ifWall' ? { t, body: [] } : { t });

export const countBlocks = (bs: Block[]): number => bs.reduce((n, b) => n + 1 + ('body' in b ? countBlocks(b.body) : 0), 0);

export interface Step {
  x: number;
  y: number;
  dir: Dir;
}

export interface RunResult {
  steps: Step[];
  /** 'win' at the apple, 'crash' into a wall or the edge, 'short' stopped before the apple, 'loop' ran too long. */
  end: 'win' | 'crash' | 'short' | 'loop';
}

/** Runs a block program on a puzzle: every position along the way. */
export function runProgram(p: Puzzle, prog: Block[]): RunResult {
  const walls = new Set(p.walls.map(([x, y]) => `${x},${y}`));
  let s: Step = { ...p.start };
  const steps: Step[] = [s];
  const blocked = (x: number, y: number) => x < 0 || y < 0 || x >= p.cols || y >= p.rows || walls.has(`${x},${y}`);
  const ahead = () => blocked(s.x + STEP[s.dir][0], s.y + STEP[s.dir][1]);
  const atGoal = () => s.x === p.goal.x && s.y === p.goal.y;
  let budget = 300;
  class Stop extends Error {
    constructor(readonly why: 'crash' | 'loop') {
      super(why);
    }
  }
  const exec = (bs: Block[]) => {
    for (const b of bs) {
      if (--budget < 0) throw new Stop('loop');
      if (b.t === 'move') {
        const nx = s.x + STEP[s.dir][0];
        const ny = s.y + STEP[s.dir][1];
        if (blocked(nx, ny)) throw new Stop('crash');
        s = { ...s, x: nx, y: ny };
        steps.push(s);
      } else if (b.t === 'left' || b.t === 'right') {
        s = { ...s, dir: ((s.dir + (b.t === 'right' ? 1 : 3)) % 4) as Dir };
        steps.push(s);
      } else if (b.t === 'repeat') for (let i = 0; i < b.n; i++) exec(b.body);
      else if (b.t === 'until') {
        while (!atGoal()) {
          if (--budget < 0) throw new Stop('loop');
          exec(b.body);
        }
      } else if (b.t === 'ifWall' && ahead()) exec(b.body);
    }
  };
  try {
    exec(prog);
  } catch (e) {
    if (e instanceof Stop) return { steps, end: e.why };
    throw e;
  }
  return { steps, end: atGoal() ? 'win' : 'short' };
}

/** The same program as real code. */
export function toCode(prog: Block[], lang: 'js' | 'py'): string {
  const out: string[] = [];
  const pad = (d: number) => (lang === 'js' ? '  ' : '    ').repeat(d);
  const walk = (bs: Block[], d: number) => {
    if (!bs.length && lang === 'py' && d > 0) out.push(`${pad(d)}pass`);
    for (const b of bs) {
      if (b.t === 'move') out.push(`${pad(d)}${lang === 'js' ? 'moveForward();' : 'move_forward()'}`);
      else if (b.t === 'left') out.push(`${pad(d)}${lang === 'js' ? 'turnLeft();' : 'turn_left()'}`);
      else if (b.t === 'right') out.push(`${pad(d)}${lang === 'js' ? 'turnRight();' : 'turn_right()'}`);
      else {
        const head =
          b.t === 'repeat'
            ? lang === 'js'
              ? `for (let i = 0; i < ${b.n}; i++) {`
              : `for i in range(${b.n}):`
            : b.t === 'until'
              ? lang === 'js'
                ? 'while (!atApple()) {'
                : 'while not at_apple():'
              : lang === 'js'
                ? 'if (wallAhead()) {'
                : 'if wall_ahead():';
        out.push(pad(d) + head);
        walk(b.body, d + 1);
        if (lang === 'js') out.push(`${pad(d)}}`);
      }
    }
  };
  walk(prog, 0);
  return out.join('\n');
}
