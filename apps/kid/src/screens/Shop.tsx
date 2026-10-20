import { useState } from 'react';
import type { StudentProfile } from '@atlas/db';
import { SHOP, canAfford, levelFromXp, type ShopCategory, type ShopItem, type ShopMode } from '@atlas/engine';
import { MODES } from '@atlas/game';
import { cx, useQuery, useRepo } from '@atlas/ui';
import { HeroAvatar, TownScreen } from '../town/Shell';
import { Panel, TownButton } from '../town/ui';
import { getSlots, toggleEquip } from '../lib/equipped';
import { EffectBurst } from '../components/modes/look';
import { T, TB, tr, useLang, type LangMode } from '../i18n';

const TABS: { id: ShopCategory; label: string; note: string }[] = [
  { id: 'look', label: '🧢 Your look', note: 'A hat and a pet for your hero. You see them on the map, on your hero card and in every game.' },
  { id: 'effect', label: '✨ Effects', note: 'What bursts out when you answer right — in every game.' },
  { id: 'game', label: '🎮 Games', note: 'Items for one game: its place, or your gear. You see them only in that game.' },
];

const GAME_ORDER: ShopMode[] = ['defense', 'runner', 'duel', 'knight', 'penalty', 'race', 'meteor', 'sprint', 'detective'];

/** Where an item shows up, in plain words. */
function whereText(lang: LangMode, item: ShopItem): string {
  if (item.slot === 'hat') return tr(lang, 'On your hero: map, hero card, every game');
  if (item.slot === 'pet') return tr(lang, 'Next to your hero: map, hero card, every game');
  if (item.category === 'effect') return tr(lang, 'Every game, after a right answer');
  if (item.id.startsWith('tower.')) return tr(lang, 'Castle Defense: a tower you can build');
  return tr(lang, 'Only in {game}', { game: tr(lang, MODES[item.mode ?? 'defense'].name) });
}

