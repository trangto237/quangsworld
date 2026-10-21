import { bi, cells, has, type Bi, type Lesson } from './lessons';
import type { SandboxState } from './runtime';
import { compareDrawings, trace, type Turtle } from './turtle';

/**
 * Two more courses for the Code Lab, each in JavaScript and Python:
 *  - 🐞 Fix the bug: a program that almost works. Run it, read the error or watch what goes wrong, fix it.
 *  - 🐢 Drawing: turtle graphics — shapes from forward/right, loops, functions and loops inside loops.
 */

const maxY = (s?: SandboxState) => Math.max(...(s ? cells(s).map(([, y]) => y) : [0]), 0);

// ── 🐞 Fix the bug ────────────────────────────────────────────

const SNAKE_KEYS = (downJs: string, extraJs = '', downPy = '    if key == "down": direction = [0, 1]', pyGlobal = '    global direction\n') => ({
  js: `grid(20, 20);
let snake = [[5, 5], [4, 5], [3, 5]];
let dir = [1, 0];

onKey((key) => {
  if (key === "up") dir = [0, -1];
  ${downJs}
  if (key === "right") dir = [1, 0];${extraJs}
});

every(200, () => {
  const head = [snake[0][0] + dir[0], snake[0][1] + dir[1]];
  snake.unshift(head);
  snake.pop();
  clear();
  for (const [x, y] of snake) cell(x, y, "lime");
});
`,
  py: `grid(20, 20)
snake = [[5, 5], [4, 5], [3, 5]]
direction = [1, 0]

def turn(key):
${pyGlobal}    if key == "up": direction = [0, -1]
${downPy}
    if key == "left": direction = [-1, 0]
    if key == "right": direction = [1, 0]

on_key(turn)

def tick():
    head = [snake[0][0] + direction[0], snake[0][1] + direction[1]]
    snake.insert(0, head)
    snake.pop()
    clear()
    for x, y in snake:
        cell(x, y, "lime")

every(200, tick)
`,
});

const pressDown = {
  wait: 1600,
  key: { at: 500, key: 'down' as const },
  test: (s: SandboxState, _code: string, before?: SandboxState): Bi | null => (maxY(s) > maxY(before) ? null : bi('Pressing ↓ still doesn\'t make the snake go down.', 'Bấm ↓ rắn vẫn chưa đi xuống.')),
};

