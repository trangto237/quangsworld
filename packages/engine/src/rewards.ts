import type { Mission, Reward, Wallet } from '@atlas/shared';

/**
 * Shop catalogue. Everything is cosmetic or earned by learning — no pay-to-win.
 * - look: his knight's armour, a hat and a pet — in every game, on the map and on his hero card.
 * - effect: what bursts out when he answers right — in every game.
 * - game: items for one game (its scene, or its gear: car, ball, chess set, rocket…).
 * Each equippable item fills one `slot`; towers are simply owned (all owned towers can be built).
 */
export type ShopCategory = 'look' | 'effect' | 'game';

/** The game modes that have their own items (ids match @atlas/game modes). */
export type ShopMode = 'defense' | 'runner' | 'duel' | 'knight' | 'penalty' | 'race' | 'meteor' | 'sprint' | 'detective';

export interface ShopItem {
  id: string;
  name: string;
  category: ShopCategory;
  emoji: string;
  coins: number;
  gems: number;
  description: string;
  /** What it fills: 'hat', 'pet', 'effect', or '<mode>.<thing>' (e.g. 'race.vehicle'). Towers have none. */
  slot?: string;
  /** For game items: which game. */
  mode?: ShopMode;
  /** Items unlocked by default. */
  starter?: boolean;
  minLevel?: number;
}

const look = (id: string, slot: 'armour' | 'hat' | 'pet', emoji: string, name: string, coins: number, gems: number, description: string): ShopItem => ({ id, slot, emoji, name, coins, gems, description, category: 'look' });
const fx = (id: string, emoji: string, name: string, coins: number, gems: number, description: string): ShopItem => ({ id, slot: 'effect', emoji, name, coins, gems, description, category: 'effect' });
const game = (mode: ShopMode, id: string, slot: string, emoji: string, name: string, coins: number, gems: number, description: string, extra: Partial<ShopItem> = {}): ShopItem => ({
  id,
  mode,
  slot: `${mode}.${slot}`,
  emoji,
  name,
  coins,
  gems,
  description,
  category: 'game',
  ...extra,
});

