/**
 * PCSetup — Monitor, keyboard, and mouse elements sitting on a desk.
 *
 * This is an INTERACTABLE prop — the player can interact with it
 * to view their profile / settings overlay.
 */

import * as THREE from 'three';

export function createPCSetup(): THREE.Group {
  const pc = new THREE.Group();
  pc.name = 'pc-setup';
  pc.userData['interactable'] = true;
  pc.userData['interactType'] = 'pc';
  pc.userData['prompt'] = 'Return To Start Screen';

  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x111115,
    roughness: 0.3,
    metalness: 0.5,
  });

  const screenMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a2e,
    roughness: 0.1,
    metalness: 0.2,
    emissive: 0x2a2a5a,
    emissiveIntensity: 0.3,
  });

  // —— Monitor ——
  // Bezel
  const bezel = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 0.4, 0.03),
    darkMat,
  );
  bezel.position.set(0, 0.28, 0);
  pc.add(bezel);

  // Screen (slightly inset, emissive)
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.58, 0.33),
    screenMat,
  );
  screen.position.set(0, 0.28, 0.016);
  pc.add(screen);

  // Monitor stand
  const stand = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.12, 0.06),
    darkMat,
  );
  stand.position.set(0, 0.06, 0);
  pc.add(stand);

  // Stand base
  const standBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.015, 0.12),
    darkMat,
  );
  standBase.position.set(0, 0, 0);
  pc.add(standBase);

  // —— Keyboard ——
  const keyboard = new THREE.Group();
  keyboard.position.set(0, 0.008, 0.3);
  pc.add(keyboard);

  // Layout modeled after a full-size board from the reference image:
  // grouped function row, full alpha block, nav cluster, and numpad.
  const kbCaseMat = new THREE.MeshStandardMaterial({
    color: 0x0f1116,
    roughness: 0.52,
    metalness: 0.24,
  });
  const kbPlateMat = new THREE.MeshStandardMaterial({
    color: 0x161a22,
    roughness: 0.56,
    metalness: 0.18,
  });
  const keyMat = new THREE.MeshStandardMaterial({
    color: 0x242a34,
    roughness: 0.6,
    metalness: 0.08,
  });
  const keyAccentMat = new THREE.MeshStandardMaterial({
    color: 0x2e3541,
    roughness: 0.58,
    metalness: 0.1,
  });

  const kbCase = new THREE.Mesh(
    new THREE.BoxGeometry(0.62, 0.02, 0.182),
    kbCaseMat,
  );
  kbCase.position.set(0, 0, 0);
  keyboard.add(kbCase);

  const kbPlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.602, 0.004, 0.166),
    kbPlateMat,
  );
  kbPlate.position.set(0, 0.011, -0.002);
  keyboard.add(kbPlate);

  const kbFrontLip = new THREE.Mesh(
    new THREE.BoxGeometry(0.62, 0.004, 0.028),
    kbCaseMat,
  );
  kbFrontLip.position.set(0, -0.008, 0.078);
  keyboard.add(kbFrontLip);

  const keyUnit = 0.0215;
  const keyGap = 0.0035;
  const xStart = -0.275;

  const addKeyUnits = (
    col: number,
    z: number,
    widthUnits = 1,
    depthUnits = 1,
    height = 0.0058,
    rowLift = 0,
    material: THREE.Material = keyMat,
  ) => {
    const w = widthUnits * keyUnit - keyGap;
    const d = depthUnits * keyUnit - keyGap;
    const key = new THREE.Mesh(new THREE.BoxGeometry(w, height, d), material);
    const centerCol = col + (widthUnits - 1) * 0.5;
    key.position.set(
      xStart + centerCol * keyUnit,
      0.014 + rowLift + height * 0.5,
      z,
    );
    key.rotation.x = 0;
    keyboard.add(key);
  };

  const addRow = (
    z: number,
    startCol: number,
    widths: number[],
    rowLift: number,
  ) => {
    let col = startCol;
    for (let i = 0; i < widths.length; i += 1) {
      const width = widths[i]!;
      const isEdge = i === 0 || i === widths.length - 1;
      addKeyUnits(col, z, width, 1, 0.0062, rowLift, isEdge ? keyAccentMat : keyMat);
      col += width;
    }
  };

  // Keyboard blueprint based on the reference: full-size ANSI with separated clusters.
  const functionRowCols = [0, 2, 3, 4, 5, 7, 8, 9, 10, 12, 13, 14, 15, 17, 18, 19, 20];
  for (const col of functionRowCols) {
    addKeyUnits(col, -0.065, 0.9, 0.8, 0.0052, 0.0004, keyAccentMat);
  }

  const mainRows: Array<{ z: number; startCol: number; widths: number[]; rowLift: number }> = [
    { z: -0.039, startCol: 0, widths: [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], rowLift: 0.0012 },
    { z: -0.013, startCol: 0, widths: [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25], rowLift: 0.002 },
    { z: 0.013, startCol: 0, widths: [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.75], rowLift: 0.0025 },
    { z: 0.039, startCol: 0, widths: [2.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.75], rowLift: 0.0022 },
    { z: 0.065, startCol: 0, widths: [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25], rowLift: 0.0012 },
  ];
  for (const row of mainRows) {
    addRow(row.z, row.startCol, row.widths, row.rowLift);
  }

  const navStart = 18;
  for (const z of [-0.039, -0.013]) {
    addKeyUnits(navStart + 0, z, 1, 1, 0.006, 0.0018, keyMat);
    addKeyUnits(navStart + 1, z, 1, 1, 0.006, 0.0018, keyMat);
    addKeyUnits(navStart + 2, z, 1, 1, 0.006, 0.0018, keyMat);
  }
  // Inverted-T arrows.
  addKeyUnits(navStart + 1, 0.039, 1, 1, 0.006, 0.0012, keyMat);
  addKeyUnits(navStart + 0, 0.065, 1, 1, 0.006, 0.0008, keyMat);
  addKeyUnits(navStart + 1, 0.065, 1, 1, 0.006, 0.0008, keyMat);
  addKeyUnits(navStart + 2, 0.065, 1, 1, 0.006, 0.0008, keyMat);

  const numpadStart = 22.1;
  for (const z of [-0.039, -0.013, 0.013, 0.039]) {
    addKeyUnits(numpadStart + 0, z, 1, 1, 0.006, 0.0018, keyMat);
    addKeyUnits(numpadStart + 1, z, 1, 1, 0.006, 0.0018, keyMat);
    addKeyUnits(numpadStart + 2, z, 1, 1, 0.006, 0.0018, keyMat);
    addKeyUnits(numpadStart + 3, z, 1, 1, 0.006, 0.0018, keyMat);
  }

  // Bottom numpad row with a 2u key + two 1u keys.
  let numpadBottomCol = numpadStart;
  for (const width of [2, 1, 1]) {
    addKeyUnits(numpadBottomCol, 0.065, width, 1, 0.006, 0.001, keyMat);
    numpadBottomCol += width;
  }

  // —— Mouse ——
  const mouse = new THREE.Group();
  mouse.position.set(0.36, 0.004, 0.305);
  pc.add(mouse);

  const mouseBodyMat = new THREE.MeshStandardMaterial({
    color: 0x161b24,
    roughness: 0.62,
    metalness: 0.18,
  });
  const mouseTopMat = new THREE.MeshStandardMaterial({
    color: 0x2a303a,
    roughness: 0.56,
    metalness: 0.12,
  });
  const mouseLineMat = new THREE.MeshStandardMaterial({
    color: 0x767d87,
    roughness: 0.44,
    metalness: 0.28,
  });

  const mouseBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.052, 0.008, 0.082),
    mouseBodyMat,
  );
  mouseBase.position.set(0, 0.004, 0);
  mouse.add(mouseBase);

  const mouseTop = new THREE.Mesh(
    new THREE.BoxGeometry(0.044, 0.01, 0.062),
    mouseTopMat,
  );
  mouseTop.position.set(0, 0.012, -0.004);
  mouse.add(mouseTop);

  const mouseFront = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.006, 0.02),
    mouseTopMat,
  );
  mouseFront.position.set(0, 0.011, -0.036);
  mouseFront.rotation.x = -0.16;
  mouse.add(mouseFront);

  // Fine line details while keeping a blocky silhouette.
  const centerSplit = new THREE.Mesh(
    new THREE.BoxGeometry(0.0016, 0.0028, 0.031),
    mouseLineMat,
  );
  centerSplit.position.set(0, 0.0182, -0.014);
  mouse.add(centerSplit);

  const wheel = new THREE.Mesh(
    new THREE.BoxGeometry(0.0032, 0.0045, 0.011),
    mouseLineMat,
  );
  wheel.position.set(0, 0.018, -0.004);
  mouse.add(wheel);

  const leftSideLine = new THREE.Mesh(
    new THREE.BoxGeometry(0.0014, 0.0018, 0.044),
    mouseLineMat,
  );
  leftSideLine.position.set(-0.0195, 0.0125, -0.001);
  mouse.add(leftSideLine);

  const rightSideLine = new THREE.Mesh(
    new THREE.BoxGeometry(0.0014, 0.0018, 0.044),
    mouseLineMat,
  );
  rightSideLine.position.set(0.0195, 0.0125, -0.001);
  mouse.add(rightSideLine);

  // —— Small accent LED strip on monitor bottom ——
  const ledMat = new THREE.MeshStandardMaterial({
    color: 0x7c6ef0,
    emissive: 0x7c6ef0,
    emissiveIntensity: 0.8,
  });
  const led = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.005, 0.005),
    ledMat,
  );
  led.position.set(0, 0.075, 0.016);
  pc.add(led);

  return pc;
}
