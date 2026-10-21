// Word list for all levels. Edit freely: each level has letters and the words to find.
export type Level = { level: number; letters: string; words: string[] };

export const LEVELS: Level[] = [
  { level: 1, letters: "CAT", words: ["CAT", "ACT", "TAC"] },
  { level: 2, letters: "DOG", words: ["DOG", "GOD"] },
  { level: 3, letters: "GOLD", words: ["GOLD", "DOG", "GOD", "LOG", "OLD"] },
  { level: 4, letters: "STAR", words: ["STAR", "RATS", "ARTS", "RAT", "SAT", "ART"] },
  { level: 5, letters: "TEAM", words: ["TEAM", "MEAT", "MATE", "TAME", "EAT", "TEA", "MAT"] },
  { level: 6, letters: "NOTE", words: ["NOTE", "TONE", "TEN", "NET", "ONE", "TOE"] },
  { level: 7, letters: "LIVE", words: ["LIVE", "EVIL", "VILE", "VEIL", "LIE"] },
  { level: 8, letters: "HEART", words: ["HEART", "EARTH", "HATE", "HEAT", "RATE", "TEAR", "HAT", "EAT"] },
  { level: 9, letters: "STONE", words: ["STONE", "NOTES", "TONES", "ONSET", "NEST", "TONE", "NOTE", "SET"] },
  { level: 10, letters: "PLANT", words: ["PLANT", "PLAN", "PANT", "LAP", "NAP", "TAP", "PAT", "ANT"] },
  { level: 11, letters: "SMILE", words: ["SMILE", "SLIME", "LIMES", "MILE", "LIME", "LIES", "ISLE"] },
  { level: 12, letters: "BREAD", words: ["BREAD", "BEARD", "BARED", "BEAR", "BARE", "READ", "DEAR", "BED"] },
  { level: 13, letters: "WATER", words: ["WATER", "TAWER", "WEAR", "WART", "RATE", "TEAR", "WET", "ATE"] },
  { level: 14, letters: "GARDEN", words: ["GARDEN", "DANGER", "RANGED", "RANGE", "ANGER", "GRAND", "DARE", "EAR"] },
  { level: 15, letters: "PLANET", words: ["PLANET", "PLATE", "PANEL", "PLANT", "LEAP", "PALE", "NEAT", "TAN"] },
  { level: 16, letters: "FOREST", words: ["FOREST", "FOSTER", "SOFTER", "FORTE", "STORE", "FORT", "ROSE", "SORT"] },
  { level: 17, letters: "SILVER", words: ["SILVER", "LIVERS", "SLIVER", "LIVER", "LIVES", "RISE", "VILE", "LIES"] },
  { level: 18, letters: "CASTLE", words: ["CASTLE", "CLEATS", "STEAL", "SLATE", "LEAST", "CAST", "LACE", "SALT"] },
  { level: 19, letters: "MASTER", words: ["MASTER", "STREAM", "TAMERS", "SMART", "STEAM", "TEAMS", "MATE", "STAR"] },
  { level: 20, letters: "PAINTER", words: ["PAINTER", "PERTAIN", "REPAINT", "PAINT", "TRAIN", "PRINT", "PAIR", "RAIN"] },
];
