import type { ReactNode } from 'react';
import { At, Stage, type SceneProps } from '../Stage';
import { beatEnv, ease, lerp, prog } from '../anim';
import { C, F } from '../palette';

const STATIONS = [
  { name: 'Beans', tech: 'Kafka · MES / ERP' },
  { name: 'Grind', tech: 'PySpark · Rust ETL' },
  { name: 'Brew', tech: 'Iceberg · Data Vault 2.0' },
  { name: 'Serve', tech: 'ClickHouse → planners' },
];

// Packet legs between stations; each lands on a downbeat-ish beat.
const LEGS = [
  [0.5, 1.0],
  [1.5, 2.0],
  [2.5, 3.0],
];

function packetAt(t: number) {
  let pos = 0;
  LEGS.forEach(([a, b]) => (pos += ease.expoInOut(prog(t, a, b - a))));
  return pos; // 0..3, station index with fractions
}

function Icon({ i, t }: { i: number; t: number }) {
  if (i === 0)
    return (
      <g>
        <ellipse cx={-20} cy={-6} rx={30} ry={42} fill={C.mocha} transform="rotate(-25 -20 -6)" />
        <path d="M-34 -42 C -8 -12, -34 16, -12 32" stroke={C.crema} strokeWidth={5} fill="none" />
        <ellipse cx={26} cy={12} rx={28} ry={38} fill={C.cocoa} transform="rotate(20 26 12)" />
        <path d="M18 -24 C 38 2, 16 26, 34 46" stroke={C.crema} strokeWidth={5} fill="none" />
      </g>
    );
  if (i === 1)
    return (
      <g transform={`rotate(${t * 240})`} fill={C.cinnamon}>
        <circle r={40} />
        {Array.from({ length: 8 }, (_, k) => (
          <rect key={k} x={-10} y={-58} width={20} height={26} rx={4} transform={`rotate(${k * 45})`} />
        ))}
        <circle r={15} fill={C.foam} />
      </g>
    );
  if (i === 2) {
    const fill = (k: number) => ease.expoOut(prog(t, 2.0 + k * 0.12, 0.3));
    return (
      <g>
        <path d="M-44 -62 h88 l-10 124 h-68 z" fill={C.foam} stroke={C.espresso} strokeWidth={6} />
        <path d={`M-38 ${62 - 56 * fill(0)} h76 l${-6 * fill(0)} ${56 * fill(0)} h-64z`} fill={C.cocoa} />
        <rect x={-41} y={6 - 34 * fill(1)} width={82} height={34 * fill(1)} fill={C.latte} />
        <rect x={-42} y={-28 - 30 * fill(2)} width={84} height={30 * fill(2)} fill={C.crema} />
      </g>
    );
  }
  return (
    <g>
      <path d="M-48 -30 h96 l-12 72 h-72 z" fill={C.crema} />
      <path d="M48 -16 c 32 0 32 36 -8 36" stroke={C.crema} strokeWidth={8} fill="none" />
      {[-16, 8].map((x, k) => {
        const rise = (t * 50 + k * 20) % 40;
        return (
          <path key={k} d={`M${x} ${-44 - rise} c -10 -16 10 -24 0 -40`} stroke={C.caramel} strokeWidth={6} fill="none" strokeLinecap="round" opacity={1 - rise / 40} />
        );
      })}
    </g>
  );
}

