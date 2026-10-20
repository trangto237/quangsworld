import { describe, expect, it } from 'vitest';
import { handleDiagnose } from './diagnose';

describe('AI connection test', () => {
  it('reports each link, parent only, without leaking keys', async () => {
    const seen: { url: string; headers: Headers }[] = [];
    const fn = (async (url: string | URL | Request, init?: RequestInit) => {
      const u = String(url);
      seen.push({ url: u, headers: new Headers(init?.headers) });
      if (u.includes('/auth/v1/user')) return new Response(JSON.stringify({ id: 'p', is_anonymous: false }));
      if (u.includes('/rpc/atlas_my_family')) return new Response(JSON.stringify('p'));
      if (u.startsWith('https://generativelanguage')) return new Response(JSON.stringify({ error: { message: 'User location is not supported for the API use.' } }), { status: 400 });
      if (u.includes('gemini-relay')) return new Response('{"models":[]}', { headers: { 'x-sb-edge-region': 'us-east-1' } });
      return new Response('{}', { status: 500 });
    }) as unknown as typeof fetch;
    const env = { GEMINI_API_KEY: 'AIza-secret', SUPABASE_URL: 'https://p.supabase.co', SUPABASE_ANON_KEY: 'sb_publishable_x' };
    const res = await handleDiagnose(new Request('https://x/api/diagnose', { method: 'POST', headers: { authorization: 'Bearer t' } }), env, { fetch: fn });
    const text = await res.text();
    expect(text).not.toContain('AIza-secret');
    const { checks } = JSON.parse(text) as { checks: { step: string; ok: boolean; detail: string }[] };
    expect(checks.find((c) => c.step === 'Gemini, direct')).toMatchObject({ ok: false });
    expect(checks.find((c) => c.step === 'Gemini via Supabase relay')).toMatchObject({ ok: true, detail: expect.stringContaining('us-east-1') });
    // A publishable (non-JWT) key goes in apikey only, never as a Bearer token.
    const relay = seen.find((c) => c.url.includes('gemini-relay'))!;
    expect(relay.headers.get('apikey')).toBe('sb_publishable_x');
    expect(relay.headers.get('authorization')).toBeNull();
  });
});

describe('OpenRouter check', () => {
  it("shows the real balance, and calls the key's cap a limit, not money", async () => {
    const fn = (async (url: string | URL | Request) => {
      const u = String(url);
      if (u.includes('/auth/v1/user')) return new Response(JSON.stringify({ id: 'p', is_anonymous: false }));
      if (u.includes('/rpc/atlas_my_family')) return new Response(JSON.stringify('p'));
      if (u.endsWith('/api/v1/key')) return new Response(JSON.stringify({ data: { limit_remaining: 100, is_free_tier: true } }));
      if (u.endsWith('/api/v1/credits')) return new Response(JSON.stringify({ data: { total_credits: 0, total_usage: 0 } }));
      return new Response('{}', { status: 500 });
    }) as unknown as typeof fetch;
    const res = await handleDiagnose(new Request('https://x/api/diagnose', { method: 'POST', headers: { authorization: 'Bearer t' } }), { SUPABASE_URL: 'https://p.supabase.co', SUPABASE_ANON_KEY: 'a', OPENROUTER_API_KEY: 'sk-or' }, { fetch: fn });
    const { checks } = (await res.json()) as { checks: { step: string; detail: string }[] };
    const or = checks.find((c) => c.step === 'OpenRouter')!.detail;
    expect(or).toContain('Account balance: $0.00');
    expect(or).toContain('No credit bought yet');
    expect(or).toContain('not money');
  });
});
