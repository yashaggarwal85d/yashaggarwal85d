import { useEffect, useRef } from 'react';

/**
 * A Gargantua-style black hole on a 2D canvas: an accretion disk of orbiting
 * particles (Keplerian speeds, Doppler-brightened on the approaching side), the
 * far side of the disk lensed into a halo over the top, a photon ring, and a
 * starfield whose light bends around the hole.
 *
 * Pass `t` to draw a specific moment (the reel); omit it for a live, cursor-
 * following version (the Off the Clock card).
 */

type Hole = { x: number; y: number; r: number };
type Props = { t?: number; hole?: Hole; interactive?: boolean; className?: string; stars?: number };

const rand = (i: number, s = 0) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const N = 1100;
const DISK = Array.from({ length: N }, (_, i) => ({
  r: 1.35 + 1.9 * Math.pow(rand(i, 1), 1.7),
  a: rand(i, 2) * Math.PI * 2,
  size: 0.6 + 1.8 * rand(i, 3),
}));

const STOPS: [number, number, number][] = [
  [251, 247, 239], // foam
  [233, 217, 191], // crema
  [212, 154, 87], // caramel
  [184, 97, 47], // cinnamon
  [142, 47, 42], // cherry
];
function ramp(t: number) {
  const n = STOPS.length - 1;
  const i = Math.min(Math.floor(t * n), n - 1);
  const k = t * n - i;
  const a = STOPS[i];
  const b = STOPS[i + 1];
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
}

function draw(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, hole: { x: number; y: number; R: number }, starCount: number) {
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#0d0806';
  ctx.fillRect(0, 0, w, h);
  const { x: cx, y: cy, R } = hole;

  // Starfield with gravitational lensing: light is pushed outward around the hole.
  for (let i = 0; i < starCount; i++) {
    const sx = rand(i, 11) * w;
    const sy = rand(i, 12) * h;
    const dx = sx - cx;
    const dy = sy - cy;
    const d2 = dx * dx + dy * dy;
    const k = 1 + (R * R * 2.6) / Math.max(d2, 1);
    const lx = cx + dx * k;
    const ly = cy + dy * k;
    const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * (0.6 + rand(i, 13)) + i));
    ctx.fillStyle = `rgba(233,217,191,${(0.25 + 0.5 * rand(i, 14)) * tw})`;
    const s = rand(i, 15) * 1.8 + 0.4;
    ctx.fillRect(lx, ly, s, s);
  }

  // Soft glow behind everything.
  const glow = ctx.createRadialGradient(cx, cy, R * 0.8, cx, cy, R * 4);
  glow.addColorStop(0, 'rgba(212,154,87,0.28)');
  glow.addColorStop(1, 'rgba(212,154,87,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  const tilt = -0.08;
  const cos = Math.cos(tilt);
  const sin = Math.sin(tilt);
  const project = (a: number, r: number) => {
    const x = Math.cos(a) * r * R;
    const y = Math.sin(a) * r * R * 0.2;
    return [cx + x * cos - y * sin, cy + x * sin + y * cos];
  };

  const rgba = (k: number, a: number) => {
    const [r, g, b] = ramp(k);
    return `rgba(${r | 0},${g | 0},${b | 0},${a})`;
  };

  // The disk body: concentric half-ellipses, brighter on the approaching (left) side.
  const diskBand = (far: boolean) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(tilt);
    ctx.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 8; k++) {
      const rr = (1.38 + k * 0.23) * R;
      const a = 0.3 * (1 - k / 9);
      const grad = ctx.createLinearGradient(-rr, 0, rr, 0);
      grad.addColorStop(0, rgba(k / 8, a * 1.7));
      grad.addColorStop(0.5, rgba(k / 8, a));
      grad.addColorStop(1, rgba(k / 8, a * 0.3));
      ctx.strokeStyle = grad;
      ctx.lineWidth = R * 0.24;
      ctx.beginPath();
      ctx.ellipse(0, 0, rr, rr * 0.2, 0, far ? Math.PI : 0, far ? Math.PI * 2 : Math.PI);
      ctx.stroke();
    }
    ctx.restore();
  };

  // The far side of the disk, bent by gravity into a halo over (and faintly under) the hole.
  const halo = () => {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 4; k++) {
      const rr = R * (1.1 + k * 0.1);
      const grad = ctx.createLinearGradient(cx - rr, 0, cx + rr, 0);
      grad.addColorStop(0, rgba(k / 4, 0.5 - k * 0.08));
      grad.addColorStop(0.5, rgba(k / 4, 0.32 - k * 0.05));
      grad.addColorStop(1, rgba(k / 4, 0.16));
      ctx.strokeStyle = grad;
      ctx.lineWidth = R * 0.12;
      ctx.beginPath();
      ctx.arc(cx, cy, rr, Math.PI, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(cx, cy, rr * 0.98, 0, Math.PI);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  };

  const grain = Math.max(1, R / 110);
  const drawParticles = (far: boolean) => {
    diskBand(far);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < N; i++) {
      const p = DISK[i];
      const a = p.a + t * (0.9 / Math.pow(p.r, 1.5));
      const isFar = Math.sin(a) < 0;
      if (isFar !== far) continue;
      const doppler = 0.3 + 0.7 * (0.5 - 0.5 * Math.cos(a));
      const [r, g, b] = ramp((p.r - 1.35) / 1.9);
      const alpha = doppler * (0.55 + 0.45 * (1 - (p.r - 1.35) / 1.9));
      ctx.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${alpha})`;
      const [x, y] = project(a, p.r);
      ctx.fillRect(x, y, p.size * grain, p.size * 0.7 * grain);

      // Lensed image: the far disk bends up over the hole, the near disk faintly under it.
      const rl = R * (1.08 + (p.r - 1.35) * 0.2);
      const lx = cx + Math.cos(a) * rl;
      const arc = Math.sqrt(Math.max(0, rl * rl - (lx - cx) * (lx - cx)));
      ctx.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${alpha * (far ? 0.75 : 0.22)})`;
      ctx.fillRect(lx, far ? cy - arc : cy + arc * 0.9, p.size * grain, p.size * grain);
    }
    ctx.globalCompositeOperation = 'source-over';
  };

  drawParticles(true);
  halo();

  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fillStyle = '#000';
  ctx.fill();

  ctx.save();
  ctx.shadowColor = 'rgba(251,247,239,0.9)';
  ctx.shadowBlur = R * 0.12;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 1.03, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(251,247,239,0.75)';
  ctx.lineWidth = Math.max(1.5, R * 0.018);
  ctx.stroke();
  ctx.restore();

  drawParticles(false);
}

