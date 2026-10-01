export type KeyAction =
  | 'next'
  | 'prev'
  | 'home'
  | 'end'
  | 'mute'
  | 'fullscreen'
  | 'presenter'
  | 'sources'
  | 'escape';

const EDITABLE = 'input, textarea, select, [contenteditable=""], [contenteditable="true"]';

/** Elements that own their arrow keys (sliders, the simulator grid, dialogs). */
const LOCAL_KEYS = '[data-local-keys], [role="dialog"], [role="grid"], [role="radiogroup"], [role="listbox"]';

/**
 * Maps a keyboard event to a global presentation action, or null when the key
 * belongs to the focused control. Pure: no side effects, easy to unit test.
 */
export function keyToAction(e: Pick<KeyboardEvent, 'key' | 'shiftKey' | 'ctrlKey' | 'metaKey' | 'altKey' | 'target' | 'defaultPrevented'>): KeyAction | null {
  if (e.defaultPrevented) return null;
  if (e.key === 'Escape') return 'escape';
  if (e.ctrlKey || e.metaKey || e.altKey) return null;

  const target = e.target instanceof Element ? e.target : null;
  if (target?.closest(EDITABLE)) return null;
  const local = target?.closest(LOCAL_KEYS);

  switch (e.key) {
    case 'ArrowDown':
    case 'PageDown':
      return local ? null : 'next';
    case 'ArrowUp':
    case 'PageUp':
      return local ? null : 'prev';
    case ' ':
    case 'Spacebar':
      if (local || target?.closest('button, a, summary, [role="button"]')) return null;
      return e.shiftKey ? 'prev' : 'next';
    case 'Home':
      return local ? null : 'home';
    case 'End':
      return local ? null : 'end';
    case 'm':
    case 'M':
      return 'mute';
    case 'f':
    case 'F':
      return 'fullscreen';
    case 'p':
    case 'P':
      return 'presenter';
    case 's':
    case 'S':
      return 'sources';
    default:
      return null;
  }
}

export type KeyHandlers = Record<KeyAction, () => void>;

/** Installs the global key listener; returns an uninstaller. */
export function installKeyboard(handlers: KeyHandlers, isEnabled: () => boolean = () => true): () => void {
  const onKey = (e: KeyboardEvent) => {
    const action = keyToAction(e);
    if (!action) return;
    if (action !== 'escape' && !isEnabled()) return;
    if (action === 'next' || action === 'prev' || action === 'home' || action === 'end') e.preventDefault();
    handlers[action]();
  };
  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);
}
