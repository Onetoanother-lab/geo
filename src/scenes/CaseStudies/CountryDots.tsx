import { useMemo } from 'react';
import { geoContains, geoMercator, geoPath } from 'd3-geo';
import type { CountryFeature } from '../../lib/geography/world';
import { mulberry32 } from '../../lib/forest/generate';

type Props = {
  feature: CountryFeature;
  width: number;
  height: number;
  /** Fraction of dots coloured as forest. */
  share: number;
  /** Fraction of the forest dots that are drawn as the secondary class (e.g. planted). */
  subShare?: number;
  spacing?: number;
  seed?: number;
  className?: string;
  label: string;
};

/**
 * Country silhouette filled with a dot lattice; a stable, seeded subset of dots
 * is coloured to show a share honestly (e.g. 14 of every 100 cells = 14%).
 */
export function CountryDots({ feature, width, height, share, subShare = 0, spacing = 9, seed = 3, className, label }: Props) {
  const geo = useMemo(() => {
    const projection = geoMercator().fitExtent(
      [
        [6, 6],
        [width - 6, height - 6],
      ],
      feature,
    );
    const path = geoPath(projection);
    const dots: { x: number; y: number; rank: number }[] = [];
    const rng = mulberry32(seed);
    for (let y = spacing / 2; y < height; y += spacing) {
      for (let x = spacing / 2 + ((y / spacing) % 2) * (spacing / 2); x < width; x += spacing) {
        const ll = projection.invert?.([x, y]);
        if (ll && geoContains(feature, ll)) dots.push({ x, y, rank: rng() });
      }
    }
    // Rank order decides which dots become forest first (stable as the share grows).
    const sorted = [...dots].sort((a, b) => a.rank - b.rank);
    sorted.forEach((d, i) => (d.rank = i / sorted.length));
    return { outline: path(feature) ?? '', dots };
  }, [feature, width, height, spacing, seed]);

  return (
    <svg className={`country-dots ${className ?? ''}`} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
      <path d={geo.outline} className="cd-outline" />
      {geo.dots.map((d, i) => {
        const forest = d.rank < share;
        const sub = forest && d.rank < share * subShare;
        return <circle key={i} cx={d.x} cy={d.y} r={spacing * 0.3} className="cd-dot" data-forest={forest} data-sub={sub} style={{ transitionDelay: `${(d.rank * 0.6).toFixed(2)}s` }} />;
      })}
    </svg>
  );
}
