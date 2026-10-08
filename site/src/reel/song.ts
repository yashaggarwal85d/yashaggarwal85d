import { clamp01, mmss } from './anim';
import { sceneById, type Chapter } from './scenes';
import { ScoreController } from './score';
import { tr } from '../i18n';

/**
 * The soundtrack: Don Toliver's "TORE UP" (HARDSTONE PSYCHO), played through
 * YouTube's embedded player (the audio is never hosted here), with the reel cut
 * to it bar for bar. If YouTube can't play it for any reason, the reel falls
 * back to "Cold Brew", the original score synthesised in score.ts.
 *
 * The beat grid was measured, not guessed. The track is exactly 82 bars of
 * 155 BPM (126.97 s against Apple's 126.987 s). Apple's and Deezer's previews
 * start at 43.0 s and 48.0 s; in them the drums cut out on a downbeat and slam
 * back two bars later at 3.465 s, which puts the first downbeat at 0.013 s.
 * The synced lyrics land on the same grid:
 *
 *   bars  0–11  intro (beatless, then a soft bass)
 *   bars 12–19  verse 1: the drop (vocal pickup on beat 4 of bar 11)
 *   bars 20–27  hook: "tore up" every two beats
 *   bars 28–35  verse 2: two bars with the drums out, then back
 *   bars 36–47  bridge: drums gone, then a soft half-time bass from bar 40
 *   bars 48–63  verse 1 and the hook again
 *   bars 64–81  outro
 *
 * Playback starts at 6 s, a 12 s run-up to the drop. The reel runs from the
 * cold open (bar 11) to the spinning top (bar 68); at bar 69 the song jumps
 * back to bar 11 with it, so most of the outro never plays.
 */

/** `?song=score` previews the fallback score; `?song=off` turns music off. */
const requested = new URLSearchParams(window.location.search).get('song');
export const SONG_ENABLED = requested !== 'off';

export type TrackMeta = { kind: 'youtube' | 'synth'; title: string; artist: string; source: string; url: string; bpm: number };

export type SongStatus =
  | 'idle' // nothing requested yet (reduced motion) or the viewer stopped it
  | 'loading' // fetching the YouTube API / creating the player
  | 'blocked' // not autoplaying (reduced motion, a deep link): waiting for a click
  | 'playing'
  | 'paused'
  | 'buffering'
  | 'failed'; // couldn't play: the fallback takes over

/** Where the reel is, given the music. */
export type SongFrame = {
  /** reel time to render (the scene timeline, which runs past 48 s for song-only scenes) */
  reel: number;
  /** the music is in its run-up: hold the reel and show the intro card */
  intro: boolean;
  /** completed loops */
  pass: number;
  /** position in `chapters` units, for the player dock */
  dock: number;
  /** beat within the bar, 0–3 */
  beat: number;
  /** seconds and beats until the drop, and 0–1 through the run-up */
  toDrop: number;
  beatsToDrop: number;
  introProgress: number;
};

// ---------------------------------------------------------------------------
// TORE UP

export const TORE_UP: TrackMeta & { videoId: string } = {
  kind: 'youtube',
  videoId: 'jQGqtCalg9Y',
  title: 'TORE UP',
  artist: 'Don Toliver',
  source: 'HARDSTONE PSYCHO',
  url: 'https://www.youtube.com/watch?v=jQGqtCalg9Y',
  bpm: 155,
};
const SBAR = 240 / TORE_UP.bpm; // 1.548 s
const DOWNBEAT = 0.013;
const START = 6; // whole seconds: the IFrame API's `start` parameter
const DROP = 12;
const LOOP_FROM = 11; // the cold open
const LOOP_TO = 69; // after the spinning top (five bars into the outro)
const DURATION = 127;

/**
 * Song bars → reel scenes. At speed 1 one song bar is one reel bar (2 reel
 * seconds), so the reel's beat-synced motion rides the song's beat. Each
 * entry runs until the next one starts.
 */
