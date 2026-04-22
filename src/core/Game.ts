/**
 * Game — Main application class.
 *
 * Creates the Three.js renderer, manages the render loop,
 * handles window resizing, and delegates to SceneManager.
 */

import * as THREE from 'three';
import { SceneManager } from './SceneManager.js';
import { Input } from './Input.js';
import { RENDERER_PIXEL_RATIO_MAX } from './Config.js';
import { loadGameState } from './Save.js';
import type { PlayerSettings } from '../data/types.js';
import { PerformanceMetricsTracker } from './PerformanceMetrics.js';
import { sanitizePlayerSettings } from './PlayerSettings.js';
import {
  TARGET_FRAME_MS,
  ADAPTIVE_RESOLUTION_EVAL_MS,
  ADAPTIVE_RESOLUTION_STEP_DOWN,
  ADAPTIVE_RESOLUTION_STEP_UP,
  ADAPTIVE_RESOLUTION_DOWNSHIFT_MS,
  ADAPTIVE_RESOLUTION_UPSHIFT_MS,
} from './PerformanceBudget.js';
import {
  mountPerformanceHUD,
  setPerformanceHUDVisible,
  unmountPerformanceHUD,
  updatePerformanceHUD,
} from '../ui/performanceHUD.js';

const PERFORMANCE_HUD_STORAGE_KEY = 'catchapon:performance-hud';
const SETTINGS_UPDATED_EVENT = 'catchapon:settings-updated';
const PERFORMANCE_HUD_REFRESH_MS = 900;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export class Game {
  readonly renderer: THREE.WebGLRenderer;
  readonly sceneManager: SceneManager;
  readonly input: Input;

  private clock = new THREE.Clock();
  private animationFrameId = 0;
  private readonly performanceMetrics = new PerformanceMetricsTracker();
  private performanceHUDVisible = false;
  private lastPerformanceHUDPaintAtMs = 0;
  private settings = sanitizePlayerSettings(loadGameState()?.settings);
  private renderScale = 1;
  private minRenderScale = this.settings.minRenderScale;
  private maxRenderScale = this.settings.maxRenderScale;
  private basePixelRatio = 1;
  private smoothedFrameMs = TARGET_FRAME_MS;
  private lastAdaptiveResolutionEvalAtMs = 0;
  public isPaused = false;

  constructor(container: HTMLElement) {
    // —— Renderer ——
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.basePixelRatio = Math.min(
      window.devicePixelRatio || 1,
      RENDERER_PIXEL_RATIO_MAX,
    );
    this.applyPlayerSettings(this.settings, true);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    container.appendChild(this.renderer.domElement);

    // —— Systems ——
    this.sceneManager = new SceneManager();
    this.input = new Input();
    mountPerformanceHUD();
    this.performanceHUDVisible = this.readPerformanceHUDPreference();
    setPerformanceHUDVisible(this.performanceHUDVisible);
    if (this.performanceHUDVisible) {
      updatePerformanceHUD(this.performanceMetrics.getSnapshot());
    }

    // —— Resize ——
    window.addEventListener('resize', this.onResize);
    window.addEventListener(SETTINGS_UPDATED_EVENT, this.onSettingsUpdated as EventListener);
  }

  /** Start the render loop */
  start() {
    this.clock.start();
    this.loop();
  }

  /** Stop the render loop and clean up */
  stop() {
    cancelAnimationFrame(this.animationFrameId);
    this.sceneManager.dispose();
    this.input.dispose();
    this.performanceMetrics.dispose();
    unmountPerformanceHUD();
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener(
      SETTINGS_UPDATED_EVENT,
      this.onSettingsUpdated as EventListener,
    );
    this.renderer.dispose();
  }

  /** The main render loop */
  private loop = () => {
    this.animationFrameId = requestAnimationFrame(this.loop);
    const frameStartMs = performance.now();

    const rawDt = Math.min(this.clock.getDelta(), 1 / 30); // cap dt to avoid spiral of death
    const frameMs = rawDt * 1000;
    this.smoothedFrameMs += (frameMs - this.smoothedFrameMs) * 0.08;
    this.updateAdaptiveResolution(frameStartMs);

    let dt = rawDt;

    if (this.isPaused) {
      dt = 0; // Freeze time for scenes, but still let them render
    }

    this.sceneManager.update(dt);

    if (this.input.isPerformanceTogglePressed()) {
      this.setPerformanceHUDEnabled(!this.performanceHUDVisible);
    }

    if (this.performanceHUDVisible) {
      const activeScene = this.sceneManager.getCurrent();
      const sceneName = activeScene?.constructor?.name ?? null;
      const stepCpuMs = performance.now() - frameStartMs;
      const snapshot = this.performanceMetrics.sample(
        frameMs,
        stepCpuMs,
        this.renderer,
        this.isPaused,
        sceneName,
        frameStartMs,
      );
      if (
        (frameStartMs - this.lastPerformanceHUDPaintAtMs) >=
        PERFORMANCE_HUD_REFRESH_MS
      ) {
        updatePerformanceHUD(snapshot);
        this.lastPerformanceHUDPaintAtMs = frameStartMs;
      }
    }

    this.input.endFrame();
  };

  private readPerformanceHUDPreference(): boolean {
    try {
      return window.localStorage.getItem(PERFORMANCE_HUD_STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  }

  private setPerformanceHUDEnabled(enabled: boolean) {
    this.performanceHUDVisible = enabled;
    setPerformanceHUDVisible(enabled);

    if (enabled) {
      this.lastPerformanceHUDPaintAtMs = 0;
      updatePerformanceHUD(this.performanceMetrics.getSnapshot());
    }

    try {
      window.localStorage.setItem(PERFORMANCE_HUD_STORAGE_KEY, enabled ? '1' : '0');
    } catch {
      // Ignore persistence failures (e.g., private mode/localStorage blocked).
    }
  }

  private updateAdaptiveResolution(nowMs: number) {
    if (this.isPaused) return;

    if (!this.settings.dynamicResolution) {
      this.applyRenderScale(this.maxRenderScale);
      return;
    }

    if (
      nowMs - this.lastAdaptiveResolutionEvalAtMs <
      ADAPTIVE_RESOLUTION_EVAL_MS
    ) {
      return;
    }
    this.lastAdaptiveResolutionEvalAtMs = nowMs;

    let nextScale = this.renderScale;
    if (this.smoothedFrameMs > ADAPTIVE_RESOLUTION_DOWNSHIFT_MS) {
      nextScale -= ADAPTIVE_RESOLUTION_STEP_DOWN;
    } else if (this.smoothedFrameMs < ADAPTIVE_RESOLUTION_UPSHIFT_MS) {
      nextScale += ADAPTIVE_RESOLUTION_STEP_UP;
    }

    this.applyRenderScale(nextScale);
  }

  // Apply player graphics settings and keep adaptive DPR bounded.
  private applyPlayerSettings(nextSettings: PlayerSettings, force = false) {
    this.settings = sanitizePlayerSettings(nextSettings);
    this.minRenderScale = clamp(this.settings.minRenderScale, 0.55, 1);
    this.maxRenderScale = clamp(this.settings.maxRenderScale, 0.6, 1);
    if (this.minRenderScale > this.maxRenderScale) {
      this.minRenderScale = this.maxRenderScale;
    }

    if (!this.settings.dynamicResolution) {
      this.applyRenderScale(this.maxRenderScale, true);
      return;
    }

    const initialScale = force
      ? this.maxRenderScale
      : clamp(this.renderScale, this.minRenderScale, this.maxRenderScale);
    this.applyRenderScale(initialScale, true);
  }

  private applyRenderScale(scale: number, force = false) {
    const clampedScale = clamp(scale, this.minRenderScale, this.maxRenderScale);
    if (!force && Math.abs(clampedScale - this.renderScale) < 0.015) return;

    this.renderScale = clampedScale;
    this.renderer.setPixelRatio(this.basePixelRatio * clampedScale);
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
  }

  private onSettingsUpdated = (event: CustomEvent<{ settings?: Partial<PlayerSettings> }>) => {
    const incoming = event.detail?.settings;
    if (!incoming) return;
    this.applyPlayerSettings(sanitizePlayerSettings(incoming), true);
  };

  private onResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.basePixelRatio = Math.min(
      window.devicePixelRatio || 1,
      RENDERER_PIXEL_RATIO_MAX,
    );
    this.applyRenderScale(this.renderScale, true);
    this.renderer.setSize(width, height, false);

    // Scenes are responsible for updating their own cameras on resize
    // via listening to a 'resize' event or checking in update()
  };

  /** Get the renderer's DOM element (for pointer lock etc.) */
  get canvas(): HTMLCanvasElement {
    return this.renderer.domElement;
  }
}
