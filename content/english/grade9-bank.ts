import { hashString, rng, shuffle } from '@atlas/shared';
import { makeBank } from '../helpers';

/**
 * More grade 9 (thi vào 10 Hà Nội, ~B1) level questions, difficulty 3–5. All sentences are original.
 * choices[0] is the correct answer; every item explains the rule and why the trap is wrong.
 */
const { add, list } = makeBank('Atlas grade 9 bank', 'g9-');
const ex = (explanation: string) => ({ explanation });

// ── Grammar: modals ──────────────────────────────────────────
const M = 'en.grammar.modals';
add(M, 3, 'Students ___ use their phones during the exam. It is against the rules.', ["mustn't", "don't have to", "needn't", 'can'], ex('mustn\'t = it is not allowed. "don\'t have to / needn\'t" only mean it is not necessary.'));
add(M, 3, 'Tomorrow is a public holiday, so we ___ get up early.', ["don't have to", "mustn't", "can't", "shouldn't to"], ex('don\'t have to = not necessary. "mustn\'t" would mean getting up early is forbidden; modals never take "to".'));
add(M, 3, '___ I borrow your charger? My phone is almost dead.', ['Could', 'Must', 'Should', 'Would rather'], ex('Could / Can / May I…? asks for permission politely. Must and should are for obligation and advice.'));
add(M, 3, 'You ___ drink plenty of water when you play football in hot weather.', ['should', "shouldn't", "mustn't", "needn't"], ex('should + base verb gives advice. The negatives say the opposite of what makes sense here.'));
add(M, 3, 'My grandfather ___ swim very well when he was young, but now his legs are weak.', ['could', 'can', 'must', 'should'], ex('could is the past of can (ability in the past): "when he was young" is past time.'));
add(M, 3, "Lan has lived in London for ten years, so she ___ speak English fluently.", ['can', 'must to', 'should not', 'has'], ex('can + base verb = ability. "must to" is wrong: modals are never followed by "to".'));
add(M, 4, 'Look at those dark clouds. It ___ rain this afternoon, so take an umbrella.', ['might', "can't", "mustn't", 'needs'], ex('might = it is possible. "can\'t" means it is impossible, and "mustn\'t" is a rule, not a guess.'));
add(M, 4, "That ___ be Minh's bike. His is red, and this one is blue.", ["can't", 'must', 'might', 'should'], ex('can\'t = I am sure it is NOT true (deduction). His bike is red, so this blue one is certainly not his.'));
add(M, 4, 'Motorbike riders in Vietnam ___ to wear a helmet. It is the law.', ['have', 'must', 'should', 'can'], ex('have to + verb = obligation. "must to" is wrong because must is followed by the base verb without "to".'));
add(M, 4, 'You ___ bring food tomorrow. The school will provide lunch for everyone.', ["needn't", "mustn't", "can't", "shouldn't"], ex('needn\'t = it is not necessary. "mustn\'t" would mean bringing food is forbidden, which is not the message.'));
add(M, 4, "We'd better ___ now, or we will miss the last bus.", ['leave', 'to leave', 'leaving', 'left'], ex('had better (\'d better) + base verb, with no "to".'));
add(M, 4, 'You ___ have told me it was your birthday! I would have bought you a present.', ['should', 'must', 'can', 'need'], ex('should have + past participle = criticism of something that did not happen. "must have" is a deduction, not a complaint.'));
add(M, 5, "Nam didn't come to the match. He ___ been ill, but I'm not sure.", ['might have', 'must have', "can't have", 'should have'], ex('might have + V3 = a possible explanation about the past. "I\'m not sure" rules out must have (certain).'));
add(M, 5, 'Hoa got full marks in the test. She ___ studied very hard.', ['must have', "can't have", 'should have', 'might'], ex('must have + V3 = I am sure about the past. Full marks are strong evidence. "might" + "studied" is the wrong form.'));
add(M, 5, "I can't find my keys anywhere. I ___ them on the bus this morning.", ['may have left', 'must leave', 'should have left', 'can leave'], ex('may have + V3 = a possible past action. "should have left" would mean leaving them was the right thing to do.'));
add(M, 5, 'You ___ have bought a new dictionary — I had one you could use.', ["needn't", "mustn't", "couldn't", "shouldn't to"], ex('needn\'t have + V3 = you did it, but it was not necessary. "mustn\'t have" is not used for this.'));
add(M, 5, 'Which sentence is correct?', [
  "He can't have finished the project yet; he only started an hour ago.",
  "He mustn't have finished the project yet; he only started an hour ago.",
  "He can't finished the project yet; he only started an hour ago.",
  'He must have finish the project yet; he only started an hour ago.',
], ex('Negative deduction about the past = can\'t have + past participle. "mustn\'t" means "not allowed", not "surely not".'));

// ── Grammar: comparatives ────────────────────────────────────
const G = 'en.grammar.comparatives';
add(G, 3, 'Living in the countryside is ___ than living in Hà Nội.', ['more peaceful', 'peacefuller', 'most peaceful', 'more peacefuller'], ex('"peaceful" has three syllables → more + adjective. Never use -er and more together.'));
add(G, 3, "This year's Tết holiday was ___ than last year's — we had nine days off.", ['longer', 'more long', 'longest', 'the longer'], ex('Short adjective + -er + than: longer than.'));
add(G, 3, 'My new phone is not ___ expensive as my old one; it was only half the price.', ['as', 'more', 'so much', 'than'], ex('not as + adjective + as = less … than. "as" must appear on both sides.'));
add(G, 3, 'Of all the subjects at school, I think English is the ___ useful.', ['most', 'more', 'much', 'very'], ex('"Of all…" compares more than two things → the most + long adjective.'));
add(G, 3, 'The traffic in Hà Nội is getting ___ every year.', ['worse', 'badder', 'worst', 'more bad'], ex('bad → worse → worst (irregular). We compare with the year before, so we need the comparative "worse".'));
add(G, 3, 'Nam runs ___ than anyone else in our class.', ['faster', 'more fast', 'fastest', 'more faster'], ex('"fast" is short → faster than. "than" always goes with a comparative, not a superlative.'));
add(G, 4, 'Messi is one of the ___ footballers in the world.', ['greatest', 'greater', 'most great', 'great'], ex('one of the + superlative + plural noun: one of the greatest footballers.'));
add(G, 4, 'The ___ we leave, the less traffic we will meet.', ['earlier', 'more early', 'earliest', 'early'], ex('The + comparative …, the + comparative …: the earlier …, the less …. "early" → earlier (y → ier).'));
add(G, 4, 'My sister is ___ more patient than I am.', ['much', 'very', 'more', 'too'], ex('Use much / far / a lot before a comparative. "very" cannot modify a comparative.'));
add(G, 4, 'This exam was ___ difficult than the one we did last month, so most of us passed easily.', ['less', 'little', 'least', 'fewer'], ex('less + adjective + than = not as … as. "fewer" is only used with plural nouns.'));
add(G, 4, 'There are ___ students in my class this year than last year.', ['fewer', 'less', 'little', 'least'], ex('fewer + plural countable noun (students); less + uncountable noun (less time).'));
add(G, 4, 'Choose the sentence closest in meaning to: "No one in my family cooks as well as my mother."', [
  'My mother is the best cook in my family.',
  'My mother cooks worse than everyone in my family.',
  'My mother is a better cook than no one in my family.',
  'Everyone in my family cooks as well as my mother.',
], ex('"No one … as well as X" = X is the best. "than no one" is a double negative and is wrong.'));
add(G, 4, 'Choose the sentence closest in meaning to: "Hà Nội is not as hot as Hồ Chí Minh City in April."', [
  'Hồ Chí Minh City is hotter than Hà Nội in April.',
  'Hà Nội is hotter than Hồ Chí Minh City in April.',
  'Hồ Chí Minh City is not as hot as Hà Nội in April.',
  'Hà Nội is as hot as Hồ Chí Minh City in April.',
], ex('A is not as hot as B = B is hotter than A. Check which city is hotter before you choose.'));
add(G, 5, 'It is getting ___ to find a quiet place to study in the city.', ['more and more difficult', 'difficult and difficult', 'more difficult and difficult', 'most and most difficult'], ex('A change that keeps growing: more and more + long adjective (or -er and -er with short ones: hotter and hotter).'));
add(G, 5, 'Choose the sentence closest in meaning to: "I have never seen such a beautiful sunset."', [
  'This is the most beautiful sunset I have ever seen.',
  'This is a more beautiful sunset than I have never seen.',
  'I have seen more beautiful sunsets than this one.',
  'This sunset is the most beautiful I have never seen.',
], ex('never … such a = the + superlative + I have ever seen. Use "ever", not "never", after a superlative.'));
add(G, 5, 'The more time you spend on your phone at night, ___.', ['the worse you sleep', 'the badly you sleep', 'you sleep worse', 'the more bad you sleep'], ex('The + comparative …, the + comparative + subject + verb. Both halves need "the" and a comparative.'));
add(G, 5, 'This new laptop is twice ___ my old one, so it is hard to carry.', ['as heavy as', 'heavier as', 'as heavier as', 'more heavy than'], ex('twice / three times + as + adjective + as. Do not use -er inside as … as.'));
add(G, 5, 'The film was not nearly ___ exciting as the book, so I was disappointed.', ['as', 'so much', 'more', 'than'], ex('not nearly as … as = much less … than. The structure still needs as … as.'));

