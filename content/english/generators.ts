import type { Generated, Generator } from '../math/generators';
import { ACADEMIC, COLLOCATIONS, EVERYDAY, FAMILIES, SYNONYMS, type MeaningEntry, type Pos } from './lexicon';

const pick = <T>(r: () => number, a: readonly T[]): T => a[Math.floor(r() * a.length)];
const int = (r: () => number, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));

function sample<T>(r: () => number, a: readonly T[], n: number, not: (x: T) => boolean = () => false): T[] {
  const pool = a.filter((x) => !not(x));
  const out: T[] = [];
  while (out.length < n && pool.length) out.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
  return out;
}

/** Entries near the requested difficulty (widens until there is enough to choose from). */
function near<T>(list: readonly T[], level: (x: T) => number, d: number): T[] {
  for (let w = 0; w <= 4; w++) {
    const hit = list.filter((x) => Math.abs(level(x) - d) <= w);
    if (hit.length >= 4) return hit;
  }
  return [...list];
}

// ── Vocabulary ────────────────────────────────────────────────
function meaningQuestion(list: MeaningEntry[], d: number, r: () => number): Generated {
  const e = pick(r, near(list, (x) => x[3], d));
  const [word, pos, meaning] = e;
  const others = sample(r, list, 3, (x) => x === e || x[1] !== pos);
  const fill = others.length < 3 ? sample(r, list, 3 - others.length, (x) => x === e || others.includes(x)) : [];
  const wrong = [...others, ...fill];
  if (r() < 0.5) return { prompt: `Which word means "${meaning}"?`, answer: word, distractors: wrong.map((x) => x[0]) };
  return { prompt: `What does "${word}" mean?`, answer: meaning, distractors: wrong.map((x) => x[2]) };
}

const synonymGen: Generator = (d, r) => {
  const e = pick(r, near(SYNONYMS, (x) => x[3], d));
  const [word, syn, opp] = e;
  const others = sample(r, SYNONYMS, 3, (x) => x === e);
  if (opp && r() < 0.35) {
    const wrongs = [syn, ...others.map((x) => x[2] ?? x[1])].slice(0, 3);
    return { prompt: `Choose the OPPOSITE of "${word}".`, answer: opp, distractors: wrongs };
  }
  return {
    prompt: `Choose the word closest in meaning to "${word}".`,
    answer: syn,
    distractors: [...(opp ? [opp] : []), ...others.map((x) => x[1])].slice(0, 3),
    explanation: `"${word}" ≈ "${syn}". IELTS often paraphrases like this.`,
  };
};

const collocationGen: Generator = (d, r) => {
  const [sentence, answer, wrongs] = pick(r, near(COLLOCATIONS, (x) => x[3], d));
  return { prompt: `Complete: ${sentence}`, answer, distractors: [...wrongs], explanation: `We say "${sentence.replace('___', answer)}"` };
};

const POS_NAME: Record<Pos, string> = { n: 'noun', v: 'verb', adj: 'adjective', adv: 'adverb' };

const wordFormGen: Generator = (d, r) => {
  const fam = pick(r, near(FAMILIES, (x) => x[4], d));
  const [noun, verb, adj, adv, , sentences] = fam;
  const [sentence, pos] = pick(r, sentences);
  const forms: Record<Pos, string | null> = { n: noun, v: verb, adj, adv };
  const answer = forms[pos]!;
  // Show the simplest member of the family as the headword (quick, not quickness).
  const root = [noun, verb, adj].filter((x): x is string => !!x).sort((x, y) => x.length - y.length)[0];
  return {
    prompt: `Complete with the right form of "${root}": ${sentence}`,
    answer,
    distractors: [noun, verb, adj, adv].filter((x): x is string => !!x && x !== answer),
    explanation: `The gap needs a ${POS_NAME[pos]}.`,
  };
};

