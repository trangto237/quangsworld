/**
 * The same turtle as the sandbox's, run here on our own reference drawings, so a lesson can compare his
 * drawing with the target shape line by line.
 */

export interface Turtle {
  forward(d: number): void;
  backward(d: number): void;
  right(a: number): void;
  left(a: number): void;
  penUp(): void;
  penDown(): void;
}

/** The lines a drawing makes, as [x1, y1, x2, y2] on the 400 × 400 page. */
export function trace(draw: (t: Turtle) => void): number[][] {
  const s = { x: 200, y: 200, h: 0, pen: true };
  const out: number[][] = [];
  const move = (d: number) => {
    const r = (s.h * Math.PI) / 180;
    const nx = s.x + Math.cos(r) * d;
    const ny = s.y + Math.sin(r) * d;
    if (s.pen) out.push([s.x, s.y, nx, ny]);
    s.x = nx;
    s.y = ny;
  };
  draw({
    forward: (d) => move(d),
    backward: (d) => move(-d),
    right: (a) => void (s.h = (s.h + a) % 360),
    left: (a) => void (s.h = (s.h - a) % 360),
    penUp: () => void (s.pen = false),
    penDown: () => void (s.pen = true),
  });
  return out;
}

const close = (a: number, b: number) => Math.abs(a - b) <= 1.5;
const sameSeg = (a: number[], b: number[]) =>
  (close(a[0], b[0]) && close(a[1], b[1]) && close(a[2], b[2]) && close(a[3], b[3])) || (close(a[0], b[2]) && close(a[1], b[3]) && close(a[2], b[0]) && close(a[3], b[1]));

/** How his drawing compares with the target: missing lines, extra lines. Zero-length lines are ignored. */
export function compareDrawings(mine: number[][], target: number[][]): { missing: number; extra: number } {
  const real = (l: number[]) => Math.hypot(l[2] - l[0], l[3] - l[1]) > 0.5;
  const a = mine.filter(real);
  const b = target.filter(real);
  const used = new Set<number>();
  let extra = 0;
  for (const l of a) {
    const i = b.findIndex((t, k) => !used.has(k) && sameSeg(l, t));
    if (i >= 0) used.add(i);
    // Drawing over a line already matched is fine (e.g. a spiral retracing); only new lines count as extra.
    else if (!b.some((t) => sameSeg(l, t))) extra++;
  }
  return { missing: b.length - used.size, extra };
}
