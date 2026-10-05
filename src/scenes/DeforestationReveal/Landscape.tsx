import { memo, useId, useMemo } from 'react';
import { broadleafPath, coniferPath, generateLayer, mergeLayer, mulberry32, overhangBranch, range, ridgePath, stumpPath } from '../../lib/forest/generate';
import { DEER, DEER_ANTLERS, butterfly } from '../../components/visualizations/silhouettes';
import { barePatches, grassBlades, shaftGeometry, shaftShear, trunkArt } from '../../lib/forest/scenery';

/** Sun from the upper right; as the canopy goes the shafts stop being filtered and start being glare. */
const SHAFTS = [
  { x: 150, w: 130, strength: 0.6 },
  { x: 640, w: 210, strength: 0.9 },
  { x: 1120, w: 160, strength: 0.7 },
];

/** Smooth meandering river centreline (far → near). */
export function riverX(y: number): number {
  const t = y - 470;
  return 880 + t * 0.5 + Math.sin(t / 62) * (16 + t * 0.22);
}
const riverWidth = (y: number) => 6 + ((y - 470) / 450) * 70;

function riverPath(): string {
  const left: string[] = [];
  const right: string[] = [];
  for (let y = 470; y <= 920; y += 10) {
    const x = riverX(y);
    const w = riverWidth(y) / 2;
    left.push(`${(x - w).toFixed(1)},${y}`);
    right.push(`${(x + w).toFixed(1)},${y}`);
  }
  return `M${left.join('L')}L${right.reverse().join('L')}Z`;
}

export type LandscapeTree = { id: number; x: number; y: number; h: number; d: string; stump: string; order: number; lean: number; depth: number; soilW: number; soilDx: number };

export function buildTrees(seed = 42): LandscapeTree[] {
  const rng = mulberry32(seed);
  const trees: LandscapeTree[] = [];
  let id = 0;
  for (let row = 0; row < 13; row++) {
    const y = 545 + row * 27 + range(rng, -6, 6);
    const t = (y - 540) / 360;
    const h = 52 + t * 230;
    const step = 46 + t * 82;
    for (let x = -40 + range(rng, 0, step); x < 1640; x += step * range(rng, 0.75, 1.25)) {
      if (Math.abs(x - riverX(y)) < riverWidth(y) / 2 + h * 0.18 + 10) continue;
      const kind = rng() < 0.55 ? 'conifer' : 'broadleaf';
      const w = h * (kind === 'conifer' ? range(rng, 0.3, 0.4) : range(rng, 0.55, 0.7));
      const d = kind === 'conifer' ? coniferPath(h, w, rng) : broadleafPath(h, w, rng);
      // Clearing advances from the left edge (a frontier), with patchy noise.
      const order = Math.min(0.999, Math.max(0, (x / 1600) * 0.72 + rng() * 0.26 + (1 - t) * 0.02));
      trees.push({ id: id++, x, y, h, d, stump: stumpPath(w, rng), order, lean: rng() < 0.5 ? -1 : 1, depth: t, soilW: range(rng, 0.28, 0.5), soilDx: range(rng, -0.2, 0.2) });
    }
  }
  return trees.sort((a, b) => a.y - b.y);
}

const BIRDS = Array.from({ length: 9 }, (_, i) => ({ x: 380 + (i % 5) * 70 + (i > 4 ? 35 : 0), y: 170 + (i > 4 ? 40 : 0) + (i % 2) * 14 }));

