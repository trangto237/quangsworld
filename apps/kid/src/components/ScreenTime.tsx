import { useEffect, useRef, useState } from 'react';
import type { StudentProfile } from '@atlas/db';
import { ASK_CHOICES, GIVE_CHOICES, answer, extraKey, limitKey, requestKey, timeLeft, usedKey, type TimeLimit, type TimeRequest } from '@atlas/engine';
import { dayKey, uid } from '@atlas/shared';
import { cx, useQuery, useRepo } from '@atlas/ui';
import { T, TB, tr, useLang } from '../i18n';
import { useKid } from '../store';
import { TownButton } from '../town/ui';

/**
 * Daily screen time, on the child's side: counts the time he's actively using the app (the page is
 * showing and he touched it in the last 90 s), warns five minutes before the end, and when the day's time
 * is up shows "time's up" — never in the middle of a game, only once it's over. From there he can ask a
 * parent for more (answered from the parent app on any device) or a parent can add time right here.
 */

const IDLE_MS = 90_000;
const SAVE_EVERY_MS = 30_000;
/** Screens left alone until they finish: a game, an exam, the trial. */
const DONT_INTERRUPT = ['battle', 'exam', 'placement', 'results'];

function deviceId(): string {
  try {
    let id = localStorage.getItem('atlas-device');
    if (!id) {
      id = uid('dev_');
      localStorage.setItem('atlas-device', id);
    }
    return id;
  } catch {
    return 'this-device';
  }
}

export function ScreenTime({ student }: { student: StudentProfile }) {
  const repo = useRepo();
  const lang = useLang();
  const screen = useKid((s) => s.screen);
  const [date, setDate] = useState(() => dayKey(Date.now()));
  const device = useRef(deviceId());
  const pending = useRef(0);
  const [unsaved, setUnsaved] = useState(0);
  const sid = student.id;

  const limit = useQuery((r) => r.getKv<TimeLimit>(limitKey(sid)), [sid]);
  const saved = useQuery((r) => r.screenTimeUsed(sid, date), [sid, date]);
  const extra = useQuery((r) => r.getKv<number>(extraKey(sid, date)) ?? 0, [sid, date]);
  const request = useQuery((r) => r.getKv<TimeRequest>(requestKey(sid)), [sid]);
  const left = timeLeft(limit, date, saved + unsaved, extra);

  // Count active time: the page is showing and he touched it recently.
  useEffect(() => {
    let last = Date.now();
    let touched = Date.now();
    const poke = () => (touched = Date.now());
    const save = async () => {
      const ms = Math.round(pending.current);
      if (ms < 1000) return;
      pending.current = 0;
      setUnsaved(0);
      const day = dayKey(Date.now());
      const key = usedKey(sid, day, device.current);
      await repo.setKv(key, (repo.getKv<number>(key) ?? 0) + ms);
    };
    const tick = window.setInterval(() => {
      const now = Date.now();
      if (document.visibilityState === 'visible' && now - touched < IDLE_MS) pending.current += now - last;
      last = now;
      setUnsaved(Math.round(pending.current));
      const day = dayKey(now);
      setDate((d) => (d === day ? d : day));
    }, 5000);
    const saver = window.setInterval(() => void save(), SAVE_EVERY_MS);
    const onHide = () => document.visibilityState === 'hidden' && void save();
    for (const ev of ['pointerdown', 'keydown', 'wheel', 'touchstart']) window.addEventListener(ev, poke, { passive: true });
    document.addEventListener('visibilitychange', onHide);
    return () => {
      window.clearInterval(tick);
      window.clearInterval(saver);
      for (const ev of ['pointerdown', 'keydown', 'wheel', 'touchstart']) window.removeEventListener(ev, poke);
      document.removeEventListener('visibilitychange', onHide);
      void save();
    };
  }, [repo, sid]);

  // Little notes: five minutes left, and "a parent gave you more time".
  const [note, setNote] = useState<string | null>(null);
  const warned = useRef<string | null>(null);
  useEffect(() => {
    if (left.warn && warned.current !== `${date}:${left.allowedMin}`) {
      warned.current = `${date}:${left.allowedMin}`;
      setNote(tr(lang, '⏰ About 5 minutes left today — finish what you are doing.'));
    }
  }, [left.warn, left.allowedMin, date, lang]);
  const seenAnswer = useRef<number | undefined>(request?.answeredAt);
  useEffect(() => {
    if (request?.status === 'approved' && request.answeredAt !== seenAnswer.current && request.date === date) {
      seenAnswer.current = request.answeredAt;
      setNote(tr(lang, '🎉 A parent gave you {n} more minutes!', { n: request.given ?? 0 }));
    }
  }, [request, date, lang]);
  useEffect(() => {
    if (!note) return;
    const t = setTimeout(() => setNote(null), 6000);
    return () => clearTimeout(t);
  }, [note]);

  const locked = left.up && !DONT_INTERRUPT.includes(screen.name);
  return (
    <>
      {note && !locked && (
        <div className="pointer-events-none fixed inset-x-0 top-24 z-[70] flex justify-center px-3">
          <div className="town-panel animate-pop px-4 py-2 text-center font-display font-bold">{note}</div>
        </div>
      )}
      {locked && <TimeUp student={student} date={date} usedMs={left.usedMs} extra={extra} request={request?.date === date ? request : undefined} />}
    </>
  );
}

