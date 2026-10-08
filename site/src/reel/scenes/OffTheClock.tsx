import type { ReactNode } from 'react';
import { At, Flash, Stage, type SceneProps } from '../Stage';
import { BEAT, beatEnv, clamp01, ease, hit, lerp, prog, rand, tw, typed } from '../anim';
import { C, F, gradText } from '../palette';
import BlackHole from '../../components/BlackHole';
import { tr } from '../../i18n';

/* ------------------------------------------------------------------ 09 */

function swirl(turns = 4.5, r0 = 6, r1 = 230) {
  let d = '';
  for (let i = 0; i <= 160; i++) {
    const k = i / 160;
    const a = k * Math.PI * 2 * turns;
    const r = r0 + k * (r1 - r0);
    d += `${i ? 'L' : 'M'}${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)} `;
  }
  return d;
}
const SWIRL = swirl();

export function BlackHoleScene(p: SceneProps) {
  const { t, W, H, portrait } = p;
  const latte = t < 1.0;
  const zoom = ease.expoIn(prog(t, 0, 1.0));
  const dark = prog(t, 0.55, 0.45);
  const reveal = prog(t, 1.0, 0.45);
  const headline = tr('I think about black holes.').split(' ');

  if (latte) {
    return (
      <Stage
        p={p}
        bg={C.mocha}
        cam={{ s: 1 + zoom * 2.6, r: t * 40 }}
        overlay={<Flash color={C.void} opacity={dark} />}
        hud={
          <At x={W / 2} y={H - (portrait ? 220 : 120)} anchor="tc" style={{ font: `600 22px ${F.mono}`, letterSpacing: '0.3em', color: C.foam, whiteSpace: 'nowrap', opacity: 1 - dark }}>
            {tr('ACT IV · OFF THE CLOCK')}
          </At>
        }
      >
        <svg className="absolute inset-0" width={W} height={H}>
          <g transform={`translate(${W / 2} ${H / 2})`}>
            <circle r={330} fill={C.crema} stroke={C.cocoa} strokeWidth={24} />
            <circle r={300} fill={C.latte} />
            <path d={SWIRL} transform={`rotate(${t * 520})`} fill="none" stroke={C.foam} strokeWidth={16} strokeLinecap="round" />
          </g>
        </svg>
      </Stage>
    );
  }

  const L = portrait
    ? { tx: 60, ty: 170, hs: 92, hole: { x: 0.5, y: 0.66, r: 0.2 } }
    : { tx: 80, ty: 230, hs: 96, hole: { x: 0.68, y: 0.52, r: 0.19 } };

  return (
    <Stage
      p={p}
      bg={C.void}
      backdrop={
        <div className="absolute inset-0" style={{ opacity: reveal, transform: `scale(${tw(t, 1, 3, 1.08, 1, ease.cubicOut)}) rotate(${tw(t, 1, 3, -2, 1, ease.sineInOut)}deg)` }}>
          <BlackHole t={t * 1.2} hole={L.hole} stars={320} />
        </div>
      }
      overlay={<Flash color={C.void} opacity={1 - reveal} />}
    >
      <At x={L.tx} y={L.ty} style={{ font: `600 ${portrait ? 24 : 22}px ${F.mono}`, letterSpacing: '0.3em', color: C.caramel }}>
        {typed(tr('ACT IV · OFF THE CLOCK'), t, 1.25, 50)}
      </At>
      <At x={L.tx} y={L.ty + 50} style={{ width: portrait ? 780 : 640, font: `italic 500 ${L.hs}px/1.02 ${F.display}`, letterSpacing: '-0.02em', color: C.crema }}>
        {headline.map((w, i) => {
          const k = ease.expoOut(prog(t, 1.5 + i * 0.13, 0.5));
          return (
            <span key={i} style={{ display: 'inline-block', marginRight: '0.24em', opacity: k, filter: `blur(${(1 - k) * 14}px)`, transform: `translateY(${(1 - k) * 24}px)` }}>
              {w}
            </span>
          );
        })}
      </At>
      <At x={L.tx} y={L.ty + (portrait ? 340 : 330)} style={{ font: `600 ${portrait ? 22 : 20}px ${F.mono}`, letterSpacing: '0.16em', color: C.latte, opacity: prog(t, 2.6, 0.3) }}>
        {tr('ASTROPHYSICS · GENERAL RELATIVITY')}
      </At>
    </Stage>
  );
}

/* ------------------------------------------------------------------ 10 */

const THETAS = [0.6, 1.25, 0.85, 1.55, 1.1];

