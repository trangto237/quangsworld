import type { Question } from '@atlas/shared';
import { isTypedAnswerCorrect } from '@atlas/shared';
import { PASSAGE_SETS, pickQuestion, promptKey, questionsInSet } from '@atlas/knowledge';

/**
 * Exam Hall: full mock papers in real exam formats.
 *
 * The Hà Nội grade-10 blueprint follows the usual structure of recent papers for regular public
 * schools (40 multiple-choice questions, 60 minutes, 0.25 points each). Section sizes live in this
 * one table so they can be matched to the official sample paper (đề minh họa) of the exam year.
 */

export type ExamSource =
  | {
      kind: 'concepts';
      concepts: string[];
      count: number;
      /** Difficulty of each question in turn (repeats); defaults to an easy-to-hard mix. Topics are then used in turn. */
      levels?: number[];
    }
  | { kind: 'set'; group: 'cloze' | 'hn-reading' | 'ielts-reading' }
  | { kind: 'listening-part'; part: 0 | 1 };

export interface ExamSectionDef {
  id: string;
  title: string;
  instructions: string;
  viInstructions: string;
  source: ExamSource;
}

export type ExamScoring = 'ten' | 'ielts-reading' | 'ielts-listening';

export type ExamSubject = 'english' | 'math' | 'literature';

export interface ExamBlueprint {
  id: string;
  subject: ExamSubject;
  /** Icon in the Exam Hall. */
  icon: string;
  name: string;
  description: string;
  minutes: number;
  scoring: ExamScoring;
  sections: ExamSectionDef[];
}

const GRAMMAR = [
  'en.grammar.tenses', 'en.grammar.passive', 'en.grammar.relative', 'en.grammar.conditionals', 'en.grammar.modals',
  'en.grammar.comparatives', 'en.vocab.collocations', 'en.vocab.word-forms', 'en.vocab.synonyms', 'en.vocab.academic',
];