// ── Grammar: tenses ──────────────────────────────────────────
const T = 'en.grammar.tenses';
add(T, 3, 'My family ___ to Đà Nẵng three times so far.', ['has been', 'went', 'goes', 'had been'], ex('"so far" = up to now → present perfect: has been.'));
add(T, 3, 'While I ___ my homework, the power suddenly went off.', ['was doing', 'did', 'have done', 'am doing'], ex('A longer action in progress (past continuous) is interrupted by a short one (past simple).'));
add(T, 3, 'Minh and I ___ each other since we were in grade 6.', ['have known', 'know', 'knew', 'are knowing'], ex('since + a point in the past → present perfect. "know" is a state verb, so it is not used in the continuous.'));
add(T, 3, 'Look! The children ___ kites in the park.', ['are flying', 'fly', 'flew', 'have flown'], ex('"Look!" shows the action is happening now → present continuous.'));
add(T, 3, "I ___ my grandparents in Nam Định last Tết, but I'll visit them this year.", ["didn't visit", "haven't visited", "don't visit", "hadn't visited"], ex('"last Tết" is a finished time → past simple. Present perfect cannot be used with a finished time.'));
add(T, 3, 'According to the TV guide, the match ___ at 7.45 p.m. tomorrow.', ['starts', 'started', 'has started', 'was starting'], ex('Timetables and schedules use the present simple, even for the future.'));
add(T, 4, 'This is the first time I ___ a speech in English.', ['have given', 'give', 'gave', 'am giving'], ex('It is the first time + present perfect.'));
add(T, 4, 'By the time we got to the stadium, the match ___.', ['had already begun', 'already began', 'has already begun', 'was already begin'], ex('Action finished before another past action → past perfect (had + V3).'));
add(T, 4, 'Lan ___ for the entrance exam all week, so she looks exhausted.', ['has been studying', 'studied', 'is studied', 'had studied'], ex('Present perfect continuous: an activity that has continued up to now and has a visible result (she looks exhausted).'));
add(T, 4, 'I ___ this phone for two years, and it still works perfectly.', ['have had', 'had', 'am having', 'have'], ex('for + period up to now → present perfect. "had" would mean I no longer have it, but it "still works".'));
add(T, 4, "Don't call me at 8 tonight. I ___ my favourite show then.", ['will be watching', 'watch', 'have watched', 'watched'], ex('An action in progress at a time in the future → future continuous: will be + V-ing.'));
add(T, 4, 'Choose the sentence closest in meaning to: "We started learning English five years ago."', [
  'We have learnt English for five years.',
  'We learnt English for five years.',
  'We have learnt English since five years.',
  'We are learning English five years ago.',
], ex('started … ago = have + V3 + for. "since" needs a point in time (since 2021), not a period.'));
add(T, 4, 'Choose the sentence closest in meaning to: "The last time I ate phở was in March."', [
  "I haven't eaten phở since March.",
  'I have eaten phở since March.',
  "I didn't eat phở in March.",
  "I haven't eaten phở for March.",
], ex('The last time … was in X = haven\'t + V3 + since X. Use "for" with a length of time, not a month.'));
add(T, 5, 'Hardly had we sat down when the teacher ___ out the test papers.', ['handed', 'had handed', 'hands', 'has handed'], ex('Hardly had + subject + V3 … when + past simple: the second action happened immediately after the first.'));
add(T, 5, 'By the time you arrive at Nội Bài airport, our plane ___ off.', ['will have taken', 'takes', 'has taken', 'took'], ex('by the time + present simple, future perfect (will have + V3) for the action that will already be complete.'));
add(T, 5, 'Phong said that he ___ the film the night before.', ['had seen', 'has seen', 'sees', 'was seen'], ex('Reported speech moves back one tense: "I saw it last night" → he said he had seen it the night before.'));
add(T, 5, 'No sooner ___ home than it started to pour with rain.', ['had I got', 'I had got', 'have I got', 'I got'], ex('No sooner + had + subject + V3 + than … (inversion: had comes before the subject).'));
add(T, 5, 'When I came back from school, the kitchen smelled wonderful. Mum ___ all afternoon.', ['had been cooking', 'has been cooking', 'cooks', 'is cooking'], ex('Past perfect continuous: an activity that went on up to a moment in the past and explains what we noticed then.'));

// ── Grammar: relative clauses ────────────────────────────────
const R = 'en.grammar.relative';
add(R, 3, 'The teacher ___ taught us maths last year has moved to Hải Phòng.', ['who', 'which', 'whose', 'where'], ex('"who" is for people and here it is the subject of "taught".'));
add(R, 3, 'I still remember the day ___ I first went to secondary school.', ['when', 'where', 'which', 'who'], ex('"when" follows a time noun (the day, the year) and means "on which".'));
add(R, 3, 'Is this the phone ___ you bought online last week?', ['which', 'who', 'where', 'whose'], ex('"which" is for things. "where" is only for places.'));
add(R, 3, 'Hội An is the town ___ my parents spent their honeymoon.', ['where', 'which', 'who', 'when'], ex('"where" = in which. "which" would need a preposition: the town in which… / which … spent their honeymoon in.'));
add(R, 3, 'We visited a village ___ people make conical hats by hand.', ['where', 'which', 'what', 'when'], ex('After a place noun, with a full clause (people make hats) → where. "what" is never used after a noun.'));
add(R, 3, 'The students ___ won the science contest will travel to Singapore.', ['who', 'whose', 'which', 'where'], ex('People + subject of the verb "won" → who.'));
add(R, 4, 'Mr Hùng, ___ son plays for the national youth team, is our PE teacher.', ['whose', 'who', 'that', 'whom'], ex('"whose + noun" shows possession: his son → whose son. Commas → never "that".'));
add(R, 4, 'The Red River, ___ flows through Hà Nội, is very important for farming.', ['which', 'that', 'where', 'who'], ex('With commas (extra information) we never use "that". A river is a thing → which.'));
add(R, 4, 'The man to ___ I spoke at the reception desk was very helpful.', ['whom', 'who', 'that', 'which'], ex('After a preposition use "whom" for people ("which" for things), never "who" or "that".'));
add(R, 4, 'Choose the sentence that best combines: "My best friend lives in Đà Lạt. I often send her postcards."', [
  'My best friend, to whom I often send postcards, lives in Đà Lạt.',
  'My best friend, that I often send postcards, lives in Đà Lạt.',
  'My best friend, who I often send her postcards, lives in Đà Lạt.',
  'My best friend, whose I often send postcards, lives in Đà Lạt.',
], ex('send postcards TO her → to whom. Commas → no "that"; the relative pronoun replaces "her", so do not repeat it.'));
add(R, 4, 'He failed the driving test three times, ___ surprised everyone.', ['which', 'that', 'what', 'who'], ex('", which" can refer to the whole previous clause. "that" and "what" cannot be used this way.'));
add(R, 4, 'The hotel ___ we stayed at was right next to Hoàn Kiếm Lake.', ['which', 'where', 'whose', 'who'], ex('The preposition "at" is already at the end, so use which/that. "where … at" says "at" twice.'));
add(R, 4, 'This is the reason ___ I decided to learn Korean.', ['why', 'which', 'where', 'what'], ex('the reason why = the reason for which.'));
add(R, 5, 'Ms Lan has three children, all of ___ are studying abroad.', ['whom', 'who', 'them', 'which'], ex('Quantity + of + whom (people) / which (things). "them" would make two sentences joined only by a comma.'));
add(R, 5, 'The old book, ___ cover was torn, was still worth reading.', ['whose', 'which', 'its', 'that'], ex('"whose" can be used for things too: its cover → whose cover.'));
add(R, 5, 'Choose the sentence that best combines: "Phong scored the winning goal. This made his team champions."', [
  'Phong scored the winning goal, which made his team champions.',
  'Phong scored the winning goal, that made his team champions.',
  'Phong scored the winning goal, what made his team champions.',
  'Phong, who made his team champions, he scored the winning goal.',
], ex('", which" refers to the whole idea before it (scoring the goal). Never use ", that" or ", what" here.'));
add(R, 5, 'Minh is always the first student ___ the classroom every morning.', ['to enter', 'who enter', 'enters', 'entered'], ex('After the first / the last / the only, a relative clause is often reduced to a to-infinitive: the first student to enter.'));
add(R, 5, 'The bridge ___ across the river last year has reduced traffic jams.', ['built', 'building', 'was built', 'which built'], ex('Reduced passive relative clause: which was built → built. "building" would mean the bridge built something.'));

