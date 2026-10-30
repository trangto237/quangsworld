import type { IeltsPassage } from './ielts-reading';

/** Original IELTS-style Academic Reading passages (set B). All texts written for Atlas; researchers and institutes are fictional. */

const OCTOPUS: IeltsPassage = {
  id: 'octopus-minds',
  title: 'The clever animal with eight arms',
  level: 3,
  paragraphs: [
    'For a long time, scientists believed that intelligence was something found mainly in animals with backbones, such as apes, dolphins and crows. The octopus has forced them to think again. It belongs to the same group of animals as snails and clams, yet it can open jars, find its way through mazes and recognise individual people. An octopus has around 500 million nerve cells, roughly the same number as a dog, and this makes it one of the most complex animals without a backbone on Earth.',
    'What makes the octopus truly unusual is where these nerve cells are found. About two-thirds of them are not in the head at all but in the eight arms. Each arm is covered in suckers that can both touch and taste, and each arm can make simple decisions on its own. If an arm finds a piece of food under a rock, it can start to pull it out before the central brain has fully "noticed". Some biologists compare the animal to a team of eight workers who follow a leader but are also free to act alone.',
    'In the laboratory, octopuses have shown that they can learn from their own experience. At the Coastline Marine Institute, a team led by Dr Hana Ruiz gave common octopuses a glass jar with a live crab inside and a screw lid on top. On their first attempt, most of the animals needed several minutes to get the lid off, often by trying many different movements. After ten attempts, the average time had fallen to well under a minute, because the octopuses had stopped wasting effort on movements that did not work. Stories from public aquariums support this picture: some octopuses have learned to escape from their tanks at night, steal fish from nearby tanks and return before the morning staff arrive.',
    'More surprising is the evidence that octopuses can learn by watching others. In one experiment by the same institute, an untrained octopus was allowed to watch through a glass wall as a trained octopus repeatedly chose a red ball instead of a white one. When the observer was then offered the two balls, it usually picked the red one, even though it had never been rewarded for doing so. This result puzzled many researchers, because octopuses spend almost their whole lives alone and rarely have the chance to copy each other in the wild.',
    'Octopuses also use objects in clever ways outside the laboratory. Divers working off the coast of Indonesia have filmed veined octopuses picking up empty coconut shells from the sea floor. The animals carry the shells under their bodies as they walk awkwardly across the sand on stiff arms, and later put two halves together to make a hiding place. Because the shells are of no use while they are being carried, and only become valuable later, many scientists accept this as a genuine example of tool use, a skill once thought to belong only to humans and a few other animals.',
    'Why should a relative of the snail become so intelligent? One popular explanation is that, millions of years ago, the ancestors of the octopus lost their protective outer shell. This gave them freedom to squeeze into narrow spaces and hunt in many different ways, but it also left their soft bodies open to attack. To survive, they needed to solve problems quickly, hide well and change their behaviour when conditions changed. Their short lives make this even more important. Most octopuses live for only one or two years, and the mother usually dies soon after her eggs hatch, so the young never meet their parents and must work everything out for themselves.',
    'These discoveries have practical consequences. In 2022, the United Kingdom recognised octopuses, along with crabs and lobsters, as animals that can feel pain in a law about animal welfare. At the same time, plans to farm octopuses for food in large tanks have led to strong debate. Critics argue that an animal which is curious, easily bored and able to escape would suffer in a crowded, empty tank, while supporters say that farming could reduce the pressure on wild populations.',
  ],
  glossary: ['nerve cell: a cell that carries messages around the body and brain', 'sucker: a round part on an arm that sticks to surfaces'],
  headings: {
    items: [
      { para: 1, heading: 'A body in which the limbs share the thinking', why: 'Paragraph B says two-thirds of the nerve cells are "in the eight arms" and each arm "can make simple decisions on its own". The trap "The size of the octopus brain" fits paragraph A, not B.' },
      { para: 2, heading: 'Getting better at a task through practice', why: 'Paragraph C: the time to open the jar fell from several minutes to under a minute "after ten attempts". The escape stories are only one supporting detail, so "Escapes from aquariums" is too narrow.' },
      { para: 3, heading: 'An unexpected ability to copy', why: 'Paragraph D: the observer chose the red ball after watching — "more surprising… learn by watching others". "Why octopuses prefer to live alone" picks up the last detail, but the paragraph does not explain why they live alone.' },
      { para: 4, heading: 'Evidence from the wild of using objects', why: 'Paragraph E: veined octopuses carrying coconut shells, "a genuine example of tool use", seen by divers off Indonesia — outside the laboratory.' },
      { para: 5, heading: 'Possible reasons why such intelligence developed', why: 'Paragraph F opens with "Why should a relative of the snail become so intelligent?" and gives the lost shell and the short life as explanations.', d: 4 },
    ],
    distractors: ['The size of the octopus brain compared with a dog’s', 'Night-time escapes from public aquariums', 'Why octopuses prefer to live alone'],
  },
  tfng: [
    { statement: 'Octopuses belong to the same animal group as snails.', answer: 'TRUE', why: 'Paragraph A: "It belongs to the same group of animals as snails and clams."' },
    { statement: 'Most of an octopus’s nerve cells are located in its head.', answer: 'FALSE', why: 'Paragraph B: "About two-thirds of them are not in the head at all but in the eight arms." Most are in the arms.' },
    { statement: 'In Dr Ruiz’s study, the octopuses opened the jar faster after repeated attempts.', answer: 'TRUE', why: 'Paragraph C: after ten attempts "the average time had fallen to well under a minute".' },
    { statement: 'The octopuses in the jar study preferred crabs to other kinds of food.', answer: 'NOT GIVEN', why: 'A crab was put in the jar, but the passage never compares crabs with other foods, so we cannot know what they preferred.', d: 4 },
    { statement: 'Veined octopuses find the coconut shells useful while they are carrying them.', answer: 'FALSE', why: 'Paragraph E: "the shells are of no use while they are being carried, and only become valuable later".', d: 4 },
    { statement: 'Young octopuses usually learn hunting skills from their mother.', answer: 'FALSE', why: 'Paragraph F: the mother "usually dies soon after her eggs hatch, so the young never meet their parents".' },
  ],
  completion: [
    {
      kind: 'sentence',
      limit: 2,
      gaps: [
        { text: 'An octopus has a similar number of nerve cells to a ___.', answer: 'dog', why: 'Paragraph A: "roughly the same number as a dog". Apes and dolphins are mentioned too, but only as intelligent animals, not for nerve cells.' },
        { text: 'In the copying experiment, the untrained octopus watched the trained one through a ___.', answer: 'glass wall', why: 'Paragraph D: "allowed to watch through a glass wall". "glass jar" belongs to the earlier experiment in paragraph C.', d: 4 },
        { text: 'Losing their outer shell meant that the ancestors of the octopus had ___ that were easy to attack.', answer: 'soft bodies', why: 'Paragraph F: "it also left their soft bodies open to attack". "Open to attack" is paraphrased as "easy to attack".' },
      ],
    },
  ],
};

