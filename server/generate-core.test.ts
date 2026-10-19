import { describe, expect, it, vi } from 'vitest';
import Anthropic from '@anthropic-ai/sdk';
import { MODEL, QUESTIONS_SCHEMA, buildContent, handleGenerate, health, parseRequest, type GenerateDeps, type GenerateEnv } from './generate-core';

const ENV: GenerateEnv = { ANTHROPIC_API_KEY: 'sk-test', SUPABASE_URL: 'https://proj.supabase.co', SUPABASE_ANON_KEY: 'anon' };

const GOOD = {
  questions: [
    { type: 'mcq', part: 'vocabulary', prompt: 'What does "cave" mean?', options: ['hang động', 'thác nước', 'núi', 'biển'], answer: 0, accept: [], explanation: 'cave = hang động', explanation_vi: 'cave nghĩa là hang động', passage: null, difficulty: 2 },
    { type: 'order', part: 'grammar', prompt: 'Put the words in the right order.', options: ['Visitors can explore the caves.'], answer: 0, accept: [], explanation: 'S + modal + V + O', explanation_vi: 'Chủ ngữ + động từ', passage: null, difficulty: 1 },
    { type: 'mcq', part: 'reading', prompt: 'Bad', options: ['a', 'b'], answer: 3, accept: [], explanation: '', explanation_vi: '', passage: null, difficulty: 2 },
  ],
};

/** A fake Supabase /auth/v1/user and a fake Claude client. */
function deps(opts: { user?: object | null; status?: number; reply?: unknown; stop?: string; throws?: unknown } = {}) {
  const calls: { url: string; init?: RequestInit }[] = [];
  const params: unknown[] = [];
  const d: GenerateDeps = {
    fetch: vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      calls.push({ url: String(url), init });
      return new Response(JSON.stringify(opts.user === undefined ? { id: 'parent-1', is_anonymous: false } : opts.user), { status: opts.status ?? 200 });
    }) as unknown as typeof fetch,
    makeClient: () =>
      ({
        beta: {
          messages: {
            stream: (p: unknown) => {
              params.push(p);
              return {
                finalMessage: async () => {
                  if (opts.throws) throw opts.throws;
                  return { stop_reason: opts.stop ?? 'end_turn', content: [{ type: 'text', text: typeof opts.reply === 'string' ? opts.reply : JSON.stringify(opts.reply ?? GOOD) }] };
                },
              };
            },
          },
        },
      }) as unknown as Pick<Anthropic, 'beta'>,
  };
  return { d, calls, params };
}

const post = (body: unknown, token: string | null = 'jwt-123') =>
  new Request('https://site.pages.dev/api/generate', { method: 'POST', headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });

describe('AI question generation (Pages Function)', () => {
  it('reports what is missing', () => {
    expect(health(ENV)).toEqual({ ai: true, missing: [] });
    expect(health({ VITE_SUPABASE_URL: 'x', VITE_SUPABASE_ANON_KEY: 'y' })).toEqual({ ai: false, missing: ['ANTHROPIC_API_KEY'] });
    expect(health({}).missing).toEqual(['ANTHROPIC_API_KEY', 'SUPABASE_URL', 'SUPABASE_ANON_KEY']);
  });

  it('is unavailable without the key', async () => {
    const { d } = deps();
    const res = await handleGenerate(post({ text: 'hello' }), { SUPABASE_URL: 'x', SUPABASE_ANON_KEY: 'y' }, d);
    expect(res.status).toBe(503);
  });

  it('rejects callers without a token, with a bad token, or signed in anonymously', async () => {
    expect((await handleGenerate(post({ text: 'hi' }, null), ENV, deps().d)).status).toBe(401);
    expect((await handleGenerate(post({ text: 'hi' }), ENV, deps({ status: 401, user: { msg: 'bad jwt' } }).d)).status).toBe(401);
    const anon = await handleGenerate(post({ text: 'hi' }), ENV, deps({ user: { id: 'kid', is_anonymous: true } }).d);
    expect(anon.status).toBe(403);
    expect((await anon.json()).error).toMatch(/parent account/);
  });

  it('checks the token against Supabase with the anon key', async () => {
    const { d, calls } = deps();
    await handleGenerate(post({ text: 'Visitors can explore the caves.' }), ENV, d);
    expect(calls[0].url).toBe('https://proj.supabase.co/auth/v1/user');
    const h = new Headers(calls[0].init?.headers);
    expect(h.get('authorization')).toBe('Bearer jwt-123');
    expect(h.get('apikey')).toBe('anon');
  });

  it('validates the request body', () => {
    expect(parseRequest({}).ok).toBe(false);
    expect(parseRequest({ text: 'x'.repeat(60_001) }).ok).toBe(false);
    expect(parseRequest({ images: [{ mediaType: 'image/tiff', data: 'aa' }] }).ok).toBe(false);
    expect(parseRequest({ images: new Array(9).fill({ mediaType: 'image/png', data: 'a' }) }).ok).toBe(false);
    const ok = parseRequest({ text: ' words ', count: 500, focus: ['grammar', 'nonsense'] });
    expect(ok.ok && ok.req).toMatchObject({ text: 'words', count: 40, focus: ['grammar'] });
  });

  it('asks Claude with the schema and returns only valid drafts', async () => {
    const { d, params } = deps();
    const res = await handleGenerate(post({ text: 'Visitors can explore the caves.', unitTitle: 'Unit 7 · Natural wonders of the world', count: 10 }), ENV, d);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.drafts).toHaveLength(2);
    expect(body.dropped).toBe(1);
    expect(body.drafts[0].explanationVi).toBe('cave nghĩa là hang động');
    const p = params[0] as Record<string, any>;
    expect(p.model).toBe(MODEL);
    expect(p.fallbacks).toBe('default');
    expect(p.betas).toEqual(['server-side-fallback-2026-07-01']);
    expect(p.output_config.format).toEqual({ type: 'json_schema', schema: QUESTIONS_SCHEMA });
    expect(p.thinking).toBeUndefined();
    const content = p.messages[0].content;
    expect(content[0].text).toContain('<material>');
    expect(content.at(-1).text).toContain('Unit 7');
  });

  it('puts a scanned PDF and photos before the instructions', () => {
    const c = buildContent({ pdfBase64: 'JVBERi0=', images: [{ mediaType: 'image/jpeg', data: '/9j/' }], count: 10, focus: ['reading'] });
    expect(c.map((b) => b.type)).toEqual(['document', 'image', 'text']);
  });

  it('turns refusals, cut-offs, bad JSON and API errors into clear messages', async () => {
    expect((await handleGenerate(post({ text: 't' }), ENV, deps({ stop: 'refusal' }).d)).status).toBe(422);
    expect((await handleGenerate(post({ text: 't' }), ENV, deps({ stop: 'max_tokens' }).d)).status).toBe(422);
    expect((await handleGenerate(post({ text: 't' }), ENV, deps({ reply: 'not json' }).d)).status).toBe(502);
    expect((await handleGenerate(post({ text: 't' }), ENV, deps({ reply: { questions: [] } }).d)).status).toBe(422);
    const rate = new Anthropic.RateLimitError(429, { type: 'error' }, 'slow down', new Headers());
    expect((await handleGenerate(post({ text: 't' }), ENV, deps({ throws: rate }).d)).status).toBe(429);
    const auth = new Anthropic.AuthenticationError(401, { type: 'error' }, 'bad key', new Headers());
    const res = await handleGenerate(post({ text: 't' }), ENV, deps({ throws: auth }).d);
    expect((await res.json()).error).toMatch(/ANTHROPIC_API_KEY/);
  });
});
