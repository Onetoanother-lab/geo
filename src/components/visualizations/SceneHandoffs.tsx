import { useRef } from 'react';
import { gsap, useGSAP } from '../../lib/animation/gsap';
import { useReducedMotion, useStore } from '../../app/store';
import { ROOTS, RINGS, RADIAL, FRACTURES, RIVERS, SEEDLING, TRUNK } from '../../lib/cinema/motifs';

const HANDOFFS = [
  ['intro', 'system', ROOTS, ROOTS],
  ['system', 'cut', ROOTS, RIVERS.join('')],
  ['cut', 'causes', RINGS, RADIAL],
  ['causes', 'consequences', RADIAL, FRACTURES],
  ['consequences', 'world', FRACTURES, RIVERS.join('')],
  ['aral', 'simulator', ROOTS, SEEDLING],
  ['simulator', 'recovery', SEEDLING, SEEDLING],
  ['recovery', 'futures', TRUNK, TRUNK],
] as const;

/** Local, reversible match dissolves across chapter boundaries; no black curtains. */
export function SceneHandoffs() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const entered = useStore((s) => s.entered);
  useGSAP(() => {
    if (!entered) return;
    HANDOFFS.forEach(([from, to, a, b], i) => {
      const end = document.querySelector(`[data-chapter="${to}"]`);
      const layer = ref.current?.children[i];
      if (!end || !layer) return;
      const path = layer.querySelector('path');
      const tl = gsap.timeline({ scrollTrigger: {
        trigger: end, start: 'top 95%', end: 'top 5%', scrub: reduced ? true : .5,
        invalidateOnRefresh: true,
      } });
      tl.fromTo(layer, { opacity: 0 }, { opacity: .62, duration: .28 })
        .fromTo(path, { attr: { d: a } }, reduced ? { attr: { d: b }, duration: .01 } : { morphSVG: b, duration: .65, ease: 'power1.inOut' }, .18)
        .to(layer, { opacity: 0, duration: .28 }, .72);
      layer.setAttribute('data-bridge', `${from}-${to}`);
    });
  }, { scope: ref, dependencies: [entered, reduced], revertOnUpdate: true });
  return <div ref={ref} aria-hidden="true">{HANDOFFS.map(([from,,a]) => <div className="handoff" key={from}><svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet"><path className="handoff-path" d={a} /></svg></div>)}</div>;
}
