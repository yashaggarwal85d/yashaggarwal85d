import { At, Stage, type SceneProps } from '../Stage';
import { beatEnv, clamp01, ease, hit, lerp, prog, typed } from '../anim';
import { C, F } from '../palette';
import { tr } from '../../i18n';

/* ---------------------------------------------------------- how the data flows */

/**
 * The production pattern most global companies run: OLTP systems (ERP, MES)
 * publish every change through CDC into Kafka; a hot path keeps an operational
 * (OLTP) store current within seconds for the apps that run the business, and
 * a cold path lands raw data in the lakehouse, transforms and models it, and
 * serves it from an OLAP engine to BI, planners and ML. A stage lands every
 * two beats.
 */
type Node = { id: string; at: number; path: 'src' | 'hot' | 'cold'; label: string; tech: string };
const NODES: Node[] = [
  { id: 'src', at: 0, path: 'src', label: tr('SOURCES · OLTP'), tech: 'ERP · MES · Oracle' },
  { id: 'kafka', at: 1, path: 'src', label: tr('CHANGE DATA CAPTURE'), tech: 'CDC → Kafka' },
  { id: 'stream', at: 2, path: 'hot', label: tr('STREAM PROCESSING'), tech: 'Kafka · Flink' },
  { id: 'ops', at: 2.25, path: 'hot', label: tr('OPERATIONAL STORE'), tech: 'YugabyteDB · OLTP' },
  { id: 'apps', at: 2.5, path: 'hot', label: tr('APPS & APIs'), tech: tr('planning · factory apps') },
  { id: 'land', at: 3, path: 'cold', label: tr('RAW LANDING'), tech: 'S3 · Iceberg' },
  { id: 'xform', at: 3.25, path: 'cold', label: tr('TRANSFORM'), tech: 'PySpark · dbt · Airflow' },
  { id: 'model', at: 4, path: 'cold', label: tr('MODEL'), tech: tr('Data Vault → marts') },
  { id: 'olap', at: 4.25, path: 'cold', label: 'OLAP', tech: 'ClickHouse' },
  { id: 'use', at: 5, path: 'cold', label: tr('INSIGHT'), tech: tr('BI · planners · ML') },
];
const EDGES: [string, string][] = [
  ['src', 'kafka'],
  ['kafka', 'stream'],
  ['stream', 'ops'],
  ['ops', 'apps'],
  ['kafka', 'land'],
  ['land', 'xform'],
  ['xform', 'model'],
  ['model', 'olap'],
  ['olap', 'use'],
];
const TINT = { src: C.mocha, hot: C.cinnamon, cold: C.caramel };

