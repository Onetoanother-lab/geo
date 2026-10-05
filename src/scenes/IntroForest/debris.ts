import { HERO } from '../../components/visualizations/forest/ForestScene';
import { leafPath, mulberry32, range } from '../../lib/forest/generate';

/** Where the fallen crown lands (the tree falls toward -x). */
export const LANDING = { x: HERO.x - HERO.h * 0.62, y: HERO.y - 6 };

export type Leaf = { d: string; half: number; x0: number; y0: number; x1: number; y1: number; sway: number; r0: number; r1: number; delay: number; dur: number };
export type Chip = { d: string; x0: number; y0: number; x1: number; y1: number; lift: number; r1: number; dur: number };
export type Puff = { x: number; y: number; r: number; delay: number };

const rng = mulberry32(2718);

/**
 * Leaves shaken loose by the fall. Delays and durations are seconds from the start of the
 * hush sequence, so they sit inside the existing FALL timing: some go as the tree starts to
 * move, the rest as the crown lands. Each ends on the ground (the settled state).
 */
export const LEAVES: Leaf[] = Array.from({ length: 34 }, (_, i) => {
  const late = i >= 22;
  const len = range(rng, 11, 21);
  const x0 = late ? LANDING.x + range(rng, -150, 150) : HERO.x + range(rng, -190, 190);
  const y0 = late ? LANDING.y - range(rng, 40, 120) : HERO.y - HERO.h + 70 + range(rng, 0, 190);
  return {
    d: leafPath(len, len * 0.3),
    half: len / 2,
    x0,
    y0,
    x1: late ? x0 + range(rng, -120, 120) : x0 + range(rng, -260, 90),
    y1: HERO.y + range(rng, -4, 64),
    sway: range(rng, -70, 70),
    r0: range(rng, -60, 60),
    r1: range(rng, -300, 300),
    delay: late ? range(rng, 0, 1.2) : range(rng, 0, 1.6),
    dur: range(rng, 2.2, 3.4),
  };
});

/** Bark and branch fragments thrown out where the crown lands. */
export const CHIPS: Chip[] = Array.from({ length: 16 }, () => {
  const len = range(rng, 8, 24);
  const x0 = LANDING.x + range(rng, -70, 70);
  const dx = range(rng, -230, 190);
  return {
    d: `M0,0L${len.toFixed(1)},${range(rng, -3, 2).toFixed(1)}L${(len * 0.9).toFixed(1)},${range(rng, 2, 5).toFixed(1)}L0,3Z`,
    x0,
    y0: LANDING.y - range(rng, 10, 50),
    x1: x0 + dx,
    y1: HERO.y + range(rng, 2, 58),
    lift: range(rng, 60, 170),
    r1: range(rng, -200, 200),
    dur: range(rng, 0.9, 1.5),
  };
});

/** Slow dust that rises from the ground where the crown lands. */
export const PUFFS: Puff[] = Array.from({ length: 6 }, (_, i) => ({
  x: LANDING.x + (i - 2.5) * 70 + range(rng, -20, 20),
  y: LANDING.y + range(rng, -6, 12),
  r: range(rng, 34, 62),
  delay: i * 0.08,
}));
