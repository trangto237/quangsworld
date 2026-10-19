/**
 * Coach — step-by-step tutoring built from real rules, in English and Vietnamese.
 *
 * Every explanation is derived from the data (a word's actual stress, the actual sound of an ending), and a rule
 * is only quoted when it predicts the right answer. When a word breaks its rule, the Coach says so ("exception —
 * learn it by ear") instead of pretending the rule works.
 */
import type { Question } from '@atlas/shared';
import { ED, S, SOUND_GROUPS, STRESS, unmark, type StressWord } from './pronunciation';
import { PAIRS } from './pronunciation';
import { translateExplanation } from '../vi';

export interface Bi {
  en: string;
  vi: string;
}

export type CoachChip =
  /** A word shown as syllables with the stressed one big ("col-LEC-tion"). */
  | { kind: 'stress'; display: string; note?: Bi; odd?: boolean }
  /** A word (may contain [underline] marks) that can be played aloud. */
  | { kind: 'word'; text: string; speak: string; sound?: string; note?: Bi; odd?: boolean };

export interface CoachStep {
  title: Bi;
  body?: Bi;
  chips?: CoachChip[];
}

export type DrillItem =
  /** Tap the stressed syllable. */
  | { kind: 'stress'; display: string; why: Bi; hint?: Bi }
  /** Pick one answer; `audio` is played instead of showing the word when set. */
  | { kind: 'choice'; prompt: Bi; word?: string; audio?: string; options: string[]; answer: string; why: Bi; hint?: Bi };

export interface CoachPlan {
  steps: CoachStep[];
  /** A nudge that doesn't give the answer away (practice mode). */
  hint: Bi;
  /** Short exercises on the same rule. Empty → the UI offers "try a similar question" instead. */
  drill: DrillItem[];
}

const ORD_EN = ['1st', '2nd', '3rd', '4th', '5th'];
const ORD_VI = ['thứ nhất', 'thứ hai', 'thứ ba', 'thứ tư', 'thứ năm'];
const bi = (en: string, vi: string): Bi => ({ en, vi });

