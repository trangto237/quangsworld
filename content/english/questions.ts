import { makeBank } from '../helpers';

const { add, list } = makeBank('Atlas original');

// ── Vocabulary: everyday ─────────────────────────────────────
const V = 'en.vocab.everyday';
add(V, 1, 'Which word means the meal you eat in the morning?', ['breakfast', 'dinner', 'supper', 'snack']);
add(V, 1, 'You keep your books and pens in your ___.', ['backpack', 'fridge', 'garage', 'pillow']);
add(V, 2, 'A person who looks after sick animals is a ___.', ['vet', 'pilot', 'chef', 'lawyer']);
add(V, 2, 'The opposite of "borrow" is ___.', ['lend', 'steal', 'keep', 'return']);
add(V, 3, 'If a shop is "crowded", it is ___.', ['full of people', 'closed for the day', 'very cheap', 'far away']);
add(V, 3, 'My brother is always on time. He is very ___.', ['punctual', 'generous', 'curious', 'nervous']);
add(V, 4, 'The train was cancelled, so we had to ___ our trip.', ['postpone', 'purchase', 'pretend', 'produce']);
add(V, 5, 'She was reluctant to speak. "Reluctant" means ___.', ['unwilling', 'excited', 'unable', 'forbidden']);

// ── Vocabulary: synonyms ─────────────────────────────────────
const S = 'en.vocab.synonyms';
add(S, 1, 'Choose the word closest in meaning to "big".', ['large', 'thin', 'soft', 'short']);
add(S, 1, 'Choose the word closest in meaning to "begin".', ['start', 'finish', 'wait', 'forget']);
add(S, 2, 'Choose the word closest in meaning to "rapid".', ['fast', 'quiet', 'heavy', 'late']);
add(S, 2, 'Choose the word closest in meaning to "difficult".', ['challenging', 'boring', 'simple', 'popular']);
add(S, 3, 'Choose the word closest in meaning to "increase".', ['rise', 'drop', 'remain', 'reduce']);
add(S, 3, 'Choose the word closest in meaning to "enormous".', ['huge', 'ancient', 'tiny', 'empty']);
add(S, 4, 'Choose the word closest in meaning to "decline" (as in "sales declined").', ['fall', 'refuse', 'grow', 'stabilise']);
add(S, 4, 'Choose the word closest in meaning to "essential".', ['vital', 'optional', 'expensive', 'obvious']);
add(S, 5, 'Choose the word closest in meaning to "mitigate".', ['lessen', 'worsen', 'ignore', 'measure']);
add(S, 5, 'Choose the word closest in meaning to "ubiquitous".', ['everywhere', 'unique', 'invisible', 'temporary']);

// ── Vocabulary: academic ─────────────────────────────────────
const A = 'en.vocab.academic';
add(A, 2, 'Scientists collected ___ to prove their theory.', ['evidence', 'furniture', 'weather', 'luggage']);
add(A, 3, 'Social media has a strong ___ on teenagers\' sleep.', ['impact', 'import', 'impulse', 'impress']);
add(A, 3, 'The results were ___: they changed the whole study.', ['significant', 'sufficient', 'similar', 'silent']);
add(A, 4, 'The government will ___ a new policy to reduce traffic.', ['implement', 'imply', 'inhabit', 'inherit']);
add(A, 4, 'An "approach" to a problem is a ___.', ['way of dealing with it', 'reason for it', 'result of it', 'person who solves it']);
add(A, 5, 'The study ___ that children who read more have larger vocabularies.', ['suggests', 'suggest', 'suggesting', 'suggestion']);
add(A, 5, 'A "hypothesis" is ___.', ['an idea that can be tested', 'a proven law', 'a type of chart', 'the final result']);

// ── Vocabulary: collocations ─────────────────────────────────
const C = 'en.vocab.collocations';
add(C, 1, 'Complete: ___ your homework.', ['do', 'make', 'take', 'play']);
add(C, 2, 'Complete: ___ a decision.', ['make', 'do', 'have', 'put']);
add(C, 2, 'Complete: ___ rain (a lot of rain).', ['heavy', 'strong', 'big', 'thick']);
add(C, 3, 'Complete: ___ attention to the teacher.', ['pay', 'give', 'take', 'make']);
add(C, 3, 'Complete: ___ a photo.', ['take', 'make', 'do', 'get']);
add(C, 4, 'Complete: The company needs to ___ a profit this year.', ['make', 'do', 'win', 'earn up']);
add(C, 5, 'Complete: The new law had a ___ effect on pollution (a very large effect).', ['dramatic', 'heavy', 'tall', 'wide']);