// ── Grammar: tenses ───────────────────────────────────────────
/** [base, past, past participle, -ing, object] */
const VERBS: [string, string, string, string, string][] = [
  ['visit', 'visited', 'visited', 'visiting', 'Hue'],
  ['eat', 'ate', 'eaten', 'eating', 'durian'],
  ['see', 'saw', 'seen', 'seeing', 'that film'],
  ['write', 'wrote', 'written', 'writing', 'a letter to Grandma'],
  ['read', 'read', 'read', 'reading', 'this book'],
  ['buy', 'bought', 'bought', 'buying', 'a new bike'],
  ['meet', 'met', 'met', 'meeting', 'our new neighbours'],
  ['take', 'took', 'taken', 'taking', 'the bus to school'],
  ['finish', 'finished', 'finished', 'finishing', 'the science project'],
  ['clean', 'cleaned', 'cleaned', 'cleaning', 'the kitchen'],
  ['watch', 'watched', 'watched', 'watching', 'the football final'],
  ['make', 'made', 'made', 'making', 'a birthday cake'],
  ['learn', 'learned', 'learned', 'learning', 'a new song'],
  ['build', 'built', 'built', 'building', 'a robot'],
  ['play', 'played', 'played', 'playing', 'chess online'],
  ['do', 'did', 'done', 'doing', 'the washing-up'],
  ['ride', 'rode', 'ridden', 'riding', 'a horse'],
  ['swim', 'swam', 'swum', 'swimming', 'in the sea'],
];
/** [subject, has/have, is third person singular] */
const SUBJECTS: [string, string, boolean][] = [
  ['I', 'have', false],
  ['We', 'have', false],
  ['They', 'have', false],
  ['You', 'have', false],
  ['My sister', 'has', true],
  ['Minh', 'has', true],
  ['Our teacher', 'has', true],
];
const PAST_TIMES = ['yesterday', 'last weekend', 'two days ago', 'in 2023', 'last night', 'on Monday'];
const third = (base: string) => (/(ch|sh|s|x|o)$/.test(base) ? base + 'es' : base.endsWith('y') && !/[aeiou]y$/.test(base) ? base.slice(0, -1) + 'ies' : base + 's');

const tensesGen: Generator = (d, r) => {
  const [base, past, pp, ing, obj] = pick(r, VERBS);
  const [subj, have, s3] = pick(r, SUBJECTS);
  const hasnt = have === 'has' ? "hasn't" : "haven't";
  const wrongHave = have === 'has' ? 'have' : 'has';
  const present = s3 ? third(base) : base;
  if (d <= 1) {
    const t = pick(r, PAST_TIMES);
    return {
      prompt: `${subj} ___ ${obj} ${t}.`,
      answer: past,
      distractors: [`${have} ${pp}`, present, `will ${base}`],
      explanation: `"${t}" is a finished time → past simple.`,
    };
  }
  if (d === 2) {
    if (r() < 0.5)
      return { prompt: `Have you ever ___ ${obj}?`, answer: pp, distractors: [past !== pp ? past : `to ${base}`, base, ing], explanation: 'Have/has + past participle (present perfect) for life experience.' };
    return { prompt: `${subj} ${have} already ___ ${obj}.`, answer: pp, distractors: [past !== pp ? past : ing, base, present !== base ? present : `to ${base}`], explanation: 'already + present perfect: have/has + past participle.' };
  }
  if (d === 3)
    return {
      prompt: `${subj} ___ ${obj} yet.`,
      answer: `${hasnt} ${pp}`,
      distractors: [`${wrongHave === 'has' ? "hasn't" : "haven't"} ${pp}`, `don't ${past}`, `not ${pp}`],
      explanation: `"yet" in negatives → present perfect: ${hasnt} + past participle. ${s3 ? 'Singular subject → hasn\'t.' : ''}`,
    };
  const mid = subj === 'I' || subj === 'Minh' ? subj : subj.charAt(0).toLowerCase() + subj.slice(1);
  if (d === 4)
    return {
      prompt: `When we arrived, ${mid} ___ ${obj}.`,
      answer: `had already ${pp}`,
      distractors: [`${have} already ${pp}`, `already ${base}`, `had already ${past === pp ? base : past}`],
      explanation: 'An action finished before another past action → past perfect (had + past participle).',
    };
  return {
    prompt: `By next summer, ${mid} ___ ${obj}.`,
    answer: `will have ${pp}`,
    distractors: [`will ${pp}`, `${have} ${pp}`, `will have ${past === pp ? base : past}`],
    explanation: '"By + future time" → future perfect: will have + past participle.',
  };
};

