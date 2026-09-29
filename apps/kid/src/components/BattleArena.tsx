import { useEffect, useRef, useState } from 'react';
import { TOWERS, loadBattle, type BattleConfig, type BattleController, type HudState, type Skin, type Theme, type TowerKind } from '@atlas/game';
import { getConcept, type PresentedQuestion } from '@atlas/knowledge';
import { Button, Modal, cx } from '@atlas/ui';
import { QuestionCard } from './QuestionCard';
import { stopSpeaking } from '../lib/speech';
import { T, TB, tr, useLang } from '../i18n';

export interface ArenaProps {
  title: string;
  subtitle?: string;
  config: BattleConfig;
  theme?: Theme;
  skin?: Skin;
  bossName?: string;
  /** Next challenge, or null when the source has nothing more. */
  nextQuestion: () => PresentedQuestion | null;
  /**
   * Called after each answer. Return the current answer streak; return `done: true` when the
   * source is finished (trial realms), which ends the battle with a final strike.
   */
  onAnswered: (q: PresentedQuestion, correct: boolean, ms: number, picked: string) => { streak: number; done?: boolean };
  onEnd: (victory: boolean, retreated: boolean) => void;
  /** Note under a wrong answer during battle. */
  wrongNote?: string;
  retreatText?: string;
  /** Shown above the board until the first tower is built. */
  hint?: string;
  /** Called on any learner activity (for active-time tracking). */
  onActivity?: () => void;
  /** Whether the tap-a-word glossary is allowed for a question (off for English in the placement trial). */
  glossary?: (q: PresentedQuestion) => boolean;
  /** A liberation bar in the header (trial realms) instead of an enemy counter. */
  progress?: { value: number; max: number; label: string };
}

/**
 * The battlefield: Phaser lane battle + tower bar + challenge panel.
 * The kid never sees "exercise" — each answer powers the towers.
 */