// ── Vocabulary: word forms ───────────────────────────────────
const W = 'en.vocab.word-forms';
add(W, 1, 'She sings ___. (beautiful)', ['beautifully', 'beautiful', 'beauty', 'beautify']);
add(W, 2, 'We need to make a ___ quickly. (decide)', ['decision', 'decide', 'decisive', 'decisively']);
add(W, 2, 'He was very ___ to help me. (kindness)', ['kind', 'kindly', 'kindness', 'kinded']);
add(W, 3, 'Pollution is ___ to health. (harm)', ['harmful', 'harmless', 'harmed', 'harmfully']);
add(W, 3, 'The ___ of the city grew fast. (populate)', ['population', 'popular', 'populated', 'populous']);
add(W, 4, 'Recycling helps to ___ waste. (minimum)', ['minimise', 'minimum', 'minimal', 'minimally']);
add(W, 4, 'There has been a lot of ___ about the new rules. (argue)', ['argument', 'arguable', 'argue', 'arguably']);
add(W, 5, 'The scientist\'s ___ changed medicine forever. (discover)', ['discovery', 'discoverer', 'discovered', 'discoverable']);

// ── Grammar: tenses ──────────────────────────────────────────
const T = 'en.grammar.tenses';
add(T, 1, 'I ___ to the cinema yesterday.', ['went', 'have gone', 'go', 'have went']);
add(T, 2, 'She ___ in Hanoi since 2019.', ['has lived', 'lived', 'lives', 'is living']);
add(T, 2, '___ you ever ___ sushi?', ['Have / eaten', 'Did / eat', 'Do / eat', 'Have / ate']);
add(T, 3, 'We ___ our homework yet.', ["haven't finished", "didn't finish", "don't finish", "hadn't finish"]);
add(T, 3, 'When I arrived, the film ___.', ['had already started', 'has already started', 'already starts', 'was already start']);
add(T, 4, 'By next June, I ___ English for five years.', ['will have studied', 'will study', 'have studied', 'am studying']);
add(T, 5, 'I ___ for two hours when she finally called.', ['had been waiting', 'have been waiting', 'was waited', 'waited']);

// ── Grammar: passive voice ───────────────────────────────────
const P = 'en.grammar.passive';
add(P, 1, 'English ___ in many countries.', ['is spoken', 'speaks', 'is speaking', 'spoke']);
add(P, 2, 'The Eiffel Tower ___ in 1889.', ['was built', 'built', 'is built', 'has built']);
add(P, 2, 'This cake ___ by my grandmother.', ['was made', 'made', 'was make', 'is making']);
add(P, 3, 'The results ___ next week.', ['will be announced', 'will announce', 'are announcing', 'announce']);
add(P, 3, 'Choose the passive: "Someone has stolen my bike."', ['My bike has been stolen.', 'My bike has stolen.', 'My bike was stealing.', 'My bike is stolen by someone has.']);
add(P, 4, 'The bridge ___ at the moment, so the road is closed.', ['is being repaired', 'is repairing', 'has repaired', 'is repaired being']);
add(P, 5, 'The report should ___ before Friday.', ['have been submitted', 'have submitted', 'be submitting', 'been submitted']);
add(P, 5, 'It ___ that the painting is worth millions.', ['is believed', 'believes', 'is believing', 'has believe']);

// ── Grammar: relative clauses ────────────────────────────────
const R = 'en.grammar.relative';
add(R, 1, 'The girl ___ lives next door is my friend.', ['who', 'which', 'where', 'whose']);
add(R, 2, 'This is the book ___ I told you about.', ['that', 'who', 'where', 'whose']);
add(R, 2, 'That\'s the café ___ we first met.', ['where', 'which', 'who', 'what']);
add(R, 3, 'The boy ___ bike was stolen called the police.', ['whose', 'who', 'which', "who's"]);
add(R, 4, 'My sister, ___ is a doctor, lives in Da Nang.', ['who', 'that', 'which', 'whom']);
add(R, 4, 'Which sentence is correct?', ['Hanoi, which is the capital, is busy.', 'Hanoi, that is the capital, is busy.', 'Hanoi which is the capital, is busy.', 'Hanoi, who is the capital, is busy.']);
add(R, 5, 'The professor, ___ research I read, is visiting us.', ['whose', 'whom', 'which', 'that']);

