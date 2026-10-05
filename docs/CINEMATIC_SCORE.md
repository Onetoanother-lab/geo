# Cinematic score — Phase 2

The executable source is `src/content/cinematic.ts`. Regenerate this document with
`node --experimental-strip-types scripts/document-score.mjs`.

The emotional progression is **wonder → curiosity → anticipation → disruption → understanding → concern → scale → local relevance → emptiness → possibility → agency → patience → tension → reflection**.
The twelve existing chapters remain intact. The opening contains the first four emotions;
Aral contains both emptiness and the first tentative possibility. These are editorial
intentions, never measured ecological states.

## Motion and attention

Timed motion uses `src/lib/animation/motion.ts`: micro 180 ms, interface 360 ms,
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

Boundary match dissolves reuse topology in `src/lib/cinema/motifs.ts`. The leaf-to-world
sequence morphs shared SVG paths through a branching river form and geographic lines,
then reveals the bundled world map. It is a visual analogy, not river survey data.
Natural Earth country boundaries drive the world → Central Asia → Uzbekistan approach.

## Data and honesty

Existing `facts.ts`, `sources.ts` and sourced case-study series remain the statistical
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

### intro

- **Intended emotion:** wonder → curiosity → anticipation → disruption
- **Focal point:** The same large tree, first as shelter, then as an absence.
- **Visual density:** Layered canopy and water; biological activity withdraws before impact.
- **Saturation:** 0.95 → 0.5
- **Lighting state:** Warm filtered diagonal light becomes an exposed opening.
- **Sound state:** Forest → fewer birds → quiet wind → creak / pause / creak → impact → near silence.
- **Motion intensity:** Slow depth; one triggered fall; a real 1.8 second hold after impact.
- **Narrative purpose:** Make one loss felt before explaining the system.
- **Transition into the next scene:** Visible roots lose a connection; stump rings descend into the cross-section roots.
- **Suggested presenter duration:** 90 seconds.

| Beat | Emotion | Presenter intention |
|---|---|---|
| O‘rmonga kirish | wonder | Gapirmang. Tomoshabin o‘rmonni sezsin. |
| Yashirin bog‘lanishlar | curiosity | Daraxt tagidagi ildizlarga e’tibor qarating. |
| O‘rmon jimiydi | anticipation | Qushlar ketadi. Harakatni kuting. |
| Daraxt qulaydi | disruption | Harakat tugaguncha izoh bermang. |
| Sukut | disruption | Zarbadan keyingi sukutni buzmang. |
| Bir daraxt yo‘qoldi. | disruption | Bitta daraxt qoldirgan bo‘shliqni ko‘rsating. |
| Lekin u yolg‘iz emas edi. | disruption | Ildizlardan butun tizimga o‘ting. |

### system

- **Intended emotion:** understanding
- **Focal point:** One selected ecological relationship beneath the soil.
- **Visual density:** Rich cross-section; only the selected relationship is bright.
- **Saturation:** 0.78 → 0.7
- **Lighting state:** Subsurface root light; shaded canopy.
- **Sound state:** Gentle biological layers return for the explanatory cross-section.
- **Motion intensity:** One revealed connection at a time; long interactive stillness.
- **Narrative purpose:** Explain why the lost tree was never alone.
- **Transition into the next scene:** Root threads extend into the river corridor of the clearing landscape.
- **Suggested presenter duration:** 75 seconds.

| Beat | Emotion | Presenter intention |
|---|---|---|
| Ildiz ostida | understanding | Bitta bog‘lanishni tanlang. |
| Butun tizim | understanding | Qismlar bir-biriga tayanadi. |

### cut

- **Intended emotion:** concern
- **Focal point:** The clearing frontier and the empty space it leaves.
- **Visual density:** Canopy, animals, insects, water detail and shadow disappear at different thresholds.
- **Saturation:** 0.8 → 0.18
- **Lighting state:** Shade collapses; overhead glare flattens depth.
- **Sound state:** Health continuously removes birds, insects, leaves and water; exposed wind remains.
- **Motion intensity:** Audience-scrubbed loss; no ambient motion at severe degradation.
- **Narrative purpose:** Make consequences visible through absence.
- **Transition into the next scene:** Last stump expands into time rings, then the radial causes.
- **Suggested presenter duration:** 75 seconds.

