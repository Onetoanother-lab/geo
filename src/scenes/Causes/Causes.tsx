import { useMemo, useRef, useState, type CSSProperties } from 'react';
import { Scene } from '../../components/layout/Scene';
import { useSectionBeats } from '../../lib/animation/useSceneTimeline';
import { gsap, useGSAP } from '../../lib/animation/gsap';
import { useReducedMotion } from '../../app/store';
import { NARRATIVE } from '../../content/narrative';
import { StatLine, openSource } from '../../components/visualizations/StatLine';
import { DRIVER_RING } from '../../content/caseStudies';
import { formatFact, type FactId } from '../../content/facts';
import { announce } from '../../lib/accessibility/announce';
import { mulberry32, range } from '../../lib/forest/generate';
import './Causes.css';

const T = NARRATIVE.causes;
type Driver = keyof typeof T.drivers;
const DRIVERS = Object.keys(T.drivers) as Driver[];
const C = 350; // patch centre in a 700×700 box
const R = 290;

const DRIVER_FACT: Partial<Record<Driver, FactId>> = { agriculture: 'driverCropland', grazing: 'driverGrazing', fire: 'fireShare2024' };

type Tree = { x: number; y: number; r: number; tone: number; rnd: number };

function buildTrees(): Tree[] {
  const rng = mulberry32(404);
  const trees: Tree[] = [];
  for (let y = C - R; y <= C + R; y += 22) {
    for (let x = C - R; x <= C + R; x += 22) {
      const jx = x + range(rng, -8, 8);
      const jy = y + range(rng, -8, 8);
      if (Math.hypot(jx - C, jy - C) > R - 10) continue;
      trees.push({ x: jx, y: jy, r: range(rng, 10, 17), tone: rng(), rnd: rng() });
    }
  }
  return trees;
}

// Road: a gentle curve through the patch, with fishbone side roads.
const roadY = (x: number) => C + 40 + Math.sin((x - C) / 140) * 50;
const ROAD = `M${C - R - 20},${roadY(C - R - 20)} ${Array.from({ length: 30 }, (_, i) => {
  const x = C - R - 20 + i * ((2 * R + 40) / 29);
  return `L${x.toFixed(1)},${roadY(x).toFixed(1)}`;
}).join(' ')}`;
const BRANCHES = [-180, -90, 0, 90, 180].map((dx, i) => {
  const x = C + dx;
  const y = roadY(x);
  const up = i % 2 === 0 ? -1 : 1;
  return `M${x},${y}L${x + 30},${y + up * 120}`;
});

const MINE = { x: C + 120, y: C - 115 };
const FIRE = { x: C + 150, y: C + 70 };

/** Which trees each driver removes (or burns), and how far each is from the pressure's origin. */
function affected(d: Driver, t: Tree): { gone: boolean; dist: number } {
  switch (d) {
    case 'agriculture':
      return { gone: t.x < C - 20 + (t.rnd - 0.5) * 40, dist: t.x - (C - R) };
    case 'grazing':
      return { gone: t.y > C + 70 && t.rnd < 0.72, dist: C + R - t.y };
    case 'logging':
      return { gone: t.rnd < 0.2, dist: t.rnd * 400 };
    case 'roads': {
      const nearRoad = Math.abs(t.y - roadY(t.x)) < 28;
      const nearBranch = BRANCHES.some((_, i) => {
        const bx = C + [-180, -90, 0, 90, 180][i];
        const by = roadY(bx);
        const up = i % 2 === 0 ? -1 : 1;
        const along = (t.y - by) * up;
        return along > 0 && along < 120 && Math.abs(t.x - (bx + (along / 120) * 30)) < 16;
      });
      return { gone: nearRoad || nearBranch, dist: t.x - (C - R) };
    }
    case 'mining':
      return { gone: Math.hypot(t.x - MINE.x, t.y - MINE.y) < 105 + t.rnd * 18, dist: Math.hypot(t.x - MINE.x, t.y - MINE.y) };
    case 'fire':
      return { gone: Math.hypot(t.x - FIRE.x, t.y - FIRE.y) < 150 + Math.sin(t.x / 20) * 22, dist: Math.hypot(t.x - FIRE.x, t.y - FIRE.y) };
  }
}

function arc(start: number, end: number, r: number): string {
  const a0 = start * Math.PI * 2 - Math.PI / 2;
  const a1 = end * Math.PI * 2 - Math.PI / 2;
  const large = end - start > 0.5 ? 1 : 0;
  return `M${(Math.cos(a0) * r).toFixed(2)},${(Math.sin(a0) * r).toFixed(2)}A${r},${r} 0 ${large} 1 ${(Math.cos(a1) * r).toFixed(2)},${(Math.sin(a1) * r).toFixed(2)}`;
}

