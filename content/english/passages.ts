/**
 * Longer passages for exam practice:
 *  - Hà Nội grade-10 style reading (≈200 words, 6 questions each)
 *  - IELTS-style Academic Reading (≈600 words, 13 questions: headings, T/F/NG, completion)
 *  - IELTS-style Listening (Part 1 form completion with typed answers, Part 2 multiple choice),
 *    read aloud by the device with different voices per speaker.
 * All texts are original.
 */
import type { Question } from '@atlas/shared';
import { makeBank, type ConceptSeed } from '../helpers';

export const passageConcepts: ConceptSeed[] = [
  {
    id: 'en.reading.detail',
    domain: 'Reading',
    skill: 'Scanning',
    name: 'Details & reference',
    missionName: 'Seeker\'s Lens',
    description: 'Finding specific information, "NOT mentioned" questions, and what words like "it/they/their" refer to.',
    cefr: 'B1',
    prerequisites: ['en.reading.main-idea'],
    lesson:
      'Underline the key word in the question (a number, a name, a date), then scan the text for it. For "it / they / this" questions, look at the sentence just before. For "NOT mentioned", check every option against the text.',
    examRefs: ['Hà Nội grade-10 exam: reading comprehension', 'IELTS Reading'],
  },
  {
    id: 'en.ielts.reading',
    domain: 'IELTS',
    skill: 'IELTS Reading',
    name: 'IELTS Academic Reading',
    missionName: 'Tower Archives',
    description: 'Long passages with matching headings, True/False/Not Given and sentence completion.',
    cefr: 'B2',
    prerequisites: ['en.reading.tfng', 'en.reading.main-idea'],
    lesson:
      'Read the questions first, then skim the passage. For headings, read the first two sentences of each paragraph. For completion, copy words exactly from the passage and respect the word limit ("NO MORE THAN TWO WORDS").',
    examRefs: ['IELTS Academic Reading'],
  },
  {
    id: 'en.ielts.listening',
    domain: 'IELTS',
    skill: 'IELTS Listening',
    name: 'IELTS Listening',
    missionName: 'Tower Echoes',
    description: 'Form completion (names, numbers, dates) and multiple choice from conversations and talks.',
    cefr: 'B1',
    prerequisites: ['en.listening.numbers', 'en.listening.details'],
    lesson:
      'Read the questions before the recording starts and guess the type of answer (a number? a name?). Answers come in order. Spelling counts — names are often spelled out letter by letter. Watch for speakers who change their minds.',
    examRefs: ['IELTS Listening Parts 1–2'],
  },
];

const { add, list } = makeBank('Atlas original', 'p')

// ── Hà Nội-style reading passages ─────────────────────────────
const MAIN = 'en.reading.main-idea', DET = 'en.reading.detail', PARA = 'en.reading.paraphrase', INF = 'en.reading.inference', TF = 'en.reading.tfng';

const SLEEP = `Most teenagers do not get enough sleep. Doctors say that people aged 13 to 18 need between eight and ten hours of sleep every night, but many students sleep only six or seven hours. There are several reasons for this. Some students stay up late to finish their homework, while others spend too much time on their phones before bed. The blue light from screens makes the brain think it is still daytime, so falling asleep becomes harder.

Lack of sleep can cause serious problems. Tired students find it difficult to concentrate in class, and their memory does not work as well. They may also feel moody or stressed. In the long term, not sleeping enough can even make people more likely to get ill.

Fortunately, there are simple ways to sleep better. Experts suggest going to bed at the same time every night, even at weekends. They also recommend turning off all screens at least an hour before bedtime. Instead, teenagers can read a book or listen to quiet music. Small changes like these can make a big difference to students' health and school results.`;
const s1 = { passage: SLEEP, setId: 'hn-sleep' };
add(MAIN, 3, 'What is the passage mainly about?', ["Teenagers' sleep problems and how to solve them", 'How to use computers safely', 'Why homework is important', 'The best music for teenagers'], s1);
add(DET, 2, 'According to doctors, how much sleep do teenagers need every night?', ['Eight to ten hours', 'Six or seven hours', 'Thirteen to eighteen hours', 'At least eleven hours'], s1);
add(DET, 3, 'The word "their" in paragraph 2 ("their memory") refers to ___.', ['tired students', 'doctors', 'screens', 'problems'], s1);
add(DET, 4, 'Which of the following is NOT mentioned as an effect of lack of sleep?', ['Gaining weight', 'Difficulty concentrating', 'Feeling moody', 'Getting ill more easily'], s1);
add(PARA, 3, 'The word "concentrate" in paragraph 2 is closest in meaning to ___.', ['focus', 'relax', 'sleep', 'speak'], s1);
add(DET, 3, 'According to the passage, what should teenagers do before going to bed?', ['Turn off screens and read or listen to quiet music', 'Finish their homework on the computer', 'Go to bed at a different time every night', 'Play games to feel tired'], s1);

