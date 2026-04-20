import type { MachineState } from '../../data/types.js';

export const ARCADE_STATUS_TEXT = {
  outOfOrderRequiresPower: 'OUT OF ORDER - REQUIRES POWER',
  outOfOrderJammed: 'OUT OF ORDER - JAMMED',
  outOfOrderRestockNeeded: 'OUT OF ORDER - RESTOCK NEEDED',
  outOfOrderRestockNow: 'OUT OF ORDER - RESTOCK NOW',
  outOfOrderServiceRequired: 'OUT OF ORDER - SERVICE REQUIRED',
  lowStockGetRefill: 'LOW STOCK - GET REFILL FROM CRATE',
  lowStockRestockNow: 'LOW STOCK - RESTOCK NOW',
  lowStockRestockReady: 'LOW STOCK - RESTOCK WHEN READY',
  serviceCleanGlass: 'SERVICE REQUIRED - CLEAN GLASS',
  serviceCleanScreen: 'SERVICE REQUIRED - CLEAN SCREEN',
  buyTokens: 'BUY TOKENS',
} as const;

export function getOutagePrompt(state: MachineState, hasRefill: boolean): string | null {
  if (!state.isPowered) return ARCADE_STATUS_TEXT.outOfOrderRequiresPower;
  if (state.isJammed) return ARCADE_STATUS_TEXT.outOfOrderJammed;
  if (state.stockLevel === 'empty') {
    return hasRefill
      ? ARCADE_STATUS_TEXT.outOfOrderRestockNow
      : ARCADE_STATUS_TEXT.outOfOrderRestockNeeded;
  }
  return null;
}

export function getLowStockPrompt(hasRefill: boolean): string {
  return hasRefill
    ? ARCADE_STATUS_TEXT.lowStockRestockReady
    : ARCADE_STATUS_TEXT.lowStockGetRefill;
}
