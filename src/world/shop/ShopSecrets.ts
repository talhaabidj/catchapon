import * as THREE from 'three';
import { tagInteractable } from '../../core/InteractionTags.js';

export interface BuiltShopSecrets {
  groups: THREE.Group[];
  interactables: THREE.Object3D[];
}

export function buildShopSecrets(): BuiltShopSecrets {
  const groups: THREE.Group[] = [];
  const interactables: THREE.Object3D[] = [];

  // Secret 1: Hidden note behind counter.
  const secretNote = new THREE.Group();
  secretNote.name = 'secret-note';
  tagInteractable(secretNote, {
    type: 'secret',
    prompt: 'Examine Note',
    secretId: 'hidden-note',
    secretName: 'A crumpled note',
  });

  const noteObj = new THREE.Mesh(
    new THREE.PlaneGeometry(0.12, 0.08),
    new THREE.MeshStandardMaterial({
      color: 0xeedd99,
      roughness: 0.95,
    }),
  );
  noteObj.position.set(0, 0.01, 0);
  noteObj.rotation.x = -Math.PI / 2;
  secretNote.add(noteObj);
  secretNote.position.set(-5.5, 0, -4.8);
  groups.push(secretNote);
  interactables.push(secretNote);

  // Secret 2: Loose ceiling tile (back corner).
  const secretTile = new THREE.Group();
  secretTile.name = 'secret-tile';
  tagInteractable(secretTile, {
    type: 'secret',
    prompt: 'Inspect Tile',
    secretId: 'loose-tile',
    secretName: 'Something behind the tile...',
  });

  const tileObj = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.02, 0.5),
    new THREE.MeshStandardMaterial({
      color: 0x222230,
      roughness: 0.7,
    }),
  );
  tileObj.position.set(0, 0, 0);
  secretTile.add(tileObj);
  secretTile.position.set(5.5, 3.95, -5);
  groups.push(secretTile);
  interactables.push(secretTile);

  // Secret 3: Scratched mark on floor near hidden machine spot.
  const secretMark = new THREE.Group();
  secretMark.name = 'secret-mark';
  tagInteractable(secretMark, {
    type: 'secret',
    prompt: 'Examine Marks',
    secretId: 'floor-mark',
    secretName: 'Strange scratch marks',
  });

  const markObj = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, 0.3),
    new THREE.MeshStandardMaterial({
      color: 0x2a2a18,
      roughness: 1.0,
      transparent: true,
      opacity: 0.6,
    }),
  );
  markObj.rotation.x = -Math.PI / 2;
  markObj.position.set(0, 0.002, 0);
  secretMark.add(markObj);
  secretMark.position.set(3, 0, 1.5);
  groups.push(secretMark);
  interactables.push(secretMark);

  return { groups, interactables };
}
