/**
 * bedroomUI — HUD and overlay management for BedroomScene.
 *
 * Handles:
 * - Crosshair
 * - "Press E to ..." interaction prompt
 * - PC profile overlay (live stats from save state)
 * - Collection wall overlay (items grouped by set with progress)
 */

import type { Item, GameState } from '../data/types.js';
import { SETS } from '../data/sets.js';
import { getItemById } from '../data/items.js';

const BEDROOM_UI_ID = 'bedroom-ui';

// Rarity colors for item display
const RARITY_COLORS: Record<string, string> = {
  common: '#9ca3af',
  uncommon: '#34d399',
  rare: '#60a5fa',
  epic: '#a78bfa',
  legendary: '#fbbf24',
};

export function mountBedroomUI() {
  const uiRoot = document.getElementById('ui-root');
  if (!uiRoot) return;

  const container = document.createElement('div');
  container.id = BEDROOM_UI_ID;
  container.innerHTML = `
    <div class="crosshair" id="bedroom-crosshair"></div>
    <div class="interact-prompt" id="interact-prompt">
      <kbd>E</kbd> <span id="interact-prompt-text">Interact</span>
    </div>
    <div class="bedroom-overlay hidden" id="pc-overlay">
      <div class="overlay-panel">
        <div class="overlay-header">
          <h2>Catchapon Terminal</h2>
          <button class="overlay-close" id="pc-overlay-close">✕</button>
        </div>
        <div class="overlay-body">
          <div class="profile-section">
            <div class="profile-stat">
              <span class="stat-label">Nights Worked</span>
              <span class="stat-value" id="stat-nights">0</span>
            </div>
            <div class="profile-stat">
              <span class="stat-label">Total Money Earned</span>
              <span class="stat-value" id="stat-money">$0</span>
            </div>
            <div class="profile-stat">
              <span class="stat-label">Items Collected</span>
              <span class="stat-value" id="stat-pulls">0 / 25</span>
            </div>
            <div class="profile-stat">
              <span class="stat-label">Sets Completed</span>
              <span class="stat-value" id="stat-sets">0 / 4</span>
            </div>
            <div class="profile-stat">
              <span class="stat-label">Secrets Found</span>
              <span class="stat-value" id="stat-secrets">0</span>
            </div>
          </div>
          <div class="profile-hint">
            <p>Walk to the door to start your night shift.</p>
          </div>
        </div>
      </div>
    </div>
    <div class="bedroom-overlay hidden" id="collection-overlay">
      <div class="overlay-panel collection-panel">
        <div class="overlay-header">
          <h2>Collection</h2>
          <button class="overlay-close" id="collection-overlay-close">✕</button>
        </div>
        <div class="overlay-body" id="collection-body">
          <p class="collection-empty">Your collection is empty. Start pulling capsules!</p>
        </div>
      </div>
    </div>
  `;
  uiRoot.appendChild(container);

  // Close button handlers
  document.getElementById('pc-overlay-close')?.addEventListener('click', () => {
    hidePCOverlay();
  });
  document.getElementById('collection-overlay-close')?.addEventListener('click', () => {
    hideCollectionOverlay();
  });
}

export function unmountBedroomUI() {
  document.getElementById(BEDROOM_UI_ID)?.remove();
}

/** Show/hide the interaction prompt */
export function showInteractPrompt(text: string) {
  const prompt = document.getElementById('interact-prompt');
  const promptText = document.getElementById('interact-prompt-text');
  if (prompt && promptText) {
    promptText.textContent = text;
    prompt.classList.add('visible');
  }
  // Expand crosshair
  const crosshair = document.getElementById('bedroom-crosshair');
  crosshair?.classList.add('interact');
}

export function hideInteractPrompt() {
  const prompt = document.getElementById('interact-prompt');
  prompt?.classList.remove('visible');
  const crosshair = document.getElementById('bedroom-crosshair');
  crosshair?.classList.remove('interact');
}

/** PC overlay */
export function showPCOverlay() {
  const overlay = document.getElementById('pc-overlay');
  overlay?.classList.remove('hidden');
}

