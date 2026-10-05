import { useEffect, useMemo, useRef, useState } from 'react';
import { Scene } from '../../components/layout/Scene';
import { useSceneTimeline } from '../../lib/animation/useSceneTimeline';
import { gsap } from '../../lib/animation/gsap';
import { getState, isReducedMotion, useReducedMotion } from '../../app/store';
import { NARRATIVE } from '../../content/narrative';
import { StatLine } from '../../components/visualizations/StatLine';
import type { FactId } from '../../content/facts';
import { announce } from '../../lib/accessibility/announce';
import { box, frame, graticule, latBand, loadCountries, makeProjection, MAP_H, MAP_W, pathFor, type CountryFeature } from '../../lib/geography/world';
import { requestRefresh } from '../../lib/animation/refresh';
import { LEAF, VEINS, RIVERS, RIVER_SPINE, GEO_LINES } from '../../lib/cinema/motifs';
import { MOTION } from '../../lib/animation/motion';
import './WorldMap.css';

const T = NARRATIVE.world;
type RegionId = keyof typeof T.regions;

const REGIONS: { id: RegionId; countries: string[]; marker: [number, number]; facts: FactId[]; frameBox?: [number, number, number, number]; kind: 'tropical' | 'boreal' | 'dry' | 'case' | 'local' }[] = [
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
 * ACT VI — scale. Storytelling geography: a quiet Equal Earth map with a few
 * regions that glow and frame themselves when chosen. Data is bundled.
 */
export function WorldMap() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<SVGGElement>(null);
  const reduced = useReducedMotion();
  const [countries, setCountries] = useState<CountryFeature[] | null>(null);
  const [active, setActive] = useState<RegionId | null>(null);
  const [tropics, setTropics] = useState(true);



  useEffect(() => {
    let alive = true;
    void loadCountries().then((c) => {
      if (alive) {
        setCountries(c);
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
    if (!countries) return null;
    const byId = new Map(countries.filter((c) => c.id).map((c) => [c.id as string, c]));
    const regionPaths = REGIONS.map((r) => ({
      id: r.id,
      kind: r.kind,
      d: r.countries.map((id) => (byId.get(id) ? path(byId.get(id)!) ?? '' : '')).join(''),
      bounds: r.frameBox
        ? path.bounds(box(...r.frameBox))
        : path.bounds({ type: 'FeatureCollection', features: r.countries.map((id) => byId.get(id)).filter(Boolean) as CountryFeature[] }),
      marker: projection(r.marker) ?? [0, 0],
    }));
    return {
      land: countries.map((c) => path(c) ?? '').join(''),
      graticule: path(graticule) ?? '',
      sphere: path({ type: 'Sphere' }) ?? '',
      tropics: path(latBand(-23.44, 23.44)) ?? '',
      regions: regionPaths,
    };
  }, [countries, path, projection]);

  useSceneTimeline(sectionRef, stageRef, {
    chapter: 'world', length: 4.2, revision: geo,
    build: (tl, { reduced, q }) => {
      if (!geo) return;
      tl.addLabel('beat:leaf', 3)
        .fromTo('.wm-scale', { autoAlpha: 0 }, { autoAlpha: 1, duration: 4 }, 0)
        .fromTo('.wm-scale-vein', { drawSVG: '0%' }, { drawSVG: '100%', duration: reduced ? .1 : 10, stagger: 1 }, 3)
        .addLabel('beat:veins', 17);
      q('.wm-scale-vein').forEach((el, i) => {
        tl.to(el, reduced ? { attr: { d: RIVERS[i] }, duration: .1 } : { morphSVG: RIVERS[i], duration: 17 }, 18)
          .to(el, reduced ? { attr: { d: GEO_LINES[i] }, duration: .1 } : { morphSVG: GEO_LINES[i], duration: 16 }, 36);
      });
      tl.to('.wm-scale-leaf', { opacity: 0, duration: 10 }, 18)
        .to('.wm-scale-spine', reduced ? { attr: { d: RIVER_SPINE }, duration: .1 } : { morphSVG: RIVER_SPINE, duration: 17 }, 18)
        .to('.wm-scale-spine', { opacity: 0, duration: 10 }, 36)
        .addLabel('beat:river', 32)
        .fromTo('.wm-layout', { autoAlpha: 0 }, { autoAlpha: 1, duration: 12 }, 42)
        .to('.wm-scale', { autoAlpha: 0, duration: 9 }, 49)
        .fromTo('.wm-land', { opacity: .12 }, { opacity: 1, duration: 12 }, 46);
      // Forest regions arrive one at a time, so the newest one holds attention;
      // the places of the later cases join quietly with the controls.
      const regions = q('.wm-region');
      regions.filter((el) => el.dataset.kind === 'tropical' || el.dataset.kind === 'boreal').forEach((el, i) => {
        tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 3 }, 52 + i * 3.5);
      });
      tl.fromTo(regions.filter((el) => el.dataset.kind !== 'tropical' && el.dataset.kind !== 'boreal'), { opacity: 0 }, { opacity: 1, duration: 5 }, 66)
        .fromTo('.wm-head, .wm-list, .wm-panel', { autoAlpha: 0 }, { autoAlpha: 1, duration: 7 }, 66)
        .addLabel('beat:world', 75);
    },
  });

  // Camera: frame the selected region.
  useEffect(() => {
    const g = cameraRef.current;
    if (!g || !geo) return;
    const target = active ? geo.regions.find((r) => r.id === active) : null;
    const { k, tx, ty } = target ? frame(target.bounds as [[number, number], [number, number]], target.id === 'aral' ? 9 : 6) : { k: 1, tx: 0, ty: 0 };
    const transform = `translate(${tx.toFixed(2)},${ty.toFixed(2)}) scale(${k.toFixed(3)})`;
    if (isReducedMotion(getState())) g.setAttribute('transform', transform);
    const tween = !isReducedMotion(getState()) ? gsap.to(g, { attr: { transform }, duration: MOTION.transformation, ease: 'power3.inOut' }) : null;
    g.style.setProperty('--k', String(k));
    return () => { tween?.kill(); };
  }, [active, geo, reduced]);

  const select = (id: RegionId | null) => {
    setActive(id);
    if (id) announce(`${T.regions[id].name}. ${T.regions[id].text}`);
  };

  const info = active ? T.regions[active] : null;
  const facts: FactId[] = active ? REGIONS.find((r) => r.id === active)!.facts : ['forestShare'];

  return (
    <Scene chapter="world" sectionRef={sectionRef} stageRef={stageRef} stageClassName="wm-stage">
      <div className="wm-scale" aria-hidden="true">
        <svg viewBox="0 0 1600 900">
          <path className="wm-scale-leaf" d={LEAF} />
          <path className="wm-scale-spine" d="M800,700C810,530 795,365 800,180" />
          {VEINS.map((d, i) => <path className="wm-scale-vein" key={i} d={d} />)}
        </svg>
      </div>
      <p className="wm-scale-accessible visually-hidden">{T.scaleAlt}</p>
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

        <div className="wm-map" data-active={active ?? ''}>
          <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} role="img" aria-label={info ? info.name : T.title}>
            <defs>
              <filter id="wm-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <g ref={cameraRef} className="wm-camera">
              {geo ? (
                <>
                  <path d={geo.sphere} className="wm-sphere" />
                  <path d={geo.graticule} className="wm-graticule" />
                  <path d={geo.tropics} className="wm-tropics" data-on={tropics} />
                  <path d={geo.land} className="wm-land" />
                  {geo.regions.map((r) => (
                    <path key={r.id} d={r.d} className="wm-region" data-kind={r.kind} data-on={active === r.id} onClick={() => select(active === r.id ? null : r.id)} />
                  ))}

                </>
              ) : (
                <path d={path({ type: 'Sphere' }) ?? ''} className="wm-sphere" />
              )}
            </g>
          </svg>
        </div>

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