export const EXAMS: ExamBlueprint[] = [
  {
    id: 'hn10',
    subject: 'english',
    icon: '🏫',
    name: 'Hà Nội grade-10 entrance — English',
    description: '40 multiple-choice questions · 60 minutes · scored out of 10 (0.25 per question).',
    minutes: 60,
    scoring: 'ten',
    sections: [
      { id: 'sounds', title: 'Pronunciation', instructions: 'Choose the word whose underlined part is pronounced differently from that of the others.', viInstructions: 'Chọn từ có phần gạch chân được phát âm khác với các từ còn lại.', source: { kind: 'concepts', concepts: ['en.pron.sounds', 'en.pron.endings'], count: 2 } },
      { id: 'stress', title: 'Stress', instructions: 'Choose the word whose main stress is placed differently from that of the others.', viInstructions: 'Chọn từ có trọng âm chính rơi vào vị trí khác với các từ còn lại.', source: { kind: 'concepts', concepts: ['en.pron.stress'], count: 2 } },
      { id: 'grammar', title: 'Vocabulary & grammar', instructions: 'Choose the best answer to complete each sentence.', viInstructions: 'Chọn đáp án đúng nhất để hoàn thành mỗi câu.', source: { kind: 'concepts', concepts: GRAMMAR, count: 8 } },
      { id: 'communication', title: 'Communication', instructions: 'Choose the most suitable response to complete each exchange.', viInstructions: 'Chọn câu đáp lại phù hợp nhất để hoàn thành mỗi đoạn hội thoại.', source: { kind: 'concepts', concepts: ['en.exam.communication'], count: 2 } },
      { id: 'signs', title: 'Signs & notices', instructions: 'What does each sign or notice mean?', viInstructions: 'Mỗi biển báo / thông báo có nghĩa là gì?', source: { kind: 'concepts', concepts: ['en.exam.signs'], count: 2 } },
      { id: 'cloze', title: 'Cloze', instructions: 'Read the passage and choose the word that best fits each numbered gap.', viInstructions: 'Đọc đoạn văn và chọn từ phù hợp nhất cho mỗi chỗ trống được đánh số.', source: { kind: 'set', group: 'cloze' } },
      { id: 'reading', title: 'Reading', instructions: 'Read the passage and choose the best answer to each question.', viInstructions: 'Đọc đoạn văn và chọn đáp án đúng nhất cho mỗi câu hỏi.', source: { kind: 'set', group: 'hn-reading' } },
      { id: 'arrange', title: 'Arrangement', instructions: 'Choose the correct order of the sentences to make a meaningful dialogue, letter or paragraph.', viInstructions: 'Chọn thứ tự đúng của các câu để tạo thành đoạn hội thoại, lá thư hoặc đoạn văn có nghĩa.', source: { kind: 'concepts', concepts: ['en.exam.arrange'], count: 3 } },
      { id: 'transformation', title: 'Sentence transformation', instructions: 'Choose the sentence that is closest in meaning to the given one.', viInstructions: 'Chọn câu gần nghĩa nhất với câu đã cho.', source: { kind: 'concepts', concepts: ['en.exam.transformation'], count: 5 } },
      { id: 'combination', title: 'Sentence combination', instructions: 'Choose the sentence that best combines each pair of sentences.', viInstructions: 'Chọn câu kết hợp tốt nhất mỗi cặp câu.', source: { kind: 'concepts', concepts: ['en.exam.combination'], count: 4 } },
    ],
  },
  {
    id: 'ielts-reading',
    subject: 'english',
    icon: '📖',
    name: 'IELTS Academic Reading — mini test',
    description: 'One passage · 13–14 questions · 20 minutes (a third of a real test) · band estimate.',
    minutes: 20,
    scoring: 'ielts-reading',
    sections: [{ id: 'passage', title: 'Reading passage', instructions: 'Read the passage and answer the questions. Follow the word limit where asked.', viInstructions: 'Đọc bài và trả lời các câu hỏi. Tuân thủ giới hạn số từ ở những câu yêu cầu.', source: { kind: 'set', group: 'ielts-reading' } }],
  },
  {
    id: 'ielts-reading-full',
    subject: 'english',
    icon: '📚',
    name: 'IELTS Academic Reading — full test',
    description: 'Three passages · about 40 questions · 60 minutes, like the real test · band estimate.',
    minutes: 60,
    scoring: 'ielts-reading',
    sections: [1, 2, 3].map((n) => ({
      id: `passage${n}`,
      title: `Reading passage ${n}`,
      instructions: 'Read the passage and answer the questions. Follow the word limit where asked. Spend about 20 minutes on each passage.',
      viInstructions: 'Đọc bài và trả lời các câu hỏi. Tuân thủ giới hạn số từ. Dành khoảng 20 phút cho mỗi bài.',
      source: { kind: 'set' as const, group: 'ielts-reading' as const },
    })),
  },
  {
    id: 'ielts-listening',
    subject: 'english',
    icon: '🎧',
    name: 'IELTS Listening — mini test',
    description: 'Parts 1 & 2 · 10 questions · recordings play ONCE · band estimate.',
    minutes: 15,
    scoring: 'ielts-listening',
    sections: [
      { id: 'part1', title: 'Part 1', instructions: 'Listen and complete the form. Write ONE WORD AND/OR A NUMBER for each answer.', viInstructions: 'Nghe và điền vào phiếu. Viết MỘT TỪ VÀ/HOẶC MỘT CON SỐ cho mỗi câu trả lời.', source: { kind: 'listening-part', part: 0 } },
      { id: 'part2', title: 'Part 2', instructions: 'Listen and choose the correct answer.', viInstructions: 'Nghe và chọn đáp án đúng.', source: { kind: 'listening-part', part: 1 } },
    ],
  },
  {
    id: 'hn10-math',
    subject: 'math',
    icon: '📐',
    name: 'Thi vào 10 Hà Nội — Toán (mock)',
    description: '30 questions in the order of the real paper (Bài I–V) · 90 minutes · scored out of 10. Work on paper, then choose the answer.',
    minutes: 90,
    scoring: 'ten',
    sections: [
      { id: 'b1', title: 'Bài I · Biểu thức & căn thức', instructions: 'Simplify the expressions and work with square roots.', viInstructions: 'Rút gọn biểu thức, tính giá trị biểu thức chứa căn.', source: { kind: 'concepts', concepts: ['math.algebra.radicals', 'math.number.fractions', 'math.algebra.expressions', 'math.number.integers'], count: 5, levels: [3, 3, 4, 4, 5] } },
      { id: 'b2', title: 'Bài II · Giải bài toán bằng cách lập phương trình', instructions: 'Real-life problems: set up an equation or system, then solve it.', viInstructions: 'Giải bài toán bằng cách lập phương trình hoặc hệ phương trình; bài toán thực tế.', source: { kind: 'concepts', concepts: ['math.reasoning.equation-problems', 'math.reasoning.word-problems', 'math.number.real-life', 'math.number.percent', 'math.geometry.solids'], count: 5, levels: [3, 4, 3, 4, 4] } },
      { id: 'b3', title: 'Bài III · Hệ phương trình, phương trình bậc hai, parabol', instructions: 'Systems, quadratic equations, Viète and the parabola y = ax².', viInstructions: 'Hệ phương trình, phương trình bậc hai, hệ thức Vi-ét, parabol y = ax² và đường thẳng.', source: { kind: 'concepts', concepts: ['math.algebra.systems', 'math.algebra.quadratics', 'math.algebra.reducible', 'math.algebra.vieta', 'math.algebra.parabola'], count: 7, levels: [3, 4, 3, 4, 5, 4, 5] } },
      { id: 'stats', title: 'Thống kê & xác suất', instructions: 'Statistics, probability and counting.', viInstructions: 'Thống kê, xác suất và đếm.', source: { kind: 'concepts', concepts: ['math.stats.average', 'math.stats.probability', 'math.combinatorics.counting'], count: 4, levels: [3, 4, 3, 4] } },
      { id: 'b4', title: 'Bài IV · Hình học', instructions: 'Circles, tangents, angles in a circle and right-triangle relations.', viInstructions: 'Đường tròn, tiếp tuyến, góc với đường tròn, hệ thức lượng và tỉ số lượng giác.', source: { kind: 'concepts', concepts: ['math.geometry.circle-angles', 'math.geometry.tangents', 'math.geometry.circles', 'math.geometry.trig', 'math.geometry.right-relations', 'math.geometry.arcs'], count: 7, levels: [3, 4, 4, 3, 4, 5, 4] } },
      { id: 'b5', title: 'Bài V · Nâng cao', instructions: 'The hardest question: minimum, maximum and clever algebra.', viInstructions: 'Câu khó nhất: tìm giá trị lớn nhất, nhỏ nhất và biến đổi khéo léo.', source: { kind: 'concepts', concepts: ['math.adv.inequalities', 'math.adv.identities'], count: 2, levels: [3, 4] } },
    ],
  },
  {
    id: 'chuyen-math',
    subject: 'math',
    icon: '🏆',
    name: 'Thi vào 10 chuyên Toán (mock)',
    description: '20 hard questions · 120 minutes · scored out of 10. Number theory, inequalities, non-standard equations, geometry.',
    minutes: 120,
    scoring: 'ten',
    sections: [
      { id: 'algebra', title: 'Đại số', instructions: 'Identities, non-standard equations and Viète with a parameter.', viInstructions: 'Hằng đẳng thức, phương trình không mẫu mực, Vi-ét có tham số.', source: { kind: 'concepts', concepts: ['math.adv.identities', 'math.adv.equations', 'math.adv.vieta'], count: 6, levels: [3, 4, 4, 5, 5, 4] } },
      { id: 'numbers', title: 'Số học', instructions: 'Divisibility, remainders and integer equations.', viInstructions: 'Chia hết, số dư, phương trình nghiệm nguyên.', source: { kind: 'concepts', concepts: ['math.adv.number-theory', 'math.adv.diophantine'], count: 4, levels: [4, 4, 5, 5] } },
      { id: 'geometry', title: 'Hình học', instructions: 'Similar triangles and circle theorems.', viInstructions: 'Tam giác đồng dạng và các định lí về đường tròn.', source: { kind: 'concepts', concepts: ['math.adv.geometry'], count: 4, levels: [3, 4, 5, 5] } },
      { id: 'hard', title: 'Bất đẳng thức & tổ hợp', instructions: 'Minimum and maximum, counting and the pigeonhole principle.', viInstructions: 'Bất đẳng thức, cực trị, tổ hợp và nguyên lí Dirichlet.', source: { kind: 'concepts', concepts: ['math.adv.inequalities', 'math.adv.combinatorics'], count: 6, levels: [3, 4, 4, 5, 5, 5] } },
    ],
  },
  {
    id: 'olympiad-math',
    subject: 'math',
    icon: '🥇',
    name: 'Maths olympiad — TIMO / FIMO style (mock)',
    description: '25 contest problems · 90 minutes · scored out of 10. Logic, arithmetic, number theory, counting and geometry.',
    minutes: 90,
    scoring: 'ten',
    sections: [
      { id: 'logic', title: 'Logical thinking', instructions: 'Logic puzzles.', viInstructions: 'Tư duy logic.', source: { kind: 'concepts', concepts: ['math.olympiad.logic'], count: 5, levels: [3, 4, 4, 5, 5] } },
      { id: 'arithmetic', title: 'Arithmetic', instructions: 'Clever calculation.', viInstructions: 'Số học, tính nhanh.', source: { kind: 'concepts', concepts: ['math.olympiad.arithmetic'], count: 5, levels: [3, 4, 4, 5, 5] } },
      { id: 'numbers', title: 'Number theory', instructions: 'Primes, divisibility and digits.', viInstructions: 'Lí thuyết số: số nguyên tố, chia hết, chữ số.', source: { kind: 'concepts', concepts: ['math.olympiad.number-theory'], count: 5, levels: [3, 4, 4, 5, 5] } },
      { id: 'counting', title: 'Combinatorics', instructions: 'Counting.', viInstructions: 'Tổ hợp, đếm.', source: { kind: 'concepts', concepts: ['math.olympiad.combinatorics'], count: 5, levels: [3, 4, 4, 5, 5] } },
      { id: 'geometry', title: 'Geometry', instructions: 'Geometry.', viInstructions: 'Hình học.', source: { kind: 'concepts', concepts: ['math.olympiad.geometry'], count: 5, levels: [3, 4, 4, 5, 5] } },
    ],
  },
  {
    id: 'hn10-lit',
    subject: 'literature',
    icon: '✍️',
    name: 'Thi vào 10 Hà Nội — Ngữ văn (mock)',
    description: '30 câu trắc nghiệm · 60 phút · thang điểm 10. Đọc hiểu, tiếng Việt, kiến thức văn học, kĩ năng nghị luận. (Phần viết bài luyện ở Lớp Văn.)',
    minutes: 60,
    scoring: 'ten',
    sections: [
      { id: 'doc-hieu', title: 'Phần I · Đọc hiểu', instructions: 'Read each text and choose the best answer.', viInstructions: 'Đọc văn bản và chọn đáp án đúng nhất.', source: { kind: 'concepts', concepts: ['lit.comprehension', 'lit.poetry-forms', 'lit.narrative', 'lit.devices'], count: 10, levels: [3, 3, 4, 4, 5] } },
      { id: 'tieng-viet', title: 'Phần II · Tiếng Việt', instructions: 'Vietnamese words and sentences.', viInstructions: 'Từ Hán Việt, điển tích, lời dẫn, liên kết câu.', source: { kind: 'concepts', concepts: ['lit.hanviet', 'lit.allusion', 'lit.quotation', 'lit.linking'], count: 8, levels: [3, 4, 4, 5] } },
      { id: 'van-hoc', title: 'Phần III · Kiến thức văn học', instructions: 'Authors and works.', viInstructions: 'Tác giả, tác phẩm.', source: { kind: 'concepts', concepts: ['lit.classics'], count: 4, levels: [3, 4, 4, 5] } },
      { id: 'nghi-luan', title: 'Phần IV · Kĩ năng nghị luận', instructions: 'Argument and essay skills.', viInstructions: 'Lập luận, bố cục, nghị luận xã hội và nghị luận văn học.', source: { kind: 'concepts', concepts: ['lit.argument', 'lit.structure', 'lit.nlxh', 'lit.nlvh'], count: 8, levels: [3, 4, 4, 5] } },
    ],
  },
];

