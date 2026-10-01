import { useMemo, useRef, useState, type PointerEvent } from 'react';
import { Scene } from '../../components/layout/Scene';
import { ForestScene } from '../../components/visualizations/forest/ForestScene';
import { useSceneTimeline } from '../../lib/animation/useSceneTimeline';
import { NARRATIVE } from '../../content/narrative';
import { generateLayer, mergeLayer, ridgePath, stumpPath, mulberry32, translatePath } from '../../lib/forest/generate';
import { rootSystem } from '../../lib/forest/roots';
import './FutureSplit.css';

const T = NARRATIVE.futures;

/** Extra layers: stumps + bare ground for A, saplings for B. */
function useFutureLayers() {
  return useMemo(() => {
    const rng = mulberry32(5);
    let stumps = '';
    for (let i = 0; i < 30; i++) {
      const x = 10 + i * 54 + rng() * 30;
      const y = 720 + rng() * 170;
      stumps += translatePath(stumpPath(50 + (y - 720) * 0.8, rng), x, y);
    }
    // Standing dead snags: leafless branch skeletons.
    const snags = [180, 470, 760, 1080, 1390].map((x, i) => rootSystem(x, 760 + (i % 2) * 40, 40 + i, { length: 360 + (i % 3) * 60, depth: 3, spread: 0.55, up: true }));
    const saplings = mergeLayer(generateLayer({ seed: 66, count: 30, baseY: 790, baseJitter: 90, minH: 70, maxH: 150, mix: { conifer: 0.5, broadleaf: 0.5 } }));
    return { stumps, bare: ridgePath(71, 690, 26), saplings, snags };
  }, []);
}

/**
 * ACT XI — possibility. Two trajectories from the same forest, side by side.
 * Scroll advances time; the seam can be dragged (or moved with the keyboard).
 */
