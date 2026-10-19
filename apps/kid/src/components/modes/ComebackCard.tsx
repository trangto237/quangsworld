import type { ComebackCard } from '@atlas/game';
import { T } from '../../i18n';

/** A glowing card the kid taps to play (offered after 3 right answers in a row while losing). */
export function ComebackCardButton({ card, onPlay, className }: { card: ComebackCard; onPlay: () => void; className?: string }) {
  return (
    <button
      onClick={onPlay}
      className={`animate-pop flex items-center gap-3 rounded-2xl bg-gradient-to-br from-amber-300 to-fuchsia-500 p-[3px] text-left shadow-[0_0_24px_rgba(251,191,36,0.7)] transition hover:scale-105 ${className ?? ''}`}
      aria-label={`Play comeback card: ${card.name}`}
    >
      <span className="flex items-center gap-3 rounded-[14px] bg-slate-950/90 px-3 py-2 text-white">
        <span className="text-3xl leading-none">{card.emoji}</span>
        <span>
          <span className="block text-[10px] font-bold uppercase tracking-widest text-amber-300">
            <T en="Comeback card!" />
          </span>
          <span className="block font-display font-bold">
            <T en={card.name} />
          </span>
          <span className="block text-xs text-white/70">
            <T en={card.blurb} />
          </span>
        </span>
      </span>
    </button>
  );
}
