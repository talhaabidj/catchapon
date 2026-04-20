import type { MachineState } from '../../data/types.js';

export function hasAnyRestockNeedInWorld(
  hasPendingRestockTask: boolean,
  tokenStationStock: MachineState['stockLevel'],
  machineStates: readonly MachineState[],
): boolean {
  if (hasPendingRestockTask) return true;
  if (tokenStationStock === 'empty') return true;
  return machineStates.some((state) => state.stockLevel === 'empty');
}

export function canUseEmergencyRestock(
  stockLevel: MachineState['stockLevel'],
  hasRefill: boolean,
  hasPendingRestockTask: boolean,
): boolean {
  return stockLevel === 'empty' && hasRefill && !hasPendingRestockTask;
}
