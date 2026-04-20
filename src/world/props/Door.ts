/**
 * Door — The exit door leading to the gacha shop.
 *
 * INTERACTABLE — triggers "Start Night Shift?" prompt.
 */

import * as THREE from 'three';

export function createDoor(): THREE.Group {
  const door = new THREE.Group();
  door.name = 'door';
  door.userData['interactable'] = true;
  door.userData['interactType'] = 'door';
  door.userData['prompt'] = 'Start Night Shift';

  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x4a3728,
    roughness: 0.85,
  });
  const frameInnerMat = new THREE.MeshStandardMaterial({
    color: 0x3d3025,
    roughness: 0.9,
  });
  const slabMat = new THREE.MeshStandardMaterial({
    color: 0x4a3526,
    roughness: 0.8,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0x3d2b1f,
    roughness: 0.82,
  });
  const panelTrimMat = new THREE.MeshStandardMaterial({
    color: 0x3f2f22,
    roughness: 0.84,
    side: THREE.DoubleSide,
  });
  const insetMat = new THREE.MeshStandardMaterial({
    color: 0x3d3025,
    roughness: 0.84,
  });
  const hardwareMat = new THREE.MeshStandardMaterial({
    color: 0xc2c7cf,
    roughness: 0.28,
    metalness: 0.84,
  });

  const slabFrontZ = 0.047;
  const trimZ = 0.056;
  const insetZ = 0.049;

  // Door opening recess and frame.
  const recess = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 2.2, 0.03),
    new THREE.MeshStandardMaterial({
      color: 0x1b1613,
      roughness: 0.95,
    }),
  );
  recess.position.set(0, 1.1, -0.033);
  door.add(recess);

  const leftFrame = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.2, 0.12), frameMat);
  leftFrame.position.set(-0.48, 1.1, 0);
  door.add(leftFrame);

  const rightFrame = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.2, 0.12), frameMat);
  rightFrame.position.set(0.48, 1.1, 0);
  door.add(rightFrame);

  const topFrame = new THREE.Mesh(new THREE.BoxGeometry(1.04, 0.08, 0.12), frameMat);
  topFrame.position.set(0, 2.2, 0);
  door.add(topFrame);

  // Inner stop strips.
  const stopLeft = new THREE.Mesh(new THREE.BoxGeometry(0.016, 2.16, 0.03), frameInnerMat);
  stopLeft.position.set(-0.39, 1.08, 0.03);
  door.add(stopLeft);

  const stopRight = new THREE.Mesh(new THREE.BoxGeometry(0.016, 2.16, 0.03), frameInnerMat);
  stopRight.position.set(0.39, 1.08, 0.03);
  door.add(stopRight);

  const stopTop = new THREE.Mesh(new THREE.BoxGeometry(0.798, 0.022, 0.03), frameInnerMat);
  stopTop.position.set(0, 2.149, 0.03);
  door.add(stopTop);

  const threshold = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.03, 0.12), frameInnerMat);
  threshold.position.set(0, 0.015, 0.02);
  door.add(threshold);

  // Main slab (slightly taller to remove the visible top void).
  const slab = new THREE.Mesh(new THREE.BoxGeometry(0.84, 2.16, 0.05), slabMat);
  slab.position.set(0, 1.08, 0.022);
  door.add(slab);

  // Subtle slab border line.
  const borderTop = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.012, 0.006), trimMat);
  borderTop.position.set(0, 1.985, slabFrontZ + 0.004);
  door.add(borderTop);

  const borderBottom = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.012, 0.006), trimMat);
  borderBottom.position.set(0, 0.2, slabFrontZ + 0.004);
  door.add(borderBottom);

  const borderLeft = new THREE.Mesh(new THREE.BoxGeometry(0.012, 1.785, 0.006), trimMat);
  borderLeft.position.set(-0.352, 1.092, slabFrontZ + 0.004);
  door.add(borderLeft);

  const borderRight = new THREE.Mesh(new THREE.BoxGeometry(0.012, 1.785, 0.006), trimMat);
  borderRight.position.set(0.352, 1.092, slabFrontZ + 0.004);
  door.add(borderRight);

  // Upper inset with arched crown, matching the reference silhouette.
  const upperPanelW = 0.52;
  const upperPanelBottom = 1.11;
  const upperArchCenterY = 1.59;
  const upperArchRadius = upperPanelW / 2;
  const upperStileH = upperArchCenterY - upperPanelBottom;
  const upperStileY = upperPanelBottom + upperStileH / 2;

  const upperInsetRect = new THREE.Mesh(
    new THREE.BoxGeometry(upperPanelW - 0.046, upperStileH + 0.01, 0.008),
    insetMat,
  );
  upperInsetRect.position.set(0, upperStileY + 0.01, insetZ);
  door.add(upperInsetRect);

  const upperInsetArch = new THREE.Mesh(
    new THREE.CircleGeometry(upperArchRadius - 0.022, 24, 0, Math.PI),
    insetMat,
  );
  upperInsetArch.position.set(0, upperArchCenterY - 0.013, insetZ + 0.0004);
  door.add(upperInsetArch);

  const upperTrimLeft = new THREE.Mesh(new THREE.BoxGeometry(0.014, upperStileH, 0.01), panelTrimMat);
  upperTrimLeft.position.set(-upperPanelW / 2, upperStileY, trimZ);
  door.add(upperTrimLeft);

  const upperTrimRight = new THREE.Mesh(new THREE.BoxGeometry(0.014, upperStileH, 0.01), panelTrimMat);
  upperTrimRight.position.set(upperPanelW / 2, upperStileY, trimZ);
  door.add(upperTrimRight);

  const upperTrimBottom = new THREE.Mesh(new THREE.BoxGeometry(upperPanelW, 0.014, 0.01), panelTrimMat);
  upperTrimBottom.position.set(0, upperPanelBottom, trimZ);
  door.add(upperTrimBottom);

  const upperArchTrim = new THREE.Mesh(
    new THREE.RingGeometry(upperArchRadius - 0.007, upperArchRadius + 0.007, 24, 1, 0, Math.PI),
    panelTrimMat,
  );
  upperArchTrim.position.set(0, upperArchCenterY, trimZ + 0.0012);
  door.add(upperArchTrim);

  // Lower rectangular inset panel.
  const lowerPanelW = 0.56;
  const lowerPanelH = 0.52;
  const lowerPanelY = 0.66;

  const lowerInset = new THREE.Mesh(
    new THREE.BoxGeometry(lowerPanelW - 0.046, lowerPanelH - 0.046, 0.008),
    insetMat,
  );
  lowerInset.position.set(0, lowerPanelY, insetZ);
  door.add(lowerInset);

  const lowerTrimTop = new THREE.Mesh(new THREE.BoxGeometry(lowerPanelW, 0.014, 0.01), trimMat);
  lowerTrimTop.position.set(0, lowerPanelY + lowerPanelH / 2, trimZ);
  door.add(lowerTrimTop);

  const lowerTrimBottom = new THREE.Mesh(new THREE.BoxGeometry(lowerPanelW, 0.014, 0.01), trimMat);
  lowerTrimBottom.position.set(0, lowerPanelY - lowerPanelH / 2, trimZ);
  door.add(lowerTrimBottom);

  const lowerTrimLeft = new THREE.Mesh(new THREE.BoxGeometry(0.014, lowerPanelH, 0.01), trimMat);
  lowerTrimLeft.position.set(-lowerPanelW / 2, lowerPanelY, trimZ);
  door.add(lowerTrimLeft);

  const lowerTrimRight = new THREE.Mesh(new THREE.BoxGeometry(0.014, lowerPanelH, 0.01), trimMat);
  lowerTrimRight.position.set(lowerPanelW / 2, lowerPanelY, trimZ);
  door.add(lowerTrimRight);

  // Lever handle assembly.
  const handleY = 1.0;
  const handleBaseX = 0.31;
  const handleBaseZ = trimZ + 0.01;

  const handlePlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.028, 0.115, 0.008),
    hardwareMat,
  );
  handlePlate.position.set(handleBaseX, handleY, trimZ + 0.004);
  door.add(handlePlate);

  const handleRose = new THREE.Mesh(
    new THREE.CylinderGeometry(0.014, 0.014, 0.012, 14),
    hardwareMat,
  );
  handleRose.rotation.x = Math.PI / 2;
  handleRose.position.set(handleBaseX, handleY, handleBaseZ);
  door.add(handleRose);

  const handleStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0055, 0.0055, 0.04, 12),
    hardwareMat,
  );
  handleStem.rotation.x = Math.PI / 2;
  handleStem.position.set(handleBaseX, handleY, handleBaseZ + 0.015);
  door.add(handleStem);

  const handleBar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.007, 0.007, 0.11, 14),
    hardwareMat,
  );
  handleBar.rotation.z = Math.PI / 2;
  handleBar.position.set(handleBaseX - 0.055, handleY, handleBaseZ + 0.026);
  door.add(handleBar);

  const handleTip = new THREE.Mesh(
    new THREE.CylinderGeometry(0.006, 0.006, 0.02, 12),
    hardwareMat,
  );
  handleTip.rotation.x = Math.PI / 2;
  handleTip.position.set(handleBaseX - 0.11, handleY, handleBaseZ + 0.026);
  door.add(handleTip);

  // Small emergency light box above the frame.
  const signBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.055, 0.045),
    new THREE.MeshStandardMaterial({ color: 0xe8e8e8, roughness: 0.4 }),
  );
  signBody.position.set(0, 2.36, 0.01);
  door.add(signBody);

  const signGlow = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.014, 0.042),
    new THREE.MeshStandardMaterial({
      color: 0xff8f8f,
      emissive: 0xff6e6e,
      emissiveIntensity: 0.55,
      roughness: 0.3,
    }),
  );
  signGlow.position.set(0, 2.34, 0.012);
  door.add(signGlow);

  return door;
}
