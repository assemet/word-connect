import bg1 from "@/assets/bg.jpg";
import bg2 from "@/assets/bg2.jpg";
import bg3 from "@/assets/bg3.jpg";
import bg4 from "@/assets/bg4.jpg";
import bg5 from "@/assets/bg5.jpg";
import bg6 from "@/assets/bg6.jpg";

const backgrounds = [bg1, bg2, bg3, bg4, bg5, bg6];

export function backgroundForLevel(level: number): string {
  const index = Math.max(0, Math.min(Math.floor((level - 1) / 20), backgrounds.length - 1));
  return backgrounds[index] ?? bg1;
}

export function backgroundLevel(screen: string, playingLevel: number, unlockedLevel: number): number {
  return screen === "game" || screen === "complete" ? playingLevel : unlockedLevel;
}