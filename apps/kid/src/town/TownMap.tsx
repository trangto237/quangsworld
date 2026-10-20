import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Bubble, Emoji, Flag, Ground, INK, NameTag, P, Tree, type Pt } from './iso';
import { Car, KINDS, Lake, Pitch, RiceField, house } from './buildings';

/**
 * The town: a 14×14-tile neighbourhood split by two roads each way into 3×3 blocks. Each world is a
 * building on a lot; the Exam Hall sits in the middle. Drawn in SVG, panned by scrolling (or dragging),
 * zoomed with the buttons or a pinch.
 */

export interface Spot {
  id: string;
  /** Building drawing: a world id, or 'exam-hall' | 'coach' | 'shop' | 'home'. */
  kind: string;
  /** Lot origin (tiles). */
  x: number;
  y: number;
  /** Lot size: 3×3 for a building, 6×6 for the Exam Hall. */
  lot: 3 | 6;
}

/** Where the building stands inside its lot, and its size. */
const footprint = (s: Spot) => (s.lot === 6 ? { bx: s.x + 1, by: s.y + 1, size: 4 } : { bx: s.x + 0.5, by: s.y + 0.5, size: 2 });

/**
 * Where everything stands. Blocks are 6×6 tiles with a road after each (roads on tiles 6 and 13);
 * block (bx, by) starts at tile (bx·7, by·7) and holds four 3×3 lots.
 */
export const SPOTS: Spot[] = [
  { id: 'word-forest', kind: 'word-forest', x: 0, y: 0, lot: 3 },
  { id: 'grammar-forge', kind: 'grammar-forge', x: 3, y: 0, lot: 3 },
  { id: 'sound-temple', kind: 'sound-temple', x: 0, y: 3, lot: 3 },
  { id: 'scholars-academy', kind: 'scholars-academy', x: 3, y: 3, lot: 3 },
  { id: 'ielts-tower', kind: 'ielts-tower', x: 7, y: 0, lot: 3 },
  { id: 'echo-caves', kind: 'echo-caves', x: 10, y: 0, lot: 3 },
  { id: 'reading-ruins', kind: 'reading-ruins', x: 7, y: 3, lot: 3 },
  { id: 'my-textbook', kind: 'my-textbook', x: 10, y: 3, lot: 3 },
  { id: 'coach', kind: 'coach', x: 14, y: 0, lot: 3 },
  { id: 'shop', kind: 'shop', x: 17, y: 0, lot: 3 },
  { id: 'home', kind: 'home', x: 14, y: 3, lot: 3 },
  { id: 'story-library', kind: 'story-library', x: 0, y: 7, lot: 3 },
  { id: 'logic-labyrinth', kind: 'logic-labyrinth', x: 3, y: 7, lot: 3 },
  { id: 'exam-hall', kind: 'exam-hall', x: 7, y: 7, lot: 6 },
  { id: 'number-citadel', kind: 'number-citadel', x: 14, y: 7, lot: 3 },
  { id: 'algebra-peaks', kind: 'algebra-peaks', x: 17, y: 7, lot: 3 },
  { id: 'geometry-isles', kind: 'geometry-isles', x: 14, y: 10, lot: 3 },
];

export interface SpotState {
  /** 0 not started … 4 complete. */
  level: number;
  title: string;
  sub?: string;
  icon: string;
  color: string;
  /** Reviews due here. */
  due?: number;
  /** Today's next quest is here. */
  quest?: boolean;
  /** Hidden (e.g. My Textbook before anything is imported): an ordinary house stands there. */
  hidden?: boolean;
}

const N = 20;
const MARGIN = 2;
const ROADS = [6, 13];
const VIEW = { x: -745, y: -200, w: 1490, h: 930 };

/** Screen point (in map pixels) of a spot's centre, for centring the view. */
export const spotCenter = (s: Spot): Pt => {
  const [x, y] = P(s.x + s.lot / 2, s.y + s.lot / 2);
  return [x - VIEW.x, y - VIEW.y - 40];
};

