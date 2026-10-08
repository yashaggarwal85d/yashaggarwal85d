import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Relative base so the build works on GitHub Pages under any repo path.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    // main.tsx awaits the visitor's language before importing the app
    target: 'es2022',
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: { manualChunks: { three: ['three'] } },
    },
  },
});
