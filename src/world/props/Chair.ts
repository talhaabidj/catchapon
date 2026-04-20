/**
 * Chair — Simple rolling desk chair.
 */

import * as THREE from 'three';
import { createClothMaterialMaps } from './clothTexture.js';

export function createChair(): THREE.Group {
  const chair = new THREE.Group();
  chair.name = 'chair';

  const chairCloth = createClothMaterialMaps({
    baseColor: 0x8f8173,
    repeatX: 2.8,
    repeatY: 2.2,
    threadSpacing: 7,
  });

  const shellMat = new THREE.MeshStandardMaterial({
    color: 0x2f3138,
    roughness: 0.76,
  });
  const cushionMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.95,
    metalness: 0.02,
    map: chairCloth.colorMap,
    bumpMap: chairCloth.bumpMap,
    bumpScale: 0.007,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0x75695d,
    roughness: 0.86,
  });

  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a2f,
    roughness: 0.34,
    metalness: 0.7,
  });

  const wheelMat = new THREE.MeshStandardMaterial({
    color: 0x1e1e23,
    roughness: 0.62,
    metalness: 0.26,
  });

  // —— Seat ——
  const seatShell = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.05, 0.45),
    shellMat,
  );
  seatShell.position.set(0, 0.46, 0);
  chair.add(seatShell);

  const seatPad = new THREE.Mesh(
    new THREE.BoxGeometry(0.39, 0.016, 0.36),
    cushionMat,
  );
  seatPad.position.set(0, 0.494, 0.01);
  chair.add(seatPad);

  const seatFrontEdge = new THREE.Mesh(
    new THREE.BoxGeometry(0.39, 0.01, 0.018),
    trimMat,
  );
  seatFrontEdge.position.set(0, 0.468, 0.214);
  chair.add(seatFrontEdge);

  // —— Backrest ——
  const backShell = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.45, 0.05),
    shellMat,
  );
  backShell.position.set(0, 0.735, -0.2);
  chair.add(backShell);

  const backPad = new THREE.Mesh(
    new THREE.BoxGeometry(0.34, 0.35, 0.016),
    cushionMat,
  );
  backPad.position.set(0, 0.735, -0.174);
  chair.add(backPad);

  const backTopEdge = new THREE.Mesh(
    new THREE.BoxGeometry(0.34, 0.01, 0.015),
    trimMat,
  );
  backTopEdge.position.set(0, 0.899, -0.174);
  chair.add(backTopEdge);

  const backConnector = new THREE.Mesh(
    new THREE.BoxGeometry(0.11, 0.28, 0.06),
    shellMat,
  );
  backConnector.position.set(0, 0.61, -0.2);
  chair.add(backConnector);

  // —— Central pole ——
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.022, 0.34, 10),
    metalMat,
  );
  pole.position.set(0, 0.285, 0);
  chair.add(pole);

  const gasSleeve = new THREE.Mesh(
    new THREE.CylinderGeometry(0.032, 0.028, 0.1, 12),
    metalMat,
  );
  gasSleeve.position.set(0, 0.12, 0);
  chair.add(gasSleeve);

  const baseHub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.058, 0.052, 0.03, 12),
    metalMat,
  );
  baseHub.position.set(0, 0.072, 0);
  chair.add(baseHub);

  const heightLever = new THREE.Mesh(
    new THREE.BoxGeometry(0.045, 0.006, 0.01),
    metalMat,
  );
  heightLever.position.set(0.22, 0.44, 0.06);
  chair.add(heightLever);

  // —— Base star (5 legs) ——
  const legGeo = new THREE.BoxGeometry(0.026, 0.018, 0.26);
  const casterForkGeo = new THREE.BoxGeometry(0.018, 0.026, 0.02);
  const wheelGeo = new THREE.CylinderGeometry(0.021, 0.021, 0.018, 12);

  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;

    const leg = new THREE.Mesh(legGeo, metalMat);
    leg.position.set(
      Math.sin(angle) * 0.13,
      0.05,
      Math.cos(angle) * 0.13,
    );
    leg.rotation.y = angle;
    chair.add(leg);

    const casterX = Math.sin(angle) * 0.275;
    const casterZ = Math.cos(angle) * 0.275;

    const casterFork = new THREE.Mesh(casterForkGeo, metalMat);
    casterFork.position.set(casterX, 0.024, casterZ);
    casterFork.rotation.y = angle;
    chair.add(casterFork);

    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.position.set(casterX, 0.021, casterZ);
    wheel.rotation.z = Math.PI / 2;
    wheel.rotation.y = angle;
    chair.add(wheel);
  }

  return chair;
}
