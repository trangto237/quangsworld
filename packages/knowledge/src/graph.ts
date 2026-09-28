import { concepts as builtinConcepts, questions as builtinQuestions, generators } from '@atlas/content';
import type { ConceptDef, PlacementSection, Question, SubjectId } from '@atlas/shared';
import { hashString, rng, shuffle } from '@atlas/shared';

export interface SubjectMeta {
  id: SubjectId;
  name: string;
  emoji: string;
  color: string;
}

export const SUBJECTS: SubjectMeta[] = [
  { id: 'english', name: 'English', emoji: '🗣️', color: '#6366f1' },
  { id: 'math', name: 'Mathematics', emoji: '📐', color: '#10b981' },
  { id: 'logic', name: 'Logic', emoji: '♞', color: '#f59e0b' },
  { id: 'literature', name: 'Literature', emoji: '📜', color: '#ec4899' },
];

export interface World {
  id: string;
  name: string;
  emoji: string;
  color: string;
  subject: SubjectId;
  domains: string[];
  blurb: string;
}

/** Kid-facing worlds. The child explores worlds; the parent sees subjects/domains. */
export const WORLDS: World[] = [
  { id: 'word-forest', name: 'Word Forest', emoji: '🌲', color: '#16a34a', subject: 'english', domains: ['Vocabulary'], blurb: 'Hunt rare words among the ancient trees.' },
  { id: 'grammar-forge', name: 'Grammar Forge', emoji: '⚒️', color: '#ea580c', subject: 'english', domains: ['Grammar'], blurb: 'Hammer sentences into shape.' },
  { id: 'echo-caves', name: 'Echo Caves', emoji: '🦇', color: '#7c3aed', subject: 'english', domains: ['Listening'], blurb: 'Listen closely — the caves whisper answers.' },
  { id: 'reading-ruins', name: 'Reading Ruins', emoji: '🏛️', color: '#0891b2', subject: 'english', domains: ['Reading'], blurb: 'Decode the tablets of a lost civilisation.' },
  { id: 'number-citadel', name: 'Number Citadel', emoji: '🏰', color: '#059669', subject: 'math', domains: ['Number', 'Statistics', 'Combinatorics'], blurb: 'Defend the walls with the power of numbers.' },
  { id: 'algebra-peaks', name: 'Algebra Peaks', emoji: '⛰️', color: '#2563eb', subject: 'math', domains: ['Algebra', 'Mathematical Reasoning'], blurb: 'Climb by balancing the unknown.' },
  { id: 'geometry-isles', name: 'Geometry Isles', emoji: '🔺', color: '#0d9488', subject: 'math', domains: ['Geometry'], blurb: 'Chart islands of angles and shapes.' },
  { id: 'logic-labyrinth', name: 'Logic Labyrinth', emoji: '♞', color: '#d97706', subject: 'logic', domains: ['Pattern recognition', 'Deduction', 'Spatial reasoning', 'Chess puzzles', 'Sequence'], blurb: 'A maze only the sharpest minds escape.' },
  { id: 'story-library', name: 'Story Library', emoji: '📜', color: '#db2777', subject: 'literature', domains: ['Đọc hiểu', 'Từ ngữ', 'Nghị luận', 'Viết'], blurb: 'Every book hides a guardian.' },
];

export const PLACEMENT_SECTIONS: PlacementSection[] = [
  {
    id: 'word-hunter',
    title: 'Word Hunter',
    skill: 'Vocabulary',
    subject: 'english',
    questionCount: 25,
    concepts: ['en.vocab.everyday', 'en.vocab.synonyms', 'en.vocab.academic', 'en.vocab.collocations', 'en.vocab.word-forms'],
    blurb: 'Track down the right word before it escapes.',
  },
  {
    id: 'sentence-forge',
    title: 'Sentence Forge',
    skill: 'Grammar',
    subject: 'english',
    questionCount: 20,
    concepts: ['en.grammar.tenses', 'en.grammar.passive', 'en.grammar.relative', 'en.grammar.conditionals', 'en.grammar.modals', 'en.grammar.comparatives'],
    blurb: 'Forge sentences strong enough to hold the gate.',
  },
  {
    id: 'echo-cave',
    title: 'Echo Cave',
    skill: 'Listening',
    subject: 'english',
    questionCount: 15,
    concepts: ['en.listening.numbers', 'en.listening.details', 'en.listening.main-idea'],
    blurb: 'Listen to the echoes. You can replay each one.',
  },
  {
    id: 'reading-puzzle',
    title: 'Reading Puzzle',
    skill: 'Reading & Paraphrase',
    subject: 'english',
    questionCount: 10,
    concepts: ['en.reading.main-idea', 'en.reading.paraphrase', 'en.reading.inference', 'en.reading.tfng'],
    blurb: 'Ancient tablets hold the clues.',
  },
  {
    id: 'math-logic',
    title: 'Math Logic',
    skill: 'Algebra + Logic',
    subject: 'math',
    questionCount: 20,
    concepts: [
      'math.number.integers', 'math.number.fractions', 'math.number.percent', 'math.number.powers',
      'math.algebra.expressions', 'math.algebra.linear', 'math.algebra.inequalities', 'math.algebra.quadratics',
      'math.geometry.angles', 'math.geometry.area', 'math.geometry.pythagoras',
      'logic.patterns', 'logic.deduction', 'logic.spatial', 'logic.sequence',
    ],
    blurb: 'Crack the citadel\'s number locks.',
  },
];

