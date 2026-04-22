import { describe, it, expect } from 'vitest';
import { sanitizePlayerSettings } from '../../src/core/PlayerSettings.js';

describe('PlayerSettings', () => {
  it('falls back to safe defaults for invalid values', () => {
    const settings = sanitizePlayerSettings({
      masterVolume: 2,
      sfxVolume: -1,
      dynamicResolution: true,
      minRenderScale: 2,
      maxRenderScale: -1,
    });

    expect(settings.masterVolume).toBe(1);
    expect(settings.sfxVolume).toBe(0);
    expect(settings.minRenderScale).toBeLessThanOrEqual(settings.maxRenderScale);
  });

  it('clamps render scale to safe ranges', () => {
    const settings = sanitizePlayerSettings({
      minRenderScale: 0.5,
      maxRenderScale: 1.5,
    });

    expect(settings.minRenderScale).toBeGreaterThanOrEqual(0.55);
    expect(settings.maxRenderScale).toBeLessThanOrEqual(1);
  });
});
