import type { PresentedQuestion } from '@atlas/knowledge';

/** The contract every game mode shares: a question source, an answer callback and an end callback. */
export interface ModeProps {
  title: string;
  subtitle?: string;
  /** Planned mission length; each mode sizes its goal from it. */
  minutes: number;
  /** Next challenge, or null when the source has nothing more. */
  nextQuestion: () => PresentedQuestion | null;
  /** After each answer: current streak, and `done` when a trial realm's challenges are finished. */
  onAnswered: (q: PresentedQuestion, correct: boolean, ms: number, picked: string) => { streak: number; done?: boolean };
  onEnd: (victory: boolean, retreated: boolean) => void;
  wrongNote?: string;
  retreatText?: string;
  onActivity?: () => void;
  glossary?: (q: PresentedQuestion) => boolean;
  progress?: { value: number; max: number; label: string };
  /** Placement trial: can't be lost, keeps going until the challenges are done. */
  trial?: boolean;
  /** Hero avatar (emoji). */
  avatar?: string;
  bossName?: string;
}
