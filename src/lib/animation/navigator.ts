import { gsap } from './gsap';
import { allBeats, firstBeatOfChapter, nextBeat, prevBeat } from './beats';
import { getState, isReducedMotion } from '../../app/store';

let activeTween: gsap.core.Tween | null = null;
let targetY: number | null = null;

function currentY(): number {
  return targetY ?? window.scrollY;
}

function maxScroll(): number {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

/** Smoothly scroll to an absolute position; chains when called repeatedly. */
export function scrollToY(y: number, opts: { duration?: number } = {}): void {
  const top = Math.min(Math.max(0, y), maxScroll());
  activeTween?.kill();
  // Hidden/background pages get no rAF (e.g. when driven from the presenter window): jump instantly.
  if (isReducedMotion(getState()) || document.hidden) {
    targetY = null;
    window.scrollTo({ top, behavior: 'auto' });
    return;
  }
  const distance = Math.abs(top - window.scrollY) / Math.max(1, window.innerHeight);
  const duration = opts.duration ?? Math.min(2.4, 0.9 + distance * 0.35);
  targetY = top;
  activeTween = gsap.to(window, {
    scrollTo: { y: top, autoKill: false },
    duration,
    ease: 'power2.inOut',
    onComplete: () => {
      targetY = null;
      activeTween = null;
    },
    onInterrupt: () => {
      targetY = null;
      activeTween = null;
    },
  });
}

/** A cinematic cut for long jumps: fade to black, jump, fade back. */
export function cutToY(y: number): void {
  const overlay = document.getElementById('cut-overlay');
  activeTween?.kill();
  targetY = null;
  if (!overlay || isReducedMotion(getState())) {
    window.scrollTo({ top: y, behavior: 'auto' });
    return;
  }
  gsap
    .timeline()
    .to(overlay, { opacity: 1, duration: 0.35, ease: 'power1.in' })
    .add(() => window.scrollTo({ top: y, behavior: 'auto' }))
    .to(overlay, { opacity: 0, duration: 0.7, ease: 'power1.out' }, '+=0.15');
}

function travel(y: number): void {
  const viewports = Math.abs(y - window.scrollY) / Math.max(1, window.innerHeight);
  if (viewports > 4) cutToY(y);
  else scrollToY(y);
}

export function goNext(): void {
  const b = nextBeat(currentY());
  if (b) scrollToY(b.y);
  else scrollToY(maxScroll());
}

export function goPrev(): void {
  const b = prevBeat(currentY());
  scrollToY(b ? b.y : 0);
}

export function goHome(): void {
  travel(0);
}

export function goEnd(): void {
  const beats = allBeats();
  const finale = firstBeatOfChapter('finale', beats);
  travel(finale ? finale.y : maxScroll());
}

export function goChapter(chapter: string): void {
  const b = firstBeatOfChapter(chapter);
  if (b) {
    travel(b.y);
    return;
  }
  const el = document.querySelector<HTMLElement>(`[data-chapter="${chapter}"]`);
  if (el) travel(el.getBoundingClientRect().top + window.scrollY);
}
