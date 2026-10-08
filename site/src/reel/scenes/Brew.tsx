import { useLayoutEffect, useRef, useState } from 'react';
import { At, Flash, Stage, type SceneProps } from '../Stage';
import { BEAT, beatEnv, clamp01, ease, hit, prog, shakes, tw, typed } from '../anim';
import { C, F, gradText } from '../palette';
import type { Geo, KbFrame } from '../types';

const vignette = (
  <div
    className="pointer-events-none absolute inset-0"
    style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,.7) 100%)' }}
  />
);

/* ------------------------------------------------------------------ 01 */

export function ColdOpen(p: SceneProps) {
  const { t, W, H, time, portrait } = p;
  const beat = Math.floor(t / BEAT) % 4;
  const frames = Math.floor((time % 1) * 24);
  const tc = `00:00:${String(Math.floor(time)).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
  const prompt = 'PRESS ANY KEY';
  const glitch = t > 1.72;
  const ring = prog(t, 0, 0.9);

  return (
    <Stage p={p} bg="transparent" backdrop={vignette} cam={{ s: 1 + 0.035 * (t / 2) + 0.02 * hit(t, 0, 6) }}>
      <svg className="absolute inset-0" width={W} height={H}>
        <ellipse
          cx={W / 2}
          cy={H * 0.53}
          rx={60 + ring * 900}
          ry={(60 + ring * 900) * 0.52}
          fill="none"
          stroke={C.caramel}
          strokeWidth={3}
          opacity={(1 - ring) * 0.6}
        />
      </svg>
      <At x={60} y={56} style={{ font: `600 ${portrait ? 26 : 20}px ${F.mono}`, letterSpacing: '0.14em', color: C.latte, whiteSpace: 'nowrap' }}>
        <span style={{ color: C.cinnamon, opacity: beat % 2 === 0 ? 1 : 0.25 }}>● REC</span>&nbsp;&nbsp;{tc}
      </At>
      <At x={W - 60} y={56} anchor="tr" style={{ font: `600 ${portrait ? 26 : 20}px ${F.mono}`, letterSpacing: '0.14em', color: C.latte, whiteSpace: 'nowrap' }}>
        120 BPM · 4/4
      </At>
      <At
        x={W / 2}
        y={H - (portrait ? 260 : 120)}
        anchor="tc"
        style={{ font: `600 ${portrait ? 30 : 24}px ${F.mono}`, letterSpacing: '0.6em', color: C.crema, whiteSpace: 'nowrap' }}
      >
        {prompt.split('').map((ch, i) => {
          const o = prog(t, 0.25 + i * 0.04, 0.15);
          const flicker = glitch ? (Math.sin(t * 90 + i * 7) > 0.2 ? 1 : 0.15) : 1;
          return (
            <span
              key={i}
              style={{
                opacity: o * flicker,
                display: 'inline-block',
                transform: glitch ? `translateX(${Math.sin(i * 3 + t * 60) * 10}px)` : undefined,
              }}
            >
              {ch === ' ' ? ' ' : ch}
            </span>
          );
        })}
      </At>
      <At x={W - 60} y={H - (portrait ? 180 : 60)} anchor="tr" style={{ display: 'flex', gap: 10 }}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} style={{ width: 14, height: 14, borderRadius: 3, background: i === beat ? C.cinnamon : 'rgba(233,217,191,.2)' }} />
        ))}
      </At>
    </Stage>
  );
}

export const coldOpenKb = (t: number): KbFrame => ({
  focus: { x: 0.5, y: 0.53, radius: 1.4, strength: t < 1.3 ? 1 : 1 - prog(t, 1.3, 0.5) },
  shockR: t * 10,
  shockAmp: 0.85 * Math.exp(-t * 1.4),
  pump: t > 0.45 ? 0.45 * beatEnv(t, 8) : 0,
  all: 0,
});

/* ------------------------------------------------------------------ 02 */

const NAME = 'YASH';
// Approximate glyph centres (stage px) for steering the keyboard under each letter.
const LETTER_X = { land: [210, 430, 640, 860], port: [140, 330, 510, 700] };

export function NameSlam(p: SceneProps) {
  const { t, W, H, portrait } = p;
  const L = portrait
    ? { x: 50, y: 300, size: 300, sub: 130, subY: 680, monoY: 860, mono: 24 }
    : { x: 110, y: 120, size: 330, sub: 170, subY: 470, monoY: 700, mono: 22 };

  const reveal = ease.expoOut(prog(t, 2, 0.6));
  const sh = shakes(t, [[0, 9], [0.5, 9], [1, 9], [1.5, 12], [2, 6]], 0.16);
  const punch = 0.12 * hit(t, 0, 5) + 0.12 * hit(t, 2, 5) + [0, 0.5, 1, 1.5].reduce((a, ti) => a + 0.025 * hit(t, ti, 12), 0);
  const steam = prog(t, 0.4, 1);

  return (
    <Stage
      p={p}
      bg="transparent"
      backdrop={
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(ellipse 70% 70% at ${portrait ? '50% 45%' : '35% 50%'}, rgba(23,16,12,.82) 0%, rgba(23,16,12,.35) 60%, rgba(0,0,0,.55) 100%)` }}
        />
      }
      cam={{ s: 1 + punch, x: sh[0], y: sh[1], ox: L.x + 300, oy: L.y + 250 }}
    >
      {/* steam */}
      <svg className="absolute inset-0" width={W} height={H} style={{ opacity: 0.3 * steam }}>
        {[0, 1, 2].map((i) => {
          const x = L.x + 120 + i * (portrait ? 220 : 230);
          const rise = ((t * 60 + i * 40) % 120);
          return (
            <path
              key={i}
              d={`M${x} ${L.y + 40 - rise} C ${x - 30} ${L.y - 10 - rise}, ${x + 40} ${L.y - 40 - rise}, ${x + 10} ${L.y - 110 - rise}`}
              fill="none"
              stroke={C.crema}
              strokeWidth={5}
              strokeLinecap="round"
              opacity={1 - rise / 120}
            />
          );
        })}
      </svg>

      {/* YASH */}
      <At x={L.x} y={L.y} style={{ display: 'flex', font: `800 ${L.size}px/0.85 ${F.display}`, letterSpacing: '-0.04em', color: C.crema }}>
        {NAME.split('').map((ch, i) => {
          const ti = i * BEAT;
          const falling = prog(t, ti - 0.14, 0.14);
          if (t < ti - 0.14) return <span key={i} style={{ opacity: 0 }}>{ch}</span>;
          const y = (1 - ease.expoIn(falling)) * -520;
          const h = hit(t, ti, 13);
          const trail = t < ti + 0.18 ? 1 - prog(t, ti, 0.18) : 0;
          return (
            <span key={i} style={{ position: 'relative', display: 'inline-block' }}>
              {trail > 0 &&
                [1, 2].map((g) => (
                  <span
                    key={g}
                    style={{ position: 'absolute', left: 0, top: 0, opacity: (0.22 / g) * trail, transform: `translateY(${y - g * 70 * trail}px)` }}
                  >
                    {ch}
                  </span>
                ))}
              <span
                style={{
                  display: 'inline-block',
                  transformOrigin: '50% 100%',
                  transform: `translateY(${y}px) scale(${1 + 0.16 * h}, ${1 - 0.2 * h})`,
                }}
              >
                {ch}
              </span>
            </span>
          );
        })}
      </At>

      {/* AGGARWAL wipe */}
      <At x={L.x + 8} y={L.subY}>
        <div style={{ position: 'relative' }}>
          <div
            style={{
              font: `900 ${L.sub}px/1 ${F.sans}`,
              letterSpacing: '-0.05em',
              clipPath: `inset(0 ${100 - reveal * 100}% 0 0)`,
              ...gradText(),
            }}
          >
            AGGARWAL
          </div>
          {t > 2 && reveal < 0.995 && (
            <div
              style={{
                position: 'absolute',
                top: -6,
                bottom: -6,
                left: `${reveal * 100}%`,
                width: 10,
                background: C.crema,
                boxShadow: `0 0 40px ${C.caramel}, 0 0 12px ${C.foam}`,
              }}
            />
          )}
        </div>
      </At>

      <At x={L.x + 14} y={L.monoY} style={{ font: `600 ${L.mono}px ${F.mono}`, letterSpacing: '0.3em', color: C.latte, whiteSpace: 'nowrap' }}>
        {typed('DATA ENGINEER · TEXAS INSTRUMENTS', t, 2.55, 40)}
        <span style={{ opacity: Math.floor(t * 4) % 2 ? 1 : 0, color: C.caramel }}>▍</span>
      </At>
    </Stage>
  );
}

