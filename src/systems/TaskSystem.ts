/**
 * TaskSystem — Generates and tracks nightly maintenance tasks.
 *
 * Uses task templates and progression to create varied work each night.
 */

import type { TaskTemplate, ActiveTask, MachineState } from '../data/types.js';
import { TASK_TEMPLATES } from '../data/tasks.js';

export class TaskSystem {
  private activeTasks: ActiveTask[] = [];

  /**
   * Generate tasks tied to actual machine issues for this night.
   * Remaining quota is filled with floor-cleaning tasks.
   */
  generateTasksFromMaintenance(
    count: number,
    machineStates: Map<string, MachineState>,
    rng: () => number = Math.random,
  ): ActiveTask[] {
    this.activeTasks = [];

    if (count <= 0) return [];

    const floorTemplate = TASK_TEMPLATES.find((t) => t.type === 'clean_floor');

    const criticalIssueCandidates: Array<{ templateId: string; targetId: string }> = [];
    const routineIssueCandidates: Array<{ templateId: string; targetId: string }> = [];
    machineStates.forEach((state, machineId) => {
      if (!state.isPowered) {
        criticalIssueCandidates.push({ templateId: 'task-rewire', targetId: machineId });
      }
      if (state.isJammed) {
        criticalIssueCandidates.push({ templateId: 'task-fix-jam', targetId: machineId });
      }
      if (state.stockLevel === 'empty') {
        criticalIssueCandidates.push({ templateId: 'task-restock', targetId: machineId });
      }

      if (state.cleanliness === 'dirty') {
        routineIssueCandidates.push({ templateId: 'task-wipe-glass', targetId: machineId });
      }
      if (state.stockLevel === 'low') {
        routineIssueCandidates.push({ templateId: 'task-restock', targetId: machineId });
      }
    });

    this.shuffleInPlace(criticalIssueCandidates, rng);
    this.shuffleInPlace(routineIssueCandidates, rng);

    const desiredFloorCount = floorTemplate
      ? Math.max(count > 1 ? 1 : 0, Math.round(count * 0.35))
      : 0;

    const machineSlots = Math.max(0, count - desiredFloorCount);
    const requiredMachineSlots = Math.min(count, criticalIssueCandidates.length);
    const finalMachineSlots = Math.max(machineSlots, requiredMachineSlots);

    const selectedIssueTasks: Array<{ templateId: string; targetId: string }> = [];
    selectedIssueTasks.push(...criticalIssueCandidates.slice(0, finalMachineSlots));

    let routineIdx = 0;
    while (selectedIssueTasks.length < finalMachineSlots && routineIdx < routineIssueCandidates.length) {
      selectedIssueTasks.push(routineIssueCandidates[routineIdx]!);
      routineIdx += 1;
    }

    for (const task of selectedIssueTasks) {
      this.activeTasks.push({
        templateId: task.templateId,
        targetId: task.targetId,
        isCompleted: false,
      });
    }

    let floorTaskIndex = 0;
    while (this.activeTasks.length < count && floorTemplate) {
      this.activeTasks.push({
        templateId: floorTemplate.id,
        targetId: `floor-spot-${floorTaskIndex}`,
        isCompleted: false,
      });
      floorTaskIndex += 1;
    }

    // If floor template is unavailable for any reason, backfill with extra issue tasks.
    let extraIssueIndex = routineIdx;
    while (this.activeTasks.length < count && extraIssueIndex < routineIssueCandidates.length) {
      const task = routineIssueCandidates[extraIssueIndex]!;
      this.activeTasks.push({
        templateId: task.templateId,
        targetId: task.targetId,
        isCompleted: false,
      });
      extraIssueIndex += 1;
    }

    return [...this.activeTasks];
  }

  /**
   * Generate tasks for a night.
   *
   * @param count - Number of tasks to generate
   * @param availableMachineIds - Machines available this night
   * @param rng - Optional RNG for testing
   */
  generateTasks(
    count: number,
    availableMachineIds: string[],
    rng: () => number = Math.random,
  ): ActiveTask[] {
    this.activeTasks = [];

    const floorTaskTemplates = TASK_TEMPLATES.filter(
      (t) => t.targetType === 'floor',
    );
    const machineTaskTemplates = TASK_TEMPLATES.filter(
      (t) => t.targetType === 'machine',
    );

    for (let i = 0; i < count; i++) {
      // Mix of floor and machine tasks (~30% floor, ~70% machine)
      const isFloorTask = rng() < 0.3 && floorTaskTemplates.length > 0;

      let template: TaskTemplate;
      let targetId: string;

      if (isFloorTask) {
        const idx = Math.floor(rng() * floorTaskTemplates.length);
        template = floorTaskTemplates[idx]!;
        targetId = `floor-spot-${i}`;
      } else {
        const idx = Math.floor(rng() * machineTaskTemplates.length);
        template = machineTaskTemplates[idx]!;
        // Assign to a random available machine
        const machineIdx = Math.floor(rng() * availableMachineIds.length);
        targetId = availableMachineIds[machineIdx] ?? 'machine-neko';
      }

      this.activeTasks.push({
        templateId: template.id,
        targetId,
        isCompleted: false,
      });
    }

    return [...this.activeTasks];
  }

  /** Mark a task as completed by index */
  completeTask(index: number): boolean {
    const task = this.activeTasks[index];
    if (!task || task.isCompleted) return false;
    task.isCompleted = true;
    return true;
  }

  /** Get all active tasks */
  getTasks(): readonly ActiveTask[] {
    return this.activeTasks;
  }

  /** Get count of completed tasks */
  getCompletedCount(): number {
    return this.activeTasks.filter((t) => t.isCompleted).length;
  }

  /** Get total task count */
  getTotalCount(): number {
    return this.activeTasks.length;
  }

  /** Check if all tasks are completed */
  isAllCompleted(): boolean {
    return (
      this.activeTasks.length > 0 &&
      this.activeTasks.every((t) => t.isCompleted)
    );
  }

  /** Check if minimum quota is met (at least half) */
  isQuotaMet(): boolean {
    const half = Math.ceil(this.activeTasks.length / 2);
    return this.getCompletedCount() >= half;
  }

  /** Get the reward for a task template */
  getTaskReward(templateId: string): number {
    const template = TASK_TEMPLATES.find((t) => t.id === templateId);
    return template?.baseReward ?? 0;
  }

  /** Get time cost for a task template */
  getTaskTimeCost(templateId: string): number {
    const template = TASK_TEMPLATES.find((t) => t.id === templateId);
    return template?.timeCost ?? 10;
  }

  /** Reset for a new night */
  reset() {
    this.activeTasks = [];
  }

  /** Replace current active tasks with a curated list */
  setTasks(tasks: ActiveTask[]) {
    this.activeTasks = [...tasks];
  }

  private shuffleInPlace<T>(arr: T[], rng: () => number) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j]!, arr[i]!];
    }
  }
}
