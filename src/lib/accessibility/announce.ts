/** Polite screen-reader announcements through a single live region in the app shell. */
export function announce(message: string): void {
  const region = document.getElementById('live-region');
  if (!region) return;
  region.textContent = '';
  window.setTimeout(() => {
    region.textContent = message;
  }, 40);
}
