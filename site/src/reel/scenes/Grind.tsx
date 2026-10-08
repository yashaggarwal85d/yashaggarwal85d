import { At, Flash, Stage, type SceneProps } from '../Stage';
import { BEAT, beatEnv, clamp01, ease, hit, lerp, prog, rand, scramble, shakes, typed } from '../anim';
import { C, F, gradText } from '../palette';
import { tr } from '../../i18n';

/* ------------------------------------------------------------------ 04 */

export function Hours(p: SceneProps) {
  const { t, portrait } = p;
  const L = portrait
    ? { lx: 60, ly: 120, hx: 60, hy: 210, hs: 280, ax: 70, ay: 520, mx: 60, my: 600, ms: 290, sx: 90, sy: 1000, ss: 170, cx: 610, cy: 1320, cr: 110, subX: 60, subY: 1260, subW: 480 }
    : { lx: 80, ly: 90, hx: 80, hy: 170, hs: 300, ax: 690, ay: 230, mx: 830, my: 150, ms: 300, sx: 880, sy: 540, ss: 170, cx: 210, cy: 690, cr: 130, subX: 880, subY: 800, subW: 660 };

  const enter = ease.expoOut(prog(t, 0, 0.3));
  const strike = ease.expoOut(prog(t, 0.5, 0.14));
  const crush = ease.backOut(prog(t, 0.5, 0.25));
  const rise = ease.backOut(prog(t, 1.0, 0.32));
  const stamp = ease.backOutHard(prog(t, 1.5, 0.24));
  const sh = shakes(t, [[0.5, 10], [1.5, 16]], 0.18);
  const hand = -1080 * ease.expoOut(prog(t, 0, 1.6));

  return (
    <Stage
      p={p}
      bg={C.espresso}
      cam={{ s: 1 + 0.07 * ease.sineInOut(prog(t, 2, 2)) + 0.018 * beatEnv(t, 9), x: sh[0], y: sh[1] }}
      overlay={<Flash color={C.cinnamon} opacity={0.28 * hit(t, 1.5, 14)} />}
    >
      <At x={L.lx} y={L.ly} style={{ font: `600 ${portrait ? 26 : 22}px ${F.mono}`, letterSpacing: '0.25em', color: C.latte }}>
        {typed(tr('NIGHTLY SUPPLY-PLANNING RUN'), t, 0, 50)}
      </At>

      <svg className="absolute" style={{ left: L.cx - L.cr, top: L.cy - L.cr }} width={L.cr * 2} height={L.cr * 2} viewBox="-100 -100 200 200">
        <circle r="92" fill="none" stroke={C.mocha} strokeWidth="6" />
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d="M0 -80 V -70" stroke={C.mocha} strokeWidth="4" transform={`rotate(${i * 30})`} />
        ))}
        <path d="M0 0 V -72" stroke={C.crema} strokeWidth="7" strokeLinecap="round" transform={`rotate(${hand})`} />
        <path d="M0 0 V -48" stroke={C.caramel} strokeWidth="8" strokeLinecap="round" transform={`rotate(${hand / 12})`} />
        <path d="M0 -86 A86 86 0 0 0 -74 44" fill="none" stroke={C.caramel} strokeWidth="4" strokeDasharray="4 10" opacity={0.6 * (1 - prog(t, 1.2, 0.5))} />
        <circle r="9" fill={C.cinnamon} />
      </svg>

      <At x={L.hx} y={L.hy} style={{ transform: `translateX(${(1 - enter) * -320}px)` }}>
        <div
          style={{
            font: `900 ${L.hs}px/1 ${F.sans}`,
            letterSpacing: '-0.06em',
            color: C.crema,
            transformOrigin: '0% 85%',
            transform: `scale(${1 + 0.06 * crush * (1 - crush)}, ${lerp(1, 0.5, crush)})`,
            opacity: lerp(1, 0.45, crush),
          }}
        >
          18h
        </div>
        <div
          style={{
            position: 'absolute',
            left: -20,
            top: L.hs * 0.42,
            height: 16,
            width: (L.hs * 1.9) * strike,
            background: C.cinnamon,
            transform: 'rotate(-8deg)',
            transformOrigin: '0 50%',
            boxShadow: `0 0 30px ${C.cinnamon}`,
          }}
        />
      </At>

      <At
        x={L.ax}
        y={L.ay}
        style={{
          font: `400 ${portrait ? 120 : 130}px ${F.display}`,
          color: C.latte,
          opacity: prog(t, 0.75, 0.2),
          transform: `translateX(${(1 - ease.expoOut(prog(t, 0.75, 0.25))) * -60}px) rotate(${portrait ? 90 : 0}deg)`,
        }}
      >
        →
      </At>

      <At x={L.mx} y={L.my} style={{ overflow: 'hidden', paddingBottom: 20 }}>
        <div
          style={{
            font: `900 ${L.ms}px/1 ${F.sans}`,
            letterSpacing: '-0.07em',
            transform: `translateY(${(1 - rise) * (L.ms + 40)}px)`,
            ...gradText(),
          }}
        >
          45m
        </div>
      </At>

      <At x={L.sx} y={L.sy}>
        <div
          style={{
            opacity: prog(t, 1.5, 0.05),
            transform: `rotate(${lerp(-26, -9, stamp)}deg) scale(${lerp(2.6, 1, stamp) * (1 + 0.05 * (t > 2 ? beatEnv(t, 10) : 0))})`,
            border: `12px solid ${C.cinnamon}`,
            padding: '4px 34px',
            font: `900 ${L.ss}px/1 ${F.sans}`,
            color: C.cinnamon,
            letterSpacing: '-0.04em',
            boxShadow: `14px 12px 0 rgba(184,97,47,.25)`,
          }}
        >
          24×
        </div>
      </At>

      <At x={L.subX} y={L.subY} style={{ width: L.subW, font: `italic 400 ${portrait ? 44 : 46}px/1.2 ${F.display}`, color: C.crema }}>
        {typed(tr('so planners can replan intra-day.'), t, 2.1, 30)}
      </At>
    </Stage>
  );
}

