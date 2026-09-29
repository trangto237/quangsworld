/**
 * Word lists behind the vocabulary generators. Each entry yields several question types
 * (meaning → word, word → meaning, synonym, opposite, word partner, word form), so a
 * vocabulary mission can run for a long time without repeating itself.
 *
 * Entries within one list are chosen to have clearly different meanings, because other
 * entries are used as the wrong options.
 */

export type Pos = 'n' | 'v' | 'adj' | 'adv';

/** [word, part of speech, meaning, difficulty 1–5] */
export type MeaningEntry = [string, Pos, string, number];

export const EVERYDAY: MeaningEntry[] = [
  ['breakfast', 'n', 'the first meal of the day', 1],
  ['library', 'n', 'a place where you can borrow books', 1],
  ['homework', 'n', 'school work that you do at home', 1],
  ['umbrella', 'n', 'something you hold over your head to stay dry in the rain', 1],
  ['fridge', 'n', 'a machine that keeps food cold', 1],
  ['neighbour', 'n', 'a person who lives next to you', 1],
  ['ticket', 'n', 'a piece of paper that lets you travel or enter an event', 2],
  ['pharmacy', 'n', 'a shop that sells medicine', 2],
  ['vet', 'n', 'a doctor who treats animals', 2],
  ['luggage', 'n', 'the bags you take with you on a trip', 2],
  ['timetable', 'n', 'a list showing the times of classes, buses or trains', 2],
  ['wallet', 'n', 'a small case for carrying money and cards', 2],
  ['recipe', 'n', 'instructions for cooking a dish', 3],
  ['receipt', 'n', 'a piece of paper that shows what you paid in a shop', 3],
  ['passport', 'n', 'an official document you need to travel to another country', 3],
  ['invitation', 'n', 'a message asking someone to come to an event', 3],
  ['uniform', 'n', 'special clothes that everyone in a school or team wears', 3],
  ['traffic jam', 'n', 'a long line of cars that cannot move', 3],
  ['arrive', 'v', 'to reach a place', 1],
  ['forget', 'v', 'to not remember something', 1],
  ['borrow', 'v', 'to take something from someone and give it back later', 2],
  ['lend', 'v', 'to give something to someone for a short time', 2],
  ['repair', 'v', 'to fix something that is broken', 2],
  ['explain', 'v', 'to make something clear and easy to understand', 2],
  ['rent', 'v', 'to pay money to use a house or car that belongs to someone else', 3],
  ['postpone', 'v', 'to move an event to a later time', 4],
  ['apologise', 'v', 'to say sorry', 3],
  ['tired', 'adj', 'needing rest or sleep', 1],
  ['delicious', 'adj', 'tasting very good', 1],
  ['noisy', 'adj', 'making a lot of sound', 1],
  ['expensive', 'adj', 'costing a lot of money', 1],
  ['crowded', 'adj', 'full of people', 2],
  ['dangerous', 'adj', 'likely to hurt someone', 2],
  ['honest', 'adj', 'always telling the truth', 2],
  ['polite', 'adj', 'speaking and acting with good manners', 2],
  ['lazy', 'adj', 'not wanting to work or make an effort', 2],
  ['shy', 'adj', 'nervous about talking to people you do not know', 3],
  ['curious', 'adj', 'wanting to know or learn about things', 3],
  ['generous', 'adj', 'happy to give money, time or things to others', 3],
  ['punctual', 'adj', 'arriving exactly on time', 4],
  ['nervous', 'adj', 'worried about something that is going to happen', 3],
  ['ancient', 'adj', 'extremely old, from a very long time ago', 4],
];

export const ACADEMIC: MeaningEntry[] = [
  ['evidence', 'n', 'facts that show something is true', 2],
  ['benefit', 'n', 'an advantage or good result', 2],
  ['research', 'n', 'careful study to discover new facts', 2],
  ['method', 'n', 'a planned way of doing something', 2],
  ['impact', 'n', 'a strong effect on something', 3],
  ['approach', 'n', 'a way of dealing with a problem', 3],
  ['consequence', 'n', 'a result of an action, often a bad one', 3],
  ['data', 'n', 'facts and numbers collected for study', 3],
  ['region', 'n', 'a large area of a country or of the world', 3],
  ['trend', 'n', 'a general direction in which something is changing', 4],
  ['factor', 'n', 'one of the things that cause a result', 4],
  ['policy', 'n', 'a plan of action agreed by a government or organisation', 4],
  ['hypothesis', 'n', 'an idea that has not been proved yet and can be tested', 5],
  ['analyse', 'v', 'to examine something in detail', 3],
  ['require', 'v', 'to need something', 3],
  ['estimate', 'v', 'to guess a number or amount roughly', 3],
  ['indicate', 'v', 'to show or point to something', 4],
  ['contribute', 'v', 'to give something or help to cause something', 4],
  ['emerge', 'v', 'to appear or become known', 4],
  ['implement', 'v', 'to put a plan into action', 5],
  ['interpret', 'v', 'to explain what something means', 5],
  ['vary', 'v', 'to be different in different situations', 4],
  ['previous', 'adj', 'happening or existing before', 3],
  ['significant', 'adj', 'large or important enough to be noticed', 4],
  ['sustainable', 'adj', 'able to continue without harming the environment', 5],
];

