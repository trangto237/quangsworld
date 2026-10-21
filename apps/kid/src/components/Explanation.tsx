import type { Question } from '@atlas/shared';
import { LESSONS_VI, getConcept, mistakeNote, stressOf, translateExplanation, unmark } from '@atlas/knowledge';
import { Marked } from '@atlas/ui';
import { speak } from '../lib/speech';
import { T, useLang } from '../i18n';
import { GlossText } from './GlossText';
import { useState } from 'react';
import { CoachWalkthrough } from './Coach';

/** "Your answer / right answer / why" — used in the post-battle review and the Mistake Book. */
export function Explanation({ question: q, picked }: { question: Question; picked?: string }) {
  const lang = useLang();
  const concept = getConcept(q.conceptId);
  const right = q.options[q.answer];
  const help = lang !== 'en';
  const explanationVi = help ? (q.explanationVi ?? translateExplanation(q.explanation)) : null;
  const lessonVi = help ? LESSONS_VI[q.conceptId] : undefined;
  const [coachOpen, setCoachOpen] = useState(false);
  const canCoach = q.conceptId.startsWith('en.');
  // About his mistake first; the general rule is tucked away below.
  const mistake = picked && picked !== right ? mistakeNote(q, picked) : null;
  return (
    <div className="space-y-2 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800/60">
      {picked && picked !== right && (
        <p>
          <span className="font-bold text-rose-600 dark:text-rose-400">
            <T en="✗ You chose:" />
          </span>{' '}
          <Marked text={picked} />
        </p>
      )}
      <p>
        <span className="font-bold text-emerald-700 dark:text-emerald-400">
          <T en="✓ Answer:" />
        </span>{' '}
        <b>
          <Marked text={right} />
        </b>
      </p>
      {q.script && (
        <details className="text-slate-600 dark:text-slate-300">
          <summary className="cursor-pointer font-bold">
            <T en="📄 Show the transcript" />
          </summary>
          <div className="mt-1 space-y-1">
            {q.script.map((l, i) => (
              <p key={i}>
                {q.script!.length > 1 && <b>{l.who === 'A' ? '👤' : l.who === 'B' ? '🙋' : '🎙️'} </b>}
                <GlossText text={l.text} enabled={help} />
              </p>
            ))}
          </div>
        </details>
      )}
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
      {q.conceptId.startsWith('en.pron') && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-bold">
            <T en="🔊 Hear the words:" />
          </span>
          {q.options.map((o) => (
            <button
              key={o}
              onClick={() => speak(unmark(o), 0.8)}
              className={`rounded-lg px-2 py-1 text-sm ring-1 ${o === right ? 'bg-emerald-50 ring-emerald-300 dark:bg-emerald-950' : 'ring-slate-300 dark:ring-slate-600'}`}
            >
              🔊 {stressOf(o) ?? <Marked text={o} />}
            </button>
          ))}
        </div>
      )}
      {mistake && (
        <div className="space-y-1.5 rounded-lg border-l-4 border-rose-400 bg-rose-50 p-3 dark:bg-rose-950/40">
          <p className="font-bold text-rose-700 dark:text-rose-300">
            <T en="🎯 Your mistake" />
          </p>
          {mistake.map((m, i) => (
            <p key={i} className="text-slate-800 dark:text-slate-100">
              {m.en}
              {help && (
                <span lang="vi" className="mt-0.5 block text-rose-900 dark:text-rose-200">
                  🇻🇳 {m.vi}
                </span>
              )}
            </p>
          ))}
        </div>
      )}
      {q.explanation && !(mistake && q.conceptId.startsWith('en.pron')) && (
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
        <details className="text-slate-600 dark:text-slate-300">
          <summary className="cursor-pointer font-bold">
            📖 <T en="All the rules for" /> {concept.name}
          </summary>
          <p className="mt-1">
            <GlossText text={concept.lesson} enabled={help && concept.subject !== 'literature'} />
            {lessonVi && (
              <span lang="vi" className="mt-1 block text-rose-900 dark:text-rose-200">
                🇻🇳 {lessonVi}
              </span>
            )}
          </p>
        </details>
      )}
      {canCoach &&
        (coachOpen ? (
          <CoachWalkthrough question={q} picked={picked} />
        ) : (
          <button
            type="button"
            onClick={() => setCoachOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white shadow hover:bg-indigo-500"
          >
            🦉 <T en="Explain step by step with Coach Owl" />
          </button>
        ))}
    </div>
  );
}