export function PourScene(p: SceneProps) {
  const { t, W, H, portrait } = p;
  const pos = packetAt(t);
  const stations = portrait
    ? STATIONS.map((_, i) => ({ x: 300, y: 420 + i * 340 }))
    : STATIONS.map((_, i) => ({ x: 220 + i * 390, y: 500 }));
  const seg = Math.min(2, Math.floor(pos));
  const f = pos - seg;
  const px = lerp(stations[seg].x, stations[seg + 1].x, f);
  const py = lerp(stations[seg].y, stations[seg + 1].y, f);

  // Camera follows the packet at 1.35× then pulls back to reveal the whole bar.
  const out = ease.inOutQuart(prog(t, 3.15, 0.7));
  const s = lerp(1.35, 1, out) + 0.012 * beatEnv(t, 9);
  const camX = lerp(-(px - W / 2) * s, 0, out);
  const camY = lerp(-(py - H / 2) * s, 0, out);

  const pipe = portrait
    ? `M${stations[0].x} ${stations[0].y} V${stations[3].y}`
    : `M${stations[0].x} ${stations[0].y} H${stations[3].x}`;
  const filled = portrait ? `M${stations[0].x} ${stations[0].y} V${py}` : `M${stations[0].x} ${stations[0].y} H${px}`;

  const label = (i: number, node: ReactNode) => {
    const st = stations[i];
    return portrait ? (
      <At key={i} x={st.x + 140} y={st.y} anchor="lc">
        {node}
      </At>
    ) : (
      <At key={i} x={st.x} y={st.y + 130} anchor="tc" style={{ textAlign: 'center' }}>
        {node}
      </At>
    );
  };

  return (
    <Stage
      p={p}
      bg={C.oat}
      cam={{ s, x: camX, y: camY }}
      hud={
        <At x={portrait ? 60 : 80} y={portrait ? 110 : 70} style={{ font: `italic 700 ${portrait ? 96 : 104}px/1 ${F.display}`, letterSpacing: '-0.03em', color: C.espresso, whiteSpace: 'nowrap' }}>
          {['How', 'I', 'brew', 'data.'].map((w, i) => {
            const k = ease.backOut(prog(t, i * 0.08, 0.35));
            return (
              <span key={i} style={{ display: 'inline-block', marginRight: '0.22em', color: i === 3 ? C.cinnamon : undefined, opacity: Math.min(1, k * 2), transform: `translateY(${(1 - k) * -90}px)` }}>
                {w}
              </span>
            );
          })}
        </At>
      }
    >
      <svg className="absolute inset-0 overflow-visible" width={W} height={H}>
        <path d={pipe} stroke={C.latte} strokeWidth={26} strokeLinecap="round" />
        <path d={filled} stroke={C.cinnamon} strokeWidth={26} strokeLinecap="round" />
        {Array.from({ length: 10 }, (_, k) => {
          const d = ((t * 1.6 + k / 10) % 1) * pos;
          const sg = Math.min(2, Math.floor(d));
          const ff = d - sg;
          return (
            <circle key={k} cx={lerp(stations[sg].x, stations[sg + 1].x, ff)} cy={lerp(stations[sg].y, stations[sg + 1].y, ff)} r={5} fill={C.foam} opacity={0.8} />
          );
        })}
        {stations.map((st, i) => {
          const k = ease.backOutHard(prog(t, i * 1.0 + 0.05, 0.3));
          return (
            <g key={i} transform={`translate(${st.x} ${st.y}) scale(${k * (1 + 0.08 * (Math.round(pos) === i ? beatEnv(t, 10) : 0))})`}>
              <circle r={104} fill={i === 3 ? C.espresso : C.foam} stroke={C.espresso} strokeWidth={7} />
              <Icon i={i} t={t} />
            </g>
          );
        })}
        <circle cx={px} cy={py} r={26} fill={C.caramel} stroke={C.espresso} strokeWidth={6} />
        <circle cx={px} cy={py} r={44 + 10 * beatEnv(t, 6)} fill="none" stroke={C.caramel} strokeWidth={4} opacity={0.5} />
      </svg>
      {STATIONS.map((st, i) =>
        label(
          i,
          <div style={{ opacity: prog(t, i * 1.0 + 0.15, 0.2) }}>
            <div style={{ font: `800 40px ${F.sans}`, color: C.espresso }}>{st.name}</div>
            <div style={{ font: `600 22px ${F.mono}`, color: C.mocha, marginTop: 6, whiteSpace: 'nowrap' }}>{st.tech}</div>
          </div>,
        ),
      )}
    </Stage>
  );
}
