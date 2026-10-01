import { useRef } from 'react';
import { Scene } from '../../components/layout/Scene';
import { useSceneTimeline, progressToScroll } from '../../lib/animation/useSceneTimeline';
import { scrollToY } from '../../lib/animation/navigator';
import { NARRATIVE } from '../../content/narrative';
import { StatLine } from '../../components/visualizations/StatLine';
import type { FactId } from '../../content/facts';
import { CHAIN_ICONS } from './icons';
import './Consequences.css';

const T = NARRATIVE.consequences;
type ChainKey = keyof typeof T.chains;
const CHAINS: { key: ChainKey; icons: string[]; facts: FactId[] }[] = [
  { key: 'biodiversity', icons: ['stump', 'gap', 'fragments', 'leave'], facts: ['birds', 'mammals'] },
  { key: 'soilWater', icons: ['roots', 'soil', 'rain', 'river'], facts: ['forestWater'] },
  { key: 'climate', icons: ['forestGone', 'carbonUp', 'absorb', 'thermo'], facts: ['landUseEmissions'] },
];
const NODE_X = [180, 590, 1010, 1420];
const LINE = 'M120,450C320,330 420,570 590,450S860,330 1010,450S1260,570 1480,450';
const WINDOWS = [
  [8, 34],
  [36, 62],
  [64, 90],
] as const;

/**
 * ACT V — consequence. Three mechanisms drawn as living chains, one after
 * another. Mechanisms, not apocalypse.
 */
export function Consequences() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const trigger = useSceneTimeline(sectionRef, stageRef, {
    chapter: 'consequences',
    length: 3.6,
    build: (tl, { reduced, q }) => {
      tl.addLabel('beat:intro', 3)
        .fromTo('.cq-title', { opacity: 0 }, { opacity: 1, duration: 4 }, 0)
        .to('.cq-title', { opacity: 0.0, duration: 3 }, 6)
        .fromTo('.cq-tabs', { opacity: 0 }, { opacity: 1, duration: 3 }, 7);
      CHAINS.forEach((c, ci) => {
        const [start, end] = WINDOWS[ci];
        const root = q(`.cq-chain[data-chain="${c.key}"]`)[0];
        const line = root.querySelector('.cq-line');
        const nodes = root.querySelectorAll('.cq-node');
        tl.fromTo(root, { opacity: 0 }, { opacity: 1, duration: 2 }, start)
          .fromTo(line, { drawSVG: '0%' }, { drawSVG: '100%', duration: 18 }, start + 2)
          .fromTo(nodes, { opacity: 0, scale: reduced ? 1 : 0.6, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 2.5, stagger: 5.4, ease: 'back.out(1.6)' }, start + 2)
          .fromTo(root.querySelector('.cq-chain-stat'), { opacity: 0 }, { opacity: 1, duration: 3 }, start + 19)
          .addLabel(`beat:${c.key}`, start + 21)
          .to(root, { opacity: ci === CHAINS.length - 1 ? 0.12 : 0, duration: 2 }, end - 1)
          .to(root.querySelector('.cq-chain-stat'), { opacity: 0, duration: 2 }, end - 1);
      });
      tl.eventCallback('onUpdate', () => {
        const t = tl.time();
        const i = WINDOWS.findIndex(([a, b]) => t >= a && t < b + 2);
        const key = i >= 0 ? CHAINS[i].key : '';
        if (stageRef.current && stageRef.current.dataset.active !== key) stageRef.current.dataset.active = key;
      });
      tl.fromTo('.cq-closing', { opacity: 0, y: reduced ? 0 : 12 }, { opacity: 1, y: 0, duration: 4 }, 91).addLabel('beat:closing', 96);
    },
  });

  const jump = (i: number) => {
    const st = trigger.current;
    if (st) scrollToY(progressToScroll(st, (WINDOWS[i][0] + 21) / 100));
  };

  return (
    <Scene chapter="consequences" sectionRef={sectionRef} stageRef={stageRef} stageClassName="cq-stage">
      <p className="cq-title display">{T.title}</p>
      <div className="cq-tabs" role="group" aria-label={T.title}>
        {CHAINS.map((c, i) => (
          <button key={c.key} type="button" className="cq-tab" data-chain={c.key} onClick={() => jump(i)}>
            {T.chains[c.key].label}
          </button>
        ))}
      </div>
      {CHAINS.map((c) => (
        <div key={c.key} className="cq-chain" data-chain={c.key}>
          <svg className="cq-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
            <path d={LINE} className="cq-line-ghost" />
            <path d={LINE} className="cq-line" />
            {NODE_X.map((x, i) => (
              <g key={x} className="cq-node" transform={`translate(${x} 450)`}>
                <circle r="58" className="cq-node-ring" />
                <g transform="translate(-24 -24) scale(2)">
                  <path d={CHAIN_ICONS[c.icons[i]]} className="cq-icon" />
                </g>
              </g>
            ))}
          </svg>
          <ol className="cq-steps">
            {T.chains[c.key].steps.map((s, i) => (
              <li key={s} style={{ left: `${(NODE_X[i] / 1600) * 100}%` }}>
                {s}
              </li>
            ))}
          </ol>
          <p className="cq-chain-label label">{T.chains[c.key].label}</p>
          <div className="cq-chain-stat">
            {c.facts.map((f) => (
              <StatLine key={f} factId={f} />
            ))}
          </div>
        </div>
      ))}
      <p className="cq-closing title">{T.closing}</p>
    </Scene>
  );
}
