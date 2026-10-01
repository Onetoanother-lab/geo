import { describe, expect, it } from 'vitest';
import { advance, applyTool, createInitialState, indicators, MATURE_AGE, YEARS_PER_TURN, type SimState } from './model';
import { simReducer } from './reducer';

const firstOf = (s: SimState, type: string) => s.tiles.findIndex((t) => t.type === type);

describe('land-use simulator rules', () => {
  it('starts with a balanced landscape and indicators in range', () => {
    const s = createInitialState();
    expect(s.tiles).toHaveLength(s.cols * s.rows);
    const ind = indicators(s);
    for (const v of Object.values(ind)) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
    expect(ind.food).toBe(1);
  });

  it('clearing forest exposes land and lowers forest, biodiversity, carbon and soil', () => {
    const s = createInitialState();
    const before = indicators(s);
    const i = firstOf(s, 'forest');
    const next = applyTool(s, i, 'clear');
    expect(next.tiles[i].type).toBe('bare');
    expect(next.events[0].kind).toBe('cleared');
    const after = indicators(next);
    expect(after.forest).toBeLessThan(before.forest);
    expect(after.carbon).toBeLessThan(before.carbon);
    expect(after.soil).toBeLessThan(before.soil);
    expect(after.biodiversity).toBeLessThan(before.biodiversity);
  });

  it('protected forest cannot be cleared', () => {
    const s = createInitialState();
    const i = firstOf(s, 'forest');
    const protectedState = applyTool(s, i, 'protect');
    expect(protectedState.tiles[i].type).toBe('protected');
    const attempt = applyTool(protectedState, i, 'clear');
    expect(attempt.tiles[i].type).toBe('protected');
    expect(attempt.events[0]).toEqual({ kind: 'invalid', reason: 'protected' });
  });

  it('rejects actions that do not apply to a tile type', () => {
    const s = createInitialState();
    const w = firstOf(s, 'water');
    const next = applyTool(s, w, 'farm');
    expect(next.tiles).toBe(s.tiles);
    expect(next.events[0]).toEqual({ kind: 'invalid', reason: 'type' });
  });

  it('restored land needs time to become forest', () => {
    let s = createInitialState();
    const b = firstOf(s, 'bare');
    s = applyTool(s, b, 'restore');
    expect(s.tiles[b].type).toBe('young');
    const turns = MATURE_AGE / YEARS_PER_TURN;
    for (let t = 0; t < turns - 1; t++) s = advance(s);
    expect(s.tiles[b].type).toBe('young');
    s = advance(s);
    expect(s.tiles[b].type).toBe('forest');
    expect(s.year).toBe(MATURE_AGE);
  });

  it('farming raises food; agroforestry trades a little food for soil', () => {
    let s = createInitialState();
    // Raise demand so food is no longer capped.
    s = { ...s, demand: 12 };
    const b = firstOf(s, 'bare');
    const farmed = applyTool(s, b, 'farm');
    expect(indicators(farmed).food).toBeGreaterThan(indicators(s).food);
    const improved = applyTool(farmed, b, 'improve');
    expect(improved.tiles[b].type).toBe('agroforest');
    expect(indicators(improved).food).toBeLessThan(indicators(farmed).food);
    expect(indicators(improved).soil).toBeGreaterThan(indicators(farmed).soil);
  });

  it('growing demand without enough food pushes clearing of unprotected forest', () => {
    let s = { ...createInitialState(), demand: 13 };
    const forestBefore = s.tiles.filter((t) => t.type === 'forest').length;
    s = advance(s);
    expect(s.events.some((e) => e.kind === 'pressure')).toBe(true);
    expect(s.tiles.filter((t) => t.type === 'forest').length).toBeLessThan(forestBefore);
  });

  it('reducer resets to the initial landscape', () => {
    const s = simReducer(createInitialState(), { type: 'apply', index: 0, tool: 'clear' });
    expect(simReducer(s, { type: 'reset' })).toEqual(createInitialState());
  });
});
