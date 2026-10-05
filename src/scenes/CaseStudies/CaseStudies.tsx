import { useEffect, useMemo, useRef, useState } from 'react';
import { Scene } from '../../components/layout/Scene';
import { useSectionBeats } from '../../lib/animation/useSceneTimeline';
import { gsap, useGSAP } from '../../lib/animation/gsap';
import { useReducedMotion } from '../../app/store';
import { NARRATIVE } from '../../content/narrative';
import { StatLine, openSource } from '../../components/visualizations/StatLine';
import { JAPAN, UK_MILESTONES, UK_WOODLAND_SERIES, WORLD_FOREST_FRACTION } from '../../content/caseStudies';
import { loadCountries, type CountryFeature } from '../../lib/geography/world';
import { requestRefresh } from '../../lib/animation/refresh';
import { CountryDots } from './CountryDots';
import { geoMercator, geoPath } from 'd3-geo';
import './CaseStudies.css';

const T = NARRATIVE.cases;
const fmt = (n: number) => n.toFixed(1).replace('.', ',');

function useCountry(id: string): CountryFeature | null {
  const [f, setF] = useState<CountryFeature | null>(null);
  useEffect(() => {
    let alive = true;
    void loadCountries().then((all) => {
      if (!alive) return;
      setF(all.find((c) => c.id === id) ?? null);
      requestRefresh();
    });
    return () => {
      alive = false;
    };
  }, [id]);
  return f;
}

/** UK: woodland share over a century on a dot-lattice silhouette + a year scrubber. */
function UnitedKingdom() {
  const uk = useCountry('826');
  const [i, setI] = useState(0);
  const point = UK_WOODLAND_SERIES[i];
  const first = UK_WOODLAND_SERIES[0];
  const last = UK_WOODLAND_SERIES[UK_WOODLAND_SERIES.length - 1];
  const chart = useMemo(() => {
    const W = 520;
    const H = 150;
    const x = (year: number) => ((year - first.year) / (last.year - first.year)) * (W - 20) + 10;
    const y = (p: number) => H - 14 - (p / 16) * (H - 30);
    const line = UK_WOODLAND_SERIES.map((p, k) => `${k ? 'L' : 'M'}${x(p.year).toFixed(1)},${y(p.percent).toFixed(1)}`).join('');
    return { W, H, x, y, line, area: `${line}L${x(last.year)},${H - 14}L${x(first.year)},${H - 14}Z` };
  }, [first.year, last.year]);

  return (
    <div className="cs-case cs-case--uk">
      <div className="cs-text">
        <p className="label cs-kicker">{T.kicker} · I</p>
        <h3 className="title">{T.uk.title}</h3>
        <p className="lead">{T.uk.lead}</p>
        <div className="cs-big">
          <span className="cs-big-value">{fmt(point.percent)}%</span>
          <span className="cs-big-year">{point.label}</span>
        </div>
        <p className="cs-sub">
          {first.label}: {fmt(first.percent)}% · {last.label}: {fmt(last.percent)}%
        </p>
        <label className="cs-scrub" data-local-keys>
          <span className="label">{T.uk.scrub}</span>
          <input type="range" min={0} max={UK_WOODLAND_SERIES.length - 1} step={1} value={i} onChange={(e) => setI(Number(e.target.value))} aria-valuetext={`${point.label}: ${fmt(point.percent)}%`} />
        </label>
        <p className="body-copy cs-nuance">{T.uk.nuance}</p>
        <div className="cs-facts">
          <StatLine factId="ukWoodlandNow" />
          <StatLine factId="ukForestryAct" />
        </div>
      </div>
      <div className="cs-visual">
        {uk ? <CountryDots feature={uk} width={420} height={640} share={point.percent / 100} spacing={10} seed={19} className="cs-dots--uk" label={`${T.uk.title}: ${point.label}, ${fmt(point.percent)}%`} /> : <div className="cs-placeholder" />}
        <svg className="cs-chart" viewBox={`0 0 ${chart.W} ${chart.H}`} aria-hidden="true">
          <path d={chart.area} className="cs-chart-area" />
          <path d={chart.line} className="cs-chart-line" />
          {UK_MILESTONES.map((m) => (
            <g key={m.year} transform={`translate(${chart.x(m.year)} 0)`}>
              <line y1="8" y2={chart.H - 14} className="cs-chart-milestone" />
              <text y="8" x="4" className="cs-chart-label">
                {m.year}
              </text>
            </g>
          ))}
          {UK_WOODLAND_SERIES.map((p, k) => (
            <circle key={p.year} cx={chart.x(p.year)} cy={chart.y(p.percent)} r={k === i ? 5 : 2.5} className="cs-chart-dot" data-on={k === i} />
          ))}
          <text x="10" y={chart.H - 1} className="cs-chart-label">
            {first.label}
          </text>
          <text x={chart.W - 10} y={chart.H - 1} textAnchor="end" className="cs-chart-label">
            {last.label}
          </text>
        </svg>
        <p className="source-ref cs-source">
          <button type="button" onClick={() => openSource('uk-forestry-stats-history')}>
            Forest Research, Forestry Statistics
          </button>
        </p>
      </div>
    </div>
  );
}

