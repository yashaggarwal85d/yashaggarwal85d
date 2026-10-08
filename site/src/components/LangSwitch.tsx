import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Languages } from 'lucide-react';
import { LANGS, lang, setLang, tr, type Lang } from '../i18n';

/** The page follows the visitor's region; this lets them pick another language. */
export default function LangSwitch({ dark }: { dark: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('pointerdown', close);
    window.addEventListener('keydown', esc);
    return () => {
      window.removeEventListener('pointerdown', close);
      window.removeEventListener('keydown', esc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={tr('Language')}
        className={`flex h-10 items-center gap-1.5 rounded-xl border px-3 font-mono text-xs uppercase backdrop-blur-xl transition ${
          dark ? 'border-crema/20 bg-espresso/60 text-latte hover:text-crema' : 'border-line bg-card/80 text-muted hover:text-fg'
        }`}
      >
        <Languages className="h-4 w-4" />
        {lang}
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 z-50 max-h-[70vh] w-44 overflow-auto rounded-2xl border border-crema/15 bg-espresso p-1.5 text-crema shadow-2xl"
          >
            {(Object.keys(LANGS) as Lang[]).map((l) => (
              <li key={l}>
                <button
                  role="option"
                  aria-selected={l === lang}
                  onClick={() => (l === lang ? setOpen(false) : setLang(l))}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition hover:bg-crema/10"
                  lang={l}
                >
                  <span>{LANGS[l]}</span>
                  {l === lang ? <Check className="h-4 w-4 text-caramel" /> : <span className="font-mono text-[10px] uppercase text-latte/60">{l}</span>}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