const PAPER: IeltsPassage = {
  id: 'paper-journey',
  title: 'A sheet that travelled the world',
  level: 4,
  paragraphs: [
    'Long before paper existed, people wrote on almost anything that would hold a mark. In China, records were kept on narrow strips of bamboo tied together with cord, or on silk, which was beautiful but far too expensive for everyday use. The Egyptians made papyrus by laying thin slices of reed stem across one another and pressing them flat, while in Europe and the Middle East the finest books were written on parchment, prepared from the skins of sheep and goats. None of these was true paper, which is made by breaking plant fibres down completely and letting them re-form as a thin, even sheet.',
    'Chinese tradition gives the credit for paper to Cai Lun, an official at the imperial court who, in the year 105 CE, presented the emperor with a method of making sheets from tree bark, hemp, old rags and fishing nets. For centuries this date was treated as the birthday of paper. Archaeology has complicated the story, however. Fragments of paper found at sites in north-west China date from as early as the second century BCE, and some of them appear to have been used for wrapping objects rather than for writing. Most historians now believe that Cai Lun did not invent paper but improved it and, perhaps more importantly, encouraged its use by the state.',
    'The basic method he described has remained surprisingly stable. The raw material is soaked and beaten until the fibres separate into a soft pulp, which is then stirred into a large vat of water. The papermaker dips a fine screen held in a wooden frame into the vat and lifts it out level, so that the water drains away and leaves a thin layer of tangled fibres on the surface. This wet sheet is turned out, pressed to remove more water and hung up to dry. Modern factories perform each of these steps with machines, at enormous speed, but the principle would be familiar to a worker of two thousand years ago.',
    'From China the technique spread slowly, first to Korea and Japan and then westward along the trade routes of Central Asia. A well-known story claims that papermaking reached the city of Samarkand after Chinese prisoners were captured at the Battle of Talas in 751 and forced to share their skills. Historians today treat this account with caution, since paper may well have arrived earlier with merchants. What is certain is that by the end of the eighth century paper was being produced in Baghdad, where it quickly replaced parchment in government offices. Officials valued it partly because it was cheap and partly because ink soaks into its surface, which made it hard to scrape off and alter a record without leaving a trace. The new material also helped to support a lively trade in books, and the city became famous for its booksellers.',
    'Europe was a late arrival. Paper was made in Muslim Spain by the twelfth century, and from there the craft moved into Italy. In the town of Fabriano, papermakers of the thirteenth century introduced several changes that shaped European paper for centuries. They used water-powered hammers to beat linen rags into pulp, coated their sheets with animal gelatin so that ink would not spread, and pressed a wire design into each sheet while it was wet, creating a watermark that identified the mill. Even so, not everyone welcomed the material: some rulers forbade its use for official documents, fearing that it would not last as long as parchment.',
    'The printing press, which appeared in Europe in the middle of the fifteenth century, changed the situation completely. Printers needed paper in quantities that no parchment maker could supply, and demand for rags grew so fast that collectors travelled from village to village buying old clothes. The shortage was only solved in the nineteenth century, when machines that produced paper in a continuous roll were combined with a new raw material: wood pulp. Paper suddenly became cheap enough for daily newspapers, school exercise books and cheap novels. The new paper had a hidden weakness, though. Because of the chemicals used to make it, much of it was acidic, and many books from this period are now turning yellow and falling apart on library shelves.',
    'In the late twentieth century, some commentators predicted that computers would soon create the "paperless office". In fact, world paper consumption continued to rise for decades, as printers made it easy to produce copies of every document. Writing paper has finally begun to decline, but the material has found a new role. The growth of online shopping means that a large share of the paper made today is turned into cardboard boxes and packaging, so the product of Cai Lun’s workshop is as much a part of modern life as ever.',
  ],
  glossary: ['fibre: a thin thread that forms part of a plant', 'vat: a very large container for liquid'],
  mc: [
    {
      question: 'What does the writer say about the paper fragments found in north-west China?',
      answer: 'They suggest that paper existed before 105 CE.',
      wrong: ['They prove that Cai Lun stole the idea from another official.', 'They show that early paper was mainly used for official writing.', 'They were made from the same materials as papyrus.'],
      why: 'Paragraph B: the fragments "date from as early as the second century BCE", before Cai Lun’s date. The trap "mainly used for official writing" is wrong — some were used "for wrapping objects rather than for writing".',
    },
    {
      question: 'According to paragraph C, how has the method of making paper changed over time?',
      answer: 'The steps are now done by machine, but the basic idea is the same.',
      wrong: ['Modern paper no longer needs to be pressed or dried.', 'The screen has been replaced by a completely different process.', 'Workers today would not understand the ancient method.'],
      why: '"Modern factories perform each of these steps with machines… but the principle would be familiar to a worker of two thousand years ago." The last option reverses this.',
    },
    {
      question: 'Why did some European rulers refuse to use paper for official documents?',
      answer: 'They doubted whether it would survive as long as parchment.',
      wrong: ['They thought ink spread too easily on its surface.', 'They preferred documents to carry a watermark.', 'They believed it was too expensive to produce.'],
      why: 'Paragraph E: they forbade it "fearing that it would not last as long as parchment". Ink spreading is mentioned, but it was the problem gelatin solved, not the rulers’ reason.',
      d: 3,
    },
  ],
  endings: {
    items: [
      { start: 'Papyrus does not count as true paper because', ending: 'its plant material was not broken down into separate fibres.', why: 'Paragraph A: papyrus was made by "laying thin slices of reed stem across one another", while true paper is made "by breaking plant fibres down completely".', d: 5 },
      { start: 'Historians are doubtful about the story of the Battle of Talas because', ending: 'traders may have brought papermaking to the region before 751.', why: 'Paragraph D: "paper may well have arrived earlier with merchants". Merchants = traders.' },
      { start: 'Officials in Baghdad found paper useful because', ending: 'any attempt to change what was written could be detected.', why: 'Paragraph D: ink soaks in, "which made it hard to scrape off and alter a record without leaving a trace". (Cheapness is also given, but no ending says that.)' },
      { start: 'Many books printed in the nineteenth century are now in poor condition because', ending: 'the paper they were printed on contains acid.', why: 'Paragraph F: "much of it was acidic, and many books from this period are now turning yellow and falling apart".' },
    ],
    distractors: ['the rags used to make them were collected from villages.', 'printers could not obtain enough parchment.', 'the method was kept secret by the imperial court.'],
  },
  chooseTwo: [
    {
      question: 'Which TWO of the following led to an increase in the amount of paper used, according to the passage?',
      answers: ['the arrival of the printing press', 'the growth of shopping on the internet'],
      wrong: ['the invention of the watermark', 'the use of animal gelatin', 'the decline of writing paper'],
      why: 'Paragraph F: printers "needed paper in quantities that no parchment maker could supply"; paragraph G: online shopping means much paper becomes "cardboard boxes and packaging". Watermarks and gelatin improved quality, not quantity, and writing paper has declined.',
      d: 5,
    },
  ],
  completion: [
    {
      kind: 'table',
      title: 'Stages in the history of paper',
      limit: 2,
      gaps: [
        { text: 'China, 105 CE | Cai Lun’s materials: tree bark, hemp, old rags and ___', answer: 'fishing nets', why: 'Paragraph B: "from tree bark, hemp, old rags and fishing nets".', d: 3 },
        { text: 'Japan and Korea | reached by paper before it travelled west along the trade routes of ___', answer: 'Central Asia', why: 'Paragraph D: "westward along the trade routes of Central Asia".' },
        { text: 'Fabriano, 13th century | rags beaten by hammers driven by ___', answer: 'water', accept: ['water power'], why: 'Paragraph E: "water-powered hammers". The table needs the source of power: water.', d: 5 },
        { text: 'Fabriano, 13th century | sheets coated with ___ to stop ink spreading', answer: 'animal gelatin', accept: ['gelatin'], why: 'Paragraph E: "coated their sheets with animal gelatin so that ink would not spread".' },
        { text: '19th century | machines making a continuous roll; new raw material: ___', answer: 'wood pulp', why: 'Paragraph F: "combined with a new raw material: wood pulp". Rags were the OLD material.', d: 3 },
      ],
    },
  ],
};

export const passagesB: IeltsPassage[] = [OCTOPUS, PAPER];
