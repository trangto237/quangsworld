import type { ConceptState, Mission, Question } from '@atlas/shared';
import { getQuestion, pickQuestion, promptKey } from '@atlas/knowledge';
import { targetDifficulty } from './irt';
import { applyAnswer, newConceptState, scheduleReview } from './mastery';

/**
 * Drives a single mission: picks the next question (interleaving the mission's
 * concepts, pitched at each concept's current mastery, re-queuing missed
 * concepts), applies answers to mastery, and reschedules reviews at the end.
 */
export class MissionSession {
  readonly mission: Mission;
  states: Record<string, ConceptState>;
  private seen = new Set<string>();
  private perConcept = new Map<string, { n: number; correct: number }>();
  private retry: string[] = [];
  private turn = 0;
  answered = 0;
  correct = 0;
  bestStreak = 0;
  private streak = 0;

  /**
   * @param history when each question (id or prompt) was last answered, so a mission
   *   prefers questions the learner hasn't seen recently — including in the placement test.
   */
  constructor(
    mission: Mission,
    states: Record<string, ConceptState>,
    private rand: () => number = Math.random,
    private history: Map<string, number> = new Map(),
  ) {
    this.mission = mission;
    this.states = { ...states };
    for (const c of mission.concepts) this.states[c] ??= newConceptState(c);
  }

  next(): Question | undefined {
    const cs = this.mission.concepts;
    // A missed concept comes back two questions later (spacing within the session).
    let conceptId = this.retry.length && this.turn % 2 === 0 ? this.retry.shift()! : cs[this.turn % cs.length];
    this.turn++;
    for (let i = 0; i <= cs.length; i++) {
      const d = targetDifficulty(this.states[conceptId].mastery);
      const q = pickQuestion({ conceptId, difficulty: d, exclude: this.seen, history: this.history, rand: this.rand });
      if (q) return this.use(q);
      conceptId = cs[(cs.indexOf(conceptId) + 1) % cs.length];
    }
    // Everything in this session has been used: start a new cycle, oldest questions first.
    for (const [k] of this.seenAt) this.history.set(k, this.seenAt.get(k)!);
    this.seen.clear();
    const q = pickQuestion({ conceptId: cs[0], difficulty: targetDifficulty(this.states[cs[0]].mastery), history: this.history, rand: this.rand });
    return q && this.use(q);
  }

  private seenAt = new Map<string, number>();

  private use(q: Question): Question {
    const now = Date.now();
    for (const k of [q.id, promptKey(q)]) {
      this.seen.add(k);
      this.seenAt.set(k, now);
    }
    return q;
  }

  answer(q: Question, correct: boolean, msSpent: number, now = Date.now()): ConceptState {
    const s = applyAnswer(this.states[q.conceptId] ?? newConceptState(q.conceptId), { correct, difficulty: q.difficulty, msSpent, now });
    this.states[q.conceptId] = s;
    const pc = this.perConcept.get(q.conceptId) ?? { n: 0, correct: 0 };
    pc.n++;
    if (correct) pc.correct++;
    this.perConcept.set(q.conceptId, pc);
    this.answered++;
    if (correct) {
      this.correct++;
      this.streak++;
      this.bestStreak = Math.max(this.bestStreak, this.streak);
    } else {
      this.streak = 0;
      if (!this.retry.includes(q.conceptId)) this.retry.push(q.conceptId);
    }
    return s;
  }

  get accuracy() {
    return this.answered ? this.correct / this.answered : 0;
  }

  get currentStreak() {
    return this.streak;
  }

  /** Final states with spaced-repetition schedules updated from session accuracy. */
  finish(now = Date.now()): Record<string, ConceptState> {
    const out: Record<string, ConceptState> = {};
    for (const [cid, pc] of this.perConcept) out[cid] = scheduleReview(this.states[cid], pc.correct / pc.n, now);
    return out;
  }
}

/**
 * When each question was last answered, keyed by id and by wording (generated questions get a
 * new id each time, so the wording is what identifies a repeat).
 */
export function historyFromAttempts(attempts: { questionId: string; createdAt: number }[]): Map<string, number> {
  const h = new Map<string, number>();
  for (const a of attempts) {
    h.set(a.questionId, Math.max(h.get(a.questionId) ?? 0, a.createdAt));
    const q = getQuestion(a.questionId);
    if (q) h.set(promptKey(q), Math.max(h.get(promptKey(q)) ?? 0, a.createdAt));
  }
  return h;
}
