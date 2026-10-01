import { ScrollTrigger } from './gsap';

let timer: number | undefined;

/** Debounced ScrollTrigger.refresh — call after lazy content or fonts change layout. */
export function requestRefresh(delay = 120): void {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => ScrollTrigger.refresh(), delay);
}
