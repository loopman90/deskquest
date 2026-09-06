import test from "node:test";
import assert from "node:assert/strict";
import { drainStamina, recoverStamina } from "../src/game/stamina-engine";
import { adjustHealthForSession, getHealthLabel, recoverHealth } from "../src/game/health-engine";
import { getLevelState, xpForLevel } from "../src/game/level-engine";
import { awardXp } from "../src/game/xp-engine";
import { calculateWorkdayScore } from "../src/game/score-engine";

test("stamina drains faster during long continuous work", () => {
  const early = drainStamina(100, 10, 10, "balanced");
  const late = drainStamina(100, 80, 10, "balanced");
  assert.ok(late < early);
});

test("stamina recovery is gradual and capped", () => {
  assert.equal(recoverStamina(95, 20), 100);
  assert.ok(recoverStamina(20, 2) > 20);
  assert.ok(recoverStamina(20, 10) > recoverStamina(20, 2));
});

test("health reacts mildly and never leaves bounds", () => {
  assert.equal(adjustHealthForSession(100, 50, "balanced"), 100);
  assert.ok(adjustHealthForSession(100, 120, "balanced") < 100);
  assert.equal(recoverHealth(99, 20), 100);
  assert.equal(getHealthLabel(0), "Exhausted");
});

test("xp only increases and levels progress", () => {
  const start = getLevelState(0);
  const next = awardXp(start, 500);
  assert.ok(next.total > start.total);
  assert.ok(next.level > start.level);
  assert.ok(xpForLevel(next.level + 1) > next.currentLevelXp);
});

test("workday score rewards recovery and routines", () => {
  const score = calculateWorkdayScore({
    date: "2026-09-06",
    activeWorkMs: 4 * 60 * 60 * 1000,
    breakMs: 40 * 60 * 1000,
    longestSessionMs: 55 * 60 * 1000,
    hydrationCheckins: 4,
    mealCheckins: 2,
    snackCheckins: 0,
    movementQuests: 2,
    eyeBreaks: 4,
    healthStart: 100,
    healthEnd: 96,
    lowestStamina: 32,
    xpEarned: 90,
    workdayScore: 0
  });
  assert.ok(score >= 75);
});
