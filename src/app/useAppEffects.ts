import { useEffect } from 'react';
import { chapterById } from './chapters';
import { closeTopOverlay, getState, isReducedMotion, setState, subscribe, useReducedMotion, useStore } from './store';
import { installKeyboard } from '../lib/accessibility/keyboard';
import { toggleFullscreen } from '../lib/accessibility/fullscreen';
import { goEnd, goHome, goNext, goPrev } from '../lib/animation/navigator';
import { requestRefresh } from '../lib/animation/refresh';
import { ScrollTrigger } from '../lib/animation/gsap';
import { audio } from '../lib/audio/engine';
import { openChannel } from '../lib/presenter/channel';
import { announce } from '../lib/accessibility/announce';

/** Turns sound on/off. Safe to call from a key press (a user gesture). */
export async function setSound(on: boolean): Promise<void> {
  setState({ soundOn: on });
  if (on) {
    await audio.init();
    audio.setMuted(false);
    audio.setBed(chapterById(getState().chapterId).bed);
    announce('Ovoz yoqildi');
  } else {
    audio.setMuted(true);
    announce('Ovoz o‘chirildi');
  }
}

export function toggleSound(): void {
  void setSound(!getState().soundOn);
}

/** Reflects reduced motion on <html data-motion> and follows the OS setting. */
function useMotionAttribute(): void {
  const reduced = useReducedMotion();
  useEffect(() => {
    document.documentElement.dataset.motion = reduced ? 'reduced' : 'full';
    requestRefresh(60);
  }, [reduced]);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setState({ systemReducedMotion: mq.matches });
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
}

function useGlobalKeyboard(): void {
  useEffect(
    () =>
      installKeyboard(
        {
          next: goNext,
          prev: goPrev,
          home: goHome,
          end: goEnd,
          mute: toggleSound,
          fullscreen: () => void toggleFullscreen(),
          presenter: () => setState((s) => ({ presenterOpen: !s.presenterOpen })),
          sources: () => setState((s) => ({ sourcesOpen: !s.sourcesOpen, navOpen: false })),
          escape: () => {
            closeTopOverlay();
          },
        },
        () => getState().entered,
      ),
    [],
  );
}

/** Chapter → ambience bed; mute state → engine. */
function useAudioDirector(): void {
  const chapterId = useStore((s) => s.chapterId);
  const soundOn = useStore((s) => s.soundOn);
  useEffect(() => {
    if (soundOn) audio.setBed(chapterById(chapterId).bed);
  }, [chapterId, soundOn]);
}

/** Keeps a separate presenter window in sync and accepts its commands. */
function usePresenterSync(): void {
  useEffect(() => {
    const ch = openChannel((m) => {
      if (m.type === 'hello') {
        const s = getState();
        ch.post({ type: 'state', chapterId: s.chapterId, progress: s.progress, soundOn: s.soundOn });
      }
      if (m.type === 'command' && getState().entered) {
        ({ next: goNext, prev: goPrev, home: goHome, end: goEnd, mute: toggleSound })[m.action]();
      }
    });
    let last = '';
    const unsub = subscribe(() => {
      const s = getState();
      const key = `${s.chapterId}|${Math.round(s.progress * 200)}|${s.soundOn}`;
      if (key === last) return;
      last = key;
      ch.post({ type: 'state', chapterId: s.chapterId, progress: s.progress, soundOn: s.soundOn });
    });
    return () => {
      unsub();
      ch.close();
    };
  }, []);
}

const SCROLL_KEY = 'ormon:scroll';

export function savedScroll(): number {
  try {
    return Number(sessionStorage.getItem(SCROLL_KEY) ?? 0) || 0;
  } catch {
    return 0;
  }
}

export function clearSavedScroll(): void {
  try {
    sessionStorage.removeItem(SCROLL_KEY);
  } catch {
    /* storage may be unavailable */
  }
}

/** Manual scroll restoration: remember position, restore after entering. */
function useScrollMemory(): void {
  const entered = useStore((s) => s.entered);
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    let t = 0;
    const onScroll = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        if (!getState().entered) return;
        try {
          sessionStorage.setItem(SCROLL_KEY, String(Math.round(window.scrollY)));
        } catch {
          /* ignore */
        }
      }, 250);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    document.body.dataset.locked = entered ? 'false' : 'true';
    if (entered) requestRefresh(30);
  }, [entered]);
}

/** Recalculate pins after fonts load and on fullscreen changes. */
function useLayoutRefresh(): void {
  useEffect(() => {
    void document.fonts?.ready.then(() => ScrollTrigger.refresh());
    const onFs = () => requestRefresh(200);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);
}

export function useAppEffects(): void {
  useMotionAttribute();
  useGlobalKeyboard();
  useAudioDirector();
  usePresenterSync();
  useScrollMemory();
  useLayoutRefresh();
}

export { isReducedMotion };