/** Japan: two-thirds forest; toggle reveals how much of it is planted. */
function Japan() {
  const jp = useCountry('392');
  const [typeView, setTypeView] = useState(false);
  return (
    <div className="cs-case cs-case--jp">
      <div className="cs-visual">
        {jp ? (
          <CountryDots feature={jp} width={560} height={600} share={JAPAN.forestFraction} subShare={typeView ? JAPAN.plantedFraction : 0} spacing={8} seed={7} className="cs-dots--jp" label={T.japan.title} />
        ) : (
          <div className="cs-placeholder" />
        )}
        <div className="cs-compare" aria-hidden="true">
          <div className="cs-compare-row">
            <span>{T.japan.title}</span>
            <span className="cs-compare-bar" style={{ ['--v' as string]: JAPAN.forestFraction }} />
          </div>
          <div className="cs-compare-row">
            <span>{T.japan.world}</span>
            <span className="cs-compare-bar cs-compare-bar--world" style={{ ['--v' as string]: WORLD_FOREST_FRACTION }} />
          </div>
        </div>
      </div>
      <div className="cs-text">
        <p className="label cs-kicker">{T.kicker} · II</p>
        <h3 className="title">{T.japan.title}</h3>
        <p className="lead">{T.japan.lead}</p>
        <div className="cs-toggle" role="radiogroup" aria-label={T.japan.title}>
          <button type="button" role="radio" aria-checked={!typeView} className="pill-button" onClick={() => setTypeView(false)}>
            {T.japan.toggleAll}
          </button>
          <button type="button" role="radio" aria-checked={typeView} className="pill-button" onClick={() => setTypeView(true)}>
            {T.japan.toggleType}
          </button>
        </div>
        <ul className="cs-legend" data-type-view={typeView}>
          <li data-k="natural">{typeView ? T.japan.natural : T.japan.forest}</li>
          <li data-k="planted">{T.japan.planted}</li>
        </ul>
        <div className="cs-facts">
          <StatLine factId="japanShare" />
          <StatLine factId="japanPlanted" />
        </div>
        <p className="body-copy cs-nuance">{T.japan.nuance}</p>
      </div>
    </div>
  );
}

/** Uzbekistan: the local bridge — mountains, desert, the dried Aral bed. */
function Uzbekistan() {
  const uz = useCountry('860');
  return (
    <div className="cs-case cs-case--uz">
      <div className="cs-text">
        <p className="label cs-kicker">{T.kicker} · III</p>
        <h3 className="title">{T.uzbekistan.title}</h3>
        <p className="lead">{T.uzbekistan.lead}</p>
        <div className="cs-facts">
          <StatLine factId="uzForestShare" />
          <StatLine factId="uzForestArea" />
          <StatLine factId="yashilMakon" />
        </div>
      </div>
      <div className="cs-visual cs-visual--uz">
        {uz ? <UzMap feature={uz} /> : <div className="cs-placeholder" />}
        <p className="cs-bridge title">{T.uzbekistan.bridge}</p>
      </div>
    </div>
  );
}

function UzMap({ feature }: { feature: CountryFeature }) {
  return (
    <svg className="cs-uz" viewBox="0 0 640 420" role="img" aria-label={`${T.uzbekistan.title}: ${T.uzbekistan.mountains}, ${T.uzbekistan.desert}, ${T.uzbekistan.aral}`}>
      <defs>
        <linearGradient id="cs-uz-sand" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#8a6a3e" />
          <stop offset="0.6" stopColor="#5a4326" />
          <stop offset="1" stopColor="#33250f" />
        </linearGradient>
      </defs>
      <CountryOutline feature={feature} />
      <path d="M330,250Q240,200 140,120" className="cs-uz-route" />
      <g transform="translate(140 110)" className="cs-uz-zone cs-uz-zone--aral">
        <circle r="26" />
        <text y="48" textAnchor="middle">
          {T.uzbekistan.aral}
        </text>
      </g>
      <g transform="translate(300 230)" className="cs-uz-zone cs-uz-zone--desert">
        <circle r="20" />
        <text y="40" textAnchor="middle">
          {T.uzbekistan.desert}
        </text>
      </g>
      <g transform="translate(520 270)" className="cs-uz-zone cs-uz-zone--mountains">
        <path d="M-22,10L-8,-14L2,0L10,-10L24,10Z" />
        <text y="34" textAnchor="middle">
          {T.uzbekistan.mountains}
        </text>
      </g>
    </svg>
  );
}

function CountryOutline({ feature }: { feature: CountryFeature }) {
  const d = useMemo(() => {
    const p = geoMercator().fitExtent(
      [
        [20, 20],
        [620, 400],
      ],
      feature,
    );
    return geoPath(p)(feature) ?? '';
  }, [feature]);
  return <path d={d} className="cs-uz-outline" />;
}

/**
 * ACT VII — three real-world cases, three different visual languages.
 */
export function CaseStudies() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useSectionBeats(sectionRef, 'cases', [0, 100, 200]);
  useGSAP(
    () => {
      if (reduced) return;
      gsap.utils.toArray<HTMLElement>('.cs-case').forEach((el) => {
        gsap.from(el.querySelectorAll('.cs-text > *'), { opacity: 0, y: 18, duration: 0.9, stagger: 0.08, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 70%', toggleActions: 'play none none reverse' } });
      });
    },
    { scope: sectionRef, dependencies: [reduced] },
  );
  return (
    <Scene chapter="cases" sectionRef={sectionRef} auto stageClassName="cs-stage">
      <UnitedKingdom />
      <Japan />
      <Uzbekistan />
    </Scene>
  );
}