// ── Registry (built-in + family-imported content) ───────────────
const conceptMap = new Map<string, ConceptDef>();
const questionsByConcept = new Map<string, Question[]>();
const questionById = new Map<string, Question>();

function indexQuestion(q: Question) {
  questionById.set(q.id, q);
  const arr = questionsByConcept.get(q.conceptId) ?? [];
  arr.push(q);
  questionsByConcept.set(q.conceptId, arr);
}

builtinConcepts.forEach((c) => conceptMap.set(c.id, c));
builtinQuestions.forEach(indexQuestion);

/** Adds concepts/questions imported by the parent (e.g. CSV flashcards). Idempotent by id. */
export function registerCustomContent(cs: ConceptDef[], qs: Question[]) {
  for (const c of cs) conceptMap.set(c.id, c);
  for (const q of qs) {
    if (questionById.has(q.id)) continue;
    indexQuestion(q);
  }
}

/** Removes an imported concept and its questions (e.g. when a parent deletes a material). */
export function unregisterConcept(conceptId: string) {
  if (!conceptId.startsWith('custom.')) return;
  conceptMap.delete(conceptId);
  for (const q of questionsByConcept.get(conceptId) ?? []) questionById.delete(q.id);
  questionsByConcept.delete(conceptId);
}

export const allConcepts = (): ConceptDef[] => [...conceptMap.values()];
export const getConcept = (id: string): ConceptDef | undefined => conceptMap.get(id);
export const conceptsBySubject = (s: SubjectId) => allConcepts().filter((c) => c.subject === s);
export const conceptsInWorld = (w: World) => allConcepts().filter((c) => c.subject === w.subject && w.domains.includes(c.domain));
export const worldOfConcept = (id: string): World | undefined => {
  const c = getConcept(id);
  return c && WORLDS.find((w) => w.subject === c.subject && w.domains.includes(c.domain));
};
export const subjectMeta = (s: SubjectId) => SUBJECTS.find((x) => x.id === s)!;
export const staticQuestions = (conceptId: string): Question[] => questionsByConcept.get(conceptId) ?? [];
export const hasGenerator = (conceptId: string) => conceptId in generators;

export interface ConceptTree {
  subject: SubjectMeta;
  domains: { name: string; skills: { name: string; concepts: ConceptDef[] }[] }[];
}

/** Subject → Domain → Skill → Concept hierarchy (PRD §4.2). */
export function knowledgeTree(): ConceptTree[] {
  return SUBJECTS.map((subject) => {
    const domains = new Map<string, Map<string, ConceptDef[]>>();
    for (const c of conceptsBySubject(subject.id)) {
      const skills = domains.get(c.domain) ?? new Map();
      skills.set(c.skill, [...(skills.get(c.skill) ?? []), c]);
      domains.set(c.domain, skills);
    }
    return {
      subject,
      domains: [...domains].map(([name, skills]) => ({ name, skills: [...skills].map(([n, cs]) => ({ name: n, concepts: cs })) })),
    };
  });
}

// ── Questions ───────────────────────────────────────────────────
function generate(conceptId: string, difficulty: number, seed: number): Question {
  const g = generators[conceptId](difficulty, rng(seed));
  const options = [g.answer, ...[...new Set(g.distractors)].filter((d) => d !== g.answer)].slice(0, 4);
  return {
    id: `gen:${conceptId}:${difficulty}:${seed}`,
    conceptId,
    difficulty,
    type: 'fill',
    prompt: g.prompt,
    options,
    answer: 0,
    explanation: g.explanation,
    source: 'Atlas generator',
  };
}

export function getQuestion(id: string): Question | undefined {
  if (id.startsWith('gen:')) {
    const [, conceptId, d, seed] = id.split(':');
    if (!hasGenerator(conceptId)) return undefined;
    return generate(conceptId, Number(d), Number(seed));
  }
  return questionById.get(id);
}

export interface PickOptions {
  conceptId: string;
  difficulty: number;
  exclude?: Set<string>;
  rand?: () => number;
}

/**
 * Picks the unseen question closest to the target difficulty. Concepts with a
 * generator mix authored and generated items and never run dry.
 */
export function pickQuestion({ conceptId, difficulty, exclude = new Set(), rand = Math.random }: PickOptions): Question | undefined {
  const target = Math.min(5, Math.max(1, Math.round(difficulty)));
  const pool = staticQuestions(conceptId).filter((q) => !exclude.has(q.id));
  const gen = hasGenerator(conceptId);
  if (pool.length && (!gen || rand() < 0.4)) {
    const best = Math.min(...pool.map((q) => Math.abs(q.difficulty - target)));
    const candidates = pool.filter((q) => Math.abs(q.difficulty - target) === best);
    return candidates[Math.floor(rand() * candidates.length)];
  }
  if (gen) {
    for (let i = 0; i < 20; i++) {
      const q = generate(conceptId, target, Math.floor(rand() * 1e9));
      if (!exclude.has(q.id) && q.options.length >= 2) return q;
    }
  }
  return undefined;
}

export interface PresentedQuestion extends Question {
  /** Shuffled options; `correct` is the index into this array. */
  shown: string[];
  correct: number;
}

/** Shuffle options (except T/F/NG which keep canonical order). */
export function present(q: Question, seed = hashString(q.id + Date.now())): PresentedQuestion {
  const correctText = q.options[q.answer];
  const canonical = q.options.length === 3 && q.options.includes('Not Given');
  const shown = canonical ? ['True', 'False', 'Not Given'] : shuffle(q.options, rng(seed));
  return { ...q, shown, correct: shown.indexOf(correctText) };
}
