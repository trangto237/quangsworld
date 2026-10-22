import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { cx } from '@atlas/ui';

/**
 * The realms side by side: the current one fills the middle, its neighbours wait faintly at the sides.
 * Swipe (or use the arrows) to move between them. Pinch, the wheel or the +/− buttons zoom into the
 * current one; drag to look around when zoomed in; double-tap to zoom in or back out.
 */

export interface Slide {
  id: string;
  /** Background of the stage while this slide is in front. */
  sky: string;
  cls?: string;
}

const MIN_Z = 1;
const MAX_Z = 3.5;

export function Carousel<S extends Slide>({
  slides,
  index,
  onIndex,
  render,
  start,
}: {
  slides: S[];
  index: number;
  onIndex: (i: number) => void;
  /** Draws a slide, given whether it's in front, the stage size and the zoom. */
  render: (slide: S, opts: { front: boolean; size: { w: number; h: number }; zoom: number }) => ReactNode;
  /** Where a slide opens: a zoom, and a stage point to bring to the middle. */
  start?: (slide: S, size: { w: number; h: number }) => { z: number; at?: { x: number; y: number } };
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 390, h: 600 });
  const [measured, setMeasured] = useState(false);
  const [z, setZ] = useState(1);
  const [t, setT] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState(0);
  const [animating, setAnimating] = useState(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ kind: 'pan' | 'swipe' | 'pinch'; sx: number; sy: number; t0: { x: number; y: number }; z0: number; d0: number; m0: { x: number; y: number }; moved: boolean } | null>(null);
  const moved = useRef(false);
  const lastTap = useRef(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    setMeasured(true);
    return () => ro.disconnect();
  }, []);

  /** Whether he has zoomed or panned this slide himself (then a resize leaves his view alone). */
  const touched = useRef(false);
  // A new slide opens at its starting zoom (zoomed out unless it asks otherwise). Until he zooms or
  // pans himself, it follows the stage's size too (the window resized, or the first measure was off).
  useEffect(() => {
    touched.current = false;
  }, [index]);
  useEffect(() => {
    if (touched.current) return;
    const s0 = start && measured ? start(slides[index], size) : { z: 1 };
    const nz = Math.max(MIN_Z, Math.min(MAX_Z, s0.z));
    const at = s0.at ?? { x: size.w / 2, y: size.h / 2 };
    setZ(nz);
    setT(clamp(nz, { x: size.w / 2 - nz * at.x, y: size.h / 2 - nz * at.y }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, measured, size.w, size.h]);

  const clamp = (zz: number, tt: { x: number; y: number }) => ({
    x: Math.min(0, Math.max(size.w * (1 - zz), tt.x)),
    y: Math.min(0, Math.max(size.h * (1 - zz), tt.y)),
  });
  /** Zoom to zz keeping screen point m (relative to the stage) still. */
  const zoomAt = (zz: number, m: { x: number; y: number }, from = { z, t }) => {
    touched.current = true;
    const nz = Math.max(MIN_Z, Math.min(MAX_Z, zz));
    const p = { x: (m.x - from.t.x) / from.z, y: (m.y - from.t.y) / from.z };
    setZ(nz);
    setT(clamp(nz, { x: m.x - nz * p.x, y: m.y - nz * p.y }));
  };
  const local = (e: { clientX: number; clientY: number }) => {
    const r = ref.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const go = (i: number) => {
    if (i < 0 || i >= slides.length) return;
    setAnimating(true);
    onIndex(i);
    setTimeout(() => setAnimating(false), 350);
  };

  const onDown = (e: React.PointerEvent) => {
    if ((e.target as Element).closest('button')) return;
    pointers.current.set(e.pointerId, local(e));
    moved.current = false;
    const pts = [...pointers.current.values()];
    if (pts.length === 2) {
      const [a, b] = pts;
      gesture.current = { kind: 'pinch', sx: 0, sy: 0, t0: t, z0: z, d0: Math.hypot(a.x - b.x, a.y - b.y), m0: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, moved: true };
      setDrag(0);
    } else if (pts.length === 1) {
      const p = pts[0];
      gesture.current = { kind: z > 1.02 ? 'pan' : 'swipe', sx: p.x, sy: p.y, t0: t, z0: z, d0: 0, m0: p, moved: false };
    }
  };
  const onMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, local(e));
    const g = gesture.current;
    if (!g) return;
    const pts = [...pointers.current.values()];
    if (g.kind === 'pinch' && pts.length >= 2) {
      const [a, b] = pts;
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const nz = Math.max(MIN_Z, Math.min(MAX_Z, (g.z0 * d) / Math.max(1, g.d0)));
      const p = { x: (g.m0.x - g.t0.x) / g.z0, y: (g.m0.y - g.t0.y) / g.z0 };
      setZ(nz);
      setT(clamp(nz, { x: m.x - nz * p.x, y: m.y - nz * p.y }));
      moved.current = true;
      return;
    }
    const p = pts[0];
    const dx = p.x - g.sx;
    const dy = p.y - g.sy;
    if (Math.abs(dx) + Math.abs(dy) > 8) {
      g.moved = true;
      moved.current = true;
    }
    if (g.kind === 'pan') {
      touched.current = true;
      setT(clamp(z, { x: g.t0.x + dx, y: g.t0.y + dy }));
    } else if (g.kind === 'swipe' && g.moved) {
      // Resist at the ends.
      const edge = (index === 0 && dx > 0) || (index === slides.length - 1 && dx < 0);
      setDrag(edge ? dx / 3 : dx);
    }
  };
  const onUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    const g = gesture.current;
    if (g?.kind === 'swipe') {
      if (drag < -size.w * 0.18) go(index + 1);
      else if (drag > size.w * 0.18) go(index - 1);
      setAnimating(true);
      setDrag(0);
      setTimeout(() => setAnimating(false), 300);
      // Double-tap zooms in.
      if (!g.moved && e.pointerType !== 'mouse') {
        const now = Date.now();
        if (now - lastTap.current < 300) zoomAt(2.2, local(e));
        lastTap.current = now;
      }
    }
    if (pointers.current.size === 0) {
      gesture.current = null;
      if (z < 1.04) {
        setZ(1);
        setT({ x: 0, y: 0 });
      }
    } else if (pointers.current.size === 1) {
      const p = [...pointers.current.values()][0];
      gesture.current = { kind: 'pan', sx: p.x, sy: p.y, t0: t, z0: z, d0: 0, m0: p, moved: true };
    }
  };

  const slideX = (i: number) => (i - index) * Math.min(size.w * 0.72, size.h * 1.15) + drag;
  const visible = slides.map((s, i) => ({ s, i })).filter(({ i }) => Math.abs(i - index) <= 1);

  return (
    <div
      ref={ref}
      className={cx('absolute inset-0 overflow-hidden', slides[index]?.cls)}
      style={{ touchAction: 'none' }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onClickCapture={(e) => {
        // A swipe, pan or pinch is not a tap on a building.
        if (moved.current) {
          e.stopPropagation();
          moved.current = false;
        }
      }}
      onDoubleClick={(e) => (z > 1.02 ? (setZ(1), setT({ x: 0, y: 0 })) : zoomAt(2.2, local(e)))}
      onWheel={(e) => zoomAt(z * (e.deltaY < 0 ? 1.15 : 1 / 1.15), local(e))}
    >
      {visible.map(({ s, i }) => {
        const front = i === index;
        return (
          <div
            key={s.id}
            className={cx('absolute inset-0', s.cls)}
            style={{
              transform: `translateX(${slideX(i)}px) scale(${front ? 1 : 0.62})`,
              opacity: front ? 1 : 0.32,
              filter: front ? undefined : 'blur(1px) saturate(0.7)',
              transition: animating ? 'transform 0.32s ease, opacity 0.32s ease' : undefined,
              zIndex: front ? 2 : 1,
              pointerEvents: front ? undefined : 'none',
            }}
          >
            <div className="absolute inset-0 origin-top-left" style={{ transform: front ? `translate(${t.x}px, ${t.y}px) scale(${z})` : undefined }}>
              {render(s, { front, size, zoom: front ? z : 0.62 })}
            </div>
          </div>
        );
      })}
      {/* Arrows */}
      {index > 0 && (
        <button onClick={() => go(index - 1)} className="town-btn absolute left-2 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-paper text-2xl font-bold text-ink-text" aria-label="Previous">
          ‹
        </button>
      )}
      {index < slides.length - 1 && (
        <button onClick={() => go(index + 1)} className="town-btn absolute right-2 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-paper text-2xl font-bold text-ink-text" aria-label="Next">
          ›
        </button>
      )}
      <div className="absolute bottom-2 right-2 z-10 flex flex-col gap-2">
        <button onClick={() => zoomAt(z * 1.4, { x: size.w / 2, y: size.h / 2 })} className="town-btn grid size-10 place-items-center rounded-full bg-paper font-display text-2xl font-bold text-ink-text" aria-label="Zoom in">
          +
        </button>
        <button onClick={() => zoomAt(z / 1.4, { x: size.w / 2, y: size.h / 2 })} className="town-btn grid size-10 place-items-center rounded-full bg-paper font-display text-2xl font-bold text-ink-text" aria-label="Zoom out">
          −
        </button>
      </div>
    </div>
  );
}
