import { useEffect, useRef, useState } from 'react';
import { chapterById, nextChapter, type ChapterId } from '../../app/chapters';
import { openChannel, type PresenterMessage, type PresenterSnapshot } from '../../lib/presenter/channel';
import { SOURCES } from '../../content/sources';
import { SCORE, scoreBeat } from '../../content/cinematic';
import { ProjectorCalibration } from './ProjectorCalibration';
import { NARRATIVE } from '../../content/narrative';
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
  const [snapshot, setSnapshot] = useState<PresenterSnapshot | null>(null);
  const [calibrating, setCalibrating] = useState(false);
  const channel = useRef<ReturnType<typeof openChannel> | null>(null);

  useEffect(() => {
    document.title = 'Taqdimotchi — O‘rmon';
    const ch = openChannel((m: PresenterMessage) => {
      if (m.type === 'state') {
        setSnapshot(m);
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
    if (!snapshot?.startedAt) return;
    const startedAt = snapshot.startedAt;
    const update = () => setElapsed(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    update();
    const t = window.setInterval(update, 1000);
    return () => window.clearInterval(t);
  }, [snapshot?.startedAt]);

  const send = (action: 'next' | 'prev' | 'home' | 'end' | 'mute' | 'audio-check') => channel.current?.post({ type: 'command', action });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('input, button, select, textarea, [data-local-keys]')) return;
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
  const score = SCORE[chapterId];
  const beat = score.beats.find((b) => b.name === snapshot?.currentBeat) ?? scoreBeat(chapterId, snapshot?.chapterProgress ?? 0);
  const nextBeat = score.beats[score.beats.indexOf(beat) + 1];
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
          <span className="label">Jami vaqt</span>
          <button type="button" className="pill-button" aria-pressed={calibrating} onClick={() => setCalibrating((v) => !v)}>Kalibrlash</button>
        </div>
      </header>
      {calibrating && <ProjectorCalibration snapshot={snapshot} onLift={(lift) => channel.current?.post({ type: 'calibrate', lift })} onAudio={() => send('audio-check')} />}
      <div className="pw-progress" aria-label="Taraqqiyot">
        <div style={{ transform: `scaleX(${progress})` }} />
      </div>
      <section className="pw-current" aria-live="polite">
        <p className="pw-numeral">{c.numeral}</p>
        <h1 className="title">{c.title}</h1>
        <p className="pw-duration">Tavsiya etilgan vaqt: {score.duration} soniya</p>
        <div className="pw-beat">
          <p className="label">Hozirgi lahza</p>
          <p className="title">{snapshot?.currentBeat || beat.name}</p>
          <p>{beat.talkingPoint}</p>
          <p className="pw-next-point">Keyingi fikr: {nextBeat?.talkingPoint ?? (n ? SCORE[n.id].beats[0].talkingPoint : 'Sukut. O‘rmon yashashda davom etadi.')}</p>
        </div>
        <ul className="pw-notes">
          {c.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        {chapterId === 'finale' && (
          <div className="pw-actions">
            <p className="label">{NARRATIVE.finale.actionsTitle}</p>
            <ul>
              {NARRATIVE.finale.actions.map((a) => <li key={a}>{a}</li>)}
            </ul>
          </div>
        )}
        {sources.length > 0 && (
          <div className="pw-sources">
            <p className="label">Manbalar</p>
            <ul>
              {sources.map((s) => (
                <li key={s.id}>
                  <a href={s.url} target="_blank" rel="noreferrer">{s.organization} — {s.title}</a>
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
