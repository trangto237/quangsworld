import type { Lang, SandboxState } from './runtime';

/**
 * "Build your own Snake": one course, the same steps in JavaScript and in Python. Each step adds one idea
 * (draw, variables, loops, lists, timers, keys, random, if, game over) to the game he is building, and is
 * checked by running his code in the sandbox.
 */

export type Bi = { en: string; vi: string };

export interface LessonCheck {
  /** Run this long before checking (ms). */
  wait: number;
  /** Press a key part-way (a state is taken just before, passed as `before`). */
  key?: { at: number; key: 'up' | 'down' | 'left' | 'right' };
  /** Null when it passes, else what's missing. */
  test: (s: SandboxState, code: string, before: SandboxState | undefined, lang: Lang) => Bi | null;
}

export interface Lesson {
  id: string;
  title: Bi;
  /** The idea, in two or three sentences. */
  learn: Bi;
  task: Bi;
  starter: Record<Lang, string>;
  hint: Bi;
  /** When the idea or hint differs between JavaScript and Python. */
  learnBy?: Partial<Record<Lang, Bi>>;
  hintBy?: Partial<Record<Lang, Bi>>;
  check: LessonCheck;
}

export const bi = (en: string, vi: string): Bi => ({ en, vi });
export const cells = (s: SandboxState) => Object.keys(s.board).map((k) => k.split(',').map(Number) as [number, number]);
export const has = (s: SandboxState, x: number, y: number) => !!s.board[`${x},${y}`];
const strip = (code: string, lang: Lang) => code.replace(lang === 'py' ? /#.*$/gm : /\/\/.*$|\/\*[\s\S]*?\*\//gm, '');

export const LESSONS: Lesson[] = [
  {
    id: 'cell',
    title: bi('1. Draw a square', '1. Vẽ một ô vuông'),
    learn: bi(
      'A program is a list of instructions the computer follows from top to bottom. The game screen is a grid; cell(x, y, color) paints one square. x counts from the left, y from the top, both starting at 0.',
      'Chương trình là danh sách lệnh máy tính làm lần lượt từ trên xuống. Màn hình trò chơi là một lưới; cell(x, y, color) tô một ô. x đếm từ trái sang, y từ trên xuống, đều bắt đầu từ 0.',
    ),
    task: bi('Paint a green square at x = 5, y = 5. Then press ▶ Run.', 'Tô một ô màu xanh lá tại x = 5, y = 5. Rồi bấm ▶ Chạy.'),
    starter: {
      js: `grid(20, 20);\n// Paint a green square at x = 5, y = 5:\ncell(0, 0, "green");\n`,
      py: `grid(20, 20)\n# Paint a green square at x = 5, y = 5:\ncell(0, 0, "green")\n`,
    },
    hint: bi('Change the two zeros to 5 and 5.', 'Đổi hai số 0 thành 5 và 5.'),
    check: { wait: 600, test: (s) => (has(s, 5, 5) ? null : bi('There is no square at (5, 5) yet.', 'Chưa có ô nào ở (5, 5).')) },
  },
  {
    id: 'vars',
    title: bi('2. Variables', '2. Biến'),
    learn: bi(
      'A variable is a name for a value, so you can use it and change it later. In JavaScript: let x = 8; — in Python: x = 8. The snake\'s head will live in two variables, x and y.',
      'Biến là một cái tên đặt cho một giá trị, để dùng và thay đổi về sau. JavaScript: let x = 8; — Python: x = 8. Đầu rắn sẽ nằm trong hai biến x và y.',
    ),
    task: bi('Set x to 8 and y to 4, and draw the head in yellow at (x, y).', 'Gán x = 8 và y = 4, rồi vẽ đầu rắn màu vàng tại (x, y).'),
    starter: {
      js: `grid(20, 20);\nlet x = 0;\nlet y = 0;\ncell(x, y, "yellow");\n`,
      py: `grid(20, 20)\nx = 0\ny = 0\ncell(x, y, "yellow")\n`,
    },
    hint: bi('Change only the numbers in the variables — keep cell(x, y, "yellow").', 'Chỉ đổi số trong các biến — giữ nguyên cell(x, y, "yellow").'),
    check: {
      wait: 600,
      test: (s, code) =>
        !has(s, 8, 4) ? bi('The head should be at (8, 4).', 'Đầu rắn phải ở (8, 4).') : /cell\(\s*8\s*,\s*4/.test(code) ? bi('Use the variables: cell(x, y, …).', 'Hãy dùng biến: cell(x, y, …).') : null,
    },
  },
  {
    id: 'loop',
    title: bi('3. Loops', '3. Vòng lặp'),
    learn: bi(
      'A loop repeats instructions. for (let i = 0; i < 5; i++) { … } in JavaScript, or for i in range(5): in Python, runs its block 5 times with i = 0, 1, 2, 3, 4.',
      'Vòng lặp lặp lại các lệnh. JavaScript: for (let i = 0; i < 5; i++) { … }, Python: for i in range(5): — chạy khối lệnh 5 lần với i = 0, 1, 2, 3, 4.',
    ),
    task: bi('Draw a row of 5 green squares from (2, 10) to (6, 10) using a loop — one cell() line only.', 'Vẽ một hàng 5 ô xanh từ (2, 10) đến (6, 10) bằng vòng lặp — chỉ một dòng cell().'),
    starter: {
      js: `grid(20, 20);\nfor (let i = 0; i < 5; i++) {\n  cell(i, 0, "green");\n}\n`,
      py: `grid(20, 20)\nfor i in range(5):\n    cell(i, 0, "green")\n`,
    },
    hint: bi('x should be 2 + i, and y should be 10.', 'x phải là 2 + i, còn y là 10.'),
    check: {
      wait: 600,
      test: (s, code) => {
        const ok = [2, 3, 4, 5, 6].every((x) => has(s, x, 10));
        if (!ok) return bi('Not all five squares (2…6, 10) are there.', 'Chưa đủ năm ô (2…6, 10).');
        return (code.match(/cell\(/g) ?? []).length > 1 ? bi('Use the loop: just one cell() line.', 'Dùng vòng lặp: chỉ một dòng cell().') : null;
      },
    },
  },
  {
    id: 'list',
    title: bi('4. Lists: the snake', '4. Danh sách: con rắn'),
    learn: bi(
      'A list (array) holds many values in order. Our snake is a list of [x, y] pairs — the head first. A loop can go through every item: for (const [x, y] of snake) in JavaScript, for x, y in snake: in Python.',
      'Danh sách (mảng) chứa nhiều giá trị theo thứ tự. Con rắn là danh sách các cặp [x, y] — đầu ở trước. Vòng lặp duyệt từng phần tử: JavaScript for (const [x, y] of snake), Python for x, y in snake:',
    ),
    task: bi('Draw every part of the snake in lime, then draw its head again in yellow.', 'Vẽ mọi phần của rắn màu "lime", rồi vẽ lại đầu rắn màu vàng.'),
    starter: {
      js: `grid(20, 20);\nlet snake = [[10, 10], [9, 10], [8, 10]];\n// Draw every part:\n\n// Then the head (snake[0]) in yellow:\n`,
      py: `grid(20, 20)\nsnake = [[10, 10], [9, 10], [8, 10]]\n# Draw every part:\n\n# Then the head (snake[0]) in yellow:\n`,
    },
    hint: bi('for (const [x, y] of snake) cell(x, y, "lime"); then cell(snake[0][0], snake[0][1], "yellow");', 'for x, y in snake: cell(x, y, "lime") rồi cell(snake[0][0], snake[0][1], "yellow")'),
    check: {
      wait: 600,
      test: (s) =>
        !(has(s, 10, 10) && has(s, 9, 10) && has(s, 8, 10))
          ? bi('All three parts of the snake should be drawn.', 'Cả ba phần của rắn phải được vẽ.')
          : !/yellow|#ff0|#ffff00/i.test(s.board['10,10'] ?? '')
            ? bi('The head (10, 10) should be yellow.', 'Đầu rắn (10, 10) phải màu vàng.')
            : null,
    },
  },
  {
    id: 'move',
    title: bi('5. Make it move', '5. Cho rắn bò'),
    learn: bi(
      'every(ms, fn) runs a function again and again — every 200 ms means 5 times a second. Each time: work out the new head, add it at the front (unshift / insert), remove the tail (pop), clear() the screen and draw again.',
      'every(ms, fn) chạy một hàm lặp đi lặp lại — every 200 ms là 5 lần mỗi giây. Mỗi lần: tính đầu mới, thêm vào đầu danh sách (unshift / insert), bỏ đuôi (pop), clear() màn hình rồi vẽ lại.',
    ),
    task: bi('Fill in tick() so the snake moves one square to the right each time.', 'Hoàn thành hàm tick() để rắn bò sang phải một ô mỗi lần.'),
    starter: {
      js: `grid(20, 20);\nlet snake = [[5, 10], [4, 10], [3, 10]];\n\nfunction tick() {\n  const head = [snake[0][0] + 1, snake[0][1]];\n  // 1. put head at the front:  snake.unshift(head);\n  // 2. remove the tail:        snake.pop();\n  clear();\n  for (const [x, y] of snake) cell(x, y, "lime");\n}\n\nevery(200, tick);\n`,
      py: `grid(20, 20)\nsnake = [[5, 10], [4, 10], [3, 10]]\n\ndef tick():\n    head = [snake[0][0] + 1, snake[0][1]]\n    # 1. put head at the front:  snake.insert(0, head)\n    # 2. remove the tail:        snake.pop()\n    clear()\n    for x, y in snake:\n        cell(x, y, "lime")\n\nevery(200, tick)\n`,
    },
    hint: bi('Remove the // or # in front of the two lines (and the words before the code).', 'Bỏ // hoặc # ở đầu hai dòng (và phần chữ trước câu lệnh).'),
    check: {
      wait: 1400,
      test: (s) => {
        const xs = cells(s).map(([x]) => x);
        return s.frames < 3 || Math.max(...xs, 0) < 8 ? bi("The snake isn't moving right yet.", 'Rắn chưa bò sang phải.') : null;
      },
    },
  },
  {
    id: 'keys',
    title: bi('6. Steer with the arrow keys', '6. Điều khiển bằng phím mũi tên'),
    learn: bi(
      'onKey(fn) (Python: on_key) calls your function with "up", "down", "left" or "right". Keep the direction in a variable and use if to change it. (In Python, a function that changes a variable outside it needs global.)',
      'onKey(fn) (Python: on_key) gọi hàm của em với "up", "down", "left" hoặc "right". Lưu hướng đi trong một biến và dùng if để đổi nó. (Trong Python, hàm muốn đổi biến bên ngoài cần khai báo global.)',
    ),
    task: bi('Finish turn(key) so all four arrow keys change the direction. Test it on the game screen!', 'Hoàn thành turn(key) để cả bốn phím mũi tên đổi hướng. Thử trên màn hình trò chơi!'),
    starter: {
      js: `grid(20, 20);\nlet snake = [[5, 10], [4, 10], [3, 10]];\nlet dir = [1, 0]; // right\n\nfunction turn(key) {\n  if (key === "up") dir = [0, -1];\n  // down, left, right…\n}\nonKey(turn);\n\nevery(200, () => {\n  const head = [snake[0][0] + dir[0], snake[0][1] + dir[1]];\n  snake.unshift(head);\n  snake.pop();\n  clear();\n  for (const [x, y] of snake) cell(x, y, "lime");\n});\n`,
      py: `grid(20, 20)\nsnake = [[5, 10], [4, 10], [3, 10]]\ndirection = [1, 0]  # right\n\ndef turn(key):\n    global direction\n    if key == "up":\n        direction = [0, -1]\n    # down, left, right…\n\non_key(turn)\n\ndef tick():\n    head = [snake[0][0] + direction[0], snake[0][1] + direction[1]]\n    snake.insert(0, head)\n    snake.pop()\n    clear()\n    for x, y in snake:\n        cell(x, y, "lime")\n\nevery(200, tick)\n`,
    },
    hint: bi('down is [0, 1], left is [-1, 0], right is [1, 0].', 'down là [0, 1], left là [-1, 0], right là [1, 0].'),
    check: {
      wait: 1600,
      key: { at: 500, key: 'down' },
      test: (s, code, before) => {
        const maxY = (st?: SandboxState) => Math.max(...(st ? cells(st).map(([, y]) => y) : [0]), 0);
        if (!(maxY(s) > maxY(before))) return bi('Pressing ↓ should make the snake go down.', 'Bấm ↓ thì rắn phải đi xuống.');
        return /["']left["']/.test(code) && /["']right["']/.test(code) ? null : bi('Add "left" and "right" too.', 'Thêm cả "left" và "right".');
      },
    },
  },
  {
    id: 'food',
    title: bi('7. Food, if, and score', '7. Thức ăn, if và điểm'),
    learn: bi(
      'random(20) gives a number from 0 to 19 — a random place for the food. if checks a condition: when the new head is on the food, add a point with score() and DON\'T remove the tail, so the snake grows.',
      'random(20) cho một số từ 0 đến 19 — vị trí ngẫu nhiên cho thức ăn. if kiểm tra điều kiện: khi đầu mới trùng thức ăn, cộng điểm bằng score() và KHÔNG bỏ đuôi, để rắn dài ra.',
    ),
    task: bi('Draw the food in red, and when the head reaches it: add a point, move the food, and let the snake grow.', 'Vẽ thức ăn màu đỏ; khi đầu rắn chạm vào: cộng điểm, đổi chỗ thức ăn và cho rắn dài ra.'),
    starter: {
      js: `grid(20, 20);\nlet snake = [[5, 10], [4, 10], [3, 10]];\nlet dir = [1, 0];\nlet food = [random(20), random(20)];\nlet points = 0;\n\nonKey((key) => {\n  if (key === "up") dir = [0, -1];\n  if (key === "down") dir = [0, 1];\n  if (key === "left") dir = [-1, 0];\n  if (key === "right") dir = [1, 0];\n});\n\nevery(200, () => {\n  const head = [snake[0][0] + dir[0], snake[0][1] + dir[1]];\n  snake.unshift(head);\n  if (head[0] === food[0] && head[1] === food[1]) {\n    // a point! (points++, score(points), new food)\n  } else {\n    snake.pop();\n  }\n  clear();\n  // draw the food in red here\n  for (const [x, y] of snake) cell(x, y, "lime");\n});\n`,
      py: `grid(20, 20)\nsnake = [[5, 10], [4, 10], [3, 10]]\ndirection = [1, 0]\nfood = [random(20), random(20)]\npoints = 0\n\ndef turn(key):\n    global direction\n    if key == "up": direction = [0, -1]\n    if key == "down": direction = [0, 1]\n    if key == "left": direction = [-1, 0]\n    if key == "right": direction = [1, 0]\n\non_key(turn)\n\ndef tick():\n    global food, points\n    head = [snake[0][0] + direction[0], snake[0][1] + direction[1]]\n    snake.insert(0, head)\n    if head == food:\n        pass  # a point! (points += 1, score(points), new food)\n    else:\n        snake.pop()\n    clear()\n    # draw the food in red here\n    for x, y in snake:\n        cell(x, y, "lime")\n\nevery(200, tick)\n`,
    },
    hint: bi('Food: cell(food[0], food[1], "red"). Point: points++; score(points); food = [random(20), random(20)];', 'Thức ăn: cell(food[0], food[1], "red"). Điểm: points += 1, score(points), food = [random(20), random(20)]'),
    check: {
      wait: 900,
      test: (s, code, _before, lang) => {
        const c = strip(code, lang);
        if (!Object.values(s.board).some((v) => /^red$|#f00\b|#ff0000/i.test(v))) return bi('Draw the food in "red".', 'Vẽ thức ăn màu "red".');
        if (!/score\(/.test(c)) return bi('Call score(points) when the snake eats.', 'Gọi score(points) khi rắn ăn.');
        return /random\(/.test(c.split(/score\(/)[1] ?? '') ? null : bi('Move the food to a new random place after eating.', 'Đổi thức ăn sang chỗ ngẫu nhiên mới sau khi ăn.');
      },
    },
  },
  {
    id: 'over',
    title: bi('8. Game over', '8. Kết thúc trò chơi'),
    learn: bi(
      'A game needs a way to lose. Use || (Python: or) to check several things at once: is the head outside the grid (x < 0, x >= 20, …)? Then call gameOver("…") (Python: game_over) — the snake stops.',
      'Trò chơi cần có lúc thua. Dùng || (Python: or) để kiểm tra nhiều điều cùng lúc: đầu rắn có ra ngoài lưới không (x < 0, x >= 20, …)? Thì gọi gameOver("…") (Python: game_over) — rắn dừng lại.',
    ),
    task: bi('End the game when the snake hits a wall. Let it run into the right wall to test.', 'Kết thúc trò chơi khi rắn đâm vào tường. Để rắn đâm vào tường phải để thử.'),
    starter: {
      js: `grid(20, 20);\nlet snake = [[14, 10], [13, 10], [12, 10]];\nlet dir = [1, 0];\n\nevery(150, () => {\n  const head = [snake[0][0] + dir[0], snake[0][1] + dir[1]];\n  // if the head is outside the grid → gameOver("Ouch!") and return\n\n  snake.unshift(head);\n  snake.pop();\n  clear();\n  for (const [x, y] of snake) cell(x, y, "lime");\n});\n`,
      py: `grid(20, 20)\nsnake = [[14, 10], [13, 10], [12, 10]]\ndirection = [1, 0]\n\ndef tick():\n    head = [snake[0][0] + direction[0], snake[0][1] + direction[1]]\n    # if the head is outside the grid → game_over("Ouch!") and return\n\n    snake.insert(0, head)\n    snake.pop()\n    clear()\n    for x, y in snake:\n        cell(x, y, "lime")\n\nevery(150, tick)\n`,
    },
    hint: bi('if (head[0] < 0 || head[1] < 0 || head[0] >= 20 || head[1] >= 20) return gameOver("Ouch!");', 'if head[0] < 0 or head[1] < 0 or head[0] >= 20 or head[1] >= 20: game_over("Ouch!"); return'),
    check: { wait: 1800, test: (s) => (s.over ? null : bi("The game didn't end when the snake hit the wall.", 'Trò chơi chưa kết thúc khi rắn đâm tường.')) },
  },
];

/** The finished game, for "My games" (and to peek at after the course). */
export const SNAKE: Record<Lang, string> = {
  js: `// Snake — arrow keys to steer.
grid(20, 20);
let snake = [[10, 10], [9, 10], [8, 10]];
let dir = [1, 0];
let food = [random(20), random(20)];
let points = 0;

onKey((key) => {
  if (key === "up" && dir[1] !== 1) dir = [0, -1];
  if (key === "down" && dir[1] !== -1) dir = [0, 1];
  if (key === "left" && dir[0] !== 1) dir = [-1, 0];
  if (key === "right" && dir[0] !== -1) dir = [1, 0];
});

every(150, () => {
  const head = [snake[0][0] + dir[0], snake[0][1] + dir[1]];
  if (head[0] < 0 || head[1] < 0 || head[0] >= 20 || head[1] >= 20) return gameOver("Ouch! Score: " + points);
  if (snake.some(([x, y]) => x === head[0] && y === head[1])) return gameOver("You bit yourself! Score: " + points);
  snake.unshift(head);
  if (head[0] === food[0] && head[1] === food[1]) {
    points++;
    score(points);
    food = [random(20), random(20)];
  } else {
    snake.pop();
  }
  clear();
  cell(food[0], food[1], "red");
  for (const [x, y] of snake) cell(x, y, "lime");
  cell(head[0], head[1], "yellow");
});
`,
  py: `# Snake — arrow keys to steer.
grid(20, 20)
snake = [[10, 10], [9, 10], [8, 10]]
direction = [1, 0]
food = [random(20), random(20)]
points = 0

def turn(key):
    global direction
    if key == "up" and direction[1] != 1: direction = [0, -1]
    if key == "down" and direction[1] != -1: direction = [0, 1]
    if key == "left" and direction[0] != 1: direction = [-1, 0]
    if key == "right" and direction[0] != -1: direction = [1, 0]

on_key(turn)

def tick():
    global food, points
    head = [snake[0][0] + direction[0], snake[0][1] + direction[1]]
    if head[0] < 0 or head[1] < 0 or head[0] >= 20 or head[1] >= 20:
        game_over("Ouch! Score: " + str(points))
        return
    if head in snake:
        game_over("You bit yourself! Score: " + str(points))
        return
    snake.insert(0, head)
    if head == food:
        points += 1
        score(points)
        food = [random(20), random(20)]
    else:
        snake.pop()
    clear()
    cell(food[0], food[1], "red")
    for x, y in snake:
        cell(x, y, "lime")
    cell(head[0], head[1], "yellow")

every(150, tick)
`,
};

const CATCH: Record<Lang, string> = {
  js: `// Catch the stars — move the basket with ← →.
grid(16, 20);
let basket = 7;
let star = [random(16), 0];
let points = 0;

onKey((key) => {
  if (key === "left" && basket > 0) basket--;
  if (key === "right" && basket < 13) basket++;
});

every(120, () => {
  star[1]++;
  if (star[1] === 19) {
    if (star[0] >= basket && star[0] < basket + 3) {
      points++;
      score(points);
    } else {
      return gameOver("Missed! Score: " + points);
    }
    star = [random(16), 0];
  }
  clear();
  cell(star[0], star[1], "gold");
  for (let i = 0; i < 3; i++) cell(basket + i, 19, "orange");
});
`,
  py: `# Catch the stars — move the basket with ← →.
grid(16, 20)
basket = 7
star = [random(16), 0]
points = 0

def move(key):
    global basket
    if key == "left" and basket > 0: basket -= 1
    if key == "right" and basket < 13: basket += 1

on_key(move)

def tick():
    global star, points
    star[1] += 1
    if star[1] == 19:
        if basket <= star[0] < basket + 3:
            points += 1
            score(points)
        else:
            game_over("Missed! Score: " + str(points))
            return
        star = [random(16), 0]
    clear()
    cell(star[0], star[1], "gold")
    for i in range(3):
        cell(basket + i, 19, "orange")

every(120, tick)
`,
};

/** "Turtle art" template for My games. */
const TURTLE_ART = {
  js: `// Turtle art — change the numbers and colours!\nconst colors = ["red", "orange", "gold", "lime", "deepskyblue", "violet"];\nfor (let i = 0; i < 36; i++) {\n  color(colors[i % colors.length]);\n  for (let k = 0; k < 6; k++) {\n    forward(70);\n    right(60);\n  }\n  right(10);\n}\n`,
  py: `# Turtle art — change the numbers and colours!\ncolors = ["red", "orange", "gold", "lime", "deepskyblue", "violet"]\nfor i in range(36):\n    color(colors[i % len(colors)])\n    for k in range(6):\n        forward(70)\n        right(60)\n    right(10)\n`,
};

const BLANK: Record<Lang, string> = {
  js: `// My game\ngrid(20, 20);\ntext("Hello!");\ncell(10, 10, "hotpink");\n`,
  py: `# My game\ngrid(20, 20)\ntext("Hello!")\ncell(10, 10, "hotpink")\n`,
};

export const TEMPLATES: { id: string; name: string; emoji: string; code: Record<Lang, string> }[] = [
  { id: 'blank', name: 'Blank game', emoji: '✨', code: BLANK },
  { id: 'snake', name: 'Snake', emoji: '🐍', code: SNAKE },
  { id: 'catch', name: 'Catch the stars', emoji: '⭐', code: CATCH },
  { id: 'turtle', name: 'Turtle art', emoji: '🐢', code: TURTLE_ART },
];

/** Library reference shown next to the editor. */
export const REFERENCE: Record<Lang, [string, string][]> = {
  js: [
    ['grid(w, h)', 'size of the board'],
    ['cell(x, y, "red")', 'paint a square'],
    ['clear()', 'wipe the board'],
    ['text("hi")', 'message at the top'],
    ['score(n)', 'show the score'],
    ['random(n)', 'number 0 … n-1'],
    ['every(ms, fn)', 'run fn again and again'],
    ['onKey(fn)', 'fn("up" / "down" / "left" / "right" / "space")'],
    ['gameOver("msg")', 'stop the game'],
    ['console.log(x)', 'print to the log'],
    ['forward(n) / backward(n)', 'turtle: walk and draw'],
    ['right(deg) / left(deg)', 'turtle: turn'],
    ['penUp() / penDown()', 'turtle: stop / start drawing'],
    ['color("red") / width(5)', 'turtle: pen colour and size'],
    ['goTo(x, y)', 'turtle: jump to a point (page is 400 × 400)'],
  ],
  py: [
    ['grid(w, h)', 'size of the board'],
    ['cell(x, y, "red")', 'paint a square'],
    ['clear()', 'wipe the board'],
    ['text("hi")', 'message at the top'],
    ['score(n)', 'show the score'],
    ['random(n)', 'number 0 … n-1'],
    ['every(ms, fn)', 'run fn again and again'],
    ['on_key(fn)', 'fn("up" / "down" / "left" / "right" / "space")'],
    ['game_over("msg")', 'stop the game'],
    ['print(x)', 'print to the log'],
    ['forward(n) / backward(n)', 'turtle: walk and draw'],
    ['right(deg) / left(deg)', 'turtle: turn'],
    ['pen_up() / pen_down()', 'turtle: stop / start drawing'],
    ['color("red") / width(5)', 'turtle: pen colour and size'],
    ['go_to(x, y)', 'turtle: jump to a point (page is 400 × 400)'],
  ],
};
