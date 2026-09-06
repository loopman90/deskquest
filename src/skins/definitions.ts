export interface SkinDefinition {
  id: string;
  name: string;
  accent: string;
  background: string;
  border: string;
  meter: string;
}

export const SKINS: SkinDefinition[] = [
  ["minimal", "Minimal", "#6b7280", "transparent", "#d1d5db", "#6b7280"],
  ["obsidian-native", "Obsidian Native", "#8b5cf6", "var(--background-primary)", "var(--background-modifier-border)", "#8b5cf6"],
  ["pixel-rpg", "Pixel RPG", "#22c55e", "#111827", "#4b5563", "#facc15"],
  ["dnd", "D&D", "#b91c1c", "#1f1717", "#7f1d1d", "#dc2626"],
  ["dungeon", "Dungeon", "#a16207", "#18181b", "#52525b", "#d97706"],
  ["fantasy", "Fantasy", "#16a34a", "#102018", "#2f6f4f", "#84cc16"],
  ["spacesuit", "Spacesuit", "#38bdf8", "#0f172a", "#475569", "#e2e8f0"],
  ["space-station", "Space Station", "#60a5fa", "#111827", "#374151", "#93c5fd"],
  ["nasa-terminal", "NASA Terminal", "#f97316", "#0c0f12", "#334155", "#f97316"],
  ["sci-fi-ship-hud", "Sci-Fi Ship HUD", "#06b6d4", "#06121a", "#155e75", "#22d3ee"],
  ["cyberpunk", "Cyberpunk", "#eab308", "#150918", "#7e22ce", "#f472b6"],
  ["synthwave", "Synthwave", "#ec4899", "#170f2f", "#7c3aed", "#fb7185"],
  ["retro-pc", "Retro PC", "#22c55e", "#03120a", "#166534", "#4ade80"],
  ["terminal", "Terminal", "#10b981", "#020617", "#064e3b", "#10b981"],
  ["arcade", "Arcade", "#f43f5e", "#111827", "#2563eb", "#facc15"],
  ["pastel", "Pastel", "#f59e0b", "#fff7ed", "#fed7aa", "#fb923c"],
  ["monochrome", "Monochrome", "#525252", "#fafafa", "#d4d4d4", "#171717"],
  ["glass", "Glass", "#0ea5e9", "rgba(255,255,255,.08)", "rgba(255,255,255,.24)", "#38bdf8"],
  ["nature", "Nature", "#15803d", "#f0fdf4", "#bbf7d0", "#16a34a"],
  ["solar", "Solar", "#ea580c", "#fff7ed", "#fdba74", "#f59e0b"],
  ["neon", "Neon", "#22d3ee", "#050816", "#a855f7", "#67e8f9"],
  ["potion-bars", "Potion Bars", "#a855f7", "#1e102f", "#6b21a8", "#c084fc"],
  ["dark-fantasy", "Dark Fantasy", "#dc2626", "#111111", "#3f3f46", "#991b1b"],
  ["clean-color", "Clean Color", "#2563eb", "#ffffff", "#dbeafe", "#3b82f6"],
  ["8-bit", "8-Bit", "#facc15", "#111827", "#4b5563", "#22c55e"]
].map(([id, name, accent, background, border, meter]) => ({ id, name, accent, background, border, meter }));

export function getSkin(id: string): SkinDefinition {
  return SKINS.find((skin) => skin.id === id) ?? SKINS[1];
}