const LANTERN = `Every month, on the fourteenth day of the lunar calendar, the ancient town of Hoi An turns off many of its electric lights. Instead, the streets are lit by thousands of colourful silk lanterns. This is the Hoi An Lantern Festival, one of the most beautiful events in Vietnam.

On festival nights, the old town becomes quiet and peaceful. Cars and motorbikes are not allowed in the old streets, so people can walk around freely. Visitors can watch traditional music performances, play folk games or try local food. Many people also buy small paper lanterns with candles inside and float them on the river. According to local belief, this brings good luck and happiness.

The festival began in the late 1990s as a way to protect the town's traditions and attract tourists. Since then, it has become very popular. However, the large number of visitors has caused some problems, such as rubbish in the river. Local people now encourage tourists to choose lanterns that are friendly to the environment.`;
const s2 = { passage: LANTERN, setId: 'hn-lantern' };
add(MAIN, 3, 'What is the best title for the passage?', ['A Night of Lanterns in Hoi An', 'How to Make Silk Lanterns', 'The History of Vietnam', 'Electric Lights in Vietnam'], s2);
add(DET, 2, 'When does the festival take place?', ['On the 14th day of every lunar month', 'Once a year in summer', 'Every weekend', 'On the first day of the lunar new year'], s2);
add(DET, 3, 'Why do people float lanterns on the river?', ['They believe it brings good luck and happiness.', 'They want to clean the river.', 'It is a way to sell lanterns.', 'It helps boats see at night.'], s2);
add(PARA, 3, 'The word "peaceful" in paragraph 2 is closest in meaning to ___.', ['calm', 'noisy', 'crowded', 'dark'], s2);
add(TF, 4, 'Which statement is TRUE according to the passage?', ['Motorbikes are not allowed in the old streets during the festival.', 'The festival started more than fifty years ago.', 'Visitors cannot buy food during the festival.', 'Tourists have caused no problems.'], s2);
add(INF, 4, 'What can be inferred from the last paragraph?', ['Some lanterns can harm the environment.', 'Tourists are not welcome in Hoi An.', 'The festival will stop soon.', 'Local people do not like lanterns.'], s2);

const EBIKES = `In many Vietnamese cities, motorbikes are the most common way to get around. However, most of them run on petrol and produce a lot of air pollution. In recent years, electric motorbikes have become a popular alternative, especially among students and young workers.

Electric motorbikes have several advantages. They are quiet, they do not produce exhaust fumes, and charging them costs much less than buying petrol. Many models can travel 80 to 100 kilometres on a single charge, which is enough for most people's daily journeys.

However, there are also some disadvantages. Charging the battery can take several hours, and there are still not many charging stations in some areas. In addition, old batteries must be recycled carefully, or they can damage the environment.

Experts believe that electric vehicles will play an important role in reducing pollution in the future. If more people choose electric motorbikes, our cities could become cleaner and quieter places to live.`;
const s3 = { passage: EBIKES, setId: 'hn-ebikes' };
add(MAIN, 3, 'What is the passage mainly about?', ['The advantages and disadvantages of electric motorbikes', 'How to repair a motorbike', 'The history of petrol', 'Why students prefer bicycles'], s3);
add(DET, 2, 'How far can many electric motorbikes travel on one charge?', ['80 to 100 kilometres', '8 to 10 kilometres', 'Several hours', 'More than 1,000 kilometres'], s3);
add(DET, 4, 'Which is NOT mentioned as an advantage of electric motorbikes?', ['They are faster than cars.', 'They are quiet.', "They don't produce exhaust fumes.", 'They are cheaper to run.'], s3);
add(DET, 3, 'The word "they" in paragraph 3 ("or they can damage the environment") refers to ___.', ['old batteries', 'charging stations', 'electric motorbikes', 'experts'], s3);
add(PARA, 3, 'The word "alternative" in paragraph 1 is closest in meaning to ___.', ['another choice', 'a problem', 'a rule', 'a price'], s3);
add(INF, 4, "What is the writer's attitude towards electric motorbikes?", ['Generally positive', 'Completely negative', 'Not interested', 'Angry'], s3);

