/**
 * Window — Detailed corner window for the bedroom.
 *
 * Features:
 * - extended left pane toward ladder shelf,
 * - side pane wrapping the room corner,
 * - layered starry void with depth,
 * - aligned curtain panels,
 * - matching cactus on the corner sill.
 */

import * as THREE from 'three';

const STAR_LAYOUT_NEAR: ReadonlyArray<[number, number, number]> = [
  [-0.44, 0.32, 1.1],
  [-0.33, 0.18, 0.95],
  [-0.2, 0.27, 1.0],
  [-0.08, 0.15, 0.9],
  [0.04, 0.31, 1.05],
  [0.17, 0.24, 0.92],
  [0.3, 0.1, 0.86],
  [0.42, -0.02, 0.82],
  [-0.36, -0.14, 0.8],
  [-0.21, -0.23, 0.74],
  [-0.02, -0.18, 0.78],
  [0.14, -0.26, 0.72],
  [0.32, -0.17, 0.75],
];

const STAR_LAYOUT_FAR: ReadonlyArray<[number, number, number]> = [
  [-0.46, 0.26, 0.76],
  [-0.37, 0.36, 0.7],
  [-0.28, 0.2, 0.66],
  [-0.16, 0.33, 0.72],
  [-0.04, 0.22, 0.68],
  [0.09, 0.36, 0.74],
  [0.23, 0.28, 0.7],
  [0.36, 0.2, 0.66],
  [0.44, 0.08, 0.62],
  [-0.41, -0.04, 0.62],
  [-0.31, -0.18, 0.58],
  [-0.19, -0.08, 0.6],
  [-0.07, -0.24, 0.56],
  [0.05, -0.12, 0.58],
  [0.18, -0.28, 0.54],
  [0.31, -0.11, 0.56],
  [0.43, -0.22, 0.54],
];

function addBackStarLayer(
  parent: THREE.Group,
  centerX: number,
  paneW: number,
  paneH: number,
  z: number,
  stars: ReadonlyArray<[number, number, number]>,
  color: number,
  opacity: number,
  renderOrder: number,
) {
  for (const [u, v, s] of stars) {
    const size = 0.008 + s * 0.004;
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const star = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
    star.position.set(
      centerX + u * paneW * 0.44,
      v * paneH * 0.52,
      z,
    );
    star.userData['voidStar'] = true;
    star.userData['baseOpacity'] = opacity;
    star.userData['twinkleOffset'] = u * 11.3 + v * 17.7 + s * 5.9;
    star.renderOrder = renderOrder;
    parent.add(star);
  }
}

function addSideStarLayer(
  parent: THREE.Group,
  centerZ: number,
  paneW: number,
  paneH: number,
  x: number,
  stars: ReadonlyArray<[number, number, number]>,
  color: number,
  opacity: number,
  renderOrder: number,
) {
  for (const [u, v, s] of stars) {
    const size = 0.007 + s * 0.0035;
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const star = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
    star.rotation.y = -Math.PI / 2;
    star.position.set(
      x,
      v * paneH * 0.52,
      centerZ + u * paneW * 0.44,
    );
    star.userData['voidStar'] = true;
    star.userData['baseOpacity'] = opacity;
    star.userData['twinkleOffset'] = u * 10.7 + v * 16.9 + s * 6.3;
    star.renderOrder = renderOrder;
    parent.add(star);
  }
}

function addBackStarScatter(
  parent: THREE.Group,
  centerX: number,
  paneW: number,
  paneH: number,
  z: number,
  count: number,
  color: number,
  opacity: number,
  renderOrder: number,
  seed: number,
) {
  let s = seed >>> 0;
  const rand = () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 4294967295;
  };

  for (let i = 0; i < count; i += 1) {
    const u = rand() * 2 - 1;
    const v = rand() * 2 - 1;
    const size = 0.003 + rand() * 0.0045;
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const star = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
    star.position.set(
      centerX + u * paneW * 0.46,
      v * paneH * 0.49,
      z,
    );
    star.userData['voidStar'] = true;
    star.userData['baseOpacity'] = opacity;
    star.userData['twinkleOffset'] = seed * 0.01 + i * 0.73;
    star.renderOrder = renderOrder;
    parent.add(star);
  }
}

