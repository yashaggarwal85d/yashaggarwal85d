import { GraduationCap, Presentation, Star, Trophy } from 'lucide-react';
import { achievements } from '../data';
import { Reveal, Section, SectionHeading } from './ui';
import { tr } from '../i18n';

const icons = { presentation: Presentation, trophy: Trophy, star: Star, grad: GraduationCap };

export default function Achievements() {
  return (
    <Section id="achievements">
      <SectionHeading title={tr('Achievements')} kicker={tr('08 · Recognition')} />
      <div className="grid gap-4 md:grid-cols-2">
        {achievements.map((a, i) => {
          const Icon = icons[a.icon];
          return (
            <Reveal key={a.title} delay={(i % 2) * 0.08} className="card group relative overflow-hidden p-5 md:p-6">
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30"
                style={{ background: a.color }}
              />
              <div className="relative flex gap-4">
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-transform group-hover:-rotate-6 group-hover:scale-110"
                  style={{ background: `${a.color}22`, color: a.color }}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-bold leading-snug">{a.title}</h3>
                  <p className="mt-0.5 font-mono text-xs" style={{ color: a.color }}>
                    {a.org} · {a.date}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{a.text}</p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
