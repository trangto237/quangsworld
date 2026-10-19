import { useEffect, useMemo, useRef, useState } from 'react';
import { GLOBAL_SUCCESS_9, PART_LABEL, autoImport, customUnit, validateDrafts, type DraftPart, type DraftQuestion, type ImportIssue } from '@atlas/knowledge';
import { Button, Card, Field, cx, inputClass, useRepo } from '@atlas/ui';
import { ACCEPT, extractFile, mergePhotos, type Extracted } from '../lib/extract';
import { aiStatus, generateWithAI, type AiStatus } from '../lib/ai';
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

type Item = DraftQuestion & { key: number; on: boolean };
type Step = 'source' | 'review' | 'done';

const FORMAT_LABEL = { quick: 'Quick Import questions', vocab: 'a word list', text: 'a reading text' } as const;
const TYPE_LABEL: Record<DraftQuestion['type'], string> = { mcq: 'Choice', order: 'Word order', input: 'Typed' };

/**
 * "Add textbook / document": a page, a worksheet or a word list becomes game missions.
 * Offline questions always; "Make questions with AI" when the server has Claude set up.
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

  useEffect(() => {
    void aiStatus().then(setAi);
  }, []);

  const unit = unitId === 'other' ? customUnit(customName) : GLOBAL_SUCCESS_9.find((u) => u.id === unitId)!;
  const detected = useMemo(() => (text.trim() ? autoImport(text) : null), [text]);
  const signedInParent = !!status.email && !status.viaCode;
  const needsAi = !!src && !text.trim() && (src.scanned || src.kind === 'image');

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
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const review = (drafts: DraftQuestion[], how: 'offline' | 'ai', found: ImportIssue[] = []) => {
    setItems(drafts.map((d, key) => ({ ...d, key, on: true })));
    setIssues(found);
    setVia(how);
    setStep('review');
  };

  const makeOffline = () => {
    if (!detected) return;
    if (!detected.drafts.length) return setError(detected.issues[0]?.message ?? 'No questions could be made from this text.');
    review(detected.drafts, 'offline', detected.issues);
  };

  const makeWithAi = async () => {
    setError(null);
    setBusy('Claude is reading the material and writing questions… (this can take a minute)');
    try {
      const token = await cloud.parentAccessToken();
      if (!token) throw new Error('Sign in to your family cloud account first (Settings → Cloud sync).');
      const source: Extracted = src ? { ...src, text: text.trim() } : { name: 'Pasted text', kind: 'text', size: text.length, text: text.trim() };
      const { drafts, dropped } = await generateWithAI(token, source, { unitTitle: unit.title, focus, count });
      review(drafts, 'ai', dropped ? [{ line: 0, message: `${dropped} question(s) from Claude were not usable and were left out.` }] : []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const save = async () => {
    const chosen = items.filter((i) => i.on);
    const { drafts, dropped } = validateDrafts(chosen.map(({ key: _k, on: _o, ...d }) => d));
    if (dropped.length) return setError(`Fix ${dropped.length} question(s) first: ${dropped.map((d) => `#${d.index + 1} ${d.reason}`).join('; ')}.`);
    setBusy('Saving…');
    try {
      const res = await repo.importQuestions({
        unit,
        materialName: src?.name ?? `${unit.title} (pasted text)`,
        kind: src?.kind ?? 'text',
        drafts,
        via,
        bytes: src?.bytes,
        size: src?.size ?? text.length,
        excerpt: text.trim() || undefined,
      });
      setSaved(
        `Saved ${res.added} question${res.added === 1 ? '' : 's'}${res.skipped ? ` (${res.skipped} were already there)` : ''} to ${res.concepts.map((c) => c.missionName).join(', ')}. They're in 📘 My Textbook in the kid app.`,
      );
      setStep('done');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const update = (key: number, patch: Partial<DraftQuestion>) => setItems((list) => list.map((i) => (i.key === key ? { ...i, ...patch } : i)));
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
                {needsAi && <span className="block text-amber-700 dark:text-amber-400">{src.kind === 'image' ? 'Photos' : 'This PDF is scanned (no text layer)'}: only “Make questions with AI” can read it.</span>}
              </p>
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
                {detected ? (
                  <>
                    Looks like {FORMAT_LABEL[detected.format]} → <b>{detected.drafts.length} questions</b>
                    {detected.issues.length > 0 && <span className="text-amber-700 dark:text-amber-400"> · {detected.issues.length} line(s) need a look</span>}
                  </>
                ) : (
                  'Add a file or text first.'
                )}
              </p>
              <Button className="mt-3" disabled={!detected?.drafts.length || !!busy || (unitId === 'other' && !customName.trim())} onClick={makeOffline}>
                Make questions
              </Button>
            </div>

            <div className="rounded-xl bg-violet-50 p-4 dark:bg-violet-950/30">
              <p className="font-semibold">✨ Make questions with AI (Claude)</p>
              {ai?.ai ? (
                signedInParent ? (
                  <>
                    <p className="mt-1 text-sm text-slate-500">Reads photos and scanned pages too, and writes explanations in English and Vietnamese.</p>
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
                  Not set up. To turn it on, add an <b>ANTHROPIC_API_KEY</b> secret in Cloudflare Pages (Settings → Variables and Secrets) and set up cloud sync — see the README.
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
              <b>{unit.title}</b> · {selected} of {items.length} questions selected {via === 'ai' && <span className="rounded bg-violet-100 px-1.5 text-xs text-violet-800 dark:bg-violet-950 dark:text-violet-300">made with Claude</span>}
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
          {parts.map((part) => (
            <section key={part}>
              <h3 className="mb-2 font-semibold">
                {PART_LABEL[part].emoji} {PART_LABEL[part].en}
              </h3>
              <ol className="space-y-2">
                {items
                  .filter((i) => i.part === part)
                  .map((q) => (
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
          ))}
          <div className="flex flex-wrap gap-2">
            <Button disabled={!selected || !!busy} onClick={() => void save()}>
              Save {selected} questions to {unit.title.split(' · ')[0]}
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
