import type { Attempt, ConceptState, StudySession, SubjectId } from '@atlas/shared';
import { DAY_MS, dayKey, startOfDay } from '@atlas/shared';
import { SUBJECTS, allConcepts, getConcept } from '@atlas/knowledge';
import { isMastered } from './mastery';

export interface InsightInput {
  states: Record<string, ConceptState>;
  attempts: Attempt[];
  sessions: StudySession[];
  now?: number;
}

export interface HeatCell {
  conceptId: string;
  name: string;
  subject: SubjectId;
  domain: string;
  mastery: number;
  attempts: number;
  /** Has a mastery estimate (from placement or practice). */
  assessed: boolean;
  recentAccuracy: number | null;
}

export interface Insights {
  weekly: { day: string; label: string; minutes: number }[];
  weeklyMinutes: number;
  avgDailyMinutes: number;
  streakDays: number;
  masteredCount: number;
  totalConcepts: number;
  subjectProgress: { subject: SubjectId; name: string; color: string; mastery: number; mastered: number; total: number; practised: number }[];
  heatmap: HeatCell[];
  struggles: { name: string; conceptId: string; detail: string }[];
  strengths: { name: string; conceptId: string; detail: string }[];
  recommended: string[];
  ielts: { band: number; cefr: string } | null;
  accuracy7d: number | null;
  questions7d: number;
}

export function sessionMinutesByDay(sessions: StudySession[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const s of sessions) m.set(dayKey(s.startedAt), (m.get(dayKey(s.startedAt)) ?? 0) + s.activeMs / 60000);
  return m;
}

/** Consecutive days with at least one study session, counting back from today (or yesterday). */
export function studyStreak(sessions: StudySession[], now = Date.now()): number {
  const days = new Set(sessions.filter((s) => s.activeMs >= 30_000).map((s) => dayKey(s.startedAt)));
  let cursor = startOfDay(now);
  if (!days.has(dayKey(cursor))) cursor -= DAY_MS;
  let n = 0;
  while (days.has(dayKey(cursor))) {
    n++;
    cursor = startOfDay(cursor - DAY_MS / 2);
  }
  return n;
}

/** Rough IELTS band from English mastery (0–100 → 4.0–8.0, half-band steps). */
export function ieltsBand(englishMastery: number): number {
  return Math.round((4 + (Math.max(0, Math.min(100, englishMastery)) / 100) * 4) * 2) / 2;
}

export function cefrLevel(englishMastery: number): string {
  return englishMastery >= 85 ? 'C1' : englishMastery >= 68 ? 'B2' : englishMastery >= 50 ? 'B1' : englishMastery >= 30 ? 'A2' : 'A1';
}

export function computeInsights({ states, attempts, sessions, now = Date.now() }: InsightInput): Insights {
  const perDay = sessionMinutesByDay(sessions);
  const weekly = Array.from({ length: 7 }, (_, i) => {
    const ts = startOfDay(now) - (6 - i) * DAY_MS + DAY_MS / 2;
    const key = dayKey(ts);
    return { day: key, label: new Date(ts).toLocaleDateString('en', { weekday: 'short' }), minutes: Math.round(perDay.get(key) ?? 0) };
  });
  const weeklyMinutes = weekly.reduce((s, d) => s + d.minutes, 0);
  const activeDays = weekly.filter((d) => d.minutes > 0).length;

  const weekAgo = now - 7 * DAY_MS;
  const recent = attempts.filter((a) => a.createdAt >= weekAgo);
  const recentByConcept = new Map<string, { n: number; c: number }>();
  for (const a of attempts.filter((x) => x.createdAt >= now - 14 * DAY_MS)) {
    const r = recentByConcept.get(a.conceptId) ?? { n: 0, c: 0 };
    r.n++;
    if (a.correct) r.c++;
    recentByConcept.set(a.conceptId, r);
  }

  const concepts = allConcepts();
  const heatmap: HeatCell[] = concepts.map((c) => {
    const s = states[c.id];
    const r = recentByConcept.get(c.id);
    return {
      conceptId: c.id,
      name: c.name,
      subject: c.subject,
      domain: c.domain,
      mastery: Math.round(s?.mastery ?? 0),
      attempts: s?.attempts ?? 0,
      assessed: !!s,
      recentAccuracy: r && r.n ? r.c / r.n : null,
    };
  });

  const subjectProgress = SUBJECTS.map((sub) => {
    const cs = concepts.filter((c) => c.subject === sub.id);
    const ss = cs.map((c) => states[c.id]).filter(Boolean);
    return {
      subject: sub.id,
      name: sub.name,
      color: sub.color,
      mastery: ss.length ? Math.round(ss.reduce((a, s) => a + s.mastery, 0) / ss.length) : 0,
      mastered: ss.filter(isMastered).length,
      total: cs.length,
      practised: ss.length,
    };
  });

  const struggles = heatmap
    .filter((h) => (h.recentAccuracy !== null && recentByConcept.get(h.conceptId)!.n >= 3 && h.recentAccuracy < 0.6) || (h.attempts >= 3 && h.mastery < 40))
    .sort((a, b) => (a.recentAccuracy ?? a.mastery / 100) - (b.recentAccuracy ?? b.mastery / 100))
    .slice(0, 5)
    .map((h) => ({
      name: h.name,
      conceptId: h.conceptId,
      detail: h.recentAccuracy !== null ? `${Math.round(h.recentAccuracy * 100)}% correct in the last 2 weeks` : `mastery ${h.mastery}/100`,
    }));

  const strengths = heatmap
    .filter((h) => h.mastery >= 70 && (states[h.conceptId]?.confidence ?? 0) >= 0.3)
    .sort((a, b) => b.mastery - a.mastery)
    .slice(0, 5)
    .map((h) => ({ name: h.name, conceptId: h.conceptId, detail: `mastery ${h.mastery}/100` }));

  const eng = subjectProgress.find((s) => s.subject === 'english')!;
  const recommended: string[] = [];
  if (struggles[0]) {
    const c = getConcept(struggles[0].conceptId);
    recommended.push(`Focus on ${struggles[0].name}${c?.lesson ? ` — tip: ${c.lesson}` : ''}`);
  }
  const avgDaily = weeklyMinutes / 7;
  if (avgDaily < 20) recommended.push(`Average daily study is ${Math.round(avgDaily)} min — the target is 20+. Short daily sessions beat long weekend ones.`);
  const weakestSubject = [...subjectProgress].filter((s) => s.practised > 0).sort((a, b) => a.mastery - b.mastery)[0];
  if (weakestSubject) recommended.push(`${weakestSubject.name} is the weakest subject (avg mastery ${weakestSubject.mastery}). Consider setting it as a focus goal.`);
  const due = Object.values(states).filter((s) => s.attempts > 0 && s.nextReview <= now).length;
  if (due > 5) recommended.push(`${due} concepts are due for review — today's missions will prioritise them.`);
  if (!recommended.length) recommended.push('Great balance this week. Keep the streak going!');

  return {
    weekly,
    weeklyMinutes,
    avgDailyMinutes: activeDays ? Math.round(weeklyMinutes / 7) : 0,
    streakDays: studyStreak(sessions, now),
    masteredCount: Object.values(states).filter(isMastered).length,
    totalConcepts: concepts.length,
    subjectProgress,
    heatmap,
    struggles,
    strengths,
    recommended,
    ielts: eng.practised ? { band: ieltsBand(eng.mastery), cefr: cefrLevel(eng.mastery) } : null,
    accuracy7d: recent.length ? recent.filter((a) => a.correct).length / recent.length : null,
    questions7d: recent.length,
  };
}
