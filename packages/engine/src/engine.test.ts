import { describe, expect, it } from 'vitest';
import type { Attempt, ConceptState, Goal, StudySession } from '@atlas/shared';
import { DAY_MS, rng } from '@atlas/shared';
import { getConcept } from '@atlas/knowledge';
import {
  answeredCount, createPlacement, isPlacementDone, nextPlacementQuestion, recordPlacementAnswer, scorePlacement, totalQuestions,
} from './placement';
import { applyAnswer, newConceptState, scheduleReview } from './mastery';
import { planDay, scoreConcepts } from './planner';
import { MissionSession, historyFromAttempts } from './session';
import { computeInsights, ieltsBand, studyStreak } from './insights';
import { battleReward, levelFromXp } from './rewards';

function runPlacement(answerFn: (difficulty: number, conceptId: string) => boolean, seed = 1) {
  const r = rng(seed);
  let s = createPlacement(0);
  const difficulties: number[][] = s.sections.map(() => []);
  let guard = 0;
  while (!isPlacementDone(s) && guard++ < 500) {
    const q = nextPlacementQuestion(s, r)!;
    expect(q).toBeDefined();
    difficulties[s.sectionIndex].push(q.difficulty);
    s = recordPlacementAnswer(s, { questionId: q.id, conceptId: q.conceptId, difficulty: q.difficulty, correct: answerFn(q.difficulty, q.conceptId), msSpent: 5000 });
  }
  return { s, difficulties };
}

describe('placement test', () => {
  it('asks exactly the PRD number of questions (90) without repeats', () => {
    const { s } = runPlacement(() => true);
    expect(answeredCount(s)).toBe(totalQuestions());
    expect(totalQuestions()).toBe(90);
    for (const sec of s.sections) expect(new Set(sec.answers.map((a) => a.questionId)).size).toBe(sec.answers.length);
  });

  it('starts at medium difficulty and adapts up/down', () => {
    let s = createPlacement(0);
    expect(s.sections[0].difficulty).toBe(3);
    const ans = (correct: boolean) => ({ questionId: String(Math.random()), conceptId: 'en.vocab.everyday', difficulty: 3, correct, msSpent: 1 });
    s = recordPlacementAnswer(s, ans(true));
    expect(s.sections[0].difficulty).toBe(4);
    s = recordPlacementAnswer(s, ans(false));
    expect(s.sections[0].difficulty).toBe(4); // one mistake is not enough
    s = recordPlacementAnswer(s, ans(false));
    expect(s.sections[0].difficulty).toBe(3); // repeated mistakes → easier
  });

  it('a strong student scores high, a weak one low, a mixed one in between', () => {
    const strong = scorePlacement(runPlacement(() => true).s);
    const weak = scorePlacement(runPlacement(() => false).s);
    const mid = scorePlacement(runPlacement((d) => d <= 3).s);
    expect(strong.english.vocabulary).toBeGreaterThan(75);
    expect(weak.english.vocabulary).toBeLessThan(25);
    expect(mid.english.grammar).toBeGreaterThan(weak.english.grammar);
    expect(mid.english.grammar).toBeLessThan(strong.english.grammar);
    for (const v of Object.values(strong.concepts)) expect(v).toBeGreaterThanOrEqual(0);
  });

  it('matches the student profile: strong at math, weak at English', () => {
    const scores = scorePlacement(runPlacement((d, cid) => (cid.startsWith('math') || cid.startsWith('logic') ? d <= 5 : d <= 2)).s);
    expect(scores.math.algebra).toBeGreaterThan(scores.english.grammar);
    expect(scores.math.number).toBeGreaterThan(60);
  });

  it('state survives JSON round-trip (autosave/resume)', () => {
    let s = createPlacement(0);
    const q = nextPlacementQuestion(s, rng(3))!;
    s = recordPlacementAnswer(s, { questionId: q.id, conceptId: q.conceptId, difficulty: q.difficulty, correct: true, msSpent: 1 });
    expect(JSON.parse(JSON.stringify(s))).toEqual(s);
  });
});

describe('mastery engine', () => {
  it('moves mastery with answers and gains confidence', () => {
    let s = newConceptState('en.grammar.passive', 40, 0);
    const before = s.mastery;
    s = applyAnswer(s, { correct: true, difficulty: 3, now: 1 });
    expect(s.mastery).toBeGreaterThan(before);
    expect(s.confidence).toBeGreaterThan(0.1);
    const up = s.mastery;
    s = applyAnswer(s, { correct: false, difficulty: 2, now: 2 });
    expect(s.mastery).toBeLessThan(up);
    expect(s.lastWrongAt).toBe(2);
    expect(s.attempts).toBe(2);
  });

  it('spaced repetition grows intervals on success and resets on failure', () => {
    let s = newConceptState('x', 50, 0);
    s = scheduleReview(s, 1, 0);
    expect(s.intervalDays).toBe(1);
    s = scheduleReview(s, 1, 0);
    expect(s.intervalDays).toBe(3);
    s = scheduleReview(s, 1, 0);
    expect(s.intervalDays).toBeGreaterThan(5);
    s = scheduleReview(s, 0.2, 0);
    expect(s.intervalDays).toBe(0);
    expect(s.nextReview).toBeLessThan(DAY_MS);
  });
});

