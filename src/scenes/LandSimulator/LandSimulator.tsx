import { useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState, type KeyboardEvent } from 'react';
import { Scene } from '../../components/layout/Scene';
import { useSectionBeats } from '../../lib/animation/useSceneTimeline';
import { gsap, useGSAP } from '../../lib/animation/gsap';
import { setState, useReducedMotion } from '../../app/store';
import { NARRATIVE } from '../../content/narrative';
import { announce } from '../../lib/accessibility/announce';
import { createInitialState, indicators, MATURE_AGE, YEARS_PER_TURN, type Indicators, type SimEvent, type Tool } from '../../lib/simulator/model';
import { simReducer } from '../../lib/simulator/reducer';
import { TileArt } from './TileArt';
import { loadSimulator, resultOf, saveSimulator } from '../../lib/simulator/memory';
import './LandSimulator.css';

const T = NARRATIVE.simulator;
const TOOLS = Object.keys(T.tools) as Tool[];
const KEYS = Object.keys(T.indicators) as (keyof Indicators)[];

export function eventMessage(e: SimEvent): string {
  const m = T.messages;
  switch (e.kind) {
    case 'cleared':
      return e.nearWater ? m.clearedWater : m.cleared;
    case 'protected':
      return m.protected;
    case 'farmed':
      return m.farmed;
    case 'restored':
      return m.restored;
    case 'improved':
      return m.improved;
    case 'managed':
      return m.managed;
    case 'settled':
      return m.settled;
    case 'invalid':
      return e.reason === 'protected' ? m.invalidProtected : m.invalidType;
    case 'years':
      return m.years.replace('{n}', String(e.years));
    case 'grown':
      return m.grown;
    case 'demand':
      return m.demand;
    case 'pressure':
      return m.pressure;
    case 'deficit':
      return m.deficit;
  }
}

const level = (v: number) => (v < 0.34 ? T.levels.low : v < 0.67 ? T.levels.mid : T.levels.high);

/**
 * ACT IX — possibility. A miniature landscape with transparent rules and real
 * tradeoffs: food demand grows, deficits push clearing, protection is not free.
 */
