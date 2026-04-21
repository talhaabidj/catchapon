/**
 * ShopFloor — World builder for the gacha shop.
 *
 * Assembles room geometry, places machines from data,
 * adds checkout counter, storage crate, and overhead lighting.
 *
 * Room: 14m wide × 4m tall × 12m deep.
 */

import * as THREE from 'three';
import type { MachineDefinition, MachineState } from '../data/types.js';
import { tagInteractable } from '../core/InteractionTags.js';
import { createCapsuleMachine } from './machines/CapsuleMachine.js';
import { buildShopSecrets } from './shop/ShopSecrets.js';
import { buildStorageCrate } from './shop/ShopStorageCrate.js';
import { buildTokenCrate } from './shop/ShopTokenCrate.js';
import { buildTokenStation } from './shop/ShopTokenStation.js';
import type { ShopCollider } from './shop/types.js';

export type { ShopCollider } from './shop/types.js';

export interface ShopLayout {
  group: THREE.Group;
  machineGroups: Map<string, THREE.Group>;
  interactables: THREE.Object3D[];
  colliders: ShopCollider[];
}

const SHOP_WIDTH = 14;
const SHOP_HEIGHT = 4;
const SHOP_DEPTH = 12;
const HALF_W = SHOP_WIDTH / 2;
const HALF_D = SHOP_DEPTH / 2;

