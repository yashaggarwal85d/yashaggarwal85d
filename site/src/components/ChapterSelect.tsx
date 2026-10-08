import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Coffee, Copy, Mail, RotateCcw, Search, Volume2 } from 'lucide-react';
import { profile, sections } from '../data';
import { CHAPTERS } from '../reel/scenes';
import { mmss } from '../reel/anim';
import type { ReelControls } from '../reel/Showreel';
import { GitHubIcon, LinkedInIcon } from './ui';
import { tr } from '../i18n';

type Item = { id: string; group: string; key?: string; label: string; sub?: string; meta?: ReactNode; icon?: ReactNode; run: () => void; keepOpen?: boolean };

type Props = {
  open: boolean;
  onClose: () => void;
  reel: RefObject<ReelControls | null>;
  onBeans: () => void;
};

/** `group` stays English (it is compared); this is what the header shows. */
const GROUP_LABEL: Record<string, string> = { 'Intro chapters': tr('Intro chapters'), Explore: tr('Explore'), Actions: tr('Actions') };

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

export default function ChapterSelect({ open, onClose, reel, onBeans }: Props) {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = useMemo<Item[]>(() => {
    const chapters: Item[] = CHAPTERS.map((c, i) => ({
      id: `ch-${c.id}`,
      group: 'Intro chapters',
      key: String(i + 1),
      label: c.label,
      sub: c.sub,
      meta: mmss(c.start),
      run: () => {
        scrollTo('reel');
        reel.current?.chapter(i);
      },
    }));
    const pages: Item[] = sections
      .filter((s) => s.id !== 'reel')
      .map((s) => ({ id: `sec-${s.id}`, group: 'Explore', label: s.label, meta: '↓', run: () => scrollTo(s.id) }));
    const actions: Item[] = [
      {
        id: 'copy',
        group: 'Actions',
        label: copied ? tr('Copied!') : tr('Copy email address'),
        icon: <Copy className="h-4 w-4" />,
        keepOpen: true,
        run: () => navigator.clipboard?.writeText(profile.email).then(() => setCopied(true)),
      },
      { id: 'mail', group: 'Actions', label: tr('Send an email'), icon: <Mail className="h-4 w-4" />, run: () => window.open(`mailto:${profile.email}`) },
      { id: 'in', group: 'Actions', label: tr('Open LinkedIn'), icon: <LinkedInIcon />, run: () => window.open(profile.linkedin, '_blank', 'noopener') },
      { id: 'gh', group: 'Actions', label: tr('Open GitHub'), icon: <GitHubIcon />, run: () => window.open(profile.github, '_blank', 'noopener') },
      { id: 'sound', group: 'Actions', label: tr('Toggle the 120 BPM beat'), icon: <Volume2 className="h-4 w-4" />, run: () => reel.current?.toggleSound() },
      {
        id: 'rbd',
        group: 'Actions',
        label: tr('Return by Death (restart the intro)'),
        icon: <RotateCcw className="h-4 w-4" />,
        run: () => {
          scrollTo('reel');
          reel.current?.restart();
        },
      },
      { id: 'beans', group: 'Actions', label: tr('☕ mode (or try the Konami code)'), icon: <Coffee className="h-4 w-4" />, run: onBeans },
    ];
    return [...chapters, ...pages, ...actions];
  }, [reel, copied, onBeans]);

  const q = query.trim().toLowerCase();
  const filtered = q ? items.filter((i) => `${i.label} ${i.sub ?? ''}`.toLowerCase().includes(q)) : items;

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setIndex(0);
    setCopied(false);
    const id = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(id);
  }, [open]);
  useEffect(() => setIndex(0), [query]);

  const runItem = (item: Item) => {
    item.run();
    if (!item.keepOpen) onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndex((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter' && filtered[index]) {
      e.preventDefault();
      runItem(filtered[index]);
    } else if (!query && /^[1-5]$/.test(e.key)) {
      e.preventDefault();
      runItem(items[Number(e.key) - 1]);
    }
  };

  let lastGroup = '';
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center bg-espresso/50 px-4 pt-[10vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={tr('Chapter select')}
            className="w-full max-w-xl overflow-hidden rounded-3xl border border-crema/15 text-crema shadow-2xl"
            style={{ background: 'rgba(23,16,12,.96)' }}
            initial={{ y: -16, scale: 0.97 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center gap-3 border-b border-crema/10 px-5">
              <Search className="h-4 w-4 text-latte" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={tr('Chapter select: type, or press 1–5')}
                className="h-14 flex-1 bg-transparent text-sm text-crema outline-none placeholder:text-latte/60"
              />
              <kbd className="rounded border border-crema/20 px-1.5 py-0.5 font-mono text-[10px] text-latte">ESC</kbd>
            </div>
            <ul className="max-h-[62vh] overflow-y-auto p-3">
              {filtered.length === 0 && <li className="px-3 py-8 text-center text-sm text-latte">{tr('Nothing brewing under that name.')}</li>}
              {filtered.map((item, i) => {
                const header = item.group !== lastGroup ? item.group : null;
                lastGroup = item.group;
                const on = i === index;
                const chapter = item.group === 'Intro chapters';
                return (
                  <li key={item.id}>
                    {header && <p className="px-3 pb-2 pt-3 font-mono text-[10px] uppercase tracking-[0.25em] text-caramel">{GROUP_LABEL[header] ?? header}</p>}
                    <button
                      onMouseEnter={() => setIndex(i)}
                      onClick={() => runItem(item)}
                      className={`flex w-full items-center gap-4 rounded-2xl text-left transition-all ${chapter ? 'px-4 py-3' : 'px-4 py-2.5'} ${
                        on ? 'translate-x-2 bg-crema text-espresso shadow-[-8px_0_0_#b8612f]' : 'text-crema'
                      }`}
                    >
                      {item.key ? (
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border-2 border-current font-mono text-sm font-bold">{item.key}</span>
                      ) : (
                        <span className={on ? 'text-cinnamon' : 'text-latte'}>{item.icon ?? '§'}</span>
                      )}
                      <span className="flex-1">
                        <span className={chapter ? 'font-display text-2xl font-bold tracking-tight' : 'text-sm'}>{item.label}</span>
                        {item.sub && <em className="ml-2 font-display text-sm opacity-70">{item.sub}</em>}
                      </span>
                      {item.meta && <span className="font-mono text-xs opacity-70">{item.meta}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="border-t border-crema/10 px-5 py-3 font-mono text-[10.5px] tracking-[0.12em] text-latte/70">
              {tr('↑↓ choose · ⏎ jump · 1–5 chapters anywhere · ↑↑↓↓←→←→BA')}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
