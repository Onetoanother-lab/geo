import { useMemo, useRef, useState } from 'react';
import { Scene } from '../../components/layout/Scene';
import { useSceneTimeline, progressToScroll } from '../../lib/animation/useSceneTimeline';
import { tweenLife } from '../../lib/animation/life';
import { NARRATIVE } from '../../content/narrative';
import { RECOVERY_MARKERS } from '../../content/caseStudies';
import { FACTS } from '../../content/facts';
import { openSource } from '../../components/visualizations/StatLine';
import { generateLayer, mergeLayer, mulberry32, range } from '../../lib/forest/generate';
import { rootSystem } from '../../lib/forest/roots';
import { sprout } from '../../components/visualizations/silhouettes';
import './RecoveryTimeline.css';

const T = NARRATIVE.recovery;
const BASE = { x: 800, y: 760 };

/**
 * ACT X — a contemplative reset. One seedling becomes a tree while time markers
 * pass; the forest structure around it forms only at the end.
 */
export function RecoveryTimeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);
  const [period, setPeriod] = useState(0);

  const art = useMemo(() => {
    const sys = rootSystem(BASE.x, BASE.y, 777, { length: 520, depth: 5, spread: 0.62, up: true });
    const rng = mulberry32(31);
    const crown = sys.tips.map(([x, y]) => ({ x, y, r: range(rng, 16, 34) }));
    return {
      segments: sys.segments,
      crown,
      far: mergeLayer(generateLayer({ seed: 501, count: 46, baseY: 700, baseJitter: 30, minH: 90, maxH: 210 })),
      shrubs: mergeLayer(generateLayer({ seed: 502, count: 30, baseY: 770, baseJitter: 40, minH: 40, maxH: 90, mix: { broadleaf: 1 }, gaps: [[640, 960]] })),
    };
  }, []);

  const trigger = useSceneTimeline(sectionRef, stageRef, {
    chapter: 'recovery',
    length: 4.6,
    scrub: 1.2,
    build: (tl, { reduced, q, narrate }) => {
      const line = (sel: string, a: number, b: number) => {
        narrate(sel, a, b || undefined);
      };
      tl.addLabel('beat:seed', 6);
      tl.fromTo('.rc-veil', { opacity: 1 }, { opacity: 0, duration: 6 }, 0);
      tweenLife(tl, q('.rc-scene')[0], 0, 0.85, 88, 8);
      line('.rc-plant', 2, 15);
      tl.fromTo('.rc-sprout', { scale: reduced ? 1 : 0, opacity: 0, transformOrigin: '50% 100%' }, { scale: 1, opacity: 1, duration: 6, ease: 'power2.out' }, 3).to('.rc-sprout', { opacity: 0, duration: 6 }, 16);

      // Branches by depth.
      const depthWindows = [
        [12, 26],
        [22, 40],
        [34, 54],
        [46, 66],
        [56, 76],
        [64, 82],
      ];
      depthWindows.forEach(([a, b], d) => {
        const segs = q(`.rc-seg[data-depth="${d}"]`);
        if (segs.length) tl.fromTo(segs, { drawSVG: '0%' }, { drawSVG: '100%', duration: b - a, stagger: (b - a) / (segs.length * 3) }, a);
      });
      if (!reduced) tl.fromTo('.rc-tree', { scale: 0.42, transformOrigin: `${BASE.x}px ${BASE.y}px` }, { scale: 1, duration: 70, ease: 'power1.out' }, 12);
      tl.fromTo('.rc-crown circle', { opacity: 0, scale: reduced ? 1 : 0.2, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 4, stagger: { amount: 16, from: 'center' } }, 58);

      line('.rc-sapling', 19, 34);
      tl.addLabel('beat:sapling', 26);
      tl.fromTo('.rc-moss', { opacity: 0 }, { opacity: 1, duration: 20 }, 30);
      line('.rc-structure', 40, 57);
      tl.addLabel('beat:structure', 48);
      tl.fromTo('.rc-shrubs', { opacity: 0 }, { opacity: 1, duration: 18 }, 50);
      line('.rc-century', 62, 79);
      tl.addLabel('beat:century', 70);
      tl.fromTo('.rc-far', { opacity: 0 }, { opacity: 1, duration: 22 }, 66);
      tl.fromTo('.rc-bird', { opacity: 0, x: reduced ? 0 : -120, y: reduced ? 0 : -60 }, { opacity: 1, x: 0, y: 0, duration: 8, ease: 'power2.out' }, 84);
      line('.rc-notequal', 84, 0);
      tl.addLabel('beat:notequal', 92);

      // Time markers light up in turn.
      q('.rc-time-ring').forEach((m, i) => {
        tl.fromTo(m, { opacity: 0.16 }, { opacity: 0.85, duration: 3 }, RECOVERY_MARKERS[i].at * 100 - 2);
      });
      tl.eventCallback('onUpdate', () => {
        const p = tl.time() / 100;
        let i = 0;
        RECOVERY_MARKERS.forEach((m, k) => { if (p + .001 >= m.at) i = k; });
        setPeriod((previous) => previous === i ? previous : i);
        if (sliderRef.current && document.activeElement !== sliderRef.current) sliderRef.current.value = String(Math.round(p * 100));
      });
    },
  });

  const rootStroke = (d: number) => [22, 13, 7, 4, 2.4, 1.4][d] ?? 1;
  const goToTime = (p: number) => { if (trigger.current) window.scrollTo({ top: progressToScroll(trigger.current, p), behavior: 'auto' }); };
  const marker = RECOVERY_MARKERS[period];

  return (
    <Scene chapter="recovery" sectionRef={sectionRef} stageRef={stageRef} stageClassName="rc-stage">
      <div className="rc-scene" style={{ ['--life' as string]: 0 }}>
        <div className="rc-sky" />
        <svg className="rc-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
          <path d={art.far} className="rc-far" />
          <rect x="0" y={BASE.y} width="1600" height="200" className="rc-ground" />
          <rect x="0" y={BASE.y - 2} width="1600" height="12" className="rc-moss" />
          <path d={art.shrubs} className="rc-shrubs" />
          <g className="rc-tree">
            {art.segments.map((s, i) => (
              <path key={i} d={s.d} className="rc-seg" data-depth={s.depth} strokeWidth={rootStroke(s.depth)} />
            ))}
            <g className="rc-crown">
              {art.crown.map((c, i) => (
                <circle key={i} cx={c.x} cy={c.y} r={c.r} />
              ))}
            </g>
          </g>
          <path d={sprout(5)} transform={`translate(${BASE.x} ${BASE.y})`} className="rc-sprout" />
          <path d="M1060,300Q1066,293 1072,300Q1078,293 1084,300" className="rc-bird" />
        </svg>
      </div>

      <div className="rc-time-nav" data-local-keys>
        <svg className="rc-rings" viewBox="0 0 440 440" aria-hidden="true">
          {RECOVERY_MARKERS.map((m, i) => <g key={m.label}>
            <circle className="rc-time-ring" cx="220" cy="220" r={38 + i * 32} />
            <text x="225" y={224 - (38 + i * 32)}>{m.label}</text>
          </g>)}
        </svg>
        <div className="rc-time-stops" role="group" aria-label={T.ringsLabel}>
          {RECOVERY_MARKERS.map((m, i) => <button key={m.label} type="button" aria-pressed={i === period} onClick={() => goToTime(m.at)}>{m.label}</button>)}
        </div>
        <label className="visually-hidden" htmlFor="rc-time">{T.timeLabel}</label>
        <input ref={sliderRef} id="rc-time" type="range" min="0" max="100" defaultValue="0" onInput={(e) => goToTime(Number(e.currentTarget.value) / 100)} aria-valuetext={marker.label} />
        <p className="rc-time-fact" aria-live="polite">{marker.factId ? <><strong>{FACTS[marker.factId].value} {FACTS[marker.factId].unit}</strong> — {FACTS[marker.factId].label}</> : T.plantingFast}</p>
      </div>
      <p className="rc-study source-ref">
        {T.studyNote}{' '}
        <button type="button" onClick={() => openSource('poorter-2021')}>
          Poorter et al., Science, 2021
        </button>
      </p>

      <div className="rc-lines">
        <p className="rc-plant display">{T.plant}</p>
        <p className="rc-sapling display">{T.sapling}</p>
        <p className="rc-structure display">{T.structure}</p>
        <p className="rc-century display">{T.century}</p>
        <p className="rc-notequal title">{T.notEqual}</p>
      </div>
      <div className="rc-veil" aria-hidden="true" />
    </Scene>
  );
}
