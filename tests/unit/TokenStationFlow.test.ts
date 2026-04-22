import { describe, expect, it } from 'vitest';
import type { MachineState } from '../../src/data/types.js';
import { canUseTokenStation } from '../../src/scenes/shop/TokenStationFlow.js';

function makeTokenState(partial: Partial<MachineState>): MachineState {
  return {
    machineId: 'token-station',
    cleanliness: partial.cleanliness ?? 'clean',
    stockLevel: partial.stockLevel ?? 'ok',
    isJammed: partial.isJammed ?? false,
    isPowered: partial.isPowered ?? true,
  };
}

describe('TokenStationFlow.canUseTokenStation', () => {
  it('allows usage while dirty when powered, not jammed, and stocked', () => {
    expect(
      canUseTokenStation(
        makeTokenState({ cleanliness: 'dirty', isPowered: true, isJammed: false, stockLevel: 'ok' }),
      ),
    ).toBe(true);
  });

  it('blocks usage when unpowered', () => {
    expect(canUseTokenStation(makeTokenState({ isPowered: false }))).toBe(false);
  });

  it('blocks usage when jammed', () => {
    expect(canUseTokenStation(makeTokenState({ isJammed: true }))).toBe(false);
  });

  it('blocks usage when empty', () => {
    expect(canUseTokenStation(makeTokenState({ stockLevel: 'empty' }))).toBe(false);
  });
});
