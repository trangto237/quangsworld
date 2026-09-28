import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { StudentProfile } from '@atlas/db';
import { MissionSession, battleReward, levelFromXp } from '@atlas/engine';
import { TOWERS, battleConfigFor, loadBattle, type BattleController, type HudState, type TowerKind } from '@atlas/game';
import { getConcept, present, type PresentedQuestion } from '@atlas/knowledge';
import type { Mission } from '@atlas/shared';
import { dayKey } from '@atlas/shared';
import { Button, Modal, cx, useRepo } from '@atlas/ui';
import { QuestionCard } from '../components/QuestionCard';
import { ActiveTimer } from '../lib/activeTime';
import { doneKey, getEquipped } from '../lib/equipped';
import { stopSpeaking } from '../lib/speech';
import { useKid } from '../store';

const TOWER_ORDER: TowerKind[] = ['pawn', 'rook', 'knight', 'bishop', 'queen'];

/**
 * A mission = a lane battle. The kid never sees "exercise": every question answered
 * powers the towers (energy), and every mistake lets the Glitches surge forward.
 */
export function Battle({ student, mission, fromPlan }: { student: StudentProfile; mission: Mission; fromPlan: boolean }) {
  const repo = useRepo();
  const go = useKid((s) => s.go);
  const canvasRef = useRef<HTMLDivElement>(null);
  const battle = useRef<BattleController | null>(null);
  const timer = useRef<ActiveTimer | null>(null);
  const finished = useRef(false);
  const initialStates = useMemo(() => repo.getStates(student.id), [repo, student.id]);
  const session = useMemo(() => new MissionSession(mission, initialStates), [mission, initialStates]);
  const towers = useMemo(() => {
    const unlocked = repo.listUnlocks(student.id);
    return TOWER_ORDER.filter((k) => unlocked.includes(`tower.${k}`));
  }, [repo, student.id]);
  const [hud, setHud] = useState<HudState | null>(null);
  const [selected, setSelected] = useState<TowerKind | null>(towers[0] ?? null);
  const [question, setQuestion] = useState<PresentedQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmRetreat, setConfirmRetreat] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const nextQuestion = useCallback(() => {
    const q = session.next();
    setQuestion(q ? present(q) : null);
    if (q) battle.current?.setTimeScale(q.passage ? 0.45 : q.audio ? 0.7 : 1);
  }, [session]);

  const finish = useCallback(
    async (victory: boolean, retreated = false) => {
      if (finished.current) return;
      finished.current = true;
      stopSpeaking();
      battle.current?.pause(true);
      const activeMs = timer.current?.stop() ?? 0;
      const now = Date.now();
      const finalStates = session.finish(now);
      const reward = battleReward(mission, { victory, accuracy: session.accuracy, answered: session.answered, bestStreak: session.bestStreak });
      const wallet = repo.getWallet(student.id);
      await repo.completeMission(student.id, {
        states: Object.values(finalStates),
        session: { kind: 'mission', startedAt: timer.current?.startedAt ?? now, endedAt: now, activeMs, missionTitle: mission.title },
        reward,
      });
      if (fromPlan && (victory || session.answered >= 8)) {
        const key = doneKey(student.id, dayKey(now));
        await repo.setKv(key, [...new Set([...(repo.getKv<string[]>(key) ?? []), mission.id])]);
      }
      const masteryChanges = Object.keys(finalStates).map((cid) => ({ conceptId: cid, before: initialStates[cid]?.mastery ?? 30, after: finalStates[cid].mastery }));
      go({
        name: 'results',
        result: {
          mission,
          victory,
          retreated,
          answered: session.answered,
          correct: session.correct,
          bestStreak: session.bestStreak,
          reward,
          levelBefore: levelFromXp(wallet.xp).level,
          levelAfter: levelFromXp(wallet.xp + reward.xp).level,
          masteryChanges,
          missed: Object.entries(finalStates).filter(([, s]) => s.lastWrongAt >= (timer.current?.startedAt ?? now)).map(([cid]) => cid),
        },
      });
    },
    [fromPlan, go, initialStates, mission, repo, session, student.id],
  );

  useEffect(() => {
    let alive = true;
    timer.current = new ActiveTimer();
    const eq = getEquipped(repo, student.id);
    const avgMastery = mission.concepts.reduce((s, c) => s + (initialStates[c]?.mastery ?? 30), 0) / Math.max(1, mission.concepts.length);
    loadBattle().then(({ createBattle }) => {
      if (!alive || !canvasRef.current) return;
      battle.current = createBattle(canvasRef.current, {
        config: battleConfigFor(mission.duration, { towers, boss: mission.kind === 'boss', difficulty: mission.kind === 'boss' ? 1.5 : avgMastery > 70 ? 1.3 : 1 }),
        theme: eq.theme,
        skin: eq.skin,
        bossName: mission.title,
        onHud: setHud,
        onEvent: (e) => {
          if (e.type === 'strike') flash('♛ Checkmate Strike! 5 in a row!');
          if (e.type === 'baseHit') flash('A Glitch reached the castle!');
        },
        onEnd: (victory) => void finish(victory),
      });
      battle.current.select(towers[0] ?? null);
      setLoading(false);
      nextQuestion();
    });
    return () => {
      alive = false;
      battle.current?.destroy();
      battle.current = null;
      stopSpeaking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toastTimer = useRef<number>(0);
  const flash = (msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  };

  const onAnswer = async (correct: boolean, ms: number) => {
    if (!question || finished.current) return;
    timer.current?.poke();
    const state = session.answer(question, correct, ms);
    battle.current?.answer(correct, session.currentStreak);
    if (!correct) flash('The Glitches surge forward!');
    void repo.recordAnswer(
      { studentId: student.id, questionId: question.id, conceptId: question.conceptId, correct, difficulty: question.difficulty, msSpent: ms, context: mission.kind === 'review' ? 'review' : 'mission' },
      state,
    );
    nextQuestion();
  };

  const choose = (k: TowerKind) => {
    setSelected(k);
    battle.current?.select(k);
    timer.current?.poke();
  };

  const concept = question && getConcept(question.conceptId);

  return (
    <div className="flex min-h-dvh flex-col bg-slate-950 text-white">
      {/* HUD */}
      <header className="flex items-center gap-3 border-b border-white/10 px-3 py-2 text-sm">
        <button onClick={() => setConfirmRetreat(true)} className="rounded-lg px-2 py-1 text-white/70 hover:bg-white/10" aria-label="Retreat">
          ✕
        </button>
        <div className="min-w-0">
          <div className="truncate font-display font-semibold">{mission.title}</div>
          {concept && <div className="truncate text-xs text-white/50">{concept.name}</div>}
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1.5 whitespace-nowrap font-bold tabular-nums sm:gap-4">
          <span className="rounded-full bg-amber-400/20 px-2.5 py-1 text-amber-300 sm:px-3" title="Energy">
            ⚡ {hud?.energy ?? 0}
          </span>
          <span className="text-xs sm:text-sm" title="Castle hearts" aria-label={`${hud?.hearts ?? 3} hearts`}>
            {Array.from({ length: hud?.maxHearts ?? 3 }, (_, i) => (i < (hud?.hearts ?? 3) ? '❤️' : '🖤')).join('')}
          </span>
          <span className="hidden text-white/70 sm:inline" title="Enemies defeated">
            👾 {hud?.defeated ?? 0}/{hud?.total ?? '?'}
          </span>
          <span className="rounded-full bg-white/10 px-2.5 py-1 sm:px-3" title="Answer streak">
            🔥 {session.currentStreak}
          </span>
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Battlefield */}
        <div className="flex flex-col lg:flex-1">
          <div className="relative">
            <div ref={canvasRef} className="mx-auto aspect-video w-full bg-slate-900 lg:max-w-[calc((100dvh-8.5rem)*16/9)]" />
            {loading && <div className="absolute inset-0 grid place-items-center text-white/60">Summoning the battlefield…</div>}
            {hud?.bossHp != null && (
              <div className="absolute left-1/2 top-2 w-2/3 -translate-x-1/2">
                <div className="h-3 overflow-hidden rounded-full bg-black/50 ring-1 ring-red-400">
                  <div className="h-full bg-gradient-to-r from-red-600 to-orange-400 transition-all" style={{ width: `${(hud.bossHp / (hud.bossMaxHp || 1)) * 100}%` }} />
                </div>
              </div>
            )}
            {toast && (
              <div className="pointer-events-none absolute left-1/2 top-8 -translate-x-1/2 animate-pop rounded-full bg-black/70 px-4 py-2 text-sm font-bold">{toast}</div>
            )}
          </div>
          {/* Tower bar */}
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
                  title={`${t.name}: ${t.blurb}`}
                >
                  <span className="text-3xl leading-none">{t.glyph}</span>
                  <span className="text-left text-xs">
                    <span className="block font-bold">{t.name}</span>
                    <span className="text-amber-300">⚡{t.cost}</span>
                  </span>
                </button>
              );
            })}
            <p className="ml-2 hidden text-xs text-white/50 xl:block">Tap a square to build · tap a tower to upgrade</p>
          </div>
          {hud && hud.towersOnField === 0 && (
            <p className="bg-indigo-900/60 px-3 py-2 text-center text-sm text-indigo-100">
              💡 Answer challenges to earn ⚡ energy, then tap the board to build towers. Glitches arrive soon!
            </p>
          )}
        </div>

        {/* Question panel */}
        <aside className="border-t border-white/10 bg-slate-100 p-4 text-slate-900 lg:w-[440px] lg:border-l lg:border-t-0 dark:bg-slate-900 dark:text-slate-100">
          {question ? (
            <>
              <QuestionCard question={question} onAnswer={onAnswer} compact />
              <p className="mt-4 hidden text-xs text-slate-500 lg:block">Keyboard: 1–4 to answer{question.audio ? ' · R to replay' : ''}</p>
            </>
          ) : (
            !loading && <p className="text-center text-slate-500">No more challenges — finish the battle!</p>
          )}
        </aside>
      </div>

      <Modal open={confirmRetreat} onClose={() => setConfirmRetreat(false)} title="Retreat from battle?">
        <p className="text-sm text-slate-600 dark:text-slate-300">Your answers so far are saved and still count. You'll get a smaller reward.</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmRetreat(false)}>
            Keep fighting
          </Button>
          <Button variant="danger" onClick={() => void finish(false, true)}>
            Retreat
          </Button>
        </div>
      </Modal>
    </div>
  );
}
