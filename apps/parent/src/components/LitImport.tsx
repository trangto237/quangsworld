import { useState } from 'react';
import { LIT_PART_LABEL, NGU_VAN_9, PAGE_BREAK, customUnit, type DraftQuestion } from '@atlas/knowledge';
import { Button, Card, Field, cx, inputClass, useRepo } from '@atlas/ui';
import { BusyError, generateWithAI, transcribeWithAI } from '../lib/ai';
import { docxText, pdfText } from '../lib/extract';
import { openPdf, pageJpeg, photoJpeg } from '../lib/ocr';
import { useCloud } from './Cloud';

type Focus = 'reading' | 'grammar' | 'vocabulary';
const FOCUS: { id: Focus; label: string }[] = [
  { id: 'reading', label: '📖 Đọc hiểu văn bản' },
  { id: 'grammar', label: '🧩 Thực hành tiếng Việt' },
  { id: 'vocabulary', label: '📚 Kiến thức văn học (thể loại, tác giả)' },
];
const MAX_PAGES = 24;

interface Picked {
  name: string;
  kind: 'pdf' | 'image' | 'docx' | 'text';
  size: number;
  bytes?: Uint8Array;
  pages: number;
  photos?: File[];
  text?: string;
}

/**
 * Ngữ văn textbook → questions in Vietnamese, one bài at a time. Pages are read (the PDF's text, or AI for
 * scans and photos), the AI writes questions, the parent ticks the ones to keep, and they become missions
 * in the Story Library. The pages stay private to the family.
 */
