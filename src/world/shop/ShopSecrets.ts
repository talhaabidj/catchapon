import * as THREE from 'three';

export interface BuiltShopSecrets {
  groups: THREE.Group[];
  interactables: THREE.Object3D[];
}

export function buildShopSecrets(): BuiltShopSecrets {
  const groups: THREE.Group[] = [];
  const interactables: THREE.Object3D[] = [];

  // Secrets deactivated as per request
  // (Note: The user referred to the "note, the title/tile, and 1 more")

  return { groups, interactables };
}
