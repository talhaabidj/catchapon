import * as THREE from 'three';

export type ClothTextureOptions = {
  baseColor: number;
  repeatX?: number;
  repeatY?: number;
  threadSpacing?: number;
};

function clampByte(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function hexToRgb(hex: number): [number, number, number] {
  return [
    (hex >> 16) & 0xff,
    (hex >> 8) & 0xff,
    hex & 0xff,
  ];
}

export function createClothMaterialMaps(
  options: ClothTextureOptions,
): { colorMap: THREE.DataTexture; bumpMap: THREE.DataTexture } {
  const size = 64;
  const spacing = Math.max(4, options.threadSpacing ?? 6);
  const repeatX = options.repeatX ?? 4;
  const repeatY = options.repeatY ?? 4;

  const [baseR, baseG, baseB] = hexToRgb(options.baseColor);
  const colorData = new Uint8Array(size * size * 4);
  const bumpData = new Uint8Array(size * size * 4);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const idx = (y * size + x) * 4;
      const warpThread = x % spacing <= 1;
      const weftThread = y % spacing <= 1;
      const grain = ((x * 17 + y * 13 + x * y * 3) % 21) - 10;

      let r = baseR;
      let g = baseG;
      let b = baseB;

      if (warpThread) {
        r += 22;
        g += 19;
        b += 16;
      }
      if (weftThread) {
        r -= 13;
        g -= 11;
        b -= 8;
      }

      r += grain;
      g += grain;
      b += grain;

      colorData[idx] = clampByte(r);
      colorData[idx + 1] = clampByte(g);
      colorData[idx + 2] = clampByte(b);
      colorData[idx + 3] = 255;

      let height = 102;
      if (warpThread) height += 54;
      if (weftThread) height += 42;
      height += (x * 9 + y * 5) % 11;
      const h = clampByte(height);

      bumpData[idx] = h;
      bumpData[idx + 1] = h;
      bumpData[idx + 2] = h;
      bumpData[idx + 3] = 255;
    }
  }

  const colorMap = new THREE.DataTexture(colorData, size, size, THREE.RGBAFormat);
  colorMap.colorSpace = THREE.SRGBColorSpace;
  colorMap.wrapS = THREE.RepeatWrapping;
  colorMap.wrapT = THREE.RepeatWrapping;
  colorMap.repeat.set(repeatX, repeatY);
  colorMap.needsUpdate = true;

  const bumpMap = new THREE.DataTexture(bumpData, size, size, THREE.RGBAFormat);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(repeatX, repeatY);
  bumpMap.needsUpdate = true;

  return { colorMap, bumpMap };
}