export function Quantum(p: SceneProps) {
  const { t, W, H, portrait } = p;
  const L = portrait
    ? { cx: 450, cy: 470, R: 290, tx: 60, ty: 860, eq: 64 }
    : { cx: 340, cy: 450, R: 250, tx: 700, ty: 150, eq: 78 };
  const b = Math.min(3, Math.floor(t / BEAT));
  const theta = lerp(THETAS[b], THETAS[b + 1], ease.backOut(prog(t, b * BEAT, 0.25)));
  const phi = t * 3.4;
  const vec = (th: number, ph: number) => [
    L.cx + L.R * Math.sin(th) * Math.cos(ph),
    L.cy - L.R * Math.cos(th) * 0.95 + L.R * Math.sin(th) * Math.sin(ph) * 0.26,
  ];
  const [vx, vy] = vec(theta, phi);
  const trail = Array.from({ length: 14 }, (_, k) => vec(theta, phi - k * 0.09));
  const appear = ease.backOut(prog(t, 0, 0.32));
  const collapsed = t >= 1.5;
  const flick = Math.floor(t / 0.0625) % 2 === 0;
  const glitch = t > 0.9 && !collapsed;

  return (
    <Stage p={p} bg={C.espresso} overlay={<Flash color={C.foam} opacity={0.25 * hit(t, 1.5, 12)} />} cam={{ s: 1 + 0.015 * beatEnv(t, 9) }}>
      <svg className="absolute inset-0 overflow-visible" width={W} height={H}>
        <g transform={`translate(${L.cx} ${L.cy}) scale(${appear}) translate(${-L.cx} ${-L.cy})`}>
          <circle cx={L.cx} cy={L.cy} r={L.R} fill="rgba(212,154,87,.06)" stroke={C.latte} strokeWidth={4} />
          <ellipse cx={L.cx} cy={L.cy} rx={L.R} ry={L.R * 0.26} fill="none" stroke={C.latte} strokeWidth={3} strokeDasharray="10 10" />
          <path d={`M${L.cx} ${L.cy - L.R - 30} V${L.cy + L.R + 30} M${L.cx - L.R - 30} ${L.cy} H${L.cx + L.R + 30}`} stroke={C.mocha} strokeWidth={3} />
          <polyline points={trail.map(([x, y]) => `${x},${y}`).join(' ')} fill="none" stroke={C.caramel} strokeWidth={4} strokeDasharray="2 10" opacity={0.7} />
          <path d={`M${L.cx} ${L.cy} L${vx} ${vy}`} stroke={C.cinnamon} strokeWidth={11} strokeLinecap="round" />
          <circle cx={vx} cy={vy} r={17} fill={C.caramel} />
          <text x={L.cx + 16} y={L.cy - L.R - 34} fill={C.crema} fontFamily={F.display} fontSize={44}>|0⟩</text>
          <text x={L.cx + 16} y={L.cy + L.R + 66} fill={C.crema} fontFamily={F.display} fontSize={44}>|1⟩</text>
        </g>
      </svg>
      <At x={L.tx} y={L.ty} style={{ font: `400 ${L.eq}px ${F.display}`, color: C.crema, whiteSpace: 'nowrap' }}>
        {typed('|ψ⟩ = α|0⟩ + β|1⟩', t, 0.05, 32)}
      </At>
      <At x={L.tx} y={L.ty + L.eq * 1.5} style={{ font: `italic 400 ${portrait ? 46 : 48}px ${F.display}`, color: C.latte, opacity: prog(t, 0.55, 0.25), transform: `translateY(${(1 - ease.expoOut(prog(t, 0.55, 0.3))) * 20}px)` }}>
        {tr('…and qubits that are both')}
      </At>
      <At x={L.tx} y={L.ty + L.eq * 1.5 + 90} style={{ opacity: prog(t, 0.85, 0.1) }}>
        <div style={{ position: 'relative', font: `900 ${portrait ? 170 : 170}px/1 ${F.sans}`, letterSpacing: '-0.06em' }}>
          {!collapsed ? (
            <>
              <div style={{ color: C.caramel, position: 'relative', zIndex: flick ? 2 : 1 }}>{tr('WORK')}</div>
              <div
                style={{
                  position: 'absolute',
                  left: 40 + (glitch ? Math.sin(t * 80) * 8 : 0),
                  top: 60,
                  zIndex: flick ? 1 : 2,
                  color: 'transparent',
                  WebkitTextStroke: `4px ${C.crema}`,
                }}
              >
                {tr('PLAY')}
              </div>
              {glitch && (
                <div style={{ position: 'absolute', left: 6, top: -4, color: C.cinnamon, opacity: 0.35, mixBlendMode: 'screen' }}>{tr('WORK')}</div>
              )}
            </>
          ) : (
            <>
              <div
                style={{
                  color: C.caramel,
                  opacity: 1 - prog(t, 1.5, 0.2),
                  filter: `blur(${prog(t, 1.5, 0.2) * 12}px)`,
                  transform: `translateY(${prog(t, 1.5, 0.3) * 60}px)`,
                }}
              >
                {tr('WORK')}
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: 40,
                  top: 60,
                  transformOrigin: '20% 60%',
                  transform: `scale(${1 + 0.18 * hit(t, 1.5, 10)})`,
                  ...gradText(),
                }}
              >
                {tr('PLAY')}
              </div>
            </>
          )}
        </div>
      </At>
      <At x={L.tx} y={portrait ? L.ty + 600 : H - 120} style={{ font: `600 22px ${F.mono}`, letterSpacing: '0.18em', color: C.latte }}>
        {collapsed ? typed(tr('MEASURED → |play⟩'), t, 1.55, 60) : tr('QUANTUM COMPUTING · SUPERPOSITION')}
      </At>
    </Stage>
  );
}