// ── Grammar: passive ──────────────────────────────────────────
type PTense = 'present' | 'past' | 'future' | 'perfect' | 'continuous' | 'modal';
/** [subject, plural, base, past, pp, -ing, rest, tense, difficulty] */
const PASSIVES: [string, boolean, string, string, string, string, string, PTense, number][] = [
  ['English', false, 'speak', 'spoke', 'spoken', 'speaking', 'in many countries', 'present', 1],
  ['Rice', false, 'grow', 'grew', 'grown', 'growing', 'in the Mekong Delta', 'present', 1],
  ['The letters', true, 'deliver', 'delivered', 'delivered', 'delivering', 'every morning', 'present', 1],
  ['Coffee', false, 'produce', 'produced', 'produced', 'producing', 'in the Central Highlands', 'present', 2],
  ['These cars', true, 'make', 'made', 'made', 'making', 'in Japan', 'present', 2],
  ['The Eiffel Tower', false, 'build', 'built', 'built', 'building', 'in 1889', 'past', 2],
  ['The telephone', false, 'invent', 'invented', 'invented', 'inventing', 'by Alexander Bell', 'past', 2],
  ['Romeo and Juliet', false, 'write', 'wrote', 'written', 'writing', 'by Shakespeare', 'past', 2],
  ['The windows', true, 'break', 'broke', 'broken', 'breaking', 'during the storm last night', 'past', 3],
  ['The thief', false, 'catch', 'caught', 'caught', 'catching', 'yesterday afternoon', 'past', 3],
  ['The results', true, 'announce', 'announced', 'announced', 'announcing', 'next Monday', 'future', 3],
  ['A new library', false, 'build', 'built', 'built', 'building', 'here next year', 'future', 3],
  ['The winners', true, 'choose', 'chose', 'chosen', 'choosing', 'tomorrow', 'future', 3],
  ['My bike', false, 'steal', 'stole', 'stolen', 'stealing', "— I can't find it anywhere!", 'perfect', 4],
  ['Three new species of frog', true, 'discover', 'discovered', 'discovered', 'discovering', 'in Vietnam this year', 'perfect', 4],
  ['The bridge', false, 'repair', 'repaired', 'repaired', 'repairing', 'at the moment, so the road is closed', 'continuous', 4],
  ['New houses', true, 'build', 'built', 'built', 'building', 'near our school right now', 'continuous', 4],
  ['Phones', true, 'switch off', 'switched off', 'switched off', 'switching off', 'during the exam', 'modal', 5],
  ['Plastic bottles', true, 'recycle', 'recycled', 'recycled', 'recycling', 'whenever possible', 'modal', 5],
  ['Your essay', false, 'hand in', 'handed in', 'handed in', 'handing in', 'by Friday', 'modal', 5],
  ['Tea', false, 'drink', 'drank', 'drunk', 'drinking', 'all over the world', 'present', 1],
  ['The classrooms', true, 'clean', 'cleaned', 'cleaned', 'cleaning', 'every afternoon', 'present', 1],
  ['Pho', false, 'eat', 'ate', 'eaten', 'eating', 'for breakfast in many Vietnamese homes', 'present', 2],
  ['This temple', false, 'build', 'built', 'built', 'building', 'over 900 years ago', 'past', 2],
  ['The Mona Lisa', false, 'paint', 'painted', 'painted', 'painting', 'by Leonardo da Vinci', 'past', 2],
  ['The match', false, 'cancel', 'cancelled', 'cancelled', 'cancelling', 'last Sunday because of the rain', 'past', 3],
  ['Two students', true, 'give', 'gave', 'given', 'giving', 'a prize at the ceremony yesterday', 'past', 3],
  ['The new airport', false, 'open', 'opened', 'opened', 'opening', 'in 2030', 'future', 3],
  ['Your order', false, 'deliver', 'delivered', 'delivered', 'delivering', 'tomorrow morning', 'future', 3],
  ['The concert tickets', true, 'sell', 'sold', 'sold', 'selling', '— there are none left!', 'perfect', 4],
  ['The road', false, 'widen', 'widened', 'widened', 'widening', 'this week, so traffic is slow', 'continuous', 4],
  ['Helmets', true, 'wear', 'wore', 'worn', 'wearing', 'on motorbikes at all times', 'modal', 5],
];

