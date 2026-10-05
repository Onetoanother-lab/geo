import { useEffect, useMemo, useState } from 'react';
import { box, frame, loadCountries, makeProjection, MAP_H, MAP_W, pathFor, type CountryFeature } from './world';

/** A camera view: zoom `k` centred on the map point (`cx`, `cy`). */
export type MapView = { k: number; cx: number; cy: number };

export const WORLD_VIEW: MapView = { k: 1, cx: MAP_W / 2, cy: MAP_H / 2 };

/** Zooms toward the target's centre: the scale changes evenly and the focus never swings away. */
export function viewBetween(a: MapView, b: MapView, t: number): MapView {
  const k = a.k * Math.pow(b.k / a.k, t);
  const w = a.k === b.k ? t : (1 / a.k - 1 / k) / (1 / a.k - 1 / b.k);
  return { k, cx: a.cx + (b.cx - a.cx) * w, cy: a.cy + (b.cy - a.cy) * w };
}

export function viewTransform({ k, cx, cy }: MapView): string {
  return `translate(${(MAP_W / 2 - k * cx).toFixed(2)},${(MAP_H / 2 - k * cy).toFixed(2)}) scale(${k.toFixed(4)})`;
}

/** All outlines come from the already bundled Natural Earth topology. */
export function useLocalGeography() {
  const [countries, setCountries] = useState<CountryFeature[]>([]);
  useEffect(() => {
    let alive = true;
    void loadCountries().then((all) => { if (alive) setCountries(all); });
    return () => { alive = false; };
  }, []);
  return useMemo(() => {
    if (!countries.length) return null;
    const path = pathFor(makeProjection());
    const central = countries.filter((c) => ['398', '860', '795', '762', '417'].includes(String(c.id)));
    const uz = countries.find((c) => String(c.id) === '860');
    const view = (bounds: [[number, number], [number, number]], max: number): MapView => {
      const { tx, ty, k } = frame(bounds, max);
      return { k, cx: (MAP_W / 2 - tx) / k, cy: (MAP_H / 2 - ty) / k };
    };
    return {
      world: countries.map((c) => path(c) ?? '').join(''),
      central: central.map((c) => path(c) ?? '').join(''),
      uz: uz ? path(uz) ?? '' : '',
      centralView: view(path.bounds(box(46, 33, 88, 56)), 4),
      uzView: view(path.bounds(box(53, 36, 74, 48)), 7),
    };
  }, [countries]);
}
