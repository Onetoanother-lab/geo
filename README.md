# O‘RMON: YO‘QOLAYOTGAN NAFAS

*Agar o‘rmonlar yo‘qolsa?* An immersive, scroll-driven documentary presentation about deforestation, in Uzbek (Latin script). It is designed to be presented live on a projector.

The audience walks into a living forest and watches a tree fall. They explore the forest as a system and transform a landscape with their own hand. Then they see why forests disappear and what disappears with them. A leaf's veins become rivers and then the world map; from there they move to three real-world cases and on to the Aral Sea region by way of Central Asia and Uzbekistan. They make land-use decisions in a small simulator, wait for a tree to grow through its time rings, compare two futures, and end where they began. The experience remembers their simulator choices and lets them colour the ending.

- **Stack:** Vite, React and TypeScript, with GSAP + ScrollTrigger as the only animation engine. Visuals are procedural SVG plus a little Canvas 2D, and the map is d3-geo with bundled Natural Earth data. Fonts are bundled.
- **No backend, no live APIs, no WebGL.** After the build, the whole presentation works offline.
- **Every number is sourced.** Values live in `src/content/facts.ts` with sources in `src/content/sources.ts`, and all of them are listed in the in-app Sources panel (press `S`). Claims that couldn't be verified are listed there too.

## Setup

Requirements: Node.js 20 or newer (tested with 22) and npm.

```bash
npm install
npm run dev        # development server (http://localhost:5173)
npm run build      # production build → dist/
npm run preview    # serve the production build (http://localhost:4173)
```

The build uses relative paths, so `dist/` can be served from any static server or subfolder (`npx serve dist`, `python3 -m http.server -d dist`). Browsers block ES modules on `file://`, so serve it rather than double-clicking `index.html`.

### Quality checks

```bash
npm run typecheck
npm run lint
npm test                      # unit + component tests (Vitest, jsdom)
npx vitest run src/lib/simulator   # one folder / file
npm run test:e2e              # Playwright smoke + cinema suites against the production preview
npm run check                 # typecheck + lint + tests + build
```

- The browser suites cover every act at 1920×1080, 1366×768, 1280×720, 1536×864, 390×844 and 820×1180. They also check the tree-fall silence in full and reduced motion, simulator memory, cinema mode and the presenter window.
- To use an installed browser instead of Playwright's own Chromium, set `PW_CHROMIUM_PATH`. On Windows (PowerShell): `$env:PW_CHROMIUM_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"; npm run test:e2e`.
- `node scripts/cinematic-audit.mjs` runs a presentation audit against a running preview on port 4173. It checks fullscreen, mute, the motion toggle, wheel/trackpad/touch input, offline rendering, external requests and frame times under 4× CPU throttling, and writes `test-results/manual/cinematic-audit.json`.
- `node --experimental-strip-types scripts/document-score.mjs` regenerates `docs/CINEMATIC_SCORE.md` after editing `src/content/cinematic.ts`.

## Presenting

| Key | Action |
|---|---|
| ↓ · PageDown · Space | next moment (beat) |
| ↑ · PageUp · Shift+Space | previous moment |
| Home / End | beginning / finale |
| M | sound on/off |
| F | fullscreen (where the browser allows it) |
| S | sources panel |
| P | separate presenter window |
| Esc | close the top-most panel (never traps) |

Mouse wheel, trackpad and touch scrolling work everywhere; the keys only add precise stops. The thin line on the right edge shows progress, and hovering it (or Tab-focusing it) lists the chapters. The **Boblar** button opens a chapter list with the key reference.

**Presenter mode:**
- Press `P`, choose **Taqdimotchi**, or open `…/?presenter` for the separate presenter window. Notes are never rendered over the projected experience.
- The window shows:
  - elapsed time since entry;
  - the current chapter, its suggested duration and the next chapter;
  - the current beat with its talking point, and the next talking point;
  - the chapter's sources;
  - on the finale, the practical actions ("Bugun nima qilish mumkin?").
- It can drive the presentation with ←/→/↑/↓ and M. Keep it on the laptop screen.
- **Kalibrlash** opens the optional projector tests: shadow steps, text contrast, a safe area and a 16:9 frame. It also reports the presentation viewport and motion mode. Move this test window to the projector temporarily to inspect physical output. Its shadow-lift slider also lightens the dark scenes in the experience. **Ovoz sinovi** plays a short tone; it respects mute.
- **Kino** (cinema mode) hides the cursor and nonessential controls after two seconds without pointer movement. Pointer movement restores them immediately; keyboard activity and visible focus keep them available.
- Chapter jumps (Home/End, the chapter list) cut directly to the destination. There are no fades to black.

**Cinematic direction:**
- [Emotional score](docs/CINEMATIC_SCORE.md): one entry per chapter with emotion, focal point, density, saturation, lighting, sound, motion, purpose and transition. It is generated from `src/content/cinematic.ts`.
- [Cinematic QA](docs/CINEMATIC_QA.md): the ten-question review of every chapter, the verification results and the known limits.
- One ecological "health" value per moment drives the light, saturation, a barely visible life pulse and the synthesized sound (leaves, insects, birds, water, exposed wind). As the forest degrades, life is removed rather than only recoloured.
- The tree fall is a timed sequence: birds leave, the wind drops, two creaks, the fall, a real 1.8-second silence, then the first line.
- Recurring motifs (tree rings, roots, dust, light) hand over between chapters.
- Simulator choices persist for the browser tab and subtly shape both futures and the finale. They are illustrative, never a forecast.
- The finale rebuilds the opening composition. Its light follows the audience's comparison of the two futures.