function TimeUp({ student, date, usedMs, extra, request }: { student: StudentProfile; date: string; usedMs: number; extra: number; request?: TimeRequest }) {
  const repo = useRepo();
  const logout = useKid((s) => s.logout);
  const [mode, setMode] = useState<'main' | 'ask' | 'parent'>('main');
  const [pw, setPw] = useState('');
  const [parentOk, setParentOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [custom, setCustom] = useState('');
  const minutes = Math.round(usedMs / 60_000);

  const ask = async (n: number) => {
    await repo.setKv(requestKey(student.id), { id: uid('tr_'), date, asked: n, at: Date.now(), status: 'pending' } satisfies TimeRequest);
    setMode('main');
  };
  const give = async (n: number) => {
    if (!(n > 0)) return;
    await repo.setKv(extraKey(student.id, date), extra + n);
    if (request?.status === 'pending') await repo.setKv(requestKey(student.id), answer(request, n, Date.now()));
  };

  return (
    <div className="town-bg fixed inset-0 z-[80] grid place-items-center overflow-y-auto p-4 text-ink-text" role="dialog" aria-modal="true">
      <div className="town-panel w-full max-w-md p-6 text-center">
        <div className="town-bob text-6xl">⏰</div>
        <h1 className="mt-2 font-display text-3xl font-bold">
          <T en="Time's up for today!" />
        </h1>
        <p className="mt-1 text-ink-soft">
          <T en="You played {n} minutes today. Great work, {name}!" vars={{ n: minutes, name: student.name }} />
        </p>

        {mode === 'main' && (
          <div className="mt-5 space-y-2">
            {request?.status === 'pending' ? (
              <div className="rounded-xl bg-tint-amber p-3 font-semibold">
                🙏 <T en="You asked for {n} more minutes. Waiting for a parent…" vars={{ n: request.asked }} />
                <div className="mt-1 text-xs text-ink-soft">
                  <T en="This opens by itself when they say yes." />
                </div>
              </div>
            ) : request?.status === 'declined' ? (
              <div className="rounded-xl bg-tint-red p-3 font-semibold">
                👋 <T en="A parent said not today. See you tomorrow!" />
              </div>
            ) : (
              <TownButton tone="green" size="lg" className="w-full" onClick={() => setMode('ask')}>
                <TB en="🙋 Ask for more time" />
              </TownButton>
            )}
            <TownButton tone="amber" className="w-full" onClick={() => setMode('parent')}>
              <TB en="👪 A parent is here" />
            </TownButton>
            <TownButton tone="paper" className="w-full" onClick={logout}>
              <TB en="⇄ Switch player" />
            </TownButton>
          </div>
        )}

        {mode === 'ask' && (
          <div className="mt-5">
            <p className="font-semibold">
              <T en="How much more time would you like?" />
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {ASK_CHOICES.map((n) => (
                <TownButton key={n} tone="green" onClick={() => void ask(n)}>
                  +{n} <T en="min" />
                </TownButton>
              ))}
            </div>
            <button className="mt-3 text-sm font-bold text-ink-soft underline" onClick={() => setMode('main')}>
              <T en="Back" />
            </button>
          </div>
        )}

        {mode === 'parent' && !parentOk && (
          <form
            className="mt-5 space-y-2"
            onSubmit={async (e) => {
              e.preventDefault();
              if (await repo.verifyParent(pw)) {
                setParentOk(true);
                setErr(null);
              } else setErr(tr('help', 'Wrong password'));
            }}
          >
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Parent password"
              autoFocus
              className="w-full rounded-xl border-2 border-ink bg-paper px-3 py-2 text-center"
            />
            {err && <p className="text-sm font-bold text-[#b4432f]">{err}</p>}
            <TownButton type="submit" tone="green" className="w-full">
              <TB en="Continue" />
            </TownButton>
            <button type="button" className="text-sm font-bold text-ink-soft underline" onClick={() => setMode('main')}>
              <T en="Back" />
            </button>
          </form>
        )}

        {mode === 'parent' && parentOk && (
          <div className="mt-5">
            <p className="font-semibold">
              <T en="How much more time today?" />
            </p>
            {request?.status === 'pending' && (
              <p className="text-sm text-ink-soft">
                <T en="{name} asked for {n} minutes." vars={{ name: student.name, n: request.asked }} />
              </p>
            )}
            <div className="mt-2 grid grid-cols-4 gap-2">
              {GIVE_CHOICES.map((n) => (
                <TownButton key={n} tone="green" onClick={() => void give(n)}>
                  +{n}
                </TownButton>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <input
                type="number"
                min={1}
                max={300}
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder="Other (min)"
                className="min-w-0 flex-1 rounded-xl border-2 border-ink bg-paper px-3 py-2"
              />
              <TownButton tone="green" disabled={!(Number(custom) > 0)} onClick={() => void give(Math.round(Number(custom)))}>
                <TB en="Give" />
              </TownButton>
            </div>
            {request?.status === 'pending' && (
              <button
                className={cx('mt-3 text-sm font-bold text-[#b4432f] underline')}
                onClick={() => void repo.setKv(requestKey(student.id), answer(request, null, Date.now())).then(() => setMode('main'))}
              >
                <T en="Not today" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
