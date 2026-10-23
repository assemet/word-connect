import { describe, expect, it } from "vitest";
import { backgroundForLevel, backgroundForScreen } from "./backgrounds";
import bg1 from "@/assets/bg.jpg";
import bgGame1 from "@/assets/bg-game1.jpg";
import bgGame2 from "@/assets/bg-game2.jpg";
import bg2 from "@/assets/bg2.jpg";
import bg3 from "@/assets/bg3.jpg";
import bg4 from "@/assets/bg4.jpg";
import bg5 from "@/assets/bg5.jpg";
import bg6 from "@/assets/bg6.jpg";

describe("Level backgrounds", () => {
  it.each([
    [1, 20, bgGame1], [21, 40, bgGame2], [41, 60, bg3],
    [61, 80, bg4], [81, 100, bg5], [101, 120, bg6],
  ])("uses the correct gameplay picture for levels %i–%i", (first, last, image) => {
    for (let level = Number(first); level <= Number(last); level++) {
      expect(backgroundForScreen("game", level, level)).toBe(image);
    }
  });

  it("keeps level 21's world on Home and Levels", () => {
    expect(backgroundForScreen("home", 1, 21)).toBe(bg2);
    expect(backgroundForScreen("levels", 20, 21)).toBe(bg2);
  });

  it("uses the played level when replaying an earlier world", () => {
    expect(backgroundForScreen("game", 20, 21)).toBe(bgGame1);
    expect(backgroundForScreen("complete", 20, 21)).toBe(bgGame1);
    expect(backgroundForScreen("game", 21, 21)).toBe(bgGame2);
  });

  it("gives early levels a distinct picture from the home screen", () => {
    expect(backgroundForScreen("game", 2, 2)).not.toBe(backgroundForScreen("home", 1, 2));
    expect(backgroundForScreen("home", 1, 1)).toBe(bg1);
  });

  it("gives levels 21-40 a gameplay picture distinct from the home screen", () => {
    expect(backgroundForScreen("game", 21, 21)).not.toBe(backgroundForScreen("home", 1, 21));
    expect(backgroundForScreen("home", 1, 21)).toBe(bg2);
  });
});
