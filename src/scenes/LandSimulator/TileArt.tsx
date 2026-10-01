import { memo } from 'react';
import type { Tile } from '../../lib/simulator/model';
import { MATURE_AGE } from '../../lib/simulator/model';
import { mulberry32, range } from '../../lib/forest/generate';

const canopy = (seed: number, n: number, rMin: number, rMax: number, fill: string) => {
  const rng = mulberry32(seed);
  return Array.from({ length: n }, (_, i) => <circle key={i} cx={range(rng, 14, 86)} cy={range(rng, 14, 86)} r={range(rng, rMin, rMax)} fill={fill} />);
};

/** Top-down art for one simulator tile (100×100 local units). */
export const TileArt = memo(function TileArt({ tile, index }: { tile: Tile; index: number }) {
  const seed = index * 97 + 13;
  switch (tile.type) {
    case 'forest':
    case 'protected':
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <rect width="100" height="100" fill="#13291f" />
          {canopy(seed, 9, 13, 22, '#24452f')}
          {canopy(seed + 1, 6, 8, 14, '#35603a')}
          {tile.type === 'protected' && <rect x="5" y="5" width="90" height="90" fill="none" stroke="#e9c77b" strokeWidth="3" strokeDasharray="6 6" />}
        </svg>
      );
    case 'young': {
      const g = Math.min(1, tile.age / MATURE_AGE);
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <rect width="100" height="100" fill="#5a4a33" />
          {canopy(seed, 10, 3 + g * 10, 5 + g * 14, '#4f7a3f')}
        </svg>
      );
    }
    case 'farm':
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <rect width="100" height="100" fill="#a58a4f" />
          {Array.from({ length: 7 }, (_, i) => (
            <rect key={i} x="0" y={6 + i * 14} width="100" height="6" fill="#8a7240" />
          ))}
        </svg>
      );
    case 'agroforest':
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <rect width="100" height="100" fill="#8d8a4c" />
          {Array.from({ length: 7 }, (_, i) => (
            <rect key={i} x="0" y={6 + i * 14} width="100" height="5" fill="#77753f" />
          ))}
          {[20, 50, 80].map((x) => (
            <circle key={x} cx={x} cy={x === 50 ? 30 : 68} r="12" fill="#35603a" />
          ))}
        </svg>
      );
    case 'pasture':
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <rect width="100" height="100" fill="#8f9363" />
          {canopy(seed, 10, 1.5, 2.5, '#e8e2d4')}
        </svg>
      );
    case 'bare':
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <rect width="100" height="100" fill="#7a5a3a" />
          <path d="M10,30L35,42L52,30L80,46M30,70L48,58L70,74L92,62M48,58L52,30" stroke="#5b3f2a" strokeWidth="2.5" fill="none" />
        </svg>
      );
    case 'water':
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <rect width="100" height="100" fill="#2f6670" />
          <path d="M10,35Q25,28 40,35T70,35M30,65Q45,58 60,65T90,65" stroke="#7fb4c0" strokeWidth="2.5" fill="none" opacity="0.7" />
        </svg>
      );
    case 'village':
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <rect width="100" height="100" fill="#8f7d62" />
          <rect x="18" y="22" width="26" height="22" fill="#e6d6b8" />
          <rect x="56" y="54" width="28" height="22" fill="#e6d6b8" />
          <rect x="22" y="62" width="20" height="16" fill="#d9c7a2" />
          <path d="M14,24L31,10L48,24ZM52,56L70,42L88,56Z" fill="#9c5a3a" />
        </svg>
      );
  }
});
