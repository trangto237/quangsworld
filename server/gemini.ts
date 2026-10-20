/**
 * "Make questions from my textbook" with Google Gemini (free tier via Google AI Studio), over the REST API.
 *
 * - The key (Cloudflare secret GEMINI_API_KEY) goes in the `x-goog-api-key` header, never in the URL, so
 *   it can't end up in logs.
 * - The answer is constrained to a JSON schema, then validated item by item like the Claude path.
 */
import { validateDrafts, type DraftQuestion } from '../packages/knowledge/src/import-validate';
import { GenerateError, SYSTEM_PROMPT, taskText } from './prompt';
import type { GenerateRequest } from './generate-core';

/** Used only if the model list can't be fetched: Google's alias for its current Flash model. */
export const GEMINI_DEFAULT_MODEL = 'gemini-flash-latest';
const API = 'https://generativelanguage.googleapis.com/v1beta/models';
/** Gemini accepts about 20 MB of inline data per request; stay a little under. */
export const GEMINI_MAX_REQUEST = 19_000_000;
const MAX_ITEMS = 80;

/** The same shape as QUESTIONS_SCHEMA, in the OpenAPI subset Gemini's responseSchema understands. */
export const GEMINI_SCHEMA = {
  type: 'OBJECT',
  required: ['questions'],
  properties: {
    questions: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        required: ['type', 'part', 'prompt', 'options', 'answer', 'accept', 'explanation', 'explanation_vi', 'passage', 'difficulty'],
        propertyOrdering: ['type', 'part', 'prompt', 'options', 'answer', 'accept', 'explanation', 'explanation_vi', 'passage', 'difficulty'],
        properties: {
          type: { type: 'STRING', enum: ['mcq', 'order', 'input'] },
          part: { type: 'STRING', enum: ['vocabulary', 'grammar', 'reading', 'questions'] },
          prompt: { type: 'STRING' },
          options: { type: 'ARRAY', items: { type: 'STRING' } },
          answer: { type: 'INTEGER' },
          accept: { type: 'ARRAY', items: { type: 'STRING' } },
          explanation: { type: 'STRING' },
          explanation_vi: { type: 'STRING' },
          passage: { type: 'STRING', nullable: true },
          difficulty: { type: 'INTEGER' },
        },
      },
    },
  },
} as const;

type Req = GenerateRequest & { count: number; focus: string[] };

/** The chosen Gemini model no longer exists (Google retires model names over time). */
export class ModelMissing extends GenerateError {
  constructor(readonly model: string) {
    super(500, `The Gemini model "${model}" is not available.`);
  }
}

/**
 * The newest stable "gemini-X.Y-flash" model this key can use for generateContent (no previews, lite,
 * image, audio or live variants), or Google's "gemini-flash-latest" alias, or null.
 */
