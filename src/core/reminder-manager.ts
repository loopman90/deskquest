import { Notice } from "obsidian";
import { DeskQuestData, ReminderState } from "../data/types";
import { makeId } from "../utils/dates";

const MAX_HISTORY = 100;

export class ReminderManager {
  constructor(private readonly data: DeskQuestData, private readonly changed: () => void) {}

  evaluate(now = Date.now()): void {
    if (!this.data.settings.enabled || !this.data.settings.remindersEnabled) return;
    if (this.data.activeReminder && this.data.activeReminder.snoozedUntil && this.data.activeReminder.snoozedUntil > now) return;

    const session = this.data.activeSession;
    const activeMinutes = (session?.longestContinuousMs ?? 0) / 60000;
    const next = this.pickReminder(activeMinutes, now);
    if (!next) return;

    if (this.data.activeReminder?.category === next.category && this.data.activeReminder.snoozedUntil === undefined) return;

    this.data.activeReminder = next;
    this.data.reminderHistory = [next, ...this.data.reminderHistory].slice(0, MAX_HISTORY);
    if (next.level !== "passive") {
      new Notice(`${next.title}: ${next.message}`);
    }
    this.changed();
  }

  snooze(minutes = 10): void {
    if (!this.data.activeReminder) {
      new Notice("No DeskQuest reminder to snooze.");
      return;
    }
    this.data.activeReminder.snoozeCount += 1;
    this.data.activeReminder.snoozedUntil = Date.now() + minutes * 60000;
    new Notice(`DeskQuest reminder snoozed for ${minutes} minutes.`);
    this.changed();
  }

  dismiss(): void {
    this.data.activeReminder = undefined;
    this.changed();
  }

  private pickReminder(activeMinutes: number, now: number): ReminderState | undefined {
    if (this.data.bars.stamina < this.data.settings.lowStaminaThreshold) {
      return this.create("stamina", "Low Stamina", "A recovery break may help.", "prompt");
    }

    if (activeMinutes >= this.data.settings.strongRecoveryNudgeMinutes) {
      return this.create("recovery", "Recovery Quest", "Take five minutes away from your desk.", "prompt");
    }

    if (activeMinutes >= this.data.settings.recoveryPromptMinutes) {
      return this.create("recovery", "Recovery Available", "A short break now keeps the rhythm balanced.", "nudge");
    }

    if (this.data.settings.hydrationEnabled && isDue(this.data.lastHydrationAt, now, this.data.settings.hydrationIntervalMinutes)) {
      return this.create("hydration", "Hydration Check", "Had something to drink recently?", "nudge");
    }

    if (this.data.settings.movementEnabled && isDue(this.data.lastMovementAt, now, this.data.settings.movementQuestIntervalMinutes)) {
      return this.create("movement", "Movement Quest", "Walk or stretch for a few minutes.", "passive");
    }

    if (this.data.settings.eyeBreaksEnabled && isDue(this.data.lastEyeBreakAt, now, this.data.settings.eyeBreakIntervalMinutes)) {
      return this.create("eyes", "Eye Break", "Look away from the screen for a moment.", "passive");
    }

    return undefined;
  }

  private create(category: ReminderState["category"], title: string, message: string, level: ReminderState["level"]): ReminderState {
    return {
      id: makeId("reminder"),
      title,
      message,
      level,
      category,
      createdAt: Date.now(),
      snoozeCount: 0
    };
  }
}

function isDue(lastAt: number | undefined, now: number, intervalMinutes: number): boolean {
  if (!lastAt) return true;
  return now - lastAt >= intervalMinutes * 60000;
}
