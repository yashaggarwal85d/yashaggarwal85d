import { At, Flash, Stage, type SceneProps } from '../Stage';
import { clamp01, ease, hit, lerp, prog, rand, shakes } from '../anim';
import { C, F, gradText } from '../palette';
import { tr } from '../../i18n';

/* ---------------------------------------------------------- TORE UP (song only) */

/**
 * Plays under the hook of "TORE UP", where the line lands every two beats
 * (one reel second here). Each card slams down on one "tore up" and is ripped
 * in half on the next, revealing what replaced it. Six cards, twelve hits,
 * then four for the finale: eight bars, the whole hook.
 */
// Only what no other slide says: the headline numbers have their own scenes.
const CARDS = [
  { label: tr('SUPPLY-CHAIN RULE CHANGES'), old: tr('2-WEEK RELEASES'), now: tr('SAME DAY') },
  { label: tr('FORECASTING PIPELINE'), old: tr('24 HOURS'), now: tr('UNDER 7H') },
  { label: tr('PRODUCTION SPARK JOBS'), old: tr('UNTUNED'), now: tr('30–80% FASTER') },
  { label: tr('FORECAST CYCLES'), old: tr('FIXED SCHEDULE'), now: tr('ON DEMAND') },
  { label: tr('PRODUCTION DATABASES'), old: tr('TODAY’S LOAD'), now: tr('READY FOR 2×') },
  { label: tr('THE OLD WAY'), old: tr('MONOLITHIC CRON JOBS'), now: '' },
];
const PAPERS = [C.oat, C.crema, C.foam, C.latte];

/** A jagged tear down the middle, as clip-path polygons for each half. */
function tear(seed: number) {
  const pts: [number, number][] = [];
  for (let i = 0; i <= 10; i++) pts.push([50 + (rand(seed * 31 + i, 4) - 0.5) * 9, i * 10]);
  const edge = pts.map(([x, y]) => `${x.toFixed(1)}% ${y}%`);
  return {
    left: `polygon(0% 0%, ${edge.join(', ')}, 0% 100%)`,
    right: `polygon(100% 0%, ${edge.join(', ')}, 100% 100%)`,
  };
}
const TEARS = CARDS.map((_, i) => tear(i + 1));

