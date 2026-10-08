import { At, Flash, Stage, type SceneProps } from '../Stage';
import { BEAT, beatEnv, clamp01, ease, hit, lerp, prog, rand, shakes, typed } from '../anim';
import { C, F, gradText } from '../palette';
import { tr } from '../../i18n';
import { skills } from '../../data';
import { brandIcons } from '../../brandIcons';

/* ---------------------------------------------------------- the next morning */

/**
 * Off the clock ends; the night turns to dawn while a clock ticks the last
 * seconds before seven on the beats. On the downbeat the alarm goes: back to work.
 */
export function Morning(p: SceneProps) {
  const { t, W, H, portrait } = p;
  const dawn = ease.sineInOut(prog(t, 0.1, 1.8));
  const ring = t >= 2;
  const secs = ring ? '00' : String(56 + Math.min(3, Math.floor(t / BEAT))).padStart(2, '0');
  const sh = shakes(t, [[2, 16], [2.25, 10], [2.5, 6]], 0.16);
  const sunY = lerp(H + 160, H * (portrait ? 0.7 : 0.74), ease.cubicOut(prog(t, 0.1, 2)));
  const title = ease.backOutHard(prog(t, 2, 0.3));
  const clockY = lerp(H * (portrait ? 0.4 : 0.38), portrait ? 330 : 150, ease.expoInOut(prog(t, 2, 0.4)));
  const clockS = lerp(1, 0.45, ease.expoInOut(prog(t, 2, 0.4)));

  return (
    <Stage
      p={p}
      bg="#0d0806"
      cam={{ x: sh[0], y: sh[1], s: 1 + 0.02 * beatEnv(t, 9) }}
      backdrop={
        <>
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${C.oat} 0%, #ecd1a8 45%, ${C.caramel} 100%)`, opacity: dawn }} />
          <svg className="absolute inset-0 h-full w-full" style={{ opacity: 1 - dawn }}>
            {Array.from({ length: 70 }, (_, i) => (
              <circle key={i} cx={`${rand(i, 51) * 100}%`} cy={`${rand(i, 52) * 70}%`} r={1 + rand(i, 53) * 1.6} fill={C.crema} opacity={0.3 + 0.7 * rand(i, 54)} />
            ))}
          </svg>
        </>
      }
      overlay={<Flash color={C.foam} opacity={0.45 * hit(t, 2, 9)} />}
    >
      {/* the sun */}
      <svg className="absolute inset-0 overflow-visible" width={W} height={H}>
        <defs>
          <radialGradient id="sun">
            <stop offset="0" stopColor={C.foam} />
            <stop offset="0.35" stopColor="#f6d9a6" />
            <stop offset="1" stopColor={C.caramel} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={W * (portrait ? 0.5 : 0.72)} cy={sunY} r={portrait ? 360 : 420} fill="url(#sun)" opacity={0.9} />
        <circle cx={W * (portrait ? 0.5 : 0.72)} cy={sunY} r={portrait ? 110 : 130} fill={C.foam} opacity={0.9 * dawn} />
      </svg>

      {/* the clock */}
      <At
        x={W / 2}
        y={clockY}
        anchor="c"
        style={{
          font: `700 ${portrait ? 150 : 210}px/1 ${F.mono}`,
          letterSpacing: '-0.02em',
          color: dawn > 0.5 ? C.espresso : C.crema,
          whiteSpace: 'nowrap',
          transform: `scale(${clockS * (1 + 0.04 * hit(t, Math.floor(t / BEAT) * BEAT, 12))}) rotate(${ring ? Math.sin(t * 60) * 3 * (1 - prog(t, 2, 0.8)) : 0}deg)`,
        }}
      >
        {ring ? '07:00' : '06:59'}
        <span style={{ fontSize: '0.38em', color: ring ? C.cinnamon : C.caramel, marginLeft: '0.15em' }}>:{secs}</span>
      </At>

      {/* the morning */}
      {ring && (
        <At x={W / 2} y={H * (portrait ? 0.5 : 0.52)} anchor="c" style={{ textAlign: 'center', width: portrait ? 860 : 1400 }}>
          <div style={{ font: `700 ${portrait ? 26 : 24}px ${F.mono}`, letterSpacing: '0.34em', color: C.cinnamon }}>{typed(tr('THE NEXT MORNING'), t, 2.05, 40)}</div>
          <div
            style={{
              marginTop: 18,
              font: `italic 800 ${portrait ? 130 : 170}px/1 ${F.display}`,
              letterSpacing: '-0.03em',
              transform: `scale(${lerp(1.5, 1, title)})`,
              opacity: clamp01((t - 2) / 0.06),
              ...gradText(`${C.espresso}, ${C.mocha} 45%, ${C.cinnamon}`),
            }}
          >
            {tr('Back to work.')}
          </div>
        </At>
      )}
    </Stage>
  );
}