export function LandSimulator() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [state, dispatch] = useReducer(simReducer, undefined, loadSimulator);
  const [tool, setTool] = useState<Tool>('protect');
  const [focus, setFocus] = useState(0);
  const keyboardFocus = useRef<number | null>(null);
  const [log, setLog] = useState<string[]>([T.messages.start]);
  const prev = useRef<Indicators>(indicators(state));
  const ind = useMemo(() => indicators(state), [state]);
  useEffect(() => { setState({ simulatorResult: resultOf(state) }); }, [state]);
  const preview = indicators(simReducer(state, { type: 'apply', index: focus, tool }));
  useLayoutEffect(() => {
    if (keyboardFocus.current === null) return;
    const index = keyboardFocus.current;
    keyboardFocus.current = null;
    // React commits the roving tab stop before focus moves to it.
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-cell="${index}"]`)?.focus({ preventScroll: true });
  }, [focus]);

  useSectionBeats(sectionRef, 'simulator', [0]);

  useGSAP(
    () => {
      if (reduced) return;
      gsap.from('.sim-cell', {
        opacity: 0,
        scale: 0.85,
        duration: 0.6,
        ease: 'power2.out',
        stagger: { each: 0.012, from: 'random' },
        scrollTrigger: { trigger: sectionRef.current, start: 'top 65%', toggleActions: 'play none none reverse' },
      });
    },
    { scope: sectionRef, dependencies: [reduced] },
  );

  const commit = (next: Parameters<typeof dispatch>[0]) => {
    prev.current = ind;
    const nextState = simReducer(state, next);
    dispatch(next);
    saveSimulator(nextState);
    const lines = nextState.events.map(eventMessage);
    setLog((l) => [...lines.reverse(), ...l].slice(0, 3));
    announce(lines.join(' '));
  };

  const onCellKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const x = i % state.cols;
    const y = Math.floor(i / state.cols);
    let n: number;
    if (e.key === 'ArrowRight') n = y * state.cols + Math.min(state.cols - 1, x + 1);
    else if (e.key === 'ArrowLeft') n = y * state.cols + Math.max(0, x - 1);
    else if (e.key === 'ArrowDown') n = Math.min(state.rows - 1, y + 1) * state.cols + x;
    else if (e.key === 'ArrowUp') n = Math.max(0, y - 1) * state.cols + x;
    else if (e.key === 'Home') n = y * state.cols;
    else if (e.key === 'End') n = y * state.cols + state.cols - 1;
    else return;
    e.preventDefault();
    if (n === i) return;
    keyboardFocus.current = n;
    setFocus(n);
  };

  const rows = Array.from({ length: state.rows }, (_, r) => state.tiles.slice(r * state.cols, (r + 1) * state.cols));

  return (
    <Scene chapter="simulator" sectionRef={sectionRef} auto stageClassName="sim-stage">
      <div className="sim-layout">
        <div className="sim-map" style={{ ['--water-quality' as string]: `${ind.water * 100}%`, ['--canopy-health' as string]: ind.biodiversity }}>
          <div ref={gridRef} className="sim-grid" role="grid" aria-label={T.gridLabel} style={{ ['--cols' as string]: state.cols }}>
            {rows.map((row, r) => (
              <div key={r} role="row" className="sim-row">
                {row.map((tile, c) => {
                  const i = r * state.cols + c;
                  return (
                    <div key={i} role="gridcell" className="sim-cell-wrap">
                      <button
                        type="button"
                        className="sim-cell"
                        data-cell={i}
                        data-type={tile.type}
                        tabIndex={focus === i ? 0 : -1}
                        aria-label={`${r + 1}-qator, ${c + 1}-ustun: ${T.tiles[tile.type]}`}
                        onFocus={() => setFocus(i)}
                        onKeyDown={(e) => onCellKey(e, i)}
                        onClick={() => commit({ type: 'apply', index: i, tool })}
                      >
                        <span key={`${tile.type}-${tile.type === 'young' ? Math.floor(tile.age / 10) : 0}`} className="sim-tile">
                          <TileArt tile={tile} index={i} />
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <ul className="sim-legend" aria-hidden="true">
            {(['forest', 'protected', 'managed', 'young', 'farm', 'agroforest', 'pasture', 'bare', 'water', 'village'] as const).map((k) => (
              <li key={k}>
                <span className="sim-legend-swatch" data-type={k} />
                {T.tiles[k]}
              </li>
            ))}
          </ul>
          <div className="sim-time">
            <p className="sim-year">
              <span className="label">{T.yearLabel}</span> <span className="sim-year-value">+{state.year}</span>
            </p>
            <button type="button" className="pill-button sim-advance" onClick={() => commit({ type: 'advance' })}>
              {YEARS_PER_TURN} {T.advance}
            </button>
            <button
              type="button"
              className="text-link"
              onClick={() => {
                prev.current = indicators(createInitialState());
                dispatch({ type: 'reset' });
                saveSimulator(createInitialState());
                setLog([T.messages.start]);
              }}
            >
              {T.reset}
            </button>
          </div>

          <ol className="sim-log" aria-label={T.logLabel}>
            {log.map((l, i) => (
              <li key={`${l}-${i}`} data-latest={i === 0}>
                {l}
              </li>
            ))}
          </ol>

        </div>

        <div className="sim-panel">
          <p className="title sim-title">{T.title}</p>
          <p className="sim-intro">{T.intro}</p>
          <p className="sim-disclaimer">{T.disclaimer}</p>

          <div className="sim-tools" role="radiogroup" aria-label={T.toolsLabel}>
            {TOOLS.map((k) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={tool === k}
                className="pill-button sim-tool"
                data-tool={k}
                onClick={() => setTool(k)}
                onKeyDown={(e) => {
                  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
                  e.preventDefault();
                  const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1;
                  const nextTool = TOOLS[(TOOLS.indexOf(k) + d + TOOLS.length) % TOOLS.length];
                  setTool(nextTool);
                  (e.currentTarget.parentElement?.querySelector(`[data-tool="${nextTool}"]`) as HTMLButtonElement | null)?.focus();
                }}
                tabIndex={tool === k ? 0 : -1}
              >
                {T.tools[k].label}
              </button>
            ))}
          </div>
          <p className="sim-hint">{T.tools[tool].hint}</p>
          <div className="sim-tradeoff" aria-label="Tanlangan katakdagi murosa">
            <p><span className="label">Hozir</span> {T.indicators.benefit}: {level(preview.benefit)} · {T.indicators.food}: {level(preview.food)}</p>
            <p><span className="label">Muhit</span> {T.indicators.biodiversity}: {level(preview.biodiversity)} · {T.indicators.water}: {level(preview.water)}</p>
          </div>

          <dl className="sim-indicators">
            {KEYS.map((k) => {
              const d = ind[k] - prev.current[k];
              return (
                <div key={k} className="sim-indicator" style={{ ['--level' as string]: ind[k].toFixed(3) }}>
                  <dt>{T.indicators[k]}</dt>
                  <dd>
                    <span className="sim-bar" aria-hidden="true">
                      <span />
                    </span>
                    <span className="sim-level">
                      {level(ind[k])}
                      {Math.abs(d) > 0.005 && (
                        <svg className="sim-delta" data-dir={d > 0 ? 'up' : 'down'} viewBox="0 0 10 10" aria-hidden="true">
                          <path d={d > 0 ? 'M5,1L9,8H1Z' : 'M5,9L9,2H1Z'} />
                        </svg>
                      )}
                    </span>
                  </dd>
                </div>
              );
            })}
          </dl>


          <details className="sim-rules">
            <summary>{T.rulesTitle}</summary>
            <ul>
              {T.rules.map((r) => (
                <li key={r}>{r.replace('{mature}', String(MATURE_AGE)).replace('{years}', String(YEARS_PER_TURN))}</li>
              ))}
            </ul>
          </details>
        </div>
      </div>
    </Scene>
  );
}
