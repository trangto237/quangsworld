/**
 * Cloudflare Pages Function: /api/transcribe
 *   POST → { pages: string[] } — the text on each scanned page image, read by Gemini (parent account only).
 * Logic and tests live in server/transcribe.ts.
 */
import type { GenerateEnv } from '../../server/generate-core';
import { handleTranscribe } from '../../server/transcribe';

interface Ctx {
  request: Request;
  env: GenerateEnv;
}

export const onRequestPost = ({ request, env }: Ctx) => handleTranscribe(request, env);
