import { useMemo, useRef } from 'react';
import { Scene } from '../../components/layout/Scene';
import { tweenLife } from '../../lib/animation/life';
import { useSceneTimeline, progressToScroll } from '../../lib/animation/useSceneTimeline';
import { NARRATIVE } from '../../content/narrative';
import { StatLine } from '../../components/visualizations/StatLine';
import { Landscape, buildTrees } from './Landscape';
import { DustField } from '../../components/visualizations/forest/DustField';
import './DeforestationReveal.css';

const T = NARRATIVE.cut;
const LOSS_START = 10;
const LOSS_SPAN = 78;

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Illustrative indicator curves (relative 0..1, not measurements). */
export function indicatorLevels(loss: number) {
  return {
    canopy: 1 - loss,
    habitat: Math.max(0, 1 - Math.pow(loss, 0.65) * 1.05),
    soil: 1 - smooth(0.18, 0.8, loss) * 0.92,
    water: 1 - smooth(0.32, 0.92, loss) * 0.85,
    humidity: 1 - loss * 0.8,
  };
}

const INDICATORS = ['canopy', 'habitat', 'soil', 'water', 'humidity'] as const;

/**
 * ACT III — disturbance. The showcase transformation: scrolling (or dragging)
 * clears the forest tree by tree, and every connected system responds at once.
 */
export function DeforestationReveal() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);
  const trees = useMemo(() => buildTrees(42), []);

  const trigger = useSceneTimeline(sectionRef, stageRef, {
    chapter: 'cut',
    length: 4.4,
    build: (tl, { reduced, q, stage, narrate }) => {
      const root = q('.dr-scene')[0];
      const at = (loss: number) => LOSS_START + loss * LOSS_SPAN;

      tl.addLabel('beat:start', 0);
      narrate('.dr-prompt', 1, at(0.12));

      // Palette + atmosphere follow the loss continuously.
      tweenLife(tl, root, 1, 0, LOSS_SPAN, LOSS_START);
      tl.fromTo('.dr-glare', { opacity: 0 }, { opacity: 0.55, duration: LOSS_SPAN * 0.5 }, at(0.45))
        .fromTo('.dr-far-forest', { opacity: 1 }, { opacity: 0.25, duration: LOSS_SPAN * 0.8 }, at(0.15))
        .fromTo('.dr-plume', { opacity: 0 }, { opacity: 1, duration: LOSS_SPAN * 0.45 }, at(0.45))
        .fromTo('.dr-runoff-path', { opacity: 0, drawSVG: '0%' }, { opacity: 1, drawSVG: '100%', duration: 8, stagger: 1.5 }, at(0.36))
        .fromTo('.dr-gully', { drawSVG: '0%' }, { drawSVG: '100%', duration: 14, stagger: 2 }, at(0.55));

      // Trees fall along the clearing frontier.
      for (const t of trees) {
        const el = q(`.dr-tree[data-id="${t.id}"]`)[0];
        if (!el) continue;
        const crown = el.querySelector('.dr-crown');
        const stump = el.querySelector('.dr-stump');
        const soil = el.querySelector('.dr-soil');
        const pos = at(t.order * 0.98);
        if (reduced) tl.to(crown, { opacity: 0, duration: 1.2 }, pos);
        else tl.to(crown, { rotation: 78 * t.lean, transformOrigin: '50% 100%', opacity: 0, duration: 1.6, ease: 'power2.in' }, pos);
        tl.fromTo(stump, { opacity: 0 }, { opacity: 1, duration: 0.6 }, pos + 0.8).fromTo(soil, { opacity: 0 }, { opacity: 1, duration: 2 }, pos + 0.6);
      }

      // Wildlife leaves before the forest is gone.
      tl.to('.dr-bird', { opacity: 0, y: reduced ? 0 : -40, duration: 3, stagger: 2.2 }, at(0.06))
        .to('.dr-butterflies', { opacity: 0, duration: 4 }, at(0.22))
        .to('.dr-deer', { opacity: 0, duration: 5, stagger: 6 }, at(0.3));

      // Narrative moments.
      const moments = q('.dr-moment');
      const ats = [0.14, 0.38, 0.62, 0.88];
      moments.forEach((m, i) => {
        narrate(m, at(ats[i]), i < moments.length - 1 ? at(ats[i + 1]) - 3 : undefined);
        tl.addLabel(`beat:m${i}`, at(ats[i]) + 4);
      });
      tl.fromTo('.dr-stat', { opacity: 0 }, { opacity: 1, duration: 4 }, 92).addLabel('beat:stat', 97);

      // Indicators + slider follow the (smoothed) timeline position.
      const bars = INDICATORS.map((k) => stage.querySelector<HTMLElement>(`[data-indicator="${k}"]`));
      tl.eventCallback('onUpdate', () => {
        const t = tl.time();
        const loss = Math.min(1, Math.max(0, (t - LOSS_START) / LOSS_SPAN));
        const lv = indicatorLevels(loss);
        INDICATORS.forEach((k, i) => bars[i]?.style.setProperty('--level', lv[k].toFixed(3)));
        if (sliderRef.current && document.activeElement !== sliderRef.current) sliderRef.current.value = (loss * 100).toFixed(1);
        stage.dataset.loss = loss > 0.5 ? 'high' : 'low';
      });
    },
  });

  const onSlide = (v: number) => {
    const st = trigger.current;
    if (!st) return;
    const progress = (LOSS_START + (v / 100) * LOSS_SPAN) / 100;
    window.scrollTo({ top: progressToScroll(st, progress), behavior: 'auto' });
  };

  return (
    <Scene chapter="cut" sectionRef={sectionRef} stageRef={stageRef} stageClassName="dr-stage">
      <div className="dr-scene" style={{ ['--life' as string]: 1 }}>
        <div className="dr-sky" />
        <div className="dr-sun" />
        <Landscape trees={trees} />
        <DustField className="dr-life-dust" count={42} />
        <div className="dr-mist" />
        <div className="dr-glare" />
      </div>
      <div className="scrim-bottom" />

      <p className="dr-prompt title">{T.prompt}</p>
      <div className="dr-moments" aria-live="off">
        {T.moments.map((m) => (
          <p key={m} className="dr-moment lead">
            {m}
          </p>
        ))}
      </div>
      <div className="dr-stat">
        <p className="label">{T.statIntro}</p>
        <StatLine factId="deforestationNow" size="large" />
      </div>

      <div className="dr-instruments" role="group" aria-label={T.disclaimer}>
        {INDICATORS.map((k) => (
          <div key={k} className="dr-indicator" data-indicator={k} style={{ ['--level' as string]: 1 }}>
            <span className="dr-indicator-label">{T.indicators[k]}</span>
            <span className="dr-indicator-track" aria-hidden="true">
              <span className="dr-indicator-fill" />
            </span>
          </div>
        ))}
        <p className="dr-disclaimer">{T.disclaimer}</p>
      </div>

      <div className="dr-control" data-local-keys>
        <span className="dr-control-end label">{T.left}</span>
        <input
          ref={sliderRef}
          className="dr-slider"
          type="range"
          min={0}
          max={100}
          step={0.5}
          defaultValue={0}
          aria-label={T.sliderLabel}
          onInput={(e) => onSlide(Number((e.target as HTMLInputElement).value))}
        />
        <span className="dr-control-end label">{T.right}</span>
      </div>
    </Scene>
  );
}
