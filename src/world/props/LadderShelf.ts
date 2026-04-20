/**
 * LadderShelf — Leaning ladder shelf with books and small objects.
 */

import * as THREE from 'three';

interface BookOptions {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  color: number;
  tilt?: number;
}

function addBook(parent: THREE.Group, options: BookOptions): void {
  const { x, y, z, width, height, depth, color, tilt = 0 } = options;

  const coverMat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.88,
  });
  const pageMat = new THREE.MeshStandardMaterial({
    color: 0xf2ecdf,
    roughness: 0.95,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: 0xdcc9a4,
    roughness: 0.75,
    metalness: 0.05,
  });

  const book = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    coverMat,
  );
  book.position.set(x, y, z);
  book.rotation.z = tilt;
  parent.add(book);

  // Inner page block adds a little realism to each spine.
  const pageBlock = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.72, height * 0.9, 0.012),
    pageMat,
  );
  pageBlock.position.set(x, y, z + depth / 2 - 0.005);
  pageBlock.rotation.z = tilt;
  parent.add(pageBlock);

  const spineBand = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.8, 0.012, 0.013),
    accentMat,
  );
  spineBand.position.set(x, y + height * 0.28, z + depth / 2 - 0.003);
  spineBand.rotation.z = tilt;
  parent.add(spineBand);
}

