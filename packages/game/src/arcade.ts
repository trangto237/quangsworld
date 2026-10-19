/**
 * Arcade modes: Sentence Sprint, Meteor Defense, Penalty Shootout, Grand Prix and Word Detective.
 * Like the other modes, each is a pure simulation driven by right/wrong answers, so it can be tested
 * without a browser; the React arenas only draw it.
 */

// ── Comeback cards (shared) ─────────────────────────────────────
export type ComebackCardId = 'heal' | 'double' | 'shield' | 'freeze' | 'repair' | 'queen';

export interface ComebackCard {
  id: ComebackCardId;
  emoji: string;
  name: string;
  blurb: string;
}

export const COMEBACK_CARDS: Record<ComebackCardId, ComebackCard> = {
  heal: { id: 'heal', emoji: '💚', name: 'Second Wind', blurb: 'Heal 40 HP.' },
  double: { id: 'double', emoji: '⚡', name: 'Power Surge', blurb: 'Your next attack hits twice as hard.' },
  shield: { id: 'shield', emoji: '🛡️', name: 'Iron Guard', blurb: 'Block the next hit completely.' },
  freeze: { id: 'freeze', emoji: '❄️', name: 'Frost Bomb', blurb: 'Freeze every Glitch for 8 seconds.' },
  repair: { id: 'repair', emoji: '🧱', name: 'Castle Repair', blurb: 'Win back one castle heart.' },
  queen: { id: 'queen', emoji: '♛', name: 'Rare Queen', blurb: 'A free Queen Storm tower joins the most dangerous lane.' },
};

/**
 * Offers a comeback card after 3 right answers in a row while losing — so a struggling
 * learner who starts getting answers right gets back into the fight. At most `max` per game.
 */
export class ComebackTracker {
  card: ComebackCard | null = null;
  given = 0;
  private sinceOffer = 0;

  constructor(
    private deck: ComebackCardId[],
    private max = 2,
  ) {}

  /** Call after every answer. Returns the card when one is newly offered. */
  check(correct: boolean, streak: number, losing: boolean): ComebackCard | null {
    this.sinceOffer = correct ? this.sinceOffer + 1 : 0;
    if (this.card || this.given >= this.max || !losing || streak < 3 || this.sinceOffer < 3) return null;
    this.card = COMEBACK_CARDS[this.deck[this.given % this.deck.length]];
    this.given++;
    this.sinceOffer = 0;
    return this.card;
  }

  /** Takes the held card (to play it). */
  take(): ComebackCard | null {
    const c = this.card;
    this.card = null;
    return c;
  }
}

type Status = 'playing' | 'won' | 'lost';

// ── 🧩 Sentence Sprint ──────────────────────────────────────────
export interface SprintConfig {
  /** Sentences to finish the tower. */
  goal: number;
  hearts?: number;
  noDefeat?: boolean;
  endless?: boolean;
}

/**
 * Build sentences against the clock. Each right sentence adds a floor to the tower (the rocket
 * launches when it's complete); faster sentences score more. A wrong sentence or time-out costs a heart.
 */
export class SprintSim {
  floors = 0;
  score = 0;
  hearts: number;
  readonly maxHearts: number;
  status: Status = 'playing';

  constructor(readonly cfg: SprintConfig) {
    this.hearts = this.maxHearts = cfg.hearts ?? 3;
  }

  /** Time for one sentence: generous, since reading the tiles takes a while. */
  timeFor(words: number) {
    return Math.round(Math.min(60_000, 9_000 + words * 3_500));
  }

  /** `left`: fraction of the time still left (0…1); speed earns a bonus. */
  answer(correct: boolean, left = 0): 'floor' | 'crack' | 'launch' | 'fall' {
    if (this.status !== 'playing') return 'launch';
    if (correct) {
      this.floors++;
      this.score += 100 + Math.round(100 * Math.max(0, Math.min(1, left)));
      if (!this.cfg.endless && this.floors >= this.cfg.goal) {
        this.status = 'won';
        return 'launch';
      }
      return 'floor';
    }
    this.hearts = Math.max(this.cfg.noDefeat ? 1 : 0, this.hearts - 1);
    if (this.hearts === 0) {
      this.status = 'lost';
      return 'fall';
    }
    return 'crack';
  }

