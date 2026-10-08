import { Flash, Stage, type SceneProps } from '../Stage';
import { BEAT, beatEnv, ease, hit, lerp, prog, scramble } from '../anim';
import { C, F } from '../palette';
import { tr } from '../../i18n';

/* ------------------------------------------------------------- the scale */


type Cell = { value: (k: number) => string; label: string; bg: string; fg: string; sub: string; display?: boolean };

const CELLS: Cell[] = [
  { value: (k) => (k < 1 ? scramble('<1s', k, 0, 1) : '<1s'), label: tr('P95 LATENCY'), sub: tr('MES & ERP streams, worldwide'), bg: C.caramel, fg: C.espresso },
  { value: (k) => `${Math.round(16 * k)} TB`, label: tr('LANDED EVERY DAY'), sub: tr('factory and operational data'), bg: C.oat, fg: C.espresso, display: true },
  { value: (k) => `~${Math.round(6 * k)} PB`, label: tr('NEW DATA A YEAR'), sub: tr('in one governed lakehouse'), bg: C.cinnamon, fg: C.foam },
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
