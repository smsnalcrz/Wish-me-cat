/**
 * FishingEquipment — stylized fantasy fishing rod + fully modelled spinning reel.
 *
 * The rod is a lathe-sculpted assembly (contoured grip, machined reel seat,
 * tapered blank, guide train, celestial tip) and the reel is a real piece of
 * fishing machinery: mounting foot, stem, gearbox housing, rotor, spool with
 * wound line, bail arm, drag knob and a rotating crank handle with grip knob.
 *
 * Six distinct reel/rod tiers (Basic Wooden → Celestial Prism) are built from
 * one geometry set with tier-specific materials, spool styling and ornaments,
 * so equipment upgrades change the ACTUAL equipped appearance.
 */

import * as THREE from 'three';

export interface EquipmentMaterials {
  blank: THREE.MeshStandardMaterial;
  grip: THREE.MeshStandardMaterial;
  metal: THREE.MeshStandardMaterial;
  reelBody: THREE.MeshStandardMaterial;
  reelSpool: THREE.MeshStandardMaterial;
  line: THREE.MeshStandardMaterial;
  tip: THREE.MeshStandardMaterial;
}

export interface ReelAssembly {
  group: THREE.Group;
  /** Rotor + bail wire — spins while reeling in */
  rotorGroup: THREE.Group;
  /** Crank handle — rotates about the gearbox axis while reeling */
  crankGroup: THREE.Group;
  /** Spool — oscillates along its axis to lay line evenly */
  spoolMesh: THREE.Mesh;
  /** Wound line wrap on the spool */
  lineWrap: THREE.Mesh;
  /** Tier ornaments keyed by ornament id */
  ornaments: Record<string, THREE.Object3D>;
}

export interface RodAssembly {
  /** Root transform — attach this to the character's equipment socket */
  rodGroup: THREE.Group;
  /** Flex pivot (rod bends under fish tension) */
  blankGroup: THREE.Group;
  reel: ReelAssembly;
  /** World line-attachment anchor (named 'rodTip') */
  tip: THREE.Object3D;
  /** Local point where the paw grips the handle */
  grip: THREE.Object3D;
}

// ---------------------------------------------------------------------------
// TIER STYLES
// ---------------------------------------------------------------------------
export interface RodTierStyle {
  id: string;
  name: string;
  blank: number;
  grip: number;
  metal: number;
  reelBody: number;
  reelBodyRough: number;
  reelBodyMetal: number;
  spool: number;
  line: number;
  lineEmissive: number;
  lineIntensity: number;
  tip: number;
  tipEmissive: number;
  ornament: 'none' | 'crescent' | 'star' | 'comet' | 'aurora' | 'prism';
}

