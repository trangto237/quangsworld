/**
 * Placeholder: TIMO / FIMO-style olympiad problems (toán nâng cao), being written.
 */
import type { ConceptSeed } from '../helpers';
import { makeBank } from '../helpers';

export const olympiadConcepts: ConceptSeed[] = [];
export const olympiadLessonsVi: Record<string, string> = {};
const { list } = makeBank('Atlas olympiad bank', 'oly-');
export const olympiadQuestions = list;
