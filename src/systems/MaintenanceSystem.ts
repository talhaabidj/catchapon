/**
 * MaintenanceSystem — Tracks per-machine state.
 *
 * Each machine can be clean/dirty, stocked/empty, jammed, or unpowered.
 * Maintenance actions change these flags and affect gacha pulls.
 */

import type { MachineState } from '../data/types.js';
import { MACHINES } from '../data/machines.js';

export class MaintenanceSystem {
  private states: Map<string, MachineState> = new Map();

  /** Initialize all machines with default (degraded) state for a night */
  initializeForNight(
    availableMachineIds: string[],
    difficultyModifier: number,
    rng: () => number = Math.random,
  ) {
    this.states.clear();

    for (const id of availableMachineIds) {
      const machine = MACHINES.find((m) => m.id === id);
      if (!machine) continue;

      // Higher difficulty = more problems
      const dirtyChance = 0.22 * difficultyModifier;
      const lowStockChance = 0.16 * difficultyModifier;
      const jamChance = machine.quirks.includes('jams-often')
        ? 0.24 * difficultyModifier
        : 0.08 * difficultyModifier;
      const unpoweredChance = 0.06 * difficultyModifier;

      const state: MachineState = {
        machineId: id,
        cleanliness: rng() < dirtyChance ? 'dirty' : 'clean',
        stockLevel: rng() < lowStockChance
          ? (rng() < 0.18 ? 'empty' : 'low')
          : 'ok',
        isJammed: rng() < jamChance,
        isPowered: rng() >= unpoweredChance,
      };

      // Avoid stacked blocking issues (e.g. jammed + unpowered + empty) on spawn.
      this.normalizeBlockingIssues(state, rng);

      this.states.set(id, state);
    }
  }

  /** Get current state for a machine */
  getState(machineId: string): MachineState | undefined {
    return this.states.get(machineId);
  }

  /** Get all machine states */
  getAllStates(): MachineState[] {
    return [...this.states.values()];
  }

  /** Clean a machine */
  cleanMachine(machineId: string): boolean {
    const state = this.states.get(machineId);
    if (!state || state.cleanliness === 'clean') return false;
    state.cleanliness = 'clean';
    return true;
  }

  /** Restock a machine */
  restockMachine(machineId: string): boolean {
    const state = this.states.get(machineId);
    if (!state || state.stockLevel === 'ok') return false;
    state.stockLevel = 'ok';
    return true;
  }

  /** Fix a jammed machine */
  fixJam(machineId: string): boolean {
    const state = this.states.get(machineId);
    if (!state || !state.isJammed) return false;
    state.isJammed = false;
    return true;
  }

  /** Rewire/power a machine */
  rewire(machineId: string): boolean {
    const state = this.states.get(machineId);
    if (!state || state.isPowered) return false;
    state.isPowered = true;
    return true;
  }

  /** Check if a machine can be pulled from */
  canPull(machineId: string): boolean {
    const state = this.states.get(machineId);
    if (!state) return false;
    return (
      state.isPowered &&
      !state.isJammed &&
      state.stockLevel !== 'empty'
    );
  }

  /**
   * Get a list of issues with a machine (for task matching).
   * Returns empty array if machine is in perfect condition.
   */
  getIssues(machineId: string): string[] {
    const state = this.states.get(machineId);
    if (!state) return [];

    const issues: string[] = [];
    if (state.cleanliness === 'dirty') issues.push('dirty');
    if (state.stockLevel !== 'ok') issues.push('needs-restock');
    if (state.isJammed) issues.push('jammed');
    if (!state.isPowered) issues.push('unpowered');
    return issues;
  }

  /** Reset */
  reset() {
    this.states.clear();
  }

  private normalizeBlockingIssues(state: MachineState, rng: () => number) {
    const blockers: Array<'power' | 'jam' | 'stock'> = [];
    if (!state.isPowered) blockers.push('power');
    if (state.isJammed) blockers.push('jam');
    if (state.stockLevel === 'empty') blockers.push('stock');

    if (blockers.length <= 1) return;

    const keep = blockers[Math.floor(rng() * blockers.length)]!;
    if (keep !== 'power') state.isPowered = true;
    if (keep !== 'jam') state.isJammed = false;
    if (keep !== 'stock' && state.stockLevel === 'empty') state.stockLevel = 'low';
  }
}
