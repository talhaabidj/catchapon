/**
 * Bedroom — World builder for the bedroom hub.
 *
 * Assembles room geometry, places all props, and sets up lighting.
 * Returns a THREE.Group that BedroomScene adds to its scene.
 *
 * Room dimensions: 5m × 3m (height) × 4m (depth).
 * Origin is at floor center.
 */

import * as THREE from 'three';
import { createBed } from './props/Bed.js';
import { createDesk } from './props/Desk.js';
import { createChair } from './props/Chair.js';
import { createPCSetup } from './props/PCSetup.js';
import { createDoor } from './props/Door.js';
import { createLadderShelf } from './props/LadderShelf.js';
import { createWindow } from './props/Window.js';
import { createACUnit } from './props/ACUnit.js';
import { createPoster } from './props/Poster.js';
import { createCollectionWall } from './props/CollectionWall.js';
import { createCupboard } from './props/Cupboard.js';
import { addBedroomLighting } from './bedroom/BedroomLighting.js';

export interface BedroomCollider {
  name: string;
  x: number;
  z: number;
  halfW: number;
  halfD: number;
}

export interface BedroomLayout {
  group: THREE.Group;
  interactables: THREE.Object3D[];
  lights: THREE.Light[];
  colliders: BedroomCollider[];
}

const ROOM_WIDTH = 5;
const ROOM_HEIGHT = 3;
const ROOM_DEPTH = 4;

const HALF_W = ROOM_WIDTH / 2;
const HALF_D = ROOM_DEPTH / 2;

