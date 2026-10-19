/**
 * Question types from the Hà Nội grade-10 entrance exam (regular public schools) that go beyond
 * vocabulary/grammar items: communication, signs & notices, sentence transformation, sentence
 * combination, ordering sentences, and cloze passages. All texts are original.
 */
import type { Question } from '@atlas/shared';
import { hashString, rng, shuffle } from '@atlas/shared';
import { makeBank, type ConceptSeed } from '../helpers';

export const examSkillConcepts: ConceptSeed[] = [
  {
    id: 'en.exam.communication',
    domain: 'Exam skills',
    skill: 'Communication',
    name: 'Everyday replies',
    missionName: 'Chatterbox Hall',
    description: 'Choosing the best reply in a short exchange: thanks, invitations, requests, apologies.',
    cefr: 'A2',
    lesson:
      'Match the function, not just the words. Thanks → "You\'re welcome." Invitation → "That\'s a great idea / I\'d love to." Request "Could you…?" → "Sure." Careful: "Do you mind…?" / "Would you mind…?" → "No / Not at all" means YES, you may.',
    examRefs: ['Hà Nội grade-10 exam: communication'],
  },
  {
    id: 'en.exam.signs',
    domain: 'Exam skills',
    skill: 'Signs & notices',
    name: 'Signs and notices',
    missionName: 'Signpost Valley',
    description: 'Understanding what a sign, label or short notice means.',
    cefr: 'A2',
    lesson: 'Signs use few words. "NO + -ing" = not allowed. "KEEP OFF" = don\'t walk on. "STAFF ONLY" = only workers. Choose the option that says the same thing in a full sentence.',
    examRefs: ['Hà Nội grade-10 exam: signs and notices'],
  },
  {
    id: 'en.exam.transformation',
    domain: 'Exam skills',
    skill: 'Rewriting',
    name: 'Sentence transformation',
    missionName: 'Mirror Scrolls',
    description: 'Choosing the sentence closest in meaning: tenses, passive, wish, too/enough, reported speech, comparison.',
    cefr: 'B1',
    prerequisites: ['en.grammar.tenses'],
    lesson:
      'Check meaning AND grammar. Common pairs: "started … ago" = "have … for"; "too … to" = "not … enough to"; "It\'s a pity …" = "I wish …"; "although + clause" = "despite + noun / V-ing"; "If … not" = "Unless …".',
    examRefs: ['Hà Nội grade-10 exam: sentence closest in meaning'],
  },
  {
    id: 'en.exam.combination',
    domain: 'Exam skills',
    skill: 'Rewriting',
    name: 'Sentence combination',
    missionName: 'Bridge of Clauses',
    description: 'Joining two sentences: relative clauses, although/because, so…that, conditionals, wish.',
    cefr: 'B1',
    prerequisites: ['en.grammar.relative'],
    lesson:
      'First decide the link between the two ideas: contrast (although), reason (because), result (so … that), condition (if), or extra information (who/which/whose). Then check the grammar — no repeated pronoun after which/who.',
    examRefs: ['Hà Nội grade-10 exam: sentence combination'],
  },
  {
    id: 'en.exam.arrange',
    domain: 'Exam skills',
    skill: 'Coherence',
    name: 'Ordering sentences',
    missionName: 'Story Puzzle',
    description: 'Putting sentences in order to make a dialogue, letter or paragraph.',
    cefr: 'B1',
    lesson:
      'Find the first sentence: a greeting, a question or the topic sentence. Then follow the links — a question is followed by its answer; words like "Firstly, Then, However, Finally" show the order; pronouns (it, they, there) refer back to something already mentioned.',
    examRefs: ['Hà Nội grade-10 exam: arranging sentences'],
  },
  {
    id: 'en.exam.cloze',
    domain: 'Exam skills',
    skill: 'Cloze',
    name: 'Cloze passages',
    missionName: 'Missing Pages',
    description: 'Filling numbered gaps in a passage: vocabulary, prepositions, linking words, word forms, relative pronouns.',
    cefr: 'B1',
    lesson: 'Read the whole sentence, not just the gap. Ask: which word class is missing? Is there a preposition or linking word that decides it? Then read the sentence again with your answer.',
    examRefs: ['Hà Nội grade-10 exam: cloze passage'],
  },
];

const { add, list } = makeBank('Atlas original', 'x')

// ── Communication ──────────────────────────────────────────────
const CM = 'en.exam.communication';
const comm = (d: number, a: string, b: string, line: string, choices: string[], explanation?: string) =>
  add(CM, d, `${a}: "${line}"\n${b}: "___"`, choices, { explanation });
