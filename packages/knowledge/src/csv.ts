import type { ConceptDef, Question } from '@atlas/shared';
import { hashString, rng, shuffle } from '@atlas/shared';

/** Minimal RFC-4180-ish CSV parser (quoted fields, escaped quotes, CRLF). */
export function parseCsv(text: string): string[][] {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? '';
  const delim = firstLine.includes('\t') ? '\t' : firstLine.includes(',') ? ',' : ';';
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delim) {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      if (row.some((f) => f.trim())) rows.push(row);
      row = [];
      field = '';
    } else field += ch;
  }
  row.push(field);
  if (row.some((f) => f.trim())) rows.push(row);
  return rows;
}

export interface FlashcardImport {
  concept: ConceptDef;
  questions: Question[];
  cards: { term: string; meaning: string }[];
}

/**
 * Turns a "term,meaning" CSV into a vocabulary concept plus multiple-choice
 * questions (both directions) whose distractors come from the other cards.
 * A header row (term/word,meaning/definition) is skipped automatically.
 */
export function flashcardsToConcept(csv: string, deckName: string): FlashcardImport {
  let rows = parseCsv(csv).filter((r) => r.length >= 2 && r[0].trim() && r[1].trim());
  if (rows.length && /^(term|word|front|từ)$/i.test(rows[0][0].trim())) rows = rows.slice(1);
  const cards = rows.map((r) => ({ term: r[0].trim(), meaning: r[1].trim() }));
  if (cards.length < 4) throw new Error('A flashcard deck needs at least 4 cards (term,meaning per line).');

  const slug = deckName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'deck';
  const id = `custom.${slug}.${hashString(csv).toString(36)}`;
  const concept: ConceptDef = {
    id,
    subject: 'english',
    domain: 'Vocabulary',
    skill: 'Family decks',
    name: deckName,
    missionName: `${deckName} Expedition`,
    description: `Imported flashcard deck (${cards.length} cards).`,
    lesson: 'Say each word aloud and make your own sentence with it.',
  };
  const r = rng(hashString(id));
  const questions: Question[] = [];
  cards.forEach((c, i) => {
    const others = shuffle(cards.filter((_, j) => j !== i), r).slice(0, 3);
    const len = c.term.length;
    const difficulty = Math.min(5, Math.max(1, Math.round(len / 3)));
    questions.push({
      id: `${id}#m${i}`,
      conceptId: id,
      difficulty,
      type: 'mcq',
      prompt: `What does "${c.term}" mean?`,
      options: [c.meaning, ...others.map((o) => o.meaning)],
      answer: 0,
      source: `Family upload: ${deckName}`,
    });
    questions.push({
      id: `${id}#t${i}`,
      conceptId: id,
      difficulty: Math.min(5, difficulty + 1),
      type: 'mcq',
      prompt: `Which word means "${c.meaning}"?`,
      options: [c.term, ...others.map((o) => o.term)],
      answer: 0,
      source: `Family upload: ${deckName}`,
    });
  });
  return { concept, questions, cards };
}
