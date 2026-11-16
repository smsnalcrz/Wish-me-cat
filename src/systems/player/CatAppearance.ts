/**
 * CatAppearance — declarative appearance configuration for the mascot.
 *
 * Every visual identity (breed coats, markings, eyes, nose, inner ears,
 * collar, charm, whiskers) lives here as DATA. Swapping cosmetics never
 * requires rebuilding geometry: markings are re-painted into the vertex
 * colors of the shared fur material, and eye/collar/charm materials are
 * recoloured in place. Future fur colours, eye colours, collars, hats and
 * seasonal cosmetics only need a new entry (or a runtime override).
 */

import * as THREE from 'three';
import { CatBreed } from '../../types/game';
import { smoothstep } from './geometry/SdfMath';

export interface CoatPatch {
  center: [number, number, number];
  radius: [number, number, number];
  color: number;
}

export interface EyeLook {
  color: number;
  emissive: number;
  emissiveIntensity: number;
}

export type CharmShape = 'star' | 'suzu' | 'moon' | 'gem';

export interface CatAppearance {
  id: CatBreed | string;
  /** Main coat colour (also drives vertex-tinted markings via multiplier-free painting) */
  furColor: number;
  /** Slight cosmic self-glow for the coat */
  furEmissive: number;
  furEmissiveIntensity: number;
  /** Muzzle / bib / belly / socks / tail-tip colour */
  markingColor: number;
  /** Height of the white "socks" on all four legs */
  socksHeight: number;
  /** Optional coat patches (calico spots etc.) painted over the coat */
  patches: CoatPatch[];
  /** Procedural star freckles on the cheeks/flank */
  starAccent: boolean;
  eyeLeft: EyeLook;
  eyeRight: EyeLook;
  noseColor: number;
  innerEarColor: number;
  pawPadColor: number;
  mouthColor: number;
  whiskerColor: number;
  collarColor: number;
  charmColor: number;
  charmShape: CharmShape;
}

/** Shared material set — recoloured in place when the appearance changes. */
export interface CatMaterials {
  fur: THREE.MeshPhysicalMaterial;
  innerEar: THREE.MeshStandardMaterial;
  nose: THREE.MeshStandardMaterial;
  eyeWhite: THREE.MeshStandardMaterial;
  irisLeft: THREE.MeshStandardMaterial;
  irisRight: THREE.MeshStandardMaterial;
  pupil: THREE.MeshBasicMaterial;
  catchlight: THREE.MeshBasicMaterial;
  mouth: THREE.MeshStandardMaterial;
  whisker: THREE.MeshStandardMaterial;
  pawPad: THREE.MeshStandardMaterial;
  collar: THREE.MeshStandardMaterial;
  charm: THREE.MeshStandardMaterial;
}

export function createCatMaterials(): CatMaterials {
  const fur = new THREE.MeshPhysicalMaterial({
    vertexColors: true,
    roughness: 0.72,
    metalness: 0.0,
    sheen: 0.55,
    sheenRoughness: 0.55,
    sheenColor: new THREE.Color(0xffffff)
  });
  const innerEar = new THREE.MeshStandardMaterial({ color: 0xf7a8c4, roughness: 0.6, side: THREE.DoubleSide });
  const nose = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.42, metalness: 0.05 });
  const eyeWhite = new THREE.MeshStandardMaterial({ color: 0xfdfcf7, roughness: 0.16, metalness: 0.0 });
  const irisLeft = new THREE.MeshStandardMaterial({
    color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.65,
    roughness: 0.14, metalness: 0.15
  });
  const irisRight = irisLeft.clone();
  const pupil = new THREE.MeshBasicMaterial({ color: 0x0a0f1d });
  const catchlight = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const mouth = new THREE.MeshStandardMaterial({ color: 0x7a4a5c, roughness: 0.55 });
  const whisker = new THREE.MeshStandardMaterial({
    color: 0xffffff, roughness: 0.5, transparent: true, opacity: 0.75
  });
  const pawPad = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.55 });
  const collar = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.34, metalness: 0.65 });
  const charm = new THREE.MeshStandardMaterial({
    color: 0xfde047, roughness: 0.2, metalness: 0.8,
    emissive: 0xf59e0b, emissiveIntensity: 0.45
  });

  return {
    fur, innerEar, nose, eyeWhite, irisLeft, irisRight,
    pupil, catchlight, mouth, whisker, pawPad, collar, charm
  };
}