comm(1, 'Lan', 'Mai', 'Thank you so much for your help.', ["You're welcome.", 'Yes, I do.', 'Me too.', 'Of course not.']);
comm(1, 'Nam', 'Hoa', 'Would you like a cup of tea?', ['Yes, please.', 'Yes, I like tea.', "I'm fine, thank you.", "You're welcome."]);
comm(1, 'Minh', 'Lan', 'How about going to the cinema tonight?', ["That's a great idea.", 'Yes, I am.', "No, I don't.", 'You are right.']);
comm(1, 'Hoa', 'Nam', "I've passed my driving test!", ['Congratulations!', 'Good luck!', 'Never mind.', "It doesn't matter."]);
comm(1, 'Tuan', 'Teacher', "I'm sorry I'm late.", ["That's all right. Sit down, please.", "You're welcome.", 'Congratulations.', 'Yes, please.']);
comm(1, 'Mai', 'Phong', 'Could you open the window, please?', ['Sure, no problem.', 'Yes, I could.', 'No, thanks.', "You're welcome."]);
comm(2, 'Mum', 'Linh', 'Good luck with your exam tomorrow!', ["Thanks. I'll do my best.", 'Congratulations!', "You're welcome.", "Don't mention it."]);
comm(3, 'Stranger', 'Nam', 'Do you mind if I sit here?', ['No, go ahead.', 'Yes, please sit down.', 'Never mind.', 'Thank you.'], '"Do you mind…?" → "No" means "it\'s OK, you can".');
comm(2, 'Lan', 'Hoa', "What a beautiful dress you're wearing!", ["Thank you. I'm glad you like it.", "You're welcome.", "I'm sorry.", "No, it isn't."]);
comm(2, 'Teacher', 'Quan', 'How often do you play football?', ['Twice a week.', 'For two hours.', 'Last Sunday.', 'With my friends.']);
comm(2, 'Reporter', 'Mr Ba', 'How long have you lived here?', ['For five years.', 'Five years ago.', 'Every five years.', 'In five years.']);
comm(2, 'Hung', 'Lan', 'Shall we meet at 7 p.m.?', ['OK, see you then.', "No, I don't.", "You're welcome.", 'Me neither.']);
comm(3, 'Mai', 'Nam', "I don't like spicy food.", ['Neither do I.', 'So do I.', 'I do too.', 'Me too do.']);
comm(2, 'Phong', 'Minh', 'I love playing chess.', ['So do I.', 'Neither do I.', "I don't too.", 'So am I.']);
comm(1, 'Linh', 'Tuan', 'Can I borrow your pen?', ['Sure, here you are.', 'Yes, you borrow.', 'No, thanks.', "You're welcome."]);
comm(2, 'Hoa', 'Lan', 'What do you think of the new library?', ["It's really modern and quiet.", 'I think so.', 'Yes, I do.', 'It was built in a year.']);
comm(1, 'Nam', 'Quan', "Let's take a break.", ["Good idea. I'm tired.", "I'm sorry to hear that.", 'Congratulations.', 'No, you take it.']);
comm(2, 'Mai', 'Linh', 'My grandmother is ill.', ["I'm sorry to hear that.", "That's a good idea.", 'Congratulations!', "You're welcome."]);
comm(3, 'Teacher', 'Hung', 'Would you mind closing the door?', ['Not at all.', 'Yes, please.', "You're welcome.", 'Never mind.'], '"Would you mind…?" → "Not at all" means "I\'m happy to do it".');
comm(2, 'Tourist', 'Lan', 'Excuse me, where is the nearest bus stop?', ['Go straight and turn left at the bank.', "It's a big bus.", 'I take the bus every day.', 'Yes, it is.']);
comm(2, 'Customer', 'Shop assistant', 'How much is this T-shirt?', ["It's 150,000 dong.", "It's cotton.", "It's very nice.", "It's size M."]);
comm(1, 'Minh', 'Hoa', "What's the weather like today?", ["It's sunny and warm.", 'I like sunny weather.', "It's Monday.", 'Yes, it is.']);
comm(3, 'Phong', 'Mai', 'I think we should recycle more.', ['I completely agree.', "You're welcome.", "That's very kind of you.", 'Me neither.']);
comm(1, 'Friends', 'Nam', 'Happy birthday, Nam!', ['Thank you.', 'Same to you.', 'Happy birthday to you too.', "You're welcome."]);
comm(1, 'Dad', 'Linh', 'Can you help me carry this box?', ['Of course.', "Yes, I can't.", 'No, thank you.', 'Never mind.']);
comm(2, 'Hoa', 'Tuan', 'Have a nice weekend!', ['Thanks, you too.', 'Yes, I have.', "That's right.", "I'm sorry."]);
comm(2, 'Lan', 'Quan', "Why don't we go cycling this afternoon?", ['Sounds great!', "Because it's hot.", "We don't go.", "Yes, we don't."]);
comm(3, 'Caller', 'Receptionist', 'Hello, may I speak to Mr Hung, please?', ["Hold on, please. I'll get him.", 'Yes, you may speak.', "No, you can't speak.", "I'm speaking English."]);
comm(2, 'Minh', 'Nam', 'What a boring film!', ['Yes, I almost fell asleep.', "Yes, it's exciting.", "You're welcome.", "I'm glad you like it."]);
comm(3, 'Mai', 'Hoa', 'Is it OK if I use your phone?', ['Sure, go ahead.', "No, I'm not.", "Yes, it's a phone.", "You're welcome."]);

