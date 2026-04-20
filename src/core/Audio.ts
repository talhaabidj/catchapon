/**
 * Audio — lightweight procedural feedback for key game beats.
 *
 * Catchapon does not ship authored audio assets yet, so this uses short Web
 * Audio tones for confirmation, rewards, errors, and gacha anticipation.
 */

import { DEFAULT_SETTINGS } from './Config.js';
import { loadGameState } from './Save.js';

type SfxKey =
  | 'ui'
  | 'transition'
  | 'success'
  | 'error'
  | 'coin'
  | 'crank'
  | 'reveal'
  | 'secret'
  | 'nightEnd';

interface ToneStep {
  frequency: number;
  duration: number;
  delay?: number;
  gain?: number;
  type?: OscillatorType;
}

type AudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

const SFX: Record<SfxKey, ToneStep[]> = {
  ui: [{ frequency: 660, duration: 0.055, gain: 0.045, type: 'triangle' }],
  transition: [
    { frequency: 220, duration: 0.08, gain: 0.035, type: 'sine' },
    { frequency: 330, duration: 0.12, delay: 0.07, gain: 0.04, type: 'sine' },
  ],
  success: [
    { frequency: 523.25, duration: 0.08, gain: 0.045, type: 'triangle' },
    { frequency: 783.99, duration: 0.12, delay: 0.08, gain: 0.04, type: 'triangle' },
  ],
  error: [{ frequency: 164.81, duration: 0.12, gain: 0.04, type: 'sawtooth' }],
  coin: [
    { frequency: 880, duration: 0.04, gain: 0.04, type: 'square' },
    { frequency: 1174.66, duration: 0.07, delay: 0.045, gain: 0.035, type: 'triangle' },
  ],
  crank: [
    { frequency: 146.83, duration: 0.08, gain: 0.032, type: 'sawtooth' },
    { frequency: 196, duration: 0.08, delay: 0.08, gain: 0.032, type: 'sawtooth' },
    { frequency: 246.94, duration: 0.12, delay: 0.16, gain: 0.036, type: 'triangle' },
  ],
  reveal: [
    { frequency: 659.25, duration: 0.09, gain: 0.045, type: 'sine' },
    { frequency: 987.77, duration: 0.16, delay: 0.09, gain: 0.04, type: 'triangle' },
  ],
  secret: [
    { frequency: 392, duration: 0.1, gain: 0.035, type: 'sine' },
    { frequency: 739.99, duration: 0.18, delay: 0.1, gain: 0.035, type: 'sine' },
  ],
  nightEnd: [
    { frequency: 329.63, duration: 0.08, gain: 0.035, type: 'triangle' },
    { frequency: 493.88, duration: 0.09, delay: 0.08, gain: 0.04, type: 'triangle' },
    { frequency: 659.25, duration: 0.16, delay: 0.17, gain: 0.04, type: 'triangle' },
  ],
};

class GameAudio {
  private context: AudioContext | null = null;
  private masterVolume: number = DEFAULT_SETTINGS.masterVolume;
  private sfxVolume: number = DEFAULT_SETTINGS.sfxVolume;

  unlock(): void {
    if (typeof window === 'undefined') return;

    if (!this.context) {
      const AudioContextCtor =
        window.AudioContext ?? (window as AudioWindow).webkitAudioContext;
      if (!AudioContextCtor) return;
      this.context = new AudioContextCtor();
    }

    this.syncSettings();
    if (this.context.state === 'suspended') {
      void this.context.resume().catch(() => undefined);
    }
  }

  syncSettings(): void {
    const settings = loadGameState()?.settings ?? DEFAULT_SETTINGS;
    this.masterVolume = settings.masterVolume;
    this.sfxVolume = settings.sfxVolume;
  }

  play(key: SfxKey): void {
    this.unlock();
    if (!this.context) return;

    if (this.context.state !== 'running') {
      void this.context.resume()
        .then(() => {
          this.playSequence(key);
        })
        .catch(() => undefined);
      return;
    }

    this.playSequence(key);
  }

  private playSequence(key: SfxKey): void {
    if (!this.context || this.context.state !== 'running') return;

    const volume = this.masterVolume * this.sfxVolume;
    if (volume <= 0) return;

    const startTime = this.context.currentTime;
    for (const step of SFX[key]) {
      this.playTone(startTime, step, volume);
    }
  }

  private playTone(startTime: number, step: ToneStep, volume: number): void {
    if (!this.context) return;

    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    const time = startTime + (step.delay ?? 0);
    const peakGain = (step.gain ?? 0.04) * volume;

    oscillator.type = step.type ?? 'sine';
    oscillator.frequency.setValueAtTime(step.frequency, time);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(peakGain, time + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + step.duration);

    oscillator.connect(gain);
    gain.connect(this.context.destination);
    oscillator.start(time);
    oscillator.stop(time + step.duration + 0.02);
  }
}

export const gameAudio = new GameAudio();
