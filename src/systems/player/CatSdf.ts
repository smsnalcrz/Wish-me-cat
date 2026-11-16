/**
 * CatSdf — the implicit sculpture of the Purrseids mascot cat.
 *
 * The whole body (torso, neck, head, cheeks, muzzle, ears, legs, paws, tail)
 * is defined as ONE smooth signed distance field. SurfaceNets converts it into
 * a single seamless mesh: no primitive intersections, no shading seams, no
 * detached parts — just a clean sculpted mascot silhouette from every angle.
 *
 * Coordinate space: CatCharacter.group local space.
 *   +Y up, +Z forward (the cat faces +Z), ground plane at y = 0.
 */

import * as THREE from 'three';
import {
  SdfFn, smin, smax, clamp, sdEllipsoid, sdTaperedCapsule,
  sdSphere, sdTriangle2D, marchToSurface
} from './geometry/SdfMath';

// ---------------------------------------------------------------------------
// ANATOMY CONSTANTS (tuned for a cozy, chibi-but-readable mascot proportion)
// ---------------------------------------------------------------------------
export const ANATOMY = {
  // Torso
  chest: { c: [0, 0.47, 0.16], r: [0.250, 0.255, 0.250] },
  mid: { c: [0, 0.44, -0.05], r: [0.245, 0.240, 0.260] },
  hips: { c: [0, 0.45, -0.25], r: [0.230, 0.230, 0.205] },
  // Head
  cranium: { c: [0, 0.82, 0.40], r: [0.290, 0.260, 0.265] },
  cheek: { c: [0.150, 0.740, 0.470], r: [0.150, 0.130, 0.140] },
  muzzle: { c: [0, 0.735, 0.585], r: [0.125, 0.098, 0.100] },
  chin: { c: [0, 0.675, 0.555], r: [0.095, 0.070, 0.085] },
  // Legs (front / hind)
  frontShoulder: [0.155, 0.50, 0.170],
  frontKnee: [0.155, 0.315, 0.185],
  frontAnkle: [0.155, 0.115, 0.205],
  frontPaw: [0.155, 0.062, 0.235],
  hindHip: [0.185, 0.44, -0.250],
  hindKnee: [0.185, 0.275, -0.265],
  hindAnkle: [0.185, 0.115, -0.205],
  hindPaw: [0.185, 0.062, -0.170],
  // Eye / nose anchor directions (marched onto the face at build time)
  eyeDir: [0.50, 0.17, 0.85],
  headCenter: [0, 0.82, 0.40],
  noseDir: [0, -0.10, 1.0],
  muzzleCenter: [0, 0.735, 0.585],
  // Ear
  earOrigin: [0.160, 0.950, 0.360],
  earAxis: [0.325, 0.945, 0.061], // right ear; left mirrors X
  earFront: [0.0, 0.15, 1.0],
  earTriangle: [[-0.050, 0.004], [0.085, 0.000], [0.020, 0.190]] as [number, number][]
} as const;

export interface EarFrame {
  side: -1 | 1;
  origin: THREE.Vector3;
  u: THREE.Vector3; // lateral (toward outer edge)
  v: THREE.Vector3; // toward ear tip
  w: THREE.Vector3; // front face normal
}

export interface CatAnatomyAnchors {
  eyeL: { pos: THREE.Vector3; dir: THREE.Vector3 };
  eyeR: { pos: THREE.Vector3; dir: THREE.Vector3 };
  nose: { pos: THREE.Vector3; dir: THREE.Vector3 };
  mouthCenter: THREE.Vector3;
  ears: [EarFrame, EarFrame];
  whiskerRoots: { side: number; pos: THREE.Vector3 }[];
}

function v3(a: readonly number[]): THREE.Vector3 {
  return new THREE.Vector3(a[0], a[1], a[2]);
}

// ---------------------------------------------------------------------------
// EAR FRAME HELPERS
// ---------------------------------------------------------------------------
export function buildEarFrame(side: -1 | 1): EarFrame {
  const origin = v3(ANATOMY.earOrigin).multiply(new THREE.Vector3(side, 1, 1));
  const axis = v3(ANATOMY.earAxis).multiply(new THREE.Vector3(side, 1, 1)).normalize();
  const front = v3(ANATOMY.earFront).normalize();
  // lateral u = -side * cross(front, axis)
  const u = new THREE.Vector3().crossVectors(front, axis).multiplyScalar(-side).normalize();
  const w = new THREE.Vector3().crossVectors(u, axis).normalize();
  return { side, origin, u, v: axis, w };
}

