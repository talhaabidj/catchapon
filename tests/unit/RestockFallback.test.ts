/**
 * Restock fallback regression tests.
 */

import { describe, it, expect } from 'vitest';
import type { MachineState } from '../../src/data/types.js';
import {
  hasAnyRestockNeedInWorld,
  canUseEmergencyRestock,
} from '../../src/scenes/shop/RestockFallback.js';

function makeState(partial: Partial<MachineState>): MachineState {
  return {
    machineId: partial.machineId ?? 'm',
    cleanliness: partial.cleanliness ?? 'clean',
    stockLevel: partial.stockLevel ?? 'ok',
    isJammed: partial.isJammed ?? false,
    isPowered: partial.isPowered ?? true,
  };
}

describe('Restock fallback', () => {
  it('reports restock need from world state even without pending restock task', () => {
    const machineStates = [
      makeState({ machineId: 'machine-neko', stockLevel: 'empty' }),
      makeState({ machineId: 'machine-train', stockLevel: 'ok' }),
    ];

    const needsRestock = hasAnyRestockNeedInWorld(false, 'ok', machineStates);
    expect(needsRestock).toBe(true);
  });

  it('returns false when no tasks and no empty states exist', () => {
    const machineStates = [
      makeState({ machineId: 'machine-neko', stockLevel: 'ok' }),
      makeState({ machineId: 'machine-train', stockLevel: 'low' }),
    ];

    const needsRestock = hasAnyRestockNeedInWorld(false, 'low', machineStates);
    expect(needsRestock).toBe(false);
  });

  it('allows emergency restock only for empty state with refill and no pending task', () => {
    expect(canUseEmergencyRestock('empty', true, false)).toBe(true);
    expect(canUseEmergencyRestock('empty', false, false)).toBe(false);
    expect(canUseEmergencyRestock('empty', true, true)).toBe(false);
    expect(canUseEmergencyRestock('low', true, false)).toBe(false);
  });
});