// ── Signs & notices ────────────────────────────────────────────
const SG = 'en.exam.signs';
const sign = (d: number, text: string, choices: string[]) => add(SG, d, 'What does the sign or notice mean?', choices, { sign: text });
sign(1, 'NO SMOKING', ['You are not allowed to smoke here.', 'You can smoke here.', 'Cigarettes are sold here.', 'Smoking is good for you.']);
sign(1, 'KEEP OFF THE GRASS', ['Do not walk on the grass.', 'Cut the grass.', 'You can play on the grass.', 'The grass is for animals.']);
sign(1, 'WET PAINT', ["The paint is not dry yet, so don't touch it.", 'You can paint here.', 'It is raining.', 'Paint is sold here.']);
sign(2, 'SILENCE – EXAM IN PROGRESS', ['Be quiet because students are taking an exam.', 'The exam has finished.', 'You can talk loudly.', 'The exam room is empty.']);
sign(1, 'STAFF ONLY', ['Only people who work here can enter.', 'Staff must leave now.', 'Everyone can enter.', 'Customers should wait here.']);
sign(1, 'DO NOT FEED THE ANIMALS', ['You must not give food to the animals.', 'The animals are hungry.', 'Buy food for the animals here.', 'The animals will feed you.']);
sign(2, 'SALE – 50% OFF ALL SHOES', ['All shoes are half price.', 'Shoes cost 50,000 dong.', 'Only 50 shoes are left.', 'Shoes are not for sale.']);
sign(2, 'OUT OF ORDER', ['The machine is not working.', 'The machine is new.', 'Order food from this machine.', 'The machine is in the wrong place.']);
sign(1, 'PLEASE TURN OFF YOUR MOBILE PHONE', ['Switch off your phone here.', 'You can make calls here.', 'Mobile phones are sold here.', 'Charge your phone here.']);
sign(1, 'NO ENTRY', ['You must not go in.', 'This is the entrance.', 'Entry is free.', 'Enter quickly.']);
sign(2, 'SCHOOL AHEAD – SLOW DOWN', ['Drive slowly because there is a school nearby.', 'The school is closed.', 'Students must walk fast.', 'Park at the school.']);
sign(2, 'PLEASE QUEUE HERE', ['Wait in a line here.', 'Sit down here.', 'Pay here.', 'Ask questions here.']);
sign(3, 'CLOSED FOR REPAIRS', ['It is closed because something is being fixed.', 'It is closed forever.', 'Repairs are free.', 'It is open for repairs only.']);
sign(2, 'TAKE YOUR LITTER HOME', ['Take your rubbish with you when you leave.', 'Throw rubbish here.', 'Litter is collected here.', 'Leave your rubbish on the ground.']);
sign(3, 'FRAGILE – HANDLE WITH CARE', ['The contents can break easily.', 'The box is very heavy.', 'The box is empty.', 'Open the box with a knife.']);
sign(3, 'NO SWIMMING – DANGEROUS CURRENTS', ['Swimming here is not allowed because the water is dangerous.', 'You can swim if you are careful.', 'The water is too cold.', 'There is a swimming pool nearby.']);
sign(4, 'LIBRARY BOOKS MUST BE RETURNED WITHIN 14 DAYS', ['You can keep library books for up to two weeks.', 'You must return the books in 14 hours.', 'You can borrow 14 books.', 'The library opens in 14 days.']);
sign(3, 'FIRE EXIT – KEEP CLEAR', ['Do not block this door.', 'Leave the building now.', 'There is a fire here.', 'Keep this door locked.']);
sign(4, 'TICKETS MUST BE SHOWN ON REQUEST', ['Show your ticket if a staff member asks for it.', 'Buy your ticket on the bus.', 'Tickets are free.', 'Ask for a ticket at the door.']);
sign(4, 'CHILDREN UNDER 12 MUST BE ACCOMPANIED BY AN ADULT', ['Young children must come with a grown-up.', 'Children under 12 cannot enter.', 'Adults must be over 12.', 'Children can go in alone.']);
sign(2, 'PLEASE DO NOT DISTURB', ["Don't knock or come in.", 'Please clean the room.', 'The room is free.', 'Come in, please.']);
sign(3, 'DANGER – HIGH VOLTAGE', ['There is a risk of electric shock.', 'The lights are very bright.', 'The music is very loud.', 'There is a tall building here.']);
sign(3, 'SHOES MUST BE REMOVED BEFORE ENTERING', ['Take off your shoes before you go in.', 'Buy shoes before entering.', 'Wear your shoes inside.', 'Shoes are sold inside.']);
sign(4, 'LAST ADMISSION 4.30 P.M.', ['You cannot go in after 4.30 p.m.', 'It opens at 4.30 p.m.', 'It closes at 4.30 a.m.', 'Entry is free after 4.30 p.m.']);

