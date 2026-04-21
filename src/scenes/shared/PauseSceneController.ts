/**
 * PauseSceneController — shared pause + pointer-lock resume flow for first-person scenes.
 *
 * Flow:
 *   1. ESC pressed → game pauses, cursor unlocks, screen blurs, pause UI shown
 *   2. ESC pressed again / "Resume Game" → pause UI closes, click-to-resume gate stays
 *   3. User clicks gate → pointer lock requested, gameplay resumes
 */

import { FirstPersonController } from '../../core/FirstPersonController.js';
import { requestPointerLockSafely } from '../../core/PointerLock.js';
import {
  hidePauseMenu,
  isPauseMenuVisible,
  showPauseMenu,
} from '../../ui/pauseUI.js';

interface PauseSceneControllerOptions {
  controller: FirstPersonController;
  canvas: HTMLCanvasElement;
  setPaused: (paused: boolean) => void;
}

export class PauseSceneController {
  private readonly controller: FirstPersonController;
  private readonly canvas: HTMLCanvasElement;
  private readonly setPaused: (paused: boolean) => void;

  private clickToResumeVisible = false;
  private clickToResumeOverlay: HTMLDivElement | null = null;
  private clickToResumeHint: HTMLParagraphElement | null = null;
  private clickToResumePending = false;
  private pauseOpenedAtMs = 0;
  private static readonly ESC_TOGGLE_DEBOUNCE_MS = 140;

  constructor(options: PauseSceneControllerOptions) {
    this.controller = options.controller;
    this.canvas = options.canvas;
    this.setPaused = options.setPaused;
  }

  openPauseMenu() {
    this.setPaused(true);
    this.pauseOpenedAtMs = performance.now();
    this.controller.setEnabled(false);
    this.showClickToResumeOverlay();

    // Exit pointer lock so the user has a free cursor
    if (document.pointerLockElement === this.canvas) {
      document.exitPointerLock();
    }

    showPauseMenu(
      () => {
        this.beginResumeGate();
      },
    );
  }

  requestResumeFromToggle() {
    if (!isPauseMenuVisible()) return;
    if ((performance.now() - this.pauseOpenedAtMs) < PauseSceneController.ESC_TOGGLE_DEBOUNCE_MS) {
      return;
    }

    this.beginResumeGate();
  }

  handlePausedFrame() {
    if (this.controller.isEnabled()) {
      this.controller.setEnabled(false);
    }
  }

  /** Shared scenes use this to freeze gameplay until click-to-resume succeeds. */
  isClickToStartVisible(): boolean {
    return this.clickToResumeVisible;
  }

  dispose() {
    this.clickToResumeOverlay?.remove();
    this.clickToResumeOverlay = null;
    this.clickToResumeHint = null;
    this.clickToResumeVisible = false;
    this.clickToResumePending = false;
  }

  // ——— Private ———

  private beginResumeGate() {
    if (!isPauseMenuVisible()) return;
    hidePauseMenu();
    this.setPaused(false);
    this.controller.setEnabled(false);
    this.showClickToResumeOverlay('Click to lock cursor and continue');
  }

  private showClickToResumeOverlay(hint = 'Click to lock cursor and continue') {
    const overlay = this.ensureClickToResumeOverlay();
    this.clickToResumeVisible = true;
    this.clickToResumePending = false;
    overlay.style.display = 'flex';
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'auto';
    if (this.clickToResumeHint) {
      this.clickToResumeHint.innerText = hint;
    }
  }

  private hideClickToResumeOverlay() {
    const overlay = this.clickToResumeOverlay;
    if (!overlay) return;
    this.clickToResumeVisible = false;
    this.clickToResumePending = false;
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    window.setTimeout(() => {
      if (!this.clickToResumeVisible) {
        overlay.style.display = 'none';
      }
    }, 120);
  }

  private ensureClickToResumeOverlay(): HTMLDivElement {
    if (this.clickToResumeOverlay) return this.clickToResumeOverlay;

    const overlay = document.createElement('div');
    overlay.id = 'pause-click-resume-overlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 980;
      display: none;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 0.55rem;
      background: rgba(7, 9, 14, 0.68);
      backdrop-filter: blur(7px);
      color: #ffffff;
      text-align: center;
      user-select: none;
      cursor: pointer;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.12s ease;
      font-family: 'Segoe UI', sans-serif;
    `;

    const title = document.createElement('h2');
    title.innerText = 'CLICK TO RESUME';
    title.style.cssText = `
      margin: 0;
      font-size: clamp(1.5rem, 3.1vw, 2.25rem);
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      text-shadow: 0 0 24px rgba(255, 255, 255, 0.24);
    `;
    overlay.appendChild(title);

    const hint = document.createElement('p');
    hint.innerText = 'Click to lock cursor and continue';
    hint.style.cssText = `
      margin: 0;
      color: #c3cbdf;
      font-size: 0.95rem;
      letter-spacing: 0.02em;
    `;
    overlay.appendChild(hint);
    this.clickToResumeHint = hint;

    const tryResume = () => {
      void this.resumeFromClick();
    };
    overlay.addEventListener('pointerdown', tryResume);
    overlay.addEventListener('click', tryResume);

    document.body.appendChild(overlay);
    this.clickToResumeOverlay = overlay;
    return overlay;
  }

  private async resumeFromClick() {
    if (!this.clickToResumeVisible || this.clickToResumePending) return;
    this.clickToResumePending = true;
    if (this.clickToResumeHint) {
      this.clickToResumeHint.innerText = 'Locking cursor...';
    }

    this.hideClickToResumeOverlay();
    this.controller.resumeWithFreeCursor();

    const lockResult = await requestPointerLockSafely(this.canvas, { timeoutMs: 1200 });
    if (lockResult === 'locked') {
      return;
    }
  }
}
