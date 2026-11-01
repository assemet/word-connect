// Browser-safe map from relic emoji ids (in treasures.ts) to high-quality artwork.
import amphora from "@/assets/relics/amphora.webp";
import crown from "@/assets/relics/crown.webp";
import orb from "@/assets/relics/orb.webp";
import key from "@/assets/relics/key.webp";
import shell from "@/assets/relics/shell.webp";
import butterfly from "@/assets/relics/butterfly.webp";
import compass from "@/assets/relics/compass.webp";
import ring from "@/assets/relics/ring.webp";
import scroll from "@/assets/relics/scroll.webp";
import feather from "@/assets/relics/feather.webp";
import chest from "@/assets/relics/chest.webp";

export const RELIC_CHEST = chest;

const ART: Record<string, { src: string; name: string }> = {
  "🏺": { src: amphora, name: "Ancient Amphora" },
  "👑": { src: crown, name: "Royal Crown" },
  "🔮": { src: orb, name: "Mystic Orb" },
  "🗝️": { src: key, name: "Golden Key" },
  "🐚": { src: shell, name: "Pearl Shell" },
  "🦋": { src: butterfly, name: "Crystal Butterfly" },
  "🧭": { src: compass, name: "Explorer's Compass" },
  "💍": { src: ring, name: "Sapphire Ring" },
  "📜": { src: scroll, name: "Sealed Scroll" },
  "🪶": { src: feather, name: "Phoenix Feather" },
};

export function relicArt(icon: string) {
  return ART[icon] ?? { src: chest, name: "Treasure" };
}