  finale() {
    if (this.status === 'playing') this.status = 'won';
  }
}

export const sprintConfigFor = (minutes: number): SprintConfig => ({ goal: Math.max(5, Math.round(minutes * 1.6)) });

// ── ☄️ Meteor Defense ───────────────────────────────────────────
export interface MeteorConfig {
  /** Meteor showers to survive. */
  waves: number;
  /** City buildings (one is lost per hit). */
  buildings?: number;
  noDefeat?: boolean;
  endless?: boolean;
  /** >1 gives more time per shower. */
  pace?: number;
}

/**
 * A shower of answer-meteors falls on the city. Blast the right one and the chain reaction clears
 * the sky; a wrong blast or a meteor that lands destroys a building. 3 in a row raise a shield that
 * stops the next hit.
 */
export class MeteorSim {
  wave = 0;
  buildings: boolean[];
  shield = false;
  score = 0;
  combo = 0;
  status: Status = 'playing';

  constructor(readonly cfg: MeteorConfig) {
    this.buildings = Array.from({ length: cfg.buildings ?? 5 }, () => true);
  }

  get standing() {
    return this.buildings.filter(Boolean).length;
  }

  fallTime(promptChars: number, optionChars: number) {
    const base = 4500 + promptChars * 45 + optionChars * 30;
    return Math.round(Math.min(16_000, Math.max(6_500, base)) * (this.cfg.pace ?? 1));
  }

  /** The shower ends: right blast, wrong blast or landed. Returns which building was hit (or -1). */
  resolve(correct: boolean): { hit: number; shielded: boolean; end?: 'won' | 'lost' } {
    if (this.status !== 'playing') return { hit: -1, shielded: false };
    this.wave++;
    let hit = -1;
    let shielded = false;
    if (correct) {
      this.combo++;
      this.score += 50 * Math.min(4, this.combo);
      if (this.combo % 3 === 0) this.shield = true;
    } else {
      this.combo = 0;
      if (this.shield) {
        this.shield = false;
        shielded = true;
      } else {
        const alive = this.buildings.map((b, i) => (b ? i : -1)).filter((i) => i >= 0);
        if (alive.length > (this.cfg.noDefeat ? 1 : 0)) {
          hit = alive[Math.floor(alive.length / 2)];
          this.buildings[hit] = false;
        }
      }
    }
    if (this.standing === 0) {
      this.status = 'lost';
      return { hit, shielded, end: 'lost' };
    }
    if (!this.cfg.endless && this.wave >= this.cfg.waves) {
      this.status = 'won';
      return { hit, shielded, end: 'won' };
    }
    return { hit, shielded };
  }

  finale() {
    if (this.status === 'playing') this.status = 'won';
  }
}

export const meteorConfigFor = (minutes: number): MeteorConfig => ({ waves: Math.max(8, Math.round(minutes * 4.5)) });

// ── ⚽ Penalty Shootout ─────────────────────────────────────────
export interface PenaltyConfig {
  /** Kicks per team in regulation (then sudden death). */
  kicks: number;
  noDefeat?: boolean;
  endless?: boolean;
}

export type PenaltyTurn = 'shoot' | 'save';

export interface PenaltyKick {
  team: 'you' | 'rival';
  scored: boolean;
}

/**
 * Teams alternate: you shoot (right answer = goal), then the rival shoots (right answer = you save).
 * After the regulation kicks, it's sudden death until one team leads after a pair of kicks — or as
 * soon as a team can no longer be caught.
 */
export class PenaltySim {
  kicks: PenaltyKick[] = [];
  status: Status = 'playing';

  constructor(readonly cfg: PenaltyConfig) {}

