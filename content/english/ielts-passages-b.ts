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

const DESALINATION: IeltsPassage = {
  id: 'desalination',
  title: 'Turning the sea into drinking water',
  level: 3,
  paragraphs: [
    'About 97 per cent of all the water on Earth is in the oceans, and it is far too salty to drink or to use on crops. As populations grow and droughts become more frequent, more and more places are turning to desalination, the removal of salt from seawater. The technology is now common in the Middle East, in island nations and in dry coastal regions of Australia and the United States, and thousands of plants around the world supply water to cities, hotels and factories.',
    'The oldest method is distillation, which copies what the sun does to the ocean every day. Seawater is heated until it turns into steam, which rises and leaves the salt behind. The steam is then cooled so that it becomes liquid again, producing very pure water. The method is simple and reliable, but heating such large quantities of water needs huge amounts of heat. For this reason, large distillation plants have mainly been built in countries where oil and gas are cheap, such as those around the Persian Gulf.',
    'Most new plants use a different method called reverse osmosis. A plant of this kind on the coast near the fictional town of Port Halden shows how it works. First, seawater is drawn in through a long pipe that starts several hundred metres out at sea. The end of the pipe is covered with screens that keep fish and other large animals out. Next comes pre-treatment: the water passes through layers of sand and then through fine filters, which remove sand, seaweed and tiny organisms. This stage matters because even small particles could block the delicate parts of the system later on.',
    'The heart of the process comes next. Powerful high-pressure pumps push the cleaned seawater against special membranes. These are thin plastic sheets with holes so small that water molecules can pass through but salt cannot. At Port Halden, about 45 per cent of the seawater comes out on the other side as fresh water. The rest, now much saltier than before, leaves the plant as a waste liquid called brine. Even then the fresh water is not ready to drink. It is so pure that it would damage metal pipes and taste flat, so minerals such as calcium are added back, and chlorine is used to kill any remaining germs. Finally, the water is stored in large tanks before it is sent to homes.',
    'Reverse osmosis uses far less energy than distillation, but it is still more expensive than cleaning water from rivers or lakes, because pushing water through the membranes requires great force. One important improvement has been the energy recovery device. The brine leaving the membranes is still under high pressure, and these devices capture that pressure and reuse it to help push the next lot of seawater into the system. Engineers at Port Halden say that without such devices their electricity bill would be almost twice as high.',
    'Desalination also raises environmental concerns. The brine is usually returned to the sea, and because it is heavier than normal seawater it tends to sink and spread across the seabed, where it can harm plants and animals that cannot move away. To reduce the damage, many plants now release the brine through long pipes with many small openings, called diffusers, which mix it quickly with the surrounding water. Some researchers are also testing ways to extract useful salts and metals from brine so that less of it needs to be thrown away.',
    'Looking ahead, many experts expect desalination to become cheaper and cleaner. Plants powered by solar panels or wind turbines are already operating in a few places, and small units that fit inside a shipping container can now supply a single village or hospital. Desalination will never replace rivers and rainfall, but for many dry coastal communities it is becoming an important part of the answer.',
  ],
  glossary: ['membrane: a very thin sheet that lets some things pass through but not others', 'germ: a very small living thing that can cause disease'],
  tfng: [
    { statement: 'Desalination plants are found only in the Middle East.', answer: 'FALSE', why: 'Paragraph A lists the Middle East, island nations, Australia and the United States. "only" makes it false.' },
    { statement: 'Distillation produces water of very high purity.', answer: 'TRUE', why: 'Paragraph B: cooling the steam produces "very pure water".' },
    { statement: 'The intake pipe at Port Halden was difficult and expensive to build.', answer: 'NOT GIVEN', why: 'Paragraph C gives the pipe’s length and its screens, but says nothing about the cost or difficulty of building it.', d: 4 },
    { statement: 'At Port Halden, more than half of the seawater becomes fresh water.', answer: 'FALSE', why: 'Paragraph D: "about 45 per cent" becomes fresh water — less than half.', d: 4 },
    { statement: 'Reverse osmosis is cheaper than treating river water.', answer: 'FALSE', why: 'Paragraph E: "it is still more expensive than cleaning water from rivers or lakes". It is cheaper than distillation only in energy.' },
    { statement: 'Container-sized desalination units can provide water for a hospital.', answer: 'TRUE', why: 'Paragraph G: small units "can now supply a single village or hospital".', d: 3 },
  ],
  completion: [
    {
      kind: 'flow-chart',
      title: 'Reverse osmosis at Port Halden',
      limit: 2,
      gaps: [
        { text: 'Seawater enters a pipe far offshore; ___ stop fish getting in. → Pre-treatment', answer: 'screens', why: 'Paragraph C: "covered with screens that keep fish and other large animals out".' },
        { text: 'Pre-treatment: sand and fine filters remove sand, seaweed and ___. → Pumping', answer: 'tiny organisms', why: 'Paragraph C: filters "remove sand, seaweed and tiny organisms". "Small particles" is the reason, not the list.', d: 4 },
        { text: 'High-pressure pumps force water through ___ that hold back the salt. → Separation', answer: 'membranes', why: 'Paragraph D: pumps "push the cleaned seawater against special membranes".' },
        { text: 'Separation: fresh water on one side; very salty ___ leaves the plant. → Post-treatment', answer: 'brine', why: 'Paragraph D: the rest "leaves the plant as a waste liquid called brine".' },
        { text: 'Post-treatment: minerals such as ___ added; chlorine kills germs → water stored in tanks', answer: 'calcium', why: 'Paragraph D: "minerals such as calcium are added back". Chlorine is already given in the box.' },
      ],
    },
    {
      kind: 'note',
      title: 'Costs and concerns',
      limit: 1,
      gaps: [
        { text: 'Distillation: needs a lot of ___, so mostly used where oil and gas are cheap', answer: 'heat', why: 'Paragraph B: "needs huge amounts of heat". "energy" is the general idea, but the passage word here is heat.' },
        { text: 'Energy recovery devices: reuse the ___ of the brine to push in more seawater', answer: 'pressure', why: 'Paragraph E: "these devices capture that pressure and reuse it".', d: 4 },
        { text: 'Brine sinks and harms living things on the ___', answer: 'seabed', why: 'Paragraph F: it tends to "sink and spread across the seabed".' },
      ],
    },
  ],
};

