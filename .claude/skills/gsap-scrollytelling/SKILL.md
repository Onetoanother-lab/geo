---
name: gsap-scrollytelling
description: Use when writing GSAP timelines, ScrollTrigger pins/scrubs, scene transitions, beat navigation or animation cleanup in this project (src/lib/animation, src/scenes/*).
---

# GSAP scrollytelling (project rules)

GSAP + ScrollTrigger is the only animation engine. No Framer Motion, no second scroll library.

## Structure
- One scene = one `useGSAP(() => {...}, { scope, dependencies: [reduced] })` block that builds **one pinned timeline** (or a small number of grouped triggers). Never hundreds of unrelated triggers.
- Build scenes with `useSceneTimeline` from `src/lib/animation/useSceneTimeline.ts`: it creates the pinned, scrubbed timeline, registers beats for keyboard navigation and handles the reduced-motion variant.
- Timeline positions are 0–100 "scroll percent" units per scene (`tl.to(x, {...}, 20)`, duration in the same units) so beats are readable.
- Register navigation beats as timeline labels (`tl.addLabel('beat:name', 40)`); the global navigator turns them into scroll positions with `ScrollTrigger.labelToScroll`.
- Continuous state (e.g. `loss` 0→1) goes through a proxy object tweened by the timeline and written to the DOM via CSS custom properties or `gsap.quickSetter` — not React state on every frame.
- If the DOM must be re-rendered from a scrubbed value (e.g. which trees are standing), quantise it (steps) and only `setState` when the step changes.

## Lifecycle
- `useGSAP` reverts everything on unmount; never create tweens outside it (or use `contextSafe` for event handlers).
- Pins use `pinSpacing: true`, `anticipatePin: 1`, and `invalidateOnRefresh: true` when values depend on viewport size.
- Call `ScrollTrigger.refresh()` only after fonts load and after lazy scenes mount (`src/lib/animation/refresh.ts` debounces it).
- Interactions that drive a scrubbed scene (sliders) set the **scroll position** (single source of truth), so scroll and drag never fight.

## Must test
Reverse scroll, fast flick to the end, refresh mid-scene (`scrollRestoration` is manual; we restore to the nearest beat), resize/fullscreen toggle, reduced motion.

## Reduced motion
`reduced === true` → no parallax/camera moves, no scale > 5%, opacity/state crossfades only. Information must stay identical.