/** Level from stars earned out of the possible stars. */
export const levelFor = (got: number, total: number) =>
  total <= 0 || got <= 0 ? 0 : got >= total ? 4 : got / total >= 2 / 3 ? 3 : got / total >= 1 / 3 ? 2 : 1;

function GroundAndRoads() {
  const tiles: ReactNode[] = [];
  for (let x = -MARGIN; x < N + MARGIN; x++)
    for (let y = -MARGIN; y < N + MARGIN; y++) {
      if (ROADS.includes(x) || ROADS.includes(y)) continue;
      tiles.push(<Ground key={`${x},${y}`} x={x} y={y} w={1} d={1} fill={(x + y) % 2 ? 'var(--grass)' : 'var(--grass-2)'} />);
    }
  const roads: ReactNode[] = [];
  for (const r of ROADS) {
    roads.push(<Ground key={`rx${r}`} x={r} y={-MARGIN} w={1} d={N + 2 * MARGIN} fill="#9aa1a8" stroke={INK} sw={1.4} />);
    roads.push(<Ground key={`ry${r}`} x={-MARGIN} y={r} w={N + 2 * MARGIN} d={1} fill="#9aa1a8" stroke={INK} sw={1.4} />);
  }
  const dashes: ReactNode[] = [];
  for (const r of ROADS) {
    const a = P(r + 0.5, -MARGIN);
    const b = P(r + 0.5, N + MARGIN);
    const c = P(-MARGIN, r + 0.5);
    const d = P(N + MARGIN, r + 0.5);
    dashes.push(<line key={`dx${r}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#f4f1e8" strokeWidth={2} strokeDasharray="10 10" />);
    dashes.push(<line key={`dy${r}`} x1={c[0]} y1={c[1]} x2={d[0]} y2={d[1]} stroke="#f4f1e8" strokeWidth={2} strokeDasharray="10 10" />);
  }
  const crossings = ROADS.flatMap((rx) => ROADS.map((ry) => <Ground key={`c${rx}${ry}`} x={rx} y={ry} w={1} d={1} fill="#9aa1a8" />));
  return (
    <g>
      <Ground x={-MARGIN - 0.3} y={-MARGIN - 0.3} w={N + 2 * MARGIN + 0.6} d={N + 2 * MARGIN + 0.6} fill="var(--grass-2)" stroke={INK} sw={2.5} />
      {tiles}
      {roads}
      {dashes}
      {crossings}
    </g>
  );
}

/** Flat decorations (drawn first: nothing stands behind them). */
function FlatDecor() {
  return (
    <g>
      <Lake x={17.2} y={3.2} w={2.6} d={2.6} />
      <RiceField x={0} y={14} w={6} d={6} />
      <Pitch x={7.4} y={14.6} w={5.2} d={3.4} />
    </g>
  );
}

/** Things that stand up (houses, trees): drawn in depth order with the buildings. */
const STANDING: { key: string; depth: number; node: ReactNode }[] = [
  ...(
    [
      [0.5, 10.5, '#f6d7b0', '#c0583e', 1],
      [3.5, 10.5, '#d9e7f2', '#4b6fa8', 2],
      [17.5, 10.5, '#f3e6a8', '#5c8f4a', 1],
      [14.5, 14.5, '#f1c9c0', '#9b4a7a', 2],
      [17.5, 14.5, '#e7e0f5', '#5b55a8', 1],
      [14.5, 17.5, '#f6d7b0', '#c0583e', 2],
    ] as const
  ).map(([x, y, wall, roof, floors]) => ({ key: `h${x},${y}`, depth: x + y + 2.5, node: house(wall, roof, floors)(x, y, 0, '').el })),
  ...(
    [
      [8, 19, 'round'],
      [10, 19.3, 'pine'],
      [12, 19, 'round'],
      [18, 18, 'round'],
      [19, 19, 'pine'],
      [-1.4, 3, 'round'],
      [-1.2, 9.5, 'pine'],
      [-1.5, 16, 'pine'],
      [3, -1.4, 'round'],
      [10, -1.3, 'pine'],
      [16, -1.5, 'pine'],
      [21.2, 3, 'round'],
      [21.4, 10, 'pine'],
      [21, 17, 'pine'],
      [3, 21.3, 'round'],
      [10, 21.2, 'pine'],
      [17, 21.4, 'pine'],
      [-1.3, 20.5, 'round'],
      [20.8, -1.2, 'pine'],
      [5.4, 2.6, 'round'],
      [12.6, 5.4, 'pine'],
      [2.6, 12.6, 'round'],
    ] as const
  ).map(([x, y, k]) => ({ key: `t${x},${y}`, depth: x + y, node: <Tree x={x} y={y} s={1.1} kind={k} color={k === 'pine' ? '#3f8f3a' : '#5aa845'} /> })),
];

function Cars() {
  return (
    <g>
      <Car x={6.35} y={2.3} color="#e8584a" along="y" />
      <Car x={13.35} y={9.8} color="#4b8fe2" along="y" />
      <Car x={16.6} y={6.35} color="#ffc23d" along="x" />
      <Car x={2.3} y={13.35} color="#5cb85c" along="x" />
    </g>
  );
}

/** Each lot is a slightly lighter plot of grass with a low outline. */
function Plot({ s }: { s: Spot }) {
  return <Ground x={s.x + 0.15} y={s.y + 0.15} w={s.lot - 0.3} d={s.lot - 0.3} fill="var(--plot)" stroke={INK} sw={1} />;
}

function Flowers({ s }: { s: Spot }) {
  const at: [number, number, string][] = [
    [0.35, s.lot - 0.35, '#ff8fb1'],
    [s.lot - 0.35, 0.35, '#ffd23d'],
    [s.lot - 0.4, s.lot - 0.4, '#ff8fb1'],
  ];
  return (
    <g>
      {at.map(([dx, dy, c], i) => {
        const [x, y] = P(s.x + dx, s.y + dy);
        return (
          <g key={i}>
            <circle cx={x} cy={y - 4} r={6} fill="#5aa845" stroke={INK} strokeWidth={1.2} />
            <circle cx={x - 2} cy={y - 6} r={1.8} fill={c} />
            <circle cx={x + 2.5} cy={y - 4} r={1.8} fill={c} />
          </g>
        );
      })}
    </g>
  );
}

const SERVICE = ['exam-hall', 'coach', 'shop', 'home'];

function drawingFor(s: Spot, st: SpotState) {
  const kind = st.hidden ? house('#efe6d6', '#8a6b4a') : s.kind === 'home' ? house('#ffe3a3', '#e8584a', 2) : KINDS[s.kind];
  const { bx, by } = footprint(s);
  return kind(bx, by, st.level, st.color);
}

/** The building itself with its growth extras (flowers, flag, sparkle, or scaffolding). */
function Body({ s, st, onOpen }: { s: Spot; st: SpotState; onOpen: () => void }) {
  const d = drawingFor(s, st);
  const top = P(...d.top);
  const faded = st.level === 0 && !st.hidden && !SERVICE.includes(s.kind);
  return (
    <g onClick={onOpen} style={{ cursor: 'pointer' }}>
      {/* Invisible hit area over the whole lot. */}
      <Ground x={s.x} y={s.y} w={s.lot} d={s.lot} fill="transparent" />
      <g filter={faded ? 'url(#town-faded)' : undefined}>{d.el}</g>
      {st.level >= 3 && <Flowers s={s} />}
      {st.level >= 2 && !st.hidden && !SERVICE.includes(s.kind) && <Flag x={d.top[0]} y={d.top[1]} z={d.top[2]} color={st.color} gold={st.level >= 4} />}
      {st.level >= 4 && (
        <Emoji at={[top[0] - 22, top[1] - 18]} size={16}>
          ✨
        </Emoji>
      )}
      {faded && (
        <Emoji at={[top[0] + 20, top[1] + 4]} size={18}>
          🏗️
        </Emoji>
      )}
    </g>
  );
}

/** Name tag, bubbles and the hero: drawn last so nothing covers them. Also a keyboard target. */
function Overlay({ s, st, onOpen, hero }: { s: Spot; st: SpotState; onOpen: () => void; hero?: string }) {
  if (st.hidden) return null;
  const d = drawingFor(s, st);
  const top = P(...d.top);
  const { bx, by, size } = footprint(s);
  const front = P(bx + size, by + size);
  const lift = st.level >= 2 && !st.hidden && !SERVICE.includes(s.kind) ? 26 : 0;
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={st.title}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen()}
      style={{ cursor: 'pointer', outline: 'none' }}
    >
      <Tags top={[top[0], top[1] - lift]} st={st} />
      {hero && (
        // The hero stands by the quest bubble (or by home when today's quests are done).
        <Emoji at={st.quest ? [top[0] - 62, top[1] - lift - 16] : [front[0] + 30, front[1] - 14]} size={26}>
          {hero}
        </Emoji>
      )}
      <NameTag at={[front[0], front[1] + 4]} icon={st.icon} title={st.title} sub={st.sub} color={st.color} />
    </g>
  );
}

function Tags({ top, st }: { top: Pt; st: SpotState }) {
  if (st.quest) return <Bubble at={[top[0], top[1] - 4]} text={st.due ? `⚔️ Quest · 🔁 ${st.due}` : '⚔️ Quest'} color="#e8584a" bob />;
  if (st.due) return <Bubble at={[top[0], top[1] - 4]} text={`🔁 ${st.due}`} color="#8b5cf6" />;
  return null;
}

export function TownMap({
  states,
  onOpen,
  focus,
  hero,
}: {
  states: Record<string, SpotState>;
  onOpen: (spot: Spot) => void;
  /** Spot to centre on at first. */
  focus?: string;
  /** Hero emoji, drawn next to the quest building (or home). */
  hero?: string;
}) {
  const spots = SPOTS.filter((s) => states[s.id]);
  const questSpot = spots.find((s) => states[s.id].quest) ?? spots.find((s) => s.id === 'home');
  const standing = [
    ...STANDING,
    ...spots.map((s) => {
      const { bx, by, size } = footprint(s);
      return { key: s.id, depth: bx + by + size, node: <Body s={s} st={states[s.id]} onOpen={() => onOpen(s)} /> };
    }),
  ].sort((a, b) => a.depth - b.depth);
  return (
    <Viewport focus={SPOTS.find((s) => s.id === focus) ?? SPOTS.find((s) => s.id === 'exam-hall')!}>
      <defs>
        <filter id="town-faded">
          <feColorMatrix type="saturate" values="0.25" />
        </filter>
      </defs>
      <GroundAndRoads />
      {spots.map((s) => (
        <Plot key={s.id} s={s} />
      ))}
      <FlatDecor />
      <Cars />
      {standing.map((d) => (
        <g key={d.key}>{d.node}</g>
      ))}
      {spots.map((s) => (
        <Overlay key={s.id} s={s} st={states[s.id]} onOpen={() => onOpen(s)} hero={s === questSpot ? hero : undefined} />
      ))}
    </Viewport>
  );
}

const MIN_Z = 0.5;
const MAX_Z = 1.6;

/** Scrollable, zoomable stage. Drag with the mouse, pinch on touch screens, or use the buttons. */
function Viewport({ children, focus }: { children: ReactNode; focus: Spot }) {
  const ref = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(() => (typeof window !== 'undefined' && window.innerWidth < 640 ? 0.95 : 1.1));
  const pending = useRef<{ cx: number; cy: number } | null>(null);
  const drag = useRef<{ x: number; y: number; sl: number; st: number; moved: boolean } | null>(null);
  const touches = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; zoom: number } | null>(null);

  // First paint: centre on the focus spot.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const [fx, fy] = spotCenter(focus);
    el.scrollLeft = fx * zoom - el.clientWidth / 2;
    el.scrollTop = fy * zoom - el.clientHeight / 2;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the middle of the screen in place when zooming.
  useLayoutEffect(() => {
    const el = ref.current;
    const p = pending.current;
    if (!el || !p) return;
    el.scrollLeft = p.cx * zoom - el.clientWidth / 2;
    el.scrollTop = p.cy * zoom - el.clientHeight / 2;
    pending.current = null;
  }, [zoom]);

  const zoomTo = (z: number) => {
    const el = ref.current;
    if (!el) return;
    const next = Math.max(MIN_Z, Math.min(MAX_Z, z));
    pending.current = { cx: (el.scrollLeft + el.clientWidth / 2) / zoom, cy: (el.scrollTop + el.clientHeight / 2) / zoom };
    setZoom(next);
  };

  return (
    <>
      <div
        ref={ref}
        className="fixed inset-0 overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ touchAction: 'pan-x pan-y', background: 'var(--grass-2)' }}
        onPointerDown={(e) => {
          if (e.pointerType === 'mouse') {
            drag.current = { x: e.clientX, y: e.clientY, sl: ref.current!.scrollLeft, st: ref.current!.scrollTop, moved: false };
          } else {
            touches.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
            if (touches.current.size === 2) {
              const [a, b] = [...touches.current.values()];
              pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom };
            }
          }
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (d && e.pointerType === 'mouse' && e.buttons === 1) {
            const dx = e.clientX - d.x;
            const dy = e.clientY - d.y;
            if (Math.abs(dx) + Math.abs(dy) > 6) d.moved = true;
            ref.current!.scrollLeft = d.sl - dx;
            ref.current!.scrollTop = d.st - dy;
          }
          if (touches.current.has(e.pointerId)) {
            touches.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
            const p = pinch.current;
            if (p && touches.current.size === 2) {
              const [a, b] = [...touches.current.values()];
              const z = p.zoom * (Math.hypot(a.x - b.x, a.y - b.y) / p.dist);
              if (Math.abs(z - zoom) > 0.03) zoomTo(z);
            }
          }
        }}
        onPointerUp={(e) => {
          touches.current.delete(e.pointerId);
          if (touches.current.size < 2) pinch.current = null;
          setTimeout(() => (drag.current = null), 0);
        }}
        onPointerCancel={(e) => {
          touches.current.delete(e.pointerId);
          pinch.current = null;
          drag.current = null;
        }}
        onClickCapture={(e) => {
          // A drag is not a tap on a building.
          if (drag.current?.moved) e.stopPropagation();
        }}
      >
        <svg
          viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
          width={VIEW.w * zoom}
          height={VIEW.h * zoom}
          className="block select-none"
          style={{ minWidth: VIEW.w * zoom, fontFamily: "'Baloo 2', Nunito, sans-serif" }}
          role="img"
          aria-label="Town map"
        >
          {children}
        </svg>
      </div>
      <div className="fixed left-2 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-2">
        <button onClick={() => zoomTo(zoom + 0.2)} className="town-btn grid size-10 place-items-center rounded-full bg-paper font-display text-2xl font-bold text-ink-text" aria-label="Zoom in">
          +
        </button>
        <button onClick={() => zoomTo(zoom - 0.2)} className="town-btn grid size-10 place-items-center rounded-full bg-paper font-display text-2xl font-bold text-ink-text" aria-label="Zoom out">
          −
        </button>
      </div>
    </>
  );
}