const LANGUAGES: IeltsPassage = {
  id: 'vanishing-languages',
  title: 'When a language falls silent',
  level: 4,
  paragraphs: [
    'Around 7,000 languages are spoken in the world today, but they are shared out very unequally. More than half of the world’s population speaks one of fewer than 25 major languages, such as Mandarin Chinese, Spanish, English and Hindi. At the other end of the scale, thousands of languages have only a few hundred or a few thousand speakers, often living in a single valley or on a single island. Linguists estimate that roughly 40 per cent of all languages are now endangered, and that many of them may not survive to the end of this century.',
    'A language rarely disappears suddenly. Far more often, it fades over three or four generations through a process known as language shift. Parents who speak a minority language at home notice that a larger, more powerful language is needed for school, for jobs and for dealing with the government, and they start to use it with their children in the hope of giving them a better future. The result is a familiar pattern: the grandparents are fluent, the parents understand the old language but seldom speak it, and the children know only a few words. Once children stop learning a language from their families, it is in serious danger, even if many thousands of adults can still speak it.',
    'Some people ask whether this matters, since speakers of a lost language can communicate perfectly well in the new one. Those who study endangered languages answer that each one holds knowledge which is not easily translated. Small languages often contain detailed names for local plants, words for the behaviour of particular fish or for small differences in the landscape, all built up over centuries of close observation. They also carry songs, stories and jokes that lose much of their meaning in another language. For many communities, finally, the language is bound up with a sense of who they are, and its loss can feel like the loss of a home.',
    'The most famous example of a language brought back into daily life is Hebrew. For many centuries it was used for prayer, religious study and some writing, but it was not the language that families spoke at home. In the late nineteenth and early twentieth centuries, a group of enthusiasts, of whom Eliezer Ben-Yehuda is the best known, set out to change this. They created new words for modern objects, wrote dictionaries and, above all, insisted on raising children in Hebrew. Today the language has millions of native speakers. Experts point out, however, that the situation was unusual: Hebrew already had a huge written tradition, and its new speakers had strong political and social reasons to adopt a shared language.',
    'Other revival efforts have focused on the very young. In New Zealand in the early 1980s, Māori communities, worried that few children were learning their ancestral language, set up preschools known as "language nests". In these centres, older speakers looked after small children and spoke to them only in Māori. The idea spread rapidly across the country, with hundreds of nests opening within a few years, and it was later taken up in Hawaii, where it helped to rescue a language that had almost no child speakers left. Some of the first children to attend these schools are now raising their own children in the language.',
    'Technology offers new tools as well. Linguists can now record the last fluent speakers of a language in high-quality audio and video, and communities are producing online dictionaries, mobile apps and even video games in small languages. The linguist Dr Amara Kessling, who has worked with several communities in the Pacific, welcomes these developments but warns against expecting too much from them. In her view, recordings can preserve a language in the way that a museum preserves an object, but they cannot keep it alive. A language survives, she argues, only when people choose to use it at the kitchen table, in the playground and in the street.',
    'This is perhaps the central lesson of revival work. Governments can help by funding schools, broadcasting and research, but they cannot force a language back into use. Success depends above all on whether a community, and especially its parents, believes that the effort is worthwhile.',
  ],
  glossary: ['generation: all the people born and living at about the same time', 'ancestral: belonging to the people in your family who lived long ago'],
  headings: {
    items: [
      { para: 1, heading: 'A gradual change from one generation to the next', why: 'Paragraph B: a language "fades over three or four generations through… language shift". The trap about grandparents is only one detail of the pattern.' },
      { para: 2, heading: 'What is lost when a language dies', why: 'Paragraph C answers "whether this matters": lost knowledge of plants and fish, stories, and identity.' },
      { para: 3, heading: 'An exceptional success story', why: 'Paragraph D: Hebrew is "the most famous example", and experts say "the situation was unusual". Exceptional = unusual.', d: 5 },
      { para: 4, heading: 'Starting with the youngest learners', why: 'Paragraph E: "Other revival efforts have focused on the very young" — the language nests for small children.' },
      { para: 5, heading: 'The limits of modern tools', why: 'Paragraph F: technology offers "new tools", but Dr Kessling warns that recordings "cannot keep it alive". The main point is the limit, not the apps themselves.', d: 5 },
    ],
    distractors: ['The languages with the largest numbers of speakers', 'Why grandparents are the best language teachers', 'Creating words for modern objects'],
  },
  tfng: [
    { statement: 'Most of the world’s people speak one of a small number of major languages.', answer: 'TRUE', why: 'Paragraph A: "More than half of the world’s population speaks one of fewer than 25 major languages."', d: 3 },
    { statement: 'Parents usually stop using a minority language because their children ask them to.', answer: 'FALSE', why: 'Paragraph B: parents change because the larger language "is needed for school, for jobs" and to give their children "a better future" — the parents decide, not the children.' },
    { statement: 'Hebrew was the first language ever to be revived.', answer: 'NOT GIVEN', why: 'Paragraph D calls Hebrew "the most famous example", not the first. The passage does not say which revival came first.', d: 5 },
  ],
  mc: [
    {
      question: 'According to paragraph D, why might the Hebrew revival be hard to repeat elsewhere?',
      answer: 'Hebrew had special advantages that most small languages lack.',
      wrong: ['Hebrew had too few written texts to learn from.', 'Families were not allowed to use Hebrew at home.', 'Eliezer Ben-Yehuda worked on it alone.'],
      why: 'Experts say "the situation was unusual": Hebrew "already had a huge written tradition" and speakers had strong reasons to adopt it. Ben-Yehuda was one of "a group of enthusiasts", not alone.',
    },
    {
      question: 'What is Dr Kessling’s opinion of recordings and apps?',
      answer: 'They are useful but cannot save a language on their own.',
      wrong: ['They are a waste of money for small communities.', 'They work better than teaching in schools.', 'They should be kept in museums.'],
      why: 'Paragraph F: she "welcomes these developments but warns against expecting too much". The museum is only a comparison, not a suggestion.',
    },
  ],
  summaryList: {
    title: 'The language nests of New Zealand',
    gaps: [
      { text: 'In the early 1980s, Māori communities opened preschools in which ___ speakers cared for small children.', answer: 'elderly', why: 'Paragraph E: "older speakers looked after small children". older = elderly. "foreign" is wrong: they were Māori speakers from the community.' },
      { text: 'The adults spoke to the children ___ in Māori.', answer: 'exclusively', why: '"spoke to them only in Māori". only = exclusively. "occasionally" means the opposite.' },
      { text: 'The scheme proved very ___, and hundreds of nests opened within a few years.', answer: 'popular', why: '"The idea spread rapidly across the country, with hundreds of nests opening".', d: 5 },
      { text: 'The model was later ___ in Hawaii.', answer: 'copied', why: '"it was later taken up in Hawaii". taken up = copied / adopted. "abandoned" is the opposite.' },
    ],
    distractors: ['foreign', 'occasionally', 'expensive', 'abandoned'],
  },
};

