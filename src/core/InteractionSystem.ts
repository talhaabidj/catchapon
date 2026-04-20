/**
 * InteractionSystem — Raycaster-based interaction detection.
 *
 * Each frame, casts a ray from the camera center and checks
 * for objects with `userData.interactable === true`.
 * Reports the nearest interactable (if within range) so the
 * scene can show prompts and handle E-press actions.
 */

import * as THREE from 'three';
import type { InteractType } from '../data/types.js';
import { getInteractPrompt, getInteractType, isInteractable } from './InteractionTags.js';

export interface InteractionTarget {
  object: THREE.Object3D;
  type: InteractType;
  prompt: string;
  distance: number;
}

const INTERACT_RANGE = 2.5; // meters

export class InteractionSystem {
  private raycaster = new THREE.Raycaster();
  private center = new THREE.Vector2(0, 0);
  private interactables: THREE.Object3D[] = [];

  // Cached meshes to avoid traversing the scene graph every frame
  private allMeshes: THREE.Mesh[] = [];
  private meshToInteractable = new Map<THREE.Mesh, THREE.Object3D>();

  // Throttling state
  private lastCheckTime = 0;
  private lastTarget: InteractionTarget | null = null;
  private readonly CHECK_INTERVAL_MS = 100; // 10Hz

  /** Register objects to check against */
  setInteractables(objects: THREE.Object3D[]) {
    this.interactables = objects;
    
    // Build flat cache once
    this.allMeshes = [];
    this.meshToInteractable.clear();

    for (const obj of this.interactables) {
      if (!isInteractable(obj)) continue;
      if (obj.visible === false) continue; // Skip deeply hidden objects initially
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh) {
           this.allMeshes.push(child);
           this.meshToInteractable.set(child, obj);
        }
      });
    }
  }

  /**
   * Check what the player is looking at.
   * Throttled to ~10Hz to save CPU overhead.
   */
  check(camera: THREE.Camera): InteractionTarget | null {
    const now = performance.now();
    if (now - this.lastCheckTime < this.CHECK_INTERVAL_MS) {
       return this.lastTarget; 
    }
    this.lastCheckTime = now;

    this.raycaster.setFromCamera(this.center, camera);
    this.raycaster.far = INTERACT_RANGE;

    const hits = this.raycaster.intersectObjects(this.allMeshes, false);

    if (hits.length === 0) {
      this.lastTarget = null;
      return null;
    }

    for (const hit of hits) {
      const parent = this.meshToInteractable.get(hit.object as THREE.Mesh);
      if (parent?.visible && hit.object.visible) {
        this.lastTarget = {
          object: parent,
          type: getInteractType(parent),
          prompt: getInteractPrompt(parent),
          distance: hit.distance,
        };
        return this.lastTarget;
      }
    }

    this.lastTarget = null;
    return null;
  }

  dispose() {
    this.interactables = [];
    this.allMeshes = [];
    this.meshToInteractable.clear();
    this.lastTarget = null;
  }
}
