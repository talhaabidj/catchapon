/**
 * PauseSceneController — shared pause + pointer-lock resume flow for first-person scenes.
 *
 * This centralizes ESC pause behavior and browser pointer-lock recovery logic
 * that was previously duplicated across BedroomScene and ShopScene.
 *
 * Resume strategy: When ESC is pressed while paused, the game unpauses immediately
 * but does NOT try to re-lock the pointer. The browser refuses pointer lock from
 * an ESC keydown event (it's the built-in "exit lock" key). Instead, the cursor
 * stays free and the next canvas click naturally re-locks it via
 * FirstPersonController's click handler.
 */

import { FirstPersonController } from '../../core/FirstPersonController.js';
import {
  hidePauseMenu,
  isPauseMenuVisible,
  setPauseResumeMessage,
  showPauseMenu,
} from '../../ui/pauseUI.js';

interface PauseSceneControllerOptions {
  controller: FirstPersonController;
  setPaused: (paused: boolean) => void;
}

export class PauseSceneController {
  private readonly controller: FirstPersonController;
  private readonly setPaused: (paused: boolean) => void;

  private pauseOpenedAtMs = 0;
  private static readonly ESC_TOGGLE_DEBOUNCE_MS = 140;

  constructor(options: PauseSceneControllerOptions) {
    this.controller = options.controller;
    this.setPaused = options.setPaused;
  }

  openPauseMenu() {
    this.setPaused(true);
    this.pauseOpenedAtMs = performance.now();
    this.controller.setEnabled(false);
    showPauseMenu(
      () => {
        // "Resume Game" button clicked — this IS a user gesture, so we can
        // directly re-enable with pointer lock.
        this.resumeWithPointerLock();
      },
    );
  }

  requestResumeFromToggle() {
    if (!isPauseMenuVisible()) return;
    if ((performance.now() - this.pauseOpenedAtMs) < PauseSceneController.ESC_TOGGLE_DEBOUNCE_MS) {
      return;
    }
    // ESC-triggered resume: unpause but don't try to re-lock cursor.
    // Browser won't allow pointer lock from ESC keydown.
    this.resumeWithFreeCursor();
  }

  handlePausedFrame() {
    if (this.controller.isEnabled()) {
      this.controller.setEnabled(false);
    }
  }

  dispose() {
    // Nothing to clean up anymore.
  }

  /** Resume from a button click (user gesture context — can lock pointer). */
  private resumeWithPointerLock() {
    hidePauseMenu();
    this.setPaused(false);
    this.controller.setEnabled(true);
  }

  /** Resume from ESC key (no user gesture for pointer lock — cursor stays free). */
  private resumeWithFreeCursor() {
    hidePauseMenu();
    this.setPaused(false);
    setPauseResumeMessage('Click to resume');
    this.controller.resumeWithFreeCursor();
  }
}
