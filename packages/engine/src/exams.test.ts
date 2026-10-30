import { describe, expect, it } from 'vitest';
import { PASSAGE_SETS, getQuestion, questionsInSet, promptKey } from '@atlas/knowledge';
import { rng } from '@atlas/shared';
import { EXAMS, assemblePaper, examById, gradePaper, ieltsBandFromRaw, isCorrectAnswer, paperQuestions } from './exams';

describe('exam content', () => {
  it('passage sets have the right number of questions', () => {
    for (const id of PASSAGE_SETS.cloze) expect(questionsInSet(id), id).toHaveLength(6);
    for (const id of PASSAGE_SETS['hn-reading']) expect(questionsInSet(id), id).toHaveLength(6);
    for (const id of PASSAGE_SETS['ielts-reading']) {
      // Generated passages give 13 or 14 questions, like one real IELTS passage.
      if (id.startsWith('ielts-g-')) expect(questionsInSet(id).length, id).toBeGreaterThanOrEqual(13), expect(questionsInSet(id).length, id).toBeLessThanOrEqual(14);
      else expect(questionsInSet(id), id).toHaveLength(13);
    }
    for (const [p1, p2] of PASSAGE_SETS['ielts-listening']) {
      expect(questionsInSet(p1)).toHaveLength(6);
      expect(questionsInSet(p2)).toHaveLength(4);
      expect(questionsInSet(p1).every((q) => q.type === 'input' && q.script?.length)).toBe(true);
    }
  });

  it('cloze questions each mark exactly their own gap', () => {
    for (const id of PASSAGE_SETS.cloze)
      questionsInSet(id).forEach((q, i) => {
        expect(q.passage!.match(/\[/g)).toHaveLength(1);
        expect(q.passage).toContain(`[(${i + 1}) ___]`);
      });
  });

  it('ordering questions list every letter exactly once in each option', () => {
    const arrange = Array.from({ length: 30 }, (_, i) => getQuestion(`en.exam.arrange#x${i + 1}`)).filter(Boolean);
    expect(arrange.length).toBeGreaterThanOrEqual(12);
    for (const q of arrange) {
      const letters = q!.passage!.split('\n').map((l) => l[0]);
      for (const o of q!.options) expect(o.split(' – ').sort()).toEqual([...letters].sort());
      expect(new Set(q!.options).size).toBe(q!.options.length);
    }
  });
});

describe('Exam Hall', () => {
  it('assembles a Hà Nội paper: 40 questions, no repeats, full passage sets', () => {
    const paper = assemblePaper(examById('hn10')!, { rand: rng(3) });
    const qs = paperQuestions(paper);
    expect(qs).toHaveLength(40);
    expect(new Set(qs.map(promptKey)).size).toBe(40);
    expect(paper.sections.map((s) => s.questions.length)).toEqual([2, 2, 8, 2, 2, 6, 6, 3, 5, 4]);
    expect(paper.setIds).toHaveLength(2);
  });

  it('prefers passages not used in earlier papers', () => {
    const first = assemblePaper(examById('hn10')!, { rand: rng(1) });
    const second = assemblePaper(examById('hn10')!, { rand: rng(2), usedSets: first.setIds });
    for (const id of second.setIds) expect(first.setIds).not.toContain(id);
  });

  it('IELTS minis: one reading passage (13) and one listening test (6 + 4)', () => {
    expect(paperQuestions(assemblePaper(examById('ielts-reading')!))).toHaveLength(13);
    const l = assemblePaper(examById('ielts-listening')!, { rand: rng(5) });
    expect(l.sections.map((s) => s.questions.length)).toEqual([6, 4]);
    expect(l.setIds[0].replace('-p1', '')).toBe(l.setIds[1].replace('-p2', ''));
  });

  it('grades out of 10 for Hà Nội and as a band for IELTS', () => {
    const paper = assemblePaper(examById('hn10')!, { rand: rng(4) });
    const all: Record<string, string> = {};
    paperQuestions(paper).forEach((q, i) => (all[q.id] = i % 4 === 0 ? 'wrong' : q.options[q.answer]));
    const g = gradePaper(paper, all);
    expect(g.correct).toBe(30);
    expect(g.score).toBe(7.5);
    expect(g.band).toBeNull();
    const ir = assemblePaper(examById('ielts-reading')!);
    const perfect = Object.fromEntries(paperQuestions(ir).map((q) => [q.id, q.options[q.answer]]));
    expect(gradePaper(ir, perfect).band).toBe(9);
  });

  it('accepts typed answers in any case and with alternatives', () => {
    const q = questionsInSet('ielts-l1-p1').find((x) => x.prompt.includes('Age'))!;
    expect(isCorrectAnswer(q, 'Fourteen')).toBe(true);
    expect(isCorrectAnswer(q, ' 14 ')).toBe(true);
    expect(isCorrectAnswer(q, '15')).toBe(false);
    const name = questionsInSet('ielts-l1-p1')[0];
    expect(isCorrectAnswer(name, 'hughes')).toBe(true);
    expect(isCorrectAnswer(name, 'Hughs')).toBe(false);
  });

  it('band tables are monotonic', () => {
    for (const k of ['reading', 'listening'] as const) {
      let last = 0;
      for (let raw = 0; raw <= 40; raw++) {
        const b = ieltsBandFromRaw(raw, k);
        expect(b).toBeGreaterThanOrEqual(last);
        last = b;
      }
    }
    expect(ieltsBandFromRaw(27, 'reading')).toBe(6.5);
    expect(EXAMS).toHaveLength(3);
  });
});