/* ------------------------------------------------------------------ 11 */

const GLYPHS = ['∑', '∫', '∇', 'ħ', '∞', 'λ', '∂', 'Δ', 'φ', 'ζ(s)', '√2', 'ℏω', '∮', 'ψ', 'π', 'e'];
const TOKENS: { s: ReactNode; beat: number; sup?: boolean }[] = [
  { s: 'e', beat: 0 },
  { s: 'iπ', beat: 1, sup: true },
  { s: '+', beat: 2 },
  { s: '1', beat: 2 },
  { s: '=', beat: 3 },
  { s: '0', beat: 3 },
];

export function Maths(p: SceneProps) {
  const { t, W, H, portrait } = p;
  const size = portrait ? 170 : 240;
  return (
    <Stage p={p} bg={C.oat} cam={{ s: 1 + 0.03 * beatEnv(t, 10) }}>
      <div className="absolute inset-0" style={{ color: C.latte }}>
        {Array.from({ length: 38 }, (_, i) => (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: rand(i, 1) * (W - 80),
              top: rand(i, 2) * (H - 80),
              font: `400 ${30 + rand(i, 3) * 44}px ${F.display}`,
              opacity: 0.3 + rand(i, 4) * 0.35,
              transform: `translateY(${-t * 14 * rand(i, 5)}px) rotate(${rand(i, 6) * 40 - 20}deg)`,
            }}
          >
            {GLYPHS[i % GLYPHS.length]}
          </span>
        ))}
      </div>
      <At x={W / 2} y={H * (portrait ? 0.4 : 0.42)} anchor="c" style={{ display: 'flex', alignItems: 'baseline', gap: size * 0.12, font: `700 ${size}px/1 ${F.display}`, color: C.espresso, whiteSpace: 'nowrap' }}>
        {TOKENS.map((tok, i) => {
          const tb = tok.beat * BEAT;
          const fly = ease.expoIn(prog(t, tb - 0.22, 0.22));
          const ang = rand(i, 9) * Math.PI * 2;
          const dist = 900;
          const settled = t >= tb;
          const dx = settled ? 0 : Math.cos(ang) * dist * (1 - fly);
          const dy = settled ? 0 : Math.sin(ang) * dist * (1 - fly);
          const rot = settled ? 0 : (rand(i, 8) * 360 - 180) * (1 - fly);
          const pop = 1 + 0.2 * hit(t, tb, 12);
          const visible = t >= tb - 0.22;
          return (
            <span
              key={i}
              style={{
                position: 'relative',
                display: 'inline-block',
                opacity: visible ? 1 : 0,
                color: tok.sup ? C.cinnamon : undefined,
                fontSize: tok.sup ? size * 0.48 : undefined,
                transform: `translate(${dx}px, ${dy + (tok.sup ? -size * 0.55 : 0)}px) rotate(${rot}deg) scale(${pop})`,
                filter: settled ? undefined : `blur(${(1 - fly) * 6}px)`,
              }}
            >
              {tok.s}
              {settled && t < tb + 0.4 && (
                <svg className="absolute" style={{ left: '50%', top: '50%', overflow: 'visible' }} width={1} height={1}>
                  {Array.from({ length: 7 }, (_, k) => {
                    const a = (k / 7) * Math.PI * 2;
                    const r = 30 + 90 * ease.expoOut(prog(t, tb, 0.4));
                    return <circle key={k} cx={Math.cos(a) * r} cy={Math.sin(a) * r} r={5} fill={C.latte} opacity={1 - prog(t, tb, 0.4)} />;
                  })}
                </svg>
              )}
            </span>
          );
        })}
      </At>
      <At x={W / 2} y={H * (portrait ? 0.6 : 0.7)} anchor="tc" style={{ font: `italic 400 ${portrait ? 46 : 56}px ${F.display}`, color: C.mocha, whiteSpace: 'nowrap' }}>
        {typed(tr('five constants, one line, no notes.'), t, 1.4, 70)}
      </At>
      <At x={portrait ? 60 : 80} y={portrait ? 130 : 100} style={{ font: `600 22px ${F.mono}`, letterSpacing: '0.2em', color: C.mocha }}>
        {tr('MATHS · EULER’S IDENTITY')}
      </At>
    </Stage>
  );
}

