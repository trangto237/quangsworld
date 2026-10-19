/**
 * "Make questions from my textbook" with AI — the server side, used by the Cloudflare Pages Function
 * at functions/api/generate.ts.
 *
 * - Provider: Google Gemini when GEMINI_API_KEY is set (free tier, see server/gemini.ts), otherwise Claude
 *   when ANTHROPIC_API_KEY is set. The key stays on the server (a Cloudflare secret), never in browsers.
 * - Only the family's parent account may call it: the request must carry a Supabase access token of a
 *   signed-in, non-anonymous user who owns the family (not a child's member login, not a stranger).
 * - The answer is constrained to a JSON schema and then validated again item by item.
 */
import Anthropic from '@anthropic-ai/sdk';
import { validateDrafts, type DraftQuestion } from '../packages/knowledge/src/import-validate';
import { GEMINI_DEFAULT_MODEL, generateWithGemini } from './gemini';
import { GenerateError, SYSTEM_PROMPT, taskText } from './prompt';

export { GenerateError, SYSTEM_PROMPT } from './prompt';

export interface GenerateEnv {
  /** Google AI Studio key (free tier). Takes priority over ANTHROPIC_API_KEY. */
  GEMINI_API_KEY?: string;
  /** Optional, defaults to gemini-2.5-flash. */
  GEMINI_MODEL?: string;
  ANTHROPIC_API_KEY?: string;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  /** The same values the app is built with also work. */
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
}

export interface GenerateRequest {
  /** Text extracted in the browser (pasted, .txt, .docx, or a PDF with a text layer). */
  text?: string;
  /** A scanned PDF, base64 (no data: prefix). */
  pdfBase64?: string;
  /** Photos of textbook pages, base64. */
  images?: { mediaType: string; data: string }[];
  /** "Unit 7 · Natural wonders of the world" */
  unitTitle?: string;
  focus?: ('vocabulary' | 'grammar' | 'reading')[];
  /** How many questions to aim for. */
  count?: number;
}

export const MODEL = 'claude-opus-5-5';
export const LIMITS = { textChars: 60_000, pdfBase64: 15_000_000, images: 8, imageBase64: 5_000_000, minCount: 5, maxCount: 40 };
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
type ImageType = (typeof IMAGE_TYPES)[number];

const supabaseOf = (env: GenerateEnv) => ({ url: env.SUPABASE_URL ?? env.VITE_SUPABASE_URL, key: env.SUPABASE_ANON_KEY ?? env.VITE_SUPABASE_ANON_KEY });

export type Provider = 'gemini' | 'claude';

/** Gemini if its key is set, else Claude if its key is set, else none. */
export const providerOf = (env: GenerateEnv): Provider | null => (env.GEMINI_API_KEY ? 'gemini' : env.ANTHROPIC_API_KEY ? 'claude' : null);
const modelOf = (env: GenerateEnv, p: Provider | null) => (p === 'gemini' ? env.GEMINI_MODEL?.trim() || GEMINI_DEFAULT_MODEL : p === 'claude' ? MODEL : null);

