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

export const passagesB: IeltsPassage[] = [OCTOPUS];
