/**
 * Pronunciation (Ngữ âm) — the two classic Vietnamese exam question types plus listening practice:
 *  1. "Choose the word whose underlined part is pronounced differently from the others."
 *  2. "Choose the word whose main stress is placed differently from the others."
 *
 * Underlined parts are marked with square brackets: `sch[oo]l`. The UI renders them underlined.
 * Only common words with an uncontroversial British/American pronunciation are used.
 */
import type { ConceptSeed } from '../helpers';
import type { Generated, Generator } from '../math/generators';

export const pronunciationConcepts: ConceptSeed[] = [
  {
    id: 'en.pron.stress',
    domain: 'Pronunciation',
    skill: 'Word stress',
    name: 'Word stress',
    missionName: 'Thunder Drums',
    description: 'Which syllable is stressed: HAP-py, be-GIN, im-POR-tant, ed-u-CA-tion.',
    cefr: 'A2',
    lesson:
      'Most two-syllable nouns and adjectives are stressed on the 1st syllable (HAP-py, TA-ble); most two-syllable verbs on the 2nd (be-GIN, de-CIDE). Words ending in -tion, -sion, -ic: stress the syllable just before the ending (in-for-MA-tion). Endings -ee, -eer, -oo take the stress themselves (vol-un-TEER). -ity, -logy, -graphy: stress the 3rd syllable from the end (a-BIL-i-ty).',
    examRefs: ['Vietnamese exams: "main stress placed differently"', 'IELTS Speaking: pronunciation'],
  },
  {
    id: 'en.pron.endings',
    domain: 'Pronunciation',
    skill: 'Endings',
    name: '-ed and -s endings',
    missionName: 'Echo Endings',
    description: '-ed: /t/ /d/ /ɪd/ · -s/-es: /s/ /z/ /ɪz/.',
    cefr: 'A2',
    lesson:
      '-ed is /ɪd/ after t or d (want-ed), /t/ after voiceless sounds p, k, f, s, sh, ch, x (watch-ed), and /d/ after everything else (play-ed). -s/-es is /ɪz/ after s, z, sh, ch, ge, x (watch-es), /s/ after p, t, k, f, th (book-s), and /z/ after everything else (dog-s).',
    examRefs: ['Vietnamese exams: "underlined part pronounced differently"'],
  },
  {
    id: 'en.pron.sounds',
    domain: 'Pronunciation',
    skill: 'Sounds & spelling',
    name: 'Letters and their sounds',
    missionName: 'Whispering Bells',
    description: 'The same letters can sound different: sch[oo]l vs b[oo]k, [ch]urch vs [ch]emistry.',
    cefr: 'B1',
    prerequisites: ['en.pron.endings'],
    lesson:
      'English spelling and sound don\'t always match. Learn the common patterns: ch = /tʃ/ (church) but /k/ in science words (chemistry, school); ea = /iː/ (meat) but /e/ in bread, head, heavy; oo = /uː/ (food) but /ʊ/ in book, look, good; th = /θ/ (think) or /ð/ (this). Say the words aloud — your ears help.',
    examRefs: ['Vietnamese exams: "underlined part pronounced differently"'],
  },
  {
    id: 'en.pron.pairs',
    domain: 'Pronunciation',
    skill: 'Listening for sounds',
    name: 'Sound twins (minimal pairs)',
    missionName: 'Twin Bells',
    description: 'Hearing the difference: ship/sheep, bike/bite, think/sink, fan/van.',
    cefr: 'A2',
    lesson:
      'Pairs like ship/sheep differ by one sound. Long /iː/ is longer and smiling; short /ɪ/ is short and relaxed. Final consonants matter in English: bike ≠ bite ≠ bye. /θ/ (think): tongue between the teeth.',
    examRefs: ['IELTS Listening & Speaking'],
  },
];

