import { describe, expect, it, beforeEach, vi } from 'vitest';
import { act, render, screen, fireEvent, within } from '@testing-library/react';
import { App } from './App';
import { getState, resetState } from './store';
import { NARRATIVE } from '../content/narrative';

// Heavy scenes are exercised in the Playwright smoke test (real browser);
// here each act is a lightweight labelled section so the shell can be tested fast.
vi.mock('../scenes/IntroForest/IntroForest', async () => ({ IntroForest: (await import('../test/stubScene')).stub('intro') }));
vi.mock('../scenes/LivingForest/LivingForest', async () => ({ LivingForest: (await import('../test/stubScene')).stub('system') }));
vi.mock('../scenes/DeforestationReveal/DeforestationReveal', async () => ({ DeforestationReveal: (await import('../test/stubScene')).stub('cut') }));
vi.mock('../scenes/Causes/Causes', async () => ({ Causes: (await import('../test/stubScene')).stub('causes') }));
vi.mock('../scenes/Consequences/Consequences', async () => ({ Consequences: (await import('../test/stubScene')).stub('consequences') }));
vi.mock('../scenes/WorldMap/WorldMap', async () => ({ WorldMap: (await import('../test/stubScene')).stub('world') }));
vi.mock('../scenes/CaseStudies/CaseStudies', async () => ({ CaseStudies: (await import('../test/stubScene')).stub('cases') }));
vi.mock('../scenes/Aral/Aral', async () => ({ Aral: (await import('../test/stubScene')).stub('aral') }));
vi.mock('../scenes/LandSimulator/LandSimulator', async () => ({ LandSimulator: (await import('../test/stubScene')).stub('simulator') }));
vi.mock('../scenes/RecoveryTimeline/RecoveryTimeline', async () => ({ RecoveryTimeline: (await import('../test/stubScene')).stub('recovery') }));
vi.mock('../scenes/FutureSplit/FutureSplit', async () => ({ FutureSplit: (await import('../test/stubScene')).stub('futures') }));
vi.mock('../scenes/Finale/Finale', async () => ({ Finale: (await import('../test/stubScene')).stub('finale') }));

beforeEach(() => {
  resetState();
  document.documentElement.dataset.motion = 'full';
});

describe('application', () => {
  it('boots behind the entry gate and enters on click', async () => {
    render(<App />);
    expect(screen.getByRole('button', { name: new RegExp(NARRATIVE.gate.enter) })).toBeInTheDocument();
    expect(document.body.dataset.locked).toBe('true');
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: NARRATIVE.gate.enterQuiet }));
    });
    expect(getState().entered).toBe(true);
    expect(getState().soundOn).toBe(false);
    expect(screen.getByRole('navigation', { name: 'Taqdimot boshqaruvi' })).toBeInTheDocument();
  });

  it('renders all twelve acts as labelled sections', () => {
    render(<App />);
    const sections = document.querySelectorAll('section[data-chapter]');
    expect(sections).toHaveLength(12);
    sections.forEach((s) => expect(s.getAttribute('aria-labelledby')).toBeTruthy());
  });

  it('toggles sound with the mute control and the M key', async () => {
    render(<App />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: NARRATIVE.gate.enterQuiet }));
    });
    const bar = screen.getByRole('navigation', { name: 'Taqdimot boshqaruvi' });
    const sound = within(bar).getByRole('button', { name: /Ovozsiz/ });
    expect(sound).toHaveAttribute('aria-pressed', 'false');
    await act(async () => {
      fireEvent.click(sound);
    });
    expect(getState().soundOn).toBe(true);
    await act(async () => {
      fireEvent.keyDown(window, { key: 'm' });
    });
    expect(getState().soundOn).toBe(false);
  });

  it('opens sources with S and closes with Escape', async () => {
    render(<App />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: NARRATIVE.gate.enterQuiet }));
    });
    await act(async () => {
      fireEvent.keyDown(window, { key: 's' });
    });
    expect(getState().sourcesOpen).toBe(true);
    await act(async () => {
      fireEvent.keyDown(window, { key: 'Escape' });
    });
    expect(getState().sourcesOpen).toBe(false);
  });

  it('ignores navigation keys before the audience enters', () => {
    render(<App />);
    fireEvent.keyDown(window, { key: 's' });
    expect(getState().sourcesOpen).toBe(false);
  });

  it('reflects reduced motion on the document', async () => {
    resetState({ systemReducedMotion: true });
    render(<App />);
    await act(async () => undefined);
    expect(document.documentElement.dataset.motion).toBe('reduced');
  });
});
