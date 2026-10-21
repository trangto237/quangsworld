import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { SANDBOX_HTML, type Lang, type SandboxState } from './runtime';

export interface SandboxHandle {
  run: (lang: Lang, code: string) => void;
  stop: () => void;
  key: (k: 'up' | 'down' | 'left' | 'right' | 'space') => void;
  /** The program's current picture and what it has used (for checking lessons). */
  state: () => Promise<SandboxState | null>;
  focus: () => void;
}

/** The game screen his code draws on: a sandboxed iframe (see runtime.ts). */
export const Sandbox = forwardRef<SandboxHandle, { onLog?: (t: string) => void; onError?: (t: string) => void; onLoading?: (t: string) => void; onOver?: (t: string) => void; className?: string }>(
  function Sandbox({ onLog, onError, onLoading, onOver, className }, ref) {
    const frame = useRef<HTMLIFrameElement>(null);
    const ready = useRef(false);
    const queued = useRef<unknown[]>([]);
    const waiting = useRef(new Map<number, (s: SandboxState | null) => void>());
    const cb = useRef({ onLog, onError, onLoading, onOver });
    cb.current = { onLog, onError, onLoading, onOver };

    const send = (msg: unknown) => {
      if (!ready.current) queued.current.push(msg);
      else frame.current?.contentWindow?.postMessage(msg, '*');
    };

    useEffect(() => {
      const on = (e: MessageEvent) => {
        if (e.source !== frame.current?.contentWindow) return;
        const d = e.data as { type: string; text?: string; id?: number; state?: SandboxState };
        if (d.type === 'ready') {
          ready.current = true;
          for (const m of queued.current.splice(0)) frame.current?.contentWindow?.postMessage(m, '*');
        } else if (d.type === 'log') cb.current.onLog?.(d.text ?? '');
        else if (d.type === 'error') cb.current.onError?.(d.text ?? '');
        else if (d.type === 'loading') cb.current.onLoading?.(d.text ?? '');
        else if (d.type === 'over') cb.current.onOver?.(d.text ?? '');
        else if (d.type === 'state' && d.id != null) {
          waiting.current.get(d.id)?.(d.state ?? null);
          waiting.current.delete(d.id);
        }
      };
      addEventListener('message', on);
      return () => removeEventListener('message', on);
    }, []);

    useImperativeHandle(ref, () => ({
      run: (lang, code) => {
        send({ type: 'run', lang, code });
        frame.current?.focus();
      },
      stop: () => send({ type: 'stop' }),
      key: (k) => send({ type: 'key', key: k }),
      focus: () => frame.current?.focus(),
      state: () =>
        new Promise((resolve) => {
          const id = Math.random();
          waiting.current.set(id, resolve);
          send({ type: 'state', id });
          setTimeout(() => {
            if (waiting.current.delete(id)) resolve(null);
          }, 1500);
        }),
    }));

    return <iframe ref={frame} title="Game screen" sandbox="allow-scripts" srcDoc={SANDBOX_HTML} className={className} />;
  },
);