/** Navier–Stokes: how coffee (and everything else) flows. Terms land on the beats. */
const NS_TERMS = [
  { at: 0, s: 'ρ(∂u/∂t + (u·∇)u)', line: 0 },
  { at: BEAT, s: '= −∇p', line: 1 },
  { at: 2 * BEAT, s: '+ μ∇²u', line: 1 },
  { at: 3 * BEAT, s: '+ f', line: 1 },
];

export function NavierStokes(p: SceneProps) {
  const { t, W, H, portrait } = p;
  const size = portrait ? 86 : 90;
  const cx = W / 2;
  const cy = H * (portrait ? 0.46 : 0.5);
  // Fraunces' italic operators are hairlines: set them upright in Inter so they read
  const ops = (str: string) =>
    str.split(/([+=−])/).map((part, j) =>
      /^[+=−]$/.test(part) ? (
        <span key={j} style={{ fontFamily: F.sans, fontStyle: 'normal', fontWeight: 300, margin: '0 0.14em', color: C.latte }}>
          {part}
        </span>
      ) : (
        part
      ),
    );
  const sq = portrait ? 1 : 0.6;
  const lines = portrait ? [0, 1] : [0];
  return (
    <Stage
      p={p}
      bg={C.espresso}
      cam={{ s: 1 + 0.025 * beatEnv(t, 10) }}
      backdrop={<div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% ${portrait ? 46 : 50}%, ${C.roast} 0%, ${C.espresso} 60%, #0b0705 100%)` }} />}
    >
      {/* a stirred cup seen from above: particles riding a vortex, faster near the middle */}
      <svg className="absolute inset-0" width={W} height={H}>
        <defs>
          <radialGradient id="nsCalm">
            <stop offset="0" stopColor={C.espresso} stopOpacity="0.96" />
            <stop offset="0.55" stopColor={C.espresso} stopOpacity="0.7" />
            <stop offset="1" stopColor={C.espresso} stopOpacity="0" />
          </radialGradient>
        </defs>
        {Array.from({ length: 170 }, (_, i) => {
          const r = 60 + rand(i, 1) * (portrait ? 430 : 620);
          const w = 2.4 / (0.35 + r / 170);
          const a0 = rand(i, 2) * Math.PI * 2 + t * w;
          const a1 = a0 - 0.22 - 7 / Math.sqrt(r);
          const x0 = cx + Math.cos(a1) * r;
          const y0 = cy + Math.sin(a1) * r * sq;
          const x1 = cx + Math.cos(a0) * r;
          const y1 = cy + Math.sin(a0) * r * sq;
          return (
            <path
              key={i}
              d={`M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r * sq} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`}
              fill="none"
              stroke={rand(i, 3) > 0.6 ? C.caramel : C.latte}
              strokeWidth={1.5 + rand(i, 4) * 3}
              strokeLinecap="round"
              opacity={0.16 + 0.34 * rand(i, 5)}
            />
          );
        })}
        {/* a calm eye in the middle of the storm, where the equation sits */}
        <ellipse cx={cx} cy={cy} rx={portrait ? 430 : 760} ry={portrait ? 280 : 210} fill="url(#nsCalm)" />
      </svg>
      {lines.map((line) => (
        <At
          key={line}
          x={W / 2}
          y={cy + (portrait ? (line - 0.5) * size * 1.25 : 0)}
          anchor="c"
          style={{ display: 'flex', columnGap: size * 0.28, font: `italic 500 ${size}px/1.2 ${F.display}`, color: C.crema, whiteSpace: 'nowrap' }}
        >
          {NS_TERMS.filter((term) => (portrait ? term.line === line : true)).map((term) => {
            const e = ease.backOutHard(prog(t, term.at, 0.25));
            return (
              <span
                key={term.s}
                style={{
                  display: 'inline-block',
                  opacity: t >= term.at ? 1 : 0,
                  color: term.at === 0 ? C.crema : C.caramel,
                  textShadow: `0 0 40px ${term.at === 0 ? 'rgba(233,217,191,.25)' : 'rgba(212,154,87,.35)'}`,
                  transform: `translateY(${(1 - e) * 50}px) scale(${lerp(1.4, 1, e) * (1 + 0.1 * hit(t, term.at, 12))})`,
                }}
              >
                {ops(term.s)}
              </span>
            );
          })}
        </At>
      ))}
      <At x={W / 2} y={H * (portrait ? 0.66 : 0.72)} anchor="tc" style={{ font: `italic 400 ${portrait ? 40 : 48}px ${F.display}`, color: C.latte, whiteSpace: 'nowrap' }}>
        {typed(tr('the million-dollar question: does it stay smooth?'), t, 1.45, 110)}
      </At>
      <At x={portrait ? 60 : 80} y={portrait ? 130 : 100} style={{ font: `600 22px ${F.mono}`, letterSpacing: '0.2em', color: C.caramel }}>
        {tr('MATHS · NAVIER–STOKES')}
      </At>
    </Stage>
  );
}

/* ------------------------------------------------------------------ 12 */

function FrameArt({ kind, t, loop }: { kind: number; t: number; loop: number }) {
  const S = 300;
  if (kind === 0) {
    // Interstellar: an endless tesseract corridor.
    return (
      <svg width={S} height={230} viewBox="0 0 300 230">
        <g fill="none" stroke={C.caramel} strokeWidth={2.5}>
          {Array.from({ length: 5 }, (_, j) => {
            const k = ((j + t * 0.9) % 5) / 5;
            const s = 0.08 + k * 0.92;
            return <rect key={j} x={150 - 130 * s} y={115 - 100 * s} width={260 * s} height={200 * s} opacity={0.25 + 0.75 * k} />;
          })}
          <path d="M20 15 L140 105 M280 15 L160 105 M20 215 L140 125 M280 215 L160 125" opacity={0.6} />
        </g>
      </svg>
    );
  }
  if (kind === 1) {
    // Inception: the top, still spinning.
    const spin = Math.cos(t * 40);
    const wob = Math.sin(t * 6) * 6;
    return (
      <svg width={S} height={230} viewBox="0 0 300 230">
        <path d="M30 200 H270" stroke={C.mocha} strokeWidth={4} />
        <ellipse cx={150} cy={202} rx={46} ry={6} fill={C.mocha} opacity={0.3} />
        <g transform={`rotate(${wob} 150 198)`}>
          <path d="M150 40 L150 72" stroke={C.espresso} strokeWidth={8} strokeLinecap="round" />
          <path d="M95 112 Q150 62 205 112 Q170 152 150 198 Q130 152 95 112Z" fill={C.cinnamon} stroke={C.espresso} strokeWidth={5} />
          <ellipse cx={150} cy={112} rx={55} ry={12} fill={C.caramel} stroke={C.espresso} strokeWidth={4} />
          <path d={`M${150 + spin * 40} 104 L${150 + spin * 30} 120`} stroke={C.foam} strokeWidth={5} strokeLinecap="round" />
        </g>
        <g fill="none" stroke={C.mocha} strokeWidth={3} opacity={0.5}>
          <path d="M60 100 A95 30 0 0 0 240 100" strokeDasharray="8 8" strokeDashoffset={-t * 120} />
        </g>
      </svg>
    );
  }
  if (kind === 2) {
    // Dexter: one drop on a glass slide.
    const ph = (t * 1.3) % 1;
    const falling = ph < 0.55;
    const dy = falling ? -60 + ease.cubicIn(ph / 0.55) * 160 : 100;
    const splat = falling ? 0 : ease.expoOut((ph - 0.55) / 0.45);
    return (
      <svg width={S} height={230} viewBox="0 0 300 230">
        <rect x={40} y={110} width={220} height={66} rx={4} fill={C.crema} stroke={C.taupe} strokeWidth={4} />
        {falling ? (
          <path d={`M150 ${dy - 24} C 136 ${dy - 4}, 138 ${dy + 10}, 150 ${dy + 12} C 162 ${dy + 10}, 164 ${dy - 4}, 150 ${dy - 24}Z`} fill={C.cherry} />
        ) : (
          <g>
            <ellipse cx={150} cy={140} rx={12 + 26 * splat} ry={6 + 10 * splat} fill={C.cherry} />
            {[-1, 1].map((d) => (
              <circle key={d} cx={150 + d * (30 + 30 * splat)} cy={136 - 8 * splat} r={4} fill={C.cherry} opacity={splat} />
            ))}
          </g>
        )}
      </svg>
    );
  }
  if (kind === 4) {
    // Books: one more chapter, a page always mid-turn.
    const ph = (t * 0.9) % 1;
    const turn = Math.cos(ph * Math.PI); // 1 → −1: right page sweeps to the left
    return (
      <svg width={S} height={230} viewBox="0 0 300 230">
        <path d="M150 60 Q100 44 34 52 V192 Q100 184 150 200Z" fill={C.oat} stroke={C.mocha} strokeWidth={3} />
        <path d="M150 60 Q200 44 266 52 V192 Q200 184 150 200Z" fill={C.crema} stroke={C.mocha} strokeWidth={3} />
        <g stroke={C.taupe} strokeWidth={3} strokeLinecap="round" opacity={0.7}>
          {[0, 1, 2, 3, 4].map((j) => (
            <g key={j}>
              <path d={`M52 ${82 + j * 22} H${128 - (j % 2) * 18}`} />
              <path d={`M172 ${82 + j * 22} H${248 - ((j + 1) % 2) * 22}`} />
            </g>
          ))}
        </g>
        <path
          d={`M150 60 Q${150 + 58 * turn} ${48 - 10 * Math.abs(turn)} ${150 + 116 * turn} 54 V194 Q${150 + 58 * turn} ${186 - 6 * Math.abs(turn)} 150 200Z`}
          fill={turn > 0 ? C.foam : C.oat}
          stroke={C.mocha}
          strokeWidth={3}
          opacity={0.95}
        />
        <path d="M150 58 V202" stroke={C.mocha} strokeWidth={4} />
      </svg>
    );
  }
  if (kind === 5) {
    // Piano: keys pressed on the beat.
    const melody = [0, 2, 4, 2, 5, 4, 2, 0];
    const down = melody[Math.floor(t / (BEAT / 2)) % melody.length];
    const black = [0, 1, 3, 4, 5];
    return (
      <svg width={S} height={230} viewBox="0 0 300 230">
        {Array.from({ length: 7 }, (_, j) => (
          <rect key={j} x={24 + j * 36} y={70 + (j === down ? 5 : 0)} width={34} height={140} rx={4} fill={j === down ? C.latte : C.foam} stroke={C.mocha} strokeWidth={2} />
        ))}
        {black.map((j) => (
          <rect key={j} x={24 + j * 36 + 24} y={70} width={22} height={86} rx={3} fill={C.espresso} />
        ))}
        {[0, 1, 2].map((j) => {
          const u = (t * 0.8 + j / 3) % 1;
          return (
            <text key={j} x={60 + j * 80 + Math.sin(u * 6 + j) * 10} y={60 - u * 50} fontSize={28} fill={C.caramel} opacity={1 - u} fontFamily={F.display}>
              {j % 2 ? '♫' : '♪'}
            </text>
          );
        })}
      </svg>
    );
  }
  if (kind === 6) {
    // Travelling: a window-seat route, the plane always somewhere new.
    const u = (t * 0.45) % 1;
    const P = (v: number) => [(1 - v) ** 2 * 40 + 2 * (1 - v) * v * 150 + v * v * 262, (1 - v) ** 2 * 180 + 2 * (1 - v) * v * 10 + v * v * 168];
    const [px, py] = P(u);
    const [qx, qy] = P(Math.min(1, u + 0.01));
    const ang = (Math.atan2(qy - py, qx - px) * 180) / Math.PI;
    return (
      <svg width={S} height={230} viewBox="0 0 300 230">
        <path d="M40 180 Q150 10 262 168" fill="none" stroke={C.mocha} strokeWidth={3} strokeDasharray="2 10" strokeLinecap="round" />
        {[
          [40, 180],
          [262, 168],
        ].map(([x, y], j) => (
          <g key={j} transform={`translate(${x} ${y})`}>
            <path d="M0 0 C-14 -16 -14 -34 0 -34 C14 -34 14 -16 0 0Z" fill={C.cinnamon} />
            <circle cy={-23} r={5} fill={C.crema} />
          </g>
        ))}
        <g transform={`translate(${px} ${py}) rotate(${ang})`}>
          <path d="M-18 0 L14 0 M2 0 L-8 -14 M2 0 L-8 14 M-16 0 L-21 -6 M-16 0 L-21 6" stroke={C.espresso} strokeWidth={5} strokeLinecap="round" />
        </g>
      </svg>
    );
  }
  if (kind === 7) {
    // Cooking: a flip, a sizzle, some steam.
    const ph = (t * 0.85) % 1;
    const air = ph < 0.6 ? Math.sin((ph / 0.6) * Math.PI) : 0;
    const spin = ph < 0.6 ? (ph / 0.6) * 360 : 0;
    return (
      <svg width={S} height={230} viewBox="0 0 300 230">
        {[0, 1, 2].map((j) => {
          const v = (t * 0.6 + j / 3) % 1;
          return (
            <path
              key={j}
              d={`M${110 + j * 40} ${150 - v * 70} q8 -12 0 -24 q-8 -12 0 -24`}
              fill="none"
              stroke={C.foam}
              strokeWidth={4}
              strokeLinecap="round"
              opacity={0.7 * Math.sin(v * Math.PI)}
            />
          );
        })}
        <g transform={`translate(150 ${168 - air * 110}) rotate(${spin})`}>
          <ellipse rx={40} ry={9} fill={C.mocha} />
          <ellipse rx={30} ry={5} cy={-2} fill={C.cinnamon} opacity={0.7} />
        </g>
        <ellipse cx={150} cy={182} rx={78} ry={18} fill={C.espresso} />
        <path d="M226 180 L286 172" stroke={C.espresso} strokeWidth={12} strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === 8) {
    // Harry Potter: round glasses, and a bolt that strikes on the beat.
    const strike = Math.exp(-((t % (BEAT * 2)) / (BEAT * 2)) * 5);
    return (
      <svg width={S} height={230} viewBox="0 0 300 230">
        <g fill="none" stroke={C.crema} strokeWidth={8}>
          <circle cx={105} cy={130} r={42} />
          <circle cx={195} cy={130} r={42} />
          <path d="M147 124 Q150 114 153 124 M63 124 L30 110 M237 124 L270 110" />
        </g>
        <path d="M160 20 L132 70 L152 70 L128 112 L178 58 L156 58 L176 20Z" fill={C.caramel} opacity={0.35 + 0.65 * strike} transform={`translate(0 ${-6 * strike})`} />
      </svg>
    );
  }
  if (kind === 9) {
    // The Hobbit: a round green door, and a ring that won't stop glinting.
    const glint = (Math.sin(t * 6) + 1) / 2;
    return (
      <svg width={S} height={230} viewBox="0 0 300 230">
        <path d="M30 210 H270" stroke={C.mocha} strokeWidth={6} />
        <circle cx={150} cy={130} r={80} fill="#3f5a3a" stroke={C.espresso} strokeWidth={6} />
        {[-40, -14, 12, 38].map((x) => (
          <path key={x} d={`M${150 + x} 54 V206`} stroke={C.espresso} strokeWidth={3} opacity={0.35} />
        ))}
        <circle cx={150} cy={130} r={9} fill={C.caramel} />
        <g transform="translate(232 196)">
          <ellipse rx={18} ry={7} fill="none" stroke={C.caramel} strokeWidth={6} />
          <circle cx={-10} cy={-4} r={2 + 4 * glint} fill={C.foam} opacity={glint} />
        </g>
      </svg>
    );
  }
  if (kind === 10) {
    // Star Wars: a blade that ignites on the downbeat, under a field of stars.
    const ignite = ease.expoOut(clamp01((t % (BEAT * 4)) / 0.25));
    return (
      <svg width={S} height={230} viewBox="0 0 300 230">
        {Array.from({ length: 22 }, (_, j) => (
          <circle key={j} cx={rand(j, 41) * 300} cy={rand(j, 42) * 230} r={1 + rand(j, 43) * 2} fill={C.foam} opacity={0.4 + 0.6 * rand(j, 44)} />
        ))}
        <g transform="rotate(-35 150 115)">
          <rect x={146} y={60 + 120 * (1 - ignite)} width={8} height={120 * ignite} rx={4} fill={C.foam} style={{ filter: `drop-shadow(0 0 10px ${C.cinnamon}) drop-shadow(0 0 20px ${C.cinnamon})` }} />
          <rect x={141} y={180} width={18} height={42} rx={3} fill={C.latte} stroke={C.espresso} strokeWidth={3} />
        </g>
      </svg>
    );
  }
  // Re:Zero: Return by Death, with the reel's own loop counter.
  return (
    <svg width={S} height={230} viewBox="-150 -115 300 230">
      <g transform={`rotate(${-t * 220})`}>
        <circle r={72} fill="none" stroke={C.caramel} strokeWidth={10} strokeDasharray="380 72" />
        <path d="M60 -48 l26 -6 l-6 26" fill="none" stroke={C.caramel} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" transform="rotate(-6)" />
      </g>
      <text y={12} textAnchor="middle" fontFamily={F.mono} fontWeight={700} fontSize={32} fill={C.crema}>
        ×{loop + 1}
      </text>
    </svg>
  );
}

const FILMS = [
  { art: 0, title: 'INTERSTELLAR', take: '10/10', bg: '#120c09', fg: C.crema, accent: C.caramel },
  { art: 1, title: 'INCEPTION', take: tr('still spinning?'), bg: C.oat, fg: C.espresso, accent: C.cinnamon },
  { art: 2, title: 'DEXTER', take: tr('methodical.'), bg: C.foam, fg: C.espresso, accent: C.cherry },
  { art: 3, title: 'RE:ZERO', take: tr('return by death'), bg: C.roast, fg: C.crema, accent: C.caramel },
  { art: 8, title: 'HARRY POTTER', take: tr('always.'), bg: '#2a1d16', fg: C.crema, accent: C.caramel },
  { art: 9, title: 'THE HOBBIT', take: tr('there and back again'), bg: C.crema, fg: C.espresso, accent: '#3f5a3a' },
  { art: 10, title: 'STAR WARS', take: tr('a long time ago…'), bg: '#0d0806', fg: C.foam, accent: C.caramel },
  { art: 4, title: tr('BOOKS'), take: tr('one more chapter'), bg: C.cocoa, fg: C.crema, accent: C.caramel },
  { art: 5, title: tr('PIANO'), take: tr('keys after dark'), bg: C.void, fg: C.crema, accent: C.latte },
  { art: 6, title: tr('TRAVELLING'), take: tr('window seat, always'), bg: C.crema, fg: C.espresso, accent: C.cinnamon },
  { art: 7, title: tr('COOKING'), take: tr('no recipe, all taste'), bg: C.caramel, fg: C.espresso, accent: C.cherry },
];

export function Cinema(p: SceneProps) {
  const { t, W, H, portrait, loop } = p;
  const FW = portrait ? 340 : 320;
  const GAP = 34;
  let k = 0;
  for (let j = 0; j < FILMS.length - 1; j++) k += ease.backOut(prog(t, 0.5 + j * BEAT, 0.2));
  const stripX = W / 2 - FW / 2 - k * (FW + GAP) - (FW + GAP) * 0;
  const weave = Math.sin(t * 31) * 2 + Math.sin(t * 17) * 1.5;
  const push = 1 + 0.08 * ease.cubicOut(clamp01((t % BEAT) / BEAT)) * (t > 0.5 ? 1 : 0);
  const frames = [...FILMS, ...FILMS];
  const stripY = H / 2 + (portrait ? 40 : 60);

  return (
    <Stage
      p={p}
      bg={C.espresso}
      cam={{ s: push, oy: stripY }}
      hud={
        <At x={portrait ? 60 : 80} y={portrait ? 160 : 70} style={{ font: `700 ${portrait ? 70 : 78}px/1.05 ${F.display}`, letterSpacing: '-0.02em', color: C.crema, width: portrait ? 780 : 1400 }}>
          <span style={{ display: 'inline-block', opacity: prog(t, 0, 0.05), transform: `scale(${lerp(1.3, 1, ease.expoOut(prog(t, 0, 0.3)))})`, transformOrigin: '0 50%' }}>{tr('Rich taste.')}</span>{' '}
          <em style={{ display: 'inline-block', fontWeight: 500, color: C.caramel, opacity: prog(t, 0.25, 0.05), transform: `translateY(${(1 - ease.backOut(prog(t, 0.25, 0.3))) * 40}px)` }}>
            {tr('Strong opinions.')}
          </em>
        </At>
      }
      overlay={<div className="grain pointer-events-none absolute inset-0" style={{ opacity: 0.35, backgroundPosition: `${(t * 977) % 160}px ${(t * 613) % 160}px` }} />}
    >
      {portrait && (
        <At
          key={Math.round(k)}
          x={W / 2}
          y={stripY + 330}
          anchor="tc"
          style={{
            textAlign: 'center',
            width: 820,
            font: `italic 500 64px/1.15 ${F.display}`,
            color: C.caramel,
            opacity: clamp01(1 - Math.abs(k - Math.round(k)) * 3),
          }}
        >
          “{FILMS[Math.round(k) % FILMS.length].take}”
          <div style={{ marginTop: 18, font: `600 24px ${F.mono}`, letterSpacing: '0.24em', color: C.latte, fontStyle: 'normal' }}>
            {FILMS[Math.round(k) % FILMS.length].title}
          </div>
        </At>
      )}
      <div
        className="absolute"
        style={{ left: -200, width: W + 400, top: stripY - 230 + weave, height: 460, background: '#0a0604', transform: 'rotate(-2deg)' }}
      >
        {[14, 460 - 40].map((top) => (
          <div key={top} className="absolute" style={{ left: ((-t * 260) % 46) - 46, top, display: 'flex', gap: 22, whiteSpace: 'nowrap' }}>
            {Array.from({ length: Math.ceil((W + 600) / 46) }, (_, i) => (
              <i key={i} style={{ display: 'block', width: 24, height: 24, borderRadius: 5, background: C.crema, opacity: 0.75 }} />
            ))}
          </div>
        ))}
        <div className="absolute" style={{ left: stripX + 200, top: 68, display: 'flex', gap: GAP }}>
          {frames.map((f, i) => {
            const centred = Math.abs(i - k) < 0.5;
            return (
              <div
                key={i}
                style={{
                  width: FW,
                  height: 324,
                  flex: 'none',
                  background: f.bg,
                  border: `3px solid ${C.cocoa}`,
                  position: 'relative',
                  overflow: 'hidden',
                  opacity: centred ? 1 : 0.55,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10 }}>
                  <FrameArt kind={f.art} t={t} loop={loop} />
                </div>
                <div style={{ position: 'absolute', left: 16, bottom: 40, font: `800 24px ${F.sans}`, letterSpacing: '0.08em', color: f.fg }}>{f.title}</div>
                <div style={{ position: 'absolute', left: 16, bottom: 14, font: `600 16px ${F.mono}`, color: f.accent }}>{f.take}</div>
              </div>
            );
          })}
        </div>
      </div>
    </Stage>
  );
}
