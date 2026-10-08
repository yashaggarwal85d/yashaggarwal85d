import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { BEAT, LOOP, clamp01, lerp } from './anim';
import { CHAPTERS, SCENES, chapterAt, sceneAt } from './scenes';
import { BeatSynth } from './sound';
import type { KbDriver } from './kbDriver';
import type { Geo } from './types';
import PlayerDock from './PlayerDock';

export type ReelState = { time: number; loop: number; playing: boolean; sound: boolean };

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

export default function Showreel({ kb, controls, onExplore }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);

  // `?t=12.5` deep-links to a paused moment of the reel.
  const startAt = useMemo(() => {
    const raw = new URLSearchParams(window.location.search).get('t');
    const v = raw === null ? NaN : Number(raw);
    return Number.isFinite(v) && v >= 0 && v < LOOP ? v : null;
  }, []);
  const holdStill = reduceMotion || startAt !== null;

  const clock = useRef({
    time: startAt ?? (reduceMotion ? SCENES[1].start + SCENES[1].poster : 0),
    loop: 0,
    playing: !holdStill,
    userPaused: holdStill,
    autoPaused: false,
    inView: true,
  });
  const synth = useRef(new BeatSynth());
  const [frame, setFrame] = useState<ReelState>({ time: clock.current.time, loop: 0, playing: clock.current.playing, sound: false });
  const [size, setSize] = useState({ vw: window.innerWidth, vh: window.innerHeight });
  const [inView, setInView] = useState(true);

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
    setFrame((f) => ({ ...f, time: c.time, loop: c.loop, playing: c.playing }));
  }, []);

  // ---- controls -------------------------------------------------------
  const api = useMemo<ReelControls>(() => {
    const c = clock.current;
    const s = synth.current;
    return {
      play: () => {
        c.playing = true;
        c.userPaused = false;
        c.autoPaused = false;
        s.resync();
        publish();
      },
      pause: () => {
        c.playing = false;
        c.userPaused = true;
        publish();
      },
      toggle: () => (c.playing ? api.pause() : api.play()),
      seek: (time) => {
        c.time = ((time % LOOP) + LOOP) % LOOP;
        s.resync();
        publish();
      },
      chapter: (i) => {
        const n = CHAPTERS.length;
        api.seek(CHAPTERS[((i % n) + n) % n].start);
        api.play();
      },
      restart: () => {
        c.loop += 1;
        api.seek(0);
        api.play();
      },
      toggleSound: () => {
        if (s.enabled) s.disable();
        else s.enable();
        setFrame((f) => ({ ...f, sound: !f.sound }));
      },
      getState: () => ({ time: c.time, loop: c.loop, playing: c.playing, sound: s.enabled }),
    };
  }, [publish]);

  useEffect(() => {
    controls.current = api;
    return () => {
      controls.current = null;
    };
  }, [api, controls]);

  // ---- the master clock -------------------------------------------------
  useEffect(() => {
    let raf = 0;
    let prev = performance.now();
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const now = performance.now();
      const dt = Math.min(0.1, (now - prev) / 1000);
      prev = now;
      const c = clock.current;
      if (c.playing && !document.hidden) {
        c.time += dt;
        if (c.time >= LOOP) {
          c.time -= LOOP;
          c.loop += 1;
        }
        setFrame((f) => ({ ...f, time: c.time, loop: c.loop }));
      }
      synth.current.tick(c.loop * LOOP + c.time, c.playing && !document.hidden);

      // Keyboard choreography: the reel owns it at the top of the page, the
      // explore pages take over (oat palette, idle wave) as you scroll away.
      const d = kb.current;
      if (d) {
        const vh = window.innerHeight;
        const e = smooth(clamp01((window.scrollY - 0.35 * vh) / (0.5 * vh)));
        const scene = sceneAt(c.time);
        const f = scene.kb?.(c.time - scene.start, geoRef.current);
        d.visible = Math.max(f ? 1 - e : 0, e);
        d.light = e;
        d.idleWave = e > 0.5;
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
  }, [kb]);

  // ---- pause when scrolled away ------------------------------------------
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const c = clock.current;
        c.inView = entry.intersectionRatio >= 0.35;
        setInView(c.inView);
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

  // ---- shortcuts ---------------------------------------------------------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      const c = clock.current;
      const key = e.key.toLowerCase();
      if ((key === ' ' || key === 'k') && c.inView) {
        e.preventDefault();
        api.toggle();
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

  // ---- swipe between chapters on touch screens ----------------------------
  const touch = useRef<{ x: number; y: number } | null>(null);

  const scene = sceneAt(frame.time);
  const local = frame.time - scene.start;
  const Scene = scene.Component;
  const beat = Math.floor(frame.time / BEAT) % 4;

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
        if (!s) return;
        const dx = e.changedTouches[0].clientX - s.x;
        const dy = e.changedTouches[0].clientY - s.y;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) api.chapter(chapterAt(clock.current.time) + (dx < 0 ? 1 : -1));
      }}
    >
      <div className="absolute inset-0" aria-hidden>
        <Scene key={scene.id} t={local} time={frame.time} loop={frame.loop} W={W} H={H} portrait={portrait} fit={fit} />
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
      <PlayerDock
        state={frame}
        beat={beat}
        compact={size.vw < 768}
        hidden={!inView}
        onToggle={api.toggle}
        onSeek={(time) => {
          api.seek(time);
          api.play();
        }}
        onSound={api.toggleSound}
        onExplore={onExplore}
      />
    </section>
  );
}