type Seg = { bar: number; scene: string; from?: number; speed?: number };
const ARRANGEMENT: Seg[] = [
  { bar: 11, scene: 'cold-open' }, // the vocal pickup lands on its last beat
  { bar: 12, scene: 'name' }, // YASH: a letter per beat of the drop
  { bar: 14, scene: 'role' },
  { bar: 15, scene: 'journey' }, // five stops, one per bar
  { bar: 20, scene: 'tore-up' }, // the hook: a number ripped per "tore up"
  { bar: 28, scene: 'domain' }, // its title under the drum cut-out, stages as they slam back
  { bar: 36, scene: 'black-hole', speed: 0.5 }, // the bridge, time-dilated
  { bar: 40, scene: 'quantum' }, // the soft bass comes in
  { bar: 41, scene: 'maths' },
  { bar: 42, scene: 'navier' },
  { bar: 43, scene: 'cinema' }, // a frame per beat
  { bar: 46, scene: 'morning' }, // the alarm rings on bar 47's downbeat…
  { bar: 48, scene: 'built' }, // …and the drop is back to work
  { bar: 50, scene: 'pour' },
  { bar: 52, scene: 'toolbox' },
  { bar: 54, scene: 'grid' },
  { bar: 56, scene: 'shortlist' }, // hook 2: a tick per "tore up"
  { bar: 61, scene: 'cta' }, // the ask, held for seven bars
  { bar: 68, scene: 'loop' }, // return by death: back to bar 11
  { bar: LOOP_TO, scene: 'loop', from: 2 },
];
const segReel = (s: Seg, x: number) => sceneById(s.scene).start + (s.from ?? 0) + (x - s.bar) * 2 * (s.speed ?? 1);

const SONG_CHAPTERS: Chapter[] = [
  { id: 'journey', label: tr('Journey'), sub: tr('name · role · the journey'), start: 11, end: 20 },
  { id: 'numbers', label: tr('Numbers'), sub: tr('the numbers'), start: 20, end: 28 },
  { id: 'domain', label: tr('Domain'), sub: tr('supply chain & manufacturing'), start: 28, end: 36 },
  { id: 'off', label: tr('Off the clock'), sub: tr('physics · maths · cinema'), start: 36, end: 46 },
  { id: 'work', label: tr('Back to work'), sub: tr('what I build · the toolbox · the scale'), start: 46, end: 56 },
  { id: 'finale', label: tr('Finale'), sub: tr('why me · let’s build'), start: 56, end: 69 },
];

// ---------------------------------------------------------------------------
// YouTube plumbing

type YTPlayer = {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(s: number, allowSeekAhead: boolean): void;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  setVolume(v: number): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  destroy(): void;
};

type YTNamespace = {
  Player: new (
    el: HTMLElement,
    opts: {
      videoId: string;
      host?: string;
      width?: string | number;
      height?: string | number;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: () => void;
        onStateChange?: (e: { data: number }) => void;
        onError?: (e: { data: number }) => void;
      };
    },
  ) => YTPlayer;
};

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YTNamespace> | null = null;
function loadYouTubeApi(timeoutMs = 15000) {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  apiPromise ??= new Promise<YTNamespace>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error('YouTube API timed out')), timeoutMs);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      window.clearTimeout(timer);
      if (window.YT?.Player) resolve(window.YT);
      else reject(new Error('YouTube API missing'));
    };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.async = true;
    s.onerror = () => {
      window.clearTimeout(timer);
      reject(new Error('YouTube API failed to load'));
    };
    document.head.appendChild(s);
  });
  return apiPromise;
}

const NUDGE_KEY = 'reel-sync-nudge:tore-up';
const readNudge = () => {
  const fromUrl = Number(new URLSearchParams(window.location.search).get('nudge'));
  if (Number.isFinite(fromUrl) && fromUrl !== 0) return fromUrl;
  try {
    const v = Number(localStorage.getItem(NUDGE_KEY));
    if (Number.isFinite(v)) return v;
  } catch {
    /* storage unavailable */
  }
  return 0;
};

export class Emitter {
  private listeners = new Set<() => void>();
  private version = 0;
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };
  getVersion = () => this.version;
  protected emit() {
    this.version++;
    this.listeners.forEach((fn) => fn());
  }
}

class SongController extends Emitter {
  readonly meta = TORE_UP;
  readonly chapters = SONG_CHAPTERS;
  status: SongStatus = 'idle';
  muted = true;
  passes = 0;
  /** viewer's fine-tune of the grid, in seconds (+ = the reel later) */
  nudgeBy = readNudge();
  private player: YTPlayer | null = null;
  private anchorSong = START;
  private anchorPerf = 0;
  /** (song time − wall time) for each fresh position report; the largest is the least stale */
  private samples: { at: number; c: number }[] = [];
  private lastReported = -1;
  /** a report far from where we think we are, waiting for a second opinion */
  private jump: number | null = null;
  private startTimer = 0;
  /** the viewer switched the music off; ignore the player's own state noise */
  private stopped = false;

  private set(status: SongStatus) {
    if (this.status !== status) {
      this.status = status;
      this.emit();
    }
  }

