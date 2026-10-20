/**
 * "Test the AI connection" (parent only): checks each link the AI features use, from the server itself,
 * and reports what each one answered — so a setup problem can be pinned down without guessing.
 * Used by functions/api/diagnose.ts. Never returns keys.
 */
import { verifyParent, type GenerateDeps, type GenerateEnv } from './generate-core';

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
    const anon = env.SUPABASE_ANON_KEY ?? env.VITE_SUPABASE_ANON_KEY;
    if (sbUrl) {
      const region = env.GEMINI_RELAY_REGION?.trim() || 'us-east-1';
      const headers: Record<string, string> = { 'x-goog-api-key': key, 'x-region': region };
      if (anon) {
        headers.apikey = anon;
        if (anon.startsWith('eyJ')) headers.authorization = `Bearer ${anon}`;
      }
      const r2 = await probe(fetchFn, `${sbUrl}/functions/v1/gemini-relay?forceFunctionRegion=${region}&path=${encodeURIComponent('models?pageSize=5')}`, { headers });
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
      const d = (JSON.parse(r.text) as { data?: { limit_remaining?: number | null; is_free_tier?: boolean; usage?: number } }).data ?? {};
      out.push({
        step: 'OpenRouter',
        ok: true,
        detail: `Key works${d.is_free_tier ? ' (free tier: free models only, small daily limit)' : ''}${typeof d.limit_remaining === 'number' ? `, credit left: $${d.limit_remaining.toFixed(2)}` : ''}.`,
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
