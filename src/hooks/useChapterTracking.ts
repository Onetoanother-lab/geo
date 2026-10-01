import { useEffect } from 'react';
import { CHAPTER_IDS, type ChapterId } from '../app/chapters';
import { getState, setState } from '../app/store';

/**
 * One rAF-throttled scroll listener for the whole document: updates the
 * current chapter (the section crossing the viewport centre) and progress.
 */
export function useChapterTracking(): void {
  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, window.scrollY / max));
      const mid = window.innerHeight * 0.5;
      let current: ChapterId = getState().chapterId;
      for (const id of CHAPTER_IDS) {
        const el = document.querySelector<HTMLElement>(`[data-chapter="${id}"]`);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) {
          current = id;
          break;
        }
      }
      setState({ progress, chapterId: current });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    measure();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
}