export const SHOP: ShopItem[] = [
  // ── Your look: everywhere ──
  { ...look('armour.iron', 'armour', '🛡️', 'Iron Squire', 0, 0, 'Every knight starts here. Steel helmet, red cape.'), starter: true },
  look('armour.bronze', 'armour', '🛡️', 'Bronze Guard', 150, 0, 'Warm bronze armour and a forest-green cape.'),
  look('armour.silver', 'armour', '🛡️', 'Silver Paladin', 300, 1, 'Shining silver with a royal-blue cape.'),
  look('armour.jade', 'armour', '🛡️', 'Jade Warrior', 350, 2, 'Green jade and gold, like the heroes of old Vietnam.'),
  look('armour.frost', 'armour', '🛡️', 'Frost Knight', 400, 2, 'Ice-blue armour with a crystal crown.'),
  look('armour.gold', 'armour', '🛡️', 'Golden Champion', 500, 3, 'Solid gold, spiked helmet. For true champions.'),
  look('armour.dragon', 'armour', '🛡️', 'Dragon Knight', 600, 4, 'Red dragon-scale armour with horns.'),
  look('armour.shadow', 'armour', '🛡️', 'Shadow Knight', 600, 4, 'Dark armour, closed visor, glowing eyes.'),
  look('avatar.cap', 'hat', '🧢', 'Cap', 80, 0, 'A cool everyday cap.'),
  look('avatar.wizard', 'hat', '🎩', 'Magician Hat', 120, 0, 'Knowledge is magic.'),
  look('avatar.robot', 'hat', '🤖', 'Robot Visor', 120, 0, 'Beep boop, correct answer.'),
  look('avatar.grad', 'hat', '🎓', 'Graduation Cap', 200, 0, 'Ready for grade 10.'),
  look('avatar.crown', 'hat', '👑', 'Crown', 250, 1, 'For true champions.'),
  look('pet.turtle', 'pet', '🐢', 'Turtle', 100, 0, 'Slow and steady wins the race.'),
  look('pet.cat', 'pet', '🐱', 'Cat', 150, 0, 'Curious about every word.'),
  look('pet.dog', 'pet', '🐶', 'Dog', 150, 0, 'Always happy to see you study.'),
  look('pet.owl', 'pet', '🦉', 'Little Owl', 200, 0, "Coach Owl's little cousin."),
  look('pet.panda', 'pet', '🐼', 'Panda', 250, 1, 'Calm under exam pressure.'),
  look('pet.dragon', 'pet', '🐉', 'Baby Dragon', 400, 3, 'Grows fiercer with every streak.'),
  // ── Right-answer effects: every game ──
  fx('fx.sparkle', '✨', 'Sparkles', 100, 0, 'A shower of sparkles for every right answer.'),
  fx('fx.blossom', '🌸', 'Peach Blossoms', 150, 0, 'Tết flowers drift up when you get it right.'),
  fx('fx.fire', '🔥', 'On Fire', 200, 0, 'Flames for a right answer.'),
  fx('fx.rainbow', '🌈', 'Rainbow', 250, 0, 'A rainbow burst.'),
  fx('fx.fireworks', '🎆', 'Fireworks', 300, 1, 'Fireworks, like New Year on Hồ Gươm.'),
  // ── Castle Defense ──
  game('defense', 'tower.pawn', '', '♟', 'Pawn Archer', 0, 0, 'Cheap and steady. Shoots straight down its lane.', { starter: true, slot: undefined }),
  game('defense', 'tower.rook', '', '♜', 'Rook Wall', 0, 0, 'A sturdy wall that blocks enemies and fires slowly.', { starter: true, slot: undefined }),
  game('defense', 'tower.knight', '', '♞', 'Knight Lancer', 150, 0, 'Hits its own lane and both neighbouring lanes.', { slot: undefined }),
  game('defense', 'tower.bishop', '', '♝', 'Bishop Frost', 250, 0, 'Slows every enemy it hits.', { minLevel: 2, slot: undefined }),
  game('defense', 'tower.queen', '', '♛', 'Queen Storm', 500, 5, 'Rapid fire. The most powerful piece on the board.', { minLevel: 4, slot: undefined }),
  game('defense', 'skin.neon', 'skin', '💡', 'Neon Towers', 200, 0, 'Glowing neon tower skins.'),
  game('defense', 'skin.gold', 'skin', '🏆', 'Golden Towers', 400, 3, 'Solid gold. Very shiny.'),
  game('defense', 'theme.night', 'theme', '🌙', 'Night Battlefield', 150, 0, 'Battle under the stars.'),
  game('defense', 'theme.snow', 'theme', '❄️', 'Snow Battlefield', 150, 0, 'A frozen battlefield.'),
  // ── Word Runner ──
  game('runner', 'runner.beach', 'scene', '🏖️', 'Beach Road', 150, 0, 'Run along the sea at sunset.'),
  game('runner', 'runner.hanoi', 'scene', '🏮', 'Hà Nội Lanterns', 200, 0, 'Old Quarter streets under red lanterns.'),
  game('runner', 'runner.space', 'scene', '🌌', 'Space Track', 250, 1, 'A road through the galaxy.'),
  // ── Boss Duel ──
  game('duel', 'duel.sword', 'weapon', '⚔️', 'Twin Swords', 150, 0, 'Strike with steel.'),
  game('duel', 'duel.wand', 'weapon', '🪄', 'Magic Wand', 200, 0, 'Every right answer is a spell.'),
  game('duel', 'duel.lightning', 'weapon', '⚡', 'Lightning', 300, 1, 'Thunder from the sky.'),
  // ── Knight's Quest ──
  game('knight', 'chess.marble', 'set', '♔', 'Marble Chess Set', 300, 2, 'A white marble board and pieces.'),
  game('knight', 'chess.jade', 'set', '🀄', 'Jade Set (cờ tướng)', 300, 2, 'Green jade, like a Vietnamese cờ tướng board.'),
  game('knight', 'chess.gold', 'set', '🥇', 'Golden Set', 450, 3, 'A gold board for a grandmaster.'),
  // ── Penalty Shootout ──
  game('penalty', 'penalty.fire', 'ball', '🔥', 'Fire Ball', 150, 0, 'Your shots leave flames.'),
  game('penalty', 'penalty.star', 'ball', '🌟', 'Star Ball', 200, 0, 'A golden star ball.'),
  game('penalty', 'penalty.night', 'scene', '🏟️', 'Floodlit Stadium', 200, 0, 'Play the shootout under the lights.'),
  // ── Race ──
  game('race', 'race.motorbike', 'vehicle', '🛵', 'Motorbike', 120, 0, 'The way Hà Nội gets around.'),
  game('race', 'race.car', 'vehicle', '🏎️', 'Race Car', 200, 0, 'Built for speed.'),
  game('race', 'race.rocket', 'vehicle', '🚀', 'Rocket Kart', 350, 2, 'Not exactly road-legal.'),
  // ── Meteor ──
  game('meteor', 'meteor.ufo', 'ship', '🛸', 'Flying Saucer', 200, 0, 'Defend the planet in style.'),
  game('meteor', 'meteor.satellite', 'ship', '🛰️', 'Satellite Cannon', 250, 1, 'Precision from orbit.'),
  // ── Sprint ──
  game('sprint', 'sprint.ufo', 'rocket', '🛸', 'UFO', 200, 0, 'Launch a flying saucer instead of a rocket.'),
  game('sprint', 'sprint.balloon', 'rocket', '🎈', 'Hot-air Balloon', 150, 0, 'Up, up and away.'),
  // ── Detective ──
  game('detective', 'detective.tophat', 'gear', '🎩', 'Top Hat', 150, 0, 'A classic detective look.'),
  game('detective', 'detective.cat', 'gear', '🐈‍⬛', 'Black Cat Sidekick', 250, 1, 'Spots clues you miss.'),
];

export const STARTER_ITEMS = SHOP.filter((i) => i.starter).map((i) => i.id);

/** XP needed to reach level n+1 from level n grows gently. */
export function levelFromXp(xp: number): { level: number; into: number; needed: number } {
  let level = 1;
  let need = 200;
  let rest = xp;
  while (rest >= need) {
    rest -= need;
    level++;
    need = 200 + (level - 1) * 100;
  }
  return { level, into: rest, needed: need };
}

export interface BattleOutcome {
  victory: boolean;
  accuracy: number;
  answered: number;
  bestStreak: number;
}

/** Final reward for a mission. Effort always earns something; accuracy and victory earn more. */
export function battleReward(mission: Mission, o: BattleOutcome): Reward {
  if (o.answered === 0) return { coins: 0, gems: 0, xp: 0 };
  const base = mission.reward;
  const perf = 0.4 + 0.6 * o.accuracy;
  const win = o.victory ? 1 : 0.6;
  return {
    coins: Math.round(base.coins * perf * win + o.bestStreak * 3),
    gems: o.victory ? base.gems + (o.accuracy >= 0.9 ? 1 : 0) : 0,
    xp: Math.round(base.xp * perf + o.answered * 5),
  };
}

export function canAfford(w: Wallet, item: ShopItem) {
  return w.coins >= item.coins && w.gems >= item.gems;
}
