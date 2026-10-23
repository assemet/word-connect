import { describe, expect, it } from "vitest";
import { backgroundForLevel, backgroundLevel } from "./backgrounds";
import bg1 from "@/assets/bg.jpg";
import bg2 from "@/assets/bg2.jpg";
import bg3 from "@/assets/bg3.jpg";
import bg4 from "@/assets/bg4.jpg";
import bg5 from "@/assets/bg5.jpg";
import bg6 from "@/assets/bg6.jpg";

describe("Level backgrounds", () => {
  it.each([
    [1, 20, bg1], [21, 40, bg2], [41, 60, bg3],
    [61, 80, bg4], [81, 100, bg5], [101, 120, bg6],
  ])("uses the correct picture for levels %i–%i", (first, last, image) => {
    for (let level = Number(first); level <= Number(last); level++) {
      expect(backgroundForLevel(level)).toBe(image);
    }
  });

  it("keeps level 21's world on Home and Levels", () => {
    expect(backgroundForLevel(backgroundLevel("home", 1, 21))).toBe(bg2);
    expect(backgroundForLevel(backgroundLevel("levels", 20, 21))).toBe(bg2);
  });

  it("uses the played level when replaying an earlier world", () => {
    expect(backgroundForLevel(backgroundLevel("game", 20, 21))).toBe(bg1);
    expect(backgroundForLevel(backgroundLevel("complete", 20, 21))).toBe(bg1);
    expect(backgroundForLevel(backgroundLevel("game", 21, 21))).toBe(bg2);
  });
});