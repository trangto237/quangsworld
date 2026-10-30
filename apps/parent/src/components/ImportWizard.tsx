import { useEffect, useMemo, useRef, useState } from 'react';
import { GLOBAL_SUCCESS_9, PAGE_BREAK, PART_LABEL, autoImport, customUnit, splitByUnit, validateDrafts, type DraftPart, type DraftQuestion, type ImportIssue } from '@atlas/knowledge';
import { Button, Card, Field, cx, inputClass, useRepo } from '@atlas/ui';
import { ACCEPT, extractFile, mergePhotos, type Extracted } from '../lib/extract';
import { BusyError, aiStatus, diagnoseAI, generateWithAI, providerName, transcribeWithAI, type AiStatus, type Check } from '../lib/ai';
import type { OcrProgress } from '../lib/ocr';
import { useCloud } from './Cloud';
import { tr } from '../i18n';

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

/**
 * The text read from a scan is kept on this device until the questions are saved, so a reload (or a
 * phone locking) doesn't throw away minutes of reading.
 */
const DRAFT_KEY = 'atlas-import-draft';
interface Draft {
  name: string;
  text: string;
  at: number;
}
const loadDraft = (): Draft | null => {
  try {
    const d = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? 'null') as Draft | null;
    return d && typeof d.text === 'string' && d.text.trim() ? d : null;
  } catch {
    return null;
  }
};
const keepDraft = (d: Draft | null) => {
  try {
    if (d) localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
    else localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* storage full or blocked: the text is still on screen */
  }
};

/** `unitId` is set in whole-book mode (each question belongs to the unit it came from). */
type Item = DraftQuestion & { key: number; on: boolean; unitId?: string };
type Step = 'source' | 'review' | 'done';

