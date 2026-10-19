/**
 * Turning a family's textbook pages or documents into game questions — offline, no AI.
 *
 * Three formats are recognised:
 *  - Quick Import: numbered questions with A–D options and the right one marked `*` (or "Answer: B").
 *  - Vocabulary lists: `word (n): meaning`, `word - nghĩa`, `word: definition`, tab/CSV.
 *  - Free text (a reading passage): sentences become Sentence Sprint (word-order) items, and known
 *    content words become gap-fill questions.
 */
import { glossaryLookup } from '@atlas/content';
import { hashString, rng, shuffle } from '@atlas/shared';
import { validateDrafts, type DraftPart, type DraftQuestion } from './import-validate';

export type { DraftPart, DraftQuestion } from './import-validate';
export { validateDraft, validateDrafts } from './import-validate';

// ── Textbook units ──────────────────────────────────────────────

export interface TextbookUnit {
  id: string;
  /** "Unit 7 · Natural wonders of the world" */
  title: string;
  vi: string;
}

/** Tiếng Anh 9 Global Success (Kết nối tri thức) — the 12 units of the grade-9 book. */
export const GLOBAL_SUCCESS_9: TextbookUnit[] = [
  ['Local community', 'Cộng đồng địa phương'],
  ['City life', 'Cuộc sống thành phố'],
  ['Healthy living for teens', 'Sống khỏe cho tuổi teen'],
  ['Remembering the past', 'Nhớ về quá khứ'],
  ['Our experiences', 'Trải nghiệm của chúng ta'],
  ['Vietnamese lifestyle: then and now', 'Lối sống Việt Nam: xưa và nay'],
  ['Natural wonders of the world', 'Kỳ quan thiên nhiên thế giới'],
  ['Tourism', 'Du lịch'],
  ['World Englishes', 'Các biến thể tiếng Anh'],
  ['Planet Earth', 'Hành tinh Trái Đất'],
  ['Electronic devices', 'Thiết bị điện tử'],
  ['Career choices', 'Lựa chọn nghề nghiệp'],
].map(([en, vi], i) => ({ id: `gs9-u${i + 1}`, title: `Unit ${i + 1} · ${en}`, vi: `Unit ${i + 1} · ${vi}` }));

/** A custom unit from a name the parent typed ("Oxford Unit 3"). */
export function customUnit(name: string): TextbookUnit {
  const clean = name.replace(/\s+/g, ' ').trim() || 'My document';
  const slug = clean.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'doc';
  return { id: `doc-${slug}`, title: clean, vi: clean };
}

export const PART_LABEL: Record<DraftPart, { en: string; emoji: string }> = {
  vocabulary: { en: 'Vocabulary', emoji: '🔤' },
  grammar: { en: 'Sentences & grammar', emoji: '🧩' },
  reading: { en: 'Reading', emoji: '📖' },
  questions: { en: 'Practice questions', emoji: '✏️' },
};

// ── Whole book → units ──────────────────────────────────────────

export interface BookSection {
  /** Unit number (1-based). */
  unit: number;
  text: string;
  /** Page numbers (1-based) when the text came page by page (PDF or scan). */
  pages?: number[];
}

/** Separates pages in text read from a PDF or a scan, so a book can be split page by page. */
export const PAGE_BREAK = '\n\f\n';

const UNIT_HEAD = /^[ \t]*(?:\d{1,3}[ \t]+)?UNIT[ \t]*(\d{1,2})\b/gim;
const OTHER_HEAD = /^[ \t]*(REVIEW[ \t]+\d|GLOSSARY|WORD ?LIST|TAPESCRIPTS?|AUDIO ?SCRIPTS?|ANSWER ?KEY|CONTENTS|BOOK MAP|IRREGULAR VERBS)\b/gim;
const UNIT_START = /^[ \t]*GETTING STARTED\b/im;

const letters = (s: string) => s.toLowerCase().normalize('NFD').replace(/[^a-z]/g, '');

/**
 * Splits a whole textbook into its units.
 *
 * Text that came page by page (PAGE_BREAK between pages) is split page by page, using every clue a
 * page offers, because OCR often misses the big decorative "UNIT 2" title on a unit's first page:
 * a "UNIT n" line (also the small page headers, e.g. "18 Unit 2 City life"), a line that is a unit's
 * title ("CITY LIFE"), or "GETTING STARTED" (each Global Success unit opens with it → next unit).
 * A contents page (several units named on one page) is skipped; Review, glossary and answer-key
 * pages are left out — but a per-unit glossary ("Unit 3" under GLOSSARY) joins its unit.
 *
 * Plain text without page breaks is split by "UNIT n" headings: consecutive headings with the same
 * number form a run, and runs too short to hold content (contents lines) are dropped.
 */
