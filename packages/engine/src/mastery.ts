import type { ConceptState } from '@atlas/shared';
import { DAY_MS, clamp } from '@atlas/shared';
import { pCorrect } from './irt';

/**
 * Mastery engine. Each concept keeps:
 *  - mastery (0–100): Elo-style estimate, updated after every answer
 *  - confidence (0–1): grows with evidence, shrinks when answers contradict the estimate
 *  - a spaced-repetition schedule (SM-2 variant), updated once per session per concept
 */

export const MASTERED = 80;

export function newConceptState(conceptId: string, seedMastery = 30, now = Date.now(), seeded = false): ConceptState {
  const mastery = clamp(Math.round(seedMastery), 0, 100);
  // Weak concepts are due immediately; strong ones can wait a little.
  const firstGap = mastery >= 75 ? 3 : mastery >= 55 ? 1 : 0;
  return {
    conceptId,
    mastery,
    confidence: seeded ? 0.3 : 0.1,
    attempts: 0,
    correct: 0,
    streak: 0,
    ease: 2.3,
    intervalDays: firstGap,
    nextReview: now + firstGap * DAY_MS,
    lastSeen: 0,
    lastWrongAt: 0,
  };
}

export interface AnswerEvent {
  correct: boolean;
  difficulty: number;
  msSpent?: number;
  now?: number;
}

export function applyAnswer(s: ConceptState, e: AnswerEvent): ConceptState {
  const now = e.now ?? Date.now();
  const expected = pCorrect(s.mastery, e.difficulty);
  const outcome = e.correct ? 1 : 0;
  // Learn fast while the estimate is uncertain, then settle.
  const k = Math.max(4, 16 * (1 - s.confidence * 0.7));
  const surprise = Math.abs(outcome - expected);
  const mastery = clamp(s.mastery + k * (outcome - expected), 0, 100);
  const confidence = clamp(s.confidence + 0.08 * (1 - s.confidence) - 0.05 * Math.max(0, surprise - 0.6), 0, 1);
  return {
    ...s,
    mastery: Math.round(mastery * 10) / 10,
    confidence: Math.round(confidence * 1000) / 1000,
    attempts: s.attempts + 1,
    correct: s.correct + outcome,
    streak: e.correct ? s.streak + 1 : 0,
    lastSeen: now,
    lastWrongAt: e.correct ? s.lastWrongAt : now,
  };
}

/**
 * Reschedule after a session. `accuracy` is the share of correct answers for
 * this concept in the session. Poor sessions bring the concept back tomorrow.
 */
export function scheduleReview(s: ConceptState, accuracy: number, now = Date.now()): ConceptState {
  let { ease, intervalDays } = s;
  if (accuracy >= 0.8) {
    intervalDays = intervalDays < 1 ? 1 : intervalDays < 3 ? 3 : Math.round(intervalDays * ease);
    ease = Math.min(2.8, ease + 0.08);
  } else if (accuracy >= 0.6) {
    intervalDays = Math.max(1, Math.round(intervalDays * 1.2));
  } else {
    intervalDays = accuracy >= 0.4 ? 1 : 0;
    ease = Math.max(1.3, ease - 0.2);
  }
  intervalDays = Math.min(intervalDays, 60);
  // "0 days" means later today (after a short break), not right now.
  const nextReview = intervalDays === 0 ? now + 2 * 3_600_000 : now + intervalDays * DAY_MS;
  return { ...s, ease: Math.round(ease * 100) / 100, intervalDays, nextReview };
}

export const isMastered = (s: ConceptState) => s.mastery >= MASTERED && s.confidence >= 0.4;
export const isDue = (s: ConceptState, now = Date.now()) => s.nextReview <= now;

/** Kid-facing star rating for a concept (0–3). */
export const stars = (s: ConceptState | undefined) => (!s ? 0 : s.mastery >= MASTERED ? 3 : s.mastery >= 60 ? 2 : s.mastery >= 40 ? 1 : 0);
