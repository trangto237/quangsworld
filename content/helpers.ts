import type { ConceptDef, Question, QuestionType } from '@atlas/shared';

/**
 * Compact authoring helper. `choices[0]` is always the correct answer in source;
 * the presentation layer shuffles options so the position is never predictable.
 */
export function makeBank(source: string) {
  const counters = new Map<string, number>();
  const list: Question[] = [];
  function add(
    conceptId: string,
    difficulty: number,
    prompt: string,
    choices: string[],
    extra: { explanation?: string; type?: QuestionType; audio?: string; passage?: string } = {},
  ) {
    const n = (counters.get(conceptId) ?? 0) + 1;
    counters.set(conceptId, n);
    list.push({
      id: `${conceptId}#${n}`,
      conceptId,
      difficulty,
      type: extra.type ?? (extra.audio ? 'listen' : extra.passage ? 'read' : 'mcq'),
      prompt,
      options: choices,
      answer: 0,
      explanation: extra.explanation,
      audio: extra.audio,
      passage: extra.passage,
      source,
    });
  }
  return { add, list };
}

export type ConceptSeed = Omit<ConceptDef, 'subject'>;
