import { afterEach, describe, expect, it } from 'vitest';
import { allBeats, clearBeats, firstBeatOfChapter, nearestBeat, nextBeat, prevBeat, registerBeats } from './beats';

afterEach(clearBeats);

describe('beat registry', () => {
  it('sorts beats from all scenes and collapses near-duplicates', () => {
    registerBeats('b', 'system', () => [{ id: 'x', y: 1500 }]);
    registerBeats('a', 'intro', () => [
      { id: 'start', y: 0 },
      { id: 'mid', y: 600 },
      { id: 'dup', y: 604 },
    ]);
    expect(allBeats().map((b) => b.id)).toEqual(['start', 'mid', 'x']);
  });

  it('finds next / previous / nearest beats', () => {
    registerBeats('a', 'intro', () => [
      { id: 'a', y: 0 },
      { id: 'b', y: 900 },
      { id: 'c', y: 1800 },
    ]);
    expect(nextBeat(0)?.id).toBe('b');
    expect(nextBeat(905)?.id).toBe('c');
    expect(prevBeat(1800)?.id).toBe('b');
    expect(prevBeat(0)).toBeUndefined();
    expect(nearestBeat(1300)?.id).toBe('b');
    expect(firstBeatOfChapter('intro')?.id).toBe('a');
  });

  it('unregisters', () => {
    const off = registerBeats('a', 'intro', () => [{ id: 'a', y: 10 }]);
    off();
    expect(allBeats()).toHaveLength(0);
  });
});