/**
 * ACT IV — the pressure system. A forest patch seen from above; each driver
 * plays its own transformation of the same patch.
 */
export function Causes() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const trees = useMemo(buildTrees, []);
  const [driver, setDriver] = useState<Driver | null>(null);

  useSectionBeats(sectionRef, 'causes', [0]);
  useGSAP(
    () => {
      if (reduced) return;
      gsap.fromTo('.cz-patch', { scale: 1.25, rotate: -8, opacity: 0.4 }, { scale: 1, rotate: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'top top', scrub: 0.6 } });
    },
    { scope: sectionRef, dependencies: [reduced] },
  );

  const states = useMemo(() => {
    if (!driver) return trees.map(() => ({ gone: false, delay: 0 }));
    const list = trees.map((t) => affected(driver, t));
    const max = Math.max(1, ...list.map((a) => a.dist));
    return list.map((a) => ({ gone: a.gone, delay: reduced ? 0 : Math.max(0, a.dist / max) * 1.4 }));
  }, [driver, trees, reduced]);

  const select = (d: Driver) => {
    const next = driver === d ? null : d;
    setDriver(next);
    if (next) announce(`${T.drivers[next].label}. ${T.drivers[next].text}`);
  };

  let acc = 0;
  const ring = DRIVER_RING.map((seg) => {
    const start = acc;
    acc += seg.share;
    return { ...seg, start, end: acc };
  });

  return (
    <Scene chapter="causes" sectionRef={sectionRef} auto stageClassName="cz-stage">
      <div className="cz-layout">
        <div className="cz-system">
          <svg className="cz-patch" viewBox="0 0 700 700" data-driver={driver ?? 'none'} aria-hidden="true">
            <defs>
              <clipPath id="cz-clip">
                <circle cx={C} cy={C} r={R} />
              </clipPath>
              <pattern id="cz-field" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(12)">
                <rect width="24" height="24" fill="#b09153" />
                <rect width="24" height="9" fill="#9c7f46" />
              </pattern>
              <radialGradient id="cz-burn">
                <stop offset="0" stopColor="#1d1611" />
                <stop offset="0.7" stopColor="#2c2018" />
                <stop offset="1" stopColor="#5a3a22" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx={C} cy={C} r={R + 30} className="cz-halo" />
            <g clipPath="url(#cz-clip)">
              <rect x="0" y="0" width="700" height="700" className="cz-floor" />
              {/* Vignettes under the canopy */}
              <g className="cz-vig" data-vig="agriculture">
                <rect x="0" y="0" width={C - 10} height="700" fill="url(#cz-field)" />
                {[120, 200, 280, 360, 440, 520].map((y) => (
                  <line key={y} x1="40" y1={y} x2={C - 20} y2={y + 20} className="cz-field-line" />
                ))}
              </g>
              <g className="cz-vig" data-vig="grazing">
                <rect x="0" y={C + 60} width="700" height="400" className="cz-pasture" />
                {Array.from({ length: 22 }, (_, i) => (
                  <circle key={i} cx={120 + ((i * 53) % 460)} cy={C + 110 + ((i * 37) % 170)} r="3.2" className="cz-cattle" />
                ))}
              </g>
              <g className="cz-vig" data-vig="logging">
                <path d={`M${C - R},${C - 60}Q${C},${C - 140} ${C + R},${C - 20}`} className="cz-skid" />
                <path d={`M${C - 120},${C - 110}L${C - 60},${C + 120}M${C + 80},${C - 70}L${C + 140},${C + 160}`} className="cz-skid" />
                {[0, 1, 2].map((i) => (
                  <g key={i} transform={`translate(${C - 160 + i * 150} ${C - 90 - i * 10}) rotate(${-18 + i * 6})`}>
                    <rect x="-14" y="-3" width="28" height="4" className="cz-log" />
                    <rect x="-12" y="2" width="26" height="4" className="cz-log" />
                  </g>
                ))}
              </g>
              <g className="cz-vig" data-vig="roads">
                <path d={ROAD} className="cz-road" />
                {BRANCHES.map((d) => (
                  <path key={d} d={d} className="cz-road cz-road--branch" />
                ))}
                {[-150, -40, 70, 170].map((dx, i) => (
                  <rect key={dx} x={C + dx} y={roadY(C + dx) + (i % 2 ? 14 : -26)} width="14" height="12" className="cz-house" />
                ))}
              </g>
              <g className="cz-vig" data-vig="mining">
                {[100, 80, 60, 40, 22].map((r, i) => (
                  <circle key={r} cx={MINE.x} cy={MINE.y} r={r} className="cz-pit" style={{ opacity: 0.35 + i * 0.13 }} />
                ))}
                <ellipse cx={MINE.x - 140} cy={MINE.y + 40} rx="40" ry="24" className="cz-tailings" />
              </g>
              <g className="cz-vig" data-vig="fire">
                <circle cx={FIRE.x} cy={FIRE.y} r="175" fill="url(#cz-burn)" />
                {Array.from({ length: 16 }, (_, i) => (
                  <circle key={i} cx={FIRE.x + Math.cos(i) * (110 + (i % 4) * 20)} cy={FIRE.y + Math.sin(i * 1.7) * (90 + (i % 3) * 18)} r="3" className="cz-ember" />
                ))}
              </g>
              {/* Canopy */}
              <g className="cz-trees">
                {trees.map((t, i) => (
                  <circle
                    key={i}
                    cx={t.x}
                    cy={t.y}
                    r={t.r}
                    className="cz-tree"
                    data-gone={states[i].gone}
                    data-burnt={driver === 'fire' && states[i].gone}
                    style={{ ['--d' as string]: `${states[i].delay.toFixed(2)}s`, ['--tone' as string]: t.tone.toFixed(2) } as CSSProperties}
                  />
                ))}
              </g>
            </g>
            <circle cx={C} cy={C} r={R} className="cz-rim" />
          </svg>

          <div className="cz-drivers" role="group" aria-label={T.instruction}>
            {DRIVERS.map((d, i) => {
              const a = (i / DRIVERS.length) * Math.PI * 2 - Math.PI / 2;
              return (
                <button
                  key={d}
                  type="button"
                  className="cz-driver"
                  aria-pressed={driver === d}
                  style={{ left: `${50 + Math.cos(a) * 46}%`, top: `${50 + Math.sin(a) * 46}%`, ['--angle' as string]: `${(a * 180) / Math.PI + 180}deg` }}
                  onClick={() => select(d)}
                >
                  <span className="cz-driver-arrow" aria-hidden="true" />
                  <span className="cz-driver-label">{T.drivers[d].label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="cz-panel">
          <p className="title">{T.title}</p>
          <p className="label cz-instruction">{T.instruction}</p>
          <div className="cz-info" data-visible={driver ? 'true' : 'false'}>
            {driver && (
              <>
                <p className="cz-info-title">{T.drivers[driver].label}</p>
                <p className="body-copy">{T.drivers[driver].text}</p>
                {DRIVER_FACT[driver] && <StatLine factId={DRIVER_FACT[driver]!} />}
              </>
            )}
          </div>
          {driver && (
            <button type="button" className="text-link cz-reset" onClick={() => setDriver(null)}>
              {T.reset}
            </button>
          )}

          <figure className="cz-ring">
            <svg viewBox="-60 -60 120 120" role="img" aria-label={`${T.ringTitle}: ${T.drivers.agriculture.label} ${formatFact('driverCropland')}, ${T.drivers.grazing.label} ${formatFact('driverGrazing')}`}>
              {ring.map((seg) => (
                <path key={seg.key} d={arc(seg.start + 0.004, seg.end - 0.004, 46)} className="cz-ring-seg" data-seg={seg.key} />
              ))}
            </svg>
            <figcaption>
              <p className="label">{T.ringTitle}</p>
              <ul>
                <li data-seg="cropland">
                  <span className="cz-key" /> {formatFact('driverCropland')} — {T.drivers.agriculture.label.toLowerCase()}
                </li>
                <li data-seg="grazing">
                  <span className="cz-key" /> {formatFact('driverGrazing')} — {T.drivers.grazing.label.toLowerCase()}
                </li>
                <li data-seg="other">
                  <span className="cz-key" /> {T.ringOther}
                </li>
              </ul>
              <p className="source-ref">
                <button type="button" onClick={() => openSource('fao-fra-2020-rss')}>
                  FAO, FRA 2020 · 2000–2018
                </button>
              </p>
            </figcaption>
          </figure>
          <p className="cz-nuance">
            {T.nuance}{' '}
            <span className="source-ref">
              <button type="button" onClick={() => openSource('fao-mountain-juniper')}>
                FAO
              </button>
            </span>
          </p>
        </div>
      </div>
    </Scene>
  );
}