// ---------------------------------------------------------------------------
// BREED CATALOGUE
// ---------------------------------------------------------------------------
export const CAT_APPEARANCES: Record<CatBreed, CatAppearance> = {
  celestial: {
    id: 'celestial',
    furColor: 0xa59ad8,
    furEmissive: 0x1e1642,
    furEmissiveIntensity: 0.22,
    markingColor: 0xf5f3ff,
    socksHeight: 0.150,
    patches: [],
    starAccent: true,
    eyeLeft: { color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.65 },
    eyeRight: { color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.65 },
    noseColor: 0xf472b6,
    innerEarColor: 0xf9a8d4,
    pawPadColor: 0xf472b6,
    mouthColor: 0x7a4a5c,
    whiskerColor: 0xf5f3ff,
    collarColor: 0xfbbf24,
    charmColor: 0xfde047,
    charmShape: 'star'
  },
  calico: {
    id: 'calico',
    furColor: 0xfcfaf7,
    furEmissive: 0x141210,
    furEmissiveIntensity: 0.10,
    markingColor: 0xffffff,
    socksHeight: 0.150,
    patches: [
      { center: [0.16, 0.94, 0.40], radius: [0.16, 0.15, 0.16], color: 0xf97316 },
      { center: [-0.19, 1.00, 0.36], radius: [0.13, 0.14, 0.13], color: 0x334155 },
      { center: [-0.17, 0.55, -0.16], radius: [0.17, 0.15, 0.19], color: 0x334155 },
      { center: [0.16, 0.50, 0.02], radius: [0.16, 0.15, 0.18], color: 0xf97316 },
      { center: [0.10, 0.97, -0.14], radius: [0.15, 0.13, 0.16], color: 0x334155 }
    ],
    starAccent: false,
    eyeLeft: { color: 0xf59e0b, emissive: 0xb45309, emissiveIntensity: 0.45 },
    eyeRight: { color: 0xf59e0b, emissive: 0xb45309, emissiveIntensity: 0.45 },
    noseColor: 0xfb7185,
    innerEarColor: 0xf9a8c4,
    pawPadColor: 0xfb7185,
    mouthColor: 0x8a5a5a,
    whiskerColor: 0xffffff,
    collarColor: 0xef4444,
    charmColor: 0xfacc15,
    charmShape: 'suzu'
  },
  kuro: {
    id: 'kuro',
    furColor: 0x1e1c2e,
    furEmissive: 0x0e0c1a,
    furEmissiveIntensity: 0.20,
    markingColor: 0xffffff,
    socksHeight: 0.165,
    patches: [],
    starAccent: false,
    eyeLeft: { color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.7 },
    eyeRight: { color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.7 },
    noseColor: 0xf0a3c2,
    innerEarColor: 0xc88bd6,
    pawPadColor: 0xf0a3c2,
    mouthColor: 0x6f6484,
    whiskerColor: 0xe8e6f5,
    collarColor: 0xa855f7,
    charmColor: 0xe0e7ff,
    charmShape: 'moon'
  },
  cloud: {
    id: 'cloud',
    furColor: 0xfffaf0,
    furEmissive: 0x1f1a10,
    furEmissiveIntensity: 0.12,
    markingColor: 0xffffff,
    socksHeight: 0.150,
    patches: [
      { center: [0.17, 0.95, 0.38], radius: [0.13, 0.14, 0.14], color: 0xfde8d8 }
    ],
    starAccent: false,
    eyeLeft: { color: 0x2563eb, emissive: 0x1d4ed8, emissiveIntensity: 0.7 },
    eyeRight: { color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.7 },
    noseColor: 0xfbcfe8,
    innerEarColor: 0xfdbcd4,
    pawPadColor: 0xfbcfe8,
    mouthColor: 0x9a7a8a,
    whiskerColor: 0xffffff,
    collarColor: 0xf472b6,
    charmColor: 0xfde047,
    charmShape: 'gem'
  }
};

// ---------------------------------------------------------------------------
// VERTEX PAINTING — markings are baked into vertex colours so coat patterns
// blend seamlessly across the sculpted surface (no decal geometry, no seams).
// ---------------------------------------------------------------------------
const MARKING = new THREE.Color();
const PATCH = new THREE.Color();
const FUR = new THREE.Color();
const FINAL = new THREE.Color();