export function TornUp(p: SceneProps) {
  const { t, W, portrait } = p;
  const L = portrait
    ? { hx: 60, hy: 150, hs: 170, cx: 70, cy: 420, cw: 760, ch: 440, olds: 92, nowY: 640, nows: 132 }
    : { hx: 80, hy: 70, hs: 210, cx: 380, cy: 380, cw: 960, ch: 380, olds: 104, nowY: 520, nows: 150 };

  const k = Math.min(15, Math.floor(t)); // hits so far, 0-based
  const card = Math.min(CARDS.length - 1, Math.floor(k / 2));
  const ripped = k % 2 === 1;
  const local = t - card * 2; // 0..2 within this card
  const finale = t >= 12;
  const word = hit(t, k, 9);
  const sh = shakes(
    t,
    Array.from({ length: 16 }, (_, i) => [i, i % 2 ? 16 : 10] as [number, number]),
    0.16,
  );

  const c = CARDS[card];
  const slam = ease.backOutHard(prog(local, 0, 0.18));
  const tilt = (rand(card, 2) - 0.5) * 7;
  const rip = ripped ? prog(local, 1, 0.65) : 0;
  const riseNow = ripped ? ease.backOutHard(prog(local, 1, 0.22)) : 0;
  const paper = PAPERS[card % PAPERS.length];

  const cardFace = (
    <div
      className="absolute inset-0 flex flex-col justify-between"
      style={{ background: paper, padding: portrait ? '34px 40px' : '30px 44px', boxShadow: '0 30px 80px rgba(0,0,0,.45)' }}
    >
      <div style={{ font: `600 ${portrait ? 24 : 20}px ${F.mono}`, letterSpacing: '0.24em', color: C.mocha, display: 'flex', justifyContent: 'space-between' }}>
        <span>{c.label}</span>
        <span>
          0{card + 1}/0{CARDS.length}
        </span>
      </div>
      <div style={{ font: `900 ${L.olds}px/0.95 ${F.sans}`, letterSpacing: '-0.05em', color: C.espresso }}>{c.old}</div>
      <div style={{ font: `600 ${portrait ? 22 : 18}px ${F.mono}`, letterSpacing: '0.3em', color: C.cinnamon }}>{tr('BEFORE')}</div>
    </div>
  );

  return (
    <Stage
      p={p}
      bg={C.espresso}
      cam={{ x: sh[0], y: sh[1], s: 1 + 0.03 * word, r: (k % 2 ? -1 : 1) * 0.6 * word }}
      overlay={<Flash color={finale ? C.cinnamon : C.foam} opacity={(finale ? 0.5 : 0.1) * hit(t, k, 14)} />}
    >
      {/* the word itself, punched on every "tore up" */}
      <At
        x={L.hx}
        y={L.hy}
        style={{
          font: `italic 800 ${L.hs}px/0.9 ${F.display}`,
          letterSpacing: '-0.03em',
          whiteSpace: 'nowrap',
          transformOrigin: '0% 70%',
          transform: `scale(${1 + 0.1 * word}) rotate(${(k % 2 ? 1 : -1) * 1.5 * word}deg)`,
          opacity: 1 - prog(t, 12, 0.08),
          ...(k % 2 ? gradText() : { color: C.crema }),
        }}
      >
        TORE UP
      </At>
      <At
        x={W - (portrait ? 60 : 80)}
        y={portrait ? L.hy + L.hs + 20 : L.hy + 24}
        anchor="tr"
        style={{ font: `700 ${portrait ? 30 : 34}px ${F.mono}`, color: C.caramel, letterSpacing: '0.1em', opacity: 1 - prog(t, 12, 0.08) }}
      >
        ×{String(k + 1).padStart(2, '0')}
      </At>

      {/* the card, slammed then torn */}
      {!finale &&
        (!ripped ? (
          <div
            className="absolute"
            style={{
              left: L.cx,
              top: L.cy,
              width: L.cw,
              height: L.ch,
              transform: `translateY(${(1 - slam) * -90}px) rotate(${tilt * (2 - slam)}deg) scale(${lerp(1.25, 1, slam)})`,
              opacity: clamp01(local / 0.06),
            }}
          >
            {cardFace}
          </div>
        ) : (
          rip < 1 &&
          (['left', 'right'] as const).map((side) => {
            const dir = side === 'left' ? -1 : 1;
            const e = ease.cubicOut(rip);
            return (
              <div
                key={side}
                className="absolute"
                style={{
                  left: L.cx,
                  top: L.cy,
                  width: L.cw,
                  height: L.ch,
                  clipPath: TEARS[card][side],
                  transformOrigin: side === 'left' ? '10% 90%' : '90% 90%',
                  transform: `translate(${dir * (40 + 520 * e)}px, ${30 * e + 520 * rip * rip}px) rotate(${tilt + dir * 24 * e}deg)`,
                  opacity: 1 - prog(rip, 0.6, 0.4),
                }}
              >
                {cardFace}
              </div>
            );
          })
        ))}

      {/* what replaced it */}
      {ripped && !finale && c.now && (
        <At
          x={W / 2}
          y={L.nowY}
          anchor="c"
          style={{
            font: `italic 800 ${Math.min(L.nows, (portrait ? 1250 : 2300) / c.now.length)}px/1 ${F.display}`,
            color: C.caramel,
            whiteSpace: 'nowrap',
            transform: `scale(${lerp(2.2, 1, riseNow)})`,
            opacity: riseNow > 0 ? 1 - prog(local, 1.85, 0.15) : 0,
          }}
        >
          {c.now}
        </At>
      )}

      {/* the last rip: the old way is gone */}
      {finale && (
        <At
          x={W / 2}
          y={portrait ? 900 : 560}
          anchor="c"
          style={{
            font: `italic 800 ${portrait ? 190 : 260}px/1 ${F.display}`,
            letterSpacing: '-0.03em',
            whiteSpace: 'nowrap',
            transform: `scale(${lerp(1.6, 1, ease.backOutHard(prog(t, 12, 0.25))) * (1 + 0.08 * (hit(t, 13, 9) + hit(t, 14, 9) + hit(t, 15, 9)))})`,
            ...gradText(),
          }}
        >
          TORE UP.
        </At>
      )}
    </Stage>
  );
}