| Beat | Emotion | Presenter intention |
|---|---|---|
| Chekkadan boshlanadi | concern | Tutqichni sekin suring. |
| Yo‘qolayotgan boylik | concern | Nima yo‘qligiga qarang: qushlar, soya, toza suv. |
| Ochiq yer | concern | Ko‘rsatkichlar illyustrativ. |

### causes

- **Intended emotion:** concern
- **Focal point:** One pressure changing the same circular forest patch.
- **Visual density:** Controlled radial composition; only one cause acts.
- **Saturation:** 0.58 → 0.4
- **Lighting state:** Harder overhead warning light.
- **Sound state:** Sparse wind and leaves.
- **Motion intensity:** Selected cause only; ring holds still between choices.
- **Narrative purpose:** Show land-use mechanisms without assigning simplistic villains.
- **Transition into the next scene:** Radial cause lines open into fractures and consequence chains.
- **Suggested presenter duration:** 60 seconds.

| Beat | Emotion | Presenter intention |
|---|---|---|
| Bosimlar | concern | Sabablar hududga qarab farq qiladi. |

### consequences

- **Intended emotion:** concern
- **Focal point:** One chain connecting an absence to a consequence.
- **Visual density:** Sparse; previous chains dissolve.
- **Saturation:** 0.35 → 0.2
- **Lighting state:** Ash tones; isolated legible lines.
- **Sound state:** Low exposed air, almost no life.
- **Motion intensity:** Sequential drawing, then stillness.
- **Narrative purpose:** Clarify mechanisms before expanding the scale.
- **Transition into the next scene:** Fractures become a river network; a leaf reveals the same branching form.
- **Suggested presenter duration:** 65 seconds.

| Beat | Emotion | Presenter intention |
|---|---|---|
| Oqibatlar zanjiri | concern | Bitta zanjirni oxirigacha kuzating. |
| Chegaradan tashqarida | concern | Endi miqyosni kengaytiring. |

### world

- **Intended emotion:** scale
- **Focal point:** A leaf vein becomes river topology, then the world and one illuminated region.
- **Visual density:** One shape emerges from darkness; geographic detail arrives afterward.
- **Saturation:** 0.45 → 0.65
- **Lighting state:** Cool global darkness with restrained regional illumination.
- **Sound state:** Distant air; no dramatic swell.
- **Motion intensity:** One continuous scale morph; one geographic selection at a time.
- **Narrative purpose:** Relate one living structure to planetary scale.
- **Transition into the next scene:** World dims around the selected country; cases bring the view toward Central Asia.
- **Suggested presenter duration:** 80 seconds.

| Beat | Emotion | Presenter intention |
|---|---|---|
| Barg | scale | Tomirlar shaklini eslab qoling. |
| Daryo tarmog‘i | scale | Bu shakliy o‘xshashlik, haqiqiy daryo xaritasi emas. |
| Dunyo | scale | Bir mintaqani tanlang. Belgilangan mamlakatlar o‘rmon chegaralari emas. |

### cases

- **Intended emotion:** local relevance
- **Focal point:** Geographic fills; ultimately Central Asia, Uzbekistan, Aral.
- **Visual density:** One country at a time; local view grows as others recede.
- **Saturation:** 0.6 → 0.35
- **Lighting state:** Cool geography warms toward dry local light.
- **Sound state:** Biological detail recedes approaching Aral.
- **Motion intensity:** Country-scale transitions with held data comparisons.
- **Narrative purpose:** Bring a global pattern to a familiar place, retaining nuance.
- **Transition into the next scene:** Central Asia → Uzbekistan → clearly labelled schematic Aral outline.
- **Suggested presenter duration:** 100 seconds.

| Beat | Emotion | Presenter intention |
|---|---|---|
| Buyuk Britaniya | local relevance | Maydon ulushi va o‘rmon sifati bir xil tushuncha emas. |
| Yaponiya | local relevance | Ekilgan o‘rmonlar ulushini ko‘rsating. |
| O‘zbekiston | local relevance | Markaziy Osiyodan Orolbo‘yiga yaqinlashing. |

### aral

- **Intended emotion:** emptiness → possibility
- **Focal point:** An empty horizontal horizon; later, a small rooted shrub.
- **Visual density:** Wide negative space; sparse salt dust; isolated vegetation.
- **Saturation:** 0.12 → 0.32
- **Lighting state:** Bleached dry daylight, slowly softening at ground level.
- **Sound state:** Arrival silence, then wind; only faint life near established plants.
- **Motion intensity:** Slow shoreline schematic; long horizon hold; modest vegetation growth.
- **Narrative purpose:** Feel exposure, then understand the limits of partial recovery.
- **Transition into the next scene:** Saxaul roots converge on a seedling carried into the simulator landscape.
- **Suggested presenter duration:** 100 seconds.

