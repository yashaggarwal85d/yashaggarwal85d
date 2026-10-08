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

/* ---------------------------------------------------------- what I build */

const BUILDS = [
  tr('Batch pipelines'),
  tr('Streaming ingestion'),
  tr('A Rust ETL engine'),
  tr('A rule-orchestration platform'),
  tr('A production-planning engine'),
  tr('Distributed databases'),
  tr('Election software for 10K+ people'),
  tr('Platforms people trust'),
];

/** Eight things, one per beat, stacking into two columns. */
export function Built(p: SceneProps) {
  const { t, W, portrait } = p;
  const n = Math.min(BUILDS.length, Math.floor(t / BEAT) + 1);
  const cols = portrait ? 1 : 2;
  const enter = ease.expoOut(prog(t, 0, 0.35));

  return (
    <Stage p={p} bg={C.espresso} cam={{ s: 1 + 0.015 * beatEnv(t, 9) + 0.02 * hit(t, (n - 1) * BEAT, 9) }}>
      <At x={portrait ? 60 : 80} y={portrait ? 140 : 96} style={{ font: `700 ${portrait ? 24 : 22}px ${F.mono}`, letterSpacing: '0.3em', color: C.caramel, opacity: enter }}>
        {tr('BACK TO WORK')}
      </At>
      <At x={portrait ? 60 : 80} y={portrait ? 186 : 132} style={{ font: `800 ${portrait ? 92 : 96}px/1 ${F.display}`, letterSpacing: '-0.03em', color: C.crema, opacity: enter, whiteSpace: 'nowrap' }}>
        {tr('What I build.')}
      </At>
      {BUILDS.map((b, i) => {
        if (i >= n) return null;
        const col = cols === 1 ? 0 : Math.floor(i / 4);
        const row = cols === 1 ? i : i % 4;
        const x = (portrait ? 60 : 80) + col * (W / 2 - 30);
        const y = (portrait ? 400 : 310) + row * (portrait ? 115 : 128);
        const pop = ease.backOutHard(prog(t, i * BEAT, 0.22));
        const live = i === n - 1;
        const last = i === BUILDS.length - 1;
        return (
          <At key={i} x={x} y={y} style={{ display: 'flex', alignItems: 'baseline', gap: 22, transform: `translateX(${(1 - pop) * 80}px)`, opacity: clamp01(pop * 2) }}>
            <span style={{ font: `700 ${portrait ? 26 : 24}px ${F.mono}`, color: live ? C.caramel : C.mocha, width: 44 }}>{String(i + 1).padStart(2, '0')}</span>
            <span
              style={{
                font: `${last ? 'italic 700' : '700'} ${portrait ? 44 : 42}px/1.1 ${F.display}`,
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
                ...(last ? gradText() : { color: live ? C.foam : C.latte }),
              }}
            >
              {b}
            </span>
          </At>
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
