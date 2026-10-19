import { describe, expect, it } from 'vitest';
import { isTypedAnswerCorrect, orderTokens } from '@atlas/shared';
import {
  GLOBAL_SUCCESS_9, autoImport, clozeQuestions, customUnit, detectFormat, orderQuestions, parseQuickImport, parseVocabLine, parseVocabList, splitSentences,
  PAGE_BREAK, splitByUnit, validateDraft, validateDrafts, vocabQuestions,
} from './importers';

const QUICK = `
1. She ___ to school every day.
A. go
*B. goes
C. going
D. gone

2. My brother is taller ___ me.
A. as
B. than *
C. then
D. that

3. If it rains, we ___ at home.
A. stay
B. will stay
C. would stay
D. stayed
Answer: B
`;

const VOCAB = `
Unit 7 vocabulary
cave (n): hang động
waterfall (n): thác nước
landscape (n): phong cảnh
breathtaking (adj): đẹp ngoạn mục
explore (v): khám phá
preserve (v): bảo tồn
`;

const PASSAGE = `Ha Long Bay is one of the most famous natural wonders in Vietnam. Thousands of limestone islands rise from the green water.
Visitors can explore the caves and enjoy the beautiful landscape. Many tourists take a boat trip around the bay every year.
However, pollution is a serious problem for the environment. Local people are working hard to protect the bay.
The government has also introduced new rules for tourism. Everyone should help to keep this wonderful place clean.`;