/* ------------------------------------------------------------------ 05 */

export function Rust(p: SceneProps) {
  const { t, W, portrait } = p;
  const L = portrait
    ? { lx: 60, ly: 120, bx: 60, max: 760, sparkY: 520, rustY: 660, numX: 60, numY: 170, numS: 230, cupX: 470, cupY: 880, lineX: 60, lineY: 1290 }
    : { lx: 80, ly: 90, bx: 250, max: 900, sparkY: 330, rustY: 440, numX: W - 80, numY: 40, numS: 260, cupX: 1110, cupY: 500, lineX: 80, lineY: 590 };

  const spark = clamp01((t - 0.2) / 1.6);
  const rust = ease.backOut(prog(t, 0.5, 0.6));
  const val = 1 + 2.8 * ease.expoOut(prog(t, 0.5, 0.6));
  const rustW = L.max * rust;
  const tipX = L.bx + rustW;
  const tipY = L.rustY + 46;
  const pour = ease.cubicOut(prog(t, 2.0, 0.45));
  const cupIn = ease.expoOut(prog(t, 1.8, 0.45));
  const fill = ease.sineInOut(prog(t, 2.3, 1.2));
  const tb = Math.round(16 * ease.expoOut(prog(t, 2.4, 0.8)));
  const cupX = lerp(L.cupX + 700, L.cupX, cupIn);
  const streamX = portrait ? cupX + 140 : tipX - 10;
  const streamTop = portrait ? L.rustY + 92 : tipY;
  const streamBottom = L.cupY + 60;

  return (
    <Stage p={p} bg={C.oat} cam={{ x: -40 * ease.sineInOut(prog(t, 2, 2)), s: 1 + 0.04 * ease.sineInOut(prog(t, 2, 2)) + 0.012 * beatEnv(t, 9) }}>
      <At x={L.lx} y={L.ly} style={{ font: `600 ${portrait ? 26 : 22}px ${F.mono}`, letterSpacing: '0.25em', color: C.mocha }}>
        {typed(tr('INGEST THROUGHPUT / NODE'), t, 0, 50)}
      </At>
      <At
        x={L.numX}
        y={L.numY}
        anchor={portrait ? 'tl' : 'tr'}
        style={{
          font: `800 ${L.numS}px/1 ${F.display}`,
          letterSpacing: '-0.05em',
          color: C.espresso,
          transformOrigin: portrait ? '0% 50%' : '100% 50%',
          transform: `scale(${1 + 0.12 * hit(t, 1.1, 8)})`,
        }}
      >
        {val.toFixed(1)}×
      </At>

      {[
        { label: 'SPARK', y: L.sparkY, w: 240 * spark, bg: C.latte, color: C.mocha },
        { label: 'RUST', y: L.rustY, w: rustW, bg: `linear-gradient(90deg, ${C.caramel}, ${C.cinnamon})`, color: C.cinnamon },
      ].map((b) => (
        <div key={b.label}>
          <At
            x={portrait ? L.bx : L.lx}
            y={portrait ? b.y - 44 : b.y + 8}
            style={{ font: `700 ${portrait ? 26 : 24}px ${F.mono}`, color: b.color }}
          >
            {b.label}
          </At>
          <At x={L.bx} y={b.y} style={{ width: b.w, height: 46, borderRadius: 8, background: b.bg }} />
        </div>
      ))}
      {t > 0.5 && t < 1.3 && (
        <svg className="absolute" style={{ left: tipX - 220, top: L.rustY - 10 }} width={200} height={66}>
          {[8, 30, 52].map((y, i) => (
            <path key={i} d={`M${20 + i * 30} ${y} h${120 - i * 20}`} stroke={C.cinnamon} strokeWidth={4} strokeLinecap="round" opacity={0.5 * (1 - prog(t, 0.9, 0.4))} />
          ))}
        </svg>
      )}
      <At
        x={portrait ? L.bx : tipX + 24}
        y={portrait ? L.rustY + 60 : L.rustY + 8}
        style={{ font: `700 ${portrait ? 26 : 26}px ${F.mono}`, color: C.cinnamon, opacity: prog(t, 1.1, 0.2) }}
      >
        {tr('1.5 GB/s per node')}
      </At>

      {/* pour: the bar becomes a stream into the cup */}
      <svg className="absolute inset-0 pointer-events-none" width={p.W} height={p.H}>
        {pour > 0 && (
          <path
            d={`M${streamX} ${streamTop} C ${streamX} ${streamTop + 60}, ${streamX + 8} ${streamTop + 120}, ${streamX} ${lerp(streamTop, streamBottom, pour)}`}
            stroke={C.mocha}
            strokeWidth={20}
            fill="none"
            strokeLinecap="round"
            opacity={1 - prog(t, 3.5, 0.4)}
          />
        )}
        <g transform={`translate(${cupX} ${L.cupY})`}>
          <path d="M60 60 h240 l-26 170 h-188 z" fill={C.foam} stroke={C.espresso} strokeWidth={7} />
          <clipPath id="cupclip">
            <path d="M64 64 h232 l-25 162 h-182 z" />
          </clipPath>
          <rect x={60} y={230 - 166 * fill} width={240} height={166 * fill} fill={C.mocha} clipPath="url(#cupclip)" />
          <path d="M300 92 c 60 0 60 80 -12 80" fill="none" stroke={C.espresso} strokeWidth={7} />
          <text x={180} y={290} textAnchor="middle" fontFamily={F.sans} fontWeight={900} fontSize={52} fill={C.espresso} letterSpacing="-1.5">
            {tr('{tb} TB/day', { tb })}
          </text>
        </g>
      </svg>

      <At x={L.lineX} y={L.lineY} style={{ font: `italic 400 ${portrait ? 46 : 48}px/1.25 ${F.display}`, color: C.mocha, maxWidth: portrait ? 780 : 760 }}>
        {[tr('I wrote a Rust ETL engine.'), tr('Spark didn’t stand a chance.')].map((line, li) => (
          <div key={li}>
            {line.split(' ').map((w, wi) => {
              const k = ease.expoOut(prog(t, 2.5 + li * 0.5 + wi * 0.06, 0.35));
              return (
                <span key={wi} style={{ display: 'inline-block', marginRight: '0.28em', opacity: k, transform: `translateY(${(1 - k) * 30}px)`, filter: `blur(${(1 - k) * 6}px)` }}>
                  {w}
                </span>
              );
            })}
          </div>
        ))}
      </At>
    </Stage>
  );
}

