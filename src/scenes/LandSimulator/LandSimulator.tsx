import { useMemo, useReducer, useRef, useState, type KeyboardEvent } from 'react';
import { Scene } from '../../components/layout/Scene';
import { useSectionBeats } from '../../lib/animation/useSceneTimeline';
import { gsap, useGSAP } from '../../lib/animation/gsap';
import { useReducedMotion } from '../../app/store';
import { NARRATIVE } from '../../content/narrative';
import { announce } from '../../lib/accessibility/announce';
import { createInitialState, indicators, MATURE_AGE, YEARS_PER_TURN, type Indicators, type SimEvent, type Tool } from '../../lib/simulator/model';
import { simReducer } from '../../lib/simulator/reducer';
import { TileArt } from './TileArt';
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
  const [state, dispatch] = useReducer(simReducer, undefined, createInitialState);
  const [tool, setTool] = useState<Tool>('protect');
  const [focus, setFocus] = useState(0);
  const [log, setLog] = useState<string[]>([T.messages.start]);
  const prev = useRef<Indicators>(indicators(state));
  const ind = useMemo(() => indicators(state), [state]);

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
    setFocus(n);
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-cell="${n}"]`)?.focus();
  };

  const rows = Array.from({ length: state.rows }, (_, r) => state.tiles.slice(r * state.cols, (r + 1) * state.cols));

  return (
    <Scene chapter="simulator" sectionRef={sectionRef} auto stageClassName="sim-stage">
      <div className="sim-layout">
        <div className="sim-map">
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
            {(['forest', 'protected', 'young', 'farm', 'agroforest', 'pasture', 'bare', 'water', 'village'] as const).map((k) => (
              <li key={k}>
                <span className="sim-legend-swatch" data-type={k} />
                {T.tiles[k]}
              </li>
            ))}
          </ul>
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
