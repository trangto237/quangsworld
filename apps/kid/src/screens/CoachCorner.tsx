import { useEffect, useMemo, useState } from 'react';
import type { StudentProfile } from '@atlas/db';
import {
  ED, S, SOUND_GROUPS, SOUND_TIPS, STRATEGIES, STRESS_RULES, LESSONS_VI, endingDrill, getConcept, pairsDrill, soundDrill, stressDrill, wordsForRule, type Bi, type DrillItem,
} from '@atlas/knowledge';
import { Button, Marked, cx, useQuery } from '@atlas/ui';
import { TopBar } from '../components/TopBar';
import { BiText, Drill, SimilarQuestions, StressView } from '../components/Coach';
import { speak } from '../lib/speech';
import { T, TB, useLang } from '../i18n';
import { useKid, type CoachTopic } from '../store';

const TOPICS: { id: CoachTopic; icon: string; en: string }[] = [
  { id: 'stress', icon: '🥁', en: 'Word stress' },
  { id: 'endings', icon: '🔚', en: '-ed / -s endings' },
  { id: 'sounds', icon: '🔤', en: 'Letter sounds' },
  { id: 'twins', icon: '👂', en: 'Sound twins' },
  { id: 'grammar', icon: '🧩', en: 'Grammar & exam skills' },
];

export const topicFor = (conceptId: string): CoachTopic =>
  conceptId === 'en.pron.stress' ? 'stress' : conceptId === 'en.pron.endings' ? 'endings' : conceptId === 'en.pron.sounds' ? 'sounds' : conceptId === 'en.pron.pairs' ? 'twins' : 'grammar';

