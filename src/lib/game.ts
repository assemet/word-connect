export function scoreForWord(word: string) {
  return word.length * 10;
}
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]!; a[i] = a[j]!; a[j] = t;
  }
  return a;
}
export const HINT_COST = 50;
export const REVEAL_COST = 100;