function addSideStarScatter(
  parent: THREE.Group,
  centerZ: number,
  paneW: number,
  paneH: number,
  x: number,
  count: number,
  color: number,
  opacity: number,
  renderOrder: number,
  seed: number,
) {
  let s = seed >>> 0;
  const rand = () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 4294967295;
  };

  for (let i = 0; i < count; i += 1) {
    const u = rand() * 2 - 1;
    const v = rand() * 2 - 1;
    const size = 0.0028 + rand() * 0.004;
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const star = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
    star.rotation.y = -Math.PI / 2;
    star.position.set(
      x,
      v * paneH * 0.49,
      centerZ + u * paneW * 0.46,
    );
    star.userData['voidStar'] = true;
    star.userData['baseOpacity'] = opacity;
    star.userData['twinkleOffset'] = seed * 0.01 + i * 0.69 + 3.7;
    star.renderOrder = renderOrder;
    parent.add(star);
  }
}

function addNebulaDisk(
  parent: THREE.Group,
  x: number,
  y: number,
  z: number,
  radius: number,
  color: number,
  opacity: number,
  renderOrder: number,
  rotateY = 0,
) {
  const mesh = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 20),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  mesh.position.set(x, y, z);
  mesh.rotation.y = rotateY;
  mesh.userData['voidNebula'] = true;
  mesh.userData['baseOpacity'] = opacity;
  mesh.userData['baseX'] = x;
  mesh.userData['baseY'] = y;
  mesh.userData['baseZ'] = z;
  mesh.userData['driftOffset'] = x * 4.7 + y * 8.9 + z * 13.3;
  mesh.renderOrder = renderOrder;
  parent.add(mesh);
}

