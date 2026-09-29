import { useMemo, useRef } from 'react';
import type { StudentProfile } from '@atlas/db';
import { MissionSession, battleReward, historyFromAttempts, levelFromXp } from '@atlas/engine';
import { battleConfigFor, modeFor, type TowerKind } from '@atlas/game';
import { getQuestion, present } from '@atlas/knowledge';
import type { Mission } from '@atlas/shared';
import { DAY_MS, dayKey } from '@atlas/shared';
import { useRepo } from '@atlas/ui';
import { GameArena } from '../components/modes/GameArena';
import { ActiveTimer } from '../lib/activeTime';
import { doneKey, getEquipped } from '../lib/equipped';
import { useKid } from '../store';

const TOWER_ORDER: TowerKind[] = ['pawn', 'rook', 'knight', 'bishop', 'queen'];

/** A mission = a lane battle driven by the adaptive MissionSession. */
export function Battle({ student, mission, fromPlan }: { student: StudentProfile; mission: Mission; fromPlan: boolean }) {
  const repo = useRepo();
  const go = useKid((s) => s.go);
  const timer = useRef<ActiveTimer>(null as unknown as ActiveTimer);
  timer.current ??= new ActiveTimer();
  const setup = useMemo(() => {
    const states = repo.getStates(student.id);
    // Avoid anything answered in the last two weeks (placement included).
    const history = historyFromAttempts(repo.listAttempts(student.id, Date.now() - 14 * DAY_MS));
    const unlocked = repo.listUnlocks(student.id);
    const towers = TOWER_ORDER.filter((k) => unlocked.includes(`tower.${k}`));
    const avg = mission.concepts.reduce((s, c) => s + (states[c]?.mastery ?? 30), 0) / Math.max(1, mission.concepts.length);
    return {
      states,
      session: new MissionSession(mission, states, Math.random, history),
      eq: getEquipped(repo, student.id),
      config: battleConfigFor(mission.duration, { towers, boss: mission.kind === 'boss', difficulty: mission.kind === 'boss' ? 1.5 : avg > 70 ? 1.3 : 1 }),
    };
  }, [repo, student.id, mission]);

  const finish = async (victory: boolean, retreated: boolean) => {
    const { session, states } = setup;
    const activeMs = timer.current.stop();
    const now = Date.now();
    const finalStates = session.finish(now);
    const reward = battleReward(mission, { victory, accuracy: session.accuracy, answered: session.answered, bestStreak: session.bestStreak });
    const wallet = repo.getWallet(student.id);
    await repo.completeMission(student.id, {
      states: Object.values(finalStates),
      session: { kind: 'mission', startedAt: timer.current.startedAt, endedAt: now, activeMs, missionTitle: mission.title },
      reward,
    });
    if (fromPlan && (victory || session.answered >= 8)) {
      const key = doneKey(student.id, dayKey(now));
      await repo.setKv(key, [...new Set([...(repo.getKv<string[]>(key) ?? []), mission.id])]);
    }
    const mistakes = repo.listMistakes(student.id, { since: timer.current.startedAt });
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
        masteryChanges: Object.keys(finalStates).map((cid) => ({ conceptId: cid, before: states[cid]?.mastery ?? 30, after: finalStates[cid].mastery })),
        missed: [...new Set(mistakes.map((m) => m.conceptId))],
        mistakeIds: mistakes.map((m) => m.id),
      },
    });
  };

  return (
    <GameArena
      mode={mission.mode ?? modeFor(mission.concepts, mission.kind)}
      title={mission.title}
      minutes={mission.duration}
      avatar={student.avatar}
      bossName={mission.title}
      defense={{
        config: setup.config,
        theme: setup.eq.theme,
        skin: setup.eq.skin,
        hint: 'Answer challenges to earn ⚡ energy, then tap the board to build towers. Correct answers also reload their ammo!',
      }}
      wrongNote="📕 Saved — you'll review it after the battle"
      retreatText="Your answers so far are saved and still count. You'll get a smaller reward."
      onActivity={() => timer.current.poke()}
      nextQuestion={() => {
        const q = setup.session.next();
        return q ? present(q) : null;
      }}
      onAnswered={(q, correct, ms, picked) => {
        const state = setup.session.answer(q, correct, ms);
        void repo.recordAnswer(
          { studentId: student.id, questionId: q.id, conceptId: q.conceptId, correct, difficulty: q.difficulty, msSpent: ms, context: mission.kind === 'review' ? 'review' : 'mission' },
          state,
        );
        if (!correct) void repo.recordMistake(student.id, getQuestion(q.id) ?? q, picked);
        return { streak: setup.session.currentStreak };
      }}
      onEnd={(victory, retreated) => void finish(victory, retreated)}
    />
  );
}
