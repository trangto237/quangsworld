import type { ConceptDef, Question, SubjectId } from '@atlas/shared';
import type { ConceptSeed } from './helpers';
import { englishConcepts } from './english/concepts';
import { englishQuestions } from './english/questions';
import { mathConcepts } from './math/concepts';
import { generators as mathGenerators, sanitize, type Generator, type Generated } from './math/generators';
import { logicConcepts, logicQuestions, logicGenerators } from './logic';
import { englishGenerators } from './english/generators';
import { pronunciationConcepts, pronunciationGenerators } from './english/pronunciation';
import { examSkillConcepts, examSkillQuestions } from './english/exam-skills';
import { passageConcepts, passageQuestions } from './english/passages';
import { literatureConcepts, literatureQuestions } from './literature';

const withSubject = (subject: SubjectId, seeds: ConceptSeed[]): ConceptDef[] => seeds.map((c) => ({ ...c, subject }));

export const concepts: ConceptDef[] = [
  ...withSubject('english', englishConcepts),
  ...withSubject('english', pronunciationConcepts),
  ...withSubject('english', examSkillConcepts),
  ...withSubject('english', passageConcepts),
  ...withSubject('math', mathConcepts),
  ...withSubject('logic', logicConcepts),
  ...withSubject('literature', literatureConcepts),
];

export const questions: Question[] = [...englishQuestions, ...examSkillQuestions, ...passageQuestions, ...logicQuestions, ...literatureQuestions];

const sanitizeAll = (g: Record<string, Generator>): Record<string, Generator> =>
  Object.fromEntries(Object.entries(g).map(([id, gen]) => [id, (d: number, r: () => number) => sanitize(gen(d, r))]));

export const generators: Record<string, Generator> = { ...mathGenerators, ...sanitizeAll({ ...logicGenerators, ...englishGenerators, ...pronunciationGenerators }) };

export type { Generator, Generated };

export { translatePrompt, translateExplanation, LESSONS_VI } from './vi';
export { lookup as glossaryLookup, GLOSSARY, type Gloss } from './english/glossary-vi';
export { stressOf, unmark, STRESS, SOUND_GROUPS, ED, S } from './english/pronunciation';
export { PASSAGE_SETS } from './english/passages';
