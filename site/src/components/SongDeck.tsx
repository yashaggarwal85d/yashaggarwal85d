import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ExternalLink, Music2, Play, SkipForward, Volume2, VolumeX, X } from 'lucide-react';
import { SONG, SONG_ENABLED, WARP, shouldAutoplaySong, song } from '../reel/song';

/**
 * The soundtrack's visible home. One YouTube player that never remounts:
 * big and centred over the reel during the vocal intro (with the unmute ask),
 * then a 200 × 200 card in the corner once the beat drops. YouTube's terms
 * require the player to stay visible, so stopping the music hides it.
 */
export default function SongDeck() {
  return SONG_ENABLED ? <SongDeckInner /> : null;
}

function SongDeckInner() {
  useSyncExternalStore(song.subscribe, song.getVersion);
  const hostRef = useRef<HTMLDivElement>(null);
  const [reelInView, setReelInView] = useState(true);
  const [, setTick] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [vw, setVw] = useState(window.innerWidth);

  useEffect(() => {
    if (hostRef.current) song.mount(hostRef.current, { autoplay: shouldAutoplaySong() });
  }, []);

  useEffect(() => {
    const el = document.getElementById('reel');
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setReelInView(e.intersectionRatio > 0.5), { threshold: [0, 0.5, 1] });
    io.observe(el);
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => {
      io.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // A light ticker for the countdown while the intro plays.
  const intro = song.engaged && song.reelTime() < 0;
  useEffect(() => {
    if (!intro) return;
    const id = window.setInterval(() => setTick((n) => n + 1), 100);
    return () => window.clearInterval(id);
  }, [intro]);

  // [ and ] nudge the beat alignment by 20 ms; \ resets it.
  useEffect(() => {
    let hide = 0;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.key === '[') song.nudge(-0.02);
      else if (e.key === ']') song.nudge(0.02);
      else if (e.key === '\\') song.resetOffset();
      else return;
      setToast(`beat sync · first beat at ${song.offset.toFixed(2)} s`);
      window.clearTimeout(hide);
      hide = window.setTimeout(() => setToast(null), 1800);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const status = song.status;
  const playing = status === 'playing' || status === 'buffering';
  const showPlayer = song.engaged || status === 'loading';
  const centred = (intro || status === 'loading') && reelInView;
  const toDrop = intro ? Math.max(0, -song.reelTime() / WARP) : 0;
  const introProgress = intro ? 1 - toDrop / song.offset : 0;

  // Player box: 16:9 and at least 200 px tall in the middle; a 200 × 200 card in the corner.
  const bigW = Math.max(356, Math.min(640, vw * 0.46));
  const box = centred
    ? { width: bigW, height: (bigW * 9) / 16, left: (vw - bigW) / 2, top: `calc(50vh - ${(bigW * 9) / 32}px - 20px)` }
    : { width: 200, height: 200, left: 16, top: `calc(100vh - 200px - ${reelInView ? (vw < 768 ? 150 : 170) : 72}px)` };

  return (
    <>
      {/* Intro overlay: title, countdown and the unmute ask, around the centred player. */}
      <AnimatePresence>
        {centred && (
          <motion.div
            key="intro"
            className="pointer-events-none fixed inset-0 z-30 flex flex-col items-center justify-center px-4 text-center text-crema"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.08, filter: 'blur(8px)' }}
            transition={{ duration: 0.45 }}
          >
            <div style={{ transform: `translateY(-${(bigW * 9) / 32 + 70}px)` }}>
              <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-caramel">♪ Now playing</p>
              <p className="mt-2 font-display text-3xl font-bold italic sm:text-4xl">Dracula</p>
              <p className="mt-1 font-mono text-xs text-latte">{SONG.artist} · JENNIE Remix</p>
            </div>
            <div className="pointer-events-auto" style={{ transform: `translateY(${(bigW * 9) / 32 + 64}px)` }}>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {song.muted ? (
                  <button
                    onClick={() => song.unmute()}
                    className="relative inline-flex items-center gap-2 rounded-full bg-cinnamon px-6 py-3 text-sm font-semibold text-foam shadow-2xl transition hover:brightness-110"
                  >
                    <span className="animate-ping-soft absolute inset-0 rounded-full bg-cinnamon/60" />
                    <Volume2 className="relative h-4 w-4" />
                    <span className="relative">Unmute for the full experience</span>
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full border border-crema/25 px-5 py-3 font-mono text-xs text-latte">
                    <Volume2 className="h-4 w-4 text-caramel" /> sound on, good choice
                  </span>
                )}
                <button
                  onClick={() => song.skipIntro()}
                  className="inline-flex items-center gap-1.5 rounded-full border border-crema/25 bg-espresso/60 px-4 py-3 text-sm text-latte backdrop-blur transition hover:text-crema"
                >
                  Skip intro <SkipForward className="h-4 w-4" />
                </button>
              </div>
              <div className="mx-auto mt-5 w-64">
                <div className="h-1 overflow-hidden rounded-full bg-crema/15">
                  <div className="h-full rounded-full bg-caramel" style={{ width: `${introProgress * 100}%` }} />
                </div>
                <p className="mt-2 font-mono text-[11px] tracking-[0.2em] text-latte/80">
                  {status === 'loading' ? 'CUEING THE TRACK…' : `THE BEAT DROPS IN ${Math.ceil(toDrop)}`}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The player itself. */}
      <div
        className="fixed z-30 overflow-hidden rounded-2xl border border-crema/15 bg-espresso shadow-2xl transition-all duration-700 ease-[cubic-bezier(.65,0,.35,1)]"
        style={{
          ...box,
          opacity: showPlayer ? 1 : 0,
          pointerEvents: showPlayer ? 'auto' : 'none',
          visibility: status === 'failed' || status === 'idle' || status === 'blocked' ? 'hidden' : 'visible',
        }}
        aria-label={`${SONG.title} by ${SONG.artist}, official video on YouTube`}
      >
        <div ref={hostRef} className="h-full w-full" />
      </div>

      {/* Corner caption under the card. */}
      {song.engaged && !centred && (
        <div
          className="fixed z-30 flex w-[200px] items-center gap-1.5 rounded-xl border border-crema/15 px-2.5 py-1.5 text-crema shadow-xl transition-all duration-700"
          style={{ left: 16, top: `calc(100vh - ${reelInView ? (vw < 768 ? 150 : 170) : 72}px + 6px)`, background: 'rgba(23,16,12,.9)' }}
        >
          <Music2 className={`h-3.5 w-3.5 shrink-0 text-caramel ${playing ? 'animate-pulse' : ''}`} />
          <a href={SONG.url} target="_blank" rel="noopener" className="min-w-0 flex-1 truncate font-mono text-[10.5px] text-latte hover:text-crema" title={`${SONG.title} · ${SONG.artist}`}>
            Dracula · Tame Impala ft. JENNIE
          </a>
          <button onClick={() => song.toggleMute()} className="text-latte hover:text-crema" aria-label={song.muted ? 'Unmute the song' : 'Mute the song'}>
            {song.muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>
          <button onClick={() => song.stop()} className="text-latte hover:text-crema" aria-label="Stop the music">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* When the song isn't playing: one button to bring it back. */}
      {(status === 'blocked' || status === 'idle') && (
        <div
          className="fixed z-30 inline-flex items-center gap-1 rounded-full border border-crema/20 p-1 text-crema shadow-xl backdrop-blur"
          style={{ left: 16, top: `calc(100vh - ${reelInView ? (vw < 768 ? 140 : 160) : 64}px)`, background: 'rgba(23,16,12,.85)' }}
        >
          <button
            onClick={() => {
              song.startOver();
              song.unmute();
            }}
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition hover:bg-crema/10"
          >
            <Play className="h-4 w-4 text-caramel" fill="currentColor" /> Play with Dracula
          </button>
          <a href={SONG.url} target="_blank" rel="noopener" aria-label="Open the song on YouTube" className="grid h-8 w-8 place-items-center rounded-full text-latte transition hover:text-crema">
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-full border border-crema/15 bg-espresso px-4 py-2 font-mono text-xs text-crema shadow-2xl"
            role="status"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
