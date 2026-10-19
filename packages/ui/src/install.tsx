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
  done: ReactNode;
}

/**
 * "📲 Install app": the browser's install dialog where there is one (Android, Chrome, Edge), Safari's
 * steps on iPhone/iPad. Hidden when already installed or when the browser can't install apps.
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
  if (installed || (!available && !isIos())) return null;
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
      <Modal open={iosHelp} onClose={() => setIosHelp(false)} title={labels.iosTitle}>
        <div className="space-y-3 text-sm">{labels.iosSteps}</div>
        <button type="button" onClick={() => setIosHelp(false)} className="mt-4 w-full rounded-xl bg-brand-600 py-2 font-semibold text-white">
          {labels.done}
        </button>
      </Modal>
    </>
  );
}
