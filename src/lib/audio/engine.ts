/**
 * Procedural ambience engine (Web Audio). Everything is synthesized, so the
 * presentation needs no audio files and has no licensing issues. Optional
 * recorded loops listed in `manifest.ts` replace a bed when the file exists.
 *
 * Rules: never autoplay (init only after a user gesture), conservative volume,
 * every failure is silent.
 */
import { AUDIO_MANIFEST, type BedId } from './manifest';

export type { BedId };
type Bed = { gain: GainNode; stop: () => void };

const MASTER_LEVEL = 0.42;
const FADE = 2.2;

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private beds = new Map<BedId, Bed>();
  private current: BedId = 'none';
  private muted = true;
  private birdTimer: number | undefined;
  private noise: AudioBuffer | null = null;

  get available(): boolean {
    return typeof window !== 'undefined' && ('AudioContext' in window || 'webkitAudioContext' in window);
  }

  /** Must be called from a user gesture. */
  async init(): Promise<void> {
    if (this.ctx || !this.available) return;
    try {
      const Ctor: typeof AudioContext =
        window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.ratio.value = 3;
      this.master.connect(comp).connect(this.ctx.destination);
      this.noise = this.makeNoise(6);
      await this.ctx.resume();
    } catch {
      this.ctx = null;
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(muted ? 0 : MASTER_LEVEL, t, muted ? 0.25 : 0.9);
    if (!muted) void this.ctx.resume().catch(() => undefined);
    if (muted) this.stopBirds();
    else if (this.current === 'forest') this.scheduleBirds();
  }

  /** Crossfades to an ambience bed. */
  setBed(id: BedId): void {
    if (id === this.current && (id === 'none' || this.beds.has(id))) return;
    this.current = id;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    for (const [bedId, bed] of this.beds) {
      if (bedId !== id) {
        bed.gain.gain.cancelScheduledValues(t);
        bed.gain.gain.setTargetAtTime(0, t, FADE / 3);
      }
    }
    if (id === 'none') {
      this.stopBirds();
      return;
    }
    const bed = this.beds.get(id) ?? this.createBed(id);
    if (!bed) return;
    bed.gain.gain.cancelScheduledValues(t);
    bed.gain.gain.setTargetAtTime(1, t, FADE / 3);
    if (id === 'forest' && !this.muted) this.scheduleBirds();
    else this.stopBirds();
  }

  /** One-shot cues. */
  cue(name: 'treefall' | 'hush'): void {
    if (!this.ctx || !this.master || this.muted) return;
    if (name === 'treefall') this.treeFall();
  }

  // — Beds —

  private createBed(id: BedId): Bed | null {
    if (!this.ctx || !this.master || id === 'none') return null;
    const gain = this.ctx.createGain();
    gain.gain.value = 0;
    gain.connect(this.master);
    const stops: (() => void)[] = [];

    const file = AUDIO_MANIFEST[id];
    if (file) void this.tryFile(file, gain).then((stop) => stop && stops.push(stop));

    if (id === 'forest' || id === 'forest-thin') {
      // Leaves: pink noise through a band, slowly breathing.
      stops.push(this.noiseLayer(gain, { type: 'bandpass', freq: 900, q: 0.6, level: id === 'forest' ? 0.16 : 0.08, lfo: 0.07, depth: 0.5 }));
      stops.push(this.noiseLayer(gain, { type: 'lowpass', freq: 380, q: 0.4, level: 0.12, lfo: 0.03, depth: 0.4 }));
      if (id === 'forest') stops.push(this.insects(gain));
    }
    if (id === 'wind') {
      stops.push(this.noiseLayer(gain, { type: 'lowpass', freq: 520, q: 0.9, level: 0.26, lfo: 0.05, depth: 0.75, sweep: 380 }));
      stops.push(this.noiseLayer(gain, { type: 'bandpass', freq: 2400, q: 4, level: 0.03, lfo: 0.11, depth: 0.9 }));
    }
    if (id === 'room') {
      stops.push(this.noiseLayer(gain, { type: 'lowpass', freq: 220, q: 0.3, level: 0.08, lfo: 0.02, depth: 0.2 }));
    }
    const bed = { gain, stop: () => stops.forEach((s) => s()) };
    this.beds.set(id, bed);
    return bed;
  }

  private async tryFile(url: string, out: GainNode): Promise<(() => void) | null> {
    if (!this.ctx) return null;
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const buf = await this.ctx.decodeAudioData(await res.arrayBuffer());
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const g = this.ctx.createGain();
      g.gain.value = 0.8;
      src.connect(g).connect(out);
      src.start();
      return () => src.stop();
    } catch {
      return null;
    }
  }

  private noiseLayer(
    out: AudioNode,
    o: { type: BiquadFilterType; freq: number; q: number; level: number; lfo: number; depth: number; sweep?: number },
  ): () => void {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    src.playbackRate.value = 0.9 + Math.random() * 0.2;
    const filter = ctx.createBiquadFilter();
    filter.type = o.type;
    filter.frequency.value = o.freq;
    filter.Q.value = o.q;
    const g = ctx.createGain();
    g.gain.value = o.level;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = o.lfo;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = o.level * o.depth;
    lfo.connect(lfoGain).connect(g.gain);
    if (o.sweep) {
      const sweepGain = ctx.createGain();
      sweepGain.gain.value = o.sweep;
      lfo.connect(sweepGain).connect(filter.frequency);
    }
    src.connect(filter).connect(g).connect(out);
    src.start(ctx.currentTime, Math.random() * 4);
    lfo.start();
    return () => {
      src.stop();
      lfo.stop();
    };
  }

  private insects(out: AudioNode): () => void {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 4700;
    const am = ctx.createOscillator();
    am.frequency.value = 38;
    const amGain = ctx.createGain();
    amGain.gain.value = 0.006;
    const g = ctx.createGain();
    g.gain.value = 0.006;
    am.connect(amGain).connect(g.gain);
    const slow = ctx.createOscillator();
    slow.frequency.value = 0.05;
    const slowGain = ctx.createGain();
    slowGain.gain.value = 0.004;
    slow.connect(slowGain).connect(g.gain);
    osc.connect(g).connect(out);
    osc.start();
    am.start();
    slow.start();
    return () => {
      osc.stop();
      am.stop();
      slow.stop();
    };
  }

  private scheduleBirds(): void {
    this.stopBirds();
    const tick = () => {
      if (this.current !== 'forest' || this.muted) return;
      this.bird();
      this.birdTimer = window.setTimeout(tick, 2600 + Math.random() * 6500);
    };
    this.birdTimer = window.setTimeout(tick, 1800);
  }

  private stopBirds(): void {
    window.clearTimeout(this.birdTimer);
    this.birdTimer = undefined;
  }

  private bird(): void {
    const ctx = this.ctx;
    const bed = this.beds.get('forest');
    if (!ctx || !bed) return;
    const notes = 2 + Math.floor(Math.random() * 4);
    const base = 2300 + Math.random() * 1800;
    const pan = ctx.createStereoPanner();
    pan.pan.value = Math.random() * 1.6 - 0.8;
    pan.connect(bed.gain);
    let t = ctx.currentTime + 0.05;
    for (let i = 0; i < notes; i++) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      const g = ctx.createGain();
      const f = base * (1 + (Math.random() - 0.4) * 0.35);
      const len = 0.06 + Math.random() * 0.11;
      osc.frequency.setValueAtTime(f, t);
      osc.frequency.exponentialRampToValueAtTime(f * (0.75 + Math.random() * 0.6), t + len);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.035, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + len);
      osc.connect(g).connect(pan);
      osc.start(t);
      osc.stop(t + len + 0.02);
      t += len + 0.03 + Math.random() * 0.08;
    }
  }

  private treeFall(): void {
    const ctx = this.ctx!;
    const out = this.master!;
    const t0 = ctx.currentTime;
    // Creak: slow detuned saw through a narrow band.
    const creak = ctx.createOscillator();
    creak.type = 'sawtooth';
    creak.frequency.setValueAtTime(70, t0);
    creak.frequency.linearRampToValueAtTime(48, t0 + 1.4);
    const creakF = ctx.createBiquadFilter();
    creakF.type = 'bandpass';
    creakF.frequency.value = 420;
    creakF.Q.value = 8;
    const creakG = ctx.createGain();
    creakG.gain.setValueAtTime(0.0001, t0);
    creakG.gain.exponentialRampToValueAtTime(0.09, t0 + 0.4);
    creakG.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.5);
    creak.connect(creakF).connect(creakG).connect(out);
    creak.start(t0);
    creak.stop(t0 + 1.6);
    // Cracks: short bright noise bursts.
    for (let i = 0; i < 5; i++) {
      const at = t0 + 0.9 + i * (0.05 + Math.random() * 0.09);
      this.burst(out, at, 0.05, 'highpass', 1800, 0.22);
    }
    // Impact: low thump + debris.
    const thumpAt = t0 + 2.1;
    const thump = ctx.createOscillator();
    thump.type = 'sine';
    thump.frequency.setValueAtTime(70, thumpAt);
    thump.frequency.exponentialRampToValueAtTime(28, thumpAt + 0.6);
    const thumpG = ctx.createGain();
    thumpG.gain.setValueAtTime(0.0001, thumpAt);
    thumpG.gain.exponentialRampToValueAtTime(0.5, thumpAt + 0.02);
    thumpG.gain.exponentialRampToValueAtTime(0.0001, thumpAt + 0.9);
    thump.connect(thumpG).connect(out);
    thump.start(thumpAt);
    thump.stop(thumpAt + 1);
    this.burst(out, thumpAt, 1.4, 'lowpass', 700, 0.28);
  }

  private burst(out: AudioNode, at: number, len: number, type: BiquadFilterType, freq: number, level: number): void {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(level, at + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, at + len);
    src.connect(f).connect(g).connect(out);
    src.start(at, Math.random() * 3);
    src.stop(at + len + 0.05);
  }

  private makeNoise(seconds: number): AudioBuffer {
    const ctx = this.ctx!;
    const buf = ctx.createBuffer(2, ctx.sampleRate * seconds, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const data = buf.getChannelData(c);
      // Paul Kellet's pink-noise approximation.
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    }
    return buf;
  }
}

export const audio = new AudioEngine();