const CHESS_STORY = `When Minh was eight years old, his grandfather taught him how to play chess on an old wooden board. At first, Minh lost every game, but he never gave up. He practised every evening after finishing his homework, and slowly he began to understand the game.

By the age of twelve, Minh was winning games against adults in his neighbourhood. His teacher noticed his talent and encouraged him to join the school chess club. There, he learned new strategies and made friends with other young players. A year later, he won first prize in a city competition.

Minh says that chess has taught him much more than how to win games. "Chess teaches you to think before you act," he explains. "You have to plan ahead and learn from your mistakes." These skills have also helped him in his school subjects, especially maths.

Today, Minh spends some of his free time teaching chess to younger children at the community centre. He hopes that, like his grandfather, he can pass on his love of the game to others.`;
const s4 = { passage: CHESS_STORY, setId: 'hn-chess' };
add(DET, 1, 'Who first taught Minh to play chess?', ['His grandfather', 'His teacher', 'His father', 'A friend at the chess club'], s4);
add(DET, 2, 'What did Minh do when he lost games at first?', ['He kept practising.', 'He stopped playing.', 'He changed to another game.', 'He only played against adults.'], s4);
add(INF, 3, 'How old was Minh when he won the city competition?', ['Thirteen', 'Eight', 'Twelve', 'Fourteen'], { ...s4, explanation: 'He was twelve, and won "a year later" → thirteen.' });
add(PARA, 3, 'The word "talent" in paragraph 2 is closest in meaning to ___.', ['natural ability', 'money', 'hobby', 'problem'], s4);
add(DET, 3, 'According to Minh, what has chess taught him?', ['To plan ahead and learn from mistakes', 'To win every game', 'To play games instead of studying', 'To teach maths'], s4);
add(INF, 4, 'What can we infer about Minh?', ['He wants to help others enjoy chess.', 'He no longer plays chess.', 'He dislikes teaching.', 'He thinks chess is only for adults.'], s4);

// ── IELTS-style Academic Reading ──────────────────────────────
const IR = 'en.ielts.reading';
const TFNG = ['True', 'False', 'Not Given'];
const tfng = (answer: 'True' | 'False' | 'Not Given') => [answer, ...TFNG.filter((x) => x !== answer)];

const CHESS_HISTORY = `A  Chess is one of the oldest board games still played today. Most historians believe that it developed from a game called chaturanga, which was played in India around the sixth century AD. Chaturanga had pieces representing the four divisions of an ancient army: infantry, cavalry, elephants and chariots. These pieces later became the pawns, knights, bishops and rooks of the modern game.

B  From India, the game spread to Persia, where it became known as shatranj. When Arab armies conquered Persia in the seventh century, they adopted the game and took it with them across North Africa and into Spain. By the year 1000, chess was being played in many parts of Europe. Merchants and travellers also carried it eastwards, and different versions of the game developed in China, Japan and Korea.

C  The rules of chess did not stay the same. In the early European game, the queen could move only one square diagonally, and games were often very slow. Around the end of the fifteenth century, players in Spain and Italy began to allow the queen to move any distance in a straight line or diagonally. This made her the most powerful piece on the board and made the game much faster and more exciting. The new rules spread quickly, and they are essentially the rules we still use today.

D  For centuries, chess was associated with intelligence and strategy, and it was popular among royalty and the upper classes. In the nineteenth century, however, chess clubs and public tournaments made the game available to many more people. The first modern international tournament was held in London in 1851, and official world champions have been recognised since 1886.

E  In the twentieth century, a new kind of opponent appeared: the computer. Early chess programs were weak, but they improved rapidly as computers became more powerful. In 1997, a computer called Deep Blue, built by IBM, defeated the world champion Garry Kasparov in a six-game match. Many people saw this as a turning point in the relationship between humans and machines.

F  Today, chess is more popular than ever. Millions of people play online every day, and strong computer programs help players of all levels to study the game. Some schools have introduced chess lessons, believing that the game can improve concentration and problem-solving skills, although researchers still disagree about how large these benefits are.`;
const r1 = { passage: CHESS_HISTORY, setId: 'ielts-r-chess' };
const H1 = ['A game that travelled across continents', 'A change that made the game faster', 'From royal courts to public clubs', 'A machine beats a champion', 'Chess in the modern world', 'The cost of chess sets', 'Why chess is difficult to learn'];
const heading = (para: string, correct: string, headings: string[], d: number, base: object) =>
  add(IR, d, `Choose the correct heading for paragraph ${para}.`, [correct, ...headings.filter((h) => h !== correct).slice(0, 3)], base);
