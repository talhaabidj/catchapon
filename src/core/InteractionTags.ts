/**
 * InteractionTags — shared metadata keys and helpers for interactable objects.
 *
 * Centralizing these keys avoids string drift across world builders and scenes.
 */

import type * as THREE from 'three';
import type { InteractType } from '../data/types.js';

export const INTERACTION_KEYS = {
  interactable: 'interactable',
  interactType: 'interactType',
  prompt: 'prompt',
  machineId: 'machineId',
  targetId: 'targetId',
  secretId: 'secretId',
  secretName: 'secretName',
} as const;

export interface InteractableTag {
  type: InteractType;
  prompt: string;
  machineId?: string;
  targetId?: string;
  secretId?: string;
  secretName?: string;
}

export function tagInteractable(object: THREE.Object3D, tag: InteractableTag): void {
  object.userData[INTERACTION_KEYS.interactable] = true;
  object.userData[INTERACTION_KEYS.interactType] = tag.type;
  object.userData[INTERACTION_KEYS.prompt] = tag.prompt;

  if (tag.machineId) object.userData[INTERACTION_KEYS.machineId] = tag.machineId;
  if (tag.targetId) object.userData[INTERACTION_KEYS.targetId] = tag.targetId;
  if (tag.secretId) object.userData[INTERACTION_KEYS.secretId] = tag.secretId;
  if (tag.secretName) object.userData[INTERACTION_KEYS.secretName] = tag.secretName;
}

export function isInteractable(object: THREE.Object3D): boolean {
  return object.userData[INTERACTION_KEYS.interactable] === true;
}

export function getInteractType(object: THREE.Object3D): InteractType {
  const type = object.userData[INTERACTION_KEYS.interactType];
  return (typeof type === 'string' ? type : 'unknown') as InteractType;
}

export function getInteractPrompt(object: THREE.Object3D): string {
  const prompt = object.userData[INTERACTION_KEYS.prompt];
  return typeof prompt === 'string' && prompt.length > 0 ? prompt : 'Interact';
}

export function getMachineId(object: THREE.Object3D): string | undefined {
  const id = object.userData[INTERACTION_KEYS.machineId];
  return typeof id === 'string' ? id : undefined;
}

export function getTargetId(object: THREE.Object3D): string | undefined {
  const id = object.userData[INTERACTION_KEYS.targetId];
  return typeof id === 'string' ? id : undefined;
}

export function getSecretId(object: THREE.Object3D): string | undefined {
  const id = object.userData[INTERACTION_KEYS.secretId];
  return typeof id === 'string' ? id : undefined;
}

export function getSecretName(object: THREE.Object3D): string | undefined {
  const name = object.userData[INTERACTION_KEYS.secretName];
  return typeof name === 'string' ? name : undefined;
}
