import { LOOP } from './anim';
import type { SongStatus } from './song';

/**
 * "Cold Brew": an original drift-phonk score, synthesised live in the browser
 * with WebAudio (no audio files). It runs at the reel's own 120 BPM and is
 * written against the reel's timeline, so every hit lands on a cut: a stab per
 * letter of YASH, an impact on the 24× stamp, the half-time drop under the
 * black hole, a whoosh per career whip, a tape-stop on the spinning top.
 *
 * Song time 0–8 s is the intro (pad, crackle, a muffled cowbell, a riser);
 * reel time 0 is the drop. After that the 48 s loop repeats forever.
 *
 * It mirrors SongController's surface so the reel and the deck drive it the
 * same way. The clock follows performance.now() until the viewer unmutes
 * (browsers need a gesture to start audio), then the audio clock itself.
 */

export const INTRO = 8;
const STEP = 0.125; // 16th notes at 120 BPM
const STEPS_PER_LOOP = LOOP / STEP; // 384
const INTRO_STEPS = INTRO / STEP; // 64

const F4 = 349.23;
const F2 = 87.31;
const hz = (semi: number, base = F4) => base * 2 ** (semi / 12);

/** Fm – Db – Eb – C, one chord per bar: bass roots (semitones from F). */
const ROOTS = [0, -4, -2, -5];
/** Pad voicings in semitones from F4. */
const PADS = [
  [-12, -9, -5, 0],
  [-16, -12, -9, -4],
  [-14, -11, -7, -2],
  [-17, -13, -10, -5],
];
/** The cowbell hook: 16th-step → semitone from F4, one row per chord (3-3-2 rhythm). */
const RIFF: Record<number, number>[] = [
  { 0: 12, 3: 10, 6: 7, 8: 12, 10: 15, 12: 10, 14: 7 },
  { 0: 8, 3: 12, 6: 8, 8: 3, 10: 8, 12: 12, 14: 15 },
  { 0: 10, 3: 14, 6: 10, 8: 5, 10: 10, 12: 14, 14: 17 },
  { 0: 7, 3: 11, 6: 14, 8: 11, 10: 7, 12: 11, 14: 2 },
];
/** YASH: one stab per letter, climbing the F minor chord. */
const LETTERS = [0, 3, 7, 12];
/** Career whips (reel seconds) and how long each whip takes. */
const WHIPS = [40.75, 41.5, 42.0, 43.0];
const WHIP = 0.18;

type Live = { n: AudioScheduledSourceNode; end: number };

export class ScoreController {
  status: SongStatus = 'idle';
  muted = true;
  /** song seconds before the reel's first beat (fixed: the score is written to the reel) */
  readonly offset = INTRO;
  passes = 0;
  duration = Infinity;

  private listeners = new Set<() => void>();
  private version = 0;

  // clock
  private anchorPos = 0;
  private anchorPerf = 0;
  private anchorCtx = 0;
  /** the audio clock is running and drives the position */
  private audioLive = false;
  private nextStep: number | null = null;

  // audio graph
  private ctx: AudioContext | null = null;
  private out!: GainNode;
  private drums!: GainNode;
  private music!: GainNode;
  private duck!: GainNode;
  private tone!: BiquadFilterNode;
  private verb!: GainNode;
  private shaper!: WaveShaperNode;
  private noise!: AudioBuffer;
  private crackleBuf!: AudioBuffer;
  /** taps the mix for the card's visualiser */
  analyser: AnalyserNode | null = null;
  private live: Live[] = [];

