import { create } from 'zustand';
import type { Mission } from '@atlas/shared';
import type { Reward } from '@atlas/shared';
import { pathOf, screenOf } from './lib/route';

export type Screen =
  | { name: 'profiles' }
  | { name: 'placement' }
  | { name: 'hub' }
  | { name: 'quests' }
  | { name: 'hero' }
  | { name: 'world'; worldId: string }
  | { name: 'battle'; mission: Mission; fromPlan: boolean }
  | { name: 'results'; result: BattleResult }
  | { name: 'shop' }
  | { name: 'mistakes' }
  | { name: 'exam-hall' }
  | { name: 'exam'; examId: string }
  | { name: 'code' }
  | { name: 'writing' }
  | { name: 'arcade' }
  | { name: 'coach'; topic?: CoachTopic; conceptId?: string };

export type CoachTopic = 'stress' | 'endings' | 'sounds' | 'twins' | 'grammar';

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
  /** Mistake Book entries from this battle, for the post-battle review. */
  mistakeIds: string[];
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

/** Keeps the address bar in step with the screen. Leaving a battle replaces it, so Back never re-enters one. */
function syncUrl(from: Screen, to: Screen) {
  if (typeof history === 'undefined') return;
  const path = pathOf(to);
  try {
    if (path === location.pathname) history.replaceState(null, '', path);
    else if (from.name === 'battle' || from.name === 'placement') history.replaceState(null, '', path);
    else history.pushState(null, '', path);
  } catch {
    /* sandboxed */
  }
}

const startScreen = (): Screen => (saved ? (typeof location !== 'undefined' ? screenOf(location.pathname) : { name: 'hub' }) : { name: 'profiles' });

export const useKid = create<KidState>((set, get) => ({
  studentId: saved,
  screen: startScreen(),
  go: (screen) => {
    syncUrl(get().screen, screen);
    set({ screen });
  },
  login: (id) => {
    try {
      sessionStorage.setItem(SESSION_KEY, id);
    } catch {
      /* ignore */
    }
    syncUrl({ name: 'profiles' }, { name: 'hub' });
    set({ studentId: id, screen: { name: 'hub' } });
  },
  logout: () => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
    syncUrl({ name: 'profiles' }, { name: 'profiles' });
    set({ studentId: null, screen: { name: 'profiles' } });
  },
}));

// Browser Back / Forward: show the screen for the new address.
if (typeof window !== 'undefined')
  window.addEventListener('popstate', () => {
    if (!useKid.getState().studentId) return;
    useKid.setState({ screen: screenOf(location.pathname) });
  });
