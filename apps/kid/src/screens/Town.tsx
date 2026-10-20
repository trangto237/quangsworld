import { useMemo, useState } from 'react';
import type { StudentProfile } from '@atlas/db';
import { isDue, levelFromXp, stars } from '@atlas/engine';
import { conceptsInWorld, visibleWorlds } from '@atlas/knowledge';
import { useQuery } from '@atlas/ui';
import { todayPlan } from '../lib/plan';
import { useKid } from '../store';
import { T, TB, tr, useLang } from '../i18n';
import { BottomNav, HeroBar, rankFor } from '../town/Shell';
import { TownMap, levelFor, type Spot, type SpotState } from '../town/TownMap';
import { Meter, Ribbon, TownButton } from '../town/ui';

/** Home: the town map. Each world is a building that grows as the hero earns stars there. */
export function Town({ student }: { student: StudentProfile }) {
  const go = useKid((s) => s.go);
  const lang = useLang();
  const plan = useQuery((r) => todayPlan(r, student.id), [student.id]);
  const states = useQuery((r) => r.getStates(student.id), [student.id]);
  const exams = useQuery((r) => r.listExamResults(student.id).length, [student.id]);
  const wallet = useQuery((r) => r.getWallet(student.id), [student.id]);
  const next = plan.missions.find((m) => !m.done);
  const doneCount = plan.missions.filter((m) => m.done).length;

  const spots = useMemo(() => {
    const worlds = visibleWorlds();
    const worldOf = new Map<string, string>();
    for (const w of worlds) for (const c of conceptsInWorld(w)) worldOf.set(c.id, w.id);
    const questWorld = next ? next.concepts.map((c) => worldOf.get(c)).find(Boolean) : undefined;
    const out: Record<string, SpotState> = {};
    for (const w of worlds) {
      const cs = conceptsInWorld(w);
      const got = cs.reduce((s, c) => s + stars(states[c.id]), 0);
      const due = cs.filter((c) => states[c.id] && states[c.id].attempts > 0 && isDue(states[c.id])).length;
      out[w.id] = {
        level: levelFor(got, cs.length * 3),
        title: tr(lang, w.name),
        sub: `⭐ ${got}/${cs.length * 3}`,
        icon: w.emoji,
        color: w.color,
        due,
        quest: w.id === questWorld,
        blurb: tr(lang, w.blurb),
      };
    }
    if (!out['my-textbook']) out['my-textbook'] = { level: 0, title: '', icon: '', color: '#888', hidden: true };
    out['exam-hall'] = {
      level: 2,
      title: tr(lang, 'Exam Hall'),
      sub: tr(lang, '{n} exams done', { n: exams }),
      icon: '🏛️',
      color: '#c0583e',
      blurb: tr(lang, 'Practice papers for the grade-10 entrance exam.'),
    };
    out.coach = { level: 2, title: tr(lang, 'Coach Owl'), sub: tr(lang, 'Rules & tips'), icon: '🦉', color: '#8b5cf6', blurb: tr(lang, 'Every rule explained, with practice.') };
    out.shop = { level: 2, title: tr(lang, 'Armoury'), sub: `🪙 ${wallet.coins}`, icon: '🛒', color: '#e8584a', blurb: tr(lang, 'Spend the coins and gems you earn in battle.') };
    out.home = {
      level: 2,
      title: student.name,
      sub: tr(lang, rankFor(levelFromXp(wallet.xp).level)),
      icon: student.avatar,
      color: '#ffc23d',
      blurb: tr(lang, 'Your hero: powers, badges and settings.'),
    };
    return { out, questWorld };
  }, [states, next, lang, exams, wallet, student.name, student.avatar]);

  const [selected, setSelected] = useState<Spot | null>(null);
  const picked = selected ? spots.out[selected.id] : undefined;

  const open = (s: Spot) => {
    if (s.kind === 'exam-hall') go({ name: 'exam-hall' });
    else if (s.kind === 'coach') go({ name: 'coach' });
    else if (s.kind === 'shop') go({ name: 'shop' });
    else if (s.kind === 'home') go({ name: 'hero' });
    else if (!spots.out[s.id]?.hidden) go({ name: 'world', worldId: s.id });
  };

  return (
    <div className="text-ink-text">
      <TownMap states={spots.out} onOpen={open} onSelect={setSelected} selected={selected?.id ?? null} focus={spots.questWorld ?? 'exam-hall'} hero={student.avatar} />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 [&>*]:pointer-events-auto">
        <HeroBar student={student} />
      </div>
      {/* A tapped place's card (phones), or today's quest, like a chapter card on the map. */}
      <div className="fixed inset-x-0 z-30 px-2" style={{ bottom: 'calc(96px + max(0.5rem, env(safe-area-inset-bottom)))' }}>
        {selected && picked ? (
          <div className="town-panel mx-auto flex max-w-xl items-center gap-3 px-3 py-2">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl border-2 border-ink text-2xl" style={{ background: `${picked.color}55` }}>
              {picked.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate font-display text-lg font-bold leading-tight">{picked.title}</div>
              <div className="truncate text-xs font-semibold text-ink-soft">
                {picked.sub}
                {picked.due ? ` · 🔁 ${picked.due}` : ''}
                {picked.quest ? ` · ⚔️ ${tr(lang, "Today's quest")}` : ''}
              </div>
              {picked.blurb && <div className="line-clamp-2 text-xs text-ink-soft">{picked.blurb}</div>}
            </div>
            <div className="flex shrink-0 flex-col gap-1">
              <TownButton tone="green" onClick={() => open(selected)}>
                <TB en="Enter ▶" />
              </TownButton>
              <button onClick={() => setSelected(null)} className="text-xs font-bold text-ink-soft underline">
                <T en="Close" />
              </button>
            </div>
          </div>
        ) : (
          <div className="town-panel mx-auto flex max-w-xl items-center gap-3 px-3 py-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Ribbon>
                  <T en="Today's quest" />
                </Ribbon>
                <span className="text-xs font-bold text-ink-soft">
                  {doneCount}/{plan.missions.length}
                </span>
              </div>
              <button onClick={() => go({ name: 'quests' })} className="mt-1 block w-full truncate text-left font-display text-base font-bold leading-tight">
                {next ? next.title : <T en="All done for today! 🏆" />}
              </button>
              <Meter value={doneCount} max={plan.missions.length} className="mt-1 h-2.5" />
            </div>
            {next ? (
              <TownButton tone="green" onClick={() => go({ name: 'battle', mission: next, fromPlan: true })}>
                <TB en="▶ Play" />
              </TownButton>
            ) : (
              <TownButton tone="amber" onClick={() => go({ name: 'quests' })}>
                <TB en="Quests" />
              </TownButton>
            )}
          </div>
        )}
      </div>
      <BottomNav student={student} active="map" />
    </div>
  );
}
