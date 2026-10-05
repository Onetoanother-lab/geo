# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**“O‘RMON: YO‘QOLAYOTGAN NAFAS”**, an immersive scrollytelling presentation about deforestation in Uzbek (Latin script). It's meant to be presented live on a projector. Think interactive documentary or museum installation, not a website, slideshow, dashboard or NGO landing page. Code and docs are in English; all on-screen copy is Uzbek.

## Commands

```bash
npm install
npm run dev          # Vite dev server
npm run build        # tsc -b && vite build  → dist/ (relative base, works from file server / USB)
npm run preview      # serve dist on :4173
npm run typecheck
npm run lint
npm test             # vitest (jsdom), all unit tests
npx vitest run src/lib/simulator   # single test file/folder
npx vitest run -t "advances"       # single test by name
npm run test:e2e     # Playwright smoke test against `npm run preview`
                     # in the cloud container: PW_CHROMIUM_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome npm run test:e2e
npm run check        # typecheck + lint + unit tests + build
```

## Architecture (big picture)

- **Stack:** Vite, React, TypeScript, GSAP + ScrollTrigger (the *only* animation engine), SVG/Canvas 2D, d3-geo with bundled `world-atlas` 110m topology. No WebGL, no UI kit, no backend, no runtime network calls. Fonts are bundled through `@fontsource`.
- **One long document.** `src/app/Experience.tsx` renders the entry gate, then the 12 acts in order (`src/scenes/*`), then global controls. Each act is `<section class="scene" data-chapter>` with an inner `.stage`. Pinned acts pin the `.stage`, so the pin spacer stays inside the section and chapter detection works off section rects.
- **Chapters registry:** `src/app/chapters.ts` holds the order, Uzbek titles, presenter talking points and the source ids per act. The navigator, progress rail, presenter mode and keyboard all read from it.
- **Scene timelines:** each pinned act builds a single scrubbed GSAP timeline through `useSceneTimeline` (`src/lib/animation/useSceneTimeline.ts`). Positions use 0–100 units. Labels named `beat:*` become keyboard stops through the beat registry (`src/lib/animation/beats.ts`). Sliders that drive a scrubbed scene (Acts III and XI) write the **scroll position**, which is the single source of truth.
- **Global state:** a tiny external store (`src/app/store.ts`, read with `useSyncExternalStore`) holds `entered`, `soundOn`, `motion` (system/reduced/full → effective `reduced`), `chapterId`, `progress`, the overlay flags, cinema mode, the current beat, the remembered simulator result and the futures comparison. Simulator state is local to Act IX, driven by the pure reducer in `src/lib/simulator`, and saved for the browser session by `src/lib/simulator/memory.ts`.
- **Forest renderer:** `src/lib/forest` produces seeded procedural tree silhouettes (conifer/broadleaf/saxaul paths). `ForestScene`/`ForestLayer` components reuse it in Acts I, III, XI and XII, so the finale echoes the opening. The palette is driven by the CSS custom property `--life` (1 = living, 0 = degraded), registered with `@property` and mixed with `color-mix()` in `src/styles/tokens.css`.
- **Cinematic layer:** `src/content/cinematic.ts` is the emotional score per chapter (emotion, focal point, lighting, sound, saturation, beats, talking points); `docs/CINEMATIC_SCORE.md` is generated from it by `scripts/document-score.mjs`. `src/app/useCinemaDirector.ts` turns the current chapter into one normalized ecological health value and writes lighting/saturation/pulse CSS variables and the audio ecology from it (`src/lib/cinema/ecology.ts`). Timed motion uses the tokens in `src/lib/animation/motion.ts`; recurring motif paths live in `src/lib/cinema/motifs.ts`.
- **Audio:** `src/lib/audio/engine.ts` is a Web Audio engine that synthesizes the forest bed, wind and the tree-fall cue procedurally. Optional files listed in `src/lib/audio/manifest.ts` (under `public/audio/`) are used when present; missing files fall back silently. Audio starts only after the gate click and stays muted unless chosen. `M` toggles it.
- **Keyboard/presenter:** `src/lib/accessibility/keyboard.ts` handles ↓/PgDn/Space (next beat), ↑/PgUp (previous), Home/End, M (mute), F (fullscreen), P (presenter window), S (sources), Esc (close the top overlay, never traps). It ignores keys while focus is in inputs, the simulator grid or dialogs. `?presenter` opens a separate presenter window synced through `BroadcastChannel` (`src/lib/presenter`).
- **Content is data:** every number lives in `src/content/facts.ts` with `sourceId` → `src/content/sources.ts`. Uzbek copy lives in `src/content/narrative.ts`, and case data in `src/content/caseStudies.ts`. Unsourced claims go into `RESEARCH_GAPS` and are phrased qualitatively. Tests enforce: no stray numerals in scene copy outside facts, every fact has a valid source, and the Uzbek apostrophe convention.

