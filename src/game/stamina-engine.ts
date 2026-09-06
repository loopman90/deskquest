import { DifficultyMode } from "../data/types";
import { clamp } from "../utils/number";

const difficultyMultiplier: Record<DifficultyMode, number> = {
  relaxed: 0.7,
  balanced: 1,
  pomodoro: 1.05,
  "deep-work": 0.85,
  hardcore: 1.35,
  custom: 1
};

export function drainStamina(current: number, continuousActiveMinutes: number, elapsedMinutes: number, difficulty: DifficultyMode): number {
  const rate = getDrainRate(continuousActiveMinutes) * difficultyMultiplier[difficulty];
  return clamp(current - rate * elapsedMinutes, 0, 100);
}

export function recoverStamina(current: number, breakMinutes: number): number {
  const firstFive = Math.min(breakMinutes, 5) * 5;
  const nextFive = Math.max(Math.min(breakMinutes - 5, 5), 0) * 4;
  const remaining = Math.max(breakMinutes - 10, 0) * 2.5;
  return clamp(current + firstFive + nextFive + remaining, 0, 100);
}

function getDrainRate(continuousActiveMinutes: number): number {
  if (continuousActiveMinutes < 25) return 0.5;
  if (continuousActiveMinutes < 50) return 0.8;
  if (continuousActiveMinutes < 60) return 1.2;
  if (continuousActiveMinutes < 75) return 1.5;
  if (continuousActiveMinutes < 90) return 2;
  return 2.4;
}
