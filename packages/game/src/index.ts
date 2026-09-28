export * from './sim';
export type { Theme, Skin } from './scene';
export type { BattleController, BattleOptions } from './battle';
/** Phaser is heavy: the app loads it lazily with `await import('@atlas/game/battle')`. */
export const loadBattle = () => import('./battle');
