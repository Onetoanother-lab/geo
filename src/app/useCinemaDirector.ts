import { useEffect } from 'react';
import { gsap } from '../lib/animation/gsap';
import { getState, setState, useReducedMotion, useStore } from './store';
import { scoreBeat } from '../content/cinematic';
import { clamp, richness, sceneHealth, sceneSaturation } from '../lib/cinema/ecology';
import { audio } from '../lib/audio/engine';
import { MOTION } from '../lib/animation/motion';

/** Elements that read each director value (see src/styles/cinema.css). */
const CONSUMERS = {
  '--ecology': '.dr-mist, .dr-watershine, .dr-shadow',
  '--shade': '.scene-light',
  '--exposure': '.scene-light',
  '--pulse': '.fs-shaft-set, .fs-water-line, .fs-roots, .ls-roots',
} as const;

/** One low-frequency director; scene timelines remain the owners of geometry. */
export function useCinemaDirector() {
  const reduced = useReducedMotion();
  const entered = useStore((s) => s.entered);
  useEffect(() => {
    if (!entered) return;
    if (!getState().presentationStartedAt) setState({ presentationStartedAt: Date.now() });
    let previous = 0;
    let lastChapter = '';
    let arrival = 0;
    const written = new Map<string, string>();
    const tick = (time: number) => {
      if (document.hidden || time - previous < 0.08) return;
      previous = time;
      const s = getState();
      const section = document.querySelector<HTMLElement>(`section[data-chapter="${s.chapterId}"]`);
      const stage = section?.querySelector<HTMLElement>('.stage');
      if (!section || !stage) return;
      if (lastChapter !== s.chapterId) {
        lastChapter = s.chapterId;
        arrival = time;
        written.clear();
        document.querySelectorAll<HTMLElement>('[data-chapter]').forEach((el) => { el.dataset.current = String(el === section); });
      }
      const rect = section.getBoundingClientRect();
      const p = clamp(-rect.top / Math.max(1, rect.height - innerHeight));
      const health = stage.dataset.health !== undefined ? Number(stage.dataset.health) : sceneHealth(s.chapterId, p, s.simulatorResult, s.futureBalance);
      const life = richness(health);
      // Each value goes only to the elements that use it. An inherited variable on the
      // stage would restyle every SVG node beneath it on each tick while scrubbing.
      // Tiny pulse changes are deliberately below the visual resolution of the score.
      const light = (name: keyof typeof CONSUMERS, value: number, step = 0.01) => {
        const next = (Math.round(value / step) * step).toFixed(2);
        if (written.get(name) === next) return;
        written.set(name, next);
        stage.querySelectorAll<HTMLElement | SVGElement>(CONSUMERS[name]).forEach((el) => el.style.setProperty(name, next));
      };
      light('--ecology', health, 0.05);
      light('--shade', life.shade);
      light('--exposure', 1 - life.shade);
      light('--pulse', reduced ? 0 : life.pulse * (0.5 + Math.sin(time * Math.PI * 2 / MOTION.pulse) * 0.5));
      // A filter is not inherited, so writing it directly restyles only the scene root.
      // Every change repaints the whole filtered scene, so it moves in 0.05 steps.
      const saturation = `saturate(${(Math.round(sceneSaturation(s.chapterId, p, health) * 20) / 20).toFixed(2)})`;
      if (written.get('filter') !== saturation) {
        written.set('filter', saturation);
        stage.querySelectorAll<HTMLElement>('.forest-scene, .dr-scene, .rc-scene, .ls-palette').forEach((el) => { el.style.filter = saturation; });
      }
      const quiet = String(health < 0.18 || reduced);
      if (stage.dataset.quiet !== quiet) stage.dataset.quiet = quiet;
      // Motes are life detail in the forest; Aral's dust explicitly represents exposure.
      stage.querySelectorAll<HTMLCanvasElement>('.fs-dust, .dr-life-dust').forEach((canvas) => {
        const intensity = life.leaves.toFixed(2);
        if (canvas.dataset.intensity !== intensity) canvas.dataset.intensity = intensity;
      });
      const aralSilence = s.chapterId === 'aral' && time - arrival < MOTION.hold;
      const hush = aralSilence ? 0 : Number(stage.dataset.hush ?? 1);
      audio.setEcology(health, s.chapterId === 'aral' ? 'aral' : 'forest', hush);
      const progress = Math.round(p * 100) / 100;
      const currentBeat = stage.dataset.beat ?? scoreBeat(s.chapterId, p).name;
      setState({ chapterProgress: progress, currentBeat });
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [entered, reduced]);
}
