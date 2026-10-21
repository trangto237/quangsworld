import type { CSSProperties } from 'react';

/**
 * The hero: a small knight. The armour set (from the shop) changes the metal, cape, plume and helmet;
 * the profile emoji is painted on the shield.
 */

export interface Armour {
  metal: string;
  dark: string;
  trim: string;
  cape: string;
  plume: string;
  shield: string;
  /** Helmet extras. */
  horns?: string;
  spikes?: string;
  /** Closed visor with glowing eyes instead of a face. */
  visor?: string;
}

export const ARMOURS: Record<string, Armour> = {
  'armour.iron': { metal: '#b8c0c8', dark: '#7d8792', trim: '#8a5a35', cape: '#d9483b', plume: '#e8584a', shield: '#4b6fa8' },
  'armour.bronze': { metal: '#d39a5a', dark: '#9c6430', trim: '#5c3a1c', cape: '#3f8f3a', plume: '#ffc23d', shield: '#3f8f3a' },
  'armour.silver': { metal: '#e6eef5', dark: '#a9b8c6', trim: '#4b8fe2', cape: '#2f5fb3', plume: '#ffffff', shield: '#2f5fb3' },
  'armour.gold': { metal: '#ffd04a', dark: '#d19a12', trim: '#c0392b', cape: '#c0392b', plume: '#ffffff', shield: '#c0392b', spikes: '#ffd04a' },
  'armour.jade': { metal: '#7fd1a8', dark: '#3f9a70', trim: '#d4a017', cape: '#b5302a', plume: '#d4a017', shield: '#d4a017' },
  'armour.frost': { metal: '#cdeefe', dark: '#7fbfe0', trim: '#5aa0d8', cape: '#9fd8f6', plume: '#ffffff', shield: '#5aa0d8', spikes: '#e9f8ff' },
  'armour.dragon': { metal: '#c0392b', dark: '#7d1f17', trim: '#ffc23d', cape: '#2b2b2b', plume: '#ff8a3d', shield: '#7d1f17', horns: '#f3e6c8' },
  'armour.shadow': { metal: '#4a4560', dark: '#25223a', trim: '#9b6bff', cape: '#1b1830', plume: '#9b6bff', shield: '#25223a', visor: '#c9a6ff' },
};

export const DEFAULT_ARMOUR = 'armour.iron';
export const armourOf = (id?: string) => ARMOURS[id ?? ''] ?? ARMOURS[DEFAULT_ARMOUR];

const INK = '#3b2412';

