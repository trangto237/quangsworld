import { describe, expect, it, vi } from 'vitest';
import { GEMINI_DEFAULT_MODEL, GEMINI_SCHEMA, buildGeminiBody, generateWithGemini } from './gemini';
import { handleGenerate, health, providerOf, type GenerateDeps, type GenerateEnv } from './generate-core';
import { SYSTEM_PROMPT } from './prompt';

const ENV: GenerateEnv = { GEMINI_API_KEY: 'AIza-test', SUPABASE_URL: 'https://proj.supabase.co', SUPABASE_ANON_KEY: 'anon' };

const QUESTIONS = {
  questions: [
    { type: 'mcq', part: 'vocabulary', prompt: 'What does "cave" mean?', options: ['hang động', 'thác nước', 'núi', 'biển'], answer: 0, accept: [], explanation: 'cave = hang động', explanation_vi: 'cave nghĩa là hang động', passage: null, difficulty: 2 },
    { type: 'order', part: 'grammar', prompt: 'Put the words in the right order.', options: ['Visitors can explore the caves.'], answer: 0, accept: [], explanation: 'S + modal + V + O', explanation_vi: 'Chủ ngữ + động từ', passage: null, difficulty: 1 },
    { type: 'mcq', part: 'reading', prompt: 'Bad', options: ['a', 'b'], answer: 3, accept: [], explanation: '', explanation_vi: '', passage: null, difficulty: 2 },
  ],
};
const ok = (q: unknown = QUESTIONS, finishReason = 'STOP') => ({ candidates: [{ finishReason, content: { parts: [{ text: 'thinking…', thought: true }, { text: JSON.stringify(q) }] } }] });
const REQ = { text: 'Visitors can explore the caves.', unitTitle: 'Unit 7 · Natural wonders of the world', count: 10, focus: ['vocabulary', 'grammar'] as ('vocabulary' | 'grammar' | 'reading')[] };

/** A fake Gemini endpoint (and Supabase, for the full handler). */
function fakeFetch(gemini: { status?: number; body?: unknown } = { body: ok() }) {
  const calls: { url: string; init?: RequestInit }[] = [];
  const fn = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    const u = String(url);
    calls.push({ url: u, init });
    if (u.includes('/auth/v1/user')) return new Response(JSON.stringify({ id: 'parent-1', is_anonymous: false }));
    if (u.includes('/rpc/atlas_my_family')) return new Response(JSON.stringify('parent-1'));
    return new Response(JSON.stringify(gemini.body ?? {}), { status: gemini.status ?? 200 });
  }) as unknown as typeof fetch;
  return { fn, calls };
}

