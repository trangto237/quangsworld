import { MODES, modeFor, type GameMode } from '@atlas/game';
import { worldOfConcept } from '@atlas/knowledge';
import type { Mission } from '@atlas/shared';
import type { Screen } from '../store';

/**
 * Every island has its own game, dressed to fit the place: bugs attack the plants in the Word Garden,
 * hot iron falls in the Grammar Forge, the Sound Temple is a temple run. The Arcade island is where he
 * can play any game he likes. (My Textbook keeps rotating games: it mixes every kind of content.)
 */

/** How a game looks on an island. Equipped shop scenery still wins where the game has some. */
export interface Dress {
  /** Background (Tailwind classes). */
  bg?: string;
  /** Boss Duel: the island's boss. */
  boss?: string;
  bossName?: string;
  /** Word Runner: road and roadside. */
  road?: string;
  decor?: string;
  /** Grand Prix: the hero's car, the track colour and the scenery behind it. */
  car?: string;
  track?: string;
  backdrop?: string;
  /** Meteor Defense re-dressed: what falls, what it threatens, what fires back. */
  falling?: {
    icons: string[];
    colors: string[];
    ground: string[];
    lost: string;
    groundClass: string;
    shooter: string;
    standing: string;
    hit: string;
    miss: string;
    held: string;
    radar: string;
    stars?: boolean;
  };
}

export interface IslandGame {
  mode: GameMode;
  name: string;
  emoji: string;
  blurb: string;
  dress?: Dress;
  /** Title when the game is lost. */
  loss?: string;
}

export const ISLAND_GAMES: Record<string, IslandGame> = {
  'word-forest': {
    mode: 'meteor',
    name: 'Pest Patrol',
    emoji: '🐛',
    blurb: 'Bugs crawl down to eat your plants — spray the one carrying the right word!',
    loss: 'The bugs ate too many plants…',
    dress: {
      bg: 'bg-gradient-to-b from-sky-500 via-sky-300 to-lime-200',
      falling: {
        icons: ['🐛', '🐞', '🦗', '🐌'],
        colors: ['#65a30d', '#dc2626', '#16a34a', '#a16207'],
        ground: ['🌻', '🥕', '🌽', '🍅', '🥬', '🌷'],
        lost: '🥀',
        groundClass: 'border-[#4d7c0f] bg-[#7a5230]',
        shooter: '💦',
        standing: '🪴',
        hit: '🫧 Bug sprayed!',
        miss: '🐛 A bug ate a plant!',
        held: '🛡️ The net held!',
        radar: '🔎 Spot the bug — answer to spray it',
      },
    },
  },
  'grammar-forge': {
    mode: 'meteor',
    name: 'Hot Iron',
    emoji: '🔨',
    blurb: 'Hot iron drops from the furnace — hammer the right one into a weapon before it lands!',
    loss: 'Too many weapons cracked…',
    dress: {
      bg: 'bg-gradient-to-b from-stone-950 via-red-950 to-orange-900',
      falling: {
        icons: ['🔥', '🔥', '🔥', '🔥'],
        colors: ['#f97316', '#facc15', '#ef4444', '#fb923c'],
        ground: ['🗡️', '🛡️', '🪓', '⚔️', '🏹', '🔱'],
        lost: '💨',
        groundClass: 'border-stone-600 bg-stone-800/90',
        shooter: '🔨',
        standing: '⚔️',
        hit: '🔨 Forged!',
        miss: '💥 A weapon cracked!',
        held: '🛡️ The anvil held!',
        radar: '🔥 Hot iron — answer to hammer it',
        stars: false,
      },
    },
  },
  'sound-temple': {
    mode: 'temple',
    name: 'Temple Run',
    emoji: '🛕',
    blurb: 'Sprint through the jungle temple. The path splits: swipe to the way with the right sound — the wrong way crumbles and you fall!',
    loss: 'You fell off the temple path…',
    dress: { bg: 'bg-gradient-to-b from-emerald-800 via-green-950 to-stone-950' },
  },
  'number-citadel': {
    mode: 'defense',
    name: 'Castle Defense',
    emoji: '🏰',
    blurb: 'Defend the citadel — right answers build and power your towers.',
  },
  'algebra-peaks': {
    mode: 'race',
    name: 'Mountain Rally',
    emoji: '🚙',
    blurb: 'Race up the mountain road — right answers boost, 3 in a row fire nitro!',
    dress: {
      bg: 'bg-gradient-to-b from-sky-700 via-slate-700 to-stone-900',
      car: '🚙',
      track: 'bg-[#7a6248]',
      backdrop: '⛰️ 🏔️ ⛰️ 🌲 🏔️ ⛰️',
    },
  },
  'geometry-isles': {
    mode: 'penalty',
    name: 'Beach Football',
    emoji: '⚽',
    blurb: 'A shootout on the island beach — find the right angle and score!',
    dress: { bg: 'bg-gradient-to-b from-sky-600 via-cyan-800 to-amber-900' },
  },
  'olympiad-spire': {
    mode: 'knight',
    name: 'Spire Chess',
    emoji: '🏆',
    blurb: 'No clock, just hard problems: every one you crack is a knight move toward the Glitch king.',
    dress: { bg: 'bg-gradient-to-b from-violet-950 via-indigo-950 to-slate-950' },
  },
  'logic-labyrinth': {
    mode: 'knight',
    name: "Knight's Labyrinth",
    emoji: '♞',
    blurb: 'Every right answer is a knight move on the chessboard — capture the Glitch pawns, then the king.',
  },
  'scholars-academy': {
    mode: 'knight',
    name: 'Academy Chess',
    emoji: '♟️',
    blurb: 'The academy chess club — right answers earn knight moves.',
    dress: { bg: 'bg-gradient-to-b from-teal-950 via-stone-950 to-slate-950' },
  },
  'reading-ruins': {
    mode: 'detective',
    name: 'Ruin Detective',
    emoji: '🕵️',
    blurb: 'Read the old tablets for clues and unmask who robbed the ruins.',
    dress: { bg: 'bg-gradient-to-b from-amber-950 via-stone-950 to-slate-950' },
  },
  'ielts-tower': {
    mode: 'duel',
    name: 'Tower Guardian',
    emoji: '🗿',
    blurb: 'The guardian of the tower blocks the stairs — every right answer is an attack.',
    dress: {
      bg: 'bg-gradient-to-b from-indigo-950 via-slate-950 to-slate-950',
      boss: '🗿',
      bossName: 'Tower Guardian',
    },
  },
  'echo-caves': {
    mode: 'duel',
    name: 'Bat King',
    emoji: '🦇',
    blurb: 'Listen closely and fight the Bat King of the caves.',
    dress: {
      bg: 'bg-gradient-to-b from-violet-950 via-slate-950 to-black',
      boss: '🦇',
      bossName: 'Bat King',
    },
  },
  'story-library': {
    mode: 'duel',
    name: 'Book Genie',
    emoji: '🧞',
    blurb: 'Every book hides a genie — beat it with what you read.',
    dress: {
      bg: 'bg-gradient-to-b from-rose-950 via-slate-950 to-slate-950',
      boss: '🧞',
      bossName: 'Book Genie',
    },
  },
};

