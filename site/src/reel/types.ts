import type { ComponentType } from 'react';
import type { SceneProps } from './Stage';
import type { KbDriver } from './kbDriver';

export type Geo = {
  W: number;
  H: number;
  portrait: boolean;
  /** stage pixels → viewport fraction (0..1), ignoring camera */
  toFrac: (x: number, y: number) => [number, number];
};

export type KbFrame = Pick<KbDriver, 'pump' | 'shockR' | 'shockAmp' | 'focus' | 'all'>;

export type SceneDef = {
  id: string;
  title: string;
  /** seconds from the reel start */
  start: number;
  dur: number;
  Component: ComponentType<SceneProps>;
  /** keyboard choreography; scenes without it hide the keyboard (option 1) */
  kb?: (t: number, geo: Geo) => KbFrame;
  /** representative local time, used for reduced-motion stills */
  poster: number;
};
