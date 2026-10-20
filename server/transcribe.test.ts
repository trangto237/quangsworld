import { describe, expect, it, vi } from 'vitest';
import { buildTranscribeBody, handleTranscribe, parseTranscribe, transcribeWithGemini } from './transcribe';
import type { GenerateEnv } from './generate-core';

const ENV: GenerateEnv = { GEMINI_API_KEY: 'AIza-test', SUPABASE_URL: 'https://proj.supabase.co', SUPABASE_ANON_KEY: 'anon' };
const IMG = { mediaType: 'image/jpeg', data: 'aGVsbG8=' };

function fakeFetch(gemini: { status?: number; body?: unknown }, family = 'parent-1') {
  const calls: { url: string; init?: RequestInit }[] = [];
  const fn = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    const u = String(url);
    calls.push({ url: u, init });
    if (u.includes('/auth/v1/user')) return new Response(JSON.stringify({ id: 'parent-1', is_anonymous: false }));
    if (u.includes('/rpc/atlas_my_family')) return new Response(JSON.stringify(family));
    return new Response(JSON.stringify(gemini.body ?? {}), { status: gemini.status ?? 200 });
  }) as unknown as typeof fetch;
  return { fn, calls };
}
const reply = (pages: string[]) => ({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify({ pages: pages.map((text) => ({ text })) }) }] } }] });
const post = (body: unknown, token = 'tok') =>
  new Request('https://x/api/transcribe', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify(body) });

describe('AI scan reading', () => {
  it('checks the request', () => {
    expect(parseTranscribe({}).ok).toBe(false);
    expect(parseTranscribe({ images: Array(7).fill(IMG) }).ok).toBe(false);
    expect(parseTranscribe({ images: [{ mediaType: 'application/pdf', data: 'x' }] }).ok).toBe(false);
    expect(parseTranscribe({ images: [IMG, IMG] }).ok).toBe(true);
  });

  it('sends each page in order, with the key in a header', async () => {
    const body = buildTranscribeBody({ images: [IMG, IMG] });
    const parts = body.contents[0].parts as { text?: string; inlineData?: unknown }[];
    expect(parts.filter((p) => p.inlineData)).toHaveLength(2);
    expect(parts[0].text).toBe('Page 1:');
    const { fn, calls } = fakeFetch({ body: reply(['UNIT 7', 'GETTING STARTED']) });
    const pages = await transcribeWithGemini('AIza-test', 'gemini-2.5-flash', { images: [IMG, IMG] }, fn);
    expect(pages).toEqual(['UNIT 7', 'GETTING STARTED']);
    expect(calls[0].url).not.toContain('AIza');
    expect((calls[0].init?.headers as Record<string, string>)['x-goog-api-key']).toBe('AIza-test');
  });

  it('always returns one text per page, even if Gemini returns fewer', async () => {
    const { fn } = fakeFetch({ body: reply(['only one']) });
    expect(await transcribeWithGemini('k', 'm', { images: [IMG, IMG, IMG] }, fn)).toEqual(['only one', '', '']);
  });

  it('only the family parent may use it', async () => {
    const child = fakeFetch({ body: reply(['x']) }, 'someone-else');
    const res = await handleTranscribe(post({ images: [IMG] }), ENV, { fetch: child.fn });
    expect(res.status).toBe(403);
    const parent = fakeFetch({ body: reply(['UNIT 1']) });
    const ok = await handleTranscribe(post({ images: [IMG] }), ENV, { fetch: parent.fn });
    expect(ok.status).toBe(200);
    expect(await ok.json()).toEqual({ pages: ['UNIT 1'] });
  });

  it('explains rate limits and a missing key', async () => {
    const busy = fakeFetch({ status: 429, body: { error: { message: 'Quota exceeded per minute' } } });
    const res = await handleTranscribe(post({ images: [IMG] }), ENV, { fetch: busy.fn });
    expect(res.status).toBe(429);
    const none = await handleTranscribe(post({ images: [IMG] }), { ...ENV, GEMINI_API_KEY: undefined });
    expect(none.status).toBe(503);
  });
});

describe('Gemini region relay', () => {
  const LOCATION = { error: { code: 400, message: 'User location is not supported for the API use.', status: 'FAILED_PRECONDITION' } };

  it('goes through the Supabase relay (pinned to a region) when Google refuses the location', async () => {
    const { forgetChosenModel } = await import('./gemini');
    forgetChosenModel();
    const calls: { url: string; headers: Headers }[] = [];
    const fn = (async (url: string | URL | Request, init?: RequestInit) => {
      const u = String(url);
      calls.push({ url: u, headers: new Headers(init?.headers) });
      if (u.includes('/auth/v1/user')) return new Response(JSON.stringify({ id: 'parent-1', is_anonymous: false }));
      if (u.includes('/rpc/atlas_my_family')) return new Response(JSON.stringify('parent-1'));
      if (u.startsWith('https://generativelanguage.googleapis.com/')) return new Response(JSON.stringify(LOCATION), { status: 400 });
      if (u.includes('/functions/v1/gemini-relay')) {
        if (u.includes('models%3FpageSize')) return new Response(JSON.stringify({ models: [{ name: 'models/gemini-3-flash', supportedGenerationMethods: ['generateContent'] }] }));
        return new Response(JSON.stringify(reply(['UNIT 1'])));
      }
      return new Response('{}', { status: 500 });
    }) as unknown as typeof fetch;
    const res = await handleTranscribe(post({ images: [IMG] }), ENV, { fetch: fn });
    expect(await res.json()).toEqual({ pages: ['UNIT 1'] });
    const relayed = calls.filter((c) => c.url.includes('gemini-relay'));
    expect(relayed.length).toBeGreaterThan(0);
    expect(relayed.at(-1)!.url).toContain(encodeURIComponent('models/gemini-3-flash:generateContent'));
    expect(relayed[0].headers.get('x-region')).toBe('us-east-1');
    expect(relayed[0].headers.get('x-goog-api-key')).toBe('AIza-test');
    expect(relayed[0].headers.get('apikey')).toBe('anon');
    // Once refused, later calls skip Google's direct endpoint.
    const before = calls.filter((c) => c.url.startsWith('https://generativelanguage')).length;
    await handleTranscribe(post({ images: [IMG] }), ENV, { fetch: fn });
    expect(calls.filter((c) => c.url.startsWith('https://generativelanguage')).length).toBe(before);
  });

  it('explains the one-time setup when the relay is not deployed yet', async () => {
    const { forgetChosenModel } = await import('./gemini');
    forgetChosenModel();
    const fn = (async (url: string | URL | Request) => {
      const u = String(url);
      if (u.includes('/auth/v1/user')) return new Response(JSON.stringify({ id: 'parent-1', is_anonymous: false }));
      if (u.includes('/rpc/atlas_my_family')) return new Response(JSON.stringify('parent-1'));
      if (u.startsWith('https://generativelanguage.googleapis.com/')) return new Response(JSON.stringify(LOCATION), { status: 400 });
      return new Response(JSON.stringify({ code: 'NOT_FOUND', message: 'Requested function was not found' }), { status: 404 });
    }) as unknown as typeof fetch;
    const res = await handleTranscribe(post({ images: [IMG] }), ENV, { fetch: fn });
    expect(res.status).toBe(503);
    expect((await res.json()).error).toMatch(/gemini-relay/);
  });
});