// ── Sentence transformation ────────────────────────────────────
const TR = 'en.exam.transformation';
const tr = (d: number, given: string, choices: string[], explanation?: string) =>
  add(TR, d, `Choose the sentence closest in meaning to: "${given}"`, choices, { explanation });
tr(2, 'I started learning English five years ago.', ['I have learned English for five years.', 'I learned English for five years.', "I haven't learned English for five years.", 'I will learn English for five years.'], 'started … ago → have/has + V3 + for.');
tr(2, 'This is the first time I have visited Hue.', ['I have never visited Hue before.', 'I visited Hue many times before.', 'I have visited Hue once before.', "I won't visit Hue again."], 'the first time → never … before.');
tr(3, "It's a pity I can't speak French.", ['I wish I could speak French.', 'I wish I can speak French.', "I wish I couldn't speak French.", 'I can speak French well.'], 'Wish about the present → past form (could).');
tr(3, 'The test was so difficult that we couldn\'t finish it.', ['The test was too difficult for us to finish.', 'The test was easy enough for us to finish.', 'The test was too difficult for us to finish it.', 'We finished the test although it was difficult.'], 'too + adj + (for sb) + to V — no object "it" at the end.');
tr(2, 'He is too young to drive a car.', ['He is not old enough to drive a car.', 'He is old enough to drive a car.', 'He is young enough to drive a car.', 'He drives a car although he is young.'], 'too young = not old enough.');
tr(2, 'People speak English all over the world.', ['English is spoken all over the world.', 'English speaks all over the world.', 'English is speaking all over the world.', 'People are spoken English all over the world.'], 'Passive: be + V3.');
tr(3, "If you don't study hard, you will fail the exam.", ['Unless you study hard, you will fail the exam.', "Unless you don't study hard, you will fail the exam.", 'If you study hard, you will fail the exam.', "Unless you study hard, you won't fail the exam."], 'Unless = if … not (never use "unless … not").');
tr(3, 'Although it rained heavily, we went to school.', ['Despite the heavy rain, we went to school.', 'Because of the heavy rain, we went to school.', 'Despite it rained heavily, we went to school.', 'Although the heavy rain, we went to school.'], 'although + clause; despite + noun phrase.');
tr(3, '"I am tired," she said.', ['She said that she was tired.', 'She said that I was tired.', 'She said that she had tired.', 'She says that I am tired.'], 'Reported speech: am → was, I → she.');
tr(3, "I'm sad that I don't have a computer.", ['I wish I had a computer.', 'I wish I have a computer.', "I wish I didn't have a computer.", 'I have a computer.'], 'Wish about the present → past simple (had).');
tr(3, 'Nobody in my class is taller than Minh.', ['Minh is the tallest student in my class.', 'Minh is shorter than everybody in my class.', 'Everyone in my class is taller than Minh.', 'Minh is the shortest student in my class.']);
tr(2, 'I last saw her in 2022.', ["I haven't seen her since 2022.", 'I have seen her since 2022.', "I didn't see her in 2022.", "I haven't seen her for 2022."], 'last … in + time → haven\'t … since + time.');
tr(4, 'They are building a new hospital in our town.', ['A new hospital is being built in our town.', 'A new hospital is built in our town.', 'A new hospital has built in our town.', 'A new hospital is building in our town.'], 'Present continuous passive: is/are being + V3.');
tr(4, 'It took me two hours to finish my homework.', ['I spent two hours finishing my homework.', 'I spent two hours to finish my homework.', 'My homework spent two hours to finish.', 'I finished my homework two hours ago.'], 'It takes sb + time + to V = sb spends + time + V-ing.');
tr(2, "Let's go to the park.", ["Why don't we go to the park?", "Why don't we going to the park?", 'Why do we go to the park?', 'We went to the park.'], "Let's + V = Why don't we + V?");
tr(2, "She can't sing well.", ['She is not a good singer.', 'She is a good singer.', 'She sings very well.', 'She sings better than everyone.']);
tr(2, 'He runs faster than me.', ["I don't run as fast as him.", 'I run as fast as him.', "He doesn't run as fast as me.", 'I run faster than him.']);
tr(3, 'You should do more exercise.', ['If I were you, I would do more exercise.', 'If I am you, I will do more exercise.', "If I were you, I wouldn't do more exercise.", "You mustn't do more exercise."], 'Advice: If I were you, I would …');
tr(4, '"Do you like football?" he asked me.', ['He asked me if I liked football.', 'He asked me if did I like football.', 'He asked me do you like football.', 'He asked me if he liked football.'], 'Reported yes/no question: asked + if + statement order, tense back.');
tr(3, 'It is not necessary for you to bring food.', ["You don't have to bring food.", "You mustn't bring food.", 'You must bring food.', 'You have to bring food.'], "don't have to = not necessary; mustn't = not allowed.");
tr(3, "We didn't go out because it was cold.", ['It was too cold for us to go out.', 'It was cold enough for us to go out.', 'Although it was cold, we went out.', 'We went out because it was cold.']);
tr(4, 'How long have you had this bike?', ['When did you buy this bike?', 'How long did you buy this bike?', 'When have you bought this bike?', 'How long ago will you buy this bike?']);
tr(4, 'I prefer reading to watching TV.', ["I'd rather read than watch TV.", "I'd rather watch TV than read.", 'I prefer watching TV to reading.', 'I like reading less than watching TV.'], 'prefer V-ing to V-ing = would rather V than V.');
tr(5, 'My mother made me clean my room.', ['I was made to clean my room by my mother.', 'I was made clean my room by my mother.', 'My room made my mother clean.', 'My mother cleaned my room.'], 'make sb do → be made TO do (passive).');
tr(4, 'Hoa is the most intelligent student in the class.', ['No one in the class is as intelligent as Hoa.', 'Hoa is more intelligent than no one.', 'Everyone is more intelligent than Hoa.', 'Hoa is as intelligent as everyone.']);
tr(4, "I haven't been to the cinema for a month.", ['The last time I went to the cinema was a month ago.', 'I went to the cinema for a month.', 'I have been to the cinema since a month.', 'The first time I went to the cinema was a month ago.']);
tr(3, 'They will finish the project next week.', ['The project will be finished next week.', 'The project will finish them next week.', 'The project is finished next week.', 'The project will be finishing next week.'], 'Future passive: will be + V3.');
tr(4, "It's a long time since I saw him.", ["I haven't seen him for a long time.", 'I saw him for a long time.', 'I have seen him for a long time.', "It's a long time when I see him."]);
tr(5, "Mai can't swim, and her sister can't either.", ['Neither Mai nor her sister can swim.', 'Both Mai and her sister can swim.', 'Either Mai or her sister can swim.', "Mai can swim but her sister can't."], 'neither … nor = not … and not.');
tr(5, 'Because he was ill, he stayed at home.', ['Because of his illness, he stayed at home.', 'Because of he was ill, he stayed at home.', 'Despite his illness, he stayed at home.', 'Although he was ill, he stayed at home.'], 'because + clause; because of + noun.');