/* ------------------------------------------------------------------ 06 */

/** The merge lands on the downbeat of the scene's second bar (the hook, under TORE UP). */
const SLAM = 2;

export function Consolidate(p: SceneProps) {
  const { t, W, H, portrait } = p;
  const L = portrait
    ? { cols: 8, ox: 90, oy: 560, gap: 40, core: [640, 860] as const, numS: 210, numY: 120, labelY: 370, arrowY: 1150 }
    : { cols: 17, ox: 100, oy: 430, gap: 40, core: [1200, 440] as const, numS: 230, numY: 50, labelY: 320, arrowY: 590 };
  const [cx, cy] = L.core;
  const count = Math.round(136 * ease.expoOut(prog(t, 0, 0.5)));
  const swarm = ease.cubicIn(prog(t, 0.75, 1));
  const implode = ease.expoIn(prog(t, SLAM - 0.25, 0.25));
  const merged = t >= SLAM;
  const pop = ease.backOutHard(prog(t, SLAM, 0.3));
  const sh = shakes(t, [[SLAM, 14]], 0.2);

  const dots = [];
  if (!merged) {
    for (let i = 0; i < 136; i++) {
      const c = i % L.cols;
      const r = Math.floor(i / L.cols);
      const gx = L.ox + c * L.gap + Math.sin(t * 2 + i) * 5 * prog(t, 0.4, 0.3);
      const gy = L.oy + r * L.gap + Math.cos(t * 1.7 + i * 1.3) * 5 * prog(t, 0.4, 0.3);
      const ang = rand(i) * Math.PI * 2 + t * (2.2 + rand(i, 3) * 2);
      const rad = (90 + rand(i, 7) * 220) * (1 - swarm * 0.55);
      const sx = cx + Math.cos(ang) * rad;
      const sy = cy + Math.sin(ang) * rad * 0.7;
      const x = lerp(lerp(gx, sx, swarm), cx, implode);
      const y = lerp(lerp(gy, sy, swarm), cy, implode);
      const appear = ease.backOut(prog(t, 0.05 + i * 0.004, 0.22));
      const heat = clamp01(swarm * 0.7 + implode);
      dots.push(
        <circle
          key={i}
          cx={x}
          cy={y}
          r={(7 + heat * 3) * appear}
          fill={heat > 0.5 ? C.caramel : C.crema}
          opacity={0.55 + 0.45 * heat}
        />,
      );
    }
  }

  return (
    <Stage
      p={p}
      bg={C.espresso}
      cam={{ x: sh[0], y: sh[1], s: 1 + 0.06 * hit(t, SLAM, 5) + 0.012 * beatEnv(t, 9) }}
      overlay={<Flash color={C.foam} opacity={0.55 * hit(t, SLAM, 9)} />}
    >
      <At x={80} y={L.numY} style={{ font: `900 ${L.numS}px/1 ${F.sans}`, letterSpacing: '-0.06em', color: C.crema }}>
        {count}
      </At>
      <At x={84} y={L.labelY} style={{ font: `600 ${portrait ? 24 : 22}px ${F.mono}`, letterSpacing: '0.2em', color: C.latte, maxWidth: portrait ? 760 : 900 }}>
        {typed(tr('SITE DATABASES'), t, 0.4, 40)}
      </At>
      <svg className="absolute inset-0" width={W} height={H}>
        <defs>
          <radialGradient id="coreGlow">
            <stop offset="0" stopColor={C.foam} />
            <stop offset=".35" stopColor={C.caramel} />
            <stop offset="1" stopColor={C.cinnamon} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={120 + 200 * swarm + 120 * hit(t, SLAM, 3)} fill="url(#coreGlow)" opacity={0.15 + 0.35 * swarm + 0.4 * hit(t, SLAM, 3)} />
        {dots}
        {merged && (
          <>
            <circle cx={cx} cy={cy} r={78 * pop * (1 + 0.04 * beatEnv(t, 10))} fill={C.foam} />
            <circle cx={cx} cy={cy} r={78 * pop} fill="none" stroke={C.caramel} strokeWidth={12} />
            <circle cx={cx} cy={cy} r={78 + 260 * prog(t, SLAM, 0.6)} fill="none" stroke={C.caramel} strokeWidth={4} opacity={1 - prog(t, SLAM, 0.6)} />
          </>
        )}
      </svg>
      <At
        x={portrait ? 80 : cx - 330}
        y={L.arrowY}
        style={{
          font: `italic 800 ${portrait ? 150 : 170}px/1 ${F.display}`,
          color: C.caramel,
          opacity: prog(t, SLAM + 0.05, 0.05),
          transform: `scale(${lerp(2.2, 1, ease.backOutHard(prog(t, SLAM + 0.05, 0.22)))})`,
          transformOrigin: '20% 60%',
        }}
      >
        → 1
      </At>
      <At
        x={portrait ? 84 : cx - 320}
        y={L.arrowY + (portrait ? 190 : 180)}
        style={{ font: `600 ${portrait ? 24 : 22}px ${F.mono}`, letterSpacing: '0.2em', color: C.latte }}
      >
        {typed(tr('ONE YUGABYTEDB CLUSTER'), t, SLAM + 0.15, 90)}
      </At>
    </Stage>
  );
}

