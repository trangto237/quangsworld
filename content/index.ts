import type { ConceptDef, Question, SubjectId } from '@atlas/shared';
import type { ConceptSeed } from './helpers';
import { englishConcepts } from './english/concepts';
import { englishQuestions } from './english/questions';
import { mathConcepts } from './math/concepts';
import { generators as mathGenerators, type Generator, type Generated } from './math/generators';
import { logicConcepts, logicQuestions, logicGenerators } from './logic';
import { literatureConcepts, literatureQuestions } from './literature';

const withSubject = (subject: SubjectId, seeds: ConceptSeed[]): ConceptDef[] => seeds.map((c) => ({ ...c, subject }));

export const concepts: ConceptDef[] = [
  ...withSubject('english', englishConcepts),
  ...withSubject('math', mathConcepts),
  ...withSubject('logic', logicConcepts),
  ...withSubject('literature', literatureConcepts),
];

export const questions: Question[] = [...englishQuestions, ...logicQuestions, ...literatureQuestions];

export const generators: Record<string, Generator> = { ...mathGenerators, ...logicGenerators };

export type { Generator, Generated };
