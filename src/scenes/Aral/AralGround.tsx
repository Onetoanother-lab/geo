import { memo, useMemo } from 'react';
import { mulberry32, range, saxaulPaths } from '../../lib/forest/generate';
import { rootSystem } from '../../lib/forest/roots';
import { SHIP, SHIP_MAST } from '../../components/visualizations/silhouettes';

/** Low on purpose: most of the frame is sky. The emptiness is the composition. */
const HORIZON = 575;

/** Perspective y for a 0..1 depth (0 = horizon, 1 = foreground). */
const depthY = (d: number) => HORIZON + Math.pow(d, 1.7) * (900 - HORIZON);

/** Salt-crust cracks in perspective: broken, irregular, never a lattice. */
function cracks(seed: number): string {
  const rng = mulberry32(seed);
  let d = '';
  const rows = 22;
  for (let r = 1; r <= rows; r++) {
    const y = depthY(r / rows);
    const yPrev = depthY((r - 1) / rows);
    const scale = 0.12 + (r / rows) * 1.25;
    const cell = range(rng, 46, 86) * scale + 14;
    // A horizontal crack in broken, wobbling stretches.
    let x = -30 + rng() * cell;
    while (x < 1640) {
      const len = cell * range(rng, 1.2, 3.4);
      if (rng() > 0.2) {
        d += `M${x.toFixed(1)},${(y + range(rng, -2.5, 2.5) * scale).toFixed(1)}`;
        for (let xx = x + cell * 0.5; xx < x + len; xx += cell * 0.5) d += `L${xx.toFixed(1)},${(y + range(rng, -3.5, 3.5) * scale).toFixed(1)}`;
      }
      x += len + cell * range(rng, 0.2, 1);
    }
    // Vertical cracks join the row above where they please.
    let vx = range(rng, -cell, cell * 0.5);
    while (vx < 1640) {
      vx += cell * range(rng, 0.6, 1.9);
      if (rng() < 0.72) {
        const x2 = vx + range(rng, -cell * 0.35, cell * 0.35);
        d += `M${vx.toFixed(1)},${y.toFixed(1)}L${((vx + x2) / 2 + range(rng, -5, 5) * scale).toFixed(1)},${((y + yPrev) / 2).toFixed(1)}L${x2.toFixed(1)},${yPrev.toFixed(1)}`;
      }
    }
  }
  return d;
}

/** Pale blotches of surface salt, flattened by perspective. */
function saltPatches(seed: number): string {
  const rng = mulberry32(seed);
  let d = '';
  for (let i = 0; i < 16; i++) {
    const depth = range(rng, 0.08, 0.95);
    const y = depthY(depth);
    const s = 0.2 + depth * 1.3;
    const rx = range(rng, 40, 150) * s;
    const ry = rx * range(rng, 0.05, 0.1);
    const cx = range(rng, 0, 1600);
    d += `M${(cx - rx).toFixed(1)},${y.toFixed(1)}a${rx.toFixed(1)},${ry.toFixed(1)} 0 1,1 ${(rx * 2).toFixed(1)},0a${rx.toFixed(1)},${ry.toFixed(1)} 0 1,1 ${(-rx * 2).toFixed(1)},0`;
  }
  return d;
}

export type Shrub = { id: number; x: number; y: number; s: number; stems: string; tufts: string; order: number; patch: number };

export function buildShrubs(seed = 8): Shrub[] {
  const rng = mulberry32(seed);
  const patches = [
    { x: 260, d: 0.82, n: 9 },
    { x: 560, d: 0.62, n: 8 },
    { x: 1230, d: 0.86, n: 10 },
    { x: 830, d: 0.4, n: 7 },
    { x: 1420, d: 0.55, n: 7 },
    { x: 120, d: 0.45, n: 6 },
    { x: 1020, d: 0.25, n: 6 },
    { x: 380, d: 0.2, n: 5 },
    { x: 1500, d: 0.18, n: 5 },
    { x: 690, d: 0.95, n: 6 },
  ];
  const out: Shrub[] = [];
  let id = 0;
  patches.forEach((p, pi) => {
    for (let i = 0; i < p.n; i++) {
      const depth = Math.min(1, Math.max(0.08, p.d + range(rng, -0.08, 0.08)));
      const y = depthY(depth);
      const s = 0.25 + depth * 1.35;
      const x = p.x + range(rng, -130, 130) * s * 0.7;
      const { stems, tufts } = saxaulPaths(60 * s, 70 * s, rng);
      out.push({ id: id++, x, y, s, stems, tufts, order: pi / patches.length + rng() * 0.08, patch: pi });
    }
  });
  return out.sort((a, b) => a.y - b.y);
}