heading('B', H1[0], [H1[5], H1[1], H1[4], H1[6]], 3, r1);
heading('C', H1[1], [H1[6], H1[0], H1[2]], 3, r1);
heading('D', H1[2], [H1[5], H1[4], H1[0]], 4, r1);
heading('E', H1[3], [H1[1], H1[6], H1[4]], 3, r1);
add(IR, 3, 'Chaturanga included pieces that represented elephants. — True, False or Not Given?', tfng('True'), r1);
add(IR, 3, 'Chess arrived in Spain before it reached Persia. — True, False or Not Given?', tfng('False'), r1);
add(IR, 4, 'In the early European game, the queen was the strongest piece. — True, False or Not Given?', tfng('False'), r1);
add(IR, 5, 'The 1851 London tournament was won by a European player. — True, False or Not Given?', tfng('Not Given'), { ...r1, explanation: 'The passage gives the place and year, but not the winner.' });
add(IR, 5, 'Researchers agree that chess greatly improves concentration. — True, False or Not Given?', tfng('False'), { ...r1, explanation: '"researchers still disagree about how large these benefits are".' });
const typed = (d: number, prompt: string, answer: string, base: object, accept: string[] = []) => add(IR, d, prompt, [answer], { ...base, type: 'input', accept });
typed(3, 'Complete with NO MORE THAN TWO WORDS from the passage: In Persia, chess was known as ___.', 'shatranj', r1);
typed(4, 'Complete with NO MORE THAN TWO WORDS from the passage: The new rules for the queen first appeared in Spain and ___.', 'Italy', r1);
typed(4, 'Complete with a NUMBER: Official world champions have been recognised since ___.', '1886', r1);
typed(3, 'Complete with ONE WORD from the passage: Deep Blue was built by ___.', 'IBM', r1);

const VERTICAL = `A  By 2050, the world's population is expected to reach nearly ten billion people. Feeding all of them will be a huge challenge, especially as cities grow and good farmland becomes harder to find. One possible solution is vertical farming: growing crops indoors in tall stacks of shelves, often inside buildings in the middle of cities.

B  In a typical vertical farm, plants are not grown in soil. Instead, their roots sit in water that contains all the nutrients they need, a method known as hydroponics. Light comes from LED lamps, which can be adjusted to give each type of plant exactly the colour and amount of light it needs. Temperature and humidity are carefully controlled by computers, so crops can be grown all year round, whatever the weather outside.

C  Supporters of vertical farming point to several advantages. Because the water is recycled, these farms can use up to 95 per cent less water than traditional fields. Pesticides are rarely needed, since insects cannot easily get inside. In addition, food grown in the city does not have to travel long distances to reach shops, so it arrives fresher and with lower transport costs.

D  However, vertical farming also has serious drawbacks. The biggest is energy. Lighting and controlling the climate inside a building uses large amounts of electricity, and unless this comes from renewable sources, the farm may produce more greenhouse gases than an ordinary farm. Building costs are also very high. For these reasons, most vertical farms today grow only high-value crops such as lettuce, herbs and strawberries, rather than staple foods like rice or wheat.

E  Despite these problems, investment in vertical farming has grown quickly in recent years, and large vertical farms now operate in countries such as Japan, Singapore and the United States. Experts believe the technology will not replace traditional agriculture, but it could become an important part of the food supply in crowded cities, particularly as the cost of LED lighting and renewable energy continues to fall.`;
const r2 = { passage: VERTICAL, setId: 'ielts-r-farming' };
const H2 = ['A possible answer to a growing problem', 'How crops are grown without soil', 'The main disadvantages', 'A promising future in cities', 'Why farmers are leaving the countryside', 'The history of greenhouses', 'Recipes using vertical farm vegetables'];
heading('A', H2[0], [H2[4], H2[3], H2[5]], 3, r2);
heading('B', H2[1], [H2[5], H2[2], H2[6]], 3, r2);
heading('D', H2[2], [H2[0], H2[4], H2[3]], 4, r2);
heading('E', H2[3], [H2[6], H2[0], H2[5]], 4, r2);
add(IR, 3, 'Vertical farms usually grow plants in soil. — True, False or Not Given?', tfng('False'), r2);
add(IR, 3, 'LED lamps can be changed to suit different plants. — True, False or Not Given?', tfng('True'), r2);
add(IR, 4, 'Vertical farms in Singapore are bigger than those in Japan. — True, False or Not Given?', tfng('Not Given'), r2);
add(IR, 5, 'Vertical farms always produce fewer greenhouse gases than ordinary farms. — True, False or Not Given?', tfng('False'), { ...r2, explanation: '"the farm may produce more greenhouse gases than an ordinary farm".' });
add(IR, 4, 'Food from city farms needs to travel shorter distances to shops. — True, False or Not Given?', tfng('True'), r2);
typed(3, 'Complete with ONE WORD from the passage: Growing plants with their roots in nutrient-rich water is called ___.', 'hydroponics', r2);
typed(4, 'Complete with a NUMBER: Vertical farms can use up to ___ per cent less water.', '95', r2, ['ninety-five', 'ninety five']);
typed(4, 'Complete with ONE WORD from the passage: Because insects cannot easily get inside, ___ are rarely needed.', 'pesticides', r2);
typed(5, 'Complete with ONE WORD from the passage: Most vertical farms grow high-value crops such as lettuce, herbs and ___.', 'strawberries', r2);