// ── Grammar: conditionals ────────────────────────────────────
const K = 'en.grammar.conditionals';
add(K, 1, 'If you heat ice, it ___.', ['melts', 'melted', 'would melt', 'will melted']);
add(K, 2, 'If it rains tomorrow, we ___ at home.', ['will stay', 'stayed', 'would stayed', 'stay will']);
add(K, 3, 'If I ___ a million dollars, I would travel the world.', ['had', 'have', 'will have', 'would have']);
add(K, 3, 'If I were you, I ___ harder.', ['would study', 'will study', 'studied', 'study']);
add(K, 4, 'If she had left earlier, she ___ the bus.', ["wouldn't have missed", "won't miss", "didn't miss", "wouldn't miss"]);
add(K, 5, 'If I had studied medicine, I ___ a doctor now.', ['would be', 'would have been', 'will be', 'had been'], {
  explanation: 'Mixed conditional: past condition → present result.',
});
add(K, 5, '___ I known about the test, I would have prepared.', ['Had', 'If', 'Would', 'Have']);

// ── Grammar: modals ──────────────────────────────────────────
const M = 'en.grammar.modals';
add(M, 1, 'You ___ wear a seatbelt. It\'s the law.', ['must', 'might', 'could', 'would']);
add(M, 2, 'You look tired. You ___ go to bed early.', ['should', 'must not', "can't", 'would']);
add(M, 3, 'He has a big house and three cars. He ___ be rich.', ['must', "can't", 'should', 'would']);
add(M, 3, 'She ___ be at school — it\'s Sunday!', ["can't", 'must', 'should', 'has to']);
add(M, 4, 'I\'m not sure where Nam is. He ___ be in the library.', ['might', 'must', "can't", 'has to']);
add(M, 5, 'The ground is wet. It ___ rained last night.', ['must have', 'must', 'should', "can't have"]);

// ── Grammar: comparatives ────────────────────────────────────
const G = 'en.grammar.comparatives';
add(G, 1, 'An elephant is ___ than a dog.', ['bigger', 'more big', 'biggest', 'more bigger']);
add(G, 1, 'This is the ___ day of the year.', ['hottest', 'hotter', 'most hot', 'hotest']);
add(G, 2, 'Maths is ___ than history for me.', ['more interesting', 'interestinger', 'most interesting', 'more interestinger']);
add(G, 2, 'My test result was ___ than yours.', ['worse', 'badder', 'more bad', 'worst']);
add(G, 3, 'He is not as tall ___ his brother.', ['as', 'than', 'like', 'so']);
add(G, 4, 'The ___ you practise, the ___ you get.', ['more / better', 'most / best', 'more / good', 'much / better']);
add(G, 5, 'Rice production was ___ higher in 2020 than in 2010.', ['significantly', 'significant', 'more significant', 'most significantly']);

// ── Listening: numbers ───────────────────────────────────────
const LN = 'en.listening.numbers';
add(LN, 1, 'What number did you hear?', ['15', '50', '51', '5'], { audio: 'The number is fifteen.' });
add(LN, 1, 'What time does the class start?', ['9:30', '9:13', '8:30', '10:30'], { audio: 'The class starts at half past nine.' });
add(LN, 2, 'How much does the ticket cost?', ['$40', '$14', '$44', '$4'], { audio: 'A single ticket costs forty dollars.' });
add(LN, 2, 'What is the date of the party?', ['12 March', '20 March', '12 May', '2 March'], { audio: 'The party is on the twelfth of March.' });
add(LN, 3, 'What is the room number?', ['316', '360', '613', '36'], { audio: 'Please go to room three one six on the third floor.' });
add(LN, 3, 'How is the surname spelled?', ['PARKER', 'BARKER', 'PARKA', 'PACKER'], { audio: 'My surname is Parker. P, A, R, K, E, R.' });
add(LN, 4, 'What is the phone number?', ['0913 578 246', '0930 578 246', '0913 587 246', '0913 578 264'], {
  audio: 'You can call me on oh nine one three, five seven eight, two four six.',
});
add(LN, 5, 'How many students joined in total?', ['113', '130', '103', '31'], {
  audio: 'Around ninety students signed up in the first week, and another twenty-three joined later, bringing the total to one hundred and thirteen.',
});

