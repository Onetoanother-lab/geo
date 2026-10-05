import { useMemo, useRef } from 'react';
import { Scene } from '../../components/layout/Scene';
import { useSceneTimeline } from '../../lib/animation/useSceneTimeline';
import { NARRATIVE } from '../../content/narrative';
import { StatLine, openSource } from '../../components/visualizations/StatLine';
import { DustField } from '../../components/visualizations/forest/DustField';
import { AralMap, SHAPES } from './AralMap';
import { AralGround, buildShrubs } from './AralGround';
import { useLocalGeography, viewBetween, viewTransform, WORLD_VIEW } from '../../lib/geography/useLocalGeography';
import { MAP_W, MAP_H } from '../../lib/geography/world';
import './Aral.css';

const T = NARRATIVE.aral;

/**
 * ACT VIII — the local, emotional chapter. Silence → a schematic retreating sea
 * → ground level salt desert and wind → planted saxaul patches that partly
 * stabilise the ground. Problem → intervention → partial protection.
 */
export function Aral() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const shrubs = useMemo(() => buildShrubs(8), []);
  const geography = useLocalGeography();

  useSceneTimeline(sectionRef, stageRef, {
    chapter: 'aral',
    length: 6.4,
    scrub: 0.8,
    revision: geography,
    build: (tl, { reduced, q, narrate }) => {
      const line = (sel: string, inAt: number, outAt?: number) => {
        narrate(sel, inAt, outAt);
      };

      // Silence, then the place name.
      tl.addLabel('beat:place', 3);
      line('.ar-place', 1, 8);
      tl.to('.ar-black', { opacity: 0, duration: 3 }, 0);
      if (geography) {
        // World, then Central Asia, then Uzbekistan: one camera that keeps its focus.
        const views = [WORLD_VIEW, geography.centralView, geography.uzView];
        const camera = { t: 0 };
        const frameCamera = () => {
          const i = Math.min(1, Math.floor(camera.t));
          q('.ar-geography-camera')[0]?.setAttribute('transform', viewTransform(viewBetween(views[i], views[i + 1], camera.t - i)));
        };
        frameCamera();
        tl.fromTo('.ar-geography', { opacity: 0 }, { opacity: 1, duration: 2 }, 0)
          .to('.ar-geo-world', { opacity: .15, duration: 3 }, 2)
          .fromTo('.ar-geo-central', { opacity: 0 }, { opacity: 1, duration: 2 }, 2)
          .fromTo(camera, { t: 0 }, { t: 1, duration: reduced ? .1 : 4, ease: 'power1.inOut', onUpdate: frameCamera, immediateRender: false }, 2)
          .addLabel('beat:centralasia', 5)
          .to('.ar-geo-central', { opacity: .25, duration: 2 }, 6)
          .fromTo('.ar-geo-uz', { opacity: 0 }, { opacity: 1, duration: 2 }, 6)
          .fromTo(camera, { t: 1 }, { t: 2, duration: reduced ? .1 : 4, ease: 'power1.inOut', onUpdate: frameCamera, immediateRender: false }, 6)
          .addLabel('beat:uzbekistan', 9)
          .to('.ar-geography', { opacity: 0, duration: 3 }, 11);
      }

      // Map: the sea retreats.
      tl.fromTo('.ar-map-wrap', { opacity: 0 }, { opacity: 1, duration: 3 }, 11);
      line('.ar-once', 13, 18);
      tl.addLabel('beat:once', 16);
      if (reduced) tl.set('.ar-water--north', { attr: { d: SHAPES.northNow } }, 24)
        .set('.ar-water--south', { attr: { d: SHAPES.southNow } }, 24);
      else tl.to('.ar-water--north', { morphSVG: SHAPES.northNow, duration: 14, ease: 'power1.inOut' }, 16)
        .to('.ar-water--south', { morphSVG: SHAPES.southNow, duration: 14, ease: 'power1.inOut' }, 16);
      tl.fromTo('.ar-seabed', { opacity: 0 }, { opacity: 1, duration: 10 }, 18)
        .fromTo('.ar-river', { drawSVG: '0% 100%' }, { drawSVG: '0% 55%', duration: 12 }, 16)
        .to('.ar-year--then', { opacity: 0, duration: 3 }, 26)
        .fromTo('.ar-year--now', { opacity: 0 }, { opacity: 1, duration: 3 }, 27);
      line('.ar-cause', 19, 31);
      tl.addLabel('beat:cause', 26);
      tl.fromTo('.ar-map-stats', { opacity: 0 }, { opacity: 1, duration: 4 }, 22).to('.ar-map-stats', { opacity: 0, duration: 3 }, 31);

      // Descend to ground level.
      if (!reduced) tl.to('.ar-map', { scale: 2.6, transformOrigin: '55% 62%', duration: 8, ease: 'power2.in' }, 31);
      tl.to('.ar-map-wrap', { opacity: 0, duration: 5 }, 33).fromTo('.ar-ground', { opacity: 0 }, { opacity: 1, duration: 6 }, 33);
      tl.fromTo('.ar-dust', { attr: { 'data-intensity': 0.2 } }, { attr: { 'data-intensity': 1 }, duration: 16 }, 36);
      tl.fromTo('.ar-haze', { opacity: 0.2 }, { opacity: 0.75, duration: 16 }, 36);
      line('.ar-left', 39, 49);
      tl.addLabel('beat:left', 44);
      line('.ar-wind', 50, 59);
      tl.addLabel('beat:wind', 55);

      // Intervention: planting spreads patch by patch.
      line('.ar-planting', 60, 77);
      tl.addLabel('beat:planting', 66);
      const plantStart = 60;
      shrubs.forEach((s) => {
        const el = q(`.ar-shrub[data-id="${s.id}"] .ar-shrub-body`)[0];
        if (!el) return;
        const at = plantStart + s.order * 20;
        if (reduced) tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 1 }, at);
        else tl.fromTo(el, { scale: 0.08, opacity: 0, transformOrigin: '50% 100%' }, { scale: 0.35, opacity: 1, duration: 2 }, at).to(el, { scale: 1, duration: 10, ease: 'power1.out' }, at + 2);
      });
      tl.fromTo('.ar-patch', { opacity: 0 }, { opacity: 1, duration: 8, stagger: 2 }, 64)
        .fromTo('.ar-saxaul-label', { opacity: 0 }, { opacity: 1, duration: 3 }, 70)
        .fromTo('.ar-planted-stat', { opacity: 0 }, { opacity: 1, duration: 3 }, 72)
        .to('.ar-dust', { attr: { 'data-intensity': 0.35 }, duration: 18 }, 72)
        .to('.ar-haze', { opacity: 0.35, duration: 18 }, 72);
      line('.ar-roots', 79, 87);
      tl.addLabel('beat:roots', 83);

      // Precision about limits.
      tl.to(['.ar-saxaul-label', '.ar-planted-stat'], { opacity: 0, duration: 3 }, 87);
      line('.ar-notsea', 88);
      line('.ar-partial', 92);
      tl.fromTo('.ar-limits', { opacity: 0 }, { opacity: 1, duration: 3 }, 94).addLabel('beat:partial', 97);
    },
  });

  return (
    <Scene chapter="aral" sectionRef={sectionRef} stageRef={stageRef} stageClassName="ar-stage">
      {geography && <svg className="ar-geography" viewBox={`0 0 ${MAP_W} ${MAP_H}`} role="img" aria-label={T.approachAlt}>
        <g className="ar-geography-camera">
          <path className="ar-geo-world" d={geography.world} />
          <path className="ar-geo-central" d={geography.central} />
          <path className="ar-geo-uz" d={geography.uz} />
        </g>
      </svg>}
      <div className="ar-map-wrap">
        <AralMap />
        <p className="ar-year ar-year--then label">{T.mapThen}</p>
        <p className="ar-year ar-year--now label">{T.mapNow}</p>
        <p className="ar-mapnote source-ref">
          {T.mapNote}{' '}
          <button type="button" onClick={() => openSource('nasa-aral')}>
            NASA Earth Observatory
          </button>
        </p>
        <div className="ar-map-stats">
          <StatLine factId="aralArea1960" />
          <StatLine factId="aralRemaining" />
        </div>
      </div>

      <div className="ar-ground">
        <div className="ar-sky" />
        <AralGround shrubs={shrubs} />
        <div className="ar-haze" />
        <DustField className="ar-dust" color="#a88d68" count={90} wind={{ x: 70, y: -6 }} intensity={0.2} seed={21} size={[0.6, 2.8]} />
        <p className="ar-saxaul-label">
          <span className="ar-saxaul-name">{T.saxaul}</span>
          <em>{T.saxaulLatin}</em>
          <span className="source-ref">
            <button type="button" onClick={() => openSource('novitskiy-2012')}>
              Novitskiy et al., 2012
            </button>
          </span>
        </p>
        <div className="ar-planted-stat">
          <p className="label">{T.reported}</p>
          <StatLine factId="aralPlanted" />
        </div>
      </div>

      <div className="ar-black" aria-hidden="true" />
      <p className="ar-place ar-line label">{T.place}</p>
      <p className="ar-once ar-line display">{T.once}</p>
      <p className="ar-cause ar-line ar-line--low lead">{T.cause}</p>
      <p className="ar-left ar-line display">{T.left}</p>
      <p className="ar-wind ar-line ar-line--low lead">{T.wind}</p>
      <div className="ar-planting ar-line ar-line--topleft">
        <p className="title">{T.planting}</p>
      </div>
      <div className="ar-roots ar-line ar-line--topleft">
        <p className="title">{T.roots}</p>
      </div>
      <p className="ar-notsea ar-line ar-line--top display">{T.notSea}</p>
      <p className="ar-partial ar-line ar-line--mid title">{T.partial}</p>
      <div className="ar-limits">
        <p className="body-copy">{T.limits}</p>
        <StatLine factId="saxaulEstablishment" />
      </div>
    </Scene>
  );
}
