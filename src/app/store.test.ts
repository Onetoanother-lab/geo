import { afterEach, describe, expect, it } from 'vitest';
import { closeTopOverlay, cycleMotionPreference, getState, isReducedMotion, resetState, setState } from './store';

afterEach(() => resetState());

describe('global store', () => {
  it('derives reduced motion from the OS unless overridden', () => {
    resetState({ systemReducedMotion: true });
    expect(isReducedMotion()).toBe(true);
    setState({ motionPreference: 'full' });
    expect(isReducedMotion()).toBe(false);
    setState({ motionPreference: 'reduced', systemReducedMotion: false });
    expect(isReducedMotion()).toBe(true);
  });

  it('cycles motion preference system → reduced → full → system', () => {
    cycleMotionPreference();
    expect(getState().motionPreference).toBe('reduced');
    cycleMotionPreference();
    expect(getState().motionPreference).toBe('full');
    cycleMotionPreference();
    expect(getState().motionPreference).toBe('system');
  });

  it('closes the top-most overlay first and reports when nothing was open', () => {
    setState({ sourcesOpen: true, navOpen: true });
    expect(closeTopOverlay()).toBe(true);
    expect(getState().sourcesOpen).toBe(false);
    expect(getState().navOpen).toBe(true);
    expect(closeTopOverlay()).toBe(true);
    expect(closeTopOverlay()).toBe(false);
  });
});
