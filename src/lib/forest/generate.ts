/**
 * Seeded procedural vegetation. All shapes are original, generated at runtime,
 * deterministic per seed (so SSR/tests/refreshes produce identical scenes).
 * Paths are in local coordinates: base of trunk at (0,0), growing towards -y.
 */

export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const range = (rng: Rng, min: number, max: number) => min + (max - min) * rng();
const r1 = (n: number) => Math.round(n * 10) / 10;

export type TreeKind = 'conifer' | 'broadleaf' | 'poplar';

export function coniferPath(h: number, w: number, rng: Rng): string {
  const tiers = Math.max(4, Math.round(h / 28 + rng() * 3));
  const trunkW = Math.max(1.5, w * 0.06);
  const right: [number, number][] = [];
  const left: [number, number][] = [];
  const crownBottom = -h * range(rng, 0.1, 0.18);
  for (let i = 0; i < tiers; i++) {
    const t = (i + 1) / tiers;
    const y = -h + (h + crownBottom) * t;
    const half = (w / 2) * Math.pow(t, 0.85) * range(rng, 0.82, 1.08);
    const notch = (w / 2) * Math.pow(t, 0.85) * range(rng, 0.35, 0.55);
    const droop = range(rng, 2, 7) * (h / 200);
    right.push([half, y + droop], [notch, y - (h / tiers) * 0.18]);
    left.push([-half * range(rng, 0.88, 1.06), y + droop * range(rng, 0.6, 1.3)], [-notch, y - (h / tiers) * 0.2]);
  }
  let d = `M0,${r1(-h)}`;
  for (const [x, y] of right) d += `L${r1(x)},${r1(y)}`;
  d += `L${r1(trunkW)},${r1(crownBottom)}L${r1(trunkW * 1.3)},0L${r1(-trunkW * 1.3)},0L${r1(-trunkW)},${r1(crownBottom)}`;
  for (let i = left.length - 1; i >= 0; i--) d += `L${r1(left[i][0])},${r1(left[i][1])}`;
  return d + 'Z';
}

function circle(cx: number, cy: number, r: number): string {
  return `M${r1(cx - r)},${r1(cy)}a${r1(r)},${r1(r)} 0 1,1 ${r1(r * 2)},0a${r1(r)},${r1(r)} 0 1,1 ${r1(-r * 2)},0`;
}

/** A tapered, gently curved limb from (x0,y0) to (x1,y1); w0 is the half-width at the base. */
function limb(x0: number, y0: number, x1: number, y1: number, w0: number, bend: number): string {
  const mx = (x0 + x1) / 2 + bend;
  const my = (y0 + y1) / 2;
  return `M${r1(x0 - w0)},${r1(y0)}Q${r1(mx - w0 * 0.55)},${r1(my)} ${r1(x1 - 1.1)},${r1(y1)}L${r1(x1 + 1.1)},${r1(y1)}Q${r1(mx + w0 * 0.55)},${r1(my)} ${r1(x0 + w0)},${r1(y0)}Z`;
}

