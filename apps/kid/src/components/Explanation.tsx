import type { Question } from '@atlas/shared';
import { LESSONS_VI, getConcept, translateExplanation } from '@atlas/knowledge';
import { speak } from '../lib/speech';
import { T, useLang } from '../i18n';
import { GlossText } from './GlossText';

/** "Your answer / right answer / why" — used in the post-battle review and the Mistake Book. */
export function Explanation({ question: q, picked }: { question: Question; picked?: string }) {
  const lang = useLang();
  const concept = getConcept(q.conceptId);
  const right = q.options[q.answer];
  const help = lang !== 'en';
  const explanationVi = help ? translateExplanation(q.explanation) : null;
  const lessonVi = help ? LESSONS_VI[q.conceptId] : undefined;
  return (
    <div className="space-y-2 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800/60">
      {picked && picked !== right && (
        <p>
          <span className="font-bold text-rose-600 dark:text-rose-400">
            <T en="✗ You chose:" />
          </span>{' '}
          {picked}
        </p>
      )}
      <p>
        <span className="font-bold text-emerald-700 dark:text-emerald-400">
          <T en="✓ Answer:" />
        </span>{' '}
        <b>{right}</b>
      </p>
      {q.audio && (
        <p className="text-slate-600 dark:text-slate-300">
          <span className="font-bold">
            <T en="🔊 What was said:" />
          </span>{' '}
          “<GlossText text={q.audio} enabled={help} />”{' '}
          <button className="font-semibold text-brand-600 hover:underline dark:text-brand-400" onClick={() => speak(q.audio!, 0.8)}>
            <T en="play slowly" />
          </button>
        </p>
      )}
      {q.explanation && (
        <p className="text-slate-700 dark:text-slate-200">
          💡 <GlossText text={q.explanation} enabled={help} />
          {explanationVi && (
            <span lang="vi" className="mt-1 block text-rose-900 dark:text-rose-200">
              🇻🇳 {explanationVi}
            </span>
          )}
        </p>
      )}
      {concept?.lesson && (
        <p className="text-slate-600 dark:text-slate-300">
          <span className="font-bold">📖 {concept.name}:</span> <GlossText text={concept.lesson} enabled={help && concept.subject !== 'literature'} />
          {lessonVi && (
            <span lang="vi" className="mt-1 block text-rose-900 dark:text-rose-200">
              🇻🇳 {lessonVi}
            </span>
          )}
        </p>
      )}
    </div>
  );
}
