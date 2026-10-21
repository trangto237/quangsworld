import { useEffect, useMemo, useRef, useState } from 'react';
import type { StudentProfile } from '@atlas/db';
import { MissionSession, historyFromAttempts, isDue, scoreConcepts, stars } from '@atlas/engine';
import { allConcepts, getConcept, getQuestion, present, type PresentedQuestion } from '@atlas/knowledge';
import type { Mission, Question } from '@atlas/shared';
import { DAY_MS, dayKey } from '@atlas/shared';
import { cx, useQuery, useRepo } from '@atlas/ui';
import { T, TB, tr, useLang } from '../i18n';
import { useKid } from '../store';
import { DECOR, GardenScene } from '../garden/scene';
import { QuestionCard } from '../components/QuestionCard';
import { ActiveTimer } from '../lib/activeTime';
import { doneKey } from '../lib/equipped';
import {
  INVASION_HARVESTS,
  INVASION_ID,
  MAX_PLOTS,
  MIN_PLOTS,
  PLANTS,
  STREAK_FOR_RARE,
  TIER,
  WORDS_FOR_GOLDEN,
  WORDS_PER_PLOT,
  earned,
  gardenKey,
  grow,
  harvest,
  invasionDue,
  isReady,
  isVocab,
  normalize,
  plant,
  plantOf,
  walletOf,
  type GardenState,
  type Harvest,
  type Plant,
  type SeedKind,
  type Tier,
} from '../lib/garden';
import { Chip, Meter, Panel, TownButton } from '../town/ui';

/** The plant's picture, in its magic colours. */
export function PlantIcon({ p, className, hidden }: { p: Plant; className?: string; hidden?: boolean }) {
  return (
    <span className={cx('relative inline-block leading-none', className)} aria-hidden>
      <span style={{ filter: hidden ? 'brightness(0) opacity(0.22)' : p.filter }}>{p.emoji}</span>
      {p.badge && !hidden && <span className="absolute -right-2 -top-1 text-[0.45em]">{p.badge}</span>}
    </span>
  );
}

const topicName = (id: string) => getConcept(id)?.name ?? id;

/** The Word Garden's state and seeds. */
function useGarden(student: StudentProfile) {
  const attempts = useQuery((r) => r.listAttempts(student.id), [student.id]);
  const garden = useQuery((r) => normalize(r.getKv<GardenState>(gardenKey(student.id))), [student.id]);
  const states = useQuery((r) => r.getStates(student.id), [student.id]);
  const e = useMemo(() => earned(attempts), [attempts]);
  return { attempts, garden, states, e, w: walletOf(e, garden) };
}

type CardKind = 'grow' | 'pest' | 'harvest';
interface Card {
  i: number;
  kind: CardKind;
  q: PresentedQuestion;
  raw: Question;
}

const questKey = (sid: string, missionId: string) => `garden-quest:${sid}:${missionId}`;
export const questGoal = (m: Mission) => Math.max(6, m.duration * 2);

/**
 * Vườn ươm Từ vựng, full screen: a farm on a floating island where tending the garden is learning.
 * Tap a bed to plant a topic, answer its word cards to water it, chase off the bugs on topics due for
 * review, and answer one last word to harvest. Every few harvests the bugs invade (a Pest Patrol boss).
 * Opened from today's quest, the cards count towards it.
 */
