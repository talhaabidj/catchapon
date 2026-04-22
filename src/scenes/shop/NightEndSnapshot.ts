import { DEFAULT_SETTINGS } from '../../core/Config.js';
import { sanitizePlayerSettings } from '../../core/PlayerSettings.js';
import { getItemById } from '../../data/items.js';
import type { GameState, Rarity } from '../../data/types.js';

export interface NightEndSummary {
  tasksCompleted: number;
  tasksTotal: number;
  moneyEarned: number;
  itemsObtained: Array<{ name: string; rarity: Rarity }>;
}

export interface BuildShopReturnGameStateInput {
  nightsWorked: number;
  money: number;
  totalMoneyEarnedBeforeNight: number;
  moneyEarnedThisNight: number;
  tokens: number;
  ownedItemIds: readonly string[];
  secretsTriggered: readonly string[];
  existingSettings?: Partial<GameState['settings']>;
}

export function buildNightEndSummary(
  itemIds: readonly string[],
  tasksCompleted: number,
  tasksTotal: number,
  moneyEarned: number,
): NightEndSummary {
  const itemsObtained = itemIds
    .map((id) => getItemById(id))
    .filter((item): item is NonNullable<typeof item> => item != null)
    .map((item) => ({ name: item.name, rarity: item.rarity }));

  return {
    tasksCompleted,
    tasksTotal,
    moneyEarned,
    itemsObtained,
  };
}

export function buildShopReturnGameState(
  input: BuildShopReturnGameStateInput,
): GameState {
  return {
    version: 1,
    nightsWorked: input.nightsWorked,
    money: input.money,
    totalMoneyEarned: input.totalMoneyEarnedBeforeNight + input.moneyEarnedThisNight,
    tokens: input.tokens,
    ownedItemIds: [...input.ownedItemIds],
    secretsTriggered: [...input.secretsTriggered],
    settings: sanitizePlayerSettings({
      ...DEFAULT_SETTINGS,
      ...(input.existingSettings ?? {}),
    }),
  };
}
