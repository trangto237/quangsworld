import { describe, expect, it } from 'vitest';
import { WORLDS } from '@atlas/knowledge';
import { REALMS } from '../lib/realms';
import { layoutFor } from './layouts';

describe('realm maps', () => {
  it('every world is in exactly one realm', () => {
    for (const w of WORLDS) expect(REALMS.filter((r) => r.places.includes(w.id)).length, w.id).toBe(1);
  });

  it('each realm, wide or tall, has all its places (home is a button, not an island)', () => {
    for (const r of REALMS)
      for (const tall of [false, true]) {
        const l = layoutFor(r.id, tall);
        expect(l.spots.some((s) => s.id === 'gate')).toBe(false);
        for (const p of r.places) expect(l.spots.some((s) => s.id === p), p).toBe(true);
      }
  });

  it('the English realm has no little scenery islets', () => {
    for (const tall of [false, true]) expect(layoutFor('english', tall).isles.filter((i) => i.small)).toEqual([]);
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

  it('wide realms spread out to the shape of the screen, without overlapping', () => {
    for (const r of REALMS) {
      const base = layoutFor(r.id);
      const wide = layoutFor(r.id, false, 4.5);
      expect(wide.view.w / wide.view.h, r.id).toBeGreaterThanOrEqual(base.view.w / base.view.h);
      expect(wide.view.w / wide.view.h, r.id).toBeLessThanOrEqual(4.5);
      for (let i = 0; i < wide.isles.length; i++)
        for (let j = i + 1; j < wide.isles.length; j++) {
          const [a, b] = [wide.isles[i], wide.isles[j]];
          expect(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.d <= b.y || b.y + b.d <= a.y, `${r.id}: ${a.id} / ${b.id}`).toBe(true);
        }
    }
  });
});
