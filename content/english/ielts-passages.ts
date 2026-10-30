import type { IeltsPassage } from './ielts-reading';
import { passagesA } from './ielts-passages-a';
import { passagesB } from './ielts-passages-b';

/** Original IELTS-style Academic Reading passages with their notes. All texts written for Atlas. */

const MANGROVES: IeltsPassage = {
  id: 'mangroves',
  title: 'The forests between land and sea',
  level: 4,
  paragraphs: [
    'Mangroves are trees and shrubs that grow along tropical coastlines, in the narrow band where rivers meet the sea. Twice a day their roots are covered by salty water and then exposed again as the tide goes out. Very few plants can survive such conditions, yet mangroves have done so for millions of years. Today they cover around 140,000 square kilometres, mostly in Asia, and Vietnam’s Cà Mau peninsula holds some of the largest remaining forests in the country.',
    'The secret of their survival lies in a set of unusual adaptations. Some species filter out up to 90 per cent of the salt in seawater as it enters their roots; others absorb the salt and then push it out through special glands on their leaves, where it can be seen as white crystals. Because the mud they grow in contains almost no oxygen, many mangroves send up pencil-like roots, called pneumatophores, which stick out of the mud and take in air at low tide.',
    'For people living on the coast, these forests are far more than a curiosity. The dense tangle of roots slows down waves and traps mud, building up the land over time. After the Indian Ocean tsunami of 2004, a study of villages in Sri Lanka found that those sheltered by healthy mangroves suffered far less damage than those on open beaches. The forests also act as nurseries: the young of many fish, crabs and shrimps shelter among the roots before moving out to sea, so local fishing depends heavily on them.',
    'Mangroves are also remarkably good at storing carbon. Although they cover a tiny fraction of the world’s forest area, they can hold up to four times as much carbon per hectare as a typical tropical rainforest. Most of this is not in the trees themselves but in the waterlogged soil beneath them, where dead leaves and roots break down very slowly. When a mangrove is cleared, this buried carbon can be released into the atmosphere for decades.',
    'Despite these benefits, more than a third of the world’s mangroves have been lost since the middle of the twentieth century. The main cause has been the conversion of forests into ponds for farming shrimp, which can bring quick profits. However, the ponds often become polluted and unproductive after only a few years and are then abandoned, leaving bare mud where the forest once stood. Coastal building and the cutting of trees for firewood have added to the losses.',
    'In recent years, many countries have tried to replant mangroves, with mixed results. Ecologist Dr Lena Hartmann argues that planting seedlings in the wrong places, such as on open mudflats that the forest never covered, wastes money because most of them die within a year. She believes it is more effective to restore the natural flow of water to old forest sites and let seeds arrive with the tide. Some economists, by contrast, have proposed paying coastal families to protect existing forests, arguing that keeping a mangrove standing is far cheaper than trying to grow a new one.',
  ],
  glossary: ['tide: the regular rise and fall of the sea'],
  headings: {
    items: [
      { para: 1, heading: 'How mangroves cope with a difficult environment', why: 'The paragraph explains the "unusual adaptations": removing salt and breathing roots. The main idea is survival in harsh conditions.' },
      { para: 2, heading: 'Protection and food for coastal communities', why: 'Roots slow waves (protection) and act as nurseries for fish that local fishing depends on (food).' },
      { para: 4, heading: 'The reasons for a serious decline', why: '"More than a third… have been lost" and the paragraph lists the causes: shrimp ponds, building and firewood.' },
      { para: 5, heading: 'Different views on how to bring the forests back', why: 'Dr Hartmann prefers restoring water flow; economists prefer paying families to protect forests. Two views on restoration.' },
    ],
    distractors: ['The profits made by shrimp farmers', 'Why rainforests store more carbon than mangroves', 'A tree that grows only in Vietnam', 'The damage caused by a single tsunami'],
  },
  tfng: [
    { statement: 'All mangrove species get rid of salt through their leaves.', answer: 'FALSE', why: '"Some species filter out" salt at the roots; only "others" push it out through their leaves. "All" makes the statement false.', d: 5 },
    { statement: 'Pneumatophores are used by mangroves to take in air.', answer: 'TRUE', why: 'The pencil-like roots "take in air at low tide".' },
    { statement: 'The Sri Lankan villages near mangroves were rebuilt more quickly after the tsunami.', answer: 'NOT GIVEN', why: 'The study compared the DAMAGE, not how fast the villages were rebuilt.', d: 5 },
    { statement: 'Shrimp ponds usually stay profitable for many decades.', answer: 'FALSE', why: 'They "often become polluted and unproductive after only a few years".' },
  ],
  features: {
    instruction: 'Matching features — Who made this point? A: Dr Lena Hartmann, B: some economists, C: researchers who studied the 2004 tsunami',
    options: ['Dr Lena Hartmann', 'some economists', 'researchers who studied the 2004 tsunami'],
    items: [
      { item: 'Protecting forests that already exist costs much less than creating new ones.', answer: 'some economists', why: '"keeping a mangrove standing is far cheaper than trying to grow a new one."' },
      { item: 'Many young trees die when they are planted where mangroves never grew.', answer: 'Dr Lena Hartmann', why: 'Planting on open mudflats wastes money "because most of them die within a year".' },
      { item: 'Communities behind mangroves were damaged less by the waves.', answer: 'researchers who studied the 2004 tsunami', why: 'Villages "sheltered by healthy mangroves suffered far less damage".' },
    ],
  },
  completion: [
    {
      kind: 'summary',
      title: 'Why mangroves matter for the climate',
      limit: 2,
      gaps: [
        { text: 'Per hectare, mangroves can store up to four times more carbon than a tropical ___.', answer: 'rainforest', why: '"…as much carbon per hectare as a typical tropical rainforest."' },
        { text: 'The carbon builds up because dead leaves and ___ break down very slowly in wet soil.', answer: 'roots', why: '"dead leaves and roots break down very slowly".' },
        { text: 'Clearing a forest can release this carbon for ___.', answer: 'decades', why: '"can be released into the atmosphere for decades".' },
      ],
    },
  ],
};

export const IELTS_PASSAGES: IeltsPassage[] = [MANGROVES, ...passagesA, ...passagesB];
