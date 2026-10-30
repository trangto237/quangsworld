import type { IeltsPassage } from './ielts-reading';

/** Original IELTS-style Academic Reading passages (set A). All texts written for Atlas. */

const TIMEKEEPING: IeltsPassage = {
  id: 'timekeeping',
  title: 'Counting the hours',
  level: 3,
  paragraphs: [
    'For most of human history, nobody needed to know the exact time. People got up when the sun rose, ate when they were hungry and stopped work when it grew dark. Farmers divided the day roughly into morning, midday and evening, and that was enough for planting and harvesting. Yet as towns grew and life became more organised, the wish to measure time more precisely slowly turned into a need, and inventors spent thousands of years trying to meet it.',
    'The earliest devices relied on nature. More than three thousand years ago, the ancient Egyptians placed tall stones and rods in the ground and watched the length and direction of their shadows change during the day. These shadow clocks, the ancestors of the sundial, were simple and cheap, but they were useless at night and on cloudy days. Water clocks offered one solution. Water dripped through a small hole from one container into another, and marks on the side showed how much time had passed. Unfortunately, the water ran out more slowly as the container emptied, and it could even freeze in winter, so the readings were never completely reliable.',
    'The first mechanical clocks appeared in Europe towards the end of the thirteenth century, usually in church towers and monasteries, where monks had to pray at fixed hours. They were driven by heavy weights that slowly fell, while a device called an escapement allowed the gears to move forward in small, regular steps. These clocks were a remarkable achievement, but they had no minute hand and often gained or lost as much as a quarter of an hour in a single day. As a result, they had to be corrected regularly by checking them against a sundial, which meant that the old method was still needed to keep the new one honest.',
    'A great improvement came from a simple observation. In the late sixteenth century, the Italian scientist Galileo Galilei noticed that a swinging weight, or pendulum, takes almost exactly the same time for each swing, whether the swing is large or small. He never completed a clock based on this idea, but in 1656 the Dutch scientist Christiaan Huygens built the first working pendulum clock. Its error fell from many minutes a day to less than one minute, and within a few decades minute hands had become a normal feature of clock faces.',
    'Accurate time was not only a matter of convenience; at sea it could decide whether a ship survived. Sailors could find how far north or south they were by looking at the sun, but their longitude, or east–west position, was much harder to calculate. To work it out, a navigator had to know the exact time at his home port and compare it with the local time on board. Pendulum clocks were useless on a rolling ship, so in 1714 the British government offered a large prize for a practical solution. John Harrison, a carpenter from the north of England with no formal training, spent most of his life on the problem. His fourth sea clock, known as H4, was tested on a voyage to Jamaica in 1761 and lost only a few seconds during the journey.',
    'Even on land, time was surprisingly local until the nineteenth century. Each town kept its own local time, set by the sun, so noon in Bristol came about ten minutes later than noon in London. This hardly mattered when travel was slow, but it caused great confusion once railways connected the two cities, because a timetable could not follow a different clock at every station. During the 1840s, British railway companies began to use London time on all their lines, and in 1880 a single national time became law. Today, atomic clocks keep time so precisely that they would lose less than a second in millions of years, a level of accuracy the early clockmakers could hardly have imagined.',
  ],
  glossary: ['escapement: the part of a clock that lets the wheels turn one small step at a time', 'navigator: the person on a ship who plans its route'],
  headings: {
    items: [
      { para: 1, heading: 'Early devices and their weaknesses', why: 'Paragraph B describes shadow clocks ("useless at night") and water clocks ("never completely reliable"): early tools AND their problems. A heading only about Egypt would cover just one detail.' },
      { para: 2, heading: 'Machines that still depended on the sun', why: 'Mechanical clocks were impressive but "had to be corrected regularly by checking them against a sundial". The trap "minute hand" belongs to paragraph D.' },
      { para: 3, heading: 'A discovery that made clocks far more accurate', why: 'Galileo noticed the pendulum’s regular swing and Huygens used it, so the error "fell… to less than one minute". The minute hand is only a result mentioned at the end.' },
      { para: 4, heading: 'A practical problem for travellers at sea', why: 'The whole paragraph is about finding longitude on ships and Harrison’s sea clock. The prize is one detail, not the main idea.' },
      { para: 5, heading: 'From local times to a single national time', why: 'Towns kept their own sun time until railways forced Britain to adopt "a single national time". Atomic clocks are only a closing remark.' },
    ],
    distractors: ['The reward that was never paid', 'How farmers organised their working day', 'The invention of the minute hand'],
  },
  tfng: [
    { statement: 'The ancient Egyptians used shadows to measure the passing of the day.', answer: 'TRUE', why: 'They "watched the length and direction of their shadows change during the day". The statement is a simple paraphrase.' },
    { statement: 'Water clocks were more accurate than shadow clocks.', answer: 'NOT GIVEN', why: 'The passage gives the weaknesses of each device but never compares their accuracy. Do not decide from your own opinion.', d: 4 },
    { statement: 'The first mechanical clocks showed minutes as well as hours.', answer: 'FALSE', why: 'They "had no minute hand". The minute hand only became normal after the pendulum clock.' },
    { statement: 'Huygens was the first person to notice the regular swing of a pendulum.', answer: 'FALSE', why: 'Galileo noticed it "in the late sixteenth century"; Huygens later built the first working pendulum clock. The trap is the word "first", which belongs to the clock, not the observation.', d: 4 },
    { statement: 'Harrison worked on the problem of time at sea for many years.', answer: 'TRUE', why: 'He "spent most of his life on the problem".' },
    { statement: 'Bristol was the first city to change its clocks to London time.', answer: 'NOT GIVEN', why: 'Bristol is mentioned only as an example of local time being ten minutes behind London. The passage does not say which city changed first.', d: 4 },
  ],
  completion: [
    {
      kind: 'sentence',
      title: 'Clocks and their uses',
      limit: 2,
      gaps: [
        { text: 'In medieval clocks, the power came from ___ that gradually dropped.', answer: 'heavy weights', accept: ['weights'], why: '"They were driven by heavy weights that slowly fell". "Escapement" is wrong: it controlled the steps, it did not give the power.' },
        { text: 'To find their ___, sailors needed to know the exact time at home.', answer: 'longitude', why: '"their longitude, or east–west position, was much harder to calculate. To work it out, a navigator had to know the exact time at his home port".' },
        { text: 'Before the 1840s, every British town followed its own ___ based on the sun.', answer: 'local time', why: '"Each town kept its own local time, set by the sun". The trap "national time" is what came AFTER the railways, not before.' },
      ],
    },
  ],
};

