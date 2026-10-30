import type { Question } from '@atlas/shared';
import type { ConceptSeed } from '../helpers';
import { IELTS_PASSAGES } from './ielts-passages';

/**
 * IELTS Academic Reading question generator.
 *
 * Each passage (original text, see ielts-passages.ts) carries notes about what it says: the right heading for each
 * paragraph, statements that are true / false / not given, who said or found what, gap sentences… This file turns
 * those notes into every IELTS Reading task type, so a new passage automatically becomes a full set of practice
 * questions and a Reading paper in the Exam Hall.
 */

export type Tfng = 'TRUE' | 'FALSE' | 'NOT GIVEN';
export type Ynng = 'YES' | 'NO' | 'NOT GIVEN';

interface Why {
  /** Where the answer is and why the trap is wrong (one or two sentences). */
  why: string;
  /** Difficulty 3–5; defaults to the passage level. */
  d?: number;
}

export interface IeltsPassage {
  /** Short kebab id, unique. */
  id: string;
  title: string;
  /** 3 ≈ band 5.5, 4 ≈ band 6.5, 5 ≈ band 7+. */
  level: 3 | 4 | 5;
  /** Paragraphs in order; they are lettered A, B, C… automatically. */
  paragraphs: string[];
  /** Short glossary lines printed under the passage, e.g. "calorie: a measure of the energy value of food". */
  glossary?: string[];
  /** Matching headings: the right heading for some paragraphs (0-based index), plus wrong headings. Max 8 headings in total. */
  headings?: { items: ({ para: number; heading: string } & Why)[]; distractors: string[] };
  tfng?: ({ statement: string; answer: Tfng } & Why)[];
  /** Writer's views / claims: only for passages that argue a point. */
  ynng?: ({ statement: string; answer: Ynng } & Why)[];
  /** Matching features: items matched to people / groups / dates named in the passage (2–6 options; letters may repeat). */
  features?: { instruction: string; options: string[]; items: ({ item: string; answer: string } & Why)[] };
  /** Matching sentence endings. */
  endings?: { items: ({ start: string; ending: string } & Why)[]; distractors: string[] };
  /** Multiple choice, one answer (3 wrong options). */
  mc?: ({ question: string; answer: string; wrong: string[] } & Why)[];
  /** Multiple choice, choose TWO (4–5 wrong options). */
  chooseTwo?: ({ question: string; answers: [string, string]; wrong: string[] } & Why)[];
  /** Summary completion from a list of words (gaps written as ___). Up to 8 words in the list. */
  summaryList?: { title: string; gaps: ({ text: string; answer: string } & Why)[]; distractors: string[] };
  /** Completion with words copied from the passage: summary, sentence, note, table or flow-chart. */
  completion?: {
    kind: 'summary' | 'sentence' | 'note' | 'table' | 'flow-chart';
    title?: string;
    /** "NO MORE THAN TWO WORDS" = 2; "ONE WORD ONLY" = 1; numbers allowed if the answer is a number. */
    limit: 1 | 2 | 3;
    gaps: ({ text: string; answer: string; accept?: string[] } & Why)[];
  }[];
}

export const IELTS_TASKS = {
  tfng: { id: 'en.ielts.r-tfng', name: 'True / False / Not Given', mission: 'Truth Tablets' },
  ynng: { id: 'en.ielts.r-views', name: "Writer's views (Yes / No / Not Given)", mission: "Scholar's Mind" },
  headings: { id: 'en.ielts.r-headings', name: 'Matching headings', mission: 'Banner Hall' },
  matching: { id: 'en.ielts.r-matching', name: 'Matching features & sentence endings', mission: 'Thread Weavers' },
  mc: { id: 'en.ielts.r-mc', name: 'Multiple choice', mission: 'Fork in the Stairs' },
  completion: { id: 'en.ielts.r-completion', name: 'Summary, note & flow-chart completion', mission: 'Missing Stones' },
} as const;

