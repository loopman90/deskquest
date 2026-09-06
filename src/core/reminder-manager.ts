import { RegenData, ReminderObjective, ReminderState } from "../data/types";
import { makeId } from "../utils/dates";

const MAX_HISTORY = 100;
type Notifier = (message: string) => void;

export class ReminderManager {
  constructor(
    private readonly data: RegenData,
    private readonly changed: () => void,
    private readonly notify: Notifier = () => undefined
  ) {}

  evaluate(now = Date.now()): void {
    if (!this.data.settings.enabled || !this.data.settings.remindersEnabled) return;
    const active = this.data.activeReminder;
    if (active?.snoozedUntil && active.snoozedUntil > now) return;

    const session = this.data.activeSession;
    const activeMinutes = (session?.longestContinuousMs ?? 0) / 60000;
    const next = this.pickReminder(activeMinutes, now);
    if (!next) return;

    if (active && !active.snoozedUntil && sameReminder(active, next)) return;

    this.data.activeReminder = next;
    this.data.reminderHistory = [next, ...this.data.reminderHistory].slice(0, MAX_HISTORY);
    if (next.level !== "passive") {
      this.notify(`${next.title}: ${next.message}`);
    }
    this.changed();
  }

  snooze(minutes = 10, now = Date.now()): void {
    if (!this.data.activeReminder) {
      this.notify("No Regen reminder to snooze.");
      return;
    }
    this.data.activeReminder.snoozeCount += 1;
    this.data.activeReminder.snoozedUntil = now + minutes * 60000;
    this.notify(`Regen reminder snoozed for ${minutes} minutes.`);
    this.changed();
  }

  dismiss(): void {
    this.data.activeReminder = undefined;
    this.changed();
  }

  completeObjective(category: ReminderObjective["category"]): void {
    const reminder = this.data.activeReminder;
    if (!reminder) return;
    const objective = reminder.objectives.find((item) => item.category === category && !item.completed);
    if (!objective) return;
    objective.completed = true;
    if (reminder.objectives.every((item) => item.completed)) {
      this.data.activeReminder = undefined;
      this.notify("Recovery quest complete.");
    }
    this.changed();
  }

  private pickReminder(activeMinutes: number, now: number): ReminderState | undefined {
    const hydrationDue = this.data.settings.hydrationEnabled && isDue(this.data.lastHydrationAt, now, this.data.settings.hydrationIntervalMinutes);
    const movementDue = this.data.settings.movementEnabled && isDue(this.data.lastMovementAt, now, this.data.settings.movementQuestIntervalMinutes);
    const eyesDue = this.data.settings.eyeBreaksEnabled && isDue(this.data.lastEyeBreakAt, now, this.data.settings.eyeBreakIntervalMinutes);

    if (this.data.bars.stamina < this.data.settings.lowStaminaThreshold) {
      return this.create(
        "stamina",
        "Recovery Quest",
        "Stamina is low. A short recovery loop may help.",
        "prompt",
        this.combinedObjectives(true, hydrationDue, movementDue, eyesDue)
      );
    }

    if (activeMinutes >= this.data.settings.strongRecoveryNudgeMinutes) {
      return this.create(
        "recovery",
        "Recovery Quest",
        "Take five minutes away from your desk. Optional objectives are bundled here to reduce reminder noise.",
        "prompt",
        this.combinedObjectives(true, hydrationDue, movementDue, eyesDue)
      );
    }

    if (activeMinutes >= this.data.settings.recoveryPromptMinutes) {
      return this.create(
        "recovery",
        "Recovery Available",
        "A short break now keeps the rhythm balanced.",
        "nudge",
        this.combinedObjectives(true, hydrationDue, movementDue, eyesDue)
      );
    }

    if (hydrationDue && (movementDue || eyesDue)) {
      return this.create(
        "recovery",
        "Routine Check",
        "A few small routine checks are ready. Complete what fits right now.",
        "nudge",
        this.combinedObjectives(false, true, movementDue, eyesDue)
      );
    }

    if (hydrationDue) {
      return this.create("hydration", "Hydration Check", "Had something to drink recently?", "nudge", [
        objective("hydration", "Register a drink")
      ]);
    }

    if (movementDue) {
      return this.create("movement", "Movement Quest", "Walk or stretch for a few minutes.", "passive", [
        objective("movement", "Complete a movement quest")
      ]);
    }

    if (eyesDue) {
      return this.create("eyes", "Eye Break", "Look away from the screen for a moment.", "passive", [
        objective("eyes", "Log an eye break")
      ]);
    }

    return undefined;
  }

  private create(
    category: ReminderState["category"],
    title: string,
    message: string,
    level: ReminderState["level"],
    objectives: ReminderObjective[]
  ): ReminderState {
    return {
      id: makeId("reminder"),
      title,
      message,
      level,
      category,
      objectives,
      createdAt: Date.now(),
      snoozeCount: 0
    };
  }

  private combinedObjectives(needsBreak: boolean, hydrationDue: boolean, movementDue: boolean, eyesDue: boolean): ReminderObjective[] {
    const objectives: ReminderObjective[] = [];
    if (needsBreak) objectives.push(objective("break", "Take a short recovery break"));
    if (hydrationDue) objectives.push(objective("hydration", "Register a drink"));
    if (movementDue) objectives.push(objective("movement", "Complete a movement quest"));
    if (eyesDue) objectives.push(objective("eyes", "Log an eye break"));
    return objectives;
  }
}

export function isDue(lastAt: number | undefined, now: number, intervalMinutes: number): boolean {
  if (!lastAt) return true;
  return now - lastAt >= intervalMinutes * 60000;
}

function objective(category: ReminderObjective["category"], label: string): ReminderObjective {
  return {
    id: makeId(`objective-${category}`),
    label,
    category,
    completed: false
  };
}

function sameReminder(a: ReminderState, b: ReminderState): boolean {
  const aCategories = a.objectives.map((item) => item.category).sort().join(",");
  const bCategories = b.objectives.map((item) => item.category).sort().join(",");
  return a.category === b.category && a.level === b.level && aCategories === bCategories;
}
