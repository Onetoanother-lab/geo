import { memo } from 'react';
import { NARRATIVE } from '../../content/narrative';
import { polygonPoints, smoothClosed } from '../../lib/forest/generate';

/**
 * Schematic Aral Sea outlines (hand-drawn, NOT survey data) based on the
 * shoreline sequence shown by NASA Earth Observatory “World of Change”.
 * Labelled on screen as a schematic.
 */
const RAW = {
  north1960: 'M250,200L300,150L360,120L430,135L470,170L480,215L430,240L360,250L290,250Z',
  south1960:
    'M290,240L360,235L430,225L480,200L520,165L560,190L575,240L610,280L630,340L640,410L625,480L600,540L560,600L500,650L430,680L370,670L320,640L290,590L270,520L260,450L250,380L240,310L250,260Z',
  northNow: 'M285,175L330,145L390,148L425,178L395,210L330,212L295,200Z',
  southNow: 'M262,300L295,292L312,350L322,440L316,530L298,600L278,590L266,500L258,400Z',
};

export const SHAPES = Object.fromEntries(Object.entries(RAW).map(([k, d]) => [k, smoothClosed(polygonPoints(d))])) as Record<keyof typeof RAW, string>;

const T = NARRATIVE.aral;

export const AralMap = memo(function AralMap() {
  return (
    <svg className="ar-map" viewBox="80 40 680 760" preserveAspectRatio="xMidYMid meet" role="img" aria-label={`${T.mapNote} ${T.cause}`}>
      <defs>
        <linearGradient id="ar-water-g" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#7cc2c4" />
          <stop offset="0.55" stopColor="#3f8189" />
          <stop offset="1" stopColor="#1f4f5a" />
        </linearGradient>
        <radialGradient id="ar-land-g" cx="50%" cy="46%" r="70%">
          <stop offset="0" stopColor="#4a3b27" />
          <stop offset="0.7" stopColor="#2a2118" />
          <stop offset="1" stopColor="#15110c" />
        </radialGradient>
        <pattern id="ar-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#b98a4b" strokeWidth="1" opacity="0.35" />
        </pattern>
      </defs>
      <rect x="-2000" y="-2000" width="5000" height="5000" fill="url(#ar-land-g)" className="ar-land" />
      {/* Former seabed (appears as the water retreats) */}
      <path d={SHAPES.south1960} fill="url(#ar-hatch)" className="ar-seabed" />
      <path d={SHAPES.north1960} fill="url(#ar-hatch)" className="ar-seabed" />
      <path d={SHAPES.south1960} className="ar-ghost" />
      <path d={SHAPES.north1960} className="ar-ghost" />
      {/* Water */}
      <path d={SHAPES.south1960} className="ar-water ar-water--south" />
      <path d={SHAPES.north1960} className="ar-water ar-water--north" />
      {/* Rivers */}
      <path d="M720,60Q620,110 560,130T470,172" className="ar-river ar-river--syr" />
      <path d="M640,800Q600,740 560,720T500,652" className="ar-river ar-river--amu" />
      <text x="600" y="92" className="ar-map-label">{T.places.syr}</text>
      <text x="580" y="770" className="ar-map-label">{T.places.amu}</text>
      <text x="458" y="712" className="ar-map-label ar-map-label--town">{T.places.moynaq}</text>
      <circle cx="452" cy="690" r="4" className="ar-town" />
      <text x="560" y="300" className="ar-map-label ar-map-label--country">{T.places.kz}</text>
      <text x="520" y="560" className="ar-map-label ar-map-label--country">{T.places.uz}</text>
    </svg>
  );
});
