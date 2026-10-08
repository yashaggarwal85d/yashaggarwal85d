import { LOOP } from './anim';
import { ScoreController } from './score';

/**
 * The soundtrack, in two flavours the reel can run on:
 *
 * - `score`: "Cold Brew", an original drift-phonk score synthesised live in the
 *   browser (score.ts), written hit-for-hit against the reel at 120 BPM.
 * - `crown`: Linkin Park's official audio of "Heavy Is the Crown", played
 *   through YouTube's embedded player (the audio is never hosted here). Its
 *   clock drives the reel: the song's 128 BPM grid replaces the reel's 120,
 *   starting at the first verse. YouTube requires the player to stay visible,
 *   so it sits in a 200 × 200 card (the smallest size YouTube allows).
 *
 * Tried earlier and dropped: "Dracula", "Judas", "Believer", "Harder Better
 * Faster Stronger" and others refuse playback on other sites (YouTube error
 * 150); "Lose My Mind" and "TORE UP" worked but didn't suit the reel.
 */

/** On for everyone once a track is chosen and its beat-drop time confirmed by ear. */
const LIVE = false;
const DEFAULT_TRACK = 'score';

type Track = {
  kind: 'youtube' | 'synth';
  /** YouTube video id (youtube tracks) */
  videoId: string;
  title: string;
  artist: string;
  source: string;
  url: string;
  bpm: number;
  /** seconds into the track where the reel's first beat lands; tune with [ and ] */
  firstBeat: number;
  /** length in seconds, used until the player reports its own */
  duration: number;
};

const TRACKS: Record<string, Track> = {
  score: {
    kind: 'synth',
    videoId: '',
    title: 'COLD BREW',
    artist: 'original score',
    source: 'synthesised live in your browser',
    url: 'https://github.com/yashaggarwal85d/yashaggarwal85d/blob/master/site/src/reel/score.ts',
    bpm: 120,
    firstBeat: 8,
    duration: Infinity,
  },
  crown: {
    kind: 'youtube',
    videoId: 'ZAt8oxY0GQo',
    title: 'Heavy Is the Crown',
    artist: 'Linkin Park',
    source: 'FROM ZERO',
    url: 'https://www.youtube.com/watch?v=ZAt8oxY0GQo',
    // Synced lyrics put one line per bar from 0:29.96 on, 1.87 s apart: 128 BPM (as SongBPM lists).
    bpm: 128,
    // The first verse line (22.35 s in synced lyrics).
    firstBeat: 22.35,
    duration: 168,
  },
};

const requested = new URLSearchParams(window.location.search).get('song');

/** `?song=score` or `?song=crown` previews a soundtrack before it goes live. */
export const SONG_ENABLED = LIVE || requested !== null;

export const SONG_ID = requested && TRACKS[requested] ? requested : DEFAULT_TRACK;
export const SONG = TRACKS[SONG_ID];

/** Reel seconds per song second. */
export const WARP = SONG.bpm / 120;

