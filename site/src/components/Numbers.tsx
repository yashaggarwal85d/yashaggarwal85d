import { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView } from 'motion/react';
import { numbers, type Numeral } from '../data';
import { Section, SectionHeading } from './ui';
import { tr } from '../i18n';

const TONES: Record<Numeral['tone'], { bg: string; fg: string; sub: string; border?: string }> = {
  espresso: { bg: 'var(--espresso)', fg: 'var(--crema)', sub: 'var(--latte)' },
  caramel: { bg: 'var(--caramel)', fg: 'var(--espresso)', sub: 'rgba(23,16,12,.7)' },
  foam: { bg: 'var(--foam)', fg: 'var(--espresso)', sub: 'var(--mocha)', border: 'var(--espresso)' },
  cinnamon: { bg: 'var(--cinnamon)', fg: 'var(--foam)', sub: 'rgba(251,247,239,.8)' },
  crema: { bg: 'var(--crema)', fg: 'var(--espresso)', sub: 'var(--mocha)' },
  roast: { bg: 'var(--roast)', fg: 'var(--crema)', sub: 'var(--latte)' },
  oat: { bg: 'rgba(251,247,239,.7)', fg: 'var(--espresso)', sub: 'var(--mocha)', border: 'rgba(23,16,12,.12)' },
};

function Count({ n, run }: { n: Numeral; run: boolean }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) return;
    const c = animate(0, n.value, { duration: 1.1, ease: [0.16, 1, 0.3, 1], onUpdate: setV });
    return () => c.stop();
  }, [run, n.value]);
  return (
    <>
      {n.prefix}
      {v.toFixed(n.decimals ?? 0)}
      {n.suffix}
    </>
  );
}

function Card({ n, i, big }: { n: Numeral; i: number; big?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const tone = TONES[n.tone];
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.94 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : undefined}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: (i % 4) * 0.06 }}
      whileHover={{ y: -6, rotate: i % 2 ? 0.6 : -0.6 }}
      className={`relative flex flex-col justify-between overflow-hidden rounded-[26px] p-6 md:p-7 ${big ? 'md:col-span-2 md:row-span-2' : ''}`}
      style={{ background: tone.bg, color: tone.fg, border: tone.border ? `2px solid ${tone.border}` : undefined, minHeight: big ? 380 : 180 }}
    >
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: tone.sub }}>
        {n.label}
      </p>
      <div>
        <p
          className={`${big ? 'text-[7.5rem] md:text-[10rem]' : 'text-6xl'} font-black leading-[0.9] tracking-[-0.06em] ${big ? 'text-crema-spectrum' : ''}`}
        >
          <Count n={n} run={inView} />
        </p>
        {big && (
          <div className="mt-6 space-y-2.5 font-mono text-xs">
            {[
              { label: tr('~18h before'), w: 100, bg: 'var(--mocha)' },
              { label: tr('~45min after'), w: 4.2, bg: 'var(--caramel)' },
            ].map((b, k) => (
              <div key={k} className="flex items-center gap-3">
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-crema/10">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: b.bg }}
                    initial={{ width: '100%' }}
                    animate={inView ? { width: `${b.w}%` } : undefined}
                    transition={{ duration: k ? 1.2 : 0.01, delay: k ? 0.5 : 0, ease: [0.7, 0, 0.2, 1] }}
                  />
                </div>
                <span className="w-28 shrink-0 text-right" style={{ color: k ? 'var(--caramel)' : tone.sub }}>
                  {b.label}
                </span>
              </div>
            ))}
          </div>
        )}
        <p className="mt-3 text-sm leading-snug" style={{ color: tone.sub }}>
          {n.note}
        </p>
      </div>
    </motion.div>
  );
}

export default function Numbers() {
  return (
    <Section id="numbers">
      <SectionHeading kicker={tr('02 · The numbers')} title={tr('Receipts, not adjectives.')} />
      <div className="grid auto-rows-auto gap-4 sm:grid-cols-2 md:grid-cols-4">
        {numbers.map((n, i) => (
          <Card key={n.label} n={n} i={i} big={i === 0} />
        ))}
      </div>
    </Section>
  );
}
