import bg1 from "@/assets/bg.jpg";
import bgGame1 from "@/assets/bg-game1.jpg";
import bgGame2 from "@/assets/bg-game2.jpg";
import bg2 from "@/assets/bg2.jpg";
import bg3 from "@/assets/bg3.jpg";
import bg4 from "@/assets/bg4.jpg";
import bg5 from "@/assets/bg5.jpg";
import bg6 from "@/assets/bg6.jpg";

// Menus (home/levels/settings) follow unlocked progress with the original art.
const menuBackgrounds = [bg1, bg2, bg3, bg4, bg5, bg6];
// Gameplay has its own distinct set; worlds 1 (levels 1–20) and 2 (levels 21–40) differ from the menu art.
const gameBackgrounds = [bgGame1, bgGame2, bg3, bg4, bg5, bg6];

function worldIndex(level: number): number {
  // Cycle the 6 pictures across all 50 worlds.
  return Math.max(0, Math.floor((level - 1) / 20)) % menuBackgrounds.length;
}

export function backgroundForLevel(level: number): string {
  return menuBackgrounds[worldIndex(level)] ?? bg1;
}

export function gameBackgroundForLevel(level: number): string {
  return gameBackgrounds[worldIndex(level)] ?? bgGame1;
}

export function backgroundLevel(screen: string, playingLevel: number, unlockedLevel: number): number {
  return screen === "game" || screen === "complete" ? playingLevel : unlockedLevel;
}

export function backgroundForScreen(screen: string, playingLevel: number, unlockedLevel: number): string {
  return screen === "game" || screen === "complete" ? gameBackgroundForLevel(playingLevel) : backgroundForLevel(unlockedLevel);
}
