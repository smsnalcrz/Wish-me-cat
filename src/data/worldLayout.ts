import * as THREE from 'three';

export interface FishingAnchor {
  id: string;
  name: string;
  position: THREE.Vector3;
  direction: THREE.Vector3; // Direction cat faces when fishing (towards the pond)
  castTarget: THREE.Vector3; // Where bobber lands in the galaxy pool
  prompt: string;
  interactionRadius: number;
}

export interface WorldCollider {
  id: string;
  type: 'cylinder' | 'box';
  position: THREE.Vector3;
  radius?: number; // For cylinder colliders
  halfExtents?: THREE.Vector3; // For box colliders
}

export interface StationLayout {
  id: string;
  name: string;
  prompt: string;
  position: THREE.Vector3;
  rotationY: number;
  interactionRadius: number;
}

export const WORLD_LAYOUT = {
  island: {
    center: new THREE.Vector3(0, 0, 0),
    outerRadius: 18.2, // Walkable island edge boundary
    innerPoolRadius: 6.6, // Crater water boundary (cannot walk through pool water)
    playerSpawn: new THREE.Vector3(0, 0.25, -9.5),
  },

  // 4 Predefined Fishing Piers/Anchors with dedicated docks around the Starpond
  fishingAnchors: [
    {
      id: 'pier_south',
      name: 'Starlight South Pier',
      position: new THREE.Vector3(0, 0.25, -6.8),
      direction: new THREE.Vector3(0, 0, 1),
      castTarget: new THREE.Vector3(0, 0.08, -3.2),
      prompt: 'Press [E] or Click to Fish at South Pier',
      interactionRadius: 2.4,
    },
    {
      id: 'pier_east',
      name: 'Moonlit East Jetty',
      position: new THREE.Vector3(6.8, 0.25, 0),
      direction: new THREE.Vector3(-1, 0, 0),
      castTarget: new THREE.Vector3(3.2, 0.08, 0),
      prompt: 'Press [E] or Click to Fish at East Jetty',
      interactionRadius: 2.4,
    },
    {
      id: 'pier_north',
      name: 'Aurora North Overlook',
      position: new THREE.Vector3(0, 0.25, 6.8),
      direction: new THREE.Vector3(0, 0, -1),
      castTarget: new THREE.Vector3(0, 0.08, 3.2),
      prompt: 'Press [E] or Click to Fish at North Overlook',
      interactionRadius: 2.4,
    },
    {
      id: 'pier_west',
      name: 'Whispering West Bank',
      position: new THREE.Vector3(-6.8, 0.25, 0),
      direction: new THREE.Vector3(1, 0, 0),
      castTarget: new THREE.Vector3(-3.2, 0.08, 0),
      prompt: 'Press [E] or Click to Fish at West Bank',
      interactionRadius: 2.4,
    },
  ] as FishingAnchor[],

  // 5 Major Hub Stations
  stations: {
    shop: {
      id: 'station_shop',
      name: 'Cosmic Gear Emporium',
      prompt: 'Press [E] to Browse Equipment Shop',
      position: new THREE.Vector3(10.5, 0.2, 5.2),
      rotationY: -0.65,
      interactionRadius: 3.2,
    },
    quests: {
      id: 'station_quests',
      name: 'Celestial Quest Observatory',
      prompt: 'Press [E] to View Quest Board',
      position: new THREE.Vector3(-10.5, 0.2, 5.2),
      rotationY: 0.65,
      interactionRadius: 3.2,
    },
    constellations: {
      id: 'station_constellations',
      name: 'Felis Major Constellation Altar',
      prompt: 'Press [E] to Commune with Constellation Altar',
      position: new THREE.Vector3(0, 0.2, 13.5),
      rotationY: Math.PI,
      interactionRadius: 3.5,
    },
    collection: {
      id: 'station_collection',
      name: 'Star Almanac Pedestal',
      prompt: 'Press [E] to Read Star Almanac',
      position: new THREE.Vector3(-8.5, 0.2, -7.5),
      rotationY: 0.75,
      interactionRadius: 3.0,
    },
    portal: {
      id: 'station_portal',
      name: 'Cosmic Realm Gateway',
      prompt: 'Press [E] to Enter Realm Gateway',
      position: new THREE.Vector3(13.8, 0.2, -4.5),
      rotationY: -1.2,
      interactionRadius: 3.5,
    },
  } as Record<string, StationLayout>,

  // Physical colliders to prevent player & camera from clipping through buildings & props
  colliders: [
    // Shop kiosk
    { id: 'col_shop', type: 'cylinder', position: new THREE.Vector3(10.5, 0, 5.2), radius: 1.8 },
    // Quest board structure
    { id: 'col_quest', type: 'box', position: new THREE.Vector3(-10.5, 0, 5.2), halfExtents: new THREE.Vector3(1.6, 2, 0.7) },
    // Constellation altar dais
    { id: 'col_altar', type: 'cylinder', position: new THREE.Vector3(0, 0, 13.5), radius: 2.2 },
    // Almanac pedestal
    { id: 'col_almanac', type: 'cylinder', position: new THREE.Vector3(-8.5, 0, -7.5), radius: 1.4 },
    // Realm portal gate pillars
    { id: 'col_portal_left', type: 'cylinder', position: new THREE.Vector3(12.7, 0, -5.3), radius: 0.8 },
    { id: 'col_portal_right', type: 'cylinder', position: new THREE.Vector3(14.8, 0, -3.7), radius: 0.8 },
    // Decorative major crystal formations
    { id: 'col_crystal_ne', type: 'cylinder', position: new THREE.Vector3(12.0, 0, 10.5), radius: 1.2 },
    { id: 'col_crystal_nw', type: 'cylinder', position: new THREE.Vector3(-12.0, 0, 10.5), radius: 1.2 },
    { id: 'col_crystal_sw', type: 'cylinder', position: new THREE.Vector3(-12.5, 0, -5.5), radius: 1.1 },
  ] as WorldCollider[],
};
