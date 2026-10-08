import { useEffect, useRef, useState } from 'react';
import { C, F } from '../reel/palette';
import { CHAPTERS, chapterAt } from '../reel/scenes';
import { LOOP } from '../reel/anim';
import type { ScoreController } from '../reel/score';

/**
 * The score's face in the soundtrack card: a cup of cold brew seen from above,
 * its crema swirling, ringed by the live spectrum of the mix. Before the
 * viewer unmutes (no audio clock yet) the ring breathes on the beat instead.
 */
export default function ScoreCard({ score }: { score: ScoreController }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [label, setLabel] = useState('INTRO');

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    el.width = 200 * dpr;
    el.height = 200 * dpr;
    const g = el.getContext('2d')!;
    g.scale(dpr, dpr);
    const bins = new Uint8Array(128);
    const N = 56;
    const smooth = new Float32Array(N);
    let raf = 0;
    let lastLabel = '';

    const draw = () => {
      raf = requestAnimationFrame(draw);
      const reel = score.reelTime();
      const playing = score.status === 'playing';
      const pulse = score.pulse();
      const live = !!score.analyser && !score.muted && playing;
      if (live) score.analyser!.getByteFrequencyData(bins);

      const nextLabel = reel < 0 ? 'INTRO' : `${CHAPTERS[chapterAt(reel % LOOP)].label.toUpperCase()}`;
      if (nextLabel !== lastLabel) {
        lastLabel = nextLabel;
        setLabel(nextLabel);
      }

      g.clearRect(0, 0, 200, 200);
      const bg = g.createRadialGradient(100, 89, 10, 100, 89, 140);
      bg.addColorStop(0, C.roast);
      bg.addColorStop(1, C.espresso);
      g.fillStyle = bg;
      g.fillRect(0, 0, 200, 200);

      const cx = 100;
      const cy = 89;
      const R = 36 + pulse * 3;

      // the spectrum ring, mirrored left/right
      for (let i = 0; i < N; i++) {
        const half = i < N / 2 ? i : N - 1 - i;
        let v: number;
        if (live) v = bins[2 + half * 2] / 255;
        else v = playing ? pulse * (0.35 + 0.65 * Math.abs(Math.sin(half * 1.7 + reel * 2))) * 0.6 : 0.04;
        smooth[i] += (v - smooth[i]) * 0.35;
        const a = (i / N) * Math.PI * 2 - Math.PI / 2;
        const r0 = R + 6;
        const r1 = r0 + 3 + smooth[i] * 21;
        g.strokeStyle = smooth[i] > 0.55 ? C.cinnamon : C.caramel;
        g.globalAlpha = 0.45 + smooth[i] * 0.55;
        g.lineWidth = 3;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
        g.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        g.stroke();
      }
      g.globalAlpha = 1;

      // the cup and the swirl
      g.fillStyle = C.cocoa;
      g.beginPath();
      g.arc(cx, cy, R + 2, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = C.mocha;
      g.beginPath();
      g.arc(cx, cy, R - 3, 0, Math.PI * 2);
      g.fill();
      const spin = (playing ? reel : 0) * 1.4;
      g.strokeStyle = C.latte;
      g.lineWidth = 2.2;
      for (let arm = 0; arm < 3; arm++) {
        g.globalAlpha = 0.5 - arm * 0.1;
        g.beginPath();
        for (let k = 0; k <= 40; k++) {
          const u = k / 40;
          const ang = spin + arm * ((Math.PI * 2) / 3) + u * 4.2;
          const rr = 4 + u * (R - 10);
          const x = cx + Math.cos(ang) * rr;
          const y = cy + Math.sin(ang) * rr;
          if (k) g.lineTo(x, y);
          else g.moveTo(x, y);
        }
        g.stroke();
      }
      g.globalAlpha = 1;
      g.fillStyle = C.crema;
      g.beginPath();
      g.arc(cx, cy, 3 + pulse * 3, 0, Math.PI * 2);
      g.fill();
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [score]);

  return (
    <div className="relative h-full w-full select-none">
      <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-hidden />
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-3 pt-2.5 font-mono text-[9px] tracking-[0.2em]" style={{ color: C.caramel }}>
        <span className="flex items-center gap-1.5">
          <i className="block h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: C.cinnamon }} /> LIVE SYNTH
        </span>
        <span style={{ color: C.latte }}>120 BPM</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 px-3 pb-2.5">
        <p style={{ font: `800 15px/1 ${F.display}`, color: C.crema, letterSpacing: '-0.01em' }}>COLD BREW</p>
        <p className="mt-1 flex justify-between whitespace-nowrap font-mono text-[9px] tracking-[0.16em]" style={{ color: C.latte }}>
          <span>DRIFT PHONK</span>
          <span style={{ color: C.caramel }}>{label}</span>
        </p>
      </div>
    </div>
  );
}
