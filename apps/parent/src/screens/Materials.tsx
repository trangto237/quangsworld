import { useState } from 'react';
import { flashcardsToConcept } from '@atlas/knowledge';
import { Button, Card, Field, inputClass, useQuery, useRepo } from '@atlas/ui';
import { ImportWizard } from '../components/ImportWizard';

const SAMPLE = 'term,meaning\nabundant,existing in large quantities\nbrief,lasting a short time\ncautious,careful to avoid risk\ndiligent,showing care and effort\neager,wanting to do something very much';

/**
 * Knowledge import (PRD §6): textbook pages, worksheets and word lists become missions (offline, or with
 * Claude when the server has a key); CSV flashcard decks too.
 */
export function Materials() {
  const repo = useRepo();
  const materials = useQuery((r) => r.listMaterials());
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

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ImportWizard />

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
          {msg && <p className={`text-sm font-semibold ${msg.ok ? 'text-emerald-600' : 'text-rose-600'}`}>{msg.text}</p>}
        </div>
      </Card>

      <Card title="Family library" className="lg:col-span-2">
        {materials.length ? (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {materials.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center gap-3 py-2.5 text-sm">
                <span className="text-xl">{m.kind === 'csv' ? '🗂️' : m.kind === 'pdf' ? '📕' : m.kind === 'docx' ? '📘' : m.kind === 'text' ? '📝' : '🖼️'}</span>
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