export function broadleafPath(h: number, w: number, rng: Rng): string {
  const trunkTop = -h * range(rng, 0.42, 0.55);
  const tw = Math.max(2, w * 0.07);
  // Trunk with a root flare, then three limbs that carry the crown.
  let d = `M${r1(-tw * 1.9)},0Q${r1(-tw * 1.05)},${r1(trunkTop * 0.12)} ${r1(-tw * 0.95)},${r1(trunkTop * 0.5)}L${r1(-tw * 0.85)},${r1(trunkTop)}L${r1(tw * 0.85)},${r1(trunkTop)}L${r1(tw * 0.95)},${r1(trunkTop * 0.5)}Q${r1(tw * 1.05)},${r1(trunkTop * 0.12)} ${r1(tw * 1.9)},0Z`;
  d += limb(-tw * 0.5, trunkTop * 0.96, -w * range(rng, 0.1, 0.18), trunkTop * range(rng, 1.3, 1.42), tw * 0.8, -w * 0.02);
  d += limb(tw * 0.5, trunkTop * 0.96, w * range(rng, 0.12, 0.2), trunkTop * range(rng, 1.32, 1.46), tw * 0.8, w * 0.02);
  d += limb(0, trunkTop * 0.98, range(rng, -0.05, 0.05) * w, trunkTop * range(rng, 1.5, 1.62), tw * 0.7, 0);
  // One side branch low on the trunk.
  const side = rng() < 0.5 ? -1 : 1;
  d += limb(side * tw * 0.7, trunkTop * 0.55, side * w * 0.2, trunkTop * 0.7, tw * 0.45, side * w * 0.02);

  // The crown is a lumpy mass: many blobs of very different size, biggest toward the middle,
  // so the edge is irregular at several scales instead of a row of equal scallops. A skirt of
  // blobs along the lower rim keeps the crown joined to its limbs.
  const cy = -h + w * 0.46;
  const blobs = 22 + Math.floor(rng() * 8);
  for (let i = 0; i < blobs; i++) {
    const a = rng() * Math.PI * 2;
    const rad = Math.sqrt(rng()) * range(rng, 0.4, 0.52);
    const rr = range(rng, 0.07, 0.21) * w * (1 - rad * 0.5);
    d += circle(Math.cos(a) * rad * w * 1.2, cy + Math.sin(a) * rad * w * 0.9 + w * 0.08, rr);
  }
  for (let i = 0; i < 7; i++) {
    const a = Math.PI * (0.12 + (i / 6) * 0.76) + range(rng, -0.1, 0.1);
    d += circle(Math.cos(a) * w * range(rng, 0.3, 0.44), cy + w * 0.08 + Math.sin(a) * w * range(rng, 0.36, 0.46), range(rng, 0.08, 0.15) * w);
  }
  d += circle(0, cy, w * 0.3);
  d += circle(range(rng, -0.12, 0.12) * w, cy - w * 0.06, w * 0.26);
  // A dense lower belly, so the crown never shows sky between its skirt and its limbs.
  d += circle(0, cy + w * 0.22, w * 0.3);
  d += circle(-w * 0.2, cy + w * 0.16, w * 0.22);
  d += circle(w * 0.2, cy + w * 0.18, w * 0.22);
  // A few detached leaf clumps at the edge.
  for (let i = 0; i < 5; i++) {
    const a = Math.PI * range(rng, 0.05, 1.95);
    d += circle(Math.cos(a) * w * range(rng, 0.46, 0.56), cy + Math.sin(a) * w * range(rng, 0.3, 0.4), range(rng, 0.035, 0.07) * w);
  }
  return d;
}

export function poplarPath(h: number, w: number, rng: Rng): string {
  const tw = Math.max(1.5, w * 0.08);
  let d = `M${r1(-tw)},0L${r1(-tw * 0.6)},${r1(-h * 0.25)}L${r1(tw * 0.6)},${r1(-h * 0.25)}L${r1(tw)},0Z`;
  const segs = 6;
  for (let i = 0; i < segs; i++) {
    const t = i / (segs - 1);
    const cy = -h * (0.32 + t * 0.6);
    const rx = (w / 2) * Math.sin(Math.PI * (0.25 + t * 0.7)) * range(rng, 0.85, 1.1);
    d += `M${r1(-rx)},${r1(cy)}a${r1(rx)},${r1(h * 0.13)} 0 1,1 ${r1(rx * 2)},0a${r1(rx)},${r1(h * 0.13)} 0 1,1 ${r1(-rx * 2)},0`;
  }
  return d;
}

export function treePath(kind: TreeKind, h: number, w: number, rng: Rng): string {
  if (kind === 'conifer') return coniferPath(h, w, rng);
  if (kind === 'poplar') return poplarPath(h, w, rng);
  return broadleafPath(h, w, rng);
}