export function pickFlash(models: { name?: string; supportedGenerationMethods?: string[] }[]): string | null {
  const usable = models.filter((m) => m.supportedGenerationMethods?.includes('generateContent')).map((m) => (m.name ?? '').replace(/^models\//, ''));
  const versioned = usable
    .map((name) => ({ name, v: name.match(/^gemini-(\d+(?:\.\d+)?)-flash$/)?.[1] }))
    .filter((m): m is { name: string; v: string } => !!m.v)
    .sort((a, b) => Number(b.v) - Number(a.v));
  if (versioned.length) return versioned[0].name;
  if (usable.includes('gemini-flash-latest')) return 'gemini-flash-latest';
  return usable.find((n) => /^gemini-[\d.]+-flash(-\d+)?$/.test(n)) ?? null;
}

let chosen: { model: string; at: number } | null = null;
const KEEP_MS = 6 * 3600_000;

/** GEMINI_MODEL if set; otherwise the newest Flash model for this key (asked once every few hours). */
export async function chooseGeminiModel(apiKey: string, configured: string | undefined, fetchFn: typeof fetch = fetch, refresh = false): Promise<string> {
  if (configured?.trim()) return configured.trim();
  if (!refresh && chosen && Date.now() - chosen.at < KEEP_MS) return chosen.model;
  let model = GEMINI_DEFAULT_MODEL;
  try {
    const res = await fetchFn(`${API}?pageSize=1000`, { headers: { 'x-goog-api-key': apiKey } });
    if (res.ok) model = pickFlash(((await res.json()) as { models?: { name?: string; supportedGenerationMethods?: string[] }[] }).models ?? []) ?? model;
  } catch {
    /* fall back to the alias */
  }
  chosen = { model, at: Date.now() };
  return model;
}

/** Runs `call` with the chosen model; if that model has gone, picks again once and retries. */
export async function withGeminiModel<T>(apiKey: string, configured: string | undefined, fetchFn: typeof fetch, call: (model: string) => Promise<T>): Promise<T> {
  const model = await chooseGeminiModel(apiKey, configured, fetchFn);
  try {
    return await call(model);
  } catch (e) {
    if (!(e instanceof ModelMissing)) throw e;
    if (configured?.trim()) throw new GenerateError(500, `The Gemini model "${model}" set in GEMINI_MODEL is not available any more. Remove GEMINI_MODEL in Cloudflare to pick the newest model automatically.`);
    const again = await chooseGeminiModel(apiKey, undefined, fetchFn, true);
    if (again === model) throw new GenerateError(500, `No Gemini Flash model is available for this API key right now (tried "${model}").`);
    return call(again);
  }
}

/** For tests. */
export const forgetChosenModel = () => {
  chosen = null;
  viaRelay = false;
};

// ── Region relay ──────────────────────────────────────────────────

/** Remembered once Google has refused this server's location, so later calls go straight to the relay. */
let viaRelay = false;
const LOCATION = /location is not supported/i;

export interface RelayEnv {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  /** Supabase region the relay runs in (one Gemini serves). Default us-east-1. */
  GEMINI_RELAY_REGION?: string;
  /** The project's publishable key (sb_publishable_…): Edge Functions may accept only new-style keys. */
  SUPABASE_PUBLISHABLE_KEY?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
}

export const RELAY_HELP =
  "Google's Gemini doesn't accept requests from where Cloudflare runs this app's server. One-time fix: in the Supabase dashboard → Edge Functions → Deploy a new function → Via editor, name it gemini-relay and paste supabase/functions/gemini-relay/index.ts from the app's code, then Deploy. Then try again.";

export const RELAY_KEY_HELP =
  'Your Supabase project only lets Edge Functions be called with its new publishable key. Fix: Supabase dashboard → Project Settings → API Keys → copy the Publishable key (starts with sb_publishable_), then Cloudflare Pages → Settings → Variables and Secrets → add SUPABASE_PUBLISHABLE_KEY with that value, and redeploy.';

/** The key to call the relay with: the publishable key if given, else the anon key. */
export const relayKey = (env: RelayEnv) => env.SUPABASE_PUBLISHABLE_KEY?.trim() || env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() || env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

/** Headers for a relay call: the Supabase key (Bearer only for legacy JWT keys) and the region. */
export function relayHeaders(env: RelayEnv, base?: HeadersInit, withKey = true): Headers {
  const headers = new Headers(base);
  headers.set('x-region', env.GEMINI_RELAY_REGION?.trim() || 'us-east-1');
  const key = withKey ? relayKey(env) : undefined;
  if (key) {
    headers.set('apikey', key);
    if (key.startsWith('eyJ')) headers.set('authorization', `Bearer ${key}`);
  }
  return headers;
}

export const RELAY_JWT_HELP =
  'The gemini-relay function on Supabase refused the request (401). Fix: Supabase dashboard → Edge Functions → gemini-relay → Settings (Details) → turn OFF "Verify JWT" (also called "Enforce JWT verification"), save, and try again. It is safe: the relay only works for whoever already holds your Gemini key.';

/**
 * A fetch for Gemini calls: straight to Google, but if Google refuses this server's location, through the
 * `gemini-relay` Supabase Edge Function pinned to a region Gemini serves. Other URLs pass through untouched.
 */
export function geminiFetch(env: RelayEnv, fetchFn: typeof fetch): typeof fetch {
  const sbUrl = (env.SUPABASE_URL ?? env.VITE_SUPABASE_URL)?.replace(/\/$/, '');
  const root = 'https://generativelanguage.googleapis.com/v1beta/';
  const relay = async (url: string, init?: RequestInit) => {
    const region = env.GEMINI_RELAY_REGION?.trim() || 'us-east-1';
    const target = `${sbUrl}/functions/v1/gemini-relay?forceFunctionRegion=${encodeURIComponent(region)}&path=${encodeURIComponent(url.slice(root.length))}`;
    let res = await fetchFn(target, { ...init, headers: relayHeaders(env, init?.headers) });
    let text = res.status === 401 || res.status === 404 ? await res.clone().text() : '';
    if (res.status === 401 && /INVALID_API_KEY|matched no key/i.test(text)) {
      // The project accepts only new-style keys for functions: try once without a key (works when the
      // function doesn't ask for one), else explain how to add the publishable key.
      res = await fetchFn(target, { ...init, headers: relayHeaders(env, init?.headers, false) });
      text = res.status === 401 || res.status === 404 ? await res.clone().text() : '';
      if (res.status === 401) return new Response(JSON.stringify({ error: { message: RELAY_KEY_HELP } }), { status: 400 });
    }
    if (res.status === 404 && !text.includes('"error"')) {
      // The relay hasn't been deployed yet.
      return new Response(JSON.stringify({ error: { message: RELAY_HELP } }), { status: 400 });
    }
    if (res.status === 401 && !text.includes('x-goog-api-key')) {
      // Supabase's "Verify JWT" check refused us.
      return new Response(JSON.stringify({ error: { message: RELAY_JWT_HELP } }), { status: 400 });
    }
    return res;
  };
  return (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input instanceof Request ? input.url : input);
    if (!url.startsWith(root) || !sbUrl) return fetchFn(input, init);
    if (viaRelay) return relay(url, init);
    const res = await fetchFn(input, init);
    if (res.status !== 400 && res.status !== 403) return res;
    const text = await res.clone().text();
    if (!LOCATION.test(text)) return res;
    viaRelay = true;
    return relay(url, init);
  }) as typeof fetch;
}

