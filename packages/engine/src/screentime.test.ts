import { describe, expect, it } from 'vitest';
import { answer, limitFor, timeLeft, usedKey, usedPrefix, type TimeRequest } from './screentime';

const limit = { weekday: 60, weekend: 120 };

describe('screen time', () => {
  it('uses the school-day or weekend limit', () => {
    expect(limitFor(limit, '2026-10-21')).toBe(60); // Wednesday
    expect(limitFor(limit, '2026-10-24')).toBe(120); // Saturday
    expect(limitFor(limit, '2026-10-25')).toBe(120); // Sunday
    expect(limitFor(undefined, '2026-10-21')).toBeNull();
    expect(limitFor({ weekday: null, weekend: 90 }, '2026-10-21')).toBeNull();
  });

  it('counts down, warns near the end, and adds extra time', () => {
    const min = 60_000;
    expect(timeLeft(limit, '2026-10-21', 30 * min, 0)).toMatchObject({ up: false, warn: false, leftMs: 30 * min });
    expect(timeLeft(limit, '2026-10-21', 57 * min, 0)).toMatchObject({ up: false, warn: true });
    expect(timeLeft(limit, '2026-10-21', 61 * min, 0).up).toBe(true);
    expect(timeLeft(limit, '2026-10-21', 61 * min, 15)).toMatchObject({ up: false, allowedMin: 75 });
    expect(timeLeft(undefined, '2026-10-21', 999 * min, 0)).toMatchObject({ unlimited: true, up: false });
  });

  it('keeps each device in its own key under the day', () => {
    expect(usedKey('s1', '2026-10-21', 'devA').startsWith(usedPrefix('s1', '2026-10-21'))).toBe(true);
    expect(usedKey('s1', '2026-10-22', 'devA').startsWith(usedPrefix('s1', '2026-10-21'))).toBe(false);
  });

  it('records the parent’s answer', () => {
    const r: TimeRequest = { id: 'r', date: '2026-10-21', asked: 15, at: 1, status: 'pending' };
    expect(answer(r, 30, 5)).toMatchObject({ status: 'approved', given: 30, answeredAt: 5 });
    expect(answer(r, null, 5)).toMatchObject({ status: 'declined', given: undefined });
  });
});
