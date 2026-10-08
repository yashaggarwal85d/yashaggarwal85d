import type { SceneDef } from '../types';
import { ColdOpen, coldOpenKb, NameSlam, nameSlamKb, Role } from './Brew';
import { Consolidate, Grid, Hours, Rust } from './Grind';
import { PourScene } from './Pour';
import { BlackHoleScene, Cinema, Maths, NavierStokes, Quantum } from './OffTheClock';
import { Cta, ctaKb, Journey, LoopStinger } from './Serve';
import { Domain } from './Domain';
import { Shortlist } from './Shortlist';
import { TornUp } from './TornUp';
import { tr } from '../../i18n';

// Bars are 2 s at 120 BPM. Only frames 01, 02 and the CTA show the keyboard.
// Order: who (name, role, journey) → where (the domain) → what (the numbers)
// → off the clock → why me → the ask → the loop.
export const SCENES: SceneDef[] = [
  { id: 'cold-open', title: tr('Cold open'), start: 0, dur: 2, Component: ColdOpen, kb: coldOpenKb, poster: 1.2 },
  { id: 'name', title: tr('Name slam'), start: 2, dur: 4, Component: NameSlam, kb: nameSlamKb, poster: 3.6 },
  { id: 'role', title: tr('Data Engineer'), start: 6, dur: 2, Component: Role, poster: 1.2 },
  { id: 'journey', title: tr('The journey'), start: 8, dur: 10, Component: Journey, poster: 6.5 },
  { id: 'domain', title: tr('Supply chain & manufacturing'), start: 18, dur: 12, Component: Domain, poster: 11.5 },
  { id: 'pour', title: tr('How I brew data'), start: 30, dur: 4, Component: PourScene, poster: 3.9 },
  { id: 'hours', title: tr('18h → 45 min'), start: 34, dur: 4, Component: Hours, poster: 3.5 },
  { id: 'rust', title: tr('Rust vs Spark'), start: 38, dur: 4, Component: Rust, poster: 3.6 },
  { id: 'consolidate', title: '136 → 1', start: 42, dur: 4, Component: Consolidate, poster: 3.8 },
  { id: 'grid', title: tr('Rapid fire'), start: 46, dur: 4, Component: Grid, poster: 1.9 },
  { id: 'black-hole', title: tr('Black holes'), start: 50, dur: 4, Component: BlackHoleScene, poster: 3.4 },
  { id: 'quantum', title: tr('Qubits'), start: 54, dur: 2, Component: Quantum, poster: 1.9 },
  { id: 'maths', title: tr('Euler’s identity'), start: 56, dur: 2, Component: Maths, poster: 1.95 },
  { id: 'navier', title: 'Navier–Stokes', start: 58, dur: 2, Component: NavierStokes, poster: 1.95 },
  { id: 'cinema', title: tr('Rich taste'), start: 60, dur: 6, Component: Cinema, poster: 2.2 },
  { id: 'shortlist', title: tr('Why me'), start: 66, dur: 10, Component: Shortlist, poster: 9.6 },
  { id: 'cta', title: tr('Let’s build'), start: 76, dur: 8, Component: Cta, kb: ctaKb, poster: 3.2 },
  { id: 'loop', title: tr('Return by death'), start: 84, dur: 2, Component: LoopStinger, poster: 1.0 },
  // Past the loop: only the soundtrack's arrangement (song.ts) visits these.
  { id: 'tore-up', title: tr('Tore up'), start: 86, dur: 16, Component: TornUp, poster: 9.5 },
];

export const sceneById = (id: string) => SCENES.find((s) => s.id === id)!;

export type Chapter = { id: string; label: string; sub: string; start: number; end: number };

export const CHAPTERS: Chapter[] = [
  { id: 'brew', label: tr('Brew'), sub: tr('the cold open'), start: 0, end: 8 },
  { id: 'journey', label: tr('Journey'), sub: tr('intern → Data Engineer II'), start: 8, end: 18 },
  { id: 'domain', label: tr('Domain'), sub: tr('supply chain & manufacturing'), start: 18, end: 34 },
  { id: 'grind', label: tr('Grind'), sub: tr('the numbers'), start: 34, end: 50 },
  { id: 'off', label: tr('Off the clock'), sub: tr('physics · maths · cinema'), start: 50, end: 66 },
  { id: 'serve', label: tr('Serve'), sub: tr('why me · let’s talk'), start: 66, end: 86 },
];

export const sceneAt = (time: number) => {
  for (let i = SCENES.length - 1; i >= 0; i--) if (time >= SCENES[i].start) return SCENES[i];
  return SCENES[0];
};

export const chapterAt = (time: number) => {
  for (let i = CHAPTERS.length - 1; i >= 0; i--) if (time >= CHAPTERS[i].start) return i;
  return 0;
};