  get you() {
    return this.kicks.filter((k) => k.team === 'you' && k.scored).length;
  }
  get rival() {
    return this.kicks.filter((k) => k.team === 'rival' && k.scored).length;
  }
  get taken() {
    return { you: this.kicks.filter((k) => k.team === 'you').length, rival: this.kicks.filter((k) => k.team === 'rival').length };
  }
  get turn(): PenaltyTurn {
    const t = this.taken;
    return t.you <= t.rival ? 'shoot' : 'save';
  }
  get suddenDeath() {
    return this.taken.rival >= this.cfg.kicks;
  }

  /** Answer the current kick: shooting → goal on a right answer; keeping → save on a right answer. */
  answer(correct: boolean): { kick: PenaltyKick; end?: 'won' | 'lost' } {
    const turn = this.turn;
    const kick: PenaltyKick = turn === 'shoot' ? { team: 'you', scored: correct } : { team: 'rival', scored: !correct };
    if (this.status !== 'playing') return { kick };
    this.kicks.push(kick);
    const end = this.decide();
    return end ? { kick, end } : { kick };
  }

  private decide(): 'won' | 'lost' | undefined {
    if (this.cfg.endless) return undefined;
    const { you: ty, rival: tr } = this.taken;
    const n = this.cfg.kicks;
    if (ty <= n && tr <= n) {
      // Regulation: stop early when one team can't be caught.
      const youLeft = n - ty;
      const rivalLeft = n - tr;
      if (this.you > this.rival + rivalLeft) return this.finish('won');
      if (this.rival > this.you + youLeft) return this.finish(this.cfg.noDefeat ? undefined : 'lost');
      if (ty === n && tr === n && this.you !== this.rival) return this.finish(this.you > this.rival ? 'won' : this.cfg.noDefeat ? undefined : 'lost');
      return undefined;
    }
    // Sudden death: decided after each complete pair.
    if (ty === tr && this.you !== this.rival) return this.finish(this.you > this.rival ? 'won' : this.cfg.noDefeat ? undefined : 'lost');
    return undefined;
  }

  private finish(r: 'won' | 'lost' | undefined) {
    if (r) this.status = r;
    return r;
  }

  finale() {
    if (this.status === 'playing') this.status = 'won';
  }
}

export const penaltyConfigFor = (minutes: number): PenaltyConfig => ({ kicks: Math.max(3, Math.min(10, Math.round(minutes * 0.9))) });

// ── 🏎️ Grand Prix ───────────────────────────────────────────────
export interface RaceConfig {
  /** Distance to the finish line (a right answer is worth about 1.6). */
  length: number;
  rivals?: number;
  noDefeat?: boolean;
  endless?: boolean;
}

export interface Racer {
  name: string;
  car: string;
  pos: number;
  finished: number; // finishing order, 0 = still racing
  /** Rival pace per answer. */
  pace: number;
}

export type RaceEvent = 'boost' | 'nitro' | 'slipstream' | 'spin';

/**
 * A right answer boosts you, 3 in a row fires nitro, a wrong one spins you out. Rivals drive at their
 * own pace on every answer. Far behind? Slipstream gives an extra push on right answers (comeback).
 * A podium finish (top 3) counts as a win.
 */
export class RaceSim {
  you: Racer;
  rivals: Racer[];
  status: Status = 'playing';
  private finishers = 0;

  constructor(
    readonly cfg: RaceConfig,
    private rand: () => number = Math.random,
  ) {
    this.you = { name: 'You', car: '🏎️', pos: 0, finished: 0, pace: 0 };
    const names = [
      ['Turbo Tiger', '🚙'],
      ['Glitch GT', '🚓'],
      ['Rook Rocket', '🚕'],
      ['Bishop Blaze', '🛻'],
    ];
    this.rivals = names.slice(0, cfg.rivals ?? 3).map(([name, car], i) => ({ name, car, pos: 0, finished: 0, pace: 0.95 + i * 0.12 }));
  }

  get racers() {
    return [this.you, ...this.rivals];
  }

  /** 1 = leading. */
  get place() {
    if (this.you.finished) return this.you.finished;
    return 1 + this.rivals.filter((r) => r.finished || r.pos > this.you.pos).length;
  }

  get leader() {
    return Math.max(...this.racers.map((r) => r.pos));
  }