/** The landscape whose systems transform together as `--life` and the timeline advance. */
export const Landscape = memo(function Landscape({ trees }: { trees: LandscapeTree[] }) {
  const static_ = useMemo(() => {
    const far = mergeLayer(generateLayer({ seed: 301, count: 90, baseY: 470, baseJitter: 26, minH: 26, maxH: 60, mix: { conifer: 0.75, broadleaf: 0.25 } }));
    const rng = mulberry32(9);
    const gullies = Array.from({ length: 9 }, (_, i) => {
      const x = 60 + i * 95 + range(rng, -20, 20);
      const y0 = 600 + range(rng, -20, 30);
      let d = `M${x.toFixed(1)},${y0.toFixed(1)}`;
      let cx = x;
      for (let y = y0 + 30; y < 900; y += 30) {
        cx += range(rng, -16, 22);
        d += `L${cx.toFixed(1)},${y}`;
      }
      return d;
    });
    const runoff = Array.from({ length: 10 }, (_, i) => {
      const y = 600 + i * 28;
      const x = 120 + i * 60;
      const rx = riverX(y + 30) - riverWidth(y + 30) / 2;
      return `M${x},${y}Q${(x + rx) / 2},${y + 34} ${rx.toFixed(1)},${(y + 30).toFixed(1)}`;
    });
    const farMid = mergeLayer(generateLayer({ seed: 302, count: 70, baseY: 492, baseJitter: 22, minH: 44, maxH: 96, mix: { conifer: 0.7, broadleaf: 0.3 }, clump: 0.5, lean: 4 }));
    return {
      far, farMid, river: riverPath(), farRidge: ridgePath(17, 470, 22), nearGround: ridgePath(23, 540, 10), gullies, runoff,
      bare: barePatches(36, 10),
      grass: grassBlades(35, 905, 90, 22, 84, false),
      trunks: [trunkArt(31, 26, 250), trunkArt(32, 1596, 310)],
      branchA: overhangBranch(33, -90, 70, 1, 600, 150),
      branchB: overhangBranch(34, 1700, 30, -1, 520, 120),
      light: shaftGeometry(SHAFTS, -80, 900, 840),
    };
  }, []);
  const uid = useId().replace(/:/g, '');

  return (
    <svg className="dr-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        {static_.light.shapes.map((s, i) => (
          <linearGradient key={i} id={`${uid}-sh${i}`} gradientUnits="userSpaceOnUse" x1={s.x0} y1={s.top} x2={s.x1} y2={s.top} gradientTransform={shaftShear(s.top)}>
            {[[0, 0], [0.2, 0.3], [0.5, 0.55], [0.8, 0.3], [1, 0]].map(([offset, alpha]) => <stop key={offset} offset={offset} style={{ stopColor: 'var(--light-warmth)', stopOpacity: alpha }} />)}
          </linearGradient>
        ))}
        <linearGradient id="dr-plume" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8b6a45" stopOpacity="0" />
          <stop offset="1" stopColor="#8b6a45" stopOpacity="0.95" />
        </linearGradient>
      </defs>
      <path d={static_.farRidge} className="dr-far-ground" />
      <path d={static_.far} className="dr-far-forest" />
      <path d={static_.farMid} className="dr-far-forest dr-far-forest--mid" />
      <path d={static_.nearGround} className="dr-ground" />
      <path d={static_.bare} className="dr-bare" />
      <path d={static_.river} className="dr-river" />
      <path d="M892,510l12,1M945,612l22,2M916,735l38,3M1110,845l46,2" className="dr-watershine" />
      <path d={static_.river} className="dr-plume" fill="url(#dr-plume)" />
      <g className="dr-gullies">
        {static_.gullies.map((d, i) => (
          <path key={i} d={d} className="dr-gully" />
        ))}
      </g>
      <g className="dr-runoff">
        {static_.runoff.map((d, i) => (
          <path key={i} d={d} className="dr-runoff-path" />
        ))}
      </g>
      <g className="dr-shafts">
        {static_.light.shapes.map((s, i) => <path key={i} d={s.d} fill={`url(#${uid}-sh${i})`} style={{ opacity: s.strength }} />)}
      </g>
      <g className="dr-trees">
        {trees.map((t) => (
          <g key={t.id} className="dr-tree" data-id={t.id} transform={`translate(${t.x.toFixed(1)} ${t.y.toFixed(1)})`}>
            <ellipse className="dr-shadow" cx={-t.h * .2} cy="6" rx={t.h * .32} ry={t.h * .06} />
            <ellipse className="dr-soil" cx={t.h * t.soilDx} cy="2" rx={t.h * t.soilW * 0.55} ry={t.h * 0.04} />
            <path className="dr-stump" d={t.stump} />
            <g className="dr-crown">
              <path d={t.d} style={{ fill: `color-mix(in oklab, color-mix(in oklab, var(--tree-farmid) ${Math.round((1 - t.depth) * 78)}%, var(--tree-near)) ${t.id % 3 === 0 ? 88 : 100}%, var(--canopy-light))` }} />
            </g>
          </g>
        ))}
      </g>
      <g className="dr-wildlife">
        <g className="dr-deer" transform="translate(330 640) scale(1.25)">
          <path d={DEER} />
          <path d={DEER_ANTLERS} className="dr-antlers" />
        </g>
        <g className="dr-deer" transform="translate(1260 700) scale(-1.1 1.1)">
          <path d={DEER} />
        </g>
        <path className="dr-butterflies" d={butterfly(210, 780, 1.6) + butterfly(250, 760, 1.2) + butterfly(1350, 800, 1.4)} />
        {BIRDS.map((b, i) => (
          <path key={i} className="dr-bird" d={`M${b.x - 9},${b.y}Q${b.x - 4},${b.y - 7} ${b.x},${b.y}Q${b.x + 4},${b.y - 7} ${b.x + 9},${b.y}`} />
        ))}
      </g>
      {/* Foreground: it is the first thing a clearing takes from the frame. */}
      <path d={static_.grass} className="dr-grass" />
      <g className="dr-trunks">
        {static_.trunks.map((t, i) => (
          <g key={i}>
            <path d={t.body} className="dr-trunk" />
            <path d={t.bark} className="dr-bark" />
            <path d={t.rim} className="dr-rim" />
          </g>
        ))}
      </g>
      <g className="dr-branch">
        <path d={static_.branchA.limb} />
        <path d={static_.branchA.twigs} className="dr-twigs" />
        <path d={static_.branchA.leaves} />
        <path d={static_.branchB.limb} />
        <path d={static_.branchB.twigs} className="dr-twigs" />
        <path d={static_.branchB.leaves} />
      </g>

    </svg>
  );
});
