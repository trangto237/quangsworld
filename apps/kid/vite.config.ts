import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// The kid app is served at "/" and the parent app at "/parent/" on the same origin, so both
// share one encrypted local database. In dev, this server proxies /parent to the parent dev server.
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: { '/parent': { target: 'http://localhost:5174', ws: true } },
  },
  build: {
    target: 'es2022',
    // Phaser (~1.2 MB) is split into its own lazily-loaded chunk via dynamic import.
    chunkSizeWarningLimit: 1600,
  },
  optimizeDeps: { include: ['sql.js'] },
});