export const nameSlamKb = (t: number, g: Geo): KbFrame => {
  const xs = g.portrait ? LETTER_X.port : LETTER_X.land;
  const baseY = g.portrait ? 540 : 400;
  const i = Math.min(3, Math.floor(t / BEAT));
  const since = t - i * BEAT;
  const [fx, fy] = g.toFrac(xs[i], baseY);
  return {
    focus: t < 2 ? { x: fx, y: fy, radius: 2.2, strength: Math.exp(-since * 4) } : null,
    pump: 0.3 * beatEnv(t, 7),
    shockR: t >= 2 ? (t - 2) * 12 : -1,
    shockAmp: t >= 2 ? 0.8 * Math.exp(-(t - 2) * 1.6) : 0,
    all: 0,
  };
};

/* ------------------------------------------------------------------ 03 */

export function Role(p: SceneProps) {
  const { t, W, H, portrait } = p;
  const L = portrait
    ? { x: 50, y: 330, data: 240, eng: 168, engX: 70, engY: 600 }
    : { x: 70, y: 90, data: 330, eng: 220, engX: 330, engY: 380 };

  const aRef = useRef<HTMLSpanElement>(null);
  const [origin, setOrigin] = useState({ x: W / 2, y: H / 2 });
  useLayoutEffect(() => {
    const a = aRef.current;
    if (!a) return;
    // The counter of the "A": horizontally centred, about two-thirds down.
    setOrigin({ x: L.x + a.offsetLeft + a.offsetWidth / 2, y: L.y + a.offsetTop + a.offsetHeight * 0.64 });
  }, [L.x, L.y, W, H]);

  const zoom = ease.expoIn(prog(t, 1.45, 0.5));
  const ticker = '@ TEXAS INSTRUMENTS ✦ BANGALORE ✦ 3+ YEARS ✦ PYSPARK ✦ KAFKA ✦ RUST ✦ ICEBERG ✦ AIRFLOW ✦ ';

  return (
    <Stage
      p={p}
      bg={C.oat}
      cam={{ s: 1 + zoom * 44 + 0.02 * hit(t, 0, 8), ox: origin.x, oy: origin.y }}
      overlay={
        <>
          <Flash color={C.foam} opacity={hit(t, 0, 14)} />
          <Flash color={C.cinnamon} opacity={clamp01((zoom - 0.55) / 0.35)} />
        </>
      }
    >
      <At x={L.x} y={L.y} style={{ font: `900 ${L.data}px/0.9 ${F.sans}`, letterSpacing: '-0.06em', whiteSpace: 'nowrap' }}>
        {'DATA'.split('').map((ch, i) => {
          const k = ease.expoOut(prog(t, 0.04 + i * 0.07, 0.35));
          return (
            <span
              key={i}
              ref={i === 1 ? aRef : undefined}
              style={{
                display: 'inline-block',
                color: 'transparent',
                WebkitTextStroke: `5px ${C.espresso}`,
                opacity: k,
                transform: `translateY(${(1 - k) * 80}px)`,
              }}
            >
              {ch}
            </span>
          );
        })}
      </At>
      <svg className="absolute inset-0 pointer-events-none" width={W} height={H}>
        <circle cx={origin.x} cy={origin.y} r={26 + 6 * beatEnv(t, 9)} fill={C.cinnamon} opacity={tw(t, 0.4, 0.3, 0, 0.95)} />
        <circle cx={origin.x} cy={origin.y} r={46} fill="none" stroke={C.cinnamon} strokeWidth={3} opacity={tw(t, 0.6, 0.3, 0, 0.35)} />
      </svg>
      <At x={L.engX} y={L.engY} style={{ font: `italic 600 ${L.eng}px/1 ${F.display}`, letterSpacing: '-0.03em', color: C.cinnamon, whiteSpace: 'nowrap' }}>
        {'Engineer'.split('').map((ch, i) => {
          const k = ease.expoOut(prog(t, 0.3 + i * 0.045, 0.45));
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                opacity: k,
                filter: `blur(${(1 - k) * 10}px)`,
                transform: `translateY(${(1 - k) * 140}px) rotate(${(1 - k) * 12}deg)`,
              }}
            >
              {ch}
            </span>
          );
        })}
      </At>
      <div
        className="absolute left-0 right-0 overflow-hidden"
        style={{ bottom: 0, height: portrait ? 110 : 96, background: C.espresso, display: 'flex', alignItems: 'center' }}
      >
        <div
          style={{
            font: `700 ${portrait ? 30 : 28}px ${F.mono}`,
            color: C.crema,
            letterSpacing: '0.12em',
            whiteSpace: 'nowrap',
            transform: `translateX(${-120 - t * 320}px)`,
          }}
        >
          {ticker.repeat(3)}
        </div>
      </div>
    </Stage>
  );
}
