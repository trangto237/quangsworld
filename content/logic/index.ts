import { makeBank, type ConceptSeed } from '../helpers';
import type { Generator } from '../math/generators';

export const logicConcepts: ConceptSeed[] = [
  {
    id: 'logic.patterns',
    domain: 'Pattern recognition',
    skill: 'Patterns',
    name: 'Number patterns',
    missionName: 'Pattern Maze',
    description: 'Arithmetic, geometric and mixed sequences.',
    lesson: 'Look at the differences between terms. If differences are not constant, look at ratios or the differences of differences.',
  },
  {
    id: 'logic.deduction',
    domain: 'Deduction',
    skill: 'Deduction',
    name: 'Deductive reasoning',
    missionName: 'Detective Guild',
    description: 'Drawing certain conclusions from given facts.',
    lesson: '"All A are B" does NOT mean "all B are A". Only conclude what must be true.',
  },
  {
    id: 'logic.spatial',
    domain: 'Spatial reasoning',
    skill: 'Spatial',
    name: 'Spatial reasoning',
    missionName: 'Rotation Chamber',
    description: 'Rotations, nets of cubes, directions.',
    lesson: 'Rotate step by step. Turning right 90° four times brings you back to the start.',
  },
  {
    id: 'logic.chess',
    domain: 'Chess puzzles',
    skill: 'Chess',
    name: 'Chess tactics',
    missionName: 'Grandmaster Hall',
    description: 'Piece movement, forks, checkmate patterns.',
    lesson: 'Checks, captures, threats — look at forcing moves first.',
  },
  {
    id: 'logic.sequence',
    domain: 'Sequence',
    skill: 'Ordering',
    name: 'Ordering puzzles',
    missionName: 'Race of Riddles',
    description: 'Arranging people or objects from clues.',
    lesson: 'Draw a line and place the certain facts first. Then test the remaining options.',
  },
];

const { add, list } = makeBank('Atlas original');

const L = 'logic.patterns';
add(L, 1, 'What comes next? 2, 4, 6, 8, ?', ['10', '12', '9', '16']);
add(L, 2, 'What comes next? 3, 6, 12, 24, ?', ['48', '36', '30', '27']);
add(L, 3, 'What comes next? 1, 4, 9, 16, 25, ?', ['36', '30', '35', '49']);
add(L, 3, 'What comes next? 1, 1, 2, 3, 5, 8, ?', ['13', '11', '12', '16']);
add(L, 4, 'What comes next? 2, 6, 12, 20, 30, ?', ['42', '40', '36', '44'], { explanation: 'Differences: 4, 6, 8, 10, 12.' });
add(L, 5, 'What comes next? 1, 2, 6, 24, 120, ?', ['720', '240', '600', '144'], { explanation: 'Multiply by 2, 3, 4, 5, 6.' });
add(L, 5, 'What comes next? 3, 5, 9, 17, 33, ?', ['65', '49', '66', '64'], { explanation: 'Each term is double the previous minus 1.' });

const D = 'logic.deduction';
add(D, 1, 'All cats have tails. Tom is a cat. So…', ['Tom has a tail.', 'Tom is black.', 'All tails are cats.', 'Tom has no tail.']);
add(D, 2, 'If it rains, the ground gets wet. The ground is dry. So…', ['It did not rain.', 'It rained.', 'It will rain.', 'We cannot know anything.']);
add(D, 3, 'All knights are brave. Some brave people are chess players. Which MUST be true?', ['None of these must be true.', 'Some knights play chess.', 'All chess players are knights.', 'No knight plays chess.']);
add(D, 3, 'Anna is taller than Binh. Binh is taller than Chi. Who is shortest?', ['Chi', 'Anna', 'Binh', 'Cannot tell']);
add(D, 4, 'Exactly one box has gold. Box 1 says "The gold is here." Box 2 says "The gold is not here." Box 3 says "The gold is not in box 1." Only ONE label is true. Where is the gold?', ['Box 2', 'Box 1', 'Box 3', 'Cannot tell'], {
  explanation: 'Gold in box 2: label 1 false, label 2 false, label 3 true → exactly one true. The other boxes give two true labels.',
});
add(D, 5, 'Knights always tell the truth, knaves always lie. A says: "B is a knave." B says: "We are both knights." What is A?', ['A knight', 'A knave', 'Cannot tell', 'Both are knaves'], {
  explanation: 'If B were a knight, "we are both knights" would make A a knight who calls B a knave — contradiction. So B is a knave, A tells the truth.',
});

