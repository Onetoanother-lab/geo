import { useRef } from 'react';
import { Scene } from '../../components/layout/Scene';
import { Narration } from '../../components/layout/Narration';
import { ForestScene, HERO } from '../../components/visualizations/forest/ForestScene';
import { useSceneTimeline } from '../../lib/animation/useSceneTimeline';
import { gsap, useGSAP } from '../../lib/animation/gsap';
import { useStore } from '../../app/store';
import { audio } from '../../lib/audio/engine';
import { NARRATIVE } from '../../content/narrative';
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

  // Time-based dawn once the gate opens (independent from scroll).
  useGSAP(
    () => {
      if (!entered) return;
      gsap.fromTo('.intro-dawn', { opacity: 1 }, { opacity: 0, duration: 3.2, ease: 'power2.inOut', delay: 0.4 });
      gsap.fromTo('.intro-once-wrap', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 2.4, ease: 'power2.out', delay: 1.9 });
      gsap.fromTo('.intro-hint', { opacity: 0 }, { opacity: 1, duration: 1.2, delay: 4.2 });
    },
    { scope: sectionRef, dependencies: [entered] },
  );

  useSceneTimeline(sectionRef, stageRef, {
    chapter: 'intro',
    length: 5.2,
    build: (tl, { reduced, q }) => {
      const forest = q('.forest-scene')[0];
      const [d0, d1, d2, d3] = [0, 1, 2, 3].map((i) => q(`.fs-depth[data-depth="${i}"]`)[0]);
      const heroTree = q('.fs-hero-tree')[0];
      const stump = q('.fs-hero-stump')[0];

      tl.addLabel('beat:start', 0);
      tl.to('.intro-hint', { opacity: 0, duration: 4 }, 1);
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

      // Hush: the birds leave first.
      q<SVGGElement>('.intro-bird').forEach((b, i) => {
        tl.to(b, reduced ? { opacity: 0, duration: 2 } : { x: -260 - i * 90, y: -340 - i * 40, opacity: 0, duration: 7, ease: 'power1.in' }, 41 + i * 0.6);
      });

      // The fall.
      tl.call(
        () => {
          if (tl.scrollTrigger?.direction === 1) audio.cue('treefall');
        },
        [],
        45.5,
      );
      tl.addLabel('beat:fall', 47);
      if (reduced) {
        tl.to(heroTree, { opacity: 0, duration: 4 }, 47).to(stump, { opacity: 1, duration: 3 }, 48);
      } else {
        tl.to(heroTree, { rotation: -3, svgOrigin: `${HERO.x} ${HERO.y}`, duration: 3, ease: 'power1.inOut' }, 45)
          .to(heroTree, { rotation: -86, svgOrigin: `${HERO.x} ${HERO.y}`, duration: 7, ease: 'power3.in' }, 48)
          .set(stump, { opacity: 1 }, 50)
          .to(heroTree, { opacity: 0, duration: 4 }, 56)
          .fromTo('.intro-impact', { opacity: 0, scale: 0.4 }, { opacity: 0.85, scale: 1, duration: 2, ease: 'power2.out' }, 55)
          .to('.intro-impact', { opacity: 0, scale: 1.5, duration: 9 }, 57)
          .to(forest, { keyframes: { y: [0, 6, -4, 3, 0] }, duration: 2 }, 55);
      }

      // The forest loses some of its colour and softness.
      tl.to(forest, { '--life': 0.6, duration: 16 }, 56)
        .fromTo('.intro-gap', { opacity: 0 }, { opacity: 1, duration: 10 }, 56)
        .fromTo('.intro-notjust', { opacity: 0, y: reduced ? 0 : 20 }, { opacity: 1, y: 0, duration: 5 }, 63)
        .addLabel('beat:loss', 69)
        .to('.intro-notjust', { opacity: 0, duration: 4 }, 75)
        .fromTo('.intro-systemline', { opacity: 0, y: reduced ? 0 : 20 }, { opacity: 1, y: 0, duration: 5 }, 79)
        .addLabel('beat:change', 86);

      // Lower the camera into the fog → Act II.
      if (!reduced) tl.to([d0, d1, d2, d3], { yPercent: '-=10', duration: 18, ease: 'power1.in' }, 82);
      tl.to('.intro-fogout', { opacity: 1, duration: 10 }, 89).to('.intro-systemline', { opacity: 0, duration: 4 }, 95);
    },
  });

  return (
    <Scene chapter="intro" sectionRef={sectionRef} stageRef={stageRef}>
      <ForestScene hero seed={11} label={T.srTree}>
        <svg className="intro-overlay" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
          <defs>
            <radialGradient id="intro-impact-g">
              <stop offset="0" stopColor="#c9b08a" stopOpacity="0.7" />
              <stop offset="1" stopColor="#c9b08a" stopOpacity="0" />
            </radialGradient>
          </defs>
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
        <span className="label">aylantiring</span>
        <span className="intro-hint-line" />
      </div>
    </Scene>
  );
}
