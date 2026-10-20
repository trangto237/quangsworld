import { useEffect, useMemo, useState } from 'react';
import type { StudentProfile } from '@atlas/db';
import {
  ED, S, SOUND_GROUPS, SOUND_TIPS, STRATEGIES, STRESS_MEMORY, STRESS_RULES, LESSONS_VI, endingDrill, exceptionDrill, exceptionNote, stressExceptions, getConcept, pairsDrill, soundDrill, stressDrill, wordsForRule, type Bi, type DrillItem,
} from '@atlas/knowledge';
import { Marked, cx, useQuery } from '@atlas/ui';
import { TownScreen } from '../town/Shell';
import { TownButton } from '../town/ui';
import { BiText, Drill, SimilarQuestions, StressView } from '../components/Coach';
import { speak } from '../lib/speech';
import { T, TB, useLang } from '../i18n';
import type { CoachTopic } from '../store';

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
    <TownScreen student={student} tab="coach" showPowers={false}>
      <div className="town-panel flex items-center gap-3 p-4">
        <span className="text-5xl" aria-hidden>
          🦉
        </span>
        <div>
          <h1 className="font-display text-3xl font-bold">
            <T en="Coach Owl's corner" />
          </h1>
          <p className="text-ink-soft">
            <T en="The rules behind the answers — with examples you can hear, and practice for each one." />
          </p>
        </div>
      </div>

      {weak.length > 0 && (
        <div className="town-panel mt-4 p-4">
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
                className="rounded-full border-2 border-ink bg-tint-pink px-3 py-1 text-sm font-semibold text-ink-text hover:brightness-95"
              >
                {getConcept(id)?.name ?? id} · {n}
              </button>
            ))}
          </div>
        </div>
      )}

      <nav className="-mx-3 mt-4 flex gap-2 overflow-x-auto px-3 pb-2 pt-1 sm:-mx-4 sm:px-4" aria-label="Topics">
        {TOPICS.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTopic(t.id);
              setFocus(undefined);
            }}
            aria-pressed={topic === t.id}
            className={cx(
              'town-btn shrink-0 rounded-xl px-4 py-2 font-display font-bold',
              topic === t.id ? 'bg-[#8b5cf6] text-white' : 'bg-paper text-ink-text hover:bg-paper-3',
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
    </TownScreen>
  );
}

function Card({ id, title, children }: { id?: string; title: Bi | string; children: React.ReactNode }) {
  return (
    <section id={id} className="town-panel scroll-mt-40 p-5">
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
    <TownButton tone="green" onClick={() => setItems(make())}>
      <TB en="💪 Practise this" />
    </TownButton>
  );
}