const BEES: IeltsPassage = {
  id: 'bee-dance',
  title: 'The language of the hive',
  level: 4,
  paragraphs: [
    'A healthy honeybee colony may contain fifty thousand insects, and every day thousands of them leave the hive to collect nectar and pollen. Flowers, however, are scattered across the landscape, and they open and close at different times. A colony that waited for each forager to find food by chance would soon go hungry. Bees therefore need a way of telling one another where the best flowers are, and they must do so inside a dark, crowded hive, without words and largely without sight.',
    'The first person to explain how they manage this was the Austrian biologist Karl von Frisch. Over several decades in the first half of the twentieth century, he marked individual bees with small spots of paint, placed dishes of sugar water at measured distances from the hive and watched what happened through a glass-walled observation hive. He noticed that returning foragers often performed a lively circling movement on the honeycomb, which he called the round dance. This told other bees that food was close to the hive, but it did not seem to tell them in which direction to fly. When the food was farther away, the foragers performed a quite different movement, the waggle dance. For this work, von Frisch shared the Nobel Prize in 1973 with two other scientists who studied animal behaviour.',
    'In the waggle dance, the forager walks forward in a straight line on the vertical surface of the comb, shaking its body rapidly from side to side. It then loops back to its starting point, alternately to the left and to the right, and repeats the movement many times. The angle between this straight run and the vertical represents the angle between the food and the sun, so a run pointing straight up means "fly towards the sun". The length of time that the bee spends waggling indicates the distance: the longer the waggle, the farther the flowers. Because the sun moves across the sky, a bee that keeps dancing for an hour gradually changes its angle to keep the message correct.',
    'Not everyone was convinced. In the 1960s, a group of critics argued that the dance might be nothing more than a display of excitement. In their view, new foragers found the food simply by following the scent of the flowers that clung to the dancer’s body. The debate continued for years, because it was hard to separate the two kinds of information. A clever answer came from Dr Ingrid Solberg, a fictional engineer whose laboratory built a small robotic bee controlled by a computer. When the robot performed a waggle dance without any scent, bees still flew in the direction it indicated. Interestingly, the robot only succeeded when its tiny wings vibrated to produce a buzzing sound, suggesting that the dance is heard and felt as well as seen.',
    'The final piece of evidence came from tracking the flights themselves. A team led by Dr Pavel Novak, also fictional, glued tiny radar tags to the backs of bees that had just watched a dance and followed them across open fields. Most of the recruits flew almost directly to the area the dance described, which supported von Frisch. Yet very few landed on the food straight away. Instead, they covered the final few metres by searching in zigzags, probably following the scent of the flowers. The dance, in other words, brings bees to the right neighbourhood, while smell guides them to the right address.',
    'More recent studies have shown that the waggle dance is only one part of a wider system of signals. A forager that has been attacked at a flower, for example, may butt its head against dancers advertising the same place and give a short, high-pitched buzz. This so-called stop signal makes the dancers give up sooner, so that fewer bees are sent into danger. No single bee, not even the queen, directs this activity. Instead, thousands of small exchanges between individual workers allow the colony to shift its effort from poor flowers to rich ones within a few hours, behaving almost as if it were a single thinking animal.',
  ],
  glossary: ['nectar: the sweet liquid inside flowers that bees turn into honey', 'forager: a bee that leaves the hive to collect food'],
  features: {
    instruction: 'Matching features — Which person or group is this? A: Karl von Frisch, B: the critics of the 1960s, C: Dr Ingrid Solberg, D: Dr Pavel Novak’s team',
    options: ['Karl von Frisch', 'the critics of the 1960s', 'Dr Ingrid Solberg', 'Dr Pavel Novak’s team'],
    items: [
      { item: 'used a machine to imitate a dancing bee', answer: 'Dr Ingrid Solberg', why: 'Her laboratory "built a small robotic bee controlled by a computer". "Machine" paraphrases "robotic bee".' },
      { item: 'followed the routes taken by individual insects', answer: 'Dr Pavel Novak’s team', why: 'They "glued tiny radar tags" to bees and "followed them across open fields". Von Frisch also watched bees, but only inside the hive and at the dishes.' },
      { item: 'claimed that the dance might only show that a bee was excited', answer: 'the critics of the 1960s', why: 'They argued the dance "might be nothing more than a display of excitement".' },
      { item: 'identified two different dances for different distances', answer: 'Karl von Frisch', why: 'He named the round dance (food "close to the hive") and the waggle dance (food "farther away").' },
      { item: 'made individual insects easy to recognise', answer: 'Karl von Frisch', why: 'He "marked individual bees with small spots of paint". The trap is Novak’s radar tags: these were for tracking flights, not recognising bees in the hive.', d: 5 },
    ],
  },
  mc: [
    {
      question: 'According to von Frisch, what did the round dance tell other bees?',
      answer: 'that food could be found near the hive',
      wrong: ['the exact direction in which to fly', 'that the food was a long way from the hive', 'which kind of flower had produced the nectar'],
      why: 'The round dance "told other bees that food was close to the hive, but it did not seem to tell them in which direction". "A long way" describes the waggle dance.',
    },
    {
      question: 'What does the writer say about bees that dance for a long period?',
      answer: 'They alter their dance to allow for the movement of the sun.',
      wrong: ['They waggle for longer to show that the food is better.', 'They always point straight up towards the sun.', 'They stop dancing when the sun goes behind clouds.'],
      why: '"A bee that keeps dancing for an hour gradually changes its angle to keep the message correct." A longer waggle means a greater DISTANCE, not better food.',
    },
    {
      question: 'What did the experiment with the robotic bee show?',
      answer: 'Sound was a necessary part of the dance message.',
      wrong: ['Recruits needed the scent of flowers to follow the robot.', 'Bees paid no attention to a dancer that was not alive.', 'The robot recruited more bees than a real forager did.'],
      why: 'The robot "only succeeded when its tiny wings vibrated to produce a buzzing sound". It worked "without any scent", so the first option is the opposite. Real and robot bees are never compared.',
      d: 5,
    },
  ],
  completion: [
    {
      kind: 'flow-chart',
      title: 'How a waggle dance leads recruits to food',
      limit: 2,
      gaps: [
        { text: 'The dancer makes a straight run; its angle from ___ shows the direction of the food compared with the sun. →', answer: 'the vertical', accept: ['vertical'], why: '"The angle between this straight run and the vertical represents the angle between the food and the sun".' },
        { text: 'The time spent waggling shows the ___ to the flowers. →', answer: 'distance', why: '"The length of time that the bee spends waggling indicates the distance". "Direction" is shown by the angle, not the time.' },
        { text: 'Recruits fly to the general area, then find the food by searching ___.', answer: 'in zigzags', why: '"they covered the final few metres by searching in zigzags". The answer must fit after "searching", so "scent" does not work here.', d: 5 },
      ],
    },
  ],
  tfng: [
    { statement: 'Von Frisch received the Nobel Prize together with other researchers.', answer: 'TRUE', why: 'He "shared the Nobel Prize in 1973 with two other scientists".', d: 3 },
    { statement: 'The stop signal is mainly given by young worker bees.', answer: 'NOT GIVEN', why: 'The passage says a forager "that has been attacked" gives the signal, but says nothing about the age of the bees.' },
    { statement: 'The queen decides which flowers the foragers should visit.', answer: 'FALSE', why: '"No single bee, not even the queen, directs this activity." The colony shifts its effort through many small exchanges between workers.' },
  ],
};