// ── IELTS-style Listening ─────────────────────────────────────
const IL = 'en.ielts.listening';
type Line = { who: string; text: string };
const L1P1: Line[] = [
  { who: 'A', text: 'Good morning, Riverside Sports Camp. How can I help you?' },
  { who: 'B', text: "Hi. I'd like to book a place for my son on the summer camp, please." },
  { who: 'A', text: "Of course. Can I have your son's name?" },
  { who: 'B', text: "Yes, it's Daniel Hughes. That's H, U, G, H, E, S." },
  { who: 'A', text: 'Thank you. And how old is Daniel?' },
  { who: 'B', text: "He's fourteen. He'll be fifteen in August." },
  { who: 'A', text: 'Which activity is he interested in? We offer football, swimming, tennis and climbing.' },
  { who: 'B', text: 'Well, he enjoys swimming, but he really loves climbing, so climbing, please.' },
  { who: 'A', text: 'Great. The climbing course runs for two weeks, starting on the twelfth of July.' },
  { who: 'B', text: 'The twelfth. OK. And how much does it cost?' },
  { who: 'A', text: "It's one hundred and eighty pounds for the two weeks, including lunch." },
  { who: 'B', text: 'That\'s fine. Does he need to bring anything special?' },
  { who: 'A', text: 'Just comfortable clothes and a water bottle. We provide all the climbing equipment.' },
];
const l1a = { script: L1P1, setId: 'ielts-l1-p1', type: 'input' as const };
const form = (d: number, prompt: string, answer: string, base: object, accept: string[] = []) => add(IL, d, prompt, [answer], { ...base, accept });
form(3, 'Booking form — Child\'s surname: ___', 'Hughes', l1a);
form(2, 'Booking form — Age: ___', '14', l1a, ['fourteen']);
form(3, 'Booking form — Activity: ___', 'climbing', l1a);
form(3, 'Booking form — Start date: ___ July', '12', l1a, ['12th', 'twelfth', 'the twelfth']);
form(3, 'Booking form — Price for two weeks: £___', '180', l1a, ['one hundred and eighty']);
form(4, 'Booking form — Bring comfortable clothes and a ___', 'water bottle', l1a);

const L1P2: Line[] = [
  {
    who: 'C',
    text: "Welcome to the City Science Museum. Before you start, let me tell you a little about today's visit. The museum has four floors. On the ground floor you'll find the café and the gift shop. The space exhibition is on the first floor, and it's our most popular area, so I recommend going there early, before it gets crowded. The second floor is closed today for repairs, I'm afraid, so you won't be able to see the dinosaur collection. On the top floor there's an interactive area where you can do experiments yourself. Please remember that photography is allowed everywhere except in the planetarium. The museum closes at five thirty, but the café closes half an hour earlier. If you get lost, our staff are wearing green T-shirts, so just ask anyone in green. Enjoy your visit!",
  },
];
const l1b = { script: L1P2, setId: 'ielts-l1-p2' };
add(IL, 2, 'Which floor is the space exhibition on?', ['The first floor', 'The ground floor', 'The second floor', 'The top floor'], l1b);
add(IL, 3, "Why can't visitors see the dinosaur collection today?", ['Its floor is closed for repairs.', 'It is too crowded.', 'It has moved to another museum.', 'It only opens in the morning.'], l1b);
add(IL, 3, 'Where are visitors NOT allowed to take photos?', ['In the planetarium', 'In the café', 'In the space exhibition', 'In the gift shop'], l1b);
add(IL, 4, 'What time does the café close?', ['5.00', '5.30', '4.30', '6.00'], { ...l1b, explanation: 'The museum closes at 5.30; the café half an hour earlier.' });

