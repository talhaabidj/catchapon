import * as THREE from 'three';
import type { ActiveTask } from '../../data/types.js';
import { TASK_TEMPLATES } from '../../data/tasks.js';
import { INTERACTION_KEYS, tagInteractable } from '../../core/InteractionTags.js';
import type { ShopCollider } from '../../world/ShopFloor.js';

interface MudSpotState {
  mesh: THREE.Mesh;
  variantIndex: number;
  hitsRequired: number;
  hitsDone: number;
  rewardRemaining: number;
  timeRemaining: number;
}

export interface MudMopResult {
  isCompleted: boolean;
  hitsDone: number;
  hitsRequired: number;
  rewardGained: number;
  timeCost: number;
}

const ATLAS_COLUMNS = 3;
const ATLAS_ROWS = 2;
const MUD_FLOOR_Y = 0.0012;
const SHOP_HALF_WIDTH = 7;
const SHOP_HALF_DEPTH = 6;
const WALL_CLEARANCE = 0.55;

const AISLE_ZONES: Array<{ xMin: number; xMax: number; zMin: number; zMax: number }> = [
  { xMin: -4.5, xMax: 4.5, zMin: -0.5, zMax: 3.8 },
  { xMin: -6.0, xMax: -4.6, zMin: -3.8, zMax: 3.8 },
  { xMin: 4.6, xMax: 6.0, zMin: -3.8, zMax: 3.2 },
  { xMin: -2.3, xMax: 2.7, zMin: -5.0, zMax: -3.1 },
];

export class MudSplashTaskSystem {
  private mudAtlasTexture: THREE.Texture | null = null;
  private atlasReady = false;
  private readonly mudSpots = new Map<string, MudSpotState>();

