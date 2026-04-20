/**
 * Blocking issue budgeting regression tests.
 */

import { describe, it, expect } from 'vitest';
import type { MachineState } from '../../src/data/types.js';
import {
  getNightlyBlockingIssueBudget,
  rollBlockingIssueBudget,
} from '../../src/scenes/shop/BlockingIssueBudget.js';
import {
  reduceBlockingIssuesToBudget,
  countBlockingIssues,
} from '../../src/scenes/shop/ServiceStateBalancer.js';

function makeState(partial: Partial<MachineState>): MachineState {
  return {
    machineId: partial.machineId ?? 'm',
    cleanliness: partial.cleanliness ?? 'clean',
    stockLevel: partial.stockLevel ?? 'ok',
    isJammed: partial.isJammed ?? false,
    isPowered: partial.isPowered ?? true,
  };
}

describe('Blocking issue budget', () => {
  it('rolls blocker budget in 1..3 range with weighted thresholds', () => {
    expect(rollBlockingIssueBudget(() => 0.1)).toBe(1);
    expect(rollBlockingIssueBudget(() => 0.65)).toBe(2);
    expect(rollBlockingIssueBudget(() => 0.95)).toBe(3);
  });

  it('caps rolled budget by available service targets', () => {
    expect(getNightlyBlockingIssueBudget(1, () => 0.95)).toBe(1);
    expect(getNightlyBlockingIssueBudget(2, () => 0.95)).toBe(2);
    expect(getNightlyBlockingIssueBudget(8, () => 0.95)).toBe(3);
  });

  it('reduces blocking states down to budget', () => {
    const states: MachineState[] = [
      makeState({ machineId: 'a', isJammed: true }),
      makeState({ machineId: 'b', isPowered: false }),
      makeState({ machineId: 'c', stockLevel: 'empty' }),
      makeState({ machineId: 'd', isJammed: true }),
    ];

    reduceBlockingIssuesToBudget(states, 2, () => 0.0);
    expect(countBlockingIssues(states)).toBeLessThanOrEqual(2);
  });
});
