/**
 * BedroomCollision — positional clamping and simple collider resolution for BedroomScene.
 */

import type * as THREE from 'three';
import { PLAYER_HEIGHT } from '../../core/Config.js';
import type { BedroomCollider } from '../../world/Bedroom.js';

export interface BedroomCollisionBounds {
  halfWidth: number;
  halfDepth: number;
  playerRadius: number;
}

export const DEFAULT_BEDROOM_BOUNDS: BedroomCollisionBounds = {
  halfWidth: 2.3,
  halfDepth: 1.8,
  playerRadius: 0.28,
};

export function clampBedroomPosition(
  position: THREE.Vector3,
  colliders: readonly BedroomCollider[],
  bounds: BedroomCollisionBounds = DEFAULT_BEDROOM_BOUNDS,
): void {
  position.x = Math.max(
    -bounds.halfWidth + bounds.playerRadius,
    Math.min(bounds.halfWidth - bounds.playerRadius, position.x),
  );
  position.z = Math.max(
    -bounds.halfDepth + bounds.playerRadius,
    Math.min(bounds.halfDepth - bounds.playerRadius, position.z),
  );

  for (const collider of colliders) {
    const boundX = collider.halfW + bounds.playerRadius;
    const boundZ = collider.halfD + bounds.playerRadius;
    const dx = position.x - collider.x;
    const dz = position.z - collider.z;

    if (Math.abs(dx) < boundX && Math.abs(dz) < boundZ) {
      const overlapX = boundX - Math.abs(dx);
      const overlapZ = boundZ - Math.abs(dz);

      if (overlapX < overlapZ) {
        const direction = Math.sign(dx) || 1;
        position.x += direction * overlapX;
      } else {
        const direction = Math.sign(dz) || 1;
        position.z += direction * overlapZ;
      }
    }
  }

  position.y = PLAYER_HEIGHT;
}
