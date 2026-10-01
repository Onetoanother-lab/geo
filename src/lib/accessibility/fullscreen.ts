export function isFullscreen(): boolean {
  return Boolean(document.fullscreenElement);
}

/** Toggles fullscreen where the browser allows it; silently ignores refusals. */
export async function toggleFullscreen(): Promise<void> {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen?.({ navigationUI: 'hide' });
  } catch {
    /* Browsers may refuse without a user gesture — never break the presentation. */
  }
}
