import type { Question } from '@atlas/shared';

/**
 * Word Garden cards are flashcards: one word (or set phrase) on the front, its meaning to pick. They are
 * read from the vocabulary questions that already pair a word with a meaning, so answers still count in
 * the learning model and mistakes still go to the Mistake Book. Fill-the-gap sentences, word forms and
 * collocations are left to the other islands.
 */
export interface Flashcard {
  /** What is written big on the card. */
  front: string;
  /** The English word on the card, to read aloud (null when the front is a meaning). */
  word: string | null;
  /** What to do: pick its meaning, the word for a meaning, a synonym or an opposite. */
  ask: 'meaning' | 'word' | 'same' | 'opposite';
}

const RULES: [RegExp, (m: RegExpMatchArray) => Flashcard][] = [
  [/^What does "(.+)" mean\?$/, (m) => ({ front: m[1], word: m[1], ask: 'meaning' })],
  [/^Which (?:word|phrase) means "(.+)"\?$/, (m) => ({ front: m[1], word: null, ask: 'word' })],
  [/^Choose the word closest in meaning to "([^"]+)"(?: \(as in "(.+)"\))?\.?$/, (m) => ({ front: m[1], word: m[1], ask: 'same' })],
  [/^Choose the OPPOSITE of "(.+)"\.$/, (m) => ({ front: m[1], word: m[1], ask: 'opposite' })],
];

export function flashcardOf(q: Pick<Question, 'prompt' | 'type' | 'options'>): Flashcard | null {
  if (q.type !== 'mcq' || q.options.length < 2) return null;
  for (const [re, make] of RULES) {
    const m = q.prompt.match(re);
    if (m) return make(m);
  }
  return null;
}

/** Instruction above the card. */
export const ASK: Record<Flashcard['ask'], { en: string }> = {
  meaning: { en: 'What does it mean?' },
  word: { en: 'Which word means this?' },
  same: { en: 'Which word means the same?' },
  opposite: { en: 'Which word means the opposite?' },
};
