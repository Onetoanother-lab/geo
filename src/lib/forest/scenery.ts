import { mulberry32, range, smoothClosed } from './generate';

const r1 = (n: number) => Math.round(n * 10) / 10;

/** Light falls from the upper right: shafts lean left as they descend (px of x per px of y). */
export const SHAFT_SLOPE = -0.29;

/** Tapered grass blades plus the soil strip under them (merged into one path). */
export function grassBlades(seed: number, baseY: number, count: number, minH: number, maxH: number, strip = true): string {
  const rng = mulberry32(seed);
  let d = '';
  for (let i = 0; i < count; i++) {
    const x = range(rng, -40, 1640);
    const h = range(rng, minH, maxH);
    const lean = range(rng, -0.4, 0.34);
    const w = range(rng, 4, 11);
    const y = baseY + range(rng, -6, 14);
    d += `M${r1(x - w / 2)},${r1(y)}Q${r1(x + lean * h * 0.35)},${r1(y - h * 0.62)} ${r1(x + lean * h)},${r1(y - h)}Q${r1(x + lean * h * 0.35 + w * 0.5)},${r1(y - h * 0.46)} ${r1(x + w / 2)},${r1(y)}Z`;
  }
  return strip ? d + `M-40,${baseY + 6}L1640,${baseY + 6}L1640,930L-40,930Z` : d;
}

export type TrunkArt = { body: string; bark: string; rim: string };

/**
 * A cropped foreground trunk: tapered body, root flare, bark furrows and a broken rim-light
 * stripe on the side that faces the sun. It may extend beyond the frame on purpose.
 */
export function trunkArt(seed: number, x: number, width: number, top = -40, bottom = 930): TrunkArt {
  const rng = mulberry32(seed);
  const samples = 18;
  const phase = range(rng, 0, 6);
  const sway = (t: number) => Math.sin(t * 3.1 + phase) * width * 0.08 + range(rng, -1.2, 1.2);
  const half = (t: number) => (width / 2) * (1 - 0.18 * t) * (1 + Math.max(0, 0.12 - t) * 5);
  const ys = Array.from({ length: samples + 1 }, (_, i) => bottom + ((top - bottom) * i) / samples);
  const centre = ys.map((_, i) => x + sway(i / samples));
  const left = ys.map((y, i) => `${r1(centre[i] - half(i / samples))},${r1(y)}`);
  const right = ys.map((y, i) => `${r1(centre[i] + half(i / samples))},${r1(y)}`);
  const body = `M${left.join('L')}L${right.reverse().join('L')}Z`;

  let bark = '';
  const furrows = Math.max(3, Math.round(width / 26));
  for (let k = 0; k < furrows; k++) {
    const u = range(rng, -0.8, 0.8);
    const off = range(rng, -3, 3);
    const from = Math.floor(range(rng, 0, samples * 0.35));
    const to = Math.floor(range(rng, samples * 0.55, samples));
    let line = '';
    for (let i = from; i <= to; i++) {
      const t = i / samples;
      const px = centre[i] + u * half(t) + off + range(rng, -1.6, 1.6);
      line += `${line ? 'L' : 'M'}${r1(px)},${r1(ys[i])}`;
    }
    bark += line;
  }

  // Rim light: a few long, smoothly tapering strips on the sun side, never a ragged edge.
  let rim = '';
  const strips = 5;
  for (let k = 0; k < strips; k++) {
    if (rng() < 0.25) continue;
    const i0 = Math.floor((k / strips) * samples);
    const i1 = Math.floor(((k + 1) / strips) * samples) - 1;
    const wMax = range(rng, 5, 10) * (1 - (k / strips) * 0.4);
    const edge: string[] = [];
    const inner: string[] = [];
    for (let i = i0; i <= i1; i++) {
      const u = (i - i0) / Math.max(1, i1 - i0);
      const w = wMax * Math.sin(Math.PI * u) ** 0.7;
      const t = i / samples;
      edge.push(`${r1(centre[i] + half(t))},${r1(ys[i])}`);
      inner.unshift(`${r1(centre[i] + half(t) - w)},${r1(ys[i])}`);
    }
    rim += `M${edge.join('L')}L${inner.join('L')}Z`;
  }
  return { body, bark, rim };
}

export type Shaft = { x: number; w: number; strength: number };

export type ShaftShape = { d: string; x0: number; x1: number; top: number; strength: number };
export type Pool = { cx: number; cy: number; rx: number; ry: number; strength: number };

/**
 * Light shafts as parallelograms leaning with `SHAFT_SLOPE`. Each is filled with a gradient that is
 * sheared the same way (see `shaftShear`), so its edges feather without a blur filter.
 * Also returns where each shaft lands on the ground and the bands the dust is allowed in.
 */
export function shaftGeometry(shafts: Shaft[], top = -80, bottom = 900, poolY = 838): { shapes: ShaftShape[]; pools: Pool[]; bands: { x: number; w: number; strength: number }[] } {
  const shapes: ShaftShape[] = [];
  const pools: Pool[] = [];
  const bands: { x: number; w: number; strength: number }[] = [];
  const run = bottom - top;
  for (const s of shafts) {
    const dx = SHAFT_SLOPE * run;
    shapes.push({ d: `M${r1(s.x)},${top}L${r1(s.x + s.w)},${top}L${r1(s.x + s.w + dx)},${bottom}L${r1(s.x + dx)},${bottom}Z`, x0: s.x, x1: s.x + s.w, top, strength: s.strength });
    pools.push({ cx: r1(s.x + s.w / 2 + SHAFT_SLOPE * (poolY - top)), cy: poolY, rx: s.w * 1.3, ry: 22 + s.w * 0.12, strength: s.strength });
    bands.push({ x: s.x + s.w / 2, w: s.w, strength: s.strength });
  }
  return { shapes, pools, bands };
}

/** gradientTransform that makes a horizontal gradient run parallel to a shaft's leaning edges. */
export const shaftShear = (top: number) => `matrix(1 0 ${SHAFT_SLOPE} 1 ${r1(-SHAFT_SLOPE * top)} 0)`;

/** Irregular patches of exposed ground, to appear as the forest thins. */
export function barePatches(seed: number, count: number): string {
  const rng = mulberry32(seed);
  let d = '';
  for (let i = 0; i < count; i++) {
    const cx = range(rng, 60, 1540);
    const cy = range(rng, 700, 880);
    const rx = range(rng, 70, 190) * (0.7 + (cy - 700) / 260);
    const ry = rx * range(rng, 0.1, 0.17);
    const pts: [number, number][] = Array.from({ length: 9 }, (_, k) => {
      const a = (k / 9) * Math.PI * 2;
      const j = range(rng, 0.72, 1.18);
      return [r1(cx + Math.cos(a) * rx * j), r1(cy + Math.sin(a) * ry * j)];
    });
    d += smoothClosed(pts);
  }
  return d;
}
