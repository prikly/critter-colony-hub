export interface Creature {
  index: number;
  name: string;
  emoji: string;
  element: 'fire' | 'water' | 'earth' | 'thunder';
  trait: string;
}

export const CREATURES: Creature[] = [
  { index: 0, name: 'Foxlet', emoji: '🦊', element: 'thunder', trait: 'Cunning' },
  { index: 1, name: 'Octavia', emoji: '🐙', element: 'water', trait: 'Creative' },
  { index: 2, name: 'Diploz', emoji: '🦕', element: 'earth', trait: 'Patient' },
  { index: 3, name: 'Blowby', emoji: '🐡', element: 'water', trait: 'Cheerful' },
  { index: 4, name: 'Fluttrix', emoji: '🦋', element: 'thunder', trait: 'Curious' },
  { index: 5, name: 'Shelldon', emoji: '🐢', element: 'earth', trait: 'Wise' },
  { index: 6, name: 'Buzzwick', emoji: '🐝', element: 'fire', trait: 'Energetic' },
  { index: 7, name: 'Prickles', emoji: '🦔', element: 'earth', trait: 'Observant' },
  { index: 8, name: 'Chompy', emoji: '🦈', element: 'water', trait: 'Bold' },
  { index: 9, name: 'Sparky', emoji: '⚡🐭', element: 'thunder', trait: 'Zippy' },
  { index: 10, name: 'Embear', emoji: '🐻', element: 'fire', trait: 'Fierce' },
  { index: 11, name: 'Glaceon', emoji: '🦭', element: 'water', trait: 'Calm' },
  { index: 12, name: 'Thornix', emoji: '🦎', element: 'earth', trait: 'Sneaky' },
  { index: 13, name: 'Cinders', emoji: '🐦‍🔥', element: 'fire', trait: 'Brave' },
  { index: 14, name: 'Bouncio', emoji: '🐸', element: 'earth', trait: 'Playful' },
  { index: 15, name: 'Stormwing', emoji: '🦅', element: 'thunder', trait: 'Swift' },
];

export function assignCreature(uid: string): Creature {
  let sum = 0;
  for (let i = 0; i < uid.length; i++) {
    sum += uid.charCodeAt(i);
  }
  return CREATURES[sum % 16];
}

export function getElementColor(element: Creature['element']) {
  const map = {
    fire: { badge: 'element-badge-fire', bg: 'bg-fire-bg' },
    water: { badge: 'element-badge-water', bg: 'bg-water-bg' },
    earth: { badge: 'element-badge-earth', bg: 'bg-earth-bg' },
    thunder: { badge: 'element-badge-thunder', bg: 'bg-thunder-bg' },
  };
  return map[element];
}
