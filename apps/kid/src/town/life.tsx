import { useContext, useEffect, useState, type ReactNode } from 'react';
import { NightContext } from './night';
import { Box, Emoji, INK, P, shade, type Pt } from './iso';

/**
 * What makes the town feel alive: day and night by the real clock, traffic and people, birds, today's
 * path with its treasure chest, fog over unexplored worlds, wear on worlds with reviews due, and builders
 * when a building grows. Movement uses SVG animation and is left out when the device asks for less motion.
 */

export type DayPhase = 'day' | 'dusk' | 'night';

export const phaseAt = (hour: number): DayPhase => (hour >= 19 || hour < 6 ? 'night' : hour >= 17 ? 'dusk' : 'day');

/** The time of day, checked every few minutes. */
export function useDayPhase(): DayPhase {
  // ?hour=21 previews another time of day.
  const forced = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('hour') : null;
  const [phase, setPhase] = useState(() => phaseAt(forced ? Number(forced) : new Date().getHours()));
  useEffect(() => {
    if (forced) return;
    const t = setInterval(() => setPhase(phaseAt(new Date().getHours())), 5 * 60_000);
    return () => clearInterval(t);
  }, [forced]);
  return phase;
}

/** True when the device asks for reduced motion. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    if (typeof matchMedia === 'undefined') return;
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

export { NightContext };
export const useNight = () => useContext(NightContext);

/** Moves its children from one ground point to another, forever. */
function Mover({ from, to, dur, delay = 0, children }: { from: [number, number]; to: [number, number]; dur: number; delay?: number; children: ReactNode }) {
  const a = P(...from);
  const b = P(...to);
  return (
    <g>
      <animateTransform attributeName="transform" type="translate" from="0 0" to={`${b[0] - a[0]} ${b[1] - a[1]}`} dur={`${dur}s`} begin={`-${delay}s`} repeatCount="indefinite" />
      {children}
    </g>
  );
}

function MiniCar({ x, y, along, color }: { x: number; y: number; along: 'x' | 'y'; color: string }) {
  const [w, d] = along === 'x' ? [0.5, 0.28] : [0.28, 0.5];
  return (
    <g>
      <Box x={x} y={y} w={w} d={d} h={6} color={color} />
      <Box x={x + (along === 'x' ? 0.1 : 0.04)} y={y + (along === 'x' ? 0.04 : 0.1)} w={along === 'x' ? 0.26 : 0.2} d={along === 'x' ? 0.2 : 0.26} h={5} z={6} color="#cfe8f5" />
    </g>
  );
}

/** Cars on both lanes of each road, people on the pavements, birds overhead. */
export function Traffic({ roads, from, to }: { roads: number[]; from: number; to: number }) {
  const cars = ['#e8584a', '#4b8fe2', '#ffc23d', '#5cb85c', '#f5f5f5', '#8b5cf6'];
  const out: ReactNode[] = [];
  roads.forEach((r, i) => {
    // Along y (road column r): one lane each way.
    out.push(
      <Mover key={`ya${r}`} from={[r + 0.12, from]} to={[r + 0.12, to]} dur={26 + i * 5} delay={i * 7}>
        <MiniCar x={r + 0.12} y={from} along="y" color={cars[i % cars.length]} />
      </Mover>,
      <Mover key={`yb${r}`} from={[r + 0.6, to]} to={[r + 0.6, from]} dur={31 + i * 3} delay={i * 11 + 4}>
        <MiniCar x={r + 0.6} y={to} along="y" color={cars[(i + 2) % cars.length]} />
      </Mover>,
      // Along x (road row r).
      <Mover key={`xa${r}`} from={[from, r + 0.12]} to={[to, r + 0.12]} dur={29 + i * 4} delay={i * 9 + 2}>
        <MiniCar x={from} y={r + 0.12} along="x" color={cars[(i + 4) % cars.length]} />
      </Mover>,
      <Mover key={`xb${r}`} from={[to, r + 0.6]} to={[from, r + 0.6]} dur={34 + i * 2} delay={i * 13 + 6}>
        <MiniCar x={to} y={r + 0.6} along="x" color={cars[(i + 1) % cars.length]} />
      </Mover>,
    );
    // People walking on the pavement edges.
    const people = ['🚶', '🚶‍♀️', '🧒', '🚴'];
    out.push(
      <Mover key={`py${r}`} from={[r - 0.15, from + 2]} to={[r - 0.15, to - 2]} dur={70 + i * 9} delay={i * 17}>
        <Emoji at={P(r - 0.15, from + 2, 8)} size={13}>
          {people[i % people.length]}
        </Emoji>
      </Mover>,
      <Mover key={`px${r}`} from={[to - 2, r + 1.15]} to={[from + 2, r + 1.15]} dur={80 + i * 7} delay={i * 23 + 10}>
        <Emoji at={P(to - 2, r + 1.15, 8)} size={13}>
          {people[(i + 2) % people.length]}
        </Emoji>
      </Mover>,
    );
  });
  // Birds crossing the sky.
  out.push(
    <g key="birds">
      <animateTransform attributeName="transform" type="translate" from="-900 -40" to="900 60" dur="38s" repeatCount="indefinite" />
      <Emoji at={[0, -120]} size={14}>
        🐦
      </Emoji>
      <Emoji at={[22, -110]} size={11}>
        🐦
      </Emoji>
    </g>,
  );
  return <g style={{ pointerEvents: 'none' }}>{out}</g>;
}

