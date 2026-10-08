import { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

const BANGALORE: [number, number] = [12.97, 77.59];
const startPhi = Math.PI - ((BANGALORE[1] * Math.PI) / 180 - Math.PI / 2);

export default function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ x: number; phi: number } | null>(null);
  const extra = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let phi = startPhi;
    let width = canvas.offsetWidth;
    const onResize = () => (width = canvas.offsetWidth);
    window.addEventListener('resize', onResize);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi,
      theta: 0.25,
      dark: 0,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      mapBaseBrightness: 0,
      baseColor: [0.96, 0.91, 0.84],
      markerColor: [0.72, 0.38, 0.18],
      glowColor: [0.95, 0.88, 0.76],
      markers: [{ location: BANGALORE, size: 0.09 }],
      onRender: (state) => {
        if (!drag.current && !reduce) phi += 0.0035;
        state.phi = phi + extra.current;
        state.width = width * 2;
        state.height = width * 2;
      },
    });
    canvas.style.opacity = '1';
    return () => {
      globe.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="aspect-square w-full cursor-grab opacity-0 transition-opacity duration-1000 active:cursor-grabbing"
      onPointerDown={(e) => {
        drag.current = { x: e.clientX, phi: extra.current };
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (drag.current) extra.current = drag.current.phi + (e.clientX - drag.current.x) / 120;
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
    />
  );
}
