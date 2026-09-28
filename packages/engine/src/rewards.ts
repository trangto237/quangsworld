import type { Mission, Reward, Wallet } from '@atlas/shared';

/** Shop catalogue. Everything is cosmetic or earned by learning — no pay-to-win. */
export type ShopCategory = 'tower' | 'skin' | 'world-theme' | 'chess-set' | 'avatar';

export interface ShopItem {
  id: string;
  name: string;
  category: ShopCategory;
  emoji: string;
  coins: number;
  gems: number;
  description: string;
  /** Items unlocked by default. */
  starter?: boolean;
  minLevel?: number;
}

export const SHOP: ShopItem[] = [
  { id: 'tower.pawn', name: 'Pawn Archer', category: 'tower', emoji: '♟', coins: 0, gems: 0, description: 'Cheap and steady. Shoots straight down its lane.', starter: true },
  { id: 'tower.rook', name: 'Rook Wall', category: 'tower', emoji: '♜', coins: 0, gems: 0, description: 'A sturdy wall that blocks enemies and fires slowly.', starter: true },
  { id: 'tower.knight', name: 'Knight Lancer', category: 'tower', emoji: '♞', coins: 150, gems: 0, description: 'Hits its own lane and both neighbouring lanes.' },
  { id: 'tower.bishop', name: 'Bishop Frost', category: 'tower', emoji: '♝', coins: 250, gems: 0, description: 'Slows every enemy it hits.', minLevel: 2 },
  { id: 'tower.queen', name: 'Queen Storm', category: 'tower', emoji: '♛', coins: 500, gems: 5, description: 'Rapid fire. The most powerful piece on the board.', minLevel: 4 },
  { id: 'skin.neon', name: 'Neon Towers', category: 'skin', emoji: '💡', coins: 200, gems: 0, description: 'Glowing neon tower skins.' },
  { id: 'skin.gold', name: 'Golden Towers', category: 'skin', emoji: '🏆', coins: 400, gems: 3, description: 'Solid gold. Very shiny.' },
  { id: 'theme.night', name: 'Night Battlefield', category: 'world-theme', emoji: '🌙', coins: 150, gems: 0, description: 'Battle under the stars.' },
  { id: 'theme.snow', name: 'Snow Battlefield', category: 'world-theme', emoji: '❄️', coins: 150, gems: 0, description: 'A frozen battlefield.' },
  { id: 'chess.marble', name: 'Marble Chess Set', category: 'chess-set', emoji: '♔', coins: 300, gems: 2, description: 'Show off in the Logic Labyrinth.' },
  { id: 'avatar.crown', name: 'Crown', category: 'avatar', emoji: '👑', coins: 250, gems: 1, description: 'For true champions.' },
  { id: 'avatar.wizard', name: 'Wizard Hat', category: 'avatar', emoji: '🧙', coins: 120, gems: 0, description: 'Knowledge is magic.' },
  { id: 'avatar.robot', name: 'Robot Visor', category: 'avatar', emoji: '🤖', coins: 120, gems: 0, description: 'Beep boop, correct answer.' },
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