/** What the parent app shows: is AI generation available, with which provider, and if not, what's missing. */
export function health(env: GenerateEnv): { ai: boolean; provider: Provider | null; model: string | null; missing: string[] } {
  const sb = supabaseOf(env);
  const provider = providerOf(env);
  const missing = [!provider && 'GEMINI_API_KEY', !sb.url && 'SUPABASE_URL', !sb.key && 'SUPABASE_ANON_KEY'].filter((x): x is string => !!x);
  return { ai: missing.length === 0, provider, model: modelOf(env, provider), missing };
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

/** Checks the caller is the family's signed-in parent (not an anonymous kid device, not a stranger). */
export async function verifyParent(request: Request, env: GenerateEnv, fetchFn: typeof fetch = fetch): Promise<{ ok: true; userId: string } | { ok: false; status: number; error: string }> {
  const sb = supabaseOf(env);
  if (!sb.url || !sb.key) return { ok: false, status: 503, error: 'Cloud sync (Supabase) is not configured on the server.' };
  const token = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return { ok: false, status: 401, error: 'Sign in to your family cloud account first (Settings → Cloud sync).' };
  let res: Response;
  try {
    res = await fetchFn(`${sb.url.replace(/\/$/, '')}/auth/v1/user`, { headers: { authorization: `Bearer ${token}`, apikey: sb.key } });
  } catch {
    return { ok: false, status: 502, error: "Couldn't reach Supabase to check your sign-in." };
  }
  if (!res.ok) return { ok: false, status: 401, error: 'Your sign-in has expired. Sign in again in Settings → Cloud sync.' };
  const user = (await res.json().catch(() => null)) as { id?: string; is_anonymous?: boolean } | null;
  if (!user?.id) return { ok: false, status: 401, error: 'Your sign-in could not be checked.' };
  if (user.is_anonymous) return { ok: false, status: 403, error: 'Only the parent account can make questions with AI.' };
  // A child may sign in with their own email as a *member* of the family: only the family's owner (the
  // parent, whose family id is their own user id) may spend the AI quota.
  let rpc: Response;
  try {
    rpc = await fetchFn(`${sb.url.replace(/\/$/, '')}/rest/v1/rpc/atlas_my_family`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, apikey: sb.key, 'content-type': 'application/json' },
      body: '{}',
    });
  } catch {
    return { ok: false, status: 502, error: "Couldn't reach Supabase to check your sign-in." };
  }
  if (rpc.ok) {
    const family = await rpc.json().catch(() => null);
    if (family !== user.id) return { ok: false, status: 403, error: 'Only the parent account can make questions with AI.' };
  } else if (rpc.status !== 404) {
    // 404 = an older setup.sql without family codes/members: the signed-in non-anonymous user is the parent.
    return { ok: false, status: 502, error: 'Your family account could not be checked. Try again.' };
  }
  return { ok: true, userId: user.id };
}

/** Checks the request body; returns a cleaned request or an error message. */
export function parseRequest(body: unknown): { ok: true; req: Required<Pick<GenerateRequest, 'count' | 'focus'>> & GenerateRequest } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Expected a JSON body.' };
  const b = body as GenerateRequest;
  const text = typeof b.text === 'string' ? b.text.trim() : '';
  const pdf = typeof b.pdfBase64 === 'string' ? b.pdfBase64 : '';
  const images = Array.isArray(b.images) ? b.images : [];
  if (!text && !pdf && !images.length) return { ok: false, error: 'Nothing to read: send text, a PDF or page photos.' };
  if (text.length > LIMITS.textChars) return { ok: false, error: `The text is too long (max ${LIMITS.textChars.toLocaleString()} characters). Split it into units.` };
  if (pdf.length > LIMITS.pdfBase64) return { ok: false, error: 'The PDF is too big (max about 10 MB). Upload fewer pages.' };
  if (images.length > LIMITS.images) return { ok: false, error: `Too many photos (max ${LIMITS.images}).` };
  for (const im of images) {
    if (!im || !IMAGE_TYPES.includes(im.mediaType as ImageType) || typeof im.data !== 'string') return { ok: false, error: 'Photos must be JPEG, PNG, WebP or GIF.' };
    if (im.data.length > LIMITS.imageBase64) return { ok: false, error: 'A photo is too big (max about 3.5 MB each).' };
  }
  const focus = (Array.isArray(b.focus) ? b.focus : []).filter((f) => f === 'vocabulary' || f === 'grammar' || f === 'reading');
  const count = Math.min(LIMITS.maxCount, Math.max(LIMITS.minCount, Math.round(Number(b.count) || 20)));
  const unitTitle = typeof b.unitTitle === 'string' ? b.unitTitle.slice(0, 120) : undefined;
  return { ok: true, req: { text, pdfBase64: pdf || undefined, images, unitTitle, focus: focus.length ? focus : ['vocabulary', 'grammar', 'reading'], count } };
}

