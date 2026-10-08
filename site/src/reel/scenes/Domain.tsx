import type { ReactNode } from 'react';
import { At, Flash, Stage, type SceneProps } from '../Stage';
import { BEAT, beatEnv, clamp01, ease, hit, lerp, prog, typed } from '../anim';
import { C, F, gradText } from '../palette';
import { tr } from '../../i18n';

/* ---------------------------------------------------------- the domain */

/**
 * Where the data lives: the semiconductor supply chain, one stage per bar.
 * Bars 1–2 name the domain (under the song's drum cut-out); bars 3–7 light up
 * the chain in the order it runs: demand → planning → wafer fab → assembly &
 * test → delivery, with data packets streaming along the line; bar 8 says
 * where I fit in.
 */
const STAGES = [
  { icon: 0, label: tr('DEMAND'), note: tr('forecasts and ML demand signals') },
  { icon: 3, label: tr('PLANNING'), note: tr('supply plans and factory build plans') },
  { icon: 1, label: tr('WAFER FAB'), note: tr('MES streams from fabs around the world') },
  { icon: 2, label: tr('ASSEMBLY & TEST'), note: tr('start signals from fab to assembly') },
  { icon: 4, label: tr('DELIVERY'), note: tr('the right chip, to the right customer') },
];

/** 0 demand, 1 wafer, 2 packaged chip, 3 plan, 4 truck */
function Icon({ i }: { i: number }): ReactNode {
  const s = { fill: 'none', stroke: C.espresso, strokeWidth: 6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (i === 0)
    return (
      <g {...s}>
        <path d="M-30 30 V10 M-10 30 V-2 M10 30 V-12 M30 30 V-26" />
        <path d="M-34 0 L-6 -16 L12 -10 L36 -34" stroke={C.cinnamon} />
      </g>
    );
  if (i === 1)
    return (
      <g {...s}>
        <circle r={34} />
        {[-16, 0, 16].map((x) => [-16, 0, 16].map((y) => <rect key={`${x}${y}`} x={x - 6} y={y - 6} width={12} height={12} strokeWidth={3} />))}
      </g>
    );
  if (i === 2)
    return (
      <g {...s}>
        <rect x={-22} y={-22} width={44} height={44} rx={4} />
        {[-12, 0, 12].map((v) => (
          <g key={v} strokeWidth={4}>
            <path d={`M${v} -22 V-34 M${v} 22 V34 M-22 ${v} H-34 M22 ${v} H34`} />
          </g>
        ))}
        <circle r={6} fill={C.cinnamon} stroke="none" />
      </g>
    );
  if (i === 3)
    return (
      <g {...s}>
        <rect x={-34} y={-28} width={68} height={60} rx={6} />
        <path d="M-34 -12 H34" />
        <path d="M-24 0 H4 M-12 14 H24" stroke={C.cinnamon} strokeWidth={8} />
      </g>
    );
  return (
    <g {...s}>
      <path d="M-36 -18 H10 V20 H-36Z M10 -6 H26 L36 6 V20 H10" />
      <circle cx={-22} cy={24} r={7} fill={C.oat} />
      <circle cx={24} cy={24} r={7} fill={C.oat} />
    </g>
  );
}

export function Domain(p: SceneProps) {
  const { t, W, H, portrait } = p;
  const shown = Math.min(STAGES.length, Math.max(0, Math.floor((t - 2) / 2))); // stage k lands on bar k + 2
  const pos = (k: number) => (portrait ? { x: 150, y: 560 + k * 205 } : { x: 190 + k * 305, y: 540 });
  const words = [
    { at: 0, text: tr('Supply chain &'), italic: false },
    { at: BEAT, text: tr('manufacturing.'), italic: true },
  ];

  return (
    <Stage
      p={p}
      bg={C.oat}
      cam={{ s: 1 + 0.012 * beatEnv(t, 9) + 0.025 * hit(t, Math.floor(t / 2) * 2, 7) }}
      overlay={<Flash color={C.foam} opacity={0.25 * hit(t, 0, 12)} />}
      backdrop={
        // a faint wafer behind everything, turning slowly
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={{ opacity: 0.09 }}>
          <g transform={`rotate(${t * 4} ${portrait ? 78 : 86} ${portrait ? 30 : 22})`}>
            <circle cx={portrait ? 78 : 86} cy={portrait ? 30 : 22} r={30} fill="none" stroke={C.espresso} strokeWidth={0.5} />
            {Array.from({ length: 13 }, (_, a) =>
              Array.from({ length: 13 }, (_, b) => {
                const x = (portrait ? 78 : 86) - 24 + a * 4;
                const y = (portrait ? 30 : 22) - 24 + b * 4;
                const d = Math.hypot(x - (portrait ? 78 : 86), y - (portrait ? 30 : 22));
                return d < 27 ? <rect key={`${a}-${b}`} x={x - 1.6} y={y - 1.6} width={3.2} height={3.2} fill={C.espresso} /> : null;
              }),
            )}
          </g>
        </svg>
      }
    >
      <At x={portrait ? 60 : 80} y={portrait ? 130 : 70} style={{ font: `700 ${portrait ? 24 : 22}px ${F.mono}`, letterSpacing: '0.3em', color: C.cinnamon }}>
        {typed(tr('THE DOMAIN'), t, 0, 40)}
      </At>
      <At x={portrait ? 60 : 80} y={portrait ? 180 : 115} style={{ width: portrait ? 800 : 1440 }}>
        {words.map((w, i) => {
          const e = ease.backOutHard(prog(t, w.at, 0.25));
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                marginRight: 24,
                font: `${w.italic ? 'italic 600' : '800'} ${portrait ? 92 : 104}px/1.05 ${F.display}`,
                letterSpacing: '-0.03em',
                opacity: t >= w.at ? 1 : 0,
                transform: `translateY(${(1 - e) * 40}px) scale(${lerp(1.3, 1, e)})`,
                transformOrigin: '0 80%',
                ...(w.italic ? gradText() : { color: C.espresso }),
              }}
            >
              {w.text}
            </span>
          );
        })}
        <div style={{ marginTop: 14, font: `600 ${portrait ? 24 : 22}px ${F.mono}`, letterSpacing: '0.2em', color: C.mocha }}>
          {t < 14 ? (
            typed(tr('SEMICONDUCTORS · FROM FORECAST TO FACTORY TO CUSTOMER'), t, 1.0, 70)
          ) : (
            <span style={{ color: C.cinnamon }}>{typed(tr('I BUILD THE DATA PLATFORMS BEHIND ALL OF IT.'), t, 14, 60)}</span>
          )}
        </div>
      </At>

      {/* the line the data travels along */}
      <svg className="absolute inset-0 overflow-visible" width={W} height={H}>
        {STAGES.map((_, k) => {
          if (k === 0) return null;
          const a = pos(k - 1);
          const b = pos(k);
          const draw = ease.cubicOut(prog(t, 2 * (k + 2) - 0.5, 0.5));
          return (
            <line
              key={k}
              x1={a.x}
              y1={a.y}
              x2={lerp(a.x, b.x, draw)}
              y2={lerp(a.y, b.y, draw)}
              stroke={C.espresso}
              strokeWidth={5}
              strokeDasharray="2 14"
              strokeLinecap="round"
              opacity={draw > 0 ? 0.6 : 0}
            />
          );
        })}
        {/* packets: one leaves on every beat once the line exists */}
        {shown > 1 &&
          Array.from({ length: 10 }, (_, j) => {
            const u = ((t / BEAT + j * 0.37) % 4) / 4; // 0..1 along the whole line
            const span = (shown - 1) * u;
            const k = Math.floor(span);
            const f = span - k;
            const a = pos(k);
            const b = pos(Math.min(shown - 1, k + 1));
            return <circle key={j} cx={lerp(a.x, b.x, f)} cy={lerp(a.y, b.y, f)} r={7} fill={j % 2 ? C.cinnamon : C.caramel} />;
          })}
      </svg>

      {STAGES.map((s, k) => {
        const at = 2 * (k + 2);
        if (t < at - 0.05) return null;
        const pop = ease.backOutHard(prog(t, at, 0.25));
        const ring = prog(t, at, 0.5);
        const live = k === shown - 1;
        const { x, y } = pos(k);
        return (
          <div key={k}>
            <svg className="absolute overflow-visible" style={{ left: x, top: y }} width={1} height={1}>
              <circle r={80 + 70 * ring} fill="none" stroke={C.cinnamon} strokeWidth={4} opacity={1 - ring} />
              <g transform={`scale(${pop * (live ? 1 + 0.05 * beatEnv(t, 10) : 0.92)})`}>
                <circle r={74} fill={live ? C.caramel : C.crema} stroke={C.espresso} strokeWidth={5} />
                <Icon i={s.icon} />
              </g>
            </svg>
            <At
              x={portrait ? x + 110 : x}
              y={portrait ? y - 44 : y + 104}
              anchor={portrait ? 'tl' : 'tc'}
              style={{ width: portrait ? 600 : 290, textAlign: portrait ? 'left' : 'center', opacity: clamp01((t - at) / 0.15) * (live ? 1 : 0.7) }}
            >
              <div style={{ font: `800 ${portrait ? 30 : 24}px ${F.mono}`, letterSpacing: '0.12em', color: C.espresso }}>{s.label}</div>
              <div style={{ marginTop: 8, font: `500 ${portrait ? 28 : 21}px/1.3 ${F.sans}`, color: C.mocha }}>{typed(s.note, t, at + 0.1, 80)}</div>
            </At>
          </div>
        );
      })}
    </Stage>
  );
}
