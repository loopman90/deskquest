import { Notice, Plugin, WorkspaceLeaf } from "obsidian";
import { DeskQuestStore } from "./data/store";
import { DeskQuestData } from "./data/types";
import { createDefaultData } from "./data/defaults";
import { SessionManager } from "./core/session-manager";
import { DESKQUEST_VIEW_TYPE, DeskQuestDashboardView } from "./views/dashboard";
import { DeskQuestSettingTab } from "./views/settings-tab";
import { getSkin } from "./skins/definitions";
import { statusText } from "./components/hud";

export default class DeskQuestPlugin extends Plugin {
  data: DeskQuestData = createDefaultData();
  private store!: DeskQuestStore;
  private sessions!: SessionManager;
  private statusBarEl!: HTMLElement;
  private unsubscribeSession?: () => void;

  async onload(): Promise<void> {
    this.store = new DeskQuestStore(this);
    this.data = await this.store.load();
    this.sessions = new SessionManager(this.data, () => this.requestSave());

    this.registerView(DESKQUEST_VIEW_TYPE, (leaf: WorkspaceLeaf) => new DeskQuestDashboardView(leaf, this.data, this.sessions));
    this.statusBarEl = this.addStatusBarItem();
    this.statusBarEl.addClass("deskquest-statusbar");
    this.statusBarEl.onClickEvent(() => void this.openDashboard());

    this.addSettingTab(new DeskQuestSettingTab(this.app, this));
    this.addCommands();
    this.registerActivityListeners();
    this.applySkin();
    this.refreshUi();
    this.unsubscribeSession = this.sessions.subscribe(() => this.refreshUi());

    if (this.data.settings.startAutomatically && this.data.settings.enabled) {
      this.sessions.start();
    }

    console.log("DeskQuest loaded.");
  }

  async onunload(): Promise<void> {
    this.unsubscribeSession?.();
    this.sessions.unload();
    await this.saveNow();
  }

  requestSave(): void {
    this.store.requestSave(this.data);
  }

  async saveNow(): Promise<void> {
    await this.store.flush(this.data);
  }

  refreshUi(): void {
    this.statusBarEl.setText(statusText(this.data));
    this.app.workspace.getLeavesOfType(DESKQUEST_VIEW_TYPE).forEach((leaf) => {
      const view = leaf.view;
      if (view instanceof DeskQuestDashboardView) {
        view.render();
      }
    });
  }

  applySkin(): void {
    const skin = getSkin(this.data.settings.skin);
    document.body.style.setProperty("--deskquest-accent", skin.accent);
    document.body.style.setProperty("--deskquest-background", skin.background);
    document.body.style.setProperty("--deskquest-border", skin.border);
    document.body.style.setProperty("--deskquest-meter", skin.meter);
  }

  async openDashboard(): Promise<void> {
    let leaf = this.app.workspace.getLeavesOfType(DESKQUEST_VIEW_TYPE)[0];
    if (!leaf) {
      leaf = this.app.workspace.getRightLeaf(false) ?? this.app.workspace.getLeaf(true);
      await leaf.setViewState({ type: DESKQUEST_VIEW_TYPE, active: true });
    }
    this.app.workspace.revealLeaf(leaf);
  }

