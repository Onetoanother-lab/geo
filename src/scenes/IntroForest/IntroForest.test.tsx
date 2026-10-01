import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { IntroForest } from './IntroForest';
import { LivingForest } from '../LivingForest/LivingForest';
import { NARRATIVE } from '../../content/narrative';

describe('critical scenes mount', () => {
  it('Act I renders its narration as real text', () => {
    const { getByText } = render(<IntroForest />);
    expect(getByText(NARRATIVE.intro.once)).toBeInTheDocument();
    expect(getByText(NARRATIVE.intro.system)).toBeInTheDocument();
  });

  it('Act II exposes every hotspot as a button', () => {
    const { getAllByRole } = render(<LivingForest />);
    const labels = Object.values(NARRATIVE.system.hotspots).map((h) => h.label);
    const buttons = getAllByRole('button').map((b) => b.textContent);
    for (const l of labels) expect(buttons.some((t) => t?.includes(l))).toBe(true);
  });
});
