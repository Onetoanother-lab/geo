import { useId, useMemo, type ReactNode, type CSSProperties } from 'react';
import { broadleafPath, generateLayer, mergeLayer, mulberry32, overhangBranch, ridgePath, translatePath, range } from '../../../lib/forest/generate';
import { DustField } from './DustField';
import { rootSystem } from '../../../lib/forest/roots';
import { DEER, butterfly, sprout } from '../silhouettes';
import { SHAFT_SLOPE, barePatches, grassBlades, shaftGeometry, shaftShear, trunkArt } from '../../../lib/forest/scenery';
import './ForestScene.css';

export const HERO = { x: 1010, y: 805, h: 610, w: 330 } as const;
/** Height of the cut face of the hero stump (the tree-ring ellipses are centred here). */
export const STUMP_TOP = HERO.y - 50;

/** Direct light from the upper right. The same shafts feed the dust, so it only shows in light. */
const SHAFTS = [
  { x: 130, w: 96, strength: 0.5 },
  { x: 520, w: 150, strength: 0.85 },
  { x: 905, w: 250, strength: 1 },
  { x: 1280, w: 120, strength: 0.7 },
];

type Props = {
  seed?: number;
  /** Initial --life (1 living … 0 degraded). Timelines tween it on the root. */
  life?: number;
  /** Render the isolated hero tree used for the Act I fall. */
  hero?: boolean;
  /** The hero tree has fallen: stump, log, sapling and an open canopy remain (the finale). */
  fallen?: boolean;
  dust?: boolean;
  dustColor?: string;
  /** Scales the number of trees per layer. */
  density?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  /** Drawn inside the hero depth plane, so it scales with the camera (birds, debris, rings). */
  heroLayer?: ReactNode;
  label?: string;
  inscription?: boolean;
};

/**
 * The layered procedural forest used by the opening, the futures split and the
 * finale. Depth wrappers (`.fs-depth`) are the parallax/camera targets; the
 * inner SVGs carry the gentle canopy sway (CSS), so GSAP and CSS never fight
 * over the same transform.
 *
 * Planes, back to front: 0 deep + far ridge, 1 mid, (light), 2 near + hero,
 * 3 foreground trunks and grass, 4 overhanging branches. Colour carries distance:
 * each plane is mixed toward the atmosphere (`--atmo`) in proportion to its depth.
 */
