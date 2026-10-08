import { Mail } from 'lucide-react';
import { profile, sections } from '../data';
import { GitHubIcon, LinkedInIcon } from './ui';
import { tr } from '../i18n';

export default function Footer() {
  const social = [
    { href: profile.github, label: 'GitHub', icon: <GitHubIcon /> },
    { href: profile.linkedin, label: 'LinkedIn', icon: <LinkedInIcon /> },
    { href: `mailto:${profile.email}`, label: tr('Email'), icon: <Mail className="h-4 w-4" /> },
  ];
  return (
    <footer className="relative z-10 border-t border-line bg-[var(--bg)]/80 backdrop-blur-xl">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <span className="font-mono text-lg font-bold text-spectrum">YA</span>
          <p className="mt-3 max-w-xs text-sm text-muted">
            {'{'} {tr('Pipelines that finish before the coffee does.')} {'}'}
          </p>
        </div>
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-widest">{tr('Links')}</p>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-muted">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="transition hover:text-fg">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-widest">{tr('Social')}</p>
          <div className="mt-3 flex gap-2">
            {social.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target={s.href.startsWith('http') ? '_blank' : undefined}
                rel="noopener"
                aria-label={s.label}
                className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-chip text-muted transition hover:-translate-y-0.5 hover:text-fg"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-line py-5 text-center text-xs text-subtle">
        © {new Date().getFullYear()} {profile.name}. {tr('Move your cursor over the background: it’s a keyboard.')}
      </div>
    </footer>
  );
}
