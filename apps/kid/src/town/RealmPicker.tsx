import { useRef, useState, type ReactNode } from 'react';
import { cx } from '@atlas/ui';
import { ShadeDefs } from './iso';
import { KINDS, house } from './buildings';
import { IslandBase, IslandDefs, islandShape } from './island';
import { TB } from '../i18n';

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
  /** Badges under the island in front. */
  info: ReactNode;
  /** For screen readers. */
  label: string;
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
    <svg viewBox="-205 -105 410 330" className="h-full w-full overflow-visible" aria-hidden>
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
    </svg>
  );
}

const ARROW =
  'absolute top-1/2 z-20 grid size-12 -translate-y-1/2 place-items-center rounded-full border-2 border-white/90 bg-white/55 text-3xl font-bold text-[#3b2412] shadow-[0_6px_16px_rgba(0,0,0,0.18)] backdrop-blur-md transition hover:bg-white/80';

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
      {/* Drifting clouds and sparkles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <span className="picker-cloud absolute left-[-10%] top-[12%] h-16 w-56 rounded-full bg-white/60 blur-xl" />
        <span className="picker-cloud absolute right-[-12%] top-[58%] h-20 w-72 rounded-full bg-white/50 blur-xl [animation-delay:-9s]" />
        <span className="picker-cloud absolute left-[20%] bottom-[8%] h-12 w-40 rounded-full bg-white/40 blur-lg [animation-delay:-4s]" />
        {[
          [18, 30],
          [80, 24],
          [70, 70],
          [25, 72],
        ].map(([x, y], k) => (
          <span key={k} className="picker-twinkle absolute text-lg" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${k * 0.7}s` }}>
            ✨
          </span>
        ))}
      </div>
      <div key={`t${index}`} className="z-20 animate-pop pt-1 text-center">
        <div className="font-display text-[2rem] font-black leading-none tracking-wide text-white sm:text-5xl" style={{ textShadow: '2px 0 0 #3b2412, -2px 0 0 #3b2412, 0 2px 0 #3b2412, 0 -2px 0 #3b2412, 1.5px 1.5px 0 #3b2412, -1.5px 1.5px 0 #3b2412, 1.5px -1.5px 0 #3b2412, -1.5px -1.5px 0 #3b2412, 0 5px 0 #3b2412, 0 8px 18px rgba(0,0,0,0.3)' }}>
          {cards[index].emoji} {cards[index].label}
        </div>
        <div className="mx-auto mt-2 h-1 w-32 rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${cards[index].color}, transparent)` }} />
      </div>
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
              className="absolute left-1/2 top-1/2 w-[min(92vw,460px)] outline-none"
              style={{
                transform: `translate(-50%, -50%) translateX(${o * step}px) scale(${scale})`,
                opacity: a > 2.2 ? 0 : a > 1.4 ? 0.4 : a > 0.5 ? 0.85 : 1,
                zIndex: 10 - Math.round(a * 3),
                transition: drag || jumped ? 'none' : 'transform 0.45s cubic-bezier(.2,.8,.2,1), opacity 0.45s ease, filter 0.45s ease',
                filter: a > 0.5 ? 'saturate(0.75) brightness(0.95)' : undefined,
              }}
              aria-label={c.label}
              tabIndex={front ? 0 : -1}
            >
              {/* A soft glow in the realm's colour behind the island in front */}
              <span
                className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl transition-opacity duration-500"
                style={{ background: `radial-gradient(circle, ${c.color}aa 0%, ${c.color}33 45%, transparent 70%)`, opacity: a < 0.5 ? 1 : 0 }}
              />
              <span className={cx('relative block aspect-[4/3]', c.cls)} style={{ filter: 'drop-shadow(0 22px 22px rgba(25,15,50,0.35))' }}>
                <Preview card={c} />
              </span>
              {c.quest && (
                <span className="town-bob absolute left-1/2 top-[4%] -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-white bg-[linear-gradient(180deg,#ff7a6b,#d9402f)] px-3 py-1 font-display text-sm font-bold text-white shadow-[0_4px_12px_rgba(217,64,47,0.45)]">
                  ⚔️ <TB en="Today's quest" />
                </span>
              )}
              {a >= 0.5 && <span className="absolute inset-x-0 bottom-[2%] block text-center font-display text-xl font-bold text-white [text-shadow:0_2px_0_rgba(59,36,18,0.8),0_0_10px_rgba(0,0,0,0.3)]">{c.name}</span>}
            </button>
          );
        })}
        <button data-noswipe onClick={() => turn(-1)} className={ARROW + ' left-2'} aria-label="Previous realm">
          ‹
        </button>
        <button data-noswipe onClick={() => turn(1)} className={ARROW + ' right-2'} aria-label="Next realm">
          ›
        </button>
      </div>
      <div key={`i${index}`} className="z-20 flex animate-pop flex-wrap justify-center gap-2 px-4 pb-2 text-sm font-bold text-[#3b2412]">
        {cards[index].info}
      </div>
      <div className="z-20 flex items-center gap-1.5 pb-3">
        {cards.map((c, i) => (
          <button
            data-noswipe
            key={c.id}
            onClick={() => onIndex(i)}
            className="h-2.5 rounded-full border border-white/80 shadow transition-all duration-300"
            style={{ width: i === index ? 26 : 10, background: i === index ? cards[index].color : 'rgba(255,255,255,0.6)' }}
            aria-label={`Realm ${i + 1}`}
          />
        ))}
      </div>
      <button
        data-noswipe
        onClick={() => onEnter(index)}
        className="picker-enter relative z-20 mb-1 overflow-hidden rounded-full border-[3px] border-[#1f5f2a] bg-[linear-gradient(180deg,#7fe07a,#3fa54a)] px-12 py-2.5 font-display text-2xl font-bold text-white shadow-[0_5px_0_#1f5f2a,0_12px_24px_rgba(0,0,0,0.25)] [text-shadow:0_2px_0_#1f5f2a] active:translate-y-1 active:shadow-[0_1px_0_#1f5f2a]"
      >
        <TB en="Enter ▶" />
      </button>
    </div>
  );
}
