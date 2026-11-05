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

import { pickAudio } from "./dictionary";
import { describe as d2, it as i2, expect as e2 } from "vitest";
d2("pickAudio", () => {
  i2("returns undefined when no recording exists", () => {
    e2(pickAudio([{ phonetics: [{ text: "/x/", audio: "" }] }])).toBeUndefined();
  });
  i2("prefers the US recording", () => {
    e2(pickAudio([{ phonetics: [{ audio: "https://a/x-uk.mp3" }, { audio: "https://a/x-us.mp3" }] }])).toBe("https://a/x-us.mp3");
  });
});
