import { memo, useId, useMemo } from 'react';
import { broadleafPath, coniferPath, generateLayer, mergeLayer, mulberry32, translatePath, range, ridgePath } from '../../lib/forest/generate';
import { rootSystem } from '../../lib/forest/roots';
import { NARRATIVE } from '../../content/narrative';
import { BIRD_PERCHED, DEER, DEER_ANTLERS, FOX, HARE, OWL, butterfly, mushroom } from '../../components/visualizations/silhouettes';
import { grassBlades, shaftGeometry, shaftShear } from '../../lib/forest/scenery';

export type Topic = 'tree' | 'roots' | 'soil' | 'water' | 'wildlife' | 'air';

export const HOTSPOTS: { id: Topic; x: number; y: number }[] = [
  { id: 'air', x: 960, y: 70 },
  { id: 'tree', x: 700, y: 235 },
  { id: 'wildlife', x: 452, y: 392 },
  { id: 'soil', x: 300, y: 530 },
  { id: 'roots', x: 640, y: 640 },
  { id: 'water', x: 1440, y: 455 },
];

export const GROUND = 470;
const TAG = NARRATIVE.system.tags;

/** Where the sun comes through the canopy; the dust field uses the same bands. */
export const LS_SHAFTS = [
  { x: 330, w: 140, strength: 0.75 },
  { x: 740, w: 220, strength: 1 },
  { x: 1180, w: 120, strength: 0.6 },
];
const SHAFT_TOP = -60;
/** The same shafts as bands, for the dust that drifts only inside them. */
export const LS_BANDS = shaftGeometry(LS_SHAFTS, SHAFT_TOP, GROUND, GROUND - 8).bands;

/** Roots drawn as one path per depth (tapering stroke widths), so a whole tree is a handful of nodes. */
function rootPaths(seed: number, x: number, opts: { length: number; depth: number; spread?: number }) {
  const sys = rootSystem(x, GROUND + 6, seed, opts);
  const byDepth = new Map<number, string>();
  for (const s of sys.segments) byDepth.set(s.depth, (byDepth.get(s.depth) ?? '') + s.d);
  return { tips: sys.tips, depths: [...byDepth.entries()].sort((a, b) => a[0] - b[0]) };
}

const rootWidth = (depth: number) => [17, 10, 5.6, 3, 1.7][depth] ?? 1.2;

