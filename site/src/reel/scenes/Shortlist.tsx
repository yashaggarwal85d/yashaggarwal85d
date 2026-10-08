import { At, Flash, Stage, type SceneProps } from '../Stage';
import { beatEnv, ease, hit, lerp, prog } from '../anim';
import { C, F, gradText } from '../palette';
import { tr } from '../../i18n';

/* ---------------------------------------------------------- the shortlist */

/**
 * What recruiters and hiring managers scan for first, ticked off one per hit
 * (every two beats): fit, stack, ownership, leadership, communication,
 * collaboration, reliability, AI, recognition, logistics. Nothing here is
 * repeated from another slide.
 */
const ITEMS = [
  { k: tr('FIT'), v: tr('Data engineer, batch and streaming, 3+ years at a Fortune 500') },
  { k: tr('STACK'), v: tr('Python · SQL · PySpark · Kafka · Airflow · Kubernetes') },
  { k: tr('OWNERSHIP'), v: tr('Drove the data track of a 20-engineer programme') },
  { k: tr('LEADERSHIP'), v: tr('Mentored 2 engineers and 3 interns') },
  { k: tr('COMMUNICATION'), v: tr('Presented to global IT leadership at TI HQ, Dallas') },
  { k: tr('COLLABORATION'), v: tr('Built with planners, yield and logistics teams') },
  { k: tr('RELIABILITY'), v: tr('On call for production, sized for growth') },
  { k: tr('AI'), v: tr('Builds with AI agents and model inference, every day') },
  { k: tr('RECOGNITION'), v: tr('Hackathon winner ’24 · Star of the Quarter') },
  { k: tr('AVAILABILITY'), v: tr('Ready to relocate · notice 1–2 months · fluent English') },
];

export function Shortlist(p: SceneProps) {
  const { t, portrait } = p;
  const n = Math.min(ITEMS.length, Math.floor(t) + 1); // items ticked so far
  const cols = portrait ? 1 : 2;
  const rowH = portrait ? 100 : 104;
  const colW = portrait ? 780 : 700;
  const top = portrait ? 400 : 270;
  const enter = ease.expoOut(prog(t, 0, 0.35));

  return (
    <Stage
      p={p}
      bg={C.espresso}
      cam={{ s: 1 + 0.012 * beatEnv(t, 9) + 0.02 * hit(t, n - 1, 9) }}
      overlay={<Flash color={C.foam} opacity={0.08 * hit(t, n - 1, 14)} />}
    >
      <At x={portrait ? 60 : 80} y={portrait ? 140 : 96} style={{ font: `700 ${portrait ? 24 : 22}px ${F.mono}`, letterSpacing: '0.3em', color: C.caramel, opacity: enter }}>
        {tr('THE SHORTLIST')}
      </At>
      <At x={portrait ? 60 : 80} y={portrait ? 186 : 132} style={{ font: `800 ${portrait ? 76 : 80}px/1 ${F.display}`, letterSpacing: '-0.03em', color: C.crema, opacity: enter, whiteSpace: 'nowrap' }}>
        {tr('Why me,')} <span style={{ fontStyle: 'italic', fontWeight: 600, ...gradText() }}>{tr('in ten ticks.')}</span>
      </At>
      <At
        x={portrait ? 840 : 1520}
        y={portrait ? 300 : 120}
        anchor="tr"
        style={{ font: `700 ${portrait ? 40 : 48}px ${F.mono}`, color: C.caramel, transform: `scale(${1 + 0.25 * hit(t, n - 1, 10)})`, transformOrigin: '100% 50%' }}
      >
        {String(n).padStart(2, '0')}/10
      </At>

      {ITEMS.map((it, i) => {
        if (i >= n) return null;
        const col = cols === 1 ? 0 : i < 5 ? 0 : 1;
        const row = cols === 1 ? i : i % 5;
        const x = (portrait ? 60 : 80) + col * (colW + 60);
        const y = top + row * rowH;
        const pop = ease.backOutHard(prog(t, i, 0.22));
        const tick = ease.expoOut(prog(t, i + 0.08, 0.22));
        const live = i === n - 1;
        return (
          <div key={i}>
            <div
              className="absolute"
              style={{
                left: x,
                top: y,
                width: portrait ? 56 : 60,
                height: portrait ? 56 : 60,
                borderRadius: 12,
                border: `4px solid ${live ? C.caramel : C.mocha}`,
                background: live ? C.caramel : 'transparent',
                transform: `scale(${lerp(1.6, 1, pop)})`,
              }}
            >
              <svg viewBox="0 0 60 60" width="100%" height="100%">
                <path
                  d="M14 31 L26 43 L47 17"
                  fill="none"
                  stroke={live ? C.espresso : C.caramel}
                  strokeWidth={7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={60}
                  strokeDashoffset={60 * (1 - tick)}
                />
              </svg>
            </div>
            <At
              x={x + (portrait ? 80 : 86)}
              y={y - 4}
              style={{ width: colW - 90, opacity: live ? 1 : 0.62, transform: `translateX(${(1 - pop) * 40}px)` }}
            >
              <div style={{ font: `700 ${portrait ? 18 : 17}px ${F.mono}`, letterSpacing: '0.24em', color: live ? C.caramel : C.taupe }}>{it.k}</div>
              <div style={{ marginTop: 4, font: `600 ${portrait ? 28 : 27}px/1.25 ${F.sans}`, color: C.crema }}>{it.v}</div>
            </At>
          </div>
        );
      })}
    </Stage>
  );
}
