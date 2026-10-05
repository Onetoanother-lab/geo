import { createInitialState, indicators, type SimState } from './model';
import type { IllustrativeResult } from '../cinema/ecology';

const KEY = 'ormon:simulator:v2';
const TYPES = new Set(['forest', 'protected', 'managed', 'young', 'farm', 'agroforest', 'pasture', 'bare', 'water', 'village']);

export function resultOf(state: SimState): IllustrativeResult {
  const i = indicators(state);
  return { forestHealth: (i.forest + i.biodiversity + i.soil + i.water + i.carbon) / 5, biodiversity: i.biodiversity, soil: i.soil, water: i.water, carbon: i.carbon, humanBenefit: i.benefit };
}

export function loadSimulator(): SimState {
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(KEY) ?? 'null');
    if (!value || typeof value !== 'object') return createInitialState();
    const s = value as SimState;
    if (s.cols !== 10 || s.rows !== 7 || !Array.isArray(s.tiles) || s.tiles.length !== 70) return createInitialState();
    if (!s.tiles.every((t) => t && TYPES.has(t.type) && Number.isFinite(t.age) && t.age >= 0 && (t.origin === undefined || t.origin === 'regrowth'))) return createInitialState();
    if (![s.year, s.demand, s.humanBenefit].every(Number.isFinite) || s.year < 0 || s.demand <= 0 || s.demand > 14 || s.humanBenefit < 0 || s.humanBenefit > 1) return createInitialState();
    return { ...s, events: [] };
  } catch { return createInitialState(); }
}

export function saveSimulator(state: SimState): void {
  try { sessionStorage.setItem(KEY, JSON.stringify({ ...state, events: [] })); } catch { /* Memory still works when browser storage is unavailable. */ }
}
