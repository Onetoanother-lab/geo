import { useRef } from 'react';
import { Scene } from '../../components/layout/Scene';
import { Narration } from '../../components/layout/Narration';
import { ForestScene, HERO, STUMP_TOP } from '../../components/visualizations/forest/ForestScene';
import { CHIPS, LANDING, LEAVES, PUFFS } from './debris';
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
      const [d0, d1, d2, d3, d4] = [0, 1, 2, 3, 4].map((i) => q(`.fs-depth[data-depth="${i}"]`)[0]);
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
          .to(d3, { scale: 1.55, duration: 48 }, 0)
          .to(d4, { scale: 1.9, yPercent: -3, duration: 48 }, 0);
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
      // Everything the fall disturbs lives inside `fall`: pause(0) resets it, progress(1) settles it.
      const leaves = q('.intro-leaf');
      const chips = q('.intro-chip');
      const puffs = q('.intro-puff');
      const opening = q('.fs-hole-set');
      const pools = q('.fs-hero-pool');
      const shadow = q('.fs-hero-shadow');
      const log = q('.fs-hero-log');
      leaves.forEach((el, i) => fall.set(el, { x: LEAVES[i].x0, y: LEAVES[i].y0, rotation: LEAVES[i].r0, opacity: 0 }, 0));
      chips.forEach((el, i) => fall.set(el, { x: CHIPS[i].x0, y: CHIPS[i].y0, rotation: 0, opacity: 0 }, 0));
      fall.set(puffs, { opacity: 0 }, 0);

      fall.call(() => { mark('O‘rmon jimiydi'); stage.dataset.fall = 'hush'; }, [], 0)
        .to(q('.intro-bird'), { opacity: 0, x: reduced ? 0 : -180, y: reduced ? 0 : -95, stagger: .14, duration: reduced ? .2 : 1.4 }, FALL.birds)
        .to(condition, { health: .22, duration: 1.4 }, FALL.birds)
        .to(condition, { hush: .035, duration: .8 }, FALL.wind)
        .call(() => audio.cue('creak'), [], FALL.creak)
        .call(() => audio.cue('creak'), [], FALL.secondCreak)
        .call(() => { mark('Daraxt qulaydi'); stage.dataset.fall = 'falling'; }, [], FALL.movement);
      if (reduced) {
        // Same end state, no travel: the settled debris, the open canopy and the light on the stump.
        fall.to(heroTree, { opacity: 0, duration: .2 }, FALL.impact - .2)
          .to(stump, { opacity: 1, duration: .2 }, FALL.impact)
          .to(log, { opacity: 1, duration: .2 }, FALL.impact)
          .to(shadow, { opacity: 0, duration: .2 }, FALL.impact)
          .to(opening, { opacity: 1, duration: .2 }, FALL.impact)
          .to(pools, { opacity: .9, duration: .2 }, FALL.impact);
        leaves.forEach((el, i) => fall.set(el, { x: LEAVES[i].x1, y: LEAVES[i].y1, rotation: LEAVES[i].r1 }, FALL.impact - .01).to(el, { opacity: .9, duration: .2 }, FALL.impact));
        chips.forEach((el, i) => fall.set(el, { x: CHIPS[i].x1, y: CHIPS[i].y1, rotation: CHIPS[i].r1 }, FALL.impact - .01).to(el, { opacity: .9, duration: .2 }, FALL.impact));
      } else {
        fall.to(heroTree, { rotation: -2, svgOrigin: `${HERO.x} ${HERO.y}`, duration: .6, ease: 'sine.inOut' }, FALL.movement)
          .to(heroTree, { rotation: -86, svgOrigin: `${HERO.x} ${HERO.y}`, duration: 1.1, ease: 'power3.in' }, FALL.movement + .6)
          .set(stump, { opacity: 1 }, FALL.impact)
          .set(log, { opacity: 1 }, FALL.impact)
          .to(heroTree, { opacity: 0, duration: .45 }, FALL.impact + .2)
          .to(forest, { keyframes: { y: [0, 3, -2, 0] }, duration: .32 }, FALL.impact)
          // The neighbouring forest answers: a brief sway through the mid and near planes.
          .to([d1, d2], { keyframes: [{ skewX: -1.1, duration: .45 }, { skewX: .7, duration: .6 }, { skewX: -.3, duration: .8 }, { skewX: 0, duration: 1 }], ease: 'sine.inOut' }, FALL.impact - .05)
          .fromTo('.intro-impact', { opacity: 0, scale: .65 }, { opacity: .6, scale: 1, duration: .45, ease: 'power2.out' }, FALL.impact)
          .to('.intro-impact', { opacity: 0, scale: 1.3, duration: 1.5 }, FALL.impact + .45)
          // The crown's shadow leaves the ground; the canopy it filled is now open sky and a shaft of light.
          .to(shadow, { opacity: 0, duration: .8 }, FALL.impact)
          .to(opening, { opacity: 1, duration: MOTION.environment + .6 }, FALL.impact + .2)
          .to(pools, { opacity: .9, duration: MOTION.environment }, FALL.impact + .5);
        leaves.forEach((el, i) => {
          const L = LEAVES[i];
          const start = i < 22 ? FALL.movement + .2 + L.delay : FALL.impact + L.delay;
          const at = (f: number) => ({ x: L.x0 + (L.x1 - L.x0) * f, y: L.y0 + (L.y1 - L.y0) * f, rotation: L.r0 + (L.r1 - L.r0) * f });
          fall.to(el, { opacity: .92, duration: .3, ease: 'power1.out' }, start)
            .to(el, { keyframes: [
              { ...at(.35), x: L.x0 + (L.x1 - L.x0) * .35 + L.sway, duration: L.dur * .4, ease: 'sine.inOut' },
              { ...at(.75), x: L.x0 + (L.x1 - L.x0) * .75 - L.sway * .5, duration: L.dur * .35, ease: 'sine.inOut' },
              { ...at(1), duration: L.dur * .25, ease: 'sine.out' },
            ] }, start);
        });
        chips.forEach((el, i) => {
          const C = CHIPS[i];
          fall.set(el, { opacity: .95 }, FALL.impact)
            .to(el, { keyframes: [
              { x: C.x0 + (C.x1 - C.x0) * .55, y: C.y0 - C.lift, rotation: C.r1 * .5, duration: C.dur * .45, ease: 'power2.out' },
              { x: C.x1, y: C.y1, rotation: C.r1, duration: C.dur * .55, ease: 'power2.in' },
            ] }, FALL.impact);
        });
        puffs.forEach((el, i) => {
          const P = PUFFS[i];
          fall.fromTo(el, { opacity: 0, scale: .3, y: 0, svgOrigin: `${P.x} ${P.y}` }, { opacity: .55, scale: 1.7, y: -46, duration: .8, ease: 'power2.out' }, FALL.impact + P.delay)
            .to(el, { opacity: 0, y: -96, scale: 2.1, duration: 2.4, ease: 'sine.out' }, FALL.impact + P.delay + .8);
        });
      }
      fall.call(() => { audio.cue('impact'); mark('Sukut'); stage.dataset.fall = 'impact'; stage.dataset.impactAt = String(performance.now()); scheduleStatements(); }, [], FALL.impact)
        .to(forest, { '--life': .58, duration: MOTION.environment }, FALL.impact)
        .to('.intro-stump-rings', { opacity: .85, duration: duration }, FALL.impact + 1)
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
      <ForestScene
        hero
        inscription
        seed={11}
        label={T.srTree}
        heroLayer={
          <>
            <defs>
              <radialGradient id="intro-impact-g">
                <stop offset="0" stopColor="#d8c49a" stopOpacity="0.7" />
                <stop offset="1" stopColor="#d8c49a" stopOpacity="0" />
              </radialGradient>
            </defs>
            <g className="intro-stump-rings" fill="none" stroke="#7d6038" strokeWidth="1.3">
              <ellipse cx={HERO.x - 1} cy={STUMP_TOP} rx="43" ry="11.5" fill="#d6c395" stroke="none" />
              {[9, 18, 27, 36].map((r) => <ellipse key={r} cx={HERO.x - 1} cy={STUMP_TOP} rx={r} ry={r * .26} />)}
            </g>
            {BIRDS.map((b, i) => (
              <g key={i} className="intro-bird" transform={`translate(${b.x} ${b.y}) scale(${b.s})`}>
                <path d="M-9,0 Q-4,-6 0,0 Q4,-6 9,0" fill="none" stroke="#04201f" strokeWidth="2.4" strokeLinecap="round" />
              </g>
            ))}
            <ellipse className="intro-impact" cx={LANDING.x} cy={HERO.y - 8} rx="330" ry="70" fill="url(#intro-impact-g)" style={{ transformOrigin: `${LANDING.x}px ${HERO.y}px` }} />
            {PUFFS.map((p, i) => <circle key={i} className="intro-puff" cx={p.x} cy={p.y} r={p.r} fill="url(#intro-impact-g)" />)}
            {LEAVES.map((l, i) => <g key={i} className="intro-leaf"><path d={l.d} transform={`translate(${-l.half} 0)`} /></g>)}
            {CHIPS.map((c, i) => <g key={i} className="intro-chip"><path d={c.d} /></g>)}
          </>
        }
      />
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
