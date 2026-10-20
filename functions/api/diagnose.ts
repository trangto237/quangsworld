/**
 * Cloudflare Pages Function: /api/diagnose
 *   POST → { checks: { step, ok, detail }[] } — tests each link the AI features use (parent account only).
 * Logic lives in server/diagnose.ts.
 */
import type { GenerateEnv } from '../../server/generate-core';
import { handleDiagnose } from '../../server/diagnose';

interface Ctx {
  request: Request;
  env: GenerateEnv;
}

export const onRequestPost = ({ request, env }: Ctx) => handleDiagnose(request, env);
