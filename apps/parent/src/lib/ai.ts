import { validateDrafts, type DraftQuestion } from '@atlas/knowledge';
import type { Extracted } from './extract';

/** Thrown when the AI's free tier asks us to slow down (try again in a moment). */
export class BusyError extends Error {}

export interface AiStatus {
  /** The app's server function answered (not available in local preview / static hosting). */
  reachable: boolean;
  ai: boolean;
  /** Which AI the server uses: Google Gemini (free tier), Claude, or OpenRouter. */
  provider: 'gemini' | 'claude' | 'openrouter' | null;
  model: string | null;
  /** OpenRouter steps in when the main AI fails. */
  backup: 'openrouter' | null;
  missing: string[];
}

export const providerName = (p: AiStatus['provider'] | undefined) => (p === 'claude' ? 'Claude' : p === 'openrouter' ? 'OpenRouter' : 'Gemini');

/** Is "Make questions with AI" set up on the server? */
export async function aiStatus(): Promise<AiStatus> {
  try {
    const res = await fetch('/api/generate', { headers: { accept: 'application/json' } });
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) return { reachable: false, ai: false, provider: null, model: null, backup: null, missing: [] };
    const body = (await res.json()) as { ai?: boolean; provider?: AiStatus['provider']; model?: string | null; backup?: 'openrouter' | null; missing?: string[] };
    return { reachable: true, ai: !!body.ai, provider: body.provider ?? null, model: body.model ?? null, backup: body.backup ?? null, missing: body.missing ?? [] };
  } catch {
    return { reachable: false, ai: false, provider: null, model: null, backup: null, missing: [] };
  }
}

/** Asks the server (and its AI, Gemini or Claude) for questions; results are validated again here. */
export async function generateWithAI(
  token: string,
  src: Extracted,
  opts: { unitTitle: string; focus: ('vocabulary' | 'grammar' | 'reading')[]; count: number; subject?: 'english' | 'literature' },
): Promise<{ drafts: DraftQuestion[]; dropped: number }> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify({ text: src.text || undefined, pdfBase64: src.pdfBase64, images: src.images, ...opts }),
  });
  const body = (await res.json().catch(() => ({}))) as { drafts?: unknown; dropped?: number; error?: string };
  if (res.status === 429 && !/daily|tomorrow/i.test(body.error ?? '')) throw new BusyError(body.error ?? 'Busy');
  if (!res.ok) throw new Error(body.error ?? `The server answered ${res.status}.`);
  const { drafts, dropped } = validateDrafts(body.drafts);
  return { drafts, dropped: (body.dropped ?? 0) + dropped.length };
}

/** Reads up to 6 scanned page images with the server's AI (Gemini): the text of each page. */
export async function transcribeWithAI(token: string, images: { mediaType: string; data: string }[]): Promise<string[]> {
  const res = await fetch('/api/transcribe', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify({ images }),
  });
  const body = (await res.json().catch(() => ({}))) as { pages?: unknown; error?: string };
  if (res.status === 429 && !/daily|tomorrow/i.test(body.error ?? '')) throw new BusyError(body.error ?? 'Busy');
  if (!res.ok) throw new Error(body.error ?? `The server answered ${res.status}.`);
  return Array.isArray(body.pages) ? body.pages.map((p) => (typeof p === 'string' ? p : '')) : [];
}

export interface Check {
  step: string;
  ok: boolean;
  detail: string;
}

/** Tests each link the AI features use, from the server (parent account only). */
export async function diagnoseAI(token: string): Promise<Check[]> {
  const res = await fetch('/api/diagnose', { method: 'POST', headers: { authorization: `Bearer ${token}` } });
  const body = (await res.json().catch(() => ({}))) as { checks?: Check[]; error?: string };
  if (!res.ok) throw new Error(body.error ?? `The server answered ${res.status}.`);
  return body.checks ?? [];
}

/** Reads a real exam paper (page images, plus the PDF's text layer if any) into structured questions. */
/** A NEW original IELTS Reading passage with questions, written by AI (same shape as an imported paper). */
export async function generateIeltsWithAI(token: string, generate: { topic: string; level: 3 | 4 | 5; types: string[] }): Promise<unknown> {
  const res = await fetch('/api/exam', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify({ kind: 'ielts-reading', images: [], generate }),
  });
  const body = (await res.json().catch(() => ({}))) as { exam?: unknown; error?: string };
  if (res.status === 429 && !/daily|tomorrow/i.test(body.error ?? '')) throw new BusyError(body.error ?? 'Busy');
  if (!res.ok) throw new Error(body.error ?? `The server answered ${res.status}.`);
  return body.exam;
}

export async function readExamWithAI(token: string, kind: 'hn10' | 'ielts-reading' | 'ielts-listening', images: { mediaType: string; data: string }[], text?: string): Promise<unknown> {
  const res = await fetch('/api/exam', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify({ kind, images, text }),
  });
  const body = (await res.json().catch(() => ({}))) as { exam?: unknown; error?: string };
  if (res.status === 429 && !/daily|tomorrow/i.test(body.error ?? '')) throw new BusyError(body.error ?? 'Busy');
  if (!res.ok) throw new Error(body.error ?? `The server answered ${res.status}.`);
  return body.exam;
}