// ── Listening: details ───────────────────────────────────────
const LD = 'en.listening.details';
add(LD, 2, 'Which day is the meeting?', ['Wednesday', 'Tuesday', 'Thursday', 'Monday'], {
  audio: "Let's meet on Tuesday. Oh wait, I'm busy then. Let's make it Wednesday instead.",
});
add(LD, 2, 'What does the girl want to drink?', ['orange juice', 'coffee', 'milk', 'water'], {
  audio: "I don't really like coffee, and milk makes me sleepy. Could I have an orange juice, please?",
});
add(LD, 3, 'How will they travel to the museum?', ['by bus', 'by taxi', 'on foot', 'by train'], {
  audio: 'A taxi is too expensive and walking takes an hour, so we will take the number twelve bus.',
});
add(LD, 3, 'Where should students leave their bags?', ['in the lockers', 'in the classroom', 'at reception', 'on the bus'], {
  audio: 'Please do not bring bags into the exam room or leave them at reception. Use the lockers by the entrance.',
});
add(LD, 4, 'What is the main problem with the apartment?', ['it is noisy', 'it is expensive', 'it is small', 'it is far from school'], {
  audio: "The rent is fine and it's close to the school. It's a bit small, but honestly the real issue is the traffic noise all night.",
});
add(LD, 4, 'What time will the tour now begin?', ['2:45', '2:15', '3:00', '2:30'], {
  audio: 'The tour was planned for two fifteen, but because of the rain we will start thirty minutes later.',
});
add(LD, 5, 'Which item does the speaker say is NOT needed?', ['a tent', 'a torch', 'walking boots', 'a water bottle'], {
  audio: 'Bring walking boots and a torch, and of course a water bottle. Tents are provided at the campsite, so leave yours at home.',
});

// ── Listening: main idea ─────────────────────────────────────
const LM = 'en.listening.main-idea';
add(LM, 2, 'What is the speaker doing?', ['giving directions', 'ordering food', 'complaining', 'telling a story'], {
  audio: 'Go straight ahead, turn left at the bank, and the library is on your right.',
});
add(LM, 3, 'How does the speaker feel about the new park?', ['pleased', 'angry', 'worried', 'bored'], {
  audio: 'Since the new park opened, my kids play outside every day. It was the best thing the city has done in years.',
});
add(LM, 3, 'What is the purpose of the announcement?', ['to warn about a delay', 'to sell tickets', 'to welcome new staff', 'to describe the weather'], {
  audio: 'Attention passengers. The eight fifteen train to Hai Phong will depart forty minutes late due to a signal problem.',
});
add(LM, 4, 'What is the speaker\'s main point?', ['sleep helps memory', 'students should study at night', 'exams are too long', 'coffee improves memory'], {
  audio: 'Many students stay up late before exams, but research shows that the brain stores new information during sleep. A good night\'s rest may be the best revision.',
});
add(LM, 5, 'What is the lecturer mainly doing?', ['comparing two views', 'describing an experiment', 'telling a joke', 'summarising a novel'], {
  audio: 'Some economists argue tourism brings jobs and investment. Others point out the damage to local culture and environment. Today we will weigh both positions.',
});
add(LM, 5, 'What does the speaker suggest?', ['cities should plant more trees', 'people should buy air conditioners', 'trees are too expensive', 'summers are getting shorter'], {
  audio: 'Streets with trees can be up to five degrees cooler. Rather than relying on air conditioning, city planners could invest in green spaces.',
});

// ── Reading passages ─────────────────────────────────────────
const P1 =
  'Honeybees communicate through a "waggle dance". When a bee finds flowers, it returns to the hive and moves in a figure-of-eight pattern. The angle of the dance shows the direction of the food compared with the sun, while the length of the waggle tells other bees how far away it is.';
