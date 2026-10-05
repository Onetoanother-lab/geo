/** Smallest `--life` change written while scrubbing: a colour shift too small to see. */
export const LIFE_STEP = 0.02;

/**
 * Tweens `--life` on `el` inside a scrubbed timeline, in steps of `LIFE_STEP`.
 * Every change recolours and repaints the whole forest, so writing it on every
 * frame would make the heaviest acts drop frames on presentation laptops.
 */
export function tweenLife(tl: gsap.core.Timeline, el: Element | undefined, from: number, to: number, duration: number, position: number): void {
  if (!(el instanceof HTMLElement)) return;
  const state = { life: from };
  let written = '';
  const write = () => {
    const next = (Math.round(state.life / LIFE_STEP) * LIFE_STEP).toFixed(2);
    if (next === written) return;
    written = next;
    el.style.setProperty('--life', next);
  };
  write();
  tl.fromTo(state, { life: from }, { life: to, duration, onUpdate: write }, position);
}
