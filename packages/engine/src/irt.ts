/** Shared ability model: an Elo / 1-parameter-logistic hybrid on a 0–100 scale. */

/** Difficulty 1–5 mapped onto the 0–100 ability scale (10, 30, 50, 70, 90). */
export const itemLocation = (difficulty: number) => difficulty * 20 - 10;

/** Probability that a learner with `ability` answers an item of `difficulty` correctly. */
export const pCorrect = (ability: number, difficulty: number) => 1 / (1 + Math.exp(-(ability - itemLocation(difficulty)) / 12));

/** Question difficulty that sits just above current mastery (zone of proximal development). */
export const targetDifficulty = (mastery: number) => Math.min(5, Math.max(1, Math.round(1 + (mastery + 8) / 25)));
