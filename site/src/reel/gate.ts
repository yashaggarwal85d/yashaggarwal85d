// The page stays on the intro until it has played through once. After that
// (and on every later visit) it scrolls freely. Deep links, reduced motion and
// a broken intro never lock anyone in.

const KEY = 'intro-seen';
const SAFETY_MS = 4 * 60_000; // whatever happens, nobody is held longer than this
const SCROLL_KEYS = new Set(['ArrowDown', 'PageDown', 'End']);

function startsLocked() {
  try {
    if (localStorage.getItem(KEY)) return false;
  } catch {
    /* storage unavailable: lock for this visit only */
  }
  const q = new URLSearchParams(window.location.search);
  if (q.has('t') || q.has('unlock')) return false;
  const hash = window.location.hash.slice(1);
  if (hash && hash !== 'reel') return false; // a link straight to a section
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

type Listener = () => void;
const listeners = new Set<Listener>();
const nudgers = new Set<Listener>();

export const gate = {
  locked: startsLocked(),
  subscribe(fn: Listener) {
    listeners.add(fn);
    return () => void listeners.delete(fn);
  },
  getLocked: () => gate.locked,
  /** someone tried to leave the intro: let the reel say why they can't yet */
  onNudge(fn: Listener) {
    nudgers.add(fn);
    return () => void nudgers.delete(fn);
  },
  nudge() {
    nudgers.forEach((fn) => fn());
  },
  unlock() {
    if (!gate.locked) return;
    gate.locked = false;
    try {
      localStorage.setItem(KEY, '1');
    } catch {
      /* fine: the next visit just plays it again */
    }
    release();
    listeners.forEach((fn) => fn());
  },
};

let release = () => {};

if (gate.locked) {
  const root = document.documentElement;
  root.style.overflow = 'hidden';
  root.style.overscrollBehavior = 'none';
  history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  const onWheel = (e: WheelEvent) => {
    if (e.deltaY > 0) gate.nudge();
  };
  let start = { x: 0, y: 0 };
  const onTouchStart = (e: TouchEvent) => (start = { x: e.touches[0]?.clientX ?? 0, y: e.touches[0]?.clientY ?? 0 });
  const onTouchMove = (e: TouchEvent) => {
    const p = e.touches[0];
    if (!p) return;
    const dy = start.y - p.clientY;
    // Upward swipes only: sideways ones still change chapters.
    if (dy > 0 && dy > Math.abs(p.clientX - start.x)) {
      e.preventDefault(); // iOS ignores overflow: hidden on the root
      if (dy > 40) gate.nudge();
    }
  };
  const onKey = (e: KeyboardEvent) => {
    const t = e.target as HTMLElement | null;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (SCROLL_KEYS.has(e.key)) {
      e.preventDefault();
      gate.nudge();
    }
  };
  // Links to sections, from the navbar or anywhere else.
  const onClick = (e: MouseEvent) => {
    const a = (e.target as HTMLElement | null)?.closest?.('a[href^="#"]');
    if (a && a.getAttribute('href') !== '#reel') {
      e.preventDefault();
      e.stopPropagation();
      gate.nudge();
    }
  };
  // Anything that still scrolls the page (scrollIntoView, find-in-page) is put back.
  const onScroll = () => {
    if (window.scrollY > 0) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      gate.nudge();
    }
  };

  window.addEventListener('wheel', onWheel, { passive: true });
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('keydown', onKey);
  window.addEventListener('click', onClick, true);
  window.addEventListener('scroll', onScroll, { passive: true });
  const safety = window.setTimeout(() => gate.unlock(), SAFETY_MS);

  release = () => {
    root.style.overflow = '';
    root.style.overscrollBehavior = '';
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('click', onClick, true);
    window.removeEventListener('scroll', onScroll);
    window.clearTimeout(safety);
  };
}
