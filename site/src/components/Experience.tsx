import { useRef, useState } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { ChevronDown, Code2, MapPin, Server, Workflow } from 'lucide-react';
import { experience, type Job } from '../data';
import { Section, SectionHeading, Tag } from './ui';
import { tr } from '../i18n';

const icons = { server: Server, workflow: Workflow, code: Code2 };
const VISIBLE = 4;

function Entry({ job, side }: { job: Job; side: 'left' | 'right' }) {
  const [open, setOpen] = useState(false);
  const Icon = icons[job.icon];
  const points = open ? job.points : job.points.slice(0, VISIBLE);
  const hidden = job.points.length - VISIBLE;

  return (
    <div className="relative grid grid-cols-[2.5rem_1fr] gap-4 md:grid-cols-[1fr_3rem_1fr] md:gap-8">
      <div className="relative row-span-1 flex justify-center md:col-start-2 md:row-start-1">
        <motion.span
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          className="sticky top-28 z-10 grid h-10 w-10 place-items-center rounded-full border-4 border-[var(--bg)] text-white shadow-lg"
          style={{ background: job.color, boxShadow: `0 0 24px ${job.color}66` }}
        >
          <Icon className="h-4 w-4" />
        </motion.span>
      </div>

      <motion.article
        initial={{ opacity: 0, x: side === 'left' ? -32 : 32 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={`card p-5 md:row-start-1 md:p-6 ${side === 'left' ? 'md:col-start-1' : 'md:col-start-3'}`}
      >
        <p className="font-mono text-xs font-semibold uppercase tracking-wider" style={{ color: job.color }}>
          {job.period}
        </p>
        <h3 className="mt-2 text-xl font-bold tracking-tight">{job.title}</h3>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm">
          <span className="font-semibold" style={{ color: job.color }}>
            {job.company}
          </span>
          <span className="inline-flex items-center gap-1 text-subtle">
            <MapPin className="h-3 w-3" /> {job.place}
          </span>
        </p>
        {job.blurb && <p className="mt-3 text-sm italic text-subtle">{job.blurb}</p>}
        <ul className="mt-4 space-y-2.5">
          {points.map((p) => (
            <li key={p} className="flex gap-2.5 text-sm leading-relaxed text-muted">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: job.color }} />
              <span>{p}</span>
            </li>
          ))}
        </ul>
        {hidden > 0 && (
          <button
            onClick={() => setOpen((o) => !o)}
            className="mt-3 inline-flex items-center gap-1 font-mono text-xs text-subtle transition hover:text-fg"
            aria-expanded={open}
          >
            {open ? tr('Show less') : tr('+{n} more', { n: hidden })}
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        )}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {job.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      </motion.article>
    </div>
  );
}

export default function Experience() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 60%'] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <Section id="experience">
      <SectionHeading title={tr('Experience')} kicker={tr('04 · Where I’ve built')} />
      <div ref={ref} className="relative space-y-10 md:space-y-16">
        <div className="absolute bottom-0 left-5 top-0 w-px -translate-x-1/2 bg-line md:left-1/2" />
        <motion.div
          className="absolute bottom-0 left-5 top-0 w-[2px] origin-top -translate-x-1/2 bg-gradient-to-b from-cinnamon via-caramel to-mocha md:left-1/2"
          style={{ scaleY: fill }}
        />
        {experience.map((job, i) => (
          <Entry key={job.title} job={job} side={i % 2 === 0 ? 'left' : 'right'} />
        ))}
      </div>
    </Section>
  );
}