export function GardenScreen({ student, quest }: { student: StudentProfile; quest?: Mission }) {
  const repo = useRepo();
  const go = useKid((s) => s.go);
  const lang = useLang();
  const { garden, states, e, w } = useGarden(student);
  const [picking, setPicking] = useState<number | null>(null);
  const [seedKind, setSeedKind] = useState<SeedKind>('packet');
  const [card, setCard] = useState<Card | null>(null);
  const [splash, setSplash] = useState<number | null>(null);
  const [reaped, setReaped] = useState<{ i: number; emoji: string; filter?: string } | null>(null);
  const [harvested, setHarvested] = useState<Harvest | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [sheet, setSheet] = useState<'book' | 'help' | 'quest-done' | null>(null);
  const [tip, setTip] = useState(0);
  const [tall, setTall] = useState(() => typeof matchMedia !== 'undefined' && matchMedia('(max-aspect-ratio: 4/5)').matches);
  const questDone = useQuery((r) => (quest ? (r.getKv<string[]>(doneKey(student.id, dayKey(Date.now()))) ?? []).includes(quest.id) : false), [student.id, quest?.id]);
  const questCount = useQuery((r) => (quest ? (r.getKv<number>(questKey(student.id, quest.id)) ?? 0) : 0), [student.id, quest?.id]);

  // One adaptive question picker per topic, avoiding words seen in the last two weeks.
  const history = useMemo(() => historyFromAttempts(repo.listAttempts(student.id, Date.now() - 14 * DAY_MS)), [repo, student.id]);
  const sessions = useRef(new Map<string, MissionSession>());
  const timer = useRef<ActiveTimer | null>(null);
  const answered = useRef(0);
  useEffect(() => {
    const t = new ActiveTimer();
    timer.current = t;
    return () => {
      const activeMs = t.stop();
      if (answered.current > 0) void repo.addSession({ studentId: student.id, kind: 'mission', startedAt: t.startedAt, endedAt: Date.now(), activeMs, missionTitle: 'Word Garden' });
    };
  }, [repo, student.id]);

  useEffect(() => {
    const mq = matchMedia('(max-aspect-ratio: 4/5)');
    const on = () => setTall(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  useEffect(() => {
    const t = setInterval(() => setTip((n) => n + 1), 4500);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (!note) return;
    const t = setTimeout(() => setNote(null), 2800);
    return () => clearTimeout(t);
  }, [note]);

  const fresh = () => normalize(repo.getKv<GardenState>(gardenKey(student.id)));
  const save = (g: GardenState) => repo.setKv(gardenKey(student.id), g);
  const found = PLANTS.filter((p) => garden.found[p.id]).length;
  const toUnlock = (i: number) => Math.max(1, (i - MIN_PLOTS + 1) * WORDS_PER_PLOT - e.words);
  const invasion = invasionDue(garden, Date.now());
  const hasPest = (i: number) => {
    const b = garden.beds[i];
    const s = b && states[b.topic];
    return !!(b && s && s.attempts > 0 && isDue(s));
  };

  // Seed packets: every vocabulary topic, today's quest first, then what the planner most wants.
  const topics = useMemo(() => {
    const vocab = allConcepts().filter((c) => isVocab(c.id));
    const rank = new Map(scoreConcepts({ states, goals: [], concepts: vocab }).map((s, k) => [s.concept.id, k]));
    const inQuest = (id: string) => (quest?.concepts.includes(id) ? 0 : 1);
    return vocab.sort((a, b) => inQuest(a.id) - inQuest(b.id) || (rank.get(a.id) ?? 99) - (rank.get(b.id) ?? 99));
  }, [states, quest]);

  const sow = async (i: number, topic: string) => {
    const r = plant(fresh(), w, e.plots, i, seedKind, topic, Date.now());
    setPicking(null);
    setSeedKind('packet');
    if (!r.ok) return setNote(tr(lang, r.why));
    await save(r.garden);
    setNote(tr(lang, '🌱 Planted! Tap it to answer its first word card.'));
  };

  const ask = (i: number, kind: CardKind) => {
    const b = garden.beds[i];
    if (!b) return;
    let s = sessions.current.get(b.topic);
    if (!s) {
      s = new MissionSession({ id: 'garden', concepts: [b.topic], duration: 5, kind: 'learn', title: 'Word Garden', reward: { coins: 0, gems: 0, xp: 0 } }, states, Math.random, history);
      sessions.current.set(b.topic, s);
    }
    const q = s.next();
    if (!q) return setNote(tr(lang, 'No more words in this topic right now — try another bed.'));
    setCard({ i, kind, q: present(q), raw: q });
  };

  const answer = async (c: Card, correct: boolean, ms: number, picked: string) => {
    setCard(null);
    timer.current?.poke();
    answered.current++;
    const bed = garden.beds[c.i];
    const s = bed && sessions.current.get(bed.topic);
    if (s) {
      const state = s.answer(c.raw, correct, ms);
      await repo.recordAnswer({ studentId: student.id, questionId: c.raw.id, conceptId: c.raw.conceptId, correct, difficulty: c.raw.difficulty, msSpent: ms, context: c.kind === 'pest' ? 'review' : 'mission' }, state);
      // Keep the review schedule up to date, so a cleared bug stays away.
      await repo.saveStates(student.id, Object.values(s.finish()));
    }
    if (!correct) {
      void repo.recordMistake(student.id, getQuestion(c.raw.id) ?? c.raw, picked);
      setNote(tr(lang, c.kind === 'pest' ? '🐛 The bugs are still there — try again!' : 'Not quite — the plant waits for the right word.'));
    } else if (c.kind === 'harvest') {
      const r = harvest(fresh(), c.i);
      if ('why' in r) return setNote(tr(lang, r.why));
      setReaped({ i: c.i, emoji: r.result.plant.emoji, filter: r.result.plant.filter });
      await save(r.garden);
      await repo.claimOnce(`garden-harvest:${student.id}:${r.result.bed.plantedAt}`, student.id, { coins: r.result.coins, gems: r.result.gems, xp: 10 });
      setTimeout(() => {
        setReaped(null);
        setHarvested(r.result);
      }, 800);
    } else {
      const r = grow(fresh(), c.i);
      if (r.ok) await save(r.garden);
      setSplash(c.i);
      setTimeout(() => setSplash((x) => (x === c.i ? null : x)), 900);
      if (c.kind === 'pest') {
        await repo.claimOnce(`garden-pest:${student.id}:${Date.now()}`, student.id, { coins: 5, gems: 0, xp: 5 });
        setNote(tr(lang, '🐛 Bugs chased off! +5 🪙'));
      }
    }
    // Today's quest: every word card counts.
    if (quest && !questDone) {
      const n = (repo.getKv<number>(questKey(student.id, quest.id)) ?? 0) + 1;
      await repo.setKv(questKey(student.id, quest.id), n);
      if (n >= questGoal(quest)) {
        const key = doneKey(student.id, dayKey(Date.now()));
        await repo.setKv(key, [...new Set([...(repo.getKv<string[]>(key) ?? []), quest.id])]);
        await repo.completeMission(student.id, {
          states: [],
          session: { kind: 'mission', startedAt: timer.current?.startedAt ?? Date.now(), endedAt: Date.now(), activeMs: 0, missionTitle: quest.title },
          reward: quest.reward,
        });
        setSheet('quest-done');
      }
    }
  };

  const fightBugs = () => {
    const beds = garden.beds.filter(Boolean).map((b) => b!.topic);
    const concepts = [...new Set(beds)].slice(0, 3);
    go({
      name: 'battle',
      fromPlan: false,
      mission: {
        id: `${INVASION_ID}${Date.now()}`,
        concepts: concepts.length ? concepts : ['en.vocab.everyday'],
        duration: 5,
        kind: 'review',
        mode: 'meteor',
        title: 'Bug Invasion',
        reward: { coins: 60, gems: 1, xp: 100 },
      },
    });
  };

  const bubble = (i: number) => {
    if (i >= e.plots) return null;
    const b = garden.beds[i];
    if (!b) return { icon: '🌱', tone: 'green' as const };
    if (hasPest(i)) return { icon: '🐛', tone: 'red' as const };
    if (isReady(b)) return { icon: '🧺', tone: 'gold' as const };
    return { icon: '💧', tone: 'blue' as const };
  };
  const onBed = (i: number) => {
    if (i >= e.plots) return setNote(tr(lang, 'Learn {n} more new words to open this bed.', { n: toUnlock(i) }));
    if (invasion) return setNote(tr(lang, '🐛 Beat the bug invasion first!'));
    const b = garden.beds[i];
    if (!b) return setPicking(i);
    if (hasPest(i)) return ask(i, 'pest');
    ask(i, isReady(b) ? 'harvest' : 'grow');
  };

  const nextDecor = DECOR.find((d) => found < d.at);
  const toBugs = INVASION_HARVESTS - ((garden.harvests ?? 0) - (garden.boss?.harvests ?? 0));
  const tips = [
    !garden.beds.some(Boolean) && tr(lang, '🌱 Tap an empty bed and pick a topic to plant'),
    garden.beds.some((b, i) => b && hasPest(i)) && tr(lang, '🐛 Bugs on a bed = words to review. Chase them off!'),
    e.plots < MAX_PLOTS && tr(lang, '🟫 {n} more new words → a new bed', { n: toUnlock(e.plots) }),
    nextDecor && tr(lang, '🏡 Find {n} more plants → {thing}', { n: nextDecor.at - found, thing: tr(lang, nextDecor.name) }),
    tr(lang, '🌟 {a}/{b} right in a row → rare seed', { a: e.run, b: STREAK_FOR_RARE }),
    tr(lang, '👑 {a}/{b} new words → golden seed', { a: e.words % WORDS_FOR_GOLDEN, b: WORDS_FOR_GOLDEN }),
    toBugs > 0 && tr(lang, '🐛 The bugs return in {n} harvests — be ready!', { n: toBugs }),
  ].filter(Boolean) as string[];
  const cardTitle: Record<CardKind, string> = { grow: '💧 Water it: answer the word card', pest: '🐛 Chase the bugs: answer to clear them', harvest: '🧺 Harvest check: one last word!' };

  return (
    <div className="fixed inset-0 overflow-hidden text-ink-text" style={{ background: invasion ? 'linear-gradient(#9fb6a0, #d9d2b8)' : 'linear-gradient(var(--sky-top), var(--sky-bottom))' }}>
      <div className="absolute inset-x-0 bottom-[7.5rem] top-[4.5rem] sm:bottom-24 sm:top-16">
        <GardenScene
          tall={tall}
          beds={garden.beds}
          plots={e.plots}
          toUnlock={toUnlock}
          found={found}
          bubble={bubble}
          onBed={onBed}
          splash={splash}
          reaped={reaped}
          pest={hasPest}
          label={(i) => (garden.beds[i] ? topicName(garden.beds[i]!.topic) : undefined)}
          invasion={invasion}
        />
      </div>

      {/* Top: back, title, seeds */}
      <div className="absolute inset-x-0 top-0 flex items-start gap-2 p-2 sm:p-3">
        <button onClick={() => go({ name: 'realm', realmId: 'english' })} className="town-btn grid size-11 shrink-0 place-items-center rounded-xl bg-paper text-xl" aria-label="Back to the map">
          ←
        </button>
        <div className="town-panel min-w-0 flex-1 px-3 py-1.5 sm:max-w-xs sm:flex-none">
          <div className="truncate font-display text-lg font-bold leading-tight">
            🌱 <T en="Word Garden" />
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <Meter value={found} max={PLANTS.length} color="#5cb85c" className="h-2.5 flex-1" />
            <span className="text-xs font-bold tabular-nums">
              {found}/{PLANTS.length}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row">
          <Chip icon="📖" value={e.words} color="#5cb85c" title="Words learned" />
          <Chip icon="🌟" value={w.rare} color="#2563eb" title="Rare seeds" />
          <Chip icon="👑" value={w.golden} color="#f5a623" title="Golden seeds" />
        </div>
      </div>

      {/* Today's quest, when he came from it */}
      {quest && (
        <div className="absolute left-2 top-[4.25rem] z-10 w-56 sm:left-3 sm:top-[4.5rem]">
          <div className="town-panel px-3 py-1.5 text-xs font-bold">
            🎯 {questDone ? <T en="Quest complete! 🏆" /> : <T en="Today's quest: {a}/{b} word cards" vars={{ a: Math.min(questCount, questGoal(quest)), b: questGoal(quest) }} />}
            <Meter value={questDone ? 1 : questCount} max={questDone ? 1 : questGoal(quest)} color="#ffc23d" className="mt-1 h-2" />
          </div>
        </div>
      )}

      {/* The boss: a bug invasion */}
      {invasion && (
        <div className="absolute inset-x-0 top-[8.5rem] z-10 flex justify-center px-3 sm:top-20">
          <div className="town-panel flex max-w-md animate-pop items-center gap-3 border-[#b4432f] bg-[#ffe6df] px-4 py-3">
            <span className="town-bob text-4xl">🐛</span>
            <div className="flex-1">
              <div className="font-display text-lg font-bold leading-tight">
                <T en="Bug invasion!" />
              </div>
              <div className="text-xs font-semibold">
                <T en="The bugs are attacking your garden. Beat them to win a 👑 golden seed." />
              </div>
            </div>
            <TownButton tone="red" onClick={fightBugs}>
              <TB en="⚔️ Fight!" />
            </TownButton>
          </div>
        </div>
      )}

      {note && (
        <div className="absolute inset-x-0 top-36 z-20 flex justify-center px-4">
          <div className="town-panel animate-pop px-4 py-2 text-center text-sm font-bold">{note}</div>
        </div>
      )}

      {/* Bottom: tips and buttons */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] sm:flex-row sm:items-end sm:p-3">
        <div className="town-panel flex min-h-12 flex-1 items-center gap-2 px-3 py-2 text-sm font-semibold sm:max-w-md">
          <span className="text-2xl" aria-hidden>
            🐸
          </span>
          <span key={tip} className="animate-pop">
            {tips[tip % tips.length]}
          </span>
        </div>
        <div className="flex gap-2 sm:ml-auto">
          <TownButton tone="paper" className="!px-3" onClick={() => setSheet('help')} aria-label="How it works">
            ❓
          </TownButton>
          <TownButton tone="amber" className="flex-1 sm:flex-none" onClick={() => setSheet('book')}>
            <span className="text-2xl leading-none">📗</span>
            <span className="leading-tight">
              <TB en="Catalogue" />
            </span>
            <span className="rounded-full bg-paper px-1.5 text-xs">
              {found}/{PLANTS.length}
            </span>
          </TownButton>
        </div>
      </div>

      {card && (
        <Sheet onClose={() => setCard(null)} wide>
          <div className="mb-2 flex items-center gap-2">
            <PlantIcon p={plantOf(garden.beds[card.i]?.plant ?? 'rice')} className="text-3xl" />
            <div>
              <div className="font-display text-lg font-bold leading-tight">
                <T en={cardTitle[card.kind]} />
              </div>
              <div className="text-xs font-semibold text-ink-soft">{topicName(garden.beds[card.i]?.topic ?? '')}</div>
            </div>
          </div>
          <div className="rounded-xl bg-white p-3 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
            <QuestionCard key={card.raw.id} question={card.q} mode="practice" glossary={false} wrongNote="📕 Saved to your Mistake Book" onAnswer={(c, ms, p) => void answer(card, c, ms, p)} />
          </div>
        </Sheet>
      )}

      {picking != null && (
        <Sheet onClose={() => setPicking(null)} wide>
          <h2 className="font-display text-xl font-bold">
            <T en="Plant a seed" />
          </h2>
          <p className="text-xs text-ink-soft">
            <T en="Every seed packet is a word topic. Its word cards make it grow." />
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {(
              [
                ['packet', '🎒', 'Seed packet', '∞'],
                ['rare', '🌟', 'Rare seed', String(w.rare)],
                ['golden', '👑', 'Golden seed', String(w.golden)],
              ] as const
            ).map(([k, icon, name, n]) => (
              <button
                key={k}
                disabled={k !== 'packet' && w[k] < 1}
                onClick={() => setSeedKind(k)}
                className={cx('town-btn rounded-xl p-2 text-center', seedKind === k ? 'bg-tint-amber ring-2 ring-[#ffc23d]' : 'bg-paper')}
              >
                <div className="text-2xl">{icon}</div>
                <div className="font-display text-xs font-bold leading-tight">
                  <T en={name} />
                </div>
                <div className="text-xs font-bold text-ink-soft">×{n}</div>
              </button>
            ))}
          </div>
          <h3 className="mt-4 font-display font-bold">
            <T en="Pick a topic" />
          </h3>
          <div className="mt-2 grid max-h-[45dvh] gap-1.5 overflow-y-auto pr-1">
            {topics.map((c) => {
              const s = states[c.id];
              const st = stars(s);
              return (
                <button key={c.id} onClick={() => void sow(picking, c.id)} className="town-btn flex items-center gap-2 rounded-xl bg-paper px-3 py-2 text-left hover:bg-paper-3">
                  <span className="flex-1">
                    <span className="block font-display font-bold leading-tight">{c.name}</span>
                    <span className="block text-xs text-ink-soft">{c.missionName}</span>
                  </span>
                  {quest?.concepts.includes(c.id) && <span className="rounded-full bg-[#ffe9a8] px-2 py-0.5 text-[10px] font-bold">🎯</span>}
                  {s && s.attempts > 0 && isDue(s) && <span className="text-sm">🐛</span>}
                  <span className="text-sm tracking-wider">
                    <span className="text-[#f5a623]">{'★'.repeat(st)}</span>
                    <span className="text-ink/20">{'★'.repeat(3 - st)}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </Sheet>
      )}

      {sheet === 'book' && (
        <Sheet onClose={() => setSheet(null)} wide>
          <h2 className="font-display text-2xl font-bold">
            📗 <T en="Catalogue" />
          </h2>
          <Catalogue found={garden.found} />
          <h3 className="mt-4 font-display text-lg font-bold">
            🏡 <T en="Garden decorations" />
          </h3>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {DECOR.map((d) => (
              <div key={d.id} className={cx('rounded-xl border-2 p-2 text-center text-sm', found >= d.at ? 'border-ink bg-paper' : 'border-dashed border-ink/40 bg-paper-3 text-ink-soft')}>
                <div className="font-display font-bold">{found >= d.at ? <T en={d.name} /> : '???'}</div>
                <div className="text-xs">{found >= d.at ? '✓' : tr(lang, '{n} plants', { n: d.at })}</div>
              </div>
            ))}
          </div>
          <TownButton tone="green" className="mt-4 w-full" onClick={() => setSheet(null)}>
            <TB en="Close" />
          </TownButton>
        </Sheet>
      )}

      {sheet === 'help' && (
        <Sheet onClose={() => setSheet(null)}>
          <h2 className="font-display text-xl font-bold">
            <T en="How the garden grows" />
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              🌱 <T en="Tap an empty bed and plant a word topic" />
            </li>
            <li>
              💧 <T en="Tap a growing bed: answer its word card to water it" />
            </li>
            <li>
              🐛 <T en="Bugs = words due for review. Answer to chase them off" />
            </li>
            <li>
              🧺 <T en="Fully grown? One last word to harvest it for coins" />
            </li>
            <li>
              🌟 <T en="10 right answers in a row = a rare seed" />
            </li>
            <li>
              👑 <T en="Every 25 new words = a golden seed" />
            </li>
            <li>
              🟫 <T en="Every 20 new words opens another bed" />
            </li>
            <li>
              ⚔️ <T en="Every few harvests the bugs invade — beat them for a golden seed" />
            </li>
          </ul>
          <TownButton tone="green" className="mt-4 w-full" onClick={() => setSheet(null)}>
            <TB en="Got it" />
          </TownButton>
        </Sheet>
      )}

      {sheet === 'quest-done' && quest && (
        <Sheet onClose={() => setSheet(null)}>
          <div className="text-center">
            <div className="town-bob text-6xl">🏆</div>
            <h2 className="mt-2 font-display text-2xl font-bold">
              <T en="Quest complete! 🏆" />
            </h2>
            <p className="mt-1 font-display font-bold">
              +{quest.reward.coins} 🪙 · +{quest.reward.xp} XP
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <TownButton tone="paper" onClick={() => setSheet(null)}>
                <TB en="Keep gardening" />
              </TownButton>
              <TownButton tone="green" onClick={() => go({ name: 'quests' })}>
                <TB en="Next quest" />
              </TownButton>
            </div>
          </div>
        </Sheet>
      )}

      {harvested && (
        <Sheet onClose={() => setHarvested(null)}>
          <div className="text-center">
            {harvested.first && (
              <div className="font-display text-sm font-bold uppercase tracking-wider text-[#c48a00]">
                ✨ <T en="New plant discovered!" />
              </div>
            )}
            <PlantIcon p={harvested.plant} className="town-bob my-3 text-7xl" />
            <div className="font-display text-2xl font-bold">{harvested.plant.en}</div>
            <div className="text-sm text-ink-soft" lang="vi">
              {harvested.plant.vi} · <span style={{ color: TIER[harvested.plant.tier].color }}>{TIER[harvested.plant.tier].label}</span>
            </div>
            <p className="mt-2 text-sm">
              <T en="Grown from" /> <b className="rounded bg-tint-green px-1.5">{topicName(harvested.bed.topic)}</b>
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2 font-display font-bold">
              <span className="rounded-full border-2 border-ink bg-[#fff3c4] px-3 py-1">+{harvested.coins} 🪙</span>
              {harvested.gems > 0 && <span className="rounded-full border-2 border-ink bg-[#e3f0ff] px-3 py-1">+{harvested.gems} 💎</span>}
              {harvested.drop && <span className="rounded-full border-2 border-ink bg-[#dfe8ff] px-3 py-1">+1 🌟</span>}
              {harvested.tierDone && <span className="rounded-full border-2 border-ink bg-[#ffe9a8] px-3 py-1">+1 👑</span>}
            </div>
            {harvested.tierDone && (
              <p className="mt-2 text-sm font-bold">
                🏆 <T en="You found every {tier} plant!" vars={{ tier: TIER[harvested.tierDone].label.toLowerCase() }} />
              </p>
            )}
            <TownButton tone="green" className="mt-4 w-full" onClick={() => setHarvested(null)}>
              <TB en="Nice!" />
            </TownButton>
          </div>
        </Sheet>
      )}
    </div>
  );
}

const TIERS: Tier[] = ['common', 'uncommon', 'rare', 'legendary'];

function Catalogue({ found }: { found: Record<string, number> }) {
  return (
    <div className="mt-3 space-y-3">
      {TIERS.map((t) => {
        const row = PLANTS.filter((p) => p.tier === t);
        const have = row.filter((p) => found[p.id]).length;
        return (
          <Panel key={t} className="!p-3">
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-lg font-bold" style={{ color: TIER[t].color }}>
                {TIER[t].label} <span className="text-sm text-ink-soft">· {TIER[t].vi}</span>
              </h3>
              <span className="text-xs font-bold text-ink-soft">
                {have}/{row.length} {have === row.length ? '🏆' : <>· <T en="all → +1 👑" /></>}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {row.map((p) => {
                const n = found[p.id] ?? 0;
                return (
                  <div key={p.id} className={cx('rounded-xl border-2 p-2 text-center', n ? 'border-ink bg-paper' : 'border-dashed border-ink/40 bg-paper-3')}>
                    <PlantIcon p={p} hidden={!n} className="text-4xl" />
                    <div className="mt-1 truncate font-display text-sm font-bold">{n ? p.en : '???'}</div>
                    <div className="truncate text-[11px] text-ink-soft" lang="vi">
                      {n ? `${p.vi} · ×${n}` : '—'}
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        );
      })}
    </div>
  );
}

function Sheet({ onClose, children, wide }: { onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div className={cx('town-panel relative max-h-[calc(100dvh-2rem)] w-full animate-pop overflow-y-auto p-5', wide ? 'max-w-2xl' : 'max-w-sm')} onClick={(ev) => ev.stopPropagation()}>
        {/* Always a way out, even when the sheet fills the screen. */}
        <button
          onClick={onClose}
          className="town-btn sticky top-0 z-10 float-right -mr-1 -mt-1 ml-2 grid size-10 place-items-center rounded-full bg-paper text-lg font-bold text-ink-text"
          aria-label="Close"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