export const ROD_TIER_STYLES: RodTierStyle[] = [
  {
    id: 'wooden', name: 'Basic Wooden Reel',
    blank: 0x3b240f, grip: 0x6b4a2b, metal: 0xc9a227,
    reelBody: 0x7a5230, reelBodyRough: 0.85, reelBodyMetal: 0.05,
    spool: 0x9a7244, line: 0xbfe3ff, lineEmissive: 0x38bdf8, lineIntensity: 0.35,
    tip: 0x38bdf8, tipEmissive: 0x0284c7, ornament: 'none'
  },
  {
    id: 'moonlight', name: 'Moonlight Reel',
    blank: 0x1e293b, grip: 0x475569, metal: 0xf1f5f9,
    reelBody: 0xcfd8e3, reelBodyRough: 0.32, reelBodyMetal: 0.85,
    spool: 0xe8eef7, line: 0x93c5fd, lineEmissive: 0x38bdf8, lineIntensity: 0.55,
    tip: 0x67e8f9, tipEmissive: 0x06b6d4, ornament: 'crescent'
  },
  {
    id: 'nebula', name: 'Nebula Reel',
    blank: 0x2e1065, grip: 0x3b0764, metal: 0xfbbf24,
    reelBody: 0x7e22ce, reelBodyRough: 0.30, reelBodyMetal: 0.60,
    spool: 0xa855f7, line: 0xe9d5ff, lineEmissive: 0x7c3aed, lineIntensity: 0.75,
    tip: 0xf472b6, tipEmissive: 0xdb2777, ornament: 'star'
  },
  {
    id: 'comet', name: 'Comet Reel',
    blank: 0x09090b, grip: 0x713f12, metal: 0xf59e0b,
    reelBody: 0x292524, reelBodyRough: 0.35, reelBodyMetal: 0.75,
    spool: 0xfbbf24, line: 0xfde68a, lineEmissive: 0xf59e0b, lineIntensity: 0.8,
    tip: 0xfacc15, tipEmissive: 0xd97706, ornament: 'comet'
  },
  {
    id: 'aurora', name: 'Aurora Reel',
    blank: 0x134e4a, grip: 0x115e59, metal: 0xa7f3d0,
    reelBody: 0x0f766e, reelBodyRough: 0.28, reelBodyMetal: 0.55,
    spool: 0x2dd4bf, line: 0x86efac, lineEmissive: 0x22d3ee, lineIntensity: 0.95,
    tip: 0x5eead4, tipEmissive: 0x14b8a6, ornament: 'aurora'
  },
  {
    id: 'prism', name: 'Celestial Prism Reel',
    blank: 0xe2e8f0, grip: 0x38bdf8, metal: 0xe0e7ff,
    reelBody: 0xf8fafc, reelBodyRough: 0.16, reelBodyMetal: 0.90,
    spool: 0xc084fc, line: 0xffffff, lineEmissive: 0x38bdf8, lineIntensity: 1.25,
    tip: 0xffffff, tipEmissive: 0x38bdf8, ornament: 'prism'
  }
];

/** Map rod upgrade level (1..10) to one of the six reel appearances. */
export function rodLevelToTier(level: number): number {
  if (level <= 2) return 0;
  if (level <= 4) return 1;
  if (level <= 6) return 2;
  if (level <= 7) return 3;
  if (level <= 9) return 4;
  return 5;
}

// ---------------------------------------------------------------------------
// GEOMETRY HELPERS
// ---------------------------------------------------------------------------
function lathe(profile: [number, number][], segments = 18): THREE.BufferGeometry {
  const pts = profile.map((p) => new THREE.Vector2(Math.max(p[0], 0.0001), p[1]));
  const geo = new THREE.LatheGeometry(pts, segments);
  geo.computeVertexNormals();
  return geo;
}