const states = (entries: [string, Partial<ConceptState>][], now: number) =>
  Object.fromEntries(entries.map(([id, p]) => [id, { ...newConceptState(id, 50, now), ...p }])) as Record<string, ConceptState>;

describe('daily adaptive engine', () => {
  const now = new Date('2026-09-28T08:00:00').getTime();

  it('produces a plan filling the daily minutes and ending with a boss', () => {
    const plan = planDay({ states: {}, goals: [], now });
    expect(plan.minutes).toBe(25);
    expect(plan.blocks.reduce((s, b) => s + b.minutes, 0)).toBe(25);
    expect(plan.blocks.at(-1)!.kind).toBe('boss');
    expect(plan.blocks).toHaveLength(4);
    expect(plan.missions.every((m) => m.reward.coins > 0)).toBe(true);
    // Blocks come from different domains.
    const labels = plan.blocks.slice(0, 3).map((b) => b.label);
    expect(new Set(labels).size).toBe(3);
  });

  it('prioritises overdue reviews and recent mistakes', () => {
    const s = states([
      ['en.grammar.passive', { mastery: 45, attempts: 10, nextReview: now - 3 * DAY_MS, lastWrongAt: now - DAY_MS }],
      ['math.algebra.linear', { mastery: 90, attempts: 10, confidence: 0.8, nextReview: now + 5 * DAY_MS }],
    ], now);
    const ranked = scoreConcepts({ states: s, goals: [], now });
    const passive = ranked.findIndex((r) => r.concept.id === 'en.grammar.passive');
    const linear = ranked.findIndex((r) => r.concept.id === 'math.algebra.linear');
    expect(passive).toBeLessThan(linear);
    expect(ranked[passive].reasons).toContain('due for review');
    expect(ranked[passive].reasons).toContain('recent mistakes');
  });

  it('respects parent goals', () => {
    const goals: Goal[] = [
      { id: 'g1', studentId: 's', kind: 'dailyMinutes', value: '40', active: true, createdAt: 0 },
      { id: 'g2', studentId: 's', kind: 'focusConcept', value: 'lit.devices', active: true, createdAt: 0 },
    ];
    const plan = planDay({ states: {}, goals, now });
    expect(plan.minutes).toBe(40);
    expect(plan.blocks.reduce((s, b) => s + b.minutes, 0)).toBe(40);
    expect(plan.blocks[0].conceptIds).toContain('lit.devices');
  });
});

describe('mission session', () => {
  it('interleaves concepts, re-queues mistakes and schedules reviews', () => {
    const mission = { id: 'm', concepts: ['en.grammar.passive', 'en.grammar.modals'], duration: 5, kind: 'learn' as const, title: 't', reward: { coins: 50, gems: 0, xp: 100 } };
    const sess = new MissionSession(mission, {}, rng(4));
    const q1 = sess.next()!;
    const q2 = sess.next()!;
    expect(q1.conceptId).not.toBe(q2.conceptId);
    sess.answer(q1, false, 1000);
    const q3 = sess.next()!;
    expect(q3.conceptId).toBe(q1.conceptId);
    sess.answer(q2, true, 1000);
    sess.answer(q3, true, 1000);
    const out = sess.finish(0);
    expect(Object.keys(out).sort()).toEqual([...mission.concepts].sort());
    expect(sess.accuracy).toBeCloseTo(2 / 3);
    const seen = new Set<string>();
    for (let i = 0; i < 30; i++) {
      const q = sess.next()!;
      expect(q).toBeDefined();
      seen.add(q.id);
    }
    expect(seen.size).toBeGreaterThan(8);
  });
});

