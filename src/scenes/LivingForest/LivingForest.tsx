import { useRef, useState } from 'react';
import { Scene } from '../../components/layout/Scene';
import { useSceneTimeline } from '../../lib/animation/useSceneTimeline';
import { NARRATIVE } from '../../content/narrative';
import { StatLine } from '../../components/visualizations/StatLine';
import { announce } from '../../lib/accessibility/announce';
import { Diorama, HOTSPOTS, type Topic } from './Diorama';
import './LivingForest.css';

const T = NARRATIVE.system;
const TOPICS = Object.keys(T.hotspots) as Topic[];

/**
 * ACT II — understanding. A spatial cross-section of a forest; each hotspot
 * lights up the relationships it is part of (no cards: the scene itself changes).
 */
export function LivingForest() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Topic | 'all' | null>(null);
  const [seen, setSeen] = useState<Set<Topic>>(new Set());

  useSceneTimeline(sectionRef, stageRef, {
    chapter: 'system',
    length: 2.6,
    build: (tl, { reduced, narrate }) => {
      narrate('.ls-title', 12);
      tl.addLabel('beat:arrive', 0)
        .fromTo('.ls-fog', { opacity: 1 }, { opacity: 0, duration: 16 }, 0)
        .fromTo('.ls-hotspot', { opacity: 0 }, { opacity: 1, duration: 4, stagger: 1.2 }, 20)
        .fromTo('.ls-all', { opacity: 0 }, { opacity: 1, duration: 4 }, 24)
        .addLabel('beat:explore', 30)
        .fromTo('.ls-equation', { opacity: 0 }, { opacity: 1, duration: 6 }, 62)
        .fromTo('.ls-eq-before', { '--strike': 0 }, { '--strike': 1, duration: 6 }, 70)
        .fromTo('.ls-eq-after', { opacity: 0, y: reduced ? 0 : 10 }, { opacity: 1, y: 0, duration: 6 }, 76)
        .addLabel('beat:system', 84);
      if (reduced) tl.fromTo('.ls-underground-mask', { opacity: 1 }, { opacity: 0, duration: 4 }, 6);
      else tl.fromTo('.ls-underground-mask', { scaleY: 1 }, { scaleY: 0, duration: 18, ease: 'power2.inOut' }, 6)
        .fromTo('.diorama', { scale: 1.08 }, { scale: 1, duration: 30, ease: 'power2.out' }, 0);
    },
  });

  const select = (t: Topic | 'all') => {
    const next = active === t ? null : t;
    setActive(next);
    if (next && next !== 'all') {
      setSeen((s) => new Set(s).add(next));
      announce(`${T.hotspots[next].title}. ${T.hotspots[next].text}`);
    } else if (next === 'all') announce(T.equationAfter);
  };

  const activeAttr = active === 'all' ? TOPICS.join(' ') : active ?? '';
  const info = active && active !== 'all' ? T.hotspots[active] : null;

  return (
    <Scene chapter="system" sectionRef={sectionRef} stageRef={stageRef} stageClassName="ls-stage">
      <div className="ls-frame" data-active={activeAttr} data-any={active ? 'true' : 'false'}>
        <Diorama />
        <div className="ls-underground-mask" aria-hidden="true" />
        <div className="ls-hotspots" role="group" aria-label={T.instruction}>
          {HOTSPOTS.map((h) => (
            <button
              key={h.id}
              type="button"
              className="ls-hotspot"
              style={{ left: `${(h.x / 1600) * 100}%`, top: `${(h.y / 900) * 100}%` }}
              aria-pressed={active === h.id || active === 'all'}
              data-seen={seen.has(h.id)}
              onClick={() => select(h.id)}
            >
              <span className="ls-hotspot-ring" aria-hidden="true" />
              <span className="ls-hotspot-label">{T.hotspots[h.id].label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="ls-fog" aria-hidden="true" />

      <div className="ls-caption">
        <div className="ls-title">
          <p className="title">{T.title}</p>
          <p className="ls-instruction label">{T.instruction}</p>
        </div>
        <div className="ls-info" aria-live="off" data-visible={info ? 'true' : 'false'}>
          {info && (
            <>
              <p className="label ls-info-kicker">{info.label}</p>
              <p className="ls-info-title">{info.title}</p>
              <p className="body-copy">{info.text}</p>
              {active === 'wildlife' && (
                <div className="ls-info-stats">
                  <StatLine factId="amphibians" />
                  <StatLine factId="birds" />
                  <StatLine factId="mammals" />
                </div>
              )}
              {active === 'water' && <StatLine factId="forestWater" />}
              {active === 'tree' && <StatLine factId="carbonStock" />}
            </>
          )}
        </div>
        <button type="button" className="pill-button ls-all" aria-pressed={active === 'all'} onClick={() => select('all')}>
          {T.all}
        </button>
      </div>

      <p className="ls-equation" aria-label={`${T.equationLeft} ${T.equationAfter}`}>
        <span className="ls-eq-left">{T.equationLeft}</span>{' '}
        <span className="ls-eq-before" aria-hidden="true">
          {T.equationBefore}
        </span>{' '}
        <span className="ls-eq-after">{T.equationAfter}</span>
      </p>
    </Scene>
  );
}