const HEAT_ISLANDS: IeltsPassage = {
  id: 'urban-heat-islands',
  title: 'Why cities run hot',
  level: 3,
  paragraphs: [
    'Anyone who has left a city on a summer evening and driven into the countryside may have noticed the air becoming cooler. This is not imagination. Large towns and cities are usually warmer than the land around them, a pattern known as the urban heat island. The idea is not new. In the early nineteenth century, Luke Howard, a London chemist who studied the weather in his free time, compared his own records with those from villages outside the city and found that central London was regularly warmer. Today, measurements show that the difference is often one to three degrees Celsius during the day, but on calm, clear nights it can reach ten degrees or more in very large cities.',
    'The main cause lies in the materials that cities are made of. Roads, car parks and pavements are covered in dark asphalt, and buildings are made of concrete, brick and stone. These surfaces absorb a great deal of sunlight and store its energy as heat. In the countryside, the ground cools quickly once the sun goes down, but in a city the stored heat is slowly released throughout the evening and night. For this reason, the gap between urban and rural temperatures is usually largest not in the afternoon but in the hours after dark.',
    'A second cause is the lack of plants. Trees and grass cool the air around them by releasing water through their leaves, in much the same way as sweating cools the human body. In cities, much of the ground is sealed, and rainwater is carried away quickly through drains instead of soaking into the soil, so there is far less moisture available for cooling. Tall buildings make matters worse by blocking the wind that would otherwise carry warm air away. Finally, cities produce their own heat. Cars, factories and especially air conditioners throw out waste heat into the streets, so that the more people try to cool their homes, the warmer the outside air becomes.',
    'These extra degrees can have serious effects. Heat waves are more dangerous in cities than in rural areas because temperatures remain high at night, and the human body has no chance to recover. Elderly people and those with heart problems are most at risk. Higher temperatures also increase the demand for electricity and speed up the chemical reactions that produce some kinds of air pollution. The effects are not shared equally. In a survey of a fictional city called Westhaven, researchers found that poorer neighbourhoods, where there were few trees and many tightly packed buildings, were up to four degrees hotter on summer afternoons than wealthy districts with large gardens and tree-lined streets.',
    'Fortunately, there are several ways to cool a city. One of the simplest is to paint roofs white or cover them with light-coloured materials, which reflect sunlight instead of absorbing it. Another is to grow plants on roofs and walls. Above all, many experts recommend planting more trees, which provide shade as well as cooling the air. Dr Amara Osei, an invented scientist whose team placed temperature sensors across one city for a whole summer, found that a large park could lower the temperature not only inside the park itself but also in streets several hundred metres away. A number of small green spaces spread across a district, she found, could have a similar effect.',
    'None of these solutions is perfect. Trees take many years to grow, and in dry cities they need large amounts of water to survive. White roofs work well in hot climates, but in places with cold winters they can increase heating costs, because the building loses the warmth it would have gained from the sun. City planners therefore have to choose the right mix of measures for their own climate. As the world’s population becomes increasingly urban and summers grow hotter, these decisions are likely to affect the health and comfort of billions of people.',
  ],
  glossary: ['asphalt: a black, sticky material used to cover roads', 'rural: connected with the countryside'],
  tfng: [
    { statement: 'Luke Howard studied the weather as part of his job.', answer: 'FALSE', why: 'He was "a London chemist who studied the weather in his free time". Weather was his hobby, not his job.' },
    { statement: 'Cities are usually warmer than the countryside by the greatest amount after the sun has set.', answer: 'TRUE', why: '"the gap between urban and rural temperatures is usually largest not in the afternoon but in the hours after dark".' },
    { statement: 'Asphalt is more expensive than other materials used to build roads.', answer: 'NOT GIVEN', why: 'Asphalt is mentioned only because it is dark and absorbs heat. Its cost is never discussed.', d: 4 },
    { statement: 'In Westhaven, the richer areas had more trees than the poorer ones.', answer: 'TRUE', why: 'Poorer neighbourhoods had "few trees", while wealthy districts had "large gardens and tree-lined streets".', d: 4 },
    { statement: 'White roofs bring benefits in every type of climate.', answer: 'FALSE', why: '"in places with cold winters they can increase heating costs". The word "every" makes the statement false.' },
  ],
  summaryList: {
    title: 'Why cities stay warm',
    gaps: [
      { text: 'Hard surfaces such as roads take in sunlight and ___ its energy, releasing it slowly after dark.', answer: 'hold', why: '"These surfaces absorb a great deal of sunlight and store its energy as heat." "Hold" means "store". "Reflect" is the opposite: that is what white roofs do.' },
      { text: 'In the countryside, plants cool the air by giving off ___ through their leaves.', answer: 'moisture', why: '"Trees and grass cool the air around them by releasing water through their leaves". "Rain" is wrong: the rain falls on the ground, it is not released by plants.' },
      { text: 'Tall buildings also stop the ___ that would carry warm air away.', answer: 'breeze', why: '"Tall buildings… blocking the wind that would otherwise carry warm air away." "Breeze" is a synonym of "wind".' },
      { text: 'Finally, machines such as air conditioners produce ___ heat that ends up in the streets.', answer: 'unwanted', why: '"air conditioners throw out waste heat into the streets". Waste heat is heat nobody wants. "Cooling" is a trap: the machines cool the inside, but the heat they throw out warms the street.', d: 4 },
    ],
    distractors: ['reflect', 'rain', 'shade', 'cooling'],
  },
  endings: {
    items: [
      { start: 'Heat waves are especially dangerous in cities because', ending: 'temperatures stay high at night and the body cannot recover.', why: '"temperatures remain high at night, and the human body has no chance to recover".' },
      { start: 'Using more air conditioning can make the problem worse because', ending: 'the machines release heat into the streets outside.', why: '"the more people try to cool their homes, the warmer the outside air becomes". The machines throw "waste heat into the streets".' },
      { start: 'Dr Osei’s research suggests that a large park', ending: 'can lower temperatures in streets some distance away.', why: 'It cooled "streets several hundred metres away". The trap "only if planted with trees" is not in the passage.', d: 4 },
      { start: 'Planting trees in dry cities can be difficult because', ending: 'they need large amounts of water to survive.', why: '"in dry cities they need large amounts of water to survive". The other problem — they "take many years to grow" — is not in the list.' },
    ],
    distractors: ['they reflect most of the sunlight back into the sky.', 'is only effective if it is planted with trees.', 'the countryside around them is becoming warmer.'],
  },
};