/* ---------------------------------------------------------- what I can do for you */

const OFFERS = [
  { icon: 'bolt', head: tr('Faster pipelines'), sub: tr('Overnight batch jobs, rebuilt to finish in minutes') },
  { icon: 'pulse', head: tr('Real-time data'), sub: tr('Factory floor to dashboard in under a second') },
  { icon: 'layers', head: tr('A lakehouse people trust'), sub: tr('Modelled, governed, documented: one source of truth') },
  { icon: 'shield', head: tr('Pipelines that don’t break'), sub: tr('Tests, data-quality checks, CI/CD and monitoring') },
  { icon: 'gauge', head: tr('Lower compute bills'), sub: tr('The right engine for the job, even if it’s Rust') },
  { icon: 'flag', head: tr('End-to-end ownership'), sub: tr('From design doc to production, and the pager after') },
];

function OfferIcon({ name, color }: { name: string; color: string }) {
  const s = { fill: 'none', stroke: color, strokeWidth: 2.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const d: Record<string, string> = {
    bolt: 'M13 2 L4 14 h7 l-1 8 l9-12 h-7 z',
    pulse: 'M2 12 h4 l3-7 l4 14 l3-7 h6',
    layers: 'M12 3 l9 5 l-9 5 l-9-5 z M3 13 l9 5 l9-5',
    shield: 'M12 2 l8 3 v6 c0 5-3.5 9-8 11 c-4.5-2-8-6-8-11 v-6 z M8.5 12 l2.5 2.5 l4.5-5',
    gauge: 'M4 18 a9 9 0 1 1 16 0 M12 13 l4-5',
    flag: 'M5 21 v-17 M5 4 h12 l-2 4 l2 4 h-12',
  };
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <path d={d[name]} {...s} />
    </svg>
  );
}

/** Six things I'd do for your team, one landing every two beats. */
export function Built(p: SceneProps) {
  const { t, W, portrait } = p;
  const n = Math.min(OFFERS.length, Math.floor(t) + 1);
  const enter = ease.expoOut(prog(t, 0, 0.35));
  const cols = portrait ? 1 : 3;
  const cw = portrait ? 790 : 450;
  const ch = portrait ? 192 : 250;
  const gap = portrait ? 14 : 26;
  const x0 = (W - (cols * cw + (cols - 1) * gap)) / 2;
  const y0 = portrait ? 330 : 270;

  return (
    <Stage p={p} bg={C.espresso} cam={{ s: 1 + 0.012 * beatEnv(t, 9) + 0.015 * hit(t, n - 1, 9) }}>
      <At x={portrait ? 60 : 80} y={portrait ? 140 : 86} style={{ font: `700 ${portrait ? 24 : 22}px ${F.mono}`, letterSpacing: '0.3em', color: C.caramel, opacity: enter }}>
        {tr('BACK TO WORK')}
      </At>
      <At x={portrait ? 60 : 80} y={portrait ? 186 : 122} style={{ font: `800 ${portrait ? 80 : 92}px/1 ${F.display}`, letterSpacing: '-0.03em', color: C.crema, opacity: enter, whiteSpace: 'nowrap' }}>
        {tr('What I can do')} <span style={{ fontStyle: 'italic', fontWeight: 600, ...gradText() }}>{tr('for you.')}</span>
      </At>
      {OFFERS.map((o, i) => {
        if (i >= n) return null;
        const c = i % cols;
        const r = Math.floor(i / cols);
        const pop = ease.backOutHard(prog(t, i, 0.25));
        const live = i === n - 1;
        const glow = hit(t, i, 6);
        return (
          <div
            key={i}
            className="absolute"
            style={{
              left: x0 + c * (cw + gap),
              top: y0 + r * (ch + gap),
              width: cw,
              height: ch,
              borderRadius: 22,
              background: live ? C.roast : '#1f1611',
              border: `2px solid ${live ? C.caramel : 'rgba(233,217,191,.14)'}`,
              boxShadow: live ? `0 18px 50px rgba(0,0,0,.45), 0 0 ${40 * glow}px rgba(212,154,87,${0.5 * glow})` : 'none',
              transform: `translateY(${(1 - pop) * 40}px) scale(${lerp(1.12, 1, pop)})`,
              opacity: clamp01(pop * 2),
              padding: portrait ? '22px 28px' : '26px 28px',
              display: 'flex',
              flexDirection: portrait ? 'row' : 'column',
              alignItems: portrait ? 'center' : 'flex-start',
              gap: portrait ? 24 : 14,
            }}
          >
            <div
              style={{
                flex: 'none',
                width: portrait ? 76 : 58,
                height: portrait ? 76 : 58,
                borderRadius: 16,
                padding: portrait ? 16 : 12,
                background: live ? C.caramel : 'rgba(212,154,87,.12)',
              }}
            >
              <OfferIcon name={o.icon} color={live ? C.espresso : C.caramel} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ font: `700 ${portrait ? 42 : 32}px/1.1 ${F.display}`, letterSpacing: '-0.01em', color: live ? C.foam : C.crema }}>{o.head}</div>
              <div style={{ marginTop: 8, font: `500 ${portrait ? 28 : 21}px/1.35 ${F.sans}`, color: C.latte, opacity: live ? 1 : 0.75 }}>{o.sub}</div>
            </div>
          </div>
        );
      })}
    </Stage>
  );
}