describe('Gemini provider', () => {
  it('is chosen when GEMINI_API_KEY is set, before Claude', () => {
    expect(providerOf(ENV)).toBe('gemini');
    expect(providerOf({ ...ENV, ANTHROPIC_API_KEY: 'sk' })).toBe('gemini');
    expect(providerOf({ ANTHROPIC_API_KEY: 'sk' })).toBe('claude');
    expect(providerOf({})).toBeNull();
    expect(health(ENV)).toEqual({ ai: true, provider: 'gemini', model: GEMINI_DEFAULT_MODEL, missing: [] });
    expect(health({ ...ENV, GEMINI_MODEL: 'gemini-3.5-flash' }).model).toBe('gemini-3.5-flash');
  });

  it('sends the key in a header (not the URL), the schema and the material', async () => {
    const { fn, calls } = fakeFetch();
    const req = { ...REQ, pdfBase64: 'JVBERi0=', images: [{ mediaType: 'image/jpeg', data: '/9j/' }] };
    await generateWithGemini('AIza-secret', GEMINI_DEFAULT_MODEL, req, fn);
    expect(calls[0].url).toBe('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent');
    expect(calls[0].url).not.toContain('AIza');
    expect(new Headers(calls[0].init?.headers).get('x-goog-api-key')).toBe('AIza-secret');
    const body = JSON.parse(String(calls[0].init?.body));
    expect(body).toEqual(JSON.parse(JSON.stringify(buildGeminiBody(req))));
    expect(body.systemInstruction.parts[0].text).toBe(SYSTEM_PROMPT);
    expect(body.generationConfig).toMatchObject({ responseMimeType: 'application/json', responseSchema: GEMINI_SCHEMA });
    const parts = body.contents[0].parts;
    expect(parts[0]).toEqual({ inlineData: { mimeType: 'application/pdf', data: 'JVBERi0=' } });
    expect(parts[1]).toEqual({ inlineData: { mimeType: 'image/jpeg', data: '/9j/' } });
    expect(parts[2].text).toContain('<material>');
    expect(parts[3].text).toContain('Unit 7');
  });

  it('asks for every field of a question', () => {
    const item = GEMINI_SCHEMA.properties.questions.items;
    expect([...item.required].sort()).toEqual(Object.keys(item.properties).sort());
    expect(item.properties.passage.nullable).toBe(true);
  });

  it('returns only valid drafts, ignoring thought parts', async () => {
    const { fn } = fakeFetch();
    const { drafts, dropped } = await generateWithGemini('k', GEMINI_DEFAULT_MODEL, REQ, fn);
    expect(drafts).toHaveLength(2);
    expect(dropped).toBe(1);
    expect(drafts[0].explanationVi).toBe('cave nghĩa là hang động');
  });

  it('turns limits, bad keys, blocks and cut-offs into clear messages', async () => {
    const run = (gemini: { status?: number; body?: unknown }) => generateWithGemini('k', GEMINI_DEFAULT_MODEL, REQ, fakeFetch(gemini).fn).catch((e) => e);
    const limit = await run({ status: 429, body: { error: { status: 'RESOURCE_EXHAUSTED', message: 'quota' } } });
    expect([limit.status, limit.message]).toEqual([429, "Gemini's free daily limit is used up — try again later (limits reset daily)."]);
    const badKey = await run({ status: 400, body: { error: { status: 'INVALID_ARGUMENT', message: 'API key not valid. Please pass a valid API key.' } } });
    expect(badKey.message).toMatch(/GEMINI_API_KEY/);
    expect((await run({ status: 403, body: { error: { status: 'PERMISSION_DENIED' } } })).message).toMatch(/GEMINI_API_KEY/);
    expect((await run({ status: 404, body: {} })).message).toMatch(/not available/);
    const blocked = await run({ body: { promptFeedback: { blockReason: 'SAFETY' } } });
    expect(blocked.status).toBe(422);
    expect(blocked.message).toMatch(/refused/);
    const safety = await run({ body: ok(QUESTIONS, 'SAFETY') });
    expect(safety.status).toBe(422);
    expect(safety.message).toMatch(/safety/);
    const cut = await run({ body: ok(QUESTIONS, 'MAX_TOKENS') });
    expect(cut.status).toBe(422);
    expect(cut.message).toMatch(/cut off/);
    const junk = await run({ body: { candidates: [{ finishReason: 'STOP', content: { parts: [{ text: 'not json' }] } }] } });
    expect(junk.status).toBe(502);
    expect((await run({ status: 503, body: {} })).status).toBe(502);
  });

  it('refuses requests too big for one call', async () => {
    const e = await generateWithGemini('k', GEMINI_DEFAULT_MODEL, { ...REQ, pdfBase64: 'A'.repeat(19_500_000) }, fakeFetch().fn).catch((x) => x);
    expect(e.status).toBe(413);
  });

  it('runs end to end through the Pages Function handler', async () => {
    const { fn, calls } = fakeFetch();
    const d: GenerateDeps = {
      fetch: fn,
      makeClient: () => {
        throw new Error('Claude must not be used');
      },
    };
    const res = await handleGenerate(
      new Request('https://site.pages.dev/api/generate', { method: 'POST', headers: { authorization: 'Bearer jwt', 'content-type': 'application/json' }, body: JSON.stringify(REQ) }),
      ENV,
      d,
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ provider: 'gemini', model: GEMINI_DEFAULT_MODEL, dropped: 1 });
    expect(body.drafts).toHaveLength(2);
    expect(calls.map((c) => new URL(c.url).host)).toEqual(['proj.supabase.co', 'proj.supabase.co', 'generativelanguage.googleapis.com']);
  });
});
