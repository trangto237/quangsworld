import { createContext, useContext, useMemo, type CSSProperties, type ReactNode } from 'react';
import type { ShopItem } from '@atlas/engine';
import { cx } from '@atlas/ui';
import { inSlot, type Slots } from '../../lib/equipped';

/** What the hero is wearing from the shop, for every game to read. */
export interface Look {
  avatar: string;
  hat?: string;
  pet?: string;
  /** Right-answer effect emoji. */
  effect?: string;
  /** The item in a game slot, e.g. gear('race.vehicle'). */
  gear: (slot: string) => ShopItem | undefined;
}

const NONE: Look = { avatar: '🦊', gear: () => undefined };
const LookCtx = createContext<Look>(NONE);
export const useLook = () => useContext(LookCtx);

export function LookProvider({ slots, avatar, children }: { slots?: Slots; avatar?: string; children: ReactNode }) {
  const look = useMemo<Look>(() => {
    const s = slots ?? {};
    return {
      avatar: avatar ?? '🦊',
      hat: inSlot(s, 'hat')?.emoji,
      pet: inSlot(s, 'pet')?.emoji,
      effect: inSlot(s, 'effect')?.emoji,
      gear: (slot) => inSlot(s, slot),
    };
  }, [slots, avatar]);
  return <LookCtx.Provider value={look}>{children}</LookCtx.Provider>;
}

/** The hero with hat and pet, sized by the parent's font size. */
export function HeroSprite({ className, style, look: given }: { className?: string; style?: CSSProperties; look?: Look }) {
  const ctx = useLook();
  const look = given ?? ctx;
  return (
    <span className={cx('relative inline-block leading-none', className)} style={style}>
      {look.avatar}
      {look.hat && <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[55%] text-[0.55em]">{look.hat}</span>}
      {look.pet && <span className="absolute -bottom-[0.05em] -right-[0.55em] text-[0.45em]">{look.pet}</span>}
    </span>
  );
}

/** A burst of the equipped effect, shown for a moment after a right answer. */
export function EffectBurst({ emoji, id }: { emoji: string; id: number }) {
  const bits = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2 + ((id * 7) % 10) / 10;
        const r = 90 + ((i * 37 + id * 13) % 70);
        return { dx: Math.cos(a) * r, dy: Math.sin(a) * r - 40, d: (i % 4) * 40, s: 1.4 + ((i * 5) % 4) * 0.3 };
      }),
    [id],
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-50 grid place-items-center" aria-hidden>
      <div className="relative">
        {bits.map((b, i) => (
          <span
            key={i}
            className="fx-burst absolute left-0 top-0"
            style={{ '--dx': `${b.dx}px`, '--dy': `${b.dy}px`, animationDelay: `${b.d}ms`, fontSize: `${b.s}rem` } as CSSProperties}
          >
            {emoji}
          </span>
        ))}
      </div>
    </div>
  );
}