/** Exceptions that share an explanation are shown together, with the note once. */
function exceptionGroups() {
  const groups = new Map<string, { note: Bi; words: string[] }>();
  for (const a of stressExceptions()) {
    const note = exceptionNote(a);
    const g = groups.get(note.en) ?? { note, words: [] };
    g.words.push(a.word.display);
    groups.set(note.en, g);
  }
  return [...groups.values()];
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
      <Card title={{ en: '🧠 How to remember', vi: '🧠 Mẹo ghi nhớ' }}>
        <BiText
          block
          b={{
            en: 'Most rules are really one question: where is the beat, counted from the END of the word? The ending tells you: 1, 2 or 3 from the end — or it doesn\'t count at all.',
            vi: 'Hầu hết quy tắc thật ra chỉ là một câu hỏi: nhịp mạnh ở đâu, đếm TỪ CUỐI từ? Đuôi từ cho em biết: âm 1, 2 hay 3 từ cuối — hoặc không tính.',
          }}
        />
        <div className="space-y-2">
          {STRESS_MEMORY.endings.map((e) => (
            <div key={e.n} className="flex gap-3 rounded-xl border-2 border-ink/25 bg-paper-2 p-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg border-2 border-ink bg-[#8b5cf6] font-display text-lg font-bold text-white">{e.n}</span>
              <div className="min-w-0 space-y-1.5">
                <div className="font-semibold">
                  <BiText b={e.title} />
                </div>
                <div className="font-mono text-sm text-[#5b3fc4] dark:text-[#c4b5fd]">{e.endings}</div>
                <BiText b={e.tip} className="text-xs" block />
                <div className="flex flex-wrap gap-2 pt-1">
                  {e.examples.map((d) => (
                    <StressView key={d} display={d} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="font-semibold">
          <BiText b={{ en: 'In the exam, check in this order:', vi: 'Khi làm bài, kiểm tra theo thứ tự:' }} />
        </div>
        <ul className="space-y-1.5">
          {STRESS_MEMORY.steps.map((b, i) => (
            <li key={i}>
              <BiText b={b} block />
            </li>
          ))}
        </ul>
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
      <Card id="stress-exceptions" title={{ en: '⚠️ Exceptions to learn by heart', vi: '⚠️ Ngoại lệ cần học thuộc' }}>
        <BiText
          block
          b={{ en: 'These words break the rules. Exams love them, so tap 🥁 on each and say it out loud a few times.', vi: 'Những từ này không theo quy tắc. Đề thi rất hay hỏi, nên hãy chạm 🥁 từng từ và đọc to vài lần.' }}
        />
        <div className="space-y-2">
          {exceptionGroups().map((g) => (
            <div key={g.note.en} className="space-y-1.5 rounded-xl border-2 border-ink/25 bg-paper-2 p-3">
              <div className="flex flex-wrap gap-2">
                {g.words.map((d) => (
                  <StressView key={d} display={d} />
                ))}
              </div>
              <BiText b={g.note} className="text-xs" block />
            </div>
          ))}
        </div>
        <PracticeToggle make={() => exceptionDrill(Math.random, 8)} title={{ en: 'Exceptions practice', vi: 'Luyện ngoại lệ' }} />
      </Card>
      <Card title={{ en: 'Mixed practice: all the rules', vi: 'Luyện tập tổng hợp: tất cả quy tắc' }}>
        <BiText block b={{ en: 'Words from every rule, mixed up. Check the rules here if you get stuck:', vi: 'Từ của mọi quy tắc, trộn lẫn. Xem lại các quy tắc ở đây nếu bí:' }} />
        <ol className="list-decimal space-y-1 pl-5">
          {STRESS_RULES.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => document.getElementById(`stress-${r.id}`)?.scrollIntoView({ behavior: 'smooth' })}
                className="text-left underline decoration-dotted underline-offset-2 hover:text-[#8b5cf6]"
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
        <div key={k} className="rounded-xl border-2 border-ink/25 bg-paper-2 p-3">
          <div className="font-mono text-2xl font-bold text-[#5b3fc4] dark:text-[#c4b5fd]">{k}</div>
          <BiText b={rule(k)} className="text-xs" block />
          <div className="mt-2 flex flex-wrap gap-1">
            {groups[k].slice(0, 8).map((w) => (
              <button key={w} onClick={() => speak(w, 0.8)} className="rounded-md border border-ink/40 bg-paper px-2 py-0.5 hover:bg-paper-3">
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
              <div key={k} className="rounded-xl border-2 border-ink/25 bg-paper-2 p-3">
                <div className="font-mono text-xl font-bold text-[#5b3fc4] dark:text-[#c4b5fd]">{k}</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {ws.map((w) => (
                    <button key={w} onClick={() => speak(w.replace(/[[\]]/g, ''), 0.8)} className="rounded-md border border-ink/40 bg-paper px-2 py-0.5 hover:bg-paper-3">
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
              <p className="rounded-xl border-2 border-ink/25 bg-tint-amber p-3 text-ink-text">
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
              <TownButton tone="green" onClick={() => setPractising(id)}>
                <TB en="💪 Practise with Coach" />
              </TownButton>
            )}
          </Card>
        );
      })}
    </>
  );
}
