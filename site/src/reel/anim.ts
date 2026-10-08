// Time-based animation helpers. Every scene is a pure function of time, so the
// reel can pause, scrub and loop frame-accurately at any frame rate.

export const BPM = 120;
export const BEAT = 60 / BPM; // 0.5 s
export const BAR = BEAT * 4; // 2 s
export const LOOP = 86; // 43 bars (scenes/index.ts)

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export type Ease = (t: number) => number;

export const ease = {
  linear: ((t) => t) as Ease,
  quadOut: ((t) => 1 - (1 - t) * (1 - t)) as Ease,
  cubicOut: ((t) => 1 - Math.pow(1 - t, 3)) as Ease,
  cubicIn: ((t) => t * t * t) as Ease,
  expoOut: ((t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t))) as Ease,
  expoIn: ((t) => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10))) as Ease,
  expoInOut: ((t) =>
    t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2) as Ease,
  backOut: ((t) => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2)) as Ease,
  backOutHard: ((t) => 1 + 3.6 * Math.pow(t - 1, 3) + 2.6 * Math.pow(t - 1, 2)) as Ease,
  inOutQuart: ((t) => (t < 0.5 ? 8 * t ** 4 : 1 - Math.pow(-2 * t + 2, 4) / 2)) as Ease,
  sineInOut: ((t) => -(Math.cos(Math.PI * t) - 1) / 2) as Ease,
  elasticOut: ((t) =>
    t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1) as Ease,
};

/** 0..1 progress of `t` through [start, start + dur]. */
export const prog = (t: number, start: number, dur: number) => clamp01((t - start) / dur);

/** Tween a number over [start, start + dur]. */
export const tw = (t: number, start: number, dur: number, from: number, to: number, e: Ease = ease.expoOut) =>
  lerp(from, to, e(prog(t, start, dur)));

/** Decays from 1 at every beat. */
export const beatEnv = (t: number, decay = 10) => {
  const f = ((t % BEAT) + BEAT) % BEAT;
  return Math.exp(-f * decay);
};

/** Decays from 1 at `at`; 0 before. */
export const hit = (t: number, at: number, decay = 10) => (t < at ? 0 : Math.exp(-(t - at) * decay));

/** Deterministic camera shake that dies out over `dur`. */
export const shake = (t: number, at: number, amp = 10, dur = 0.2): [number, number] => {
  if (t < at || t > at + dur) return [0, 0];
  const k = 1 - (t - at) / dur;
  return [Math.sin(t * 97) * amp * k, Math.cos(t * 71) * amp * k];
};

/** Sum several shakes. */
export const shakes = (t: number, list: [at: number, amp: number][], dur = 0.2): [number, number] =>
  list.reduce<[number, number]>(
    (acc, [at, amp]) => {
      const [x, y] = shake(t, at, amp, dur);
      return [acc[0] + x, acc[1] + y];
    },
    [0, 0],
  );

/** Characters typed so far. */
export const typed = (text: string, t: number, start: number, cps = 40) =>
  text.slice(0, Math.max(0, Math.floor((t - start) * cps)));

/** Deterministic pseudo-random in [0, 1) for index `i`. */
export const rand = (i: number, salt = 0) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Scramble text towards its final value, like a split-flap display. */
const GLYPHS = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ#%&*+<>';
export const scramble = (text: string, t: number, start: number, dur: number) => {
  const p = prog(t, start, dur);
  if (p >= 1) return text;
  const settled = Math.floor(p * text.length);
  const tick = Math.floor(t * 30);
  return text
    .split('')
    .map((ch, i) => (i < settled || ch === ' ' ? ch : GLYPHS[Math.floor(rand(i, tick) * GLYPHS.length)]))
    .join('');
};

/** Format seconds as mm:ss. */
export const mmss = (s: number) => {
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};
