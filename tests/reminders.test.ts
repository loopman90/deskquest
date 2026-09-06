import test from "node:test";
import assert from "node:assert/strict";
import { createDefaultData } from "../src/data/defaults";
import { ReminderManager, isDue } from "../src/core/reminder-manager";

test("isDue handles missing and recent timestamps", () => {
  const now = Date.UTC(2026, 8, 6, 12, 0, 0);
  assert.equal(isDue(undefined, now, 75), true);
  assert.equal(isDue(now - 10 * 60000, now, 75), false);
  assert.equal(isDue(now - 80 * 60000, now, 75), true);
});

test("reminder manager creates low stamina prompt", () => {
  const data = createDefaultData();
  data.bars.stamina = 10;
  const manager = new ReminderManager(data, () => undefined);
  manager.evaluate(Date.UTC(2026, 8, 6, 12, 0, 0));
  assert.equal(data.activeReminder?.category, "stamina");
  assert.equal(data.activeReminder?.level, "prompt");
});

test("snoozed reminder is not replaced before snooze expires", () => {
  const now = Date.UTC(2026, 8, 6, 12, 0, 0);
  const data = createDefaultData();
  data.bars.stamina = 10;
  const manager = new ReminderManager(data, () => undefined);
  manager.evaluate(now);
  const firstId = data.activeReminder?.id;
  manager.snooze(10, now);
  manager.evaluate(now + 5 * 60000);
  assert.equal(data.activeReminder?.id, firstId);
  assert.equal(data.activeReminder?.snoozeCount, 1);
});

test("recovery reminders bundle due routine objectives", () => {
  const now = Date.UTC(2026, 8, 6, 12, 0, 0);
  const data = createDefaultData();
  data.activeSession = {
    id: "session-test",
    startedAt: now - 80 * 60000,
    activeMs: 80 * 60000,
    idleMs: 0,
    breakMs: 0,
    longestContinuousMs: 80 * 60000,
    status: "active"
  };
  data.lastHydrationAt = now - 90 * 60000;
  data.lastMovementAt = now - 90 * 60000;
  data.lastEyeBreakAt = now - 30 * 60000;
  const manager = new ReminderManager(data, () => undefined);
  manager.evaluate(now);
  assert.equal(data.activeReminder?.category, "recovery");
  assert.deepEqual(
    data.activeReminder?.objectives.map((item) => item.category),
    ["break", "hydration", "movement", "eyes"]
  );
});
