export function computeScore(
  foodsEaten: number,
  elapsedSeconds: number,
  difficultyMultiplier: number
): number {
  const safeFoods = Math.max(0, Math.floor(foodsEaten));
  const safeSeconds = Math.max(0, Math.floor(elapsedSeconds));
  const base = safeSeconds * 100 + safeFoods * 50;
  return Math.round(base * difficultyMultiplier);
}
