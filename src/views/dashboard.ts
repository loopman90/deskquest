import { ItemView, WorkspaceLeaf, ButtonComponent } from "obsidian";
import { DailyStats, RegenData, ReminderObjective } from "../data/types";
import { DISCLAIMER } from "../data/defaults";
import { renderHud } from "../components/hud";
import { SessionManager } from "../core/session-manager";
import { ReminderManager } from "../core/reminder-manager";
import { todayKey, msToShort } from "../utils/dates";
import { workdayScoreLabel } from "../game/score-engine";

export const REGEN_VIEW_TYPE = "regen-dashboard";

export class RegenDashboardView extends ItemView {
  constructor(
    leaf: WorkspaceLeaf,
    private readonly data: RegenData,
    private readonly sessions: SessionManager,
    private readonly reminders: ReminderManager
  ) {
    super(leaf);
  }

  getViewType(): string {
    return REGEN_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Regen";
  }

  getIcon(): string {
    return "gamepad-2";
  }

  async onOpen(): Promise<void> {
    this.render();
  }

  render(): void {
    const container = this.containerEl.children[1] as HTMLElement;
    container.empty();
    container.addClass("regen-view");

    const header = container.createDiv({ cls: "regen-dashboard-header" });
    header.createEl("h1", { text: "Regen" });
    header.createEl("p", { text: "Work. Recover. Continue." });

    const hud = container.createDiv();
    renderHud(hud, this.data);

    const actions = container.createDiv({ cls: "regen-actions" });
    new ButtonComponent(actions).setButtonText("Start Work").setIcon("play").setCta().onClick(() => this.sessions.start());
    new ButtonComponent(actions).setButtonText("Take Break").setIcon("pause").onClick(() => this.sessions.startBreak(5, "Short break", 10, 2));
    new ButtonComponent(actions).setButtonText("Drink").setIcon("droplets").onClick(() => this.sessions.registerDrink());
    new ButtonComponent(actions).setButtonText("Meal").setIcon("utensils").onClick(() => this.sessions.registerMeal("lunch"));
    new ButtonComponent(actions).setButtonText("Move").setIcon("footprints").onClick(() => this.sessions.completeMovement());
    new ButtonComponent(actions).setButtonText("End Day").setIcon("square").onClick(() => this.sessions.end());

    const grid = container.createDiv({ cls: "regen-grid" });
    this.renderReminder(grid);
    this.renderSession(grid);
    this.renderQuests(grid);
    this.renderDailyStats(grid);
    this.renderWeeklyStats(grid);
    this.renderMonthlyStats(grid);
    this.renderHelp(grid);
  }

  private renderReminder(parent: HTMLElement): void {
    const reminder = this.data.activeReminder;
    if (!reminder) return;
    const card = parent.createDiv({ cls: `regen-panel regen-reminder regen-reminder-${reminder.level}` });
    card.createEl("h2", { text: reminder.title });
    card.createEl("p", { text: reminder.message });
    card.createEl("p", { text: `Priority: ${reminder.level}` });
    if (reminder.snoozedUntil) {
      card.createEl("p", { text: `Snoozed until ${new Date(reminder.snoozedUntil).toLocaleTimeString()}` });
    }
    const objectives = card.createDiv({ cls: "regen-objectives" });
    reminder.objectives.forEach((objective) => this.renderReminderObjective(objectives, objective));

    const actions = card.createDiv({ cls: "regen-actions regen-actions-tight" });
    new ButtonComponent(actions).setButtonText("Snooze 5m").setIcon("clock").onClick(() => this.reminders.snooze(5));
    new ButtonComponent(actions).setButtonText("Snooze 15m").setIcon("clock").onClick(() => this.reminders.snooze(15));
    new ButtonComponent(actions).setButtonText("Dismiss").setIcon("x").onClick(() => this.reminders.dismiss());
  }