const allIeltsReadingConcepts: ConceptSeed[] = [
  {
    id: IELTS_TASKS.tfng.id,
    domain: 'IELTS',
    skill: 'IELTS Reading',
    name: IELTS_TASKS.tfng.name,
    missionName: IELTS_TASKS.tfng.mission,
    description: 'Does the statement agree with the passage, contradict it, or is it not mentioned at all?',
    cefr: 'B2',
    prerequisites: ['en.reading.tfng'],
    lesson:
      'TRUE: the passage says the same thing in other words. FALSE: the passage says the opposite (look for a changed number, a "not", "only", "all", "first"). NOT GIVEN: the passage does not say — never answer from your own knowledge. The answers come in passage order.',
    examRefs: ['IELTS Academic Reading: Identifying information'],
  },
  {
    id: IELTS_TASKS.ynng.id,
    domain: 'IELTS',
    skill: 'IELTS Reading',
    name: IELTS_TASKS.ynng.name,
    missionName: IELTS_TASKS.ynng.mission,
    description: "Does the statement match what the writer claims or believes?",
    cefr: 'B2',
    prerequisites: [IELTS_TASKS.tfng.id],
    lesson:
      'Same idea as True/False/Not Given, but about the writer\'s opinions and claims. YES: the writer agrees. NO: the writer says the opposite. NOT GIVEN: you cannot tell what the writer thinks. Watch opinion words: "unfortunately", "clearly", "it is doubtful".',
    examRefs: ["IELTS Academic Reading: Identifying writer's views/claims"],
  },
  {
    id: IELTS_TASKS.headings.id,
    domain: 'IELTS',
    skill: 'IELTS Reading',
    name: IELTS_TASKS.headings.name,
    missionName: IELTS_TASKS.headings.mission,
    description: 'Choose the heading that sums up the main idea of a whole paragraph.',
    cefr: 'B2',
    prerequisites: ['en.reading.main-idea'],
    lesson:
      'A heading matches the MAIN idea of the whole paragraph, not one detail. Read the first and last sentences, then ask "what is this paragraph mostly about?". Wrong headings often repeat a word from the paragraph but describe only a detail.',
    examRefs: ['IELTS Academic Reading: Matching headings'],
  },
  {
    id: IELTS_TASKS.matching.id,
    domain: 'IELTS',
    skill: 'IELTS Reading',
    name: IELTS_TASKS.matching.name,
    missionName: IELTS_TASKS.matching.mission,
    description: 'Match statements to people, groups or dates, and complete sentences with the right ending.',
    cefr: 'B2',
    prerequisites: [IELTS_TASKS.tfng.id],
    lesson:
      'Matching features: scan for each name or date in the passage and read around it; the statements are paraphrased and NOT in passage order, and a letter can be used more than once. Sentence endings: the ending must fit the meaning AND the grammar of the start.',
    examRefs: ['IELTS Academic Reading: Matching features', 'IELTS Academic Reading: Matching sentence endings'],
  },
  {
    id: IELTS_TASKS.mc.id,
    domain: 'IELTS',
    skill: 'IELTS Reading',
    name: IELTS_TASKS.mc.name,
    missionName: IELTS_TASKS.mc.mission,
    description: 'Multiple choice with one answer, or choose TWO from a list.',
    cefr: 'B2',
    prerequisites: ['en.reading.detail'],
    lesson:
      'Find the part of the passage the question is about, then check EVERY option against it. Wrong options often use words from the passage but change the meaning, or are true but not what the question asks.',
    examRefs: ['IELTS Academic Reading: Multiple choice'],
  },
  {
    id: IELTS_TASKS.completion.id,
    domain: 'IELTS',
    skill: 'IELTS Reading',
    name: IELTS_TASKS.completion.name,
    missionName: IELTS_TASKS.completion.mission,
    description: 'Fill gaps in a summary, sentences, notes or a flow-chart, from a list or with words from the passage.',
    cefr: 'B2',
    prerequisites: ['en.reading.paraphrase'],
    lesson:
      'Decide what kind of word fits the gap (noun? adjective? number?). Find the paraphrased idea in the passage and copy the word(s) EXACTLY, spelled correctly. Respect the limit: "NO MORE THAN TWO WORDS" means 1 or 2 words. With a list, the right word means the same as the passage, not the same spelling.',
    examRefs: ['IELTS Academic Reading: Summary, note, table, flow-chart completion', 'IELTS Academic Reading: Sentence completion'],
  },
];

const LIMIT_TEXT = { 1: 'ONE WORD ONLY', 2: 'NO MORE THAN TWO WORDS', 3: 'NO MORE THAN THREE WORDS' } as const;
const KIND_TEXT = { summary: 'summary', sentence: 'sentence', note: 'notes', table: 'table', 'flow-chart': 'flow-chart' } as const;

/** The passage as shown above the questions: title, lettered paragraphs, glossary. */
export function passageText(p: IeltsPassage): string {
  const letters = 'ABCDEFGHIJ';
  const body = p.paragraphs.map((t, i) => `${letters[i]}  ${t}`).join('\n\n');
  return `${p.title}\n\n${body}${p.glossary?.length ? `\n\n${p.glossary.map((g) => `* ${g}`).join('\n')}` : ''}`;
}

