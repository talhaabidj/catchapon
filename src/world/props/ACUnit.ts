/**
 * ACUnit — Small wall-mounted air conditioning unit.
 */

import * as THREE from 'three';

export function createACUnit(): THREE.Group {
  const ac = new THREE.Group();
  ac.name = 'ac-unit';

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xe7e5df,
    roughness: 0.58,
  });
  const panelMat = new THREE.MeshStandardMaterial({
    color: 0xf3f1eb,
    roughness: 0.45,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0xc9c6bd,
    roughness: 0.65,
  });
  const ventMat = new THREE.MeshStandardMaterial({
    color: 0xb9b5ab,
    roughness: 0.7,
  });
  const darkVentMat = new THREE.MeshStandardMaterial({
    color: 0x8f8b82,
    roughness: 0.75,
  });

  // Main shell (wider profile).
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.24, 0.22), bodyMat);
  ac.add(body);

  const frontPanel = new THREE.Mesh(
    new THREE.BoxGeometry(1.02, 0.18, 0.032),
    panelMat,
  );
  frontPanel.position.set(0, 0.018, 0.096);
  ac.add(frontPanel);

  // Top trim seam and side caps add depth and silhouette quality.
  const topSeam = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 0.01, 0.02),
    trimMat,
  );
  topSeam.position.set(0, 0.102, 0.098);
  ac.add(topSeam);

  for (const side of [-1, 1] as const) {
    const sideCap = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.2, 0.18),
      trimMat,
    );
    sideCap.position.set(0.53 * side, 0.0, 0.008);
    ac.add(sideCap);
  }

  // Intake grille slots across upper front.
  for (let i = 0; i < 6; i++) {
    const slot = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.006, 0.008),
      darkVentMat,
    );
    slot.position.set(0, 0.068 - i * 0.014, 0.108);
    ac.add(slot);
  }

  // Outlet flap and louvers.
  const outletFlap = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 0.06, 0.032),
    panelMat,
  );
  outletFlap.position.set(0, -0.075, 0.102);
  outletFlap.rotation.x = -0.24;
  ac.add(outletFlap);

  for (let i = 0; i < 5; i++) {
    const slat = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.007, 0.01),
      ventMat,
    );
    slat.position.set(0, -0.078 + i * 0.016, 0.113);
    slat.rotation.x = -0.22;
    ac.add(slat);
  }

  // Rear mounting rail.
  const mountRail = new THREE.Mesh(
    new THREE.BoxGeometry(0.82, 0.03, 0.02),
    trimMat,
  );
  mountRail.position.set(0, -0.015, -0.108);
  ac.add(mountRail);

  // Branding strip and status display.
  const badge = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.03, 0.004),
    new THREE.MeshStandardMaterial({ color: 0xdbd7ce, roughness: 0.5 }),
  );
  badge.position.set(-0.38, 0.085, 0.111);
  ac.add(badge);

  const display = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.028, 0.004),
    new THREE.MeshStandardMaterial({ color: 0x2b2f3a, roughness: 0.35, metalness: 0.2 }),
  );
  display.position.set(0.37, 0.084, 0.111);
  ac.add(display);

  // Small service screws for fine detail.
  for (const sx of [-0.48, 0.48]) {
    const screw = new THREE.Mesh(
      new THREE.CylinderGeometry(0.004, 0.004, 0.004, 10),
      new THREE.MeshStandardMaterial({ color: 0xa7a39b, roughness: 0.4, metalness: 0.7 }),
    );
    screw.rotation.x = Math.PI / 2;
    screw.position.set(sx, -0.09, 0.111);
    ac.add(screw);
  }

  // Power LED.
  const ledMat = new THREE.MeshStandardMaterial({
    color: 0x5ef777,
    emissive: 0x34cc5a,
    emissiveIntensity: 0.9,
  });
  const led = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.015, 0.004), ledMat);
  led.position.set(0.44, 0.045, 0.111);
  ac.add(led);

  return ac;
}
