import * as THREE from 'three';
import { tagInteractable } from '../../core/InteractionTags.js';
import type { BuiltShopInteractable } from './types.js';

export type TokenStationStatus =
  | 'ready'
  | 'out_of_stock'
  | 'no_power'
  | 'jammed'
  | 'dirty';

export function buildTokenStation(): BuiltShopInteractable {
  const stationGroup = new THREE.Group();
  stationGroup.name = 'token-station';
  tagInteractable(stationGroup, {
    type: 'token-station',
    prompt: 'Buy Tokens',
  });

  const shellMat = new THREE.MeshStandardMaterial({
    color: 0xf1eff2,
    roughness: 0.56,
    metalness: 0.08,
  });
  const panelMat = new THREE.MeshStandardMaterial({
    color: 0x313744,
    roughness: 0.78,
    metalness: 0.22,
  });
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x8b8f99,
    roughness: 0.35,
    metalness: 0.7,
  });
  const trimGlow = new THREE.MeshStandardMaterial({
    color: 0xb8ecff,
    emissive: 0x74d9ff,
    emissiveIntensity: 0.6,
    roughness: 0.28,
    metalness: 0.42,
  });

  // Keep overall silhouette close to gacha machine proportions.
  const kickplate = new THREE.Mesh(new THREE.BoxGeometry(0.81, 0.15, 0.71), panelMat);
  kickplate.position.set(0, 0.075, 0);
  stationGroup.add(kickplate);

  const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.9, 0.75), shellMat);
  lowerBody.position.set(0, 0.6, 0);
  stationGroup.add(lowerBody);

  const coinPlate = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.02), metalMat);
  coinPlate.position.set(-0.2, 0.74, 0.38);
  stationGroup.add(coinPlate);

  const coinSlit = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.08, 0.03), panelMat);
  coinSlit.position.set(-0.2, 0.74, 0.39);
  stationGroup.add(coinSlit);

  const dialHub = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 30), metalMat);
  dialHub.rotation.x = Math.PI / 2;
  dialHub.position.set(0.18, 0.74, 0.38);
  stationGroup.add(dialHub);

  const dialBar = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.2, 0.06), trimGlow);
  dialBar.position.set(0.18, 0.74, 0.41);
  dialBar.rotation.z = Math.PI / 4;
  stationGroup.add(dialBar);

  const chuteRecess = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.1), panelMat);
  chuteRecess.position.set(0, 0.35, 0.33);
  stationGroup.add(chuteRecess);

  const upperFloor = new THREE.Mesh(new THREE.BoxGeometry(0.81, 0.02, 0.71), metalMat);
  upperFloor.position.set(0, 1.06, 0);
  stationGroup.add(upperFloor);

  const pillarGeo = new THREE.BoxGeometry(0.08, 0.72, 0.08);
  const pBL = new THREE.Mesh(pillarGeo, trimGlow);
  pBL.position.set(-0.385, 1.42, -0.335);
  stationGroup.add(pBL);
  const pBR = new THREE.Mesh(pillarGeo, trimGlow);
  pBR.position.set(0.385, 1.42, -0.335);
  stationGroup.add(pBR);
  const pFL = new THREE.Mesh(pillarGeo, trimGlow);
  pFL.position.set(-0.385, 1.42, 0.335);
  stationGroup.add(pFL);
  const pFR = new THREE.Mesh(pillarGeo, trimGlow);
  pFR.position.set(0.385, 1.42, 0.335);
  stationGroup.add(pFR);

  const topLid = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.14, 0.75), shellMat);
  topLid.position.set(0, 1.83, 0);
  stationGroup.add(topLid);

  const screenFrame = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.4, 0.05), panelMat);
  screenFrame.position.set(0, 1.42, 0.34);
  stationGroup.add(screenFrame);

  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = 512;
  screenCanvas.height = 320;
  const screenCtx = screenCanvas.getContext('2d');
  const screenTex = new THREE.CanvasTexture(screenCanvas);
  screenTex.colorSpace = THREE.SRGBColorSpace;

  const screenMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: screenTex,
    emissive: 0x7be7ff,
    emissiveIntensity: 0.65,
    roughness: 0.28,
    metalness: 0.05,
  });

  const drawTokenScreen = (title: string, subtitle: string, level = 0x7be7ff) => {
    if (!screenCtx) return;

    screenCtx.fillStyle = '#0f1721';
    screenCtx.fillRect(0, 0, screenCanvas.width, screenCanvas.height);

    const grad = screenCtx.createLinearGradient(0, 0, 0, 250);
    grad.addColorStop(0, '#20364d');
    grad.addColorStop(1, '#101e30');
    screenCtx.fillStyle = grad;
    screenCtx.fillRect(14, 14, 484, 292);

    screenCtx.fillStyle = '#a9eeff';
    screenCtx.font = 'bold 30px monospace';
    screenCtx.textAlign = 'center';
    screenCtx.fillText('TOKEN STATION', 256, 60);

    screenCtx.fillStyle = '#e8f6ff';
    screenCtx.font = 'bold 42px monospace';
    screenCtx.fillText(title, 256, 150);

    screenCtx.fillStyle = '#c7daec';
    screenCtx.font = '24px monospace';
    screenCtx.fillText(subtitle, 256, 194);

    screenCtx.fillStyle = '#1a2c40';
    screenCtx.fillRect(98, 226, 316, 52);
    screenCtx.fillStyle = '#9fe1ff';
    screenCtx.font = 'bold 22px monospace';
    screenCtx.fillText('INSERT CREDIT', 256, 259);

    screenTex.needsUpdate = true;
    screenMat.emissive.setHex(level);
  };

  const stationScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.33), screenMat);
  stationScreen.position.set(0, 1.42, 0.368);
  stationScreen.rotation.x = -0.02;
  stationGroup.add(stationScreen);

  const lowerAccent = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.016, 0.012), trimGlow);
  lowerAccent.position.set(0, 1.2, 0.38);
  stationGroup.add(lowerAccent);

  const headerAccent = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.018, 0.012), trimGlow);
  headerAccent.position.set(0, 1.67, 0.38);
  stationGroup.add(headerAccent);

  drawTokenScreen('READY', 'Terminal Online', 0x7be7ff);
  stationGroup.userData['setStatus'] = (status: TokenStationStatus) => {
    if (status === 'ready') drawTokenScreen('READY', 'Terminal Online', 0x7be7ff);
    if (status === 'out_of_stock') drawTokenScreen('OUT OF STOCK', 'Restock from crate', 0xffc96b);
    if (status === 'no_power') drawTokenScreen('NO POWER', 'Reconnect station', 0xff6d6d);
    if (status === 'jammed') drawTokenScreen('DISPENSER STUCK', 'Service required', 0xff8b4a);
    if (status === 'dirty') drawTokenScreen('SCREEN DIRTY', 'Wipe terminal glass', 0x9ec2e0);
  };
  stationGroup.userData['pulseGlow'] = () => {
    trimGlow.emissiveIntensity = 1.2;
    screenMat.emissiveIntensity = 0.95;
    setTimeout(() => {
      trimGlow.emissiveIntensity = 0.6;
      screenMat.emissiveIntensity = 0.65;
    }, 450);
  };

  stationGroup.position.set(5.5, 0, 3);

  return {
    group: stationGroup,
    interactable: stationGroup,
    collider: { name: 'token-station', x: 5.5, z: 3, halfW: 0.44, halfD: 0.38 },
  };
}