  get engaged() {
    return this.status === 'playing' || this.status === 'paused' || this.status === 'buffering';
  }

  /** Song position in seconds. */
  now() {
    if (this.status !== 'playing') return this.anchorSong;
    return this.anchorSong + (performance.now() - this.anchorPerf) / 1000;
  }

  /** Position on the song's bar grid (bar 12 is the drop). */
  private bar() {
    return (this.now() - DOWNBEAT - this.nudgeBy) / SBAR;
  }

  frame(): SongFrame {
    const b = this.bar();
    const beat = Math.floor((((b % 1) + 1) % 1) * 4);
    if (b < DROP && (this.passes === 0 || b < LOOP_FROM)) {
      const startBar = (START - DOWNBEAT) / SBAR;
      return {
        reel: 0,
        intro: true,
        pass: this.passes,
        dock: DROP,
        beat,
        toDrop: (DROP - b) * SBAR,
        beatsToDrop: Math.ceil((DROP - b) * 4 - 1e-6),
        introProgress: clamp01((b - startBar) / (DROP - startBar)),
      };
    }
    const x = Math.min(b, LOOP_TO - 1e-3);
    let seg = ARRANGEMENT[0];
    for (const s of ARRANGEMENT) if (x >= s.bar) seg = s;
    return {
      reel: segReel(seg, x),
      intro: false,
      pass: this.passes,
      dock: x,
      beat,
      toDrop: 0,
      beatsToDrop: 0,
      introProgress: 1,
    };
  }

  clockText() {
    return `${mmss(this.now())} / ${mmss(DURATION)}`;
  }

  // ---- lifecycle ---------------------------------------------------------
  async mount(el: HTMLElement | null, opts: { autoplay: boolean }) {
    if (!el || this.player || this.status === 'loading') return;
    this.set('loading');
    let YT: YTNamespace;
    try {
      YT = await loadYouTubeApi();
    } catch {
      this.fail('the YouTube API did not load');
      return;
    }
    this.player = new YT.Player(el, {
      videoId: TORE_UP.videoId,
      host: 'https://www.youtube-nocookie.com',
      width: '100%',
      height: '100%',
      playerVars: { autoplay: opts.autoplay ? 1 : 0, mute: 1, start: START, playsinline: 1, rel: 0, controls: 1, enablejsapi: 1 },
      events: {
        onReady: () => {
          const p = this.player!;
          p.mute();
          this.muted = true;
          this.anchorSong = START;
          if (opts.autoplay) {
            p.playVideo();
            this.armStartTimer();
          } else {
            this.set('blocked');
          }
          this.emit();
        },
        onStateChange: (e) => this.onState(e.data),
        onError: (e) => this.fail(`YouTube player error ${e.data}`),
      },
    });
    // The controller lives as long as the page, so this interval is never cleared.
    window.setInterval(() => this.sync(), 40);
  }

  /**
   * Autoplay can be refused or the stream can stall. A cold start on a slow
   * connection can take several seconds, so allow as long as the run-up itself
   * before handing over to the fallback score, and only count time the tab is
   * visible (browsers hold media in background tabs until they're shown).
   */
  private armStartTimer() {
    window.clearTimeout(this.startTimer);
    if (document.hidden) {
      const onShow = () => {
        if (document.hidden) return;
        document.removeEventListener('visibilitychange', onShow);
        if (this.status !== 'playing' && !this.stopped) {
          this.player?.playVideo();
          this.armStartTimer();
        }
      };
      document.addEventListener('visibilitychange', onShow);
      return;
    }
    this.startTimer = window.setTimeout(() => {
      if (this.status === 'playing' || this.stopped) return;
      if (document.hidden) this.armStartTimer();
      else this.fail('it never started');
    }, 12000);
  }

  private fail(why: string) {
    console.warn(`[song] ${why}; switching to the fallback score`);
    window.clearTimeout(this.startTimer);
    this.stopped = true;
    try {
      this.player?.pauseVideo();
    } catch {
      /* player not ready */
    }
    this.set('failed');
  }

  private resetClock(at: number) {
    this.anchorSong = at;
    this.anchorPerf = performance.now();
    this.samples = [];
    this.lastReported = -1;
    this.jump = null;
  }

