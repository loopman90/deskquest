import { XpState } from "../data/types";

export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round(120 * Math.pow(level - 1, 1.45) + 80 * (level - 1));
}

export function levelForXp(totalXp: number): number {
  let level = 1;
  while (xpForLevel(level + 1) <= totalXp) {
    level += 1;
  }
  return level;
}

export function getLevelState(totalXp: number): XpState {
  const level = levelForXp(totalXp);
  return {
    total: totalXp,
    level,
    currentLevelXp: xpForLevel(level),
    nextLevelXp: xpForLevel(level + 1)
  };
}
