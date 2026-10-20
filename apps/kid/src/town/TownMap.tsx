import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { Bubble, Emoji, Flag, Ground, INK, NameTag, P, Tree, type Pt } from './iso';
import { Car, KINDS, Lake, Pitch, RiceField, house } from './buildings';
import { Builders, Chest, Fog, HazeDefs, LampGlowDef, NightContext, PathTrail, SkyTint, StopBadge, StreetLamps, Traffic, Wear, useDayPhase, useReducedMotion, type ChestState } from './life';

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
  /** One line about the place, for its card. */
  blurb?: string;
  /** Never played here yet: fog covers it. */
  unexplored?: boolean;
  /** Today's path stops at this building (quest numbers, and whether each is done). */
  stops?: { n: number; done: boolean }[];
  /** Just grew a level (or was explored): builders and a celebration bubble. */
  grew?: string;
}

const N = 20;
const MARGIN = 2;
const ROADS = [6, 13];
/** Today's treasure chest: the crossroads south-east of the Exam Hall. */
const CHEST: [number, number] = [13.5, 13.5];
/** Street lamps along the roads. */
const LAMPS: [number, number][] = ROADS.flatMap((r) => [2.5, 10, 17.5].flatMap((t): [number, number][] => [[r - 0.15, t], [t, r - 0.15]]));
const VIEW = { x: -790, y: -230, w: 1580, h: 1000 };

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
      {/* Sandy beach, then the grass: the town is an island in the sea. */}
      <Ground x={-MARGIN - 1.1} y={-MARGIN - 1.1} w={N + 2 * MARGIN + 2.2} d={N + 2 * MARGIN + 2.2} fill="var(--sand)" stroke={INK} sw={2.5} />
      <Ground x={-MARGIN - 0.3} y={-MARGIN - 0.3} w={N + 2 * MARGIN + 0.6} d={N + 2 * MARGIN + 0.6} fill="var(--grass-2)" stroke={INK} sw={1.6} />
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

