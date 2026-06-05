import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.',
  base: './',
  build: {
    outDir: '../dist/editor-v2',
    emptyOutDir: true,
  },
  server: {
    port: 5180,
    open: true,
  },
});
