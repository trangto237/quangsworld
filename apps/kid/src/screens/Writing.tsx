import { useEffect, useState } from 'react';
import type { StudentProfile } from '@atlas/db';
import { WRITING_PROMPTS, type WritingPrompt } from '@atlas/knowledge';
import { cx, useQuery, useRepo } from '@atlas/ui';
import { T, TB } from '../i18n';
import { useKid } from '../store';
import { TownScreen } from '../town/Shell';
import { Panel, TownButton } from '../town/ui';

/** One piece of writing, saved with the family's data so a parent can read it. */
export interface WritingPiece {
  promptId: string;
  text: string;
  words: number;
  checked: number[];
  updatedAt: number;
}

export const writingKey = (studentId: string) => `lit-writing:${studentId}`;
const countWords = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

/** Xưởng viết: practise the two writing tasks of the grade-10 Ngữ văn exam, with a self-check list and a model outline. */
export function Writing({ student }: { student: StudentProfile }) {
  const go = useKid((s) => s.go);
  const pieces = useQuery((r) => r.getKv<WritingPiece[]>(writingKey(student.id)) ?? [], [student.id]);
  const [open, setOpen] = useState<WritingPrompt | null>(null);

  if (open) return <Editor student={student} prompt={open} saved={pieces.find((p) => p.promptId === open.id)} onBack={() => setOpen(null)} />;

  const group = (kind: 'nlvh' | 'nlxh') => WRITING_PROMPTS.filter((p) => p.kind === kind);
  return (
    <TownScreen student={student} tab={null} back={() => go({ name: 'realm', realmId: 'literature' })} showPowers={false}>
      <Panel>
        <h1 className="font-display text-3xl font-bold">✍️ Xưởng viết</h1>
        <p className="text-sm text-ink-soft">
          Luyện hai dạng bài viết của đề thi vào lớp 10: đoạn văn nghị luận văn học (khoảng 200 chữ) và bài văn nghị luận xã hội. Viết xong, tự kiểm tra rồi so với dàn ý gợi ý. Bố mẹ đọc được bài của em.
        </p>
      </Panel>
      {(['nlvh', 'nlxh'] as const).map((kind) => (
        <section key={kind} className="mt-5">
          <h2 className="font-display text-xl font-bold">{kind === 'nlvh' ? '📜 Nghị luận văn học — đoạn văn' : '🏙️ Nghị luận xã hội — bài văn'}</h2>
          <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group(kind).map((p) => {
              const mine = pieces.find((x) => x.promptId === p.id);
              return (
                <button key={p.id} onClick={() => setOpen(p)} className="town-panel p-4 text-left hover:bg-paper-3">
                  <div className="font-display text-lg font-bold leading-tight">{p.title}</div>
                  <div className="mt-1 text-xs text-ink-soft">{p.task}</div>
                  <div className="mt-2 text-xs font-bold">
                    {mine ? (
                      <span className="text-[#2f8a3a] dark:text-[#86d993]">
                        ✓ {mine.words} chữ · {mine.checked.length}/{p.checklist.length} tiêu chí
                      </span>
                    ) : (
                      <span className="text-ink-soft">Chưa viết</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </TownScreen>
  );
}

function Editor({ student, prompt: p, saved, onBack }: { student: StudentProfile; prompt: WritingPrompt; saved?: WritingPiece; onBack: () => void }) {
  const repo = useRepo();
  const [text, setText] = useState(saved?.text ?? '');
  const [checked, setChecked] = useState<number[]>(saved?.checked ?? []);
  const [showOutline, setShowOutline] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const words = countWords(text);
  const enough = words >= Math.round(p.words * 0.8);

  const save = async (quiet = false) => {
    const all = repo.getKv<WritingPiece[]>(writingKey(student.id)) ?? [];
    const piece: WritingPiece = { promptId: p.id, text, words, checked, updatedAt: Date.now() };
    await repo.setKv(writingKey(student.id), [piece, ...all.filter((x) => x.promptId !== p.id)]);
    if (quiet) return;
    // A finished piece (long enough, every point checked) earns coins once.
    if (enough && checked.length === p.checklist.length && (await repo.claimOnce(`lit-writing-reward:${student.id}:${p.id}`, student.id, { coins: 40, gems: 1, xp: 40 })))
      setNote('🎉 Đã lưu — bài viết hoàn chỉnh! +40 xu, +1 💎');
    else setNote('💾 Đã lưu.');
  };

  // Autosave a few seconds after he stops typing.
  useEffect(() => {
    if (text === (saved?.text ?? '') && checked.length === (saved?.checked.length ?? 0)) return;
    const t = setTimeout(() => void save(true), 4000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, checked]);

  return (
    <TownScreen student={student} tab={null} back={() => (void save(true), onBack())} showPowers={false} className="max-w-6xl">
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-3">
          <Panel>
            <h1 className="font-display text-2xl font-bold">{p.title}</h1>
            <p className="mt-1 font-semibold">🎯 {p.task}</p>
            {p.text && <p className="mt-2 whitespace-pre-line rounded-lg bg-tint-amber p-3 font-serif italic">{p.text}</p>}
          </Panel>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            lang="vi"
            placeholder="Viết bài của em ở đây…"
            className="h-[26rem] w-full resize-y rounded-xl border-[2.5px] border-ink bg-paper p-4 text-[15px] leading-relaxed outline-none focus:ring-2 focus:ring-[#ffc23d]"
          />
          <div className="flex flex-wrap items-center gap-3">
            <span className={cx('rounded-full px-3 py-1 text-sm font-bold tabular-nums', enough ? 'bg-tint-green' : 'bg-paper-2')}>
              {words} / ~{p.words} chữ
            </span>
            <TownButton tone="green" onClick={() => void save()}>
              <TB en="💾 Save" />
            </TownButton>
            {note && <span className="text-sm font-semibold">{note}</span>}
          </div>
        </div>
        <div className="space-y-3">
          <Panel>
            <h2 className="font-display text-lg font-bold">✅ Tự kiểm tra</h2>
            <p className="text-xs text-ink-soft">Đọc lại bài và đánh dấu những điều em đã làm được.</p>
            <ul className="mt-2 space-y-1.5">
              {p.checklist.map((c, i) => (
                <li key={i}>
                  <label className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={checked.includes(i)}
                      onChange={(e) => setChecked((cs) => (e.target.checked ? [...cs, i] : cs.filter((x) => x !== i)))}
                    />
                    {c}
                  </label>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel>
            <button className="font-display text-lg font-bold" onClick={() => setShowOutline((v) => !v)}>
              🗺️ Dàn ý gợi ý {showOutline ? '▲' : '▼'}
            </button>
            {showOutline ? (
              <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm">
                {p.outline.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ol>
            ) : (
              <p className="text-xs text-ink-soft">
                <T en="Try writing first, then open the outline to compare." />
              </p>
            )}
          </Panel>
        </div>
      </div>
    </TownScreen>
  );
}
