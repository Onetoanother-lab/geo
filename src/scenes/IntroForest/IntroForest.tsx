import { useRef } from 'react';
import { Scene } from '../../components/layout/Scene';
import { Narration } from '../../components/layout/Narration';
import { ForestScene, HERO } from '../../components/visualizations/forest/ForestScene';
import { useSceneTimeline } from '../../lib/animation/useSceneTimeline';
import { gsap, useGSAP } from '../../lib/animation/gsap';
import { getState, useReducedMotion, useStore } from '../../app/store';
import { audio } from '../../lib/audio/engine';
import { NARRATIVE } from '../../content/narrative';
import { FALL, MOTION } from '../../lib/animation/motion';
import { announce } from '../../lib/accessibility/announce';
import './IntroForest.css';

const T = NARRATIVE.intro;

/** Small perched birds near the hero canopy — they leave before the fall. */
const BIRDS = [
  { x: 960, y: 300, s: 1 },
  { x: 1052, y: 262, s: 0.8 },
  { x: 1110, y: 330, s: 0.9 },
  { x: 905, y: 352, s: 0.7 },
  { x: 1004, y: 236, s: 0.75 },
];

/**
 * ACT I — wonder → first disturbance. A pinned walk into the forest; the tall
 * tree at the centre falls; the palette drains slightly; the camera lowers into
 * the fog that opens Act II.
 */
