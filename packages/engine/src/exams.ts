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
  | { kind: 'concepts'; concepts: string[]; count: number }
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

export interface ExamBlueprint {
  id: string;
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
    name: 'IELTS Academic Reading — mini test',
    description: 'One passage · 13 questions · 20 minutes (a third of a real test) · band estimate.',
    minutes: 20,
    scoring: 'ielts-reading',
    sections: [{ id: 'passage', title: 'Reading passage', instructions: 'Read the passage and answer questions 1–13. Write NO MORE THAN TWO WORDS where asked.', viInstructions: 'Đọc bài và trả lời câu 1–13. Viết KHÔNG QUÁ HAI TỪ ở những câu yêu cầu.', source: { kind: 'set', group: 'ielts-reading' } }],
  },
  {
    id: 'ielts-listening',
    name: 'IELTS Listening — mini test',
    description: 'Parts 1 & 2 · 10 questions · recordings play ONCE · band estimate.',
    minutes: 15,
    scoring: 'ielts-listening',
    sections: [
      { id: 'part1', title: 'Part 1', instructions: 'Listen and complete the form. Write ONE WORD AND/OR A NUMBER for each answer.', viInstructions: 'Nghe và điền vào phiếu. Viết MỘT TỪ VÀ/HOẶC MỘT CON SỐ cho mỗi câu trả lời.', source: { kind: 'listening-part', part: 0 } },
      { id: 'part2', title: 'Part 2', instructions: 'Listen and choose the correct answer.', viInstructions: 'Nghe và chọn đáp án đúng.', source: { kind: 'listening-part', part: 1 } },
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
      const setId = chooseSet(PASSAGE_SETS[def.source.group], usedSets, rand);
      setIds.push(setId);
      return { ...base, setId, questions: questionsInSet(setId) };
    }
    if (def.source.kind === 'listening-part') {
      const setId = test[def.source.part];
      setIds.push(setId);
      return { ...base, setId, questions: questionsInSet(setId) };
    }
    const { concepts, count } = def.source;
    const questions: Question[] = [];
    for (let i = 0; i < count; i++) {
      const conceptId = concepts[Math.floor(rand() * concepts.length)];
      const q =
        pickQuestion({ conceptId, difficulty: DIFFICULTY_CYCLE[k++ % DIFFICULTY_CYCLE.length], exclude, history, rand }) ??
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
