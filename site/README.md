# Portfolio site

Source for [yashaggarwal85d.github.io/yashaggarwal85d](https://yashaggarwal85d.github.io/yashaggarwal85d/).

Built with React, TypeScript, Vite, Tailwind CSS v4, Motion, three.js and cobe.

```bash
cd site
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs to site/dist
```

All copy lives in [`src/data.ts`](src/data.ts). Edit that file to update the site.
Pushing to `master` deploys through `.github/workflows/deploy-portfolio.yml`.

## Notes

- **Keyboard backdrop** (`src/components/KeyboardBackground.tsx`): a 12 × 20 grid of keycaps on an orthographic camera. The cursor is raycast onto a ground plane, and keys rise with an asymmetric spring. The technique is inspired by the hero of [yashahire.info](https://yashahire.info/).
- **Section components** follow the layout language of [awrs.me](https://awrs.me/en): pill nav, ⌘K palette, marquee ribbons, bento about grid, timeline and sticky horizontal project rail.
- `package.json` pins `rollup` to 4.63.6 through `overrides`, because Rollup 4.64.x hangs while bundling `react-dom/client`. Remove the override once a fixed Rollup ships.
- Brand icons are vendored from [simple-icons](https://simpleicons.org/) (CC0) in `src/brandIcons.ts` to keep the bundle small.
