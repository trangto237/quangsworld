import { useState } from 'react';
import { KIND_INFO, buildImportedExam, examSize, type ImportedExam, type ImportedKind } from '@atlas/engine';
import { PAGE_BREAK } from '@atlas/knowledge';
import { uid } from '@atlas/shared';
import { Button, Card, Field, cx, inputClass, useQuery, useRepo } from '@atlas/ui';
import { BusyError, generateIeltsWithAI, readExamWithAI } from '../lib/ai';
import { pdfText } from '../lib/extract';
import { openPdf, pageJpeg, photoJpeg } from '../lib/ocr';
import { useCloud } from './Cloud';
import { tr } from '../i18n';

const MAX_PAGES = 28;
const GEN_TYPES = [
  ['headings', 'Matching headings'],
  ['tfng', 'True / False / Not Given'],
  ['ynng', "Writer's views (Yes / No / Not Given)"],
  ['features', 'Matching features'],
  ['endings', 'Sentence endings'],
  ['mc', 'Multiple choice'],
  ['choose-two', 'Choose TWO'],
  ['summary-list', 'Summary (from a list)'],
  ['completion', 'Summary / notes / flow-chart (words from the text)'],
] as const;

/** Typed answers of a generated test must be words from the passage; the ones that aren't go to the parent to check. */
function flagUnsure(e: ImportedExam): ImportedExam {
  const low = (s: string) => s.toLowerCase().replace(/[’']/g, "'");
  const unsure = e.sections.flatMap((s) => s.questions.filter((q) => q.type === 'input' && !low(q.passage ?? '').includes(low(q.options[0]))).map((q) => q.id));
  return { ...e, aiAnswered: [...new Set([...e.aiAnswered, ...unsure])] };
}
const KINDS: ImportedKind[] = ['hn10', 'ielts-reading', 'ielts-listening'];

interface Picked {
  name: string;
  kind: 'pdf' | 'image' | 'text';
  size: number;
  bytes?: Uint8Array;
  pages: number;
  photos?: File[];
}

/**
 * Import a real exam paper (past Hà Nội grade-10 papers, sample papers, IELTS practice tests): the pages are
 * read by AI on the server, the parent checks the answers, and the paper appears in the kid's Exam Hall.
 */
export function ExamImport() {
  const repo = useRepo();
  const { cloud } = useCloud();
  const exams = useQuery((r) => r.listImportedExams());
  const [kind, setKind] = useState<ImportedKind>('hn10');
  const [name, setName] = useState('');
  const [file, setFile] = useState<Picked | null>(null);
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(1);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exam, setExam] = useState<ImportedExam | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [genTopic, setGenTopic] = useState('');
  const [genLevel, setGenLevel] = useState<3 | 4 | 5>(4);
  const [genTypes, setGenTypes] = useState<string[]>(['headings', 'tfng', 'completion']);

  const generate = async () => {
    setError(null);
    setExam(null);
    setDone(null);
    try {
      const token = await cloud.parentAccessToken();
      if (!token) throw new Error(tr('Sign in to your family cloud account first (Settings → Cloud sync).'));
      setBusy(tr('Writing a new passage and questions with AI… (about a minute)'));
      const opts = { topic: genTopic, level: genLevel, types: genTypes };
      let raw: unknown;
      try {
        raw = await generateIeltsWithAI(token, opts);
      } catch (e) {
        if (!(e instanceof BusyError)) throw e;
        setBusy(tr('The AI is busy — trying again in 20 seconds…'));
        await new Promise((r) => setTimeout(r, 20_000));
        raw = await generateIeltsWithAI(token, opts);
      }
      setKind('ielts-reading');
      setFile({ name: tr('AI-generated IELTS Reading'), kind: 'text', size: 0, pages: 0 });
      setExam(flagUnsure(buildImportedExam(raw as object, { id: uid('exam_'), name: name || undefined, kind: 'ielts-reading' })));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const pick = async (files: FileList | null) => {
    setError(null);
    setExam(null);
    setDone(null);
    if (!files?.length) return;
    const list = [...files];
    // A paper already written out as data (an Atlas .json paper): no AI needed, just check and save.
    if (list.length === 1 && list[0].name.toLowerCase().endsWith('.json')) {
      try {
        const raw = JSON.parse(await list[0].text()) as { kind?: unknown };
        const k = KINDS.includes(raw.kind as ImportedKind) ? (raw.kind as ImportedKind) : kind;
        setKind(k);
        setFile({ name: list[0].name, kind: 'text', size: list[0].size, pages: 0 });
        setExam(buildImportedExam(raw as object, { id: uid('exam_'), name, kind: k }));
      } catch (e) {
        setError(tr("This file couldn't be read as an exam paper: {error}", { error: (e as Error).message }));
      }
      return;
    }
    if (list.length === 1 && list[0].name.toLowerCase().endsWith('.pdf')) {
      const bytes = new Uint8Array(await list[0].arrayBuffer());
      try {
        const pdf = await openPdf(bytes);
        setFile({ name: list[0].name, kind: 'pdf', size: list[0].size, bytes, pages: pdf.numPages });
        setFrom(1);
        setTo(Math.min(pdf.numPages, MAX_PAGES));
      } catch {
        setError(tr("This PDF couldn't be opened."));
      }
      return;
    }
    const photos = list.filter((f) => /^image\//.test(f.type));
    if (!photos.length) return setError(tr('Choose a PDF, or photos of the pages.'));
    if (photos.length > MAX_PAGES) return setError(tr('At most {n} photos at a time.', { n: MAX_PAGES }));
    setFile({ name: photos.length === 1 ? photos[0].name : tr('{n} photos', { n: photos.length }), kind: 'image', size: photos.reduce((s, f) => s + f.size, 0), pages: photos.length, photos });
    setFrom(1);
    setTo(photos.length);
  };

  const read = async () => {
    if (!file) return;
    setError(null);
    setExam(null);
    try {
      const token = await cloud.parentAccessToken();
      if (!token) throw new Error(tr('Sign in to your family cloud account first (Settings → Cloud sync).'));
      const images: { mediaType: string; data: string }[] = [];
      let text: string | undefined;
      if (file.kind === 'pdf') {
        const pdf = await openPdf(file.bytes!);
        for (let n = from; n <= to; n++) {
          setBusy(tr('Preparing page {n} of {total}…', { n: n - from + 1, total: to - from + 1 }));
          images.push(await pageJpeg(pdf, n, 1400));
        }
        const layer = await pdfText(file.bytes!).catch(() => null);
        if (layer && !layer.scanned) text = layer.text.split(PAGE_BREAK).slice(from - 1, to).join('\n\n').slice(0, 80_000) || undefined;
      } else {
        for (const [i, f] of file.photos!.entries()) {
          setBusy(tr('Preparing photo {n} of {total}…', { n: i + 1, total: file.photos!.length }));
          const url = URL.createObjectURL(f);
          try {
            images.push(await photoJpeg(url, 1400));
          } finally {
            URL.revokeObjectURL(url);
          }
        }
      }
      setBusy(images.length === 1 ? tr('Reading 1 page with AI… (this can take a minute or two)') : tr('Reading {n} pages with AI… (this can take a minute or two)', { n: images.length }));
      let raw: unknown;
      try {
        raw = await readExamWithAI(token, kind, images, text);
      } catch (e) {
        if (!(e instanceof BusyError)) throw e;
        setBusy(tr('The AI is busy — trying again in 20 seconds…'));
        await new Promise((r) => setTimeout(r, 20_000));
        raw = await readExamWithAI(token, kind, images, text);
      }
      setExam(buildImportedExam(raw as object, { id: uid('exam_'), name, kind }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const save = async () => {
    if (!exam || !file) return;
    await repo.saveImportedExam(exam, { name: file.name, kind: file.kind, bytes: file.bytes, size: file.size });
    setDone(tr('“{name}” is now in the Exam Hall ({n} questions).', { name: exam.name, n: examSize(exam) }));
    setExam(null);
    setFile(null);
    setName('');
  };

  // Editing the AI's reading before saving.
  const patch = (si: number, qi: number, change: (q: ImportedExam['sections'][number]['questions'][number]) => ImportedExam['sections'][number]['questions'][number] | null) =>
    setExam((e) => {
      if (!e) return e;
      const sections = e.sections
        .map((s, i) => (i !== si ? s : { ...s, questions: s.questions.flatMap((q, j) => (j !== qi ? [q] : [change(q)].filter((x): x is typeof q => !!x))) }))
        .filter((s) => s.questions.length);
      return { ...e, sections };
    });

  const aiCount = exam ? exam.aiAnswered.filter((id) => exam.sections.some((s) => s.questions.some((q) => q.id === id))).length : 0;

  return (
    <Card title={tr('Exam papers (real past papers & IELTS tests)')} className="lg:col-span-2">
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {tr("Upload a past Hà Nội grade-10 English paper, a sample paper (đề minh họa) or an IELTS practice test. AI reads the pages; you check the answers; the paper appears in Quang's Exam Hall with a real timer and marking. Include the answer-key pages (đáp án) if you have them — otherwise the AI works out the answers and you check them.")}
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {KINDS.map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={cx('rounded-xl p-3 text-left text-sm ring-1', kind === k ? 'bg-brand-50 ring-2 ring-brand-500 dark:bg-brand-950' : 'ring-slate-300 dark:ring-slate-700')}
            >
              <span className="text-xl">{KIND_INFO[k].emoji}</span> <b>{tr(KIND_INFO[k].label)}</b>
            </button>
          ))}
        </div>
        {kind === 'ielts-listening' && (
          <p className="rounded-lg bg-amber-50 p-2 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            {tr("Listening tests are played by the device's voice from the transcript, so include the pages with the audioscript (in Cambridge books it's near the back). Parts without a transcript are left out.")}
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={tr('Name (optional)')} hint={tr('e.g. Hà Nội 2024, or Cambridge IELTS 18 — Test 1')}>
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label={tr('The paper: a PDF, photos of the pages, or an Atlas .json paper')}>
            <input type="file" accept=".pdf,.json,image/jpeg,image/png,image/webp" multiple className={inputClass} onChange={(e) => void pick(e.target.files)} />
          </Field>
        </div>
        {file?.kind === 'pdf' && (
          <div className="flex flex-wrap items-end gap-3 text-sm">
            <span className="pb-2">{tr('{n} pages — read pages', { n: file.pages })}</span>
            <input type="number" min={1} max={file.pages} value={from} onChange={(e) => setFrom(Math.max(1, Math.min(file.pages, Number(e.target.value) || 1)))} className={cx(inputClass, 'w-20')} aria-label={tr('From page')} />
            <span className="pb-2">{tr('to')}</span>
            <input type="number" min={from} max={file.pages} value={to} onChange={(e) => setTo(Math.max(from, Math.min(file.pages, Number(e.target.value) || from)))} className={cx(inputClass, 'w-20')} aria-label={tr('To page')} />
            {to - from + 1 > MAX_PAGES && <span className="pb-2 text-rose-600">{tr('At most {n} pages at a time — for a whole book, import one test at a time.', { n: MAX_PAGES })}</span>}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled={!file || file.kind === 'text' || !!busy || to - from + 1 > MAX_PAGES} onClick={() => void read()}>
            {tr('✨ Read the paper with AI')}
          </Button>
          {busy && <span className="text-sm text-slate-500">{busy}</span>}
        </div>
        <div className="space-y-3 rounded-xl p-4 ring-1 ring-slate-300 dark:ring-slate-700">
          <p className="text-sm">
            <b>{tr('✨ Or generate a new IELTS Reading test')}</b> — {tr("AI writes an original passage with 13–14 questions of the types you pick (up to 4). You check it, then it is saved to the family's Exam Hall like an imported paper.")}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={tr('Topic (optional)')} hint={tr('e.g. coral reefs, the history of maps — empty = AI chooses')}>
              <input className={inputClass} value={genTopic} onChange={(e) => setGenTopic(e.target.value)} />
            </Field>
            <Field label={tr('Level')}>
              <select className={inputClass} value={genLevel} onChange={(e) => setGenLevel(Number(e.target.value) as 3 | 4 | 5)}>
                <option value={3}>Band 5.5</option>
                <option value={4}>Band 6.5</option>
                <option value={5}>Band 7+</option>
              </select>
            </Field>
          </div>
          <div className="flex flex-wrap gap-2">
            {GEN_TYPES.map(([id, label]) => {
              const on = genTypes.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => setGenTypes((t) => (on ? t.filter((x) => x !== id) : t.length >= 4 ? t : [...t, id]))}
                  className={cx('rounded-full px-3 py-1 text-xs ring-1', on ? 'bg-brand-50 font-semibold ring-2 ring-brand-500 dark:bg-brand-950' : 'ring-slate-300 dark:ring-slate-700')}
                >
                  {on ? '✓ ' : ''}
                  {tr(label)}
                </button>
              );
            })}
          </div>
          <Button disabled={!!busy || !genTypes.length} onClick={() => void generate()}>
            {tr('✨ Generate a test')}
          </Button>
        </div>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        {done && <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">✓ {done}</p>}

        {exam && (
          <div className="space-y-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <div className="flex flex-wrap items-end gap-3">
              <Field label={tr('Paper name')}>
                <input className={inputClass} value={exam.name} onChange={(e) => setExam({ ...exam, name: e.target.value })} />
              </Field>
              <Field label={tr('Minutes')}>
                <input type="number" min={5} max={240} className={cx(inputClass, 'w-24')} value={exam.minutes} onChange={(e) => setExam({ ...exam, minutes: Math.max(5, Math.min(240, Number(e.target.value) || 60)) })} />
              </Field>
              <p className="pb-2 text-sm">
                {tr('{n} questions in {parts} parts', { n: examSize(exam), parts: exam.sections.length })}
                {aiCount > 0 && (
                  <>
                    {' '}
                    · <span className="font-semibold text-amber-700 dark:text-amber-300">{tr('{n} answers worked out by AI — please check those (marked 🤖)', { n: aiCount })}</span>
                  </>
                )}
              </p>
            </div>
            {exam.skipped.length > 0 && (
              <ul className="list-disc pl-5 text-xs text-slate-500">
                {exam.skipped.map((s, i) => (
                  <li key={i}>{tr('Left out: {reason}', { reason: s })}</li>
                ))}
              </ul>
            )}
            {exam.sections.map((s, si) => (
              <details key={s.id} open={si === 0} className="rounded-lg bg-white p-3 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
                <summary className="cursor-pointer font-semibold">
                  {tr('Part {n}. {title} — {count} questions', { n: si + 1, title: s.title, count: s.questions.length })}
                  {s.questions[0]?.script ? ` · ${tr('🔊 transcript found')}` : ''}
                </summary>
                <p className="mt-1 text-xs text-slate-500">{s.instructions}</p>
                {s.questions[0]?.passage && <p className="mt-2 max-h-40 overflow-y-auto whitespace-pre-line rounded bg-amber-50 p-2 text-xs dark:bg-amber-950/30">{s.questions[0].passage}</p>}
                <ol className="mt-3 space-y-3">
                  {s.questions.map((q, qi) => {
                    const ai = exam.aiAnswered.includes(q.id);
                    return (
                      <li key={q.id} className={cx('rounded-lg p-2 text-sm', ai && 'bg-amber-50 dark:bg-amber-950/30')}>
                        <div className="flex items-start gap-2">
                          <span className="flex-1">
                            {ai && <span title={tr('Answer worked out by AI')}>🤖 </span>}
                            {q.prompt}
                          </span>
                          <button onClick={() => patch(si, qi, () => null)} className="text-xs text-slate-400 hover:text-rose-600" aria-label={tr('Remove this question')}>
                            ✕
                          </button>
                        </div>
                        {q.type === 'input' ? (
                          <label className="mt-1 flex items-center gap-2 text-xs">
                            {tr('Answer:')}
                            <input className={cx(inputClass, 'py-1')} value={q.options[0]} onChange={(e) => patch(si, qi, (x) => ({ ...x, options: [e.target.value] }))} />
                          </label>
                        ) : (
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {q.options.map((o, oi) => (
                              <button
                                key={oi}
                                onClick={() => patch(si, qi, (x) => ({ ...x, answer: oi }))}
                                className={cx('rounded-md px-2 py-1 text-xs ring-1', q.answer === oi ? 'bg-emerald-600 text-white ring-emerald-600' : 'ring-slate-300 dark:ring-slate-600')}
                              >
                                {'ABCDEF'[oi]}. {o}
                              </button>
                            ))}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </details>
            ))}
            <p className="text-xs text-slate-500">{tr('Tap an option to change the right answer. ✕ removes a question that was read wrongly.')}</p>
            <div className="flex gap-2">
              <Button onClick={() => void save()}>{tr('Save to the Exam Hall')}</Button>
              <Button variant="ghost" onClick={() => setExam(null)}>
                {tr('Cancel')}
              </Button>
            </div>
          </div>
        )}

        {exams.length > 0 && (
          <div>
            <p className="text-sm font-semibold">{tr('In the Exam Hall now:')}</p>
            <ul className="mt-1 list-disc pl-5 text-sm text-slate-600 dark:text-slate-300">
              {exams.map((e) => (
                <li key={e.id}>
                  {KIND_INFO[e.kind].emoji} {e.name} — {tr('{n} questions, {min} min', { n: examSize(e), min: e.minutes })}
                </li>
              ))}
            </ul>
            <p className="mt-1 text-xs text-slate-500">{tr('To remove a paper, delete it in the list of materials below.')}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
