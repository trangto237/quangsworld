import { useEffect, useState } from 'react';
import { InstallButton, Modal, useQuery, useRepo } from '@atlas/ui';
import { TownButton } from '../town/ui';
import type { StudentProfile } from '@atlas/db';
import { useKid } from '../store';
import { T, TB, tr } from '../i18n';
import { JoinFamily, useKidCloud } from '../components/JoinFamily';
import { confirmSignOut } from '@atlas/db/cloud';
import { SignIn } from './SignIn';

const OFFLINE = 'atlas-no-signin';
export const PARENT_PLAY = 'atlas-parent-play';
const flag = (k: string) => {
  try {
    return sessionStorage.getItem(k) === '1';
  } catch {
    return false;
  }
};
export const setFlag = (k: string) => {
  try {
    sessionStorage.setItem(k, '1');
  } catch {
    /* ignore */
  }
};
/** A child login opens its profile once per visit; after "switch profile" the picker stays. */
let autoOpened = false;

export function ProfilePicker() {
  const repo = useRepo();
  const login = useKid((s) => s.login);
  const family = useQuery((r) => r.getFamily());
  const students = useQuery((r) => r.listStudents());
  const [pinFor, setPinFor] = useState<StudentProfile | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const { status: cloud, canJoin, cloud: cloudSync } = useKidCloud();
  const connected = !!cloud.email || !!cloud.viaCode;
  const [joinOpen, setJoinOpen] = useState(false);
  const [joining, setJoining] = useState(false);
  const [offline, setOffline] = useState(() => flag(OFFLINE));
  const configured = !!cloudSync.config();
  /** Signed in with a child login: only that child's profile, no parent tile. */
  const childId = cloud.role === 'member' ? cloud.studentId : undefined;
  const shown = childId ? students.filter((s) => s.id === childId) : students;

  // One sign-in screen: the parent's login belongs in the parent app.
  useEffect(() => {
    if (cloud.role === 'parent' && !flag(PARENT_PLAY) && !new URLSearchParams(location.search).get('play')) location.replace('/parent/');
  }, [cloud.role]);
  // A child login goes straight into the child's own profile (once it has downloaded).
  useEffect(() => {
    const s = childId && students.find((x) => x.id === childId);
    if (s && !autoOpened) {
      autoOpened = true;
      login(s.id);
    }
  }, [childId, students, login]);

  const pick = (s: StudentProfile) => {
    if (s.hasPin) {
      setPinFor(s);
      setPin('');
      setError(false);
    } else login(s.id);
  };

  const press = async (d: string) => {
    if (!pinFor) return;
    const next = (pin + d).slice(0, 4);
    setPin(next);
    setError(false);
    if (next.length === 4) {
      if (await repo.verifyStudentPin(pinFor.id, next)) login(pinFor.id);
      else {
        setError(true);
        setPin('');
      }
    }
  };

  if (configured && cloud.state === 'unconfigured') return <div className="town-bg min-h-dvh" />;
  if (configured && cloud.state === 'signed-out' && !offline)
    return <SignIn onOffline={family && students.length ? () => (setFlag(OFFLINE), setOffline(true)) : undefined} />;
  if (cloud.role === 'parent' && !flag(PARENT_PLAY)) return <div className="town-bg min-h-dvh" />;

  return (
    <div className="town-bg relative grid min-h-dvh place-items-center overflow-hidden p-6 text-ink-text">
      <div className="relative w-full max-w-2xl text-center">
        <div className="animate-float text-6xl">🧭</div>
        <h1 className="mt-3 font-display text-4xl font-bold [text-shadow:0_3px_0_var(--paper)] sm:text-5xl">Atlas</h1>
        {(!family || students.length === 0) && !joining && (cloud.viaCode || cloud.role === 'member') && cloud.state === 'syncing' ? (
          <div className="town-panel mx-auto mt-8 max-w-md p-6">
            <p className="text-lg font-semibold">
              <T en="Downloading your family's adventure…" />
            </p>
          </div>
        ) : (!family || students.length === 0) && (canJoin || joining) ? (
          <div className="town-panel mx-auto mt-8 max-w-md p-6">
            <p className="text-lg font-semibold">
              <T en="Connect to my family" />
            </p>
            <p className="mb-4 mt-1 text-ink-soft">
              <T en="Sign in with your own email, or use the family code from your parent." />
            </p>
            <JoinFamily onBusy={setJoining} />
            <a href="/parent/" className="mt-5 inline-block text-sm text-ink-soft underline-offset-4 hover:underline">
              <T en="No code? Set up on this device instead" />
            </a>
            <div className="mt-4">
              <KidInstall />
            </div>
          </div>
        ) : !family || students.length === 0 ? (
          <div className="town-panel mx-auto mt-8 max-w-md p-6">
            <p className="text-lg font-semibold">
              <T en="Your adventure is almost ready!" />
            </p>
            <p className="mt-2 text-ink-soft">
              <T en="Ask a parent to create your hero profile first." />
            </p>
            <a href="/parent/" className="town-btn mt-5 inline-block rounded-xl bg-[#ffc23d] px-5 py-3 font-display font-bold text-[#3b2412]">
              <TB en="Open parent setup →" />
            </a>
            <div className="mt-4">
              <KidInstall />
            </div>
          </div>
        ) : (
          <>
            <p className="mt-2 text-lg font-semibold text-ink-soft">
              <T en="Who's playing?" />
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-5">
              {shown.map((s) => (
                <button key={s.id} onClick={() => pick(s)} className="town-panel group flex w-32 flex-col items-center gap-2 p-3 transition hover:-translate-y-0.5">
                  <span className="grid size-24 place-items-center rounded-full border-[2.5px] border-ink bg-[#ffd98a] text-6xl transition group-hover:scale-105">{s.avatar}</span>
                  <span className="font-display text-lg font-bold">{s.name}</span>
                  {s.hasPin && <span className="text-xs text-ink-soft">🔒 PIN</span>}
                </button>
              ))}
              {/* The parent uses the same app: their pages open with the parent password. Not on a child's own login. */}
              {!childId && (
              <a href="/parent/" className="town-panel group flex w-32 flex-col items-center gap-2 p-3 transition hover:-translate-y-0.5">
                <span className="grid size-24 place-items-center rounded-full border-[2.5px] border-ink bg-[#cfe2f7] text-5xl transition group-hover:scale-105">👤</span>
                <span className="font-display text-lg font-bold">{family.parentName || tr('help', 'Parent')}</span>
                <span className="text-xs text-ink-soft">
                  🔒 <T en="Parent" />
                </span>
              </a>
              )}
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-6">
              <KidInstall />
              {connected && (
                <button
                  onClick={() =>
                    void confirmSignOut(cloudSync, {
                      ask: `${tr('help', 'Sign out of this device?')}\n\n${tr('vi', 'Your progress is saved in the cloud. Sign in again any time to continue.')}\n(${tr('en', 'Your progress is saved in the cloud. Sign in again any time to continue.')})`,
                      unsynced: tr('vi', 'Sign out anyway? Progress since the last sync on this device will be lost.'),
                    })
                  }
                  className="text-sm font-semibold text-ink-soft underline-offset-4 hover:underline"
                >
                  🚪 <T en="Sign out" />
                  {cloud.email ? ` (${cloud.email})` : ''}
                </button>
              )}
              {canJoin && (
                <button onClick={() => setJoinOpen(true)} className="text-sm font-semibold text-ink-soft underline-offset-4 hover:underline">
                  ☁️ <T en="Connect to my family" />
                </button>
              )}
            </div>
          </>
        )}
      </div>
      <Modal open={joinOpen} onClose={() => setJoinOpen(false)} title={tr('help', 'Connect to my family')}>
        <JoinFamily onDone={() => setJoinOpen(false)} />
      </Modal>
      <Modal open={!!pinFor} onClose={() => setPinFor(null)} title={tr('help', 'Hi {name}! Enter your PIN', { name: pinFor?.name ?? '' })}>
        <div className="flex justify-center gap-3" aria-live="polite">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={`size-4 rounded-full border-2 border-ink ${i < pin.length ? 'bg-[#5cb85c]' : 'bg-paper-3'}`} />
          ))}
        </div>
        {error && (
          <p className="mt-3 text-center text-sm font-semibold text-rose-600">
            <T en="Not quite — try again." />
          </p>
        )}
        <div className="mt-5 grid grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((d, i) =>
            d === '' ? (
              <span key={i} />
            ) : (
              <TownButton key={i} tone="paper" className="h-14 text-xl" onClick={() => (d === '⌫' ? setPin(pin.slice(0, -1)) : press(d))}>
                {d}
              </TownButton>
            ),
          )}
        </div>
      </Modal>
    </div>
  );
}

export function Stars() {
  return (
    <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden>
      {Array.from({ length: 40 }, (_, i) => (
        <span
          key={i}
          className="absolute size-1 rounded-full bg-white"
          style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`, opacity: ((i * 7) % 10) / 10 + 0.2 }}
        />
      ))}
    </div>
  );
}

/** "📲 Install the app" for the kid screens (Vietnamese help on iPhone). */
function KidInstall() {
  return (
    <InstallButton
      className="town-btn rounded-xl bg-[#4b8fe2] px-4 py-2 font-display text-sm font-bold text-white"
      labels={{
        install: (
          <>
            📲 <T en="Install the app" />
          </>
        ),
        iosTitle: tr('help', 'Put Atlas on your home screen'),
        iosSteps: (
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              <T en="In Safari, tap the Share button (the square with an arrow) at the bottom of the screen." />
            </li>
            <li>
              <T en="Scroll down and tap “Add to Home Screen”, then “Add”." />
            </li>
            <li>
              <T en="Open Atlas from its new icon — it works like an app, even offline." />
            </li>
          </ol>
        ),
        done: <T en="Got it" />,
      }}
    />
  );
}
