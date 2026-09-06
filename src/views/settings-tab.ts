import { App, PluginSettingTab, Setting } from "obsidian";
import RegenPlugin from "../main";
import { SKINS } from "../skins/definitions";
import { DifficultyMode } from "../data/types";

export class RegenSettingTab extends PluginSettingTab {
  constructor(app: App, private readonly plugin: RegenPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass("regen-settings");

    containerEl.createEl("h2", { text: "Regen Settings" });
    containerEl.createEl("p", {
      text: "All values are local game indicators. Regen never blocks work and does not provide medical advice.",
      cls: "setting-item-description"
    });

    new Setting(containerEl)
      .setName("Enable Regen")
      .setDesc("Turns the HUD, commands and local tracking on or off.")
      .addToggle((toggle) => toggle
        .setValue(this.plugin.data.settings.enabled)
        .onChange(async (value) => {
          this.plugin.data.settings.enabled = value;
          await this.plugin.saveNow();
        }));

    new Setting(containerEl)
      .setName("Track activity outside Obsidian")
      .setDesc("Default off. Regen will never read content from other apps; unsupported platforms fall back to Obsidian activity.")
      .addToggle((toggle) => toggle
        .setValue(this.plugin.data.settings.trackOutsideObsidian)
        .onChange(async (value) => {
          this.plugin.data.settings.trackOutsideObsidian = value;
          await this.plugin.saveNow();
        }));

    new Setting(containerEl)
      .setName("Difficulty")
      .setDesc("Balanced is recommended. Hardcore changes game pacing only and makes no health claims.")
      .addDropdown((dropdown) => {
        ["relaxed", "balanced", "pomodoro", "deep-work", "hardcore", "custom"].forEach((mode) => {
          dropdown.addOption(mode, label(mode));
        });
        dropdown.setValue(this.plugin.data.settings.difficulty);
        dropdown.onChange(async (value) => {
          this.plugin.data.settings.difficulty = value as DifficultyMode;
          await this.plugin.saveNow();
        });
      });

    new Setting(containerEl)
      .setName("Idle timeout")
      .setDesc("After this many minutes without Obsidian activity, active work and stamina drain pause.")
      .addSlider((slider) => slider
        .setLimits(1, 20, 1)
        .setDynamicTooltip()
        .setValue(this.plugin.data.settings.idleTimeoutMinutes)
        .onChange(async (value) => {
          this.plugin.data.settings.idleTimeoutMinutes = value;
          await this.plugin.saveNow();
        }));

    new Setting(containerEl)
      .setName("Hydration reminders")
      .addToggle((toggle) => toggle
        .setValue(this.plugin.data.settings.hydrationEnabled)
        .onChange(async (value) => {
          this.plugin.data.settings.hydrationEnabled = value;
          await this.plugin.saveNow();
        }));

    new Setting(containerEl)
      .setName("All reminders")
      .setDesc("Turns Regen reminder generation on or off. Manual commands keep working.")
      .addToggle((toggle) => toggle
        .setValue(this.plugin.data.settings.remindersEnabled)
        .onChange(async (value) => {
          this.plugin.data.settings.remindersEnabled = value;
          await this.plugin.saveNow();
        }));

    new Setting(containerEl)
      .setName("Hydration interval")
      .setDesc("Recommended default: 75 minutes plus a small random offset.")
      .addSlider((slider) => slider
        .setLimits(30, 120, 5)
        .setDynamicTooltip()
        .setValue(this.plugin.data.settings.hydrationIntervalMinutes)
        .onChange(async (value) => {
          this.plugin.data.settings.hydrationIntervalMinutes = value;
          await this.plugin.saveNow();
        }));

    new Setting(containerEl)
      .setName("Track caffeine separately")
      .setDesc("Logbook only. No medical judgement is made.")
      .addToggle((toggle) => toggle
        .setValue(this.plugin.data.settings.caffeineMode)
        .onChange(async (value) => {
          this.plugin.data.settings.caffeineMode = value;
          await this.plugin.saveNow();
        }));

    new Setting(containerEl)
      .setName("Movement quests")
      .addToggle((toggle) => toggle
        .setValue(this.plugin.data.settings.movementEnabled)
        .onChange(async (value) => {
          this.plugin.data.settings.movementEnabled = value;
          await this.plugin.saveNow();
        }));

    new Setting(containerEl)
      .setName("Movement quest interval")
      .addSlider((slider) => slider
        .setLimits(20, 120, 5)
        .setDynamicTooltip()
        .setValue(this.plugin.data.settings.movementQuestIntervalMinutes)
        .onChange(async (value) => {
          this.plugin.data.settings.movementQuestIntervalMinutes = value;
          await this.plugin.saveNow();
        }));

    new Setting(containerEl)
      .setName("Eye breaks")
      .addToggle((toggle) => toggle
        .setValue(this.plugin.data.settings.eyeBreaksEnabled)
        .onChange(async (value) => {
          this.plugin.data.settings.eyeBreaksEnabled = value;
          await this.plugin.saveNow();
        }));

    new Setting(containerEl)
      .setName("Eye break interval")
      .addSlider((slider) => slider
        .setLimits(10, 60, 5)
        .setDynamicTooltip()
        .setValue(this.plugin.data.settings.eyeBreakIntervalMinutes)
        .onChange(async (value) => {
          this.plugin.data.settings.eyeBreakIntervalMinutes = value;
          await this.plugin.saveNow();
        }));

    new Setting(containerEl)
      .setName("Recovery prompt")
      .setDesc("Minutes of continuous active work before Regen suggests recovery.")
      .addSlider((slider) => slider
        .setLimits(25, 120, 5)
        .setDynamicTooltip()
        .setValue(this.plugin.data.settings.recoveryPromptMinutes)
        .onChange(async (value) => {
          this.plugin.data.settings.recoveryPromptMinutes = value;
          await this.plugin.saveNow();
        }));

    new Setting(containerEl)
      .setName("Strong recovery nudge")
      .setDesc("Minutes of continuous active work before the recovery reminder becomes more visible.")
      .addSlider((slider) => slider
        .setLimits(45, 180, 5)
        .setDynamicTooltip()
        .setValue(this.plugin.data.settings.strongRecoveryNudgeMinutes)
        .onChange(async (value) => {
          this.plugin.data.settings.strongRecoveryNudgeMinutes = value;
          await this.plugin.saveNow();
        }));

    new Setting(containerEl)
      .setName("Random events")
      .setDesc("Optional. Off by default.")
      .addToggle((toggle) => toggle
        .setValue(this.plugin.data.settings.randomEventsEnabled)
        .onChange(async (value) => {
          this.plugin.data.settings.randomEventsEnabled = value;
          await this.plugin.saveNow();
        }));

    new Setting(containerEl)
      .setName("HUD mode")
      .addDropdown((dropdown) => dropdown
        .addOption("full", "Full")
        .addOption("compact", "Compact")
        .addOption("minimal", "Minimal")
        .setValue(this.plugin.data.settings.hudMode)
        .onChange(async (value) => {
          this.plugin.data.settings.hudMode = value as "full" | "compact" | "minimal";
          await this.plugin.saveNow();
          this.plugin.refreshUi();
        }));

    new Setting(containerEl)
      .setName("Skin")
      .setDesc("Skins only affect presentation; game logic stays separate.")
      .addDropdown((dropdown) => {
        SKINS.forEach((skin) => dropdown.addOption(skin.id, skin.name));
        dropdown.setValue(this.plugin.data.settings.skin);
        dropdown.onChange(async (value) => {
          this.plugin.data.settings.skin = value;
          await this.plugin.saveNow();
          this.plugin.applySkin();
        });
      });
  }
}

function label(value: string): string {
  return value.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join(" ");
}