export const BUGS: Lesson[] = [
  {
    id: 'bug-comma',
    title: bi('1. Read the error', '1. Đọc thông báo lỗi'),
    learn: bi(
      'Programs often don\'t run at all because of one tiny typo. Press ▶ Run and read the red error message: it tells you what the computer expected. Professional programmers read errors all day!',
      'Chương trình thường không chạy chỉ vì một lỗi đánh máy nhỏ. Bấm ▶ Chạy và đọc thông báo lỗi màu đỏ: nó cho biết máy tính đang chờ điều gì. Lập trình viên chuyên nghiệp đọc lỗi cả ngày!',
    ),
    task: bi('This should paint a green square at (5, 5), but it won\'t run. Fix it.', 'Chương trình này phải tô một ô xanh tại (5, 5) nhưng không chạy được. Hãy sửa nó.'),
    starter: { js: `grid(20, 20);\ncell(5, 5 "green");\n`, py: `grid(20, 20)\ncell(5, 5 "green")\n` },
    hint: bi('Look between the 5 and "green". Each value needs a comma between it and the next one.', 'Nhìn giữa số 5 và "green". Các giá trị phải cách nhau bằng dấu phẩy.'),
    check: { wait: 600, test: (s) => (has(s, 5, 5) ? null : bi('No green square at (5, 5) yet.', 'Chưa có ô xanh ở (5, 5).')) },
  },
  {
    id: 'bug-one-more',
    title: bi('2. One too many', '2. Thừa một ô'),
    learn: bi(
      'The most common bug in the world: a loop that runs one time too many (or too few). Count how many times the loop really runs — i starts at 0!',
      'Lỗi phổ biến nhất thế giới: vòng lặp chạy thừa (hoặc thiếu) một lần. Đếm xem vòng lặp thực sự chạy mấy lần — i bắt đầu từ 0!',
    ),
    task: bi('This should draw exactly 5 squares, from (2, 10) to (6, 10). It draws 6. Fix the loop.', 'Chương trình phải vẽ đúng 5 ô, từ (2, 10) đến (6, 10). Nó vẽ 6 ô. Sửa vòng lặp.'),
    starter: { js: `grid(20, 20);\nfor (let i = 0; i <= 5; i++) {\n  cell(2 + i, 10, "green");\n}\n`, py: `grid(20, 20)\nfor i in range(6):\n    cell(2 + i, 10, "green")\n` },
    hint: bi('i <= 5 runs for 0, 1, 2, 3, 4, 5 — six times. Use i < 5.', 'range(6) cho 0, 1, 2, 3, 4, 5 — sáu lần. Dùng range(5).'),
    hintBy: { py: bi('range(6) gives 0, 1, 2, 3, 4, 5 — six numbers. Use range(5).', 'range(6) cho 0, 1, 2, 3, 4, 5 — sáu số. Dùng range(5).') },
    check: {
      wait: 600,
      test: (s) =>
        ![2, 3, 4, 5, 6].every((x) => has(s, x, 10)) ? bi('The five squares (2…6, 10) should all be there.', 'Phải có đủ năm ô (2…6, 10).') : has(s, 7, 10) ? bi('There\'s still a sixth square at (7, 10).', 'Vẫn còn ô thứ sáu ở (7, 10).') : null,
    },
  },
  {
    id: 'bug-upside-down',
    title: bi('3. Upside down', '3. Lộn ngược'),
    learn: bi(
      'A bug can run without any error and still do the wrong thing. Run the game, press the keys, and watch what really happens. Remember: on the screen, y gets bigger going DOWN.',
      'Có lỗi chạy không báo gì nhưng vẫn làm sai. Chạy trò chơi, bấm phím và quan sát điều thực sự xảy ra. Nhớ rằng: trên màn hình, y càng lớn thì càng ở DƯỚI.',
    ),
    task: bi('Pressing ↓ makes the snake go up. Find the line and fix it.', 'Bấm ↓ thì rắn lại đi lên. Tìm dòng sai và sửa.'),
    starter: SNAKE_KEYS('if (key === "down") dir = [0, -1];', '\n  if (key === "left") dir = [-1, 0];', '    if key == "down": direction = [0, -1]'),
    hint: bi('Going down means y + 1, so down is [0, 1].', 'Đi xuống là y + 1, nên down là [0, 1].'),
    check: pressDown,
  },
  {
    id: 'bug-sneaky',
    title: bi('4. The sneaky one', '4. Lỗi khó thấy'),
    learn: bi(
      'In JavaScript, = puts a value in a variable, but === compares two values. if (key = "left") doesn\'t compare anything: it sets key to "left", which counts as true — every time!',
      'Trong JavaScript, = gán giá trị cho biến, còn === mới là so sánh. if (key = "left") không so sánh gì: nó gán "left" cho key, và điều đó luôn được coi là đúng — lần nào cũng vậy!',
    ),
    learnBy: {
      py: bi(
        'In Python, a function that changes a variable from outside must say global first. Without it, Python makes a new variable that only lives inside the function — and the real one never changes.',
        'Trong Python, hàm muốn thay đổi biến bên ngoài phải khai báo global trước. Không có nó, Python tạo một biến mới chỉ sống trong hàm — và biến thật không hề thay đổi.',
      ),
    },
    task: bi('Pressing ↓ doesn\'t make the snake go down. There is no error message. Find the bug.', 'Bấm ↓ rắn không đi xuống, cũng không có thông báo lỗi. Tìm lỗi.'),
    starter: (() => {
      const js = SNAKE_KEYS('if (key === "down") dir = [0, 1];', '\n  if (key = "left") dir = [-1, 0];').js;
      const py = SNAKE_KEYS('', '', '    if key == "down": direction = [0, 1]', '').py;
      return { js, py };
    })(),
    hint: bi('Look at every if line: one of them uses = instead of ===.', 'Xem từng dòng if: có một dòng dùng = thay vì ===.'),
    hintBy: { py: bi('turn() changes direction — what must it say on its first line?', 'turn() thay đổi direction — dòng đầu tiên của nó phải có gì?') },
    check: pressDown,
  },
  {
    id: 'bug-never-ends',
    title: bi('5. The game never ends', '5. Trò chơi không bao giờ kết thúc'),
    learn: bi(
      '&& (Python: and) means BOTH must be true; || (Python: or) means AT LEAST ONE. Can x be smaller than 0 and bigger than 19 at the same time?',
      '&& (Python: and) nghĩa là CẢ HAI phải đúng; || (Python: or) nghĩa là ÍT NHẤT MỘT. x có thể vừa nhỏ hơn 0 vừa lớn hơn 19 cùng lúc không?',
    ),
    task: bi('The snake should crash into the right wall and the game should end. It just disappears. Fix the check.', 'Rắn phải đâm vào tường phải và trò chơi kết thúc. Nhưng nó cứ biến mất. Sửa điều kiện.'),
    starter: {
      js: `grid(20, 20);\nlet snake = [[14, 10], [13, 10], [12, 10]];\nlet dir = [1, 0];\n\nevery(150, () => {\n  const head = [snake[0][0] + dir[0], snake[0][1] + dir[1]];\n  if (head[0] < 0 && head[0] >= 20) return gameOver("Ouch!");\n  snake.unshift(head);\n  snake.pop();\n  clear();\n  for (const [x, y] of snake) cell(x, y, "lime");\n});\n`,
      py: `grid(20, 20)\nsnake = [[14, 10], [13, 10], [12, 10]]\ndirection = [1, 0]\n\ndef tick():\n    head = [snake[0][0] + direction[0], snake[0][1] + direction[1]]\n    if head[0] < 0 and head[0] >= 20:\n        game_over("Ouch!")\n        return\n    snake.insert(0, head)\n    snake.pop()\n    clear()\n    for x, y in snake:\n        cell(x, y, "lime")\n\nevery(150, tick)\n`,
    },
    hint: bi('Change && to || — the head is out if it is too far left OR too far right.', 'Đổi and thành or — đầu rắn ra ngoài nếu quá trái HOẶC quá phải.'),
    check: { wait: 1800, test: (s) => (s.over ? null : bi('The game still doesn\'t end at the wall.', 'Trò chơi vẫn chưa kết thúc khi chạm tường.')) },
  },
  {
    id: 'bug-score',
    title: bi('6. The stuck score', '6. Điểm không tăng'),
    learn: bi(
      'points + 1 works out a new number… and throws it away. To change the variable you must store the result: points = points + 1, or the short ways points++ (JavaScript) and points += 1 (Python).',
      'points + 1 tính ra một số mới… rồi bỏ đi. Muốn đổi biến thì phải lưu kết quả: points = points + 1, hoặc viết gọn points++ (JavaScript), points += 1 (Python).',
    ),
    task: bi('The food is right in front of the snake. When it eats, the score should become 1 — but it stays 0.', 'Thức ăn ở ngay trước mặt rắn. Khi ăn, điểm phải thành 1 — nhưng vẫn là 0.'),
    starter: {
      js: `grid(20, 20);\nlet snake = [[5, 10], [4, 10], [3, 10]];\nlet food = [8, 10];\nlet points = 0;\nscore(points);\n\nevery(200, () => {\n  const head = [snake[0][0] + 1, snake[0][1]];\n  snake.unshift(head);\n  if (head[0] === food[0] && head[1] === food[1]) {\n    points + 1;\n    score(points);\n    food = [random(20), random(20)];\n  } else {\n    snake.pop();\n  }\n  clear();\n  cell(food[0], food[1], "red");\n  for (const [x, y] of snake) cell(x, y, "lime");\n});\n`,
      py: `grid(20, 20)\nsnake = [[5, 10], [4, 10], [3, 10]]\nfood = [8, 10]\npoints = 0\nscore(points)\n\ndef tick():\n    global food, points\n    head = [snake[0][0] + 1, snake[0][1]]\n    snake.insert(0, head)\n    if head == food:\n        points + 1\n        score(points)\n        food = [random(20), random(20)]\n    else:\n        snake.pop()\n    clear()\n    cell(food[0], food[1], "red")\n    for x, y in snake:\n        cell(x, y, "lime")\n\nevery(200, tick)\n`,
    },
    hint: bi('Change points + 1 to points++ (or points = points + 1).', 'Đổi points + 1 thành points += 1.'),
    check: { wait: 1500, test: (s) => ((s.score ?? 0) >= 1 ? null : bi('The score is still 0 after the snake eats.', 'Điểm vẫn là 0 sau khi rắn ăn.')) },
  },
];

