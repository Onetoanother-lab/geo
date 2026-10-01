import { useEffect, useRef, useState } from 'react';
import { chapterById, nextChapter, type ChapterId } from '../../app/chapters';
import { openChannel, type PresenterMessage } from '../../lib/presenter/channel';
import { SOURCES } from '../../content/sources';
import './presenter-window.css';

/**
 * Second-screen presenter view (open with ?presenter). Mirrors the projected
 * window through BroadcastChannel and can drive it remotely.
 */
export function PresenterWindow() {
  const [chapterId, setChapterId] = useState<ChapterId>('intro');
  const [progress, setProgress] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const [connected, setConnected] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const channel = useRef<ReturnType<typeof openChannel> | null>(null);

  useEffect(() => {
    document.title = 'Taqdimotchi — O‘rmon';
    const ch = openChannel((m: PresenterMessage) => {
      if (m.type === 'state') {
        setChapterId(m.chapterId);
        setProgress(m.progress);
        setSoundOn(m.soundOn);
        setConnected(true);
      }
    });
    channel.current = ch;
    ch.post({ type: 'hello' });
    return () => ch.close();
  }, []);

  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(t);
  }, [running]);

  const send = (action: 'next' | 'prev' | 'home' | 'end' | 'mute') => channel.current?.post({ type: 'command', action });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'ArrowRight') send('next');
      else if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'ArrowLeft') send('prev');
      else if (e.key === 'm' || e.key === 'M') send('mute');
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const c = chapterById(chapterId);
  const n = nextChapter(chapterId);
  const sources = SOURCES.filter((s) => c.sources.includes(s.id));
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');

  return (
    <main className="pw">
      <header className="pw-head">
        <p className="label">{connected ? 'Asosiy oyna bilan bog‘langan' : 'Asosiy oyna kutilmoqda…'}</p>
        <div className="pw-timer">
          <span className="pw-time">
            {mm}:{ss}
          </span>
          <button type="button" className="pill-button" onClick={() => setRunning((r) => !r)}>
            {running ? 'To‘xtatish' : 'Vaqtni boshlash'}
          </button>
          <button type="button" className="pill-button" onClick={() => setElapsed(0)}>
            Nolga
          </button>
        </div>
      </header>
      <div className="pw-progress" aria-label="Taraqqiyot">
        <div style={{ transform: `scaleX(${progress})` }} />
      </div>
      <section className="pw-current" aria-live="polite">
        <p className="pw-numeral">{c.numeral}</p>
        <h1 className="title">{c.title}</h1>
        <ul className="pw-notes">
          {c.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        {sources.length > 0 && (
          <div className="pw-sources">
            <p className="label">Manbalar</p>
            <ul>
              {sources.map((s) => (
                <li key={s.id}>
                  {s.organization} — {s.title}
                  {s.year ? `, ${s.year}` : ''}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
      <footer className="pw-foot">
        <p className="pw-next">{n ? `Keyingi: ${n.numeral} — ${n.title}` : 'Oxirgi bob'}</p>
        <div className="pw-remote">
          <button type="button" className="pill-button" onClick={() => send('prev')}>
            Oldingi
          </button>
          <button type="button" className="pill-button" onClick={() => send('next')}>
            Keyingi
          </button>
          <button type="button" className="pill-button" onClick={() => send('mute')} aria-pressed={soundOn}>
            {soundOn ? 'Ovozni o‘chirish' : 'Ovozni yoqish'}
          </button>
        </div>
      </footer>
    </main>
  );
}
