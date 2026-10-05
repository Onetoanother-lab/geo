import { SOURCES } from '../../content/sources';
import { FACTS, RESEARCH_GAPS, formatFact, type FactId } from '../../content/facts';
import { NARRATIVE } from '../../content/narrative';

/** All sources, each with the facts that cite it, and the production credits. */
export function SourcesList({ headingLevel = 3 }: { headingLevel?: 2 | 3 }) {
  const H = `h${headingLevel}` as 'h2' | 'h3';
  return (
    <div className="sources-list">
      <ol>
        {SOURCES.map((s) => {
          const facts = (Object.keys(FACTS) as FactId[]).filter((k) => FACTS[k].sourceId === s.id).map((k) => ({ ...FACTS[k], key: k }));
          return (
            <li key={s.id} id={`source-${s.id}`} className="source-item">
              <H className="source-org">{s.organization}</H>
              <p className="source-title">
                <a href={s.url} target="_blank" rel="noreferrer">
                  {s.title}
                </a>
                {s.year ? <span className="source-year"> · {s.year}</span> : null}
              </p>
              {s.usedFor && <p className="source-used">{s.usedFor}</p>}
              {facts.length > 0 && (
                <ul className="source-facts">
                  {facts.map((f) => (
                    <li key={f.id}>
                      <span className="source-fact-value">{formatFact(f.key)}</span>{' '}
                      — {f.label}
                      {f.year ? ` (${f.year}${f.region ? `, ${f.region}` : ''})` : f.region ? ` (${f.region})` : ''}
                      {f.confidence === 'reported' && <span className="source-flag"> · rasmiy bayonot</span>}
                    </li>
                  ))}
                </ul>
              )}
              {s.accessed && <p className="source-accessed">Murojaat qilingan: {s.accessed}</p>}
            </li>
          );
        })}
      </ol>
      {RESEARCH_GAPS.length > 0 && (
        <details className="research-gaps">
          <summary>Tekshirilmagan da’volar va ularning talqini</summary>
          <ul>
            {RESEARCH_GAPS.map((g) => (
              <li key={g.claim}>
                <strong>{g.claim}</strong> — {g.status}. {g.handling}
              </li>
            ))}
          </ul>
        </details>
      )}
      <p className="sources-credits">{NARRATIVE.finale.credits}</p>
    </div>
  );
}
