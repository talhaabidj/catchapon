import * as THREE from 'three';

export interface ShopCollider {
  name: string;
  x: number;
  z: number;
  halfW: number;
  halfD: number;
}

export interface BuiltShopInteractable {
  group: THREE.Group;
  interactable: THREE.Object3D;
  collider: ShopCollider;
}
