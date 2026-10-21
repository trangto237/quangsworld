import { useState } from 'react';
import type { StudentProfile } from '@atlas/db';
import { conceptMission, isDue, stars } from '@atlas/engine';
import { MODES, modeFor, modesFor, type GameMode } from '@atlas/game';
import { WORLDS, conceptsInWorld } from '@atlas/knowledge';
import type { ConceptDef } from '@atlas/shared';
import { Modal, cx, useQuery } from '@atlas/ui';
import { TownScreen } from '../town/Shell';
import { TownButton } from '../town/ui';
import { useKid } from '../store';
import { LESSONS_VI } from '@atlas/knowledge';
import { T, TB, useLang } from '../i18n';
import { WordGarden } from './Garden';

export function WorldScreen({ student, worldId }: { student: StudentProfile; worldId: string }) {
  const go = useKid((s) => s.go);
  const world = WORLDS.find((w) => w.id === worldId)!;
  const concepts = conceptsInWorld(world);
  const states = useQuery((r) => r.getStates(student.id), [student.id]);
  const [open, setOpen] = useState<ConceptDef | null>(null);
  const [mode, setMode] = useState<GameMode | null>(null);
  const lang = useLang();

  return (
    <TownScreen student={student} tab="map" back={() => go({ name: 'hub' })}>
      <div className="town-panel mx-auto max-w-md p-4 text-center">
        <div className="mx-auto grid size-20 place-items-center rounded-2xl border-[2.5px] border-ink text-5xl" style={{ background: `${world.color}55` }}>
          {world.emoji}
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold leading-tight">
          <T en={world.name} />
        </h1>
        <p className="text-ink-soft">
          <T en={world.blurb} />
        </p>
      </div>
      {world.subject === 'literature' && (
        <div className="mx-auto mt-4 max-w-md">
          <TownButton tone="amber" className="w-full py-3" onClick={() => go({ name: 'writing' })}>
            ✍️ <TB en="Writing studio" /> — nghị luận văn học & xã hội
          </TownButton>
        </div>
      )}
      {world.id === 'word-forest' && (
        <>
          <div className="mt-4">
            <WordGarden student={student} />
          </div>
          <h2 className="mx-auto mt-6 max-w-md text-center font-display text-xl font-bold">
            📖 <T en="Learn words → earn 💧" />
          </h2>
        </>
      )}
      {/* A winding path of mission nodes */}
      <ol className="relative mx-auto mt-6 max-w-md">
        <div className="absolute bottom-6 left-1/2 top-6 w-1.5 -translate-x-1/2 rounded border-x-2 border-ink" style={{ background: `${world.color}88` }} aria-hidden />
        {concepts.map((c, i) => {
          const s = states[c.id];
          const st = stars(s);
          const due = s && s.attempts > 0 && isDue(s);
          return (
            <li key={c.id} className={cx('relative mb-5 flex', i % 2 ? 'justify-end' : 'justify-start')}>
              <button onClick={() => setOpen(c)} className="town-btn relative w-[72%] rounded-2xl bg-paper p-3 text-left hover:bg-paper-3">
                {due && (
                  <span className="absolute -right-2 -top-2 rounded-full border-2 border-ink bg-[#8b5cf6] px-2 py-0.5 text-xs font-bold text-white">
                    <T en="Review" />
                  </span>
                )}
                <div className="font-display text-lg font-bold leading-tight">{c.missionName}</div>
                <div className="text-xs font-semibold text-ink-soft">{c.name}</div>
                <div className="mt-1 text-lg tracking-widest" aria-label={`${st} of 3 stars`}>
                  <span className="text-[#f5a623]">{'★'.repeat(st)}</span>
                  <span className="text-ink/20">{'★'.repeat(3 - st)}</span>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
      <Modal
        open={!!open}
        onClose={() => {
          setOpen(null);
          setMode(null);
        }}
        title={open?.missionName}
      >
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
            {open.id.startsWith('en.') && (
              <button
                type="button"
                onClick={() => go({ name: 'coach', conceptId: open.id })}
                className="mt-2 text-sm font-semibold text-indigo-700 hover:underline dark:text-indigo-300"
              >
                🦉 <T en="Learn the rules with Coach Owl" />
              </button>
            )}
            <p className="mt-5 text-xs font-bold uppercase tracking-wide text-slate-500">
              <T en="Play as" />
            </p>
            <div className="mt-2 grid grid-cols-3 gap-1.5 sm:gap-2">
              {(Object.keys(MODES) as GameMode[]).map((m) => {
                const suited = modesFor([open.id]);
                const best = suited[0];
                const selected = (mode ?? best) === m;
                return (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={cx(
                      'relative flex flex-col items-center rounded-xl p-2 text-center text-xs ring-2 transition sm:text-sm',
                      selected ? 'bg-amber-50 ring-amber-400 dark:bg-amber-950/40' : 'ring-slate-200 hover:bg-slate-50 dark:ring-slate-700 dark:hover:bg-slate-800',
                    )}
                    aria-pressed={selected}
                    title={MODES[m].blurb}
                  >
                    <span className="text-2xl leading-none sm:text-3xl">{MODES[m].emoji}</span>
                    <b className="mt-1 leading-tight">
                      <T en={MODES[m].name} />
                    </b>
                    <span className="mt-0.5 hidden text-[11px] leading-snug text-slate-500 sm:block dark:text-slate-400">
                      <T en={MODES[m].blurb} />
                    </span>
                    {m === best ? (
                      <span className="absolute -top-2 right-1 rounded bg-emerald-100 px-1 text-[9px] font-bold uppercase text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                        <T en="recommended" />
                      </span>
                    ) : (
                      suited.includes(m) && (
                        <span className="absolute -top-2 right-1 rounded bg-sky-100 px-1 text-[9px] font-bold uppercase text-sky-800 dark:bg-sky-900 dark:text-sky-200">
                          <T en="good fit" />
                        </span>
                      )
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <TownButton tone="paper" onClick={() => go({ name: 'battle', mission: { ...conceptMission(open.id, 3), mode: mode ?? modeFor([open.id]) }, fromPlan: false })}>
                <TB en="⚡ Quick (3 min)" />
              </TownButton>
              <TownButton tone="green" onClick={() => go({ name: 'battle', mission: { ...conceptMission(open.id, 6), mode: mode ?? modeFor([open.id]) }, fromPlan: false })}>
                <TB en="⚔️ Play (6 min)" />
              </TownButton>
            </div>
          </div>
        )}
      </Modal>
    </TownScreen>
  );
}