// ── Grammar: conditionals ────────────────────────────────────
const K = 'en.grammar.conditionals';
add(K, 3, 'If you ___ your phone in class again, the teacher will take it away.', ['use', 'will use', 'used', 'would use'], ex('First conditional: If + present simple, will + verb. Never put "will" in the if-clause.'));
add(K, 3, 'If I ___ taller, I could join the school basketball team.', ['were', 'am', 'will be', 'have been'], ex('Second conditional (not true now): If + past simple; "were" is used for all persons.'));
add(K, 3, 'We will have a picnic by West Lake unless it ___.', ['rains', "doesn't rain", 'will rain', 'rained'], ex('unless = if … not, so it is followed by a positive verb: unless it rains = if it doesn\'t rain.'));
add(K, 3, 'I wish I ___ a bike so I could ride to school with my friends.', ['had', 'have', 'will have', 'am having'], ex('wish about the present → past simple: I wish I had (but I don\'t have one).'));
add(K, 3, 'If you mix blue and yellow paint, you ___ green.', ['get', 'got', 'would get', 'had got'], ex('Zero conditional (always true): If + present simple, present simple.'));
add(K, 3, 'What would you do if you ___ a wallet in the street?', ['found', 'find', 'will find', 'had found'], ex('Second conditional (imaginary situation): would + verb in the result, past simple in the if-clause.'));
add(K, 4, 'If we had left home earlier, we ___ stuck in the traffic jam.', ["wouldn't have got", "won't get", "didn't get", "wouldn't get"], ex('Third conditional (past, unreal): If + had + V3, would have + V3.'));
add(K, 4, 'I wish my brother ___ playing games so loudly at night. It keeps me awake.', ['would stop', 'stops', 'will stop', 'has stopped'], ex('wish + would + verb = we want someone else to change an annoying habit.'));
add(K, 4, 'If only I ___ harder for the last test! My score was terrible.', ['had studied', 'studied', 'study', 'would study'], ex('Regret about the past → If only / I wish + past perfect (had + V3).'));
add(K, 4, 'Choose the sentence closest in meaning to: "I don\'t know her phone number, so I can\'t call her."', [
  'If I knew her phone number, I could call her.',
  'If I know her phone number, I can call her.',
  'If I had known her phone number, I could call her.',
  'Unless I knew her phone number, I could call her.',
], ex('A present fact turned into an unreal condition → second conditional: If + past simple, could/would + verb.'));
add(K, 4, 'You can borrow my laptop ___ you promise to bring it back by Friday.', ['as long as', 'unless', 'although', 'in case of'], ex('as long as = only if. "unless" gives the opposite meaning, and "in case of" must be followed by a noun.'));
add(K, 4, 'Choose the sentence closest in meaning to: "If you don\'t hurry, you will be late for school."', [
  'Unless you hurry, you will be late for school.',
  "Unless you don't hurry, you will be late for school.",
  'If you hurry, you will be late for school.',
  "Unless you hurry, you won't be late for school.",
], ex('If … not = Unless + positive verb. Never use "unless" with "not" — that makes a double negative.'));
add(K, 4, 'Choose the sentence closest in meaning to: "Study hard, or you won\'t pass the entrance exam."', [
  "If you don't study hard, you won't pass the entrance exam.",
  "Unless you don't study hard, you won't pass the entrance exam.",
  "If you study hard, you won't pass the entrance exam.",
  'Unless you study hard, you will pass the entrance exam.',
], ex('Imperative + or = If you don\'t …, …. Check that the meaning stays logical.'));
add(K, 5, 'Choose the sentence closest in meaning to: "It\'s a pity I didn\'t go to the concert with you."', [
  'I wish I had gone to the concert with you.',
  'I wish I went to the concert with you.',
  'I wish I would go to the concert with you.',
  'If only I go to the concert with you.',
], ex('Regret about the past: It\'s a pity + past simple = I wish + past perfect (had + V3).'));
add(K, 5, '___ you need any help with your project, just send me a message.', ['Should', 'Would', 'Had', 'Were'], ex('Should + subject + verb = If + subject + present (a polite first conditional with inversion).'));
add(K, 5, '___ it not been for your advice, I would have made a big mistake.', ['Had', 'Were', 'If', 'Should'], ex('Inverted third conditional: Had it not been for … = If it hadn\'t been for … (would have + V3 in the result).'));
add(K, 5, "If Minh hadn't stayed up so late last night, he ___ so sleepy now.", ["wouldn't be", "wouldn't have been", "won't be", "hadn't been"], ex('Mixed conditional: past condition (had + V3) → present result (would + verb), shown by "now".'));
add(K, 5, 'Choose the sentence closest in meaning to: "Without the volunteers, the festival would not have been a success."', [
  "If it hadn't been for the volunteers, the festival wouldn't have been a success.",
  'If there were no volunteers, the festival will not be a success.',
  'Unless the volunteers had helped, the festival would be a success.',
  "If the volunteers hadn't come, the festival would have been a success.",
], ex('Without + noun = If it hadn\'t been for + noun (third conditional). The last option reverses the meaning.'));

