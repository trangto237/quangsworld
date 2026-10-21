/**
 * OpenRouter (openrouter.ai): one key for many AI models. Used as a backup when Gemini fails (blocked
 * location, daily limit, retired model), or as the main AI when only OPENROUTER_API_KEY is set.
 *
 * - The model is picked automatically: OPENROUTER_MODEL if set; otherwise the newest Google Gemini Flash
 *   on OpenRouter (very good at reading pages, costs fractions of a cent per page, needs a few dollars of
 *   OpenRouter credit); if the account has no credit, a free model that can read images.
 * - OpenRouter's servers call the model, so the "User location is not supported" problem doesn't arise.
 */
import { validateDrafts, type DraftQuestion } from '../packages/knowledge/src/import-validate';
import { GenerateError, systemFor, taskFor } from './prompt';
import type { GenerateRequest } from './generate-core';

const BASE = 'https://openrouter.ai/api/v1';

interface OrModel {
  id: string;
  architecture?: { input_modalities?: string[] };
  pricing?: { prompt?: string; completion?: string };
  context_length?: number;
}

const readsImages = (m: OrModel) => m.architecture?.input_modalities?.includes('image') ?? false;
const isFree = (m: OrModel) => m.id.endsWith(':free') || (Number(m.pricing?.prompt ?? 1) === 0 && Number(m.pricing?.completion ?? 1) === 0);

/** Best paid pick: the newest stable google/gemini-X.Y-flash that reads images. */
export function pickPaid(models: OrModel[]): string | null {
  const flash = models
    .filter(readsImages)
    .map((m) => ({ id: m.id, v: m.id.match(/^google\/gemini-(\d+(?:\.\d+)?)-flash$/)?.[1] }))
    .filter((m): m is { id: string; v: string } => !!m.v)
    .sort((a, b) => Number(b.v) - Number(a.v));
  return flash[0]?.id ?? null;
}

/** Best free pick: a free model that reads images, preferring well-known vision families and long context. */
export function pickFree(models: OrModel[]): string | null {
  const rank = (id: string) => (/gemini/.test(id) ? 0 : /qwen.*vl|qwen3/.test(id) ? 1 : /gemma|llama.*(vision|4)/.test(id) ? 2 : 3);
  const free = models.filter((m) => readsImages(m) && isFree(m)).sort((a, b) => rank(a.id) - rank(b.id) || (b.context_length ?? 0) - (a.context_length ?? 0));
  return free[0]?.id ?? null;
}

let cache: { paid: string | null; free: string | null; at: number } | null = null;

async function catalogue(fetchFn: typeof fetch, refresh = false) {
  if (!refresh && cache && Date.now() - cache.at < 6 * 3600_000) return cache;
  let models: OrModel[] = [];
  try {
    const res = await fetchFn(`${BASE}/models`);
    if (res.ok) models = ((await res.json()) as { data?: OrModel[] }).data ?? [];
  } catch {
    /* use the fallbacks */
  }
  cache = { paid: pickPaid(models), free: pickFree(models), at: Date.now() };
  return cache;
}

/** For tests. */
export const forgetOpenRouterModels = () => (cache = null);

type Part = { type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } } | { type: 'file'; file: { filename: string; file_data: string } };

class NoCredit extends GenerateError {}

