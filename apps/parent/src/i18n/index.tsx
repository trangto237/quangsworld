import { Fragment, type ReactNode } from 'react';
import { create } from 'zustand';
import { VI_A } from './vi-a';
import { VI_B } from './vi-b';
import { VI_C } from './vi-c';

/**
 * Parent app languages: English and Vietnamese (switch in the header, remembered on this device).
 * Write every on-screen text as `tr('English text')`, with `{name}` placeholders for values:
 * `tr('Hi, {name}', { name })`. The Vietnamese is looked up by the exact English text; anything
 * missing simply shows in English. Checked by i18n.test.ts.
 */
export type ParentLang = 'en' | 'vi';
const KEY = 'atlas-parent-lang';

export const VI: Record<string, string> = { ...VI_A, ...VI_B, ...VI_C };

const initial = (): ParentLang => {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'en' || saved === 'vi') return saved;
  } catch {
    /* ignore */
  }
  return typeof navigator !== 'undefined' && /^vi\b/i.test(navigator.language) ? 'vi' : 'en';
};

export const useParentLang = create<{ lang: ParentLang; setLang: (l: ParentLang) => void }>((set) => ({
  lang: initial(),
  setLang: (lang) => {
    try {
      localStorage.setItem(KEY, lang);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = lang;
    set({ lang });
  },
}));

const fill = (s: string, vars?: Record<string, string | number>) => (vars ? s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m)) : s);

/** The text in the current language. */
export function tr(en: string, vars?: Record<string, string | number>): string {
  const lang = useParentLang.getState().lang;
  return fill(lang === 'vi' ? (VI[en] ?? en) : en, vars);
}

/** Re-draws the whole app when the language changes. */
export function LangRoot({ children }: { children: ReactNode }) {
  const lang = useParentLang((s) => s.lang);
  return <Fragment key={lang}>{children}</Fragment>;
}

/** 🇻🇳 / 🇬🇧 switch. */
export function LangToggle({ className }: { className?: string }) {
  const { lang, setLang } = useParentLang();
  return (
    <button
      onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
      className={className ?? 'rounded-xl px-3 py-2 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800'}
      title={lang === 'vi' ? 'Switch to English' : 'Chuyển sang tiếng Việt'}
    >
      {lang === 'vi' ? '🇬🇧 English' : '🇻🇳 Tiếng Việt'}
    </button>
  );
}