/** Ground-level Aralkum: salt crust, a stranded ship, planted saxaul patches. */
export const AralGround = memo(function AralGround({ shrubs }: { shrubs: Shrub[] }) {
  const crackPath = useMemo(() => cracks(31), []);
  const salt = useMemo(() => saltPatches(44), []);
  // One dead stalk, cropped by the corner, is the only dark thing in the frame: it gives the emptiness its scale.
  const stalks = useMemo(() => {
    const widths = [9, 5, 2.6, 1.4];
    const a = rootSystem(70, 930, 17, { length: 430, depth: 3, spread: 0.55, up: true });
    const b = rootSystem(1545, 930, 23, { length: 250, depth: 3, spread: 0.5, up: true });
    return [a, b].flatMap((sys, k) => sys.segments.map((seg, i) => ({ key: `${k}-${i}`, d: seg.d, w: widths[seg.depth] ?? 1.2 })));
  }, []);
  const patches = useMemo(() => {
    const byPatch = new Map<number, Shrub[]>();
    shrubs.forEach((s) => byPatch.set(s.patch, [...(byPatch.get(s.patch) ?? []), s]));
    return [...byPatch.entries()].map(([patch, list]) => {
      const xs = list.map((s) => s.x);
      const cy = list.reduce((a, s) => a + s.y, 0) / list.length;
      const sc = list[0].s;
      return { patch, cx: (Math.min(...xs) + Math.max(...xs)) / 2, cy, rx: (Math.max(...xs) - Math.min(...xs)) / 2 + 60 * sc, ry: 16 * sc };
    });
  }, [shrubs]);

  return (
    <svg className="ar-ground-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="ar-ground-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cdbb95" />
          <stop offset="0.4" stopColor="#d9cbaa" />
          <stop offset="1" stopColor="#bfa983" />
        </linearGradient>
      </defs>
      <rect x="0" y={HORIZON} width="1600" height={900 - HORIZON} fill="url(#ar-ground-g)" />
      <path d={`M0,${HORIZON}L1600,${HORIZON}`} className="ar-horizon" />
      <path d={salt} className="ar-salt" />
      <path d={crackPath} className="ar-cracks" />
      <g className="ar-patches">
        {patches.map((p) => (
          <ellipse key={p.patch} className="ar-patch" data-patch={p.patch} cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry} />
        ))}
      </g>
      <ellipse className="ar-ship-shadow" cx="1005" cy="668" rx="150" ry="5" />
      <g className="ar-ship" transform="translate(1085 612) rotate(-6 110 70) scale(0.62)">
        <path d={SHIP} />
        <path d={SHIP_MAST} className="ar-ship-mast" />
        <path d="M30,60L44,60M150,58L176,58M90,64L120,63" className="ar-ship-rust" />
      </g>
      <path d="M1040,664Q1120,652 1215,662L1226,672L1030,676Z" className="ar-sand-mound" />
      <g className="ar-stalks">
        {stalks.map((s) => <path key={s.key} d={s.d} strokeWidth={s.w} />)}
      </g>
      <g className="ar-shrubs">
        {shrubs.map((s) => (
          <g key={s.id} className="ar-shrub" data-id={s.id} transform={`translate(${s.x.toFixed(1)} ${s.y.toFixed(1)})`}>
            <g className="ar-shrub-body">
              <path d={s.stems} className="ar-stems" />
              <path d={s.tufts} className="ar-tufts" />
            </g>
          </g>
        ))}
      </g>
    </svg>
  );
});
