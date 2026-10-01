/**
 * Original hand-drawn silhouette paths (local coordinates, roughly 0..100 box,
 * ground contact at y≈70 unless noted). Used across scenes.
 */
export const DEER =
  'M20,40C22,34 30,32 38,33L62,33C70,33 76,36 78,42L81,39L83,45L79,48L78,70L75,70L74,52C70,55 64,56 58,55L56,70L53,70L52,55L40,55L38,70L35,70L34,54C30,53 26,50 25,46L24,70L21,70L21,46C18,42 15,36 14,30L12,23L7,21L5,17L9,15L12,16L15,12L18,13L17,18L17,24C18,30 18,36 20,40Z';
export const DEER_ANTLERS = 'M14,13L12,5L9,2M12,5L15,1M16,13L19,6L23,4M19,6L18,1';

export const FOX =
  'M8,52C14,44 26,42 38,43L54,43C58,38 62,36 66,38L70,33L71,39C73,41 75,44 72,46L66,47L64,58L61,58L60,49L46,50L44,60L41,60L41,50C34,51 26,53 22,57C16,62 6,62 -2,58C5,58 9,55 8,52Z';

export const HARE =
  'M10,60C10,50 18,44 28,44C33,44 37,46 40,49L44,40L42,28L45,28L48,40L50,30L53,30L51,42C54,44 56,48 55,52L50,54L50,60L46,60L44,55L30,58L28,60L18,60C14,62 10,62 10,60Z';

export const BIRD_PERCHED = 'M0,0C4,-7 13,-8 18,-3L25,-5L20,0C18,5 9,7 2,5L-5,8L-1,2Z';

export const OWL =
  'M0,30C-2,18 2,6 10,2L8,-4L13,0L17,0L22,-4L20,2C28,6 32,18 30,30C28,38 22,42 15,42C8,42 2,38 0,30Z';

export function mushroom(x: number, y: number, s: number): string {
  return `M${x - 1.5 * s},${y}L${x - 1.2 * s},${y - 6 * s}L${x + 1.2 * s},${y - 6 * s}L${x + 1.5 * s},${y}Z M${x - 6 * s},${y - 6 * s}Q${x},${y - 14 * s} ${x + 6 * s},${y - 6 * s}Z`;
}

export function butterfly(x: number, y: number, s: number): string {
  return `M${x},${y}Q${x - 6 * s},${y - 7 * s} ${x - 7 * s},${y - 1 * s}Q${x - 5 * s},${y + 4 * s} ${x},${y}Q${x + 5 * s},${y + 4 * s} ${x + 7 * s},${y - 1 * s}Q${x + 6 * s},${y - 7 * s} ${x},${y}Z`;
}

/** A stranded fishing trawler (Mo‘ynoq), local box ~ 0..220 × 0..80, keel at y≈78. */
export const SHIP =
  'M0,46L16,76L188,78L216,40L170,42L168,30L156,30L156,18L132,18L130,30L120,30L118,42L60,44Z M60,44L60,38L100,38L100,44Z';
export const SHIP_MAST = 'M74,38L74,-26M74,-14L112,6M74,-14L40,4M144,18L144,-6';

/** A seedling (sprout), base at (0,0). */
export function sprout(s: number): string {
  return `M-0.6,0L-0.4,${-10 * s}L0.4,${-10 * s}L0.6,0Z M0,${-9 * s}Q${-7 * s},${-15 * s} ${-9 * s},${-10 * s}Q${-5 * s},${-7 * s} 0,${-9 * s}Z M0,${-7 * s}Q${7 * s},${-13 * s} ${9 * s},${-8 * s}Q${5 * s},${-5 * s} 0,${-7 * s}Z`;
}