function shuffle<T>(a: readonly T[], r: () => number): T[] {
  const out = [...a];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// ═══ Word stress ════════════════════════════════════════════════

export interface StressRule {
  id: string;
  title: Bi;
  detail: Bi;
}

export const STRESS_RULES: StressRule[] = [
  {
    id: 'suffix-takes',
    title: bi('-ee, -eer, -oo, -oon take the stress', '-ee, -eer, -oo, -oon nhận trọng âm'),
    detail: bi(
      'These endings are always stressed themselves: vol-un-TEER, ref-er-EE, kan-ga-ROO, af-ter-NOON.',
      'Các đuôi này luôn mang trọng âm: vol-un-TEER, ref-er-EE, kan-ga-ROO, af-ter-NOON.',
    ),
  },
  {
    id: 'before-suffix',
    title: bi('Stress the syllable right before -tion, -sion, -ic, -ian, -ious', 'Trọng âm rơi vào âm tiết ngay trước -tion, -sion, -ic, -ian, -ious'),
    detail: bi(
      'Find the ending, then stress the syllable just in front of it: in-for-MA-tion, de-CI-sion, fan-TAS-tic, mu-SI-cian, de-LI-cious.',
      'Tìm đuôi, rồi nhấn vào âm tiết đứng ngay trước nó: in-for-MA-tion, de-CI-sion, fan-TAS-tic, mu-SI-cian, de-LI-cious.',
    ),
  },
  {
    id: 'third-from-end',
    title: bi('-ity, -logy, -graphy, -omy, -ate: 3rd syllable from the end', '-ity, -logy, -graphy, -omy, -ate: âm tiết thứ 3 từ cuối lên'),
    detail: bi(
      'Count back from the end: 1, 2, 3 — that one is stressed: a-BIL-i-ty, bi-OL-o-gy, pho-TOG-ra-phy, e-CON-o-my, cer-TIF-i-cate.',
      'Đếm ngược từ cuối: 1, 2, 3 — âm tiết đó mang trọng âm: a-BIL-i-ty, bi-OL-o-gy, pho-TOG-ra-phy, e-CON-o-my, cer-TIF-i-cate.',
    ),
  },
  {
    id: 'root-keeps',
    title: bi('-ful, -ment, -ing, -er, -ous, un-, in- don\'t move the stress', '-ful, -ment, -ing, -er, -ous, un-, in- không làm đổi trọng âm'),
    detail: bi(
      'Add these to a word and the stress stays where it was in the root word: en-JOY → en-JOY-ment, BEAU-ty → BEAU-ti-ful, de-PEN-dent → in-de-PEN-dent.',
      'Thêm các phần này vào một từ thì trọng âm giữ nguyên như ở từ gốc: en-JOY → en-JOY-ment, BEAU-ty → BEAU-ti-ful, de-PEN-dent → in-de-PEN-dent.',
    ),
  },
  {
    id: 'weak-a',
    title: bi('A first syllable "a-" is never stressed', 'Âm tiết đầu "a-" không bao giờ mang trọng âm'),
    detail: bi(
      'The "a" is a quick, weak /ə/ sound, so the stress goes to the 2nd syllable: a-GREE, a-VOID, a-LONE, a-SLEEP, a-BROAD.',
      '"a" đọc nhanh và nhẹ thành /ə/, nên trọng âm rơi vào âm tiết thứ hai: a-GREE, a-VOID, a-LONE, a-SLEEP, a-BROAD.',
    ),
  },
  {
    id: 'two-noun',
    title: bi('2-syllable nouns and adjectives: 1st syllable', 'Danh từ và tính từ 2 âm tiết: trọng âm ở âm tiết thứ nhất'),
    detail: bi(
      'Most two-syllable nouns and adjectives are stressed at the front: HAP-py, TA-ble, STU-dent, MOD-ern.',
      'Hầu hết danh từ và tính từ hai âm tiết có trọng âm ở đầu: HAP-py, TA-ble, STU-dent, MOD-ern.',
    ),
  },
  {
    id: 'two-verb',
    title: bi('2-syllable verbs: 2nd syllable', 'Động từ 2 âm tiết: trọng âm ở âm tiết thứ hai'),
    detail: bi(
      'Most two-syllable verbs are stressed at the back: be-GIN, de-CIDE, ex-PLAIN, en-JOY.',
      'Hầu hết động từ hai âm tiết có trọng âm ở sau: be-GIN, de-CIDE, ex-PLAIN, en-JOY.',
    ),
  },
  {
    id: 'two-verb-weak-end',
    title: bi('Verbs ending in -en, -er, -ish, -y, -el, -ow: 1st syllable', 'Động từ tận cùng -en, -er, -ish, -y, -el, -ow: âm tiết thứ nhất'),
    detail: bi(
      'These endings are weak, so even verbs are stressed at the front: O-pen, LIS-ten, HAP-pen, FIN-ish, STUD-y, TRAV-el.',
      'Các đuôi này đọc nhẹ, nên kể cả động từ cũng nhấn ở đầu: O-pen, LIS-ten, HAP-pen, FIN-ish, STUD-y, TRAV-el.',
    ),
  },
  {
    id: 'three-verb-last',
    title: bi('3-syllable verbs made of prefix + verb: last syllable', 'Động từ 3 âm tiết gồm tiền tố + động từ: âm tiết cuối'),
    detail: bi(
      'The stress stays on the verb part at the end: un-der-STAND, rec-om-MEND, in-tro-DUCE, dis-ap-PEAR, en-ter-TAIN.',
      'Trọng âm nằm ở phần động từ phía cuối: un-der-STAND, rec-om-MEND, in-tro-DUCE, dis-ap-PEAR, en-ter-TAIN.',
    ),
  },
  {
    id: 'three-verb-mid',
    title: bi('3-syllable verbs with a weak last syllable: 2nd syllable', 'Động từ 3 âm tiết có âm cuối yếu: âm tiết thứ hai'),
    detail: bi(
      'When the last syllable is weak (-er, -op, -ue), stress the middle: re-MEM-ber, de-VEL-op, con-TIN-ue.',
      'Khi âm tiết cuối đọc nhẹ (-er, -op, -ue), nhấn vào âm giữa: re-MEM-ber, de-VEL-op, con-TIN-ue.',
    ),
  },
  {
    id: 'weak-first',
    title: bi('Weak first syllable → stress the 2nd', 'Âm tiết đầu yếu → trọng âm ở âm tiết thứ hai'),
    detail: bi(
      'If the word starts with a quick, weak syllable (im-, com-, ex-, ad-, in-, to-, ba-, po-), the stress jumps to the 2nd: im-POR-tant, com-PU-ter, ba-NA-na, to-MOR-row.',
      'Nếu từ bắt đầu bằng một âm tiết yếu, đọc lướt (im-, com-, ex-, ad-, in-, to-, ba-, po-), trọng âm chuyển sang âm thứ hai: im-POR-tant, com-PU-ter, ba-NA-na, to-MOR-row.',
    ),
  },
  {
    id: 'long-front',
    title: bi('Longer nouns and adjectives: usually the 1st syllable', 'Danh từ, tính từ dài: thường ở âm tiết thứ nhất'),
    detail: bi(
      'With 3 or more syllables and no special ending, the stress is usually at the front: BEAU-ti-ful, EN-er-gy, HOS-pi-tal, CAL-cu-la-tor.',
      'Từ 3 âm tiết trở lên, không có đuôi đặc biệt, thường nhấn ở đầu: BEAU-ti-ful, EN-er-gy, HOS-pi-tal, CAL-cu-la-tor.',
    ),
  },
];
const RULE = Object.fromEntries(STRESS_RULES.map((r) => [r.id, r])) as Record<string, StressRule>;

/** Root words for "root-keeps": word → [root as stress display, syllables added in front]. */
const ROOTS: Record<string, [string, number]> = {
  beautiful: ['BEAU-ty', 0],
  wonderful: ['WON-der', 0],
  dangerous: ['DAN-ger', 0],
  careful: ['CARE', 0],
  teacher: ['TEACH', 0],
  customer: ['CUS-tom', 0],
  government: ['GOV-ern', 0],
  enjoyment: ['en-JOY', 0],
  entertainment: ['en-ter-TAIN', 0],
  understanding: ['un-der-STAND', 0],
  unemployed: ['em-PLOY', 1],
  independent: ['de-PEN-dent', 1],
  photographer: ['pho-TOG-ra-phy', 0],
};

const VERBS_2 = new Set(
  'travel visit listen open happen finish study promise begin repeat explain decide invite receive enjoy prefer relax forget arrive depend support complete protect prepare describe collect attend destroy improve control believe design agree avoid'.split(' '),
);
const WEAK_END_VERBS = new Set('open listen happen finish study travel'.split(' '));
const VERBS_3_LAST = new Set('entertain understand recommend introduce disappear interrupt contradict'.split(' '));
const VERBS_3_MID = new Set('remember develop continue'.split(' '));
const WEAK_FIRST = new Set('im com ex ad in to ba po ho de re at con'.split(' '));

/** Words that break the rule we'd expect, with a reason worth knowing. */
const EXCEPTION_NOTES: Record<string, Bi> = {
  hotel: bi('Borrowed from French — French words keep the stress at the end.', 'Từ mượn tiếng Pháp — từ gốc Pháp giữ trọng âm ở cuối.'),
  machine: bi('Borrowed from French — French words keep the stress at the end.', 'Từ mượn tiếng Pháp — từ gốc Pháp giữ trọng âm ở cuối.'),
  television: bi('A famous exception to the -sion rule: TEL-e-vi-sion.', 'Ngoại lệ nổi tiếng của quy tắc -sion: TEL-e-vi-sion.'),
  visit: bi('A common exception: VIS-it.', 'Ngoại lệ hay gặp: VIS-it.'),
  promise: bi('A common exception: PROM-ise.', 'Ngoại lệ hay gặp: PROM-ise.'),
  mistake: bi('mis- is a prefix — prefixes are usually not stressed: mis-TAKE.', 'mis- là tiền tố — tiền tố thường không mang trọng âm: mis-TAKE.'),
  answer: bi('Noun and verb, both stressed at the front: AN-swer.', 'Vừa là danh từ vừa là động từ, đều nhấn ở đầu: AN-swer.'),
};

export interface StressAnalysis {
  word: StressWord;
  rule: StressRule;
  /** True when the rule above would predict another syllable. */
  exception: boolean;
  /** For root-keeps: the root word's pattern. */
  root?: string;
}

const last = (w: StressWord) => w.syllables.length - 1;

/** Which rule explains this word's stress (or which rule it breaks). */
export function analyseStress(w: StressWord): StressAnalysis {
  const n = w.syllables.length;
  const word = w.word;
  const res = (id: string, predicted: number, root?: string): StressAnalysis => ({ word: w, rule: RULE[id], exception: predicted !== w.stress, root });

  if (/(ee|eer|oo|oon)$/.test(word)) return res('suffix-takes', last(w));
  if (ROOTS[word]) {
    const [root, pre] = ROOTS[word];
    const rootStress = root.split('-').findIndex((s) => s === s.toUpperCase());
    return res('root-keeps', pre + rootStress, root);
  }
  if (/(tion|sion|cian|ic|ious|ian)$/.test(word)) return res('before-suffix', n - 2);
  if (n >= 3 && /(ity|logy|graphy|omy|ate|ience)$/.test(word)) return res('third-from-end', n - 3);
  if (n === 2 && w.syllables[0].toLowerCase() === 'a') return res('weak-a', 1);
  if (n === 2) {
    if (VERBS_2.has(word)) return WEAK_END_VERBS.has(word) ? res('two-verb-weak-end', 0) : res('two-verb', 1);
    return res('two-noun', 0);
  }
  if (VERBS_3_LAST.has(word)) return res('three-verb-last', last(w));
  if (VERBS_3_MID.has(word)) return res('three-verb-mid', 1);
  if (w.stress === 1 && WEAK_FIRST.has(w.syllables[0].toLowerCase())) return res('weak-first', 1);
  return res('long-front', 0);
}

export const stressWord = (word: string) => STRESS.find((w) => w.word === unmark(word).toLowerCase());

/** All words that follow a rule (no exceptions) — for practice. */
export const wordsForRule = (ruleId: string) => STRESS.map(analyseStress).filter((a) => a.rule.id === ruleId && !a.exception);

function stressNote(a: StressAnalysis): Bi {
  const pos = a.word.stress;
  const where = bi(`${ORD_EN[pos]} syllable`, `âm tiết ${ORD_VI[pos]}`);
  if (a.exception) {
    const extra = EXCEPTION_NOTES[a.word.word];
    return bi(
      `${where.en} — exception: ${extra?.en ?? `the usual rule ("${a.rule.title.en}") doesn't work here, learn it by ear.`}`,
      `${where.vi} — ngoại lệ: ${extra?.vi ?? `quy tắc thường gặp ("${a.rule.title.vi}") không đúng ở đây, hãy nghe và nhớ.`}`,
    );
  }
  if (a.root) return bi(`${where.en} — same as the root word ${a.root}`, `${where.vi} — giống từ gốc ${a.root}`);
  return bi(`${where.en} — ${a.rule.title.en}`, `${where.vi} — ${a.rule.title.vi}`);
}

export function stressDrill(ruleId: string | null, r: () => number = Math.random, n = 5, exclude: string[] = []): DrillItem[] {
  const pool = (ruleId ? wordsForRule(ruleId) : STRESS.map(analyseStress)).filter((a) => !exclude.includes(a.word.word));
  return shuffle(pool, r)
    .slice(0, n)
    .map((a) => ({
      kind: 'stress',
      display: a.word.display,
      why: stressNote(a),
      hint: a.exception
        ? bi('This one breaks the usual rule — tap 🥁 and trust your ears.', 'Từ này không theo quy tắc thường gặp — chạm 🥁 và tin vào tai mình.')
        : a.root
          ? bi(`Think of the root word: ${a.root.toLowerCase()}.`, `Nghĩ đến từ gốc: ${a.root.toLowerCase()}.`)
          : a.rule.title,
    }));
}

function coachStress(q: Question, r: () => number): CoachPlan {
  const right = q.options[q.answer];
  const words = q.options.map((o) => ({ o, w: stressWord(o) }));
  if (words.some((x) => !x.w)) return generic(q, r);
  const analyses = words.map((x) => ({ o: x.o, a: analyseStress(x.w!) }));
  const odd = analyses.find((x) => x.o === right)!.a;
  const same = analyses.filter((x) => x.o !== right).map((x) => x.a);
  const pos = same[0].word.stress;
  const ruleIds = [...new Set(analyses.filter((x) => !x.a.exception).map((x) => x.a.rule.id))];
  return {
    hint: bi(
      'Break each word into syllables and say it aloud. Look at the endings (-tion, -ic, -ity, -ee…) and ask: noun or verb?',
      'Tách mỗi từ thành âm tiết và đọc to. Nhìn đuôi từ (-tion, -ic, -ity, -ee…) và tự hỏi: danh từ hay động từ?',
    ),
    steps: [
      {
        title: bi('1. Split into syllables and find the beat', '1. Tách âm tiết và tìm "nhịp mạnh"'),
        body: bi(
          'The stressed syllable is louder, longer and higher. Tap a word to hear it, or 🥁 to clap the beat.',
          'Âm tiết mang trọng âm được đọc to hơn, dài hơn và cao hơn. Chạm vào từ để nghe, hoặc 🥁 để vỗ theo nhịp.',
        ),
        chips: analyses.map((x) => ({ kind: 'stress', display: x.a.word.display })),
      },
      {
        title: bi('2. Why is each word stressed there?', '2. Vì sao mỗi từ có trọng âm ở đó?'),
        chips: analyses.map((x) => ({ kind: 'stress', display: x.a.word.display, note: stressNote(x.a), odd: x.o === right })),
      },
      {
        title: bi('3. Find the odd one out', '3. Tìm từ khác các từ còn lại'),
        body: bi(
          `${same.map((a) => a.word.display).join(', ')} are stressed on the ${ORD_EN[pos]} syllable. ${odd.word.display} is stressed on the ${ORD_EN[odd.word.stress]} → the answer is "${odd.word.word}".`,
          `${same.map((a) => a.word.display).join(', ')} có trọng âm ở âm tiết ${ORD_VI[pos]}. ${odd.word.display} có trọng âm ở âm tiết ${ORD_VI[odd.word.stress]} → đáp án là "${odd.word.word}".`,
        ),
      },
      {
        title: bi('4. Remember', '4. Ghi nhớ'),
        body: odd.exception ? stressNote(odd) : odd.rule.detail,
      },
      {
        title: bi('Tip: the other syllables are weak', 'Mẹo: các âm tiết còn lại đọc nhẹ'),
        body: bi(
          'Unstressed syllables are short and often sound like "uh" /ə/: com-PU-ter = /kəm-PJUː-tə/. Saying them quickly makes the stress clear.',
          'Âm tiết không nhấn thì ngắn và thường đọc như "ơ" /ə/: com-PU-ter = /kəm-PJUː-tə/. Đọc lướt chúng giúp trọng âm rõ hơn.',
        ),
      },
    ],
    drill: [
      ...stressDrill(odd.exception ? null : odd.rule.id, r, 3, analyses.map((x) => x.a.word.word)),
      ...stressDrill(ruleIds.find((id) => id !== odd.rule.id) ?? null, r, 2, analyses.map((x) => x.a.word.word)),
    ],
  };
}

// ═══ -ed / -s endings ═══════════════════════════════════════════

const VOICELESS = bi(
  'Touch your throat. /p/ /k/ /f/ /s/ /ʃ/ /tʃ/ /θ/: no buzz — "voiceless". Vowels and /b/ /g/ /v/ /z/ /m/ /n/ /l/ /r/ /dʒ/: buzz — "voiced".',
  'Đặt tay lên cổ họng. /p/ /k/ /f/ /s/ /ʃ/ /tʃ/ /θ/: không rung — "âm vô thanh". Nguyên âm và /b/ /g/ /v/ /z/ /m/ /n/ /l/ /r/ /dʒ/: có rung — "âm hữu thanh".',
);

/** Exact last sound for words whose spelling is misleading. */
const LAST_SOUND: Record<string, [string, string]> = {
  closed: ['close', '/z/'],
  changed: ['change', '/dʒ/'],
  roses: ['rose', '/z/'],
  houses: ['house', '/z/'],
  buses: ['bus', '/s/'],
  laughed: ['laugh', '/f/'],
  laughs: ['laugh', '/f/'],
  coughs: ['cough', '/f/'],
  months: ['month', '/θ/'],
  relaxed: ['relax', '/ks/'],
  fixed: ['fix', '/ks/'],
  fixes: ['fix', '/ks/'],
  boxes: ['box', '/ks/'],
  answered: ['answer', '/ə/ (a vowel)'],
  quizzes: ['quiz', '/z/'],
};

const VOWEL_END = '(a vowel)';

/** Base word and its last sound, e.g. "watched" → ["watch", "/tʃ/"]. */
export function lastSound(word: string, ending: 'ed' | 's'): [string, string] {
  if (LAST_SOUND[word]) return LAST_SOUND[word];
  let stem = ending === 'ed' ? word.replace(/ed$/, '') : word.replace(/s$/, '');
  if (ending === 's' && /(ch|sh|x|ss|zz)es$/.test(word)) stem = word.replace(/es$/, '');
  if (/ie[ds]$/.test(word)) stem = word.replace(/ie[ds]$/, 'y');
  if (ending === 'ed') {
    if (/([bcdfgklmnprstvz])\1$/.test(stem) && !KEEP_DOUBLE.has(stem)) stem = stem.slice(0, -1); // stopped → stop
    if (E_BASE.has(stem + 'e')) stem += 'e'; // decided → decide
  }
  // Strip a silent final e to find the sound.
  const core = stem.replace(/([^aeiou])e$/, '$1');
  const sound = (() => {
    if (/(tch|ch)$/.test(core)) return '/tʃ/';
    if (/sh$/.test(core)) return '/ʃ/';
    if (/th$/.test(core)) return '/θ/';
    if (/gh$/.test(core)) return '/f/';
    if (/x$/.test(core)) return '/ks/';
    if (/(dg|g)$/.test(core) && /(dge|ge)$/.test(stem)) return '/dʒ/';
    if (/ng$/.test(core)) return '/ŋ/';
    if (/(ck|k)$/.test(core)) return '/k/';
    if (/c$/.test(core)) return '/s/';
    if (/z$/.test(core)) return '/z/';
    if (/s$/.test(core)) return '/s/';
    if (/[aeiouyw]$/.test(core)) return VOWEL_END;
    const c = core.slice(-1);
    return `/${c}/`;
  })();
  return [stem, sound];
}
const KEEP_DOUBLE = new Set(['add', 'fill', 'call', 'kiss', 'miss', 'pass', 'cross']);
const E_BASE = new Set(['decide', 'invite', 'create', 'complete', 'dance', 'hope', 'introduce', 'produce', 'practise', 'increase', 'live', 'love', 'arrive', 'change', 'close', 'believe', 'move', 'smile']);

function edWhy(word: string, sound: string): Bi {
  const [base, last] = lastSound(word, 'ed');
  const v = last === VOWEL_END ? bi('a vowel sound', 'một nguyên âm') : bi(last, last);
  if (sound === '/ɪd/') return bi(`${base} ends in ${v.en} → after t or d, -ed is an extra syllable /ɪd/.`, `${base} tận cùng bằng ${v.vi} → sau t hoặc d, -ed thành một âm tiết riêng /ɪd/.`);
  if (sound === '/t/') return bi(`${base} ends in ${v.en}, a voiceless sound (no buzz) → -ed = /t/.`, `${base} tận cùng bằng ${v.vi}, âm vô thanh (không rung) → -ed = /t/.`);
  return bi(`${base} ends in ${v.en}, a voiced sound (buzz) → -ed = /d/.`, `${base} tận cùng bằng ${v.vi}, âm hữu thanh (có rung) → -ed = /d/.`);
}

function sWhy(word: string, sound: string): Bi {
  const [base, last] = lastSound(word, 's');
  const v = last === VOWEL_END ? bi('a vowel sound', 'một nguyên âm') : bi(last, last);
  if (sound === '/ɪz/') return bi(`${base} ends in ${v.en}, a hissing sound (s, z, ʃ, tʃ, dʒ) → -es is an extra syllable /ɪz/.`, `${base} tận cùng bằng ${v.vi}, âm "xì" (s, z, ʃ, tʃ, dʒ) → -es thành một âm tiết riêng /ɪz/.`);
  if (sound === '/s/') return bi(`${base} ends in ${v.en}, a voiceless sound (no buzz) → -s = /s/.`, `${base} tận cùng bằng ${v.vi}, âm vô thanh (không rung) → -s = /s/.`);
  return bi(`${base} ends in ${v.en}, a voiced sound (buzz) → -s = /z/.`, `${base} tận cùng bằng ${v.vi}, âm hữu thanh (có rung) → -s = /z/.`);
}

const soundOf = <K extends string>(groups: Record<K, string[]>, word: string) => (Object.keys(groups) as K[]).find((k) => groups[k].includes(word));

export function endingDrill(kind: 'ed' | 's' | 'both', r: () => number = Math.random, n = 5, exclude: string[] = []): DrillItem[] {
  const items: DrillItem[] = [];
  const all = [
    ...(kind !== 's' ? Object.entries(ED).flatMap(([s, ws]) => ws.map((w) => ({ w, s, ed: true }))) : []),
    ...(kind !== 'ed' ? Object.entries(S).flatMap(([s, ws]) => ws.map((w) => ({ w, s, ed: false }))) : []),
  ].filter((x) => !exclude.includes(x.w));
  for (const x of shuffle(all, r).slice(0, n))
    items.push({
      kind: 'choice',
      prompt: bi(`How is the ending of "${x.w}" pronounced?`, `Đuôi của "${x.w}" được phát âm thế nào?`),
      word: x.ed ? x.w.replace(/ed$/, '[ed]') : x.s === '/ɪz/' ? x.w.replace(/es$/, '[es]') : x.w.replace(/s$/, '[s]'),
      options: x.ed ? ['/t/', '/d/', '/ɪd/'] : ['/s/', '/z/', '/ɪz/'],
      answer: x.s,
      why: x.ed ? edWhy(x.w, x.s) : sWhy(x.w, x.s),
      hint: (() => {
        const [base, last] = lastSound(x.w, x.ed ? 'ed' : 's');
        const v = last === VOWEL_END ? bi('a vowel sound', 'một nguyên âm') : bi(last, last);
        return bi(`Take off the ending: "${base}" ends in ${v.en}. Touch your throat — buzz or no buzz?`, `Bỏ đuôi đi: "${base}" tận cùng bằng ${v.vi}. Đặt tay lên cổ — có rung hay không?`);
      })(),
    });
  return items;
}

function coachEndings(q: Question, r: () => number): CoachPlan | null {
  const right = q.options[q.answer];
  const plainOpts = q.options.map((o) => unmark(o));
  const isEd = plainOpts.every((w) => soundOf(ED, w));
  const isS = !isEd && plainOpts.every((w) => soundOf(S, w));
  if (!isEd && !isS) return null;
  const sounds = plainOpts.map((w) => (isEd ? soundOf(ED, w)! : soundOf(S, w)!));
  const why = (w: string, s: string) => (isEd ? edWhy(w, s) : sWhy(w, s));
  const oddIdx = q.options.indexOf(right);
  const sameSound = sounds.find((_, i) => i !== oddIdx)!;
  return {
    hint: bi(
      'Don\'t look at the letters — say the word without its ending and listen to the LAST SOUND.',
      'Đừng nhìn chữ cái — đọc từ khi bỏ đuôi và nghe ÂM CUỐI CÙNG.',
    ),
    steps: [
      {
        title: bi('1. Take off the ending, find the last sound', '1. Bỏ đuôi, tìm âm cuối'),
        body: VOICELESS,
        chips: q.options.map((o, i) => {
          const [base, last] = lastSound(plainOpts[i], isEd ? 'ed' : 's');
          return { kind: 'word', text: o, speak: plainOpts[i], sound: `${base} → ${last === VOWEL_END ? 'vowel' : last}` };
        }),
      },
      {
        title: bi(isEd ? '2. Apply the -ed rule' : '2. Apply the -s rule', isEd ? '2. Áp dụng quy tắc -ed' : '2. Áp dụng quy tắc -s'),
        chips: q.options.map((o, i) => ({ kind: 'word', text: o, speak: plainOpts[i], sound: sounds[i], note: why(plainOpts[i], sounds[i]), odd: o === right })),
      },
      {
        title: bi('3. Find the odd one out', '3. Tìm từ khác các từ còn lại'),
        body: bi(
          `Three words end in ${sameSound}; "${plainOpts[oddIdx]}" ends in ${sounds[oddIdx]} → that's the answer.`,
          `Ba từ có đuôi đọc ${sameSound}; "${plainOpts[oddIdx]}" đọc ${sounds[oddIdx]} → đó là đáp án.`,
        ),
      },
      {
        title: bi('4. Remember', '4. Ghi nhớ'),
        body: isEd
          ? bi('-ed: /ɪd/ after t, d · /t/ after voiceless sounds (p, k, f, s, ʃ, tʃ) · /d/ after everything else.', '-ed: /ɪd/ sau t, d · /t/ sau âm vô thanh (p, k, f, s, ʃ, tʃ) · /d/ sau các âm còn lại.')
          : bi('-s: /ɪz/ after s, z, ʃ, tʃ, dʒ · /s/ after voiceless p, t, k, f, θ · /z/ after everything else.', '-s: /ɪz/ sau s, z, ʃ, tʃ, dʒ · /s/ sau âm vô thanh p, t, k, f, θ · /z/ sau các âm còn lại.'),
      },
    ],
    drill: endingDrill(isEd ? 'ed' : 's', r, 5, plainOpts),
  };
}

// ═══ Letters and their sounds ═══════════════════════════════════

export const SOUND_TIPS: Record<string, Bi> = {
  a: bi('/æ/ in short words (cat, map); /eɪ/ with a silent e or before -tion (name, station); /ɑː/ before r (car, park).', '/æ/ trong từ ngắn (cat, map); /eɪ/ khi có e câm hoặc trước -tion (name, station); /ɑː/ trước r (car, park).'),
  i: bi('/ɪ/ in short words (sit, big); /aɪ/ with a silent e or before -mb, -nd, -ght (kite, climb).', '/ɪ/ trong từ ngắn (sit, big); /aɪ/ khi có e câm hoặc trước -mb, -nd, -ght (kite, climb).'),
  o: bi('/ɒ/ in short words (hot); /əʊ/ with a silent e or at the end (home, go); /ʌ/ in a few common words — come, love, son, money, mother, Monday.', '/ɒ/ trong từ ngắn (hot); /əʊ/ khi có e câm hoặc ở cuối (home, go); /ʌ/ trong vài từ quen thuộc — come, love, son, money, mother, Monday.'),
  u: bi('/ʌ/ (cut, sun); /ʊ/ after p, b, f (put, push, full); /juː/ like "you" (music, use, student).', '/ʌ/ (cut, sun); /ʊ/ sau p, b, f (put, push, full); /juː/ giống "you" (music, use, student).'),
  oo: bi('Usually long /uː/ (food, school); short /ʊ/ before k and in good, foot, wood, stood; /ʌ/ only in blood and flood.', 'Thường là /uː/ dài (food, school); /ʊ/ ngắn trước k và trong good, foot, wood, stood; /ʌ/ chỉ trong blood và flood.'),
  ea: bi('Usually /iː/ (meat, teach); /e/ in bread, head, heavy, weather, breakfast, ready, health; /eɪ/ only in break, great, steak.', 'Thường là /iː/ (meat, teach); /e/ trong bread, head, heavy, weather, breakfast, ready, health; /eɪ/ chỉ trong break, great, steak.'),
  ch: bi('/tʃ/ in everyday words (church, teacher); /k/ in words from Greek, often science (chemistry, school, character, technology); /ʃ/ in words from French (machine, chef).', '/tʃ/ trong từ thông thường (church, teacher); /k/ trong từ gốc Hy Lạp, hay là từ khoa học (chemistry, school, character, technology); /ʃ/ trong từ gốc Pháp (machine, chef).'),
  th: bi('/θ/ — no voice, air between the teeth (think, three, month); /ð/ — with voice, in this, they, though and mother, father, brother, together.', '/θ/ — không rung, đẩy hơi qua kẽ răng (think, three, month); /ð/ — có rung, trong this, they, though và mother, father, brother, together.'),
  c: bi('/s/ before e, i, y (city, rice, centre); /k/ before a, o, u or a consonant (cat, come, class).', '/s/ trước e, i, y (city, rice, centre); /k/ trước a, o, u hoặc phụ âm (cat, come, class).'),
  g: bi('/dʒ/ often before e, i, y (gym, page, energy); /g/ before a, o, u (go, game). Careful: get, gift, girl are /g/.', '/dʒ/ thường đứng trước e, i, y (gym, page, energy); /g/ trước a, o, u (go, game). Chú ý: get, gift, girl đọc /g/.'),
  h: bi('Silent in hour, honest, honour, heir — that\'s why we say "an hour".', 'Câm trong hour, honest, honour, heir — vì vậy ta nói "an hour".'),
  gh: bi('/f/ at the end of laugh, cough, enough, rough, tough; silent in -igh, -ought, -aught (night, thought, daughter).', '/f/ ở cuối laugh, cough, enough, rough, tough; câm trong -igh, -ought, -aught (night, thought, daughter).'),
  s: bi('Usually /s/; /z/ between vowels (rise, music, easy, visit); /ʒ/ in -sure, -sion, -sual (pleasure, decision, usually); /ʃ/ in sugar and sure.', 'Thường là /s/; /z/ khi nằm giữa hai nguyên âm (rise, music, easy, visit); /ʒ/ trong -sure, -sion, -sual (pleasure, decision, usually); /ʃ/ trong sugar và sure.'),
};

const soundName = (k: string) => (k === 'silent' ? 'silent' : k);

function findSoundGroup(marked: string) {
  for (const g of SOUND_GROUPS) for (const [k, ws] of Object.entries(g.sounds)) if (ws.includes(marked)) return { g, sound: k };
  return undefined;
}

export function soundDrill(letters: string | null, r: () => number = Math.random, n = 5, exclude: string[] = []): DrillItem[] {
  const groups = letters ? SOUND_GROUPS.filter((g) => g.letters === letters) : SOUND_GROUPS;
  const all = groups.flatMap((g) => Object.entries(g.sounds).flatMap(([k, ws]) => ws.map((w) => ({ g, k, w })))).filter((x) => !exclude.includes(x.w));
  return shuffle(all, r)
    .slice(0, n)
    .map((x) => ({
      kind: 'choice',
      prompt: bi(`How is the underlined "${x.g.letters}" pronounced?`, `Phần gạch chân "${x.g.letters}" được đọc thế nào?`),
      word: x.w,
      options: Object.keys(x.g.sounds).map(soundName),
      answer: soundName(x.k),
      why: bi(`${unmark(x.w)}: "${x.g.letters}" = ${soundName(x.k)}. ${SOUND_TIPS[x.g.letters]?.en ?? ''}`, `${unmark(x.w)}: "${x.g.letters}" = ${soundName(x.k)}. ${SOUND_TIPS[x.g.letters]?.vi ?? ''}`),
      hint: SOUND_TIPS[x.g.letters],
    }));
}

function coachSounds(q: Question, r: () => number): CoachPlan | null {
  const found = q.options.map((o) => findSoundGroup(o));
  if (found.some((f) => !f)) return null;
  const right = q.options[q.answer];
  const g = found[0]!.g;
  const tip = SOUND_TIPS[g.letters];
  const oddSound = found[q.answer]!.sound;
  const same = found.find((_, i) => i !== q.answer)!.sound;
  return {
    hint: bi(`Same letters "${g.letters}", different sounds. Say each word aloud and listen only to the underlined part.`, `Cùng chữ "${g.letters}" nhưng khác âm. Đọc to từng từ và chỉ nghe phần gạch chân.`),
    steps: [
      {
        title: bi(`1. Say each word — how does "${g.letters}" sound?`, `1. Đọc từng từ — "${g.letters}" đọc thế nào?`),
        chips: q.options.map((o, i) => ({ kind: 'word', text: o, speak: unmark(o), sound: soundName(found[i]!.sound), odd: o === right })),
      },
      {
        title: bi('2. Find the odd one out', '2. Tìm từ khác các từ còn lại'),
        body: bi(
          `Three words have ${soundName(same)}; "${unmark(right)}" has ${soundName(oddSound)} → that's the answer.`,
          `Ba từ có âm ${soundName(same)}; "${unmark(right)}" có âm ${soundName(oddSound)} → đó là đáp án.`,
        ),
      },
      ...(tip ? [{ title: bi(`3. The pattern for "${g.letters}"`, `3. Quy luật của "${g.letters}"`), body: tip }] : []),
    ],
    drill: soundDrill(g.letters, r, 5, q.options),
  };
}

// ═══ Sound twins ════════════════════════════════════════════════

function mouthTip(why: string): Bi {
  if (/iː|ɪ/.test(why)) return bi('/iː/ is long with a smile (sheep); /ɪ/ is short and relaxed (ship).', '/iː/ dài, miệng cười (sheep); /ɪ/ ngắn, miệng thả lỏng (ship).');
  if (/uː|ʊ/.test(why)) return bi('/uː/ is long with round lips (pool); /ʊ/ is short (pull).', '/uː/ dài, môi tròn (pool); /ʊ/ ngắn (pull).');
  if (/θ/.test(why)) return bi('/θ/: put your tongue between your teeth and blow — not /s/ or /t/.', '/θ/: đặt lưỡi giữa hai hàm răng và thổi hơi — không phải /s/ hay /t/.');
  if (/l\/ vs \/r/.test(why)) return bi('/l/: tongue touches behind the top teeth; /r/: tongue curls back and touches nothing.', '/l/: đầu lưỡi chạm sau răng trên; /r/: lưỡi cong về sau, không chạm vào đâu.');
  if (/final/.test(why) || /at the end/.test(why)) return bi('Vietnamese often drops final sounds — in English they change the word. Say the last sound clearly: bike /k/, bite /t/.', 'Tiếng Việt hay nuốt âm cuối — trong tiếng Anh âm cuối làm đổi nghĩa. Hãy đọc rõ âm cuối: bike /k/, bite /t/.');
  if (/æ/.test(why)) return bi('/æ/: open your mouth wide, jaw down (cat, man); /e/ and /ʌ/ are smaller.', '/æ/: mở miệng rộng, hạ hàm (cat, man); /e/ và /ʌ/ mở nhỏ hơn.');
  if (/f\/ vs \/v/.test(why)) return bi('/f/ and /v/: top teeth on the bottom lip; /v/ buzzes, /f/ doesn\'t.', '/f/ và /v/: răng trên chạm môi dưới; /v/ có rung, /f/ thì không.');
  if (/ʃ/.test(why)) return bi('/ʃ/ is a soft "sh"; /tʃ/ starts with a little /t/ stop — "ch".', '/ʃ/ là "sh" nhẹ; /tʃ/ bắt đầu bằng một tiếng /t/ ngắn — "ch".');
  return bi('Listen for the one sound that changes. Say both words slowly, then fast.', 'Nghe âm duy nhất bị thay đổi. Đọc cả hai từ chậm, rồi nhanh.');
}

export function pairsDrill(r: () => number = Math.random, n = 5): DrillItem[] {
  return shuffle(PAIRS, r)
    .slice(0, n)
    .map(([a, b, why]) => {
      const target = r() < 0.5 ? a : b;
      return { kind: 'choice', prompt: bi('Listen. Which word do you hear?', 'Nghe. Em nghe thấy từ nào?'), audio: target, options: [a, b], answer: target, why: bi(`${a} / ${b}: ${why}. ${mouthTip(why).en}`, `${a} / ${b}: ${why}. ${mouthTip(why).vi}`), hint: bi(`Listen for: ${why}.`, `Hãy nghe: ${why}.`) };
    });
}

function coachPairs(q: Question, r: () => number): CoachPlan | null {
  const right = q.options[q.answer];
  const pair = PAIRS.find(([a, b]) => (a === right || b === right) && q.options.includes(a) && q.options.includes(b));
  if (!pair) return null;
  const [a, b, why] = pair;
  return {
    hint: bi('Listen again and focus on just one sound — the vowel, or the very last sound.', 'Nghe lại và chỉ tập trung vào một âm — nguyên âm, hoặc âm cuối cùng.'),
    steps: [
      { title: bi('1. Listen to both words', '1. Nghe cả hai từ'), chips: [a, b].map((w) => ({ kind: 'word', text: w, speak: w, odd: w === right })) },
      { title: bi('2. What is different?', '2. Khác nhau ở đâu?'), body: bi(`${a} / ${b}: ${why}. You heard "${right}".`, `${a} / ${b}: ${why}. Em đã nghe "${right}".`) },
      { title: bi('3. How to make the sound', '3. Cách phát âm'), body: mouthTip(why) },
    ],
    drill: pairsDrill(r),
  };
}

// ═══ Grammar, vocabulary and exam skills ════════════════════════

/** How to attack each kind of question. */
export const STRATEGIES: Record<string, Bi[]> = {
  'en.grammar.tenses': [
    bi('Find the time clue: yesterday / ago / last … (past simple), already / yet / since / for / ever (present perfect), now / look! (present continuous), every day / usually (present simple).', 'Tìm dấu hiệu thời gian: yesterday / ago / last … (quá khứ đơn), already / yet / since / for / ever (hiện tại hoàn thành), now / look! (hiện tại tiếp diễn), every day / usually (hiện tại đơn).'),
    bi('Two past actions? The one that happened first → past perfect (had + V3).', 'Có hai hành động trong quá khứ? Hành động xảy ra trước → quá khứ hoàn thành (had + V3).'),
    bi('Check the subject: he / she / it → has, does, -s.', 'Kiểm tra chủ ngữ: he / she / it → has, does, thêm -s.'),
  ],
  'en.grammar.passive': [
    bi('Does the subject DO the action or RECEIVE it? Receives → passive.', 'Chủ ngữ TỰ làm hành động hay BỊ/ĐƯỢC tác động? Bị tác động → bị động.'),
    bi('Passive = be + past participle (V3). Put "be" in the tense of the sentence: is/are, was/were, will be, has been, is being, must be.', 'Bị động = be + quá khứ phân từ (V3). Chia "be" theo thì của câu: is/are, was/were, will be, has been, is being, must be.'),
  ],
  'en.grammar.relative': [
    bi('Look at the noun before the gap: a person → who, a thing → which/that, a place → where, possession → whose.', 'Nhìn danh từ đứng trước chỗ trống: người → who, vật → which/that, nơi chốn → where, sở hữu → whose.'),
    bi('Commas around the clause → extra information → never "that".', 'Mệnh đề nằm giữa dấu phẩy → thông tin thêm → không dùng "that".'),
  ],
  'en.grammar.conditionals': [
    bi('Find the verb in the other half of the sentence and match the type.', 'Tìm động từ ở vế còn lại của câu và ghép đúng loại câu điều kiện.'),
    bi('Type 1: If + present, will + V. Type 2: If + past, would + V. Type 3: If + had V3, would have V3.', 'Loại 1: If + hiện tại, will + V. Loại 2: If + quá khứ, would + V. Loại 3: If + had V3, would have V3.'),
  ],
  'en.grammar.modals': [
    bi('How sure is the speaker? must (sure yes) · might/could (maybe) · can\'t (sure no). Advice → should.', 'Người nói chắc chắn đến đâu? must (chắc chắn đúng) · might/could (có thể) · can\'t (chắc chắn không). Lời khuyên → should.'),
    bi('After a modal: the base verb, never to / -s / -ed.', 'Sau động từ khuyết thiếu: động từ nguyên mẫu, không có to / -s / -ed.'),
  ],
  'en.grammar.comparatives': [
    bi('"than" → comparative; "the … of/in" → superlative; "as … as" → plain adjective.', '"than" → so sánh hơn; "the … of/in" → so sánh nhất; "as … as" → tính từ nguyên dạng.'),
    bi('Short adjective → -er / -est. Long adjective → more / the most. Never both.', 'Tính từ ngắn → -er / -est. Tính từ dài → more / the most. Không dùng cả hai.'),
  ],
  'en.vocab.word-forms': [
    bi('Decide which word class the gap needs: after a/the/my → noun; after be/very/so → adjective; describing a verb → adverb (-ly).', 'Xác định chỗ trống cần loại từ gì: sau a/the/my → danh từ; sau be/very/so → tính từ; bổ nghĩa cho động từ → trạng từ (-ly).'),
    bi('Then use the suffix: -tion/-ment/-ness (noun), -ful/-ive/-ous/-able (adjective), -ly (adverb), -ise/-ify/-en (verb).', 'Sau đó dùng hậu tố: -tion/-ment/-ness (danh từ), -ful/-ive/-ous/-able (tính từ), -ly (trạng từ), -ise/-ify/-en (động từ).'),
  ],
  'en.vocab.collocations': [bi('Some words just go together — learn them as one chunk: make a decision, do homework, take a photo, heavy rain.', 'Một số từ luôn đi với nhau — học chúng như một cụm: make a decision, do homework, take a photo, heavy rain.')],
  'en.vocab.synonyms': [bi('Put each option into the sentence — which one keeps the same meaning? Watch for opposites hidden as distractors.', 'Thay từng đáp án vào câu — cái nào giữ nguyên nghĩa? Cẩn thận với các từ trái nghĩa được cài làm bẫy.')],
  'en.vocab.everyday': [bi('Picture the situation. Which word would you really use there?', 'Hình dung tình huống. Em sẽ thật sự dùng từ nào ở đó?')],
  'en.vocab.academic': [bi('Use the rest of the sentence as a clue to the meaning. Academic words often have a simpler synonym.', 'Dùng phần còn lại của câu làm manh mối. Từ học thuật thường có một từ đồng nghĩa đơn giản hơn.')],
  'en.exam.communication': [
    bi('Read what the first person says: thanks, a compliment, an invitation, a request, an apology?', 'Đọc câu của người thứ nhất: cảm ơn, khen, mời, nhờ vả hay xin lỗi?'),
    bi('Pick the natural, polite reply for THAT function: thanks → "You\'re welcome", compliment → "Thank you", invitation → "I\'d love to".', 'Chọn câu đáp tự nhiên, lịch sự cho đúng mục đích đó: cảm ơn → "You\'re welcome", khen → "Thank you", mời → "I\'d love to".'),
  ],
  'en.exam.signs': [bi('Where would you see this sign? What does it want you to do or not do? Pick the option with the same instruction, not just the same words.', 'Em thấy biển này ở đâu? Nó muốn em làm gì hoặc không làm gì? Chọn đáp án có cùng ý, không chỉ cùng từ.')],
  'en.exam.transformation': [
    bi('Name the pattern first: active ↔ passive, direct ↔ reported speech, too/enough, wish, conditional, "It takes…".', 'Gọi tên dạng biến đổi trước: chủ động ↔ bị động, trực tiếp ↔ gián tiếp, too/enough, wish, câu điều kiện, "It takes…".'),
    bi('The new sentence must mean exactly the same — check the tense and the negative.', 'Câu mới phải có nghĩa y hệt — kiểm tra thì và phủ định.'),
  ],
  'en.exam.combination': [bi('How are the two sentences linked: reason (because), contrast (although), result (so), condition (if), relative (who/which)?', 'Hai câu liên kết với nhau thế nào: lý do (because), tương phản (although), kết quả (so), điều kiện (if), quan hệ (who/which)?')],
  'en.exam.arrange': [bi('Find the first sentence (it introduces the topic, no "it/this/they" pointing back). Then follow the linking words: first, then, after that, finally.', 'Tìm câu đầu (câu giới thiệu chủ đề, không có "it/this/they" chỉ về trước). Rồi lần theo từ nối: first, then, after that, finally.')],
  'en.exam.cloze': [bi('Read the whole sentence around the gap. Is it grammar (a preposition, a linking word, a tense) or meaning (which word fits the topic)?', 'Đọc cả câu quanh chỗ trống. Đó là ngữ pháp (giới từ, từ nối, thì) hay nghĩa (từ nào hợp chủ đề)?')],
  'en.reading.detail': [bi('Underline the key words in the question, find them (or a synonym) in the text, and read that sentence carefully.', 'Gạch chân từ khóa trong câu hỏi, tìm chúng (hoặc từ đồng nghĩa) trong bài, rồi đọc kỹ câu đó.')],
  'en.reading.main-idea': [bi('Main idea = what the whole text is about. Look at the first and last sentences; ignore options that cover only one detail.', 'Ý chính = cả bài nói về điều gì. Xem câu đầu và câu cuối; loại đáp án chỉ nói về một chi tiết.')],
  'en.reading.inference': [bi('The answer isn\'t written directly. Which option MUST be true from what the text says?', 'Đáp án không được viết trực tiếp. Đáp án nào CHẮC CHẮN đúng dựa trên nội dung bài?')],
  'en.reading.paraphrase': [bi('The question uses different words for the same idea. Match meaning, not words.', 'Câu hỏi dùng từ khác để diễn đạt cùng ý. Hãy khớp nghĩa, không khớp từ.')],
  'en.reading.tfng': [
    bi('True: the text says the same. False: the text says the opposite. Not Given: the text doesn\'t say.', 'True: bài nói giống vậy. False: bài nói ngược lại. Not Given: bài không nhắc tới.'),
    bi('Don\'t use your own knowledge — only the text.', 'Không dùng hiểu biết của mình — chỉ dựa vào bài đọc.'),
  ],
  'en.ielts.reading': [bi('Headings: find each paragraph\'s main idea. True/False/Not Given: only the text counts. Completion: copy words from the text and keep to the word limit.', 'Chọn tiêu đề: tìm ý chính từng đoạn. True/False/Not Given: chỉ dựa vào bài. Điền từ: chép từ trong bài và không vượt quá số từ cho phép.')],
  'en.ielts.listening': [bi('Before listening, read the questions and guess the kind of answer (a number, a name, a date). Speakers often correct themselves — the last version is the answer.', 'Trước khi nghe, đọc câu hỏi và đoán loại đáp án (số, tên, ngày). Người nói hay tự sửa lại — thông tin cuối cùng mới là đáp án.')],
  'en.listening.numbers': [bi('Teens vs tens: thirTEEN has stress at the end, THIRty at the front. Listen for the stress.', 'Số -teen và -ty: thirTEEN nhấn ở cuối, THIRty nhấn ở đầu. Hãy nghe trọng âm.')],
  'en.listening.details': [bi('Listen for the specific detail the question asks about; ignore the rest.', 'Nghe đúng chi tiết câu hỏi yêu cầu; bỏ qua phần còn lại.')],
  'en.listening.main-idea': [bi('What is the speaker mostly talking about? Don\'t pick an option just because you heard one of its words.', 'Người nói chủ yếu nói về điều gì? Đừng chọn đáp án chỉ vì nghe thấy một từ trong đó.')],
};

const GENERIC_STRATEGY: Bi[] = [bi('Read the question carefully and rule out options that are clearly wrong. Then check the remaining ones one by one.', 'Đọc kỹ câu hỏi và loại các đáp án sai rõ ràng. Sau đó kiểm tra từng đáp án còn lại.')];

interface Clue {
  re: RegExp;
  tell: Bi;
}

/** Clue words in the question and what they tell you. */
const CLUES: Clue[] = [
  { re: /\b(yesterday|ago|last (night|week|weekend|month|year|summer)|in (19|20)\d\d|on (monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/i, tell: bi('a finished time in the past → past simple', 'thời gian đã kết thúc trong quá khứ → quá khứ đơn') },
  { re: /\b(already|yet|ever|since|so far|recently|lately|just)\b/i, tell: bi('connects the past to now → present perfect (have/has + V3)', 'nối quá khứ với hiện tại → hiện tại hoàn thành (have/has + V3)') },
  { re: /\bwhen (we|i|they|he|she) (arrived|came|got)\b/i, tell: bi('another past action → the one that happened before it → past perfect (had + V3)', 'một hành động quá khứ khác → hành động xảy ra trước nó → quá khứ hoàn thành (had + V3)') },
  { re: /\bby next \w+|\bby the end of next\b/i, tell: bi('"by + a future time" → future perfect (will have + V3)', '"by + thời điểm tương lai" → tương lai hoàn thành (will have + V3)') },
  { re: /\b(now|at the moment|right now|look!|listen!|currently)\b/i, tell: bi('happening now → present continuous (am/is/are + V-ing)', 'đang xảy ra → hiện tại tiếp diễn (am/is/are + V-ing)') },
  { re: /\b(every (day|week|morning|year)|usually|always|often|sometimes)\b/i, tell: bi('a habit → present simple', 'thói quen → hiện tại đơn') },
  { re: /\b(tomorrow|next (week|month|year)|tonight)\b/i, tell: bi('the future → will / be going to', 'tương lai → will / be going to') },
  { re: /\bif\b[^,]*\bhad\b/i, tell: bi('"If + had V3" → type 3 → would have + V3', '"If + had V3" → loại 3 → would have + V3') },
  { re: /\bwould have\b/i, tell: bi('"would have" → type 3 → If + had + V3', '"would have" → loại 3 → If + had + V3') },
  { re: /\bif (i|you|he|she|we|they|it|\w+) (were|knew|had|lived|was)\b/i, tell: bi('"If + past" → type 2 (not true now) → would + V', '"If + quá khứ" → loại 2 (không có thật ở hiện tại) → would + V') },
  { re: /\bwould (?!have)\w+/i, tell: bi('"would + V" → type 2 → If + past simple', '"would + V" → loại 2 → If + quá khứ đơn') },
  { re: /\bwill\b/i, tell: bi('"will" in the result → type 1 → If + present simple', '"will" ở mệnh đề kết quả → loại 1 → If + hiện tại đơn') },
  { re: /\bthan\b/i, tell: bi('"than" → comparative (-er / more)', '"than" → so sánh hơn (-er / more)') },
  { re: /\bthe ___\b.*\b(in|of)\b/i, tell: bi('"the … in/of" → superlative (-est / the most)', '"the … in/of" → so sánh nhất (-est / the most)') },
  { re: /\bas ___ as\b/i, tell: bi('"as … as" → the plain adjective', '"as … as" → tính từ nguyên dạng') },
  { re: /\b(a|an|the|my|your|his|her|our|their)\s+___/i, tell: bi('after a/the/my… → a noun', 'sau a/the/my… → danh từ') },
  { re: /\b(very|so|too|quite|really)\s+___/i, tell: bi('after very/so/too → an adjective (or adverb)', 'sau very/so/too → tính từ (hoặc trạng từ)') },
  { re: /\b(must|can't|might|could|should)\s+___/i, tell: bi('after a modal → base verb', 'sau động từ khuyết thiếu → động từ nguyên mẫu') },
  { re: /\b(by (the|a|my|our|their|his|her) \w+)\b/i, tell: bi('"by + someone" → who did it → passive', '"by + ai đó" → ai làm → bị động') },
];

/** Names of verb forms in options, for "why not this one?". */
const FORMS: [RegExp, Bi][] = [
  [/^will have \w+$/, bi('future perfect', 'tương lai hoàn thành')],
  [/^had (already )?(been )?\w+$/, bi('past perfect', 'quá khứ hoàn thành')],
  [/^(have|has|haven't|hasn't) (already )?\w+$/, bi('present perfect', 'hiện tại hoàn thành')],
  [/^will \w+$/, bi('future simple', 'tương lai đơn')],
  [/^would have \w+$/, bi('"would have" (type 3)', '"would have" (loại 3)')],
  [/^would \w+$/, bi('"would + V" (type 2)', '"would + V" (loại 2)')],
  [/^(am|is|are) \w+ing$/, bi('present continuous', 'hiện tại tiếp diễn')],
  [/^(was|were) \w+ing$/, bi('past continuous', 'quá khứ tiếp diễn')],
  [/^\w+ing$/, bi('-ing form', 'dạng V-ing')],
];
const formOf = (s: string) => FORMS.find(([re]) => re.test(s.trim()))?.[1];

function generic(q: Question, r: () => number): CoachPlan {
  void r;
  const right = q.options[q.answer];
  const strategy = STRATEGIES[q.conceptId] ?? (q.conceptId.startsWith('en.ielts.lex') ? STRATEGIES['en.vocab.collocations'] : GENERIC_STRATEGY);
  const text = `${q.prompt} ${q.passage && q.passage.length < 200 ? q.passage : ''}`;
  const clues = CLUES.map((c) => ({ c, m: text.match(c.re) })).filter((x) => x.m && x.m[0]);
  const grammar = q.conceptId.startsWith('en.grammar') || q.conceptId.startsWith('en.vocab.word-forms');
  const usable = grammar ? clues.slice(0, 2) : [];
  const steps: CoachStep[] = [];
  if (usable.length)
    steps.push({
      title: bi('1. Find the clue', '1. Tìm dấu hiệu'),
      chips: usable.map(({ c, m }) => ({ kind: 'word', text: `“${m![0]}”`, speak: m![0], note: c.tell })),
    });
  steps.push({ title: bi(`${steps.length + 1}. How to solve it`, `${steps.length + 1}. Cách làm`), body: strategy[0] });
  for (const s of strategy.slice(1)) steps.push({ title: bi('…and', '…và'), body: s });
  const vi = translateExplanation(q.explanation ?? '') ?? q.explanation ?? '';
  steps.push({
    title: bi(`${steps.length + 1}. The answer`, `${steps.length + 1}. Đáp án`),
    body: bi(`"${right}". ${q.explanation ?? ''}`.trim(), `"${right}". ${vi}`.trim()),
  });
  return {
    hint: usable.length ? bi(`Look at “${usable[0].m![0]}” — ${usable[0].c.tell.en}.`, `Nhìn “${usable[0].m![0]}” — ${usable[0].c.tell.vi}.`) : strategy[0],
    steps,
    drill: [],
  };
}

/** "Why not the answer you picked?" — only when we can say something true. */
export function whyNot(q: Question, picked: string): Bi | null {
  const right = q.options[q.answer];
  if (!picked || picked === right) return null;
  const pf = formOf(picked);
  const rf = formOf(right);
  if (pf && rf && pf.en !== rf.en) return bi(`"${picked}" is the ${pf.en}, but this sentence needs the ${rf.en}.`, `"${picked}" là thì/dạng ${pf.vi}, nhưng câu này cần ${rf.vi}.`);
  if (q.conceptId === 'en.grammar.comparatives' && /^(more|most) \w+(er|est)$/.test(picked))
    return bi(`"${picked}" uses both "more/most" and -er/-est — never use both.`, `"${picked}" dùng cả "more/most" lẫn -er/-est — không bao giờ dùng cả hai.`);
  if (q.conceptId === 'en.grammar.relative' && picked === 'that' && /,/.test(q.prompt))
    return bi('"that" can\'t follow a comma (extra information).', '"that" không đứng sau dấu phẩy (mệnh đề bổ sung thông tin).');
  return null;
}

/** A step-by-step plan for any question. */
export function coach(q: Question, r: () => number = Math.random): CoachPlan {
  switch (q.conceptId) {
    case 'en.pron.stress':
      return coachStress(q, r);
    case 'en.pron.endings':
      return coachEndings(q, r) ?? generic(q, r);
    case 'en.pron.sounds':
      return coachEndings(q, r) ?? coachSounds(q, r) ?? generic(q, r);
    case 'en.pron.pairs':
      return coachPairs(q, r) ?? generic(q, r);
    default:
      return generic(q, r);
  }
}