const passiveGen: Generator = (d, r) => {
  const [subj, pl, base, past, pp, ing, rest, tense] = pick(r, near(PASSIVES, (x) => x[8], d));
  const is = pl ? 'are' : 'is';
  const notIs = pl ? 'is' : 'are';
  const was = pl ? 'were' : 'was';
  const has = pl ? 'have' : 'has';
  const s3 = pl ? base : third(base.split(' ')[0]) + base.slice(base.split(' ')[0].length);
  const forms: Record<PTense, [string, string[]]> = {
    present: [`${is} ${pp}`, [s3, `${notIs} ${pp}`, pp]],
    past: [`${was} ${pp}`, [past === pp ? `${was} ${base}` : past, `${pl ? 'was' : 'were'} ${pp}`, pp]],
    future: [`will be ${pp}`, [`will ${base}`, `will ${pp}`, `will been ${pp}`]],
    perfect: [`${has} been ${pp}`, [`${has} ${pp}`, `${pl ? 'has' : 'have'} been ${pp}`, `${has} being ${pp}`]],
    continuous: [`${is} being ${pp}`, [`${is} ${ing}`, `${notIs} being ${pp}`, `${is} been ${pp}`]],
    modal: [`must be ${pp}`, [`must ${base}`, `must ${pp}`, `must being ${pp}`]],
  };
  const [answer, distractors] = forms[tense];
  return {
    prompt: `${subj} ___ ${rest}.`,
    answer,
    distractors,
    explanation: `Passive = be (${tense === 'modal' ? 'must be' : tense === 'future' ? 'will be' : tense === 'perfect' ? `${has} been` : tense === 'continuous' ? `${is} being` : tense === 'past' ? was : is}) + past participle. The subject doesn't do the action.`,
  };
};

// ── Grammar: relative clauses ─────────────────────────────────
const REL_PEOPLE: [string, string, string][] = [
  ['The girl', 'lives next door', 'is my best friend'],
  ['The man', 'fixed our car', 'was very kind'],
  ['The teacher', 'teaches us maths', 'comes from Hue'],
  ['The boy', 'won the race', 'is only twelve'],
  ['The doctor', 'helped my grandma', 'works at a big hospital'],
  ['The players', 'scored the goals', 'were very happy'],
  ['The woman', 'sells bánh mì on our street', 'knows everyone'],
  ['The pilot', 'flew our plane', 'made a smooth landing'],
  ['The scientist', 'discovered the new frog', 'is Vietnamese'],
  ['The children', 'planted these trees', 'are now grown up'],
];
const REL_THINGS: [string, string, string][] = [
  ['The phone', 'I bought last week', 'is already broken'],
  ['The book', 'you lent me', 'was really exciting'],
  ['The cake', 'my mum made', 'was delicious'],
  ['The film', 'we watched yesterday', 'was scary'],
  ['The bus', 'goes to the airport', 'leaves every hour'],
  ['The shoes', 'I want', 'are too expensive'],
  ['The laptop', 'my dad uses', 'is very old'],
  ['The song', 'won the contest', 'is stuck in my head'],
  ['The museum', 'we visited in Hue', 'was fascinating'],
  ['The app', 'helps me learn words', 'is free'],
];
const REL_PLACES: [string, string][] = [
  ["That's the café", 'we first met'],
  ["That's the town", 'my father grew up'],
  ['I know a beach', 'you can see turtles'],
  ['This is the school', 'my mother studied'],
  ['We visited the village', 'my grandparents were born'],
  ['This is the park', 'we play football on Sundays'],
  ['I remember the hotel', 'we stayed last summer'],
  ['Da Lat is the city', 'my aunt lives'],
];
const REL_WHOSE: [string, string, string][] = [
  ['The boy', 'bike was stolen', 'called the police'],
  ['The woman', 'dog barks all night', 'lives upstairs'],
  ['The student', 'essay won the prize', 'is in my class'],
  ['The singer', 'songs we love', 'is coming to Hanoi'],
  ['The girl', 'father is a pilot', 'sits next to me'],
  ['The author', 'books I collect', 'lives in Saigon'],
  ['The family', 'house burned down', 'is staying with us'],
];
const REL_NONDEF: [string, string, string, boolean][] = [
  ['My sister', 'is a doctor', 'lives in Da Nang', true],
  ['Mr Long', 'has taught here for 20 years', 'is retiring', true],
  ['Ha Long Bay', 'is in the north of Vietnam', 'attracts millions of visitors', false],
  ['My laptop', 'I bought in 2021', 'still works perfectly', false],
  ['My grandfather', 'is 85', 'still swims every day', true],
  ['Phong Nha Cave', 'was discovered in 1935', 'is a UNESCO site', false],
  ['Our headteacher', 'loves chess', 'started a chess club', true],
];

