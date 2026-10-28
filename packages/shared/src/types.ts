/** Core domain types shared by every package (PRD §8). */

export type SubjectId = 'english' | 'math' | 'logic' | 'literature';

export interface Student {
  id: string;
  name: string;
  age: number;
  grade: number;
  avatar: string;
  placementDone: boolean;
  createdAt: number;
}

/** Static definition of a node in the knowledge graph: Subject → Domain → Skill → Concept. */
export interface ConceptDef {
  id: string;
  subject: SubjectId;
  domain: string;
  skill: string;
  name: string;
  /** Kid-facing mission name — the child never sees "exercise". */
  missionName: string;
  description: string;
  /** CEFR band for English concepts. */
  cefr?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  prerequisites?: string[];
  /** Short lesson shown before/after a mission ("Lessons" in the graph). */
  lesson?: string;
  /** Exam references, e.g. "IELTS Reading: T/F/NG". */
  examRefs?: string[];
}

/** Per-student learning state of a concept. */
export interface ConceptState {
  conceptId: string;
  mastery: number; // 0–100
  confidence: number; // 0–1 — how sure we are of the mastery estimate
  attempts: number;
  correct: number;
  streak: number;
  ease: number; // spaced-repetition ease factor
  intervalDays: number;
  nextReview: number; // epoch ms
  lastSeen: number; // epoch ms, 0 = never
  lastWrongAt: number; // epoch ms, 0 = never
}

/**
 * `input`: typed answer (IELTS completion questions) checked against `accept`.
 * `order`: put the words in order (Sentence Sprint); options[answer] is the sentence, `accept` other valid orders.
 */
export type QuestionType = 'mcq' | 'listen' | 'read' | 'fill' | 'input' | 'order';

/**
 * Geometry diagrams, drawn roughly to scale. Numbers are real sizes; `ask` marks the unknown ("?").
 * Plain data so questions stay serialisable.
 */
export type Figure =
  | { kind: 'triangle'; angles: [number, number, number]; ask?: 0 | 1 | 2 }
  | { kind: 'line-angles'; angle: number; ask: 0 | 1 }
  | { kind: 'polygon'; sides: number; askAngle?: boolean }
  | { kind: 'rect'; w: number; h: number; unit?: string }
  | { kind: 'tri-area'; base: number; height: number; unit?: string }
  | { kind: 'trapezium'; a: number; b: number; h: number; unit?: string }
  | { kind: 'right-triangle'; a: number; b: number; c: number; ask: 'a' | 'b' | 'c' }
  | { kind: 'circle'; r: number; unit?: string };

export interface Question {
  id: string;
  conceptId: string;
  /** 1 (easy) … 5 (hard) */
  difficulty: number;
  type: QuestionType;
  prompt: string;
  /** Options with the correct answer at `answer`. Presentation shuffles them. */
  options: string[];
  answer: number;
  explanation?: string;
  /** Vietnamese prompt written with the question (maths generators); otherwise it is translated by rules. */
  promptVi?: string;
  /** Vietnamese explanation written with the question (family imports, AI-generated items). */
  explanationVi?: string;
  /** Text read aloud (speech synthesis) for listening questions. */
  audio?: string;
  /** Reading passage for reading questions. */
  passage?: string;
  /** A sign or notice shown as a sign (signs & notices questions). */
  sign?: string;
  /** Listening script read by different voices, e.g. [{ who: 'A', text: 'Hello…' }]. */
  script?: { who: string; text: string }[];
  /** Questions sharing one passage or recording (cloze, reading, IELTS). */
  setId?: string;
  /** A diagram drawn with the question (geometry). */
  figure?: Figure;
  /** Typed answers: other accepted spellings besides options[answer] ("14", "fourteen"). */
  accept?: string[];
  source: string;
}

/** Normalise a typed answer for comparison: lower case, no punctuation, single spaces. */
export const normalizeAnswer = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Word tiles for an `order` question: the sentence's words without the final punctuation, the first word in
 * lower case (a capital would give it away) unless it is "I" or a name with non-English letters.
 */
export function orderTokens(sentence: string): { tokens: string[]; end: string } {
  const m = sentence.trim().match(/^(.*?)([.?!]*)$/s)!;
  const tokens = m[1].split(/\s+/).filter(Boolean);
  if (tokens.length && tokens[0] !== 'I' && !/[^\x00-\x7F]/.test(tokens[0]) && !/^[A-Z]{2,}/.test(tokens[0])) tokens[0] = tokens[0][0].toLowerCase() + tokens[0].slice(1);
  return { tokens, end: m[2] };
}

/** True for answers that are typed or built rather than picked (input, order). */
export const isFreeAnswer = (q: Pick<Question, 'type'>) => q.type === 'input' || q.type === 'order';

export const isTypedAnswerCorrect = (q: Pick<Question, 'options' | 'answer' | 'accept'>, typed: string) =>
  [q.options[q.answer], ...(q.accept ?? [])].some((a) => normalizeAnswer(a) === normalizeAnswer(typed));

export type PlacementSectionId = 'word-hunter' | 'sentence-forge' | 'echo-cave' | 'reading-puzzle' | 'math-logic';

export interface PlacementSection {
  id: PlacementSectionId;
  title: string;
  skill: string;
  subject: SubjectId;
  questionCount: number;
  /** Concept ids this section draws from. */
  concepts: string[];
  blurb: string;
}

export interface PlacementScores {
  english: { vocabulary: number; grammar: number; listening: number; reading: number };
  math: { number: number; algebra: number; geometry: number; logic: number };
  /** Per-concept seeds derived from placement answers. */
  concepts: Record<string, number>;
}

export interface MissionBlock {
  conceptIds: string[];
  minutes: number;
  label: string;
  kind: 'learn' | 'review' | 'boss';
  subject: SubjectId | 'mixed';
}

export interface Mission {
  id: string;
  concepts: string[];
  duration: number; // minutes
  reward: Reward;
  title: string;
  kind: 'learn' | 'review' | 'boss';
  /** Game mode chosen by the learner; otherwise the best fit for the concepts. */
  mode?: 'defense' | 'runner' | 'temple' | 'knight' | 'duel' | 'sprint' | 'meteor' | 'penalty' | 'race' | 'detective';
}

export interface Reward {
  coins: number;
  gems: number;
  xp: number;
}

export type GoalKind = 'dailyMinutes' | 'focusSubject' | 'focusConcept' | 'ieltsTarget';

export interface Goal {
  id: string;
  studentId: string;
  kind: GoalKind;
  value: string;
  active: boolean;
  createdAt: number;
}

export interface Attempt {
  id: string;
  studentId: string;
  questionId: string;
  conceptId: string;
  correct: boolean;
  difficulty: number;
  msSpent: number;
  context: 'placement' | 'mission' | 'review' | 'exam';
  createdAt: number;
}

export interface StudySession {
  id: string;
  studentId: string;
  kind: 'placement' | 'mission';
  startedAt: number;
  endedAt: number;
  activeMs: number;
  missionTitle: string;
}

export interface Wallet {
  coins: number;
  gems: number;
  xp: number;
}
