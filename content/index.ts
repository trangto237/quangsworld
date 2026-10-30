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
import { wordOrderConcepts, wordOrderQuestions } from './english/word-order';
import { ieltsTopicConcepts, ieltsTopicQuestions } from './english/ielts-topics';
import { literatureConcepts, literatureQuestions } from './literature';
import { englishGrade9Bank } from './english/grade9-bank';
import { logicGrade9Bank } from './logic/grade9-bank';
import { literatureGrade9Bank } from './literature/grade9-bank';
import { olympiadQuestions } from './math/olympiad';
import { ieltsReadingConcepts, ieltsReadingQuestions } from './english/ielts-reading';

const withSubject = (subject: SubjectId, seeds: ConceptSeed[]): ConceptDef[] => seeds.map((c) => ({ ...c, subject }));

export const concepts: ConceptDef[] = [
  ...withSubject('english', englishConcepts),
  ...withSubject('english', pronunciationConcepts),
  ...withSubject('english', examSkillConcepts),
  ...withSubject('english', passageConcepts),
  ...withSubject('english', wordOrderConcepts),
  ...withSubject('english', ieltsTopicConcepts),
  ...withSubject('english', ieltsReadingConcepts),
  ...withSubject('math', mathConcepts),
  ...withSubject('logic', logicConcepts),
  ...withSubject('literature', literatureConcepts),
];

export const questions: Question[] = [
  ...englishQuestions,
  ...examSkillQuestions,
  ...passageQuestions,
  ...wordOrderQuestions,
  ...ieltsTopicQuestions,
  ...ieltsReadingQuestions,
  ...logicQuestions,
  ...literatureQuestions,
  ...englishGrade9Bank,
  ...logicGrade9Bank,
  ...literatureGrade9Bank,
  ...olympiadQuestions,
];

const sanitizeAll = (g: Record<string, Generator>): Record<string, Generator> =>
  Object.fromEntries(Object.entries(g).map(([id, gen]) => [id, (d: number, r: () => number) => sanitize(gen(d, r))]));

export const generators: Record<string, Generator> = { ...mathGenerators, ...sanitizeAll({ ...logicGenerators, ...englishGenerators, ...pronunciationGenerators }) };

export type { Generator, Generated };

export { translatePrompt, translateExplanation, LESSONS_VI } from './vi';
export { lookup as glossaryLookup, GLOSSARY, type Gloss } from './english/glossary-vi';
export { stressOf, unmark, STRESS, SOUND_GROUPS, ED, S } from './english/pronunciation';
export { PASSAGE_SETS } from './english/passages';
export { IELTS_TOPICS } from './english/ielts-topics';
export { buildIeltsQuestions, passageText as ieltsPassageText, IELTS_TASKS, type IeltsPassage } from './english/ielts-reading';
export { coach, whyNot, mistakeNote, analyseStress, stressWord, wordsForRule, stressDrill, exceptionDrill, stressExceptions, exceptionNote, STRESS_MEMORY, endingDrill, soundDrill, pairsDrill, lastSound, STRESS_RULES, SOUND_TIPS, STRATEGIES } from './english/tutor';
export type { Bi, CoachChip, CoachStep, CoachPlan, DrillItem, StressRule, StressAnalysis } from './english/tutor';
export { WRITING_PROMPTS, type WritingPrompt } from './literature/writing';
