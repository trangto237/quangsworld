import type { PlacementScores, PlacementSection, Question } from '@atlas/shared';
import { clamp } from '@atlas/shared';
import { PLACEMENT_SECTIONS, getConcept, pickQuestion } from '@atlas/knowledge';
import { pCorrect } from './irt';

/**
 * Adaptive placement test (PRD §4.1).
 * - Every section starts at medium difficulty (3).
 * - A correct answer raises difficulty by one step.
 * - Two mistakes in a row lower it by one step.
 * - Ability is tracked with an Elo/1PL update and reported as a 0–100 mastery score.
 * The state is plain JSON so it can be autosaved and resumed mid-test.
 */

export interface PlacementAnswer {
  questionId: string;
  conceptId: string;
  difficulty: number;
  correct: boolean;
  msSpent: number;
}

export interface SectionState {
  id: PlacementSection['id'];
  difficulty: number;
  ability: number;
  wrongStreak: number;
  answers: PlacementAnswer[];
}

export interface PlacementState {
  version: 1;
  sectionIndex: number;
  sections: SectionState[];
  startedAt: number;
}

export const START_DIFFICULTY = 3;

export function createPlacement(now = Date.now(), sections = PLACEMENT_SECTIONS): PlacementState {
  return {
    version: 1,
    sectionIndex: 0,
    startedAt: now,
    sections: sections.map((s) => ({ id: s.id, difficulty: START_DIFFICULTY, ability: 50, wrongStreak: 0, answers: [] })),
  };
}

const sectionDef = (id: string) => PLACEMENT_SECTIONS.find((s) => s.id === id)!;

export const currentSection = (s: PlacementState) => (s.sectionIndex < s.sections.length ? sectionDef(s.sections[s.sectionIndex].id) : undefined);
export const isPlacementDone = (s: PlacementState) => s.sectionIndex >= s.sections.length;
export const totalQuestions = () => PLACEMENT_SECTIONS.reduce((n, s) => n + s.questionCount, 0);
export const answeredCount = (s: PlacementState) => s.sections.reduce((n, x) => n + x.answers.length, 0);

/** Next question: cycle through the section's concepts, least-asked first, at the current difficulty. */
export function nextPlacementQuestion(s: PlacementState, rand: () => number = Math.random): Question | undefined {
  const def = currentSection(s);
  if (!def) return undefined;
  const sec = s.sections[s.sectionIndex];
  const seen = new Set(sec.answers.map((a) => a.questionId));
  const counts = new Map(def.concepts.map((c) => [c, 0]));
  sec.answers.forEach((a) => counts.set(a.conceptId, (counts.get(a.conceptId) ?? 0) + 1));
  const order = [...def.concepts].sort((a, b) => counts.get(a)! - counts.get(b)! || rand() - 0.5);
  for (const conceptId of order) {
    const q = pickQuestion({ conceptId, difficulty: sec.difficulty, exclude: seen, rand });
    // Prefer items within one step of the target so the staircase stays meaningful.
    if (q && Math.abs(q.difficulty - sec.difficulty) <= 1) return q;
  }
  for (const conceptId of order) {
    const q = pickQuestion({ conceptId, difficulty: sec.difficulty, exclude: seen, rand });
    if (q) return q;
  }
  return undefined;
}

const kFactor = (n: number) => Math.max(6, 28 / (1 + 0.12 * n));

export function recordPlacementAnswer(s: PlacementState, answer: PlacementAnswer): PlacementState {
  const next: PlacementState = structuredClone(s);
  const sec = next.sections[next.sectionIndex];
  const expected = pCorrect(sec.ability, answer.difficulty);
  sec.ability = clamp(sec.ability + kFactor(sec.answers.length) * ((answer.correct ? 1 : 0) - expected), 0, 100);
  sec.answers.push(answer);
  if (answer.correct) {
    sec.wrongStreak = 0;
    sec.difficulty = Math.min(5, sec.difficulty + 1);
  } else {
    sec.wrongStreak++;
    if (sec.wrongStreak >= 2) {
      sec.difficulty = Math.max(1, sec.difficulty - 1);
      sec.wrongStreak = 0;
    }
  }
  if (sec.answers.length >= sectionDef(sec.id).questionCount) next.sectionIndex++;
  return next;
}

/** Ends the current section early (e.g. no more questions available). */
export function skipSection(s: PlacementState): PlacementState {
  return { ...structuredClone(s), sectionIndex: s.sectionIndex + 1 };
}

/** Per-concept estimate: replay that concept's answers starting from the section ability. */
function conceptEstimates(sec: SectionState): Record<string, number> {
  const out: Record<string, number> = {};
  const byConcept = new Map<string, PlacementAnswer[]>();
  sec.answers.forEach((a) => byConcept.set(a.conceptId, [...(byConcept.get(a.conceptId) ?? []), a]));
  for (const [cid, answers] of byConcept) {
    let theta = sec.ability;
    for (const a of answers) theta = clamp(theta + 14 * ((a.correct ? 1 : 0) - pCorrect(theta, a.difficulty)), 0, 100);
    out[cid] = Math.round(theta);
  }
  const def = sectionDef(sec.id);
  for (const cid of def.concepts) if (!(cid in out)) out[cid] = Math.round(sec.ability);
  return out;
}

export function scorePlacement(s: PlacementState): PlacementScores {
  const concepts: Record<string, number> = {};
  const ability: Record<string, number> = {};
  for (const sec of s.sections) {
    ability[sec.id] = Math.round(sec.ability);
    Object.assign(concepts, conceptEstimates(sec));
  }
  const domainAvg = (pred: (cid: string) => boolean, fallback: number) => {
    const vals = Object.entries(concepts).filter(([cid]) => pred(cid)).map(([, v]) => v);
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : fallback;
  };
  const mathAbility = ability['math-logic'] ?? 50;
  const domainOf = (cid: string) => getConcept(cid)?.domain;
  return {
    english: {
      vocabulary: ability['word-hunter'] ?? 50,
      grammar: ability['sentence-forge'] ?? 50,
      listening: ability['echo-cave'] ?? 50,
      reading: ability['reading-puzzle'] ?? 50,
    },
    math: {
      number: domainAvg((c) => domainOf(c) === 'Number', mathAbility),
      algebra: domainAvg((c) => domainOf(c) === 'Algebra', mathAbility),
      geometry: domainAvg((c) => domainOf(c) === 'Geometry', mathAbility),
      logic: domainAvg((c) => c.startsWith('logic.'), mathAbility),
    },
    concepts,
  };
}