/* ------------------------------------------------------------------ 07 */

type Cell = { value: (k: number) => string; label: string; bg: string; fg: string; sub: string; display?: boolean };

const CELLS: Cell[] = [
  { value: (k) => (k < 1 ? scramble('<1s', k, 0, 1) : '<1s'), label: tr('P95 LATENCY'), sub: tr('MES & ERP streams, worldwide'), bg: C.caramel, fg: C.espresso },
  { value: (k) => `${Math.round(70 * k)}K+`, label: tr('SKUS'), sub: tr('fulfilled on time'), bg: C.oat, fg: C.espresso, display: true },
  { value: (k) => `−${Math.round(150 * k)}`, label: tr('OVERRIDES / WEEK'), sub: tr('manual planner fixes, gone'), bg: C.cinnamon, fg: C.foam },
  { value: (k) => tr('{n} wks', { n: Math.round(64 * k) }), label: tr('BUILD PLANS'), sub: tr('for every factory site'), bg: C.roast, fg: C.crema, display: true },
];

// Where the splits sit when each cell is the hero: [column split, row split].
const SPLITS: [number, number][] = [
  [0.66, 0.64],
  [0.34, 0.64],
  [0.66, 0.36],
  [0.34, 0.36],
];

export function Grid(p: SceneProps) {
  const { t, W, H, portrait } = p;
  const pad = 18;
  const gap = 14;
  const b = Math.min(7, Math.floor(t / BEAT));
  const active = b % 4;
  const prev = b === 0 ? null : SPLITS[(b - 1) % 4];
  const k = ease.backOut(prog(t, b * BEAT, 0.3));
  const from = prev ?? [0.5, 0.5];
  const cs = lerp(from[0], SPLITS[active][0], k);
  const rs = lerp(from[1], SPLITS[active][1], k);
  const cw = W - pad * 2 - gap;
  const ch = H - pad * 2 - gap;
  const colW = [cw * cs, cw * (1 - cs)];
  const rowH = [ch * rs, ch * (1 - rs)];

  return (
    <Stage p={p} bg={C.espresso} cam={{ s: 1 + 0.015 * beatEnv(t, 10) }} overlay={<Flash color={C.foam} opacity={0.12 * hit(t, 0, 12)} />}>
      {CELLS.map((cell, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = pad + (col ? colW[0] + gap : 0);
        const y = pad + (row ? rowH[0] + gap : 0);
        const w = colW[col];
        const h = rowH[row];
        const firstHit = i * BEAT;
        const count = ease.expoOut(prog(t, firstHit, 0.3));
        const size = Math.min(w * (portrait ? 0.27 : 0.3), h * 0.5);
        const isActive = i === active;
        return (
          <div
            key={i}
            className="absolute overflow-hidden"
            style={{
              left: x,
              top: y,
              width: w,
              height: h,
              borderRadius: 22,
              background: cell.bg,
              color: cell.fg,
              padding: Math.max(18, Math.min(36, w * 0.05)),
              boxShadow: isActive ? `inset 0 0 0 3px ${cell.fg}22` : undefined,
            }}
          >
            <div style={{ font: `700 ${Math.max(14, size * 0.13)}px ${F.mono}`, letterSpacing: '0.18em', opacity: 0.8 }}>{cell.label}</div>
            <div
              style={{
                font: cell.display ? `italic 800 ${size}px/1 ${F.display}` : `900 ${size}px/1 ${F.sans}`,
                letterSpacing: cell.display ? '-0.03em' : '-0.06em',
                marginTop: size * 0.12,
                whiteSpace: 'nowrap',
                transformOrigin: '0 50%',
                transform: `scale(${1 + (isActive ? 0.06 * beatEnv(t, 9) : 0)})`,
              }}
            >
              {cell.value(count)}
            </div>
            <div style={{ font: `500 ${Math.max(16, size * 0.16)}px/1.3 ${F.sans}`, marginTop: size * 0.12, opacity: 0.85, maxWidth: w - 60 }}>{cell.sub}</div>
          </div>
        );
      })}
    </Stage>
  );
}
