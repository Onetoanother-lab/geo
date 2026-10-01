---
name: presentation-qa
description: Use before declaring the O‘rmon presentation done or after significant changes — the live-presentation QA matrix (resolutions, input methods, reverse/fast scroll, refresh, reduced motion, audio off, mobile, performance).
---

# Presentation QA (project checklist)

Run `npm run check` (typecheck, lint, unit tests, build) and `npm run test:e2e` first.

Then verify, ideally with Playwright screenshots (`e2e/` has helpers) at each viewport:

| Area | Checks |
|---|---|
| Resolutions | 1920×1080, 1366×768, 1280×720 (projector), 1536×864, 390×844 phone, 820×1180 tablet |
| Fullscreen | `F` toggles; layout recalculates (ScrollTrigger refresh), no clipped narration |
| Input | mouse wheel, trackpad (small deltas), keyboard (↓/PgDn/↑/PgUp/Home/End/M/F/P/Esc), touch |
| Scroll | reverse through every act; fast fling to end and back; no stuck pins, no blank frames |
| Refresh | reload mid-act → lands on nearest beat, scene state matches scroll |
| Motion | OS reduced motion + in-app toggle: no parallax/camera moves; all content still present |
| Audio | works when enabled after the gate; muted by default; `M` toggles; missing audio files never error |
| Offline | after first load, disable network → everything still works (fonts, map, data bundled) |
| Content | Uzbek ‘ glyphs render in every font; no lorem; every number has a source in the Sources panel |
| Performance | no long frames > 50ms during scrubbing at 4× CPU throttle in the heaviest acts (I, III, VIII, XI) |

Record findings and fixes in the PR/commit message; do not leave known issues undocumented.
