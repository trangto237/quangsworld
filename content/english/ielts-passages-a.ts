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

export const passagesA: IeltsPassage[] = [TIMEKEEPING, BEES];
