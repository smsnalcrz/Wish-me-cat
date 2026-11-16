/**
 * CatRig — bone definitions, skeleton construction and automatic skinning.
 *
 * The body mesh is sculpted as a single surface (see CatSdf), so it needs a
 * real skeleton: every vertex receives smooth Gaussian skin weights derived
 * from its distance to each bone's bind-pose segment. The result deforms
 * without gaps — shoulders, hips, neck and tail stretch like real skin
 * instead of showing seams between detached parts.
 *
 * Hierarchy mirrors the attachment plan:
 *   CatRoot(CharacterModel)
 *     ├─ pelvis / chest / head / legs (skinned mesh follows these)
 *     │    ├─ earL, earR (ear twitch)
 *     │    ├─ eyes, nose, mouth, whiskers, collar (children of bones)
 *     │    └─ tail chain (tail1..tail4)
 *     └─ EquipmentSocket (fishing rod grip) — plain Object3D, never floats
 */

import * as THREE from 'three';

export interface BoneDef {
  name: string;
  parent: string | null;
  /** Bind-pose position in CatCharacter.group space */
  bind: [number, number, number];
  /** Gaussian falloff radius used for skin weighting */
  sigma: number;
  /** Weighting segment (defaults to bind → bind + small downward stub) */
  segA?: [number, number, number];
  segB?: [number, number, number];
  /** Ears get a crisp mask so they pivot from a defined base */
  ear?: boolean;
}

export const CAT_BONE_DEFS: BoneDef[] = [
  // Core body
  { name: 'pelvis', parent: null, bind: [0, 0.45, -0.10], sigma: 0.26, segB: [0, 0.45, -0.30] },
  { name: 'chest', parent: null, bind: [0, 0.44, 0.06], sigma: 0.30, segB: [0, 0.52, 0.24] },
  { name: 'head', parent: null, bind: [0, 0.62, 0.28], sigma: 0.30, segB: [0, 0.85, 0.42] },

  // Front legs (chain: hip → knee → ankle)
  { name: 'flUp', parent: null, bind: [0.155, 0.50, 0.170], sigma: 0.13, segB: [0.155, 0.315, 0.185] },
  { name: 'flLo', parent: 'flUp', bind: [0.155, 0.315, 0.185], sigma: 0.11, segB: [0.155, 0.115, 0.205] },
  { name: 'flPaw', parent: 'flLo', bind: [0.155, 0.115, 0.205], sigma: 0.09, segB: [0.155, 0.05, 0.245] },
  { name: 'frUp', parent: null, bind: [-0.155, 0.50, 0.170], sigma: 0.13, segB: [-0.155, 0.315, 0.185] },
  { name: 'frLo', parent: 'frUp', bind: [-0.155, 0.315, 0.185], sigma: 0.11, segB: [-0.155, 0.115, 0.205] },
  { name: 'frPaw', parent: 'frLo', bind: [-0.155, 0.115, 0.205], sigma: 0.09, segB: [-0.155, 0.05, 0.245] },

  // Hind legs (chain: hip → knee → ankle)
  { name: 'blUp', parent: null, bind: [0.185, 0.44, -0.250], sigma: 0.15, segB: [0.185, 0.275, -0.265] },
  { name: 'blLo', parent: 'blUp', bind: [0.185, 0.275, -0.265], sigma: 0.11, segB: [0.185, 0.115, -0.205] },
  { name: 'blPaw', parent: 'blLo', bind: [0.185, 0.115, -0.205], sigma: 0.09, segB: [0.185, 0.05, -0.160] },
  { name: 'brUp', parent: null, bind: [-0.185, 0.44, -0.250], sigma: 0.15, segB: [-0.185, 0.275, -0.265] },
  { name: 'brLo', parent: 'brUp', bind: [-0.185, 0.275, -0.265], sigma: 0.11, segB: [-0.185, 0.115, -0.205] },
  { name: 'brPaw', parent: 'brLo', bind: [-0.185, 0.115, -0.205], sigma: 0.09, segB: [-0.185, 0.05, -0.160] },

  // Tail chain (matches the sculpted tail curve in CatSdf)
  { name: 'tail1', parent: null, bind: [0, 0.49, -0.42], sigma: 0.10, segB: [0, 0.565, -0.565] },
  { name: 'tail2', parent: 'tail1', bind: [0, 0.565, -0.565], sigma: 0.09, segB: [0, 0.740, -0.715] },
  { name: 'tail3', parent: 'tail2', bind: [0, 0.740, -0.715], sigma: 0.08, segB: [0, 0.940, -0.725] },
  { name: 'tail4', parent: 'tail3', bind: [0, 0.940, -0.725], sigma: 0.07, segB: [0, 0.985, -0.690] },

  // Ears (positions are injected from the sculpted ear frames at build time)
  { name: 'earL', parent: 'head', bind: [-0.160, 0.950, 0.360], sigma: 0.075, ear: true },
  { name: 'earR', parent: 'head', bind: [0.160, 0.950, 0.360], sigma: 0.075, ear: true }
];

export interface BuiltRig {
  bones: Record<string, THREE.Bone>;
  order: THREE.Bone[];
  skeleton: THREE.Skeleton;
}

