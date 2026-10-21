import { useEffect, useMemo, useState } from 'react';
import type { StudentProfile } from '@atlas/db';
import { getQuestion } from '@atlas/knowledge';
import type { Attempt } from '@atlas/shared';
import { cx, useQuery, useRepo } from '@atlas/ui';
import { T, TB } from '../i18n';
import {
  MAX_PLOTS,
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
  type Bed,
  type GardenState,
  type Harvest,
  type Plant,
  type SeedKind,
  type Tier,
} from '../lib/garden';
import { Chip, Panel, TownButton } from '../town/ui';

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

const STAGE_ICON = ['🫘', '🌱', '🌿'];

/**
 * Vườn ươm Từ vựng: the garden at the top of the Word Garden island. Learning words earns water and seeds;
 * he plants, waters and harvests, and every new plant goes into the catalogue.
 */
export function WordGarden({ student }: { student: StudentProfile }) {
  const repo = useRepo();
  const attempts = useQuery((r) => r.listAttempts(student.id), [student.id]);
  const garden = useQuery((r) => r.getKv<GardenState>(gardenKey(student.id)) ?? emptyGarden(), [student.id]);
  const e = useMemo(() => earned(attempts), [attempts]);
  const words = useMemo(() => recentWords(attempts), [attempts]);
  const w = walletOf(e, garden);
  const [picking, setPicking] = useState<number | null>(null);
  const [splash, setSplash] = useState<number | null>(null);
  const [harvested, setHarvested] = useState<Harvest | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [tab, setTab] = useState<'beds' | 'book'>('beds');
  // Water earned since he last came, shown once.
  const [gained] = useState(() => (garden.seenWater > 0 ? e.water - garden.seenWater : 0));

  useEffect(() => {
    if (garden.seenWater !== e.water) void repo.setKv(gardenKey(student.id), { ...garden, seenWater: e.water });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [e.water]);

  const fresh = () => repo.getKv<GardenState>(gardenKey(student.id)) ?? emptyGarden();
  const save = (g: GardenState) => repo.setKv(gardenKey(student.id), { ...g, seenWater: e.water });

  const sow = async (i: number, kind: SeedKind) => {
    const g = fresh();
    const used = new Set(g.beds.map((b) => b?.word));
    const word = words.find((x) => !used.has(x)) ?? words[0];
    const r = plant(g, walletOf(e, g), e.plots, i, kind, word, Date.now());
    setPicking(null);
    if (!r.ok) return setNote(r.why);
    await save(r.garden);
    setNote(null);
  };

  const pour = async (i: number) => {
    const g = fresh();
    const r = water(g, walletOf(e, g), i);
    if (!r.ok) return setNote(r.why);
    setSplash(i);
    setTimeout(() => setSplash((s) => (s === i ? null : s)), 700);
    await save(r.garden);
    setNote(null);
  };

  const reap = async (i: number) => {
    const r = harvest(fresh(), i);
    if ('why' in r) return setNote(r.why);
    await save(r.garden);
    await repo.claimOnce(`garden-harvest:${student.id}:${r.result.bed.plantedAt}`, student.id, { coins: r.result.coins, gems: r.result.gems, xp: 5 });
    setHarvested(r.result);
  };

  const found = PLANTS.filter((p) => garden.found[p.id]).length;
  const toPlot = e.plots >= MAX_PLOTS ? null : WORDS_PER_PLOT - (e.words % WORDS_PER_PLOT);

  return (
    <div className="mx-auto max-w-2xl">
      <Panel className="overflow-hidden !p-0">
        <div className="bg-[linear-gradient(180deg,#bfe6ff,#e6f6d5)] px-4 pb-3 pt-4 dark:bg-[linear-gradient(180deg,#1d3a52,#22371f)]">
          <div className="flex flex-wrap items-center gap-2">
            <Chip icon="💧" value={w.water} color="#4b8fe2" title="Water: earned by learning words" />
            <Chip icon="🌟" value={w.rare} color="#2563eb" title="Rare seeds" />
            <Chip icon="👑" value={w.golden} color="#f5a623" title="Golden seeds" />
            <Chip icon="📖" value={e.words} color="#5cb85c" title="Words learned" />
            {gained > 0 && <span className="animate-pop rounded-full border-2 border-ink bg-[#d7ecff] px-2 py-0.5 font-display text-sm font-bold text-[#1d4f8f]">+{gained} 💧</span>}
          </div>
          <p className="mt-2 text-xs font-semibold text-ink-soft">
            <T en="New word ✓ = 3 💧 · Known word ✓ = 1 💧" />
          </p>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs font-semibold text-ink-soft">
            <span>
              🌟 {e.run}/{STREAK_FOR_RARE} <T en="right in a row" />
            </span>
            <span>
              👑 {e.words % WORDS_FOR_GOLDEN}/{WORDS_FOR_GOLDEN} <T en="new words" />
            </span>
            {toPlot != null && (
              <span>
                🟫 <T en="{n} more words → new bed" vars={{ n: toPlot }} />
              </span>
            )}
          </div>
        </div>
        <div className="flex border-t-2 border-ink">
          {(['beds', 'book'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cx('flex-1 py-2 font-display font-bold', tab === t ? 'bg-paper' : 'bg-paper-3 text-ink-soft')}>
              {t === 'beds' ? (
                <TB en="🌱 Garden" />
              ) : (
                <>
                  <TB en="📗 Catalogue" /> <span className="text-xs">({found}/{PLANTS.length})</span>
                </>
              )}
            </button>
          ))}
        </div>
      </Panel>

      {tab === 'beds' ? (
        <>
          <div className="mt-3 grid grid-cols-3 gap-2.5">
            {Array.from({ length: MAX_PLOTS }, (_, i) => (
              <BedTile
                key={i}
                bed={garden.beds[i] ?? null}
                locked={i >= e.plots}
                splash={splash === i}
                canWater={(b) => w.water >= stepCost(plantOf(b.plant))}
                onEmpty={() => setPicking(i)}
                onWater={() => void pour(i)}
                onHarvest={() => void reap(i)}
              />
            ))}
          </div>
          {note && <p className="mt-2 text-center text-sm font-bold text-[#b4432f] dark:text-[#ff9a8a]">{note}</p>}
        </>
      ) : (
        <Catalogue found={garden.found} />
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
        </Sheet>
      )}

      {harvested && (
        <Sheet onClose={() => setHarvested(null)}>
          <div className="text-center">
            {harvested.first && <div className="font-display text-sm font-bold uppercase tracking-wider text-[#c48a00]">✨ <T en="New plant discovered!" /></div>}
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

function BedTile({
  bed,
  locked,
  splash,
  canWater,
  onEmpty,
  onWater,
  onHarvest,
}: {
  bed: Bed | null;
  locked: boolean;
  splash: boolean;
  canWater: (b: Bed) => boolean;
  onEmpty: () => void;
  onWater: () => void;
  onHarvest: () => void;
}) {
  if (locked)
    return (
      <div className="garden-soil grid aspect-square place-items-center rounded-2xl border-[2.5px] border-dashed border-ink/50 opacity-45">
        <span className="text-2xl">🔒</span>
      </div>
    );
  if (!bed)
    return (
      <button onClick={onEmpty} className="garden-soil town-btn grid aspect-square place-items-center rounded-2xl">
        <span className="rounded-full bg-paper/85 px-2 py-0.5 font-display text-sm font-bold text-ink-text">
          ＋ <T en="Plant" />
        </span>
      </button>
    );
  const p = plantOf(bed.plant);
  const ready = bed.stage >= STAGES;
  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={ready ? onHarvest : onWater}
        className={cx('garden-soil town-btn relative grid aspect-square place-items-center overflow-hidden rounded-2xl', ready && 'ring-4 ring-[#ffc23d]')}
        aria-label={ready ? `Harvest ${p.en}` : `Water (${stepCost(p)} water)`}
      >
        {ready ? (
          <PlantIcon p={p} className="town-bob text-5xl" />
        ) : (
          <span className="text-[2rem] leading-none" style={{ fontSize: `${1.6 + bed.stage * 0.5}rem` }}>
            {STAGE_ICON[bed.stage]}
          </span>
        )}
        {splash && (
          <span className="pointer-events-none absolute inset-0" aria-hidden>
            {[18, 42, 66].map((l, k) => (
              <span key={k} className="garden-drop absolute top-0 text-lg" style={{ left: `${l}%`, animationDelay: `${k * 90}ms` }}>
                💧
              </span>
            ))}
          </span>
        )}
        {bed.word && <span className="absolute bottom-1 left-1/2 max-w-[92%] -translate-x-1/2 truncate rounded border border-ink/60 bg-[#f3dfb6] px-1 text-[10px] font-bold text-[#4a2e18]">{bed.word}</span>}
        <span className="absolute left-1.5 top-1.5 flex gap-0.5" aria-hidden>
          {Array.from({ length: STAGES }, (_, k) => (
            <span key={k} className={cx('size-1.5 rounded-full border border-ink/60', k < bed.stage ? 'bg-[#4b8fe2]' : 'bg-paper/70')} />
          ))}
        </span>
      </button>
      {ready ? (
        <TownButton tone="amber" size="sm" onClick={onHarvest} className="w-full">
          🧺 <T en="Harvest" />
        </TownButton>
      ) : (
        <TownButton tone="blue" size="sm" onClick={onWater} disabled={!canWater(bed)} className="w-full">
          💧 {stepCost(p)}
        </TownButton>
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

function Sheet({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div className="town-panel w-full max-w-sm animate-pop p-5" onClick={(ev) => ev.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
