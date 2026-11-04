import { describe, expect, it } from "vitest";
import { fillJar, levelJar, isBonusWord, JAR_REWARD, JAR_SIZE } from "./bonus";

describe("bonus words", () => {
  it("jar pays 15 coins every 5 bonus words", () => {
    expect(JAR_SIZE).toBe(5);
    expect(fillJar(3)).toEqual({ jar: 4, reward: 0 });
    expect(fillJar(4)).toEqual({ jar: 0, reward: JAR_REWARD });
    expect(JAR_REWARD).toBe(15);
  });
  it("accepts a real word not in the level, rejects level words and nonsense", () => {
    expect(isBonusWord("HOW", "OWH", ["WHO"])).toBe(true);
    expect(isBonusWord("WHO", "OWH", ["WHO"])).toBe(false);
    expect(isBonusWord("XYZ", "XYZ", [])).toBe(false);
    expect(isBonusWord("HOW", "OWT", [])).toBe(false);
  });
  it("accepts common real words like ELBOW, BLOW, BOWL", () => {
    for (const w of ["ELBOW", "BLOW", "BOWL", "LOB", "OWE"]) expect(isBonusWord(w, "LEWBO", [])).toBe(true);
  });
  it("each level's counter starts at 0 and resets after 5", () => {
    expect(levelJar(0)).toBe(0);
    expect(levelJar(4)).toBe(4);
    expect(levelJar(5)).toBe(0);
    expect(levelJar(7)).toBe(2);
    expect(fillJar(levelJar(4)).reward).toBe(15);
  });
});
