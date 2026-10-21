/**
 * Cloudflare Pages Function: /api/exam
 *   POST → a real exam paper (page images) read by AI into questions with answers (parent account only).
 * Logic and tests live in server/exam.ts.
 */
import { handleExam } from '../../server/exam';
import type { GenerateEnv } from '../../server/generate-core';

interface Ctx {
  request: Request;
  env: GenerateEnv;
}

export const onRequestPost = ({ request, env }: Ctx) => handleExam(request, env);
