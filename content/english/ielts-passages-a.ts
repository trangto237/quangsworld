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

export const passagesA: IeltsPassage[] = [TIMEKEEPING];