const L2P1: Line[] = [
  { who: 'A', text: 'Hello, can I help you?' },
  { who: 'B', text: "Yes, I'd like to join the library, please." },
  { who: 'A', text: "Sure. I'll just fill in this form. What's your full name?" },
  { who: 'B', text: "Anna Kowalski. That's K, O, W, A, L, S, K, I." },
  { who: 'A', text: 'Thank you. And your address?' },
  { who: 'B', text: "It's twenty-seven Park Road." },
  { who: 'A', text: "Twenty-seven Park Road. What's your date of birth?" },
  { who: 'B', text: 'The fifth of March, two thousand and eleven.' },
  { who: 'A', text: 'Are you a student?' },
  { who: 'B', text: "Yes, I'm at Greenfield Secondary School." },
  { who: 'A', text: "Then membership is free. Adults pay fifteen pounds a year, but students don't pay anything. You can borrow up to eight books at a time, for three weeks." },
  { who: 'B', text: 'Can I borrow DVDs too?' },
  { who: 'A', text: "Yes, but only two at a time, and they're one pound each." },
];
const l2a = { script: L2P1, setId: 'ielts-l2-p1', type: 'input' as const };
form(3, 'Membership form — Surname: ___', 'Kowalski', l2a);
form(2, 'Membership form — Address: ___ Park Road', '27', l2a, ['twenty-seven', 'twenty seven']);
form(3, 'Membership form — Date of birth: ___ March 2011', '5', l2a, ['5th', 'fifth', 'the fifth']);
form(3, 'Membership form — School: ___ Secondary School', 'Greenfield', l2a);
form(3, 'Membership form — Maximum number of books at a time: ___', '8', l2a, ['eight']);
form(4, 'Membership form — Cost of borrowing one DVD: £___', '1', l2a, ['one']);

const L2P2: Line[] = [
  {
    who: 'C',
    text: "Good morning, listeners. This Sunday is the annual City Fun Run, and this year we're raising money for the children's hospital. The run starts at eight o'clock in Central Park, but please arrive at least thirty minutes early to collect your number. There are two routes: a short five-kilometre route for families and a ten-kilometre route for more experienced runners. Because of the run, Lake Street will be closed to traffic from seven until twelve, so drivers should use River Road instead. Water will be available every two kilometres, and there will be free fruit for all runners at the finish line. Last year more than three thousand people took part — let's make this year even bigger!",
  },
];
const l2b = { script: L2P2, setId: 'ielts-l2-p2' };
add(IL, 2, 'What is the money from the run for?', ["The children's hospital", 'A new park', 'A sports club', 'The city library'], l2b);
add(IL, 3, 'By what time should runners arrive?', ['7.30', '8.00', '7.00', '12.00'], { ...l2b, explanation: 'The run starts at 8.00; arrive at least 30 minutes early.' });
add(IL, 3, 'Which road will be closed to traffic?', ['Lake Street', 'River Road', 'Park Road', 'Central Street'], l2b);
add(IL, 3, 'What will runners get at the finish line?', ['Free fruit', 'A medal', 'A T-shirt', 'A free bus ticket'], l2b);

export const passageQuestions: Question[] = list;

/** Passage/recording groups used by the Exam Hall. */
export const PASSAGE_SETS = {
  'hn-reading': ['hn-sleep', 'hn-lantern', 'hn-ebikes', 'hn-chess'],
  cloze: ['cloze-volunteer', 'cloze-phones', 'cloze-hanoi', 'cloze-health', 'cloze-green'],
  'ielts-reading': ['ielts-r-chess', 'ielts-r-farming'],
  'ielts-listening': [
    ['ielts-l1-p1', 'ielts-l1-p2'],
    ['ielts-l2-p1', 'ielts-l2-p2'],
  ],
} as const;