const relativeGen: Generator = (d, r) => {
  if (d <= 1 || (d === 2 && r() < 0.5)) {
    const person = r() < 0.5;
    const [n, c, rest] = pick(r, person ? REL_PEOPLE : REL_THINGS);
    return {
      prompt: `${n} ___ ${c} ${rest}.`,
      answer: person ? 'who' : 'which',
      distractors: person ? ['which', 'where', 'whose'] : ['who', 'where', 'whose'],
      explanation: person ? '"who" is for people.' : '"which" is for things.',
    };
  }
  if (d <= 3 && r() < 0.5) {
    const [a, b] = pick(r, REL_PLACES);
    return { prompt: `${a} ___ ${b}.`, answer: 'where', distractors: ['which', 'who', 'whose'], explanation: '"where" is for places (= in which).' };
  }
  if (d <= 3) {
    const [n, c, rest] = pick(r, REL_WHOSE);
    return { prompt: `${n} ___ ${c} ${rest}.`, answer: 'whose', distractors: ['who', "who's", 'which'], explanation: '"whose" shows possession (his/her/their).' };
  }
  const [n, c, rest, person] = pick(r, REL_NONDEF);
  return {
    prompt: `${n}, ___ ${c}, ${rest}.`,
    answer: person ? 'who' : 'which',
    distractors: person ? ['that', 'which', 'whom'] : ['that', 'who', 'where'],
    explanation: 'With commas (extra information) we never use "that".',
  };
};

// ── Grammar: conditionals ─────────────────────────────────────
/** condition [subject, base, present, past, past participle, rest] + result [subject, base, past participle, rest] */
const CONDS: [[string, string, string, string, string, string], [string, string, string, string]][] = [
  [['it', 'rain', 'rains', 'rained', 'rained', ''], ['we', 'stay', 'stayed', 'at home']],
  [['you', 'study', 'study', 'studied', 'studied', ' harder'], ['you', 'pass', 'passed', 'the exam']],
  [['I', 'have', 'have', 'had', 'had', ' more time'], ['I', 'learn', 'learned', 'the guitar']],
  [['she', 'leave', 'leaves', 'left', 'left', ' earlier'], ['she', 'catch', 'caught', 'the train']],
  [['we', 'take', 'take', 'took', 'taken', ' a taxi'], ['we', 'arrive', 'arrived', 'on time']],
  [['Nam', 'practise', 'practises', 'practised', 'practised', ' every day'], ['he', 'win', 'won', 'the competition']],
  [['they', 'save', 'save', 'saved', 'saved', ' enough money'], ['they', 'buy', 'bought', 'a bigger house']],
  [['I', 'see', 'see', 'saw', 'seen', ' Lan'], ['I', 'tell', 'told', 'her the news']],
  [['you', 'ask', 'ask', 'asked', 'asked', ' me'], ['I', 'help', 'helped', 'you']],
  [['the weather', 'be', 'is', 'was', 'been', ' nice'], ['we', 'go', 'gone', 'to the beach']],
];

