import { ArrowRight, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { profile } from '../data';
import { LinkedInIcon, Reveal, Section } from './ui';

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const copy = () =>
    navigator.clipboard?.writeText(profile.email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });

  return (
    <Section id="contact">
      <Reveal className="mb-10">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Ready to Connect?</h2>
        <p className="mt-2 text-muted">Let’s turn your next data problem into something that runs itself.</p>
        <span className="mt-3 block h-[3px] w-10 rounded-full bg-spectrum" />
      </Reveal>
      <Reveal className="card relative overflow-hidden px-6 py-16 text-center md:py-20">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-accent-2/15 blur-3xl" />
        <h3 className="relative text-4xl font-black tracking-tight md:text-6xl">
          FROM RAW DATA TO <span className="text-spectrum">IMPACT</span>
        </h3>
        <p className="relative mt-3 text-lg font-bold uppercase tracking-wide text-muted md:text-xl">
          Let’s build something that scales.
        </p>
        <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href={`mailto:${profile.email}`}
            className="group inline-flex items-center gap-2 rounded-full bg-fg px-6 py-3 text-sm font-semibold text-bg shadow-[0_4px_0_var(--line-strong)] transition-all hover:translate-y-[2px] hover:shadow-[0_2px_0_var(--line-strong)]"
          >
            Get in touch <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
          <button
            onClick={copy}
            className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-card-solid px-5 py-3 font-mono text-xs transition hover:border-accent"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : profile.email}
          </button>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener"
            className="grid h-11 w-11 place-items-center rounded-full border border-line-strong bg-card-solid transition hover:border-accent hover:text-[#0a66c2]"
            aria-label="LinkedIn"
          >
            <LinkedInIcon />
          </a>
        </div>
        <p className="relative mt-6 text-sm text-subtle">Open to full-time Data Engineering roles · {profile.availability.split(' · ')[0].toLowerCase()}</p>
      </Reveal>
    </Section>
  );
}
