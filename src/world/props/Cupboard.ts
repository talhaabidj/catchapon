/**
 * Cupboard — Tall storage cupboard / wardrobe.
 */

import * as THREE from 'three';

export function createCupboard(): THREE.Group {
  const cupboard = new THREE.Group();
  cupboard.name = 'cupboard';

  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x3d3025,
    roughness: 0.85,
  });

  const handleMat = new THREE.MeshStandardMaterial({
    color: 0x888080,
    roughness: 0.3,
    metalness: 0.7,
  });

  // —— Body ——
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.96, 1.92, 0.5),
    woodMat,
  );
  body.position.set(0, 0.96, 0);
  cupboard.add(body);

  const borderMat = new THREE.MeshStandardMaterial({
    color: 0x2e241b,
    roughness: 0.88,
  });

  // Front border trims to break up flat cupboard faces.
  const topTrim = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.02, 0.012),
    borderMat,
  );
  topTrim.position.set(0, 1.87, 0.255);
  cupboard.add(topTrim);

  const bottomTrim = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.02, 0.012),
    borderMat,
  );
  bottomTrim.position.set(0, 0.05, 0.255);
  cupboard.add(bottomTrim);

  const leftTrim = new THREE.Mesh(
    new THREE.BoxGeometry(0.012, 1.8, 0.012),
    borderMat,
  );
  leftTrim.position.set(-0.445, 0.96, 0.255);
  cupboard.add(leftTrim);

  const rightTrim = new THREE.Mesh(
    new THREE.BoxGeometry(0.012, 1.8, 0.012),
    borderMat,
  );
  rightTrim.position.set(0.445, 0.96, 0.255);
  cupboard.add(rightTrim);

  // —— Door line (visual split) ——
  const lineMat = new THREE.MeshStandardMaterial({
    color: 0x2a2218,
    roughness: 0.9,
  });
  const line = new THREE.Mesh(
    new THREE.BoxGeometry(0.01, 1.72, 0.01),
    lineMat,
  );
  line.position.set(0, 0.96, 0.255);
  cupboard.add(line);

  // —— Handles (left and right doors) ——
  const lHandle = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, 0.08, 0.025),
    handleMat,
  );
  lHandle.position.set(-0.09, 1.0, 0.27);
  cupboard.add(lHandle);

  const rHandle = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, 0.08, 0.025),
    handleMat,
  );
  rHandle.position.set(0.09, 1.0, 0.27);
  cupboard.add(rHandle);

  return cupboard;
}
