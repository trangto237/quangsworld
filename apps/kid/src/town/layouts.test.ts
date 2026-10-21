import { describe, expect, it } from 'vitest';
import { WORLDS } from '@atlas/knowledge';
import { REALMS } from '../lib/realms';
import { layoutFor } from './layouts';

describe('realm maps', () => {
  it('every world is in exactly one realm', () => {
    for (const w of WORLDS) expect(REALMS.filter((r) => r.places.includes(w.id)).length, w.id).toBe(1);
  });

  it('each realm, wide or tall, has a gate and all its places', () => {
    for (const r of REALMS)
      for (const tall of [false, true]) {
        const l = layoutFor(r.id, tall);
        expect(l.spots.some((s) => s.id === 'gate')).toBe(true);
        for (const p of r.places) expect(l.spots.some((s) => s.id === p), p).toBe(true);
      }
  });

  it('tall realms are taller than wide ones', () => {
    const wide = layoutFor('english');
    const tall = layoutFor('english', true);
    expect(tall.view.h / tall.view.w).toBeGreaterThan(wide.view.h / wide.view.w);
  });

  it('islands on a map never overlap, and the view holds them all', () => {
    for (const [id, tall] of (['home', ...REALMS.map((r) => r.id)] as const).flatMap((id) => [[id, false], [id, true]] as const)) {
      const l = layoutFor(id, tall);
      const big = l.isles;
      for (let i = 0; i < big.length; i++)
        for (let j = i + 1; j < big.length; j++) {
          const a = big[i];
          const b = big[j];
          const apart = a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.d <= b.y || b.y + b.d <= a.y;
          expect(apart, `${id}${tall ? ' tall' : ''}: ${a.id} / ${b.id}`).toBe(true);
        }
      for (const isle of l.isles) {
        const s = l.shapes[isle.id];
        expect(s.apex[1] - isle.lift).toBeLessThan(l.view.y + l.view.h);
        for (const p of s.ring) expect(p[0] > l.view.x && p[0] < l.view.x + l.view.w).toBe(true);
      }
    }
  });
});
