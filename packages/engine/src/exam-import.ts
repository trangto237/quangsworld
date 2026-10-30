import type { Question } from '@atlas/shared';
import type { ExamPaper, ExamScoring, PaperSection } from './exams';

/**
 * Real exam papers imported by the parent (a PDF or photos read by AI): past Hà Nội grade-10 papers,
 * sample papers (đề minh họa) and IELTS practice tests. Stored with the family's content and synced to
 * the kid's devices; taken in the Exam Hall like the mock papers.
 */

export type ImportedKind = 'hn10' | 'ielts-reading' | 'ielts-listening';

export interface ImportedExam {
  id: string;
  name: string;
  kind: ImportedKind;
  minutes: number;
  sections: PaperSection[];
  /** Questions whose answer the AI worked out (no answer key on the paper): the parent checked these. */
  aiAnswered: string[];
  /** Parts of the paper that couldn't be used (writing tasks, listening without a transcript…). */
  skipped: string[];
  createdAt: number;
}

export const KIND_INFO: Record<ImportedKind, { label: string; emoji: string; minutes: number; scoring: ExamScoring }> = {
  hn10: { label: 'Hà Nội grade-10 English paper', emoji: '🏫', minutes: 60, scoring: 'ten' },
  'ielts-reading': { label: 'IELTS Reading test', emoji: '📖', minutes: 60, scoring: 'ielts-reading' },
  'ielts-listening': { label: 'IELTS Listening test', emoji: '🎧', minutes: 40, scoring: 'ielts-listening' },
};

export const importedPaper = (e: ImportedExam): ExamPaper => ({ examId: e.id, sections: e.sections, setIds: [] });

/** Section types the AI may use, and the skill each one trains (for mastery and the Mistake Book). */
export const SECTION_TYPES = [
  'pronunciation',
  'stress',
  'grammar',
  'communication',
  'signs',
  'cloze',
  'reading',
  'arrange',
  'transformation',
  'combination',
  'ielts-reading',
  'ielts-listening',
  'writing',
  'other',
] as const;
export type SectionType = (typeof SECTION_TYPES)[number];

/** Grammar & vocabulary questions are sorted into these skills. */
export const GRAMMAR_TOPICS = [
  'en.grammar.tenses',
  'en.grammar.passive',
  'en.grammar.relative',
  'en.grammar.conditionals',
  'en.grammar.modals',
  'en.grammar.comparatives',
  'en.grammar.word-order',
  'en.vocab.everyday',
  'en.vocab.synonyms',
  'en.vocab.academic',
  'en.vocab.collocations',
  'en.vocab.word-forms',
] as const;

const SECTION_CONCEPT: Partial<Record<SectionType, string>> = {
  pronunciation: 'en.pron.sounds',
  stress: 'en.pron.stress',
  communication: 'en.exam.communication',
  signs: 'en.exam.signs',
  cloze: 'en.exam.cloze',
  reading: 'en.reading.detail',
  arrange: 'en.exam.arrange',
  transformation: 'en.exam.transformation',
  combination: 'en.exam.combination',
  'ielts-reading': 'en.ielts.reading',
  'ielts-listening': 'en.ielts.listening',
};

const TITLES: Record<SectionType, [string, string]> = {
  pronunciation: ['Pronunciation', 'Chọn từ có phần gạch chân được phát âm khác với các từ còn lại.'],
  stress: ['Stress', 'Chọn từ có trọng âm chính rơi vào vị trí khác với các từ còn lại.'],
  grammar: ['Vocabulary & grammar', 'Chọn đáp án đúng nhất để hoàn thành mỗi câu.'],
  communication: ['Communication', 'Chọn câu đáp lại phù hợp nhất.'],
  signs: ['Signs & notices', 'Mỗi biển báo / thông báo có nghĩa là gì?'],
  cloze: ['Cloze', 'Đọc đoạn văn và chọn từ phù hợp nhất cho mỗi chỗ trống.'],
  reading: ['Reading', 'Đọc đoạn văn và chọn đáp án đúng nhất.'],
  arrange: ['Arrangement', 'Chọn thứ tự đúng của các câu.'],
  transformation: ['Sentence transformation', 'Chọn câu gần nghĩa nhất với câu đã cho.'],
  combination: ['Sentence combination', 'Chọn câu kết hợp tốt nhất mỗi cặp câu.'],
  'ielts-reading': ['Reading passage', 'Đọc bài và trả lời các câu hỏi.'],
  'ielts-listening': ['Listening', 'Nghe và trả lời các câu hỏi.'],
  writing: ['Writing', ''],
  other: ['Questions', 'Trả lời các câu hỏi.'],
};

/** What the AI sends back for one paper. */
export interface RawExam {
  title?: unknown;
  minutes?: unknown;
  sections?: unknown;
}
interface RawSection {
  type?: unknown;
  instructions?: unknown;
  instructions_vi?: unknown;
  passage?: unknown;
  transcript?: unknown;
  questions?: unknown;
}
interface RawQuestion {
  prompt?: unknown;
  options?: unknown;
  answer_index?: unknown;
  answer_text?: unknown;
  accept?: unknown;
  answer_from?: unknown;
  topic?: unknown;
  explanation?: unknown;
}