// ── Grammar: passive voice ───────────────────────────────────
const P = 'en.grammar.passive';
add(P, 3, 'Thousands of trees ___ along the streets of Hà Nội every year.', ['are planted', 'plant', 'are planting', 'have planted'], ex('Trees do not plant themselves → passive. Present simple passive: am/is/are + V3.'));
add(P, 3, 'The new library ___ by the mayor last month.', ['was opened', 'opened', 'has opened', 'is opening'], ex('"last month" → past simple passive: was/were + V3. "by the mayor" shows who did the action.'));
add(P, 3, 'Choose the passive: "They will hold the school festival next Friday."', [
  'The school festival will be held next Friday.',
  'The school festival will hold next Friday.',
  'The school festival will be hold next Friday.',
  'The school festival is held next Friday.',
], ex('Future passive: will be + V3. hold → held (irregular past participle).'));
add(P, 3, 'All phones must ___ off before the exam starts.', ['be switched', 'switch', 'be switching', 'switched'], ex('Passive with a modal: modal + be + V3 (must be switched off).'));
add(P, 3, 'Bánh chưng ___ from sticky rice, pork and green beans.', ['is made', 'makes', 'is making', 'made'], ex('Present simple passive for a fact or process: is + V3. The cake does not make anything itself.'));
add(P, 3, "My bike ___ yet, so I'm walking to school this week.", ["hasn't been repaired", "hasn't repaired", "wasn't repaired", "isn't repairing"], ex('"yet" → present perfect. Passive: has/have been + V3.'));
add(P, 4, 'Choose the passive: "Workers are building a new metro line in Hà Nội."', [
  'A new metro line is being built in Hà Nội.',
  'A new metro line is building in Hà Nội.',
  'A new metro line has built in Hà Nội.',
  'A new metro line is been built in Hà Nội.',
], ex('Present continuous passive: am/is/are + being + V3.'));
add(P, 4, 'Plastic bags can ___ many times before they are thrown away.', ['be reused', 'reuse', 'reused', 'be reusing'], ex('Modal passive: can + be + V3.'));
add(P, 4, 'When we arrived, the classroom ___, so we had to wait outside.', ['was being cleaned', 'was cleaning', 'has been cleaned', 'cleaned'], ex('An action in progress in the past, in the passive: was/were + being + V3.'));
add(P, 4, 'I had my hair ___ at the barber\'s before Tết.', ['cut', 'to cut', 'cutting', 'be cut'], ex('Causative: have + object + V3 = someone else does it for you (cut → cut → cut).'));
add(P, 4, 'Choose the sentence closest in meaning to: "Nobody told me about the change of time."', [
  "I wasn't told about the change of time.",
  "I didn't tell about the change of time.",
  "I wasn't telling about the change of time.",
  'Nobody was told by me about the change of time.',
], ex('Nobody + positive verb → negative passive: I wasn\'t told. Do not add "by nobody".'));
add(P, 4, 'The final ___ because of the heavy rain, so we all went home.', ['was cancelled', 'cancelled', 'has cancelled', 'was cancelling'], ex('Someone cancelled the match → the match was cancelled (past simple passive).'));
add(P, 5, 'It is said ___ the Old Quarter once had thirty-six streets of craftspeople.', ['that', 'what', 'which', 'to'], ex('It is said / believed / reported + that + clause.'));
add(P, 5, 'Choose the sentence closest in meaning to: "People say that Hạ Long Bay is one of the most beautiful places in the world."', [
  'Hạ Long Bay is said to be one of the most beautiful places in the world.',
  'Hạ Long Bay is said being one of the most beautiful places in the world.',
  'Hạ Long Bay says to be one of the most beautiful places in the world.',
  'It said that Hạ Long Bay is one of the most beautiful places in the world.',
], ex('People say that S + V = S + is said + to-infinitive (or It is said that …).'));
add(P, 5, 'The thief is believed ___ the country last week.', ['to have left', 'to leave', 'leaving', 'having left'], ex('The action (last week) happened before the believing (now) → is believed + to have + V3.'));
add(P, 5, 'Choose the passive: "They gave my sister a prize for her painting."', [
  'My sister was given a prize for her painting.',
  'My sister was gave a prize for her painting.',
  'My sister has given a prize for her painting.',
  'My sister gave a prize for her painting.',
], ex('With two objects, the person usually becomes the subject: was given (V3 = given, not gave).'));
add(P, 5, 'Choose the sentence closest in meaning to: "It is reported that many students are under pressure before the exam."', [
  'Many students are reported to be under pressure before the exam.',
  'Many students report to be under pressure before the exam.',
  'Many students are reported being under pressure before the exam.',
  'It reports that many students are under pressure before the exam.',
], ex('It is reported that S + V (same time) = S + is/are reported + to + verb.'));
add(P, 5, 'This pagoda is thought ___ more than 500 years ago.', ['to have been built', 'to build', 'to be building', 'being built'], ex('Past action + passive meaning → is thought + to have been + V3.'));

// ── Vocabulary: everyday (B1 topics) ─────────────────────────
const V = 'en.vocab.everyday';
add(V, 3, 'We should put plastic bottles in the ___ bin so they can be made into new products.', ['recycling', 'rubbish', 'pollution', 'washing'], ex('A recycling bin collects things that will be made into something new; a rubbish bin is for waste that is thrown away.'));
add(V, 3, "I can't send you the photo because there is no Wi-Fi ___ here.", ['signal', 'sign', 'single', 'symbol'], ex('A Wi-Fi or phone "signal" is the connection. "sign" and "single" look similar but mean something else.'));
add(V, 3, 'Before an exam, I always ___ my notes one more time.', ['revise', 'remind', 'remember', 'repeat'], ex('revise = study again before a test. You "remind" another person; you don\'t "repeat" notes.'));
add(V, 3, 'You need a valid ___ to travel to another country.', ['passport', 'diploma', 'receipt', 'timetable'], ex('A passport is the travel document that proves who you are and where you are from.'));
add(V, 3, 'My little brother has a high ___, so Mum is taking him to the doctor.', ['temperature', 'heat', 'degree', 'warm'], ex('When you are ill we say "have a (high) temperature" (= a fever), not "have a heat".'));
add(V, 3, 'Which word means "a person who visits a place on holiday"?', ['tourist', 'resident', 'passenger', 'guide'], ex('A tourist visits for pleasure; a passenger is anyone travelling in a vehicle; a resident lives there.'));
add(V, 4, 'Cutting down forests is one of the main causes of ___ change.', ['climate', 'weather', 'temperature', 'season'], ex('"Climate change" = long-term change in the Earth\'s weather patterns. Weather is only day to day.'));
add(V, 4, 'Our class is going on a ___ trip to the Museum of Ethnology next week.', ['field', 'farm', 'ground', 'land'], ex('A "field trip" is a school visit to learn outside the classroom.'));
add(V, 4, 'The city is building more metro lines to reduce traffic ___.', ['congestion', 'connection', 'collection', 'construction'], ex('Traffic congestion = too many vehicles, so the roads are blocked. The other words only look similar.'));
add(V, 4, 'Choose the word closest in meaning to "eco-friendly".', ['not harmful to the environment', 'very expensive', 'made by hand', 'easy to use'], ex('eco = environment; -friendly = not harmful to. Eco-friendly products do little damage to nature.'));
add(V, 4, "My phone's ___ is almost flat, so I need to charge it.", ['battery', 'screen', 'memory', 'keyboard'], ex('You charge a battery. When it is "flat" it has no power left.'));
add(V, 4, 'I prefer ___ courses because I can study at home at my own speed.', ['online', 'offline', 'onboard', 'outdoor'], ex('Online courses happen on the internet, so you can study at home.'));
add(V, 5, 'Doctors say that a balanced ___ and regular exercise can prevent many diseases.', ['diet', 'menu', 'recipe', 'meal'], ex('Your "diet" is the food you usually eat. A recipe tells you how to cook one dish; a menu lists dishes in a restaurant.'));
add(V, 5, 'The government has new laws to protect ___ species such as the Asian elephant.', ['endangered', 'dangerous', 'extinct', 'harmful'], ex('Endangered = at risk of dying out. "Extinct" species are already gone, so they cannot be protected.'));
add(V, 5, 'What does "cyberbullying" mean?', ['using the internet to hurt or frighten someone', 'stealing money from a bank online', 'playing games for too long', 'a virus that damages computers'], ex('cyber = to do with the internet; bullying = repeatedly hurting or frightening someone weaker.'));
add(V, 5, 'Our flight was ___ for three hours because of a storm, so we waited at Nội Bài airport.', ['delayed', 'cancelled', 'missed', 'booked'], ex('delayed = happens later than planned. A cancelled flight does not happen at all, so "for three hours" does not fit.'));
add(V, 5, 'Solar and wind power are ___ sources of energy because they never run out.', ['renewable', 'reliable', 'removable', 'reusable'], ex('Renewable energy comes from sources that are naturally replaced. "reusable" is for objects like bags and bottles.'));
add(V, 5, 'Choose the word closest in meaning to "commute" (as in "My dad commutes to work by metro").', ['travel regularly to work or school', 'communicate', 'move house', 'compete'], ex('To commute = to make the same journey to work or school every day. Do not confuse it with "communicate".'));