  private onState(s: number) {
    const p = this.player;
    if (!p || this.stopped) return;
    if (s === 1) {
      window.clearTimeout(this.startTimer);
      if (this.status !== 'playing') {
        // Right after a seek the API can still report the old position: trust
        // our own anchor unless the player is clearly somewhere else.
        const v = p.getCurrentTime();
        this.resetClock(Math.abs(v - this.anchorSong) < 1 ? v : this.anchorSong);
      }
      this.set('playing');
    } else if (s === 2) {
      this.anchorSong = this.now();
      this.set('paused');
    } else if (s === 3) {
      this.anchorSong = this.now();
      this.set('buffering');
    } else if (s === 0) {
      this.loopBack(0);
    }
  }

  /**
   * Keep the clock locked to the player. The IFrame API reports the position
   * in bursts, so most readings are a little stale; staleness only ever makes
   * a reading early, so the latest of the recent (position − wall time)
   * offsets is the truest.
   */
  private sync() {
    const p = this.player;
    if (!p || this.status !== 'playing') return;
    const v = p.getCurrentTime();
    const wall = performance.now() / 1000;
    if (v !== this.lastReported) {
      this.lastReported = v;
      const c = v - wall;
      if (Math.abs(v - this.now()) < 1) {
        this.samples.push({ at: wall, c });
        this.jump = null;
      } else if (this.jump !== null && Math.abs(c - this.jump) < 0.4) {
        // Two reports agree the player is elsewhere (scrubbed in its own controls): follow it.
        this.samples = [{ at: wall, c }];
        this.jump = null;
      } else {
        this.jump = c;
      }
    }
    while (this.samples.length > 1 && wall - this.samples[0].at > 3) this.samples.shift();
    if (this.samples.length) {
      let c = -Infinity;
      for (const s of this.samples) c = Math.max(c, s.c);
      const est = this.now();
      const target = wall + c;
      // Snap on a real jump, otherwise glide so the picture never stutters.
      this.anchorSong = Math.abs(target - est) > 0.25 ? target : est + (target - est) * 0.3;
      this.anchorPerf = wall * 1000;
    }
    if (this.bar() >= LOOP_TO - 0.01) this.loopBack(this.bar() - LOOP_TO);
    const muted = p.isMuted();
    if (muted !== this.muted) {
      this.muted = muted;
      this.emit();
    }
  }

  /** After the spinning top: back to the cold open, the reel and the song together. */
  private loopBack(overshootBars: number) {
    this.passes += 1;
    this.seekSong(DOWNBEAT + this.nudgeBy + (LOOP_FROM + Math.max(0, overshootBars)) * SBAR);
    this.player?.playVideo();
    this.emit();
  }

  // ---- controls ----------------------------------------------------------
  play(withSound = false) {
    const p = this.player;
    if (!p) return;
    this.stopped = false;
    if (withSound) this.unmute();
    p.playVideo();
  }
  pause() {
    this.player?.pauseVideo();
  }
  toggle() {
    if (this.status === 'playing' || this.status === 'buffering') this.pause();
    else this.play();
  }
  /** `rewind`: a first unmute just after the drop goes back to hear it. */
  unmute(rewind = false) {
    const p = this.player;
    if (!p) return;
    p.unMute();
    p.setVolume(90);
    this.muted = false;
    const b = this.bar();
    if (rewind && this.passes === 0 && b >= DROP && b < 20) this.seekSong(DOWNBEAT + this.nudgeBy + LOOP_FROM * SBAR);
    this.emit();
  }
  toggleMute() {
    const p = this.player;
    if (!p) return;
    if (this.muted) this.unmute();
    else {
      p.mute();
      this.muted = true;
      this.emit();
    }
  }
  private seekSong(t: number) {
    const p = this.player;
    if (!p) return;
    p.seekTo(t, true);
    this.resetClock(t);
  }
  /** Jump to a dock position (song bars 11–64). */
  seekDock(x: number) {
    const bar = Math.max(LOOP_FROM, Math.min(LOOP_TO - 0.01, x));
    this.seekSong(DOWNBEAT + this.nudgeBy + bar * SBAR - 0.02);
    this.play();
  }
  /** Jump to where a reel moment plays in the song. */
  seekReel(reelT: number) {
    for (let i = 0; i < ARRANGEMENT.length - 1; i++) {
      const s = ARRANGEMENT[i];
      const from = segReel(s, s.bar);
      const len = segReel(s, ARRANGEMENT[i + 1].bar) - from;
      if (reelT >= from && reelT < from + len) return this.seekDock(s.bar + (reelT - from) / (2 * (s.speed ?? 1)));
    }
    this.seekDock(DROP);
  }
  chapterIndex() {
    const x = this.frame().dock;
    let i = 0;
    SONG_CHAPTERS.forEach((c, k) => {
      if (x >= c.start) i = k;
    });
    return i;
  }
  stepChapter(dir: 1 | -1) {
    const n = SONG_CHAPTERS.length;
    const i = this.chapterIndex();
    const into = this.frame().dock - SONG_CHAPTERS[i].start;
    const to = dir === 1 ? i + 1 : into > 1 ? i : i - 1;
    this.seekDock(SONG_CHAPTERS[((to % n) + n) % n].start);
  }
  skipIntro() {
    this.seekDock(DROP);
  }
  /** Back to the top of the reel (the cold open), not the run-up. */
  restart() {
    this.passes += 1;
    this.seekSong(DOWNBEAT + this.nudgeBy + LOOP_FROM * SBAR);
    this.play();
  }
  startOver() {
    this.seekSong(START);
    this.play();
  }
  stop() {
    this.stopped = true;
    this.player?.pauseVideo();
    this.set('idle');
  }
  nudge(delta: number) {
    this.nudgeBy = Math.round((this.nudgeBy + delta) * 1000) / 1000;
    try {
      localStorage.setItem(NUDGE_KEY, String(this.nudgeBy));
    } catch {
      /* storage unavailable */
    }
    this.emit();
  }
  resetOffset() {
    this.nudgeBy = 0;
    try {
      localStorage.removeItem(NUDGE_KEY);
    } catch {
      /* storage unavailable */
    }
    this.emit();
  }
}

