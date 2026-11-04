import { LEVELS } from "@/data/words";
import { BONUS_WORDS } from "@/data/bonusWords";

export const JAR_SIZE = 5;
export const JAR_REWARD = 15;

// Valid bonus words: level words plus a broad list of common, family-friendly English words.
let dict: Set<string> | null = null;
function dictionary() {
  if (!dict) dict = new Set([...LEVELS.flatMap((l) => l.words), ...BONUS_WORDS.split(" ")]);
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

/** Per-level jar progress: each level starts at 0 and resets after every reward. */
export function levelJar(levelBonusCount: number) {
  return levelBonusCount % JAR_SIZE;
}
