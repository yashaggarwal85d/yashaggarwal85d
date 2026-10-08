import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Copy, CornerDownLeft, Hash, Mail, Moon, Search, Sun } from 'lucide-react';
import { profile, sections } from '../data';
import { GitHubIcon, LinkedInIcon } from './ui';
import type { Theme } from '../App';

type Item = { id: string; group: string; label: string; icon: React.ReactNode; run: () => void };

type Props = { open: boolean; onClose: () => void; theme: Theme; onToggleTheme: () => void };

export default function CommandPalette({ open, onClose, theme, onToggleTheme }: Props) {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = useMemo<Item[]>(() => {
    const go = (id: string) => () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    return [
      ...sections.map((s) => ({
        id: `nav-${s.id}`,
        group: 'Navigate',
        label: s.label,
        icon: <Hash className="h-4 w-4" />,
        run: go(s.id),
      })),
      {
        id: 'copy-email',
        group: 'Contact',
        label: copied ? 'Copied!' : 'Copy email address',
        icon: <Copy className="h-4 w-4" />,
        run: () => {
          navigator.clipboard?.writeText(profile.email).then(() => setCopied(true));
        },
      },
      { id: 'mail', group: 'Contact', label: 'Send an email', icon: <Mail className="h-4 w-4" />, run: () => window.open(`mailto:${profile.email}`) },
      { id: 'linkedin', group: 'Contact', label: 'Open LinkedIn', icon: <LinkedInIcon />, run: () => window.open(profile.linkedin, '_blank', 'noopener') },
      { id: 'github', group: 'Contact', label: 'Open GitHub', icon: <GitHubIcon />, run: () => window.open(profile.github, '_blank', 'noopener') },
      {
        id: 'theme',
        group: 'Preferences',
        label: `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`,
        icon: theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />,
        run: onToggleTheme,
      },
    ];
  }, [theme, onToggleTheme, copied]);

  const filtered = items.filter((i) => i.label.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => {
    if (open) {
      setQuery('');
      setIndex(0);
      setCopied(false);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => setIndex(0), [query]);

  const runItem = (item: Item) => {
    item.run();
    if (item.id !== 'copy-email') onClose();
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
    }
  };

  let lastGroup = '';
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-[14vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command menu"
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-line-strong bg-card-solid shadow-2xl"
            initial={{ y: -12, scale: 0.97 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search className="h-4 w-4 text-subtle" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search…"
                className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-subtle"
              />
              <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-subtle">ESC</kbd>
            </div>
            <ul className="max-h-80 overflow-y-auto p-2">
              {filtered.length === 0 && <li className="px-3 py-6 text-center text-sm text-subtle">No results</li>}
              {filtered.map((item, i) => {
                const header = item.group !== lastGroup ? item.group : null;
                lastGroup = item.group;
                return (
                  <li key={item.id}>
                    {header && <p className="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-widest text-subtle">{header}</p>}
                    <button
                      onMouseEnter={() => setIndex(i)}
                      onClick={() => runItem(item)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                        i === index ? 'bg-chip text-fg' : 'text-muted'
                      }`}
                    >
                      <span className="text-subtle">{item.icon}</span>
                      <span className="flex-1">{item.label}</span>
                      {i === index &&
                        (item.group === 'Navigate' ? <ArrowRight className="h-3.5 w-3.5" /> : <CornerDownLeft className="h-3.5 w-3.5" />)}
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
