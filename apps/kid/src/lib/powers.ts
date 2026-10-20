import type { Repo } from '@atlas/db';
import { PLACEMENT_SECTIONS } from '@atlas/knowledge';
import type { ConceptState } from '@atlas/shared';

/** The hero's five stats: one per trial realm, from the mastery of that realm's topics. */
export interface Power {
  id: string;
  icon: string;
  name: string;
  color: string;
  /** 0–100 now. */
  value: number;
  /** 0–100 at the trial, if taken. */
  start?: number;
}

const LOOK: Record<string, { icon: string; name: string; color: string }> = {
  'word-hunter': { icon: '🏹', name: 'Word Power', color: '#e8584a' },
  'sentence-forge': { icon: '⚒️', name: 'Sentence Craft', color: '#f59e0b' },
  'echo-cave': { icon: '🦇', name: 'Echo Sense', color: '#8b5cf6' },
  'reading-puzzle': { icon: '🧩', name: 'Tablet Reading', color: '#0ea5e9' },
  'math-logic': { icon: '♞', name: 'Math Logic', color: '#22a35a' },
};

const mean = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0);

export function powersFrom(states: Record<string, ConceptState>, trial?: Record<string, number>): Power[] {
  return PLACEMENT_SECTIONS.map((s) => {
    const look = LOOK[s.id] ?? { icon: '⭐', name: s.title, color: '#ffc23d' };
    const start = trial ? s.concepts.map((c) => trial[c]).filter((v): v is number => typeof v === 'number') : [];
    return {
      id: s.id,
      ...look,
      value: mean(s.concepts.map((c) => states[c]?.mastery ?? trial?.[c] ?? 0)),
      start: start.length ? mean(start) : undefined,
    };
  });
}

export const getPowers = (repo: Repo, studentId: string) => powersFrom(repo.getStates(studentId), repo.latestPlacement(studentId)?.scores.concepts);
