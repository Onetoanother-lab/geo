import { describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { LandSimulator } from './LandSimulator';
import { NARRATIVE } from '../../content/narrative';

const T = NARRATIVE.simulator;

describe('LandSimulator', () => {
  it('applies the chosen tool to a tile and explains the consequence', async () => {
    render(<LandSimulator />);
    await act(async () => {
      fireEvent.click(screen.getByRole('radio', { name: T.tools.clear.label }));
    });
    const firstCell = screen.getAllByRole('gridcell')[0].querySelector('button')!;
    expect(firstCell).toHaveAttribute('data-type', 'forest');
    await act(async () => {
      fireEvent.click(firstCell);
    });
    expect(firstCell).toHaveAttribute('data-type', 'bare');
    expect(screen.getByText(T.messages.cleared)).toBeInTheDocument();
  });

  it('advances time and resets', async () => {
    render(<LandSimulator />);
    const advance = screen.getByRole('button', { name: new RegExp(T.advance) });
    await act(async () => {
      fireEvent.click(advance);
    });
    expect(screen.getByText('+5')).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: T.reset }));
    });
    expect(screen.getByText('+0')).toBeInTheDocument();
  });

  it('moves focus through the grid with arrow keys', async () => {
    render(<LandSimulator />);
    const cells = screen.getAllByRole('gridcell').map((c) => c.querySelector('button')!);
    cells[0].focus();
    await act(async () => {
      fireEvent.keyDown(cells[0], { key: 'ArrowRight' });
    });
    expect(document.activeElement).toBe(cells[1]);
    await act(async () => {
      fireEvent.keyDown(cells[1], { key: 'ArrowDown' });
    });
    expect(document.activeElement).toBe(cells[11]);
  });

  it('always shows the model disclaimer', () => {
    render(<LandSimulator />);
    expect(screen.getByText(T.disclaimer)).toBeInTheDocument();
  });
});
