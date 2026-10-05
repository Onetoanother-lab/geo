import { describe, expect, it } from 'vitest';
import { gsap } from './gsap';
import { tweenLife } from './life';

describe('stepped --life', () => {
  it('follows the timeline in both directions but writes only visible steps', () => {
    const el = document.createElement('div');
    const writes: string[] = [];
    const set = el.style.setProperty.bind(el.style);
    el.style.setProperty = (name: string, value: string | null) => { writes.push(String(value)); set(name, value); };
    const tl = gsap.timeline({ paused: true });
    tweenLife(tl, el, 1, 0, 100, 0);
    expect(el.style.getPropertyValue('--life')).toBe('1.00');

    for (let t = 0; t <= 100; t += 0.25) tl.progress(t / 100);
    expect(el.style.getPropertyValue('--life')).toBe('0.00');
    // 401 rendered frames, but only one write per 0.02 step (plus the start value).
    expect(writes.length).toBeLessThanOrEqual(52);

    tl.progress(0.5);
    expect(el.style.getPropertyValue('--life')).toBe('0.50');
    tl.progress(0);
    expect(el.style.getPropertyValue('--life')).toBe('1.00');
  });
});
