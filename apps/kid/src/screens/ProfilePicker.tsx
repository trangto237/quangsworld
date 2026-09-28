import { useState } from 'react';
import { Button, Modal, useQuery, useRepo } from '@atlas/ui';
import type { StudentProfile } from '@atlas/db';
import { useKid } from '../store';

export function ProfilePicker() {
  const repo = useRepo();
  const login = useKid((s) => s.login);
  const family = useQuery((r) => r.getFamily());
  const students = useQuery((r) => r.listStudents());
  const [pinFor, setPinFor] = useState<StudentProfile | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

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

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-gradient-to-b from-indigo-600 via-violet-700 to-slate-900 p-6 text-white">
      <Stars />
      <div className="relative w-full max-w-2xl text-center">
        <div className="animate-float text-6xl">🧭</div>
        <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">Atlas</h1>
        {!family || students.length === 0 ? (
          <div className="mx-auto mt-8 max-w-md rounded-2xl bg-white/10 p-6 backdrop-blur">
            <p className="text-lg font-semibold">Your adventure is almost ready!</p>
            <p className="mt-2 text-white/80">Ask a parent to create your hero profile first.</p>
            <a href="/parent/" className="mt-5 inline-block rounded-xl bg-amber-400 px-5 py-3 font-display font-bold text-amber-950 shadow-[0_4px_0_#b45309]">
              Open parent setup →
            </a>
          </div>
        ) : (
          <>
            <p className="mt-2 text-lg text-white/80">Who's playing?</p>
            <div className="mt-8 flex flex-wrap justify-center gap-5">
              {students.map((s) => (
                <button key={s.id} onClick={() => pick(s)} className="group flex w-32 flex-col items-center gap-2 rounded-2xl p-3 transition hover:bg-white/10">
                  <span className="grid size-24 place-items-center rounded-3xl bg-white/15 text-6xl ring-4 ring-white/20 transition group-hover:scale-105 group-hover:ring-amber-300">{s.avatar}</span>
                  <span className="font-display text-lg font-semibold">{s.name}</span>
                  {s.hasPin && <span className="text-xs text-white/60">🔒 PIN</span>}
                </button>
              ))}
            </div>
            <a href="/parent/" className="mt-10 inline-block text-sm text-white/60 underline-offset-4 hover:underline">
              Parent dashboard
            </a>
          </>
        )}
      </div>
      <Modal open={!!pinFor} onClose={() => setPinFor(null)} title={`Hi ${pinFor?.name}! Enter your PIN`}>
        <div className="flex justify-center gap-3" aria-live="polite">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={`size-4 rounded-full ${i < pin.length ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'}`} />
          ))}
        </div>
        {error && <p className="mt-3 text-center text-sm font-semibold text-rose-600">Not quite — try again.</p>}
        <div className="mt-5 grid grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((d, i) =>
            d === '' ? (
              <span key={i} />
            ) : (
              <Button key={i} variant="secondary" className="h-14 text-xl" onClick={() => (d === '⌫' ? setPin(pin.slice(0, -1)) : press(d))}>
                {d}
              </Button>
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
