import { At, Flash, Stage, type SceneProps } from '../Stage';
import { LOOP, beatEnv, ease, hit, lerp, mmss, prog, rand } from '../anim';
import { C, F, gradText } from '../palette';
import type { KbFrame } from '../types';
import { profile } from '../../data';
import { tr } from '../../i18n';

/* ------------------------------------------------------------- the journey */

const NODES = [
  { year: '2019', when: '2019 – 2023', title: 'Thapar Institute', desc: tr('B.E. Computer Science & Engineering · CGPA 9.07 / 10') },
  { year: '2023', when: tr('JAN 2023'), title: tr('Software Dev Intern'), desc: tr('Texas Instruments · my first production code') },
  { year: '2023', when: tr('JUN 2023'), title: tr('Data Engineer'), desc: tr('Spark, Airflow and Oracle pipelines behind supply planning') },
  { year: '2025', when: tr('FEB 2025 → NOW'), title: tr('Data Engineer II'), desc: tr('Batch and streaming platforms for semiconductor manufacturing') },
  { year: tr('NEXT'), when: tr('NEXT'), title: tr('Your team?'), desc: tr('the next data platform worth building') },
];
/** One stop per bar: the camera whips across and lands on each downbeat. */
const STOP = 2;
const WHIP = 0.2;

export function Journey(p: SceneProps) {
  const { t, W, H, portrait } = p;
  const spacing = portrait ? 760 : 820;
  const lineY = H * (portrait ? 0.5 : 0.52);
  const idx = Math.max(0, Math.min(NODES.length - 1, Math.floor((t + WHIP) / STOP)));
  const k = idx === 0 ? 1 : ease.expoInOut(prog(t, idx * STOP - WHIP, WHIP));
  const camX = -lerp((idx > 0 ? idx - 1 : 0) * spacing, idx * spacing, k);
  const velocity = idx > 0 && k < 1 ? Math.sin(Math.PI * k) : 0;
  const blur = velocity * 26;
  const enter = ease.expoOut(prog(t, 0, 0.4));

  return (
    <Stage
      p={p}
      bg={C.oat}
      cam={{ s: 1 + 0.015 * beatEnv(t, 9) + 0.03 * hit(t, idx * STOP, 7) }}
      hud={
        <At x={portrait ? 60 : 80} y={portrait ? 150 : 80} style={{ font: `700 ${portrait ? 24 : 22}px ${F.mono}`, letterSpacing: '0.3em', color: C.cinnamon, opacity: enter }}>
          {tr('THE JOURNEY · {i}/{n}', { i: `0${idx + 1}`, n: `0${NODES.length}` })}
        </At>
      }
    >
      <svg width={0} height={0} className="absolute">
        <filter id="whip" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={`${blur} 0`} />
        </filter>
      </svg>
      {/* the year, huge and faint, sliding slower than the line: parallax */}
      {NODES.map((n, i) => {
        const vis = i === idx ? k : i === idx - 1 ? 1 - k : 0;
        if (vis <= 0.01) return null;
        return (
          <At
            key={`y${i}`}
            x={W - (portrait ? 40 : 60)}
            y={H - (portrait ? 160 : 40)}
            anchor={portrait ? 'rc' : 'bl'}
            style={{
              font: `italic 800 ${portrait ? 300 : 360}px/0.8 ${F.display}`,
              letterSpacing: '-0.05em',
              color: 'transparent',
              WebkitTextStroke: `3px ${C.latte}`,
              opacity: 0.55 * vis,
              whiteSpace: 'nowrap',
              transform: `translateX(${portrait ? 0 : -100}%) translateX(${(1 - vis) * (i === idx ? 160 : -160)}px)`,
            }}
          >
            {n.year}
          </At>
        );
      })}
      <div className="absolute inset-0" style={{ transform: `translateX(${camX}px)`, filter: blur > 0.5 ? 'url(#whip)' : undefined }}>
        <div
          className="absolute"
          style={{ left: -W, width: (W * 2 + spacing * NODES.length) * enter, top: lineY, height: 5, background: C.espresso }}
        />
        {NODES.map((n, i) => {
          const x = W / 2 + i * spacing;
          const focus = i === idx;
          const pulse = focus ? 1 + 0.18 * hit(t, i * STOP, 8) : 1;
          // only the stop we're on speaks; the one we left fades as we whip away
          const vis = i === idx ? k : i === idx - 1 ? 1 - k : 0;
          return (
            <div key={i}>
              <div
                className="absolute"
                style={{
                  left: x,
                  top: lineY + 2,
                  width: focus ? 80 : 44,
                  height: focus ? 80 : 44,
                  borderRadius: '50%',
                  transform: `translate(-50%, -50%) scale(${pulse})`,
                  background: focus ? C.cinnamon : C.latte,
                  boxShadow: focus ? `0 0 0 16px rgba(184,97,47,.2)` : undefined,
                }}
              />
              <At
                x={x - (portrait ? 330 : 360)}
                y={lineY - (portrait ? 330 : 300)}
                style={{ width: portrait ? 680 : 760 }}
              >
                <div style={{ font: `700 ${portrait ? 28 : 24}px ${F.mono}`, letterSpacing: '0.2em', color: C.cinnamon, opacity: 0.35 + 0.65 * vis }}>{n.when}</div>
                <div
                  style={{
                    font: `800 ${portrait ? 96 : 104}px/1 ${F.display}`,
                    letterSpacing: '-0.03em',
                    color: C.espresso,
                    marginTop: 10,
                    opacity: vis,
                    transform: `translateY(${(1 - vis) * 30}px)`,
                  }}
                >
                  {n.title}
                </div>
              </At>
              <At x={x - (portrait ? 330 : 360)} y={lineY + 70} style={{ width: portrait ? 660 : 720, opacity: vis, font: `500 ${portrait ? 36 : 30}px/1.35 ${F.sans}`, color: C.mocha }}>
                {n.desc}
              </At>
            </div>
          );
        })}
      </div>
    </Stage>
  );
}

