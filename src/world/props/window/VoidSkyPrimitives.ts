import * as THREE from 'three';

export const STAR_LAYOUT_NEAR: ReadonlyArray<[number, number, number]> = [
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

export const STAR_LAYOUT_FAR: ReadonlyArray<[number, number, number]> = [
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

export function addBackStarLayer(
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

export function addSideStarLayer(
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

export function addBackStarScatter(
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
  let randomState = seed >>> 0;
  const rand = () => {
    randomState = (1664525 * randomState + 1013904223) >>> 0;
    return randomState / 4294967295;
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

export function addSideStarScatter(
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
  let randomState = seed >>> 0;
  const rand = () => {
    randomState = (1664525 * randomState + 1013904223) >>> 0;
    return randomState / 4294967295;
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

export function addNebulaDisk(
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
