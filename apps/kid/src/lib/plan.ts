import type { Repo } from '@atlas/db';
import { planDay } from '@atlas/engine';
import type { Mission } from '@atlas/shared';
import { dayKey } from '@atlas/shared';
import { doneKey } from './equipped';

export interface TodayPlan {
  date: string;
  minutes: number;
  missions: (Mission & { label: string; done: boolean })[];
}

/**
 * Today's missions are generated once per day by the adaptive engine and then frozen,
 * so finishing one quest doesn't reshuffle the rest of the list.
 */
export function todayPlan(repo: Repo, studentId: string, now = Date.now()): TodayPlan {
  const date = dayKey(now);
  const key = `plan:${studentId}:${date}`;
  let stored = repo.getKv<{ minutes: number; missions: (Mission & { label: string })[] }>(key);
  if (!stored) {
    const plan = planDay({ states: repo.getStates(studentId), goals: repo.listGoals(studentId), now });
    stored = { minutes: plan.minutes, missions: plan.missions.map((m, i) => ({ ...m, label: plan.blocks[i].label })) };
    void repo.setKv(key, stored);
  }
  const done = new Set(repo.getKv<string[]>(doneKey(studentId, date)) ?? []);
  return { date, minutes: stored.minutes, missions: stored.missions.map((m) => ({ ...m, done: done.has(m.id) })) };
}
