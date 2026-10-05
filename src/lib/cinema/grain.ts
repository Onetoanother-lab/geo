import { mulberry32 } from '../forest/generate';

/**
 * One small film-grain tile, generated once and exposed as the `--grain` custom property.
 * It is a static image (never an animated filter): pure vector fills look sterile on a
 * projector, and a faint non-uniform speckle gives light, haze and shade a surface.
 */
export function installGrain(size = 192): void {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const image = ctx.createImageData(size, size);
    const rng = mulberry32(1969);
    for (let i = 0; i < size * size; i++) {
      // Mostly transparent; a minority of pixels are lighter or darker, softly clustered.
      const roll = rng();
      const light = roll > 0.5;
      const alpha = Math.pow(rng(), 2.2) * 62;
      image.data[i * 4] = light ? 255 : 0;
      image.data[i * 4 + 1] = light ? 250 : 0;
      image.data[i * 4 + 2] = light ? 238 : 0;
      image.data[i * 4 + 3] = alpha;
    }
    ctx.putImageData(image, 0, 0);
    document.documentElement.style.setProperty('--grain', `url(${canvas.toDataURL('image/png')})`);
  } catch {
    // No canvas (tests, locked-down browser): the scene simply stays clean.
  }
}
