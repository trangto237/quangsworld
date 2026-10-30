import { describe, expect, it } from 'vitest';
import { buildImportedExam, examSize, importedPaper, scriptLines } from './exam-import';
import { gradePaper } from './exams';

const RAW = {
  title: 'Hà Nội 2024',
  minutes: 60,
  sections: [
    {
      type: 'pronunciation',
      instructions: 'Choose the word whose underlined part is pronounced differently.',
      instructions_vi: '',
      passage: null,
      transcript: null,
      questions: [{ prompt: '', options: ['h[ea]d', 'br[ea]d', 'm[ea]t', 'h[ea]vy'], answer_index: 2, answer_text: 'm[ea]t', accept: [], answer_from: 'key', topic: '', explanation: '' }],
    },
    {
      type: 'grammar',
      instructions: 'Choose the best answer.',
      instructions_vi: 'Chọn đáp án đúng.',
      passage: null,
      transcript: null,
      questions: [
        { prompt: 'If I ___ you, I would study harder.', options: ['am', 'were', 'be', 'been'], answer_index: 1, answer_text: 'were', accept: [], answer_from: 'ai', topic: 'en.grammar.conditionals', explanation: '' },
        { prompt: 'Broken', options: ['a', 'b'], answer_index: 7, answer_text: 'zzz', accept: [], answer_from: 'key', topic: '', explanation: '' },
      ],
    },
    { type: 'writing', instructions: 'Write a paragraph about…', instructions_vi: '', passage: null, transcript: null, questions: [] },
    {
      type: 'cloze',
      instructions: 'Read and fill in the gaps.',
      instructions_vi: '',
      passage: 'Hà Nội is (1) ___ capital.',
      transcript: null,
      questions: [{ prompt: '(1)', options: ['a', 'an', 'the', 'no article'], answer_index: 2, answer_text: 'the', accept: [], answer_from: 'key', topic: '', explanation: '' }],
    },
  ],
};

describe('imported exam papers', () => {
  it('keeps usable questions, maps skills, and notes what was left out', () => {
    const e = buildImportedExam(RAW, { id: 'exam_1', kind: 'hn10', now: 1 });
    expect(e.name).toBe('Hà Nội 2024');
    expect(examSize(e)).toBe(3);
    expect(e.sections.map((s) => s.questions[0].conceptId)).toEqual(['en.pron.sounds', 'en.grammar.conditionals', 'en.exam.cloze']);
    expect(e.aiAnswered).toEqual(['exam_1#2']);
    expect(e.skipped[0]).toMatch(/writing/i);
    const cloze = e.sections[2];
    expect(cloze.setId).toBeTruthy();
    expect(cloze.questions[0].passage).toContain('capital');
  });

  it('marks out of 10 for Hà Nội papers', () => {
    const e = buildImportedExam(RAW, { id: 'exam_1', kind: 'hn10' });
    const qs = e.sections.flatMap((s) => s.questions);
    const g = gradePaper(importedPaper(e), { [qs[0].id]: 'm[ea]t', [qs[1].id]: 'were' }, 'ten');
    expect(g.correct).toBe(2);
    expect(g.score).toBeCloseTo((2 / 3) * 10, 1);
  });

  it('turns IELTS completion items into typed answers and needs a transcript for listening', () => {
    const e = buildImportedExam(
      {
        sections: [
          { type: 'ielts-listening', instructions: 'Part 1', passage: null, transcript: null, questions: [{ prompt: 'Name: ___', options: [], answer_index: -1, answer_text: 'Hughes', accept: [] }] },
          {
            type: 'ielts-listening',
            instructions: 'Part 2',
            passage: null,
            transcript: 'Woman: Good morning.\nMan: Hi, I want to book.\nWoman: Of course.',
            questions: [{ prompt: 'Surname: ___', options: [], answer_index: -1, answer_text: 'Hughes', accept: ['HUGHES'] }],
          },
        ],
      },
      { id: 'exam_2', kind: 'ielts-listening' },
    );
    expect(e.sections).toHaveLength(1);
    expect(e.skipped).toHaveLength(1);
    const q = e.sections[0].questions[0];
    expect(q.type).toBe('input');
    expect(q.script?.map((l) => l.who)).toEqual(['A', 'B', 'A']);
    expect(gradePaper(importedPaper(e), { [q.id]: 'hughes' }, 'ielts-listening').correct).toBe(1);
  });

  it('reads transcripts without speaker names as one voice', () => {
    expect(scriptLines('Welcome to the museum.\nIt has four floors.')).toEqual([{ who: 'C', text: 'Welcome to the museum. It has four floors.' }]);
  });

  it('keeps IELTS matching-headings questions with up to 8 headings', () => {
    const headings = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii'].map((n) => `Heading ${n}`);
    const e = buildImportedExam(
      { sections: [{ type: 'ielts-reading', passage: 'A  Text.', questions: [{ prompt: 'Section A', options: headings, answer_index: 6, answer_from: 'key' }] }] },
      { id: 'x', kind: 'ielts-reading' },
    );
    expect(e.sections[0].questions[0].options).toHaveLength(8);
    expect(e.sections[0].questions[0].answer).toBe(6);
  });

  it('refuses a paper with nothing usable', () => {
    expect(() => buildImportedExam({ sections: [] }, { id: 'x', kind: 'hn10' })).toThrow();
  });
});