/* ------------------------------------------------------------------ 14 */

export function Cta(p: SceneProps) {
  const { t, W, H, portrait } = p;
  const pull = lerp(1.25, 1, ease.expoOut(prog(t, 0, 0.9)));
  const l1 = ease.expoOut(prog(t, 0.08, 0.35));
  const l2 = ease.backOut(prog(t, 0.5, 0.35));
  const burst = ease.expoOut(prog(t, 0, 0.6));
  const fade = 1 - prog(t, 0.35, 0.6);

  return (
    <Stage
      p={p}
      bg="transparent"
      // after the slam, hold: a slow push-in that breathes on the beat
      cam={{ s: pull * (1 + 0.035 * ease.sineInOut(prog(t, 1.2, 6.8))) + 0.01 * beatEnv(t, 9) * prog(t, 1.2, 0.5) }}
      backdrop={
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 48% 42% at 50% 50%, rgba(23,16,12,.93) 25%, rgba(23,16,12,0) 72%)' }}
        />
      }
      overlay={<Flash color={C.foam} opacity={0.35 * hit(t, 0, 10)} />}
    >
      <svg className="absolute inset-0 overflow-visible" width={W} height={H}>
        {Array.from({ length: 64 }, (_, i) => {
          const a = rand(i, 1) * Math.PI * 2;
          const r1 = 140 + rand(i, 2) * 120 + burst * 260;
          const r2 = r1 + (40 + rand(i, 3) * 200) * burst;
          return (
            <path
              key={i}
              d={`M${W / 2 + Math.cos(a) * r1} ${H / 2 + Math.sin(a) * r1 * 0.6} L${W / 2 + Math.cos(a) * r2} ${H / 2 + Math.sin(a) * r2 * 0.6}`}
              stroke={rand(i, 4) > 0.5 ? C.caramel : C.foam}
              strokeWidth={2 + rand(i, 5) * 3}
              strokeLinecap="round"
              opacity={0.8 * fade}
            />
          );
        })}
      </svg>
      <At x={W / 2} y={H / 2 - (portrait ? 230 : 170)} anchor="tc" style={{ textAlign: 'center', width: portrait ? 860 : 1400 }}>
        <div
          style={{
            font: `800 ${portrait ? 92 : 112}px/1 ${F.display}`,
            letterSpacing: '-0.03em',
            color: C.foam,
            opacity: l1,
            filter: `blur(${(1 - l1) * 14}px)`,
            transform: `scale(${lerp(1.35, 1, l1)})`,
            textShadow: '0 6px 40px #000',
          }}
        >
          {tr('Let’s build something')}
        </div>
        <div
          style={{
            font: `italic 600 ${portrait ? 110 : 130}px/1.15 ${F.display}`,
            opacity: Math.min(1, l2 * 2),
            transform: `translateY(${(1 - l2) * 50}px)`,
            ...gradText(),
            // the gradient drifts while we hold
            backgroundSize: '220% 100%',
            backgroundPosition: `${50 + 50 * Math.sin(t * 0.9)}% 0`,
          }}
        >
          {tr('that scales.')}
        </div>
        <div style={{ marginTop: 30, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
          {[
            { at: 1.0, href: `mailto:${profile.email}`, label: profile.email, main: true },
            { at: 2.0, href: profile.linkedin, label: 'LinkedIn', main: false },
            { at: 2.5, href: profile.github, label: 'GitHub', main: false },
          ].map((l) => {
            const pop = ease.backOutHard(prog(t, l.at, 0.3));
            return (
              <a
                key={l.label}
                href={l.href}
                target={l.main ? undefined : '_blank'}
                rel="noopener"
                tabIndex={-1}
                style={{
                  display: 'inline-block',
                  padding: '16px 30px',
                  borderRadius: 999,
                  background: l.main ? C.crema : 'rgba(23,16,12,.75)',
                  color: l.main ? C.espresso : C.crema,
                  border: l.main ? 'none' : `2px solid ${C.caramel}`,
                  font: `700 ${portrait ? 28 : 26}px ${F.mono}`,
                  opacity: t >= l.at ? 1 : 0,
                  transform: `scale(${pop * (1 + (l.main ? 0.03 : 0.02) * beatEnv(t, 10) * prog(t, l.at + 0.3, 0.3))})`,
                  pointerEvents: 'auto',
                }}
              >
                {l.label} ↗
              </a>
            );
          })}
        </div>
      </At>
    </Stage>
  );
}

// The slam lights every key; while we hold, a glow stays on and a soft ripple goes out every bar.
export const ctaKb = (t: number): KbFrame => ({
  all: t < 1.7 ? 1 : lerp(1, 0.3, prog(t, 1.7, 0.6)),
  shockR: t < 2 ? t * 14 : (t % 2) * 14,
  shockAmp: t < 2 ? Math.exp(-t * 1.5) : 0.35 * Math.exp(-(t % 2) * 1.5),
  pump: 0.32 * beatEnv(t, 8),
  focus: null,
});

/* ------------------------------------------------------------------ 15 */

export function LoopStinger(p: SceneProps) {
  const { t, W, H, loop, portrait } = p;
  const cut = t >= 1.5;
  const tilt = lerp(2, 17, ease.cubicIn(prog(t, 0, 1.5)));
  const wob = Math.sin(t * 19) * tilt;
  const spin = Math.cos(t * 46);
  const cx = W / 2;
  const cy = H * (portrait ? 0.44 : 0.46);

  return (
    <Stage p={p} bg="#000" overlay={<Flash color={C.foam} opacity={0.12 * hit(t, 1.5, 16)} />}>
      {!cut ? (
        <svg className="absolute inset-0" width={W} height={H}>
          <path d={`M${cx - 220} ${cy + 200} H${cx + 220}`} stroke={C.cocoa} strokeWidth={5} />
          <ellipse cx={cx + wob * 2} cy={cy + 204} rx={70} ry={8} fill={C.cocoa} opacity={0.6} />
          <g transform={`rotate(${wob} ${cx} ${cy + 200})`}>
            <path d={`M${cx} ${cy - 160} V${cy - 110}`} stroke={C.crema} strokeWidth={12} strokeLinecap="round" />
            <path
              d={`M${cx - 80} ${cy - 40} Q${cx} ${cy - 120} ${cx + 80} ${cy - 40} Q${cx + 26} ${cy + 30} ${cx} ${cy + 200} Q${cx - 26} ${cy + 30} ${cx - 80} ${cy - 40}Z`}
              fill={C.cinnamon}
              stroke={C.crema}
              strokeWidth={5}
            />
            <ellipse cx={cx} cy={cy - 40} rx={80} ry={18} fill={C.caramel} stroke={C.crema} strokeWidth={5} />
            <path d={`M${cx + spin * 60} ${cy - 50} L${cx + spin * 44} ${cy - 22}`} stroke={C.foam} strokeWidth={6} strokeLinecap="round" />
          </g>
          {[0, 1].map((i) => (
            <path
              key={i}
              d={`M${cx - 130 + i * 20} ${cy - 50 + i * 40} A${130 - i * 20} ${34 - i * 6} 0 0 0 ${cx + 130 - i * 20} ${cy - 50 + i * 40}`}
              fill="none"
              stroke={C.mocha}
              strokeWidth={3}
              strokeDasharray="10 10"
              strokeDashoffset={-t * 300}
              opacity={0.6}
            />
          ))}
        </svg>
      ) : (
        <>
          <At
            x={W / 2}
            y={H / 2 - 30}
            anchor="c"
            style={{
              font: `700 ${portrait ? 46 : 52}px ${F.mono}`,
              letterSpacing: '0.4em',
              color: C.caramel,
              whiteSpace: 'nowrap',
              transform: `scale(${lerp(1.2, 1, ease.expoOut(prog(t, 1.5, 0.2)))})`,
            }}
          >
            {tr('↺ RETURN BY DEATH')}
          </At>
          <At x={W / 2} y={H / 2 + 50} anchor="tc" style={{ font: `500 24px ${F.mono}`, letterSpacing: '0.24em', color: C.taupe, whiteSpace: 'nowrap' }}>
            {tr('LOOP {n} · {from} → 00:00', { n: String(loop + 2).padStart(2, '0'), from: mmss(LOOP) })}
          </At>
        </>
      )}
    </Stage>
  );
}