export const ieltsSetId = (p: IeltsPassage) => `ielts-g-${p.id}`;

/** Turns one annotated passage into questions of every task type it has notes for. */
export function buildIeltsQuestions(p: IeltsPassage): Question[] {
  const out: Question[] = [];
  const passage = passageText(p);
  const setId = ieltsSetId(p);
  const counts = new Map<string, number>();
  const push = (conceptId: string, d: number | undefined, prompt: string, options: string[], explanation: string, extra: Partial<Question> = {}) => {
    const n = (counts.get(conceptId) ?? 0) + 1;
    counts.set(conceptId, n);
    out.push({
      id: `${conceptId}#${p.id}-${n}`,
      conceptId,
      difficulty: d ?? p.level,
      type: 'read',
      prompt,
      options,
      answer: 0,
      explanation,
      passage,
      setId,
      source: 'Atlas original (IELTS-style)',
      ...extra,
    });
  };
  const letter = 'ABCDEFGHIJ';

  if (p.headings) {
    const all = [...p.headings.items.map((h) => h.heading), ...p.headings.distractors];
    for (const h of p.headings.items) push(IELTS_TASKS.headings.id, h.d, `Matching headings — Choose the correct heading for paragraph ${letter[h.para]}.`, [h.heading, ...all.filter((x) => x !== h.heading)], h.why);
  }
  for (const s of p.tfng ?? [])
    push(IELTS_TASKS.tfng.id, s.d, `TRUE, FALSE or NOT GIVEN? — ${s.statement}`, [s.answer, ...(['TRUE', 'FALSE', 'NOT GIVEN'] as const).filter((x) => x !== s.answer)], s.why);
  for (const s of p.ynng ?? [])
    push(IELTS_TASKS.ynng.id, s.d, `Does this reflect the claims of the writer? YES, NO or NOT GIVEN? — ${s.statement}`, [s.answer, ...(['YES', 'NO', 'NOT GIVEN'] as const).filter((x) => x !== s.answer)], s.why);
  if (p.features)
    for (const it of p.features.items)
      push(IELTS_TASKS.matching.id, it.d, `${p.features.instruction} — ${it.item}`, [it.answer, ...p.features.options.filter((o) => o !== it.answer)], it.why);
  if (p.endings) {
    const all = [...p.endings.items.map((e) => e.ending), ...p.endings.distractors];
    for (const e of p.endings.items) push(IELTS_TASKS.matching.id, e.d, `Complete the sentence with the correct ending. — ${e.start} …`, [e.ending, ...all.filter((x) => x !== e.ending)].slice(0, 8), e.why);
  }
  for (const m of p.mc ?? []) push(IELTS_TASKS.mc.id, m.d, `Multiple choice — ${m.question}`, [m.answer, ...m.wrong], m.why);
  for (const m of p.chooseTwo ?? []) {
    // The exam asks for TWO letters in either order; here each answer is one question with the other one removed.
    const [a, b] = m.answers;
    push(IELTS_TASKS.mc.id, m.d, `Choose TWO — ${m.question} (first answer)`, [a, ...m.wrong], m.why);
    push(IELTS_TASKS.mc.id, m.d, `Choose TWO — ${m.question} (the other answer)`, [b, ...m.wrong], m.why);
  }
  if (p.summaryList) {
    const words = [...p.summaryList.gaps.map((g) => g.answer), ...p.summaryList.distractors];
    for (const g of p.summaryList.gaps)
      push(IELTS_TASKS.completion.id, g.d, `Complete the summary “${p.summaryList.title}” using a word from the list. — ${g.text}`, [g.answer, ...words.filter((w) => w !== g.answer)].slice(0, 8), g.why);
  }
  for (const c of p.completion ?? [])
    for (const g of c.gaps)
      push(
        IELTS_TASKS.completion.id,
        g.d,
        `Complete the ${KIND_TEXT[c.kind]}${c.title ? ` “${c.title}”` : ''}. Write ${LIMIT_TEXT[c.limit]} from the passage. — ${g.text}`,
        [g.answer],
        g.why,
        { type: 'input', accept: g.accept },
      );
  return out;
}

export const ieltsReadingQuestions: Question[] = IELTS_PASSAGES.flatMap(buildIeltsQuestions);
/** Only task types that have questions yet. */
export const ieltsReadingConcepts: ConceptSeed[] = allIeltsReadingConcepts.filter((c) => ieltsReadingQuestions.some((q) => q.conceptId === c.id));
export const ieltsReadingSets: string[] = IELTS_PASSAGES.map(ieltsSetId);