export function PourScene(p: SceneProps) {
  const { t, W, H, portrait } = p;
  const NW = portrait ? 360 : 270;
  const NH = portrait ? 104 : 96;

  // landscape: sources on the left, the two paths fanning out to the right
  const pos: Record<string, [number, number]> = portrait
    ? {
        src: [450, 420],
        kafka: [450, 570],
        stream: [245, 760],
        ops: [245, 900],
        apps: [245, 1040],
        land: [655, 760],
        xform: [655, 900],
        model: [655, 1040],
        olap: [655, 1180],
        use: [655, 1320],
      }
    : {
        src: [175, 400],
        kafka: [175, 580],
        stream: [510, 330],
        ops: [830, 330],
        apps: [1150, 330],
        land: [510, 650],
        xform: [830, 650],
        model: [1150, 650],
        olap: [1440, 650],
        use: [1440, 490],
      };
  const by = Object.fromEntries(NODES.map((n) => [n.id, n]));
  const show = (n: Node) => ease.backOutHard(prog(t, n.at, 0.25));
  const enter = ease.expoOut(prog(t, 0, 0.4));
  // Each edge is a straight line or an S-curve; packets ride it, computed per frame.
  const curve = (a: string, b: string): [number, number][] => {
    const [x1, y1] = pos[a];
    const [x2, y2] = pos[b];
    if (x1 === x2 || y1 === y2) return [[x1, y1], [x2, y2]];
    if (portrait) {
      const my = (y1 + y2) / 2;
      return [[x1, y1], [x1, my], [x2, my], [x2, y2]];
    }
    const mx = (x1 + x2) / 2;
    return [[x1, y1], [mx, y1], [mx, y2], [x2, y2]];
  };
  const edgePath = (a: string, b: string) => {
    const c = curve(a, b);
    return c.length === 2 ? `M${c[0][0]} ${c[0][1]} L${c[1][0]} ${c[1][1]}` : `M${c[0][0]} ${c[0][1]} C${c[1][0]} ${c[1][1]}, ${c[2][0]} ${c[2][1]}, ${c[3][0]} ${c[3][1]}`;
  };
  const pointAt = (a: string, b: string, u: number): [number, number] => {
    const c = curve(a, b);
    if (c.length === 2) return [lerp(c[0][0], c[1][0], u), lerp(c[0][1], c[1][1], u)];
    const v = 1 - u;
    const k = [v * v * v, 3 * v * v * u, 3 * v * u * u, u * u * u];
    return [k.reduce((s, w, i) => s + w * c[i][0], 0), k.reduce((s, w, i) => s + w * c[i][1], 0)];
  };

  return (
    <Stage p={p} bg={C.oat} cam={{ s: 1 + 0.012 * beatEnv(t, 9) }}>
      <At x={portrait ? 60 : 80} y={portrait ? 140 : 70} style={{ font: `700 ${portrait ? 24 : 22}px ${F.mono}`, letterSpacing: '0.3em', color: C.cinnamon, opacity: enter }}>
        {tr('THE PIPELINE')}
      </At>
      <At x={portrait ? 60 : 80} y={portrait ? 186 : 106} style={{ font: `800 ${portrait ? 88 : 84}px/1 ${F.display}`, letterSpacing: '-0.03em', color: C.espresso, opacity: enter, whiteSpace: 'nowrap' }}>
        {tr('How I brew data.')}
      </At>

      {/* lane labels */}
      {!portrait && (
        <>
          <At x={375} y={244} style={{ font: `700 18px ${F.mono}`, letterSpacing: '0.24em', color: C.cinnamon, opacity: clamp01((t - 2) / 0.2) }}>
            {tr('HOT PATH · SECONDS')}
          </At>
          <At x={375} y={714} style={{ font: `700 18px ${F.mono}`, letterSpacing: '0.24em', color: C.mocha, opacity: clamp01((t - 3) / 0.2) }}>
            {tr('COLD PATH · ANALYTICS')}
          </At>
        </>
      )}
      {portrait && (
        <>
          <At x={245} y={680} anchor="tc" style={{ font: `700 20px ${F.mono}`, letterSpacing: '0.2em', color: C.cinnamon, opacity: clamp01((t - 2) / 0.2), whiteSpace: 'nowrap' }}>
            {tr('HOT PATH · SECONDS').split(' · ')[0]}
          </At>
          <At x={655} y={680} anchor="tc" style={{ font: `700 20px ${F.mono}`, letterSpacing: '0.2em', color: C.mocha, opacity: clamp01((t - 3) / 0.2), whiteSpace: 'nowrap' }}>
            {tr('COLD PATH · ANALYTICS').split(' · ')[0]}
          </At>
        </>
      )}

      {/* edges, drawn as their target lands, with packets riding them on the beat */}
      <svg className="absolute inset-0 overflow-visible" width={W} height={H}>
        {EDGES.map(([a, b]) => {
          const target = by[b];
          const draw = ease.cubicOut(prog(t, target.at - 0.15, 0.3));
          if (draw <= 0) return null;
          const d = edgePath(a, b);
          return (
            <g key={a + b}>
              <path d={d} fill="none" stroke={TINT[target.path]} strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray={`${draw} 1`} opacity={0.75} />
              {draw >= 1 &&
                [0, 0.5].map((o) => {
                  const [px, py] = pointAt(a, b, ease.sineInOut((t + o) % 1));
                  return <circle key={o} cx={px} cy={py} r={7} fill={TINT[target.path]} />;
                })}
            </g>
          );
        })}
      </svg>

      {/* the stages */}
      {NODES.map((n) => {
        const s = show(n);
        if (t < n.at - 0.02) return null;
        const [x, y] = pos[n.id];
        const live = t - n.at < 1;
        return (
          <div
            key={n.id}
            className="absolute"
            style={{
              left: x - NW / 2,
              top: y - NH / 2,
              width: NW,
              height: NH,
              borderRadius: 18,
              background: C.foam,
              border: `3px solid ${C.espresso}`,
              boxShadow: `0 ${live ? 8 : 5}px 0 ${C.espresso}`,
              transform: `scale(${lerp(1.4, 1, s) * (1 + 0.06 * hit(t, n.at, 10))})`,
              opacity: clamp01(s * 3),
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '0 18px',
            }}
          >
            <div className="absolute inset-y-0 left-0" style={{ width: 8, background: TINT[n.path] }} />
            <div style={{ font: `700 ${portrait ? 18 : 15}px ${F.mono}`, letterSpacing: '0.1em', color: TINT[n.path], whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.label}</div>
            <div style={{ marginTop: 6, font: `600 ${portrait ? 23 : 19}px ${F.sans}`, color: C.espresso, whiteSpace: 'nowrap' }}>{n.tech}</div>
          </div>
        );
      })}

      {/* the takeaway */}
      <At
        x={portrait ? W / 2 : 80}
        y={portrait ? 1450 : 780}
        anchor={portrait ? 'tc' : 'tl'}
        style={{ font: `italic 500 ${portrait ? 40 : 34}px ${F.display}`, color: C.mocha, whiteSpace: 'nowrap' }}
      >
        {typed(tr('OLTP runs the business. OLAP explains it.'), t, 5.1, 70)}
      </At>
    </Stage>
  );
}