const SLEEP: IeltsPassage = {
  id: 'sleep-memory',
  title: 'What the sleeping brain remembers',
  level: 5,
  paragraphs: [
    'For most of history, sleep was regarded as a kind of switching off: a period in which the body rested and the mind, apart from the occasional dream, did nothing of value. Over the past few decades, however, sleep laboratories have assembled a very different picture. It now appears that some of the most important work involved in forming lasting memories is carried out not while we are studying, but in the hours after we have closed our books and gone to bed.',
    'An early and influential experiment was conducted by the psychologist Professor Edmund Varga. He taught two groups of volunteers lists of meaningless word pairs; one group was tested after a night’s sleep, the other after spending the same number of daytime hours awake. The sleepers consistently recalled more. Varga, however, interpreted his result cautiously. In his view, sleep did nothing to the memories themselves; it simply shielded them, because a sleeping person is not taking in the flood of new information that, during the day, interferes with what has recently been learned. For many years, this "passive protection" account was the accepted explanation.',
    'The first serious challenge came from studies of animals. Dr Ingrid Solberg recorded the activity of individual cells in the hippocampus, a region deep in the brain, while rats ran through a maze. Different cells fired at different points along the route. When the rats later fell into deep, or slow-wave, sleep, the same cells fired again in the same order, as if the animals were running the maze in their heads, but at up to twenty times the original speed. Crucially, when Solberg used a brief electrical signal to interrupt these replays without waking the rats, the animals made noticeably more errors in the maze the next day. Replay, she concluded, was not a side effect of learning but part of the mechanism by which it is made permanent, a finding that is difficult to reconcile with a purely passive role for sleep.',
    'Researchers now believe that during slow-wave sleep the brain repeatedly reactivates the day’s experiences, gradually transferring them from the hippocampus, which acts as a temporary store, to the cortex, where long-term memories are kept. The other main stage of sleep, known as REM sleep and associated with vivid dreaming, seems to do something different. Dr Rafael Montoya gave volunteers a long series of number problems that could be solved step by step but also contained a hidden shortcut. Of those who slept for a night between two sessions, 59 per cent discovered the shortcut, compared with 22 per cent of those who remained awake. Montoya argues that sleep, and REM sleep in particular, does not merely store memories but reorganises them, linking pieces of information in ways that were not obvious at the time of learning.',
    'If memories are strengthened during sleep, can the process be deliberately encouraged? Dr Mei Hanazawa has explored a technique known as targeted memory reactivation. Volunteers learn the positions of objects on a screen while each object is paired with a particular sound. Later, while they are in deep sleep, some of the sounds are played quietly. On waking, people remember the positions of the "cued" objects slightly better than the rest. Hanazawa stresses that the improvements are modest and that the method only strengthens material which has already been learned; nobody can acquire a new language by listening to recordings in bed. She has also publicly warned consumers against devices that claim to boost learning overnight, arguing that the laboratory evidence does not yet justify such products.',
    'The research has obvious implications for students. Staying up all night before an examination may provide a few extra hours of revision, but it sacrifices precisely the stage at which those hours would have been turned into durable memories. Teenagers face a particular difficulty, because their body clocks shift later during adolescence, making it hard for them to fall asleep early. Solberg is among those who have argued that schools should start later in the morning for this age group. For those who cannot sleep longer at night, there is some evidence that daytime naps of 60 to 90 minutes, long enough to include slow-wave sleep, can bring part of the same benefit.',
    'Many questions remain unanswered. It is still unclear how the sleeping brain selects which experiences to replay, and why some memories are strengthened while others fade. One intriguing proposal is that forgetting is itself part of the process: during sleep, the brain may weaken unimportant connections so that the significant ones stand out more clearly. If this is correct, a good night’s sleep improves memory partly by helping us to forget.',
  ],
  glossary: ['hippocampus: a part of the brain important for forming new memories', 'cortex: the outer layer of the brain'],
  features: {
    instruction: 'Matching features — Which researcher is this? A: Professor Edmund Varga, B: Dr Ingrid Solberg, C: Dr Rafael Montoya, D: Dr Mei Hanazawa',
    options: ['Professor Edmund Varga', 'Dr Ingrid Solberg', 'Dr Rafael Montoya', 'Dr Mei Hanazawa'],
    items: [
      { item: 'showed that disturbing a pattern of brain activity during sleep led to poorer performance', answer: 'Dr Ingrid Solberg', why: 'Paragraph C: interrupting the replays meant the rats "made noticeably more errors in the maze the next day". Hanazawa also works during sleep, but she adds sounds to help, not to disturb.' },
      { item: 'believed that sleep helps memory only by keeping new information away', answer: 'Professor Edmund Varga', why: 'Paragraph B: sleep "simply shielded" memories from new information that "interferes". The word "only" matches "did nothing to the memories themselves".' },
      { item: 'found that people who had slept were more likely to spot a concealed method', answer: 'Dr Rafael Montoya', why: 'Paragraph D: 59 per cent of sleepers "discovered the shortcut" — hidden shortcut = concealed method.' },
      { item: 'cautioned the public about products that claim to improve learning', answer: 'Dr Mei Hanazawa', why: 'Paragraph E: she "publicly warned consumers against devices that claim to boost learning overnight".', d: 4 },
      { item: 'has called for a change to the timetable of secondary schools', answer: 'Dr Ingrid Solberg', why: 'Paragraph F: "Solberg is among those who have argued that schools should start later in the morning for this age group" (teenagers). The letter B is used twice.' },
    ],
  },
  endings: {
    items: [
      { start: 'In Solberg’s rats, the replay of the maze route during sleep was', ending: 'much faster than the original experience.', why: 'Paragraph C: the cells fired "at up to twenty times the original speed".', d: 4 },
      { start: 'According to Montoya, REM sleep is especially important for', ending: 'connecting pieces of information in new ways.', why: 'Paragraph D: sleep reorganises memories, "linking pieces of information in ways that were not obvious". The trap about transferring memories is the job of slow-wave sleep (and it reverses the direction).' },
      { start: 'Targeted memory reactivation can only help with', ending: 'information that has already been learned.', why: 'Paragraph E: "the method only strengthens material which has already been learned". The trap "information presented for the first time" is exactly what she says is impossible.' },
      { start: 'Students who revise through the night before an exam', ending: 'lose the stage in which memories become lasting.', why: 'Paragraph F: it "sacrifices precisely the stage at which those hours would have been turned into durable memories". durable = lasting.' },
    ],
    distractors: ['information presented for the first time during sleep.', 'transferring memories from the cortex to the hippocampus.', 'remember more because they avoid new information.'],
  },
  completion: [
    {
      kind: 'summary',
      title: 'How sleep shapes memory',
      limit: 3,
      gaps: [
        { text: 'In slow-wave sleep, the brain moves memories from the hippocampus, a temporary store, to the ___, where they are kept long-term.', answer: 'cortex', why: 'Paragraph D: "transferring them from the hippocampus… to the cortex, where long-term memories are kept". The order matters: it is NOT from the cortex to the hippocampus.', d: 4 },
        { text: 'Teenagers find it difficult to sleep early because their ___ move later during adolescence.', answer: 'body clocks', why: 'Paragraph F: "their body clocks shift later during adolescence".' },
        { text: 'A daytime nap lasting ___ minutes may give some of the benefits of a night’s sleep.', answer: '60 to 90', why: 'Paragraph F: "daytime naps of 60 to 90 minutes, long enough to include slow-wave sleep". Three words — the limit allows it.' },
        { text: 'One theory suggests that, during sleep, the brain weakens ___ so that important memories become clearer.', answer: 'unimportant connections', why: 'Paragraph G: "the brain may weaken unimportant connections so that the significant ones stand out more clearly".', d: 4 },
      ],
    },
  ],
};

export const passagesB: IeltsPassage[] = [OCTOPUS, PAPER, DESALINATION, LANGUAGES, SLEEP];