/** Each lot is a paved plot; the highlighted one glows gold. */
function Plot({ s, active }: { s: Spot; active: boolean }) {
  return active ? (
    <g>
      <Ground x={s.x - 0.1} y={s.y - 0.1} w={s.lot + 0.2} d={s.lot + 0.2} fill="#ffc23d" stroke="none" />
      <Ground x={s.x + 0.15} y={s.y + 0.15} w={s.lot - 0.3} d={s.lot - 0.3} fill="#fff1c4" stroke="#d48a00" sw={3} />
    </g>
  ) : (
    <Ground x={s.x + 0.15} y={s.y + 0.15} w={s.lot - 0.3} d={s.lot - 0.3} fill="var(--plot)" stroke={INK} sw={1.2} />
  );
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
interface Pointing {
  onTap: (e: MouseEvent) => void;
  onHover: (on: boolean) => void;
}

function Body({ s, st, active, tap }: { s: Spot; st: SpotState; active: boolean; tap: Pointing }) {
  const d = drawingFor(s, st);
  const fp = footprint(s);
  const top = P(...d.top);
  const faded = st.level === 0 && !st.hidden && !SERVICE.includes(s.kind);
  return (
    <g
      onClick={tap.onTap}
      onPointerEnter={(e) => e.pointerType === 'mouse' && tap.onHover(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && tap.onHover(false)}
      style={{ cursor: 'pointer', transform: active ? 'translateY(-5px)' : undefined, transition: 'transform 0.15s' }}
    >
      {/* Invisible hit area over the whole lot. */}
      <Ground x={s.x} y={s.y} w={s.lot} d={s.lot} fill="transparent" />
      <g filter={st.unexplored && !st.grew ? 'url(#town-mist)' : faded || (st.due && st.level > 0) ? 'url(#town-faded)' : undefined}>{d.el}</g>
      {st.level >= 3 && !st.unexplored && <Flowers s={s} />}
      {st.level >= 2 && !st.hidden && !st.unexplored && !SERVICE.includes(s.kind) && <Flag x={d.top[0]} y={d.top[1]} z={d.top[2]} color={st.color} gold={st.level >= 4} />}
      {st.level >= 4 && !st.unexplored && (
        <Emoji at={[top[0] - 22, top[1] - 18]} size={16}>
          ✨
        </Emoji>
      )}
      {faded && !st.unexplored && (
        <Emoji at={[top[0] + 20, top[1] + 4]} size={18}>
          🏗️
        </Emoji>
      )}
      {!!st.due && !st.unexplored && !st.grew && st.level > 0 && <Wear at={P(fp.bx + fp.size * 0.55, fp.by + fp.size, 18)} />}
      {st.unexplored && !st.grew && <Fog x={fp.bx} y={fp.by} size={fp.size} />}
      {st.grew && <Builders at={P(fp.bx + fp.size, fp.by + fp.size, 0)} />}
    </g>
  );
}

/** Name tag, bubbles and the hero: drawn last so nothing covers them. Also a keyboard target. */
function Overlay({ s, st, tap, onOpen, hero, active, dim }: { s: Spot; st: SpotState; tap: Pointing; onOpen: () => void; hero?: string; active: boolean; dim: boolean }) {
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
      onClick={tap.onTap}
      onPointerEnter={(e) => e.pointerType === 'mouse' && tap.onHover(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && tap.onHover(false)}
      onFocus={() => tap.onHover(true)}
      onBlur={() => tap.onHover(false)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen()}
      style={{ cursor: 'pointer', outline: 'none', opacity: dim ? 0.45 : 1, transition: 'opacity 0.15s' }}
    >
      {/* The hero rides in the quest bubble (or on home when today's quests are done), never over a name. */}
      <Tags top={[top[0], top[1] - lift]} st={st} hero={hero} />
      {!!st.stops?.length && (
        <StopBadge
          at={[top[0], top[1] - lift - (st.quest || st.due || hero || st.grew ? 50 : 14)]}
          label={st.stops.map((x) => x.n).join('·')}
          done={st.stops.every((x) => x.done)}
        />
      )}
      <g style={{ transform: active ? 'scale(1.18)' : undefined, transformOrigin: `${front[0]}px ${front[1] + 15}px`, transition: 'transform 0.15s' }}>
        <NameTag at={[front[0], front[1] + 4]} icon={st.icon} title={st.title} sub={st.sub} color={active ? '#ffc23d' : st.color} />
      </g>
    </g>
  );
}

function Tags({ top, st, hero }: { top: Pt; st: SpotState; hero?: string }) {
  const at: Pt = [top[0], top[1] - 4];
  if (st.grew) return <Bubble at={at} text={st.grew} color="#f59e0b" bob />;
  if (st.quest) return <Bubble at={at} text={`${hero ?? '⚔️'} Quest${st.due ? ` · 🔁 ${st.due}` : ''}`} color="#e8584a" bob />;
  if (hero) return <Bubble at={at} text={`${hero} Home`} color="#f59e0b" />;
  if (st.due) return <Bubble at={at} text={`🔁 ${st.due} fading`} color="#8b5cf6" />;
  return null;
}

export function TownMap({
  states,
  onOpen,
  onSelect,
  selected,
  focus,
  hero,
  path = [],
  chest,
}: {
  states: Record<string, SpotState>;
  onOpen: (spot: Spot) => void;
  /** Touch screens: the first tap selects (the screen shows its card), the second opens. */
  onSelect: (spot: Spot | null) => void;
  selected: string | null;
  /** Spot to centre on at first. */
  focus?: string;
  /** Hero emoji, drawn next to the quest building (or home). */
  hero?: string;
  /** Today's path, in order (spot ids). */
  path?: string[];
  chest?: { state: ChestState; progress: string; onOpen: () => void };
}) {
  const phase = useDayPhase();
  const reduced = useReducedMotion();
  const [hover, setHover] = useState<string | null>(null);
  const lastPointer = useRef<string>('mouse');
  const active = hover ?? selected;
  const spots = SPOTS.filter((s) => states[s.id]);
  const questSpot = spots.find((s) => states[s.id].quest) ?? spots.find((s) => s.id === 'home');
  const tapFor = (s: Spot): Pointing => ({
    onTap: (e) => {
      e.stopPropagation();
      if (states[s.id].hidden) return;
      // Mouse and keyboard open straight away; a touch first highlights, then opens on the second tap.
      if (lastPointer.current !== 'touch' || selected === s.id) onOpen(s);
      else onSelect(s);
    },
    onHover: (on) => setHover((h) => (on ? (states[s.id].hidden ? h : s.id) : h === s.id ? null : h)),
  });
  const standing = [
    ...STANDING,
    ...spots.map((s) => {
      const { bx, by, size } = footprint(s);
      return { key: s.id, depth: bx + by + size, node: <Body s={s} st={states[s.id]} active={active === s.id} tap={tapFor(s)} /> };
    }),
  ].sort((a, b) => a.depth - b.depth);
  // Today's path: from home, through each quest building in order, to the chest.
  const front = (id: string): Pt | null => {
    const sp = spots.find((x) => x.id === id);
    if (!sp) return null;
    const { bx, by, size } = footprint(sp);
    return P(bx + size, by + size);
  };
  const trail = [front('home'), ...path.map(front), chest ? P(CHEST[0], CHEST[1]) : null].filter((p, i, a): p is Pt => !!p && (i === 0 || p !== a[i - 1]));
  // The highlighted spot's tag is drawn last, on top of the others.
  const overlays = [...spots].sort((a, b) => (a.id === active ? 1 : 0) - (b.id === active ? 1 : 0));
  return (
    <Viewport
      focus={SPOTS.find((s) => s.id === focus) ?? SPOTS.find((s) => s.id === 'exam-hall')!}
      onPointer={(t) => (lastPointer.current = t)}
      onBackground={() => onSelect(null)}
    >
      <NightContext.Provider value={phase === 'night'}>
      <defs>
        <filter id="town-faded">
          <feColorMatrix type="saturate" values="0.25" />
        </filter>
        <LampGlowDef />
        <HazeDefs />
      </defs>
      <GroundAndRoads />
      {spots.map((s) => (
        <Plot key={s.id} s={s} active={active === s.id} />
      ))}
      <FlatDecor />
      <PathTrail points={trail} reduced={reduced} />
      {reduced ? <Cars /> : <Traffic roads={ROADS} from={-MARGIN} to={N + MARGIN - 1} />}
      {standing.map((d) => (
        <g key={d.key}>{d.node}</g>
      ))}
      {chest && <Chest x={CHEST[0]} y={CHEST[1]} state={chest.state} progress={chest.progress} onOpen={chest.onOpen} />}
      <SkyTint phase={phase} view={VIEW} />
      <StreetLamps spots={LAMPS} glow={phase !== 'day'} />
      {overlays.map((s) => (
        <Overlay
          key={s.id}
          s={s}
          st={states[s.id]}
          tap={tapFor(s)}
          onOpen={() => onOpen(s)}
          hero={s === questSpot ? hero : undefined}
          active={active === s.id}
          dim={!!active && active !== s.id}
        />
      ))}
      </NightContext.Provider>
    </Viewport>
  );
}

const MIN_Z = 0.5;
const MAX_Z = 1.6;

/** Scrollable, zoomable stage. Drag with the mouse, pinch on touch screens, or use the buttons. */
function Viewport({ children, focus, onPointer, onBackground }: { children: ReactNode; focus: Spot; onPointer: (type: string) => void; onBackground: () => void }) {
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

  // Later focus changes (e.g. a building that just grew): glide there.
  const firstFocus = useRef(focus.id);
  useEffect(() => {
    const el = ref.current;
    if (!el || focus.id === firstFocus.current) return;
    firstFocus.current = focus.id;
    const [fx, fy] = spotCenter(focus);
    el.scrollTo({ left: fx * zoom - el.clientWidth / 2, top: fy * zoom - el.clientHeight / 2, behavior: 'smooth' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus.id]);

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
        className="town-sea fixed inset-0 overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ touchAction: 'pan-x pan-y' }}
        onClick={() => !drag.current?.moved && onBackground()}
        onPointerDown={(e) => {
          onPointer(e.pointerType);
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
