// Hidden items: gems (instant coins) and world relics (collect 3 per world for a big reward).
export const GEM_REWARD = 15;
export const RELIC_REWARD = 100;
export const RELICS_PER_WORLD = 3;
const RELIC_SLOTS = [7, 14, 20]; // position of the level inside its 20-level world
const RELIC_ICONS = ["🏺", "👑", "🔮", "🗝️", "🐚", "🦋", "🧭", "💍", "📜", "🪶"];

export type Treasure = { kind: "gem" | "relic"; icon: string; word: string; cell: number };

export function treasureFor(level: number, sortedWords: string[]): Treasure | null {
  const slot = ((level - 1) % 20) + 1;
  const world = Math.ceil(level / 20);
  const relicIdx = RELIC_SLOTS.indexOf(slot);
  const isRelic = relicIdx >= 0;
  if (!isRelic && level % 3 !== 0) return null;
  if (!sortedWords.length) return null;
  // Avoid the very first (shortest) word when possible so the item is a real target.
  const pool = sortedWords.length > 1 ? sortedWords.slice(1) : sortedWords;
  const word = pool[level % pool.length]!;
  const cell = (level * 7) % word.length;
  const icon = isRelic ? RELIC_ICONS[(world * 3 + relicIdx) % RELIC_ICONS.length]! : "💎";
  return { kind: isRelic ? "relic" : "gem", icon, word, cell };
}

export function relicLevels(world: number): number[] {
  return RELIC_SLOTS.map((s) => (world - 1) * 20 + s);
}

/** Coins earned for claiming the treasure on `level`, given levels already claimed. */
export function claimReward(level: number, t: Treasure, claimed: number[]): number {
  if (claimed.includes(level)) return 0;
  if (t.kind === "gem") return GEM_REWARD;
  const world = Math.ceil(level / 20);
  const after = [...claimed, level];
  const complete = relicLevels(world).every((l) => after.includes(l));
  return complete ? RELIC_REWARD : 0;
}
