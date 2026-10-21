/**
 * Daily screen time. A parent sets a limit per child (school days and weekends separately, or none).
 * The kid app adds up active time per device per day; when the day's limit (plus any extra time a parent
 * gave) runs out, the child sees "time's up" and can ask for more. The parent answers from the parent app
 * on any device, choosing how much more, or on the child's device with the parent password.
 * Everything lives in the family's synced key–value store, so it works across devices.
 */

export interface TimeLimit {
  /** Minutes on Monday–Friday; null = no limit. */
  weekday: number | null;
  /** Minutes on Saturday and Sunday; null = no limit. */
  weekend: number | null;
}

export interface TimeRequest {
  id: string;
  /** The day it's for (YYYY-MM-DD). */
  date: string;
  /** Minutes the child asked for. */
  asked: number;
  at: number;
  status: 'pending' | 'approved' | 'declined';
  /** Minutes the parent gave. */
  given?: number;
  answeredAt?: number;
}

export const limitKey = (studentId: string) => `time-limit:${studentId}`;
/** Active milliseconds on one device on one day (one key per device, so devices never overwrite each other). */
export const usedKey = (studentId: string, date: string, device: string) => `time-used:${studentId}:${date}:${device}`;
export const usedPrefix = (studentId: string, date: string) => `time-used:${studentId}:${date}:`;
/** Extra minutes a parent gave on a day. */
export const extraKey = (studentId: string, date: string) => `time-extra:${studentId}:${date}`;
export const requestKey = (studentId: string) => `time-request:${studentId}`;

/** Choices offered to the parent and the child. */
export const LIMIT_CHOICES = [30, 45, 60, 90, 120, 180];
export const ASK_CHOICES = [10, 15, 30];
export const GIVE_CHOICES = [10, 15, 30, 60];
/** A warning this long before the time runs out. */
export const WARN_MS = 5 * 60_000;

const isWeekend = (date: string) => {
  const [y, m, d] = date.split('-').map(Number);
  const day = new Date(y, m - 1, d).getDay();
  return day === 0 || day === 6;
};

/** The day's limit in minutes (null = none). */
export const limitFor = (limit: TimeLimit | undefined, date: string): number | null => {
  if (!limit) return null;
  return isWeekend(date) ? limit.weekend : limit.weekday;
};

export interface TimeLeft {
  /** No limit today. */
  unlimited: boolean;
  usedMs: number;
  /** Minutes allowed today, including extra. */
  allowedMin: number;
  leftMs: number;
  up: boolean;
  /** Under five minutes left. */
  warn: boolean;
}

export function timeLeft(limit: TimeLimit | undefined, date: string, usedMs: number, extraMin: number): TimeLeft {
  const base = limitFor(limit, date);
  if (base == null) return { unlimited: true, usedMs, allowedMin: 0, leftMs: Infinity, up: false, warn: false };
  const allowedMin = base + Math.max(0, extraMin);
  const leftMs = allowedMin * 60_000 - usedMs;
  return { unlimited: false, usedMs, allowedMin, leftMs, up: leftMs <= 0, warn: leftMs > 0 && leftMs <= WARN_MS };
}

/** The child's request, as stored once a parent answers it. */
export const answer = (r: TimeRequest, given: number | null, now: number): TimeRequest => ({
  ...r,
  status: given && given > 0 ? 'approved' : 'declined',
  given: given && given > 0 ? given : undefined,
  answeredAt: now,
});