export function IntroForest() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const entered = useStore((s) => s.entered);
  const reducedMotion = useReducedMotion();

  // Time-based dawn once the gate opens (independent from scroll).
  useGSAP(
    () => {
      if (!entered) return;
      gsap.fromTo('.intro-dawn', { opacity: 1 }, { opacity: 0, duration: reducedMotion ? MOTION.reduced : MOTION.transformation, ease: 'power2.inOut', delay: 0.4 });
      gsap.fromTo('.intro-once-wrap', { opacity: 0, y: reducedMotion ? 0 : 12 }, { opacity: 1, y: 0, duration: reducedMotion ? MOTION.reduced : MOTION.text, ease: 'power2.out', delay: 1.9 });
      gsap.fromTo('.intro-hint-reveal', { opacity: 0 }, { opacity: 1, duration: 1.2, delay: 4.2 });
    },
    { scope: sectionRef, dependencies: [entered, reducedMotion], revertOnUpdate: true },
  );

  useSceneTimeline(sectionRef, stageRef, {
    chapter: 'intro',
    length: 5.2,
    build: (tl, { reduced, q, stage }) => {
      const forest = q('.forest-scene')[0];
      const [d0, d1, d2, d3] = [0, 1, 2, 3].map((i) => q(`.fs-depth[data-depth="${i}"]`)[0]);
      const heroTree = q('.fs-hero-tree')[0];
      const stump = q('.fs-hero-stump')[0];

      tl.addLabel('beat:start', 0);
      tl.fromTo('.intro-hint', { opacity: 1 }, { opacity: 0, duration: 4 }, 1);
      tl.to('.intro-once', { opacity: 0, y: reduced ? 0 : -20, duration: 6 }, 12);

      // Walking in: each depth plane grows at its own rate.
      if (!reduced) {
        tl.to(d0, { scale: 1.05, duration: 48 }, 0)
          .to(d1, { scale: 1.12, duration: 48 }, 0)
          .to(d2, { scale: 1.24, yPercent: 2, duration: 48 }, 0)
          .to(d3, { scale: 1.55, duration: 48 }, 0);
      }

      tl.fromTo('.intro-notonly', { opacity: 0, y: reduced ? 0 : 24 }, { opacity: 1, y: 0, duration: 5 }, 21)
        .fromTo('.intro-alive', { opacity: 0 }, { opacity: 1, duration: 5 }, 26)
        .addLabel('beat:system', 31)
        .to(['.intro-notonly', '.intro-alive'], { opacity: 0, duration: 4 }, 38);

      // The audience reveals the connections before a single thread breaks.
      tl.to('.fs-roots', { opacity: 0.52, duration: 9 }, 23)
        .to('.fs-root-connection', { opacity: 0, duration: 2 }, 39)
        .addLabel('beat:hush', 41)
        .addLabel('beat:fall', 50)
        .addLabel('beat:loss', 69)
        .addLabel('beat:change', 86);

      let status: 'idle' | 'running' | 'complete' = 'idle';
      const condition = { health: .96, hush: 1 };
      const mark = (beat: string) => { stage.dataset.beat = beat; };
      const duration = reduced ? MOTION.reduced : MOTION.text;
      let statementTimers: number[] = [];
      let statementTweens: gsap.core.Tween[] = [];
      const clearStatements = () => {
        statementTimers.forEach(window.clearTimeout);
        statementTweens.forEach((tween) => tween.kill());
        statementTimers = []; statementTweens = [];
      };
      const textTo = (selector: string, visible: boolean) => {
        statementTweens.push(gsap.to(q(selector), { autoAlpha: visible ? 1 : 0, duration }));
      };
      const scheduleStatements = () => {
        // This hold is real elapsed time after the actual impact callback. GSAP's
        // lag smoothing must not stretch silence when a projector drops frames.
        const after = (seconds: number, callback: () => void) => {
          statementTimers.push(window.setTimeout(() => {
            if (tl.scrollTrigger?.isActive && status !== 'idle') callback();
          }, seconds * 1000));
        };
        after(FALL.firstLine - FALL.impact, () => {
          announce(T.notJust); mark(T.notJust); stage.dataset.fall = 'first-line';
          stage.dataset.firstLineAt = String(performance.now()); textTo('.intro-notjust', true);
        });
        after(FALL.secondLine - FALL.impact - duration, () => textTo('.intro-notjust', false));
        after(FALL.secondLine - FALL.impact, () => {
          announce(T.system); mark(T.system); stage.dataset.fall = 'second-line';
          textTo('.intro-systemline', true);
          statementTweens.push(gsap.to(q('.fs-roots'), { opacity: .44, duration: MOTION.environment }));
        });
      };
      gsap.set(q('.intro-notjust, .intro-systemline'), { autoAlpha: 0 });
      const fall = gsap.timeline({ paused: true, onUpdate: () => {
        stage.dataset.health = String(condition.health);
        stage.dataset.hush = String(condition.hush);
      }, onComplete: () => { status = 'complete'; stage.dataset.fall = 'complete'; } });
      fall.call(() => { mark('O‘rmon jimiydi'); stage.dataset.fall = 'hush'; }, [], 0)
        .to(q('.intro-bird'), { opacity: 0, x: reduced ? 0 : -180, y: reduced ? 0 : -95, stagger: .14, duration: reduced ? .2 : 1.4 }, FALL.birds)
        .to(condition, { health: .22, duration: 1.4 }, FALL.birds)
        .to(condition, { hush: .035, duration: .8 }, FALL.wind)
        .call(() => audio.cue('creak'), [], FALL.creak)
        .call(() => audio.cue('creak'), [], FALL.secondCreak)
        .call(() => { mark('Daraxt qulaydi'); stage.dataset.fall = 'falling'; }, [], FALL.movement);
      if (reduced) {
        fall.to(heroTree, { opacity: 0, duration: .2 }, FALL.impact - .2)
          .to(stump, { opacity: 1, duration: .2 }, FALL.impact);
      } else {
        fall.to(heroTree, { rotation: -2, svgOrigin: `${HERO.x} ${HERO.y}`, duration: .6, ease: 'sine.inOut' }, FALL.movement)
          .to(heroTree, { rotation: -86, svgOrigin: `${HERO.x} ${HERO.y}`, duration: 1.1, ease: 'power3.in' }, FALL.movement + .6)
          .set(stump, { opacity: 1 }, FALL.impact)
          .to(heroTree, { opacity: 0, duration: .45 }, FALL.impact + .2)
          .to(forest, { keyframes: { y: [0, 3, -2, 0] }, duration: .32 }, FALL.impact)
          .fromTo('.intro-impact', { opacity: 0, scale: .65 }, { opacity: .6, scale: 1, duration: .45, ease: 'power2.out' }, FALL.impact)
          .to('.intro-impact', { opacity: 0, scale: 1.3, duration: 1.5 }, FALL.impact + .45);
      }
      fall.call(() => { audio.cue('impact'); mark('Sukut'); stage.dataset.fall = 'impact'; stage.dataset.impactAt = String(performance.now()); scheduleStatements(); }, [], FALL.impact)
        .to(forest, { '--life': .58, duration: MOTION.environment }, FALL.impact)
        .to('.intro-gap', { opacity: .7, duration: MOTION.environment }, FALL.impact)
        .to('.intro-stump-rings', { opacity: .65, duration: duration }, FALL.impact + 1)
        .to(condition, { health: .58, hush: .3, duration: MOTION.environment }, FALL.secondLine + .4)
        .set({}, {}, FALL.complete);

      tl.eventCallback('onUpdate', () => {
        if (!getState().entered) return;
        const time = tl.time();
        if (time < 38 && status !== 'idle') {
          clearStatements();
          gsap.set(q('.intro-notjust, .intro-systemline'), { autoAlpha: 0 });
          fall.pause(0, true);
          status = 'idle';
          delete stage.dataset.beat;
          stage.dataset.fall = 'idle';
          delete stage.dataset.impactAt; delete stage.dataset.firstLineAt;
          stage.dataset.health = '.96'; stage.dataset.hush = '1';
        } else if (time >= 40 && tl.scrollTrigger?.isActive && status === 'idle') {
          status = 'running'; fall.restart();
        } else if (!tl.scrollTrigger?.isActive && status === 'running') {
          // Fast navigation is always allowed. Settle without replaying cues offscreen.
          clearStatements();
          gsap.set(q('.intro-notjust'), { autoAlpha: 0 });
          gsap.set(q('.intro-systemline'), { autoAlpha: 1 });
          fall.progress(1, true).pause(); status = 'complete';
          stage.dataset.fall = 'complete';
          stage.dataset.health = '.58'; stage.dataset.hush = '.3'; mark(T.system);
        }
      });
      return () => {
        clearStatements();
        fall.kill();
        delete stage.dataset.health; delete stage.dataset.hush; delete stage.dataset.beat;
        delete stage.dataset.fall; delete stage.dataset.impactAt; delete stage.dataset.firstLineAt;
      };
    },
  });

  return (
    <Scene chapter="intro" sectionRef={sectionRef} stageRef={stageRef}>
      <ForestScene hero inscription seed={11} label={T.srTree}>
        <svg className="intro-overlay" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
          <defs>
            <radialGradient id="intro-impact-g">
              <stop offset="0" stopColor="#c9b08a" stopOpacity="0.7" />
              <stop offset="1" stopColor="#c9b08a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <g className="intro-stump-rings" fill="none" stroke="#c6b78d" strokeWidth="1.5">
            {[14, 25, 37, 50].map((r) => <ellipse key={r} cx={HERO.x} cy={HERO.y - 7} rx={r} ry={r * .3} />)}
          </g>
          {BIRDS.map((b, i) => (
            <g key={i} className="intro-bird" transform={`translate(${b.x} ${b.y}) scale(${b.s})`}>
              <path d="M-9,0 Q-4,-6 0,0 Q4,-6 9,0" fill="none" stroke="#07130f" strokeWidth="2.4" strokeLinecap="round" />
            </g>
          ))}
          <ellipse className="intro-impact" cx={HERO.x - HERO.h * 0.62} cy={HERO.y - 8} rx="330" ry="70" fill="url(#intro-impact-g)" style={{ transformOrigin: `${HERO.x - HERO.h * 0.62}px ${HERO.y}px` }} />
        </svg>
        <div className="intro-gap" aria-hidden="true" />
      </ForestScene>
      <div className="intro-fogout" aria-hidden="true" />
      <div className="intro-dawn" aria-hidden="true" />
      <div className="scrim-bottom" />

      <div className="intro-once-wrap">
        <Narration id="once" className="intro-once" position="center">
          {T.once}
        </Narration>
      </div>
      <Narration id="notonly" className="intro-notonly" position="center">
        {T.notOnly}
      </Narration>
      <div className="narration narration--low intro-alive">
        <p className="lead intro-alive-text">{T.alive}</p>
      </div>
      <Narration id="notjust" className="intro-notjust" position="center">
        {T.notJust}
      </Narration>
      <Narration id="system" className="intro-systemline" position="center">
        {T.system}
      </Narration>
      <div className="intro-hint" aria-hidden="true">
        <div className="intro-hint-reveal">
          <span className="label">aylantiring</span>
          <span className="intro-hint-line" />
        </div>
      </div>
    </Scene>
  );
}
