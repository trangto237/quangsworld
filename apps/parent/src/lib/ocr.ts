import './polyfills';
/**
 * Reading scanned pages on this device (OCR) with tesseract.js — free, no AI key, nothing leaves the
 * device. English + Vietnamese. The engine and language data are served from /parent/ocr/ (see
 * vite.config.ts) and only downloaded the first time a scan is read.
 */

export interface OcrProgress {
  done: number;
  total: number;
}

export interface OcrResult {
  /** All pages' text, in order, separated by blank lines. */
  text: string;
  /** Each page's text (index 0 = page 1). */
  pages: string[];
}

import { PAGE_BREAK } from '@atlas/knowledge';

const base = () => `${import.meta.env.BASE_URL}ocr/`;

async function makeScheduler(workers: number) {
  const { createScheduler, createWorker, OEM } = await import('tesseract.js');
  const scheduler = createScheduler();
  const opts = { workerPath: `${base()}worker.min.js`, corePath: base(), langPath: base().replace(/\/$/, ''), workerBlobURL: false, gzip: true };
  const made = await Promise.all(Array.from({ length: workers }, () => createWorker(['eng', 'vie'], OEM.LSTM_ONLY, opts)));
  made.forEach((w) => scheduler.addWorker(w));
  return scheduler;
}

const workerCount = () => Math.max(1, Math.min(3, Math.floor((navigator.hardwareConcurrency || 2) / 2)));

/** Renders one PDF page to a canvas about `width` pixels wide (enough for small print). */
async function renderPage(pdf: import('pdfjs-dist').PDFDocumentProxy, n: number, width = 1700): Promise<HTMLCanvasElement> {
  const page = await pdf.getPage(n);
  const scale = width / page.getViewport({ scale: 1 }).width;
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);
  await page.render({ canvas, canvasContext: canvas.getContext('2d')!, viewport }).promise;
  page.cleanup();
  return canvas;
}

/** OCR every page of a scanned PDF. Pages are read in parallel; `signal` stops early. */
export async function ocrPdf(bytes: Uint8Array, onProgress: (p: OcrProgress) => void, signal?: AbortSignal): Promise<OcrResult> {
  const pdfjs = await import('pdfjs-dist');
  const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  const pdf = await pdfjs.getDocument({ data: bytes.slice() }).promise;
  const total = pdf.numPages;
  const scheduler = await makeScheduler(workerCount());
  const pages: string[] = new Array(total).fill('');
  let done = 0;
  onProgress({ done, total });
  try {
    // Render a few pages ahead of the OCR workers, never the whole book at once (memory).
    const queue: Promise<void>[] = [];
    for (let n = 1; n <= total; n++) {
      if (signal?.aborted) break;
      const canvas = await renderPage(pdf, n);
      queue.push(
        scheduler.addJob('recognize', canvas).then((r) => {
          pages[n - 1] = r.data.text;
          canvas.width = canvas.height = 0;
          onProgress({ done: ++done, total });
        }),
      );
      if (queue.length >= workerCount() * 2) await Promise.race(queue.map((p, i) => p.then(() => i))).then((i) => queue.splice(i, 1));
    }
    await Promise.all(queue);
  } finally {
    await scheduler.terminate();
    await pdf.cleanup();
  }
  if (signal?.aborted) throw new Error('Stopped.');
  return { text: pages.map((p) => p.trim()).join(PAGE_BREAK), pages };
}

/** OCR photos of pages (data URLs or blobs), in order. */
export async function ocrImages(images: (string | Blob)[], onProgress: (p: OcrProgress) => void, signal?: AbortSignal): Promise<OcrResult> {
  const scheduler = await makeScheduler(Math.min(workerCount(), images.length));
  let done = 0;
  onProgress({ done, total: images.length });
  try {
    const pages = await Promise.all(
      images.map(async (img) => {
        if (signal?.aborted) return '';
        const r = await scheduler.addJob('recognize', img);
        onProgress({ done: ++done, total: images.length });
        return r.data.text;
      }),
    );
    if (signal?.aborted) throw new Error('Stopped.');
    return { text: pages.map((p) => p.trim()).join(PAGE_BREAK), pages };
  } finally {
    await scheduler.terminate();
  }
}
