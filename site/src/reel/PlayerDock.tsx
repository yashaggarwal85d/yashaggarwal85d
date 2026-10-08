import { useEffect, useState } from 'react';
import { ArrowDown, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { CHAPTERS, chapterAt } from './scenes';
import { LOOP, mmss } from './anim';
import type { ReelState } from './Showreel';

type Props = {
  state: ReelState;
  beat: number;
  compact: boolean;
  /** the reel has scrolled away */
  hidden?: boolean;
  onToggle: () => void;
  onSeek: (time: number) => void;
  onSound: () => void;
  onExplore: () => void;
};

export default function PlayerDock({ state, beat, compact, hidden = false, onToggle, onSeek, onSound, onExplore }: Props) {
  const current = chapterAt(state.time);
  const [hint, setHint] = useState(true);
  useEffect(() => {
    const id = setTimeout(() => setHint(false), 9000);
    return () => clearTimeout(id);
  }, []);

  // Like a video player: the dock gets out of the way while the reel plays.
  const [awake, setAwake] = useState(true);
  const [hover, setHover] = useState(false);
  useEffect(() => {
    let id = 0;
    const wake = () => {
      setAwake(true);
      window.clearTimeout(id);
      id = window.setTimeout(() => setAwake(false), 2600);
    };
    wake();
    window.addEventListener('pointermove', wake, { passive: true });
    window.addEventListener('pointerdown', wake, { passive: true });
    window.addEventListener('keydown', wake);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener('pointermove', wake);
      window.removeEventListener('pointerdown', wake);
      window.removeEventListener('keydown', wake);
    };
  }, []);
  const shown = !hidden && (!state.playing || awake || hover);

  const segments = (
    <div className="flex gap-1.5">
      {CHAPTERS.map((c, i) => {
        const fill = Math.max(0, Math.min(1, (state.time - c.start) / (c.end - c.start)));
        return (
          <button
            key={c.id}
            className="group min-w-0 flex-1 py-2 text-left"
            style={{ flexGrow: c.end - c.start }}
            aria-label={`Jump to chapter ${i + 1}: ${c.label}`}
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              const f = (e.clientX - r.left) / r.width;
              onSeek(c.start + Math.max(0, Math.min(0.999, f)) * (c.end - c.start));
            }}
          >
            <span className="block h-1.5 overflow-hidden rounded-full bg-crema/20 transition-[height] group-hover:h-2.5">
              <span className="block h-full rounded-full bg-caramel" style={{ width: `${fill * 100}%` }} />
            </span>
            {!compact && (
              <span
                className={`mt-2 block truncate font-mono text-[10.5px] uppercase tracking-[0.14em] ${
                  i === current ? 'text-caramel' : 'text-latte/70 group-hover:text-crema'
                }`}
              >
                {i + 1}
                {c.end - c.start >= 8 || i === current ? ` · ${c.label}` : ''}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <div
      className="absolute inset-x-0 bottom-0 z-20 px-3 pb-3 transition-[opacity,transform] duration-500 sm:px-6 sm:pb-5"
      style={{ opacity: shown ? 1 : 0, transform: `translateY(${shown ? 0 : 24}px)`, pointerEvents: shown ? 'auto' : 'none' }}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocusCapture={() => setHover(true)}
      onBlurCapture={() => setHover(false)}
    >
      {!compact && (
        <p
          className="mx-auto mb-2 max-w-5xl text-right font-mono text-[11px] tracking-[0.12em] text-latte/70 transition-opacity duration-700"
          style={{ opacity: hint ? 1 : 0 }}
        >
          SPACE pause · ← → chapters · R return by death · M sound · move the mouse, the keys respond
        </p>
      )}
      <div
        className="mx-auto flex max-w-5xl items-center gap-3 rounded-2xl border border-crema/15 px-3 py-2 text-crema shadow-2xl backdrop-blur-xl sm:gap-5 sm:px-5 sm:py-3"
        style={{ background: 'rgba(23,16,12,.78)' }}
      >
        <button
          onClick={onToggle}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-crema text-espresso transition hover:scale-105 active:scale-95"
          aria-label={state.playing ? 'Pause showreel' : 'Play showreel'}
        >
          {state.playing ? <Pause className="h-5 w-5" fill="currentColor" /> : <Play className="ml-0.5 h-5 w-5" fill="currentColor" />}
        </button>

        <div className="min-w-0 flex-1">{segments}</div>

        {!compact && (
          <>
            <span className="shrink-0 font-mono text-sm tabular-nums text-latte">
              {mmss(state.time)} / {mmss(LOOP)}
            </span>
            <span className="flex shrink-0 gap-1" aria-hidden>
              {[0, 1, 2, 3].map((i) => (
                <i key={i} className="block h-2.5 w-2.5 rounded-full transition-colors" style={{ background: i === beat && state.playing ? '#b8612f' : 'rgba(233,217,191,.22)' }} />
              ))}
            </span>
            {state.loop > 0 && (
              <span className="shrink-0 font-mono text-xs text-caramel" title="Return by Death count">
                ↺ ×{state.loop + 1}
              </span>
            )}
          </>
        )}

        <button
          onClick={onSound}
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-crema/25 px-3 font-mono text-xs text-latte transition hover:text-crema"
          aria-pressed={state.sound}
          aria-label={state.sound ? 'Mute the beat' : 'Play a 120 BPM beat'}
        >
          {state.sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          {!compact && (state.sound ? 'ON' : 'OFF')}
        </button>

        <button
          onClick={onExplore}
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-cinnamon px-4 text-sm font-semibold text-foam transition hover:brightness-110"
        >
          Explore <ArrowDown className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
