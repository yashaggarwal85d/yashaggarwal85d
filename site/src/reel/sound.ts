import { BAR, BEAT, LOOP } from './anim';
import { sceneAt } from './scenes';

/**
 * A tiny WebAudio drum machine locked to the reel clock. Off until the viewer
 * turns it on (browsers need a gesture anyway). Notes are scheduled slightly
 * ahead on the audio clock so they land exactly on the beat.
 */
const STEP = BEAT / 2; // 8th notes
const LOOKAHEAD = 0.12;

type Hit = { kick?: number; snare?: number; hat?: number; crash?: number };

/** What plays on a given 8th-note step of the loop. */
function pattern(step: number): Hit {
  const stepsPerBar = BAR / STEP;
  const time = (step * STEP) % LOOP;
  const scene = sceneAt(time);
  const local = time - scene.start;
  const s = step % stepsPerBar; // 0..7
  const onBeat = s % 2 === 0;
  const beat = s / 2;

  // The spinning top: ticks only, then silence before the loop.
  if (scene.id === 'loop') return s < 5 ? { hat: 0.25 } : {};
  // Half-time under the black hole.
  if (scene.id === 'black-hole') {
    if (s === 0) return { kick: 1, crash: local < 0.01 ? 0.5 : 0 };
    if (s === 4) return { snare: 0.7 };
    return onBeat ? { hat: 0.25 } : {};
  }
  const hitOut: Hit = {};
  if (onBeat) hitOut.kick = beat === 0 ? 1 : 0.85;
  else hitOut.hat = 0.45;
  if (beat === 1 || beat === 3) hitOut.snare = s % 2 === 0 ? 0.8 : 0;
  if (s === 0 && local < 0.01 && ['cold-open', 'journey', 'domain', 'hours', 'shortlist', 'cta'].includes(scene.id)) hitOut.crash = 0.6;
  return hitOut;
}

export class BeatSynth {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private lastStep = -1;
  enabled = false;

  async enable() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.55;
      this.master.connect(this.ctx.destination);
      const len = this.ctx.sampleRate;
      this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    }
    await this.ctx.resume();
    this.enabled = true;
    this.lastStep = -1;
  }

  disable() {
    this.enabled = false;
    this.ctx?.suspend();
  }

  /** Forget what was scheduled (after a seek or pause). */
  resync() {
    this.lastStep = -1;
  }

  /** Call every frame with the absolute reel time (loops × 48 + t). */
  tick(absTime: number, playing: boolean) {
    const ctx = this.ctx;
    if (!ctx || !this.enabled || !playing) return;
    const first = this.lastStep < 0 ? Math.ceil(absTime / STEP - 1e-6) : this.lastStep + 1;
    for (let step = first; step * STEP <= absTime + LOOKAHEAD; step++) {
      const when = ctx.currentTime + Math.max(0, step * STEP - absTime);
      const h = pattern(step);
      if (h.kick) this.kick(when, h.kick);
      if (h.snare) this.snare(when, h.snare);
      if (h.hat) this.hat(when, h.hat);
      if (h.crash) this.crash(when, h.crash);
      this.lastStep = step;
    }
  }

  private env(when: number, peak: number, decay: number) {
    const g = this.ctx!.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(peak, when + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, when + decay);
    g.connect(this.master!);
    return g;
  }

  private kick(when: number, v: number) {
    const o = this.ctx!.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(150, when);
    o.frequency.exponentialRampToValueAtTime(42, when + 0.16);
    o.connect(this.env(when, 0.9 * v, 0.42));
    o.start(when);
    o.stop(when + 0.45);
  }

  private noiseHit(when: number, v: number, decay: number, type: BiquadFilterType, freq: number) {
    const src = this.ctx!.createBufferSource();
    src.buffer = this.noise;
    const f = this.ctx!.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    src.connect(f);
    f.connect(this.env(when, v, decay));
    src.start(when);
    src.stop(when + decay + 0.05);
  }

  private snare(when: number, v: number) {
    this.noiseHit(when, 0.5 * v, 0.18, 'bandpass', 1800);
    const o = this.ctx!.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(220, when);
    o.connect(this.env(when, 0.25 * v, 0.1));
    o.start(when);
    o.stop(when + 0.12);
  }

  private hat(when: number, v: number) {
    this.noiseHit(when, 0.22 * v, 0.05, 'highpass', 8000);
  }

  private crash(when: number, v: number) {
    this.noiseHit(when, 0.25 * v, 1.1, 'highpass', 5000);
  }
}