const P2 =
  'In the past, most Vietnamese teenagers learned English only at school. Today, many also learn through online videos, games and music. Teachers say students\' listening skills have improved noticeably, although writing remains a challenge for many learners.';
const P3 =
  'The city of Curitiba in Brazil became famous for its bus system. Instead of building an expensive underground railway, planners created special bus lanes and tube-shaped stations where passengers pay before boarding. As a result, buses move almost as quickly as trains at a fraction of the cost.';
const P4 =
  'Chess was once seen as a game for a small group of experts. However, since online platforms appeared, the number of players has grown dramatically. Some schools now use chess to teach planning and patience, and a few researchers claim it may improve maths results, although the evidence is still limited.';

const RM = 'en.reading.main-idea';
add(RM, 2, 'What is the passage mainly about?', ['how bees share information about food', 'why bees make honey', 'how flowers attract bees', 'the life cycle of a bee'], { passage: P1 });
add(RM, 3, 'Choose the best heading.', ['New ways of learning English', 'Why writing is easy', 'Vietnamese schools close', 'Games are bad for students'], { passage: P2 });
add(RM, 4, 'Choose the best heading.', ['A cheaper alternative to the metro', 'The history of Brazil', 'Why trains are faster than buses', 'Problems with public transport'], { passage: P3 });
add(RM, 5, 'The main idea of the passage is that chess ___.', ['has become more popular and is used in education', 'definitely improves maths', 'is only for experts', 'should replace maths lessons'], { passage: P4 });

const RP = 'en.reading.paraphrase';
add(RP, 2, 'Which sentence has the same meaning as "the length of the waggle tells other bees how far away it is"?', ['The duration of the movement shows the distance.', 'Longer bees fly further.', 'The dance shows the colour of the flower.', 'Bees measure the sun.'], { passage: P1 });
add(RP, 3, '"students\' listening skills have improved noticeably" means ___.', ['there has been a clear improvement in listening', 'students listen to teachers more', 'listening is still difficult', 'only a few students improved'], { passage: P2 });
add(RP, 4, '"at a fraction of the cost" means ___.', ['much more cheaply', 'at the same price', 'more expensively', 'without any cost'], { passage: P3 });
add(RP, 5, '"the evidence is still limited" is closest to ___.', ['there is not enough proof yet', 'the research is finished', 'researchers disagree strongly', 'the evidence is illegal'], { passage: P4 });

const RI = 'en.reading.inference';
add(RI, 3, 'What can we infer about bees?', ['They can sense the position of the sun.', 'They cannot see flowers.', 'They dance only at night.', 'They never return to the hive.'], { passage: P1 });
add(RI, 3, 'What can we infer about the students?', ['They spend time using English outside school.', 'They dislike school.', 'Their teachers do not use English.', 'They are excellent writers.'], { passage: P2 });
add(RI, 4, 'Why did planners probably choose buses?', ['Their budget was limited.', 'Brazilians dislike trains.', 'There was no traffic.', 'Buses were newer technology.'], { passage: P3 });
add(RI, 5, 'The writer\'s attitude to the maths claim is ___.', ['cautious', 'enthusiastic', 'angry', 'uninterested'], { passage: P4 });

const TF = 'en.reading.tfng';
add(TF, 3, '"The dance shows the direction of the food." — True, False or Not Given?', ['True', 'False', 'Not Given'], { passage: P1 });
add(TF, 4, '"Most teenagers now write better English than before." — True, False or Not Given?', ['False', 'True', 'Not Given'], { passage: P2, explanation: 'The text says writing remains a challenge.' });
add(TF, 4, '"Curitiba\'s bus stations are shaped like tubes." — True, False or Not Given?', ['True', 'False', 'Not Given'], { passage: P3 });
add(TF, 5, '"Chess is taught in every school in Vietnam." — True, False or Not Given?', ['Not Given', 'True', 'False'], { passage: P4 });
add(TF, 5, '"Curitiba\'s underground railway was completed in 1990." — True, False or Not Given?', ['False', 'True', 'Not Given'], { passage: P3, explanation: 'The city chose buses instead of building an underground railway.' });

export const englishQuestions = list;
