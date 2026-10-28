/**
 * Realms: the map is split by subject. Home is the middle island (house, shop, Coach Owl, Exam Hall) with a
 * portal island for each realm around it; tapping a realm flies into its own map of islands, in its own
 * colours. Places are map spots: worlds, plus the Code Lab, the Arcade and the Writing studio.
 */

export type RealmId = 'english' | 'maths' | 'logic' | 'literature';

export interface Realm {
  id: RealmId;
  name: string;
  emoji: string;
  color: string;
  blurb: string;
  /** Map spots in this realm. */
  places: string[];
  /** The realm's look: grass, cliffs and sky (CSS class with the colours, light and dark). */
  className: string;
  /** Night sky with stars (the Logic & Code realm). */
  night?: boolean;
}

export const REALMS: Realm[] = [
  {
    id: 'english',
    name: 'English Realm',
    emoji: '🌿',
    color: '#16a34a',
    blurb: 'Meadow islands of words, grammar, sounds, reading and listening.',
    places: ['word-forest', 'grammar-forge', 'sound-temple', 'scholars-academy', 'ielts-tower', 'echo-caves', 'reading-ruins', 'my-textbook'],
    className: 'realm-english',
  },
  {
    id: 'maths',
    name: 'Maths Realm',
    emoji: '🏜️',
    color: '#d97706',
    blurb: 'Sandstone islands of numbers, algebra and shapes.',
    places: ['number-citadel', 'algebra-peaks', 'geometry-isles'],
    className: 'realm-maths',
  },
  {
    id: 'logic',
    name: 'Logic & Code Realm',
    emoji: '🌌',
    color: '#7c3aed',
    blurb: 'Crystal islands under the stars: puzzles, coding and the Arcade.',
    places: ['logic-labyrinth', 'code-lab', 'arcade'],
    className: 'realm-logic',
    night: true,
  },
  {
    id: 'literature',
    name: 'Literature Realm',
    emoji: '🏮',
    color: '#db2777',
    blurb: 'Lantern islands of stories, poems and writing.',
    places: ['lit-class', 'story-library', 'writing'],
    className: 'realm-literature',
  },
];

export const realmById = (id: string) => REALMS.find((r) => r.id === id);
/** The realm a place is in. */
export const realmOf = (place: string) => REALMS.find((r) => r.places.includes(place));