export function BattleArena(p: ArenaProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const battle = useRef<BattleController | null>(null);
  const ended = useRef(false);
  const towers = p.config.towers as TowerKind[];
  const [hud, setHud] = useState<HudState | null>(null);
  const [selected, setSelected] = useState<TowerKind | null>(towers[0] ?? null);
  const [question, setQuestion] = useState<PresentedQuestion | null>(null);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [confirmRetreat, setConfirmRetreat] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef(0);
  const lang = useLang();
  const props = useRef(p);
  props.current = p;

  const flash = (msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  };

  const advance = () => {
    const q = props.current.nextQuestion();
    setQuestion(q);
    if (q) battle.current?.setTimeScale(q.passage ? 0.45 : q.audio ? 0.7 : 1);
  };

  const end = (victory: boolean, retreated: boolean) => {
    if (ended.current) return;
    ended.current = true;
    stopSpeaking();
    battle.current?.pause(true);
    props.current.onEnd(victory, retreated);
  };

  useEffect(() => {
    let alive = true;
    loadBattle().then(({ createBattle }) => {
      if (!alive || !canvasRef.current) return;
      battle.current = createBattle(canvasRef.current, {
        config: p.config,
        theme: p.theme,
        skin: p.skin,
        bossName: p.bossName,
        onHud: setHud,
        onEvent: (e) => {
          if (e.type === 'strike') flash('♛ Checkmate Strike! 5 in a row!');
          if (e.type === 'baseHit') flash('A Glitch reached the castle!');
          if (e.type === 'empty') flash('A tower is out of ammo — answer to resupply!');
        },
        onEnd: (victory) => end(victory, false),
      });
      battle.current.select(towers[0] ?? null);
      setLoading(false);
      advance();
    });
    return () => {
      alive = false;
      battle.current?.destroy();
      battle.current = null;
      stopSpeaking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onAnswer = (correct: boolean, ms: number, picked: string) => {
    if (!question || ended.current) return;
    p.onActivity?.();
    const r = p.onAnswered(question, correct, ms, picked);
    setStreak(r.streak);
    battle.current?.answer(correct, r.streak);
    if (!correct) flash('The Glitches surge forward!');
    if (r.done) {
      setQuestion(null);
      battle.current?.finale();
      return;
    }
    advance();
  };

  const choose = (k: TowerKind) => {
    setSelected(k);
    battle.current?.select(k);
    p.onActivity?.();
  };

  const concept = question && getConcept(question.conceptId);

  return (
    <div className="flex min-h-dvh flex-col bg-slate-950 text-white">
      <header className="flex items-center gap-3 border-b border-white/10 px-3 py-2 text-sm">
        <button onClick={() => setConfirmRetreat(true)} className="rounded-lg px-2 py-1 text-white/70 hover:bg-white/10" aria-label="Leave battle">
          ✕
        </button>
        <div className="min-w-0">
          <div className="truncate font-display font-semibold">{p.title}</div>
          <div className="truncate text-xs text-white/50">{p.subtitle ?? concept?.name}</div>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1.5 whitespace-nowrap font-bold tabular-nums sm:gap-4">
          <span className="rounded-full bg-amber-400/20 px-2.5 py-1 text-amber-300 sm:px-3" title="Energy">
            ⚡ {hud?.energy ?? 0}
          </span>
          <span className="text-xs sm:text-sm" title="Castle hearts" aria-label={`${hud?.hearts ?? 3} hearts`}>
            {Array.from({ length: hud?.maxHearts ?? 3 }, (_, i) => (i < (hud?.hearts ?? 3) ? '❤️' : '🖤')).join('')}
          </span>
          {p.progress ? (
            <span className="hidden items-center gap-2 text-xs text-white/70 sm:flex" title={p.progress.label}>
              <T en={p.progress.label} />
              <span className="h-2 w-24 overflow-hidden rounded-full bg-white/15">
                <span className="block h-full bg-gradient-to-r from-amber-300 to-pink-400 transition-all" style={{ width: `${(p.progress.value / p.progress.max) * 100}%` }} />
              </span>
            </span>
          ) : (
            <span className="hidden text-white/70 sm:inline" title="Glitches defeated">
              👾 {hud?.defeated ?? 0}/{hud?.total ?? '?'}
            </span>
          )}
          <span className="rounded-full bg-white/10 px-2.5 py-1 sm:px-3" title="Answer streak">
            🔥 {streak}
          </span>
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:flex-row">
        <div className="flex flex-col lg:flex-1">
          <div className="relative">
            <div ref={canvasRef} className="mx-auto aspect-video w-full bg-slate-900 lg:max-w-[calc((100dvh-8.5rem)*16/9)]" />
            {loading && (
              <div className="absolute inset-0 grid place-items-center text-white/60">
                <T en="Summoning the battlefield…" />
              </div>
            )}
            {hud?.bossHp != null && (
              <div className="absolute left-1/2 top-2 w-2/3 -translate-x-1/2">
                <div className="h-3 overflow-hidden rounded-full bg-black/50 ring-1 ring-red-400">
                  <div className="h-full bg-gradient-to-r from-red-600 to-orange-400 transition-all" style={{ width: `${(hud.bossHp / (hud.bossMaxHp || 1)) * 100}%` }} />
                </div>
              </div>
            )}
            {toast && (
              <div className="pointer-events-none absolute left-1/2 top-8 -translate-x-1/2 animate-pop whitespace-nowrap rounded-2xl bg-black/70 px-4 py-2 text-center text-sm font-bold">
                <TB en={toast} />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto border-y border-white/10 bg-slate-900 px-3 py-2">
            {towers.map((k) => {
              const t = TOWERS[k];
              const afford = (hud?.energy ?? 0) >= t.cost;
              return (
                <button
                  key={k}
                  onClick={() => choose(k)}
                  className={cx(
                    'flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 ring-2 transition',
                    selected === k ? 'bg-amber-400/20 ring-amber-400' : 'bg-white/5 ring-white/10 hover:ring-white/30',
                    !afford && 'opacity-50',
                  )}
                  title={`${tr(lang, t.name)}: ${t.blurb} (➶${t.ammo})`}
                >
                  <span className="text-3xl leading-none">{t.glyph}</span>
                  <span className="text-left text-xs">
                    <span className="block font-bold">
                      <TB en={t.name} />
                    </span>
                    <span className="text-amber-300">⚡{t.cost}</span> <span className="text-sky-300">➶{t.ammo}</span>
                  </span>
                </button>
              );
            })}
            <p className="ml-2 hidden text-xs text-white/50 xl:block">
              <T en="Tap a square to build · tap a tower to upgrade · correct answers reload ➶ ammo" />
            </p>
          </div>
          {p.hint && hud && hud.towersOnField === 0 && (
            <p className="bg-indigo-900/60 px-3 py-2 text-center text-sm text-indigo-100">
              💡 <T en={p.hint} />
            </p>
          )}
        </div>

        <aside className="border-t border-white/10 bg-slate-100 p-4 text-slate-900 lg:w-[440px] lg:border-l lg:border-t-0 dark:bg-slate-900 dark:text-slate-100">
          {question ? (
            <>
              <QuestionCard question={question} onAnswer={onAnswer} compact wrongNote={p.wrongNote} glossary={p.glossary ? p.glossary(question) : true} />
              <p className="mt-4 hidden text-xs text-slate-500 lg:block">
                <T en="Keyboard: 1–4 to answer" />
                {question.audio ? <T en=" · R to replay" /> : null}
              </p>
            </>
          ) : (
            !loading && (
              <p className="text-center text-slate-500">
                <T en="Hold the line — finish off the Glitches!" />
              </p>
            )
          )}
        </aside>
      </div>

      <Modal open={confirmRetreat} onClose={() => setConfirmRetreat(false)} title={tr(lang, 'Leave the battle?')}>
        <div className="text-sm text-slate-600 dark:text-slate-300">
          <T en={p.retreatText ?? 'Your answers so far are saved and still count.'} />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmRetreat(false)}>
            <TB en="Keep fighting" />
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setConfirmRetreat(false);
              end(false, true);
            }}
          >
            <TB en="Leave" />
          </Button>
        </div>
      </Modal>
    </div>
  );
}