export function createLadderShelf(): THREE.Group {
  const shelf = new THREE.Group();
  shelf.name = 'ladder-shelf';

  const frameWoodMat = new THREE.MeshStandardMaterial({
    color: 0x5c4a3a,
    roughness: 0.85,
  });
  const shelfWoodMat = new THREE.MeshStandardMaterial({
    color: 0x7a5b45,
    roughness: 0.82,
  });
  const trimWoodMat = new THREE.MeshStandardMaterial({
    color: 0x4b382b,
    roughness: 0.9,
  });
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x887a67,
    roughness: 0.45,
    metalness: 0.6,
  });

  // —— Side rails (wider near floor, narrowing toward top) ——
  const addTaperedLeg = (bottomX: number, topX: number) => {
    const bottom = new THREE.Vector3(bottomX, 0.03, -0.01);
    const top = new THREE.Vector3(topX, 1.85, -0.2);
    const dir = new THREE.Vector3().subVectors(top, bottom);
    const len = dir.length();

    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.05, len, 4, 1),
      frameWoodMat,
    );
    leg.position.copy(bottom).add(top).multiplyScalar(0.5);
    leg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    leg.rotateY(Math.PI / 4);
    shelf.add(leg);

    const foot = new THREE.Mesh(
      new THREE.BoxGeometry(0.125, 0.036, 0.095),
      trimWoodMat,
    );
    foot.position.set(bottomX, 0.018, -0.01);
    foot.rotation.y = Math.PI / 4;
    shelf.add(foot);
  };

  addTaperedLeg(-0.355, -0.22);
  addTaperedLeg(0.355, 0.22);

  // Cross spreaders tie rails together.
  const lowerSpreader = new THREE.Mesh(
    new THREE.BoxGeometry(0.54, 0.02, 0.03),
    trimWoodMat,
  );
  lowerSpreader.position.set(0, 0.24, -0.08);
  shelf.add(lowerSpreader);

  const upperSpreader = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.02, 0.03),
    trimWoodMat,
  );
  upperSpreader.position.set(0, 1.57, -0.12);
  shelf.add(upperSpreader);

  // —— Shelves (tray style, narrowing upward) ——
  const shelfHeights = [0.26, 0.66, 1.06, 1.45];
  const shelfWidths = [0.66, 0.58, 0.5, 0.42];
  const shelfDepths = [0.24, 0.22, 0.2, 0.18];

  shelfHeights.forEach((h, i) => {
    const w = shelfWidths[i]!;
    const d = shelfDepths[i]!;
    const z = -0.02 * i;

    const tray = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.028, d),
      shelfWoodMat,
    );
    tray.position.set(0, h, z);
    shelf.add(tray);

    const lipFront = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.026, 0.016),
      trimWoodMat,
    );
    lipFront.position.set(0, h + 0.018, z + d / 2 - 0.006);
    shelf.add(lipFront);

    const lipBack = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.018, 0.012),
      trimWoodMat,
    );
    lipBack.position.set(0, h + 0.012, z - d / 2 + 0.006);
    shelf.add(lipBack);

    for (const side of [-1, 1] as const) {
      const lipSide = new THREE.Mesh(
        new THREE.BoxGeometry(0.012, 0.02, d - 0.02),
        trimWoodMat,
      );
      lipSide.position.set((w / 2 - 0.006) * side, h + 0.014, z);
      shelf.add(lipSide);

      const bracket = new THREE.Mesh(
        new THREE.BoxGeometry(0.024, 0.06, 0.018),
        trimWoodMat,
      );
      bracket.position.set((w / 2 - 0.015) * side, h - 0.042, z - 0.04);
      shelf.add(bracket);

      const pin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.005, 0.005, 0.02, 8),
        metalMat,
      );
      pin.rotation.z = Math.PI / 2;
      pin.position.set((w / 2 - 0.02) * side, h + 0.012, z - 0.01);
      shelf.add(pin);
    }
  });

  // Wall mount plate and tension struts so the shelf reads as wall-attached.
  const wallPlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.52, 0.03, 0.08),
    trimWoodMat,
  );
  wallPlate.position.set(0, 1.77, -0.3);
  shelf.add(wallPlate);

  const addWallStrut = (
    startX: number,
    startY: number,
    startZ: number,
    endX: number,
    endY: number,
    endZ: number,
  ) => {
    const start = new THREE.Vector3(startX, startY, startZ);
    const end = new THREE.Vector3(endX, endY, endZ);
    const dir = new THREE.Vector3().subVectors(end, start);
    const len = dir.length();

    const strut = new THREE.Mesh(
      new THREE.CylinderGeometry(0.003, 0.003, len, 8),
      metalMat,
    );
    strut.position.copy(start).add(end).multiplyScalar(0.5);
    strut.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    shelf.add(strut);
  };

  addWallStrut(-0.18, 1.56, -0.12, -0.14, 1.77, -0.28);
  addWallStrut(0.18, 1.56, -0.12, 0.14, 1.77, -0.28);

  // —— Books and decor (deterministic placements) ——
  const colors = {
    rose: 0xad3a67,
    coral: 0xd35c7f,
    indigo: 0x4a6db2,
    mint: 0x59b889,
    violet: 0x8b73c4,
    amber: 0xc89a47,
    cream: 0xd6c9b4,
  };

  // Bottom shelf cluster
  addBook(shelf, { x: -0.23, y: 0.39, z: 0.0, width: 0.045, height: 0.23, depth: 0.15, color: colors.rose, tilt: 0.03 });
  addBook(shelf, { x: -0.16, y: 0.37, z: 0.0, width: 0.042, height: 0.19, depth: 0.145, color: colors.indigo, tilt: -0.02 });
  addBook(shelf, { x: -0.09, y: 0.385, z: 0.0, width: 0.044, height: 0.22, depth: 0.148, color: colors.mint, tilt: 0.01 });
  addBook(shelf, { x: -0.02, y: 0.365, z: 0.0, width: 0.038, height: 0.18, depth: 0.14, color: colors.amber, tilt: 0.05 });
  addBook(shelf, { x: 0.055, y: 0.38, z: 0.0, width: 0.043, height: 0.21, depth: 0.15, color: colors.violet, tilt: -0.04 });

  // Flat stack on bottom shelf
  const flatBookMat = new THREE.MeshStandardMaterial({ color: 0x6f4f9c, roughness: 0.88 });
  const flatBook = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.11), flatBookMat);
  flatBook.position.set(0.2, 0.29, 0.005);
  flatBook.rotation.y = 0.2;
  shelf.add(flatBook);

  const flatBook2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.026, 0.105),
    new THREE.MeshStandardMaterial({ color: 0x446a9c, roughness: 0.9 }),
  );
  flatBook2.position.set(0.2, 0.318, 0.005);
  flatBook2.rotation.y = 0.2;
  shelf.add(flatBook2);

  // Second shelf books
  addBook(shelf, { x: -0.14, y: 0.79, z: -0.02, width: 0.045, height: 0.2, depth: 0.135, color: colors.violet, tilt: 0.02 });
  addBook(shelf, { x: -0.07, y: 0.785, z: -0.02, width: 0.043, height: 0.19, depth: 0.13, color: colors.coral, tilt: -0.03 });
  addBook(shelf, { x: 0.01, y: 0.77, z: -0.02, width: 0.038, height: 0.16, depth: 0.12, color: colors.cream, tilt: 0.01 });

  // Decorative notebook + figurine on second shelf
  const notebook = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.014, 0.09),
    new THREE.MeshStandardMaterial({ color: 0x8d98a6, roughness: 0.9 }),
  );
  notebook.position.set(0.145, 0.677, -0.024);
  notebook.rotation.y = 0.06;
  shelf.add(notebook);

  const figurine = new THREE.Mesh(
    new THREE.CylinderGeometry(0.028, 0.022, 0.075, 10),
    new THREE.MeshStandardMaterial({ color: 0xe2d5c2, roughness: 0.7 }),
  );
  figurine.position.set(0.244, 0.735, 0.002);
  shelf.add(figurine);

  // Third shelf: storage box + tiny plant
  const storageBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.17, 0.09, 0.14),
    new THREE.MeshStandardMaterial({ color: 0x9a7f5f, roughness: 0.82 }),
  );
  storageBox.position.set(-0.1, 1.12, -0.04);
  storageBox.rotation.y = -0.16;
  shelf.add(storageBox);

  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.041, 0.047, 0.058, 14),
    new THREE.MeshStandardMaterial({ color: 0x8a6347, roughness: 0.88 }),
  );
  pot.position.set(0.16, 1.09, -0.04);
  shelf.add(pot);

  const potRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.041, 0.004, 8, 14),
    new THREE.MeshStandardMaterial({ color: 0x9b7354, roughness: 0.84 }),
  );
  potRim.position.set(0.16, 1.117, -0.04);
  potRim.rotation.x = Math.PI / 2;
  shelf.add(potRim);

  const soil = new THREE.Mesh(
    new THREE.CylinderGeometry(0.033, 0.035, 0.012, 10),
    new THREE.MeshStandardMaterial({ color: 0x5a4739, roughness: 0.94 }),
  );
  soil.position.set(0.16, 1.117, -0.04);
  shelf.add(soil);

  const cactusBodyMat = new THREE.MeshStandardMaterial({ color: 0x4c9a64, roughness: 0.76 });
  const cactusShadeMat = new THREE.MeshStandardMaterial({ color: 0x3f8655, roughness: 0.8 });

  const cactusCore = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.018, 0.092, 6),
    cactusBodyMat,
  );
  cactusCore.position.set(0.16, 1.163, -0.04);
  shelf.add(cactusCore);

  const leftArm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.009, 0.011, 0.06, 6),
    cactusShadeMat,
  );
  leftArm.position.set(0.143, 1.153, -0.037);
  leftArm.rotation.z = 0.56;
  shelf.add(leftArm);

  const rightArm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.01, 0.052, 6),
    cactusShadeMat,
  );
  rightArm.position.set(0.176, 1.15, -0.043);
  rightArm.rotation.z = -0.5;
  shelf.add(rightArm);

  for (const offset of [-0.008, 0, 0.008] as const) {
    const rib = new THREE.Mesh(
      new THREE.BoxGeometry(0.003, 0.082, 0.003),
      cactusShadeMat,
    );
    rib.position.set(0.16 + offset, 1.163, -0.027);
    shelf.add(rib);
  }

  const spikeMat = new THREE.MeshStandardMaterial({ color: 0xd9d3c6, roughness: 0.8 });
  for (const [sx, sy, sz] of [
    [0.16, 1.198, -0.029],
    [0.147, 1.17, -0.024],
    [0.173, 1.166, -0.026],
    [0.16, 1.153, -0.02],
  ] as const) {
    const spike = new THREE.Mesh(new THREE.BoxGeometry(0.002, 0.008, 0.002), spikeMat);
    spike.position.set(sx, sy, sz);
    shelf.add(spike);
  }

  // Top shelf: previously empty/floating feel — add anchored decor.
  addBook(shelf, { x: -0.158, y: 1.486, z: -0.068, width: 0.03, height: 0.108, depth: 0.072, color: colors.indigo, tilt: 0 });
  addBook(shelf, { x: -0.116, y: 1.49, z: -0.067, width: 0.028, height: 0.114, depth: 0.07, color: colors.rose, tilt: 0 });
  addBook(shelf, { x: -0.076, y: 1.484, z: -0.066, width: 0.026, height: 0.104, depth: 0.068, color: colors.cream, tilt: 0 });
  addBook(shelf, { x: -0.04, y: 1.485, z: -0.064, width: 0.023, height: 0.098, depth: 0.066, color: colors.coral, tilt: 0 });

  const topBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.08, 0.075),
    new THREE.MeshStandardMaterial({ color: 0xb79673, roughness: 0.86 }),
  );
  topBox.position.set(0.09, 1.504, -0.03);
  topBox.rotation.y = -0.12;
  shelf.add(topBox);

  const topMug = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.018, 0.056, 10),
    new THREE.MeshStandardMaterial({ color: 0xe7e1d6, roughness: 0.9 }),
  );
  topMug.position.set(0.168, 1.492, -0.018);
  shelf.add(topMug);

  return shelf;
}