/** The cross-section ecosystem (above and below ground) with one overlay per topic. */
export const Diorama = memo(function Diorama() {
  const uid = useId().replace(/:/g, '');
  const light = useMemo(() => shaftGeometry(LS_SHAFTS, SHAFT_TOP, GROUND, GROUND - 8), []);
  const art = useMemo(() => {
    const rng = mulberry32(2024);
    const deep = mergeLayer(generateLayer({ seed: 77, count: 58, baseY: GROUND - 40, baseJitter: 10, minH: 70, maxH: 150, mix: { conifer: 0.82, broadleaf: 0.18 }, clump: 0.5, lean: 4 }));
    const farMid = mergeLayer(generateLayer({ seed: 78, count: 36, baseY: GROUND - 14, baseJitter: 12, minH: 120, maxH: 230, mix: { conifer: 0.62, broadleaf: 0.38 }, clump: 0.55, lean: 5 }));
    const oak = translatePath(broadleafPath(420, 440, rng), 700, GROUND);
    const pine = translatePath(coniferPath(360, 150, rng), 1110, GROUND);
    const small = translatePath(broadleafPath(230, 220, rng), 300, GROUND);
    const roots = [
      rootPaths(5, 700, { length: 330, depth: 4 }),
      rootPaths(9, 1110, { length: 210, depth: 3, spread: 0.8 }),
      rootPaths(13, 300, { length: 170, depth: 3 }),
    ];
    // Mycorrhizal threads: connect tips across trees.
    const threads: string[] = [];
    const [a, b, c] = roots.map((r) => r.tips);
    const link = (p: [number, number], q: [number, number]) => {
      const mx = (p[0] + q[0]) / 2;
      const my = Math.max(p[1], q[1]) + range(rng, 10, 50);
      threads.push(`M${p[0].toFixed(1)},${p[1].toFixed(1)}Q${mx.toFixed(1)},${my.toFixed(1)} ${q[0].toFixed(1)},${q[1].toFixed(1)}`);
    };
    for (let i = 0; i < 7; i++) link(a[Math.floor(rng() * a.length)], b[Math.floor(rng() * b.length)]);
    for (let i = 0; i < 5; i++) link(a[Math.floor(rng() * a.length)], c[Math.floor(rng() * c.length)]);
    const shrubs = Array.from({ length: 22 }, () => {
      const x = range(rng, 20, 1300);
      const s = range(rng, 14, 34);
      return `M${(x - s).toFixed(1)},${GROUND}a${s},${(s * 0.8).toFixed(1)} 0 1,1 ${(s * 2).toFixed(1)},0Z`;
    }).join('');
    const pebbles = Array.from({ length: 70 }, () => {
      const x = range(rng, 0, 1600);
      const y = range(rng, GROUND + 80, 880);
      const r = range(rng, 2, 8);
      return `M${(x - r).toFixed(1)},${y.toFixed(1)}a${r.toFixed(1)},${(r * 0.7).toFixed(1)} 0 1,1 ${(r * 2).toFixed(1)},0a${r.toFixed(1)},${(r * 0.7).toFixed(1)} 0 1,1 ${(-r * 2).toFixed(1)},0`;
    }).join('');
    const grains = Array.from({ length: 70 }, () => {
      const x = range(rng, 560, 860);
      const y = range(rng, 500, 700);
      return `M${x.toFixed(1)},${y.toFixed(1)}h2.4v2.4h-2.4Z`;
    }).join('');
    // Fine soil speckle and strata hairlines give the cut face a surface.
    const speckle = Array.from({ length: 260 }, () => {
      const x = range(rng, 0, 1600);
      const y = range(rng, GROUND + 20, 900);
      return `M${x.toFixed(1)},${y.toFixed(1)}h${range(rng, 1.5, 4).toFixed(1)}v1.6h-2Z`;
    }).join('');
    const caustics = Array.from({ length: 16 }, () => {
      const x = range(rng, 0, 1500);
      const y = range(rng, 806, 868);
      return `M${x.toFixed(1)},${y.toFixed(1)}q${range(rng, 18, 36).toFixed(1)},${range(rng, -6, 6).toFixed(1)} ${range(rng, 50, 110).toFixed(1)},0`;
    }).join('');
    // Foliage clumps inside the crown: sunlit ones toward the upper right, shaded ones low and left.
    const clumps = (cx: number, cy: number, spreadX: number, spreadY: number, n: number, dx: number, dy: number) =>
      Array.from({ length: n }, () => {
        const a = rng() * Math.PI * 2;
        const rad = Math.sqrt(rng());
        const x = cx + Math.cos(a) * rad * spreadX + dx;
        const y = cy + Math.sin(a) * rad * spreadY + dy;
        const r = range(rng, 12, 36);
        return `M${(x - r).toFixed(1)},${y.toFixed(1)}a${r.toFixed(1)},${r.toFixed(1)} 0 1,1 ${(r * 2).toFixed(1)},0a${r.toFixed(1)},${r.toFixed(1)} 0 1,1 ${(-r * 2).toFixed(1)},0`;
      }).join('');
    const lightLeaves = clumps(700, GROUND - 218, 230, 170, 26, 70, -50);
    const shadeLeaves = clumps(700, GROUND - 218, 230, 170, 22, -80, 70);
    return {
      deep, farMid, oak, pine, small, roots, threads, shrubs, pebbles, grains, speckle, caustics, lightLeaves, shadeLeaves,
      ridge: ridgePath(31, GROUND - 52, 18),
      strata: [ridgePath(41, GROUND + 92, 10), ridgePath(42, GROUND + 250, 14), ridgePath(43, GROUND + 392, 12)],
      grass: grassBlades(53, GROUND + 2, 150, 8, 34, false),
    };
  }, []);

  /** A sunlit gradient across a tree layer: warm toward the sun at upper right, cool shade lower left. */
  const lit = (name: string, base: string, lift: number) => (
    <linearGradient id={`${uid}-${name}`} gradientUnits="userSpaceOnUse" x1="1300" y1="0" x2="200" y2={GROUND}>
      <stop offset="0" style={{ stopColor: `color-mix(in oklab, ${base} ${100 - lift}%, var(--canopy-light))` }} />
      <stop offset="0.55" style={{ stopColor: base }} />
      <stop offset="1" style={{ stopColor: `color-mix(in oklab, ${base} 78%, var(--shadow-cool))` }} />
    </linearGradient>
  );

  return (
    <svg className="diorama" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--sky-top)' }} />
          <stop offset="0.42" style={{ stopColor: 'var(--sky-mid)' }} />
          <stop offset="1" style={{ stopColor: 'var(--sky-bottom)' }} />
        </linearGradient>
        <radialGradient id={`${uid}-sun`}>
          <stop offset="0" style={{ stopColor: 'var(--light-warmth)', stopOpacity: 0.85 }} />
          <stop offset="0.5" style={{ stopColor: 'var(--light-warmth)', stopOpacity: 0.22 }} />
          <stop offset="1" style={{ stopColor: 'var(--light-warmth)', stopOpacity: 0 }} />
        </radialGradient>
        {light.shapes.map((s, i) => (
          <linearGradient key={i} id={`${uid}-sh${i}`} gradientUnits="userSpaceOnUse" x1={s.x0} y1={s.top} x2={s.x1} y2={s.top} gradientTransform={shaftShear(s.top)}>
            {[[0, 0], [0.2, 0.3], [0.5, 0.55], [0.8, 0.3], [1, 0]].map(([offset, alpha]) => <stop key={offset} offset={offset} style={{ stopColor: 'var(--light-warmth)', stopOpacity: alpha }} />)}
          </linearGradient>
        ))}
        <radialGradient id={`${uid}-pool`}>
          <stop offset="0" style={{ stopColor: 'var(--light-warmth)', stopOpacity: 0.6 }} />
          <stop offset="1" style={{ stopColor: 'var(--light-warmth)', stopOpacity: 0 }} />
        </radialGradient>
        <radialGradient id={`${uid}-sheen`} gradientUnits="userSpaceOnUse" cx="1080" cy="40" r="700">
          <stop offset="0" style={{ stopColor: 'var(--rim)', stopOpacity: 0.5 }} />
          <stop offset="0.55" style={{ stopColor: 'var(--rim)', stopOpacity: 0.12 }} />
          <stop offset="1" style={{ stopColor: 'var(--rim)', stopOpacity: 0 }} />
        </radialGradient>
        {lit('oak', 'var(--tree-near)', 34)}
        {lit('pine', 'var(--tree-mid)', 26)}
        {lit('far', 'var(--tree-far)', 18)}
        {lit('farmid', 'var(--tree-farmid)', 20)}
        <linearGradient id={`${uid}-soil`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2b1f14" />
          <stop offset="1" stopColor="#1d140c" />
        </linearGradient>
        <linearGradient id={`${uid}-face`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0d9a0" stopOpacity="0.14" />
          <stop offset="0.35" stopColor="#f0d9a0" stopOpacity="0" />
          <stop offset="1" stopColor="#02060a" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id={`${uid}-water`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fd0d2" stopOpacity="0.8" />
          <stop offset="1" stopColor="#2c6c78" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="ls-mist-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--atmo)', stopOpacity: 0 }} />
          <stop offset="0.6" style={{ stopColor: 'var(--atmo)', stopOpacity: 0.4 }} />
          <stop offset="1" style={{ stopColor: 'var(--atmo)', stopOpacity: 0 }} />
        </linearGradient>
        <linearGradient id={`${uid}-shade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6fb3b0" stopOpacity="0" />
          <stop offset="1" stopColor="#6fb3b0" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Above ground: a sunlit forest in atmospheric depth */}
      <rect width="1600" height={GROUND + 4} fill={`url(#${uid}-sky)`} />
      <ellipse cx="1180" cy="110" rx="620" ry="360" fill={`url(#${uid}-sun)`} />
      <path d={art.ridge} className="ls-ridge" />
      <path d={art.deep} fill={`url(#${uid}-far)`} />
      <path d={art.farMid} fill={`url(#${uid}-farmid)`} />
      <rect x="0" y={GROUND - 120} width="1600" height="124" className="ls-mist" />
      <g className="ls-shafts">
        {light.shapes.map((s, i) => <path key={i} d={s.d} fill={`url(#${uid}-sh${i})`} style={{ opacity: s.strength }} />)}
      </g>
      <path d={art.small} className="ls-rim" transform="translate(2.5 -2.5)" />
      <path d={art.small} fill={`url(#${uid}-pine)`} />
      <path d={art.pine} className="ls-rim" transform="translate(2.5 -2.5)" />
      <path d={art.pine} fill={`url(#${uid}-pine)`} />
      <path d={art.pine} fill={`url(#${uid}-sheen)`} />
      <path d={art.oak} className="ls-rim" transform="translate(3.5 -3.5)" />
      <path d={art.oak} fill={`url(#${uid}-oak)`} />
      <clipPath id={`${uid}-oakclip`}><path d={art.oak} /></clipPath>
      <g clipPath={`url(#${uid}-oakclip)`}>
        <path d={art.shadeLeaves} className="ls-leaves-shade" />
        <path d={art.lightLeaves} className="ls-leaves-light" />
      </g>
      <path d={art.oak} fill={`url(#${uid}-sheen)`} />
      <path d={art.shrubs} className="ls-shrubs" />
      <g className="ls-pools">
        {light.pools.map((p, i) => <ellipse key={i} cx={p.cx} cy={GROUND - 6} rx={p.rx} ry={p.ry * 0.5} fill={`url(#${uid}-pool)`} style={{ opacity: p.strength }} />)}
      </g>

      {/* Wildlife */}
      <g className="ls-animal" transform={`translate(392 ${GROUND - 77}) scale(1.1)`}>
        <path d={DEER} />
        <path d={DEER_ANTLERS} className="ls-antlers" />
      </g>
      <g className="ls-animal" transform={`translate(1190 ${GROUND - 54}) scale(0.9)`}>
        <path d={FOX} />
      </g>
      <g className="ls-animal" transform={`translate(960 ${GROUND - 42}) scale(0.7)`}>
        <path d={HARE} />
      </g>
      <g className="ls-animal" transform="translate(830 214) scale(1.3)">
        <path d={BIRD_PERCHED} />
      </g>
      <g className="ls-animal" transform="translate(1100 286) scale(0.55)">
        <path d={OWL} />
      </g>
      <path className="ls-fungi" d={mushroom(598, GROUND, 1.4) + mushroom(616, GROUND, 1) + mushroom(1010, GROUND, 1.1)} />
      <path className="ls-insects" d={butterfly(560, 420, 1.4) + butterfly(596, 398, 1) + butterfly(240, 430, 1.1)} />

      {/* Below ground: the cut face, layer by layer */}
      <path d={`M0,${GROUND}L1330,${GROUND}Q1345,${GROUND + 38} 1380,${GROUND + 44}L1500,${GROUND + 44}Q1535,${GROUND + 38} 1548,${GROUND}L1600,${GROUND}L1600,900L0,900Z`} fill={`url(#${uid}-soil)`} />
      <path d={art.strata[0]} fill="#2f2115" />
      <path d={art.strata[1]} fill="#3c2b1b" />
      <path d={art.strata[2]} fill="#312e2b" />
      <path d={art.speckle} className="ls-speckle" />
      <rect x="0" y={GROUND} width="1330" height="16" className="ls-litter" />
      <path d={art.pebbles} className="ls-pebbles" />
      <path d="M0,792Q300,780 600,794T1200,786T1600,780L1600,900L0,900Z" fill={`url(#${uid}-water)`} className="ls-groundwater" />
      <path d={art.caustics} className="ls-caustics" />
      <path d={`M1330,${GROUND + 6}L1548,${GROUND + 6}Q1535,${GROUND + 38} 1500,${GROUND + 44}L1380,${GROUND + 44}Q1345,${GROUND + 38} 1330,${GROUND + 6}Z`} fill={`url(#${uid}-water)`} />
      <rect x="0" y={GROUND} width="1600" height={900 - GROUND} fill={`url(#${uid}-face)`} />
      <line x1="0" y1={GROUND} x2="1600" y2={GROUND} className="ls-cutline" />
      <path d={art.grass} className="ls-grass" />
      <g className="ls-hyphae">
        {art.threads.map((d, i) => <path key={i} d={d} />)}
      </g>
      <g className="ls-roots">
        {art.roots.flatMap((sys, k) => sys.depths.map(([depth, d]) => <path key={`${k}-${depth}`} d={d} className="ls-root" strokeWidth={rootWidth(depth)} />))}
        {art.roots.flatMap((sys, k) => sys.depths.map(([depth, d]) => <path key={`h${k}-${depth}`} d={d} className="ls-root-hi" strokeWidth={rootWidth(depth) * 0.3} transform="translate(-1.4 -1.4)" />))}
      </g>

      {/* — Topic overlays: light and flow, not arrows — */}
      <g className="ls-ov" data-topic="tree">
        <path d="M520,30Q560,120 610,190" className="ls-flow ls-flow--in" />
        <path d="M640,20Q660,110 690,170" className="ls-flow ls-flow--in" />
        <path d="M820,175Q880,100 940,30" className="ls-flow ls-flow--out" />
        <text x="506" y="24" className="ls-tag">{TAG.co2}</text>
        <text x="944" y="26" className="ls-tag">{TAG.o2}</text>
        <path d={art.oak} className="ls-glow" />
        <text x="724" y="455" className="ls-tag">{TAG.carbon}</text>
      </g>

      <g className="ls-ov" data-topic="roots">
        {art.threads.map((d, i) => (
          <path key={i} d={d} className="ls-thread" />
        ))}
        <text x="830" y="760" className="ls-tag">{TAG.threads}</text>
      </g>

      <g className="ls-ov" data-topic="soil">
        {Array.from({ length: 14 }, (_, i) => {
          const x = 120 + i * 34;
          return <line key={i} x1={x} y1={300 + (i % 3) * 20} x2={x - 10} y2={GROUND - 12} className="ls-rain" />;
        })}
        {Array.from({ length: 8 }, (_, i) => {
          const x = 140 + i * 55;
          return <path key={i} d={`M${x},${GROUND + 6}L${x + 4},${GROUND + 110}`} className="ls-flow ls-flow--down" />;
        })}
        <path d={art.grains} className="ls-grains" />
        <rect x="0" y={GROUND} width="1330" height="16" className="ls-litter-lit" />
        <text x="150" y={GROUND + 150} className="ls-tag">{TAG.litter}</text>
        <text x="600" y={GROUND + 250} className="ls-tag">{TAG.grip}</text>
      </g>

      <g className="ls-ov" data-topic="water">
        <path d="M700,150Q760,60 860,96" className="ls-flow ls-flow--cycle" />
        <path d="M1460,470Q1420,260 1300,140" className="ls-flow ls-flow--cycle" />
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={1060 + i * 22} y1={150} x2={1050 + i * 22} y2={GROUND - 20} className="ls-rain" />
        ))}
        <path d={`M1150,${GROUND + 8}Q1150,650 1190,780`} className="ls-flow ls-flow--cycle" />
        <path d="M1200,790Q1360,740 1430,520" className="ls-flow ls-flow--cycle" />
        <text x="660" y="70" className="ls-tag">{TAG.evaporation}</text>
        <text x="1110" y="140" className="ls-tag">{TAG.rain}</text>
        <text x="1010" y="840" className="ls-tag">{TAG.groundwater}</text>
        <text x="1380" y={GROUND + 80} className="ls-tag">{TAG.stream}</text>
      </g>

      <g className="ls-ov" data-topic="wildlife">
        <path d="M440,402L370,452" className="ls-web" />
        <path d="M840,212L580,412" className="ls-web" />
        <path d="M1230,430L1000,440" className="ls-web" />
        <path d="M1105,300L1000,430" className="ls-web" />
        <path d="M606,462L690,560" className="ls-web" />
        <path d="M840,212L1100,300" className="ls-web" />
        <text x="378" y="380" className="ls-tag">{TAG.deer}</text>
        <text x="852" y="200" className="ls-tag">{TAG.bird}</text>
        <text x="1240" y="404" className="ls-tag">{TAG.fox}</text>
        <text x="940" y="410" className="ls-tag">{TAG.hare}</text>
        <text x="1126" y="290" className="ls-tag">{TAG.owl}</text>
        <text x="520" y="384" className="ls-tag">{TAG.insects}</text>
        <text x="560" y={GROUND + 34} className="ls-tag">{TAG.fungi}</text>
      </g>

      <g className="ls-ov" data-topic="air">
        <path d="M470,240Q700,140 930,240L980,470L420,470Z" fill={`url(#${uid}-shade)`} />
        {[1020, 1120, 1240, 1380, 1500].map((x, i) => (
          <line key={x} x1={x + 160} y1={0} x2={x - (i < 2 ? 40 : 60)} y2={i < 2 ? 210 : GROUND - 6} className="ls-ray" />
        ))}
        <text x="560" y="420" className="ls-tag">{TAG.shade}</text>
        <text x="1300" y="440" className="ls-tag">{TAG.open}</text>
      </g>
    </svg>
  );
});
