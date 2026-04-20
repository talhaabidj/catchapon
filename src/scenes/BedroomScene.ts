/**
 * BedroomScene — First-person bedroom hub.
 *
 * The player wakes up here after clicking "Start Shift" on the Desktop.
 * They can explore the room, interact with the PC (profile), collection
 * wall (album), and walk to the door to begin the night shift.
 *
 * Uses the shared FirstPersonController for movement/look.
 * Uses InteractionSystem for raycaster-based "Press E" prompts.
 *
 * M5: Loads/saves game state; populates PC stats and collection from save.
 */

import * as THREE from 'three';
import type { Scene, GameState } from '../data/types.js';
import type { Game } from '../core/Game.js';
import { FirstPersonController } from '../core/FirstPersonController.js';
import { InteractionSystem } from '../core/InteractionSystem.js';
import { PLAYER_HEIGHT } from '../core/Config.js';
import type { BedroomCollider } from '../world/Bedroom.js';
import { buildBedroom } from '../world/Bedroom.js';
import { updateCollectionWallVisuals } from '../world/props/CollectionWall.js';
import { loadGameState, createDefaultGameState, saveGameState } from '../core/Save.js';
import { getItemById } from '../data/items.js';
import { CollectionSystem } from '../systems/CollectionSystem.js';
import { EconomySystem } from '../systems/EconomySystem.js';
import { ProgressionSystem } from '../systems/ProgressionSystem.js';
import {
  mountBedroomUI,
  unmountBedroomUI,
  showInteractPrompt,
  hideInteractPrompt,
  hidePCOverlay,
  isPCOverlayVisible,
  hideCollectionOverlay,
  isCollectionOverlayVisible,
  isAnyOverlayOpen,
  openCollectionViewer,
  navigateCollection,
} from '../ui/bedroomUI.js';
import {
  mountPauseUI,
  unmountPauseUI,
  showPauseMenu,
  hidePauseMenu,
  isPauseMenuVisible,
} from '../ui/pauseUI.js';

// Room bounds for collision
const ROOM_HALF_W = 2.3; // slightly inside 2.5 walls
const ROOM_HALF_D = 1.8; // slightly inside 2.0 walls

export class BedroomScene implements Scene {
  private game: Game;
  private scene3d: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controller: FirstPersonController;
  private interaction: InteractionSystem;

  // Persisted state
  private gameState: GameState;
  private colliders: BedroomCollider[] = [];
  private windowVoidAnimator: ((timeSeconds: number) => void) | null = null;
  private resumePointerLockPending = false;
  private resumePointerLockAttempts = 0;
  private resumePointerLockAssistActive = false;
  private pauseResumeRequested = false;
  private awaitingBedroomStartClick = false;
  private isNightShiftStarting = false;
  private isReturningToDesktop = false;
  private bedroomStartOverlayEl: HTMLDivElement | null = null;
  private showStartGateOnLoad: boolean;

  constructor(
    game: Game,
    gameState?: GameState,
    options?: { showStartGateOnLoad?: boolean },
  ) {
    this.game = game;
    this.scene3d = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    );
    this.controller = new FirstPersonController(
      this.game.canvas,
      this.game.input,
    );
    this.interaction = new InteractionSystem();