describe('textbook importers', () => {
  it('lists the 12 Global Success 9 units', () => {
    expect(GLOBAL_SUCCESS_9).toHaveLength(12);
    expect(GLOBAL_SUCCESS_9[6].title).toBe('Unit 7 · Natural wonders of the world');
    expect(new Set(GLOBAL_SUCCESS_9.map((u) => u.id)).size).toBe(12);
    expect(customUnit('  Đề cương Unit 3 ').id).toBe('doc-de-cuong-unit-3');
  });

  it('detects the format', () => {
    expect(detectFormat(QUICK)).toBe('quick');
    expect(detectFormat(VOCAB)).toBe('vocab');
    expect(detectFormat(PASSAGE)).toBe('text');
  });

  it('parses Quick Import with *, trailing * and "Answer:" lines', () => {
    const { drafts, issues } = parseQuickImport(QUICK);
    expect(issues).toEqual([]);
    expect(drafts).toHaveLength(3);
    expect(drafts.map((d) => d.options[d.answer])).toEqual(['goes', 'than', 'will stay']);
    expect(drafts[0].prompt).toBe('She ___ to school every day.');
  });

  it('reports Quick Import mistakes with line numbers', () => {
    const { drafts, issues } = parseQuickImport('1. No answer here\nA. one\nB. two\nC. three\n2. Two right\n*A. x\n*B. y\nC. z');
    expect(drafts).toHaveLength(0);
    expect(issues.map((i) => i.line)).toEqual([1, 5]);
    expect(issues[0].message).toMatch(/Mark the right option/);
    expect(issues[1].message).toMatch(/More than one/);
  });

  it('parses vocabulary lines in many shapes', () => {
    expect(parseVocabLine('cave (n): hang động')).toEqual({ term: 'cave', pos: 'n', meaning: 'hang động' });
    expect(parseVocabLine('explore /ɪkˈsplɔː/ (v): khám phá')).toEqual({ term: 'explore', pos: 'v', meaning: 'khám phá' });
    expect(parseVocabLine('take part in - tham gia')).toEqual({ term: 'take part in', pos: undefined, meaning: 'tham gia' });
    expect(parseVocabLine('brief: lasting a short time')?.meaning).toBe('lasting a short time');
    expect(parseVocabLine('eager\twanting very much')?.term).toBe('eager');
    expect(parseVocabLine('1. pollution (n.) – ô nhiễm')).toEqual({ term: 'pollution', pos: 'n', meaning: 'ô nhiễm' });
    expect(parseVocabLine('This is just a normal sentence about nature.')).toBeNull();
    const list = parseVocabList(VOCAB);
    expect(list).toHaveLength(6);
    expect(list.every((e) => e.vi)).toBe(true);
  });

  it('makes vocabulary questions with distractors from the list', () => {
    const qs = vocabQuestions(parseVocabList(VOCAB), 3);
    expect(qs.length).toBeGreaterThanOrEqual(12);
    for (const q of qs) {
      expect(q.part).toBe('vocabulary');
      if (q.type === 'mcq') {
        expect(q.options).toHaveLength(4);
        expect(new Set(q.options).size).toBe(4);
      }
    }
    const meaningQ = qs.find((q) => q.prompt === 'What does "cave" mean?')!;
    expect(meaningQ.options[meaningQ.answer]).toBe('hang động');
    expect(meaningQ.explanationVi).toContain('hang động');
    expect(vocabQuestions(parseVocabList('a: b\nc: d'))).toEqual([]);
  });

  it('splits sentences across PDF line breaks', () => {
    const s = splitSentences('Mr. Nam lives in Hà Nội.\nHe likes\nthe city. Does he?');
    expect(s).toEqual(['Mr. Nam lives in Hà Nội.', 'He likes the city.', 'Does he?']);
    // A heading without a full stop stays on its own instead of joining the first sentence.
    expect(splitSentences('Unit 7 Natural wonders of the world\nHa Long Bay is famous.')).toEqual(['Unit 7 Natural wonders of the world', 'Ha Long Bay is famous.']);
  });

  it('makes word-order items whose tiles rebuild the sentence', () => {
    const qs = orderQuestions(PASSAGE, 20, 1);
    expect(qs.length).toBeGreaterThanOrEqual(5);
    for (const q of qs) {
      expect(q.type).toBe('order');
      const { tokens, end } = orderTokens(q.options[0]);
      expect(tokens.length).toBeGreaterThanOrEqual(5);
      expect(tokens.length).toBeLessThanOrEqual(14);
      const rebuilt = tokens.join(' ').replace(/^./, (c) => c.toUpperCase()) + end;
      expect(isTypedAnswerCorrect({ options: q.options, answer: 0 }, rebuilt)).toBe(true);
    }
  });

  it('makes gap-fill questions that blank a word and never repeat it in the options', () => {
    const qs = clozeQuestions(PASSAGE, parseVocabList(VOCAB), 12, 1);
    expect(qs.length).toBeGreaterThanOrEqual(3);
    for (const q of qs) {
      expect(q.prompt).toContain('___');
      const right = q.options[q.answer];
      expect(q.prompt.toLowerCase()).not.toMatch(new RegExp(`\\b${right}\\b`));
      expect(new Set(q.options).size).toBe(q.options.length);
    }
  });

  it('autoImport is deterministic and produces several kinds from free text', () => {
    const a = autoImport(PASSAGE);
    const b = autoImport(PASSAGE);
    expect(a.drafts).toEqual(b.drafts);
    expect(new Set(a.drafts.map((d) => d.type))).toEqual(new Set(['order', 'mcq']));
    expect(autoImport('Hi.').issues[0].message).toMatch(/Not enough/);
  });

  it('validation drops malformed drafts and keeps good ones', () => {
    const { drafts, dropped } = validateDrafts([
      { type: 'mcq', prompt: 'Q?', options: ['a', 'b', 'c', 'd'], answer: 2, difficulty: 9 },
      { type: 'mcq', prompt: 'Q2?', options: ['a', 'b', 'c'], answer: 5 },
      { type: 'mcq', prompt: 'Q3?', options: ['a', 'a', 'c'], answer: 0 },
      { type: 'order', prompt: 'Order', options: ['Too short'], answer: 0 },
      { type: 'input', prompt: 'Type', options: ['waterfall'], answer: 0, accept: ['water fall', 3] },
      { type: 'essay', prompt: 'x', options: [] },
      null,
      { type: 'mcq', prompt: 'Q?', options: ['a', 'b', 'c', 'd'], answer: 2 },
    ]);
    expect(drafts).toHaveLength(2);
    expect(drafts[0].difficulty).toBe(5);
    expect(drafts[1].accept).toEqual(['water fall']);
    expect(dropped.map((d) => d.index)).toEqual([1, 2, 3, 5, 6, 7]);
    expect(validateDraft({ type: 'input', prompt: 'x', options: ['one two three four five six'], answer: 0 }).ok).toBe(false);
  });
});