// ── Word stress ─────────────────────────────────────────────────
/** Syllables separated by "-", the stressed one in CAPITALS. */
const STRESS_WORDS = `
HAP-py TA-ble GAR-den STU-dent TEACH-er MOUN-tain RIV-er PIC-ture AN-swer OF-fice VIL-lage PEN-cil COUN-try DOC-tor PA-per WA-ter YEL-low WIN-dow MORN-ing QUES-tion PER-son O-cean HEAV-y BUS-y CLEV-er MOD-ern FA-mous CARE-ful TRAV-el VIS-it LIS-ten O-pen HAP-pen FIN-ish STUD-y PROM-ise
be-GIN a-GREE re-PEAT ex-PLAIN de-CIDE in-VITE re-CEIVE en-JOY pre-FER re-LAX for-GET ar-RIVE de-PEND sup-PORT com-PLETE pro-TECT pre-PARE a-VOID de-SCRIBE col-LECT at-TEND de-STROY im-PROVE con-TROL po-LITE a-LONE a-SLEEP a-BROAD ho-TEL ma-CHINE mis-TAKE ad-VICE be-LIEVE de-SIGN suc-CESS
BEAU-ti-ful EN-er-gy AN-i-mal HOL-i-day IN-ter-view POS-si-ble DIF-fi-cult GOV-ern-ment YES-ter-day POP-u-lar FES-ti-val DAN-ger-ous WON-der-ful HOS-pi-tal CHAR-ac-ter CIN-e-ma EX-er-cise CUS-tom-er EX-cel-lent PAR-a-graph TEL-e-phone PRES-i-dent AC-ci-dent
im-POR-tant de-CI-sion com-PU-ter to-MOR-row ba-NA-na po-TA-to ex-PEN-sive re-MEM-ber ex-AM-ple de-VEL-op ad-VEN-ture en-JOY-ment ho-RI-zon at-TEN-tion col-LEC-tion di-REC-tion in-VEN-tion pol-LU-tion fan-TAS-tic de-LI-cious ro-MAN-tic con-TIN-ue re-AC-tion mu-SI-cian
en-ter-TAIN un-der-STAND rec-om-MEND in-tro-DUCE vol-un-TEER en-gi-NEER guar-an-TEE kan-ga-ROO ref-er-EE af-ter-NOON dis-ap-PEAR in-ter-RUPT con-tra-DICT un-em-PLOYED
e-CON-o-my ex-PE-ri-ence pho-TOG-ra-phy ge-OG-ra-phy bi-OL-o-gy a-BIL-i-ty ac-TIV-i-ty com-MU-ni-ty tech-NOL-o-gy ne-CES-si-ty cer-TIF-i-cate pho-TOG-ra-pher in-TEL-li-gent
ed-u-CA-tion in-for-MA-tion con-ver-SA-tion pop-u-LA-tion com-pe-TI-tion sit-u-A-tion cel-e-BRA-tion dec-o-RA-tion in-de-PEN-dent en-ter-TAIN-ment un-der-STAND-ing ex-pla-NA-tion
TEL-e-vi-sion CAT-e-go-ry AL-li-ga-tor CAL-cu-la-tor EL-e-va-tor
`;

export interface StressWord {
  word: string;
  syllables: string[];
  /** 0-based index of the stressed syllable. */
  stress: number;
  /** e.g. "be-GIN" */
  display: string;
}

export const STRESS: StressWord[] = STRESS_WORDS.trim()
  .split(/\s+/)
  .map((display) => {
    const syllables = display.split('-');
    return { display, syllables, stress: syllables.findIndex((s) => s === s.toUpperCase()), word: syllables.join('').toLowerCase() };
  });

const ORDINAL = ['1st', '2nd', '3rd', '4th'];

const pick = <T>(r: () => number, a: readonly T[]): T => a[Math.floor(r() * a.length)];
function sample<T>(r: () => number, a: readonly T[], n: number): T[] {
  const pool = [...a];
  const out: T[] = [];
  while (out.length < n && pool.length) out.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
  return out;
}

const stressGen: Generator = (d, r) => {
  const syllables = d <= 2 ? 2 : d <= 4 ? 3 : 4;
  const words = STRESS.filter((w) => w.syllables.length === syllables);
  const positions = [...new Set(words.map((w) => w.stress))];
  // Majority position needs ≥3 words, the odd one out a different position.
  const majority = pick(r, positions.filter((p) => words.filter((w) => w.stress === p).length >= 3));
  const odd = pick(r, words.filter((w) => w.stress !== majority));
  const same = sample(r, words.filter((w) => w.stress === majority), 3);
  return {
    prompt: 'Choose the word whose main stress is placed differently from the others.',
    answer: odd.word,
    distractors: same.map((w) => w.word),
    explanation: `${odd.display} has stress on the ${ORDINAL[odd.stress]} syllable; ${same.map((w) => w.display).join(', ')} on the ${ORDINAL[majority]}.`,
  };
};