  private renderReminderObjective(parent: HTMLElement, objective: ReminderObjective): void {
    const row = parent.createDiv({ cls: "regen-objective" });
    row.createSpan({ text: objective.completed ? "Done" : "Open", cls: objective.completed ? "regen-done" : "regen-open" });
    row.createSpan({ text: objective.label });
    const button = new ButtonComponent(row).setIcon("check").setTooltip(objective.label);
    if (objective.category === "break") {
      button.setButtonText("Break").setCta().onClick(() => {
        this.sessions.startBreak(5, "Recovery break", 10, 2);
        this.reminders.completeObjective("break");
      });
    } else if (objective.category === "hydration") {
      button.setButtonText("Drink").onClick(() => {
        this.sessions.registerDrink();
        this.reminders.completeObjective("hydration");
      });
    } else if (objective.category === "movement") {
      button.setButtonText("Move").onClick(() => {
        this.sessions.completeMovement();
        this.reminders.completeObjective("movement");
      });
    } else if (objective.category === "eyes") {
      button.setButtonText("Eyes").onClick(() => {
        this.sessions.registerEyeBreak();
        this.reminders.completeObjective("eyes");
      });
    } else {
      button.setButtonText("Log").onClick(() => {
        this.sessions.registerMeal("lunch");
        this.reminders.completeObjective("food");
      });
    }
  }

  private renderSession(parent: HTMLElement): void {
    const card = parent.createDiv({ cls: "regen-panel" });
    card.createEl("h2", { text: "Current Status" });
    const session = this.data.activeSession;
    card.createEl("p", { text: session ? `Session: ${session.status}` : "No active work session." });
    card.createEl("p", { text: `Active work: ${msToShort(session?.activeMs ?? 0)}` });
    card.createEl("p", { text: `Break time: ${msToShort(session?.breakMs ?? 0)}` });
    const low = this.data.bars.stamina < this.data.settings.lowStaminaThreshold;
    if (low) {
      card.createEl("p", {
        text: "Low Stamina. A recovery break may help.",
        cls: "regen-nudge"
      });
    }
  }

  private renderQuests(parent: HTMLElement): void {
    const card = parent.createDiv({ cls: "regen-panel" });
    card.createEl("h2", { text: "Daily Quests" });
    this.data.dailyQuests.forEach((quest) => {
      const row = card.createDiv({ cls: "regen-quest" });
      row.createSpan({ text: quest.completed ? "Done" : "Open", cls: quest.completed ? "regen-done" : "regen-open" });
      const text = row.createDiv();
      text.createEl("strong", { text: quest.title });
      text.createEl("p", { text: quest.description });
      new ButtonComponent(row)
        .setIcon("check")
        .setTooltip("Complete quest")
        .onClick(() => this.sessions.completeQuest(quest.id));
    });
  }

  private renderDailyStats(parent: HTMLElement): void {
    const card = parent.createDiv({ cls: "regen-panel" });
    const stats = this.data.stats[todayKey()];
    card.createEl("h2", { text: "Today" });
    const score = stats?.workdayScore ?? 0;
    card.createDiv({ text: String(score), cls: "regen-score" });
    card.createEl("p", { text: workdayScoreLabel(score) });
    this.renderStatList(card, [
      ["Active work", msToShort(stats?.activeWorkMs ?? 0)],
      ["Break time", msToShort(stats?.breakMs ?? 0)],
      ["Longest session", msToShort(stats?.longestSessionMs ?? 0)],
      ["Lowest stamina", `${Math.round(stats?.lowestStamina ?? this.data.bars.stamina)}`],
      ["XP earned", `${stats?.xpEarned ?? 0}`]
    ]);
  }

  private renderWeeklyStats(parent: HTMLElement): void {
    const card = parent.createDiv({ cls: "regen-panel" });
    card.createEl("h2", { text: "This Week" });
    const stats = statsInLastDays(Object.values(this.data.stats), 7);
    const summary = summarizeStats(stats);
    this.renderStatList(card, [
      ["Active work", msToShort(summary.activeWorkMs)],
      ["Break time", msToShort(summary.breakMs)],
      ["Average score", `${summary.averageScore}`],
      ["Hydration", `${summary.hydrationCheckins}`],
      ["Movement", `${summary.movementQuests}`],
      ["XP earned", `${summary.xpEarned}`]
    ]);
  }

