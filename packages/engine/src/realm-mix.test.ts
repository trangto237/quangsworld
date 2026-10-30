import { describe, expect, it } from 'vitest';
import { newConceptState } from './mastery';
import { realmMixMission } from './planner';

describe('realm mix', () => {
  it('takes turns between islands, weakest topic of each island first', () => {
    const weak = { ...newConceptState('g2'), attempts: 5, mastery: 10 };
    const m = realmMixMission([['n1', 'n2'], ['a1'], ['g1', 'g2', 'g3']], '🎲 Maths', { g2: weak });
    expect(m.concepts[0]).toBe('n1');
    expect(m.concepts[1]).toBe('a1');
    expect(m.concepts[2]).toBe('g2');
    expect(new Set(m.concepts.slice(0, 3).map((c) => c[0]))).toEqual(new Set(['n', 'a', 'g']));
    expect([...m.concepts].sort()).toEqual(['a1', 'g1', 'g2', 'g3', 'n1', 'n2']);
    expect(m.duration).toBe(10);
  });
});