  private addCommands(): void {
    this.addCommand({
      id: "open-deskquest",
      name: "Open DeskQuest",
      callback: () => void this.openDashboard()
    });
    this.addCommand({
      id: "start-work-session",
      name: "Start Work Session",
      callback: () => this.sessions.start()
    });
    this.addCommand({
      id: "start-focus-session",
      name: "Start Focus Session",
      callback: () => {
        this.sessions.start();
        new Notice("Focus session started. Recovery still counts toward victory.");
      }
    });
    this.addCommand({
      id: "start-focus-boss",
      name: "Start Focus Boss",
      callback: () => {
        this.sessions.start();
        new Notice("Focus Boss started. Finish with recovery for full XP.");
      }
    });
    this.addCommand({
      id: "start-microbreak",
      name: "Start Microbreak",
      callback: () => this.sessions.startBreak(2, "Microbreak", 3, 1)
    });
    this.addCommand({
      id: "start-short-break",
      name: "Start Short Break",
      callback: () => this.sessions.startBreak(5, "Short break", 10, 2)
    });
    this.addCommand({
      id: "start-recovery-break",
      name: "Start Recovery Break",
      callback: () => this.sessions.startBreak(10, "Recovery break", 20, 4)
    });
    this.addCommand({
      id: "start-long-break",
      name: "Start Long Break",
      callback: () => this.sessions.startBreak(20, "Long break", 20, 6)
    });
    this.addCommand({
      id: "register-drink",
      name: "Register Drink",
      callback: () => this.sessions.registerDrink()
    });
    this.addCommand({
      id: "register-breakfast",
      name: "Register Breakfast",
      callback: () => this.sessions.registerMeal("breakfast")
    });
    this.addCommand({
      id: "register-lunch",
      name: "Register Lunch",
      callback: () => this.sessions.registerMeal("lunch")
    });
    this.addCommand({
      id: "register-dinner",
      name: "Register Dinner",
      callback: () => this.sessions.registerMeal("dinner")
    });
    this.addCommand({
      id: "register-snack",
      name: "Register Snack",
      callback: () => this.sessions.registerMeal("snack")
    });
    this.addCommand({
      id: "start-movement-quest",
      name: "Start Movement Quest",
      callback: () => this.sessions.completeMovement()
    });
    this.addCommand({
      id: "log-mood",
      name: "Log Mood",
      callback: () => new Notice("Mood check-ins are planned for v1.1.")
    });
    this.addCommand({
      id: "snooze-current-reminder",
      name: "Snooze Current Reminder",
      callback: () => new Notice("Reminder snoozed.")
    });
    this.addCommand({
      id: "pause-deskquest",
      name: "Pause DeskQuest",
      callback: () => this.sessions.pause()
    });
    this.addCommand({
      id: "resume-deskquest",
      name: "Resume DeskQuest",
      callback: () => this.sessions.resume()
    });
    this.addCommand({
      id: "end-workday",
      name: "End Workday",
      callback: () => this.sessions.end()
    });
    this.addCommand({
      id: "show-daily-quests",
      name: "Show Daily Quests",
      callback: () => void this.openDashboard()
    });
    this.addCommand({
      id: "show-weekly-goals",
      name: "Show Weekly Goals",
      callback: () => void this.openDashboard()
    });
    this.addCommand({
      id: "show-statistics",
      name: "Show Statistics",
      callback: () => void this.openDashboard()
    });
    this.addCommand({
      id: "toggle-hud",
      name: "Toggle HUD",
      callback: () => {
        const current = this.data.settings.hudMode;
        this.data.settings.hudMode = current === "full" ? "compact" : current === "compact" ? "minimal" : "full";
        this.requestSave();
        this.refreshUi();
      }
    });
    this.addCommand({
      id: "export-json",
      name: "Export DeskQuest Data as JSON",
      callback: () => void this.exportJson()
    });
    this.addCommand({
      id: "export-csv",
      name: "Export DeskQuest Stats as CSV",
      callback: () => void this.exportCsv()
    });
  }

  private registerActivityListeners(): void {
    const register = () => this.sessions.registerActivity();
    this.registerDomEvent(document, "keydown", register);
    this.registerDomEvent(document, "pointerdown", register);
    this.registerDomEvent(document, "mousemove", register);
    this.registerEvent(this.app.workspace.on("file-open", register));
    this.registerEvent(this.app.workspace.on("editor-change", register));
  }

  private async exportJson(): Promise<void> {
    const path = `deskquest-export-${new Date().toISOString().slice(0, 10)}.json`;
    await this.app.vault.create(path, JSON.stringify(this.data, null, 2));
    new Notice(`DeskQuest JSON export created: ${path}`);
  }

  private async exportCsv(): Promise<void> {
    const header = "date,activeWorkMinutes,breakMinutes,hydrationCheckins,mealCheckins,snackCheckins,movementQuests,eyeBreaks,workdayScore";
    const rows = Object.values(this.data.stats).map((stat) => [
      stat.date,
      Math.round(stat.activeWorkMs / 60000),
      Math.round(stat.breakMs / 60000),
      stat.hydrationCheckins,
      stat.mealCheckins,
      stat.snackCheckins,
      stat.movementQuests,
      stat.eyeBreaks,
      stat.workdayScore
    ].join(","));
    const path = `deskquest-stats-${new Date().toISOString().slice(0, 10)}.csv`;
    await this.app.vault.create(path, [header, ...rows].join("\n"));
    new Notice(`DeskQuest CSV export created: ${path}`);
  }
}
