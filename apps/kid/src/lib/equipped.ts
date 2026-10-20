import type { Repo } from '@atlas/db';
import { SHOP, type ShopItem } from '@atlas/engine';

/**
 * What the hero has equipped: one item per slot ('hat', 'pet', 'effect', 'race.vehicle', …), as item ids.
 * Stored per student; older saves ({ skin, theme, avatarItem }) are read too.
 */
export type Slots = Record<string, string>;

/** The Castle Defense game still takes these two settings. */
export interface Equipped {
  skin: 'default' | 'neon' | 'gold';
  theme: 'day' | 'night' | 'snow';
  slots: Slots;
}

const key = (studentId: string) => `equipped:${studentId}`;

export function getSlots(repo: Repo, studentId: string): Slots {
  const raw = repo.getKv<Record<string, unknown>>(key(studentId)) ?? {};
  const out: Slots = {};
  // Old format.
  if (typeof raw.avatarItem === 'string') out.hat = raw.avatarItem;
  if (raw.skin === 'neon' || raw.skin === 'gold') out['defense.skin'] = `skin.${raw.skin}`;
  if (raw.theme === 'night' || raw.theme === 'snow') out['defense.theme'] = `theme.${raw.theme}`;
  // New format wins.
  if (raw.slots && typeof raw.slots === 'object') Object.assign(out, raw.slots as Slots);
  return out;
}

export function getEquipped(repo: Repo, studentId: string): Equipped {
  const slots = getSlots(repo, studentId);
  const skin = slots['defense.skin']?.split('.')[1];
  const theme = slots['defense.theme']?.split('.')[1];
  return {
    skin: skin === 'neon' || skin === 'gold' ? skin : 'default',
    theme: theme === 'night' || theme === 'snow' ? theme : 'day',
    slots,
  };
}

/** Equip an item in its slot, or take it off if it's already on. */
export async function toggleEquip(repo: Repo, studentId: string, item: ShopItem) {
  if (!item.slot) return;
  const slots = getSlots(repo, studentId);
  if (slots[item.slot] === item.id) delete slots[item.slot];
  else slots[item.slot] = item.id;
  await repo.setKv(key(studentId), { slots });
}

/** The item equipped in a slot, if any. */
export const inSlot = (slots: Slots, slot: string): ShopItem | undefined => {
  const id = slots[slot];
  return id ? SHOP.find((i) => i.id === id) : undefined;
};

/** Missions from today's plan the kid has already completed. */
export const doneKey = (studentId: string, date: string) => `done:${studentId}:${date}`;
