/**
 * Beat registry — the presentation's "slides" inside a continuous scroll.
 * Scenes register functions returning absolute scroll positions; the navigator
 * walks them with the keyboard. Positions are resolved lazily so they stay
 * correct after ScrollTrigger refreshes (resize, fullscreen, font load).
 */
export type Beat = { id: string; chapter: string; y: number };
type BeatSource = { chapter: string; resolve: () => Omit<Beat, 'chapter'>[] };

const sources = new Map<string, BeatSource>();

export function registerBeats(key: string, chapter: string, resolve: BeatSource['resolve']): () => void {
  sources.set(key, { chapter, resolve });
  return () => {
    if (sources.get(key)?.resolve === resolve) sources.delete(key);
  };
}

export function allBeats(): Beat[] {
  const beats: Beat[] = [];
  for (const { chapter, resolve } of sources.values()) {
    for (const b of resolve()) {
      if (Number.isFinite(b.y)) beats.push({ ...b, chapter, y: Math.max(0, Math.round(b.y)) });
    }
  }
  beats.sort((a, b) => a.y - b.y);
  // Collapse beats closer than a few pixels so a key press always moves.
  return beats.filter((b, i) => i === 0 || b.y - beats[i - 1].y > 8);
}

/** Next beat strictly after `from` (with a small tolerance). */
export function nextBeat(from: number, beats = allBeats()): Beat | undefined {
  return beats.find((b) => b.y > from + 12);
}

/** Previous beat strictly before `from`. */
export function prevBeat(from: number, beats = allBeats()): Beat | undefined {
  for (let i = beats.length - 1; i >= 0; i--) if (beats[i].y < from - 12) return beats[i];
  return undefined;
}

export function nearestBeat(from: number, beats = allBeats()): Beat | undefined {
  let best: Beat | undefined;
  for (const b of beats) if (!best || Math.abs(b.y - from) < Math.abs(best.y - from)) best = b;
  return best;
}

export function firstBeatOfChapter(chapter: string, beats = allBeats()): Beat | undefined {
  return beats.find((b) => b.chapter === chapter);
}

/** Test helper. */
export function clearBeats(): void {
  sources.clear();
}
