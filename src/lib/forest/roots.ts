import { mulberry32, range, type Rng } from './generate';

export type RootSegment = { d: string; depth: number };
export type RootSystem = { segments: RootSegment[]; tips: [number, number][] };

/**
 * Recursive root/branch system. Angles in radians, 0 = straight down for roots
 * (use `up` for branches). Deterministic per seed.
 */
export function rootSystem(x: number, y: number, seed: number, opts: { length: number; depth?: number; spread?: number; up?: boolean } ): RootSystem {
  const rng = mulberry32(seed);
  const segments: RootSegment[] = [];
  const tips: [number, number][] = [];
  const maxDepth = opts.depth ?? 4;
  const spread = opts.spread ?? 1;
  const dir = opts.up ? -1 : 1;

  const grow = (px: number, py: number, angle: number, len: number, depth: number, r: Rng) => {
    const nx = px + Math.sin(angle) * len;
    const ny = py + Math.cos(angle) * len * dir;
    const bend = range(r, -0.35, 0.35) * len;
    const cx = (px + nx) / 2 + Math.cos(angle) * bend;
    const cy = (py + ny) / 2;
    segments.push({ d: `M${px.toFixed(1)},${py.toFixed(1)}Q${cx.toFixed(1)},${cy.toFixed(1)} ${nx.toFixed(1)},${ny.toFixed(1)}`, depth });
    if (depth >= maxDepth) {
      tips.push([nx, ny]);
      return;
    }
    const kids = depth === 0 ? 5 : 2 + Math.floor(r() * 2);
    for (let i = 0; i < kids; i++) {
      const t = kids === 1 ? 0 : i / (kids - 1) - 0.5;
      const a = angle + t * (depth === 0 ? 2.6 : 1.1) * spread + range(r, -0.25, 0.25);
      grow(nx, ny, a, len * range(r, 0.55, 0.78), depth + 1, r);
    }
  };
  grow(x, y, 0, opts.length * 0.35, 0, rng);
  return { segments, tips };
}
