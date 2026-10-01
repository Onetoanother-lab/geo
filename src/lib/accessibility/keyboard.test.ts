import { describe, expect, it } from 'vitest';
import { keyToAction } from './keyboard';

const ev = (key: string, target: Element = document.body, extra: Partial<KeyboardEvent> = {}) => ({
  key,
  target,
  shiftKey: false,
  ctrlKey: false,
  metaKey: false,
  altKey: false,
  defaultPrevented: false,
  ...extra,
});

describe('presentation keyboard map', () => {
  it('maps navigation keys', () => {
    expect(keyToAction(ev('ArrowDown'))).toBe('next');
    expect(keyToAction(ev('PageDown'))).toBe('next');
    expect(keyToAction(ev(' '))).toBe('next');
    expect(keyToAction(ev(' ', document.body, { shiftKey: true }))).toBe('prev');
    expect(keyToAction(ev('ArrowUp'))).toBe('prev');
    expect(keyToAction(ev('PageUp'))).toBe('prev');
    expect(keyToAction(ev('Home'))).toBe('home');
    expect(keyToAction(ev('End'))).toBe('end');
  });

  it('maps toggles', () => {
    expect(keyToAction(ev('m'))).toBe('mute');
    expect(keyToAction(ev('M'))).toBe('mute');
    expect(keyToAction(ev('f'))).toBe('fullscreen');
    expect(keyToAction(ev('p'))).toBe('presenter');
    expect(keyToAction(ev('s'))).toBe('sources');
  });

  it('Escape always maps, even inside controls', () => {
    const input = document.createElement('input');
    expect(keyToAction(ev('Escape', input))).toBe('escape');
  });

  it('leaves keys to inputs, sliders, the simulator grid and dialogs', () => {
    const input = document.createElement('input');
    expect(keyToAction(ev('ArrowDown', input))).toBeNull();
    expect(keyToAction(ev('m', input))).toBeNull();
    const grid = document.createElement('div');
    grid.setAttribute('role', 'grid');
    const cell = document.createElement('button');
    grid.appendChild(cell);
    expect(keyToAction(ev('ArrowDown', cell))).toBeNull();
    expect(keyToAction(ev('m', cell))).toBe('mute');
  });

  it('does not steal Space from buttons or modified shortcuts', () => {
    const btn = document.createElement('button');
    expect(keyToAction(ev(' ', btn))).toBeNull();
    expect(keyToAction(ev('f', document.body, { ctrlKey: true }))).toBeNull();
    expect(keyToAction(ev('ArrowDown', document.body, { defaultPrevented: true }))).toBeNull();
  });
});
