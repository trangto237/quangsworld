import './polyfills';
import { PAGE_BREAK } from '@atlas/knowledge';
/**
 * Reading text out of uploaded textbook pages, in the browser. The PDF and DOCX readers are
 * downloaded only when such a file is opened, so the dashboard's first load stays small.
 */

export type MaterialKind = 'text' | 'pdf' | 'docx' | 'image';

export interface Extracted {
  name: string;
  kind: MaterialKind;
  size: number;
  /** Text found in the file ('' for photos and scanned PDFs). */
  text: string;
  /** The original file (kept encrypted on this device). */
  bytes?: Uint8Array;
  pages?: number;
  /** A PDF without a text layer (scanned pages): only AI can read it. */
  scanned?: boolean;
  /** For the AI path: the PDF or the photos, base64. */
  pdfBase64?: string;
  images?: { mediaType: string; data: string }[];
}

export const ACCEPT = '.txt,.md,.csv,.tsv,.docx,.pdf,image/jpeg,image/png,image/webp,image/gif';

export function toBase64(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

/** Text of a .docx: paragraphs from word/document.xml (tabs and line breaks kept). */
export async function docxText(bytes: Uint8Array): Promise<string> {
  const { unzipSync, strFromU8 } = await import('fflate');
  const files = unzipSync(bytes, { filter: (f) => f.name === 'word/document.xml' });
  const xml = files['word/document.xml'];
  if (!xml) throw new Error('This .docx has no document text.');
  const doc = new DOMParser().parseFromString(strFromU8(xml), 'application/xml');
  const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  const paragraphs: string[] = [];
  for (const p of Array.from(doc.getElementsByTagNameNS(W, 'p'))) {
    let line = '';
    const walk = (n: Element) => {
      for (const c of Array.from(n.children)) {
        if (c.namespaceURI === W && c.localName === 't') line += c.textContent ?? '';
        else if (c.namespaceURI === W && c.localName === 'tab') line += '\t';
        else if (c.namespaceURI === W && (c.localName === 'br' || c.localName === 'cr')) line += '\n';
        else walk(c);
      }
    };
    walk(p);
    paragraphs.push(line);
  }
  return paragraphs.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/** Text of a PDF with a text layer, one line per text line; `scanned` when there's almost no text. */
export async function pdfText(bytes: Uint8Array): Promise<{ text: string; pages: number; scanned: boolean }> {
  const pdfjs = await import('pdfjs-dist');
  const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  // pdf.js takes ownership of the buffer it's given: pass a copy.
  const pdf = await pdfjs.getDocument({ data: bytes.slice() }).promise;
  const pageTexts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const out: string[] = [];
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    let line = '';
    for (const item of content.items) {
      if (!('str' in item)) continue;
      line += item.str;
      if (item.hasEOL) {
        out.push(line);
        line = '';
      }
    }
    if (line) out.push(line);
    pageTexts.push(out.join('\n').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim());
  }
  // Pages stay separated (PAGE_BREAK) so a whole book can be split into units page by page.
  const text = pageTexts.join(PAGE_BREAK).trim();
  return { text, pages: pdf.numPages, scanned: text.replace(/\s/g, '').length < 80 * pdf.numPages };
}

const kindOf = (f: File): MaterialKind | null => {
  const n = f.name.toLowerCase();
  if (/\.(txt|md|csv|tsv)$/.test(n)) return 'text';
  if (n.endsWith('.pdf')) return 'pdf';
  if (n.endsWith('.docx')) return 'docx';
  if (/^image\/(jpeg|png|webp|gif)$/.test(f.type)) return 'image';
  return null;
};

/** Reads one uploaded file. Throws a friendly error for unsupported or unreadable files. */
export async function extractFile(file: File): Promise<Extracted> {
  const kind = kindOf(file);
  if (!kind) throw new Error(`${file.name}: this file type isn't supported. Use PDF, DOCX, TXT or photos (JPEG/PNG).`);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const base = { name: file.name, kind, size: file.size, bytes };
  if (kind === 'text') return { ...base, text: new TextDecoder().decode(bytes), bytes: undefined };
  if (kind === 'docx') return { ...base, text: await docxText(bytes) };
  if (kind === 'image') return { ...base, text: '', images: [await shrinkPhoto(file)] };
  const { text, pages, scanned } = await pdfText(bytes);
  return { ...base, text: scanned ? '' : text, pages, scanned, pdfBase64: scanned ? toBase64(bytes) : undefined };
}

/** Phone photos are large: scale the longest side to 1800 px and re-encode as JPEG (still sharp enough to read). */
async function shrinkPhoto(file: File): Promise<{ mediaType: string; data: string }> {
  const MAX = 1800;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, MAX / Math.max(bmp.width, bmp.height));
    if (scale === 1 && file.size < 1_500_000) return { mediaType: file.type, data: toBase64(new Uint8Array(await file.arrayBuffer())) };
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, 'image/jpeg', 0.85));
    if (!blob) throw new Error('encode failed');
    return { mediaType: 'image/jpeg', data: toBase64(new Uint8Array(await blob.arrayBuffer())) };
  } catch {
    return { mediaType: file.type, data: toBase64(new Uint8Array(await file.arrayBuffer())) };
  }
}

/** Several photos of pages become one source for the AI. */
export function mergePhotos(list: Extracted[]): Extracted {
  return {
    name: list.length === 1 ? list[0].name : `${list.length} photos`,
    kind: 'image',
    size: list.reduce((s, e) => s + e.size, 0),
    text: '',
    images: list.flatMap((e) => e.images ?? []),
  };
}
