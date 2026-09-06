import { ItemView, WorkspaceLeaf, ButtonComponent } from "obsidian";
import { DeskQuestData } from "../data/types";
import { DISCLAIMER } from "../data/defaults";
import { renderHud } from "../components/hud";
import { SessionManager } from "../core/session-manager";
import { todayKey, msToShort } from "../utils/dates";
import { workdayScoreLabel } from "../game/score-engine";

export const DESKQUEST_VIEW_TYPE = "deskquest-dashboard";

export class DeskQuestDashboardView extends ItemView {
  constructor(
    leaf: WorkspaceLeaf,
    private readonly data: DeskQuestData,
    private readonly sessions: SessionManager
  ) {
    super(leaf);
  }

  getViewType(): string {
    return DESKQUEST_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "DeskQuest";
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
    container.addClass("deskquest-view");

    const header = container.createDiv({ cls: "deskquest-dashboard-header" });
    header.createEl("h1", { text: "DeskQuest" });
    header.createEl("p", { text: "Work. Recover. Continue." });

    const hud = container.createDiv();
    renderHud(hud, this.data);

    const actions = container.createDiv({ cls: "deskquest-actions" });
    new ButtonComponent(actions).setButtonText("Start Work").setIcon("play").setCta().onClick(() => this.sessions.start());
    new ButtonComponent(actions).setButtonText("Take Break").setIcon("pause").onClick(() => this.sessions.startBreak(5, "Short break", 10, 2));
    new ButtonComponent(actions).setButtonText("Drink").setIcon("droplets").onClick(() => this.sessions.registerDrink());
    new ButtonComponent(actions).setButtonText("Meal").setIcon("utensils").onClick(() => this.sessions.registerMeal("lunch"));
    new ButtonComponent(actions).setButtonText("Move").setIcon("footprints").onClick(() => this.sessions.completeMovement());
    new ButtonComponent(actions).setButtonText("End Day").setIcon("square").onClick(() => this.sessions.end());

    const grid = container.createDiv({ cls: "deskquest-grid" });
    this.renderSession(grid);
    this.renderQuests(grid);
    this.renderStats(grid);
    this.renderHelp(grid);
  }

  private renderSession(parent: HTMLElement): void {
    const card = parent.createDiv({ cls: "deskquest-panel" });
    card.createEl("h2", { text: "Current Status" });
    const session = this.data.activeSession;
    card.createEl("p", { text: session ? `Session: ${session.status}` : "No active work session." });
    card.createEl("p", { text: `Active work: ${msToShort(session?.activeMs ?? 0)}` });
    card.createEl("p", { text: `Break time: ${msToShort(session?.breakMs ?? 0)}` });
    const low = this.data.bars.stamina < this.data.settings.lowStaminaThreshold;
    if (low) {
      card.createEl("p", {
        text: "Low Stamina. A recovery break may help.",
        cls: "deskquest-nudge"
      });
    }
  }

  private renderQuests(parent: HTMLElement): void {
    const card = parent.createDiv({ cls: "deskquest-panel" });
    card.createEl("h2", { text: "Daily Quests" });
    this.data.dailyQuests.forEach((quest) => {
      const row = card.createDiv({ cls: "deskquest-quest" });
      row.createSpan({ text: quest.completed ? "Done" : "Open", cls: quest.completed ? "deskquest-done" : "deskquest-open" });
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
    const card = parent.createDiv({ cls: "deskquest-panel" });
    const stats = this.data.stats[todayKey()];
    card.createEl("h2", { text: "Workday Score" });
    const score = stats?.workdayScore ?? 0;
    card.createEl("div", { text: String(score), cls: "deskquest-score" });
    card.createEl("p", { text: workdayScoreLabel(score) });
    card.createEl("p", { text: `Hydration: ${stats?.hydrationCheckins ?? 0}` });
    card.createEl("p", { text: `Movement: ${stats?.movementQuests ?? 0}` });
    card.createEl("p", { text: `Meals: ${stats?.mealCheckins ?? 0}` });
  }

  private renderHelp(parent: HTMLElement): void {
    const card = parent.createDiv({ cls: "deskquest-panel deskquest-panel-muted" });
    card.createEl("h2", { text: "Privacy" });
    card.createEl("p", { text: DISCLAIMER });
  }
}