/** Night or dusk tint over the whole town. */
export function SkyTint({ phase, view }: { phase: DayPhase; view: { x: number; y: number; w: number; h: number } }) {
  if (phase === 'day') return null;
  return (
    <rect
      x={view.x}
      y={view.y}
      width={view.w}
      height={view.h}
      fill={phase === 'night' ? '#0d1b3d' : '#ff8a3d'}
      opacity={phase === 'night' ? 0.42 : 0.14}
      style={{ mixBlendMode: 'multiply', pointerEvents: 'none' }}
    />
  );
}

/** Street lamps along the roads; they glow at night (drawn above the night tint). */
export function StreetLamps({ spots, glow }: { spots: [number, number][]; glow: boolean }) {
  return (
    <g style={{ pointerEvents: 'none' }}>
      {spots.map(([x, y], i) => {
        const [sx, sy] = P(x, y);
        return (
          <g key={i}>
            {glow && <circle cx={sx} cy={sy - 30} r={26} fill="url(#lamp-glow)" />}
            <line x1={sx} y1={sy} x2={sx} y2={sy - 28} stroke={INK} strokeWidth={2} />
            <circle cx={sx} cy={sy - 30} r={4} fill={glow ? '#ffe28a' : '#d9d2c3'} stroke={INK} strokeWidth={1.4} />
          </g>
        );
      })}
    </g>
  );
}

export const LampGlowDef = () => (
  <radialGradient id="lamp-glow">
    <stop offset="0" stopColor="#ffe9a0" stopOpacity="0.85" />
    <stop offset="1" stopColor="#ffe9a0" stopOpacity="0" />
  </radialGradient>
);

/** Today's path: a glowing trail from home through today's quest buildings to the chest. */
export function PathTrail({ points, reduced }: { points: Pt[]; reduced: boolean }) {
  if (points.length < 2) return null;
  const d = `M${points.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L')}`;
  return (
    <g style={{ pointerEvents: 'none' }}>
      <path d={d} fill="none" stroke="#fff3c4" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" opacity={0.75} />
      <path d={d} fill="none" stroke="#f59e0b" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="10 9">
        {!reduced && <animate attributeName="stroke-dashoffset" from="38" to="0" dur="1.6s" repeatCount="indefinite" />}
      </path>
    </g>
  );
}

/** Numbered stop badge on today's path (✓ when done). */
export function StopBadge({ at, label, done }: { at: Pt; label: string; done: boolean }) {
  const w = Math.max(22, label.length * 8 + 12);
  return (
    <g style={{ pointerEvents: 'none' }}>
      <rect x={at[0] - w / 2} y={at[1] - 11} width={w} height={22} rx={11} fill={done ? '#5cb85c' : '#ffc23d'} stroke={INK} strokeWidth={2} />
      <text x={at[0]} y={at[1] + 1} fontSize={12} fontWeight={800} textAnchor="middle" dominantBaseline="central" fill={done ? '#fff' : '#3b2412'} fontFamily="'Baloo 2', sans-serif">
        {done ? `✓ ${label}` : label}
      </text>
    </g>
  );
}

export type ChestState = 'locked' | 'ready' | 'opened';