function earSdfFactory(frame: EarFrame): SdfFn {
  const { origin, u, v, w } = frame;
  const tri = ANATOMY.earTriangle;
  return (x, y, z) => {
    const dx = x - origin.x, dy = y - origin.y, dz = z - origin.z;
    const du = dx * u.x + dy * u.y + dz * u.z;
    const dv = dx * v.x + dy * v.y + dz * v.z;
    const dw = dx * w.x + dy * w.y + dz * w.z;

    const d2 = sdTriangle2D(du, dv, tri[0][0], tri[0][1], tri[1][0], tri[1][1], tri[2][0], tri[2][1]);
    // Ear tapers from a thick base to a delicate tip
    const half = clamp(0.034 - (dv / 0.190) * 0.017, 0.013, 0.034);
    const dy2 = Math.abs(dw) - half;
    const ox = Math.max(d2, 0);
    const oy = Math.max(dy2, 0);
    const prism = Math.sqrt(ox * ox + oy * oy) + Math.min(Math.max(d2, dy2), 0);
    // Dilation rounds the rim so the ear reads as soft sculpted cartilage
    return prism - 0.012;
  };
}

// ---------------------------------------------------------------------------
// THE FULL BODY FIELD
// ---------------------------------------------------------------------------
export interface CatField {
  sdf: SdfFn;
  lowerBound: SdfFn;
  anchors: CatAnatomyAnchors;
  bounds: { minX: number; minY: number; minZ: number; maxX: number; maxY: number; maxZ: number };
}

