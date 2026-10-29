import { describe, it, expect } from "vitest";
import { LEVELS } from "./words";
import { WORLD_COUNT, worldName, worldOf } from "@/lib/worlds";

describe("levels", () => {
  it("has 1000 levels in 50 worlds", () => {
    expect(LEVELS).toHaveLength(1000);
    expect(WORLD_COUNT).toBe(50);
    expect(worldOf(1000)).toBe(49);
    expect(worldName(0)).toBe("Whispering Woods");
  });
  it("never has a singular and plural in the same level", () => {
    for (const l of LEVELS) for (const w of l.words) expect(l.words.includes(w + "S")).toBe(false);
  });
  it("every word can be made from the level letters", () => {
    for (const l of LEVELS) for (const w of l.words) {
      const pool = l.letters.split("");
      for (const ch of w) { const i = pool.indexOf(ch); expect(i).toBeGreaterThanOrEqual(0); pool.splice(i, 1); }
    }
  });
  it("never repeats a level's letter set", () => {
    const sets = LEVELS.map((l) => l.letters.split("").sort().join(""));
    expect(new Set(sets).size).toBe(1000);
  });
  it("ramps fast: levels 1-2 use 3 letters, 3-5 use 4, then grows to 8", () => {
    expect(LEVELS[0]!.letters).toHaveLength(3);
    expect(LEVELS[1]!.letters).toHaveLength(3);
    for (const i of [2, 3, 4]) expect(LEVELS[i]!.letters).toHaveLength(4);
    expect(LEVELS[999]!.letters).toHaveLength(8);
  });
});
