// 50 worlds of 20 levels each. Names are shown on world cards.
export const LEVELS_PER_WORLD = 20;
export const WORLD_NAMES = [
  "Whispering Woods", "Blossom Valley", "Coral Cove", "Frosty Peaks", "Golden Dunes", "Starlit Castle",
  "Mossy Hollow", "Sunflower Fields", "Rainbow Falls", "Maple Meadow",
  "Seashell Bay", "Lagoon Isle", "Misty Harbor", "Pearl Reef", "Tidepool Shore", "Palm Paradise",
  "Lighthouse Point", "Turquoise Lagoon", "Driftwood Beach", "Sapphire Sea",
  "Amber Oasis", "Sandstone Canyon", "Pharaoh's Path", "Mirage Mesa", "Copper Cliffs", "Sunset Ruins",
  "Cactus Trail", "Hidden Temple", "Bronze Valley", "Scarab Sands",
  "Glacier Gate", "Aurora Fjord", "Crystal Caves", "Snowdrift Summit", "Polar Lights", "Icicle Lake",
  "Pine Ridge", "Silver Tundra", "Winter Hearth", "Northern Star",
  "Cloud Kingdom", "Moonlit Tower", "Nebula Gardens", "Comet Trail", "Dream Spire", "Galaxy Bridge",
  "Celestial Palace", "Stardust Shore", "Cosmic Crown", "Infinity Peak",
];
export const WORLD_COUNT = WORLD_NAMES.length;

export function worldOf(level: number): number {
  return Math.floor((level - 1) / LEVELS_PER_WORLD);
}
export function worldName(world: number): string {
  return WORLD_NAMES[world] ?? `World ${world + 1}`;
}
export function worldRange(world: number): [number, number] {
  const start = world * LEVELS_PER_WORLD + 1;
  return [start, start + LEVELS_PER_WORLD - 1];
}
