import type { PyUnit } from '../code/learn/types';
import { unit as l01 } from './l01-truyen-lich-su';
import { unit as l02 } from './l02-tho-duong-luat';
import { unit as l03 } from './l03-tho-trao-phung';
import { unit as l04 } from './l04-hai-kich';
import { unit as l05 } from './l05-nghi-luan-xa-hoi';
import { unit as l06 } from './l06-van-ban-thong-tin';
import { unit as l07 } from './l07-truyen-truyen-ki';
import { unit as l08 } from './l08-truyen-tho-nom';
import { unit as l09 } from './l09-tu-tu';
import { unit as l10 } from './l10-nghi-luan-van-hoc';
import { unit as l11 } from './l11-tieng-viet-9';
import { unit as l12 } from './l12-thi-vao-10';

/**
 * Lớp học Ngữ văn: a guided course following the Ngữ văn 8 & 9 programme (Kết nối tri thức) — genres,
 * Tiếng Việt and writing, taught step by step. Example texts are classical works (out of copyright) or
 * written for the course; nothing is copied from the textbooks.
 */
export const LIT_COURSE: PyUnit[] = [l01, l02, l03, l04, l05, l06, l07, l08, l09, l10, l11, l12];
export const LIT_LESSONS = LIT_COURSE.flatMap((u) => u.lessons);
