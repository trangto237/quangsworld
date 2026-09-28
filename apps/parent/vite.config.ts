import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/parent/',
  plugins: [react(), tailwindcss()],
  server: { port: 5174, strictPort: true, hmr: { port: 5174, clientPort: 5174 } },
  build: { target: 'es2022' },
  optimizeDeps: { include: ['sql.js'] },
});
