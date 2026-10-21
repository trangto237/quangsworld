import { describe, expect, it } from 'vitest';
import { allConcepts, pickQuestion } from '@atlas/knowledge';
import { rng } from '@atlas/shared';
import { flashcardOf } from './flashcard';
import { isVocab } from './garden';

const q = (prompt: string) => ({ prompt, type: 'mcq' as const, options: ['a', 'b', 'c', 'd'] });

describe('flashcards', () => {
  it('reads word–meaning questions as cards', () => {
    expect(flashcardOf(q('What does "nervous" mean?'))).toEqual({ front: 'nervous', word: 'nervous', ask: 'meaning' });
    expect(flashcardOf(q('Which phrase means "học vẹt"?'))).toEqual({ front: 'học vẹt', word: null, ask: 'word' });
    expect(flashcardOf(q('Choose the word closest in meaning to "decline" (as in "sales declined").'))).toMatchObject({ front: 'decline', ask: 'same' });
    expect(flashcardOf(q('Choose the OPPOSITE of "silent".'))).toMatchObject({ front: 'silent', ask: 'opposite' });
  });

  it('leaves sentences and word forms out', () => {
    expect(flashcardOf(q('Complete: Always ___ the truth.'))).toBeNull();
    expect(flashcardOf(q('Complete with the right form of "harm": Smoking is ___ to your health.'))).toBeNull();
    expect(flashcardOf(q('The train was cancelled, so we had to ___ our trip.'))).toBeNull();
  });

  it('the main word topics have plenty of cards', () => {
    for (const id of ['en.vocab.everyday', 'en.vocab.academic', 'en.vocab.synonyms', 'en.ielts.lex.education']) {
      let n = 0;
      for (let s = 1; s <= 40; s++) if (flashcardOf(pickQuestion({ conceptId: id, difficulty: 1 + (s % 5), rand: rng(s) })!)) n++;
      expect(n, id).toBeGreaterThan(15);
    }
    expect(allConcepts().filter((c) => isVocab(c.id)).length).toBeGreaterThan(5);
  });
});