// ── 🐢 Drawing ────────────────────────────────────────────────

const repeat = (n: number, f: (i: number) => void) => {
  for (let i = 0; i < n; i++) f(i);
};
const poly = (t: Turtle, sides: number, len: number) => repeat(sides, () => (t.forward(len), t.right(360 / sides)));

const shapeCheck = (target: (t: Turtle) => void, name: Bi) => {
  const want = trace(target);
  return {
    wait: 1500,
    test: (s: SandboxState): Bi | null => {
      if (!s.lines.length) return bi('Nothing was drawn yet — use forward().', 'Chưa vẽ gì — hãy dùng forward().');
      const { missing, extra } = compareDrawings(s.lines, want);
      if (!missing && !extra) return null;
      return bi(
        `Not quite ${name.en} yet: ${missing ? `${missing} line${missing > 1 ? 's' : ''} missing` : ''}${missing && extra ? ', ' : ''}${extra ? `${extra} line${extra > 1 ? 's' : ''} in the wrong place` : ''}. Check the lengths and the angles.`,
        `Chưa đúng ${name.vi}: ${missing ? `thiếu ${missing} nét` : ''}${missing && extra ? ', ' : ''}${extra ? `${extra} nét sai chỗ` : ''}. Kiểm tra độ dài và góc quay.`,
      );
    },
  };
};