| Beat | Emotion | Presenter intention |
|---|---|---|
| Orolbo‘yi — sukut | emptiness | Shoshilmang. Bo‘shliqni ko‘rish uchun vaqt bering. |
| Ochiq tub | emptiness | Shamol va tuzli chang. |
| Saksovul | possibility | Ekish dengizni qaytarmaydi; yerning bir qismini himoya qiladi. |

### simulator

- **Intended emotion:** agency
- **Focal point:** The chosen land parcel and its ecological / human tradeoff.
- **Visual density:** Readable small landscape; one decision changes multiple relationships.
- **Saturation:** 0.48 → 0.68
- **Lighting state:** Condition-dependent shade and water, reflecting the audience’s choices.
- **Sound state:** Normalized health controls ecological richness.
- **Motion intensity:** Local response only; pause to consider opportunity costs.
- **Narrative purpose:** Make agency specific, constrained, remembered.
- **Transition into the next scene:** An illustrative sapling leaves the parcel and becomes the recovery tree.
- **Suggested presenter duration:** 120 seconds.

| Beat | Emotion | Presenter intention |
|---|---|---|
| Qaror va murosa | agency | Oziq-ovqat, daromad va ekologik holatni birga kuzating. |

### recovery

- **Intended emotion:** patience
- **Focal point:** A tree and its time rings; soil, canopy and complexity return at different rates.
- **Visual density:** One seedling first; only late stages add structure and wildlife.
- **Saturation:** 0.26 → 0.74
- **Lighting state:** Warm softness and depth return slowly.
- **Sound state:** Leaves precede insects and birds; full richness is never instantaneous.
- **Motion intensity:** Scrubbed time rings, quiet held stages; no growth spectacle.
- **Narrative purpose:** Separate quick planting from slow ecological complexity.
- **Transition into the next scene:** Tree trunk opens into two branches, then two trajectories.
- **Suggested presenter duration:** 90 seconds.

| Beat | Emotion | Presenter intention |
|---|---|---|
| Ko‘chat | patience | Ekishning o‘zi yetarli emas. |
| Tuproq | patience | Tizimlar bir xil tezlikda tiklanmaydi. |
| Murakkablik | patience | Yetuk o‘rmon o‘rnini darhol to‘ldirib bo‘lmaydi. |

### futures

- **Intended emotion:** tension
- **Focal point:** A single seam between two trajectories of the same forest.
- **Visual density:** One side loses layers, the other slowly regains them.
- **Saturation:** 0.3 → 0.75
- **Lighting state:** Interpolates with the audience’s comparison.
- **Sound state:** Comparison and remembered simulator health influence ecological layers.
- **Motion intensity:** Audience-controlled seam; slow change in ecological time.
- **Narrative purpose:** Keep the choice unresolved and consequential.
- **Transition into the next scene:** Both trajectories return to the exact opening tree, water and diagonal light.
- **Suggested presenter duration:** 65 seconds.

| Beat | Emotion | Presenter intention |
|---|---|---|
| Ikki yo‘l | tension | Simulyatordagi tanlov boshlang‘ich holatga ta’sir qiladi. |
| Qaysi manzara? | tension | Bu ilmiy prognoz emas. |

### finale

- **Intended emotion:** reflection
- **Focal point:** The opening composition and two quiet final lines.
- **Visual density:** Living environment persists; interface recedes after interaction.
- **Saturation:** 0.4 → 0.95
- **Lighting state:** Original diagonal light and water, responsive to the two-futures state.
- **Sound state:** Silence before the statement; soft ecological ambience returns.
- **Motion intensity:** Settle, timed sentence, held pause, final sentence; life continues slowly.
- **Narrative purpose:** Return responsibility to the audience without celebration.
- **Transition into the next scene:** Remain in the living forest; sources are available through the existing controls.
- **Suggested presenter duration:** 45 seconds.

| Beat | Emotion | Presenter intention |
|---|---|---|
| Qaytish | reflection | Boshlang‘ich manzarani tanishlariga vaqt bering. |
| Uni biz yozamiz | reflection | So‘nggi jumladan keyin o‘rmonni yashashga qo‘ying. |

