/**
 * Game modes. Every mode runs on the same learning loop (a question, an answer, a consequence),
 * so the adaptive engine doesn't care which one is on screen. Each mode suits different content:
 * fast, short answers → Runner; calm reading and listening → Duel; maths and logic → Knight's Quest;
 * grammar → Castle Defense.
 */

export type GameMode = 'defense' | 'runner' | 'knight' | 'duel';

export const MODES: Record<GameMode, { name: string; emoji: string; blurb: string }> = {
  defense: { name: 'Castle Defense', emoji: '🏰', blurb: 'Answers power your chess towers.' },
  runner: { name: 'Word Runner', emoji: '🏃', blurb: 'Steer into the right gate before it reaches you!' },
  knight: { name: "Knight's Quest", emoji: '♞', blurb: 'Every right answer earns a knight move. Hunt the Glitch king.' },
  duel: { name: 'Boss Duel', emoji: '⚔️', blurb: 'Turn-based duel — take your time, every answer is an attack.' },
};

/** The best-suited mode for a mission's concepts (the kid can still pick another one). */
export function modeFor(conceptIds: string[], kind: 'learn' | 'review' | 'boss' = 'learn'): GameMode {
  if (kind === 'boss') return 'duel';
  const votes: Record<GameMode, number> = { defense: 0, runner: 0, knight: 0, duel: 0 };
  for (const id of conceptIds) {
    if (id.startsWith('en.reading') || id.startsWith('en.listening.details') || id.startsWith('en.listening.main') || id.startsWith('lit.')) votes.duel++;
    else if (id.startsWith('en.vocab') || id.startsWith('custom.') || id.startsWith('en.listening.numbers')) votes.runner++;
    else if (id.startsWith('math.') || id.startsWith('logic.')) votes.knight++;
    else votes.defense++;
  }
  return (Object.entries(votes) as [GameMode, number][]).sort((a, b) => b[1] - a[1])[0][0];
}

// ── Boss Duel ───────────────────────────────────────────────────
export type DuelEvent =
  | { type: 'attack'; damage: number; crit: boolean; ultimate: boolean }
  | { type: 'hurt'; damage: number }
  | { type: 'bossDown'; wave: number }
  | { type: 'end'; victory: boolean };

export interface DuelConfig {
  bossHp: number;
  heroHp?: number;
  /** Placement trial: the hero can't fall. */
  noDefeat?: boolean;
  /** Placement trial: a new boss appears when one falls, until the challenges are done. */
  endless?: boolean;
}

export const BOSS_HIT = 20;
export const BOSS_ENRAGED_HIT = 25;

export class DuelSim {
  bossHp: number;
  bossMax: number;
  heroHp: number;
  readonly heroMax: number;
  wave = 1;
  status: 'playing' | 'won' | 'lost' = 'playing';

  constructor(readonly cfg: DuelConfig) {
    this.bossHp = this.bossMax = cfg.bossHp;
    this.heroHp = this.heroMax = cfg.heroHp ?? 100;
  }

  get enraged() {
    return this.bossHp <= this.bossMax * 0.3;
  }

  /** A correct answer is an attack (harder questions and streaks hit harder); a wrong one lets the boss strike. */
  answer(correct: boolean, streak: number, difficulty = 3): DuelEvent[] {
    if (this.status !== 'playing') return [];
    const out: DuelEvent[] = [];
    if (correct) {
      const ultimate = streak > 0 && streak % 5 === 0;
      const crit = !ultimate && streak >= 3;
      const damage = Math.round((10 + difficulty * 2) * (ultimate ? 3 : crit ? 1.5 : 1));
      this.bossHp = Math.max(0, this.bossHp - damage);
      out.push({ type: 'attack', damage, crit, ultimate });
      if (this.bossHp === 0) {
        out.push({ type: 'bossDown', wave: this.wave });
        if (this.cfg.endless) {
          this.wave++;
          this.bossMax = Math.round(this.bossMax * 1.1);
          this.bossHp = this.bossMax;
        } else {
          this.status = 'won';
          out.push({ type: 'end', victory: true });
        }
      }
    } else {
      const damage = this.enraged ? BOSS_ENRAGED_HIT : BOSS_HIT;
      this.heroHp = Math.max(this.cfg.noDefeat ? 1 : 0, this.heroHp - damage);
      out.push({ type: 'hurt', damage });
      if (this.heroHp === 0) {
        this.status = 'lost';
        out.push({ type: 'end', victory: false });
      }
    }
    return out;
  }

