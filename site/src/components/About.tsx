import { useEffect, useState } from 'react';
import { ArrowUpRight, GraduationCap, Mail } from 'lucide-react';
import { education, profile } from '../data';
import { Reveal, Section, SectionHeading } from './ui';
import Globe from './Globe';

function useIsDark() {
  const read = () => document.documentElement.dataset.theme !== 'light';
  const [dark, setDark] = useState(read);
  useEffect(() => {
    const mo = new MutationObserver(() => setDark(read()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => mo.disconnect();
  }, []);
  return dark;
}

export default function About() {
  const dark = useIsDark();
  return (
    <Section id="about">
      <SectionHeading title="About Me" kicker="Who I am" />
      <div className="grid gap-4 md:grid-cols-3">
        <Reveal className="card flex flex-col p-6">
          <div className="flex items-center gap-4">
            <div className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full p-[2px] bg-spectrum">
              <div className="grid h-full w-full place-items-center rounded-full bg-card-solid text-xl font-bold">
                <span className="text-spectrum">{profile.initials}</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold leading-tight text-spectrum">{profile.name}</h3>
              <p className="text-sm text-muted">
                {profile.role} · {profile.company}
              </p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-muted">{profile.summary}</p>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Proudest number so far: the core supply-plan run, cut from{' '}
            <span className="font-semibold text-fg">~18h to ~45min</span>.
          </p>
        </Reveal>

        <Reveal delay={0.08} className="card relative flex flex-col overflow-hidden p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">Open to relocation</p>
          <h3 className="mt-2 text-lg font-semibold leading-snug">
            Based in Bangalore,
            <br />
            ready to move globally
          </h3>
          <div className="relative -mb-24 mt-4 flex-1">
            <Globe dark={dark} />
          </div>
        </Reveal>

        <Reveal delay={0.16} className="card flex flex-col p-6">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-chip text-accent">
              <GraduationCap className="h-4 w-4" />
            </span>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">Education</p>
          </div>
          <div className="my-auto py-6 text-center">
            <p className="text-6xl font-black tracking-tight text-spectrum">9.07</p>
            <p className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-subtle">CGPA out of 10</p>
          </div>
          <div className="rounded-xl border border-line bg-chip p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold leading-snug">{education.school}</p>
              <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
                Graduate
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">{education.degree}</p>
            <div className="mt-3 flex items-center justify-between font-mono text-[11px] text-subtle">
              <span>{education.period}</span>
              <span>{education.place}</span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="card relative overflow-hidden p-6 md:col-span-3 md:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-accent-2/20 blur-3xl" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-500">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping-soft absolute inline-flex h-full w-full rounded-full bg-emerald-500" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Available for work
              </p>
              <h3 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
                Got data at petabyte scale? <span className="text-spectrum">Let’s build it together.</span>
              </h3>
              <p className="mt-2 text-sm text-muted">{profile.availability}</p>
            </div>
            <a
              href={`mailto:${profile.email}`}
              className="group inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-line-strong bg-card-solid px-5 py-3 text-sm font-semibold transition hover:border-accent md:self-auto"
            >
              <Mail className="h-4 w-4" /> {profile.email}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
