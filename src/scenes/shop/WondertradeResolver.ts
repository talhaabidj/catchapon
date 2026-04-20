import type { Item } from '../../data/types.js';

export type WondertradeUnavailableReason = 'need-owned-items' | 'collection-complete';

export interface WondertradeStatus {
  canTrade: boolean;
  reason: WondertradeUnavailableReason | null;
}

export interface WondertradeOutcome {
  tradeAwayId: string;
  received: Item;
}

function pickRandom<T>(items: readonly T[], rng: () => number): T {
  const idx = Math.floor(rng() * items.length);
  const clamped = Math.max(0, Math.min(items.length - 1, idx));
  return items[clamped]!;
}

export function getWondertradeStatus(
  ownedItemIds: readonly string[],
  allItems: readonly Item[],
): WondertradeStatus {
  if (ownedItemIds.length === 0) {
    return { canTrade: false, reason: 'need-owned-items' };
  }

  const ownedSet = new Set(ownedItemIds);
  const hasUnownedTarget = allItems.some((item) => !ownedSet.has(item.id));
  if (!hasUnownedTarget) {
    return { canTrade: false, reason: 'collection-complete' };
  }

  return { canTrade: true, reason: null };
}

export function rollWondertradeOutcome(
  ownedItemIds: readonly string[],
  allItems: readonly Item[],
  rng: () => number = Math.random,
): WondertradeOutcome | null {
  const status = getWondertradeStatus(ownedItemIds, allItems);
  if (!status.canTrade) return null;

  const ownedPool = [...new Set(ownedItemIds)];
  const ownedSet = new Set(ownedPool);
  const unownedPool = allItems.filter((item) => !ownedSet.has(item.id));

  if (ownedPool.length === 0 || unownedPool.length === 0) return null;

  return {
    tradeAwayId: pickRandom(ownedPool, rng),
    received: pickRandom(unownedPool, rng),
  };
}
