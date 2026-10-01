import { CHAPTERS } from '../../app/chapters';
import { setState, useStore } from '../../app/store';
import { goChapter } from '../../lib/animation/navigator';
import { Dialog } from './Dialog';

const KEYS: [string, string][] = [
  ['↓ / PgDn / Probel', 'keyingi lahza'],
  ['↑ / PgUp', 'oldingi lahza'],
  ['Home / End', 'boshi / oxiri'],
  ['M', 'ovoz'],
  ['F', 'to‘liq ekran'],
  ['S', 'manbalar'],
  ['P', 'taqdimotchi paneli'],
  ['Esc', 'yopish'],
];

export function ChapterNav() {
  const open = useStore((s) => s.navOpen);
  const current = useStore((s) => s.chapterId);
  const close = () => setState({ navOpen: false });
  return (
    <Dialog open={open} onClose={close} label="Boblar" className="dialog--nav">
      <p className="label">Boblar</p>
      <ol className="nav-list">
        {CHAPTERS.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              className="nav-item"
              aria-current={c.id === current ? 'step' : undefined}
              onClick={() => {
                close();
                window.setTimeout(() => goChapter(c.id), 60);
              }}
            >
              <span className="nav-numeral">{c.numeral}</span>
              <span className="nav-title">{c.title}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="nav-keys">
        <p className="label">Klaviatura</p>
        <dl>
          {KEYS.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Dialog>
  );
}
