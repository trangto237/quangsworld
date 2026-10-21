import type { CoachTopic, Screen } from '../store';

/**
 * Screens ↔ web addresses, so the browser's Back button works and a reload keeps your place:
 * /quests, /hero, /shop, /mistakes, /code, /coach, /coach/stress, /exams, /exams/<paper>, /world/<world>.
 * A battle and its results can't be rebuilt from an address: reloading there goes back to the quests.
 * (The trial is shown automatically until it's done, so its address isn't needed to get back.)
 */

const COACH: CoachTopic[] = ['stress', 'endings', 'sounds', 'twins', 'grammar'];

export function pathOf(s: Screen): string {
  switch (s.name) {
    case 'quests':
    case 'hero':
    case 'shop':
    case 'mistakes':
    case 'code':
    case 'writing':
      return `/${s.name}`;
    case 'exam-hall':
      return '/exams';
    case 'exam':
      return `/exams/${encodeURIComponent(s.examId)}`;
    case 'world':
      return `/world/${encodeURIComponent(s.worldId)}`;
    case 'coach':
      return s.topic ? `/coach/${s.topic}` : '/coach';
    case 'battle':
      return '/play';
    case 'results':
      return '/results';
    case 'placement':
      return '/trial';
    default:
      return '/';
  }
}

export function screenOf(path: string): Screen {
  const [a, b] = path
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .map((p) => decodeURIComponent(p));
  switch (a) {
    case 'quests':
    case 'hero':
    case 'shop':
    case 'mistakes':
    case 'code':
    case 'writing':
      return { name: a };
    case 'exams':
      return b ? { name: 'exam', examId: b } : { name: 'exam-hall' };
    case 'world':
      return b ? { name: 'world', worldId: b } : { name: 'hub' };
    case 'coach':
      return { name: 'coach', topic: COACH.includes(b as CoachTopic) ? (b as CoachTopic) : undefined };
    case 'play':
    case 'results':
      return { name: 'quests' };
    default:
      return { name: 'hub' };
  }
}
