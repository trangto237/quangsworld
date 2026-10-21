import { useRef, useState, type ReactNode } from 'react';
import { cx } from '@atlas/ui';
import { P, ShadeDefs } from './iso';
import { KINDS, house } from './buildings';
import { IslandBase, IslandDefs, islandShape } from './island';
import { TB } from '../i18n';
import { TownButton } from './ui';

/**
 * Choosing a realm, like a level select: the realms go round in a loop. The one in front is a big card
 * with a picture of its island; the ones beside it are smaller, the ones behind smaller still and faint.
 * Swipe or use the arrows to turn the ring, tap a side card to bring it to the front, Enter to go in.
 */

export interface RealmCard {
  id: string;
  name: ReactNode;
  emoji: string;
  color: string;
  /** Realm colours (CSS class) and the card's sky. */
  cls?: string;
  sky: string;
  /** Buildings on the card's island (place kinds), with their levels. */
  buildings: { kind: string; level: number; color: string }[];
  /** Small lines under the name. */
  info: ReactNode;
  quest?: boolean;
}

const SHAPE = islandShape(0, 0, 6, 6, 31);
const LOTS: [number, number][] = [
  [0.7, 0.6],
  [3.3, 0.9],
  [1.0, 3.3],
  [3.4, 3.4],
];

/** One floating island with up to four of the realm's buildings. */
function Preview({ card }: { card: RealmCard }) {
  return (
    <svg viewBox="-215 -95 430 330" className="h-full w-full" aria-hidden>
      <defs>
        <ShadeDefs />
        <IslandDefs />
      </defs>
      <g className={card.cls}>
        <g className="isle-float">
          <IslandBase shape={SHAPE} seed={31} falls={0.6} />
          {card.buildings.slice(0, 4).map((b, i) => {
            const [x, y] = LOTS[i];
            const draw = b.kind === 'home' ? house('#ffe3a3', '#e8584a', 2) : KINDS[b.kind];
            return draw ? <g key={i}>{draw(x + 0.4, y + 0.4, b.level, b.color).el}</g> : null;
          })}
        </g>
      </g>
      <text x={P(5.6, 0.2)[0]} y={P(5.6, 0.2)[1] - 50} fontSize={34} textAnchor="middle" dominantBaseline="central">
        {card.emoji}
      </text>
    </svg>
  );
}

export function RealmPicker({ cards, index, onIndex, onEnter }: { cards: RealmCard[]; index: number; onIndex: (i: number) => void; onEnter: (i: number) => void }) {
  const n = cards.length;
  const [drag, setDrag] = useState(0);
  const start = useRef<{ x: number; moved: boolean } | null>(null);
  const prev = useRef<Record<string, number>>({});
  const ref = useRef<HTMLDivElement>(null);
  const swiped = useRef(false);
  const width = ref.current?.clientWidth ?? 390;
  const step = Math.min(width * 0.36, 260);
  const turn = (d: number) => onIndex((index + d + n) % n);

  /** Where card i sits round the ring: 0 in front, ±1 beside, ±2 behind. */
  const offset = (i: number) => {
    let o = (i - index) % n;
    if (o > n / 2) o -= n;
    if (o < -n / 2) o += n;
    return o - drag / step;
  };

  return (
    <div
      ref={ref}
      className="absolute inset-0 flex select-none flex-col items-center justify-center"
      style={{ touchAction: 'pan-y' }}
      onPointerDown={(e) => {
        if ((e.target as Element).closest('[data-noswipe]')) return;
        start.current = { x: e.clientX, moved: false };
      }}
      onPointerMove={(e) => {
        const s = start.current;
        if (!s) return;
        const dx = e.clientX - s.x;
        if (Math.abs(dx) > 8) s.moved = true;
        if (s.moved) setDrag(dx);
      }}
      onPointerUp={() => {
        const s = start.current;
        start.current = null;
        swiped.current = !!s?.moved;
        if (s?.moved) {
          const steps = Math.round(-drag / step);
          setDrag(0);
          if (steps) turn(steps);
        }
      }}
      onPointerCancel={() => {
        start.current = null;
        setDrag(0);
      }}
      onClickCapture={(e) => {
        // A swipe is not a tap on a card.
        if (swiped.current) {
          e.stopPropagation();
          swiped.current = false;
        }
      }}
    >
      <div className="relative w-full flex-1">
        {cards.map((c, i) => {
          const o = offset(i);
          const a = Math.abs(o);
          // A card jumping round the back of the ring moves without sliding across the front.
          const jumped = Math.abs((prev.current[c.id] ?? o) - o) > 1.5;
          prev.current[c.id] = o;
          const scale = a < 1 ? 1 - a * 0.38 : Math.max(0.3, 0.62 - (a - 1) * 0.22);
          const front = Math.round(o) === 0 && !drag;
          return (
            <button
              key={c.id}
              onClick={() => (front ? onEnter(i) : turn(Math.round(offset(i))))}
              className={cx('absolute left-1/2 top-1/2 w-[min(72vw,320px)] rounded-3xl border-[3px] border-ink bg-paper p-2 text-left shadow-[0_6px_0_var(--ink)]', front && 'ring-4 ring-[#ffc23d]')}
              style={{
                transform: `translate(-50%, -50%) translateX(${o * step}px) scale(${scale})`,
                opacity: a > 2.2 ? 0 : a > 1.4 ? 0.45 : 1,
                zIndex: 10 - Math.round(a * 3),
                transition: drag || jumped ? 'none' : 'transform 0.35s ease, opacity 0.35s ease',
                filter: a > 0.5 ? 'saturate(0.8)' : undefined,
              }}
              aria-label={typeof c.name === 'string' ? c.name : c.id}
              tabIndex={front ? 0 : -1}
            >
              <div className="text-center font-display text-2xl font-bold leading-tight">{c.name}</div>
              <div className={cx('relative mt-1 aspect-[4/3] overflow-hidden rounded-2xl border-2 border-ink', c.cls)} style={{ background: c.sky }}>
                <Preview card={c} />
                {c.quest && (
                  <span className="absolute left-2 top-2 rounded-full border-2 border-ink bg-[#e8584a] px-2 py-0.5 font-display text-xs font-bold text-white">
                    ⚔️ <TB en="Quest" />
                  </span>
                )}
              </div>
              <div className="mt-1.5 text-center text-xs font-semibold text-ink-soft">{c.info}</div>
            </button>
          );
        })}
        <button data-noswipe onClick={() => turn(-1)} className="town-btn absolute left-2 top-1/2 z-20 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-paper text-3xl font-bold text-ink-text" aria-label="Previous realm">
          ‹
        </button>
        <button data-noswipe onClick={() => turn(1)} className="town-btn absolute right-2 top-1/2 z-20 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-paper text-3xl font-bold text-ink-text" aria-label="Next realm">
          ›
        </button>
      </div>
      <div className="z-20 flex items-center gap-2 pb-2">
        {cards.map((c, i) => (
          <button data-noswipe key={c.id} onClick={() => onIndex(i)} className={cx('size-2.5 rounded-full border-2 border-ink', i === index ? 'bg-[#ffc23d]' : 'bg-paper')} aria-label={`Realm ${i + 1}`} />
        ))}
      </div>
      <TownButton data-noswipe tone="green" size="lg" className="z-20 mb-1 min-w-48" onClick={() => onEnter(index)}>
        <TB en="Enter ▶" />
      </TownButton>
    </div>
  );
}