export function Knight({
  armour,
  emblem,
  hat,
  bust,
  className,
  style,
  title,
  box,
}: {
  /** Armour item id (e.g. 'armour.gold'). */
  armour?: string;
  /** Emoji on the shield. */
  emblem?: string;
  /** Hat emoji worn on the helmet. */
  hat?: string;
  /** Head and shoulders only (for round avatar frames). */
  bust?: boolean;
  className?: string;
  style?: CSSProperties;
  title?: string;
  /** Position and size when drawn inside another SVG. */
  box?: { x: number; y: number; w: number; h: number };
}) {
  const a = armourOf(armour);
  return (
    <svg viewBox={bust ? '14 2 72 72' : '0 -6 100 124'} x={box?.x} y={box?.y} width={box?.w} height={box?.h} className={className} style={style} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      {/* Cape */}
      <path d="M34 58 Q50 54 66 58 L80 112 Q50 118 20 112 Z" fill={a.cape} stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
      {/* Legs and boots */}
      <rect x={38} y={90} width={10} height={18} rx={3} fill={a.dark} stroke={INK} strokeWidth={2.2} />
      <rect x={52} y={90} width={10} height={18} rx={3} fill={a.dark} stroke={INK} strokeWidth={2.2} />
      <rect x={36} y={104} width={13} height={7} rx={3} fill="#5c3a1c" stroke={INK} strokeWidth={2} />
      <rect x={51} y={104} width={13} height={7} rx={3} fill="#5c3a1c" stroke={INK} strokeWidth={2} />
      {/* Body */}
      <path d="M32 60 Q50 54 68 60 L65 92 Q50 96 35 92 Z" fill={a.metal} stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
      <path d="M38 64 Q44 61 50 61 L48 88 Q42 88 38 86 Z" fill="#ffffff" opacity={0.3} />
      <rect x={34} y={82} width={32} height={6} rx={2} fill={a.trim} stroke={INK} strokeWidth={1.8} />
      <circle cx={50} cy={71} r={5.5} fill={a.trim} stroke={INK} strokeWidth={1.8} />
      {/* Sword arm */}
      <rect x={66} y={62} width={9} height={20} rx={4} fill={a.metal} stroke={INK} strokeWidth={2.2} />
      <rect x={75.5} y={26} width={6} height={50} rx={2} fill="#e9eef3" stroke={INK} strokeWidth={2} />
      <path d="M78.5 22 L82 28 L75 28 Z" fill="#e9eef3" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
      <rect x={70} y={74} width={18} height={5} rx={2} fill={a.trim} stroke={INK} strokeWidth={2} />
      <rect x={76} y={79} width={5} height={9} rx={2} fill="#5c3a1c" stroke={INK} strokeWidth={1.8} />
      <circle cx={70.5} cy={82} r={5} fill={a.dark} stroke={INK} strokeWidth={2} />
      {/* Shield */}
      <path d="M12 60 L40 60 L40 76 Q40 92 26 100 Q12 92 12 76 Z" fill={a.shield} stroke={INK} strokeWidth={2.6} strokeLinejoin="round" />
      <path d="M16 64 L36 64 L36 76 Q36 88 26 95 Q16 88 16 76 Z" fill="none" stroke={a.trim} strokeWidth={2} />
      {emblem && (
        <text x={26} y={79} fontSize={15} textAnchor="middle" dominantBaseline="central">
          {emblem}
        </text>
      )}
      {/* Helmet */}
      {a.horns && (
        <>
          <path d="M30 30 Q18 22 20 8 Q26 20 36 24 Z" fill={a.horns} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
          <path d="M70 30 Q82 22 80 8 Q74 20 64 24 Z" fill={a.horns} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
        </>
      )}
      <path d="M50 10 Q60 0 70 4 Q62 6 58 14 Z" fill={a.plume} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
      <path d="M50 12 Q56 -2 66 -2 Q58 4 56 14 Z" fill={a.plume} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" opacity={0.85} />
      {a.spikes && (
        <path d="M34 22 L37 10 L42 18 L46 6 L50 16 L54 6 L58 18 L63 10 L66 22 Z" fill={a.spikes} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
      )}
      <path d="M26 40 Q26 12 50 12 Q74 12 74 40 L74 54 Q74 60 66 60 L34 60 Q26 60 26 54 Z" fill={a.metal} stroke={INK} strokeWidth={2.6} strokeLinejoin="round" />
      <path d="M32 26 Q36 16 48 15" fill="none" stroke="#ffffff" strokeWidth={3} strokeLinecap="round" opacity={0.55} />
      {a.visor ? (
        <>
          <rect x={32} y={32} width={36} height={20} rx={6} fill="#14121f" stroke={INK} strokeWidth={2} />
          <rect x={37} y={39} width={10} height={4} rx={2} fill={a.visor} />
          <rect x={53} y={39} width={10} height={4} rx={2} fill={a.visor} />
        </>
      ) : (
        <>
          {/* Open face */}
          <path d="M33 34 Q33 30 37 30 L63 30 Q67 30 67 34 L67 46 Q67 56 50 56 Q33 56 33 46 Z" fill="#f6c9a0" stroke={INK} strokeWidth={2} />
          <ellipse cx={42.5} cy={41} rx={2.6} ry={3.2} fill={INK} />
          <ellipse cx={57.5} cy={41} rx={2.6} ry={3.2} fill={INK} />
          <circle cx={43.3} cy={40} r={0.9} fill="#fff" />
          <circle cx={58.3} cy={40} r={0.9} fill="#fff" />
          <path d="M44 48 Q50 52.5 56 48" fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" />
          <ellipse cx={38} cy={47} rx={3} ry={1.8} fill="#ff8f8f" opacity={0.6} />
          <ellipse cx={62} cy={47} rx={3} ry={1.8} fill="#ff8f8f" opacity={0.6} />
        </>
      )}
      <rect x={30} y={26} width={40} height={6} rx={3} fill={a.trim} stroke={INK} strokeWidth={2} />
      {hat && (
        <text x={50} y={8} fontSize={26} textAnchor="middle" dominantBaseline="central">
          {hat}
        </text>
      )}
    </svg>
  );
}
