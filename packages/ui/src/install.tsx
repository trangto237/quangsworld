import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { Modal } from './components';

/** Chrome / Edge / Android: the browser's install offer, kept for when the user taps "Install app". */
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: InstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // show our own button instead of the browser's mini-bar
    deferred = e as InstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    notify();
  });
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** Already running as an installed app (home screen / app window). */
export const isInstalled = () =>
  typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);

/** iPhone / iPad: no install prompt — installing is Share → "Add to Home Screen" in Safari. */
const isIos = () => typeof navigator !== 'undefined' && (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

export interface InstallLabels {
  install: ReactNode;
  iosTitle: string;
  iosSteps: ReactNode;
  /** Other browsers when they don't offer a direct install (menu steps). */
  otherSteps?: ReactNode;
  done: ReactNode;
}

const OTHER_STEPS = (
  <ul className="list-disc space-y-2 pl-5">
    <li>
      <b>Chrome or Edge (computer):</b> click the install icon at the right end of the address bar, or the ⋮ / … menu → <i>Install Atlas</i> (Edge: <i>Apps → Install this site as an app</i>).
    </li>
    <li>
      <b>Android:</b> Chrome ⋮ menu → <i>Install app</i> or <i>Add to Home screen</i>.
    </li>
    <li>
      <b>Safari on a Mac:</b> <i>File → Add to Dock</i>.
    </li>
    <li>
      <b>iPhone / iPad:</b> in Safari, Share (square with an arrow) → <i>Add to Home Screen</i>.
    </li>
  </ul>
);

/**
 * "📲 Install app": the browser's install dialog where there is one (Android, Chrome, Edge), otherwise
 * the steps for this browser (Safari on iPhone/iPad, menus elsewhere). Hidden once installed.
 */
export function InstallButton({ labels, className }: { labels: InstallLabels; className?: string }) {
  const available = useSyncExternalStore(subscribe, () => !!deferred, () => false);
  const [installed, setInstalled] = useState(isInstalled);
  const [iosHelp, setIosHelp] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(display-mode: standalone)');
    const on = () => setInstalled(isInstalled());
    mq.addEventListener?.('change', on);
    window.addEventListener('appinstalled', on);
    return () => {
      mq.removeEventListener?.('change', on);
      window.removeEventListener('appinstalled', on);
    };
  }, []);
  void available; // re-render when the browser's install offer arrives
  // Always offered until installed: a direct install where the browser allows it, otherwise the steps.
  if (installed) return null;
  return (
    <>
      <button
        type="button"
        className={className}
        onClick={async () => {
          if (deferred) {
            const e = deferred;
            await e.prompt();
            const { outcome } = await e.userChoice;
            if (outcome === 'accepted') deferred = null;
            notify();
          } else setIosHelp(true);
        }}
      >
        {labels.install}
      </button>
      <Modal open={iosHelp} onClose={() => setIosHelp(false)} title={isIos() ? labels.iosTitle : 'Install Atlas'}>
        <div className="space-y-3 text-sm">{isIos() ? labels.iosSteps : (labels.otherSteps ?? OTHER_STEPS)}</div>
        <button type="button" onClick={() => setIosHelp(false)} className="mt-4 w-full rounded-xl bg-brand-600 py-2 font-semibold text-white">
          {labels.done}
        </button>
      </Modal>
    </>
  );
}
