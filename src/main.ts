import { Notice, Plugin, WorkspaceLeaf } from "obsidian";
import { RegenStore } from "./data/store";
import { RegenData } from "./data/types";
import { createDefaultData } from "./data/defaults";
import { SessionManager } from "./core/session-manager";
import { ReminderManager } from "./core/reminder-manager";
import { REGEN_VIEW_TYPE, RegenDashboardView } from "./views/dashboard";
import { RegenSettingTab } from "./views/settings-tab";
import { getSkin } from "./skins/definitions";
import { statusText } from "./components/hud";
import { OnboardingModal } from "./views/onboarding-modal";
import { ImportModal } from "./views/import-modal";
import { ConfirmModal } from "./views/confirm-modal";

export default class RegenPlugin extends Plugin {
  data: RegenData = createDefaultData();
  private store!: RegenStore;
  private sessions!: SessionManager;
  private reminders!: ReminderManager;
  private statusBarEl!: HTMLElement;
  private unsubscribeSession?: () => void;

  async onload(): Promise<void> {
    this.store = new RegenStore(this);
    this.data = await this.store.load();
    this.sessions = new SessionManager(this.data, () => this.requestSave());
    this.reminders = new ReminderManager(this.data, () => this.refreshAndSave(), (message) => new Notice(message));

    this.registerView(REGEN_VIEW_TYPE, (leaf: WorkspaceLeaf) => new RegenDashboardView(leaf, this.data, this.sessions, this.reminders));
    this.statusBarEl = this.addStatusBarItem();
    this.statusBarEl.addClass("regen-statusbar");
    this.statusBarEl.onClickEvent(() => void this.openDashboard());

    this.addSettingTab(new RegenSettingTab(this.app, this));
    this.addCommands();
    this.registerActivityListeners();
    this.applySkin();
    this.refreshUi();
    this.unsubscribeSession = this.sessions.subscribe(() => this.refreshUi());
    this.registerInterval(window.setInterval(() => this.reminders.evaluate(), 10000));

    if (this.data.settings.startAutomatically && this.data.settings.enabled) {
      this.sessions.start();
    }

    if (!this.data.onboarded) {
      this.app.workspace.onLayoutReady(() => new OnboardingModal(this).open());
    }

    console.log("Regen loaded.");
  }

  async onunload(): Promise<void> {
    this.unsubscribeSession?.();
    this.sessions.unload();
    await this.saveNow();
  }

  requestSave(): void {
    this.store.requestSave(this.data);
  }

  refreshAndSave(): void {
    this.requestSave();
    this.refreshUi();
  }

  async saveNow(): Promise<void> {
    await this.store.flush(this.data);
  }

  async replaceData(nextData: RegenData): Promise<void> {
    Object.keys(this.data).forEach((key) => delete (this.data as unknown as Record<string, unknown>)[key]);
    Object.assign(this.data, nextData);
    this.applySkin();
    await this.saveNow();
    this.refreshUi();
  }

  refreshUi(): void {
    this.statusBarEl.setText(statusText(this.data));
    this.app.workspace.getLeavesOfType(REGEN_VIEW_TYPE).forEach((leaf) => {
      const view = leaf.view;
      if (view instanceof RegenDashboardView) {
        view.render();
      }
    });
  }

  applySkin(): void {
    const skin = getSkin(this.data.settings.skin);
    document.body.style.setProperty("--regen-accent", skin.accent);
    document.body.style.setProperty("--regen-background", skin.background);
    document.body.style.setProperty("--regen-border", skin.border);
    document.body.style.setProperty("--regen-meter", skin.meter);
  }

  async openDashboard(): Promise<void> {
    let leaf = this.app.workspace.getLeavesOfType(REGEN_VIEW_TYPE)[0];
    if (!leaf) {
      leaf = this.app.workspace.getRightLeaf(false) ?? this.app.workspace.getLeaf(true);
      await leaf.setViewState({ type: REGEN_VIEW_TYPE, active: true });
    }
    this.app.workspace.revealLeaf(leaf);
  }

  private addCommands(): void {
    this.addCommand({
      id: "open-regen",
      name: "Open Regen",
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
      callback: () => this.reminders.snooze(10)
    });
    this.addCommand({
      id: "dismiss-current-reminder",
      name: "Dismiss Current Reminder",
      callback: () => this.reminders.dismiss()
    });
    this.addCommand({
      id: "pause-regen",
      name: "Pause Regen",
      callback: () => this.sessions.pause()
    });
    this.addCommand({
      id: "resume-regen",
      name: "Resume Regen",
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
      name: "Export Regen Data as JSON",
      callback: () => void this.exportJson()
    });
    this.addCommand({
      id: "export-csv",
      name: "Export Regen Stats as CSV",
      callback: () => void this.exportCsv()
    });
    this.addCommand({
      id: "import-json",
      name: "Import Regen Data from JSON",
      callback: () => new ImportModal(this).open()
    });
    this.addCommand({
      id: "reset-today",
      name: "Reset Today",
      callback: () => this.confirmResetToday()
    });
    this.addCommand({
      id: "reset-game-progress",
      name: "Reset Game Progress",
      callback: () => this.confirmResetGameProgress()
    });
    this.addCommand({
      id: "reset-everything",
      name: "Reset Everything",
      callback: () => this.confirmResetEverything()
    });
    this.addCommand({
      id: "show-onboarding",
      name: "Show Onboarding",
      callback: () => new OnboardingModal(this).open()
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
    const path = await this.getAvailablePath(`regen-export-${new Date().toISOString().slice(0, 10)}.json`);
    await this.app.vault.create(path, JSON.stringify(this.data, null, 2));
    new Notice(`Regen JSON export created: ${path}`);
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
    const path = await this.getAvailablePath(`regen-stats-${new Date().toISOString().slice(0, 10)}.csv`);
    await this.app.vault.create(path, [header, ...rows].join("\n"));
    new Notice(`Regen CSV export created: ${path}`);
  }

  private async getAvailablePath(basePath: string): Promise<string> {
    if (!this.app.vault.getAbstractFileByPath(basePath)) return basePath;
    const dot = basePath.lastIndexOf(".");
    const name = dot >= 0 ? basePath.slice(0, dot) : basePath;
    const ext = dot >= 0 ? basePath.slice(dot) : "";
    let index = 2;
    while (this.app.vault.getAbstractFileByPath(`${name}-${index}${ext}`)) {
      index += 1;
    }
    return `${name}-${index}${ext}`;
  }

  private confirmResetToday(): void {
    new ConfirmModal(
      this,
      "Reset Today",
      "This clears today's Regen statistics and active reminder. Game progress and settings stay intact.",
      "Reset Today",
      async () => {
        delete this.data.stats[new Date().toISOString().slice(0, 10)];
        this.data.activeReminder = undefined;
        await this.saveNow();
        this.refreshUi();
      }
    ).open();
  }

  private confirmResetGameProgress(): void {
    new ConfirmModal(
      this,
      "Reset Game Progress",
      "This resets bars, XP, quests, reminders and statistics. Settings stay intact.",
      "Reset Progress",
      async () => {
        const fresh = createDefaultData();
        fresh.settings = this.data.settings;
        await this.replaceData(fresh);
      }
    ).open();
  }

  private confirmResetEverything(): void {
    new ConfirmModal(
      this,
      "Reset Everything",
      "This resets all Regen settings, progress, reminders and statistics.",
      "Reset Everything",
      async () => {
        await this.replaceData(createDefaultData());
      }
    ).open();
  }
}
