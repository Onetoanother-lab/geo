import { chapterById, nextChapter } from '../../app/chapters';
import { setState, useStore } from '../../app/store';
import { openPresenterWindow } from '../../lib/presenter/channel';
import { SOURCES } from '../../content/sources';
import { IconClose, IconPresenter } from './icons';

/** Local presenter notes panel (P). Hidden by default; never shown on load. */
export function PresenterPanel() {
  const open = useStore((s) => s.presenterOpen);
  const chapterId = useStore((s) => s.chapterId);
  const progress = useStore((s) => s.progress);
  if (!open) return null;
  const c = chapterById(chapterId);
  const n = nextChapter(chapterId);
  const sources = SOURCES.filter((s) => c.sources.includes(s.id));
  return (
    <aside className="presenter-panel" aria-label="Taqdimotchi paneli">
      <header className="presenter-head">
        <p className="label">
          {c.numeral} · {Math.round(progress * 100)}%
        </p>
        <div className="presenter-actions">
          <button type="button" className="control-btn" onClick={openPresenterWindow} title="Alohida oynada ochish">
            <IconPresenter />
            <span className="control-label">Alohida oyna</span>
          </button>
          <button type="button" className="control-btn" onClick={() => setState({ presenterOpen: false })} aria-label="Panelni yopish (P)">
            <IconClose />
          </button>
        </div>
      </header>
      <p className="presenter-title">{c.title}</p>
      <ul className="presenter-notes">
        {c.notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
      {sources.length > 0 && (
        <p className="presenter-sources">
          Manba: {sources.map((s) => `${s.organization} (${s.year ?? '—'})`).join('; ')}
        </p>
      )}
      {n && (
        <p className="presenter-next">
          Keyingi: {n.numeral} — {n.title}
        </p>
      )}
    </aside>
  );
}
