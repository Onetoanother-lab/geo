---
name: scrollytelling
description: Use when building scroll-driven ("scrollytelling") animations in React with @bsmnt/scrollytelling (basement.studio's GSAP ScrollTrigger wrapper) — Root, Animation, Pin, Parallax, Stagger, Waypoint, ImageSequenceCanvas, useScrollytelling, useScrollToLabel.
---

# BSMNT Scrollytelling

`@bsmnt/scrollytelling` wraps GSAP ScrollTrigger in React components. One `Root` owns one scroll-scrubbed GSAP timeline and exposes it through React Context; every child component appends tweens to that timeline. Tweens are positioned with `start`/`end` as **percentages (0–100) of the Root's scroll progress**, not with time-based `duration`.

Source: https://github.com/basementstudio/scrollytelling (MIT). Distilled from its docs and `scrollytelling/src` at commit `0c26959`. Where the published docs and source disagree, this file follows the source.

## Install

```bash
npm i @bsmnt/scrollytelling gsap   # peer deps: gsap >=3, react >=18, react-dom >=18
```

The components are `'use client'`. Parents and children can stay React Server Components.

```tsx
import * as Scrollytelling from "@bsmnt/scrollytelling";
```

## Mental model

- Defaults: `scrub: true`, `ease: "linear"`. The library handles mount/unmount cleanup, so don't build GSAP timelines in `useEffect` yourself.
- Root `start`/`end` use ScrollTrigger syntax (`"top top"` / `"bottom bottom"` by default). The scroll distance between them is the 0→100 range all child tweens map onto.
- **Most common bug:** if the element `Root` wraps is only `100vh` tall, the default start/end give zero scroll distance and nothing animates. Make the wrapped element taller (e.g. `200vh` with a `position: sticky` inner), or set `end="bottom start"`.
- Roots nest and compose. Each one is its own timeline/ScrollTrigger.

## Tween shape

```ts
type Tween = { start: number; end: number } &
  ({ to: gsap.TweenVars } | { from: gsap.TweenVars } | { fromTo: [gsap.TweenVars, gsap.TweenVars] });
// optionally `target: gsap.TweenTarget | React.RefObject<HTMLElement>`; without it, the wrapped child is animated
// `tween` accepts a single Tween or an array of them
```

## Components

| Export | Purpose | Key props |
|---|---|---|
| `Root` | Creates timeline + ScrollTrigger, provides context | `start` (`"top top"`), `end` (`"bottom bottom"`), `scrub` (`true` \| number), `trigger`, `defaults`, `toggleActions`, `callbacks`, `disabled`, `debug={{ label, visualizer, markers }}` |
| `Animation` | Appends tween(s) for its child | `tween: Tween \| Tween[]`, `disabled` |
| `Pin` | Pins its child while the rest scrolls | **`childHeight`** and `pinSpacerHeight` (both required; the docs table wrongly calls the first `tween`), `top` (`0`), `childClassName`, `pinSpacerClassName` |
| `Parallax` | Parallax movement for its child | `tween={{ start, end, target?, movementX?, movementY? }}`, where movement is `{ value: number, unit: "px" \| "vh" \| ... }`. You must give `movementX` or `movementY`. |
| `Stagger` | Same tween across children, staggered | `tween`, `overlap` (0–1), `disabled` |
| `Waypoint` | Fires at a single progress point | `at` (0–100), `onCall`, `onReverseCall`, `label` (creates a GSAP label), `tween={{ target?, to\|from\|fromTo, duration }}` (time-based, not scrubbed) |
| `RegisterGsapPlugins` | Registers extra GSAP plugins | `plugins={[TextPlugin, ...]}`, wraps the Root |
| `ImageSequenceCanvas` | Canvas frame-sequence helper | `width`, `height`, `getFrameSrc(frame, { supportsWebp, supportsAvif })`, `controllerRef` → `{ preload(start, end), draw(frame), canvas }` |
| `useScrollytelling()` | Returns `{ timeline }` from the nearest Root | Must be called inside a Root. Guard `if (!timeline) return`. |
| `useScrollToLabel(label, opts?)` | Scrolls to a `Waypoint` label | `opts: { behavior: "auto" \| "instant" \| "smooth", offset }` |

## Patterns

Sequenced reveal (replaces a hand-written GSAP timeline + cleanup):

```tsx
<Scrollytelling.Root>
  <div style={{ height: "200vh" }}>
    <div style={{ position: "sticky", top: 0 }}>
      <Scrollytelling.Animation tween={{ start: 0, end: 30, from: { opacity: 0, scale: 0.9 } }}>
        <h1>Hello World</h1>
      </Scrollytelling.Animation>
      <Scrollytelling.Animation
        tween={[
          { start: 30, end: 80, to: { rotate: 360 } },
          { start: 80, end: 100, to: { y: 100 } },
        ]}
      >
        <div className="box" />
      </Scrollytelling.Animation>
    </div>
  </div>
</Scrollytelling.Root>
```

Late-starting section (e.g. a footer that animates as it enters):

```tsx
<Scrollytelling.Root start="top 80%" debug={{ label: "Footer" }}>…</Scrollytelling.Root>
```

Layered pinning:

```tsx
<Scrollytelling.Pin childHeight={0} pinSpacerHeight="100vh" top={0}>
  <section>…</section>
</Scrollytelling.Pin>
```

Callback at a point:

```tsx
<Scrollytelling.Waypoint at={50} onCall={triggerConfetti} label="midpoint" />
```

## Debugging

Pass `debug={{ label: "name" }}` on `Root` to open the **Visualizer**, a draggable panel showing where each tween sits on the timeline. It switches between timelines with a dropdown. Add `markers: true` for ScrollTrigger markers.

## Examples

- Demo site: https://scrollytelling.basement.studio/
- Simple tweening: https://stackblitz.com/edit/react-ts-8rqm8k
- With Lenis smooth scroll: https://stackblitz.com/edit/react-ts-uuwfed
- Layered pinning: https://stackblitz.com/edit/react-ts-4dtlww
- Horizontal scroll: https://stackblitz.com/edit/stackblitz-starters-fx6y3a
- Three.js tube: https://codesandbox.io/s/978cns

GSAP itself is under GreenSock's standard license (https://gsap.com/standard-license/).

For motion-design judgement (timing, easing, choreography, reduced motion), pair this with the animation-principles skills such as `gsap-greensock`, `scroll-animations` and `motion-sickness`.