  answer(correct: boolean, streak: number): { events: RaceEvent[]; end?: 'won' | 'lost' } {
    if (this.status !== 'playing') return { events: [] };
    const events: RaceEvent[] = [];
    const behind = this.leader - this.you.pos;
    let move = 0.2;
    if (correct) {
      move = 1.6;
      events.push('boost');
      if (streak > 0 && streak % 3 === 0) {
        move += 1.2;
        events.push('nitro');
      }
      if (behind > 2) {
        move += Math.min(1.5, behind * 0.35);
        events.push('slipstream');
      }
    } else events.push('spin');
    this.you.pos += move;
    for (const r of this.rivals) if (!r.finished) r.pos += r.pace * (0.8 + this.rand() * 0.4);
    // Finishing order: whoever is furthest over the line this turn finishes first.
    const crossing = this.racers.filter((r) => !r.finished && r.pos >= this.cfg.length).sort((a, b) => b.pos - a.pos);
    for (const r of crossing) r.finished = ++this.finishers;
    if (!this.cfg.endless) {
      if (this.you.finished) {
        this.status = this.you.finished <= 3 || this.cfg.noDefeat ? 'won' : 'lost';
        return { events, end: this.status };
      }
      if (this.finishers >= 3 && !this.cfg.noDefeat) {
        this.status = 'lost';
        return { events, end: 'lost' };
      }
    } else if (this.leader >= this.cfg.length) {
      // Trial: another lap.
      for (const r of this.racers) {
        r.pos = Math.max(0, r.pos - this.cfg.length);
        r.finished = 0;
      }
      this.finishers = 0;
    }
    return { events };
  }

  finale() {
    if (this.status === 'playing') this.status = 'won';
  }
}

export const raceConfigFor = (minutes: number): RaceConfig => ({ length: Math.max(10, Math.round(minutes * 4.2)) });

// ── 🕵️ Word Detective ──────────────────────────────────────────
export interface Suspect {
  id: number;
  name: string;
  emoji: string;
  hat: string;
  pet: string;
  place: string;
  cleared: boolean;
}

export interface DetectiveCase {
  title: string;
  crime: string;
  suspects: Suspect[];
  culprit: number;
  clues: string[];
  /** Wrong answers and hints in this case. */
  slips: number;
  solved: boolean;
  cold: boolean;
}

export interface DetectiveConfig {
  cases: number;
  noDefeat?: boolean;
  endless?: boolean;
}

const NAMES: [string, string][] = [
  ['Captain Lan', '👩‍✈️'],
  ['Chef Minh', '👨‍🍳'],
  ['Professor Hoa', '👩‍🏫'],
  ['Farmer Tuấn', '👨‍🌾'],
  ['Doctor Mai', '👩‍⚕️'],
  ['Artist Khoa', '👨‍🎨'],
  ['Pilot Linh', '🧑‍✈️'],
  ['Singer Bảo', '🧑‍🎤'],
];
const HATS = ['a red cap', 'a straw hat', 'a blue helmet', 'no hat'];
const PETS = ['a cat', 'a parrot', 'a dog', 'a goldfish'];
const PLACES = ['the library', 'the market', 'the cinema', 'the bus station', 'the park', 'the museum'];
const CRIMES: [string, string][] = [
  ['The Missing Chess Queen', "The golden queen from the school chess set has disappeared."],
  ['The Stolen Recipe', "Grandma's secret phở recipe was taken from the kitchen."],
  ['The Broken Lantern', 'The biggest lantern at the Mid-Autumn festival was smashed.'],
  ['The Vanished Trophy', "The football club's trophy is gone from the cabinet."],
  ['The Mystery of the Muddy Shoes', 'Someone walked mud all over the new classroom floor.'],
  ['The Lost Dragon Kite', 'The prize-winning dragon kite was stolen before the contest.'],
];

/**
 * Each case has 4 suspects. Every right answer reveals a clue that clears one innocent suspect;
 * when only one is left, you accuse them and the case is solved. Wrong answers and hints are
 * "slips": fewer slips, more stars. 5 slips in a case and the trail goes cold.
 */
