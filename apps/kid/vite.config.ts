import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { execSync } from 'node:child_process';

/** Short version shown in the app, so we can tell which build a device runs. */
function appVersion() {
  let sha = process.env.CF_PAGES_COMMIT_SHA ?? '';
  if (!sha) {
    try {
      sha = execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    } catch {
      /* not a git checkout */
    }
  }
  const d = new Date();
  const day = `${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
  return sha ? `${sha.slice(0, 7)} · ${day}` : day;
}

// The kid app is served at "/" and the parent app at "/parent/" on the same origin, so both
// share one encrypted local database. In dev, this server proxies /parent to the parent dev server.
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  define: { __APP_VERSION__: JSON.stringify(appVersion()) },
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
