import { useEffect, useMemo, useRef, useState } from 'react';
import { GLOBAL_SUCCESS_9, PAGE_BREAK, PART_LABEL, autoImport, customUnit, splitByUnit, validateDrafts, type DraftPart, type DraftQuestion, type ImportIssue } from '@atlas/knowledge';
import { Button, Card, Field, cx, inputClass, useRepo } from '@atlas/ui';
import { ACCEPT, extractFile, mergePhotos, type Extracted } from '../lib/extract';
import { BusyError, aiStatus, generateWithAI, providerName, transcribeWithAI, type AiStatus } from '../lib/ai';
import type { OcrProgress } from '../lib/ocr';
import { useCloud } from './Cloud';

const QUICK_SAMPLE = `1. She ___ to school every day.
A. go
*B. goes
C. going
D. gone

2. Ha Long Bay is famous ___ its limestone islands.
A. at
B. of
*C. for
D. with`;

const VOCAB_SAMPLE = `cave (n): hang động
waterfall (n): thác nước
landscape (n): phong cảnh
breathtaking (adj): đẹp ngoạn mục
explore (v): khám phá
preserve (v): bảo tồn`;

/** `unitId` is set in whole-book mode (each question belongs to the unit it came from). */
type Item = DraftQuestion & { key: number; on: boolean; unitId?: string };
type Step = 'source' | 'review' | 'done';

const FORMAT_LABEL = { quick: 'Quick Import questions', vocab: 'a word list', text: 'a reading text' } as const;
const TYPE_LABEL: Record<DraftQuestion['type'], string> = { mcq: 'Choice', order: 'Word order', input: 'Typed' };

/**
 * "Add textbook / document": a page, a worksheet or a word list becomes game missions.
 * Offline questions always; "Make questions with AI" when the server has Gemini (or Claude) set up.
 */
