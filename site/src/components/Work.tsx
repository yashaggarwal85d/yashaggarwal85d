import { useLayoutEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowUpRight, LayoutGrid } from 'lucide-react';
import { profile, work, type Work as WorkItem } from '../data';
import { SectionHeading, Tag } from './ui';

function Compare({ c, colors }: { c: NonNullable<WorkItem['compare']>; colors: [string, string] }) {
  const max = Math.max(c.before, c.after);
  const rows = [
    { label: c.beforeLabel, value: c.before, muted: true },
    { label: c.afterLabel, value: c.after, muted: false },
  ];
  return (
    <div className="mt-5 space-y-2">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/15">
            <motion.div
              className="h-full rounded-full"
              style={{ background: r.muted ? 'rgba(255,255,255,0.45)' : `linear-gradient(90deg, ${colors[1]}, #fff)` }}
              initial={{ width: 0 }}
              whileInView={{ width: `${Math.max(4, (r.value / max) * 100)}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <span className="w-28 shrink-0 text-right font-mono text-[11px] text-white/80">{r.label}</span>
        </div>
      ))}
    </div>
  );
}

function Card({ item, index }: { item: WorkItem; index: number }) {
  const [a, b] = item.gradient;
  return (
    <article className="card group flex w-[85vw] max-w-[25rem] shrink-0 snap-center flex-col p-4 sm:w-[25rem]">
      <div className="flex items-center justify-between px-1 font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">
        <span className="rounded-md px-1.5 py-0.5 font-semibold text-white" style={{ background: a }}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <span>{item.category}</span>
        <span>{item.period}</span>
      </div>
      <h3 className="mt-4 px-1 text-xl font-bold tracking-tight">{item.title}</h3>
      <p className="mt-1.5 line-clamp-3 min-h-[3.75rem] px-1 text-sm leading-relaxed text-muted">{item.description}</p>

      <div
        className="relative mt-4 overflow-hidden rounded-xl p-5 text-white"
        style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-25 [background-size:22px_22px] transition-transform duration-700 group-hover:scale-110"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.7) 1px, transparent 1.2px)' }}
        />
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
        <p className="relative text-5xl font-black tracking-tight drop-shadow-sm">{item.metric}</p>
        <p className="relative mt-1 text-sm font-medium text-white/85">{item.metricLabel}</p>
        {item.compare ? <Compare c={item.compare} colors={item.gradient} /> : <div className="h-[3.25rem]" />}
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5 px-1">
        {item.tags.map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
      </div>
    </article>
  );
}

function ExploreCard() {
  return (
    <a
      href={profile.github}
      target="_blank"
      rel="noopener"
      className="card group flex w-[85vw] max-w-[25rem] shrink-0 snap-center flex-col items-center justify-center p-8 text-center sm:w-[25rem]"
    >
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-chip text-accent transition-transform group-hover:rotate-6 group-hover:scale-110">
        <LayoutGrid className="h-7 w-7" />
      </span>
      <h3 className="mt-5 text-xl font-bold">More on GitHub</h3>
      <p className="mt-1 text-sm text-subtle">Side projects, experiments and DSA</p>
      <span className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-line-strong px-4 py-1.5 text-sm font-medium transition group-hover:border-accent">
        Explore <ArrowUpRight className="h-4 w-4" />
      </span>
    </a>
  );
}

export default function Work() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const [desktop, setDesktop] = useState(false);

  useLayoutEffect(() => {
    const measure = () => {
      const isDesktop = window.matchMedia('(min-width: 768px)').matches;
      setDesktop(isDesktop);
      const track = trackRef.current;
      if (track) setDistance(Math.max(0, track.scrollWidth - window.innerWidth + 48));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);

  const cards = (
    <>
      {work.map((w, i) => (
        <Card key={w.title} item={w} index={i} />
      ))}
      <ExploreCard />
    </>
  );

  if (!desktop) {
    return (
      <section id="work" className="relative py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading title="Featured Work" kicker="05 · Impact, in numbers" />
        </div>
        <div ref={trackRef} className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-6 [scrollbar-width:none]">
          {cards}
        </div>
      </section>
    );
  }

  return (
    <section id="work" ref={sectionRef} className="relative" style={{ height: `calc(100vh + ${distance}px)` }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto w-full max-w-6xl px-6">
          <SectionHeading title="Featured Work" kicker="05 · Impact, in numbers" />
        </div>
        <motion.div ref={trackRef} style={{ x }} className="flex gap-5 pl-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))] pr-6">
          {cards}
        </motion.div>
        <div className="mx-auto mt-8 h-1 w-40 overflow-hidden rounded-full bg-line">
          <motion.div className="h-full origin-left bg-spectrum" style={{ scaleX: scrollYProgress }} />
        </div>
      </div>
    </section>
  );
}