const conditionalGen: Generator = (d, r) => {
  const [c, res] = pick(r, CONDS);
  const type = d <= 2 ? 1 : d === 3 ? 2 : 3;
  const condForms = [c[2], c[3], `had ${c[4]}`];
  const resForms = [`will ${res[1]}`, `would ${res[1]}`, `would have ${res[2]}`];
  const names = ['First conditional: If + present, will + verb.', 'Second conditional (imaginary): If + past, would + verb.', 'Third conditional (past, didn\'t happen): If + had + past participle, would have + past participle.'];
  const gapCondition = d === 5 || (d >= 3 && r() < 0.4);
  if (gapCondition) {
    return {
      prompt: `If ${c[0]} ___${c[5]}, ${res[0]} ${resForms[type - 1]} ${res[3]}.`,
      answer: condForms[type - 1],
      distractors: [...condForms.filter((_, i) => i !== type - 1), `will ${c[1]}`],
      explanation: names[type - 1],
    };
  }
  return {
    prompt: `If ${c[0]} ${condForms[type - 1]}${c[5]}, ${res[0]} ___ ${res[3]}.`,
    answer: resForms[type - 1],
    distractors: [...resForms.filter((_, i) => i !== type - 1), `will have ${res[2]}`],
    explanation: names[type - 1],
  };
};

// ── Grammar: comparatives ─────────────────────────────────────
/** [adjective, comparative, superlative, comparative sentence, superlative sentence, difficulty] */
const ADJS: [string, string, string, string, string, number][] = [
  ['hot', 'hotter', 'hottest', 'Today is ___ than yesterday.', 'July is the ___ month of the year here.', 1],
  ['big', 'bigger', 'biggest', 'An elephant is ___ than a horse.', 'Russia is the ___ country in the world.', 1],
  ['tall', 'taller', 'tallest', 'My brother is ___ than me.', 'Who is the ___ student in your class?', 1],
  ['cheap', 'cheaper', 'cheapest', 'The bus is ___ than a taxi.', 'This is the ___ phone in the shop.', 1],
  ['happy', 'happier', 'happiest', 'She looks ___ than last week.', 'It was the ___ day of my life.', 2],
  ['easy', 'easier', 'easiest', 'Maths is ___ than physics for me.', 'This is the ___ question on the test.', 2],
  ['good', 'better', 'best', 'Your English is ___ than mine.', 'She is the ___ singer in our school.', 2],
  ['bad', 'worse', 'worst', 'The traffic is ___ today than yesterday.', 'That was the ___ film I have ever seen.', 2],
  ['beautiful', 'more beautiful', 'most beautiful', 'Ha Long Bay is ___ than I expected.', 'It is the ___ place I have visited.', 2],
  ['expensive', 'more expensive', 'most expensive', 'Beef is ___ than chicken.', 'This is the ___ restaurant in town.', 2],
  ['interesting', 'more interesting', 'most interesting', 'This book is ___ than the film.', 'History is the ___ subject for me.', 3],
  ['difficult', 'more difficult', 'most difficult', 'Chinese is ___ than English for me.', 'That was the ___ exam of the year.', 3],
  ['important', 'more important', 'most important', 'Health is ___ than money.', 'Sleep is the ___ thing before an exam.', 3],
  ['busy', 'busier', 'busiest', 'Saturday is ___ than Monday at the market.', 'Tet is the ___ time of the year.', 3],
  ['thin', 'thinner', 'thinnest', 'This laptop is ___ than my old one.', 'It is the ___ phone ever made.', 3],
  ['popular', 'more popular', 'most popular', 'Football is ___ than tennis in Vietnam.', 'What is the ___ app in your class?', 4],
  ['early', 'earlier', 'earliest', 'I got up ___ than usual.', "What's the ___ train to Hue?", 4],
  ['far', 'further', 'furthest', 'Da Nang is ___ from Hanoi than Vinh.', 'Which planet is the ___ from the Sun?', 4],
];