function starShape(outer: number, inner: number, points = 5): THREE.Shape {
  const shape = new THREE.Shape();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

function crescentShape(r: number): THREE.Shape {
  const shape = new THREE.Shape();
  const a0 = Math.PI * 0.32;
  const a1 = Math.PI * 1.68;
  const steps = 24;
  for (let i = 0; i <= steps; i++) {
    const a = a0 + ((a1 - a0) * i) / steps;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  for (let i = steps; i >= 0; i--) {
    const a = a0 + ((a1 - a0) * i) / steps;
    shape.lineTo(Math.cos(a) * r * 0.62 + r * 0.34, Math.sin(a) * r * 0.62);
  }
  shape.closePath();
  return shape;
}

// ---------------------------------------------------------------------------
// ROD BUILD
// ---------------------------------------------------------------------------
const ROD_LEN = 1.72;      // total rod length from butt to tip
const BLANK_START = 0.46;  // where the handle/seat ends and the blank begins

export function createFishingRod(mats: EquipmentMaterials): RodAssembly {
  const rodGroup = new THREE.Group();

  // ---- Contoured handle: butt cap → swell → waist → swell ------------------
  const gripProfile: [number, number][] = [
    [0.0, 0.0],
    [0.030, 0.0],
    [0.033, 0.012],
    [0.030, 0.030],
    [0.029, 0.060],
    [0.032, 0.095],
    [0.031, 0.135],
    [0.027, 0.175],
    [0.028, 0.215],
    [0.027, 0.255],
    [0.025, 0.275]
  ];
  const grip = new THREE.Mesh(lathe(gripProfile, 20), mats.grip);
  grip.castShadow = true;
  rodGroup.add(grip);

  // Decorative butt cap ring
  const buttRing = new THREE.Mesh(new THREE.TorusGeometry(0.031, 0.006, 8, 18), mats.metal);
  buttRing.rotation.x = Math.PI / 2;
  buttRing.position.y = 0.030;
  rodGroup.add(buttRing);

  // ---- Machined reel seat with locking rings -------------------------------
  const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.025, 0.11, 16), mats.metal);
  seat.position.y = 0.33;
  rodGroup.add(seat);

  [0.285, 0.375].forEach((ry) => {
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.016, 16), mats.metal);
    ring.position.y = ry;
    rodGroup.add(ring);
  });

  // ---- Foregrip above the seat --------------------------------------------
  const foregrip = new THREE.Mesh(lathe([
    [0.0, 0.395],
    [0.024, 0.395],
    [0.026, 0.420],
    [0.024, 0.450],
    [0.019, 0.468],
    [0.0, 0.468]
  ], 16), mats.grip);
  rodGroup.add(foregrip);

  // ---- Tapered blank (flex pivot) -----------------------------------------
  const blankGroup = new THREE.Group();
  blankGroup.position.y = BLANK_START;
  rodGroup.add(blankGroup);

  const blankProfile: [number, number][] = [
    [0.0, 0.0],
    [0.018, 0.0],
    [0.015, 0.30],
    [0.012, 0.62],
    [0.009, 0.95],
    [0.0065, ROD_LEN - BLANK_START - 0.03],
    [0.005, ROD_LEN - BLANK_START],
    [0.0, ROD_LEN - BLANK_START]
  ];
  const blank = new THREE.Mesh(lathe(blankProfile, 12), mats.blank);
  blank.castShadow = true;
  blankGroup.add(blank);

  // ---- Guide train with ceramic rings --------------------------------------
  const guideYs = [0.24, 0.55, 0.86, 1.12];
  guideYs.forEach((gy, idx) => {
    const ringR = 0.026 * (1 - idx * 0.17);
    const guide = new THREE.Mesh(new THREE.TorusGeometry(ringR, 0.0035, 6, 14), mats.metal);
    guide.rotation.x = Math.PI / 2;
    guide.position.set(0, gy, ringR + 0.006);
    blankGroup.add(guide);

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.004, ringR + 0.008, 6), mats.metal);
    stem.position.set(0, gy, (ringR + 0.008) * 0.5);
    stem.rotation.x = Math.PI / 2;
    blankGroup.add(stem);
  });

  // ---- Tip top + celestial tip crystal -------------------------------------
  const tipY = ROD_LEN - BLANK_START;
  const tipTop = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.006, 0.03, 8), mats.metal);
  tipTop.position.y = tipY + 0.012;
  blankGroup.add(tipTop);

  const tipRing = new THREE.Mesh(new THREE.TorusGeometry(0.012, 0.0028, 6, 12), mats.metal);
  tipRing.rotation.x = Math.PI / 2;
  tipRing.position.y = tipY + 0.030;
  blankGroup.add(tipRing);

  const tipCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.016), mats.tip);
  tipCrystal.position.set(0, tipY + 0.048, 0);
  blankGroup.add(tipCrystal);

  // Line anchor (used by the fishing line)
  const tip = new THREE.Object3D();
  tip.name = 'rodTip';
  tip.position.set(0, tipY + 0.030, 0);
  blankGroup.add(tip);

  // Paw grip anchor (where the paw wraps the handle)
  const gripAnchor = new THREE.Object3D();
  gripAnchor.name = 'rodGrip';
  gripAnchor.position.set(0, 0.16, 0);
  rodGroup.add(gripAnchor);

  // ---- Spinning reel -------------------------------------------------------
  const reel = buildReel(mats);
  reel.group.position.set(-0.026, 0.33, 0); // clamped on the reel seat
  rodGroup.add(reel.group);

  return { rodGroup, blankGroup, reel, tip, grip: gripAnchor };
}