// ── Sentence combination ───────────────────────────────────────
const CB = 'en.exam.combination';
const cb = (d: number, a: string, b: string, choices: string[], explanation?: string) =>
  add(CB, d, `Choose the sentence that best combines: "${a} ${b}"`, choices, { explanation });
cb(2, 'The man is my uncle.', 'He is talking to my father.', ['The man who is talking to my father is my uncle.', 'The man which is talking to my father is my uncle.', 'The man whose talking to my father is my uncle.', 'The man is talking to my father is my uncle.']);
cb(2, 'I bought a book.', 'It is very interesting.', ['The book which I bought is very interesting.', 'The book who I bought is very interesting.', 'The book which I bought it is very interesting.', 'I bought a book whose is very interesting.'], 'No repeated "it" after which.');
cb(2, 'She was tired.', 'She kept working.', ['Although she was tired, she kept working.', 'Because she was tired, she kept working.', 'Despite she was tired, she kept working.', 'She was tired, so she kept working.'], 'Contrast → although.');
cb(1, 'It was raining.', 'We stayed at home.', ['Because it was raining, we stayed at home.', 'Although it was raining, we stayed at home.', 'It was raining, but we stayed at home.', 'Despite the rain, we stayed at home.'], 'Reason → because.');
cb(4, "He didn't study.", 'He failed the exam.', ["If he had studied, he wouldn't have failed the exam.", "If he studied, he wouldn't fail the exam.", 'If he had studied, he would have failed the exam.', "Unless he had studied, he wouldn't have failed the exam."], 'Past situation → third conditional.');
cb(3, 'The weather was very bad.', "We couldn't go out.", ["The weather was so bad that we couldn't go out.", "The weather was such bad that we couldn't go out.", "It was so bad weather that we couldn't go out.", "The weather was too bad that we couldn't go out."], 'so + adjective + that; such + (a) + adjective + noun + that.');
cb(4, "I don't have enough money.", "I can't buy a new phone.", ['If I had enough money, I could buy a new phone.', 'If I have enough money, I could buy a new phone.', 'If I had enough money, I can buy a new phone.', 'Unless I had enough money, I could buy a new phone.'], 'Present unreal → second conditional.');
cb(3, 'This is the village.', 'My father was born there.', ['This is the village where my father was born.', 'This is the village which my father was born.', 'This is the village where my father was born there.', 'This is the village who my father was born.']);
cb(3, 'The girl is very kind.', 'Her mother is a teacher.', ['The girl whose mother is a teacher is very kind.', 'The girl who mother is a teacher is very kind.', 'The girl whose her mother is a teacher is very kind.', "The girl's mother whose is a teacher is very kind."]);
cb(2, 'He is rich.', "He isn't happy.", ["Although he is rich, he isn't happy.", "Because he is rich, he isn't happy.", "He is rich, so he isn't happy.", "Despite rich, he isn't happy."]);
cb(4, 'She speaks English well.', 'She speaks French well too.', ['She speaks not only English but also French well.', 'She speaks either English or French well.', 'She speaks neither English nor French well.', 'She speaks English well but not French.']);
cb(4, "I'm sorry.", "I didn't come to your party.", ['I wish I had come to your party.', 'I wish I came to your party.', "I wish I didn't come to your party.", 'I wish I would come to your party.'], 'Regret about the past → wish + had + V3.');
cb(3, 'The film was very interesting.', 'We watched it twice.', ['The film was so interesting that we watched it twice.', 'The film was such interesting that we watched it twice.', 'It was such interesting film that we watched it twice.', 'The film was too interesting that we watched it twice.']);
cb(2, 'My bike is old.', 'It still works well.', ['Although my bike is old, it still works well.', 'Because my bike is old, it still works well.', 'My bike is old, so it still works well.', 'Despite my bike is old, it still works well.']);
cb(1, 'Nam got up late.', 'He missed the bus.', ['Because Nam got up late, he missed the bus.', 'Although Nam got up late, he missed the bus.', 'Nam got up late, but he missed the bus.', 'Nam missed the bus, so he got up late.']);
cb(3, 'You must hurry.', 'You will be late.', ["If you don't hurry, you will be late.", 'If you hurry, you will be late.', "Unless you don't hurry, you will be late.", "If you didn't hurry, you will be late."]);
cb(5, 'Ha Long Bay is beautiful.', 'Many tourists visit it every year.', ['Ha Long Bay, which many tourists visit every year, is beautiful.', 'Ha Long Bay, that many tourists visit every year, is beautiful.', 'Ha Long Bay, where many tourists visit it every year, is beautiful.', 'Ha Long Bay which many tourists visit every year it is beautiful.'], 'Commas → which (never "that").');
cb(3, 'He was very tired.', "He couldn't walk any further.", ['He was too tired to walk any further.', 'He was tired enough to walk any further.', 'He was so tired to walk any further.', "He was too tired that he couldn't walk any further."]);
cb(4, 'The children were playing football.', 'It started to rain.', ['While the children were playing football, it started to rain.', 'While it started to rain, the children played football.', 'When the children played football, it was starting to rain.', 'The children were playing football, so it started to rain.'], 'Longer action (past continuous) interrupted by a short one (past simple).');
cb(4, 'She practises every day.', 'She wants to win the competition.', ['She practises every day so that she can win the competition.', "She practises every day so that she can't win the competition.", 'She practises every day, so she wants to win the competition.', 'Although she wants to win the competition, she practises every day.'], 'Purpose → so that + can.');

