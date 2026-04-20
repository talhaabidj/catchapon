import { TASK_TEMPLATES } from '../../data/tasks.js';
import type { ActiveTask, MachineState } from '../../data/types.js';
import {
  ARCADE_STATUS_TEXT,
  getLowStockPrompt,
  getOutagePrompt,
} from './ArcadeStatusText.js';

export function getMachineOutOfOrderPrompt(
  machineState: MachineState | undefined,
  hasCapsuleRefill: boolean,
): string | null {
  if (!machineState) return null;
  return getOutagePrompt(machineState, hasCapsuleRefill);
}

interface MachineIssuePromptInput {
  machineId: string;
  machineState: MachineState | undefined;
  hasCapsuleRefill: boolean;
  tasks: readonly ActiveTask[];
}

export function getMachineIssuePrompt(input: MachineIssuePromptInput): string | null {
  const outOfOrderPrompt = getMachineOutOfOrderPrompt(
    input.machineState,
    input.hasCapsuleRefill,
  );
  if (outOfOrderPrompt) return outOfOrderPrompt;

  const pendingTask = input.tasks.find(
    (t) => !t.isCompleted && t.targetId === input.machineId,
  );

  if (!pendingTask) {
    if (input.machineState?.stockLevel === 'low') {
      return getLowStockPrompt(input.hasCapsuleRefill);
    }
    return null;
  }

  const template = TASK_TEMPLATES.find((t) => t.id === pendingTask.templateId);
  if (!template) return null;

  if (template.type === 'wipe_glass') return ARCADE_STATUS_TEXT.serviceCleanGlass;
  if (template.type === 'restock') {
    const isFullyOut = input.machineState?.stockLevel === 'empty';

    if (input.hasCapsuleRefill) {
      if (isFullyOut) return 'OUT OF ORDER - PRESS R TO RESTOCK';
      return 'LOW STOCK - PRESS R TO RESTOCK';
    }
    if (isFullyOut) return ARCADE_STATUS_TEXT.outOfOrderRestockNeeded;
    return ARCADE_STATUS_TEXT.lowStockGetRefill;
  }
  if (template.type === 'fix_jam') return ARCADE_STATUS_TEXT.outOfOrderJammed;
  if (template.type === 'rewire') return ARCADE_STATUS_TEXT.outOfOrderRequiresPower;
  return template.description;
}
