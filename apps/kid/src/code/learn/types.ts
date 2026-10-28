/**
 * 🐍 Learn Python — a course of short lessons, like the LearnPython apps: a path of units, each unit a
 * few lessons, each lesson a handful of steps that explain one idea and then practise it straight away.
 * Every Python snippet here is run by a test with real Python, so the answers are always right.
 */

export type Bi = { en: string; vi: string };
export const bi = (en: string, vi: string): Bi => ({ en, vi });
/** Vietnamese-only text (the literature course is taught in Vietnamese). */
export const vn = (s: string): Bi => ({ en: s, vi: s });

export type Step =
  /** An explanation, with an optional example and what it prints. */
  | { kind: 'read'; text: Bi; code?: string; output?: string; title?: Bi }
  /**
   * A multiple-choice question. Options are shown as code when `codeOptions` (outputs, lines of code),
   * else as text (plain strings, or Bi for words that need translating).
   * With `prints`, the test runs `code` and checks it prints exactly options[answer].
   */
  | { kind: 'choice'; ask: Bi; code?: string; options: (string | Bi)[]; answer: number; why: Bi; prints?: boolean; codeOptions?: boolean }
  /**
   * Fill the blanks: `code` has one "___" per blank; he taps words from the bank to fill them in order.
   * `answers` are the right words (in order); the bank is answers plus `extra` decoys, shuffled.
   * With `output`, the test fills the blanks and checks the program prints exactly that.
   */
  | { kind: 'fill'; ask: Bi; code: string; answers: string[]; extra: string[]; why: Bi; output?: string }
  /** Put the lines in order (`lines` is the right order; shown shuffled). With `output`, the test checks it. */
  | { kind: 'order'; ask: Bi; lines: string[]; why: Bi; output?: string }
  /** Type exactly what this prints (the test runs `code` and checks `answer`). */
  | { kind: 'output'; ask: Bi; code: string; answer: string; why: Bi }
  /**
   * Write (or finish) a program; it runs in the app's Python and passes when it prints exactly `expect`.
   * `stdin`: what input() will read, one line each. The test runs `solution` and checks it prints `expect`.
   */
  | { kind: 'write'; task: Bi; starter: string; expect: string; solution: string; hint: Bi; stdin?: string[] }
  /**
   * Guided writing (literature): a short task (1–3 sentences) with sentence starters. He writes, then sees a
   * model answer and ticks a checklist to compare. Nothing is graded: it teaches by showing what good looks like.
   */
  | { kind: 'compose'; task: Bi; frame?: string; model: string; checklist: string[]; tip?: Bi };

export interface PyLesson {
  /** Unique across the course, e.g. "u3-l2". */
  id: string;
  title: Bi;
  steps: Step[];
}

export interface PyUnit {
  id: string;
  emoji: string;
  title: Bi;
  /** One line under the title. */
  blurb: Bi;
  lessons: PyLesson[];
}
