import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Command, Menu, Moon, Sun } from 'lucide-react';
import { sections } from '../data';
import type { Theme } from '../App';

export function useActiveSection() {
  const [active, setActive] = useState<string>('home');
  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: [0, 0.25, 0.5, 1] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return active;
}

type Props = { theme: Theme; onToggleTheme: () => void; onOpenPalette: () => void };

export default function Navbar({ theme, onToggleTheme, onOpenPalette }: Props) {
  const active = useActiveSection();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 pt-4 sm:px-6">
        <a href="#home" className="group flex items-center gap-2" aria-label="Yash Aggarwal, home">
          <span className="grid h-9 w-9 place-items-center rounded-xl border border-line-strong bg-card-solid font-mono text-sm font-bold shadow-[0_3px_0_var(--line-strong)] transition-transform group-hover:translate-y-[2px] group-hover:shadow-[0_1px_0_var(--line-strong)]">
            <span className="text-spectrum">YA</span>
          </span>
        </a>

        <nav
          className={`relative hidden items-center gap-1 rounded-full border border-line p-1.5 backdrop-blur-xl transition-colors md:flex ${
            scrolled ? 'bg-card shadow-lg' : 'bg-card/60'
          }`}
        >
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                active === s.id ? 'text-fg' : 'text-muted hover:text-fg'
              }`}
            >
              {active === s.id && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-chip ring-1 ring-line"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                >
                  <span className="absolute -top-2.5 left-1/2 h-1.5 w-10 -translate-x-1/2 rounded-full bg-accent blur-[6px]" />
                  <span className="absolute -top-[7px] left-1/2 h-[3px] w-6 -translate-x-1/2 rounded-full bg-accent" />
                </motion.span>
              )}
              {s.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTheme}
            className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-card text-muted backdrop-blur-xl transition hover:text-fg"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={onOpenPalette}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-line bg-card px-2.5 text-muted backdrop-blur-xl transition hover:text-fg"
            aria-label="Open command menu"
          >
            <Menu className="h-4 w-4 md:hidden" />
            <Command className="hidden h-4 w-4 md:block" />
            <span className="hidden font-mono text-xs md:inline">{isMac ? '⌘K' : 'Ctrl K'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