const HABITS: IeltsPassage = {
  id: 'psychology-of-habits',
  title: 'Creatures of habit',
  level: 4,
  paragraphs: [
    'Think about the first hour of your day. You probably woke up, reached for your phone, brushed your teeth and followed the same route to school or work, all without making many real decisions. Psychologists have long suspected that a large part of human behaviour runs on this kind of automatic pilot, and a study by a research team at the fictional Northgate University tried to measure how large. The team asked several hundred volunteers to write down what they were doing, thinking and feeling every hour for two weeks. Around 40 per cent of the recorded actions were performed almost every day, in the same place, while the volunteers were thinking about something else entirely.',
    'Such automatic behaviour is not a sign of laziness; it is an efficient use of the brain. When an action is first learnt, it requires careful attention from the front part of the brain, which is responsible for planning. As the action is repeated, however, control gradually passes to a group of structures deep inside the brain known as the basal ganglia. This leaves the planning areas free to deal with new problems. Professor Elena Marsh, an invented psychologist whose work on this subject is widely quoted, describes every habit as a loop with three parts: a cue that triggers the behaviour, the routine itself, and a reward that makes the brain more likely to repeat the loop next time. A phone that buzzes is a cue; checking it is the routine; the small pleasure of a new message is the reward.',
    'How long does it take for a new habit to form? A popular claim, repeated in many self-help books, says that twenty-one days is enough. To test this, Dr Kenji Arata, another fictional researcher, asked ninety volunteers to choose one healthy behaviour, such as drinking a glass of water with breakfast or going for a run before dinner, and to report each day how automatic it felt. On average, it took about ten weeks before the behaviour reached its peak level of automaticity, and the range was enormous, from under three weeks to more than eight months. Simple actions became automatic far sooner than demanding ones. Encouragingly, missing a single day had almost no effect on the final result.',
    'Many people believe that those who keep good habits simply have more willpower than the rest of us. Research by Dr Sofia Lindqvist, also invented for this passage, suggests otherwise. When she followed volunteers with high scores on self-control tests, she discovered that they did not resist temptation more often than others. Instead, they met it less often, because they had organised their lives so that temptation rarely appeared. A student who leaves her phone in another room while studying, for instance, does not need to fight the urge to check it, because the cue is no longer there.',
    'Breaking a bad habit is notoriously difficult, partly because the cue usually stays the same. The office worker who buys a cake every afternoon still feels tired at three o’clock, and the tiredness still calls up the old routine. For this reason, Marsh recommends keeping the cue and the reward but changing the routine: the worker might take a short walk instead, which also brings a pleasant break. Her research also indicates that habits are most fragile when a person’s surroundings change. Moving house, changing jobs or starting university removes many familiar cues at once, which creates an unusual opportunity to drop old patterns and build better ones.',
    'These findings have implications beyond personal self-improvement. If behaviour depends so heavily on surroundings, then organisations can encourage healthy habits by changing the environment rather than by lecturing people. Some school canteens, for example, now place fruit at eye level near the till and move sweets to less convenient shelves, and pupils choose fruit more often as a result. The lesson for individuals is similar. Instead of relying on motivation, which rises and falls from day to day, people who want to change may do better to redesign the small details of their daily lives.',
  ],
  glossary: ['automaticity: how far an action is done without thinking about it', 'basal ganglia: a group of structures deep in the brain'],
  features: {
    instruction: 'Matching features — Which researcher or group is this finding linked to? A: the Northgate University team, B: Professor Elena Marsh, C: Dr Kenji Arata, D: Dr Sofia Lindqvist',
    options: ['the Northgate University team', 'Professor Elena Marsh', 'Dr Kenji Arata', 'Dr Sofia Lindqvist'],
    items: [
      { item: 'People with strong self-control tend to avoid tempting situations rather than resist them.', answer: 'Dr Sofia Lindqvist', why: 'They "did not resist temptation more often than others. Instead, they met it less often".' },
      { item: 'A large proportion of everyday actions are repeated in the same setting.', answer: 'the Northgate University team', why: '"Around 40 per cent of the recorded actions were performed almost every day, in the same place".' },
      { item: 'Skipping a day now and then does not stop a habit from forming.', answer: 'Dr Kenji Arata', why: '"missing a single day had almost no effect on the final result".' },
      { item: 'Every habit is made up of a trigger, an action and something pleasant.', answer: 'Professor Elena Marsh', why: 'Her habit loop has "a cue… the routine itself, and a reward". Trigger = cue, action = routine, something pleasant = reward.', d: 3 },
      { item: 'A major change in someone’s life is a good moment to replace old habits.', answer: 'Professor Elena Marsh', why: '"Her research also indicates that habits are most fragile when a person’s surroundings change… an unusual opportunity". The trap is Lindqvist, who wrote about removing cues, not about life changes.', d: 5 },
    ],
  },
  chooseTwo: [
    {
      question: 'Which TWO statements about Dr Arata’s study are true?',
      answers: ['The volunteers decided for themselves which behaviour to practise.', 'Easy behaviours became automatic more quickly than difficult ones.'],
      wrong: ['Most of the habits were fully formed after twenty-one days.', 'Volunteers who missed a day had to start again.', 'The volunteers were all trying to give up unhealthy food.'],
      why: 'Volunteers were asked "to choose one healthy behaviour", and "Simple actions became automatic far sooner than demanding ones." The average was about ten weeks, not 21 days, and missing a day had "almost no effect".',
    },
  ],
  completion: [
    {
      kind: 'note',
      title: 'Breaking a bad habit',
      limit: 3,
      gaps: [
        { text: 'Problem: the ___ normally remains, so it keeps calling up the old behaviour.', answer: 'cue', why: '"partly because the cue usually stays the same… the tiredness still calls up the old routine".' },
        { text: 'Marsh’s advice: keep the trigger and the reward, but replace the ___.', answer: 'routine', why: '"keeping the cue and the reward but changing the routine". The cake-buyer takes a walk instead.' },
        { text: 'Best time to change: when a person’s ___ are different, e.g. after moving house.', answer: 'surroundings', why: '"habits are most fragile when a person’s surroundings change". "Cues" is a trap: the passage says a change of surroundings REMOVES cues; the thing that is different is the surroundings.', d: 5 },
        { text: 'Example for organisations: canteens put fruit at ___ to encourage healthier choices.', answer: 'eye level', why: '"place fruit at eye level near the till". Do not write "the till": that is where the fruit is near, not the level.' },
      ],
    },
  ],
  endings: {
    items: [
      { start: 'When control of a repeated action passes to the basal ganglia, this', ending: 'leaves the planning parts of the brain free for new problems.', why: '"This leaves the planning areas free to deal with new problems."' },
      { start: 'The popular idea that a habit forms in twenty-one days', ending: 'was not supported by Dr Arata’s results.', why: 'The average was "about ten weeks", with a range from under three weeks to over eight months.' },
      { start: 'A student who keeps her phone in another room while studying', ending: 'is avoiding temptation instead of fighting it.', why: '"does not need to fight the urge to check it, because the cue is no longer there."' },
    ],
    distractors: ['makes the reward of each habit more satisfying.', 'was first suggested by the Northgate University team.'],
  },
};

