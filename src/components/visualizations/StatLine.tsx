import { FACTS, factParts, type FactId } from '../../content/facts';
import { sourceById } from '../../content/sources';
import { setState } from '../../app/store';
import './StatLine.css';

/** Opens the Sources dialog and brings one source into view. */
export function openSource(sourceId: string): void {
  setState({ sourcesOpen: true, navOpen: false });
  window.setTimeout(() => {
    const el = document.getElementById(`source-${sourceId}`);
    el?.scrollIntoView({ block: 'center' });
    el?.classList.add('is-highlighted');
    window.setTimeout(() => el?.classList.remove('is-highlighted'), 2400);
  }, 80);
}

type Props = { factId: FactId; size?: 'normal' | 'large'; className?: string; hideLabel?: boolean };

/** A sourced number: value + unit, label, period/scope and a link to its source. */
export function StatLine({ factId, size = 'normal', className, hideLabel }: Props) {
  const f = FACTS[factId];
  const src = sourceById(f.sourceId);
  const meta = [f.year, f.region].filter(Boolean).join(' · ');
  const parts = factParts(factId);
  return (
    <p className={`stat-line stat-line--${size} ${className ?? ''}`}>
      <span className="stat-value">
        {parts.value}
        {parts.unit && <span className="stat-unit">{parts.unit}</span>}
      </span>
      {!hideLabel && <span className="stat-label">{f.label}</span>}
      <span className="stat-meta">
        {meta}
        {meta ? ' · ' : ''}
        {f.confidence === 'reported' && <span className="stat-flag">rasmiy bayonot · </span>}
        <button type="button" className="stat-source" onClick={() => openSource(f.sourceId)}>
          {src?.organization ?? f.sourceId}
          {src?.year ? `, ${src.year}` : ''}
        </button>
      </span>
    </p>
  );
}