export function FutureSplit() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [seam, setSeam] = useState(50);
  const dragging = useRef(false);
  const layers = useFutureLayers();

  useSceneTimeline(sectionRef, stageRef, {
    chapter: 'futures',
    length: 3.8,
    build: (tl, { reduced, q }) => {
      const a = q('.fu-a .forest-scene')[0];
      const b = q('.fu-b .forest-scene')[0];
      tl.addLabel('beat:start', 4)
        .fromTo('.fu-veil', { opacity: 1 }, { opacity: 0, duration: 6 }, 0)
        .fromTo('.fu-labels', { opacity: 0 }, { opacity: 1, duration: 4 }, 4)
        // Trajectory A: degradation.
        .fromTo(a, { '--life': 0.62 }, { '--life': 0.06, duration: 70 }, 8)
        .fromTo(q('.fu-a .fs-depth[data-depth="2"]'), { opacity: 1 }, { opacity: 0.12, duration: 50 }, 14)
        .fromTo(q('.fu-a .fs-depth[data-depth="1"]'), { opacity: 1 }, { opacity: 0.3, duration: 60 }, 18)
        .fromTo(q('.fu-a .fs-depth[data-depth="3"]'), { opacity: 1 }, { opacity: 0, duration: 40 }, 16)
        .fromTo(q('.fu-a .fs-shafts'), { opacity: 1 }, { opacity: 0.2, duration: 40 }, 16)
        .fromTo('.fu-snags', { opacity: 0 }, { opacity: 1, duration: 30 }, 30)
        .fromTo('.fu-bare', { opacity: 0 }, { opacity: 1, duration: 40 }, 20)
        .fromTo('.fu-stumps', { opacity: 0 }, { opacity: 1, duration: 30 }, 24)
        // Trajectory B: protection + restoration.
        .fromTo(b, { '--life': 0.62 }, { '--life': 1, duration: 70 }, 8)
        .fromTo('.fu-saplings', { opacity: 0, scaleY: reduced ? 1 : 0.15 }, { opacity: 1, scaleY: 1, transformOrigin: '50% 100%', duration: 60 }, 12)
        .fromTo('.fu-time-fill', { scaleX: 0 }, { scaleX: 1, duration: 72 }, 8)
        .addLabel('beat:mid', 46)
        .fromTo('.fu-end1', { opacity: 0, y: reduced ? 0 : 14 }, { opacity: 1, y: 0, duration: 5 }, 80)
        .addLabel('beat:end1', 86)
        .fromTo('.fu-end2', { opacity: 0, y: reduced ? 0 : 14 }, { opacity: 1, y: 0, duration: 5 }, 89)
        .addLabel('beat:end2', 96);
    },
  });

  const fromPointer = (e: PointerEvent<HTMLDivElement>) => {
    const r = stageRef.current?.getBoundingClientRect();
    if (!r) return;
    setSeam(Math.min(96, Math.max(4, ((e.clientX - r.left) / r.width) * 100)));
  };

  return (
    <Scene chapter="futures" sectionRef={sectionRef} stageRef={stageRef} stageClassName="fu-stage">
      <div className="fu-b">
        <ForestScene seed={11} life={0.62} dustColor="#f3dfae">
          <svg className="fu-extra" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
            <path d={layers.saplings} className="fu-saplings" />
          </svg>
        </ForestScene>
      </div>
      <div className="fu-a" style={{ clipPath: `inset(0 ${100 - seam}% 0 0)` }}>
        <ForestScene seed={11} life={0.62} dustColor="#c9b08a">
          <svg className="fu-extra" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
            <defs>
              <linearGradient id="fu-bare-g" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#9a7b55" />
                <stop offset="1" stopColor="#5f4732" />
              </linearGradient>
            </defs>
            <path d={layers.bare} className="fu-bare" fill="url(#fu-bare-g)" />
            <g className="fu-snags">
              {layers.snags.flatMap((sys, k) => sys.segments.map((seg, i) => <path key={`${k}-${i}`} d={seg.d} strokeWidth={[14, 7, 3.5, 1.8][seg.depth] ?? 1.4} />))}
            </g>
            <path d={layers.stumps} className="fu-stumps" />
          </svg>
        </ForestScene>
      </div>

      <div
        className="fu-seam"
        style={{ left: `${seam}%` }}
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => dragging.current && fromPointer(e)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
        aria-hidden="true"
      >
        <span className="fu-seam-line" />
        <span className="fu-seam-handle">
          <svg viewBox="0 0 24 24">
            <path d="M9,6L3,12L9,18M15,6L21,12L15,18" />
          </svg>
        </span>
      </div>

      <div className="fu-labels">
        <p className="fu-label fu-label--a" style={{ opacity: seam < 18 ? 0.25 : 1 }}>
          <span className="label">{T.a}</span>
          <span className="fu-label-text">{T.aLabel}</span>
        </p>
        <p className="fu-label fu-label--b" style={{ opacity: seam > 82 ? 0.25 : 1 }}>
          <span className="label">{T.b}</span>
          <span className="fu-label-text">{T.bLabel}</span>
        </p>
      </div>

      <div className="fu-time" aria-hidden="true">
        <span className="label">{T.now}</span>
        <span className="fu-time-track">
          <span className="fu-time-fill" />
        </span>
        <span className="label">{T.later}</span>
      </div>

      <div className="fu-control" data-local-keys>
        <label className="visually-hidden" htmlFor="fu-range">
          {T.seam}
        </label>
        <input id="fu-range" className="fu-range" type="range" min={4} max={96} step={1} value={Math.round(seam)} onChange={(e) => setSeam(Number(e.target.value))} />
      </div>

      <p className="fu-disclaimer">{T.disclaimer}</p>
      <div className="fu-ends">
        <p className="fu-end1 display">{T.end1}</p>
        <p className="fu-end2 title">{T.end2}</p>
      </div>
      <div className="fu-veil" aria-hidden="true" />
    </Scene>
  );
}
