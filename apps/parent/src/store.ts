import { create } from 'zustand';

export type Tab = 'dashboard' | 'knowledge' | 'goals' | 'materials' | 'profiles' | 'settings';

const AUTH_KEY = 'atlas-parent-auth';
const readAuth = () => {
  try {
    return sessionStorage.getItem(AUTH_KEY) === '1';
  } catch {
    return false;
  }
};

interface ParentState {
  authed: boolean;
  tab: Tab;
  studentId: string | null;
  setTab: (t: Tab) => void;
  setStudent: (id: string | null) => void;
  signIn: () => void;
  signOut: () => void;
}

export const useParent = create<ParentState>((set) => ({
  authed: readAuth(),
  tab: 'dashboard',
  studentId: null,
  setTab: (tab) => set({ tab }),
  setStudent: (studentId) => set({ studentId }),
  signIn: () => {
    try {
      sessionStorage.setItem(AUTH_KEY, '1');
    } catch {
      /* ignore */
    }
    set({ authed: true });
  },
  signOut: () => {
    try {
      sessionStorage.removeItem(AUTH_KEY);
    } catch {
      /* ignore */
    }
    set({ authed: false });
  },
}));
