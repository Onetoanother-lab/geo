---
name: accessibility-motion
description: Use when adding controls, interactions, dialogs, motion or audio to this project — semantic HTML, keyboard paths, focus, contrast, prefers-reduced-motion, text alternatives, no hover-only content.
---

# Accessibility & motion (project rules)

- Semantic structure: each act is a `<section aria-labelledby>` with a visually-hidden heading; narration lines are real text (not baked into SVG paths). Decorative SVG gets `aria-hidden="true"`; meaningful SVG gets `role="img"` + `<title>`/`aria-label`.
- Every interaction works with keyboard: hotspots are `<button>`s, sliders are `<input type="range">` (custom visuals layered on top), the simulator grid is a `role="grid"` with arrow-key movement. Nothing is hover-only; hover = focus = tap.
- Visible focus: `:focus-visible` ring uses `--focus` token, 2px+, never removed.
- Global keys are handled in `src/lib/accessibility/keyboard.ts` and are ignored when focus is inside inputs, the simulator grid or dialogs.
- Escape always closes the top-most overlay and never traps the user; dialogs return focus to their opener.
- `prefers-reduced-motion` (plus the in-app toggle) → `reduced` flag in the store: no parallax, no camera moves, crossfades ≤ 300ms or instant, no autonomous loops longer than 5s (ambient canopy sway stops).
- Contrast: body text ≥ 4.5:1 against the darkest *and* lightest point of the scene behind it; narration sits on a local scrim gradient when needed.
- Audio is never required: every sound event has an on-screen visual equivalent; captions not needed because there is no speech, but the tree-fall and wind moments are visible.
- Live regions: simulator indicator changes and selected-hotspot explanations are announced via a polite live region.