export function splitByUnit(text: string, maxUnit = 12, minChars = 400, titles: string[] = GLOBAL_SUCCESS_9.map((u) => u.title.split(' · ')[1])): BookSection[] {
  if (text.includes('\f')) return splitPages(text.split(/\n?\f\n?/), maxUnit, titles);
  const marks: { pos: number; unit: number | null }[] = [];
  for (const m of text.matchAll(UNIT_HEAD)) {
    const n = Number(m[1]);
    if (n >= 1 && n <= maxUnit) marks.push({ pos: m.index!, unit: n });
  }
  for (const m of text.matchAll(OTHER_HEAD)) marks.push({ pos: m.index!, unit: null });
  marks.sort((a, b) => a.pos - b.pos);
  const runs: { unit: number | null; start: number; end: number }[] = [];
  for (const m of marks) {
    const last = runs.at(-1);
    if (last && last.unit === m.unit) continue;
    if (last) last.end = m.pos;
    runs.push({ unit: m.unit, start: m.pos, end: text.length });
  }
  const byUnit = new Map<number, string[]>();
  for (const r of runs) {
    if (r.unit === null) continue;
    const chunk = text.slice(r.start, r.end).trim();
    if (chunk.length < minChars) continue;
    byUnit.set(r.unit, [...(byUnit.get(r.unit) ?? []), chunk]);
  }
  return [...byUnit.entries()].sort((a, b) => a[0] - b[0]).map(([unit, parts]) => ({ unit, text: parts.join('\n\n') }));
}

function splitPages(pages: string[], maxUnit: number, titles: string[]): BookSection[] {
  const titleKeys = titles.map(letters);
  /** Units named on a page, in order of appearance, and whether it starts another kind of section. */
  const clues = pages.map((page) => {
    const units: number[] = [];
    for (const line of page.split('\n')) {
      const m = line.match(/^[ \t]*(?:\d{1,3}[ \t]+)?UNIT[ \t]*(\d{1,2})\b/i);
      if (m && Number(m[1]) >= 1 && Number(m[1]) <= maxUnit) units.push(Number(m[1]));
      else {
        const key = letters(line);
        const t = key.length >= 5 && line.trim().length <= 60 ? titleKeys.findIndex((k, idx) => key === k || key === `unit${idx + 1}${k}`) : -1;
        if (t >= 0) units.push(t + 1);
      }
    }
    const other = /^[ \t]*(REVIEW[ \t]+\d|GLOSSARY|WORD ?LIST|TAPESCRIPTS?|AUDIO ?SCRIPTS?|ANSWER ?KEY|BOOK MAP|IRREGULAR VERBS)\b/im.test(page);
    const contents = /^[ \t]*(CONTENTS|BOOK MAP)\b/im.test(page) || new Set(units).size >= 3;
    return { units, other, contents, starts: UNIT_START.test(page) };
  });
  const byUnit = new Map<number, { text: string[]; pages: number[] }>();
  let current: number | null = null;
  let lastUnit = 0;
  let inBackMatter = false;
  clues.forEach((c, i) => {
    if (c.contents) return;
    if (c.other) {
      current = null;
      inBackMatter = /^[ \t]*(GLOSSARY|WORD ?LIST)\b/im.test(pages[i]);
    }
    if (c.units.length) {
      const named = c.units[0];
      // In the main part of the book units only go forward; a per-unit glossary at the back may go back.
      if (inBackMatter || named >= lastUnit) current = named;
    } else if (c.starts && !inBackMatter) current = Math.min(maxUnit, lastUnit + 1);
    if (current === null) return;
    if (!inBackMatter) lastUnit = Math.max(lastUnit, current);
    const entry = byUnit.get(current) ?? { text: [], pages: [] };
    entry.text.push(pages[i].trim());
    entry.pages.push(i + 1);
    byUnit.set(current, entry);
  });
  return [...byUnit.entries()]
    .filter(([, e]) => e.text.join('').length > 0)
    .sort((a, b) => a[0] - b[0])
    .map(([unit, e]) => ({ unit, text: e.text.join('\n\n'), pages: e.pages }));
}