  finale(): DuelEvent[] {
    if (this.status !== 'playing') return [];
    this.bossHp = 0;
    this.status = 'won';
    return [{ type: 'bossDown', wave: this.wave }, { type: 'end', victory: true }];
  }
}

/** Boss health sized so a mission lasts about its planned length (~3.5 correct answers a minute). */
export const duelConfigFor = (minutes: number): DuelConfig => ({ bossHp: Math.max(60, Math.round(minutes * 3.5 * 16)) });

// ── Word Runner ─────────────────────────────────────────────────
export interface RunnerConfig {
  /** Gates to pass to finish the run. */
  gates: number;
  hearts?: number;
  noDefeat?: boolean;
  /** Placement trial: the run goes on until the challenges are done. */
  endless?: boolean;
  /** >1 gives more time per gate. */
  pace?: number;
}

export class RunnerSim {
  passed = 0;
  hearts: number;
  readonly maxHearts: number;
  combo = 0;
  score = 0;
  status: 'playing' | 'won' | 'lost' = 'playing';

  constructor(readonly cfg: RunnerConfig) {
    this.hearts = this.maxHearts = cfg.hearts ?? 3;
  }

  /** Milliseconds a gate takes to arrive: enough time to read the prompt and the options. */
  gateTime(promptChars: number, optionChars: number) {
    const base = 3500 + promptChars * 45 + optionChars * 25;
    return Math.round(Math.min(14_000, Math.max(5500, base)) * (this.cfg.pace ?? 1));
  }

  pass(correct: boolean): 'gem' | 'crash' | 'finish' | 'fall' {
    if (this.status !== 'playing') return 'finish';
    this.passed++;
    if (correct) {
      this.combo++;
      this.score += 10 * Math.min(5, this.combo);
    } else {
      this.combo = 0;
      this.hearts = Math.max(this.cfg.noDefeat ? 1 : 0, this.hearts - 1);
      if (this.hearts === 0) {
        this.status = 'lost';
        return 'fall';
      }
    }
    if (!this.cfg.endless && this.passed >= this.cfg.gates) {
      this.status = 'won';
      return 'finish';
    }
    return correct ? 'gem' : 'crash';
  }

  finale() {
    if (this.status === 'playing') this.status = 'won';
  }
}

export const runnerConfigFor = (minutes: number): RunnerConfig => ({ gates: Math.max(8, Math.round(minutes * 5)) });

// ── Knight's Quest ──────────────────────────────────────────────
export interface Square {
  r: number;
  c: number;
}
export interface KnightPiece extends Square {
  id: number;
  kind: 'pawn' | 'king';
}

export interface KnightConfig {
  size?: number;
  pawns: number;
  hearts?: number;
  noDefeat?: boolean;
  /** Placement trial: a new wave appears after the king falls, until the challenges are done. */
  endless?: boolean;
  /** Most moves that can be banked (answer ahead, then plan several moves). */
  maxMoves?: number;
}

export type KnightEvent =
  | { type: 'capture'; piece: KnightPiece }
  | { type: 'kingFalls'; wave: number }
  | { type: 'advance'; piece: KnightPiece }
  | { type: 'attacked'; piece: KnightPiece }
  | { type: 'end'; victory: boolean };

const JUMPS = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]];
const dist = (a: Square, b: Square) => Math.max(Math.abs(a.r - b.r), Math.abs(a.c - b.c));

export class KnightSim {
  readonly size: number;
  knight: Square;
  pieces: KnightPiece[] = [];
  moves = 1; // one free move to start
  hearts: number;
  readonly maxHearts: number;
  captured = 0;
  wave = 1;
  status: 'playing' | 'won' | 'lost' = 'playing';
  private nextId = 1;

  constructor(
    readonly cfg: KnightConfig,
    private rand: () => number = Math.random,
  ) {
    this.size = cfg.size ?? 6;
    this.hearts = this.maxHearts = cfg.hearts ?? 3;
    this.knight = { r: this.size - 1, c: 1 };
    this.spawnWave();
  }

