import { useEffect, useRef, useState } from 'react';
import { getState, setState, useReducedMotion, useStore, cycleMotionPreference } from '../../app/store';
import { toggleSound } from '../../app/useAppEffects';
import { toggleFullscreen } from '../../lib/accessibility/fullscreen';
import { IconChapters, IconFullscreen, IconMotion, IconMuted, IconSound, IconSources, IconPresenter } from './icons';
import { MOTION } from '../../lib/animation/motion';
import { openPresenterWindow } from '../../lib/presenter/channel';
import './controls.css';

const MOTION_LABEL = { system: 'tizim bo‘yicha', reduced: 'kamaytirilgan', full: 'to‘liq' } as const;

/** Discreet top-right controls. Dim while idle, wake on pointer move or focus. */
export function ControlBar() {
  const soundOn = useStore((s) => s.soundOn);
  const pref = useStore((s) => s.motionPreference);
  const entered = useStore((s) => s.entered);
  const reduced = useReducedMotion();
  const cinema = useStore((s) => s.cinemaMode);
  const overlay = useStore((s) => s.sourcesOpen || s.navOpen);
  const [awake, setAwake] = useState(true);
  const timer = useRef(0);

  useEffect(() => {
    let keyboard = false;
    const wake = () => {
      setAwake(true);
      document.documentElement.dataset.cinemaIdle = 'false';
      window.clearTimeout(timer.current);
      if (!entered || !cinema || overlay || keyboard) return;
      timer.current = window.setTimeout(() => {
        const s = getState();
        if (keyboard || s.sourcesOpen || s.navOpen || document.activeElement?.matches('button:focus-visible, input:focus-visible, a:focus-visible, [tabindex="0"]:focus-visible')) return;
        setAwake(false);
        document.documentElement.dataset.cinemaIdle = 'true';
      }, MOTION.idle * 1000);
    };
    const pointer = () => { keyboard = false; wake(); };
    const key = () => { keyboard = true; wake(); };
    const focus = (e: FocusEvent) => {
      if ((e.target as HTMLElement)?.id === 'experience') return;
      if ((e.target as HTMLElement)?.matches(':focus-visible')) keyboard = true;
      wake();
    };
    wake();
    window.addEventListener('pointermove', pointer, { passive: true });
    window.addEventListener('pointerdown', pointer, { passive: true });
    window.addEventListener('keydown', key);
    window.addEventListener('focusin', focus);
    return () => {
      window.clearTimeout(timer.current);
      window.removeEventListener('pointermove', pointer);
      window.removeEventListener('pointerdown', pointer);
      window.removeEventListener('keydown', key);
      window.removeEventListener('focusin', focus);
      document.documentElement.dataset.cinemaIdle = 'false';
    };
  }, [entered, cinema, overlay]);

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
      <button type="button" className="control-btn" aria-pressed={cinema} onClick={() => setState({ cinemaMode: !cinema })} title="Kino rejimi">
        <span aria-hidden="true">◧</span><span className="control-label">Kino</span>
      </button>
      <button type="button" className="control-btn" onClick={openPresenterWindow} title="Taqdimotchi oynasi (P)">
        <IconPresenter /><span className="control-label">Taqdimotchi</span>
      </button>
    </nav>
  );
}