// ── Detection ───────────────────────────────────────────────────

export type ImportFormat = 'quick' | 'vocab' | 'text';

const Q_LINE = /^\s*(?:Câu|Question|Q)?\s*(\d{1,3})\s*[.):]\s*(.*)$/i;
const OPT_LINE = /^\s*(\*)?\s*([A-Ea-e])\s*[.)]\s*(.+?)\s*(\*)?\s*$/;
const ANSWER_LINE = /^\s*(?:answer|ans|key|đáp án|dap an)\s*[:\-=]?\s*([A-Ea-e])\b/i;
const VI_CHARS = /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹáàãéèíìóòõúùýđ]/i;

/** Splits a vocabulary line into term / part of speech / meaning, or null. */
export function parseVocabLine(line: string): { term: string; pos?: string; meaning: string } | null {
  const l = line.replace(/^\s*(?:[-•*]|\d{1,3}[.)])\s*/, '').trim();
  if (!l || l.length > 220) return null;
  // word (n) /ipa/ : meaning   ·   word (n.): meaning   ·   word – meaning   ·   word = meaning   ·   word<TAB>meaning
  const m =
    l.match(/^([A-Za-z][A-Za-z' -]{0,40}?)\s*(?:\/[^/]{1,40}\/\s*)?\(([a-z.\s/]{1,10})\)\s*(?:\/[^/]{1,40}\/\s*)?[:=\-–—]?\s*(.+)$/) ??
    l.match(/^([A-Za-z][A-Za-z' -]{0,40}?)\s*(?:\/[^/]{1,40}\/\s*)?(?:\t|\s[:=–—-]\s|:\s|=)\s*(.+)$/);
  if (!m) {
    const csv = l.split(/[,;\t]/);
    if (csv.length === 2 && /^[A-Za-z][A-Za-z' -]{0,40}$/.test(csv[0].trim()) && csv[1].trim()) return { term: csv[0].trim(), meaning: csv[1].trim() };
    return null;
  }
  const [term, pos, meaning] = m.length === 4 ? [m[1], m[2], m[3]] : [m[1], undefined, m[2]];
  const t = term.trim();
  const mean = meaning.trim().replace(/^[:=\-–—]\s*/, '');
  if (!t || !mean || t.split(/\s+/).length > 5 || mean.length < 2) return null;
  return { term: t, pos: pos?.replace(/[.\s]/g, '') || undefined, meaning: mean };
}

/** Guesses what kind of text the parent pasted or uploaded. */
export function detectFormat(text: string): ImportFormat {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return 'text';
  const opts = lines.filter((l) => OPT_LINE.test(l)).length;
  const qs = lines.filter((l) => Q_LINE.test(l)).length;
  if (qs >= 1 && opts >= 3) return 'quick';
  const vocab = lines.filter((l) => parseVocabLine(l)).length;
  if (vocab >= 4 && vocab >= lines.length * 0.6) return 'vocab';
  return 'text';
}

// ── Quick Import ────────────────────────────────────────────────

export interface ImportIssue {
  line: number;
  message: string;
}

/**
 * Numbered multiple-choice questions:
 *   1. She ___ to school every day.
 *   A. go
 *   *B. goes        (or "B. goes *", or a line "Answer: B")
 */
export function parseQuickImport(text: string): { drafts: DraftQuestion[]; issues: ImportIssue[] } {
  const lines = text.split(/\r?\n/);
  const drafts: DraftQuestion[] = [];
  const issues: ImportIssue[] = [];
  type Block = { line: number; prompt: string[]; options: string[]; correct: number[] };
  let cur: Block | null = null;
  const flush = () => {
    if (!cur) return;
    const prompt = cur.prompt.join(' ').trim();
    if (!prompt) issues.push({ line: cur.line, message: 'Question has no text.' });
    else if (cur.options.length < 2) issues.push({ line: cur.line, message: 'Question needs at least 2 options (A., B., …).' });
    else if (cur.correct.length === 0) issues.push({ line: cur.line, message: 'Mark the right option with * (e.g. "*B. goes") or add "Answer: B".' });
    else if (new Set(cur.correct).size > 1) issues.push({ line: cur.line, message: 'More than one option is marked as right.' });
    else {
      const opts = cur.options;
      // Two options (True/False) are padded only if needed: the game needs at least 3.
      const padded = opts.length === 2 ? [...opts, opts.some((o) => /not given/i.test(o)) ? 'Not sure' : 'Not Given'] : opts;
      const v = validateDrafts([{ type: 'mcq', part: 'questions', prompt, options: padded, answer: cur.correct[0], difficulty: 3 }]);
      if (v.drafts.length) drafts.push(v.drafts[0]);
      else issues.push({ line: cur.line, message: v.dropped[0]?.reason ?? 'Invalid question.' });
    }
    cur = null;
  };
  lines.forEach((raw, i) => {
    const n = i + 1;
    const line = raw.trim();
    if (!line) return;
    const ans = line.match(ANSWER_LINE);
    if (ans && cur) {
      cur.correct.push(ans[1].toUpperCase().charCodeAt(0) - 65);
      return;
    }
    const opt = line.match(OPT_LINE);
    if (opt && cur) {
      const idx = opt[2].toUpperCase().charCodeAt(0) - 65;
      if (idx !== cur.options.length) issues.push({ line: n, message: `Option ${opt[2].toUpperCase()} is out of order.` });
      if (opt[1] || opt[4]) cur.correct.push(cur.options.length);
      cur.options.push(opt[3].replace(/\*\s*$/, '').trim());
      return;
    }
    const q = line.match(Q_LINE);
    if (q) {
      flush();
      cur = { line: n, prompt: [q[2]], options: [], correct: [] };
      return;
    }
    if (cur && cur.options.length === 0) cur.prompt.push(line);
    else if (!cur) issues.push({ line: n, message: 'Text before the first numbered question was ignored.' });
    else issues.push({ line: n, message: 'Unexpected line after the options was ignored.' });
  });
  flush();
  return { drafts, issues };
}

// ── Vocabulary lists ────────────────────────────────────────────

export interface VocabEntry {
  term: string;
  pos?: string;
  meaning: string;
  /** The meaning is Vietnamese. */
  vi: boolean;
}

export function parseVocabList(text: string): VocabEntry[] {
  const seen = new Set<string>();
  const out: VocabEntry[] = [];
  for (const line of text.split(/\r?\n/)) {
    const e = parseVocabLine(line);
    if (!e || /^(term|word|từ|từ vựng|vocabulary)$/i.test(e.term)) continue;
    const key = e.term.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ ...e, vi: VI_CHARS.test(e.meaning) });
  }
  return out;
}

const POS_NAME: Record<string, string> = { n: 'noun', v: 'verb', adj: 'adjective', a: 'adjective', adv: 'adverb', phr: 'phrase', 'phrv': 'phrasal verb', prep: 'preposition' };

/** Meaning questions in both directions, distractors from the same list (same part of speech first). */
export function vocabQuestions(entries: VocabEntry[], seed = 1): DraftQuestion[] {
  if (entries.length < 4) return [];
  const r = rng(seed);
  const raw: unknown[] = [];
  entries.forEach((e, i) => {
    const others = entries.filter((_, j) => j !== i);
    const samePos = e.pos ? others.filter((o) => o.pos === e.pos) : [];
    const pool = [...shuffle(samePos, r), ...shuffle(others.filter((o) => !samePos.includes(o)), r)];
    const pick = (key: 'term' | 'meaning') => {
      const out: string[] = [];
      for (const o of pool) {
        const v = o[key];
        if (out.length < 3 && v.toLowerCase() !== e[key].toLowerCase() && !out.some((x) => x.toLowerCase() === v.toLowerCase())) out.push(v);
      }
      return out;
    };
    const pos = e.pos ? ` (${POS_NAME[e.pos] ?? e.pos})` : '';
    const explanation = `"${e.term}"${pos} = ${e.meaning}.`;
    const difficulty = Math.min(5, Math.max(1, Math.round(e.term.length / 3)));
    const meanings = pick('meaning');
    const terms = pick('term');
    if (meanings.length === 3)
      raw.push({ type: 'mcq', part: 'vocabulary', prompt: `What does "${e.term}" mean?`, options: [e.meaning, ...meanings], answer: 0, explanation, explanationVi: e.vi ? `"${e.term}" nghĩa là ${e.meaning}.` : undefined, difficulty });
    if (terms.length === 3)
      raw.push({ type: 'mcq', part: 'vocabulary', prompt: `Which word means "${e.meaning}"?`, options: [e.term, ...terms], answer: 0, explanation, difficulty: Math.min(5, difficulty + 1) });
    // Spelling from the meaning: a short typed answer.
    if (!e.vi && e.term.split(/\s+/).length <= 3 && e.term.length >= 4)
      raw.push({ type: 'input', part: 'vocabulary', prompt: `Type the word that means "${e.meaning}". (${e.term[0]}…)`, options: [e.term], answer: 0, explanation, difficulty: Math.min(5, difficulty + 2) });
  });
  return validateDrafts(raw, 1000).drafts;
}

// ── Free text ───────────────────────────────────────────────────

const STOP = new Set(
  (
    'however therefore moreover around across along toward towards without within whether unless instead perhaps really people thing things something someone everyone anyone ' +
    'about above after again against all also although always among another because been before being below between both but cannot could does doing down during each every from further have having here into itself just more most much must never only other ought over same should since some such than that their theirs them then there these they this those through under until very were what when where which while whom whose will with would your yours yourself'
  ).split(' '),
);

/** Sentences of a passage, joined across line breaks (PDFs wrap lines). */
export function splitSentences(text: string): string[] {
  // A line break continues the sentence only when the next line starts in lower case (PDF wrapping);
  // otherwise it ends a segment, so headings like "Unit 7 Natural wonders" stay on their own.
  const segments = text
    .replace(/-\n(?=[a-z])/g, '')
    .replace(/[ \t]*\n\s*(?=[a-z(,])/g, ' ')
    .split(/(?<![.!?:])[ \t]*\n\s*/)
    .map((seg) => seg.replace(/\s+/g, ' ').trim());
  const parts = segments.flatMap((seg) => seg.match(/[^.!?]+(?:[.!?]+["”’)]?|$)/g) ?? []);
  return parts
    .map((s) => s.trim())
    .filter(Boolean)
    // Keep "Mr. Smith"-style abbreviations attached.
    .reduce<string[]>((acc, s) => {
      const prev = acc[acc.length - 1];
      if (prev && /\b(Mr|Mrs|Ms|Dr|St|e\.g|i\.e|etc|vs|No)\.$/i.test(prev)) acc[acc.length - 1] = `${prev} ${s}`;
      else acc.push(s);
      return acc;
    }, []);
}

const wordCount = (s: string) => s.split(/\s+/).filter(Boolean).length;
/** A clean sentence for word-order practice: 5–14 plain words, ends with . ? or ! */
const goodForOrder = (s: string) => {
  const n = wordCount(s);
  // A name at the start ("Ha Long Bay is…") would lose its capital on the first tile.
  const [first, second] = s.split(/\s+/);
  if (second && /^[A-Z]/.test(second) && first !== 'I') return false;
  return n >= 5 && n <= 14 && /^[A-Z"“]/.test(s) && /[.?!]$/.test(s) && !/[\d()[\]{}:;/\\|@#…]/.test(s) && !/["“”]/.test(s.slice(1, -1));
};

const suffixClass = (w: string) => (/(tion|sion|ment|ness|ity)$/.test(w) ? 'n' : /ly$/.test(w) ? 'adv' : /(ful|ous|ive|able|ible|al|ic|less)$/.test(w) ? 'adj' : /ing$/.test(w) ? 'ing' : /ed$/.test(w) ? 'ed' : /s$/.test(w) ? 's' : 'x');

/** Sentence Sprint items (put the words in order) from a passage. */
export function orderQuestions(text: string, max = 12, seed = 1): DraftQuestion[] {
  const sentences = [...new Set(splitSentences(text).filter(goodForOrder))];
  const picked = shuffle(sentences, rng(seed)).slice(0, max);
  return validateDrafts(
    picked.map((s) => {
      const n = wordCount(s);
      return {
        type: 'order',
        part: 'grammar',
        prompt: 'Put the words in the right order.',
        options: [s],
        answer: 0,
        explanation: `From the text: "${s}"`,
        explanationVi: `Câu trong bài: "${s}"`,
        difficulty: n <= 6 ? 1 : n <= 8 ? 2 : n <= 10 ? 3 : n <= 12 ? 4 : 5,
      };
    }),
  ).drafts;
}

/**
 * Gap-fill questions: a content word in a sentence is blanked. Targets are words from the vocabulary
 * list (if any) or words the glossary knows; distractors are other targets of the same word class.
 */
export function clozeQuestions(text: string, vocab: VocabEntry[] = [], max = 12, seed = 1): DraftQuestion[] {
  const sentences = splitSentences(text).filter((s) => wordCount(s) >= 6 && wordCount(s) <= 30 && /[.?!]$/.test(s));
  const listed = new Set(vocab.map((v) => v.term.toLowerCase()).filter((t) => !t.includes(' ')));
  const tokens = [...new Set(text.match(/\b[a-z]{4,}\b/g) ?? [])];
  const CONTENT = new Set(['n', 'v', 'adj', 'adv']);
  const isTarget = (w: string) => listed.has(w) || (w.length >= 5 && !STOP.has(w) && CONTENT.has(glossaryLookup(w)?.pos ?? ''));
  /** Word class: from the glossary when it knows the word, else from the suffix. */
  const classOf = (w: string) => glossaryLookup(w)?.pos ?? suffixClass(w);
  const targets = tokens.filter(isTarget);
  if (targets.length < 4) return [];
  const r = rng(seed);
  const used = new Set<string>();
  const raw: unknown[] = [];
  for (const s of shuffle(sentences, r)) {
    if (raw.length >= max) break;
    // Never the first word (its capital letter would give it away).
    const inSentence = (s.match(/[A-Za-z][a-z]{3,}/g) ?? []).filter((w, k) => k > 0 && w === w.toLowerCase() && isTarget(w) && !used.has(w));
    if (!inSentence.length) continue;
    const word = inSentence.sort((a, b) => Number(listed.has(b.toLowerCase())) - Number(listed.has(a.toLowerCase())) || b.length - a.length)[0];
    const lw = word.toLowerCase();
    const cls = classOf(lw);
    const lowerSentence = s.toLowerCase();
    const candidates = shuffle(targets.filter((t) => t !== lw && !new RegExp(`\\b${t}\\b`).test(lowerSentence)), r);
    const same = candidates.filter((t) => classOf(t) === cls);
    const distractors = [...same, ...candidates.filter((t) => !same.includes(t))].slice(0, 3);
    if (distractors.length < 3) continue;
    used.add(lw);
    const gloss = glossaryLookup(lw);
    const blanked = s.replace(new RegExp(`\\b${word}\\b`), '___');
    raw.push({
      type: 'mcq',
      part: 'reading',
      prompt: `Complete the sentence from the text: ${blanked}`,
      options: [lw, ...distractors],
      answer: 0,
      explanation: `The text says: "${s}"${gloss ? ` — ${lw} (${gloss.pos}): ${gloss.vi}` : ''}`,
      explanationVi: gloss ? `"${lw}" nghĩa là ${gloss.vi}.` : undefined,
      difficulty: Math.min(5, Math.max(2, Math.round(lw.length / 2.5))),
    });
  }
  return validateDrafts(raw).drafts;
}

// ── One call for the import screen ──────────────────────────────

export interface AutoImport {
  format: ImportFormat;
  drafts: DraftQuestion[];
  issues: ImportIssue[];
  vocab: VocabEntry[];
}

/**
 * Detects the format and makes every kind of offline question it can.
 * Seeded by the text, so the same document always gives the same questions.
 */
export function autoImport(text: string): AutoImport {
  const seed = hashString(text);
  const format = detectFormat(text);
  if (format === 'quick') {
    const { drafts, issues } = parseQuickImport(text);
    return { format, drafts, issues, vocab: [] };
  }
  if (format === 'vocab') {
    const vocab = parseVocabList(text);
    const issues: ImportIssue[] = vocab.length < 4 ? [{ line: 0, message: 'A word list needs at least 4 words.' }] : [];
    return { format, drafts: vocabQuestions(vocab, seed), issues, vocab };
  }
  // Free text may still contain a word list section (common in textbook pages): use both.
  const vocab = parseVocabList(text);
  const drafts = [...(vocab.length >= 4 ? vocabQuestions(vocab, seed) : []), ...orderQuestions(text, 12, seed), ...clozeQuestions(text, vocab, 12, seed)];
  const issues: ImportIssue[] = drafts.length ? [] : [{ line: 0, message: 'Not enough English sentences to make questions. Try a longer passage, a word list, or Quick Import format.' }];
  return { format, drafts, issues, vocab };
}
