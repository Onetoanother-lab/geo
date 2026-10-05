import type { ChapterId } from '../../app/chapters';

export type PresenterSnapshot = {
  type: 'state'; chapterId: ChapterId; progress: number; soundOn: boolean;
  chapterProgress: number; currentBeat: string; startedAt: number | null;
  resolution: [number, number]; reduced: boolean;
};

export type PresenterMessage =
  | PresenterSnapshot
  | { type: 'command'; action: 'next' | 'prev' | 'home' | 'end' | 'mute' | 'audio-check' }
  | { type: 'calibrate'; lift: number }
  | { type: 'hello' };

const NAME = 'ormon-presenter';

/** BroadcastChannel wrapper (no-op where unsupported). */
export function openChannel(onMessage: (m: PresenterMessage) => void): { post: (m: PresenterMessage) => void; close: () => void } {
  if (typeof BroadcastChannel === 'undefined') return { post: () => undefined, close: () => undefined };
  const ch = new BroadcastChannel(NAME);
  ch.onmessage = (e: MessageEvent<PresenterMessage>) => onMessage(e.data);
  return { post: (m) => ch.postMessage(m), close: () => ch.close() };
}

export function openPresenterWindow(): void {
  const url = new URL(window.location.href);
  url.search = '?presenter';
  url.hash = '';
  const opened = window.open(url.toString(), 'ormon-presenter', 'popup,width=1100,height=800');
  if (opened) opened.focus();
}
