/**
 * SdfMath — Signed distance field primitives & smooth boolean operators.
 *
 * Used by the procedural cat sculpting pipeline (CatSdf -> SurfaceNets) to
 * generate ONE seamless, watertight organic mesh instead of a pile of
 * intersecting primitive shapes.
 *
 * All functions operate on plain numbers for maximum meshing throughput.
 */

import { Vector3 } from 'three';

export type SdfFn = (x: number, y: number, z: number) => number;

/** Polynomial smooth minimum (Inigo Quilez). k = blend radius. */
export function smin(a: number, b: number, k: number): number {
  if (k <= 0) return Math.min(a, b);
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}

/** Polynomial smooth maximum (smooth subtraction when used as smax(a, -b)). */
export function smax(a: number, b: number, k: number): number {
  if (k <= 0) return Math.max(a, b);
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.max(a, b) + h * h * k * 0.25;
}

export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/** Signed distance to an axis-aligned ellipsoid centered at (cx,cy,cz). */
export function sdEllipsoid(
  x: number, y: number, z: number,
  cx: number, cy: number, cz: number,
  rx: number, ry: number, rz: number
): number {
  const px = (x - cx) / rx;
  const py = (y - cy) / ry;
  const pz = (z - cz) / rz;
  const k0 = Math.sqrt(px * px + py * py + pz * pz);
  if (k0 < 1e-6) return -Math.min(rx, Math.min(ry, rz));
  const qx = px / rx;
  const qy = py / ry;
  const qz = pz / rz;
  const k1 = Math.sqrt(qx * qx + qy * qy + qz * qz);
  return (k0 * (k0 - 1.0)) / k1;
}

/**
 * Linearly tapered capsule (round cone approximation) from A to B.
 * radius rA at A, rB at B. Good enough for meshing (sign-exact, near-exact
 * metric along the axis).
 */
export function sdTaperedCapsule(
  x: number, y: number, z: number,
  ax: number, ay: number, az: number,
  bx: number, by: number, bz: number,
  ra: number, rb: number
): number {
  const bax = bx - ax, bay = by - ay, baz = bz - az;
  const pax = x - ax, pay = y - ay, paz = z - az;
  const baba = bax * bax + bay * bay + baz * baz;
  let h = baba > 1e-9 ? (pax * bax + pay * bay + paz * baz) / baba : 0;
  h = h < 0 ? 0 : h > 1 ? 1 : h;
  const dx = pax - bax * h;
  const dy = pay - bay * h;
  const dz = paz - baz * h;
  return Math.sqrt(dx * dx + dy * dy + dz * dz) - (ra + (rb - ra) * h);
}

/** Exact signed distance to a sphere. */
export function sdSphere(
  x: number, y: number, z: number,
  cx: number, cy: number, cz: number,
  r: number
): number {
  const dx = x - cx, dy = y - cy, dz = z - cz;
  return Math.sqrt(dx * dx + dy * dy + dz * dz) - r;
}

/**
 * Signed distance to a 2D triangle (IQ's robust version).
 * Used to sculpt cat-ear silhouettes.
 */
export function sdTriangle2D(
  px: number, py: number,
  ax: number, ay: number,
  bx: number, by: number,
  cx: number, cy: number
): number {
  const e0x = bx - ax, e0y = by - ay;
  const e1x = cx - bx, e1y = cy - by;
  const e2x = ax - cx, e2y = ay - cy;
  const v0x = px - ax, v0y = py - ay;
  const v1x = px - bx, v1y = py - by;
  const v2x = px - cx, v2y = py - cy;

  const dot0 = e0x * e0x + e0y * e0y;
  const dot1 = e1x * e1x + e1y * e1y;
  const dot2 = e2x * e2x + e2y * e2y;

  let q0x = v0x, q0y = v0y;
  if (dot0 > 1e-9) {
    const t = clamp((v0x * e0x + v0y * e0y) / dot0, 0, 1);
    q0x -= e0x * t; q0y -= e0y * t;
  }
  let q1x = v1x, q1y = v1y;
  if (dot1 > 1e-9) {
    const t = clamp((v1x * e1x + v1y * e1y) / dot1, 0, 1);
    q1x -= e1x * t; q1y -= e1y * t;
  }
  let q2x = v2x, q2y = v2y;
  if (dot2 > 1e-9) {
    const t = clamp((v2x * e2x + v2y * e2y) / dot2, 0, 1);
    q2x -= e2x * t; q2y -= e2y * t;
  }

  const d0 = q0x * q0x + q0y * q0y;
  const d1 = q1x * q1x + q1y * q1y;
  const d2 = q2x * q2x + q2y * q2y;
  const d = Math.min(d0, Math.min(d1, d2));

  // Inside/outside sign via edge cross products
  const s = Math.sign(e0x * e2y - e0y * e2x) || 1;
  const inside = (v0x * e0y - v0y * e0x) * s > 0 &&
                 (v1x * e1y - v1y * e1x) * s > 0 &&
                 (v2x * e2y - v2y * e2x) * s > 0;
  return Math.sqrt(d) * (inside ? -1 : 1);
}

/** Catmull-Rom sample helper: smooth interpolation through control points. */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1e-9), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Sphere-trace a ray until the field crosses zero.
 * Returns the surface point, or null when no surface is found.
 */
export function marchToSurface(
  sdf: SdfFn,
  ox: number, oy: number, oz: number,
  dx: number, dy: number, dz: number,
  maxDist = 2.0
): Vector3 | null {
  let t = 0.0;
  for (let i = 0; i < 64; i++) {
    const px = ox + dx * t;
    const py = oy + dy * t;
    const pz = oz + dz * t;
    const d = sdf(px, py, pz);
    if (d < 0.0008) return new Vector3(px, py, pz);
    t += Math.max(Math.abs(d) * 0.9, 0.002);
    if (t > maxDist) return null;
  }
  return null;
}