/** [word, synonym, opposite | null, difficulty] */
export type SynonymEntry = [string, string, string | null, number];

export const SYNONYMS: SynonymEntry[] = [
  ['begin', 'start', 'finish', 1],
  ['big', 'large', 'small', 1],
  ['rapid', 'fast', 'slow', 2],
  ['difficult', 'challenging', 'easy', 2],
  ['wealthy', 'rich', 'poor', 2],
  ['silent', 'quiet', 'loud', 2],
  ['purchase', 'buy', 'sell', 2],
  ['famous', 'well-known', 'unknown', 2],
  ['fortunate', 'lucky', 'unlucky', 2],
  ['assist', 'help', null, 2],
  ['enormous', 'huge', 'tiny', 3],
  ['increase', 'rise', 'decrease', 3],
  ['brave', 'courageous', 'cowardly', 3],
  ['frequently', 'often', 'rarely', 3],
  ['permit', 'allow', 'forbid', 3],
  ['vanish', 'disappear', 'appear', 3],
  ['improve', 'get better', 'get worse', 3],
  ['attempt', 'try', null, 3],
  ['obvious', 'clear', 'hidden', 3],
  ['hostile', 'unfriendly', 'friendly', 4],
  ['essential', 'vital', 'unnecessary', 4],
  ['genuine', 'real', 'fake', 4],
  ['fragile', 'easily broken', 'strong', 4],
  ['reveal', 'show', 'hide', 4],
  ['accelerate', 'speed up', 'slow down', 4],
  ['temporary', 'short-term', 'permanent', 4],
  ['vague', 'unclear', 'precise', 5],
  ['abundant', 'plentiful', 'scarce', 5],
  ['reluctant', 'unwilling', 'eager', 5],
  ['mitigate', 'lessen', 'worsen', 5],
  ['ubiquitous', 'found everywhere', 'rare', 5],
];

/** [sentence with ___, correct word, three wrong partners, difficulty] */
export type CollocationEntry = [string, string, [string, string, string], number];

export const COLLOCATIONS: CollocationEntry[] = [
  ['I always ___ my homework after dinner.', 'do', ['make', 'take', 'play'], 1],
  ['Can you ___ a photo of us?', 'take', ['make', 'do', 'catch'], 1],
  ['Everyone can ___ a mistake sometimes.', 'make', ['do', 'take', 'pay'], 1],
  ['May I ___ a question?', 'ask', ['say', 'tell', 'make'], 1],
  ['Please don\'t ___ a noise — the baby is sleeping.', 'make', ['do', 'give', 'take'], 1],
  ['It\'s important to ___ friends at a new school.', 'make', ['do', 'get', 'have'], 2],
  ['We need to ___ a decision before Friday.', 'make', ['do', 'put', 'give'], 2],
  ['Please ___ attention to the teacher.', 'pay', ['give', 'make', 'put'], 2],
  ['Hurry up or we\'ll ___ the bus!', 'miss', ['lose', 'fail', 'drop'], 2],
  ['Always ___ the truth.', 'tell', ['say', 'speak', 'talk'], 2],
  ['My uncle loves to ___ jokes.', 'tell', ['say', 'speak', 'do'], 2],
  ['There was ___ rain all night.', 'heavy', ['strong', 'big', 'thick'], 2],
  ['I hope you ___ the exam!', 'pass', ['win', 'succeed', 'get'], 2],
  ['Our team will ___ the match.', 'win', ['beat', 'gain', 'earn'], 2],
  ['Grandpa likes to ___ a nap after lunch.', 'take', ['make', 'do', 'put'], 2],
  ['I usually ___ asleep reading.', 'fall', ['go', 'get', 'come'], 3],
  ['The ___ traffic made us late.', 'heavy', ['strong', 'thick', 'big'], 3],
  ['There was a ___ wind, so we stayed inside.', 'strong', ['heavy', 'thick', 'fat'], 3],
  ['I like my coffee ___, not weak.', 'strong', ['heavy', 'powerful', 'big'], 3],
  ['Our team will ___ their best opponent yet.', 'beat', ['win', 'gain', 'earn'], 3],
  ['He managed to ___ a goal in the last minute.', 'score', ['win', 'make', 'earn'], 3],
  ['Don\'t ___ time on your phone before homework.', 'waste', ['throw', 'drop', 'miss'], 3],
  ['You have to ___ your promise.', 'keep', ['hold', 'stay', 'save'], 3],
  ['Let\'s ___ a party for her birthday!', 'throw', ['make', 'do', 'play'], 3],
  ['Sometimes you have to ___ a risk.', 'take', ['make', 'do', 'put'], 3],
  ['Your story doesn\'t ___ sense.', 'make', ['do', 'have', 'give'], 3],
  ['You are ___ great progress in English.', 'making', ['doing', 'taking', 'getting'], 4],
  ['The mayor will ___ a speech tomorrow.', 'give', ['say', 'tell', 'speak'], 4],
  ['Please ___ an effort to arrive on time.', 'make', ['do', 'take', 'give'], 4],
  ['We need to ___ this problem quickly.', 'solve', ['answer', 'make', 'open'], 4],
  ['Scientists ___ research on climate change.', 'carry out', ['make up', 'take on', 'put off'], 5],
  ['The new law had a ___ effect on pollution.', 'dramatic', ['heavy', 'tall', 'wide'], 5],
  ['Technology has ___ a big role in education in recent years.', 'played', ['done', 'made', 'taken'], 5],
  ['The company hopes to ___ a profit this year.', 'make', ['do', 'win', 'take'], 5],
];

