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

/** Opens a PDF with pdf.js (loaded only when needed). */
export async function openPdf(bytes: Uint8Array) {
  const pdfjs = await import('pdfjs-dist');
  const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  return pdfjs.getDocument({ data: bytes.slice() }).promise;
}

/** One page as a JPEG for the AI reader (base64, no data: prefix). */
export async function pageJpeg(pdf: import('pdfjs-dist').PDFDocumentProxy, n: number, width = 1500): Promise<{ mediaType: 'image/jpeg'; data: string }> {
  const canvas = await renderPage(pdf, n, width);
  const data = canvas.toDataURL('image/jpeg', 0.82).split(',')[1];
  canvas.width = canvas.height = 0;
  return { mediaType: 'image/jpeg', data };
}

/** A photo (any format the browser can show) as a JPEG no wider than `width`, for the AI reader. */
export async function photoJpeg(src: string, width = 1600): Promise<{ mediaType: 'image/jpeg'; data: string }> {
  const img = new Image();
  img.src = src;
  await img.decode();
  const scale = Math.min(1, width / img.naturalWidth);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
  const data = canvas.toDataURL('image/jpeg', 0.82).split(',')[1];
  canvas.width = canvas.height = 0;
  return { mediaType: 'image/jpeg', data };
}

/**
 * Helps the on-device reader with textbook pages: grey, then stretch the contrast so text on tinted
 * boxes comes out dark on white.
 */
function clean(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!;
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = img.data;
  const hist = new Uint32Array(256);
  for (let i = 0; i < d.length; i += 4) {
    const g = (d[i] * 299 + d[i + 1] * 587 + d[i + 2] * 114) / 1000;
    d[i] = g;
    hist[g | 0]++;
  }
  // Ignore the darkest and lightest 2% when finding the range.
  const n = d.length / 4;
  let lo = 0;
  let hi = 255;
  for (let acc = 0; lo < 255 && (acc += hist[lo]) < n * 0.02; lo++);
  for (let acc = 0; hi > 0 && (acc += hist[hi]) < n * 0.02; hi--);
  const span = Math.max(1, hi - lo);
  for (let i = 0; i < d.length; i += 4) {
    const v = Math.max(0, Math.min(255, ((d[i] - lo) * 255) / span));
    d[i] = d[i + 1] = d[i + 2] = v;
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

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
  const pdf = await openPdf(bytes);
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
      // Higher resolution and stronger contrast read small textbook print much better.
      const canvas = clean(await renderPage(pdf, n, 2200));
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
