/**
 * PauseSceneController — shared pause + pointer-lock resume flow for first-person scenes.
 *
 * This centralizes ESC pause behavior and browser pointer-lock recovery logic
 * that was previously duplicated across BedroomScene and ShopScene.
 */

import type { Input } from '../../core/Input.js';
import { FirstPersonController } from '../../core/FirstPersonController.js';
import { hidePauseMenu, showPauseMenu } from '../../ui/pauseUI.js';

interface PauseSceneControllerOptions {
  input: Input;
  canvas: HTMLCanvasElement;
  controller: FirstPersonController;
  setPaused: (paused: boolean) => void;
}

export class PauseSceneController {
  private readonly input: Input;
  private readonly canvas: HTMLCanvasElement;
  private readonly controller: FirstPersonController;
  private readonly setPaused: (paused: boolean) => void;

  private pauseResumeRequested = false;
  private resumePointerLockPending = false;
  private resumePointerLockAttempts = 0;
  private resumePointerLockAssistActive = false;

  constructor(options: PauseSceneControllerOptions) {
    this.input = options.input;
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
      { requireEscapeRelease: this.input.isKeyDown('Escape') },
    );
  }

  handlePausedFrame() {
    if (this.pauseResumeRequested) {
      this.tryResumePointerLock();
      if (document.pointerLockElement === this.canvas) {
        this.finishPauseResume();
      }
      return;
    }

    if (this.controller.isEnabled()) {
      this.controller.setEnabled(false);
    }
  }

  tryResumePointerLock(allowWhileEscDown = false) {
    if (!this.resumePointerLockPending) return;

    if (document.pointerLockElement === this.canvas) {
      this.resumePointerLockPending = false;
      this.stopResumePointerLockAssist();
      return;
    }

    if (!allowWhileEscDown && this.input.isKeyDown('Escape')) return;

    if (this.resumePointerLockAttempts >= 90) {
      this.resumePointerLockPending = false;
      this.stopResumePointerLockAssist();
      return;
    }

    this.resumePointerLockAttempts += 1;
    this.canvas.requestPointerLock();
  }

  cancelResumeFlow() {
    this.pauseResumeRequested = false;
    this.resumePointerLockPending = false;
    this.resumePointerLockAttempts = 0;
    this.stopResumePointerLockAssist();
  }

  dispose() {
    this.cancelResumeFlow();
  }

  private requestResumeFromMenu() {
    if (this.pauseResumeRequested) return;

    this.pauseResumeRequested = true;
    this.resumePointerLockPending = true;
    this.resumePointerLockAttempts = 0;
    this.startResumePointerLockAssist();
    this.tryResumePointerLock(true);
  }

  private finishPauseResume() {
    hidePauseMenu();
    this.setPaused(false);
    this.pauseResumeRequested = false;
    this.resumePointerLockPending = false;
    this.stopResumePointerLockAssist();
    this.controller.setEnabled(true);
  }

  private startResumePointerLockAssist() {
    if (this.resumePointerLockAssistActive) return;
    document.addEventListener('pointerdown', this.onResumePointerDownCapture, true);
    this.resumePointerLockAssistActive = true;
  }

  private stopResumePointerLockAssist() {
    if (!this.resumePointerLockAssistActive) return;
    document.removeEventListener('pointerdown', this.onResumePointerDownCapture, true);
    this.resumePointerLockAssistActive = false;
  }

  private onResumePointerDownCapture = () => {
    if (!this.resumePointerLockPending) {
      this.stopResumePointerLockAssist();
      return;
    }

    this.tryResumePointerLock(true);
  };
}
