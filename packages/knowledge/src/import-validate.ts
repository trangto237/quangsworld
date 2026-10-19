/**
 * Draft questions made from a family's textbook or document — by the offline importers or by Claude —
 * and the strict checks every draft must pass before it can become a game question.
 *
 * No imports on purpose: the Cloudflare Pages Function (functions/api/generate.ts) bundles this file too.
 */

/** Which part of the unit a question belongs to; each becomes its own playable mission. */
export type DraftPart = 'vocabulary' | 'grammar' | 'reading' | 'questions';

export interface DraftQuestion {
  type: 'mcq' | 'order' | 'input';
  part: DraftPart;
  prompt: string;
  /** mcq: 3–5 options; order: [the sentence]; input: [the answer]. */
  options: string[];
  /** Index of the correct option (always 0 for order/input). */
  answer: number;
  /** order/input: other accepted answers. */
  accept?: string[];
  explanation?: string;
  /** Vietnamese explanation, shown in the review for "English + help" mode. */
  explanationVi?: string;
  /** Short reading context for reading questions. */
  passage?: string;
  /** 1 (easy) … 5 (hard) */
  difficulty: number;
}

const PARTS: DraftPart[] = ['vocabulary', 'grammar', 'reading', 'questions'];
const TYPES = ['mcq', 'order', 'input'] as const;

const str = (v: unknown, max: number): string | null => {
  if (typeof v !== 'string') return null;
  const s = v.replace(/\s+/g, ' ').trim();
  return s && s.length <= max ? s : null;
};
const optStr = (v: unknown, max: number): string | undefined => (v == null || v === '' ? undefined : (str(v, max) ?? undefined));
const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

/**
 * Checks one draft. Returns the cleaned draft, or a reason it was dropped.
 * Rules are strict so a malformed item can never reach the game (e.g. an answer index out of range).
 */
export function validateDraft(raw: unknown): { ok: true; draft: DraftQuestion } | { ok: false; reason: string } {
  if (!raw || typeof raw !== 'object') return { ok: false, reason: 'not an object' };
  const r = raw as Record<string, unknown>;
  const type = TYPES.find((t) => t === r.type);
  if (!type) return { ok: false, reason: `unknown type "${String(r.type)}"` };
  const part = PARTS.find((p) => p === r.part) ?? (type === 'order' ? 'grammar' : 'questions');
  const prompt = str(r.prompt, 600);
  if (!prompt) return { ok: false, reason: 'missing or too long prompt' };
  if (!Array.isArray(r.options)) return { ok: false, reason: 'options must be a list' };
  const options = r.options.map((o) => str(o, 300));
  if (options.some((o) => o === null)) return { ok: false, reason: 'empty or too long option' };
  const opts = options as string[];
  const answer = typeof r.answer === 'number' && Number.isInteger(r.answer) ? r.answer : type === 'mcq' ? -1 : 0;
  const difficultyRaw = typeof r.difficulty === 'number' ? Math.round(r.difficulty) : 3;
  const difficulty = Math.min(5, Math.max(1, difficultyRaw));
  const accept = Array.isArray(r.accept) ? r.accept.map((a) => str(a, 200)).filter((a): a is string => !!a).slice(0, 6) : undefined;

  if (type === 'mcq') {
    if (opts.length < 3 || opts.length > 5) return { ok: false, reason: 'a multiple-choice question needs 3–5 options' };
    if (new Set(opts.map((o) => o.toLowerCase())).size !== opts.length) return { ok: false, reason: 'duplicate options' };
    if (answer < 0 || answer >= opts.length) return { ok: false, reason: 'answer is not one of the options' };
  } else if (type === 'order') {
    if (opts.length !== 1 || answer !== 0) return { ok: false, reason: 'an order question has exactly one sentence' };
    const n = words(opts[0]);
    if (n < 3 || n > 20) return { ok: false, reason: 'sentence must have 3–20 words' };
  } else {
    if (opts.length !== 1 || answer !== 0) return { ok: false, reason: 'a typed question has exactly one answer' };
    if (words(opts[0]) > 5) return { ok: false, reason: 'typed answers must be short (1–5 words)' };
  }
  return {
    ok: true,
    draft: {
      type,
      part,
      prompt,
      options: opts,
      answer: type === 'mcq' ? answer : 0,
      accept: accept?.length ? accept : undefined,
      explanation: optStr(r.explanation, 800),
      explanationVi: optStr(r.explanationVi ?? r.explanation_vi, 800),
      passage: optStr(r.passage, 4000),
      difficulty,
    },
  };
}

/** Validates a list; keeps the good drafts (deduplicated) and explains each one that was dropped. */
export function validateDrafts(list: unknown, max = 200): { drafts: DraftQuestion[]; dropped: { index: number; reason: string }[] } {
  const drafts: DraftQuestion[] = [];
  const dropped: { index: number; reason: string }[] = [];
  if (!Array.isArray(list)) return { drafts, dropped: [{ index: -1, reason: 'expected a list of questions' }] };
  const seen = new Set<string>();
  list.slice(0, max).forEach((raw, index) => {
    const v = validateDraft(raw);
    if (!v.ok) return dropped.push({ index, reason: v.reason });
    const key = `${v.draft.type}|${v.draft.prompt.toLowerCase()}|${v.draft.options[v.draft.answer].toLowerCase()}`;
    if (seen.has(key)) return dropped.push({ index, reason: 'duplicate question' });
    seen.add(key);
    drafts.push(v.draft);
  });
  return { drafts, dropped };
}
