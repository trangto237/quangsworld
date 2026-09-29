import { useState } from 'react';
import type { Mistake } from '@atlas/db';
import { getConcept, translatePrompt } from '@atlas/knowledge';
import { T, TB, useLang } from '../i18n';
import { GlossText } from './GlossText';
import { Button, Progress } from '@atlas/ui';
import { Explanation } from './Explanation';

/**
 * Post-battle review: one missed question at a time, with the answer and the reason —
 * the explanations there was no time to read during the battle.
 */
export function MistakeReview({ mistakes, onDone }: { mistakes: Mistake[]; onDone: () => void }) {
  const [i, setI] = useState(0);
  const m = mistakes[i];
  const q = m.question;
  const last = i === mistakes.length - 1;
  const lang = useLang();
  const promptVi = lang !== 'en' ? translatePrompt(q.prompt, q.conceptId) : null;
  return (
    <div className="w-full max-w-xl animate-pop rounded-3xl bg-white p-6 text-slate-900 shadow-2xl dark:bg-slate-900 dark:text-slate-100">
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide text-slate-500">
        <span>
          <T en="📕 Mistake review" />
        </span>
        <span className="tabular-nums">
          {i + 1} / {mistakes.length}
        </span>
      </div>
      <Progress value={i + 1} max={mistakes.length} className="mt-2" label="Review progress" />
      <p className="mt-4 text-xs font-semibold text-slate-500">{getConcept(m.conceptId)?.missionName}</p>
      {q.passage && (
        <p className="mt-2 max-h-36 overflow-y-auto rounded-xl bg-amber-50 p-3 text-sm text-amber-950 dark:bg-amber-950/40 dark:text-amber-100">
          <GlossText text={q.passage} enabled={lang !== 'en'} />
        </p>
      )}
      <p className="mt-2 font-display text-xl font-semibold leading-snug">
        <GlossText text={q.prompt} enabled={lang !== 'en' && !q.conceptId.startsWith('lit.')} />
      </p>
      {promptVi && (
        <p lang="vi" className="mt-1 text-sm text-rose-900 dark:text-rose-200">
          🇻🇳 {promptVi}
        </p>
      )}
      <div className="mt-4">
        <Explanation question={q} picked={m.picked} />
      </div>
      {m.times > 1 && (
        <p className="mt-2 text-xs text-slate-500">
          <T en="Missed {n} times — it stays in your Mistake Book until you get it right there." vars={{ n: m.times }} />
        </p>
      )}
      <div className="mt-5 flex gap-2">
        {i > 0 && (
          <Button variant="secondary" onClick={() => setI(i - 1)}>
            <TB en="← Back" />
          </Button>
        )}
        <Button variant="game" className="flex-1 py-3" onClick={() => (last ? onDone() : setI(i + 1))} autoFocus>
          <TB en={last ? 'Done ✓' : 'Got it →'} />
        </Button>
      </div>
    </div>
  );
}
