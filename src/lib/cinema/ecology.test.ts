import { describe, expect, it } from 'vitest';
import { CHAPTER_IDS } from '../../app/chapters';
import { SCORE } from '../../content/cinematic';
import { FALL } from '../animation/motion';
import { richness, sceneHealth, sceneSaturation } from './ecology';
import { initialState } from '../../app/store';
import { createInitialState, applyTool, advance, indicators, MATURE_AGE, YEARS_PER_TURN } from '../simulator/model';
import { loadSimulator, resultOf, saveSimulator } from '../simulator/memory';

describe('cinematic ecology', () => {
  it('removes life layers at severe degradation while retaining exposed wind', () => {
    const dead = richness(0);
    expect(dead.birds + dead.insects + dead.water + dead.leaves + dead.pulse + dead.shade).toBe(0);
    expect(dead.wind).toBeGreaterThan(richness(1).wind);
    expect(richness(.4).birds).toBeLessThan(richness(.4).leaves);
  });
  it('holds the tree-fall statement for a measured interval after impact', () => {
    expect(FALL.firstLine - FALL.impact).toBeGreaterThanOrEqual(1.5);
    expect(FALL.firstLine - FALL.impact).toBeLessThanOrEqual(2);
    expect(FALL.secondCreak).toBeGreaterThan(FALL.creak + 1);
  });
  it('keeps every directed scene in range and preserves distinct density and quiet', () => {
    for (const id of CHAPTER_IDS) {
      expect(SCORE[id].focalPoint.length).toBeGreaterThan(20);
      for (const p of [0, .4, 1]) {
        expect(sceneHealth(id, p, null, .5)).toBeGreaterThanOrEqual(0);
        expect(sceneHealth(id, p, null, .5)).toBeLessThanOrEqual(1);
      }
    }
    expect(sceneHealth('aral', .4, null, .5)).toBe(0);
    expect(sceneHealth('recovery', .3, null, .5)).toBeLessThan(sceneHealth('recovery', .9, null, .5));
  });
  it('returns the finale close to the opening light unless the audience leans toward loss', () => {
    const opening = sceneSaturation('intro', 0, sceneHealth('intro', 0, null, .62));
    const finale = sceneHealth('finale', 1, null, initialState.futureBalance);
    expect(finale).toBeGreaterThan(.65);
    expect(sceneHealth('finale', 1, null, 1)).toBeGreaterThan(.9);
    expect(sceneHealth('finale', 1, null, 0)).toBeLessThan(.4);
    // Saturation follows the remembered comparison, not scroll position.
    expect(sceneSaturation('finale', 0, .95)).toBeGreaterThan(opening - .1);
    expect(sceneSaturation('finale', 0, .3)).toBe(sceneSaturation('finale', 1, .3));
    expect(sceneSaturation('finale', 0, .3)).toBeLessThan(sceneSaturation('finale', 0, .9));
  });
  it('remembers audience choices without predetermining the finale', () => {
    let s = createInitialState();
    const before = resultOf(s);
    for (let i = 0; i < 12; i++) if (s.tiles[i].type === 'forest') s = applyTool(s, i, 'clear');
    const after = resultOf(s);
    expect(sceneHealth('finale', 1, after, .5)).toBeLessThan(sceneHealth('finale', 1, before, .5));
    expect(sceneHealth('finale', 1, after, 1)).toBeGreaterThan(sceneHealth('finale', 1, before, 0));
  });
});

describe('nuanced choices and session memory', () => {
  it('selective forestry trades structural richness for livelihood, with canopy remaining', () => {
    const s = createInitialState();
    const next = applyTool(s, 0, 'manage');
    expect(indicators(next).benefit).toBeGreaterThan(indicators(s).benefit);
    expect(indicators(next).biodiversity).toBeLessThan(indicators(s).biodiversity);
    expect(indicators(next).carbon).toBeGreaterThan(indicators(applyTool(s, 0, 'clear')).carbon);
  });
  it('infrastructure increases demand and cannot replace protected forest', () => {
    const s = createInitialState();
    const settled = applyTool(s, 4, 'settle');
    expect(settled.demand).toBeGreaterThan(s.demand);
    expect(indicators(settled).water).toBeLessThan(indicators(s).water);
    expect(applyTool(applyTool(s, 0, 'protect'), 0, 'settle').tiles[0].type).toBe('protected');
  });
  it('regrown cover is not equated with intact mature forest at the growth threshold', () => {
    let s = createInitialState();
    const b = s.tiles.findIndex((t) => t.type === 'bare');
    s = applyTool(s, b, 'restore');
    for (let i = 0; i < MATURE_AGE / YEARS_PER_TURN; i++) s = advance(s);
    const intact = { ...s, tiles: s.tiles.map((t, i) => i === b ? { type: 'forest' as const, age: MATURE_AGE } : t) };
    expect(s.tiles[b].origin).toBe('regrowth');
    expect(indicators(s).biodiversity).toBeLessThan(indicators(intact).biodiversity);
    expect(indicators(s).carbon).toBeLessThan(indicators(intact).carbon);
  });
  it('restores choices and safely rejects malformed stored data', () => {
    const s = applyTool(createInitialState(), 0, 'manage');
    saveSimulator(s);
    expect(loadSimulator().tiles[0].type).toBe('managed');
    sessionStorage.setItem('ormon:simulator:v2', '{"tiles":[null]}');
    expect(loadSimulator()).toEqual(createInitialState());
    saveSimulator(createInitialState());
    expect(loadSimulator()).toEqual(createInitialState());
    sessionStorage.clear();
  });
});
