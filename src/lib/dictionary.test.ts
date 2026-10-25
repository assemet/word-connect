import { describe, it, expect } from "vitest";
import { MEANING_COST, canUnlockMeaning } from "./dictionary";

describe("word meanings", () => {
  it("costs 20 coins", () => expect(MEANING_COST).toBe(20));
  it("needs at least 20 coins to unlock", () => {
    expect(canUnlockMeaning(19, false)).toBe(false);
    expect(canUnlockMeaning(20, false)).toBe(true);
  });
  it("is free once unlocked", () => expect(canUnlockMeaning(0, true)).toBe(true));
});
