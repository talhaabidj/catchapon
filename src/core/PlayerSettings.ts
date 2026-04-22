import { DEFAULT_SETTINGS, MOUSE_SENSITIVITY } from './Config.js';
import type { PlayerSettings } from '../data/types.js';

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function sanitizePlayerSettings(
  input?: Partial<PlayerSettings>,
): PlayerSettings {
  const merged = {
    ...DEFAULT_SETTINGS,
    ...(input ?? {}),
  };

  const masterVolume = clamp(merged.masterVolume, 0, 1);
  const sfxVolume = clamp(merged.sfxVolume, 0, 1);
  const musicVolume = clamp(merged.musicVolume, 0, 1);
  const mouseSensitivity = clamp(merged.mouseSensitivity, 0.0006, 0.01);
  const invertY = Boolean(merged.invertY);
  const dynamicResolution = Boolean(merged.dynamicResolution);

  let minRenderScale = clamp(merged.minRenderScale, 0.55, 1);
  const maxRenderScale = clamp(merged.maxRenderScale, 0.6, 1);
  if (minRenderScale > maxRenderScale) {
    minRenderScale = maxRenderScale;
  }

  return {
    masterVolume,
    sfxVolume,
    musicVolume,
    mouseSensitivity: Number.isFinite(mouseSensitivity)
      ? mouseSensitivity
      : MOUSE_SENSITIVITY,
    invertY,
    dynamicResolution,
    minRenderScale,
    maxRenderScale,
  };
}
