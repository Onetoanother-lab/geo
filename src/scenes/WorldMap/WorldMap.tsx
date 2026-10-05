import { useEffect, useMemo, useRef, useState } from 'react';
import { Scene } from '../../components/layout/Scene';
import { useSceneTimeline } from '../../lib/animation/useSceneTimeline';
import { gsap } from '../../lib/animation/gsap';
import { useReducedMotion } from '../../app/store';
import { NARRATIVE } from '../../content/narrative';
import { StatLine } from '../../components/visualizations/StatLine';
import type { FactId } from '../../content/facts';
import { announce } from '../../lib/accessibility/announce';
import { box, frame, latLine, loadWorld, makeProjection, MAP_H, MAP_W, pathFor, type World } from '../../lib/geography/world';
import { requestRefresh } from '../../lib/animation/refresh';
import { leafVenation } from '../../lib/cinema/venation';
import { MOTION } from '../../lib/animation/motion';
import './WorldMap.css';

const T = NARRATIVE.world;
type RegionId = keyof typeof T.regions;
type Kind = 'tropical' | 'boreal' | 'dry' | 'case' | 'local';

const REGIONS: { id: RegionId; countries: string[]; marker: [number, number]; facts: FactId[]; frameBox?: [number, number, number, number]; kind: Kind }[] = [
  { id: 'amazon', countries: ['076', '604', '170', '068', '862', '218', '328', '740'], marker: [-62, -5], facts: ['amazonRecycling'], kind: 'tropical' },
  { id: 'congo', countries: ['180', '178', '266', '120', '140', '226'], marker: [22, -1], facts: ['tropicsShare'], kind: 'tropical' },
  { id: 'seasia', countries: ['360', '458', '598', '096'], marker: [114, 0], facts: ['tropicalLoss2024'], kind: 'tropical' },
  { id: 'boreal', countries: ['643', '124', '752', '246', '578'], marker: [95, 62], facts: ['topFiveShare'], kind: 'boreal' },
  { id: 'centralasia', countries: ['860', '417', '762'], marker: [71, 41], facts: ['juniperPressure'], frameBox: [55, 36, 80, 46], kind: 'dry' },
  { id: 'uk', countries: ['826'], marker: [-2, 54], facts: ['ukWoodlandNow'], kind: 'case' },
  { id: 'japan', countries: ['392'], marker: [138, 37], facts: ['japanShare'], kind: 'case' },
  { id: 'aral', countries: ['860', '398'], marker: [59.6, 45], facts: ['aralRemaining'], frameBox: [53, 40, 66, 49], kind: 'local' },
];

/**
 * The leaf is laid over the Amazon basin: base at the river's mouth, tip toward the Andes. The same
 * vein network is first a leaf, then a river system; only the camera and the light change.
 */
const MOUTH: [number, number] = [-50.2, -0.6];
const SOURCE: [number, number] = [-76, -6.5];
/** How many times the world view the macro shot is magnified. */
const MACRO = 16;

type View = { k: number; cx: number; cy: number };
const toView = (bounds: [[number, number], [number, number]], max: number): View => {
  const { k, tx, ty } = frame(bounds, max);
  return { k, cx: (MAP_W / 2 - tx) / k, cy: (MAP_H / 2 - ty) / k };
};

/**
 * ACT VI — scale. The camera starts a hair from a leaf, its veins fill the frame, the lamina
 * lets go of its light, and the same lines pull back into the rivers of a continent and then
 * the world. Regions are lit places in that world, not selected shapes in an interface.
 */