/**
 * Word families. `sentences` pick one form: n = noun, v = verb, adj, adv.
 * [noun, verb, adjective, adverb, difficulty, sentences]
 */
export type FamilyEntry = [string | null, string | null, string | null, string | null, number, [string, Pos][]];

export const FAMILIES: FamilyEntry[] = [
  ['beauty', 'beautify', 'beautiful', 'beautifully', 1, [['She sings ___.', 'adv'], ['What a ___ view!', 'adj']]],
  ['happiness', null, 'happy', 'happily', 1, [['Money can\'t buy ___.', 'n'], ['They lived ___ ever after.', 'adv']]],
  ['care', 'care', 'careful', 'carefully', 1, [['Please read the question ___.', 'adv'], ['Be ___ with that knife!', 'adj']]],
  ['quickness', 'quicken', 'quick', 'quickly', 1, [['Come here ___!', 'adv']]],
  ['decision', 'decide', 'decisive', 'decisively', 2, [['We need to make a ___ today.', 'n'], ['She couldn\'t ___ which book to buy.', 'v']]],
  ['danger', 'endanger', 'dangerous', 'dangerously', 2, [['Swimming here is ___.', 'adj'], ['He was driving ___ fast.', 'adv']]],
  ['success', 'succeed', 'successful', 'successfully', 2, [['Hard work leads to ___.', 'n'], ['The school trip was very ___.', 'adj'], ['If you practise, you will ___.', 'v']]],
  ['creation', 'create', 'creative', 'creatively', 2, [['Artists are usually very ___ people.', 'adj'], ['Let\'s ___ a poster for the class.', 'v']]],
  ['friendship', null, 'friendly', null, 2, [['Their ___ lasted forty years.', 'n'], ['The hotel staff were very ___.', 'adj']]],
  ['difference', 'differ', 'different', 'differently', 3, [['What\'s the ___ between these two words?', 'n'], ['Everyone learns ___.', 'adv']]],
  ['education', 'educate', 'educational', 'educationally', 3, [['A good ___ opens many doors.', 'n'], ['This game is fun and ___.', 'adj']]],
  ['pollution', 'pollute', 'polluted', null, 3, [['Air ___ is a big problem in big cities.', 'n'], ['Factories must not ___ the river.', 'v']]],
  ['action', 'act', 'active', 'actively', 3, [['My grandmother is still very ___.', 'adj'], ['We must ___ now to save the forest.', 'v']]],
  ['patience', null, 'patient', 'patiently', 3, [['She waited ___ for the bus.', 'adv'], ['Learning a language takes ___.', 'n']]],
  ['power', 'empower', 'powerful', 'powerfully', 3, [['This is a very ___ computer.', 'adj']]],
  ['invention', 'invent', 'inventive', 'inventively', 3, [['The telephone was an amazing ___.', 'n'], ['Edison helped to ___ the light bulb.', 'v']]],
  ['improvement', 'improve', 'improved', null, 3, [['There has been a big ___ in your writing.', 'n'], ['Reading every day will ___ your vocabulary.', 'v']]],
  ['harm', 'harm', 'harmful', 'harmfully', 3, [['Smoking is ___ to your health.', 'adj']]],
  ['reliability', 'rely', 'reliable', 'reliably', 4, [['My old bike is very ___ — it never breaks.', 'adj'], ['You can always ___ on your family.', 'v']]],
  ['production', 'produce', 'productive', 'productively', 4, [['Rice ___ increased last year.', 'n'], ['I had a very ___ morning and finished everything.', 'adj']]],
  ['communication', 'communicate', 'communicative', null, 4, [['Good ___ skills are important at work.', 'n'], ['Dolphins ___ using sounds.', 'v']]],
  ['responsibility', null, 'responsible', 'responsibly', 4, [['Looking after a pet is a big ___.', 'n'], ['Please use the internet ___.', 'adv']]],
  ['population', 'populate', 'populous', null, 4, [['The ___ of Hanoi is over eight million.', 'n']]],
  ['economy', 'economise', 'economic', 'economically', 5, [['The country has had strong ___ growth.', 'adj']]],
  ['argument', 'argue', 'arguable', 'arguably', 5, [['There was a long ___ about the new rules.', 'n'], ['She is ___ the best player in the team.', 'adv']]],
  ['discovery', 'discover', 'discoverable', null, 5, [['The ___ of penicillin changed medicine.', 'n']]],
  ['minimum', 'minimise', 'minimal', 'minimally', 5, [['Recycling helps to ___ waste.', 'v']]],
];
