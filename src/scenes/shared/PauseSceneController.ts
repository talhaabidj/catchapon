/**
 * PauseSceneController — shared pause + pointer-lock resume flow for first-person scenes.
 *
 * This centralizes ESC pause behavior and browser pointer-lock recovery logic
 * that was previously duplicated across BedroomScene and ShopScene.
 */

import { FirstPersonController } from '../../core/FirstPersonController.js';
import { requestPointerLockSafely } from '../../core/PointerLock.js';
import {
  hidePauseMenu,
  setPauseResumeMessage,
  setPauseResumePending,
  showPauseMenu,
} from '../../ui/pauseUI.js';

interface PauseSceneControllerOptions {
  canvas: HTMLCanvasElement;
  controller: FirstPersonController;
  setPaused: (paused: boolean) => void;
}

export class PauseSceneController {
  private readonly canvas: HTMLCanvasElement;
  private readonly controller: FirstPersonController;
  private readonly setPaused: (paused: boolean) => void;

  private resumeRequestInFlight = false;

  constructor(options: PauseSceneControllerOptions) {
    this.canvas = options.canvas;
    this.controller = options.controller;
    this.setPaused = options.setPaused;
  }

  openPauseMenu() {
    this.setPaused(true);
    this.cancelResumeFlow();
    this.controller.setEnabled(false);
    showPauseMenu(
      () => {
        this.requestResumeFromMenu();
      },
    );
  }

  handlePausedFrame() {
    this.finishResumeIfPointerLocked();
    if (this.controller.isEnabled()) {
      this.controller.setEnabled(false);
    }
  }

  finishResumeIfPointerLocked() {
    if (document.pointerLockElement === this.canvas) {
      this.finishPauseResume();
    }
  }

  cancelResumeFlow() {
    this.resumeRequestInFlight = false;
    setPauseResumePending(false);
  }

  dispose() {
    this.cancelResumeFlow();
  }

  private async requestResumeFromMenu() {
    if (this.resumeRequestInFlight) return;

    this.resumeRequestInFlight = true;
    setPauseResumePending(true);
    setPauseResumeMessage('Locking cursor...');

    const result = await requestPointerLockSafely(this.canvas);
    if (result === 'locked' || document.pointerLockElement === this.canvas) {
      this.finishPauseResume();
      return;
    }

    this.finishPauseResume({ keepCursorFree: true });
  }

  private finishPauseResume(options: { keepCursorFree?: boolean } = {}) {
    hidePauseMenu();
    this.setPaused(false);
    this.resumeRequestInFlight = false;
    setPauseResumePending(false);
    if (options.keepCursorFree) {
      this.controller.resumeWithFreeCursor();
    } else {
      this.controller.setEnabled(true);
    }
  }
}