/** Coach Owl's corner: every rule explained with examples, and a practice round for each. */
export function CoachCorner({ student, topic: initialTopic, conceptId }: { student: StudentProfile; topic?: CoachTopic; conceptId?: string }) {
  const go = useKid((s) => s.go);
  const [topic, setTopic] = useState<CoachTopic>(initialTopic ?? (conceptId ? topicFor(conceptId) : 'stress'));
  const mistakes = useQuery((r) => r.listMistakes(student.id, { open: true }), [student.id]);
  const weak = useMemo(() => {
    const n = new Map<string, number>();
    for (const m of mistakes) if (m.conceptId.startsWith('en.')) n.set(m.conceptId, (n.get(m.conceptId) ?? 0) + 1);
    return [...n].sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [mistakes]);
  const [focus, setFocus] = useState(conceptId);
  useEffect(() => {
    if (focus) setTimeout(() => document.getElementById(`c-${focus}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }, [focus, topic]);

  return (
    <div className="min-h-dvh bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <TopBar student={student} back={() => go({ name: 'hub' })} />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="flex items-center gap-3">
          <span className="text-5xl" aria-hidden>
            🦉
          </span>
          <div>
            <h1 className="font-display text-3xl font-bold">
              <T en="Coach Owl's corner" />
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              <T en="The rules behind the answers — with examples you can hear, and practice for each one." />
            </p>
          </div>
        </div>

        {weak.length > 0 && (
          <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <p className="text-sm font-bold">
              <T en="Your weak spots (from the Mistake Book)" />
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {weak.map(([id, n]) => (
                <button
                  key={id}
                  onClick={() => {
                    setTopic(topicFor(id));
                    setFocus(id);
                  }}
                  className="rounded-full bg-rose-100 px-3 py-1 text-sm font-semibold text-rose-900 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-100"
                >
                  {getConcept(id)?.name ?? id} · {n}
                </button>
              ))}
            </div>
          </div>
        )}

        <nav className="sticky top-0 z-10 -mx-4 mt-4 flex gap-2 overflow-x-auto bg-slate-100/95 px-4 py-2 backdrop-blur dark:bg-slate-950/95" aria-label="Topics">
          {TOPICS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTopic(t.id);
                setFocus(undefined);
              }}
              aria-pressed={topic === t.id}
              className={cx(
                'shrink-0 rounded-xl px-4 py-2 font-semibold ring-1',
                topic === t.id ? 'bg-indigo-600 text-white ring-indigo-600' : 'bg-white ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:ring-slate-700 dark:hover:bg-slate-800',
              )}
            >
              {t.icon} <T en={t.en} />
            </button>
          ))}
        </nav>

        <div className="mt-4 space-y-4">
          {topic === 'stress' && <StressTopic />}
          {topic === 'endings' && <EndingsTopic />}
          {topic === 'sounds' && <SoundsTopic />}
          {topic === 'twins' && <TwinsTopic />}
          {topic === 'grammar' && <GrammarTopic focus={focus} />}
        </div>
      </main>
    </div>
  );
}

function Card({ id, title, children }: { id?: string; title: Bi | string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-16 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <h2 className="font-display text-lg font-bold">{typeof title === 'string' ? title : <BiText b={title} block />}</h2>
      <div className="mt-2 space-y-3 text-sm">{children}</div>
    </section>
  );
}

/** "Practise this" — opens a drill under the card. */
function PracticeToggle({ make, title }: { make: () => DrillItem[]; title?: Bi }) {
  const [items, setItems] = useState<DrillItem[] | null>(null);
  return items ? (
    <Drill items={items} regenerate={make} title={title} />
  ) : (
    <Button variant="game" onClick={() => setItems(make())}>
      <TB en="💪 Practise this" />
    </Button>
  );
}

function StressTopic() {
  return (
    <>
      <Card title={{ en: 'What is word stress?', vi: 'Trọng âm là gì?' }}>
        <BiText
          block
          b={{
            en: 'In every English word with 2+ syllables, one syllable is said louder, longer and higher — the stress. Vietnamese gives each syllable its own tone; English puts one big beat on the word. Tap 🥁 to hear and see the beat.',
            vi: 'Trong mỗi từ tiếng Anh có từ 2 âm tiết, sẽ có một âm tiết được đọc to hơn, dài hơn và cao hơn — đó là trọng âm. Tiếng Việt mỗi âm tiết có thanh điệu riêng; tiếng Anh dồn một "nhịp mạnh" vào từ. Chạm 🥁 để nghe và thấy nhịp.',
          }}
        />
        <div className="flex flex-wrap gap-3">
          {['HAP-py', 'be-GIN', 'BEAU-ti-ful', 'com-PU-ter', 'ed-u-CA-tion'].map((d) => (
            <StressView key={d} display={d} />
          ))}
        </div>
        <BiText
          block
          b={{
            en: 'How to solve exam questions: 1) count the syllables, 2) look for a special ending (-tion, -ic, -ity, -ee…), 3) no special ending? Ask: noun/adjective (front) or verb (back)? Each rule below has its own practice; the mixed practice is at the end.',
            vi: 'Cách làm bài thi: 1) đếm số âm tiết, 2) tìm đuôi đặc biệt (-tion, -ic, -ity, -ee…), 3) không có đuôi đặc biệt? Hỏi: danh từ/tính từ (nhấn đầu) hay động từ (nhấn sau)? Mỗi quy tắc bên dưới có phần luyện riêng; phần luyện tổng hợp ở cuối.',
          }}
        />
      </Card>
      {STRESS_RULES.map((r) => (
        <Card key={r.id} id={`stress-${r.id}`} title={r.title}>
          <BiText b={r.detail} block />
          <div className="flex flex-wrap gap-3">
            {wordsForRule(r.id)
              .slice(0, 6)
              .map((a) => (
                <StressView key={a.word.word} display={a.word.display} />
              ))}
          </div>
          <PracticeToggle make={() => stressDrill(r.id, Math.random, 5)} title={r.title} />
        </Card>
      ))}
      <Card title={{ en: 'Mixed practice: all the rules', vi: 'Luyện tập tổng hợp: tất cả quy tắc' }}>
        <BiText block b={{ en: 'Words from every rule, mixed up. Check the rules here if you get stuck:', vi: 'Từ của mọi quy tắc, trộn lẫn. Xem lại các quy tắc ở đây nếu bí:' }} />
        <ol className="list-decimal space-y-1 pl-5">
          {STRESS_RULES.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => document.getElementById(`stress-${r.id}`)?.scrollIntoView({ behavior: 'smooth' })}
                className="text-left underline decoration-dotted underline-offset-2 hover:text-indigo-600 dark:hover:text-indigo-300"
              >
                <BiText b={r.title} />
              </button>
            </li>
          ))}
        </ol>
        <PracticeToggle make={() => stressDrill(null, Math.random, 10)} title={{ en: 'Mixed practice', vi: 'Luyện tập tổng hợp' }} />
      </Card>
    </>
  );
}

function SoundTable<K extends string>({ groups, rule, mark }: { groups: Record<K, string[]>; rule: (k: K) => Bi; mark: (w: string, k: K) => string }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {(Object.keys(groups) as K[]).map((k) => (
        <div key={k} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
          <div className="font-mono text-2xl font-bold text-indigo-700 dark:text-indigo-300">{k}</div>
          <BiText b={rule(k)} className="text-xs" block />
          <div className="mt-2 flex flex-wrap gap-1">
            {groups[k].slice(0, 8).map((w) => (
              <button key={w} onClick={() => speak(w, 0.8)} className="rounded-md bg-white px-2 py-0.5 ring-1 ring-slate-200 hover:bg-indigo-50 dark:bg-slate-900 dark:ring-slate-700">
                <Marked text={mark(w, k)} />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const THROAT: Bi = {
  en: '🖐️ The throat test: put your fingers on your throat. Say /s/ — nothing. Say /z/ — it buzzes! Sounds without buzz (p, k, f, s, sh, ch, th) are "voiceless". Vowels and sounds that buzz are "voiced".',
  vi: '🖐️ Thử cổ họng: đặt ngón tay lên cổ. Đọc /s/ — không rung. Đọc /z/ — rung! Âm không rung (p, k, f, s, sh, ch, th) là "vô thanh". Nguyên âm và các âm có rung là "hữu thanh".',
};

function EndingsTopic() {
  return (
    <>
      <Card title={{ en: 'The secret: listen to the LAST SOUND, not the last letter', vi: 'Bí quyết: nghe ÂM CUỐI, không nhìn chữ cuối' }}>
        <BiText b={THROAT} block />
        <BiText
          block
          b={{
            en: 'Careful with spelling: "laugh" ends in /f/ (voiceless), "fix" ends in /ks/, "change" ends in /dʒ/, "close" ends in /z/.',
            vi: 'Cẩn thận với chính tả: "laugh" tận cùng là /f/ (vô thanh), "fix" là /ks/, "change" là /dʒ/, "close" là /z/.',
          }}
        />
      </Card>
      <Card title={{ en: '-ed endings: /ɪd/, /t/, /d/', vi: 'Đuôi -ed: /ɪd/, /t/, /d/' }}>
        <SoundTable
          groups={ED}
          mark={(w) => w.replace(/ed$/, '[ed]')}
          rule={(k) =>
            k === '/ɪd/'
              ? { en: 'after t or d — an extra syllable', vi: 'sau t hoặc d — thêm một âm tiết' }
              : k === '/t/'
                ? { en: 'after voiceless sounds: p, k, f, s, ʃ, tʃ', vi: 'sau âm vô thanh: p, k, f, s, ʃ, tʃ' }
                : { en: 'after everything else (voiced sounds, vowels)', vi: 'sau các âm còn lại (âm hữu thanh, nguyên âm)' }
          }
        />
        <PracticeToggle make={() => endingDrill('ed', Math.random, 8)} title={{ en: '-ed practice', vi: 'Luyện đuôi -ed' }} />
      </Card>
      <Card title={{ en: '-s / -es endings: /ɪz/, /s/, /z/', vi: 'Đuôi -s / -es: /ɪz/, /s/, /z/' }}>
        <SoundTable
          groups={S}
          mark={(w, k) => (k === '/ɪz/' ? w.replace(/es$/, '[es]') : w.replace(/s$/, '[s]'))}
          rule={(k) =>
            k === '/ɪz/'
              ? { en: 'after hissing sounds: s, z, ʃ, tʃ, dʒ — an extra syllable', vi: 'sau âm "xì": s, z, ʃ, tʃ, dʒ — thêm một âm tiết' }
              : k === '/s/'
                ? { en: 'after voiceless p, t, k, f, θ', vi: 'sau âm vô thanh p, t, k, f, θ' }
                : { en: 'after everything else (voiced sounds, vowels)', vi: 'sau các âm còn lại (âm hữu thanh, nguyên âm)' }
          }
        />
        <PracticeToggle make={() => endingDrill('s', Math.random, 8)} title={{ en: '-s practice', vi: 'Luyện đuôi -s' }} />
      </Card>
    </>
  );
}

function SoundsTopic() {
  return (
    <>
      {SOUND_GROUPS.map((g) => (
        <Card key={g.letters} title={`"${g.letters}"`}>
          {SOUND_TIPS[g.letters] && <BiText b={SOUND_TIPS[g.letters]} block />}
          <div className="grid gap-2 md:grid-cols-3">
            {Object.entries(g.sounds).map(([k, ws]) => (
              <div key={k} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                <div className="font-mono text-xl font-bold text-indigo-700 dark:text-indigo-300">{k}</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {ws.map((w) => (
                    <button key={w} onClick={() => speak(w.replace(/[[\]]/g, ''), 0.8)} className="rounded-md bg-white px-2 py-0.5 ring-1 ring-slate-200 hover:bg-indigo-50 dark:bg-slate-900 dark:ring-slate-700">
                      <Marked text={w} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <PracticeToggle make={() => soundDrill(g.letters, Math.random, 5)} />
        </Card>
      ))}
    </>
  );
}

function TwinsTopic() {
  return (
    <Card title={{ en: 'Sound twins: words that differ by one sound', vi: 'Cặp âm dễ nhầm: hai từ chỉ khác một âm' }}>
      <BiText
        block
        b={{
          en: 'Vietnamese speakers often mix up long/short vowels (ship/sheep) and drop final sounds (bike/bite). Listen for the one sound that changes.',
          vi: 'Người Việt hay nhầm nguyên âm dài/ngắn (ship/sheep) và nuốt âm cuối (bike/bite). Hãy nghe âm duy nhất bị thay đổi.',
        }}
      />
      <PracticeToggle make={() => pairsDrill(Math.random, 8)} title={{ en: 'Listening practice', vi: 'Luyện nghe' }} />
    </Card>
  );
}

function GrammarTopic({ focus }: { focus?: string }) {
  const lang = useLang();
  const [practising, setPractising] = useState<string | null>(focus ?? null);
  const ids = Object.keys(STRATEGIES).filter((id) => getConcept(id));
  return (
    <>
      {ids.map((id) => {
        const c = getConcept(id)!;
        return (
          <Card key={id} id={`c-${id}`} title={`${c.name}`}>
            <ol className="list-decimal space-y-1.5 pl-5">
              {STRATEGIES[id].map((s, i) => (
                <li key={i}>
                  <BiText b={s} block />
                </li>
              ))}
            </ol>
            {c.lesson && (
              <p className="rounded-xl bg-amber-50 p-3 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100">
                📖 {c.lesson}
                {lang !== 'en' && LESSONS_VI[id] && (
                  <span lang="vi" className="mt-1 block text-rose-900 dark:text-rose-200">
                    🇻🇳 {LESSONS_VI[id]}
                  </span>
                )}
              </p>
            )}
            {practising === id ? (
              <SimilarQuestions conceptId={id} difficulty={2} count={5} />
            ) : (
              <Button variant="game" onClick={() => setPractising(id)}>
                <TB en="💪 Practise with Coach" />
              </Button>
            )}
          </Card>
        );
      })}
    </>
  );
}
