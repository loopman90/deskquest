import { Notice } from "obsidian";
import { DeskQuestData, WorkSession } from "../data/types";
import { adjustHealthForSession, recoverHealth } from "../game/health-engine";
import { drainStamina, recoverStamina } from "../game/stamina-engine";
import { awardXp } from "../game/xp-engine";
import { calculateWorkdayScore } from "../game/score-engine";
import { makeId, todayKey } from "../utils/dates";
import { clamp } from "../utils/number";

const TICK_MS = 5000;
const SLEEP_GAP_MS = 60000;
type NumericStatKey =
  | "activeWorkMs"
  | "breakMs"
  | "hydrationCheckins"
  | "mealCheckins"
  | "snackCheckins"
  | "movementQuests"
  | "eyeBreaks"
  | "xpEarned";

export type SessionChangeHandler = () => void;

export class SessionManager {
  private interval: number | undefined;
  private lastTick = Date.now();
  private lastActivity = Date.now();
  private subscribers: SessionChangeHandler[] = [];

  constructor(private readonly data: DeskQuestData, private readonly save: () => void) {}

  start(): void {
    this.registerActivity();
    if (!this.data.activeSession || this.data.activeSession.status === "ended") {
      this.data.activeSession = createSession();
    }
    this.data.activeSession.status = "active";
    this.ensureStats();
    this.ensureTimer();
    this.changed();
  }

  pause(): void {
    if (this.data.activeSession) {
      this.data.activeSession.status = "paused";
      this.changed();
    }
  }

  resume(): void {
    if (this.data.activeSession) {
      this.data.activeSession.status = "active";
      this.registerActivity();
      this.changed();
    }
  }

  end(): void {
    const session = this.data.activeSession;
    if (!session) return;
    session.status = "ended";
    session.endedAt = Date.now();
    this.updateDailyScore();
    this.grantXp(10);
    this.data.bars.health = recoverHealth(this.data.bars.health, 2);
    new Notice("DeskQuest workday ended. Progress saved.");
    this.changed();
  }

  startBreak(minutes: number, label: string, xp: number, health = 0): void {
    const session = this.data.activeSession;
    const breakMs = minutes * 60000;
    if (session) {
      session.breakMs += breakMs;
      session.status = "paused";
    }
    this.data.bars.stamina = recoverStamina(this.data.bars.stamina, minutes);
    this.data.bars.health = recoverHealth(this.data.bars.health, health);
    this.grantXp(xp);
    this.incrementStat("breakMs", breakMs);
    new Notice(`${label} logged. Stamina recovered live.`);
    this.changed();
  }

  registerDrink(): void {
    const now = Date.now();
    if (this.data.lastHydrationAt && now - this.data.lastHydrationAt < 20 * 60000) {
      new Notice("Hydration check is cooling down to prevent XP farming.");
      return;
    }
    this.data.lastHydrationAt = now;
    this.data.bars.hydration = clamp(this.data.bars.hydration + 25, 0, 100);
    this.grantXp(5);
    this.incrementStat("hydrationCheckins", 1);
    this.completeQuestById("daily-hydration");
    new Notice("Hydration check registered.");
    this.changed();
  }

  registerMeal(kind: "breakfast" | "lunch" | "dinner" | "snack"): void {
    const now = Date.now();
    const lastMealAt = this.data.lastMealAt ?? {};
    const last = lastMealAt[kind];
    if (last && now - last < 45 * 60000) {
      new Notice("Meal check-in is cooling down.");
      return;
    }
    const values = this.data.settings.mealWindows;
    const value = kind === "snack" ? 15 : values[kind].value;
    this.data.lastMealAt = { ...lastMealAt, [kind]: now };
    this.data.bars.food = clamp(this.data.bars.food + value, 0, 100);
    this.grantXp(kind === "snack" ? 3 : 10);
    this.incrementStat(kind === "snack" ? "snackCheckins" : "mealCheckins", 1);
    new Notice(`${kind[0].toUpperCase()}${kind.slice(1)} registered.`);
    this.changed();
  }

  completeMovement(): void {
    this.data.bars.health = recoverHealth(this.data.bars.health, 5);
    this.data.bars.stamina = recoverStamina(this.data.bars.stamina, 2);
    this.grantXp(15);
    this.incrementStat("movementQuests", 1);
    this.completeQuestById("daily-movement");
    new Notice("Movement quest complete.");
    this.changed();
  }

  registerEyeBreak(): void {
    this.incrementStat("eyeBreaks", 1);
    this.grantXp(2);
    new Notice("Eye break logged.");
    this.changed();
  }