export function stumpPath(w: number, rng: Rng): string {
  const sw = Math.max(3, w * 0.11);
  const sh = sw * range(rng, 1.1, 1.8);
  return `M${r1(-sw * 1.4)},0L${r1(-sw)},${r1(-sh)}L${r1(-sw * 0.3)},${r1(-sh * 1.15)}L${r1(sw * 0.2)},${r1(-sh * 0.9)}L${r1(sw)},${r1(-sh * 1.05)}L${r1(sw * 1.4)},0Z`;
}

/** Saxaul (Haloxylon): a low, gnarled desert shrub with sparse green twigs. */
export function saxaulPaths(h: number, w: number, rng: Rng): { stems: string; tufts: string } {
  let stems = '';
  let tufts = '';
  const n = 4 + Math.floor(rng() * 4);
  for (let i = 0; i < n; i++) {
    const spread = (i / (n - 1) - 0.5) * w;
    const midX = spread * range(rng, 0.3, 0.6);
    const midY = -h * range(rng, 0.35, 0.55);
    const endX = spread * range(rng, 0.8, 1.1);
    const endY = -h * range(rng, 0.75, 1);
    const t = Math.max(0.8, w * 0.025);
    stems += `M${r1(-t)},0Q${r1(midX - t)},${r1(midY)} ${r1(endX)},${r1(endY)}Q${r1(midX + t)},${r1(midY)} ${r1(t)},0Z`;
    const tuftCount = 3 + Math.floor(rng() * 4);
    for (let k = 0; k < tuftCount; k++) {
      const tx = endX + range(rng, -w * 0.14, w * 0.14);
      const ty = endY + range(rng, -h * 0.05, h * 0.22);
      tufts += circle(tx, ty, range(rng, w * 0.05, w * 0.11));
    }
  }
  return { stems, tufts };
}

export type GeneratedTree = {
  id: number;
  x: number;
  y: number;
  h: number;
  w: number;
  kind: TreeKind;
  d: string;
  stump: string;
  /** 0..1 random, used for clearing order / staggering. */
  order: number;
};

export type LayerSpec = {
  seed: number;
  count: number;
  width?: number;
  baseY: number;
  /** Vertical scatter of trunk bases (depth within the layer). */
  baseJitter?: number;
  minH: number;
  maxH: number;
  /** Width relative to height. */
  aspect?: [number, number];
  mix?: Partial<Record<TreeKind, number>>;
  /** Leave an empty band (for a path, river or the hero tree) between these x values. */
  gaps?: [number, number][];
  /** 0..1: pull trunks into groves with glades between them (0 = even rows). */
  clump?: number;
  /** Maximum trunk lean in px per 100 px of height. */
  lean?: number;
};

function pickKind(rng: Rng, mix: Partial<Record<TreeKind, number>>): TreeKind {
  const entries = Object.entries(mix) as [TreeKind, number][];
  const total = entries.reduce((s, [, v]) => s + v, 0);
  let roll = rng() * total;
  for (const [k, v] of entries) {
    roll -= v;
    if (roll <= 0) return k;
  }
  return entries[0]?.[0] ?? 'conifer';
}

export function generateLayer(spec: LayerSpec): GeneratedTree[] {
  const rng = mulberry32(spec.seed);
  const width = spec.width ?? 1600;
  const mix = spec.mix ?? { conifer: 0.6, broadleaf: 0.4 };
  const [aMin, aMax] = spec.aspect ?? [0.32, 0.5];
  const clump = spec.clump ?? 0;
  const lean = spec.lean ?? 0;
  const trees: GeneratedTree[] = [];
  const step = (width + 200) / spec.count;
  // Groves: a few seeded centres pull trunks together, leaving glades between them.
  const centres = clump > 0
    ? Array.from({ length: Math.max(2, Math.ceil(spec.count / 8)) }, () => ({ x: range(rng, -100, width + 100), size: range(rng, 0.78, 1.18) }))
    : [];
  for (let i = 0; i < spec.count; i++) {
    let x = -100 + i * step + range(rng, -step * 0.45, step * 0.45);
    let grove = 1;
    if (centres.length) {
      const near = centres.reduce((best, c) => (Math.abs(c.x - x) < Math.abs(best.x - x) ? c : best));
      x += (near.x + range(rng, -step * 1.6, step * 1.6) - x) * clump * 0.7;
      grove = 1 + (near.size - 1) * clump;
    }
    if (spec.gaps?.some(([a, b]) => x > a && x < b)) continue;
    const h = range(rng, spec.minH, spec.maxH) * grove;
    const kind = pickKind(rng, mix);
    const w = h * range(rng, aMin, aMax) * (kind === 'broadleaf' ? 1.5 : kind === 'poplar' ? 0.7 : 1);
    const y = spec.baseY + range(rng, 0, spec.baseJitter ?? 0);
    const lilt = lean ? range(rng, -lean, lean) / 100 : 0;
    const d = treePath(kind, h, w, rng);
    trees.push({ id: i, x, y, h, w, kind, d: lilt ? shearPath(d, lilt) : d, stump: stumpPath(w, rng), order: rng() });
  }
  // Paint far-to-near within the layer.
  return trees.sort((a, b) => a.y - b.y);
}

