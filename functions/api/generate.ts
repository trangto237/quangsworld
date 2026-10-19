/**
 * Cloudflare Pages Function: /api/generate
 *   GET  → { ai, missing } — is "Make questions with AI" available?
 *   POST → questions made by Claude from textbook material (parent account only).
 * Logic and tests live in server/generate-core.ts.
 */
import { handleGenerate, health, type GenerateEnv } from '../../server/generate-core';

interface Ctx {
  request: Request;
  env: GenerateEnv;
}

export const onRequestGet = ({ env }: Ctx) => new Response(JSON.stringify(health(env)), { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

export const onRequestPost = ({ request, env }: Ctx) => handleGenerate(request, env);
