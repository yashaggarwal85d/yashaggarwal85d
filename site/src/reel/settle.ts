// Wait for the page to settle before the music starts its countdown: fonts
// loaded, shaders compiled, and a run of smooth frames. A slow phone that never
// gets there starts anyway after MAX_MS, so nobody waits forever.

const MAX_MS = 5000;
const SMOOTH_FRAMES = 12;
const SMOOTH_MS = 34;

let settled: Promise<void> | null = null;

export function whenSettled() {
  settled ??= new Promise<void>((resolve) => {
    const deadline = window.setTimeout(resolve, MAX_MS);
    const done = () => {
      window.clearTimeout(deadline);
      resolve();
    };
    const fonts = document.fonts?.ready ?? Promise.resolve();
    void fonts.then(() => {
      let run = 0;
      let prev = performance.now();
      const step = (now: number) => {
        // Hidden tabs don't animate: just start when shown.
        if (document.hidden) return done();
        run = now - prev < SMOOTH_MS ? run + 1 : 0;
        prev = now;
        if (run >= SMOOTH_FRAMES) done();
        else requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  });
  return settled;
}
