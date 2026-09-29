import type { Question } from '@atlas/shared';
import { getConcept } from '@atlas/knowledge';
import { speak } from '../lib/speech';

/** "Your answer / right answer / why" — used in the post-battle review and the Mistake Book. */
export function Explanation({ question: q, picked }: { question: Question; picked?: string }) {
  const concept = getConcept(q.conceptId);
  const right = q.options[q.answer];
  return (
    <div className="space-y-2 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800/60">
      {picked && picked !== right && (
        <p>
          <span className="font-bold text-rose-600 dark:text-rose-400">✗ You chose:</span> {picked}
        </p>
      )}
      <p>
        <span className="font-bold text-emerald-700 dark:text-emerald-400">✓ Answer:</span> <b>{right}</b>
      </p>
      {q.audio && (
        <p className="text-slate-600 dark:text-slate-300">
          <span className="font-bold">🔊 What was said:</span> “{q.audio}”{' '}
          <button className="font-semibold text-brand-600 hover:underline dark:text-brand-400" onClick={() => speak(q.audio!, 0.8)}>
            play slowly
          </button>
        </p>
      )}
      {q.explanation && <p className="text-slate-700 dark:text-slate-200">💡 {q.explanation}</p>}
      {concept?.lesson && (
        <p className="text-slate-600 dark:text-slate-300">
          <span className="font-bold">📖 {concept.name}:</span> {concept.lesson}
        </p>
      )}
    </div>
  );
}
