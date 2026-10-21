import { useState } from 'react';
import { KIND_INFO, buildImportedExam, examSize, type ImportedExam, type ImportedKind } from '@atlas/engine';
import { PAGE_BREAK } from '@atlas/knowledge';
import { uid } from '@atlas/shared';
import { Button, Card, Field, cx, inputClass, useQuery, useRepo } from '@atlas/ui';
import { BusyError, readExamWithAI } from '../lib/ai';
import { pdfText } from '../lib/extract';
import { openPdf, pageJpeg, photoJpeg } from '../lib/ocr';
import { useCloud } from './Cloud';

const MAX_PAGES = 28;
const KINDS: ImportedKind[] = ['hn10', 'ielts-reading', 'ielts-listening'];

interface Picked {
  name: string;
  kind: 'pdf' | 'image';
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

  const pick = async (files: FileList | null) => {
    setError(null);
    setExam(null);
    setDone(null);
    if (!files?.length) return;
    const list = [...files];
    if (list.length === 1 && list[0].name.toLowerCase().endsWith('.pdf')) {
      const bytes = new Uint8Array(await list[0].arrayBuffer());
      try {
        const pdf = await openPdf(bytes);
        setFile({ name: list[0].name, kind: 'pdf', size: list[0].size, bytes, pages: pdf.numPages });
        setFrom(1);
        setTo(Math.min(pdf.numPages, MAX_PAGES));
      } catch {
        setError("This PDF couldn't be opened.");
      }
      return;
    }
    const photos = list.filter((f) => /^image\//.test(f.type));
    if (!photos.length) return setError('Choose a PDF, or photos of the pages.');
    if (photos.length > MAX_PAGES) return setError(`At most ${MAX_PAGES} photos at a time.`);
    setFile({ name: photos.length === 1 ? photos[0].name : `${photos.length} photos`, kind: 'image', size: photos.reduce((s, f) => s + f.size, 0), pages: photos.length, photos });
    setFrom(1);
    setTo(photos.length);
  };

  const read = async () => {
    if (!file) return;
    setError(null);
    setExam(null);
    try {
      const token = await cloud.parentAccessToken();
      if (!token) throw new Error('Sign in to your family cloud account first (Settings → Cloud sync).');
      const images: { mediaType: string; data: string }[] = [];
      let text: string | undefined;
      if (file.kind === 'pdf') {
        const pdf = await openPdf(file.bytes!);
        for (let n = from; n <= to; n++) {
          setBusy(`Preparing page ${n - from + 1} of ${to - from + 1}…`);
          images.push(await pageJpeg(pdf, n, 1400));
        }
        const layer = await pdfText(file.bytes!).catch(() => null);
        if (layer && !layer.scanned) text = layer.text.split(PAGE_BREAK).slice(from - 1, to).join('\n\n').slice(0, 80_000) || undefined;
      } else {
        for (const [i, f] of file.photos!.entries()) {
          setBusy(`Preparing photo ${i + 1} of ${file.photos!.length}…`);
          const url = URL.createObjectURL(f);
          try {
            images.push(await photoJpeg(url, 1400));
          } finally {
            URL.revokeObjectURL(url);
          }
        }
      }
      setBusy(`Reading ${images.length} page${images.length === 1 ? '' : 's'} with AI… (this can take a minute or two)`);
      let raw: unknown;
      try {
        raw = await readExamWithAI(token, kind, images, text);
      } catch (e) {
        if (!(e instanceof BusyError)) throw e;
        setBusy('The AI is busy — trying again in 20 seconds…');
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
    setDone(`“${exam.name}” is now in the Exam Hall (${examSize(exam)} questions).`);
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
    <Card title="Exam papers (real past papers & IELTS tests)" className="lg:col-span-2">
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Upload a past Hà Nội grade-10 English paper, a sample paper (đề minh họa) or an IELTS practice test. AI reads the pages; you check the answers; the paper appears in Quang's
          Exam Hall with a real timer and marking. Include the answer-key pages (đáp án) if you have them — otherwise the AI works out the answers and you check them.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {KINDS.map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={cx('rounded-xl p-3 text-left text-sm ring-1', kind === k ? 'bg-brand-50 ring-2 ring-brand-500 dark:bg-brand-950' : 'ring-slate-300 dark:ring-slate-700')}
            >
              <span className="text-xl">{KIND_INFO[k].emoji}</span> <b>{KIND_INFO[k].label}</b>
            </button>
          ))}
        </div>
        {kind === 'ielts-listening' && (
          <p className="rounded-lg bg-amber-50 p-2 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            Listening tests are played by the device's voice from the transcript, so include the pages with the audioscript (in Cambridge books it's near the back). Parts without a
            transcript are left out.
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Name (optional)" hint="e.g. Hà Nội 2024, or Cambridge IELTS 18 — Test 1">
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="The paper: a PDF, or photos of the pages">
            <input type="file" accept=".pdf,image/jpeg,image/png,image/webp" multiple className={inputClass} onChange={(e) => void pick(e.target.files)} />
          </Field>
        </div>
        {file?.kind === 'pdf' && (
          <div className="flex flex-wrap items-end gap-3 text-sm">
            <span className="pb-2">
              {file.pages} pages — read pages
            </span>
            <input type="number" min={1} max={file.pages} value={from} onChange={(e) => setFrom(Math.max(1, Math.min(file.pages, Number(e.target.value) || 1)))} className={cx(inputClass, 'w-20')} aria-label="From page" />
            <span className="pb-2">to</span>
            <input type="number" min={from} max={file.pages} value={to} onChange={(e) => setTo(Math.max(from, Math.min(file.pages, Number(e.target.value) || from)))} className={cx(inputClass, 'w-20')} aria-label="To page" />
            {to - from + 1 > MAX_PAGES && <span className="pb-2 text-rose-600">At most {MAX_PAGES} pages at a time — for a whole book, import one test at a time.</span>}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled={!file || !!busy || to - from + 1 > MAX_PAGES} onClick={() => void read()}>
            ✨ Read the paper with AI
          </Button>
          {busy && <span className="text-sm text-slate-500">{busy}</span>}
        </div>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        {done && <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">✓ {done}</p>}

        {exam && (
          <div className="space-y-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <div className="flex flex-wrap items-end gap-3">
              <Field label="Paper name">
                <input className={inputClass} value={exam.name} onChange={(e) => setExam({ ...exam, name: e.target.value })} />
              </Field>
              <Field label="Minutes">
                <input type="number" min={5} max={240} className={cx(inputClass, 'w-24')} value={exam.minutes} onChange={(e) => setExam({ ...exam, minutes: Math.max(5, Math.min(240, Number(e.target.value) || 60)) })} />
              </Field>
              <p className="pb-2 text-sm">
                <b>{examSize(exam)}</b> questions in {exam.sections.length} parts
                {aiCount > 0 && (
                  <>
                    {' '}
                    · <span className="font-semibold text-amber-700 dark:text-amber-300">{aiCount} answers worked out by AI — please check those (marked 🤖)</span>
                  </>
                )}
              </p>
            </div>
            {exam.skipped.length > 0 && (
              <ul className="list-disc pl-5 text-xs text-slate-500">
                {exam.skipped.map((s, i) => (
                  <li key={i}>Left out: {s}</li>
                ))}
              </ul>
            )}
            {exam.sections.map((s, si) => (
              <details key={s.id} open={si === 0} className="rounded-lg bg-white p-3 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
                <summary className="cursor-pointer font-semibold">
                  Part {si + 1}. {s.title} — {s.questions.length} questions
                  {s.questions[0]?.script ? ' · 🔊 transcript found' : ''}
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
                            {ai && <span title="Answer worked out by AI">🤖 </span>}
                            {q.prompt}
                          </span>
                          <button onClick={() => patch(si, qi, () => null)} className="text-xs text-slate-400 hover:text-rose-600" aria-label="Remove this question">
                            ✕
                          </button>
                        </div>
                        {q.type === 'input' ? (
                          <label className="mt-1 flex items-center gap-2 text-xs">
                            Answer:
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
            <p className="text-xs text-slate-500">Tap an option to change the right answer. ✕ removes a question that was read wrongly.</p>
            <div className="flex gap-2">
              <Button onClick={() => void save()}>Save to the Exam Hall</Button>
              <Button variant="ghost" onClick={() => setExam(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {exams.length > 0 && (
          <div>
            <p className="text-sm font-semibold">In the Exam Hall now:</p>
            <ul className="mt-1 list-disc pl-5 text-sm text-slate-600 dark:text-slate-300">
              {exams.map((e) => (
                <li key={e.id}>
                  {KIND_INFO[e.kind].emoji} {e.name} — {examSize(e)} questions, {e.minutes} min
                </li>
              ))}
            </ul>
            <p className="mt-1 text-xs text-slate-500">To remove a paper, delete it in the list of materials below.</p>
          </div>
        )}
      </div>
    </Card>
  );
}
