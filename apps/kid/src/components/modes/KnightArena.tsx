import { useEffect, useMemo, useRef, useState } from 'react';
import { KnightSim, knightConfigFor, type KnightEvent } from '@atlas/game';
import type { PresentedQuestion } from '@atlas/knowledge';
import { cx } from '@atlas/ui';
import { QuestionCard } from '../QuestionCard';
import { stopSpeaking } from '../../lib/speech';
import { T } from '../../i18n';
import { GameShell, Hearts, Pill } from './GameShell';
import type { ModeProps } from './types';

/**
 * Knight's Quest: a chess puzzle. Each correct answer earns a knight move (bank up to 3);
 * capture every Glitch pawn, then the Glitch king. Wrong answers let the nearest Glitch close in.
 */
export function KnightArena(p: ModeProps) {
  const sim = useMemo(() => new KnightSim({ ...knightConfigFor(p.minutes), noDefeat: p.trial, endless: p.trial }), [p.minutes, p.trial]);
  const [question, setQuestion] = useState<PresentedQuestion | null>(null);
  const [streak, setStreak] = useState(0);
  const [, force] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);
  const [hurt, setHurt] = useState(false);
  const ended = useRef(false);
  const props = useRef(p);
  props.current = p;

  const end = (victory: boolean, retreated: boolean) => {
    if (ended.current) return;
    ended.current = true;
    stopSpeaking();
    props.current.onEnd(victory, retreated);
  };

  useEffect(() => {
    setQuestion(props.current.nextQuestion());
    return () => {
      stopSpeaking();
    };
  }, []);

  const say = (msg: string) => {
    setFlash(msg);
    setTimeout(() => setFlash((m) => (m === msg ? null : m)), 1800);
  };

  const handle = (events: KnightEvent[]) => {
    for (const e of events) {
      if (e.type === 'capture' && e.piece.kind === 'pawn') say(sim.kingOpen ? '♚ The king is unshielded — capture him!' : '♟ Glitch captured!');
      if (e.type === 'kingFalls') say(p.trial ? '♚ Checkmate! A new Glitch army appears…' : '♚ Checkmate!');
      if (e.type === 'attacked') {
        say('A Glitch strikes your knight!');
        setHurt(true);
        setTimeout(() => setHurt(false), 400);
      }
      if (e.type === 'end') setTimeout(() => end(e.victory, false), 1200);
    }
    force((n) => n + 1);
  };

  const onAnswer = (correct: boolean, ms: number, picked: string) => {
    if (!question || ended.current) return;
    p.onActivity?.();
    const r = p.onAnswered(question, correct, ms, picked);
    setStreak(r.streak);
    if (correct) {
      sim.grantMove();
      force((n) => n + 1);
    } else handle(sim.enemyTurn());
    if (r.done) {
      handle(sim.finale());
      setQuestion(null);
      return;
    }
    if (sim.status === 'playing') setQuestion(p.nextQuestion());
  };

  const legal = sim.moves > 0 ? sim.legalMoves() : [];
  const isLegal = (r: number, c: number) => legal.some((s) => s.r === r && s.c === c);
  const cells = Array.from({ length: sim.size * sim.size }, (_, i) => ({ r: Math.floor(i / sim.size), c: i % sim.size }));

  return (
    <GameShell
      title={p.title}
      subtitle={p.subtitle ?? "Knight's Quest"}
      progress={p.progress}
      retreatText={p.retreatText}
      onLeave={() => end(false, true)}
      className="bg-gradient-to-b from-amber-950 via-stone-950 to-slate-950"
      stats={
        <>
          <Hearts n={sim.hearts} max={sim.maxHearts} />
          <Pill className="bg-amber-400/20 text-amber-300" title="Moves">
            ♞ × {sim.moves}
          </Pill>
          <Pill title="Glitch pawns left">♟ {sim.pawnsLeft}</Pill>
          <Pill title="Answer streak">🔥 {streak}</Pill>
        </>
      }
    >
      <div className="flex flex-1 flex-col lg:flex-row">
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-4">
          <div
            className={cx('grid aspect-square w-full max-w-[min(520px,calc(100dvh-10rem))] overflow-hidden rounded-xl shadow-2xl ring-4 ring-amber-900/60', hurt && 'animate-shake')}
            style={{ gridTemplateColumns: `repeat(${sim.size}, 1fr)`, gridTemplateRows: `repeat(${sim.size}, 1fr)` }}
          >
            {cells.map(({ r, c }) => {
              const piece = sim.pieces.find((x) => x.r === r && x.c === c);
              const knight = sim.knight.r === r && sim.knight.c === c;
              const legalHere = isLegal(r, c);
              return (
                <button
                  key={`${r}-${c}`}
                  disabled={!legalHere}
                  onClick={() => {
                    p.onActivity?.();
                    handle(sim.move({ r, c }));
                  }}
                  className={cx(
                    'relative grid place-items-center text-[min(9vw,56px)] leading-none transition',
                    (r + c) % 2 ? 'bg-amber-800' : 'bg-amber-200',
                    legalHere && 'cursor-pointer after:absolute after:inset-[30%] after:rounded-full after:bg-emerald-400/70 hover:brightness-110',
                    legalHere && piece && 'after:inset-[6%] after:bg-transparent after:ring-4 after:ring-rose-500',
                  )}
                  aria-label={`${String.fromCharCode(97 + c)}${sim.size - r}${knight ? ' knight' : piece ? ` ${piece.kind}` : ''}${legalHere ? ' (move here)' : ''}`}
                >
                  {knight && <span className="relative z-10 text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">♞</span>}
                  {piece && (
                    <span className={cx('relative z-10 drop-shadow', piece.kind === 'king' ? 'text-rose-700' : 'text-violet-700')}>
                      {piece.kind === 'king' ? '♚' : '♟'}
                      {piece.kind === 'king' && !sim.kingOpen && <span className="absolute -right-2 -top-2 text-[0.4em]">🛡</span>}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="min-h-6 text-center text-sm font-semibold text-amber-200">
            {flash ? <T en={flash} /> : sim.moves > 0 ? <T en="Click a green square to move your knight." /> : <T en="Answer correctly to earn a knight move." />}
          </p>
        </div>
        <aside className="border-t border-white/10 bg-slate-100 p-4 text-slate-900 lg:w-[440px] lg:border-l lg:border-t-0 dark:bg-slate-900 dark:text-slate-100">
          {question ? <QuestionCard question={question} onAnswer={onAnswer} compact wrongNote={p.wrongNote} glossary={p.glossary ? p.glossary(question) : true} /> : null}
        </aside>
      </div>
    </GameShell>
  );
}
