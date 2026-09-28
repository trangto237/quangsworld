import { useState } from 'react';
import type { StudentProfile } from '@atlas/db';
import { SHOP, canAfford, levelFromXp, type ShopCategory, type ShopItem } from '@atlas/engine';
import { Button, cx, useQuery, useRepo } from '@atlas/ui';
import { TopBar } from '../components/TopBar';
import { getEquipped, setEquipped } from '../lib/equipped';
import { useKid } from '../store';

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
  const go = useKid((s) => s.go);
  const [tab, setTab] = useState<ShopCategory>('tower');
  const [msg, setMsg] = useState<string | null>(null);
  const wallet = useQuery((r) => r.getWallet(student.id), [student.id]);
  const owned = useQuery((r) => r.listUnlocks(student.id), [student.id]);
  const equipped = useQuery((r) => getEquipped(r, student.id), [student.id]);
  const level = levelFromXp(wallet.xp).level;

  const buy = async (item: ShopItem) => {
    try {
      await repo.purchase(student.id, item.id);
      setMsg(`${item.emoji} ${item.name} unlocked!`);
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
    <div className="min-h-dvh bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      <TopBar student={student} back={() => go({ name: 'hub' })} />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="font-display text-3xl font-bold">🛒 The Armoury</h1>
        <p className="text-white/60">Spend the coins and gems you earn in battle.</p>
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cx('shrink-0 rounded-full px-4 py-2 text-sm font-bold', tab === t.id ? 'bg-amber-400 text-amber-950' : 'bg-white/10 hover:bg-white/15')}
            >
              {t.label}
            </button>
          ))}
        </div>
        {msg && <p className="mt-4 rounded-xl bg-white/10 px-4 py-2 text-sm">{msg}</p>}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SHOP.filter((i) => i.category === tab).map((item) => {
            const have = owned.includes(item.id);
            const locked = (item.minLevel ?? 1) > level;
            const equippable = have && item.category !== 'tower' && item.category !== 'chess-set';
            return (
              <div key={item.id} className={cx('flex flex-col rounded-2xl bg-white/5 p-4 ring-1', isEquipped(item) ? 'ring-amber-400' : 'ring-white/10')}>
                <div className="flex items-center gap-3">
                  <span className="text-5xl">{item.emoji}</span>
                  <div>
                    <div className="font-display text-lg font-semibold">{item.name}</div>
                    <div className="text-sm text-white/60">{item.description}</div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  {have ? (
                    <span className="text-sm font-bold text-emerald-400">✓ Owned</span>
                  ) : (
                    <span className="text-sm font-bold tabular-nums">
                      🪙 {item.coins}
                      {item.gems > 0 && <> · 💎 {item.gems}</>}
                    </span>
                  )}
                  {equippable ? (
                    <Button variant={isEquipped(item) ? 'secondary' : 'primary'} onClick={() => equip(item)}>
                      {isEquipped(item) ? 'Unequip' : 'Equip'}
                    </Button>
                  ) : !have ? (
                    <Button variant="game" disabled={locked || !canAfford(wallet, item)} onClick={() => void buy(item)}>
                      {locked ? `🔒 Level ${item.minLevel}` : 'Unlock'}
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
