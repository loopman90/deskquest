import { ButtonComponent, Modal, Notice } from "obsidian";
import RegenPlugin from "../main";
import { RegenData } from "../data/types";
import { createDefaultData, DEFAULT_SETTINGS } from "../data/defaults";

export class ImportModal extends Modal {
  constructor(private readonly plugin: RegenPlugin) {
    super(plugin.app);
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("regen-import-modal");
    contentEl.createEl("h2", { text: "Import Regen JSON" });
    contentEl.createEl("p", { text: "Paste a Regen JSON export. Import overwrites current Regen plugin data after validation." });
    const textarea = contentEl.createEl("textarea", { cls: "regen-import-box" });
    textarea.placeholder = "{ ... }";
    const actions = contentEl.createDiv({ cls: "regen-modal-actions" });
    new ButtonComponent(actions).setButtonText("Cancel").onClick(() => this.close());
    new ButtonComponent(actions).setButtonText("Import").setCta().onClick(async () => {
      try {
        const parsed = JSON.parse(textarea.value) as Partial<RegenData>;
        if (!parsed.settings || !parsed.bars || !parsed.xp) {
          new Notice("Import failed: this does not look like Regen data.");
          return;
        }
        const defaults = createDefaultData();
        const nextData: RegenData = {
          ...defaults,
          ...parsed,
          settings: {
            ...DEFAULT_SETTINGS,
            ...parsed.settings,
            mealWindows: {
              ...DEFAULT_SETTINGS.mealWindows,
              ...parsed.settings?.mealWindows
            },
            workdays: {
              ...DEFAULT_SETTINGS.workdays,
              ...parsed.settings?.workdays
            }
          },
          reminderHistory: parsed.reminderHistory ?? defaults.reminderHistory,
          lastQuestDate: parsed.lastQuestDate ?? defaults.lastQuestDate
        };
        await this.plugin.replaceData(nextData);
        new Notice("Regen import complete.");
        this.close();
      } catch (error) {
        console.error(error);
        new Notice("Import failed: invalid JSON.");
      }
    });
  }
}
