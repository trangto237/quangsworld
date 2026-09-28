import { useRef, useState } from 'react';
import { flashcardsToConcept } from '@atlas/knowledge';
import { Button, Card, Field, inputClass, useQuery, useRepo } from '@atlas/ui';

const SAMPLE = 'term,meaning\nabundant,existing in large quantities\nbrief,lasting a short time\ncautious,careful to avoid risk\ndiligent,showing care and effort\neager,wanting to do something very much';

const kindOf = (f: File): 'csv' | 'pdf' | 'docx' | 'image' | null => {
  const n = f.name.toLowerCase();
  if (n.endsWith('.csv') || n.endsWith('.tsv') || n.endsWith('.txt')) return 'csv';
  if (n.endsWith('.pdf')) return 'pdf';
  if (n.endsWith('.docx')) return 'docx';
  if (f.type.startsWith('image/')) return 'image';
  return null;
};

/**
 * Knowledge import (PRD §6). CSV flashcards become a playable concept immediately.
 * PDF / DOCX / images are stored encrypted for the Phase 5 OCR → concept-extraction pipeline.
 */
export function Materials() {
  const repo = useRepo();
  const materials = useQuery((r) => r.listMaterials());
  const fileRef = useRef<HTMLInputElement>(null);
  const [deck, setDeck] = useState('');
  const [csv, setCsv] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  let preview: ReturnType<typeof flashcardsToConcept> | null = null;
  let previewError: string | null = null;
  if (csv.trim()) {
    try {
      preview = flashcardsToConcept(csv, deck || 'Deck');
    } catch (e) {
      previewError = (e as Error).message;
    }
  }

  const onFiles = async (files: FileList | null) => {
    if (!files) return;
    for (const f of Array.from(files)) {
      const kind = kindOf(f);
      if (!kind) {
        setMsg({ ok: false, text: `${f.name}: unsupported type` });
        continue;
      }
      if (kind === 'csv') {
        setCsv(await f.text());
        setDeck(f.name.replace(/\.[^.]+$/, ''));
      } else {
        await repo.storeMaterialFile(f.name, kind, new Uint8Array(await f.arrayBuffer()));
        setMsg({ ok: true, text: `${f.name} stored privately (encrypted on this device).` });
      }
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title="Upload materials">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            void onFiles(e.dataTransfer.files);
          }}
          className="rounded-2xl border-2 border-dashed border-slate-300 p-6 text-center dark:border-slate-700"
        >
          <div className="text-4xl">📚</div>
          <p className="mt-2 font-semibold">Drop files here or</p>
          <Button variant="secondary" className="mt-2" onClick={() => fileRef.current?.click()}>
            Choose files
          </Button>
          <input ref={fileRef} type="file" multiple hidden accept=".csv,.tsv,.txt,.pdf,.docx,image/*" onChange={(e) => void onFiles(e.target.files)} />
          <p className="mt-3 text-xs text-slate-500">CSV flashcards · PDF · DOCX · images (SGK, IELTS books, worksheets)</p>
        </div>
        <ol className="mt-4 flex flex-wrap items-center gap-1 text-xs text-slate-500">
          {['Upload', 'OCR', 'Chunk', 'Concept extraction', 'Question generation', 'Game missions'].map((s, i) => (
            <li key={s} className="flex items-center gap-1">
              {i > 0 && <span>→</span>}
              <span className={i === 0 || i >= 4 ? 'rounded bg-emerald-100 px-1.5 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'rounded bg-slate-100 px-1.5 dark:bg-slate-800'}>{s}</span>
            </li>
          ))}
        </ol>
        <p className="mt-2 text-xs text-slate-500">
          Highlighted steps run today for CSV flashcards. OCR and automatic concept extraction for PDFs/images arrive in Phase 5. Materials stay private to this family
          and are never redistributed.
        </p>
        {msg && <p className={`mt-3 text-sm font-semibold ${msg.ok ? 'text-emerald-600' : 'text-rose-600'}`}>{msg.text}</p>}
      </Card>

      <Card title="Flashcard deck (CSV)">
        <div className="space-y-3">
          <Field label="Deck name">
            <input className={inputClass} value={deck} onChange={(e) => setDeck(e.target.value)} placeholder="e.g. Oxford Unit 3" />
          </Field>
          <Field label="Cards — one per line: term,meaning" hint="Comma, semicolon or tab separated. A header row is detected automatically.">
            <textarea className={`${inputClass} h-36 font-mono text-xs`} value={csv} onChange={(e) => setCsv(e.target.value)} placeholder={SAMPLE} />
          </Field>
          {previewError && <p className="text-sm text-rose-600">{previewError}</p>}
          {preview && (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {preview.cards.length} cards → {preview.questions.length} game questions, e.g. <i>{preview.questions[0].prompt}</i>
            </p>
          )}
          <div className="flex gap-2">
            <Button
              disabled={!preview || !deck.trim()}
              onClick={async () => {
                const res = await repo.importFlashcards(deck.trim(), csv);
                setMsg({ ok: true, text: `“${deck}” is now a mission in Word Forest (${res.questions.length} questions).` });
                setCsv('');
                setDeck('');
              }}
            >
              Import deck
            </Button>
            <Button variant="ghost" onClick={() => (setCsv(SAMPLE), setDeck('Sample deck'))}>
              Use sample
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Family library" className="lg:col-span-2">
        {materials.length ? (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {materials.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center gap-3 py-2.5 text-sm">
                <span className="text-xl">{m.kind === 'csv' ? '🗂️' : m.kind === 'pdf' ? '📕' : m.kind === 'docx' ? '📘' : '🖼️'}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{m.name}</span>
                  <span className="text-xs text-slate-500">
                    {(m.size / 1024).toFixed(1)} KB · {new Date(m.createdAt).toLocaleDateString()} · {m.note}
                  </span>
                </span>
                <span className={`rounded px-2 py-0.5 text-xs font-semibold ${m.status === 'processed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                  {m.status}
                </span>
                <Button variant="ghost" onClick={() => confirm(`Delete “${m.name}”?`) && void repo.deleteMaterial(m.id)}>
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No materials yet.</p>
        )}
      </Card>
    </div>
  );
}
