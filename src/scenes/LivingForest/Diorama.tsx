import { memo, useMemo } from 'react';
import { broadleafPath, coniferPath, generateLayer, mergeLayer, mulberry32, translatePath, range } from '../../lib/forest/generate';
import { rootSystem } from '../../lib/forest/roots';
import { NARRATIVE } from '../../content/narrative';
import { BIRD_PERCHED, DEER, DEER_ANTLERS, FOX, HARE, OWL, butterfly, mushroom } from '../../components/visualizations/silhouettes';

export type Topic = 'tree' | 'roots' | 'soil' | 'water' | 'wildlife' | 'air';

export const HOTSPOTS: { id: Topic; x: number; y: number }[] = [
  { id: 'air', x: 960, y: 70 },
  { id: 'tree', x: 700, y: 235 },
  { id: 'wildlife', x: 452, y: 392 },
  { id: 'soil', x: 300, y: 530 },
  { id: 'roots', x: 640, y: 640 },
  { id: 'water', x: 1440, y: 455 },
];

const GROUND = 470;
const TAG = NARRATIVE.system.tags;

/** The cross-section ecosystem (above and below ground) with one overlay per topic. */
export const Diorama = memo(function Diorama() {
  const art = useMemo(() => {
    const rng = mulberry32(2024);
    const backdrop = mergeLayer(generateLayer({ seed: 77, count: 34, baseY: GROUND + 4, baseJitter: 6, minH: 120, maxH: 230, mix: { conifer: 0.6, broadleaf: 0.4 } }));
    const oak = translatePath(broadleafPath(420, 440, rng), 700, GROUND);
    const pine = translatePath(coniferPath(360, 150, rng), 1110, GROUND);
    const small = translatePath(broadleafPath(230, 220, rng), 300, GROUND);
    const roots = [rootSystem(700, GROUND + 6, 5, { length: 330, depth: 4 }), rootSystem(1110, GROUND + 6, 9, { length: 210, depth: 3, spread: 0.8 }), rootSystem(300, GROUND + 6, 13, { length: 170, depth: 3 })];
    // Mycorrhizal threads: connect tips across trees.
    const threads: string[] = [];
    const [a, b, c] = roots.map((r) => r.tips);
    const link = (p: [number, number], q: [number, number]) => {
      const mx = (p[0] + q[0]) / 2;
      const my = Math.max(p[1], q[1]) + range(rng, 10, 50);
      threads.push(`M${p[0].toFixed(1)},${p[1].toFixed(1)}Q${mx.toFixed(1)},${my.toFixed(1)} ${q[0].toFixed(1)},${q[1].toFixed(1)}`);
    };
    for (let i = 0; i < 7; i++) link(a[Math.floor(rng() * a.length)], b[Math.floor(rng() * b.length)]);
    for (let i = 0; i < 5; i++) link(a[Math.floor(rng() * a.length)], c[Math.floor(rng() * c.length)]);
    const shrubs = Array.from({ length: 22 }, () => {
      const x = range(rng, 20, 1300);
      const s = range(rng, 14, 34);
      return `M${(x - s).toFixed(1)},${GROUND}a${s},${(s * 0.8).toFixed(1)} 0 1,1 ${(s * 2).toFixed(1)},0Z`;
    }).join('');
    const pebbles = Array.from({ length: 60 }, () => {
      const x = range(rng, 0, 1600);
      const y = range(rng, 660, 880);
      const r = range(rng, 2, 7);
      return `M${(x - r).toFixed(1)},${y.toFixed(1)}a${r.toFixed(1)},${(r * 0.7).toFixed(1)} 0 1,0 ${(r * 2).toFixed(1)},0a${r.toFixed(1)},${(r * 0.7).toFixed(1)} 0 1,0 ${(-r * 2).toFixed(1)},0`;
    }).join('');
    const grains = Array.from({ length: 70 }, () => {
      const x = range(rng, 560, 860);
      const y = range(rng, 500, 700);
      return `M${x.toFixed(1)},${y.toFixed(1)}h2.4v2.4h-2.4Z`;
    }).join('');
    return { backdrop, oak, pine, small, roots, threads, shrubs, pebbles, grains };
  }, []);

  const rootStroke = (depth: number) => [16, 9, 5, 2.6, 1.5][depth] ?? 1.2;

  return (
    <svg className="diorama" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="ls-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0c2a29" />
          <stop offset="1" stopColor="#4c7562" />
        </linearGradient>
        <linearGradient id="ls-soil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a2016" />
          <stop offset="0.06" stopColor="#33251a" />
          <stop offset="0.4" stopColor="#3d2b1c" />
          <stop offset="1" stopColor="#4a3726" />
        </linearGradient>
        <linearGradient id="ls-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6fb3b0" stopOpacity="0" />
          <stop offset="1" stopColor="#6fb3b0" stopOpacity="0.32" />
        </linearGradient>
        <linearGradient id="ls-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5d9aa0" />
          <stop offset="1" stopColor="#24525a" />
        </linearGradient>
        <marker id="ls-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0L10,5L0,10Z" fill="context-stroke" />
        </marker>
      </defs>

      {/* Above ground */}
      <rect width="1600" height={GROUND + 4} fill="url(#ls-sky)" />
      <g className="ls-clouds">
        <ellipse cx="900" cy="92" rx="150" ry="34" />
        <ellipse cx="985" cy="78" rx="90" ry="30" />
        <ellipse cx="1260" cy="128" rx="120" ry="26" />
        <ellipse cx="300" cy="140" rx="110" ry="22" />
      </g>
      <path d={art.backdrop} className="ls-backdrop" />
      <rect x="0" y={GROUND - 120} width="1600" height="124" className="ls-mist" />
      <path d={art.small} className="ls-tree ls-tree--small" />
      <path d={art.pine} className="ls-tree" />
      <path d={art.oak} className="ls-tree ls-tree--oak" />
      <path d={art.shrubs} className="ls-shrubs" />

      {/* Wildlife */}
      <g className="ls-animal" transform={`translate(392 ${GROUND - 77}) scale(1.1)`}>
        <path d={DEER} />
        <path d={DEER_ANTLERS} className="ls-antlers" />
      </g>
      <g className="ls-animal" transform={`translate(1190 ${GROUND - 54}) scale(0.9)`}>
        <path d={FOX} />
      </g>
      <g className="ls-animal" transform={`translate(960 ${GROUND - 42}) scale(0.7)`}>
        <path d={HARE} />
      </g>
      <g className="ls-animal" transform="translate(830 214) scale(1.3)">
        <path d={BIRD_PERCHED} />
      </g>
      <g className="ls-animal" transform="translate(1100 286) scale(0.55)">
        <path d={OWL} />
      </g>
      <path className="ls-fungi" d={mushroom(598, GROUND, 1.4) + mushroom(616, GROUND, 1) + mushroom(1010, GROUND, 1.1)} />
      <path className="ls-insects" d={butterfly(560, 420, 1.4) + butterfly(596, 398, 1) + butterfly(240, 430, 1.1)} />

      {/* Below ground */}
      <path d={`M0,${GROUND}L1330,${GROUND}Q1345,${GROUND + 38} 1380,${GROUND + 44}L1500,${GROUND + 44}Q1535,${GROUND + 38} 1548,${GROUND}L1600,${GROUND}L1600,900L0,900Z`} fill="url(#ls-soil)" />
      <rect x="0" y={GROUND} width="1330" height="16" className="ls-litter" />
      <path d={art.pebbles} className="ls-pebbles" />
      <path d="M0,792Q300,780 600,794T1200,786T1600,780L1600,900L0,900Z" className="ls-groundwater" />
      <path d={`M1330,${GROUND + 6}L1548,${GROUND + 6}Q1535,${GROUND + 38} 1500,${GROUND + 44}L1380,${GROUND + 44}Q1345,${GROUND + 38} 1330,${GROUND + 6}Z`} fill="url(#ls-water)" />
      <line x1="0" y1={GROUND} x2="1600" y2={GROUND} className="ls-cutline" />
      <g className="ls-roots">
        {art.roots.flatMap((sys, k) => sys.segments.map((s, i) => <path key={`${k}-${i}`} d={s.d} strokeWidth={rootStroke(s.depth)} />))}
      </g>

      {/* — Topic overlays — */}
      <g className="ls-ov" data-topic="tree">
        <path d="M520,30Q560,120 610,190" className="ls-flow ls-flow--in" markerEnd="url(#ls-arrow)" />
        <path d="M640,20Q660,110 690,170" className="ls-flow ls-flow--in" markerEnd="url(#ls-arrow)" />
        <path d="M820,175Q880,100 940,30" className="ls-flow ls-flow--out" markerEnd="url(#ls-arrow)" />
        <text x="506" y="24" className="ls-tag">{TAG.co2}</text>
        <text x="944" y="26" className="ls-tag">{TAG.o2}</text>
        <path d={art.oak} className="ls-glow" />
        <text x="724" y="455" className="ls-tag">{TAG.carbon}</text>
      </g>

      <g className="ls-ov" data-topic="roots">
        {art.threads.map((d, i) => (
          <path key={i} d={d} className="ls-thread" />
        ))}
        <text x="830" y="760" className="ls-tag">{TAG.threads}</text>
      </g>

      <g className="ls-ov" data-topic="soil">
        {Array.from({ length: 14 }, (_, i) => {
          const x = 120 + i * 34;
          return <line key={i} x1={x} y1={300 + (i % 3) * 20} x2={x - 10} y2={GROUND - 12} className="ls-rain" />;
        })}
        {Array.from({ length: 8 }, (_, i) => {
          const x = 140 + i * 55;
          return <path key={i} d={`M${x},${GROUND + 6}L${x + 4},${GROUND + 110}`} className="ls-flow ls-flow--down" markerEnd="url(#ls-arrow)" />;
        })}
        <path d={art.grains} className="ls-grains" />
        <rect x="0" y={GROUND} width="1330" height="16" className="ls-litter-lit" />
        <text x="150" y={GROUND + 150} className="ls-tag">{TAG.litter}</text>
        <text x="600" y={GROUND + 250} className="ls-tag">{TAG.grip}</text>
      </g>

      <g className="ls-ov" data-topic="water">
        <path d="M700,150Q760,60 860,96" className="ls-flow ls-flow--cycle" markerEnd="url(#ls-arrow)" />
        <path d="M1460,470Q1420,260 1300,140" className="ls-flow ls-flow--cycle" markerEnd="url(#ls-arrow)" />
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={1060 + i * 22} y1={150} x2={1050 + i * 22} y2={GROUND - 20} className="ls-rain" />
        ))}
        <path d={`M1150,${GROUND + 8}Q1150,650 1190,780`} className="ls-flow ls-flow--cycle" markerEnd="url(#ls-arrow)" />
        <path d="M1200,790Q1360,740 1430,520" className="ls-flow ls-flow--cycle" markerEnd="url(#ls-arrow)" />
        <text x="660" y="70" className="ls-tag">{TAG.evaporation}</text>
        <text x="1110" y="140" className="ls-tag">{TAG.rain}</text>
        <text x="1010" y="840" className="ls-tag">{TAG.groundwater}</text>
        <text x="1380" y={GROUND + 80} className="ls-tag">{TAG.stream}</text>
      </g>

      <g className="ls-ov" data-topic="wildlife">
        <path d="M440,402L370,452" className="ls-web" />
        <path d="M840,212L580,412" className="ls-web" />
        <path d="M1230,430L1000,440" className="ls-web" />
        <path d="M1105,300L1000,430" className="ls-web" />
        <path d="M606,462L690,560" className="ls-web" />
        <path d="M840,212L1100,300" className="ls-web" />
        <text x="378" y="380" className="ls-tag">{TAG.deer}</text>
        <text x="852" y="200" className="ls-tag">{TAG.bird}</text>
        <text x="1240" y="404" className="ls-tag">{TAG.fox}</text>
        <text x="940" y="410" className="ls-tag">{TAG.hare}</text>
        <text x="1126" y="290" className="ls-tag">{TAG.owl}</text>
        <text x="520" y="384" className="ls-tag">{TAG.insects}</text>
        <text x="560" y={GROUND + 34} className="ls-tag">{TAG.fungi}</text>
      </g>

      <g className="ls-ov" data-topic="air">
        <path d="M470,240Q700,140 930,240L980,470L420,470Z" fill="url(#ls-shade)" />
        {[1020, 1120, 1240, 1380, 1500].map((x, i) => (
          <line key={x} x1={x + 160} y1={0} x2={x - (i < 2 ? 40 : 60)} y2={i < 2 ? 210 : GROUND - 6} className="ls-ray" />
        ))}
        <text x="560" y="420" className="ls-tag">{TAG.shade}</text>
        <text x="1300" y="440" className="ls-tag">{TAG.open}</text>
      </g>
    </svg>
  );
});
