import { useEffect, useRef } from 'react';
import { mulberry32 } from '../../../lib/forest/generate';
import { useReducedMotion } from '../../../app/store';

type Props = {
  count?: number;
  /** CSS colour of the motes. */
  color?: string;
  /** Drift in px/s. */
  wind?: { x: number; y: number };
  /** 0..1 multiplier, can be driven from a timeline via the `data-intensity` attribute. */
  intensity?: number;
  className?: string;
  seed?: number;
  size?: [number, number];
  /**
   * Motes show only inside these light bands (scene coordinates of a 1600×900 viewBox,
   * `slice`d like the forest SVGs; `slope` is x travelled per unit of y). Without it they show everywhere.
   */
  light?: { bands: { x: number; w: number; strength: number }[]; slope: number; /** No motes below this scene y (e.g. the ground line of a cross-section). */ maxY?: number };
};

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

type Mote = { x: number; y: number; r: number; phase: number; speed: number; depth: number };

/**
 * Low-cost atmospheric particles (dust, pollen, salt). Canvas 2D, ≤ ~90 motes,
 * DPR capped at 1.5, paused when offscreen/hidden, static in reduced motion.
 * The visible amount can be changed from GSAP by tweening `--intensity`-like
 * attribute `data-intensity` on the canvas (read every frame).
 */
export function DustField({ count = 60, color = '#f3dfae', wind = { x: 6, y: -3 }, intensity = 1, className, seed = 7, size = [0.6, 2.2], light }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const [s0, s1] = size;
  const bands = light?.bands;
  const slope = light?.slope ?? 0;
  const maxY = light?.maxY ?? Infinity;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rng = mulberry32(seed);
    const isSmall = window.matchMedia('(max-width: 700px)').matches;
    const n = Math.round(count * (isSmall ? 0.45 : 1));
    let w = 0;
    let h = 0;
    let motes: Mote[] = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!motes.length)
        motes = Array.from({ length: n }, () => ({
          x: rng() * w,
          y: rng() * h,
          r: s0 + rng() * (s1 - s0),
          phase: rng() * Math.PI * 2,
          speed: 0.4 + rng() * 0.9,
          depth: 0.3 + rng() * 0.7,
        }));
    };
    resize();

    let raf = 0;
    let last = performance.now();
    let visible = true;

    // The scene SVGs are `xMidYMax slice`d; band geometry must follow the same mapping.
    const lightAt = (px: number, py: number): number => {
      if (!bands) return 1;
      const s = Math.max(w / 1600, h / 900);
      const sx = (px - (w - 1600 * s) / 2) / s;
      const sy = (py - (h - 900 * s)) / s;
      if (sy > maxY) return 0;
      let best = 0;
      for (const b of bands) {
        const edge = Math.abs(sx - (b.x + slope * (sy + 80))) / (b.w * 0.62);
        best = Math.max(best, b.strength * (1 - smooth(0.3, 1, edge)));
      }
      return best;
    };

    const draw = (dt: number) => {
      const k = Number(canvas.dataset.intensity ?? intensity);
      ctx.clearRect(0, 0, w, h);
      if (k <= 0.01) return;
      ctx.fillStyle = color;
      const shown = Math.round(motes.length * Math.min(1, k));
      for (let i = 0; i < shown; i++) {
        const m = motes[i];
        if (!reduced) {
          m.x += wind.x * m.speed * m.depth * dt * Math.max(0.6, k);
          m.y += (wind.y * m.speed + Math.sin(m.phase) * 4) * m.depth * dt;
          m.phase += dt * 0.6;
          if (m.x > w + 10) m.x = -10;
          if (m.x < -10) m.x = w + 10;
          if (m.y < -10) m.y = h + 10;
          if (m.y > h + 10) m.y = -10;
        }
        const lit = lightAt(m.x, m.y);
        if (lit < 0.03) continue;
        ctx.globalAlpha = (0.25 + 0.55 * (0.5 + 0.5 * Math.sin(m.phase * 1.3))) * m.depth * Math.min(1, k) * lit;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r * m.depth, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      draw(dt);
      if (visible && !reduced && !document.hidden) raf = requestAnimationFrame(loop);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      if (reduced) draw(0);
      else raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else cancelAnimationFrame(raf);
    });
    io.observe(canvas);
    const onVis = () => (document.hidden ? cancelAnimationFrame(raf) : visible && start());
    document.addEventListener('visibilitychange', onVis);
    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) draw(0);
    });
    ro.observe(canvas);
    // Redraw static frame when intensity changes in reduced mode.
    const mo = new MutationObserver(() => reduced && draw(0));
    mo.observe(canvas, { attributes: true, attributeFilter: ['data-intensity'] });
    start();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [count, color, wind.x, wind.y, intensity, reduced, seed, s0, s1, bands, slope, maxY]);

  return <canvas ref={ref} className={className} aria-hidden="true" data-intensity={intensity} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
}
