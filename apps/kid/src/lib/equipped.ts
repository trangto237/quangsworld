import type { Repo } from '@atlas/db';

export interface Equipped {
  skin: 'default' | 'neon' | 'gold';
  theme: 'day' | 'night' | 'snow';
  avatarItem: string | null;
}

export const DEFAULT_EQUIPPED: Equipped = { skin: 'default', theme: 'day', avatarItem: null };

export const getEquipped = (repo: Repo, studentId: string): Equipped => ({ ...DEFAULT_EQUIPPED, ...repo.getKv<Partial<Equipped>>(`equipped:${studentId}`) });

export const setEquipped = (repo: Repo, studentId: string, patch: Partial<Equipped>) =>
  repo.setKv(`equipped:${studentId}`, { ...getEquipped(repo, studentId), ...patch });

/** Missions from today's plan the kid has already completed. */
export const doneKey = (studentId: string, date: string) => `done:${studentId}:${date}`;
