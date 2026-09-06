import { ButtonComponent, Modal, Setting } from "obsidian";
import DeskQuestPlugin from "../main";
import { SKINS } from "../skins/definitions";
import { DifficultyMode } from "../data/types";

export class OnboardingModal extends Modal {
  private page = 0;

  constructor(private readonly plugin: DeskQuestPlugin) {
    super(plugin.app);
  }

  onOpen(): void {
    this.render();
  }

  private render(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("deskquest-onboarding");

    const pages = [
      () => this.welcome(contentEl),
      () => this.difficulty(contentEl),
      () => this.reminders(contentEl),
      () => this.skin(contentEl),
      () => this.privacy(contentEl)
    ];

    pages[this.page]();

    const nav = contentEl.createDiv({ cls: "deskquest-modal-actions" });
    new ButtonComponent(nav)
      .setButtonText(this.page === 0 ? "Skip" : "Back")
      .onClick(() => {
        if (this.page === 0) {
          void this.finish();
          return;
        }
        this.page -= 1;
        this.render();
      });
    new ButtonComponent(nav)
      .setButtonText(this.page === pages.length - 1 ? "Start Journey" : "Next")
      .setCta()
      .onClick(() => {
        if (this.page === pages.length - 1) {
          void this.finish();
          return;
        }
        this.page += 1;
        this.render();
      });
  }

  private welcome(parent: HTMLElement): void {
    parent.createEl("h2", { text: "Welcome to DeskQuest" });
    parent.createEl("p", { text: "Turn your work rhythm into a game. DeskQuest rewards focus plus recovery, not endless work." });
  }

  private difficulty(parent: HTMLElement): void {
    parent.createEl("h2", { text: "Choose your style" });
    new Setting(parent)
      .setName("Difficulty")
      .addDropdown((dropdown) => {
        ["relaxed", "balanced", "pomodoro", "deep-work", "hardcore", "custom"].forEach((mode) => {
          dropdown.addOption(mode, mode.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join(" "));
        });
        dropdown.setValue(this.plugin.data.settings.difficulty);
        dropdown.onChange((value) => {
          this.plugin.data.settings.difficulty = value as DifficultyMode;
        });
      });
  }

  private reminders(parent: HTMLElement): void {
    parent.createEl("h2", { text: "Choose reminders" });
    [
      ["Hydration", "hydrationEnabled"],
      ["Food", "foodEnabled"],
      ["Movement", "movementEnabled"],
      ["Eyes", "eyeBreaksEnabled"]
    ].forEach(([name, key]) => {
      new Setting(parent)
        .setName(name)
        .addToggle((toggle) => toggle
          .setValue(Boolean(this.plugin.data.settings[key as keyof typeof this.plugin.data.settings]))
          .onChange((value) => {
            Object.assign(this.plugin.data.settings, { [key]: value });
          }));
    });
  }

  private skin(parent: HTMLElement): void {
    parent.createEl("h2", { text: "Choose skin" });
    new Setting(parent)
      .setName("Skin")
      .addDropdown((dropdown) => {
        SKINS.forEach((skin) => dropdown.addOption(skin.id, skin.name));
        dropdown.setValue(this.plugin.data.settings.skin);
        dropdown.onChange((value) => {
          this.plugin.data.settings.skin = value;
          this.plugin.applySkin();
        });
      });
  }

  private privacy(parent: HTMLElement): void {
    parent.createEl("h2", { text: "Privacy" });
    parent.createEl("p", { text: "DeskQuest stores data locally in Obsidian plugin data. Tracking outside Obsidian is off by default and the current plugin does not read other app content." });
  }

  private async finish(): Promise<void> {
    this.plugin.data.onboarded = true;
    await this.plugin.saveNow();
    this.plugin.refreshUi();
    this.close();
  }
}
