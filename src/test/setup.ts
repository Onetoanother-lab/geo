import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// jsdom lacks these browser APIs; provide inert versions.
if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: Boolean((window as unknown as { __reducedMotion?: boolean }).__reducedMotion) && query.includes('reduce'),
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
}

class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IntersectionObserver ??= NoopObserver;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).ResizeObserver ??= NoopObserver;
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as unknown as HTMLCanvasElement['getContext'];
Element.prototype.scrollIntoView = vi.fn();

// SVG geometry used by GSAP plugins (DrawSVG / transformOrigin).
const proto = (window.SVGElement ?? window.Element).prototype as unknown as Record<string, unknown>;
proto.getTotalLength ??= () => 100;
proto.getPointAtLength ??= () => ({ x: 0, y: 0 });
proto.getBBox ??= () => ({ x: 0, y: 0, width: 100, height: 100 });
proto.getCTM ??= () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 });
proto.getScreenCTM ??= () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 });
if (!('transform' in proto)) {
  Object.defineProperty(proto, 'transform', {
    configurable: true,
    get: () => ({
      baseVal: {
        numberOfItems: 0,
        consolidate: () => ({ matrix: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 } }),
        appendItem: () => undefined,
        clear: () => undefined,
      },
    }),
  });
}
