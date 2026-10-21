import { useContext, useEffect, useState } from 'react';
import { NightContext } from './night';
import { Box, Emoji, INK, P, shade, type Pt } from './iso';
import { Cloud } from './island';

/**
 * What makes the sky world feel alive: day and night by the real clock, drifting clouds, birds and
 * balloons, today's treasure chest, and builders when a building grows. Movement is left out when the
 * device asks for less motion.
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

/** Drifting clouds, birds and a balloon; stars at night. */
export function SkyLife({ view, phase, reduced }: { view: { x: number; y: number; w: number; h: number }; phase: DayPhase; reduced: boolean }) {
  const clouds: [number, number, number, number][] = [
    [-700, -250, 1.4, 160],
    [-150, -300, 1, 190],
    [420, -200, 1.6, 140],
    [-500, 250, 1.2, 175],
    [600, 330, 1.3, 155],
    [80, 520, 1.5, 200],
  ];
  const stars = Array.from({ length: 40 }, (_, i) => [view.x + ((i * 397) % view.w), view.y + ((i * 211) % (view.h * 0.8)), 1 + (i % 3) * 0.6] as const);
  return (
    <g style={{ pointerEvents: 'none' }}>
      {phase === 'night' &&
        stars.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={0.8}>
            {!reduced && <animate attributeName="opacity" values="0.3;0.9;0.3" dur={`${3 + (i % 4)}s`} repeatCount="indefinite" />}
          </circle>
        ))}
      {clouds.map(([x, y, s, dur], i) => (
        <g key={i} opacity={phase === 'night' ? 0.35 : 0.8}>
          {!reduced && <animateTransform attributeName="transform" type="translate" values={`0 0; ${i % 2 ? -160 : 160} 0; 0 0`} dur={`${dur}s`} repeatCount="indefinite" />}
          <Cloud x={x} y={y} s={s} />
        </g>
      ))}
      {!reduced && (
        <>
          <g>
            <animateTransform attributeName="transform" type="translate" from="-1000 -40" to="1000 80" dur="40s" repeatCount="indefinite" />
            {/* The emoji faces left; flip it so the birds fly forwards. */}
            <g transform="scale(-1 1)">
              <Emoji at={[0, -160]} size={15}>
                🐦
              </Emoji>
              <Emoji at={[-24, -148]} size={12}>
                🐦
              </Emoji>
            </g>
          </g>
          <g>
            <animateTransform attributeName="transform" type="translate" values="900 120; -900 -60" dur="90s" repeatCount="indefinite" />
            <Emoji at={[0, 200]} size={30}>
              🎈
            </Emoji>
          </g>
          <g>
            <animateTransform attributeName="transform" type="translate" values="-900 300; 900 200" dur="70s" begin="-30s" repeatCount="indefinite" />
            <g transform="scale(-1 1)">
              <Emoji at={[0, 300]} size={16}>
                🦅
              </Emoji>
            </g>
          </g>
        </>
      )}
    </g>
  );
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

/** Lanterns; they glow at night (drawn above the night tint). */
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

/** Today's treasure chest on the middle island. */
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

export const HazeDefs = () => (
  <>
    <radialGradient id="town-haze">
      <stop offset="0" stopColor="#ffffff" stopOpacity="0.75" />
      <stop offset="0.6" stopColor="#ffffff" stopOpacity="0.35" />
      <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
    </radialGradient>
    {/* Pale and washed out: far away, not discovered yet. */}
    <filter id="town-mist">
      <feColorMatrix type="saturate" values="0.2" />
      <feComponentTransfer>
        <feFuncR type="linear" slope="0.5" intercept="0.45" />
        <feFuncG type="linear" slope="0.5" intercept="0.46" />
        <feFuncB type="linear" slope="0.5" intercept="0.5" />
      </feComponentTransfer>
    </filter>
  </>
);

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
