import { DifficultyMode } from "../data/types";
import { clamp } from "../utils/number";

const modifier: Record<DifficultyMode, number> = {
  relaxed: 0.7,
  balanced: 1,
  pomodoro: 0.9,
  "deep-work": 0.85,
  hardcore: 1.3,
  custom: 1
};

export function adjustHealthForSession(current: number, continuousActiveMinutes: number, difficulty: DifficultyMode): number {
  const penalty = getPenalty(continuousActiveMinutes) * modifier[difficulty];
  return clamp(current - penalty, 0, 100);
}

export function recoverHealth(current: number, points: number): number {
  return clamp(current + points, 0, 100);
}

export function getHealthLabel(value: number): string {
  if (value >= 85) return "Excellent Balance";
  if (value >= 65) return "Balanced";
  if (value >= 45) return "Needs Recovery";
  if (value >= 20) return "Overextended";
  return "Exhausted";
}

function getPenalty(continuousActiveMinutes: number): number {
  if (continuousActiveMinutes < 60) return 0;
  if (continuousActiveMinutes < 75) return 0.4;
  if (continuousActiveMinutes < 90) return 1.2;
  if (continuousActiveMinutes < 120) return 2.4;
  return 4;
}
