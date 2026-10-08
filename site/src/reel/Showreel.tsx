import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type RefObject } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowDown, X } from 'lucide-react';
import { BEAT, LOOP, clamp01, lerp, mmss } from './anim';
import { CHAPTERS, SCENES, chapterAt, sceneAt } from './scenes';
import { BeatSynth } from './sound';
import { song, shouldAutoplaySong } from './song';
import type { KbDriver } from './kbDriver';
import type { Geo } from './types';
import PlayerDock from './PlayerDock';

export type ReelState = {
  time: number;
  loop: number;
  playing: boolean;
  sound: boolean;
  intro: boolean;
  /** with a soundtrack: position on its chapters, and the beat within the bar */
  dock?: number;
  beat?: number;
};

export type ReelControls = {
  toggle: () => void;
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  chapter: (i: number) => void;
  restart: () => void;
  toggleSound: () => void;
  getState: () => ReelState;
};

type Props = {
  kb: RefObject<KbDriver>;
  controls: RefObject<ReelControls | null>;
  onExplore: () => void;
};

const smooth = (v: number) => v * v * (3 - 2 * v);
const isTyping = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);

/** The song is still being fetched: hold the reel at the intro rather than start without it. */
const songPending = () => song.status === 'loading';

export default function Showreel({ kb, controls, onExplore }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  useSyncExternalStore(song.subscribe, song.getVersion);

  // `?t=12.5` deep-links to a paused moment of the reel.
  const startAt = useMemo(() => {
    const raw = new URLSearchParams(window.location.search).get('t');
    const v = raw === null ? NaN : Number(raw);
    return Number.isFinite(v) && v >= 0 && v < SCENES[SCENES.length - 1].start + SCENES[SCENES.length - 1].dur ? v : null;
  }, []);
  const holdStill = reduceMotion || startAt !== null;
  const waitForSong = useMemo(() => shouldAutoplaySong(), []);

  const clock = useRef({
    time: startAt ?? (reduceMotion ? SCENES[1].start + SCENES[1].poster : 0),
    loop: 0,
    playing: !holdStill,
    userPaused: holdStill,
    autoPaused: false,
    inView: true,
    intro: waitForSong,
    /** set by deliberate jumps so they are not mistaken for a loop */
    jumped: false,
    dock: 0,
    beat: 0,
  });
  const synth = useRef(new BeatSynth());
  const [frame, setFrame] = useState<ReelState>({
    time: clock.current.time,
    loop: 0,
    playing: clock.current.playing,
    sound: false,
    intro: clock.current.intro,
  });
  const [size, setSize] = useState({ vw: window.innerWidth, vh: window.innerHeight });
  const [inView, setInView] = useState(true);
  const [scrollHint, setScrollHint] = useState(false);
  const hinted = useRef(false);

  useLayoutEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ vw: el.clientWidth, vh: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const portrait = size.vw / size.vh < 0.85;
  const W = portrait ? 900 : 1600;
  const H = portrait ? 1600 : 900;
  const fit = Math.min(size.vw / W, size.vh / H);
  const geo: Geo = useMemo(
    () => ({
      W,
      H,
      portrait,
      toFrac: (x, y) => [(size.vw / 2 + (x - W / 2) * fit) / size.vw, (size.vh / 2 + (y - H / 2) * fit) / size.vh],
    }),
    [W, H, portrait, fit, size.vw, size.vh],
  );
  const geoRef = useRef(geo);
  geoRef.current = geo;

  const publish = useCallback(() => {
    const c = clock.current;
    setFrame((f) => ({ ...f, time: c.time, loop: c.loop, playing: c.playing, intro: c.intro }));
  }, []);

  // ---- controls: routed to the song when it is driving the reel -----------
  const api = useMemo<ReelControls>(() => {
    const c = clock.current;
    const s = synth.current;
    return {
      play: () => {
        if (song.engaged) return song.play();
        c.playing = true;
        c.userPaused = false;
        c.autoPaused = false;
        s.resync();
        publish();
      },
      pause: () => {
        if (song.engaged) return song.pause();
        c.playing = false;
        c.userPaused = true;
        publish();
      },
      toggle: () => {
        if (song.engaged) return song.toggle();
        if (c.playing) api.pause();
        else api.play();
      },
      seek: (time) => {
        c.jumped = true;
        const t = ((time % LOOP) + LOOP) % LOOP;
        if (song.engaged) return song.seekReel(t);
        c.time = t;
        s.resync();
        publish();
      },
      chapter: (i) => {
        const n = CHAPTERS.length;
        api.seek(CHAPTERS[((i % n) + n) % n].start);
        api.play();
      },
      restart: () => {
        c.jumped = true;
        if (song.engaged) return song.restart();
        c.loop += 1;
        api.seek(0);
        api.play();
      },
      toggleSound: () => {
        if (song.engaged) return song.toggleMute();
        if (s.enabled) s.disable();
        else s.enable();
        setFrame((f) => ({ ...f, sound: !f.sound }));
      },
      getState: () => ({
        time: c.time,
        loop: c.loop,
        playing: song.engaged ? song.status === 'playing' : c.playing,
        sound: song.engaged ? !song.muted : s.enabled,
        intro: c.intro,
      }),
    };
  }, [publish]);

  useEffect(() => {
    controls.current = api;
    return () => {
      controls.current = null;
    };
  }, [api, controls]);

  // ---- the master clock ----------------------------------------------------
  useEffect(() => {
    // After the first full loop, nudge the viewer to scroll (once).
    const showHint = () => {
      if (!hinted.current && window.scrollY < window.innerHeight * 0.4) {
        hinted.current = true;
        setScrollHint(true);
      }
    };
    let raf = 0;
    let prev = performance.now();
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const now = performance.now();
      const dt = Math.min(0.1, (now - prev) / 1000);
      prev = now;
      const c = clock.current;
      const before = c.time;

      if (song.engaged) {
        // The music is the clock: its arrangement says which reel moment plays on which beat.
        const f = song.frame();
        c.intro = f.intro;
        c.time = f.reel;
        c.dock = f.dock;
        c.beat = f.beat;
        c.playing = song.status === 'playing';
        if (f.pass > c.loop) showHint();
        c.loop = f.pass;
        c.jumped = false;
      } else if (waitForSong && songPending()) {
        c.intro = true;
      } else {
        if (c.intro) {
          // The song never arrived (blocked or failed): start the reel on its own.
          c.intro = false;
          c.time = 0;
        }
        if (c.playing && !document.hidden) {
          c.time += dt;
          if (c.time >= LOOP) c.time -= LOOP;
        }
      }

      // A natural wrap (not a jump) completes a loop.
      if (song.engaged) {
        /* the soundtrack counts its own loops */
      } else if (!c.intro && c.time < before - LOOP / 2) {
        if (c.jumped) c.jumped = false;
        else {
          c.loop += 1;
          showHint();
        }
      } else if (c.jumped && Math.abs(c.time - before) > 0.001 && c.time >= before) {
        c.jumped = false;
      }

      if (c.inView || song.engaged) {
        setFrame((f) =>
          f.time === c.time && f.loop === c.loop && f.playing === c.playing && f.intro === c.intro && f.dock === c.dock
            ? f
            : { ...f, time: c.time, loop: c.loop, playing: c.playing, intro: c.intro, dock: c.dock, beat: c.beat },
        );
      }
      synth.current.tick(c.loop * LOOP + c.time, c.playing && !document.hidden && !song.engaged);

      // Keyboard choreography: the reel owns it at the top of the page, the
      // explore pages take over (oat palette, idle wave) as you scroll away.
      const d = kb.current;
      if (d) {
        const vh = window.innerHeight;
        const e = smooth(clamp01((window.scrollY - 0.35 * vh) / (0.5 * vh)));
        const scene = sceneAt(c.time);
        const f = c.intro ? null : scene.kb?.(c.time - scene.start, geoRef.current);
        d.visible = Math.max(f || c.intro ? 1 - e : 0, e);
        d.light = e;
        d.idleWave = e > 0.5 || c.intro;
        d.socketFloor = lerp(0.05, 0.16, e);
        d.pump = f ? f.pump * (1 - e) : 0;
        d.shockR = f ? f.shockR : -1;
        d.shockAmp = f ? f.shockAmp * (1 - e) : 0;
        d.focus = f?.focus && e < 0.5 ? f.focus : null;
        d.all = f ? f.all * (1 - e) : 0;
      }
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [kb, waitForSong]);

  // ---- pause when scrolled away (the song keeps playing: it is the soundtrack) --
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const c = clock.current;
        c.inView = entry.intersectionRatio >= 0.35;
        setInView(c.inView);
        if (song.engaged) return;
        if (!c.inView && c.playing) {
          c.playing = false;
          c.autoPaused = true;
          publish();
        } else if (c.inView && c.autoPaused && !c.userPaused) {
          c.autoPaused = false;
          c.playing = true;
          synth.current.resync();
          publish();
        }
      },
      { threshold: [0, 0.35, 0.6, 1] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [publish]);

  // The scroll hint gets out of the way once you scroll, or after a while.
  useEffect(() => {
    if (!scrollHint) return;
    const id = window.setTimeout(() => setScrollHint(false), 9000);
    const onScroll = () => window.scrollY > 80 && setScrollHint(false);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.clearTimeout(id);
      window.removeEventListener('scroll', onScroll);
    };
  }, [scrollHint]);

  // ---- shortcuts -----------------------------------------------------------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      const c = clock.current;
      const key = e.key.toLowerCase();
      if ((key === ' ' || key === 'k') && c.inView) {
        e.preventDefault();
        api.toggle();
      } else if ((key === 'arrowright' || key === 'arrowleft') && c.inView && song.engaged) {
        song.stepChapter(key === 'arrowright' ? 1 : -1);
      } else if (key === 'arrowright' && c.inView) {
        api.chapter(chapterAt(c.time) + 1);
      } else if (key === 'arrowleft' && c.inView) {
        api.chapter(chapterAt(c.time) - (c.time - CHAPTERS[chapterAt(c.time)].start > 1 ? 0 : 1));
      } else if (key === 'r') {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
        api.restart();
      } else if (key === 'm') {
        api.toggleSound();
      } else if (/^[1-5]$/.test(key)) {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
        api.chapter(Number(key) - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [api]);

  // ---- swipe between chapters on touch screens --------------------------------
  const touch = useRef<{ x: number; y: number } | null>(null);

  const scene = sceneAt(frame.time);
  const local = frame.time - scene.start;
  const Scene = scene.Component;
  const beat = song.engaged ? (frame.beat ?? 0) : Math.floor(frame.time / BEAT) % 4;
  const dockState: ReelState = song.engaged
    ? { ...frame, playing: song.status === 'playing' || song.status === 'buffering', sound: !song.muted }
    : frame;

  return (
    <section
      id="reel"
      ref={sectionRef}
      aria-label="Showreel"
      className="relative z-10 h-[100svh] w-full select-none overflow-hidden"
      onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
      onTouchEnd={(e) => {
        const s = touch.current;
        touch.current = null;
        if (!s || clock.current.intro) return;
        const dx = e.changedTouches[0].clientX - s.x;
        const dy = e.changedTouches[0].clientY - s.y;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) {
          if (song.engaged) song.stepChapter(dx < 0 ? 1 : -1);
          else api.chapter(chapterAt(clock.current.time) + (dx < 0 ? 1 : -1));
        }
      }}
    >
      <div className="absolute inset-0" aria-hidden>
        {frame.intro ? (
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at center, rgba(23,16,12,.55) 0%, rgba(23,16,12,.25) 45%, rgba(0,0,0,.7) 100%)' }}
          />
        ) : (
          <Scene key={scene.id} t={local} time={frame.time} loop={frame.loop} W={W} H={H} portrait={portrait} fit={fit} />
        )}
        <div
          className="grain pointer-events-none absolute inset-0"
          style={{ opacity: 0.08, backgroundPosition: `${(frame.time * 977) % 160}px ${(frame.time * 613) % 160}px` }}
        />
      </div>
      <p className="sr-only">
        A 48-second animated showreel of Yash Aggarwal’s work as a Data Engineer at Texas Instruments: the supply-planning run cut
        from 18 hours to 45 minutes, a Rust ETL engine 3.8 times faster than Spark landing 16 TB a day, 136 site databases merged
        into one, and interests in astrophysics, quantum computing, maths and cinema. Scroll down to explore the full portfolio.
      </p>

      <AnimatePresence>
        {scrollHint && inView && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className="absolute inset-x-0 z-30 mx-auto flex w-max max-w-[calc(100vw-32px)] items-center gap-2 rounded-full border border-crema/20 py-1.5 pl-4 pr-1.5 text-crema shadow-2xl backdrop-blur-xl"
            style={{ bottom: size.vw < 768 ? 96 : 118, background: 'rgba(23,16,12,.86)' }}
            role="status"
          >
            <span className="text-sm">
              That’s the reel <span className="text-caramel">↺</span> it’ll keep looping.
            </span>
            <button
              onClick={() => {
                setScrollHint(false);
                onExplore();
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-cinnamon px-3.5 py-1.5 text-sm font-semibold text-foam transition hover:brightness-110"
            >
              Scroll to explore
              <motion.span animate={{ y: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 1 }}>
                <ArrowDown className="h-4 w-4" />
              </motion.span>
            </button>
            <button onClick={() => setScrollHint(false)} className="grid h-7 w-7 place-items-center rounded-full text-latte hover:text-crema" aria-label="Dismiss">
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <PlayerDock
        state={dockState}
        beat={beat}
        compact={size.vw < 768}
        hidden={!inView || frame.intro}
        songMode={song.engaged}
        songTitle={song.meta.title}
        chapters={song.engaged ? song.chapters : CHAPTERS}
        position={song.engaged ? (frame.dock ?? 0) : frame.time}
        clockText={song.engaged ? song.clockText() : `${mmss(frame.time)} / ${mmss(LOOP)}`}
        onToggle={api.toggle}
        onSeek={(time) => {
          if (song.engaged) return song.seekDock(time);
          api.seek(time);
          api.play();
        }}
        onSound={api.toggleSound}
        onExplore={onExplore}
      />
    </section>
  );
}