// ── Ordering sentences ─────────────────────────────────────────
const AR = 'en.exam.arrange';
const LETTERS = 'abcdef';
/**
 * Lines are written in the correct order; letters are shuffled deterministically so the
 * answer is never simply "a – b – c – d – e". Wrong options are other (incoherent) orders.
 */
function arrange(d: number, kind: 'dialogue' | 'letter' | 'paragraph', lines: string[]) {
  const r = rng(hashString(lines[0]));
  const order = shuffle(lines.map((_, i) => i), r); // order[k] = line index shown at letter k
  const letterOf = (lineIdx: number) => LETTERS[order.indexOf(lineIdx)];
  const fmt = (seq: number[]) => seq.map(letterOf).join(' – ');
  const correct = fmt(lines.map((_, i) => i));
  const wrong = new Set<string>();
  // Hard items include a near-miss: the first two lines swapped.
  if (d >= 4) wrong.add(fmt([1, 0, ...lines.slice(2).map((_, i) => i + 2)]));
  while (wrong.size < 3) {
    const s = fmt(shuffle(lines.map((_, i) => i), r));
    if (s !== correct) wrong.add(s);
  }
  const passage = order.map((lineIdx, k) => `${LETTERS[k]}. ${lines[lineIdx]}`).join('\n');
  add(AR, d, `Choose the correct order to make a meaningful ${kind}.`, [correct, ...wrong], { passage, explanation: `Correct order: ${correct}.` });
}
arrange(1, 'dialogue', ['Mai: Hi, Nam. Are you free this Saturday?', 'Nam: Yes, I am. Why?', 'Mai: Would you like to go to the museum with me?', 'Nam: That sounds great! What time shall we meet?', "Mai: Let's meet at 9 a.m. at the bus stop."]);
arrange(2, 'dialogue', ['Tourist: Excuse me, how can I get to the post office?', 'Lan: Go straight ahead and turn right at the traffic lights.', 'Tourist: Is it far from here?', "Lan: No, it's only about five minutes on foot.", 'Tourist: Thank you very much.']);
arrange(3, 'dialogue', ['Waiter: Hello, Green Restaurant. How can I help you?', "Linh: I'd like to book a table for four, please.", 'Waiter: Certainly. For what time?', "Linh: At seven o'clock this evening.", 'Waiter: OK. Can I have your name, please?']);
arrange(2, 'dialogue', ["Lan: You look tired, Hoa. What's wrong?", 'Hoa: I stayed up late last night to finish my project.', 'Lan: Did you finish it?', 'Hoa: Yes, but I only slept for four hours.', 'Lan: You should go to bed early tonight.']);
arrange(3, 'dialogue', ['Phong: What do you usually do in your free time?', 'Quan: I often play chess with my grandfather.', 'Phong: Really? Is he good at it?', 'Quan: Yes, he almost always wins!', 'Phong: Maybe he can teach me one day.']);
arrange(4, 'dialogue', ['Shop assistant: Can I help you?', "Minh: Yes, I'm looking for a pair of trainers.", 'Shop assistant: What size do you wear?', 'Minh: Size 40, please.', 'Shop assistant: Here you are. Would you like to try them on?']);
arrange(3, 'letter', ['Thank you for your last letter — it was great to hear from you.', "I'm writing to tell you about my school trip last weekend.", 'We went to Ninh Binh and took a boat ride through the caves.', 'It was one of the best days I have ever had.', 'Write back soon and tell me your news!']);
arrange(4, 'letter', ["I'm writing to tell you that I can't come to class tomorrow.", 'I have a high temperature, and the doctor says I need to rest.', 'Could you please tell me which exercises I should do at home?', "I'll make sure I finish them before next week.", 'Thank you for your understanding.']);
arrange(4, 'letter', ['Are you free on Sunday afternoon?', "There's a new science exhibition at the museum.", 'My dad says he can drive us there.', 'We could leave at 2 p.m. and come back before dinner.', "Let me know by Friday if you'd like to come!"]);
arrange(4, 'paragraph', ['Plastic pollution is one of the biggest problems facing our planet.', 'Every year, millions of tonnes of plastic end up in the oceans.', 'Many sea animals eat this plastic by mistake and become ill.', 'To solve this problem, we should use less plastic in our daily lives.', 'For example, we can bring our own bags when we go shopping.']);
arrange(5, 'paragraph', ['Learning English has many benefits for teenagers.', 'Firstly, it helps them find information on the internet.', 'Secondly, it allows them to make friends with people from other countries.', 'Finally, good English can lead to better jobs in the future.', 'Therefore, students should try to practise English every day.']);
arrange(5, 'paragraph', ['Tet is the most important festival in Vietnam.', 'Weeks before Tet, families clean and decorate their houses.', 'Then, on the first day of the new year, people visit their relatives.', 'During these visits, children receive lucky money in red envelopes.', 'After the holiday, everyone returns to work and school with new hope.']);