// ── -ed / -s endings ────────────────────────────────────────────
/** Verbs by the sound of their -ed ending; the ending is marked for underlining. */
export const ED: Record<'/t/' | '/d/' | '/ɪd/', string[]> = {
  '/t/': ['watched', 'washed', 'stopped', 'looked', 'laughed', 'kissed', 'helped', 'worked', 'finished', 'danced', 'fixed', 'cooked', 'hoped', 'walked', 'missed', 'touched', 'brushed', 'relaxed', 'developed', 'increased', 'introduced', 'produced', 'practised', 'talked', 'jumped', 'picked', 'passed', 'crossed', 'dropped', 'shopped'],
  '/ɪd/': ['wanted', 'needed', 'decided', 'visited', 'started', 'waited', 'invited', 'ended', 'collected', 'protected', 'painted', 'added', 'rented', 'landed', 'created', 'attended', 'repeated', 'recorded', 'completed', 'counted'],
  '/d/': ['played', 'cleaned', 'opened', 'lived', 'loved', 'called', 'cried', 'studied', 'arrived', 'listened', 'enjoyed', 'stayed', 'travelled', 'changed', 'closed', 'believed', 'tried', 'filled', 'planned', 'returned', 'explained', 'answered', 'moved', 'smiled', 'rained'],
};

/** Words by the sound of their -s / -es ending. */
export const S: Record<'/s/' | '/z/' | '/ɪz/', string[]> = {
  '/s/': ['stops', 'books', 'cats', 'laughs', 'maps', 'cooks', 'students', 'months', 'parks', 'desks', 'coughs', 'helps', 'likes', 'writes', 'hopes', 'shops', 'lamps', 'cakes', 'walks', 'units'],
  '/z/': ['dogs', 'plays', 'pens', 'bags', 'rooms', 'trees', 'apples', 'birds', 'cars', 'songs', 'leaves', 'swims', 'friends', 'phones', 'rains', 'sees', 'girls', 'boys', 'tables', 'calls'],
  '/ɪz/': ['watches', 'washes', 'boxes', 'buses', 'roses', 'changes', 'classes', 'pages', 'houses', 'fixes', 'brushes', 'oranges', 'languages', 'kisses', 'dances', 'places', 'quizzes', 'glasses', 'matches', 'bridges'],
};

/** Mark the ending for underlining: "watch[ed]", "watch[es]" (/ɪz/), "book[s]", "table[s]". */
const markEd = (w: string) => w.replace(/ed$/, '[ed]');
const markS = (w: string, sound: string) => (sound === '/ɪz/' ? w.replace(/es$/, '[es]') : w.replace(/s$/, '[s]'));

function oddOneOut<K extends string>(groups: Record<K, string[]>, r: () => number, mark: (w: string, sound: K) => string, label: string): Generated {
  const keys = Object.keys(groups) as K[];
  const a = pick(r, keys);
  const b = pick(r, keys.filter((k) => k !== a));
  const same = sample(r, groups[a], 3);
  const odd = pick(r, groups[b]);
  return {
    prompt: 'Choose the word whose underlined part is pronounced differently from the others.',
    answer: mark(odd, b),
    distractors: same.map((w) => mark(w, a)),
    explanation: `${label}: ${same.join(', ')} → ${a}; ${odd} → ${b}.`,
  };
}

const endingsGen: Generator = (d, r) => {
  const ed = d <= 2 ? true : d >= 4 ? r() < 0.4 : r() < 0.5;
  return ed ? oddOneOut(ED, r, markEd, '-ed') : oddOneOut(S, r, markS, '-s/-es');
};

// ── Letters and their sounds ────────────────────────────────────
/** Each group: letters → sound → words with the letters marked. */
interface SoundGroup {
  letters: string;
  level: number;
  sounds: Record<string, string[]>;
}

