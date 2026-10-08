import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ExternalLink, Music2, Play, SkipForward, Volume2, VolumeX, X } from 'lucide-react';
import { SONG_ENABLED, shouldAutoplaySong, song } from '../reel/song';
import ScoreCard from './ScoreCard';

/**
 * The soundtrack's visible home: a 200 × 200 card in the bottom-left corner.
 * For TORE UP it holds the YouTube player (which never remounts) at the
 * minimum size YouTube allows; for the fallback score, a live visualiser.
 * During the run-up the middle of the screen counts the beats to the drop.
 * YouTube's terms require the player to stay visible while it plays, so
 * stopping the music hides it.
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
  const toastTimer = useRef(0);
  const [vw, setVw] = useState(window.innerWidth);

  useEffect(() => {
    song.mount(hostRef.current, { autoplay: shouldAutoplaySong() });
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

  const showToast = (msg: string, ms = 1800) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), ms);
  };

  // Say so (once) if TORE UP couldn't play and the score took over.
  const fellBack = song.fellBack;
  useEffect(() => {
    if (fellBack) showToast('TORE UP wouldn’t load here, so the reel brewed its own score', 4200);
  }, [fellBack]);

  // A ticker for the countdown while the run-up plays.
  const f = song.frame();
  const intro = song.engaged && f.intro;
  useEffect(() => {
    if (!intro) return;
    const id = window.setInterval(() => setTick((n) => n + 1), 50);
    return () => window.clearInterval(id);
  }, [intro]);

  // [ and ] nudge the beat grid by 10 ms; \ resets it. (The score needs none.)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!song.youtube || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.key === '[') song.nudge(-0.01);
      else if (e.key === ']') song.nudge(0.01);
      else if (e.key === '\\') song.resetOffset();
      else return;
      const ms = Math.round(song.nudgeBy * 1000);
      showToast(`beat sync ${ms > 0 ? '+' : ''}${ms} ms`);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const yt = !!song.youtube;
  const meta = song.meta;
  const status = song.status;
  const playing = status === 'playing' || status === 'buffering';
  const showCard = song.engaged || status === 'loading';
  const introShown = (intro || status === 'loading') && reelInView;
  const askForSound = song.engaged && !f.intro && song.muted && reelInView;

  // The card sits above the reel's dock when it shows, lower during the run-up
  // (no dock yet) and near the bottom once the reel has scrolled away.
  const lift = !reelInView ? 72 : introShown ? 56 : vw < 768 ? 150 : 170;
  const cardTop = `calc(100vh - 200px - ${lift}px)`;
  const captionTop = `calc(100vh - ${lift}px + 6px)`;
  const countdown = f.beatsToDrop <= 4;

  return (
    <>
      {/* The run-up: title, the unmute ask and the beats to the drop. */}
      <AnimatePresence>
        {introShown && (
          <motion.div
            key="intro"
            className="pointer-events-none fixed inset-0 z-30 flex flex-col items-center justify-center px-4 text-center text-crema"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.12, filter: 'blur(10px)' }}
            transition={{ duration: 0.25 }}
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-caramel">♪ Now playing</p>
            <p className="mt-3 font-display text-5xl font-bold italic tracking-tight sm:text-7xl">{meta.title}</p>
            <p className="mt-2 font-mono text-xs text-latte">
              {meta.artist} · {meta.source}
            </p>
            <div className="pointer-events-auto mt-8 flex flex-wrap items-center justify-center gap-3">
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
              {status !== 'loading' && (
                <button
                  onClick={() => song.skipIntro()}
                  className="inline-flex items-center gap-1.5 rounded-full border border-crema/25 bg-espresso/60 px-4 py-3 text-sm text-latte backdrop-blur transition hover:text-crema"
                >
                  Skip <SkipForward className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="mx-auto mt-6 flex h-20 w-64 flex-col items-center">
              <div className="h-1 w-full overflow-hidden rounded-full bg-crema/15">
                <div className="h-full rounded-full bg-caramel" style={{ width: `${(status === 'loading' ? 0 : f.introProgress) * 100}%` }} />
              </div>
              {status === 'loading' ? (
                <p className="mt-2 font-mono text-[11px] tracking-[0.2em] text-latte/80">CUEING THE TRACK…</p>
              ) : countdown ? (
                <motion.p
                  key={f.beatsToDrop}
                  initial={{ scale: 1.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="mt-3 font-display text-5xl font-bold italic leading-none text-caramel"
                >
                  {f.beatsToDrop}
                </motion.p>
              ) : (
                <p className="mt-2 font-mono text-[11px] tracking-[0.2em] text-latte/80">THE BEAT DROPS IN {Math.ceil(f.toDrop)}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Muted once the reel is running: one tap for sound (and back to the drop). */}
      <AnimatePresence>
        {askForSound && (
          <motion.div
            key="sound"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed z-30"
            style={{ left: 16, top: `calc(${cardTop} - 48px)` }}
          >
            <button
              onClick={() => song.unmute(true)}
              className="relative inline-flex items-center gap-2 rounded-full bg-cinnamon px-4 py-2 text-sm font-semibold text-foam shadow-2xl transition hover:brightness-110"
            >
              <span className="animate-ping-soft absolute inset-0 rounded-full bg-cinnamon/50" />
              <Volume2 className="relative h-4 w-4" /> <span className="relative">Sound on: it’s cut to the beat</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The card: YouTube's player at its minimum size, or the score's visualiser. */}
      <div
        className="fixed z-30 overflow-hidden rounded-2xl border border-crema/15 bg-espresso shadow-2xl transition-[top,opacity] duration-700 ease-[cubic-bezier(.65,0,.35,1)]"
        style={{
          width: 200,
          height: 200,
          left: 16,
          top: cardTop,
          opacity: showCard ? 1 : 0,
          pointerEvents: showCard ? 'auto' : 'none',
          visibility: showCard ? 'visible' : 'hidden',
        }}
        aria-label={yt ? `${meta.title} by ${meta.artist}, official audio on YouTube` : `${meta.title}, an original score playing live`}
      >
        {/* The player's host stays mounted (hidden) after a fallback so React never fights YouTube over it. */}
        <div className="h-full w-full" style={{ display: yt ? 'block' : 'none' }}>
          <div ref={hostRef} className="h-full w-full" />
        </div>
        {song.score && <ScoreCard score={song.score} />}
      </div>

      {/* Caption under the card. */}
      {song.engaged && (
        <div
          className="fixed z-30 flex w-[200px] items-center gap-1.5 rounded-xl border border-crema/15 px-2.5 py-1.5 text-crema shadow-xl transition-[top] duration-700"
          style={{ left: 16, top: captionTop, background: 'rgba(23,16,12,.9)' }}
        >
          <Music2 className={`h-3.5 w-3.5 shrink-0 text-caramel ${playing ? 'animate-pulse' : ''}`} />
          <a href={meta.url} target="_blank" rel="noopener" className="min-w-0 flex-1 truncate font-mono text-[10.5px] text-latte hover:text-crema" title={`${meta.title} · ${meta.artist}`}>
            {meta.title} · {meta.artist}
          </a>
          <button onClick={() => song.toggleMute()} className="text-latte hover:text-crema" aria-label={song.muted ? 'Unmute the music' : 'Mute the music'}>
            {song.muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>
          <button onClick={() => song.stop()} className="text-latte hover:text-crema" aria-label="Stop the music">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* When the music isn't playing: one button to bring it back. */}
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
            <Play className="h-4 w-4 text-caramel" fill="currentColor" /> Play with {meta.title}
          </button>
          <a
            href={meta.url}
            target="_blank"
            rel="noopener"
            aria-label={yt ? 'Open the song on YouTube' : 'Read the score’s source'}
            className="grid h-8 w-8 place-items-center rounded-full text-latte transition hover:text-crema"
          >
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
            className="fixed left-1/2 top-32 z-50 max-w-[calc(100vw-32px)] -translate-x-1/2 rounded-full border border-crema/15 bg-espresso px-4 py-2 text-center font-mono text-xs text-crema shadow-2xl"
            role="status"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