describe('insights', () => {
  const now = new Date('2026-09-28T20:00:00').getTime();
  const session = (daysAgo: number, minutes: number): StudySession => ({
    id: String(daysAgo), studentId: 's', kind: 'mission', startedAt: now - daysAgo * DAY_MS, endedAt: now - daysAgo * DAY_MS + minutes * 60000, activeMs: minutes * 60000, missionTitle: '',
  });

  it('computes streaks', () => {
    expect(studyStreak([session(0, 10), session(1, 10), session(2, 10), session(4, 10)], now)).toBe(3);
    expect(studyStreak([session(1, 10), session(2, 10)], now)).toBe(2);
    expect(studyStreak([session(3, 10)], now)).toBe(0);
  });

  it('reports weekly time, struggles and strengths', () => {
    const attempts: Attempt[] = [];
    for (let i = 0; i < 6; i++) attempts.push({ id: `a${i}`, studentId: 's', questionId: 'q', conceptId: 'en.grammar.passive', correct: i === 0, difficulty: 2, msSpent: 1, context: 'mission', createdAt: now - DAY_MS });
    const s = states([
      ['en.grammar.passive', { mastery: 35, attempts: 6 }],
      ['math.algebra.linear', { mastery: 88, attempts: 12, confidence: 0.7 }],
    ], now);
    const ins = computeInsights({ states: s, attempts, sessions: [session(0, 20), session(1, 25)], now });
    expect(ins.weeklyMinutes).toBe(45);
    expect(ins.weekly).toHaveLength(7);
    expect(ins.struggles[0].conceptId).toBe('en.grammar.passive');
    expect(ins.strengths[0].conceptId).toBe('math.algebra.linear');
    expect(ins.streakDays).toBe(2);
    expect(ins.recommended[0]).toContain(getConcept('en.grammar.passive')!.name);
    expect(ins.accuracy7d).toBeCloseTo(1 / 6);
  });

  it('maps English mastery to IELTS bands', () => {
    expect(ieltsBand(0)).toBe(4);
    expect(ieltsBand(100)).toBe(8);
    expect(ieltsBand(62)).toBe(6.5);
  });
});

describe('rewards', () => {
  it('levels up gradually', () => {
    expect(levelFromXp(0).level).toBe(1);
    expect(levelFromXp(200).level).toBe(2);
    expect(levelFromXp(499).level).toBe(2);
    expect(levelFromXp(500).level).toBe(3);
  });

  it('rewards effort, accuracy and victory', () => {
    const m = { id: 'm', concepts: [], duration: 5, kind: 'learn' as const, title: '', reward: { coins: 50, gems: 0, xp: 100 } };
    const lose = battleReward(m, { victory: false, accuracy: 0.5, answered: 10, bestStreak: 2 });
    const win = battleReward(m, { victory: true, accuracy: 0.9, answered: 10, bestStreak: 6 });
    expect(win.coins).toBeGreaterThan(lose.coins);
    expect(lose.coins).toBeGreaterThan(0);
    expect(battleReward(m, { victory: false, accuracy: 0, answered: 0, bestStreak: 0 }).coins).toBe(0);
  });
});

describe('no repeated questions', () => {
  const mission = (concepts: string[]) => ({ id: 'm', concepts, duration: 8, kind: 'learn' as const, title: 't', reward: { coins: 0, gems: 0, xp: 0 } });
  const promptOf = (q: { prompt: string; audio?: string; passage?: string }) => `${q.prompt}|${q.audio ?? ''}|${q.passage ?? ''}`;

  it.each([
    'en.vocab.everyday', 'en.vocab.synonyms', 'en.vocab.academic', 'en.vocab.collocations', 'en.vocab.word-forms',
    'en.grammar.tenses', 'en.grammar.passive', 'en.grammar.relative', 'en.grammar.conditionals', 'en.grammar.comparatives',
    'en.listening.numbers', 'math.algebra.linear', 'logic.sequence',
  ])('%s: a long single-concept mission (30 questions) never repeats a question', (cid) => {
    const sess = new MissionSession(mission([cid]), {}, rng(11));
    const seen = new Set<string>();
    for (let i = 0; i < 30; i++) {
      const q = sess.next()!;
      expect(seen.has(promptOf(q)), `${cid} repeated: ${q.prompt}`).toBe(false);
      seen.add(promptOf(q));
      sess.answer(q, i % 3 !== 0, 1000);
    }
  });

  it('Village Market after the placement test: questions seen in placement are avoided', () => {
    // Everything authored for the concept was already seen in placement.
    const warm = new MissionSession(mission(['en.vocab.everyday']), {}, rng(2));
    const placementSeen: string[] = [];
    const attempts: { questionId: string; createdAt: number }[] = [];
    for (let i = 0; i < 10; i++) {
      const q = warm.next()!;
      attempts.push({ questionId: q.id, createdAt: Date.now() - DAY_MS });
      placementSeen.push(promptOf(q));
    }
    const history = historyFromAttempts(attempts);
    const sess = new MissionSession(mission(['en.vocab.everyday', 'en.vocab.synonyms']), {}, rng(5), history);
    for (let i = 0; i < 40; i++) expect(placementSeen).not.toContain(promptOf(sess.next()!));
  });
});
