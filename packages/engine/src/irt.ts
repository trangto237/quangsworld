/** Shared ability model: an Elo / 1-parameter-logistic hybrid on a 0–100 scale. */

/** Difficulty 1–5 mapped onto the 0–100 ability scale (10, 30, 50, 70, 90). */
export const itemLocation = (difficulty: number) => difficulty * 20 - 10;

/** Probability that a learner with `ability` answers an item of `difficulty` correctly. */
export const pCorrect = (ability: number, difficulty: number) => 1 / (1 + Math.exp(-(ability - itemLocation(difficulty)) / 12));

/**
 * The lowest difficulty for a school grade: questions are pitched at his grade even before he has shown
 * what he knows (grade 9 never sees the primary-school levels 1–2). Levels 3–5 still adapt to him.
 */
export const gradeFloor = (grade: number | undefined) => (!grade ? 1 : grade >= 9 ? 3 : grade >= 7 ? 2 : 1);

let floor = 1;
/** Set once the player is known (the kid app does this on login). */
export const setDifficultyFloor = (grade: number | undefined) => {
  floor = gradeFloor(grade);
};

/** Question difficulty that sits just above current mastery (zone of proximal development), never below his grade. */
export const targetDifficulty = (mastery: number, min = floor) => Math.min(5, Math.max(min, 1, Math.round(1 + (mastery + 8) / 25)));