// ── Vocabulary: collocations ─────────────────────────────────
const C = 'en.vocab.collocations';
add(C, 3, 'Complete: Please ___ the lights when you leave the room.', ['turn off', 'turn down', 'close', 'shut down'], ex('We "turn off / switch off" lights. "turn down" means make quieter or refuse; we "shut down" a computer.'));
add(C, 3, 'Complete: My dad ___ a lot of exercise to stay healthy.', ['does', 'makes', 'plays', 'goes'], ex('do exercise, do homework, do the housework. Use "play" with sports and games: play football.'));
add(C, 3, 'Complete: I ___ a mistake in my essay, so I lost two marks.', ['made', 'did', 'took', 'had'], ex('make a mistake, make a decision, make a plan. Never "do a mistake".'));
add(C, 3, 'Complete: We should ___ care of our grandparents when they get old.', ['take', 'make', 'have', 'pay'], ex('take care of = look after.'));
add(C, 3, 'Complete: Minh ___ his best in the final exam.', ['did', 'made', 'got', 'took'], ex('do your best = try as hard as you can.'));
add(C, 3, 'Complete: Can you ___ me a favour and hold my bag for a minute?', ['do', 'make', 'give', 'take'], ex('do someone a favour = help someone. Never "make a favour".'));
add(C, 4, 'Complete: The teacher asked us to ___ a presentation about air pollution.', ['give', 'say', 'tell', 'speak'], ex('give (or make) a presentation / a talk / a speech. "say" and "tell" do not take "presentation".'));
add(C, 4, 'Complete: A good friend always ___ their promises.', ['keeps', 'holds', 'saves', 'follows'], ex('keep a promise = do what you said you would. The opposite is "break a promise".'));
add(C, 4, 'Complete: Smoking can ___ serious harm to your lungs.', ['cause', 'make', 'bring', 'take'], ex('cause harm / damage / problems. We do not "make harm".'));
add(C, 4, 'Complete: Lan ___ a good impression on the interviewers.', ['made', 'did', 'took', 'got'], ex('make an impression on someone.'));
add(C, 4, 'Complete: There was ___ traffic on Giải Phóng Road, so I was late for school.', ['heavy', 'strong', 'big', 'crowded'], ex('heavy traffic = a lot of traffic (like heavy rain). A street can be crowded, but traffic is "heavy".'));
add(C, 4, 'Complete: Our team ___ the match 3–1.', ['won', 'beat', 'gained', 'earned'], ex('You WIN a match, game or prize; you BEAT a person or team (we beat them 3–1).'));
add(C, 5, 'Complete: The school has ___ steps to reduce plastic waste in the canteen.', ['taken', 'made', 'done', 'put'], ex('take steps / take action = do something to deal with a problem.'));
add(C, 5, 'Complete: The referee made a bad decision, and the player ___ his temper.', ['lost', 'missed', 'dropped', 'broke'], ex('lose your temper = suddenly become very angry. You "miss" a bus, not your temper.'));
add(C, 5, "Complete: I didn't want to ___ the risk of missing the train, so I left early.", ['run', 'make', 'do', 'go'], ex('run (or take) the risk of + V-ing = do something although something bad may happen.'));
add(C, 5, "Complete: The new park will ___ a big difference to local people's lives.", ['make', 'do', 'take', 'give'], ex('make a difference = have an important effect.'));
add(C, 5, 'Complete: You should ___ advantage of the summer holiday to improve your English.', ['take', 'make', 'get', 'have'], ex('take advantage of = use a good chance well.'));
add(C, 5, 'Complete: Many shops now ___ a discount to customers who bring their own bags.', ['offer', 'make', 'do', 'say'], ex('offer / give a discount. We do not "make a discount" in natural English.'));

// ── Vocabulary: word forms ───────────────────────────────────
const W = 'en.vocab.word-forms';
add(W, 3, 'The view from the top of Fansipan was ___. (amaze)', ['amazing', 'amazed', 'amazement', 'amazingly'], ex('-ing adjectives describe the thing that causes the feeling (the view); -ed adjectives describe how a person feels.'));
add(W, 3, 'She answered all the questions ___. (correct)', ['correctly', 'correct', 'correction', 'corrected'], ex('The gap describes HOW she answered (a verb) → adverb: correctly.'));
add(W, 3, 'My grandmother is very ___ about the history of Hà Nội. (knowledge)', ['knowledgeable', 'knowledge', 'knowing', 'knowledgeably'], ex('After "very" + linking verb "is" we need an adjective: knowledgeable (-able).'));
add(W, 3, 'There are many ___ between life in the city and life in the countryside. (differ)', ['differences', 'different', 'differently', 'differ'], ex('After "many" we need a plural noun: differences.'));
add(W, 3, 'Football is the most ___ sport in Vietnam. (popularity)', ['popular', 'popularity', 'popularly', 'popularise'], ex('the most + adjective + noun: the most popular sport.'));
add(W, 3, 'We felt ___ when our team lost the final. (disappoint)', ['disappointed', 'disappointing', 'disappointment', 'disappoint'], ex('People FEEL -ed (disappointed); the thing that causes it is -ing (a disappointing result).'));
add(W, 4, 'The ___ of the new bridge took three years. (construct)', ['construction', 'constructive', 'constructor', 'constructed'], ex('After "The … of" we need a noun for the action: construction. A "constructor" is a person or company.'));
add(W, 4, 'It is ___ to cross the road without looking. (danger)', ['dangerous', 'danger', 'dangerously', 'endanger'], ex('It is + adjective + to-infinitive: dangerous (-ous).'));
add(W, 4, 'Online lessons have made learning more ___ for students in rural areas. (access)', ['accessible', 'access', 'accessibly', 'accessibility'], ex('make + something + adjective: more accessible (= easier to get).'));
add(W, 4, "Many young people are ___ because they can't find a job. (employ)", ['unemployed', 'employed', 'employment', 'unemployment'], ex('After "are" we need an adjective; "can\'t find a job" tells us it must be negative → un- + employed.'));
add(W, 4, 'Tết is a time for family ___ and good food. (gather)', ['gatherings', 'gather', 'gathered', 'gatherer'], ex('"family" + noun: family gatherings (= meetings of relatives). A "gatherer" is a person.'));
add(W, 4, 'The teacher spoke ___ so that everyone in the hall could understand. (clear)', ['clearly', 'clear', 'clarity', 'clearness'], ex('The gap describes the verb "spoke" → adverb: clearly.'));
add(W, 5, 'We should use water more ___ to protect the environment. (economy)', ['economically', 'economic', 'economical', 'economist'], ex('economical = not wasteful → adverb economically (describes "use"). "economic" is about the economy.'));
add(W, 5, 'Her ___ to help poor children made everyone admire her. (willing)', ['willingness', 'willing', 'willingly', 'unwilling'], ex('Subject of the sentence after "Her" → noun: willingness (-ness).'));
add(W, 5, "Some parents think video games have a bad influence on children's ___. (behave)", ['behaviour', 'behave', 'behavioural', 'behaved'], ex('After a possessive (children\'s) we need a noun: behaviour.'));
add(W, 5, 'Scientists are worried about the ___ of many plant species. (appear)', ['disappearance', 'appearance', 'disappear', 'disappeared'], ex('After "the … of" we need a noun; "worried" shows a negative meaning → dis- + appear + -ance.'));
add(W, 5, 'Air pollution in big cities is becoming more and more ___. (worry)', ['worrying', 'worried', 'worry', 'worryingly'], ex('The pollution causes the feeling → -ing adjective: worrying.'));
add(W, 5, 'The city is trying to ___ people to use public transport. (courage)', ['encourage', 'courage', 'courageous', 'discourage'], ex('After "to" we need a verb: en- + courage. "discourage" gives the opposite meaning.'));

// ── Exam: communication ──────────────────────────────────────
const CM = 'en.exam.communication';
const comm = (d: number, a: string, b: string, line: string, choices: string[], explanation: string) =>
  add(CM, d, `${a}: "${line}"\n${b}: "___"`, choices, { explanation });
