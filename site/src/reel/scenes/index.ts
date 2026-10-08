import type { SceneDef } from '../types';
import { ColdOpen, coldOpenKb, NameSlam, nameSlamKb, Role } from './Brew';
import { Built, Morning, Toolbox } from './Work';
import { PourScene } from './Pour';
import { BlackHoleScene, Cinema, Maths, NavierStokes, Quantum } from './OffTheClock';
import { Cta, ctaKb, Journey, LoopStinger } from './Serve';
import { Domain } from './Domain';
import { Shortlist } from './Shortlist';
import { TornUp } from './TornUp';
import { tr } from '../../i18n';

// Bars are 2 s at 120 BPM. Only frames 01, 02 and the CTA show the keyboard.
// Order: who (name, role, journey) → what (the numbers) → where (the domain)
// → off the clock → the next morning, back to work → why me → the ask → the loop.
export const SCENES: SceneDef[] = [
  { id: 'cold-open', title: tr('Cold open'), start: 0, dur: 2, Component: ColdOpen, kb: coldOpenKb, poster: 1.2 },
  { id: 'name', title: tr('Name slam'), start: 2, dur: 4, Component: NameSlam, kb: nameSlamKb, poster: 3.6 },
  { id: 'role', title: tr('Data Engineer'), start: 6, dur: 2, Component: Role, poster: 1.2 },
  { id: 'journey', title: tr('The journey'), start: 8, dur: 10, Component: Journey, poster: 6.5 },
  { id: 'tore-up', title: tr('The numbers'), start: 18, dur: 16, Component: TornUp, poster: 1.5 },
  { id: 'domain', title: tr('Supply chain & manufacturing'), start: 34, dur: 16, Component: Domain, poster: 15.5 },
  { id: 'black-hole', title: tr('Black holes'), start: 50, dur: 4, Component: BlackHoleScene, poster: 3.4 },
  { id: 'quantum', title: tr('Qubits'), start: 54, dur: 2, Component: Quantum, poster: 1.9 },
  { id: 'maths', title: tr('Euler’s identity'), start: 56, dur: 2, Component: Maths, poster: 1.95 },
  { id: 'navier', title: 'Navier–Stokes', start: 58, dur: 2, Component: NavierStokes, poster: 1.95 },
  { id: 'cinema', title: tr('Rich taste'), start: 60, dur: 6, Component: Cinema, poster: 2.2 },
  { id: 'morning', title: tr('The next morning'), start: 66, dur: 4, Component: Morning, poster: 3.6 },
  { id: 'built', title: tr('What I can do for you'), start: 70, dur: 6, Component: Built, poster: 5.8 },
  { id: 'pour', title: tr('How I brew data'), start: 76, dur: 6, Component: PourScene, poster: 5.9 },
  { id: 'toolbox', title: tr('The toolbox'), start: 82, dur: 4, Component: Toolbox, poster: 3.2 },
  { id: 'shortlist', title: tr('Why me'), start: 86, dur: 10, Component: Shortlist, poster: 9.6 },
  { id: 'cta', title: tr('Let’s build'), start: 96, dur: 18, Component: Cta, kb: ctaKb, poster: 3.2 },
  { id: 'loop', title: tr('Return by death'), start: 114, dur: 2, Component: LoopStinger, poster: 1.0 },
];

export const sceneById = (id: string) => SCENES.find((s) => s.id === id)!;

export type Chapter = { id: string; label: string; sub: string; start: number; end: number };

export const CHAPTERS: Chapter[] = [
  { id: 'brew', label: tr('Brew'), sub: tr('the cold open'), start: 0, end: 8 },
  { id: 'journey', label: tr('Journey'), sub: tr('intern → Data Engineer II'), start: 8, end: 18 },
  { id: 'numbers', label: tr('Numbers'), sub: tr('the numbers'), start: 18, end: 34 },
  { id: 'domain', label: tr('Domain'), sub: tr('supply chain & manufacturing'), start: 34, end: 50 },
  { id: 'off', label: tr('Off the clock'), sub: tr('physics · maths · cinema'), start: 50, end: 66 },
  { id: 'work', label: tr('Back to work'), sub: tr('what I offer · the pipeline · the toolbox'), start: 66, end: 86 },
  { id: 'serve', label: tr('Serve'), sub: tr('why me · let’s talk'), start: 86, end: 116 },
];

export const sceneAt = (time: number) => {
  for (let i = SCENES.length - 1; i >= 0; i--) if (time >= SCENES[i].start) return SCENES[i];
  return SCENES[0];
};

export const chapterAt = (time: number) => {
  for (let i = CHAPTERS.length - 1; i >= 0; i--) if (time >= CHAPTERS[i].start) return i;
  return 0;
};