export type SongStatus =
  | 'idle' // nothing requested yet (reduced motion) or the viewer stopped it
  | 'loading' // fetching the YouTube API / creating the player
  | 'blocked' // autoplay refused; waiting for a click
  | 'playing'
  | 'paused'
  | 'buffering'
  | 'failed'; // API unreachable or embedding refused: the reel runs on its own

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
function loadYouTubeApi(timeoutMs = 9000) {
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

const OFFSET_KEY = `reel-song-offset:${SONG_ID}`;
const readOffset = () => {
  const fromUrl = Number(new URLSearchParams(window.location.search).get('offset'));
  if (Number.isFinite(fromUrl) && fromUrl > 0) return fromUrl;
  try {
    const v = Number(localStorage.getItem(OFFSET_KEY));
    if (Number.isFinite(v) && v > 0) return v;
  } catch {
    /* storage unavailable */
  }
  return SONG.firstBeat;
};

class SongController {
  status: SongStatus = 'idle';
  muted = true;
  offset = readOffset();
  /** completed passes through the song, for the loop counter */
  passes = 0;
  duration = SONG.duration;
  private player: YTPlayer | null = null;
  private anchorSong = 0;
  private anchorPerf = 0;
  private listeners = new Set<() => void>();
  private version = 0;
  private startTimer = 0;
  /** the viewer switched the music off; ignore the player's own state noise */
  private stopped = false;

  // ---- subscription (for useSyncExternalStore) ---------------------------
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };
  getVersion = () => this.version;
  private emit() {
    this.version++;
    this.listeners.forEach((fn) => fn());
  }
  private set(status: SongStatus) {
    if (this.status !== status) {
      this.status = status;
      this.emit();
    }
  }

  /** The song, rather than the reel's own timer, is driving the reel. */
  get engaged() {
    return this.status === 'playing' || this.status === 'paused' || this.status === 'buffering';
  }

  /** Smoothed song position in seconds. */
  now() {
    if (this.status !== 'playing') return this.anchorSong;
    return this.anchorSong + (performance.now() - this.anchorPerf) / 1000;
  }

  /** Absolute reel seconds (negative during the intro). */
  reelTime() {
    return (this.now() - this.offset) * WARP;
  }

  // ---- lifecycle ---------------------------------------------------------
  async mount(el: HTMLElement | null, opts: { autoplay: boolean }) {
    if (!el || this.player || this.status === 'loading') return;
    this.set('loading');
    let YT: YTNamespace;
    try {
      YT = await loadYouTubeApi();
    } catch {
      this.set('failed');
      return;
    }
    this.player = new YT.Player(el, {
      videoId: SONG.videoId,
      host: 'https://www.youtube-nocookie.com',
      width: '100%',
      height: '100%',
      playerVars: { autoplay: opts.autoplay ? 1 : 0, mute: 1, playsinline: 1, rel: 0, controls: 1, enablejsapi: 1 },
      events: {
        onReady: () => {
          const p = this.player!;
          this.duration = p.getDuration() || this.duration;
          p.mute();
          this.muted = true;
          if (opts.autoplay) {
            p.playVideo();
            // Muted autoplay can be refused, or the stream can stall: if the song
            // hasn't actually started in 6 s, let the reel run and offer a button.
            this.startTimer = window.setTimeout(() => {
              if (this.status !== 'playing') this.block();
            }, 6000);
          } else {
            this.set('blocked');
          }
          this.emit();
        },
        onStateChange: (e) => this.onState(e.data),
        onError: (e) => {
          // 2 bad id · 5 HTML5 player · 100 removed · 101/150 embedding refused
          console.warn(`[song] YouTube player error ${e.data}; the reel carries on without music`);
          window.clearTimeout(this.startTimer);
          this.set('failed');
        },
      },
    });
    // The controller lives as long as the page, so this interval is never cleared.
    window.setInterval(() => this.sync(), 200);
  }

  private onState(s: number) {
    const p = this.player;
    if (!p) return;
    if (this.stopped) return;
    if (s === 1) {
      window.clearTimeout(this.startTimer);
      this.anchorSong = p.getCurrentTime();
      this.anchorPerf = performance.now();
      this.duration = p.getDuration() || this.duration;
      this.set('playing');
    } else if (s === 2) {
      this.anchorSong = p.getCurrentTime();
      this.set('paused');
    } else if (s === 3) {
      this.anchorSong = p.getCurrentTime();
      this.set('buffering');
    } else if (s === 0) {
      // Loop from the drop so the reel keeps going without replaying the intro.
      this.passes += 1;
      p.seekTo(this.offset, true);
      p.playVideo();
    }
  }

  /** Keep the smoothed clock honest against the player's own position. */
  private sync() {
    const p = this.player;
    if (!p || this.status !== 'playing') return;
    const actual = p.getCurrentTime();
    const est = this.now();
    const drift = actual - est;
    if (Math.abs(drift) > 0.15) {
      this.anchorSong = actual;
      this.anchorPerf = performance.now();
    } else {
      this.anchorSong += drift * 0.15;
    }
    const muted = p.isMuted();
    if (muted !== this.muted) {
      this.muted = muted;
      this.emit();
    }
  }

  private block() {
    this.stopped = true;
    this.player?.pauseVideo();
    this.set('blocked');
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
  unmute() {
    const p = this.player;
    if (!p) return;
    p.unMute();
    p.setVolume(85);
    this.muted = false;
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
    this.anchorSong = t;
    this.anchorPerf = performance.now();
  }
  /** Jump to a reel moment within the current pass through the song. */
  seekReel(reelT: number) {
    const abs = Math.max(0, this.reelTime());
    let target = Math.floor(abs / LOOP) * LOOP + reelT;
    let t = this.offset + target / WARP;
    if (t > this.duration - 1) {
      target = reelT;
      t = this.offset + target / WARP;
    }
    this.seekSong(t);
    this.play();
  }
  skipIntro() {
    this.seekSong(this.offset);
    this.play();
  }
  restart() {
    this.passes += 1;
    this.seekSong(this.offset);
    this.play();
  }
  /** Start from the very top, intro included (after a block or a stop). */
  startOver() {
    this.seekSong(0);
    this.play();
  }
  /** Stop the music for good this visit; the reel carries on by itself. */
  stop() {
    this.stopped = true;
    this.player?.pauseVideo();
    this.set('idle');
  }
  nudge(delta: number) {
    this.offset = Math.max(0, Math.round((this.offset + delta) * 1000) / 1000);
    try {
      localStorage.setItem(OFFSET_KEY, String(this.offset));
    } catch {
      /* storage unavailable */
    }
    this.emit();
  }
  resetOffset() {
    this.offset = SONG.firstBeat;
    try {
      localStorage.removeItem(OFFSET_KEY);
    } catch {
      /* storage unavailable */
    }
    this.emit();
  }
}

export type Soundtrack = Pick<
  SongController,
  | 'status' | 'muted' | 'offset' | 'engaged' | 'subscribe' | 'getVersion' | 'now' | 'reelTime' | 'mount' | 'play' | 'pause' | 'toggle'
  | 'unmute' | 'toggleMute' | 'seekReel' | 'skipIntro' | 'restart' | 'startOver' | 'stop' | 'nudge' | 'resetOffset'
>;

export const score = SONG.kind === 'synth' ? new ScoreController() : null;
export const song: Soundtrack = score ?? new SongController();

/** Autoplay the (muted) song unless the viewer prefers calm or deep-linked a frame. */
export const shouldAutoplaySong = () =>
  SONG_ENABLED &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches && !new URLSearchParams(window.location.search).has('t');