  private renderMonthlyStats(parent: HTMLElement): void {
    const card = parent.createDiv({ cls: "regen-panel" });
    card.createEl("h2", { text: "This Month" });
    const now = new Date();
    const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const stats = Object.values(this.data.stats).filter((stat) => stat.date.startsWith(prefix));
    const summary = summarizeStats(stats);
    this.renderStatList(card, [
      ["Tracked days", `${stats.length}`],
      ["Active work", msToShort(summary.activeWorkMs)],
      ["Break time", msToShort(summary.breakMs)],
      ["Average score", `${summary.averageScore}`],
      ["Meals", `${summary.mealCheckins}`],
      ["Eye breaks", `${summary.eyeBreaks}`]
    ]);
    this.renderHistory(card, stats.slice(-8).reverse());
  }

  private renderStatList(parent: HTMLElement, rows: Array<[string, string]>): void {
    const list = parent.createDiv({ cls: "regen-stat-list" });
    rows.forEach(([label, value]) => {
      const row = list.createDiv({ cls: "regen-stat-row" });
      row.createSpan({ text: label });
      row.createSpan({ text: value });
    });
  }

  private renderHistory(parent: HTMLElement, stats: DailyStats[]): void {
    const wrap = parent.createDiv({ cls: "regen-history" });
    wrap.createEl("h3", { text: "Recent days" });
    if (stats.length === 0) {
      wrap.createEl("p", { text: "No history yet." });
      return;
    }
    stats.forEach((stat) => {
      const row = wrap.createDiv({ cls: "regen-history-row" });
      row.createSpan({ text: stat.date });
      row.createSpan({ text: `${stat.workdayScore}` });
      row.createSpan({ text: msToShort(stat.activeWorkMs) });
    });
  }

  private renderHelp(parent: HTMLElement): void {
    const card = parent.createDiv({ cls: "regen-panel regen-panel-muted" });
    card.createEl("h2", { text: "Privacy" });
    card.createEl("p", { text: DISCLAIMER });
  }
}

interface StatsSummary {
  activeWorkMs: number;
  breakMs: number;
  hydrationCheckins: number;
  mealCheckins: number;
  snackCheckins: number;
  movementQuests: number;
  eyeBreaks: number;
  xpEarned: number;
  averageScore: number;
}

function statsInLastDays(stats: DailyStats[], days: number): DailyStats[] {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return stats.filter((stat) => new Date(`${stat.date}T00:00:00`).getTime() >= cutoff);
}

function summarizeStats(stats: DailyStats[]): StatsSummary {
  const summary = stats.reduce<StatsSummary>((acc, stat) => ({
    activeWorkMs: acc.activeWorkMs + stat.activeWorkMs,
    breakMs: acc.breakMs + stat.breakMs,
    hydrationCheckins: acc.hydrationCheckins + stat.hydrationCheckins,
    mealCheckins: acc.mealCheckins + stat.mealCheckins,
    snackCheckins: acc.snackCheckins + stat.snackCheckins,
    movementQuests: acc.movementQuests + stat.movementQuests,
    eyeBreaks: acc.eyeBreaks + stat.eyeBreaks,
    xpEarned: acc.xpEarned + stat.xpEarned,
    averageScore: acc.averageScore
  }), {
    activeWorkMs: 0,
    breakMs: 0,
    hydrationCheckins: 0,
    mealCheckins: 0,
    snackCheckins: 0,
    movementQuests: 0,
    eyeBreaks: 0,
    xpEarned: 0,
    averageScore: 0
  });
  const scored = stats.filter((stat) => stat.workdayScore > 0);
  summary.averageScore = scored.length === 0
    ? 0
    : Math.round(scored.reduce((total, stat) => total + stat.workdayScore, 0) / scored.length);
  return summary;
}