  completeQuest(id: string): void {
    if (!this.completeQuestById(id)) {
      new Notice("Quest already completed.");
      return;
    }
    new Notice("Quest complete.");
    this.changed();
  }

  registerActivity(): void {
    this.lastActivity = Date.now();
  }

  subscribe(handler: SessionChangeHandler): () => void {
    this.subscribers.push(handler);
    return () => {
      this.subscribers = this.subscribers.filter((item) => item !== handler);
    };
  }

  unload(): void {
    window.clearInterval(this.interval);
  }

  private ensureTimer(): void {
    if (this.interval) return;
    this.lastTick = Date.now();
    this.interval = window.setInterval(() => this.tick(), TICK_MS);
  }

  private tick(): void {
    const now = Date.now();
    const elapsed = now - this.lastTick;
    this.lastTick = now;

    if (elapsed > SLEEP_GAP_MS) {
      this.registerActivity();
      this.changed();
      return;
    }

    const session = this.data.activeSession;
    if (!session || session.status !== "active") return;

    const idleThresholdMs = this.data.settings.idleTimeoutMinutes * 60000;
    const isIdle = now - this.lastActivity > idleThresholdMs;

    if (isIdle) {
      session.idleMs += elapsed;
      this.data.bars.stamina = recoverStamina(this.data.bars.stamina, elapsed / 60000 / 2);
    } else {
      session.activeMs += elapsed;
      session.longestContinuousMs += elapsed;
      this.incrementStat("activeWorkMs", elapsed);
      this.data.bars.stamina = drainStamina(
        this.data.bars.stamina,
        session.longestContinuousMs / 60000,
        elapsed / 60000,
        this.data.settings.difficulty
      );
      this.data.bars.health = adjustHealthForSession(
        this.data.bars.health,
        session.longestContinuousMs / 60000,
        this.data.settings.difficulty
      );
      this.data.bars.hydration = clamp(this.data.bars.hydration - elapsed / 60000 * 0.3, 0, 100);
      this.data.bars.food = clamp(this.data.bars.food - elapsed / 60000 * 0.18, 0, 100);
      this.ensureLowestStamina();
    }

    this.updateDailyScore();
    this.changed();
  }

  private completeQuestById(id: string): boolean {
    const quest = this.data.dailyQuests.find((item) => item.id === id);
    if (!quest || quest.completed) return false;
    quest.completed = true;
    this.grantXp(quest.rewardXp);
    if (quest.rewardHealth) {
      this.data.bars.health = recoverHealth(this.data.bars.health, quest.rewardHealth);
    }
    if (quest.rewardStamina) {
      this.data.bars.stamina = recoverStamina(this.data.bars.stamina, quest.rewardStamina / 5);
    }
    return true;
  }

  private ensureStats(): void {
    const key = todayKey();
    if (this.data.stats[key]) return;
    this.data.stats[key] = {
      date: key,
      activeWorkMs: 0,
      breakMs: 0,
      longestSessionMs: 0,
      hydrationCheckins: 0,
      mealCheckins: 0,
      snackCheckins: 0,
      movementQuests: 0,
      eyeBreaks: 0,
      healthStart: this.data.bars.health,
      healthEnd: this.data.bars.health,
      lowestStamina: this.data.bars.stamina,
      xpEarned: 0,
      workdayScore: 0
    };
  }

  private incrementStat(key: NumericStatKey, amount: number): void {
    this.ensureStats();
    const stats = this.getTodayStats();
    stats[key] += amount;
  }

  private grantXp(amount: number): void {
    const safeAmount = Math.max(0, Math.floor(amount));
    this.data.xp = awardXp(this.data.xp, safeAmount);
    this.incrementStat("xpEarned", safeAmount);
  }

  private getTodayStats() {
    this.ensureStats();
    return this.data.stats[todayKey()];
  }

  private ensureLowestStamina(): void {
    const stats = this.getTodayStats();
    stats.lowestStamina = Math.min(stats.lowestStamina, this.data.bars.stamina);
  }

  private updateDailyScore(): void {
    const session = this.data.activeSession;
    const stats = this.getTodayStats();
    stats.healthEnd = this.data.bars.health;
    if (session) {
      stats.longestSessionMs = Math.max(stats.longestSessionMs, session.longestContinuousMs);
    }
    stats.workdayScore = calculateWorkdayScore(stats);
  }

  private changed(): void {
    this.save();
    this.subscribers.forEach((handler) => handler());
  }
}

function createSession(): WorkSession {
  return {
    id: makeId("session"),
    startedAt: Date.now(),
    activeMs: 0,
    idleMs: 0,
    breakMs: 0,
    longestContinuousMs: 0,
    status: "active"
  };
}
