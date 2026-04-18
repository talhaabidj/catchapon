/**
 * CollectionWall — A wall-mounted display shelf/pegboard for gacha items.
 *
 * INTERACTABLE — opens the Collection overlay.
 * Capsule spheres on shelves update to reflect owned items.
 */

import * as THREE from 'three';

// Rarity → color map
const RARITY_COLORS: Record<string, number> = {
  common: 0x9ca3af,
  uncommon: 0x34d399,
  rare: 0x60a5fa,
  epic: 0xa78bfa,
  legendary: 0xfbbf24,
};

export function createCollectionWall(): THREE.Group {
  const wall = new THREE.Group();
  wall.name = 'collection-wall';
  wall.userData['interactable'] = true;
  wall.userData['interactType'] = 'collection';
  wall.userData['prompt'] = 'View Collection';

  // —— Pegboard backing ——
  const boardMat = new THREE.MeshStandardMaterial({
    color: 0x2a2520,
    roughness: 0.9,
  });
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 1.0, 0.03),
    boardMat,
  );
  board.position.set(0, 0, 0);
  wall.add(board);

  // —— Shelves (3 rows) ——
  const shelfMat = new THREE.MeshStandardMaterial({
    color: 0x3d2b1f,
    roughness: 0.8,
  });

  for (let i = 0; i < 3; i++) {
    const shelfPlank = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 0.025, 0.1),
      shelfMat,
    );
    shelfPlank.position.set(0, -0.3 + i * 0.35, 0.05);
    wall.add(shelfPlank);
  }

  // —— 9 item slots (3 per row) — initially dark empty slots ——
  const slotGroup = new THREE.Group();
  slotGroup.name = 'collection-slots';

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const slotMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a24,
        roughness: 0.7,
        metalness: 0.1,
        transparent: true,
        opacity: 0.5,
      });
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.035, 8, 6),
        slotMat,
      );
      const spacing = 1.0 / 4; // 3 items per row, centered
      sphere.position.set(
        -0.5 + (col + 1) * spacing,
        -0.3 + row * 0.35 + 0.06,
        0.06,
      );
      sphere.name = `slot-${row}-${col}`;
      slotGroup.add(sphere);
    }
  }
  wall.add(slotGroup);

  // —— Label frame on top ——
  const labelMat = new THREE.MeshStandardMaterial({
    color: 0x7c6ef0,
    emissive: 0x7c6ef0,
    emissiveIntensity: 0.15,
  });
  const label = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.04, 0.01),
    labelMat,
  );
  label.position.set(0, 0.52, 0.02);
  wall.add(label);

  return wall;
}

/**
 * Update the collection wall to visually reflect owned items.
 * Maps owned items to shelf slots by color (rarity-based).
 */
export function updateCollectionWallVisuals(
  wallGroup: THREE.Group,
  ownedItems: Array<{ rarity: string }>,
): void {
  const slots = wallGroup.getObjectByName('collection-slots');
  if (!slots) return;

  // Fill slots with owned item colors
  let slotIdx = 0;
  slots.traverse((child) => {
    if (child instanceof THREE.Mesh && child.name.startsWith('slot-')) {
      if (slotIdx < ownedItems.length) {
        const item = ownedItems[slotIdx]!;
        const color = RARITY_COLORS[item.rarity] ?? 0x9ca3af;
        const mat = child.material as THREE.MeshStandardMaterial;
        mat.color.setHex(color);
        mat.opacity = 1.0;
        mat.emissive.setHex(color);
        mat.emissiveIntensity = 0.2;
      }
      slotIdx++;
    }
  });
}