const comparativeGen: Generator = (d, r) => {
  const [adj, comp, sup, cs, ss] = pick(r, near(ADJS, (x) => x[5], d));
  const long = comp.startsWith('more ');
  const naiveComp = long ? `${adj}er` : `more ${adj}`;
  const naiveSup = long ? `${adj}est` : `most ${adj}`;
  if (d >= 4 && r() < 0.4)
    return { prompt: `He isn't as ___ as his brother. (${adj})`, answer: adj, distractors: [comp, sup, naiveComp], explanation: 'as + adjective + as (no -er / more).' };
  if (r() < 0.5)
    return { prompt: `${cs} (${adj})`, answer: comp, distractors: [sup, naiveComp, long ? `more ${adj}er` : `more ${comp}`], explanation: long ? 'Long adjective → more + adjective.' : `Short adjective → ${comp}.` };
  return { prompt: `${ss} (${adj})`, answer: sup, distractors: [comp, naiveSup, long ? `most ${adj}est` : `most ${sup}`], explanation: `the + superlative: the ${sup}.` };
};

// ── Listening: numbers, times, dates, spelling ────────────────
const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
export function words(n: number): string {
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '');
  if (n < 1000) return ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' and ' + words(n % 100) : '');
  return words(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? (n % 1000 < 100 ? ' and ' : ' ') + words(n % 1000) : '');
}
const ORD: Record<number, string> = { 1: 'first', 2: 'second', 3: 'third', 5: 'fifth', 8: 'eighth', 9: 'ninth', 12: 'twelfth', 20: 'twentieth', 30: 'thirtieth' };
function ordinal(n: number): string {
  if (ORD[n]) return ORD[n];
  if (n > 20 && n % 10) return TENS[Math.floor(n / 10)] + '-' + ordinal(n % 10);
  return words(n) + 'th';
}
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const NAMES = ['PARKER', 'BAKER', 'MORGAN', 'THOMPSON', 'HAYES', 'WILKINS', 'GARDNER', 'COOPER', 'HUGHES', 'BRENNAN', 'FIELDING', 'JAMESON'];
/** Letters whose English names are easy to mishear. */
const CONFUSABLE: Record<string, string> = { P: 'B', B: 'P', V: 'B', M: 'N', N: 'M', E: 'I', I: 'E', A: 'E', G: 'J', J: 'G', K: 'Q', S: 'F', F: 'S', T: 'D', D: 'T', C: 'S', Y: 'I' };
const teenTy = (n: number) => (n >= 13 && n <= 19 ? (n - 10) * 10 : n % 10 === 0 && n >= 30 && n <= 90 ? n / 10 + 10 : n + 1);
const digitWord = (c: string) => (c === '0' ? 'oh' : ONES[+c]);