export function buildBedroom(): BedroomLayout {
  const group = new THREE.Group();
  group.name = 'bedroom';

  const interactables: THREE.Object3D[] = [];
  const colliders: BedroomCollider[] = [];

  const wallClearance = 0.05;

  // ————————————————————————————————
  // Room shell
  // ————————————————————————————————

  // Floor — warm dark wood
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x2a2218,
    roughness: 0.72,
    metalness: 0.08,
  });
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_DEPTH),
    floorMat,
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  group.add(floor);

  // Ceiling
  const ceilingMat = new THREE.MeshStandardMaterial({
    color: 0x16141f,
    roughness: 0.88,
  });
  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_DEPTH),
    ceilingMat,
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = ROOM_HEIGHT;
  group.add(ceiling);

  // Walls
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x1c1a28,
    roughness: 0.82,
  });

  // Back wall (Z = -HALF_D) — contains window
  const backWall = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_HEIGHT),
    wallMat,
  );
  backWall.position.set(0, ROOM_HEIGHT / 2, -HALF_D);
  backWall.receiveShadow = true;
  group.add(backWall);

  // Front wall (Z = +HALF_D) — contains door
  const frontWall = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_HEIGHT),
    wallMat,
  );
  frontWall.position.set(0, ROOM_HEIGHT / 2, HALF_D);
  frontWall.rotation.y = Math.PI;
  frontWall.receiveShadow = true;
  group.add(frontWall);

  // Left wall (X = -HALF_W) — contains collection wall
  const leftWall = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM_DEPTH, ROOM_HEIGHT),
    wallMat,
  );
  leftWall.position.set(-HALF_W, ROOM_HEIGHT / 2, 0);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.receiveShadow = true;
  group.add(leftWall);

  // Right wall (X = +HALF_W)
  const rightWall = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM_DEPTH, ROOM_HEIGHT),
    wallMat,
  );
  rightWall.position.set(HALF_W, ROOM_HEIGHT / 2, 0);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.receiveShadow = true;
  group.add(rightWall);

  // —— Baseboard trim ——
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0x12101a,
    roughness: 0.85,
  });
  const trimGeo = new THREE.BoxGeometry(ROOM_WIDTH, 0.08, 0.02);

  const trimBack = new THREE.Mesh(trimGeo, trimMat);
  trimBack.position.set(0, 0.04, -HALF_D + 0.01);
  group.add(trimBack);

  const trimFront = new THREE.Mesh(trimGeo, trimMat);
  trimFront.position.set(0, 0.04, HALF_D - 0.01);
  group.add(trimFront);

  const trimGeoSide = new THREE.BoxGeometry(0.02, 0.08, ROOM_DEPTH);
  const trimLeft = new THREE.Mesh(trimGeoSide, trimMat);
  trimLeft.position.set(-HALF_W + 0.01, 0.04, 0);
  group.add(trimLeft);

  const trimRight = new THREE.Mesh(trimGeoSide, trimMat);
  trimRight.position.set(HALF_W - 0.01, 0.04, 0);
  group.add(trimRight);

  // ————————————————————————————————
  // Props placement
  // ————————————————————————————————

  // Bed — back-left corner (flush to wall trims)
  const bed = createBed();
  const bedPosX = -HALF_W + 0.7 + wallClearance;
  const bedPosZ = -HALF_D + 1.0 + wallClearance;
  bed.position.set(bedPosX, 0, bedPosZ);
  group.add(bed);
  colliders.push({
    name: 'bed',
    x: bedPosX,
    z: bedPosZ,
    halfW: 0.72,
    halfD: 1.02,
  });

  // Desk cluster — hard corner setup on back-right wall.
  const desk = createDesk();
  const deskPosX = HALF_W - 0.35 - wallClearance;
  const deskPosZ = -HALF_D + 0.8 + wallClearance;
  const deskYaw = -Math.PI / 2;

  desk.position.set(deskPosX, 0, deskPosZ);
  desk.rotation.y = deskYaw;
  group.add(desk);
  colliders.push({
    name: 'desk',
    x: deskPosX,
    z: deskPosZ,
    halfW: 0.39,
    halfD: 0.84,
  });

  const rotateLocalOffset = (localX: number, localZ: number) => {
    const cos = Math.cos(deskYaw);
    const sin = Math.sin(deskYaw);
    return {
      x: localX * cos + localZ * sin,
      z: -localX * sin + localZ * cos,
    };
  };

  // PC on desk — positioned in desk local space so it moves with layout changes.
  const pc = createPCSetup();
  const pcOffset = rotateLocalOffset(-0.04, -0.16);
  pc.position.set(deskPosX + pcOffset.x, 0.78, deskPosZ + pcOffset.z);
  pc.rotation.y = deskYaw;
  group.add(pc);
  interactables.push(pc);

  // Chair — centered in front of monitor
  const chair = createChair();
  const chairOffset = rotateLocalOffset(0.0, 0.62);
  chair.position.set(deskPosX + chairOffset.x, -0.008, deskPosZ + chairOffset.z);
  chair.rotation.y = deskYaw + Math.PI + 0.2;
  group.add(chair);
  colliders.push({
    name: 'chair',
    x: deskPosX + chairOffset.x,
    z: deskPosZ + chairOffset.z,
    halfW: 0.34,
    halfD: 0.34,
  });

  // Door — front wall, center-right
  const door = createDoor();
  door.position.set(0.5, 0, HALF_D - 0.06);
  door.rotation.y = Math.PI;
  group.add(door);
  interactables.push(door);

  // Collection wall — right wall (moved to former hanging/poster zone)
  const collectionWall = createCollectionWall();
  collectionWall.position.set(HALF_W - 0.04, 1.34, 0.85);
  collectionWall.rotation.y = -Math.PI / 2;
  group.add(collectionWall);
  interactables.push(collectionWall);

  // Ladder shelf — back wall, flush
  const ladderShelf = createLadderShelf();
  ladderShelf.position.set(-0.32, 0, -1.66);
  group.add(ladderShelf);
  colliders.push({
    name: 'ladder-shelf',
    x: -0.32,
    z: -1.66,
    halfW: 0.44,
    halfD: 0.18,
  });

  // Window — detailed corner window at back-right corner
  const win = createWindow();
  win.position.set(HALF_W - 0.02, 1.66, -HALF_D + 0.02);
  group.add(win);

  // AC unit — right wall, high
  const ac = createACUnit();
  ac.position.set(HALF_W - 0.12, 2.4, -0.74);
  ac.rotation.y = -Math.PI / 2;
  group.add(ac);

  // Cupboard — front-left corner, flush to wall trims
  const cupboard = createCupboard();
  const cupboardPosX = -HALF_W + 0.5 + wallClearance;
  const cupboardPosZ = HALF_D - 0.25 - wallClearance;
  cupboard.position.set(cupboardPosX, 0, cupboardPosZ);
  cupboard.rotation.y = Math.PI;
  group.add(cupboard);
  colliders.push({
    name: 'cupboard',
    x: cupboardPosX,
    z: cupboardPosZ,
    halfW: 0.5,
    halfD: 0.27,
  });

  // Posters / wall hangings — moved to former collection wall area on left wall
  const poster1 = createPoster(0);
  poster1.position.set(-HALF_W + 0.02, 1.7, -0.33);
  poster1.rotation.y = Math.PI / 2;
  group.add(poster1);

  const poster2 = createPoster(1);
  poster2.position.set(-HALF_W + 0.02, 1.7, 0.17);
  poster2.rotation.y = Math.PI / 2;
  group.add(poster2);

  const { lights } = addBedroomLighting({
    group,
    roomHeight: ROOM_HEIGHT,
    propsForShadows: [
      bed,
      desk,
      pc,
      chair,
      door,
      collectionWall,
      ladderShelf,
      win,
      ac,
      cupboard,
      poster1,
      poster2,
    ],
  });

  return { group, interactables, lights, colliders };
}
