---
name: interactive-data-viz
description: Use when building maps, timelines, before/after comparisons, counters, indicators or diagrams in this project (world map, UK woodland timeline, Japan, Aral, simulator indicators).
---

# Interactive data visualisation (project rules)

- A visualisation must **explain a mechanism or a change**. If it is decorative, cut it.
- Every number comes from `src/content/facts.ts` and references a `sourceId` in `src/content/sources.ts`. No literal statistics in components — a unit test enforces this for scene files.
- Label values directly (no legends to decode). Always show unit, year/period and scope next to the value (`StatLabel` component).
- Schematic/illustrative graphics (e.g. Aral shorelines, simulator indicators) must say so on screen: "sxematik tasvir" / "soddalashtirilgan model".
- Relative indicators in the simulator and the Act III reveal are qualitative (0–1 bars, words), never fake percentages.
- Maps: d3-geo + bundled `world-atlas` topology, Equal Earth projection, no tiles, no live APIs. Camera moves are SVG group transforms tweened by GSAP.
- Every interactive viz needs a keyboard path (buttons/listbox/radiogroup) that reaches the same content as pointer interaction.
- Colours come from tokens; data highlight = `--sunlight`, loss = `--ochre`/`--ash`, recovery = `--leaf` (muted).
