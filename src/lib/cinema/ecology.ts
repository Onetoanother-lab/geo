import type { ChapterId } from '../../app/chapters';
import { SCORE } from '../../content/cinematic';

export const clamp = (n: number) => Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));
export const ramp = (a: number, b: number, n: number) => {
  const t = clamp((n - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Illustrative state only. Never used as measured data or a forecast. */
export type IllustrativeResult = {
  forestHealth: number;
  biodiversity: number;
  soil: number;
  water: number;
  carbon: number;
  humanBenefit: number;
};

export function sceneHealth(chapter: ChapterId, progress: number, result: IllustrativeResult | null, balance: number): number {
  const p = clamp(progress);
  if (chapter === 'cut') return 1 - ramp(0.1, 0.88, p);
  if (chapter === 'aral') return ramp(0.62, 0.96, p) * 0.28;
  if (chapter === 'recovery') return 0.12 + ramp(0.12, 0.96, p) * 0.7;
  if (chapter === 'simulator') return result?.forestHealth ?? 0.65;
  // The audience's result influences the start subtly; it does not decide the future.
  const memory = result ? (result.forestHealth - 0.5) * 0.2 : 0;
  if (chapter === 'futures') return clamp(0.15 + balance * 0.73 + memory);
  // The return leans toward the opening; only a clear lean toward loss drains it.
  if (chapter === 'finale') return clamp(0.3 + balance * 0.65 + memory);
  const [a, b] = SCORE[chapter].health;
  return a + (b - a) * p;
}

/** Saturation follows the story, except where it must follow the audience's comparison. */
export function sceneSaturation(chapter: ChapterId, progress: number, health: number): number {
  const [a, b] = SCORE[chapter].saturation;
  if (chapter === 'finale') return a + (b - a) * clamp(health);
  return a + (b - a) * clamp(progress);
}

export function richness(health: number) {
  const h = clamp(health);
  return {
    birds: ramp(0.35, 0.9, h), insects: ramp(0.25, 0.8, h),
    water: ramp(0.12, 0.85, h), leaves: ramp(0.08, 0.9, h),
    pulse: ramp(0.2, 0.95, h), shade: ramp(0.05, 0.9, h),
    wind: 0.16 + (1 - h) * 0.66,
  };
}
