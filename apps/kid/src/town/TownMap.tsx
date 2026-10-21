import { useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { Bubble, Contact, Emoji, Flag, Ground, NameTag, P, ShadeDefs, Tree, type Pt } from './iso';
import { KINDS, house } from './buildings';
import { footprint, isleOf, layoutFor, spotCenter, type Isle, type Layout, type LayoutId, type Spot } from './layouts';
import { Builders, Chest, HazeDefs, LampGlowDef, NightContext, SkyLife, SkyTint, StopBadge, StreetLamps, useDayPhase, useReducedMotion, type ChestState } from './life';
import { Knight } from '../components/Knight';
import { Cloud, Crumble, IslandDefs, IslandBase, IslandCloud, RopeBridge, edgeToward } from './island';

/**
 * The hero's world: islands floating in the sky. The big island in the middle holds home, the shop,
 * Coach Owl and the Exam Hall; every learning world has an island of its own around it. Islands bob
 * gently; today's quests are joined to the middle by rope bridges. Drawn in SVG, panned by scrolling
 * (or dragging), zoomed with the buttons or a pinch.
 */

/** The hero knight as drawn on the map. */
export interface HeroLook {
  armour?: string;
  emblem: string;
  hat?: string;
  pet?: string;
}

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
  /** Hidden (e.g. My Textbook before anything is imported): nothing stands there. */
  hidden?: boolean;
  /** One line about the place, for its card. */
  blurb?: string;
  /** Never played here yet: the island sits in a cloud. */
  unexplored?: boolean;
  /** Today's path stops at this building (quest numbers, and whether each is done). */
  stops?: { n: number; done: boolean }[];
  /** Just grew a level (or was explored): builders and a celebration bubble. */
  grew?: string;
  /** Locked until a parent opens it (the Code Lab). */
  locked?: boolean;
}

export type { Spot };

/** Level from stars earned out of the possible stars. */
export const levelFor = (got: number, total: number) =>
  total <= 0 || got <= 0 ? 0 : got >= total ? 4 : got / total >= 2 / 3 ? 3 : got / total >= 1 / 3 ? 2 : 1;

/** The highlighted spot gets a glowing gold patch; the others a soft dirt patch. */
function Plot({ s, active }: { s: Spot; active: boolean }) {
  return active ? (
    <g>
      <Ground x={s.x - 0.1} y={s.y - 0.1} w={s.lot + 0.2} d={s.lot + 0.2} fill="#ffc23d" stroke="none" />
      <Ground x={s.x + 0.15} y={s.y + 0.15} w={s.lot - 0.3} d={s.lot - 0.3} fill="#fff1c4" stroke="#d48a00" sw={3} />
    </g>
  ) : (
    <Ground x={s.x + 0.3} y={s.y + 0.3} w={s.lot - 0.6} d={s.lot - 0.6} fill="var(--plot)" stroke="none" />
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
            <circle cx={x} cy={y - 4} r={6} fill="#5aa845" stroke="var(--ink)" strokeWidth={1.2} />
            <circle cx={x - 2} cy={y - 6} r={1.8} fill={c} />
            <circle cx={x + 2.5} cy={y - 4} r={1.8} fill={c} />
          </g>
        );
      })}
    </g>
  );
}

const SERVICE = ['exam-hall', 'coach', 'shop', 'home', 'gate', 'realm-english', 'realm-maths', 'realm-logic', 'realm-literature', 'arcade', 'writing'];

function drawingFor(s: Spot, st: SpotState) {
  const kind = s.kind === 'home' ? house('#ffe3a3', '#e8584a', 2) : KINDS[s.kind];
  const { bx, by } = footprint(s);
  return kind(bx, by, st.level, st.color);
}

interface Pointing {
  onTap: (e: MouseEvent) => void;
  onHover: (on: boolean) => void;
}

