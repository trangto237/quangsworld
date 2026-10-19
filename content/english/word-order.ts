/**
 * Word order (Sentence Sprint): put the words in the right order. Each sentence practises one rule,
 * named in its explanation, so the Coach and the review can say *why* the order is right.
 */
import { makeBank, type ConceptSeed } from '../helpers';

export const wordOrderConcepts: ConceptSeed[] = [
  {
    id: 'en.grammar.word-order',
    domain: 'Grammar',
    skill: 'Sentence building',
    name: 'Word order',
    missionName: 'Sentence Sprint',
    description: 'Build sentences in the right order: adverbs of frequency, questions, adjectives, time and place.',
    cefr: 'A2',
    lesson:
      'English order: Subject + Verb + Object + Place + Time ("I met Lan at school yesterday"). Frequency adverbs go before the main verb but after "be" ("She often walks", "He is always late"). Questions: (Question word) + auxiliary + subject + verb ("Where do you live?"). Opinion adjectives come before size, age, colour ("a lovely small old house").',
    examRefs: ['Hà Nội grade-10 exam: sentence building', 'IELTS Writing: sentence structure'],
  },
];

const { add, list } = makeBank('Atlas word order', 'w');
const O = (d: number, sentence: string, explanation: string, accept?: string[]) =>
  add('en.grammar.word-order', d, 'Put the words in the right order.', [sentence], { type: 'order', explanation, accept });

const SVOPT = 'Subject + verb + object + place + time.';
const FREQ = 'Frequency adverbs (always, often, usually, never…) go before the main verb.';
const FREQ_BE = 'Frequency adverbs go after "be" (am/is/are/was/were).';
const QUESTION = 'Questions: question word + auxiliary (do/does/did/have/will…) + subject + verb.';

// Difficulty 1: short S–V–O–place–time
O(1, 'I play football after school.', SVOPT);
O(1, 'My sister reads books every evening.', SVOPT);
O(1, 'We visited our grandparents last weekend.', SVOPT);
O(1, 'She always eats breakfast at home.', FREQ);
O(1, 'He is never late for class.', FREQ_BE);
O(1, 'Where do you live?', QUESTION);
O(1, 'They are watching a film now.', 'Present continuous: am/is/are + verb-ing.');
O(1, 'What time does the bus leave?', QUESTION);
// Difficulty 2
O(2, 'My father usually drives to work.', FREQ);
O(2, 'Students are often tired on Monday mornings.', FREQ_BE);
O(2, 'How long have you lived in Hà Nội?', 'How long + have/has + subject + past participle (present perfect question).');
O(2, 'I have never been to Đà Nẵng.', 'have/has + never + past participle.');
O(2, 'There is a beautiful old temple near my house.', 'Opinion adjective (beautiful) before age (old): "a beautiful old temple".');
O(2, 'Could you open the window, please?', 'Polite request: Could + you + base verb.');
O(2, 'Why did you leave the party early?', QUESTION);
O(2, 'She speaks English very well.', 'Verb + object, then the adverb: "speaks English very well" — never "speaks very well English".');
O(2, 'We are going to visit Ha Long Bay next summer.', 'be going to + base verb for plans; time at the end.');
// Difficulty 3
O(3, 'The bridge was built in 1902.', 'Passive: subject + was/were + past participle (+ time).');
O(3, 'If it rains tomorrow, we will stay at home.', 'First conditional: If + present simple, will + base verb.', ['We will stay at home if it rains tomorrow.']);
O(3, 'My brother is taller than me.', 'Comparative: be + adjective-er + than.');
O(3, 'This is the most interesting book I have ever read.', 'the most + adjective + noun + (that) + I have ever + past participle.');
O(3, 'I am interested in learning about history.', 'interested in + verb-ing.');
O(3, 'She has just finished her homework.', '"just" goes between have/has and the past participle.');
O(3, 'Do you know where the station is?', 'Indirect question: "where the station is" — no question order after "Do you know".');
O(3, 'He asked me what I was doing.', 'Reported question: normal order "what I was doing", no auxiliary inversion.');
O(3, 'Playing chess helps me think carefully.', 'Verb-ing as the subject: "Playing chess helps…".');
O(3, 'It took me two hours to finish the project.', 'It takes/took + person + time + to + base verb.');
// Difficulty 4
O(4, 'The girl who lives next door is my best friend.', 'Relative clause right after the noun it describes: "the girl who lives next door".');
O(4, 'I wish I could speak English fluently.', 'wish + past (could) for a present wish.');
O(4, 'He is used to getting up early.', 'be used to + verb-ing (= accustomed to).');
O(4, 'The more you practise, the better you become.', 'Double comparative: The more…, the better….');
O(4, 'Although it was raining, they went out.', 'Although + clause, main clause.', ['They went out although it was raining.']);
O(4, 'Not only is he clever, but he is also kind.', 'Not only + auxiliary + subject (inversion), but … also.');
O(4, 'My mother made me clean my room.', 'make + person + base verb (no "to").');
O(4, 'She is too young to drive a car.', 'too + adjective + to + base verb.');
O(4, 'The house where I grew up has been sold.', '"where" for places; passive present perfect: has been + past participle.');
// Difficulty 5
O(5, 'Had I known about the test, I would have studied harder.', 'Inverted third conditional: Had + subject + past participle, would have + past participle.');
O(5, 'Hardly had we arrived when it started to rain.', 'Hardly had + subject + past participle + when….');
O(5, 'It is said that Hà Nội is over a thousand years old.', 'Impersonal passive: It is said that + clause.');
O(5, 'Rarely do students get perfect scores on this exam.', 'Negative adverb first (Rarely) → auxiliary + subject inversion.');
O(5, 'The new library, which opened last month, is always crowded.', 'Non-defining relative clause between commas; "which" for things.');
O(5, 'Not until I moved abroad did I appreciate Vietnamese food.', 'Not until + clause, then auxiliary + subject inversion.');

export const wordOrderQuestions = list;
