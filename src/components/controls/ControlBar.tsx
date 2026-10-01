import { useEffect, useRef, useState } from 'react';
import { setState, useReducedMotion, useStore, cycleMotionPreference } from '../../app/store';
import { toggleSound } from '../../app/useAppEffects';
import { toggleFullscreen } from '../../lib/accessibility/fullscreen';
import { IconChapters, IconFullscreen, IconMotion, IconMuted, IconSound, IconSources } from './icons';
import './controls.css';

const MOTION_LABEL = { system: 'tizim bo‘yicha', reduced: 'kamaytirilgan', full: 'to‘liq' } as const;

/** Discreet top-right controls. Dim while idle, wake on pointer move or focus. */
export function ControlBar() {
  const soundOn = useStore((s) => s.soundOn);
  const pref = useStore((s) => s.motionPreference);
  const entered = useStore((s) => s.entered);
  const reduced = useReducedMotion();
  const [awake, setAwake] = useState(true);
  const timer = useRef(0);

  useEffect(() => {
    const wake = () => {
      setAwake(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setAwake(false), 2600);
    };
    wake();
    window.addEventListener('pointermove', wake, { passive: true });
    window.addEventListener('keydown', wake);
    return () => {
      window.clearTimeout(timer.current);
      window.removeEventListener('pointermove', wake);
      window.removeEventListener('keydown', wake);
    };
  }, []);

  if (!entered) return null;

  return (
    <nav className="control-bar" data-awake={awake} aria-label="Taqdimot boshqaruvi">
      <button type="button" className="control-btn" onClick={toggleSound} aria-pressed={soundOn} title="Ovoz (M)">
        {soundOn ? <IconSound /> : <IconMuted />}
        <span className="control-label">{soundOn ? 'Ovoz yoniq' : 'Ovozsiz'}</span>
      </button>
      <button type="button" className="control-btn" onClick={cycleMotionPreference} title="Harakat darajasi">
        <IconMotion />
        <span className="control-label">
          Harakat: {MOTION_LABEL[pref]}
          {pref === 'system' && reduced ? ' (kam)' : ''}
        </span>
      </button>
      <button type="button" className="control-btn" onClick={() => setState({ navOpen: true })} title="Boblar">
        <IconChapters />
        <span className="control-label">Boblar</span>
      </button>
      <button type="button" className="control-btn" onClick={() => setState({ sourcesOpen: true })} title="Manbalar (S)">
        <IconSources />
        <span className="control-label">Manbalar</span>
      </button>
      <button type="button" className="control-btn" onClick={() => void toggleFullscreen()} title="To‘liq ekran (F)">
        <IconFullscreen />
        <span className="control-label">To‘liq ekran</span>
      </button>
    </nav>
  );
}
