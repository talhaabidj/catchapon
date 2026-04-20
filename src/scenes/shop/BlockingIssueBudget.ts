export function rollBlockingIssueBudget(rng: () => number = Math.random): number {
  const roll = rng();
  if (roll < 0.5) return 1;
  if (roll < 0.82) return 2;
  return 3;
}

export function getNightlyBlockingIssueBudget(
  maxAvailableIssues: number,
  rng: () => number = Math.random,
): number {
  const safeMax = Math.max(1, Math.floor(maxAvailableIssues));
  return Math.min(safeMax, rollBlockingIssueBudget(rng));
}