export function hidePCOverlay() {
  const overlay = document.getElementById('pc-overlay');
  overlay?.classList.add('hidden');
}

export function isPCOverlayVisible(): boolean {
  const overlay = document.getElementById('pc-overlay');
  return overlay ? !overlay.classList.contains('hidden') : false;
}

/** Update PC terminal stats from game state */
export function updatePCStats(state: GameState) {
  const nights = document.getElementById('stat-nights');
  const money = document.getElementById('stat-money');
  const pulls = document.getElementById('stat-pulls');
  const sets = document.getElementById('stat-sets');
  const secrets = document.getElementById('stat-secrets');

  if (nights) nights.textContent = String(state.nightsWorked);
  if (money) money.textContent = `$${state.money}`;
  if (pulls) pulls.textContent = `${state.ownedItemIds.length} / 25`;

  // Calculate completed sets
  let completedSets = 0;
  for (const set of SETS) {
    const owned = set.itemIds.filter((id) => state.ownedItemIds.includes(id));
    if (owned.length === set.itemIds.length) completedSets++;
  }
  if (sets) sets.textContent = `${completedSets} / ${SETS.length}`;
  if (secrets) secrets.textContent = String(state.secretsTriggered.length);
}

/** Collection overlay */
export function showCollectionOverlay() {
  const overlay = document.getElementById('collection-overlay');
  overlay?.classList.remove('hidden');
}

export function hideCollectionOverlay() {
  const overlay = document.getElementById('collection-overlay');
  overlay?.classList.add('hidden');
}

export function isCollectionOverlayVisible(): boolean {
  const overlay = document.getElementById('collection-overlay');
  return overlay ? !overlay.classList.contains('hidden') : false;
}

/** Render collection with set progress and owned items */
export function updateCollectionOverlay(ownedItemIds: string[]) {
  const body = document.getElementById('collection-body');
  if (!body) return;

  const ownedSet = new Set(ownedItemIds);

  if (ownedItemIds.length === 0) {
    body.innerHTML = '<p class="collection-empty">Your collection is empty. Start pulling capsules!</p>';
    return;
  }

  let html = '';

  for (const set of SETS) {
    const ownedInSet = set.itemIds.filter((id) => ownedSet.has(id));
    const progress = ownedInSet.length;
    const total = set.itemIds.length;
    const isComplete = progress === total;

    html += `
      <div class="set-group ${isComplete ? 'set-complete' : ''}">
        <div class="set-header">
          <div class="set-title">
            <span class="set-name">${set.name}</span>
            <span class="set-count">${progress} / ${total}</span>
          </div>
          <div class="set-progress-bar">
            <div class="set-progress-fill" style="width: ${(progress / total) * 100}%"></div>
          </div>
          ${isComplete ? `<div class="set-reward">🎁 ${set.completionReward}</div>` : ''}
        </div>
        <div class="set-items">
          ${set.itemIds
            .map((itemId) => {
              const item = getItemById(itemId);
              if (!item) return '';
              const owned = ownedSet.has(itemId);
              return renderItemCard(item, owned);
            })
            .join('')}
        </div>
      </div>
    `;
  }

  body.innerHTML = html;
}

function renderItemCard(item: Item, owned: boolean): string {
  const color = RARITY_COLORS[item.rarity] ?? '#aaa';
  if (!owned) {
    return `
      <div class="item-card locked">
        <div class="item-icon locked-icon">?</div>
        <div class="item-name">???</div>
      </div>
    `;
  }
  return `
    <div class="item-card" title="${item.flavorText}">
      <div class="item-icon" style="background: ${color}; box-shadow: 0 0 12px ${color}44;"></div>
      <div class="item-name" style="color: ${color};">${item.name}</div>
      <div class="item-rarity">${item.rarity}</div>
    </div>
  `;
}

/** Check if any overlay is currently open */
export function isAnyOverlayOpen(): boolean {
  return isPCOverlayVisible() || isCollectionOverlayVisible();
}
