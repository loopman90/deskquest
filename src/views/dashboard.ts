import { ItemView, WorkspaceLeaf, ButtonComponent } from "obsidian";
import { RegenData } from "../data/types";
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
    this.renderStats(grid);
    this.renderHistory(grid);
    this.renderHelp(grid);
  }

  private renderReminder(parent: HTMLElement): void {
    const reminder = this.data.activeReminder;
    if (!reminder) return;
    const card = parent.createDiv({ cls: `regen-panel regen-reminder regen-reminder-${reminder.level}` });
    card.createEl("h2", { text: reminder.title });
    card.createEl("p", { text: reminder.message });
    card.createEl("p", { text: `Level: ${reminder.level}` });
    const actions = card.createDiv({ cls: "regen-actions regen-actions-tight" });
    new ButtonComponent(actions).setButtonText("Snooze").setIcon("clock").onClick(() => this.reminders.snooze(10));
    new ButtonComponent(actions).setButtonText("Dismiss").setIcon("x").onClick(() => this.reminders.dismiss());
    new ButtonComponent(actions).setButtonText("Take Break").setIcon("pause").setCta().onClick(() => this.sessions.startBreak(5, "Recovery break", 10, 2));
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

  private renderStats(parent: HTMLElement): void {
    const card = parent.createDiv({ cls: "regen-panel" });
    const stats = this.data.stats[todayKey()];
    card.createEl("h2", { text: "Workday Score" });
    const score = stats?.workdayScore ?? 0;
    card.createEl("div", { text: String(score), cls: "regen-score" });
    card.createEl("p", { text: workdayScoreLabel(score) });
    card.createEl("p", { text: `Hydration: ${stats?.hydrationCheckins ?? 0}` });
    card.createEl("p", { text: `Movement: ${stats?.movementQuests ?? 0}` });
    card.createEl("p", { text: `Meals: ${stats?.mealCheckins ?? 0}` });
    card.createEl("p", { text: `XP earned: ${stats?.xpEarned ?? 0}` });
  }

  private renderHistory(parent: HTMLElement): void {
    const card = parent.createDiv({ cls: "regen-panel" });
    card.createEl("h2", { text: "History" });
    const recent = Object.values(this.data.stats).slice(-7).reverse();
    if (recent.length === 0) {
      card.createEl("p", { text: "No history yet." });
      return;
    }
    recent.forEach((stat) => {
      const row = card.createDiv({ cls: "regen-history-row" });
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
