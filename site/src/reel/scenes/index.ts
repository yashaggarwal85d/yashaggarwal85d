import type { SceneDef } from '../types';
import { ColdOpen, coldOpenKb, NameSlam, nameSlamKb, Role } from './Brew';
import { Consolidate, Grid, Hours, Rust } from './Grind';
import { PourScene } from './Pour';
import { BlackHoleScene, Cinema, Maths, Quantum } from './OffTheClock';
import { Career, Cta, ctaKb, LoopStinger } from './Serve';

// Bars are 2 s at 120 BPM. Only frames 01, 02 and 14 show the keyboard.
export const SCENES: SceneDef[] = [
  { id: 'cold-open', title: 'Cold open', start: 0, dur: 2, Component: ColdOpen, kb: coldOpenKb, poster: 1.2 },
  { id: 'name', title: 'Name slam', start: 2, dur: 4, Component: NameSlam, kb: nameSlamKb, poster: 3.6 },
  { id: 'role', title: 'Data Engineer', start: 6, dur: 2, Component: Role, poster: 1.2 },
  { id: 'hours', title: '18h → 45 min', start: 8, dur: 4, Component: Hours, poster: 3.5 },
  { id: 'rust', title: 'Rust vs Spark', start: 12, dur: 4, Component: Rust, poster: 3.6 },
  { id: 'consolidate', title: '136 → 1', start: 16, dur: 4, Component: Consolidate, poster: 3.8 },
  { id: 'grid', title: 'Rapid fire', start: 20, dur: 4, Component: Grid, poster: 1.9 },
  { id: 'pour', title: 'How I brew data', start: 24, dur: 4, Component: PourScene, poster: 3.9 },
  { id: 'black-hole', title: 'Black holes', start: 28, dur: 4, Component: BlackHoleScene, poster: 3.4 },
  { id: 'quantum', title: 'Qubits', start: 32, dur: 2, Component: Quantum, poster: 1.9 },
  { id: 'maths', title: 'Euler’s identity', start: 34, dur: 2, Component: Maths, poster: 1.95 },
  { id: 'cinema', title: 'The watchlist', start: 36, dur: 4, Component: Cinema, poster: 2.2 },
  { id: 'career', title: 'Career', start: 40, dur: 4, Component: Career, poster: 3.9 },
  { id: 'cta', title: 'Let’s build', start: 44, dur: 2, Component: Cta, kb: ctaKb, poster: 1.5 },
  { id: 'loop', title: 'Return by death', start: 46, dur: 2, Component: LoopStinger, poster: 1.0 },
];

export type Chapter = { id: string; label: string; sub: string; start: number; end: number };

export const CHAPTERS: Chapter[] = [
  { id: 'brew', label: 'Brew', sub: 'the cold open', start: 0, end: 8 },
  { id: 'grind', label: 'Grind', sub: 'the numbers', start: 8, end: 24 },
  { id: 'pour', label: 'Pour', sub: 'how I brew data', start: 24, end: 28 },
  { id: 'off', label: 'Off the clock', sub: 'physics · maths · cinema', start: 28, end: 40 },
  { id: 'serve', label: 'Serve', sub: 'let’s talk', start: 40, end: 48 },
];

export const sceneAt = (time: number) => {
  for (let i = SCENES.length - 1; i >= 0; i--) if (time >= SCENES[i].start) return SCENES[i];
  return SCENES[0];
};

export const chapterAt = (time: number) => {
  for (let i = CHAPTERS.length - 1; i >= 0; i--) if (time >= CHAPTERS[i].start) return i;
  return 0;
};
