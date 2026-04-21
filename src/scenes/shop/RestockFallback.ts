import type { MachineState } from '../../data/types.js';

export function hasAnyRestockNeedInWorld(
  hasPendingRestockTask: boolean,
  machineStates: readonly MachineState[],
): boolean {
  if (hasPendingRestockTask) return true;
  return machineStates.some((state) => state.stockLevel !== 'ok');
}

export function canUseEmergencyRestock(
  stockLevel: MachineState['stockLevel'],
  hasRefill: boolean,
  hasPendingRestockTask: boolean,
): boolean {
  return stockLevel === 'empty' && hasRefill && !hasPendingRestockTask;
}