const Sp = 'logic.spatial';
add(Sp, 1, 'You face North and turn right 90°. Which way do you face?', ['East', 'West', 'South', 'North']);
add(Sp, 2, 'You face East and turn around (180°). Which way do you face?', ['West', 'North', 'South', 'East']);
add(Sp, 3, 'You face North, turn right, turn right, then turn left. Which way?', ['East', 'South', 'West', 'North']);
add(Sp, 3, 'How many faces does a cube have?', ['6', '8', '4', '12']);
add(Sp, 4, 'How many edges does a cube have?', ['12', '8', '6', '10']);
add(Sp, 4, 'The letter "b" is reflected in a vertical mirror. What do you see?', ['d', 'p', 'q', 'b']);
add(Sp, 5, 'A 3×3×3 cube is painted on the outside, then cut into 27 small cubes. How many small cubes have exactly 2 painted faces?', ['12', '8', '6', '24']);

const Ch = 'logic.chess';
add(Ch, 1, 'Which chess piece moves in an "L" shape?', ['Knight', 'Bishop', 'Rook', 'King']);
add(Ch, 1, 'Which piece can only move diagonally?', ['Bishop', 'Rook', 'Knight', 'Pawn']);
add(Ch, 2, 'A knight on b1 (start position) can move to…', ['a3 or c3 (or d2 if empty)', 'b3', 'c2', 'b2']);
add(Ch, 3, 'A move that attacks two enemy pieces at once is called a…', ['fork', 'pin', 'castle', 'stalemate']);
add(Ch, 3, 'How many squares are on a chessboard?', ['64', '32', '81', '100']);
add(Ch, 4, 'The king is not in check but has no legal moves, and no other piece can move. This is…', ['stalemate', 'checkmate', 'a draw by repetition', 'a fork']);
add(Ch, 4, 'A piece that cannot move because it would expose its king is…', ['pinned', 'forked', 'promoted', 'castled']);
add(Ch, 5, 'White: Kg1, Rook a1. Black: Kg8, pawns f7 g7 h7. White to move. Best move?', ['Ra8# (back-rank mate)', 'Kf2', 'Ra7', 'Rf1'], {
  explanation: 'The black king is trapped by its own pawns — a classic back-rank mate.',
});

const Se = 'logic.sequence';
add(Se, 2, 'Mai finished before Hoa. Hoa finished before Long. Who came first?', ['Mai', 'Hoa', 'Long', 'Cannot tell']);
add(Se, 3, 'Five books on a shelf: A is left of B, C is right of B, D is at the far left, E is at the far right. What is in the middle?', ['B', 'A', 'C', 'D']);
add(Se, 4, 'In a race: Phong is not first or last. Quan is right after Phong. Ly is first. Tam is not second. There are 4 runners (Phong, Quan, Ly, Tam). Who is last?', ['Tam', 'Quan', 'Phong', 'Ly']);
add(Se, 5, 'Four friends sit in a row. Nga is not next to Tuan. Tuan is at one end. Vy is between Nga and Kha. Kha is next to Tuan. Who sits at the other end?', ['Nga', 'Vy', 'Kha', 'Tuan'], {
  explanation: 'Tuan – Kha – Vy – Nga.',
});

export const logicQuestions = list;

/** Generated arithmetic/geometric sequences keep pattern practice fresh. */
export const logicGenerators: Record<string, Generator> = {
  'logic.patterns': (d, r) => {
    const start = 1 + Math.floor(r() * 9);
    const step = 2 + Math.floor(r() * (d + 3));
    const seq: number[] = [start];
    const geometric = d >= 3 && r() < 0.5;
    const k = 2 + Math.floor(r() * 2);
    for (let i = 1; i < 6; i++) seq.push(geometric ? seq[i - 1] * k : d >= 4 ? seq[i - 1] + step + i : seq[i - 1] + step);
    const ans = seq.pop()!;
    const s = new Set([ans + 1, ans - step, ans + step].filter((v) => v !== ans).map(String));
    let pad = 2;
    while (s.size < 3) s.add(String(ans + pad++));
    return { prompt: `What comes next? ${seq.join(', ')}, ?`, answer: String(ans), distractors: [...s].slice(0, 3) };
  },
};