// ---------------------------------------------------------------------------
// The soundtrack the page talks to: TORE UP, or the score if that fails.

type Track = SongController | ScoreController;

class Soundtrack extends Emitter {
  active: Track;
  private yt: SongController | null = null;
  private autoplay = false;
  /** TORE UP couldn't play and the score took over */
  fellBack = false;

  constructor() {
    super();
    if (requested === 'score') this.active = this.makeScore();
    else {
      const yt = new SongController();
      yt.subscribe(() => {
        if (yt.status === 'failed' && this.active === yt) this.fallBack();
        this.emit();
      });
      this.yt = yt;
      this.active = yt;
    }
  }

  private makeScore() {
    const s = new ScoreController();
    s.subscribe(() => this.emit());
    return s;
  }

  private fallBack() {
    this.fellBack = true;
    this.active = this.makeScore();
    this.active.mount(null, { autoplay: this.autoplay });
  }

  /** The YouTube track, while it's still the one playing. */
  get youtube() {
    return this.active === this.yt ? this.yt : null;
  }
  get score() {
    return this.active instanceof ScoreController ? this.active : null;
  }
  get meta(): TrackMeta {
    return this.active.meta;
  }
  get status() {
    return this.active.status;
  }
  get muted() {
    return this.active.muted;
  }
  get engaged() {
    return this.active.engaged;
  }
  get chapters() {
    return this.active.chapters;
  }
  get nudgeBy() {
    return this.youtube?.nudgeBy ?? 0;
  }
  frame() {
    return this.active.frame();
  }
  clockText() {
    return this.active.clockText();
  }
  mount(el: HTMLElement | null, opts: { autoplay: boolean }) {
    this.autoplay = opts.autoplay;
    return this.active.mount(el, opts);
  }
  play(withSound = false) {
    this.active.play(withSound);
  }
  pause() {
    this.active.pause();
  }
  toggle() {
    this.active.toggle();
  }
  unmute(rewind = false) {
    this.active.unmute(rewind);
  }
  toggleMute() {
    this.active.toggleMute();
  }
  seekDock(x: number) {
    this.active.seekDock(x);
  }
  seekReel(reelT: number) {
    this.active.seekReel(reelT);
  }
  chapterIndex() {
    return this.active.chapterIndex();
  }
  stepChapter(dir: 1 | -1) {
    this.active.stepChapter(dir);
  }
  skipIntro() {
    this.active.skipIntro();
  }
  restart() {
    this.active.restart();
  }
  startOver() {
    this.active.startOver();
  }
  stop() {
    this.active.stop();
  }
  nudge(delta: number) {
    this.active.nudge(delta);
  }
  resetOffset() {
    this.active.resetOffset();
  }
}

export const song = new Soundtrack();
if (import.meta.env.DEV) (window as unknown as { __song: Soundtrack }).__song = song;

/** Autoplay the (muted) music unless the viewer prefers calm or deep-linked a frame. */
export const shouldAutoplaySong = () =>
  SONG_ENABLED &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches && !new URLSearchParams(window.location.search).has('t');