  // ---- subscription (for useSyncExternalStore) ---------------------------
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };
  getVersion = () => this.version;
  private emit() {
    this.version++;
    this.listeners.forEach((fn) => fn());
  }
  private set(status: SongStatus) {
    if (this.status !== status) {
      this.status = status;
      this.emit();
    }
  }

  get engaged() {
    return this.status === 'playing' || this.status === 'paused' || this.status === 'buffering';
  }

  /** Song position in seconds, as heard. */
  now() {
    if (this.status !== 'playing') return this.anchorPos;
    if (this.audioLive && this.ctx) {
      const lat = (this.ctx.outputLatency || 0) + (this.ctx.baseLatency || 0);
      return this.anchorPos + Math.max(0, this.ctx.currentTime - this.anchorCtx - lat);
    }
    return this.anchorPos + Math.max(0, performance.now() - this.anchorPerf) / 1000;
  }

  reelTime() {
    return this.now() - INTRO;
  }

  // ---- lifecycle ---------------------------------------------------------
  private mounted = false;
  async mount(_el: HTMLElement | null, opts: { autoplay: boolean }) {
    if (this.mounted) return;
    this.mounted = true;
    window.setInterval(this.tick, 25);
    if (opts.autoplay) this.seek(0, 'playing');
    else this.set('blocked');
    this.emit();
  }

  private ensureCtx() {
    if (this.ctx) return this.ctx;
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    this.ctx = ctx;

    this.out = ctx.createGain();
    this.out.gain.value = 0;
    this.out.connect(ctx.destination);
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 4;
    comp.attack.value = 0.003;
    comp.release.value = 0.2;
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.72;
    comp.connect(this.analyser);
    this.analyser.connect(this.out);

    const bus = ctx.createGain();
    bus.gain.value = 0.9;
    bus.connect(comp);
    this.drums = ctx.createGain();
    this.drums.connect(bus);
    // Music (bass, cowbell, pad) runs through a ducker and a tone filter that
    // closes for the pour and the spinning top.
    this.tone = ctx.createBiquadFilter();
    this.tone.type = 'lowpass';
    this.tone.frequency.value = 18000;
    this.tone.connect(bus);
    this.duck = ctx.createGain();
    this.duck.connect(this.tone);
    this.music = ctx.createGain();
    this.music.connect(this.duck);

    // A long, dark room built from decaying noise.
    const conv = ctx.createConvolver();
    const len = Math.floor(ctx.sampleRate * 2.8);
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3.2;
    }
    conv.buffer = ir;
    this.verb = ctx.createGain();
    this.verb.gain.value = 0.5;
    this.verb.connect(conv);
    conv.connect(bus);

    // The 808's grit.
    this.shaper = ctx.createWaveShaper();
    const curve = new Float32Array(1024);
    for (let i = 0; i < curve.length; i++) curve[i] = Math.tanh(((i / (curve.length - 1)) * 2 - 1) * 3.2);
    this.shaper.curve = curve;
    const bassOut = ctx.createGain();
    bassOut.gain.value = 0.42;
    this.shaper.connect(bassOut);
    bassOut.connect(this.music);

    this.noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const n = this.noise.getChannelData(0);
    for (let i = 0; i < n.length; i++) n[i] = Math.random() * 2 - 1;
    // Vinyl: hiss with sparse pops.
    this.crackleBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const c = this.crackleBuf.getChannelData(0);
    for (let i = 0; i < c.length; i++) c[i] = (Math.random() * 2 - 1) * 0.04 + (Math.random() < 0.0006 ? (Math.random() * 2 - 1) * 0.9 : 0);
    return ctx;
  }

  // ---- the scheduler -----------------------------------------------------
  private tick = () => {
    const ctx = this.ctx;
    if (!ctx || !this.audioLive || this.status !== 'playing') return;
    const raw = this.anchorPos + Math.max(0, ctx.currentTime - this.anchorCtx);
    const horizon = raw + (document.hidden ? 1.5 : 0.2);
    if (this.nextStep === null && raw > 0.05 && raw < INTRO) this.resumeIntro(raw, ctx.currentTime + 0.01);
    let k = this.nextStep ?? Math.ceil(raw / STEP - 1e-6);
    for (; k * STEP <= horizon; k++) {
      const when = this.anchorCtx + (k * STEP - this.anchorPos);
      if (when >= ctx.currentTime - 0.005) this.step(k - INTRO_STEPS, Math.max(when, ctx.currentTime));
    }
    this.nextStep = k;
    const t = ctx.currentTime;
    if (this.live.length > 64) this.live = this.live.filter((v) => v.end > t);
  };

  /** Everything that plays on one 16th step. `s` counts from the reel's first beat. */
  private step(s: number, w: number) {
    if (s < 0) return this.intro(s + INTRO_STEPS, w);
    const local = s % STEPS_PER_LOOP;
    if (local === 0 && s > 0) this.passes = Math.floor(s / STEPS_PER_LOOP);
    const bar = Math.floor(local / 16);
    const i = local % 16;
    const t = local * STEP;
    const chord = bar % 4;

    this.toneAt(w, bar === 12 || bar === 13 ? 1400 : bar === 23 ? 900 : 18000);

    // ---- one-off cues, by reel time -------------------------------------
    if (t === 0 || t === 4 || t === 8 || t === 32 || t === 44) this.impact(w, t === 44 ? 1.25 : 1);
    if (t === 0 || t === 4 || t === 20 || t === 32 || t === 44) this.crash(w, 0.55);
    if (t === 9.5) {
      this.impact(w, 1.1); // 24× stamp
      this.clap(w, 1, 0.5);
    }
    if (t === 13.125 || t === 33.5) {
      this.cowbell(w, 24, 0.9, 0.5);
      this.crash(w, 0.3);
    }
    if (t === 19.25) {
      this.impact(w, 1.15); // 136 → 1
      this.crash(w, 0.6);
    }
    if (t === 18) this.riser(w, 1.25, 0.5);
    if (t === 7.25) this.riser(w, 0.75, 0.55);
    if (t === 27) this.riser(w, 1, 0.6);
    if (t === 23) this.riser(w, 1, 0.35);
    if (t === 28) {
      this.impact(w, 1.3);
      this.pad(w, PADS[0], 4, 0.16, 500, 3200);
    }
    for (const c of WHIPS) {
      if (Math.abs(t - c) < 1e-6) {
        this.whoosh(w, WHIP + 0.06);
        this.clap(w + WHIP, 0.7, 0.3);
        this.kick(w + WHIP, 0.8);
      }
    }

    // ---- sections --------------------------------------------------------
    if (bar === 1) {
      // YASH: four stabs, one per letter, then air.
      if (i % 4 === 0) {
        const n = LETTERS[i / 4];
        this.kick(w, 1);
        this.clap(w, 0.8, 0.25);
        this.bass(w, n % 12, 0.4);
        this.cowbell(w, 12 + n, 0.9, 0.3);
      } else if (i % 2 === 0) this.hat(w, 0.25);
      return;
    }
    if (bar === 3 && i >= 10) {
      // zooming into the A: drums drop out under the riser
      if (i === 10) this.bass(w, 0, 0.3, 12);
      return;
    }
    if (bar === 14 || bar === 15) return this.blackHole(bar, i, w);
    if (bar === 12 || bar === 13) return this.pour(bar, i, w, chord);
    if (bar === 23) return this.stinger(i, w);
    if (bar === 11 && i >= 8) {
      if (i === 8) {
        this.kick(w, 0.9);
        this.bass(w, ROOTS[chord], 0.9);
      }
      if (i % 2 === 0) this.hat(w, 0.18);
      return;
    }

    this.groove(bar, i, w, chord, bar === 22);
    if (bar === 17 && i % 4 === 0) this.plink(w + 0.001, [12, 15, 19, 24][i / 4], 0.35);
  }

  private groove(bar: number, i: number, w: number, chord: number, peak: boolean) {
    const root = ROOTS[chord];
    // drums
    if (i === 0 || i === 8 || (i === 10 && bar % 2 === 1) || (peak && i === 14)) this.kick(w, i === 0 ? 1 : 0.85);
    if (i === 4 || i === 12) this.clap(w, 0.85, 0.12);
    const roll = bar % 4 === 3 && i >= 12;
    if (roll) {
      this.hat(w, 0.3);
      this.hat(w + STEP / 2, 0.22);
    } else if (peak || i % 2 === 0) this.hat(w, i % 2 === 0 ? 0.32 : 0.16);
    else if (i % 4 === 3) this.hat(w, 0.12);
    if (i === 2 || i === 10) this.hat(w, 0.14, true);
    // snare rolls into the next scene
    if ((bar === 0 || bar === 19 || bar === 9) && i >= 12) this.clap(w, 0.25 + (i - 12) * 0.12, 0.05);
    // 808
    if (i === 0) this.bass(w, root, 0.75);
    else if (i === 6) this.bass(w, root, 0.2);
    else if (i === 8) this.bass(w, root, 0.4);
    else if (i === 11) this.bass(w, root + 12, 0.18);
    else if (i === 14) this.bass(w, root, 0.25, 12);
    // the hook (an octave up for the finale and the watchlist)
    const note = RIFF[chord][i];
    if (note !== undefined) this.cowbell(w, note + (peak || bar === 18 || bar === 19 ? 12 : 0), peak ? 0.75 : 0.6);
  }

  private intro(k: number, w: number) {
    // k: 0..63 over 8 s
    const bar = Math.floor(k / 16);
    const i = k % 16;
    if (k === 0) {
      this.crackle(w, INTRO);
      this.pad(w, PADS[0], 4.1, 0.13, 300, 1600);
    }
    if (k === 32) this.pad(w, PADS[1], 2.1, 0.13, 900, 2400);
    if (k === 48) {
      this.pad(w, PADS[2], 2.0, 0.14, 1400, 4000);
      this.riser(w, 2, 0.7);
    }
    if (bar >= 1) {
      // the hook from another room, the door opening bar by bar
      const note = RIFF[bar % 4][i];
      if (note !== undefined) this.cowbell(w, note, 0.35 + bar * 0.12, 0.22, [0, 700, 1500, 3200][bar]);
    }
    if (bar === 2 && i % 4 === 0) this.hat(w, 0.12);
    if (bar === 3) {
      if (i < 12 && i % 2 === 0) this.hat(w, 0.2);
      if (i >= 8) {
        this.clap(w, 0.2 + (i - 8) * 0.07, 0.05);
        if (i >= 12) this.clap(w + STEP / 2, 0.3 + (i - 12) * 0.08, 0.05);
      }
    }
  }

  /** Joining the intro part-way (unmuted mid-intro, or a seek): bring in what's already sounding. */
  private resumeIntro(pos: number, w: number) {
    const left = INTRO - pos;
    if (left > 1.2) this.crackle(w, left);
    const seg = pos < 4 ? 0 : pos < 6 ? 1 : 2;
    const end = [4.1, 6.1, 8][seg];
    if (end - pos > 0.4) this.pad(w, PADS[seg], end - pos, 0.13, 600 + seg * 500, [1600, 2400, 4000][seg]);
    if (seg === 2 && left > 0.4) this.riser(w, left, 0.7);
  }

  private pour(bar: number, i: number, w: number, chord: number) {
    // Under water: filtered hook, a slow kick, bubbles.
    if (i === 0 || i === 8) this.kick(w, 0.7);
    if (i === 0) this.bass(w, ROOTS[chord], 1.2);
    if (i === 12) this.clap(w, 0.4, 0.4);
    if (i % 4 === 2) this.hat(w, 0.1);
    const note = RIFF[chord][i];
    if (note !== undefined) this.cowbell(w, note, 0.55, 0.3);
    if (((bar * 16 + i) * 7) % 5 === 1) this.bubble(w, i);
  }

  private blackHole(bar: number, i: number, w: number) {
    // Half time, everything in a cathedral.
    if (i === 0) {
      this.kick(w, 1);
      this.bass(w, bar === 14 ? 0 : -4, 1.9, bar === 14 ? 12 : 0, 1.2); // falling in
    }
    if (i === 8) this.clap(w, 0.9, 0.9);
    if (i % 4 === 0) this.hat(w, 0.12);
    if (i === 0 || i === 10) this.cowbell(w, i === 0 ? 12 : 7, 0.45, 0.6);
    if (bar === 15 && i === 0) this.pad(w, PADS[1], 2, 0.14, 1200, 600);
    if (bar === 15 && i >= 12) this.clap(w, 0.3 + (i - 12) * 0.15, 0.2);
  }

  private stinger(i: number, w: number) {
    // The spinning top: a tape-stop, a wobbling tick, then the cut.
    if (i === 0) this.tapeStop(w);
    if (i >= 4 && i < 12) this.hat(w, 0.22 - (i - 4) * 0.02, false, 9000 - (i - 4) * 500);
    if (i === 12) this.kick(w, 0.35);
  }

  // ---- voices ------------------------------------------------------------
  private track<T extends AudioScheduledSourceNode>(n: T, start: number, end: number) {
    n.start(start);
    n.stop(end);
    this.live.push({ n, end });
    return n;
  }

  private gainEnv(dest: AudioNode, w: number, peak: number, attack: number, decay: number) {
    const g = this.ctx!.createGain();
    g.gain.setValueAtTime(0.0001, w);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), w + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, w + attack + decay);
    g.connect(dest);
    return g;
  }

  private noiseSrc(w: number, dur: number) {
    const s = this.ctx!.createBufferSource();
    s.buffer = this.noise;
    s.loop = true;
    this.track(s, w, w + dur);
    return s;
  }

  private filter(type: BiquadFilterType, freq: number, q = 0.7) {
    const f = this.ctx!.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    return f;
  }

  private send(node: AudioNode, amount: number) {
    if (amount <= 0) return;
    const g = this.ctx!.createGain();
    g.gain.value = amount;
    node.connect(g);
    g.connect(this.verb);
  }

  private toneAt(w: number, freq: number) {
    const f = this.tone.frequency;
    f.cancelScheduledValues(w);
    f.setTargetAtTime(freq, w, 0.08);
  }

  private kick(w: number, v: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(170, w);
    o.frequency.exponentialRampToValueAtTime(48, w + 0.11);
    o.connect(this.gainEnv(this.drums, w, 0.95 * v, 0.003, 0.32));
    this.track(o, w, w + 0.4);
    const click = this.noiseSrc(w, 0.02);
    click.connect(this.filter('highpass', 3000)).connect(this.gainEnv(this.drums, w, 0.25 * v, 0.001, 0.015));
    // sidechain: the music ducks under every kick
    const d = this.duck.gain;
    d.cancelScheduledValues(w);
    d.setValueAtTime(0.45, w);
    d.linearRampToValueAtTime(1, w + 0.22);
  }

  private bass(w: number, semi: number, len: number, glideFrom = 0, glideTime = 0.18) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    const f = hz(semi, F2);
    if (glideFrom) {
      o.frequency.setValueAtTime(f * 2 ** (glideFrom / 12), w);
      o.frequency.exponentialRampToValueAtTime(f, w + Math.min(glideTime, len * 0.8));
    } else o.frequency.setValueAtTime(f, w);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, w);
    g.gain.exponentialRampToValueAtTime(1, w + 0.006);
    g.gain.setValueAtTime(1, w + len * 0.6);
    g.gain.exponentialRampToValueAtTime(0.0001, w + len + 0.05);
    o.connect(g);
    g.connect(this.shaper);
    this.track(o, w, w + len + 0.08);
  }

  private clap(w: number, v: number, wet: number) {
    const bp = this.filter('bandpass', 1400, 0.9);
    const g = this.ctx!.createGain();
    g.gain.setValueAtTime(0.0001, w);
    for (const [dt, a] of [
      [0, 0.8],
      [0.011, 0.7],
      [0.022, 1],
    ]) {
      g.gain.setValueAtTime(a * 0.7 * v, w + dt);
      g.gain.exponentialRampToValueAtTime(0.05 * v + 0.0001, w + dt + 0.009);
    }
    g.gain.setValueAtTime(0.6 * v, w + 0.031);
    g.gain.exponentialRampToValueAtTime(0.0001, w + 0.2);
    this.noiseSrc(w, 0.22).connect(bp).connect(g).connect(this.drums);
    this.send(g, wet);
  }

  private hat(w: number, v: number, open = false, freq = 8000) {
    const env = this.gainEnv(this.drums, w, v * 0.35, 0.001, open ? 0.22 : 0.035);
    this.noiseSrc(w, open ? 0.26 : 0.06).connect(this.filter('highpass', freq)).connect(env);
  }

  private crash(w: number, v: number) {
    const env = this.gainEnv(this.drums, w, v * 0.3, 0.002, 1.5);
    this.noiseSrc(w, 1.6).connect(this.filter('highpass', 4500)).connect(env);
    this.send(env, 0.25);
  }

  private cowbell(w: number, semi: number, v: number, len = 0.22, cutoff = 0) {
    const ctx = this.ctx!;
    const f = hz(semi);
    const bp = this.filter('bandpass', f * 1.25, 1.4);
    const env = this.gainEnv(this.music, w, v * 0.32, 0.002, len);
    let tail: AudioNode = bp;
    if (cutoff) {
      const lp = this.filter('lowpass', cutoff);
      bp.connect(lp);
      tail = lp;
    }
    tail.connect(env);
    for (const m of [1, 1.48]) {
      const o = ctx.createOscillator();
      o.type = 'square';
      o.frequency.value = f * m;
      o.connect(bp);
      this.track(o, w, w + len + 0.03);
    }
    this.send(env, len > 0.4 ? 0.6 : 0.12);
  }

  private pad(w: number, semis: number[], dur: number, v: number, from: number, to: number) {
    const ctx = this.ctx!;
    const lp = this.filter('lowpass', from, 1.2);
    lp.frequency.setValueAtTime(from, w);
    lp.frequency.exponentialRampToValueAtTime(to, w + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, w);
    g.gain.exponentialRampToValueAtTime(v, w + dur * 0.4);
    g.gain.setValueAtTime(v, w + dur * 0.8);
    g.gain.exponentialRampToValueAtTime(0.0001, w + dur + 0.3);
    lp.connect(g);
    g.connect(this.music);
    this.send(g, 0.5);
    for (const s of semis)
      for (const det of [-9, 9]) {
        const o = ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = hz(s);
        o.detune.value = det;
        o.connect(lp);
        this.track(o, w, w + dur + 0.35);
      }
  }

  private riser(w: number, dur: number, v: number) {
    const bp = this.filter('bandpass', 300, 2);
    bp.frequency.setValueAtTime(300, w);
    bp.frequency.exponentialRampToValueAtTime(7000, w + dur);
    const g = this.ctx!.createGain();
    g.gain.setValueAtTime(0.0001, w);
    g.gain.exponentialRampToValueAtTime(v * 0.5, w + dur * 0.95);
    g.gain.exponentialRampToValueAtTime(0.0001, w + dur + 0.04);
    this.noiseSrc(w, dur + 0.06).connect(bp).connect(g).connect(this.drums);
    this.send(g, 0.3);
  }

  private whoosh(w: number, dur: number) {
    const bp = this.filter('bandpass', 500, 1.5);
    bp.frequency.setValueAtTime(500, w);
    bp.frequency.exponentialRampToValueAtTime(5000, w + dur);
    const g = this.ctx!.createGain();
    g.gain.setValueAtTime(0.0001, w);
    g.gain.exponentialRampToValueAtTime(0.35, w + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, w + dur);
    this.noiseSrc(w, dur + 0.02).connect(bp).connect(g).connect(this.drums);
  }

  private impact(w: number, v: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(90, w);
    o.frequency.exponentialRampToValueAtTime(28, w + 1.1);
    const boom = this.gainEnv(this.drums, w, 0.9 * v, 0.004, 1.3);
    o.connect(boom);
    this.track(o, w, w + 1.4);
    const env = this.gainEnv(this.drums, w, 0.45 * v, 0.002, 0.5);
    this.noiseSrc(w, 0.55).connect(this.filter('lowpass', 2400)).connect(env);
    this.send(env, 0.7);
    this.send(boom, 0.2);
    this.kick(w, v);
  }

  private plink(w: number, semi: number, v: number) {
    const ctx = this.ctx!;
    const env = this.gainEnv(this.music, w, v * 0.3, 0.002, 0.6);
    for (const [m, a] of [
      [1, 1],
      [3.01, 0.3],
    ]) {
      const o = ctx.createOscillator();
      o.frequency.value = hz(semi) * m;
      const g = ctx.createGain();
      g.gain.value = a;
      o.connect(g).connect(env);
      this.track(o, w, w + 0.65);
    }
    this.send(env, 0.5);
  }

  private bubble(w: number, i: number) {
    const o = this.ctx!.createOscillator();
    const f = 420 + ((i * 97) % 7) * 70;
    o.frequency.setValueAtTime(f, w);
    o.frequency.exponentialRampToValueAtTime(f * 2.6, w + 0.07);
    o.connect(this.gainEnv(this.music, w, 0.12, 0.004, 0.08));
    this.track(o, w, w + 0.1);
  }

  private crackle(w: number, dur: number) {
    const s = this.ctx!.createBufferSource();
    s.buffer = this.crackleBuf;
    s.loop = true;
    const g = this.ctx!.createGain();
    g.gain.setValueAtTime(0.0001, w);
    g.gain.exponentialRampToValueAtTime(0.5, w + 0.6);
    g.gain.setValueAtTime(0.5, w + dur - 1);
    g.gain.exponentialRampToValueAtTime(0.0001, w + dur);
    s.connect(this.filter('bandpass', 2500, 0.5)).connect(g).connect(this.drums);
    this.track(s, w, w + dur);
  }

  private tapeStop(w: number) {
    // The last chord, dragged to a halt like a reel pulled off the deck.
    const ctx = this.ctx!;
    const lp = this.filter('lowpass', 4000);
    lp.frequency.setValueAtTime(4000, w);
    lp.frequency.exponentialRampToValueAtTime(200, w + 0.9);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.3, w);
    g.gain.exponentialRampToValueAtTime(0.0001, w + 1);
    lp.connect(g).connect(this.drums);
    for (const [s, type] of [
      [-24, 'sawtooth'],
      [-12, 'square'],
      [-5, 'sawtooth'],
      [0, 'square'],
    ] as const) {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.setValueAtTime(hz(s), w);
      o.frequency.exponentialRampToValueAtTime(hz(s) * 0.12, w + 0.95);
      o.connect(lp);
      this.track(o, w, w + 1.02);
    }
    const sub = ctx.createOscillator();
    sub.frequency.setValueAtTime(F2, w);
    sub.frequency.exponentialRampToValueAtTime(F2 * 0.15, w + 0.9);
    sub.connect(this.gainEnv(this.drums, w, 0.7, 0.003, 0.95));
    this.track(sub, w, w + 1);
  }

  /** Silence everything already scheduled (after a seek, pause or stop). */
  private kill() {
    const ctx = this.ctx;
    if (!ctx) return;
    for (const { n } of this.live) {
      try {
        n.stop(0);
      } catch {
        /* already stopped */
      }
    }
    this.live = [];
    const t = ctx.currentTime;
    this.duck.gain.cancelScheduledValues(t);
    this.duck.gain.setValueAtTime(1, t);
    this.tone.frequency.cancelScheduledValues(t);
  }

  // ---- transport ---------------------------------------------------------
  private seek(pos: number, status: SongStatus = this.status) {
    this.kill();
    this.anchorPos = Math.max(0, pos);
    this.anchorPerf = performance.now() + 50;
    this.anchorCtx = (this.ctx?.currentTime ?? 0) + 0.05;
    this.nextStep = null;
    this.set(status);
    this.emit();
  }

  play(withSound = false) {
    if (withSound) this.unmute();
    if (this.status !== 'playing') this.seek(this.now(), 'playing');
  }
  pause() {
    if (this.status === 'playing') this.seek(this.now(), 'paused');
  }
  toggle() {
    if (this.status === 'playing') this.pause();
    else this.play();
  }
  unmute() {
    const ctx = this.ensureCtx();
    void ctx.resume();
    this.muted = false;
    this.out.gain.cancelScheduledValues(ctx.currentTime);
    this.out.gain.setTargetAtTime(0.8, ctx.currentTime, 0.03);
    if (!this.audioLive) {
      // Hand the clock over from performance.now() to the audio clock.
      const pos = this.now();
      this.audioLive = true;
      this.seek(pos);
    }
    this.emit();
  }
  toggleMute() {
    if (this.muted) return this.unmute();
    this.muted = true;
    if (this.ctx) {
      this.out.gain.cancelScheduledValues(this.ctx.currentTime);
      this.out.gain.setTargetAtTime(0, this.ctx.currentTime, 0.03);
    }
    this.emit();
  }
  seekReel(reelT: number) {
    const abs = Math.max(0, this.reelTime());
    this.seek(INTRO + Math.floor(abs / LOOP) * LOOP + reelT, 'playing');
  }
  skipIntro() {
    this.seek(INTRO, 'playing');
  }
  restart() {
    this.passes += 1;
    this.seek(INTRO, 'playing');
  }
  startOver() {
    this.seek(0, 'playing');
  }
  stop() {
    this.seek(this.now(), 'idle');
    this.ctx?.suspend();
    this.audioLive = false;
  }
  nudge(_delta: number) {
    /* the score is written to the reel: nothing to align */
  }
  resetOffset() {
    /* see nudge */
  }

  /** 0..1 punch on every beat, for visuals while the audio clock isn't running. */
  pulse() {
    const t = this.reelTime();
    if (t < 0 || this.status !== 'playing') return 0;
    return Math.exp(-((t % 0.5) * 9));
  }
}