export const SOUND_GROUPS: SoundGroup[] = [
  { letters: 'a', level: 1, sounds: { '/æ/': ['c[a]t', 'h[a]t', 'b[a]g', 'm[a]p', 'h[a]ppy', 'l[a]mp'], '/eɪ/': ['n[a]me', 'l[a]ke', 't[a]ble', 'm[a]ke', 'p[a]per', 'pl[a]ce', 'st[a]tion'], '/ɑː/': ['f[a]ther', 'c[a]r', 'f[a]rm', 'p[a]rk', 'st[a]r'] } },
  { letters: 'i', level: 1, sounds: { '/ɪ/': ['s[i]t', 'b[i]g', 'sw[i]m', 'w[i]n', 'ch[i]cken', 'l[i]sten', 'g[i]ft'], '/aɪ/': ['k[i]te', 't[i]me', 'l[i]ke', 'n[i]ce', 'f[i]ve', 'wr[i]te', 'cl[i]mb'] } },
  { letters: 'o', level: 2, sounds: { '/ɒ/': ['h[o]t', 'd[o]g', 'st[o]p', 'sh[o]p', 'd[o]ctor', 'l[o]ng', 'b[o]x'], '/əʊ/': ['g[o]', 'h[o]me', 'n[o]se', 'ph[o]ne', 'cl[o]se', 'h[o]tel'], '/ʌ/': ['c[o]me', 'l[o]ve', 's[o]n', 'm[o]ney', 'm[o]ther', 'M[o]nday'] } },
  { letters: 'u', level: 2, sounds: { '/ʌ/': ['c[u]t', 's[u]n', 'b[u]s', 'h[u]ngry', 'r[u]n', 'f[u]n', 'm[u]ch'], '/ʊ/': ['p[u]t', 'p[u]sh', 'b[u]sh', 'f[u]ll', 'p[u]ll'], '/juː/': ['m[u]sic', 'st[u]dent', '[u]se', 'c[u]te', 'h[u]ge'] } },
  { letters: 'oo', level: 2, sounds: { '/uː/': ['f[oo]d', 'm[oo]n', 'r[oo]m', 't[oo]th', 's[oo]n', 'p[oo]l', 'sch[oo]l'], '/ʊ/': ['b[oo]k', 'l[oo]k', 'c[oo]k', 'g[oo]d', 'f[oo]t', 'w[oo]d', 'st[oo]d'], '/ʌ/': ['bl[oo]d', 'fl[oo]d'] } },
  { letters: 'ea', level: 3, sounds: { '/iː/': ['m[ea]t', 't[ea]ch', 's[ea]t', 'b[ea]ch', 'r[ea]son', 'l[ea]ve', 'cl[ea]n'], '/e/': ['br[ea]d', 'h[ea]d', 'h[ea]vy', 'w[ea]ther', 'br[ea]kfast', 'r[ea]dy', 'h[ea]lth'], '/eɪ/': ['br[ea]k', 'gr[ea]t', 'st[ea]k'] } },
  { letters: 'ch', level: 3, sounds: { '/tʃ/': ['[ch]urch', '[ch]eap', 'tea[ch]er', '[ch]ildren', '[ch]oose', 'lun[ch]', '[ch]ange'], '/k/': ['[ch]emistry', 's[ch]ool', '[ch]aracter', '[ch]orus', 'te[ch]nology', 'stoma[ch]'], '/ʃ/': ['ma[ch]ine', '[ch]ef', 'bro[ch]ure'] } },
  { letters: 'th', level: 3, sounds: { '/θ/': ['[th]ink', '[th]ree', 'ba[th]', 'mon[th]', '[th]ank', 'heal[th]', '[th]in'], '/ð/': ['[th]is', '[th]ey', 'mo[th]er', 'fa[th]er', '[th]ough', 'bro[th]er', 'toge[th]er'] } },
  { letters: 'c', level: 3, sounds: { '/s/': ['[c]ity', '[c]entre', 'ri[c]e', 'pla[c]e', '[c]ircle', 'ni[c]e'], '/k/': ['[c]at', '[c]ome', 'musi[c]', '[c]lass', '[c]oconut', '[c]amera'] } },
  { letters: 'g', level: 4, sounds: { '/dʒ/': ['[g]ym', 'pa[g]e', '[g]eography', 'oran[g]e', 'a[g]e', 'ener[g]y'], '/g/': ['[g]o', '[g]ame', 'bi[g]', '[g]ift', '[g]et', '[g]irl'] } },
  { letters: 'h', level: 4, sounds: { 'silent': ['[h]our', '[h]onest', '[h]onour', '[h]eir'], '/h/': ['[h]ouse', '[h]appy', '[h]ome', '[h]ello', 'be[h]ind', '[h]ospital'] } },
  { letters: 'gh', level: 5, sounds: { '/f/': ['lau[gh]', 'cou[gh]', 'enou[gh]', 'rou[gh]', 'tou[gh]'], 'silent': ['ni[gh]t', 'li[gh]t', 'ei[gh]t', 'dau[gh]ter', 'hi[gh]', 'thou[gh]t'] } },
  { letters: 's', level: 5, sounds: { '/ʒ/': ['plea[s]ure', 'mea[s]ure', 'u[s]ually', 'deci[s]ion', 'televi[s]ion'], '/s/': ['[s]it', '[s]ee', 'bu[s]', '[s]ummer', '[s]ister'], '/z/': ['ri[s]e', 'mu[s]ic', 'choo[s]e', 'ea[s]y', 'vi[s]it'], '/ʃ/': ['[s]ugar', '[s]ure'] } },
];