export function ImportWizard() {
  const repo = useRepo();
  const { cloud, status } = useCloud();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('source');
  const [src, setSrc] = useState<Extracted | null>(null);
  const [text, setText] = useState('');
  const [unitId, setUnitId] = useState(GLOBAL_SUCCESS_9[0].id);
  const [customName, setCustomName] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [issues, setIssues] = useState<ImportIssue[]>([]);
  const [via, setVia] = useState<'offline' | 'ai'>('offline');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [ai, setAi] = useState<AiStatus | null>(null);
  const [focus, setFocus] = useState<('vocabulary' | 'grammar' | 'reading')[]>(['vocabulary', 'grammar', 'reading']);
  const [count, setCount] = useState(20);
  const [ocr, setOcr] = useState<OcrProgress | null>(null);
  const ocrStop = useRef<AbortController | null>(null);
  /** Who is reading the scan, and any note ("Gemini is busy, waiting…"). */
  const [ocrBy, setOcrBy] = useState<'device' | 'ai'>('device');
  const [ocrNote, setOcrNote] = useState<string | null>(null);

  useEffect(() => {
    void aiStatus().then(setAi);
  }, []);

  const bookMode = unitId === 'book';
  const unit = unitId === 'other' ? customUnit(customName) : bookMode ? { id: 'book', title: 'Whole book', vi: 'Cả cuốn sách' } : GLOBAL_SUCCESS_9.find((u) => u.id === unitId)!;
  /** Whole-book mode: the book cut into units, each with its own questions. */
  const book = useMemo(
    () =>
      bookMode && text.trim()
        ? splitByUnit(text, GLOBAL_SUCCESS_9.length).map((sec) => ({ ...sec, unit: GLOBAL_SUCCESS_9[sec.unit - 1], made: autoImport(sec.text) }))
        : [],
    [bookMode, text],
  );
  const detected = useMemo(() => (text.trim() && !bookMode ? autoImport(text) : null), [text, bookMode]);
  const signedInParent = !!status.email && !status.viaCode;
  const needsAi = !!src && !text.trim() && (src.scanned || src.kind === 'image');
  /** The AI can read scans (Gemini on the server, and the parent is signed in to the cloud). */
  const aiReads = !!ai?.ai && ai.provider === 'gemini' && !!cloud.config();

  const reset = () => {
    setStep('source');
    setSrc(null);
    setText('');
    setItems([]);
    setIssues([]);
    setError(null);
  };

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    setSaved(null);
    setBusy('Reading the file…');
    try {
      const list = await Promise.all(Array.from(files).map(extractFile));
      const photos = list.filter((e) => e.kind === 'image');
      const one = photos.length === list.length && photos.length > 1 ? mergePhotos(photos) : list[0];
      setSrc(one);
      setText(one.text);
      if (one.text && splitByUnit(one.text).length > 1) setUnitId('book');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  /** Scanned PDF or photos: read the text on this device (OCR), then everything else works as usual. */
  const readScan = async () => {
    if (!src) return;
    setError(null);
    const stop = new AbortController();
    ocrStop.current = stop;
    setOcrBy('device');
    setOcr({ done: 0, total: src.pages ?? src.images?.length ?? 1 });
    try {
      const { ocrPdf, ocrImages } = await import('../lib/ocr');
      const res =
        src.kind === 'pdf' && src.bytes
          ? await ocrPdf(src.bytes, setOcr, stop.signal)
          : await ocrImages((src.images ?? []).map((i) => `data:${i.mediaType};base64,${i.data}`), setOcr, stop.signal);
      if (!res.text.trim()) throw new Error('No text could be read from these pages. Try clearer scans, or the AI option.');
      setText(res.text);
      // A whole book read in one go: offer to split it by unit straight away.
      if (splitByUnit(res.text).length > 1) setUnitId('book');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setOcr(null);
      ocrStop.current = null;
    }
  };

  /**
   * Scanned PDF or photos read by the AI (Gemini, on the server): far more accurate on textbook pages.
   * Four pages per request; when the free tier says "slow down", wait and try again.
   */
  const readScanWithAI = async () => {
    if (!src) return;
    setError(null);
    const stop = new AbortController();
    ocrStop.current = stop;
    setOcrBy('ai');
    const pages: string[] = [];
    try {
      const token = await cloud.parentAccessToken();
      if (!token) throw new Error('Sign in to your family cloud account first (Settings → Cloud sync).');
      const { openPdf, pageJpeg, photoJpeg } = await import('../lib/ocr');
      const pdf = src.kind === 'pdf' && src.bytes ? await openPdf(src.bytes) : null;
      const total = pdf ? pdf.numPages : (src.images ?? []).length;
      setOcr({ done: 0, total });
      const BATCH = 3;
      for (let from = 0; from < total; from += BATCH) {
        if (stop.signal.aborted) break;
        const idx = Array.from({ length: Math.min(BATCH, total - from) }, (_, i) => from + i);
        const images = await Promise.all(
          idx.map((i) => (pdf ? pageJpeg(pdf, i + 1) : photoJpeg(`data:${src.images![i].mediaType};base64,${src.images![i].data}`))),
        );
        let got: string[] | null = null;
        for (let attempt = 0; !got; attempt++) {
          try {
            got = await transcribeWithAI(token, images);
          } catch (e) {
            if (!(e instanceof BusyError) || attempt >= 5 || stop.signal.aborted) throw e;
            // Free tier: a few requests a minute. Wait, then carry on.
            for (let s = 20; s > 0 && !stop.signal.aborted; s--) {
              setOcrNote(`Gemini's free tier needs a short break — carrying on in ${s} s…`);
              await new Promise((r) => setTimeout(r, 1000));
            }
            setOcrNote(null);
          }
        }
        pages.push(...got);
        setOcr({ done: pages.length, total });
      }
      if (!pages.join('').trim()) throw new Error('No text came back from these pages.');
    } catch (e) {
      setError(pages.length ? `Stopped after ${pages.length} pages: ${(e as Error).message} The pages read so far are below — you can carry on with them.` : (e as Error).message);
    } finally {
      if (pages.length) {
        const all = pages.map((p) => p.trim()).join(PAGE_BREAK);
        setText(all);
        if (splitByUnit(all).length > 1) setUnitId('book');
      }
      setOcr(null);
      setOcrNote(null);
      ocrStop.current = null;
    }
  };

  const review = (drafts: (DraftQuestion & { unitId?: string })[], how: 'offline' | 'ai', found: ImportIssue[] = []) => {
    setItems(drafts.map((d, key) => ({ ...d, key, on: true })));
    setIssues(found);
    setVia(how);
    setStep('review');
  };

  const makeOffline = () => {
    if (bookMode) {
      const drafts = book.flatMap((b) => b.made.drafts.map((d) => ({ ...d, unitId: b.unit.id })));
      if (!drafts.length) return setError('No units with usable text were found. Pick a single unit instead, or check the PDF has selectable text.');
      return review(drafts, 'offline', book.flatMap((b) => b.made.issues.map((i) => ({ ...i, message: `${b.unit.title.split(' · ')[0]}: ${i.message}` }))));
    }
    if (!detected) return;
    if (!detected.drafts.length) return setError(detected.issues[0]?.message ?? 'No questions could be made from this text.');
    review(detected.drafts, 'offline', detected.issues);
  };

  const makeWithAi = async () => {
    setError(null);
    setBusy(`${providerName(ai?.provider)} is reading the material and writing questions… (this can take a minute)`);
    try {
      const token = await cloud.parentAccessToken();
      if (!token) throw new Error('Sign in to your family cloud account first (Settings → Cloud sync).');
      const source: Extracted = src ? { ...src, text: text.trim() } : { name: 'Pasted text', kind: 'text', size: text.length, text: text.trim() };
      const { drafts, dropped } = await generateWithAI(token, source, { unitTitle: unit.title, focus, count });
      review(drafts, 'ai', dropped ? [{ line: 0, message: `${dropped} question(s) from ${providerName(ai?.provider)} were not usable and were left out.` }] : []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const save = async () => {
    const chosen = items.filter((i) => i.on);
    // Whole-book mode saves each unit's questions to that unit; otherwise everything goes to one unit.
    const groups = bookMode ? GLOBAL_SUCCESS_9.map((u) => ({ unit: u, list: chosen.filter((i) => i.unitId === u.id) })).filter((g) => g.list.length) : [{ unit, list: chosen }];
    for (const g of groups) {
      const { dropped } = validateDrafts(g.list.map(({ key: _k, on: _o, unitId: _u, ...d }) => d));
      if (dropped.length) return setError(`Fix ${dropped.length} question(s) in ${g.unit.title} first: ${dropped.map((d) => `#${d.index + 1} ${d.reason}`).join('; ')}.`);
    }
    setBusy('Saving…');
    try {
      let added = 0;
      let skipped = 0;
      const missions: string[] = [];
      for (const [i, g] of groups.entries()) {
        const { drafts } = validateDrafts(g.list.map(({ key: _k, on: _o, unitId: _u, ...d }) => d));
        const res = await repo.importQuestions({
          unit: g.unit,
          materialName: bookMode ? `${src?.name ?? 'Book'} — ${g.unit.title}` : (src?.name ?? `${unit.title} (pasted text)`),
          kind: src?.kind ?? 'text',
          drafts,
          via,
          // The original file is kept once (with the first unit), not once per unit.
          bytes: i === 0 ? src?.bytes : undefined,
          size: i === 0 ? (src?.size ?? text.length) : 0,
          excerpt: (bookMode ? book.find((b) => b.unit.id === g.unit.id)?.text : text.trim()) || undefined,
        });
        added += res.added;
        skipped += res.skipped;
        missions.push(...res.concepts.map((c) => c.missionName));
      }
      setSaved(
        bookMode
          ? `Saved ${added} questions across ${groups.length} units${skipped ? ` (${skipped} were already there)` : ''}. They're in 📘 My Textbook in the kid app.`
          : `Saved ${added} question${added === 1 ? '' : 's'}${skipped ? ` (${skipped} were already there)` : ''} to ${missions.join(', ')}. They're in 📘 My Textbook in the kid app.`,
      );
      setStep('done');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const update = (key: number, patch: Partial<Item>) => setItems((list) => list.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  const parts = [...new Set(items.map((i) => i.part))] as DraftPart[];
  const selected = items.filter((i) => i.on).length;

  return (
    <Card title="📘 Add textbook or document" className="lg:col-span-2">
      {step === 'done' && (
        <div className="space-y-3">
          <p className="rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">{saved}</p>
          <Button onClick={reset}>Add more pages</Button>
        </div>
      )}

      {step === 'source' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Upload pages from the school book (PDF, Word, photos) or paste text. The app turns them into missions: word quizzes, sentence building and gap-fills.
            </p>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                void onFiles(e.dataTransfer.files);
              }}
              className="rounded-2xl border-2 border-dashed border-slate-300 p-5 text-center dark:border-slate-700"
            >
              <Button variant="secondary" onClick={() => fileRef.current?.click()} disabled={!!busy}>
                Choose file or photos
              </Button>
              <input ref={fileRef} type="file" multiple hidden accept={ACCEPT} onChange={(e) => void onFiles(e.target.files)} aria-label="Textbook file" />
              <p className="mt-2 text-xs text-slate-500">PDF · DOCX · TXT · photos of pages</p>
            </div>
            {src && (
              <p className="text-sm">
                <b>{src.name}</b>
                {src.pages ? ` · ${src.pages} page${src.pages === 1 ? '' : 's'}` : ''}
                {src.text ? ` · ${src.text.length.toLocaleString()} characters` : ''}
                {needsAi && !ocr && <span className="block text-amber-700 dark:text-amber-400">{src.kind === 'image' ? 'Photos of pages' : 'This PDF is a scan (pictures of pages, no text)'}: read it on this device first, or use “Make questions with AI”.</span>}
              </p>
            )}
            {needsAi && !ocr && (
              <div className="space-y-3 rounded-xl bg-sky-50 p-4 text-sm dark:bg-sky-950/40">
                {aiReads && (
                  <div>
                    <Button onClick={() => void readScanWithAI()} disabled={!!busy}>
                      ✨ Read the scanned pages with AI (recommended)
                    </Button>
                    <p className="mt-1 text-slate-600 dark:text-slate-300">
                      Much more accurate on textbook pages (columns, coloured boxes, small print). Uses the free Gemini tier: about {src?.pages ? `${Math.max(1, Math.round(src.pages / 3 / 8))}–${Math.max(2, Math.round(src.pages / 3 / 4))} min for ${src.pages} pages` : 'a few seconds per page'}, and the pages are sent to Google.
                    </p>
                  </div>
                )}
                <div>
                  <Button variant={aiReads ? 'secondary' : 'primary'} onClick={() => void readScan()} disabled={!!busy}>
                    🔍 Read the scanned pages on this device
                  </Button>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    Free, and the book never leaves this device{aiReads ? ', but it makes more mistakes on busy pages' : ''}. About 3–8 seconds per page{src?.pages ? ` (≈ ${Math.max(1, Math.round((src.pages * 5) / 60))} min for ${src.pages} pages)` : ''} — keep this tab open. Works best on a laptop.
                  </p>
                </div>
              </div>
            )}
            {ocr && (
              <div className="rounded-xl bg-sky-50 p-4 text-sm dark:bg-sky-950/40" aria-live="polite">
                <p className="font-semibold">
                  {ocrBy === 'ai' ? 'Gemini is reading' : 'Reading'} page {Math.min(ocr.done + 1, ocr.total)} of {ocr.total}…
                </p>
                {ocrNote && <p className="text-slate-600 dark:text-slate-300">{ocrNote}</p>}
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-sky-100 dark:bg-sky-900">
                  <div className="h-full bg-sky-500 transition-all" style={{ width: `${(ocr.done / Math.max(1, ocr.total)) * 100}%` }} />
                </div>
                <button className="mt-2 text-xs font-semibold text-slate-500 hover:underline" onClick={() => ocrStop.current?.abort()}>
                  Stop
                </button>
              </div>
            )}
            <Field label="…or paste / edit the text" hint="Quick Import (numbered questions, * marks the right answer), a word list (word (n): meaning), or a reading passage.">
              <textarea className={`${inputClass} h-44 font-mono text-xs`} value={text} onChange={(e) => setText(e.target.value)} placeholder={QUICK_SAMPLE} aria-label="Document text" />
            </Field>
            <div className="flex flex-wrap gap-2 text-xs">
              <button className="font-semibold text-brand-600 hover:underline dark:text-brand-400" onClick={() => (setSrc(null), setText(QUICK_SAMPLE))}>
                Quick Import example
              </button>
              <button className="font-semibold text-brand-600 hover:underline dark:text-brand-400" onClick={() => (setSrc(null), setText(VOCAB_SAMPLE))}>
                Word list example
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <Field label="Which unit is it?">
              <select className={inputClass} value={unitId} onChange={(e) => setUnitId(e.target.value)} aria-label="Unit">
                <optgroup label="Tiếng Anh 9 Global Success">
                  <option value="book">📚 Whole book — split by unit automatically</option>
                  {GLOBAL_SUCCESS_9.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.title}
                    </option>
                  ))}
                </optgroup>
                <option value="other">Other book or worksheet…</option>
              </select>
            </Field>
            {unitId === 'other' && (
              <Field label="Name">
                <input className={inputClass} value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="e.g. Đề cương giữa kỳ 1" />
              </Field>
            )}

            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
              <p className="font-semibold">Make questions on this device</p>
              <p className="mt-1 text-sm text-slate-500">
                {bookMode ? (
                  !text.trim() ? (
                    'Add the book (PDF or Word) first.'
                  ) : book.length ? (
                    <>
                      Found <b>{book.length} units</b> → <b>{book.reduce((n, b) => n + b.made.drafts.length, 0)} questions</b>
                      <span className="mt-1 block text-xs">
                        {book.map((b) => `${b.unit.title.split(' · ')[0]}${b.pages?.length ? ` (p. ${b.pages[0]}–${b.pages.at(-1)})` : ''}: ${b.made.drafts.length}`).join(' · ')}
                      </span>
                    </>
                  ) : (
                    <span className="text-amber-700 dark:text-amber-400">No “UNIT 1 … UNIT 12” headings found in this text. Pick a single unit instead.</span>
                  )
                ) : detected ? (
                  <>
                    Looks like {FORMAT_LABEL[detected.format]} → <b>{detected.drafts.length} questions</b>
                    {detected.issues.length > 0 && <span className="text-amber-700 dark:text-amber-400"> · {detected.issues.length} line(s) need a look</span>}
                  </>
                ) : (
                  'Add a file or text first.'
                )}
              </p>
              <Button className="mt-3" disabled={(bookMode ? !book.length : !detected?.drafts.length) || !!busy || (unitId === 'other' && !customName.trim())} onClick={makeOffline}>
                Make questions
              </Button>
            </div>

            <div className="rounded-xl bg-violet-50 p-4 dark:bg-violet-950/30">
              <p className="font-semibold">✨ Make questions with AI ({providerName(ai?.provider)})</p>
              {bookMode ? (
                <p className="mt-1 text-sm text-slate-500">AI works one unit at a time — choose a unit above (it can read that unit's pages, including scans).</p>
              ) : ai?.ai ? (
                signedInParent ? (
                  <>
                    <p className="mt-1 text-sm text-slate-500">
                      Reads photos and scanned pages too, and writes explanations in English and Vietnamese.
                      {ai.provider === 'gemini' && ' Uses the free Gemini tier: a daily limit applies, and Google may use the pages you send (not your child’s data) to improve its products.'}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-3 text-sm">
                      {(['vocabulary', 'grammar', 'reading'] as const).map((f) => (
                        <label key={f} className="flex items-center gap-1.5">
                          <input type="checkbox" checked={focus.includes(f)} onChange={(e) => setFocus(e.target.checked ? [...focus, f] : focus.filter((x) => x !== f))} />
                          {PART_LABEL[f].en}
                        </label>
                      ))}
                    </div>
                    <label className="mt-2 flex items-center gap-2 text-sm">
                      About <input type="number" min={5} max={40} value={count} onChange={(e) => setCount(Number(e.target.value))} className={`${inputClass} w-20`} /> questions
                    </label>
                    <Button className="mt-3" disabled={(!text.trim() && !needsAi) || !focus.length || !!busy || (unitId === 'other' && !customName.trim())} onClick={() => void makeWithAi()}>
                      Make questions with AI
                    </Button>
                  </>
                ) : (
                  <p className="mt-1 text-sm text-slate-500">Sign in to your family cloud account (Settings → Cloud sync) to use it.</p>
                )
              ) : (
                <p className="mt-1 text-sm text-slate-500">
                  Not set up. To turn it on for free: get a key at <b>aistudio.google.com</b> (Get API key), add it as a <b>GEMINI_API_KEY</b> secret in Cloudflare Pages (Settings → Variables and
                  Secrets), redeploy, and set up cloud sync — see the README.
                  {ai?.missing.length ? ` Missing on the server: ${ai.missing.join(', ')}.` : ''}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {step === 'review' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm">
              <b>{bookMode ? `${new Set(items.map((i) => i.unitId)).size} units` : unit.title}</b> · {selected} of {items.length} questions selected {via === 'ai' && <span className="rounded bg-violet-100 px-1.5 text-xs text-violet-800 dark:bg-violet-950 dark:text-violet-300">made with {providerName(ai?.provider)}</span>}
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setItems(items.map((i) => ({ ...i, on: true })))}>
                All
              </Button>
              <Button variant="ghost" onClick={() => setItems(items.map((i) => ({ ...i, on: false })))}>
                None
              </Button>
            </div>
          </div>
          {issues.length > 0 && (
            <ul className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              {issues.map((i, k) => (
                <li key={k}>
                  {i.line > 0 && <b>Line {i.line}: </b>}
                  {i.message}
                </li>
              ))}
            </ul>
          )}
          {bookMode &&
            GLOBAL_SUCCESS_9.filter((u) => items.some((i) => i.unitId === u.id)).map((u, ui) => {
              const list = items.filter((i) => i.unitId === u.id);
              const on = list.filter((i) => i.on).length;
              return (
                <details key={u.id} open={ui === 0} className="rounded-xl ring-1 ring-slate-200 dark:ring-slate-700">
                  <summary className="flex cursor-pointer items-center justify-between gap-2 px-4 py-3 font-semibold">
                    <span>
                      {u.title} <span className="font-normal text-slate-500">· {on} of {list.length}</span>
                    </span>
                    <span className="flex gap-3 text-xs">
                      <button type="button" className="text-brand-600 hover:underline" onClick={(e) => (e.preventDefault(), setItems(items.map((i) => (i.unitId === u.id ? { ...i, on: true } : i))))}>
                        All
                      </button>
                      <button type="button" className="text-brand-600 hover:underline" onClick={(e) => (e.preventDefault(), setItems(items.map((i) => (i.unitId === u.id ? { ...i, on: false } : i))))}>
                        None
                      </button>
                    </span>
                  </summary>
                  <div className="space-y-4 px-4 pb-4">
                    {([...new Set(list.map((i) => i.part))] as DraftPart[]).map((part) => (
                      <ReviewPart key={part} part={part} list={list.filter((i) => i.part === part)} update={update} />
                    ))}
                  </div>
                </details>
              );
            })}
          {!bookMode && parts.map((part) => <ReviewPart key={part} part={part} list={items.filter((i) => i.part === part)} update={update} />)}
          <div className="flex flex-wrap gap-2">
            <Button disabled={!selected || !!busy} onClick={() => void save()}>
              Save {selected} questions{bookMode ? ' to their units' : ` to ${unit.title.split(' · ')[0]}`}
            </Button>
            <Button variant="secondary" onClick={() => setStep('source')}>
              Back
            </Button>
          </div>
        </div>
      )}

      {busy && <p className="mt-3 text-sm font-semibold text-brand-600 dark:text-brand-400">{busy}</p>}
      {error && <p className="mt-3 text-sm font-semibold text-rose-600">{error}</p>}
    </Card>
  );
}

/** One part of the review list (vocabulary, sentences…): each question can be ticked off and edited. */
function ReviewPart({ part, list, update }: { part: DraftPart; list: Item[]; update: (key: number, patch: Partial<Item>) => void }) {
  return (
    <section>
      <h3 className="mb-2 font-semibold">
        {PART_LABEL[part].emoji} {PART_LABEL[part].en}
      </h3>
      <ol className="space-y-2">
        {list.map((q) => (
        <li key={q.key} className={cx('rounded-xl p-3 ring-1', q.on ? 'ring-slate-200 dark:ring-slate-700' : 'opacity-50 ring-slate-100 dark:ring-slate-800')}>
          <div className="flex items-start gap-3">
            <input type="checkbox" className="mt-2" checked={q.on} onChange={(e) => update(q.key, { on: e.target.checked } as Partial<Item>)} aria-label="Include question" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="shrink-0 rounded bg-slate-100 px-1.5 text-xs font-semibold dark:bg-slate-800">{TYPE_LABEL[q.type]}</span>
                <input className={`${inputClass} py-1 text-sm`} value={q.prompt} onChange={(e) => update(q.key, { prompt: e.target.value })} aria-label="Question" />
              </div>
              {q.type === 'mcq' ? (
                <div className="grid gap-1 sm:grid-cols-2">
                  {q.options.map((o, k) => (
                    <label key={k} className="flex items-center gap-2 text-sm">
                      <input type="radio" name={`a-${q.key}`} checked={q.answer === k} onChange={() => update(q.key, { answer: k })} aria-label={`Right answer ${k + 1}`} />
                      <input
                        className={cx(inputClass, 'py-1 text-sm', q.answer === k && 'ring-emerald-400')}
                        value={o}
                        onChange={(e) => update(q.key, { options: q.options.map((x, j) => (j === k ? e.target.value : x)) })}
                        aria-label={`Option ${k + 1}`}
                      />
                    </label>
                  ))}
                </div>
              ) : (
                <label className="flex items-center gap-2 text-sm">
                  <span className="shrink-0 text-slate-500">{q.type === 'order' ? 'Sentence' : 'Answer'}</span>
                  <input className={`${inputClass} py-1 text-sm`} value={q.options[0]} onChange={(e) => update(q.key, { options: [e.target.value] })} aria-label="Answer" />
                </label>
              )}
              {q.explanation && <p className="text-xs text-slate-500">💡 {q.explanation}</p>}
            </div>
          </div>
        </li>
        ))}
      </ol>
    </section>
  );
}
