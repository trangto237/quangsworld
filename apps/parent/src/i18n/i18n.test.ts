import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { VI_A } from './vi-a';
import { VI_B } from './vi-b';
import { VI_C } from './vi-c';

const VI = { ...VI_A, ...VI_B, ...VI_C };
const root = join(__dirname, '..');
const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? (f === 'i18n' ? [] : files(p)) : /\.tsx?$/.test(f) && !/\.test\./.test(f) ? [p] : [];
  });

/** Every literal tr('…') / tr("…") / tr(`…`) (no ${} inside) in the parent app. */
function keys(): { key: string; file: string }[] {
  const out: { key: string; file: string }[] = [];
  const re = /\btr\(\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|`((?:[^`\\$]|\\.)*)`)/g;
  for (const file of files(root)) {
    const src = readFileSync(file, 'utf8');
    for (const m of src.matchAll(re)) out.push({ key: (m[1] ?? m[2] ?? m[3]).replace(/\\(['"`\\])/g, '$1').replace(/\\n/g, '\n'), file: file.slice(root.length + 1) });
  }
  return out;
}

describe('parent app Vietnamese', () => {
  it('has a Vietnamese text for every tr() string', () => {
    const missing = keys().filter((k) => !VI[k.key]).map((k) => `${k.file}: ${k.key}`);
    expect(missing).toEqual([]);
  });
  it('keeps the same {placeholders} in both languages', () => {
    const ph = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');
    for (const [en, vi] of Object.entries(VI)) expect(ph(vi), en).toBe(ph(en));
  });
  it('dictionary parts do not disagree', () => {
    for (const a of [VI_A, VI_B])
      for (const b of [VI_B, VI_C]) if (a !== b) for (const k of Object.keys(a)) if (k in b) expect(b[k], k).toBe(a[k]);
  });
});