describe('splitByUnit', () => {
  const para = (topic: string) => Array.from({ length: 8 }, (_, i) => `People in the ${topic} often talk about thing number ${i} with their friends and family.`).join(' ');
  const book = [
    'CONTENTS',
    'Unit 1 Local community 8',
    'Unit 2 City life 18',
    'Unit 3 Healthy living for teens 28',
    'Review 1 38',
    '',
    'UNIT 1 LOCAL COMMUNITY',
    'GETTING STARTED',
    para('community'),
    'Unit 1 Local community',
    para('village'),
    'UNIT 2 CITY LIFE',
    para('city'),
    'Unit 2 City life',
    para('metro'),
    'UNIT 3 HEALTHY LIVING FOR TEENS',
    para('gym'),
    'REVIEW 1',
    'Choose the best answer. ' + para('review'),
    'GLOSSARY',
    'Unit 1',
    'community (n): cộng đồng',
    'craft (n): nghề thủ công',
    'Unit 2',
    'metro (n): tàu điện ngầm',
  ].join('\n');

  it('finds each unit once, skipping the contents and review sections', () => {
    const units = splitByUnit(book);
    expect(units.map((u) => u.unit)).toEqual([1, 2, 3]);
    expect(units[0].text).toContain('village');
    expect(units[0].text).not.toContain('metro');
    expect(units[1].text).toContain('metro');
    expect(units[2].text).toContain('gym');
    expect(units[2].text).not.toContain('review');
    for (const u of units) expect(u.text).not.toMatch(/Healthy living for teens 28/);
  });

  it('returns nothing for a single page without unit headings', () => {
    expect(splitByUnit(para('school'))).toEqual([]);
  });
});

describe('splitByUnit, page by page (PDF or scan)', () => {
  // What OCR returned for a test scan: the big "UNIT 2" title on its first page was missed.
  const pages = [
    'CONTENTS\n\nUnit 1 Local community 8\nUnit 2 City life 18\nReview 1 28',
    'UNIT 1 LOCAL COMMUNITY\nGETTING STARTED\n\nMi and Nam live in a small community near the old market.',
    '8 Unit 1 Local community\n\nVOCABULARY\n\ncommunity (n): cộng đồng\nartisan (n): thợ thủ công',
    'GETTING STARTED\n\nLife in a big city is exciting but it can also be stressful.',
    '18 Unit 2 City life\n\nREADING\n\nThe new metro line has made public transport much more convenient.',
    'REVIEW 1\n\nChoose the best answer to complete each sentence.',
    'CITY LIFE\n\nThe second part of the city unit, found by its title only.',
    'GLOSSARY\n\nUnit 1\ncraft (n): nghề thủ công',
  ];
  it('uses page headers, unit titles and "Getting started" to find each unit', () => {
    const units = splitByUnit(pages.join(PAGE_BREAK));
    expect(units.map((u) => [u.unit, u.pages])).toEqual([
      [1, [2, 3, 8]],
      [2, [4, 5, 7]],
    ]);
    expect(units[1].text).toContain('Life in a big city');
    expect(units[0].text).toContain('nghề thủ công');
    expect(units.map((u) => u.text).join(' ')).not.toContain('Choose the best answer');
  });
});
