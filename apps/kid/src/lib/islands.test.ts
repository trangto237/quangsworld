import { describe, expect, it } from 'vitest';
import { WORLDS } from '@atlas/knowledge';
import { ISLAND_GAMES, gameOf, placeOf } from './islands';

const m = (concepts: string[], extra: Partial<{ kind: 'learn' | 'review' | 'boss'; mode: 'race' }> = {}) => ({ id: 'x', concepts, kind: 'learn' as const, ...extra });

describe('island games', () => {
  it('knows which island a mission is on', () => {
    expect(placeOf(m(['en.vocab.synonyms']))).toBe('word-forest');
    expect(placeOf(m(['en.grammar.passive']))).toBe('grammar-forge');
  });

  it("plays the island's own game, dressed for it", () => {
    const g = gameOf(m(['en.vocab.synonyms']));
    expect(g.name).toBe('Pest Patrol');
    expect(g.mode).toBe('meteor');
    expect(g.dress?.falling?.ground.length).toBeGreaterThan(0);
    expect(gameOf(m(['en.pron.stress'])).name).toBe('Temple Run');
  });

  it('his own pick from the Arcade wins; a boss is always a duel', () => {
    expect(gameOf(m(['en.vocab.synonyms'], { mode: 'race' })).mode).toBe('race');
    expect(gameOf(m(['en.vocab.synonyms'], { kind: 'boss' })).mode).toBe('duel');
    expect(gameOf(m(['en.listening.details'], { kind: 'boss' })).dress?.boss).toBe('🦇');
  });

  it('every world except My Textbook has a game, and every game points at a real world', () => {
    for (const w of WORLDS) if (w.id !== 'my-textbook') expect(ISLAND_GAMES[w.id], w.id).toBeDefined();
    for (const id of Object.keys(ISLAND_GAMES)) expect(WORLDS.some((w) => w.id === id)).toBe(true);
  });
});