  private free(sq: Square) {
    return !(sq.r === this.knight.r && sq.c === this.knight.c) && !this.pieces.some((p) => p.r === sq.r && p.c === sq.c);
  }

  private randomSquare(minDist: number): Square {
    for (let i = 0; i < 200; i++) {
      const sq = { r: Math.floor(this.rand() * this.size), c: Math.floor(this.rand() * this.size) };
      if (this.free(sq) && dist(sq, this.knight) >= minDist) return sq;
    }
    for (let r = 0; r < this.size; r++) for (let c = 0; c < this.size; c++) if (this.free({ r, c })) return { r, c };
    return { r: 0, c: 0 };
  }

  private spawnWave() {
    for (let i = 0; i < this.cfg.pawns; i++) this.pieces.push({ id: this.nextId++, kind: 'pawn', ...this.randomSquare(2) });
    this.pieces.push({ id: this.nextId++, kind: 'king', ...this.randomSquare(3) });
  }

  get pawnsLeft() {
    return this.pieces.filter((p) => p.kind === 'pawn').length;
  }

  /** The king is shielded until every Glitch pawn is captured. */
  get kingOpen() {
    return this.pawnsLeft === 0;
  }

  legalMoves(): Square[] {
    if (this.status !== 'playing') return [];
    return JUMPS.map(([dr, dc]) => ({ r: this.knight.r + dr, c: this.knight.c + dc })).filter((sq) => {
      if (sq.r < 0 || sq.c < 0 || sq.r >= this.size || sq.c >= this.size) return false;
      const occupant = this.pieces.find((p) => p.r === sq.r && p.c === sq.c);
      return !occupant || occupant.kind === 'pawn' || this.kingOpen;
    });
  }

  /** A correct answer earns a move. */
  grantMove() {
    if (this.status === 'playing') this.moves = Math.min(this.cfg.maxMoves ?? 3, this.moves + 1);
  }

  move(to: Square): KnightEvent[] {
    if (this.moves <= 0 || !this.legalMoves().some((s) => s.r === to.r && s.c === to.c)) return [];
    this.moves--;
    this.knight = { r: to.r, c: to.c };
    const out: KnightEvent[] = [];
    const hit = this.pieces.find((p) => p.r === to.r && p.c === to.c);
    if (hit) {
      this.pieces = this.pieces.filter((p) => p !== hit);
      this.captured++;
      out.push({ type: 'capture', piece: hit });
      if (hit.kind === 'king') {
        out.push({ type: 'kingFalls', wave: this.wave });
        if (this.cfg.endless) {
          this.wave++;
          this.pieces = [];
          this.spawnWave();
        } else {
          this.status = 'won';
          out.push({ type: 'end', victory: true });
        }
      }
    }
    return out;
  }

  /** A wrong answer: the nearest Glitch pawn steps toward the knight; if it reaches it, the knight is hurt. */
  enemyTurn(): KnightEvent[] {
    if (this.status !== 'playing') return [];
    const pawns = this.pieces.filter((p) => p.kind === 'pawn');
    const mover = pawns.sort((a, b) => dist(a, this.knight) - dist(b, this.knight))[0] ?? this.pieces.find((p) => p.kind === 'king');
    if (!mover) return [];
    const out: KnightEvent[] = [];
    const step = { r: mover.r + Math.sign(this.knight.r - mover.r), c: mover.c + Math.sign(this.knight.c - mover.c) };
    if (step.r === this.knight.r && step.c === this.knight.c) {
      // Already adjacent: it strikes, then retreats to a far square.
      this.hearts = Math.max(this.cfg.noDefeat ? 1 : 0, this.hearts - 1);
      out.push({ type: 'attacked', piece: mover });
      Object.assign(mover, this.randomSquare(3));
      if (this.hearts === 0) {
        this.status = 'lost';
        out.push({ type: 'end', victory: false });
      }
    } else if (this.free(step)) {
      mover.r = step.r;
      mover.c = step.c;
      out.push({ type: 'advance', piece: mover });
    }
    return out;
  }

  finale(): KnightEvent[] {
    if (this.status !== 'playing') return [];
    this.status = 'won';
    return [{ type: 'end', victory: true }];
  }
}

export const knightConfigFor = (minutes: number): KnightConfig => ({ pawns: Math.max(3, Math.round(minutes * 0.8)) });
