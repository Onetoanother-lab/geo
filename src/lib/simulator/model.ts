/**
 * Land-use simulator — a deliberately simple, transparent rule system.
 * NOT a scientific model: every rule is listed on screen (SIM_RULES in
 * narrative.ts mirrors the constants below).
 */

export type TileType = 'forest' | 'protected' | 'young' | 'farm' | 'agroforest' | 'pasture' | 'bare' | 'water' | 'village';
export type Tool = 'protect' | 'clear' | 'farm' | 'restore' | 'improve';

export type Tile = { type: TileType; age: number };

export type SimState = {
  cols: number;
  rows: number;
  tiles: Tile[];
  year: number;
  /** Food demand in "farm tile equivalents". */
  demand: number;
  /** Message keys describing the last change (rendered by the UI). */
  events: SimEvent[];
};

export type SimEvent =
  | { kind: 'cleared'; nearWater: boolean }
  | { kind: 'protected' }
  | { kind: 'farmed' }
  | { kind: 'restored' }
  | { kind: 'improved' }
  | { kind: 'invalid'; reason: 'protected' | 'type' }
  | { kind: 'years'; years: number }
  | { kind: 'grown'; count: number }
  | { kind: 'demand' }
  | { kind: 'pressure'; count: number }
  | { kind: 'deficit' };

export const YEARS_PER_TURN = 5;
export const MATURE_AGE = 25;
export const DEMAND_GROWTH = 0.5;
export const DEMAND_MAX = 14;

export const YIELD: Partial<Record<TileType, number>> = { farm: 1, agroforest: 0.65, pasture: 0.45 };

/** Allowed transitions per tool. */
export const TRANSITIONS: Record<Tool, Partial<Record<TileType, TileType>>> = {
  protect: { forest: 'protected' },
  clear: { forest: 'bare', young: 'bare', agroforest: 'bare' },
  farm: { bare: 'farm', pasture: 'farm' },
  restore: { bare: 'young', pasture: 'young', farm: 'young' },
  improve: { farm: 'agroforest', pasture: 'agroforest' },
};

// 10 × 7 starting landscape. f forest, w water, v village, a farm, p pasture, b bare.
const START = [
  'fffffwffff',
  'fffffwffff',
  'fpaafwffff',
  'fpvaawwfff',
  'ffvaabwfff',
  'ffffaawfff',
  'fffffwwfff',
];

const CODE: Record<string, TileType> = { f: 'forest', w: 'water', v: 'village', a: 'farm', p: 'pasture', b: 'bare' };

export function createInitialState(): SimState {
  const tiles = START.join('')
    .split('')
    .map((c) => ({ type: CODE[c], age: c === 'f' ? MATURE_AGE : 0 }));
  return { cols: 10, rows: 7, tiles, year: 0, demand: 7, events: [] };
}

export function neighbors(s: Pick<SimState, 'cols' | 'rows'>, i: number): number[] {
  const x = i % s.cols;
  const y = Math.floor(i / s.cols);
  const out: number[] = [];
  if (x > 0) out.push(i - 1);
  if (x < s.cols - 1) out.push(i + 1);
  if (y > 0) out.push(i - s.cols);
  if (y < s.rows - 1) out.push(i + s.cols);
  return out;
}

const isForestLike = (t: TileType) => t === 'forest' || t === 'protected';

export function applyTool(state: SimState, index: number, tool: Tool): SimState {
  const tile = state.tiles[index];
  if (!tile) return state;
  if (tool === 'clear' && tile.type === 'protected') return { ...state, events: [{ kind: 'invalid', reason: 'protected' }] };
  const next = TRANSITIONS[tool][tile.type];
  if (!next) return { ...state, events: [{ kind: 'invalid', reason: 'type' }] };
  const tiles = state.tiles.slice();
  tiles[index] = { type: next, age: next === 'protected' ? tile.age : 0 };
  const nearWater = neighbors(state, index).some((n) => state.tiles[n].type === 'water');
  const event: SimEvent =
    tool === 'clear'
      ? { kind: 'cleared', nearWater }
      : tool === 'protect'
        ? { kind: 'protected' }
        : tool === 'farm'
          ? { kind: 'farmed' }
          : tool === 'restore'
            ? { kind: 'restored' }
            : { kind: 'improved' };
  return { ...state, tiles, events: [event] };
}

