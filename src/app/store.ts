import { useSyncExternalStore } from 'react';
import type { ChapterId } from './chapters';
import type { IllustrativeResult } from '../lib/cinema/ecology';

export type MotionPreference = 'system' | 'reduced' | 'full';

export type AppState = {
  /** The audience passed the entry gate. */
  entered: boolean;
  /** Ambient audio is enabled (only possible after a user gesture). */
  soundOn: boolean;
  motionPreference: MotionPreference;
  systemReducedMotion: boolean;
  chapterId: ChapterId;
  /** 0..1 across the whole document. */
  progress: number;
  sourcesOpen: boolean;
  navOpen: boolean;
  cinemaMode: boolean;
  chapterProgress: number;
  currentBeat: string;
  presentationStartedAt: number | null;
  simulatorResult: IllustrativeResult | null;
  futureBalance: number;
};

type Listener = () => void;

const initialSystemReduced =
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

export const initialState: AppState = {
  entered: false,
  soundOn: false,
  motionPreference: 'system',
  systemReducedMotion: initialSystemReduced,
  chapterId: 'intro',
  progress: 0,
  sourcesOpen: false,
  navOpen: false,
  cinemaMode: true,
  chapterProgress: 0,
  currentBeat: '',
  presentationStartedAt: null,
  simulatorResult: null,
  futureBalance: 0.62,
};

let state: AppState = initialState;
const listeners = new Set<Listener>();

export function getState(): AppState {
  return state;
}

export function setState(patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)): void {
  const next = typeof patch === 'function' ? patch(state) : patch;
  let changed = false;
  for (const key of Object.keys(next) as (keyof AppState)[]) {
    if (state[key] !== next[key]) {
      changed = true;
      break;
    }
  }
  if (!changed) return;
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Test helper. */
export function resetState(patch: Partial<AppState> = {}): void {
  state = { ...initialState, ...patch };
  listeners.forEach((l) => l());
}

export function useStore<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(initialState),
  );
}

export function isReducedMotion(s: AppState = state): boolean {
  if (s.motionPreference === 'reduced') return true;
  if (s.motionPreference === 'full') return false;
  return s.systemReducedMotion;
}

export const useReducedMotion = (): boolean => useStore(isReducedMotion);

/** Cycles system → reduced → full → system. */
export function cycleMotionPreference(): void {
  const order: MotionPreference[] = ['system', 'reduced', 'full'];
  const i = order.indexOf(state.motionPreference);
  setState({ motionPreference: order[(i + 1) % order.length] });
}

/** Close the top-most overlay. Returns true if something was closed. */
export function closeTopOverlay(): boolean {
  if (state.sourcesOpen) {
    setState({ sourcesOpen: false });
    return true;
  }
  if (state.navOpen) {
    setState({ navOpen: false });
    return true;
  }
  return false;
}