// ── Cloze passages ─────────────────────────────────────────────
const CZ = 'en.exam.cloze';
/** A passage with gaps written as {{1}}; each gap becomes a question that shows the passage with that gap marked. */
function cloze(setId: string, d: number, text: string, gaps: string[][]) {
  gaps.forEach((choices, i) => {
    const n = i + 1;
    const passage = text.replace(/\{\{(\d)\}\}/g, (_m, k) => (+k === n ? `[(${k}) ___]` : `(${k}) ___`));
    add(CZ, d, `Choose the word that best fits gap (${n}).`, choices, { passage, setId });
  });
}
cloze(
  'cloze-volunteer',
  3,
  'Last summer, I joined a volunteer group in my neighbourhood. Every Saturday morning, we {{1}} the streets and parks near our houses. We also collected old clothes and books {{2}} children in poor areas. At first, I found the work quite {{3}} because I had to get up early. However, I soon realised how much our small actions could help others. I also made many new friends {{4}} shared the same interests as me. {{5}} the hot weather, we never gave up. Volunteering has taught me to be more {{6}} and to care about my community.',
  [['cleaned', 'made', 'did', 'built'], ['for', 'with', 'at', 'on'], ['tiring', 'tired', 'tire', 'tiredness'], ['who', 'which', 'whose', 'where'], ['Despite', 'Although', 'Because', 'However'], ['responsible', 'responsibility', 'responsibly', 'response']],
);
cloze(
  'cloze-phones',
  3,
  "Smartphones have become an important {{1}} of teenagers' lives. Many students use them {{2}} information for their homework. They also use apps to learn foreign languages and keep in {{3}} with friends. However, spending too much time on screens can be {{4}} for our health. It can cause eye problems and make it difficult to sleep. {{5}}, experts advise teenagers to limit their screen time to two hours a day. If we use our phones {{6}}, they can be very useful tools.",
  [['part', 'piece', 'side', 'member'], ['to find', 'finding', 'found', 'find'], ['touch', 'hand', 'mind', 'line'], ['harmful', 'harm', 'harmless', 'harmfully'], ['Therefore', 'However', 'Although', 'Because'], ['wisely', 'wise', 'wisdom', 'wiser']],
);
cloze(
  'cloze-hanoi',
  4,
  "Hanoi's Old Quarter is one of the most popular places for tourists {{1}} visit Vietnam. In the past, each of its streets was famous {{2}} a different product, such as silk, silver or paper. Today, visitors can walk around the narrow streets, try street food and buy souvenirs. The area is especially {{3}} in the evening, when the streets are full of people. One of the best {{4}} to explore the Old Quarter is by cyclo. If you visit Hanoi, don't {{5}} this unique place. It will give you an {{6}} experience.",
  [['who', 'which', 'where', 'whose'], ['for', 'of', 'with', 'about'], ['lively', 'living', 'alive', 'lives'], ['ways', 'roads', 'places', 'times'], ['miss', 'lose', 'forget', 'leave'], ['unforgettable', 'unforgettably', 'forget', 'forgetful']],
);
cloze(
  'cloze-health',
  3,
  "Staying healthy is not as difficult {{1}} many people think. First of all, you should eat plenty of fruit and vegetables and {{2}} fast food. Secondly, doing exercise regularly helps you keep fit and feel more {{3}}. You don't need to go to the gym; you can simply walk or cycle {{4}} school. Thirdly, it is important to get enough sleep. {{5}} you follow these simple tips, you will feel healthier and study better. Remember that health is the {{6}} valuable thing you have.",
  [['as', 'than', 'so', 'like'], ['avoid', 'prevent', 'protect', 'refuse'], ['energetic', 'energy', 'energetically', 'energise'], ['to', 'at', 'in', 'on'], ['If', 'Unless', 'Although', 'Until'], ['most', 'more', 'much', 'best']],
);
cloze(
  'cloze-green',
  4,
  'Our school started a green project last year. Students {{1}} trees and flowers around the playground and put recycling bins in every classroom. We also learned how to make compost {{2}} food waste. Thanks to the project, our school is now cleaner and more {{3}}. The project has also made students more {{4}} of environmental problems. Next year, we are planning to put solar panels on the roof {{5}} we can save energy. Everyone hopes that other schools will {{6}} our example.',
  [['planted', 'built', 'made', 'grown'], ['from', 'of', 'with', 'by'], ['beautiful', 'beauty', 'beautifully', 'beautify'], ['aware', 'awareness', 'unaware', 'awarely'], ['so that', 'because', 'although', 'unless'], ['follow', 'take', 'do', 'make']],
);

export const examSkillQuestions: Question[] = list;
