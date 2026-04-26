/**
 * main.ts — Catchapon entry point.
 *
 * Renders a lightweight splash immediately (LCP target), then boots heavy
 * Three.js code only after user intent ("Start Game").
 */

import { injectSpeedInsights } from '@vercel/speed-insights';

type BootModules = {
  Game: (typeof import('./core/Game.js'))['Game'];
  BootScene: (typeof import('./scenes/BootScene.js'))['BootScene'];
};

type WavedashSDK = {
  init(options?: { debug?: boolean }): void;
  updateLoadProgressZeroToOne(progress: number): void;
};

declare global {
  interface Window {
    Wavedash?: Promise<WavedashSDK>;
  }
}

let bootModulesPreload: Promise<BootModules | null> | null = null;
let didStartBoot = false;
let wavedashSdkPromise: Promise<WavedashSDK | null> | null = null;
let wavedashDidInit = false;

function getWavedashSdk(): Promise<WavedashSDK | null> {
  if (!wavedashSdkPromise) {
    const sdkSource = window.Wavedash;
    if (!sdkSource) {
      wavedashSdkPromise = Promise.resolve(null);
    } else {
      wavedashSdkPromise = sdkSource
        .then((sdk) => sdk)
        .catch((err) => {
          console.warn('Wavedash SDK unavailable:', err);
          return null;
        });
    }
  }
  return wavedashSdkPromise;
}

function syncWavedashProgress(progressZeroToOne: number) {
  const clamped = Math.max(0, Math.min(1, progressZeroToOne));
  void getWavedashSdk().then((sdk) => {
    if (!sdk) return;
    sdk.updateLoadProgressZeroToOne(clamped);
  });
}

function initWavedashIfAvailable() {
  if (wavedashDidInit) return;
  void getWavedashSdk().then((sdk) => {
    if (!sdk || wavedashDidInit) return;
    sdk.init({ debug: !import.meta.env.PROD });
    wavedashDidInit = true;
  });
}

function waitForPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

function scheduleIdle(work: () => void, timeoutMs = 1200) {
  const win = window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  };
  if (win.requestIdleCallback) {
    win.requestIdleCallback(work, { timeout: timeoutMs });
    return;
  }
  setTimeout(work, 16);
}

function setLoadingProgress(progressEl: HTMLElement | null, pct: number) {
  const clamped = Math.max(0, Math.min(100, pct));
  if (progressEl) {
    progressEl.style.width = `${clamped}%`;
  }
  // Wavedash expects normalized loading progress so it can dismiss platform loading.
  syncWavedashProgress(clamped / 100);
}

function setLoadingStatus(statusEl: HTMLElement | null, text: string) {
  if (!statusEl) return;
  statusEl.textContent = text;
}

function preloadBootModules() {
  if (!bootModulesPreload) {
    bootModulesPreload = Promise.all([
      import('./core/Game.js'),
      import('./scenes/BootScene.js'),
    ])
      .then(([gameMod, bootMod]) => ({
        Game: gameMod.Game,
        BootScene: bootMod.BootScene,
      }))
      .catch((err) => {
        console.error('Failed to preload boot modules:', err);
        return null;
      });
  }
  return bootModulesPreload;
}

async function bootGame(
  container: HTMLElement,
  statusEl: HTMLElement | null,
  progressEl: HTMLElement | null,
): Promise<void> {
  setLoadingStatus(statusEl, 'Loading core systems...');
  setLoadingProgress(progressEl, 20);
  await waitForPaint();

  let modules = await preloadBootModules();
  if (!modules) {
    const gameMod = await import('./core/Game.js');
    const bootMod = await import('./scenes/BootScene.js');
    modules = {
      Game: gameMod.Game,
      BootScene: bootMod.BootScene,
    };
  }
  setLoadingStatus(statusEl, 'Preparing renderer...');
  setLoadingProgress(progressEl, 58);

  const game = new modules.Game(container);
  game.start();

  setLoadingStatus(statusEl, 'Opening terminal...');
  setLoadingProgress(progressEl, 82);

  await game.sceneManager.switchTo(new modules.BootScene(game));
  setLoadingProgress(progressEl, 100);
  initWavedashIfAvailable();
}

async function main() {
  const container = document.getElementById('canvas-container');
  if (!container) {
    throw new Error('Missing #canvas-container element in index.html');
  }

  const startBtn = document.getElementById('loading-start-btn') as HTMLButtonElement | null;
  const statusEl = document.getElementById('loading-status');
  const progressEl = document.getElementById('loading-bar-fill');
  const tipEl = document.querySelector('.loading-tip') as HTMLElement | null;

  await waitForPaint();
  syncWavedashProgress(0);

  // Speed Insights runs in production; dev injection logs debug-mode notices.
  if (import.meta.env.PROD) {
    scheduleIdle(() => {
      injectSpeedInsights();
    }, 2500);
  }

  // Warm chunks during idle without blocking first render or first click.
  scheduleIdle(() => {
    void preloadBootModules();
  }, 2000);

  const beginBoot = async () => {
    if (didStartBoot) return;
    didStartBoot = true;
    if (startBtn) {
      startBtn.disabled = true;
      startBtn.textContent = 'Starting...';
    }

    try {
      await bootGame(container, statusEl, progressEl);
    } catch (err) {
      console.error('Catchapon failed to start:', err);
      setLoadingStatus(statusEl, 'Failed to start game');
      if (tipEl) tipEl.textContent = 'Please refresh and try again.';
      if (startBtn) {
        startBtn.disabled = false;
        startBtn.textContent = 'Retry';
      }
      didStartBoot = false;
    }
  };

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      // Let button visual state paint first so first interaction stays responsive.
      void (async () => {
        await waitForPaint();
        await beginBoot();
      })();
    });
  } else {
    await beginBoot();
  }
}

void main().catch((err) => {
  console.error('Catchapon initialization failed:', err);
});