**Motion:**
- The app follows the operating system's *reduce motion* setting.
- The **Harakat** button cycles system → reduced → full.
- Reduced mode removes parallax and camera moves and uses crossfades; all content stays available.

**Sound:**
- Nothing plays before the entry click.
- **O‘rmonga kirish** enters with ambient sound; **Ovozsiz kirish** enters silently.
- The sound is synthesized live (forest bed, wind, the tree-fall), so no audio files are needed.
- If you add licensed loops to `public/audio/` (see `src/lib/audio/manifest.ts`), they are layered in automatically. Missing files are ignored.

## Structure

```
src/
  app/            App shell, store, chapter registry, global effects
  components/     layout (Scene, gate), controls (rail, dialogs, presenter), visualizations (forest renderer, StatLine)
  scenes/         one folder per act (IntroForest … Finale)
  content/        narrative.ts (all Uzbek copy), facts.ts, sources.ts, caseStudies.ts
  lib/            animation (GSAP setup, scene timelines, beats, navigator), audio, accessibility,
                  geography, forest (procedural vegetation), simulator (pure rule engine), presenter
  content/cinematic.ts  the emotional score (per-chapter direction, beats, talking points)
  lib/cinema/     ecological health, richness and the shared motif paths
  styles/         tokens.css (design tokens), base.css, cinema.css (colour script, light, cinema mode)
e2e/              Playwright smoke and cinema suites
docs/             CINEMATIC_SCORE.md (generated), CINEMATIC_QA.md
scripts/          document-score.mjs, cinematic-audit.mjs
assets/README.md  asset origins and licences
```

See `CLAUDE.md` for architectural rules, design principles and the project skills in `.claude/skills/`.

## Editing content

- Copy lives in `src/content/narrative.ts`. Use `‘` for o‘/g‘ and `’` for the tutuq belgisi. A test enforces this, and also checks that narrative copy contains no digits.
- To add a number:
  1. Add a `Stat` to `src/content/facts.ts`.
  2. Point it at a `Source` in `src/content/sources.ts`.
  3. Render it with `<StatLine factId="…" />`.

  Unverifiable claims belong in `RESEARCH_GAPS` and must be phrased qualitatively on screen.
- Chapter direction, beat names and presenter talking points live in `src/content/cinematic.ts`. Regenerate `docs/CINEMATIC_SCORE.md` after changing it.

## Presentation Day Checklist

1. **Build and run.** Do this the day before, with internet:
   ```bash
   npm install && npm run build && npm run preview
   ```
   Open `http://localhost:4173`. Use `npm run preview` (not `dev`) for the presentation.
2. **Browser.** Use the latest Google Chrome or Microsoft Edge (Chromium). Close other heavy tabs. Set page zoom to 100% (`Ctrl+0`).
3. **Fullscreen.**
   - Click **O‘rmonga kirish**, then press `F`, or use F11 (macOS: `Ctrl+Cmd+F`).
   - If the browser refuses fullscreen from the key, use F11.
   - After switching to fullscreen, wait a second; the layout recalculates itself.
4. **Audio check.**
   - Enter with **O‘rmonga kirish** and confirm you hear a quiet forest bed.
   - Scroll to the falling tree and confirm you hear it.
   - Set the room volume low; `M` mutes instantly.
   - If there is no sound, carry on: nothing in the story depends on audio.
5. **Resolution check.**
   - Present at 1920×1080 or 1366×768.
   - Mirror the display or use *Extend* with the presenter window on the laptop.
   - Scroll once through all acts on the actual projector to check contrast. The dark scenes need a dimmed room.
   - In the presenter window, open **Kalibrlash** and move it to the projector. If the first shadow steps merge, raise the projector brightness or the shadow-lift slider.
6. **Offline check.**
   - With the preview server running, load the page once.
   - Turn off Wi-Fi and reload.
   - Everything (fonts, map, data, sounds) must still work, because nothing is fetched from the internet.
7. **Rehearse the controls.**
   - Arrow keys or a presenter clicker (PageUp/PageDown) move between moments.
   - `Home` returns to the start and `S` shows the sources.
   - Refreshing mid-presentation offers **Davom ettirish** (continue) to return to the same moment.
   - The simulator remembers choices for the browser tab, and they colour the ending. After rehearsing, press **Qaytadan** in the simulator or open a fresh tab, so the audience starts from the original landscape.
8. **If something goes wrong.**
   - *No WebGL / old graphics driver:* not a problem. The presentation uses no WebGL, only SVG and Canvas 2D.
   - *Visuals stutter on a weak laptop:* plug the laptop in and make sure hardware acceleration is on in the browser settings. Then press **Harakat** until it reads *kamaytirilgan* (reduced motion), or close other apps. All content stays. The clearing (Act III), recovery (Act X) and two-futures (Act XI) scenes are the heaviest.
   - *Fullscreen blocked:* use F11.
   - *Audio blocked or broken:* press `M` twice, or continue silently.
   - *Page stuck or blank:* reload and choose **Davom ettirish**.
   - *Wrong position after resizing:* scroll a little or press ↓; pins recalculate automatically.
