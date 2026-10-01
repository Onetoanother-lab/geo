import { useEffect, useState } from 'react';
import { CHAPTERS, chapterIndex } from '../../app/chapters';
import { useStore } from '../../app/store';
import { goChapter } from '../../lib/animation/navigator';

/** Thin right-edge progress line with chapter ticks (doubles as a mini navigator). */
export function ProgressRail() {
  const progress = useStore((s) => s.progress);
  const chapterId = useStore((s) => s.chapterId);
  const entered = useStore((s) => s.entered);
  const [ticks, setTicks] = useState<number[]>([]);

  useEffect(() => {
    const measure = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      setTicks(
        CHAPTERS.map((c) => {
          const el = document.querySelector<HTMLElement>(`[data-chapter="${c.id}"]`);
          if (!el) return 0;
          return Math.min(1, (el.getBoundingClientRect().top + window.scrollY) / max);
        }),
      );
    };
    measure();
    const t = window.setInterval(measure, 1500);
    window.addEventListener('resize', measure);
    return () => {
      window.clearInterval(t);
      window.removeEventListener('resize', measure);
    };
  }, [entered]);

  if (!entered) return null;
  const current = chapterIndex(chapterId);

  return (
    <nav className="progress-rail" aria-label="Boblar bo‘yicha taraqqiyot">
      <div className="rail-track" aria-hidden="true">
        <div className="rail-fill" style={{ transform: `scaleY(${progress})`, ["--p" as string]: progress }} />
      </div>
      <ol className="rail-ticks">
        {CHAPTERS.map((c, i) => (
          <li key={c.id} style={{ top: `${(ticks[i] ?? i / CHAPTERS.length) * 100}%` }}>
            <button
              type="button"
              className="rail-tick"
              data-state={i < current ? 'past' : i === current ? 'current' : 'future'}
              aria-current={i === current ? 'step' : undefined}
              onClick={() => goChapter(c.id)}
            >
              <span className="rail-tick-dot" aria-hidden="true" />
              <span className="rail-tick-label">
                <span className="rail-numeral">{c.numeral}</span> {c.title}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
