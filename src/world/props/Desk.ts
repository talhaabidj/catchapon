/**
 * Desk — L-shaped desk with legs.
 *
 * Code-built geometry, positioned against a wall.
 */

import * as THREE from 'three';

export function createDesk(): THREE.Group {
  const desk = new THREE.Group();
  desk.name = 'desk';

  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x4a3728,
    roughness: 0.82,
    metalness: 0.05,
  });

  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a2e,
    roughness: 0.4,
    metalness: 0.7,
  });

  // —— Desktop surface ——
  const surface = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.05, 0.7),
    woodMat,
  );
  surface.position.set(0, 0.75, 0);
  desk.add(surface);

  // —— Legs (4 metal legs) ——
  const legGeo = new THREE.BoxGeometry(0.04, 0.75, 0.04);
  const positions = [
    [-0.76, 0.375, -0.31],
    [0.76, 0.375, -0.31],
    [-0.76, 0.375, 0.31],
    [0.76, 0.375, 0.31],
  ] as const;

  for (const [x, y, z] of positions) {
    const leg = new THREE.Mesh(legGeo, metalMat);
    leg.position.set(x, y, z);
    desk.add(leg);
  }

  // —— Drawer unit (right side) ——
  const drawerMat = new THREE.MeshStandardMaterial({
    color: 0x3d2b1f,
    roughness: 0.85,
  });
  const drawer = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.45, 0.6),
    drawerMat,
  );
  drawer.position.set(0.58, 0.525, 0);
  desk.add(drawer);

  const drawerFrontMat = new THREE.MeshStandardMaterial({
    color: 0x4a3526,
    roughness: 0.8,
  });
  const drawerTrimMat = new THREE.MeshStandardMaterial({
    color: 0x2f2118,
    roughness: 0.85,
  });

  const drawerFront = new THREE.Mesh(
    new THREE.BoxGeometry(0.372, 0.422, 0.014),
    drawerFrontMat,
  );
  drawerFront.position.set(0.58, 0.525, 0.307);
  desk.add(drawerFront);

  const trimTop = new THREE.Mesh(new THREE.BoxGeometry(0.336, 0.008, 0.005), drawerTrimMat);
  trimTop.position.set(0.58, 0.72, 0.314);
  desk.add(trimTop);

  const trimBottom = new THREE.Mesh(new THREE.BoxGeometry(0.336, 0.008, 0.005), drawerTrimMat);
  trimBottom.position.set(0.58, 0.33, 0.314);
  desk.add(trimBottom);

  const trimLeft = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.35, 0.005), drawerTrimMat);
  trimLeft.position.set(0.416, 0.525, 0.314);
  desk.add(trimLeft);

  const trimRight = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.35, 0.005), drawerTrimMat);
  trimRight.position.set(0.744, 0.525, 0.314);
  desk.add(trimRight);

  const trimMiddle = new THREE.Mesh(new THREE.BoxGeometry(0.33, 0.006, 0.004), drawerTrimMat);
  trimMiddle.position.set(0.58, 0.525, 0.313);
  desk.add(trimMiddle);

  const topHandle = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.012, 0.018),
    metalMat,
  );
  topHandle.position.set(0.58, 0.605, 0.314);
  desk.add(topHandle);

  const bottomHandle = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.012, 0.018),
    metalMat,
  );
  bottomHandle.position.set(0.58, 0.445, 0.314);
  desk.add(bottomHandle);

  return desk;
}
