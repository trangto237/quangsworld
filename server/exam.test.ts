import { describe, expect, it, vi } from 'vitest';
import { EXAM_PROMPT, examTask, handleExam, parseExamRequest } from './exam';
import type { GenerateEnv } from './generate-core';

const ENV: GenerateEnv = { GEMINI_API_KEY: 'AIza-test', SUPABASE_URL: 'https://proj.supabase.co', SUPABASE_ANON_KEY: 'anon' };
const IMG = { mediaType: 'image/jpeg', data: 'aGVsbG8=' };
const EXAM = { title: 'Hà Nội 2024', minutes: 60, sections: [{ type: 'stress', instructions: 'Choose…', instructions_vi: 'Chọn…', passage: null, transcript: null, questions: [] }] };

function fakeFetch(family = 'parent-1') {
  return vi.fn(async (url: string | URL | Request) => {
    const u = String(url);
    if (u.includes('/auth/v1/user')) return new Response(JSON.stringify({ id: 'parent-1', is_anonymous: false }));
    if (u.includes('/rpc/atlas_my_family')) return new Response(JSON.stringify(family));
    return new Response(JSON.stringify({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(EXAM) }] } }] }));
  }) as unknown as typeof fetch;
}
const post = (body: unknown) => new Request('https://x/api/exam', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer tok' }, body: JSON.stringify(body) });

describe('exam paper import (server)', () => {
  it('checks the request', () => {
    expect(parseExamRequest({ images: [IMG] }).ok).toBe(false);
    expect(parseExamRequest({ kind: 'hn10' }).ok).toBe(false);
    expect(parseExamRequest({ kind: 'hn10', images: Array(29).fill(IMG) }).ok).toBe(false);
    expect(parseExamRequest({ kind: 'ielts-reading', images: [IMG, IMG], text: 'Passage 1' }).ok).toBe(true);
  });

  it('asks for answer keys and transcripts, and never to invent', () => {
    expect(EXAM_PROMPT).toMatch(/answer key/i);
    expect(EXAM_PROMPT).toMatch(/transcript/i);
    expect(EXAM_PROMPT).toMatch(/never invent/i);
  });

  it('only the family parent may use it, and the paper comes back', async () => {
    expect((await handleExam(post({ kind: 'hn10', images: [IMG] }), ENV, { fetch: fakeFetch('someone-else') })).status).toBe(403);
    const ok = await handleExam(post({ kind: 'hn10', images: [IMG] }), ENV, { fetch: fakeFetch() });
    expect(ok.status).toBe(200);
    expect(((await ok.json()) as { exam: { title: string } }).exam.title).toBe('Hà Nội 2024');
  });

  it('needs an AI key', async () => {
    const res = await handleExam(post({ kind: 'hn10', images: [IMG] }), { SUPABASE_URL: 'x', SUPABASE_ANON_KEY: 'y' }, { fetch: fakeFetch() });
    expect(res.status).toBe(503);
  });

  it('accepts a request to generate a new IELTS Reading test', () => {
    expect(parseExamRequest({ kind: 'hn10', generate: { types: ['tfng'] } }).ok).toBe(false);
    expect(parseExamRequest({ kind: 'ielts-reading', generate: { types: ['nonsense'] } }).ok).toBe(false);
    const r = parseExamRequest({ kind: 'ielts-reading', generate: { topic: '  coral   reefs ', level: 5, types: ['tfng', 'headings', 'tfng', 'completion', 'mc', 'endings'] } });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.req.generate).toEqual({ topic: 'coral reefs', level: 5, types: ['tfng', 'headings', 'completion', 'mc'] });
    expect(examTask(r.req)).toContain('coral reefs');
    expect(examTask(r.req)).toContain('TRUE');
  });
});
