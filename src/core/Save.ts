/**
 * Save — localStorage persistence for game state.
 *
 * Encodes/decodes a GameState object with versioning.
 */

import type { GameState } from '../data/types.js';
import { SAVE_KEY, DEFAULT_SETTINGS } from '../core/Config.js';
import { sanitizePlayerSettings } from './PlayerSettings.js';

const CURRENT_VERSION = 1;

/** Create a fresh game state */
export function createDefaultGameState(): GameState {
  return {
    version: CURRENT_VERSION,
    nightsWorked: 0,
    money: 0,
    totalMoneyEarned: 0,
    tokens: 0,
    ownedItemIds: [],
    secretsTriggered: [],
    settings: sanitizePlayerSettings(DEFAULT_SETTINGS),
  };
}

/** Load game state from localStorage. Returns null if no save exists or is corrupt. */
export function loadGameState(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<GameState>;

    // Version check
    if (parsed.version !== CURRENT_VERSION) {
      // Future: handle migration
      console.warn('Save version mismatch, starting fresh');
      return null;
    }

    // Backward-compatible migration for older saves that predate totalMoneyEarned.
    return {
      version: CURRENT_VERSION,
      nightsWorked: parsed.nightsWorked ?? 0,
      money: parsed.money ?? 0,
      totalMoneyEarned: parsed.totalMoneyEarned ?? parsed.money ?? 0,
      tokens: parsed.tokens ?? 0,
      ownedItemIds: parsed.ownedItemIds ?? [],
      secretsTriggered: parsed.secretsTriggered ?? [],
      settings: sanitizePlayerSettings(parsed.settings),
    };
  } catch {
    console.warn('Failed to load save, starting fresh');
    return null;
  }
}

/** Save game state to localStorage */
export function saveGameState(state: GameState): boolean {
  try {
    state.version = CURRENT_VERSION;
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    return true;
  } catch {
    console.error('Failed to save game state');
    return false;
  }
}

/** Delete the save */
export function deleteSave(): void {
  localStorage.removeItem(SAVE_KEY);
}

/** Reset all player data to a fresh default state.
 *
 * Clears:
 * - The current SAVE_KEY entry
 * - Any historical pon_save_v* entries (from older save formats)
 * - Any catchapon:* entries (performance HUD pref, secrets-found cache, etc.)
 * - sessionStorage for the same prefixes (in case any transient state lingers)
 *
 * Then writes a fresh default save and verifies it round-trips correctly.
 */
export function resetPlayerData(): boolean {
  try {
    const matchesGameKey = (key: string) =>
      key === SAVE_KEY ||
      key.startsWith('pon_save') ||
      key.startsWith('pon_') ||
      key.startsWith('catchapon');

    const removeMatching = (storage: Storage) => {
      const toClear: string[] = [];
      for (let i = 0; i < storage.length; i += 1) {
        const key = storage.key(i);
        if (key && matchesGameKey(key)) toClear.push(key);
      }
      for (const key of toClear) storage.removeItem(key);
    };

    removeMatching(window.localStorage);
    try {
      removeMatching(window.sessionStorage);
    } catch {
      // sessionStorage may be unavailable in some contexts; ignore.
    }

    const resetState = createDefaultGameState();
    if (!saveGameState(resetState)) return false;

    const persisted = loadGameState();
    return Boolean(
      persisted &&
      persisted.nightsWorked === 0 &&
      persisted.money === 0 &&
      persisted.tokens === 0 &&
      persisted.ownedItemIds.length === 0 &&
      persisted.secretsTriggered.length === 0,
    );
  } catch {
    console.error('Failed to reset save data');
    return false;
  }
}

/** Check if a save exists */
export function hasSave(): boolean {
  return localStorage.getItem(SAVE_KEY) !== null;
}
