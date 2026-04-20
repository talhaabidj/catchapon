import * as THREE from 'three';

interface BedroomLightingInput {
  group: THREE.Group;
  roomHeight: number;
  propsForShadows: readonly THREE.Object3D[];
}

interface BedroomLightingResult {
  lights: THREE.Light[];
}

export function addBedroomLighting(input: BedroomLightingInput): BedroomLightingResult {
  const lights: THREE.Light[] = [];

  // Ambient base kept moderate so practical fixtures shape the room better.
  const ambient = new THREE.AmbientLight(0xf6edde, 0.3);
  input.group.add(ambient);
  lights.push(ambient);

  const hemi = new THREE.HemisphereLight(0xffead2, 0x1a1620, 0.17);
  input.group.add(hemi);
  lights.push(hemi);

  // Warm desk lamp (main light) ~400 Lumens.
  const deskLight = new THREE.PointLight(0xffd2a0, 1.0, 4.2, 2);
  deskLight.power = 300;
  deskLight.position.set(1.4, 1.6, -1.3);
  deskLight.castShadow = true;
  deskLight.shadow.mapSize.set(1024, 1024);
  deskLight.shadow.bias = -0.0006;
  input.group.add(deskLight);
  lights.push(deskLight);

  // Monitor glow kept subtle and neutral to avoid purple wall tint.
  const monitorGlow = new THREE.PointLight(0xffefe1, 1.0, 2.0, 2);
  monitorGlow.power = 10;
  monitorGlow.position.set(1.5, 1.1, -1.2);
  input.group.add(monitorGlow);
  lights.push(monitorGlow);

  // Suspended wooden ring light fixture inspired by the reference.
  const fixtureWoodMat = new THREE.MeshStandardMaterial({
    color: 0x7a5737,
    roughness: 0.62,
  });
  const fixtureMetalMat = new THREE.MeshStandardMaterial({
    color: 0xbcb5aa,
    roughness: 0.45,
    metalness: 0.4,
  });
  const fixtureLightMat = new THREE.MeshStandardMaterial({
    color: 0xfff1dc,
    emissive: 0xffe2b8,
    emissiveIntensity: 0.95,
    roughness: 0.08,
    metalness: 0.0,
  });

  const mountPlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.032, 0.24),
    fixtureWoodMat,
  );
  mountPlate.position.set(0, input.roomHeight - 0.02, 0);
  input.group.add(mountPlate);

  const mountCore = new THREE.Mesh(
    new THREE.BoxGeometry(0.48, 0.02, 0.14),
    fixtureMetalMat,
  );
  mountCore.position.set(0, input.roomHeight - 0.045, 0);
  input.group.add(mountCore);

  const ringY = input.roomHeight - 0.36;
  const outerW = 0.94;
  const outerD = 0.62;
  const railT = 0.045;
  const railH = 0.045;

  const ringTop = new THREE.Mesh(
    new THREE.BoxGeometry(outerW, railH, railT),
    fixtureWoodMat,
  );
  ringTop.position.set(0, ringY, -outerD / 2);
  input.group.add(ringTop);

  const ringBottom = new THREE.Mesh(
    new THREE.BoxGeometry(outerW, railH, railT),
    fixtureWoodMat,
  );
  ringBottom.position.set(0, ringY, outerD / 2);
  input.group.add(ringBottom);

  const ringLeft = new THREE.Mesh(
    new THREE.BoxGeometry(railT, railH, outerD - railT * 2),
    fixtureWoodMat,
  );
  ringLeft.position.set(-outerW / 2, ringY, 0);
  input.group.add(ringLeft);

  const ringRight = new THREE.Mesh(
    new THREE.BoxGeometry(railT, railH, outerD - railT * 2),
    fixtureWoodMat,
  );
  ringRight.position.set(outerW / 2, ringY, 0);
  input.group.add(ringRight);

  const ledTop = new THREE.Mesh(
    new THREE.BoxGeometry(outerW - 0.12, 0.008, 0.012),
    fixtureLightMat,
  );
  ledTop.position.set(0, ringY - railH / 2 + 0.002, -outerD / 2 + 0.03);
  input.group.add(ledTop);

  const ledBottom = new THREE.Mesh(
    new THREE.BoxGeometry(outerW - 0.12, 0.008, 0.012),
    fixtureLightMat,
  );
  ledBottom.position.set(0, ringY - railH / 2 + 0.002, outerD / 2 - 0.03);
  input.group.add(ledBottom);

  const ledLeft = new THREE.Mesh(
    new THREE.BoxGeometry(0.012, 0.008, outerD - 0.12),
    fixtureLightMat,
  );
  ledLeft.position.set(-outerW / 2 + 0.03, ringY - railH / 2 + 0.002, 0);
  input.group.add(ledLeft);

  const ledRight = new THREE.Mesh(
    new THREE.BoxGeometry(0.012, 0.008, outerD - 0.12),
    fixtureLightMat,
  );
  ledRight.position.set(outerW / 2 - 0.03, ringY - railH / 2 + 0.002, 0);
  input.group.add(ledRight);

  const addSuspensionWire = (startX: number, startZ: number, endX: number, endZ: number) => {
    const start = new THREE.Vector3(startX, input.roomHeight - 0.04, startZ);
    const end = new THREE.Vector3(endX, ringY + railH / 2, endZ);
    const dir = new THREE.Vector3().subVectors(end, start);
    const len = dir.length();

    const wire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0016, 0.0016, len, 6),
      fixtureMetalMat,
    );
    wire.position.copy(start).add(end).multiplyScalar(0.5);
    wire.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    input.group.add(wire);
  };

  addSuspensionWire(-0.2, -0.06, -outerW / 2 + 0.06, -outerD / 2 + 0.06);
  addSuspensionWire(0.2, -0.06, outerW / 2 - 0.06, -outerD / 2 + 0.06);
  addSuspensionWire(-0.2, 0.06, -outerW / 2 + 0.06, outerD / 2 - 0.06);
  addSuspensionWire(0.2, 0.06, outerW / 2 - 0.06, outerD / 2 - 0.06);

  // Warm realistic room light emitted from fixture center.
  const ceilingLight = new THREE.PointLight(0xffddb6, 1.0, 7.5, 2);
  ceilingLight.power = 980;
  ceilingLight.position.set(0, ringY - 0.08, 0);
  ceilingLight.castShadow = true;
  ceilingLight.shadow.mapSize.set(1024, 1024);
  ceilingLight.shadow.bias = -0.0005;
  input.group.add(ceilingLight);
  lights.push(ceilingLight);

  const ceilingFill = new THREE.PointLight(0xfff0d8, 1.0, 6, 2);
  ceilingFill.power = 210;
  ceilingFill.position.set(0, ringY + 0.02, 0);
  input.group.add(ceilingFill);
  lights.push(ceilingFill);

  // Improve contact and reflection cues by enabling shadow casting/receiving on major props.
  const enablePropShadows = (obj: THREE.Object3D) => {
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  };

  input.propsForShadows.forEach(enablePropShadows);

  return { lights };
}