export const DRAWING: Lesson[] = [
  {
    id: 'draw-square',
    title: bi('1. Meet the turtle', '1. Làm quen chú rùa'),
    learn: bi(
      'The turtle walks on the page and draws a line wherever it goes. forward(100) walks 100 steps; right(90) turns a quarter of a circle (90°) to the right. It starts in the middle, facing right.',
      'Chú rùa bò trên trang giấy và vẽ một nét ở mọi nơi nó đi qua. forward(100) bò 100 bước; right(90) quay sang phải một phần tư vòng (90°). Rùa bắt đầu ở giữa, quay mặt sang phải.',
    ),
    task: bi('Finish the square: 4 sides of 100, turning right 90° after each side.', 'Vẽ nốt hình vuông: 4 cạnh dài 100, sau mỗi cạnh quay phải 90°.'),
    starter: { js: `forward(100);\nright(90);\n// three more sides…\n`, py: `forward(100)\nright(90)\n# three more sides…\n` },
    hint: bi('Repeat the two lines three more times.', 'Lặp lại hai dòng đó thêm ba lần.'),
    check: shapeCheck((t) => poly(t, 4, 100), bi('a square', 'hình vuông')),
  },
  {
    id: 'draw-triangle',
    title: bi('2. Loops make it short', '2. Vòng lặp cho gọn'),
    learn: bi(
      'Four copies of the same two lines? That\'s what loops are for. And a turtle that walks all the way round a shape always turns 360° in total — so each turn of a triangle is 360 ÷ 3.',
      'Bốn lần cùng hai dòng lệnh? Đó là lúc dùng vòng lặp. Rùa đi hết một vòng quanh hình thì tổng các lần quay luôn là 360° — nên mỗi góc quay của tam giác là 360 ÷ 3.',
    ),
    task: bi('Fix the angle so the loop draws a triangle with sides of 120.', 'Sửa góc quay để vòng lặp vẽ được tam giác có cạnh 120.'),
    starter: { js: `for (let i = 0; i < 3; i++) {\n  forward(120);\n  right(90); // ← what angle?\n}\n`, py: `for i in range(3):\n    forward(120)\n    right(90)  # ← what angle?\n` },
    hint: bi('360 ÷ 3 = 120.', '360 ÷ 3 = 120.'),
    check: shapeCheck((t) => poly(t, 3, 120), bi('a triangle', 'tam giác')),
  },
  {
    id: 'draw-star',
    title: bi('3. A star', '3. Ngôi sao'),
    learn: bi(
      'A five-point star is like a pentagon where the turtle turns twice as far each time: it goes round the middle twice, so the turns add up to 720°. 720 ÷ 5 = …?',
      'Ngôi sao năm cánh giống hình ngũ giác nhưng mỗi lần rùa quay gấp đôi: nó đi quanh tâm hai vòng, nên tổng góc quay là 720°. 720 ÷ 5 = …?',
    ),
    task: bi('This draws a pentagon. Change one number so it draws a star with lines of 150.', 'Chương trình này vẽ hình ngũ giác. Đổi một con số để nó vẽ ngôi sao có nét dài 150.'),
    starter: { js: `color("gold");\nfor (let i = 0; i < 5; i++) {\n  forward(150);\n  right(72);\n}\n`, py: `color("gold")\nfor i in range(5):\n    forward(150)\n    right(72)\n` },
    hint: bi('720 ÷ 5 = 144.', '720 ÷ 5 = 144.'),
    check: shapeCheck((t) => repeat(5, () => (t.forward(150), t.right(144))), bi('a star', 'ngôi sao')),
  },
  {
    id: 'draw-function',
    title: bi('4. Your own command', '4. Lệnh của riêng em'),
    learn: bi(
      'A function is a new command you make yourself. polygon(sides, length) can draw ANY regular shape: walk length, turn 360 / sides, and repeat that sides times.',
      'Hàm là một lệnh mới do em tự tạo. polygon(sides, length) vẽ được MỌI đa giác đều: bò length bước, quay 360 / sides, lặp lại sides lần.',
    ),
    task: bi('Write the inside of polygon so that polygon(6, 80) draws a hexagon.', 'Viết phần bên trong hàm polygon để polygon(6, 80) vẽ được hình lục giác.'),
    starter: {
      js: `function polygon(sides, length) {\n  // a loop: forward(length), then turn right by 360 / sides\n}\n\npolygon(6, 80);\n`,
      py: `def polygon(sides, length):\n    # a loop: forward(length), then turn right by 360 / sides\n    pass\n\npolygon(6, 80)\n`,
    },
    hint: bi('for (let i = 0; i < sides; i++) { forward(length); right(360 / sides); }', 'for i in range(sides):\n        forward(length)\n        right(360 / sides)'),
    check: shapeCheck((t) => poly(t, 6, 80), bi('a hexagon', 'hình lục giác')),
  },
  {
    id: 'draw-spiral',
    title: bi('5. A spiral', '5. Hình xoắn ốc'),
    learn: bi(
      'The loop counter i can do more than count: use it inside the loop! If each line is 5 × i long, every line is a bit longer than the one before — and the square turns into a spiral.',
      'Biến đếm i không chỉ để đếm: hãy dùng nó bên trong vòng lặp! Nếu mỗi nét dài 5 × i, nét sau dài hơn nét trước một chút — hình vuông biến thành hình xoắn ốc.',
    ),
    task: bi('Make each line 5 × i long (i goes 1, 2, 3 … 40).', 'Cho mỗi nét dài 5 × i (i chạy 1, 2, 3 … 40).'),
    starter: {
      js: `color("violet");\nfor (let i = 1; i <= 40; i++) {\n  forward(10);\n  right(90);\n}\n`,
      py: `color("violet")\nfor i in range(1, 41):\n    forward(10)\n    right(90)\n`,
    },
    hint: bi('forward(5 * i)', 'forward(5 * i)'),
    check: shapeCheck((t) => {
      for (let i = 1; i <= 40; i++) (t.forward(5 * i), t.right(90));
    }, bi('the spiral', 'hình xoắn ốc')),
  },
  {
    id: 'draw-flower',
    title: bi('6. Loops inside loops: a flower', '6. Vòng lặp lồng nhau: bông hoa'),
    learn: bi(
      'Draw a square, turn a little, draw another square… Repeat a shape while turning and you get a flower. The loop that draws a square sits inside the loop that turns: loops inside loops.',
      'Vẽ một hình vuông, quay một chút, vẽ hình vuông khác… Lặp lại một hình trong khi xoay, em được một bông hoa. Vòng lặp vẽ hình vuông nằm bên trong vòng lặp xoay: vòng lặp lồng nhau.',
    ),
    task: bi('Draw 12 squares of side 80, turning right 30° after each one.', 'Vẽ 12 hình vuông cạnh 80, sau mỗi hình quay phải 30°.'),
    starter: {
      js: `function square(size) {\n  for (let i = 0; i < 4; i++) {\n    forward(size);\n    right(90);\n  }\n}\n\ncolor("hotpink");\nfor (let k = 0; k < 12; k++) {\n  square(80);\n  // turn a little before the next square\n}\n`,
      py: `def square(size):\n    for i in range(4):\n        forward(size)\n        right(90)\n\ncolor("hotpink")\nfor k in range(12):\n    square(80)\n    # turn a little before the next square\n`,
    },
    hint: bi('right(30) after square(80). 12 × 30 = 360 — a full circle of squares.', 'right(30) sau square(80). 12 × 30 = 360 — đủ một vòng hình vuông.'),
    check: shapeCheck((t) => repeat(12, () => (poly(t, 4, 80), t.right(30))), bi('the flower', 'bông hoa')),
  },
];
