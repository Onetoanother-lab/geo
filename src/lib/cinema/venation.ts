import { mulberry32, range, smoothClosed } from '../forest/generate';

const r1 = (n: number) => Math.round(n * 10) / 10;

export type Venation = {
  outline: string;
  /** The central vein, base to tip. */
  midrib: string;
  /** Major veins, one path per vein, sorted base to tip. */
  secondary: string[];
  /** Fine veins and cross-links, merged into one path. */
  tertiary: string;
  length: number;
};

/**
 * A leaf's vein network in local coordinates: base at (0,0), tip at (0,-length).
 * The same topology is read as a river basin (stem, tributaries, streams) once the
 * camera pulls out, so it is drawn to look like both: a midrib, paired veins that arc
 * toward the margin, and a net of fine veins between them.
 */
export function leafVenation(length: number, seed = 5, pairs = 10): Venation {
  const rng = mulberry32(seed);
  const maxHalf = length * 0.31;
  const half = (t: number) => maxHalf * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.72)), 0.85) * (1 - 0.12 * t);
  const bend = (t: number) => Math.sin(t * Math.PI) * length * 0.025;
  const spineX = (t: number) => bend(t);
  const spineY = (t: number) => -t * length;

  const outlinePts: [number, number][] = [];
  const steps = 18;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    outlinePts.push([r1(spineX(t) + half(t) * (1 + range(rng, -0.025, 0.025))), r1(spineY(t))]);
  }
  for (let i = steps - 1; i >= 1; i--) {
    const t = i / steps;
    outlinePts.push([r1(spineX(t) - half(t) * (1 + range(rng, -0.025, 0.025))), r1(spineY(t))]);
  }
  const outline = smoothClosed(outlinePts, 0.5);

  let midrib = `M${r1(spineX(0))},0`;
  for (let i = 1; i <= 6; i++) midrib += `L${r1(spineX(i / 6 * 0.97))},${r1(spineY((i / 6) * 0.97))}`;

  const secondary: string[] = [];
  let tertiary = '';
  const veinPoints: { side: number; pts: [number, number][] }[] = [];
  for (let i = 0; i < pairs; i++) {
    const t0 = 0.07 + (i / pairs) * 0.8;
    for (const side of [-1, 1]) {
      const tt = t0 + (side === 1 ? 0 : 0.02) + range(rng, -0.014, 0.014);
      const sx = spineX(tt);
      const sy = spineY(tt);
      const reach = half(Math.min(0.97, tt + 0.16)) * range(rng, 0.84, 0.98);
      const rise = length * range(rng, 0.09, 0.19);
      const ex = sx + side * reach;
      const ey = sy - rise;
      // A cubic arc that leaves the midrib flat and bends toward the tip: no hooked ends.
      const c1x = sx + side * reach * range(rng, 0.3, 0.46);
      const c1y = sy - rise * range(rng, -0.04, 0.1);
      const c2x = sx + side * reach * range(rng, 0.78, 0.9);
      const c2y = sy - rise * range(rng, 0.34, 0.56);
      secondary.push(`M${r1(sx)},${r1(sy)}C${r1(c1x)},${r1(c1y)} ${r1(c2x)},${r1(c2y)} ${r1(ex)},${r1(ey)}`);
      const pts: [number, number][] = [];
      for (let k = 0; k <= 8; k++) {
        const u = k / 8;
        const m = 1 - u;
        pts.push([m * m * m * sx + 3 * m * m * u * c1x + 3 * m * u * u * c2x + u * u * u * ex, m * m * m * sy + 3 * m * m * u * c1y + 3 * m * u * u * c2y + u * u * u * ey]);
      }
      veinPoints.push({ side, pts });
      // Fine veins leave the vein at about 60 degrees, alternating to either side of it.
      for (let k = 1; k < 8; k++) {
        const [px, py] = pts[k];
        const [ox, oy] = pts[k - 1];
        const [qx, qy] = pts[k + 1];
        const tx = qx - ox;
        const ty = qy - oy;
        const tl = Math.hypot(tx, ty) || 1;
        const ux = tx / tl;
        const uy = ty / tl;
        const sgn = k % 2 === 0 ? 1 : -1;
        const a = range(rng, 0.9, 1.15);
        const len = length * range(rng, 0.02, 0.05);
        const x2 = px + (ux * Math.cos(a) - uy * Math.sin(a) * sgn) * len;
        const y2 = py + (uy * Math.cos(a) + ux * Math.sin(a) * sgn) * len;
        tertiary += `M${r1(px)},${r1(py)}L${r1(x2)},${r1(y2)}`;
      }
    }
  }
  // Cross-links between neighbouring veins close the net.
  for (let s = 0; s < veinPoints.length - 2; s++) {
    const a = veinPoints[s];
    const b = veinPoints[s + 2];
    if (a.side !== b.side) continue;
    for (const k of [3, 5, 7]) {
      const [ax, ay] = a.pts[k];
      const [bx, by] = b.pts[k - 1];
      tertiary += `M${r1(ax)},${r1(ay)}Q${r1((ax + bx) / 2 + range(rng, -3, 3))},${r1((ay + by) / 2 + range(rng, -3, 3))} ${r1(bx)},${r1(by)}`;
    }
  }
  return { outline, midrib, secondary, tertiary, length };
}