const plain = (marked: string) => marked.replace(/[[\]]/g, '');

const soundsGen: Generator = (d, r) => {
  const pool = SOUND_GROUPS.filter((g) => Math.abs(g.level - d) <= 1);
  const g = pick(r, pool.length ? pool : SOUND_GROUPS);
  const keys = Object.keys(g.sounds).filter((k) => g.sounds[k].length >= 3);
  const a = pick(r, keys);
  const b = pick(r, Object.keys(g.sounds).filter((k) => k !== a));
  const same = sample(r, g.sounds[a], 3);
  const odd = pick(r, g.sounds[b]);
  const name = (k: string) => (k === 'silent' ? 'silent (not pronounced)' : k);
  return {
    prompt: 'Choose the word whose underlined part is pronounced differently from the others.',
    answer: odd,
    distractors: same,
    explanation: `"${g.letters}": ${same.map(plain).join(', ')} → ${name(a)}; ${plain(odd)} → ${name(b)}.`,
  };
};

// ── Sound twins (listening) ─────────────────────────────────────
/** [word A, word B, what differs] */
export const PAIRS: [string, string, string][] = [
  ['ship', 'sheep', '/ɪ/ short vs /iː/ long'],
  ['live', 'leave', '/ɪ/ short vs /iː/ long'],
  ['sit', 'seat', '/ɪ/ short vs /iː/ long'],
  ['fill', 'feel', '/ɪ/ short vs /iː/ long'],
  ['full', 'fool', '/ʊ/ short vs /uː/ long'],
  ['pull', 'pool', '/ʊ/ short vs /uː/ long'],
  ['bad', 'bed', '/æ/ vs /e/'],
  ['man', 'men', '/æ/ vs /e/'],
  ['cap', 'cup', '/æ/ vs /ʌ/'],
  ['cat', 'cut', '/æ/ vs /ʌ/'],
  ['hat', 'hut', '/æ/ vs /ʌ/'],
  ['fan', 'van', '/f/ vs /v/'],
  ['think', 'sink', '/θ/ vs /s/'],
  ['three', 'tree', '/θ/ vs /t/'],
  ['thin', 'tin', '/θ/ vs /t/'],
  ['rice', 'rise', '/s/ vs /z/ at the end'],
  ['price', 'prize', '/s/ vs /z/ at the end'],
  ['light', 'right', '/l/ vs /r/'],
  ['glass', 'grass', '/l/ vs /r/'],
  ['walk', 'work', '/ɔː/ vs /ɜː/'],
  ['sheep', 'cheap', '/ʃ/ vs /tʃ/'],
  ['ship', 'chip', '/ʃ/ vs /tʃ/'],
  ['bike', 'bite', 'final /k/ vs final /t/'],
  ['cut', 'cup', 'final /t/ vs final /p/'],
  ['white', 'wide', 'final /t/ vs final /d/'],
  ['back', 'bag', 'final /k/ vs final /g/'],
  ['sad', 'sat', 'final /d/ vs final /t/'],
  ['rope', 'robe', 'final /p/ vs final /b/'],
];

const pairsGen: Generator = (d, r) => {
  const [a, b, why] = pick(r, PAIRS);
  const target = r() < 0.5 ? a : b;
  const other = target === a ? b : a;
  // Harder levels add a third option from another pair.
  const extra = d >= 3 ? pick(r, PAIRS.filter((p) => !p.includes(a) && !p.includes(b)))[0] : null;
  return {
    prompt: 'Listen. Which word do you hear?',
    audio: `The word is: ${target}. ${target}.`,
    answer: target,
    distractors: extra ? [other, extra] : [other],
    explanation: `You heard "${target}", not "${other}": ${why}.`,
  };
};

export const pronunciationGenerators: Record<string, Generator> = {
  'en.pron.stress': stressGen,
  'en.pron.endings': endingsGen,
  'en.pron.sounds': soundsGen,
  'en.pron.pairs': pairsGen,
};

/** For the review screen: a word's stress pattern, if known ("be-GIN"). */
export const stressOf = (word: string): string | undefined => STRESS.find((w) => w.word === plain(word).toLowerCase())?.display;
export { plain as unmark };
