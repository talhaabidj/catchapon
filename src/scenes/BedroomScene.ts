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
import { PauseSceneController } from './shared/PauseSceneController.js';
import { clampBedroomPosition } from './bedroom/BedroomCollision.js';
import {
  createBlackFadeOverlay,
  fadeToBlack,
  playDesktopReturnTransition,
} from './bedroom/BedroomTransitions.js';
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
  hidePauseMenu,
  isPauseMenuVisible,
} from '../ui/pauseUI.js';

export class BedroomScene implements Scene {
  private game: Game;
  private scene3d: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controller: FirstPersonController;
  private interaction: InteractionSystem;
  private pauseController: PauseSceneController;

  // Persisted state
  private gameState: GameState;
  private colliders: BedroomCollider[] = [];
  private windowVoidAnimator: ((timeSeconds: number) => void) | null = null;
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
    this.pauseController = new PauseSceneController({
      input: this.game.input,
      canvas: this.game.canvas,
      controller: this.controller,
      setPaused: (paused) => {
        this.game.isPaused = paused;
      },
    });
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
      this.pauseController.handlePausedFrame();

      this.game.renderer.render(this.scene3d, this.camera);
      return;
    }

    this.pauseController.tryResumePointerLock();

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
    clampBedroomPosition(this.camera.position, this.colliders);

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
    this.pauseController.dispose();
    this.bedroomStartOverlayEl?.remove();
    this.bedroomStartOverlayEl = null;
    this.awaitingBedroomStartClick = false;
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

    this.pauseController.cancelResumeFlow();
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
    const fade = createBlackFadeOverlay();
    await fadeToBlack(fade, 700);

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

    const transitionOverlay = await playDesktopReturnTransition();

    this.controller.setEnabled(false);
    this.pauseController.cancelResumeFlow();
    if (document.pointerLockElement === this.game.canvas) {
      document.exitPointerLock();
    }

    this.awaitingBedroomStartClick = false;
    this.bedroomStartOverlayEl?.remove();
    this.bedroomStartOverlayEl = null;

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

  // —— Simple AABB room collision ——

  private openPauseMenu() {
    if (isPauseMenuVisible()) return;
    this.pauseController.openPauseMenu();
  }

  private onResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  };
}
