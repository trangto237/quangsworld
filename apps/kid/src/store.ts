import { create } from 'zustand';
import type { Mission } from '@atlas/shared';
import type { Reward } from '@atlas/shared';

export type Screen =
  | { name: 'profiles' }
  | { name: 'placement' }
  | { name: 'hub' }
  | { name: 'world'; worldId: string }
  | { name: 'battle'; mission: Mission; fromPlan: boolean }
  | { name: 'results'; result: BattleResult }
  | { name: 'shop' };

export interface BattleResult {
  mission: Mission;
  victory: boolean;
  retreated: boolean;
  answered: number;
  correct: number;
  bestStreak: number;
  reward: Reward;
  levelBefore: number;
  levelAfter: number;
  masteryChanges: { conceptId: string; before: number; after: number }[];
  missed: string[];
}

interface KidState {
  studentId: string | null;
  screen: Screen;
  go: (s: Screen) => void;
  login: (id: string) => void;
  logout: () => void;
}

const SESSION_KEY = 'atlas-kid-student';
const saved = (() => {
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
})();

export const useKid = create<KidState>((set) => ({
  studentId: saved,
  screen: saved ? { name: 'hub' } : { name: 'profiles' },
  go: (screen) => set({ screen }),
  login: (id) => {
    try {
      sessionStorage.setItem(SESSION_KEY, id);
    } catch {
      /* ignore */
    }
    set({ studentId: id, screen: { name: 'hub' } });
  },
  logout: () => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
    set({ studentId: null, screen: { name: 'profiles' } });
  },
}));
