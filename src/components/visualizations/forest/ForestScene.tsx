import { useId, useMemo, type ReactNode, type CSSProperties } from 'react';
import { broadleafPath, generateLayer, mergeLayer, mulberry32, ridgePath, stumpPath, translatePath, range } from '../../../lib/forest/generate';
import { DustField } from './DustField';
import './ForestScene.css';

export const HERO = { x: 1010, y: 805, h: 610, w: 330 } as const;

type Props = {
  seed?: number;
  /** Initial --life (1 living … 0 degraded). Timelines tween it on the root. */
  life?: number;
  /** Render the isolated hero tree used for the Act I fall. */
  hero?: boolean;
  dust?: boolean;
  dustColor?: string;
  /** Scales the number of trees per layer. */
  density?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  label?: string;
};

function frontTrunks(seed: number): string {
  const rng = mulberry32(seed);
  const trunks = [
    { x: 70, w: 120 },
    { x: 1525, w: 150 },
    { x: 330, w: 46 },
    { x: 1290, w: 58 },
  ];
  let d = '';
  for (const t of trunks) {
    const lean = range(rng, -12, 12);
    d += `M${t.x - t.w / 2},905C${t.x - t.w * 0.45},600 ${t.x - t.w * 0.38 + lean},300 ${t.x - t.w * 0.34 + lean},-20L${t.x + t.w * 0.34 + lean},-20C${t.x + t.w * 0.38 + lean},300 ${t.x + t.w * 0.45},600 ${t.x + t.w / 2},905Z`;
    // Root flare.
    d += `M${t.x - t.w * 1.1},905Q${t.x - t.w * 0.55},860 ${t.x - t.w * 0.45},790L${t.x + t.w * 0.45},790Q${t.x + t.w * 0.55},860 ${t.x + t.w * 1.1},905Z`;
  }
  return d;
}

function undergrowth(seed: number, baseY: number, count: number): string {
  const rng = mulberry32(seed);
  let d = '';
  for (let i = 0; i < count; i++) {
    const x = range(rng, -40, 1640);
    const y = baseY + range(rng, 0, 40);
    const s = range(rng, 18, 60);
    for (let k = 0; k < 4; k++) {
      const cx = x + range(rng, -s, s);
      const cy = y - range(rng, 0, s * 0.6);
      const r = s * range(rng, 0.35, 0.7);
      d += `M${(cx - r).toFixed(1)},${cy.toFixed(1)}a${r.toFixed(1)},${r.toFixed(1)} 0 1,0 ${(r * 2).toFixed(1)},0a${r.toFixed(1)},${r.toFixed(1)} 0 1,0 ${(-r * 2).toFixed(1)},0`;
    }
  }
  return d + `M0,${baseY + 30}L1600,${baseY + 30}L1600,905L0,905Z`;
}

/**
 * The layered procedural forest used by the opening, the futures split and the
 * finale. Depth wrappers (`.fs-depth`) are the parallax/camera targets; the
 * inner SVGs carry the gentle canopy sway (CSS), so GSAP and CSS never fight
 * over the same transform.
 */