const FORMAT_LABEL = { quick: () => tr('Looks like Quick Import questions'), vocab: () => tr('Looks like a word list'), text: () => tr('Looks like a reading text') } as const;
const TYPE_LABEL: Record<DraftQuestion['type'], () => string> = { mcq: () => tr('Choice'), order: () => tr('Word order'), input: () => tr('Typed') };

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
  /** Just finished reading a scan: how many pages (shows the "what next" banner). */
  const [readDone, setReadDone] = useState<number | null>(null);
  const [draft, setDraft] = useState<Draft | null>(() => loadDraft());
  const [checks, setChecks] = useState<Check[] | null>(null);
  const [perUnit, setPerUnit] = useState(15);
  const aiStop = useRef<AbortController | null>(null);

  useEffect(() => {
    void aiStatus().then(setAi);
  }, []);

  const bookMode = unitId === 'book';
  const unit = unitId === 'other' ? customUnit(customName) : bookMode ? { id: 'book', title: tr('Whole book'), vi: 'Cả cuốn sách' } : GLOBAL_SUCCESS_9.find((u) => u.id === unitId)!;
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
  const aiReads = !!ai?.ai && (ai.provider === 'gemini' || ai.provider === 'openrouter' || !!ai.backup) && !!cloud.config();

  const reset = () => {
    setReadDone(null);
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
    setBusy(tr('Reading the file…'));
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
      if (!res.text.trim()) throw new Error(tr('No text could be read from these pages. Try clearer scans, or the AI option.'));
      setText(res.text);
      setReadDone(res.pages.length);
      keepDraft({ name: src.name, text: res.text, at: Date.now() });
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
      if (!token) throw new Error(tr('Sign in to your family cloud account first (Settings → Cloud sync).'));
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
              setOcrNote(tr("The AI's free tier needs a short break — carrying on in {s} s…", { s }));
              await new Promise((r) => setTimeout(r, 1000));
            }
            setOcrNote(null);
          }
        }
        pages.push(...got);
        setOcr({ done: pages.length, total });
      }
      if (!pages.join('').trim()) throw new Error(tr('No text came back from these pages.'));
    } catch (e) {
      setError(pages.length ? tr('Stopped after {n} pages: {error} The pages read so far are below — you can carry on with them.', { n: pages.length, error: (e as Error).message }) : (e as Error).message);
    } finally {
      if (pages.length) {
        const all = pages.map((p) => p.trim()).join(PAGE_BREAK);
        setText(all);
        setReadDone(pages.length);
        keepDraft({ name: src.name, text: all, at: Date.now() });
        if (splitByUnit(all).length > 1) setUnitId('book');
      }
      setOcr(null);
      setOcrNote(null);
      ocrStop.current = null;
    }
  };

  /** Whole book: AI questions for every unit, one unit at a time (answers and explanations included). */
  const makeBookWithAi = async () => {
    setError(null);
    const stop = new AbortController();
    aiStop.current = stop;
    const all: (DraftQuestion & { unitId: string })[] = [];
    const notes: ImportIssue[] = [];
    try {
      const token = await cloud.parentAccessToken();
      if (!token) throw new Error(tr('Sign in to your family cloud account first (Settings → Cloud sync).'));
      for (const [i, b] of book.entries()) {
        if (stop.signal.aborted) break;
        const name = b.unit.title.split(' · ')[0];
        let got: { drafts: DraftQuestion[]; dropped: number } | null = null;
        for (let attempt = 0; !got && !stop.signal.aborted; attempt++) {
          setBusy(tr('✨ The AI is writing questions for {name} ({n} of {total})…', { name, n: i + 1, total: book.length }));
          try {
            got = await generateWithAI(token, { name: b.unit.title, kind: 'text', size: b.text.length, text: b.text.slice(0, 59_000) }, { unitTitle: b.unit.title, focus, count: perUnit });
          } catch (e) {
            if (e instanceof BusyError && attempt < 5) {
              for (let s = 20; s > 0 && !stop.signal.aborted; s--) {
                setBusy(tr("The AI's free tier needs a short break — carrying on with {name} in {s} s…", { name, s }));
                await new Promise((r) => setTimeout(r, 1000));
              }
              continue;
            }
            notes.push({ line: 0, message: tr('{name}: skipped — {error}', { name, error: (e as Error).message }) });
            break;
          }
        }
        if (got) {
          all.push(...got.drafts.map((d) => ({ ...d, unitId: b.unit.id })));
          if (got.dropped) notes.push({ line: 0, message: tr('{name}: {n} question(s) were not usable and were left out.', { name, n: got.dropped }) });
        }
      }
      if (!all.length) throw new Error(notes[0]?.message ?? tr('No questions came back.'));
      review(all, 'ai', notes);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
      aiStop.current = null;
    }
  };

  /** "Test the AI connection": what each link (Google direct, the Supabase relay, OpenRouter) answers. */
  const testAi = async () => {
    setError(null);
    setChecks(null);
    setBusy(tr('Testing the AI connection…'));
    try {
      const token = await cloud.parentAccessToken();
      if (!token) throw new Error(tr('Sign in to your family cloud account first (Settings → Cloud sync).'));
      setChecks(await diagnoseAI(token));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
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
      if (!drafts.length) return setError(tr('No units with usable text were found. Pick a single unit instead, or check the PDF has selectable text.'));
      return review(drafts, 'offline', book.flatMap((b) => b.made.issues.map((i) => ({ ...i, message: `${b.unit.title.split(' · ')[0]}: ${i.message}` }))));
    }
    if (!detected) return;
    if (!detected.drafts.length) return setError(detected.issues[0]?.message ?? tr('No questions could be made from this text.'));
    review(detected.drafts, 'offline', detected.issues);
  };

  const makeWithAi = async () => {
    setError(null);
    setBusy(tr('{ai} is reading the material and writing questions… (this can take a minute)', { ai: providerName(ai?.provider) }));
    try {
      const token = await cloud.parentAccessToken();
      if (!token) throw new Error(tr('Sign in to your family cloud account first (Settings → Cloud sync).'));
      const source: Extracted = src ? { ...src, text: text.trim() } : { name: tr('Pasted text'), kind: 'text', size: text.length, text: text.trim() };
      const { drafts, dropped } = await generateWithAI(token, source, { unitTitle: unit.title, focus, count });
      review(drafts, 'ai', dropped ? [{ line: 0, message: tr('{n} question(s) from {ai} were not usable and were left out.', { n: dropped, ai: providerName(ai?.provider) }) }] : []);
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
      if (dropped.length) return setError(tr('Fix {n} question(s) in {unit} first: {list}.', { n: dropped.length, unit: g.unit.title, list: dropped.map((d) => `#${d.index + 1} ${d.reason}`).join('; ') }));
    }
    setBusy(tr('Saving…'));
    try {
      let added = 0;
      let skipped = 0;
      const missions: string[] = [];
      for (const [i, g] of groups.entries()) {
        const { drafts } = validateDrafts(g.list.map(({ key: _k, on: _o, unitId: _u, ...d }) => d));
        const res = await repo.importQuestions({
          unit: g.unit,
          materialName: bookMode ? `${src?.name ?? tr('Book')} — ${g.unit.title}` : (src?.name ?? tr('{unit} (pasted text)', { unit: unit.title })),
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
          ? skipped
            ? tr("Saved {n} questions across {units} units ({skipped} were already there). They're in 📘 My Textbook in the kid app.", { n: added, units: groups.length, skipped })
            : tr("Saved {n} questions across {units} units. They're in 📘 My Textbook in the kid app.", { n: added, units: groups.length })
          : skipped
            ? tr("Saved {n} question(s) ({skipped} were already there) to {missions}. They're in 📘 My Textbook in the kid app.", { n: added, skipped, missions: missions.join(', ') })
            : tr("Saved {n} question(s) to {missions}. They're in 📘 My Textbook in the kid app.", { n: added, missions: missions.join(', ') }),
      );
      setStep('done');
      keepDraft(null);
      setDraft(null);
      setReadDone(null);
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
    <Card title={tr('📘 Add textbook or document')} className="lg:col-span-2">
      <ol className="mb-4 flex flex-wrap gap-2 text-sm" aria-label={tr('Steps')}>
        {(
          [
            ['source', tr('1. Add the book')],
            ['make', tr('2. Make questions')],
            ['review', tr('3. Check & save')],
          ] as const
        ).map(([id, label]) => {
          const current = id === 'review' ? step === 'review' : id === 'make' ? step === 'source' && !!text.trim() : step === 'source' && !text.trim();
          const done = step === 'done' || (id === 'source' && !!text.trim()) || (id === 'make' && step === 'review');
          return (
            <li
              key={id}
              className={cx(
                'rounded-full px-3 py-1 font-semibold',
                current ? 'bg-brand-600 text-white' : done ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800',
              )}
            >
              {done && !current ? '✓ ' : ''}
              {label}
            </li>
          );
        })}
      </ol>
      {step === 'done' && (
        <div className="space-y-3">
          <p className="rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">{saved}</p>
          <Button onClick={reset}>{tr('Add more pages')}</Button>
        </div>
      )}

      {step === 'source' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {tr('Upload pages from the school book (PDF, Word, photos) or paste text. The app turns them into missions: word quizzes, sentence building and gap-fills.')}
            </p>
            {draft && !text.trim() && (
              <div className="rounded-xl bg-amber-50 p-3 text-sm dark:bg-amber-950/40">
                <p>
                  {tr('The text read from {name} on {date} is still saved on this device ({n} characters).', { name: draft.name, date: new Date(draft.at).toLocaleString(), n: draft.text.length.toLocaleString() })}
                </p>
                <div className="mt-2 flex gap-2">
                  <Button
                    onClick={() => {
                      setText(draft.text);
                      if (splitByUnit(draft.text).length > 1) setUnitId('book');
                    }}
                  >
                    {tr('Use it')}
                  </Button>
                  <Button variant="ghost" onClick={() => (keepDraft(null), setDraft(null))}>
                    {tr('Throw away')}
                  </Button>
                </div>
              </div>
            )}
            {readDone !== null && text.trim() && (
              <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200" role="status">
                <p className="font-semibold">
                  {readDone === 1
                    ? tr('✅ Read 1 page. The text is below (and kept on this device until you save).')
                    : tr('✅ Read {n} pages. The text is below (and kept on this device until you save).', { n: readDone })}
                </p>
                <p className="mt-1">
                  <b>{tr('Next:')}</b>{' '}
                  {splitByUnit(text).length > 1
                    ? tr("check “Which unit is it?” on the right (📚 Whole book is already selected), then tap “Make questions”. You'll see every question to check, and a “Save” button at the end.")
                    : tr("check “Which unit is it?” on the right, then tap “Make questions”. You'll see every question to check, and a “Save” button at the end.")}
                </p>
              </div>
            )}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                void onFiles(e.dataTransfer.files);
              }}
              className="rounded-2xl border-2 border-dashed border-slate-300 p-5 text-center dark:border-slate-700"
            >
              <Button variant="secondary" onClick={() => fileRef.current?.click()} disabled={!!busy}>
                {tr('Choose file or photos')}
              </Button>
              <input ref={fileRef} type="file" multiple hidden accept={ACCEPT} onChange={(e) => void onFiles(e.target.files)} aria-label={tr('Textbook file')} />
              <p className="mt-2 text-xs text-slate-500">{tr('PDF · DOCX · TXT · photos of pages')}</p>
            </div>
            {src && (
              <p className="text-sm">
                <b>{src.name}</b>
                {src.pages ? ` · ${src.pages === 1 ? tr('1 page') : tr('{n} pages', { n: src.pages })}` : ''}
                {src.text ? ` · ${tr('{n} characters', { n: src.text.length.toLocaleString() })}` : ''}
                {needsAi && !ocr && (
                  <span className="block text-amber-700 dark:text-amber-400">
                    {src.kind === 'image'
                      ? tr('Photos of pages: read them on this device first, or use “Make questions with AI”.')
                      : tr('This PDF is a scan (pictures of pages, no text): read it on this device first, or use “Make questions with AI”.')}
                  </span>
                )}
              </p>
            )}
            {needsAi && !ocr && (
              <div className="space-y-3 rounded-xl bg-sky-50 p-4 text-sm dark:bg-sky-950/40">
                {aiReads && (
                  <div>
                    <Button onClick={() => void readScanWithAI()} disabled={!!busy}>
                      {tr('✨ Read the scanned pages with AI (recommended)')}
                    </Button>
                    <p className="mt-1 text-slate-600 dark:text-slate-300">
                      {tr('Much more accurate on textbook pages (columns, coloured boxes, small print).')}{' '}
                      {tr('Uses {ai}: about {time}, and the pages are sent to Google.', {
                        ai: providerName(ai?.provider) + (ai?.backup ? tr(' (OpenRouter as backup)') : ''),
                        time: src?.pages
                          ? tr('{from}–{to} min for {n} pages', { from: Math.max(1, Math.round(src.pages / 3 / 8)), to: Math.max(2, Math.round(src.pages / 3 / 4)), n: src.pages })
                          : tr('a few seconds per page'),
                      })}
                    </p>
                  </div>
                )}
                <div>
                  <Button variant={aiReads ? 'secondary' : 'primary'} onClick={() => void readScan()} disabled={!!busy}>
                    {tr('🔍 Read the scanned pages on this device')}
                  </Button>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    {aiReads ? tr('Free, and the book never leaves this device, but it makes more mistakes on busy pages.') : tr('Free, and the book never leaves this device.')}{' '}
                    {src?.pages
                      ? tr('About 3–8 seconds per page (≈ {min} min for {n} pages) — keep this tab open. Works best on a laptop.', { min: Math.max(1, Math.round((src.pages * 5) / 60)), n: src.pages })
                      : tr('About 3–8 seconds per page — keep this tab open. Works best on a laptop.')}
                  </p>
                </div>
              </div>
            )}
            {ocr && (
              <div className="rounded-xl bg-sky-50 p-4 text-sm dark:bg-sky-950/40" aria-live="polite">
                <p className="font-semibold">
                  {ocrBy === 'ai'
                    ? tr('The AI is reading page {n} of {total}…', { n: Math.min(ocr.done + 1, ocr.total), total: ocr.total })
                    : tr('Reading page {n} of {total}…', { n: Math.min(ocr.done + 1, ocr.total), total: ocr.total })}
                </p>
                {ocrNote && <p className="text-slate-600 dark:text-slate-300">{ocrNote}</p>}
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-sky-100 dark:bg-sky-900">
                  <div className="h-full bg-sky-500 transition-all" style={{ width: `${(ocr.done / Math.max(1, ocr.total)) * 100}%` }} />
                </div>
                <button className="mt-2 text-xs font-semibold text-slate-500 hover:underline" onClick={() => ocrStop.current?.abort()}>
                  {tr('Stop')}
                </button>
              </div>
            )}
            <Field label={tr('…or paste / edit the text')} hint={tr('Quick Import (numbered questions, * marks the right answer), a word list (word (n): meaning), or a reading passage.')}>
              <textarea className={`${inputClass} h-44 font-mono text-xs`} value={text} onChange={(e) => setText(e.target.value)} placeholder={QUICK_SAMPLE} aria-label={tr('Document text')} />
            </Field>
            <div className="flex flex-wrap gap-2 text-xs">
              <button className="font-semibold text-brand-600 hover:underline dark:text-brand-400" onClick={() => (setSrc(null), setText(QUICK_SAMPLE))}>
                {tr('Quick Import example')}
              </button>
              <button className="font-semibold text-brand-600 hover:underline dark:text-brand-400" onClick={() => (setSrc(null), setText(VOCAB_SAMPLE))}>
                {tr('Word list example')}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <Field label={tr('Which unit is it?')}>
              <select className={inputClass} value={unitId} onChange={(e) => setUnitId(e.target.value)} aria-label={tr('Unit')}>
                <optgroup label="Tiếng Anh 9 Global Success">
                  <option value="book">{tr('📚 Whole book — split by unit automatically')}</option>
                  {GLOBAL_SUCCESS_9.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.title}
                    </option>
                  ))}
                </optgroup>
                <option value="other">{tr('Other book or worksheet…')}</option>
              </select>
            </Field>
            {unitId === 'other' && (
              <Field label={tr('Name')}>
                <input className={inputClass} value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder={tr('e.g. Đề cương giữa kỳ 1')} />
              </Field>
            )}

            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
              <p className="font-semibold">{tr('Make questions on this device (no AI)')}</p>
              <p className="mt-1 text-sm text-slate-500">
                {bookMode ? (
                  !text.trim() ? (
                    tr('Add the book (PDF or Word) first.')
                  ) : book.length ? (
                    <>
                      {tr('Found {units} units', { units: book.length })} → <b>{tr('{n} questions', { n: book.reduce((n, b) => n + b.made.drafts.length, 0) })}</b>
                      <span className="mt-1 block text-xs">
                        {book.map((b) => `${b.unit.title.split(' · ')[0]}${b.pages?.length ? ` (p. ${b.pages[0]}–${b.pages.at(-1)})` : ''}: ${b.made.drafts.length}`).join(' · ')}
                      </span>
                    </>
                  ) : (
                    <span className="text-amber-700 dark:text-amber-400">{tr('No “UNIT 1 … UNIT 12” headings found in this text. Pick a single unit instead.')}</span>
                  )
                ) : detected ? (
                  <>
                    {FORMAT_LABEL[detected.format]()} → <b>{tr('{n} questions', { n: detected.drafts.length })}</b>
                    {detected.issues.length > 0 && <span className="text-amber-700 dark:text-amber-400"> · {tr('{n} line(s) need a look', { n: detected.issues.length })}</span>}
                  </>
                ) : (
                  tr('Add a file or text first.')
                )}
              </p>
              <Button className="mt-3" disabled={(bookMode ? !book.length : !detected?.drafts.length) || !!busy || (unitId === 'other' && !customName.trim())} onClick={makeOffline}>
                {tr('Make questions')}
              </Button>
            </div>

            <div className="rounded-xl bg-violet-50 p-4 dark:bg-violet-950/30">
              <p className="font-semibold">
                {ai?.backup
                  ? tr('✨ Make questions with AI ({ai}, OpenRouter as backup)', { ai: providerName(ai?.provider) })
                  : tr('✨ Make questions with AI ({ai})', { ai: providerName(ai?.provider) })}
              </p>
              {bookMode && ai?.ai && signedInParent ? (
                book.length ? (
                  <>
                    <p className="mt-1 text-sm text-slate-500">
                      {tr("Goes through all {n} units one by one: answers the book's exercises and writes new questions, with explanations in English and Vietnamese. About a minute per unit — keep this tab open. You check everything before saving.", { n: book.length })}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-3 text-sm">
                      {(['vocabulary', 'grammar', 'reading'] as const).map((f) => (
                        <label key={f} className="flex items-center gap-1.5">
                          <input type="checkbox" checked={focus.includes(f)} onChange={(e) => setFocus(e.target.checked ? [...focus, f] : focus.filter((x) => x !== f))} />
                          {tr(PART_LABEL[f].en)}
                        </label>
                      ))}
                    </div>
                    <label className="mt-2 flex items-center gap-2 text-sm">
                      {tr('About')} <input type="number" min={5} max={40} value={perUnit} onChange={(e) => setPerUnit(Number(e.target.value))} className={`${inputClass} w-20`} /> {tr('questions per unit')}
                    </label>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button disabled={!focus.length || !!busy} onClick={() => void makeBookWithAi()}>
                        {tr('✨ Make AI questions for all {n} units', { n: book.length })}
                      </Button>
                      {aiStop.current && busy && (
                        <Button variant="ghost" onClick={() => aiStop.current?.abort()}>
                          {tr("Stop (keep what's done)")}
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="mt-1 text-sm text-slate-500">{tr('Add the book first — the units are found from its “UNIT 1 … UNIT 12” headings.')}</p>
                )
              ) : bookMode && !ai?.ai ? (
                <p className="mt-1 text-sm text-slate-500">{tr("AI isn't set up on the server yet (see the README).")}</p>
              ) : bookMode ? (
                <p className="mt-1 text-sm text-slate-500">{tr('Sign in to your family cloud account (Settings → Cloud sync) to use it.')}</p>
              ) : ai?.ai ? (
                signedInParent ? (
                  <>
                    <p className="mt-1 text-sm text-slate-500">
                      {tr('Reads photos and scanned pages too, and writes explanations in English and Vietnamese.')}
                      {ai.provider === 'gemini' && ` ${tr('Uses the free Gemini tier: a daily limit applies, and Google may use the pages you send (not your child’s data) to improve its products.')}`}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-3 text-sm">
                      {(['vocabulary', 'grammar', 'reading'] as const).map((f) => (
                        <label key={f} className="flex items-center gap-1.5">
                          <input type="checkbox" checked={focus.includes(f)} onChange={(e) => setFocus(e.target.checked ? [...focus, f] : focus.filter((x) => x !== f))} />
                          {tr(PART_LABEL[f].en)}
                        </label>
                      ))}
                    </div>
                    <label className="mt-2 flex items-center gap-2 text-sm">
                      {tr('About')} <input type="number" min={5} max={40} value={count} onChange={(e) => setCount(Number(e.target.value))} className={`${inputClass} w-20`} /> {tr('questions')}
                    </label>
                    <Button className="mt-3" disabled={(!text.trim() && !needsAi) || !focus.length || !!busy || (unitId === 'other' && !customName.trim())} onClick={() => void makeWithAi()}>
                      {tr('Make questions with AI')}
                    </Button>
                  </>
                ) : (
                  <p className="mt-1 text-sm text-slate-500">{tr('Sign in to your family cloud account (Settings → Cloud sync) to use it.')}</p>
                )
              ) : (
                <p className="mt-1 text-sm text-slate-500">
                  {tr('Not set up. To turn it on for free: get a key at aistudio.google.com (Get API key), add it as a GEMINI_API_KEY secret in Cloudflare Pages (Settings → Variables and Secrets), redeploy, and set up cloud sync — see the README.')}
                  {ai?.missing.length ? ` ${tr('Missing on the server: {list}.', { list: ai.missing.join(', ') })}` : ''}
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
              <b>{bookMode ? tr('{n} units', { n: new Set(items.map((i) => i.unitId)).size }) : unit.title}</b> · {tr('{n} of {total} questions selected', { n: selected, total: items.length })}{' '}
              {via === 'ai' && <span className="rounded bg-violet-100 px-1.5 text-xs text-violet-800 dark:bg-violet-950 dark:text-violet-300">{tr('made with {ai}', { ai: providerName(ai?.provider) })}</span>}
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setItems(items.map((i) => ({ ...i, on: true })))}>
                {tr('All')}
              </Button>
              <Button variant="ghost" onClick={() => setItems(items.map((i) => ({ ...i, on: false })))}>
                {tr('None')}
              </Button>
            </div>
          </div>
          {issues.length > 0 && (
            <ul className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              {issues.map((i, k) => (
                <li key={k}>
                  {i.line > 0 && <b>{tr('Line {n}:', { n: i.line })} </b>}
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
                      {u.title} <span className="font-normal text-slate-500">· {tr('{n} of {total}', { n: on, total: list.length })}</span>
                    </span>
                    <span className="flex gap-3 text-xs">
                      <button type="button" className="text-brand-600 hover:underline" onClick={(e) => (e.preventDefault(), setItems(items.map((i) => (i.unitId === u.id ? { ...i, on: true } : i))))}>
                        {tr('All')}
                      </button>
                      <button type="button" className="text-brand-600 hover:underline" onClick={(e) => (e.preventDefault(), setItems(items.map((i) => (i.unitId === u.id ? { ...i, on: false } : i))))}>
                        {tr('None')}
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
          <div className="sticky bottom-0 -mx-1 flex flex-wrap items-center gap-2 border-t border-slate-200 bg-white/95 px-1 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
            <Button disabled={!selected || !!busy} onClick={() => void save()}>
              {bookMode ? tr('Save {n} questions to their units', { n: selected }) : tr('Save {n} questions to {unit}', { n: selected, unit: unit.title.split(' · ')[0] })}
            </Button>
            <Button variant="secondary" onClick={() => setStep('source')}>
              {tr('Back')}
            </Button>
            <span className="text-xs text-slate-500">{tr('Saved questions appear in 📘 My Textbook in the kid app.')}</span>
          </div>
        </div>
      )}

      {ai?.reachable && signedInParent && step === 'source' && (
        <div className="mt-4 text-sm">
          <button className="font-semibold text-brand-600 hover:underline dark:text-brand-400" onClick={() => void testAi()} disabled={!!busy}>
            {tr('🩺 Test the AI connection')}
          </button>
          {checks && (
            <ul className="mt-2 space-y-1 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50" aria-label={tr('AI connection checks')}>
              {checks.map((c) => (
                <li key={c.step}>
                  {c.ok ? '✅' : '❌'} <b>{c.step}:</b> <span className="break-words">{c.detail}</span>
                </li>
              ))}
            </ul>
          )}
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
        {PART_LABEL[part].emoji} {tr(PART_LABEL[part].en)}
      </h3>
      <ol className="space-y-2">
        {list.map((q) => (
        <li key={q.key} className={cx('rounded-xl p-3 ring-1', q.on ? 'ring-slate-200 dark:ring-slate-700' : 'opacity-50 ring-slate-100 dark:ring-slate-800')}>
          <div className="flex items-start gap-3">
            <input type="checkbox" className="mt-2" checked={q.on} onChange={(e) => update(q.key, { on: e.target.checked } as Partial<Item>)} aria-label={tr('Include question')} />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="shrink-0 rounded bg-slate-100 px-1.5 text-xs font-semibold dark:bg-slate-800">{TYPE_LABEL[q.type]()}</span>
                <input className={`${inputClass} py-1 text-sm`} value={q.prompt} onChange={(e) => update(q.key, { prompt: e.target.value })} aria-label={tr('Question')} />
              </div>
              {q.type === 'mcq' ? (
                <div className="grid gap-1 sm:grid-cols-2">
                  {q.options.map((o, k) => (
                    <label key={k} className="flex items-center gap-2 text-sm">
                      <input type="radio" name={`a-${q.key}`} checked={q.answer === k} onChange={() => update(q.key, { answer: k })} aria-label={tr('Right answer {n}', { n: k + 1 })} />
                      <input
                        className={cx(inputClass, 'py-1 text-sm', q.answer === k && 'ring-emerald-400')}
                        value={o}
                        onChange={(e) => update(q.key, { options: q.options.map((x, j) => (j === k ? e.target.value : x)) })}
                        aria-label={tr('Option {n}', { n: k + 1 })}
                      />
                    </label>
                  ))}
                </div>
              ) : (
                <label className="flex items-center gap-2 text-sm">
                  <span className="shrink-0 text-slate-500">{q.type === 'order' ? tr('Sentence') : tr('Answer')}</span>
                  <input className={`${inputClass} py-1 text-sm`} value={q.options[0]} onChange={(e) => update(q.key, { options: [e.target.value] })} aria-label={tr('Answer')} />
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
