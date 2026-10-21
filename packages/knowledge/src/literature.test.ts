import { describe, expect, it } from 'vitest';
import { WRITING_PROMPTS, conceptsBySubject, questionsInSet, staticQuestions } from './index';

describe('Ngữ văn content', () => {
  const concepts = conceptsBySubject('literature');
  it('has the grade-9 topics, each with enough questions', () => {
    expect(concepts.length).toBeGreaterThanOrEqual(13);
    for (const c of concepts) expect(staticQuestions(c.id).length, c.id).toBeGreaterThanOrEqual(5);
  });
  it('every question has distinct options', () => {
    for (const c of concepts)
      for (const q of staticQuestions(c.id)) {
        expect(new Set(q.options).size, q.id).toBe(q.options.length);
        expect(q.options.length, q.id).toBeGreaterThanOrEqual(2);
      }
  });
  it('reading passages come with a set of questions, like the exam', () => {
    for (const id of ['lit-cadao', 'lit-kieu-xuan', 'lit-thu-dieu', 'lit-banh-troi', 'lit-story-ba', 'lit-essay-tuhoc', 'lit-info-hoguom']) {
      const qs = questionsInSet(id);
      expect(qs.length, id).toBeGreaterThanOrEqual(5);
      expect(new Set(qs.map((q) => q.passage)).size, id).toBe(1);
    }
  });
  it('writing prompts have a checklist and an outline', () => {
    expect(WRITING_PROMPTS.filter((p) => p.kind === 'nlvh').length).toBeGreaterThanOrEqual(3);
    expect(WRITING_PROMPTS.filter((p) => p.kind === 'nlxh').length).toBeGreaterThanOrEqual(3);
    for (const p of WRITING_PROMPTS) expect(p.checklist.length && p.outline.length, p.id).toBeTruthy();
  });
});