    // Load game state: use passed-in (from shop return) or load from save
    this.gameState = gameState ?? loadGameState() ?? createDefaultGameState();
    this.showStartGateOnLoad = options?.showStartGateOnLoad ?? gameState === undefined;
  }

  init() {
    // —— Build the bedroom world ——
    const { group, interactables, colliders } = buildBedroom();
    this.scene3d.add(group);
    this.colliders = colliders;

    const windowObj = group.getObjectByName('window');
    const animateVoid = windowObj?.userData['animateVoid'];
    if (typeof animateVoid === 'function') {
      this.windowVoidAnimator = animateVoid as (timeSeconds: number) => void;
    }

    // —— Register interactables ——
    this.interaction.setInteractables(interactables);

    // —— Camera start position (center of room, facing door) ——
    this.camera.position.set(0, PLAYER_HEIGHT, 0.5);
    this.controller.attach(this.camera);

    // —— Mount UI ——
    mountBedroomUI();
    mountPauseUI();
    if (this.showStartGateOnLoad) {
      this.showBedroomStartOverlay();
    }

    // —— Pause Logic ——
    this.controller.onPause = () => {
      // If an overlay is open, ignore pause-triggered unlock events and let
      // the overlay close flow handle it (Q key / close button).
      if (!isAnyOverlayOpen()) {
        this.openPauseMenu();
      }
    };

    // —— Update 3D collection wall with owned items ——
    const collWall = group.getObjectByName('collection-wall');
    if (collWall) {
      const ownedItems = this.gameState.ownedItemIds
        .map((id) => getItemById(id))
        .filter((item): item is NonNullable<typeof item> => item != null);
      updateCollectionWallVisuals(collWall as THREE.Group, ownedItems);
    }

    // —— Resize ——
    window.addEventListener('resize', this.onResize);

    // —— Save state on entering bedroom ——
    saveGameState(this.gameState);
  }

  update(dt: number) {
    const input = this.game.input;
    this.windowVoidAnimator?.(performance.now() * 0.001);

    if (this.awaitingBedroomStartClick) {
      // Guard against pointer-lock races from scene enter; if lock is active,
      // the browser can keep routing clicks to canvas instead of the overlay.
      if (document.pointerLockElement === this.game.canvas) {
        document.exitPointerLock();
      }
      this.game.renderer.render(this.scene3d, this.camera);
      return;
    }

    // —— Pause menu handling ——
    if (isPauseMenuVisible()) {
      if (this.pauseResumeRequested) {
        this.tryResumePointerLock();
        if (document.pointerLockElement === this.game.canvas) {
          this.finishPauseResume();
        }
      } else if (this.controller.isEnabled()) {
        this.controller.setEnabled(false);
      }

      this.game.renderer.render(this.scene3d, this.camera);
      return;
    }

    this.tryResumePointerLock();

    // —— Overlay handling ——
    if (isAnyOverlayOpen()) {
      const pcOpen = isPCOverlayVisible();

      // PC overlay needs cursor; collection should stay pointer-locked.
      if (pcOpen) {
        this.controller.setEnabled(false);
      } else if (!this.controller.isEnabled()) {
        this.controller.setEnabled(true);
      }

      // Collection viewer A/D navigation
      if (isCollectionOverlayVisible()) {
        if (input.isKeyJustPressed('KeyA')) {
          navigateCollection(-1);
        }
        if (input.isKeyJustPressed('KeyD')) {
          navigateCollection(1);
        }
      }

      // Q closes overlays. ESC is reserved for pause to avoid pointer-lock double-press behavior.
      if (input.isKeyJustPressed('KeyQ')) {
        hidePCOverlay();
        hideCollectionOverlay();
        this.controller.setEnabled(true);
        this.game.canvas.requestPointerLock();
      }

      // Render but don't process movement
      this.game.renderer.render(this.scene3d, this.camera);
      return;
    }

    // Explicit ESC pause path keeps pause reliable even if pointer lock is
    // already desynced or not currently active.
    if (input.isMenuPressed()) {
      this.openPauseMenu();
      this.game.renderer.render(this.scene3d, this.camera);
      return;
    }

    // —— Cursor Free Toggle ——
    if (input.isCursorTogglePressed()) {
      this.controller.toggleCursorFree();
    }

    // Ensure controller is enabled when no overlay
    if (!this.controller.isEnabled()) {
      this.controller.setEnabled(true);
    }

    // —— Movement ——
    this.controller.update(dt);

    // —— Simple room bounds collision ——
    this.clampPosition();

    // —— Interaction detection ——
    const target = this.interaction.check(this.camera);

    if (target) {
      showInteractPrompt(target.prompt);

      // Handle E press
      if (input.isInteractPressed()) {
        this.handleInteraction(target.type);
      }
    } else {
      hideInteractPrompt();
    }

    // —— Render ——
    this.game.renderer.render(this.scene3d, this.camera);
  }

  dispose() {
    this.controller.detach();
    this.controller.dispose();
    this.interaction.dispose();
    unmountBedroomUI();
    unmountPauseUI();
    window.removeEventListener('resize', this.onResize);

    // Dispose 3D resources
    this.scene3d.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });

    this.colliders = [];
    this.windowVoidAnimator = null;
    this.stopResumePointerLockAssist();
    this.bedroomStartOverlayEl?.remove();
    this.bedroomStartOverlayEl = null;
    this.awaitingBedroomStartClick = false;
    this.pauseResumeRequested = false;
    this.isNightShiftStarting = false;
    this.isReturningToDesktop = false;
  }

  // —— Interaction handlers ——

  private handleInteraction(type: string) {
    switch (type) {
      case 'pc':
        hideInteractPrompt();
        void this.returnToDesktopStart();
        break;

      case 'collection':
        openCollectionViewer(this.gameState.ownedItemIds);
        this.controller.setEnabled(true);
        this.game.canvas.requestPointerLock();
        break;

      case 'door':
        this.startNightShift();
        break;
    }
  }

  private showBedroomStartOverlay() {
    if (this.awaitingBedroomStartClick || this.bedroomStartOverlayEl) return;

    this.awaitingBedroomStartClick = true;
    this.controller.setEnabled(false);
    hideInteractPrompt();

    this.resumePointerLockPending = false;
    this.stopResumePointerLockAssist();
    if (document.pointerLockElement === this.game.canvas) {
      document.exitPointerLock();
    }

    const overlay = document.createElement('div');
    overlay.id = 'bedroom-shift-start-overlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 1300;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(10, 12, 18, 0.52);
      backdrop-filter: blur(6px) saturate(0.72);
      cursor: pointer;
      user-select: none;
      transition: opacity 0.16s ease;
    `;

    const title = document.createElement('div');
    title.innerText = 'CLICK TO START';
    title.style.cssText = `
      color: #ffffff;
      font-family: 'Segoe UI', sans-serif;
      font-size: clamp(1.8rem, 4vw, 2.4rem);
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      text-shadow: 0 0 26px rgba(255, 255, 255, 0.22);
    `;

    overlay.appendChild(title);

    const beginFromOverlay = () => {
      if (!this.awaitingBedroomStartClick) return;

      this.awaitingBedroomStartClick = false;
      this.bedroomStartOverlayEl = null;

      overlay.style.opacity = '0';
      window.setTimeout(() => {
        overlay.remove();
      }, 160);

      this.controller.setEnabled(true);
      this.game.canvas.requestPointerLock();
    };

    overlay.addEventListener('pointerdown', beginFromOverlay);
    overlay.addEventListener('click', beginFromOverlay);

    this.bedroomStartOverlayEl = overlay;
    document.body.appendChild(overlay);
  }

  private startNightShift() {
    if (this.isNightShiftStarting) return;

    hideInteractPrompt();
    this.isNightShiftStarting = true;
    void this.beginNightShiftTransition();
  }

  private async beginNightShiftTransition() {

    // Quick fade out
    const fade = document.createElement('div');
    fade.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: #000; z-index: 50; opacity: 0;
      transition: opacity 0.6s ease;
    `;
    document.body.appendChild(fade);

    // Trigger fade
    requestAnimationFrame(() => {
      fade.style.opacity = '1';
    });

    // Wait for fade, then transition
    await new Promise((r) => setTimeout(r, 700));

    // Create systems from save state
    const economy = new EconomySystem(this.gameState.money, this.gameState.tokens);
    const collection = new CollectionSystem(this.gameState.ownedItemIds);
    const progression = new ProgressionSystem(
      this.gameState.nightsWorked,
      this.gameState.secretsTriggered,
    );

    const { ShopScene } = await import('./ShopScene.js');
    await this.game.sceneManager.switchTo(
      new ShopScene(
        this.game,
        economy,
        collection,
        progression,
        this.gameState.totalMoneyEarned,
      ),
    );

    // Remove fade (the new scene will handle its own visuals)
    fade.remove();
  }

  private async returnToDesktopStart() {
    if (this.isReturningToDesktop) return;
    this.isReturningToDesktop = true;

    const transitionOverlay = await this.playDesktopReturnTransition();

    this.controller.setEnabled(false);
    this.resumePointerLockPending = false;
    this.stopResumePointerLockAssist();
    if (document.pointerLockElement === this.game.canvas) {
      document.exitPointerLock();
    }

    this.awaitingBedroomStartClick = false;
    this.bedroomStartOverlayEl?.remove();
    this.bedroomStartOverlayEl = null;
    this.pauseResumeRequested = false;

    hidePCOverlay();
    hideCollectionOverlay();
    hidePauseMenu();
    this.game.isPaused = false;
    saveGameState(this.gameState);

    const { DesktopScene } = await import('./DesktopScene.js');
    await this.game.sceneManager.switchTo(new DesktopScene(this.game));

    transitionOverlay.style.opacity = '0';
    window.setTimeout(() => {
      transitionOverlay.remove();
    }, 180);
  }

  private async playDesktopReturnTransition(): Promise<HTMLDivElement> {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 1200;
      pointer-events: none;
      opacity: 0;
      background: rgba(8, 10, 16, 0);
      backdrop-filter: blur(0px) saturate(1);
      transition: opacity 0.2s ease, background 0.28s ease, backdrop-filter 0.28s ease;
    `;
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      overlay.style.background = 'rgba(8, 10, 16, 0.45)';
      overlay.style.backdropFilter = 'blur(6px) saturate(0.82)';
    });

    await new Promise((resolve) => setTimeout(resolve, 220));

    overlay.style.background = '#000000';
    overlay.style.backdropFilter = 'blur(10px) saturate(0.72)';

    await new Promise((resolve) => setTimeout(resolve, 260));
    return overlay;
  }

  // —— Simple AABB room collision ——

  private openPauseMenu() {
    if (isPauseMenuVisible()) return;

    this.game.isPaused = true;
    this.pauseResumeRequested = false;
    this.resumePointerLockPending = false;
    this.resumePointerLockAttempts = 0;
    this.stopResumePointerLockAssist();
    this.controller.setEnabled(false);
    showPauseMenu(
      () => {
        this.resumeFromPauseMenu();
      },
      { requireEscapeRelease: this.game.input.isKeyDown('Escape') },
    );
  }

  private resumeFromPauseMenu() {
    if (this.pauseResumeRequested) return;

    this.pauseResumeRequested = true;
    this.resumePointerLockPending = true;
    this.resumePointerLockAttempts = 0;
    this.startResumePointerLockAssist();
    this.tryResumePointerLock(true);
  }

  private finishPauseResume() {
    hidePauseMenu();
    this.game.isPaused = false;
    this.pauseResumeRequested = false;
    this.resumePointerLockPending = false;
    this.stopResumePointerLockAssist();
    this.controller.setEnabled(true);
  }

  private tryResumePointerLock(allowWhileEscDown = false) {
    if (!this.resumePointerLockPending) return;

    if (document.pointerLockElement === this.game.canvas) {
      this.resumePointerLockPending = false;
      this.stopResumePointerLockAssist();
      return;
    }

    // On non-gesture retries, wait until ESC is released.
    if (!allowWhileEscDown && this.game.input.isKeyDown('Escape')) return;

    if (this.resumePointerLockAttempts >= 90) {
      this.resumePointerLockPending = false;
      this.stopResumePointerLockAssist();
      return;
    }

    this.resumePointerLockAttempts += 1;
    this.game.canvas.requestPointerLock();
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

  private clampPosition() {
    const pos = this.camera.position;
    const playerRadius = 0.28;

    pos.x = Math.max(-ROOM_HALF_W + playerRadius, Math.min(ROOM_HALF_W - playerRadius, pos.x));
    pos.z = Math.max(-ROOM_HALF_D + playerRadius, Math.min(ROOM_HALF_D - playerRadius, pos.z));

    // Prop collisions (desk/chair/bed/shelf/cupboard)
    for (const collider of this.colliders) {
      const boundX = collider.halfW + playerRadius;
      const boundZ = collider.halfD + playerRadius;
      const dx = pos.x - collider.x;
      const dz = pos.z - collider.z;

      if (Math.abs(dx) < boundX && Math.abs(dz) < boundZ) {
        const overlapX = boundX - Math.abs(dx);
        const overlapZ = boundZ - Math.abs(dz);

        if (overlapX < overlapZ) {
          const direction = Math.sign(dx) || 1;
          pos.x += direction * overlapX;
        } else {
          const direction = Math.sign(dz) || 1;
          pos.z += direction * overlapZ;
        }
      }
    }

    pos.y = PLAYER_HEIGHT; // keep on ground
  }

  private onResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  };
}