/** One chat call with a JSON-schema answer; returns the parsed JSON. */
async function chat(key: string, model: string, system: string, content: Part[], schema: Record<string, unknown>, fetchFn: typeof fetch): Promise<unknown> {
  let res: Response;
  try {
    res = await fetchFn(`${BASE}/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${key}`, 'x-title': 'Atlas learning app' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content },
        ],
        response_format: { type: 'json_schema', json_schema: { name: 'answer', strict: true, schema } },
        temperature: 0.2,
        max_tokens: 32000,
      }),
    });
  } catch {
    throw new GenerateError(502, "Couldn't reach OpenRouter. Try again in a moment.");
  }
  const body = (await res.json().catch(() => ({}))) as { error?: { message?: string; code?: number }; choices?: { finish_reason?: string; message?: { content?: string } }[] };
  if (!res.ok || body.error) {
    const status = res.ok ? (body.error?.code ?? 502) : res.status;
    const msg = body.error?.message ?? '';
    if (status === 401) throw new GenerateError(500, 'The OPENROUTER_API_KEY on the server is not valid.');
    if (status === 402) throw new NoCredit(402, 'The OpenRouter account has no credit for this model.');
    if (status === 404) throw new NoCredit(404, `OpenRouter model "${model}" is not available.`);
    if (status === 429)
      throw new GenerateError(
        429,
        /per.day|daily|free-models-per-day/i.test(msg)
          ? "OpenRouter's free daily limit is used up (free accounts get about 50 requests a day). Add a few dollars of credit at openrouter.ai → Credits, or try again tomorrow."
          : `OpenRouter is busy (${model}): ${msg || 'rate limited'} — try again in a minute.`,
      );
    throw new GenerateError(status >= 500 ? 502 : 400, `OpenRouter (${model}) could not do it: ${msg || `error ${status}`}`);
  }
  const choice = body.choices?.[0];
  if (choice?.finish_reason === 'length') throw new GenerateError(422, 'The answer was cut off. Try fewer pages or questions at a time.');
  const text = (choice?.message?.content ?? '').trim().replace(/^```(?:json)?\s*|\s*```$/g, '');
  try {
    return JSON.parse(text);
  } catch {
    throw new GenerateError(502, `OpenRouter (${model}) returned something that was not valid JSON. Try again.`);
  }
}

/** Runs `call` with OPENROUTER_MODEL, else the best paid model; with no credit (or a missing model), a free one. */
async function withModel<T>(configured: string | undefined, fetchFn: typeof fetch, call: (model: string) => Promise<T>): Promise<{ result: T; model: string }> {
  if (configured?.trim()) return { result: await call(configured.trim()), model: configured.trim() };
  const cat = await catalogue(fetchFn);
  const first = cat.paid ?? cat.free;
  if (!first) throw new GenerateError(502, 'No suitable model was found on OpenRouter.');
  try {
    return { result: await call(first), model: first };
  } catch (e) {
    if (!(e instanceof NoCredit)) throw e;
    const again = await catalogue(fetchFn, true);
    const free = again.free;
    if (!free || free === first) throw new GenerateError(402, 'OpenRouter needs a little credit (openrouter.ai → Credits) — no free model that reads pages is available right now.');
    return { result: await call(free), model: free };
  }
}

const QUESTIONS_JSON = {
  type: 'object',
  additionalProperties: false,
  required: ['questions'],
  properties: {
    questions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['type', 'part', 'prompt', 'options', 'answer', 'accept', 'explanation', 'explanation_vi', 'passage', 'difficulty'],
        properties: {
          type: { type: 'string', enum: ['mcq', 'order', 'input'] },
          part: { type: 'string', enum: ['vocabulary', 'grammar', 'reading', 'questions'] },
          prompt: { type: 'string' },
          options: { type: 'array', items: { type: 'string' } },
          answer: { type: 'integer' },
          accept: { type: 'array', items: { type: 'string' } },
          explanation: { type: 'string' },
          explanation_vi: { type: 'string' },
          passage: { type: ['string', 'null'] },
          difficulty: { type: 'integer' },
        },
      },
    },
  },
};

const PAGES_JSON = {
  type: 'object',
  additionalProperties: false,
  required: ['pages'],
  properties: { pages: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['text'], properties: { text: { type: 'string' } } } } },
};