/* ---------------------------------------------------------- the toolbox */

const TOOLS = [
  'Python', 'SQL', 'Rust', 'PySpark', 'Kafka', 'Flink', 'Airflow', 'dbt',
  'Apache Iceberg', 'Delta Lake', 'Databricks', 'ClickHouse', 'PostgreSQL', 'Oracle', 'YugabyteDB', 'Redis',
  'Snowflake', 'AWS', 'Azure', 'Terraform', 'Kubernetes', 'Docker', 'ArgoCD', 'Grafana',
].map((name) => skills.find((s) => s.name === name)!).filter(Boolean);

/** The tools as keycaps: they pop in on 32nds, then one key is pressed on every beat. */
export function Toolbox(p: SceneProps) {
  const { t, W, portrait } = p;
  const cols = portrait ? 4 : 8;
  const size = portrait ? 150 : 150;
  const gap = portrait ? 20 : 26;
  const gridW = cols * size + (cols - 1) * gap;
  const x0 = (W - gridW) / 2;
  const y0 = portrait ? 400 : 290;
  const beatIdx = Math.floor(t / BEAT);
  const pressed = t > 1.5 ? Math.floor(rand(beatIdx, 61) * TOOLS.length) : -1;
  const enter = ease.expoOut(prog(t, 0, 0.35));

  return (
    <Stage p={p} bg={C.oat} cam={{ s: 1 + 0.012 * beatEnv(t, 9) }}>
      <At x={portrait ? 60 : 80} y={portrait ? 140 : 96} style={{ font: `700 ${portrait ? 24 : 22}px ${F.mono}`, letterSpacing: '0.3em', color: C.cinnamon, opacity: enter }}>
        {tr('THE TOOLBOX')}
      </At>
      <At x={portrait ? 60 : 80} y={portrait ? 186 : 132} style={{ font: `800 ${portrait ? 92 : 96}px/1 ${F.display}`, letterSpacing: '-0.03em', color: C.espresso, opacity: enter, whiteSpace: 'nowrap' }}>
        {tr('Daily drivers.')}
      </At>
      {TOOLS.map((s, i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        const at = 0.1 + (c + r) * 0.0625;
        const pop = ease.backOutHard(prog(t, at, 0.25));
        const down = i === pressed ? 1 - prog(t - beatIdx * BEAT, 0, 0.3) : 0;
        const icon = s.icon ? brandIcons[s.icon] : undefined;
        const tint = icon ? `#${icon.hex}` : s.color ?? C.mocha;
        return (
          <div
            key={s.name}
            className="absolute flex flex-col items-center justify-center"
            style={{
              left: x0 + c * (size + gap),
              top: y0 + r * (size + gap) + 8 * down,
              width: size,
              height: size - 18,
              borderRadius: 22,
              background: down > 0 ? C.crema : C.foam,
              border: `3px solid ${C.espresso}`,
              boxShadow: `0 ${10 - 8 * down}px 0 ${C.espresso}`,
              transform: `scale(${pop})`,
              opacity: clamp01(pop * 3),
              gap: 8,
            }}
          >
            {icon ? (
              <svg viewBox="0 0 24 24" width={size * 0.36} height={size * 0.36}>
                <path d={icon.path} fill={tint} />
              </svg>
            ) : (
              <span style={{ font: `800 ${size * 0.22}px ${F.sans}`, color: tint }}>{s.mark}</span>
            )}
            <span style={{ font: `600 ${portrait ? 19 : 16}px ${F.mono}`, color: C.mocha, whiteSpace: 'nowrap' }}>{s.name}</span>
          </div>
        );
      })}
    </Stage>
  );
}
