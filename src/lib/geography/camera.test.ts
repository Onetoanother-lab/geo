import { describe, expect, it } from 'vitest';
import { viewBetween, WORLD_VIEW } from './useLocalGeography';

describe('map camera', () => {
  const target = { k: 4, cx: 640, cy: 150 };

  it('starts and ends exactly on its views', () => {
    expect(viewBetween(WORLD_VIEW, target, 0)).toEqual(WORLD_VIEW);
    const end = viewBetween(WORLD_VIEW, target, 1);
    expect(end.k).toBeCloseTo(4);
    expect(end.cx).toBeCloseTo(640);
    expect(end.cy).toBeCloseTo(150);
  });

  it('keeps the target on screen and moves toward it while zooming in', () => {
    let previous = viewBetween(WORLD_VIEW, target, 0);
    for (let t = 0.1; t <= 1.0001; t += 0.1) {
      const v = viewBetween(WORLD_VIEW, target, t);
      expect(v.k).toBeGreaterThan(previous.k);
      // Half the visible map width at this zoom; the target never leaves it.
      expect(Math.abs(target.cx - v.cx)).toBeLessThanOrEqual(500 / v.k + 1e-6);
      expect(Math.abs(target.cx - v.cx)).toBeLessThanOrEqual(Math.abs(target.cx - previous.cx) + 1e-6);
      previous = v;
    }
  });
});
