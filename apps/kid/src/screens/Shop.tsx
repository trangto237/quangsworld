import { useState } from 'react';
import type { StudentProfile } from '@atlas/db';
import { SHOP, canAfford, levelFromXp, type ShopCategory, type ShopItem } from '@atlas/engine';
import { cx, useQuery, useRepo } from '@atlas/ui';
import { TownScreen } from '../town/Shell';
import { Panel, TownButton } from '../town/ui';
import { getEquipped, setEquipped } from '../lib/equipped';
import { T, TB, tr, useLang } from '../i18n';

const TABS: { id: ShopCategory; label: string }[] = [
  { id: 'tower', label: '♜ Towers' },
  { id: 'skin', label: '✨ Skins' },
  { id: 'world-theme', label: '🌙 Battlefields' },
  { id: 'avatar', label: '👑 Avatar' },
  { id: 'chess-set', label: '♔ Chess sets' },
];

/** The Armoury: everything is earned by learning. No real money, no pay-to-win. */
export function Shop({ student }: { student: StudentProfile }) {
  const repo = useRepo();
  const [tab, setTab] = useState<ShopCategory>('tower');
  const [msg, setMsg] = useState<string | null>(null);
  const lang = useLang();
  const wallet = useQuery((r) => r.getWallet(student.id), [student.id]);
  const owned = useQuery((r) => r.listUnlocks(student.id), [student.id]);
  const equipped = useQuery((r) => getEquipped(r, student.id), [student.id]);
  const level = levelFromXp(wallet.xp).level;

  const buy = async (item: ShopItem) => {
    try {
      await repo.purchase(student.id, item.id);
      setMsg(`${item.emoji} ${tr(lang, '{name} unlocked!', { name: tr(lang, item.name) })}`);
    } catch (e) {
      setMsg((e as Error).message);
    }
  };

  const isEquipped = (item: ShopItem) =>
    (item.category === 'skin' && equipped.skin === item.id.split('.')[1]) ||
    (item.category === 'world-theme' && equipped.theme === item.id.split('.')[1]) ||
    (item.category === 'avatar' && equipped.avatarItem === item.id);

  const equip = (item: ShopItem) => {
    const key = item.id.split('.')[1];
    if (item.category === 'skin') void setEquipped(repo, student.id, { skin: isEquipped(item) ? 'default' : (key as 'neon' | 'gold') });
    if (item.category === 'world-theme') void setEquipped(repo, student.id, { theme: isEquipped(item) ? 'day' : (key as 'night' | 'snow') });
    if (item.category === 'avatar') void setEquipped(repo, student.id, { avatarItem: isEquipped(item) ? null : item.id });
  };

  return (
    <TownScreen student={student} tab="shop">
      <Panel>
        <h1 className="font-display text-3xl font-bold">
          <T en="🛒 The Armoury" />
        </h1>
        <p className="text-ink-soft">
          <T en="Spend the coins and gems you earn in battle." />
        </p>
      </Panel>
        <div className="mt-5 flex gap-2 overflow-x-auto px-0.5 pb-2 pt-0.5">
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
        {msg && <p className="town-panel mt-4 px-4 py-2 text-sm font-semibold">{msg}</p>}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SHOP.filter((i) => i.category === tab).map((item) => {
            const have = owned.includes(item.id);
            const locked = (item.minLevel ?? 1) > level;
            const equippable = have && item.category !== 'tower' && item.category !== 'chess-set';
            return (
              <div key={item.id} className={cx('town-panel flex flex-col p-4', isEquipped(item) && 'bg-tint-amber')}>
                <div className="flex items-center gap-3">
                  <span className="grid size-16 shrink-0 place-items-center rounded-2xl border-2 border-ink bg-paper-2 text-4xl">{item.emoji}</span>
                  <div>
                    <div className="font-display text-lg font-bold leading-tight">
                      <T en={item.name} />
                    </div>
                    <div className="text-sm text-ink-soft">
                      <T en={item.description} />
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  {have ? (
                    <span className="text-sm font-bold text-[#2f8a3a] dark:text-[#86d993]">
                      <T en="✓ Owned" />
                    </span>
                  ) : (
                    <span className="text-sm font-bold tabular-nums">
                      🪙 {item.coins}
                      {item.gems > 0 && <> · 💎 {item.gems}</>}
                    </span>
                  )}
                  {equippable ? (
                    <TownButton tone={isEquipped(item) ? 'paper' : 'blue'} size="sm" onClick={() => equip(item)}>
                      <TB en={isEquipped(item) ? 'Unequip' : 'Equip'} />
                    </TownButton>
                  ) : !have ? (
                    <TownButton tone="amber" size="sm" disabled={locked || !canAfford(wallet, item)} onClick={() => void buy(item)}>
                      {locked ? <TB en="🔒 Level {n}" vars={{ n: item.minLevel ?? 1 }} /> : <TB en="Unlock" />}
                    </TownButton>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
    </TownScreen>
  );
}