comm(3, 'Lan', 'Minh', 'Would you like to come to my birthday party on Saturday?', ["I'd love to. Thanks for inviting me.", 'Yes, I would like.', "No, I don't like.", "You're welcome."], 'Accept an invitation with "I\'d love to". "I would like" needs an object, and "You\'re welcome" answers thanks.');
comm(3, 'Nam', 'Hoa', "I'm sorry, I broke your ruler.", ["Never mind. I've got another one.", "You're welcome.", 'Congratulations!', "Yes, that's a good idea."], '"Never mind / It doesn\'t matter" accepts an apology. "You\'re welcome" only answers "Thank you".');
comm(3, 'Teacher', 'Phong', "You've made great progress this term, Phong.", ["Thank you. I've been practising a lot.", 'Never mind.', 'No problem.', "I'm sorry to hear that."], 'A compliment is answered with "Thank you" (and a little more information).');
comm(3, 'Mai', 'Linh', 'How about cycling to school instead of asking your dad to drive you?', ["Good idea! It's better for the environment.", "Yes, I'm cycling.", "I'm sorry to hear that.", 'Not at all.'], '"How about + V-ing?" is a suggestion → agree ("Good idea!") or refuse politely.');
comm(3, 'Customer', 'Waiter', 'Could I have the bill, please?', ['Certainly. Here you are.', 'Yes, you could.', "You're welcome.", 'No, thank you.'], 'A polite request is answered with "Certainly / Sure". Do not repeat the modal ("Yes, you could").');
comm(3, 'Hung', 'Tuan', 'Do you fancy watching the football match at my house tonight?', ['Sure! What time does it start?', 'Yes, I fancy.', 'I watch football every day.', 'It was a great match.'], '"Do you fancy + V-ing?" is an invitation. "Yes, I fancy" is not natural; accept with "Sure!" or "I\'d love to".');
comm(4, 'Lan', 'Hoa', 'Would you mind if I turned on the fan?', ["No, not at all. It's really hot.", 'Yes, of course. Go ahead.', 'Yes, I would. Go ahead.', 'Never mind.'], '"Would you mind if…?" asks "Is it a problem?" → "No / Not at all" means you agree. "Yes" means you DO mind.');
comm(4, 'Minh', 'Nam', "I'm afraid I can't come to your party.", ["What a pity! Maybe next time.", "That's a good idea.", 'Congratulations!', "You're welcome."], 'When someone refuses an invitation, show you are sorry: "What a pity / That\'s a shame".');
comm(4, 'Grandma', 'Quan', 'Let me help you with that heavy bag.', ["Thanks, that's very kind of you.", "You're welcome.", "Yes, I'd love to.", "I'm sorry to hear that."], 'An offer of help → thank the speaker: "That\'s very kind of you". "You\'re welcome" is the reply to thanks.');
comm(4, 'Phong', 'Mai', 'I think students should wear uniforms every day.', ["I'm afraid I don't agree. They aren't very comfortable.", 'Yes, I wear.', "That's very kind of you.", "Don't mention it."], 'An opinion → agree or disagree politely ("I\'m afraid I don\'t agree") and give a reason.');
comm(4, 'Tourist', 'Linh', 'Excuse me, is this seat taken?', ["No, it's free. Please sit down.", 'Yes, please sit here.', 'No, thanks.', "Yes, I'm taken."], '"Is this seat taken?" → "No" means it is free. "Yes, please sit here" contradicts itself.');
comm(4, 'Lan', 'Phong', 'Thank you for helping me with my English project.', ["Don't mention it. I enjoyed it.", 'Never mind.', "Not at all. I'm busy.", 'Yes, I did.'], '"Don\'t mention it / It\'s my pleasure" answers thanks. "Never mind" answers an apology.');
comm(5, 'Nam', 'Lan', "I've just won a scholarship to study in Australia!", ["Wow, that's fantastic news! Well done!", 'Good luck next time!', 'What a pity!', 'Never mind.'], 'Good news → congratulate ("Well done! / Congratulations!"). "Good luck next time" is for someone who failed.');
comm(5, 'Hoa', 'Mai', "I've got so much homework that I don't know where to start.", ['Why not make a list and do the hardest task first?', "Yes, you've got.", "That's very kind of you.", "I'm glad to hear that."], 'Someone has a problem → give advice: "Why not…? / Why don\'t you…? / You should…".');
comm(5, 'Teacher', 'Minh', "You'd better not use your phone in class, Minh.", ["Sorry, I won't do it again.", "Yes, I'd better.", "You're welcome.", "No, I hadn't."], 'A warning from a teacher → apologise and promise: "Sorry, I won\'t do it again."');
comm(5, 'Mum', 'Linh', 'Shall I make you some noodles?', ['That would be great, thanks.', 'Yes, you shall.', "No, you shan't.", "You're welcome."], '"Shall I…?" is an offer → accept ("That would be great") or refuse ("No, thanks. I\'m not hungry").');
comm(5, 'Hung', 'Nam', "I can't stand people who throw rubbish in the street.", ["Neither can I. It's so annoying.", 'So can I.', "Neither can't I.", "So can't I."], 'Agreeing with a negative sentence: Neither + auxiliary + subject (positive auxiliary): Neither can I.');
comm(5, 'Reporter', 'Mai', 'What do you think is the biggest problem in your neighbourhood?', ['Probably the noise from the traffic.', 'Yes, it is a big problem.', "I don't think so.", 'In my neighbourhood.'], 'A "What…?" question needs information (a thing), not yes/no or a place.');

// ── Exam: arrange (same format as exam-skills.ts) ────────────
const AR = 'en.exam.arrange';
const LETTERS = 'abcdef';
/** Lines in the correct order; letters are shuffled deterministically. Wrong options are other (incoherent) orders. */
function arrange(d: number, kind: 'dialogue' | 'letter' | 'paragraph', lines: string[]) {
  const r = rng(hashString(lines[0]));
  const order = shuffle(lines.map((_, i) => i), r);
  const letterOf = (lineIdx: number) => LETTERS[order.indexOf(lineIdx)];
  const fmt = (seq: number[]) => seq.map(letterOf).join(' – ');
  const correct = fmt(lines.map((_, i) => i));
  const wrong = new Set<string>();
  if (d >= 4) wrong.add(fmt([1, 0, ...lines.slice(2).map((_, i) => i + 2)]));
  while (wrong.size < 3) {
    const s = fmt(shuffle(lines.map((_, i) => i), r));
    if (s !== correct) wrong.add(s);
  }
  const passage = order.map((lineIdx, k) => `${LETTERS[k]}. ${lines[lineIdx]}`).join('\n');
  add(AR, d, `Choose the correct order to make a meaningful ${kind}.`, [correct, ...wrong], { passage, explanation: `Correct order: ${correct}.` });
}
arrange(3, 'dialogue', ['Linh: Hi, Quân. You look happy today!', 'Quân: I am! I got an A in my English test.', 'Linh: Congratulations! How did you prepare for it?', 'Quân: I watched English videos every evening.', 'Linh: Great idea. Maybe I should try that too.']);
arrange(3, 'dialogue', ['Receptionist: Good morning, Sunshine Dental Clinic.', "Mr Ba: Hello. I'd like to make an appointment, please.", 'Receptionist: Of course. Is Thursday morning OK for you?', "Mr Ba: I'm afraid I'm busy then. What about Friday?", 'Receptionist: Friday at 10 a.m. is free. See you then.']);
arrange(3, 'dialogue', ['Mum: Have you finished your homework, Nam?', 'Nam: Not yet. I still have some maths exercises.', 'Mum: Well, finish them before you play games.', 'Nam: OK. Can I play for an hour after that?', 'Mum: Yes, but no more than one hour.']);
arrange(3, 'letter', ['I hope you and your family are well.', 'I am writing to invite you to stay with us for Tết this year.', 'My mum will make bánh chưng, and we can watch the fireworks together.', 'Please ask your parents and tell me if they agree.', 'I hope to see you soon.']);
arrange(3, 'paragraph', ['There are many ways to keep our school clean.', 'First, students should never drop litter in the playground.', 'Second, each class can take turns to sweep the schoolyard.', 'Finally, we can plant more trees and flowers around the buildings.', 'If everyone helps, our school will become a greener and more pleasant place.']);
arrange(4, 'dialogue', ['Hoa: Excuse me, does this bus go to the Temple of Literature?', "Driver: No, it doesn't. You need the number 2.", 'Hoa: Where can I catch it?', 'Driver: At the stop across the road, next to the bank.', 'Hoa: Thank you very much.']);
arrange(4, 'dialogue', ['Phong: Did you watch the football match last night?', 'Minh: Of course! Vietnam played brilliantly.', 'Phong: I missed the second half. What was the final score?', 'Minh: We won 2–1. The winning goal came in the last minute.', 'Phong: Wow, I wish I had seen it!']);
arrange(4, 'letter', ['Thank you very much for the birthday present you sent me.', 'The book about space is really interesting.', 'I have already read half of it and learnt a lot about the planets.', 'When you come to Hà Nội next summer, I will lend it to you.', 'Thanks again, and say hello to your parents for me.']);
arrange(4, 'paragraph', ['Smartphones have changed the way teenagers learn.', 'With just a few taps, students can look up new words or watch lessons online.', 'However, phones can also be a big distraction.', 'Many students check social media when they should be studying.', 'Therefore, it is important to use phones wisely and limit screen time.']);
arrange(4, 'paragraph', ['My favourite place in Hà Nội is Hoàn Kiếm Lake.', 'It is located in the centre of the city, near the Old Quarter.', 'Every weekend, the streets around the lake are closed to traffic.', 'Then families and young people come there to walk, play games and listen to music.', 'For me, it is the best place to relax after a busy week at school.']);
arrange(5, 'dialogue', ['Interviewer: Why did you decide to become a volunteer?', 'Lan: I wanted to do something useful in my free time.', 'Interviewer: What kind of work do you do?', 'Lan: I teach English to children in a village near Hà Nội.', 'Interviewer: That sounds rewarding. Is it difficult?', 'Lan: Sometimes, but seeing the children improve makes it worth it.']);
arrange(5, 'dialogue', ['Nam: Mum, can I go camping with my classmates this weekend?', 'Mum: Who is going to look after you all?', 'Nam: Our form teacher, Ms Hằng, is coming with us.', 'Mum: All right. But you must call me when you arrive.', 'Nam: I promise I will. Thanks, Mum!']);
arrange(5, 'letter', ['I am writing to complain about the noise from the karaoke bar near my house.', 'Every night, the music continues until after midnight.', 'As a result, my family cannot sleep, and I find it hard to concentrate on my studies.', 'I would be grateful if you could ask the owner to close earlier.', 'I look forward to hearing from you.']);
arrange(5, 'paragraph', ['Air pollution in Hà Nội has become a serious problem in recent years.', 'One of the main causes is the huge number of motorbikes on the roads.', 'In addition, factories and building sites release a lot of dust into the air.', 'This dirty air can lead to breathing problems, especially for children and old people.', 'To protect our health, the city needs more public transport and more green spaces.']);
arrange(5, 'paragraph', ['Reading books brings teenagers many benefits.', 'To begin with, it helps them improve their vocabulary and writing skills.', 'Moreover, reading about different people and places makes them more open-minded.', 'Finally, a good book is a great way to relax and reduce stress.', 'For these reasons, students should spend at least twenty minutes reading every day.']);