export function buildCatField(): CatField {
  const A = ANATOMY;
  const earL = buildEarFrame(-1);
  const earR = buildEarFrame(1);
  const earLdf = earSdfFactory(earL);
  const earRdf = earSdfFactory(earR);

  // ---- Face anchors by ray-marching the base head ---------------------------
  const headSdfBase: SdfFn = (x, y, z) => {
    let h = sdEllipsoid(x, y, z, A.cranium.c[0], A.cranium.c[1], A.cranium.c[2], A.cranium.r[0], A.cranium.r[1], A.cranium.r[2]);
    h = smin(h, sdEllipsoid(x, y, z, A.cheek.c[0], A.cheek.c[1], A.cheek.c[2], A.cheek.r[0], A.cheek.r[1], A.cheek.r[2]), 0.08);
    h = smin(h, sdEllipsoid(x, y, z, -A.cheek.c[0], A.cheek.c[1], A.cheek.c[2], A.cheek.r[0], A.cheek.r[1], A.cheek.r[2]), 0.08);
    h = smin(h, sdEllipsoid(x, y, z, A.muzzle.c[0], A.muzzle.c[1], A.muzzle.c[2], A.muzzle.r[0], A.muzzle.r[1], A.muzzle.r[2]), 0.07);
    h = smin(h, sdEllipsoid(x, y, z, A.chin.c[0], A.chin.c[1], A.chin.c[2], A.chin.r[0], A.chin.r[1], A.chin.r[2]), 0.06);
    h = smin(h, earLdf(x, y, z), 0.035);
    h = smin(h, earRdf(x, y, z), 0.035);
    return h;
  };

  const hc = v3(A.headCenter);
  const eyeDirR = v3(A.eyeDir).normalize();
  const eyeRsurf = marchToSurface(headSdfBase, hc.x, hc.y, hc.z, eyeDirR.x, eyeDirR.y, eyeDirR.z, 1.4)!;
  const eyeLdir = eyeDirR.clone().multiply(new THREE.Vector3(-1, 1, 1));
  const eyeLsurf = marchToSurface(headSdfBase, hc.x, hc.y, hc.z, eyeLdir.x, eyeLdir.y, eyeLdir.z, 1.4)!;

  const noseDir = v3(A.noseDir).normalize();
  const mc = v3(A.muzzleCenter);
  const noseSurf = marchToSurface(headSdfBase, mc.x, mc.y, mc.z, noseDir.x, noseDir.y, noseDir.z, 0.8)!;

  const EYE_DEPTH = 0.036; // how far the eyeball centre sits behind the face
  const eyeLpos = eyeLsurf.clone().addScaledVector(eyeLdir, EYE_DEPTH);
  const eyeRpos = eyeRsurf.clone().addScaledVector(eyeDirR, EYE_DEPTH);

  // ---- Whisker roots on the muzzle flanks -----------------------------------
  const whiskerRoots: { side: number; pos: THREE.Vector3 }[] = [];
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const dir = new THREE.Vector3(side * 0.72, -0.06 + i * 0.055, 0.69).normalize();
      const hit = marchToSurface(headSdfBase, mc.x, mc.y, mc.z, dir.x, dir.y, dir.z, 0.6);
      if (hit) whiskerRoots.push({ side, pos: hit.clone().addScaledVector(dir, -0.004) });
    }
  }

  // ---- Assemble the complete body field -------------------------------------
  // Tail: smooth tapered sweep rising into a question-mark curl
  const TAIL: [number, number, number, number][] = [
    [0, 0.49, -0.42, 0.058],
    [0, 0.525, -0.495, 0.057],
    [0, 0.565, -0.565, 0.056],
    [0, 0.615, -0.625, 0.054],
    [0, 0.675, -0.675, 0.052],
    [0, 0.740, -0.715, 0.050],
    [0, 0.810, -0.740, 0.048],
    [0, 0.880, -0.745, 0.045],
    [0, 0.940, -0.725, 0.042],
    [0, 0.985, -0.690, 0.039]
  ];

  const sdf: SdfFn = (x, y, z) => {
    // Torso barrel: chest -> mid -> hips
    let d = sdEllipsoid(x, y, z, A.chest.c[0], A.chest.c[1], A.chest.c[2], A.chest.r[0], A.chest.r[1], A.chest.r[2]);
    d = smin(d, sdEllipsoid(x, y, z, A.mid.c[0], A.mid.c[1], A.mid.c[2], A.mid.r[0], A.mid.r[1], A.mid.r[2]), 0.10);
    d = smin(d, sdEllipsoid(x, y, z, A.hips.c[0], A.hips.c[1], A.hips.c[2], A.hips.r[0], A.hips.r[1], A.hips.r[2]), 0.10);

    // Neck bridging into the head
    d = smin(d, sdTaperedCapsule(x, y, z, 0, 0.545, 0.235, 0, 0.655, 0.325, 0.148, 0.158), 0.085);

    // Head + face
    d = smin(d, headSdfBase(x, y, z), 0.075);

    // Eye sockets: smooth-carved bowls the eyeballs nest into (no glued-on balls)
    d = smax(d, -sdSphere(x, y, z, eyeLpos.x, eyeLpos.y, eyeLpos.z, 0.076), 0.024);
    d = smax(d, -sdSphere(x, y, z, eyeRpos.x, eyeRpos.y, eyeRpos.z, 0.076), 0.024);

    // ---- Forelegs -----------------------------------------------------------
    const fl = sdTaperedCapsule(x, y, z,
      A.frontShoulder[0], A.frontShoulder[1], A.frontShoulder[2],
      A.frontKnee[0], A.frontKnee[1], A.frontKnee[2], 0.082, 0.066);
    const fl2 = sdTaperedCapsule(x, y, z,
      A.frontKnee[0], A.frontKnee[1], A.frontKnee[2],
      A.frontAnkle[0], A.frontAnkle[1], A.frontAnkle[2], 0.066, 0.058);
    const flPaw = sdEllipsoid(x, y, z, A.frontPaw[0], A.frontPaw[1], A.frontPaw[2], 0.076, 0.058, 0.094);
    const flToe = sdEllipsoid(x, y, z, A.frontPaw[0], A.frontPaw[1] - 0.010, A.frontPaw[2] + 0.038, 0.062, 0.044, 0.050);
    let legF = smin(fl, fl2, 0.03);
    legF = smin(legF, flPaw, 0.045);
    legF = smin(legF, flToe, 0.035);
    d = smin(d, legF, 0.055);

    // Mirrored right foreleg
    const fr = sdTaperedCapsule(x, y, z,
      -A.frontShoulder[0], A.frontShoulder[1], A.frontShoulder[2],
      -A.frontKnee[0], A.frontKnee[1], A.frontKnee[2], 0.082, 0.066);
    const fr2 = sdTaperedCapsule(x, y, z,
      -A.frontKnee[0], A.frontKnee[1], A.frontKnee[2],
      -A.frontAnkle[0], A.frontAnkle[1], A.frontAnkle[2], 0.066, 0.058);
    const frPaw = sdEllipsoid(x, y, z, -A.frontPaw[0], A.frontPaw[1], A.frontPaw[2], 0.076, 0.058, 0.094);
    const frToe = sdEllipsoid(x, y, z, -A.frontPaw[0], A.frontPaw[1] - 0.010, A.frontPaw[2] + 0.038, 0.062, 0.044, 0.050);
    let legFr = smin(fr, fr2, 0.03);
    legFr = smin(legFr, frPaw, 0.045);
    legFr = smin(legFr, frToe, 0.035);
    d = smin(d, legFr, 0.055);

    // ---- Hind legs (with feline haunches) -----------------------------------
    const blHaunch = sdEllipsoid(x, y, z, A.hindHip[0], A.hindHip[1], A.hindHip[2], 0.135, 0.175, 0.165);
    const bl = sdTaperedCapsule(x, y, z,
      A.hindHip[0], A.hindHip[1], A.hindHip[2],
      A.hindKnee[0], A.hindKnee[1], A.hindKnee[2], 0.085, 0.064);
    const bl2 = sdTaperedCapsule(x, y, z,
      A.hindKnee[0], A.hindKnee[1], A.hindKnee[2],
      A.hindAnkle[0], A.hindAnkle[1], A.hindAnkle[2], 0.064, 0.055);
    const blPaw = sdEllipsoid(x, y, z, A.hindPaw[0], A.hindPaw[1], A.hindPaw[2], 0.074, 0.057, 0.092);
    const blToe = sdEllipsoid(x, y, z, A.hindPaw[0], A.hindPaw[1] - 0.010, A.hindPaw[2] + 0.036, 0.060, 0.043, 0.048);
    let legB = smin(blHaunch, bl, 0.09);
    legB = smin(legB, bl2, 0.03);
    legB = smin(legB, blPaw, 0.045);
    legB = smin(legB, blToe, 0.035);
    d = smin(d, legB, 0.06);

    // Mirrored right hind leg
    const brHaunch = sdEllipsoid(x, y, z, -A.hindHip[0], A.hindHip[1], A.hindHip[2], 0.135, 0.175, 0.165);
    const br = sdTaperedCapsule(x, y, z,
      -A.hindHip[0], A.hindHip[1], A.hindHip[2],
      -A.hindKnee[0], A.hindKnee[1], A.hindKnee[2], 0.085, 0.064);
    const br2 = sdTaperedCapsule(x, y, z,
      -A.hindKnee[0], A.hindKnee[1], A.hindKnee[2],
      -A.hindAnkle[0], A.hindAnkle[1], A.hindAnkle[2], 0.064, 0.055);
    const brPaw = sdEllipsoid(x, y, z, -A.hindPaw[0], A.hindPaw[1], A.hindPaw[2], 0.074, 0.057, 0.092);
    const brToe = sdEllipsoid(x, y, z, -A.hindPaw[0], A.hindPaw[1] - 0.010, A.hindPaw[2] + 0.036, 0.060, 0.043, 0.048);
    let legBr = smin(brHaunch, br, 0.09);
    legBr = smin(legBr, br2, 0.03);
    legBr = smin(legBr, brPaw, 0.045);
    legBr = smin(legBr, brToe, 0.035);
    d = smin(d, legBr, 0.06);

    // ---- Tail: smooth tapered sweep rising into a question-mark curl --------
    let tail = sdSphere(x, y, z, TAIL[0][0], TAIL[0][1], TAIL[0][2], TAIL[0][3]);
    for (let i = 0; i < TAIL.length - 1; i++) {
      const a = TAIL[i], b = TAIL[i + 1];
      tail = smin(tail, sdTaperedCapsule(x, y, z, a[0], a[1], a[2], b[0], b[1], b[2], a[3], b[3]), 0.03);
    }
    d = smin(d, tail, 0.075);

    return d;
  };

  // ---- Cheap conservative lower bound for grid pruning ----------------------
  const BLOBS: [number, number, number, number][] = [
    [0, 0.45, -0.05, 0.44],   // torso
    [0, 0.82, 0.40, 0.44],    // head + muzzle
    [-0.19, 1.02, 0.36, 0.20],// left ear
    [0.19, 1.02, 0.36, 0.20], // right ear
    [-0.16, 0.28, 0.19, 0.26],// left foreleg
    [0.16, 0.28, 0.19, 0.26], // right foreleg
    [-0.19, 0.26, -0.22, 0.28],// left hindleg
    [0.19, 0.26, -0.22, 0.28],// right hindleg
    [0, 0.58, -0.58, 0.22],   // lower tail
    [0, 0.85, -0.74, 0.20],   // upper tail
    [0, 0.62, 0.30, 0.22]     // neck
  ];
  const lowerBound: SdfFn = (x, y, z) => {
    let best = Infinity;
    for (let i = 0; i < BLOBS.length; i++) {
      const b = BLOBS[i];
      const dx = x - b[0], dy = y - b[1], dz = z - b[2];
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz) - b[3];
      if (d < best) best = d;
    }
    return best;
  };

  const bounds = {
    minX: -0.50, minY: -0.03, minZ: -1.00,
    maxX: 0.50, maxY: 1.24, maxZ: 0.80
  };

  const anchors: CatAnatomyAnchors = {
    eyeL: { pos: eyeLpos, dir: eyeLdir },
    eyeR: { pos: eyeRpos, dir: eyeDirR },
    nose: { pos: noseSurf.clone().addScaledVector(noseDir, 0.006), dir: noseDir },
    mouthCenter: noseSurf.clone().add(new THREE.Vector3(0, -0.038, -0.012)),
    ears: [earL, earR],
    whiskerRoots
  };

  return { sdf, lowerBound, anchors, bounds };
}