/** Questions from the material, like the Gemini and Claude paths. */
export async function generateWithOpenRouter(
  key: string,
  configured: string | undefined,
  req: GenerateRequest & { count: number; focus: string[] },
  fetchFn: typeof fetch = fetch,
): Promise<{ drafts: DraftQuestion[]; dropped: number; model: string }> {
  const content: Part[] = [];
  if (req.pdfBase64) content.push({ type: 'file', file: { filename: 'pages.pdf', file_data: `data:application/pdf;base64,${req.pdfBase64}` } });
  for (const im of req.images ?? []) content.push({ type: 'image_url', image_url: { url: `data:${im.mediaType};base64,${im.data}` } });
  if (req.text) content.push({ type: 'text', text: `<material>\n${req.text}\n</material>` });
  content.push({ type: 'text', text: `${taskFor(req)}\nAnswer with JSON only: {"questions": [...]}.` });
  const { result, model } = await withModel(configured, fetchFn, (m) => chat(key, m, systemFor(req), content, QUESTIONS_JSON, fetchFn));
  const { drafts, dropped } = validateDrafts((result as { questions?: unknown }).questions, 80);
  return { drafts, dropped: dropped.length, model };
}

/** The text of each scanned page image. */
export async function transcribeWithOpenRouter(
  key: string,
  configured: string | undefined,
  system: string,
  images: { mediaType: string; data: string }[],
  fetchFn: typeof fetch = fetch,
): Promise<string[]> {
  const content: Part[] = [];
  images.forEach((im, i) => {
    content.push({ type: 'text', text: `Page ${i + 1}:` });
    content.push({ type: 'image_url', image_url: { url: `data:${im.mediaType};base64,${im.data}` } });
  });
  content.push({ type: 'text', text: `Transcribe these ${images.length} page(s). Answer with JSON only: {"pages": [{"text": "..."}]}, exactly ${images.length} item(s), in order.` });
  const { result } = await withModel(configured, fetchFn, (m) => chat(key, m, system, content, PAGES_JSON, fetchFn));
  const pages = ((result as { pages?: { text?: unknown }[] }).pages ?? []).map((p) => (typeof p?.text === 'string' ? p.text : ''));
  return images.map((_, i) => pages[i] ?? '');
}

/** A tiny real request through OpenRouter (the model the app would use), for the connection test. */
export async function pingOpenRouter(key: string, configured: string | undefined, fetchFn: typeof fetch = fetch): Promise<{ model: string; text: string }> {
  const { result, model } = await withModel(configured, fetchFn, (m) =>
    chat(key, m, 'Answer in JSON.', [{ type: 'text', text: 'Reply with {"text": "OK"}.' }], { type: 'object', additionalProperties: false, required: ['text'], properties: { text: { type: 'string' } } }, fetchFn),
  );
  return { model, text: String((result as { text?: unknown }).text ?? '') };
}

/** Any task with a JSON answer: a PDF and/or page images and/or text, then the task. For the exam import. */
export async function askOpenRouterJson(
  key: string,
  configured: string | undefined,
  system: string,
  material: { text?: string; pdfBase64?: string; images?: { mediaType: string; data: string }[] },
  task: string,
  schema: Record<string, unknown>,
  fetchFn: typeof fetch = fetch,
): Promise<{ result: unknown; model: string }> {
  const content: Part[] = [];
  if (material.pdfBase64) content.push({ type: 'file', file: { filename: 'paper.pdf', file_data: `data:application/pdf;base64,${material.pdfBase64}` } });
  (material.images ?? []).forEach((im, i) => {
    content.push({ type: 'text', text: `Page ${i + 1}:` });
    content.push({ type: 'image_url', image_url: { url: `data:${im.mediaType};base64,${im.data}` } });
  });
  if (material.text) content.push({ type: 'text', text: `<material>\n${material.text}\n</material>` });
  content.push({ type: 'text', text: `${task}\nAnswer with JSON only.` });
  return withModel(configured, fetchFn, (m) => chat(key, m, system, content, schema, fetchFn));
}