export function ForestScene({ seed = 11, life = 1, hero = false, fallen = false, dust = true, dustColor, density = 1, className, style, children, heroLayer, label, inscription = false }: Props) {
  const roots = useMemo(() => rootSystem(HERO.x, HERO.y, 91, { length: 145, depth: 3, spread: 1.15 }), []);
  const light = useMemo(() => shaftGeometry(SHAFTS), []);
  const heroLight = useMemo(() => shaftGeometry([{ x: 1147, w: 240, strength: 1 }], -80, 900, 812), []);
  const layers = useMemo(() => {
    const gap: [number, number][] | undefined = hero ? [[HERO.x - 150, HERO.x + 150]] : undefined;
    const far = generateLayer({ seed: seed + 1, count: Math.round(74 * density), baseY: 540, baseJitter: 30, minH: 46, maxH: 118, mix: { conifer: 0.82, broadleaf: 0.18 }, clump: 0.55, lean: 5 });
    const farMid = generateLayer({ seed: seed + 9, count: Math.round(44 * density), baseY: 592, baseJitter: 38, minH: 96, maxH: 200, mix: { conifer: 0.62, broadleaf: 0.38 }, clump: 0.6, lean: 5 });
    const mid = generateLayer({ seed: seed + 2, count: Math.round(34 * density), baseY: 640, baseJitter: 44, minH: 170, maxH: 330, mix: { conifer: 0.64, broadleaf: 0.36 }, clump: 0.55, lean: 4 });
    const midExtra = generateLayer({ seed: seed + 11, count: Math.round(30 * density), baseY: 668, baseJitter: 30, minH: 70, maxH: 150, mix: { broadleaf: 0.5, conifer: 0.5 }, clump: 0.5, lean: 6 });
    const near = generateLayer({ seed: seed + 3, count: Math.round(14 * density), baseY: 770, baseJitter: 54, minH: 330, maxH: 600, mix: { conifer: 0.5, broadleaf: 0.5 }, gaps: gap, aspect: [0.26, 0.36], clump: 0.3, lean: 3 });
    return {
      deepRidge: ridgePath(seed + 4, 520, 30),
      far: mergeLayer(far),
      farMid: mergeLayer(farMid),
      midGround: ridgePath(seed + 5, 656, 14),
      mid: mergeLayer(mid),
      midExtra: mergeLayer(midExtra),
      nearGround: ridgePath(seed + 6, 806, 12),
      near: mergeLayer(near),
      bare: barePatches(seed + 12, 7),
      grass: grassBlades(seed + 8, 872, Math.round(96 * density), 26, 90),
      trunks: [trunkArt(seed + 7, 18, 290), trunkArt(seed + 15, 1590, 340), trunkArt(seed + 16, 352, 50), trunkArt(seed + 17, 1262, 62)],
      branchA: overhangBranch(seed + 13, -90, 64, 1, 820, 190),
      branchB: overhangBranch(seed + 14, 1700, 24, -1, 700, 150),
    };
  }, [seed, density, hero]);

  const heroPaths = useMemo(() => {
    if (!hero) return null;
    const rng = mulberry32(seed + 99);
    const tree = translatePath(broadleafPath(HERO.h, HERO.w, rng), HERO.x, HERO.y);
    const { x, y } = HERO;
    // A broken stump: jagged top, roots flaring at the base.
    const stump = `M${x - 58},${y + 2}L${x - 42},${y - 20}L${x - 36},${y - 38}L${x - 22},${y - 55}L${x - 8},${y - 47}L${x + 7},${y - 58}L${x + 22},${y - 46}L${x + 36},${y - 52}L${x + 42},${y - 22}L${x + 60},${y + 2}Z`;
    // The fallen trunk: it stays on the ground after the crown is gone.
    const lr = mulberry32(seed + 71);
    let log = `M${HERO.x - 34},${HERO.y - 6}`;
    const steps = 9;
    const top: string[] = [];
    const bottom: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = HERO.x - 40 - t * 330;
      const half = 29 - t * 13 + range(lr, -1.5, 1.5);
      top.push(`${x.toFixed(1)},${(HERO.y - 10 - half * 1.5 + t * 8).toFixed(1)}`);
      bottom.push(`${x.toFixed(1)},${(HERO.y + 8 + t * 6).toFixed(1)}`);
    }
    log += `L${top.join('L')}L${bottom.reverse().join('L')}L${HERO.x - 34},${HERO.y + 10}Z`;
    const litter = Array.from({ length: 34 }, () => {
      const x = HERO.x - range(lr, -90, 330);
      const y = HERO.y + range(lr, -2, 46);
      const a = range(lr, -0.9, 0.9);
      const l = range(lr, 7, 15);
      return `M${x.toFixed(1)},${y.toFixed(1)}q${(l * 0.5).toFixed(1)},${(-l * 0.5 + a * 4).toFixed(1)} ${l.toFixed(1)},${(a * 3).toFixed(1)}q${(-l * 0.5).toFixed(1)},${(l * 0.35).toFixed(1)} ${(-l).toFixed(1)},${(-a * 3).toFixed(1)}Z`;
    }).join('');
    return { tree, stump, log, litter };
  }, [hero, seed]);

  const svgProps = { viewBox: '0 0 1600 900', preserveAspectRatio: 'xMidYMax slice', 'aria-hidden': true } as const;
  const uid = useId().replace(/:/g, '');
  /** Directional light across a whole layer: lit toward the upper right, cool shade lower left. */
  const lit = (name: string, base: string, lift: number, shade: number) => (
    <linearGradient id={`${uid}-${name}`} gradientUnits="userSpaceOnUse" x1="1480" y1="120" x2="140" y2="900">
      <stop offset="0" style={{ stopColor: `color-mix(in oklab, ${base} ${100 - lift}%, var(--canopy-light))` }} />
      <stop offset="0.5" style={{ stopColor: base }} />
      <stop offset="1" style={{ stopColor: `color-mix(in oklab, ${base} ${100 - shade}%, var(--shadow-cool))` }} />
    </linearGradient>
  );
  const fill = (name: string) => `url(#${uid}-${name})`;

  return (
    <div className={`forest-scene ${fallen ? 'forest-scene--fallen' : ''} ${className ?? ''}`} style={{ ['--life' as string]: life, ...style }} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <div className="fs-sky" />
      <div className="fs-sun" />
      <div className="fs-depth" data-depth="0">
        <svg {...svgProps} className="fs-svg">
          <defs>{lit('far', 'var(--tree-far)', 18, 10)}</defs>
          <path d={layers.deepRidge} className="fs-fill-deep" />
          <path d={layers.far} fill={fill('far')} />
        </svg>
      </div>
      <div className="fs-mist fs-mist--far" />
      <div className="fs-depth" data-depth="1">
        <svg {...svgProps} className="fs-svg fs-sway fs-sway--slow">
          <defs>
            {lit('farmid', 'var(--tree-farmid)', 20, 14)}
            {lit('mid', 'var(--tree-mid)', 26, 20)}
          </defs>
          <path d={layers.farMid} fill={fill('farmid')} />
          <path d={layers.midGround} className="fs-fill-farmid" />
          <path d={layers.mid} className="fs-rim fs-rim--soft" transform="translate(2.5 -2.5)" />
          <path d={layers.mid} fill={fill('mid')} />
          <path d={layers.midExtra} className="fs-fill-mid fs-detail" />
        </svg>
      </div>
      <div className="fs-mist fs-mist--mid" />
      <svg {...svgProps} className="fs-shafts" aria-hidden="true">
        <defs>
          {[...light.shapes, ...heroLight.shapes].map((s, i) => (
            <linearGradient key={i} id={`${uid}-sh${i}`} gradientUnits="userSpaceOnUse" x1={s.x0} y1={s.top} x2={s.x1} y2={s.top} gradientTransform={shaftShear(s.top)}>
              {[[0, 0], [0.2, 0.3], [0.5, 0.55], [0.8, 0.3], [1, 0]].map(([offset, alpha]) => (
                <stop key={offset} offset={offset} style={{ stopColor: 'var(--light-warmth)', stopOpacity: alpha }} />
              ))}
            </linearGradient>
          ))}
          <radialGradient id={`${uid}-pool`}>
            <stop offset="0" style={{ stopColor: 'var(--light-warmth)', stopOpacity: 0.7 }} />
            <stop offset="0.55" style={{ stopColor: 'var(--light-warmth)', stopOpacity: 0.28 }} />
            <stop offset="1" style={{ stopColor: 'var(--light-warmth)', stopOpacity: 0 }} />
          </radialGradient>
        </defs>
        <g className="fs-shaft-set">
          {light.shapes.map((s, i) => <path key={i} d={s.d} className="fs-shaft" style={{ opacity: s.strength }} fill={`url(#${uid}-sh${i})`} />)}
        </g>
        {hero && (
          <g className="fs-hole-set">
            {heroLight.shapes.map((s, i) => <path key={i} d={s.d} className="fs-hole-shaft" fill={`url(#${uid}-sh${light.shapes.length + i})`} />)}
          </g>
        )}
      </svg>
      <div className="fs-depth" data-depth="2">
        <svg {...svgProps} className="fs-svg fs-sway">
          <defs>
            {lit('near', 'var(--tree-near)', 30, 22)}
            <linearGradient id={`${uid}-ground`} gradientUnits="userSpaceOnUse" x1="0" y1="790" x2="0" y2="910">
              <stop offset="0" style={{ stopColor: 'color-mix(in oklab, var(--tree-near) 58%, var(--ground-far))' }} />
              <stop offset="1" style={{ stopColor: 'color-mix(in oklab, var(--c-near) 72%, var(--shadow-cool))' }} />
            </linearGradient>
          </defs>
          <path d={layers.nearGround} fill={`url(#${uid}-ground)`} />
          <g className="fs-pools">
            {light.pools.map((p, i) => <ellipse key={i} cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry} fill={`url(#${uid}-pool)`} style={{ opacity: p.strength }} />)}
          </g>
          <path d={layers.bare} className="fs-bare" />
          <path d={layers.near} className="fs-rim" transform="translate(3.5 -3.5)" />
          <path d={layers.near} fill={fill('near')} />
        </svg>
        <svg {...svgProps} className="fs-water">
          <path className="fs-water-body" d="M770,620Q715,672 827,720T860,790Q760,842 950,900H1180Q860,837 973,796T860,710Q754,674 795,620Z" />
          <path className="fs-water-line" d="M816,715l30,1M857,745l26,2M849,828l63,3M1018,885l70,2" />
        </svg>
        <svg {...svgProps} className="fs-ecology">
          <path d={DEER} transform="translate(650 755) scale(.8)" />
          <path d={butterfly(800, 770, 1.2) + butterfly(1220, 730, .9)} />
        </svg>
        <svg {...svgProps} className="fs-roots">
          {roots.segments.map((s, i) => <path className={i === 1 ? 'fs-root-connection' : undefined} key={i} d={s.d} />)}
        </svg>
        {heroPaths && (
          <svg {...svgProps} className="fs-svg fs-hero">
            <defs>{lit('hero', 'var(--tree-near)', 34, 26)}</defs>
            <ellipse className="fs-hero-shadow" cx={HERO.x - 70} cy={HERO.y + 16} rx="250" ry="26" />
            <ellipse className="fs-hero-pool" cx={heroLight.pools[0].cx} cy={heroLight.pools[0].cy} rx={heroLight.pools[0].rx * 1.3} ry={heroLight.pools[0].ry * 1.5} fill={`url(#${uid}-pool)`} />
            <path d={heroPaths.log} className="fs-hero-log" />
            <path d={heroPaths.stump} className="fs-fill-near fs-hero-stump" />
            <g className="fs-hero-tree">
              <path d={heroPaths.tree} className="fs-rim" transform="translate(4 -4)" />
              <path d={heroPaths.tree} fill={fill('hero')} />
            </g>
            <path d={heroPaths.litter} className="fs-litter" />
            <path d={sprout(7)} transform={`translate(${HERO.x + 30} ${HERO.y - 4})`} className="fs-sapling" />
            {heroLayer}
          </svg>
        )}
      </div>
      {inscription && <p className="fs-inscription" aria-hidden="true">O‘RMON</p>}
      {dust && <DustField className="fs-dust" color={dustColor} count={80} light={{ bands: light.bands, slope: SHAFT_SLOPE }} />}
      <div className="fs-depth" data-depth="3">
        <svg {...svgProps} className="fs-svg">
          <defs>{lit('front', 'var(--tree-front)', 12, 14)}</defs>
          {layers.trunks.map((t, i) => (
            <g key={i} className={i < 2 ? 'fs-trunk' : 'fs-trunk fs-trunk--slim'}>
              <path d={t.body} fill={fill('front')} />
              <path d={t.bark} className="fs-bark" />
              <path d={t.rim} className="fs-rim fs-rim--trunk" />
            </g>
          ))}
          <path d={layers.grass} className="fs-fill-front fs-detail" />
        </svg>
      </div>
      <div className="fs-mist fs-mist--ground" />
      <div className="fs-depth fs-depth--branch" data-depth="4">
        <svg {...svgProps} className="fs-svg">
          <g className="fs-branch">
            <path d={layers.branchA.limb} />
            <path d={layers.branchA.twigs} className="fs-twigs" />
            <path d={layers.branchA.leaves} />
            <path d={layers.branchB.limb} />
            <path d={layers.branchB.twigs} className="fs-twigs" />
            <path d={layers.branchB.leaves} />
          </g>
        </svg>
      </div>
      <div className="fs-vignette" />
      {children}
    </div>
  );
}
