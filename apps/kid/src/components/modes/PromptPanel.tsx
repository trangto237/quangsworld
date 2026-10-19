import { useEffect, useState } from 'react';
import { translatePrompt, type PresentedQuestion } from '@atlas/knowledge';
import { cx } from '@atlas/ui';
import { playQuestionAudio } from '../../lib/speech';
import { SignBox } from '../QuestionCard';
import { GlossText } from '../GlossText';
import { useLang } from '../../i18n';

/** Should tap-to-translate be on for this question? (Off where it would give the answer away.) */
export function useGloss(q: PresentedQuestion | null, allowed = true) {
  const lang = useLang();
  return !!q && allowed && lang !== 'en' && !q.conceptId.startsWith('en.vocab') && !q.conceptId.startsWith('custom.') && !q.conceptId.startsWith('lit.');
}

/**
 * The question part of an arcade mode (sign, passage, audio, prompt, 🇻🇳 instruction) — the
 * answers are drawn by the game itself (meteors, goal corners…).
 */
export function PromptPanel({ q, glossary = true, className, children }: { q: PresentedQuestion; glossary?: boolean; className?: string; children?: React.ReactNode }) {
  const lang = useLang();
  const [showVi, setShowVi] = useState(lang === 'vi');
  const vi = lang !== 'en' ? translatePrompt(q.prompt, q.conceptId) : null;
  const gloss = useGloss(q, glossary);
  useEffect(() => setShowVi(lang === 'vi'), [q, lang]);
  return (
    <div className={cx('rounded-2xl bg-white/95 p-4 text-slate-900 shadow-xl dark:bg-slate-900/95 dark:text-slate-100', className)}>
      {q.sign && <SignBox text={q.sign} />}
      {q.passage && (
        <p className="mb-2 max-h-32 overflow-y-auto whitespace-pre-line rounded-lg bg-amber-50 p-2 text-sm text-amber-950 dark:bg-amber-950/40 dark:text-amber-100">
          <GlossText text={q.passage} enabled={gloss} />
        </p>
      )}
      <div className="flex items-start gap-2">
        {(q.audio || q.script) && (
          <button onClick={() => playQuestionAudio(q)} className="shrink-0 rounded-lg bg-violet-100 px-2 py-1 text-lg dark:bg-violet-950" aria-label="Replay audio">
            🔊
          </button>
        )}
        <p className="flex-1 whitespace-pre-line font-display text-lg font-semibold leading-snug sm:text-xl">
          <GlossText text={q.prompt} enabled={gloss} />
        </p>
        {vi && (
          <button onClick={() => setShowVi((v) => !v)} className="shrink-0 rounded-lg px-2 py-1 text-sm ring-1 ring-slate-300 dark:ring-slate-700" aria-pressed={showVi} aria-label="Show Vietnamese instruction">
            🇻🇳
          </button>
        )}
      </div>
      {vi && showVi && <p className="mt-1 text-sm text-rose-900 dark:text-rose-200">{vi}</p>}
      {children}
    </div>
  );
}
