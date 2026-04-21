import type { ActiveTask, MachineState } from '../../data/types.js';

export function createTokenStationState(
  difficultyModifier: number,
  rng: () => number = Math.random,
): MachineState {
  const dirtyChance = 0.24 * difficultyModifier;
  const lowStockChance = 0.14 * difficultyModifier;
  const jamChance = 0.035 * difficultyModifier;

  let cleanliness: MachineState['cleanliness'] = rng() < dirtyChance ? 'dirty' : 'clean';
  let isJammed = rng() < jamChance;

  // Avoid stacked terminal blockers; keep one issue type readable at a time.
  if (cleanliness === 'dirty' && isJammed) {
    if (rng() < 0.7) {
      isJammed = false;
    } else {
      cleanliness = 'clean';
    }
  }

  const stockLevel: MachineState['stockLevel'] = rng() < lowStockChance ? 'low' : 'ok';

  return {
    machineId: 'token-station',
    cleanliness,
    stockLevel,
    isJammed,
    // Token station should always have power in this service loop variant.
    isPowered: true,
  };
}

export function getTokenStationIssueTemplateIds(state: MachineState): string[] {
  const ids: string[] = [];
  if (!state.isPowered) ids.push('task-rewire');
  if (state.isJammed) ids.push('task-fix-jam');
  if (state.stockLevel !== 'ok') ids.push('task-restock');
  if (state.cleanliness === 'dirty') ids.push('task-wipe-glass');
  return ids;
}

export function ensureTokenStationIssueTask(
  tasks: ActiveTask[],
  taskCount: number,
  tokenStationState: MachineState,
): ActiveTask[] {
  const issueTemplateIds = getTokenStationIssueTemplateIds(tokenStationState);
  if (issueTemplateIds.length === 0) return tasks;

  const hasTokenTask = tasks.some(
    (t) => !t.isCompleted && t.targetId === 'token-station',
  );
  if (hasTokenTask) return tasks;

  const forcedTask: ActiveTask = {
    templateId: issueTemplateIds[0]!,
    targetId: 'token-station',
    isCompleted: false,
  };

  if (tasks.length < taskCount) {
    return [...tasks, forcedTask];
  }

  const replaceFloorIdx = tasks.findIndex((t) => t.targetId.startsWith('floor-spot-'));
  if (replaceFloorIdx >= 0) {
    const next = [...tasks];
    next[replaceFloorIdx] = forcedTask;
    return next;
  }

  const next = [...tasks];
  next[next.length - 1] = forcedTask;
  return next;
}

export function canUseTokenStation(state: MachineState): boolean {
  return (
    state.isPowered &&
    !state.isJammed &&
    state.cleanliness === 'clean' &&
    state.stockLevel !== 'empty'
  );
}
