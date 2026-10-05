import { useEffect, useRef, type RefObject } from 'react';
import { gsap, ScrollTrigger, useGSAP } from './gsap';
import { registerBeats } from './beats';
import { useReducedMotion } from '../../app/store';
import { CHAPTER_IDS, type ChapterId } from '../../app/chapters';
import { requestRefresh } from './refresh';
import { MOTION } from './motion';

export type SceneContext = {
  reduced: boolean;
  stage: HTMLElement;
  section: HTMLElement;
  /** Scoped selector (inside the section). */
  q: <T extends Element = HTMLElement>(selector: string) => T[];
  /** Scroll chooses the sentence; its entrance runs in real time. */
  narrate: (target: string | Element, enter: number, leave?: number) => void;
};

export type SceneTimelineOptions = {
  chapter: string;
  /** Unique registry key when a chapter contains several timelines. */
  key?: string;
  /** Pinned scroll length in viewport heights. */
  length: number;
  /** Scrub smoothing in seconds (`true` = locked to scroll). */
  scrub?: number | true;
  revision?: unknown;
  build: (tl: gsap.core.Timeline, ctx: SceneContext) => void | (() => void);
  onUpdate?: (self: ScrollTrigger) => void;
  onToggle?: (self: ScrollTrigger) => void;
};

/** Timeline length in "scroll percent" units — positions in `build` use 0..100. */
export const TIMELINE_UNITS = 100;

/**
 * Builds one pinned, scrubbed GSAP timeline for a scene and registers its
 * `beat:*` labels as keyboard stops. Rebuilds (and fully reverts) when the
 * reduced-motion flag changes.
 */
export function useSceneTimeline(
  sectionRef: RefObject<HTMLElement | null>,
  stageRef: RefObject<HTMLElement | null>,
  options: SceneTimelineOptions,
): RefObject<ScrollTrigger | null> {
  const reduced = useReducedMotion();
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const optsRef = useRef(options);
  useEffect(() => {
    optsRef.current = options;
  });

  useGSAP(
    () => {
      const section = sectionRef.current;
      const stage = stageRef.current;
      if (!section || !stage) return;
      const { chapter, key, length, scrub, build } = options;

      const tl = gsap.timeline({
        defaults: { ease: 'none', duration: 1 },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${Math.round(length * window.innerHeight)}`,
          pin: stage,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: scrub ?? (reduced ? true : 0.6),
          invalidateOnRefresh: true,
          // Lazy geography may rebuild out of creation order; pin offsets must still
          // be measured in documentary order, including Home/End destinations.
          refreshPriority: 100 - CHAPTER_IDS.indexOf(chapter as ChapterId),
          onUpdate: (self) => optsRef.current.onUpdate?.(self),
          onToggle: (self) => optsRef.current.onToggle?.(self),
        },
      });
      // Guarantee a 0..100 timeline regardless of what build() adds.
      tl.set({}, {}, TIMELINE_UNITS);

      const q = <T extends Element = HTMLElement>(selector: string) =>
        Array.from(section.querySelectorAll<T>(selector));
      const narration: { targets: Element[]; enter: number; leave: number; visible: boolean; tween: gsap.core.Tween | null }[] = [];
      const narrate: SceneContext['narrate'] = (target, enter, leave = Infinity) => {
        const targets = typeof target === 'string' ? q(target) : [target];
        gsap.set(targets, { autoAlpha: 0 });
        narration.push({ targets, enter, leave, visible: false, tween: null });
      };
      const cleanup = build(tl, { reduced, stage, section, q, narrate });
      const sceneUpdate = tl.eventCallback('onUpdate');
      const updateNarration = () => {
        sceneUpdate?.call(tl);
        for (const line of narration) {
          const visible = tl.time() >= line.enter && tl.time() < line.leave;
          if (visible === line.visible) continue;
          line.visible = visible;
          line.tween?.kill();
          line.tween = gsap.to(line.targets, { autoAlpha: visible ? 1 : 0,
            duration: reduced ? MOTION.reduced : visible ? MOTION.text : MOTION.ui,
            ease: 'power1.out', overwrite: 'auto' });
        }
      };
      if (narration.length) { tl.eventCallback('onUpdate', updateNarration); updateNarration(); }
      if (import.meta.env.DEV && tl.duration() > TIMELINE_UNITS + 0.5) {
        console.warn(`[scene:${chapter}] timeline is ${tl.duration().toFixed(1)} units long (expected ${TIMELINE_UNITS}); beats will drift.`);
      }

      const st = tl.scrollTrigger ?? null;
      triggerRef.current = st;
      requestRefresh(80);

      const labels = Object.entries(tl.labels)
        .filter(([name]) => name.startsWith('beat:'))
        .sort((a, b) => a[1] - b[1]);
      const unregister = registerBeats(key ?? chapter, chapter, () => {
        if (!st) return [];
        const span = st.end - st.start;
        const total = tl.duration() || TIMELINE_UNITS;
        const beats = labels.map(([name, time]) => ({ id: name.slice(5), y: st.start + (time / total) * span }));
        return beats.length ? beats : [{ id: 'start', y: st.start }];
      });

      return () => {
        narration.forEach((line) => line.tween?.kill());
        cleanup?.();
        unregister();
        triggerRef.current = null;
      };
    },
    { scope: sectionRef, dependencies: [reduced, options.revision], revertOnUpdate: true },
  );

  return triggerRef;
}

/** Converts a 0..1 progress of a scene into an absolute scroll position. */
export function progressToScroll(st: ScrollTrigger, progress: number): number {
  return st.start + (st.end - st.start) * Math.min(1, Math.max(0, progress));
}

/** Registers a non-pinned section's top (plus optional extra offsets in vh) as beats. */
export function useSectionBeats(
  sectionRef: RefObject<HTMLElement | null>,
  chapter: string,
  offsetsVh: number[] = [0],
  key?: string,
): void {
  const offsets = offsetsVh.join(',');
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const list = offsets.split(',').map(Number);
    return registerBeats(key ?? `${chapter}:section`, chapter, () => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      return list.map((vh, i) => ({ id: `s${i}`, y: top + (vh / 100) * window.innerHeight }));
    });
  }, [sectionRef, chapter, offsets, key]);
}

export { ScrollTrigger };
