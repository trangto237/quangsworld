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

export type QuestionType = 'mcq' | 'listen' | 'read' | 'fill';

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
  /** Text read aloud (speech synthesis) for listening questions. */
  audio?: string;
  /** Reading passage for reading questions. */
  passage?: string;
  source: string;
}

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
  mode?: 'defense' | 'runner' | 'knight' | 'duel';
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
  context: 'placement' | 'mission' | 'review';
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
