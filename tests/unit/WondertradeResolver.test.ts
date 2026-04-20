/**
 * Wondertrade resolver regression tests.
 */

import { describe, it, expect } from 'vitest';
import { ITEMS } from '../../src/data/items.js';
import {
  getWondertradeStatus,
  rollWondertradeOutcome,
} from '../../src/scenes/shop/WondertradeResolver.js';

describe('Wondertrade resolver', () => {
  it('requires owned items before allowing trade', () => {
    const status = getWondertradeStatus([], ITEMS);
    expect(status.canTrade).toBe(false);
    expect(status.reason).toBe('need-owned-items');
  });

  it('blocks trading when collection is complete', () => {
    const allOwned = ITEMS.map((item) => item.id);
    const status = getWondertradeStatus(allOwned, ITEMS);
    expect(status.canTrade).toBe(false);
    expect(status.reason).toBe('collection-complete');
  });

  it('returns a valid outcome that always grants an unowned item', () => {
    const owned = [ITEMS[0]!.id, ITEMS[1]!.id, ITEMS[2]!.id];
    const result = rollWondertradeOutcome(owned, ITEMS, () => 0.0);

    expect(result).not.toBeNull();
    expect(result!.tradeAwayId).toBe(owned[0]);
    expect(owned.includes(result!.received.id)).toBe(false);
  });

  it('returns null when trading cannot proceed', () => {
    expect(rollWondertradeOutcome([], ITEMS, () => 0.0)).toBeNull();

    const allOwned = ITEMS.map((item) => item.id);
    expect(rollWondertradeOutcome(allOwned, ITEMS, () => 0.0)).toBeNull();
  });
});