export const examById = (id: string) => EXAMS.find((e) => e.id === id);

export interface PaperSection {
  id: string;
  title: string;
  instructions: string;
  viInstructions: string;
  setId?: string;
  questions: Question[];
}

export interface ExamPaper {
  examId: string;
  sections: PaperSection[];
  /** Passage sets used, so the next paper can choose different ones. */
  setIds: string[];
}

export interface AssembleOptions {
  /** When questions were last answered (ids and prompt keys). */
  history?: Map<string, number>;
  /** Passage sets used in earlier mock papers, most recent last. */
  usedSets?: string[];
  rand?: () => number;
}

/** Least-recently-used set from a group. */
function chooseSet(ids: readonly string[], used: string[], rand: () => number): string {
  const fresh = ids.filter((id) => !used.includes(id));
  if (fresh.length) return fresh[Math.floor(rand() * fresh.length)];
  return [...ids].sort((a, b) => used.lastIndexOf(a) - used.lastIndexOf(b))[0];
}

/** Exam papers mix easier and harder items, like the real thing. */
const DIFFICULTY_CYCLE = [2, 3, 3, 4, 2, 3, 4, 5, 3, 4];

export function assemblePaper(blueprint: ExamBlueprint, { history, usedSets = [], rand = Math.random }: AssembleOptions = {}): ExamPaper {
  const exclude = new Set<string>();
  const setIds: string[] = [];
  let k = 0;
  // Listening: both parts come from the same test.
  const tests = PASSAGE_SETS['ielts-listening'];
  const testIdx = tests.findIndex((t) => !t.some((id) => usedSets.includes(id)));
  const test = tests[testIdx >= 0 ? testIdx : Math.floor(rand() * tests.length)];

  const sections = blueprint.sections.map((def): PaperSection => {
    const base = { id: def.id, title: def.title, instructions: def.instructions, viInstructions: def.viInstructions };
    if (def.source.kind === 'set') {
      // Never the same passage twice in one paper.
      const all = PASSAGE_SETS[def.source.group];
      const left = all.filter((id) => !setIds.includes(id));
      const setId = chooseSet(left.length ? left : all, usedSets, rand);
      setIds.push(setId);
      return { ...base, setId, questions: questionsInSet(setId) };
    }
    if (def.source.kind === 'listening-part') {
      const setId = test[def.source.part];
      setIds.push(setId);
      return { ...base, setId, questions: questionsInSet(setId) };
    }
    const { concepts, count, levels } = def.source;
    const questions: Question[] = [];
    for (let i = 0; i < count; i++) {
      const conceptId = levels ? concepts[i % concepts.length] : concepts[Math.floor(rand() * concepts.length)];
      const q =
        pickQuestion({ conceptId, difficulty: levels ? levels[i % levels.length] : DIFFICULTY_CYCLE[k++ % DIFFICULTY_CYCLE.length], exclude, history, rand }) ??
        concepts.map((c) => pickQuestion({ conceptId: c, difficulty: 3, exclude, history, rand })).find(Boolean);
      if (!q) continue;
      exclude.add(q.id);
      exclude.add(promptKey(q));
      questions.push(q);
    }
    return { ...base, questions };
  });
  return { examId: blueprint.id, sections, setIds };
}