// ── Reading: detail (passage + setId, as in passages.ts) ─────
const DET = 'en.reading.detail';

const METRO = `In 2021, Hà Nội opened its first metro line, Cát Linh – Hà Đông. The line is about 13 kilometres long and has twelve stations. Trains run from early in the morning until late in the evening. A single ticket costs between 8,000 and 15,000 dong, depending on the distance, and students can buy a cheaper monthly pass.

Before the metro opened, the same journey by bus could take more than an hour in the rush hour. Now it takes only about 25 minutes. Many passengers say that the trains are clean, cool and punctual. Some also enjoy the view of the city from the elevated tracks.

However, the metro still has some problems. Some stations are quite far from people's homes, so passengers have to walk or take a motorbike taxi to reach them. Moreover, there is not enough parking space near several stations. City planners hope that when more lines are completed, the metro will become a real alternative to private motorbikes.`;
const m1 = { passage: METRO, setId: 'g9-metro' };
add(DET, 3, 'How long is the Cát Linh – Hà Đông metro line?', ['About 13 kilometres', 'About 12 kilometres', 'About 25 kilometres', 'About 15 kilometres'], { ...m1, explanation: 'Paragraph 1: "The line is about 13 kilometres long and has twelve stations." 12 is the number of stations.' });
add(DET, 3, 'According to the passage, how long does the journey take by metro?', ['About 25 minutes', 'More than an hour', 'About 13 minutes', 'About 12 minutes'], { ...m1, explanation: 'Paragraph 2: "Now it takes only about 25 minutes." "More than an hour" was the bus journey.' });
add(DET, 4, 'Why do some passengers have to take a motorbike taxi?', ['Some stations are far from their homes.', 'The trains are too slow.', 'The tickets are too expensive.', 'The trains stop running at lunchtime.'], { ...m1, explanation: 'Paragraph 3: "Some stations are quite far from people\'s homes, so passengers have to walk or take a motorbike taxi."' });
add(DET, 4, 'Which of the following is NOT mentioned as a good point of the metro?', ['It is free for students.', 'It is clean.', 'It is punctual.', 'Passengers can enjoy the view of the city.'], { ...m1, explanation: 'Students can buy a cheaper monthly pass — the metro is not free. The other points are all in paragraph 2.' });
add(DET, 4, 'The word "them" in paragraph 3 ("to reach them") refers to ___.', ['stations', "people's homes", 'passengers', 'motorbike taxis'], { ...m1, explanation: 'Passengers walk or take a taxi to reach the stations, which are far from their homes.' });
add(DET, 5, 'According to the passage, what do city planners hope?', ['The metro will be a real alternative to motorbikes once more lines are built.', 'All buses will be replaced by trains next year.', 'Every home will have a parking space.', 'Metro tickets will soon become free.'], { ...m1, explanation: 'Last sentence: "when more lines are completed, the metro will become a real alternative to private motorbikes."' });

const GREEN = `Last year, Trang, a grade 9 student in Long Biên, noticed that her school canteen threw away hundreds of plastic cups and straws every day. She decided to do something about it. With three friends, she started a club called "Green Hands" and asked the head teacher for permission to run a campaign.

The club's first idea was simple: every student was asked to bring a reusable water bottle to school. To encourage them, the club put up posters and made short videos for the school's social media page. They also persuaded the canteen to sell drinks at a lower price to students who brought their own bottles.

The results were impressive. After three months, the number of plastic cups used in the canteen fell by about 70 per cent. Other schools in the district heard about the campaign and invited Trang to talk to their students. "At first, many people laughed at us," Trang says. "But small changes really can make a difference if everyone joins in."`;
const g1 = { passage: GREEN, setId: 'g9-green-hands' };
add(DET, 3, 'Why did Trang start the "Green Hands" club?', ['Her school canteen was throwing away a lot of plastic.', 'She wanted to sell water bottles.', 'Her head teacher told her to.', 'She wanted to become famous on social media.'], { ...g1, explanation: 'Paragraph 1: the canteen "threw away hundreds of plastic cups and straws every day", so she decided to act.' });
add(DET, 3, 'How many people started the club?', ['Four', 'Three', 'Seventy', 'Hundreds'], { ...g1, explanation: 'Trang started it "with three friends" → Trang + 3 = four people. Read numbers carefully.' });
add(DET, 4, 'What did the canteen agree to do?', ['Sell cheaper drinks to students with their own bottles', 'Stop selling drinks completely', 'Give every student a free bottle', 'Use paper cups instead of plastic ones'], { ...g1, explanation: 'Paragraph 2: the club "persuaded the canteen to sell drinks at a lower price to students who brought their own bottles".' });
add(DET, 4, 'The word "them" in paragraph 2 ("To encourage them") refers to ___.', ['students', 'posters', 'water bottles', 'the club members'], { ...g1, explanation: 'Look at the sentence just before: "every student was asked to bring…" — the club encouraged the students.' });
add(DET, 5, 'Which statement is TRUE according to the passage?', ['Plastic cup use in the canteen fell by about 70 per cent in three months.', 'The campaign stopped plastic use in the canteen completely.', 'Everyone supported the club from the beginning.', 'Trang visited other districts to sell bottles.'], { ...g1, explanation: '"fell by about 70 per cent" is not "completely", and Trang says "many people laughed at us" at first.' });

