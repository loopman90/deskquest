import { DailyStats } from "../data/types";
import { clamp } from "../utils/number";

export function calculateWorkdayScore(stats: DailyStats): number {
  const activeHours = stats.activeWorkMs / 3600000;
  const breakRatio = stats.activeWorkMs > 0 ? stats.breakMs / stats.activeWorkMs : 0;
  const longestMinutes = stats.longestSessionMs / 60000;
  const recoveryScore = clamp(breakRatio * 260, 0, 30);
  const sessionScore = longestMinutes <= 75 ? 25 : clamp(25 - (longestMinutes - 75) * 0.45, 0, 25);
  const routineScore = clamp(stats.hydrationCheckins * 5 + stats.movementQuests * 8 + stats.mealCheckins * 8, 0, 25);
  const rhythmScore = activeHours > 0 ? 20 : 0;
  return Math.round(clamp(recoveryScore + sessionScore + routineScore + rhythmScore, 0, 100));
}

export function workdayScoreLabel(score: number): string {
  if (score >= 90) return "Excellent Balance";
  if (score >= 75) return "Balanced";
  if (score >= 60) return "Good";
  if (score >= 40) return "Needs Recovery";
  return "Overextended";
}
