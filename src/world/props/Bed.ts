/**
 * Bed — Low-poly bed with mattress, frame, and pillow.
 *
 * Positioned against a wall. Code-built geometry.
 */

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { createClothMaterialMaps } from './clothTexture.js';

export function createBed(): THREE.Group {
  const bed = new THREE.Group();
  bed.name = 'bed';

  // —— Frame (dark wood) ——
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x3d2b1f,
    roughness: 0.85,
    metalness: 0.05,
  });

  // Base frame
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.24, 2.0),
    frameMat,
  );
  base.position.set(0, 0.12, 0);
  bed.add(base);

  // Headboard
  const headboard = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.72, 0.08),
    frameMat,
  );
  headboard.position.set(0, 0.48, -0.96);
  bed.add(headboard);

  // Footboard for silhouette balance.
  const footboard = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.36, 0.06),
    frameMat,
  );
  footboard.position.set(0, 0.2, 0.97);
  bed.add(footboard);

  // Side rails
  const railGeo = new THREE.BoxGeometry(0.05, 0.2, 1.86);
  const leftRail = new THREE.Mesh(railGeo, frameMat);
  leftRail.position.set(-0.675, 0.16, 0.01);
  bed.add(leftRail);

  const rightRail = new THREE.Mesh(railGeo, frameMat);
  rightRail.position.set(0.675, 0.16, 0.01);
  bed.add(rightRail);

  // Frame trim line
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0x2e2117,
    roughness: 0.86,
    metalness: 0.05,
  });
  const trim = new THREE.Mesh(
    new THREE.BoxGeometry(1.34, 0.03, 1.92),
    trimMat,
  );
  trim.position.set(0, 0.255, 0.01);
  bed.add(trim);

  // —— Mattress ——
  const mattressMat = new THREE.MeshStandardMaterial({
    color: 0xd4cfc7,
    roughness: 0.9,
  });
  const mattress = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 0.15, 1.85),
    mattressMat,
  );
  mattress.position.set(0, 0.345, 0.05);
  bed.add(mattress);

  // —— Blanket (draped, simplified as a box) ——
  const blanketCloth = createClothMaterialMaps({
    baseColor: 0x3a4963,
    repeatX: 5.2,
    repeatY: 3.4,
    threadSpacing: 7,
  });
  const blanketMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.96,
    metalness: 0.01,
    map: blanketCloth.colorMap,
    bumpMap: blanketCloth.bumpMap,
    bumpScale: 0.008,
  });
  const blanket = new THREE.Mesh(
    new THREE.BoxGeometry(1.25, 0.06, 1.2),
    blanketMat,
  );
  blanket.position.set(0, 0.435, 0.35);
  bed.add(blanket);

  // Folded edge near the pillow for a less blocky look.
  const blanketFold = new THREE.Mesh(
    new THREE.BoxGeometry(1.24, 0.03, 0.26),
    blanketMat,
  );
  blanketFold.position.set(0, 0.448, -0.18);
  bed.add(blanketFold);

  // —— Pillow ——
  const pillowGeo = new RoundedBoxGeometry(0.54, 0.09, 0.34, 4, 0.017);
  const pillowMat = new THREE.MeshStandardMaterial({
    color: 0xe2e4e5,
    roughness: 0.97,
  });
  const pillow = new THREE.Mesh(
    pillowGeo,
    pillowMat,
  );
  pillow.position.set(-0.28, 0.455, -0.65);
  bed.add(pillow);

  const pillow2 = new THREE.Mesh(
    pillowGeo,
    pillowMat,
  );
  pillow2.position.set(0.28, 0.455, -0.65);
  bed.add(pillow2);

  // Subtle legs to lift frame from floor.
  const legGeo = new THREE.BoxGeometry(0.06, 0.08, 0.06);
  const legPositions = [
    [-0.62, 0.04, -0.9],
    [0.62, 0.04, -0.9],
    [-0.62, 0.04, 0.9],
    [0.62, 0.04, 0.9],
  ] as const;

  for (const [x, y, z] of legPositions) {
    const leg = new THREE.Mesh(legGeo, trimMat);
    leg.position.set(x, y, z);
    bed.add(leg);
  }

  return bed;
}
