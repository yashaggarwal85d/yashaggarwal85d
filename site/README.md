# Portfolio site

Source for [yashaggarwal85d.github.io/yashaggarwal85d](https://yashaggarwal85d.github.io/yashaggarwal85d/).

The landing page is a **48-second showreel at 120 BPM**: 15 scenes in five acts (Brew → Grind → Pour → Off the Clock → Serve), all live code with no video file. Below it, the full portfolio is laid out in a coffee-beige palette.

Built with React, TypeScript, Vite, Tailwind CSS v4, Motion, three.js and cobe.

```bash
cd site
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs to site/dist
```

Pushing to `master` deploys through `.github/workflows/deploy-portfolio.yml`.

## Editing content

- **Copy, numbers, films, Euler notes:** [`src/data.ts`](src/data.ts). The cinema-shelf takes are written in your voice; rewrite them freely.
- **Reel scenes:** [`src/reel/scenes/`](src/reel/scenes), one file per act. Each scene is a pure function of time, and [`scenes/index.ts`](src/reel/scenes/index.ts) holds the timeline.
- **Deep links:** `?t=12.5` opens the reel paused at that moment, which is handy for sharing a frame.

## Controls

| Key | Action |
|---|---|
| Space / K | Play or pause the reel |
| ← → | Previous / next chapter |
| 1–5 | Jump to a chapter |
| R | Return by Death (restart; the loop counter goes up) |
| M | Toggle the synthesised 120 BPM beat (off by default) |
| ⌘K / Ctrl K | Chapter select and actions |
| ↑↑↓↓←→←→BA | ☕ mode: keycaps become coffee beans |

On touch screens, swipe left or right on the reel to change chapter.

## How it works

- **Clock** (`src/reel/Showreel.tsx`): one master clock drives every scene, so the reel pauses, scrubs and loops frame-accurately at any frame rate. It auto-pauses when you scroll away.
- **Stage and camera** (`src/reel/Stage.tsx`): scenes are laid out on a virtual 1600×900 stage (900×1600 in portrait) and fitted to the screen. A camera layer handles punch-ins, zoom-throughs, whip-pans and dollies with transforms only.
- **Keyboard backdrop** (`src/components/KeyboardBackground.tsx`): a 12 × 20 three.js keycap grid that follows the cursor. The reel steers it through a shared driver (`src/reel/kbDriver.ts`): beat pumps, shock-waves, a focused key and launching every key. It only appears in frames 01, 02 and 14, then crossfades to the oat palette behind the portfolio. The technique is inspired by the hero of [yashahire.info](https://yashahire.info/).
- **Black hole** (`src/components/BlackHole.tsx`): a 2D-canvas accretion disk with a lensed halo and starlight bent around the hole. It is reused interactively in the Off the Clock section.
- **Beat** (`src/reel/sound.ts`): a tiny WebAudio drum machine scheduled ahead against the reel clock. It is opt-in.
- **Reduced motion:** with `prefers-reduced-motion`, the reel does not autoplay and opens on a still frame.

## Notes

- `package.json` pins `rollup` to 4.63.6 through `overrides`, because Rollup 4.64.x hangs while bundling `react-dom/client`. Remove the override once a fixed Rollup ships.
- Brand icons are vendored from [simple-icons](https://simpleicons.org/) (CC0) in `src/brandIcons.ts` to keep the bundle small.
- Section layouts follow [awrs.me](https://awrs.me/en); film references in the reel are original graphic homages, not stills or posters.
