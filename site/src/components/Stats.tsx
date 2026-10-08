import { useEffect, useRef, useState } from 'react';
import { animate, useInView } from 'motion/react';
import { Boxes, CalendarDays, Database, Zap } from 'lucide-react';
import { stats } from '../data';
import { Reveal } from './ui';

const icons = { calendar: CalendarDays, zap: Zap, database: Database, boxes: Boxes };
const tints = ['#2de8c0', '#3f7bff', '#9b3bff', '#ff3fb0'];

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, { duration: 1.6, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => controls.stop();
  }, [inView, to]);
  return (
    <span ref={ref}>
      {n}
      {suffix}
    </span>
  );
}

export default function Stats() {
  return (
    <div className="relative z-10 mx-auto -mt-6 max-w-6xl px-4 sm:px-6">
      <Reveal>
        <div className="card grid grid-cols-2 gap-3 p-3 md:grid-cols-4">
          {stats.map((s, i) => {
            const Icon = icons[s.icon];
            return (
              <div
                key={s.label}
                className="group relative overflow-hidden rounded-2xl border border-line bg-chip px-4 py-6 text-center transition-transform hover:-translate-y-1"
              >
                <div
                  className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
                  style={{ background: tints[i] }}
                />
                <p className="relative text-3xl font-extrabold tracking-tight md:text-4xl" style={{ color: tints[i] }}>
                  <Counter to={s.value} suffix={s.suffix} />
                </p>
                <p className="relative mt-2 flex items-center justify-center gap-1.5 text-xs text-muted md:text-sm">
                  <Icon className="h-3.5 w-3.5" style={{ color: tints[i] }} /> {s.label}
                </p>
              </div>
            );
          })}
        </div>
      </Reveal>
    </div>
  );
}
