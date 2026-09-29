import { Fragment } from 'react';
import { glossaryLookup } from '@atlas/knowledge';
import { Tip } from '../i18n';

const POS_VI: Record<string, string> = { n: 'danh từ', v: 'động từ', adj: 'tính từ', adv: 'trạng từ', prep: 'giới từ', conj: 'liên từ' };

const WORD = /[A-Za-zÀ-ỹ][A-Za-zÀ-ỹ'’-]*/g;

/** True when the text has at least one word the glossary can explain. */
export const hasGloss = (text?: string) => !!text && (text.match(WORD) ?? []).some((w) => glossaryLookup(w));

/**
 * English text where known words can be tapped (or hovered) for their Vietnamese meaning —
 * a small teaching note, e.g. "punctual (tính từ): đúng giờ".
 */
export function GlossText({ text, enabled }: { text: string; enabled: boolean }) {
  if (!enabled) return <>{text}</>;
  const parts = text.split(/([A-Za-zÀ-ỹ][A-Za-zÀ-ỹ'’-]*)/);
  return (
    <>
      {parts.map((part, i) => {
        const g = i % 2 === 1 ? glossaryLookup(part) : undefined;
        if (!g) return <Fragment key={i}>{part}</Fragment>;
        return (
          <Tip
            key={i}
            className="decoration-sky-500/70"
            tip={
              <span lang="vi">
                <b>{g.word}</b> <i className="font-normal opacity-80">({POS_VI[g.pos] ?? g.pos})</i>: {g.vi}
              </span>
            }
          >
            {part}
          </Tip>
        );
      })}
    </>
  );
}
