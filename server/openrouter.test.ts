import { beforeEach, describe, expect, it } from 'vitest';
import { forgetOpenRouterModels, pickFree, pickPaid, transcribeWithOpenRouter } from './openrouter';
import { forgetChosenModel } from './gemini';
import { handleTranscribe } from './transcribe';
import { forgetRest, handleGenerate, health, type GenerateEnv } from './generate-core';

const MODELS = [
  { id: 'google/gemini-2.5-flash', architecture: { input_modalities: ['text', 'image'] }, pricing: { prompt: '0.0000003', completion: '0.0000025' } },
  { id: 'google/gemini-3-flash', architecture: { input_modalities: ['text', 'image', 'file'] }, pricing: { prompt: '0.0000005', completion: '0.000003' } },
  { id: 'google/gemini-3-flash-preview', architecture: { input_modalities: ['text', 'image'] }, pricing: { prompt: '0.0000005', completion: '0.000003' } },
  { id: 'qwen/qwen2.5-vl-72b-instruct:free', architecture: { input_modalities: ['text', 'image'] }, pricing: { prompt: '0', completion: '0' }, context_length: 32000 },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', architecture: { input_modalities: ['text'] }, pricing: { prompt: '0', completion: '0' } },
];
const IMG = { mediaType: 'image/jpeg', data: 'aGVsbG8=' };
const ENV: GenerateEnv = { SUPABASE_URL: 'https://proj.supabase.co', SUPABASE_ANON_KEY: 'anon', OPENROUTER_API_KEY: 'sk-or-test' };
const pagesReply = (pages: string[]) => ({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ pages: pages.map((text) => ({ text })) }) } }] });
const post = (path: string, body: unknown) =>
  new Request(`https://x/api/${path}`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer tok' }, body: JSON.stringify(body) });

/** Supabase (parent check), OpenRouter (models + chat) and optionally Gemini. */
function fake(opts: { chat: (model: string) => Response; gemini?: () => Response }) {
  const calls: { url: string; body?: { model?: string } }[] = [];
  const fn = (async (url: string | URL | Request, init?: RequestInit) => {
    const u = String(url);
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    calls.push({ url: u, body });
    if (u.includes('/auth/v1/user')) return new Response(JSON.stringify({ id: 'parent-1', is_anonymous: false }));
    if (u.includes('/rpc/atlas_my_family')) return new Response(JSON.stringify('parent-1'));
    if (u === 'https://openrouter.ai/api/v1/models') return new Response(JSON.stringify({ data: MODELS }));
    if (u === 'https://openrouter.ai/api/v1/chat/completions') return opts.chat(body.model);
    if (u.startsWith('https://generativelanguage.googleapis.com/') && opts.gemini) return opts.gemini();
    return new Response('{}', { status: 500 });
  }) as unknown as typeof fetch;
  return { fn, calls };
}

beforeEach(() => {
  forgetRest();
  forgetOpenRouterModels();
  forgetChosenModel();
});

describe('OpenRouter', () => {
  it('picks the newest stable Gemini Flash, else a free model that reads images', () => {
    expect(pickPaid(MODELS)).toBe('google/gemini-3-flash');
    expect(pickFree(MODELS)).toBe('qwen/qwen2.5-vl-72b-instruct:free');
    expect(pickPaid([])).toBeNull();
  });

  it('reads pages, and switches to a free model when the account has no credit', async () => {
    const { fn, calls } = fake({
      chat: (model) => (model.endsWith(':free') ? new Response(JSON.stringify(pagesReply(['UNIT 1']))) : new Response(JSON.stringify({ error: { code: 402, message: 'Insufficient credits' } }), { status: 402 })),
    });
    expect(await transcribeWithOpenRouter('k', undefined, 'sys', [IMG], fn)).toEqual(['UNIT 1']);
    expect(calls.filter((c) => c.url.endsWith('/chat/completions')).map((c) => c.body?.model)).toEqual(['google/gemini-3-flash', 'qwen/qwen2.5-vl-72b-instruct:free']);
  });

  it('is the main AI when it is the only key', async () => {
    expect(health(ENV)).toMatchObject({ ai: true, provider: 'openrouter', backup: null });
    const { fn } = fake({ chat: () => new Response(JSON.stringify(pagesReply(['GETTING STARTED']))) });
    const res = await handleTranscribe(post('transcribe', { images: [IMG] }), ENV, { fetch: fn });
    expect(await res.json()).toEqual({ pages: ['GETTING STARTED'] });
  });

  it('backs up Gemini when Gemini fails (e.g. location refused, no relay)', async () => {
    const env = { ...ENV, GEMINI_API_KEY: 'AIza' };
    expect(health(env)).toMatchObject({ provider: 'gemini', backup: 'openrouter' });
    const { fn } = fake({
      gemini: () => new Response(JSON.stringify({ error: { message: 'User location is not supported for the API use.' } }), { status: 400 }),
      chat: () => new Response(JSON.stringify(pagesReply(['UNIT 7']))),
    });
    const res = await handleTranscribe(post('transcribe', { images: [IMG] }), env, { fetch: fn });
    expect(await res.json()).toEqual({ pages: ['UNIT 7'] });
  });

  it('makes questions as a backup too, and says which AI was used', async () => {
    const q = { type: 'mcq', part: 'vocabulary', prompt: 'What does "cave" mean?', options: ['hang động', 'thác nước', 'núi', 'biển'], answer: 0, accept: [], explanation: 'cave = hang động', explanation_vi: 'hang động', passage: null, difficulty: 2 };
    const { fn } = fake({
      gemini: () => new Response(JSON.stringify({ error: { message: 'Quota exceeded per day' } }), { status: 429 }),
      chat: () => new Response(JSON.stringify({ choices: [{ finish_reason: 'stop', message: { content: '```json\n' + JSON.stringify({ questions: [q] }) + '\n```' } }] })),
    });
    const res = await handleGenerate(post('generate', { text: 'A cave is a big hole in a mountain.', count: 5 }), { ...ENV, GEMINI_API_KEY: 'AIza' }, {
      fetch: fn,
      makeClient: () => {
        throw new Error('no Claude');
      },
    });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toMatchObject({ provider: 'openrouter', model: 'google/gemini-3-flash' });
    expect(body.drafts).toHaveLength(1);
  });

  it('when both fail, says so', async () => {
    const { fn } = fake({
      gemini: () => new Response(JSON.stringify({ error: { message: 'Quota exceeded per day' } }), { status: 429 }),
      chat: () => new Response(JSON.stringify({ error: { code: 401, message: 'bad key' } }), { status: 401 }),
    });
    const res = await handleTranscribe(post('transcribe', { images: [IMG] }), { ...ENV, GEMINI_API_KEY: 'AIza' }, { fetch: fn });
    expect((await res.json()).error).toMatch(/backup \(OpenRouter\) failed too/);
  });
});

describe('after the main AI fails', () => {
  it('goes straight to the backup for a while', async () => {
    let geminiCalls = 0;
    const { fn } = fake({
      gemini: () => (geminiCalls++, new Response(JSON.stringify({ error: { message: 'User location is not supported for the API use.' } }), { status: 400 })),
      chat: () => new Response(JSON.stringify(pagesReply(['p']))),
    });
    const env = { ...ENV, GEMINI_API_KEY: 'AIza' };
    await handleTranscribe(post('transcribe', { images: [IMG] }), env, { fetch: fn });
    const after = geminiCalls;
    expect(after).toBeGreaterThan(0);
    await handleTranscribe(post('transcribe', { images: [IMG] }), env, { fetch: fn });
    expect(geminiCalls).toBe(after);
  });
});
