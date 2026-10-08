/**
 * Shared, mutable instructions for the keyboard backdrop. The reel writes to
 * this object every frame and the three.js loop reads it, so neither side
 * re-renders React to talk to the other.
 */
export type KbFocus = {
  /** viewport fraction, 0..1 */
  x: number;
  y: number;
  /** radius in keys */
  radius: number;
  /** 0..1 */
  strength: number;
};

export type KbDriver = {
  /** canvas opacity target, 0..1 */
  visible: number;
  /** palette crossfade, 0 = espresso, 1 = oat */
  light: number;
  /** sweep a wave across the board after 1.8 s without input */
  idleWave: boolean;
  /** every key lifts by this much (0..1); the reel envelopes it on the beat */
  pump: number;
  /** expanding ring from the board centre, in keys; negative = off */
  shockR: number;
  shockAmp: number;
  focus: KbFocus | null;
  /** launch every key, 0..1 */
  all: number;
  /** minimum opacity of the key sockets so the grid reads as texture */
  socketFloor: number;
  /** Konami-code easter egg: keycaps become coffee beans */
  beans: boolean;
};

export const createKbDriver = (): KbDriver => ({
  visible: 1,
  light: 0,
  idleWave: false,
  pump: 0,
  shockR: -1,
  shockAmp: 0,
  focus: null,
  all: 0,
  socketFloor: 0,
  beans: false,
});
