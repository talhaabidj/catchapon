import * as THREE from 'three';

export interface CapsuleData {
  pos: THREE.Vector3;
  rot: THREE.Euler;
  vel: THREE.Vector3;
  settled: boolean;
}

export interface CapsuleVisualState {
  mesh: THREE.InstancedMesh;
  data: CapsuleData[];
  matrixDummy: THREE.Object3D;
}

export const FULL_STOCK_CAPSULE_COUNT = 45;
export const LOW_STOCK_CAPSULE_COUNT = 14;

/** Velocity threshold below which a capsule on the floor is considered settled. */
const SETTLE_THRESHOLD_SQ = 0.0005;

function createCapsuleVisualState(
  spawnFromTop: boolean,
  count = FULL_STOCK_CAPSULE_COUNT,
  rng: () => number = Math.random,
): CapsuleVisualState {
  const capsuleGeo = new THREE.SphereGeometry(0.045, 8, 8);
  const capsuleMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.2,
    metalness: 0.1,
  });
  const mesh = new THREE.InstancedMesh(capsuleGeo, capsuleMat, count);

  const data: CapsuleData[] = [];
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();

  let i = 0;
  if (spawnFromTop) {
    for (; i < count; i += 1) {
      const pos = new THREE.Vector3(
        (rng() - 0.5) * 0.56,
        1.58 + rng() * 0.24,
        (rng() - 0.5) * 0.48,
      );
      const rot = new THREE.Euler(
        rng() * Math.PI,
        rng() * Math.PI,
        rng() * Math.PI,
      );
      const vel = new THREE.Vector3(
        (rng() - 0.5) * 0.22,
        -(0.2 + rng() * 0.35),
        (rng() - 0.5) * 0.22,
      );

      data.push({ pos, rot, vel, settled: false });

      dummy.position.copy(pos);
      dummy.rotation.copy(rot);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      color.setHSL(rng(), 0.75, 0.52);
      mesh.setColorAt(i, color);
    }
  } else {
    // Initial stocked machines start with a dense pile in the chamber.
    for (let yLevel = 0; yLevel < 3; yLevel += 1) {
      for (let xLevel = 0; xLevel < 5; xLevel += 1) {
        for (let zLevel = 0; zLevel < 3; zLevel += 1) {
          if (i >= count) break;

          const pos = new THREE.Vector3(
            -0.3 + (xLevel * 0.15) + (rng() * 0.05 - 0.025),
            1.4 + (yLevel * 0.11) + (rng() * 0.04),
            -0.2 + (zLevel * 0.2) + (rng() * 0.05 - 0.025),
          );
          const rot = new THREE.Euler(
            rng() * Math.PI,
            rng() * Math.PI,
            rng() * Math.PI,
          );
          const vel = new THREE.Vector3(
            (rng() - 0.5) * 0.2,
            0,
            (rng() - 0.5) * 0.2,
          );

          data.push({ pos, rot, vel, settled: false });

          dummy.position.copy(pos);
          dummy.rotation.copy(rot);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);

          color.setHSL(rng(), 0.8, 0.5);
          mesh.setColorAt(i, color);
          i += 1;
        }
      }
    }
  }

  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

  return { mesh, data, matrixDummy: new THREE.Object3D() };
}

function disposeInstancedMesh(mesh: THREE.InstancedMesh) {
  mesh.geometry.dispose();
  if (Array.isArray(mesh.material)) {
    mesh.material.forEach((material) => material.dispose());
  } else {
    mesh.material.dispose();
  }
}

export function setMachineCapsules(
  machine: THREE.Group,
  spawnFromTop: boolean,
  count = FULL_STOCK_CAPSULE_COUNT,
  rng: () => number = Math.random,
) {
  const current = machine.userData['capsules'] as CapsuleVisualState | undefined;
  if (current) {
    machine.remove(current.mesh);
    disposeInstancedMesh(current.mesh);
  }

  const next = createCapsuleVisualState(spawnFromTop, count, rng);
  machine.userData['capsules'] = next;
  machine.add(next.mesh);
}

export function restockMachineCapsules(machine: THREE.Group) {
  // Spawn near chamber top so refill is visible as a falling animation.
  setMachineCapsules(machine, true, FULL_STOCK_CAPSULE_COUNT);
}

export function animateMachineCapsules(
  machine: THREE.Group,
  time: number,
): number {
  let dt = time - (machine.userData['lastTime'] || time);
  machine.userData['lastTime'] = time;
  if (dt > 0.1) dt = 0.1; // Clamp to prevent clipping on huge spikes.

  const capsules = machine.userData['capsules'] as CapsuleVisualState | undefined;
  if (dt <= 0 || !capsules) {
    return dt;
  }

  const { mesh, data, matrixDummy: dummy } = capsules;
  let needsMatrixUpdate = false;

  for (let i = 0; i < data.length; i += 1) {
    const capsule = data[i]!;

    // Skip settled capsules entirely — big perf win for 45×N machines.
    if (capsule.settled) continue;

    // Gravity.
    capsule.vel.y -= 1.8 * dt;

    capsule.pos.addScaledVector(capsule.vel, dt);

    // Floor collision (floor is ~1.06 + radius = 1.105).
    if (capsule.pos.y < 1.105) {
      capsule.pos.y = 1.105;
      capsule.vel.y *= -0.4;
      capsule.vel.x *= 0.9;
      capsule.vel.z *= 0.9;
    }

    // Wall collisions.
    if (capsule.pos.x < -0.37) { capsule.pos.x = -0.37; capsule.vel.x *= -0.6; }
    if (capsule.pos.x > 0.37) { capsule.pos.x = 0.37; capsule.vel.x *= -0.6; }
    if (capsule.pos.z < -0.32) { capsule.pos.z = -0.32; capsule.vel.z *= -0.6; }
    if (capsule.pos.z > 0.32) { capsule.pos.z = 0.32; capsule.vel.z *= -0.6; }

    // Check if capsule has settled (on the floor and barely moving).
    if (capsule.pos.y <= 1.106 && capsule.vel.lengthSq() < SETTLE_THRESHOLD_SQ) {
      capsule.settled = true;
      capsule.vel.set(0, 0, 0);
      // Do one final matrix update to lock its resting position.
      dummy.position.copy(capsule.pos);
      dummy.rotation.copy(capsule.rot);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      needsMatrixUpdate = true;
      continue;
    }

    // Update matrix only when movement is meaningful.
    if (capsule.vel.lengthSq() > 0.001) {
      capsule.rot.x += capsule.vel.z * dt * 5;
      capsule.rot.z -= capsule.vel.x * dt * 5;
      capsule.rot.y += capsule.vel.x * dt * 2;

      dummy.position.copy(capsule.pos);
      dummy.rotation.copy(capsule.rot);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      needsMatrixUpdate = true;
    }
  }

  if (needsMatrixUpdate) {
    mesh.instanceMatrix.needsUpdate = true;
  }

  return dt;
}
