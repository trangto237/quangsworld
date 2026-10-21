import { describe, expect, it } from 'vitest';
import { compareDrawings, trace } from './turtle';

const square = trace((t) => {
  for (let i = 0; i < 4; i++) (t.forward(100), t.right(90));
});

describe('turtle drawings', () => {
  it('draws a square of four lines that comes back to the start', () => {
    expect(square).toHaveLength(4);
    expect(square[3][2]).toBeCloseTo(200);
    expect(square[3][3]).toBeCloseTo(200);
  });
  it('a square drawn the other way round still matches', () => {
    const other = trace((t) => {
      for (let i = 0; i < 4; i++) (t.right(90), t.forward(100));
    });
    // Same square? No: starting by turning makes a different square (below, not above). It should NOT match.
    expect(compareDrawings(other, square).missing).toBeGreaterThan(0);
    const backwards = trace((t) => {
      t.forward(100);
      t.right(90);
      t.forward(100);
      t.right(90);
      t.forward(100);
      t.right(90);
      t.forward(100);
    });
    expect(compareDrawings(backwards, square)).toEqual({ missing: 0, extra: 0 });
  });
  it('notices missing and extra lines', () => {
    expect(compareDrawings(square.slice(0, 3), square)).toEqual({ missing: 1, extra: 0 });
    expect(compareDrawings([...square, [0, 0, 50, 50]], square)).toEqual({ missing: 0, extra: 1 });
  });
});
