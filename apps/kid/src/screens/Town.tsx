import { useEffect, useMemo, useRef, useState } from 'react';
import type { StudentProfile } from '@atlas/db';
import { isDue, levelFromXp, stars, studyStreak } from '@atlas/engine';
import { DAY_MS } from '@atlas/shared';
import { conceptsInWorld, visibleWorlds } from '@atlas/knowledge';
import { useQuery, useRepo } from '@atlas/ui';
import { todayPlan } from '../lib/plan';
import { getSlots, inSlot } from '../lib/equipped';
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
  const repo = useRepo();
  const played = useQuery((r) => new Set(r.listAttempts(student.id).filter((a) => a.context !== 'placement').map((a) => a.conceptId)), [student.id]);
  const chestOpened = useQuery((r) => !!r.getKv(`chest:${student.id}:${plan.date}`), [student.id, plan.date]);
  const streak = useQuery((r) => studyStreak(r.listSessions(student.id, Date.now() - 60 * DAY_MS)), [student.id]);
  const slots = useQuery((r) => getSlots(r, student.id), [student.id]);
  const hero = `${inSlot(slots, 'hat')?.emoji ?? ''}${student.avatar}${inSlot(slots, 'pet')?.emoji ?? ''}`;
  const next = plan.missions.find((m) => !m.done);
  const doneCount = plan.missions.filter((m) => m.done).length;

  const spots = useMemo(() => {
    const worlds = visibleWorlds();
    const worldOf = new Map<string, string>();
    for (const w of worlds) for (const c of conceptsInWorld(w)) worldOf.set(c.id, w.id);
    const questWorld = next ? next.concepts.map((c) => worldOf.get(c)).find(Boolean) : undefined;
    // Today's path: each quest's building, in order.
    const path = plan.missions.map((m) => m.concepts.map((c) => worldOf.get(c)).find(Boolean) ?? 'exam-hall');
    const stopsAt = (id: string) => plan.missions.flatMap((m, i) => (path[i] === id ? [{ n: i + 1, done: !!m.done }] : []));
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
        unexplored: !cs.some((c) => played.has(c.id)),
        stops: stopsAt(w.id),
      };
      if (out[w.id].unexplored) out[w.id].sub = tr(lang, '❔ Unexplored');
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
    out.shop = { level: 2, title: tr(lang, 'Shop'), sub: `🪙 ${wallet.coins}`, icon: '🛒', color: '#e8584a', blurb: tr(lang, 'Hats, pets, effects and game items — earned by learning.') };
    out.home = {
      level: 2,
      title: student.name,
      sub: tr(lang, rankFor(levelFromXp(wallet.xp).level)),
      icon: student.avatar,
      color: '#ffc23d',
      blurb: tr(lang, 'Your hero: powers, badges and settings.'),
    };
    out['exam-hall'].stops = stopsAt('exam-hall');
    return { out, questWorld, path };
  }, [states, next, lang, exams, wallet, student.name, student.avatar, plan, played]);

  // Level-up moments: compare with what this device last showed; celebrate one building that grew.
  const seenKey = `atlas-town-seen:${student.id}`;
  const [grew, setGrew] = useState<{ id: string; text: string; title: string } | null>(null);
  const checked = useRef(false);
  useEffect(() => {
    if (checked.current) return;
    checked.current = true;
    const now: Record<string, { level: number; explored: boolean }> = {};
    for (const [id, st] of Object.entries(spots.out)) if (!st.hidden && !['exam-hall', 'coach', 'shop', 'home'].includes(id)) now[id] = { level: st.level, explored: !st.unexplored };
    let before: typeof now | null = null;
    try {
      before = JSON.parse(localStorage.getItem(seenKey) ?? 'null');
    } catch {
      /* first time on this device */
    }
    if (before) {
      for (const [id, n] of Object.entries(now)) {
        const b = before[id];
        if (!b) continue;
        const st = spots.out[id];
        if (n.level > b.level) {
          setGrew({ id, text: tr(lang, '🎉 Level {n}!', { n: n.level }), title: tr(lang, '{place} grew to level {n}!', { place: st.title, n: n.level }) });
          break;
        }
        if (n.explored && !b.explored) {
          setGrew({ id, text: tr(lang, '🎉 Explored!'), title: tr(lang, 'The fog has lifted over {place}!', { place: st.title }) });
          break;
        }
      }
    }
    try {
      localStorage.setItem(seenKey, JSON.stringify(now));
    } catch {
      /* storage blocked */
    }
  }, [spots.out, seenKey, lang]);
  useEffect(() => {
    if (!grew) return;
    const t = setTimeout(() => setGrew(null), 7000);
    return () => clearTimeout(t);
  }, [grew]);
  const shown = useMemo(() => (grew && spots.out[grew.id] ? { ...spots.out, [grew.id]: { ...spots.out[grew.id], grew: grew.text } } : spots.out), [spots.out, grew]);

  // Today's treasure chest: opens once every quest is done.
  const allDone = plan.missions.length > 0 && doneCount === plan.missions.length;
  const chestReward = { coins: 50 + 10 * Math.min(streak, 5), gems: 1, xp: 30 };
  const [chestNote, setChestNote] = useState<string | null>(null);
  useEffect(() => {
    if (!chestNote) return;
    const t = setTimeout(() => setChestNote(null), 6000);
    return () => clearTimeout(t);
  }, [chestNote]);
  const openChest = async () => {
    if (chestOpened) return setChestNote(tr(lang, "You've opened today's chest. A new one appears tomorrow!"));
    if (!allDone) return setChestNote(tr(lang, "Finish all of today's quests ({a}/{b}) to open the chest.", { a: doneCount, b: plan.missions.length }));
    if (await repo.openDailyChest(student.id, plan.date, chestReward))
      setChestNote(tr(lang, '🎁 +{c} coins, +{g} 💎, +{x} XP! See you tomorrow.', { c: chestReward.coins, g: chestReward.gems, x: chestReward.xp }));
  };

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
      <TownMap
        states={shown}
        path={spots.path}
        chest={{ state: chestOpened ? 'opened' : allDone ? 'ready' : 'locked', progress: `${doneCount}/${plan.missions.length}`, onOpen: () => void openChest() }}
        onOpen={open}
        onSelect={setSelected}
        selected={selected?.id ?? null}
        focus={grew?.id ?? spots.questWorld ?? 'exam-hall'}
        hero={hero}
      />
      {(grew || chestNote) && (
        <div className="pointer-events-none fixed inset-x-0 top-40 z-30 flex justify-center px-3">
          <div className="town-panel pointer-events-auto flex max-w-md items-center gap-3 px-4 py-3 animate-pop">
            <span className="text-3xl">{grew ? '🏗️' : '🎁'}</span>
            <p className="font-display text-lg font-bold leading-tight">{grew ? grew.title : chestNote}</p>
            <button onClick={() => (setGrew(null), setChestNote(null))} className="ml-auto text-sm font-bold text-ink-soft" aria-label={tr(lang, 'Close')}>
              ✕
            </button>
          </div>
        </div>
      )}
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