export default function BlackHole({ t, hole = { x: 0.62, y: 0.5, r: 0.17 }, interactive = false, className = '', stars = 260 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const live = useRef({ hx: hole.x, hy: hole.y, tx: hole.x, ty: hole.y });

  // Controlled mode: redraw whenever the reel time changes.
  useEffect(() => {
    if (interactive) return;
    const c = canvasRef.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio, 2);
    const w = c.clientWidth * dpr;
    const h = c.clientHeight * dpr;
    if (c.width !== w || c.height !== h) {
      c.width = w;
      c.height = h;
    }
    draw(ctx, w, h, t ?? 0, { x: hole.x * w, y: hole.y * h, R: hole.r * Math.min(w, h) }, stars);
  }, [t, hole.x, hole.y, hole.r, interactive, stars]);

  // Live mode: own animation loop, hole drifts towards the cursor.
  useEffect(() => {
    if (!interactive) return;
    const c = canvasRef.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let visible = false;
    const start = performance.now();
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(c);
    const onMove = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      live.current.tx = Math.min(0.85, Math.max(0.15, (e.clientX - r.left) / r.width));
      live.current.ty = Math.min(0.8, Math.max(0.2, (e.clientY - r.top) / r.height));
    };
    const onLeave = () => {
      live.current.tx = hole.x;
      live.current.ty = hole.y;
    };
    c.addEventListener('pointermove', onMove);
    c.addEventListener('pointerleave', onLeave);
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      const w = c.clientWidth * dpr;
      const h = c.clientHeight * dpr;
      if (c.width !== w || c.height !== h) {
        c.width = w;
        c.height = h;
      }
      const L = live.current;
      L.hx += (L.tx - L.hx) * 0.06;
      L.hy += (L.ty - L.hy) * 0.06;
      const time = reduce ? 0 : (performance.now() - start) / 1000;
      draw(ctx, w, h, time, { x: L.hx * w, y: L.hy * h, R: hole.r * Math.min(w, h) }, stars);
    };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      c.removeEventListener('pointermove', onMove);
      c.removeEventListener('pointerleave', onLeave);
    };
  }, [interactive, hole.x, hole.y, hole.r, stars]);

  return <canvas ref={canvasRef} className={`block h-full w-full ${className}`} />;
}
