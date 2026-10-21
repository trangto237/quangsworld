import { describe, expect, it } from 'vitest';
import { pathOf, screenOf } from './route';
import type { Screen } from '../store';

describe('screen addresses', () => {
  it('round-trips the screens that can be bookmarked', () => {
    const screens: Screen[] = [
      { name: 'hub' },
      { name: 'quests' },
      { name: 'hero' },
      { name: 'shop' },
      { name: 'mistakes' },
      { name: 'exam-hall' },
      { name: 'exam', examId: 'exam_ab12' },
      { name: 'world', worldId: 'word-forest' },
      { name: 'coach', topic: 'stress' },
    ];
    for (const s of screens) expect(screenOf(pathOf(s))).toEqual(s.name === 'coach' ? { name: 'coach', topic: 'stress' } : s);
  });
  it('sends a reloaded battle back to the quests, and unknown addresses home', () => {
    expect(screenOf('/play')).toEqual({ name: 'quests' });
    expect(screenOf('/results')).toEqual({ name: 'quests' });
    expect(screenOf('/nope')).toEqual({ name: 'hub' });
    expect(pathOf({ name: 'exam-hall' })).toBe('/exams');
  });
});