const STAR_FRECKLES: [number, number, number][] = [
  [0.235, 0.775, 0.545],
  [-0.235, 0.775, 0.545],
  [0.245, 0.720, 0.480],
  [-0.245, 0.720, 0.480],
  [0.185, 0.600, -0.230],
  [-0.185, 0.610, -0.260],
  [0.100, 0.560, -0.330]
];

function regionMix(p: THREE.Vector3, c: [number, number, number], r: [number, number, number], edge = 0.92): number {
  const qx = (p.x - c[0]) / r[0];
  const qy = (p.y - c[1]) / r[1];
  const qz = (p.z - c[2]) / r[2];
  const q = Math.sqrt(qx * qx + qy * qy + qz * qz);
  return smoothstep(1.0, edge, q);
}

/** Paint the coat markings for one vertex into `out`. */
export function paintCatVertex(out: THREE.Color, p: THREE.Vector3, app: CatAppearance): THREE.Color {
  FUR.setHex(app.furColor);
  MARKING.setHex(app.markingColor);
  out.copy(FUR);

  // Muzzle mask (whisker pads + chin)
  const muzzle = regionMix(p, [0, 0.730, 0.565], [0.175, 0.135, 0.170], 0.90);
  if (muzzle > 0) out.lerp(MARKING, muzzle);

  // Chest bib
  const bib = regionMix(p, [0, 0.470, 0.295], [0.175, 0.195, 0.130], 0.90);
  if (bib > 0) out.lerp(MARKING, bib);

  // Soft belly underside
  if (p.y < 0.44) {
    const belly = regionMix(p, [0, 0.345, -0.040], [0.205, 0.165, 0.340], 0.88);
    if (belly > 0) out.lerp(MARKING, belly * 0.9);
  }

  // Socks on all four legs
  const sock = smoothstep(app.socksHeight + 0.012, app.socksHeight - 0.020, p.y);
  if (sock > 0) out.lerp(MARKING, sock);

  // Tail tip
  const tailTip = regionMix(p, [0, 0.965, -0.700], [0.11, 0.13, 0.11], 0.85);
  if (tailTip > 0) out.lerp(MARKING, tailTip);

  // Coat patches (calico & friends) painted over everything
  for (const patch of app.patches) {
    const m = regionMix(p, patch.center, patch.radius, 0.90);
    if (m > 0) {
      PATCH.setHex(patch.color);
      out.lerp(PATCH, m);
    }
  }

  // Celestial star freckles: tiny bright constellations on the cheeks & flank
  if (app.starAccent) {
    for (const s of STAR_FRECKLES) {
      const dx = p.x - s[0], dy = p.y - s[1], dz = p.z - s[2];
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const glow = smoothstep(0.024, 0.010, d);
      if (glow > 0) {
        FINAL.copy(out).lerp(new THREE.Color(0xffffff), glow * 0.75);
        out.copy(FINAL);
      }
    }
  }

  return out;
}

export function applyAppearanceToMaterials(m: CatMaterials, app: CatAppearance): void {
  m.fur.color.setHex(0xffffff);
  m.fur.emissive.setHex(app.furEmissive);
  m.fur.emissiveIntensity = app.furEmissiveIntensity;
  m.innerEar.color.setHex(app.innerEarColor);
  m.nose.color.setHex(app.noseColor);
  m.irisLeft.color.setHex(app.eyeLeft.color);
  m.irisLeft.emissive.setHex(app.eyeLeft.emissive);
  m.irisLeft.emissiveIntensity = app.eyeLeft.emissiveIntensity;
  m.irisRight.color.setHex(app.eyeRight.color);
  m.irisRight.emissive.setHex(app.eyeRight.emissive);
  m.irisRight.emissiveIntensity = app.eyeRight.emissiveIntensity;
  m.mouth.color.setHex(app.mouthColor);
  m.whisker.color.setHex(app.whiskerColor);
  m.pawPad.color.setHex(app.pawPadColor);
  m.collar.color.setHex(app.collarColor);
  m.charm.color.setHex(app.charmColor);
  m.charm.emissive.setHex(app.charmColor);
}