export function LitImport() {
  const repo = useRepo();
  const { cloud } = useCloud();
  const [bai, setBai] = useState(NGU_VAN_9[0].id);
  const [name, setName] = useState('');
  const [file, setFile] = useState<Picked | null>(null);
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(1);
  const [focus, setFocus] = useState<Focus[]>(['reading', 'grammar', 'vocabulary']);
  const [count, setCount] = useState(20);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<(DraftQuestion & { keep: boolean })[] | null>(null);
  const [excerpt, setExcerpt] = useState('');
  const [done, setDone] = useState<string | null>(null);

  const unit = (() => {
    if (bai === 'other') return customUnit(name || 'Ngữ văn');
    const base = NGU_VAN_9.find((u) => u.id === bai)!;
    const title = name.trim() ? `${base.title} · ${name.trim()}` : base.title;
    return { ...base, title, vi: title };
  })();

  const pick = async (files: FileList | null) => {
    setError(null);
    setDrafts(null);
    setDone(null);
    if (!files?.length) return;
    const list = [...files];
    const f = list[0];
    const lower = f.name.toLowerCase();
    try {
      if (list.length === 1 && lower.endsWith('.pdf')) {
        const bytes = new Uint8Array(await f.arrayBuffer());
        const pdf = await openPdf(bytes);
        setFile({ name: f.name, kind: 'pdf', size: f.size, bytes, pages: pdf.numPages });
        setFrom(1);
        setTo(Math.min(pdf.numPages, 12));
      } else if (list.length === 1 && lower.endsWith('.docx')) {
        const bytes = new Uint8Array(await f.arrayBuffer());
        setFile({ name: f.name, kind: 'docx', size: f.size, bytes, pages: 1, text: await docxText(bytes) });
      } else if (list.length === 1 && /\.(txt|md)$/.test(lower)) {
        setFile({ name: f.name, kind: 'text', size: f.size, pages: 1, text: await f.text() });
      } else {
        const photos = list.filter((x) => /^image\//.test(x.type));
        if (!photos.length) return setError('Choose a PDF, a Word file, or photos of the pages.');
        if (photos.length > MAX_PAGES) return setError(`At most ${MAX_PAGES} photos at a time.`);
        setFile({ name: photos.length === 1 ? photos[0].name : `${photos.length} photos`, kind: 'image', size: photos.reduce((s, x) => s + x.size, 0), pages: photos.length, photos });
      }
    } catch {
      setError("This file couldn't be opened.");
    }
  };

  /** AI reads scanned pages or photos, 6 at a time. */
  const readImages = async (token: string, images: { mediaType: string; data: string }[]) => {
    const out: string[] = [];
    for (let i = 0; i < images.length; i += 6) {
      setBusy(`Reading pages ${i + 1}–${Math.min(images.length, i + 6)} of ${images.length} with AI…`);
      let pages: string[];
      try {
        pages = await transcribeWithAI(token, images.slice(i, i + 6));
      } catch (e) {
        if (!(e instanceof BusyError)) throw e;
        setBusy('The AI is busy — trying again in 20 seconds…');
        await new Promise((r) => setTimeout(r, 20_000));
        pages = await transcribeWithAI(token, images.slice(i, i + 6));
      }
      out.push(...pages);
    }
    return out.join('\n\n');
  };

  const make = async () => {
    if (!file) return;
    setError(null);
    setDrafts(null);
    setDone(null);
    try {
      const token = await cloud.parentAccessToken();
      if (!token) throw new Error('Sign in to your family cloud account first (Settings → Cloud sync).');
      let text = file.text ?? '';
      if (file.kind === 'pdf') {
        const layer = await pdfText(file.bytes!).catch(() => null);
        if (layer && !layer.scanned) text = layer.text.split(PAGE_BREAK).slice(from - 1, to).join('\n\n');
        else {
          const pdf = await openPdf(file.bytes!);
          const images = [];
          for (let n = from; n <= to; n++) {
            setBusy(`Preparing page ${n - from + 1} of ${to - from + 1}…`);
            images.push(await pageJpeg(pdf, n, 1500));
          }
          text = await readImages(token, images);
        }
      } else if (file.kind === 'image') {
        const images = [];
        for (const [i, f] of file.photos!.entries()) {
          setBusy(`Preparing photo ${i + 1} of ${file.photos!.length}…`);
          const url = URL.createObjectURL(f);
          try {
            images.push(await photoJpeg(url, 1500));
          } finally {
            URL.revokeObjectURL(url);
          }
        }
        text = await readImages(token, images);
      }
      text = text.trim();
      if (text.replace(/\s/g, '').length < 200) throw new Error('Too little text was found on these pages. Check the page numbers, or use clearer photos.');
      setExcerpt(text.slice(0, 600));
      setBusy(`Writing about ${count} questions with AI… (about a minute)`);
      let res;
      try {
        res = await generateWithAI(token, { name: unit.title, kind: 'text', size: text.length, text: text.slice(0, 59_000) }, { unitTitle: `Ngữ văn 9 — ${unit.title}`, focus, count, subject: 'literature' });
      } catch (e) {
        if (!(e instanceof BusyError)) throw e;
        setBusy('The AI is busy — trying again in 20 seconds…');
        await new Promise((r) => setTimeout(r, 20_000));
        res = await generateWithAI(token, { name: unit.title, kind: 'text', size: text.length, text: text.slice(0, 59_000) }, { unitTitle: `Ngữ văn 9 — ${unit.title}`, focus, count, subject: 'literature' });
      }
      if (!res.drafts.length) throw new Error('No usable questions came back. Try clearer pages.');
      setDrafts(res.drafts.filter((d) => d.type !== 'order').map((d) => ({ ...d, keep: true })));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const save = async () => {
    if (!drafts || !file) return;
    const chosen = drafts.filter((d) => d.keep).map(({ keep: _k, ...d }) => d);
    try {
      const res = await repo.importQuestions({
        unit,
        materialName: `Ngữ văn — ${file.name}`,
        kind: file.kind,
        drafts: chosen,
        via: 'ai',
        bytes: file.bytes,
        size: file.size,
        excerpt,
        subject: 'literature',
      });
      setDone(`${res.added} questions saved as missions in the Story Library (${unit.title})${res.skipped ? `; ${res.skipped} were already there` : ''}.`);
      setDrafts(null);
      setFile(null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const kept = drafts?.filter((d) => d.keep).length ?? 0;

  return (
    <Card title="Ngữ văn textbook → questions (Vietnamese)" className="lg:col-span-2">
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Upload the pages of one bài from Quang's Ngữ văn 9 book (the texts, Thực hành tiếng Việt and the exercises). AI writes questions in Vietnamese about those exact texts, you tick
          the ones to keep, and they become missions in his Story Library. The pages stay private to your family.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Which bài?">
            <select className={inputClass} value={bai} onChange={(e) => setBai(e.target.value)}>
              {NGU_VAN_9.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.title}
                </option>
              ))}
              <option value="other">Something else (type a name)</option>
            </select>
          </Field>
          <Field label={bai === 'other' ? 'Name' : "Bài's title (optional)"} hint="e.g. Thế giới kì ảo">
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Pages: PDF, Word, or photos">
            <input type="file" accept=".pdf,.docx,.txt,image/jpeg,image/png,image/webp" multiple className={inputClass} onChange={(e) => void pick(e.target.files)} />
          </Field>
        </div>
        {file?.kind === 'pdf' && (
          <div className="flex flex-wrap items-end gap-3 text-sm">
            <span className="pb-2">{file.pages} pages — use pages</span>
            <input type="number" min={1} max={file.pages} value={from} onChange={(e) => setFrom(Math.max(1, Math.min(file.pages, Number(e.target.value) || 1)))} className={cx(inputClass, 'w-20')} aria-label="From page" />
            <span className="pb-2">to</span>
            <input type="number" min={from} max={file.pages} value={to} onChange={(e) => setTo(Math.max(from, Math.min(file.pages, Number(e.target.value) || from)))} className={cx(inputClass, 'w-20')} aria-label="To page" />
            {to - from + 1 > MAX_PAGES && <span className="pb-2 text-rose-600">At most {MAX_PAGES} pages — one bài at a time.</span>}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          {FOCUS.map((f) => (
            <label key={f.id} className="flex items-center gap-1.5">
              <input type="checkbox" checked={focus.includes(f.id)} onChange={(e) => setFocus(e.target.checked ? [...focus, f.id] : focus.filter((x) => x !== f.id))} />
              {f.label}
            </label>
          ))}
          <label className="flex items-center gap-1.5">
            About <input type="number" min={5} max={40} value={count} onChange={(e) => setCount(Math.max(5, Math.min(40, Number(e.target.value) || 20)))} className={cx(inputClass, 'w-20')} /> questions
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled={!file || !!busy || !focus.length || to - from + 1 > MAX_PAGES} onClick={() => void make()}>
            ✨ Make questions with AI
          </Button>
          {busy && <span className="text-sm text-slate-500">{busy}</span>}
        </div>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        {done && <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">✓ {done}</p>}

        {drafts && (
          <div className="space-y-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <b>
                {kept} of {drafts.length} questions ticked
              </b>
              <button className="underline" onClick={() => setDrafts(drafts.map((d) => ({ ...d, keep: true })))}>
                tick all
              </button>
              <button className="underline" onClick={() => setDrafts(drafts.map((d) => ({ ...d, keep: false })))}>
                untick all
              </button>
            </div>
            <ol className="space-y-2">
              {drafts.map((d, i) => (
                <li key={i} className={cx('rounded-lg bg-white p-3 text-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700', !d.keep && 'opacity-50')}>
                  <label className="flex items-start gap-2">
                    <input type="checkbox" className="mt-1" checked={d.keep} onChange={(e) => setDrafts(drafts.map((x, j) => (j === i ? { ...x, keep: e.target.checked } : x)))} />
                    <span className="flex-1">
                      <span className="text-xs font-semibold text-slate-500">
                        {LIT_PART_LABEL[d.part].emoji} {LIT_PART_LABEL[d.part].en} · độ khó {d.difficulty}
                      </span>
                      {d.passage && <span className="mt-1 block whitespace-pre-line rounded bg-amber-50 p-2 text-xs italic dark:bg-amber-950/30">{d.passage}</span>}
                      <span className="mt-1 block font-medium">{d.prompt}</span>
                      <span className="mt-1 flex flex-wrap gap-1.5">
                        {d.options.map((o, k) => (
                          <span key={k} className={cx('rounded px-2 py-0.5 text-xs ring-1', k === d.answer ? 'bg-emerald-600 text-white ring-emerald-600' : 'ring-slate-300 dark:ring-slate-600')}>
                            {d.type === 'input' ? `✍️ ${o}` : o}
                          </span>
                        ))}
                      </span>
                      {d.explanation && <span className="mt-1 block text-xs text-slate-500">💡 {d.explanation}</span>}
                    </span>
                  </label>
                </li>
              ))}
            </ol>
            <div className="flex gap-2">
              <Button disabled={!kept} onClick={() => void save()}>
                Save {kept} questions to the Story Library
              </Button>
              <Button variant="ghost" onClick={() => setDrafts(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