/** Merges a layer into one path string (one DOM node per layer = cheap). */
export function mergeLayer(trees: GeneratedTree[]): string {
  return trees.map((t) => translatePath(t.d, t.x, t.y)).join('');
}

/**
 * Splits a layer into a few tonal groups, each one merged path. Each group gets its
 * own fill, so a layer reads as individual trees rather than one stencil.
 */
export function mergeLayerTones(trees: GeneratedTree[], tones = 3): string[] {
  const groups: GeneratedTree[][] = Array.from({ length: tones }, () => []);
  for (const t of trees) groups[Math.min(tones - 1, Math.floor(t.order * tones))].push(t);
  return groups.map(mergeLayer);
}

/** Shears a local tree path so its trunk leans: x grows with height above the base. */
export function shearPath(d: string, lean: number): string {
  return d.replace(/([MLQ])([^MLQZa]+)/g, (_m, cmd: string, args: string) => {
    const nums = args.trim().split(/[\s,]+/).map(Number);
    const out: string[] = [];
    for (let i = 0; i < nums.length; i += 2) out.push(`${r1(nums[i] - nums[i + 1] * lean)},${r1(nums[i + 1])}`);
    return cmd + out.join(' ');
  });
}

/** A pointed leaf blade from (0,0) toward +x. */
export function leafPath(len: number, wid: number): string {
  return `M0,0Q${r1(len * 0.35)},${r1(-wid)} ${r1(len)},0Q${r1(len * 0.35)},${r1(wid * 0.8)} 0,0Z`;
}

/**
 * A branch entering the frame from a corner: a tapering limb plus leaf clusters.
 * Coordinates are in the 1600×900 scene space; `dir` is +1 for the left edge, -1 for the right.
 */
export function overhangBranch(seed: number, x0: number, y0: number, dir: 1 | -1, reach: number, droop: number): { limb: string; leaves: string; twigs: string } {
  const rng = mulberry32(seed);
  const pts: [number, number][] = [];
  const steps = 7;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    pts.push([x0 + dir * reach * t + range(rng, -6, 6), y0 + droop * Math.pow(t, 1.6) + Math.sin(t * 5 + seed) * 10]);
  }
  const wBase = 34;
  let top = `M${r1(pts[0][0])},${r1(pts[0][1] - wBase)}`;
  let bottom = '';
  for (let i = 1; i <= steps; i++) {
    const w = Math.max(1.2, wBase * (1 - i / steps) ** 1.4);
    top += `L${r1(pts[i][0])},${r1(pts[i][1] - w)}`;
    bottom = `L${r1(pts[i][0])},${r1(pts[i][1] + w)}` + bottom;
  }
  const limb = top + bottom + `L${r1(pts[0][0])},${r1(pts[0][1] + wBase)}Z`;
  let leaves = '';
  let twigs = '';
  for (let i = 2; i <= steps; i++) {
    const [px, py] = pts[i];
    const clusters = 2 + Math.floor(rng() * 2);
    for (let c = 0; c < clusters; c++) {
      const a = range(rng, -1.15, 1.15) + (dir === 1 ? 0 : Math.PI);
      const l = range(rng, 70, 150) * (1.1 - i / (steps * 1.6));
      const ex = px + Math.cos(a) * l * 0.6;
      const ey = py + Math.sin(a) * l * 0.6 + 40;
      twigs += `M${r1(px)},${r1(py)}L${r1(ex)},${r1(ey)}`;
      for (let k = 0; k < 6; k++) {
        const la = a + range(rng, -1.2, 1.2);
        const leaf = leafPath(range(rng, 46, 96), range(rng, 12, 24));
        const lx = ex + range(rng, -22, 22);
        const ly = ey + range(rng, -22, 22);
        leaves += rotateTranslate(leaf, lx, ly, la);
      }
    }
  }
  return { limb, leaves, twigs };
}