const str = (v: unknown, max = 20_000) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const strs = (v: unknown, max = 12) => (Array.isArray(v) ? v.map((x) => str(x, 400)).filter(Boolean).slice(0, max) : []);

/** A listening transcript as voice lines: "Name: text" lines become speakers A, B, C… */
export function scriptLines(transcript: string): { who: string; text: string }[] {
  const lines = transcript
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
  const voices = new Map<string, string>();
  const out: { who: string; text: string }[] = [];
  for (const l of lines) {
    const m = l.match(/^([A-Z][\w .'-]{0,24}):\s*(.+)$/);
    if (m) {
      if (!voices.has(m[1])) voices.set(m[1], 'ABCDE'[Math.min(4, voices.size)]);
      out.push({ who: voices.get(m[1])!, text: m[2] });
    } else if (out.length) out[out.length - 1] = { ...out[out.length - 1], text: `${out[out.length - 1].text} ${l}` };
    else out.push({ who: 'C', text: l });
  }
  return out;
}

/**
 * Turns the AI's answer into a paper the app can run, dropping anything unusable: questions without
 * a clear answer, multiple choice without 2–6 options, writing tasks, listening without a transcript.
 */
export function buildImportedExam(raw: RawExam, opts: { id: string; name?: string; kind: ImportedKind; now?: number }): ImportedExam {
  const { id, kind } = opts;
  const sections: PaperSection[] = [];
  const aiAnswered: string[] = [];
  const skipped: string[] = [];
  const rawSections = Array.isArray(raw.sections) ? (raw.sections as RawSection[]) : [];
  let n = 0;
  rawSections.forEach((rs, si) => {
    const type = (SECTION_TYPES as readonly string[]).includes(str(rs.type)) ? (str(rs.type) as SectionType) : 'other';
    const [title, viDefault] = TITLES[type];
    const instructions = str(rs.instructions, 600) || title;
    if (type === 'writing') {
      skipped.push(`${title}: “${instructions.slice(0, 80)}” — writing can't be marked automatically.`);
      return;
    }
    const passage = str(rs.passage) || undefined;
    const transcript = str(rs.transcript, 30_000);
    const listening = type === 'ielts-listening' || kind === 'ielts-listening';
    if (listening && !transcript) {
      skipped.push(`${instructions.slice(0, 80)} — no transcript of the recording was found, so it can't be played.`);
      return;
    }
    const script = listening ? scriptLines(transcript) : undefined;
    const setId = passage || script ? `${id}.s${si + 1}` : undefined;
    const qs: Question[] = [];
    for (const rq of (Array.isArray(rs.questions) ? rs.questions : []) as RawQuestion[]) {
      const prompt = str(rq.prompt, 2000);
      const options = strs(rq.options, 8);
      const conceptId =
        type === 'grammar' || type === 'other'
          ? (GRAMMAR_TOPICS as readonly string[]).includes(str(rq.topic))
            ? str(rq.topic)
            : type === 'grammar'
              ? 'en.vocab.collocations'
              : (SECTION_CONCEPT[kind === 'hn10' ? 'reading' : kind] ?? 'en.reading.detail')
          : SECTION_CONCEPT[type]!;
      const qid = `${id}#${++n}`;
      const base = {
        id: qid,
        conceptId,
        difficulty: 3,
        explanation: str(rq.explanation, 600) || undefined,
        passage,
        script,
        setId,
        source: `Exam paper: ${opts.name?.trim() || str(raw.title, 120) || 'imported'}`,
      };
      let q: Question | null = null;
      if (options.length >= 2) {
        // IELTS Matching Headings lists up to 8 headings.
        if (options.length > 8) continue;
        const idx = Number(rq.answer_index);
        const byText = options.findIndex((o) => o.toLowerCase() === str(rq.answer_text).toLowerCase());
        const answer = Number.isInteger(idx) && idx >= 0 && idx < options.length ? idx : byText;
        if (answer < 0) continue;
        q = { ...base, type: listening ? 'listen' : passage ? 'read' : 'mcq', prompt, options, answer };
      } else {
        const answerText = str(rq.answer_text, 120) || options[0] || '';
        if (!answerText || !prompt) continue;
        q = { ...base, type: 'input', prompt, options: [answerText], answer: 0, accept: strs(rq.accept, 8) };
      }
      if (str(rq.answer_from) === 'ai') aiAnswered.push(qid);
      qs.push(q);
    }
    if (!qs.length) return;
    sections.push({ id: `p${si + 1}`, title, instructions, viInstructions: str(rs.instructions_vi, 600) || viDefault, setId, questions: qs });
  });
  if (!sections.length) throw new Error('No usable questions were found in this paper.');
  const minutes = Math.round(Number(raw.minutes));
  return {
    id,
    name: opts.name?.trim() || str(raw.title, 120) || KIND_INFO[kind].label,
    kind,
    minutes: minutes >= 5 && minutes <= 240 ? minutes : KIND_INFO[kind].minutes,
    sections,
    aiAnswered,
    skipped,
    createdAt: opts.now ?? Date.now(),
  };
}

/** How many questions the paper has. */
export const examSize = (e: ImportedExam) => e.sections.reduce((s, x) => s + x.questions.length, 0);
