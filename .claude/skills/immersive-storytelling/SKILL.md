---
name: immersive-storytelling
description: Use when designing or changing any scene, transition, copy or layout in the O‘rmon presentation — cinematic pacing, narrative continuity, visual hierarchy, and avoiding conventional webpage/slide/card layouts.
---

# Immersive storytelling (project rules)

The experience is a digital documentary / museum installation, not a website. Before adding or changing anything, ask: **what does the audience feel at this moment, and what changed in the world on screen?**

## The four-verb test
Every beat must do at least one of:
1. **reveal** something (a hidden layer, a number, a relationship),
2. let the audience **interact** with something,
3. **transform** the environment (palette, vegetation, light, sound),
4. **advance** the story (a line of narration that moves the arc).

A beat that only *displays information* fails. Move it into a source panel, the presenter notes, or delete it.

## Emotional arc (do not reorder)
wonder → understanding → disturbance → consequence → scale → local relevance → possibility → reflection.
Palette tracks the arc through the `--life` custom property (1 = living forest, 0 = degraded) and per-act tokens in `src/styles/tokens.css`. Recovery returns to green *slowly and muted* — never neon eco-branding.

## Layout rules
- One idea per screen. Large statements ≤ 12 words. Body copy ≤ ~40 words per beat.
- Typography lives *in* the scene (over fog, against sky, on the ground plane), not in boxes. Editorial captions use a hairline rule + mono label, not cards.
- No section headings like "Section 3". Acts are felt through environment changes; chapter names exist only in the navigator and presenter mode.
- Leave silence: empty sky, dark frames, a held beat before a key line.
- Every scene must look different from its neighbours (camera: wide → cross-section → top-down → map → ground-level → grid → single tree → split).

## Continuity
- Scene transitions hand over a visual element (fog, horizon line, dust, palette) instead of hard cuts.
- Reuse the forest renderer (`src/lib/forest`) so the finale echoes the opening.
- Reverse scrolling must replay the story coherently — never one-shot animations that leave the scene in a "played" state when scrolling back.

## Tone
Unsettling, not sensational. Mechanisms, not apocalypse. Hope is conditional ("depends on decisions"), never a promise. No cartoon villains (no lumberjack characters).