// ---------------------------------------------------------------------------
// REEL BUILD — foot, stem, gearbox, rotor, spool, bail, drag, crank
// ---------------------------------------------------------------------------
function buildReel(mats: EquipmentMaterials): ReelAssembly {
  const group = new THREE.Group();

  // Axis layout (rod-local): +Y toward rod tip, reel hangs toward -X.
  const REEL_X = -0.078;   // gearbox / spool axis lateral offset
  const SPOOL_Y = 0.052;   // spool centre above the gearbox
  const BODY_Y = -0.030;   // gearbox centre

  // 1. Mounting foot (clamped against the rod)
  const foot = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.085, 0.024), mats.metal);
  foot.position.set(0.010, -0.012, 0);
  group.add(foot);

  // 2. Angled stem from foot to gearbox
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.017, 0.075, 8), mats.metal);
  stem.position.set(-0.032, -0.026, 0);
  stem.rotation.z = -0.85;
  group.add(stem);

  // 3. Gearbox housing body (teardrop ovoid)
  const bodyGeo = new THREE.SphereGeometry(0.048, 16, 14);
  bodyGeo.scale(1.0, 1.15, 0.78);
  const gearbox = new THREE.Mesh(bodyGeo, mats.reelBody);
  gearbox.position.set(REEL_X, BODY_Y, 0);
  gearbox.castShadow = true;
  group.add(gearbox);

  // Rear housing collar
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.038, 0.024, 14), mats.metal);
  collar.position.set(REEL_X, BODY_Y - 0.052, 0);
  group.add(collar);

  // 4. Rear drag adjustment knob
  const dragKnob = new THREE.Mesh(new THREE.CylinderGeometry(0.020, 0.023, 0.018, 12), mats.metal);
  dragKnob.position.set(REEL_X, BODY_Y - 0.070, 0);
  group.add(dragKnob);

  // 5. Rotor cup (spins with the bail)
  const rotorGroup = new THREE.Group();
  rotorGroup.position.set(REEL_X, BODY_Y + 0.045, 0);
  group.add(rotorGroup);

  const rotorCup = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.050, 0.030, 16), mats.reelBody);
  rotorCup.position.y = 0.004;
  rotorGroup.add(rotorCup);

  // Rotor arms reaching toward the bail
  [-1, 1].forEach((s) => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.075, 0.012), mats.metal);
    arm.position.set(-0.030, 0.045, s * 0.030);
    arm.rotation.z = 0.6;
    rotorGroup.add(arm);
  });

  // 6. Semi-circular bail wire around the spool
  const bailGeo = new THREE.TorusGeometry(0.058, 0.0032, 6, 20, Math.PI);
  const bail = new THREE.Mesh(bailGeo, mats.metal);
  bail.position.set(0, 0.062, 0);
  bail.rotation.z = Math.PI / 2; // arc over the outer (-X) side
  rotorGroup.add(bail);

  // Line roller at the bail junction
  const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.016, 8), mats.metal);
  roller.rotation.x = Math.PI / 2;
  roller.position.set(0, 0.062 + 0.058, 0);
  rotorGroup.add(roller);

  // 7. Spool (oscillates along its axis to lay line evenly)
  const spoolGroup = new THREE.Group();
  spoolGroup.position.set(REEL_X, BODY_Y + 0.088, 0);
  group.add(spoolGroup);

  const spoolCore = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.058, 16), mats.reelSpool);
  spoolGroup.add(spoolCore);

  [-0.032, 0.032].forEach((sy) => {
    const flange = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.008, 16), mats.metal);
    flange.position.y = sy;
    spoolGroup.add(flange);
  });

  const lineWrap = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.048, 16), mats.line);
  spoolGroup.add(lineWrap);

  // 8. Front drag cap on the spool
  const spoolCap = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.014, 12), mats.metal);
  spoolCap.position.y = 0.040;
  spoolGroup.add(spoolCap);

  // 9. Crank handle: hub → arm → rotating grip knob
  const crankGroup = new THREE.Group();
  crankGroup.position.set(REEL_X + 0.012, BODY_Y, 0.038);
  group.add(crankGroup);

  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.017, 0.020, 10), mats.metal);
  hub.rotation.x = Math.PI / 2;
  crankGroup.add(hub);

  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.075, 0.009), mats.metal);
  arm.position.set(0, 0.038, 0.014);
  crankGroup.add(arm);

  const knobStem = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.020, 8), mats.metal);
  knobStem.rotation.x = Math.PI / 2;
  knobStem.position.set(0, 0.075, 0.026);
  crankGroup.add(knobStem);

  const knobGeo = new THREE.CylinderGeometry(0.015, 0.017, 0.034, 12);
  const knob = new THREE.Mesh(knobGeo, mats.grip);
  knob.rotation.x = Math.PI / 2;
  knob.position.set(0, 0.075, 0.045);
  crankGroup.add(knob);

  // 10. Tier ornaments (all built, visibility driven by tier)
  const ornaments: Record<string, THREE.Object3D> = {};
  const ornZ = 0.040;

  // Moonlight crescent side plate
  const crescent = new THREE.Group();
  const crescentMesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(crescentShape(0.030), { depth: 0.006, bevelEnabled: false }),
    mats.tip
  );
  crescentMesh.position.set(REEL_X, BODY_Y, -ornZ);
  crescent.add(crescentMesh);
  ornaments['crescent'] = crescent;
  group.add(crescent);

  // Nebula star side plate
  const star = new THREE.Group();
  const starMesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(starShape(0.030, 0.013), { depth: 0.006, bevelEnabled: false }),
    mats.tip
  );
  starMesh.position.set(REEL_X, BODY_Y, -ornZ);
  star.add(starMesh);
  ornaments['star'] = star;
  group.add(star);

  // Comet: shooting star spike + head
  const comet = new THREE.Group();
  const cometHead = new THREE.Mesh(new THREE.SphereGeometry(0.017, 10, 8), mats.tip);
  cometHead.position.set(REEL_X, BODY_Y + 0.012, -ornZ);
  const cometTail = new THREE.Mesh(new THREE.ConeGeometry(0.010, 0.055, 8), mats.tip);
  cometTail.position.set(REEL_X, BODY_Y - 0.024, -ornZ);
  comet.add(cometHead, cometTail);
  ornaments['comet'] = comet;
  group.add(comet);

  // Aurora: twin glowing rings around the spool
  const aurora = new THREE.Group();
  const ringA = new THREE.Mesh(new THREE.TorusGeometry(0.058, 0.0055, 6, 22), mats.line);
  ringA.rotation.x = Math.PI / 2;
  ringA.position.set(REEL_X, SPOOL_Y - 0.004, 0);
  const ringB = new THREE.Mesh(new THREE.TorusGeometry(0.064, 0.0045, 6, 22), mats.tip);
  ringB.rotation.x = Math.PI / 2;
  ringB.position.set(REEL_X, SPOOL_Y + 0.014, 0);
  aurora.add(ringA, ringB);
  ornaments['aurora'] = aurora;
  group.add(aurora);

  // Celestial prism crystal atop the gearbox
  const prism = new THREE.Group();
  const prismMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.024), mats.tip);
  prismMesh.position.set(REEL_X, BODY_Y + 0.055, -ornZ);
  prismMesh.rotation.z = 0.5;
  prism.add(prismMesh);
  ornaments['prism'] = prism;
  group.add(prism);

  return { group, rotorGroup, crankGroup, spoolMesh: spoolCore, lineWrap, ornaments };
}

// ---------------------------------------------------------------------------
// TIER APPLICATION
// ---------------------------------------------------------------------------
export function applyRodTier(
  level: number,
  mats: EquipmentMaterials,
  reels: ReelAssembly[]
): RodTierStyle {
  const style = ROD_TIER_STYLES[rodLevelToTier(level)];

  mats.blank.color.setHex(style.blank);
  mats.grip.color.setHex(style.grip);
  mats.metal.color.setHex(style.metal);
  mats.reelBody.color.setHex(style.reelBody);
  mats.reelBody.roughness = style.reelBodyRough;
  mats.reelBody.metalness = style.reelBodyMetal;
  mats.reelSpool.color.setHex(style.spool);
  mats.line.color.setHex(style.line);
  mats.line.emissive.setHex(style.lineEmissive);
  mats.line.emissiveIntensity = style.lineIntensity;
  mats.tip.color.setHex(style.tip);
  mats.tip.emissive.setHex(style.tipEmissive);
  mats.tip.emissiveIntensity = style.id === 'prism' ? 1.3 : 0.9;

  for (const reel of reels) {
    for (const [key, obj] of Object.entries(reel.ornaments)) {
      obj.visible = key === style.ornament;
    }
  }

  return style;
}
