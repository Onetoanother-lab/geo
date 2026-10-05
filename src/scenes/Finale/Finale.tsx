import { useRef } from 'react';
import { Scene } from '../../components/layout/Scene';
import { ForestScene } from '../../components/visualizations/forest/ForestScene';
import { gsap, useGSAP } from '../../lib/animation/gsap';
import { MOTION } from '../../lib/animation/motion';
import { sceneHealth } from '../../lib/cinema/ecology';
import { announce } from '../../lib/accessibility/announce';
import { useSceneTimeline } from '../../lib/animation/useSceneTimeline';

import { setState, useStore, useReducedMotion } from '../../app/store';
import { NARRATIVE } from '../../content/narrative';
import './Finale.css';

const T = NARRATIVE.finale;

/**
 * ACT XII — reflection. The opening composition returns with the audience's
 * remembered choices. Two quiet lines settle over a living forest.
 */
export function Finale() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const active = useStore((s) => s.chapterId === 'finale');
  const balance = useStore((s) => s.futureBalance);
  const result = useStore((s) => s.simulatorResult);
  const reduced = useReducedMotion();
  const health = sceneHealth('finale', 1, result, balance);
  useSceneTimeline(sectionRef, stageRef, {
    chapter: 'finale', length: 1.3,
    build: (tl) => { tl.addLabel('beat:echo', 0).addLabel('beat:reflection', 65); },
  });
  useGSAP(() => {
    const stage = stageRef.current;
    if (!active || !stage) return;
    const duration = reduced ? MOTION.reduced : MOTION.text;
    stage.dataset.hush = '1';
    stage.dataset.settled = 'false';
    stage.dataset.beat = 'Qaytish';
    const tl = gsap.timeline();
    tl.set('.fi-before, .fi-after', { autoAlpha: 0 })
      .to('.fi-forest .forest-scene', { '--life': health, duration: reduced ? MOTION.reduced : MOTION.environment }, 0)
      .call(() => { stage.dataset.hush = '0'; stage.dataset.settled = 'true'; }, [], MOTION.idle)
      .to('.fi-before', { autoAlpha: 1, duration }, MOTION.idle + MOTION.hold)
      .call(() => announce(T.echoBefore), [], MOTION.idle + MOTION.hold)
      .to('.fi-after', { autoAlpha: 1, duration }, MOTION.idle + MOTION.hold * 2 + MOTION.text)
      .call(() => { announce(T.echoAfter); stage.dataset.hush = '1'; stage.dataset.beat = 'Uni biz yozamiz'; }, [], MOTION.idle + MOTION.hold * 2 + MOTION.text + duration);
    return () => { delete stage.dataset.hush; delete stage.dataset.settled; delete stage.dataset.beat; };
  }, { scope: sectionRef, dependencies: [active, balance, reduced, health], revertOnUpdate: true });

  return (
    <Scene
      chapter="finale"
      sectionRef={sectionRef}
      stageRef={stageRef}
      stageClassName="fi-stage"

    >
      <div className="fi-forest">
        <ForestScene hero inscription seed={11} life={health} style={{ ['--final-life' as string]: health }} />
      </div>
      <div className="fi-lines">
        <p className="fi-before display">{T.echoBefore}</p>
        <p className="fi-after display">{T.echoAfter}</p>

      </div>
      <div className="fi-compare" data-local-keys>
        <label htmlFor="fi-choice">{NARRATIVE.futures.seam}</label>
        <input id="fi-choice" type="range" min="0" max="100" value={Math.round(balance * 100)} onChange={(e) => setState({ futureBalance: Number(e.target.value) / 100 })} aria-valuetext={balance < .5 ? NARRATIVE.futures.aLabel : NARRATIVE.futures.bLabel} />
        <p>{NARRATIVE.futures.disclaimer}</p>
      </div>
    </Scene>
  );
}