/** Build the skeleton under `root` (CatCharacter.group). */
export function buildSkeleton(root: THREE.Object3D, defs: BoneDef[]): BuiltRig {
  const bones: Record<string, THREE.Bone> = {};
  const order: THREE.Bone[] = [];

  for (const def of defs) {
    const bone = new THREE.Bone();
    bone.name = def.name;
    bones[def.name] = bone;
    order.push(bone);
  }

  for (const def of defs) {
    const bone = bones[def.name];
    const parent = def.parent ? bones[def.parent] : root;
    parent.add(bone);

    // Bind positions are authored in group space; convert to parent-local.
    const bindWorld = new THREE.Vector3(def.bind[0], def.bind[1], def.bind[2]);
    if (def.parent) {
      const parentDef = defs.find((d) => d.name === def.parent)!;
      const parentBind = new THREE.Vector3(parentDef.bind[0], parentDef.bind[1], parentDef.bind[2]);
      bone.position.copy(bindWorld.sub(parentBind));
    } else {
      bone.position.copy(bindWorld);
    }
    bone.updateMatrix();
  }

  root.updateMatrixWorld(true);
  const skeleton = new THREE.Skeleton(order);
  return { bones, order, skeleton };
}

// ---------------------------------------------------------------------------
// SKIN WEIGHTING
// ---------------------------------------------------------------------------
interface Segment {
  ax: number; ay: number; az: number;
  bx: number; by: number; bz: number;
  invLen2: number;
  sigma: number;
  sigma2: number;
  ear: boolean;
}

function segDist2(seg: Segment, px: number, py: number, pz: number): number {
  const bax = seg.bx - seg.ax;
  const bay = seg.by - seg.ay;
  const baz = seg.bz - seg.az;
  const pax = px - seg.ax;
  const pay = py - seg.ay;
  const paz = pz - seg.az;
  let h = (pax * bax + pay * bay + paz * baz) * seg.invLen2;
  h = h < 0 ? 0 : h > 1 ? 1 : h;
  const dx = pax - bax * h;
  const dy = pay - bay * h;
  const dz = paz - baz * h;
  return dx * dx + dy * dy + dz * dz;
}

/**
 * Compute skinIndex / skinWeight attributes for every mesh vertex.
 * Weights are Gaussian falloffs around bone segments, top-4 normalised, with
 * a crisp ear mask so ears pivot from a defined base without tearing.
 */
export function computeSkinWeights(
  positions: Float32Array,
  defs: BoneDef[]
): { skinIndex: Uint16Array; skinWeight: Float32Array } {
  const segs: Segment[] = defs.map((d) => {
    const a = d.segA ?? d.bind;
    const b = d.segB ?? [d.bind[0], d.bind[1] + 0.08, d.bind[2] + 0.02];
    const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
    return {
      ax: a[0], ay: a[1], az: a[2],
      bx: b[0], by: b[1], bz: b[2],
      invLen2: 1 / Math.max(dx * dx + dy * dy + dz * dz, 1e-9),
      sigma: d.sigma,
      sigma2: d.sigma * d.sigma,
      ear: !!d.ear
    };
  });

  const vertexCount = positions.length / 3;
  const skinIndex = new Uint16Array(vertexCount * 4);
  const skinWeight = new Float32Array(vertexCount * 4);

  const cand: { i: number; w: number; d2: number }[] = [];

  for (let v = 0; v < vertexCount; v++) {
    const px = positions[v * 3];
    const py = positions[v * 3 + 1];
    const pz = positions[v * 3 + 2];

    cand.length = 0;
    for (let s = 0; s < segs.length; s++) {
      const seg = segs[s];
      const d2 = segDist2(seg, px, py, pz);
      if (d2 > 9 * seg.sigma2) continue;
      const w = Math.exp(-d2 / seg.sigma2);
      if (w < 0.004) continue;
      cand.push({ i: s, w, d2 });
    }

    if (cand.length === 0) {
      // Fallback: bind to the nearest bone so no vertex is ever unskinned
      let bestS = 0;
      let bestD = Infinity;
      for (let s = 0; s < segs.length; s++) {
        const d2 = segDist2(segs[s], px, py, pz);
        if (d2 < bestD) { bestD = d2; bestS = s; }
      }
      skinIndex[v * 4] = bestS;
      skinWeight[v * 4] = 1;
      continue;
    }

    // Ear mask: hard-ish assignment near the ear, fading into the scalp
    for (let c = 0; c < cand.length; c++) {
      if (!segs[cand[c].i].ear) continue;
      const d = Math.sqrt(cand[c].d2);
      const mask = 1 - smooth(d, 0.062, 0.100);
      if (mask <= 0) continue;
      cand[c].w = Math.max(cand[c].w, mask);
      for (let o = 0; o < cand.length; o++) {
        if (o !== c && !segs[cand[o].i].ear) cand[o].w *= 1 - mask;
      }
    }

    cand.sort((a, b) => b.w - a.w);
    const count = Math.min(4, cand.length);
    let total = 0;
    for (let c = 0; c < count; c++) total += cand[c].w;
    if (total <= 0) { skinIndex[v * 4] = cand[0].i; skinWeight[v * 4] = 1; continue; }
    for (let c = 0; c < count; c++) {
      skinIndex[v * 4 + c] = cand[c].i;
      skinWeight[v * 4 + c] = cand[c].w / total;
    }
  }

  return { skinIndex, skinWeight };
}

function smooth(x: number, edge0: number, edge1: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0 || 1e-9)));
  return t * t * (3 - 2 * t);
}