/** Today's treasure chest in the town square. */
export function Chest({ x, y, state, progress, onOpen }: { x: number; y: number; state: ChestState; progress: string; onOpen: () => void }) {
  const [sx, sy] = P(x, y);
  const wood = '#a8662f';
  const lidOpen = state === 'opened';
  return (
    <g onClick={onOpen} style={{ cursor: 'pointer', outline: 'none' }} role="button" tabIndex={0} aria-label="Treasure chest" onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen()}>
      <g className={state === 'ready' ? 'town-bob' : undefined}>
        <Box x={x - 0.35} y={y - 0.25} w={0.7} d={0.5} h={14} color={wood} />
        <Box x={x - 0.35} y={y - 0.25} w={0.7} d={0.5} h={3} z={7} color="#ffc23d" />
        {lidOpen ? (
          <Box x={x - 0.35} y={y - 0.42} w={0.7} d={0.16} h={16} z={14} color={shade(wood, 0.1)} />
        ) : (
          <Box x={x - 0.35} y={y - 0.25} w={0.7} d={0.5} h={7} z={14} color={shade(wood, 0.12)} />
        )}
        {lidOpen && (
          <Emoji at={[sx, sy - 30]} size={16}>
            ✨
          </Emoji>
        )}
        {state === 'ready' && (
          <>
            <Emoji at={[sx - 26, sy - 34]} size={14}>
              ✨
            </Emoji>
            <Emoji at={[sx + 24, sy - 28]} size={12}>
              ✨
            </Emoji>
          </>
        )}
      </g>
      <g>
        <rect x={sx - 52} y={sy + 8} width={104} height={22} rx={11} fill={state === 'ready' ? '#e8584a' : '#fff5e1'} stroke={INK} strokeWidth={2} />
        <text x={sx} y={sy + 20} fontSize={12} fontWeight={800} textAnchor="middle" dominantBaseline="central" fill={state === 'ready' ? '#fff' : '#3b2412'} fontFamily="'Baloo 2', sans-serif">
          {state === 'ready' ? '🎁 Open me!' : state === 'opened' ? '✓ Chest opened' : `🔒 Chest ${progress}`}
        </text>
      </g>
    </g>
  );
}

/** Fog over a world he hasn't explored yet. */
export function Fog({ x, y, size }: { x: number; y: number; size: number }) {
  const [cx, cy] = P(x + size / 2, y + size / 2);
  const puffs: [number, number, number][] = [
    [-28, -16, 21],
    [0, -30, 24],
    [27, -14, 21],
    [-12, 2, 19],
    [15, 4, 19],
  ];
  return (
    <g style={{ pointerEvents: 'none' }} opacity={0.93}>
      {puffs.map(([dx, dy, r], i) => (
        <circle key={i} cx={cx + dx} cy={cy + dy - 20} r={r} fill="#eef2f6" stroke="#b9c3cf" strokeWidth={1.5} />
      ))}
      <text x={cx} y={cy - 26} fontSize={22} fontWeight={800} textAnchor="middle" dominantBaseline="central" fill="#7c8a9a" fontFamily="'Baloo 2', sans-serif">
        ?
      </text>
    </g>
  );
}

/** Wear on a building whose topics are due for review: cracks and a wilting flower. */
export function Wear({ at }: { at: Pt }) {
  const [x, y] = at;
  return (
    <g style={{ pointerEvents: 'none' }}>
      <path d={`M${x - 14},${y - 26} l6,8 l-5,6 l7,9`} fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" opacity={0.7} />
      <path d={`M${x + 12},${y - 18} l-5,7 l6,5`} fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" opacity={0.7} />
      <Emoji at={[x + 26, y - 4]} size={16}>
        🥀
      </Emoji>
    </g>
  );
}

/** Builders at work when a building has just grown. */
export function Builders({ at }: { at: Pt }) {
  const [x, y] = at;
  return (
    <g style={{ pointerEvents: 'none' }}>
      <g className="town-bob">
        <Emoji at={[x - 26, y - 10]} size={20}>
          👷
        </Emoji>
      </g>
      <g className="town-hammer">
        <Emoji at={[x + 24, y - 16]} size={18}>
          🔨
        </Emoji>
      </g>
      <Emoji at={[x, y - 40]} size={18}>
        ✨
      </Emoji>
    </g>
  );
}