const FOOTBALL = `Đức has dreamed of becoming a professional footballer since he was six. Every afternoon after school, he practises with a youth team in Mỹ Đình. Training lasts two hours, and the coach pays attention not only to skills but also to fitness and teamwork.

Life is not easy for young players like Đức. He has to get up at 5.30 every morning to go running, and he often finishes his homework late at night. His parents support his dream, but they have one condition: his school results must not get worse. "If my marks drop, I'll have to stop training for a while," Đức explains.

So far, Đức has managed to balance football and study. Last season, his team reached the final of the city youth cup, and he scored in the semi-final. His teachers say that football has made him more disciplined and better at managing his time. Đức knows that only a few young players become professionals, but he says, "Even if I don't make it, I will never regret trying."`;
const f1 = { passage: FOOTBALL, setId: 'g9-football' };
add(DET, 3, 'What time does Đức get up every morning?', ['At 5.30', 'At 6.30', 'At 5.00', 'At 7.30'], { ...f1, explanation: 'Paragraph 2: "He has to get up at 5.30 every morning to go running."' });
add(DET, 3, 'How long does each training session last?', ['Two hours', 'Six hours', 'One hour', 'All afternoon'], { ...f1, explanation: 'Paragraph 1: "Training lasts two hours." Six is his age when the dream began.' });
add(DET, 4, "What is his parents' condition?", ['His school marks must not get worse.', 'He must become a professional player.', 'He must stop training at weekends.', 'He must score in every match.'], { ...f1, explanation: 'Paragraph 2: "they have one condition: his school results must not get worse."' });
add(DET, 4, 'According to his teachers, how has football changed Đức?', ['He has become more disciplined and better at managing his time.', 'He has become lazier at school.', 'He has stopped doing his homework.', 'He has become the coach of the team.'], { ...f1, explanation: 'Paragraph 3: "football has made him more disciplined and better at managing his time."' });
add(DET, 5, "What did Đức's team achieve last season?", ['It reached the final of the city youth cup.', 'It won the city youth cup.', 'It lost in the semi-final.', 'It became a professional team.'], { ...f1, explanation: 'Reaching the final is not the same as winning it — the passage never says who won. They won the semi-final, since they reached the final.' });
add(DET, 5, 'Which of the following is NOT true about Đức?', ['He is sure he will become a professional footballer.', 'He has wanted to be a footballer since he was six.', 'He trains for two hours after school.', 'He scored a goal in the semi-final.'], { ...f1, explanation: 'He "knows that only a few young players become professionals" and says "Even if I don\'t make it…", so he is not sure.' });

// ── Listening: numbers (audio, as in questions.ts) ───────────
const LN = 'en.listening.numbers';
add(LN, 3, 'How much does the ticket cost?', ['85,000 dong', '58,000 dong', '80,500 dong', '95,000 dong'], { audio: 'An adult ticket to the water park costs eighty-five thousand dong. Children under twelve pay less.', explanation: 'Eighty-five thousand = 85,000. Don\'t swap the digits.' });
add(LN, 3, 'What date did you hear?', ['23 November', '20 November', '23 September', '3 November'], { audio: 'Our school trip to Ba Vì will be on the twenty-third of November.', explanation: 'the twenty-third of November = 23 November.' });
add(LN, 3, 'What time did you hear?', ['6:45', '6:15', '7:45', '7:15'], { audio: 'The train to Lào Cai leaves at a quarter to seven in the morning.', explanation: 'A quarter to seven = 15 minutes before seven = 6:45.' });
add(LN, 4, 'What is the phone number?', ['0987 654 120', '0987 645 120', '0987 654 112', '0978 654 120'], { audio: 'My number is oh nine eight seven, six five four, one two oh.', explanation: '"oh" = 0. Write each digit as you hear it: 0987 654 120.' });
add(LN, 4, 'How is the surname spelled?', ['NGUYEN', 'NGUYEM', 'NGYUEN', 'NGUEYN'], { audio: "My surname is Nguyen. That's N, G, U, Y, E, N.", explanation: 'Write the letters in order: N-G-U-Y-E-N.' });
add(LN, 4, 'What number did you hear?', ['1,350', '1,315', '3,150', '1,530'], { audio: 'Exactly one thousand three hundred and fifty runners took part in the race around West Lake.', explanation: 'one thousand three hundred and fifty = 1,350. "fifty" (50), not "fifteen" (15).' });
add(LN, 5, 'How many visitors came in total?', ['2,700', '1,500', '1,200', '2,500'], { audio: 'On Saturday, about one thousand five hundred people visited the book fair, and on Sunday another twelve hundred came.', explanation: 'twelve hundred = 1,200. 1,500 + 1,200 = 2,700.' });
add(LN, 5, 'What time will it start now?', ['8:20', '7:50', '8:00', '8:30'], { audio: 'The concert was supposed to begin at ten to eight, but the singer is stuck in traffic, so it will start half an hour later.', explanation: 'Ten to eight = 7:50; half an hour later = 8:20.' });
add(LN, 5, 'How many more tickets were sold this year than last year?', ['150', '550', '400', '950'], { audio: 'Last year we sold four hundred tickets for the school play. This year, five hundred and fifty were sold.', explanation: '550 − 400 = 150. The question asks for the difference, not either number.' });

// ── Listening: details ───────────────────────────────────────
const LD = 'en.listening.details';
add(LD, 3, 'Where will they meet?', ['at the school gate', 'at the cinema', 'at the bus stop', "at Lan's house"], { audio: "Let's not meet at the bus stop; it's always too crowded. Let's meet at the school gate and walk to the cinema together.", explanation: 'The bus stop is rejected; the cinema is where they go afterwards. They meet at the school gate.' });
add(LD, 3, 'How will Minh get to the stadium?', ['by metro', 'by motorbike', 'by bus', 'on foot'], { audio: "My dad can't take me on his motorbike today, and the bus is always late, so I'll take the metro to the stadium.", explanation: 'Motorbike and bus are both ruled out; the final choice is the metro.' });
add(LD, 4, 'Which day did they finally choose?', ['Sunday', 'Saturday', 'Friday', 'Monday'], { audio: "How about Saturday for the class picnic? Oh no, some of us have extra classes on Saturday. And Friday is a school day, so let's go on Sunday.", explanation: 'Saturday and Friday are rejected. The last decision counts: Sunday.' });
add(LD, 4, 'What does the boy want to buy?', ['a pair of headphones', 'a phone case', 'a charger', 'a new phone'], { audio: 'I already have a phone case and a charger. What I really need is a pair of headphones for my online lessons.', explanation: 'He already HAS the case and charger. "What I really need is…" gives the answer.' });
add(LD, 4, 'Why was the football match cancelled?', ['the pitch was flooded', 'the players were ill', 'the referee was late', 'it was too hot'], { audio: "The players were all ready and the referee had arrived, but after last night's storm the pitch was completely flooded, so the match was cancelled.", explanation: 'Players and referee were ready; "but" introduces the real reason: the flooded pitch.' });
add(LD, 5, 'Which thing do the students NOT need to bring?', ['a dictionary', 'a pencil', 'an ID card', 'a water bottle'], { audio: "For tomorrow's exam, bring two pencils, your ID card and a bottle of water. Dictionaries are not allowed in the exam room.", explanation: 'Pencils, ID card and water are required. Dictionaries are not allowed, so students should not bring one.' });
add(LD, 5, 'Who will make the poster?', ['Hoa', 'Nam', 'Linh', 'the teacher'], { audio: "Nam was going to make the poster, but he's busy with football practice, so Linh offered. Then Linh got ill, so Hoa will do it instead.", explanation: 'The plan changes twice: Nam → Linh → Hoa. The last person named is the answer.' });
add(LD, 5, 'What is the main problem with the hotel?', ['the Wi-Fi does not work', 'it is too expensive', 'it is far from the beach', 'the room is small'], { audio: "The room is a bit small, but it's cheap and only two minutes from the beach. The only real problem is that the Wi-Fi doesn't work, so I can't do my online homework.", explanation: '"A bit small" is a minor point; "The only real problem is…" signals the answer.' });

export const englishGrade9Bank = list;
