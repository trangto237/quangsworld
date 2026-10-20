/**
 * "Test the AI connection" (parent only): checks each link the AI features use, from the server itself,
 * and reports what each one answered — so a setup problem can be pinned down without guessing.
 * Used by functions/api/diagnose.ts. Never returns keys.
 */
import { verifyParent, type GenerateDeps, type GenerateEnv } from './generate-core';
import { RELAY_KEY_HELP, relayHeaders } from './gemini';

export interface Check {
  step: string;
  ok: boolean;
  detail: string;
}

const short = (t: string) => t.replace(/\s+/g, ' ').slice(0, 240);

async function probe(fetchFn: typeof fetch, url: string, init?: RequestInit): Promise<{ status: number; text: string; headers: Headers } | { error: string }> {
  try {
    const res = await fetchFn(url, init);
    return { status: res.status, text: await res.text(), headers: res.headers };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'network error' };
  }
}

export async function diagnose(request: Request, env: GenerateEnv, fetchFn: typeof fetch): Promise<Check[]> {
  const out: Check[] = [];
  const cf = (request as Request & { cf?: { colo?: string; country?: string } }).cf;
  out.push({ step: 'Server location', ok: true, detail: cf ? `Cloudflare data centre ${cf.colo ?? '?'} (you connect from ${cf.country ?? '?'})` : 'unknown' });

  const key = env.GEMINI_API_KEY;
  if (!key) out.push({ step: 'Gemini key', ok: false, detail: 'GEMINI_API_KEY is not set in Cloudflare.' });
  else {
    const r = await probe(fetchFn, 'https://generativelanguage.googleapis.com/v1beta/models?pageSize=5', { headers: { 'x-goog-api-key': key } });
    out.push(
      'error' in r
        ? { step: 'Gemini, direct', ok: false, detail: `Could not connect: ${r.error}` }
        : { step: 'Gemini, direct', ok: r.status === 200, detail: r.status === 200 ? 'Works from this server.' : `${r.status}: ${short(r.text)}` },
    );
    const sbUrl = (env.SUPABASE_URL ?? env.VITE_SUPABASE_URL)?.replace(/\/$/, '');
    if (sbUrl) {
      const region = env.GEMINI_RELAY_REGION?.trim() || 'us-east-1';
      const headers = relayHeaders(env, { 'x-goog-api-key': key });
      const target = `${sbUrl}/functions/v1/gemini-relay?forceFunctionRegion=${region}&path=${encodeURIComponent('models?pageSize=5')}`;
      let r2 = await probe(fetchFn, target, { headers });
      if (!('error' in r2) && r2.status === 401 && /INVALID_API_KEY|matched no key/i.test(r2.text)) {
        const bare = await probe(fetchFn, target, { headers: relayHeaders(env, { 'x-goog-api-key': key }, false) });
        r2 = !('error' in bare) && bare.status === 401 ? { ...bare, text: RELAY_KEY_HELP } : bare;
      }
      out.push(
        'error' in r2
          ? { step: 'Gemini via Supabase relay', ok: false, detail: `Could not connect: ${r2.error}` }
          : {
              step: 'Gemini via Supabase relay',
              ok: r2.status === 200,
              detail:
                r2.status === 200
                  ? `Works (ran in ${r2.headers.get('x-sb-edge-region') || r2.headers.get('x-relay-region') || region}).`
                  : r2.status === 404
                    ? 'The gemini-relay function was not found — deploy it in Supabase → Edge Functions (name: gemini-relay).'
                    : `${r2.status} (ran in ${r2.headers.get('x-sb-edge-region') || '?'}): ${short(r2.text)}`,
            },
      );
    }
  }

  if (env.OPENROUTER_API_KEY) {
    const r = await probe(fetchFn, 'https://openrouter.ai/api/v1/key', { headers: { authorization: `Bearer ${env.OPENROUTER_API_KEY}` } });
    if ('error' in r) out.push({ step: 'OpenRouter', ok: false, detail: `Could not connect: ${r.error}` });
    else if (r.status !== 200) out.push({ step: 'OpenRouter', ok: false, detail: `${r.status}: ${short(r.text)}` });
    else {
      const d = (JSON.parse(r.text) as { data?: { limit_remaining?: number | null; is_free_tier?: boolean } }).data ?? {};
      // The account's real balance (bought credit minus what's been used), when OpenRouter tells us.
      const c = await probe(fetchFn, 'https://openrouter.ai/api/v1/credits', { headers: { authorization: `Bearer ${env.OPENROUTER_API_KEY}` } });
      let balance = '';
      if (!('error' in c) && c.status === 200) {
        const cd = (JSON.parse(c.text) as { data?: { total_credits?: number; total_usage?: number } }).data;
        if (cd && typeof cd.total_credits === 'number') balance = ` Account balance: $${Math.max(0, cd.total_credits - (cd.total_usage ?? 0)).toFixed(2)}.`;
      }
      out.push({
        step: 'OpenRouter',
        ok: true,
        detail:
          `Key works.${balance}` +
          (d.is_free_tier ? ' No credit bought yet, so only free models (weaker, small daily limit) — buy a few dollars at openrouter.ai → Credits for the good ones.' : '') +
          (typeof d.limit_remaining === 'number' ? ` (This key's own spending cap has $${d.limit_remaining.toFixed(2)} left — that's a limit, not money.)` : ''),
      });
    }
  } else out.push({ step: 'OpenRouter (backup)', ok: false, detail: 'Not set up (optional): add OPENROUTER_API_KEY in Cloudflare.' });
  return out;
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

/** POST /api/diagnose */
export async function handleDiagnose(request: Request, env: GenerateEnv, deps: Pick<GenerateDeps, 'fetch'> = { fetch: (...a) => fetch(...a) }): Promise<Response> {
  const who = await verifyParent(request, env, deps.fetch);
  if (!who.ok) return json({ error: who.error }, who.status);
  return json({ checks: await diagnose(request, env, deps.fetch) });
}