/** The generateContent request body: material (PDF / photos / text) first, then the task. */
export function buildGeminiBody(req: Req) {
  const parts: Record<string, unknown>[] = [];
  if (req.pdfBase64) parts.push({ inlineData: { mimeType: 'application/pdf', data: req.pdfBase64 } });
  for (const im of req.images ?? []) parts.push({ inlineData: { mimeType: im.mediaType, data: im.data } });
  if (req.text) parts.push({ text: `<material>\n${req.text}\n</material>` });
  parts.push({ text: taskText(req) });
  return {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: 'user', parts }],
    generationConfig: { responseMimeType: 'application/json', responseSchema: GEMINI_SCHEMA, temperature: 0.4, maxOutputTokens: 32768 },
  };
}

interface GeminiReply {
  promptFeedback?: { blockReason?: string };
  candidates?: { finishReason?: string; content?: { parts?: { text?: string; thought?: boolean }[] } }[];
  error?: { message?: string; status?: string };
}

/** Asks Gemini for questions and returns only drafts that pass validation. */
export async function generateWithGemini(apiKey: string, model: string, req: Req, fetchFn: typeof fetch = fetch): Promise<{ drafts: DraftQuestion[]; dropped: number }> {
  const body = JSON.stringify(buildGeminiBody(req));
  if (body.length > GEMINI_MAX_REQUEST) throw new GenerateError(413, 'Too much for one request (Gemini takes about 20 MB). Do fewer pages at a time — one unit is usually fine.');
  let res: Response;
  try {
    res = await fetchFn(`${API}/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
      body,
    });
  } catch {
    throw new GenerateError(502, "Couldn't reach Gemini. Try again in a moment.");
  }
  const reply = (await res.json().catch(() => ({}))) as GeminiReply;
  if (!res.ok) {
    const msg = reply.error?.message ?? '';
    if (msg === RELAY_HELP || msg === RELAY_JWT_HELP || msg === RELAY_KEY_HELP) throw new GenerateError(503, msg);
    if (/location is not supported/i.test(msg)) throw new GenerateError(503, "Gemini doesn't serve the region the relay ran in. In Cloudflare, set GEMINI_RELAY_REGION to another Supabase region (e.g. us-west-1) and redeploy.");
    if (res.status === 429) throw new GenerateError(429, "Gemini's free daily limit is used up — try again later (limits reset daily).");
    if (res.status === 403 || reply.error?.status === 'PERMISSION_DENIED' || (res.status === 400 && /api key/i.test(msg)))
      throw new GenerateError(500, 'The GEMINI_API_KEY on the server is not valid.');
    if (res.status === 404) throw new ModelMissing(model);
    if (res.status === 400 || res.status === 413) throw new GenerateError(400, `Gemini could not read this material: ${msg || 'bad request'}`);
    throw new GenerateError(502, `Gemini is unavailable (${res.status}). Try again later.`);
  }
  if (reply.promptFeedback?.blockReason) throw new GenerateError(422, `Gemini refused to read this material (${reply.promptFeedback.blockReason.toLowerCase()}). Try other pages.`);
  const cand = reply.candidates?.[0];
  if (!cand) throw new GenerateError(502, 'Gemini returned no answer. Try again.');
  if (cand.finishReason === 'MAX_TOKENS') throw new GenerateError(422, 'The answer was cut off. Try fewer questions or a shorter part of the book.');
  if (cand.finishReason && cand.finishReason !== 'STOP')
    throw new GenerateError(422, `Gemini couldn't make questions from this material (${cand.finishReason.toLowerCase()}). Try other pages.`);
  const text = (cand.content?.parts ?? [])
    .filter((p) => typeof p.text === 'string' && !p.thought)
    .map((p) => p.text)
    .join('');
  let parsed: { questions?: unknown };
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new GenerateError(502, 'Gemini returned something that was not valid JSON. Try again.');
  }
  const { drafts, dropped } = validateDrafts(parsed.questions, MAX_ITEMS);
  return { drafts, dropped: dropped.length };
}