const listeningNumbersGen: Generator = (d, r) => {
  const kind = d <= 1 ? pick(r, ['number', 'time'] as const) : d === 2 ? pick(r, ['price', 'time', 'number'] as const) : d === 3 ? pick(r, ['date', 'spell'] as const) : d === 4 ? pick(r, ['phone', 'spell', 'date'] as const) : 'total';
  if (kind === 'number') {
    const n = r() < 0.5 ? int(r, 13, 19) : int(r, 3, 9) * 10;
    return { prompt: 'What number did you hear?', audio: `The number is ${words(n)}.`, answer: String(n), distractors: [String(teenTy(n)), String(n + 1), String(n - 1)] };
  }
  if (kind === 'time') {
    const h = int(r, 2, 11);
    const k = int(r, 0, 3);
    const said = [`${words(h)} o'clock`, `half past ${words(h)}`, `quarter past ${words(h)}`, `quarter to ${words(h)}`][k];
    const shown = [`${h}:00`, `${h}:30`, `${h}:15`, `${h - 1}:45`];
    const place = pick(r, ['The film starts', 'The bus leaves', 'The class begins', 'The shop opens']);
    return { prompt: 'What time did you hear?', audio: `${place} at ${said}.`, answer: shown[k], distractors: [...shown.filter((_, i) => i !== k).slice(0, 2), k === 3 ? `${h}:45` : `${h + 1}:${shown[k].split(':')[1]}`] };
  }
  if (kind === 'price') {
    const dollars = r() < 0.5 ? int(r, 13, 19) : int(r, 3, 9) * 10;
    const cents = pick(r, [0, 25, 50, 75, 99]);
    const fmt = (a: number, c: number) => `$${a}.${String(c).padStart(2, '0')}`;
    const audio = `The ticket costs ${words(dollars)} dollars${cents ? ` ${words(cents)}` : ''}.`;
    return { prompt: 'How much is the ticket?', audio, answer: fmt(dollars, cents), distractors: [fmt(teenTy(dollars), cents), fmt(dollars, cents === 50 ? 15 : 50), fmt(dollars + 1, cents)] };
  }
  if (kind === 'date') {
    const day = int(r, 1, 30);
    const m = int(r, 0, 11);
    const alt = teenTy(day) <= 31 ? teenTy(day) : day + 2;
    return {
      prompt: 'What date did you hear?',
      audio: `The party is on the ${ordinal(day)} of ${MONTHS[m]}.`,
      answer: `${day} ${MONTHS[m]}`,
      distractors: [`${alt} ${MONTHS[m]}`, `${day} ${MONTHS[(m + 2) % 12]}`, `${day === 2 ? 3 : 2} ${MONTHS[m]}`],
    };
  }
  if (kind === 'spell') {
    const name = pick(r, NAMES);
    const variants = new Set<string>();
    for (let i = 0; variants.size < 3 && i < 50; i++) {
      const pos = int(r, 0, name.length - 1);
      const sub = CONFUSABLE[name[pos]];
      if (sub) variants.add(name.slice(0, pos) + sub + name.slice(pos + 1));
    }
    return {
      prompt: 'How is the surname spelled?',
      audio: `My surname is ${name.charAt(0) + name.slice(1).toLowerCase()}. That's ${name.split('').join(', ')}.`,
      answer: name,
      distractors: [...variants],
    };
  }
  if (kind === 'phone') {
    const digits = '09' + Array.from({ length: 8 }, () => int(r, 0, 9)).join('');
    const group = (s: string) => `${s.slice(0, 4)} ${s.slice(4, 7)} ${s.slice(7)}`;
    const swap = (s: string, i: number) => s.slice(0, i) + s[i + 1] + s[i] + s.slice(i + 2);
    const change = (s: string, i: number) => s.slice(0, i) + ((+s[i] + 3) % 10) + s.slice(i + 1);
    const audio = `You can call me on ${[digits.slice(0, 4), digits.slice(4, 7), digits.slice(7)].map((g) => g.split('').map(digitWord).join(' ')).join(', ')}.`;
    return { prompt: 'What is the phone number?', audio, answer: group(digits), distractors: [group(swap(digits, 5)), group(change(digits, 8)), group(swap(digits, 2))] };
  }
  const a = int(r, 3, 9) * 10 + int(r, 0, 9);
  const b = int(r, 11, 29);
  return {
    prompt: 'How many people came in total?',
    audio: `About ${words(a)} people came in the morning, and another ${words(b)} arrived in the afternoon.`,
    answer: String(a + b),
    distractors: [String(a), String(a + teenTy(b) - b || a + b + 10), String(a + b + 10)],
  };
};

export const englishGenerators: Record<string, Generator> = {
  'en.vocab.everyday': (d, r) => meaningQuestion(EVERYDAY, d, r),
  'en.vocab.academic': (d, r) => meaningQuestion(ACADEMIC, d, r),
  'en.vocab.synonyms': synonymGen,
  'en.vocab.collocations': collocationGen,
  'en.vocab.word-forms': wordFormGen,
  'en.grammar.tenses': tensesGen,
  'en.grammar.passive': passiveGen,
  'en.grammar.relative': relativeGen,
  'en.grammar.conditionals': conditionalGen,
  'en.grammar.comparatives': comparativeGen,
  'en.listening.numbers': listeningNumbersGen,
};