export function ForestScene({ seed = 11, life = 1, hero = false, dust = true, dustColor, density = 1, className, style, children, label }: Props) {
  const layers = useMemo(() => {
    const gap: [number, number][] | undefined = hero ? [[HERO.x - 150, HERO.x + 150]] : undefined;
    const far = generateLayer({ seed: seed + 1, count: Math.round(78 * density), baseY: 548, baseJitter: 34, minH: 50, maxH: 120, mix: { conifer: 0.8, broadleaf: 0.2 } });
    const mid = generateLayer({ seed: seed + 2, count: Math.round(46 * density), baseY: 625, baseJitter: 46, minH: 140, maxH: 270, mix: { conifer: 0.6, broadleaf: 0.4 } });
    const near = generateLayer({ seed: seed + 3, count: Math.round(19 * density), baseY: 760, baseJitter: 60, minH: 300, maxH: 540, mix: { conifer: 0.58, broadleaf: 0.42 }, gaps: gap, aspect: [0.26, 0.36] });
    return {
      farRidge: ridgePath(seed + 4, 540, 26),
      far: mergeLayer(far),
      midGround: ridgePath(seed + 5, 650, 14),
      mid: mergeLayer(mid),
      nearGround: ridgePath(seed + 6, 800, 12),
      near: mergeLayer(near),
      front: frontTrunks(seed + 7),
      under: undergrowth(seed + 8, 850, Math.round(26 * density)),
    };
  }, [seed, density, hero]);

  const heroPaths = useMemo(() => {
    if (!hero) return null;
    const rng = mulberry32(seed + 99);
    return {
      tree: translatePath(broadleafPath(HERO.h, HERO.w, rng), HERO.x, HERO.y),
      stump: translatePath(stumpPath(HERO.w * 0.9, rng), HERO.x, HERO.y),
    };
  }, [hero, seed]);

  const svgProps = { viewBox: '0 0 1600 900', preserveAspectRatio: 'xMidYMax slice', 'aria-hidden': true } as const;
  const uid = useId().replace(/:/g, '');
  const grad = (name: string, base: string, lift: number) => (
    <defs>
      <linearGradient id={`${uid}-${name}`} x1="0" y1="0" x2="0" y2="1" gradientUnits="userSpaceOnUse" gradientTransform="scale(900)">
        <stop offset="0.15" style={{ stopColor: `color-mix(in oklab, ${base} ${100 - lift}%, var(--canopy-light))` }} />
        <stop offset="0.75" style={{ stopColor: base }} />
      </linearGradient>
    </defs>
  );

  return (
    <div className={`forest-scene ${className ?? ''}`} style={{ ['--life' as string]: life, ...style }} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <div className="fs-sky" />
      <div className="fs-sun" />
      <div className="fs-depth" data-depth="0">
        <svg {...svgProps} className="fs-svg">
          <path d={layers.farRidge} className="fs-fill-far" />
          <path d={layers.far} className="fs-fill-far" />
        </svg>
      </div>
      <div className="fs-mist fs-mist--far" />
      <div className="fs-depth" data-depth="1">
        <svg {...svgProps} className="fs-svg fs-sway fs-sway--slow">
          {grad('mid', 'var(--tree-mid)', 16)}
          <path d={layers.mid} fill={`url(#${uid}-mid)`} />
          <path d={layers.midGround} className="fs-fill-mid" />
        </svg>
      </div>
      <div className="fs-mist fs-mist--mid" />
      <div className="fs-shafts" aria-hidden="true">
        <span className="fs-shaft" style={{ left: '18%' }} />
        <span className="fs-shaft fs-shaft--wide" style={{ left: '46%' }} />
        <span className="fs-shaft" style={{ left: '71%' }} />
      </div>
      <div className="fs-depth" data-depth="2">
        <svg {...svgProps} className="fs-svg fs-sway">
          {grad('near', 'var(--tree-near)', 20)}
          <path d={layers.near} fill={`url(#${uid}-near)`} />
          <path d={layers.nearGround} className="fs-fill-near" />
        </svg>
        {heroPaths && (
          <svg {...svgProps} className="fs-svg fs-hero">
            <path d={heroPaths.stump} className="fs-fill-near fs-hero-stump" />
            {grad('hero', 'var(--tree-near)', 24)}
            <g className="fs-hero-tree">
              <path d={heroPaths.tree} fill={`url(#${uid}-hero)`} />
            </g>
          </svg>
        )}
      </div>
      <div className="fs-mist fs-mist--ground" />
      <div className="fs-depth" data-depth="3">
        <svg {...svgProps} className="fs-svg">
          <path d={layers.front} className="fs-fill-front" />
          <path d={layers.under} className="fs-fill-front" />
        </svg>
      </div>
      {dust && <DustField className="fs-dust" color={dustColor} />}
      <div className="fs-vignette" />
      {children}
    </div>
  );
}
