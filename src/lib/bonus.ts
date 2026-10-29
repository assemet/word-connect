import { LEVELS } from "@/data/words";

export const JAR_SIZE = 5;
export const JAR_REWARD = 25;

// Valid bonus words come from the game's own vetted, family-friendly word lists.
let dict: Set<string> | null = null;
function dictionary() {
  if (!dict) dict = new Set(LEVELS.flatMap((l) => l.words));
  return dict;
}

export function fitsLetters(word: string, letters: string) {
  const pool = letters.split("");
  for (const ch of word) {
    const i = pool.indexOf(ch);
    if (i < 0) return false;
    pool.splice(i, 1);
  }
  return true;
}

export function isBonusWord(word: string, letters: string, levelWords: string[]) {
  return word.length >= 3 && !levelWords.includes(word) && fitsLetters(word, letters) && dictionary().has(word);
}

/** Adds one word to the jar; returns new jar count and coins earned. */
export function fillJar(jar: number) {
  const n = jar + 1;
  return n >= JAR_SIZE ? { jar: 0, reward: JAR_REWARD } : { jar: n, reward: 0 };
}
