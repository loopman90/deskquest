import { App, PluginSettingTab, Setting, SettingDefinitionItem } from "obsidian";
import RegenPlugin from "../main";
import { SKINS } from "../skins/definitions";
import { DifficultyMode } from "../data/types";

export class RegenSettingTab extends PluginSettingTab {
  constructor(app: App, private readonly plugin: RegenPlugin) {
    super(app, plugin);
  }

  getSettingDefinitions(): SettingDefinitionItem[] {
    return [
      {
        name: "General",
        desc: "Configure the HUD, reminders, routines, appearance and local tracking.",
        render: (setting) => {
          this.renderSettings(setting.settingEl);
        }
      }
    ];
  }

  private renderSettings(containerEl: HTMLElement): void {
    containerEl.empty();
    containerEl.addClass("regen-settings");

    new Setting(containerEl).setName("General").setHeading();
    containerEl.createEl("p", {
      text: "All values are local game indicators. Regen never blocks work and does not provide medical advice.",
      cls: "setting-item-description"
    });

    new Setting(containerEl)
      .setName("Enable Regen")
      .setDesc("Turns the HUD, commands and local tracking on or off.")
      .addToggle((toggle) => toggle
        .setValue(this.plugin.data.settings.enabled)
        .onChange((value) => {
          this.plugin.data.settings.enabled = value;
          void this.plugin.saveNow();
        }));

    new Setting(containerEl)
      .setName("Track activity outside Obsidian")
      .setDesc("Default off. Regen will never read content from other apps; unsupported platforms fall back to Obsidian activity.")
      .addToggle((toggle) => toggle
        .setValue(this.plugin.data.settings.trackOutsideObsidian)
        .onChange((value) => {
          this.plugin.data.settings.trackOutsideObsidian = value;
          void this.plugin.saveNow();
        }));

    new Setting(containerEl)
      .setName("Difficulty")
      .setDesc("Balanced is recommended. Hardcore changes game pacing only and makes no health claims.")
      .addDropdown((dropdown) => {
        ["relaxed", "balanced", "pomodoro", "deep-work", "hardcore", "custom"].forEach((mode) => {
          dropdown.addOption(mode, label(mode));
        });
        dropdown.setValue(this.plugin.data.settings.difficulty);
        dropdown.onChange((value) => {
          this.plugin.data.settings.difficulty = value as DifficultyMode;
          void this.plugin.saveNow();
        });
      });

    new Setting(containerEl)
      .setName("Idle timeout")
      .setDesc("After this many minutes without Obsidian activity, active work and stamina drain pause.")
      .addSlider((slider) => slider
        .setLimits(1, 20, 1)
        .setValue(this.plugin.data.settings.idleTimeoutMinutes)
        .onChange((value) => {
          this.plugin.data.settings.idleTimeoutMinutes = value;
          void this.plugin.saveNow();
        }));

    new Setting(containerEl)
      .setName("Hydration reminders")
      .addToggle((toggle) => toggle
        .setValue(this.plugin.data.settings.hydrationEnabled)
        .onChange((value) => {
          this.plugin.data.settings.hydrationEnabled = value;
          void this.plugin.saveNow();
        }));

    new Setting(containerEl)
      .setName("All reminders")
      .setDesc("Turns Regen reminder generation on or off. Manual commands keep working.")
      .addToggle((toggle) => toggle
        .setValue(this.plugin.data.settings.remindersEnabled)
        .onChange((value) => {
          this.plugin.data.settings.remindersEnabled = value;
          void this.plugin.saveNow();
        }));

    new Setting(containerEl)
      .setName("Hydration interval")
      .setDesc("Recommended default: 75 minutes plus a small random offset.")
      .addSlider((slider) => slider
        .setLimits(30, 120, 5)
        .setValue(this.plugin.data.settings.hydrationIntervalMinutes)
        .onChange((value) => {
          this.plugin.data.settings.hydrationIntervalMinutes = value;
          void this.plugin.saveNow();
        }));

    new Setting(containerEl)
      .setName("Track caffeine separately")
      .setDesc("Logbook only. No medical judgement is made.")
      .addToggle((toggle) => toggle
        .setValue(this.plugin.data.settings.caffeineMode)
        .onChange((value) => {
          this.plugin.data.settings.caffeineMode = value;
          void this.plugin.saveNow();
        }));

    new Setting(containerEl)
      .setName("Movement quests")
      .addToggle((toggle) => toggle
        .setValue(this.plugin.data.settings.movementEnabled)
        .onChange((value) => {
          this.plugin.data.settings.movementEnabled = value;
          void this.plugin.saveNow();
        }));

    new Setting(containerEl)
      .setName("Movement quest interval")
      .addSlider((slider) => slider
        .setLimits(20, 120, 5)
        .setValue(this.plugin.data.settings.movementQuestIntervalMinutes)
        .onChange((value) => {
          this.plugin.data.settings.movementQuestIntervalMinutes = value;
          void this.plugin.saveNow();
        }));

    new Setting(containerEl)
      .setName("Eye breaks")
      .addToggle((toggle) => toggle
        .setValue(this.plugin.data.settings.eyeBreaksEnabled)
        .onChange((value) => {
          this.plugin.data.settings.eyeBreaksEnabled = value;
          void this.plugin.saveNow();
        }));

    new Setting(containerEl)
      .setName("Eye break interval")
      .addSlider((slider) => slider
        .setLimits(10, 60, 5)
        .setValue(this.plugin.data.settings.eyeBreakIntervalMinutes)
        .onChange((value) => {
          this.plugin.data.settings.eyeBreakIntervalMinutes = value;
          void this.plugin.saveNow();
        }));

    new Setting(containerEl)
      .setName("Recovery prompt")
      .setDesc("Minutes of continuous active work before Regen suggests recovery.")
      .addSlider((slider) => slider
        .setLimits(25, 120, 5)
        .setValue(this.plugin.data.settings.recoveryPromptMinutes)
        .onChange((value) => {
          this.plugin.data.settings.recoveryPromptMinutes = value;
          void this.plugin.saveNow();
        }));

    new Setting(containerEl)
      .setName("Strong recovery nudge")
      .setDesc("Minutes of continuous active work before the recovery reminder becomes more visible.")
      .addSlider((slider) => slider
        .setLimits(45, 180, 5)
        .setValue(this.plugin.data.settings.strongRecoveryNudgeMinutes)
        .onChange((value) => {
          this.plugin.data.settings.strongRecoveryNudgeMinutes = value;
          void this.plugin.saveNow();
        }));

    new Setting(containerEl)
      .setName("Random events")
      .setDesc("Optional. Off by default.")
      .addToggle((toggle) => toggle
        .setValue(this.plugin.data.settings.randomEventsEnabled)
        .onChange((value) => {
          this.plugin.data.settings.randomEventsEnabled = value;
          void this.plugin.saveNow();
        }));

    new Setting(containerEl)
      .setName("HUD mode")
      .addDropdown((dropdown) => dropdown
        .addOption("full", "Full")
        .addOption("compact", "Compact")
        .addOption("minimal", "Minimal")
        .setValue(this.plugin.data.settings.hudMode)
        .onChange((value) => {
          this.plugin.data.settings.hudMode = value as "full" | "compact" | "minimal";
          void this.plugin.saveNow();
          this.plugin.refreshUi();
        }));

    new Setting(containerEl)
      .setName("Skin")
      .setDesc("Skins only affect presentation; game logic stays separate.")
      .addDropdown((dropdown) => {
        SKINS.forEach((skin) => {
          dropdown.addOption(skin.id, skin.name);
        });
        dropdown.setValue(this.plugin.data.settings.skin);
        dropdown.onChange((value) => {
          this.plugin.data.settings.skin = value;
          void this.plugin.saveNow();
          this.plugin.applySkin();
        });
      });
  }
}

function label(value: string): string {
  return value.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join(" ");
}