export function buildShopFloor(
  machines: MachineDefinition[],
  machineStates: Map<string, MachineState>,
): ShopLayout {
  const group = new THREE.Group();
  group.name = 'shop-floor';

  const machineGroups = new Map<string, THREE.Group>();
  const interactables: THREE.Object3D[] = [];
  const colliders: ShopCollider[] = [];

  // ————————————————————————————————
  // Room shell
  // ————————————————————————————————

  // Floor — polished dark stone with aisle guides
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x151923,
    roughness: 0.84,
    metalness: 0.04,
  });
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(SHOP_WIDTH, SHOP_DEPTH),
    floorMat,
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  group.add(floor);

  const tileJointMat = new THREE.MeshStandardMaterial({
    color: 0x232a38,
    roughness: 0.9,
  });
  for (let x = -HALF_W; x <= HALF_W; x += 1) {
    const line = new THREE.Mesh(
      new THREE.BoxGeometry(0.01, 0.001, SHOP_DEPTH),
      tileJointMat,
    );
    line.position.set(x, 0.001, 0);
    group.add(line);
  }
  for (let z = -HALF_D; z <= HALF_D; z += 1) {
    const line = new THREE.Mesh(
      new THREE.BoxGeometry(SHOP_WIDTH, 0.001, 0.01),
      tileJointMat,
    );
    line.position.set(0, 0.001, z);
    group.add(line);
  }

  const aisleGuideMat = new THREE.MeshStandardMaterial({
    color: 0x2f3d57,
    emissive: 0x24344f,
    emissiveIntensity: 0.2,
    roughness: 0.72,
    metalness: 0.08,
  });
  const guideRowA = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.003, 0.16), aisleGuideMat);
  guideRowA.position.set(-1.1, 0.003, -2.9);
  group.add(guideRowA);

  const guideRowB = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.003, 0.16), aisleGuideMat);
  guideRowB.position.set(-1.1, 0.003, -0.25);
  group.add(guideRowB);

  const centerWalkMat = new THREE.MeshStandardMaterial({
    color: 0x1c2330,
    roughness: 0.8,
    metalness: 0.06,
  });
  const centerWalkway = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.002, SHOP_DEPTH - 1.6), centerWalkMat);
  centerWalkway.position.set(0, 0.002, -0.2);
  group.add(centerWalkway);

  // Ceiling
  const ceilMat = new THREE.MeshStandardMaterial({
    color: 0x111118,
    roughness: 0.95,
  });
  const ceil = new THREE.Mesh(
    new THREE.PlaneGeometry(SHOP_WIDTH, SHOP_DEPTH),
    ceilMat,
  );
  ceil.rotation.x = Math.PI / 2;
  ceil.position.y = SHOP_HEIGHT;
  group.add(ceil);

  // Walls
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x1a1d28,
    roughness: 0.88,
  });
  const baseboardMat = new THREE.MeshStandardMaterial({
    color: 0x111118,
    roughness: 0.92,
  });

  // ————————————————————————————————
  // Storeroom constants
  // ————————————————————————————————
  const STORE_WIDTH = 4.0;    // how wide the storeroom is (along X)
  const STORE_DEPTH = 3.5;    // how deep the storeroom extends behind the back wall
  const STORE_HEIGHT = 3.2;   // slightly lower ceiling than main shop
  const ARCHWAY_WIDTH = 2.4;  // opening in the back wall
  const ARCHWAY_HEIGHT = 2.8; // opening height
  // Archway is positioned at the right side of the back wall
  const ARCHWAY_CENTER_X = HALF_W - STORE_WIDTH / 2; // = 7 - 2 = 5
  const STORE_LEFT_X = HALF_W - STORE_WIDTH;  // = 3
  const STORE_RIGHT_X = HALF_W;               // = 7
  const STORE_BACK_Z = -HALF_D - STORE_DEPTH; // = -6 - 3.5 = -9.5

  // —— Back wall (with archway cut-out) ——
  // Left section of back wall (from left edge to archway)
  const backLeftWidth = ARCHWAY_CENTER_X - ARCHWAY_WIDTH / 2 + HALF_W;
  const backLeft = new THREE.Mesh(
    new THREE.PlaneGeometry(backLeftWidth, SHOP_HEIGHT),
    wallMat,
  );
  backLeft.position.set(-HALF_W + backLeftWidth / 2, SHOP_HEIGHT / 2, -HALF_D);
  group.add(backLeft);

  // Right section of back wall (from archway to right edge)
  const backRightWidth = HALF_W - (ARCHWAY_CENTER_X + ARCHWAY_WIDTH / 2);
  if (backRightWidth > 0.01) {
    const backRight = new THREE.Mesh(
      new THREE.PlaneGeometry(backRightWidth, SHOP_HEIGHT),
      wallMat,
    );
    backRight.position.set(HALF_W - backRightWidth / 2, SHOP_HEIGHT / 2, -HALF_D);
    group.add(backRight);
  }

  // Top section above the archway
  const topAboveHeight = SHOP_HEIGHT - ARCHWAY_HEIGHT;
  if (topAboveHeight > 0.01) {
    const backTop = new THREE.Mesh(
      new THREE.PlaneGeometry(ARCHWAY_WIDTH, topAboveHeight),
      wallMat,
    );
    backTop.position.set(ARCHWAY_CENTER_X, ARCHWAY_HEIGHT + topAboveHeight / 2, -HALF_D);
    group.add(backTop);
  }

  // Archway frame (subtle trim around the opening)
  const archFrameMat = new THREE.MeshStandardMaterial({
    color: 0x22262f,
    roughness: 0.7,
    metalness: 0.15,
  });
  // Left jamb
  const archJambL = new THREE.Mesh(new THREE.BoxGeometry(0.08, ARCHWAY_HEIGHT, 0.12), archFrameMat);
  archJambL.position.set(ARCHWAY_CENTER_X - ARCHWAY_WIDTH / 2, ARCHWAY_HEIGHT / 2, -HALF_D);
  group.add(archJambL);
  // Right jamb
  const archJambR = new THREE.Mesh(new THREE.BoxGeometry(0.08, ARCHWAY_HEIGHT, 0.12), archFrameMat);
  archJambR.position.set(ARCHWAY_CENTER_X + ARCHWAY_WIDTH / 2, ARCHWAY_HEIGHT / 2, -HALF_D);
  group.add(archJambR);
  // Lintel
  const archLintel = new THREE.Mesh(new THREE.BoxGeometry(ARCHWAY_WIDTH + 0.16, 0.1, 0.14), archFrameMat);
  archLintel.position.set(ARCHWAY_CENTER_X, ARCHWAY_HEIGHT, -HALF_D);
  group.add(archLintel);

  // —— Storeroom geometry ——
  const storeWallMat = new THREE.MeshStandardMaterial({
    color: 0x161922,
    roughness: 0.92,
  });

  // Storeroom floor
  const storeFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(STORE_WIDTH, STORE_DEPTH),
    new THREE.MeshStandardMaterial({ color: 0x121720, roughness: 0.9, metalness: 0.04 }),
  );
  storeFloor.rotation.x = -Math.PI / 2;
  storeFloor.position.set(ARCHWAY_CENTER_X, 0.001, -HALF_D - STORE_DEPTH / 2);
  group.add(storeFloor);

  // Storeroom ceiling
  const storeCeil = new THREE.Mesh(
    new THREE.PlaneGeometry(STORE_WIDTH, STORE_DEPTH),
    new THREE.MeshStandardMaterial({ color: 0x0e1116, roughness: 0.96 }),
  );
  storeCeil.rotation.x = Math.PI / 2;
  storeCeil.position.set(ARCHWAY_CENTER_X, STORE_HEIGHT, -HALF_D - STORE_DEPTH / 2);
  group.add(storeCeil);

  // Storeroom back wall
  const storeBack = new THREE.Mesh(
    new THREE.PlaneGeometry(STORE_WIDTH, STORE_HEIGHT),
    storeWallMat,
  );
  storeBack.position.set(ARCHWAY_CENTER_X, STORE_HEIGHT / 2, STORE_BACK_Z);
  group.add(storeBack);

  // Storeroom left wall
  const storeLeftWall = new THREE.Mesh(
    new THREE.PlaneGeometry(STORE_DEPTH, STORE_HEIGHT),
    storeWallMat,
  );
  storeLeftWall.position.set(STORE_LEFT_X, STORE_HEIGHT / 2, -HALF_D - STORE_DEPTH / 2);
  storeLeftWall.rotation.y = Math.PI / 2;
  group.add(storeLeftWall);

  // Storeroom right wall
  const storeRightWall = new THREE.Mesh(
    new THREE.PlaneGeometry(STORE_DEPTH, STORE_HEIGHT),
    storeWallMat,
  );
  storeRightWall.position.set(STORE_RIGHT_X, STORE_HEIGHT / 2, -HALF_D - STORE_DEPTH / 2);
  storeRightWall.rotation.y = -Math.PI / 2;
  group.add(storeRightWall);

  // Left wall portion behind back wall (connecting main shop left wall to storeroom left wall)
  const storeJoinLeft = new THREE.Mesh(
    new THREE.PlaneGeometry(STORE_DEPTH, SHOP_HEIGHT - STORE_HEIGHT),
    wallMat,
  );
  storeJoinLeft.position.set(STORE_LEFT_X, STORE_HEIGHT + (SHOP_HEIGHT - STORE_HEIGHT) / 2, -HALF_D - STORE_DEPTH / 2);
  storeJoinLeft.rotation.y = Math.PI / 2;
  group.add(storeJoinLeft);

  // Storeroom dim overhead light
  const storeLight = new THREE.PointLight(0xdde3f0, 0.6, 6, 2);
  storeLight.position.set(ARCHWAY_CENTER_X, STORE_HEIGHT - 0.2, -HALF_D - STORE_DEPTH / 2);
  group.add(storeLight);

  // Storeroom colliders (walls prevent walking through)
  colliders.push({ name: 'store-left-wall', x: STORE_LEFT_X, z: -HALF_D - STORE_DEPTH / 2, halfW: 0.1, halfD: STORE_DEPTH / 2 });
  colliders.push({ name: 'store-right-wall', x: STORE_RIGHT_X, z: -HALF_D - STORE_DEPTH / 2, halfW: 0.1, halfD: STORE_DEPTH / 2 });
  colliders.push({ name: 'store-back-wall', x: ARCHWAY_CENTER_X, z: STORE_BACK_Z, halfW: STORE_WIDTH / 2, halfD: 0.1 });
  // Block areas of back wall adjacent to archway (prevent walking through solid wall sections)
  if (backLeftWidth > 0.5) {
    colliders.push({ name: 'back-wall-left', x: -HALF_W + backLeftWidth / 2, z: -HALF_D, halfW: backLeftWidth / 2, halfD: 0.15 });
  }

  // Front wall
  const front = new THREE.Mesh(
    new THREE.PlaneGeometry(SHOP_WIDTH, SHOP_HEIGHT),
    wallMat,
  );
  front.position.set(0, SHOP_HEIGHT / 2, HALF_D);
  front.rotation.y = Math.PI;
  group.add(front);

  // Left wall
  const left = new THREE.Mesh(
    new THREE.PlaneGeometry(SHOP_DEPTH, SHOP_HEIGHT),
    wallMat,
  );
  left.position.set(-HALF_W, SHOP_HEIGHT / 2, 0);
  left.rotation.y = Math.PI / 2;
  group.add(left);

  // Right wall
  const right = new THREE.Mesh(
    new THREE.PlaneGeometry(SHOP_DEPTH, SHOP_HEIGHT),
    wallMat,
  );
  right.position.set(HALF_W, SHOP_HEIGHT / 2, 0);
  right.rotation.y = -Math.PI / 2;
  group.add(right);

  // Baseboards (thin dark strip along bottom of walls)
  const bbHeight = 0.12;
  const bbGeo = (w: number) => new THREE.BoxGeometry(w, bbHeight, 0.03);
  const bbFront = new THREE.Mesh(bbGeo(SHOP_WIDTH), baseboardMat);
  bbFront.position.set(0, bbHeight / 2, HALF_D - 0.01);
  group.add(bbFront);
  const bbLeft = new THREE.Mesh(bbGeo(SHOP_DEPTH), baseboardMat);
  bbLeft.position.set(-HALF_W + 0.01, bbHeight / 2, 0);
  bbLeft.rotation.y = Math.PI / 2;
  group.add(bbLeft);
  const bbRight = new THREE.Mesh(bbGeo(SHOP_DEPTH), baseboardMat);
  bbRight.position.set(HALF_W - 0.01, bbHeight / 2, 0);
  bbRight.rotation.y = Math.PI / 2;
  group.add(bbRight);

  // ————————————————————————————————
  // Machines
  // ————————————————————————————————

  for (const def of machines) {
    const state = machineStates.get(def.id);
    const machineGroup = createCapsuleMachine(def, state);

    // Wondertrade gets a special interaction type
    if (def.id === 'machine-wondertrade') {
      tagInteractable(machineGroup, {
        type: 'wondertrade',
        prompt: def.name,
        machineId: def.id,
      });
    }

    group.add(machineGroup);
    machineGroups.set(def.id, machineGroup);
    interactables.push(machineGroup);

    const rotated = Math.abs(def.rotation) % Math.PI > 0.01;
    const machineHalfW = 0.48;
    const machineHalfD = 0.42;
    colliders.push({
      name: `machine-${def.id}`,
      x: def.position[0],
      z: def.position[2],
      halfW: rotated ? machineHalfD : machineHalfW,
      halfD: rotated ? machineHalfW : machineHalfD,
    });
  }

  // ————————————————————————————————
  // Checkout counter (near entrance)
  // ————————————————————————————————

  const counterWoodMat = new THREE.MeshStandardMaterial({
    color: 0x4a3728,
    roughness: 0.72,
    metalness: 0.08,
  });
  const counterTopMat = new THREE.MeshStandardMaterial({
    color: 0xb48c64,
    roughness: 0.52,
    metalness: 0.06,
  });
  const counterTrimMat = new THREE.MeshStandardMaterial({
    color: 0x2e405e,
    emissive: 0x2a4a73,
    emissiveIntensity: 0.16,
    roughness: 0.38,
    metalness: 0.28,
  });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xdcf4ff,
    transparent: true,
    opacity: 0.25,
    roughness: 0.08,
    metalness: 0.08,
  });

  const counterMain = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.0, 0.72), counterWoodMat);
  counterMain.position.set(-3.6, 0.5, 4.78);
  group.add(counterMain);

  const counterWing = new THREE.Mesh(new THREE.BoxGeometry(0.68, 1.0, 1.5), counterWoodMat);
  counterWing.position.set(-4.46, 0.5, 4.06);
  group.add(counterWing);

  const topMain = new THREE.Mesh(new THREE.BoxGeometry(2.44, 0.08, 0.76), counterTopMat);
  topMain.position.set(-3.6, 1.04, 4.78);
  group.add(topMain);

  const topWing = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.08, 1.54), counterTopMat);
  topWing.position.set(-4.46, 1.04, 4.06);
  group.add(topWing);

  const accentStrip = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.03, 0.02), counterTrimMat);
  accentStrip.position.set(-3.6, 0.82, 5.15);
  group.add(accentStrip);

  const registerMat = new THREE.MeshStandardMaterial({
    color: 0x1a1f2a,
    roughness: 0.34,
    metalness: 0.56,
  });
  const registerBody = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.24, 0.3), registerMat);
  registerBody.position.set(-3.2, 1.2, 4.67);
  group.add(registerBody);

  const registerScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.2, 0.1),
    new THREE.MeshStandardMaterial({
      color: 0x7be4ff,
      emissive: 0x59d5ff,
      emissiveIntensity: 0.42,
      roughness: 0.28,
    }),
  );
  registerScreen.position.set(-3.2, 1.25, 4.83);
  group.add(registerScreen);

  const bell = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 14, 10),
    new THREE.MeshStandardMaterial({ color: 0xd4b26a, roughness: 0.26, metalness: 0.72 }),
  );
  bell.position.set(-3.8, 1.1, 4.86);
  bell.scale.set(1, 0.55, 1);
  group.add(bell);

  const glassPane = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.26, 0.02), glassMat);
  glassPane.position.set(-3.95, 1.2, 5.12);
  group.add(glassPane);

  const noren = new THREE.Mesh(
    new THREE.PlaneGeometry(1.7, 0.3),
    new THREE.MeshStandardMaterial({
      color: 0x2c3d5d,
      emissive: 0x2b4d75,
      emissiveIntensity: 0.18,
      roughness: 0.74,
      side: THREE.DoubleSide,
    }),
  );
  noren.position.set(-3.95, 1.62, 5.08);
  group.add(noren);

  colliders.push({ name: 'counter-main', x: -3.6, z: 4.78, halfW: 1.2, halfD: 0.36 });
  colliders.push({ name: 'counter-wing', x: -4.46, z: 4.06, halfW: 0.34, halfD: 0.75 });

  // ————————————————————————————————
  // Storage crate (back-right, for restock tasks)
  // ————————————————————————————————
  const storageCrate = buildStorageCrate();
  group.add(storageCrate.group);
  storageCrate.spillCapsules.forEach((spill) => group.add(spill));
  interactables.push(storageCrate.interactable);
  colliders.push(storageCrate.collider);

  // Dedicated token refill crate near token terminal
  const tokenCrate = buildTokenCrate();
  group.add(tokenCrate.group);
  interactables.push(tokenCrate.interactable);
  colliders.push(tokenCrate.collider);

  // ————————————————————————————————
  // Token purchase station (near entrance)
  // ————————————————————————————————
  const tokenStation = buildTokenStation();
  group.add(tokenStation.group);
  interactables.push(tokenStation.interactable);
  colliders.push(tokenStation.collider);

  // ————————————————————————————————
  // Exit door (front wall)
  // ————————————————————————————————
  const exitGroup = new THREE.Group();
  exitGroup.name = 'shop-exit';
  tagInteractable(exitGroup, {
    type: 'shop-exit',
    prompt: 'End Shift',
  });

  const exitFrame = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 2.3, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x2a2218, roughness: 0.8 }),
  );
  exitFrame.position.set(0, 1.15, 0);
  exitGroup.add(exitFrame);

  const exitSign = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.06, 0.01),
    new THREE.MeshStandardMaterial({
      color: 0xff4444,
      emissive: 0xff2222,
      emissiveIntensity: 0.5,
    }),
  );
  exitSign.position.set(0, 2.45, 0);
  exitGroup.add(exitSign);

  exitGroup.position.set(0, 0, HALF_D - 0.06);
  exitGroup.rotation.y = Math.PI;
  group.add(exitGroup);
  interactables.push(exitGroup);

  // ————————————————————————————————
  // Lighting
  // ————————————————————————————————

  // Ambient
  const ambient = new THREE.AmbientLight(0xffffff, 0.62);
  group.add(ambient);

  // Ceiling strip lights (fluorescent feel)
  for (let i = 0; i < 4; i++) {
    const stripLight = new THREE.RectAreaLight(
      0xf5fbff,
      56,
      2.6,
      0.18,
    );
    stripLight.position.set(-4.6 + i * 2.95, 3.88, -1.0);
    stripLight.lookAt(-4.6 + i * 2.95, 0, -1.0);
    group.add(stripLight);
  }

  // Back row lights (~1500 Lumens each)
  for (let i = 0; i < 3; i++) {
    const light = new THREE.PointLight(0xe6eaff, 1.0, 0, 2);
    light.power = 1450;
    light.position.set(-3 + i * 2.8, 3.45, -3.35);
    group.add(light);
  }

  // Front row lights (warmer, ~1500 Lumens each)
  for (let i = 0; i < 3; i++) {
    const light = new THREE.PointLight(0xfff0dd, 1.0, 0, 2);
    light.power = 1400;
    light.position.set(-3 + i * 2.8, 3.45, 0.55);
    group.add(light);
  }

  // Emergency / accent lighting near exit (~800 Lumens)
  const exitLight = new THREE.PointLight(0xff5555, 1.0, 0, 2);
  exitLight.power = 800;
  exitLight.position.set(0, 2.8, HALF_D - 0.5);
  group.add(exitLight);

  // ————————————————————————————————
  // Ambient Decorations
  // ————————————————————————————————

  // Neon "GASHAPON" sign (back wall)
  const neonMat = new THREE.MeshStandardMaterial({
    color: 0x66d6ff,
    emissive: 0x4fcfff,
    emissiveIntensity: 0.65,
  });
  const neonSign = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.18, 0.02),
    neonMat,
  );
  neonSign.position.set(-1.2, 3.18, -HALF_D + 0.02);
  group.add(neonSign);

  // Neon glow light
  const neonGlow = new THREE.PointLight(0x58d2ff, 0.34, 3.4, 2);
  neonGlow.position.set(-1.2, 3.2, -HALF_D + 0.3);
  group.add(neonGlow);

  const makeHangingSign = (
    label: string,
    x: number,
    z: number,
    accentHex: number,
  ) => {
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 160;
    const signCtx = signCanvas.getContext('2d');

    if (signCtx) {
      signCtx.fillStyle = '#10151f';
      signCtx.fillRect(0, 0, 512, 160);
      signCtx.fillStyle = '#e5eef7';
      signCtx.fillRect(8, 8, 496, 144);
      signCtx.fillStyle = '#1b2738';
      signCtx.font = 'bold 44px sans-serif';
      signCtx.textAlign = 'center';
      signCtx.fillText(label, 256, 98);
    }

    const signTex = new THREE.CanvasTexture(signCanvas);
    signTex.colorSpace = THREE.SRGBColorSpace;

    const signMat = new THREE.MeshStandardMaterial({
      map: signTex,
      roughness: 0.55,
      metalness: 0.06,
      emissive: new THREE.Color(accentHex),
      emissiveIntensity: 0.18,
    });

    const signPanel = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.46), signMat);
    signPanel.position.set(x, 2.75, z);
    signPanel.rotation.x = -0.08;
    group.add(signPanel);

    const mount = new THREE.Mesh(
      new THREE.BoxGeometry(1.54, 0.02, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x3c4556, roughness: 0.75 }),
    );
    mount.position.set(x, 2.98, z);
    group.add(mount);
  };

  makeHangingSign('FIGURES', -3.6, -2.95, 0x68d8ff);
  makeHangingSign('ANIME', -1.2, -2.95, 0xff8bd8);
  makeHangingSign('RETRO', 1.2, -2.95, 0xffc078);
  makeHangingSign('SPECIAL', 3.6, -2.95, 0x9fe39a);

  // Promotional side panels
  const panelColors = [0x7c6ef0, 0xff8ba7, 0x72e3c4, 0x8fb9ff];
  for (let i = 0; i < 4; i++) {
    const panelMat = new THREE.MeshStandardMaterial({
      color: panelColors[i]!,
      emissive: panelColors[i]!,
      emissiveIntensity: 0.12,
      roughness: 0.88,
    });
    const panel = new THREE.Mesh(
      new THREE.PlaneGeometry(0.44, 0.78),
      panelMat,
    );
    panel.position.set(-HALF_W + 0.02, 2.15, -3.4 + i * 2.1);
    panel.rotation.y = Math.PI / 2;
    group.add(panel);
  }

  // Notice board (right wall)
  const boardMat = new THREE.MeshStandardMaterial({
    color: 0x3d2b1f,
    roughness: 0.9,
  });
  const noticeBoard = new THREE.Mesh(
    new THREE.BoxGeometry(0.03, 0.8, 1.2),
    boardMat,
  );
  noticeBoard.position.set(HALF_W - 0.02, 2.0, 0);
  group.add(noticeBoard);

  // Pinned notes on board
  const noteColors = [0xffee88, 0x88eeff, 0xff88cc, 0x88ff88];
  for (let i = 0; i < 4; i++) {
    const noteMat = new THREE.MeshStandardMaterial({
      color: noteColors[i]!,
      roughness: 0.95,
    });
    const note = new THREE.Mesh(
      new THREE.PlaneGeometry(0.15, 0.12),
      noteMat,
    );
    note.position.set(
      HALF_W - 0.03,
      1.85 + (i % 2) * 0.3,
      -0.3 + (i % 3) * 0.3,
    );
    note.rotation.y = -Math.PI / 2;
    group.add(note);
  }

  // Floor vending machine (soda machine near token station)
  const vendBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 1.6, 0.45),
    new THREE.MeshStandardMaterial({ color: 0x204080, roughness: 0.5, metalness: 0.3 }),
  );
  vendBody.position.set(6.0, 0.8, 1.35);
  group.add(vendBody);
  colliders.push({ name: 'vending-machine', x: 6.0, z: 1.35, halfW: 0.25, halfD: 0.225 });

  const vendScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.35, 0.5),
    new THREE.MeshStandardMaterial({
      color: 0x111122,
      emissive: 0x3366ff,
      emissiveIntensity: 0.15,
    }),
  );
  vendScreen.position.set(6.0, 1.0, 1.576);
  group.add(vendScreen);

  // Queue rails near the token station to mimic staffed service corner flow.
  const railMat = new THREE.MeshStandardMaterial({ color: 0x404656, roughness: 0.6, metalness: 0.55 });
  const ropeMat = new THREE.MeshStandardMaterial({ color: 0x8aa8d0, roughness: 0.75, metalness: 0.1 });

  const railPosts: Array<[number, number]> = [
    [4.8, 2.9], [4.8, 4.25], [6.05, 2.9], [6.05, 4.25],
  ];
  railPosts.forEach(([x, z]) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 12), railMat);
    post.position.set(x, 0.45, z);
    group.add(post);
  });

  const ropeA = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.02, 0.02), ropeMat);
  ropeA.position.set(5.43, 0.75, 2.9);
  group.add(ropeA);
  const ropeB = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.02, 0.02), ropeMat);
  ropeB.position.set(5.43, 0.75, 4.25);
  group.add(ropeB);

  // ————————————————————————————————
  // Secret Interactables
  // ————————————————————————————————
  const secrets = buildShopSecrets();
  secrets.groups.forEach((secret) => group.add(secret));
  interactables.push(...secrets.interactables);

  return { group, machineGroups, interactables, colliders };
}