export function WorldMap() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<SVGGElement>(null);
  const labelsRef = useRef<SVGGElement>(null);
  const camera = useRef({ z: Math.log(MACRO), cx: MAP_W / 2, cy: MAP_H / 2, rot: 0 });
  const settled = useRef(false);
  const activeRef = useRef<RegionId | null>(null);
  const reduced = useReducedMotion();
  const [world, setWorld] = useState<World | null>(null);
  const [active, setActive] = useState<RegionId | null>(null);
  const [tropics, setTropics] = useState(true);

  useEffect(() => {
    let alive = true;
    void loadWorld().then((w) => {
      if (alive) {
        setWorld(w);
        requestRefresh();
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const projection = useMemo(() => makeProjection(), []);
  const path = useMemo(() => pathFor(projection), [projection]);

  const geo = useMemo(() => {
    if (!world) return null;
    const mouth = projection(MOUTH) ?? [0, 0];
    const source = projection(SOURCE) ?? [0, 0];
    const dx = source[0] - mouth[0];
    const dy = source[1] - mouth[1];
    const length = Math.hypot(dx, dy) * 1.22;
    const phi = Math.atan2(dx, -dy);
    const centre = { x: mouth[0] + (length / 2) * Math.sin(phi), y: mouth[1] - (length / 2) * Math.cos(phi) };
    const regions = REGIONS.map((r) => {
      const shape = world.region(r.countries);
      const bounds = r.frameBox ? path.bounds(box(...r.frameBox)) : path.bounds(shape);
      return {
        id: r.id,
        kind: r.kind,
        d: path(shape) ?? '',
        borders: path(world.borders(r.countries)) ?? '',
        bounds,
        marker: projection(r.marker) ?? [0, 0],
      };
    });
    return {
      land: path(world.land) ?? '',
      sphere: path({ type: 'Sphere' }) ?? '',
      north: path(latLine(23.44)) ?? '',
      south: path(latLine(-23.44)) ?? '',
      regions,
      basin: { x: mouth[0], y: mouth[1], length, deg: (phi * 180) / Math.PI, centre },
    };
  }, [world, path, projection]);

  const venation = useMemo(() => (geo ? leafVenation(geo.basin.length, 5, 10) : null), [geo]);

  const apply = () => {
    const g = cameraRef.current;
    if (!g) return;
    const c = camera.current;
    const k = Math.exp(c.z);
    g.setAttribute('transform', `translate(${MAP_W / 2} ${MAP_H / 2}) rotate(${c.rot.toFixed(2)}) scale(${k.toFixed(4)}) translate(${(-c.cx).toFixed(2)} ${(-c.cy).toFixed(2)})`);
    labelsRef.current?.style.setProperty('--k', k.toFixed(3));
  };

  useSceneTimeline(sectionRef, stageRef, {
    chapter: 'world', length: 4.6, revision: geo,
    build: (tl, { reduced, q }) => {
      if (!geo || !venation) return;
      const { basin } = geo;
      const macro = { z: Math.log(MACRO), cx: basin.centre.x, cy: basin.centre.y, rot: -basin.deg };
      const wide = { z: 0, cx: MAP_W / 2, cy: MAP_H / 2, rot: 0 };
      Object.assign(camera.current, macro);
      apply();
      settled.current = false;

      const veins = q('.wm-vein');
      const secondary = q('.wm-vein--sec');
      const regions = q('.wm-region');

      // 1. The leaf, extremely close: the veins draw themselves across its lamina.
      tl.addLabel('beat:leaf', 4)
        .fromTo('.wm-basin', { autoAlpha: 0 }, { autoAlpha: 1, duration: 3 }, 0)
        .fromTo('.wm-leaf', { opacity: 0 }, { opacity: 1, duration: 6 }, 0)
        .fromTo('.wm-vein--mid', { drawSVG: '0%' }, { drawSVG: '100%', duration: reduced ? 0.1 : 7 }, 1)
        .fromTo(secondary, { drawSVG: '0%' }, { drawSVG: '100%', duration: reduced ? 0.1 : 6, stagger: reduced ? 0 : 0.45 }, 4)
        .fromTo('.wm-vein--fine', { drawSVG: '0%' }, { drawSVG: '100%', duration: reduced ? 0.1 : 12 }, 10)
        .addLabel('beat:veins', 21);

      // 2. The lamina lets go of its light; the same lines turn from leaf-green to water.
      tl.to('.wm-leaf', { opacity: 0, duration: 13 }, 24)
        .to(veins, { stroke: '#8fd0d2', duration: 13 }, 24)
        .to('.wm-backdrop', { '--wm-dark': 1, duration: 16 }, 24);

      // 3. The camera pulls out and rolls: the leaf turns into the basin, the basin into the world.
      if (reduced) {
        tl.to('.wm-map', { opacity: 0, duration: 4 }, 29)
          .fromTo(camera.current, { ...macro }, { ...wide, duration: 0.1, onUpdate: apply, immediateRender: false }, 33)
          .to('.wm-map', { opacity: 1, duration: 4 }, 34);
      } else {
        tl.fromTo(camera.current, { ...macro }, { ...wide, duration: 38, ease: 'power2.inOut', onUpdate: apply, immediateRender: false }, 30);
      }
      tl.to('.wm-basin', { '--vw': 0.16, duration: 38, ease: 'power2.inOut' }, 30)
        .to('.wm-vein--fine', { opacity: 0.18, duration: 20 }, 46)
        .addLabel('beat:river', 38)
        .fromTo('.wm-world', { opacity: 0 }, { opacity: 1, duration: 22 }, reduced ? 34 : 40)
        .to('.wm-backdrop', { '--wm-ocean': 1, duration: 22 }, reduced ? 34 : 40);

      // 4. The world, and the places that are lit in it.
      const lit = regions.filter((el) => el.dataset.kind === 'tropical' || el.dataset.kind === 'boreal');
      lit.forEach((el, i) => tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 4 }, 62 + i * 3.4));
      tl.fromTo(regions.filter((el) => !lit.includes(el)), { opacity: 0 }, { opacity: 1, duration: 5 }, 74)
        .fromTo('.wm-head, .wm-list, .wm-panel', { autoAlpha: 0 }, { autoAlpha: 1, duration: 7 }, 72)
        .addLabel('beat:world', 80);

      tl.eventCallback('onUpdate', () => {
        const done = tl.time() >= 70;
        settled.current = done;
        // Scrolling back into the dive releases any chosen region, so the camera and the scrub never disagree.
        if (!done && activeRef.current) {
          activeRef.current = null;
          setActive(null);
        }
      });
    },
  });

  // A chosen region frames itself; releasing it returns to the world. Only once the dive is over.
  useEffect(() => {
    activeRef.current = active;
    if (!geo || !settled.current) return;
    const target = active ? geo.regions.find((r) => r.id === active) : null;
    const view: View = target ? toView(target.bounds as [[number, number], [number, number]], target.id === 'aral' ? 9 : 6) : { k: 1, cx: MAP_W / 2, cy: MAP_H / 2 };
    const goal = { z: Math.log(view.k), cx: view.cx, cy: view.cy, rot: 0 };
    if (reduced) {
      Object.assign(camera.current, goal);
      apply();
      return;
    }
    const tween = gsap.to(camera.current, { ...goal, duration: MOTION.transformation, ease: 'power3.inOut', onUpdate: apply, overwrite: true });
    return () => { tween.kill(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, geo, reduced]);

  const select = (id: RegionId | null) => {
    setActive(id);
    if (id) announce(`${T.regions[id].name}. ${T.regions[id].text}`);
  };

  const info = active ? T.regions[active] : null;
  const facts: FactId[] = active ? REGIONS.find((r) => r.id === active)!.facts : ['forestShare'];
  const target = geo && active ? geo.regions.find((r) => r.id === active) : null;
  const lamp = target ? { x: (target.bounds[0][0] + target.bounds[1][0]) / 2, y: (target.bounds[0][1] + target.bounds[1][1]) / 2, r: Math.max(24, Math.max(target.bounds[1][0] - target.bounds[0][0], target.bounds[1][1] - target.bounds[0][1]) * 0.85) } : null;

  return (
    <Scene chapter="world" sectionRef={sectionRef} stageRef={stageRef} stageClassName="wm-stage">
      <div className="wm-backdrop" aria-hidden="true" />
      <p className="wm-scale-accessible visually-hidden">{T.scaleAlt}</p>
      <div className="wm-map" data-active={active ?? ''}>
        <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} preserveAspectRatio="xMidYMax meet" role="img" aria-label={info ? info.name : T.title}>
          <defs>
            <radialGradient id="wm-ocean-g" cx="50%" cy="46%" r="62%">
              <stop offset="0" stopColor="#12353a" />
              <stop offset="0.6" stopColor="#0a2024" />
              <stop offset="1" stopColor="#040c0d" />
            </radialGradient>
            <linearGradient id="wm-land-g" x1="0" y1="0" x2="0.25" y2="1">
              <stop offset="0" stopColor="#3b5a47" />
              <stop offset="0.55" stopColor="#25402f" />
              <stop offset="1" stopColor="#1a2e24" />
            </linearGradient>
            <radialGradient id="wm-lamina-g" cx="50%" cy="62%" r="70%">
              <stop offset="0" stopColor="#7ea646" />
              <stop offset="0.55" stopColor="#3f6a2d" />
              <stop offset="1" stopColor="#173a22" />
            </radialGradient>
            <radialGradient id="wm-lamp-g">
              <stop offset="0" stopColor="#f6dd94" stopOpacity="0.5" />
              <stop offset="0.55" stopColor="#f6dd94" stopOpacity="0.14" />
              <stop offset="1" stopColor="#f6dd94" stopOpacity="0" />
            </radialGradient>
          </defs>
          <g ref={cameraRef} className="wm-camera">
            {geo && venation ? (
              <>
                <g className="wm-world">
                  <path d={geo.sphere} className="wm-ocean" />
                  <g className="wm-tropics" data-on={tropics}>
                    <path d={geo.north} />
                    <path d={geo.south} />
                  </g>
                  <path d={geo.land} className="wm-coast" />
                  <path d={geo.land} className="wm-land" />
                  {lamp && <ellipse className="wm-lamp" cx={lamp.x} cy={lamp.y} rx={lamp.r * 1.5} ry={lamp.r} fill="url(#wm-lamp-g)" />}
                  {geo.regions.map((r) => (
                    <path key={r.id} d={r.d} className="wm-region" data-kind={r.kind} data-on={active === r.id} onClick={() => select(active === r.id ? null : r.id)} />
                  ))}
                  <g className="wm-borders">
                    {geo.regions.map((r) => active === r.id && <path key={r.id} d={r.borders} />)}
                  </g>
                </g>
                <g className="wm-basin" transform={`translate(${geo.basin.x.toFixed(2)} ${geo.basin.y.toFixed(2)}) rotate(${geo.basin.deg.toFixed(2)})`}>
                  <path d={venation.outline} className="wm-leaf" />
                  <path d={venation.tertiary} className="wm-vein wm-vein--fine" />
                  {venation.secondary.map((d, i) => <path key={i} d={d} className="wm-vein wm-vein--sec" />)}
                  <path d={venation.midrib} className="wm-vein wm-vein--mid" />
                </g>
                <g ref={labelsRef} className="wm-labels">
                  {geo.regions.map((r) => (
                    <text key={r.id} className="wm-label" data-on={active === r.id} x={r.marker[0]} y={r.marker[1]} textAnchor="middle">
                      {T.regions[r.id].name}
                    </text>
                  ))}
                </g>
              </>
            ) : null}
          </g>
        </svg>
      </div>

      <div className="wm-layout">
        <div className="wm-head">
          <p className="title">{T.title}</p>
          <p className="label wm-instruction">{T.instruction}</p>
        </div>

        <ul className="wm-list" aria-label={T.instruction}>
          {REGIONS.map((r) => (
            <li key={r.id}>
              <button type="button" className="wm-item" data-kind={r.kind} aria-pressed={active === r.id} onClick={() => select(active === r.id ? null : r.id)}>
                <span className="wm-dot" aria-hidden="true" />
                {T.regions[r.id].name}
              </button>
            </li>
          ))}
          <li>
            <button type="button" className="wm-item wm-item--toggle" aria-pressed={tropics} onClick={() => setTropics((t) => !t)}>
              <span className="wm-band" aria-hidden="true" />
              {T.tropics}
            </button>
          </li>
          {active && (
            <li>
              <button type="button" className="text-link" onClick={() => select(null)}>
                {T.reset}
              </button>
            </li>
          )}
        </ul>

        <div className="wm-panel" aria-live="off">
          <p className="wm-panel-name">{info ? info.name : T.overview}</p>
          <p className="body-copy">{info ? info.text : T.overviewText}</p>
          <p className="wm-geography-note">{T.geographyNote}</p>
          <div className="wm-facts">
            {facts.map((f) => (
              <StatLine key={f} factId={f} />
            ))}
          </div>
        </div>
      </div>
    </Scene>
  );
}