export function foodSupply(state: SimState): number {
  return state.tiles.reduce((sum, t) => sum + (YIELD[t.type] ?? 0), 0);
}

/** Advances time: young forests grow, demand rises, unmet demand pushes clearing of unprotected forest edges. */
export function advance(state: SimState): SimState {
  const events: SimEvent[] = [{ kind: 'years', years: YEARS_PER_TURN }];
  let grown = 0;
  let tiles = state.tiles.map((t) => {
    if (t.type !== 'young') return t;
    const age = t.age + YEARS_PER_TURN;
    if (age >= MATURE_AGE) {
      grown++;
      return { type: 'forest' as const, age };
    }
    return { ...t, age };
  });
  if (grown) events.push({ kind: 'grown', count: grown });

  const demand = Math.min(DEMAND_MAX, state.demand + DEMAND_GROWTH);
  if (demand > state.demand) events.push({ kind: 'demand' });

  const deficit = demand - foodSupply({ ...state, tiles });
  if (deficit >= 1) {
    // Pressure: the unprotected forest tiles next to farms/villages are converted (at most 2 per turn).
    const candidates = tiles
      .map((t, i) => ({ t, i }))
      .filter(({ t, i }) => t.type === 'forest' && neighbors(state, i).some((n) => ['farm', 'village', 'pasture'].includes(tiles[n].type)));
    const count = Math.min(2, Math.floor(deficit), candidates.length);
    if (count > 0) {
      tiles = tiles.slice();
      candidates.slice(0, count).forEach(({ i }) => (tiles[i] = { type: 'farm', age: 0 }));
      events.push({ kind: 'pressure', count });
    } else events.push({ kind: 'deficit' });
  }
  return { ...state, tiles, demand, year: state.year + YEARS_PER_TURN, events };
}

export type Indicators = { forest: number; biodiversity: number; soil: number; water: number; carbon: number; food: number };

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export function indicators(state: SimState): Indicators {
  const land = state.tiles.filter((t) => t.type !== 'water' && t.type !== 'village').length || 1;
  let forest = 0;
  let bio = 0;
  let soilLoss = 0;
  let carbon = 0;
  state.tiles.forEach((t, i) => {
    const growth = t.type === 'young' ? Math.min(1, t.age / MATURE_AGE) : 0;
    if (isForestLike(t.type)) forest += 1;
    if (t.type === 'young') forest += 0.15 + 0.35 * growth;
    if (t.type === 'agroforest') forest += 0.3;

    if (isForestLike(t.type) || t.type === 'young' || t.type === 'agroforest') {
      const n = neighbors(state, i).filter((k) => isForestLike(state.tiles[k].type) || state.tiles[k].type === 'young').length;
      const weight = t.type === 'protected' ? 1.15 : t.type === 'forest' ? 1 : t.type === 'young' ? 0.2 + 0.4 * growth : 0.25;
      // Connected forest supports more life than isolated fragments.
      bio += weight * (0.4 + 0.6 * (n / 4));
    }
    soilLoss += { bare: 1, farm: 0.45, pasture: 0.35, agroforest: 0.12, young: 0.15 * (1 - growth) }[t.type as string] ?? 0;
    carbon += { forest: 1, protected: 1, young: 0.1 + 0.6 * growth, agroforest: 0.4, farm: 0.12, pasture: 0.18, bare: 0.04 }[t.type as string] ?? 0;
  });

  // Water: what borders the river matters most.
  let edges = 0;
  let waterScore = 0;
  state.tiles.forEach((t, i) => {
    if (t.type !== 'water') return;
    for (const n of neighbors(state, i)) {
      const nt = state.tiles[n].type;
      if (nt === 'water') continue;
      edges++;
      waterScore += { forest: 1, protected: 1, young: 0.75, agroforest: 0.75, pasture: 0.4, village: 0.35, farm: 0.3, bare: 0 }[nt] ?? 0.5;
    }
  });

  return {
    forest: clamp01(forest / land),
    biodiversity: clamp01(bio / land),
    soil: clamp01(1 - (soilLoss / land) * 1.5),
    water: clamp01(edges ? waterScore / edges : 1),
    carbon: clamp01(carbon / land),
    food: clamp01(foodSupply(state) / state.demand),
  };
}

/** Index of a tile from grid coordinates (for keyboard navigation). */
export const indexOf = (s: Pick<SimState, 'cols'>, x: number, y: number) => y * s.cols + x;