## Design rules (from the master brief — keep them)

- Emotional arc: wonder → understanding → disturbance → consequence → scale → local relevance → possibility → reflection. Every beat must reveal, invite interaction, transform the environment, or advance the story. Static information dumps are failures.
- Palette tokens: forest-dark/deep/moss/leaf/sunlight (living) → soil/dust/ash/ochre (loss). Recovery returns to green muted and slowly. Never neon eco green.
- Large statements ≤ 12 words; short paragraphs only; nuance goes to the presenter notes and the sources panel. No “Section 1” headings, no rows of cards, no glassmorphism, no lorem, no invented statistics.
- Each act has a distinct camera: wide forest → cross-section → systemic landscape → top-down → node chains → map → three distinct case visuals → ground-level desert → tile grid → single tree → split screen → bookend forest.
- Motion communicates meaning. With reduced motion (OS setting or the in-app toggle): no parallax or camera moves, crossfades only, no ambient loops; all information stays available.
- Uzbek typography: use **‘ (U+2018)** for o‘/g‘ and **’ (U+2019)** for tutuq belgisi (ma’lumot). Never ASCII `'` or U+02BB, because Fraunces lacks U+02BB. Avoid → arrows in text (missing glyph); draw them in SVG.
- Priority when trading off: narrative coherence > visual quality > opening forest > living ecosystem > deforestation reveal > Aral > simulator > two futures > world map > case studies > audio polish > decoration.

## Project skills

Use the matching skill in `.claude/skills/`:
- `immersive-storytelling`: any scene or copy work.
- `gsap-scrollytelling`: timelines, pins, cleanup.
- `interactive-data-viz`: maps, timelines, indicators.
- `accessibility-motion`: controls, motion, dialogs.
- `research-fact-checking`: any number or claim.
- `presentation-qa`: before calling work done.
- `webgl-performance`: only if WebGL is ever proposed; the build deliberately has none.
- The vendored animation-principles skills (`gsap-greensock`, `scroll-animations`, `accessible-motion`, `motion-sickness`, `performance-optimization`, `naturalistic-motion`, `filmmaker`, …) cover motion craft.

## Other skills and plugins in this repo

- `scrollytelling`: written from the docs and source of [basementstudio/scrollytelling](https://github.com/basementstudio/scrollytelling). The app itself uses GSAP directly rather than that library.
- 144 skills from [dylantarre/animation-principles](https://github.com/dylantarre/animation-principles) at commit `8359713`. They are flattened into one folder, and the skill-level skills are renamed `animation-<level>`. MIT licenses are in `.claude/vendor-licenses/`.
- `.claude/settings.json` turns on the Anthropic `document-skills` and `example-skills` plugins from the `anthropics/skills` marketplace. They are fetched at startup, not stored here.
- When the user names or links a new skill:
  - Clone the source.
  - If it has a `.claude-plugin/marketplace.json`, register it in settings.
  - Otherwise copy each skill folder flat into `.claude/skills/<name>/`, keeping the frontmatter `name` equal to the folder name and saving the license.
  - If the source is a library with no skill, write one from its docs and check it against the source code.
  - Record the source here. New skills load in the next session; until then, read the file directly.
