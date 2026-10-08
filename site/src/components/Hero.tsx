import { motion } from 'motion/react';
import { ArrowDown, MapPin, Mail } from 'lucide-react';
import { profile, ribbonA, ribbonB } from '../data';

function Ribbon({ words, variant, rotate, duration, reverse }: {
  words: string[];
  variant: 'spectrum' | 'plain';
  rotate: number;
  duration: number;
  reverse?: boolean;
}) {
  const run = [...words, ...words, ...words];
  return (
    <div
      className={`absolute left-[-10vw] w-[120vw] overflow-hidden py-3 shadow-xl ${
        variant === 'spectrum' ? 'bg-spectrum text-white' : 'border-y border-line bg-[var(--ribbon-plain)] text-[var(--ribbon-plain-fg)]'
      }`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <div className={`marquee-track ${reverse ? 'reverse' : ''}`} style={{ ['--marquee-duration' as string]: `${duration}s` }}>
        {[0, 1].map((dup) => (
          <div key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
            {run.map((w, i) => (
              <span key={i} className="flex items-center whitespace-nowrap font-bold uppercase tracking-[0.12em] text-sm md:text-base">
                <span className="px-6">{w}</span>
                <span className="opacity-60">◆</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Hero() {
  const ease = [0.22, 1, 0.36, 1] as const;
  return (
    <section id="home" className="relative flex min-h-[100svh] flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_40%_at_50%_45%,var(--bg)_0%,transparent_100%)] opacity-70" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 pb-40 pt-28 text-center sm:px-6">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="text-xs font-semibold uppercase tracking-[0.4em] text-muted md:text-sm"
        >
          Hi, I’m
        </motion.p>
        <motion.span
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease }}
          className="mt-3 h-[2px] w-12 origin-center rounded-full bg-spectrum"
        />

        <h1 className="mt-6 text-[clamp(3.2rem,12vw,9.5rem)] font-black leading-[0.95] tracking-[-0.04em]">
          {profile.name.split(' ').map((word, i) => (
            <motion.span
              key={word}
              className="text-spectrum inline-block px-[0.04em] drop-shadow-[0_6px_30px_rgba(155,59,255,0.25)]"
              initial={{ opacity: 0, y: 40, filter: 'blur(12px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.9, delay: 0.25 + i * 0.12, ease }}
            >
              {word}
              {i === 0 && ' '}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6, ease }}
          className="mt-6 max-w-2xl text-base text-muted md:text-xl"
        >
          <span className="font-semibold text-fg">{profile.role}</span> at {profile.company}. I build the batch and
          streaming platforms behind semiconductor manufacturing and supply-chain planning.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.75, ease }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <a
            href={`mailto:${profile.email}`}
            className="group inline-flex items-center gap-2 rounded-full bg-fg px-5 py-2.5 text-sm font-semibold text-bg shadow-[0_4px_0_var(--line-strong)] transition-all hover:translate-y-[2px] hover:shadow-[0_2px_0_var(--line-strong)] active:translate-y-[4px] active:shadow-none"
          >
            <Mail className="h-4 w-4" /> Get in touch
          </a>
          <a
            href="#experience"
            className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-card px-5 py-2.5 text-sm font-semibold backdrop-blur-xl transition hover:bg-chip"
          >
            See my work <ArrowDown className="h-4 w-4" />
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-6 inline-flex items-center gap-1.5 font-mono text-xs text-subtle"
        >
          <MapPin className="h-3.5 w-3.5" /> {profile.location} · open to relocation
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.9, ease }}
        className="pointer-events-none absolute inset-x-0 bottom-16 h-24 select-none"
      >
        <div className="absolute inset-x-0 top-0">
          <Ribbon words={ribbonA} variant="spectrum" rotate={-3.2} duration={46} />
        </div>
        <div className="absolute inset-x-0 top-2">
          <Ribbon words={ribbonB} variant="plain" rotate={2.4} duration={52} reverse />
        </div>
      </motion.div>
    </section>
  );
}
