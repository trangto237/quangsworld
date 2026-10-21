import { useEffect, useRef, useState } from 'react';
import { glossaryLookup, type PresentedQuestion } from '@atlas/knowledge';
import { cx } from '@atlas/ui';
import { T, TB } from '../i18n';
import { ASK, type Flashcard } from '../lib/flashcard';
import { speak, stopSpeaking } from '../lib/speech';

/**
 * A Word Garden flashcard: the word big on a card (tap 🔊 to hear it), four meanings to pick from.
 * After answering, the card shows the right answer and the Vietnamese meaning when we know it.
 * A right answer closes by itself; a wrong one waits for "Next" so he can read it.
 */
export function FlashCardView({ card, q, onAnswer }: { card: Flashcard; q: PresentedQuestion; onAnswer: (correct: boolean, ms: number, picked: string) => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const shownAt = useRef(performance.now());
  const result = useRef<{ correct: boolean; ms: number; text: string } | null>(null);
  const answered = picked !== null;
  const right = q.shown[q.correct];
  // The English word to explain: the card's word, or the answer when the card shows a meaning.
  const word = card.word ?? right;
  const vi = glossaryLookup(word)?.vi;

  useEffect(() => {
    if (card.word) speak(card.word);
    return () => {
      stopSpeaking();
    };
  }, [card.word]);

  const finish = () => result.current && onAnswer(result.current.correct, result.current.ms, result.current.text);
  const choose = (i: number) => {
    if (answered) return;
    setPicked(i);
    const correct = i === q.correct;
    result.current = { correct, ms: Math.round(performance.now() - shownAt.current), text: q.shown[i] };
    if (correct) setTimeout(finish, 900);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const i = ['1', '2', '3', '4'].indexOf(e.key);
      if (i >= 0 && i < q.shown.length) choose(i);
      if (e.key === 'Enter' && answered && result.current && !result.current.correct) finish();
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  const long = card.front.length > 28;
  return (
    <div>
      <p className="text-center font-display text-sm font-bold uppercase tracking-wide text-ink-soft">
        <T en={ASK[card.ask].en} />
      </p>
      {/* The card */}
      <div
        className={cx(
          'relative mx-auto mt-2 grid min-h-36 max-w-md place-items-center rounded-2xl border-[3px] border-ink bg-[repeating-linear-gradient(transparent,transparent_27px,rgba(74,46,24,0.08)_28px)] px-5 py-6 text-center shadow-[0_5px_0_var(--ink)]',
          answered ? (result.current?.correct ? 'bg-[#e6f6d5]' : 'bg-[#fde3dc]') : 'bg-paper',
        )}
      >
        <div>
          <div className={cx('font-display font-bold leading-tight text-ink-text', long ? 'text-xl' : 'text-4xl')} lang={card.word ? 'en' : undefined}>
            {card.front}
          </div>
          {answered && (
            <div className="mt-2 animate-pop text-sm font-semibold text-ink-soft">
              {card.ask === 'meaning' ? right : <span lang="en">{word}</span>}
              {vi && <span className="block text-ink-text">🇻🇳 {vi}</span>}
            </div>
          )}
        </div>
        {card.word && (
          <button onClick={() => speak(card.word!)} className="town-btn absolute right-2 top-2 grid size-9 place-items-center rounded-full bg-paper text-base" aria-label="Hear the word">
            🔊
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {q.shown.map((o, i) => (
          <button
            key={i}
            aria-disabled={answered}
            onClick={() => choose(i)}
            className={cx(
              'town-btn rounded-xl px-3 py-2.5 text-left font-semibold leading-snug',
              !answered && 'bg-white hover:bg-paper-3',
              answered && i === q.correct && 'bg-[#8fd36a] text-ink-text',
              answered && i === picked && i !== q.correct && 'bg-[#f08a73] text-ink-text',
              answered && i !== q.correct && i !== picked && 'bg-white opacity-50',
            )}
          >
            {o}
          </button>
        ))}
      </div>

      {answered && !result.current?.correct && (
        <div className="mt-3 animate-pop">
          {q.explanation && <p className="text-sm text-ink-soft">💡 {q.explanation}</p>}
          <p className="mt-1 text-xs text-ink-soft">
            <T en="📕 Saved to your Mistake Book" />
          </p>
          <button onClick={finish} className="town-btn mt-2 w-full rounded-xl bg-[#ffc23d] py-2.5 font-display font-bold text-ink-text">
            <TB en="Next" /> ⏎
          </button>
        </div>
      )}
    </div>
  );
}