const CONTAINERS: IeltsPassage = {
  id: 'container-shipping',
  title: 'The box that shrank the world',
  level: 5,
  paragraphs: [
    'Until the middle of the twentieth century, loading a cargo ship was a slow, labour-intensive and unpredictable business. Goods arrived at the docks in sacks, barrels, crates and bales of every shape and size, and gangs of dockworkers carried them on board piece by piece, fitting them together in the hold as best they could. A single vessel might need a week or more to load and unload, so that ships frequently spent almost as long tied up in port as they did at sea. Breakages were common, and so was theft: dockworkers in many ports regarded a share of the cargo as an unofficial part of their wages. Transport costs were so high that, for many products, shipping them abroad was simply not worth the trouble.',
    'The man most associated with changing this was Malcolm McLean, an American trucking businessman with no background in shipping. Frustrated by the hours his lorries spent waiting at the docks, he first considered driving whole trucks onto ships, but rejected the idea because the wheels and engines would waste valuable space. Instead, he proposed lifting only the metal body of the truck off its wheels and placing it on board, so that goods could travel from factory to customer by road and sea without ever being unpacked. In 1956, his converted tanker, the Ideal X, carried fifty-eight such containers from Newark, New Jersey, to Houston, Texas. McLean later calculated that loading the ship had cost around sixteen cents per ton, compared with almost six dollars per ton for conventional cargo.',
    'Yet the container did not conquer the world overnight. For more than a decade, competing shipping and railway companies used boxes of different lengths, heights and fittings, so a container belonging to one firm could not easily be carried by the ships or trains of another. Port authorities hesitated to invest in expensive new equipment until it was clear which system would win. Dockworkers’ unions, understandably, saw the box as a threat to thousands of jobs, and in several ports they fought its introduction with strikes. Only in the late 1960s did international negotiators agree on standard sizes, of which the most familiar are twenty and forty feet long. Even today, a ship’s capacity is measured in “twenty-foot equivalent units”.',
    'An unlikely accelerator was the Vietnam War. The American military struggled to supply its troops through crowded, poorly equipped Vietnamese ports, where cargo often sat for weeks before it could be unloaded. McLean persuaded the authorities that container ships could solve the problem, and his company soon had a lucrative contract. Rather than return across the Pacific with empty boxes, his ships stopped in Japan on the way home and filled them with Japanese goods destined for American shops. In this way, a solution to a military supply problem helped to open one of the most important trade routes of the late twentieth century.',
    'The consequences for ports and the people who worked in them were profound. Containers require vast flat areas for storage, giant cranes and deep water for ever larger ships, none of which could be found in the narrow docks of old city centres. Traditional waterfronts in cities such as New York and London declined rapidly, while new deep-water terminals were built some distance away, often in places with little previous history of trade. The number of dockworkers fell dramatically, since a crane operator and a few assistants could now do the work of hundreds of men. For the businesses that sent goods, on the other hand, the benefits were enormous: lower costs, faster journeys and far less loss through damage and theft.',
    'How much credit the container deserves for the growth of world trade remains a matter of debate. Dr Helena Brandt, a fictional economic historian, argues that the box did more to expand trade between wealthy nations than all the trade agreements of the period combined, because it reduced not only the cost of transport but also its uncertainty, allowing factories to depend on parts made on the other side of the world. Others are more cautious. The economist Ravi Menon, also an invented figure, points out that containers spread at the same time as computers, cheaper fuel and the lowering of tariffs, and warns that it is almost impossible to separate the effect of one innovation from the others. What is not in doubt is that the plain steel box, one of the least glamorous inventions of the modern age, changed what the world buys and where it is made.',
  ],
  glossary: ['tariff: a tax on goods coming into a country', 'hold: the space inside a ship where cargo is stored'],
  headings: {
    items: [
      { para: 0, heading: 'A slow and costly way of moving goods', why: 'Paragraph A describes loading "piece by piece", ships waiting in port, breakages, theft and high costs. Theft is only one example, so "Why dockworkers stole cargo" is a detail trap.' },
      { para: 2, heading: 'Obstacles to a common system', why: 'Paragraph C lists what slowed the container: different box sizes, hesitant port authorities, union strikes, until standard sizes were agreed.', d: 4 },
      { para: 3, heading: 'An unexpected boost from a war', why: 'The Vietnam War is called "an unlikely accelerator": supplying troops led to a new trade route with Japan.' },
      { para: 4, heading: 'Winners and losers on the waterfront', why: 'Old waterfronts and dockworkers lost; businesses that sent goods gained "enormous" benefits. The cranes are one detail, not the main idea.' },
      { para: 5, heading: 'Disagreement over the container’s true impact', why: 'Brandt gives the box great credit; Menon says its effect cannot be separated from other changes. The paragraph is about this debate.' },
    ],
    distractors: ['The cost of a single historic voyage', 'Why dockworkers stole cargo', 'The design of the modern crane'],
  },
  mc: [
    {
      question: 'What was new about McLean’s proposal?',
      answer: 'Goods could move between road and sea without being unpacked.',
      wrong: ['Whole lorries, including their engines, would be carried on ships.', 'Oil tankers would be used to carry liquids in metal boxes.', 'Dockworkers would be paid for each box rather than each hour.'],
      why: 'Goods "could travel from factory to customer by road and sea without ever being unpacked". He REJECTED carrying whole trucks because "the wheels and engines would waste valuable space". The Ideal X was a converted tanker, but it carried containers, not liquids.',
      d: 4,
    },
    {
      question: 'Why does the writer mention the figures of sixteen cents and six dollars?',
      answer: 'to show how sharply containers reduced the cost of loading',
      wrong: ['to compare the price of a container with the price of a truck', 'to explain why McLean’s first voyage made a loss', 'to show how much dockworkers were paid per ton'],
      why: 'Loading the Ideal X cost "around sixteen cents per ton, compared with almost six dollars per ton for conventional cargo" — a huge fall in loading costs. Wages and the price of trucks are not given.',
    },
    {
      question: 'According to paragraph D, how did McLean’s ships increase their earnings during the Vietnam War?',
      answer: 'by carrying Japanese products on the journey back to America',
      wrong: ['by delivering containers to Japan on the way to Vietnam', 'by being the only ships allowed into Vietnamese ports', 'by charging the military for unloading the cargo themselves'],
      why: 'His ships "stopped in Japan on the way home and filled them with Japanese goods destined for American shops". Japan was on the way HOME, not on the way to Vietnam.',
      d: 5,
    },
  ],
  completion: [
    {
      kind: 'table',
      title: 'Shipping before and after the container',
      limit: 3,
      gaps: [
        { text: 'Before containers | Problems: breakages and ___ of cargo', answer: 'theft', why: '"Breakages were common, and so was theft". The table already has "breakages", so the missing problem is theft.' },
        { text: 'After standardisation | Most common box lengths: twenty and ___', answer: 'forty feet', accept: ['forty', '40 feet', '40'], why: '"the most familiar are twenty and forty feet long".' },
        { text: 'After containers | Equipment needed: storage areas and giant ___', answer: 'cranes', why: '"Containers require vast flat areas for storage, giant cranes and deep water".' },
        { text: 'After containers | Location of new ports: ___ away from old city centres', answer: 'deep-water terminals', why: '"new deep-water terminals were built some distance away". "Waterfronts" is wrong: those were the OLD docks that declined.', d: 5 },
      ],
    },
  ],
  chooseTwo: [
    {
      question: 'Which TWO reasons does the writer give for the slow spread of containers?',
      answers: ['Firms used boxes that did not fit each other’s equipment.', 'Workers’ organisations feared that jobs would disappear.'],
      wrong: ['The early containers were too heavy for most ships.', 'Governments placed special taxes on containers.', 'Customers worried that their goods would be damaged.'],
      why: 'Companies "used boxes of different lengths, heights and fittings", and unions "saw the box as a threat to thousands of jobs". Damage actually FELL with containers, and taxes (tariffs) appear only in paragraph F, about trade in general.',
    },
  ],
};

export const passagesA: IeltsPassage[] = [TIMEKEEPING, BEES, HEAT_ISLANDS, HABITS, CONTAINERS];