  constructor(
    private readonly scene3d: THREE.Scene,
    private readonly colliders: readonly ShopCollider[],
    private readonly rng: () => number = Math.random,
  ) {
    new THREE.TextureLoader().load(
      '/textures/mudsplashes.png',
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        this.mudAtlasTexture = texture;
        this.atlasReady = true;
        this.refreshSplashMaps();
      },
    );
  }

  spawn(tasks: readonly ActiveTask[], interactables: THREE.Object3D[]) {
    const floorTasks = tasks.filter((task) => {
      const template = TASK_TEMPLATES.find((t) => t.id === task.templateId);
      return template?.targetType === 'floor';
    });

    floorTasks.forEach((task, idx) => {
      const pos = this.findValidMudSpot(idx);
      const variant = Math.floor(this.rng() * (ATLAS_COLUMNS * ATLAS_ROWS));
      const splash = this.createSingleLayerMudSplash(variant);

      splash.name = task.targetId;
      tagInteractable(splash, {
        type: 'floor-spot',
        prompt: 'Scrub mud splash',
        targetId: task.targetId,
      });

      splash.position.set(pos.x, MUD_FLOOR_Y, pos.z);
      splash.rotation.y = this.rng() * Math.PI * 2;

      this.scene3d.add(splash);
      interactables.push(splash);

      this.mudSpots.set(task.targetId, {
        mesh: splash,
        variantIndex: variant,
        hitsRequired: 3 + Math.floor(this.rng() * 4), // 3-6 random scrubs
        hitsDone: 0,
        rewardRemaining: -1,
        timeRemaining: -1,
      });
    });
  }

  mop(targetId: string, baseReward: number, baseTime: number): MudMopResult | null {
    const spot = this.mudSpots.get(targetId);
    if (!spot) return null;

    if (spot.rewardRemaining < 0) {
      spot.rewardRemaining = Math.max(1, Math.floor(baseReward));
    }
    if (spot.timeRemaining < 0) {
      spot.timeRemaining = Math.max(1, Math.floor(baseTime));
    }

    spot.hitsDone += 1;
    const hitsLeft = Math.max(0, spot.hitsRequired - spot.hitsDone);

    const rewardGained = hitsLeft === 0
      ? spot.rewardRemaining
      : Math.max(1, Math.floor(spot.rewardRemaining / (hitsLeft + 1)));
    spot.rewardRemaining = Math.max(0, spot.rewardRemaining - rewardGained);

    const timeCost = hitsLeft === 0
      ? spot.timeRemaining
      : Math.max(1, Math.floor(spot.timeRemaining / (hitsLeft + 1)));
    spot.timeRemaining = Math.max(0, spot.timeRemaining - timeCost);

    const material = spot.mesh.material as THREE.MeshStandardMaterial;
    const progress = spot.hitsDone / spot.hitsRequired;

    // Fade and shrink footprint each scrub to imply the mud is being lifted.
    material.opacity = Math.max(0.05, 0.88 - (progress * 0.8) + ((this.rng() - 0.5) * 0.03));
    const footprintScale = Math.max(0.62, 1 - (progress * (0.26 + this.rng() * 0.08)));
    spot.mesh.scale.set(footprintScale, footprintScale, 1);

    if (hitsLeft === 0) {
      spot.mesh.visible = false;
      spot.mesh.userData[INTERACTION_KEYS.interactable] = false;
      this.mudSpots.delete(targetId);
    }

    return {
      isCompleted: hitsLeft === 0,
      hitsDone: spot.hitsDone,
      hitsRequired: spot.hitsRequired,
      rewardGained,
      timeCost,
    };
  }

  dispose() {
    this.mudSpots.forEach((spot) => {
      const material = spot.mesh.material as THREE.MeshStandardMaterial;
      material.map?.dispose();
      material.dispose();
      spot.mesh.geometry.dispose();
    });
    this.mudSpots.clear();
    this.mudAtlasTexture?.dispose();
    this.mudAtlasTexture = null;
    this.atlasReady = false;
  }

  private createSingleLayerMudSplash(variantIndex: number): THREE.Mesh {
    const map = this.createAtlasVariantTexture(variantIndex) ?? this.createFallbackTexture(variantIndex);

    const material = new THREE.MeshStandardMaterial({
      map,
      bumpMap: map,
      bumpScale: 0.018,
      color: 0xffffff,
      roughness: 0.84,
      metalness: 0.01,
      transparent: true,
      opacity: 0.88,
      alphaTest: 0.08,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -2,
    });

    const size = 1.02 + this.rng() * 0.44;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), material);
    mesh.rotation.x = -Math.PI / 2;
    return mesh;
  }

  private createAtlasVariantTexture(variantIndex: number): THREE.CanvasTexture | null {
    if (!this.atlasReady || !this.mudAtlasTexture) return null;

    const sourceImage = this.mudAtlasTexture.image as
      | HTMLImageElement
      | HTMLCanvasElement
      | ImageBitmap
      | undefined;

    if (!sourceImage || !sourceImage.width || !sourceImage.height) return null;

    const srcW = sourceImage.width / ATLAS_COLUMNS;
    const srcH = sourceImage.height / ATLAS_ROWS;

    const col = variantIndex % ATLAS_COLUMNS;
    const row = Math.floor(variantIndex / ATLAS_COLUMNS);

    const outSize = 256;
    const canvas = document.createElement('canvas');
    canvas.width = outSize;
    canvas.height = outSize;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, outSize, outSize);
    ctx.drawImage(
      sourceImage,
      col * srcW,
      row * srcH,
      srcW,
      srcH,
      0,
      0,
      outSize,
      outSize,
    );

    const imageData = ctx.getImageData(0, 0, outSize, outSize);
    const data = imageData.data;

    // Key out light background + anti-aliased fringes and remap to muddy brown palette.
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]!;
      const g = data[i + 1]!;
      const b = data[i + 2]!;
      const a = data[i + 3]!;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const sat = max - min;
      const avg = (r + g + b) / 3;

      // Treat low-sat bright pixels as background, including anti-aliased outer fringe.
      const brightFactor = Math.min(1, Math.max(0, (avg - 182) / 60));
      const lowSatFactor = Math.min(1, Math.max(0, (44 - sat) / 44));
      const keyStrength = brightFactor * lowSatFactor;

      const alphaAfterKey = Math.floor(a * (1 - keyStrength));
      if (alphaAfterKey <= 8) {
        data[i + 3] = 0;
        continue;
      }

      const tone = Math.pow(avg / 255, 1.06);

      // Force splash palette into darker brown range (avoid orange paint look).
      data[i] = Math.floor(34 + (68 * tone));
      data[i + 1] = Math.floor(18 + (42 * tone));
      data[i + 2] = Math.floor(10 + (26 * tone));

      // Slight fringe softening where keying was strongest.
      const fringeFade = 1 - (keyStrength * 0.35);
      data[i + 3] = Math.floor(alphaAfterKey * fringeFade);
    }

    ctx.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }

  private refreshSplashMaps() {
    if (!this.atlasReady) return;

    this.mudSpots.forEach((spot) => {
      const atlasVariant = this.createAtlasVariantTexture(spot.variantIndex);
      if (!atlasVariant) return;

      const material = spot.mesh.material as THREE.MeshStandardMaterial;
      if (material.bumpMap && material.bumpMap !== material.map) {
        material.bumpMap.dispose();
      }
      material.map?.dispose();
      material.map = atlasVariant;
      material.bumpMap = atlasVariant;
      material.needsUpdate = true;
    });
  }

  private createFallbackTexture(variantIndex: number): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      const centerX = 128;
      const centerY = 128;
      const points = 10 + (variantIndex % 3) * 2;
      const radius = 62 + (variantIndex % 4) * 6;

      ctx.clearRect(0, 0, 256, 256);
      ctx.fillStyle = '#6e3f1b';

      ctx.beginPath();
      for (let i = 0; i < points; i += 1) {
        const angle = (i / points) * Math.PI * 2;
        const arm = (0.7 + this.rng() * 0.65) * radius;
        const x = centerX + (Math.cos(angle) * arm);
        const y = centerY + (Math.sin(angle) * arm);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#5a3215';
      ctx.beginPath();
      ctx.ellipse(centerX - 14, centerY + 8, 36, 24, -0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#8a5a2e';
      ctx.beginPath();
      ctx.ellipse(centerX + 16, centerY - 22, 18, 11, 0.1, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  private findValidMudSpot(seedOffset: number): { x: number; z: number } {
    const avoidRadius = 0.58;
    const existingMud = [...this.mudSpots.values()].map((entry) => ({
      x: entry.mesh.position.x,
      z: entry.mesh.position.z,
    }));

    let fallbackX = 0;
    let fallbackZ = 0;

    for (let attempt = 0; attempt < 120; attempt += 1) {
      const zone = AISLE_ZONES[(attempt + seedOffset) % AISLE_ZONES.length]!;
      const x = zone.xMin + this.rng() * (zone.xMax - zone.xMin);
      const z = zone.zMin + this.rng() * (zone.zMax - zone.zMin);

      fallbackX = x;
      fallbackZ = z;

      // Keep splashes off boundary walls so they sit naturally in walkable floor space.
      if (
        x <= -SHOP_HALF_WIDTH + WALL_CLEARANCE ||
        x >= SHOP_HALF_WIDTH - WALL_CLEARANCE ||
        z <= -SHOP_HALF_DEPTH + WALL_CLEARANCE ||
        z >= SHOP_HALF_DEPTH - WALL_CLEARANCE
      ) {
        continue;
      }

      let blocked = false;
      for (const c of this.colliders) {
        if (Math.abs(x - c.x) < c.halfW + avoidRadius && Math.abs(z - c.z) < c.halfD + avoidRadius) {
          blocked = true;
          break;
        }
      }
      if (blocked) continue;

      for (const mud of existingMud) {
        const dx = x - mud.x;
        const dz = z - mud.z;
        if ((dx * dx) + (dz * dz) < 0.8 * 0.8) {
          blocked = true;
          break;
        }
      }
      if (blocked) continue;

      return { x, z };
    }

    return { x: fallbackX, z: fallbackZ };
  }
}
