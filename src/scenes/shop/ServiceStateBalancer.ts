import type { MachineState } from '../../data/types.js';

export function isBlockingIssue(state: MachineState): boolean {
  return !state.isPowered || state.isJammed || state.stockLevel === 'empty';
}

export function countBlockingIssues(states: readonly MachineState[]): number {
  return states.reduce((count, state) => count + (isBlockingIssue(state) ? 1 : 0), 0);
}

export function reduceBlockingIssuesToBudget(
  states: MachineState[],
  maxBlocking: number,
  rng: () => number = Math.random,
) {
  if (maxBlocking < 0) return;

  let guard = 0;
  while (countBlockingIssues(states) > maxBlocking && guard < 400) {
    guard += 1;

    const candidates = states.filter((state) => isBlockingIssue(state));
    if (candidates.length === 0) return;

    const state = candidates[Math.floor(rng() * candidates.length)]!;
    softenOneBlockingIssue(state, rng);
  }
}

export function softenOneBlockingIssue(state: MachineState, rng: () => number = Math.random): boolean {
  const options: Array<'jam' | 'power' | 'stock'> = [];

  // Prefer reducing jammed states first to avoid "everything is jammed" feel.
  if (state.isJammed) options.push('jam', 'jam');
  if (!state.isPowered) options.push('power');
  if (state.stockLevel === 'empty') options.push('stock');

  if (options.length === 0) return false;

  const pick = options[Math.floor(rng() * options.length)]!;
  if (pick === 'jam') {
    state.isJammed = false;
    return true;
  }
  if (pick === 'power') {
    state.isPowered = true;
    return true;
  }

  state.stockLevel = 'low';
  return true;
}
