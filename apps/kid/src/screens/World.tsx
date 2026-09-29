import { useState } from 'react';
import type { StudentProfile } from '@atlas/db';
import { conceptMission, isDue, stars } from '@atlas/engine';
import { WORLDS, conceptsInWorld } from '@atlas/knowledge';
import type { ConceptDef } from '@atlas/shared';
import { Button, Modal, cx, useQuery } from '@atlas/ui';
import { TopBar } from '../components/TopBar';
import { useKid } from '../store';
import { LESSONS_VI } from '@atlas/knowledge';
import { T, TB, useLang } from '../i18n';

export function WorldScreen({ student, worldId }: { student: StudentProfile; worldId: string }) {
  const go = useKid((s) => s.go);
  const world = WORLDS.find((w) => w.id === worldId)!;
  const concepts = conceptsInWorld(world);
  const states = useQuery((r) => r.getStates(student.id), [student.id]);
  const [open, setOpen] = useState<ConceptDef | null>(null);
  const lang = useLang();

  return (
    <div className="min-h-dvh text-white" style={{ background: `radial-gradient(circle at 30% 0%, ${world.color}, #020617 70%)` }}>
      <TopBar student={student} back={() => go({ name: 'hub' })} />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="text-center">
          <div className="text-6xl">{world.emoji}</div>
          <h1 className="mt-2 font-display text-3xl font-bold">
            <T en={world.name} />
          </h1>
          <p className="text-white/70">
            <T en={world.blurb} />
          </p>
        </div>
        {/* A winding path of mission nodes */}
        <ol className="relative mx-auto mt-8 max-w-md">
          <div className="absolute bottom-6 left-1/2 top-6 w-1 -translate-x-1/2 rounded bg-white/15" aria-hidden />
          {concepts.map((c, i) => {
            const s = states[c.id];
            const st = stars(s);
            const due = s && s.attempts > 0 && isDue(s);
            return (
              <li key={c.id} className={cx('relative mb-6 flex', i % 2 ? 'justify-end' : 'justify-start')}>
                <button
                  onClick={() => setOpen(c)}
                  className="relative w-[70%] rounded-2xl bg-slate-950/70 p-4 text-left ring-2 ring-white/10 backdrop-blur transition hover:ring-amber-300"
                >
                  {due && (
                    <span className="absolute -right-2 -top-2 rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold">
                      <T en="Review" />
                    </span>
                  )}
                  <div className="font-display text-lg font-semibold">{c.missionName}</div>
                  <div className="text-xs text-white/60">{c.name}</div>
                  <div className="mt-1 text-lg tracking-widest" aria-label={`${st} of 3 stars`}>
                    {'★'.repeat(st)}
                    <span className="text-white/20">{'★'.repeat(3 - st)}</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      </main>
      <Modal open={!!open} onClose={() => setOpen(null)} title={open?.missionName}>
        {open && (
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{open.name}</p>
            {open.lesson && (
              <div className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-950 dark:bg-amber-950/40 dark:text-amber-100">
                <b>
                  <T en="📖 Scroll of wisdom" />:
                </b>{' '}
                {open.lesson}
                {lang !== 'en' && LESSONS_VI[open.id] && (
                  <span lang="vi" className="mt-1 block text-rose-900 dark:text-rose-200">
                    🇻🇳 {LESSONS_VI[open.id]}
                  </span>
                )}
              </div>
            )}
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={() => go({ name: 'battle', mission: conceptMission(open.id, 3), fromPlan: false })}>
                <TB en="⚡ Quick (3 min)" />
              </Button>
              <Button variant="game" onClick={() => go({ name: 'battle', mission: conceptMission(open.id, 6), fromPlan: false })}>
                <TB en="⚔️ Battle (6 min)" />
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
