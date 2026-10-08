import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Command, Menu } from 'lucide-react';
import { sections } from '../data';

const NAV = sections.filter((s) => s.nav);

export function useActiveSection() {
  const [active, setActive] = useState({ id: 'reel', group: 'reel' });
  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!hit) return;
        const s = sections.find((x) => x.id === hit.target.id);
        if (s) setActive({ id: s.id, group: s.group ?? s.id });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: [0, 0.25, 0.5, 1] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return active;
}

export default function Navbar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const { id: current, group: active } = useActiveSection();
  // Over the reel and the dark-roast sections the chrome goes dark too.
  const dark = current === 'reel' || current === 'off-the-clock';
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

  const glass = dark
    ? 'border-crema/15 bg-espresso/55 text-crema'
    : 'border-espresso/10 bg-foam/80 text-espresso shadow-[0_8px_30px_rgba(23,16,12,.08)]';

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 pt-4 sm:px-6">
        <a
          href="#reel"
          className={`grid h-10 w-10 place-items-center rounded-xl border font-display text-base font-bold italic backdrop-blur-xl transition-colors ${glass}`}
          aria-label="Yash Aggarwal, back to the reel"
        >
          YA
        </a>

        <nav className={`relative hidden items-center gap-1 rounded-full border p-1.5 backdrop-blur-xl transition-colors md:flex ${glass}`}>
          {NAV.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                active === s.id ? (dark ? 'text-espresso' : 'text-crema') : dark ? 'text-latte hover:text-crema' : 'text-mocha hover:text-espresso'
              }`}
            >
              {active === s.id && (
                <motion.span
                  layoutId="nav-pill"
                  className={`absolute inset-0 -z-10 rounded-full ${dark ? 'bg-crema' : 'bg-espresso'}`}
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                >
                  <span className="absolute -top-[7px] left-1/2 h-[3px] w-6 -translate-x-1/2 rounded-full bg-cinnamon" />
                </motion.span>
              )}
              {s.label}
            </a>
          ))}
        </nav>

        <button
          onClick={onOpenPalette}
          className={`flex h-10 items-center gap-1.5 rounded-xl border px-3 backdrop-blur-xl transition-colors ${glass}`}
          aria-label="Open chapter select"
        >
          <Menu className="h-4 w-4 md:hidden" />
          <Command className="hidden h-4 w-4 md:block" />
          <span className="hidden font-mono text-xs md:inline">{isMac ? '⌘K' : 'Ctrl K'}</span>
        </button>
      </div>
    </header>
  );
}
