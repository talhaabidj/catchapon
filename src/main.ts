/**
 * main.ts — Catchapon entry point.
 *
 * Initializes the lightweight shell and lazily imports the heavy Game instance,
 * guaranteeing an instant First Contentful Paint (FCP) and fast LCP.
 */

import './styles/desktop.css';
import './styles/bedroom.css';
import './styles/shop.css';
import { injectSpeedInsights } from '@vercel/speed-insights';

// Helper to yield execution until the browser has actually painted the screen
function waitForPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

async function main() {
  injectSpeedInsights();

  // 1. Ensure the canvas container exists in the HTML
  const container = document.getElementById('canvas-container');
  if (!container) {
    throw new Error('Missing #canvas-container element in index.html');
  }

  // 2. Yield to the browser render pipeline. 
  // This guarantees the HTML #loading-screen is painted and measured as the LCP 
  // *before* we block the main thread parsing heavy 3D assets.
  await waitForPaint();

  try {
    // 3. Dynamically import the game engine.
    // Vite will automatically code-split this into a separate chunk!
    const { Game } = await import('./core/Game.js');
    const { BootScene } = await import('./scenes/BootScene.js');
    const { RectAreaLightUniformsLib } = await import('three/examples/jsm/lights/RectAreaLightUniformsLib.js');

    // 4. Initialize heavy components
    RectAreaLightUniformsLib.init();
    
    // 5. Mount and start
    const game = new Game(container);
    game.start();

    // Boot into the loading / desktop flow
    await game.sceneManager.switchTo(new BootScene(game));

  } catch (err) {
    console.error('Catchapon failed to load game engine:', err);
    
    // Optional: Update the loading screen UI to show a failure message
    const tip = document.querySelector('.loading-tip');
    if (tip) tip.textContent = 'Failed to load game assets. Please refresh.';
  }
}

main().catch((err) => {
  console.error('Catchapon initialization failed:', err);
});