export class DetectiveSim {
  cases: DetectiveCase[] = [];
  current = 0;
  status: Status = 'playing';
  private nextCase = 0;

  constructor(
    readonly cfg: DetectiveConfig,
    private rand: () => number = Math.random,
  ) {
    this.cases.push(this.makeCase());
  }

  private pick<T>(a: readonly T[]): T {
    return a[Math.floor(this.rand() * a.length)];
  }

  private makeCase(): DetectiveCase {
    const [title, crime] = CRIMES[this.nextCase++ % CRIMES.length];
    const pool = [...NAMES].sort(() => this.rand() - 0.5).slice(0, 4);
    const hats = [...HATS].sort(() => this.rand() - 0.5);
    const pets = [...PETS].sort(() => this.rand() - 0.5);
    const suspects: Suspect[] = pool.map(([name, emoji], i) => ({ id: i, name, emoji, hat: hats[i], pet: pets[i], place: this.pick(PLACES), cleared: false }));
    return { title, crime, suspects, culprit: Math.floor(this.rand() * 4), clues: [], slips: 0, solved: false, cold: false };
  }

  get case(): DetectiveCase {
    return this.cases[this.current];
  }

  get solvedCount() {
    return this.cases.filter((c) => c.solved).length;
  }

  /** Stars for a case: 3 with no slips, 2 with up to 2, 1 otherwise. */
  stars(c: DetectiveCase = this.case) {
    return c.slips === 0 ? 3 : c.slips <= 2 ? 2 : 1;
  }

  get remaining() {
    return this.case.suspects.filter((s) => !s.cleared);
  }

  /** Ready to accuse: only the culprit is left. */
  get readyToAccuse() {
    return this.remaining.length === 1;
  }

  /** A clue that clears one innocent suspect, worded as a short English sentence. */
  private clueFor(s: Suspect, culprit: Suspect): string {
    const kinds = [
      `A witness saw ${s.name} at ${s.place} all evening — ${s.name} is innocent.`,
      `The thief was wearing ${culprit.hat}. ${s.name} was wearing ${s.hat}.`,
      `Animal hairs at the scene came from ${culprit.pet}. ${s.name} has ${s.pet}.`,
    ];
    return kinds[this.case.clues.length % kinds.length];
  }

  answer(correct: boolean): { clue?: string; cold?: boolean } {
    if (this.status !== 'playing') return {};
    const c = this.case;
    if (!correct) {
      c.slips++;
      if (c.slips >= 5) {
        c.cold = true;
        return { cold: true };
      }
      return {};
    }
    if (this.readyToAccuse) return {};
    const culprit = c.suspects[c.culprit];
    const innocents = c.suspects.filter((s) => !s.cleared && s.id !== c.culprit);
    const s = innocents[Math.floor(this.rand() * innocents.length)];
    s.cleared = true;
    const clue = this.clueFor(s, culprit);
    c.clues.push(clue);
    return { clue };
  }

  hint() {
    if (this.status === 'playing') this.case.slips++;
  }

  /** Accuse a suspect (only when one is left, so it's always the culprit). */
  accuse(): { solved: boolean; end?: 'won' | 'lost' } {
    const c = this.case;
    if (!this.readyToAccuse || c.solved) return { solved: false };
    c.solved = true;
    return this.next();
  }

  /** After a solved or cold case: open the next one or finish. */
  next(): { solved: boolean; end?: 'won' | 'lost' } {
    const solved = this.case.solved;
    const done = this.cases.length;
    if (!this.cfg.endless && done >= this.cfg.cases) {
      this.status = this.solvedCount * 2 >= this.cfg.cases || this.cfg.noDefeat ? 'won' : 'lost';
      return { solved, end: this.status };
    }
    this.cases.push(this.makeCase());
    this.current++;
    return { solved };
  }

  finale() {
    if (this.status === 'playing') this.status = 'won';
  }
}

/** A case takes about 3 right answers plus a slip or two (~3.5 answers a minute). */
export const detectiveConfigFor = (minutes: number): DetectiveConfig => ({ cases: Math.max(2, Math.round(minutes * 0.6)) });
