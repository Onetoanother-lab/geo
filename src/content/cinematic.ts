import type { ChapterId } from '../app/chapters';

export type ColorStage = 'mystery' | 'living' | 'sunlight' | 'warning' | 'destruction' | 'consequence' | 'global' | 'aral' | 'recovery';
export type EmotionalBeat = {
  at: number;
  emotion: string;
  name: string;
  talkingPoint: string;
};
export type SceneScore = {
  emotion: string;
  focalPoint: string;
  density: string;
  saturation: [number, number];
  lighting: string;
  sound: string;
  motion: string;
  purpose: string;
  transition: string;
  color: ColorStage;
  health: [number, number];
  duration: number;
  beats: EmotionalBeat[];
};

/** Editorial direction, not ecological measurements. Presenter copy is Uzbek. */
export const SCORE: Record<ChapterId, SceneScore> = {
  intro: {
    emotion: 'wonder → curiosity → anticipation → disruption',
    focalPoint: 'The same large tree, first as shelter, then as an absence.',
    density: 'Layered canopy and water; biological activity withdraws before impact.',
    saturation: [0.95, 0.5], lighting: 'Warm filtered diagonal light becomes an exposed opening.',
    sound: 'Forest → fewer birds → quiet wind → creak / pause / creak → impact → near silence.',
    motion: 'Slow depth; one triggered fall; a real 1.8 second hold after impact.',
    purpose: 'Make one loss felt before explaining the system.',
    transition: 'Visible roots lose a connection; stump rings descend into the cross-section roots.',
    color: 'mystery', health: [0.96, 0.58], duration: 90,
    beats: [
      { at: 0, emotion: 'wonder', name: 'O‘rmonga kirish', talkingPoint: 'Gapirmang. Tomoshabin o‘rmonni sezsin.' },
      { at: 0.22, emotion: 'curiosity', name: 'Yashirin bog‘lanishlar', talkingPoint: 'Daraxt tagidagi ildizlarga e’tibor qarating.' },
      { at: 0.4, emotion: 'anticipation', name: 'O‘rmon jimiydi', talkingPoint: 'Qushlar ketadi. Harakatni kuting.' },
      { at: 0.5, emotion: 'disruption', name: 'Daraxt qulaydi', talkingPoint: 'Harakat tugaguncha izoh bermang.' },
      { at: 0.57, emotion: 'disruption', name: 'Sukut', talkingPoint: 'Zarbadan keyingi sukutni buzmang.' },
      { at: 0.69, emotion: 'disruption', name: 'Bir daraxt yo‘qoldi.', talkingPoint: 'Bitta daraxt qoldirgan bo‘shliqni ko‘rsating.' },
      { at: 0.86, emotion: 'disruption', name: 'Lekin u yolg‘iz emas edi.', talkingPoint: 'Ildizlardan butun tizimga o‘ting.' },
    ],
  },
  system: {
    emotion: 'understanding', focalPoint: 'One selected ecological relationship beneath the soil.',
    density: 'Rich cross-section; only the selected relationship is bright.', saturation: [0.78, 0.7],
    lighting: 'Subsurface root light; shaded canopy.', sound: 'Gentle biological layers return for the explanatory cross-section.',
    motion: 'One revealed connection at a time; long interactive stillness.', purpose: 'Explain why the lost tree was never alone.',
    transition: 'Root threads extend into the river corridor of the clearing landscape.', color: 'living', health: [0.82, 0.72], duration: 75,
    beats: [{ at: 0, emotion: 'understanding', name: 'Ildiz ostida', talkingPoint: 'Bitta bog‘lanishni tanlang.' }, { at: 0.65, emotion: 'understanding', name: 'Butun tizim', talkingPoint: 'Qismlar bir-biriga tayanadi.' }],
  },
  cut: {
    emotion: 'concern', focalPoint: 'The clearing frontier and the empty space it leaves.', density: 'Canopy, animals, insects, water detail and shadow disappear at different thresholds.',
    saturation: [0.8, 0.18], lighting: 'Shade collapses; overhead glare flattens depth.', sound: 'Health continuously removes birds, insects, leaves and water; exposed wind remains.',
    motion: 'Audience-scrubbed loss; no ambient motion at severe degradation.', purpose: 'Make consequences visible through absence.',
    transition: 'Last stump expands into time rings, then the radial causes.', color: 'destruction', health: [0.9, 0.02], duration: 75,
    beats: [{ at: 0, emotion: 'concern', name: 'Chekkadan boshlanadi', talkingPoint: 'Tutqichni sekin suring.' }, { at: 0.55, emotion: 'concern', name: 'Yo‘qolayotgan boylik', talkingPoint: 'Nima yo‘qligiga qarang: qushlar, soya, toza suv.' }, { at: 0.9, emotion: 'concern', name: 'Ochiq yer', talkingPoint: 'Ko‘rsatkichlar illyustrativ.' }],
  },
  causes: {
    emotion: 'concern', focalPoint: 'One pressure changing the same circular forest patch.', density: 'Controlled radial composition; only one cause acts.', saturation: [0.58, 0.4],
    lighting: 'Harder overhead warning light.', sound: 'Sparse wind and leaves.', motion: 'Selected cause only; ring holds still between choices.', purpose: 'Show land-use mechanisms without assigning simplistic villains.',
    transition: 'Radial cause lines open into fractures and consequence chains.', color: 'warning', health: [0.38, 0.25], duration: 60,
    beats: [{ at: 0, emotion: 'concern', name: 'Bosimlar', talkingPoint: 'Sabablar hududga qarab farq qiladi.' }],
  },
  consequences: {
    emotion: 'concern', focalPoint: 'One chain connecting an absence to a consequence.', density: 'Sparse; previous chains dissolve.', saturation: [0.35, 0.2],
    lighting: 'Ash tones; isolated legible lines.', sound: 'Low exposed air, almost no life.', motion: 'Sequential drawing, then stillness.', purpose: 'Clarify mechanisms before expanding the scale.',
    transition: 'Fractures become a river network; a leaf reveals the same branching form.', color: 'consequence', health: [0.22, 0.12], duration: 65,
    beats: [{ at: 0, emotion: 'concern', name: 'Oqibatlar zanjiri', talkingPoint: 'Bitta zanjirni oxirigacha kuzating.' }, { at: 0.9, emotion: 'concern', name: 'Chegaradan tashqarida', talkingPoint: 'Endi miqyosni kengaytiring.' }],
  },
  world: {
    emotion: 'scale', focalPoint: 'A leaf vein becomes river topology, then the world and one illuminated region.', density: 'One shape emerges from darkness; geographic detail arrives afterward.', saturation: [0.45, 0.65],
    lighting: 'Cool global darkness with restrained regional illumination.', sound: 'Distant air; no dramatic swell.', motion: 'One continuous scale morph; one geographic selection at a time.', purpose: 'Relate one living structure to planetary scale.',
    transition: 'World dims around the selected country; cases bring the view toward Central Asia.', color: 'global', health: [0.38, 0.5], duration: 80,
    beats: [{ at: 0, emotion: 'scale', name: 'Barg', talkingPoint: 'Tomirlar shaklini eslab qoling.' }, { at: 0.25, emotion: 'scale', name: 'Daryo tarmog‘i', talkingPoint: 'Bu shakliy o‘xshashlik, haqiqiy daryo xaritasi emas.' }, { at: 0.58, emotion: 'scale', name: 'Dunyo', talkingPoint: 'Bir mintaqani tanlang. Belgilangan mamlakatlar o‘rmon chegaralari emas.' }],
  },
  cases: {
    emotion: 'local relevance', focalPoint: 'Geographic fills; ultimately Central Asia, Uzbekistan, Aral.', density: 'One country at a time; local view grows as others recede.', saturation: [0.6, 0.35],
    lighting: 'Cool geography warms toward dry local light.', sound: 'Biological detail recedes approaching Aral.', motion: 'Country-scale transitions with held data comparisons.', purpose: 'Bring a global pattern to a familiar place, retaining nuance.',
    transition: 'Central Asia → Uzbekistan → clearly labelled schematic Aral outline.', color: 'global', health: [0.48, 0.1], duration: 100,
    beats: [{ at: 0, emotion: 'local relevance', name: 'Buyuk Britaniya', talkingPoint: 'Maydon ulushi va o‘rmon sifati bir xil tushuncha emas.' }, { at: 0.34, emotion: 'local relevance', name: 'Yaponiya', talkingPoint: 'Ekilgan o‘rmonlar ulushini ko‘rsating.' }, { at: 0.68, emotion: 'local relevance', name: 'O‘zbekiston', talkingPoint: 'Markaziy Osiyodan Orolbo‘yiga yaqinlashing.' }],
  },
  aral: {
    emotion: 'emptiness → possibility', focalPoint: 'An empty horizontal horizon; later, a small rooted shrub.', density: 'Wide negative space; sparse salt dust; isolated vegetation.', saturation: [0.12, 0.32],
    lighting: 'Bleached dry daylight, slowly softening at ground level.', sound: 'Arrival silence, then wind; only faint life near established plants.', motion: 'Slow shoreline schematic; long horizon hold; modest vegetation growth.', purpose: 'Feel exposure, then understand the limits of partial recovery.',
    transition: 'Saxaul roots converge on a seedling carried into the simulator landscape.', color: 'aral', health: [0, 0.28], duration: 100,
    beats: [{ at: 0, emotion: 'emptiness', name: 'Orolbo‘yi — sukut', talkingPoint: 'Shoshilmang. Bo‘shliqni ko‘rish uchun vaqt bering.' }, { at: 0.38, emotion: 'emptiness', name: 'Ochiq tub', talkingPoint: 'Shamol va tuzli chang.' }, { at: 0.6, emotion: 'possibility', name: 'Saksovul', talkingPoint: 'Ekish dengizni qaytarmaydi; yerning bir qismini himoya qiladi.' }],
  },
  simulator: {
    emotion: 'agency', focalPoint: 'The chosen land parcel and its ecological / human tradeoff.', density: 'Readable small landscape; one decision changes multiple relationships.', saturation: [0.48, 0.68],
    lighting: 'Condition-dependent shade and water, reflecting the audience’s choices.', sound: 'Normalized health controls ecological richness.', motion: 'Local response only; pause to consider opportunity costs.', purpose: 'Make agency specific, constrained, remembered.',
    transition: 'An illustrative sapling leaves the parcel and becomes the recovery tree.', color: 'recovery', health: [0.5, 0.5], duration: 120,
    beats: [{ at: 0, emotion: 'agency', name: 'Qaror va murosa', talkingPoint: 'Oziq-ovqat, daromad va ekologik holatni birga kuzating.' }],
  },
  recovery: {
    emotion: 'patience', focalPoint: 'A tree and its time rings; soil, canopy and complexity return at different rates.', density: 'One seedling first; only late stages add structure and wildlife.', saturation: [0.26, 0.74],
    lighting: 'Warm softness and depth return slowly.', sound: 'Leaves precede insects and birds; full richness is never instantaneous.', motion: 'Scrubbed time rings, quiet held stages; no growth spectacle.', purpose: 'Separate quick planting from slow ecological complexity.',
    transition: 'Tree trunk opens into two branches, then two trajectories.', color: 'recovery', health: [0.15, 0.8], duration: 90,
    beats: [{ at: 0, emotion: 'patience', name: 'Ko‘chat', talkingPoint: 'Ekishning o‘zi yetarli emas.' }, { at: 0.36, emotion: 'patience', name: 'Tuproq', talkingPoint: 'Tizimlar bir xil tezlikda tiklanmaydi.' }, { at: 0.7, emotion: 'patience', name: 'Murakkablik', talkingPoint: 'Yetuk o‘rmon o‘rnini darhol to‘ldirib bo‘lmaydi.' }],
  },
  futures: {
    emotion: 'tension', focalPoint: 'A single seam between two trajectories of the same forest.', density: 'One side loses layers, the other slowly regains them.', saturation: [0.3, 0.75],
    lighting: 'Interpolates with the audience’s comparison.', sound: 'Comparison and remembered simulator health influence ecological layers.', motion: 'Audience-controlled seam; slow change in ecological time.', purpose: 'Keep the choice unresolved and consequential.',
    transition: 'Both trajectories return to the exact opening tree, water and diagonal light.', color: 'warning', health: [0.5, 0.7], duration: 65,
    beats: [{ at: 0, emotion: 'tension', name: 'Ikki yo‘l', talkingPoint: 'Simulyatordagi tanlov boshlang‘ich holatga ta’sir qiladi.' }, { at: 0.8, emotion: 'tension', name: 'Qaysi manzara?', talkingPoint: 'Bu ilmiy prognoz emas.' }],
  },
  finale: {
    emotion: 'reflection', focalPoint: 'The opening composition and two quiet final lines.', density: 'Living environment persists; interface recedes after interaction.', saturation: [0.4, 0.95],
    lighting: 'Original diagonal light and water, responsive to the two-futures state.', sound: 'Silence before the statement; soft ecological ambience returns.', motion: 'Settle, timed sentence, held pause, final sentence; life continues slowly.', purpose: 'Return responsibility to the audience without celebration.',
    transition: 'Remain in the living forest; sources are available through the existing controls.', color: 'living', health: [0.6, 0.9], duration: 45,
    beats: [{ at: 0, emotion: 'reflection', name: 'Qaytish', talkingPoint: 'Boshlang‘ich manzarani tanishlariga vaqt bering.' }, { at: 0.55, emotion: 'reflection', name: 'Uni biz yozamiz', talkingPoint: 'So‘nggi jumladan keyin o‘rmonni yashashga qo‘ying.' }],
  },
};

export function scoreBeat(chapter: ChapterId, progress: number): EmotionalBeat {
  return [...SCORE[chapter].beats].reverse().find((b) => progress >= b.at) ?? SCORE[chapter].beats[0];
}
