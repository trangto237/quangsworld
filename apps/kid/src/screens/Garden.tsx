import { useEffect, useMemo, useState } from 'react';
import type { StudentProfile } from '@atlas/db';
import { getQuestion } from '@atlas/knowledge';
import type { Attempt } from '@atlas/shared';
import { cx, useQuery, useRepo } from '@atlas/ui';
import { T, TB, tr, useLang } from '../i18n';
import { useKid } from '../store';
import { DECOR, GardenScene } from '../garden/scene';
import {
  MAX_PLOTS,
  MIN_PLOTS,
  PACKET_COST,
  PLANTS,
  STAGES,
  STREAK_FOR_RARE,
  TIER,
  WORDS_FOR_GOLDEN,
  WORDS_PER_PLOT,
  earned,
  emptyGarden,
  gardenKey,
  harvest,
  isVocab,
  plant,
  plantOf,
  stepCost,
  walletOf,
  water,
  type GardenState,
  type Harvest,
  type Plant,
  type SeedKind,
  type Tier,
} from '../lib/garden';
import { Chip, Meter, Panel, TownButton } from '../town/ui';

/** Words he got right lately (the answer of each vocabulary question), for the plants' name tags. */
function recentWords(attempts: Attempt[]): string[] {
  const out: string[] = [];
  for (let i = attempts.length - 1; i >= 0 && out.length < 40; i--) {
    const a = attempts[i];
    if (!a.correct || !isVocab(a.conceptId)) continue;
    const q = getQuestion(a.questionId);
    const w = q?.options[q.answer]?.trim();
    if (w && /^[A-Za-z][A-Za-z' -]{1,22}$/.test(w) && !out.includes(w)) out.push(w);
  }
  return out;
}

/** The plant's picture, in its magic colours. */
export function PlantIcon({ p, className, hidden }: { p: Plant; className?: string; hidden?: boolean }) {
  return (
    <span className={cx('relative inline-block leading-none', className)} aria-hidden>
      <span style={{ filter: hidden ? 'brightness(0) opacity(0.22)' : p.filter }}>{p.emoji}</span>
      {p.badge && !hidden && <span className="absolute -right-2 -top-1 text-[0.45em]">{p.badge}</span>}
    </span>
  );
}


/** The Word Garden's state and wallet, shared by the garden screen and its banner. */
function useGarden(student: StudentProfile) {
  const attempts = useQuery((r) => r.listAttempts(student.id), [student.id]);
  const garden = useQuery((r) => r.getKv<GardenState>(gardenKey(student.id)) ?? emptyGarden(), [student.id]);
  const e = useMemo(() => earned(attempts), [attempts]);
  return { attempts, garden, e, w: walletOf(e, garden) };
}

/** On the Word Garden island page: a big door into the garden. */
export function GardenBanner({ student }: { student: StudentProfile }) {
  const go = useKid((s) => s.go);
  const { garden, e, w } = useGarden(student);
  const ready = garden.beds.filter((b) => b && b.stage >= STAGES).length;
  const found = PLANTS.filter((p) => garden.found[p.id]).length;
  return (
    <button onClick={() => go({ name: 'garden' })} className="town-btn mx-auto block w-full max-w-md overflow-hidden rounded-2xl text-left">
      <div className="relative bg-[linear-gradient(180deg,#9fd8ff,#d9f2c4)] px-4 pb-3 pt-4 dark:bg-[linear-gradient(180deg,#1d3a52,#22371f)]">
        <div className="pointer-events-none absolute -right-2 -top-1 text-6xl opacity-90" aria-hidden>
          🌻
        </div>
        <div className="font-display text-2xl font-bold leading-tight">
          🌱 <T en="Enter your garden" />
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <Chip icon="💧" value={w.water} color="#4b8fe2" />
          <Chip icon="🌟" value={w.rare} color="#2563eb" />
          <Chip icon="👑" value={w.golden} color="#f5a623" />
          <Chip icon="📗" value={`${found}/${PLANTS.length}`} color="#5cb85c" />
        </div>
        {ready > 0 && (
          <div className="mt-2 inline-block animate-pop rounded-full border-2 border-ink bg-[#ffe9a8] px-3 py-0.5 font-display text-sm font-bold">
            🧺 <T en="{n} ready to harvest!" vars={{ n: ready }} />
          </div>
        )}
        {e.words === 0 && (
          <p className="mt-2 text-xs font-semibold text-ink-soft">
            <T en="Learn words below to earn water for your garden." />
          </p>
        )}
      </div>
    </button>
  );
}

/**
 * Vườn ươm Từ vựng, full screen: the farm on its floating island, with bubbles over the beds and the
 * wallet, tips and buttons around it. Learning words earns water and seeds; he plants, waters and
 * harvests, and every new plant goes into the catalogue.
 */
export function GardenScreen({ student }: { student: StudentProfile }) {
  const repo = useRepo();
  const go = useKid((s) => s.go);
  const { attempts, garden, e, w } = useGarden(student);
  const words = useMemo(() => recentWords(attempts), [attempts]);
  const [picking, setPicking] = useState<number | null>(null);
  const [splash, setSplash] = useState<number | null>(null);
  const [reaped, setReaped] = useState<{ i: number; emoji: string; filter?: string } | null>(null);
  const [harvested, setHarvested] = useState<Harvest | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [sheet, setSheet] = useState<'book' | 'help' | null>(null);
  const [tip, setTip] = useState(0);
  const [tall, setTall] = useState(() => typeof matchMedia !== 'undefined' && matchMedia('(max-aspect-ratio: 4/5)').matches);
  useEffect(() => {
    const mq = matchMedia('(max-aspect-ratio: 4/5)');
    const on = () => setTall(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  const lang = useLang();
  // Water earned since he last came, shown once.
  const [gained] = useState(() => (garden.seenWater > 0 ? e.water - garden.seenWater : 0));

  useEffect(() => {
    if (garden.seenWater !== e.water) void repo.setKv(gardenKey(student.id), { ...garden, seenWater: e.water });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [e.water]);
  useEffect(() => {
    const t = setInterval(() => setTip((n) => n + 1), 4500);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (!note) return;
    const t = setTimeout(() => setNote(null), 2600);
    return () => clearTimeout(t);
  }, [note]);

  const fresh = () => repo.getKv<GardenState>(gardenKey(student.id)) ?? emptyGarden();
  const save = (g: GardenState) => repo.setKv(gardenKey(student.id), { ...g, seenWater: e.water });
  const found = PLANTS.filter((p) => garden.found[p.id]).length;
  const toUnlock = (i: number) => Math.max(1, (i - MIN_PLOTS + 1) * WORDS_PER_PLOT - e.words);

  const sow = async (i: number, kind: SeedKind) => {
    const g = fresh();
    const used = new Set(g.beds.map((b) => b?.word));
    const word = words.find((x) => !used.has(x)) ?? words[0];
    const r = plant(g, walletOf(e, g), e.plots, i, kind, word, Date.now());
    setPicking(null);
    if (!r.ok) return setNote(r.why);
    await save(r.garden);
  };

  const pour = async (i: number) => {
    const g = fresh();
    const r = water(g, walletOf(e, g), i);
    if (!r.ok) return setNote(r.why);
    setSplash(i);
    setTimeout(() => setSplash((s) => (s === i ? null : s)), 900);
    await save(r.garden);
  };

  const reap = async (i: number) => {
    const r = harvest(fresh(), i);
    if ('why' in r) return setNote(r.why);
    setReaped({ i, emoji: r.result.plant.emoji, filter: r.result.plant.filter });
    await save(r.garden);
    await repo.claimOnce(`garden-harvest:${student.id}:${r.result.bed.plantedAt}`, student.id, { coins: r.result.coins, gems: r.result.gems, xp: 5 });
    setTimeout(() => {
      setReaped(null);
      setHarvested(r.result);
    }, 800);
  };

  const canPlant = w.water >= PACKET_COST || w.rare > 0 || w.golden > 0;
  const bubble = (i: number) => {
    if (i >= e.plots) return null;
    const b = garden.beds[i];
    if (!b) return { icon: '🌱', tone: canPlant ? ('green' as const) : ('grey' as const) };
    if (b.stage >= STAGES) return { icon: '🧺', tone: 'gold' as const };
    return { icon: '💧', tone: w.water >= stepCost(plantOf(b.plant)) ? ('blue' as const) : ('grey' as const) };
  };
  const onBed = (i: number) => {
    if (i >= e.plots) return setNote(tr(lang, 'Learn {n} more new words to open this bed.', { n: toUnlock(i) }));
    const b = garden.beds[i];
    if (!b) return setPicking(i);
    if (b.stage >= STAGES) return void reap(i);
    void pour(i);
  };

  const nextDecor = DECOR.find((d) => found < d.at);
  const tips = [
    gained > 0 && tr(lang, '+{n} 💧 since your last visit — well learned!', { n: gained }),
    e.plots < MAX_PLOTS && tr(lang, '🟫 {n} more new words → a new bed', { n: toUnlock(e.plots) }),
    nextDecor && tr(lang, '🏡 Find {n} more plants → {thing}', { n: nextDecor.at - found, thing: tr(lang, nextDecor.name) }),
    tr(lang, '🌟 {a}/{b} right in a row → rare seed', { a: e.run, b: STREAK_FOR_RARE }),
    tr(lang, '👑 {a}/{b} new words → golden seed', { a: e.words % WORDS_FOR_GOLDEN, b: WORDS_FOR_GOLDEN }),
    tr(lang, '📗 Catalogue: {a}/{b} plants found', { a: found, b: PLANTS.length }),
  ].filter(Boolean) as string[];

  return (
    <div className="fixed inset-0 overflow-hidden text-ink-text" style={{ background: 'linear-gradient(var(--sky-top), var(--sky-bottom))' }}>
      <div className="absolute inset-x-0 bottom-[7.5rem] top-[4.5rem] sm:bottom-24 sm:top-16">
        <GardenScene tall={tall} beds={garden.beds} plots={e.plots} toUnlock={toUnlock} found={found} bubble={bubble} onBed={onBed} splash={splash} reaped={reaped} />
      </div>

      {/* Top: back, title, wallet */}
      <div className="absolute inset-x-0 top-0 flex items-start gap-2 p-2 sm:p-3">
        <button onClick={() => go({ name: 'world', worldId: 'word-forest' })} className="town-btn grid size-11 shrink-0 place-items-center rounded-xl bg-paper text-xl" aria-label="Back">
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
          <Chip icon="💧" value={w.water} color="#4b8fe2" title="Water" />
          <Chip icon="🌟" value={w.rare} color="#2563eb" title="Rare seeds" />
          <Chip icon="👑" value={w.golden} color="#f5a623" title="Golden seeds" />
        </div>
      </div>

      {note && (
        <div className="absolute inset-x-0 top-20 z-20 flex justify-center px-4">
          <div className="town-panel animate-pop px-4 py-2 text-center text-sm font-bold">{note}</div>
        </div>
      )}

      {/* Bottom: tips, catalogue, learn words */}
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
          <TownButton tone="green" className="flex-1 sm:flex-none" onClick={() => go({ name: 'world', worldId: 'word-forest' })}>
            <TB en="📖 Learn words" />
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
        </Sheet>
      )}

      {sheet === 'help' && (
        <Sheet onClose={() => setSheet(null)}>
          <h2 className="font-display text-xl font-bold">
            <T en="How the garden grows" />
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              💧 <T en="New word right = 3 water · known word right = 1 water" />
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
              🌱 <T en="Tap a bed: plant, then water it 3 times, then harvest for coins" />
            </li>
            <li>
              📗 <T en="New plants go in the catalogue; a full row = a golden seed" />
            </li>
          </ul>
          <TownButton tone="green" className="mt-4 w-full" onClick={() => setSheet(null)}>
            <TB en="Got it" />
          </TownButton>
        </Sheet>
      )}

      {picking != null && (
        <Sheet onClose={() => setPicking(null)}>
          <h2 className="font-display text-xl font-bold">
            <T en="Plant a seed" />
          </h2>
          <div className="mt-3 grid gap-2">
            <SeedRow icon="🎒" name="Seed packet" sub="Common or uncommon plant" cost={`${PACKET_COST} 💧`} ok={w.water >= PACKET_COST} onClick={() => void sow(picking, 'packet')} />
            <SeedRow icon="🌟" name="Rare seed" sub="Rare plant — sometimes legendary!" cost={`1 🌟 (${w.rare})`} ok={w.rare > 0} onClick={() => void sow(picking, 'rare')} />
            <SeedRow icon="👑" name="Golden seed" sub="Most likely a legendary plant" cost={`1 👑 (${w.golden})`} ok={w.golden > 0} onClick={() => void sow(picking, 'golden')} />
          </div>
          {!canPlant && (
            <p className="mt-3 text-center text-sm font-semibold text-ink-soft">
              <T en="Out of water — learn some words to earn more!" />
            </p>
          )}
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
            {harvested.bed.word && (
              <p className="mt-2 text-sm">
                <T en="Grown from the word" /> <b className="rounded bg-tint-green px-1.5">{harvested.bed.word}</b>
              </p>
            )}
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

function SeedRow({ icon, name, sub, cost, ok, onClick }: { icon: string; name: string; sub: string; cost: string; ok: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={!ok} className="town-btn flex items-center gap-3 rounded-xl bg-paper p-3 text-left hover:bg-paper-3">
      <span className="text-3xl">{icon}</span>
      <span className="flex-1">
        <span className="block font-display font-bold">
          <T en={name} />
        </span>
        <span className="block text-xs text-ink-soft">
          <T en={sub} />
        </span>
      </span>
      <span className="font-display text-sm font-bold">{cost}</span>
    </button>
  );
}

function Sheet({ onClose, children, wide }: { onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div className={cx('town-panel max-h-[calc(100dvh-2rem)] w-full animate-pop overflow-y-auto p-5', wide ? 'max-w-2xl' : 'max-w-sm')} onClick={(ev) => ev.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
