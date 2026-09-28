import type { ConceptDef, ConceptState, Goal, Mission, MissionBlock, SubjectId } from '@atlas/shared';
import { DAY_MS, dayKey, hashString, rng } from '@atlas/shared';
import { allConcepts, getConcept } from '@atlas/knowledge';
import { newConceptState } from './mastery';

/**
 * Daily Adaptive Engine (PRD §4.5).
 * Inputs: mastery, previous mistakes, spacing interval, parent goals.
 * Output: today's mission — a few timed blocks and a closing boss battle.
 */

export interface PlanInput {
  states: Record<string, ConceptState>;
  goals: Goal[];
  now?: number;
  /** Concepts to consider (defaults to the full graph). */
  concepts?: ConceptDef[];
}

export interface ScoredConcept {
  concept: ConceptDef;
  state: ConceptState;
  score: number;
  reasons: string[];
  due: boolean;
}

export interface DailyPlan {
  date: string;
  minutes: number;
  blocks: MissionBlock[];
  missions: Mission[];
  ranked: ScoredConcept[];
}

export const DEFAULT_DAILY_MINUTES = 25;

export function dailyMinutes(goals: Goal[]): number {
  const g = goals.find((x) => x.active && x.kind === 'dailyMinutes');
  const n = g ? Number(g.value) : NaN;
  return Number.isFinite(n) && n >= 10 ? Math.min(90, n) : DEFAULT_DAILY_MINUTES;
}

export function scoreConcepts({ states, goals, now = Date.now(), concepts = allConcepts() }: PlanInput): ScoredConcept[] {
  const focusSubjects = new Set(goals.filter((g) => g.active && g.kind === 'focusSubject').map((g) => g.value));
  const focusConcepts = new Set(goals.filter((g) => g.active && g.kind === 'focusConcept').map((g) => g.value));
  const ielts = goals.some((g) => g.active && g.kind === 'ieltsTarget');

  return concepts
    .map((concept) => {
      const state = states[concept.id] ?? newConceptState(concept.id, 30, now);
      const reasons: string[] = [];
      let score = 0;
      const due = state.nextReview <= now;
      if (due && state.attempts > 0) {
        const overdueDays = (now - state.nextReview) / DAY_MS;
        score += 1 + Math.min(1.5, overdueDays * 0.2);
        reasons.push('due for review');
      }
      const weakness = (100 - state.mastery) / 100;
      score += weakness * 1.2;
      if (state.mastery < 50) reasons.push('weak area');
      if (state.lastWrongAt && now - state.lastWrongAt < 3 * DAY_MS) {
        score += 0.6;
        reasons.push('recent mistakes');
      }
      if (focusConcepts.has(concept.id)) {
        score += 1.5;
        reasons.push('parent focus');
      } else if (focusSubjects.has(concept.subject)) {
        score += 0.7;
        reasons.push('parent focus subject');
      }
      if (ielts && concept.examRefs?.some((r) => r.startsWith('IELTS'))) score += 0.3;
      if (state.attempts === 0) score += 0.2;
      // Readiness: hold back concepts whose prerequisites are still shaky.
      const prereqWeak = (concept.prerequisites ?? []).some((p) => (states[p]?.mastery ?? 30) < 35);
      if (prereqWeak) score -= 0.8;
      // Nothing to gain from drilling a solid, not-yet-due concept.
      if (state.mastery >= 85 && !due) score -= 1;
      // Seen in the last few hours → let it rest.
      if (state.lastSeen && now - state.lastSeen < 4 * 3_600_000) score -= 0.6;
      return { concept, state, score, reasons, due };
    })
    .sort((a, b) => b.score - a.score);
}

const BLOCK_WEIGHTS = [0.32, 0.28, 0.2];
const BOSS_WEIGHT = 0.2;

function pickDiverse(ranked: ScoredConcept[], count: number): ScoredConcept[][] {
  const blocks: ScoredConcept[][] = [];
  const usedDomains = new Set<string>();
  const usedSubjects = new Map<SubjectId, number>();
  for (const top of ranked) {
    if (blocks.length >= count) break;
    const domainKey = `${top.concept.subject}/${top.concept.domain}`;
    if (usedDomains.has(domainKey)) continue;
    // Keep variety: at most two blocks from one subject.
    if ((usedSubjects.get(top.concept.subject) ?? 0) >= 2) continue;
    usedDomains.add(domainKey);
    usedSubjects.set(top.concept.subject, (usedSubjects.get(top.concept.subject) ?? 0) + 1);
    // Pair it with the next-best concept of the same domain for interleaving.
    const partner = ranked.find((r) => r !== top && r.concept.domain === top.concept.domain && r.concept.subject === top.concept.subject && r.score > 0);
    blocks.push(partner ? [top, partner] : [top]);
  }
  return blocks;
}

export function planDay(input: PlanInput): DailyPlan {
  const now = input.now ?? Date.now();
  const minutes = dailyMinutes(input.goals);
  const ranked = scoreConcepts({ ...input, now });
  const groups = pickDiverse(ranked, BLOCK_WEIGHTS.length);
  const date = dayKey(now);

  const blocks: MissionBlock[] = groups.map((g, i) => {
    const c = g[0].concept;
    const m = Math.max(3, Math.round(minutes * BLOCK_WEIGHTS[i]));
    return {
      conceptIds: g.map((x) => x.concept.id),
      minutes: m,
      label: c.domain === 'Family decks' ? c.name : c.domain,
      kind: g[0].due && g[0].state.attempts > 0 ? 'review' : 'learn',
      subject: c.subject,
    };
  });
  const bossConcepts = [...new Set(groups.flat().map((x) => x.concept.id))].slice(0, 4);
  const used = blocks.reduce((s, b) => s + b.minutes, 0);
  blocks.push({
    conceptIds: bossConcepts,
    minutes: Math.max(3, minutes - used || Math.round(minutes * BOSS_WEIGHT)),
    label: 'Boss Battle',
    kind: 'boss',
    subject: 'mixed',
  });

  const r = rng(hashString(date));
  const missions: Mission[] = blocks.map((b, i) => {
    const first = getConcept(b.conceptIds[0]);
    return {
      id: `${date}-${i}`,
      concepts: b.conceptIds,
      duration: b.minutes,
      kind: b.kind,
      title: b.kind === 'boss' ? BOSS_NAMES[Math.floor(r() * BOSS_NAMES.length)] : first?.missionName ?? b.label,
      reward: missionReward(b.minutes, b.kind),
    };
  });
  return { date, minutes, blocks, missions, ranked };
}

const BOSS_NAMES = ['The Gloom Titan', 'Queen of Riddles', 'The Iron Golem', 'Shadow Dragon', 'The Forgetful Sphinx'];

export function missionReward(minutes: number, kind: Mission['kind']) {
  return { coins: minutes * 10 + (kind === 'boss' ? 50 : 0), gems: kind === 'boss' ? 2 : 0, xp: minutes * 20 };
}

/** A focused mission for a single concept (when the kid chooses a node on a world map). */
export function conceptMission(conceptId: string, minutes = 5): Mission {
  const c = getConcept(conceptId);
  return {
    id: `free-${conceptId}-${Date.now()}`,
    concepts: [conceptId],
    duration: minutes,
    kind: 'learn',
    title: c?.missionName ?? conceptId,
    reward: missionReward(minutes, 'learn'),
  };
}