/** The building with its growth extras (flowers, flag, sparkle, or scaffolding). */
function Body({ s, st, tap }: { s: Spot; st: SpotState; tap: Pointing }) {
  const d = drawingFor(s, st);
  const fp = footprint(s);
  const top = P(...d.top);
  const faded = st.level === 0 && !SERVICE.includes(s.kind);
  return (
    <g
      onClick={tap.onTap}
      onPointerEnter={(e) => e.pointerType === 'mouse' && tap.onHover(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && tap.onHover(false)}
      style={{ cursor: 'pointer' }}
    >
      <Ground x={s.x} y={s.y} w={s.lot} d={s.lot} fill="transparent" />
      <Contact x={fp.bx - 0.2} y={fp.by - 0.2} w={fp.size + 0.4} d={fp.size + 0.4} />
      <g filter={(st.unexplored && !st.grew) || st.locked ? 'url(#town-mist)' : faded || (st.due && st.level > 0) ? 'url(#town-faded)' : undefined}>{d.el}</g>
      {st.level >= 3 && !st.unexplored && <Flowers s={s} />}
      {st.level >= 2 && !st.unexplored && !SERVICE.includes(s.kind) && <Flag x={d.top[0]} y={d.top[1]} z={d.top[2]} color={st.color} gold={st.level >= 4} />}
      {st.level >= 4 && !st.unexplored && (
        <Emoji at={[top[0] - 22, top[1] - 18]} size={16}>
          ✨
        </Emoji>
      )}
      {st.locked && (
        <Emoji at={[top[0], top[1] + 34]} size={34}>
          🔒
        </Emoji>
      )}
      {faded && !st.unexplored && !st.locked && (
        <Emoji at={[top[0] + 20, top[1] + 4]} size={18}>
          🏗️
        </Emoji>
      )}
      {st.grew && <Builders at={P(fp.bx + fp.size, fp.by + fp.size, 0)} />}
    </g>
  );
}

/** One floating island with everything on it, bobbing gently. */
function Island({ L, isle, states, active, tapFor, reduced, index }: { L: Layout; isle: Isle; states: Record<string, SpotState>; active: string | null; tapFor: (s: Spot) => Pointing; reduced: boolean; index: number }) {
  const shape = L.shapes[isle.id];
  const spots = L.spots.filter((s) => isle.spots.includes(s.id) && states[s.id] && !states[s.id].hidden);
  if (!isle.small && !isle.spots.some((id) => states[id] && !states[id].hidden)) return null;
  const solo = spots.length === 1 && isle.id !== 'hub' ? states[spots[0].id] : undefined;
  const cloudy = !!solo?.unexplored && !solo.grew;
  const hit = solo ? tapFor(spots[0]) : undefined;
  // Back trees on world islands (behind the building).
  const r = isle.seed;
  const trees = isle.small || isle.id === 'hub' ? [] : [
    [isle.x + 0.45, isle.y + 0.5 + (r % 3) * 0.6],
    [isle.x + 0.6 + ((r >> 2) % 3) * 0.7, isle.y + 0.4],
  ];
  const lifted = solo && active === spots[0].id;
  return (
    <g className={isle.cls} style={{ transform: `translateY(${-isle.lift - (lifted ? 6 : 0)}px)`, transition: 'transform 0.2s' }}>
      <g className={reduced ? undefined : 'isle-float'} style={{ animationDelay: `${-(index * 1.7) % 7}s`, animationDuration: `${5.5 + (index % 4) * 0.8}s` }}>
        <g
          onClick={hit?.onTap}
          onPointerEnter={(e) => hit && e.pointerType === 'mouse' && hit.onHover(true)}
          onPointerLeave={(e) => hit && e.pointerType === 'mouse' && hit.onHover(false)}
          style={{ cursor: hit ? 'pointer' : undefined }}
        >
          <IslandBase shape={shape} seed={isle.seed} falls={isle.falls} vines={!isle.small || isle.w > 2} />
        </g>
        {isle.decor?.(shape)}
        {trees.map(([x, y], i) => (
          <Tree key={i} x={x} y={y} s={0.9} kind={i ? 'round' : 'pine'} color={i ? '#5aa845' : '#3f8f3a'} />
        ))}
        {spots.map((s) => (
          <Plot key={`p${s.id}`} s={s} active={active === s.id} />
        ))}
        {[...spots]
          .sort((a, b) => a.x + a.y - (b.x + b.y))
          .map((s) => (
            <Body key={s.id} s={s} st={states[s.id]} tap={tapFor(s)} />
          ))}
        {solo && !!solo.due && !cloudy && solo.level > 0 && <Crumble shape={shape} />}
        {cloudy && <IslandCloud shape={shape} />}
      </g>
    </g>
  );
}

/** Name tag, bubbles and the hero: drawn last so nothing covers them. Also a keyboard target. */
function Overlay({ L, s, st, tap, onOpen, hero, active, dim }: { L: Layout; s: Spot; st: SpotState; tap: Pointing; onOpen: () => void; hero?: HeroLook; active: boolean; dim: boolean }) {
  if (st.hidden) return null;
  const d = drawingFor(s, st);
  const top = P(...d.top);
  const { bx, by, size } = footprint(s);
  const front = P(bx + size, by + size);
  const lift = (st.level >= 2 && !SERVICE.includes(s.kind) ? 26 : 0) + (active && !L.hubSpots.includes(s.id) ? 6 : 0);
  const isle = isleOf(L, s.id);
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
      style={{ cursor: 'pointer', outline: 'none', opacity: dim ? 0.45 : 1, transition: 'opacity 0.15s', transform: `translateY(${-isle.lift}px)` }}
    >
      {/* The hero rides in the quest bubble (or on home when today's quests are done), never over a name. */}
      <Tags top={[top[0], top[1] - lift]} st={st} hero={!!hero} />
      {hero && (
        <g className="town-bob" style={{ pointerEvents: 'none' }}>
          <Knight armour={hero.armour} emblem={hero.emblem} hat={hero.hat} box={{ x: front[0] - 92, y: front[1] - 62, w: 48, h: 60 }} />
          {hero.pet && (
            <text x={front[0] - 40} y={front[1] - 8} fontSize={18} textAnchor="middle" dominantBaseline="central">
              {hero.pet}
            </text>
          )}
        </g>
      )}
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

function Tags({ top, st, hero }: { top: Pt; st: SpotState; hero?: boolean }) {
  const at: Pt = [top[0], top[1] - 4];
  if (st.grew) return <Bubble at={at} text={st.grew} color="#f59e0b" bob />;
  if (st.locked) return <Bubble at={at} text="🔒 Locked" color="#64748b" />;
  if (st.quest) return <Bubble at={at} text={`⚔️ Quest${st.due ? ` · 🔁 ${st.due}` : ''}`} color="#e8584a" bob />;
  if (hero) return <Bubble at={at} text="🏠 Home" color="#f59e0b" />;
  if (st.due) return <Bubble at={at} text={`🔁 ${st.due} crumbling`} color="#8b5cf6" />;
  return null;
}

/** Sky colours for the time of day. */
const SKY = {
  day: ['var(--sky-top)', 'var(--sky-bottom)'],
  dusk: ['#f08a5d', '#fcd7a1'],
  night: ['#0b1736', '#22386e'],
} as const;

export function TownMap({
  states,
  onOpen,
  onSelect,
  selected,
  focus,
  hero,
  path = [],
  chest,
  layout = 'home',
}: {
  states: Record<string, SpotState>;
  onOpen: (spot: Spot) => void;
  /** Touch screens: the first tap selects (the screen shows its card), the second opens. */
  onSelect: (spot: Spot | null) => void;
  selected: string | null;
  /** Spot to centre on at first. */
  focus?: string;
  /** The hero knight, drawn next to the quest building (or home). */
  hero?: HeroLook;
  /** Today's path, in order (spot ids). */
  path?: string[];
  chest?: { state: ChestState; progress: string; onOpen: () => void };
  /** Home, or one realm's map. */
  layout?: LayoutId;
}) {
  const L = layoutFor(layout);
  const phase = useDayPhase();
  const reduced = useReducedMotion();
  const [hover, setHover] = useState<string | null>(null);
  const lastPointer = useRef<string>('mouse');
  const active = hover ?? selected;
  const spots = L.spots.filter((s) => states[s.id]);
  const questSpot = spots.find((s) => states[s.id].quest) ?? spots.find((s) => s.id === 'home' || s.id === 'gate');
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

  // Today's quests: a rope bridge from the middle island to each quest's island.
  const bridges = useMemo(() => {
    const out: { from: string; key: string; a: Pt; b: Pt; done: boolean }[] = [];
    const seen = new Set<string>();
    const hub = L.shapes.hub;
    path.forEach((id) => {
      const isle = L.isles.find((i) => i.spots.includes(id));
      if (!isle || isle.id === 'hub' || seen.has(isle.id)) return;
      seen.add(isle.id);
      const sh = L.shapes[isle.id];
      const a0 = edgeToward(hub, sh.center);
      const b0 = edgeToward(sh, hub.center);
      out.push({ from: isle.id, key: isle.id, a: a0, b: [b0[0], b0[1] - isle.lift], done: !!states[id]?.stops?.every((x) => x.done) });
    });
    return out;
  }, [path, states, L]);

  // Back to front; a bridge goes right after the farther of its two islands.
  const order = [...L.isles].sort((a, b) => a.x + a.w / 2 + a.y + a.d / 2 - (b.x + b.w / 2 + b.y + b.d / 2));
  const hubDepth = L.hub.x + L.hub.w / 2 + L.hub.y + L.hub.d / 2;
  const depthOf = (id: string) => {
    const i = L.isles.find((x) => x.id === id)!;
    return i.x + i.w / 2 + i.y + i.d / 2;
  };
  const layers: ReactNode[] = [];
  order.forEach((isle, i) => {
    layers.push(<Island key={isle.id} L={L} isle={isle} states={states} active={active} tapFor={tapFor} reduced={reduced} index={i} />);
    for (const br of bridges) {
      const after = depthOf(br.from) < hubDepth ? br.from : 'hub';
      if (after === isle.id) layers.push(<RopeBridge key={`b${br.key}`} a={br.a} b={br.b} done={br.done} />);
    }
    if (isle.id === 'hub' && chest && L.chest) layers.push(<Chest key="chest" x={L.chest[0]} y={L.chest[1]} state={chest.state} progress={chest.progress} onOpen={chest.onOpen} />);
  });

  // The highlighted spot's tag is drawn last, on top of the others.
  const overlays = [...spots].sort((a, b) => (a.id === active ? 1 : 0) - (b.id === active ? 1 : 0));
  return (
    <Viewport
      L={L}
      focus={L.spots.find((s) => s.id === focus) ?? L.spots.find((s) => s.id === L.start)!}
      onPointer={(t) => (lastPointer.current = t)}
      onBackground={() => onSelect(null)}
      sky={L.night ? SKY.night : SKY[phase]}
    >
      <NightContext.Provider value={phase === 'night' || !!L.night}>
        <defs>
          <filter id="town-faded">
            <feColorMatrix type="saturate" values="0.25" />
          </filter>
          <ShadeDefs />
          <IslandDefs />
          <LampGlowDef />
          <HazeDefs />
        </defs>
        <SkyLife view={L.view} phase={L.night ? 'night' : phase} reduced={reduced} />
        {layers}
        <g opacity={0.85}>
          <Cloud x={-560} y={640} s={1.3} />
          <Cloud x={620} y={700} s={1.1} />
        </g>
        {!L.night && <SkyTint phase={phase} view={L.view} />}
        <StreetLamps spots={L.lamps} glow={phase !== 'day'} />
        {overlays.map((s) => (
          <Overlay
            key={s.id}
            L={L}
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

/** Room above and below the map, so the hero bar and the bottom bars never hide the edge islands. */
const PAD_TOP = 150;
const PAD_BOTTOM = 200;
/** The middle of the part of the screen the bars leave free. */
const mid = (el: HTMLElement) => (el.clientHeight + PAD_TOP - PAD_BOTTOM) / 2;

const MIN_Z = 0.5;
const MAX_Z = 1.6;

/** Scrollable, zoomable stage. Drag with the mouse, pinch on touch screens, or use the buttons. */
function Viewport({ L, children, focus, onPointer, onBackground, sky }: { L: Layout; children: ReactNode; focus: Spot; onPointer: (type: string) => void; onBackground: () => void; sky: readonly [string, string] }) {
  const VIEW = L.view;
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
    const [fx, fy] = spotCenter(L, focus);
    el.scrollLeft = fx * zoom - el.clientWidth / 2;
    el.scrollTop = PAD_TOP + fy * zoom - mid(el);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Later focus changes (e.g. a building that just grew): glide there.
  const firstFocus = useRef(focus.id);
  useEffect(() => {
    const el = ref.current;
    if (!el || focus.id === firstFocus.current) return;
    firstFocus.current = focus.id;
    const [fx, fy] = spotCenter(L, focus);
    el.scrollTo({ left: fx * zoom - el.clientWidth / 2, top: PAD_TOP + fy * zoom - mid(el), behavior: 'smooth' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus.id]);

  // Keep the middle of the screen in place when zooming.
  useLayoutEffect(() => {
    const el = ref.current;
    const p = pending.current;
    if (!el || !p) return;
    el.scrollLeft = p.cx * zoom - el.clientWidth / 2;
    el.scrollTop = PAD_TOP + p.cy * zoom - mid(el);
    pending.current = null;
  }, [zoom]);

  const zoomTo = (z: number) => {
    const el = ref.current;
    if (!el) return;
    const next = Math.max(MIN_Z, Math.min(MAX_Z, z));
    pending.current = { cx: (el.scrollLeft + el.clientWidth / 2) / zoom, cy: (el.scrollTop + mid(el) - PAD_TOP) / zoom };
    setZoom(next);
  };

  return (
    <>
      <div
        ref={ref}
        className={`fixed inset-0 overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${L.cls ?? ''}`}
        style={{ touchAction: 'pan-x pan-y', background: `linear-gradient(${sky[0]}, ${sky[1]})` }}
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
        <div style={{ paddingTop: PAD_TOP, paddingBottom: `calc(${PAD_BOTTOM}px + env(safe-area-inset-bottom))`, width: 'max-content' }}>
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