/** The island a mission belongs to (its first concept's world). */
export const placeOf = (m: Pick<Mission, 'concepts'>) => worldOfConcept(m.concepts[0])?.id;

export interface PlayedGame {
  mode: GameMode;
  name: string;
  emoji: string;
  blurb: string;
  dress?: Dress;
  loss?: string;
}

/**
 * What a mission plays: his own pick (from the Arcade) first, then the island's game, else the best
 * fit for the content. A boss fight is always a duel, with the island's boss when it has one.
 */
export function gameOf(m: Pick<Mission, 'concepts' | 'kind' | 'id' | 'mode'>): PlayedGame {
  const generic = (mode: GameMode): PlayedGame => ({ mode, ...MODES[mode] });
  const island = ISLAND_GAMES[placeOf(m) ?? ''];
  // His own pick; on the island's own game it keeps the island's look (the garden's bug invasion).
  if (m.mode) return island?.mode === m.mode ? island : generic(m.mode);
  if (m.kind === 'boss')
    return island?.mode === 'duel'
      ? island
      : {
          ...generic('duel'),
          dress: island?.dress?.bg ? { bg: island.dress.bg } : undefined,
        };
  return island ?? generic(modeFor(m.concepts, m.kind, m.id));
}

/**
 * Where a mission is played. Vocabulary quests are played in the Word Garden itself (its word cards count
 * towards the quest); everything else is a battle with the island's game.
 */
export function playScreen(m: Mission, fromPlan: boolean): Screen {
  if (fromPlan && m.kind !== 'boss' && !m.mode && placeOf(m) === 'word-forest') return { name: 'garden', quest: m };
  return { name: 'battle', mission: m, fromPlan };
}
