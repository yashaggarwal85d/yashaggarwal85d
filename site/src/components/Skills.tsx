import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { brandIcons } from '../brandIcons';
import { skills, type Skill, type SkillGroup } from '../data';
import { Section, SectionHeading } from './ui';

const groups: ('All' | SkillGroup)[] = ['All', 'Languages', 'Processing', 'Lakehouse', 'Databases', 'Cloud & IaC', 'DevOps'];

const luminance = (hex: string) => {
  const n = parseInt(hex.replace('#', ''), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};

function SkillIcon({ skill }: { skill: Skill }) {
  const icon = skill.icon ? brandIcons[skill.icon] : undefined;
  if (icon) {
    const hex = `#${icon.hex}`;
    // Near-black brand colours (Rust, Kafka, AWS…) fall back to the text colour.
    const fill = luminance(hex) < 0.22 ? 'var(--fg)' : hex;
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden style={{ fill }}>
        <path d={icon.path} />
      </svg>
    );
  }
  return (
    <span
      className="grid h-7 min-w-7 place-items-center rounded-md px-1 font-mono text-[11px] font-bold"
      style={{ color: skill.color, background: `${skill.color}1f` }}
      aria-hidden
    >
      {skill.mark}
    </span>
  );
}

export default function Skills() {
  const [group, setGroup] = useState<(typeof groups)[number]>('All');
  const shown = group === 'All' ? skills : skills.filter((s) => s.group === group);

  return (
    <Section id="skills">
      <SectionHeading title="Skills" kicker="The toolbox" />
      <div className="mb-6 flex flex-wrap gap-2">
        {groups.map((g) => (
          <button
            key={g}
            onClick={() => setGroup(g)}
            className={`relative rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              group === g ? 'text-bg' : 'border border-line bg-card text-muted hover:text-fg'
            }`}
          >
            {group === g && (
              <motion.span layoutId="skill-chip" className="absolute inset-0 -z-0 rounded-full bg-fg" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
            )}
            <span className="relative">{g}</span>
          </button>
        ))}
      </div>
      <motion.div layout className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        <AnimatePresence mode="popLayout">
          {shown.map((s) => (
            <motion.div
              layout
              key={s.name}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.25 }}
              className="group card flex aspect-[5/4] flex-col items-center justify-center gap-2 !rounded-2xl p-3 text-center shadow-[0_4px_0_var(--line)] transition-[transform,box-shadow] duration-150 hover:translate-y-[3px] hover:shadow-[0_1px_0_var(--line)]"
            >
              <div className="transition-transform duration-200 group-hover:scale-110">
                <SkillIcon skill={s} />
              </div>
              <span className="text-[11px] font-medium leading-tight text-muted group-hover:text-fg">{s.name}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </Section>
  );
}
