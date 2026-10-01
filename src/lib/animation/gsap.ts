import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, MorphSVGPlugin, DrawSVGPlugin, useGSAP);

ScrollTrigger.config({ ignoreMobileResize: true });
gsap.defaults({ ease: 'none' });

/** Cinematic easing presets mirrored from tokens.css. */
export const EASE = {
  out: 'power2.out',
  inOut: 'power2.inOut',
  settle: 'expo.out',
  dread: 'power3.in',
  breath: 'sine.inOut',
} as const;

export { gsap, ScrollTrigger, useGSAP };
