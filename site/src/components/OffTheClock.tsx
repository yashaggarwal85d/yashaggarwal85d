import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'motion/react';
import { Plus } from 'lucide-react';
import BlackHole from './BlackHole';
import { euler, films, profile } from '../data';
import { Reveal, SectionHeading } from './ui';

/* ---------------------------------------------------------------- quantum */

function useTicker(active: boolean) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!active || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const start = performance.now();
    const loop = () => {
      raf = requestAnimationFrame(loop);
      setT((performance.now() - start) / 1000);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [active]);
  return t;
}

function Qubit() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const t = useTicker(inView);
  const [theta, setTheta] = useState(1.1);
  const [result, setResult] = useState<0 | 1 | null>(null);
  const [tally, setTally] = useState({ 0: 0, 1: 0 });

  const p0 = Math.cos(theta / 2) ** 2;
  const shown = result === null ? theta : result === 0 ? 0 : Math.PI;
  const phi = t * 1.6;
  const R = 70;
  const x = R * Math.sin(shown) * Math.cos(phi);
  const y = -R * Math.cos(shown) * 0.95 + R * Math.sin(shown) * Math.sin(phi) * 0.26;

  const measure = () => {
    if (result !== null) {
      setResult(null);
      setTheta(0.4 + Math.random() * 2.3);
      return;
    }
    const r = Math.random() < p0 ? 0 : 1;
    setResult(r);
    setTally((s) => ({ ...s, [r]: s[r] + 1 }));
  };

  return (
    <div ref={ref} className="card flex h-full flex-col p-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-caramel">Quantum computing</p>
      <h3 className="mt-2 font-display text-2xl font-bold leading-tight">One qubit, both answers.</h3>
      <svg viewBox="-100 -100 200 200" className="mx-auto my-3 w-44" aria-hidden>
        <circle r={R} fill="rgba(212,154,87,.07)" stroke="var(--latte)" strokeWidth={2} />
        <ellipse rx={R} ry={R * 0.26} fill="none" stroke="var(--latte)" strokeWidth={1.5} strokeDasharray="5 5" />
        <path d={`M0 ${-R - 12} V${R + 12} M${-R - 12} 0 H${R + 12}`} stroke="var(--mocha)" strokeWidth={1.5} />
        <motion.path d={`M0 0 L${x} ${y}`} stroke="var(--cinnamon)" strokeWidth={5} strokeLinecap="round" />
        <circle cx={x} cy={y} r={7} fill="var(--caramel)" />
        <text x={6} y={-R - 14} fill="var(--crema)" fontSize={14} fontFamily="Fraunces">|0⟩</text>
        <text x={6} y={R + 26} fill="var(--crema)" fontSize={14} fontFamily="Fraunces">|1⟩</text>
      </svg>
      <p className="font-mono text-xs text-muted">
        {result === null ? (
          <>
            odds · |0⟩ {Math.round(p0 * 100)}% · |1⟩ {Math.round((1 - p0) * 100)}%
          </>
        ) : (
          <>measured → |{result}⟩. The superposition is gone.</>
        )}
      </p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-4">
        <button
          onClick={measure}
          className="whitespace-nowrap rounded-full bg-caramel px-4 py-2 text-sm font-semibold text-espresso transition hover:brightness-110 active:scale-95"
        >
          {result === null ? 'Measure' : 'Prepare again'}
        </button>
        <span className="whitespace-nowrap font-mono text-[11px] text-subtle">
          |0⟩×{tally[0]} · |1⟩×{tally[1]}
        </span>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- maths */

function Euler() {
  const [k, setK] = useState<string>('e');
  const btn = (key: string, label: React.ReactNode, cls = '') => (
    <button
      onMouseEnter={() => setK(key)}
      onFocus={() => setK(key)}
      onClick={() => setK(key)}
      className={`rounded-md px-0.5 transition-colors ${k === key ? 'bg-cinnamon/15 text-cinnamon' : 'hover:text-cinnamon'} ${cls}`}
      aria-label={`About ${key}`}
    >
      {label}
    </button>
  );
  return (
    <div className="flex h-full flex-col rounded-[1.25rem] bg-oat p-6 text-espresso shadow-[var(--shadow)]">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-cinnamon">Maths</p>
      <h3 className="mt-2 font-display text-2xl font-bold leading-tight">The best line ever written.</h3>
      <p className="my-5 whitespace-nowrap text-center font-display text-4xl font-bold sm:text-5xl md:text-4xl xl:text-5xl">
        {btn('e', 'e')}
        <sup className="text-[0.5em]">
          {btn('i', 'i')}
          {btn('π', 'π')}
        </sup>
        <span className="mx-1.5 text-mocha">+</span>
        {btn('1', '1')}
        <span className="mx-1.5 text-mocha">=</span>
        {btn('0', '0')}
      </p>
      <AnimatePresence mode="wait">
        <motion.p
          key={k}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="mt-auto min-h-[4.5rem] text-sm leading-relaxed text-mocha"
        >
          {euler[k]}
        </motion.p>
      </AnimatePresence>
      <p className="mt-2 font-mono text-[11px] text-taupe">hover or tab through the constants</p>
    </div>
  );
}

/* ---------------------------------------------------------------- cinema */

function Shelf() {
  const [open, setOpen] = useState(2);
  return (
    <div className="card flex flex-col gap-6 p-6 md:flex-row md:items-end md:p-8">
      <div className="md:w-56 md:shrink-0 md:self-stretch">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-caramel">The shelf</p>
        <h3 className="mt-2 font-display text-3xl font-bold leading-tight">Series, films, anime… and the rest.</h3>
        <p className="mt-3 text-sm text-muted">Rich taste, strong opinions. Pull one off the shelf.</p>
      </div>
      <div className="flex min-h-[15rem] flex-1 items-end gap-3 overflow-x-auto pb-2 [scrollbar-width:none]">
        {films.map((f, i) => {
          const isOpen = i === open;
          return (
            <motion.button
              key={f.title}
              layout
              onClick={() => setOpen(i)}
              onMouseEnter={() => setOpen(i)}
              onFocus={() => setOpen(i)}
              aria-expanded={isOpen}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              className="relative shrink-0 overflow-hidden rounded-xl text-left shadow-[0_16px_40px_rgba(0,0,0,.35)]"
              style={{
                width: isOpen ? 'min(19rem, 70vw)' : '4.5rem',
                height: isOpen ? '14.5rem' : `${12 + (i % 3)}rem`,
                background: f.spine,
                color: f.ink,
                border: '2px solid rgba(233,217,191,.15)',
                rotate: isOpen ? -1.5 : 0,
              }}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {isOpen ? (
                  <motion.div
                    key="card"
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="flex h-full flex-col p-5"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-70">{f.kind}</span>
                    <span className="mt-1 text-2xl font-extrabold tracking-wide">{f.title.toUpperCase()}</span>
                    <span className="mt-3 font-display text-lg italic leading-snug">“{f.take}”</span>
                  </motion.div>
                ) : (
                  <motion.span
                    key="spine"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-x-0 bottom-4 flex justify-center text-lg font-extrabold tracking-[0.14em]"
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                  >
                    {f.title.toUpperCase()}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
        <a
          href={`mailto:${profile.email}?subject=${encodeURIComponent('A recommendation for your shelf')}`}
          className="grid h-44 w-[4.5rem] shrink-0 place-items-center rounded-xl border-2 border-dashed border-line-strong text-muted transition hover:border-caramel hover:text-caramel"
          aria-label="Recommend me something to watch"
          title="Recommend me something"
        >
          <Plus className="h-6 w-6" />
        </a>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- section */

export default function OffTheClock() {
  return (
    <section id="off-the-clock" className="roast relative z-10 py-20 md:py-28" style={{ background: 'var(--roast)' }}>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <SectionHeading kicker="07 · Off the clock" title="Things I can’t stop thinking about." />
        <div className="grid gap-4 md:grid-cols-4">
          <Reveal className="md:col-span-2 md:row-span-1">
            <div className="relative h-80 overflow-hidden rounded-[1.25rem] border border-line">
              <BlackHole interactive hole={{ x: 0.66, y: 0.52, r: 0.2 }} />
              <div className="pointer-events-none absolute left-6 top-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-caramel">Astrophysics</p>
                <h3 className="mt-2 font-display text-3xl font-bold leading-[1.05] text-crema">
                  Black holes,
                  <br />
                  gently.
                </h3>
              </div>
              <p className="pointer-events-none absolute bottom-5 left-6 font-mono text-[11px] text-latte">◎ move your cursor: light bends around it</p>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <Qubit />
          </Reveal>
          <Reveal delay={0.16}>
            <Euler />
          </Reveal>
          <Reveal className="md:col-span-4" delay={0.1}>
            <Shelf />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