export const paperQuestions = (p: ExamPaper) => p.sections.flatMap((s) => s.questions);

/** An answer is the chosen option text, or the typed text for completion questions. */
export const isCorrectAnswer = (q: Question, answer: string | undefined) =>
  answer !== undefined && answer !== '' && (q.type === 'input' || q.type === 'order' ? isTypedAnswerCorrect(q, answer) : answer === q.options[q.answer]);

/** Approximate IELTS raw-score (out of 40) → band conversions, as commonly published. */
const LISTENING_BANDS: [number, number][] = [[39, 9], [37, 8.5], [35, 8], [32, 7.5], [30, 7], [26, 6.5], [23, 6], [18, 5.5], [16, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [4, 2.5], [0, 2]];
const READING_BANDS: [number, number][] = [[39, 9], [37, 8.5], [35, 8], [33, 7.5], [30, 7], [27, 6.5], [23, 6], [19, 5.5], [15, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [4, 2.5], [0, 2]];

export function ieltsBandFromRaw(raw40: number, kind: 'reading' | 'listening'): number {
  const table = kind === 'reading' ? READING_BANDS : LISTENING_BANDS;
  return table.find(([min]) => raw40 >= min)![1];
}

export interface ExamGrade {
  correct: number;
  total: number;
  /** Hà Nội: points out of 10. */
  score: number | null;
  /** IELTS: estimated band (mini test scaled to 40 questions). */
  band: number | null;
  sections: { id: string; title: string; correct: number; total: number }[];
}

/** `scoring` defaults to the blueprint's (imported papers pass their own). */
export function gradePaper(paper: ExamPaper, answers: Record<string, string>, scoring: ExamScoring = examById(paper.examId)?.scoring ?? 'ten'): ExamGrade {
  const sections = paper.sections.map((s) => ({
    id: s.id,
    title: s.title,
    correct: s.questions.filter((q) => isCorrectAnswer(q, answers[q.id])).length,
    total: s.questions.length,
  }));
  const correct = sections.reduce((n, s) => n + s.correct, 0);
  const total = sections.reduce((n, s) => n + s.total, 0);
  let score: number | null = null;
  let band: number | null = null;
  if (scoring === 'ten') score = Math.round((correct / Math.max(1, total)) * 10 * 100) / 100;
  else band = ieltsBandFromRaw(Math.round((correct / Math.max(1, total)) * 40), scoring === 'ielts-reading' ? 'reading' : 'listening');
  return { correct, total, score, band, sections };
}
