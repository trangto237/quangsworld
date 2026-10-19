import { validateDrafts, type DraftQuestion } from '@atlas/knowledge';
import type { Extracted } from './extract';

export interface AiStatus {
  /** The app's server function answered (not available in local preview / static hosting). */
  reachable: boolean;
  ai: boolean;
  missing: string[];
}

/** Is "Make questions with AI" set up on the server? */
export async function aiStatus(): Promise<AiStatus> {
  try {
    const res = await fetch('/api/generate', { headers: { accept: 'application/json' } });
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) return { reachable: false, ai: false, missing: [] };
    const body = (await res.json()) as { ai?: boolean; missing?: string[] };
    return { reachable: true, ai: !!body.ai, missing: body.missing ?? [] };
  } catch {
    return { reachable: false, ai: false, missing: [] };
  }
}

/** Asks the server (and Claude) for questions; results are validated again here. */
export async function generateWithAI(
  token: string,
  src: Extracted,
  opts: { unitTitle: string; focus: ('vocabulary' | 'grammar' | 'reading')[]; count: number },
): Promise<{ drafts: DraftQuestion[]; dropped: number }> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify({ text: src.text || undefined, pdfBase64: src.pdfBase64, images: src.images, ...opts }),
  });
  const body = (await res.json().catch(() => ({}))) as { drafts?: unknown; dropped?: number; error?: string };
  if (!res.ok) throw new Error(body.error ?? `The server answered ${res.status}.`);
  const { drafts, dropped } = validateDrafts(body.drafts);
  return { drafts, dropped: (body.dropped ?? 0) + dropped.length };
}
