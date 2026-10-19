import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Reading scanned pages (OCR) runs in the browser with tesseract.js. Its worker, engine and the
 * English + Vietnamese language data are served from this site (public/ocr), not a CDN, so it works
 * on school networks that block CDNs. They download only when a scan is read (~8 MB).
 */
function ocrAssets(): Plugin {
  const require = createRequire(import.meta.url);
  const out = join(import.meta.dirname, 'public', 'ocr');
  const pkg = (name: string) => dirname(require.resolve(`${name}/package.json`));
  const files: [string, string][] = [
    [join(pkg('tesseract.js'), 'dist', 'worker.min.js'), 'worker.min.js'],
    ...['tesseract-core-lstm.wasm.js', 'tesseract-core-simd-lstm.wasm.js', 'tesseract-core-relaxedsimd-lstm.wasm.js'].map(
      (f): [string, string] => [join(pkg('tesseract.js-core'), f), f],
    ),
    [join(pkg('@tesseract.js-data/eng'), '4.0.0_best_int', 'eng.traineddata.gz'), 'eng.traineddata.gz'],
    [join(pkg('@tesseract.js-data/vie'), '4.0.0_best_int', 'vie.traineddata.gz'), 'vie.traineddata.gz'],
  ];
  return {
    name: 'atlas-ocr-assets',
    buildStart() {
      mkdirSync(out, { recursive: true });
      for (const [from, to] of files) if (!existsSync(join(out, to))) copyFileSync(from, join(out, to));
    },
  };
}

export default defineConfig({
  base: '/parent/',
  plugins: [ocrAssets(), react(), tailwindcss()],
  server: { port: 5174, strictPort: true, hmr: { port: 5174, clientPort: 5174 } },
  build: { target: 'es2022' },
  optimizeDeps: { include: ['sql.js'] },
});