/** The shop: everything is earned by learning. No real money, no pay-to-win. */
export function Shop({ student }: { student: StudentProfile }) {
  const repo = useRepo();
  const lang = useLang();
  const [tab, setTab] = useState<ShopCategory>('look');
  const [mode, setMode] = useState<ShopMode>('defense');
  const [msg, setMsg] = useState<string | null>(null);
  const [burst, setBurst] = useState<{ id: number; emoji: string } | null>(null);
  const wallet = useQuery((r) => r.getWallet(student.id), [student.id]);
  const owned = useQuery((r) => r.listUnlocks(student.id), [student.id]);
  const slots = useQuery((r) => getSlots(r, student.id), [student.id]);
  const level = levelFromXp(wallet.xp).level;

  const tryEffect = (emoji: string) => {
    const id = Date.now();
    setBurst({ id, emoji });
    setTimeout(() => setBurst((b) => (b?.id === id ? null : b)), 1300);
  };

  const buy = async (item: ShopItem) => {
    try {
      await repo.purchase(student.id, item.id);
      // Put it on straight away.
      if (item.slot && slots[item.slot] !== item.id) await toggleEquip(repo, student.id, item);
      setMsg(`${item.emoji} ${tr(lang, '{name} unlocked!', { name: tr(lang, item.name) })} ${whereText(lang, item)}.`);
      if (item.category === 'effect') tryEffect(item.emoji);
    } catch (e) {
      setMsg((e as Error).message);
    }
  };

  const equip = async (item: ShopItem) => {
    await toggleEquip(repo, student.id, item);
    if (item.category === 'effect' && slots.effect !== item.id) tryEffect(item.emoji);
  };

  const items = SHOP.filter((i) => i.category === tab && (tab !== 'game' || i.mode === mode));
  const groups: { title: string; items: ShopItem[] }[] =
    tab === 'look'
      ? [
          { title: '🎩 Hats', items: items.filter((i) => i.slot === 'hat') },
          { title: '🐾 Pets', items: items.filter((i) => i.slot === 'pet') },
        ]
      : [{ title: '', items }];
  const note = TABS.find((t) => t.id === tab)!.note;
  const wearing = ['hat', 'pet', 'effect'].map((s) => SHOP.find((i) => i.id === slots[s])).filter(Boolean) as ShopItem[];

  return (
    <TownScreen student={student} tab="shop">
      <Panel className="flex items-center gap-4">
        <div className="px-3 pt-4">
          <HeroAvatar student={student} size="lg" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl font-bold leading-tight">
            <T en="🛒 Shop" />
          </h1>
          <p className="text-sm text-ink-soft">
            <T en="Spend the coins and gems you earn by learning. Tap Equip to wear an item; tap again to take it off." />
          </p>
          <p className="mt-1 text-sm font-semibold">
            <T en="Wearing:" /> {wearing.length ? wearing.map((i) => i.emoji).join(' ') : <T en="nothing yet" />}
          </p>
        </div>
      </Panel>

      <div className="mt-4 flex gap-2 overflow-x-auto px-0.5 pb-2 pt-0.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cx('town-btn shrink-0 rounded-full px-4 py-1.5 font-display text-sm font-bold', tab === t.id ? 'bg-[#ffc23d] text-[#3b2412]' : 'bg-paper text-ink-text hover:bg-paper-3')}
          >
            <TB en={t.label} />
          </button>
        ))}
      </div>
      <p className="mt-1 text-sm font-semibold text-ink-soft">
        <T en={note} />
      </p>

      {tab === 'game' && (
        <div className="mt-3 flex gap-1.5 overflow-x-auto px-0.5 pb-2 pt-0.5">
          {GAME_ORDER.map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cx('town-btn shrink-0 rounded-xl px-3 py-1 text-sm font-bold', mode === m ? 'bg-[#4b8fe2] text-white' : 'bg-paper text-ink-text hover:bg-paper-3')}
            >
              {MODES[m].emoji} <TB en={MODES[m].name} />
            </button>
          ))}
        </div>
      )}

      {msg && (
        <p className="town-panel mt-3 flex items-center gap-2 px-4 py-2 text-sm font-semibold">
          <span className="flex-1">{msg}</span>
          <button onClick={() => setMsg(null)} className="text-ink-soft" aria-label={tr(lang, 'Close')}>
            ✕
          </button>
        </p>
      )}

      {groups.map((g) => (
        <section key={g.title} className="mt-4">
          {g.title && (
            <h2 className="mb-2 font-display text-xl font-bold">
              <T en={g.title} />
            </h2>
          )}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {g.items.map((item) => {
              const have = owned.includes(item.id);
              const locked = (item.minLevel ?? 1) > level;
              const on = !!item.slot && slots[item.slot] === item.id;
              return (
                <div key={item.id} className={cx('town-panel flex flex-col p-4', on && 'bg-tint-amber')}>
                  <div className="flex items-center gap-3">
                    <span className="grid size-16 shrink-0 place-items-center rounded-2xl border-2 border-ink bg-paper-2 text-4xl">{item.emoji}</span>
                    <div className="min-w-0">
                      <div className="font-display text-lg font-bold leading-tight">
                        <T en={item.name} />
                      </div>
                      <div className="text-sm text-ink-soft">
                        <T en={item.description} />
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 rounded-lg bg-paper-2 px-2 py-1 text-xs font-semibold">
                    📍 {whereText(lang, item)}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    {have ? (
                      <span className="text-sm font-bold text-[#2f8a3a] dark:text-[#86d993]">{on ? <T en="✓ Wearing" /> : <T en="✓ Owned" />}</span>
                    ) : (
                      <span className="text-sm font-bold tabular-nums">
                        {item.coins > 0 ? `🪙 ${item.coins}` : <T en="Free" />}
                        {item.gems > 0 && <> · 💎 {item.gems}</>}
                      </span>
                    )}
                    <div className="flex gap-1.5">
                      {item.category === 'effect' && (
                        <TownButton tone="paper" size="sm" onClick={() => tryEffect(item.emoji)}>
                          <TB en="Try" />
                        </TownButton>
                      )}
                      {have && item.slot ? (
                        <TownButton tone={on ? 'paper' : 'blue'} size="sm" onClick={() => void equip(item)}>
                          <TB en={on ? 'Take off' : 'Equip'} />
                        </TownButton>
                      ) : !have ? (
                        <TownButton tone="amber" size="sm" disabled={locked || !canAfford(wallet, item)} onClick={() => void buy(item)}>
                          {locked ? <TB en="🔒 Level {n}" vars={{ n: item.minLevel ?? 1 }} /> : <TB en="Unlock" />}
                        </TownButton>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
      {burst && <EffectBurst key={burst.id} id={burst.id} emoji={burst.emoji} />}
    </TownScreen>
  );
}