export function createWindow(): THREE.Group {
  const win = new THREE.Group();
  win.name = 'window';

  // Local origin: interior corner where back wall and right wall panes meet.
  const backPaneW = 2.02;
  const sidePaneW = 0.86;
  const paneH = 0.58;
  const frameT = 0.04;
  const frameD = 0.06;

  const frameMat = new THREE.MeshStandardMaterial({
    color: 0xdccfb8,
    roughness: 0.72,
    metalness: 0.04,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0xeee5d5,
    roughness: 0.68,
    metalness: 0.02,
  });
  const sillMat = new THREE.MeshStandardMaterial({
    color: 0xd9c8ab,
    roughness: 0.76,
    metalness: 0.03,
  });
  const blindRailMat = new THREE.MeshStandardMaterial({
    color: 0xb9c8da,
    roughness: 0.76,
    metalness: 0.04,
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x9eb6d8,
    transparent: true,
    opacity: 0.26,
    transmission: 0.72,
    thickness: 0.016,
    ior: 1.45,
    roughness: 0.05,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  // Corner post.
  const cornerPost = new THREE.Mesh(
    new THREE.BoxGeometry(frameT, paneH + frameT * 2, frameD),
    frameMat,
  );
  win.add(cornerPost);

  // Back-facing pane frame (longer span toward ladder shelf).
  const backTop = new THREE.Mesh(
    new THREE.BoxGeometry(backPaneW + frameT, frameT, frameD),
    frameMat,
  );
  backTop.position.set(-backPaneW / 2, paneH / 2 + frameT / 2, 0);
  win.add(backTop);

  const backBottom = new THREE.Mesh(
    new THREE.BoxGeometry(backPaneW + frameT, frameT, frameD),
    frameMat,
  );
  backBottom.position.set(-backPaneW / 2, -paneH / 2 - frameT / 2, 0);
  win.add(backBottom);

  const backLeft = new THREE.Mesh(
    new THREE.BoxGeometry(frameT, paneH + frameT * 2, frameD),
    frameMat,
  );
  backLeft.position.set(-backPaneW - frameT / 2, 0, 0);
  win.add(backLeft);

  // Side-facing pane frame (wraps the corner on right wall).
  const sideTop = new THREE.Mesh(
    new THREE.BoxGeometry(frameD, frameT, sidePaneW + frameT),
    frameMat,
  );
  sideTop.position.set(0, paneH / 2 + frameT / 2, sidePaneW / 2);
  win.add(sideTop);

  const sideBottom = new THREE.Mesh(
    new THREE.BoxGeometry(frameD, frameT, sidePaneW + frameT),
    frameMat,
  );
  sideBottom.position.set(0, -paneH / 2 - frameT / 2, sidePaneW / 2);
  win.add(sideBottom);

  const sideFar = new THREE.Mesh(
    new THREE.BoxGeometry(frameD, paneH + frameT * 2, frameT),
    frameMat,
  );
  sideFar.position.set(0, 0, sidePaneW + frameT / 2);
  win.add(sideFar);

  // Inner trims.
  const backTrimTop = new THREE.Mesh(
    new THREE.BoxGeometry(backPaneW, 0.014, 0.016),
    trimMat,
  );
  backTrimTop.position.set(-backPaneW / 2, paneH / 2 - 0.012, 0.022);
  win.add(backTrimTop);

  const backTrimBottom = new THREE.Mesh(
    new THREE.BoxGeometry(backPaneW, 0.014, 0.016),
    trimMat,
  );
  backTrimBottom.position.set(-backPaneW / 2, -paneH / 2 + 0.012, 0.022);
  win.add(backTrimBottom);

  const backTrimLeft = new THREE.Mesh(
    new THREE.BoxGeometry(0.014, paneH, 0.016),
    trimMat,
  );
  backTrimLeft.position.set(-backPaneW + 0.012, 0, 0.022);
  win.add(backTrimLeft);

  const backTrimRight = new THREE.Mesh(
    new THREE.BoxGeometry(0.014, paneH, 0.016),
    trimMat,
  );
  backTrimRight.position.set(-0.012, 0, 0.022);
  win.add(backTrimRight);

  const sideTrimTop = new THREE.Mesh(
    new THREE.BoxGeometry(0.016, 0.014, sidePaneW),
    trimMat,
  );
  sideTrimTop.position.set(-0.022, paneH / 2 - 0.012, sidePaneW / 2);
  win.add(sideTrimTop);

  const sideTrimBottom = new THREE.Mesh(
    new THREE.BoxGeometry(0.016, 0.014, sidePaneW),
    trimMat,
  );
  sideTrimBottom.position.set(-0.022, -paneH / 2 + 0.012, sidePaneW / 2);
  win.add(sideTrimBottom);

  const sideTrimNear = new THREE.Mesh(
    new THREE.BoxGeometry(0.016, paneH, 0.014),
    trimMat,
  );
  sideTrimNear.position.set(-0.022, 0, 0.012);
  win.add(sideTrimNear);

  const sideTrimFar = new THREE.Mesh(
    new THREE.BoxGeometry(0.016, paneH, 0.014),
    trimMat,
  );
  sideTrimFar.position.set(-0.022, 0, sidePaneW - 0.012);
  win.add(sideTrimFar);

  // Exterior dark planes for depth.
  const backOutside = new THREE.Mesh(
    new THREE.PlaneGeometry(backPaneW, paneH),
    new THREE.MeshBasicMaterial({ color: 0x050a12, side: THREE.DoubleSide }),
  );
  backOutside.position.set(-backPaneW / 2, 0, -0.014);
  backOutside.renderOrder = 1;
  win.add(backOutside);

  const backOutsideGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(backPaneW, paneH),
    new THREE.MeshBasicMaterial({
      color: 0x1a2748,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  backOutsideGlow.position.set(-backPaneW / 2 + 0.01, 0.008, -0.0132);
  backOutsideGlow.renderOrder = 2;
  win.add(backOutsideGlow);

  const backDepthHaze = new THREE.Mesh(
    new THREE.PlaneGeometry(backPaneW, paneH),
    new THREE.MeshBasicMaterial({
      color: 0x2a395e,
      transparent: true,
      opacity: 0.11,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  backDepthHaze.position.set(-backPaneW / 2 - 0.02, -0.02, -0.0127);
  backDepthHaze.renderOrder = 2;
  win.add(backDepthHaze);

  const sideOutside = new THREE.Mesh(
    new THREE.PlaneGeometry(sidePaneW, paneH),
    new THREE.MeshBasicMaterial({ color: 0x050a12, side: THREE.DoubleSide }),
  );
  sideOutside.rotation.y = -Math.PI / 2;
  sideOutside.position.set(0.014, 0, sidePaneW / 2);
  sideOutside.renderOrder = 1;
  win.add(sideOutside);

  const sideOutsideGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(sidePaneW, paneH),
    new THREE.MeshBasicMaterial({
      color: 0x1a2748,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  sideOutsideGlow.rotation.y = -Math.PI / 2;
  sideOutsideGlow.position.set(0.0132, 0.01, sidePaneW / 2 - 0.01);
  sideOutsideGlow.renderOrder = 2;
  win.add(sideOutsideGlow);

  const sideDepthHaze = new THREE.Mesh(
    new THREE.PlaneGeometry(sidePaneW, paneH),
    new THREE.MeshBasicMaterial({
      color: 0x27365a,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  sideDepthHaze.rotation.y = -Math.PI / 2;
  sideDepthHaze.position.set(0.0124, -0.015, sidePaneW / 2 + 0.01);
  sideDepthHaze.renderOrder = 2;
  win.add(sideDepthHaze);

  // Nebula + atmospheric layers.
  addNebulaDisk(win, -backPaneW * 0.4, 0.14, -0.0128, 0.18, 0x304880, 0.065, 3);
  addNebulaDisk(win, -backPaneW * 0.14, -0.04, -0.0126, 0.16, 0x2e5d8a, 0.055, 3);
  addNebulaDisk(win, 0.0138, 0.09, sidePaneW * 0.34, 0.13, 0x2f4b78, 0.05, 3, -Math.PI / 2);
  addNebulaDisk(win, 0.013, -0.08, sidePaneW * 0.66, 0.11, 0x3d3f78, 0.045, 3, -Math.PI / 2);

  // Moon and halo on back pane.
  const moonGlow = new THREE.Mesh(
    new THREE.CircleGeometry(0.07, 20),
    new THREE.MeshBasicMaterial({
      color: 0xd6e1ff,
      transparent: true,
      opacity: 0.09,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  moonGlow.position.set(-0.3, 0.2, -0.0126);
  moonGlow.userData['voidMoonGlow'] = true;
  moonGlow.userData['baseOpacity'] = 0.09;
  moonGlow.renderOrder = 4;
  win.add(moonGlow);

  const moon = new THREE.Mesh(
    new THREE.CircleGeometry(0.048, 20),
    new THREE.MeshBasicMaterial({
      color: 0xf2f5ff,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  moon.position.set(-0.3, 0.2, -0.0122);
  moon.userData['voidMoon'] = true;
  moon.renderOrder = 5;
  win.add(moon);

  addBackStarLayer(
    win,
    -backPaneW / 2,
    backPaneW,
    paneH,
    -0.012,
    STAR_LAYOUT_FAR,
    0xb8c8ff,
    0.78,
    6,
  );
  addBackStarLayer(
    win,
    -backPaneW / 2,
    backPaneW,
    paneH,
    -0.0112,
    STAR_LAYOUT_NEAR,
    0xe5eeff,
    0.92,
    7,
  );

  addSideStarLayer(
    win,
    sidePaneW / 2,
    sidePaneW,
    paneH,
    0.0145,
    STAR_LAYOUT_FAR,
    0xafbfff,
    0.72,
    6,
  );
  addSideStarLayer(
    win,
    sidePaneW / 2,
    sidePaneW,
    paneH,
    0.0128,
    STAR_LAYOUT_NEAR,
    0xe0eaff,
    0.88,
    7,
  );

  // Additional tiny stars remove visible patterning and increase realism.
  addBackStarScatter(
    win,
    -backPaneW / 2,
    backPaneW,
    paneH,
    -0.0116,
    26,
    0xdce6ff,
    0.68,
    8,
    9013,
  );
  addSideStarScatter(
    win,
    sidePaneW / 2,
    sidePaneW,
    paneH,
    0.0138,
    16,
    0xdce6ff,
    0.64,
    8,
    1193,
  );

  // Accent violet stars echo the desktop/start-screen void palette.
  addBackStarScatter(
    win,
    -backPaneW / 2,
    backPaneW,
    paneH,
    -0.01145,
    14,
    0x8b87ff,
    0.5,
    8,
    5511,
  );
  addSideStarScatter(
    win,
    sidePaneW / 2,
    sidePaneW,
    paneH,
    0.0136,
    10,
    0x8b87ff,
    0.48,
    8,
    6647,
  );

  addNebulaDisk(win, -backPaneW * 0.58, -0.05, -0.01255, 0.2, 0x5f56b5, 0.06, 3);
  addNebulaDisk(win, 0.0132, -0.01, sidePaneW * 0.5, 0.15, 0x5a5fb8, 0.055, 3, -Math.PI / 2);

  const backVoidParticleCount = 90;
  const backPositions = new Float32Array(backVoidParticleCount * 3);
  for (let i = 0; i < backVoidParticleCount; i += 1) {
    backPositions[i * 3] = (Math.random() - 0.5) * backPaneW * 0.85;
    backPositions[i * 3 + 1] = (Math.random() - 0.5) * paneH * 0.86;
    backPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
  }
  const backVoidGeo = new THREE.BufferGeometry();
  backVoidGeo.setAttribute('position', new THREE.BufferAttribute(backPositions, 3));
  const backVoidMat = new THREE.PointsMaterial({
    color: 0x7c6ef0,
    size: 0.0075,
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const backVoidField = new THREE.Points(backVoidGeo, backVoidMat);
  backVoidField.position.set(-backPaneW / 2, 0, -0.0113);
  backVoidField.renderOrder = 9;
  backVoidField.userData['voidField'] = true;
  backVoidField.userData['baseOpacity'] = 0.4;
  backVoidField.userData['phase'] = 1.3;
  win.add(backVoidField);

  const sideVoidParticleCount = 58;
  const sidePositions = new Float32Array(sideVoidParticleCount * 3);
  for (let i = 0; i < sideVoidParticleCount; i += 1) {
    sidePositions[i * 3] = (Math.random() - 0.5) * sidePaneW * 0.8;
    sidePositions[i * 3 + 1] = (Math.random() - 0.5) * paneH * 0.84;
    sidePositions[i * 3 + 2] = (Math.random() - 0.5) * 0.0015;
  }
  const sideVoidGeo = new THREE.BufferGeometry();
  sideVoidGeo.setAttribute('position', new THREE.BufferAttribute(sidePositions, 3));
  const sideVoidMat = new THREE.PointsMaterial({
    color: 0x7087ff,
    size: 0.0072,
    transparent: true,
    opacity: 0.36,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const sideVoidField = new THREE.Points(sideVoidGeo, sideVoidMat);
  sideVoidField.position.set(0.0128, 0, sidePaneW / 2);
  sideVoidField.rotation.y = -Math.PI / 2;
  sideVoidField.renderOrder = 9;
  sideVoidField.userData['voidField'] = true;
  sideVoidField.userData['baseOpacity'] = 0.36;
  sideVoidField.userData['phase'] = 2.7;
  win.add(sideVoidField);

  // Glass panes.
  const backGlass = new THREE.Mesh(
    new THREE.PlaneGeometry(backPaneW, paneH),
    glassMat,
  );
  backGlass.position.set(-backPaneW / 2, 0, -0.004);
  backGlass.renderOrder = 10;
  win.add(backGlass);

  const sideGlass = new THREE.Mesh(
    new THREE.PlaneGeometry(sidePaneW, paneH),
    glassMat,
  );
  sideGlass.rotation.y = -Math.PI / 2;
  sideGlass.position.set(0.004, 0, sidePaneW / 2);
  sideGlass.renderOrder = 10;
  win.add(sideGlass);

  // Pane sheen.
  const backSheen = new THREE.Mesh(
    new THREE.PlaneGeometry(backPaneW, paneH),
    new THREE.MeshBasicMaterial({
      color: 0xdbe8ff,
      transparent: true,
      opacity: 0.055,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  backSheen.position.set(-backPaneW / 2 + 0.025, 0.02, -0.0028);
  backSheen.renderOrder = 11;
  win.add(backSheen);

  const sideSheen = new THREE.Mesh(
    new THREE.PlaneGeometry(sidePaneW, paneH),
    new THREE.MeshBasicMaterial({
      color: 0xdbe8ff,
      transparent: true,
      opacity: 0.05,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  sideSheen.rotation.y = -Math.PI / 2;
  sideSheen.position.set(0.0028, 0.02, sidePaneW / 2 - 0.01);
  sideSheen.renderOrder = 11;
  win.add(sideSheen);

  // Interior sills.
  const sillY = -paneH / 2 - frameT - 0.02;

  const backSill = new THREE.Mesh(
    new THREE.BoxGeometry(backPaneW + 0.1, 0.03, 0.14),
    sillMat,
  );
  backSill.position.set(-backPaneW / 2, sillY, 0.062);
  win.add(backSill);

  const sideSill = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.03, sidePaneW + 0.12),
    sillMat,
  );
  sideSill.position.set(-0.062, sillY, sidePaneW / 2);
  win.add(sideSill);

  // Curtains on both open edges.
  const curtainMat = new THREE.MeshStandardMaterial({
    color: 0x6f7883,
    roughness: 0.92,
    metalness: 0.02,
    side: THREE.DoubleSide,
  });
  const curtainFoldMat = new THREE.MeshStandardMaterial({
    color: 0x606a75,
    roughness: 0.9,
  });
  const curtainAccentMat = new THREE.MeshStandardMaterial({
    color: 0x525b66,
    roughness: 0.88,
  });
  const curtainHighlightMat = new THREE.MeshStandardMaterial({
    color: 0x7c8793,
    roughness: 0.86,
  });
  const curtainFineLineMat = new THREE.MeshStandardMaterial({
    color: 0x454d57,
    roughness: 0.9,
  });
  const curtainHeight = paneH + frameT * 2;
  const curtainFoldHeight = curtainHeight - 0.01;
  const curtainCenterY = 0;
  const curtainCapY = paneH / 2 + frameT + 0.01;

  const backCurtainCenterX = -backPaneW - frameT - 0.06;
  const backCurtain = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, curtainHeight),
    curtainMat,
  );
  backCurtain.position.set(backCurtainCenterX, curtainCenterY, 0.05);
  win.add(backCurtain);

  for (const dx of [-0.11, -0.056, 0, 0.056, 0.11]) {
    const fold = new THREE.Mesh(
      new THREE.BoxGeometry(0.01, curtainFoldHeight, 0.014),
      curtainFoldMat,
    );
    fold.position.set(backCurtainCenterX + dx, curtainCenterY, 0.056);
    win.add(fold);
  }

  const backCurtainCap = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.02, 0.018),
    blindRailMat,
  );
  backCurtainCap.position.set(backCurtainCenterX, curtainCapY, 0.05);
  win.add(backCurtainCap);

  const sideCurtainCenterZ = sidePaneW + frameT + 0.06;
  const sideCurtain = new THREE.Mesh(
    new THREE.BoxGeometry(0.013, curtainHeight, 0.178),
    curtainMat,
  );
  sideCurtain.position.set(-0.054, curtainCenterY, sideCurtainCenterZ);
  win.add(sideCurtain);

  const sideCurtainInner = new THREE.Mesh(
    new THREE.BoxGeometry(0.008, curtainHeight - 0.032, 0.148),
    curtainAccentMat,
  );
  sideCurtainInner.position.set(-0.046, curtainCenterY, sideCurtainCenterZ);
  win.add(sideCurtainInner);

  const sideFoldOffsets = [-0.072, -0.048, -0.024, 0, 0.024, 0.048, 0.072] as const;
  sideFoldOffsets.forEach((dz, idx) => {
    const deeperFold = idx % 2 === 0;
    const fold = new THREE.Mesh(
      new THREE.BoxGeometry(deeperFold ? 0.013 : 0.011, curtainFoldHeight, deeperFold ? 0.012 : 0.01),
      curtainFoldMat,
    );
    fold.position.set(deeperFold ? -0.047 : -0.044, curtainCenterY, sideCurtainCenterZ + dz);
    win.add(fold);
  });

  for (const dz of [-0.06, -0.036, -0.012, 0.012, 0.036, 0.06] as const) {
    const seam = new THREE.Mesh(
      new THREE.BoxGeometry(0.005, curtainHeight - 0.028, 0.007),
      curtainAccentMat,
    );
    seam.position.set(-0.0415, curtainCenterY, sideCurtainCenterZ + dz);
    win.add(seam);

    const seamHighlight = new THREE.Mesh(
      new THREE.BoxGeometry(0.002, curtainHeight - 0.036, 0.005),
      curtainHighlightMat,
    );
    seamHighlight.position.set(-0.039, curtainCenterY, sideCurtainCenterZ + dz);
    win.add(seamHighlight);
  }

  for (const dz of [-0.074, -0.06, -0.046, -0.032, -0.018, -0.004, 0.01, 0.024, 0.038, 0.052, 0.066] as const) {
    const fineLine = new THREE.Mesh(
      new THREE.BoxGeometry(0.003, curtainHeight - 0.036, 0.004),
      curtainFineLineMat,
    );
    fineLine.position.set(-0.0365, curtainCenterY, sideCurtainCenterZ + dz);
    win.add(fineLine);
  }

  for (const dz of [-0.067, -0.039, -0.011, 0.017, 0.045, 0.073] as const) {
    const fineHighlight = new THREE.Mesh(
      new THREE.BoxGeometry(0.0017, curtainHeight - 0.05, 0.003),
      curtainHighlightMat,
    );
    fineHighlight.position.set(-0.0345, curtainCenterY, sideCurtainCenterZ + dz);
    win.add(fineHighlight);
  }

  const sideCurtainValance = new THREE.Mesh(
    new THREE.BoxGeometry(0.016, 0.03, 0.19),
    curtainAccentMat,
  );
  sideCurtainValance.position.set(-0.049, curtainCapY - 0.01, sideCurtainCenterZ);
  win.add(sideCurtainValance);

  const sideCurtainTie = new THREE.Mesh(
    new THREE.BoxGeometry(0.014, 0.04, 0.108),
    blindRailMat,
  );
  sideCurtainTie.position.set(-0.044, 0.02, sideCurtainCenterZ);
  win.add(sideCurtainTie);

  const sideCurtainTieKnot = new THREE.Mesh(
    new THREE.BoxGeometry(0.01, 0.022, 0.03),
    blindRailMat,
  );
  sideCurtainTieKnot.position.set(-0.038, 0.02, sideCurtainCenterZ);
  win.add(sideCurtainTieKnot);

  const sideCurtainHem = new THREE.Mesh(
    new THREE.BoxGeometry(0.014, 0.018, 0.172),
    curtainAccentMat,
  );
  sideCurtainHem.position.set(-0.051, -curtainHeight / 2 + 0.009, sideCurtainCenterZ);
  win.add(sideCurtainHem);

  const sideCurtainCap = new THREE.Mesh(
    new THREE.BoxGeometry(0.022, 0.028, 0.206),
    blindRailMat,
  );
  sideCurtainCap.position.set(-0.055, curtainCapY - 0.004, sideCurtainCenterZ);
  win.add(sideCurtainCap);

  // Matching cactus from ladder shelf placed on corner sill.
  const cactusBaseX = -0.056;
  const cactusBaseY = sillY + 0.034;
  const cactusBaseZ = 0.22;

  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.041, 0.047, 0.058, 14),
    new THREE.MeshStandardMaterial({ color: 0x8a6347, roughness: 0.88 }),
  );
  pot.position.set(cactusBaseX, cactusBaseY, cactusBaseZ);
  win.add(pot);

  const potRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.041, 0.004, 8, 14),
    new THREE.MeshStandardMaterial({ color: 0x9b7354, roughness: 0.84 }),
  );
  potRim.position.set(cactusBaseX, cactusBaseY + 0.027, cactusBaseZ);
  potRim.rotation.x = Math.PI / 2;
  win.add(potRim);

  const soil = new THREE.Mesh(
    new THREE.CylinderGeometry(0.033, 0.035, 0.012, 10),
    new THREE.MeshStandardMaterial({ color: 0x5a4739, roughness: 0.94 }),
  );
  soil.position.set(cactusBaseX, cactusBaseY + 0.027, cactusBaseZ);
  win.add(soil);

  const cactusBodyMat = new THREE.MeshStandardMaterial({ color: 0x4c9a64, roughness: 0.76 });
  const cactusShadeMat = new THREE.MeshStandardMaterial({ color: 0x3f8655, roughness: 0.8 });

  const cactusCore = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.018, 0.092, 6),
    cactusBodyMat,
  );
  cactusCore.position.set(cactusBaseX, cactusBaseY + 0.073, cactusBaseZ);
  win.add(cactusCore);

  const leftArm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.009, 0.011, 0.06, 6),
    cactusShadeMat,
  );
  leftArm.position.set(cactusBaseX - 0.017, cactusBaseY + 0.063, cactusBaseZ + 0.003);
  leftArm.rotation.z = 0.56;
  win.add(leftArm);

  const rightArm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.01, 0.052, 6),
    cactusShadeMat,
  );
  rightArm.position.set(cactusBaseX + 0.016, cactusBaseY + 0.06, cactusBaseZ - 0.003);
  rightArm.rotation.z = -0.5;
  win.add(rightArm);

  for (const offset of [-0.008, 0, 0.008] as const) {
    const rib = new THREE.Mesh(
      new THREE.BoxGeometry(0.003, 0.082, 0.003),
      cactusShadeMat,
    );
    rib.position.set(cactusBaseX + offset, cactusBaseY + 0.073, cactusBaseZ + 0.013);
    win.add(rib);
  }

  const spikeMat = new THREE.MeshStandardMaterial({ color: 0xd9d3c6, roughness: 0.8 });
  for (const [sx, sy, sz] of [
    [cactusBaseX, cactusBaseY + 0.108, cactusBaseZ + 0.011],
    [cactusBaseX - 0.013, cactusBaseY + 0.08, cactusBaseZ + 0.016],
    [cactusBaseX + 0.013, cactusBaseY + 0.076, cactusBaseZ + 0.014],
    [cactusBaseX, cactusBaseY + 0.063, cactusBaseZ + 0.02],
  ] as const) {
    const spike = new THREE.Mesh(new THREE.BoxGeometry(0.002, 0.008, 0.002), spikeMat);
    spike.position.set(sx, sy, sz);
    win.add(spike);
  }

  const animatedStars: THREE.Mesh[] = [];
  const animatedNebulae: THREE.Mesh[] = [];
  const animatedFields: THREE.Points[] = [];
  let animatedMoonGlow: THREE.Mesh | null = null;
  let animatedMoon: THREE.Mesh | null = null;

  win.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    if (obj.userData['voidStar']) animatedStars.push(obj);
    if (obj.userData['voidNebula']) animatedNebulae.push(obj);
    if (obj.userData['voidMoonGlow']) animatedMoonGlow = obj;
    if (obj.userData['voidMoon']) animatedMoon = obj;
  });

  win.traverse((obj) => {
    if (obj instanceof THREE.Points && obj.userData['voidField']) {
      animatedFields.push(obj);
    }
  });

  // Animated twinkle/drift gives a subtle desktop-like living void effect.
  win.userData['animateVoid'] = (timeSeconds: number) => {
    for (const star of animatedStars) {
      const seed = (star.userData['twinkleOffset'] as number) ?? 0;
      const twinkle = 0.78 + Math.sin(timeSeconds * 2.9 + seed) * 0.34;
      star.scale.setScalar(twinkle);

      const mat = star.material as THREE.MeshBasicMaterial;
      const baseOpacity = (star.userData['baseOpacity'] as number) ?? mat.opacity;
      mat.opacity = baseOpacity * (0.62 + Math.sin(timeSeconds * 3.9 + seed * 1.37) * 0.38);
    }

    for (const nebula of animatedNebulae) {
      const drift = (nebula.userData['driftOffset'] as number) ?? 0;
      const baseY = (nebula.userData['baseY'] as number) ?? nebula.position.y;
      const baseX = (nebula.userData['baseX'] as number) ?? nebula.position.x;
      const mat = nebula.material as THREE.MeshBasicMaterial;
      const baseOpacity = (nebula.userData['baseOpacity'] as number) ?? mat.opacity;

      nebula.position.y = baseY + Math.sin(timeSeconds * 0.38 + drift) * 0.012;
      nebula.position.x = baseX + Math.sin(timeSeconds * 0.31 + drift * 0.7) * 0.01;
      nebula.rotation.z = Math.sin(timeSeconds * 0.16 + drift) * 0.09;
      mat.opacity = baseOpacity * (0.7 + Math.sin(timeSeconds * 0.9 + drift) * 0.3);
    }

    for (const field of animatedFields) {
      const phase = (field.userData['phase'] as number) ?? 0;
      const baseOpacity = (field.userData['baseOpacity'] as number) ?? 0.35;
      const fieldMat = field.material as THREE.PointsMaterial;

      field.rotation.z = Math.sin(timeSeconds * 0.24 + phase) * 0.16;
      field.rotation.x = Math.sin(timeSeconds * 0.2 + phase * 0.8) * 0.04;
      fieldMat.opacity = baseOpacity * (0.72 + Math.sin(timeSeconds * 1.2 + phase) * 0.28);
      fieldMat.size = 0.0068 + Math.sin(timeSeconds * 0.9 + phase) * 0.0018;
    }

    if (animatedMoonGlow) {
      const moonGlowMat = animatedMoonGlow.material as THREE.MeshBasicMaterial;
      const baseOpacity = (animatedMoonGlow.userData['baseOpacity'] as number) ?? 0.09;
      moonGlowMat.opacity = baseOpacity * (0.72 + Math.sin(timeSeconds * 1.4 + 2.1) * 0.28);
    }

    if (animatedMoon) {
      const pulse = 0.985 + Math.sin(timeSeconds * 0.75 + 0.4) * 0.015;
      animatedMoon.scale.setScalar(pulse);
    }
  };

  // Prevent thin geometry popping at shallow angles.
  win.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.frustumCulled = false;
    }
  });

  return win;
}
