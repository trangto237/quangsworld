/**
 * gemini-relay — a Supabase Edge Function that passes requests on to Google's Gemini API.
 *
 * Why: Gemini refuses requests from some places ("User location is not supported"), and Cloudflare
 * may run the app's server code in such a place (e.g. Hong Kong for users in Vietnam). The app calls this
 * relay with the `x-region` header so it runs in a region Gemini serves (us-east-1 by default).
 *
 * It stores nothing and has no secrets of its own: the app's server sends its Gemini key in the
 * `x-goog-api-key` header, and only Gemini model requests are passed on. Turn "Verify JWT" OFF: newer
 * Supabase projects use publishable keys that aren't JWTs, and the relay is useless without a Gemini key.
 *
 * Deploy: Supabase dashboard → Edge Functions → Deploy a new function → Via editor → name it
 * `gemini-relay`, paste this file, Deploy. (Or: `supabase functions deploy gemini-relay`.)
 */
const GEMINI = 'https://generativelanguage.googleapis.com/v1beta/';
const ALLOWED = /^models(\?pageSize=\d+|\/[\w.-]+:generateContent)$/;

Deno.serve(async (req: Request) => {
  const json = (body: unknown, status: number) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
  const path = new URL(req.url).searchParams.get('path') ?? '';
  const key = req.headers.get('x-goog-api-key');
  if (!key) return json({ error: { message: 'Missing x-goog-api-key.' } }, 401);
  if (!ALLOWED.test(path)) return json({ error: { message: 'Only Gemini model requests are relayed.' } }, 400);
  const post = path.includes(':generateContent');
  const res = await fetch(GEMINI + path, {
    method: post ? 'POST' : 'GET',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
    body: post ? await req.text() : undefined,
  });
  return new Response(await res.text(), { status: res.status, headers: { 'content-type': 'application/json', 'x-relay-region': Deno.env.get('SB_REGION') ?? '' } });
});
