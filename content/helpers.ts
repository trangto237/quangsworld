import type { ConceptDef, Question } from '@atlas/shared';

/**
 * Compact authoring helper. `choices[0]` is always the correct answer in source;
 * the presentation layer shuffles options so the position is never predictable.
 */
/** `idPrefix` keeps ids unique when several files add questions to the same concept. */
export function makeBank(source: string, idPrefix = '') {
  const counters = new Map<string, number>();
  const list: Question[] = [];
  function add(
    conceptId: string,
    difficulty: number,
    prompt: string,
    choices: string[],
    extra: Partial<Pick<Question, 'explanation' | 'explanationVi' | 'promptVi' | 'figure' | 'type' | 'audio' | 'passage' | 'sign' | 'script' | 'setId' | 'accept'>> = {},
  ) {
    const n = (counters.get(conceptId) ?? 0) + 1;
    counters.set(conceptId, n);
    list.push({
      id: `${conceptId}#${idPrefix}${n}`,
      conceptId,
      difficulty,
      type: extra.type ?? (extra.audio || extra.script ? 'listen' : extra.passage ? 'read' : 'mcq'),
      prompt,
      options: choices,
      answer: 0,
      explanation: extra.explanation,
      explanationVi: extra.explanationVi,
      promptVi: extra.promptVi,
      figure: extra.figure,
      audio: extra.audio,
      passage: extra.passage,
      sign: extra.sign,
      script: extra.script,
      setId: extra.setId,
      accept: extra.accept,
      source,
    });
  }
  return { add, list };
}

export type ConceptSeed = Omit<ConceptDef, 'subject'>;
