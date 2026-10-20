import type { Repo } from '@atlas/db';
import { levelFromXp, stars, studyStreak } from '@atlas/engine';
import { conceptsInWorld, visibleWorlds } from '@atlas/knowledge';
import { DAY_MS } from '@atlas/shared';

/** Achievements shown on the hero sheet. All worked out from what the hero has already done. */
export interface Badge {
  id: string;
  icon: string;
  name: string;
  how: string;
  earned: boolean;
  /** Progress toward it, e.g. 3 of 7. */
  progress?: [number, number];
}

export function badgesFor(repo: Repo, studentId: string): Badge[] {
  const sessions = repo.listSessions(studentId, Date.now() - 90 * DAY_MS);
  const streak = studyStreak(sessions);
  const attempts = repo.listAttempts(studentId).filter((a) => a.context !== 'placement');
  const states = repo.getStates(studentId);
  const threeStar = Object.values(states).filter((s) => s.attempts > 0 && stars(s) === 3).length;
  const fixed = repo.listMistakes(studentId).filter((m) => m.resolvedAt).length;
  const exams = repo.listExamResults(studentId).length;
  const level = levelFromXp(repo.getWallet(studentId).xp).level;
  const played = new Set(attempts.map((a) => a.conceptId));
  const worldsVisited = visibleWorlds().filter((w) => conceptsInWorld(w).some((c) => played.has(c.id))).length;
  // Needs real practice, not just the starting estimate from the trial.
  const stressPractice = attempts.filter((a) => a.conceptId === 'en.pron.stress').length;
  const stress = stressPractice >= 10 ? (states['en.pron.stress']?.mastery ?? 0) : 0;
  const b = (id: string, icon: string, name: string, how: string, have: number, need: number): Badge => ({
    id,
    icon,
    name,
    how,
    earned: have >= need,
    progress: [Math.min(have, need), need],
  });
  return [
    b('first-quest', '🎯', 'First Quest', 'Answer your first quest question.', attempts.length, 1),
    b('streak-3', '🔥', 'On Fire', 'Play 3 days in a row.', streak, 3),
    b('streak-7', '☄️', 'Unstoppable', 'Play 7 days in a row.', streak, 7),
    b('answers-500', '⚔️', 'Veteran', 'Answer 500 questions.', attempts.length, 500),
    b('three-star', '⭐', 'Star Collector', 'Get 3 stars in 10 topics.', threeStar, 10),
    b('explorer', '🗺️', 'Explorer', 'Play in 6 different worlds.', worldsVisited, 6),
    b('stress', '🥁', 'Stress Master', 'Practise word stress and reach 80 mastery.', Math.round(stress), 80),
    b('fixer', '📕', 'Mistake Fixer', 'Fix 20 mistakes in the Mistake Book.', fixed, 20),
    b('exam', '🏛️', 'Exam Ready', 'Finish 3 practice exams.', exams, 3),
    b('level-5', '👑', 'Ranger', 'Reach level 5.', level, 5),
  ];
}