/** Rotates then translates a local path (absolute M/L/Q only). */
export function rotateTranslate(d: string, x: number, y: number, angle: number): string {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return d.replace(/([MLQ])([^MLQZa]+)/g, (_m, cmd: string, args: string) => {
    const nums = args.trim().split(/[\s,]+/).map(Number);
    const out: string[] = [];
    for (let i = 0; i < nums.length; i += 2) out.push(`${r1(nums[i] * cos - nums[i + 1] * sin + x)},${r1(nums[i] * sin + nums[i + 1] * cos + y)}`);
    return cmd + out.join(' ');
  });
}

/** Wraps a local path so it renders at (x,y) without a transform attribute. */
export function translatePath(d: string, x: number, y: number): string {
  // Absolute commands (M, L, Q, Z) are offset; relative arcs (a) stay relative.
  return d.replace(/([MLQ])([^MLQZa]+)/g, (_m, cmd: string, args: string) => {
    const nums = args
      .trim()
      .split(/[\s,]+/)
      .map(Number);
    const out: string[] = [];
    for (let i = 0; i < nums.length; i += 2) out.push(`${r1(nums[i] + x)},${r1(nums[i + 1] + y)}`);
    return cmd + out.join(' ');
  });
}

/** A soft ridge line across the width, for distant hills/ground bands. */
export function ridgePath(seed: number, baseY: number, amp: number, width = 1600, height = 900, points = 14): string {
  const rng = mulberry32(seed);
  const step = width / (points - 1);
  let d = `M0,${height}L0,${r1(baseY + range(rng, -amp, amp))}`;
  let prevX = 0;
  let prevY = baseY;
  for (let i = 1; i < points; i++) {
    const x = i * step;
    const y = baseY + range(rng, -amp, amp);
    const cx = (prevX + x) / 2;
    d += `Q${r1(prevX + step * 0.5)},${r1(prevY)} ${r1(cx)},${r1((prevY + y) / 2)}`;
    prevX = x;
    prevY = y;
  }
  return d + `L${width},${r1(prevY)}L${width},${height}Z`;
}

/** Closed Catmull-Rom spline through points → smooth cubic Bézier path. */
export function smoothClosed(points: [number, number][], tension = 0.5): string {
  const n = points.length;
  const p = (i: number) => points[(i + n) % n];
  let d = `M${p(0)[0]},${p(0)[1]}`;
  for (let i = 0; i < n; i++) {
    const [x0, y0] = p(i - 1);
    const [x1, y1] = p(i);
    const [x2, y2] = p(i + 1);
    const [x3, y3] = p(i + 2);
    const c1x = x1 + ((x2 - x0) / 6) * tension * 2;
    const c1y = y1 + ((y2 - y0) / 6) * tension * 2;
    const c2x = x2 - ((x3 - x1) / 6) * tension * 2;
    const c2y = y2 - ((y3 - y1) / 6) * tension * 2;
    d += `C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${x2},${y2}`;
  }
  return d + 'Z';
}

/** Parses "M x,y L x,y …" polygon strings into points. */
export function polygonPoints(d: string): [number, number][] {
  return (d.match(/-?\d+(\.\d+)?,-?\d+(\.\d+)?/g) ?? []).map((pair) => pair.split(',').map(Number) as [number, number]);
}
