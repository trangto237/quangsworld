import type { PyUnit } from './types';
import { unit as u01 } from './u01-hello';
import { unit as u02 } from './u02-variables';
import { unit as u03 } from './u03-maths';
import { unit as u04 } from './u04-text';
import { unit as u05 } from './u05-truefalse';
import { unit as u06 } from './u06-if';
import { unit as u07 } from './u07-for';
import { unit as u08 } from './u08-while';
import { unit as u09 } from './u09-lists';
import { unit as u10 } from './u10-functions';
import { unit as u11 } from './u11-dicts';
import { unit as u12 } from './u12-challenges';

/** The whole Learn Python course, in order. */
export const COURSE: PyUnit[] = [u01, u02, u03, u04, u05, u06, u07, u08, u09, u10, u11, u12];

export const ALL_LESSONS = COURSE.flatMap((u) => u.lessons);
