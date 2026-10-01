import type { ChapterId } from '../../app/chapters';

export type PresenterMessage =
  | { type: 'state'; chapterId: ChapterId; progress: number; soundOn: boolean }
  | { type: 'command'; action: 'next' | 'prev' | 'home' | 'end' | 'mute' }
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
  window.open(url.toString(), 'ormon-presenter', 'popup,width=980,height=720');
}
