import type { CSSProperties, ReactNode } from 'react';

export type SceneProps = {
  /** seconds since the scene started */
  t: number;
  /** seconds since the reel started (0..48) */
  time: number;
  /** completed loops */
  loop: number;
  /** virtual stage size: 1600×900 landscape or 900×1600 portrait */
  W: number;
  H: number;
  portrait: boolean;
  /** scale from virtual stage pixels to CSS pixels */
  fit: number;
};

export type Camera = {
  s?: number;
  x?: number;
  y?: number;
  r?: number;
  /** transform origin in stage pixels; defaults to the centre */
  ox?: number;
  oy?: number;
};

type StageProps = {
  p: SceneProps;
  bg: string;
  cam?: Camera;
  children: ReactNode;
  /** content drawn full-bleed behind the stage (gradients, stars) */
  backdrop?: ReactNode;
  /** stage-space content that ignores the camera (titles, HUD) */
  hud?: ReactNode;
  /** full-bleed content above everything (flashes) */
  overlay?: ReactNode;
  style?: CSSProperties;
};

/**
 * Full-viewport scene: `bg` and `backdrop` bleed to the edges, `children` sit
 * on a fixed-size virtual stage scaled to fit, inside a camera layer.
 */
export function Stage({ p, bg, cam = {}, children, backdrop, hud, overlay, style }: StageProps) {
  const { s = 1, x = 0, y = 0, r = 0, ox = p.W / 2, oy = p.H / 2 } = cam;
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: bg, ...style }}>
      {backdrop}
      <div
        className="absolute left-1/2 top-1/2"
        style={{ width: p.W, height: p.H, transform: `translate(-50%, -50%) scale(${p.fit})` }}
      >
        <div
          className="absolute inset-0"
          style={{
            transformOrigin: `${ox}px ${oy}px`,
            transform: `translate3d(${x}px, ${y}px, 0) rotate(${r}deg) scale(${s})`,
            willChange: 'transform',
          }}
        >
          {children}
        </div>
        {hud}
      </div>
      {overlay}
    </div>
  );
}

/** Full-bleed colour flash, e.g. on a downbeat cut. */
export function Flash({ color, opacity }: { color: string; opacity: number }) {
  if (opacity <= 0.003) return null;
  return <div className="pointer-events-none absolute inset-0" style={{ background: color, opacity }} />;
}

/** Absolutely positioned helper in stage pixels. */
export function At({
  x,
  y,
  children,
  style,
  className = '',
  anchor = 'tl',
}: {
  x: number;
  y: number;
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
  /** which point of the box sits at (x, y) */
  anchor?: 'tl' | 'c' | 'tc' | 'bl' | 'lc' | 'rc' | 'tr';
}) {
  const shift = {
    tl: '0, 0',
    c: '-50%, -50%',
    tc: '-50%, 0',
    bl: '0, -100%',
    lc: '0, -50%',
    rc: '-100%, -50%',
    tr: '-100%, 0',
  }[anchor];
  const { transform, ...rest } = style ?? {};
  return (
    <div
      className={`absolute ${className}`}
      style={{ left: x, top: y, transform: `translate(${shift}) ${transform ?? ''}`, ...rest }}
    >
      {children}
    </div>
  );
}
