import { describe, expect, it } from "vitest";
import { claimReward, treasureFor, GEM_REWARD, RELIC_REWARD } from "./treasures";

const words = ["CAT", "ACT", "TAC"];

describe("hidden items", () => {
  it("gem every 3rd level gives 15 coins once", () => {
    const t = treasureFor(3, words)!;
    expect(t.kind).toBe("gem");
    expect(claimReward(3, t, [])).toBe(GEM_REWARD);
    expect(claimReward(3, t, [3])).toBe(0);
  });
  it("levels 7, 14, 20 of each world hold relics", () => {
    expect(treasureFor(7, words)!.kind).toBe("relic");
    expect(treasureFor(34, words)!.kind).toBe("relic");
    expect(treasureFor(1, words)).toBeNull();
  });
  it("collecting all 3 relics of a world gives 100 coins", () => {
    const t = treasureFor(20, words)!;
    expect(claimReward(20, t, [7])).toBe(0);
    expect(claimReward(20, t, [7, 14])).toBe(RELIC_REWARD);
  });
});
