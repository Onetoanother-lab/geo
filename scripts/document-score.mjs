import { mkdirSync, writeFileSync } from 'node:fs';
import { SCORE } from '../src/content/cinematic.ts';

mkdirSync('docs', { recursive: true });
const opening = `# Cinematic score — Phase 2

The executable source is \`src/content/cinematic.ts\`. Regenerate this document with
\`node --experimental-strip-types scripts/document-score.mjs\`.

The emotional progression is **wonder → curiosity → anticipation → disruption → understanding → concern → scale → local relevance → emptiness → possibility → agency → patience → tension → reflection**.
The twelve existing chapters remain intact. The opening contains the first four emotions;
Aral contains both emptiness and the first tentative possibility. These are editorial
intentions, never measured ecological states.

## Motion and attention

Timed motion uses \`src/lib/animation/motion.ts\`: micro 180 ms, interface 360 ms,
text 600 ms, environment 1200 ms, transformation 1900 ms, emotional hold 1800 ms.
Scrubbed ecological change stays tied to scroll or a native input. Scroll timeline
positions remain normalized 0–100 units, not seconds. Major opening and final
statements use timed sequences. One transformation is the focal point at a time.

The fall starts with biological withdrawal, quiet wind, a creak at 1.8 s, a second
creak at 3.4 s, movement at 3.8 s and impact at 5.5 s. The first statement starts
1.8 s after the actual impact; the second starts 4.8 s after it. These holds use
elapsed time so scroll velocity and GSAP lag smoothing cannot stretch them.
Navigation remains available: leaving settles the scene without
playing offscreen sound cues; returning above the hush resets it.

Reduced motion uses static composition and opacity/state changes. It retains
the timed silence, accessible statements, semantic controls and scene meaning.
No camera displacement, rotating fall, impact shake or autonomous pulse is required.

## Four evolving motifs

- **Rings / time:** the fallen tree’s stump → radial cause composition → selectable recovery rings.
- **Roots / relationships:** opening roots → cross-section → river corridors → cause fractures → leaf veins / rivers / geography → restored roots.
- **Dust / exposure:** a restrained impact plume → bare land → windborne Aral salt → less dust around established vegetation.
- **Light / richness:** filtered directional light → overhead exposure → bleached horizon → gradually restored warmth and shade.

Boundary match dissolves reuse topology in \`src/lib/cinema/motifs.ts\`. The leaf-to-world
sequence morphs shared SVG paths through a branching river form and geographic lines,
then reveals the bundled world map. It is a visual analogy, not river survey data.
Natural Earth country boundaries drive the world → Central Asia → Uzbekistan approach.

## Data and honesty

Existing \`facts.ts\`, \`sources.ts\` and sourced case-study series remain the statistical
authority. No new empirical claims or external runtime services were added.
Regional country highlighting does not claim to trace forest boundaries.
There is **no verified multi-period shoreline dataset bundled in this project**.
The retained Aral diagram is explicitly labelled as schematic, with no claimed
dated survey boundaries. Do not promote it into a historical GIS layer.

Simulator values, tradeoff weights, ecological health, light and sound are illustrative.
The model is not a scientific forecast. Regrowth retains its origin after canopy
formation and does not receive intact-forest biodiversity or carbon at that threshold.
Session storage preserves the landscape; the result influences the starting forest
condition subtly, while the audience can still explore both trajectories.
In the finale, health and saturation follow the remembered comparison instead of
scroll position. The return leans toward the opening light unless the audience
leans clearly toward loss; the finale saturation range below is mapped by health.

## Chapter direction

`;
const fields = [['emotion','Intended emotion'], ['focalPoint','Focal point'], ['density','Visual density'], ['saturation','Saturation'], ['lighting','Lighting state'], ['sound','Sound state'], ['motion','Motion intensity'], ['purpose','Narrative purpose'], ['transition','Transition into the next scene']];
let content = opening;
for (const [id, score] of Object.entries(SCORE)) {
  content += `### ${id}\n\n`;
  for (const [key, label] of fields) {
    const value = Array.isArray(score[key]) ? score[key].join(' → ') : score[key];
    content += `- **${label}:** ${value}\n`;
  }
  content += `- **Suggested presenter duration:** ${score.duration} seconds.\n\n`;
  content += '| Beat | Emotion | Presenter intention |\n|---|---|---|\n';
  for (const beat of score.beats) content += `| ${beat.name} | ${beat.emotion} | ${beat.talkingPoint} |\n`;
  content += '\n';
}
writeFileSync('docs/CINEMATIC_SCORE.md', content, 'utf8');