/** Structured-output schema for Claude (Gemini uses the equivalent GEMINI_SCHEMA in server/gemini.ts). */
export const QUESTIONS_SCHEMA = {
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
          passage: { anyOf: [{ type: 'string' }, { type: 'null' }] },
          difficulty: { type: 'integer' },
        },
      },
    },
  },
} as const;


/** The user turn: the material (document / photos / text) followed by the task. */
export function buildContent(req: GenerateRequest & { count: number; focus: string[] }): Anthropic.Beta.BetaContentBlockParam[] {
  const content: Anthropic.Beta.BetaContentBlockParam[] = [];
  if (req.pdfBase64) content.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: req.pdfBase64 } });
  for (const im of req.images ?? []) content.push({ type: 'image', source: { type: 'base64', media_type: im.mediaType as ImageType, data: im.data } });
  if (req.text) content.push({ type: 'text', text: `<material>\n${req.text}\n</material>` });
  content.push({ type: 'text', text: taskText(req) });
  return content;
}

export interface GenerateDeps {
  fetch: typeof fetch;
  makeClient: (apiKey: string) => Pick<Anthropic, 'beta'>;
}

const defaultDeps: GenerateDeps = { fetch: (...a) => fetch(...a), makeClient: (apiKey) => new Anthropic({ apiKey }) };

/** Asks Claude for questions and returns only drafts that pass validation. */
export async function generateQuestions(client: Pick<Anthropic, 'beta'>, req: GenerateRequest & { count: number; focus: string[] }): Promise<{ drafts: DraftQuestion[]; dropped: number }> {
  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: 32000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'medium', format: { type: 'json_schema', schema: QUESTIONS_SCHEMA as unknown as Record<string, unknown> } },
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildContent(req) }],
  });
  const message = await stream.finalMessage();
  if (message.stop_reason === 'refusal') throw new GenerateError(422, "Claude couldn't make questions from this material.");
  if (message.stop_reason === 'max_tokens') throw new GenerateError(422, 'The answer was cut off. Try fewer questions or a shorter part of the book.');
  const text = message.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join('');
  let parsed: { questions?: unknown };
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new GenerateError(502, 'Claude returned something that was not valid JSON. Try again.');
  }
  const { drafts, dropped } = validateDrafts(parsed.questions, LIMITS.maxCount * 2);
  return { drafts, dropped: dropped.length };
}


/** POST /api/generate */
export async function handleGenerate(request: Request, env: GenerateEnv, deps: GenerateDeps = defaultDeps): Promise<Response> {
  const h = health(env);
  if (!h.ai) return json({ error: `AI question making is not set up on the server (missing: ${h.missing.join(', ')}).` }, 503);
  const who = await verifyParent(request, env, deps.fetch);
  if (!who.ok) return json({ error: who.error }, who.status);
  const body = await request.json().catch(() => null);
  const parsed = parseRequest(body);
  if (!parsed.ok) return json({ error: parsed.error }, 400);
  const provider = providerOf(env)!;
  const model = modelOf(env, provider)!;
  try {
    const { drafts, dropped } =
      provider === 'gemini' ? await generateWithGemini(env.GEMINI_API_KEY!, model, parsed.req, deps.fetch) : await generateQuestions(deps.makeClient(env.ANTHROPIC_API_KEY!), parsed.req);
    if (!drafts.length) return json({ error: 'No usable questions came back. Try a clearer page or more text.' }, 422);
    return json({ drafts, dropped, provider, model });
  } catch (e) {
    if (e instanceof GenerateError) return json({ error: e.message }, e.status);
    if (e instanceof Anthropic.AuthenticationError) return json({ error: 'The ANTHROPIC_API_KEY on the server is not valid.' }, 500);
    if (e instanceof Anthropic.RateLimitError) return json({ error: 'Too many requests right now. Wait a minute and try again.' }, 429);
    if (e instanceof Anthropic.BadRequestError) return json({ error: `Claude could not read this material: ${e.message}` }, 400);
    if (e instanceof Anthropic.APIError) return json({ error: `Claude is unavailable (${e.status ?? 'error'}). Try again later.` }, 502);
    return json({ error: 'Something went wrong while making questions.' }, 500);
  }
}
