import { describe, expect, it } from "vitest";
import { fillJar, isBonusWord, JAR_REWARD, JAR_SIZE } from "./bonus";

describe("bonus words", () => {
  it("jar pays 25 coins every 5 bonus words", () => {
    expect(JAR_SIZE).toBe(5);
    expect(fillJar(3)).toEqual({ jar: 4, reward: 0 });
    expect(fillJar(4)).toEqual({ jar: 0, reward: JAR_REWARD });
    expect(JAR_REWARD).toBe(25);
  });
  it("accepts a real word not in the level, rejects level words and nonsense", () => {
    expect(isBonusWord("HOW", "OWH", ["WHO"])).toBe(true);
    expect(isBonusWord("WHO", "OWH", ["WHO"])).toBe(false);
    expect(isBonusWord("XYZ", "XYZ", [])).toBe(false);
    expect(isBonusWord("HOW", "OWT", [])).toBe(false);
  });
});
