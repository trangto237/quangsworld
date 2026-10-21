import { useEffect, useMemo, useRef, useState } from 'react';
import { playScreen } from '../lib/islands';
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
import { layoutFor, spotCenter, type LayoutId } from '../town/layouts';
import { Carousel, type Slide } from '../town/Carousel';
import { RealmPicker, type RealmCard } from '../town/RealmPicker';
import { SKY } from '../town/TownMap';
import { useDayPhase } from '../town/life';
import { cx } from '@atlas/ui';
import { REALMS, realmOf, type RealmId } from '../lib/realms';
import { writingKey } from './Writing';
import { Meter, Ribbon, TownButton } from '../town/ui';

/** Above the quest card (which sits above the bottom bar and the phone's home-bar gap). */
const ABOVE_QUEST = 'calc(96px + max(0.5rem, env(safe-area-inset-bottom)) + 5.25rem)';
const PILL = 'rounded-full border border-white/80 bg-white/70 px-3 py-1 shadow-sm backdrop-blur';

/**
 * The map. Home: the middle island (house, shop, Coach Owl, Exam Hall) with a portal island for each realm.
 * A realm: its islands round a gate home. Each place is a building that grows as the hero earns stars there.
 */
export function Town({ student, realm }: { student: StudentProfile; realm?: RealmId | 'home' }) {
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
  const codeOpen = useQuery((r) => !!r.getKv<boolean>(`code-unlocked:${student.id}`), [student.id]);
  const codeProgress = useQuery((r) => r.getKv<string[]>(`code-done:${student.id}`) ?? [], [student.id]);
  const slots = useQuery((r) => getSlots(r, student.id), [student.id]);
  const writings = useQuery((r) => (r.getKv<unknown[]>(writingKey(student.id)) ?? []).length, [student.id]);
  const phase = useDayPhase();
  const hero = { armour: inSlot(slots, 'armour')?.id, emblem: student.avatar, hat: inSlot(slots, 'hat')?.emoji, pet: inSlot(slots, 'pet')?.emoji };
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
      icon: '🏠',
      color: '#ffc23d',
      blurb: tr(lang, 'Your hero: powers, badges and settings.'),
    };
    const codeDone = codeProgress.length;
    out['code-lab'] = codeOpen
      ? { level: Math.min(4, 1 + Math.floor(codeDone / 6)), title: tr(lang, 'Code Lab'), sub: `💻 ${codeDone}`, icon: '💻', color: '#0ea5e9', blurb: tr(lang, 'Make games with blocks, JavaScript and Python.') }
      : { level: 0, title: tr(lang, 'Code Lab'), sub: tr(lang, '🔒 Ask a parent'), icon: '💻', color: '#64748b', locked: true, blurb: tr(lang, 'Learn to code by making games. A parent can unlock it.') };
    out.arcade = { level: 2, title: tr(lang, 'Arcade'), sub: tr(lang, 'Any game'), icon: '🕹️', color: '#a855f7', blurb: tr(lang, 'Play any game you like.') };
    out.writing = {
      level: Math.min(4, 1 + Math.floor(writings / 2)),
      title: tr(lang, 'Writing studio'),
      sub: `✍️ ${writings}`,
      icon: '✍️',
      color: '#db2777',
      blurb: tr(lang, 'Practise the two literature exam essays.'),
    };
    out['exam-hall'].stops = stopsAt('exam-hall');
    // Each realm's portal on Home sums up its places.
    for (const r of REALMS) {
      const members = r.places.map((id) => out[id]).filter((x) => x && !x.hidden);
      const worlds = members.filter((x) => !x.locked && x.unexplored !== undefined);
      out[`realm-${r.id}`] = {
        level: worlds.length ? Math.round(worlds.reduce((a, x) => a + x.level, 0) / worlds.length) : 1,
        title: tr(lang, r.name),
        sub: tr(lang, '{n} islands', { n: members.length }),
        icon: r.emoji,
        color: r.color,
        blurb: tr(lang, r.blurb),
        due: members.reduce((a, x) => a + (x.due ?? 0), 0),
        quest: members.some((x) => x.quest),
        stops: members.flatMap((x) => x.stops ?? []).sort((a, b) => a.n - b.n),
      };
    }
    out.gate = { level: 2, title: tr(lang, 'Home'), sub: '', icon: '🏠', color: '#ffc23d', blurb: tr(lang, 'Fly back to the home island.') };
    return { out, questWorld, path };
  }, [states, next, lang, exams, wallet, student.name, student.avatar, plan, played, codeOpen, codeProgress, writings]);

  // Level-up moments: compare with what this device last showed; celebrate one building that grew.
  const seenKey = `atlas-town-seen:${student.id}`;
  const [grew, setGrew] = useState<{ id: string; text: string; title: string } | null>(null);
  const checked = useRef(false);
  useEffect(() => {
    if (checked.current) return;
    checked.current = true;
    const now: Record<string, { level: number; explored: boolean }> = {};
    for (const [id, st] of Object.entries(spots.out)) if (!st.hidden && !id.startsWith('realm-') && !['exam-hall', 'coach', 'shop', 'home', 'code-lab', 'arcade', 'gate', 'writing'].includes(id)) now[id] = { level: st.level, explored: !st.unexplored };
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

  // Home shows realms; a realm shows its own places.
  // The realms side by side (Home first). Start on the one asked for, else where today's quest is.
  const slides: (Slide & { realm?: RealmId; emoji: string; name: string })[] = useMemo(
    () => [
      { id: 'home', emoji: '🏠', name: 'Home', sky: phase === 'day' ? 'linear-gradient(var(--sky-top), var(--sky-bottom))' : `linear-gradient(${SKY[phase][0]}, ${SKY[phase][1]})` },
      ...REALMS.map((r) => ({
        id: r.id,
        realm: r.id,
        emoji: r.emoji,
        name: r.name,
        cls: r.className,
        sky: r.night ? `linear-gradient(${SKY.night[0]}, ${SKY.night[1]})` : phase === 'day' ? 'linear-gradient(var(--sky-top), var(--sky-bottom))' : `linear-gradient(${SKY[phase][0]}, ${SKY[phase][1]})`,
      })),
    ],
    [phase],
  );
  const slideOf = (r?: string) => Math.max(0, slides.findIndex((x) => x.id === r));
  // The ring of realms starts on where today's quest is.
  const [index, setIndex] = useState(() => slideOf(realm ?? (spots.questWorld && realmOf(spots.questWorld)?.id)));
  useEffect(() => {
    if (realm) setIndex(slideOf(realm));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realm]);
  // Something grew: turn the ring to its realm.
  useEffect(() => {
    if (grew) {
      const r = realmOf(grew.id);
      if (r) setIndex(slideOf(r.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grew?.id]);
  const enter = (i: number) => go({ name: 'realm', realmId: (slides[i].realm ?? 'home') as RealmId | 'home' });
  const inside = realm ? slides[slideOf(realm)] : null;
  const cards: RealmCard[] = slides.map((sl) => {
    const r = sl.realm ? REALMS.find((x) => x.id === sl.realm)! : null;
    const st = r ? shown[`realm-${r.id}`] : undefined;
    const places = r ? r.places.filter((id) => shown[id] && !shown[id].hidden) : ['home', 'shop', 'coach'];
    return {
      id: sl.id,
      name: <T en={sl.realm ? sl.name : 'Home Island'} />,
      emoji: sl.emoji,
      color: r?.color ?? '#ffc23d',
      cls: sl.cls,
      sky: sl.sky,
      quest: r ? !!st?.quest : false,
      buildings: places.map((id) => ({ kind: id === 'home' ? 'home' : id, level: Math.max(1, shown[id]?.level ?? 2), color: shown[id]?.color ?? '#888' })),
      label: tr(lang, sl.realm ? sl.name : 'Home Island'),
      info: (
        <>
          {r && <span className={PILL}>🏝️ {tr(lang, '{n} islands', { n: places.length })}</span>}
          {r && (
            <span className={PILL + ' text-[#f5a623]'}>
              {'★'.repeat(Math.max(0, Math.min(4, st?.level ?? 0)))}
              <span className="opacity-30">{'★'.repeat(4 - Math.max(0, Math.min(4, st?.level ?? 0)))}</span>
            </span>
          )}
          {!!st?.due && <span className={PILL}>🔁 {tr(lang, '{n} to review', { n: st.due })}</span>}
          {!r && <span className={PILL}>🏠 🛒 🦉 🏛️ {tr(lang, 'House, shop, Coach Owl, Exam Hall')}</span>}
        </>
      ),
    };
  });

  const [selected, setSelected] = useState<Spot | null>(null);
  const picked = selected ? spots.out[selected.id] : undefined;

  const open = (s: Spot) => {
    if (s.kind === 'exam-hall') go({ name: 'exam-hall' });
    else if (s.kind === 'coach') go({ name: 'coach' });
    else if (s.kind === 'shop') go({ name: 'shop' });
    else if (s.kind === 'home') go({ name: 'hero' });
    else if (s.kind === 'code-lab') go({ name: 'code' });
    else if (s.kind === 'arcade') go({ name: 'arcade' });
    else if (s.id === 'word-forest') go({ name: 'garden' });
    else if (s.kind === 'gate') go({ name: 'hub' });
    else if (s.kind === 'writing') go({ name: 'writing' });
    else if (s.kind.startsWith('realm-')) go({ name: 'realm', realmId: s.kind.slice(6) as RealmId });
    else if (!spots.out[s.id]?.hidden) go({ name: 'world', worldId: s.id });
  };

  return (
    <div className="text-ink-text">
      <div className={cx('fixed inset-0', (inside ?? slides[index]).cls)} style={{ background: (inside ?? slides[index]).sky, transition: 'background 0.4s' }} />
      {inside ? (
        <>
          <div className="fixed inset-x-0 top-[10.5rem] sm:top-[8.5rem]" style={{ bottom: ABOVE_QUEST }}>
            <Carousel
              slides={[inside]}
              index={0}
              onIndex={() => {}}
              start={(sl, size) => {
                // Open filling the screen's width, on today's quest (or the gate), not the whole realm shrunk.
                const tall = size.h > size.w * 1.05;
                const L = layoutFor((sl.realm ?? 'home') as LayoutId, tall);
                const fit = Math.min(size.w / L.view.w, size.h / L.view.h);
                const z = Math.min(2.6, Math.max(1, size.w / L.view.w / fit));
                const focus = L.spots.find((x) => shown[x.id]?.quest) ?? L.spots.find((x) => x.id === L.start)!;
                const [, py] = spotCenter(L, focus);
                return { z, at: { x: size.w / 2, y: (size.h - L.view.h * fit) / 2 + (py + 60) * fit } };
              }}
              render={(sl, { size, zoom }) => {
                const tall = size.h > size.w * 1.05;
                const L = layoutFor((sl.realm ?? 'home') as LayoutId, tall);
                const fit = Math.min(size.w / L.view.w, size.h / L.view.h);
                const here = new Set(L.spots.map((x) => x.id));
                return (
                  <TownMap
                    layout={L.id}
                    tall={tall}
                    labelScale={Math.max(1, Math.min(2, 0.75 / (fit * zoom)))}
                    states={shown}
                    path={spots.path.filter((id) => here.has(id))}
                    chest={sl.realm ? undefined : { state: chestOpened ? 'opened' : allDone ? 'ready' : 'locked', progress: `${doneCount}/${plan.missions.length}`, onOpen: () => void openChest() }}
                    onOpen={open}
                    onSelect={setSelected}
                    selected={selected?.id ?? null}
                    hero={hero}
                  />
                );
              }}
            />
          </div>
          <div className="fixed inset-x-0 top-[7.85rem] z-20 flex justify-center px-2 sm:top-[5.75rem]">
            <button onClick={() => go({ name: 'hub' })} className="town-btn flex items-center gap-2 rounded-full bg-paper px-3 py-1 font-display text-sm font-bold text-ink-text">
              ← <T en="Realms" /> <span className="opacity-40">|</span> {inside.emoji} <T en={inside.realm ? inside.name : 'Home Island'} />
            </button>
          </div>
        </>
      ) : (
        <div className="fixed inset-x-0 top-[7.6rem] sm:top-[5.5rem]" style={{ bottom: ABOVE_QUEST }}>
          <RealmPicker cards={cards} index={index} onIndex={setIndex} onEnter={enter} />
        </div>
      )}
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
          // Today's quest: tap the card for the list, or Play to start it. (The bottom bar has no Play here.)
          <div className="town-panel mx-auto flex w-full max-w-xl items-center gap-3 px-3 py-1.5">
            <button onClick={() => go({ name: 'quests' })} className="flex min-w-0 flex-1 items-center gap-3 text-left">
              <Ribbon>
                <T en="Today's quest" />
              </Ribbon>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-sm font-bold leading-tight">{next ? next.title : <T en="All done for today! 🏆" />}</span>
                <Meter value={doneCount} max={plan.missions.length} className="mt-0.5 h-2" />
              </span>
              <span className="shrink-0 text-xs font-bold text-ink-soft">
                {doneCount}/{plan.missions.length}
              </span>
            </button>
            {next && (
              <TownButton tone="green" onClick={() => go(playScreen(next, true))}>
                <TB en="▶ Play" />
              </TownButton>
            )}
          </div>
        )}
      </div>
      <BottomNav student={student} active="map" play={false} />
    </div>
  );
}
